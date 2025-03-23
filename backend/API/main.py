import boto3
import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

class SynthesizeRequest(BaseModel):
    text: str
    voice: str
    language: str
    voiceType: str

class SynthesizeRequestCheck(BaseModel):
    taskId: str

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

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

aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
region_name = os.getenv('AWS_REGION')
output_s3_bucket_name = os.getenv('OUTPUT_S3_BUCKET_NAME')
output_s3_key_prefix = os.getenv('OUTPUT_S3_KEY_PREFIX')

if not all([aws_access_key_id, aws_secret_access_key, region_name, output_s3_bucket_name, output_s3_key_prefix]):
    raise HTTPException(status_code=500, detail="Missing environment variables")

polly_client = boto3.Session(
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
    region_name=region_name).client('polly')

s3_client = boto3.client('s3', 
                         aws_access_key_id=aws_access_key_id, 
                         aws_secret_access_key=aws_secret_access_key, 
                         region_name=region_name)

@app.post("/synthesize")
def synthesize_text(synthesize_request: SynthesizeRequest):
    engine = synthesize_request.voiceType.lower()

    response = polly_client.start_speech_synthesis_task(
        VoiceId=synthesize_request.voice,
        OutputS3BucketName=output_s3_bucket_name,
        OutputS3KeyPrefix=output_s3_key_prefix,
        OutputFormat='mp3', 
        Text=synthesize_request.text,
        LanguageCode=synthesize_request.language,
        Engine=engine
    )

    taskId = response['SynthesisTask']['TaskId']
    return {"taskId": taskId}

@app.post("/check_status")
def check_status(synthesize_request_check: SynthesizeRequestCheck):
    logging.info(f"Received taskId: {synthesize_request_check.taskId}")
    try:
        task_status = polly_client.get_speech_synthesis_task(TaskId=synthesize_request_check.taskId)
        if task_status['SynthesisTask']['TaskStatus'] == 'completed':
            output_uri = task_status['SynthesisTask']['OutputUri']
            bucket_name = output_uri.split('/')[3]
            key = '/'.join(output_uri.split('/')[4:])
            pre_signed_url = s3_client.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': key}, ExpiresIn=3600)
            task_status['SynthesisTask']['PreSignedUrl'] = pre_signed_url
        logging.info(f"Task status: {task_status}")
        return {"task_status": task_status}
    except polly_client.exceptions.SynthesisTaskNotFoundException:
        logging.error("Synthesis task not found")
        raise HTTPException(status_code=404, detail="Synthesis task not found")
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
