import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function GET() {
  try {
    const technologies = await Database.getTechnologies()
    return NextResponse.json({ technologies })
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

    const technology = await Database.createTechnology({
      name,
      category,
      maturity_level,
      description,
      use_cases,
      performance_metrics,
      image_url
    })

    return NextResponse.json({ technology })
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

    const technology = await Database.updateTechnology(id, {
      name,
      category,
      maturity_level,
      description,
      use_cases,
      performance_metrics,
      image_url
    })

    return NextResponse.json({ technology })
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

    await Database.deleteTechnology(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting technology:", error)
    return NextResponse.json({ error: "Failed to delete technology" }, { status: 500 })
  }
}
