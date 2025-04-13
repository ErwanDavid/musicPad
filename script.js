
function startup() {
  const el = document.getElementById("canvas");
  el.addEventListener("touchstart",  handleStart);
  el.addEventListener("mousedown",  handleStart);
  el.addEventListener("touchend",    handleEnd);
  el.addEventListener("mouseup",    handleEnd);
  el.addEventListener("touchcancel", handleCancel);
  el.addEventListener("touchmove",   handleMove);
  el.addEventListener("mousemove",   handleMove);
  log("Initialisation.");
}

const filter1 = new Tone.Filter({type : "lowpass" ,frequency : 900 ,rolloff : -12 ,Q : 0.42 ,gain : 0});

const synth1  = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: 'fatsawtooth',
        count: 2
    }
  }).toDestination();

Tone.Destination.chain(filter1);
Tone.start()

document.addEventListener("DOMContentLoaded", startup);

const ongoingTouches = [];
const freqStart = 220;
var freqCur = freqStart

function handleStart(evt) {
    evt.preventDefault();
    log("touchstart all");
    const el = document.getElementById("canvas");
    const ctx = el.getContext("2d");
    const touches = evt.changedTouches;
    noteOn(freqCur, synth1);
    if (typeof touches !== 'undefined')   {
        for (let i = 0; i < touches.length; i++) {
            log(`touchstart: ${i}.`);
            ongoingTouches.push(copyTouch(touches[i]));
            const color = colorForTouch(touches[i]);
            log(
                `Couleur de cette touche avec l'identifiant ${touches[i].identifier} = ${color}`,
            );
            ctx.beginPath();
            ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false); // un cercle au début
            ctx.fillStyle = color;
            ctx.fill();
        }
    }
    else {
        x = evt.clientX;
        y = evt.clientY;
        log(`touchstart mouse: ${x} ${y}`);
        var touch = new Object();
        touch["identifier"] = 1;
        touch["pageX"] = x;
        touch["pageY"] = y;
        ongoingTouches.push(copyTouch(touch));
    }
}

function handleMove(evt) {
    evt.preventDefault();
    const el = document.getElementById("canvas");
    const ctx = el.getContext("2d");
    const touches = evt.changedTouches;
    var color = "#000000"
    if (typeof touches !== 'undefined')   {
        for (let i = 0; i < touches.length; i++) {
            color = colorForTouch(touches[i]);
            const idx = ongoingTouchIndexById(touches[i].identifier);

            if (idx >= 0) {
            log(`progression du point de touche ${idx}`);
            ctx.beginPath();
            log(
                `   ctx.moveTo( ${ongoingTouches[idx].pageX}, ${ongoingTouches[idx].pageY} );`,
            );
            ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
            //log(`ctx.lineTo( ${touches[i].pageX}, ${touches[i].pageY} );`);
            ctx.lineTo(touches[i].pageX, touches[i].pageY);
            ctx.lineWidth = 4;
            ctx.strokeStyle = color;
            ctx.stroke();
            changeFreg(touches[i].pageX, touches[i].pageY,synth1, filter1 )
            ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // on met à jour le point de contact
            } else {
            log(`impossible de déterminer le point de contact à faire avancer`);
            }
        }
    }
    else{
        x = evt.clientX;
        y = evt.clientY;
        changeFreg(x, y,synth1, filter1 )
        ctx.beginPath();
        let idx = ongoingTouchIndexById(1);
        ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
        ctx.lineTo(x ,y);
        ctx.lineWidth = 4;
        ctx.strokeStyle = color;
        ctx.stroke();

    }
}

function handleEnd(evt) {
    evt.preventDefault();
    log("touchend");
    const el = document.getElementById("canvas");
    const ctx = el.getContext("2d");
    const touches = evt.changedTouches;
    noteOff(freqCur, synth1);
    if (typeof touches !== 'undefined')   {
        for (let i = 0; i < touches.length; i++) {
            const color = colorForTouch(touches[i]);
            let idx = ongoingTouchIndexById(touches[i].identifier);
            if (idx >= 0) {
                ctx.lineWidth = 4;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
                ctx.lineTo(touches[i].pageX, touches[i].pageY);
                ctx.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 8, 8); // on dessine un carré à la fin
                ongoingTouches.splice(idx, 1); // on le retire du tableau de suivi
            } else {
                log(`impossible de déterminer le point de contact à terminer`);
            }
        }
    }
}

function handleCancel(evt) {
  evt.preventDefault();
  log("touchcancel.");
  const touches = evt.changedTouches;

  for (let i = 0; i < touches.length; i++) {
    let idx = ongoingTouchIndexById(touches[i].identifier);
    ongoingTouches.splice(idx, 1); // on le retire du tableau de suivi
  }
}

function colorForTouch(touch) {
  let r = touch.identifier % 16;
  let g = Math.floor(touch.identifier / 3) % 16;
  let b = Math.floor(touch.identifier / 7) % 16;
  r = r.toString(16); // on le transforme en chiffre hexadécimal
  g = g.toString(16); // on le transforme en chiffre hexadécimal
  b = b.toString(16); // on le transforme en chiffre hexadécimal
  const color = "#" + r + g + b;
  return color;
}

function copyTouch({ identifier, pageX, pageY }) {
    log(`   copyT  ${identifier}  ${pageX} - ${pageY}`);
    return { identifier, pageX, pageY };
}

function ongoingTouchIndexById(idToFind) {
  for (let i = 0; i < ongoingTouches.length; i++) {
    const id = ongoingTouches[i].identifier;

    if (id == idToFind) {
      return i;
    }
  }
  return -1; // non trouvé
}

function noteOn(freq, curSynth) {
    curSynth.triggerAttack(freq, Tone.now(), 1);
}

function noteOff(freq, curSynth) {
    curSynth.triggerRelease(freq, Tone.now(), 1);
}
function changeFreg(posx, posy, curSynth, curFilter) {
    freq1 = posx;
    freqcut1 = (600-posy) *2;
    log(`   Filter to ${freq1} filter ${freqcut1}`)
    curSynth.set({ frequency: freq1 });
    curFilter.set({ frequency: freqcut1 });
    
}

function log(msg) {
  const container = document.getElementById("log");
  container.textContent = `${msg} \n${container.textContent}`;
}
