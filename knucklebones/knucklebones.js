// stuff for game
// variables
var running = false;

var opponentType = "temp";

var currentPlayer = Math.floor(Math.random()*2)+1;

const field = [
    [[0,0,0],
    [0,0,0],
    [0,0,0]
    ],[
    [0,0,0],
    [0,0,0],
    [0,0,0]]
];
const rowScore =[[0,0,0],[0,0,0]];
const scoreTotal = [0,0];
const currValsP1 = [0,0,0];
const currValsP2 = [0,0,0];
const wins = [0,0];


var botOptions = "";
const opponentOptions = ["player","random","copycat","match","remove","re-match","difference","cheater"];

var playerRowIndex = "temp";

// functions
// setup for the game
function gameInit(currentPlayer){
    running = true;

    roll = rollDie(currentPlayer);
    return roll;
}
// switch the current player value
function playerSwitch(currentPlayer){
    currentPlayer = (currentPlayer == 1) ? 2 : 1;
    return currentPlayer
};
// roll and display dice
function rollDie(currentPlayer){

    let roll = Math.floor(Math.random() * 6) + 1;
    
    if (currentPlayer === 1){
        showDice = document.getElementById("rollAreaP1")
    } else {
        showDice = document.getElementById("rollAreaP2")
    };

    showDice.src=`knucklebonesMedia/dice_white_${roll}.png`;

    prevRoll = roll;

    // let the dice "roll" for a bit
    for (r = 0; r < 10; r++){
        roll = Math.floor(Math.random() * 5) + 1;
        addOn = (roll >= prevRoll) ? 1 : 0;
        roll = roll + addOn

        showDice.src=`knucklebonesMedia/dice_white_${roll}.png`;

        prevRoll = roll;
    };

    return roll;
};
// remove opponent's dice (if applicable)
function removeDice(roll,row){ 
    playerNr = -currentPlayer + 2

    currRow = field[playerNr][row-1];
    let newRow = [0,0,0]

    // check for and remove duplicate dice on the opponent's side
    for (d = 0; d < 3; d++){
        if (currRow[d] === roll){
            currRow[d] = 0
        };
    };

    // reorder the row
    if (currentPlayer === 1){
        for (d = 0; d < 3; d++){
            if (currRow[d] != 0){
                for (e = 0; e < 3; e++){
                    if (newRow[e] === 0){
                        newRow[e] = currRow[d];
                        break
                    };
                };
            };
        };
    } else {
        for (d = 0; d < 3; d++){    // for P1 the dice need to be in reverse order
            if (currRow[2-d] != 0){
                for (e = 0; e < 3; e++){
                    if (newRow[2-e] === 0){
                        newRow[2-e] = currRow[2-d];
                        break
                    };
                };
            };
        };
    };
    
    // add the new row back to the field
    field[playerNr][row-1] = newRow;
};
// update the shown dice
function updateDiceVisuals(){
    // epmty the shown dice
    let showDice = document.getElementById(`rollAreaP${rowPlayer}`);
    showDice.src = "knucklebonesMedia/dice_empty.png";

    // get a row
    let currRow = [0,0,0]
    let diceColouring = ["","",""]
    for (p = 0; p < 2; p++){
        for (r = 0; r < 3; r++){
            currRow = field[p][r];
            
            // check if there are doubles or triples in that row
            // and give appropriate colouring
            if (currRow[0] === currRow[1] && currRow[1] === currRow[2]){
                diceColouring = ["blue","blue","blue"];
            } else if (currRow[0] === currRow[1]){
                diceColouring = ["yellow","yellow","white"];
            } else if (currRow[1] === currRow[2]){
                diceColouring = ["white","yellow","yellow"];
            } else if (currRow[0] === currRow[2]){
                diceColouring = ["yellow","white","yellow"];
            } else {
                diceColouring = ["white","white","white"];
            };

            // do the show dice with the right colours
            for (d = 0; d < 3; d++){
                diceId = "dice" + (p+1) + (r+1) + (d+1);
                let currDice = document.getElementById(diceId);
                diceVal = field[p][r][d];
                if (diceVal === 0){
                    currDice.src = "knucklebonesMedia/dice_empty.png";
                } else {
                    currDice.src = `knucklebonesMedia/dice_${diceColouring[d]}_${diceVal}.png`;
                };
            };
        };
    }; 


};
// calculate new scores
function updateScores(){
    // get the score (for both P1 and P2) for all rows
    for (r = 0; r < 3; r++){
        // get score of a row
        for (d = 0; d < 3; d++){
            currValsP1[d] = field[0][r][d];
            currValsP2[d] = field[1][r][d]; 
        };

        // calculate scores
        // for player 1
        if (currValsP1[0] === currValsP1[1] && currValsP1[1] === currValsP1[2]){
            rowP1Score = 3*(currValsP1[0] + currValsP1[1] + currValsP1[2]);
        } else if (currValsP1[0] === currValsP1[1]){
            rowP1Score = 2*(currValsP1[0] + currValsP1[1]) + currValsP1[2];
        } else if (currValsP1[1] === currValsP1[2]){
            rowP1Score = 2*(currValsP1[1] + currValsP1[2]) + currValsP1[0];
        } else if (currValsP1[0] === currValsP1[2]){
            rowP1Score = 2*(currValsP1[0] + currValsP1[2]) + currValsP1[1];
        } else {
            rowP1Score = currValsP1[0] + currValsP1[1] + currValsP1[2];
        }
        // for player 2
        if (currValsP2[0] === currValsP2[1] && currValsP2[1] === currValsP2[2]){
            rowP2Score = 3*(currValsP2[0] + currValsP2[1] + currValsP2[2]);
        } else if (currValsP2[0] === currValsP2[1]){
            rowP2Score = 2*(currValsP2[0] + currValsP2[1]) + currValsP2[2];
        } else if (currValsP2[1] === currValsP2[2]){
            rowP2Score = 2*(currValsP2[1] + currValsP2[2]) + currValsP2[0];
        } else if (currValsP2[0] === currValsP2[2]){
            rowP2Score = 2*(currValsP2[0] + currValsP2[2]) + currValsP2[1];
        } else {
            rowP2Score = currValsP2[0] + currValsP2[1] + currValsP2[2];
        };

        //add score to array
        rowScore[0][r] = rowP1Score;
        rowScore[1][r] = rowP2Score;

    };

    // update score totals
    let P1Total = 0
    let P2Total = 0
    for (r = 0; r < 3; r++){
        P1Total += rowScore[0][r];
        P2Total += rowScore[1][r];
    };
    scoreTotal[0] = P1Total;
    scoreTotal[1] = P2Total;
};
// show new scores
function showScores(){
    // show row scores
    for (p = 0; p < 2; p++){
        for (r = 0; r < 3; r++){
            scoreId = "score" + (p+1) + (r+1);
            let currScore = document.getElementById(scoreId);
            scoreVal = rowScore[p][r];
            currScore.innerHTML = scoreVal;
        };
    };
    
    // show total scores
    scoreTotalP1 = document.getElementById("totalScoreP1");
    scoreTotalP2 = document.getElementById("totalScoreP2");

    scoreTotalP1.innerHTML = scoreTotal[0];
    scoreTotalP2.innerHTML = scoreTotal[1];
};
// check if the game is over
function gameOver(){
    // check if player 1's field is full
    let fieldP1Full = true;
    for (r = 0; r < 3; r++){
        for (d = 0; d < 3; d++){
            if (field[0][r][d] === 0){
                fieldP1Full = false;
                break;
            };
        };
    };

    // check if player 2's field is full
    let fieldP2Full = true;
    for (r = 0; r < 3; r++){
        for (d = 0; d < 3; d++){
            if (field[1][r][d] === 0){
                fieldP2Full = false;
                break;
            };
        };
    };

    running = !(fieldP1Full || fieldP2Full);

    return running;
};
// show the end resulst
function showResults(){
    let resultScreen = document.getElementById("resultScreen");

    // determine who won (or if it was a draw)
    result = "temp";
    if (scoreTotal[0] > scoreTotal[1]){
        result = "player1";
    } else if (scoreTotal[1] > scoreTotal[0]){
        if (opponentType === "player"){
            result = "player2";
        } else {
            result = "bot";
        };
    } else {
        result = "draw";
    };

    // pick the right result screen
    resultScreen.style.backgroundImage =`url(knucklebonesMedia/win_screen_${result}.png`;
    if (result === "draw"){
        resultScreen.style.backgroundImage =`url(knucklebonesMedia/win_screen.png`;
    };

    // let the result screen popup
    resultScreen.style.height = "520px";
};
function updateWins(){
    let winsP1 = document.getElementById("winsP1");
    let winsP2 = document.getElementById("winsP2");

    if (scoreTotal[0] > scoreTotal[1]){
        wins[0] += 1;
    } else if (scoreTotal[1] > scoreTotal[0]){
        wins[1] += 1;
    };

    winsP1.innerHTML = wins[0];
    winsP2.innerHTML = wins[1];
};

