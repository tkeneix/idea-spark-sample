"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Cpu, Lightbulb, Shield, Building, Leaf, DollarSign, GraduationCap, Recycle, Truck } from "lucide-react"
import { useState, useEffect } from "react"

const iconMap: Record<string, any> = {
  "ヘルスケア・医療": Heart,
  "フィンテック": DollarSign,
  "教育・EdTech": GraduationCap,
  "環境・サステナビリティ": Leaf,
  "エンターテインメント・メディア": Lightbulb,
  "モビリティ・交通": Cpu,
  "不動産・プロップテック": Building,
  "リテール・Eコマース": Shield,
  "アグリテック": Recycle,
  "ロジスティクス・物流": Truck,
}

const colorMap: Record<string, string> = {
  "ヘルスケア・医療": "bg-red-50 border-red-200 text-red-700",
  "フィンテック": "bg-green-50 border-green-200 text-green-700",
  "教育・EdTech": "bg-blue-50 border-blue-200 text-blue-700",
  "環境・サステナビリティ": "bg-emerald-50 border-emerald-200 text-emerald-700",
  "エンターテインメント・メディア": "bg-purple-50 border-purple-200 text-purple-700",
  "モビリティ・交通": "bg-indigo-50 border-indigo-200 text-indigo-700",
  "不動産・プロップテック": "bg-orange-50 border-orange-200 text-orange-700",
  "リテール・Eコマース": "bg-pink-50 border-pink-200 text-pink-700",
  "アグリテック": "bg-lime-50 border-lime-200 text-lime-700",
  "ロジスティクス・物流": "bg-gray-50 border-gray-200 text-gray-700",
}

interface BusinessTheme {
  id: string
  name: string
  description: string
}

interface BusinessThemeSelectorProps {
  onContinue: (themes: string[]) => void
}

export function BusinessThemeSelector({ onContinue }: BusinessThemeSelectorProps) {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [businessThemes, setBusinessThemes] = useState<BusinessTheme[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchThemes()
  }, [])

  const fetchThemes = async () => {
    try {
      const response = await fetch('/api/admin/themes')
      const { themes } = await response.json()
      setBusinessThemes(themes)
    } catch (error) {
      console.error('Error fetching themes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleThemeToggle = (themeId: string) => {
    setSelectedThemes((prev) => (prev.includes(themeId) ? prev.filter((id) => id !== themeId) : [...prev, themeId]))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">事業テーマを選択</h2>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">事業テーマを選択</h2>
        <p className="text-muted-foreground">解決したい課題や興味のある事業領域を1つ以上選択してください</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businessThemes.map((theme) => {
          const Icon = iconMap[theme.name] || Lightbulb
          const color = colorMap[theme.name] || "bg-gray-50 border-gray-200 text-gray-700"
          const isSelected = selectedThemes.includes(theme.id)

          return (
            <Card
              key={theme.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-card/80"
              }`}
              onClick={() => handleThemeToggle(theme.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{theme.name}</h3>
                      {isSelected && (
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                          選択済み
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{theme.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={() => onContinue(selectedThemes)}
          disabled={selectedThemes.length === 0}
          size="lg"
          className="px-8"
        >
          {selectedThemes.length}個のテーマで続行
        </Button>
      </div>
    </div>
  )
}
