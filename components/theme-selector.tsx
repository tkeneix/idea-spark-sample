"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Lightbulb, Cpu, Shield, Heart, Building, Leaf } from "lucide-react"

const businessThemes = [
  {
    id: 1,
    name: "Healthcare",
    description: "Medical technology, digital health, and wellness solutions",
    icon: Heart,
    color: "bg-red-50 border-red-200 text-red-700",
  },
  {
    id: 2,
    name: "5G/6G",
    description: "Next-generation connectivity and telecommunications",
    icon: Cpu,
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  {
    id: 3,
    name: "AI Agents",
    description: "Intelligent automation and artificial intelligence",
    icon: Lightbulb,
    color: "bg-purple-50 border-purple-200 text-purple-700",
  },
  {
    id: 4,
    name: "Cybersecurity",
    description: "Digital security and privacy protection",
    icon: Shield,
    color: "bg-green-50 border-green-200 text-green-700",
  },
  {
    id: 5,
    name: "Smart City",
    description: "Urban technology and infrastructure solutions",
    icon: Building,
    color: "bg-orange-50 border-orange-200 text-orange-700",
  },
  {
    id: 6,
    name: "Sustainability",
    description: "Environmental and clean technology solutions",
    icon: Leaf,
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
]

interface ThemeSelectorProps {
  selectedThemes: number[]
  onThemeToggle: (themeId: number) => void
  onContinue: () => void
}

export function ThemeSelector({ selectedThemes, onThemeToggle, onContinue }: ThemeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Choose Your Business Themes</h2>
        <p className="text-muted-foreground">Select one or more themes that align with your business interests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businessThemes.map((theme) => {
          const Icon = theme.icon
          const isSelected = selectedThemes.includes(theme.id)

          return (
            <Card
              key={theme.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-card/80"
              }`}
              onClick={() => onThemeToggle(theme.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${theme.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{theme.name}</h3>
                      {isSelected && (
                        <Badge variant="default" className="bg-primary text-primary-foreground">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{theme.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={onContinue} disabled={selectedThemes.length === 0} size="lg" className="px-8">
          Continue with {selectedThemes.length} theme{selectedThemes.length !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  )
}
