"""Pydantic models for the ML service API."""

from typing import Optional
from pydantic import BaseModel


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class Padding(BaseModel):
    top: int = 0
    right: int = 0
    bottom: int = 0
    left: int = 0


class ElementStyles(BaseModel):
    backgroundColor: Optional[str] = None
    textColor: Optional[str] = None
    fontSize: Optional[int] = None
    fontWeight: Optional[str] = None
    fontFamily: Optional[str] = None
    borderRadius: Optional[int] = None
    borderWidth: Optional[int] = None
    borderColor: Optional[str] = None
    padding: Optional[Padding] = None
    margin: Optional[Padding] = None
    opacity: Optional[float] = None
    shadow: Optional[str] = None


class DetectedElement(BaseModel):
    id: str
    type: str
    label: Optional[str] = None
    bbox: BoundingBox
    confidence: float
    styles: ElementStyles = ElementStyles()
    children: list["DetectedElement"] = []


class ColorInfo(BaseModel):
    hex: str
    rgb: str
    hsl: str
    percentage: float
    name: Optional[str] = None


class TextRegion(BaseModel):
    text: str
    bbox: BoundingBox
    fontSize: int
    fontWeight: Optional[str] = None
    color: Optional[str] = None
    confidence: float


class ImageMetadata(BaseModel):
    deviceType: Optional[str] = None
    screenWidth: Optional[int] = None
    screenHeight: Optional[int] = None
    platform: Optional[str] = None


class AnalysisResult(BaseModel):
    id: str
    imageUrl: str
    imageWidth: int
    imageHeight: int
    elements: list[DetectedElement]
    colors: list[ColorInfo]
    texts: list[TextRegion]
    metadata: ImageMetadata
    createdAt: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    services: dict[str, bool]
