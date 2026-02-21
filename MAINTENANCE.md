# MAINTENANCE.md - Procédures de maintenance DataShare

## Stack technique

| Composant       | Version | Rôle                          |
| --------------- | ------- | ----------------------------- |
| Java            | 21      | Langage backend               |
| Spring Boot     | 4.0.2   | Framework backend             |
| PostgreSQL      | -       | Base de données production    |
| H2              | -       | Base de données tests         |
| React           | 19.2    | Framework frontend            |
| Vite            | 7.3     | Build tool frontend           |
| TanStack Router | 1.159   | Routing frontend              |
| TanStack Query  | 5.90    | Gestion des requêtes frontend |
| Tailwind CSS    | 4.1     | Styles                        |

## Mise à jour des dépendances

### Backend (Maven)

| Action                                 | Commande                                  | Fréquence               | Risque                                     |
| -------------------------------------- | ----------------------------------------- | ----------------------- | ------------------------------------------ |
| Vérifier les mises à jour              | `mvn versions:display-dependency-updates` | Mensuelle               | Aucun (lecture seule)                      |
| Mettre à jour Spring Boot              | Modifier `<version>` dans `pom.xml`       | Tous les 3-6 mois       | **Moyen** - peut casser des API dépréciées |
| Mettre à jour les dépendances mineures | Modifier les versions dans `pom.xml`      | Mensuelle               | **Faible** - correctifs et patchs          |
| Mettre à jour jjwt                     | Modifier la version dans `pom.xml`        | Quand patch de sécurité | **Faible** - API stable                    |

**Procédure après mise à jour :**

```bash
cd backend
mvn clean test -Dspring.profiles.active=test
```

### Frontend (npm)

| Action                      | Commande                                                                 | Fréquence          | Risque                                 |
| --------------------------- | ------------------------------------------------------------------------ | ------------------ | -------------------------------------- |
| Vérifier les mises à jour   | `npm outdated`                                                           | Bimensuelle        | Aucun (lecture seule)                  |
| Vérifier les vulnérabilités | `npm audit`                                                              | Bimensuelle        | Aucun                                  |
| Mettre à jour les patchs    | `npm update`                                                             | Bimensuelle        | **Faible**                             |
| Mettre à jour React         | `npm install react@latest react-dom@latest`                              | Tous les 6-12 mois | **Élevé** - breaking changes possibles |
| Mettre à jour TanStack      | `npm install @tanstack/react-router@latest @tanstack/react-query@latest` | Tous les 3-6 mois  | **Moyen** - API peut changer           |

**Procédure après mise à jour :**

```bash
cd frontend
npm test              # Tests unitaires
npm run build         # Vérification compilation
npm run cypress:run   # Tests E2E (si backend démarré)
```

### Risques par type de mise à jour

| Type           | Risque | Mesure de mitigation                                                 |
| -------------- | ------ | -------------------------------------------------------------------- |
| Patch (x.x.X)  | Faible | Lancer les tests, déployer                                           |
| Mineur (x.X.0) | Moyen  | Lire le changelog, lancer les tests, tester manuellement             |
| Majeur (X.0.0) | Élevé  | Lire le guide de migration, planifier du temps, tester en profondeur |

## Procédures de correction de bug

### 1. Identifier le problème

- Vérifier les logs backend
- Vérifier la console navigateur
- Reproduire le bug en local

### 2. Corriger

- Écrire un test qui reproduit le bug (test en échec)
- Corriger le code
- Vérifier que le test passe
- Lancer tous les tests pour éviter les régressions

```bash
# Backend
cd backend && mvn test -Dspring.profiles.active=test

# Frontend
cd frontend && npm test
```

### 3. Déployer

- Commiter avec un message clair (`fix: description du bug`)
- Pousser et vérifier que le build passe

## Gestion des fichiers expirés

Les fichiers ont une durée de vie de 1 à 7 jours. La base contient la requête `findByExpiredAtBefore` pour identifier les fichiers expirés.

### Nettoyage manuel

```sql
-- Voir les fichiers expirés
SELECT id, name, file_path, expired_at FROM files WHERE expired_at < NOW();

-- Compter les fichiers expirés
SELECT COUNT(*) FROM files WHERE expired_at < NOW();

-- Supprimer les fichiers expirés
DELETE FROM files WHERE expired_at < NOW();
```

## Gestion de la base de données

### Sauvegarde

```bash
# Sauvegarde PostgreSQL
pg_dump -U datashare datashare > backup_$(date +%Y%m%d).sql

# Restauration
psql -U datashare datashare < backup_20260217.sql
```

### Migration de schéma

Actuellement le schéma est géré par `spring.jpa.hibernate.ddl-auto=update`.

**Risque** : en production, `ddl-auto=update` peut perdre des données lors de modifications de colonnes.

**Recommandation** : utiliser **Flyway** ou **Liquibase** pour versionner les migrations SQL.

## Ajout d'une nouvelle fonctionnalité

### Backend

1. Créer le DTO dans `dto/`
2. Ajouter la méthode dans le service (`service/`)
3. Ajouter l'endpoint dans le controller (`controller/`)
4. Écrire les tests unitaires et d'intégration
5. Vérifier la sécurité (endpoint public ou authentifié ?)

### Frontend

1. Ajouter le hook API dans `api/`
2. Créer la route dans `routes/` (TanStack Router génère automatiquement le routing)
3. Créer les composants nécessaires dans `components/`
4. Écrire les tests
5. Vérifier le responsive (mobile/desktop)
