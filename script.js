
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
            this.speedX = 0;
            this.speedY = 0;
            this.dx = 0;
            this.dy = 0;
            this.speedModifier = 5;
        }

        draw(context){
            context.beginPath();
            context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
            context.save(); // to limit the canvase setting use save and restore.
            context.globalAlpha = 0.5;
            context.fill();
            context.restore();
            context.stroke();
            context.beginPath();
            context.moveTo(this.collisionX,this.collisionY);
            context.lineTo(this.game.mouse.x, this.game.mouse.y);
            context.stroke();
        }
        update(){
            this.dx = this.game.mouse.x - this.collisionX;
            this.dy = this.game.mouse.y - this.collisionY;
            const distance = Math.hypot(this.dy, this.dx);
            if (distance > this.speedModifier){
                this.speedX = this.dx/distance || 0;
                this.speedY = this.dy/distance || 0;
            } else {
                this.speedX = 0;
                this.speedY = 0;
            }
            this.collisionX += this.speedX * this.speedModifier;
            this.collisionY += this.speedY * this.speedModifier;
        }
    }

    class Obstacle {
        constructor(game){
            this.game = game;
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = 60;
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
            this.obstacles = [];
            this.numberOfObstacles = 5;
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            }

            // even listeners
            canvas.addEventListener('mousedown', (e) => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = true;
            });
            canvas.addEventListener('mouseup', (e) => {
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
                this.mouse.pressed = false;
            });
            canvas.addEventListener('mousemove', (e) => {
                if (this.mouse.pressed){
                    this.mouse.x = e.offsetX;
                    this.mouse.y = e.offsetY;
                }
            });
        }
        render(context){
            this.player.draw(context);
            this.player.update();
            this.obstacles.forEach(obstacle => obstacle.draw(context));
        }
        init(){ // init all the obstacles and make sure they don't overlap
            let attempt = 0;
            while (this.obstacles.length < this.numberOfObstacles && attempt < 500){
                let testObs = new Obstacle(this);
                let overLap = false;
                this.obstacles.forEach(obstacle => {
                    const dx = testObs.collisionX - obstacle.collisionX;
                    const dy = testObs.collisionY - obstacle.collisionY;
                    const distanceBetweenCircle = Math.hypot(dy, dx);
                    const sumOfRadius = testObs.collisionRadius + obstacle.collisionRadius;
                    if (distanceBetweenCircle < sumOfRadius){
                        overLap = true;
                    }
                });
                if(!overLap){
                    this.obstacles.push(testObs);
                }
                attempt++;
            }
        }
    }

    const game = new Game(canvas);
    game.init();
    function animate(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        game.render(ctx);
        window.requestAnimationFrame(animate);
    }
    animate();
});