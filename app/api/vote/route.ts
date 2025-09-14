import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { ideaId } = await request.json()

    if (!ideaId) {
      return NextResponse.json({ error: "Idea ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get client IP for anonymous voting tracking
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "anonymous"

    // Add vote record
    const { error: voteError } = await supabase.from("votes").insert({
      idea_id: ideaId,
      voter_ip: ip,
    })

    if (voteError) throw voteError

    // Get current vote count and increment
    const { data: ideaData, error: fetchError } = await supabase
      .from("business_ideas")
      .select("vote_count")
      .eq("id", ideaId)
      .single()

    if (fetchError) throw fetchError

    const newVoteCount = (ideaData.vote_count || 0) + 1

    // Update vote count
    const { error: updateError } = await supabase
      .from("business_ideas")
      .update({ vote_count: newVoteCount })
      .eq("id", ideaId)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, newVoteCount })
  } catch (error) {
    console.error("Error voting:", error)
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 })
  }
}
