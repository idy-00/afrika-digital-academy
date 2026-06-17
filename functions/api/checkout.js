const ALLOWED_PRODUCTS = ['prd_r9u520m5'];
const CHARIOW_API_URL = 'https://api.chariow.com/v1/checkout';

export async function onRequestPost(context) {
  const { env, request } = context;

  const CHARIOW_API_KEY = env.CHARIOW_API_KEY;
  if (!CHARIOW_API_KEY) {
    return Response.json({ message: 'Configuration serveur manquante.' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: 'Corps de requête invalide.' }, { status: 400 });
  }

  const { product_id, email, first_name, last_name, phone_number, phone_country } = body;

  if (!product_id || typeof product_id !== 'string') {
    return Response.json({ message: 'product_id manquant ou invalide.' }, { status: 400 });
  }

  if (!ALLOWED_PRODUCTS.includes(product_id)) {
    return Response.json({ message: 'Produit non reconnu.' }, { status: 400 });
  }

  if (!email || !first_name || !last_name || !phone_number) {
    return Response.json(
      { message: 'Tous les champs sont requis : prénom, nom, email, téléphone.' },
      { status: 400 }
    );
  }

  const origin = new URL(request.url).origin;

  const payload = {
    product_id,
    email,
    first_name,
    last_name,
    phone: {
      number: phone_number,
      country_code: phone_country || 'SN'
    },
    redirect_url: `${origin}/merci`
  };

  try {
    const response = await fetch(CHARIOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CHARIOW_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { message: data.message || 'Erreur lors de la création du checkout.' },
        { status: 502 }
      );
    }

    const checkoutUrl = data?.data?.payment?.checkout_url;

    if (!checkoutUrl) {
      return Response.json({ message: 'URL de paiement introuvable dans la réponse.' }, { status: 502 });
    }

    return Response.json({ checkout_url: checkoutUrl });
  } catch {
    return Response.json(
      { message: 'Service temporairement indisponible. Réessaie dans quelques secondes.' },
      { status: 503 }
    );
  }
}
