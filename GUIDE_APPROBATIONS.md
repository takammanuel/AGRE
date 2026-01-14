# Guide Complet - Approbations Admin

## ✅ Modifications Effectuées

### 1. Notifications Toast Ajoutées
- ✅ Notification de succès lors de l'approbation d'une requête
- ✅ Notification de succès lors du rejet d'une requête
- ✅ Notification d'avertissement si le motif de rejet est vide
- ✅ Notification d'erreur en cas de problème

### 2. Composant Toast Intégré
- ✅ `<app-toast>` ajouté dans le template HTML
- ✅ ToastService injecté dans le composant
- ✅ Messages personnalisés avec le code de la requête

### 3. Gestion des Erreurs Améliorée
- ✅ Affichage des messages d'erreur du backend
- ✅ Logs dans la console pour le débogage
- ✅ Fallback sur des messages génériques si nécessaire

## 🚀 Configuration Initiale

### Étape 1 : Activer les Approbations et Créer des Requêtes de Test

```bash
cd AGRE/backend
php setup_approbations.php
```

Ce script va :
1. ✅ Activer `necessite_approbation = true` sur tous les types de requêtes
2. ✅ Créer 4 requêtes de test en attente d'approbation
3. ✅ Afficher un résumé des données créées

**Résultat attendu :**
```
=== CONFIGURATION DES APPROBATIONS ===

1. Activation de l'approbation sur tous les types de requêtes...
   ✓ X type(s) mis à jour

2. Récupération des données...
   ✓ Étudiant : DUPONT Alice
   ✓ Type : Demande de relevé de notes
   ✓ État : EN_ATTENTE

3. Création de requêtes de test...
   🟢 APPRO-TEST-001 - STANDARD
   🔴 APPRO-TEST-002 - URGENTE
   🟢 APPRO-TEST-003 - STANDARD
   🔴 APPRO-TEST-004 - URGENTE

✅ Configuration terminée avec succès !

=== RÉSUMÉ ===
Types nécessitant approbation : X
Requêtes en attente d'approbation : 4

👉 Recharge la page 'Approbations' dans le dashboard admin !
```

### Étape 2 : Vérifier dans le Frontend

1. **Ouvre le dashboard admin**
2. **Va sur la section "Approbations"**
3. **Tu devrais voir les 4 requêtes de test**

## 📋 Utilisation

### Approuver une Requête

1. Clique sur le bouton **"Approuver"** (vert)
2. Confirme dans la popup
3. **Notification affichée :** 
   ```
   ✅ Requête APPRO-TEST-001 approuvée avec succès !
   ```
4. La requête disparaît de la liste (elle passe à "EN_COURS")

### Rejeter une Requête

1. Clique sur le bouton **"Rejeter"** (rouge)
2. Une modal s'ouvre
3. Saisis un **motif de rejet** (obligatoire)
4. Clique sur **"Confirmer le rejet"**
5. **Notification affichée :**
   ```
   ✅ Requête APPRO-TEST-002 rejetée avec succès
   ```
6. La requête disparaît de la liste (elle passe à "REJETEE")

### Cas d'Erreur

**Si le motif de rejet est vide :**
```
⚠️ Veuillez saisir un motif de rejet
```

**Si une erreur backend survient :**
```
❌ Erreur lors de l'approbation
```

## 🔍 Débogage

### Vérifier les Logs dans la Console (F12)

Lors du chargement de la page :
```
=== CHARGEMENT APPROBATIONS ===
Réponse API approbations: {success: true, data: {...}}
response.data: {current_page: 1, data: Array(4), ...}
Approbations chargées: 4
```

### Vérifier les Types Nécessitant Approbation

```bash
cd AGRE/backend
php test_approbations.php
```

**Résultat attendu :**
```
=== TEST APPROBATIONS ===

1. Types de requêtes nécessitant approbation :
Nombre : X
- ID: 1, Nom: Demande de relevé de notes, Approbation: OUI
- ID: 2, Nom: Demande d'attestation, Approbation: OUI
...

2. Requêtes en attente d'approbation :
Nombre : 4
- APPRO-TEST-001 (STANDARD) - Demande de relevé de notes
- APPRO-TEST-002 (URGENTE) - Demande de relevé de notes
...
```

### Vérifier Manuellement en Base de Données

