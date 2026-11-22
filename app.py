
import os
import uuid
from datetime import datetime
from io import BytesIO

import torch
import torch.nn as nn

from PIL import Image, UnidentifiedImageError
from torchvision import models, transforms

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from werkzeug.utils import secure_filename

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


# =========================================================
# 1. FLASK CONFIGURATION
# =========================================================

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://prajwalbhosale@localhost:5432/retinaai"
)

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Maximum upload size: 10 MB
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

db = SQLAlchemy(app)


# =========================================================
# 2. IMAGE STORAGE CONFIGURATION
# =========================================================

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads",
    "retinal_images"
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {
    "jpg",
    "jpeg",
    "png",
    "webp"
}


def allowed_image(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in ALLOWED_IMAGE_EXTENSIONS
    )


# =========================================================
# 3. DEVICE CONFIGURATION
# =========================================================

device = torch.device(
    "mps" if torch.backends.mps.is_available()
    else "cuda" if torch.cuda.is_available()
    else "cpu"
)


# =========================================================
# 4. MODEL CLASS LABELS
# =========================================================

class_names = {
    0: "No Diabetic Retinopathy",
    1: "Mild Diabetic Retinopathy",
    2: "Moderate Diabetic Retinopathy",
    3: "Severe Diabetic Retinopathy",
    4: "Proliferative Diabetic Retinopathy"
}


def get_risk_level(class_id):
    if class_id == 0:
        return "Normal Screening"
    elif class_id in (1, 2):
        return "Review Recommended"
    return "Elevated Risk"


# =========================================================
# 5. PATIENT ID GENERATOR
# =========================================================

def generate_patient_id():
    return f"PAT-{uuid.uuid4().hex[:8].upper()}"


def generate_screening_id():
    return (
        f"SCR-{datetime.now().strftime('%Y%m%d-%H%M%S')}-"
        f"{uuid.uuid4().hex[:6].upper()}"
    )


# =========================================================
# 6. DATABASE MODELS
# =========================================================

class Patient(db.Model):

    __tablename__ = "patients"

    id = db.Column(db.Integer, primary_key=True)

    patient_id = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    name = db.Column(
        db.String(150),
        nullable=False
    )

    age = db.Column(db.Integer)

    gender = db.Column(db.String(20))

    phone = db.Column(db.String(30))

    email = db.Column(db.String(150))

    dob = db.Column(db.String(20))

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


class Screening(db.Model):

    __tablename__ = "screenings"

    id = db.Column(db.Integer, primary_key=True)

    screening_id = db.Column(
        db.String(50),
        unique=True,
        nullable=False
    )

    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False
    )

    eye = db.Column(
        db.String(10),
        nullable=False
    )

    prediction = db.Column(
        db.String(100),
        nullable=False
    )

    class_id = db.Column(
        db.Integer,
        nullable=False
    )

    confidence = db.Column(
        db.Numeric(5, 2),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )

    patient = db.relationship(
        "Patient",
        backref="screenings"
    )


class RetinalImage(db.Model):

    __tablename__ = "retinal_images"

    id = db.Column(db.Integer, primary_key=True)

    screening_id = db.Column(
        db.Integer,
        db.ForeignKey("screenings.id", ondelete="CASCADE")
    )

    image_path = db.Column(db.Text)

    uploaded_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


class Report(db.Model):

    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)

    screening_id = db.Column(
        db.Integer,
        db.ForeignKey("screenings.id", ondelete="CASCADE")
    )

    report_text = db.Column(db.Text)

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.current_timestamp()
    )


# =========================================================
# 7. RESNET50 MODEL LOADING
# =========================================================

model = models.resnet50(weights=None)

num_features = model.fc.in_features

model.fc = nn.Linear(
    num_features,
    5
)

model_path = os.path.join(
    BASE_DIR,
    "diabetic_retinopathy_resnet50_clean_combined.pth"
)

if not os.path.exists(model_path):
    raise FileNotFoundError(
        f"Model file not found: {model_path}"
    )

state_dict = torch.load(
    model_path,
    map_location=device
)

model.load_state_dict(state_dict)

model = model.to(device)
model.eval()


