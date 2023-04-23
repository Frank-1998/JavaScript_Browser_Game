
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
    


    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';

    // setting up player and game so that game will automaticly generate player
    class Player {
        constructor(game){
            this.game = game; // refer to the memory, not copying
            this.collisionX = this.game.width * 0.5;
            this.collisionY = this.game.height * 0.5;
            this.collisionRadius = 30;
        }

        draw(context){
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
            context.save(); // to limit the canvase setting use save and restore.
            context.globalAlpha = 0.5;
            context.fill();
            context.restore();
            context.stroke();
        }
    }

    class Game {
        constructor(canvas){
            this.canvas = canvas;
            this.width = canvas.width;
            this.height = canvas.height;
            this.player = new Player(this);
        }
        render(context){
            this.player.draw(context);
        }
    }

    const game = new Game(canvas);
    game.render(ctx);
    console.log(game);


    function animate(){

    }
});