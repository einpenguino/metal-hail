class GameSizing{
    constructor (){
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        this.aspectRatio = 16/9 //window Width / window Height
        this.gap = 60
    }
    updateWindow() {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;
        if (this.windowHeight / 9 < this.windowWidth / 16) { 
            document.getElementById('myCanvas').setAttribute('width', Math.floor((this.windowHeight - this.gap) * this.aspectRatio))
            document.getElementById('myCanvas').setAttribute('height', Math.floor(this.windowHeight - this.gap))
            document.getElementById('startCanvas').setAttribute('width', Math.floor((this.windowHeight - this.gap) * this.aspectRatio))
            document.getElementById('startCanvas').setAttribute('height', Math.floor(this.windowHeight - this.gap))
        } else {
            document.getElementById('myCanvas').setAttribute('width', Math.floor(this.windowWidth - (this.gap / this.aspectRatio)))
            document.getElementById('myCanvas').setAttribute('height',Math.floor((this.windowWidth / this.aspectRatio) - this.gap))
            document.getElementById('startCanvas').setAttribute('width', Math.floor(this.windowWidth - (this.gap / this.aspectRatio)))
            document.getElementById('startCanvas').setAttribute('height',Math.floor((this.windowWidth / this.aspectRatio) - this.gap))
        }
    }
} 

class GameStats {
    constructor(numAssets, numCannons, spawnInterval){
        this.score = 0;
        this.numAssets = numAssets;
        this.numCannons = numCannons;
        this.spawnInterval = spawnInterval;
        this.hardpoints = this.numAssets + this.numCannons
        this.targetArr = 0;
    }
    populateBuildings() {
        for (let i = 1; i <= this.hardpoints; i ++){
            if (i === Math.ceil(this.hardpoints / 2)) {
                // Spawn cannon in hardpoint in middle of screen
                assets['c1'] = new Cannon(canvas.width / (this.hardpoints + 1) * i, canvas.height)
            } else assets[i] = new Asset(i, canvas.width / (this.hardpoints + 1) * i, canvas.height, 20, 20)
        }
    }
    generateMissileTargets(){
        let targetArray = []
        for (let item of Object.keys(assets)){
            if (item !== 'c1') targetArray.push(assets[item].assetX );
        }
        this.targetArr = targetArray
    }
    
}
class Asset {
    constructor(name, assetX, assetY, width, height){
        this.name = name
        this.assetX = assetX;
        this.assetY = assetY;
        this.width = width;
        this.height = height;
        this.isDestroyed = 0;
    }
    draw() {
        if (godMode === 0) this.checkProximity()
        if (this.isDestroyed === 0){
        ctx.beginPath();
        ctx.rect(this.assetX - this.width / 2, this.assetY - this.height, this.width, this.height);
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.closePath();
        }
    }
    checkProximity(){
        for (let exp in explosions){
            if (Math.abs(this.assetX - projectiles[exp].projX) <= (projectiles[exp].explosionRadius + this.height) && Math.abs(this.assetY - projectiles[exp].projY) <= (projectiles[exp].explosionRadius + this.height)) {
                this.isDestroyed = 1
                delete assets[this.name]
                gameObj['initialiseGame'].generateMissileTargets()
            }
        }
    }
}

class Cannon {
    constructor (cannonX, cannonY){
        this.cannonX = cannonX;
        this.cannonY = cannonY;
        this.bulletType = '';
        this.ammoCost = 5;
        this.cannonLength = 75;
        this.cannonWidth = 10;
        this.angle = 0;
        this.angleRotate = 0;
        this.rotateRate = 30 * 180 / Math.PI;
        this.cursorAngle = 0;
        this.xPos = cannonX;
        this.yPos = cannonY - this.cannonWidth;
    }
    shoot() {
        if (gameObj['initialiseGame'].score >= this.ammoCost){
        projectiles[projectilesCounter] = new Projectile(projectilesCounter, 10, 'firebrick', 60, 0.2, this.cannonX, this.cannonY, clickX, clickY);
        projectilesCounter += 1;
        if (isEasy === 0 && godMode === 0) {
            gameObj['initialiseGame'].score -= this.ammoCost
        }
    }
    }
    draw(){
        ctx.beginPath();
        ctx.rect(this.xPos, this.yPos, this.cannonLength, this.cannonWidth);
        ctx.fillStyle = 'rgb( 20, 20, 30)';
        ctx.fill();
        ctx.closePath();
    }
    
