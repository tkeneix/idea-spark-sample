"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Save } from "lucide-react"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [recommendationCount, setRecommendationCount] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (!response.ok) throw new Error("設定の取得に失敗しました")
      const data = await response.json()
      setRecommendationCount(data.recommendationCount || 1)
    } catch (error) {
      toast.error("設定の読み込みに失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationCount }),
      })

      if (!response.ok) throw new Error("設定の保存に失敗しました")
      toast.success("設定を保存しました")
    } catch (error) {
      toast.error("設定の保存に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">管理設定</h1>
        <p className="text-muted-foreground">システムの動作設定を管理します</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AIレコメンド設定
          </CardTitle>
          <CardDescription>AIが推薦する項目数を設定できます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recommendationCount">レコメンド数</Label>
            <Input
              id="recommendationCount"
              type="number"
              min="1"
              max="10"
              value={recommendationCount}
              onChange={(e) => setRecommendationCount(Number.parseInt(e.target.value) || 1)}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">AIが推薦するテーマや技術の数を設定します（デフォルト: 1）</p>
          </div>

          <Button onClick={saveSettings} disabled={isSaving} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "保存中..." : "設定を保存"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
