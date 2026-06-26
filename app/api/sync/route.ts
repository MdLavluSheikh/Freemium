import { NextResponse } from 'next/server'
import { syncChannels } from '@/lib/sync'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const result = await syncChannels()
  
  if (result.success) {
    return NextResponse.json({
      success: true,
      totalChannels: result.totalChannels,
      results: result.results,
      message: `Database updated with ${result.totalChannels} channels`,
    })
  } else {
    return NextResponse.json({
      success: false,
      error: result.error,
      results: result.results,
    }, { status: 500 })
  }
}