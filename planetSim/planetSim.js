// setup vector class
class Vector {
    constructor(x,y){
        this.x = x;
        this.y = y;
    };
};

function vectorAdd(u,v){
    return new Vector(u.x+v.x, u.y+v.y);
};

function vectorSub(u,v){
    return new Vector(u.x-v.x, u.y-v.y);
};

function vectorScale(u,s){
    return new Vector(s*u.x, s*u.y);
};

function vectorTransform(v,s,t){
    // scale v by s
    let sv = vectorScale(v,s)
    // translate sv by t
    let sv_t = vectorAdd(sv,t)

    return sv_t
}

// links to html/css -----------------------------------------------------------------------------
const main = document.getElementById('body');
const space = document.getElementById('space');
const ctx = space.getContext('2d');
const infoBox = document.getElementById('infoBox')
const infoBits = document.getElementsByClassName('infoBit')
const infoTime = infoBits[0]
const pauseBox = document.getElementById('pauseBox')

// general variables -----------------------------------------------------------------------------
// screen information
const spaceWidth = window.innerWidth;
const spaceHeight = window.innerHeight;

// set canvas size
space.style.width = spaceWidth;
space.style.height = spaceHeight;
ctx.canvas.width = spaceWidth;
ctx.canvas.height = spaceHeight;

// mouse variables
var mouse = new Vector(0,0);
var mouseSave = new Vector(0,0);

// other things
const dt = 3*10**3; // s
var time = 0 // s
const G = 6.67430*10**-11; // N * m^2 * kg^-2

var scale = spaceHeight; // m (the full width)
var translate = new Vector(0,0); // [m,m]
const centre = new Vector(spaceWidth/2,spaceHeight/2)

var play = false;
var manualAdvance = false;
var moving = false;
var trackIndex = -1;

var traceMax = 400;

var showInfo = false;

// setup celestial bodies ------------------------------------------------------------------------
/*
    name : name (str)
    M : mass (float, kg)
    R : radius (float, m)
    P : position (vector, [m,m])
    V : velocity (vector, [m/s,m/s])
    F : force (vector, [N,N])
    SMA : semi-major axis (float, m)
    E : eccentricity (float)
    T : orbital period (float, s)
    D : orbital direction (bool) (true:pro ; false:retro)
*/

class Body {
    constructor(name,colour,M,R,P,V) {
        this.name = name;
        this.colour = colour;
        this.M = M;
        this.R = R;
        this.P = P;
        this.V = V;
        this.F = new Vector(0,0);
        this.tracing = false;
        this.trace = [];
    };

    // calculations 
    updateF() {
        let bodiesNr = bodies.length;
        let Fres = new Vector(0,0);

        for (let i=0; i<bodiesNr; i++){
            // get the gravitational force towards every other body
            let otherBody = bodies[i]
            
            // skip if we come accros the same body
            if (otherBody.name == this.name) { continue };

            // get masses and positions
            let m1 = this.M
            let m2 = otherBody.M
            let P1 = this.P
            let P2 = otherBody.P

            // calculate the absolute force
            let rAbs = Math.sqrt((P1.x-P2.x)**2 + (P1.y-P2.y)**2)
            let FAbs = G*m1*m2/rAbs**2

            // get the direction vector. note that it is P2 - P1, since here we calculate how body 2 pulls on body 1
            let rDir = vectorSub(P2,P1)
            // normalise it
            let rUnit = vectorScale(rDir,1/rAbs)
            // scale it with the total force
            let F = vectorScale(rUnit,FAbs)

            // add the force onto Fres
            Fres = vectorAdd(Fres,F)
        };

        this.F = Fres;
    };

    updateV() {
        // calculate the acceleration
        let A = vectorScale(this.F,1/this.M,)

        // update the velocity
        let Adt = vectorScale(A,dt)
        this.V = vectorAdd(this.V,Adt)
    }

    updateP() {
        // get the distance traveled
        let Vdt = vectorScale(this.V,dt)

        // upadte the position
        this.P = vectorAdd(this.P,Vdt)
    };

    changeTrace() {
        this.tracing = true;
    };

    updateTrace() {
        if (this.tracing){
            // add point to trace, if it isn't already in there
            if (!this.trace.includes(this.P)) {
                this.trace.push(this.P);
            };
            // remove points if there are "too many"
            if (this.trace.length > traceMax){
                this.trace.shift()
            };

        } else {
            this.trace = [];
        };
    };
};

var bodies = [];

// for new planets
// !important: a primary body must already exist
function addSatelite(primary,name,colour,M,R,SMA,E,D){

    Pinit = new Vector((primary.P.x+SMA*(1+E)),primary.P.y)

    // T = 2pi * sqrt(SMA^3 / (G*M))
    // 2pi / T = 2pi / (2pi * sqrt(SMA^3 / (G*M))) = 1/sqrt(SMA^3 / (G*M)) = sqrt(G*M / SMA^3)
    // note: M = star's mass

    twoPiDivT = Math.sqrt(G*primary.M / SMA**3)

    step1 = twoPiDivT * SMA*Math.sqrt((1-E**2))
    step2 = step1 * Math.cos(twoPiDivT)
    Vinit = new Vector(0,step2)
    if (!D){
        Vinit = vectorScale(Vinit,-1);
    };

    bodies.push(new Body(name,colour,M,R,Pinit,Vinit))
};


