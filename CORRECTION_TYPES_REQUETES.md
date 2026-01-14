# Corrections - Types de Requêtes

## Problèmes Identifiés

1. ✅ **Services non affichés dans le select** - Corrigé
2. ⏳ **Dates non affichées** - À vérifier avec les logs
3. ⏳ **Boutons Modifier/Supprimer ne fonctionnent pas** - À tester

## Corrections Effectuées

### 1. Interface TypeRequete
✅ Ajouté le champ `updated_at` à l'interface TypeScript

### 2. Modal - Chargement des Services
✅ Amélioré la gestion de la réponse API pour les services

### 3. Logs de Débogage
✅ Ajouté des logs pour voir ce que retourne l'API

## Tests à Effectuer

### 1. Vérifier les Services
1. Ouvre la console du navigateur (F12)
2. Clique sur "Ajouter un type"
3. Regarde les logs : tu devrais voir "Services reçus:" et "Services chargés:"
4. Vérifie que le select affiche les services

### 2. Vérifier les Dates
1. Recharge la page des types de requêtes
2. Regarde les logs : tu devrais voir "=== TYPES REQUÊTES REÇUS ==="
3. Vérifie si `created_at` et `updated_at` sont présents dans "Premier type:"

### 3. Tester Modifier
1. Clique sur l'icône crayon (✏️) d'un type
2. Le modal devrait s'ouvrir avec les données pré-remplies
3. Modifie quelque chose et enregistre
4. Vérifie que la modification est sauvegardée

### 4. Tester Supprimer
1. Clique sur l'icône poubelle (🗑️) d'un type
2. Confirme la suppression
3. Vérifie que le type est supprimé de la liste

## Si les Services ne S'affichent Toujours Pas

### Vérifier qu'il y a des services en base
```bash
cd AGRE/backend
php artisan tinker
>>> \App\Models\Service::count();
>>> \App\Models\Service::all();
>>> exit
```

Si aucun service, créer des services de test :
```bash
php artisan db:seed --class=ServicesSeeder
```

## Si les Dates ne S'affichent Pas

### Vérifier que le backend retourne les dates
Regarde dans la console les logs "Premier type:". Tu devrais voir :
```javascript
{
  id: 1,
  nom: "Relevé de notes",
  description: "...",
  service_id: 1,
  created_at: "2026-01-14T10:00:00.000000Z",  // ← Doit être présent
  updated_at: "2026-01-14T10:00:00.000000Z",  // ← Doit être présent
  service: { ... }
}
```

Si `created_at` ou `updated_at` sont absents, le problème vient du backend.

### Solution Backend
Vérifier que le modèle TypeRequete a bien les timestamps activés :
```php
// AGRE/backend/app/Models/TypeRequete.php
class TypeRequete extends Model
{
    use HasFactory;
    
    public $timestamps = true; // ← Doit être true ou absent (true par défaut)
}
```

## Si Modifier/Supprimer ne Fonctionnent Pas

### Vérifier les Erreurs dans la Console
1. Ouvre la console (F12)
2. Clique sur Modifier ou Supprimer
3. Regarde s'il y a des erreurs HTTP (404, 500, etc.)

### Vérifier les Routes Backend
```bash
cd AGRE/backend
php artisan route:list | grep types-requetes
```

Tu devrais voir :
```
PUT|PATCH  api/admin/types-requetes/{type_requete}
DELETE     api/admin/types-requetes/{type_requete}
```

## Commandes Utiles

### Créer des Services de Test
```bash
cd AGRE/backend
php artisan tinker
>>> \App\Models\Service::create(['nom' => 'Scolarité', 'description' => 'Service de scolarité']);
>>> \App\Models\Service::create(['nom' => 'Bibliothèque', 'description' => 'Service de bibliothèque']);
>>> \App\Models\Service::create(['nom' => 'Comptabilité', 'description' => 'Service de comptabilité']);
>>> exit
```

### Créer des Types de Requêtes de Test
```bash
php artisan tinker
>>> $service = \App\Models\Service::first();
>>> \App\Models\TypeRequete::create([
...   'nom' => 'Relevé de notes',
...   'description' => 'Demande de relevé de notes',
...   'service_id' => $service->id
... ]);
>>> exit
```

### Vérifier les Données
```sql
-- Voir tous les services
SELECT * FROM services;

-- Voir tous les types de requêtes avec leurs services
SELECT tr.id, tr.nom, tr.description, s.nom as service, tr.created_at, tr.updated_at
FROM type_requetes tr
LEFT JOIN services s ON tr.service_id = s.id;
```

## Prochaines Étapes

1. Recharge la page des types de requêtes
2. Ouvre la console (F12)
3. Partage-moi les logs que tu vois
4. Teste l'ajout, la modification et la suppression
5. Partage-moi les erreurs éventuelles

Cela nous permettra d'identifier exactement où se situe le problème !
