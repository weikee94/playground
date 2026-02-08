import os
import sqlite3
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")


# --- Database helpers ---

def get_conn():
    if DATABASE_URL.startswith("postgresql"):
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        return conn
    # SQLite for local dev
    conn = sqlite3.connect("todos.db")
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_conn()
    cur = conn.cursor()
    if DATABASE_URL.startswith("postgresql"):
        cur.execute("""
            CREATE TABLE IF NOT EXISTS todos (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                title TEXT NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)
    else:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS todos (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                completed INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
    conn.close()


# --- Pydantic models ---

class TodoCreate(BaseModel):
    title: str = Field(..., max_length=200)


class TodoOut(BaseModel):
    id: str
    title: str
    completed: bool
    created_at: str


# --- App ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Python Todo API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

api = FastAPI(title="Python Todo API", version="0.1.0")


def row_to_todo(row) -> dict:
    if isinstance(row, dict):
        return {
            "id": str(row["id"]),
            "title": row["title"],
            "completed": bool(row["completed"]),
            "created_at": str(row["created_at"]),
        }
    # sqlite3.Row
    return {
        "id": row["id"],
        "title": row["title"],
        "completed": bool(row["completed"]),
        "created_at": row["created_at"],
    }


@api.get("/todos", response_model=list[TodoOut], summary="List all todos")
def list_todos():
    conn = get_conn()
    cur = conn.cursor()
    if DATABASE_URL.startswith("postgresql"):
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM todos ORDER BY created_at DESC")
    rows = cur.fetchall()
    conn.close()
    return [row_to_todo(r) for r in rows]


@api.post("/todos", response_model=TodoOut, status_code=201, summary="Create a new todo")
def create_todo(body: TodoCreate):
    conn = get_conn()
    cur = conn.cursor()
    todo_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    if DATABASE_URL.startswith("postgresql"):
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "INSERT INTO todos (id, title, completed) VALUES (%s, %s, FALSE) RETURNING *",
            (todo_id, body.title),
        )
        row = cur.fetchone()
    else:
        cur.execute(
            "INSERT INTO todos (id, title, completed, created_at) VALUES (?, ?, 0, ?)",
            (todo_id, body.title, now),
        )
        conn.commit()
        cur.execute("SELECT * FROM todos WHERE id = ?", (todo_id,))
        row = cur.fetchone()

    conn.close()
    return row_to_todo(row)


@api.patch("/todos/{id}", response_model=TodoOut, summary="Toggle a todo's completed status")
def toggle_todo(id: str):
    conn = get_conn()
    cur = conn.cursor()

    if DATABASE_URL.startswith("postgresql"):
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(
            "UPDATE todos SET completed = NOT completed WHERE id = %s RETURNING *",
            (id,),
        )
        row = cur.fetchone()
    else:
        cur.execute("UPDATE todos SET completed = NOT completed WHERE id = ?", (id,))
        conn.commit()
        cur.execute("SELECT * FROM todos WHERE id = ?", (id,))
        row = cur.fetchone()

    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Todo not found")
    return row_to_todo(row)


@api.delete("/todos/{id}", response_model=dict, summary="Delete a todo")
def delete_todo(id: str):
    conn = get_conn()
    cur = conn.cursor()

    if DATABASE_URL.startswith("postgresql"):
        cur.execute("DELETE FROM todos WHERE id = %s RETURNING id", (id,))
        row = cur.fetchone()
    else:
        cur.execute("SELECT id FROM todos WHERE id = ?", (id,))
        row = cur.fetchone()
        cur.execute("DELETE FROM todos WHERE id = ?", (id,))
        conn.commit()

    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"id": id}


app.mount("/api", api)
