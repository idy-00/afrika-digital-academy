export async function onRequestPost(context) {
  const { env, request } = context;
  const KV = env.ADA_ANALYTICS;
  if (!KV) return Response.json({ ok: false, error: 'KV non configuré' }, { status: 500 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }

  const event = (body.event || '').replace(/[^a-zA-Z_]/g, '');
  if (!event) return Response.json({ ok: false }, { status: 400 });

  const today = new Date().toISOString().slice(0, 10);

  // Increment daily counter
  const dayKey   = `day:${today}:${event}`;
  const totalKey = `total:${event}`;

  const [dayVal, totalVal] = await Promise.all([
    KV.get(dayKey),
    KV.get(totalKey)
  ]);

  await Promise.all([
    KV.put(dayKey,   String((parseInt(dayVal)   || 0) + 1), { expirationTtl: 60 * 60 * 24 * 120 }),
    KV.put(totalKey, String((parseInt(totalVal) || 0) + 1))
  ]);

  return Response.json({ ok: true }, {
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
