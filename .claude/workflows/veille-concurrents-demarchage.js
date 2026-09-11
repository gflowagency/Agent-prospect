export const meta = {
  name: 'veille-concurrents-demarchage',
  description: "Veille concurrentielle périodique : ce que les assureurs concurrents mettent en place face à l'interdiction du démarchage téléphonique opt-in (loi n°2025-594, 11/08/2026)",
  phases: [
    { title: 'Recherche par concurrent' },
    { title: 'Synthèse comparative' },
  ],
}

const REG_CONTEXT = "Loi n°2025-594 du 30 juin 2025 (articles L223-1 à L223-7 du code de la consommation), entrée en vigueur le 11 août 2026. Bascule d'un régime opt-out (Bloctel) à un régime opt-in strict pour le démarchage téléphonique commercial : consentement préalable, libre, spécifique, éclairé, univoque et révocable obligatoire, avec preuve à l'appui. Dérogation : appels vers des clients existants dans le cadre d'une relation contractuelle en cours (suivi de contrat, produits complémentaires). Sanctions jusqu'à 75 000€ (personne physique) / 375 000€ (entreprise), nullité possible du contrat conclu irrégulièrement. Source : https://www.service-public.gouv.fr/particuliers/actualites/A19003"

const DEFAULT_COMPETITORS = [
  'GMF', 'MAIF', 'MAAF', 'MACIF', 'MMA', 'Direct Assurance', 'AXA', 'Allianz',
  'Groupama', 'Generali', 'LEOCARE', 'Lovys', 'Acheel', 'Luko', 'Crédit Mutuel',
  'Alan', 'Seyna', 'Descartes Insurance', 'Mila',
]

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    competiteur: { type: 'string' },
    dispositifs_identifies: { type: 'array', items: { type: 'string' } },
    communication_publique_dediee: { type: 'string' },
    article_pedagogique_grand_public: { type: 'string', description: "Existence et description d'un article/FAQ/page blog expliquant la loi opt-in aux prospects/clients, avec URL si trouvé, sinon 'non trouvé'" },
    case_a_cocher_consentement: { type: 'string', description: "Ce qui a été observé sur le site du concurrent lui-même (devis, souscription, contact, 'être rappelé') concernant une case à cocher ou un mécanisme explicite de consentement au démarchage téléphonique, avec URL de la page si trouvé, sinon 'non vérifié' ou 'non trouvé'" },
    contexte_case_a_cocher: { type: 'string', description: "Si une case a été trouvée : dans quel type de page/parcours (devis/souscription commerciale, 'être rappelé pour une offre', vs formulaire de contact générique multi-usages type SAV/réclamation) — une case sur un parcours commercial dédié est une preuve plus forte qu'une case sur un formulaire de contact générique" },
    document_de_reference_verifie: { type: 'string', description: "Le document le plus autoritaire et le plus large trouvé (politique de données personnelles générale du groupe, mentions légales, CGU) : URL, date de dernière mise à jour si visible, et verdict sur ce document précis" },
    base_legale_demarchage_telephonique: { type: 'string', enum: ['consentement_explicite', 'interet_legitime', 'opposition_bloctel', 'non_precisee', 'non_trouve'], description: "Base légale déclarée par le concurrent pour justifier le démarchage téléphonique commercial, telle que trouvée sur son document de référence. 'interet_legitime' ou 'opposition_bloctel' sont NON CONFORMES à la loi opt-in du 11/08/2026, même si le sujet est mentionné." },
    reference_bloctel_residuelle: { type: 'boolean', description: "true si une page encore en ligne présente Bloctel comme actif/pertinent (Bloctel a disparu le 11/08/2026) — signal fort de contenu non actualisé" },
    contradiction_interne: { type: 'string', description: "Si le document de référence général et une page isolée (agence locale, formulaire spécifique) se contredisent, décrire la contradiction. Le document de référence général PRIME sur l'exception locale pour le verdict final." },
    exposition_a_la_loi: { type: 'string', enum: ['faible', 'moderee', 'elevee'] },
    changements_depuis_dernier_rapport: { type: 'string' },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          titre: { type: 'string' },
          url: { type: 'string' },
          domaine_du_concurrent: { type: 'boolean', description: "true si l'URL est bien sur un domaine appartenant au concurrent lui-même ; false si c'est un tiers (syndicat professionnel, presse, partenaire...) — une source tierce peut donner du contexte utile mais ne doit jamais être présentée comme la position officielle du concurrent" },
        },
        required: ['url'],
      },
    },
  },
  required: ['competiteur', 'dispositifs_identifies', 'sources'],
}

