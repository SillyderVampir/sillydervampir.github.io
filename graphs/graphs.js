// links to html/css -----------------------------------------------------------------------------
const space = document.getElementById('space');
const ctx = space.getContext('2d');

space.style.width = window.innerWidth;
space.style.height = window.innerHeight;
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

const selectPanel = document.getElementById('selectPanel');
const selectHeader = document.getElementById('selectHeader');
const selectors = document.getElementsByClassName('selector');
const deletors = document.getElementsByClassName('deletor');
const selectPanelStartHeight = selectPanel.style.height;

const infoBar = document.getElementById('infoBar');
const infoHeader = document.getElementById('infoHeader');
const graphNotation = document.getElementById('graphNotation');
const pointInfo = document.getElementById('pointInfo');
const properties = document.getElementsByClassName('property');
const infoBarStartWidth = infoBar.style.width;

// variables -------------------------------------------------------------------------------------
// selection panel
var selectShow = true;
var selectorNr = selectors.length;
var currSelector = 0;
var deletorNr = deletors.length;
/* 
    0 => no selection
    1 => points
    2 => lines
    3 => form circle/regular polygon
*/

// info bar
var infoShow = true;
var propertyNr = properties.length;

// mouse things
var mousex = 0;
var mousey = 0;
var mousexOld = 0;
var mouseyOld = 0;

// basic variables
var V = [] 
/* V[n] = [x,y,index,selected], where:
    x => x coordinate
    y => y coordinate
    index => an index used for lines (maybe other things in the future). not to be used for names of the points
    selected => whether the point is selected or not, so that it can be highlighted
*/
var E = []
/* E[n] = [i,j,selected], where:
    i => index of point Vi
    j => index of point Vj
    selected => whether the line is selected or not, so that it can be highlighted
    note: i<j to make avoiding duplicates easier
*/

// to select a number of points
var selectedPoints = [];

// making a line
const workingLine = [-1,-1];

// moving a point
var moving = false;
var moveObj = -1;

// making a circle
var formingCircle = 0;
var circCentre = [undefined,undefined];

// showing a path or circuit
var path = [];

// selection panel -------------------------------------------------------------------------------
// (de)highlight header
selectHeader.addEventListener('mouseover',function(event){
    selectHeader.style.backgroundColor = '#5b299b';
});
selectHeader.addEventListener('mouseleave',function(event){
    if (selectShow){
        selectHeader.style.backgroundColor = '#3c1b66';
    } else {
        selectHeader.style.backgroundColor = '#140922';
    };
});

// show/hide selection panel
selectHeader.addEventListener('click',function(event){
    selectShow = !selectShow;

    if (selectShow){
        selectPanel.style.height = selectPanelStartHeight;
        selectPanel.style.backgroundColor = '#3c1b66';

        // show selectors
        for (i=0; i<selectorNr; i++){
            selector = selectors[i];
            selector.style.display = 'grid';
        };
        // show deletors
        for (i=0; i<deletorNr; i++){
            deletor = deletors[i];
            deletor.style.display = 'grid';
        };

    } else {
        selectPanel.style.height = '0px';
        selectPanel.style.backgroundColor = '#3c1b66';

        // hide selectors
        for (i=0; i<selectorNr; i++){
            selector = selectors[i];
            selector.style.display = 'none';
        };
        // hide deletors
        for (i=0; i<deletorNr; i++){
            deletor = deletors[i];
            deletor.style.display = 'none';
        };
    };
});

// select a selector
for (i=0; i<selectorNr; i++){
    selector = selectors[i]
    
    selector.addEventListener('click',function(event){
        thisSelector = event.target;
        selectorID = parseInt(thisSelector.id.substr(8));

        // de-select
        if (selectorID === currSelector){
            currSelector = 0;
        // change selection
        } else {
            currSelector = selectorID;
        };

        // reset/de-select a bunch of things
        workingLine[0] = -1;
        workingLine[1] = -1;
        moving = false;
        moveObj = -1;
        formingCircle = 0;
        circCentre = [undefined,undefined];
        selectedPoints = [];

        // de-highlight points and lines
        if (selectorID != 1){
            Vcount = V.length;
            Ecount = E.length;

            for (let v=0; v<Vcount; v++){
                V[v][3] = false;
            };

            for (let e=0; e<Ecount; e++){
                E[e][2] = false;
            };
        };

        updateSelectorVisuals();
    });
};

