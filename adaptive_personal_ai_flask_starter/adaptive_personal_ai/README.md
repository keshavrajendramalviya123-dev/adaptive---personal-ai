# Adaptive Personal AI — Flask starter

This project follows the supplied architecture: seven frontend pages, one shared `static/js/api.js`, Flask JSON endpoints, SQLite, a rule-based personalization engine, and weekly task analysis.

## Run on Windows (beginner steps)

1. Install Python 3.10 or newer.
2. Extract this ZIP. Open the extracted `adaptive_personal_ai` folder in VS Code.
3. Open VS Code Terminal: **Terminal → New Terminal**.
4. Create a virtual environment:
   ```powershell
   python -m venv venv
   ```
5. Activate it:
   ```powershell
   .\venv\Scripts\activate
   ```
   If PowerShell blocks activation, use Command Prompt terminal and run `venv\Scripts\activate.bat`.
6. Install Flask:
   ```powershell
   pip install -r requirements.txt
   ```
7. Start the app:
   ```powershell
   python app.py
   ```
8. Open this address in Chrome: `http://127.0.0.1:5000`
9. Enter a name/email on the local demo login screen. Add tasks and try the Ask AI page.

## Project map

- `app.py` — Flask routes, SQLite tables, validation, personalization and weekly analysis.
- `templates/` — the seven pages: Login, Dashboard, Profile, Preferences, Ask, Tasks, Reports.
- `static/css/style.css` — responsive dark 3D-inspired UI, glass panels and animations.
- `static/js/api.js` — the only shared frontend API helper.
- `static/js/` — page-specific behavior.

## Important honesty / production notes

- The login in this starter is **demo sign-in**, not Google OAuth. A real Google sign-in needs a Google Cloud OAuth client ID, authorized origins, backend ID-token verification, HTTPS, and production session settings.
- The Ask page uses stored rule-based answer templates. It is **not a generative AI model**. Extend `TEMPLATES` in `app.py`, or later connect a real model through a protected backend API.
- Weekly analysis is SQL counting plus if/else rules, not machine learning.
- Before deployment: set a strong `SECRET_KEY`, disable Flask debug mode, add CSRF protection/rate limits, validate dates, configure secure cookies/HTTPS, and add tests.

## What to learn in order

1. HTML: page structure and forms.
2. CSS: layout, responsive design, gradients, animations.
3. JavaScript: events, `fetch`, JSON and async/await.
4. Python functions and dictionaries.
5. Flask routes and request/response.
6. SQLite CRUD and SQL queries.
7. Authentication and deployment.
