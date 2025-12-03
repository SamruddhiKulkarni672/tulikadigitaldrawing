export async function GET() {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models",
    {
      headers: {
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
      },
    }
  );

  const data = await res.json();

  console.log("AVAILABLE MODELS:", data);

  return Response.json(data);
}
