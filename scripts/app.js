import Terminal from './terminal.js';

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

    function startGame(event) {
        event.preventDefault();
        playBtn.blur();
        const difficulty = document.querySelector('select').value;
        const terminal = new Terminal('.terminal-grid');
        terminal.play(difficulty);
    }


    const playBtn = document.getElementById('play');
    playBtn.addEventListener('click', startGame);

})();