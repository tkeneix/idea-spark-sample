import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("business_themes").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ themes: data || [] })
  } catch (error) {
    console.error("Error fetching themes:", error)
    return NextResponse.json({ error: "Failed to fetch themes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, image_url } = await request.json()

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("business_themes")
      .insert({
        name,
        description,
        image_url: image_url || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ theme: data })
  } catch (error) {
    console.error("Error creating theme:", error)
    return NextResponse.json({ error: "Failed to create theme" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, description, image_url } = await request.json()

    if (!id || !name || !description) {
      return NextResponse.json({ error: "ID, name and description are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("business_themes")
      .update({
        name,
        description,
        image_url: image_url || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ theme: data })
  } catch (error) {
    console.error("Error updating theme:", error)
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Theme ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from("business_themes").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting theme:", error)
    return NextResponse.json({ error: "Failed to delete theme" }, { status: 500 })
  }
}
