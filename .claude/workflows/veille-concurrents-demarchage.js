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
    exposition_a_la_loi: { type: 'string', enum: ['faible', 'moderee', 'elevee'] },
    changements_depuis_dernier_rapport: { type: 'string' },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        properties: { titre: { type: 'string' }, url: { type: 'string' } },
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

const results = await pipeline(
  competitors,
  (name) => agent(
    `Tu es analyste en veille concurrentielle pour le secteur de l'assurance en France (au ${asOf}).\n\n` +
    `Contexte réglementaire à surveiller :\n${REG_CONTEXT}\n\n` +
    `Concurrent à étudier : "${name}".\n\n` +
    `Cherche sur le web (presse spécialisée assurance : Argus de l'assurance, News Assurances Pro, ` +
    `communiqués de presse officiels, pages institutionnelles, offres d'emploi CRM/relation client, ` +
    `réseaux sociaux professionnels) toute information PUBLIQUE et datée sur ce que "${name}" a mis en place, ` +
    `communiqué ou changé en lien avec l'interdiction du démarchage téléphonique commercial opt-in : ` +
    `plateforme de gestion du consentement, réorganisation de centres d'appels, sanctions DGCCRF liées au ` +
    `démarchage, bascule vers des canaux opt-in (email, SMS, RCS, app), communication dédiée au grand public, ` +
    `formation réseau/agents, outils CRM, ou tout signal indirect pertinent (recrutements, partenariats ` +
    `martech, croissance du canal digital). Priorise les informations récentes et datées. Cite systématiquement ` +
    `tes sources (titre + URL). Si rien de spécifique n'est trouvé, dis-le explicitement plutôt que d'inventer ` +
    `— indique aussi l'exposition probable de ce concurrent à la loi selon son modèle de distribution ` +
    `(digital pur / réseau d'agents / centre d'appels sortant / bancassurance).\n\n` +
    `Vérifie en particulier deux choses concrètes, DIRECTEMENT sur le site de "${name}" (pas seulement via la ` +
    `presse) : 1) un article, une page FAQ ou un post de blog qui explique la loi opt-in au grand public ` +
    `(ex: "pourquoi on ne peut plus vous appeler sans votre accord") — indique l'URL exacte si trouvé ; ` +
    `2) une case à cocher ou un mécanisme explicite de consentement au démarchage téléphonique sur le ` +
    `parcours de devis/souscription en ligne, sur le formulaire de contact, ou sur une page type "être rappelé ` +
    `par téléphone" — décris ce que tu observes (texte exact de la case si possible) et indique l'URL de la ` +
    `page. Si tu ne peux pas accéder au parcours de devis (ex: nécessite des données personnelles), dis-le et ` +
    `base-toi sur ce qui est visible publiquement (mentions légales, politique de confidentialité, CGU/CGV, ` +
    `page contact).`,
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
  `Produis un rapport structuré avec : 1) rappel synthétique du cadre réglementaire, 2) tableau comparatif des ` +
  `${findings.length} concurrents (dispositif le plus notable, exposition à la loi, communication publique, ` +
  `présence d'un article pédagogique grand public, présence d'une case à cocher de consentement sur le site), ` +
  `3) regroupement en familles de réponses stratégiques, 4) une section dédiée récapitulant qui a publié un ` +
  `article pédagogique et qui a une case à cocher de consentement visible (avec URLs), car ce sont les deux ` +
  `signaux concrets les plus recherchés par G.Flow, 5) ce qui a changé depuis le dernier rapport le cas ` +
  `échéant, 6) limites de la veille (sources non trouvées ou non vérifiées), 7) implication stratégique pour ` +
  `G.Flow (quels segments de concurrents sont des cibles commerciales prioritaires pour des solutions de ` +
  `conformité / prospection alternative). Termine par une liste consolidée des sources citées.`,
  { label: 'synthese', phase: 'Synthèse comparative', schema: SYNTHESIS_SCHEMA }
)

return { rapport_markdown: synthesis.rapport_markdown, findings }