// select a deletor
for (i=0; i<deletorNr; i++){
    deletor = deletors[i];

    deletor.addEventListener('click',function(event){
        thisDeletor = event.target;
        deletorID = parseInt(thisDeletor.id.substr(7));

        // delete lines
        if (deletorID === 1){
            E = [];
            workingLine[0] = -1;
            workingLine[1] = -1;
        // delete whole graph
        } else if (deletorID === 2){
            V = [];
            E = [];
            workingLine[0] = -1;
            workingLine[1] = -1;
        };

        checkProperties();
        draw();
    });  
};

// change the selector visuals
function updateSelectorVisuals(){
    for (i=0; i<selectorNr; i++){
        selector = selectors[i];

        // if the selector is selected
        if (i+1 === currSelector){
            selector.style.borderColor = '#41bea7';
        // if not
        } else {
            selector.style.borderColor = '#2d8272';
        };
    };

    draw();
};

// info bar --------------------------------------------------------------------------------------
// (de)highlight header
infoHeader.addEventListener('mouseover',function(event){
    infoHeader.style.backgroundColor = '#5b299b';
});
infoHeader.addEventListener('mouseleave',function(event){
    if (infoShow){
        infoHeader.style.backgroundColor = '#3c1b66';
    } else {
        infoHeader.style.backgroundColor = '#140922';
    };
});

// show/hide info bar
infoHeader.addEventListener('click',function(event){
    infoShow = !infoShow;

    if (infoShow){
        infoBar.style.width = infoBarStartWidth;
        infoBar.style.backgroundColor = '#3c1b66';

        // show graph notation and point info
        graphNotation.style.display = 'grid';
        pointInfo.style.display = 'grid';

        // show properties
        for (i=0; i<propertyNr; i++){
            property = properties[i];
            property.style.display = 'grid';
        };

    } else {
        infoBar.style.width = '0px';
        infoBar.style.backgroundColor = '#3c1b66';

        // hide graph notation and point info
        graphNotation.style.display = 'none';
        pointInfo.style.display = 'none';

        // hide properties
        for (i=0; i<propertyNr; i++){
            property = properties[i];
            property.style.display = 'none';
        };
    };
});

// main graph funcitons --------------------------------------------------------------------------
// select an object
space.addEventListener('click',function(event){
    mousex = event.x;
    mousey = event.y;

    if (currSelector === 2){
        pointAddRemove();
    } else if (currSelector === 3){
        lineAddRemove();
    } else if (currSelector === 4){
        formCircle();
    } else if (currSelector === 5){
        showPath();
    };
});
// for moving specifically
space.addEventListener('mousedown',function(event){
    if (currSelector != 1){
        return;
    };

    // set relevant variables
    moving = true;
    mousexOld = event.x;
    mouseyOld = event.y;

    // find whether a point is close
    moveObj = closePoint(mousexOld,mouseyOld);
});

space.addEventListener('mouseup',function(event){
    if (currSelector != 1){
        return;
    };
    moving = false;
});

space.addEventListener('mousemove',function(event){
    if (currSelector != 1 || !moving || moveObj === -1){
        return;
    };

    // get the mouse coords
    mousex = event.x;
    mousey = event.y;

    // move the selected point
    movePoint(moveObj)
    
    draw();
});

// add/remove a point
function pointAddRemove(){
    pointSelect = closePoint(mousex,mousey);

    // add point
    if (pointSelect == -1){
        index = getLowestIndex();
        V.push([mousex,mousey,index,false]);
    // remove point
    } else {
        // first delete lines that were connected to that point
        deleteLines(V[pointSelect][2]);

        V.splice(pointSelect,1);
    };

    checkProperties();
    draw();
};

