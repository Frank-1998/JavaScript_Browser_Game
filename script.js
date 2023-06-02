
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
    ctx.font = '40px Helvetica';
    ctx.textAlign = 'center';

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
        update(){
            // this method is empty but needed for render in Game class.
        }
    }

    class Egg {
        constructor(game){
            this.game = game;
            this.collisionRadius = 40;
            this.margin = this.collisionRadius * 2;
            this.collisionX = this.margin + (Math.random() * (this.game.width - this.margin * 2));
            this.collisionY = this.game.topMargine + (Math.random() * (this.game.height - this.game.topMargine - this.margin));
            this.image = document.getElementById('egg');
            this.spriteWidth = 110;
            this.spriteHeight = 135;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX; 
            this.spriteY;
            this.hatchTimer = 0;
            this.hatchInterval = 5000;
            this.markedForDeletion = false;
        }

        draw(context){
            context.drawImage(this.image, this.spriteX, this.spriteY);
            if (this.game.debug){
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save(); // to limit the canvase setting use save and restore.
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
                // hatch time for debug
                const displayTimer = (this.hatchTimer * 0.001).toFixed(0);
                context.fillText(displayTimer, this.collisionX, this.collisionY - this.collisionRadius * 2.5); 
            }
        }
        update(deltaTime){
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 30;
            // collision handling
            let collisionObjs = [this.game.player, ...this.game.obstacles, ...this.game.enemies]; // all objects that will collide with egg, ... is spride operator
            collisionObjs.forEach(object =>{
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object); // check collision status between egg as all objects that can collide with egg
                if (collision){
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }
            });
            // hatching handling
            if (this.hatchTimer > this.hatchInterval){
                this.game.hatchlings.push(new Larva(this.game, this.collisionX, this.collisionY));
                this.markedForDeletion = true;
                this.game.removeGameObjects();
            } else {
                this.hatchTimer += deltaTime;
            }

        }
    }

    class Larva {
        constructor(game, x, y){
            this.game = game;
            this.collisionX = x;
            this.collisionY = y;
            this.collisionRadius = 30;
            this.image = document.getElementById('larva');
            this.spriteWidth = 150;
            this.spriteHeight = 150;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.spriteX;
            this.spriteY;
            this.speedY = 1 + Math.random();
            this.markedForDeletion = false;
            this.frameX = 0;
            this.frameY = Math.floor(Math.random() * 2); // give random number between 0 and 1
        }

        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
            if (this.game.debug){ // for debugging, draw the collision circle
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save(); // to limit the canvase setting use save and restore.
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }

        update(){
            this.collisionY -= this.speedY;
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height * 0.5 - 50;
            // move to safty
            if (this.collisionY < this.game.topMargine){
                this.markedForDeletion = true;
                this.game.removeGameObjects();
                this.game.score++;
            }
            // collisons
            let collisionObjs = [this.game.player, ...this.game.obstacles]; // all objects that will collide with egg, ... is spride operator
            collisionObjs.forEach(object =>{
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object); // check collision status between egg as all objects that can collide with egg
                if (collision){
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }
            });
            // collison with enemies
            this.game.enemies.forEach(enemy =>{
                if (this.game.checkCollision(this, enemy)[0]){
                    this.markedForDeletion = true;
                    this.game.removeGameObjects();
                    this.game.lostHatchlings++;
                }
            });
        }
    }

    class Enemy {
        constructor(game){
            this.game = game;
            this.collisionRadius = 30;
            this.speedX = Math.random() * 3 + 0.5;
            this.image = document.getElementById('toad');
            this.spriteWidth = 140;
            this.spriteHeight = 260;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5; // enemy will appear from right side
            this.collisionY = this.game.topMargine + (Math.random() * (this.game.height - this.game.topMargine));
            this.spriteX;
            this.spriteY;

        }

        draw(context){
            context.drawImage(this.image, this.spriteX, this.spriteY);
            if (this.game.debug){ // for debugging, draw the collision circle
                context.beginPath();
                context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                context.save(); // to limit the canvase setting use save and restore.
                context.globalAlpha = 0.5;
                context.fill();
                context.restore();
                context.stroke();
            }
        }

        update(){
            this.spriteX = this.collisionX - this.width * 0.5;
            this.spriteY = this.collisionY - this.height + 40;
            this.collisionX -= this.speedX;
            if(this.spriteX + this.width < 0){
                this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5; // give enemy random delay before re-appear from the right side
                this.collisionY = this.game.topMargine + (Math.random() * (this.game.height - this.game.topMargine)); // restrict enemy vertical position
            }
            let collisionObjs = [this.game.player, ...this.game.obstacles]; // all objects that will collide with egg, ... is spride operator
            collisionObjs.forEach(object =>{
                let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object); // check collision status between egg as all objects that can collide with egg
                if (collision){
                    const unit_x = dx / distance;
                    const unit_y = dy / distance;
                    this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
                    this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
                }
            });
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
            this.eggTimer = 0;
            this.eggInterval = 1000;
            this.obstacles = [];
            this.eggs = [];
            this.numberOfObstacles = 5;
            this.maxEggs = 10;
            this.topMargine = 260; // the space for the bush in the background
            this.debug = true;
            this.gameObjects = [];
            this.enemies = [];
            this.hatchlings = [];
            this.score = 0;
            this.lostHatchlings = 0;
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
                this.gameObjects = [...this.eggs, ...this.obstacles, this.player, ...this.enemies, ...this.hatchlings];
                // sort game object array based on the vertical position
                this.gameObjects.sort((a, b) =>{
                    return a.collisionY - b.collisionY;
                });
                this.gameObjects.forEach(object => {
                    object.draw(context);
                    object.update(deltaTime);
                });
                
                this.timer = 0;
            }
            this.timer += deltaTime

            // add eggs periodically
            if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs){
                this.addEgg();
                this.eggTimer = 0;
            } else {
                this.eggTimer += deltaTime;
            }
            
        }

        /**
         * 
         * @param {object} a - game objects, player, obstecal etc.
         * @param {object} b - same as a
         * @returns {Array} [ifCollide(boolean), distance between 2 collision circle points, sum of collision circle radii, horizontal distance, vertical distance] 
         */
        checkCollision(a,b){
            const dx = a.collisionX - b.collisionX;
            const dy = a.collisionY - b.collisionY;
            const distance = Math.hypot(dy, dx);
            const sumOfRadii = a.collisionRadius + b.collisionRadius;
            return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy];
        }

        addEgg(){
            this.eggs.push(new Egg(this));
        }

        addEnemy(){
            this.enemies.push(new Enemy(this));
        }

        removeGameObjects(){
            this.eggs = this.eggs.filter(object => !object.markedForDeletion); // replace old egg array with all the eggs that has markedForDeletion set as false
            this.hatchlings = this.hatchlings.filter(object => !object.markedForDeletion); // remove all larva objcets that can be removed
        }

        init(){ // init all the obstacles and make sure they don't overlap
            for(let i = 0; i < 3; i++){
                this.addEnemy();
                
            }
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