function makeSin(size, offset) {
    return Array(size).fill(0).map((v, index) => {
        return sin(TWO_PI / size * (index + offset)) / 2 + 0.5;
    })
}

let Ball = function (x, y, mov, gravity, damping, center, keepout) {
    const pos = createVector(x, y);
    const paint = color(255, 255, 255);

    const setColor = function (r, g, b) {
        paint.setRed(r);
        paint.setGreen(g);
        paint.setBlue(b);
    }

    const getMovement = function () {
        return mov.copy();
    }

    const draw = function () {
        stroke(paint);
        point(pos);
        pos.add(mov);
        let force = pos.copy();

        force.sub(center);
        force.normalize();
        force.mult(gravity);
        if (pos.dist(center) < keepout) {
            mov.add(force);
        } else {
            mov.sub(force);
        }
        mov.mult(damping);
    };

    const impact = function (force) {
        let curPos = pos.copy();
        let impactForceV = curPos.sub(center).normalize().mult(force);
        mov.add(impactForceV);
    }

    return {
        draw,
        impact,
        setColor,
        getMovement
    };
}

const balls = []
const pointCount = 400;
const impactInterval = 5;
const impactAtten = 5;


let musicSelection;
let bgSyncCheckbox;
let startButton;
let loading = true;
let music = 'spectrum';
let bgSync = false;
let ballSizeSlider;


function getCirclePoint(index, totalPoints, radius, center) {
    const angle = TWO_PI / totalPoints * index;
    const x = center.x + radius * cos(angle);
    const y = center.y + radius * sin(angle);
    return createVector(x, y);
}


function musicSelectEvent() {
    music = musicSelection.value();
    if (sound.isPlaying()) {
        sound.pause();
    }
    if(startButton) {
        startButton.elt.innerHTML = 'Loading...';  // Update button label to "Loading..."
        startButton.elt.disabled = true;
        loading = true;
    }
    
    sound = loadSound(`/audio/${music}.mp3`, soundLoaded);  // Load the new sound and set a callback for when it's loaded
}

function soundLoaded() {
    if(startButton){
        startButton.elt.innerHTML = 'Start';  // Update button label to "Start" once the sound is loaded
    }
    loading = false;
}

function bgSyncCheckedEvent() {
    bgSync = bgSyncCheckbox.checked();
}


function preload() {
    sound = loadSound(`/audio/${music}.mp3`, soundLoaded);
}


function setup() {
    let w = 400;
    let h = 400;

    const canvas = createCanvas(w, h);
    canvas.parent('p5-container');

    startButton = select('#start-button');
    startButton.elt.innerHTML = 'Start';
    startButton.mousePressed(togglePlay);
    startButton.elt.disabled = true;

    musicSelection = select("#music-selector");
    musicSelection.option(music);
    musicSelection.option('dubstep_1');
    musicSelection.option('dubstep_2');
    musicSelection.option('sweep');
    musicSelection.changed(musicSelectEvent);

    bgSyncCheckbox = select('#bgsync-checkbox');
    bgSyncCheckbox.elt.checked = bgSync;
    bgSyncCheckbox.changed(bgSyncCheckedEvent);

    ballSizeSlider = select('#ball-size-slider');


    fcount = 0;
    impactCount = 0;
    fft = new p5.FFT();
    const spectrum = fft.analyze();
    R_SAMPLE_MAP = makeSin(pointCount, 0);
    G_SAMPLE_MAP = makeSin(pointCount, pointCount / 4);
    B_SAMPLE_MAP = makeSin(pointCount, pointCount / 2);
    spectrumBuffer = new Array(spectrum.length).fill(0);
    ballCountToImpact = pointCount / impactInterval;
    stride = Math.floor(spectrum.length / pointCount);
    impactStart = 0;
    const anchor = createVector(w / 2, h / 2);

    for (let i = 0; i < pointCount; i++) {
        
        let x = i;
        let y = i;
        switch (i % 4) {
            case 0:
                x = pointCount
                break;
            case 1:
                x = 0;
                break;
            case 2:
                y = pointCount
                break;
            case 3:
                y = 0;
                break;
        }
        
        balls.push(
            Ball(x * w / pointCount,
                y * h / pointCount,
                createVector((random() - 0.5) * 2, (random() - 0.5) * 2),
                3,
                0.6,
                anchor, 
                100)
        );
        // const circlePoint = getCirclePoint(i, pointCount, 500, anchor);

        // balls.push(
        //     Ball(circlePoint.x,
        //         circlePoint.y,
        //         createVector(0, 0),
        //         3,
        //         0.6,
        //         anchor, 
        //         100)
        // );
    }
    
}

function draw() {
    if (bgSync) {
        const rEnergy = fft.getEnergy("bass");
        const gEnergy = fft.getEnergy("mid");
        const bEnergy = fft.getEnergy("treble");

        background(color(rEnergy, gEnergy, bEnergy));
    } else {
        background(254);
    }

    const spectrum = fft.analyze();
    fcount++;
    if (!sound.isPlaying() && (fcount > 120)) {
        const total_entropy = balls.map(b => b.getMovement().mag()).reduce((a, b) => a + b);
        if (total_entropy < (pointCount * 1.4)) {
            if(!loading) {
                startButton.elt.disabled = false;
            }
        }
    }

    if ((fcount % impactInterval) === 0) {
        impactCount++;
        const startIndex = impactCount % impactInterval;
        for (let i = startIndex; i < pointCount; i += impactInterval) {
            let force = (spectrumBuffer[i * stride] / impactInterval) / impactAtten;
            balls[i].setColor(255 * R_SAMPLE_MAP[i], 255 * G_SAMPLE_MAP[i], 255 * B_SAMPLE_MAP[i]);
            balls[i].impact(force);
        }
        spectrumBuffer.fill(0);
    } else {
        for (let i = 0; i < spectrum.length; i++) {
            spectrumBuffer[i] += spectrum[i];
        }
    }

    impactStart += ballCountToImpact;
    impactStart = impactStart % balls.length;
    if(ballSizeSlider) {
        const ballSize = ballSizeSlider.value();
        strokeWeight(ballSize);
    }
    for (let ball in balls) {
        balls[ball].draw();
    }
}

function togglePlay() {
    if (sound.isPlaying()) {
        sound.pause();
        startButton.elt.innerHTML = 'Start';  // Update button label to "Start" when music is paused
    } else {
        sound.loop();
        startButton.elt.innerHTML = 'Stop';  // Update button label to "Stop" when music is playing
    }
}