const SYNTHESIS_SCHEMA = {
  type: 'object',
  properties: {
    rapport_markdown: { type: 'string' },
  },
  required: ['rapport_markdown'],
}

let parsedArgs = args
if (typeof parsedArgs === 'string') {
  try { parsedArgs = JSON.parse(parsedArgs) } catch (e) { parsedArgs = null }
}

const competitors = (parsedArgs && Array.isArray(parsedArgs.competitors) && parsedArgs.competitors.length) ? parsedArgs.competitors : DEFAULT_COMPETITORS
const previousReport = (parsedArgs && parsedArgs.previousReport) || null
const asOf = (parsedArgs && parsedArgs.asOf) || 'date non précisée'

if (!parsedArgs || !Array.isArray(parsedArgs.competitors) || !parsedArgs.competitors.length) {
  log(`Aucune liste de concurrents valide reçue en args — utilisation de la liste par défaut (${DEFAULT_COMPETITORS.length} concurrents). Vérifier l'appel si ce n'est pas voulu.`)
}

phase('Recherche par concurrent')
log(`Lancement de la recherche pour ${competitors.length} concurrents (au ${asOf})`)

const METHODOLOGIE = `Méthode d'analyse à respecter strictement (affinée le 11/09/2026 sur plusieurs cas réels — GMF, LEOCARE, AXA, Generali) :

1. LE DOCUMENT DE RÉFÉRENCE PRIME SUR L'EXCEPTION LOCALE. Cherche d'abord le document le plus large et
   le plus autoritaire du concurrent : sa politique générale de données personnelles / prospection
   commerciale (pas une page d'agence ou de filiale isolée). C'est CE document qui doit être conforme
   pour que le concurrent soit jugé "conforme". Si tu trouves un bon signal isolé (ex: case à cocher
   correcte sur la page d'une seule agence) mais que le document général dit ou sous-entend autre chose,
   c'est le document général qui l'emporte pour le verdict — signale la contradiction, ne la gomme pas.

2. VÉRIFIE LA BASE LÉGALE DÉCLARÉE, PAS SEULEMENT SI LE SUJET EST "MENTIONNÉ". Un concurrent qui parle du
   démarchage téléphonique n'est pas automatiquement conforme. Cherche la base légale précise invoquée
   pour le démarchage téléphonique commercial : "consentement" (conforme) vs "intérêt légitime" ou
   renvoi vers "Bloctel" comme mécanisme d'opposition (NON conforme à la loi opt-in du 11/08/2026, même
   si le texte est par ailleurs bien écrit et correctement daté). Une page encore en ligne qui présente
   Bloctel comme actif/pertinent est un signal fort de contenu non actualisé (Bloctel a disparu le
   11/08/2026) — à signaler explicitement (champ reference_bloctel_residuelle).

3. LE CONTEXTE D'UNE CASE À COCHER COMPTE AUTANT QUE SON TEXTE. Une case de consentement trouvée dans un
   vrai parcours commercial (devis, souscription, "être rappelé pour une offre commerciale") est une
   preuve solide. La même case perdue sur un formulaire de contact générique multi-usages (service
   client, réclamation, question de gestion de contrat) est une preuve beaucoup plus faible, même si son
   texte mentionne explicitement des "offres commerciales" — précise toujours ce contexte
   (champ contexte_case_a_cocher).

4. UNE SOURCE DOIT VENIR DU CONCURRENT LUI-MÊME. Une prise de position d'un syndicat professionnel, d'un
   partenaire ou de la presse à propos d'un concurrent (ex: communiqué d'une organisation représentant
   son réseau d'agents/courtiers) donne du contexte utile mais N'EST PAS une preuve de la position
   officielle du concurrent — marque bien domaine_du_concurrent:false pour ces sources-là et ne les
   présente jamais comme équivalentes à une page du concurrent lui-même.

5. QUAND IL N'Y A RIEN, DIS-LE SIMPLEMENT. Si aucune information pertinente n'est trouvée, ne cherche pas
   à justifier longuement pourquoi une page à moitié pertinente ne compte pas — indique juste "rien
   trouvé" et passe à autre chose. Pas de sur-interprétation dans un sens ni dans l'autre.

6. CROISE PLUSIEURS PAGES, PAS SEULEMENT LA PREMIÈRE QUI SEMBLE PROBANTE. Vérifie à la fois la politique
   de données personnelles générale ET, si elles existent, une ou deux pages plus spécifiques (formulaire
   de contact, page "être rappelé", parcours devis) — l'objectif est de détecter les contradictions
   internes, pas de s'arrêter au premier résultat qui va dans un sens.`

