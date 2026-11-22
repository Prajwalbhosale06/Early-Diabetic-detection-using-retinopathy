import pandas as pd
import os
import shutil
from sklearn.model_selection import train_test_split


CSV_PATH = "train.csv"

IMAGE_FOLDER = "/Users/prajwalbhosale/Downloads/train_images"

OUTPUT_FOLDER = "dataset"

df = pd.read_csv(CSV_PATH)

print("Total images:", len(df))

train_df, temp_df = train_test_split(
    df,
    test_size=0.30,
    stratify=df["diagnosis"],
    random_state=42
)

val_df, test_df = train_test_split(
    temp_df,
    test_size=0.50,
    stratify=temp_df["diagnosis"],
    random_state=42
)

print("Training:", len(train_df))
print("Validation:", len(val_df))
print("Testing:", len(test_df))


for split in ["train", "val", "test"]:
    for class_id in range(5):
        os.makedirs(
            os.path.join(OUTPUT_FOLDER, split, str(class_id)),
            exist_ok=True
        )

def copy_images(dataframe, split):

    for _, row in dataframe.iterrows():

        image_id = row["id_code"]
        diagnosis = row["diagnosis"]

        source = os.path.join(
            IMAGE_FOLDER,
            image_id + ".png"
        )

        destination = os.path.join(
            OUTPUT_FOLDER,
            split,
            str(diagnosis),
            image_id + ".png"
        )

        if os.path.exists(source):
            shutil.copy2(source, destination)
        else:
            print("Missing:", image_id)


copy_images(train_df, "train")
copy_images(val_df, "val")
copy_images(test_df, "test")

print("Dataset preparation complete!")