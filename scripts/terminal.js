import random from './random.js';
import { http } from './http.js';
import Char from './char.js';

export default class Terminal {
    constructor(selector) {

        this.terminal = document.querySelector(selector);
        this.words = [];
        this.password = '';

        this.setAttempts(5);
        this.populateSideColumns();
    }

    async play(level) {
        const difficulty = {
            easy: 4,
            advanced: 6,
            expert: 8,
            master: 10
        }

        const wordLength = difficulty[level];
        let words = await http.getWords();
        words = words.filter(word => word.length === wordLength);
        for(let i = 0; i < 10; i++) {
            this.words.push(words[random(words.length)]);
        }
        console.log(this.words);
        this.populateGrid();
    }

    setAttempts(amt) {
        const attempts = document.getElementById('attempts');
        attempts.innerHTML = '▉ '.repeat(amt);
    }

    populateSideColumns() {
        const [ side1, side2 ] = document.querySelectorAll('.hex');

        let MIN = 4096;
        let MAX = 65535 - (32 * 12);

        let start = random(MAX, MIN);

        for(let i = 0; i < 32; i++) {
            let side = i < 16 ? side1 : side2;
            const line = document.createElement('div');
            line.innerHTML = '0x' + (start.toString(16));
            side.appendChild(line);
            start += 12;
        }
    }

    populateGrid() {
        const SPECIAL = `!@#$%^&*()_+-={}[]\`\\|;':",./<>?`.split('');
        const BRACKETS = `{}[]<>()`.split('');
        const [ side1, side2 ] = document.querySelectorAll('.code');

        for(let i = 0; i < (32 * 12); i++) {
            let side = i < (16 * 12)? side1 : side2;
            const character = SPECIAL[random(SPECIAL.length)];
            const char = new Char(character, i);
            side.appendChild(char.div);
        }

    }
}