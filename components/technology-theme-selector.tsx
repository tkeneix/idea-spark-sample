"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cpu } from "lucide-react"
import { toast } from "sonner"

interface Technology {
  id: number
  name: string
  description: string
  category: string
}

interface TechnologyThemeSelectorProps {
  onContinue: (technologies: number[]) => void
}

export function TechnologyThemeSelector({ onContinue }: TechnologyThemeSelectorProps) {
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [selectedTechnologies, setSelectedTechnologies] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTechnologies()
  }, [])

  const fetchTechnologies = async () => {
    try {
      const response = await fetch("/api/admin/technologies")
      if (!response.ok) throw new Error("技術テーマの取得に失敗しました")
      const data = await response.json()
      setTechnologies(data.technologies || [])
    } catch (error) {
      toast.error("技術テーマの読み込みに失敗しました")
    } finally {
      setIsLoading(false)
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
        <CardDescription>興味のある技術テーマを選択してください（複数選択可能）</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
                <p className="text-sm text-muted-foreground">{tech.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button onClick={handleSubmit} disabled={selectedTechnologies.length === 0} className="w-full">
          アイデア作成へ進む ({selectedTechnologies.length}個選択中)
        </Button>
      </CardContent>
    </Card>
  )
}
