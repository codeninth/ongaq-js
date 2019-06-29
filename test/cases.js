export default [
    {
        label: "CM9",
        function: ()=>{
            let c = new Chord("CM9",{ octave: 1 })
            return c.key.join(", ") === "1$1, 1$5, 1$8, 1$12, 2$3"
        }
    },
    {
        label: "CM9 shift(1)",
        function: () => {
            let c = new Chord("CM9", { octave: 1 })
            c = c.shift(1)
            return c.key.join(", ") === "1$2, 1$6, 1$9, 2$1, 2$4"
        }
    },
    {
        label: "CM9 shift(8)",
        function: () => {
            let c = new Chord("CM9", { octave: 1 })
            c = c.shift(8)
            return c.key.join(", ") === "1$9, 2$1, 2$4, 2$8, 2$11"
        }
    },
    {
        label: "CM9 shift(8) octave(1)",
        function: () => {
            let c = new Chord("CM9", { octave: 1 })
            c = c.shift(8)
            c = c.octave(1)
            return c.key.join(", ") === "2$9, 3$1, 3$4, 3$8, 3$11"
        }
    },
    {
        label: "CM9 shift(8) octave(1) shift(2) octave(1)",
        function: () => {
            let c = new Chord("CM9", { octave: 1 })
            c = c.shift(8)
            c = c.octave(1)
            c = c.shift(2)
            c = c.octave(1)
            return c.key.join(", ") === "3$11, 4$3, 4$6, 4$10"
        }
    },
    {
        label: "BM9",
        function: () => {
            let c = new Chord("BM9", { octave: 2 })
            return c.key.join(", ") === "2$12, 3$4, 3$7, 3$11, 4$2"
        }
    },
    {
        label: "BM9 shift(-2)",
        function: () => {
            let c = new Chord("BM9", { octave: 2 })
            c = c.shift(-2)
            return c.key.join(", ") === "2$10, 3$2, 3$5, 3$9, 3$12"
        }
    },
    {
        label: "BM9 shift(-2) shift(-5)",
        function: () => {
            let c = new Chord("BM9", { octave: 2 })
            c = c.shift(-2)
            c = c.shift(-5)
            return c.key.join(", ") === "2$5, 2$9, 2$12, 3$4, 3$7"
        }
    },
    {
        label: "BM9 shift(-2) shift(-5) octave(-2)",
        function: () => {
            let c = new Chord("BM9", { octave: 2 })
            c = c.shift(-2)
            c = c.shift(-5)
            c = c.octave(-2)
            return c.key.join(", ") === "1$4, 1$7"
        }
    },
    {
        label: "D#M7",
        function: () => {
            let c = new Chord("D#M7")
            return c.key.join(", ") === "2$4, 2$8, 2$11, 3$3"
        }
    },
    {
        label: "D#M7 shift(0)",
        function: () => {
            let c = new Chord("D#M7")
            c = c.shift(0)
            return c.key.join(", ") === "2$4, 2$8, 2$11, 3$3"
        }
    },
    {
        label: "D#M7 octave(0)",
        function: () => {
            let c = new Chord("D#M7")
            c = c.octave(0)
            return c.key.join(", ") === "2$4, 2$8, 2$11, 3$3"
        }
    },
    {
        label: "E",
        function: () => {
            let c = new Chord("E")
            return c.key.join(", ") === "2$5, 2$9, 2$12"
        }
    },
    {
        label: "E rotate()",
        function: () => {
            let c = new Chord("E")
            c = c.rotate()
            return c.key.join(", ") === "2$9, 2$12, 3$5"
        }
    },
    {
        label: "E rotate().rotate()",
        function: () => {
            let c = new Chord("E")
            c = c.rotate().rotate()
            return c.key.join(", ") === "2$12, 3$5, 3$9"
        }
    },
    {
        label: "G6",
        function: () => {
            let c = new Chord("G6")
            return c.key.join(", ") === "2$8, 2$12, 3$3, 3$5"
        }
    },
    {
        label: "G6 slice(2)",
        function: () => {
            let c = new Chord("G6")
            c = c.slice(2)
            return c.key.join(", ") === "3$3, 3$5"
        }
    },
    {
        label: "G6 slice(0,1)",
        function: () => {
            let c = new Chord("G6")
            c = c.slice(0,1)
            return c.key.join(", ") === "2$8"
        }
    },
    {
        label: "G6 slice(-3)",
        function: () => {
            let c = new Chord("G6")
            c = c.slice(-3)
            return c.key.join(", ") === "2$12, 3$3, 3$5"
        }
    }
]