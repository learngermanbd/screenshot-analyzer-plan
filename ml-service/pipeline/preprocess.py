"""Image preprocessing pipeline using OpenCV and PIL."""

import cv2
import numpy as np
from PIL import Image
from models.schemas import ImageMetadata


def preprocess_image(image: Image.Image) -> tuple[Image.Image, ImageMetadata]:
    """
    Preprocess a screenshot for analysis.

    Steps:
    1. Detect device type from aspect ratio
    2. Resize to standard width if needed
    3. Enhance contrast using CLAHE
    4. Denoise if necessary

    Returns:
        Tuple of (processed image, metadata)
    """
    width, height = image.size
    aspect_ratio = height / width

    # Detect device type from aspect ratio
    metadata = ImageMetadata(screenWidth=width, screenHeight=height)

    if 1.9 < aspect_ratio < 2.3:
        metadata.deviceType = "iphone"
        metadata.platform = "ios"
    elif 1.8 < aspect_ratio < 2.2:
        metadata.deviceType = "android"
        metadata.platform = "android"
    elif aspect_ratio < 1.5:
        metadata.deviceType = "tablet"
        metadata.platform = "android"
    else:
        metadata.deviceType = "phone"
        metadata.platform = "android"

    # Convert PIL to OpenCV format
    img_array = np.array(image)
    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

    # Resize to standard width if too large
    target_width = 390
    if width > target_width * 2:
        scale = (target_width * 2) / width
        new_width = int(width * scale)
        new_height = int(height * scale)
        img_bgr = cv2.resize(img_bgr, (new_width, new_height), interpolation=cv2.INTER_AREA)

    # Convert to LAB color space for CLAHE
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l_channel)

    # Merge back
    enhanced_lab = cv2.merge([l_enhanced, a_channel, b_channel])
    enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

    # Convert back to PIL
    enhanced_rgb = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)
    processed = Image.fromarray(enhanced_rgb)

    return processed, metadata
