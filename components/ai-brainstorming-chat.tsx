"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, Loader2, CheckSquare, Square, Copy, Sparkles } from "lucide-react"
// import { toast } from "sonner"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  selected?: boolean
}

interface FollowUpQuestion {
  id: string
  question: string
}

interface AIBrainstormingChatProps {
  ideaTitle: string
  ideaContent: string
  selectedThemes: string[]
  selectedTechnologies: string[]
  onContextGenerated?: (context: string) => void
  isTechnologyFirst?: boolean
  isIdeaFirst?: boolean
}

export function AIBrainstormingChat({
  ideaTitle,
  ideaContent,
  selectedThemes,
  selectedTechnologies,
  onContextGenerated,
  isTechnologyFirst = false,
  isIdeaFirst = false,
}: AIBrainstormingChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectMode, setSelectMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [businessThemes, setBusinessThemes] = useState<string[]>([])
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([])
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isTechnologyFirst) {
      fetchBusinessThemes()
    }
  }, [isTechnologyFirst])

  useEffect(() => {
    if (messages.length === 0) {
      addStandardQuestionsToChat()
    }
  }, [isIdeaFirst, isTechnologyFirst, selectedThemes, selectedTechnologies, businessThemes])

  const addStandardQuestionsToChat = () => {
    if (isIdeaFirst && selectedThemes.length > 0) {
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        role: "assistant",
        content: `よくある質問:`,
        timestamp: new Date(),
      }
      setMessages([systemMessage])
    } else if (isTechnologyFirst && selectedTechnologies.length > 0 && businessThemes.length > 0) {
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        role: "assistant",
        content: `よくある質問:`,
        timestamp: new Date(),
      }
      setMessages([systemMessage])
    }
  }

  const addFollowUpQuestionsToChat = (questions: FollowUpQuestion[]) => {
    if (questions.length > 0) {
      const followUpMessage: Message = {
        id: `followup-${Date.now()}`,
        role: "assistant",
        content: `次の質問候補:`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, followUpMessage])
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setFollowUpQuestions([])

    try {
      const response = await fetch("/api/ai-brainstorming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.trim(),
          ideaTitle,
          ideaContent,
          selectedThemes,
          selectedTechnologies,
          chatHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      generateFollowUpQuestions([...messages, userMessage, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateFollowUpQuestions = async (conversationHistory: Message[]) => {
    if (conversationHistory.length < 2) return // Need at least one Q&A pair

    console.log("[v0] Generating follow-up questions with history:", conversationHistory.length, "messages")
    setIsGeneratingFollowUp(true)

    try {
      const response = await fetch("/api/generate-followup-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationHistory: conversationHistory.map((m) => ({ role: m.role, content: m.content })),
          ideaTitle,
          ideaContent,
          selectedThemes,
          selectedTechnologies,
          isIdeaFirst,
          isTechnologyFirst,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const questions = data.questions || []
        console.log("[v0] Generated follow-up questions:", questions)
        setFollowUpQuestions(questions)
        addFollowUpQuestionsToChat(questions)
      } else {
        console.error("[v0] Failed to generate follow-up questions:", response.status)
      }
    } catch (error) {
      console.error("Error generating follow-up questions:", error)
    } finally {
      setIsGeneratingFollowUp(false)
    }
  }

  const handleFollowUpQuestion = (question: string) => {
    setInput(question)
    setFollowUpQuestions([]) // Clear follow-up questions after selection
  }

  const toggleMessageSelection = (messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, selected: !msg.selected } : msg)))
  }

  const selectAllMessages = () => {
    const allSelected = messages.every((msg) => msg.selected)
    setMessages((prev) => prev.map((msg) => ({ ...msg, selected: !allSelected })))
  }

  const generateContextFromSelected = () => {
    const selectedMessages = messages.filter((msg) => msg.selected)
    if (selectedMessages.length === 0) {
      return
    }

    const context = selectedMessages
      .map((msg) => `${msg.role === "user" ? "質問" : "AI回答"}: ${msg.content}`)
      .join("\n\n")

    if (onContextGenerated) {
      onContextGenerated(context)
      setTimeout(() => {
        const aiIdeaSupportButton = document.querySelector("[data-ai-idea-support]")
        if (aiIdeaSupportButton) {
          aiIdeaSupportButton.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 100)
    }
  }

  const copySelectedToClipboard = () => {
    const selectedMessages = messages.filter((msg) => msg.selected)
    if (selectedMessages.length === 0) {
      return
    }

    const text = selectedMessages
      .map((msg) => `${msg.role === "user" ? "質問" : "AI回答"}: ${msg.content}`)
      .join("\n\n")

    copyToClipboardWithFallback(text)
  }

  const copyToClipboardWithFallback = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch((error) => {
        console.error("Clipboard error:", error)
        fallbackCopyTextToClipboard(text)
      })
    } else {
      fallbackCopyTextToClipboard(text)
    }
  }

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "fixed"
    textArea.style.left = "-999999px"
    textArea.style.top = "-999999px"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand("copy")
    } catch (err) {
      console.error("Fallback copy failed:", err)
    }

    document.body.removeChild(textArea)
  }

  const fetchBusinessThemes = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: themes } = await supabase.from("business_themes").select("name").order("name")

      setBusinessThemes(themes?.map((theme) => theme.name) || [])
    } catch (error) {
      console.error("Error fetching business themes:", error)
    }
  }

  const handlePreSelectedQuestion = (questionType: string) => {
    let question = ""

    if (isIdeaFirst) {
      switch (questionType) {
        case "theme_challenges":
          question = `「${selectedThemes.join("、")}」における課題は？`
          break
        case "market_opportunities":
          question = `「${selectedThemes.join("、")}」の市場機会について教えてください。`
          break
        case "competitive_landscape":
          question = `「${selectedThemes.join("、")}」の競合状況はどうなっていますか？`
          break
      }
    } else if (isTechnologyFirst) {
      switch (questionType) {
        case "matching_themes":
          question = `「${selectedTechnologies.join("、")}」を起点に事業を検討するとき、以下の事業テーマのうちどのようなテーマがマッチングしますか？\n\n事業テーマ一覧:\n${businessThemes.map((theme, index) => `${index + 1}. ${theme}`).join("\n")}`
          break
        case "industries":
          question = `「${selectedTechnologies.join("、")}」がよく利用される業種を教えてください。`
          break
        case "characteristics":
          question = `「${selectedTechnologies.join("、")}」の特徴と適用限界を教えてください。`
          break
      }
    }

    setInput(question)
  }

  const handleMessageClick = (content: string) => {
    // This function is now only used for non-button clicks
  }

  const handleQuestionButtonClick = (questionType: string, questionText?: string) => {
    if (questionText) {
      // For follow-up questions, use the exact text
      setInput(questionText)
    } else {
      // For standard questions, use the pre-selected question logic
      handlePreSelectedQuestion(questionType)
    }
  }

  const renderQuestionButtons = (content: string, messageId: string) => {
    if (content.includes("よくある質問:")) {
      if (isIdeaFirst) {
        return (
          <div className="space-y-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-left justify-start text-purple-700 border-purple-200 hover:bg-purple-50 bg-transparent"
              onClick={() => handleQuestionButtonClick("theme_challenges")}
            >
              1. 「{selectedThemes.join("、")}」における課題は？
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-left justify-start text-purple-700 border-purple-200 hover:bg-purple-50 bg-transparent"
              onClick={() => handleQuestionButtonClick("market_opportunities")}
            >
              2. 市場機会について教えて
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-left justify-start text-purple-700 border-purple-200 hover:bg-purple-50 bg-transparent"
              onClick={() => handleQuestionButtonClick("competitive_landscape")}
            >
              3. 競合状況はどうなっている？
            </Button>
          </div>
        )
      } else if (isTechnologyFirst) {
        return (
          <div className="space-y-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-left justify-start text-purple-700 border-purple-200 hover:bg-purple-50 bg-transparent"
              onClick={() => handleQuestionButtonClick("matching_themes")}
            >
              1. 技術テーマに合う事業テーマを教えて
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-left justify-start text-purple-700 border-purple-200 hover:bg-purple-50 bg-transparent"
              onClick={() => handleQuestionButtonClick("industries")}
            >
              2. この技術がよく利用される業種は？
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-left justify-start text-purple-700 border-purple-200 hover:bg-purple-50 bg-transparent"
              onClick={() => handleQuestionButtonClick("characteristics")}
            >
              3. 技術の特徴と適用限界を教えて
            </Button>
          </div>
        )
      }
    } else if (content.includes("次の質問候補:")) {
      return (
        <div className="space-y-2 mt-2">
          {followUpQuestions.map((question, index) => (
            <Button
              key={question.id}
              variant="outline"
              size="sm"
              className="w-full text-left justify-start text-green-700 border-green-200 hover:bg-green-50 bg-transparent"
              onClick={() => handleQuestionButtonClick("followup", question.question)}
            >
              {index + 1}. {question.question}
            </Button>
          ))}
        </div>
      )
    }
    return null
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          AI壁打ちスペース
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          アイデアについてAIと自由に議論できます。選択した内容は「AI発想支援」のコンテキストとして活用できます。
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto space-y-3 p-4 bg-white/30 rounded-lg border border-blue-100">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>AIとの壁打ちを始めましょう！</p>
              <p className="text-xs mt-1">アイデアについて質問や相談をしてみてください。</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg relative group ${
                    message.role === "user"
                      ? "bg-blue-600 text-white cursor-default"
                      : message.content.includes("よくある質問:")
                        ? "bg-purple-50 border border-purple-200"
                        : message.content.includes("次の質問候補:")
                          ? "bg-green-50 border border-green-200"
                          : "bg-white border border-gray-200 cursor-default"
                  } ${message.selected ? "ring-2 ring-blue-400" : ""}`}
                >
                  {selectMode &&
                    !(message.content.includes("よくある質問:") || message.content.includes("次の質問候補:")) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleMessageSelection(message.id)
                        }}
                        className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded p-1 shadow-sm"
                      >
                        {message.selected ? (
                          <CheckSquare className="h-3 w-3 text-blue-600" />
                        ) : (
                          <Square className="h-3 w-3 text-gray-400" />
                        )}
                      </button>
                    )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  {renderQuestionButtons(message.content, message.id)}

                  <div
                    className={`text-xs mt-1 opacity-70 ${
                      message.role === "user"
                        ? "text-blue-100"
                        : message.content.includes("よくある質問:")
                          ? "text-purple-600"
                          : message.content.includes("次の質問候補:")
                            ? "text-green-600"
                            : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              </div>
            </div>
          )}
          {isGeneratingFollowUp && (
            <div className="flex justify-start">
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-green-700" />
                <p className="text-sm text-green-700 ml-2">次の質問を考えています...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Selection Controls */}
        {messages.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg border border-blue-100">
            <Button variant="outline" size="sm" onClick={() => setSelectMode(!selectMode)} className="text-xs">
              メッセージ選択
            </Button>

            {selectMode && (
              <>
                <Button variant="outline" size="sm" onClick={selectAllMessages} className="text-xs bg-transparent">
                  全選択/解除
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copySelectedToClipboard}
                  className="text-xs flex items-center gap-1 bg-transparent"
                >
                  <Copy className="h-3 w-3" />
                  コピー
                </Button>
                <Button
                  size="sm"
                  onClick={generateContextFromSelected}
                  className="text-xs flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Sparkles className="h-3 w-3" />
                  AI発想支援で活用
                </Button>
              </>
            )}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="AIに質問や相談をしてみましょう..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} size="icon">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
