
function startup() {
  const el1 = document.getElementById("canvas1");
  el1.addEventListener("touchstart",  handleStart);
  el1.addEventListener("mousedown",  handleStart);
  el1.addEventListener("touchend",    handleEnd);
  el1.addEventListener("mouseup",    handleEnd);
  el1.addEventListener("touchcancel", handleCancel);
  el1.addEventListener("touchmove",   handleMove);
  el1.addEventListener("mousemove",   handleMove);
  const el2 = document.getElementById("canvas2");
  el2.addEventListener("touchstart",  handleStart);
  el2.addEventListener("mousedown",  handleStart);
  el2.addEventListener("touchend",    handleEnd);
  el2.addEventListener("mouseup",    handleEnd);
  el2.addEventListener("touchcancel", handleCancel);
  el2.addEventListener("touchmove",   handleMove);
  el2.addEventListener("mousemove",   handleMove);
  log("Initialisation.");

}

const filter1 = new Tone.Filter({type : "lowpass" ,frequency : 900 ,rolloff : -12 ,Q : 0.42 ,gain : 0});
const synth1  = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: 'fatsawtooth',
        count: 1
    }
  }).toDestination();
const synth2  = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: 'sawtooth',
        count: 1
    }
  }).toDestination();
Tone.Destination.chain(filter1);
Tone.start()

document.addEventListener("DOMContentLoaded", startup);

const ongoingTouches = [];
const freqStart = 220;
var freqCur = freqStart

function handleStart(evt) {
    evt.preventDefault()
    var canasID=evt.target.height -600;
    var el = null;
    var curSynth = null;
    var ctx = null;
    var touches = null;
    var color = null;
    var x = null;
    var y = null;
    if (canasID == 1) {
        el = document.getElementById("canvas1");
        ctx = el.getContext("2d");
        touches = evt.changedTouches;
        color = "#0000FF";
        curSynth = synth1;
        x = evt.clientX;
        y = evt.clientY;
    } else {
        el = document.getElementById("canvas2");
        ctx = el.getContext("2d");
        touches = evt.changedTouches;
        color = "#00FF00";
        curSynth = synth2;
        x = evt.clientX - 400;
        y = evt.clientY;
    }
    if (typeof touches !== 'undefined')   {
        for (let i = 0; i < touches.length; i++) {
            noteOn(freqCur, curSynth);
            log(`touchstart: ${i}.`);
            ongoingTouches.push(copyTouch(touches[i]));
            color = colorForTouch(touches[i]);
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
        noteOn(freqCur, curSynth);
        log(` ${canasID} touchstart mouse: ${x} ${y}`);
        var touch = new Object();
        touch["identifier"] = canasID;
        touch["pageX"] = x;
        touch["pageY"] = y;
        ongoingTouches.push(copyTouch(touch));
        ctx.beginPath();
        ctx.arc(touch.pageX, touch.pageY, 4, 0, 2 * Math.PI, false); // un cercle au début
        ctx.fillStyle = color;
        ctx.fill();
    }
}

function handleMove(evt) {
    evt.preventDefault();
    var canasID=evt.target.height -600;
    var el = null;
    var curSynth = null;
    var ctx = null;
    var touches = null;
    var color = null;
    var x = null;
    var y = null;
    if (canasID == 1) {
        el = document.getElementById("canvas1");
        ctx = el.getContext("2d");
        touches = evt.changedTouches;
        color = "#0000FF";
        curSynth = synth1;
        x = evt.clientX;
        y = evt.clientY;
    } else {
        el = document.getElementById("canvas2");
        ctx = el.getContext("2d");
        touches = evt.changedTouches;
        color = "#00FF00";
        curSynth = synth2;
        x = evt.clientX - 400;
        y = evt.clientY;
    }
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
                changeFreg(touches[i].pageX, touches[i].pageY,curSynth, filter1, canasID)
                ongoingTouches.splice(idx, 1, copyTouch(touches[i])); // on met à jour le point de contact
            } 
            else {
                    log(`impossible de déterminer le point de contact à faire avancer`);
            }
        }
    }
    else{
        log(` ${canasID} touch move mouse: ${x} ${y}`);
        changeFreg(x, y,curSynth, filter1 , canasID)
        
        let idx = ongoingTouchIndexById(canasID);
        if (idx >= 0) {
            ctx.beginPath();
            ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
            ctx.lineTo(x ,y);
            ctx.lineWidth = 4;
            ctx.strokeStyle = color;
            ctx.stroke();
            var touch = new Object();
            touch["identifier"] = canasID;
            touch["pageX"] = x;
            touch["pageY"] = y;
            ongoingTouches.splice(idx, 1, copyTouch(touch));
        }
/*         else {
            log(`impossible de déterminer le point de contact à faire avancer`);
        } */
    }
}

function handleEnd(evt) {
    evt.preventDefault();
    log("touchend");
    var canasID=evt.target.height -600;
    var curSynth = null;
    var ctx = null;
    var touches = null;
    if (canasID == 1) {
        const el = document.getElementById("canvas1");
        ctx = el.getContext("2d");
        touches = evt.changedTouches;
        var color = "#000000";
        curSynth = synth1;
    } else {
        const el = document.getElementById("canvas2");
        ctx = el.getContext("2d");
        touches = evt.changedTouches;
        var color = "#00FF00";
        curSynth = synth2;
    }
    
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
                noteOff(freqCur, curSynth);
            } else {
                log(`impossible synth1de déterminer le point de contact à terminer`);
            }
        }
    }
    else {
        noteOff(freqCur, curSynth);
        let idx = ongoingTouchIndexById(canasID);
        ongoingTouches.splice(idx, 1);
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
    //log(`   copyT  ${identifier}  ${pageX} - ${pageY} `);
    return { identifier, pageX, pageY };
}

function ongoingTouchIndexById(idToFind) {
  for (let i = 0; i < ongoingTouches.length; i++) {
    const id = ongoingTouches[i].identifier;

    if (id == idToFind) {
       // log(`     find in table  ${idToFind} `);
      return i;
    }
  }
  //log(`     NOT find in table  ${idToFind} `);
  return -1; // non trouvé
}

function noteOn(freq, curSynth) {
    curSynth.triggerAttack(freq, Tone.now(), 1);
}

function noteOff(freq, curSynth) {
    curSynth.triggerRelease(freq, Tone.now(), 1);
}
function changeFreg(posx, posy, curSynth, curFilter, id) {
    if (id == 1) {
        freq1 = posx/2;
    } else {
        freq1 = posx/4;
    }
    freqcut1 = (600-posy) *2;
    //log(`   Filter to ${freq1} filter ${freqcut1}`)
    curSynth.set({ frequency: freq1 });
    curFilter.set({ frequency: freqcut1 });
    
}

function log(msg) {
  const container = document.getElementById("log");
  container.textContent = `${msg} \n${container.textContent}`;
}