    updateCannon(x, y){
        // this.angle = Math.atan((this.xPos - this.cannonX) / (this.yPos - this.cannonY));
        // this.angleRotate = Math.atan((x - this.cannonX) / (y + this.cannonY)) - this.angle;
        // this.angleRotate = Math.atan((this.yPos - y)/(x - this.xPos))
        // this.xPos = this.cannonX + this.cannonLength * Math.cos(this.angle);
        // this.yPos = this.cannonY - (this.cannonLength * Math.sin(this.angle));
        if (x - this.cannonX > 0) this.cursorAngle = Math.atan((this.cannonY - y) / (x - this.cannonX))
        else this.cursorAngle = Math.PI + Math.atan((this.cannonY - y) / (x - this.cannonX))
        this.angleRotate = Math.min(this.rotateRate, this.cursorAngle - this.angle)
        this.angle += this.angleRotate
}
}

class Projectile {
    constructor (number, speed, colour, explosionSize, explosionBloomRate, cannonX, cannonY, clickX, clickY){
        this.name = number;
        this.speed = speed;
        this.missileSize = 8;
        this.colour = colour;
        this.explosionSize = explosionSize;
        this.explosionRadius = this.missileSize;
        this.explosionBloomRate = explosionBloomRate;
        this.explosionLogged = 0;
        this.projX = cannonX;
        this.projY = cannonY;
        this.dx = 0;
        this.dy = 0;
        this.destX = clickX;
        this.destY = clickY;
        this.distX = Math.abs(this.destX - cannonX);
        this.distY = Math.abs(this.destY - cannonY);
        this.startX = cannonX;
        this.startY = cannonY;
        this.trailX = 0;
        this.trailY = 0;
        this.trailAngle = 0;
        this.trailLength = 100;
    }
    travel () {
        // this.checkProximity()
        if (Math.abs(this.startY - this.projY) >= this.distY || Math.abs(this.startX - this.projX) >= this.distX || this.explosionLogged === 1){
            this.dy = 0;
            this.dx = 0;
            this.explode();
        } else {
        this.dx = this.speed * (this.distX / (this.distX + this.distY));
        this.dy = this.speed * (this.distY / (this.distX + this.distY));
        
        if (this.destX < this.startX) this.projX -= this.dx;
        else this.projX += this.dx;
        this.projY -= this.dy;
        this.drawProj(this.missileSize)
        
        }
        
    }
    explode (){
        explosions[this.name] = this.name
        this.explosionLogged = 1
        if (this.explosionRadius <= this.explosionSize){
            this.drawProj(this.explosionRadius)
            this.explosionRadius += this.explosionBloomRate
        } else {
            delete projectiles[this.name]
            delete explosions[this.name]
        }
    }
    drawProj(size) {
        ctx.beginPath();
        ctx.arc(this.projX, this.projY, size, 0, Math.PI * 2);
        ctx.fillStyle = this.colour;
        ctx.fill();
        ctx.stroke();
        
        ctx.closePath();
    }
    rainMissile(){
        this.startX = Math.floor(Math.random() * canvas.width)
        this.startY = -this.missileSize
        projectiles[projectilesCounter] = new Enemy(projectilesCounter, this.speed, this.colour, this.explosionSize, this.explosionBloomRate, this.startX, this.startY , this.destX, this.destY)
        projectilesCounter += 1;
    }
    checkProximity(){
        for (let exp in explosions){
            if (Math.abs(this.projX - projectiles[exp].projX) <= (projectiles[exp].explosionRadius + this.missileSize/2) && Math.abs(this.projY - projectiles[exp].projY) <= (projectiles[exp].explosionRadius + this.missileSize/2)) {
                return this.explode()
            }
        }
    }

}

class Enemy extends Projectile {
    drawProj(size) {
        
        ctx.beginPath();
        ctx.arc(this.projX, this.projY, size, 0, Math.PI * 2);
        ctx.fillStyle = this.colour;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
    travel () {
        this.checkProximity()
        if (Math.abs(this.startY - this.projY) >= this.distY || Math.abs(this.startX - this.projX) >= this.distX || this.explosionLogged === 1){
            this.dy = 0;
            this.dx = 0;
            this.explode();
        } else {
        this.dx = this.speed * (this.distX / (this.distX + this.distY));
        this.dy = this.speed * (this.distY / (this.distX + this.distY));
        
        if (this.destX < this.startX) this.projX -= this.dx;
        else this.projX += this.dx;
        this.projY += this.dy;
        this.drawProj(this.missileSize)
        }
    }
    drawTail(){
        this.trailLength = gameSizing.windowHeight / 15;
        
        if(this.startX < this.destX){ //Moving diag right, clockwise rad as positive
            this.trailAngle = Math.PI + Math.atan(this.dy / this.dx)

        } else { //Moving diag left
            this.trailAngle = Math.atan((-this.dy) / (this.dx))
        }
        this.trailX = Math.cos(this.trailAngle) * this.trailLength + this.projX;
        this.trailY = Math.sin(this.trailAngle) * this.trailLength + this.projY;
        ctx.beginPath();
        ctx.moveTo(this.projX, this.projY)
        ctx.lineTo(this.trailX, this.trailY)
        ctx.strokeStyle = this.colour
        ctx.stroke()
    }
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const xCoo = event.clientX - rect.left
    const yCoo = event.clientY - rect.top
    x = xCoo;
    y = yCoo;
}

function getClickPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const clickXCoo = event.clientX - rect.left
    const clickYCoo = event.clientY - rect.top
    clickX = clickXCoo;
    clickY = clickYCoo;
}



const mainLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (buildings of Object.keys(assets)){
        assets[buildings].draw()
    }
    for (proj of Object.keys(projectiles)){
        projectiles[proj].travel()
    }
    if (Object.keys(assets).length === 1) {
        alert('You Lose!')
        document.location.reload()
    } else {
        if (pauseGame === 0) window.requestAnimationFrame(mainLoop)
    }
    document.querySelectorAll("#Score")[0].innerHTML = `Score: ${gameObj['initialiseGame'].score}`
}

let x = 0;
let y = 0;
let clickX = 0;
let clickY = 0;
let pauseGame = 0;
let isEasy = 0;
let godMode = 0;
let cannons = {};
let assets = {};
let projectiles = {};
let explosions = {};
let projectilesCounter = 0;
let gameSizing = new GameSizing();
let gameObj = {};
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');


window.addEventListener('resize', function(e) {
    gameSizing.updateWindow()
})

document.getElementById('easybutton').addEventListener('click', ()=>{
    document.getElementById('easy-exp').style.visibility = 'visible'
    document.getElementById('reg-exp').style.visibility = 'hidden'
    document.getElementById('insane-exp').style.visibility = 'hidden'
})

document.getElementById('regularbutton').addEventListener('click', ()=>{
    document.getElementById('easy-exp').style.visibility = 'hidden'
    document.getElementById('reg-exp').style.visibility = 'visible'
    document.getElementById('insane-exp').style.visibility = 'hidden'
})

document.getElementById('insanebutton').addEventListener('click', ()=>{
    document.getElementById('easy-exp').style.visibility = 'hidden'
    document.getElementById('reg-exp').style.visibility = 'hidden'
    document.getElementById('insane-exp').style.visibility = 'visible'
})

document.getElementById('StartGameButton').addEventListener('click', ()=>{

    document.getElementById("startpage").style.visibility = 'hidden'
    document.getElementById("startCanvas").style.visibility = 'hidden'
    document.getElementById("gamepage").style.visibility = 'visible'
    document.getElementById("myCanvas").style.visibility = 'visible'

    if (document.getElementById('easy-exp').style.visibility === 'visible') {
        isEasy = 1
        gameObj['initialiseGame'] = new GameStats(4, 1, 3000);
    }
    else if (document.getElementById('reg-exp').style.visibility === 'visible') gameObj['initialiseGame'] = new GameStats(6, 1, 2000);
    else {
        isEasy = 1
        gameObj['initialiseGame'] = new GameStats(10, 1, 300);
    }
    
    gameObj['initialiseGame'].populateBuildings()
    gameObj['initialiseGame'].generateMissileTargets()
    setInterval(() => {
        if (document.getElementById('myCanvas').style.visibility === 'visible'){
            if (pauseGame === 0){
                let randDestX = gameObj['initialiseGame'].targetArr[Math.floor(Math.random() * gameObj['initialiseGame'].targetArr.length)]
                new Enemy(projectilesCounter, 1.5, "orange", 50, 0.1,  Math.floor(Math.random() * canvas.width), 0, randDestX, assets['c1'].cannonY).rainMissile()
                gameObj['initialiseGame'].score += 1 * Object.keys(assets).length
            }
        }
    }
    
    , gameObj['initialiseGame'].spawnInterval)
    window.requestAnimationFrame(mainLoop)
})

canvas.addEventListener('mousemove', function(e) {
    getCursorPosition(canvas, e)
})
canvas.addEventListener('mousedown', function(e) {
    getClickPosition(canvas, e)
    if (pauseGame === 0) assets['c1'].shoot()
})


document.getElementById('pause_button').addEventListener('click', () => {
    if (pauseGame === 0 && canvas.style.visibility === 'visible')  {
        pauseGame = 1
        document.getElementById('pause_button').innerText = 'Resume'
    }
    else if (pauseGame === 1 && canvas.style.visibility === 'visible') {
        pauseGame = 0
        document.getElementById('pause_button').innerText = 'Pause'
        window.requestAnimationFrame(mainLoop) // Restart game
    }
})

document.getElementById('gmode').addEventListener('click', () => {
    if (godMode === 0 && canvas.style.visibility === 'visible')  {
        godMode = 1
        document.getElementById('gmode').innerText = 'Immortality is Fleeting'
    }
    else if (godMode === 1 && canvas.style.visibility === 'visible') {
        godMode = 0
        document.getElementById('gmode').innerText = 'Gmode Activate!'
    }
})

gameSizing.updateWindow()