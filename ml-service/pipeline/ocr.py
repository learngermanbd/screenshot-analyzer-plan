"""Text extraction using PaddleOCR (with fallback to EasyOCR/Tesseract)."""

import numpy as np
from PIL import Image
from models.schemas import TextRegion, BoundingBox


def extract_text(image: Image.Image) -> list[TextRegion]:
    """
    Extract text regions from an image using OCR.

    Tries PaddleOCR first, falls back to simple heuristic detection.
    """
    try:
        return _extract_with_paddleocr(image)
    except ImportError:
        pass

    try:
        return _extract_with_easyocr(image)
    except ImportError:
        pass

    # Fallback: return empty list (ML service will still work with other stages)
    return []


def _extract_with_paddleocr(image: Image.Image) -> list[TextRegion]:
    """Extract text using PaddleOCR."""
    from paddleocr import PaddleOCR

    ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
    img_array = np.array(image)
    results = ocr.ocr(img_array, cls=True)

    texts = []
    if results and results[0]:
        for line in results[0]:
            box_points = line[0]
            text = line[1][0]
            confidence = float(line[1][1])

            # Convert polygon points to bounding box
            xs = [p[0] for p in box_points]
            ys = [p[1] for p in box_points]
            x_min, x_max = min(xs), max(xs)
            y_min, y_max = min(ys), max(ys)

            # Estimate font size from height
            height = y_max - y_min
            font_size = max(10, int(height * 0.7))

            texts.append(
                TextRegion(
                    text=text,
                    bbox=BoundingBox(x=x_min, y=y_min, width=x_max - x_min, height=y_max - y_min),
                    fontSize=font_size,
                    confidence=confidence,
                )
            )

    return texts


def _extract_with_easyocr(image: Image.Image) -> list[TextRegion]:
    """Extract text using EasyOCR."""
    import easyocr

    reader = easyocr.Reader(["en"], gpu=False)
    img_array = np.array(image)
    results = reader.readtext(img_array)

    texts = []
    for (box, text, confidence) in results:
        xs = [p[0] for p in box]
        ys = [p[1] for p in box]
        x_min, x_max = min(xs), max(xs)
        y_min, y_max = min(ys), max(ys)
        height = y_max - y_min

        texts.append(
            TextRegion(
                text=text,
                bbox=BoundingBox(x=x_min, y=y_min, width=x_max - x_min, height=y_max - y_min),
                fontSize=max(10, int(height * 0.7)),
                confidence=float(confidence),
            )
        )

    return texts
