// Logique partagée entre les scripts de parcours devis. Ce fichier N'EST PAS
// envoyé seul à Browserless : server.js le concatène devant le script cible
// (macif-devis.js, acheel-devis.js, ...) avant l'appel POST /function, car le
// bac à sable Browserless exécute un seul blob de code sans accès au système
// de fichiers local pour résoudre un require() relatif.
//
// Garde-fou : jamais de saisie de données personnelles fabriquées. On avance
// uniquement par clics génériques et on s'arrête dès qu'un champ
// nom/téléphone/email/adresse devient obligatoire pour continuer.

const CONSENT_KEYWORDS = [
  'téléphon', 'telephon', 'appel', 'démarch', 'demarch', 'rappel',
  'contacter par téléphone', 'sollicitation', 'prospection',
]
const PII_FIELD_KEYWORDS = [
  'nom', 'prénom', 'prenom', 'téléphone', 'telephone', 'email', 'e-mail',
  'date de naissance', 'adresse', 'code postal',
  // pas des données "personnelles" au sens strict, mais identifiantes (rattachées
  // à un vrai véhicule/permis réel) : même garde-fou, on ne fabrique rien.
  'plaque', 'immatriculation', 'permis de conduire', 'numéro de permis',
]
const NEXT_BUTTON_TEXT = [
  'suivant', 'continuer', "c'est parti", 'commencer', 'obtenir mon devis',
  "j'accepte", 'valider',
]
const COOKIE_BANNER_BUTTON_TEXT = [
  'tout accepter', 'accepter et fermer', 'accepter tout', "j'accepte tout",
  'accepter', 'autoriser', 'ok pour moi', "j'ai compris",
]
// Quand un mur de données identifiantes est atteint (ex: plaque d'immatriculation),
// on cherche une voie de contournement qui ne demande PAS de donnée identifiante
// avant d'abandonner — ex: choisir la marque/le modèle du véhicule à la main plutôt
// que de fabriquer une plaque. Rien ici n'est saisi, seulement cliqué.
const NON_IDENTIFYING_ALTERNATIVE_PATH_TEXT = [
  'marque et modèle', 'marque, modèle', 'rechercher par marque',
  'sans plaque', "je ne connais pas ma plaque", "je n'ai pas ma plaque",
  'saisir manuellement', 'saisie manuelle', 'voir toutes les marques',
  'toutes les marques',
]

async function scanConsentCheckboxes(page) {
  return page.evaluate(({ keywords }) => {
    const matches = []
    const boxes = Array.from(document.querySelectorAll('input[type="checkbox"]'))
    for (const box of boxes) {
      let label = ''
      if (box.id) {
        const lbl = document.querySelector(`label[for="${CSS.escape(box.id)}"]`)
        if (lbl) label = lbl.innerText || lbl.textContent || ''
      }
      if (!label && box.closest('label')) {
        label = box.closest('label').innerText || box.closest('label').textContent || ''
      }
      if (!label) {
        const parent = box.parentElement
        if (parent) label = parent.innerText || parent.textContent || ''
      }
      const norm = (label || '').toLowerCase()
      if (keywords.some((k) => norm.includes(k))) {
        matches.push({
          label: (label || '').trim().slice(0, 500),
          checked: box.checked,
          name: box.name || null,
          id: box.id || null,
        })
      }
    }
    return matches
  }, { keywords: CONSENT_KEYWORDS })
}

