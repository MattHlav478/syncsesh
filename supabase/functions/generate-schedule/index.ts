import "https://deno.land/std@0.223.0/dotenv/load.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    const url = new URL(req.url);

    // === 🧠 FULL SCHEDULE GENERATION ===
    if (req.method === "POST" && url.pathname === "/") {
      const { eventType, responses } = await req.json();

      if (!eventType || !responses) {
        return new Response("Missing eventType or responses", { status: 400 });
      }

      // Estimate number of days from date string like "October 12–14"
      const dateRange = responses.dates_duration || "";
      const daysMatch = dateRange.match(/\b(\d{1,2})\b/g);
      const numDays = daysMatch && daysMatch.length >= 2
        ? parseInt(daysMatch[1]) - parseInt(daysMatch[0]) + 1
        : 3;

      const prompt = `
You are an expert event planner.

Create a realistic ${numDays}-day schedule in this JSON format:

[
  {
    "day": "Day 1: October 12",
    "activities": [
      {
        "time": "7:30AM - 9:00AM",
        "title": "Breakfast",
        "notes": "Vegetarian options available"
      }
    ]
  }
]

ONLY return valid JSON — no extra text or explanation.

Event Type: ${eventType}

Details:
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
            { role: "system", content: "You are a highly skilled event planning assistant. Return only JSON." },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      });

      const { choices } = await openaiResponse.json();
      const generatedSchedule = choices?.[0]?.message?.content || "[]";

      return new Response(JSON.stringify({ schedule: generatedSchedule }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // === 🔁 REGENERATE A SINGLE ACTIVITY ===
    if (req.method === "POST" && url.pathname === "/regenerate-activity") {
      const { eventType, responses, dayIndex, activityIndex } = await req.json();

      if (
        eventType == null ||
        !responses ||
        typeof dayIndex !== "number" ||
        typeof activityIndex !== "number"
      ) {
        return new Response("Missing required fields", { status: 400 });
      }

      const prompt = `
You are an expert event planner.

Regenerate one activity only. Format:

{
  "time": "7:30AM - 9:00AM",
  "title": "Breakfast",
  "notes": "Vegetarian options available"
}

ONLY return valid JSON. No explanation. No other text.

Event Type: ${eventType}

Details:
${Object.entries(responses)
  .map(([key, value]) => `- ${key.replace(/_/g, " ")}: ${value}`)
  .join("\n")}

Target:
- Day Index: ${dayIndex}
- Activity Index: ${activityIndex}
`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You return only strict JSON. No extra text." },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        }),
      });

      const result = await response.json();
      const activity = JSON.parse(result?.choices?.[0]?.message?.content || "{}");

      return new Response(JSON.stringify({ activity }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Fallback 404
    return new Response("Not found", {
      status: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Server error:", err);
    return new Response("Internal server error", {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
