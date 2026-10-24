# Le Misanthrope (Molière) : source

## Pages Wikisource

- https://fr.wikisource.org/wiki/Le_Misanthrope/%C3%89dition_Louandre,_1910 (sommaire, texte « validé » ; la liste des personnages
  et l’indication de lieu sont imprimées sur cette page, p. 170)
- https://fr.wikisource.org/wiki/Le_Misanthrope/%C3%89dition_Louandre,_1910/Acte_I (p. 170-188)
- https://fr.wikisource.org/wiki/Le_Misanthrope/%C3%89dition_Louandre,_1910/Acte_II (p. 188-203)
- https://fr.wikisource.org/wiki/Le_Misanthrope/%C3%89dition_Louandre,_1910/Acte_III (p. 203-215)
- https://fr.wikisource.org/wiki/Le_Misanthrope/%C3%89dition_Louandre,_1910/Acte_IV (p. 215-227)
- https://fr.wikisource.org/wiki/Le_Misanthrope/%C3%89dition_Louandre,_1910/Acte_V (p. 227-239)
- Notice de l’éditeur (lue, non reprise) : https://fr.wikisource.org/wiki/Le_Misanthrope/Notice (p. 165-170)

Fac-similé : `Livre:Molière - Édition Louandre, 1910, tome 2.djvu`, pages du fichier 180 à 249 pour la pièce. Statut vérifié par
l’API (`prop=proofread`) le 2026-10-24 : les 70 pages de la pièce (fichier 180-249) sont « Page validée » ; trois pages de la
notice (fichier 177-179) sont « Page corrigée ». Le sommaire porte le bandeau « Textes validés ».

Récupération le 2026-10-24 par l’API MediaWiki (`action=parse`, `prop=text`, une requête à la fois),
User-Agent `READ FRANCE Octave (octave@vread.fr)`.

## Édition transcrite

Œuvres complètes de Molière, texte établi par Charles Louandre, Paris, Charpentier, 1910, tome II, p. 170-239 (en-tête Wikisource :
« Le Misanthrope (1666) »). Orthographe modernisée, avec quelques formes anciennes gardées (monnoie, treuve, paroître, avoit,
je reçoi). C’est l’édition déjà suivie pour Tartuffe, L’Avare et Le Malade imaginaire. Les autres éditions listées sur la page
de l’œuvre (Baudouin 1827, Chasles 1888, édition 1896, Crès 1923) ne sont pas transcrites (avancement 1) ; la page « édition
Chasles, 1888 » n’existe pas.

Faits vérifiés pour la fiche :
- liste des personnages (p. 170) : ses notes, sous le titre « Acteurs de la troupe de Molière », donnent la distribution :
  Molière (Alceste), La Thorillière (Philinte), Du Croisy (Oronte), Armande Béjart, « femme de Molière » (Célimène),
  Mlle de Brie (Éliante), Mlle du Parc (Arsinoé), La Grange (Acaste), De Brie (le garde), Béjart (Dubois) ;
- notice de Louandre : elle cite Taschereau, d’après qui « le registre de la Comédie fait foi que, représenté vingt et une
  fois de suite », le Misanthrope, « seul, sans petite pièce qui l’accompagnât et malgré les chaleurs de l’été », eut des
  recettes productives ; elle rapporte la critique de Rousseau (Lettre à d’Alembert), citée par Génin : Molière aurait composé
  la pièce « pour faire rire aux dépens de la vertu » ;
- date et lieu de la création : « LE MISANTHROPE, Comédie en vers et en cinq actes, représentée sur le théâtre du Palais-Royal
  le 4 juin 1666. » Voltaire, Vie de Molière (1739), Œuvres complètes, Garnier, tome 23, sur Wikisource :
  https://fr.wikisource.org/wiki/Vie_de_Moli%C3%A8re (même page pour la citation « que ce qu’il en faut pour faire sortir
  les caractères »).

## Licence et domaine public