// play game

// initialize game
gameInit(currentPlayer);

// check if the current player hovers over one of their rows, and highlight it if so
function rowHover(row){
    if (running){
        let currRow = document.getElementById(`row${row}`);
        rowPlayer = Math.floor(row/10);
        rowIndex = row - 10*rowPlayer;

        if (!(currentPlayer != rowPlayer || (currentPlayer === 2 && opponentType != "player"))){
            if (field[rowPlayer-1][rowIndex-1].includes(0)){
                // highlight red if a dice can be place
                currRow.style.backgroundImage = "url(knucklebonesMedia/selection_valid.png)";
            } else {
                // highlight black if no die can be placed
                currRow.style.backgroundImage = "url(knucklebonesMedia/selection_invalid.png)";
            };
        };
    };
};
// stop highlighting if the cursor leaves a row
function rowLeave(row){
    let currRow = document.getElementById(`row${row}`)
    currRow.style.backgroundImage = "url(knucklebonesMedia/selection_none.png";
};
// check if a row of the current player has clicked
function rowClick(row){
    if (running){
        if (currentPlayer === 2 && opponentType != "player"){
            rowPlayer = currentPlayer;

            // let the bot make a move
            if (opponentType === "random"){
                rowIndex = botRandom();
            } else if (opponentType === "copycat"){
                rowIndex = botCopycat(playerRowIndex);
            } else if (opponentType === "match"){
                rowIndex = botMatch();
            } else if (opponentType === "remove"){
                rowIndex = botRemove()
            } else if (opponentType === "re-match"){
                rowIndex = botReMatch();
            } else if (opponentType === "difference"){
                rowIndex = botDifference();
            } else if (opponentType === "cheater"){
                rowIndex = botCheater();
            };

        } else{
            rowPlayer = Math.floor(row/10);
            rowIndex = row - 10*rowPlayer;

            playerRowIndex = rowIndex;
        };

        // only continue if the row is of the current player and there are empty slots
        if (currentPlayer === rowPlayer && field[rowPlayer-1][rowIndex-1].includes(0)){

            // add dice to the selected row
            if (currentPlayer === 1){ // for P1 the dice need to be in reverse order
                for (d = 0; d < 3; d++){
                    if (field[rowPlayer-1][rowIndex-1][2-d] === 0){
                        field[rowPlayer-1][rowIndex-1][2-d] = roll;
                        break;
                    };
                };
            } else {
                for (d = 0; d < 3; d++){
                    if (field[rowPlayer-1][rowIndex-1][d] === 0){
                        field[rowPlayer-1][rowIndex-1][d] = roll;
                        break;
                    };
                };
            };

            // remove dice (if needed)
            removeDice(roll,rowIndex);

            // update the visual stuff
            updateDiceVisuals();

            // update the scores
            updateScores();

            // show the updated scores
            showScores();

            // check if the game is over
            running = gameOver();

            if (running){
                // switch the current player
                currentPlayer = playerSwitch(currentPlayer);

                //roll a new die
                roll = rollDie(currentPlayer);
            } else {
                // display the results
                showResults();
            };
        };
    };
};

