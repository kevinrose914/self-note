enum Color {
    red,
    blue = <any>'123',
    green = 3,
    yellow
}

console.log(Color.blue); // '123'