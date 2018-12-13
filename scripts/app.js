import Terminal from './terminal.js';
import { http } from './http.js';

class Game {
    constructor() {
        http.getWords().then(words => {
            this.terminal = new Terminal('.terminal-grid', words);
            this.playBtn = document.getElementById('play');
            this.playBtn.addEventListener('click', this.startGame.bind(this));

            window.addEventListener('keyup', this.terminal.moveCursor.bind(this.terminal));
        });
    }

    startGame(event) {
        event.preventDefault();
        this.playBtn.blur();
        const difficulty = document.querySelector('select').value;
        this.terminal.play(difficulty);
    }
}

(function() {

    const arrows = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight"
    ]

    // remove keyboard navigation
    window.addEventListener('keypress', (event)=> {
        if(arrows.includes(event.key))
            event.preventDefault();
    });

    window.addEventListener('keydown', (event)=> {
        if(arrows.includes(event.key))
            event.preventDefault();
    });

    new Game();
})();