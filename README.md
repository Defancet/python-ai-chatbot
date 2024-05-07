# Gemini ChatBot

Gemini ChatBot is a conversational AI implemented in Python and React that uses a generative AI model to handle user
interactions.

## Configuration

Ensure you have a valid API key for Gemini AI services. Place this key in a `credentials.ini` file under the root
directory.

Example structure of `credentials.ini`:

```ini
[gemini_ai]
API_KEY = your_api_key_here
```

## Setup

1. Create and activate a Python virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install the required Python packages:

```bash
pip install -r requirements.txt
```

## Usage

### Start Backend Server

Run the Python backend with the following command:

```bash
python3 app.py
```

### Start Frontend Server

In another terminal, navigate to the `gemini-chatbot-ui` directory and start the React application:

```bash
cd gemini-chatbot-ui
npm start
```