const results = await pipeline(
  competitors,
  (name) => agent(
    `Tu es analyste en veille concurrentielle pour le secteur de l'assurance en France (au ${asOf}).\n\n` +
    `Contexte réglementaire à surveiller :\n${REG_CONTEXT}\n\n` +
    `${METHODOLOGIE}\n\n` +
    `Concurrent à étudier : "${name}".\n\n` +
    `Cherche sur le web (presse spécialisée assurance : Argus de l'assurance, News Assurances Pro, ` +
    `communiqués de presse officiels, pages institutionnelles, offres d'emploi CRM/relation client, ` +
    `réseaux sociaux professionnels) toute information PUBLIQUE et datée sur ce que "${name}" a mis en place, ` +
    `communiqué ou changé en lien avec l'interdiction du démarchage téléphonique commercial opt-in : ` +
    `plateforme de gestion du consentement, réorganisation de centres d'appels, sanctions DGCCRF liées au ` +
    `démarchage, bascule vers des canaux opt-in (email, SMS, RCS, app), communication dédiée au grand public, ` +
    `formation réseau/agents, outils CRM, ou tout signal indirect pertinent (recrutements, partenariats ` +
    `martech, croissance du canal digital). Priorise les informations récentes et datées. Cite systématiquement ` +
    `tes sources (titre + URL, et précise domaine_du_concurrent). Si rien de spécifique n'est trouvé, dis-le ` +
    `explicitement plutôt que d'inventer — indique aussi l'exposition probable de ce concurrent à la loi selon ` +
    `son modèle de distribution (digital pur / réseau d'agents / centre d'appels sortant / bancassurance).\n\n` +
    `Vérifie en particulier, DIRECTEMENT sur le site de "${name}" (pas seulement via la presse), en suivant la ` +
    `méthode ci-dessus : 1) le document de référence général (politique de données personnelles / prospection ` +
    `commerciale) — URL, date de mise à jour, base légale déclarée pour le démarchage téléphonique ; ` +
    `2) un article, une page FAQ ou un post de blog qui explique la loi opt-in au grand public — indique ` +
    `l'URL exacte si trouvé ; 3) une case à cocher ou un mécanisme explicite de consentement au démarchage ` +
    `téléphonique sur le parcours de devis/souscription en ligne, sur le formulaire de contact, ou sur une ` +
    `page type "être rappelé par téléphone" — décris ce que tu observes (texte exact de la case si possible), ` +
    `son contexte (parcours commercial vs formulaire générique) et l'URL de la page. Si tu trouves plusieurs ` +
    `pages qui se contredisent, dis-le explicitement plutôt que de ne retenir que la plus favorable. Si tu ne ` +
    `peux pas accéder au parcours de devis (ex: nécessite des données personnelles), dis-le et base-toi sur ce ` +
    `qui est visible publiquement (mentions légales, politique de confidentialité, CGU/CGV, page contact).`,
    { label: `recherche:${name}`, phase: 'Recherche par concurrent', schema: FINDINGS_SCHEMA }
  )
)

