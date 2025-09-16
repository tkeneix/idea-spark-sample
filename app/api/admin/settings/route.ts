import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function GET() {
  try {
    const settings = await Database.getSettingsByKeys(["recommendation_count"])

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

    // Upsert recommendation count setting
    await Database.setSetting("recommendation_count", recommendationCount.toString())

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("設定保存エラー:", error)
    return NextResponse.json({ error: "設定の保存に失敗しました" }, { status: 500 })
  }
}
