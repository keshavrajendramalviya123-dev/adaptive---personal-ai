from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import sqlite3, os
from datetime import datetime, date, timedelta
from functools import wraps

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-this-development-secret")
DB = os.path.join(os.path.dirname(__file__), "adaptive_ai.db")

def db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with db() as con:
        con.executescript("""
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL, created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS preferences (
          user_id INTEGER PRIMARY KEY, language TEXT DEFAULT 'English',
          difficulty TEXT DEFAULT 'Simple', response_length TEXT DEFAULT 'Detailed',
          explanation_style TEXT DEFAULT 'Examples',
          FOREIGN KEY(user_id) REFERENCES users(id));
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
          title TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'Study',
          deadline TEXT, status TEXT NOT NULL DEFAULT 'Pending',
          created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS feedback (
          id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
          question TEXT NOT NULL, feedback TEXT NOT NULL, created_at TEXT NOT NULL);
        """)
init_db()
def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get("user_id"):
            return jsonify(ok=False, error="Please sign in first."), 401
        return fn(*args, **kwargs)
    return wrapper

@app.route("/")
def index():
    return redirect(url_for("dashboard") if session.get("user_id") else url_for("login"))

@app.route("/login")
def login(): return render_template("login.html")

@app.route("/dashboard")
def dashboard(): return render_template("dashboard.html")
@app.route("/profile")
def profile(): return render_template("profile.html")
@app.route("/preferences")
def preferences(): return render_template("preferences.html")
@app.route("/ask")
def ask(): return render_template("ask.html")
@app.route("/tasks")
def tasks(): return render_template("tasks.html")
@app.route("/reports")
def reports(): return render_template("reports.html")

@app.post("/api/auth/demo")
def demo_login():
    # Local demonstration login only. Replace with verified Google ID-token flow before deployment.
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "Demo Student").strip()[:80]
    email = (data.get("email") or "student@example.com").strip().lower()[:120]
    with db() as con:
        con.execute("INSERT OR IGNORE INTO users(name,email,created_at) VALUES(?,?,?)",
                    (name, email, datetime.now().isoformat(timespec="seconds")))
        user = con.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        con.execute("INSERT OR IGNORE INTO preferences(user_id) VALUES(?)", (user["id"],))
    session["user_id"] = user["id"]
    return jsonify(ok=True, user={"name": user["name"], "email": user["email"]})

@app.post("/api/auth/logout")
def logout():
    session.clear()
    return jsonify(ok=True)

@app.get("/api/me")
@login_required
def me():
    with db() as con:
        u = con.execute("SELECT name,email,created_at FROM users WHERE id=?", (session["user_id"],)).fetchone()
    return jsonify(ok=True, user=dict(u))

@app.get("/api/preferences")
@login_required
def get_preferences():
    with db() as con:
        p = con.execute("SELECT language,difficulty,response_length,explanation_style FROM preferences WHERE user_id=?",
                        (session["user_id"],)).fetchone()
    return jsonify(ok=True, preferences=dict(p))

@app.put("/api/preferences")
@login_required
def save_preferences():
    d = request.get_json(silent=True) or {}
    allowed = {
      "language": {"English","Hindi"},
      "difficulty": {"Simple","Normal","Technical"},
      "response_length": {"Short","Detailed"},
      "explanation_style": {"Examples","Numbered steps"}
    }
    for key, values in allowed.items():
        if d.get(key) not in values:
            return jsonify(ok=False, error=f"Invalid value for {key}."), 400
    with db() as con:
        con.execute("""UPDATE preferences SET language=?,difficulty=?,response_length=?,explanation_style=?
                       WHERE user_id=?""",
                    (d["language"],d["difficulty"],d["response_length"],d["explanation_style"],session["user_id"]))
    return jsonify(ok=True, message="Your preferences have been saved.")

TEMPLATES = {
 "python": "Python is a beginner-friendly programming language. It is used for automation, web development, data science and AI.",
 "database": "A database stores information in an organized way. SQLite is a lightweight relational database that uses tables, rows and columns.",
 "machine learning": "Machine learning is a field of AI where a system learns patterns from data to make predictions or decisions.",
 "flask": "Flask is a lightweight Python web framework. It helps connect browser pages to Python routes and APIs."
}
def personalize(question, pref):
    q = question.lower()
    answer = next((v for k,v in TEMPLATES.items() if k in q),
                  "I do not have a stored answer template for this topic yet. Add a matching topic template in TEMPLATES inside app.py.")
    if pref["language"] == "Hindi":
        translations = {
          "Python is a beginner-friendly programming language. It is used for automation, web development, data science and AI.": "Python ek beginner-friendly programming language hai. Iska use automation, web development, data science aur AI mein hota hai.",
          "A database stores information in an organized way. SQLite is a lightweight relational database that uses tables, rows and columns.": "Database information ko organized form mein store karta hai. SQLite ek lightweight relational database hai jo tables, rows aur columns use karta hai.",
          "Machine learning is a field of AI where a system learns patterns from data to make predictions or decisions.": "Machine learning, AI ka field hai jahan system data se patterns seekhkar predictions ya decisions leta hai.",
          "Flask is a lightweight Python web framework. It helps connect browser pages to Python routes and APIs.": "Flask ek lightweight Python web framework hai. Ye browser pages ko Python routes aur APIs se connect karta hai."
        }
        answer = translations.get(answer, answer)
    if pref["difficulty"] == "Simple":
        answer = answer.replace("relational", "table-based").replace("predictions or decisions", "guesses or decisions")
    if pref["response_length"] == "Short":
        answer = answer.split(".")[0] + "."
    if pref["explanation_style"] == "Numbered steps":
        answer = "1. Understand the main idea.\\n2. " + answer
    elif pref["explanation_style"] == "Examples":
        answer += "\\n\\nExample: Ask a specific question such as “What is Python?” to get a focused explanation."
    return answer

