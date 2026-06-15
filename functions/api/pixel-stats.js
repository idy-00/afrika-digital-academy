const FB_API = 'https://graph.facebook.com/v19.0';

export async function onRequestGet(context) {
  const { env, request } = context;
  const FB_TOKEN   = env.FB_ACCESS_TOKEN;
  const PIXEL_ID   = env.FB_PIXEL_ID || '1550710343266785';

  if (!FB_TOKEN) {
    return Response.json({ error: 'FB_ACCESS_TOKEN manquant dans les variables CF.' }, { status: 500 });
  }

  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '30');

  const now       = Math.floor(Date.now() / 1000);
  const startTime = now - days * 86400;

  try {
    // Fetch aggregate event counts
    const [eventsRes, dailyRes] = await Promise.all([
      fetch(`${FB_API}/${PIXEL_ID}/stats?aggregation=event&start_time=${startTime}&end_time=${now}&access_token=${FB_TOKEN}`),
      fetch(`${FB_API}/${PIXEL_ID}/stats?aggregation=event_source&start_time=${startTime}&end_time=${now}&access_token=${FB_TOKEN}`)
    ]);

    const events = await eventsRes.json();
    const daily  = await dailyRes.json();

    if (events.error) {
      return Response.json({ error: events.error.message }, { status: 502 });
    }

    // Build daily time series — one call per day for last N days (max 14 for perf)
    const seriesDays = Math.min(days, 14);
    const seriesPromises = Array.from({ length: seriesDays }, (_, i) => {
      const dayStart = now - (seriesDays - i) * 86400;
      const dayEnd   = dayStart + 86400;
      return fetch(`${FB_API}/${PIXEL_ID}/stats?aggregation=event&start_time=${dayStart}&end_time=${dayEnd}&access_token=${FB_TOKEN}`)
        .then(r => r.json())
        .then(data => ({
          date: new Date(dayStart * 1000).toISOString().slice(0, 10),
          events: data.data || []
        }));
    });

    const series = await Promise.all(seriesPromises);

    return Response.json({
      pixel_id: PIXEL_ID,
      period_days: days,
      events: events.data || [],
      daily: daily.data || [],
      series
    }, {
      headers: { 'Cache-Control': 'max-age=300' }
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 503 });
  }
}
