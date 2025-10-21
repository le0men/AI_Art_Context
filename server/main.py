from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, Json
from typing import Optional, List, Any
import uvicorn
from dotenv import load_dotenv
from datetime import datetime
import os
import json
import requests
import logging

load_dotenv()
API_KEY = os.getenv("AIORNOT_API_KEY")
IMAGE_ENDPOINT = "https://api.aiornot.com/v2/image/sync"

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s : %(message)s"
)

logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Image Analysis API",
    description="API for image analysis and processing",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Pydantic Models (Request/Response schemas)
# ============================================


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str


class AnalysisRequest(BaseModel):
    image_url: Optional[str] = None
    options: Optional[dict] = Field(default_factory=dict)


class AnalysisResponse(BaseModel):
    id: str
    created_at: str
    report: Json


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: str


# ============================================
# Dependency Functions
# ============================================


async def verify_api_key():
    """Example dependency for API key verification"""
    # Implement your authentication logic here
    return True


# ============================================
# API Routes
# ============================================


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API welcome message"""
    return {
        "message": "Welcome to Image Analysis API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy", timestamp=datetime.utcnow().isoformat(), version="1.0.0"
    )


@app.post("/api/analyze", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_image(
    file: UploadFile = File(...), authenticated: bool = Depends(verify_api_key)
):
    """
    Analyze an uploaded image

    Args:
        file: Image file to analyze

    Returns:
        AnalysisResponse with analysis results
    """

    try:
        if not authenticated:
            raise HTTPException(status_code=400, detail="API Key issue")
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read file content
        contents = await file.read()

        resp = requests.post(
            IMAGE_ENDPOINT,
            headers={"Authorization": f"Bearer {API_KEY}"},
            files={"image": contents},
            params={
                "only": ["ai_generated"]
                # "external_id": "my-tracking-id"  # Optional
                # Example: only run reverse_search:
                # "only": ["reverse_search"]
                # Example: run all defaults except deepfake:
                # "excluding": ["deepfake"]
            },
        )

        body = resp.json()

        logger.info(body)
        return AnalysisResponse(
            id=body["id"],
            created_at=body["created_at"],
            report=json.dumps(body["report"]),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


@app.post("/api/analyze-url", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_image_url(
    request: AnalysisRequest, authenticated: bool = Depends(verify_api_key)
):
    """
    Analyze an image from URL

    Args:
        request: AnalysisRequest with image URL

    Returns:
        AnalysisResponse with analysis results
    """
    if not request.image_url:
        raise HTTPException(status_code=400, detail="image_url is required")

    # TODO: Implement URL-based image analysis
    return AnalysisResponse(
        id="analysis_456",
        status="completed",
        confidence=0.92,
        processing_time=1.56,
        results={"source": "url", "url": request.image_url},
    )


@app.get(
    "/api/analysis/{analysis_id}", response_model=AnalysisResponse, tags=["Analysis"]
)
async def get_analysis(analysis_id: str):
    """
    Retrieve analysis results by ID

    Args:
        analysis_id: ID of the analysis to retrieve

    Returns:
        AnalysisResponse with analysis results
    """
    # TODO: Implement database lookup
    # Placeholder response
    return AnalysisResponse(
        id=analysis_id, status="completed", results={"message": "Analysis retrieved"}
    )


@app.delete("/api/analysis/{analysis_id}", tags=["Analysis"])
async def delete_analysis(analysis_id: str):
    """
    Delete analysis results by ID

    Args:
        analysis_id: ID of the analysis to delete

    Returns:
        Success message
    """
    # TODO: Implement deletion logic
    return {"message": f"Analysis {analysis_id} deleted successfully"}


# ============================================
# Error Handlers
# ============================================


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail, detail=str(exc), timestamp=datetime.utcnow().isoformat()
        ).dict(),
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="Internal server error",
            detail=str(exc),
            timestamp=datetime.utcnow().isoformat(),
        ).dict(),
    )


# ============================================
# Main Entry Point
# ============================================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload during development
        log_level="info",
    )
