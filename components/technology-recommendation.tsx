"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cpu, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface Technology {
  id: number
  name: string
  description: string
  category: string
}

interface RecommendationResponse {
  recommendedIds: number[]
  reasoning: string
  contributions: { [key: string]: string }
}

interface TechnologyRecommendationProps {
  ideaData: { title: string; content: string }
  onContinue: (technologies: number[]) => void
}

export function TechnologyRecommendation({ ideaData, onContinue }: TechnologyRecommendationProps) {
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [selectedTechnologies, setSelectedTechnologies] = useState<number[]>([])
  const [businessContributions, setBusinessContributions] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)

  useEffect(() => {
    fetchTechnologies()
  }, [])

  const fetchTechnologies = async () => {
    try {
      const response = await fetch("/api/admin/technologies")
      if (!response.ok) throw new Error("技術テーマの取得に失敗しました")
      const data = await response.json()
      const technologiesArray = Array.isArray(data) ? data : data.technologies || []
      setTechnologies(technologiesArray)
    } catch (error) {
      toast.error("技術テーマの読み込みに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const generateRecommendations = async () => {
    setIsGeneratingRecommendations(true)
    try {
      const response = await fetch("/api/recommend-technologies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaData }),
      })

      if (!response.ok) throw new Error("レコメンド生成に失敗しました")

      const data: RecommendationResponse = await response.json()
      setSelectedTechnologies(data.recommendedIds)
      setBusinessContributions(data.contributions || {})
      toast.success("AIが技術テーマをレコメンドしました！")
    } catch (error) {
      toast.error("レコメンド生成に失敗しました")
    } finally {
      setIsGeneratingRecommendations(false)
    }
  }

  const toggleTechnology = (id: number) => {
    setSelectedTechnologies((prev) => (prev.includes(id) ? prev.filter((techId) => techId !== id) : [...prev, id]))
  }

  const handleSubmit = () => {
    if (selectedTechnologies.length === 0) {
      toast.error("少なくとも1つの技術テーマを選択してください")
      return
    }
    onContinue(selectedTechnologies)
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
          <Cpu className="h-5 w-5 text-blue-500" />
          技術テーマの選択
        </CardTitle>
        <CardDescription>あなたのアイデアに適した技術テーマを選択してください</CardDescription>
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
          {technologies.map((tech) => (
            <Card
              key={tech.id}
              className={`cursor-pointer transition-all ${
                selectedTechnologies.includes(tech.id)
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "hover:shadow-md"
              }`}
              onClick={() => toggleTechnology(tech.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{tech.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {tech.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{tech.description}</p>

                {businessContributions[tech.id.toString()] && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border-l-4 border-green-400">
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">事業貢献の仮説</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {businessContributions[tech.id.toString()]}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Button onClick={handleSubmit} disabled={selectedTechnologies.length === 0} className="w-full">
          エレベーターピッチの生成へ進む ({selectedTechnologies.length}個選択中)
        </Button>
      </CardContent>
    </Card>
  )
}