// stuff for a game restart
const restartBtn = document.getElementById("restartBtn");
// restart the game if the button is clicked
restartBtn.addEventListener("click", function(){
    // add a win to whoever won
    updateWins();

    // reset values
    running = false;

    for (p = 0; p < 2; p++){
        for(r = 0; r < 3; r++){
            for(d = 0; d < 3; d++){
                field[p][r][d] = 0;
            };
        rowScore[p][r] = 0;
        currValsP1[r] = 0;
        currValsP2[r] = 0;
        };
        scoreTotal[p] = 0;
    };

    // update visual things
    updateDiceVisuals();
    showScores();

    // hide the result screen
    resultScreen = document.getElementById("resultScreen");
    resultScreen.style.height = "0px";

    // restart game
    gameInit(currentPlayer);
});
// highlight button if moved over
restartBtn.addEventListener("mouseover", function(){
    restartBtn.style.backgroundImage = "url(knucklebonesMedia/button_new_game_hover.png)";
});
// stop highlighting if mouse leaves button
restartBtn.addEventListener("mouseleave", function(){
    restartBtn.style.backgroundImage = "url(knucklebonesMedia/button_new_game.png)";
});

// stuff for music
const songElement = document.getElementById("song");
const playButton = document.getElementById("playSong");
var musicPlaying = false;
// play/stop music
playButton.addEventListener("click", function(){
    musicPlaying = !musicPlaying;
    if (musicPlaying) {
        songElement.play();         // let music start playing
        songElement.volume = 1;     // let resume playing (volume up)
    } else {
        songElement.volume = 0;     // stop music (volume down)
    };
});
// highlight button if moved over and change music level slightly
playButton.addEventListener("mouseover", function(){
    if (musicPlaying){
        songElement.volume = 0.7;   // slightly decrease music volume
        playButton.style.backgroundImage = "url(knucklebonesMedia/button_music_hover.png)";
    } else {
        songElement.volume = 0.3;   // slightly increase music volume
        playButton.style.backgroundImage = "url(knucklebonesMedia/button_music_hover.png)";
    };
});
// stop highlighting if mouse leaves button, also return music volume
playButton.addEventListener("mouseleave", function(){
    if (musicPlaying){
        songElement.volume = 1;   // return music volume
        playButton.style.backgroundImage = "url(knucklebonesMedia/button_music.png)";
    } else {
        songElement.volume = 0;   // return music volume
        playButton.style.backgroundImage = "url(knucklebonesMedia/button_music.png)";
    };
});

