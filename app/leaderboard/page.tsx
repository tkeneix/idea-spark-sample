import { Leaderboard } from "@/components/leaderboard"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">みんなのアイディアランキング</h1>
              <p className="text-muted-foreground">Top-rated business ideas from the community</p>
            </div>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Back to Ideas
              </Button>
            </Link>
          </div>

          <Leaderboard limit={50} showTimeframes={true} />
        </div>
      </div>
    </div>
  )
}
