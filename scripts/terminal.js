import random from './random.js';
import { http } from './http.js';
import { compare } from './wordcompare.js';
import Char from './char.js';
import Prompt from './prompt.js';

'use strict';

export default class Terminal {
    constructor(selector) {
        this.terminal = document.querySelector(selector);
        this.prompt = new Prompt('#answers');
        this.prompt.input.innerHTML = '>'
        this.wordLength = 0;
        this.words = [];
        this.chars = [];
        this.password = '';
        this.attempts = 5;
        this.cursor = 0;
        this.MAX_TOTAL_CHARS = 12 * 32;
        this.MAX_HALF_CHARS = 12 * 16;
    }

    /**
     * Starts the game.  Builds the terminal and grabs the words from Firebase
     *
     * @param {*} level
     * @memberof Terminal
     */
    async play(level) {
        const difficulty = {
            novice: { min: 4, max: 5},
            advanced: { min: 6, max: 8 },
            expert: { min: 9, max: 10 },
            master: { min: 11, max: 12 }
        }

        this.wordLength = random(difficulty[level].max, difficulty[level].min);
        let words = await http.getWords();
        words = words.filter(word => word.length === this.wordLength).map(word => word.toUpperCase());
        for(let i = 0; i < 10; i++) {
            this.words.push(words[random(words.length)]);
        }
        this.password = this.words[random(this.words.length)];
        console.log(this.password); // TODO: remove
        this.setAttempts(this.attempts);
        this.populateSideColumns();
        this.populateGrid();
        const move = this.moveCursor.bind(this);
        window.addEventListener('keyup', move);
    }

    moveCursor(event) {
        event.preventDefault();

        const arrows = [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight"
        ]

        if(arrows.includes(event.key)) {
            const calcPosition = (position, direction, amt) => {
                const newPosition = position + (amt * direction);
                if(newPosition < 0 || newPosition >= (32 * 12)) {
                    return position
                }
                return newPosition;
            }

            const move = {
                ArrowUp: (position)=> {
                    return calcPosition(position, -1, 12);
                },
                ArrowDown: (position)=> {
                    return calcPosition(position, 1, 12);
                },
                ArrowLeft: (position)=> {
                    return calcPosition(position, -1, 1);
                },
                ArrowRight: (position)=> {
                    return calcPosition(position, 1, 1);
                },
            }
            this.cursor = move[event.key](this.cursor);
            if(!this.chars[this.cursor].wordData) {
                this.chars.forEach(char => char.deselect());
                this.chars[this.cursor].select();
                this.prompt.setPrompt(this.chars[this.cursor].char);
            } else if(this.chars[this.cursor].bracketData) {
                console.log('brackets! ' + this.chars[this.cursor]);
            } else {
                this.chars.forEach(char => char.deselect());
                this.chars[this.cursor].select();
                const word = this.chars[this.cursor].wordData.word;
                this.chars.filter(char => char.wordData && char.wordData.word === word)
                            .forEach(char => char.select());
                this.prompt.setPrompt(word);
            }
            console.log(this.chars[this.cursor])
        } else if(event.key === "Enter") {
            this.submitPrompt(this.chars[this.cursor]);
        }
    }

    submitPrompt(char) {
        if(char.wordData) {
            const matches = compare(char.wordData.word, this.password);
            if(matches === 'match') {
                console.log('yay');
            } else {
                this.prompt.setPrompt(`Failure ${char.wordData}`)
                this.prompt.setPrompt(`Matches: ${matches}`)
                this.attempts -= 1;
                this.setAttempts(this.attempts);
                if(this.attempts === 0) {
                    console.log('You lose');
                }
            }
        } else {
            console.log('error: ' + char.char);
        }
    }

    /**
     * Sets the number of attempts remaining, starting at 5.
     *
     * @param {number} amt
     * @memberof Terminal
     */
    setAttempts(amt) {
        if(amt < 0) {
            amt = 0;
        }
        const attempts = document.getElementById('attempts');
        attempts.innerHTML = '▉ '.repeat(amt);
    }

    /**
     * Populates the side columns with hex values that start at a random number
     * and increment by 12.  
     * I guess they're just to make them look like memory addresses
     *
     * @memberof Terminal
     */
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

    /**
     * Populates the grid with special characters
     * Once it does that, it adds words
     * Once it does that, it adds matched brackets
     * Once it does that, it adds unmatched brackets
     * @memberof Terminal
     */
    populateGrid() {
        const SPECIAL = `!@#$%^&*_+-=\`\\|;':",/?`.split('');
        const BRACKETS = `{}[]<>()`.split('');
        const [ side1, side2 ] = document.querySelectorAll('.code');
        const usedPositions = new Set();
        const usedRows = new Set();

        const ROWS = [];
        for(let i = 0; i < 32; i++) {
            ROWS.push(i * 12);
        }

        // fill out the grid with special characters
        for(let i = 0; i < this.MAX_TOTAL_CHARS; i++) {
            let side = i < this.MAX_HALF_CHARS ? side1 : side2;
            const character = SPECIAL[random(SPECIAL.length)];
            const char = new Char(character, i);
            this.chars.push(char);
            side.appendChild(char.div);
        }

        // add the words at random
        this.words.forEach((word, index) => {
            
            // find an unused row
            let row;
            do {
                row = index < 5 ? ROWS[random(ROWS.length / 2)]
                                : ROWS[random(ROWS.length, (ROWS.length / 2) + 1)];
            } while(usedRows.has(row));
            usedRows.add(row);

            // calculate the starting position
            let position;
            do {
                position = row + random(12);
            } while(position + this.wordLength > this.MAX_TOTAL_CHARS && usedPositions.has(position));

            // add the word to that position character by character
            word.split('').forEach(character => {
                this.chars[position].setWord(character, { word, position });
                usedPositions.add(position);

                //if a word spills into another row, add that row to used rows
                const currentRow = Math.floor(position / 12) * 12;
                if(!usedRows.has(currentRow)) {
                    usedRows.add(currentRow);
                }

                position += 1;
            });
        });

        // finally, add the brackets
        let func = 'reset';
        for(let i = 0; i < 5; i++) {
            let row;
            do {
                row = i < 3 ? ROWS[random(ROWS.length / 2)]
                                : ROWS[random(ROWS.length, (ROWS.length / 2) + 1)];
            } while(usedRows.has(row));
            usedRows.add(row);
            const start = row + random(11);
            const end = start + random(12 - (start % 12));
            const index = random(4) * 2;
            const [ open, close ] = [ BRACKETS[index], BRACKETS[index + 1] ];
            let id = i;
            this.chars[start].setBracket(open, { start, end, id, func });
            this.chars[end].setBracket(close, { start, end, id, func });
            func = 'dud';
        }
    }
}