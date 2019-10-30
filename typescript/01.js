var Color;
(function (Color) {
    Color[Color["red"] = 0] = "red";
    Color[Color["blue"] = '123'] = "blue";
    Color[Color["green"] = 3] = "green";
    Color[Color["yellow"] = 4] = "yellow";
})(Color || (Color = {}));
console.log(Color.blue);
