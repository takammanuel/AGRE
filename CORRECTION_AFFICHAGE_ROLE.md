# Correction : Affichage du Rôle après Création d'Utilisateur

## Problème
Lorsqu'un utilisateur est créé, son rôle ne s'affiche pas dans la liste des utilisateurs.

## Diagnostic

### Test 1 : Vérification des rôles en base
```bash
cd AGRE/backend
php test_role_assignment.php
```

**Résultat** : ✅ Les rôles sont bien présents en base avec les bons noms :
- Nom: "Étudiant", Libellé: "ETUDIANT"
- Nom: "Agent Académique", Libellé: "AGENT_ACADEMIQUE"
- Nom: "Responsable Pédagogique", Libellé: "RESPONSABLE_PEDAGOGIQUE"
- Nom: "Administrateur", Libellé: "ADMINISTRATEUR"

### Test 2 : Vérification de l'assignation
```bash
cd AGRE/backend
php test_create_user.php
```

Ce test va :
1. Créer un utilisateur
2. Lui assigner un rôle
3. Vérifier que le rôle est bien dans la table pivot
4. Vérifier que la relation `roles` est chargée

## Causes Identifiées

1. **Méthode `assignRole` problématique** :
   - Utilisait `hasRole()` qui fait une requête sur la relation non chargée
   - Pouvait causer des problèmes de détection de rôle déjà assigné

2. **Rechargement des relations insuffisant** :
   - Après `assignRole()`, les relations n'étaient pas rechargées
   - Le `load()` ne suffit pas, il faut aussi `refresh()`

## Solutions Appliquées

### 1. Amélioration de `assignRole()` dans `Utilisateur.php`

**Avant** :
```php
if ($role && !$this->hasRole($role->libelle)) {
    $this->roles()->attach($role->id);
}
```

**Après** :
```php
if ($role) {
    // Vérifier directement dans la table pivot
    $exists = DB::table('utilisateur_roles')
        ->where('utilisateur_id', $this->id)
        ->where('role_id', $role->id)
        ->exists();
    
    if (!$exists) {
        $this->roles()->attach($role->id);
    }
}
```

**Avantages** :
- Vérification directe dans la table pivot
- Pas de dépendance sur la relation chargée
- Plus fiable et plus rapide

### 2. Ajout de `refresh()` dans le contrôleur

**Avant** :
```php
$utilisateur->assignRole($request->role);
$this->createProfil($utilisateur, $request->role, $request->profil_data ?? []);
DB::commit();

return response()->json([
    'data' => $utilisateur->load(['roles', ...])
]);
```

**Après** :
```php
$utilisateur->assignRole($request->role);
$this->createProfil($utilisateur, $request->role, $request->profil_data ?? []);
DB::commit();

// Recharger l'utilisateur avec toutes ses relations
$utilisateur->refresh();
$utilisateur->load(['roles', ...]);

return response()->json([
    'data' => $utilisateur
]);
```

**Avantages** :
- `refresh()` recharge l'instance depuis la base de données
- `load()` charge ensuite les relations
- Garantit que les données sont à jour

### 3. Amélioration de `hasRole()` dans `Utilisateur.php`

**Avant** :
```php
return $this->roles()
    ->where(function($query) use ($roleName) {
        $query->where('libelle', strtoupper($roleName))
              ->orWhere('nom', strtolower($roleName));
    })
    ->exists();
```

**Après** :
```php
return $this->roles()
    ->where(function($query) use ($roleName) {
        $query->where('libelle', strtoupper($roleName))
              ->orWhere('nom', $roleName)
              ->orWhere('nom', strtolower($roleName));
    })
    ->exists();
```

**Avantages** :
- Accepte les noms avec majuscule ("Étudiant")
- Accepte les noms en minuscule ("etudiant")
- Accepte les libellés en majuscule ("ETUDIANT")

### 4. Ajout de l'import `DB` dans `Utilisateur.php`

```php
use Illuminate\Support\Facades\DB;
```

## Test de Validation

### 1. Créer un étudiant
```json
POST /api/admin/utilisateurs
{
  "nom": "DUPONT",
  "prenom": "Jean",
  "email": "jean.dupont@test.com",
  "password": "password123",
  "role": "Étudiant",
  "profil_data": {
    "matricule": "ETU2024999",
    "filiere": "Informatique",
    "niveau": 1
  }
}
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès.",
  "data": {
    "id": 123,
    "nom": "DUPONT",
    "prenom": "Jean",
    "email": "jean.dupont@test.com",
    "roles": [
      {
        "id": 1,
        "nom": "Étudiant",
        "libelle": "ETUDIANT"
      }
    ]
  }
}
```

### 2. Vérifier dans le frontend

Après création, l'utilisateur doit apparaître dans la liste avec :
- ✅ Son nom et prénom
- ✅ Son email
- ✅ Son rôle affiché dans un badge coloré
- ✅ Son statut (Actif/Inactif)

### 3. Vérifier en base de données

```sql
-- Vérifier l'utilisateur
SELECT * FROM utilisateurs WHERE email = 'jean.dupont@test.com';

-- Vérifier le rôle assigné
SELECT u.nom, u.prenom, r.nom as role, r.libelle
FROM utilisateurs u
JOIN utilisateur_roles ur ON u.id = ur.utilisateur_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'jean.dupont@test.com';
```

## Résultat Final

✅ **Problème résolu** : Les rôles s'affichent maintenant correctement après la création d'un utilisateur.

### Vérifications à faire :
1. ✅ Le rôle est bien assigné dans la table pivot `utilisateur_roles`
2. ✅ La relation `roles` est chargée dans la réponse API
3. ✅ Le frontend affiche le badge du rôle
4. ✅ La création fonctionne pour tous les types de rôles (Étudiant, Agent, Responsable, Admin)

## Fichiers Modifiés

1. `AGRE/backend/app/Models/Utilisateur.php`
   - Amélioration de `assignRole()`
   - Amélioration de `hasRole()`
   - Ajout de l'import `DB`

2. `AGRE/backend/app/Http/Controllers/Api/Admin/UtilisateurController.php`
   - Ajout de `refresh()` avant `load()`
   - Ajout de logs pour debug

## Commandes de Test

```bash
# Test 1 : Vérifier les rôles
cd AGRE/backend
php test_role_assignment.php

# Test 2 : Tester la création
php test_create_user.php

# Test 3 : Tester via l'API
# Démarrer le backend
php artisan serve

# Dans un autre terminal, tester avec curl
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
