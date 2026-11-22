import os
import pandas as pd


COMBINED_CSV = "combined_train.csv"
TEST_FOLDER = "dataset/test"
OUTPUT_CSV = "clean_combined_train.csv"


df = pd.read_csv(COMBINED_CSV)

print("Original combined images:", len(df))


# Get all test image filenames
test_images = set()

for root, dirs, files in os.walk(TEST_FOLDER):
    for file in files:
        if file.lower().endswith((".png", ".jpg", ".jpeg")):
            test_images.add(file)


print("Test images:", len(test_images))


# Remove test images from combined dataset
df["filename"] = df["image_path"].apply(
    lambda x: os.path.basename(x)
)

clean_df = df[
    ~df["filename"].isin(test_images)
].copy()


clean_df = clean_df.drop(columns=["filename"])


print("Clean combined images:", len(clean_df))
print(
    "Removed images:",
    len(df) - len(clean_df)
)


clean_df.to_csv(
    OUTPUT_CSV,
    index=False
)


print()
print("Clean dataset saved as:")
print(OUTPUT_CSV)