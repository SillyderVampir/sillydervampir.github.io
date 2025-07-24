/*
-2 => mine
-1 => covered
0 => 0 mines
1 => 1 mine
2 => 2 mines
3 => 3 mines
4 => 4 mines
5 => 5 mines
6 => 6 mines
7 => 7 mines
8 => 8 mines
*/

// !!html things
const field = document.getElementById('field');
// prevent the right-click menu from showing up (in the mineField)
field.oncontextmenu = event => {
    event.preventDefault();
};

// !!variables
var cols = 30;
var rows = 20;

var mineDensity = 0.2; // from 0 to 1 
var mines = parseInt(cols*rows*mineDensity);

var hasLost = false;
var doReset = false;
var viewMode = false;

var firstClick = false;

const mineField = Array(cols*rows);
const flagField = Array(cols*rows);
const shoveledField = Array(cols*rows);

// !!functions
// check if two arrays are equal
function areArraysEqual(array0, array1){
    let len0 = array0.length;
    let len1 = array1.length;

    if (len0 != len1){
       return false;
    };

    for (i=0; i<len0; i++){
        if(array0[i] != array1[i]){
            return false;
        };
    };

    return true;
};

// get a list of random but unequal numbers
function randomNrList(amount,min,max){
    let range = max - min;
    let nrList = Array(amount);

    let allNrs = Array(range)
    for (i=0; i<range; i++){
        allNrs[i] = i+min;
    };

    for (i=0; i<amount; i++){
        index = Math.floor(Math.random()*allNrs.length);
        nrList[i] = allNrs[index];
        allNrs.splice(index,1);
    };

    return nrList;
};

// set the field to a specified field size
function setField(cols,rows){
    field.style.setProperty('--fieldCols', cols);
    field.style.setProperty('--fieldRows', rows);
    
    field.replaceChildren();

    for (c=0; c<(cols*rows); c++){
        let cell = document.createElement('div');
        field.appendChild(cell).className = 'cell';
        cell.setAttribute('id',`cell${c}`);
    };

    field.style.width = `${32*cols}px`;
    field.style.height = `${32*rows}px`;
};

// set the background for a cell
function setBackground(cell,i){
    e = mineField[i];
    f = flagField[i];
    g = shoveledField[i];
    
    // first check if its flagged
    if (f && !g){
        cell.style.backgroundImage = `url(media/flag.png)`;
    // if not, then display what it is
    } else if (0 <= e && e <= 8 && (g || viewMode)){
        cell.style.backgroundImage = `url(media/${e}mines.png)`;
    } else if (e == -2 && (g || viewMode)) {
        cell.style.backgroundImage = `url(media/mine.png)`;
    // catchall (in case of error)
    } else {
        cell.style.backgroundImage = `url(media/covered.png)`;
    };
};

// find all cells adjacent to a clicked empty ones; iterate
function getEmptyCells(emptyCells, emptyCellsChecked, loop){
    index = emptyCells[emptyCellsChecked.length];
    cellCol = index%cols;
    cellRow = (index-cellCol)/cols;

    // top-left
    adjCol = cellCol-1;
    adjRow = cellRow-1;
    adjIndex = adjCol + cols*adjRow;
    if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == 0 && !emptyCells.includes(adjIndex)){
        emptyCells.push(adjIndex);
    };

    // top-centre
    adjCol = cellCol-1;
    adjRow = cellRow;
    adjIndex = adjCol + cols*adjRow;
    if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == 0 && !emptyCells.includes(adjIndex)){
        emptyCells.push(adjIndex);
    };

    // top-right
    adjCol = cellCol-1;
    adjRow = cellRow+1;
    adjIndex = adjCol + cols*adjRow;
    if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == 0 && !emptyCells.includes(adjIndex)){
        emptyCells.push(adjIndex);
    };

    // centre-left
    adjCol = cellCol;
    adjRow = cellRow-1;
    adjIndex = adjCol + cols*adjRow;
    if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == 0 && !emptyCells.includes(adjIndex)){
        emptyCells.push(adjIndex);
    };

    // centre-right
    adjCol = cellCol;
    adjRow = cellRow+1;
    adjIndex = adjCol + cols*adjRow;
    if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == 0 && !emptyCells.includes(adjIndex)){
        emptyCells.push(adjIndex);
    };

    // bttom-left
    adjCol = cellCol+1;
    adjRow = cellRow-1;
    adjIndex = adjCol + cols*adjRow;
    if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == 0 && !emptyCells.includes(adjIndex)){
        emptyCells.push(adjIndex);
    };

    // bttom-centre
    adjCol = cellCol+1;
    adjRow = cellRow;
    adjIndex = adjCol + cols*adjRow;
    if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == 0 && !emptyCells.includes(adjIndex)){
        emptyCells.push(adjIndex);
    };

    // bottom-right
    adjCol = cellCol+1;
    adjRow = cellRow+1;
    adjIndex = adjCol + cols*adjRow;
    if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == 0 && !emptyCells.includes(adjIndex)){
        emptyCells.push(adjIndex);
    };

    emptyCellsChecked.push(index);

    if (areArraysEqual(emptyCells,emptyCellsChecked)){
        return emptyCells;
    } else {
        loop += 1
        if (loop <= 9999){ // failsafe
            emptyCells = getEmptyCells(emptyCells, emptyCellsChecked, loop);
        };
    };
};