Molière, mort en 1673 ; édition Louandre de 1910 dans le domaine public. Transcription Wikisource sous licence CC BY-SA 4.0
(créditer Wikisource).

## Ce qui n’est pas repris

- La notice de Louandre : seuls les cinq actes forment les unités. De la page du sommaire, seules la liste des personnages et
  l’indication de lieu (« La scène se passe à Paris, dans la maison de Célimène. ») sont reprises, en tête de `01.txt`.
- Toutes les notes de bas de page et leurs appels (notes de Louandre, Aimé Martin, Génin, Voltaire, variantes) et la
  distribution attachée à la liste des personnages.
- Bandeaux, navigation, numéros de page, et les numéros de vers de Wikisource (affichage optionnel « Vers numérotés », non
  imprimés dans l’édition ; la pièce compte 1808 vers dans cette numérotation : l’acte I s’arrête au v. 447, l’acte II commence
  au v. 448 ; le dernier numéro affiché est 1805, trois vers avant la fin). Les références de la fiche donnent donc l’acte et la scène.

## Nettoyage

- HTML converti en texte : titres d’actes et de scènes, listes de personnages en scène, noms des personnages qui parlent et
  didascalies conservés ; un vers par ligne ; une ligne vide entre deux répliques. Les lettres de Célimène (acte V, scène 4),
  en prose, gardent un paragraphe par ligne ; comme dans l’édition, chaque paragraphe repris après une interruption
  commence par un guillemet fermant (»).
- Noms des personnages qui parlent : imprimés en petites capitales, rendus en capitales (« CLITANDRE ET ACASTE ») ; les
  didascalies jointes au nom sont gardées sur la même ligne (« ALCESTE, bas, à Philinte. »).
- Vers partagés entre deux personnages : la transcription répète en texte masqué le début du vers ; ce texte masqué est
  retiré, chaque moitié de vers reste sous son personnage.
- Coupures de page recousues. Espaces insécables (U+00A0) conservées comme dans la transcription. Caractères invisibles
  U+FEFF supprimés (24 : 23 à l’acte I, scène 2, devant les vers du sonnet et de la chanson cités par Alceste et devant
  une didascalie ; 1 devant une didascalie de l’acte II, scène 6).
- Liste des personnages : l’accolade qui réunit Acaste et Clitandre devant « marquis » est rendue par une ligne
  « Acaste, Clitandre, marquis, » ; les noms en gras sont rendus en texte simple, la ponctuation de l’édition est gardée.
- Une ligne vide ajoutée avant chaque mention de fin d’acte (« Fin du premier acte », … « Fin du Misanthrope. »).
- Gardés tels que transcrits : « faire du fracas / À tous les beaux endroits qui méritent des has ! » (acte III, scène 1),
  « Avec du dor dessus. » (acte II, scène 5), « parceque » (acte V, scène 1), les didascalies sans parenthèses « à Éliante. »
  et « à Célimène. » (acte IV, scènes 2 et 3), les vers sans ponctuation finale (« un amant si grondeur », acte II, scène 1).
- Numérotation des scènes de l’édition gardée : « Scène première » à l’acte I, « Scène dernière » pour la huitième scène de
  l’acte V ; l’acte III compte sept scènes, l’acte V huit.

## Mots par unité

Comptage : séparation sur les espaces (`text.split(/\s+/)`, espaces insécables comprises), titres, noms des personnages et
didascalies inclus.

| Fichier | Unité | Début | Fin | Mots |
|---|---|---|---|---|
| 01.txt | Acte I (avec la liste des personnages) | « PERSONNAGES » | « Fin du premier acte » | 4080 |
| 02.txt | Acte II | « ACTE II » | « Fin du second acte » | 3135 |
| 03.txt | Acte III | « ACTE III » | « Fin du troisième acte. » | 3254 |
| 04.txt | Acte IV | « ACTE IV » | « Fin du quatrième acte. » | 3173 |
| 05.txt | Acte V | « ACTE V » | « Fin du Misanthrope. » | 3435 |
| | Total | | | 17077 |