# =========================================================
# 8. IMAGE PREPROCESSING
# =========================================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# =========================================================
# 9. MODEL PREDICTION FUNCTION
# =========================================================

def predict_image(image):

    image = image.convert("RGB")

    image_tensor = transform(image)

    image_tensor = image_tensor.unsqueeze(0)

    image_tensor = image_tensor.to(device)

    with torch.no_grad():

        outputs = model(image_tensor)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        confidence_tensor, predicted_tensor = torch.max(
            probabilities,
            dim=1
        )

    class_id = int(predicted_tensor.item())

    confidence = round(
        float(confidence_tensor.item()) * 100,
        2
    )

    return {
        "prediction": class_names[class_id],
        "class_id": class_id,
        "confidence": confidence
    }


# =========================================================
# 10. REPORT GENERATION FUNCTION
# =========================================================

def generate_report_text(screening):

    return (
        f"ResNet50 prediction: {screening.prediction}. "
        f"Class ID: {screening.class_id}. "
        f"Model confidence: {float(screening.confidence):.2f}%. "
        "Review the AI model prediction with a qualified "
        "eye-care professional before making any clinical decision."
    )


def save_report(screening):

    report = Report(
        screening_id=screening.id,
        report_text=generate_report_text(screening)
    )

    db.session.add(report)

    return report


# =========================================================
# 11. HEALTH CHECK
# =========================================================

@app.route("/health", methods=["GET"])
def health():

    try:

        db.session.execute(db.text("SELECT 1"))

        database_status = "connected"

    except Exception as error:

        db.session.rollback()

        database_status = f"error: {str(error)}"

    return jsonify({
        "status": "ok",
        "model": "ResNet50",
        "device": str(device),
        "database": database_status
    })


# =========================================================
# 12. PREDICTION ONLY API
# =========================================================

@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:
        return jsonify({
            "error": "No image provided"
        }), 400

    image_file = request.files["image"]

    try:

        image = Image.open(
            image_file.stream
        ).convert("RGB")

        result = predict_image(image)

        return jsonify(result)

    except (UnidentifiedImageError, OSError):

        return jsonify({
            "error": "Invalid image file"
        }), 400

    except Exception:

        app.logger.exception("Prediction failed")

        return jsonify({
            "error": "Prediction failed"
        }), 500


# =========================================================
# 13. GET ALL PATIENTS
# =========================================================

@app.route("/api/patients", methods=["GET"])
def get_patients():

    patients = Patient.query.order_by(
        Patient.created_at.desc()
    ).all()

    result = []

    for patient in patients:

        latest = Screening.query.filter_by(
            patient_id=patient.id
        ).order_by(
            Screening.created_at.desc()
        ).first()

        result.append({

            "id": patient.patient_id,

            "patientId": patient.patient_id,

            "name": patient.name,

            "age": patient.age,

            "dob": patient.dob,

            "gender": patient.gender or "Other",

            "phone": patient.phone or "",

            "email": patient.email or "",

            "screeningsCount": len(patient.screenings),

            "lastScreeningDate": (
                latest.created_at.isoformat()
                if latest and latest.created_at else None
            ),

            "lastScreeningResult": (
                get_risk_level(latest.class_id)
                if latest else None
            ),

            "status": "Active",

            "createdAt": (
                patient.created_at.isoformat()
                if patient.created_at else None
            )

        })

    return jsonify(result)


# =========================================================
# 14. CREATE PATIENT
# =========================================================

@app.route("/api/patients", methods=["POST"])
def create_patient():

    data = request.get_json() or {}

    name = str(data.get("name") or "").strip()

    if not name:
        return jsonify({
            "error": "name is required"
        }), 400

    patient_id = str(
        data.get("patientId") or ""
    ).strip()

    if not patient_id:

        patient_id = generate_patient_id()

        while Patient.query.filter_by(
            patient_id=patient_id
        ).first():

            patient_id = generate_patient_id()

    elif Patient.query.filter_by(
        patient_id=patient_id
    ).first():

        return jsonify({
            "error": "Patient ID already exists"
        }), 409

    try:

        patient = Patient(
            patient_id=patient_id,
            name=name,
            age=data.get("age"),
            dob=data.get("dob"),
            gender=data.get("gender"),
            phone=data.get("phone"),
            email=data.get("email")
        )

        db.session.add(patient)

        db.session.commit()

        return jsonify({

            "message": "Patient created successfully",

            "patient": {
                "id": patient.patient_id,
                "patientId": patient.patient_id,
                "name": patient.name,
                "age": patient.age,
                "dob": patient.dob,
                "gender": patient.gender or "Other",
                "phone": patient.phone or "",
                "email": patient.email or "",
                "screeningsCount": 0,
                "status": "Active"
            }

        }), 201

    except Exception:

        db.session.rollback()

        app.logger.exception("Patient creation failed")

        return jsonify({
            "error": "Unable to create patient"
        }), 500


