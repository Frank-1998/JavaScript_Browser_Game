
/*
adds an event listen to window object. The event being listened is "load",
which fires when all the windows and all its resources have finished loading.
When the listener fires, the function got excecuted. 
*/
window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d'); // used for drawing text and graphics on canvas
    canvas.width = 1280;
    canvas.height = 720;


    // setting up player and game so that game will automaticly generate player
    class Player {
        constructor(game){
            this.game = game; // refer to the memory, not copying
        }
    }

    class Game {
        constructor(canvas){
            this.canvas = canvas;
            this.width = canvas.width;
            this.height = canvas.height;
            this.player = new Player(this);
        }
    }

    const game = new Game(canvas);
    console.log(game);


    function animate(){

    }
});