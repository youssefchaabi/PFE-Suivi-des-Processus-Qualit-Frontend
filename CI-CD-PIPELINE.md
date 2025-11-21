# Pipeline CI/CD Frontend - Suivi Processus Qualité

## 📋 Vue d'ensemble

Pipeline automatisé pour le frontend Angular avec tests unitaires, build et déploiement.

## 🔄 Structure du Pipeline

### Job 1: Build et Test Frontend
- Configuration Node.js 18
- Installation des dépendances (`npm ci`)
- Build du projet
- Upload des artefacts (dist/)

### Job 2: Tests Unitaires (Jasmine + Karma) ✨
- **Framework**: Jasmine + Karma
- **Tests**: 41 tests unitaires
- **Couverture**: Rapport de couverture généré
- **Services testés**:
  - Authentification (AuthentificationService)
  - Utilisateurs (UtilisateurService)
  - Fiches Qualité (FicheQualiteService)
  - Fiches Suivi (FicheSuiviService)
- **Artefacts**: Rapport de couverture conservé 30 jours

### Job 3: Analyse de qualité du code
- Lint du code TypeScript
- Vérification du formatage
- Analyse statique

### Job 4: Build Docker Image
- Build de production optimisé
- Création d'image Docker avec Nginx
- Push vers Docker Hub (si configuré)

### Job 5: Déploiement
- Notification de déploiement
- Prêt pour Vercel/Netlify/autre

### Job 6: Notification
- Notification de succès/échec
- Résumé des tests

## 🚀 Déclenchement

Le pipeline se déclenche automatiquement sur :
- Push sur `main` ou `develop`
- Pull Request vers `main` ou `develop`

## 📊 Rapports

### Rapport de couverture
- Disponible dans les artefacts GitHub Actions
- Conservé pendant 30 jours
- Accessible via l'onglet "Actions" du repository

### Artefacts
- `frontend-dist`: Fichiers buildés (7 jours)
- `coverage-report`: Rapport de couverture (30 jours)

## 🔧 Configuration requise

### Secrets GitHub (optionnels)
- `DOCKER_USERNAME`: Nom d'utilisateur Docker Hub
- `DOCKER_PASSWORD`: Mot de passe Docker Hub

## 📝 Commandes locales

```bash
# Installation des dépendances
npm ci

# Build
npm run build

# Tests unitaires
npm test -- --watch=false --browsers=ChromeHeadless

# Tests avec couverture
npm test -- --watch=false --browsers=ChromeHeadless --code-coverage

# Build de production
npm run build -- --configuration production
```

## 🐳 Docker

### Build local
```bash
docker build -t suivi-qualite-frontend .
```

### Run local
```bash
docker run -p 80:80 suivi-qualite-frontend
```

## ✅ Résultats

- **41 tests unitaires** passent avec succès
- **0 échec**
- **Couverture de code** générée automatiquement
- **Build optimisé** pour la production

## 📈 Métriques

- Tests: 41/41 ✅
- Framework: Jasmine + Karma
- Node.js: 18
- Angular: 15.2
