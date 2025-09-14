import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { message, ideaTitle, ideaContent, selectedThemes, selectedTechnologies, chatHistory } = await request.json()

    const systemPrompt = `あなたは創造的なビジネスアイデアの壁打ち相手です。ユーザーのアイデアについて建設的で洞察に富んだ議論を行ってください。

現在のアイデア:
タイトル: ${ideaTitle}
内容: ${ideaContent}

選択されたテーマ: ${selectedThemes.join(", ")}
選択された技術: ${selectedTechnologies.join(", ")}

以下の点を意識して応答してください:
- 具体的で実用的なアドバイスを提供する
- 新しい視点や可能性を提示する
- 潜在的な課題や改善点を指摘する
- 市場性や実現可能性について議論する
- ユーザーの思考を深めるような質問をする
- 日本語で自然な会話を心がける

簡潔で分かりやすい回答を心がけ、長すぎないようにしてください。`

    const conversationContext = chatHistory
      .map((msg: any) => `${msg.role === "user" ? "ユーザー" : "AI"}: ${msg.content}`)
      .join("\n")

    const fullPrompt = `${conversationContext ? `過去の会話:\n${conversationContext}\n\n` : ""}現在の質問: ${message}`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: fullPrompt,
      maxTokens: 500,
      temperature: 0.7,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("AI brainstorming error:", error)
    return NextResponse.json({ error: "AI応答の生成に失敗しました" }, { status: 500 })
  }
}
