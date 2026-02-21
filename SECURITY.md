# SECURITY.md - Analyse de sécurité DataShare

## Scans de sécurité

### 1. npm audit (dépendances frontend)

**Scan initial :**

```
$ npm audit
# npm audit report

ajv  <6.14.0 || >=7.0.0-alpha.0 <8.18.0
Severity: moderate
ajv has ReDoS when using `$data` option - GHSA-2g4f-4pwh-qvx6

hono  <4.11.10
Hono added timing comparison hardening in basicAuth and bearerAuth - GHSA-gq3j-xvxp-8hrf

minimatch  <10.2.1
Severity: high
minimatch has a ReDoS via repeated wildcards - GHSA-3ppc-4f35-3m26
  └─ @eslint/config-array, @eslint/eslintrc, @typescript-eslint/typescript-estree

12 vulnerabilities (1 low, 1 moderate, 10 high)
```

**Corrections appliquées :**

| Vulnérabilité            | CVE                 | Sévérité   | Action                                         | Justification                                                                                                                                                                           |
| ------------------------ | ------------------- | ---------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ajv` ReDoS via `$data`  | GHSA-2g4f-4pwh-qvx6 | Moderate   | **Corrigée** — `npm audit fix`                 | Patch disponible sans breaking change                                                                                                                                                   |
| `hono` timing comparison | GHSA-gq3j-xvxp-8hrf | —          | **Corrigée** — `npm audit fix`                 | Patch disponible sans breaking change                                                                                                                                                   |
| `minimatch` ReDoS        | GHSA-3ppc-4f35-3m26 | High (×10) | **Corrigée** — `overrides` dans `package.json` | `npm audit fix --force` aurait installé eslint@10 (breaking change) ; l'override `"minimatch": "^10.2.1"` force la version sécurisée sur toute la chaîne sans modifier la config eslint |

**Scan final :**

```
$ npm audit
found 0 vulnerabilities
```

**Résultat** : Les 12 vulnérabilités ont été corrigées. Aucune n'a été acceptée ou ignorée car des correctifs sans breaking change existaient pour toutes.

### 2. Trivy (scan complet du projet)

Trivy scanne le projet entier : dépendances frontend (npm), dépendances backend (Maven), et détecte les secrets exposés.

```
$ trivy fs . --severity HIGH,CRITICAL

┌────────────────────────────┬──────┬─────────────────┬─────────┐
│           Target           │ Type │ Vulnerabilities │ Secrets │
├────────────────────────────┼──────┼─────────────────┼─────────┤
│ backend/pom.xml            │ pom  │        0        │    -    │
├────────────────────────────┼──────┼─────────────────┼─────────┤
│ frontend/package-lock.json │ npm  │        0        │    -    │
└────────────────────────────┴──────┴─────────────────┴─────────┘
```

**Résultat** : 0 vulnérabilité HIGH ou CRITICAL dans les dépendances backend et frontend.

### 3. Analyse des résultats

Les deux scans confirment que le projet n'a pas de faille connue dans ses dépendances. Cela s'explique par :

- L'utilisation de Spring Boot 4.0.2 (version récente avec les derniers correctifs)
- Des dépendances frontend à jour (React 19, Vite 7, etc.)
- Pas de dépendances obsolètes

## Mesures de sécurité en place

### Authentification

| Mesure                    | Détail                                                                          |
| ------------------------- | ------------------------------------------------------------------------------- |
| Hashage des mots de passe | BCrypt via Spring Security (`PasswordEncoder`)                                  |
| Token JWT                 | Signé, expiration 24h                                                           |
| Session stateless         | Pas de session côté serveur, tout passe par le JWT dans le header Authorization |
| Mot de passe minimum      | 8 caractères (inscription), 6 caractères (protection fichier)                   |

### Autorisation et contrôle d'accès

| Endpoint                           | Accès                      | Justification                                             |
| ---------------------------------- | -------------------------- | --------------------------------------------------------- |
| `POST /api/auth/register`          | Public                     | Inscription ouverte                                       |
| `POST /api/auth/login`             | Public                     | Connexion                                                 |
| `GET /api/files/download/{token}`  | Public                     | Consultation des infos via token unique                   |
| `POST /api/files/download/{token}` | Public                     | Téléchargement protégé par token + mot de passe optionnel |
| `POST /api/files`                  | Authentifié                | Upload réservé aux utilisateurs connectés                 |
| `GET /api/files`                   | Authentifié                | Historique de ses propres fichiers                        |
| `DELETE /api/files/{id}`           | Authentifié + propriétaire | Vérification que l'utilisateur est bien le créateur       |

### Protection des fichiers

| Mesure                         | Détail                                     | Décision                                  |
| ------------------------------ | ------------------------------------------ | ----------------------------------------- |
| Extensions interdites          | exe, bat, cmd, sh, msi, com, scr, ps1, vbs | Bloque les fichiers exécutables dangereux |
| Taille maximale                | 1 Go                                       | Évite la saturation du stockage           |
| Token UUID                     | Aléatoire, 128 bits                        | Non devinable par brute-force             |
| Mot de passe de téléchargement | Hash BCrypt                                | Ajoute une couche de sécurité             |
| Expiration                     | 1 à 7 jours                                | Les fichiers ne restent pas indéfiniment  |

### CORS et CSRF

| Mesure | Décision                            | Justification                                                                   |
| ------ | ----------------------------------- | ------------------------------------------------------------------------------- |
| CORS   | Restreint à `http://localhost:5173` | Seul le frontend autorisé peut appeler l'API                                    |
| CSRF   | Désactivé                           | API stateless avec JWT dans le header Authorization (pas de cookies de session) |

## Décisions de sécurité

| Risque identifié                       | Décision       | Justification                                                                                          |
| -------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| Token JWT dans localStorage            | **Accepté**    | Simple pour un projet académique. En production, utiliser des cookies HttpOnly pour se protéger du XSS |
| Pas de rate limiting                   | **Accepté**    | Hors scope du MVP. En production, ajouter Bucket4j ou un rate limiter nginx                            |
| Pas de HTTPS en dev                    | **Accepté**    | Le dev tourne en local. En production, configurer HTTPS via un reverse proxy (nginx/Caddy)             |
| Pas de refresh token                   | **Accepté**    | Le token expire après 24h, l'utilisateur se reconnecte. En production, ajouter un refresh token        |
| DDL auto=update en production          | **À corriger** | Risque de perte de données. Utiliser Flyway ou Liquibase pour les migrations                           |
| Secret JWT dans application.properties | **À corriger** | En production, utiliser une variable d'environnement (`JWT_SECRET`)                                    |

## Recommandations pour la mise en production

1. Migrer le token JWT vers des cookies HttpOnly
2. Ajouter un rate limiter sur les endpoints d'authentification
3. Configurer HTTPS obligatoire
4. Externaliser les secrets dans des variables d'environnement
5. Remplacer `ddl-auto=update` par des migrations Flyway
6. Ajouter des headers de sécurité (X-Content-Type-Options, X-Frame-Options, CSP)