// add/remove a line
function lineAddRemove(){
    // find a close point
    pointSelect = closePoint(mousex,mousey);

    // if so:
    if (pointSelect != -1){
        // add the point (index) to the current line 
        //  (but so that the first index is always lower)
        thisPoint = V[i][2];

        otherPoint = Math.max(...workingLine);
        workingLine[0] = Math.min(thisPoint,otherPoint);
        workingLine[1] = Math.max(thisPoint,otherPoint)

        // if a full line is selected
        if (!workingLine.includes(-1) && thisPoint != otherPoint){
            // remove the line
            lineExists = false;

            for (i=0; i<E.length; i++){
                currLine = E[i];

                workingVi = workingLine[0];
                workingVj = workingLine[1];

                currVi = currLine[0];
                currVj = currLine[1];

                if (workingVi === currVi && workingVj === currVj){
                    lineExists = true;
                    E.splice(i,1);
                };
            };

            // add the line
            if (!lineExists){
                E.push([workingLine[0],workingLine[1],false]);
            };

            // reset the line
            workingLine[0] = -1;
            workingLine[1] = -1;
        };
    };

    checkProperties();
    draw();
};

// form a circle
function formCircle(){
    // get a centre point
    if (circCentre.includes(undefined)){
        circCentre = [mousex,mousey];

    // make the circle (with the first point)
    } else {
        Vcount = V.length;
        addAngle = 2*Math.PI/Vcount;

        fPoint = [mousex,mousey];

        // find the radius and initial angle
        r = Math.sqrt((fPoint[0]-circCentre[0])**2+(fPoint[1]-circCentre[1])**2);
        otherAngle = Math.acos((fPoint[0]-circCentre[0])/r);
        if (circCentre[0] < fPoint[0]){
            initAngle = Math.asin((fPoint[1]-circCentre[1])/r);
        } else {
            initAngle = Math.PI - Math.asin((fPoint[1]-circCentre[1])/r);
        };

        // give the points new coords on the circle
        for (i=0; i<Vcount; i++){
            currV = V[i];

            currV[0] = r*Math.cos(initAngle+i*addAngle)+circCentre[0];
            currV[1] = r*Math.sin(initAngle+i*addAngle)+circCentre[1];
        };

        // reset the circle centre
        circCentre = [undefined,undefined]
    };

    draw();
};

// show a path between selected points
function showPath(){
    // find a close point
    pointSelect = closePoint(mousex,mousey);

    if (pointSelect === -1) { return; };
    
    // remove the point to the path
    if (selectedPoints.includes(pointSelect)){
        let index = selectedPoints.indexOf(pointSelect);
        selectedPoints.splice(index,1);
    // add the point to the path
    } else {
        selectedPoints.push(pointSelect);
    };

    // find the path with the given points
    if (selectedPoints.length >= 2){
        a = selectedPoints[0];
        b = selectedPoints[1];
        path = findPath(a,b);

        // highlight points in the path
        Vcount = V.length;
        for (let i=0; i<Vcount; i++){
            let v = V[i]
            vIndex = v[2];

            if (path.includes(vIndex)){
                v[3] = true;
            } else {
                v[3] = false;
            };
        };

        // and also the lines
        Ecount = E.length;
        for (let i=0; i<Ecount; i++){
            let e = E[i];
            
            highlight = false;

            // go through each pair of adjacent points in the path
            pointCount = path.length;
            for (let j=1; j<pointCount; j++){
                if (e.includes(path[j-1]) && e.includes(path[j])){
                    highlight = true;
                    break;
                };
            };
            e[2] = highlight;
        };
    };

    draw();
};

// get the degree of a point
function degree(v){

    // go through the lines
    //  and count instances of the point
    deg = 0;
    Ecount = E.length;

    for (i=0; i<Ecount; i++){
        currLine = E[i];

        if (currLine.includes(v)){
            deg += 1;
        };
    };

    return deg
};

// get the neighbours of a point
function neighbours(v){
    //go through the lines
    // and add indeces of points is shares a line with
    neighB = [];
    Ecount = E.length;

    for (let i=0; i<Ecount; i++){
        currLine = E[i];
        
        if (currLine[0] === v){
            neighB.push(currLine[1]);
        };
        
        if (currLine[1] === v){
            neighB.push(currLine[0]);
        };
    };

    return neighB;
};