# =========================================================
# 15. UPDATE PATIENT
# =========================================================

@app.route("/api/patients/<patient_id>", methods=["PUT"])
def update_patient(patient_id):

    data = request.get_json() or {}

    patient = Patient.query.filter_by(
        patient_id=patient_id
    ).first()

    if not patient:

        return jsonify({
            "error": "Patient not found"
        }), 404

    try:

        if data.get("name") is not None:
            name = str(data["name"]).strip()

            if name:
                patient.name = name

        if data.get("age") is not None:
            patient.age = int(data["age"])

        for field in (
            "dob",
            "gender",
            "phone",
            "email"
        ):

            if data.get(field) is not None:
                setattr(patient, field, data[field])

        db.session.commit()

        return jsonify({
            "message": "Patient updated successfully"
        })

    except Exception:

        db.session.rollback()

        app.logger.exception("Patient update failed")

        return jsonify({
            "error": "Unable to update patient"
        }), 500


# =========================================================
# 16. GET ALL SCREENINGS
# =========================================================

@app.route("/api/screenings", methods=["GET"])
def get_screenings():

    screenings = Screening.query.order_by(
        Screening.created_at.desc()
    ).all()

    result = []

    for screening in screenings:

        result.append({

            "id": screening.id,

            "screeningId": screening.screening_id,

            "patientId": (
                screening.patient.patient_id
                if screening.patient else None
            ),

            "patientName": (
                screening.patient.name
                if screening.patient else None
            ),

            "eye": screening.eye,

            "prediction": screening.prediction,

            "classId": screening.class_id,

            "riskLevel": get_risk_level(screening.class_id),

            "confidence": float(screening.confidence),

            "createdAt": (
                screening.created_at.isoformat()
                if screening.created_at else None
            )

        })

    return jsonify(result)


# =========================================================
# 17. CREATE SCREENING USING JSON
# =========================================================

@app.route("/api/screenings", methods=["POST"])
def create_screening():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No screening data provided"
        }), 400

    required_fields = [
        "patientId",
        "eye",
        "prediction",
        "classId",
        "confidence"
    ]

    for field in required_fields:

        if field not in data:

            return jsonify({
                "error": f"{field} is required"
            }), 400

    if data["eye"] not in ("OD", "OS", "OU"):

        return jsonify({
            "error": "Invalid eye value"
        }), 400

    try:

        patient = Patient.query.filter_by(
            patient_id=data["patientId"]
        ).first()

        patient_data = data.get("patient") or {}

        if not patient:

            return jsonify({
                "error": "Patient not found"
            }), 404

        class_id = int(data["classId"])

        if class_id not in class_names:

            return jsonify({
                "error": "Invalid classId"
            }), 400

        confidence = float(data["confidence"])

        if not 0 <= confidence <= 100:

            return jsonify({
                "error": "Confidence must be between 0 and 100"
            }), 400

        screening_code = (
            data.get("screeningId")
            or generate_screening_id()
        )

        if Screening.query.filter_by(
            screening_id=screening_code
        ).first():

            return jsonify({
                "error": "Screening ID already exists"
            }), 409

        screening = Screening(
            screening_id=screening_code,
            patient_id=patient.id,
            eye=data["eye"],
            prediction=str(data["prediction"]),
            class_id=class_id,
            confidence=confidence
        )

        db.session.add(screening)

        db.session.flush()

        image_name = data.get("imageName")

        if image_name:

            image_record = RetinalImage(
                screening_id=screening.id,
                image_path=str(image_name)
            )

            db.session.add(image_record)

        save_report(screening)

        db.session.commit()

        return jsonify({

            "message": "Screening saved successfully",

            "screening": {
                "id": screening.id,
                "screeningId": screening.screening_id,
                "patientId": patient.patient_id,
                "patientName": patient.name,
                "eye": screening.eye,
                "prediction": screening.prediction,
                "classId": screening.class_id,
                "riskLevel": get_risk_level(screening.class_id),
                "confidence": float(screening.confidence),
                "createdAt": (
                    screening.created_at.isoformat()
                    if screening.created_at else None
                )
            }

        }), 201

    except Exception:

        db.session.rollback()

        app.logger.exception("Screening creation failed")

        return jsonify({
            "error": "Unable to save screening"
        }), 500


