"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { AIBrainstormingChat } from "@/components/ai-brainstorming-chat"

interface IdeaGenerationFormProps {
  selectedThemes: number[]
  onContinue: (data: { title: string; content: string }) => void
}

export function IdeaGenerationForm({ selectedThemes, onContinue }: IdeaGenerationFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [themeNames, setThemeNames] = useState<string[]>([])
  const [brainstormingContext, setBrainstormingContext] = useState("")

  useEffect(() => {
    fetchThemeNames()
  }, [selectedThemes])

  const fetchThemeNames = async () => {
    if (selectedThemes.length === 0) return

    try {
      const supabase = createClient()
      const { data: themes } = await supabase.from("business_themes").select("name").in("id", selectedThemes)

      setThemeNames(themes?.map((theme) => theme.name) || [])
    } catch (error) {
      console.error("Error fetching theme names:", error)
    }
  }

  const handleChatContextGenerated = (context: string) => {
    setBrainstormingContext(context)
  }

  const handleAIGeneration = async () => {
    setIsGenerating(true)
    try {
      console.log("[v0] Generating idea for themes:", selectedThemes)
      console.log("[v0] Theme names:", themeNames)
      console.log("[v0] Brainstorming context:", brainstormingContext)

      const response = await fetch("/api/generate-idea-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themes: selectedThemes,
          context: brainstormingContext,
        }),
      })

      if (!response.ok) throw new Error("生成に失敗しました")

      const data = await response.json()
      setTitle(data.title)
      setContent(data.content)
      toast.success("AIがアイデアを生成しました！")
    } catch (error) {
      toast.error("アイデア生成に失敗しました")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("タイトルと概要を入力してください")
      return
    }
    onContinue({ title: title.trim(), content: content.trim() })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">選択した要素</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <h4 className="font-medium text-sm mb-2">事業テーマ</h4>
            <div className="flex flex-wrap gap-2">
              {themeNames.length === 0 && selectedThemes.length > 0 ? (
                <Badge variant="secondary">読み込み中...</Badge>
              ) : (
                themeNames.map((themeName, index) => (
                  <Badge key={index} variant="secondary">
                    {themeName}
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
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            アイデアの詳細化
          </CardTitle>
          <CardDescription>選択したテーマに基づいて、具体的なビジネスアイデアを作成しましょう</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {brainstormingContext && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-sm mb-2 text-purple-800">チャットから生成されたコンテキスト:</h4>
              <div className="text-xs text-purple-700 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{brainstormingContext}</pre>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleAIGeneration}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              data-ai-idea-support
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "生成中..." : "AI発想支援"}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">アイデアタイトル</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 地域密着型フードデリバリーサービス"
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">アイデア概要</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="アイデアの詳細な説明を入力してください..."
                className="w-full min-h-[120px]"
              />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={!title.trim() || !content.trim()} className="w-full">
            技術テーマの選択へ進む
          </Button>
        </CardContent>
      </Card>

      <AIBrainstormingChat
        ideaTitle={title}
        ideaContent={content}
        selectedThemes={themeNames}
        selectedTechnologies={[]}
        onContextGenerated={handleChatContextGenerated}
        isIdeaFirst={true}
      />
    </div>
  )
}
