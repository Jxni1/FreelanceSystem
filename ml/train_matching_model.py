import os
import json
import joblib
import numpy as np
import pandas as pd

from sentence_transformers import SentenceTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")

TRAINING_FILE = os.path.join(DATA_DIR, "matching_training_data.csv")
MODEL_FILE = os.path.join(MODELS_DIR, "matching_model.pkl")
META_FILE = os.path.join(MODELS_DIR, "matching_model_meta.json")

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def ensure_dirs():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(MODELS_DIR, exist_ok=True)


def safe_float(series, default=0.0):
    return pd.to_numeric(series, errors="coerce").fillna(default).astype(float)


def build_features(df, encoder):
    freelancer_texts = df["FreelancerText"].fillna("").astype(str).tolist()
    project_texts = df["ProjectText"].fillna("").astype(str).tolist()

    freelancer_embeddings = encoder.encode(
        freelancer_texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=True
    )

    project_embeddings = encoder.encode(
        project_texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=True
    )

    cosine_similarity = np.sum(freelancer_embeddings * project_embeddings, axis=1)

    experience_encoder = LabelEncoder()
    experience_encoded = experience_encoder.fit_transform(
        df["ExperienceLevel"].fillna("Unknown").astype(str)
    )

    numeric_features = np.column_stack([
        cosine_similarity,
        safe_float(df["HourlyRate"]),
        safe_float(df["ProjectBudget"]),
        safe_float(df["CategoryMatch"]),
        safe_float(df["SkillOverlap"]),
        safe_float(df["SkillLevelScore"]),
        safe_float(df["ProposalBidRatio"]),
        safe_float(df["DeliveryDays"]),
        experience_encoded
    ])

    return numeric_features, experience_encoder


def main():
    ensure_dirs()

    if not os.path.exists(TRAINING_FILE):
        raise FileNotFoundError(
            f"Training file not found at: {TRAINING_FILE}\n"
            f"Export matching_training_data.csv from your .NET backend first."
        )

    df = pd.read_csv(TRAINING_FILE)

    required_columns = [
        "FreelancerText",
        "ProjectText",
        "ExperienceLevel",
        "HourlyRate",
        "ProjectBudget",
        "CategoryMatch",
        "SkillOverlap",
        "SkillLevelScore",
        "ProposalBidRatio",
        "DeliveryDays",
        "Label"
    ]

    missing = [c for c in required_columns if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns in CSV: {missing}")

    df = df.dropna(subset=["FreelancerText", "ProjectText", "Label"]).copy()
    df["Label"] = pd.to_numeric(df["Label"], errors="coerce").fillna(0).astype(int)

    print(f"Loaded dataset with {len(df)} rows.")

    encoder = SentenceTransformer(EMBEDDING_MODEL_NAME)

    X, experience_encoder = build_features(df, encoder)
    y = df["Label"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y if len(np.unique(y)) > 1 else None
    )

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        class_weight="balanced"
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1] if len(np.unique(y)) > 1 else np.zeros(len(y_test))

    print("\nAccuracy:", accuracy_score(y_test, y_pred))
    if len(np.unique(y_test)) > 1:
        print("ROC-AUC:", roc_auc_score(y_test, y_prob))
    print("\nClassification report:\n")
    print(classification_report(y_test, y_pred, zero_division=0))

    artifact = {
        "model": model,
        "experience_classes": experience_encoder.classes_.tolist(),
        "embedding_model_name": EMBEDDING_MODEL_NAME,
        "feature_order": [
            "cosine_similarity",
            "hourly_rate",
            "project_budget",
            "category_match",
            "skill_overlap",
            "skill_level_score",
            "proposal_bid_ratio",
            "delivery_days",
            "experience_encoded"
        ]
    }

    joblib.dump(artifact, MODEL_FILE)

    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(
            {
                "embedding_model_name": EMBEDDING_MODEL_NAME,
                "rows_trained": int(len(df)),
                "feature_order": artifact["feature_order"],
                "experience_classes": artifact["experience_classes"]
            },
            f,
            indent=2
        )

    print(f"\nSaved model to: {MODEL_FILE}")
    print(f"Saved metadata to: {META_FILE}")


if __name__ == "__main__":
    main()