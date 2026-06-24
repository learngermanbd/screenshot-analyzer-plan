"""Color extraction using K-Means clustering."""

import numpy as np
from PIL import Image
from models.schemas import ColorInfo


def extract_colors(image: Image.Image, n_colors: int = 6) -> list[ColorInfo]:
    """
    Extract dominant colors from an image using K-Means clustering.

    Args:
        image: PIL Image
        n_colors: Number of dominant colors to extract

    Returns:
        List of ColorInfo with hex, rgb, hsl values and percentages
    """
    # Resize for faster processing
    img = image.copy()
    img.thumbnail((200, 200))
    pixels = np.array(img).reshape(-1, 3).astype(np.float64)

    try:
        from sklearn.cluster import KMeans

        kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
        kmeans.fit(pixels)
        centers = kmeans.cluster_centers_
        labels = kmeans.labels_
    except ImportError:
        # Fallback: simple color sampling
        centers, labels = _simple_clustering(pixels, n_colors)

    # Count labels for percentage
    unique, counts = np.unique(labels, return_counts=True)
    total_pixels = len(labels)

    colors = []
    for i, center in enumerate(centers):
        r, g, b = int(center[0]), int(center[1]), int(center[2])
        count = counts[list(unique).index(i)] if i in unique else 0
        percentage = (count / total_pixels) * 100

        hex_color = f"#{r:02x}{g:02x}{b:02x}"
        rgb_str = f"rgb({r}, {g}, {b})"
        hsl_str = _rgb_to_hsl(r, g, b)

        colors.append(
            ColorInfo(
                hex=hex_color,
                rgb=rgb_str,
                hsl=hsl_str,
                percentage=round(percentage, 1),
            )
        )

    # Sort by percentage (most dominant first)
    colors.sort(key=lambda c: c.percentage, reverse=True)

    return colors


def _simple_clustering(pixels: np.ndarray, n_clusters: int):
    """Simple fallback clustering without sklearn."""
    # Random sampling approach
    indices = np.random.choice(len(pixels), min(n_clusters, len(pixels)), replace=False)
    centers = pixels[indices]

    # Assign each pixel to nearest center
    labels = np.zeros(len(pixels), dtype=int)
    for i, pixel in enumerate(pixels):
        distances = np.sqrt(np.sum((centers - pixel) ** 2, axis=1))
        labels[i] = np.argmin(distances)

    # Recompute centers
    for j in range(n_clusters):
        mask = labels == j
        if mask.any():
            centers[j] = pixels[mask].mean(axis=0)

    return centers, labels


def _rgb_to_hsl(r: int, g: int, b: int) -> str:
    """Convert RGB to HSL string."""
    r_norm, g_norm, b_norm = r / 255.0, g / 255.0, b / 255.0
    max_val = max(r_norm, g_norm, b_norm)
    min_val = min(r_norm, g_norm, b_norm)
    l = (max_val + min_val) / 2

    if max_val == min_val:
        h = s = 0
    else:
        d = max_val - min_val
        s = d / (2 - max_val - min_val) if l > 0.5 else d / (max_val + min_val)
        if max_val == r_norm:
            h = ((g_norm - b_norm) / d + (6 if g_norm < b_norm else 0)) / 6
        elif max_val == g_norm:
            h = ((b_norm - r_norm) / d + 2) / 6
        else:
            h = ((r_norm - g_norm) / d + 4) / 6

    return f"hsl({int(h * 360)}, {int(s * 100)}%, {int(l * 100)}%)"
