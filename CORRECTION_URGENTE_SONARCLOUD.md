# 🚨 Correction Urgente : Projet SonarCloud introuvable

## ❌ Problème

L'erreur indique :
- **"QUALITY GATE STATUS: FAILED"**
- **"The requested project does not exist"**

Cela signifie que la clé du projet dans `sonar-project.properties` ne correspond pas au projet sur SonarCloud.

## ✅ Solution : Recréer le projet sur SonarCloud

### Étape 1 : Supprimer l'ancien projet (si existe)

1. Allez sur https://sonarcloud.io
2. Si vous voyez le projet "Suivi Processus Qualité - Frontend", allez dans :
   - **Administration → General Settings → Delete project** (tout en bas)

### Étape 2 : Créer un nouveau projet

1. Cliquez sur **"My Projects"** (en haut)
2. Cliquez sur **"+"** → **"Analyze new project"**
3. Sélectionnez votre repository : **`PFE-Suivi-des-Processus-Qualite-Frontend`**
4. Cliquez sur **"Set Up"**
5. Choisissez **"With GitHub Actions"**

### Étape 3 : Noter les informations importantes

SonarCloud va vous donner 3 informations :

1. **SONAR_TOKEN** : `sqp_...` (copiez-le)
2. **Project Key** : `youssefchaabi_PFE-Suivi-des-Processus-Qualite-Frontend`
3. **Organization** : `youssef123`

### Étape 4 : Mettre à jour les secrets GitHub

Allez dans votre repository frontend :
**Settings → Secrets and variables → Actions**

Mettez à jour ces secrets :

| Secret Name | Nouvelle valeur |
|-------------|-----------------|
| `SONAR_TOKEN` | Le nouveau token de SonarCloud |
| `SONAR_PROJECT_KEY` | `youssefchaabi_PFE-Suivi-des-Processus-Qualite-Frontend` |
| `SONAR_ORGANIZATION` | `youssef123` |

### Étape 5 : Configurer "New Code"

1. Sur SonarCloud, dans le nouveau projet
2. **Administration → New Code**
3. Sélectionnez **"Previous version"**
4. Cliquez sur **"Save"**

### Étape 6 : Push et test

J'ai déjà corrigé la clé du projet dans `sonar-project.properties`.

Maintenant faites :

```bash
cd suivi-processus-qualite-frontend-main
git add sonar-project.properties
git commit -m "fix: Correction clé projet SonarCloud"
git push origin main
```

## 📊 Résultat attendu

Après ces étapes :

### Sur GitHub Actions :
- ✅ Build et Test Frontend
- ✅ Tests Unitaires (Jasmine + Karma)
- ✅ **Analyse SonarCloud (SUCCESS)** ✅
- ✅ Analyse de qualité du code
- ✅ Build Docker Image
- ✅ Déploiement Frontend
- ✅ Notification

### Sur SonarCloud :
- ✅ **Quality Gate: PASSED** ✅
- 📊 Projet visible et accessible
- 📈 Toutes les métriques affichées

## 🎯 Points importants

1. ⚠️ La clé du projet doit être **exactement** la même que sur SonarCloud
2. ⚠️ Pas d'accents dans la clé : `Qualite` au lieu de `Qualité`
3. ⚠️ Le token doit être à jour
4. ✅ "New Code" doit être configuré sur "Previous version"

---

**Une fois le projet recréé avec la bonne clé, tout fonctionnera parfaitement !** 🎉
