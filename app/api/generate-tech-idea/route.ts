import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { Database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { technologies, additionalContext } = body

    if (!technologies || !Array.isArray(technologies) || technologies.length === 0) {
      return NextResponse.json({ error: "技術テーマを選択してください" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("[v0] OpenAI API key not found")
      return NextResponse.json({ error: "AI機能が利用できません" }, { status: 500 })
    }

    const techData = await Database.getTechnologiesByIds(technologies)
    const techNames = techData?.map((t) => t.name).join(", ") || "選択された技術"

    const contextSection = additionalContext
      ? `\n\n追加のコンテキスト（AIとの壁打ちから）:\n${additionalContext}\n\n上記のコンテキストも考慮してアイデアを生成してください。`
      : ""

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `あなたは日本のテクノロジースタートアップ支援の専門家です。リーンスタートアップの手法に基づいて、技術を活用した実用的で革新的なビジネスアイデアを生成してください。

回答は以下のJSON形式で返してください：
{
  "title": "技術を活用した具体的で魅力的なアイデアタイトル",
  "content": "ビジネスアイデアの詳細説明（技術の活用方法、解決する問題、ターゲット、価値提案を含む）"
}`,
      prompt: `選択された技術テーマ: ${techNames}${contextSection}

これらの技術テーマに基づいて、日本市場に適した革新的なビジネスアイデアを生成してください。以下の要素を含めてください：
- 技術の具体的な活用方法
- 解決する具体的な問題
- 提案するビジネスソリューション
- ターゲット顧客
- 技術による独自の価値提案
- 市場機会

リーンスタートアップの原則に従い、技術的に検証可能で実現可能なビジネスアイデアにしてください。`,
    })

    let result
    try {
      let cleanText = text.trim()

      // Remove markdown code blocks if present
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
      } else if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "")
      }

      console.log("[v0] Cleaned AI response:", cleanText)
      result = JSON.parse(cleanText)

      if (result.content && typeof result.content === "object") {
        // Convert nested object to readable string format
        const contentSections = []
        for (const [key, value] of Object.entries(result.content)) {
          if (typeof value === "string" && value.trim()) {
            contentSections.push(`【${key}】\n${value}`)
          }
        }
        result.content = contentSections.join("\n\n")
      }

      // Ensure content is a string
      if (typeof result.content !== "string") {
        result.content = String(result.content || "")
      }
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      console.error("[v0] Raw AI response:", text)

      // Fallback: extract content manually
      const titleMatch = text.match(/title["\s]*:["\s]*([^"]+)/)
      const contentMatch = text.match(/content["\s]*:["\s]*([^"]+)/)

      result = {
        title: titleMatch?.[1] || `${techNames}を活用したビジネスアイデア`,
        content:
          contentMatch?.[1] ||
          "技術を活用した革新的なビジネスソリューションのアイデアです。詳細は手動で入力してください。",
      }
    }

    if (!result.title || !result.content) {
      result = {
        title: result.title || `${techNames}を活用したビジネスアイデア`,
        content:
          result.content ||
          "技術を活用した革新的なビジネスソリューションのアイデアです。詳細は手動で入力してください。",
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] 技術アイデア生成エラー:", error)
    return NextResponse.json(
      {
        error: "技術アイデア生成に失敗しました",
        title: "技術を活用したビジネスアイデア",
        content: "申し訳ございません。AI生成に失敗しました。手動でアイデアを入力してください。",
      },
      { status: 500 },
    )
  }
}
