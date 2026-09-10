// Cible : parcours devis auto MACIF.
// Utilise runDevisWalk() / scanConsentCheckboxes() etc., injectées par
// server.js depuis _common.js (voir ce fichier pour le garde-fou anti-PII et
// la logique de scan).
//
// Entrée trouvée via recherche le 2026-09-10 — à revérifier si le site a
// changé de structure depuis.

const ENTRY_URL = 'https://www.macif.fr/assurance/particuliers/assurance-auto-moto-scooter/assurance-automobile/devis-automobile-en-ligne'

export default async function ({ page, context }) {
  const result = await runDevisWalk(page, {
    entryUrl: ENTRY_URL,
    target: 'macif-devis',
    maxSteps: 6,
    formData: context && context.formData,
  })
  return { data: result, type: 'application/json' }
}
