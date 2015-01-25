// Game constants
var BUG_SPEEDS = [100,150,200,250,300,350,600,700,800],
    BUG_START_Y = [145,230, 315, 395],
    BUG_START_X = -60,
    PLAYER_START_X = 0,
    PLAYER_START_Y = 39,
    PLAYER_MOVE_X = 101,
    PLAYER_MOVE_Y = 83,
    GEM_START_Y = 39,
    STAR_START_Y = 39,
    MORE_TIME_START_Y = 50,
    GEM_TYPES = [
        { type : 'blue', spritePos : [0, 1425], spriteSize : [94, 110] },
        { type : 'green', spritePos : [0, 1596], spriteSize : [94, 110] },
        { type : 'orange', spritePos : [0, 1767], spriteSize : [94, 110] },
    ],
    NUMBER_OF_COLUMNS = 11,
    NUMBER_OF_ROWS = 6,
    COLUMN_WIDTH = 101;
    ROW_HEIGHT = 101;;

// Generate a random int number in range
var generateRandomInIntRange = function(range) {
    return Math.floor(Math.random()*range);
}

// A GameEntity is base class for render a game entity on the board
var GameEntity = function(pos, spritePos, spriteSize, collisionPosOffset, collisionSize, spriteSpeed, spriteFrames, spriteDir, spriteRenderOnce) {
    this.pos = pos;

    // We can define precisely the the collision square (a sub square in the game entity image)
    this.collisionPosOffset = collisionPosOffset;
    this.collisionSize = collisionSize;

    if (spritePos != null && spriteSize != null) {
        // A sprite can be animated by setting the speed and the frames otherwise it's statics
        this.sprite = new Sprite('images/sprites.png', spritePos, spriteSize, spriteSpeed, spriteFrames, spriteDir, spriteRenderOnce);
    }
}

// Draw the game entity on the screen, required method for game
GameEntity.prototype.render = function () {
    ctx.save();
    ctx.translate(this.pos[0], this.pos[1]);
    this.sprite.render(ctx);
    ctx.restore();
}

