<template>
  <div class="min-h-screen bg-layout font-body flex flex-col">

    <!-- Header -->
    <div style="box-shadow: 1px 1px 8px 1px #cfcfcf;" class="h-20 flex-shrink-0 bg-white flex items-center justify-between px-6 md:px-20">
      <nuxt-link to="/"><img src="/images/logo-color.png" alt="Mentora" class="h-16 w-auto" /></nuxt-link>
      <nuxt-link to="/" class="text-sm font-medium text-primary hover:underline">← Retour à l'accueil</nuxt-link>
    </div>

    <div class="flex-1 max-w-3xl w-full mx-auto px-6 py-12">
      <h1 class="text-3xl font-extrabold text-black mb-2">Mentions légales</h1>
      <p class="text-xs text-gray-500 mb-10">Dernière mise à jour : 15 juillet 2026</p>

      <div class="space-y-8 text-sm text-gray-700 leading-relaxed">

        <section>
          <h2 class="text-lg font-bold text-black mb-2">1. Éditeur du site</h2>
          <p>
            Le service Mentora est édité par <strong>[Raison sociale de la société ou nom de l'entrepreneur individuel]</strong>,
            [forme juridique — SASU, EI, etc.], au capital de [montant] €, immatriculée au
            Registre du Commerce et des Sociétés de [ville] sous le numéro SIRET [numéro],
            dont le siège social est situé [adresse complète].
          </p>
          <p class="mt-2">
            Numéro de TVA intracommunautaire : [numéro].<br/>
            Directeur de la publication : [nom, prénom].<br/>
            Contact : <a class="text-primary hover:underline" href="mailto:contact@mentoraapp.online">contact@mentoraapp.online</a>
          </p>
          <p class="mt-2 text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
            Champs à compléter avec les informations réelles de la structure exploitant Mentora avant mise en ligne
            (auto-entreprise, société, association, etc.). Sans ces informations, cette page n'est pas conforme à
            l'article 6-III de la LCEN.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">2. Hébergement</h2>
          <p>
            Le site et l'application Mentora sont hébergés par :<br/>
            <strong>[Nom de l'hébergeur, ex. Hetzner Online GmbH / OVHcloud SAS]</strong><br/>
            [Adresse de l'hébergeur]<br/>
            [Téléphone / site web de l'hébergeur]
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">3. Propriété intellectuelle</h2>
          <p>
            L'ensemble des éléments composant le site et l'application Mentora (structure, textes, logos, marques,
            interfaces graphiques, code source, base de données) sont la propriété exclusive de l'éditeur ou de ses
            partenaires, sauf mention contraire. Toute reproduction, représentation, modification ou exploitation
            totale ou partielle de ces éléments, par quelque procédé que ce soit, sans autorisation préalable écrite,
            est interdite et pourrait constituer une contrefaçon au sens des articles L.335-2 et suivants du Code de
            la propriété intellectuelle.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">4. Responsabilité</h2>
          <p>
            L'éditeur s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le site,
            mais ne peut garantir l'exhaustivité ou l'absence d'erreurs. L'utilisation des informations et contenus
            disponibles sur l'ensemble du site se fait sous l'entière responsabilité de l'utilisateur. L'éditeur ne
            saurait être tenu responsable des dommages directs ou indirects résultant de l'accès ou de l'usage du
            site, y compris l'inaccessibilité, les pertes de données, ou la présence de virus.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">5. Droit applicable et litiges</h2>
          <p>
            Les présentes mentions légales sont soumises au droit français. En cas de litige et à défaut de
            résolution amiable, les tribunaux français seront seuls compétents.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-bold text-black mb-2">6. Contact</h2>
          <p>
            Pour toute question relative aux présentes mentions légales :
            <a class="text-primary hover:underline" href="mailto:contact@mentoraapp.online">contact@mentoraapp.online</a>
          </p>
        </section>

        <p class="pt-4 text-xs text-gray-400">
          Voir également notre <nuxt-link to="/legal/politique-confidentialite" class="text-primary hover:underline">politique de confidentialité</nuxt-link>
          et nos <nuxt-link to="/legal/cgu" class="text-primary hover:underline">conditions générales d'utilisation</nuxt-link>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
