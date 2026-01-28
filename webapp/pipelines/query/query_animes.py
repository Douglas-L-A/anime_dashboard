import pandas as pd
import numpy as np
from django.conf import settings
from pathlib import Path

BASE_DIR = Path(settings.BASE_DIR).parent
CURATED_PATH = BASE_DIR / "data" / "curated" / "animes_curated_base.parquet"


def normalize_list(value):
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, np.ndarray):
        return value.tolist()
    if isinstance(value, str):
        # tenta tratar string simples ou repr de lista
        return [v.strip() for v in value.replace("[", "").replace("]", "").replace("'", "").split(",")]
    return []

def to_json_safe(value):
    if pd.isna(value):
        return None
    return value

def dict_to_json_safe(d: dict):
    safe = {}

    for k, v in d.items():
        # NaN / None
        if v is None or (isinstance(v, float) and pd.isna(v)):
            safe[k] = None

        # numpy array -> lista
        elif isinstance(v, np.ndarray):
            safe[k] = v.tolist()

        # pandas Timestamp
        elif hasattr(v, "isoformat"):
            safe[k] = v.isoformat()

        else:
            safe[k] = v

    return safe


def load_curated():
    return pd.read_parquet(CURATED_PATH)


def apply_filters(
    df,
    genres=None,
    themes=None,
    types=None,
    season=None,
    year_min=None,
    year_max=None,
    episodes_min=None,
    episodes_max=None,
    score_min=None,
    score_max=None,
):
    if genres:
        genres = [g.lower() for g in genres]

        df = df[
            df["genres"].apply(
                lambda g: any(
                    x in [item.lower() for item in normalize_list(g)]
                    for x in genres
                )
            )
        ]

    if themes:
        df = df[
            df["themes"].apply(
                lambda t: isinstance(t, list) and any(x in t for x in themes)
            )
        ]

    if types:
        df = df[df["type"].isin(types)]

    if season:
        df = df[df["season"].isin(season)]

    if year_min is not None:
        df = df[df["year"] >= year_min]

    if year_max is not None:
        df = df[df["year"] <= year_max]

    if episodes_min is not None:
        df = df[df["episodes"] >= episodes_min]

    if episodes_max is not None:
        df = df[df["episodes"] <= episodes_max]

    if score_min is not None:
        df = df[df["score"] >= score_min]

    if score_max is not None:
        df = df[df["score"] <= score_max]


    return df


def apply_sort(df, order_by, order_dir):
    ascending = order_dir == "asc"

    if order_by not in df.columns:
        order_by = "rank"

    return df.sort_values(order_by, ascending=ascending, na_position="last")

def compute_metrics(df):
    return {
        "total_animes": len(df),
        "avg_score": to_json_safe(round(df["score"].mean(), 2)),
        "median_score": to_json_safe(round(df["score"].median(), 2)),
        "min_score": to_json_safe(df["score"].min()) if df["score"].notna().any() else None,
        "max_score": to_json_safe(df["score"].max()) if df["score"].notna().any() else None,
        "min_year": to_json_safe(int(df["year"].min())) if df["year"].notna().any() else None,
        "max_year": to_json_safe(int(df["year"].max())) if df["year"].notna().any() else None,
    }

def paginate_single(df, page):
    total = len(df)

    if total == 0:
        return None, total

    if page < 1 or page > total:
        return None, total

    return df.iloc[[page - 1]], total


def query_animes(
    genres=None,
    themes=None,
    types=None,
    season=None,
    year_min=None,
    year_max=None,
    episodes_min=None,
    episodes_max=None,
    score_min=None,
    score_max=None,
    order_by="rank",
    order_dir="asc",
    page=1,
):
    
    if isinstance(genres, str):
        genres = [g.strip() for g in genres.split(",")]

    df = load_curated()

    df = apply_filters(
        df,
        genres,
        themes,
        types,
        season,
        year_min,
        year_max,
        episodes_min,
        episodes_max,
        score_min,
        score_max,
    )
    
    df = apply_sort(df, order_by, order_dir)

    metrics = compute_metrics(df)
    anime_df, total = paginate_single(df, page)

    return {
        "metrics": metrics,
        "pagination": {
            "page": page,
            "total": total,
            "has_prev": page > 1,
            "has_next": page < total,
        },
        "anime": (
            None
            if anime_df is None
            else dict_to_json_safe(anime_df.iloc[0].to_dict())
        ),
    }