@app.post("/api/questions/ask")
@login_required
def question_ask():
    d = request.get_json(silent=True) or {}
    question = (d.get("question") or "").strip()
    if not question: return jsonify(ok=False, error="Please enter a question."), 400
    if len(question) > 1000: return jsonify(ok=False, error="Maximum question length is 1000 characters."), 400
    with db() as con:
        p = con.execute("SELECT * FROM preferences WHERE user_id=?", (session["user_id"],)).fetchone()
    return jsonify(ok=True, answer=personalize(question, p))

@app.post("/api/feedback")
@login_required
def feedback():
    d = request.get_json(silent=True) or {}
    question, rating = (d.get("question") or "").strip(), d.get("feedback")
    if not question or rating not in {"Helpful","Not helpful"}:
        return jsonify(ok=False,error="Feedback details are missing."), 400
    with db() as con:
        con.execute("INSERT INTO feedback(user_id,question,feedback,created_at) VALUES(?,?,?,?)",
                    (session["user_id"],question,rating,datetime.now().isoformat(timespec="seconds")))
    return jsonify(ok=True,message="Thanks for your feedback.")

@app.get("/api/tasks")
@login_required
def list_tasks():
    with db() as con:
        rows = con.execute("SELECT * FROM tasks WHERE user_id=? ORDER BY deadline IS NULL, deadline",
                           (session["user_id"],)).fetchall()
    return jsonify(ok=True,tasks=[dict(r) for r in rows])

@app.post("/api/tasks")
@login_required
def add_task():
    d=request.get_json(silent=True) or {}
    title=(d.get("title") or "").strip()
    if not title: return jsonify(ok=False,error="Task title is required."),400
    if len(title)>120: return jsonify(ok=False,error="Task title must be under 120 characters."),400
    category=(d.get("category") or "Study").strip()[:40]
    deadline=d.get("deadline") or None
    with db() as con:
        cur=con.execute("INSERT INTO tasks(user_id,title,category,deadline,created_at) VALUES(?,?,?,?,?)",
                        (session["user_id"],title,category,deadline,datetime.now().isoformat(timespec="seconds")))
        task=con.execute("SELECT * FROM tasks WHERE id=?",(cur.lastrowid,)).fetchone()
    return jsonify(ok=True,task=dict(task))

@app.put("/api/tasks/<int:task_id>")
@login_required
def update_task(task_id):
    d=request.get_json(silent=True) or {}
    status=d.get("status")
    if status not in {"Pending","Done"}: return jsonify(ok=False,error="Status must be Pending or Done."),400
    with db() as con:
        cur=con.execute("UPDATE tasks SET status=? WHERE id=? AND user_id=?",(status,task_id,session["user_id"]))
    if not cur.rowcount: return jsonify(ok=False,error="Task not found."),404
    return jsonify(ok=True)

@app.delete("/api/tasks/<int:task_id>")
@login_required
def delete_task(task_id):
    with db() as con:
        cur=con.execute("DELETE FROM tasks WHERE id=? AND user_id=?",(task_id,session["user_id"]))
    if not cur.rowcount: return jsonify(ok=False,error="Task not found."),404
    return jsonify(ok=True)

@app.get("/api/analysis/weekly")
@login_required
def weekly_analysis():
    start=(date.today()-timedelta(days=date.today().weekday())).isoformat()
    with db() as con:
        rows=con.execute("SELECT * FROM tasks WHERE user_id=? AND date(created_at)>=date(?)",
                         (session["user_id"],start)).fetchall()
    total=len(rows); done=sum(r["status"]=="Done" for r in rows)
    pending=[dict(r) for r in rows if r["status"]=="Pending"]
    by={}
    for r in rows:
        by.setdefault(r["category"],[0,0])
        by[r["category"]][1]+=1
        if r["status"]=="Done": by[r["category"]][0]+=1
    weak=[k for k,(d,t) in by.items() if t-d>=2 or (t and d/t<.5)]
    tips=["Start with one small pending task today.","Break large tasks into 25-minute focus sessions."]
    if not total: tips=["Add your first task to start building your weekly report."]
    return jsonify(ok=True,report={"total":total,"done":done,"pending":len(pending),
      "completion":round(done/total*100) if total else 0,"weak_areas":weak,"pending_tasks":pending,"tips":tips})

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
