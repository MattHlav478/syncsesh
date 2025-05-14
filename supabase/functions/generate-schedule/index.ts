import "https://deno.land/std@0.223.0/dotenv/load.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

Deno.serve(async (req) => {
  const url = new URL(req.url);

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (!OPENAI_API_KEY) {
    return new Response("Missing API key", {
      status: 500,
      headers: corsHeaders,
    });
  }

  try {
    if (url.pathname === "/regenerate-activity") {
      const { activity, prompt, day } = await req.json();

      const userPrompt = `
You are an expert event planner.

You're given a specific event agenda item and the user's custom request for how to regenerate it.

Return ONLY the modified activity object as JSON like this:
{
  "time": "...",
  "title": "...",
  "notes": "..."
}

Event day: ${day}

Original activity:
- time: ${activity.time}
- title: ${activity.title}
- notes: ${activity.notes}

User wants: ${prompt}
`;

      const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a highly skilled event planner.",
            },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
        }),
      });

      const { choices } = await gptRes.json();
      const content = choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);

      return new Response(JSON.stringify({ activity: parsed }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Default "/" route for schedule generation
    const { eventType, responses } = await req.json();

    let estimatedDays = 1;
    let readableDateRange = "";

    if (
      typeof responses?.dates_duration === "object" &&
      responses.dates_duration?.startDate &&
      responses.dates_duration?.endDate
    ) {
      const start = new Date(responses.dates_duration.startDate);
      const end = new Date(responses.dates_duration.endDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        estimatedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const options: Intl.DateTimeFormatOptions = {
          month: "long",
          day: "numeric",
          year: "numeric",
        };
        const formattedStart = start.toLocaleDateString("en-US", options);
        const formattedEnd = end.toLocaleDateString("en-US", options);
        readableDateRange = `${formattedStart}–${formattedEnd}`;
      }
    }

    const schedulePrompt = `
You are an expert event planner.

Based on the provided event information below, generate a detailed and realistic ${estimatedDays}-day event schedule.

⚡ Important: RETURN ONLY STRUCTURED JSON in the following format:
[
  {
    "day": "Day 1: (e.g. October 12)",
    "activities": [
      {
        "time": "(e.g. 7:30AM - 9:00AM)",
        "title": "(activity title)",
        "notes": "(short notes about the activity)"
      }
    ]
  }
]

Event Type: ${eventType}
Event Details:
${
      Object.entries(responses)
        .map(([key, value]) => {
          const label = key.replace(/_/g, " ");
          const val = key === "dates_duration" && readableDateRange
            ? readableDateRange
            : typeof value === "object"
              ? JSON.stringify(value)
              : value;
          return `- ${label}: ${val}`;
        })
        .join("\n")
    }
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a highly skilled event planning assistant.",
          },
          { role: "user", content: schedulePrompt },
        ],
        temperature: 0.7,
      }),
    });

    const { choices } = await openaiRes.json();
    const generatedSchedule = choices?.[0]?.message?.content || "[]";

    return new Response(JSON.stringify({ schedule: generatedSchedule }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Error processing request", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
