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

    const prompt = `Generate 3 concise business idea recommendations for these themes: ${themeNames}

Each recommendation should be:
- A short, catchy title (max 30 characters)
- A brief description (max 80 characters)
- Focused on startup-ready concepts

Format as JSON array with objects containing "title" and "description" fields.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.9,
    })

    let recommendations
    try {
      recommendations = JSON.parse(text)
    } catch {
      // Fallback recommendations
      recommendations = [
        {
          title: "Smart Health Monitor",
          description: "IoT-enabled health tracking for chronic disease management",
        },
        {
          title: "AI Diagnostic Tool",
          description: "Machine learning for early disease detection",
        },
        {
          title: "Secure Telemedicine",
          description: "HIPAA-compliant video consultation platform",
        },
      ]
    }

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error("Error getting recommendations:", error)
    return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 })
  }
}
