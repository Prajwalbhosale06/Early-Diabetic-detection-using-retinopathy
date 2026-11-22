import torch
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from torchvision import transforms, datasets
from PIL import Image
import pandas as pd
from sklearn.model_selection import train_test_split


train_transform = transforms.Compose([
    transforms.Resize((224, 224)),

    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


val_test_transform = transforms.Compose([
    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


class DRDataset(Dataset):

    def __init__(self, dataframe, transform=None):

        self.dataframe = dataframe.reset_index(drop=True)
        self.transform = transform

    def __len__(self):
        return len(self.dataframe)

    def __getitem__(self, index):

        image_path = self.dataframe.loc[index, "image_path"]
        label = int(self.dataframe.loc[index, "label"])

        image = Image.open(image_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, label


# =========================================================
# LOAD CLEAN DATASET
# =========================================================

df = pd.read_csv("clean_combined_train.csv")

print("Total clean images:", len(df))


# =========================================================
# TRAIN / VALIDATION SPLIT
# =========================================================

train_df, val_df = train_test_split(
    df,
    test_size=0.20,
    random_state=42,
    stratify=df["label"]
)


print("Training images:", len(train_df))
print("Validation images:", len(val_df))


# =========================================================
# DATASETS
# =========================================================

train_dataset = DRDataset(
    train_df,
    transform=train_transform
)

val_dataset = DRDataset(
    val_df,
    transform=val_test_transform
)


# =========================================================
# CLASS BALANCING
# =========================================================

class_counts = train_df["label"].value_counts().sort_index()

print()
print("Training class distribution:")
print(class_counts)


class_weights = 1.0 / class_counts

sample_weights = train_df["label"].map(
    class_weights
).values

sample_weights = torch.tensor(
    sample_weights,
    dtype=torch.double
)


train_sampler = WeightedRandomSampler(
    weights=sample_weights,
    num_samples=len(sample_weights),
    replacement=True
)


# =========================================================
# DATA LOADERS
# =========================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=32,
    sampler=train_sampler,
    num_workers=0
)


val_loader = DataLoader(
    val_dataset,
    batch_size=32,
    shuffle=False,
    num_workers=0
)


# =========================================================
# TEST DATASET
# =========================================================

test_dataset = datasets.ImageFolder(
    "dataset/test",
    transform=val_test_transform
)


test_loader = DataLoader(
    test_dataset,
    batch_size=32,
    shuffle=False,
    num_workers=0
)


# =========================================================
# INFORMATION
# =========================================================

print()
print("========== DATASET INFORMATION ==========")

print("Training images:", len(train_dataset))
print("Validation images:", len(val_dataset))
print("Testing images:", len(test_dataset))

print()
print("Test classes:")
print(test_dataset.classes)


images, labels = next(iter(train_loader))

print()
print("Batch image shape:", images.shape)
print("Batch labels shape:", labels.shape)