import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { selectedThemes, selectedTechnologies, ideaData, additionalContext } = await request.json()

    const themeNames = selectedThemes || []
    const technologyNames = selectedTechnologies || []

    let prompt = `
以下の事業アイデアについて、指定されたフォーマットでエレベーターピッチを日本語で作成してください。

事業アイデア: ${ideaData.title}
詳細: ${ideaData.content}
事業テーマ: ${themeNames.join(", ")}
技術テーマ: ${technologyNames.join(", ")}`

    if (additionalContext) {
      prompt += `

追加コンテキスト（AIとの壁打ちから）:
${additionalContext}`
    }

    prompt += `

エレベーターピッチは以下のフォーマットで出力してください：

[ ❶ 潜在的なニーズ／抱えている課題 ]を満たしたい／解決したい[ ❷ ターゲットユーザー ]向けの、[ ❸ プロダクト名 ] は、[ ❹ プロダクトのカテゴリ ]である。これは[ ❺ 重要な利点、対価に見合う説得力のある理由 ]ができる。[ ❻ 最も保守的な代替手段 ]とは違って、[ ❼ 差別化の決定的な特徴 ]が備わっている。そして[ ❽ 実績や強み＋社名 ]だからこそ、[ ❾ 自社が取り組む理由、圧倒的な優位性 ]がある。

要件:
- 各要素（❶〜❾）を具体的で説得力のある内容で埋める
- 投資家やスタートアップスタジオに響く内容
- 日本のビジネス文化に適した表現
- リーンスタートアップの考え方を反映
${additionalContext ? "- 提供されたチャットコンテキストの洞察を活用" : ""}

また、ピッチで伝えるべき重要なポイントを5つ箇条書きで提供してください。

回答は以下のJSON形式で返してください:
{
  "elevatorPitch": "上記フォーマットに従ったエレベーターピッチの内容",
  "pitchPoints": ["ポイント1", "ポイント2", "ポイント3", "ポイント4", "ポイント5"]
}
`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
    })

    try {
      let cleanedText = text.trim()
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
      }

      const result = JSON.parse(cleanedText)
      return NextResponse.json(result)
    } catch (parseError) {
      console.error("JSON parsing error:", parseError)
      // If JSON parsing fails, return a structured response
      return NextResponse.json({
        elevatorPitch: text,
        pitchPoints: [
          "問題の明確化と市場規模の提示",
          "独自の解決策とその優位性",
          "ターゲット顧客とビジネスモデル",
          "技術的実現可能性と差別化要因",
          "成長戦略と収益性の見通し",
        ],
      })
    }
  } catch (error) {
    console.error("Error generating elevator pitch:", error)
    return NextResponse.json({ error: "エレベーターピッチの生成に失敗しました" }, { status: 500 })
  }
}
