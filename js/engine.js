/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */

    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        gameTime = 0,
        lastTime;

    // By changing the number of columns and number of rows,
    // we can expand or shrink the board
    var gameDiv = document.querySelector("#game");
    canvas.width = COLUMN_WIDTH * NUMBER_OF_COLUMNS;
    canvas.height = ROW_HEIGHT * NUMBER_OF_ROWS;
    gameDiv.appendChild(canvas);

    // Player can restart by pressing the restart button
    document.getElementById("restart").addEventListener("click", function( event ) {
        init();
    }, false);

    // Player can save his score and restart the game by pressing the save score and restart button
    document.getElementById("saveScoreAndRestart").addEventListener("click", function( event ) {
        game.saveScore();

        init();
    }, false);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Uncomment to display useful debug information */
        //debugMode();

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    };

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();

        // Game time is used to add more bugs over the time
        gameTime = 0;

        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        gameTime += dt;

        updateEntities(dt);

        game.addEnemy(gameTime);

        checkCollisions();
    }

    /* Check collisions between :
    *  Player and Enemies
    *   - Player has star effect : bug is destroyed
    *   - Player has no star effect : game over
    *  Player and Star : Get star effect
    *  Player and Gem : Get points
    *  Player and MoreTime : Get more times
    */
    function checkCollisions() {
        for(var i=0; i<game.allEnemies.length; i++) {
            // Check if player collides with an enemy
            if (entitiesCollides(game.allEnemies[i], game.player)) {
                game.handleCollisionWithStar(i);
                break;
            }
        }

        // Check if player pick up a gem
        if (entitiesCollides(game.gem, game.player))
        {
            game.addScoreFromGemAndInitGem();
        }

        // Check if player pick up the star
        if (entitiesCollides(game.star, game.player))
        {
            game.enableStarEffectAndInitStar();
        }

        // Check if player pick up more time
        if (entitiesCollides(game.moreTime, game.player))
        {
            game.addMoreTimeAndInitMoreTime();
        }
    }

    // Check if two entities collides
    function entitiesCollides(entity1, entity2) {
        return boxCollides(
            entity1.pos[0] + entity1.collisionPosOffset[0],
            entity1.pos[1] + entity1.collisionPosOffset[1],
            entity1.collisionSize[0],
            entity1.collisionSize[1],
            entity2.pos[0] + entity2.collisionPosOffset[0],
            entity2.pos[1] + entity2.collisionPosOffset[1],
            entity2.collisionSize[0],
            entity2.collisionSize[1]
        );
    }

    // Check if the boxes collide
    function boxCollides(box1X, box1Y, box1Width, box1Height, box2X, box2Y, box2Width, box2Height) {
        return collides(box1X, box1Y,
                        box1X + box1Width, box1Y + box1Height,
                        box2X, box2Y,
                        box2X + box2Width, box2Y + box2Height);
    }

    /* r is the x coordinate of the right side of box 1 and x2 is the x coordinate of the left side of box 2,
    *  if r <= x2 is true then there's a gap and no matter any other positions or sizes of the boxes there cannot be an overlap,
    *  so there is no collision. There are 4 checks: one for each sides of the boxes. If there's ever a gap: no collision.
    *  more information here : http://jlongster.com/Making-Sprite-based-Games-with-Canvas
    */
    function collides(x, y, r, b, x2, y2, r2, b2) {
        return !(r <= x2 || x > r2 ||
                 b <= y2 || y > b2);
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        game.player.update(dt);

        game.allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });

        // Update all the explosions
        for(var i=0; i<game.allEnemiesExplosions.length; i++) {
            game.allEnemiesExplosions[i].sprite.update(dt);

            // Remove if animation is done
            if(game.allEnemiesExplosions[i].sprite.done) {
                game.allEnemiesExplosions.splice(i, 1);
                i--;
            }
        }
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 4 of stone
                'images/stone-block.png',   // Row 2 of 4 of stone
                'images/stone-block.png',   // Row 3 of 4 of stone
                'images/stone-block.png',   // Row 4 of 4 of grass
                'images/grass-block.png'    // Row 1 of 1 of grass
            ],
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < NUMBER_OF_ROWS; row++) {
            for (col = 0; col < NUMBER_OF_COLUMNS; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions of the game entities
     */
    function renderEntities() {
        game.allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        game.allEnemiesExplosions.forEach(function(explosion) {
            explosion.render();
        });

        game.player.render();
        game.gem.render();
        game.star.render();
        game.moreTime.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        game.startNewGame();
    }

    /* This is the debug mode, it could be used to understand the collision system
    *  A a red border is added to the game entities and a yellow border for
    *  the collision detection
    */
    function debugMode() {
        game.player.addEntityAndCollisionBorder();
        game.allEnemies.forEach(function(enemy) {
            enemy.addEntityAndCollisionBorder();
        });
        game.gem.addEntityAndCollisionBorder();
        game.star.addEntityAndCollisionBorder();
        game.moreTime.addEntityAndCollisionBorder();
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     * all
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/sprites.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);