// stuff for the player select
const selectScreen = document.getElementById("selectScreen");
const selectBtn = document.getElementById("selectBtn");
const body = document.getElementById("body");

const nameP1 = document.getElementById("nameP1");
const nameP2 = document.getElementById("nameP2");
const avatarP2 = document.getElementById("avatarP2");
// open the selectscreen on startup
body.onload = function(){
    selectScreen.style.height = "520px";
};
// button to confirm the choice
selectBtn.addEventListener("click",function(){
    var validInput = false;
    const inputText = document.getElementById("inputText").value;

    validInput = (opponentOptions.includes(inputText));

    if (validInput){
        opponentType = inputText;
        
        if (opponentType === "player"){
            nameP1.innerHTML = "player 1";
            nameP2.innerHTML = "player 2";
            avatarP2.src = "knucklebonesMedia/player_2.png"
        } else {
            nameP2.innerHTML = inputText;
            avatarP2.src = "knucklebonesMedia/player_2_robot.png"
        };

        selectScreen.style.height = "0px";
    };
});
// highlight button if moved over
selectBtn.addEventListener("mouseover", function(){
    selectBtn.style.backgroundImage = "url(knucklebonesMedia/button_confirm_hover.png)";
});
// stop highlighting if mouse leaves button
selectBtn.addEventListener("mouseleave", function(){
    selectBtn.style.backgroundImage = "url(knucklebonesMedia/button_confirm.png)";
});

