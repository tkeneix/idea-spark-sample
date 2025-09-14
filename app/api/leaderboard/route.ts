import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const timeframe = searchParams.get("timeframe") || "all" // all, week, month

    const supabase = await createClient()

    let query = supabase
      .from("business_ideas")
      .select(
        `
        id,
        title,
        content,
        username,
        vote_count,
        created_at,
        idea_themes (
          business_themes (
            name
          )
        )
      `,
      )
      .order("vote_count", { ascending: false })
      .limit(limit)

    // Add time filtering if specified
    if (timeframe === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      query = query.gte("created_at", weekAgo.toISOString())
    } else if (timeframe === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      query = query.gte("created_at", monthAgo.toISOString())
    }

    const { data, error } = await query

    if (error) throw error

    // Transform the data to include theme names
    const transformedData = data?.map((idea) => ({
      ...idea,
      themes: idea.idea_themes?.map((it: any) => it.business_themes?.name).filter(Boolean) || [],
    }))

    return NextResponse.json({ ideas: transformedData || [] })
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
