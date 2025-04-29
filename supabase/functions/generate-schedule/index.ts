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
You're an expert event planner. Create a realistic schedule in this exact JSON format:

[
  {
    "day": "Day 1 (e.g. Oct 12)",
    "activities": [
      {
        "time": "e.g. 7:30AM–9:00AM",
        "title": "Activity title",
        "notes": "Brief description"
      }
    ]
  }
]

Event Type: ${eventType}

Details:
${
      Object.entries(responses)
        .map(([k, v]) => `- ${k.replace(/_/g, " ")}: ${v}`)
        .join("\n")
    }
`;

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a highly skilled event planning assistant.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      },
    );

    const { choices } = await openaiResponse.json();
    const generatedSchedule = choices?.[0]?.message?.content ||
      "No schedule generated.";

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
