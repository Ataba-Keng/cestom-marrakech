# Configuration Supabase — CESTOM Marrakech

## 1. Créer le projet

Dans Supabase, créez un projet puis récupérez :

- **Project URL** ;
- clé publishable/anon côté navigateur ;
- **service role key** côté serveur uniquement.

Ne mettez jamais `SUPABASE_SERVICE_ROLE_KEY` dans une variable `VITE_*` ni dans le code client.

## 2. Créer les tables

Dans **SQL Editor**, exécutez le fichier :

```text
supabase/schema.sql
```

Il crée les tables :

- `gallery_albums` ;
- `news_posts` ;
- `board_members` ;
- `admin_users` ;
- le bucket Storage `cestom-media`.

Les visiteurs peuvent lire les albums, les actualités publiées, les membres actifs et les images. Les opérations d’administration sont protégées par RLS et par la table `admin_users`.

## 3. Créer le premier administrateur

Dans **Authentication > Users**, créez un utilisateur avec e-mail et mot de passe.

Ajoutez ensuite une ligne dans `admin_users` :

```sql
insert into public.admin_users (user_id, name, email, role)
select id, 'Administrateur principal', email, 'admin'
from auth.users
where email = 'admin@example.com';
```

Ou configurez l’adresse du propriétaire dans `SUPABASE_OWNER_EMAIL`.

## 4. Variables locales

Copiez `.env.example` vers `.env` et renseignez :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_OWNER_EMAIL=admin@example.com
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

Puis lancez :

```powershell
pnpm install
pnpm dev
```

L’accès admin est ensuite disponible sur :

```text
http://localhost:3000/admin
```

## 5. Ajouter un autre administrateur

Connectez-vous avec le premier administrateur, puis ouvrez :

```text
/admin/administrateurs
```

Saisissez le nom et l’adresse e-mail du deuxième administrateur. Cette personne doit d’abord exister dans **Supabase Authentication > Users** avec le même e-mail. Elle pourra ensuite se connecter avec Supabase et accéder à l’espace admin.

## 6. Déploiement externe

Le projet ne dépend plus de Manus lorsque les variables Supabase sont renseignées :

- la base de données passe par Supabase Postgres/Data API ;
- l’authentification passe par Supabase Auth ;
- les images passent par Supabase Storage ;
- l’ancien fallback MySQL/JSON reste disponible pour les tests locaux sans configuration.

Sur la plateforme de déploiement, ajoutez les cinq variables Supabase comme secrets/environnement. Le service role key doit rester uniquement côté serveur.
