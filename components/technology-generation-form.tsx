"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { AIBrainstormingChat } from "@/components/ai-brainstorming-chat"

const showToast = (message: string, type: "success" | "error" = "success") => {
  alert(message)
}

interface TechnologyGenerationFormProps {
  selectedTechnologies: number[]
  onContinue: (data: { title: string; content: string }) => void
}

export function TechnologyGenerationForm({ selectedTechnologies, onContinue }: TechnologyGenerationFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [technologyNames, setTechnologyNames] = useState<string[]>([])
  const [chatContext, setChatContext] = useState<string>("")

  useEffect(() => {
    fetchTechnologyNames()
  }, [selectedTechnologies])

  const fetchTechnologyNames = async () => {
    if (selectedTechnologies.length === 0) return

    try {
      const supabase = createClient()
      const { data: technologies } = await supabase.from("technologies").select("name").in("id", selectedTechnologies)

      setTechnologyNames(technologies?.map((tech) => tech.name) || [])
    } catch (error) {
      console.error("Error fetching technology names:", error)
    }
  }

  const handleAIGeneration = async () => {
    setIsGenerating(true)
    try {
      console.log("[v0] Generating idea for technologies:", selectedTechnologies)
      console.log("[v0] Technology names:", technologyNames)

      const response = await fetch("/api/generate-tech-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technologies: selectedTechnologies,
          additionalContext: chatContext, // Added chat context to API call
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.title && data.content) {
          // Fallback content provided
          setTitle(data.title)
          setContent(data.content)
          showToast("AI生成に失敗しましたが、テンプレートを提供しました", "error")
        } else {
          throw new Error(data.error || "生成に失敗しました")
        }
      } else {
        setTitle(data.title)
        setContent(data.content)
      }
    } catch (error) {
      console.error("[v0] AI generation error:", error)
      showToast("アイデア生成に失敗しました", "error")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleChatContextGenerated = (context: string) => {
    setChatContext(context)
  }

  const handleSubmit = () => {
    const titleValue = typeof title === "string" ? title.trim() : ""
    const contentValue = typeof content === "string" ? content.trim() : ""

    if (!titleValue || !contentValue) {
      showToast("タイトルと概要を入力してください", "error")
      return
    }
    onContinue({ title: titleValue, content: contentValue })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">選択した要素</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <h4 className="font-medium text-sm mb-2">技術テーマ</h4>
            <div className="flex flex-wrap gap-2">
              {technologyNames.length === 0 && selectedTechnologies.length > 0 ? (
                <Badge variant="outline">読み込み中...</Badge>
              ) : (
                technologyNames.map((techName, index) => (
                  <Badge key={index} variant="outline">
                    {techName}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            技術起点のアイデア発想
          </CardTitle>
          <CardDescription>選択した技術テーマに基づいて、具体的なビジネスアイデアを発想しましょう</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {chatContext && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-sm mb-2 text-blue-800">チャットから生成されたコンテキスト:</h4>
              <div className="text-xs text-blue-700 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{chatContext}</pre>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleAIGeneration}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              data-ai-idea-support
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "アイデア生成中..." : "AI発想支援"}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">アイデアタイトル</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: AIを活用した個人向け健康管理システム"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">アイデア概要</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="技術を活用したビジネスアイデアの詳細な説明を入力してください..."
                className="w-full min-h-[120px]"
              />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={!title || !content} className="w-full">
            事業テーマの選択へ進む
          </Button>
        </CardContent>
      </Card>

      <AIBrainstormingChat
        ideaTitle="技術起点のアイデア発想"
        ideaContent={`選択した技術テーマ: ${technologyNames.join(", ")}`}
        selectedThemes={[]}
        selectedTechnologies={technologyNames}
        onContextGenerated={handleChatContextGenerated}
        isTechnologyFirst={true}
      />
    </div>
  )
}
