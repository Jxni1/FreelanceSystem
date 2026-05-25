import os
import joblib
import numpy as np

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_FILE = os.path.join(MODELS_DIR, "matching_model.pkl")


class MatchRequest(BaseModel):
    freelancerText: str
    projectText: str
    experienceLevel: str = "Unknown"
    hourlyRate: float = 0.0
    projectBudget: float = 0.0
    categoryMatch: int = 0
    skillOverlap: float = 0.0
    skillLevelScore: float = 0.0
    proposalBidRatio: float = 0.0
    deliveryDays: int = 0


app = FastAPI(title="Freelance Matching Model API")

artifact = None
embedding_model = None


def build_feature_vector(req: MatchRequest):
    freelancer_embedding = embedding_model.encode(
        [req.freelancerText],
        convert_to_numpy=True,
        normalize_embeddings=True
    )[0]

    project_embedding = embedding_model.encode(
        [req.projectText],
        convert_to_numpy=True,
        normalize_embeddings=True
    )[0]

    cosine_similarity = float(np.dot(freelancer_embedding, project_embedding))

    experience_classes = artifact["experience_classes"]
    try:
        experience_encoded = experience_classes.index(req.experienceLevel)
    except ValueError:
        experience_encoded = 0

    features = np.array([[
        cosine_similarity,
        float(req.hourlyRate),
        float(req.projectBudget),
        float(req.categoryMatch),
        float(req.skillOverlap),
        float(req.skillLevelScore),
        float(req.proposalBidRatio),
        float(req.deliveryDays),
        float(experience_encoded)
    ]])

    return features, cosine_similarity


@app.on_event("startup")
def startup_event():
    global artifact, embedding_model

    if not os.path.exists(MODEL_FILE):
        raise RuntimeError(
            f"Model file not found at {MODEL_FILE}. Train the model first."
        )

    artifact = joblib.load(MODEL_FILE)
    embedding_model = SentenceTransformer(artifact["embedding_model_name"])


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(req: MatchRequest):
    if artifact is None or embedding_model is None:
        raise HTTPException(status_code=500, detail="Model not loaded.")

    features, cosine_similarity = build_feature_vector(req)

    model = artifact["model"]
    prediction = int(model.predict(features)[0])

    if hasattr(model, "predict_proba"):
        probability = float(model.predict_proba(features)[0][1])
    else:
        probability = float(prediction)

    return {
        "prediction": prediction,
        "matchScore": round(probability * 100, 2),
        "cosineSimilarity": round(cosine_similarity, 4)
    }