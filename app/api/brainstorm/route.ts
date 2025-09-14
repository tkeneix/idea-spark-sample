import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { title, content, question } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const prompt = `You are an expert business advisor helping refine a startup idea.

Business Idea: "${title}"
Current Description: "${content}"

User Question/Request: "${question || "Help me improve this business idea"}"

Provide specific, actionable advice to improve this business concept. Focus on:
- Market validation strategies
- Revenue model optimization
- Competitive differentiation
- Technical feasibility
- Go-to-market approach
- Potential challenges and solutions

Keep your response concise but insightful (150-200 words).`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
    })

    return NextResponse.json({ advice: text })
  } catch (error) {
    console.error("Error generating brainstorm advice:", error)
    return NextResponse.json({ error: "Failed to generate advice" }, { status: 500 })
  }
}
