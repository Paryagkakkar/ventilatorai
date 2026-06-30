from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

PROJECT_DIR = Path(__file__).resolve().parent
MODEL_BUNDLE_PATH = PROJECT_DIR / "model_bundle.joblib"

bundle = joblib.load(MODEL_BUNDLE_PATH)
model = bundle["model"]
feature_columns = bundle["feature_columns"]
condition_map = bundle["condition_map"]
model_name = bundle["model_name"]

print(f"AI model loaded: {model_name}")


def clamp(value, low, high):
    return max(low, min(high, value))


def parse_number(payload, key, default):
    value = payload.get(key, default)
    try:
        return float(value)
    except (ValueError, TypeError):
        return float(default)


def normalize_condition(value):
    if value is None:
        return "ARDS"
    value_str = str(value).strip()
    if value_str in condition_map:
        return value_str
    # If client sends numeric condition ids, map to known key if possible.
    if value_str.isdigit():
        condition_id = int(value_str)
        for name, cid in condition_map.items():
            if cid == condition_id:
                return name
    return "ARDS"


@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "OK",
            "model_name": model_name,
            "model_path": str(MODEL_BUNDLE_PATH),
        }
    )


@app.route("/predict", methods=["POST"])
def predict():
    try:
        payload = request.json or {}
        condition_name = normalize_condition(payload.get("condition"))

        # RR is not collected from the form; model predicts it from basic vitals.
        features = {
            "age": clamp(parse_number(payload, "age", 35), 0, 120),
            "height": clamp(parse_number(payload, "height", 170), 80, 250),
            "weight": clamp(parse_number(payload, "weight", 70), 20, 300),
            "spo2": clamp(parse_number(payload, "spo2", 92), 50, 100),
            "hr": clamp(parse_number(payload, "hr", 90), 20, 220),
            "condition": float(condition_map[condition_name]),
        }

        input_df = pd.DataFrame([features])[feature_columns]
        pred = model.predict(input_df)[0]

        predicted_rr = clamp(float(pred[0]), 8, 35)
        predicted_bpm = clamp(float(pred[1]), 50, 170)
        ie_exp_ratio = 3 if round(float(pred[2])) >= 3 else 2
        ie_ratio = f"1:{ie_exp_ratio}"

        return jsonify(
            {
                "predicted_rr": int(round(predicted_rr)),
                "predicted_bpm": int(round(predicted_bpm)),
                "ie_ratio": ie_ratio,
                "source": f"ml-{model_name.lower()}",
                "message": "AI predicted RR, I:E, and BPM from patient vitals",
            }
        )
    except Exception as exc:
        return (
            jsonify(
                {
                    "predicted_rr": 18,
                    "predicted_bpm": 92,
                    "ie_ratio": "1:2",
                    "source": "fallback",
                    "message": f"AI service fallback used: {str(exc)}",
                }
            ),
            200,
        )


if __name__ == "__main__":
    print("AI inference service running on http://localhost:5001")
    app.run(debug=False, host="0.0.0.0", port=5001, use_reloader=False)