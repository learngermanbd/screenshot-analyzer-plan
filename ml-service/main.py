"""
Screenshot Analyzer ML Service
FastAPI backend for image analysis pipeline.
"""

import io
import uuid
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from pipeline.preprocess import preprocess_image
from pipeline.ocr import extract_text
from pipeline.colors import extract_colors
from pipeline.detect import detect_elements
from pipeline.analyze import semantic_analysis
from models.schemas import AnalysisResult, HealthResponse

app = FastAPI(
    title="Screenshot Analyzer ML Service",
    description="AI-powered mobile screenshot analysis pipeline",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        version="0.1.0",
        services={
            "opencv": True,
            "paddleocr": True,
            "florence2": False,  # Requires GPU/model download
            "gemini": True,
        },
    )


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_screenshot(file: UploadFile = File(...)):
    """
    Analyze a mobile app screenshot.

    Pipeline:
    1. Preprocess image (resize, enhance)
    2. Extract text with OCR
    3. Extract dominant colors
    4. Detect UI elements
    5. Semantic analysis via Gemini
    6. Merge and return results
    """
    # Validate file
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # Read image
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")

        image = Image.open(io.BytesIO(contents)).convert("RGB")
        analysis_id = str(uuid.uuid4())

        # Stage 1: Preprocess
        processed_image, metadata = preprocess_image(image)

        # Stage 2: OCR
        texts = extract_text(processed_image)

        # Stage 3: Color extraction
        colors = extract_colors(processed_image)

        # Stage 4: Element detection
        elements = detect_elements(processed_image)

        # Stage 5: Semantic analysis (optional - requires Gemini API key)
        try:
            elements = await semantic_analysis(processed_image, elements, texts)
        except Exception:
            pass  # Continue without semantic analysis if it fails

        return AnalysisResult(
            id=analysis_id,
            imageUrl="",  # Will be set by the Next.js API route
            imageWidth=image.width,
            imageHeight=image.height,
            elements=elements,
            colors=colors,
            texts=texts,
            metadata=metadata,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