// find all the cells that are adjacent to empty cells (but not empty cells)
function getEmptyAdjCells(emptyCells, adjacentCells){
    for (i=0; i<emptyCells.length; i++){
        index = emptyCells[i];
        cellCol = index%cols;
        cellRow = (index-cellCol)/cols;

        // top-left
        adjCol = cellCol-1;
        adjRow = cellRow-1;
        adjIndex = adjCol + cols*adjRow;
        if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] != 0){
            adjacentCells.push(adjIndex);
        };

        // top-centre
        adjCol = cellCol-1;
        adjRow = cellRow;
        adjIndex = adjCol + cols*adjRow;
        if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] != 0){
            adjacentCells.push(adjIndex);
        };

        // top-right
        adjCol = cellCol-1;
        adjRow = cellRow+1;
        adjIndex = adjCol + cols*adjRow;
        if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] != 0){
            adjacentCells.push(adjIndex);
        };

        // centre-left
        adjCol = cellCol;
        adjRow = cellRow-1;
        adjIndex = adjCol + cols*adjRow;
        if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] != 0){
            adjacentCells.push(adjIndex);
        };

        // centre-right
        adjCol = cellCol;
        adjRow = cellRow+1;
        adjIndex = adjCol + cols*adjRow;
        if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] != 0){
            adjacentCells.push(adjIndex);
        };

        // bttom-left
        adjCol = cellCol+1;
        adjRow = cellRow-1;
        adjIndex = adjCol + cols*adjRow;
        if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] != 0){
            adjacentCells.push(adjIndex);
        };

        // bttom-centre
        adjCol = cellCol+1;
        adjRow = cellRow;
        adjIndex = adjCol + cols*adjRow;
        if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] != 0){
            adjacentCells.push(adjIndex);
        };

        // bottom-right
        adjCol = cellCol+1;
        adjRow = cellRow+1;
        adjIndex = adjCol + cols*adjRow;
        if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] != 0){
            adjacentCells.push(adjIndex);
        };
    };

    return adjacentCells;
};

// when the player lost
function lost(){
    console.log('you have lost [temporary]')
};

// check whether the player has won
function checkWin(){
    // count how many spaces the player has not shoveled
    let shoveledCount = 0;
    for (i=0; i<cols*rows; i++){
        if (shoveledField[i] == true){ shoveledCount += 1; };
    };

    // compare to the amount of mines
    if (shoveledCount == cols*rows-mines){
        console.log('you have won [temporary]');
        return true;
    };
};

