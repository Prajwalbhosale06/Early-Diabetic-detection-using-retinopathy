import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image


# =========================================================
# DEVICE
# =========================================================

device = torch.device(
    "mps" if torch.backends.mps.is_available()
    else "cuda" if torch.cuda.is_available()
    else "cpu"
)

print("Using device:", device)


# =========================================================
# CLASS NAMES
# =========================================================

class_names = {
    0: "No Diabetic Retinopathy",
    1: "Mild Diabetic Retinopathy",
    2: "Moderate Diabetic Retinopathy",
    3: "Severe Diabetic Retinopathy",
    4: "Proliferative Diabetic Retinopathy"
}


# =========================================================
# IMAGE TRANSFORM
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
# LOAD MODEL
# =========================================================

model = models.resnet50(weights=None)

num_features = model.fc.in_features

model.fc = nn.Linear(
    num_features,
    5
)


model.load_state_dict(
    torch.load(
        "diabetic_retinopathy_resnet50_clean_combined.pth",
        map_location=device
    )
)

model = model.to(device)

model.eval()


# =========================================================
# GET IMAGE PATH
# =========================================================

image_path = input(
    "\nEnter retinal image path: "
)


# =========================================================
# LOAD IMAGE
# =========================================================

image = Image.open(image_path).convert("RGB")

image_tensor = transform(image)

image_tensor = image_tensor.unsqueeze(0)

image_tensor = image_tensor.to(device)


# =========================================================
# PREDICTION
# =========================================================

with torch.no_grad():

    outputs = model(image_tensor)

    probabilities = torch.softmax(
        outputs,
        dim=1
    )

    confidence, predicted_class = torch.max(
        probabilities,
        dim=1
    )


# =========================================================
# RESULT
# =========================================================

predicted_class = predicted_class.item()

confidence = confidence.item() * 100


print("\n==============================")
print("DIABETIC RETINOPATHY RESULT")
print("==============================")

print(
    "Prediction:",
    class_names[predicted_class]
)

print(
    f"Confidence: {confidence:.2f}%"
)

print("==============================")