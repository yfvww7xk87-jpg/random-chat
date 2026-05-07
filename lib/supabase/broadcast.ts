// Server-side broadcast via Supabase REST API — no subscription needed
export async function serverBroadcast(
  topic: string,
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/realtime/v1/api/broadcast`

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },
    body: JSON.stringify({
      messages: [{ topic, event, payload }],
    }),
  })
}
