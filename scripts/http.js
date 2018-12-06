export const http = {
    URL: 'https://words-project-breakpoint.firebaseio.com/words.json',
    async getWords() {
        return (await fetch(this.URL)).json();
    }
}