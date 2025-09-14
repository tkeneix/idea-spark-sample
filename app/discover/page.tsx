"use client"

import { useState, useEffect, useCallback } from "react"
import { IdeaCard } from "@/components/idea-card"
import { IdeasFilter } from "@/components/ideas-filter"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Idea {
  id: number
  title: string
  content: string
  username: string
  vote_count: number
  created_at: string
  themes?: Array<{ id: number; name: string }>
}

interface Theme {
  id: number
  name: string
}

export default function DiscoverPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [votedIdeas, setVotedIdeas] = useState<Set<number>>(new Set())
  const [filters, setFilters] = useState({
    search: "",
    theme: "",
    sortBy: "recent",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchThemes()
    // Load voted ideas from localStorage
    const stored = localStorage.getItem("votedIdeas")
    if (stored) {
      setVotedIdeas(new Set(JSON.parse(stored)))
    }
  }, [])

  useEffect(() => {
    fetchIdeas(true) // Reset when filters change
  }, [filters])

  const fetchThemes = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase.from("business_themes").select("id, name").order("name")
      if (error) throw error
      setThemes(data || [])
    } catch (error) {
      console.error("Error fetching themes:", error)
    }
  }

  const fetchIdeas = async (reset = false) => {
    const currentPage = reset ? 1 : pagination.page
    if (!reset) setLoadingMore(true)
    else setLoading(true)

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        theme: filters.theme,
        sortBy: filters.sortBy,
      })

      const response = await fetch(`/api/ideas?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (reset) {
          setIdeas(data.ideas || [])
        } else {
          setIdeas((prev) => [...prev, ...(data.ideas || [])])
        }
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching ideas:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [])

  const handleVote = (ideaId: number, newVoteCount: number) => {
    setIdeas((prev) => prev.map((idea) => (idea.id === ideaId ? { ...idea, vote_count: newVoteCount } : idea)))
    setVotedIdeas((prev) => {
      const newSet = new Set([...prev, ideaId])
      localStorage.setItem("votedIdeas", JSON.stringify([...newSet]))
      return newSet
    })
  }

  const loadMore = () => {
    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
    fetchIdeas(false)
  }

  const hasMore = pagination.page < pagination.totalPages

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Discover Ideas</h1>
                <p className="text-muted-foreground">Explore innovative business concepts from the community</p>
              </div>
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-64"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Discover Ideas</h1>
              <p className="text-muted-foreground">
                Explore {pagination.total} innovative business concepts from the community
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <IdeasFilter onFilterChange={handleFilterChange} themes={themes} />

          {/* Ideas Grid */}
          {ideas.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">No ideas found matching your criteria</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {ideas.map((idea) => (
                  <IdeaCard key={idea.id} idea={idea} votedIdeas={votedIdeas} onVote={handleVote} />
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center pt-8">
                  <Button onClick={loadMore} disabled={loadingMore} variant="outline" className="bg-transparent">
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Load More (${pagination.total - ideas.length} remaining)`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
