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

    const terminal = new Terminal('.terminal-grid');
    terminal.play('master');

})();