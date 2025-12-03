 



// export async function POST(req: Request) {
//   try {
//     const { prompt } = await req.json();

//     if (!prompt) {
//       return new Response(JSON.stringify({ error: "Prompt is required" }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" },
//       });
//     }

//     const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
//       },
//       body: JSON.stringify({
//         model: "llama3-8b-8192", // or use "mixtral-8x7b-32768"
//         messages: [
//           {
//             role: "system",
//             content: "You generate valid SVG shape markup only. No explanation. Output starts directly with <svg>.",
//           },
//           {
//             role: "user",
//             content: `Create an SVG shape: ${prompt}`,
//           },
//         ],
//         temperature: 0.5,
//         max_tokens: 500,
//       }),
//     });

//     if (!groqResponse.ok) {
//       const errorText = await groqResponse.text();
//       console.error("Groq API error:", errorText);
//       throw new Error("Failed to get a response from Groq.");
//     }

//     const data = await groqResponse.json();
//     const svg = data?.choices?.[0]?.message?.content?.trim() || "";

//     return new Response(JSON.stringify({ svg }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error: any) {
//     console.error("Groq Error:", error);

//     // Return fallback SVG
//     return new Response(
//       JSON.stringify({
//         svg: `<svg width="100" height="100">
//                 <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
//               </svg>`,
//         error: "Groq failed or network error.",
//       }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }

// export async function GET() {
//   return new Response(JSON.stringify({ error: "Method not allowed" }), {
//     status: 405,
//     headers: { "Content-Type": "application/json" },
//   });
// }








export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Only return valid SVG markup. No explanation. Start directly with <svg>.\n" +
                    `Generate SVG for: ${prompt}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const err = await geminiResponse.text();
      console.error("Gemini error:", err);
      throw new Error("Gemini generation failed");
    }

    const data = await geminiResponse.json();
    let raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    
    const svg = raw
      .replace(/```svg/g, "")
      .replace(/^(svg|xml)\n/, '')
      .replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '')
      .replace(/```/g, "")
      .trim();

    return new Response(JSON.stringify({ svg }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Gemini Error:", error);

    return new Response(
      JSON.stringify({
        svg: `<svg width="100" height="100">
                <circle cx="50" cy="50" r="40" fill="yellow"/>
              </svg>`,
        error: "Gemini failed or network error.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