# =========================================================
# 18. ANALYZE IMAGE AND SAVE SCREENING
# =========================================================

@app.route(
    "/api/screenings/analyze-and-save",
    methods=["POST"]
)
def analyze_and_save_screening():

    image_file = request.files.get("image")

    patient_id = (
        request.form.get("patientId") or ""
    ).strip()

    eye = (
        request.form.get("eye") or ""
    ).upper().strip()

    if image_file is None or not image_file.filename:

        return jsonify({
            "error": "An image file is required"
        }), 400

    if not allowed_image(image_file.filename):

        return jsonify({
            "error": "Use JPG, JPEG, PNG or WEBP images"
        }), 400

    if not patient_id:

        return jsonify({
            "error": "patientId is required"
        }), 400

    if eye not in ("OD", "OS", "OU"):

        return jsonify({
            "error": "eye must be OD, OS or OU"
        }), 400

    patient = Patient.query.filter_by(
        patient_id=patient_id
    ).first()

    if patient is None:

        return jsonify({
            "error": "Patient not found"
        }), 404

    saved_path = None

    try:

        # Read and validate image
        image = Image.open(
            image_file.stream
        )

        image.verify()

        image_file.stream.seek(0)

        image = Image.open(
            image_file.stream
        ).convert("RGB")

        # Run ResNet50 prediction
        prediction_result = predict_image(image)

        class_id = prediction_result["class_id"]

        confidence = prediction_result["confidence"]

        prediction = prediction_result["prediction"]

        # Generate unique image filename
        original_name = secure_filename(
            image_file.filename
        ) or "retinal-image"

        extension = original_name.rsplit(".", 1)[1].lower()

        stored_name = f"{uuid.uuid4().hex}.{extension}"

        saved_path = os.path.join(
            UPLOAD_FOLDER,
            stored_name
        )

        # Re-encode and save the validated image
        image_formats = {
            "jpg": "JPEG",
            "jpeg": "JPEG",
            "png": "PNG",
            "webp": "WEBP"
        }

        image.save(
            saved_path,
            format=image_formats[extension]
        )

        # Create screening
        screening = Screening(
            screening_id=generate_screening_id(),
            patient_id=patient.id,
            eye=eye,
            prediction=prediction,
            class_id=class_id,
            confidence=confidence
        )

        db.session.add(screening)

        db.session.flush()

        # Save image metadata
        image_record = RetinalImage(
            screening_id=screening.id,
            image_path=os.path.relpath(
                saved_path,
                BASE_DIR
            )
        )

        db.session.add(image_record)

        # Generate report
        save_report(screening)

        # Commit all database records
        db.session.commit()

        return jsonify({

            "message": "Image analyzed and screening saved successfully",

            "screening": {

                "id": screening.id,

                "screeningId": screening.screening_id,

                "patientId": patient.patient_id,

                "patientName": patient.name,

                "eye": screening.eye,

                "prediction": screening.prediction,

                "classId": screening.class_id,

                "riskLevel": get_risk_level(screening.class_id),

                "confidence": float(screening.confidence),

                "createdAt": (
                    screening.created_at.isoformat()
                    if screening.created_at else None
                ),

                "imagePath": os.path.relpath(
                    saved_path,
                    BASE_DIR
                )

            }

        }), 201

    except (UnidentifiedImageError, OSError):

        db.session.rollback()

        if saved_path and os.path.exists(saved_path):
            os.remove(saved_path)

        return jsonify({
            "error": "Invalid or corrupted image"
        }), 400

    except Exception:

        db.session.rollback()

        if saved_path and os.path.exists(saved_path):
            os.remove(saved_path)

        app.logger.exception(
            "Image analysis and screening save failed"
        )

        return jsonify({
            "error": "Unable to analyze and save screening"
        }), 500


