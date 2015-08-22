var Config = {
    MonsterWidth: 48,
    MonsterHeight: 48,
    MonsterSpeed: 300,
    CameraElasticity: .01,
    CameraFriction: .21,
    CameraShake: 7,
    CameraShakeDuration: 800
};
/// <reference path="game.ts" />
/// <reference path="config.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Monster = (function (_super) {
    __extends(Monster, _super);
    function Monster(x, y) {
        _super.call(this, x, y, Config.MonsterWidth * 3, Config.MonsterHeight * 3);
        this.color = ex.Color.Red;
        this._mouseX = 0;
        this._mouseY = 0;
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
        this.rotation = new ex.Vector(this._mouseX - this.x, this._mouseY - this.y).toAngle();
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
var Hero = (function (_super) {
    __extends(Hero, _super);
    function Hero(x, y, width, height, color) {
        _super.call(this, x, y, width, height, color);
        this.addDrawing(Resources.TextureHero);
    }
    Hero.prototype.onInitialize = function (engine) {
        var _this = this;
        this.collisionType = ex.CollisionType.Active;
        this.on('collision', function (e) {
            if (e.other instanceof Treasure) {
                _this._treasure = e.other;
                e.other.scene.remove(e.other);
            }
        });
    };
    return Hero;
})(ex.Actor);
var Treasure = (function (_super) {
    __extends(Treasure, _super);
    function Treasure(x, y, width, height, color) {
        _super.call(this, x, y, width, height, color);
        this.addDrawing(Resources.TextureTreasure);
    }
    Treasure.prototype.onInitialize = function (engine) {
        this.collisionType = ex.CollisionType.Passive;
    };
    return Treasure;
})(ex.Actor);
/// <reference path="config.ts" />
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
game.currentScene.camera.zoom(2);
game.start(loader).then(function () {
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
    // magic here bro
    var map = new ex.Actor(0, 0, game.width, game.height);
    map.addDrawing(Resources.TextureMap);
    map.anchor.setTo(0, 0);
    game.add(map);
    monster = new Monster(game.width / 2, game.height / 2);
    game.add(monster);
    var hero = new Hero(50, 50, 50, 50, ex.Color.Red);
    game.add(hero);
    hero.setZIndex(1);
    var treasure = new Treasure(game.width - 50, game.height - 50, 50, 50, ex.Color.Yellow);
    game.add(treasure);
    hero.moveTo(treasure.x, treasure.y, 100);
});
