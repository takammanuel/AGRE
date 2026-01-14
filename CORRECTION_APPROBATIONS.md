# Correction - Approbations Admin

## Problème
La section "Approbations" du dashboard admin ne fonctionne pas ou n'affiche aucune requête.

## Causes Possibles

### 1. Aucun Type de Requête ne Nécessite d'Approbation
Par défaut, les types de requêtes n'ont pas le champ `necessite_approbation` activé.

### 2. Aucune Requête en Attente
Il n'y a peut-être pas de requêtes avec le statut "EN_ATTENTE" pour les types nécessitant approbation.

### 3. Problème de Chargement des Données
Le frontend ne reçoit pas correctement les données du backend.

## Diagnostic

### Étape 1 : Vérifier les Types de Requêtes
```bash
cd AGRE/backend
php test_approbations.php
```

Ce test va afficher :
- Les types de requêtes nécessitant approbation
- Les requêtes en attente d'approbation

### Étape 2 : Vérifier dans le Navigateur
1. Ouvre la console (F12)
2. Va sur la page "Approbations"
3. Regarde les logs :
   ```
   === CHARGEMENT APPROBATIONS ===
   Réponse API approbations: {...}
   Approbations chargées: X
   ```

## Solutions

### Solution 1 : Activer l'Approbation sur un Type de Requête

```bash
cd AGRE/backend
php artisan tinker
```

```php
// Activer l'approbation sur le premier type
>>> $type = \App\Models\TypeRequete::first();
>>> $type->necessite_approbation = true;
>>> $type->save();
>>> echo "✓ Approbation activée pour : " . $type->nom;

// Ou activer sur tous les types
>>> \App\Models\TypeRequete::query()->update(['necessite_approbation' => true]);
>>> echo "✓ Approbation activée pour tous les types";

>>> exit
```

### Solution 2 : Créer une Requête de Test Nécessitant Approbation

```bash
php artisan tinker
```

```php
// Récupérer un étudiant et un type nécessitant approbation
>>> $etudiant = \App\Models\Utilisateur::whereHas('roles', fn($q) => $q->where('nom', 'Étudiant'))->first();
>>> $type = \App\Models\TypeRequete::where('necessite_approbation', true)->first();
>>> $etatEnAttente = \App\Models\Etat::where('libelle', 'EN_ATTENTE')->first();

// Créer la requête
>>> $requete = \App\Models\Requete::create([
...   'code_requete' => 'REQ-APPRO-001',
...   'priorite' => 'STANDARD',
...   'description' => 'Requête de test nécessitant approbation admin',
...   'etudiant_id' => $etudiant->id,
...   'type_requete_id' => $type->id,
... ]);

// Ajouter l'historique EN_ATTENTE
>>> \DB::table('historique_requetes')->insert([
...   'requete_id' => $requete->id,
...   'etat_id' => $etatEnAttente->id,
...   'date_etat' => now(),
...   'created_at' => now(),
...   'updated_at' => now(),
... ]);

>>> echo "✓ Requête créée : " . $requete->code_requete;
>>> exit
```

### Solution 3 : Vérifier la Migration

Assure-toi que la table `type_requetes` a bien la colonne `necessite_approbation` :

```sql
DESCRIBE type_requetes;
```

Si la colonne n'existe pas, crée une migration :

```bash
php artisan make:migration add_necessite_approbation_to_type_requetes
```

Contenu de la migration :
```php
public function up()
{
    Schema::table('type_requetes', function (Blueprint $table) {
        $table->boolean('necessite_approbation')->default(false);
    });
}

public function down()
{
    Schema::table('type_requetes', function (Blueprint $table) {
        $table->dropColumn('necessite_approbation');
    });
}
```

Puis exécute :
```bash
php artisan migrate
```

### Solution 4 : Vérifier les Routes Backend

```bash
php artisan route:list | grep approbations
```

Tu devrais voir :
```
GET    api/admin/approbations
POST   api/admin/approbations/{id}/approuver
POST   api/admin/approbations/{id}/rejeter
```

## Test Complet

### 1. Activer l'Approbation
```bash
cd AGRE/backend
php artisan tinker
>>> \App\Models\TypeRequete::first()->update(['necessite_approbation' => true]);
>>> exit
```

### 2. Créer une Requête de Test
```bash
php artisan tinker
>>> $etudiant = \App\Models\Utilisateur::whereHas('roles', fn($q) => $q->where('nom', 'Étudiant'))->first();
>>> $type = \App\Models\TypeRequete::where('necessite_approbation', true)->first();
>>> $etat = \App\Models\Etat::where('libelle', 'EN_ATTENTE')->first();
>>> $req = \App\Models\Requete::create([
...   'code_requete' => 'TEST-' . time(),
...   'priorite' => 'URGENTE',
...   'description' => 'Test approbation',
...   'etudiant_id' => $etudiant->id,
...   'type_requete_id' => $type->id
... ]);
>>> \DB::table('historique_requetes')->insert([
...   'requete_id' => $req->id,
...   'etat_id' => $etat->id,
...   'date_etat' => now(),
...   'created_at' => now(),
...   'updated_at' => now()
... ]);
>>> exit
```

### 3. Vérifier dans le Frontend
1. Recharge la page "Approbations"
2. Tu devrais voir la requête de test
3. Teste les boutons "Approuver" et "Rejeter"

## Vérification SQL

```sql
-- Voir les types nécessitant approbation
SELECT id, nom, necessite_approbation 
FROM type_requetes 
WHERE necessite_approbation = 1;

-- Voir les requêtes en attente d'approbation
SELECT r.code_requete, tr.nom as type, e.libelle as etat
FROM requetes r
JOIN type_requetes tr ON r.type_requete_id = tr.id
JOIN historique_requetes hr ON r.id = hr.requete_id
JOIN etats e ON hr.etat_id = e.id
WHERE tr.necessite_approbation = 1
AND e.libelle = 'EN_ATTENTE'
ORDER BY hr.date_etat DESC;
```

## Résultat Attendu

Après avoir suivi ces étapes, tu devrais :
1. ✅ Voir au moins une requête dans la section "Approbations"
2. ✅ Pouvoir approuver une requête (elle passe à "EN_COURS")
3. ✅ Pouvoir rejeter une requête (elle passe à "REJETEE")
4. ✅ Recevoir une notification côté étudiant

## Logs à Vérifier

Dans la console du navigateur (F12), tu devrais voir :
```
=== CHARGEMENT APPROBATIONS ===
Réponse API approbations: {success: true, data: {...}}
response.data: {current_page: 1, data: Array(X), ...}
Approbations chargées: X
```

Si tu vois "Approbations chargées: 0", c'est qu'il n'y a pas de requêtes nécessitant approbation.

## Commandes Utiles

```bash
# Compter les requêtes nécessitant approbation
php artisan tinker
>>> \App\Models\Requete::whereHas('typeRequete', fn($q) => $q->where('necessite_approbation', true))->count();

# Activer l'approbation sur tous les types
>>> \App\Models\TypeRequete::query()->update(['necessite_approbation' => true]);

# Voir toutes les requêtes en attente
>>> \App\Models\Requete::whereHas('historiques', fn($q) => $q->whereHas('etat', fn($e) => $e->where('libelle', 'EN_ATTENTE')))->count();
```
