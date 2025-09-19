// Call Gemini API for chat completion
export async function fetchLLMResponse(messages) {
  // Call backend Gemini proxy endpoint
  const endpoint = "/gemini-chat/";
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch Gemini response: ${res.status} ${errText}`);
  }
  const data = await res.json();
  return data.text || "Sorry, I couldn't get a response from Gemini AI.";
}