async function detectPiiWall(page) {
  return page.evaluate(({ keywords }) => {
    // Volontairement large : pas seulement input[required]. Beaucoup de
    // formulaires modernes (composants React/masques de saisie) bloquent le
    // bouton suivant via du JS plutôt que l'attribut HTML required — s'y fier
    // uniquement raterait des murs de données identifiantes (ex: plaque
    // d'immatriculation chez Acheel, ni required ni aria-required en HTML).
    const skipTypes = new Set(['hidden', 'checkbox', 'radio', 'submit', 'button'])
    const inputs = Array.from(document.querySelectorAll('input, textarea')).filter((el) => {
      if (el.tagName === 'INPUT' && skipTypes.has((el.type || '').toLowerCase())) return false
      return el.offsetParent !== null
    })
    // Sur des formulaires custom (React/masques de saisie), le texte qui
    // explique le champ n'est souvent PAS un <label for="..."> formel mais un
    // simple paragraphe voisin dans le DOM. On remonte quelques niveaux de
    // parents et on prend leur texte, en s'arrêtant dès qu'un conteneur est
    // trop large (signe qu'on est sorti du champ pour englober toute la page).
    function nearbyText(el) {
      let node = el.parentElement
      let combined = ''
      for (let depth = 0; node && depth < 4; depth++) {
        const text = (node.innerText || '').trim()
        if (text.length === 0) { node = node.parentElement; continue }
        if (text.length > 400) break
        combined += ' ' + text
        node = node.parentElement
      }
      return combined
    }

    const hits = []
    for (const input of inputs) {
      const label =
        (input.labels && input.labels[0] && input.labels[0].innerText) ||
        input.placeholder || input.getAttribute('aria-label') || input.name || input.id || ''
      const combined = (label + ' ' + nearbyText(input)).toLowerCase()
      if (keywords.some((k) => combined.includes(k))) hits.push(label.trim() || combined.trim().slice(0, 200))
    }
    return hits
  }, { keywords: PII_FIELD_KEYWORDS })
}

async function clickFirstMatchingButton(page, textOptions) {
  return page.evaluate((options) => {
    const clickable = Array.from(document.querySelectorAll('button, a, [role="button"]'))
    for (const opt of options) {
      const el = clickable.find((e) => (e.innerText || '').toLowerCase().includes(opt) && e.offsetParent !== null)
      if (el) {
        el.scrollIntoView({ block: 'center' })
        el.click()
        return el.innerText.trim().slice(0, 200)
      }
    }
    return null
  }, textOptions)
}

// Dernier recours pour une grille de sélection à base de logos (ex: choix de
// marque de véhicule) : boutons sans texte, juste une image. Choisir un
// élément d'une liste prédéfinie (marque, modèle...) n'est jamais une donnée
// personnelle fabriquée -- contrairement à saisir du texte libre.
async function clickFirstLogoOnlyButton(page) {
  return page.evaluate(() => {
    const candidates = Array.from(document.querySelectorAll('button')).filter((el) => {
      if (el.offsetParent === null) return false
      const hasImg = el.querySelector('img, svg')
      const hasText = (el.innerText || '').trim().length > 0
      return hasImg && !hasText
    })
    const el = candidates[0]
    if (!el) return null
    const img = el.querySelector('img')
    const label = (img && (img.alt || img.getAttribute('src'))) || 'logo sans texte'
    el.scrollIntoView({ block: 'center' })
    el.click()
    return label.slice(0, 200)
  })
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Diagnostic temporaire : liste tous les éléments interactifs visibles
// (input, textarea, [contenteditable], boutons, liens) avec assez de détail
// pour comprendre pourquoi un champ ou un bouton n'est pas détecté par les
// heuristiques ci-dessus, sans dépendre d'une capture d'écran à relire à
// l'œil. À retirer une fois les heuristiques stabilisées sur les sites cibles.
async function describeInteractiveElements(page) {
  return page.evaluate(() => {
    function short(s, n = 120) { return (s || '').trim().replace(/\s+/g, ' ').slice(0, n) }
    const els = Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"], button, a, [role="button"]'))
      .filter((el) => el.offsetParent !== null)
      .slice(0, 40)
    return els.map((el) => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type') || null,
      placeholder: el.getAttribute('placeholder') || null,
      name: el.getAttribute('name') || null,
      id: el.id || null,
      ariaLabel: el.getAttribute('aria-label') || null,
      text: short(el.innerText || el.value || ''),
      parentText: short(el.parentElement ? el.parentElement.innerText : ''),
    }))
  })
}

