import os
import shutil
import random

SOURCE = "dataset/train"
OUTPUT = "dataset_balanced/train"

random.seed(42)

classes = ["0", "1", "2", "3", "4"]

# Find the smallest class
class_counts = {}

for class_name in classes:
    class_folder = os.path.join(SOURCE, class_name)

    images = [
        f for f in os.listdir(class_folder)
        if f.lower().endswith((".png", ".jpg", ".jpeg"))
    ]

    class_counts[class_name] = len(images)

print("Original class counts:")
print(class_counts)

# Smallest class determines balanced count
target_count = min(class_counts.values())

print("\nImages per class:", target_count)

# Create output folders
for class_name in classes:
    os.makedirs(
        os.path.join(OUTPUT, class_name),
        exist_ok=True
    )

# Balance dataset
for class_name in classes:

    source_folder = os.path.join(SOURCE, class_name)
    output_folder = os.path.join(OUTPUT, class_name)

    images = [
        f for f in os.listdir(source_folder)
        if f.lower().endswith((".png", ".jpg", ".jpeg"))
    ]

    random.shuffle(images)

    selected_images = images[:target_count]

    for image in selected_images:

        source_path = os.path.join(
            source_folder,
            image
        )

        output_path = os.path.join(
            output_folder,
            image
        )

        shutil.copy2(
            source_path,
            output_path
        )

    print(
        f"Class {class_name}: "
        f"{len(selected_images)} images copied"
    )

print("\n Balanced dataset created!")