const findings = results.filter(Boolean)
log(`${findings.length}/${competitors.length} fiches concurrent collectées`)

phase('Synthèse comparative')
const synthesis = await agent(
  `Tu rédiges un rapport de veille concurrentielle en français, au format Markdown, pour l'agence G.Flow ` +
  `(qui aide des clients à s'adapter à cette réglementation et à trouver des canaux de prospection conformes).\n\n` +
  `Contexte réglementaire :\n${REG_CONTEXT}\n\n` +
  `Voici les résultats de recherche structurés par concurrent (JSON) :\n${JSON.stringify(findings, null, 2)}\n\n` +
  (previousReport
    ? `Voici le rapport précédent, pour comparaison — ajoute une section "Ce qui a changé depuis le dernier ` +
      `rapport" avec les évolutions concrètes détectées :\n\n${previousReport}\n\n`
    : `Aucun rapport précédent fourni — c'est la première édition, pas de section "changements".\n\n`) +
  `Le statut "conforme" de chaque concurrent doit suivre STRICTEMENT cette logique (ne pas la réinventer) : ` +
  `un concurrent n'est "conforme" que si son document de référence général (pas une exception locale isolée) ` +
  `déclare une base légale "consentement" pour le démarchage téléphonique — "intérêt légitime" ou un renvoi ` +
  `vers Bloctel comme mécanisme d'opposition sont NON conformes, même si le sujet est mentionné et même si le ` +
  `texte est par ailleurs bien écrit. Si le document général et une page isolée (agence, formulaire ` +
  `spécifique) se contredisent (champ contradiction_interne), c'est le document général qui détermine le ` +
  `statut final — signale la contradiction dans le rapport, ne la gomme pas. Une case à cocher trouvée sur un ` +
  `formulaire de contact générique (pas un parcours commercial dédié) est un signal plus faible qu'une case ` +
  `sur un vrai tunnel de devis/souscription — reflète cette nuance dans le tableau plutôt que de traiter ` +
  `toute case à cocher comme équivalente. Ne cite jamais une source tierce (domaine_du_concurrent:false, ` +
  `ex: syndicat professionnel, presse) comme si c'était la position officielle du concurrent — mentionne-la ` +
  `séparément comme contexte. Quand rien n'a été trouvé pour un concurrent, écris-le simplement ("rien ` +
  `trouvé"), sans sur-justifier.\n\n` +
  `Produis un rapport structuré avec : 1) rappel synthétique du cadre réglementaire, 2) tableau comparatif des ` +
  `${findings.length} concurrents (dispositif le plus notable, base légale déclarée pour le démarchage ` +
  `téléphonique, exposition à la loi, communication publique, présence d'un article pédagogique grand public, ` +
  `présence d'une case à cocher de consentement sur le site et son contexte), 3) regroupement en familles de ` +
  `réponses stratégiques, 4) une section dédiée récapitulant qui a publié un article pédagogique et qui a une ` +
  `case à cocher de consentement visible dans un vrai parcours commercial (avec URLs), car ce sont les deux ` +
  `signaux concrets les plus recherchés par G.Flow, 5) ce qui a changé depuis le dernier rapport le cas ` +
  `échéant, 6) limites de la veille (sources non trouvées ou non vérifiées), 7) implication stratégique pour ` +
  `G.Flow (quels segments de concurrents sont des cibles commerciales prioritaires pour des solutions de ` +
  `conformité / prospection alternative). Termine par une liste consolidée des sources citées, en indiquant ` +
  `clairement lesquelles sont sur un domaine du concurrent lui-même et lesquelles sont des sources tierces.`,
  { label: 'synthese', phase: 'Synthèse comparative', schema: SYNTHESIS_SCHEMA }
)

return { rapport_markdown: synthesis.rapport_markdown, findings }
