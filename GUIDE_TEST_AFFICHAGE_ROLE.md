# Guide de Test : Affichage du Rôle après Création

## ✅ Tests Backend Réussis

Les tests suivants ont été exécutés avec succès :

### Test 1 : Vérification des rôles en base
```bash
cd AGRE/backend
php test_role_assignment.php
```
**Résultat** : ✅ Tous les rôles sont correctement configurés

### Test 2 : Test de création et assignation
```bash
cd AGRE/backend
php test_create_user.php
```
**Résultat** : ✅ L'utilisateur est créé et le rôle est bien assigné dans la table pivot

## 🧪 Test à Effectuer Maintenant

### Étape 1 : Démarrer le Backend
```bash
cd AGRE/backend
php artisan serve
```
Le serveur devrait démarrer sur `http://localhost:8000`

### Étape 2 : Démarrer le Frontend
Dans un autre terminal :
```bash
cd AGRE/frontend
npm start
```
Le frontend devrait démarrer sur `http://localhost:4200`

### Étape 3 : Se Connecter en Admin
1. Ouvrir le navigateur : `http://localhost:4200`
2. Se connecter avec vos identifiants admin
3. Aller dans **Dashboard Admin** > **Gestion des Utilisateurs**

### Étape 4 : Créer un Nouvel Utilisateur

#### Test 1 : Créer un Étudiant
1. Cliquer sur **"Nouvel utilisateur"**
2. Remplir le formulaire :
   - Nom : `MARTIN`
   - Prénom : `Sophie`
   - Email : `sophie.martin@test.com`
   - Téléphone : `697111222`
   - Mot de passe : `password123`
   - Rôle : **Étudiant**
   - Matricule : `ETU2024100`
   - Filière : `Informatique`
   - Niveau : `1`
3. Cliquer sur **"Créer l'utilisateur"**

**Résultat attendu** :
- ✅ Toast vert : "✓ Utilisateur Sophie MARTIN créé avec succès !"
- ✅ Le modal se ferme
- ✅ L'utilisateur apparaît dans la liste
- ✅ **Le badge "Étudiant" s'affiche en bleu**

#### Test 2 : Créer un Agent Académique
1. Cliquer sur **"Nouvel utilisateur"**
2. Remplir le formulaire :
   - Nom : `BERNARD`
   - Prénom : `Pierre`
   - Email : `pierre.bernard@test.com`
   - Téléphone : `697222333`
   - Mot de passe : `password123`
   - Rôle : **Agent Académique**
   - Poste : `Agent de Scolarité`
3. Cliquer sur **"Créer l'utilisateur"**

**Résultat attendu** :
- ✅ Toast vert : "✓ Utilisateur Pierre BERNARD créé avec succès !"
- ✅ **Le badge "Agent" s'affiche en orange**

#### Test 3 : Créer un Responsable Pédagogique
1. Cliquer sur **"Nouvel utilisateur"**
2. Remplir le formulaire :
   - Nom : `DUBOIS`
   - Prénom : `Marie`
   - Email : `marie.dubois@test.com`
   - Téléphone : `697333444`
   - Mot de passe : `password123`
   - Rôle : **Responsable Pédagogique**
   - Département : `Département Informatique`
3. Cliquer sur **"Créer l'utilisateur"**

**Résultat attendu** :
- ✅ Toast vert : "✓ Utilisateur Marie DUBOIS créé avec succès !"
- ✅ **Le badge "Responsable" s'affiche en violet**

## 🔍 Vérifications à Faire

### Dans le Frontend
Après chaque création, vérifier que :
1. ✅ L'utilisateur apparaît dans la liste
2. ✅ Le nom et prénom sont affichés
3. ✅ L'email est affiché
4. ✅ **Le badge du rôle est visible et coloré**
5. ✅ Le statut "Actif" est affiché
6. ✅ La date d'inscription est affichée

### Dans la Console du Navigateur (F12)
Ouvrir la console et vérifier les logs :
```
=== DÉBUT CRÉATION UTILISATEUR ===
Données du formulaire: {...}
✓ Validation réussie
Données envoyées: {...}
✓ SUCCÈS: {success: true, message: "...", data: {...}}
```

Dans la réponse `data`, vérifier que `roles` est un tableau avec au moins un élément :
```javascript
data: {
  id: 10,
  nom: "MARTIN",
  prenom: "Sophie",
  email: "sophie.martin@test.com",
  roles: [
    {
      id: 1,
      nom: "Étudiant",
      libelle: "ETUDIANT"
    }
  ]
}
```

### Dans la Base de Données
```sql
-- Vérifier l'utilisateur créé
SELECT u.id, u.nom, u.prenom, u.email, r.nom as role
FROM utilisateurs u
LEFT JOIN utilisateur_roles ur ON u.id = ur.utilisateur_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'sophie.martin@test.com';
```

**Résultat attendu** :
```
id | nom    | prenom | email                    | role
10 | MARTIN | Sophie | sophie.martin@test.com   | Étudiant
```

## 🐛 Si le Rôle ne S'affiche Toujours Pas

### 1. Vérifier la Console Backend
Dans le terminal où tourne `php artisan serve`, chercher :
```
[timestamp] local.INFO: Utilisateur créé par admin {"admin_id":1,"utilisateur_id":10,"role":"Étudiant","roles_count":1}
```

Si `roles_count` est 0, il y a un problème d'assignation.

### 2. Vérifier la Réponse API
Dans la console du navigateur (onglet Network), cliquer sur la requête POST vers `/api/admin/utilisateurs` et vérifier la réponse :

**Si `roles` est vide ou absent** :
```json
{
  "data": {
    "roles": []  // ❌ PROBLÈME
  }
}
```

**Si `roles` est présent** :
```json
{
  "data": {
    "roles": [
      {
        "id": 1,
        "nom": "Étudiant",
        "libelle": "ETUDIANT"
      }
    ]  // ✅ OK
  }
}
```

### 3. Test Manuel de l'API
```bash
# Tester directement l'API avec curl
curl -X POST http://localhost:8000/api/admin/utilisateurs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "nom": "TEST",
    "prenom": "User",
    "email": "test@test.com",
    "password": "password123",
    "role": "Étudiant",
    "profil_data": {
      "matricule": "TEST001",
      "filiere": "Test",
      "niveau": 1
    }
  }'
```

### 4. Exécuter le Test de Simulation API
```bash
cd AGRE/backend
php test_api_create.php
```

Ce test simule exactement ce que fait le contrôleur et affiche la réponse JSON.

## 📝 Checklist Finale

- [ ] Backend démarré sur port 8000
- [ ] Frontend démarré sur port 4200
- [ ] Connecté en tant qu'admin
- [ ] Créé un étudiant → Badge "Étudiant" visible
- [ ] Créé un agent → Badge "Agent" visible
- [ ] Créé un responsable → Badge "Responsable" visible
- [ ] Vérifié dans la console que `roles` est présent dans la réponse
- [ ] Vérifié en base de données que les rôles sont bien assignés

## ✅ Si Tout Fonctionne

Le problème est résolu ! Les modifications apportées ont corrigé :
1. La méthode `assignRole()` pour une vérification directe dans la table pivot
2. Le rechargement des relations avec `refresh()` + `load()`
3. La méthode `hasRole()` pour accepter différents formats de noms

Vous pouvez maintenant supprimer les fichiers de test :
```bash
cd AGRE/backend
rm test_role_assignment.php test_create_user.php test_api_create.php
```
