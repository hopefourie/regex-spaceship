import Player from "../entity/Player";
import Ground from "../entity/Ground";
import PlatformOne from "../entity/PlatformOne";
import PlatformTwo from "../entity/PlatformTwo";
import Gun from "../entity/Gun";
import Laser from "../entity/Laser";
import Baby from "../entity/Baby";
import Mushroom from "../entity/Mushroom";
import Floateye from "../entity/Floateye";
import End from "../entity/End";

/**
 *
 * @param {Phaser.Scene} scene
 * @param {number} totalWidth
 * @param {string} texture
 * @param {number} scrollFactor
 */
let mushX;
let mushY;
let floatX;
let floatY;

export default class FgScene extends Phaser.Scene {
  constructor() {
    super("FgScene");
    this.collectGun = this.collectGun.bind(this);
    this.fireLaser = this.fireLaser.bind(this);
    this.hit = this.hit.bind(this);
    this.gameOver = false;
    this.overlapCollider = 0;
  }

  preload() {
    //SPRITES
    this.load.spritesheet("bubble", "assets/spriteSheets/bubble_run.png", {
      frameWidth: 35,
      frameHeight: 45,
    });
    this.load.spritesheet("baby", "assets/spriteSheets/baby_run.png", {
      frameWidth: 18,
      frameHeight: 32,
    });
    this.load.spritesheet("mushroom", "assets/spriteSheets/mushroom.png", {
      frameWidth: 35,
      frameHeight: 45,
    });

    this.load.spritesheet("floateye", "assets/spriteSheets/floateye.png", {
      frameWidth: 38,
      frameHeight: 35,
    });

    this.load.spritesheet(
      "coke",
      "assets/backgrounds/warpedcity/ENVIRONMENT/props/banner-coke/banner-coke-sheet.png",
      {
        frameWidth: 27,
        frameHeight: 78,
      }
    );
    this.load.image("gun", "assets/sprites/gun.png");
    this.load.image("laser", "assets/sprites/laserBolt.png");
    this.load.image("heart", "assets/sprites/heart.png");

    this.load.image(
      "far-buildings",
      "assets/backgrounds/cyberpunk/long/far-buildings.png"
    );
    this.load.image(
      "back-buildings",
      "assets/backgrounds/cyberpunk/long/back-buildings.png"
    );
    this.load.image(
      "foreground",
      "assets/backgrounds/cyberpunk/long/foreground.png"
    );
    this.load.image("ground", "assets/backgrounds/cyberpunk/long/ground.png");
    this.load.image(
      "sushi",
      "assets/backgrounds/warpedcity/ENVIRONMENT/props/banner-sushi/banner-sushi-1.png"
    );
    this.load.image(
      "coke1",
      "assets/backgrounds/warpedcity/ENVIRONMENT/props/banner-coke/banner-coke-1.png"
    );
    this.load.image(
      "coke2",
      "assets/backgrounds/warpedcity/ENVIRONMENT/props/banner-coke/banner-coke-2.png"
    );

    this.load.image(
      "coke3",
      "assets/backgrounds/warpedcity/ENVIRONMENT/props/banner-coke/banner-coke-3.png"
    );
    this.load.image(
      "end",
      "assets/backgrounds/warpedcity/ENVIRONMENT/props/banner-arrow.png"
    );

    //SOUNDS
    this.load.audio("jump", "assets/audio/jump.wav");
    this.load.audio("achieve", "assets/audio/achieve.wav");
    this.load.audio("laser", "assets/audio/laser.wav");
    this.load.audio("kill", "assets/audio/scream.wav");
  }

  createGround(x, y, count, texture) {
    const w = this.textures.get(texture).getSourceImage().width;
    let wid = x;
    for (let i = 0; i < count; i++) {
      this.groundGroup.create(wid, y, texture).setScale(3.1).alpha = 0;
      wid += w;
    }
  }

  createPlatformOne(x, y, count, texture) {
    const w = this.textures.get(texture).getSourceImage().width;
    let wid = x;
    for (let i = 0; i < count; i++) {
      this.platformGroupOne.create(wid, y, texture).setScale(3.1);
      wid += w * Math.random() * 200;
    }
  }

  createPlatformTwo(x, y, count, texture) {
    const w = this.textures.get(texture).getSourceImage().width;
    let wid = x;
    for (let i = 0; i < count; i++) {
      this.platformGroupTwo.create(wid, y, texture).setScale(3.1);
      wid += w * Math.random() * 200;
    }
  }

