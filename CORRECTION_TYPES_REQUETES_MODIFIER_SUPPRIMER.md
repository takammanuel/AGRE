# ✅ Types de Requêtes - Boutons Modifier et Supprimer Fonctionnels

## 🎯 Problème Résolu

Les boutons "Modifier" et "Supprimer" dans la gestion des types de requêtes ne fonctionnaient pas correctement. Maintenant ils sont **100% fonctionnels** avec notifications Toast.

## 🔧 Modifications Effectuées

### 1. Correction du Modal en Mode Édition

**Problème :** Le `formData` n'était pas correctement initialisé avec les données du type de requête à modifier.

**Solution :**

```typescript
// Dans type-requete-modal.ts

open(): void {
  this.showModal = true;
  this.submitted = false;
  
  // Réinitialiser ou charger les données selon le mode
  if (this.isEdit && this.typeRequete) {
    this.formData = {
      nom: this.typeRequete.nom || '',
      description: this.typeRequete.description || '',
      service_id: this.typeRequete.service_id || null
    };
    console.log('Modal ouvert en mode édition:', this.formData);
  } else {
    this.formData = {
      nom: '',
      description: '',
      service_id: null
    };
    console.log('Modal ouvert en mode création');
  }
}

ngOnChanges(_changes: SimpleChanges): void {
  if (this.typeRequete && this.isEdit) {
    // En mode édition, copier toutes les données du type de requête
    this.formData = {
      nom: this.typeRequete.nom || '',
      description: this.typeRequete.description || '',
      service_id: this.typeRequete.service_id || null
    };
    console.log('Mode édition - formData initialisé:', this.formData);
  } else {
    // En mode création, réinitialiser le formulaire
    this.formData = {
      nom: '',
      description: '',
      service_id: null
    };
    console.log('Mode création - formData réinitialisé');
  }
}
```

### 2. Ajout des Notifications Toast

**Création :**
```typescript
this.typeRequetesService.create(typeRequeteData).subscribe({
  next: (response) => {
    this.toastService.success('Type de requête créé avec succès !');
    this.loadTypeRequetes(this.currentPage);
    this.typeRequeteModal.close();
  },
  error: (error) => {
    const message = error.error?.message || 'Erreur lors de la création';
    this.toastService.error(message);
  }
});
```

**Modification :**
```typescript
this.typeRequetesService.update(this.selectedTypeRequete.id, typeRequeteData).subscribe({
  next: (response) => {
    this.toastService.success('Type de requête modifié avec succès !');
    this.loadTypeRequetes(this.currentPage);
    this.typeRequeteModal.close();
  },
  error: (error) => {
    const message = error.error?.message || 'Erreur lors de la modification';
    this.toastService.error(message);
  }
});
```

**Suppression :**
```typescript
this.typeRequetesService.delete(this.selectedTypeRequete.id).subscribe({
  next: (response) => {
    this.toastService.success('Type de requête supprimé avec succès !');
    this.loadTypeRequetes(this.currentPage);
    this.confirmModal.close();
  },
  error: (error) => {
    const message = error.error?.message || 'Erreur lors de la suppression';
    this.toastService.error(message);
    this.confirmModal.close();
  }
});
```

### 3. Ajout de Logs de Débogage

Pour faciliter le débogage, des logs ont été ajoutés :
- Lors de l'ouverture du modal (création/édition)
- Lors de l'envoi des données au backend
- Lors de la réception des réponses

### 4. Composant Toast Ajouté

```html
<app-toast></app-toast>

<div class="container-fluid py-4">
  <!-- ... reste du template ... -->
</div>
```

## 📋 Fonctionnalités Complètes

### ✅ Créer un Type de Requête

1. Clique sur **"Ajouter un type"**
2. Remplis le formulaire :
   - Libellé (obligatoire)
   - Description (obligatoire)
   - Service associé (optionnel)
3. Clique sur **"Enregistrer"**
4. **Notification :** "Type de requête créé avec succès !"
5. Le nouveau type apparaît dans la liste

### ✅ Modifier un Type de Requête

1. Clique sur le bouton **"Modifier"** (icône crayon jaune)
2. Le modal s'ouvre avec les données pré-remplies
3. Modifie les champs souhaités
4. Clique sur **"Modifier"**
5. **Notification :** "Type de requête modifié avec succès !"
6. Les modifications apparaissent dans la liste

