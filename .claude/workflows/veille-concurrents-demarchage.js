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
]

const FINDINGS_SCHEMA = {
  type: 'object',
  properties: {
    competiteur: { type: 'string' },
    dispositifs_identifies: { type: 'array', items: { type: 'string' } },
    communication_publique_dediee: { type: 'string' },
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
    `(digital pur / réseau d'agents / centre d'appels sortant / bancassurance).`,
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
  `${findings.length} concurrents (dispositif le plus notable, exposition à la loi, communication publique), ` +
  `3) regroupement en familles de réponses stratégiques, 4) ce qui a changé depuis le dernier rapport le cas ` +
  `échéant, 5) limites de la veille (sources non trouvées ou non vérifiées), 6) implication stratégique pour ` +
  `G.Flow (quels segments de concurrents sont des cibles commerciales prioritaires pour des solutions de ` +
  `conformité / prospection alternative). Termine par une liste consolidée des sources citées.`,
  { label: 'synthese', phase: 'Synthèse comparative', schema: SYNTHESIS_SCHEMA }
)

return { rapport_markdown: synthesis.rapport_markdown, findings }
