// Example course: one call of every module. Build with:
//   node <skill>/scripts/build.js <this file> --out demo.elpx
// Copy the calls you need; the full parameter reference is in references/modules.md.
module.exports = {
  meta: {
    title: 'La Grèce antique (démonstration)',
    subtitle: 'Un exemple de chaque module',
    author: 'Exemple',
    description: 'Cours de démonstration : un exemplaire de chaque module eXeLearning pris en charge.',
    lang: 'fr',            // language of the course and of the games' interface
    theme: 'base',
    license: 'creative commons: attribution - share alike 4.0',
  },

  content({ page, text, m, img, fig, P }) {
    // ------------------------------------------------------------ page 1: content modules
    page('Accueil', null, [
      { name: 'Bienvenue', icon: 'start', comps: [
        text(`${fig('parthenon.jpg', "Le Parthénon sur l'Acropole d'Athènes", "Le Parthénon, temple d'Athéna (447-432 av. J.-C.).", 600)}
<p>Entre le II<sup>e</sup> millénaire et le IV<sup>e</sup> siècle av. J.-C., les Grecs inventent la <strong>cité</strong>, la <strong>démocratie</strong>, le <strong>théâtre</strong> et la <strong>philosophie</strong>.</p>`,
          { feedback: '<p>La cité (<em>polis</em>) est une communauté de citoyens, pas seulement une ville.</p>', feedbackButton: 'Le saviez-vous ?', duration: '5 min', grouping: 'Individuel' }),
      ] },
      { name: 'Objectifs', icon: 'objectives', comps: [
        m.udl({ heading: 'Objectifs',
          main: '<ul><li><strong>Situer</strong> le monde grec dans le temps et dans l\'espace.</li><li><strong>Expliquer</strong> le fonctionnement de la démocratie athénienne.</li></ul>',
          simplified: '<ul><li>Savoir où et quand ont vécu les Grecs.</li><li>Savoir comment Athènes était gouvernée.</li></ul>',
          visual: `<p>${img('parthenon.jpg', 'Le Parthénon', 400)}</p>` }),
      ] },
      { name: 'Plan', icon: 'roadmap', comps: [
        m.markdown(`## Plan du parcours

| Chapitre | Contenu | Durée |
|---|---|---|
| 1. La cité | Athènes et Sparte | 30 min |
| 2. Les arts | Temples et sculpture | 30 min |

**Conseil :** lisez le texte *avant* de faire les activités.

> « Nous sommes tous des Grecs. » — Shelley`),
      ] },
      { name: 'Diapositive', icon: 'present', comps: [m.slide({ title: 'La Grèce antique', subtitle: 'Des palais mycéniens à Alexandre le Grand' })] },
      { name: 'Étude de cas', icon: 'case', comps: [
        m.casestudy({
          history: "<p>En 1870, Heinrich Schliemann fouille la colline d'Hissarlik, convaincu que l'<em>Iliade</em> décrit une ville réelle.</p>",
          duration: '15 min', grouping: 'Par deux',
          activities: [
            { activity: '<p>Sur quel type de source Schliemann s\'appuie-t-il ?</p>', feedback: '<p>Sur un poème épique, composé des siècles après les faits : il doit être confronté aux vestiges.</p>' },
            { activity: '<p>Quelle erreur de méthode commet-il ?</p>', feedback: '<p>Sa grande tranchée détruit les niveaux supérieurs du site.</p>' },
          ],
        }),
      ] },
      { name: 'Pour l\'enseignant', icon: 'competencies', comps: [m.digcompedu({ '2.1': 'B1', '3.1': 'B2', '4.1': 'B1' })] },
    ]);

    // ------------------------------------------------------------ page 2: images, viewers, media
    page('Images et médias', null, [
      { name: 'Galerie', icon: 'gallery', comps: [m.gallery([
        ['parthenon.jpg', 'Le Parthénon (447-432 av. J.-C.)'],
        ['discobole.jpg', 'Le Discobole, copie romaine d\'un bronze de Myron'],
        ['vase-exekias.jpg', 'Achille et Ajax jouant aux dés, amphore d\'Exékias'],
      ])] },
      { name: 'Loupe', icon: 'observe', comps: [m.magnifier(P('Promenez la loupe sur le vase pour observer les détails.'), { img: 'vase-exekias.jpg', alt: 'Amphore d\'Exékias', width: 480, zoom: 200 })] },
      { name: 'Avant / après', icon: 'observe', comps: [m.beforeAfter(P('Faites glisser le curseur pour comparer le temple antique et ses ruines.'), [
        { before: 'temple-antique.svg', after: 'temple-ruine.svg', description: 'Un temple dorique : à l\'origine, puis aujourd\'hui.', altBefore: 'Temple peint et complet', altAfter: 'Temple en ruine' },
      ])] },
      { name: 'Carte à points', icon: 'explore', comps: [m.map(P('Cliquez sur les repères pour découvrir les parties du temple.'), {
        img: 'parthenon.jpg', alt: 'Le Parthénon',
        points: [
          { title: 'Le fronton', x: 0.5, y: 0.25, html: '<p><strong>Le fronton</strong> : le triangle qui couronne la façade, autrefois orné de sculptures.</p>' },
          { title: 'La colonnade', x: 0.4, y: 0.55, html: '<p><strong>La colonnade</strong> : des colonnes doriques, sans base.</p>' },
          { title: 'Le Discobole', x: 0.8, y: 0.8, img: 'discobole.jpg', footer: 'Une sculpture de la même époque.' },
        ],
      })] },
      { name: 'Modèle 3D', icon: 'explore', comps: [m.viewer3d('temple-dorique.stl', { alt: 'Modèle 3D schématique d\'un temple dorique' })] },
      { name: 'Visite', icon: 'explore', comps: [m.panorama([
        { title: 'Le Parthénon', img: 'parthenon.jpg', alt: 'Le Parthénon', description: 'Façade ouest du temple.', projection: 'flat',
          hotspots: [{ label: 'Fronton', x: 50, y: 25, html: '<p>Le fronton ouest représentait la dispute d\'Athéna et de Poséidon.</p>' }] },
      ])] },
      { name: 'Site externe', icon: 'interactive', comps: [m.externalWebsite('https://www.openstreetmap.org/export/embed.html?bbox=19.0%2C34.5%2C29.5%2C41.5&layer=mapnik', { height: 450, title: 'Carte actuelle de la Grèce' })] },
      { name: 'Vidéo interactive', icon: 'video', comps: [m.interactiveVideo({
        url: 'https://www.youtube.com/watch?v=Kor-mnfwAz8',
        intro: '<p>La vidéo s\'interrompt pour vous poser une question.</p>',
        slides: [
          { at: 40, text: '<p><strong>À retenir :</strong> seuls les citoyens participent à la vie politique.</p>' },
          { at: 90, question: '<p>Comment s\'appelle l\'assemblée des citoyens ?</p>', answers: [['La Boulè', false], ["L'Ecclésia", true], ["L'Héliée", false]] },
        ],
      })] },
      { name: 'Vidéo et questions', icon: 'video', comps: [m.videoQuiz(P('La vidéo se met en pause pour vous poser des questions.'), {
        url: 'https://www.youtube.com/watch?v=HbU3wNfI9mE', end: 214, author: 'Yannick Rub',
        questions: [
          [45, 'Quel empire menace les cités grecques ?', ["L'Empire romain", "L'Empire perse", "L'Empire égyptien"], 1],
          [160, 'Où les Athéniens gagnent-ils en 490 av. J.-C. ?', ['À Salamine', 'À Marathon', 'À Platées'], 1],
        ],
      })] },
      { name: 'GeoGebra', icon: 'math', comps: [m.geogebra('vJhKETCm', { author: 'Pascal Lapalme', title: 'Puzzle Théorème de Pythagore' })] },
      { name: 'Fichier à télécharger', icon: 'download', comps: [m.attachment(P('Téléchargez la fiche de révision.'), [
        { file: 'fiche-revision.txt', title: 'Fiche de révision', description: 'Dates, vocabulaire et personnages (fichier texte).' },
      ])] },
    ]);

    // ------------------------------------------------------------ page 3: quizzes
    page('Quiz', null, [
      { name: 'Vrai ou faux', icon: 'ask', comps: [m.trueorfalse(P('Vrai ou faux ?'), [
        ['Sparte est située en Attique.', false, 'Sparte est en Laconie ; Athènes est en Attique.'],
        ['Les femmes votent à l\'Ecclésia.', false, 'Seuls les citoyens, des hommes, y siègent.', 'Qui est citoyen à Athènes ?'],
        ['Le Parthénon est dédié à Athéna.', true],
      ])] },
      { name: 'Questionnaire mixte', icon: 'ask', comps: [m.form(P('Répondez aux questions puis vérifiez.'), [
        { tf: ['Alexandre le Grand était macédonien.', true] },
        { single: ['Qui a écrit l\'<em>Iliade</em> ?', ['Hérodote', 'Homère', 'Platon'], 1] },
        { multi: ['Quelles cités sont dans le Péloponnèse ?', [[true, 'Sparte'], [true, 'Corinthe'], [false, 'Athènes']]] },
        { fill: 'La bataille de <u>Marathon</u> a lieu en <u>490</u> av. J.-C.' },
        { dropdown: ['Les citoyens votent à l\'<u>Ecclésia</u> et les lois sont préparées par la <u>Boulè</u>.', 'Héliée|Gérousie'] },
      ])] },
      { name: 'QCM', icon: 'ask', comps: [m.quickQuestions(P('Une seule réponse est correcte.'), [
        ['Combien de membres compte la Boulè ?', ['50', '100', '500', '6 000'], 2],
        ['Quel monument voyez-vous ?', ['Le Parthénon', 'Le Colisée', 'Le Panthéon', 'L\'Érechthéion'], 0, 'parthenon.jpg'],
      ])] },
      { name: 'QCM à réponses multiples', icon: 'ask', comps: [m.multipleChoice(P('Plusieurs réponses peuvent être correctes.'), [
        ['Qui est exclu de la citoyenneté à Athènes ?', ['Les femmes', 'Les métèques', 'Les esclaves', 'Les paysans'], 'ABC'],
        ['Quels sont des ordres architecturaux grecs ?', ['Dorique', 'Ionique', 'Gothique', 'Corinthien'], 'ABD'],
      ])] },
      { name: 'Quiz adaptatif', icon: 'ask', comps: [m.adaptiveQuiz(P('La difficulté s\'adapte à vos réponses.'), [
        [1, 'Comment appelle-t-on une cité grecque ?', ['Polis', 'Agora', 'Acropole', 'Boulè'], 0],
        [1, 'Quelle déesse protège Athènes ?', ['Héra', 'Artémis', 'Athéna', 'Aphrodite'], 2],
        [2, 'En quelle année a lieu Marathon ?', ['508 av. J.-C.', '490 av. J.-C.', '480 av. J.-C.', '431 av. J.-C.'], 1],
        [2, 'Quelle institution prépare les lois ?', ["L'Ecclésia", "L'Héliée", 'La Boulè', "L'Aréopage"], 2],
        [3, 'Qui crée les dix tribus ?', ['Solon', 'Pisistrate', 'Clisthène', 'Éphialte'], 2],
        [3, 'Qui raconte la guerre du Péloponnèse ?', ['Hérodote', 'Xénophon', 'Thucydide', 'Plutarque'], 2],
      ], { rounds: 6 })] },
      { name: 'Trivial', icon: 'play', comps: [m.trivial(P('Jeu de plateau à plusieurs joueurs.'), [
        { name: 'Politique', questions: [['Qui dirige Athènes au V<sup>e</sup> siècle ?', ['Périclès', 'Léonidas', 'Philippe', 'Darius'], 0], ['Où siège l\'Ecclésia ?', ['Sur la Pnyx', 'Sur l\'Acropole', 'Au Pirée', 'À Delphes'], 0]] },
        { name: 'Arts', questions: [['Qui a sculpté le Discobole ?', ['Phidias', 'Myron', 'Praxitèle', 'Polyclète'], 1], ['Quel ordre a des volutes ?', ['Dorique', 'Ionique', 'Toscan', 'Composite'], 1]] },
      ])] },
    ]);

    // ------------------------------------------------------------ page 4: word and image games
    page('Jeux', null, [
      { name: 'Mots croisés', icon: 'play', comps: [m.crossword(P('Complétez la grille.'), [
        ['AGORA', 'Place publique de la cité.'], ['HOPLITE', 'Fantassin lourdement armé.'], ['POLIS', 'Mot grec pour « cité ».'], ['TRIERE', 'Navire de guerre à trois rangs de rames.'],
      ])] },
      { name: 'Mots mêlés', icon: 'play', comps: [m.wordSearch(P('Retrouvez les mots dans la grille.'), [
        ['ATHENES', 'Cité de l\'Attique.'], ['SPARTE', 'Cité de Laconie.'], ['DELPHES', 'Sanctuaire d\'Apollon.'],
      ])] },
      { name: 'Devinettes', icon: 'play', comps: [m.guess(P('Trouvez le mot à partir de sa définition.'), [
        ['Olympie', 'Sanctuaire de Zeus où se déroulent les Jeux.'], ['Parthénon', 'Temple d\'Athéna sur l\'Acropole.', 'parthenon.jpg'],
      ])] },
      { name: 'L\'alphabet', icon: 'play', comps: [m.azQuiz(P('Trouvez un mot pour chaque lettre.'), {
        A: ['Agora', 'Place publique de la cité.'], H: ['Homère', 'Poète de l\'Iliade.'], S: ['Sparte', 'Cité rivale d\'Athènes.'], T: ['Stratège', 'Contient la lettre T : chef militaire élu.', true],
      })] },
      { name: 'Compléter', icon: 'activity', comps: [m.complete(P('Choisissez le mot qui convient.'),
        '<p>Les citoyens votent à l\'@@Ecclésia@@ ; les lois sont préparées par la @@Boulè@@.</p>', 'Gérousie, Héliée')] },
      { name: 'Classer', icon: 'activity', comps: [m.classify(P('Placez chaque élément dans la bonne cité.'), ['Athènes', 'Sparte'], [
        ['Démocratie', 0], ['Le Pirée', 0], ['Deux rois', 1], ['Les hilotes', 1],
      ])] },
      { name: 'Ordonner (cartes)', icon: 'activity', comps: [m.sort(P('Remettez les événements dans l\'ordre chronologique.'), [
        { definition: 'Du plus ancien au plus récent', cards: ['Guerre de Troie (légende)', 'Marathon', 'Périclès', 'Alexandre'] },
      ])] },
      { name: 'Ordonner (liste)', icon: 'activity', comps: [m.scrambledList(P('Classez les périodes de la plus ancienne à la plus récente.'), ['Mycénienne', 'Archaïque', 'Classique', 'Hellénistique'])] },
      { name: 'Paires', icon: 'play', comps: [m.discover(P('Retournez les cartes pour associer chaque dieu à son domaine.'), [
        ['Zeus', 'Le ciel et la foudre'], ['Poséidon', 'La mer'], ['Athéna', 'La sagesse'],
      ])] },
      { name: 'Relier', icon: 'activity', comps: [m.relate(P('Reliez chaque auteur à son œuvre.'), [
        ['Homère', 'L\'Odyssée'], ['Hérodote', 'Les Histoires'], ['Sophocle', 'Antigone'],
      ])] },
      { name: 'Cartes mémoire', icon: 'activity', comps: [m.flipcards(P('Retournez chaque carte pour vérifier la définition.'), [
        ['Polis', 'La cité : une ville, son territoire et ses citoyens.'], ['Métèque', 'Étranger libre résidant à Athènes.'], ['Parthénon', 'Temple d\'Athéna.', 'parthenon.jpg'],
      ])] },
      { name: 'Glisser-déposer', icon: 'activity', comps: [m.dragdrop(P('Faites glisser chaque nom sur la bonne image.'), [
        ['Le Parthénon', 'parthenon.jpg'], ['Le Discobole', 'discobole.jpg'], ['Amphore d\'Exékias', 'vase-exekias.jpg'],
      ])] },
      { name: 'Sélectionner', icon: 'activity', comps: [m.selectMedia(P('Sélectionnez les bonnes cartes.'), [
        { definition: 'Quels dieux siègent sur l\'Olympe ?', cards: [['Zeus', true], ['Athéna', true], ['Achille', false], ['Le Parthénon', false, 'parthenon.jpg']] },
      ])] },
      { name: 'Identifier', icon: 'play', comps: [m.identify(P('Identifiez l\'œuvre avec le moins d\'indices possible.'), [
        { img: 'discobole.jpg', question: 'Quelle est cette statue ?', solution: 'Discobole', clues: ['C\'est un athlète.', 'Il lance un disque.', 'L\'original est de Myron.'] },
      ])] },
      { name: 'Puzzle', icon: 'pieces', comps: [m.puzzle(P('Reconstituez l\'image.'), [
        { img: 'parthenon.jpg', definition: 'Le Parthénon', clue: 'Un temple d\'Athènes', rows: 3, cols: 3 },
      ])] },
      { name: 'Image cachée', icon: 'observe', comps: [m.hiddenImage(P('L\'image se dévoile peu à peu : répondez le plus vite possible.'), [
        { img: 'vase-exekias.jpg', question: 'Quel type d\'objet est-ce ?', options: ['Un vase', 'Une mosaïque', 'Une monnaie', 'Un bouclier'], solution: 0 },
      ])] },
    ]);

    // ------------------------------------------------------------ page 5: maths, escape games, self-assessment
    const bilan = page('Défis et bilan', null, [
      { name: 'Problèmes', icon: 'calculate', comps: [m.mathProblems(P('Les nombres changent à chaque essai.'), [
        { wording: '<p>Une trière compte 170 rameurs. Combien de rameurs pour {n} trières ?</p>', formula: '170*{n}', min: 2, max: 12 },
      ])] },
      { name: 'Calcul mental', icon: 'math', comps: [m.mathOperations(P('Effectuez les opérations.'), { number: '5', operations: '1100', max: '50' })] },
      { name: 'Tableau périodique', icon: 'experiment', comps: [m.periodicTable(P('Retrouvez les éléments demandés ; beaucoup ont un nom d\'origine grecque.'))] },
      { name: 'Défi', icon: 'think', comps: [m.challenge(P('Résolvez les épreuves dans l\'ordre.'), {
        title: 'Sur les traces d\'Alexandre', time: 15, solution: 'Alexandrie',
        description: '<p><strong>Énigme finale :</strong> quelle ville d\'Égypte porte le nom du roi ?</p>',
        challenges: [
          { title: 'Le royaume', solution: 'Macédoine', description: '<p>De quel royaume Alexandre est-il le roi ?</p>' },
          { title: 'Le maître', solution: 'Aristote', description: '<p>Quel philosophe fut son précepteur ?</p>' },
        ],
      })] },
      { name: 'Cadenas', icon: 'think', comps: [m.padlock('<p>Le code est l\'année (av. J.-C.) de la mort d\'Alexandre.</p>', {
        solution: '323', minutes: 5, attempts: 5, errorMessage: 'Ce n\'est pas le bon code.', reward: '<p><strong>Bravo !</strong> Alexandre meurt à Babylone en 323 av. J.-C.</p>',
      })] },
      { name: 'Liste de contrôle', icon: 'reflection', comps: [m.checklist(P('Cochez ce que vous savez faire.'), {
        title: 'La Grèce antique', subtitle: 'Auto-évaluation',
        levels: [[3, 0, '<strong>Se repérer</strong>'], [0, 1, 'Je situe Athènes et Sparte sur une carte.', 1], [3, 0, '<strong>Connaître</strong>'], [0, 1, 'Je définis les mots cité et citoyen.', 1]],
      })] },
      { name: 'Grille d\'évaluation', icon: 'guide', comps: [m.rubric({
        caption: 'Grille d\'évaluation de l\'exposé', levels: ['3 Très bien', '2 Correct', '1 À revoir'],
        rows: [['Connaissances', 'Exactes et précises.', 'Quelques imprécisions.', 'Erreurs importantes.'], ['Expression', 'Claire, sans lire ses notes.', 'Correcte.', 'Difficile à suivre.']],
      })] },
      { name: 'Rapport de progression', icon: 'roadmap', comps: [m.progressReport()] },
    ]);

    // ------------------------------------------------------------ page 6 (sub-page of the last one): credits + source download
    page('Sources et crédits', bilan, [
      { name: 'Crédits des images', icon: 'info', comps: [m.credits('<p>Images issues de Wikimedia Commons, sous licence libre.</p>')] },
      { name: 'Fichier source', icon: 'download', comps: [m.downloadSource()] },
    ]);
  },
};
