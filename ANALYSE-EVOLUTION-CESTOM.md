# Analyse et proposition d’évolution — CESTOM Marrakech

## 1. Synthèse

Le projet est une **base fonctionnelle et saine** pour le site vitrine de la CESTOM Marrakech :

- frontend React 19 / Vite / TypeScript ;
- backend Express + tRPC ;
- authentification Manus OAuth avec contrôle du rôle `admin` ;
- persistance MySQL avec Drizzle ORM ;
- stockage d’images Manus/S3 déjà intégré ;
- galerie publique avec filtre par année et visionneuse plein écran ;
- interface d’administration déjà opérationnelle pour les albums de galerie.

Le point essentiel est le suivant : **les trois prochaines fonctionnalités ont déjà été préparées côté serveur, mais ne sont pas encore reliées à l’interface utilisateur**.

| Fonctionnalité | État actuel | Écart à combler |
|---|---|---|
| Téléversement d’images | Procédure tRPC `media.uploadImage` existante | Ajouter le sélecteur de fichier, la prévisualisation, le téléversement et l’intégration aux formulaires |
| Actualités/publications | Schéma DB, migrations, procédures tRPC existants | Créer les pages publiques et les écrans CRUD administrateur |
| Bureau exécutif | Schéma DB, migrations, procédures tRPC existants | Créer la page publique et l’écran CRUD administrateur |

## 2. Ce qui existe déjà

### Frontend

- `/` : page d’accueil éditoriale, actuellement majoritairement alimentée par des contenus codés en dur.
- `/galerie` : page publique de galerie.
- `/admin` : espace protégé, avec gestion CRUD des albums.
- Composants UI Radix/shadcn déjà disponibles.
- Design cohérent : vert CESTOM, jaune, rouge, typographies et composants responsives.

### Backend et données

- `drizzle/schema.ts` contient déjà les tables :
  - `gallery_albums` ;
  - `news_posts` ;
  - `board_members` ;
  - `users`.
- `server/routers.ts` expose déjà :
  - `gallery.list/create/update/remove` ;
  - `media.uploadImage` ;
  - `news.list/adminList/create/update/remove` ;
  - `board.list/adminList/create/update/remove`.
- `server/db.ts` contient les opérations de lecture, création, modification et suppression pour les trois domaines.
- `drizzle/0002_jittery_legion.sql` crée bien les tables `news_posts` et `board_members`.
- Le stockage est prévu via `storagePut`, avec :
  - nom de fichier normalisé ;
  - suffixe aléatoire pour éviter les collisions ;
  - limite de 8 Mo par image ;
  - types acceptés : JPEG, PNG, WebP, GIF.

## 3. Validation effectuée

Depuis une installation propre des dépendances :

- `pnpm check` : **réussi** ;
- `pnpm test` : **7 tests réussis sur 7** ;
- `pnpm build` : **réussi**.

Avertissements non bloquants observés au build :

1. variables analytics `VITE_ANALYTICS_ENDPOINT` et `VITE_ANALYTICS_WEBSITE_ID` non définies ;
2. bundle JavaScript principal supérieur à 500 kB minifié.

Ces avertissements ne bloquent pas la prochaine étape, mais pourront être traités avant une mise en production plus exigeante.

## 4. Analyse détaillée par chantier

### 4.1 Téléversement réel d’images

#### Situation actuelle

Dans `client/src/pages/Admin.tsx`, l’administrateur doit encore saisir manuellement un chemin du type :

```text
/manus-storage/nom-du-fichier.jpg
```

Pourtant, `server/routers.ts` possède déjà la mutation `media.uploadImage`, qui reçoit un fichier encodé en base64 et renvoie une URL de stockage.

#### Évolution recommandée

Créer un composant réutilisable `ImageUploader` qui :

1. ouvre un `<input type="file">` ;
2. vérifie côté client le type et la taille ;
3. affiche une prévisualisation locale ;
4. téléverse le fichier via `trpc.media.uploadImage` ;
5. remplace automatiquement `imageUrl` dans le formulaire ;
6. affiche l’état « téléversement en cours », la réussite ou l’erreur ;
7. permet de remplacer une image avant l’enregistrement du contenu.

#### Point technique important

Le backend accepte actuellement une image de 8 Mo, mais le serveur Express autorise des requêtes JSON de 50 Mo. L’upload base64 augmente la taille du fichier d’environ 33 %. Pour la V1, cette approche est acceptable pour des images occasionnelles. À moyen terme, il serait préférable de passer à un flux multipart ou à une URL présignée côté navigateur pour éviter de faire transiter le fichier encodé par tRPC.

