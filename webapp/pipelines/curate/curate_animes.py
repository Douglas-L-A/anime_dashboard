import pandas as pd
from pathlib import Path

PROCESSED_PATH = Path("data/processed/top_anime_processed.parquet")
CURATED_PATH = Path("data/curated/animes_curated_base.parquet")

def create_episode_range(episodes):
    if pd.isna(episodes):
        return "unknown"
    if episodes <= 12:
        return "1-12"
    if episodes <= 24:
        return "13-24"
    if episodes <= 50:
        return "25-50"
    return "50+"

def create_score_bucket(score):
    if pd.isna(score):
        return "unknown"
    if score < 7:
        return "< 7"
    if score < 8:
        return "7-8"
    if score < 9:
        return "8-9"
    return "9+"

def main():
    print("Iniciando curadoria de animes")

    df = pd.read_parquet(PROCESSED_PATH)

    df["episode_range"] = df["episodes"].apply(create_episode_range)
    df["score_bucket"] = df["score"].apply(create_score_bucket)

    curated_columns = [
        "mal_id",
        "image",
        "title",
        "type",
        "source",
        "episodes",
        "episode_range",
        "status",
        "duration",
        "rating",
        "score",
        "score_bucket",
        "rank",
        "popularity",
        "members",
        "synopsis",
        "season",
        "year",
        "studios",
        "genres",
        "themes",
        "demographics"
    ]

    df_curated = df[curated_columns]

    CURATED_PATH.parent.mkdir(parents=True, exist_ok=True)

    df_curated.to_parquet(CURATED_PATH, index=False)

    print(f"Camada CURATED finalizada com sucesso!")
    print(f"Total de animes: {len(df_curated)}")