// the setup
function init(){
    // reset variables
    cols = cols;
    rows = rows;

    mineDensity = mineDensity; // from 0 to 1 
    mines = parseInt(cols*rows*mineDensity);

    hasLost = false;
    doReset = false;

    // make an array with one cell for each cell and fill it with mines
    var mineLocations = randomNrList(mines,0,cols*rows);
    for (i=0; i<cols*rows; i++){
        if (mineLocations.includes(i)){
            mineField[i] = -2;
        } else {
            mineField[i] = -1;
        };
    };
    
    // determine the amount of neightbouring mines for each cell
    for (i=0; i<cols*rows; i++){
        if (mineField[i] != -2){
            cellCol = i%cols;
            cellRow = (i-cellCol)/cols;

            adjMines = 0;

            // top-left
            adjCol = cellCol-1;
            adjRow = cellRow-1;
            adjIndex = adjCol + cols*adjRow;
            if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == -2){ adjMines += 1; };

            // top-centre
            adjCol = cellCol-1;
            adjRow = cellRow;
            adjIndex = adjCol + cols*adjRow;
            if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == -2){ adjMines += 1; };

            // top-right
            adjCol = cellCol-1;
            adjRow = cellRow+1;
            adjIndex = adjCol + cols*adjRow;
            if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == -2){ adjMines += 1; };

            // centre-left
            adjCol = cellCol;
            adjRow = cellRow-1;
            adjIndex = adjCol + cols*adjRow;
            if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == -2){ adjMines += 1; };

            // centre-right
            adjCol = cellCol;
            adjRow = cellRow+1;
            adjIndex = adjCol + cols*adjRow;
            if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == -2){ adjMines += 1; };

            // bttom-left
            adjCol = cellCol+1;
            adjRow = cellRow-1;
            adjIndex = adjCol + cols*adjRow;
            if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == -2){ adjMines += 1; };

            // bttom-centre
            adjCol = cellCol+1;
            adjRow = cellRow;
            adjIndex = adjCol + cols*adjRow;
            if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == -2){ adjMines += 1; };

            // bottom-right
            adjCol = cellCol+1;
            adjRow = cellRow+1;
            adjIndex = adjCol + cols*adjRow;
            if (0 <= adjCol && adjCol < cols && 0 <= adjRow && adjRow < rows && mineField[adjIndex] == -2){ adjMines += 1; };

            mineField[i] = adjMines
        };
    };

    // make an array for all the flags to sit in
    for (i=0; i<cols*rows; i++){
        flagField[i] = false;
    };
    // and an array for which cells have been shoveled (and not)
    for (i=0; i<cols*rows; i++){
        shoveledField[i] = false;
    };

    // setup the field
    setField(cols,rows);
    for (var i = 0; i < cols*rows; i++) {
        var cell = document.getElementById(`cell${i}`)
        if (viewMode){
            setBackground(cell,i);
        } else {
            cell.style.backgroundImage = `url(media/covered.png)`;
        };
    };
};

// !!playing the game
init();

field.onmousedown = event => {
    cell = event.target;
    button = event.button;
    
    // only continue looking if the clicked element is a cell
    if (cell.id.substring(0,4) == 'cell'){
        // get the index
        index = cell.id.substring(4,9);

        // if left-click, shovel cell
        if (button == 0 && !flagField[index]){
            if (!firstClick){
                // retry making the board until the field until the clicked cell is empty
                console.log('test')
                firstClick = true;
                
            }; 

            shoveledField[index] = true;
            console.log(index,shoveledField[index])
            setBackground(cell,index);

            // lose if the cell is a mine
            if (mineField[index] == -2){
                hasLost = true;
            };

            // clear whole empty space if the cell has no adjMines
            if (mineField[index] == 0){
                let emptyCells = [parseInt(index)];
                let emptyCellsChecked = []
                let adjacentCells = []
                
                getEmptyCells(emptyCells,emptyCellsChecked,0);

                getEmptyAdjCells(emptyCells, adjacentCells);

                for (i=0; i<emptyCells.length; i++){
                    let setIndex = emptyCells[i]; 
                    let setCell = document.getElementById(`cell${setIndex}`);
                    shoveledField[setIndex] = true;
                    setBackground(setCell, setIndex);
                };
                
                for (i=0; i<adjacentCells.length; i++){
                    let setIndex = adjacentCells[i]; 
                    let setCell = document.getElementById(`cell${setIndex}`);
                    shoveledField[setIndex] = true;
                    setBackground(setCell, setIndex);
                };
            };
        };

        // if right-click, flag cell
        if (button == 2 && !shoveledField[index] && firstClick){
            flagField[index] = !flagField[index];
            setBackground(cell,index);
        };

        // death protocol
        if (hasLost){
            lost();
            doReset = true;
        } else {
            doReset = checkWin();
        };

        // has the player won?
        

        //if (doReset){ init(); };
    };
};

/*
TO DO:

game:
-win thing
-clicked square is always an empty one

side menu:
-set field size
-set mine density
-(re)start game

other:
*mines left* display

*/
