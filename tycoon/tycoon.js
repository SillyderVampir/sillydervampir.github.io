// setup stuff -----------------------------------------------------------------------------------------------
// links to website things
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');

const field = document.getElementById('field');

const playButton = document.getElementById('playButton');
const passButton = document.getElementById('passButton');

const resultScreen = document.getElementById('resultScreen');
const restartButton = document.getElementById('restartButton');

// variables
var opponentType = "temp";
var currentPlayer = 0;

const cardList = ['3_of_spades','4_of_spades','5_of_spades','6_of_spades','7_of_spades','8_of_spades','9_of_spades','10_of_spades','jack_of_spades','queen_of_spades','king_of_spades','ace_of_spades','2_of_spades',
    '3_of_diamonds','4_of_diamonds','5_of_diamonds','6_of_diamonds','7_of_diamonds','8_of_diamonds','9_of_diamonds','10_of_diamonds','jack_of_diamonds','queen_of_diamonds','king_of_diamonds','ace_of_diamonds','2_of_diamonds',
    '3_of_clubs','4_of_clubs','5_of_clubs','6_of_clubs','7_of_clubs','8_of_clubs','9_of_clubs','10_of_clubs','jack_of_clubs','queen_of_clubs','king_of_clubs','ace_of_clubs','2_of_clubs',
    '3_of_hearts','4_of_hearts','5_of_hearts','6_of_hearts','7_of_hearts','8_of_hearts','9_of_hearts','10_of_hearts','jack_of_hearts','queen_of_hearts','king_of_hearts','ace_of_hearts','2_of_hearts',
    'joker0','joker1'
];

var cardPile = [[]];
var hands = [];
var selections = [];
var playableCards = [];
var cardNumber = 0;
var passCounter = 0;
var winOrder = [];
var playersFinished = [0,0,0,0];
var finishedPlayers = 0;

const valueDictionary = {
    '3_of_':3,
    '4_of_':4,
    '5_of_':5,
    '6_of_':6,
    '7_of_':7,
    '8_of_':8,
    '9_of_':9,
    '10_of':10,
    'jack_':11,
    'queen':12,
    'king_':13,
    'ace_o':14,
    '2_of_':15,
    'joker':999
};
const suitDictionary = {
    'f_spades':'spades',
    'diamonds':'diamonds',
    'of_clubs':'clubs',
    'f_hearts':'hearts',
    'joker0':'none',
    'joker1':'none'
};

var turn = 0;

var revMult = 1;

// miscellaneous functions ------------------------------------------------------------------------------------
function gameInit(){
    // randomize the starting player
    turn = Math.floor(Math.random()*4);

    // shuffle, sort, deal, and show cards
    cardPile = shuffleCards(cardList);
    hands = dealCards(cardPile);
    selections = readySelections(hands);
    for (p=0; p<4; p++){
        hands[p] = sortCards(hands[p]);
        playableCards = getPlayableCards(hands[p],[],[]);
        showHand(hands[p],p,0,turn,playableCards);
    };
    cardPile = [[]];
    showHand([],-1,0,turn,[]);

    // set the playable cards for the first player
    playableCards = getPlayableCards(hands[turn],[],[]);

    // reset other stuff
    winOrder = [];
    playersFinished = [0,0,0,0];

};

function shuffleCards(cards){
    let shuffledCards = [];

    cardAmount = cards.length;

    // copy the cards
    let cardsCopy = Array(cardAmount);

    for (i=0; i<cardAmount; i++){
        cardsCopy[i] = cards[i];
    };

    // now get random cards
    for (i=0; i<cardAmount; i++){
        cardNr = Math.floor(Math.random()*cardsCopy.length);
        shuffledCards.push(cardsCopy[cardNr]);
        cardsCopy.splice(cardNr,1);
    };

    return shuffledCards;
};

function dealCards(cards){
    // create an empty hand for each player
    let hands = [];
    for (i=0; i<4; i++){
        hands.push([]);
    };

    // deal the cards one by one, in alternating fashion, to each player
    for (i=0; i<cards.length; i++){
        hands[i%4].push(cards[i]);
    };

    return hands;
};

