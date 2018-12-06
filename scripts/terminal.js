import random from './random.js';
import { http } from './http.js';
import Char from './char.js';

export default class Terminal {
    constructor(selector) {
        this.terminal = document.querySelector(selector);
        this.words = [];
        this.password = '';
        this.attempts = 5;

        this.setAttempts(this.attempts);
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
        this.password = this.words[random(this.words.length)];
        console.log(this.password); // TODO: remove
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
        const usedPositions = new Set();
        const usedRows = new Set();
        const chars = [];

        const ROWS = [];
        for(let i = 0; i < 32; i++) {
            ROWS.push(i * 12);
        }

        // fill out the rest
        for(let i = 0; i < (32 * 12); i++) {
            let side = i < (16 * 12) ? side1 : side2;
            const character = SPECIAL[random(SPECIAL.length)];
            const char = new Char(character, i);
            chars.push(char);
            side.appendChild(char.div);
        }

        this.words.forEach((word, index) => {
            let row;
            do {
                row = index < 5 ? ROWS[random(ROWS.length / 2)]
                                : ROWS[random(ROWS.length, (ROWS.length / 2) + 1)];
            } while(usedRows.has(row));
            usedRows.add(row);
            let position = row + random(12);
            word.split('').forEach(character => {
                chars[position].setWord(character, word);
                usedPositions.add(position);

                //if a word spills into another row, add that row to used rows
                const currentRow = Math.floor(position / 12);
                if(!usedRows.has(currentRow)) {
                    usedRows.add(currentRow);
                }

                position += 1;
            });
        });

    }
}