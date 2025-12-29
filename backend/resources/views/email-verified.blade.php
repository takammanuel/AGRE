<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email vérifié - {{ config('app.name') }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: rgb(209, 208, 208)
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            padding: 60px 40px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 10px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .icon {
            width: 80px;
            height: 80px;
            background: rgb(6, 145, 6);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
            animation: scaleIn 0.5s ease-out 0.2s both;
        }

        @keyframes scaleIn {
            from {
                transform: scale(0);
            }
            to {
                transform: scale(1);
            }
        }

        .icon svg {
            width: 45px;
            height: 45px;
            stroke: white;
            stroke-width: 3;
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        h1 {
            color: #1a202c;
            font-size: 28px;
            margin-bottom: 15px;
            font-weight: 700;
        }

        p {
            color: #4a5568;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
        }

        .user-info {
            background: #f7fafc;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
            border-left: 4px solid #667eea;
        }

        .user-info p {
            margin: 0;
            font-size: 14px;
            color: #2d3748;
        }

        .user-info strong {
            color: #667eea;
            display: block;
            margin-bottom: 5px;
        }

        .btn {
            display: inline-block;
            padding: 15px 40px;
            background: rgb(38, 147, 210);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }

        .footer p {
            font-size: 13px;
            color: #718096;
            margin: 0;
        }

        @media (max-width: 600px) {
            .container {
                padding: 40px 25px;
            }

            h1 {
                font-size: 24px;
            }

            .icon {
                width: 70px;
                height: 70px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Icon Success -->
        <div class="icon">
            <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </div>

        <!-- Title -->
        <h1>Email vérifié avec succès !</h1>

        <!-- Message -->
        <p>Félicitations ! Votre adresse email a été vérifiée avec succès.</p>

        <!-- User Info -->
        {{-- <div class="user-info">
            <p><strong>📧 Votre email :</strong></p>
            <p>{{ $user->email }}</p>
        </div>

        <p>Vous pouvez maintenant vous connecter à votre compte et commencer à utiliser la plateforme.</p> --}}

        <!-- Button -->
        <a href="{{ config('app.frontend_url') ?? 'http://localhost:4200' }}/connexion" class="btn">
            Se connecter maintenant
        </a>

        <!-- Footer -->
        <div class="footer">
            <p>{{ config('app.name') }} - Système de gestion des requêtes</p>
            <p style="margin-top: 5px;">© {{ date('Y') }} Tous droits réservés</p>
        </div>
    </div>
</body>
</html>
