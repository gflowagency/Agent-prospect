# Interdiction du démarchage téléphonique commercial (11/08/2026) — Veille concurrentielle assurance

**Date du rapport :** 11 août 2026 (jour d'entrée en vigueur de la loi)
**Périmètre étudié :** GMF, MAIF, MAAF, MACIF, MMA, Direct Assurance, AXA, Allianz, Groupama, Generali, LEOCARE, Lovys, Acheel, Luko, Crédit Mutuel
**Méthode :** recherche web (WebSearch) menée en parallèle par 5 sous-agents (3 concurrents chacun). De nombreux sites de presse spécialisée (Argus de l'assurance, News Assurances Pro, economie.gouv.fr, service-public.gouv.fr) étaient bloqués en lecture directe (WebFetch) par le proxy réseau de l'environnement d'exécution — l'analyse s'appuie donc sur les extraits indexés par la recherche, pas sur la lecture intégrale des articles. Toutes les affirmations sont sourcées ; les points non confirmés sont explicitement marqués "déduction".

---

## 1. Le cadre réglementaire

- **Texte :** loi n°2025-594 du 30 juin 2025, chapitre "Consentement au démarchage téléphonique" (articles L223-1 à L223-7 du code de la consommation), entrée en vigueur le **11 août 2026**.
- **Bascule de régime :** passage d'un système **opt-out** (Bloctel, où le consommateur doit s'inscrire pour refuser d'être appelé) à un système **opt-in strict** : tout appel commercial est interdit sauf **consentement préalable, libre, spécifique, éclairé, univoque et révocable**, dont l'entreprise doit pouvoir apporter la preuve tangible (case cochée, formulaire signé, etc.).
- **Dérogation clé :** les appels vers des **clients existants dans le cadre d'une relation contractuelle en cours** restent autorisés, s'ils portent sur l'amélioration du service, des produits complémentaires ou le suivi du contrat. C'est l'exception structurante pour tout le secteur assurance/bancassurance.
- **Sanctions :** jusqu'à **75 000 €** pour une personne physique et **375 000 €** pour une entreprise, plus **nullité possible du contrat** conclu à la suite d'un démarchage irrégulier ; signalement possible à la DGCCRF.
- **Sources :** [Légifrance — Chapitre III](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069565/LEGISCTA000032221441/2026-08-11), [France Épargne](https://www.france-epargne.fr/news/demarchage-telephonique-le-passage-a-lopt-in-au-11-aout-2026-rebat-les-cartes-de-lassurance), [Qencia](https://qencia.com/guide/fin-demarchage-telephonique-assurance/).

**Constat transversal n°1 :** un article de l'Argus de l'assurance titré *« Nous ne sommes pas assez mûrs pour nous exprimer »* rapporte que plusieurs grands assureurs et courtiers ont refusé de commenter publiquement leur état de préparation à l'approche de l'échéance. Ceci est cohérent avec ce que la présente veille observe : **quasi aucun des 15 acteurs étudiés n'a publié de communiqué dédié et détaillé** sur son plan de conformité. Le silence public est donc lui-même une donnée.

---

## 2. Synthèse comparative

| Acteur | Modèle de distribution | Exposition à la loi | Dispositif confirmé le plus notable | Communication publique dédiée |
|---|---|---|---|---|
| **GMF** | Réseau direct/salarié (Téléassurances, ~9-10 centres, GMF Conseil) | Modérée (base sociétaires, dérogation applicable) | Lauréat Podium Relation Client 2026 (1er assurance), progrès cités sur "traçabilité" | Non trouvée |
| **MAIF** | Direct, sans intermédiaire | Faible/modérée — en avance sur la conformité | **NIO** : outil open source développé et publié par la MAIF elle-même pour gérer, de façon centralisée, le consentement aux communications commerciales (email, SMS, téléphone, courrier) — cf. [dépôt GitHub officiel](https://github.com/MAIF/nio) | Participation à une conférence sectorielle (All4Customer) sur le sujet |
| **MAAF** | Réseau direct/agences (Covéa) | Plus élevée — antécédent réglementaire | **Sanction DGCCRF 69 500 €** (2025/2026, manquement Bloctel) + CRM "ECLA" (Salesforce) | Non trouvée |
| **MACIF** | Direct, sans intermédiaire | Élevée — réorganisation en cours | **Fermeture de 3 centres de relation client commerciaux** (dont Vénissieux, 51 postes) ; motif officiel non lié à la loi | Non trouvée |
| **MMA** (Covéa) | Réseau d'agents généraux (SAGAMM) + courtiers | Faible — couverte par la dérogation "contrat en cours" | Aucun dispositif spécifique documenté | Non trouvée |
| **Direct Assurance** (filiale AXA) | 100% téléphone/digital, sans agence | Faible structurelle | Croissance forte 2025 (1 Md€ de primes, +300k clients) ; modèle déjà basé sur l'appel entrant | Non trouvée |
| **AXA** (France) | Multi-canal (agents, courtage, direct) | Modérée à élevée (grand réseau) | Souscription en ligne partielle, IA/chatbot en développement général | Non trouvée |
| **Allianz** (France) | Réseau d'agents généraux + Allianz Direct | Modérée (réseau) / faible (Allianz Direct) | Nouveau réseau d'agents généraux spécialisés patrimoine (2026) ; app "Mon Allianz mobile" | Non trouvée |
| **Groupama** | Caisses régionales + réseau commercial | Hétérogène selon les caisses | Partenariat **Kwanko** (affiliation/lead gen email, ~10 ans, primé "Cas d'Or 2026") — canal déjà opt-in | Non trouvée |
| **Generali** (France) | Multi-canal (agents, courtiers, salariés) | Modérée à élevée | Page d'info dédiée sur generali.fr ; chatbots/IA (projet "GIADA"), SVI en langage naturel | Non trouvée (page informative générale) |
| **LEOCARE** | 100% app/chat/email, pas de centre d'appels | Très faible structurelle | **Article de blog dédié** expliquant la loi aux prospects ; racheté par Belfius | Oui — blog pédagogique |
| **Lovys** | 100% digital + service client téléphonique | Faible à modérée | Recrutement CRM/marketing automation (email, SMS, push in-app) | Non trouvée |
| **Acheel** | 100% digital, chat/IA | Très faible structurelle | IA "AIthena" (72-80% de traitement automatisé), croissance forte 2025-2026 | Non trouvée |
| **Luko** (by Allianz Direct) | 100% digital (racheté par Allianz Direct en 2024) | Très faible structurelle | Fusion avec Friday/Eurofil/Allianz Voyage (2026) ; pas de centre d'appels sortant identifié | Non trouvée |
| **Crédit Mutuel** | Bancassurance, conseiller d'agence dédié | Faible — largement couverte par la dérogation | Formulaire **"Se faire rappeler par téléphone"** à consentement explicite déjà en place | Non trouvée |

---

## 3. Quatre grandes familles de réponses observées

### A. Les "déjà conformes" — modèle digital-first, peu ou pas de démarchage sortant
**Acheel, LEOCARE, Lovys, Luko (Allianz Direct), Direct Assurance.**
Ces acteurs reposent structurellement sur l'acquisition digitale (SEO, app, comparateurs, réseaux sociaux) et l'appel **entrant** (rappel à la demande), pas sur la prospection à froid. La loi les affecte peu, voire constitue un avantage compétitif implicite face aux acteurs historiques. LEOCARE est le seul à avoir publié un contenu pédagogique dédié sur le sujet ("la fin du harcèlement téléphonique"), utilisable comme argument de différenciation SEO/marketing. Les autres ne communiquent pas explicitement dessus mais leur modèle les protège de facto.

### B. Les réseaux physiques (agents généraux / conseillers) — protégés par la dérogation "client existant"
**MMA, Allianz, AXA (partie agents), Crédit Mutuel.**
Ces acteurs s'appuient sur une relation contractuelle et humaine déjà établie (agent, conseiller bancaire) qui rentre largement dans le cadre dérogatoire de la loi (suivi de contrat, produits complémentaires). L'enjeu principal n'est pas la fermeture de centres d'appels mais la **formation du réseau et la traçabilité de la preuve de consentement** pour toute prospection hors de ce cadre.

### C. Les mutuelles directes en transformation — bascule CRM / self-care
**MAIF, MAAF, MACIF, GMF, Generali.**
Ces acteurs, plus dépendants historiquement du contact téléphonique de masse (centres de relation client), montrent les signaux les plus concrets de transformation :
- **MAIF** est la plus avancée et la plus transparente : NIO — un outil de gestion du consentement qu'elle a développé et publié elle-même en open source ([github.com/MAIF/nio](https://github.com/MAIF/nio), doc : [maif.github.io/nio](https://maif.github.io/nio/)) pour centraliser les préférences de contact (email, SMS, téléphone, courrier) — plus une stratégie multicanale opt-in documentée par des cas clients tiers (RCS), un chatbot IA, une application dans ChatGPT.
- **MAAF** cumule un antécédent de sanction DGCCRF (Bloctel) et un investissement CRM dédié ("ECLA" sur Salesforce, poste "Pilote d'engagement CRM").
- **MACIF** est le seul acteur où un impact organisationnel concret est documenté : fermeture de 3 centres d'appels commerciaux (dont Vénissieux, 51 postes), bien que la direction n'attribue pas officiellement ces fermetures à la loi.
- **GMF** ne montre pas de dispositif spécifique documenté mais consolide sa relation client (1er du secteur au Podium Relation Client 2026, devant MAIF pour la première fois en 21 ans).
- **Generali** communique sur l'IA et le self-care de façon générale, sans lien explicite établi avec la loi.

### D. Les acteurs à réseau décentralisé
**Groupama** (caisses régionales) fait figure de cas particulier : son partenariat de longue date avec la plateforme d'affiliation **Kwanko** (lead generation par email/affiliation, donc déjà basé sur un consentement explicite) lui donne un canal d'acquisition structurellement compatible avec la loi, indépendamment de toute adaptation récente.

---

## 4. Ce qui n'a PAS été trouvé (limites de la veille)

- Aucune déclaration de dirigeant, pour aucun des 15 acteurs, présentant chiffres à l'appui l'impact business anticipé de cette loi.
- Aucun communiqué de presse dédié "notre plan de conformité opt-in" hormis le contenu de blog de LEOCARE.
- Plusieurs sources potentiellement riches (articles complets de l'Argus de l'assurance, pages institutionnelles complètes, offres d'emploi Teamtailor/Covéa) étaient bloquées en lecture directe dans cet environnement — une vérification manuelle de ces URLs permettrait d'affiner nettement l'analyse.
- La loi entrant en vigueur aujourd'hui même, il est probable que des communications (retours d'expérience, bilans) sortent dans les prochaines semaines : une veille de suivi sur l'Argus de l'assurance et News Assurances Pro est recommandée.

---

## 5. Implication stratégique

Le marché se segmente clairement en trois profils de risque/opportunité face à cette loi :
1. **Gagnants structurels** : les acteurs 100% digitaux (Acheel, LEOCARE, Lovys, Luko/Allianz Direct, Direct Assurance) qui n'ont rien à changer et peuvent en faire un argument commercial.
2. **Protégés par la relation existante** : les réseaux d'agents/conseillers (MMA, Allianz, Crédit Mutuel) dont l'essentiel de l'activité tombe sous la dérogation "contrat en cours", à condition de bien tracer le consentement.
3. **Acteurs en transformation forcée** : les mutuelles à centre d'appels sortant massif (MACIF, MAAF, GMF, Generali, AXA) qui doivent réinventer leur acquisition — via consentement opt-in structuré (MAIF), CRM/preuve de consentement (MAAF), ou réduction de capacité (MACIF).

Pour un acteur externe (solution de conformité, plateforme de gestion du consentement, lead generation opt-in, ou outil de prospection compliant), **le segment C (mutuelles en transformation forcée) est la cible commerciale la plus évidente à court terme** — ce sont les acteurs qui doivent démontrer, dans l'urgence, une infrastructure de preuve de consentement et un canal d'acquisition alternatif au cold calling.

---

## 6. Points d'attention (à vérifier / à relire avant diffusion)

- **Correction apportée le 11/08/2026 (v2) :** la première version de ce rapport citait une page "entreprise.maif.fr" non vérifiée pour le dispositif NIO de la MAIF. Après recherche complémentaire, NIO s'avère être un **projet open source publié par la MAIF elle-même** (dépôt [github.com/MAIF/nio](https://github.com/MAIF/nio), documentation [maif.github.io/nio](https://maif.github.io/nio/)) — une source nettement plus solide, désormais utilisée ci-dessus. Ce genre de correction peut se reproduire : certaines affirmations reposent sur des extraits de recherche (snippets) plutôt que sur la lecture intégrale d'une page.
- **MACIF — lien avec la loi non confirmé.** La fermeture des 3 centres de relation client est un fait vérifié, mais le lien de cause à effet avec la loi opt-in est une **hypothèse de notre part**, pas une déclaration de MACIF. Les motifs officiellement communiqués (absentéisme, conditions de travail) sont différents. À ne pas présenter comme un fait établi dans une communication externe.
- **Accès direct bloqué à de nombreuses sources.** L'environnement de recherche bloque la lecture directe (WebFetch) de la plupart des domaines testés (Argus de l'assurance, News Assurances Pro, economie.gouv.fr, maif.fr, maif.github.io, lemagit.fr...). L'analyse s'appuie donc sur des extraits indexés par la recherche web, pas sur la lecture intégrale des pages — un risque de nuance perdue ou de citation hors contexte existe. Une vérification manuelle (accès direct depuis un poste non bridé) est recommandée avant toute utilisation commerciale ou publique de ce rapport.
- **Silence du marché = donnée fragile.** L'absence de communication publique trouvée pour 12 des 15 acteurs ne prouve pas l'absence d'action — seulement l'absence d'action **rendue publique et indexée** au moment de la recherche (jour J de l'entrée en vigueur). Un suivi à J+15/J+30 est nécessaire pour confirmer ou infirmer ce constat.
- **Aucun test de parcours client réel effectué.** Ni les formulaires de devis, ni les cases de consentement, ni les tunnels "être rappelé" des 15 sites n'ont été testés en navigation réelle — tout repose sur de la recherche documentaire. C'est la limite la plus importante à combler pour une analyse actionnable (voir recommandation ci-dessous).
- **Recommandation de prochaine étape :** un test de parcours réel (navigateur automatisé) sur 4-5 sites clés — MAIF, MACIF, MAAF, LEOCARE, Direct Assurance — donnerait des preuves de premier niveau (capture d'écran de la case de consentement, formulation exacte) plutôt que des déclarations rapportées par la presse.

---

## Sources principales

- [Légifrance — Chapitre III, Consentement au démarchage téléphonique](https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006069565/LEGISCTA000032221441/2026-08-11)
- [France Épargne — Le passage à l'opt-in au 11 août 2026 rebat les cartes de l'assurance](https://www.france-epargne.fr/news/demarchage-telephonique-le-passage-a-lopt-in-au-11-aout-2026-rebat-les-cartes-de-lassurance)
- [Qencia — Fin du démarchage téléphonique assurance](https://qencia.com/guide/fin-demarchage-telephonique-assurance/)
- [Argus de l'assurance — "Nous ne sommes pas assez mûrs pour nous exprimer"](https://www.argusdelassurance.com/reglementation/europe/nous-ne-sommes-pas-assez-murs-pour-nous-exprimer-sur-le-demarchage-telephonique-courtiers-et-assureurs-seront-ils-prets-a-temps.GGONUSGOWJIFPAJL7SGPYSN77Q.html)
- [Argus de l'assurance — La MACIF poursuit la réorganisation de ses centres de relation client](https://www.argusdelassurance.com/mutuelles/macif/la-macif-poursuit-la-reorganisation-de-ses-centres-de-relation-client-une-troisieme-fermeture-annoncee-une-implantation-dans-une-nouvelle-ville-prevue.QNOXBWPXHRDV3GGPAFATSQ7TPM.html)
- [News Assurances Pro — MAAF sanctionnée par la DGCCRF](https://www.newsassurancespro.com/demarchage-telephonique-maaf-assurances-sanctionne-par-la-dgccrf/01691454836)
- [MAIF/nio — dépôt GitHub officiel de l'outil de gestion du consentement](https://github.com/MAIF/nio)
- [Niõ by MAIF — documentation officielle](https://maif.github.io/nio/)
- [LinkMobility — MAIF renforce sa relation client grâce au RCS](https://www.linkmobility.com/fr/ressources/success-stories/maif-renforce-l-excellence-de-sa-relation-client-grace-au-rcs)
- [Kwanko — Démarchage téléphonique et lead generation, pourquoi la loi du 11 août 2026 change la donne](https://www.kwanko.com/fr/academy/affiliation/demarchage-telephonique-et-lead-generation-pourquoi-la-loi-du-11-aout-2026-change-la-donne-pour-votre-strategie-dacquisition/)
- [LEOCARE — Démarchage téléphonique : la fin du harcèlement prévue pour 2026](https://leocare.eu/fr/blog/loi-fin-demarchage-telephonique/)
- [Maddyness — Luko racheté par Allianz Direct](https://www.maddyness.com/2024/01/24/luko-fin-de-la-saga-avec-la-reprise-de-la-startup-par-allianz/)
- [Crédit Mutuel — Se faire rappeler par téléphone](https://www.creditmutuel.fr/fr/contacts/etre-rappele-par-telephone.html)
- [Zonebourse — Direct Assurance franchit le cap du milliard d'euros de primes en 2025](https://www.zonebourse.com/actualite-bourse/direct-assurance-franchit-le-cap-du-milliard-d-euros-de-primes-en-2025-ce7e5ed8d08ff320)

*Rapport généré par recherche automatisée (5 sous-agents en parallèle). À affiner par une vérification manuelle des sources bloquées et un suivi dans les semaines suivant l'entrée en vigueur de la loi.*
