# Keyspace — JWT Authentication

A small full-stack authentication demo with an Express API and React interface. Create an account, sign in, and send the issued JSON Web Token to a protected route.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

1. In this folder, install the dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set `JWT_SECRET` to a random value of at least 32 characters. For example:

   ```env
   PORT=4000
   JWT_SECRET=use-a-long-random-secret-of-at-least-32-characters
   ```

3. Start the API and React development server:

   ```bash
   npm run dev
   ```

4. Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

The Vite development server proxies `/register`, `/login`, and `/protected` to the Express API on port 4000.

## API

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/register` | Create an account with `{ "username": "...", "password": "..." }` |
| `POST` | `/login` | Validate credentials and return a signed JWT |
| `GET` | `/protected` | Return private data when sent `Authorization: Bearer <token>` |

Usernames are 3–24 characters and accept letters, numbers, and underscores. Passwords must be 8–72 characters. Passwords are hashed with bcrypt before storage. Tokens expire after one hour.

## Production build

Run `npm run build` to create the frontend bundle in `dist/`. `npm start` starts only the API; the static frontend and API must be deployed separately.

## Deploy to GitHub Pages and Render

This project includes a GitHub Actions Pages workflow and a Render Blueprint for the Express API. GitHub Pages hosts static files only; it cannot run the Express server.

1. Create a GitHub repository named `keyspace-jwt-auth` and push this project to its `main` branch.
2. In the repository, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source.
3. In Render, create a new Blueprint from the repository and apply `render.yaml`. Render generates a `JWT_SECRET` and restricts browser API access to this project’s Pages origin.
4. Copy the API service’s public URL from Render. In GitHub, open **Settings → Secrets and variables → Actions → Variables**, create `VITE_API_BASE_URL`, and set its value to that URL (for example, `https://keyspace-jwt-api.onrender.com`, without a trailing slash).
5. Re-run the **Deploy frontend to GitHub Pages** workflow from the repository’s **Actions** tab. Future pushes to `main` deploy automatically.

The Pages site is `https://prateek2302.github.io/keyspace-jwt-auth/`. The first Render Blueprint setup requires your Render account to authorize access to the GitHub repository. Render’s free service may sleep when idle; its first request after sleeping can take a short time.

## Demo limitations

The required user array is in memory, so accounts are removed when the API process restarts and this demo is not suitable for production. The browser stores the JWT in local storage as requested; for a production authentication system, prefer secure, HTTP-only cookies and persistent storage with additional protections such as rate limiting and HTTPS.
