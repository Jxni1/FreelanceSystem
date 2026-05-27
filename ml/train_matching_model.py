import os
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "matching_training_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "matching_model.pkl")

os.makedirs(MODEL_DIR, exist_ok=True)

df = pd.read_csv(DATA_PATH)

feature_cols = [
    "ExperienceLevel",
    "HourlyRate",
    "ProjectBudget",
    "CategoryMatch",
    "SkillOverlap",
    "SkillLevelScore",
    "ProposalBidRatio",
    "DeliveryDays",
]

target_col = "Label"

df["ExperienceLevel"] = df["ExperienceLevel"].fillna("Unknown")
df["ProposalBidRatio"] = pd.to_numeric(df["ProposalBidRatio"], errors="coerce")
df["DeliveryDays"] = pd.to_numeric(df["DeliveryDays"], errors="coerce")
df["HourlyRate"] = pd.to_numeric(df["HourlyRate"], errors="coerce")
df["ProjectBudget"] = pd.to_numeric(df["ProjectBudget"], errors="coerce")
df["CategoryMatch"] = pd.to_numeric(df["CategoryMatch"], errors="coerce")
df["SkillOverlap"] = pd.to_numeric(df["SkillOverlap"], errors="coerce")
df["SkillLevelScore"] = pd.to_numeric(df["SkillLevelScore"], errors="coerce")
df = df.dropna(subset=[target_col])

X = df[feature_cols]
y = df[target_col].astype(int)

categorical_features = ["ExperienceLevel"]
numeric_features = [
    "HourlyRate",
    "ProjectBudget",
    "CategoryMatch",
    "SkillOverlap",
    "SkillLevelScore",
    "ProposalBidRatio",
    "DeliveryDays",
]

numeric_transformer = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="constant", fill_value=0)),
        ("scaler", StandardScaler()),
    ]
)

categorical_transformer = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="constant", fill_value="Unknown")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ]
)

preprocessor = ColumnTransformer(
    transformers=[
        ("num", numeric_transformer, numeric_features),
        ("cat", categorical_transformer, categorical_features),
    ]
)

pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced")),
    ]
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

pipeline.fit(X_train, y_train)

y_pred = pipeline.predict(X_test)
y_proba = pipeline.predict_proba(X_test)[:, 1]

print("Classification report:")
print(classification_report(y_test, y_pred))

try:
    auc = roc_auc_score(y_test, y_proba)
    print(f"ROC AUC: {auc:.3f}")
except ValueError:
    print("ROC AUC could not be computed.")

joblib.dump(
    {
        "model": pipeline
    },
    MODEL_PATH
)

print(f"Model saved to: {MODEL_PATH}")