# Gemini ChatBot

The Gemini ChatBot is a conversational AI implemented in Python, leveraging a generative AI model for handling user
interactions.

## Configuration

Ensure you have a valid API key for Gemini AI services. Place this key in a credentials.ini file under the root
directory.

Example structure of `credentials.ini`:

```ini
[gemini_ai]
API_KEY = your_api_key_here
```

You also need to install the `google-ai-generativelanguage` package to run the chatbot. You can do this by creating a virtual
environment and installing the package as follows:

```bash
py -m venv <your-env>
.\<your-env>\Scripts\activate
pip install google-ai-generativelanguage
```

## Usage

Run the chatbot using the following command:

```bash
python3 app.py
```
