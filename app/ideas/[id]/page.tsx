"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, User, Clock, Layers, Cpu, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

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

export default function IdeaDetailPage({ params }: { params: { id: string } }) {
  const [idea, setIdea] = useState<IdeaDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [votedIdeas, setVotedIdeas] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchIdea()
    // Load voted ideas from localStorage
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
        // Handle not found
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
        toast.success("Vote recorded!")
      } else {
        if (response.status === 409) {
          toast.error("You've already voted for this idea")
          setVotedIdeas((prev) => new Set([...prev, idea.id]))
        } else {
          toast.error(data.error || "Failed to vote")
        }
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast.error("Failed to vote")
    } finally {
      setIsVoting(false)
    }
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
