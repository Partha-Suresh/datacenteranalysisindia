# DAV Lab Data Center Visualization

Interactive DAV lab project for exploring global data center infrastructure, supported by Jupyter notebooks and local datasets.

## Project Structure

```text
.
├── data/                  # Small tracked datasets used by the app/notebooks
├── docs/assets/           # Demo media and documentation assets
├── Final datasets/        # Local-only large datasets, ignored by Git
├── notebooks/             # Jupyter notebooks
├── scripts/               # Utility scripts for dataset preparation
├── src/                   # React + Vite visualization source
├── index.html
├── package.json
└── vite.config.ts
```

## Large Dataset

The combined CU-BEMS smart building dataset is not included in this repository because it is too large for GitHub.

Download it from Kaggle:

https://www.kaggle.com/datasets/claytonmiller/cubems-smart-building-energy-and-iaq-data

Place the combined local file here:

```text
Final datasets/cubems-smart-building-energy-and-iaq-data.csv
```

If you have the raw floor CSV files, place them in:

```text
cubems-smart-building-energy-and-iaq-data/
```

Then generate the combined local CSV:

```bash
python3 scripts/combine_cubems_raw.py
```

## Run the Visualization

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Notebooks

Open `notebooks/dav-lab-viz-1.ipynb` from the repository root or from the `notebooks/` folder. It reads small tracked datasets from `data/` and the large local-only CU-BEMS file from `Final datasets/`.
