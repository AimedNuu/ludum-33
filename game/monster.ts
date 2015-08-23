/// <reference path="game.ts" />
/// <reference path="config.ts" />

class Monster extends ex.Actor {
   public health: number = Config.MonsterHealth;
   
   private _mouseX: number;
   private _mouseY: number;
   
   private _rotation: number = 0;
   private _rays: ex.Ray[];
   private _attackable: Hero[]; // heroes that can be attacked during current update loop
   
   private _isAttacking: boolean = false;
   private _timeLeftAttacking: number = 0;
   
   constructor(x, y){
      super(x, y, Config.MonsterWidth, Config.MonsterHeight);
      this.color = ex.Color.Red;
      this._mouseX = 0;
      this._mouseY = 0;
      this._rays = new Array<ex.Ray>();
      this._attackable = new Array<Hero>();
      this.anchor = new ex.Point(0.35, 0.35);
      this.collisionType = ex.CollisionType.Active;
   }
   
   onInitialize(engine: ex.Engine): void {
      var that = this;
      
      // set the rotation of the actor when the mouse moves
      engine.input.pointers.primary.on('move', (ev: PointerEvent) => {
         this._mouseX = ev.x;
         this._mouseY = ev.y;
         
      });
      var downSpriteSheet = new ex.SpriteSheet(Resources.TextureMonsterDown, 14, 1, 96, 96);
      var rightSpriteSheet = new ex.SpriteSheet(Resources.TextureMonsterRight, 14, 1, 96, 96);
      var upSpriteSheet = new ex.SpriteSheet(Resources.TextureMonsterUp, 7, 1, 96, 96);
      
      var attackDownAnim = downSpriteSheet.getAnimationBetween(engine, 9, 13, Config.MonsterAttackTime/4);
      attackDownAnim.scale.setTo(2, 2);
      attackDownAnim.loop = true;
      this.addDrawing("attackDown", attackDownAnim);
      
      var walkDownAnim = downSpriteSheet.getAnimationByIndices(engine, [2, 3, 4, 5, 6, 7], 150);
      walkDownAnim.scale.setTo(2, 2);
      walkDownAnim.loop = true;
      this.addDrawing("walkDown", walkDownAnim);
      
      var attackUpAnim = upSpriteSheet.getAnimationBetween(engine, 2, 7, Config.MonsterAttackTime/4);
      attackUpAnim.scale.setTo(2, 2);
      attackUpAnim.loop = true;
      this.addDrawing("attackUp", attackUpAnim);
      
      var attackRightAnim = rightSpriteSheet.getAnimationBetween(engine, 9, 13, Config.MonsterAttackTime/4);
      attackRightAnim.scale.setTo(2, 2);
      attackRightAnim.loop = true;
      this.addDrawing("attackRight", attackRightAnim);
      
      var walkRightAnim = rightSpriteSheet.getAnimationByIndices(engine, [2, 3, 4, 5, 6, 7], 150);
      walkRightAnim.scale.setTo(2, 2);
      walkRightAnim.loop = true;
      this.addDrawing("walkRight", walkRightAnim);
      
      var attackLeftAnim = rightSpriteSheet.getAnimationBetween(engine, 9, 13, Config.MonsterAttackTime/4);
      attackLeftAnim.flipHorizontal = true;
      attackLeftAnim.scale.setTo(2, 2);
      attackLeftAnim.loop = true;
      this.addDrawing("attackLeft", attackLeftAnim);
      
      var walkLeftAnim = rightSpriteSheet.getAnimationByIndices(engine, [2, 3, 4, 5, 6, 7], 150);
      walkLeftAnim.flipHorizontal = true;
      walkLeftAnim.scale.setTo(2, 2);
      walkLeftAnim.loop = true;
      this.addDrawing("walkLeft", walkLeftAnim);
      
      var idleAnim = downSpriteSheet.getAnimationBetween(engine, 0, 2, 500);
      idleAnim.loop = true;
      idleAnim.scale.setTo(2, 2);
      this.addDrawing("idleDown", idleAnim);
      
      var idleUpAnim = upSpriteSheet.getAnimationBetween(engine, 0, 2, 500);
      idleUpAnim.loop = true;
      idleUpAnim.scale.setTo(2, 2);
      this.addDrawing("idleUp", idleUpAnim);
      
      var idleRightAnim = rightSpriteSheet.getAnimationBetween(engine, 0, 2, 500);
      idleRightAnim.scale.setTo(2, 2);
      idleRightAnim.loop = true;
      this.addDrawing("idleRight", idleRightAnim);
      
      var idleLeftAnim = rightSpriteSheet.getAnimationBetween(engine, 0, 2, 500);
      idleLeftAnim.flipHorizontal = true;
      idleLeftAnim.scale.setTo(2, 2);
      idleLeftAnim.loop = true;
      this.addDrawing("idleLeft", idleLeftAnim);
      
      
      var sprite = Resources.TextureMonsterRight.asSprite().clone();
      sprite.scale.setTo(2, 2);
      this.addDrawing("idleRight", sprite);
      this.setDrawing("idleDown");
      
      var yValues = new Array<number>(-0.62, -0.25, 0, 0.25, 0.62);
      _.forIn(yValues, (yValue) => {
         var rayVector = new ex.Vector(1, yValue);
         var rayPoint = new ex.Point(this.x, this.y);
         var ray = new ex.Ray(rayPoint, rayVector);
         that._rays.push(ray);
      });
      
      // attackda
      engine.input.pointers.primary.on("down", function (evt) {
         that._attack();
         that._isAttacking = true;
         that._timeLeftAttacking = Config.MonsterAttackTime;
      });
   }
   
