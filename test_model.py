import torch
import torch.nn as nn

from torchvision import models, datasets, transforms
from torch.utils.data import DataLoader

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score
)

import numpy as np


device = torch.device(
    "mps" if torch.backends.mps.is_available()
    else "cuda" if torch.cuda.is_available()
    else "cpu"
)

print("Using device:", device)



test_transform = transforms.Compose([

    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


test_dataset = datasets.ImageFolder(
    "dataset/test",
    transform=test_transform
)

test_loader = DataLoader(
    test_dataset,
    batch_size=32,
    shuffle=False,
    num_workers=0
)


print("Test images:", len(test_dataset))
print("Classes:", test_dataset.classes)


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

print(" Combined dataset model loaded")




all_predictions = []
all_labels = []


with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(device)
        labels = labels.to(device)

        
        outputs = model(images)

        
        _, predicted = torch.max(outputs, 1)


        all_predictions.extend(
            predicted.cpu().numpy()
        )

        all_labels.extend(
            labels.cpu().numpy()
        )



all_predictions = np.array(all_predictions)
all_labels = np.array(all_labels)




test_accuracy = accuracy_score(
    all_labels,
    all_predictions
)


print()
print("==============================")
print("TEST RESULTS")
print("==============================")

print(
    f"Test Accuracy: {test_accuracy * 100:.2f}%"
)




class_names = [
    "No DR",
    "Mild",
    "Moderate",
    "Severe",
    "Proliferative DR"
]



print()
print("==============================")
print("CLASSIFICATION REPORT")
print("==============================")


print(
    classification_report(
        all_labels,
        all_predictions,
        target_names=class_names,
        digits=4,
        zero_division=0
    )
)


cm = confusion_matrix(
    all_labels,
    all_predictions
)


print()
print("==============================")
print("CONFUSION MATRIX")
print("==============================")

print(cm)