async function runDevisWalk(page, { entryUrl, target, maxSteps = 6 }) {
  const steps = []
  // "networkidle2" (syntaxe Puppeteer, pas "networkidle" de Playwright) : Browserless
  // expose une API façon Puppeteer sur /function.
  await page.goto(entryUrl, { waitUntil: 'networkidle2', timeout: 45000 })

  await sleep(1000)
  const cookieBannerDismissed = await clickFirstMatchingButton(page, COOKIE_BANNER_BUTTON_TEXT)
  if (cookieBannerDismissed) await sleep(800)

  for (let i = 0; i < maxSteps; i++) {
    await sleep(1500)
    const [consentMatches, piiWall, screenshot, interactiveElements] = await Promise.all([
      scanConsentCheckboxes(page),
      detectPiiWall(page),
      // encoding: 'base64' demandé directement à Puppeteer : dans le sandbox
      // Browserless, l'objet renvoyé par screenshot() sans cette option n'est
      // pas un vrai Buffer Node, donc un .toString('base64') manuel après coup
      // produit un Array.prototype.toString() (liste d'octets séparés par des
      // virgules) au lieu d'un vrai base64 — bug trouvé sur un run réel.
      page.screenshot({ type: 'jpeg', quality: 60, encoding: 'base64' }),
      describeInteractiveElements(page),
    ])

    steps.push({
      step: i + 1,
      url: page.url(),
      title: await page.title(),
      consentCheckboxesFound: consentMatches,
      piiFieldsRequiredHere: piiWall,
      screenshotBase64Jpeg: screenshot,
      debugInteractiveElements: interactiveElements,
    })

    // On tente TOUJOURS la voie de contournement non-identifiante en premier,
    // qu'un mur ait été détecté ou non par detectPiiWall() (cette détection est
    // une heuristique imparfaite — des champs comme une plaque d'immatriculation
    // dans un composant custom peuvent lui échapper). Cliquer sur "marque et
    // modèle" plutôt que "plaque" est sans risque par construction : ces
    // libellés ne mènent jamais à une saisie de donnée identifiante.
    const altPathLabel = await clickFirstMatchingButton(page, NON_IDENTIFYING_ALTERNATIVE_PATH_TEXT)
    if (altPathLabel) {
      steps[steps.length - 1].tookNonIdentifyingAlternativePath = altPathLabel
      await sleep(1000)
      continue
    }

    if (piiWall.length > 0) {
      steps[steps.length - 1].stoppedReason =
        'Mur de données personnelles/identifiantes atteint, aucune voie de contournement trouvée — arrêt volontaire (pas de saisie de données fabriquées).'
      break
    }

    let clickedLabel = await clickFirstMatchingButton(page, NEXT_BUTTON_TEXT)
    if (!clickedLabel) {
      // Grille de sélection par logos (marque de véhicule...) : pas de texte à
      // matcher, mais choisir un item d'une liste prédéfinie n'est pas une
      // donnée personnelle fabriquée.
      clickedLabel = await clickFirstLogoOnlyButton(page)
    }
    if (!clickedLabel) {
      steps[steps.length - 1].stoppedReason = 'Aucun bouton "suivant/continuer" détecté — fin du parcours automatisable sans données.'
      break
    }
    steps[steps.length - 1].clickedToAdvance = clickedLabel
    await sleep(1000)
  }

  return {
    target,
    entryUrl,
    cookieBannerDismissed: cookieBannerDismissed || null,
    steps,
    summary: {
      anyConsentCheckboxFound: steps.some((s) => s.consentCheckboxesFound.length > 0),
      reachedPiiWall: steps.some((s) => s.stoppedReason && s.stoppedReason.includes('personnelles')),
    },
  }
}
