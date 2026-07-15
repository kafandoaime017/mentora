<template>
  <div class="min-h-screen bg-layout font-body flex flex-col">

    <!-- Header -->
    <div style="box-shadow: 1px 1px 8px 1px #cfcfcf;" class="h-20 flex-shrink-0 bg-white flex items-center justify-between px-6 md:px-20">
      <nuxt-link to="/"><img src="/images/logo-color.png" alt="Mentora" class="h-16 w-auto" /></nuxt-link>
      <nuxt-link to="/" class="text-sm font-medium text-primary hover:underline">← Retour à l'accueil</nuxt-link>
    </div>

    <div class="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
      <h1 class="text-3xl font-extrabold text-black mb-2">Politique de confidentialité</h1>
      <p class="text-xs text-gray-500 mb-10">Dernière mise à jour : 15 juillet 2026</p>

      <div class="space-y-8 text-sm text-gray-700 leading-relaxed">

        <section>
          <p>
            Mentora ("nous") propose une plateforme de gestion d'examens et de questionnaires à choix multiples
            (QCM) destinée aux établissements scolaires (écoles, professeurs, étudiants, personnel de direction).
            Cette politique explique quelles données personnelles nous collectons, pourquoi, comment elles sont
            protégées, et quels sont vos droits. Elle s'applique conformément au Règlement Général sur la
            Protection des Données (RGPD — Règlement UE 2016/679) et à la loi Informatique et Libertés.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">1. Qui est responsable du traitement ?</h2>
          <p>
            Le responsable du traitement est <strong>[Raison sociale de l'éditeur de Mentora]</strong>, [adresse],
            joignable à <a class="text-primary hover:underline" href="mailto:contact@mentoraapp.online">contact@mentoraapp.online</a>.
            L'établissement scolaire qui souscrit à Mentora agit en tant que responsable de traitement pour les
            données de ses propres élèves et personnels ; Mentora agit alors en tant que sous-traitant au sens de
            l'article 28 du RGPD.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">2. Quelles données collectons-nous ?</h2>
          <p class="mb-2"><strong>Données d'identification et de compte</strong> : nom, prénom, adresse email,
            rôle (étudiant, professeur, directeur, superadmin), établissement, filière et classe rattachés, mot de
            passe (stocké de façon chiffrée, jamais en clair), et, si vous utilisez la connexion Google, les
            informations de profil transmises par Google (nom, email, photo).</p>
          <p class="mb-2"><strong>Données pédagogiques</strong> : réponses aux QCM et examens, notes obtenues,
            temps de réponse par question et nombre de changements d'onglet/sorties de plein écran pendant un
            examen (fonction de détection de fraude activable par l'établissement), historique de participation
            aux sessions.</p>
          <p class="mb-2"><strong>Données de facturation</strong> : plan d'abonnement de l'établissement, statut de
            paiement. Les coordonnées bancaires ne sont jamais stockées par Mentora : elles sont saisies et
            conservées directement par notre prestataire de paiement, Stripe.</p>
          <p class="mb-2"><strong>Journaux techniques et de sécurité</strong> : logs d'audit (qui a fait quoi,
            quand, depuis quelle adresse IP) conservés par l'établissement à des fins de conformité et de sécurité,
            et journaux d'erreurs applicatives (via notre outil de supervision auto-hébergé) pouvant contenir des
            identifiants techniques en cas d'incident.</p>
          <p><strong>Données de mesure d'audience</strong> : nous utilisons un outil d'analytics auto-hébergé et
            respectueux de la vie privée (sans cookies, données anonymisées) pour comprendre l'usage global de la
            plateforme, sans suivi individuel nominatif.</p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">3. Pourquoi traitons-nous ces données ?</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li>Exécution du contrat conclu avec l'établissement (fourniture du service, gestion des comptes, des
              sessions d'examen et des résultats).</li>
            <li>Intérêt légitime de l'établissement et de Mentora à assurer la sécurité, l'intégrité des examens et
              la traçabilité des actions (audit, détection de fraude).</li>
            <li>Obligations légales et comptables (facturation, conservation de certains documents).</li>
            <li>Consentement, lorsque vous choisissez de vous connecter via Google.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">4. Combien de temps conservons-nous vos données ?</h2>
          <p>
            Les données de compte et pédagogiques sont conservées pendant la durée de la relation contractuelle
            avec l'établissement, puis archivées ou supprimées selon la durée de scolarité et les obligations
            légales applicables. Les logs d'audit sont conservés [durée à définir par l'établissement, ex. 1 an]
            à des fins de conformité. Les journaux techniques d'erreurs sont automatiquement purgés au bout de 30
            jours.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">5. Avec qui partageons-nous vos données ?</h2>
          <p class="mb-2">
            Vos données ne sont jamais vendues. Elles peuvent être transmises aux prestataires strictement
            nécessaires au fonctionnement du service :
          </p>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>Stripe</strong> (paiement et gestion des abonnements) — transfert hors UE encadré par des
              clauses contractuelles types.</li>
            <li><strong>Google</strong> (connexion OAuth, uniquement si vous choisissez cette méthode de connexion).</li>
            <li>Notre <strong>hébergeur</strong> et notre prestataire d'envoi d'emails transactionnels (notifications,
              réinitialisation de mot de passe).</li>
            <li>L'établissement scolaire auquel vous êtes rattaché (directeur, personnel autorisé), dans la limite
              de leurs besoins pédagogiques et administratifs.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">6. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation,
            d'opposition et de portabilité de vos données, ainsi que du droit de définir des directives sur le
            sort de vos données après votre décès. Pour les élèves mineurs, ces droits sont exercés par les
            titulaires de l'autorité parentale ou par l'établissement selon l'organisation retenue.
          </p>
          <p class="mt-2">
            Pour exercer ces droits, contactez votre établissement (responsable de traitement pour vos données
            scolaires) ou écrivez-nous directement à
            <a class="text-primary hover:underline" href="mailto:contact@mentoraapp.online">contact@mentoraapp.online</a>.
            Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr).
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">7. Sécurité</h2>
          <p>
            Les mots de passe sont stockés sous forme hachée. Les échanges avec la plateforme sont chiffrés (HTTPS).
            L'accès aux données est limité par rôle (étudiant, professeur, directeur, superadmin) et toutes les
            actions sensibles sont tracées dans un journal d'audit consultable par le directeur d'établissement.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">8. Modifications de cette politique</h2>
          <p>
            Cette politique peut être mise à jour pour refléter des évolutions légales ou fonctionnelles. La date
            de dernière mise à jour figure en haut de cette page.
          </p>
        </section>

        <p class="pt-4 text-xs text-gray-400">
          Voir également nos <nuxt-link to="/legal/cgu" class="text-primary hover:underline">conditions générales d'utilisation</nuxt-link>
          et nos <nuxt-link to="/legal/mentions-legales" class="text-primary hover:underline">mentions légales</nuxt-link>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
