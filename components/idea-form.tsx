"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Save, ArrowLeft, MessageCircle, Loader2 } from "lucide-react"

interface IdeaFormProps {
  selectedThemes: number[]
  onBack: () => void
  onSave: (idea: { title: string; content: string; username: string }) => void
}

interface Recommendation {
  title: string
  description: string
}

const themeNames = {
  1: "Healthcare",
  2: "5G/6G",
  3: "AI Agents",
  4: "Cybersecurity",
  5: "Smart City",
  6: "Sustainability",
}

export function IdeaForm({ selectedThemes, onBack, onSave }: IdeaFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [username, setUsername] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(true)
  const [brainstormQuestion, setBrainstormQuestion] = useState("")
  const [brainstormAdvice, setBrainstormAdvice] = useState("")
  const [isBrainstorming, setIsBrainstorming] = useState(false)

  useEffect(() => {
    fetchRecommendations()
  }, [selectedThemes])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/get-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedThemes }),
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const handleGenerateIdeas = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedThemes }),
      })

      if (response.ok) {
        const data = await response.json()
        setTitle(data.title || "")
        setContent(data.description || "")
      } else {
        console.error("Failed to generate ideas")
      }
    } catch (error) {
      console.error("Error generating ideas:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBrainstorm = async () => {
    if (!title || !content) return

    setIsBrainstorming(true)

    try {
      const response = await fetch("/api/brainstorm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          question: brainstormQuestion,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setBrainstormAdvice(data.advice || "")
      }
    } catch (error) {
      console.error("Error brainstorming:", error)
    } finally {
      setIsBrainstorming(false)
    }
  }

  const handleSave = () => {
    if (title && content && username) {
      onSave({ title, content, username })
    }
  }

  const handleRecommendationClick = (recommendation: Recommendation) => {
    setTitle(recommendation.title)
    setContent(recommendation.description)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Themes
        </Button>
        <div className="flex gap-2">
          {selectedThemes.map((themeId) => (
            <Badge key={themeId} variant="secondary">
              {themeNames[themeId as keyof typeof themeNames]}
            </Badge>
          ))}
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Create Your Business Idea</h2>
        <p className="text-muted-foreground">Develop your concept with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Business Idea Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Business Title</Label>
                <Input
                  id="title"
                  placeholder="Enter your business idea title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Business Description</Label>
                <Textarea
                  id="content"
                  placeholder="Describe your business idea, target market, value proposition, and key features..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Your Name</Label>
                <Input
                  id="username"
                  placeholder="Enter your name to save this idea..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleGenerateIdeas}
                  disabled={isGenerating}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isGenerating ? "Generating..." : "Generate AI Ideas"}
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={!title || !content || !username}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Idea
                </Button>
              </div>
            </CardContent>
          </Card>

          {(title || content) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-accent" />
                  AI Brainstorming Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brainstorm">Ask for specific advice (optional)</Label>
                  <Input
                    id="brainstorm"
                    placeholder="e.g., How can I validate this market? What's my competitive advantage?"
                    value={brainstormQuestion}
                    onChange={(e) => setBrainstormQuestion(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleBrainstorm}
                  disabled={isBrainstorming}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  {isBrainstorming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  {isBrainstorming ? "Thinking..." : "Get AI Advice"}
                </Button>

                {brainstormAdvice && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">AI Advice:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{brainstormAdvice}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Recommendations Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRecommendations ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 bg-muted/50 rounded-lg animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleRecommendationClick(rec)}
                    >
                      <h4 className="font-medium text-sm mb-2">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Click any recommendation to use as starting point
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
