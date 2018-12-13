// http object that contains the url to firebase and a method to get words from firebase
export const http = {
    URL: 'https://words-project-breakpoint.firebaseio.com/words.json',
    async getWords() {
        return (await fetch(this.URL)).json();
    }
}