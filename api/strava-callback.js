export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect('/?strava_error=1');
  }

  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  const data = await tokenRes.json();

  if (!data.access_token) {
    return res.redirect('/?strava_error=1');
  }

  const tokens = JSON.stringify({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  });

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html><html><head><title>Connecting…</title></head><body><script>
    const t = ${tokens};
    localStorage.setItem('strava_access_token', t.access_token);
    localStorage.setItem('strava_refresh_token', t.refresh_token);
    localStorage.setItem('strava_expires_at', String(t.expires_at));
    window.location.href = '/';
  </script></body></html>`);
}