function readySelections(hands){
    handsAmount = hands.length;
    selections = [];

    for (i=0; i<handsAmount; i++){
        currSelection = [];
        handAmount = hands[i].length;
        for (j=0; j<handAmount; j++){
            currSelection.push(0);
        };
        selections.push(currSelection);
    };

    return selections;
};

function sortCards(cards){
    cardAmount = cards.length;

    // get the cards' values
    let cardValues = [];
    for (i=0; i<cardAmount; i++){
        cardInfo = getCardDetails(cards[i]);
        cardValues.push(cardInfo[0]);
    };

    // sort the cards
    let sortedCards = [];

    for (i=0; i<cardAmount; i++){
        minVal = Math.min(...cardValues);
        minIndex = cardValues.indexOf(minVal);
       
        sortedCards.push(cards[minIndex]);
        cardValues.splice(minIndex,1);
        cards.splice(minIndex,1);
    };
    
    return sortedCards;
};

function showHand(hand,playerNr,offset,turn,playableCards){
    // get the index of the space div id in html
    if (playerNr === -1){
        spaceIndex = 4;
    } else {
        spaceIndex = f((playerNr+offset)%4);
    };
    
    handSize = hand.length;
    currSpace = document.getElementById(`space${spaceIndex}`);
    currSpace.style.setProperty(`--space${spaceIndex}Cards`, handSize);

    // make img elements for the cards
    currSpace.replaceChildren();
    for (i=0; i<handSize; i++){
        let cell = document.createElement('img');
        currSpace.appendChild(cell).className = 'card';
        cell.setAttribute('id',`card_${playerNr}_${i}`);

        // for the current player's and centre cards
        console.log(playerNr,turn%4)
        if (playerNr === turn%4 || playerNr === -1){
            cell.setAttribute('src',`tycoonMedia/${hand[i]}.png`);
        // for other players' cards
        } else {
            cell.setAttribute('src',`tycoonMedia/_facedown.png`);
        };

        cell.style.marginLeft = `-100px`;
        if (i===0){
            cell.style.marginLeft = `${-0.5*(47*handSize+100-600)}px`
        };
        // fade cards of the current player that cannot be played
        if (playerNr === turn%4 && !playableCards.includes(i)){
            cell.style.filter = 'brightness(0.6)';
        };

        cell.style.zIndex = '2';
        cell.style.transitionDuration = '0.2s'
    };
};

function f(x){ return (2/3)*x**3 -x**2 -(11/3)*x+7; };

function getCardDetails(card){
    valueInfo = card.substr(0,5);
    value = valueDictionary[valueInfo];

    suitInfo = card.substr(-8,8);
    suit = suitDictionary[suitInfo];

    return [value,suit];
};

function getSelectedNr(selection){
    selectedNr = 0;
    for (i=0; i<selection.length; i++){
        selectedNr += selection[i];
    };

    return selectedNr;
};

function getPlayableCards(hand,topCards,selection){
    /*
    tests:
    2) the target is of the current player's own hand
    3) the number of already selected cards is less than the current number of cards (or if the card is to be deselected)
    4) the target is of the same value as (or is a joker) any already selected cards
        4a) or the target card is a three of spades (alone) and the top card is a joker (alone)
    5) the target card is playable
    */

    let playableCards = [];
    cardNumber = topCards.length;
    handSize = hand.length;
    
    // get information about the cards
    if (cardNumber === 0){
        pileCardInfo = [0,'none'];
    } else {
        pileCardInfo = getCardDetails(topCards[0]);
    };
    
    // test 4) log all cards that have a higher value
    valueCards = [];
    for (i=0; i<handSize; i++){
        currCardInfo = getCardDetails(hand[i]);
        if (currCardInfo[0] > pileCardInfo[0]){
            valueCards.push(i);
        // or if they are a joker (and not a joker is on top)
        } else if (pileCardInfo[0] != 999 && currCardInfo[0] === 999){
            valueCards.push(i);
        //test 4a) or a three of spades (and a joker is the top card)
        } else if (pileCardInfo[0] === 999 && currCardInfo[0] === 3 && currCardInfo[1] === 'spades'){
            valueCards.push(i);
        };
    };
    // log all cards that are of the needed number
    // find how many cards there are of each value
    valueStorage = [];
    valueAmountStorage = [];
    values = -1;
    
    for (i=0; i<handSize; i++){
        currCardInfo = getCardDetails(hand[i]);
        currCardValue = currCardInfo[0];

        if (!valueStorage.includes(currCardValue)){
            valueStorage.push(currCardValue);
            valueAmountStorage.push(0);
            values += 1;

            for (j=0; j<handSize; j++){
                thisCardInfo = getCardDetails(hand[j]);
                thisCardValue = thisCardInfo[0];
                if (thisCardValue === currCardValue){
                    valueAmountStorage[values] += 1;
                };
            };
        };
    };
    // check what values have the required number of cards (plus the nr of jokers)
    jokerIndex = valueStorage.indexOf(999);
    if (jokerIndex != -1){
        jokerAmount = valueAmountStorage[jokerIndex];
    } else {
        jokerAmount = 0;
    };

    numberCards = [];
    for (i=0; i<handSize; i++){
        currCardInfo = getCardDetails(hand[i]);
        currCardValue = currCardInfo[0];

        if (currCardValue != 999){
            currValueAmount = valueAmountStorage[valueStorage.indexOf(currCardValue)] + jokerAmount;
        } else {
            currValueAmount = jokerAmount;
        };
        
        if (currValueAmount >= cardNumber){
            numberCards.push(i);
        };
        // temp
        if (currCardValue === 999){
            numberCards.push(i)
        }
    };
    
    // find the playable cards
    for (i=0; i<handSize; i++){
        if (valueCards.includes(i) && numberCards.includes(i)){
            playableCards.push(i);
        };
    };

    return playableCards;
};

