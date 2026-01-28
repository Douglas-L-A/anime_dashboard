import json
from pathlib import Path
import pandas as pd

RAW_DIR = Path("data/raw")
PROCESSED_DIR = Path("data/processed")
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

def load_raw_json() -> list:
    raw_files = sorted(RAW_DIR.glob("*.json"))
    if not raw_files:
        raise FileNotFoundError("Nenhum arquivos RAW encontrado")
    
    with open(raw_files[-1], "r", encoding="utf-8") as f:
        return json.load(f)
    

def normalize_anime(animes: list) -> pd.DataFrame:
    records = []

    for anime in animes:
        record = {
            "mal_id": anime.get("mal_id"),
            "image": anime.get('images', {}).get('jpg', {}).get('large_image_url'),
            "title": anime.get("title"),
            "type": anime.get("type"),
            "source": anime.get("source"),
            "episodes": anime.get("episodes"),
            "status": anime.get("status"),
            "duration": anime.get("duration"),
            "rating": anime.get("rating"),
            "score": anime.get("score"),
            "rank": anime.get("rank"),
            "popularity": anime.get("popularity"),
            "members": anime.get("members"),
            "synopsis": anime.get("synopsis"),
            "season": anime.get("season"),
            "year": anime.get("year"),
            "studios": [studio.get('name') for studio in anime.get('studios', [])],
            "genres": [genre.get('name') for genre in anime.get('genres', [])],
            "themes": [theme.get('name') for theme in anime.get('themes', [])],
            "demographics": [demographic.get('name') for demographic in anime.get('demographics', [])]
        }
        records.append(record)
    
    records = pd.DataFrame(records)
    records["episodes"] = records["episodes"].astype("Int64")
    records["rank"] = records["rank"].astype("Int64")
    records["year"] = records["year"].astype("Int64")
    records["members"] = records["members"].astype("Int64")
    records["score"] = records["score"].astype("float32")

    return records

def save_processed(df: pd.DataFrame):
    output_path = PROCESSED_DIR / "top_anime_processed.parquet"
    df.to_parquet(output_path, index=False)
    print(f"Arquivo salvo em: {output_path}")

def main():
    print("Iniciando processamento...")
    raw_data = load_raw_json()
    print("Dados RAW lidos com sucesso...")
    print("Normalizando dados...")
    df = normalize_anime(raw_data)
    save_processed(df)
    print(f"Processamento finalizado. Total de registros: {len(df)}")