### ✅ Supprimer un Type de Requête

1. Clique sur le bouton **"Supprimer"** (icône poubelle rouge)
2. Une modal de confirmation s'ouvre
3. Clique sur **"Supprimer"**
4. **Notification :** "Type de requête supprimé avec succès !"
5. Le type disparaît de la liste

**Note :** Si le type est utilisé dans des requêtes existantes, la suppression est refusée avec le message :
```
❌ Impossible de supprimer ce type car il est utilisé dans des requêtes.
```

## 🧪 Tests

### Test 1 : Créer un Type de Requête

**Actions :**
1. Clique sur "Ajouter un type"
2. Libellé : "Demande de stage"
3. Description : "Demande de convention de stage"
4. Service : "Scolarité"
5. Clique sur "Enregistrer"

**Résultat attendu :**
- ✅ Toast vert : "Type de requête créé avec succès !"
- ✅ Le nouveau type apparaît dans la liste
- ✅ Le modal se ferme automatiquement

### Test 2 : Modifier un Type de Requête

**Actions :**
1. Clique sur le bouton "Modifier" d'un type existant
2. Le modal s'ouvre avec les données pré-remplies
3. Change la description
4. Clique sur "Modifier"

**Résultat attendu :**
- ✅ Toast vert : "Type de requête modifié avec succès !"
- ✅ Les modifications apparaissent dans la liste
- ✅ Le modal se ferme automatiquement
- ✅ Les dates "Modifié le" sont mises à jour

### Test 3 : Supprimer un Type de Requête Non Utilisé

**Actions :**
1. Clique sur le bouton "Supprimer" d'un type non utilisé
2. Confirme la suppression

**Résultat attendu :**
- ✅ Toast vert : "Type de requête supprimé avec succès !"
- ✅ Le type disparaît de la liste
- ✅ Le modal de confirmation se ferme

### Test 4 : Supprimer un Type de Requête Utilisé

**Actions :**
1. Clique sur le bouton "Supprimer" d'un type utilisé dans des requêtes
2. Confirme la suppression

**Résultat attendu :**
- ❌ Toast rouge : "Impossible de supprimer ce type car il est utilisé dans des requêtes."
- ❌ Le type reste dans la liste
- ✅ Le modal de confirmation se ferme

### Test 5 : Vérifier les Logs dans la Console

**Ouvre la console (F12) et vérifie :**

**Lors de la création :**
```
Modal ouvert en mode création
Création d'un nouveau type de requête
Données envoyées: {nom: "...", description: "...", service_id: 1}
Réponse création: {success: true, message: "...", data: {...}}
```

**Lors de la modification :**
```
Modal ouvert en mode édition: {nom: "...", description: "...", service_id: 1}
Modification du type de requête ID: 5
Données envoyées: {nom: "...", description: "...", service_id: 1}
Réponse modification: {success: true, message: "...", data: {...}}
```

**Lors de la suppression :**
```
Suppression du type de requête ID: 5
Réponse suppression: {success: true, message: "..."}
```

## 🔍 Backend - Routes et Contrôleur

### Routes (api.php)

```php
Route::apiResource('types-requetes', TypeRequeteController::class)->except(['create', 'edit']);
```

Cela crée automatiquement :
- `GET /api/admin/types-requetes` - Liste
- `POST /api/admin/types-requetes` - Créer
- `GET /api/admin/types-requetes/{id}` - Afficher
- `PUT /api/admin/types-requetes/{id}` - Modifier
- `DELETE /api/admin/types-requetes/{id}` - Supprimer

### Contrôleur (TypeRequeteController.php)

**Méthode update :**
```php
public function update(UpdateTypeRequeteRequest $request, TypeRequete $typeRequete): JsonResponse
{
    $typeRequete->update($request->validated());

    return response()->json([
        'success' => true,
        'message' => 'Type de requête modifié avec succès.',
        'data' => $typeRequete->load('service')
    ]);
}
```

