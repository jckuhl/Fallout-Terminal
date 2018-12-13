/**
 * Random number between MIN (inlusive) and MAX (exclusive)
 *
 * @export
 * @param {number} MAX
 * @param {number} [MIN=0]
 * @returns
 */
export default function random(MAX, MIN=0) {
    return Math.floor(Math.random() * (MAX - MIN) + MIN)
}