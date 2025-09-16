import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { Database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { ideaData } = await request.json()

    // Get available technologies
    const technologies = await Database.getTechnologies()

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `あなたは技術コンサルタントです。ビジネスアイデアに最適な技術テーマを推薦し、それぞれがどのように事業に貢献するかの仮説を提供してください。

回答は以下のJSON形式で返してください：
{
  "recommendedIds": [1, 3, 5],
  "reasoning": "推薦理由の説明",
  "contributions": {
    "1": "この技術が事業にどのように貢献するかの具体的な仮説",
    "3": "この技術が事業にどのように貢献するかの具体的な仮説",
    "5": "この技術が事業にどのように貢献するかの具体的な仮説"
  }
}`,
      prompt: `ビジネスアイデア:
タイトル: ${ideaData.title}
内容: ${ideaData.content}

利用可能な技術テーマ:
${technologies.map((tech) => `ID: ${tech.id}, 名前: ${tech.name}, 説明: ${tech.description}`).join("\n")}

このビジネスアイデアに最も適した技術テーマを3-5個推薦し、それぞれの技術がどのように事業価値を創出し、競争優位性を生み出すかの具体的な仮説を提供してください。`,
    })

    let cleanedText = text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    const result = JSON.parse(cleanedText)
    return NextResponse.json(result)
  } catch (error) {
    console.error("技術レコメンドエラー:", error)
    return NextResponse.json({ error: "技術レコメンドに失敗しました" }, { status: 500 })
  }
}
