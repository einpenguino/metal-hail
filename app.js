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
        this.checkProximity()
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
                initialiseGame.generateMissileTargets()
            }
        }
    }
}

class Cannon {
    constructor (cannonX, cannonY, bulletType, ammo){
        this.cannonX = cannonX;
        this.cannonY = cannonY;
        this.bulletType = bulletType;
        this.ammo = ammo;
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
        // this.ammo -= 1
        projectiles[projectilesCounter] = new Projectile(projectilesCounter, 10, 'firebrick', 60, 0.2, this.cannonX, this.cannonY, clickX, clickY);
        projectilesCounter += 1;
        initialiseGame.score -= 5
    }
    draw(){ //Revise drawing method, additional cannons pivot in the midpoint  between cannons, breaks rotation
        this.updateCannon(x, y);
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        
        // ctx.translate(this.xPos, (this.yPos + this.cannonWidth/2))
        // ctx.rotate(-this.angleRotate)
        // ctx.translate(-this.xPos, -(this.yPos + this.cannonWidth/2))
        ctx.rect(this.xPos, this.yPos, this.cannonLength, this.cannonWidth);
        ctx.fillStyle = 'rgb( 20, 20, 30)';
        ctx.fill();
        ctx.closePath();

        // ctx.beginPath();
        // ctx.arc(this.cannonX, this.cannonY, 2, 0, Math.PI * 2);
        // ctx.fillStyle = "#0095DD";
        // ctx.fill();
        // ctx.closePath();
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
    }
    travel () {
        // this.checkProximity()
        if (Math.abs(this.startY - this.projY) >= this.distY || Math.abs(this.startX - this.projX) >= this.distX || this.explosionLogged === 1){
            // if (this.explosionLogged === 0) explosions[this.name] = this.name
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
        // this.travel(clickX, clickY);
        // this.explode();
        ctx.beginPath();
        ctx.arc(this.projX, this.projY, size, 0, Math.PI * 2);
        ctx.fillStyle = this.colour;
        ctx.fill();
        ctx.closePath();
    }
    drawTail(){
        
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
    travel () {
        this.checkProximity()
        if (Math.abs(this.startY - this.projY) >= this.distY || Math.abs(this.startX - this.projX) >= this.distX || this.explosionLogged === 1){
            // if (this.explosionLogged === 0) explosions[this.name] = this.name
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
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const xCoo = event.clientX - rect.left
    const yCoo = event.clientY - rect.top
    // console.log("x: " + xCoo + " y: " + yCoo)
    x = xCoo;
    y = yCoo;
}

function getClickPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const clickXCoo = event.clientX - rect.left
    const clickYCoo = event.clientY - rect.top
    // console.log("x: " + xCoo + " y: " + yCoo)
    clickX = clickXCoo;
    clickY = clickYCoo;
}

const mainLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // c1.draw()
    for (buildings of Object.keys(assets)){
        assets[buildings].draw()
    }
    for (proj of Object.keys(projectiles)){
        projectiles[proj].travel()
    }
    if (Object.keys(assets).length === 1) {
        alert('You Lose!')
        document.location.reload()
    } else window.requestAnimationFrame(mainLoop)
    document.querySelectorAll("#Score")[0].innerHTML = `Score: ${initialiseGame.score}`
    // console.log(projectiles)
    // console.log(explosions)
    // for (exp of Object.keys(explosions)){
    //     try{
    //     // console.log(projectiles[exp].destX, projectiles[exp].destY, projectiles[exp].explosionRadius)
    //     } catch {
    //     }
    // }
    
    // c2.draw()
    // console.log(projectiles)
    
    // console.log(`xPos ${c1.xPos}, yPos ${c1.yPos}, angle ${c1.angle}`)
}

let x = 0;
let y = 0;
let clickX = 0;
let clickY = 0;
let cannons = {};
let assets = {};
let projectiles = {};
let explosions = {};
let projectilesCounter = 0;
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
// let targetArr = [canvas.width/6, canvas.width/6 * 2, canvas.width/6 * 3, canvas.width/6 * 4, canvas.width/6 * 5]
canvas.addEventListener('mousemove', function(e) {
    getCursorPosition(canvas, e)
})
canvas.addEventListener('mousedown', function(e) {
    getClickPosition(canvas, e),
    assets['c1'].shoot()
    // new Enemy(projectilesCounter, 2, 50, 0.1,  Math.floor(Math.random() * canvas.width), 0, c1.cannonX, c1.cannonY).rainMissile()
    // c1.shoot(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top)
    // console.log(`xPos ${e.clientX - canvas.getBoundingClientRect().left}, yPos ${e.clientY - canvas.getBoundingClientRect().top}, angle ${c1.angle}`)
})

let initialiseGame = new GameStats(6, 1, 2500);
initialiseGame.populateBuildings()
initialiseGame.generateMissileTargets()
// let targetArr = initialiseGame.generateMissileTargets()
setInterval(() => {
    // new Enemy(projectilesCounter, 2, "orange", 50, 0.1,  Math.floor(Math.random() * canvas.width), 0, c1.cannonX, c1.cannonY).rainMissile()
    let randDestX = initialiseGame.targetArr[Math.floor(Math.random() * initialiseGame.targetArr.length)]
    new Enemy(projectilesCounter, 1.5, "orange", 50, 0.1,  Math.floor(Math.random() * canvas.width), 0, randDestX, assets['c1'].cannonY).rainMissile()
    initialiseGame.score += 1 * Object.keys(assets).length
    

}
, initialiseGame.spawnInterval)

window.requestAnimationFrame(mainLoop)
// setInterval(mainLoop, 10)