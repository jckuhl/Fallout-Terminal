export function compare(word1, word2) {
    if(word1 === word2) {
        return 'match'
    }
    let matches = 0;
    for(let i = 0; i < word1.length; i++) {
        if(word1[i] === word2[i]) {
            matches += 1;
        }
    }
    return matches;
}