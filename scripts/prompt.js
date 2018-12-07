export default class Prompt {
    constructor(selector) {
        this.div = document.querySelector(selector);
        this.input = document.querySelector('#input');
    }

    setPrompt(input) {
        this.input.innerHTML = `>; ${input}`;
    }
}