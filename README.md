# Anime Data Pipeline

Projeto de portfólio que implementa um pipeline de dados utilizando uma API pública de animes,
com armazenamento em camadas (raw, processed, curated) e consumo via uma aplicação web em Django.

## Arquitetura

- Ingestão: API pública de animes (Jikan)
- Raw: JSON bruto da API
- Processed: dados limpos e normalizados
- Curated: dados prontos para consumo analítico
- WebApp: Django consumindo apenas a camada curated

## Tecnologias

- Python
- Pandas
- Django
- Requests
