# Image to Docx Application Setup

## Prerequisites

- Python 3.10+
- Node.js 18+
- Google Cloud Service Account JSON key (for Vision API)
- Anthropic API Key (for Claude)
- Docker & Docker Compose (optional)

## Manual Setup

### Backend

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment and install dependencies:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   Create a `.env` file in the `backend` directory (copy from `.env.example`):

   ```bash
   cp .env.example .env
   ```

   **Important:**
   - Set `ANTHROPIC_API_KEY` to your Claude API key.
   - Set `GOOGLE_APPLICATION_CREDENTIALS` to the absolute path of your Google Cloud service account JSON file.

4. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be running at `http://localhost:8000`.

### Frontend

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be running at `http://localhost:5173`.

## Docker Setup

### Production (Static Build)

Builds the frontend and serves via Nginx.

```bash
docker-compose up --build
```

Access at `http://localhost:5173`.

### Development (Hot-Reload)

Runs frontend in dev mode and watches backend for changes.

```bash
docker-compose -f docker-compose.dev.yml up --build
```

**Note on Credentials in Docker:**
If your `GOOGLE_APPLICATION_CREDENTIALS` points to a file, ensure that file is accessible to the container. The `docker-compose.yml` mounts the `./backend` directory to `/app`.
**We recommend placing your `service-account.json` inside the `backend/` folder** and updating your `.env` to point to `/app/service-account.json` (for Docker) or the relative path (for local dev).

## Usage

1. Open http://localhost:5173 in your browser.
2. Drag and drop an image of a document (or click to upload).
3. Click "Convert to Word".
4. Wait for the process to complete and download the `.docx` file.
