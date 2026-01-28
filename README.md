# Anime Dashboard

Projeto de engenharia de dados + web para análise de animes usando a API Jikan (MyAnimeList).

## Arquitetura

- Ingestion → Raw
- Processed
- Curated
- Query Layer (Pandas)
- API REST (Django + DRF)
- Dashboard Web

## Funcionalidades

- Filtros combinados (genre, theme, type, year, score)
- Métricas agregadas
- Navegação anime a anime (1/N)
- API desacoplada do front

## Stack

- Python
- Pandas
- Django
- Django REST Framework
- Parquet
