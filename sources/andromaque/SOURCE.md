# Andromaque (Jean Racine) : source

## Pages Wikisource

- https://fr.wikisource.org/wiki/Andromaque_(Racine,_%C3%A9ditions_Didot,_1854) (bandeau d'avancement « 100 % » ;
  les 22 pages du fac-similé sont au statut « Page corrigée », niveau 3, aucune n'est « validée »)
- sous-pages /À_Madame, /Première_Préface, /Seconde_Préface, /Personnages, /Acte_I à /Acte_V, récupérées le
  2026-10-24 par l'API MediaWiki `action=parse` (HTML rendu), une requête à la fois
- fac-similé : `Livre:Racine - Œuvres, Didot, 1854.djvu`, pages 96 à 117 (p. 84-105 de l'édition)
- statut des pages vérifié par l'API (`prop=proofread`) le même jour

## Édition transcrite

Œuvres de Jean Racine, précédées des Mémoires sur sa vie par Louis Racine, Paris, Firmin-Didot frères, 1854
(même volume que la fiche Phèdre). Orthographe modernisée par l'éditeur de 1854, avec quelques formes anciennes
conservées pour la rime ou l'usage du temps (je voi, je doi, j'entrevoi, piége, sacrilége, poëtes).
L'édition ne numérote pas les vers : les références de la fiche donnent l'acte et la scène.

Autres éditions présentes sur Wikisource : Girard 1668 (édition originale) et Mesnard 1865 (Hachette, Grands
Écrivains). La notice de l'édition Mesnard a servi pour les faits de l'introduction (représentation à la cour du
17 novembre 1667, édition Girard de 1668, épître à Henriette d'Angleterre, La Folle querelle de Subligny en 1668) ;
la date des préfaces vient d'une note de cette édition (la première est celle des éditions de 1668 et 1673, la seconde celle de 1676 et des
éditions suivantes ; les éditeurs ont retranché le début de la première, repris en tête de la seconde, ce qui
explique qu'elle commence ici à « Mes personnages sont si fameux »).

## Licence et domaine public

Jean Racine, mort en 1699. Transcription Wikisource sous licence CC BY-SA 4.0 (créditer Wikisource).

## Nettoyage

- Bandeaux, navigation, numéros de page et notes de Wikisource retirés (les renvois de note de l'épître et de la
  seconde préface ne sont pas repris).
- Coupures de page au milieu d'une réplique ou d'un paragraphe recousues.
- Vers partagés entre deux personnages : la transcription répète en texte masqué le début du vers ; ce texte
  masqué est retiré (chaque moitié de vers reste sous son personnage).
- Espaces insécables remplacées par des espaces simples. Titres d'actes et de scènes, noms des personnages,
  didascalies et lignes de points de la citation latine (seconde préface) conservés.

## Collation avec le fac-similé

Relue à l'œil contre les images du fac-similé : les pages 87, 88, 91, 97, 98, 99, 102, 103, 104 et 105 de
l'édition (celles des passages cités et des réponses aux questions). Les autres pages n'ont pas été collationnées.
Écarts trouvés, texte de 1854 rétabli :

- Acte II, sc. 1 : « fais-le-moi croire aussi » (transcription : « fais-le moi »).
- Acte III, sc. 6 : didascalie « (à Pyrrhus.) » (transcription : « à Pyrrhus », sans parenthèses ni point).
- Acte IV, sc. 1 : « un père au fils d'Hector. » (transcription : virgule).
- Acte V, sc. 3 : « ma couronne et ma foi, » (transcription : « foi ! »).
- Acte V, sc. 4 : « Que vois-je ? est-ce Hermione ? » (transcription : « Est-ce »).

Gardés tels que transcrits : les majuscules accentuées (À, Ô ; l'imprimé porte A, O), « suite d'Oreste » dans la
liste des personnages, les espaces avant la ponctuation (espaces simples).

## Découpage

- `00.txt` : l'épître « À Madame », la première et la seconde préface. Dans la fiche, cette unité est placée après
  l'acte V (conseil de lecture : lire les préfaces après la pièce).
- `01.txt` à `05.txt` : un fichier par acte ; la liste des personnages est en tête de `01.txt`. Vers à la ligne.

Comptage des vers (sur le HTML de Wikisource) : 1 711 lignes de vers, dont 63 suites de vers partagés, soit
1 648 alexandrins.

## Mots par unité

Comptage : `text.split(/\s+/)` sans les segments vides (titres, noms des personnages, didascalies et lignes de
points inclus).

| Fichier | Unité | Début | Fin | Mots |
|---|---|---|---|---|
| 00.txt | Dédicace et préfaces | À MADAME. | … accommoder la fable à leur sujet. » | 1719 |
| 01.txt | Acte I | PERSONNAGES. | Madame, en l'embrassant, songez à le sauver. | 3427 |
| 02.txt | Acte II | ACTE SECOND. | Faisons tout ce que j'ai promis. | 2922 |
| 03.txt | Acte III | ACTE TROISIÈME. | Allons sur son tombeau consulter mon époux. | 3136 |
| 04.txt | Acte IV | ACTE QUATRIÈME. | Andromaque m'attend. Phœnix, garde son fils. | 3104 |
| 05.txt | Acte V | ACTE CINQUIÈME. | FIN D'ANDROMAQUE | 2333 |
| | Total | | | 16641 |
