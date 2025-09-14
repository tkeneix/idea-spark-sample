import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("technologies").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ technologies: data || [] })
  } catch (error) {
    console.error("Error fetching technologies:", error)
    return NextResponse.json({ error: "Failed to fetch technologies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, category, maturity_level, description, use_cases, performance_metrics, image_url } =
      await request.json()

    if (!name || !description) {
      return NextResponse.json({ error: "Name and description are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("technologies")
      .insert({
        name,
        category: category || null,
        maturity_level: maturity_level || null,
        description,
        use_cases: use_cases || null,
        performance_metrics: performance_metrics || null,
        image_url: image_url || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ technology: data })
  } catch (error) {
    console.error("Error creating technology:", error)
    return NextResponse.json({ error: "Failed to create technology" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, category, maturity_level, description, use_cases, performance_metrics, image_url } =
      await request.json()

    if (!id || !name || !description) {
      return NextResponse.json({ error: "ID, name and description are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("technologies")
      .update({
        name,
        category: category || null,
        maturity_level: maturity_level || null,
        description,
        use_cases: use_cases || null,
        performance_metrics: performance_metrics || null,
        image_url: image_url || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ technology: data })
  } catch (error) {
    console.error("Error updating technology:", error)
    return NextResponse.json({ error: "Failed to update technology" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Technology ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from("technologies").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting technology:", error)
    return NextResponse.json({ error: "Failed to delete technology" }, { status: 500 })
  }
}
