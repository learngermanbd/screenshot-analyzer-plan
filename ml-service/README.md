---
title: Screenshot Analyzer ML
emoji: 📸
colorFrom: indigo
colorTo: purple
sdk: docker
pinned: false
---

# 📸 Screenshot Analyzer ML Service

FastAPI backend for AI-powered mobile screenshot analysis.

## What it does

1. **Preprocess** — Enhances contrast using CLAHE, detects device type from aspect ratio
2. **OCR** — Extracts text regions with EasyOCR
3. **Colors** — Extracts dominant colors via K-Means clustering
4. **Detect** — Finds UI elements (buttons, inputs, cards, etc.) with OpenCV contours
5. **Analyze** — Optional Gemini-powered semantic classification for better accuracy

## API Endpoints

### `GET /health`
Returns service status and available features.

### `POST /analyze`
Upload a screenshot (PNG/JPG/WebP) and get detected elements, colors, and text.

```bash
curl -X POST https://YOUR_SPACE.hf.space/analyze \
  -F "file=@screenshot.png"
```

## Environment Variables

Set in HF Space → Settings → Repository Secrets:

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | (Optional) Google Gemini API key for semantic analysis. Without it, the pipeline skips Stage 5. |

## Local Development

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
