# Instructions pour résoudre le problème d'affichage des utilisateurs

## Problème
Les utilisateurs ne s'affichent pas dans le dashboard admin.

## Solutions possibles

### 1. Vérifier que la base de données est seedée

Exécutez les commandes suivantes dans le dossier `backend` :

```bash
# Réinitialiser la base de données et exécuter les seeders
php artisan migrate:fresh --seed
```

OU si vous voulez juste exécuter les seeders sans réinitialiser :

```bash
php artisan db:seed
```

### 2. Vérifier que les utilisateurs existent en base de données

Connectez-vous à votre base de données et exécutez :

```sql
-- Vérifier le nombre d'utilisateurs
SELECT COUNT(*) FROM utilisateurs;

-- Voir tous les utilisateurs
SELECT id, nom, prenom, email, is_active FROM utilisateurs;

-- Vérifier les rôles des utilisateurs
SELECT u.id, u.nom, u.prenom, u.email, r.nom as role
FROM utilisateurs u
LEFT JOIN utilisateur_roles ur ON u.id = ur.utilisateur_id
LEFT JOIN roles r ON ur.role_id = r.id;
```

### 3. Vérifier que l'utilisateur admin est connecté

L'utilisateur connecté doit avoir le rôle ADMINISTRATEUR pour voir tous les utilisateurs.

Utilisateur admin de test :
- Email: `eva@test.com`
- Mot de passe: `password123`

### 4. Vérifier les logs du backend

Regardez les logs Laravel pour voir les erreurs :

```bash
tail -f storage/logs/laravel.log
```

### 5. Vérifier la console du navigateur

Ouvrez la console du navigateur (F12) et regardez :
- Les erreurs JavaScript
- Les réponses de l'API dans l'onglet Network

## Utilisateurs de test créés par le seeder

Le seeder `UsersAndRolesSeeder` crée 5 utilisateurs :

1. **Alice DUPONT** (Étudiant)
   - Email: alice@test.com
   - Matricule: ETU2024001

2. **Bob MARTIN** (Étudiant)
   - Email: bob@test.com
   - Matricule: ETU2024002

3. **Charlie DURAND** (Agent Académique)
   - Email: charlie@test.com

4. **David LECLERC** (Responsable Pédagogique)
   - Email: david@test.com

5. **Eva MOREAU** (Administrateur)
   - Email: eva@test.com

Tous ont le mot de passe : `password123`

## Vérification de l'API

Testez l'API directement avec curl ou Postman :

```bash
# Obtenir un token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"eva@test.com","password":"password123"}'

# Utiliser le token pour récupérer les utilisateurs
curl -X GET http://localhost:8000/api/admin/utilisateurs \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

## Structure de la réponse API attendue

```json
{
  "success": true,
  "message": "Utilisateurs récupérés avec succès",
  "data": [
    {
      "id": 1,
      "nom": "DUPONT",
      "prenom": "Alice",
      "email": "alice@test.com",
      "telephone": "697932976",
      "is_active": true,
      "roles": [
        {
          "id": 1,
          "nom": "ETUDIANT",
          "libelle": "ETUDIANT"
        }
      ]
    }
  ],
  "pagination": {
    "total": 5,
    "per_page": 100,
    "current_page": 1
  }
}
```
