// /api/generate-svg.ts (Next.js API route)
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { prompt } = req.body;

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: "system", content: "You generate simple SVG shape markup." },
            { role: "user", content: `Create an SVG shape: ${prompt}` },
        ],
    });

    const svg = response.choices[0].message.content;
    res.status(200).json({ svg });
}
