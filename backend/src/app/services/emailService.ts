import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

// Interface pour les données d'email
interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

// Configuration du transporteur
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Configuration Handlebars
const handlebarsOptions: hbs.NodemailerExpressHandlebarsOptions = {
  viewEngine: {
    extname: '.hbs',
    layoutsDir: path.join(__dirname, '..', 'templates', 'emails', 'layouts'),
    partialsDir: path.join(__dirname, '..', 'templates', 'emails', 'partials'),
    defaultLayout: 'main',
  },
  viewPath: path.join(__dirname, '..', 'templates', 'emails'),
  extName: '.hbs',
};

// Appliquer le plugin handlebars
transporter.use('compile', hbs(handlebarsOptions));

// Fonction générique d'envoi d'email
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailOptions: any = {
      from: `"Mentora" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      template: options.template,
      context: {
        ...options.context,
        year: new Date().getFullYear(),
        logoUrl: process.env.LOGO_URL || 'https://mentora.com/images/logo-white.png',
        websiteUrl: process.env.WEBSITE_URL || 'https://mentora.com',
        dashboardUrl: process.env.DASHBOARD_URL || 'https://mentora.com/dashboard',
      },
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${options.to}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

// Fonctions spécifiques
export const envoyerCodeVerification = async (
  email: string,
  code: string,
  firstName: string
): Promise<boolean> => {
  return sendEmail({
    to: email,
    subject: 'Votre code de validation',
    template: 'verification-code',
    context: {
      firstName,
      code,
      expiresIn: '10',
    },
  });
};

export const envoyerBienvenue = async (
  email: string,
  firstName: string
): Promise<boolean> => {
  return sendEmail({
    to: email,
    subject: '🎉 Bienvenue sur Mentora !',
    template: 'welcome',
    context: {
      firstName,
    },
  });
};

export const envoyerResetPassword = async (
  email: string,
  firstName: string,
  resetToken: string,
  resetUrl: string
): Promise<boolean> => {
  return sendEmail({
    to: email,
    subject: '🔒 Réinitialisation de votre mot de passe - Mentora',
    template: 'reset-password',
    context: {
      firstName,
      resetUrl,
      expiresIn: '1 heure',
    },
  });
};

// 🆕 Fonction pour confirmer la réinitialisation du mot de passe
export const envoyerConfirmationResetPassword = async (
  email: string,
  firstName: string
): Promise<boolean> => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;
  
  return sendEmail({
    to: email,
    subject: '✅ Votre mot de passe a été réinitialisé - Mentora',
    template: 'reset-password-confirmation',
    context: {
      firstName,
      loginUrl,
    },
  });
};

// Générer un code à 6 chiffres
export const genererCodeVerification = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};