function findPath(a,b,included=[],excluded=[]){
    // start at point a
    let walks = [[a]];
    let walksAmount = walks.length

    while (walksAmount != 0){
        walksAmount = walks.length;
        let newWalks = [];

        // loop over each walk
        for (w=0; w<walksAmount; w++){
            let currWalk = walks[w];
            let endPoint = currWalk.at(-1);

            // get the neighbours of the last point in the walk
            let currNBs = neighbours(endPoint);

            // make new walks from the original, 
            //  each with a neighbour of the endPoint as new endPoint
            //   but don't add a neighbour if it already exists in the walk (so make it be/stay a path)
            let NBAmount = currNBs.length;
            for (let i=0; i<NBAmount; i++){
                let currNB = currNBs[i];
                if (!currWalk.includes(currNB)){
                    thisWalk = [].concat(currWalk);
                    thisWalk.push(currNB)
                    newWalks.push(thisWalk);

                    // if the current neighbour is b, then we have a path from a to b
                    //  also check whether any wanted points included are in the walk, and any points excluded are not
                    if (currNB === b){
                        let inclusion = true;
                        includedNr = included.length;
                        for (let j=0; j<includedNr; j++){
                            currIncl = included[j];
                            if (!thisWalk.includes(currIncl)){
                                inclusion = false;
                                break;
                            };
                        };
                        let exclusion = true;
                        excludedNr = excluded.length;
                        for (let j=0; j<excludedNr; j++){
                            currExcl = excluded[j];
                            if (thisWalk.includes(currExcl)){
                                exclusion = false;
                                break;
                            };
                        };

                        if (inclusion && exclusion){
                            return thisWalk;
                        }
                    };
                };
            };
        };     

        // update the walks
        walks = newWalks;
    };

    return [];
};

function findCycle(x){
    // find x's neighbours
    let aNBs = neighbours(x);
    let aNBAmount = aNBs.length;

    // for each pair of neighbours a,b, of x, find a path from a to b
    //  if this path exists, thena cycle exists from x to a to b to x
    for (let i=0; i<aNBAmount-1; i++){
        for (let j=i+1; j<aNBAmount; j++){
            a = aNBs[i];
            b = aNBs[j];
            path = findPath(a,b,[],[x]);

            if (path.length === 0){
                return false;
            };
        };
    };
};

// helper graph funcitons ------------------------------------------------------------------------
// move a point
function movePoint(index){
    // get the point
    currV = V[index];

    // change x,y values
    currV[0] = mousex;
    currV[1] = mousey;
};

// find a point close to given x,y coords
function closePoint(x,y){
    for (i=0; i<V.length; i++){
        pointx = V[i][0];
        pointy = V[i][1];

        distance = ((pointx-x)**2 + (pointy-y)**2)**(1/2)

        // check if the point is close enough
        //  if so, return the points index in V
        if (distance <= 10){
            pointSelect = i;
            return i;
        };
    };

    return -1;
};

// get the lowest unused index number >= 0
function getLowestIndex(){
    Vcount = V.length;

    // go through iterations numbering one more than the amount of points
    for (i=0; i<=Vcount; i++){
        freeIndex = true;

        // go trough the points to see if the index is already used
        for (j=0; j<Vcount; j++){
            pointIndex = V[j][2];

            if (pointIndex === i){
                freeIndex = false;
                break;
            };
        };

        // return if the index has not been used
        if (freeIndex){ return i };
    };
};

// delete a line if its point is removed
function deleteLines(i){
    Ecount = E.length;

    // cheat by remaking E, without the lines that should be deleted
    Ecopy = E;
    E = [];

    for (k=0; k<Ecount; k++){
        currLine = Ecopy[k];
        nIndex = currLine[0];
        mIndex = currLine[1];

        if (nIndex != i && mIndex != i){
            E.push(currLine);
        };
    };
};

// see if two arrays share one or more elements
function arrayOverlap(V,W){
    let Vcount = V.length;
    
    let overlap = [];

    for (i=0; i<Vcount; i++){
        let vi = V[i];

        if (W.includes(vi) && !overlap.includes(vi)){
            overlap.push(vi);
        };
    };

    return overlap;
};

