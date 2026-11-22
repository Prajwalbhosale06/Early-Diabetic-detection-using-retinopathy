#source venv/bin/activate -- activate the virtual environment
import torch
import torch.nn as nn
from torchvision import models

model = models.resnet50(weights="DEFAULT")

num_features = model.fc.in_features

model.fc = nn.Linear(num_features, 5)

print(model)