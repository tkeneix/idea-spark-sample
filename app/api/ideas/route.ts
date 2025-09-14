import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || ""
    const theme = searchParams.get("theme") || ""
    const sortBy = searchParams.get("sortBy") || "recent" // recent, popular, votes

    const offset = (page - 1) * limit

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
            id,
            name
          )
        )
      `,
        { count: "exact" },
      )
      .range(offset, offset + limit - 1)

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,username.ilike.%${search}%`)
    }

    // Apply theme filter
    if (theme) {
      query = query.eq("idea_themes.business_themes.name", theme)
    }

    // Apply sorting
    switch (sortBy) {
      case "popular":
        query = query.order("vote_count", { ascending: false }).order("created_at", { ascending: false })
        break
      case "votes":
        query = query.order("vote_count", { ascending: false })
        break
      default: // recent
        query = query.order("created_at", { ascending: false })
    }

    const { data, error, count } = await query

    if (error) throw error

    // Transform the data to include theme names
    const transformedData = data?.map((idea) => ({
      ...idea,
      themes: idea.idea_themes?.map((it: any) => it.business_themes).filter(Boolean) || [],
    }))

    return NextResponse.json({
      ideas: transformedData || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching ideas:", error)
    return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 })
  }
}
