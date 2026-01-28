import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT_DIR))

from pipelines.query.query_animes import query_animes


def main():
    result = query_animes(
        genres=["Action", "Adventure"],
        score_min=8,
        order_by="score",
        order_dir="desc",
        page=2,
    )

    print("MÉTRICAS")
    for k, v in result["metrics"].items():
        print(f"{k}: {v}")

    print(f"\n🎬 ANIME {result['pagination']['page']} / {result['pagination']['total']}")
    print(result["anime"]["title"])
    print("Score:", result["anime"]["score"])
    print("Ano:", result["anime"]["year"])


if __name__ == "__main__":
    main()