"use client"

import { useState } from "react"
import { ThemeSelector } from "@/components/theme-selector"
import { IdeaForm } from "@/components/idea-form"
import { IdeasGallery } from "@/components/ideas-gallery"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Trophy, Settings, Compass } from "lucide-react"
import Link from "next/link"

type Step = "themes" | "form"

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<Step>("themes")
  const [selectedThemes, setSelectedThemes] = useState<number[]>([])

  const handleThemeToggle = (themeId: number) => {
    setSelectedThemes((prev) => (prev.includes(themeId) ? prev.filter((id) => id !== themeId) : [...prev, themeId]))
  }

  const handleContinue = () => {
    setCurrentStep("form")
  }

  const handleBack = () => {
    setCurrentStep("themes")
  }

  const handleSaveIdea = async (idea: { title: string; content: string; username: string }) => {
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("business_ideas")
        .insert({
          title: idea.title,
          content: idea.content,
          username: idea.username,
          vote_count: 0,
        })
        .select()
        .single()

      if (error) throw error

      // Link themes to the idea
      if (selectedThemes.length > 0) {
        const themeLinks = selectedThemes.map((themeId) => ({
          idea_id: data.id,
          theme_id: themeId,
        }))

        const { error: linkError } = await supabase.from("idea_themes").insert(themeLinks)

        if (linkError) throw linkError
      }

      toast.success("Business idea saved successfully!")

      // Reset form
      setCurrentStep("themes")
      setSelectedThemes([])
    } catch (error) {
      console.error("Error saving idea:", error)
      toast.error("Failed to save business idea. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <h1 className="text-4xl font-bold text-foreground text-balance">Tane Lab</h1>
                <div className="flex gap-2">
                  <Link href="/discover">
                    <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                      <Compass className="h-4 w-4" />
                      Discover
                    </Button>
                  </Link>
                  <Link href="/leaderboard">
                    <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                      <Trophy className="h-4 w-4" />
                      Leaderboard
                    </Button>
                  </Link>
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                      <Settings className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                </div>
              </div>
              <p className="text-lg text-muted-foreground text-pretty">
                AI-powered business creation service for startup studio applications
              </p>
            </div>

            {currentStep === "themes" && (
              <ThemeSelector
                selectedThemes={selectedThemes}
                onThemeToggle={handleThemeToggle}
                onContinue={handleContinue}
              />
            )}

            {currentStep === "form" && (
              <IdeaForm selectedThemes={selectedThemes} onBack={handleBack} onSave={handleSaveIdea} />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <IdeasGallery />
          </div>
        </div>
      </div>
    </div>
  )
}
