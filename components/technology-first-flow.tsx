"use client"

import { useState } from "react"
import { TechnologyThemeSelector } from "@/components/technology-theme-selector"
import { TechnologyGenerationForm } from "@/components/technology-generation-form"
import { BusinessThemeRecommendation } from "@/components/business-theme-recommendation"
import { ElevatorPitchGenerator } from "@/components/elevator-pitch-generator"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

type Step = "technologies" | "idea" | "business" | "pitch"

interface TechnologyFirstFlowProps {
  onBack: () => void
}

export function TechnologyFirstFlow({ onBack }: TechnologyFirstFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>("technologies")
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([])
  const [ideaData, setIdeaData] = useState<{ title: string; content: string }>({ title: "", content: "" })
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])

  const handleTechnologySelection = (technologies: string[]) => {
    setSelectedTechnologies(technologies)
    setCurrentStep("idea")
    // Scroll to top when navigating to next step
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleApplicationGeneration = (data: { title: string; content: string }) => {
    setIdeaData(data)
    setCurrentStep("business")
    // Scroll to top when navigating to next step
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBusinessSelection = (themes: string[]) => {
    setSelectedThemes(themes)
    setCurrentStep("pitch")
    // Scroll to top when navigating to next step
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToPath = () => {
    if (currentStep === "technologies") {
      onBack()
    } else if (currentStep === "idea") {
      setCurrentStep("technologies")
    } else if (currentStep === "business") {
      setCurrentStep("idea")
    } else if (currentStep === "pitch") {
      setCurrentStep("business")
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
          技術起点 - ステップ{" "}
          {currentStep === "technologies" ? "1" : currentStep === "idea" ? "2" : currentStep === "business" ? "3" : "4"}{" "}
          / 4
        </div>
      </div>

      {currentStep === "technologies" && <TechnologyThemeSelector onContinue={handleTechnologySelection} />}

      {currentStep === "idea" && (
        <TechnologyGenerationForm
          selectedTechnologies={selectedTechnologies}
          onContinue={handleApplicationGeneration}
        />
      )}

      {currentStep === "business" && (
        <BusinessThemeRecommendation ideaData={ideaData} onContinue={handleBusinessSelection} />
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
