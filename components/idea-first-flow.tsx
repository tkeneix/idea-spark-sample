"use client"

import { useState } from "react"
import { BusinessThemeSelector } from "@/components/business-theme-selector"
import { IdeaGenerationForm } from "@/components/idea-generation-form"
import { TechnologyRecommendation } from "@/components/technology-recommendation"
import { ElevatorPitchGenerator } from "@/components/elevator-pitch-generator"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

type Step = "themes" | "idea" | "technology" | "pitch"

interface IdeaFirstFlowProps {
  onBack: () => void
}

export function IdeaFirstFlow({ onBack }: IdeaFirstFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>("themes")
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const [ideaData, setIdeaData] = useState<{ title: string; content: string }>({ title: "", content: "" })
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([])

  const handleThemeSelection = (themes: string[]) => {
    setSelectedThemes(themes)
    setCurrentStep("idea")
    // Scroll to top when navigating to next step
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleIdeaGeneration = (data: { title: string; content: string }) => {
    setIdeaData(data)
    setCurrentStep("technology")
    // Scroll to top when navigating to next step
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTechnologySelection = (technologies: string[]) => {
    setSelectedTechnologies(technologies)
    setCurrentStep("pitch")
    // Scroll to top when navigating to next step
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToPath = () => {
    if (currentStep === "themes") {
      onBack()
    } else if (currentStep === "idea") {
      setCurrentStep("themes")
    } else if (currentStep === "technology") {
      setCurrentStep("idea")
    } else if (currentStep === "pitch") {
      setCurrentStep("technology")
    }
    // Scroll to top when navigating back
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBackToPath} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          戻る
        </Button>
        <div className="text-sm text-muted-foreground">
          アイデア起点 - ステップ{" "}
          {currentStep === "themes" ? "1" : currentStep === "idea" ? "2" : currentStep === "technology" ? "3" : "4"} / 4
        </div>
      </div>

      {currentStep === "themes" && <BusinessThemeSelector onContinue={handleThemeSelection} />}

      {currentStep === "idea" && (
        <IdeaGenerationForm selectedThemes={selectedThemes} onContinue={handleIdeaGeneration} />
      )}

      {currentStep === "technology" && (
        <TechnologyRecommendation ideaData={ideaData} onContinue={handleTechnologySelection} />
      )}

      {currentStep === "pitch" && (
        <ElevatorPitchGenerator
          selectedThemes={selectedThemes}
          selectedTechnologies={selectedTechnologies}
          existingIdea={ideaData}
        />
      )}
    </div>
  )
}
