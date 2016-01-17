'use strict';

/*global Resources */

(function() {
    /**
     * This sprite animation class has been take from here :
     * Website : http://jlongster.com/Making-Sprite-based-Games-with-Canvas
     * GitHub : https://github.com/jlongster/canvas-game-bootstrap
     * @param {String} Url - Url of the sprite
     * @param {Number[]} Position of the entity on the sprite [x, y]
     * @param {Number[]} Size of the entity on the sprite [width, height]
     * @param {Number} speed - Speed in frames/sec for animating
     * @param {Number[]} frames - An array of frame indexes for animating: [0, 1, 2, 1]
     * @param {String} dir - Which direction to move in the sprite map when animating: 'horizontal' (default) or 'vertical'
     * @param {Boolean} once - True to only run the animation once, defaults to false
     * @constructor
     * @memberof Sprite
     */
    function Sprite(url, pos, size, speed, frames, dir, once) {
        this.pos = pos;
        this.size = size;
        this.speed = typeof speed === 'number' ? speed : 0;
        this.frames = frames;
        this._index = 0;
        this.url = url;
        this.dir = dir || 'horizontal';
        this.once = once;
    }

    Sprite.prototype = {

        /**
         * Updat the sprite
         * @param  {Number} A time delta between ticks
         * @memberof Sprite
         */
        update: function(dt) {
            this._index += this.speed*dt;
        },

        /**
         * Render the sprite on the canvas
         * @param  {Canvas} Canvas
         * @memberof Sprite
         */
        render: function(ctx) {
            var frame;

            if (this.speed > 0) {
                var max = this.frames.length;
                var idx = Math.floor(this._index);
                frame = this.frames[idx % max];

                if (this.once && idx >= max) {
                    this.done = true;
                    return;
                }
            } else {
                frame = 0;
            }

            var x = this.pos[0];
            var y = this.pos[1];

            if (this.dir == 'vertical') {
                y += frame * this.size[1];
            } else {
                x += frame * this.size[0];
            }

            ctx.drawImage(Resources.get(this.url), x, y, this.size[0], this.size[1], 0, 0, this.size[0], this.size[1]);
        }
    };

    window.Sprite = Sprite;
})();