function advanceTurn(pass,card){
    finishedPlayers = 0;
    
    for (i=0; i<4; i++){
        finishedPlayers += playersFinished[i];
    };

    toSkipPlayers = 0;
    for (i=0; i<3; i++){
        toSkipPlayers += playersFinished[(turn+i+1)%4];
        if (playersFinished[(turn+i+1)%4] === 0){
            break;
        }
    };
    
    // skip all other players if an eight was played
    if (card[0] === 8){
        toSkipPlayers = 3 - toSkipPlayers;
    };

    turn += 1 + toSkipPlayers;

    // if the player passed
    if (pass){ passCounter += 1; };
    // reset cards if all other players have passed
    if (passCounter === 3-finishedPlayers || card[0] === 8){
        cardPile = [[]];

        passCounter = 0;
    };

    // find the playable cards for the next player
    nextPlayerNr = (playerNr+1+toSkipPlayers)%4;
    nextHand = hands[nextPlayerNr];
    topCards = cardPile[cardPile.length-1];
    nexSelection = selections[nextPlayerNr]
    playableCards = getPlayableCards(nextHand,topCards,nexSelection);

    // show the hands
    for (p=0; p<4; p++){
        showHand(hands[p],p,0,turn,playableCards);
    };
    showHand(cardPile[cardPile.length-1],-1,0,turn,playableCards);

    return turn;
};

// play game --------------------------------------------------------------------------------------------------

// (re)start game
body.onload = function(){
    startScreen.style.height = '900px';
};
startButton.addEventListener("click",function(){
    startScreen.style.height = '0px';
    startScreen.style.border = 'none';

    gameInit();
});
restartButton.addEventListener('click',function(){
    resultScreen.style.height = '0px';
    resultScreen.style.border = 'none';

    gameInit();
});

