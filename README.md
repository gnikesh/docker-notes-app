# Notes API

A Dockerized REST API backend for a note-taking app, built with a **microservices architecture**. Two independent Express/MongoDB services — **Notes** and **Notebooks** — sit behind an **Nginx reverse proxy**.

## Architecture

```text
  Client :8080
      │
  ┌───▼────────────┐
  │  Nginx Proxy   │
  └───┬────────┬───┘
      │        │
  /notebooks  /notes
      │        │
  ┌───▼──┐  ┌──▼───┐
  │  nb  │◄─│notes │  (notes validates notebookId via HTTP)
  │  svc │  │  svc │
  └───┬──┘  └──┬───┘
      │         │
  ┌───▼──┐  ┌──▼───┐
  │  nb  │  │notes │
  │  db  │  │  db  │
  └──────┘  └──────┘
```

Each service has its own MongoDB instance on an isolated Docker network.

## Getting Started

**Prerequisites:** Docker with Compose v2

```bash
git clone https://github.com/gnikesh/docker-notes-app.git
cd docker-notes-app
docker compose up --build
```

API available at `http://localhost:8080`.

## API

### Notebooks — `/api/notebooks`

| Method | Endpoint | Body |
| --- | --- | --- |
| `POST` | `/api/notebooks/` | `{ name }` |
| `GET` | `/api/notebooks/` | — |
| `GET` | `/api/notebooks/:id` | — |
| `PUT` | `/api/notebooks/:id` | `{ name?, description? }` |
| `DELETE` | `/api/notebooks/:id` | — |

### Notes — `/api/notes`

| Method | Endpoint | Body |
| --- | --- | --- |
| `POST` | `/api/notes/` | `{ title, content, notebookId? }` |
| `GET` | `/api/notes/` | — |
| `GET` | `/api/notes/:id` | — |
| `PUT` | `/api/notes/:id` | `{ title?, content? }` |
| `DELETE` | `/api/notes/:id` | — |

## Development

Uses Docker Compose Watch for live reload:

```bash
docker compose watch
```

Copy `.env.example` to `.env` in each service directory and set your credentials before running.

## License

[MIT](LICENSE)
