# Local Datasets

Place large local-only datasets in this folder after cloning the repository.

Expected large file for the notebook:

- `cubems-smart-building-energy-and-iaq-data.csv`

This file is intentionally ignored by Git because it is too large for a normal GitHub repository. Download the source CU-BEMS dataset from Kaggle:

https://www.kaggle.com/datasets/claytonmiller/cubems-smart-building-energy-and-iaq-data

If you download the raw floor CSV files instead of the combined CSV, place them in `cubems-smart-building-energy-and-iaq-data/` at the repository root and run:

```bash
python3 scripts/combine_cubems_raw.py
```
