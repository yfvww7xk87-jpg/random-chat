import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || ''

  if (!ip || ip === '::1' || ip === '127.0.0.1') {
    return NextResponse.json({ country: null, countryCode: null })
  }

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'ometalk.org' },
    })
    const data = await res.json()
    return NextResponse.json({
      country: data.country_name ?? null,
      countryCode: data.country_code ?? null,
    })
  } catch {
    return NextResponse.json({ country: null, countryCode: null })
  }
}
