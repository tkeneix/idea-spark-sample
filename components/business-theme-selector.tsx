"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Cpu, Lightbulb, Shield, Building, Leaf } from "lucide-react"
import { useState } from "react"

const businessThemes = [
  {
    id: 1,
    name: "ヘルスケア",
    description: "医療技術、デジタルヘルス、ウェルネスソリューション",
    icon: Heart,
    color: "bg-red-50 border-red-200 text-red-700",
  },
  {
    id: 2,
    name: "5G/6G",
    description: "次世代接続技術と通信インフラ",
    icon: Cpu,
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  {
    id: 3,
    name: "AIエージェント",
    description: "インテリジェント自動化と人工知能",
    icon: Lightbulb,
    color: "bg-purple-50 border-purple-200 text-purple-700",
  },
  {
    id: 4,
    name: "サイバーセキュリティ",
    description: "デジタルセキュリティとプライバシー保護",
    icon: Shield,
    color: "bg-green-50 border-green-200 text-green-700",
  },
  {
    id: 5,
    name: "スマートシティ",
    description: "都市技術とインフラソリューション",
    icon: Building,
    color: "bg-orange-50 border-orange-200 text-orange-700",
  },
  {
    id: 6,
    name: "サステナビリティ",
    description: "環境・クリーンテクノロジーソリューション",
    icon: Leaf,
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
]

interface BusinessThemeSelectorProps {
  onContinue: (themes: number[]) => void
}

export function BusinessThemeSelector({ onContinue }: BusinessThemeSelectorProps) {
  const [selectedThemes, setSelectedThemes] = useState<number[]>([])

  const handleThemeToggle = (themeId: number) => {
    setSelectedThemes((prev) => (prev.includes(themeId) ? prev.filter((id) => id !== themeId) : [...prev, themeId]))
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">事業テーマを選択</h2>
        <p className="text-muted-foreground">解決したい課題や興味のある事業領域を1つ以上選択してください</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businessThemes.map((theme) => {
          const Icon = theme.icon
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
                  <div className={`p-3 rounded-lg ${theme.color}`}>
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
