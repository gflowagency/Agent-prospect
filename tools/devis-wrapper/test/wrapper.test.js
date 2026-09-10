'use strict'

// Test d'intégration LOCAL du wrapper uniquement : vérifie que le relais
// GET -> POST, l'authentification et la gestion d'erreur fonctionnent, en
// tapant sur un faux serveur Browserless (pas le vrai). Ça ne prouve RIEN sur
// le comportement réel des scripts macif-devis.js / acheel-devis.js contre
// les vrais sites — voir README.md, section "ce dépôt ne peut pas déployer
// ni tester ceci contre les vrais sites".

const assert = require('assert')
const http = require('http')

function get(port, urlPath) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: '127.0.0.1', port, path: urlPath }, (res) => {
      let data = ''
      res.on('data', (c) => (data += c))
      res.on('end', () => {
        let json = null
        try { json = JSON.parse(data) } catch (e) { /* laisse json = null */ }
        resolve({ statusCode: res.statusCode, json, raw: data })
      })
    }).on('error', reject)
  })
}

async function main() {
  // 1) Faux serveur Browserless : répond à POST /function comme le ferait le vrai.
  let lastRequestBody = null
  const fakeBrowserless = http.createServer((req, res) => {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      lastRequestBody = JSON.parse(body)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ data: { echoTarget: lastRequestBody.context && lastRequestBody.context.target }, type: 'application/json' }))
    })
  })
  await new Promise((resolve) => fakeBrowserless.listen(0, '127.0.0.1', resolve))
  const fakePort = fakeBrowserless.address().port

  // 2) Charge server.js avec les env vars pointant vers le faux Browserless.
  process.env.WRAPPER_API_KEY = 'test-key-123'
  process.env.BROWSERLESS_URL = `http://127.0.0.1:${fakePort}`
  process.env.BROWSERLESS_TOKEN = 'fake-token'
  delete require.cache[require.resolve('../server.js')]
  const { app } = require('../server.js')
  const wrapperServer = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s))
  })
  const wrapperPort = wrapperServer.address().port

  try {
    // /health sans clé -> ok (pas protégé)
    const health = await get(wrapperPort, '/health')
    assert.strictEqual(health.statusCode, 200)
    assert.strictEqual(health.json.ok, true)
    console.log('OK: /health répond sans authentification')

    // /targets sans clé -> 401
    const noKey = await get(wrapperPort, '/targets')
    assert.strictEqual(noKey.statusCode, 401)
    console.log('OK: /targets refuse sans clé (401)')

    // /targets avec clé -> liste macif-devis et acheel-devis, PAS _common
    const targets = await get(wrapperPort, '/targets?key=test-key-123')
    assert.strictEqual(targets.statusCode, 200)
    assert.ok(targets.json.targets.includes('macif-devis'), 'macif-devis doit être listé')
    assert.ok(targets.json.targets.includes('acheel-devis'), 'acheel-devis doit être listé')
    assert.ok(!targets.json.targets.some((t) => t.startsWith('_')), '_common ne doit jamais être listé comme cible')
    console.log('OK: /targets liste les bonnes cibles, exclut _common')

    // /run/macif-devis avec clé -> relaie vers le faux Browserless, renvoie sa réponse
    const run = await get(wrapperPort, '/run/macif-devis?key=test-key-123')
    assert.strictEqual(run.statusCode, 200)
    assert.strictEqual(run.json.data.echoTarget, 'macif-devis')
    assert.ok(lastRequestBody.code.includes('runDevisWalk'), 'le code envoyé à Browserless doit contenir la logique partagée (_common.js concaténé)')
    assert.ok(lastRequestBody.code.includes('ENTRY_URL'), 'le code envoyé doit contenir le script cible (macif-devis.js concaténé)')
    console.log('OK: /run/macif-devis relaie correctement vers Browserless (POST) et renvoie le résultat')

    // cible inconnue -> 404
    const unknown = await get(wrapperPort, '/run/does-not-exist?key=test-key-123')
    assert.strictEqual(unknown.statusCode, 404)
    console.log('OK: cible inconnue -> 404')

    // tentative d'accès à _common via /run -> 404 (pas une cible valide)
    const commonAsTarget = await get(wrapperPort, '/run/_common?key=test-key-123')
    assert.strictEqual(commonAsTarget.statusCode, 404)
    console.log('OK: /run/_common refusé (préfixe _ bloqué)')

    console.log('\nTous les tests du wrapper passent (rappel : ceci ne teste QUE le relais GET->POST, pas les vrais parcours MACIF/Acheel).')
  } finally {
    wrapperServer.close()
    fakeBrowserless.close()
  }
}

main().catch((err) => {
  console.error('ÉCHEC:', err)
  process.exit(1)
})
