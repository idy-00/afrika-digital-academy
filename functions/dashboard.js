export async function onRequestGet(context) {
  const { env, request } = context;
  const DASHBOARD_PASSWORD = env.DASHBOARD_PASSWORD;

  if (!DASHBOARD_PASSWORD) {
    return new Response('Dashboard non configuré.', { status: 500 });
  }

  const cookie = request.headers.get('Cookie') || '';
  const isAuth = cookie.includes(`ada_auth=${DASHBOARD_PASSWORD}`);

  if (isAuth) {
    const html = await context.env.ASSETS.fetch(new Request('http://localhost/dashboard.html'));
    return html;
  }

  const url = new URL(request.url);
  const submitted = url.searchParams.get('pwd');

  if (submitted === DASHBOARD_PASSWORD) {
    const html = await context.env.ASSETS.fetch(new Request('http://localhost/dashboard.html'));
    const response = new Response(html.body, html);
    response.headers.set('Set-Cookie', `ada_auth=${DASHBOARD_PASSWORD}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`);
    return response;
  }

  const wrong = submitted !== null;

  return new Response(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Dashboard — Accès restreint</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #0e1e16; font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .box {
      background: #162b1e; border: 1px solid #1f3d2a; border-radius: 20px;
      padding: 48px 40px; width: 100%; max-width: 400px; text-align: center;
    }
    .logo { font-size: 48px; margin-bottom: 16px; }
    h1 { color: #C9A84C; font-size: 22px; font-weight: 800; margin-bottom: 6px; }
    p { color: #7a9a84; font-size: 14px; margin-bottom: 32px; }
    form { display: flex; flex-direction: column; gap: 12px; }
    input {
      background: #0e1e16; border: 1px solid #1f3d2a; border-radius: 10px;
      color: #e8e8e8; padding: 14px 16px; font-size: 15px; outline: none;
      transition: border-color .2s;
    }
    input:focus { border-color: #C9A84C; }
    button {
      background: #C9A84C; color: #0e1e16; border: none; border-radius: 10px;
      padding: 14px; font-size: 15px; font-weight: 700; cursor: pointer;
      transition: opacity .2s;
    }
    button:hover { opacity: .85; }
    .error { color: #ff6b6b; font-size: 13px; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="box">
    <div class="logo">🌍</div>
    <h1>Afrika Digital Academy</h1>
    <p>Dashboard Analytics — Accès réservé</p>
    <form method="GET" action="/dashboard">
      <input type="password" name="pwd" placeholder="Mot de passe" autofocus required />
      <button type="submit">Accéder →</button>
      ${wrong ? '<div class="error">Mot de passe incorrect.</div>' : ''}
    </form>
  </div>
</body>
</html>`, {
    status: wrong ? 401 : 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
