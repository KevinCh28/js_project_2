import Enemy from "./enemy.js"
import Defender from "./defender.js";
import Projectile from "./projectile.js";
import EnemyBig from "./enemy_big.js";

class GameView {
  constructor(ctx) {
    this.ctx = ctx;
    // this.game = new Board();
    this.time = 0;
    this.defenders = [];
    this.projectiles = [];
    this.enemies = [];
    this.resource = 400;
    this.highScore = 0;
    this.killCount = 0;

    this.backGroundImg = new Image();
    this.backGroundImg.src = 'images/game_background_3.png';
    this.backGroundImg.alt = 'alt';
  }

  start() {
    const canvas = document.getElementById('game-canvas');
    let that = this;
    this.ctx.clearRect(0, 0, 900, 600);
    this.ctx.drawImage(this.backGroundImg, 0, 0, 900, 600);
    // canvas.removeEventListener('click', restart)

    // this.mousePos = canvas.getBoundingClientRect() ///???

    if (this.time % 500 === 0) {
      let yPos = Math.floor(Math.random() * 5);   //random 0-4
      this.enemies.push(new Enemy(yPos + 1)); //random 0-4 + 1 = 1-5
    }

    if (this.killCount === 4) {
      let yPos = Math.floor(Math.random() * 5);
      this.enemies.push(new Enemy(yPos + 1));
      this.killCount -= 1
    }

    if (this.highScore % 2000 === 0 && this.highScore !== 0) {
      let yPos = Math.floor(Math.random() * 4);
      this.enemies.push(new EnemyBig(yPos + 1));
      this.highScore += 100
      this.resource += 300
    }

    if (this.highScore % 6000 === 0 && this.highScore !== 0) {
      let yPos = Math.floor(Math.random() * 4);
      this.enemies.push(new EnemyBig(yPos + 1));
      this.enemies.push(new EnemyBig(yPos + 1));
      this.enemies.push(new Enemy(yPos + 1));
      this.enemies.push(new Enemy(yPos + 1));
      this.highScore += 100
      this.resource += 300
    }

    // if (this.highScore % 2000 === 0 && this.highScore !== 0) {
    //   let yPos = Math.floor(Math.random() * 5);
    //   this.enemies.push(new Enemy(yPos + 1));
    //   this.enemies.push(new Enemy(yPos + 1));
    //   this.enemies.push(new Enemy(yPos + 1));
    //   this.highScore += 100
    // }

    this.repeat = requestAnimationFrame(this.start.bind(this))

    for (let i = 0; i < this.enemies.length; i++) {
      if (this.enemies[i].x < -35) {
        this.gameOver(this.ctx, canvas);
      }
    }

    canvas.addEventListener('click', function(e) {    //not sure how to bind 'this'
      let mousePos = that.getMousePosition(canvas, e)

      let posX = mousePos.x - (mousePos.x % 100);
      let posY = mousePos.y - (mousePos.y % 100);

      if (that.resource >= 100 && posY >= 100 && that.avaibleSpot(posX, posY)) {
        that.defenders.push(new Defender(posX, posY))
        that.resource -= 100
      }
    })

    this.myMenu(this.ctx);
    this.drawEnemy()
    this.drawDefenders()
    this.drawProjectiles()
    this.enemyCollidesWithDefender()
    this.projectileCollidedWithEnemy()
    this.time += 1;
  }
////////////////////////////
////////////////////////////
////////////////////////////

  gameOver(ctx, canvas) {
    ctx.fillStyle = 'red';
    ctx.font = '70px arial';
    ctx.fillText('GAME OVER', 250, 300);

    ctx.fillStyle = 'yellow'
    ctx.font = '20px Moonhouse';
    ctx.fillText('click to restart', 400, 400)
    cancelAnimationFrame(this.repeat)
    this.newGame(canvas)
  }

  avaibleSpot(posX, posY) {
    for (let i = 0; i < this.defenders.length; i ++) {
      if (this.defenders[i].x === posX && this.defenders[i].y === posY) {
        return false
      } 
    }
    return true
  }

  myMenu(ctx) {
    ctx.fillStyle = 'black';
    ctx.font = 'bold 20px arial';
    ctx.fillText('HIGH SCORE: ' + this.highScore, 400, 30);
    ctx.fillText('RESOURCE: ' + this.resource, 400, 70);
  }

  enemyCollidesWithDefender() {
    for (let i = 0; i < this.defenders.length; i++) {
      for (let j = 0; j < this.enemies.length; j++) {
        if (this.defenders[i] && this.enemies[j] && this.isCollidedWith(this.defenders[i], this.enemies[j])) {
          this.defenders[i].hp -= 1;
          this.enemies[j].speed = 0;

          if (this.defenders[i] && this.defenders[i].hp <= 0) {
            this.defenders.splice(i, 1);
            i--;
            this.enemies[j].speed = 1;
          }
        }
      }
    }
  }

  isCollidedWith(obj1, obj2) {            //assume obj1 is on the left side
    // if (obj1.y === obj2.y && (obj1.x + obj1.width) > obj2.x ) { 
    if (obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y)
    { 
      return true;
    } else {
      return false;
    }
  }

  drawDefenders() {
    if (this.defenders.length > 0) {
      for (let i = 0; i < this.defenders.length; i++) {
        this.defenders[i].draw(this.ctx)
        this.defenders[i].move()

        if (this.time % 150 === 0) {
          this.projectiles.push(new Projectile(this.defenders[i].x, this.defenders[i].y + 20))
        }
      }
    }
  }

  drawProjectiles() {
    if (this.projectiles.length > 0) {
      for (let i = 0; i < this.projectiles.length; i++) {
        this.projectiles[i].draw(this.ctx)
        this.projectiles[i].move()

        if (this.projectiles[i].x >= 800) {
          this.projectiles.splice(i, 1)
          i--;
        }
      }
    }
  }

  drawEnemy() {
    for (let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].draw(this.ctx)
      this.enemies[i].move()

      if (this.highScore > 6000) {
        this.enemies[i].speed = 2
      }
    }
  }
  
  projectileCollidedWithEnemy() {
    for (let i = 0; i < this.projectiles.length; i++) {
      for (let j = 0; j < this.enemies.length; j++) {
        if (this.projectiles[i] && this.enemies[j] && this.isCollidedWith(this.projectiles[i], this.enemies[j])) {
          this.projectiles.splice(i, 1);
          this.enemies[j].hp -= 20;
          i--;
        }
        if (this.enemies[j].hp <= 0) {
          this.enemies.splice(j, 1)
          this.resource += 50;
          this.highScore += 100;
          this.killCount += 1;
          j--;
        }
      }
    }
  }

  getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }

  newGame(canvas) {

    let restart = canvas.addEventListener('click', function() {
      // Program.restart()
      // document.restart()
      // document.reload()
      window.location.reload()
    })
  }

}





export default GameView;