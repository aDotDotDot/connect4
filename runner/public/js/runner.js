const mobileAndTabletcheck = () => {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };
WebFontConfig = {

    //  'active' means all requested fonts have finished loading
    //  We set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.
    active: function() { game.time.events.add(Phaser.Timer.SECOND, startText, this); },

    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
      families: ['Inconsolata']
    }

};
const mainState = {
    preload: function() { 
        if(mobileAndTabletcheck()){
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            
        }
        game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        game.load.image('runner', 'assets/ubuntu_runner.png');
        game.load.image('runner_background', 'assets/background_runner.png');

        game.load.image('arch_obstacle', 'assets/arch_runner.png');
        game.load.image('apple_obstacle', 'assets/apple_runner.png');
        game.load.image('debian_obstacle', 'assets/debian_runner.png');
        game.load.image('gentoo_obstacle', 'assets/gentoo_runner.png');
        game.load.image('windows_obstacle', 'assets/windows_runner.png');
        game.load.image('arch_background', 'assets/arch_background_runner.png');
        game.load.image('apple_background', 'assets/apple_background_runner.png');
        game.load.image('debian_background', 'assets/debian_background_runner.png');
        game.load.image('gentoo_background', 'assets/gentoo_background_runner.png');
        game.load.image('windows_background', 'assets/windows_background_runner.png');

        game.load.audio('jump', 'assets/jump.wav');

        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
    },

    create: function() { //we need acces to `this` so no ()=>
        game.stage.backgroundColor = '#71c5cf';
        game.physics.startSystem(Phaser.Physics.ARCADE);//we will hit things :)
        this.possible_obstacles = ['arch_obstacle',
                                   'apple_obstacle',
                                   'debian_obstacle',
                                   'gentoo_obstacle',
                                   'windows_obstacle'];
        //initial position 
        this.runner = game.add.sprite(100, this.game.height - 25, 'runner');
        const background = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'runner_background');

        //Needed for: movements, gravity, collisions, yeah physics !
        game.physics.arcade.enable(this.runner);
        this.runner.anchor.setTo(0.5, 0.5);
        this.runner.body.gravity.y = 1000;
        this.runner.body.collideWorldBounds = true;
        this.runner.body.bounce.y = 0;
        //this.runner.body.velocity.x = 150;

        //jump
        const spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);
        game.input.onTap.add(this.jump, this);

        /* Pipes/Obstacles */
        this.obstacles = game.add.group();
        //creating a new obstacle every 2.5s 
        //this.timer = game.time.events.loop(2500, this.addObstacles, this); 

        /* Score */
        this.score = 0;
        this.scoreText = game.add.text(20, 20, 'Score : 0', { font: "15px Inconsolata", fill: "#ffffff" });
        this.hiScore = 0;
        if(localStorage.runner_hi_score)
            this.hiScore = localStorage.runner_hi_score;
        this.highScoreText = game.add.text(20, 40, `Best : ${this.hiScore}`, { font: "13px Inconsolata", fontWeight: 'bold', fill: "#ffffff" });

        /* Sound */
        this.jumpSound = game.add.audio('jump');
        /* Pause */
        const pauseKey = game.input.keyboard.addKey(Phaser.KeyCode.P);
        pauseKey.onDown.add(this.togglePause, this);
        this.cpt_total = 0;
        game.paused = true;
        this.addObstacles();
    },

    update: function(){
        //if we hit an obstacle, restart
        game.physics.arcade.overlap(this.runner, this.obstacles, this.hitObstacle, null, this);
        //game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
        this.runner.bringToTop();
        this.runner.angle += 5;
    },
    //Make the runner jump
    jump: function() {
        if(game.paused)
            game.paused = false;
        if (this.runner.alive === false)
            return;
        //bump up
        if((this.game.height - this.runner.body.y) == 50){
            this.runner.body.velocity.y = -550;
            //play the sound
            this.jumpSound.play();
        }
        /*
        //We animate the bird to make it look upward
        const animation = game.add.tween(this.runner);
        //Not instantly, so we change the angle of the bird to -20° in 100 milliseconds
        animation.to({angle: -20}, 100);
        //Then, we start the animation
        animation.start();
        */
    },

    //Restart the game, when we die
    restartGame: function() {
        //update the high score (if we beat it)
        //Start the 'main' state, which restarts the game
        game.state.start('main');
    },
    //we'll use this repeatedly to add an obstacle 
    addObstacle: function(x, y, cpt) {
        //We create an obstacle at the position x and y
        let ob_name = this.possible_obstacles[Math.floor(Math.random()*this.possible_obstacles.length)];
        const obstacle = game.add.sprite(x, y, ob_name);
        //obstacle.anchor.setTo(0.5, 0.5);
        this.obstacles.add(obstacle);
        //We enable physics on it
        game.physics.arcade.enable(obstacle);
        //moving left
        this.cpt_total+=1;
        obstacle.body.velocity.x = Math.max(-300 - this.cpt_total*5, -900); 
        //Then, if no longer visible, we let the game kill it automatically 
        obstacle.checkWorldBounds = true;
        if(cpt==0)//the last will launch a new wave when dead
            obstacle.events.onOutOfBounds.add(this.addObstacles, this);

        obstacle.outOfBoundsKill = true;
    },
    //and we will need to create sometimes mores obstacles
    addObstacles: function() {
        let max_ob = 6;
        if(this.score > 3000)
            max_ob = 5;
        if(this.score > 4000)
            max_ob = 3;
        const ob = 1 + Math.floor(Math.random()*4);
        let ob_y = this.game.height - 50;
        if(this.score >= 5000 && Math.random() < 0.35)
            ob_y -= 100;//air type ennemy
        for (let i = 0; i < ob; i++){
            this.addObstacle(this.game.width - ob*50 + i * 50, ob_y, ob -1 - i);//adds the obstacle near the right side of the game
        }
        //We can update the score now
        this.score += ob*50;
        this.scoreText.text = `Score : ${this.score}`;
        game.score = this.score;
        game.hiScore = this.hiScore;
    },
    togglePause: function(){
        game.paused = !game.paused;
    },
    hitObstacle: function(current_runner, current_obstacle) {
        if(this.score > this.hiScore){
            localStorage.runner_hi_score = this.score;
            this.hiScore = this.score;
            game.hiScore = this.hiScore;
        }
        switch(current_obstacle.key){
            case 'arch_obstacle':
                game.state.start('go_arch');
            break;
            case 'apple_obstacle':
                game.state.start('go_apple');
            break;
            case 'gentoo_obstacle':
                game.state.start('go_gentoo');
            break;
            case 'debian_obstacle':
                game.state.start('go_debian');
            break;
            case 'windows_obstacle':
                game.state.start('go_windows');
            break;
            default:
                this.restartGame();
            break;
        }
        //this.restartGame();
    },
};

