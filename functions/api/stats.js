export async function onRequestGet(context) {
  const { env } = context;
  const KV = env.ADA_ANALYTICS;
  if (!KV) return Response.json({ error: 'KV non configuré' }, { status: 500 });

  const days   = parseInt(new URL(context.request.url).searchParams.get('days') || '30');
  const events = ['PageView', 'InitiateCheckout', 'Purchase', 'ViewContent'];

  // Build list of dates
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  // Fetch all keys in parallel
  const keys = [];
  for (const date of dates) {
    for (const ev of events) {
      keys.push(`day:${date}:${ev}`);
    }
  }
  const totalKeys = events.map(ev => `total:${ev}`);

  const [dayResults, totalResults] = await Promise.all([
    Promise.all(keys.map(k => KV.get(k))),
    Promise.all(totalKeys.map(k => KV.get(k)))
  ]);

  // Build totals
  const totals = {};
  events.forEach((ev, i) => {
    totals[ev] = parseInt(totalResults[i]) || 0;
  });

  // Build series per day
  const series = dates.map((date, di) => {
    const dayEvents = events.map((ev, ei) => {
      const val = dayResults[di * events.length + ei];
      return { event: ev, count: parseInt(val) || 0 };
    }).filter(e => e.count > 0);
    return { date, events: dayEvents };
  });

  // Build flat event list
  const eventList = events.map(ev => ({ event: ev, count: totals[ev] })).filter(e => e.count > 0);

  return Response.json({
    source: 'kv',
    period_days: days,
    events: eventList,
    series,
    totals
  }, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