  createLooped(totalWidth, texture, scrollFactor) {
    const w = this.textures.get(texture).getSourceImage().width;
    const count = Math.ceil(totalWidth / w) * scrollFactor;

    let x = -150;
    for (let i = 0; i < count; ++i) {
      const m = this.add
        .image(x, game.config.height * 0.5, texture)
        .setScale(3.1)
        .setScrollFactor(scrollFactor);
      x += m.width * 1.8;
    }
  }
  // createMonster(x, y, texture) {
  //   if (texture === "mushroom") {
  //     x = 650;
  //     y = 200;
  //     this.mushroomGroup.create(x, y, texture).setScale(2.3);
  //   } else if (texture === "floateye") {
  //     x = 650;
  //     y = 200;
  //     this.floateyeGroup.create(x, y, texture).setScale(2.3);
  //   }
  // }

  advanceLevel() {
    console.log("points from inside advance level", game.config.points);
    this.scene.start("InterludeOne");
  }

  create() {
    // Create game entities
    // << CREATE GAME ENTITIES HERE >>

    const width = game.config.width;
    const height = game.config.height;
    const totalWidth = width * 20;

    //BACKROUND
    this.createLooped(totalWidth, "far-buildings", 0.08);
    this.createLooped(totalWidth, "back-buildings", 0.18);
    this.createLooped(totalWidth, "foreground", 0.23);

    //GROUND
    this.groundGroup = this.physics.add.staticGroup({ classType: Ground });
    this.createGround(0, 570, 40, "ground");
    // //MUSHROOM GROUP
    // this.mushroomGroup = this.physics.add.group({ classType: Mushroom });
    // //FLOATEYE GROUP
    // this.floateyeGroup = this.physics.add.group({ classType: Floateye });
    //MUSHROOM
    // this.createMonster(mushX, mushY, "mushroom");
    // this.createMonster(floatX, floatY, "floateye");

    //PLATFORMS1
    this.platformGroupOne = this.physics.add.staticGroup({
      classType: PlatformOne,
    });
    this.sushi = this.createPlatformOne(300, 370, 10, "sushi");

    // this.cokeSign = new PlatformTwo(this, 300, 200, "coke");

    this.platformGroupTwo = this.physics.add.staticGroup({
      classType: PlatformTwo,
    });
    this.cokeArray = this.createPlatformTwo(300, 200, 10, "coke1");

    // this.platformGroupTwo.getChildren().forEach(function (two) {
    //   two.body.setAllowGravity(false);
    // }, this);
    // this.platformGroupTwo.callAll("play", null, "coke");
    // this.platformGroupTwo.children.iterate(function (child) {
    //   child.play("coke");
    // });

    //TEXT
    this.pointText = this.add.text(20, 20, `points: ${game.config.points}`, {
      fontSize: 32,
      fontFamily: "Orbitron, sans-serif",
      fill: "#39ff14",
    });
    this.pointText.setScrollFactor(0);

    this.healthText = this.add.text(20, 60, `health: ${game.config.health}`, {
      fontSize: 32,
      fontFamily: "Audiowide, cursive",
      fill: "#39ff14",
    });
    this.healthText.setScrollFactor(0);

    //HEARTS
    this.hearts = this.physics.add.group({
      key: "heart",
      repeat: 11,
      setXY: { x: 2000, y: 0, stepX: 1500 },
    });

    this.hearts.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      child.setScale(0.06);
    });
    ///// SPRITES
    // this.player = new Player(this, 100, 200, "bubble").setScale(2);
    this.gun = new Gun(this, 300, 400, "gun").setScale(0.25);
    this.baby = new Baby(this, 30, 200, "baby").setScale(2);
    this.end = new End(this, 700, 200, "end");

    //GROUPS

    this.mushroomGroup = this.physics.add.group({ classType: Mushroom });
    this.floateyeGroup = this.physics.add.group({ classType: Floateye });
    this.mushroom = this.mushroomGroup
      .create(650, 200, "mushroom")
      .setScale(2.3);
    this.mushroom2 = this.mushroomGroup
      .create(1510, 200, "mushroom")
      .setScale(2.3);
    this.mushroom3 = this.mushroomGroup
      .create(3000, 200, "mushroom")
      .setScale(2.3);
    this.mushroom4 = this.mushroomGroup
      .create(4130, 200, "mushroom")
      .setScale(2.3);
    this.mushroom5 = this.mushroomGroup
      .create(6280, 200, "mushroom")
      .setScale(2.3);
    this.mushroom6 = this.mushroomGroup
      .create(8009, 200, "mushroom")
      .setScale(2.3);
    this.mushroom7 = this.mushroomGroup
      .create(9400, 200, "mushroom")
      .setScale(2.3);
    this.mushroom8 = this.mushroomGroup
      .create(10990, 200, "mushroom")
      .setScale(2.3);
    this.mushroom9 = this.mushroomGroup
      .create(12500, 200, "mushroom")
      .setScale(2.3);
    this.mushroom10 = this.mushroomGroup
      .create(14500, 200, "mushroom")
      .setScale(2.3);
    this.mushroom11 = this.mushroomGroup
      .create(15900, 200, "mushroom")
      .setScale(2.3);
    this.mushroom12 = this.mushroomGroup
      .create(19345, 200, "mushroom")
      .setScale(2.3);

    this.floateye = this.floateyeGroup
      .create(900, 50, "floateye")
      .setScale(2.3);

    this.floateye2 = this.floateyeGroup
      .create(1230, 50, "floateye")
      .setScale(2.3);
    this.floateye3 = this.floateyeGroup
      .create(3950, 50, "floateye")
      .setScale(2.3);
    this.floateye4 = this.floateyeGroup
      .create(4800, 50, "floateye")
      .setScale(2.3);
    this.floateye5 = this.floateyeGroup
      .create(6700, 50, "floateye")
      .setScale(2.3);
    this.floateye6 = this.floateyeGroup
      .create(9300, 50, "floateye")
      .setScale(2.3);
    this.floateye7 = this.floateyeGroup
      .create(11111, 50, "floateye")
      .setScale(2.3);
    this.floateye8 = this.floateyeGroup
      .create(12363, 50, "floateye")
      .setScale(2.3);
    this.floateye9 = this.floateyeGroup
      .create(14083, 50, "floateye")
      .setScale(2.3);
    this.floateye10 = this.floateyeGroup
      .create(17402, 50, "floateye")
      .setScale(2.3);
    this.floateye11 = this.floateyeGroup
      .create(19404, 50, "floateye")
      .setScale(2.3);
    this.floateye12 = this.floateyeGroup
      .create(20392, 50, "floateye")
      .setScale(2.3);

    //PHYSICS
    // this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.baby, this.groundGroup);
    this.physics.add.collider(this.gun, this.groundGroup);
    this.physics.add.collider(this.mushroomGroup, this.groundGroup);
    this.physics.add.collider(this.floateyeGroup, this.groundGroup);
    this.physics.add.collider(this.hearts, this.groundGroup);
    this.physics.add.collider(this.end, this.groundGroup);
    // this.physics.add.collider(this.mushroom, this.player);
    // this.physics.add.collider(this.floateye, this.player);

    this.physics.add.collider(this.hearts, this.platformGroupOne);
    this.physics.add.collider(this.baby, this.platformGroupOne);

    this.physics.add.overlap(
      this.floateyeGroup,
      this.baby,
      this.monsterHit,
      null,
      this
    );
    // this.physics.add.collider(
    //   this.mushroomGroup,
    //   this.player,
    //   // monsterHit,
    //   null,
    //   this
    // );
    // this.physics.add.collider(
    //   this.mushroomGroup,
    //   this.baby,
    //   // monsterHit,
    //   null,
    //   this
    // );
    // this.physics.add.collider(
    //   this.floateyeGroup,
    //   this.player,
    //   // monsterHit,
    //   null,
    //   this
    // );
    // this.physics.add.collider(
    //   this.floateyeGroup,
    //   this.baby,
    //   // monsterHit,
    //   null,
    //   this
    // );

    this.lasers = this.physics.add.group({
      classType: Laser,
      runChildUpdate: true,
      allowGravity: false,
    });

    //COLLISIONS
    this.physics.add.overlap(this.baby, this.gun, this.collectGun, null, this);
    // When the laser collides with the enemy
    this.physics.add.overlap(
      this.mushroomGroup,
      this.lasers,
      this.hit,
      null,
      this
    );
    this.physics.add.overlap(
      this.floateyeGroup,
      this.lasers,
      this.hit,
      null,
      this
    );

    this.physics.add.overlap(
      this.mushroomGroup,
      this.baby,
      this.monsterHit,
      null,
      this
    );

    this.physics.add.overlap(
      this.baby,
      this.hearts,
      this.collectHeart,
      null,
      this
    );
    this.physics.add.overlap(
      this.baby,
      this.end,
      this.advanceLevel,
      null,
      this
    );

    //MOVEMENT
    this.cursors = this.input.keyboard.createCursorKeys();

    //CAMERA
    // set workd bounds to allow camera to follow the player
    this.myCam = this.cameras.main;
    this.myCam.setBounds(0, 0, width * 20, height);
    this.cameras.main.startFollow(this.baby);

    //ANIMATIONS
    this.createAnimations();

    //SOUNDS
    this.jumpSound = this.sound.add("jump");
    this.heartSound = this.sound.add("achieve");
    this.laserSound = this.sound.add("laser");
    this.killSound = this.sound.add("kill");
    // Create collisions for all entities
    // << CREATE COLLISIONS HERE >>
  }
  monsterHit(monster, baby) {
    baby.anims.play("babyjump");
    game.config.health -= 0.07;
    this.healthText.setText(`health: ${Math.floor(game.config.health)}`);
    // baby.setTint(0xff000);
    // let timer = this.time.delayedCall(2000, this.clearRed(baby));

    // this.physics.world.removeCollider(this.overlapCollider);
    console.log("health", game.config.health);

    if (game.config.health < 1) {
      this.gameOver = true;
      baby.setTint(0xff0000);
      this.physics.pause();
    }
  }

  // time: total time elapsed (ms)
  // delta: time elapsed (ms) since last update() call. 16.666 ms @ 60fps
  update(time, delta) {
    // << DO UPDATE LOGIC HERE >>

    // this.platformGroupTwo.getChildren().forEach(function (two) {
    //   two.update();
    // }, this);
    // this.cokeSign.update();
    this.baby.update(this.cursors, this.jumpSound);

    this.mushroom.update();
    this.mushroom2.update();
    this.mushroom3.update();
    this.mushroom4.update();
    this.mushroom5.update();
    this.mushroom6.update();
    this.mushroom7.update();
    this.mushroom8.update();
    this.mushroom9.update();
    this.mushroom10.update();
    this.mushroom11.update();
    this.mushroom12.update();

    this.floateye.update();
    this.floateye2.update();
    this.floateye3.update();
    this.floateye4.update();
    this.floateye5.update();
    this.floateye6.update();
    this.floateye7.update();
    this.floateye8.update();
    this.floateye9.update();
    this.floateye10.update();
    this.floateye11.update();
    this.floateye12.update();
    this.gun.update(
      time,
      this.baby,
      this.cursors,
      this.fireLaser // Callback fn for creating lasers
    );
    // this.monsterHit(this.mushroomGroup, player);
    // this.monsterHit(this.floateyeGroup, player);
  }

  collectHeart(baby, heart) {
    heart.disableBody(true, true);
    game.config.health = Math.round(game.config.health + 1);
    this.healthText.setText(`health: ${game.config.health}`);
    this.heartSound.play();
  }

  fireLaser(x, y, left) {
    // These are the offsets from the player's position that make it look like
    // the laser starts from the gun in the player's hand
    const offsetX = 56;
    const offsetY = 14;
    const laserX = this.baby.x + (this.baby.facingLeft ? -offsetX : offsetX);
    const laserY = this.baby.y + offsetY;
    this.laserSound.play();
    // Create a laser bullet and scale the sprite down
    const laser = new Laser(
      this,
      laserX,
      laserY,
      "laser",
      this.baby.facingLeft
    ).setScale(0.25);
    // Add our newly created to the group
    this.lasers.add(laser);
  }

  // make the laser inactive and insivible when it hits the enemy
  // ENEMY LASER INTERACTIONS
  hit(monster, laser) {
    laser.setActive(false);
    laser.setVisible(false);
    monster.disableBody(true, true);
    this.killSound.play();
    game.config.points++;
    this.pointText.setText(`points: ${game.config.points}`);
  }
  //animations for player and baby sprites
  createAnimations() {
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("bubble", { start: 1, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "jump",
      frames: [{ key: "bubble", frame: 6 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "idleUnarmed",
      frames: [{ key: "bubble", frame: 1 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "idleArmed",
      frames: [{ key: "bubble", frame: 2 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "babyrun",
      frames: this.anims.generateFrameNumbers("baby", { start: 1, end: 6 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "babyjump",
      frames: [{ key: "baby", frame: 2 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "babyidleUnarmed",
      frames: [{ key: "baby", frame: 1 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "babyidleArmed",
      frames: [{ key: "baby", frame: 6 }],
      frameRate: 20,
    });
    //animations for mushroom
    this.anims.create({
      key: "mushroomrun",
      frames: this.anims.generateFrameNumbers("mushroom", {
        start: 1,
        end: 6,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "mushroomidle",
      frames: [{ key: "mushroom", frame: 1 }],
      frameRate: 20,
    });
    this.anims.create({
      key: "mushroomjump",
      frames: [{ key: "mushroom", frame: 6 }],
      frameRate: 20,
    });

    //animations for floateye
    this.anims.create({
      key: "floatfly",
      frames: this.anims.generateFrameNumbers("floateye", {
        start: 1,
        end: 6,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "floatidle",
      frames: [{ key: "floateye", frame: 1 }],
      frameRate: 20,
    });

    //animations for coke
    // this.anims.create({
    //   key: "coke",
    //   frames: this.anims.generateFrameNumbers("coke", {
    //     start: 1,
    //     end: 3,
    //   }),
    //   // frames: [{ key: "coke", frame: 1 }],
    //   frameRate: 20,
    //   repeat: -1,
    // });
    //animations for sushi
  }

  collectGun(baby, gun) {
    gun.disableBody(true, true);
    this.baby.armed = true;
  }
}
