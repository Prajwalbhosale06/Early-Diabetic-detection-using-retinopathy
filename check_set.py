import os

for split in ["train", "val", "test"]:
    print(f"\n{split.upper()}")

    total = 0

    for class_id in range(5):
        folder = os.path.join("dataset", split, str(class_id))

        count = len([
            f for f in os.listdir(folder)
            if f.endswith(".png")
        ])

        print(f"Class {class_id}: {count}")
        total += count

    print("Total:", total)