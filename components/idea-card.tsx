"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Clock, User, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"

interface IdeaCardProps {
  idea: {
    id: number
    title: string
    content: string
    username: string
    vote_count: number
    created_at: string
    themes?: Array<{ id: number; name: string }>
  }
  votedIdeas: Set<number>
  onVote: (ideaId: number, newVoteCount: number) => void
}

export function IdeaCard({ idea, votedIdeas, onVote }: IdeaCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const isVoted = votedIdeas.has(idea.id)

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking vote button
    e.stopPropagation()

    if (isVoting) return

    setIsVoting(true)

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: idea.id }),
      })

      const data = await response.json()

      if (response.ok) {
        onVote(idea.id, data.newVoteCount)
        toast.success("Vote recorded!")
      } else {
        toast.error(data.error || "Failed to vote")
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast.error("Failed to vote")
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <Link href={`/ideas/${idea.id}`}>
      <Card className="h-full hover:shadow-md transition-all duration-200 cursor-pointer group">
        <CardContent className="p-6 h-full flex flex-col">
          <div className="space-y-4 flex-1">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-lg leading-tight text-balance group-hover:text-primary transition-colors">
                {idea.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVote}
                disabled={isVoting}
                className={`flex items-center gap-1 text-sm transition-colors shrink-0 hover:text-red-500`}
              >
                {isVoting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
                {idea.vote_count}
              </Button>
            </div>

            {/* Content */}
            <p className="text-sm text-muted-foreground line-clamp-3 text-pretty flex-1">{idea.content}</p>

            {/* Themes */}
            {idea.themes && idea.themes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {idea.themes.slice(0, 3).map((theme) => (
                  <Badge key={theme.id} variant="secondary" className="text-xs">
                    {theme.name}
                  </Badge>
                ))}
                {idea.themes.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{idea.themes.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {idea.username}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(idea.created_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
