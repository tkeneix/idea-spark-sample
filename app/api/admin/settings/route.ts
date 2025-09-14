import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data: settings } = await supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", ["recommendation_count"])

    const settingsMap =
      settings?.reduce(
        (acc, setting) => {
          acc[setting.key] = setting.value
          return acc
        },
        {} as Record<string, any>,
      ) || {}

    return NextResponse.json({
      recommendationCount: settingsMap.recommendation_count || 1,
    })
  } catch (error) {
    console.error("設定取得エラー:", error)
    return NextResponse.json({ error: "設定の取得に失敗しました" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { recommendationCount } = await request.json()
    const supabase = await createServerClient()

    // Upsert recommendation count setting
    const { error } = await supabase.from("admin_settings").upsert({
      key: "recommendation_count",
      value: recommendationCount,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("設定保存エラー:", error)
    return NextResponse.json({ error: "設定の保存に失敗しました" }, { status: 500 })
  }
}
