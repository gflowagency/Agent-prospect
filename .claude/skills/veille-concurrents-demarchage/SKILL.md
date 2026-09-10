---
name: veille-concurrents-demarchage
description: Relance la veille concurrentielle sur la manière dont les assureurs (GMF, MAIF, MAAF, MACIF, MMA, Direct Assurance, AXA, Allianz, Groupama, Generali, LEOCARE, Lovys, Acheel, Luko, Crédit Mutuel) s'adaptent à l'interdiction du démarchage téléphonique opt-in (loi n°2025-594, 11/08/2026), écrit un nouveau rapport daté dans research/, et propose une mise à jour de la PR de veille. Utiliser quand on demande de "relancer la veille", "mettre à jour la veille concurrents", ou périodiquement via la tâche planifiée associée.
---

# Veille concurrents — démarchage téléphonique (opt-in, loi n°2025-594)

Cette skill pilote l'agent de veille concurrentielle du repo `gflowagency/Agent-prospect`. Elle ne fait
pas la recherche elle-même : elle orchestre le workflow `.claude/workflows/veille-concurrents-demarchage.js`
(fan-out d'un sous-agent de recherche par concurrent, puis un agent de synthèse), et se charge de
l'écriture des fichiers, du commit et de la mise à jour de la Pull Request.

## Quand l'utiliser

- Sur demande explicite ("relance la veille", "vérifie s'il y a du nouveau chez les concurrents").
- Automatiquement via la tâche planifiée (cloud routine) créée pour ce repo — voir `README.md` à la
  racine pour la cadence configurée.

## Étapes

1. **Charger le contexte existant.**
   - Lire `config/concurrents.json` pour la liste des concurrents et le rappel du cadre réglementaire.
   - Lister `research/*.md` et lire le **rapport daté le plus récent** (trier par date dans le nom de
     fichier `YYYY-MM-DD-...md`). S'il existe, il sert de `previousReport` pour détecter les changements.
   - Si aucun rapport n'existe encore, c'est la première édition.

2. **Lancer le workflow de recherche.**
   Appeler l'outil Workflow avec le script nommé :
   ```
   Workflow({
     name: "veille-concurrents-demarchage",
     args: {
       competitors: [...noms depuis config/concurrents.json...],
       previousReport: "...contenu markdown du dernier rapport, ou omis si aucun...",
       asOf: "<date du jour au format YYYY-MM-DD>"
     }
   })
   ```
   Le workflow fait un fan-out d'un sous-agent par concurrent (recherche web ciblée), puis un agent de
   synthèse qui produit un rapport Markdown complet (cadre réglementaire, tableau comparatif, familles de
   réponses, section "ce qui a changé", limites, implication stratégique pour G.Flow, sources).

3. **Écrire le nouveau rapport.**
   - Chemin : `research/<YYYY-MM-DD>-demarchage-telephonique-concurrents.md` (date du jour de l'exécution).
   - Contenu : le `rapport_markdown` retourné par le workflow, précédé d'un en-tête bref indiquant que ce
     rapport a été généré automatiquement par cette skill, avec la date et un lien vers le rapport précédent
     s'il existe.

4. **Committer et pousser.**
   - Travailler sur la branche existante `claude/telemarketing-regulation-competitors-r1jgpu` si elle existe
     encore et n'est pas mergée ; sinon créer une nouvelle branche `claude/veille-concurrents-<date>`.
   - Message de commit court en français décrivant ce qui a été trouvé de nouveau (pas juste "mise à jour").
   - Pousser (`git push`) puis mettre à jour la description de la Pull Request associée (ou en créer une
     nouvelle si celle d'origine a été mergée/fermée) avec un résumé des changements détectés depuis le
     dernier rapport.

5. **Résumer à l'utilisateur.**
   - En 3-5 lignes : ce qui a changé depuis le dernier rapport (le vrai signal), pas un résumé complet du
     rapport (déjà lisible dans le fichier).

## Notes

- Le workflow ne touche pas au disque et ne connaît pas le repo : c'est cette skill (l'agent appelant) qui
  lit `research/`, écrit le nouveau fichier et gère git/PR.
- Si aucun changement significatif n'est détecté depuis le dernier rapport, l'écrire quand même (traçabilité
  de la veille) mais le signaler clairement dans le résumé et dans le commit ("RAS depuis le <date>").
- La liste des concurrents et le rappel réglementaire vivent dans `config/concurrents.json` — à modifier là
  si le périmètre doit évoluer, pas dans le script du workflow.
