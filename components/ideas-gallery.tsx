"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, TrendingUp, Clock, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface BusinessIdea {
  id: number
  title: string
  content: string
  username: string
  vote_count: number
  created_at: string
  themes?: string[]
}

export function IdeasGallery() {
  const [ideas, setIdeas] = useState<BusinessIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [votedIdeas, setVotedIdeas] = useState<Set<number>>(new Set())
  const [votingIdeas, setVotingIdeas] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchIdeas()
    // Load voted ideas from localStorage
    const stored = localStorage.getItem("votedIdeas")
    if (stored) {
      setVotedIdeas(new Set(JSON.parse(stored)))
    }
  }, [])

  const fetchIdeas = async () => {
    try {
      const response = await fetch('/api/ideas?limit=10&sortBy=popular')
      const data = await response.json()
      
      if (!response.ok) throw new Error('Failed to fetch ideas')
      setIdeas(data.ideas || [])
    } catch (error) {
      console.error("Error fetching ideas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (ideaId: number) => {
    if (votingIdeas.has(ideaId)) return

    setVotingIdeas((prev) => new Set([...prev, ideaId]))

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update local state
        setIdeas((prev) => prev.map((idea) => (idea.id === ideaId ? { ...idea, vote_count: data.newVoteCount } : idea)))
        toast.success("Vote recorded!")
      } else {
        toast.error(data.error || "Failed to vote")
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast.error("Failed to vote")
    } finally {
      setVotingIdeas((prev) => {
        const newSet = new Set(prev)
        newSet.delete(ideaId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Community Ideas</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-1"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Community Ideas</h3>
        <Badge variant="outline" className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Top Rated
        </Badge>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {ideas.map((idea) => {
          const isVoting = votingIdeas.has(idea.id)

          return (
            <Card key={idea.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm leading-tight text-balance">{idea.title}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(idea.id)}
                      disabled={isVoting}
                      className="flex items-center gap-1 text-xs transition-colors hover:text-red-500"
                    >
                      {isVoting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Heart className="h-3 w-3" />}
                      {idea.vote_count}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 text-pretty">{idea.content}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>by {idea.username}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(idea.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