//Initialize Phaser, fixed width and height with no resizing auto
const game = new Phaser.Game(800, 300);

//Add the 'mainState' and call it 'main'
game.state.add('main', mainState); 
//GameOverState
const gameoverState_windows = {
    create: function () {
        const background = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'windows_background');
    },
    update: function () {
        game.input.onTap.addOnce(function () {
        game.state.start('main');});
    }
};
const gameoverState_apple = {
    create: function () {
        const background = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'apple_background');
        const gameoverLabel = stateText = game.add.text(265, 115, ' ', {font: '12px Incosolata', fontWeight: 'bold', fill: '#000000'});
        const gameoverLabel2 = stateText2 = game.add.text(270, 135, ' ', {font: '10px Inconsolata', fill: '#000000'});

        //stateText.anchor.setTo(0.5, 0.5);
    },
    update: function () {
        const txt = `Your copy of "Game Over" is more than 2 months old`;
const txt2 = `Would you like to upgrade to "Game Over XS" ?
It's almost the same, but more expensive,
and you will need to buy another one in two weeks`;
        stateText.text = txt;
        stateText.visible = true;
        stateText2.text = txt2;
        stateText2.visible = true;
        game.input.onTap.addOnce(function () {
        game.state.start('main');});
    }
};
const gameoverState_arch = {
    create: function () {
        const background = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'arch_background');
        const gameoverLabel = stateText = game.add.text(400, 20, ' ', {font: '16px Incosolata', fill: '#F2F2F2'});
        //stateText.anchor.setTo(0.5, 0.5);
    },
    update: function () {
const txt = `$ Game-Over
 Error : failed to commit transaction
 (invalid or corrupted package "Game-Over")

$ cd score && make install && score

 Current score : ${game.score}
 Best score : ${game.hiScore}


 Click to restart

`;
        stateText.text = txt;
        stateText.visible = true;
        game.input.onTap.addOnce(function () {
        game.state.start('main');});
    }
};
const gameoverState_gentoo = {
    create: function () {
        const background = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'gentoo_background');
        const gameoverLabel = stateText = game.add.text(400, 20, ' ', {font: '16px Incosolata', fill: '#F2F2F2'});
        //stateText.anchor.setTo(0.5, 0.5);
    },
    update: function () {
        const txt = `$ Game-Over
 Error ! "Game-Over" not found
 Please compile it yourself

$ cd score && make install && score

 Current score : ${game.score}
 Best score : ${game.hiScore}


 Click to restart

`;
        stateText.text = txt;
        stateText.visible = true;
        game.input.onTap.addOnce(function () {
        game.state.start('main');});
    }
};
const gameoverState_debian = {
    create: function () {
        const background = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'debian_background');
        const gameoverLabel = stateText = game.add.text(300, 20, ' ', {font: '16px Incosolata', fill: '#F2F2F2'});
        //stateText.anchor.setTo(0.5, 0.5);
    },
    update: function () {
        const txt = `$ Game-Over
Command 'Game-Over' not found, but can be installed with:
sudo apt install Game-Over        

$ sudo apt install score && score

Current score : ${game.score}
Best score : ${game.hiScore}

Click to restart

`;
        stateText.text = txt;
        stateText.visible = true;
        game.input.onTap.addOnce(function () {
        game.state.start('main');});
    }
};
game.state.add('go_windows', gameoverState_windows);
game.state.add('go_debian', gameoverState_debian);
game.state.add('go_arch', gameoverState_arch);
game.state.add('go_gentoo', gameoverState_gentoo);
game.state.add('go_apple', gameoverState_apple);

//Let's play !
game.state.start('main');
function startText(){
    text = game.add.text(game.world.centerX, game.world.centerY, "Click to start");
    text.anchor.setTo(0.5);

    text.font = 'Inconsolata';
    text.fontSize = 60;
    text.fill = '#ffffff';
    text.visible = false;
}
function resizeGame(){
    const pct = (parseInt(document.getElementById('myRange').value)/100);
    game.scale.setUserScale(pct, pct, 0, 0);
}