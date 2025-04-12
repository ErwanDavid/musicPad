
const filter1 = new Tone.Filter({type : "lowpass" ,frequency : 9000 ,rolloff : -12 ,Q : 0.42 ,gain : 0});
const filter2 = new Tone.Filter({type : "lowpass" ,frequency : 9000 ,rolloff : -12 ,Q : 0.42 ,gain : 0});

var nbrVoice1 = 0;
var nbrVoice2 = 0;
var freq1 = 440;
var freq2 = 220;
var freqtrig1 = 660;
var freqtrig2 = 440;

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

Tone.Destination.chain(filter1);
Tone.Destination.chain(filter2);
Tone.start()

positionOSC1.on('change',function(v) {
    nbrVoice1 = nbrVoice1 +1;
    freq1 = (660 * (v.y)) + 100;
    freqcut1 = 2000 * (v.x + 0.8);
    if (nbrVoice1 < 2) {
        freqtrig1 = freq1
        log_info("Go synth 1" + freq1);
        synth1.triggerAttack(freqtrig1, Tone.now(), 1);
    }
    else{
        synth1.set({ frequency: freq1 });
        filter1.set({ frequency: freqcut1 });
    }
})

positionOSC2.on('change',function(w) {
    nbrVoice2 = nbrVoice2 +1;
    freq2 = (330 * (w.y));
    freqcut2 = 2000 * (w.x + 0.8);
    if (nbrVoice2 < 2) {
        freqtrig2 = freq2
        log_info("Go synth 2"+ freq2);
        synth2.triggerAttack(freqtrig2, Tone.now(), 1);
    }
    else{
        synth2.set({ frequency: freq2 });
        filter2.set({ frequency: freqcut2 });
    }
})

const OSC1Div1 = document.getElementById('OSC1');
OSC1Div1.addEventListener('mouseup', () => {
    log_info("Stop synth 1" + freqtrig1);
    synth1.triggerRelease(freqtrig1);
    nbrVoice1 = 0;
});

const OSC1Div2 = document.getElementById('OSC2');
OSC1Div2.addEventListener('mouseup', () => {
    log_info("Stop synth 1" + freqtrig2);
    synth2.triggerRelease(freqtrig2);
    nbrVoice2 = 0;
});

function log_info(mytext) {
    console.log(mytext);
    document.getElementById('displayLog').value = document.getElementById('displayLog').value + " LOG:\t" +  mytext + '\n';
    document.getElementById('displayLog').scrollTop = document.getElementById('displayLog').scrollHeight ;
}
