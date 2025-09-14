import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get total counts
    const [ideasResult, themesResult, technologiesResult, votesResult] = await Promise.all([
      supabase.from("business_ideas").select("id", { count: "exact", head: true }),
      supabase.from("business_themes").select("id", { count: "exact", head: true }),
      supabase.from("technologies").select("id", { count: "exact", head: true }),
      supabase.from("votes").select("id", { count: "exact", head: true }),
    ])

    // Get recent activity (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data: recentIdeas } = await supabase
      .from("business_ideas")
      .select("id")
      .gte("created_at", weekAgo.toISOString())

    const { data: recentVotes } = await supabase.from("votes").select("id").gte("created_at", weekAgo.toISOString())

    // Get top themes by usage
    const { data: themeUsage } = await supabase.from("idea_themes").select(
      `
        theme_id,
        business_themes (
          name
        )
      `,
    )

    const themeStats = themeUsage?.reduce(
      (acc, item) => {
        const themeName = item.business_themes?.name
        if (themeName) {
          acc[themeName] = (acc[themeName] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const topThemes = Object.entries(themeStats || {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    return NextResponse.json({
      stats: {
        totalIdeas: ideasResult.count || 0,
        totalThemes: themesResult.count || 0,
        totalTechnologies: technologiesResult.count || 0,
        totalVotes: votesResult.count || 0,
        recentIdeas: recentIdeas?.length || 0,
        recentVotes: recentVotes?.length || 0,
        topThemes,
      },
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
