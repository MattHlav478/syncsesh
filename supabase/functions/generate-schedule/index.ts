import "https://deno.land/std@0.223.0/dotenv/load.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

Deno.serve(async (req) => {
  // Allow CORS preflight (OPTIONS) request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    if (!OPENAI_API_KEY) {
      return new Response("OpenAI API key is not configured.", { status: 500 });
    }

    const { eventType, responses } = await req.json();

    if (!eventType || !responses) {
      return new Response("Missing eventType or responses", { status: 400 });
    }

  const prompt = `
You are an expert event planner.

Based on the provided event information below, generate a detailed and realistic 3-day event schedule.

⚡ Important: RETURN ONLY STRUCTURED JSON in the following format:

[
  {
    "day": "Day 1: (example: October 12)",
    "activities": [
      {
        "time": "(example: 7:30AM - 9:00AM)",
        "title": "(activity title)",
        "notes": "(short notes about the activity)"
      },
      ...
    ]
  },
  ...
]

Event Type: ${eventType}

Event Details:
${Object.entries(responses)
  .map(([key, value]) => `- ${key.replace(/_/g, " ")}: ${value}`)
  .join("\n")}
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a highly skilled event planning assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      }),
    });

    const { choices } = await openaiResponse.json();
    const generatedSchedule = choices?.[0]?.message?.content || "No schedule generated.";

    return new Response(JSON.stringify({ schedule: generatedSchedule }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error) {
    console.error(error);
    return new Response("Error processing request", {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