# =========================================================
# 19. GET ALL REPORTS
# =========================================================

@app.route("/api/reports", methods=["GET"])
def get_reports():

    reports = Report.query.order_by(
        Report.created_at.desc()
    ).all()

    result = []

    for report in reports:

        screening = db.session.get(
            Screening,
            report.screening_id
        )

        if not screening:
            continue

        patient = screening.patient

        result.append({

            "id": f"REP-{report.id}",

            "reportId": report.id,

            "screeningId": screening.screening_id,

            "patientId": (
                patient.patient_id if patient else None
            ),

            "patientName": (
                patient.name if patient else "Unknown Patient"
            ),

            "screeningDate": (
                screening.created_at.isoformat()
                if screening.created_at else None
            ),

            "generatedDate": (
                report.created_at.isoformat()
                if report.created_at else None
            ),

            "status": "Finalized",

            "riskLevel": get_risk_level(screening.class_id),

            "doctorName": "ResNet50 AI Analysis",

            "prediction": screening.prediction,

            "classId": screening.class_id,

            "confidence": float(screening.confidence),

            "eye": screening.eye,

            "reportText": report.report_text

        })

    return jsonify(result)


# =========================================================
# 20. DOWNLOAD REPORT AS PDF
# =========================================================

@app.route(
    "/api/reports/<screening_id>/pdf",
    methods=["GET"]
)
def download_report_pdf(screening_id):

    screening = Screening.query.filter_by(
        screening_id=screening_id
    ).first()

    if not screening:

        return jsonify({
            "error": "Screening not found"
        }), 404

    patient = screening.patient

    buffer = BytesIO()

    pdf = canvas.Canvas(
        buffer,
        pagesize=A4
    )

    width, height = A4

    y = height - 55

    pdf.setFont("Helvetica-Bold", 18)

    pdf.drawString(
        50,
        y,
        "RetinaAI - Diabetic Retinopathy Screening Report"
    )

    y -= 35

    pdf.setFont("Helvetica", 10)

    pdf.drawString(
        50,
        y,
        f"Screening ID: {screening.screening_id}"
    )

    y -= 18

    pdf.drawString(
        50,
        y,
        f"Date: {screening.created_at.strftime('%Y-%m-%d %H:%M') if screening.created_at else 'N/A'}"
    )

    y -= 30

    pdf.setFont("Helvetica-Bold", 12)

    pdf.drawString(
        50,
        y,
        "Patient Information"
    )

    y -= 20

    pdf.setFont("Helvetica", 10)

    patient_details = [
        f"Patient ID: {patient.patient_id if patient else 'N/A'}",
        f"Name: {patient.name if patient else 'N/A'}",
        f"Age: {patient.age if patient and patient.age is not None else 'N/A'}",
        f"Gender: {patient.gender if patient and patient.gender else 'N/A'}",
        f"Date of birth: {patient.dob if patient and patient.dob else 'N/A'}",
        f"Phone: {patient.phone if patient and patient.phone else 'N/A'}"
    ]

    for detail in patient_details:

        pdf.drawString(50, y, detail)

        y -= 16

    y -= 14

    pdf.setFont("Helvetica-Bold", 12)

    pdf.drawString(
        50,
        y,
        "AI Model Result"
    )

    y -= 20

    pdf.setFont("Helvetica", 10)

    results = [
        "Model: ResNet50",
        f"Eye examined: {screening.eye}",
        f"Predicted class: {screening.prediction}",
        f"Class ID: {screening.class_id}",
        f"Model confidence: {float(screening.confidence):.2f}%"
    ]

    for result in results:

        pdf.drawString(50, y, result)

        y -= 16

    y -= 14

    pdf.setFont("Helvetica-Bold", 12)

    pdf.drawString(
        50,
        y,
        "Clinical Note"
    )

    y -= 20

    pdf.setFont("Helvetica", 10)

    note = (
        "Review the AI model prediction with a qualified "
        "eye-care professional before making any clinical decision."
    )

    text_object = pdf.beginText(50, y)

    text_object.setFont("Helvetica", 10)

    for index in range(0, len(note), 90):

        text_object.textLine(note[index:index + 90])

    pdf.drawText(text_object)

    y -= 50

    pdf.setFont("Helvetica-Bold", 11)

    pdf.drawString(
        50,
        y,
        "Important"
    )

    y -= 18

    pdf.setFont("Helvetica", 9)

    disclaimer = (
        "This report contains an AI classification result. "
        "It is not a standalone medical diagnosis and should "
        "be reviewed by a qualified healthcare professional."
    )

    text_object = pdf.beginText(50, y)

    text_object.setFont("Helvetica", 9)

    for index in range(0, len(disclaimer), 95):

        text_object.textLine(disclaimer[index:index + 95])

    pdf.drawText(text_object)

    pdf.showPage()

    pdf.save()

    buffer.seek(0)

    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"{screening.screening_id}_report.pdf"
    )