// property controll functions -------------------------------------------------------------------
function checkProperties(){
    showGraphNotation();

    for (p=0; p<propertyNr; p++){
        property = properties[p];
        propertyID = property.id;

        // check properties
        if (propertyID === 'propertyRegular'){
            if (isRegular()){
                property.style.borderColor = '#4290c7';
                property.style.backgroundColor = '#36476b';
            } else {
                property.style.borderColor = '#29628b';
                property.style.backgroundColor = '#3c1b66';
            };
        };

        if (propertyID === 'propertyComplete'){
            if (isComplete()){
                property.style.borderColor = '#4290c7';
                property.style.backgroundColor = '#36476b';
            } else {
                property.style.borderColor = '#29628b';
                property.style.backgroundColor = '#3c1b66';
            };
        };

        if (propertyID === 'propertyConnected'){
            if (isConnected()){
                property.style.borderColor = '#4290c7';
                property.style.backgroundColor = '#36476b';
            } else {
                property.style.borderColor = '#29628b';
                property.style.backgroundColor = '#3c1b66';
            };
        };
    };
};

function showGraphNotation(){
    let Gstr = 'G = (V,E) = ('
    let Vstr = '{';
    let Estr = '{';

    Vcount = V.length;
    Ecount = E.length;

    // make the string of all points in V
    for (i=0; i<Vcount; i++){
        newPoint = `${V[i][2]}`;
        Vstr = Vstr.concat(newPoint);

        if (i != Vcount-1){
            Vstr = Vstr.concat(', ')
        };
    };
    Vstr = Vstr.concat('}');

    // make the string of all lines in E
    for (i=0; i<Ecount; i++){
        newLine = `{${E[i][0]}, ${E[i][1]}}`;
        Estr = Estr.concat(newLine);

        if (i != Ecount-1){
            Estr = Estr.concat(', ');
        };
    };
    Estr = Estr.concat('}');

    // make the full string for the graph G
    Gstr = Gstr.concat(Vstr);
    Gstr = Gstr.concat(', ');
    Gstr = Gstr.concat(Estr);
    Gstr = Gstr.concat(')');

    // show it in the info bar
    graphNotation.innerHTML = Gstr;
};

function isRegular(){
    if (V.length === 0){ return true };
    
    // get the degree of the first point
    initDegree = degree(V[0][2]);

    // see if every other point has the same degree
    Vcount = V.length;
    for (k=1; k<Vcount; k++){
        currPoint = V[k];

        if (degree(currPoint[2]) != initDegree){
            return false;
        };
    };

    return true;
};

function isComplete(){
    // get the nr of points and lines
    n = V.length;
    Ecount = E.length;

    // check if G is complete
    if (0.5*n*(n-1) == Ecount){
        return true;
    } else {
        return false;
    };
};

function isBipartite(){
    if (V.length === 0 || V.length === 1){ return false };

    // remove any points without neighbours,
    //  since they don't impact whether a graph is bipartite or not
    Vcheck = [];
    Vcount = V.length;
    for (k=0; k<Vcount; k++){
        currPoint = V[k][2];
        currDeg = degree(currPoint);

        if (currDeg != 0){
            Vcheck.push(currPoint);
        };
    };

    // setup neccesary sets
    V1 = [];
    V2 = [];
    Q = [];
    Used = [];

    // take a point from Vcheck
    v0 = Vcheck[0];
    V1.push(v0);
    Used.push(v0);
    v0NBs = neighbours(v0);
    NBAmount = v0NBs.length;

    // add v0's neighbours to V2 and Q
    for (i=0; i<NBAmount; i++){
        currNB = v0NBs[i];
        V2.push(currNB);
        Q.push(currNB);
    };

    counter = 0;

    // loop over points in the Queue
    while (Q.length > 0){
        // take the first point vi, from Q
        vi = Q[0];
        viNBs = neighbours(vi);
        NBAMount = viNBs.length;

        // check whether vi is neighbour with another point in the same Vk
        if (V1.includes(vi)){
            overlap = arrayOverlap(V1,viNBs);
        };
        if (V2.includes(vi)){
            overlap = arrayOverlap(V2,viNBs);
        };
        
        if (overlap.length != 0){ return false; };

        // add vi's neighbours to the opposite Vk and to Q, lest they already are included
        for (i=0; i<NBAmount; i++){
            currNB = viNBs[i];

            if (V1.includes(vi) && !V2.includes(currNB)){ V2.push(currNB); };
            if (V2.includes(vi) && !V1.includes(currNB)){ V1.push(currNB); };
            if (!Q.includes(currNB) && !Used.includes(currNB)){ Q.push(currNB); };
        };

        // add vi to the used indeces and remove it from the queue
        Used.push(vi);
        Q.shift();

        console.log(V1,V2)
        console.log(Q);
        console.log(Used)
        console.log('')

        counter += 1;
        if (counter > 99){
            break;
        };
    };

    return true;
};

