import os
import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, ConfigDict


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_FILE = os.path.join(MODELS_DIR, "matching_model.pkl")


class MatchRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    freelancer_text: str = Field(default="", alias="FreelancerText")
    project_text: str = Field(default="", alias="ProjectText")
    experience_level: str = Field(default="Unknown", alias="ExperienceLevel")
    hourly_rate: float = Field(default=0.0, alias="HourlyRate")
    project_budget: float = Field(default=0.0, alias="ProjectBudget")
    category_match: int = Field(default=0, alias="CategoryMatch")
    skill_overlap: float = Field(default=0.0, alias="SkillOverlap")
    skill_level_score: float = Field(default=0.0, alias="SkillLevelScore")
    proposal_bid_ratio: float = Field(default=0.0, alias="ProposalBidRatio")
    delivery_days: int = Field(default=0, alias="DeliveryDays")


app = FastAPI(title="Freelance Matching Model API")

artifact = None
model = None


@app.on_event("startup")
def startup_event():
    global artifact, model

    if not os.path.exists(MODEL_FILE):
        raise RuntimeError(f"Model file not found at {MODEL_FILE}. Train the model first.")

    artifact = joblib.load(MODEL_FILE)
    model = artifact["model"]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(req: MatchRequest):
    if artifact is None or model is None:
        raise HTTPException(status_code=500, detail="Model not loaded.")

    input_df = pd.DataFrame([{
        "ExperienceLevel": req.experience_level,
        "HourlyRate": req.hourly_rate,
        "ProjectBudget": req.project_budget,
        "CategoryMatch": req.category_match,
        "SkillOverlap": req.skill_overlap,
        "SkillLevelScore": req.skill_level_score,
        "ProposalBidRatio": req.proposal_bid_ratio,
        "DeliveryDays": req.delivery_days,
    }])

    probability = float(model.predict_proba(input_df)[0][1])
    prediction = 1 if probability >= 0.60 else 0

    return {
        "prediction": prediction,
        "matchScore": round(probability * 100, 2),
        "cosineSimilarity": round(float(req.skill_overlap), 4)
    }