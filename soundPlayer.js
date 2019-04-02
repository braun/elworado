var howler = require("howler");
var soundQueue = [];
function playSound(sound)
{
    var sound = new window.howler.Howl({
        src: [sound],
        volume: 1.5,
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