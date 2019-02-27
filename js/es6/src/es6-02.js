export function resolve() {
    function f1() {
        let a = [1,2,3,4]
        let [b,c,d,e] = a
        console.log(b,c,d,e) // 1,2,3,4
        let aa = [1,2,3,4]
        let [bb, ...cc] = aa
        console.log(bb,cc) // 1, [2,3,4]
    }
    f1()

    function f2() {
        let a = new Set(['a','b','c'])
        let [x,y,z] = a
        console.log(x, y, z) // a, b, c
    }
    f2()

    function f3() {
        let obj = {name: '1', age: 15}
        let { name, age } = obj
        console.log(name, age) // '1', 15
        let { name: n, age: a } = obj
        console.log(n, a) // '1', 15
    }
    f3()

    function f4() {
        let a = 'abcde'
        let [aa,bb,cc,dd,ee] = a
        console.log(aa,bb,cc) // a, b, c
    }
    f4()
}