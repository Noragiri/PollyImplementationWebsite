import boto3
import os
import logging
import time
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Security
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from fastapi_utils.tasks import repeat_every
import requests


class SynthesizeRequest(BaseModel):
    text: str
    voice: str
    language: str
    voiceType: str


class SynthesizeRequestCheck(BaseModel):
    taskId: str


app = FastAPI()

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load environment variables from .env file
load_dotenv()

aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
region_name = os.getenv("AWS_REGION")
output_s3_bucket_name = os.getenv("OUTPUT_S3_BUCKET_NAME")
output_s3_key_prefix = os.getenv("OUTPUT_S3_KEY_PREFIX")
dynamodb_table_name = os.getenv("DYNAMODB_TABLE_NAME")

if not all(
    [
        aws_access_key_id,
        aws_secret_access_key,
        region_name,
        output_s3_bucket_name,
        output_s3_key_prefix,
        dynamodb_table_name,
    ]
):
    raise HTTPException(status_code=500, detail="Missing environment variables")

polly_client = boto3.Session(
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
    region_name=region_name,
).client("polly")

s3_client = boto3.client(
    "s3",
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
    region_name=region_name,
)

dynamodb = boto3.resource(
    "dynamodb",
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
    region_name=region_name,
)
table = dynamodb.Table(dynamodb_table_name)

security = HTTPBearer()


def get_cognito_public_keys():
    # Get Cognito region and user pool ID from environment variables
    region = os.getenv("AWS_REGION")
    user_pool_id = os.getenv("COGNITO_USER_POOL_ID")

    if not region or not user_pool_id:
        raise HTTPException(
            status_code=500,
            detail="Cognito region or user pool ID is not set in environment variables",
        )

    url = f"https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()["keys"]
    else:
        raise HTTPException(status_code=500, detail="Unable to fetch public keys")


def get_authenticated_user(
    token: HTTPAuthorizationCredentials = Security(security),
) -> str:
    try:
        token_str = token.credentials
        logging.info(f"Token received: {token_str}")

        # Fetch Cognito public keys
        public_keys = get_cognito_public_keys()

        # Decode the token using the public keys
        payload = jwt.decode(
            token_str,
            public_keys,
            algorithms=["RS256"],
            audience=os.getenv(
                "NEXT_PUBLIC_COGNITO_CLIENT_ID"
            ),  # Use the correct App Client ID
            issuer=f"https://cognito-idp.{os.getenv('AWS_REGION')}.amazonaws.com/{os.getenv('COGNITO_USER_POOL_ID')}",
        )
        logging.info(f"Decoded payload: {payload}")

        username = payload.get("cognito:username")
        if not username:
            raise HTTPException(
                status_code=401, detail="Invalid token: Missing username"
            )
        return username
    except JWTError as e:
        logging.error(f"JWT decoding error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")


@app.post("/synthesize")
def synthesize_text(
    synthesize_request: SynthesizeRequest,
    username: str = Depends(get_authenticated_user),
):
    engine = synthesize_request.voiceType.lower()

    response = polly_client.start_speech_synthesis_task(
        VoiceId=synthesize_request.voice,
        OutputS3BucketName=output_s3_bucket_name,
        OutputS3KeyPrefix=output_s3_key_prefix,
        OutputFormat="mp3",
        Text=synthesize_request.text,
        LanguageCode=synthesize_request.language,
        Engine=engine,
    )

    taskId = response["SynthesisTask"]["TaskId"]

    # Log the data being inserted
    logging.info(f"Inserting item into DynamoDB: taskId={taskId}, username={username}")

    # Save request to DynamoDB with the user's identity
    table.put_item(
        Item={
            "taskId": taskId,
            "username": username,
            "text": synthesize_request.text,
            "voice": synthesize_request.voice,
            "language": synthesize_request.language,
            "voiceType": synthesize_request.voiceType,
            "status": "inProgress",
            "createdAt": int(time.time()),
        }
    )

    return {"taskId": taskId}


