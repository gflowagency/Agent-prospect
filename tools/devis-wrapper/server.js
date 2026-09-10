'use strict'

const express = require('express')
const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')

const PORT = process.env.PORT || 8090
const WRAPPER_API_KEY = process.env.WRAPPER_API_KEY || ''
const BROWSERLESS_URL = process.env.BROWSERLESS_URL || 'http://browserless:3000'
const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN || ''
const SCRIPTS_DIR = path.join(__dirname, 'scripts')
const COMMON_SCRIPT = path.join(SCRIPTS_DIR, '_common.js')

if (!WRAPPER_API_KEY) {
  console.error('WRAPPER_API_KEY manquante — refuse de démarrer sans clé (ces routes déclenchent de la navigation web, elles ne doivent pas être ouvertes sans authentification).')
  process.exit(1)
}

const app = express()

function requireKey(req, res, next) {
  const key = req.query.key || req.headers['x-api-key']
  if (key !== WRAPPER_API_KEY) {
    return res.status(401).json({ error: 'unauthorized', hint: 'passer ?key=... ou header x-api-key' })
  }
  next()
}

// Construit context.formData à partir des paramètres de requête, UNIQUEMENT
// nom/prenom/email/naissance (jamais de téléphone, adresse, plaque ou permis
// ici — ces champs restent un mur d'arrêt normal côté scripts). Rien de tout
// ceci n'est jamais écrit sur disque ni journalisé : ça ne fait que transiter
// vers le POST /function envoyé à Browserless.
function buildFormData(query) {
  const formData = {}
  if (query.nom) formData.nom = String(query.nom)
  if (query.prenom) formData.prenom = String(query.prenom)
  if (query.email) formData.email = String(query.email)
  if (query.naissance) {
    const raw = String(query.naissance)
    const fr = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (fr) {
      formData.naissanceFr = raw
      formData.naissanceIso = `${fr[3]}-${fr[2]}-${fr[1]}`
    } else if (iso) {
      formData.naissanceIso = raw
      formData.naissanceFr = `${iso[3]}/${iso[2]}/${iso[1]}`
    }
  }
  return Object.keys(formData).length > 0 ? formData : null
}

app.get('/health', (req, res) => res.json({ ok: true }))

app.get('/targets', requireKey, (req, res) => {
  const files = fs.readdirSync(SCRIPTS_DIR).filter((f) => f.endsWith('.js') && !f.startsWith('_'))
  res.json({ targets: files.map((f) => f.replace(/\.js$/, '')) })
})

// GET /run/:target?key=...&timeoutMs=90000
// Charge scripts/<target>.js (une fonction Browserless "/function"), l'envoie en POST
// au moteur Browserless, et relaie le résultat JSON. C'est la traduction GET -> POST
// qui manque à tous les connecteurs actuels (Parallel Search, Nimble, Crustdata sont
// GET-only et ne peuvent pas piloter un parcours multi-étapes).
app.get('/run/:target', requireKey, async (req, res) => {
  const target = req.params.target
  const scriptPath = path.join(SCRIPTS_DIR, `${target}.js`)

  if (
    target.startsWith('_') ||
    !scriptPath.startsWith(SCRIPTS_DIR) ||
    !fs.existsSync(scriptPath)
  ) {
    return res.status(404).json({ error: 'unknown target', hint: 'voir GET /targets' })
  }

  // _common.js définit les fonctions partagées (runDevisWalk, scanConsentCheckboxes...)
  // en haut du blob envoyé à Browserless — le sandbox /function n'a pas accès au
  // système de fichiers pour résoudre un require() relatif entre deux fichiers.
  const code = fs.readFileSync(COMMON_SCRIPT, 'utf8') + '\n\n' + fs.readFileSync(scriptPath, 'utf8')
  const timeoutMs = Number(req.query.timeoutMs) || 120000
  const formData = buildFormData(req.query)

  const functionUrl = `${BROWSERLESS_URL.replace(/\/$/, '')}/function${BROWSERLESS_TOKEN ? `?token=${encodeURIComponent(BROWSERLESS_TOKEN)}` : ''}`

  try {
    const result = await postJson(functionUrl, {
      code,
      context: { target, formData },
    }, timeoutMs)
    res.status(200).json(result)
  } catch (err) {
    res.status(502).json({ error: 'browserless call failed', detail: String(err && err.message || err) })
  }
})

function postJson(url, body, timeoutMs) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const lib = u.protocol === 'https:' ? https : http
    const payload = JSON.stringify(body)
    const req = lib.request(
      {
        hostname: u.hostname,
        port: u.port || (u.protocol === 'https:' ? 443 : 80),
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: timeoutMs,
      },
      (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            resolve({ raw: data, statusCode: res.statusCode })
          }
        })
      }
    )
    req.on('timeout', () => req.destroy(new Error('timeout')))
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

if (require.main === module) {
  app.listen(PORT, () => console.log(`devis-wrapper à l'écoute sur :${PORT}`))
}

module.exports = { app, postJson }
