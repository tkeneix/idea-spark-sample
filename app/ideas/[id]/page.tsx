"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, User, Clock, Layers, Cpu, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { ElevatorPitchGenerator } from "@/components/elevator-pitch-generator"
import { LeanCanvasAnalyzer } from "@/components/lean-canvas-analyzer"
import { AIBrainstormingChat } from "@/components/ai-brainstorming-chat"

interface IdeaDetail {
  id: number
  title: string
  content: string
  username: string
  vote_count: number
  created_at: string
  themes: Array<{ id: number; name: string; description: string }>
  technologies: Array<{
    id: number
    name: string
    category: string
    maturity_level: string
    description: string
  }>
}

const showToast = (message: string, type: "success" | "error" = "success") => {
  alert(message)
}

export default function IdeaDetailPage({ params }: { params: { id: string } }) {
  const [idea, setIdea] = useState<IdeaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [votedIdeas, setVotedIdeas] = useState<Set<number>>(new Set())
  const [showAIEnhancement, setShowAIEnhancement] = useState(false)
  const [chatContext, setChatContext] = useState<string>("")

  useEffect(() => {
    fetchIdea()
    const stored = localStorage.getItem("votedIdeas")
    if (stored) {
      setVotedIdeas(new Set(JSON.parse(stored)))
    }
  }, [params.id])

  const fetchIdea = async () => {
    try {
      const response = await fetch(`/api/ideas/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setIdea(data.idea)
      } else if (response.status === 404) {
        setIdea(null)
      }
    } catch (error) {
      console.error("Error fetching idea:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (!idea || votedIdeas.has(idea.id) || isVoting) return

    setIsVoting(true)

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: idea.id }),
      })

      const data = await response.json()

      if (response.ok) {
        setIdea((prev) => (prev ? { ...prev, vote_count: data.newVoteCount } : null))
        setVotedIdeas((prev) => {
          const newSet = new Set([...prev, idea.id])
          localStorage.setItem("votedIdeas", JSON.stringify([...newSet]))
          return newSet
        })
        showToast("Vote recorded!")
      } else {
        if (response.status === 409) {
          showToast("You've already voted for this idea", "error")
          setVotedIdeas((prev) => new Set([...prev, idea.id]))
        } else {
          showToast(data.error || "Failed to vote", "error")
        }
      }
    } catch (error) {
      console.error("Error voting:", error)
      showToast("Failed to vote", "error")
    } finally {
      setIsVoting(false)
    }
  }

  const handleChatContextGenerated = (context: string) => {
    setChatContext(context)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-12 bg-muted rounded w-3/4"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Idea Not Found</h1>
            <p className="text-muted-foreground">The idea you're looking for doesn't exist or has been removed.</p>
            <Link href="/discover">
              <Button className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Discovery
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isVoted = votedIdeas.has(idea.id)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Navigation */}
          <div className="flex items-center gap-4">
            <Link href="/discover">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Back to Discovery
              </Button>
            </Link>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <h1 className="text-3xl font-bold text-foreground text-balance">{idea.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {idea.username}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(idea.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Vote Button */}
              <Button
                onClick={handleVote}
                disabled={isVoted || isVoting}
                variant={isVoted ? "default" : "outline"}
                className={`flex items-center gap-2 ${isVoted ? "bg-red-500 hover:bg-red-600" : "hover:bg-red-50"}`}
              >
                {isVoting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={`h-4 w-4 ${isVoted ? "fill-white" : ""}`} />
                )}
                {idea.vote_count} {idea.vote_count === 1 ? "Vote" : "Votes"}
              </Button>
            </div>

            {/* Selected Themes & Technologies */}
            {(idea.themes.length > 0 || idea.technologies.length > 0) && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Selected Themes & Technologies
                  </h3>
                  <div className="space-y-3">
                    {idea.themes.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Business Themes:</p>
                        <div className="flex flex-wrap gap-2">
                          {idea.themes.map((theme) => (
                            <Badge key={theme.id} variant="secondary" className="text-sm">
                              {theme.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {idea.technologies.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Technologies:</p>
                        <div className="flex flex-wrap gap-2">
                          {idea.technologies.map((tech) => (
                            <Badge key={tech.id} variant="outline" className="text-sm">
                              {tech.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {/* AI Enhancement Button */}
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <Button
                      onClick={() => setShowAIEnhancement(!showAIEnhancement)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      {showAIEnhancement ? "Hide" : "Show"} AI Enhancement
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content */}
            <Card>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-pretty">
                    {idea.content}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Lean Canvas Analysis Section */}
            <LeanCanvasAnalyzer
              ideaTitle={idea.title}
              ideaContent={idea.content}
              selectedThemes={idea.themes.map((t) => t.name)}
              selectedTechnologies={idea.technologies.map((t) => t.name)}
            />

            {/* AI Brainstorming Chat Section */}
            <AIBrainstormingChat
              ideaTitle={idea.title}
              ideaContent={idea.content}
              selectedThemes={idea.themes.map((t) => t.name)}
              selectedTechnologies={idea.technologies.map((t) => t.name)}
              onContextGenerated={handleChatContextGenerated}
              isIdeaFirst={idea.themes.length > 0}
            />

            {/* AI Enhancement Section */}
            {showAIEnhancement && (
              <Card className="border-primary/30">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Idea Enhancement
                  </h3>

                  {chatContext && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-sm mb-2 text-blue-800">チャットから生成されたコンテキスト:</h4>
                      <div className="text-xs text-blue-700 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{chatContext}</pre>
                      </div>
                    </div>
                  )}

                  {(idea.themes.length > 0 || idea.technologies.length > 0) && (
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
                      <h4 className="font-medium text-sm mb-3 text-muted-foreground">Selected for AI Enhancement:</h4>
                      <div className="space-y-2">
                        {idea.themes.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Business Themes: </span>
                            <div className="inline-flex flex-wrap gap-1 mt-1">
                              {idea.themes.map((theme) => (
                                <Badge key={theme.id} variant="secondary" className="text-xs">
                                  {theme.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {idea.technologies.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-muted-foreground">Technologies: </span>
                            <div className="inline-flex flex-wrap gap-1 mt-1">
                              {idea.technologies.map((tech) => (
                                <Badge key={tech.id} variant="outline" className="text-xs">
                                  {tech.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground mb-6">
                    選択したテーマに基づいて、エレベーターピッチと強化されたコンテンツを生成します。
                  </p>
                  <ElevatorPitchGenerator
                    selectedThemes={idea.themes.map((t) => t.name)}
                    selectedTechnologies={idea.technologies.map((t) => t.name)}
                    existingIdea={{
                      title: idea.title,
                      content: idea.content,
                    }}
                    additionalContext={chatContext}
                  />
                </CardContent>
              </Card>
            )}

            {/* Themes and Technologies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Themes */}
              {idea.themes.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      Business Themes
                    </h3>
                    <div className="space-y-3">
                      {idea.themes.map((theme) => (
                        <div key={theme.id} className="space-y-1">
                          <Badge variant="secondary" className="text-sm">
                            {theme.name}
                          </Badge>
                          <p className="text-xs text-muted-foreground">{theme.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Technologies */}
              {idea.technologies.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-primary" />
                      Technologies
                    </h3>
                    <div className="space-y-3">
                      {idea.technologies.map((tech) => (
                        <div key={tech.id} className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-sm">
                              {tech.name}
                            </Badge>
                            {tech.category && (
                              <Badge variant="outline" className="text-xs">
                                {tech.category}
                              </Badge>
                            )}
                            {tech.maturity_level && (
                              <Badge variant="outline" className="text-xs">
                                {tech.maturity_level}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{tech.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Related Actions */}
            <div className="flex items-center justify-center pt-8">
              <Link href="/discover">
                <Button variant="outline" className="bg-transparent">
                  Explore More Ideas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