#### Recommandations complémentaires

- redimensionner/comprimer les images côté client avant upload ;
- conserver le texte alternatif comme champ obligatoire pour les images publiques ;
- générer des noms de fichiers uniques plutôt que de dépendre uniquement du nom envoyé ;
- prévoir une image par défaut lorsque le visuel est facultatif ;
- ajouter un test de validation des types MIME, de la taille et des droits admin.

### 4.2 Actualités et publications

#### Situation actuelle

La table `news_posts` et les procédures serveur existent, mais :

- aucune route frontend publique n’existe pour lire une actualité ;
- aucune page de détail n’existe ;
- aucune gestion admin n’est présente dans `Admin.tsx` ;
- l’accueil n’affiche pas encore les dernières publications ;
- `publishedAt` est stocké comme texte, ce qui limite le tri et la recherche par date.

#### Évolution frontend recommandée

Ajouter :

- `/actualites` : liste des publications publiées ;
- `/actualites/:id` ou `/actualites/:slug` : détail d’une publication ;
- dans l’accueil : bloc « Dernières actualités » avec 3 publications maximum ;
- dans `/admin` : onglet ou section « Actualités » avec liste, filtres par statut et actions CRUD.

Le formulaire administrateur doit proposer :

- titre ;
- résumé ;
- contenu ;
- catégorie ;
- image principale via `ImageUploader` ;
- statut `Brouillon` ou `Publié` ;
- date de publication.

#### Évolution de données recommandée

Pour une V1, le modèle actuel peut être utilisé. Pour une version plus robuste, prévoir :

- `slug` unique pour des URLs lisibles et stables ;
- `publishedAt` en vrai type `timestamp` ou `datetime` ;
- `createdBy` et `updatedBy` ;
- éventuellement `deletedAt` plutôt qu’une suppression irréversible ;
- une longueur de contenu adaptée si un éditeur riche est ajouté.

Il est préférable de commencer avec un éditeur Markdown simple ou un textarea amélioré plutôt que d’introduire immédiatement un éditeur riche lourd. Cela réduit les dépendances et les risques de contenu HTML non maîtrisé.

### 4.3 Bureau exécutif

#### Situation actuelle

La table `board_members` existe avec les champs adaptés à une première version :

- nom ;
- fonction ;
- biographie ;
- image ;
- ordre d’affichage ;
- statut actif/inactif.

Les procédures publiques et administrateur existent également. En revanche, aucune page ne les consomme actuellement.

#### Évolution frontend recommandée

Ajouter une section publique sur l’accueil ou une page `/bureau-executif` avec :

- portrait ;
- nom ;
- fonction ;
- courte biographie ;
- ordre de présentation maîtrisé ;
- affichage uniquement des membres actifs.

Ajouter dans l’administration une section « Bureau exécutif » permettant de :

- créer un membre ;
- modifier ses informations ;
- téléverser/remplacer son portrait ;
- activer ou désactiver son affichage ;
- modifier l’ordre via un champ ou des boutons monter/descendre ;
- supprimer un membre avec confirmation.

#### Recommandations de données

- remplacer à terme `active: int` par un booléen logique si le dialecte et les migrations le permettent ;
- ajouter une validation de format d’image ;
- limiter la biographie à une longueur raisonnable côté interface ;
- prévoir une image générique si un portrait n’est pas disponible.

## 5. Proposition d’architecture frontend

L’actuel `Admin.tsx` concentre déjà toute la gestion galerie dans un seul fichier. Avec l’ajout de deux domaines, il deviendrait rapidement difficile à maintenir.

Je recommande cette structure :

```text
client/src/
├── components/
│   ├── admin/
│   │   ├── AdminSection.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── NewsForm.tsx
│   │   ├── BoardMemberForm.tsx
│   │   └── GalleryAlbumForm.tsx
│   └── content/
│       ├── NewsCard.tsx
│       └── BoardMemberCard.tsx
├── pages/
│   ├── Admin.tsx
│   ├── News.tsx
│   ├── NewsDetail.tsx
│   ├── Board.tsx
│   └── Gallery.tsx
└── lib/
    └── trpc.ts
```

Dans `/admin`, deux variantes sont possibles :

1. **un tableau de bord à onglets** : Galerie, Actualités, Bureau exécutif ;
2. **des sous-routes** : `/admin/galerie`, `/admin/actualites`, `/admin/bureau`.

Je recommande les sous-routes à moyen terme, car elles rendent les URLs plus claires, évitent un composant monolithique et facilitent l’évolution future.

## 6. Feuille de route proposée

### Phase 1 — socle éditorial et téléversement

