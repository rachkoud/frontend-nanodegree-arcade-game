/* Game store is used to store and retrieve scores locally (localStorage) and remotely (AWS DynamoDB)
*  The idea was to keep the best scores and I had to use a remote DB for this, this why I choose
*  AWS DynamoDB
*/
var GameStorage = function() {

    // Yes the key is key, but the policy allow only to execute a put and a query
    // And and there is an alerte if the amount of data allowed is over
    this.dynamodb = new AWS.DynamoDB({
        accessKeyId : 'AKIAJ5A74GDLUZW5VW5Q',
        secretAccessKey : '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',
        region: 'eu-central-1'
    });
}

/* Save score in AWS DynamoDB to keep all scores and
*  in local store to keep the last player scores
*/
GameStorage.prototype.saveScore = function(playerName, score) {
    var currentDate = new Date();

    // Save score to remote AWS DynamoDB
    params = { TableName : 'arcade-game',
        Item:{
            id:{S:'scores'},
            date:{S:currentDate.toUTCString()},
            name:{S:playerName},
            score:{N:score.toString()}
       }
    };

    this.dynamodb.putItem(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
        }
        else {
            //console.log(data);           // successful response
        }
    });

    // Save my scores to local storage, we only keep the last five scores
    var myScores = localStorage.getItem('myScores');

    if (myScores == null)
    {
        myScores = [ { name : playerName, score : score } ];
    }
    else {
        myScores = JSON.parse(myScores);
        myScores.push({ name : playerName, score : score });
    }

    if (myScores.length >= 5) {
        myScores.splice(6, myScores.length - 5);
    }

    localStorage.setItem('myScores', JSON.stringify(myScores));
}

/* Get scores from AWS DynamoDB
*  There scores are order by descending
*/
GameStorage.prototype.getRemoteScores = function(callback, context) {
    var params = {
        TableName: 'arcade-game', /* required */
        Limit: 10,
        ScanIndexForward: true, /* reverse score order */
        KeyConditions: {
            id : {
                AttributeValueList : [{ S : 'scores' }],
                ComparisonOperator : 'EQ'
            }
        }
    };

    this.dynamodb.query(params, function(err, data) {
        if (err) {
            // an error occurred
            console.log(err, err.stack);
        }
        else {
            // successful response
            var scores = [];
            data.Items.forEach(function(i) {
                scores.push({name:i.name.S, score:i.score.N});
            });
            return callback.call(context, scores);
        }
    });
}

// Get scores from local storage
GameStorage.prototype.getLocalScores = function() {
    var myScores = localStorage.getItem('myScores');

    if (myScores == null) {
        return [];
    }
    else {
        return JSON.parse(myScores);
    }
}