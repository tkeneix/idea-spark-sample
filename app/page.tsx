"use client"

import { useState } from "react"
import { PathSelector } from "@/components/path-selector"
import { IdeaFirstFlow } from "@/components/idea-first-flow"
import { TechnologyFirstFlow } from "@/components/technology-first-flow"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import Link from "next/link"

type Path = "select" | "idea-first" | "technology-first"

export default function HomePage() {
  const [currentPath, setCurrentPath] = useState<Path>("select")

  const handlePathSelect = (path: "idea-first" | "technology-first") => {
    setCurrentPath(path)
  }

  const handleBackToPathSelect = () => {
    setCurrentPath("select")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="mb-4 relative">
              <h1 className="text-4xl font-bold text-foreground text-balance text-center">
                スタートアップスタジオの事業アイディア創出支援サービス（開発中）
              </h1>
              <div className="absolute top-0 right-0">
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {currentPath === "select" && <PathSelector onPathSelect={handlePathSelect} />}

          {currentPath === "idea-first" && <IdeaFirstFlow onBack={handleBackToPathSelect} />}

          {currentPath === "technology-first" && <TechnologyFirstFlow onBack={handleBackToPathSelect} />}
        </div>

        {/* Leaderboard Link Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              🏆 みんなのアイディアランキング
            </h2>
            <p className="text-blue-700 mb-6">
              他のユーザーが投稿したアイディアをチェック！人気のアイディアを見つけよう
            </p>
            <Link href="/leaderboard">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all duration-200">
                ランキングを見る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
