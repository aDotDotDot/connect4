const mainState = {
    preload: function() { 
        game.load.image('bird', 'assets/bird_filler.png');
        game.load.image('pipe', 'assets/pipe_filler.png');
        //https://opengameart.org/content/brick-texture
        game.load.image('bricks', 'assets/bricks.png');
        //based on art by Hansjörg Malthaner : http://opengameart.org/users/varkalandar
        game.load.image('star', 'assets/throwing.png');

        //assets from https://opengameart.org/content/flappy-duck-sprite-sheets
        //author : http://bevouliin.com/
        //LICENSE http://static.opengameart.org/OGA-BY-3.0.txt
        game.load.spritesheet('flying', 'assets/flying.png', 50, 36, 8);
        game.load.spritesheet('hit', 'assets/hit.png', 50, 40, 2);
        
        game.load.image('background', 'assets/background_flappy.png');

        game.load.audio('jump', 'assets/jump.wav');
        game.load.audio('bump', 'assets/bump.wav');
    },

    create: function() { //we need acces to `this` so no ()=>
        game.add.tileSprite(0, 0, 400, 490, 'background');
        game.stage.backgroundColor = '#71c5cf';
        game.physics.startSystem(Phaser.Physics.ARCADE);//we will hit things :)

        /* Bird */
        //initial position x=100 and y=245 (middle vertically)
        this.bird = game.add.sprite(100, 245, 'flying');
        const fly = this.bird.animations.add('fly');
        this.bird.animations.play('fly', 30, true);

        this.bird.anchor.setTo(-0.2, 0.5);//needed to change the origin point for the rotation

        //Needed for: movements, gravity, collisions, yeah physics !
        game.physics.arcade.enable(this.bird);

        //Not a great bird, it falls all the time
        this.bird.body.gravity.y = 1000;  

        //We will move the bird up when the space key is hit
        const spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);
        game.input.onTap.add(this.jump, this);


        /* Pipes/Obstacles */
        this.pipes = game.add.group();
        //creating a new obstacle every 1.5s 
        this.timer = game.time.events.loop(1500, this.addPipesColumn, this); 

        /* Score */
        this.score = 0;
        this.scoreText = game.add.text(20, 20, 'Score : 0', { font: "15px Arial", fill: "#253031" });
        this.hiScore = 0;
        if(localStorage.flappy_hi_score)
            this.hiScore = localStorage.flappy_hi_score;
        this.highScoreText = game.add.text(20, 40, `Best : ${this.hiScore}`, { font: "15px Arial Bold", fill: "#315659" });

        /* Sound */
        this.jumpSound = game.add.audio('jump');
        this.bumpSound = game.add.audio('bump');

        /* Pause */
        const pauseKey = game.input.keyboard.addKey(Phaser.KeyCode.P);
        pauseKey.onDown.add(this.togglePause, this);

    },

    update: function(){
        if (this.bird.angle < 20)
            this.bird.angle += 1;//makes the bird looking down when falling
        
        //Either your bird is really bad at flying, or really really good
        if (this.bird.y < 0 || this.bird.y > 490)
            this.restartGame();
        //Next, if we hit a pipe, we animate the bird to fall down
        //game.physics.arcade.overlap(this.bird, this.pipes, this.restartGame, null, this);
        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
        this.bird.bringToTop();

        /*this.pipes.forEach((p) => {
            p.angle += Math.floor(Math.random()*18);
        }, this);*/
    },
    //Make the bird jump, or fly, I don't know, something like going up
    jump: function() {
        //dead bird can't fly
        if (this.bird.alive === false)
            return;
        if(game.paused)
            game.paused = false;
        //bump up
        this.bird.body.velocity.y = -350;
        //play the sound
        this.jumpSound.play();
        //We animate the bird to make it look upward
        const animation = game.add.tween(this.bird);
        //Not instantly, so we change the angle of the bird to -20° in 100 milliseconds
        animation.to({angle: -20}, 100);
        //Then, we start the animation
        animation.start();
    },

    //Restart the game, when inevitably our bird will die
    restartGame: function() {
        //update the high score (if we beat it)
        if(this.score > this.hiScore){
            localStorage.flappy_hi_score = this.score;
            this.hiScore = this.score;
        }
        //Start the 'main' state, which restarts the game
        game.state.start('main');
    },
    //we'll use this repeatedly to add an obstacle 
    addPipe: function(x, y) {
        //We create a pipe at the position x and y
        const pipe = game.add.sprite(x, y, 'bricks');
        //pipe.anchor.setTo(0.5, 0.5);
        //We add the pipe to the group of pipes
        this.pipes.add(pipe);
        //We enable physics on the pipe, it will have to collide with the bird
        game.physics.arcade.enable(pipe);
        //The pipe is moving left
        pipe.body.velocity.x = -200; 
        //Then, if the pipe is no longer visible, we let the game kill it automatically 
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },
    //and we will need to create full columns of obstacles, with a small space for the bird
    addPipesColumn: function() {
        //The hole will be between 1 and 5 so we can have 2 spaces
        const hole = 1 + Math.floor(Math.random() * 5);
        //We add the pipes (50x50 px so 8 of them, minus 2 for the hole )
        // With one big hole at position 'hole' and 'hole + 1'
        for (let i = 0; i < 10; i++)
            if (i != hole && i != hole + 1) 
                this.addPipe(400, i * 50);//adds the pipe near the right of the game
        
        //We can update the score now
        this.score += 1;
        this.scoreText.text = `Score : ${this.score}`;  
    },
    togglePause: function(){
        game.paused = !game.paused;
    },
    hitPipe: function() {
        //We're already dead, we can't be dying another time !
        if (this.bird.alive === false)
            return;
        //First hit, we tell our bird he's already dead
        this.bird.alive = false;
        //and we hit something, better use sound to tell everyone
        this.bumpSound.play();
        //animating the hit
        this.bird.loadTexture('hit');
        const hit = this.bird.animations.add('hit');
        this.bird.animations.play('hit', 5, true);


        //The game is finished, we stop the timer for the obstacles
        game.time.events.remove(this.timer);
        //And we stop the movement of the existing pipes
        this.pipes.forEach((p) => {
            p.body.velocity.x = 0;
        }, this);
    }, 
};

//Initialize Phaser, fixed width and height with no resizing auto
const game = new Phaser.Game(400, 490);

//Add the 'mainState' and call it 'main'
game.state.add('main', mainState); 

//Let's play !
game.state.start('main');