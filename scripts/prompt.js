/**
 * Models the prompter and the log display
 *
 * @export
 * @class Prompt
 */
export default class Prompt {
    constructor(selector) {
        this.div = document.querySelector(selector);
        this.history = [];
    }

    /**
     * Initializes the display of the log and provides fifteen 'spacer' divs and one #input div
     *
     * @memberof Prompt
     */
    createLog() {
        // start out with fifteen spaces so the display appears to work upward
        // 16th is always the prompt itself (defined in CSS file, #input)
        this.input = document.createElement('div');
        this.input.id = 'input';
        this.input.innerHTML = '>'
        this.div.appendChild(this.input);
        for(let i = 0; i < 15; i++) {
            const space = document.createElement('div');
            space.innerHTML = ' ';
            this.div.appendChild(space);
            this.history.push(space);
        }
    }

    /**
     * Wipes the log and history so a new game can be started
     *
     * @memberof Prompt
     */
    wipeLog() {
        this.input = null;
        this.history = [];
        this.div.innerHTML = '';
    }

    /**
     * Displays text in the prompt.  If the advance flag is true, advances the prompt in the log
     * and resets the prompt
     *
     * @param {string} input input string to be displayed at the prompt
     * @param {boolean} [advance=false]
     * @memberof Prompt
     */
    setPrompt(input, advance=false) {
        this.input.innerHTML = `> ${input}`;

        if(advance) {
            this.advancePrompt(this.input.innerHTML);
            this.input.innerHTML = `>`;
        }
    }
    
    /**
     * Advances the prompt with new input, upto 15 lines (#16 is the prompter)
     *
     * @param {string} input input string to be advanced
     * @memberof Prompt
     */
    advancePrompt(input) {
        const newInput = document.createElement('div');
        newInput.innerHTML = input;
        this.div.appendChild(newInput);
        this.history.push(newInput);
        if(this.history.length > 15) {
            let oldInput = this.history.shift();
            this.div.removeChild(oldInput);
        }
    }
}