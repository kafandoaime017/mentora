// Variables d'environnement factices pour la suite de tests.
// Exécuté par Jest AVANT le chargement de tout module applicatif (voir
// jest.config.js `setupFiles`), donc avant que data-source.ts, stripeController.ts,
// etc. ne lisent process.env au chargement du module.
// Aucune de ces valeurs n'est réelle : ce sont des identifiants factices qui ne
// doivent JAMAIS être utilisés en dehors des tests automatisés.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-ne-pas-utiliser-en-prod';
process.env.JWT_EXPIRES_IN = '1h';
process.env.FRONTEND_URL = 'http://localhost:3000';

process.env.SMTP_HOST = 'localhost';
process.env.SMTP_PORT = '587';
process.env.SMTP_SECURE = 'false';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'dummy';

process.env.GOOGLE_CLIENT_ID = 'dummy-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'dummy-google-client-secret';
process.env.API_URL = 'http://localhost:5000';

process.env.STRIPE_SECRET_KEY = 'sk_test_dummykeyfortestsonly';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_dummy';
process.env.STRIPE_STARTER_MONTHLY = 'price_dummy_starter_monthly';
process.env.STRIPE_STARTER_YEARLY = 'price_dummy_starter_yearly';
process.env.STRIPE_PRO_MONTHLY = 'price_dummy_pro_monthly';
process.env.STRIPE_PRO_YEARLY = 'price_dummy_pro_yearly';

process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
