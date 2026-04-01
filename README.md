# 🎌 Anime Dashboard

Dashboard web interativo para exploração, filtragem e análise de dados de animes, construído com **Django + Pandas** no back-end e **HTML, CSS e JavaScript puro** no front-end.

O projeto consome uma base curada de animes em formato **Parquet**, aplica filtros dinâmicos via API REST e exibe os resultados em uma interface simples, responsiva e funcional.

🌐 **Acesse a aplicação online:**  
👉 https://anime-dashboard-npgv.onrender.com/

---

## 🚀 Funcionalidades

- 🔎 **Filtros dinâmicos**
  - Gênero
  - Tipo (TV, Movie, OVA, etc.)
  - Temporada
  - Ano (intervalo)
  - Nota (score mínimo)

- 📊 **Métricas agregadas**
  - Total de animes filtrados
  - Score médio
  - Intervalo de anos disponíveis

- ⏳ **Estados de UI**
  - Loading durante requisições
  - Estado vazio quando nenhum anime é encontrado

- 📦 **API REST**
  - Endpoint único com filtros via query params
  - Respostas em JSON
  - Backend desacoplado do front-end

## 🛠️ Tecnologias Utilizadas

### Back-end
- **Python 3.13**
- **Django**
- **Django REST Framework**
- **Pandas**
- **NumPy**
- **PyArrow** (leitura de Parquet)
- **Gunicorn**
- **WhiteNoise** (static files em produção)

### Front-end
- **HTML5**
- **CSS3**
- **JavaScript (Vanilla)**

## 💻 Executando localmente

```bash
git clone https://github.com/Douglas-L-A/anime_dashboard.git
cd anime_dashboard

python -m venv .venv
source .venv/bin/activate  # Linux / Mac
.venv\Scripts\activate     # Windows

pip install -r webapp/requirements.txt
python webapp/manage.py collectstatic
python webapp/manage.py runserver