```sql
-- Types nécessitant approbation
SELECT id, nom, necessite_approbation 
FROM type_requetes 
WHERE necessite_approbation = 1;

-- Requêtes en attente d'approbation
SELECT r.code_requete, tr.nom as type, e.libelle as etat, r.priorite
FROM requetes r
JOIN type_requetes tr ON r.type_requete_id = tr.id
JOIN historique_requetes hr ON r.id = hr.requete_id
JOIN etats e ON hr.etat_id = e.id
WHERE tr.necessite_approbation = 1
AND e.libelle = 'EN_ATTENTE'
ORDER BY hr.date_etat DESC;
```

## 🎨 Apparence des Notifications

Les toasts apparaissent en **haut à droite** de l'écran avec :
- ✅ **Succès** : Fond vert avec icône check
- ❌ **Erreur** : Fond rouge avec icône X
- ⚠️ **Avertissement** : Fond orange avec icône warning
- ℹ️ **Info** : Fond bleu avec icône info

Ils disparaissent automatiquement après **5 secondes**.

## 🔧 Commandes Utiles

### Activer l'Approbation sur un Type Spécifique

```bash
php artisan tinker
```

```php
>>> $type = \App\Models\TypeRequete::where('nom', 'Demande de relevé de notes')->first();
>>> $type->necessite_approbation = true;
>>> $type->save();
>>> echo "✓ Approbation activée pour : " . $type->nom;
>>> exit
```

### Créer une Requête de Test Manuellement

```bash
php artisan tinker
```

```php
>>> $etudiant = \App\Models\Utilisateur::whereHas('roles', fn($q) => $q->where('nom', 'Étudiant'))->first();
>>> $type = \App\Models\TypeRequete::where('necessite_approbation', true)->first();
>>> $etat = \App\Models\Etat::where('libelle', 'EN_ATTENTE')->first();

>>> $req = \App\Models\Requete::create([
...   'code_requete' => 'TEST-' . time(),
...   'priorite' => 'URGENTE',
...   'description' => 'Test approbation manuelle',
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

>>> echo "✓ Requête créée : " . $req->code_requete;
>>> exit
```

### Compter les Requêtes en Attente

```bash
php artisan tinker
```

```php
>>> $count = \App\Models\Requete::whereHas('typeRequete', fn($q) => $q->where('necessite_approbation', true))
...   ->whereHas('historiques', fn($q) => $q->whereHas('etat', fn($e) => $e->where('libelle', 'EN_ATTENTE')))
...   ->count();
>>> echo "Requêtes en attente : " . $count;
>>> exit
```

## 📝 Fichiers Modifiés

### Frontend
- ✅ `AGRE/frontend/src/app/pages/admin/approbations/approbations.component.ts`
  - Ajout des notifications Toast dans `approuver()` et `rejeter()`
  - Gestion des messages d'erreur du backend
  
- ✅ `AGRE/frontend/src/app/pages/admin/approbations/approbations.component.html`
  - Ajout du composant `<app-toast>`

### Backend
- ✅ `AGRE/backend/setup_approbations.php` (déjà existant)
  - Script de configuration automatique

## ✨ Résultat Final

Après avoir exécuté `php setup_approbations.php` et rechargé la page :

1. ✅ La section "Approbations" affiche 4 requêtes de test
2. ✅ Le badge affiche "4 en attente"
3. ✅ Chaque requête affiche :
   - Code de la requête
   - Priorité (Urgente/Standard)
   - Informations de l'étudiant
   - Type de requête
   - Service concerné
   - Description
4. ✅ Les boutons "Approuver" et "Rejeter" fonctionnent
5. ✅ Les notifications Toast s'affichent correctement
6. ✅ Les requêtes disparaissent après traitement

## 🎯 Prochaines Étapes

Pour tester complètement le système :

1. **Exécute le script de configuration :**
   ```bash
   cd AGRE/backend
   php setup_approbations.php
   ```

2. **Recharge la page "Approbations" dans le dashboard admin**

3. **Teste l'approbation d'une requête :**
   - Clique sur "Approuver"
   - Vérifie la notification de succès
   - La requête disparaît de la liste

4. **Teste le rejet d'une requête :**
   - Clique sur "Rejeter"
   - Saisis un motif
   - Clique sur "Confirmer le rejet"
   - Vérifie la notification de succès
   - La requête disparaît de la liste

5. **Vérifie les logs dans la console (F12)** pour voir les détails

Tout est maintenant prêt pour fonctionner ! 🎉
