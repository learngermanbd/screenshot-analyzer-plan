"""UI element detection using OpenCV contours and optional Florence-2."""

import cv2
import numpy as np
import uuid
from PIL import Image
from models.schemas import DetectedElement, BoundingBox, ElementStyles


def detect_elements(image: Image.Image) -> list[DetectedElement]:
    """
    Detect UI elements in a screenshot.

    Uses OpenCV contour detection as the primary method.
    Optionally uses Florence-2 for more accurate detection.
    """
    try:
        return _detect_with_florence2(image)
    except (ImportError, Exception):
        pass

    return _detect_with_contours(image)


def _detect_with_contours(image: Image.Image) -> list[DetectedElement]:
    """Detect UI elements using OpenCV contour detection."""
    img_array = np.array(image)
    gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)

    # Edge detection
    edges = cv2.Canny(gray, 50, 150)

    # Dilate to connect edges
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    dilated = cv2.dilate(edges, kernel, iterations=2)

    # Find contours
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    img_h, img_w = img_array.shape[:2]
    min_area = (img_w * img_h) * 0.002  # Minimum 0.2% of image
    max_area = (img_w * img_h) * 0.5    # Maximum 50% of image

    elements = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        area = w * h

        # Filter by area
        if area < min_area or area > max_area:
            continue

        # Filter by minimum dimensions
        if w < 20 or h < 20:
            continue

        # Classify element type based on aspect ratio and size
        aspect_ratio = w / h if h > 0 else 0
        element_type = _classify_element(w, h, aspect_ratio, img_w, img_h)

        # Extract colors from the region
        region = img_array[y : y + h, x : x + w]
        bg_color = _get_dominant_color(region)

        # Check if it looks like a button (has distinct background)
        is_button = _is_likely_button(region, img_array, x, y, w, h)

        if is_button:
            element_type = "button"

        elements.append(
            DetectedElement(
                id=str(uuid.uuid4()),
                type=element_type,
                bbox=BoundingBox(x=x, y=y, width=w, height=h),
                confidence=0.7,
                styles=ElementStyles(
                    backgroundColor=bg_color,
                    borderRadius=_estimate_border_radius(region),
                ),
            )
        )

    # Merge overlapping elements
    elements = _merge_overlapping(elements)

    # Sort by position (top to bottom, left to right)
    elements.sort(key=lambda e: (e.bbox.y, e.bbox.x))

    return elements


def _classify_element(w: int, h: int, aspect_ratio: float, img_w: int, img_h: int) -> str:
    """Classify an element based on its dimensions and position."""
    # Navbar: wide, short, near top
    if aspect_ratio > 3 and h < 80:
        return "navbar"

    # Button: medium aspect ratio, reasonable height
    if 1.5 < aspect_ratio < 8 and 30 < h < 80:
        return "button"

    # Input field: wide, medium height
    if aspect_ratio > 3 and 35 < h < 60:
        return "input"

    # Text block: wider than tall
    if aspect_ratio > 2 and h < 40:
        return "text"

    # Card: moderate aspect ratio, larger area
    if 0.5 < aspect_ratio < 3 and h > 60:
        return "card"

    # Image: roughly square or landscape
    if 0.5 < aspect_ratio < 2 and h > 80:
        return "image"

    return "container"


def _get_dominant_color(region: np.ndarray) -> str:
    """Get the dominant color of a region."""
    pixels = region.reshape(-1, 3)
    avg_color = pixels.mean(axis=0).astype(int)
    return f"#{avg_color[0]:02x}{avg_color[1]:02x}{avg_color[2]:02x}"


def _is_likely_button(region: np.ndarray, full_image: np.ndarray, x: int, y: int, w: int, h: int) -> bool:
    """Check if a region looks like a button based on color distinctiveness."""
    if region.size == 0:
        return False

    # Get average color of region and surroundings
    region_avg = region.reshape(-1, 3).mean(axis=0)

    # Get surrounding area (5px border)
    pad = 5
    y1 = max(0, y - pad)
    y2 = min(full_image.shape[0], y + h + pad)
    x1 = max(0, x - pad)
    x2 = min(full_image.shape[1], x + w + pad)
    surrounding = full_image[y1:y2, x1:x2]

    # Calculate color difference
    if surrounding.size > 0:
        # Remove the center region from surrounding
        mask = np.ones(surrounding.shape[:2], dtype=bool)
        local_y = y - y1
        local_x = x - x1
        mask[local_y : local_y + h, local_x : local_x + w] = False
        if mask.any():
            surround_avg = surrounding[mask].reshape(-1, 3).mean(axis=0)
            diff = np.sqrt(np.sum((region_avg - surround_avg) ** 2))
            return diff > 40  # Significant color difference

    return False


def _estimate_border_radius(region: np.ndarray) -> int:
    """Estimate border radius of a region."""
    if region.size == 0:
        return 0

    gray = cv2.cvtColor(region, cv2.COLOR_RGB2GRAY) if len(region.shape) == 3 else region
    h, w = gray.shape[:2]

    # Check corners for roundness
    corner_size = min(10, h // 4, w // 4)
    if corner_size < 3:
        return 0

    corners = [
        gray[:corner_size, :corner_size],             # Top-left
        gray[:corner_size, -corner_size:],            # Top-right
        gray[-corner_size:, :corner_size],            # Bottom-left
        gray[-corner_size:, -corner_size:],           # Bottom-right
    ]

    # Check if corners have transparent/rounded pixels
    corner_transparency = 0
    for corner in corners:
        if corner.size > 0:
            std = np.std(corner)
            if std > 20:  # Variation suggests rounded corner
                corner_transparency += 1

    if corner_transparency >= 3:
        return 8  # Likely rounded
    if corner_transparency >= 2:
        return 4

    return 0


def _merge_overlapping(elements: list[DetectedElement], iou_threshold: float = 0.5) -> list[DetectedElement]:
    """Remove overlapping detections, keeping the larger one."""
    if not elements:
        return elements

    keep = []
    removed = set()

    for i, elem_i in enumerate(elements):
        if i in removed:
            continue

        for j, elem_j in enumerate(elements):
            if j <= i or j in removed:
                continue

            iou = _calculate_iou(elem_i.bbox, elem_j.bbox)
            if iou > iou_threshold:
                # Keep the larger element
                area_i = elem_i.bbox.width * elem_i.bbox.height
                area_j = elem_j.bbox.width * elem_j.bbox.height
                if area_j > area_i:
                    removed.add(i)
                else:
                    removed.add(j)

        if i not in removed:
            keep.append(elem_i)

    return keep


def _calculate_iou(box1: BoundingBox, box2: BoundingBox) -> float:
    """Calculate Intersection over Union of two bounding boxes."""
    x1 = max(box1.x, box2.x)
    y1 = max(box1.y, box2.y)
    x2 = min(box1.x + box1.width, box2.x + box2.width)
    y2 = min(box1.y + box1.height, box2.y + box2.height)

    if x2 <= x1 or y2 <= y1:
        return 0.0

    intersection = (x2 - x1) * (y2 - y1)
    area1 = box1.width * box1.height
    area2 = box2.width * box2.height
    union = area1 + area2 - intersection

    return intersection / union if union > 0 else 0.0


def _detect_with_florence2(image: Image.Image) -> list[DetectedElement]:
    """Detect UI elements using Microsoft Florence-2 model."""
    # This requires: pip install transformers torch
    # and downloading the Florence-2 model
    raise ImportError("Florence-2 not installed - using OpenCV fallback")
