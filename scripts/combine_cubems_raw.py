import os
import re
from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[1]
folder_path = PROJECT_ROOT / "cubems-smart-building-energy-and-iaq-data"
output_path = PROJECT_ROOT / "Final datasets" / "cubems-smart-building-energy-and-iaq-data.csv"

# Empty list to store dataframes
dfs = []

# Loop through all files in folder
for file in os.listdir(folder_path):
    if file.endswith(".csv"):
        
        file_path = folder_path / file
        
        # Read CSV
        df = pd.read_csv(file_path)
        
        # Extract Year and Floor using regex
        match = re.match(r"(\d{4})Floor(\d+)", file)
        
        if match:
            year = int(match.group(1))
            floor = int(match.group(2))
        else:
            print(f"Skipping file (name format issue): {file}")
            continue
        
        # Add new columns
        df["Year"] = year
        df["Floor"] = floor
        
        # Append to list
        dfs.append(df)

# Combine all dataframes
final_df = pd.concat(dfs, ignore_index=True)

# Save combined CSV
output_path.parent.mkdir(exist_ok=True)
final_df.to_csv(output_path, index=False)

print("All files combined successfully!")
print("Shape of final dataset:", final_df.shape)
print("Saved to:", output_path)
