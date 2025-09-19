import os
import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def gemini_chat(request):
    """
    Proxy endpoint to call Gemini API securely from backend.
    Expects: { "messages": [ { "from": "user", "text": "..." }, ... ] }
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return Response({"error": "Gemini API key not set on server."}, status=500)
    data = request.data
    messages = data.get("messages", [])
    prompt = "\n".join([
        f"{'User' if m.get('from') == 'user' else 'System' if m.get('from') == 'system' else 'Assistant'}: {m.get('text', '')}"
        for m in messages
    ])
    endpoint = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-002:generateContent?key={api_key}"
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    try:
        resp = requests.post(endpoint, json=payload, headers={"Content-Type": "application/json"})
        resp.raise_for_status()
        result = resp.json()
        text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "Sorry, no response from Gemini.")
        return Response({"text": text})
    except Exception as e:
        return Response({"error": str(e), "details": getattr(e, 'response', None) and e.response.text}, status=500)
