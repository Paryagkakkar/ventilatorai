# VentAI Demo Project

This repository is a full-stack demo for ventilator recommendation support using dummy data.

## Project Structure

- `backend/` - Express API, rule engine, and integration with AI service
- `frontend/` - React UI for patient intake, doctor review, and dashboard
- `ai/` - Training and inference service for ML predictions

## Important Safety Note

This project is for software prototyping and research workflow only.
It is not validated for real-world clinical deployment.

## Quick Start

### 1) Start Backend API

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2) Train AI Model

```bash
cd ai
python -m pip install -r requirements.txt
python train.py
```

This generates:

- `ai/model_bundle.joblib`
- `ai/training_metrics.json`
- `ai/training_data.csv`

### 3) Start AI Service

```bash
cd ai
python app.py
```

AI service runs on `http://localhost:5001`.

### 4) Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on the Vite port shown in terminal (usually `http://localhost:5173`).

## API Highlights

- `POST /api/patient` - register patient with validation
- `GET /api/patients` - list registered patients
- `POST /api/recommendation` - rules-based recommendation
- `POST /api/predict` - ML prediction proxy with rules fallback
- `POST /api/decision` - save doctor decision
- `GET /api/decisions` - list doctor decisions
- `GET /api/health` - backend health and counters

## ML Pipeline Notes

- Dummy data is generated from structured condition-aware logic.
- Two algorithms are trained and compared:
  - RandomForest
  - SVM (through `MultiOutputRegressor`)
- Best model is selected by average MAE and saved in a model bundle.

## Next Upgrade When Real Data Arrives

When you provide real labeled data, replace the dummy data generator in `ai/train.py` with a CSV loader and keep the same feature/target schema.