Objectif : supprimer la saisie manuelle des chemins d’image.

- créer `ImageUploader` ;
- l’intégrer à la gestion galerie ;
- ajouter prévisualisation, validation et gestion d’erreur ;
- couvrir la mutation upload par des tests ;
- factoriser les formulaires et les notifications.

**Résultat attendu :** l’administrateur peut créer/modifier un album sans connaître le stockage technique.

### Phase 2 — gestion des actualités

- créer la page publique `/actualites` ;
- créer la page de détail ;
- afficher les dernières actualités sur l’accueil ;
- créer le CRUD admin ;
- intégrer le téléversement d’image ;
- ajouter brouillon/publication ;
- ajouter les tests des procédures et des composants critiques.

**Résultat attendu :** la CESTOM peut publier une information complète sans modifier le code.

### Phase 3 — bureau exécutif

- créer la page publique ou section dédiée ;
- créer le CRUD admin ;
- intégrer les portraits ;
- gérer ordre et visibilité ;
- ajouter une section sur l’accueil si souhaité.

**Résultat attendu :** la composition du bureau peut évoluer sans intervention technique.

### Phase 4 — qualité éditoriale et mise en production

- ajouter les slugs et métadonnées SEO ;
- ajouter titres/meta descriptions par page ;
- vérifier les routes 404 et le rafraîchissement direct des pages ;
- optimiser les images et le chargement ;
- corriger ou configurer les variables analytics ;
- améliorer le découpage du bundle ;
- compléter les tests de non-régression ;
- mettre en place une stratégie de sauvegarde de la base et des médias.

## 7. Priorités fonctionnelles recommandées

### Priorité immédiate

1. **Téléversement d’images** : c’est le blocage transversal des trois futures fonctionnalités.
2. **Actualités** : valeur éditoriale forte, contenu régulièrement renouvelable.
3. **Bureau exécutif** : fonctionnalité plus stable et plus simple à livrer après le composant upload.

### À ne pas faire tout de suite

- système complexe de rôles multiples ;
- commentaires publics ;
- notifications email ;
- éditeur riche avec gestion HTML avancée ;
- galerie photo individuelle avec stockage de chaque photo, tant que le besoin réel n’est pas confirmé.

## 8. Points de vigilance

1. **Galerie actuelle :** un album ne stocke qu’une image principale et un nombre de photos. Si l’objectif est de consulter les photos une par une, il faudra une table `gallery_photos` liée à `gallery_albums` plutôt que de simplement augmenter `photoCount`.
2. **Contenus de démonstration :** la galerie utilise des données de fallback codées en dur lorsque la base est vide. C’est pratique pour la démo, mais en production cela peut masquer une panne ou donner l’impression que des contenus sont publiés. Il faudra distinguer clairement « données de démonstration » et « contenu réel ».
3. **Accueil statique :** les slides, activités et statistiques sont codés dans `Home.tsx`. Pour un vrai site administrable, il faudra décider quels blocs doivent devenir éditables et lesquels rester institutionnels.
4. **Dates :** `publishedAt` et `eventDate` sont actuellement des chaînes de caractères. Cela fonctionne pour l’affichage, mais pas pour le tri, les filtres ou les formats multilingues.
5. **Upload via base64 :** acceptable pour une première version, moins adapté à de gros volumes ou à des connexions mobiles lentes.
6. **Navigation admin :** la barre latérale ne contient encore que le tableau de bord et la galerie. Elle devra être enrichie pour éviter que les nouvelles fonctionnalités soient cachées.
7. **Tests :** les tests actuels couvrent surtout la galerie et l’authentification. Les actualités, le bureau et l’upload devront avoir leurs propres tests.

## 9. Conclusion

Le projet n’a pas besoin d’être repris depuis zéro. La partie la plus coûteuse — la connexion entre authentification, backend tRPC, schéma de données, migrations et stockage — est déjà en place.

La prochaine étape la plus pertinente est donc une **phase d’intégration frontend**, en commençant par un composant de téléversement réutilisable. Ensuite, les modules Actualités et Bureau exécutif pourront être livrés rapidement en réutilisant les procédures backend déjà présentes.

En pratique, je recommande de viser un premier lot cohérent composé de :

- upload d’image opérationnel dans la galerie ;
- gestion admin des actualités ;
- page publique `/actualites` ;
- gestion admin du bureau exécutif ;
- page publique ou section « Bureau exécutif » ;
- tests et vérification de compilation associés.

Cela transformerait le site d’une vitrine principalement statique en un **site institutionnel réellement administrable par l’équipe CESTOM**.
