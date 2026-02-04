/**
    * @enum {number}
    */
    const Color = ((a=0) => ({
        RED: a++,
        GREEN: a++,
        BLUE: a++,
        YELLOW: a++,
    }))()

/**
    * @param {number} ms 
    * @returns {Promise<void>}
    */
    function wait(ms) {
        return new Promise((r) => {
            setTimeout(() => {
                r();
            }, ms)
        })
    }

/**
    * @param {Color} color 
    * @param {number} ms 
    */
    async function show(color, ms) {
        let c;
        switch(color) {
            case Color.RED:
                c = $(".indicator.red");  
                break;
            case Color.GREEN:
                c = $(".indicator.green");  
                break;
            case Color.BLUE:
                c = $(".indicator.blue");  
                break;
            case Color.YELLOW:
                c = $(".indicator.yellow");  
                break;
        }
        c.css({
            opacity: 1,
        })
        await wait(ms);
        c.css({
            opacity: null,
        })
    }

const ms = 250;

let score = 0;
let round = false;

let lose = false;

$("#center").click(() => {
    if(round) return;
    colors.length = 0;
    score = 0;
    lose = false;
    round = true;
    startround();
})

/**
    * @param {Color} color 
    * @param {d}
    */
    function expect(color, d, f) {
        return (c) => {
            if(color == c) {
                d();
            } else {
                f();
            }
        }
    }

const colors = [];
const promises = [];
let ready = false;

async function startround() {
    const p = [];
    ready = false;
    colors.push(Math.floor(Math.random()*Object.keys(Color).length));
    promises.length = 0;
    for(const v of colors) {
        p.push(new Promise((r, f) => {
            promises.push(expect(v, r, f))
        }))
        beep(colorSounds[v]);
        await show(v, ms);
        await wait(ms);
    }
    ready = true;
    try {
        await Promise.all(p);
    } catch(e) {
        ready = false;
        promises.length = 0;
        round = false;
        lose = true;
        return;
    }
    ready = false;
    score++;
    setTimeout(startround, 1000);
}

["RED","GREEN","BLUE","YELLOW"].forEach(color => {
    $(`.quadrant.${color.toLowerCase()}`).click(() => {
        if(!ready || promises.length == 0) return;
        promises.shift()(Color[color]);
        beep(colorSounds[Color[color]]);
    });
});

function update() {
    $("#score").text(`SCORE: ${score}`);
    $("#lose").props({hidden: lose?null:""})
    document.title = `SIMON SCORE:${score}`
    requestAnimationFrame(update)
}
requestAnimationFrame(update)


const colorSounds = {
    [Color.RED]: 261,    // C4
    [Color.GREEN]: 329,  // E4
    [Color.BLUE]: 392,   // G4
    [Color.YELLOW]: 523  // C5
};

function beep(frequency = 440, duration = 200) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration / 1000);
}

