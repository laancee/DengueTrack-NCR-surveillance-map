# DengueTrack NCR — Flask + Leaflet.js

A beginner-friendly interactive map prototype using the cleaned NCR dengue CSV.

## Requirements
- Python 3.10 or newer
- Internet access for Leaflet, Bootstrap, and OpenStreetMap tiles in the browser

## Run on Windows (VS Code / PowerShell)

1. Extract the project ZIP.
2. Open the `dengue_ncr_leaflet` folder in VS Code.
3. Open Terminal > New Terminal.
4. Create a virtual environment:

   ```powershell
   py -m venv .venv
   ```

5. Activate it:

   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

   If PowerShell blocks activation, use Command Prompt instead, or run `.\.venv\Scripts\python.exe -m pip install -r requirements.txt` and `.\.venv\Scripts\python.exe app.py`.

6. Install packages:

   ```powershell
   python -m pip install -r requirements.txt
   ```

7. Start Flask:

   ```powershell
   python app.py
   ```

8. Open `http://127.0.0.1:5000` in your browser. Keep the terminal open while using the app. Press `Ctrl+C` to stop it.

## What is included
- `app.py`: Flask server and JSON API
- `dengue_ncr_only_2016_2021.csv`: NCR-only data
- `templates/index.html`: page layout
- `static/style.css`: responsive styling
- `static/app.js`: Leaflet map, filters, markers, and summary table
- `requirements.txt`: Python dependencies

## How the map works
- Select a reporting year or a location.
- Switch between reported cases and reported deaths to recolor and resize the circles.
- Click a circle to view the aggregated values and date range.
- The table ranks locations by the selected metric.

## Data and interpretation notes
- Coordinates are approximate city/municipality centers, not case-level coordinates or official boundaries.
- Values are sums of records in the selected date range. Verify how the source defines its weekly records before interpreting sums as unique cases.
- This prototype flags relative differences only; it does not implement an official outbreak threshold.
- Use synthetic data for demos if the dataset contains personal or confidential information. This CSV currently contains aggregate location-level fields only.
- For production use, validate source data and surveillance criteria with an authorized public-health professional.
