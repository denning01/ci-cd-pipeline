# node-app

A simple Node.js app with a CI/CD pipeline built on GitHub Actions.

## Endpoints

| Route       | Response                                                      |
|-------------|---------------------------------------------------------------|
| `/`         | HTML "Hello from Node!" page                                  |
| `/api/time` | Current time in UTC, e.g. `{"time":"Wed, 11 Nov 2026 12:15:54 GMT"}` |
| anything else | `404 {"error":"Not found"}`                                 |

## Running locally

```bash
npm start        # starts the server on http://localhost:8080
npm test         # runs the tests
```

The port can be changed with the `PORT` environment variable, e.g. `PORT=3000 npm start`.

## How the CI/CD pipeline works

The pipeline is defined in [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) and runs on GitHub Actions.

### When it runs

| Event                          | What runs                     |
|--------------------------------|-------------------------------|
| Push to any branch             | **CI** only (tests)           |
| Pull request into `main`       | **CI** only (tests)           |
| Push / merge into `main`       | **CI**, then **CD** (publish) |

### Stage 1 — CI (`test` job)

1. Checks out the code.
2. Installs Node.js 24.
3. Runs `npm install`.
4. Runs `npm test`, which starts the server on a random port and checks that:
   - `/` returns 200 with the Hello page,
   - `/api/time` returns 200 with a valid UTC time,
   - an unknown route returns 404.

If any test fails, the pipeline stops and nothing is deployed. On a pull request the result is shown as a check on the PR.

### Stage 2 — CD (`deploy` job)

Runs only after the tests pass, and only for pushes to `main`.

1. Logs in to the GitHub Container Registry (`ghcr.io`) using the built-in `GITHUB_TOKEN` — no secrets need to be configured.
2. Builds a Docker image from the [`Dockerfile`](Dockerfile) (Node 24 Alpine, runs as a non-root user on port 8080).
3. Pushes the image with two tags:
   - `ghcr.io/denning01/ci-cd-pipeline:latest` — always the newest build
   - `ghcr.io/denning01/ci-cd-pipeline:<commit-sha>` — a fixed version for each commit, useful for rollbacks

### Typical workflow

```text
push to a branch ──► tests run on every push
       │
       ▼
open PR to main ──► tests run on the PR
                                              │
                                     merge if green
                                              ▼
                              tests run again on main
                                              │
                                              ▼
                         Docker image built & pushed to ghcr.io
```

Progress and logs for every run are in the repository's **Actions** tab.

### Running the published image

```bash
docker run -p 8080:8080 ghcr.io/denning01/ci-cd-pipeline:latest
```

New packages on GHCR are private by default; make it public under your GitHub profile → **Packages** → package settings, or run `docker login ghcr.io` first.