   public update(engine: ex.Engine, delta: number): void {
      super.update(engine, delta);
      
      if (this.health <= 0) {
         map._gameOver();
      }
      
      this._attackable.length = 0;
      this._detectAttackable();
      
      // clear move
      this.dx = 0;
      this.dy = 0;
      
      // WASD
      if(engine.input.keyboard.isKeyPressed(ex.Input.Keys.W) || 
         engine.input.keyboard.isKeyPressed(ex.Input.Keys.Up)) {
            if(!this._isAttacking){
         this.dy = -Config.MonsterSpeed;
               this.setDrawing("idleUp");
      }
      }
      
      if(engine.input.keyboard.isKeyPressed(ex.Input.Keys.S) ||
         engine.input.keyboard.isKeyPressed(ex.Input.Keys.Down)) {
            if(!this._isAttacking) {
         this.dy = Config.MonsterSpeed;
               this.setDrawing("walkDown");
            }         
      }
      
      if(engine.input.keyboard.isKeyPressed(ex.Input.Keys.A) ||
         engine.input.keyboard.isKeyPressed(ex.Input.Keys.Left)) {
         if(!this._isAttacking) {
         this.dx = -Config.MonsterSpeed;
            this.setDrawing("walkLeft");
         }
      }
      
      if(engine.input.keyboard.isKeyPressed(ex.Input.Keys.D) ||
         engine.input.keyboard.isKeyPressed(ex.Input.Keys.Right)) {
         if(!this._isAttacking) {
         this.dx = Config.MonsterSpeed;
            this.setDrawing("walkRight");
         }
      }

      if(this.dx == 0 && this.dy == 0 && !this._isAttacking){
         this.setDrawing("idleDown");
      }

      var prevRotation = this._rotation;
      this._rotation = ex.Util.canonicalizeAngle(new ex.Vector(this._mouseX - this.x, this._mouseY - this.y).toAngle());
      
      if(this._isAttacking) {
      if(this._rotation < Math.PI/4 || this._rotation > Math.PI * (7/4)) {
         this.setDrawing("attackRight");
      }
      
      if(this._rotation > Math.PI/4 && this._rotation < Math.PI * (3/4)) {
         this.setDrawing("attackDown");
      }
      
      if(this._rotation > Math.PI * (3/4) && this._rotation < Math.PI * (5/4)){
         this.setDrawing("attackLeft");
      }
      
         if(this._rotation > Math.PI * (5/4) && this._rotation < Math.PI * (7/4)){
            this.setDrawing("attackUp");
         }
         this._timeLeftAttacking -= delta;
         if(this._timeLeftAttacking < 0){
            this._isAttacking = false;
         }
      }      
      
      // updating attack rays
      _.forIn(this._rays, (ray: ex.Ray) =>{
         ray.pos = new ex.Point(this.x, this.y);
         var rotationAmt = this._rotation - prevRotation;
         ray.dir = ray.dir.rotate(rotationAmt, new ex.Point(0, 0));
      });
      
      this.setZIndex(this.y);
   }
   
   private _detectAttackable() {
      _.forIn(HeroSpawner.getHeroes(), (hero: Hero) => {
         if (this._isHeroAttackable(hero)) {
            this._attackable.push(hero);
         }
      });
   }
   
   private _isHeroAttackable(hero: Hero) {
      var heroLines = hero.getLines();
      for (var i = 0; i < this._rays.length; i++) {
         for (var j = 0; j < heroLines.length; j++) {
            var distanceToIntersect = this._rays[i].intersect(heroLines[j]);
            if ((distanceToIntersect > 0) && (distanceToIntersect <= Config.MonsterAttackRange)) {
               return true;
            }
         }
      }
   }
   
   private _attack() {
      var hitHero = false;
      _.forIn(this._attackable, (hero: Hero) => {
         // hero.blink(500, 500, 5); //can't because moving already (no parallel actions support)
         game.currentScene.camera.shake(2, 2, 200);
         hero.Health--;
         hitHero = true;

         var origin = new ex.Vector(hero.x, hero.y);
         var dest = new ex.Vector(this.x, this.y);
         var a = origin.subtract(dest).toAngle();
         blood.splatter(hero.x, hero.y, Blood.BloodPixel, 0.7, 0.8, a);
      });
      if (hitHero) {
         Resources.AxeSwingHit.play();
      } else {
         Resources.AxeSwing.play();
      }
   }
  
   public getRotation(): number {
      return this._rotation;
   }
  
   public debugDraw(ctx: CanvasRenderingContext2D): void {
      super.debugDraw(ctx);
      // Debugging draw for attack rays
      _.forIn(this._rays, (ray: ex.Ray) => {
         ctx.beginPath();
         ctx.moveTo(ray.pos.x, ray.pos.y);
         var end = ray.getPoint(Config.MonsterAttackRange);
         ctx.lineTo(end.x, end.y);
         ctx.strokeStyle = ex.Color.Chartreuse.toString();
         ctx.stroke();
         ctx.closePath();
      });
   }
}