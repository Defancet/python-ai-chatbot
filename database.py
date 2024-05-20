# database.py
import sqlite3
from contextlib import closing

DATABASE = 'chatbot.db'


def create_tables():
    with closing(sqlite3.connect(DATABASE)) as conn, conn, closing(conn.cursor()) as cursor:
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                name TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                role TEXT,
                text TEXT,
                FOREIGN KEY (session_id) REFERENCES sessions (id)
            )
        ''')
        conn.commit()


def add_session(session_id, session_name):
    with closing(sqlite3.connect(DATABASE)) as conn, conn, closing(conn.cursor()) as cursor:
        cursor.execute('INSERT INTO sessions (id, name) VALUES (?, ?)', (session_id, session_name))
        conn.commit()


def get_sessions():
    with closing(sqlite3.connect(DATABASE)) as conn, conn, closing(conn.cursor()) as cursor:
        cursor.execute('SELECT id, name FROM sessions')
        return cursor.fetchall()


def add_message(session_id, role, text):
    with closing(sqlite3.connect(DATABASE)) as conn, conn, closing(conn.cursor()) as cursor:
        cursor.execute('INSERT INTO messages (session_id, role, text) VALUES (?, ?, ?)', (session_id, role, text))
        conn.commit()


def get_messages(session_id):
    with closing(sqlite3.connect(DATABASE)) as conn, conn, closing(conn.cursor()) as cursor:
        cursor.execute('SELECT role, text FROM messages WHERE session_id = ?', (session_id,))
        return cursor.fetchall()


def delete_session(session_id):
    with closing(sqlite3.connect(DATABASE)) as conn, conn, closing(conn.cursor()) as cursor:
        cursor.execute('DELETE FROM messages WHERE session_id = ?', (session_id,))
        cursor.execute('DELETE FROM sessions WHERE id = ?', (session_id,))
        conn.commit()


def update_session_name(session_id, new_name):
    with closing(sqlite3.connect(DATABASE)) as conn, conn, closing(conn.cursor()) as cursor:
        cursor.execute('UPDATE sessions SET name = ? WHERE id = ?', (new_name, session_id))
        conn.commit()
