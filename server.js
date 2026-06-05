require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const CHARIOW_API_KEY = process.env.CHARIOW_API_KEY;
const CHARIOW_API_URL = 'https://api.chariow.com/v1/checkout';

if (!CHARIOW_API_KEY) {
  console.error('[ERROR] CHARIOW_API_KEY manquante dans .env');
  process.exit(1);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ── /api/checkout ── */
app.post('/api/checkout', async (req, res) => {
  const { product_id, email, first_name, last_name, phone_number, phone_country } = req.body;

  if (!product_id || typeof product_id !== 'string') {
    return res.status(400).json({ message: 'product_id manquant ou invalide.' });
  }

  const ALLOWED_PRODUCTS = ['prd_r9u520m5'];
  if (!ALLOWED_PRODUCTS.includes(product_id)) {
    return res.status(400).json({ message: 'Produit non reconnu.' });
  }

  if (!email || !first_name || !last_name || !phone_number) {
    return res.status(400).json({ message: 'Tous les champs sont requis : prénom, nom, email, téléphone.' });
  }

  const payload = {
    product_id,
    email,
    first_name,
    last_name,
    phone: {
      number: phone_number,
      country_code: phone_country || 'SN'
    }
  };

  try {
    const response = await fetch(CHARIOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHARIOW_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Chariow] Erreur API:', response.status, data);
      return res.status(502).json({ message: data.message || 'Erreur lors de la création du checkout.' });
    }

    const checkoutUrl = data?.data?.payment?.checkout_url;

    if (!checkoutUrl) {
      console.error('[Chariow] Réponse inattendue:', JSON.stringify(data));
      return res.status(502).json({ message: 'URL de paiement introuvable dans la réponse.' });
    }

    return res.json({ checkout_url: checkoutUrl });
  } catch (err) {
    console.error('[Chariow] Erreur réseau:', err.message);
    return res.status(503).json({ message: 'Service temporairement indisponible. Réessaie dans quelques secondes.' });
  }
});

/* ── Fallback SPA ── */
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  Afrika Digital Academy`);
  console.log(`  ─────────────────────────────`);
  console.log(`  Serveur lancé sur http://localhost:${PORT}`);
  console.log(`  Environnement : ${process.env.NODE_ENV || 'development'}\n`);
});
