# 🌿 Automated Quiz Engine

An environment-themed trivia quiz application for 4th and 5th grade students. Built with FastAPI, SQLite, and Vanilla JS — fully containerized with Docker and automated via GitHub Actions CI/CD.

---

## Tech Stack

| Layer      | Technology                     |
|------------|-------------------------------|
| Backend    | Python 3.12 + FastAPI          |
| Database   | SQLite (via stdlib `sqlite3`)  |
| Frontend   | Vanilla HTML / CSS / JS        |
| Container  | Docker + Docker Compose        |
| CI/CD      | GitHub Actions                 |

---

## Project Structure

```
automated-quiz-engine/
├── .github/workflows/ci-cd-pipeline.yml
├── backend/
│   ├── app.py          # FastAPI routes
│   ├── database.py     # SQLite helpers + seed data
│   ├── models.py       # Pydantic schemas
│   ├── requirements.txt
│   └── tests/
│       └── test_app.py
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── .gitignore
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## Quick Start

### With Docker (recommended)

```bash
git clone <your-repo-url>
cd automated-quiz-engine
docker compose up --build
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

### Local Development

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Then open `frontend/index.html` in your browser, or visit [http://localhost:8000](http://localhost:8000) to serve it via FastAPI's static file mount.

---

## Running Tests

```bash
cd automated-quiz-engine
pip install -r backend/requirements.txt
pytest backend/tests/test_app.py -v
```

---

## API Reference

| Method | Endpoint                              | Description                        |
|--------|---------------------------------------|------------------------------------|
| GET    | `/api/questions`                      | List all questions (no answers)    |
| GET    | `/api/questions/{id}`                 | Get a single question              |
| POST   | `/api/sessions`                       | Create a new quiz session          |
| POST   | `/api/sessions/{id}/answer`           | Submit an answer, get feedback     |
| GET    | `/api/sessions/{id}/results`          | Get final score and result summary |

Interactive docs are available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd-pipeline.yml`) runs on every push and pull request:

1. **Test** — runs `pytest` against the full test suite
2. **Lint** — runs `flake8` for code quality
3. **Build** — builds the Docker image to verify integrity
4. **Deploy** — on merges to `main`, pushes the image to Docker Hub

### Required GitHub Secrets

| Secret            | Description                  |
|-------------------|------------------------------|
| `DOCKER_USERNAME` | Your Docker Hub username     |
| `DOCKER_PASSWORD` | Your Docker Hub access token |

---

## Seed Data

Five environment trivia questions are seeded on first launch covering:

- **Atmosphere** — Earth's atmospheric composition
- **Energy** — Renewable vs. fossil fuel energy sources
- **Plants** — Photosynthesis
- **Atmosphere** — The ozone layer
- **Water Cycle** — The hydrological cycle

---

## License

MIT
