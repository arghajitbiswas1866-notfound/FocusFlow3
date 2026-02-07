Netlify / GitHub Actions Quick Guide

Overview
- This project is a static site. Netlify can deploy it directly from the repository root (no build required).
- The included GitHub Actions workflow will validate HTML and deploy to Netlify on pushes to the `main` branch.

Quick setup
1. Create a Git repository (GitHub) and push this project.
2. Create a site on Netlify (recommended: "New site from Git") and connect it to your repo OR use the GitHub Actions workflow below.

Using the GitHub Actions workflow
1. In GitHub, go to your repository Settings → Secrets → Actions and add two secrets:
   - `NETLIFY_AUTH_TOKEN` — a personal access token from Netlify (User settings → Applications → Personal access tokens).
   - `NETLIFY_SITE_ID` — find this in your Netlify Site Settings → Site information (or call the API).
2. Confirm your default branch is `main`. If not, edit `.github/workflows/netlify-deploy.yml` and change the branch name.
3. Push to `main` — the workflow will run automatically and deploy the site to Netlify.

Manual Netlify setup (alternate)
- If you prefer Netlify's UI: connect the repo and set the **Publish directory** to `./` and **Build command** left blank.

Notes & troubleshooting
- The workflow runs `npx html-validate "**/*.html"` and will fail the run if the validator finds errors; fix those errors or relax the validator if needed.
- If the deploy fails, check Actions logs in GitHub for exact error output and the Netlify deploy logs in the Netlify UI.

Testing locally
- Serve the site locally with `python -m http.server 8080` and open `http://localhost:8080`.

Need help obtaining the Netlify token or site ID? I can walk you through the exact UI steps and create a temporary test deploy for you.