<template>
  <div class="min-h-screen bg-layout font-body flex flex-col">

    <!-- Header -->
    <div style="box-shadow: 1px 1px 8px 1px #cfcfcf;" class="h-20 flex-shrink-0 bg-white flex items-center justify-between px-6 md:px-20">
      <nuxt-link to="/"><img src="/images/logo-color.png" alt="Mentora" class="h-16 w-auto" /></nuxt-link>
      <nuxt-link to="/" class="text-sm font-medium text-primary hover:underline">← Retour à l'accueil</nuxt-link>
    </div>

    <div class="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
      <h1 class="text-3xl font-extrabold text-black mb-2">Conditions générales d'utilisation</h1>
      <p class="text-xs text-gray-500 mb-10">Dernière mise à jour : 15 juillet 2026</p>

      <div class="space-y-8 text-sm text-gray-700 leading-relaxed">

        <section>
          <h2 class="text-lg font-bold text-black mb-2">1. Objet</h2>
          <p>
            Les présentes conditions générales d'utilisation (CGU) régissent l'accès et l'utilisation de la
            plateforme Mentora, service de création, de passation et de correction de questionnaires à choix
            multiples (QCM) et d'examens destiné aux établissements scolaires. Toute création de compte ou
            utilisation de la plateforme vaut acceptation pleine et entière des présentes CGU.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">2. Accès au service</h2>
          <p>
            L'accès à Mentora se fait exclusivement sur invitation d'un établissement déjà inscrit (par un
            directeur ou un administrateur) ou par inscription directe pour la création d'un compte établissement.
            Chaque utilisateur (étudiant, professeur, directeur) est responsable de la confidentialité de ses
            identifiants de connexion et de toute activité réalisée depuis son compte.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">3. Abonnements et facturation</h2>
          <p>
            Mentora propose un plan gratuit avec fonctionnalités limitées et des plans payants ("Starter", "Pro")
            facturés mensuellement ou annuellement via notre prestataire de paiement Stripe. Les plans payants
            peuvent inclure une période d'essai gratuite dont la durée est indiquée au moment de la souscription.
            L'établissement peut à tout moment gérer, modifier ou résilier son abonnement depuis son espace de
            gestion. En cas d'échec de paiement ou de résiliation, l'accès aux fonctionnalités du plan payant est
            suspendu et l'établissement repasse automatiquement au plan gratuit, sans suppression immédiate des
            données déjà enregistrées.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">4. Utilisation loyale du service</h2>
          <p class="mb-2">L'utilisateur s'engage à :</p>
          <ul class="list-disc pl-5 space-y-1">
            <li>Ne pas usurper l'identité d'un tiers ni fournir de fausses informations lors de son inscription.</li>
            <li>Ne pas tenter de contourner, désactiver ou perturber les mécanismes de sécurité, de détection de
              fraude ou de contrôle d'accès de la plateforme (notamment pendant le passage d'un examen).</li>
            <li>Ne pas extraire, copier ou diffuser sans autorisation le contenu pédagogique (questions, banques
              de questions, résultats) appartenant à un établissement ou à un professeur tiers.</li>
            <li>Utiliser le service conformément à sa destination pédagogique et administrative.</li>
          </ul>
          <p class="mt-2">
            Tout manquement à ces engagements peut entraîner la suspension ou la suppression du compte concerné,
            sans préjudice d'éventuelles poursuites.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">5. Détection de fraude aux examens</h2>
          <p>
            Lorsqu'un établissement l'active, Mentora peut enregistrer, pendant le passage d'un examen, le nombre
            de changements d'onglet ou de sorties de plein écran, ainsi que le temps de réponse par question, afin
            d'aider les professeurs à identifier des comportements suspects. Ces indicateurs sont fournis à titre
            informatif : la décision finale (invalidation d'une réponse, sanction disciplinaire) relève
            exclusivement de l'établissement et de son règlement intérieur, Mentora n'intervenant pas dans ces
            décisions.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">6. Contenu et propriété intellectuelle</h2>
          <p>
            Les questions, QCM, banques de questions et supports créés par un établissement ou un professeur
            restent leur propriété. En les publiant sur Mentora, l'établissement accorde à Mentora le droit
            strictement nécessaire à l'hébergement, l'affichage et le traitement technique de ces contenus pour
            fournir le service, sans autre droit d'exploitation.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">7. Disponibilité et responsabilité</h2>
          <p>
            Mentora met en œuvre des moyens raisonnables pour assurer la disponibilité et la sécurité du service,
            sans garantie de disponibilité continue (maintenance, incidents techniques indépendants de notre
            volonté). Mentora ne saurait être tenu responsable des conséquences pédagogiques ou administratives
            liées à une indisponibilité temporaire du service, à une perte de connexion internet de l'utilisateur,
            ou à une décision prise par un établissement sur la base des indicateurs fournis par la plateforme.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">8. Protection des données personnelles</h2>
          <p>
            Le traitement des données personnelles dans le cadre de l'utilisation de Mentora est décrit dans notre
            <nuxt-link to="/legal/politique-confidentialite" class="text-primary hover:underline">politique de confidentialité</nuxt-link>,
            qui fait partie intégrante des présentes CGU.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">9. Résiliation</h2>
          <p>
            L'établissement peut résilier son abonnement à tout moment depuis son espace de gestion. Mentora se
            réserve le droit de suspendre ou résilier un compte en cas de non-respect des présentes CGU, de
            non-paiement, ou d'usage frauduleux du service, après notification préalable dans la mesure du possible.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">10. Modification des CGU</h2>
          <p>
            Mentora peut faire évoluer les présentes CGU pour refléter des évolutions légales, techniques ou
            fonctionnelles du service. Les utilisateurs seront informés de toute modification substantielle. La
            poursuite de l'utilisation du service après modification vaut acceptation des nouvelles CGU.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">11. Droit applicable</h2>
          <p>
            Les présentes CGU sont soumises au droit français. Tout litige relatif à leur interprétation ou leur
            exécution sera, à défaut de résolution amiable, porté devant les tribunaux français compétents.
          </p>
        </section>

        <p class="pt-4 text-xs text-gray-400">
          Voir également notre <nuxt-link to="/legal/politique-confidentialite" class="text-primary hover:underline">politique de confidentialité</nuxt-link>
          et nos <nuxt-link to="/legal/mentions-legales" class="text-primary hover:underline">mentions légales</nuxt-link>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
