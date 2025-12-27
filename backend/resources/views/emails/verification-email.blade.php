<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vérification Email</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7fa;
            padding: 20px;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }

        .email-header h1 {
            color: #ffffff;
            font-size: 28px;
            margin-bottom: 10px;
        }

        .email-header p {
            color: #e0e7ff;
            font-size: 16px;
        }

        .email-body {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 20px;
            color: #1a202c;
            margin-bottom: 20px;
            font-weight: 600;
        }

        .content {
            color: #4a5568;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
        }

        .verification-box {
            background-color: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 30px 0;
            border-radius: 6px;
        }

        .verification-box p {
            color: #2d3748;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .verification-box strong {
            color: #667eea;
        }

        .btn-container {
            text-align: center;
            margin: 30px 0;
        }

        .btn-verify {
            display: inline-block;
            padding: 16px 40px;
            background: rgb(33, 118, 198);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);
        }

        .btn-verify:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(102, 126, 234, 0.5);
        }

        .alternative-link {
            margin-top: 20px;
            padding: 15px;
            background-color: #fff5f5;
            border: 1px solid #feb2b2;
            border-radius: 6px;
        }

        .alternative-link p {
            color: #742a2a;
            font-size: 13px;
            margin-bottom: 8px;
        }

        .alternative-link a {
            color: #c53030;
            word-break: break-all;
            font-size: 12px;
        }

        .warning {
            background-color: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 6px;
        }

        .warning p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }

        .email-footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }

        .email-footer p {
            color: #718096;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
        }

        .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 30px 0;
        }

        @media only screen and (max-width: 600px) {
            .email-body {
                padding: 30px 20px;
            }

            .email-header {
                padding: 30px 20px;
            }

            .btn-verify {
                padding: 14px 30px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-body">
            <div class="greeting">
                Bonjour {{ $utilisateur->prenom }} {{ $utilisateur->nom }} !
            </div>

            <div class="content">
                <p>Merci de vous être inscrit(e) sur <strong>{{ config('app.name') }}</strong>.</p>
                <p>Pour finaliser votre inscription et activer votre compte, nous devons vérifier votre adresse email.</p>
            </div>

            {{-- <div class="verification-box">
                <p><strong>📧 Email à vérifier :</strong></p>
                <p>{{ $utilisateur->email }}</p>
            </div> --}}

            <!-- Button -->
            <div class="btn-container">
                <a href="{{ $verificationUrl }}" class="btn-verify">
                    Vérifier mon email
                </a>
            </div>

            <!-- Alternative link -->
            {{-- <div class="alternative-link">
                <p><strong>Le bouton ne fonctionne pas ?</strong></p>
                <p>Copiez et collez ce lien dans votre navigateur :</p>
                <a href="{{ $verificationUrl }}">{{ $verificationUrl }}</a>
            </div> --}}

            <!-- Warning -->
            <div class="warning">
                <p>⚠️ <strong>Important :</strong> Ce lien expirera le <strong>{{ $expiresAt }}</strong>.</p>
            </div>

            <div class="divider"></div>

            <div class="content">
                <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.</p>
                <p>Aucune action supplémentaire ne sera requise de votre part.</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <p>Système de gestion des requêtes universitaires</p>
            <p style="font-size: 12px; color: #a0aec0; margin-top: 15px;">
                © {{ date('Y') }} {{ "AGRE" }}. Tous droits réservés.
            </p>
        </div>
    </div>
</body>
</html>
