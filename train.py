import torch
import torch.nn as nn
import torch.optim as optim

from torchvision import models

from Dataset_loader import train_loader, val_loader



device = torch.device(
    "mps" if torch.backends.mps.is_available()
    else "cuda" if torch.cuda.is_available()
    else "cpu"
)

print("Using device:", device)


print("Training images:", len(train_loader.dataset))
print("Validation images:", len(val_loader.dataset))

print("Training batches:", len(train_loader))
print("Validation batches:", len(val_loader))

model = models.resnet50(weights="DEFAULT")

num_features = model.fc.in_features

model.fc = nn.Linear(
    num_features,
    5
)

model = model.to(device)

criterion = nn.CrossEntropyLoss()


optimizer = optim.Adam(
    model.parameters(),
    lr=0.0001
)

num_epochs = 15

best_val_acc = 0.0


for epoch in range(num_epochs):

    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in train_loader:

        images = images.to(device)
        labels = labels.to(device)

       
        optimizer.zero_grad()

       
        outputs = model(images)

       
        loss = criterion(outputs, labels)

        
        loss.backward()

     
        optimizer.step()

        running_loss += loss.item()

        
        _, predicted = torch.max(outputs, 1)

        total += labels.size(0)

        correct += (
            predicted == labels
        ).sum().item()


    train_accuracy = 100 * correct / total


    model.eval()

    val_loss = 0.0
    val_correct = 0
    val_total = 0

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)

            loss = criterion(outputs, labels)

            val_loss += loss.item()

            _, predicted = torch.max(outputs, 1)

            val_total += labels.size(0)

            val_correct += (
                predicted == labels
            ).sum().item()


    val_accuracy = 100 * val_correct / val_total


    print(
        f"Epoch [{epoch + 1}/{num_epochs}] "
        f"Train Loss: {running_loss / len(train_loader):.4f} "
        f"Train Acc: {train_accuracy:.2f}% "
        f"Val Loss: {val_loss / len(val_loader):.4f} "
        f"Val Acc: {val_accuracy:.2f}%"
    )


    if val_accuracy > best_val_acc:

        best_val_acc = val_accuracy

        torch.save(
            model.state_dict(),
            "diabetic_retinopathy_resnet50_clean_combined.pth"
        )

        print(
            f"Best model saved! "
            f"Validation Accuracy: {val_accuracy:.2f}%"
        )


print()
print("==============================")
print("TRAINING COMPLETE")
print("==============================")

print(
    f"🏆 Best Validation Accuracy: "
    f"{best_val_acc:.2f}%"
)

print(
    " Best model saved as:"
)

print(
    "diabetic_retinopathy_resnet50_clean_combined.pth"
)