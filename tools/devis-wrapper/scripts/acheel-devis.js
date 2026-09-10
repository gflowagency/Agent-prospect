// Cible : parcours devis auto Acheel.
// Utilise runDevisWalk() / scanConsentCheckboxes() etc., injectées par
// server.js depuis _common.js (voir ce fichier pour le garde-fou anti-PII et
// la logique de scan).
//
// Entrée trouvée via recherche le 2026-09-10 — à revérifier si le site a
// changé de structure depuis (le premier essai manuel était tombé par erreur
// sur une page carrières, cf. rapport du 10/09).

const ENTRY_URL = 'https://www.acheel.com/subscribe/auto'

export default async function ({ page }) {
  const result = await runDevisWalk(page, { entryUrl: ENTRY_URL, target: 'acheel-devis', maxSteps: 12 })
  return { data: result, type: 'application/json' }
}