// //star system 
// // the star
// star = new Body('Star','yellow',2.232*10**30,7.435*10**8,new Vector(0,0),new Vector(0,0))
// bodies.push(star)


// let massH1 = 4.018*10**24
// let radH1 = 5.682*10**6
// let SMAH1 = 2.473*10**11
// let eccH1 = 0.0255
// let dirH1 = true

// addSatelite(star,'H1','green',massH1,radH1,SMAH1,eccH1,dirH1)
// H1 = bodies[1]
// H1.tracing = true


// //solar system 
// bodies.push(new Body('Sun','yellow',1.9885*10**30,6.957*10**8,new Vector(0,0), new Vector(0,0)));
// addSatelite('Mercury','grey',3.3011*10**23,2.4397*10**6,5.791*10**10,0.205630,true,7.6*10**6)
// addSatelite('Venus','orange',4.8675*10**24,6.0518*10**6,1.0821*10**11,0.006772,true,1.9414*10**7)
// addSatelite('Earth','blue',5.972168*10**24,6.371*10**6,149598023000,0.0167086,true,3.1558*10**7)
// addSatelite('Mars','red',6.4171*10**23,3.3895*10**6,227939366000,0.0934,true,5.9355*10**7)
// addSatelite('Jupiter','yellow',1.8982*10**27,6.9911*10**7,778.479*10**9,0.0489,true,3.743*10**8)
// addSatelite('Saturn','orange',5.6834*10**26,58232*10**3,1.43353*10**9,0.0565,true,9.292*10**8)


// H1 planet-moon system
let massH1 = 4.018*10**24
let radH1 = 5.682*10**6
let SMAH1 = 2.473*10**11
let eccH1 = 0.01
let dirH1 = true

H1 = new Body('H1','Green',massH1,radH1,new Vector(0,0),new Vector(0,0))
bodies.push(H1)

let c = 0.02
let SMAmoons = 3*10**8
let eccMoons = 0.05

let M1 = 1.9*10**21
let R1 = 1.1*10**6
let P1init = new Vector(H1.P.x+(1-c)*SMAmoons*(1+eccMoons**2),H1.P.y)
let V1init = new Vector(0,(1-c)*Math.sqrt(G*H1.M / SMAmoons))

moon1 = new Body('moon1','Red',M1,R1,P1init,V1init)
bodies.push(moon1)

let M2 = 5.3*10**20
let R2 = 0.9*10**6
let P2init = new Vector(H1.P.x+(1+c)*SMAmoons*(1+eccMoons**2),H1.P.y)
let V2init = new Vector(0,(1+c)*Math.sqrt(G*H1.M / SMAmoons))

moon2 = new Body('moon2','Yellow',M2,R2,P2init,V2init)
bodies.push(moon2)

moon1.tracing = true
moon2.tracing = true

// adjust scale
var bodyNr = bodies.length;
var maxDist = 0;
for (let i=0; i<bodyNr; i++){
    let body = bodies[i];
    let pos = body.P;
    let dist = Math.sqrt(pos.x**2 + pos.y**2);
    maxDist = dist > maxDist ? dist : maxDist
};
scale = 2.2*maxDist/spaceHeight;


// interactions ----------------------------------------------------------------------------------
// translate the space
space.addEventListener('mousedown',function(event){
    // save mouse position
    mouseSave = new Vector(event.x,event.y)
    moving = true;

    // disable tracking
    trackIndex = -1;
})
space.addEventListener('mousemove',function(event){
    if (!moving) { return };

    // get mouse position
    mouse = new Vector(event.x,event.y)

    // get the difference vector
    let mouseDiff = vectorSub(mouse,mouseSave)

    // update the translation vector
    translate = vectorAdd(translate,mouseDiff)

    // save mouse position
    mouseSave = vectorScale(mouse,1)

    if (!play) { draw() };
});
space.addEventListener('mouseup',function(event){
    moving = false;
});

// selecting a body to follow
space.addEventListener('dblclick',function  (event){

    // get mouse position
    mouse = new Vector(event.x,event.y);
    // de-transform the mouse position
    mouseTransl = vectorSub(mouse,translate)

    trackIndex = -1;
    // go past every body until we find one that is "close enough"
    let maxDist = 20
    let bodyNr = bodies.length
    for (let i=0; i<bodyNr; i++){
        let body = bodies[i]
        let pos = vectorScale(body.P,1/scale)
        let diffVect = vectorSub(mouseTransl,pos)
        let dist = Math.sqrt(diffVect.x**2 + diffVect.y**2)

        if (dist <= maxDist){
            trackIndex = i

            // update translation vector
            translate = vectorSub(centre,pos)

            requestAnimationFrame(draw)

            break;
        };
    };
});

