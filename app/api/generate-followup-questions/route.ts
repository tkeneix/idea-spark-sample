import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const {
      conversationHistory,
      ideaTitle,
      ideaContent,
      selectedThemes,
      selectedTechnologies,
      isIdeaFirst,
      isTechnologyFirst,
    } = await request.json()

    console.log("[v0] Follow-up questions API called with history length:", conversationHistory?.length)

    const contextInfo = []
    if (selectedThemes?.length > 0) {
      contextInfo.push(`事業テーマ: ${selectedThemes.join("、")}`)
    }
    if (selectedTechnologies?.length > 0) {
      contextInfo.push(`技術: ${selectedTechnologies.join("、")}`)
    }

    const flowType = isIdeaFirst ? "アイディア起点" : isTechnologyFirst ? "技術起点" : "一般"

    const conversationText = conversationHistory
      .map((msg: any) => `${msg.role === "user" ? "質問" : "AI回答"}: ${msg.content}`)
      .join("\n\n")

    console.log("[v0] Conversation text for AI:", conversationText.substring(0, 200) + "...")

    const prompt = `
以下の会話履歴を分析して、さらに深掘りするための質問を3つ提案してください。

【コンテキスト】
- フロー: ${flowType}
- アイデア: ${ideaTitle}
- 内容: ${ideaContent}
${contextInfo.length > 0 ? `- ${contextInfo.join("\n- ")}` : ""}

【会話履歴】
${conversationText}

【要求】
- 会話の内容を踏まえて、より具体的で実践的な質問を3つ提案
- 事業化や実装に向けた深掘りができる質問
- 各質問は簡潔で分かりやすく（50文字以内）
- JSON形式で回答する、markdownではなくJSON.parse()で解析できる文字列で返すこと
  以下、フォーマット例
  questions: [
    { id: "1", question: "質問内容１？" },
    { id: "2", question: "質問内容２？" },
    { id: "3", question: "質問内容３？" },
  ]

`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
    })

    let cleaned_text = text.replaceAll("json", "")
    cleaned_text = cleaned_text.replaceAll("```", "")

    console.log("[v0] AI response for follow-up questions:", cleaned_text)

    let questions
    try {
      questions = JSON.parse(cleaned_text)
    } catch (parseError) {
      console.error("Error generating follow-up questions:", parseError)
      // Fallback if JSON parsing fails
      questions = {
        questions: [
          { id: "1", question: "この課題を解決する具体的な方法は？" },
          { id: "2", question: "実現するために必要なリソースは？" },
          { id: "3", question: "競合との差別化ポイントは？" },
        ],
      }
    }

    console.log("[v0] Parsed questions:", questions)
    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error generating follow-up questions:", error)
    return NextResponse.json({ error: "Failed to generate follow-up questions" }, { status: 500 })
  }
}
