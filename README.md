# Mergington High School Activities

A small FastAPI and static frontend project for managing extracurricular activities at Mergington High School.

## Project overview

This repository contains a simple web app that lets students browse school activities and sign up using their `@mergington.edu` email address. The backend is built with FastAPI, and the frontend is a lightweight static UI served from the `src/static` folder.

## How I started

- Opened the repository and reviewed the existing files in `src/`
- Found the main FastAPI app in `src/app.py`
- Confirmed the app entry point was under `src` and not at the repo root
- Checked the static frontend files in `src/static/`
- Verified the app imports correctly with `python -c "import app"` from `src`

## What I did

- Added stronger backend validation for signup email addresses
  - Only accepts student emails ending with `@mergington.edu`
  - Rejects invalid email formats
  - Prevents duplicate signups for the same activity
  - Prevents signing up when the activity is full
- Improved the frontend signup flow
  - Added client-side email validation for `@mergington.edu`
  - Displayed clear success and error messages
  - Updated the UI to show activity availability and full status
  - Automatically refreshed the activity list after signup
- Enhanced the app structure and documentation
  - Added direct execution support to `src/app.py`
  - Updated the root README with clear project information and usage instructions

## Outcomes

- The app now rejects invalid or non-school emails
- Students can only sign up with their official Mergington email
- Activities show how many spots remain and whether they are full
- Signups are prevented when duplicate or full
- The repo is committed and pushed to `main`

## How to run the project

```bash
cd /workspaces/GitHub-copilot-MS-learn-/src
uvicorn app:app --reload
```

Then open:

- `http://localhost:8000/docs`
- `http://localhost:8000/static/index.html`

## Files changed

- `src/app.py`
- `src/static/index.html`
- `src/static/app.js`
- `src/static/styles.css`

---

&copy; 2026 Mergington High School Activities Demo

