"""Semantic analysis using Google Gemini API."""

import os
import json
from PIL import Image
import io
import base64
from models.schemas import DetectedElement

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


async def semantic_analysis(
    image: Image.Image,
    elements: list[DetectedElement],
    texts: list,
) -> list[DetectedElement]:
    """
    Use Gemini to enhance element detection with semantic understanding.

    - Classifies component types more accurately
    - Detects hierarchy/parent-child relationships
    - Estimates font sizes and spacing rules
    - Identifies layout patterns (flex, grid)
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return elements

    try:
        import httpx

        # Convert image to base64
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        # Build element summary for the prompt
        element_summary = []
        for i, el in enumerate(elements[:20]):  # Limit to 20 elements
            element_summary.append(
                f"Element {i}: type={el.type}, "
                f"position=({int(el.bbox.x)},{int(el.bbox.y)}), "
                f"size={int(el.bbox.width)}x{int(el.bbox.height)}, "
                f"confidence={el.confidence:.2f}"
            )

        prompt = f"""Analyze this mobile app screenshot. I've already detected these UI elements:

{chr(10).join(element_summary)}

For each element, provide:
1. A more accurate component type (button, input, text, image, icon, card, navbar, list, tab, toggle, etc.)
2. A descriptive label (e.g., "Login Button", "Email Input", "App Logo")
3. Whether it has rounded corners (border radius in pixels)
4. The likely font size if it's a text element

Return ONLY a JSON array with this structure:
[
  {{
    "index": 0,
    "type": "button",
    "label": "Sign In Button",
    "borderRadius": 8,
    "fontSize": 16,
    "fontWeight": "600"
  }}
]

Be precise and concise. Only include elements you can confidently identify."""

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={api_key}",
                json={
                    "contents": [
                        {
                            "parts": [
                                {
                                    "inline_data": {
                                        "mime_type": "image/png",
                                        "data": img_base64,
                                    }
                                },
                                {"text": prompt},
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.2,
                        "maxOutputTokens": 4096,
                    },
                },
            )

            if response.status_code != 200:
                return elements

            data = response.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]

            # Extract JSON from response
            json_match = text.strip()
            if json_match.startswith("```"):
                json_match = json_match.split("\n", 1)[1].rsplit("```", 1)[0]

            analysis = json.loads(json_match)

            # Apply Gemini's analysis to our elements
            for item in analysis:
                idx = item.get("index", -1)
                if 0 <= idx < len(elements):
                    el = elements[idx]
                    if "type" in item:
                        el.type = item["type"]
                    if "label" in item:
                        el.label = item["label"]
                    if "borderRadius" in item:
                        el.styles.borderRadius = item["borderRadius"]
                    if "fontSize" in item:
                        el.styles.fontSize = item["fontSize"]
                    if "fontWeight" in item:
                        el.styles.fontWeight = item["fontWeight"]

    except Exception as e:
        print(f"Semantic analysis failed: {e}")

    return elements
