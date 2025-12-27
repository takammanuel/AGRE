# AGRE
Application de gestion de requête d'étudiants au sein d'une institution universitaire

## Structure du projet

```
project-name/
├── frontend/ # Application Angular
├── backend/ # API REST Laravel
├── README.md
└── .gitignore
```

## Technologies utilisées

### Frontend
- Angular
- TypeScript
- HTML / CSS
- Bootstrap / Tailwind (au choix)

### Backend
- Laravel
- PHP >= 8.2
- PostgreSQL / MySQL
- API REST

---

## Prérequis

- Node.js >= 18
- npm ou yarn
- PHP >= 8.2
- Composer
- Serveur de base de données (MySQL ou PostgreSQL)
- Git

---

## Installation

### 1 Cloner le projet
```bash
git clone https://github.com/SteveTetchoup26/AGRE.git
cd AGRE
git checkout develop
git checkout -b feature/nom-de-la-fonctionnalite
```

## Backend (Laravel)

### Installation
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

### Configuration de la base de données
Éditez le fichier `.env` pour configurer votre base de données :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=agre_db
DB_USERNAME=your_username
DB_PASSWORD=your_password
```
### Migrations et seeders

```bash
php artisan migrate --seed
```

### Lancer le serveur

```bash
php artisan serve
```


## Frontend (Angular)

### Installation
```bash
cd ../frontend
npm install
```

### Lancer le serveur

```bash
ng serve
```