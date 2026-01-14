# Test de Création d'Utilisateurs

## Modifications effectuées

### Backend (PHP/Laravel)

1. **UtilisateurController.php** - Implémentation complète des méthodes :
   - `createProfil()` : Crée le profil selon le rôle (Étudiant, Agent, Responsable, Admin)
   - `updateProfil()` : Met à jour le profil existant
   - `toggleActivation()` : Active/désactive un utilisateur
   - `resetPassword()` : Réinitialise le mot de passe

2. **StoreUtilisateurRequest.php** - Validation corrigée :
   - Accepte les noms de rôles en français : "Étudiant", "Agent Académique", "Responsable Pédagogique", "Administrateur"
   - Validation des champs obligatoires selon le rôle

### Frontend (Angular)

1. **utilisateurs.component.ts** :
   - Suppression du toast de test dans `ngOnInit()`
   - Mapping des rôles vers les noms français attendus par le backend
   - Validation complète des formulaires
   - Gestion des erreurs avec messages clairs

2. **utilisateurs.component.html** :
   - Correction du champ département dupliqué
   - Tous les champs obligatoires marqués avec `*`

3. **toast.component.ts** :
   - Composant fonctionnel sans animation `[@slideIn]`

## Comment tester

### 1. Démarrer le backend
```bash
cd AGRE/backend
php artisan serve
```

### 2. Démarrer le frontend
```bash
cd AGRE/frontend
npm start
```

### 3. Se connecter en tant qu'admin
- Email : admin@agre.com (ou votre email admin)
- Mot de passe : votre mot de passe admin

### 4. Tester la création d'utilisateurs

#### Créer un Étudiant
- Nom : DUPONT
- Prénom : Jean
- Email : jean.dupont@etudiant.com
- Téléphone : 697123456
- Mot de passe : password123
- Rôle : Étudiant
- Matricule : ETU2024001 (obligatoire)
- Filière : Informatique
- Niveau : 1

#### Créer un Agent Académique
- Nom : MARTIN
- Prénom : Marie
- Email : marie.martin@agre.com
- Téléphone : 697234567
- Mot de passe : password123
- Rôle : Agent Académique
- Poste : Agent de Scolarité (obligatoire)

**Note** : Le `service_id` est actuellement hardcodé à 1. Pour améliorer, il faudrait :
- Créer un endpoint pour récupérer la liste des services
- Ajouter un dropdown dans le formulaire pour sélectionner le service

#### Créer un Responsable Pédagogique
- Nom : BERNARD
- Prénom : Pierre
- Email : pierre.bernard@agre.com
- Téléphone : 697345678
- Mot de passe : password123
- Rôle : Responsable Pédagogique
- Département : Département Informatique (obligatoire)

#### Créer un Administrateur
- Nom : ADMIN
- Prénom : Super
- Email : super.admin@agre.com
- Téléphone : 697456789
- Mot de passe : password123
- Rôle : Administrateur
- Niveau d'accès : super_admin

## Messages attendus

### Succès
- ✓ Toast vert : "✓ Utilisateur [Prénom] [Nom] créé avec succès !"
- L'utilisateur apparaît dans la liste
- Le modal se ferme automatiquement

### Erreurs
- ⚠ Toast rouge : "⚠ Cet email est déjà utilisé" (si email existe)
- ⚠ Toast rouge : "⚠ Ce matricule est déjà utilisé" (si matricule existe)
- ⚠ Toast rouge : "Veuillez remplir tous les champs obligatoires correctement" (si validation échoue)
- ❌ Toast rouge : "❌ Impossible de contacter le serveur..." (si backend non démarré)

## Vérifications en base de données

Après création, vérifier dans la base :

```sql
-- Voir tous les utilisateurs
SELECT u.id, u.nom, u.prenom, u.email, r.nom as role 
FROM utilisateurs u 
LEFT JOIN role_utilisateur ru ON u.id = ru.utilisateur_id 
LEFT JOIN roles r ON ru.role_id = r.id;

-- Voir les profils étudiants
SELECT * FROM profil_etudiants;

-- Voir les profils agents
SELECT * FROM profil_agent_administratifs;

-- Voir les profils responsables
SELECT * FROM profil_responsable_pedagogiques;

-- Voir les profils administrateurs
SELECT * FROM profil_administrateurs;
```

## Améliorations futures

1. **Pour les agents** : Ajouter un dropdown pour sélectionner le service au lieu de hardcoder `service_id: 1`
2. **Upload de photo** : Permettre l'upload d'une photo de profil lors de la création
3. **Envoi d'email** : Envoyer un email de bienvenue avec les identifiants
4. **Génération automatique** : Générer automatiquement le matricule pour les étudiants
5. **Validation en temps réel** : Vérifier si l'email existe déjà pendant la saisie
