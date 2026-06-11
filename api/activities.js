export default async function handler(req, res) {
  // Refresh the access token using Shannon's stored refresh token
  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  const { access_token } = await tokenRes.json();

  if (!access_token) {
    return res.status(500).json({ error: 'Could not get access token' });
  }

  // Fetch all runs since March 2026
  const after = Math.floor(new Date('2026-03-01').getTime() / 1000);
  let all = [], page = 1;

  while (true) {
    const r = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100&page=${page}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const acts = await r.json();
    if (!Array.isArray(acts) || acts.length === 0) break;
    all.push(...acts.filter(a => a.type === 'Run' || a.sport_type === 'Run'));
    if (acts.length < 100) break;
    page++;
  }

  res.setHeader('Cache-Control', 's-maxage=300'); // cache for 5 min
  res.json({ activities: all });
}