# =========================================================
# 21. DELETE REPORT
# =========================================================

@app.route(
    "/api/reports/<int:report_id>",
    methods=["DELETE"]
)
def delete_report(report_id):

    report = db.session.get(
        Report,
        report_id
    )

    if not report:

        return jsonify({
            "error": "Report not found"
        }), 404

    try:

        db.session.delete(report)

        db.session.commit()

        return jsonify({
            "message": "Report deleted successfully"
        })

    except Exception:

        db.session.rollback()

        app.logger.exception("Report deletion failed")

        return jsonify({
            "error": "Unable to delete report"
        }), 500


# =========================================================
# 22. DASHBOARD STATISTICS
# =========================================================

@app.route("/api/dashboard", methods=["GET"])
def dashboard():

    total_screenings = Screening.query.count()

    today_screenings = Screening.query.filter(
        db.func.date(Screening.created_at)
        == db.func.current_date()
    ).count()

    normal_results = Screening.query.filter_by(
        class_id=0
    ).count()

    elevated_risk = Screening.query.filter(
        Screening.class_id > 0
    ).count()

    risk_distribution = {

        "noDr": normal_results,

        "mild": Screening.query.filter_by(
            class_id=1
        ).count(),

        "moderate": Screening.query.filter_by(
            class_id=2
        ).count(),

        "severe": Screening.query.filter_by(
            class_id=3
        ).count(),

        "proliferative": Screening.query.filter_by(
            class_id=4
        ).count()

    }

    latest_screening = Screening.query.order_by(
        Screening.created_at.desc()
    ).first()

    latest_analysis = None

    if latest_screening:

        latest_analysis = {

            "screeningId": latest_screening.screening_id,

            "patientId": (
                latest_screening.patient.patient_id
                if latest_screening.patient else None
            ),

            "patientName": (
                latest_screening.patient.name
                if latest_screening.patient else None
            ),

            "eye": latest_screening.eye,

            "prediction": latest_screening.prediction,

            "classId": latest_screening.class_id,

            "confidence": float(
                latest_screening.confidence
            ),

            "createdAt": (
                latest_screening.created_at.isoformat()
                if latest_screening.created_at else None
            )

        }

    return jsonify({

        "totalPatients": Patient.query.count(),

        "totalScreenings": total_screenings,

        "todayScreenings": today_screenings,

        "normalResults": normal_results,

        "elevatedRisk": elevated_risk,

        "pendingReviews": 0,

        "riskDistribution": risk_distribution,

        "latestAnalysis": latest_analysis

    })


# =========================================================
# 23. FILE UPLOAD ERROR HANDLER
# =========================================================

@app.errorhandler(413)
def file_too_large(error):

    return jsonify({
        "error": "Image exceeds the 10 MB upload limit"
    }), 413


# =========================================================
# 24. DATABASE INITIALIZATION
# =========================================================

with app.app_context():

    db.create_all()

    # Compatibility with an existing patients table
    db.session.execute(
        db.text(
            "ALTER TABLE patients "
            "ADD COLUMN IF NOT EXISTS dob VARCHAR(20)"
        )
    )

    db.session.commit()


# =========================================================
# 25. RUN FLASK APPLICATION
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )
