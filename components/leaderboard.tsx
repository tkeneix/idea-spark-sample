"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Heart, Clock, TrendingUp } from "lucide-react"

interface LeaderboardIdea {
  id: number
  title: string
  content: string
  username: string
  vote_count: number
  created_at: string
  themes: string[]
}

interface LeaderboardProps {
  limit?: number
  showTimeframes?: boolean
}

export function Leaderboard({ limit = 10, showTimeframes = true }: LeaderboardProps) {
  const [ideas, setIdeas] = useState<LeaderboardIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"all" | "week" | "month">("all")

  useEffect(() => {
    fetchLeaderboard()
  }, [timeframe, limit])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/leaderboard?limit=${limit}&timeframe=${timeframe}`)
      if (response.ok) {
        const data = await response.json()
        setIdeas(data.ideas || [])
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
    }
  }

  const getTimeframeLabel = (tf: string) => {
    switch (tf) {
      case "week":
        return "This Week"
      case "month":
        return "This Month"
      default:
        return "All Time"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-6 w-12 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Leaderboard
        </CardTitle>
        {showTimeframes && (
          <div className="flex gap-2">
            {["all", "month", "week"].map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf as "all" | "week" | "month")}
                className="text-xs"
              >
                {getTimeframeLabel(tf)}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ideas.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No ideas found for this timeframe</p>
          ) : (
            ideas.map((idea, index) => (
              <div
                key={idea.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  index < 3 ? "bg-accent/10 border border-accent/20" : "bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background">
                  {getRankIcon(index)}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm leading-tight text-balance line-clamp-2">{idea.title}</h4>
                    <div className="flex items-center gap-1 text-sm font-medium text-primary">
                      <Heart className="h-3 w-3 fill-current" />
                      {idea.vote_count}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 text-pretty">{idea.content}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">by {idea.username}</span>
                      {idea.themes.length > 0 && (
                        <div className="flex gap-1">
                          {idea.themes.slice(0, 2).map((theme) => (
                            <Badge key={theme} variant="outline" className="text-xs px-1 py-0">
                              {theme}
                            </Badge>
                          ))}
                          {idea.themes.length > 2 && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              +{idea.themes.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(idea.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
