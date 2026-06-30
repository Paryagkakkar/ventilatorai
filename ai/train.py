from pathlib import Path
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVR

"""
Training pipeline for demo ventilator recommendation model.

This script:
1) Generates realistic dummy data from deterministic clinical-style rules + noise.
2) Trains and compares RandomForest and SVM (MultiOutput).
3) Saves the best model bundle with metadata for inference.
"""

RANDOM_SEED = 42
N_SAMPLES = 3000
# RR is predicted from basic patient data — it is NOT an input feature.
FEATURE_COLUMNS = ["age", "height", "weight", "spo2", "hr", "condition"]
TARGET_COLUMNS = ["predicted_rr", "predicted_bpm", "ie_exp_ratio"]
CONDITION_MAP = {
    "ARDS": 0,
    "COPD": 1,
    "Asthma": 2,
    "Trauma": 3,
    "Medical Emergency": 4,
}


def clamp(value, low, high):
    return max(low, min(high, value))


def build_dummy_dataset():
    np.random.seed(RANDOM_SEED)
    condition_ids = np.random.choice(list(CONDITION_MAP.values()), N_SAMPLES)

    data = {
        "age": np.random.randint(18, 85, N_SAMPLES),
        "height": np.random.randint(150, 195, N_SAMPLES),
        "weight": np.random.randint(45, 120, N_SAMPLES),
        "spo2": np.random.randint(80, 100, N_SAMPLES),
        "hr": np.random.randint(55, 150, N_SAMPLES),
        "condition": condition_ids,
    }
    df = pd.DataFrame(data)

    targets = []
    for row in df.itertuples(index=False):
        # Rule-template baseline per condition (doctor-style ventilator targets).
        if row.condition == CONDITION_MAP["ARDS"]:
            base_rr = 24
        elif row.condition == CONDITION_MAP["COPD"]:
            base_rr = 17
        elif row.condition == CONDITION_MAP["Asthma"]:
            base_rr = 20
        elif row.condition == CONDITION_MAP["Trauma"]:
            base_rr = 19
        else:
            base_rr = 22

        # Adjust RR from patient vitals only (no RR input from user).
        hypoxia_delta = clamp((92 - row.spo2) * 0.35, -2, 5)
        stress_delta = clamp((row.hr - 90) * 0.04, -2, 4)
        age_delta = clamp((row.age - 50) * 0.02, -1, 2)

        rr_target = clamp(
            base_rr + hypoxia_delta + stress_delta + age_delta + np.random.normal(0, 1.0),
            10,
            32,
        )
        bpm_target = clamp(
            row.hr + (rr_target - 18) * 1.1 + ((92 - row.spo2) * 0.7) + np.random.normal(0, 2.0),
            50,
            170,
        )
        # Encode I:E as expiratory ratio number: 2 => 1:2, 3 => 1:3
        ie_exp_ratio = 2.0 if rr_target <= 20 else 3.0

        targets.append([rr_target, bpm_target, ie_exp_ratio])

    targets_df = pd.DataFrame(targets, columns=TARGET_COLUMNS)
    return pd.concat([df, targets_df], axis=1)


def evaluate_model(name, model, x_train, x_test, y_train, y_test):
    model.fit(x_train, y_train)
    preds = model.predict(x_test)

    per_target = {}
    mae_values = []
    r2_values = []

    for idx, target in enumerate(TARGET_COLUMNS):
        mae = mean_absolute_error(y_test.iloc[:, idx], preds[:, idx])
        r2 = r2_score(y_test.iloc[:, idx], preds[:, idx])
        per_target[target] = {"mae": float(mae), "r2": float(r2)}
        mae_values.append(mae)
        r2_values.append(r2)

    return {
        "name": name,
        "model": model,
        "avg_mae": float(np.mean(mae_values)),
        "avg_r2": float(np.mean(r2_values)),
        "metrics": per_target,
    }


def main():
    print("Training ventilator recommendation models on dummy data...")
    dataset = build_dummy_dataset()

    x = dataset[FEATURE_COLUMNS]
    y = dataset[TARGET_COLUMNS]
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=RANDOM_SEED
    )

    rf = RandomForestRegressor(
        n_estimators=300,
        max_depth=18,
        min_samples_leaf=2,
        random_state=RANDOM_SEED,
        n_jobs=-1,
    )
    svm = Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("model", MultiOutputRegressor(SVR(C=8.0, epsilon=0.15, kernel="rbf"))),
        ]
    )

    # SVM training can be expensive; use a representative subset for fast comparison.
    svm_subset_size = min(len(x_train), 1000)
    x_train_svm = x_train.iloc[:svm_subset_size]
    y_train_svm = y_train.iloc[:svm_subset_size]

    results = [
        evaluate_model("RandomForest", rf, x_train, x_test, y_train, y_test),
        evaluate_model("SVM", svm, x_train_svm, x_test, y_train_svm, y_test),
    ]
    best = sorted(results, key=lambda item: item["avg_mae"])[0]

    project_dir = Path(__file__).resolve().parent
    model_bundle_path = project_dir / "model_bundle.joblib"
    metrics_path = project_dir / "training_metrics.json"
    dataset_path = project_dir / "training_data.csv"

    bundle = {
        "model_name": best["name"],
        "model": best["model"],
        "feature_columns": FEATURE_COLUMNS,
        "target_columns": TARGET_COLUMNS,
        "condition_map": CONDITION_MAP,
        "metrics": {
            "selected_model": best["name"],
            "results": [
                {
                    "name": res["name"],
                    "avg_mae": res["avg_mae"],
                    "avg_r2": res["avg_r2"],
                    "per_target": res["metrics"],
                }
                for res in results
            ],
        },
    }
    joblib.dump(bundle, model_bundle_path)

    with metrics_path.open("w", encoding="utf-8") as fh:
        json.dump(bundle["metrics"], fh, indent=2)

    dataset.to_csv(dataset_path, index=False)

    print(f"Training complete. Selected model: {best['name']}")
    print(f"Saved model bundle: {model_bundle_path}")
    print(f"Saved metrics: {metrics_path}")
    print(f"Saved training data: {dataset_path}")


if __name__ == "__main__":
    main()