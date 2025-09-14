"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Save, Copy, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ElevatorPitchGeneratorProps {
  selectedThemes: number[]
  selectedTechnologies: number[]
  existingIdea: { title: string; content: string } | null
  additionalContext?: string
}

export function ElevatorPitchGenerator({
  selectedThemes,
  selectedTechnologies,
  existingIdea,
  additionalContext,
}: ElevatorPitchGeneratorProps) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [elevatorPitch, setElevatorPitch] = useState("")
  const [pitchPoints, setPitchPoints] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [themeNames, setThemeNames] = useState<string[]>([])
  const [technologyNames, setTechnologyNames] = useState<string[]>([])

  useEffect(() => {
    fetchThemeAndTechnologyNames()
  }, [selectedThemes, selectedTechnologies])

  useEffect(() => {
    if (existingIdea) {
      generateElevatorPitch()
    }
  }, [additionalContext, existingIdea])

  const fetchThemeAndTechnologyNames = async () => {
    const supabase = createClient()

    try {
      if (selectedThemes.length > 0) {
        const { data: themes } = await supabase.from("business_themes").select("name").in("id", selectedThemes)
        setThemeNames(themes?.map((theme) => theme.name) || [])
      }

      if (selectedTechnologies.length > 0) {
        const { data: technologies } = await supabase.from("technologies").select("name").in("id", selectedTechnologies)
        setTechnologyNames(technologies?.map((tech) => tech.name) || [])
      }
    } catch (error) {
      console.error("Error fetching theme/technology names:", error)
    }
  }

  const generateElevatorPitch = async () => {
    if (!existingIdea) return

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-elevator-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedThemes: themeNames,
          selectedTechnologies: technologyNames,
          ideaData: existingIdea,
          additionalContext,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setElevatorPitch(data.elevatorPitch || "")
        setPitchPoints(data.pitchPoints || [])
      }
    } catch (error) {
      console.error("Error generating elevator pitch:", error)
      toast.error("エレベーターピッチの生成に失敗しました")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(elevatorPitch)
        setIsCopied(true)
        toast.success("エレベーターピッチをコピーしました")
        setTimeout(() => setIsCopied(false), 2000)
      } else {
        // Fallback: create a temporary textarea and select the text
        const textArea = document.createElement("textarea")
        textArea.value = elevatorPitch
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          document.execCommand("copy")
          setIsCopied(true)
          toast.success("エレベーターピッチをコピーしました")
          setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
          toast.error("コピーに失敗しました。手動でテキストを選択してコピーしてください。")
        }

        document.body.removeChild(textArea)
      }
    } catch (error) {
      console.error("Copy error:", error)
      toast.error("コピーに失敗しました。手動でテキストを選択してコピーしてください。")
    }
  }

  const handleSave = async () => {
    if (!username || !elevatorPitch || !existingIdea) return

    setIsSaving(true)
    const supabase = createClient()

    try {
      console.log("[v0] Starting idea save process")

      const { data, error } = await supabase
        .from("business_ideas")
        .insert({
          title: existingIdea.title,
          content: `${existingIdea.content}\n\n【エレベーターピッチ】\n${elevatorPitch}`,
          username,
          vote_count: 0,
        })
        .select()
        .single()

      if (error) throw error

      console.log("[v0] Idea saved successfully:", data.id)

      if (selectedThemes.length > 0) {
        const themeLinks = selectedThemes.map((themeId) => ({
          idea_id: data.id,
          theme_id: themeId,
        }))
        await supabase.from("idea_themes").insert(themeLinks)
        console.log("[v0] Theme links saved")
      }

      if (selectedTechnologies.length > 0) {
        const techLinks = selectedTechnologies.map((techId) => ({
          idea_id: data.id,
          technology_id: techId,
        }))
        await supabase.from("idea_technologies").insert(techLinks)
        console.log("[v0] Technology links saved")
      }

      toast.success("事業アイデアが保存されました！")
      console.log("[v0] Toast notification triggered")

      // Wait 1.5 seconds before redirecting to ensure toast is visible
      setTimeout(() => {
        router.push("/leaderboard")
      }, 1500)
    } catch (error) {
      console.error("Error saving idea:", error)
      toast.error("保存に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  if (!existingIdea) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">アイデアデータを読み込み中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">エレベーターピッチ生成</h2>
        <p className="text-muted-foreground">リーンスタートアップ手法に基づいた簡潔で効果的なピッチを作成します</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">選択した要素</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div>
                <h4 className="font-medium text-sm mb-2">事業アイデア</h4>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h5 className="font-medium text-sm mb-1">{existingIdea.title}</h5>
                  <p className="text-xs text-muted-foreground line-clamp-3">{existingIdea.content}</p>
                </div>
              </div>

              {additionalContext && (
                <div>
                  <h4 className="font-medium text-sm mb-2">チャットコンテキスト</h4>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 line-clamp-4">{additionalContext}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                エレベーターピッチ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGenerating ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">AIがピッチを生成中...</span>
                </div>
              ) : (
                <>
                  <Textarea
                    value={elevatorPitch}
                    onChange={(e) => setElevatorPitch(e.target.value)}
                    rows={8}
                    className="resize-none"
                    placeholder="エレベーターピッチがここに生成されます..."
                  />

                  <div className="flex gap-3">
                    <Button
                      onClick={generateElevatorPitch}
                      disabled={isGenerating}
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Sparkles className="h-4 w-4" />
                      再生成
                    </Button>

                    <Button onClick={handleCopy} variant="outline" className="flex items-center gap-2 bg-transparent">
                      {isCopied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {isCopied ? "コピー済み" : "コピー"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ピッチのポイント</CardTitle>
            </CardHeader>
            <CardContent>
              {pitchPoints.length > 0 ? (
                <div className="space-y-3">
                  {pitchPoints.map((point, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">ピッチのポイントを生成中...</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>事業アイデアを保存</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">お名前</Label>
                <Input
                  id="username"
                  placeholder="お名前を入力してください..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={!username || !elevatorPitch || isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? "保存中..." : "アイデアを保存"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
