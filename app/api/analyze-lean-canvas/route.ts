import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { title, content, themes, technologies } = await request.json()

    const prompt = `
あなたはリーンスタートアップの専門家です。以下のビジネスアイディアをリーンキャンバスの要素に分解して分析してください。

アイディアタイトル: ${title}
アイディア内容: ${content}
選択された事業テーマ: ${themes.join(", ")}
選択された技術テーマ: ${technologies.join(", ")}

以下の5つの要素に分けて、それぞれ2-3文で簡潔に分析してください：

1. 問題 (Problem): このアイディアが解決しようとしている具体的な問題
2. ターゲット顧客 (Target Customer): この問題を抱えている具体的な顧客セグメント
3. 解決策 (Solution): 問題に対する具体的な解決方法
4. 独自の価値提案 (Unique Value Proposition): 競合との差別化ポイント
5. 市場機会 (Market Opportunity): 市場規模や成長性、タイミング

JSON形式で回答してください：
{
  "problem": "問題の説明",
  "targetCustomer": "ターゲット顧客の説明",
  "solution": "解決策の説明",
  "uniqueValueProposition": "独自の価値提案の説明",
  "marketOpportunity": "市場機会の説明"
}
`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
    })

    // Clean the response to handle markdown code blocks
    let cleanedText = text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    let analysis
    try {
      analysis = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      console.error("Raw text:", text)
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Error generating lean canvas analysis:", error)
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 })
  }
}
