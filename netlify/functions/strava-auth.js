exports.handler = async () => {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.URL + '/.netlify/functions/strava-callback';
  const url = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=activity:read_all&approval_prompt=auto`;
  return { statusCode: 302, headers: { Location: url }, body: '' };
};
