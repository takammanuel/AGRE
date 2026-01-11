<x-mail::message>
# Mise à jour de votre requête

Bonjour {{ $requete->utilisateur->nom }},

Votre requête **#{{ $requete->id }}** a changé de statut :
**{{ $requete->statut }}**

<x-mail::button :url="url('/requetes/'.$requete->id)">
Voir la requête
</x-mail::button>

Merci,<br>
{{ config('app.name') }}
</x-mail::message>
