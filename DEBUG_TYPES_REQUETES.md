# 🔍 Debug - Types de Requêtes (Modifier/Supprimer)

## Problème

Les notifications de succès s'affichent mais les modifications/suppressions ne sont pas effectuées en base de données.

## Étapes de Débogage

### 1. Ouvrir la Console du Navigateur (F12)

1. Ouvre le dashboard admin
2. Va sur "Types de Requêtes"
3. Ouvre la console (F12 → onglet Console)
4. Ouvre aussi l'onglet Network (Réseau)

### 2. Tester la Modification

**Actions :**
1. Clique sur le bouton "Modifier" d'un type existant
2. Change le nom ou la description
3. Clique sur "Modifier"

**Logs attendus dans la Console :**
```
=== SOUMISSION FORMULAIRE ===
Mode: Édition
formData: {nom: "...", description: "...", service_id: 1}
Validation - nom: ...
Validation - description: ...
Validation - service_id: 1
✓ Formulaire valide, émission de l'événement save

=== MODIFICATION TYPE REQUÊTE ===
ID: 5
Données envoyées: {nom: "...", description: "...", service_id: 1}
URL: http://localhost:8000/api/admin/types-requetes/5
```

**Puis, soit :**
```
✓ Réponse modification: {success: true, message: "...", data: {...}}
```

**Ou :**
```
❌ Erreur modification complète: {...}
Status: 401 / 403 / 422 / 500
Message: ...
Error body: {...}
```

### 3. Vérifier l'Onglet Network (Réseau)

**Dans l'onglet Network, cherche la requête :**
- Nom : `5` (ou l'ID du type)
- Méthode : `PUT`
- URL : `http://localhost:8000/api/admin/types-requetes/5`

**Clique dessus et vérifie :**

#### Headers (En-têtes)
```
Request Method: PUT
Status Code: 200 OK (ou autre)
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json
```

#### Payload (Corps de la requête)
```json
{
  "nom": "Nouveau nom",
  "description": "Nouvelle description",
  "service_id": 1
}
```

#### Response (Réponse)
```json
{
  "success": true,
  "message": "Type de requête modifié avec succès.",
  "data": {
    "id": 5,
    "nom": "Nouveau nom",
    "description": "Nouvelle description",
    "service_id": 1,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

### 4. Cas d'Erreur Possibles

#### Erreur 401 - Non Authentifié
```json
{
  "message": "Unauthenticated."
}
```
**Solution :** Le token JWT est expiré ou manquant. Reconnecte-toi.

#### Erreur 403 - Non Autorisé
```json
{
  "message": "This action is unauthorized."
}
```
**Solution :** L'utilisateur n'a pas les permissions admin.

#### Erreur 422 - Validation Échouée
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "nom": ["Le champ nom est obligatoire."],
    "description": ["Le champ description est obligatoire."]
  }
}
```
**Solution :** Les données envoyées ne passent pas la validation.

#### Erreur 500 - Erreur Serveur
```json
{
  "message": "Server Error"
}
```
**Solution :** Vérifie les logs Laravel : `storage/logs/laravel.log`

### 5. Vérifier les Logs Laravel

```bash
cd AGRE/backend
tail -f storage/logs/laravel.log
```

Puis refais l'action (modifier/supprimer) et regarde les logs en temps réel.

### 6. Tester avec cURL

**Test de modification :**
```bash
# Récupère ton token depuis localStorage dans la console :
# localStorage.getItem('token')

curl -X PUT http://localhost:8000/api/admin/types-requetes/5 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TON_TOKEN_ICI" \
  -d '{
    "nom": "Test cURL",
    "description": "Description test",
    "service_id": 1
  }'
```

**Test de suppression :**
```bash
curl -X DELETE http://localhost:8000/api/admin/types-requetes/5 \
  -H "Authorization: Bearer TON_TOKEN_ICI"
```

### 7. Vérifier en Base de Données

**Avant la modification :**
```sql
SELECT * FROM type_requetes WHERE id = 5;
```

**Après la modification :**
```sql
SELECT * FROM type_requetes WHERE id = 5;
-- Le nom et la description devraient avoir changé
-- updated_at devrait être plus récent
```

## Scénarios Possibles

### Scénario A : Requête HTTP Non Envoyée

**Symptômes :**
- Aucune requête dans l'onglet Network
- Pas de logs "=== MODIFICATION TYPE REQUÊTE ===" dans la console

**Cause :** Le formulaire ne se soumet pas ou l'événement n'est pas émis

**Solution :**
- Vérifie que le bouton "Modifier" appelle bien `onSubmit()`
- Vérifie que `this.save.emit(this.formData)` est appelé

### Scénario B : Requête Envoyée mais Erreur 401/403

**Symptômes :**
- Requête visible dans Network avec status 401 ou 403
- Logs d'erreur dans la console

**Cause :** Problème d'authentification ou d'autorisation

**Solution :**
- Reconnecte-toi
- Vérifie que tu es bien admin
- Vérifie que le token est valide

### Scénario C : Requête Réussie (200) mais Pas de Modification

**Symptômes :**
- Status 200 OK dans Network
- Réponse JSON avec `success: true`
- Toast de succès affiché
- Mais les données ne changent pas en base

**Cause :** Le backend retourne un succès mais ne modifie pas vraiment

**Solution :**
- Vérifie le contrôleur `TypeRequeteController.php`
- Vérifie que `$typeRequete->update($request->validated())` est bien appelé
- Vérifie les logs Laravel

### Scénario D : Modification Réussie mais Liste Non Rafraîchie

**Symptômes :**
- Modification effectuée en base
- Mais la liste ne se met pas à jour

**Cause :** `loadTypeRequetes()` ne recharge pas correctement

**Solution :**
- Vérifie que `this.loadTypeRequetes(this.currentPage)` est appelé
- Recharge la page manuellement (F5) pour voir si les changements sont là

## Checklist de Vérification

- [ ] Console ouverte (F12)
- [ ] Onglet Network ouvert
- [ ] Logs "=== MODIFICATION ===" visibles
- [ ] Requête HTTP visible dans Network
- [ ] Status code de la requête (200, 401, 403, 422, 500)
- [ ] Headers de la requête (Authorization présent)
- [ ] Payload de la requête (données correctes)
- [ ] Réponse du serveur (success: true/false)
- [ ] Logs Laravel vérifiés
- [ ] Base de données vérifiée

## Commandes Utiles

```bash
# Voir les logs Laravel en temps réel
cd AGRE/backend
tail -f storage/logs/laravel.log

# Vérifier les routes
php artisan route:list --path=types-requetes

# Tester le CRUD en PHP
php test_type_requete_crud.php

# Vérifier en base de données
mysql -u root -p
USE agre;
SELECT * FROM type_requetes;
```

## Prochaines Étapes

1. **Ouvre la console (F12)**
2. **Teste une modification**
3. **Copie-colle tous les logs de la console ici**
4. **Vérifie l'onglet Network et note le status code**
5. **Vérifie si la requête HTTP est bien envoyée**

Avec ces informations, on pourra identifier exactement où est le problème ! 🔍
