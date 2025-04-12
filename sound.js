
const filter1 = new Tone.Filter({type : "lowpass" ,frequency : 900 ,rolloff : -12 ,Q : 0.42 ,gain : 0});
const filter2 = new Tone.Filter({type : "lowpass" ,frequency : 900 ,rolloff : -12 ,Q : 0.42 ,gain : 0});

var nbrVoice1 = 0;
var nbrVoice2 = 0;
var freq1 = 440;
var freq2 = 220;
var freqtrig1 = 660;
var freqtrig2 = 660;

const synth1  = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: 'fatsawtooth',
        count: 2
    }
  }).toDestination();

  const synth2  = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: 'fatsquare',
        count: 2
    }
  }).toDestination();

Tone.Destination.chain(filter1, filter2);
Tone.start()

positionOSC1.on('change',function(v) {
    nbrVoice1 = nbrVoice1 +1;
    noteOrfreq(synth1, filter1, nbrVoice1, v);
})

positionOSC2.on('change',function(w) {
    nbrVoice2 = nbrVoice2 +1;
    noteOrfreq(synth2, filter2, nbrVoice2, w);
})

const OSC1Div1 = document.getElementById('OSC1');
OSC1Div1.addEventListener('mouseup', () => {
    log_info("Stop synth 1 F:" + freqtrig1);
    synth1.triggerRelease(freqtrig1);
    nbrVoice1 = 0;
});
OSC1Div1.addEventListener('touchend', () => {
    log_info("Stop synth 1 F:" + freqtrig2);
    synth2.triggerRelease(freqtrig2);
    nbrVoice2 = 0;
}); 

const OSC1Div2 = document.getElementById('OSC2');
OSC1Div2.addEventListener('mouseup', () => {
    log_info("Stop synth 2 F:" + freqtrig2);
    synth2.triggerRelease(freqtrig2);
    nbrVoice2 = 0;
}); 
OSC1Div2.addEventListener('touchend', () => {
    log_info("Stop synth 2 F:" + freqtrig2);
    synth2.triggerRelease(freqtrig2);
    nbrVoice2 = 0;
}); 

function noteOrfreq(curSynth, curFilter, curVoices, pos) {
    freq1 = (660 * (pos.y)) + 100;
    freq1 = freq1.toFixed(2);
    freqcut1 = 900 * (pos.x + 0.2);
    freqcut1 = freqcut1.toFixed(2);
    if (curVoices < 2) {
        freqtrig1 = freq1
        freqtrig2 = freq1
        log_info("Go synth F:"  + freq1);
        curSynth.triggerAttack(freqtrig1, Tone.now(), 1);
    }
    else{
        log_info("Update synth F:"  + freq1  + " filter C:" + freqcut1);
        curSynth.set({ frequency: freq1 });
        curFilter.set({ frequency: freqcut1 });
    }
}

function log_info(mytext) {
    console.log(mytext);
    document.getElementById('displayLog').value = document.getElementById('displayLog').value + " LOG:\t" +  mytext + '\n';
    document.getElementById('displayLog').scrollTop = document.getElementById('displayLog').scrollHeight ;
}
