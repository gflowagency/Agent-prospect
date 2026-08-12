# Agent-prospect

Agent de veille concurrentielle pour G.Flow Agency, sur le secteur assurance.

## Objet actuel : interdiction du démarchage téléphonique (opt-in)

Depuis le **11 août 2026**, la loi n°2025-594 interdit tout démarchage téléphonique commercial sans
consentement préalable (bascule d'un régime opt-out — Bloctel — à un régime opt-in strict). Cet agent
surveille comment 15 assureurs concurrents (GMF, MAIF, MAAF, MACIF, MMA, Direct Assurance, AXA, Allianz,
Groupama, Generali, LEOCARE, Lovys, Acheel, Luko, Crédit Mutuel) s'adaptent : dispositifs de consentement,
réorganisations de centres d'appels, sanctions, canaux de remplacement, communication publique.

Objectif business : identifier les acteurs les plus exposés (donc les cibles commerciales les plus
pertinentes pour des offres de conformité / prospection alternative de G.Flow).

## Structure

- `config/concurrents.json` — liste des concurrents suivis + rappel du cadre réglementaire. C'est le
  fichier à modifier si le périmètre doit évoluer.
- `.claude/workflows/veille-concurrents-demarchage.js` — workflow déterministe (Claude Code) : un
  sous-agent de recherche par concurrent, puis un agent de synthèse. Réutilisable, invocable manuellement
  ou depuis la skill.
- `.claude/skills/veille-concurrents-demarchage/SKILL.md` — orchestration : charge le rapport précédent,
  lance le workflow, écrit le nouveau rapport, commit/push, met à jour la Pull Request.
- `research/YYYY-MM-DD-demarchage-telephonique-concurrents.md` — un rapport daté par exécution. Le plus
  récent fait foi ; les précédents sont conservés pour l'historique.

## Relancer la veille

En session Claude Code, dans ce repo :

```
/veille-concurrents-demarchage
```

## Exécution automatique

Une tâche planifiée (cloud routine Claude) relance cette veille périodiquement et pousse les mises à jour
sur la Pull Request de veille. Voir la routine dans https://claude.ai/code/routines pour la cadence exacte.