// advance one frame
main.addEventListener('keypress',function(event){
    if (event.key == ' '){
        manualAdvance = true;
        if (!play){
            requestAnimationFrame(draw);
        };
    };
});

// pausing
pauseBox.addEventListener('mouseover',function(event){
    pauseBox.style.backgroundColor = '#222166';
    if (play) {
        pauseBox.style.backgroundImage = 'url(planetSimMedia/pause.png)';
    } else {
        pauseBox.style.backgroundImage = 'url(planetSimMedia/play.png)';
    };
});
pauseBox.addEventListener('mouseleave',function(event){
    pauseBox.style.backgroundColor = '#100b27';
    pauseBox.style.backgroundImage = 'url(planetSimMedia/blank.png)';
});

pauseBox.addEventListener('mousedown',function(event){
    play = !play
    if (play) { 
        requestAnimationFrame(draw);
        pauseBox.style.backgroundImage = 'url(planetSimMedia/pause.png)';
    } else {
        pauseBox.style.backgroundImage = 'url(planetSimMedia/play.png)';
    };
});

// info box things
infoBox.addEventListener('mouseover',function(event){
    infoBox.style.backgroundColor = '#222166';
});
infoBox.addEventListener('mouseleave',function(event){
    if (!showInfo){
        infoBox.style.backgroundColor = '#100b27';
    };
});

infoBox.addEventListener('mousedown',function(event){
    showInfo = !showInfo;

    bitNr = infoBits.length
    infoHeight = 30*(bitNr+1)

    if (showInfo) {
        infoBox.style.backgroundColor = '#222166';
        for (i=0; i<bitNr; i++){
            bit = infoBits[i];
            bit.style.display = 'grid';
        };
        infoBox.style.height = `${infoHeight}px`;

    } else {
        for (i=0; i<bitNr; i++){
            bit = infoBits[i];
            bit.style.display = 'none';
        };
        infoBox.style.height = '30px';
    };
});

// other funcitons -------------------------------------------------------------------------------
function convertScientific(nr,digits){
    // get the nr's sign
    sign = nr >= 0 ? '+' : '-'

    // remove a possible -
    absNr = Math.abs(nr)

    // get the power
    power = Math.floor(Math.log10(absNr))

    // get the rounded number
    divNr = absNr/10**power
    roundNr = Math.round(divNr*10**digits)/10**digits

    // fill up with 0's
    currDigits = `${roundNr}`.length
    extra0s = ''
    if (currDigits == 1){
        extra0s = extra0s.concat('.')
        currDigits += 1
    };
    for (let i=0; i<digits-currDigits+1; i++){
        extra0s = extra0s.concat('0')
    }

    // add the pieces together
    convSciNr = `${sign}${roundNr}${extra0s}E${power}`
    
    return convSciNr
};

// draw ------------------------------------------------------------------------------------------
function draw(){
    let bodyNr = bodies.length;

    // clear screen
    ctx.clearRect(0,0,spaceWidth,spaceHeight);

    // draw each body to scale
    for (let i=0; i<bodyNr; i++){
        body = bodies[i];
        pos = body.P;
        rad = body.R;
        col = body.colour;
        
        drawPos = vectorTransform(pos,1/scale,translate)
        drawR = rad/scale;
        // so... not fully to scale...
        //drawR *= 20;
        //drawR = i > 0 ? drawR*10 : drawR

        ctx.beginPath();
        ctx.arc(drawPos.x,drawPos.y,drawR,0,2*Math.PI)
        ctx.fillStyle = col;
        ctx.fill();
        ctx.strokeStyle = col;
        ctx.stroke();

        // (possibly) draw the trace
        if (body.tracing){
            body.updateTrace()

            trace = body.trace;
            
            let traceLen = trace.length;
            for (let i=0; i<traceLen; i++){
                pos = trace[i];
                drawPos = vectorTransform(pos,1/scale,translate)
                drawR = rad/scale;
                // so... not fully to scale...
                //drawR *= 20;

                ctx.beginPath();
                ctx.arc(drawPos.x,drawPos.y,drawR,0,2*Math.PI)
                ctx.fillStyle = col;
                ctx.fill();
                ctx.strokeStyle = col;
                ctx.stroke();
            };
            
        };
        
    };
    if (play || manualAdvance) {   
        manualAdvance = false;

        // do calculations

        // advance time
        time += dt
        convFormatTime = convertScientific(time,4)
        infoTime.innerHTML = `t = ${convFormatTime}`

        // update forces
        for (let i=0; i<bodyNr; i++){
            body = bodies[i];
            body.updateF();
        };

        // update the velocities and then positions
        for (let i=0; i<bodyNr; i++){
            body = bodies[i]
            body.updateV()
            body.updateP()
        };

        // update translation if tracking
        if (trackIndex != -1){
            trackBody = bodies[trackIndex]
            pos = vectorScale(trackBody.P,1/scale)
            translate = vectorSub(centre,pos)
        };

        requestAnimationFrame(draw)
    };
};

draw()