// select cards
field.onmousedown = event => {
    /* 
    tests:
    1) the target was a card
    2) the target is of the current player's own hand
    3) the number of already selected cards is less than the current number of cards (or if the card is to be deselected)
    4) the target is of the same value as (or is a joker) any already selected cards
        4a) or the target card is a three of spades (alone) and the top card is a joker (alone)
    5) the target card is playable
    ...
    */
    // get card info
    cell = event.target;

    cellType = cell.id.substr(0,4);
    cellPlayer = parseInt(cell.id.substr(5,1));
    cellIndex = cell.id.substr(7,2);

    // tests 1) and 2) is it a card of the current player?
    if (cellType != 'card' || cellPlayer != turn%4){ return; };    

    // find what cards are playable
    currHand = hands[cellPlayer];
    topCards = cardPile[cardPile.length-1];
    currSelection = selections[cellPlayer]
    playableCards = getPlayableCards(currHand,topCards,currSelection);

    // reshow the curr player's hand // fix this
    console.log(currHand,cellPlayer,0,turn,playableCards)
    for (p=0; p<4; p++){
        if (cellPlayer === p){
            console.log(hands[p],p,0,turn,playableCards)
        };
        showHand(hands[p],p,0,turn,playableCards);
        
    };
    //showHand(currHand,cellPlayer,0,turn,playableCards);

    // <remove>
    
    // get more info
    selection = selections[cellPlayer];
    selectedNr = getSelectedNr(selection);
    selectedCard = selection[cellIndex];

    cardAmount = cardPile[cardPile.length-1].length;

    hand = hands[cellPlayer];

    // for check 4)
    checkValue = 0;
    for (i=0; i<selection.length; i++){
        if (selection[i] === 1 && i != cellIndex){
            checkCard = hand[i];
            checkValue = getCardDetails(checkCard)[0];
            break;
        };
    };
    
    selectedValue = getCardDetails(hand[cellIndex])[0];
    if (checkValue === 0 || checkValue === 999 || selectedValue === 999){
        checkValue = selectedValue;
    };
    
    // </remove>
    // checks 3) and 4)
    if ((((selectedNr < cardAmount || (cardAmount === 0 && selectedNr < 4)) && selectedValue == checkValue ) || selectedCard === 1) && playableCards.includes(parseInt(cellIndex))){
        // (de)select the clicked card
        selections[cellPlayer][cellIndex] = -selectedCard + 1;

        // raise or lower the card depending
        if (selectedCard === 0){
            cell.style.transform = 'translateY(-80px)';
        } else {
            cell.style.transform = 'translateY(0px)';
        };
    };
};

// play button (to play selected cards)
function play(){
    playerNr = turn%4;
    hand = hands[playerNr];
    selection = selections[playerNr];
    handSize = hand.length;

    removed = 0

    // only continue if the correct number of cards is selected
    if (getSelectedNr(selection) != cardAmount && cardAmount != 0){ return; };

    // get the selected cards and play them
    let selectedCards = [];
    card = '';
    for (i=0; i<handSize; i++){
        if (selection[i] === 1) {
            //also get one card to find the value (and suit)
            if (card === ''){ card = getCardDetails(hand[i-removed]); };

            selectedCards.push(hand[i-removed]);
            hand.splice(i-removed,1);
            removed += 1;
        };
    };

    // add cards to the centre pile
    cardPile.push(selectedCards);

    // reset the selected cards and passcounter
    selections = readySelections(hands);

    passCounter = 0;

    // win condition
    if (hands[playerNr].length === 0){ 
        winOrder.push(playerNr);
        playersFinished[turn%4] = 1;
    };

    // end game
    if (winOrder.length === 3){ 
        showResults(winOrder); 
    };

    // advance turn
    turn = advanceTurn(false,card);  
};

// pass button (to not play cards)
function pass(){
    playerNr = turn%4;
    hand = hands[playerNr];
    selection = selections[playerNr];
    handSize = hand.length;

    removed = 0

    // reset the selected cards
    selections = readySelections(hands);

    // advance turn
    turn = advanceTurn(true,'');
};

// when a player has won
function showResults(winOrder){
    // give the remaining player the fourth place
    winners = winOrder.length+1;
    for (i=0; i<winners; i++){
        if (!winOrder.includes(i)){ winOrder.push(i); };
    };

    // some stuff
    resultScreen.style.height = '900px';
};

/* to do -------------------------------------------------------------------------------------------------------

change the pass/turn mechanic:
    when getting the new player, call a function that recursively does
        NP = (CP+1)%4
    until the NP is still in the game
    
    like:

function nextPlayer(CP){
    NP = (CP+1)%4;

    if (playersFinished[NP]){
        NP = nextPlayer(NP);
    };

    return NP;
};

combine (to some extent) the [get playable cards] funciton and the checks for selecting a card
if a player just finished, the needed nr of passes sohuld not yet be lessened by one (maybe do passCounter += -1)

further rules:
    only highlight a card if there are enough of that value
    revolution + counter-revolution
    3 of spades

play a full game:
    3 rounds
    ranks (tycoon,rich,poor,beggar)
    points
    tycoon loses if beggar wins
    trade cards

*/

// testing ----------------------------------------------------------------------------------------------------
