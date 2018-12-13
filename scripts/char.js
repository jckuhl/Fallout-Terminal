export default class Char {
    /**
     *Creates an instance of Char.
     * @param {string} char the character it displays
     * @param {number} position position on the grid
     * @memberof Char
     */
    constructor(char, position) {
        this.selected = position === 0;
        this.position = position;
        this.char = char;
        this.div = document.createElement('div');
        this.div.innerHTML = char;
        if(this.selected) {
            this.div.classList.add('selected');
        }
    }

    select() {
        this.selected = true;
        this.div.classList.add('selected');
    }

    deselect() {
        this.selected = false;
        this.div.classList.remove('selected');
    }

    /**
     * Sets a character to be a letter of a word
     *
     * @param {*} char the letter this character is being set to
     * @param {*} { word, position }
     * word determines which word the letter belongs to
     * position gives its position
     * @memberof Char
     */
    setWord(char, { word, position }) {
        this.setChar(char);
        this.wordData = { word, position };
    }

    /**
     * Sets a character to be an open or closing bracket, or sets the characters between them.
     *
     * @param {*} char the bracket character its being set to
     * @param {*} { start, end, id, func }
     * start and end are open/close positions of brackets
     * id uniquely identifies all characters contained by brackets
     * func determines its function, whether it resets tries or removes a dud
     * @memberof Char
     */
    setBracket(char, { start, end, id, func }) {
        this.setChar(char);
        this.bracketData = { start, end, id, func };
    }

    setChar(char) {
        this.char = char;
        this.div.innerHTML = char;
    }
}