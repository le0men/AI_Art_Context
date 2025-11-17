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
from openai import OpenAI
import base64

load_dotenv()
API_KEY = os.getenv("AIORNOT_API_KEY")
IMAGE_ENDPOINT = "https://api.aiornot.com/v2/image/sync"

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# logging setup for debugging
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
    reverse: Optional[Json]


class AIDetectionResponse(BaseModel):
    id: str
    analysis: Json
    multi_analysis: Optional[Json] = None
    model: str
    tokens_used: Optional[dict] = None


# ============================================
# API Routes
# ============================================


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API welcome message"""
    return {
        "message": "Welcome to Image Analysis API",
        "health": "/health",
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy", timestamp=datetime.utcnow().isoformat(), version="1.0.0"
    )


@app.post("/api/analyze", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze an uploaded image

    Args:
        file: Image file to analyze

    Returns:
        AnalysisResponse with analysis results
    """

    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read file content
        contents = await file.read()

        resp = requests.post(
            IMAGE_ENDPOINT,
            headers={"Authorization": f"Bearer {API_KEY}"},
            files={"image": contents},
            params={
                "only": [
                    "ai_generated",
                    #  "reverse_search"
                ]
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
            reverse=json.dumps(body.get("reverse_search")),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


@app.post("/api/detect-ai", response_model=AIDetectionResponse, tags=["AI Detection"])
async def detect_ai_generated(file: UploadFile = File(...)):
    """
    Analyze an image to detect AI-generated content using GPT-4o-mini

    Args:
        file: Image file to analyze

    Returns:
        AIDetectionResponse with analysis results
    """
    # AI model being used
    used_model = "gpt-4o"

    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read and encode image to base64
        contents = await file.read()
        base64_image = base64.b64encode(contents).decode("utf-8")

        # Determine image type for data URL
        data_url = f"data:{file.content_type};base64,{base64_image}"

        # load prompts
        file_path = "prompt_visual.txt"
        with open(file_path, "r", encoding="utf-8") as f:
            prompt_content = f.read()
        file_path = "prompt_multimodal.txt"
        with open(file_path, "r", encoding="utf-8") as f:
            multi_prompt_content = f.read()

        # Call OpenAI API with vision capabilities
        response = openai_client.chat.completions.create(
            model=used_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a visual artifact detector and a multimodal analyst. Your task is to inspect the image and identify visual artifacts indicative of AI generation or synthetic.",
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"{prompt_content}",
                        },
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                },
            ],
            max_tokens=2000,
        )

        # Call OpenAI API for multimodal analysis
        response_multi = openai_client.chat.completions.create(
            model=used_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert multimodal analyst specializing in evaluating the consistency between textual and visual information with the provided media. Your goal is to determine whether the caption (text) and the visual (image) convey consistent meanings about the same situation or intention.",
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"{multi_prompt_content}",
                        },
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                },
            ],
            max_tokens=1000,
        )

        # Extract responses

        multi_text = ""
        # check if no caption
        if response_multi.choices[0].message.content == "None":
            multi_text = None
        else:
            multi_text = str(response_multi.choices[0].message.content)

        analysis_text = response.choices[0].message.content
        tokens_used = {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens,
        }

        logger.info(f"Tokens used: {tokens_used['total_tokens']}")

        return AIDetectionResponse(
            id=response.id,
            analysis=str(analysis_text),
            multi_analysis=multi_text,
            model=used_model,
            tokens_used=tokens_used,
        )

    except Exception as e:
        logger.error(f"Error in AI detection: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error processing image with OpenAI: {str(e)}"
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
