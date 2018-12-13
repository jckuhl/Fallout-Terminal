/**
 * Returns a new array of the input array's values shuffled.
 * Does not mutate original array
 *
 * @export
 * @param {array} array
 * @returns {array} shuffled array
 */
export default function arrayShuffle(array) {
    const result = [];
    const used = new Set();

    for(let i = 0; i < array.length; i++) {
        let index = 0;
        while(!used.has(index)) {
            index = Math.floor(Math.random() * array.length - 1);
            if(!used.has(index)) {
                used.add(index);
                result[i] = array[index];
            }
        }
    }
    return result;
}