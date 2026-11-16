// Strings the builders write into the course themselves (the games' own interface strings come from data/i18n/<lang>.json).
const S = {
  fr: {
    bns: "Votre navigateur n'est pas compatible avec cet outil.", saveScore: 'Enregistrer le score', duration: 'Durée', grouping: 'Regroupement',
    showFeedback: 'Afficher la rétroaction', showAnswer: 'Voir la réponse', hide: 'Masquer', check: 'Vérifier', right: 'Correct !', wrong: 'Désolé… La bonne réponse est :',
    easyReading: 'Lecture facile', visualAid: 'Aide visuelle', audioAid: 'Version audio', levels: ['Facile', 'Moyen', 'Difficile'],
    rubric: ['Activité', 'Nom', 'Date', 'Note', 'Remarques', 'Réinitialiser', 'Imprimer'], httpError: "Impossible d'afficher une page HTTP dans un site HTTPS.",
    newWindow: 'Nouvelle fenêtre', ggb: 'Activité incomplète,Activité : réussie. Score : %s,Activité : non réussie. Score : %s', whereIs: 'Où se trouve : %s ?',
    creditsCols: ['Fichier', 'Auteur', 'Licence'], unknownAuthor: 'Auteur inconnu',
    srcCaption: 'Informations générales sur cette ressource', srcRows: ['Titre', 'Description', 'Auteur', 'Licence'],
    srcText: 'Ce contenu a été créé avec <a href="https://exelearning.net/">eXeLearning</a>, un éditeur libre de ressources éducatives. Vous pouvez télécharger le fichier source pour le modifier.', srcButton: 'Télécharger le fichier .elpx',
  },
  en: {
    bns: 'Your browser is not compatible with this tool.', saveScore: 'Save score', duration: 'Duration', grouping: 'Grouping',
    showFeedback: 'Show feedback', showAnswer: 'Show answer', hide: 'Hide', check: 'Check', right: 'Right!', wrong: 'Sorry… The right answer is:',
    easyReading: 'Easy reading', visualAid: 'Visual aid', audioAid: 'Audio version', levels: ['Easy', 'Medium', 'Hard'],
    rubric: ['Activity', 'Name', 'Date', 'Score', 'Notes', 'Reset', 'Print'], httpError: 'An HTTP page cannot be displayed inside an HTTPS site.',
    newWindow: 'New window', ggb: 'Activity not completed,Activity passed. Score: %s,Activity not passed. Score: %s', whereIs: 'Where is: %s?',
    creditsCols: ['File', 'Author', 'Licence'], unknownAuthor: 'Unknown author',
    srcCaption: 'General information about this resource', srcRows: ['Title', 'Description', 'Author', 'Licence'],
    srcText: 'This content was created with <a href="https://exelearning.net/">eXeLearning</a>, a free and open-source editor for educational resources. You can download the source file to edit it.', srcButton: 'Download the .elpx file',
  },
  de: {
    bns: 'Ihr Browser ist mit diesem Werkzeug nicht kompatibel.', saveScore: 'Punktzahl speichern', duration: 'Dauer', grouping: 'Sozialform',
    showFeedback: 'Rückmeldung anzeigen', showAnswer: 'Antwort anzeigen', hide: 'Ausblenden', check: 'Überprüfen', right: 'Richtig!', wrong: 'Leider falsch. Die richtige Antwort lautet:',
    easyReading: 'Leichte Sprache', visualAid: 'Visuelle Hilfe', audioAid: 'Audioversion', levels: ['Leicht', 'Mittel', 'Schwer'],
    rubric: ['Aktivität', 'Name', 'Datum', 'Punktzahl', 'Bemerkungen', 'Zurücksetzen', 'Drucken'], httpError: 'Eine HTTP-Seite kann nicht in einer HTTPS-Website angezeigt werden.',
    newWindow: 'Neues Fenster', ggb: 'Aktivität nicht abgeschlossen,Aktivität bestanden. Punktzahl: %s,Aktivität nicht bestanden. Punktzahl: %s', whereIs: 'Wo liegt: %s?',
    creditsCols: ['Datei', 'Urheber', 'Lizenz'], unknownAuthor: 'Urheber unbekannt',
    srcCaption: 'Allgemeine Informationen zu dieser Ressource', srcRows: ['Titel', 'Beschreibung', 'Autor', 'Lizenz'],
    srcText: 'Dieser Inhalt wurde mit <a href="https://exelearning.net/">eXeLearning</a> erstellt, einem freien Editor für Bildungsressourcen. Sie können die Quelldatei herunterladen, um sie zu bearbeiten.', srcButton: '.elpx-Datei herunterladen',
  },
  es: {
    bns: 'Su navegador no es compatible con esta herramienta.', saveScore: 'Guardar la puntuación', duration: 'Duración', grouping: 'Agrupamiento',
    showFeedback: 'Mostrar retroalimentación', showAnswer: 'Ver la respuesta', hide: 'Ocultar', check: 'Comprobar', right: '¡Correcto!', wrong: 'Lo siento… La respuesta correcta es:',
    easyReading: 'Lectura fácil', visualAid: 'Apoyo visual', audioAid: 'Versión de audio', levels: ['Fácil', 'Medio', 'Difícil'],
    rubric: ['Actividad', 'Nombre', 'Fecha', 'Puntuación', 'Observaciones', 'Reiniciar', 'Imprimir'], httpError: 'No se puede mostrar una página HTTP en un sitio HTTPS.',
    newWindow: 'Nueva ventana', ggb: 'Actividad no completada,Actividad superada. Puntuación: %s,Actividad no superada. Puntuación: %s', whereIs: '¿Dónde está: %s?',
    creditsCols: ['Archivo', 'Autor', 'Licencia'], unknownAuthor: 'Autor desconocido',
    srcCaption: 'Información general sobre este recurso', srcRows: ['Título', 'Descripción', 'Autor', 'Licencia'],
    srcText: 'Este contenido fue creado con <a href="https://exelearning.net/">eXeLearning</a>, un editor libre de recursos educativos. Puede descargar el archivo fuente para modificarlo.', srcButton: 'Descargar el archivo .elpx',
  },
};
module.exports = lang => S[lang] || S.en;
