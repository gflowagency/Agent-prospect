# devis-wrapper

Wrapper GET-only autour de [Browserless](https://github.com/browserless/browserless), pour piloter des parcours de devis multi-étapes (MACIF, Acheel, ...) et y chercher une case à cocher liée au consentement démarchage téléphonique — chose qu'aucun connecteur actuellement branché sur la session Claude (Parallel Search, Nimble, Crustdata) ne sait faire : tous sont GET-only et ne peuvent pas envoyer les requêtes POST que Browserless exige sur `/function`, ni cliquer/remplir un formulaire en plusieurs étapes.

## Pourquoi ça existe

Browserless expose un moteur Chrome headless piloté en `POST /function` avec un corps JSON (`{code, context}`). Les outils connectés à cette session Claude ne savent faire que du `GET`. Ce wrapper est la traduction : `GET /run/<target>?key=...` côté appelant → `POST /function` côté Browserless.

## ⚠️ Important : ce dépôt ne peut pas déployer ni tester ceci contre les vrais sites

Cette session Claude tourne dans un sandbox dont la politique réseau sortant bloque les domaines arbitraires (macif.fr, acheel.com, etc.), et sans daemon Docker actif. Ce qui a été fait :

- Le code a été relu et syntaxiquement vérifié (`node --check`).
- La logique du wrapper (relais GET → POST, auth, gestion d'erreur) a été testée **contre un faux serveur Browserless local** (voir `test/wrapper.test.js`) — ça vérifie que le wrapper fonctionne, pas que les sélecteurs MACIF/Acheel sont corrects.
- Les scripts `macif-devis.js` / `acheel-devis.js` n'ont **jamais tourné contre les vrais sites**. Les URLs d'entrée ont été vérifiées par recherche web (10/09/2026), mais les heuristiques de détection (texte des boutons "suivant/continuer", mots-clés de case à cocher) sont des paris raisonnables, pas des sélecteurs confirmés sur le DOM réel.

**Pour un vrai test**, il faut héberger ce bundle sur une machine avec accès internet sortant normal (VPS OVH/Scaleway/Hetzner, ou compte Browserless.io managé) et lancer `GET /run/macif-devis` pour de vrai. Voir la section Déploiement.

## Garde-fou éthique (volontaire, non négociable)

Les scripts **ne saisissent jamais de données personnelles fabriquées** (nom, téléphone, email, date de naissance...) dans un formulaire de production. Ils avancent uniquement par clics génériques et s'arrêtent dès qu'un champ obligatoire d'identité/contact bloque la suite — pour ne jamais déclencher un vrai rappel vers un faux numéro ni polluer le CRM d'un concurrent. Si le mur de données personnelles est atteint avant d'avoir vu de case de consentement, le résultat le dit explicitement (`summary.reachedPiiWall`).

## Déploiement

```bash
cp .env.example .env
# éditer .env : BROWSERLESS_TOKEN et WRAPPER_API_KEY, deux valeurs longues et aléatoires
docker compose up -d --build
curl "http://<votre-serveur>:8090/health"
curl "http://<votre-serveur>:8090/targets?key=<WRAPPER_API_KEY>"
curl "http://<votre-serveur>:8090/run/macif-devis?key=<WRAPPER_API_KEY>&timeoutMs=90000"
```

Ne jamais exposer le port Browserless (3000) publiquement — seul le wrapper doit lui parler, en réseau interne docker-compose. Le `docker-compose.yml` fourni ne publie que le port du wrapper (8090).

Mettre le wrapper derrière un reverse proxy TLS (Caddy/Nginx + Let's Encrypt) si accessible depuis l'extérieur du VPS, `WRAPPER_API_KEY` seul ne suffit pas en clair sur HTTP.

## Ajouter un nouveau concurrent

1. Créer `scripts/<nom>-devis.js` sur le modèle de `scripts/macif-devis.js` (juste `ENTRY_URL` + appel à `runDevisWalk`).
2. La logique partagée (scan des cases à cocher, détection du mur PII, clic générique) vit dans `scripts/_common.js` — ne pas la dupliquer, `server.js` la concatène automatiquement devant le script cible avant l'appel à Browserless.
3. Vérifier l'URL d'entrée du devis par une recherche récente avant de coder en dur — les sites changent de structure.

## Réponse

`GET /run/<target>` renvoie le JSON produit par Browserless, avec pour chaque étape : URL, titre, cases à cocher trouvées contenant des mots-clés de démarchage (`consentCheckboxesFound`), champs obligatoires bloquants (`piiFieldsRequiredHere`), et une capture d'écran JPEG en base64 (`screenshotBase64Jpeg`).
