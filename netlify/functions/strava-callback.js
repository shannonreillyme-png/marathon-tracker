exports.handler = async (event) => {
  const { code, error } = event.queryStringParameters || {};

  if (error || !code) {
    return { statusCode: 302, headers: { Location: '/?strava_error=1' }, body: '' };
  }

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  const data = await res.json();

  if (!data.access_token) {
    return { statusCode: 302, headers: { Location: '/?strava_error=1' }, body: '' };
  }

  const tokens = JSON.stringify({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  });

  const html = `<!DOCTYPE html><html><head><title>Connecting…</title></head><body><script>
    const t = ${tokens};
    localStorage.setItem('strava_access_token', t.access_token);
    localStorage.setItem('strava_refresh_token', t.refresh_token);
    localStorage.setItem('strava_expires_at', String(t.expires_at));
    window.location.href = '/';
  </script></body></html>`;

  return { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body: html };
};
