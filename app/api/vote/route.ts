import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { ideaId } = await request.json()

    if (!ideaId) {
      return NextResponse.json({ error: "Idea ID is required" }, { status: 400 })
    }

    // Get client IP for anonymous voting tracking
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "anonymous"

    const newVoteCount = await Database.voteForIdea(ideaId, ip)
    return NextResponse.json({ success: true, newVoteCount })
  } catch (error) {
    console.error("Error voting:", error)
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 })
  }
}
