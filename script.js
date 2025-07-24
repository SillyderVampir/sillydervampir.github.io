
const body = document.getElementById('body');
const website = document.getElementById('website');

// debug things
const debugField = document.getElementById('debugField');
function updateDebug(){
    // debug things
    debugField.innerHTML = `
    Debug things:
    <br />width = ${windowWidth}
    <br />height = ${windowHeight}
    <br />websiteX = ${websiteX}
    <br />websiteY = ${websiteY}
    <br />mouseX = ${mousex} 
    <br />mouseY = ${mousey}
    <br />scrollY = ${scrolly}
    <br />
    <br />mouseRecx = ${mouseRecx}
    <br />mouseRexy = ${mouseRexy}
    `;
};

// resolution related things -----------------------------------------------------------------------------------------------
windowWidth = window.innerWidth;
windowHeight = window.innerHeight;

// make the site at least as tall as the device's resolution

// website recursion -------------------------------------------------------------------------------------------------------

// get the coordinates of the website in the website
var websitePosition = website.getBoundingClientRect();
var websiteX = websitePosition.left;
var websiteY = websitePosition.top;

// get mouse and scroll position
var mousex = 0;
var mousey = 0;
var scrolly = 0; // inverse direction of mouseY's y

// get the recursion's mouse position
var mouseRecx = 0;
var mouseRexy = 0;

window.addEventListener('mousemove', function(event){
    mousex = event.clientX;
    mousey = event.clientY;

    mouseRecx = mousex + 20; // temp
    mouseRexy = mousey + 20; // temp
    updateDebug();
});
window.addEventListener("scroll", function(event){
    scrolly = window.scrollY;
    updateDebug();
});




// run it once in the first place
updateDebug();
