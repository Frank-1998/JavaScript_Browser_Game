
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
            this.spriteWidth = 255;
            this.spriteHeight = 256;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.frameX = 0;
            this.frameY = 0;
            this.image = document.getElementById('bull');
        }

        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            if (this.game.debug){
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
            
        }
        update(){
            this.dx = this.game.mouse.x - this.collisionX;
            this.dy = this.game.mouse.y - this.collisionY;
            // sprite animation(player angle)
            const angle = Math.atan2(this.dy, this.dx);
            if (angle < -1.17) this.frameY = 0;
            else if (angle < -0.39) this.frameY = 1;
            else if (angle < 0.39) this.frameY = 2;
            else if (angle < 1.17) this.frameY = 3;
            else if (angle < 1.96) this.frameY = 4;
            else if (angle < 2.74) this.frameY = 5;
            else if (angle < -2.74 || angle > 2.74) this.frameY = 6;
            else if (angle < -1.96) this.frameY = 7;

            
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
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 100;
            // horizontal boundaries
            if (this.collisionX < 0 + this.collisionRadius) this.collisionX = this.collisionRadius;
            else if (this.collisionX > this.game.width - this.collisionRadius) this.collisionX = this.game.width - this.collisionRadius;
            // vertical boundary
            if (this.collisionY < this.game.topMargine + this.collisionRadius) this.collisionY = this.game.topMargine + this.collisionRadius;
            else if (this.collisionY > this.game.height - this.collisionRadius) this.collisionY = this.game.height - this.collisionRadius;
            // check collision with obstacles
            this.game.obstacles.forEach(obstacle => {
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this,obstacle);
                if (collision){
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y;

                }
            })
        }
    }

    class Obstacle {
        constructor(game){
            this.game = game;
            this.collisionX = Math.random() * this.game.width;
            this.collisionY = Math.random() * this.game.height;
            this.collisionRadius = 40;
            this.image = document.getElementById('obstacles');
            this.spriteWidth = 250;
            this.spriteHeight = 250;
            this.width = this.spriteWidth; // size for each one of the frames
            this.height = this.spriteHeight;
            this.spriteX = this.collisionX - this.width * 0.5;  // position for drawing indivisial frame
            this.spriteY = this.collisionY - this.height * 0.5 - 70;
            this.frameX = Math.floor(Math.random() * 4); 
            this.frameY = Math.floor(Math.random() * 3);
        }

        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.width, this.height, this.spriteX, this.spriteY, this.spriteWidth, this.spriteHeight);
            if (this.game.debug){
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save(); // to limit the canvase setting use save and restore.
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
            
        }
    }

    class Game {
        constructor(canvas){
            this.canvas = canvas;
            this.width = canvas.width;
            this.height = canvas.height;
            this.player = new Player(this);
            this.fps = 144; // leftover delta time make the game not actually 144 fps
            this.timer = 0;
            this.interval = 1000/this.fps;
            this.obstacles = [];
            this.numberOfObstacles = 5;
            this.topMargine = 260; // the space for the bush in the background
            this.debug = true;
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
            window.addEventListener('keydown', e => {
                if (e.key == 'd') this.debug = !this.debug;
                
            });
        }
        render(context, deltaTime){
            if(this.timer > this.interval){
                // animate the next frame
                context.clearRect(0, 0, this.width, this.height); // clear this canvas only before drawing the next frame
                this.obstacles.forEach(obstacle => obstacle.draw(context));
                this.player.draw(context);
                this.player.update();
                this.timer = 0;
            }
            this.timer += deltaTime
            
        }

        checkCollision(a,b){
            const dx = a.collisionX - b.collisionX;
            const dy = a.collisionY - b.collisionY;
            const distance = Math.hypot(dy, dx);
            const sumOfRadii = a.collisionRadius + b.collisionRadius;
            return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy];
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
                    const distanceBuffer = 150; // make sure each obstacle has minimum distance between them
                    const sumOfRadius = testObs.collisionRadius + obstacle.collisionRadius + distanceBuffer;
                    if (distanceBetweenCircle < sumOfRadius){
                        overLap = true;
                    }
                });
                const margine = testObs.collisionRadius * 3; // used for the space between this top and the bottom of the moving area, so that characters can squeez between

                if(!overLap && testObs.spriteX > 0 && testObs.spriteX < this.width - testObs.width && testObs.collisionY > this.topMargine + margine && testObs.collisionY < this.height - margine){
                    this.obstacles.push(testObs);
                }
                attempt++;
            }
        }
    }

    const game = new Game(canvas);
    game.init();

    let lastTime = 0;
    function animate(timeStamp){
        // FSP control
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        // ctx.clearRect(0,0,canvas.width,canvas.height);
        game.render(ctx, deltaTime);
        window.requestAnimationFrame(animate);
    }
    animate(0);
});