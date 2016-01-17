'use strict';

/**
 * Game store is used to store and retrieve scores locally (localStorage)
 * @constructor
 */
var GameStorage = function() {
};

/**
 * Save  score in local storage
 * @param  {Number} score - Score
 */
GameStorage.prototype.saveScoreInLocalStorage = function(score) {
    localStorage.setItem('yourBestScore', score);
};

/**
 * Get score from local storage
 * @return {Number} Score
 */
GameStorage.prototype.getYourBestScoreFromLocalStorage = function() {
    var yourBestScore = localStorage.getItem('yourBestScore');

    if (yourBestScore === null) {
        return 0;
    } else {
        return parseInt(yourBestScore);
    }
};