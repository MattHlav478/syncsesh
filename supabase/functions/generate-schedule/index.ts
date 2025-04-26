import "https://deno.land/std@0.223.0/dotenv/load.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

Deno.serve(async (req) => {
  try {
    if (!OPENAI_API_KEY) {
      return new Response("OpenAI API key is not configured.", { status: 500 });
    }

    const { eventType, responses } = await req.json();

    if (!eventType || !responses) {
      return new Response("Missing eventType or responses", { status: 400 });
    }

    const prompt = `
You are an expert event planner creating a detailed, realistic, and creative agenda.
The event is a: ${eventType}.
Here are the details provided:

${Object.entries(responses)
  .map(([key, value]) => `- ${key.replace(/_/g, " ")}: ${value}`)
  .join("\n")}

Please output a structured agenda with times, activities, and notes in a clear format.
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
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error(error);
    return new Response("Error processing request", { status: 500 });
  }
});
