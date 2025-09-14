"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"

interface IdeasFilterProps {
  onFilterChange: (filters: {
    search: string
    theme: string
    sortBy: string
  }) => void
  themes: Array<{ id: number; name: string }>
}

export function IdeasFilter({ onFilterChange, themes }: IdeasFilterProps) {
  const [search, setSearch] = useState("")
  const [selectedTheme, setSelectedTheme] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  useEffect(() => {
    onFilterChange({ search, theme: selectedTheme, sortBy })
  }, [search, selectedTheme, sortBy, onFilterChange])

  const clearFilters = () => {
    setSearch("")
    setSelectedTheme("all")
    setSortBy("recent")
  }

  const hasActiveFilters = search || selectedTheme !== "all" || sortBy !== "recent"

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ideas, creators, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Theme Filter */}
        <Select value={selectedTheme} onValueChange={setSelectedTheme}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Themes</SelectItem>
            {themes.map((theme) => (
              <SelectItem key={theme.id} value={theme.name}>
                {theme.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="votes">Most Votes</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="flex items-center gap-2 bg-transparent">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{search}"
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch("")} />
            </Badge>
          )}
          {selectedTheme !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Theme: {selectedTheme}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedTheme("all")} />
            </Badge>
          )}
          {sortBy !== "recent" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Sort: {sortBy === "popular" ? "Most Popular" : "Most Votes"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSortBy("recent")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
