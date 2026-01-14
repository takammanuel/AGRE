# 🔧 Solution - Erreur Port 18000

## Problème

L'application Angular essaie de se connecter au port **18000** au lieu de **8000**.

## Causes Possibles

1. **Cache du navigateur** - L'ancienne configuration est en cache
2. **Application non recompilée** - Le serveur Angular utilise l'ancienne version
3. **Proxy Angular** - Un fichier proxy.conf.json redirige vers 18000
4. **Variable d'environnement** - Une variable système override la config

## Solutions

### Solution 1 : Vider le Cache et Recompiler

```bash
cd AGRE/frontend

# 1. Arrêter le serveur Angular (Ctrl+C)

# 2. Supprimer le cache
rm -rf .angular/cache
rm -rf dist

# 3. Vider le cache npm
npm cache clean --force

# 4. Redémarrer le serveur
ng serve
```

### Solution 2 : Hard Refresh du Navigateur

1. Ouvre le dashboard admin
2. Appuie sur **Ctrl + Shift + R** (Windows) ou **Cmd + Shift + R** (Mac)
3. Ou ouvre les DevTools (F12) → Onglet Network → Coche "Disable cache"
4. Recharge la page

### Solution 3 : Vérifier le Proxy Angular

Vérifie s'il existe un fichier `proxy.conf.json` :

```bash
cd AGRE/frontend
cat proxy.conf.json
```

Si le fichier existe et contient le port 18000, modifie-le :

```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true
  }
}
```

### Solution 4 : Vérifier angular.json

```bash
cd AGRE/frontend
cat angular.json | grep -i proxy
```

Si tu vois une référence à un fichier proxy, vérifie-le.

### Solution 5 : Forcer la Recompilation

```bash
cd AGRE/frontend

# Arrêter le serveur (Ctrl+C)

# Supprimer complètement node_modules et le cache
rm -rf node_modules
rm -rf .angular
rm -rf dist

# Réinstaller
npm install

# Redémarrer
ng serve
```

### Solution 6 : Vérifier le Serveur Laravel

Assure-toi que Laravel tourne bien sur le port 8000 :

```bash
cd AGRE/backend

# Arrêter tous les serveurs PHP
# Ctrl+C dans le terminal où tourne le serveur

# Redémarrer sur le port 8000
php artisan serve --port=8000
```

Tu devrais voir :
```
INFO  Server running on [http://127.0.0.1:8000].
```

### Solution 7 : Vérifier le .env du Backend

```bash
cd AGRE/backend
cat .env | grep APP_URL
```

Devrait afficher :
```
APP_URL=http://localhost:8000
```

Si ce n'est pas le cas, modifie le fichier `.env` :

```env
APP_URL=http://localhost:8000
```

Puis redémarre le serveur Laravel.

## Test Rapide

### 1. Vérifier que Laravel répond sur le port 8000

Ouvre un navigateur et va sur :
```
http://localhost:8000/api/admin/types-requetes
```

Tu devrais voir une réponse JSON (ou une erreur 401 si non authentifié).

### 2. Vérifier dans la Console du Navigateur

1. Ouvre le dashboard admin
2. F12 → Console
3. Tape :
```javascript
console.log(window.location.origin);
// Devrait afficher : http://localhost:4200

// Vérifie l'URL de l'API utilisée
fetch('http://localhost:8000/api/admin/types-requetes')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e));
```

## Procédure Complète de Reset

Si rien ne fonctionne, voici la procédure complète :

### Backend

```bash
cd AGRE/backend

# 1. Arrêter le serveur (Ctrl+C)

# 2. Vérifier le .env
cat .env | grep APP_URL
# Doit être : APP_URL=http://localhost:8000

# 3. Redémarrer
php artisan serve --port=8000
```

### Frontend

```bash
cd AGRE/frontend

# 1. Arrêter le serveur (Ctrl+C)

# 2. Nettoyer le cache
rm -rf .angular/cache
rm -rf dist

# 3. Vérifier environment.ts
cat src/app/environments/environment.ts
# Doit contenir : apiUrl: 'http://localhost:8000/api'

# 4. Redémarrer
ng serve
```

### Navigateur

1. Ferme tous les onglets du dashboard
2. Vide le cache : Ctrl + Shift + Delete → Cocher "Cached images and files" → Clear
3. Rouvre le dashboard : http://localhost:4200
4. F12 → Network → Coche "Disable cache"
5. Recharge la page : Ctrl + Shift + R

## Vérification Finale

Après avoir suivi ces étapes :

1. **Backend** : `http://localhost:8000/api/admin/types-requetes` doit répondre
2. **Frontend** : `http://localhost:4200` doit charger
3. **Console** : Aucune erreur de connexion
4. **Network** : Les requêtes doivent aller vers `localhost:8000` et non `18000`

## Si le Problème Persiste

Envoie-moi :

1. Le contenu de `AGRE/frontend/src/app/environments/environment.ts`
2. Le contenu de `AGRE/backend/.env` (ligne APP_URL)
3. La sortie de `php artisan serve` (pour voir le port)
4. La sortie de `ng serve` (pour voir s'il y a des erreurs)
5. Une capture d'écran de l'onglet Network (F12) montrant les requêtes

Avec ces informations, on pourra identifier le problème exact ! 🔍
