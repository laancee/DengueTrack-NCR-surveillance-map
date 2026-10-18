from flask import Flask, jsonify, render_template
import pandas as pd
from pathlib import Path

app = Flask(__name__)
DATA_PATH = Path(__file__).parent / "dengue_ncr_only_2016_2021.csv"

def load_data():
    df = pd.read_csv(DATA_PATH)
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["cases"] = pd.to_numeric(df["cases"], errors="coerce").fillna(0)
    df["deaths"] = pd.to_numeric(df["deaths"], errors="coerce").fillna(0)
    df["location"] = df["location"].astype(str).str.strip()
    df = df.dropna(subset=["date"])
    return df

@app.route("/")
def index():
    df = load_data()
    years = sorted(df["date"].dt.year.unique().tolist())
    return render_template("index.html", years=years)

@app.route("/api/dengue")
def dengue_data():
    df = load_data()
    df["date"] = df["date"].dt.strftime("%Y-%m-%d")
    return jsonify(df[["location", "cases", "deaths", "date", "region"]].to_dict(orient="records"))

if __name__ == "__main__":
    app.run(debug=True)
