import pandas as pd
import os

df = pd.read_csv("train.csv")

image_folder = "/Users/prajwalbhosale/Downloads/train_images"


missing = []

for image_id in df["id_code"]:
    image_path = os.path.join(image_folder, image_id + ".png")

    if not os.path.exists(image_path):
        missing.append(image_id)

print("Total images in CSV:", len(df))
print("Missing images:", len(missing))

if len(missing) > 0:
    print("First few missing images:")
    print(missing[:10])
else:
    print("All images found!")