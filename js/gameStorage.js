// Game store is used to store and retrieve scores locally (localStorage)
var GameStorage = function() {
}

/* Save last score in localStorage
*  we only keep the last best five scores
*/
GameStorage.prototype.saveScoreInLocalStorage = function(score) {
    var yourBestScores = localStorage.getItem('yourBestScores');

    if (yourBestScores == null)
    {
        yourBestScores = [ score ];
    }
    else {
        yourBestScores = JSON.parse(yourBestScores);
        yourBestScores.push(score);
    }

    // Order by best scores
    yourBestScores.sort(function(a, b){return b-a});

    // We only keep the last best five scores
    if (yourBestScores.length > 5) {
        yourBestScores.splice(5, yourBestScores.length - 5);
    }

    localStorage.setItem('yourBestScores', JSON.stringify(yourBestScores));
}

// Get your scores from local storage
GameStorage.prototype.getYourBestScoresFromLocalStorage = function() {
    var yourBestScores = localStorage.getItem('yourBestScores');

    if (yourBestScores == null) {
        return [];
    }
    else {
        return JSON.parse(yourBestScores);
    }
}