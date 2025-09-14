"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Target, Users, Lightbulb, Star, TrendingUp, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface LeanCanvasAnalysis {
  problem: string
  targetCustomer: string
  solution: string
  uniqueValueProposition: string
  marketOpportunity: string
}

interface LeanCanvasAnalyzerProps {
  ideaTitle: string
  ideaContent: string
  selectedThemes: string[]
  selectedTechnologies: string[]
}

export function LeanCanvasAnalyzer({
  ideaTitle,
  ideaContent,
  selectedThemes,
  selectedTechnologies,
}: LeanCanvasAnalyzerProps) {
  const [analysis, setAnalysis] = useState<LeanCanvasAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const generateAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-lean-canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ideaTitle,
          content: ideaContent,
          themes: selectedThemes,
          technologies: selectedTechnologies,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysis(data.analysis)
        toast.success("リーンキャンバス分析が完了しました")
      } else {
        toast.error("分析に失敗しました")
      }
    } catch (error) {
      console.error("Error generating analysis:", error)
      toast.error("分析エラーが発生しました")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          リーンキャンバス分析
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          リーンスタートアップのメソッドに基づいて、アイディアを構造化して分析します
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected Elements Display */}
        {(selectedThemes.length > 0 || selectedTechnologies.length > 0) && (
          <div className="p-4 bg-muted/50 rounded-lg border">
            <h4 className="font-medium text-sm mb-3 text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              選択した要素
            </h4>
            <div className="space-y-2">
              {selectedThemes.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">事業テーマ: </span>
                  <div className="inline-flex flex-wrap gap-1 mt-1">
                    {selectedThemes.map((theme, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedTechnologies.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">技術テーマ: </span>
                  <div className="inline-flex flex-wrap gap-1 mt-1">
                    {selectedTechnologies.map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!analysis ? (
          <div className="text-center">
            <Button onClick={generateAnalysis} disabled={isAnalyzing} className="flex items-center gap-2">
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
              {isAnalyzing ? "分析中..." : "リーンキャンバス分析を開始"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Problem */}
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                  <Lightbulb className="h-4 w-4" />
                  問題
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-red-800 leading-relaxed">{analysis.problem}</p>
              </CardContent>
            </Card>

            {/* Target Customer */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                  <Users className="h-4 w-4" />
                  ターゲット顧客
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-blue-800 leading-relaxed">{analysis.targetCustomer}</p>
              </CardContent>
            </Card>

            {/* Solution */}
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                  <Target className="h-4 w-4" />
                  解決策
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-green-800 leading-relaxed">{analysis.solution}</p>
              </CardContent>
            </Card>

            {/* Unique Value Proposition */}
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-purple-700">
                  <Star className="h-4 w-4" />
                  独自の価値提案
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-purple-800 leading-relaxed">{analysis.uniqueValueProposition}</p>
              </CardContent>
            </Card>

            {/* Market Opportunity */}
            <Card className="border-orange-200 bg-orange-50/50 md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
                  <TrendingUp className="h-4 w-4" />
                  市場機会
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-orange-800 leading-relaxed">{analysis.marketOpportunity}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {analysis && (
          <div className="text-center pt-4 border-t">
            <Button
              onClick={generateAnalysis}
              variant="outline"
              disabled={isAnalyzing}
              className="flex items-center gap-2 bg-transparent"
            >
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
              再分析
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
