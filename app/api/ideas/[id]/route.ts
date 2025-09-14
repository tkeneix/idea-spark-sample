import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Idea ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
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
            name,
            description
          )
        ),
        idea_technologies (
          technologies (
            id,
            name,
            category,
            maturity_level,
            description
          )
        )
      `,
      )
      .eq("id", id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 })
    }

    // Transform the data
    const transformedData = {
      ...data,
      themes: data.idea_themes?.map((it: any) => it.business_themes).filter(Boolean) || [],
      technologies: data.idea_technologies?.map((it: any) => it.technologies).filter(Boolean) || [],
    }

    return NextResponse.json({ idea: transformedData })
  } catch (error) {
    console.error("Error fetching idea:", error)
    return NextResponse.json({ error: "Failed to fetch idea" }, { status: 500 })
  }
}
