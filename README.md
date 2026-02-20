# DataShare

Application web de partage de fichiers. Les utilisateurs connectés peuvent uploader des fichiers et générer des liens de téléchargement temporaires (1 à 7 jours), protégeables par mot de passe.

## Fonctionnalités

- Création de compte et connexion (JWT)
- Upload de fichiers (jusqu'à 1 Go)
- Génération d'un lien de téléchargement unique par token
- Protection optionnelle par mot de passe
- Expiration configurable (1 à 7 jours)
- Historique des fichiers partagés
- Suppression de ses propres fichiers

## Architecture

| Composant        | Technologie                                         |
| ---------------- | --------------------------------------------------- |
| Backend          | Java 21, Spring Boot 4, Spring Security             |
| Frontend         | React 19, TypeScript, Vite 7, TanStack Router/Query |
| Base de données  | PostgreSQL 17                                       |
| Styles           | Tailwind CSS 4, shadcn/ui                           |
| Authentification | JWT (HMAC-SHA256, 24h)                              |
| Stockage         | Système de fichiers local (`./uploads`)             |

## Prérequis

- [Java 21](https://adoptium.net/)
- [Maven 3.9+](https://maven.apache.org/)
- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (pour PostgreSQL)
- [k6](https://k6.io/) _(optionnel, pour les tests de performance)_

## Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd Projet-3
```

### 2. Démarrer la base de données

```bash
docker compose up -d
```

Cela lance un conteneur PostgreSQL sur le port `5432` avec :

- Base : `datashare`
- Utilisateur : `datashare`
- Mot de passe : `datashare`

### 3. Installer les dépendances frontend

```bash
cd frontend
npm install
```

## Lancement

Ouvrir **deux terminaux** depuis la racine du projet.

**Terminal 1 — Backend :**

```bash
cd backend
mvn spring-boot:run
```

Le backend démarre sur `http://localhost:8080`. Le schéma de base de données est créé automatiquement au premier démarrage.

**Terminal 2 — Frontend :**

```bash
cd frontend
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

## Tests

### Tests backend (unitaires + intégration)

```bash
cd backend
mvn test -Dspring.profiles.active=test
```

Les tests utilisent une base H2 en mémoire — aucun Docker requis.

**Rapport de couverture JaCoCo :**

```bash
mvn test jacoco:report -Dspring.profiles.active=test
```

### Tests frontend (unitaires)

```bash
cd frontend
npm test
```

**Avec rapport de couverture :**

```bash
npm run test:coverage
```

### Tests end-to-end (Cypress)

Prérequis : backend et frontend doivent être démarrés.

```bash
cd frontend
npm run cypress:run
```

### Test de performance (k6)

Prérequis : backend démarré, k6 installé (`brew install k6`).

```bash
k6 run k6/upload-test.js
```

## Documentation

| Fichier                          | Contenu                                               |
| -------------------------------- | ----------------------------------------------------- |
| [TESTING.md](TESTING.md)         | Plan de tests, couverture de code, commandes          |
| [SECURITY.md](SECURITY.md)       | Scans de sécurité, mesures en place, décisions        |
| [PERF.md](PERF.md)               | Tests k6, budget de performance frontend, métriques   |
| [MAINTENANCE.md](MAINTENANCE.md) | Mise à jour des dépendances, procédures de correction |
