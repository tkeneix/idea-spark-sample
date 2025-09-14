import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { themes } = body

    if (!themes || !Array.isArray(themes) || themes.length === 0) {
      console.log("[v0] Invalid themes parameter:", themes)
      return NextResponse.json({ error: "有効なテーマを選択してください" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("[v0] Missing OpenAI API key")
      return NextResponse.json({ error: "AI機能が利用できません" }, { status: 500 })
    }

    console.log("[v0] Generating idea for themes:", themes)

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `あなたは日本のスタートアップ支援の専門家です。リーンスタートアップの手法に基づいて、実用的で革新的なビジネスアイデアを生成してください。

必ず以下のJSON形式で回答してください（他の文字は含めないでください）：
{
  "title": "具体的で魅力的なアイデアタイトル",
  "content": "アイデアの詳細説明（問題、解決策、ターゲット、価値提案を含む）"
}`,
      prompt: `選択されたテーマID: ${themes.join(", ")}

これらのテーマに基づいて、日本市場に適した革新的なビジネスアイデアを生成してください。以下の要素を含めてください：
- 解決する具体的な問題
- 提案する解決策
- ターゲット顧客
- 独自の価値提案
- 市場機会

リーンスタートアップの原則に従い、検証可能で実現可能なアイデアにしてください。`,
    })

    console.log("[v0] AI response received:", text.substring(0, 100) + "...")

    let result
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedText = text
        .trim()
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "")
      result = JSON.parse(cleanedText)

      // Validate the result structure
      if (!result.title || !result.content) {
        throw new Error("Invalid response structure")
      }
    } catch (parseError) {
      console.error("[v0] JSON parsing failed:", parseError)
      console.error("[v0] Raw AI response:", text)

      result = {
        title: "革新的なビジネスアイデア",
        content:
          text.length > 0 ? text : "申し訳ございませんが、アイデアの生成に失敗しました。もう一度お試しください。",
      }
    }

    console.log("[v0] Returning result:", result.title)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[v0] API Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    if (error.message?.includes("rate limit")) {
      return NextResponse.json(
        {
          error: "現在アクセスが集中しています。しばらく待ってから再度お試しください。",
        },
        { status: 429 },
      )
    }

    if (error.message?.includes("API key")) {
      return NextResponse.json(
        {
          error: "AI機能の設定に問題があります。管理者にお問い合わせください。",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "アイデア生成に失敗しました。もう一度お試しください。",
      },
      { status: 500 },
    )
  }
}
