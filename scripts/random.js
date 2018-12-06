export default function random(MAX, MIN=0) {
    return Math.floor(Math.random() * (MAX - MIN) + MIN)
}