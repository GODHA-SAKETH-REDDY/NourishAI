
import os
import requests
from dotenv import load_dotenv


def list_gemini_models():
    # Load .env file from backend directory
    load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Gemini API key not set.")
        return
    endpoint = f"https://generativelanguage.googleapis.com/v1/models?key={api_key}"
    try:
        resp = requests.get(endpoint)
        resp.raise_for_status()
        print("Available models:")
        print(resp.json())
    except Exception as e:
        print(f"Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(e.response.text)

if __name__ == "__main__":
    list_gemini_models()
