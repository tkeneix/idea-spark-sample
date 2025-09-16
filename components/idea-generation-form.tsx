"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Sparkles, ChevronDown, ChevronUp, Plus } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { AIBrainstormingChat } from "@/components/ai-brainstorming-chat"

interface IdeaGenerationFormProps {
  selectedThemes: string[]
  onContinue: (data: { title: string; content: string }) => void
}

export function IdeaGenerationForm({ selectedThemes, onContinue }: IdeaGenerationFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [themeNames, setThemeNames] = useState<string[]>([])
  const [brainstormingContext, setBrainstormingContext] = useState("")
  const [userContexts, setUserContexts] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [showContextInput, setShowContextInput] = useState(false)

  useEffect(() => {
    fetchThemeNames()
  }, [selectedThemes])

  const fetchThemeNames = async () => {
    if (selectedThemes.length === 0) return

    try {
      const response = await fetch('/api/admin/themes')
      const { themes } = await response.json()

      const selectedThemeNames = themes
        .filter((theme: any) => selectedThemes.includes(theme.id))
        .map((theme: any) => theme.name)

      setThemeNames(selectedThemeNames)
    } catch (error) {
      console.error("Error fetching theme names:", error)
    }
  }

  const handleChatContextGenerated = (context: string) => {
    setBrainstormingContext(context)
  }

  const addContext = () => {
    if (currentInput.trim()) {
      setUserContexts(prev => [...prev, currentInput.trim()])
      setCurrentInput("")
    }
  }

  const removeContext = (index: number) => {
    setUserContexts(prev => prev.filter((_, i) => i !== index))
  }

  const handleContextKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      addContext()
    }
  }

  const handleAIGeneration = async () => {
    setIsGenerating(true)
    try {
      console.log("[v0] Generating idea for themes:", selectedThemes)
      console.log("[v0] Theme names:", themeNames)
      console.log("[v0] Brainstorming context:", brainstormingContext)
      console.log("[v0] User contexts:", userContexts)

      // Combine brainstorming context and user contexts
      const combinedContext = [brainstormingContext, ...userContexts].filter(Boolean).join("\n\n")

      const response = await fetch("/api/generate-idea-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themes: selectedThemes,
          context: combinedContext,
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
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            アイデアの詳細化
          </CardTitle>
          <CardDescription>選択したテーマに基づいて、具体的なビジネスアイデアを作成しましょう</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            {/* <p className="text-sm text-muted-foreground mb-2">事業テーマ:</p> */}
            <div className="flex flex-wrap gap-2 mb-4">
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

          {(brainstormingContext || userContexts.length > 0) && (
            <div className="space-y-3">
              {brainstormingContext && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-sm mb-2 text-purple-800">チャットから生成されたコンテキスト:</h4>
                  <div className="text-xs text-purple-700 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{brainstormingContext}</pre>
                  </div>
                </div>
              )}
              {userContexts.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-sm mb-2 text-blue-800">追加したコンテキスト:</h4>
                  <div className="space-y-2">
                    {userContexts.map((context, index) => (
                      <div key={index} className="relative group">
                        <div className="text-xs text-blue-700 bg-white p-3 rounded border max-h-24 overflow-y-auto pr-8">
                          <pre className="whitespace-pre-wrap">{context}</pre>
                        </div>
                        <button
                          onClick={() => removeContext(index)}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 text-red-600 rounded p-1"
                          title="削除"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
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

            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContextInput(!showContextInput)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {showContextInput ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                コンテキスト追加
              </Button>
            </div>

            {showContextInput && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  追加のコンテキスト（アイデア生成の参考情報）
                </label>
                <div className="space-y-3">
                  <Textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleContextKeyPress}
                    placeholder="アイデア生成に考慮してほしい情報があれば記入してください&#x000A;例: ターゲット層、市場規模、技術的制約など&#x000A;Ctrl+Enterで追加"
                    rows={3}
                    className="text-sm"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={addContext}
                      disabled={!currentInput.trim()}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      コンテキストを追加
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
