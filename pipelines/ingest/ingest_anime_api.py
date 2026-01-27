import requests
import json
from datetime import datetime
from pathlib import Path
import time

BASE_URL = "https://api.jikan.moe/v4/top/anime"
RAW_DATA_PATH = Path("data/raw")

def fetch_top_anime(max_pages: int | None = None) -> list:
    all_animes = []
    current_page = 1

    while True:
        print(f"Buscando página {current_page}")

        response = requests.get(
            BASE_URL,
            params={
                "page": current_page,
                "limit": 25
            },
            timeout=10
        )
        response.raise_for_status()

        payload = response.json()
        data = payload["data"]
        pagination = payload.get("pagination", {})

        all_animes.extend(data)

        if not pagination.get("has_next_page", False):
            break

        if max_pages is not None and current_page >= max_pages:
            break

        current_page += 1
        time.sleep(1)

    return all_animes
    
def save_raw_data(data: list) -> None:
    RAW_DATA_PATH.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    file_path = RAW_DATA_PATH / f"top_anime_{timestamp}.json"

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Arquivo salvo em: {file_path}")

def main():
    print("Iniciando ingestão de dados da API...")
    animes = fetch_top_anime()
    save_raw_data(animes)
    print(f"Ingestão finalizada. Total de animes: {len(animes)}")

if __name__ == "__main__":
    main()