class Map extends ex.Scene {
   public static CellSize = 24;
   
   private _treasures: Treasure[];
   private _map: ex.Actor; // todo TileMap
   public _player: Monster;
   private _treasureProgress: ex.UIActor;
   private _lootProgress: ex.UIActor;
   private _monsterProgress: ex.UIActor;
   
   constructor(engine: ex.Engine) {
      super(engine);
      
      this._treasures = [];
   }
   
   public onInitialize() {
      this._map = new ex.Actor(0, 0, 960, 960);
      this._map.anchor.setTo(0, 0);
      this._map.addDrawing(Resources.TextureMap);
      this.add(this._map);

      // Initialize blood
      this.add(blood);
      this.buildWalls();
      
      // show GUI
      var progressBack = new ex.UIActor(60, 23, Config.TreasureProgressSize + 4, 40);
      progressBack.anchor.setTo(0, 0);
      progressBack.color = ex.Color.Black;
      this.add(progressBack);
      
      this._treasureProgress = new ex.UIActor(60, 27, Config.TreasureProgressSize, 32);
      this._treasureProgress.anchor.setTo(0, 0);
      this._treasureProgress.color = ex.Color.fromHex("#eab600");
      this.add(this._treasureProgress);
      
      this._lootProgress = new ex.UIActor(60, 27, 0, 32);
      this._lootProgress.anchor.setTo(0, 0);
      this._lootProgress.color = ex.Color.fromHex("#f25500");
      this.add(this._lootProgress);
      
      var treasureIndicator = new ex.UIActor(10, 10, 64, 64);
      treasureIndicator.addDrawing(Resources.TextureTreasureIndicator);
      this.add(treasureIndicator);
      
      var monsterProgressBack = new ex.UIActor(game.getWidth() - 66, 23, Config.MonsterProgressSize + 4, 40);
      monsterProgressBack.anchor.setTo(1, 0);
      monsterProgressBack.color = ex.Color.Black;
      this.add(monsterProgressBack);
      
      this._monsterProgress = new ex.UIActor(game.getWidth() - 66, 27, Config.MonsterProgressSize, 32);
      this._monsterProgress.anchor.setTo(1, 0);
      this._monsterProgress.color = ex.Color.fromHex("#ab2800");
      this.add(this._monsterProgress);
      
      var monsterIndicator = new ex.UIActor(game.getWidth() - 74, 10, 64, 64);
      monsterIndicator.addDrawing(Resources.TextureMonsterIndicator);
      this.add(monsterIndicator);
           
      
      //
      // todo load from Tiled
      //     
      var treasures = [
         this.getCellPos(19, 2),
         this.getCellPos(20, 2),
         this.getCellPos(19, 37),
         this.getCellPos(20, 37)
      ];
      
      for (var i = 0; i < treasures.length; i++) {
         var treasure = new Treasure(treasures[i].x, treasures[i].y);
         this.addTreasure(treasure);
      }
      
      var playerSpawn = this.getCellPos(Config.PlayerCellSpawnX, Config.PlayerCellSpawnY);
      this._player = new Monster(playerSpawn.x, playerSpawn.y);
      
      this.add(this._player);
   }
   
   public onActivate() {
      // start sounds
      SoundManager.start();
   }
   
   public getPlayer(): Monster {
      return this._player;
   }
   
   public resetPlayer() {
      this._player.health = Config.MonsterHealth;
      var playerSpawn = this.getCellPos(Config.PlayerCellSpawnX, Config.PlayerCellSpawnY);
      this._player.x = playerSpawn.x;
      this._player.y = playerSpawn.y;
   }
   
   public getTreasures(): Treasure[] {
      return this._treasures;
   }
   
   public getSpawnPoints(): ex.Point[] {
      // todo get from tiled
      
      return [
         this.getCellPos(0, 19),
         this.getCellPos(39, 19)
      ]
   }
   
   public buildWalls() {
      
      // copy from exported Tiled JSON "walls" layer
      var data = [58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 199, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 199, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58];
      
      var x, y, cell, wall: ex.Actor;
      for (x = 0; x < 40; x++) {
         for (y = 0; y < 40; y++) {
            cell = data[x + y * 40];
            
            if (cell == 58) { // wall tile
               wall = new ex.Actor(x * Map.CellSize, y * Map.CellSize, 24, 24);
               wall.traits.length = 0;
               wall.traits.push(new ex.Traits.OffscreenCulling());
               wall.anchor.setTo(0, 0);
               wall.addDrawing(Resources.TextureWall);
               wall.collisionType = ex.CollisionType.Fixed;
               
               this.add(wall);
            }
         }
      }
   }
   
   public getCellPos(x: number, y: number): ex.Point {
      return new ex.Point(Map.CellSize * x, Map.CellSize * y);
   }
   
   private _cameraVel = new ex.Vector(0, 0);
   
   public update(engine: ex.Engine, delta: number) {
      super.update(engine, delta);
      
      // update treasure indicator
      var total = this.getHoardAmount();
      var looting = _.sum(HeroSpawner.getHeroes(), x => x.getLootAmount());
      var curr = _.sum(this._treasures, (x) => x.getAmount());
      
      // % being looted right now
      var lootProgress = looting / total;
      
      // % level of hoard, if looting succeeds
      var lossProgress = curr / total;
      
      var progressWidth = Math.floor(lossProgress * Config.TreasureProgressSize);
      var lootWidth = Math.floor(lootProgress * Config.TreasureProgressSize);
      
      this._treasureProgress.setWidth(progressWidth);
      this._lootProgress.x = this._treasureProgress.getRight();
      this._lootProgress.setWidth(lootWidth);
      
      // update monster health bar
      var monsterHealth = this._player.health;
      var progress = monsterHealth / Config.MonsterHealth;
      
      this._monsterProgress.setWidth(Math.floor(progress * Config.MonsterProgressSize));
            
      if ((curr + looting) <= 0) {
         this._gameOver(GameOverType.Hoard);
      }

      var focus = game.currentScene.camera.getFocus().toVector();
      var position = new ex.Vector(this._player.x, this._player.y);
      var stretch = position.minus(focus).scale(Config.CameraElasticity);
      this._cameraVel = this._cameraVel.plus(stretch);
      var friction = this._cameraVel.scale(-1).scale(Config.CameraFriction);
      this._cameraVel = this._cameraVel.plus(friction);
      focus = focus.plus(this._cameraVel);
      game.currentScene.camera.setFocus(focus.x, focus.y);
   }
   
   private addTreasure(t: Treasure) {
      this._treasures.push(t);
      this.add(t);
   }   
   
   public getHoardAmount() {
      return this._treasures.length * Config.TreasureHoardSize;
   }
   
   public _gameOver(type: GameOverType) {
      //TODO
      console.log('game over');
      isGameOver = true;
      game.goToScene('gameover');
      gameOver.setType(type);
   }
   
   public onDeactivate() {
      SoundManager.stop();
   }
}