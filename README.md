# RetinaAI — AI-Assisted Diabetic Retinopathy Screening

RetinaAI is a full-stack research project for **AI-assisted analysis of retinal fundus images**. It combines a PyTorch model based on ResNet50 with a Flask REST API, a PostgreSQL database, and a React + TypeScript web interface.

The model predicts one of five diabetic retinopathy (DR) severity classes. The application is designed to support screening workflows and organize patient, screening, and report information.

> **Medical disclaimer:** RetinaAI is an academic/research prototype. Its output is not a medical diagnosis and must not be used as a substitute for examination or advice from a qualified eye-care professional.

## Table of contents

- [What it does](#what-it-does)
- [How it works](#how-it-works)
- [DR classification](#dr-classification)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Requirements](#requirements)
- [Setup](#setup)
- [Training the model](#training-the-model)
- [Running prediction](#running-prediction)
- [Backend API](#backend-api)
- [Dataset notes](#dataset-notes)
- [Configuration and important files](#configuration-and-important-files)
- [Limitations and responsible use](#limitations-and-responsible-use)
- [Future improvements](#future-improvements)

## What it does

### Machine learning pipeline

- Uses **ResNet50** with a five-output classification layer.
- Loads retinal image labels from `clean_combined_train.csv`.
- Resizes images to 224 × 224 and normalizes them using ImageNet channel statistics.
- Applies random horizontal flips and small rotations during training.
- Uses a stratified 80/20 train-validation split.
- Uses `WeightedRandomSampler` to reduce the effect of class imbalance during training.
- Saves the best checkpoint according to validation accuracy.

### Web application and API

The checked-in frontend contains a React/TypeScript screening application with dashboard, patient, screening, retinal-image, report, notification, settings, and help/support views.

The Flask backend provides:

- Retinal image prediction.
- Patient creation, listing, and updating.
- Screening creation, listing, and image analysis workflows.
- Dashboard statistics and risk distribution.
- Report listing and PDF report generation.
- PostgreSQL persistence for patient, screening, image, and report records.

The backend accepts JPG, JPEG, PNG, and WebP images and enforces a 10 MB request upload limit.

## How it works

```text
Retinal fundus image
        |
        v
Image validation and preprocessing
( RGB, resize 224 x 224, normalize )
        |
        v
Trained ResNet50
        |
        v
Five-class prediction + confidence
        |
        v
Flask REST API
        |
        +------> PostgreSQL records
        |
        v
React / TypeScript interface
(patient, screening, dashboard and reports)
```

## DR classification

The model's class mapping in the backend and prediction script is:

| Class ID | Class |
|---:|---|
| 0 | No Diabetic Retinopathy |
| 1 | Mild Diabetic Retinopathy |
| 2 | Moderate Diabetic Retinopathy |
| 3 | Severe Diabetic Retinopathy |
| 4 | Proliferative Diabetic Retinopathy |

The backend also groups predictions into application-level labels: `Normal Screening`, `Review Recommended`, and `Elevated Risk`. These are workflow labels, not clinical diagnoses.

## Technology stack

| Area | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| UI and visualization | Tailwind CSS, Motion, Recharts, Lucide React |
| Backend | Python, Flask, Flask-CORS |
| Machine learning | PyTorch, Torchvision, ResNet50 |
| Image processing | Pillow |
| Data processing and evaluation | Pandas, NumPy, scikit-learn |
| Database | PostgreSQL, Flask-SQLAlchemy, psycopg2 |
| Reports | ReportLab |

## Repository structure

The main files and directories currently present in the repository include:

```text
.
├── app.py                         # Flask API, database models and inference
├── train.py                       # ResNet50 training loop
├── predict.py                     # Command-line image prediction
├── model.py                       # ResNet50 model definition/inspection
├── Dataset_loader.py              # Dataset, transforms and data loaders
├── prepare_dataset.py              # Train/validation/test folder preparation
├── balance_dataset.py              # Class balancing utility
├── create_clean_dataset.py         # Clean dataset preparation utility
├── image_filter.py                  # Image filtering utility
├── check_set.py                     # Dataset checking utility
├── test_model.py                    # Model testing utility
├── train.csv                        # Training labels/metadata
├── test.csv                         # Test metadata
├── clean_combined_train.csv         # Clean combined training metadata
├── combined_train.csv               # Combined training metadata
├── frontend/
│   ├── package.json                 # Frontend dependencies and scripts
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── components/
│       ├── data/
│       └── views/
├── .gitignore
└── README.md
```

Large image datasets, uploaded images, virtual environments, and model checkpoint files are excluded by the repository's `.gitignore`. The tree above is a guide to the main tracked files, not an exhaustive listing.

## Requirements

Install the following before running the full application:

- Python 3.10+ (use a Python version compatible with your installed PyTorch/Torchvision build).
- Node.js and npm.
- PostgreSQL.
- A trained model checkpoint for inference.

Training and inference require Python packages including:

```bash
pip install torch torchvision
pip install pandas numpy scikit-learn Pillow
```

The Flask backend additionally imports:

```bash
pip install Flask Flask-Cors Flask-SQLAlchemy psycopg2-binary reportlab
```

You can install the packages together in a virtual environment:

```bash
python -m venv .venv

# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
# .venv\Scripts\Activate.ps1

pip install torch torchvision pandas numpy scikit-learn Pillow
pip install Flask Flask-Cors Flask-SQLAlchemy psycopg2-binary reportlab
```

For GPU acceleration, install the PyTorch build appropriate for your hardware from the [official PyTorch installation selector](https://pytorch.org/get-started/locally/).

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Prajwalbhosale06/Early-Diabetic-detection-using-retinopathy.git
cd Early-Diabetic-detection-using-retinopathy
```

### 2. Prepare PostgreSQL

Create a PostgreSQL database named `retinaai` (or choose another name and set `DATABASE_URL`).

For example, in `psql`:

```sql
CREATE DATABASE retinaai;
```

The backend reads its database connection string from the `DATABASE_URL` environment variable. Its current fallback is a local PostgreSQL URL for a user named `prajwal`; set your own connection string rather than relying on that machine-specific default.

Example for macOS/Linux:

```bash
export DATABASE_URL="postgresql+psycopg2://YOUR_USER:YOUR_PASSWORD@localhost:5432/retinaai"
```

Do not commit passwords or other credentials to Git.

### 3. Add the trained model checkpoint

Place the trained weights file in the repository root with this exact name:

```text
diabetic_retinopathy_resnet50_clean_combined.pth
```

This is the filename that `app.py` and `predict.py` currently expect. The checkpoint is not included in the repository because model files are ignored by `.gitignore`.

### 4. Start the Flask backend

From the repository root, with the Python virtual environment active and the database configured:

```bash
python app.py
```

The Flask API runs on:

```text
http://localhost:5001
```

Check backend and database status at:

```text
http://localhost:5001/health
```

### 5. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite is configured to serve the frontend on:

```text
http://localhost:3000
```

The frontend also contains a `.env.example` for its optional/configured Gemini and app URL values. Copy it to a local environment file only if those integrations are used, and provide your own API key securely. Never commit a real key.

## Training the model

The current training script uses the following configuration:

| Parameter | Current code setting |
|---|---|
| Architecture | ResNet50 |
| Initial weights | Torchvision default pretrained weights |
| Output classes | 5 |
| Input size | 224 × 224 |
| Batch size | 32 |
| Optimizer | Adam |
| Learning rate | 0.0001 |
| Loss | CrossEntropyLoss |
| Epochs | 15 |
| Validation split | 20% |
| Best checkpoint | `diabetic_retinopathy_resnet50_clean_combined.pth` |

The training data loader reads `clean_combined_train.csv`. Its expected columns are `image_path` and `label`. Image paths must resolve on your local machine.

Before training, check that:

1. `clean_combined_train.csv` exists in the repository root.
2. Every `image_path` in the CSV points to an available image.
3. Labels are integers from 0 through 4 and use the class mapping above.
4. The training and validation split does not contain patient/image leakage.
5. Dataset sources use compatible grading conventions and have been reviewed for duplicate images and inconsistent labels.

Run training from the repository root:

```bash
python train.py
```

The script prints training and validation loss/accuracy for each epoch and saves the best validation-accuracy checkpoint to the repository root.

> **Reproducibility note:** Validation accuracy alone is not sufficient to establish clinical performance. Evaluate per-class precision, recall, F1-score, confusion matrix, and performance on an independent test set.

## Running prediction

### Command-line prediction

After placing the trained checkpoint in the repository root:

```bash
python predict.py
```

When prompted, enter the local path to a retinal fundus image.

### Prediction API

The Flask endpoint accepts a multipart form upload with the field name `image`:

```bash
curl -X POST http://localhost:5001/predict \
  -F "image=@/path/to/retinal_image.jpg"
```

The response contains the predicted class name, class ID, and model confidence.

## Backend API

The following routes are defined in the current `app.py`:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | API, model device, and database health |
| POST | `/predict` | Predict DR class from an uploaded image |
| GET | `/api/patients` | List patients |
| POST | `/api/patients` | Create a patient |
| PUT | `/api/patients/{patient_id}` | Update patient details |
| GET | `/api/screenings` | List screening records |
| POST | `/api/screenings` | Create a screening record |
| POST | `/api/screenings/analyze-and-save` | Analyze an image and save screening information |
| GET | `/api/reports` | List reports |
| GET | `/api/reports/{screening_id}/pdf` | Download a screening PDF report |
| DELETE | `/api/reports/{report_id}` | Delete a report |
| GET | `/api/dashboard` | Get dashboard statistics |

For request payloads and response details, refer to the route implementations in `app.py`.

## Dataset notes

The repository includes CSV metadata such as `train.csv`, `test.csv`, `combined_train.csv`, and `clean_combined_train.csv`. The actual retinal image datasets are not included.

The project workflow has explored combining retinal datasets such as APTOS 2019, IDRiD, DDR, and EyePACS. Dataset availability, licensing, attribution requirements, grading definitions, and image access conditions must be checked at the original source before downloading or redistributing any data.

When combining datasets:

- Standardize labels to the five-class mapping used by the model.
- Keep source and original image identifiers in metadata.
- Detect exact and near-duplicate images across sources.
- Check class distributions and image quality.
- Use patient-level or source-aware splits where identifiers allow, to reduce leakage.
- Keep test data separate from training and model selection.

The helper `prepare_dataset.py` currently contains a machine-specific image-folder path. Update that path for your environment before using the script.

## Configuration and important files

| File | Role |
|---|---|
| `app.py` | Flask service, SQLAlchemy models, prediction and report endpoints |
| `train.py` | ResNet50 training loop |
| `Dataset_loader.py` | CSV dataset loader, image transforms, weighted sampler and data loaders |
| `predict.py` | Interactive command-line prediction |
| `prepare_dataset.py` | Creates train/validation/test image folders from metadata |
| `balance_dataset.py` | Creates a reduced balanced training set by undersampling |
| `frontend/package.json` | Frontend scripts and dependencies |
| `frontend/.env.example` | Example frontend environment configuration |
| `.gitignore` | Excludes local data, secrets, checkpoints and build artifacts |

## Limitations and responsible use

- The model's predictions depend on the quality, source, labeling consistency, and representativeness of the training data.
- Images from different cameras, populations, and datasets may have different characteristics.
- A confidence score is the model's softmax output; it is not a calibrated probability of disease.
- The application does not replace a dilated eye examination, professional interpretation, or clinical diagnostic pathway.
- Do not use real patient information in an unsecured or publicly accessible deployment.
- Before any clinical use, the system would require robust external validation, bias assessment, privacy/security review, and appropriate regulatory and clinical oversight.

## Future improvements

- Add documented evaluation results with per-class metrics and an independent test set.
- Add Grad-CAM visual explanations for model review.
- Add model/version tracking and reproducible training configuration.
- Add dataset provenance and duplicate/leakage checks to preprocessing.
- Add automated backend and frontend tests.
- Improve authentication, authorization, audit logging, and protection of patient data before deployment.
- Validate the complete workflow with eye-care professionals.

## Author

**Prajwal Rupesh Bhosale**

GitHub: [@Prajwalbhosale06](https://github.com/Prajwalbhosale06)

## License

No license file was present in the repository at the time this README was prepared. Unless a license is added, reuse and redistribution are not automatically granted. Add a `LICENSE` file if you intend to publish the project under an open-source license.
