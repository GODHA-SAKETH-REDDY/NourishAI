Deploying NourishAI (React frontend + Django backend)
===============================================

This README explains two recommended deployment approaches:

1) Single-container approach (Docker) — builds React and runs Django+Gunicorn (good for Render, Docker Hub, ECS).
2) Split approach — frontend on Vercel/Netlify, backend on Render/Railway (fast CDN, separate scaling).

Prerequisites
-------------
- Docker installed (for single-container deploy)
- A host (Render, Railway, DigitalOcean, or your own VPS)

Single-container (Docker) — quick steps
-------------------------------------
Build locally and run:

```powershell
# From repo root
docker build -t nourishai:latest .

# Run a container (expose port 8000 locally)
docker run -e DJANGO_DEBUG=False -e DJANGO_ALLOWED_HOSTS="localhost 127.0.0.1" -e SECRET_KEY="your-secret" -p 8000:8000 nourishai:latest

# Then open http://localhost:8000
```

Notes for PaaS (Render, Railway, etc.)
-------------------------------------
- On Render you can either use the Docker option (point to repo Dockerfile), or use a Web Service with the Build and Start commands below.

Build command (non-Docker Render):
```
pip install -r backend/requirements.txt
cd frontend
npm ci
npm run build
cd ..
python backend/manage.py collectstatic --noinput
```

Start command:
```
gunicorn nutritionist_backend.wsgi --bind 0.0.0.0:$PORT
```

Environment variables to set on the host
--------------------------------------
- DJANGO_DEBUG=False
- DJANGO_ALLOWED_HOSTS=your-domain.com (space-separated)
- SECRET_KEY=(a secure random key)
- DATABASE_URL (if you use a managed database; otherwise SQLite will be used but note many PaaS have ephemeral filesystems)

Split deployment (frontend CDN + backend API)
--------------------------------------------
1. Deploy `frontend` to Vercel or Netlify. Configure build: `npm ci && npm run build`, publish directory: `build`.
2. Deploy `backend` to Render/Railway. Set CORS_ORIGINS or DJANGO_ALLOWED_HOSTS to your frontend domain.

Security & production checklist
------------------------------
- Don't use SQLite for production. Configure Postgres and set `DATABASE_URL`.
- Set `DEBUG=False` and `SECRET_KEY` to a secure value in host env.
- Restrict CORS to only your frontend domain.

If you want, I can:
- Build and run the Docker image locally for you now.
- Prepare a Render service configuration (yaml) or GitHub Actions workflow to build and push images automatically.

Automated GitHub Actions deployments (what I added)
-------------------------------------------------
I added two GitHub Actions workflows and a Vercel config to automate deployments when you push to `main`:

- `./.github/workflows/deploy-frontend-vercel.yml` — builds the React `frontend` and deploys to Vercel using the Vercel Action.
- `./.github/workflows/deploy-backend-render.yml` — builds a Docker image for the whole repo, pushes it to Docker Hub, and triggers a Render deploy using the pushed image.
- `./frontend/vercel.json` — small Vercel config to route SPA paths to `index.html`.

What you must do to enable CI/CD (steps)
---------------------------------------
1) Push this repository to GitHub (if not already).
2) In the repository Settings → Secrets → Actions, add these secrets:

	For Vercel (frontend):
	- `VERCEL_TOKEN` — Vercel personal token (Account > Tokens)
	- `VERCEL_ORG_ID` — Organization ID (from Vercel dashboard or API)
	- `VERCEL_PROJECT_ID` — Project ID (from Vercel dashboard or API)

	For backend (Render):
	- `DOCKERHUB_USERNAME` — Docker Hub username used to push images
	- `DOCKERHUB_TOKEN` — Docker Hub access token (or password)
	- `RENDER_API_KEY` — Render API key (Account > API Keys)
	- `RENDER_SERVICE_ID` — The Render Service ID for your backend service

3) Configure a Render service (if you prefer Render autodeploy from repo) or create a Render Web Service and note its `Service ID`:
	 - Option A (recommended): In Render, create a new Web Service, connect your GitHub repo, choose `main` branch and set it to build with the `Dockerfile` in your repo.
	 - Option B: Use the GitHub Action I added — it will push a Docker image to Docker Hub and call the Render deploy API. You must create a Render service that accepts deployment from the image and copy its Service ID to `RENDER_SERVICE_ID`.

4) (Optional) Set `SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, and any DB credentials as environment variables in your Render service or GitHub repo, as appropriate.

How the flow works after you add secrets
---------------------------------------
- Push to `main`.
- GitHub Action `deploy-frontend-vercel` runs, builds the frontend, and deploys to Vercel.
- GitHub Action `deploy-backend-render` runs, builds a Docker image, pushes it to Docker Hub, and triggers a Render deploy using the image.

Limitations and next steps I can do for you
-------------------------------------------
- I can't call Vercel or Render APIs from this environment to create projects or upload tokens for you — those steps require your account access. The workflows I added will run automatically when you add the secrets in GitHub and push.
- If you want, I can also:
	- Run a local Docker build and test the container on your machine now.
	- Help you generate a Vercel token and show the exact API calls/CLI commands to find `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`.
	- Prepare a `render.yaml` or a Render dashboard step-by-step if you prefer to use Render's repo integration instead of the Docker/image flow.

