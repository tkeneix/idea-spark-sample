"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Clock, User, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface IdeaDetailModalProps {
  ideaId: number | null
  isOpen: boolean
  onClose: () => void
}

interface IdeaDetail {
  id: number
  title: string
  content: string
  username: string
  vote_count: number
  created_at: string
  themes: Array<{ id: number; name: string }>
  technologies: Array<{ id: number; name: string }>
}

export function IdeaDetailModal({ ideaId, isOpen, onClose }: IdeaDetailModalProps) {
  const [idea, setIdea] = useState<IdeaDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [voting, setVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    if (ideaId && isOpen) {
      fetchIdeaDetail()
      checkVoteStatus()
    }
  }, [ideaId, isOpen])

  const fetchIdeaDetail = async () => {
    if (!ideaId) return

    setLoading(true)
    const supabase = createClient()

    try {
      // Fetch idea with themes and technologies
      const { data: ideaData, error: ideaError } = await supabase
        .from("business_ideas")
        .select("*")
        .eq("id", ideaId)
        .single()

      if (ideaError) throw ideaError

      // Fetch associated themes
      const { data: themeData } = await supabase
        .from("idea_themes")
        .select("business_themes(id, name)")
        .eq("idea_id", ideaId)

      // Fetch associated technologies
      const { data: techData } = await supabase
        .from("idea_technologies")
        .select("technologies(id, name)")
        .eq("idea_id", ideaId)

      setIdea({
        ...ideaData,
        themes: themeData?.map((item) => item.business_themes).filter(Boolean) || [],
        technologies: techData?.map((item) => item.technologies).filter(Boolean) || [],
      })
    } catch (error) {
      console.error("Error fetching idea detail:", error)
      toast.error("アイデアの詳細を取得できませんでした")
    } finally {
      setLoading(false)
    }
  }

  const checkVoteStatus = () => {
    if (!ideaId) return
    const votedIdeas = JSON.parse(localStorage.getItem("votedIdeas") || "[]")
    setHasVoted(votedIdeas.includes(ideaId))
  }

  const handleVote = async () => {
    if (!idea || hasVoted || voting) return

    setVoting(true)
    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideaId: idea.id }),
      })

      const data = await response.json()

      if (response.ok) {
        setIdea((prev) => (prev ? { ...prev, vote_count: data.newVoteCount } : null))
        setHasVoted(true)

        // Update localStorage
        const votedIdeas = JSON.parse(localStorage.getItem("votedIdeas") || "[]")
        votedIdeas.push(idea.id)
        localStorage.setItem("votedIdeas", JSON.stringify(votedIdeas))

        toast.success("投票しました！")
      } else {
        toast.error(data.error || "投票に失敗しました")
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast.error("投票に失敗しました")
    } finally {
      setVoting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>事業アイデア詳細</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">読み込み中...</span>
          </div>
        ) : idea ? (
          <div className="space-y-6">
            {/* Header with title and vote */}
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-bold text-foreground text-balance">{idea.title}</h2>
              <Button
                onClick={handleVote}
                disabled={hasVoted || voting}
                variant={hasVoted ? "default" : "outline"}
                className="flex items-center gap-2 shrink-0"
              >
                {voting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={`h-4 w-4 ${hasVoted ? "fill-current" : ""}`} />
                )}
                {idea.vote_count}
              </Button>
            </div>

            {/* Meta information */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {idea.username}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(idea.created_at).toLocaleDateString("ja-JP")}
              </div>
            </div>

            {/* Themes and Technologies */}
            <div className="space-y-4">
              {idea.themes.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">事業テーマ</h4>
                  <div className="flex flex-wrap gap-2">
                    {idea.themes.map((theme) => (
                      <Badge key={theme.id} variant="secondary">
                        {theme.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {idea.technologies.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">技術テーマ</h4>
                  <div className="flex flex-wrap gap-2">
                    {idea.technologies.map((tech) => (
                      <Badge key={tech.id} variant="outline">
                        {tech.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h4 className="font-medium">アイデア詳細</h4>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{idea.content}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">アイデアが見つかりませんでした</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
