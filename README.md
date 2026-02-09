# 📄 DocuLens - AI Image to Word Converter

**DocuLens** is a premium, AI-powered document digitization tool that instantly transforms physical document photos into fully editable Microsoft Word (`.docx`) files.

Built with a focus on accuracy and aesthetics, it leverages **Google Cloud Vision** for state-of-the-art OCR and **Anthropic's Claude 3.5 Sonnet** to intelligently reconstruct document structure, tables, and formatting.

![DocuLens UI](https://placehold.co/1200x600/0f172a/6366f1?text=DocuLens+Preview)

## ✨ Key Features

- **📸 Advanced OCR**: Uses Google Cloud Vision API to detect text with varying fonts, handwriting, and layouts.
- **🧠 Intelligent Structuring**: Claude 3.5 analyzes the raw text to reconstruct headers, lists, tables, and paragraphs.
- **🎨 Premium UI**: A modern, glassmorphic interface built with React and Tailwind CSS.
  - **Dark Mode by Default**: Sleek Slate-900 theme with indigo/purple gradients.
  - **Drag & Drop**: Intuitive file upload.
- **⚡ Local & Cloud Ready**: Fully Dockerized for easy local development and seamless deployment to platforms like Render.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS (CDN), Lucide Icons
- **Backend**: Python 3.10+, FastAPI
- **AI Services**:
  - Google Cloud Vision API (OCR)
  - Anthropic Claude 3.5 Sonnet (Structure Recovery)
- **Infrastructure**: Docker, Docker Compose

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** & **Node.js 18+**
- **Google Cloud Service Account** JSON key (for Vision API)
- **Anthropic API Key** (for Claude)
- **Docker** (optional, recommended)

### 🐳 Docker Setup (Recommended)

**1. Clone & Configure**

```bash
git clone https://github.com/yourusername/doculens.git
cd doculens
cp backend/.env.example backend/.env
```

**2. Setup Credentials**

- Paste your `ANTHROPIC_API_KEY` into `backend/.env`.
- Place your Google Cloud Service Account JSON file in `backend/` (e.g., `backend/service-account.json`).
- Update `backend/.env`:
  ```bash
  GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json
  ```

**3. Run with Docker Compose**

```bash
# Development (Hot-Reload)
docker-compose -f docker-compose.dev.yml up --build

# Production (Static Build)
docker-compose up --build
```

Access the app at `http://localhost:5174`.

### 🔧 Manual Setup

<details>
<summary>Click to expand manual setup instructions</summary>

#### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys
uvicorn main:app --reload --port 8001
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

</details>

## ☁️ Deployment

This project is configured for easy deployment on **Render**.

1. **Create a New Web Service** on Render pointing to this repo.
2. **Environment Variables**: Add `ANTHROPIC_API_KEY`.
3. **Secret Files**: Upload your Google Service Account JSON as a "Secret File" to `/etc/secrets/google-credentials.json`.
4. **Build Command**: `npm install && npm run build` (if deploying frontend static site).

## 🤝 Support

If you find this tool helpful, consider supporting the development!

<a href="https://buymeacoffee.com/puvaanraaj" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
</a>
