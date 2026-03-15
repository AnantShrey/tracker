import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ ok: true, note: 'Use supabase cron function daily_rollover() in production.' });
}
