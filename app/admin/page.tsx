import { AdminStats } from "@/components/admin/admin-stats"
import { ThemeManager } from "@/components/admin/theme-manager"
import { TechnologyManager } from "@/components/admin/technology-manager"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Settings className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">管理ポータル</h1>
                <p className="text-muted-foreground">Manage themes, technologies, and platform content</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Topへ戻る
              </Button>
            </Link>
          </div>

          {/* Statistics */}
          <AdminStats />

          {/* Management Sections */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <ThemeManager />
            <TechnologyManager />
          </div>
        </div>
      </div>
    </div>
  )
}
