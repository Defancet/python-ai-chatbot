# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from configparser import ConfigParser
from chatbot import ChatBot

app = Flask(__name__)
CORS(app)

config = ConfigParser()
config.read('credentials.ini')
api_key = config['gemini_ai']['API_KEY']

chatbot = ChatBot(api_key=api_key)
chatbot.start_conversation()


@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('message', '')
    try:
        response = chatbot.send_prompt(user_input)
        return jsonify({"response": response}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/')
def home():
    return "Gemini ChatBot API"


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
