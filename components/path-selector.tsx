"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, Cpu, ArrowRight } from "lucide-react"

interface PathSelectorProps {
  onPathSelect: (path: "idea-first" | "technology-first") => void
}

export function PathSelector({ onPathSelect }: PathSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">事業創造の出発点を選択</h2>
        <p className="text-muted-foreground">2つのアプローチから選択してください</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Idea-First Path */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-4 bg-blue-50 rounded-full w-fit">
              <Lightbulb className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">アイデア起点</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center leading-relaxed">
              解決したい課題や事業テーマから始めて、適切な技術を見つけるアプローチ
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>事業テーマを選択</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>AI発想支援でアイデア生成</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>技術テーマをレコメンド</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>エレベーターピッチ作成</span>
              </div>
            </div>
            <Button onClick={() => onPathSelect("idea-first")} className="w-full flex items-center gap-2">
              アイデア起点で始める
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Technology-First Path */}
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-4 bg-purple-50 rounded-full w-fit">
              <Cpu className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-xl">技術起点</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center leading-relaxed">
              利用可能な技術資産から始めて、事業機会を発見するアプローチ
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>技術テーマを選択</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>AI発想支援でアイデア生成</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>事業テーマをレコメンド</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>エレベーターピッチ作成</span>
              </div>
            </div>
            <Button onClick={() => onPathSelect("technology-first")} className="w-full flex items-center gap-2">
              技術起点で始める
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
        <p className="leading-relaxed">
        </p>
      </div>
    </div>
  )
}