// stuff for the credits
const creditsBtn = document.getElementById("creditsBtn");
const creditsScreen = document.getElementById("creditsScreen");
var showingCreditsScreen = false;
// open credits if clicked
creditsBtn.addEventListener("click", function(){
    showingCreditsScreen = !showingCreditsScreen;
    if (showingCreditsScreen){
        creditsScreen.style.height = "440px";
        running = false;
    } else {
        creditsScreen.style.height = "0px";
        running = true;
    };
});
// highlight button if moved over
creditsBtn.addEventListener("mouseover", function(){
    creditsBtn.style.backgroundImage = "url(knucklebonesMedia/button_credits_hover.png)";
});
// stop highlighting if mouse leaves button
creditsBtn.addEventListener("mouseleave", function(){
    creditsBtn.style.backgroundImage = "url(knucklebonesMedia/button_credits.png)";
});

// the bots
function botRandom(){
    // get the amount of full rows
    let botOptions = "";
    for (r = 0; r < 3; r++){
        let rowFull = true;
        for (d = 0; d < 3; d++){
            if (field[1][r][d] === 0){
                rowFull = false;
                break;
            };
        };
        if (!rowFull){
            botOptions += r;
        };
    };

    // randomly choose an available row
    randOption = Math.floor(Math.random()*botOptions.length);
    rowIndex = 1 + Number(botOptions.charAt(randOption));

    return rowIndex;
};

function botCopycat(playerRowIndex){
    // check to see if the chosen row is full
    let rowFull = true;
    if (playerRowIndex != null){
        for (d = 0; d < 3; d++){
            if (field[1][playerRowIndex-1][d] === 0){
                rowFull = false;
                break;
            };
        };
    };

    // pick random if no the bot has the first turn or if the chosen row for the bot is full
    if (rowFull === true){
        rowIndex = botRandom();
    } else {    // otherwise pick the row that the player chose
        rowIndex = playerRowIndex;
    };

    return rowIndex;
};

function botMatch(){
    // check which rows have the same value as the rolled dice (if any)
    // also check which rows are filled
    let rowMatch = [0,0,0];
    let rowFilled = [1,1,1];
    for (r = 0; r < 3; r++){
        for (d = 0; d < 3; d++){
            diceVal = field[1][r][d];
            if (diceVal === 0){
                rowFilled[r] = 0;
            };
            if (diceVal === roll){
                rowMatch[r] += 1;
            };
        };
    };

    // find which rows are available (same/higest value && not full)
    let botOptions = '';
    for (v = 0; v < 3; v++){
        if (botOptions === ''){
            for (r = 0; r < 3; r++){
                if (rowMatch[r] >= 2-v && rowFilled[r] === 0){
                    botOptions += r;
                };
            };
        };
    };

    // randomly decide one of the available rows
    randOption = Math.floor(Math.random()*botOptions.length);
    rowIndex = 1 + Number(botOptions.charAt(randOption));

    return rowIndex;
};

function botRemove(){
    // check which of the player's rows have the same value as the rolled dice (if any)
    // also check which of the bot's rows are filled
    let rowMatch = [0,0,0];
    let rowFilled = [1,1,1];
    for (r = 0; r < 3; r++){
        for (d = 0; d < 3; d++){
            diceP1Val = field[0][r][d];
            diceBotVal = field[1][r][d];
            if (diceBotVal === 0){
                rowFilled[r] = 0;
            };
            if (diceP1Val === roll){
                rowMatch[r] += 1;
            };
        };
    };

    // find which rows are available (same/higest value && not full)
    let botOptions = '';
    for (v = 0; v < 4; v++){
        if (botOptions === ''){
            for (r = 0; r < 3; r++){
                if (rowMatch[r] >= 3-v && rowFilled[r] === 0){
                    botOptions += r;
                };
            };
        };
    };

    // randomly decide one of the available rows
    randOption = Math.floor(Math.random()*botOptions.length);
    rowIndex = 1 + Number(botOptions.charAt(randOption));

    return rowIndex;
};

