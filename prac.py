import pandas as pd
import os
import glob

old_df = pd.read_csv("train.csv")

old_df = old_df.rename(columns={
    "id_code": "image_name",
    "diagnosis": "label"
})


def find_old_image(image_name):
    extensions = [".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"]

    for ext in extensions:
        path = os.path.join("train_images", image_name + ext)

        if os.path.exists(path):
            return path

    return None


old_df["image_path"] = old_df["image_name"].apply(find_old_image)


old_df = old_df[["image_path", "label"]]



idr_df = pd.read_csv(
    "IDRiD_curated/train/IDR_train.csv"
)


idr_df = idr_df[idr_df["gradability"] == 1]


idr_df["image_path"] = (
    "IDRiD_curated/train/images/" + idr_df["filename"]
)


idr_df = idr_df.rename(columns={
    "level": "label"
})


idr_df = idr_df[["image_path", "label"]]



old_df = old_df.dropna(subset=["image_path"])

idr_df = idr_df[
    idr_df["image_path"].apply(os.path.exists)
]




combined_df = pd.concat(
    [old_df, idr_df],
    ignore_index=True
)




combined_df = combined_df.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)



combined_df.to_csv(
    "combined_train.csv",
    index=False
)



print("\n========== COMBINED DATASET ==========")

print(combined_df.head(10))

print("\nTotal images:", len(combined_df))

print("\nClass distribution:")
print(combined_df["label"].value_counts().sort_index())

print("\nMissing image paths:")
print(combined_df["image_path"].isna().sum())
