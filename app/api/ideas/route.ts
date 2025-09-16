import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || ""
    const theme = searchParams.get("theme") || ""
    const sortBy = searchParams.get("sortBy") || "recent" // recent, popular, votes

    const { ideas, total } = await Database.getIdeas({
      page,
      limit,
      search,
      theme,
      sortBy
    })

    return NextResponse.json({
      ideas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching ideas:", error)
    return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, username, themeIds = [], technologyIds = [] } = await request.json()

    if (!title || !content || !username) {
      return NextResponse.json({ error: "Title, content, and username are required" }, { status: 400 })
    }

    const idea = await Database.createIdea(
      { title, content, username },
      themeIds,
      technologyIds
    )

    return NextResponse.json({ idea })
  } catch (error) {
    console.error("Error creating idea:", error)
    return NextResponse.json({ error: "Failed to create idea" }, { status: 500 })
  }
}