function botReMatch(){
    // check which of the bot's rows are filled
    // check which of the bot's rows have a match with the rolled dice
    // check which of the player's rows have a match with the rolled dice
    let rowFilled = [1,1,1];
    let rowBotMatch = [0,0,0];
    let rowP1Match = [0,0,0];
    for (r = 0; r < 3; r++){
        for (d = 0; d < 3; d++){
            diceBotVal = field[1][r][d];
            diceP1Val = field[0][r][d];
            if (diceBotVal === 0){
                rowFilled[r] = 0;
            };
            if (diceBotVal === roll){
                rowBotMatch[r] += 1;
            };
            if (diceP1Val === roll){
                rowP1Match[r] += 1;
            };
        };
    };

    // change "importance values" depending on the score difference
    if (scoreTotal[1] - scoreTotal[0] < -30){               // make removing the player's dice more important when far behind
        for (r = 0; r < 3; r++){
            if (rowP1Match[r] != 0){
                rowP1Match[r] += 2;
            };
        };
    } else if (-30 < scoreTotal[1] - scoreTotal[0] < 30){   // slightly incentivice removing dice when in an equal situation
        for (r = 0; r < 3; r++){
            if (rowP1Match[r] != 0){
                rowP1Match[r] = 2*rowP1Match[r] - 1;
            };

            rowBotMatch[r] = 2*rowBotMatch[r];
        };
    } else if (30 < scoreTotal[1] - scoreTotal[0]){         // slightly incentivice matching dice when ahead
        for (r = 0; r < 3; r++){
            if (rowP1Match[r] != 0){
                rowP1Match[r] = 2*rowP1Match[r] - 2;
            };

            rowBotMatch[r] = 2*rowBotMatch[r] + 1;
        };
    };

    let rowMatch = [0,0,0]
    for (r = 0; r < 3; r++){
        rowMatch[r] = rowBotMatch[r] + rowP1Match[r]
    };

    // find which rows are available (same/higest value && not full)
    let botOptions = '';
    for (v = 0; v < 6; v++){
        if (botOptions === ''){
            for (r = 0; r < 3; r++){
                if (rowMatch[r] >= 5-v && rowFilled[r] === 0){
                    botOptions += r;
                };
            };
        };
    };

    // randomly decide one of the available rows
    randOption = Math.floor(Math.random()*botOptions.length);
    rowIndex = 1 + Number(botOptions.charAt(randOption));
    
    return rowIndex;
};

function botDifference(){
    // given the current roll, and the state of the board, calculate which placement would change the score in the bot's favour most
    // else, do a random move

    // find which of the bot's rows are not filled
    let rowFilled = [1,1,1];
    for (r = 0; r < 3; r++){
        for (d = 0; d < 3; d++){
            if (field[1][r][d] === 0){
                rowFilled[r] = 0;
            };
        };
    };

    // for every possible move, calculate the change
    let valueChange = [0,0,0];
    for (r = 0; r < 3; r++){
        if (rowFilled[r] === 0){
            let changePlayerScore = 0;
            let changeBotScore = 0;

            // "remove" the player's dice
            let playerEqualDice = 0;
            for (d = 0; d < 3; d++){
                if (field[0][r][d] === roll){
                    playerEqualDice += 1;
                };
            };
            changePlayerScore = playerEqualDice**2 * roll;

            // "add" the bot's die
            let botEqualDice = 0;
            for (d = 0; d < 2; d++){
                if (field[1][r][d] === roll){
                    botEqualDice += 1;
                };
            };
            changeBotScore = (2*botEqualDice+1)*roll;

            valueChange[r] = changeBotScore + changePlayerScore;
        };
    };

    // pick the best move(s)
    let maxVal = Math.max(...valueChange);
    let botOptions = '';
    for (r = 0; r < 3; r++){
        if (valueChange[r] === maxVal && rowFilled[r] === 0){
            botOptions += r;
        };
    };

    // randomly decide one of the available rows
    randOption = Math.floor(Math.random()*botOptions.length);
    rowIndex = 1 + Number(botOptions.charAt(randOption));
    
    return rowIndex;
};

function botCheater(){

    roll = 6
    showDice.src=`knucklebonesMedia/dice_white_6.png`;
    // get the amount of full rows
    let botOptions = "";
    for (r = 0; r < 3; r++){
        let rowFull = true;
        for (d = 0; d < 3; d++){
            if (field[1][r][d] === 0){
                rowFull = false;
                break;
            };
        };
        if (!rowFull){
            botOptions += r;
        };
    };

    // randomly choose an available row
    randOption = Math.floor(Math.random()*botOptions.length);
    rowIndex = 1 + Number(botOptions.charAt(randOption));

    return rowIndex;
};