function isConnected(){
    // loop through each pair of points (a,b)
    //  and see if there exists a path from a to b (or vice versa)
    //   we don't check any (a,a) since there is necessarily a path from a to a
    let Vcount = V.length;

    for (let i=0; i<Vcount-1; i++){
        for (let j=i+1; j<Vcount; j++){
            a = V[i][2];
            b = V[j][2];
            path = findPath(a,b);

            if (path.length === 0){
                return false;
            };
        };
    };

    return true;
};

// visualization functions -----------------------------------------------------------------------
function draw(){
    ctx.clearRect(0,0,space.width,space.height);

    drawLines();

    drawPoints();

    drawCircCentre();
};

function drawPoints(){
    // ctx style settings
    ctx.lineWidth = 2;

    Vcount = V.length;

    // draw each point
    for (i=0; i<Vcount; i++){

        pointx = V[i][0];
        pointy = V[i][1];
        
        // highlight/not
        if (V[i][3]){
            ctx.fillStyle = '#4290c7';
            ctx.strokeStyle = '#36476b';
        } else {
            ctx.fillStyle = '#41bea7';
            ctx.strokeStyle = '#2d8272';
        };

        ctx.beginPath();
        ctx.arc(pointx, pointy, 6, 0, 2*Math.PI)
        ctx.fill();
        ctx.stroke();
    };
};

function drawLines(){
    // ctx style settings
    ctx.lineWidth = 4;

    Vcount = V.length;
    Ecount = E.length;

    // draw every line
    for (i=0; i<Ecount; i++){
        currLine = E[i];

        lineIndexi = currLine[0];
        lineIndexj = currLine[1];

        // find the points with the right indeces
        for (k=0; k<Vcount; k++){
            if (V[k][2] === lineIndexi){
                Vi = V[k];
            };
            if (V[k][2] === lineIndexj){
                Vj = V[k];
            };
        };

        // highlight/not
        if (currLine[2]){
            ctx.strokeStyle = '#4290c7';
        } else {
            ctx.strokeStyle = '#2d8272';
        };

        // draw the line
        startx = Vi[0];
        starty = Vi[1];
        endx = Vj[0];
        endy = Vj[1];

        ctx.beginPath();
        ctx.moveTo(startx,starty);
        ctx.lineTo(endx,endy);
        ctx.stroke();
    };
};

function drawCircCentre(){
    if (!circCentre.includes(undefined)){
        // ctx style settings
        ctx.fillStyle = '#c03f56';
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#8b2d3e';

        // draw the point
        pointx = circCentre[0];
        pointy = circCentre[1];

        ctx.beginPath();
        ctx.arc(pointx, pointy, 6, 0, 2*Math.PI)
        ctx.fill();
        ctx.stroke();
    };
};

draw()

/* ideas:
    - when selecting a point (info option or smn) get the degree (maybe other info also)
    - show if G is:
        - (volledig) bipartiet,
        - samenhangend,
        - een eulergraaf,
        - een hamiltongraaf,
        - een boom,
        - een bos

    - show the complement of G
    - show the linegraph of G

    - show a wandeling (or pad) between points (if possible)
        showing a path is possible, but only two points,
        have yet to decide whether to implement it for more points

    - a (random) gesloten gesloten wandeling/cicuit/cykel/eulercykel/hamiltoncircuit (on selected points)

    - undo/redo burrons
*/
