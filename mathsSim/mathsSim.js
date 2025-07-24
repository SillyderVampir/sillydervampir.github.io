// links to html/css -----------------------------------------------------------------------------
const plane = document.getElementById('plane');
const ctx = plane.getContext('2d');

// general variables -----------------------------------------------------------------------------
// screen information
const planeWidth = window.innerWidth;
const planeHeight = window.innerHeight;

// set canvas size
plane.style.width = planeWidth;
plane.style.height = planeHeight;
ctx.canvas.width = planeWidth;
ctx.canvas.height = planeHeight;

// mouse variables
var mousex = 0;
var mousey = 0;
var mousexSave = 0;
var mouseySave = 0;

// axis transformations/scaling
const transf = [planeWidth/2,planeHeight/2];
const scale = [-1,1];

// transformation function
function T(P){
    let x = P[0];
    let y = P[1];

    Tx = scale[0]*x + transf[0];
    Ty = scale[1]*y + transf[1];

    return [Tx, Ty];
};

function Tinv(P){
    let x = P[0];
    let y = P[1];

    Tinvx = (x - transf[0])/scale[0];
    Tinvy = (y - transf[1])/scale[1];

    return [Tinvx, Tinvy];
};

// interactions ----------------------------------------------------------------------------------

plane.addEventListener('mousedown',function(event){
    // save mouse position
    mousexSave = event.x;
    mouseySave = event.y;

    moving = true;
});

// transform the axes
plane.addEventListener('mousemove', function(event){
    if (!(doTranfs && moving)){ return };

    // get current mouse position
    let mousex = event.x;
    let mousey = event.y;

    // find mousedx, mousedy
    let mousedx = mousex - mousexSave
    let mousedy = mousey - mouseySave

    // set new transformation coords
    transf[0] += mousedx;
    transf[1] += mousedy;

    // save mouse position
    mousexSave = mousex;
    mouseySave = mousey;

    draw();
});

plane.addEventListener('mouseup',function(event){
    moving = false;
});

// draw ------------------------------------------------------------------------------------------
function drawAxes(){
    // style settings
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#19483f";

    // draw x-axis
    ctx.beginPath();
    ctx.moveTo(0,transf[1]);
    ctx.lineTo(planeWidth,transf[1]);
    ctx.stroke();

    // draw y-axis
    ctx.beginPath();
    ctx.moveTo(transf[0],0);
    ctx.lineTo(transf[0],planeHeight);
    ctx.stroke();
};

function drawBorder(){
    // style settings
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#812D3D";

    // x = xmin
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(0,planeHeight);
    ctx.stroke();

    // x = xmax
    ctx.beginPath();
    ctx.moveTo(planeWidth,0);
    ctx.lineTo(planeWidth,planeHeight);
    ctx.stroke();

    // y = ymin
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(planeWidth,0);
    ctx.stroke();

    // y = ymax
    ctx.beginPath();
    ctx.moveTo(0,planeHeight);
    ctx.lineTo(planeWidth,planeHeight);
    ctx.stroke();
};

function drawLine(s,r){
    // s, r are the steun- and richtingsvectors for the equation (x,y) = s + t*r
    // we first look for what t we should draw the points

    // get coords of s,r
    let sx = s[0];
    let sy = s[1];
    let rx = r[0];
    let ry = r[1];

    // get min, max coords
    min = Tinv([0,0]);
    xmin = min[0];
    ymin = min[1];

    max = Tinv([planeWidth,planeHeight]);
    xmax = max[0];
    ymax = max[1];

    // txmin,txmax
    if (rx >= 0){
        txmin = (xmin-sx)/rx
        txmax = (xmax-sx)/rx
    } else {
        txmin = (xmax-sx)/rx
        txmax = (xmin-sx)/rx
    };

    // tymin,tymax
    if (ry >= 0){
        tymin = (ymin-sy)/ry
        tymax = (ymax-sy)/ry
    } else {
        tymin = (ymax-sy)/ry
        tymax = (ymin-sy)/ry
    };

    // determine tmin, tmax
    tmin = Math.max(txmin, tymin);
    tmax = Math.min(txmax, tymax);

    console.log(txmin,tymin,tmin)
    console.log(txmax,tymax,tmax)

    // only continue if tmin <= tmax
    if (tmax < tmin && false){ return };

    // now solve for the start and end 
    xstart = sx + tmin*rx;
    ystart = sy + tmin*ry;

    xend = sx + tmax*rx;
    yend = sy + tmax*ry;

    // transform start, end
    Tstart = T([xstart,ystart]);
    Tend = T([xend,yend]);

    xTstart = Tstart[0];
    yTstart = Tstart[1];

    xTend = Tend[0];
    yTend = Tend[1];

    // debug: start/end points
    console.log(Tstart,Tend)

    ctx.fillStyle = '#41bea7';
    ctx.strokeStyle = '#2d8272';
    
    ctx.beginPath();
    ctx.arc(xTstart, yTstart, 6, 0, 2*Math.PI)
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(xTend, yTend, 6, 0, 2*Math.PI)
    ctx.fill();
    ctx.stroke();

    // draw line
    ctx.lineWidth = 2;
    ctx.fillStyle = "#19483f";
    ctx.strokeStyle = "#19483f";

    ctx.beginPath();
    ctx.moveTo(xTstart,yTstart);
    ctx.lineTo(xTend,yTend);
    ctx.stroke();
};

function draw(){
    // clear screen
    ctx.clearRect(0,0,planeWidth,planeHeight);

    drawAxes();

    // debug: border
    drawBorder();

    // debug: y = 2x
    s = [0,0];
    r = [1,1];
    drawLine(s,r);

    // grid lines
    if (drawGrid == true){
        e = 1;
    };
};

// debugging -------------------------------------------------------------------------------------
var moving = false;
var doTranfs = true;
var doScale = false;

var drawGrid = true;

draw();

plane.addEventListener("click", function(event){
    console.log(event.x,event.y)
});