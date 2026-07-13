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


export const envoyerInvitation = async (
    email: string,
    prenom: string,
    nom: string,
    role: string,
    filiere: string,
    classe: string | null,
    ecole: string,
    invitationUrl: string,
    expiresAt: Date
): Promise<boolean> => {
    const expiresFormatted = new Date(expiresAt).toLocaleString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })

    return sendEmail({
        to: email,
        subject: `🎓 Invitation à rejoindre Mentora - ${ecole}`,
        template: 'invitation',
        context: {
            prenom,
            nom,
            role: role === 'etudiant' ? 'Étudiant(e)' : role === 'professeur' ? 'Enseignant(e)' : 'Directeur/Directrice',
            filiere,
            classe,
            ecole,
            invitationUrl,
            expiresFormatted
        }
    })
}

export const envoyerVerificationInvitation = async (
    email: string,
    prenom: string,
    verificationUrl: string
): Promise<boolean> => {
    return sendEmail({
        to:       email,
        subject:  '✅ Vérifiez votre email — Mentora',
        template: 'verify-invitation',
        context: {
            prenom,
            verificationUrl
        }
    })
}

export const envoyerEmailSessionDemarree = async (
    email: string,
    prenom: string,
    titreSession: string
): Promise<boolean> => {
    const joinUrl = `${process.env.FRONTEND_URL}/students/join-session`

    return sendEmail({
        to:      email,
        subject: `🚀 Session démarrée : ${titreSession}`,
        template: 'session-demarree',
        context: {
            prenom,
            titreSession,
            joinUrl
        }
    })
}

export const envoyerEmailNouvelleSession = async (
    email: string,
    prenom: string,
    titreSession: string
): Promise<boolean> => {
    const dashboardUrl = `${process.env.FRONTEND_URL}/students`

    return sendEmail({
        to:      email,
        subject: `📚 Nouvelle session disponible : ${titreSession}`,
        template: 'nouvelle-session',
        context: {
            prenom,
            titreSession,
            dashboardUrl
        }
    })
}

export const envoyerEmailNotesPubliees = async (
    email: string,
    prenom: string,
    titreSession: string,
    sessionId: number
): Promise<boolean> => {
    const notesUrl = `${process.env.FRONTEND_URL}/students/notes/${sessionId}`

    return sendEmail({
        to:      email,
        subject: `📋 Vos notes sont disponibles : ${titreSession}`,
        template: 'notes-publiees',
        context: {
            prenom,
            titreSession,
            notesUrl
        }
    })
}


// ─── Paiement échoué ──────────────────────────────────────────────────────────
export const envoyerEmailPaiementEchoue = async (
  email: string,
  prenom: string,
  nomEcole: string,
  montant: string
): Promise<boolean> => {
  return sendEmail({
    to:       email,
    subject:  '⚠️ Paiement échoué — Mentora',
    template: 'paiement-echoue',
    context: {
      prenom, nomEcole, montant,
      abonnementUrl: `${process.env.FRONTEND_URL}/directeurs/abonnement`
    }
  })
}

// ─── Abonnement annulé ────────────────────────────────────────────────────────
export const envoyerEmailAbonnementAnnule = async (
  email: string,
  prenom: string,
  nomEcole: string,
  plan: string
): Promise<boolean> => {
  return sendEmail({
    to:       email,
    subject:  '😢 Votre abonnement a été annulé — Mentora',
    template: 'abonnement-annule',
    context: {
      prenom, nomEcole, plan,
      abonnementUrl: `${process.env.FRONTEND_URL}/directeurs/abonnement`
    }
  })
}

// ─── Fin d'essai dans 7 jours ─────────────────────────────────────────────────
export const envoyerEmailFinEssai = async (
  email: string,
  prenom: string,
  nomEcole: string,
  joursRestants: number,
  finEssai: string
): Promise<boolean> => {
  return sendEmail({
    to:       email,
    subject:  `⏰ Votre essai expire dans ${joursRestants} jours — Mentora`,
    template: 'fin-essai',
    context: {
      prenom, nomEcole, joursRestants, finEssai,
      abonnementUrl: `${process.env.FRONTEND_URL}/directeurs/abonnement`
    }
  })
}

// ─── Facture disponible ───────────────────────────────────────────────────────
export const envoyerEmailFacture = async (
  email: string,
  prenom: string,
  nomEcole: string,
  montant: string,
  periode: string,
  factureUrl: string
): Promise<boolean> => {
  return sendEmail({
    to:       email,
    subject:  `🧾 Votre facture Mentora — ${periode}`,
    template: 'facture',
    context: {
      prenom, nomEcole, montant, periode, factureUrl,
      abonnementUrl: `${process.env.FRONTEND_URL}/directeurs/abonnement`
    }
  })
}

// ─── Plan activé ─────────────────────────────────────────────────────────────
export const envoyerEmailPlanActive = async (
  email: string,
  prenom: string,
  nomEcole: string,
  plan: string,
  isTrial: boolean
): Promise<boolean> => {
  return sendEmail({
    to:       email,
    subject:  `🎉 Plan ${plan.toUpperCase()} activé — Mentora`,
    template: 'plan-active',
    context: {
      prenom, nomEcole, plan, isTrial,
      dashboardUrl: `${process.env.FRONTEND_URL}/directeurs`
    }
  })
}