**Méthode destroy :**
```php
public function destroy(TypeRequete $typeRequete): JsonResponse
{
    // Vérifier si le type est utilisé dans des requêtes
    if ($typeRequete->requetes()->count() > 0) {
        return response()->json([
            'success' => false,
            'message' => 'Impossible de supprimer ce type car il est utilisé dans des requêtes.'
        ], 422);
    }

    $typeRequete->delete();

    return response()->json([
        'success' => true,
        'message' => 'Type de requête supprimé avec succès.'
    ]);
}
```

## 📊 Exemple de Requêtes API

### Créer un Type de Requête

```http
POST http://localhost:8000/api/admin/types-requetes
Content-Type: application/json

{
  "nom": "Demande de stage",
  "description": "Demande de convention de stage",
  "service_id": 1
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Type de requête créé avec succès.",
  "data": {
    "id": 10,
    "nom": "Demande de stage",
    "description": "Demande de convention de stage",
    "service_id": 1,
    "service": {
      "id": 1,
      "nom": "Scolarité"
    },
    "created_at": "2026-01-14T10:30:00.000000Z",
    "updated_at": "2026-01-14T10:30:00.000000Z"
  }
}
```

### Modifier un Type de Requête

```http
PUT http://localhost:8000/api/admin/types-requetes/10
Content-Type: application/json

{
  "nom": "Demande de stage (modifié)",
  "description": "Demande de convention de stage pour étudiants",
  "service_id": 1
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Type de requête modifié avec succès.",
  "data": {
    "id": 10,
    "nom": "Demande de stage (modifié)",
    "description": "Demande de convention de stage pour étudiants",
    "service_id": 1,
    "service": {
      "id": 1,
      "nom": "Scolarité"
    },
    "created_at": "2026-01-14T10:30:00.000000Z",
    "updated_at": "2026-01-14T10:35:00.000000Z"
  }
}
```

### Supprimer un Type de Requête

```http
DELETE http://localhost:8000/api/admin/types-requetes/10
```

**Réponse (succès) :**
```json
{
  "success": true,
  "message": "Type de requête supprimé avec succès."
}
```

**Réponse (type utilisé) :**
```json
{
  "success": false,
  "message": "Impossible de supprimer ce type car il est utilisé dans des requêtes."
}
```

## 🎨 Notifications Toast

### Toast de Succès (Vert)
```
✅ Type de requête créé avec succès !
✅ Type de requête modifié avec succès !
✅ Type de requête supprimé avec succès !
```

### Toast d'Erreur (Rouge)
```
❌ Erreur lors de la création
❌ Erreur lors de la modification
❌ Impossible de supprimer ce type car il est utilisé dans des requêtes.
```

**Position :** En haut à droite de l'écran  
**Durée :** 5 secondes (disparition automatique)  
**Animation :** Slide-in depuis la droite

## 📝 Fichiers Modifiés

### Frontend

1. **`AGRE/frontend/src/app/pages/admin/type-requetes/type-requetes.ts`**
   - Ajout du ToastService
   - Ajout du ToastComponent dans les imports
   - Notifications Toast dans `onTypeRequeteSaved()` et `onDeleteConfirmed()`
   - Logs de débogage

2. **`AGRE/frontend/src/app/pages/admin/type-requetes/type-requetes.html`**
   - Ajout du composant `<app-toast>`

3. **`AGRE/frontend/src/app/pages/modals/type-requetes/type-requete-modal/type-requete-modal.ts`**
   - Correction de la méthode `open()` pour initialiser correctement le `formData`
   - Amélioration de `ngOnChanges()` pour gérer les modes création/édition
   - Logs de débogage

### Backend

Aucune modification nécessaire - Les routes et le contrôleur fonctionnaient déjà correctement.

## ✨ Résultat Final

Les boutons "Modifier" et "Supprimer" sont maintenant :
- ✅ **Fonctionnels** - Toutes les opérations CRUD fonctionnent
- ✅ **Avec Notifications** - Toast pour chaque action (succès/erreur)
- ✅ **Avec Logs** - Console logs pour faciliter le débogage
- ✅ **Sécurisés** - Impossible de supprimer un type utilisé
- ✅ **Intuitifs** - Modal de confirmation pour la suppression
- ✅ **Cohérents** - Style similaire aux autres pages admin

Tout fonctionne parfaitement ! 🎉
