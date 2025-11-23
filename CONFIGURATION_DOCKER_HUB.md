# 🐳 Configuration Docker Hub pour le Frontend

## ⚠️ Problème actuel

L'erreur `unauthorized: access token has insufficient scopes` indique que les secrets Docker Hub ne sont pas correctement configurés.

## ✅ Solution : Configurer les secrets GitHub

### Étape 1 : Créer un Access Token sur Docker Hub

1. Allez sur https://hub.docker.com
2. Connectez-vous à votre compte
3. Cliquez sur votre nom en haut à droite → **Account Settings**
4. Dans le menu de gauche : **Security** → **New Access Token**
5. Donnez un nom au token : `github-actions-frontend`
6. Permissions : Sélectionnez **Read, Write, Delete**
7. Cliquez sur **Generate**
8. **IMPORTANT** : Copiez le token immédiatement (il ne sera plus visible après)

### Étape 2 : Ajouter les secrets dans GitHub

Allez sur votre repository frontend :
**Settings → Secrets and variables → Actions → New repository secret**

Ajoutez ces 2 secrets :

#### Secret 1 : DOCKER_USERNAME
- **Name** : `DOCKER_USERNAME`
- **Value** : Votre nom d'utilisateur Docker Hub (ex: `youssef-chaabi`)

#### Secret 2 : DOCKER_PASSWORD
- **Name** : `DOCKER_PASSWORD`
- **Value** : Le token que vous venez de créer (commence par `dckr_pat_...`)

### Étape 3 : Vérifier la configuration

Une fois les secrets ajoutés :

1. Faites un commit et push :
```bash
cd suivi-processus-qualite-frontend-main
git add .
git commit -m "fix: Configuration Docker Hub avec les bons secrets"
git push origin main
```

2. Le pipeline va se relancer automatiquement
3. Le job "Build Docker Image" devrait maintenant réussir
4. Votre image sera disponible sur Docker Hub : `https://hub.docker.com/r/VOTRE-USERNAME/suivi-qualite-frontend`

## 📋 Vérification des secrets

Pour vérifier que les secrets sont bien configurés :
1. Allez dans **Settings → Secrets and variables → Actions**
2. Vous devriez voir :
   - ✅ `DOCKER_USERNAME`
   - ✅ `DOCKER_PASSWORD`

## 🎯 Résultat attendu

Après configuration, le pipeline affichera :
- ✅ Build et Test Frontend
- ✅ Tests Unitaires (Jasmine + Karma)
- ✅ Analyse de qualité du code
- ✅ **Build Docker Image** (SUCCESS)
- ✅ Déploiement Frontend
- ✅ Notification

Et sur Docker Hub vous verrez :
- 🐳 Image : `suivi-qualite-frontend:latest`
- 🐳 Image : `suivi-qualite-frontend:<commit-sha>`

## ❓ Troubleshooting

### Erreur : "unauthorized: access token has insufficient scopes"
→ Le token Docker Hub n'a pas les bonnes permissions
→ Créez un nouveau token avec les permissions **Read, Write, Delete**

### Erreur : "unauthorized: incorrect username or password"
→ Vérifiez que `DOCKER_USERNAME` correspond exactement à votre username Docker Hub
→ Vérifiez que `DOCKER_PASSWORD` contient le token (pas votre mot de passe)

### Erreur : "denied: requested access to the resource is denied"
→ Vérifiez que le repository Docker Hub existe ou sera créé automatiquement
→ Le nom doit être en minuscules : `suivi-qualite-frontend`

## 📝 Note importante

**N'utilisez JAMAIS votre mot de passe Docker Hub dans les secrets GitHub !**
Utilisez toujours un **Access Token** pour plus de sécurité.

---

**Une fois configuré, l'image Docker sera automatiquement poussée sur Docker Hub à chaque push sur la branche main !** 🎉
