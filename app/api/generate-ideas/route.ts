import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

const themeDescriptions = {
  1: "Healthcare - Medical technology, digital health, and wellness solutions",
  2: "5G/6G - Next-generation connectivity and telecommunications",
  3: "AI Agents - Intelligent automation and artificial intelligence",
  4: "Cybersecurity - Digital security and privacy protection",
  5: "Smart City - Urban technology and infrastructure solutions",
  6: "Sustainability - Environmental and clean technology solutions",
}

export async function POST(request: NextRequest) {
  try {
    const { selectedThemes } = await request.json()

    if (!selectedThemes || selectedThemes.length === 0) {
      return NextResponse.json({ error: "No themes selected" }, { status: 400 })
    }

    const themeNames = selectedThemes
      .map((id: number) => themeDescriptions[id as keyof typeof themeDescriptions])
      .join(", ")

    const prompt = `You are an expert business consultant helping entrepreneurs create compelling business ideas for startup studio applications. 

Generate a business idea that combines these themes: ${themeNames}

The business idea should be:
- Innovative and technically feasible
- Suitable for a startup studio environment
- Have clear market potential
- Address real problems in the selected theme areas
- Be suitable for pre-seed to seed stage funding

Provide:
1. A compelling business title (max 60 characters)
2. A detailed business description (200-300 words) that includes:
   - Problem being solved
   - Target market
   - Value proposition
   - Key features or technology
   - Business model overview
   - Competitive advantage

Format your response as JSON with "title" and "description" fields.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.8,
    })

    // Parse the AI response
    let aiResponse
    try {
      aiResponse = JSON.parse(text)
    } catch {
      // Fallback if AI doesn't return valid JSON
      aiResponse = {
        title: "AI-Generated Business Concept",
        description: text,
      }
    }

    return NextResponse.json(aiResponse)
  } catch (error) {
    console.error("Error generating ideas:", error)
    return NextResponse.json({ error: "Failed to generate ideas" }, { status: 500 })
  }
}
