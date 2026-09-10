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
]
const NEXT_BUTTON_TEXT = [
  'suivant', 'continuer', "c'est parti", 'commencer', 'obtenir mon devis',
  "j'accepte", 'valider',
]
const COOKIE_BANNER_BUTTON_TEXT = [
  'tout accepter', 'accepter et fermer', 'accepter tout', "j'accepte tout",
  'accepter', 'autoriser', 'ok pour moi', "j'ai compris",
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
    const inputs = Array.from(document.querySelectorAll('input[required], input[aria-required="true"]'))
    const hits = []
    for (const input of inputs) {
      const label =
        (input.labels && input.labels[0] && input.labels[0].innerText) ||
        input.placeholder || input.name || input.id || ''
      const norm = label.toLowerCase()
      if (keywords.some((k) => norm.includes(k))) hits.push(label.trim())
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
    const [consentMatches, piiWall, screenshot] = await Promise.all([
      scanConsentCheckboxes(page),
      detectPiiWall(page),
      // encoding: 'base64' demandé directement à Puppeteer : dans le sandbox
      // Browserless, l'objet renvoyé par screenshot() sans cette option n'est
      // pas un vrai Buffer Node, donc un .toString('base64') manuel après coup
      // produit un Array.prototype.toString() (liste d'octets séparés par des
      // virgules) au lieu d'un vrai base64 — bug trouvé sur un run réel.
      page.screenshot({ type: 'jpeg', quality: 60, encoding: 'base64' }),
    ])

    steps.push({
      step: i + 1,
      url: page.url(),
      title: await page.title(),
      consentCheckboxesFound: consentMatches,
      piiFieldsRequiredHere: piiWall,
      screenshotBase64Jpeg: screenshot,
    })

    if (piiWall.length > 0) {
      steps[steps.length - 1].stoppedReason =
        'Mur de données personnelles atteint — arrêt volontaire (pas de saisie de données fabriquées).'
      break
    }

    const clickedLabel = await clickFirstMatchingButton(page, NEXT_BUTTON_TEXT)
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
