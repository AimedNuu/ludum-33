var Config = {
    MonsterWidth: 48,
    MonsterHeight: 48,
    MonsterSpeed: 300,
    MonsterAttackRange: 50,
    CameraElasticity: .01,
    CameraFriction: .21,
    CameraShake: 7,
    CameraShakeDuration: 800,
    // Spawn interval
    HeroSpawnInterval: 10000,
    // Max heroes to spawn at once
    HeroSpawnPoolMax: 5,
    TreasureStealAmount: 100,
    TreasureHoardSize: 1000
};
var Util = (function () {
    function Util() {
    }
    Util.pickRandom = function (arr) {
        return arr[ex.Util.randomIntInRange(0, arr.length - 1)];
    };
    return Util;
})();
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Map = (function (_super) {
    __extends(Map, _super);
    function Map(engine) {
        _super.call(this, engine);
        this._treasures = [];
    }
    Map.prototype.onInitialize = function () {
        this._map = new ex.Actor(0, 0, 960, 480);
        this._map.anchor.setTo(0, 0);
        this._map.addDrawing(Resources.TextureMap);
        this.add(this._map);
        //
        // todo load from Tiled
        //
        // one treasure for now
        var treasure = new Treasure(this._map.getWidth() - 50, this._map.getHeight() - 50, 50, 50, ex.Color.Yellow);
        this.addTreasure(treasure);
    };
    Map.prototype.getTreasures = function () {
        return this._treasures;
    };
    Map.prototype.getSpawnPoints = function () {
        // todo get from tiled
        return [
            this.getCellPos(1, 1),
            this.getCellPos(39, 1),
            this.getCellPos(2, 18)
        ];
    };
    Map.prototype.getCellPos = function (x, y) {
        return new ex.Point(Map.CellSize * x, Map.CellSize * y);
    };
    Map.prototype.addTreasure = function (t) {
        this._treasures.push(t);
        this.add(t);
    };
    Map.CellSize = 24;
    return Map;
})(ex.Scene);
/// <reference path="game.ts" />
/// <reference path="config.ts" />
var Monster = (function (_super) {
    __extends(Monster, _super);
    function Monster(x, y) {
        _super.call(this, x, y, Config.MonsterWidth * 3, Config.MonsterHeight * 3);
        this.color = ex.Color.Red;
        this._mouseX = 0;
        this._mouseY = 0;
        this._rays = new Array();
    }
    Monster.prototype.onInitialize = function (engine) {
        var _this = this;
        var that = this;
        // set the rotation of the actor when the mouse moves
        engine.input.pointers.primary.on('move', function (ev) {
            _this._mouseX = ev.x;
            _this._mouseY = ev.y;
        });
        var spriteSheet = new ex.SpriteSheet(Resources.TextureMonster, 3, 1, 40, 36);
        var idleAnim = spriteSheet.getAnimationForAll(engine, 500);
        idleAnim.loop = true;
        idleAnim.scale.setTo(2, 2);
        this.addDrawing("idle", idleAnim);
        var sprite = Resources.TextureMonster.asSprite().clone();
        sprite.scale.setTo(3, 3);
        this.addDrawing(sprite);
        var yValues = new Array(-0.62, -0.25, 0, 0.25, 0.62);
        for (var i = 0; i < yValues.length; i++) {
            var rayVector = new ex.Vector(1, yValues[i]);
            var rayPoint = new ex.Point(this.x, this.y);
            var ray = new ex.Ray(rayPoint, rayVector);
            that._rays.push(ray);
        }
    };
    Monster.prototype.update = function (engine, delta) {
        _super.prototype.update.call(this, engine, delta);
        // clear move
        this.dx = 0;
        this.dy = 0;
        // WASD
        if (engine.input.keyboard.isKeyPressed(ex.Input.Keys.W) ||
            engine.input.keyboard.isKeyPressed(ex.Input.Keys.Up)) {
            this.dy = -Config.MonsterSpeed;
        }
        if (engine.input.keyboard.isKeyPressed(ex.Input.Keys.S) ||
            engine.input.keyboard.isKeyPressed(ex.Input.Keys.Down)) {
            this.dy = Config.MonsterSpeed;
        }
        if (engine.input.keyboard.isKeyPressed(ex.Input.Keys.A) ||
            engine.input.keyboard.isKeyPressed(ex.Input.Keys.Left)) {
            this.dx = -Config.MonsterSpeed;
        }
        if (engine.input.keyboard.isKeyPressed(ex.Input.Keys.D) ||
            engine.input.keyboard.isKeyPressed(ex.Input.Keys.Right)) {
            this.dx = Config.MonsterSpeed;
        }
        var prevRotation = this.rotation;
        this.rotation = new ex.Vector(this._mouseX - this.x, this._mouseY - this.y).toAngle();
        //updating attack rays
        for (var i = 0; i < this._rays.length; i++) {
            this._rays[i].pos = new ex.Point(this.x, this.y);
            var rotationAmt = this.rotation - prevRotation;
            this._rays[i].dir = this._rays[i].dir.rotate(rotationAmt, new ex.Point(0, 0));
        }
    };
    Monster.prototype.debugDraw = function (ctx) {
        _super.prototype.debugDraw.call(this, ctx);
        //Debugging draw for LOS rays on the enemy
        _.forIn(this._rays, function (ray) {
            ctx.beginPath();
            ctx.moveTo(ray.pos.x, ray.pos.y);
            var end = ray.getPoint(Config.MonsterAttackRange);
            ctx.lineTo(end.x, end.y);
            ctx.strokeStyle = ex.Color.Chartreuse.toString();
            ctx.stroke();
            ctx.closePath();
        });
    };
    return Monster;
})(ex.Actor);
var Resources = {
    // SomeSound: new ex.Sound('../sounds/foo.mp3')
    TextureHero: new ex.Texture("images/hero.png"),
    TextureMonster: new ex.Texture("images/minotaur.png"),
    TextureTreasure: new ex.Texture("images/treasure.png"),
    TextureMap: new ex.Texture("images/map.png"),
    TextureTextDefend: new ex.Texture("images/text-defend.png")
};
var HeroStates;
(function (HeroStates) {
    HeroStates[HeroStates["Searching"] = 0] = "Searching";
    HeroStates[HeroStates["Looting"] = 1] = "Looting";
    HeroStates[HeroStates["Attacking"] = 2] = "Attacking";
    HeroStates[HeroStates["Fleeing"] = 3] = "Fleeing";
})(HeroStates || (HeroStates = {}));
var HeroSpawner = (function () {
    function HeroSpawner() {
    }
    HeroSpawner.spawnHero = function () {
        HeroSpawner._spawned++;
        // todo better spawning logic
        for (var i = 0; i < Math.min(Config.HeroSpawnPoolMax, HeroSpawner._spawned); i++) {
            var spawnPoints = map.getSpawnPoints();
            var spawnPoint = Util.pickRandom(spawnPoints);
            game.add(new Hero(spawnPoint.x, spawnPoint.y));
        }
    };
    HeroSpawner._spawned = 0;
    return HeroSpawner;
})();
var Hero = (function (_super) {
    __extends(Hero, _super);
    function Hero(x, y) {
        _super.call(this, x, y, 24, 24);
        this._treasure = 0;
        this.addDrawing(Resources.TextureHero);
        this._fsm = new TypeState.FiniteStateMachine(HeroStates.Searching);
        // declare valid state transitions
        this._fsm.from(HeroStates.Searching).to(HeroStates.Attacking, HeroStates.Looting);
        this._fsm.from(HeroStates.Looting).to(HeroStates.Fleeing);
        this._fsm.on(HeroStates.Searching, this.onSearching.bind(this));
        this._fsm.on(HeroStates.Looting, this.onLooting.bind(this));
        this._fsm.on(HeroStates.Fleeing, this.onFleeing.bind(this));
    }
    Hero.prototype.onInitialize = function (engine) {
        this.setZIndex(1);
        this.collisionType = ex.CollisionType.Active;
        this.on('collision', function (e) {
            if (e.other instanceof Treasure) {
                if (e.actor._treasure === 0) {
                    e.actor._treasure = e.other.steal();
                    e.actor._fsm.go(HeroStates.Looting);
                }
            }
        });
        this.onSearching();
    };
    Hero.prototype.onSearching = function (from) {
        // find treasures
        var treasures = map.getTreasures();
        // random treasure for now
        var loot = Util.pickRandom(treasures);
        // move to it
        this.moveTo(loot.x, loot.y, Hero.Speed);
    };
    Hero.prototype.onLooting = function (from) {
        var _this = this;
        // play animation
        this.delay(2000).callMethod(function () { return _this._fsm.go(HeroStates.Fleeing); });
    };
    Hero.prototype.onFleeing = function (from) {
        var _this = this;
        // find nearest exit
        var exit = map.getCellPos(19, 1);
        this.moveTo(exit.x, exit.y, Hero.FleeingSpeed).callMethod(function () { return _this.onExit(); });
    };
    Hero.prototype.onAttacking = function (from) {
        // stop any actions
        this.clearActions();
        // attack monster
    };
    Hero.prototype.onExit = function () {
        // play negative sound or something
        this.kill();
    };
    Hero.Speed = 100;
    Hero.FleeingSpeed = 60;
    return Hero;
})(ex.Actor);
var Treasure = (function (_super) {
    __extends(Treasure, _super);
    function Treasure(x, y, width, height, color) {
        _super.call(this, x, y, width, height, color);
        this._hoard = Config.TreasureHoardSize;
        this.addDrawing(Resources.TextureTreasure);
    }
    Treasure.prototype.onInitialize = function (engine) {
        this.collisionType = ex.CollisionType.Passive;
        this._label = new ex.Label(this._hoard.toString(), 0, 24, "Arial 14px");
        this.addChild(this._label);
    };
    Treasure.prototype.steal = function () {
        this._hoard -= Config.TreasureStealAmount;
        this._label.text = this._hoard.toString();
        return Config.TreasureStealAmount;
    };
    return Treasure;
})(ex.Actor);
/// <reference path="config.ts" />
/// <reference path="util.ts" />
/// <reference path="map.ts" />
/// <reference path="monster.ts" />
/// <reference path="resources.ts" />
/// <reference path="hero.ts" />
/// <reference path="treasure.ts" />
var game = new ex.Engine({
    canvasElementId: "game",
    width: 960,
    height: 480
});
game.setAntialiasing(false);
var loader = new ex.Loader();
// load up all resources in dictionary
_.forIn(Resources, function (resource) {
    loader.addResource(resource);
});
var monster = null;
// mess with camera to lerp to the monster
var cameraVel = new ex.Vector(0, 0);
game.on('update', function () {
    if (monster) {
        var focus = game.currentScene.camera.getFocus().toVector();
        var position = new ex.Vector(monster.x, monster.y);
        var stretch = position.minus(focus).scale(Config.CameraElasticity);
        cameraVel = cameraVel.plus(stretch);
        var friction = cameraVel.scale(-1).scale(Config.CameraFriction);
        cameraVel = cameraVel.plus(friction);
        focus = focus.plus(cameraVel);
        game.currentScene.camera.setFocus(focus.x, focus.y);
    }
});
var map = new Map(game);
game.start(loader).then(function () {
    // load map
    game.add("map", map);
    game.goToScene("map");
    // set zoom
    game.currentScene.camera.zoom(2);
    // defend intro
    var defendIntro = new ex.UIActor(game.width / 2, game.height / 2, 858, 105);
    defendIntro.anchor.setTo(0.5, 0.5);
    // defendIntro.scale.setTo(0.6, 0.6); doesn't work
    defendIntro.addDrawing(Resources.TextureTextDefend);
    defendIntro.opacity = 0;
    defendIntro.previousOpacity = 0;
    game.add(defendIntro);
    // fade don't work
    defendIntro.delay(1000).callMethod(function () { return defendIntro.opacity = 1; }).delay(2000).callMethod(function () { return defendIntro.kill(); });
    monster = new Monster(game.width / 2, game.height / 2);
    game.add(monster);
    var heroTimer = new ex.Timer(function () { return HeroSpawner.spawnHero(); }, Config.HeroSpawnInterval, true);
    game.add(heroTimer);
    HeroSpawner.spawnHero();
});
