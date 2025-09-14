"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Sparkles, Lightbulb } from "lucide-react"
import { toast } from "sonner"

interface BusinessTheme {
  id: number
  name: string
  description: string
  category: string
}

interface BusinessThemeRecommendationProps {
  ideaData: { title: string; content: string }
  onContinue: (themes: number[]) => void
}

export function BusinessThemeRecommendation({ ideaData, onContinue }: BusinessThemeRecommendationProps) {
  const [themes, setThemes] = useState<BusinessTheme[]>([])
  const [selectedThemes, setSelectedThemes] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)
  const [hypotheses, setHypotheses] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchThemes()
  }, [])

  const fetchThemes = async () => {
    try {
      const response = await fetch("/api/admin/themes")
      if (!response.ok) throw new Error("事業テーマの取得に失敗しました")
      const data = await response.json()
      setThemes(data.themes || [])
    } catch (error) {
      toast.error("事業テーマの読み込みに失敗しました")
      setThemes([])
    } finally {
      setIsLoading(false)
    }
  }

  const generateRecommendations = async () => {
    setIsGeneratingRecommendations(true)
    try {
      const response = await fetch("/api/recommend-themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaData }),
      })

      if (!response.ok) throw new Error("レコメンド生成に失敗しました")

      const data = await response.json()
      setSelectedThemes(data.recommendedIds)
      setHypotheses(data.hypotheses || {})
      toast.success("AIが事業テーマをレコメンドしました！")
    } catch (error) {
      toast.error("レコメンド生成に失敗しました")
    } finally {
      setIsGeneratingRecommendations(false)
    }
  }

  const toggleTheme = (id: number) => {
    setSelectedThemes((prev) => (prev.includes(id) ? prev.filter((themeId) => themeId !== id) : [...prev, id]))
  }

  const handleSubmit = () => {
    if (selectedThemes.length === 0) {
      toast.error("少なくとも1つの事業テーマを選択してください")
      return
    }
    onContinue(selectedThemes)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">読み込み中...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-green-500" />
          事業テーマの選択
        </CardTitle>
        <CardDescription>あなたの技術アイデアに適した事業テーマを選択してください</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Button
            onClick={generateRecommendations}
            disabled={isGeneratingRecommendations}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <Sparkles className="h-4 w-4" />
            {isGeneratingRecommendations ? "生成中..." : "AIレコメンド"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.isArray(themes) &&
            themes.map((theme) => (
              <Card
                key={theme.id}
                className={`cursor-pointer transition-all ${
                  selectedThemes.includes(theme.id)
                    ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950"
                    : "hover:shadow-md"
                }`}
                onClick={() => toggleTheme(theme.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{theme.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {theme.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{theme.description}</p>

                  {hypotheses[theme.id.toString()] && (
                    <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-green-800 dark:text-green-200 mb-1">事業貢献仮説</p>
                          <p className="text-xs text-green-700 dark:text-green-300">
                            {hypotheses[theme.id.toString()]}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>

        <Button onClick={handleSubmit} disabled={selectedThemes.length === 0} className="w-full">
          エレベーターピッチの生成へ進む ({selectedThemes.length}個選択中)
        </Button>
      </CardContent>
    </Card>
  )
}
