from flask import Flask, request, jsonify
from flask_cors import CORS
from configparser import ConfigParser
from chatbot import ChatBot
import uuid
import database

app = Flask(__name__)
CORS(app)

config = ConfigParser()
config.read('credentials.ini')
api_key = config['gemini_ai']['API_KEY']

chat_sessions = {}

database.create_tables()


def create_new_chat_session():
    session_id = str(uuid.uuid4())
    session_name = f"Chat {len(database.get_sessions()) + 1}"
    chatbot = ChatBot(api_key=api_key)
    chatbot.start_conversation()
    chat_sessions[session_id] = chatbot
    database.add_session(session_id, session_name)
    return session_id


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    session_id = data.get('session_id')
    user_input = data.get('message', '')

    if session_id not in chat_sessions:
        session_id = create_new_chat_session()

    chatbot = chat_sessions[session_id]
    try:
        response = chatbot.send_prompt(user_input)
        database.add_message(session_id, 'user', user_input)
        database.add_message(session_id, 'bot', response)
        return jsonify({"response": response, "session_id": session_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/chat/new', methods=['POST'])
def new_chat():
    session_id = create_new_chat_session()
    return jsonify({"session_id": session_id}), 200


@app.route('/api/chat/history', methods=['POST'])
def get_history():
    data = request.json
    session_id = data.get('session_id')

    if session_id not in chat_sessions:
        return jsonify({"error": "Session not found"}), 404

    chatbot = chat_sessions[session_id]
    messages = database.get_messages(session_id)
    history = [{'role': role, 'text': text} for role, text in messages]
    return jsonify({"history": history}), 200


@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    sessions = database.get_sessions()
    return jsonify([{'id': session_id, 'name': name} for session_id, name in sessions]), 200


@app.route('/api/chat/delete', methods=['POST'])
def delete_chat():
    data = request.json
    session_id = data.get('session_id')

    if session_id in chat_sessions:
        del chat_sessions[session_id]

    database.delete_session(session_id)
    return jsonify({"message": "Session deleted"}), 200


@app.route('/api/chat/update', methods=['POST'])
def update_chat():
    data = request.json
    session_id = data.get('session_id')
    new_name = data.get('name')

    if session_id not in chat_sessions:
        return jsonify({"error": "Session not found"}), 404

    database.update_session_name(session_id, new_name)
    return jsonify({"message": "Session name updated"}), 200


@app.route('/')
def home():
    return "Gemini ChatBot API"


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
