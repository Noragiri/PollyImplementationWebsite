# Polly Implementation Website

This project is a web application that allows users to convert text to speech using Amazon Polly. The application is built with [Next.js](https://nextjs.org) for the frontend and [FastAPI](https://fastapi.tiangolo.com) for the backend. The frontend is bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), and the backend uses Amazon Polly to synthesize speech from text.

## Setting Up Development Environment

### Prerequisites

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (version 14.x or later)
- [npm](https://www.npmjs.com/) (version 6.x or later) or [yarn](https://yarnpkg.com/) (version 1.x or later)
- [Python](https://www.python.org/) (version 3.7 or later)
- [pip](https://pip.pypa.io/en/stable/) (version 20.x or later)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/PollyImplementationWebsite.git
cd PollyImplementationWebsite
```

2. Install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up the environment variables:

Create a `.env` file in the root directory of the project and add the following environment variables:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region
OUTPUT_S3_BUCKET_NAME=your_output_s3_bucket_name
OUTPUT_S3_KEY_PREFIX=your_output_s3_key_prefix
```

### Running the Development Server

1. Start the Next.js development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

2. Start the FastAPI backend server:

Navigate to the `backend/API` directory and run the following command:

```bash
uvicorn main:app --reload
```

### Additional Information

- The Next.js application will be available at [http://localhost:3000](http://localhost:3000).
- The FastAPI backend server will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

### Useful Commands

- To build the project for production:

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

- To start the production server:

```bash
npm start
# or
yarn start
# or
pnpm start
# or
bun start
```