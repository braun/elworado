var howler = require("howler");
var soundQueue = [];
function playSound(sound,volume)
{
    if(volume == null)
    volume = 1.5;
    var sound = new howler.Howl({
        src: [sound],
        volume: volume,
        onend: ()=>
        {
            soundQueue.shift();
            if(soundQueue.length>0)
                soundQueue[0].play();
        }
      });
    soundQueue.push(sound);
    if(soundQueue.length==1)
        soundQueue[0].play();
}

module.exports.play = playSound;