@app.post("/check_status")
def check_status(synthesize_request_check: SynthesizeRequestCheck):
    logging.info(f"Received taskId: {synthesize_request_check.taskId}")
    try:
        task_status = polly_client.get_speech_synthesis_task(
            TaskId=synthesize_request_check.taskId
        )
        if task_status["SynthesisTask"]["TaskStatus"] == "completed":
            output_uri = task_status["SynthesisTask"]["OutputUri"]
            bucket_name = output_uri.split("/")[3]
            key = "/".join(output_uri.split("/")[4:])
            pre_signed_url = s3_client.generate_presigned_url(
                "get_object", Params={"Bucket": bucket_name, "Key": key}, ExpiresIn=3600
            )
            task_status["SynthesisTask"]["PreSignedUrl"] = pre_signed_url
        logging.info(f"Task status: {task_status}")
        return {"task_status": task_status}
    except polly_client.exceptions.SynthesisTaskNotFoundException:
        logging.error("Synthesis task not found")
        raise HTTPException(status_code=404, detail="Synthesis task not found")
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history")
def get_history(user: str = Depends(get_authenticated_user)):
    try:
        # Fetch history from DynamoDB or your database
        response = table.scan()  # Replace with your query logic
        history = [
            {
                "taskId": item["taskId"],
                "status": item["status"],
                "text": item["text"],  # Ensure the text is included
                "preSignedUrl": item.get("preSignedUrl", None),
            }
            for item in response.get("Items", [])
        ]
        return {"history": history}
    except Exception as e:
        logging.error(f"Error fetching history: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching history")


@app.delete("/history/{task_id}")
def delete_history_item(task_id: str, user: str = Depends(get_authenticated_user)):
    try:
        # Fetch the item from DynamoDB to get the S3 file key
        response = table.get_item(Key={"taskId": task_id})
        item = response.get("Item")

        if not item:
            raise HTTPException(status_code=404, detail="History item not found")

        # Extract the S3 file key from the preSignedUrl
        pre_signed_url = item.get("preSignedUrl")
        if pre_signed_url:
            # Parse the bucket and key from the preSignedUrl
            bucket_name = pre_signed_url.split("/")[3]
            key = "/".join(
                pre_signed_url.split("/")[4:].split("?")[0]
            )  # Remove query params

            # Delete the file from S3
            s3_client.delete_object(Bucket=bucket_name, Key=key)
            logging.info(f"Deleted S3 file: Bucket={bucket_name}, Key={key}")

        # Delete the item from DynamoDB
        table.delete_item(Key={"taskId": task_id})
        logging.info(f"Deleted DynamoDB item: taskId={task_id}")

        return {"message": "Item and related S3 file deleted successfully"}
    except Exception as e:
        logging.error(f"Error deleting history item: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting history item")


@app.on_event("startup")
@repeat_every(seconds=1)  # Run every 1 second
def check_incomplete_tasks():
    try:
        # Query DynamoDB for tasks with status not "completed"
        response = table.scan(
            FilterExpression="#status <> :completed",
            ExpressionAttributeNames={
                "#status": "status"
            },  # Alias for the reserved keyword
            ExpressionAttributeValues={":completed": "completed"},
        )
        items = response.get("Items", [])

        for item in items:
            taskId = item["taskId"]
            username = item["username"]
            try:
                task_status = polly_client.get_speech_synthesis_task(TaskId=taskId)
                if task_status["SynthesisTask"]["TaskStatus"] == "completed":
                    output_uri = task_status["SynthesisTask"]["OutputUri"]
                    bucket_name = output_uri.split("/")[3]
                    key = "/".join(output_uri.split("/")[4:])
                    pre_signed_url = s3_client.generate_presigned_url(
                        "get_object",
                        Params={"Bucket": bucket_name, "Key": key},
                        ExpiresIn=3600,
                    )

                    # Update task status in DynamoDB
                    table.update_item(
                        Key={"taskId": taskId},
                        UpdateExpression="SET #status = :completed, preSignedUrl = :url",
                        ExpressionAttributeNames={"#status": "status"},
                        ExpressionAttributeValues={
                            ":completed": "completed",
                            ":url": pre_signed_url,
                        },
                    )
            except polly_client.exceptions.SynthesisTaskNotFoundException:
                logging.error(f"Task {taskId} not found")
                table.update_item(
                    Key={"taskId": taskId},
                    UpdateExpression="SET #status = :failed",
                    ExpressionAttributeNames={"#status": "status"},
                    ExpressionAttributeValues={":failed": "failed"},
                )
            except Exception as e:
                logging.error(f"Error checking task {taskId}: {str(e)}")
    except Exception as e:
        logging.error(f"Error scanning DynamoDB: {str(e)})")
