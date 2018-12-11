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
        this.MAX_TOTAL_CHARS = 12 * 32;
        this.MAX_HALF_CHARS = 12 * 16;
    }

    /**
     * Displays the terminal or displays the end game messages, dependin on the value
     * of displayTerminal
     *
     * @param {boolean} displayTerminal if true, displays the terminal
     * @memberof Terminal
     */
    toggleGrid(displayTerminal) {
        const terminal = document.querySelector('.terminal-body');
        const message = document.querySelector('.terminal-message');
        if(displayTerminal) {
            terminal.style.display = 'grid';
            message.style.display = 'none';
        } else {
            terminal.style.display = 'none';
            message.style.display = 'grid';
        }
    }

    /**
     * Starts the game.  Builds the terminal and grabs the words from Firebase
     *
     * @param {*} level
     * @memberof Terminal
     */
    async play(level) {

        // set the difficulty
        const difficulty = {
            novice: { min: 4, max: 5},
            advanced: { min: 6, max: 8 },
            expert: { min: 9, max: 10 },
            master: { min: 11, max: 12 }
        }
        this.wordLength = random(difficulty[level].max + 1, difficulty[level].min);

        // get the words
        let words = await http.getWords();
        words = words.filter(word => word.length === this.wordLength).map(word => word.toUpperCase());

        // use a set to avoid duplicates
        this.words = new Set();
        while(this.words.size !== 10) {
            this.words.add(words[random(words.length)]);
        }

        // turn it into an array to allow for array methods
        this.words = Array.from(this.words);

        // set the properties
        this.password = this.words[random(this.words.length)];
        console.log(this.password); // TODO: remove
        this.cursor = 0;
        this.chars = [];
        this.prompt.input.innerHTML = '>'
        this.password = '';
        this.attempts = 5;

        // build the coolumns;
        document.querySelectorAll('.terminal-col-narrow, .terminal-col-wide')
            .forEach(col => col.innerHTML = '');
        this.setAttempts(this.attempts);
        this.toggleGrid(true);
        this.populateSideColumns();
        this.populateGrid();
    }

    deselectAll() {
        this.chars.forEach(char=> char.deselect());
    }

    /**
     * Moves the cursor from grid to grid
     *
     * @param {Event} event
     * @memberof Terminal
     */
    moveCursor(event) {
        event.preventDefault();

        const arrows = [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight"
        ];

        if(arrows.includes(event.key)) {
            const calcPosition = (position, direction, amt) => {
                const newPosition = position + (amt * direction);
                if(newPosition < 0 || newPosition >= (32 * 12)) {
                    return position;
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
                    const edges = [];
                    for(let i = 16; i < 32; i++) {
                        edges.push(i * 12);
                    }
                    const distance = edges.includes(position) ? (12 * 15) + 1 : 1;
                    return calcPosition(position, -1, distance);
                },
                ArrowRight: (position)=> {
                    const edges = [];
                    for(let i = 0; i < 16; i++) {
                        edges.push((i * 12) + 11);
                    }
                    const distance = edges.includes(position) ? (12 * 15) + 1 : 1;
                    return calcPosition(position, 1, distance);
                },
            }

            // helper function for the .forEach calls later on
            const selectAll = (char)=> char.select();

            this.cursor = move[event.key](this.cursor);
            this.deselectAll();
            const selectedChar = this.chars[this.cursor];
            
            // if there's a wordData object, select the word
            if(selectedChar.wordData) {
                selectedChar.select();
                const word = selectedChar.wordData.word;
                this.chars.filter(char => char.wordData && char.wordData.word === word)
                            .forEach(selectAll);
                this.prompt.setPrompt(word);

            // if there's a bracketData object, select the bracket pair
            } else if(selectedChar.bracketData) {
                const id = selectedChar.bracketData.id;
                const bracket = this.chars.filter(char => char.bracketData && char.bracketData.id === id);
                bracket.forEach(selectAll);
                this.prompt.setPrompt(bracket.map(char=> char.char).join(''));

            // otherwise just select the character
            } else {
                selectedChar.select();
                this.prompt.setPrompt(selectedChar.char);
            }
        } else if(event.key === "Enter") {
            this.submitPrompt(this.chars[this.cursor]);
        }
    }

    /**
     * Ends the game, displays a message and sets up for the next game
     *
     * @param {String} msg message to be displayed
     * @memberof Terminal
     */
    endGame(msg) {
        setTimeout(()=> {
            this.prompt.wipeLog();
            this.toggleGrid(false);
            document.getElementById('display').innerHTML = msg;
        }, 1000)
    }

    submitPrompt(char) {
        if(char.wordData) {
            const matches = compare(char.wordData.word, this.password);

            // if the selected word is the password, win the game
            if(matches === 'match') {
                this.prompt.setPrompt(char.wordData.word, true);
                this.prompt.setPrompt('Entry granted!', true);
                this.endGame('User Authenticated')

            // or, reduce the attempts and lose if attempts is at zero
            } else {
                this.prompt.setPrompt(char.wordData.word, true);
                this.prompt.setPrompt('Entry denied.', true);
                this.prompt.setPrompt(`Likeness=${matches}`, true);
                this.attempts -= 1;
                this.setAttempts(this.attempts);
                if(this.attempts === 0) {
                    this.prompt.setPrompt('Initializing Lockout', true);
                    this.endGame('System locked out')
                }
            }
        } else if(char.bracketData) {
            if(char.bracketData.func === 'reset') {
                this.setAttempts(5);
                this.prompt.setPrompt('Tries reset.', true);
            } else {
                let dud = this.words.filter(word => word !== this.password)[random(this.words.length - 1)];
                let chars = this.chars.filter(char => char.wordData && char.wordData.word === dud);
                chars.forEach(char => {
                    char.wordData = null;
                    char.setChar('.');
                });
                this.words = this.words.filter(word => word !== dud);
                this.prompt.setPrompt('Dud removed.', true);
            }
        } else {
            this.prompt.setPrompt(char.char, true);
            this.prompt.setPrompt('Error', true);
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
        [side1, side2].forEach(side => side.innerHTML = '');

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
        const SPECIAL = `!@#$%^&*_+-=\`\\|;':".,/?`.split('');
        const BRACKETS = `{}[]<>()`.split('');
        const [ side1, side2 ] = document.querySelectorAll('.code');
        [side1, side2].forEach(side => side.innerHTML = '');
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

        // add the bracket pairs
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
            for(let i = start; i < end; i++) {
                this.chars[i].setBracket(this.chars[i].char, { start, end, id, func});
            }
            this.chars[end].setBracket(close, { start, end, id, func });
            func = 'dud';
        }

        // finally, sprinkle in some random unbalanced brackets
        const numBrackets = random(10, 7);
        for(let i = 0; i < numBrackets; i++) {

        }
    }
}