/* For debug purpose, we can add a red border to the entity and
*  a yellow border for the collision detection
*/
GameEntity.prototype.addEntityAndCollisionBorder = function() {
    // Add red entity border
    if (this.sprite) {
        ctx.beginPath();
        ctx.rect(this.pos[0], this.pos[1], this.sprite.size[0], this.sprite.size[1]);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Add yellow entity border
    ctx.beginPath();
    ctx.rect(this.pos[0] + this.collisionPosOffset[0], this.pos[1] + this.collisionPosOffset[1], this.collisionSize[0], this.collisionSize[1]);
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// Enemies our player must avoid
var Enemy = function() {
    // Every new bug has a random speed
    this.speed = BUG_SPEEDS[generateRandomInIntRange(BUG_SPEEDS.length)];

    GameEntity.call(this, [BUG_START_X, BUG_START_Y[generateRandomInIntRange(BUG_START_Y.length)]], [0, 1102], [101, 76], [0,0], [97,65]);
}

Enemy.prototype = Object.create(GameEntity.prototype);
Enemy.prototype.constructor = Enemy;

/* Update the enemy's position, required method for game
*  Parameter: dt, a time delta between ticks
*/
Enemy.prototype.update = function(dt) {
    // When the bug is out of right border, it starts outside left border
    if (this.pos[0] > NUMBER_OF_COLUMNS *  PLAYER_MOVE_X) {
        this.pos[0] = BUG_START_X;
    }

    // Move bug by speed. The enemy move at the same speed
    // between computers.
    this.pos[0] = this.pos[0] + this.speed * dt;
}

/* The player is the hero of the game, he can move, have supermower to
*  to destroy the enemies.
*/
var Player = function(x, y) {
    GameEntity.call(this, [x, y], [0, 47], [101, 107], [16,17], [67,76]);

    this.startEffect = false;
}

Player.prototype = Object.create(GameEntity.prototype);
Player.prototype.constructor = Player;

// Because the player could have a star animation, we must update the sprite
Player.prototype.update = function(dt) {
    this.sprite.update(dt);
}

// Apply the star animation around the player
Player.prototype.enableStarEffect = function() {
    this.startEffect = true;

    // Two images are used to create a star animation around the player
    this.sprite = new Sprite('images/sprites.png', [0, 218], [101, 107], 4, [0, 1]);
    setTimeout.call(this, this.disableStarEffect, 5000);
}

// Disable the animation
Player.prototype.disableStarEffect = function() {
    this.startEffect = false;
    this.sprite = new Sprite('images/sprites.png', [0, 47], [101, 107]);
}

/* Handle user input : up, down, left and right
*  which has the effect to move the player on
*  the game board boundaries (user cannot move on water)
*  one step on the requested direction
*/
Player.prototype.handleInput = function(direction) {
    if (!game.isOVer) {
        switch (direction) {
            case "up":
                if (this.pos[1] == (PLAYER_START_Y + PLAYER_MOVE_Y)) {
                // I can't move on water, because I don't swim!
                } else {
                // Move player one block upper
                this.pos[1] = this.pos[1] - PLAYER_MOVE_Y;
                }
                break;
            case "down":
                if (this.pos[1] == PLAYER_START_Y + (PLAYER_MOVE_Y * (NUMBER_OF_ROWS - 1))) {
                // Bottom border
                } else {
                // Move player one block lower
                this.pos[1] = this.pos[1] + PLAYER_MOVE_Y;
                }
                break;
          case "left":
                if (this.pos[0] == 0) {
                // Left border
                } else {
                // Move player one block left
                this.pos[0] = this.pos[0] - PLAYER_MOVE_X;
                }
            break;
          case "right":
                if (this.pos[0] == (PLAYER_START_X + (PLAYER_MOVE_X * (NUMBER_OF_COLUMNS - 1)))) {
                // Right border
                } else {
                // Move player one block right
                this.pos[0] = this.pos[0] + PLAYER_MOVE_X;
                }
                break;
            default:
                return;
        }
    }
}

/* The player can pick up gems to get points, there are three type of Gem
*  Green  : 5 points
*  Blue   : 10 points
*  Orange : 15 points
*/
var Gem = function(pos) {
    // Generate a random gem
    var gemType = GEM_TYPES[generateRandomInIntRange(3)];

    GameEntity.call(this, pos, gemType.spritePos, gemType.spriteSize, [5,12], [83,78]);

    // Points depend on the type of gem
    this.type = gemType.type;
}

Gem.prototype = Object.create(GameEntity.prototype);
Gem.prototype.constructor = Gem;

// The player can pick up the star to get a super power and kill the bugs
var Star = function(pos) {
    GameEntity.call(this, pos, [0, 2787], [101, 99], [13,12], [71,69]);
}

Star.prototype = Object.create(GameEntity.prototype);
Star.prototype.constructor = Star;

// The player can pick up more time to guess what.. add more time to the countdown
var MoreTime = function(pos) {
    GameEntity.call(this, pos, null, null, [10,10], [75,65]);

    // A time reward is between 1 and 5 seconds
    this.timeReward = Math.floor(Math.random() * 5) + 1;
}

MoreTime.prototype = Object.create(GameEntity.prototype);
MoreTime.prototype.constructor = MoreTime;

/* More time render method is overriden because we don't use a sprite but
*  the canvas arc and text to create a round with a number
*/
MoreTime.prototype.render = function() {
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.arc(this.pos[0] + 48, this.pos[1] + 40, 40, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = 'red';
    ctx.font = "bold 32px Arial";
    ctx.fillText(this.timeReward, this.pos[0] + 40, this.pos[1] + 50);
}

/* Game class has all the game logic and game entities
*  The engine call the game methods on collisions
*  and restart
*/
var Game = function() {
}

// Init a new Gem, there is only one gem at time on the board
Game.prototype.startNewGame = function() {
    // All game entities
    this.player = new Player(PLAYER_START_X + (PLAYER_MOVE_X * 5), PLAYER_START_Y + (PLAYER_MOVE_Y * 5));
    this.allEnemies = [];
    this.allEnemiesExplosions = [];
    this.initGem();
    this.initStar();
    this.initMoreTime();

    this.isOVer = false;
    // hide game over over planel
    this.gameOverDiv = document.querySelector('#game-over');
    this.gameOverDiv.style.display = 'none';

    // Init remaining time
    this.remainingTime = 30;
    this.timeSpan = document.getElementById('time');
    this.timeSpan.textContent = this.remainingTime;

    // Init score
    this.score = 0;
    this.scoreSpan = document.getElementById('score');
    this.displayScore();

    this.gameStorage = new GameStorage();

    // Start countdown
    this.countdown();

    this.displayYourLastScoresAndWorlwideBestScores();
}


// Create a new Gem, there is only one gem at time on the board
Game.prototype.initGem = function() {
    this.gem = new Gem(this.generateRandomPositionOnThePlayableBoard(GEM_START_Y));
}

// Create a new Star, there is only one star at time on the board
Game.prototype.initStar = function() {
    this.star = new Star(this.generateRandomPositionOnThePlayableBoard(STAR_START_Y));
}

// Create new MoreTime, there is only one more time at time on the board
Game.prototype.initMoreTime = function() {
    this.moreTime = new MoreTime(this.generateRandomPositionOnThePlayableBoard(MORE_TIME_START_Y));
}

/* When the player pick up gem, we can call this method
*  to update the score
*/
Game.prototype.addScoreFromGemAndInitGem = function() {
    if (this.gem.type === 'green') {
        this.score = this.score + 5;
    }
    else if (this.gem.type === 'blue') {
        this.score = this.score + 10;
    }
    else if (this.gem.type === 'orange') {
        this.score = this.score + 15;
    }

    this.displayScore();

    this.initGem();
}

/* When the player kill a bug, we can call this method
*  to update the score
*/
Game.prototype.addScoreFromBug = function() {
    this.score++;

    this.displayScore();
}

/* When the player pick up more time, we can call this method
*  to update the the timeout and init more time
*/
Game.prototype.addMoreTimeAndInitMoreTime = function() {
    this.remainingTime += this.moreTime.timeReward;

    this.initMoreTime();
}

/* When the player pick up the star, we can call this method
*  to enable the player star animation and init the star
*/
Game.prototype.enableStarEffectAndInitStar = function() {
    this.initStar();

    this.player.enableStarEffect();
}

// Display the score
Game.prototype.displayScore = function() {
    this.scoreSpan.textContent = this.score;
}

// Display the remaining time
Game.prototype.displayTime = function() {
    this.timeSpan.textContent = this.remainingTime;
}

/* Every 7 sec we init the rewards, if the player is blocked he can still
* get the star and kill bugs
*/
Game.prototype.initRewardsRandomly = function() {
    if (this.remainingTime % 7 == 0) {
        this.initGem();
        this.initStar();
        this.initMoreTime();
    }
}

/* Display best scores from DynamoDB NoSQL DB and
*  Display last scores from local storage
*/
Game.prototype.displayYourLastScoresAndWorlwideBestScores = function() {
    // Display your last scores
    this.yourLastScoresUl = document.querySelector("#your-last-scores");
    this.yourLastScoresUl.innerHTML = '';
    this.gameStorage.getLocalScores().forEach(function (i) {
        this.yourLastScoresUl.insertAdjacentHTML('afterbegin', '<li>' + i.name + ' ' + i.score + '</li>');
    }, this);

    // Display worldwide best scores
    this.bestScoresUl = document.querySelector("#best-scores");
    this.bestScoresUl.innerHTML = '';
    this.gameStorage.getRemoteScores(function(scores) {
        scores.forEach(function(i) {
            this.bestScoresUl.insertAdjacentHTML('afterbegin', '<li>' + i.name + ' ' + i.score + '</li>');
        }, this);
    }, this);
}

/* On game over, we freeze the game, ennemies and player are stopped
*  Countdown is also stopped
*/
Game.prototype.gameOver = function() {
    this.isOVer = true;

    this.stopCountDown();

    // Stop enemies and player
    this.player.speed = 0;
    for(var i=0; i<this.allEnemies.length; i++) {
        this.allEnemies[i].speed = 0;
    }

    // Display "game over" over planel
    this.gameOverDiv.style.display = '';
}

/* When the countdown is over, the game is.. over!
*/
Game.prototype.countdown = function() {
    this.remainingTime--;
    this.displayTime();

    if (this.remainingTime == 0) {
        this.gameOver();
        return;
    }

    this.initRewardsRandomly();

    this.countdownTimeoutId = setTimeout.call(this, this.countdown, 1000);
}

// Stop the countdown
Game.prototype.stopCountDown = function() {
    clearTimeout(this.countdownTimeoutId);
}

// Generate a random position in the board where the player can go
Game.prototype.generateRandomPositionOnThePlayableBoard = function(entityStartY) {
    var x = PLAYER_MOVE_X * generateRandomInIntRange(NUMBER_OF_COLUMNS) + 3;
    var y = entityStartY + PLAYER_MOVE_Y + (PLAYER_MOVE_Y * (generateRandomInIntRange(NUMBER_OF_ROWS -1)));

    return [x, y];
}

// Save score
Game.prototype.saveScore = function() {
    var playerName = document.getElementById('playerName').value;
    this.gameStorage.saveScore(playerName, this.score);
}

// Add enemy randomly
Game.prototype.addEnemy = function(gameTime) {
    // It gets harder over time by adding enemies using this
    // equation: 1-.999^gameTime
    if (!this.isOVer) {
        if(Math.random() < 1 - Math.pow(.999, gameTime)) {
            this.allEnemies.push(new Enemy());
        }
    }
}

// Add enemy randomly
Game.prototype.handleCollisionWithStar = function(enemyIndex) {
    if (this.player.startEffect)
    {
        this.addScoreFromBug();

        // Add an explosion
        this.allEnemiesExplosions.push(new GameEntity([
            this.allEnemies[enemyIndex].pos[0],
            this.allEnemies[enemyIndex].pos[1]],
            [0, 1269], [101, 79], null, null, 16, [0, 1, 2, 3, 4], null, true)
        );

        // Remove the enemy
        this.allEnemies.splice(enemyIndex, 1);
    }
    else
    {
        this.gameOver();
    }
}


var game = new Game();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    game.player.handleInput(allowedKeys[e.keyCode]);
});