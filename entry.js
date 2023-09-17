const { runSpeechRecog } = require('./jfrontennd.js');

// Run the function when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    const pressButton = document.getElementById("playButton");
    pressButton.addEventListener('click', runSpeechRecog);
});