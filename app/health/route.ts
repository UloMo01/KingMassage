import { NextResponse } from 'next/server'

export async function GET() {
  // Optional: Add checks (e.g., database connection)
  try {
    // Example: Test Supabase connection
    // const supabase = createClient()
    // await supabase.from('some_table').select('count').single()

    return NextResponse.json(
      { status: 'ok', message: 'App is running', timestamp: new Date().toISOString() },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'App is unhealthy', error: (error as Error).message },
      { status: 500 }
    )
  }
}
