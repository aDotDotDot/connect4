const mobileAndTabletcheck = () => {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };
const mainState = {
    preload: function() { 
        if(mobileAndTabletcheck()){
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            game.scale.pageAlignHorizontally = true;
            game.scale.pageAlignVertically = true;
            game.scale.forcePortrait = true;
        }
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
        
        game.paused = true;
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
        if(game.paused)
            game.paused = false;
        //dead bird can't fly
        if (this.bird.alive === false)
            return;
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
        const hole = 1 + Math.floor(Math.random() * 7);
        //We add the pipes (50x50 px so 8 of them, minus 2 for the hole )
        // With one big hole at position 'hole' and 'hole + 1'
        for (let i = 0; i < 10; i++){
            delta = ((i<=hole)?-12:13);
            if (i != hole && i != hole + 1)
                this.addPipe(400, i * 50 + delta);//adds the pipe near the right side of the game
        }
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