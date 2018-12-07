export default class Char {
    /**
     *Creates an instance of Char.
     * @param {*} char the character it displays
     * @param {*} position position on the grid
     * @param {boolean} [isLetter=false] Determines if letter in word
     * @param {boolean} [isBracket=false] Determines if this is a bracket for removing dudes/reseting attempts
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

    setWord(char, { word, position }) {
        this.char = char;
        this.div.innerHTML = char;
        this.wordData = { word, position };
    }

    setBracket({ start, end, id }) {
        this.bracketData = { start, end, id};
    }

    setChar(char) {
        this.char = char;
        this.div.innerHTML = char;
    }
}