from io import BytesIO

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI(title="Image Classifier API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = pipeline(
    "image-classification",
    model="google/mobilenet_v2_1.0_224",
    top_k=5,
)


class Prediction(BaseModel):
    label: str
    score: float


class ClassifyResponse(BaseModel):
    results: list[Prediction]


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/classify", response_model=ClassifyResponse)
async def classify(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(BytesIO(contents)).convert("RGB")
    predictions = classifier(image)
    return {
        "results": [
            {"label": p["label"], "score": round(p["score"], 4)}
            for p in predictions
        ]
    }
