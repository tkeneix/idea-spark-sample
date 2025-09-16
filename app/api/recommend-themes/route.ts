import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { Database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { ideaData } = await request.json()

    // Get recommendation count setting
    const setting = await Database.getSetting("recommendation_count")
    const recommendationCount = setting?.value || 1

    // Get available business themes
    const themes = await Database.getThemes()

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `あなたはビジネスコンサルタントです。技術アイデアに最適な事業テーマを推薦してください。

回答は以下のJSON形式で返してください：
{
  "recommendedIds": [1, 3, 5],
  "reasoning": "推薦理由の説明",
  "hypotheses": {
    "1": "このテーマが事業にどのように貢献するかの仮説",
    "3": "このテーマが事業にどのように貢献するかの仮説",
    "5": "このテーマが事業にどのように貢献するかの仮説"
  }
}`,
      prompt: `技術アイデア:
タイトル: ${ideaData.title}
内容: ${ideaData.content}

利用可能な事業テーマ:
${themes.map((theme) => `ID: ${theme.id}, 名前: ${theme.name}, 説明: ${theme.description}`).join("\n")}

この技術アイデアに最も適した事業テーマを${recommendationCount}個推薦し、それぞれがどのように事業に貢献するかの仮説を提供してください。`,
    })

    let cleanedText = text.trim()

    // Remove markdown code blocks if present
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    const result = JSON.parse(cleanedText)
    return NextResponse.json(result)
  } catch (error) {
    console.error("事業テーマレコメンドエラー:", error)
    return NextResponse.json({ error: "事業テーマレコメンドに失敗しました" }, { status: 500 })
  }
}
