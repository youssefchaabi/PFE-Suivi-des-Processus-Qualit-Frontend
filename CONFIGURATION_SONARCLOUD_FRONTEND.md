# 🔧 Configuration SonarCloud pour le Frontend Angular

## ✅ Étape 1: Créer le projet sur SonarCloud

1. Allez sur https://sonarcloud.io
2. Connectez-vous avec GitHub
3. Cliquez sur "+" en haut à droite → "Analyze new project"
4. Sélectionnez votre repository **`PFE-Suivi-des-Processus-Qualite-Frontend`**
5. Cliquez sur "Set Up"
6. Choisissez "With GitHub Actions"

SonarCloud va vous donner 3 informations :
- **SONAR_TOKEN** : Token d'authentification (commence par `sqp_...`)
- **Project Key** : Clé du projet (ex: `youssefchaabi_PFE-Suivi-des-Processus-Qualite-Frontend`)
- **Organization** : Votre organisation (ex: `youssefchaabi`)

## ✅ Étape 2: Configurer les secrets GitHub

Allez dans votre repository frontend sur GitHub :
**Settings → Secrets and variables → Actions → New repository secret**

Ajoutez ces 3 secrets :

### Secret 1: SONAR_TOKEN
- **Name** : `SONAR_TOKEN`
- **Value** : Le token de SonarCloud (ex: `sqp_abc123...`)

### Secret 2: SONAR_PROJECT_KEY
- **Name** : `SONAR_PROJECT_KEY`
- **Value** : La clé du projet (ex: `youssefchaabi_PFE-Suivi-des-Processus-Qualite-Frontend`)

### Secret 3: SONAR_ORGANIZATION
- **Name** : `SONAR_ORGANIZATION`
- **Value** : Votre organisation (ex: `youssefchaabi`)

## ✅ Étape 3: Mettre à jour sonar-project.properties

Ouvrez le fichier `sonar-project.properties` et remplacez :

```properties
sonar.projectKey=votre-organisation_suivi-processus-qualite-frontend
sonar.organization=votre-organisation
```

Par vos vraies valeurs, par exemple :

```properties
sonar.projectKey=youssefchaabi_PFE-Suivi-des-Processus-Qualite-Frontend
sonar.organization=youssefchaabi
```

## ✅ Étape 4: Commit et Push

```bash
cd suivi-processus-qualite-frontend-main
git add .
git commit -m "feat: Configuration SonarCloud pour le frontend"
git push origin main
```

## 📊 Résultat attendu sur SonarCloud

Après le push, vous verrez sur https://sonarcloud.io :

### Métriques de qualité :
- ✅ **Quality Gate** : PASSED
- 📊 **Coverage** : Pourcentage de couverture (basé sur les 41 tests)
- 🐛 **Bugs** : 0
- 🔒 **Vulnerabilities** : 0
- 💡 **Code Smells** : Suggestions d'amélioration
- 📈 **Duplications** : Code dupliqué
- 🎯 **Maintainability** : Note de maintenabilité

### Analyse du code TypeScript/Angular :
- Analyse des composants Angular
- Analyse des services
- Analyse des guards et interceptors
- Couverture des tests unitaires (Jasmine + Karma)

## 🎯 Pipeline complet

Le pipeline frontend aura maintenant **7 jobs** :

1. ✅ **Build et Test Frontend**
2. ✅ **Tests Unitaires (Jasmine + Karma)** - 41 tests
3. ✅ **Analyse SonarCloud** 🆕
4. ✅ **Analyse de qualité du code** (Lint)
5. ✅ **Build Docker Image**
6. ✅ **Déploiement Frontend**
7. ✅ **Notification**

## 📝 Configuration SonarCloud

Le fichier `sonar-project.properties` est configuré pour :
- ✅ Analyser le code TypeScript dans `src/`
- ✅ Exclure les fichiers de test (*.spec.ts)
- ✅ Exclure node_modules, dist, coverage
- ✅ Utiliser le rapport de couverture LCOV
- ✅ Analyser les tests unitaires

## ❓ Troubleshooting

### Erreur: "Not authorized"
→ Vérifiez que `SONAR_TOKEN` est correct dans les secrets GitHub

### Erreur: "Project not found"
→ Vérifiez que `SONAR_PROJECT_KEY` correspond exactement à la clé sur SonarCloud

### Erreur: "Organization not found"
→ Vérifiez que `SONAR_ORGANIZATION` correspond au nom de votre organisation

### Erreur: "Could not find a default branch"
→ Assurez-vous que votre repository a une branche `main`

### Quality Gate Failed
→ Normal au début, vous pouvez :
- Ajuster les règles du Quality Gate sur SonarCloud
- Améliorer la qualité du code selon les recommandations

## 🎉 Badge SonarCloud (optionnel)

Vous pouvez ajouter un badge dans votre README.md :

```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=VOTRE_PROJECT_KEY&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=VOTRE_PROJECT_KEY)
```

---

**Une fois configuré, chaque push déclenchera automatiquement l'analyse SonarCloud et affichera les résultats sur https://sonarcloud.io !** 🎉
