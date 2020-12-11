import Phaser from "phaser";
import ProgressBar from "../entity/progressBar";
import ControlPanel from "../entity/ControlPanel";

export default class MainScene extends Phaser.Scene {
  constructor() {
    super("MainScene");
    this.state = {
      roomKey: "",
      gameScore: 0,
      scores: {},
      players: {},
      numPlayers: 0,
      gameStarted: false,
      allRandomTasks: [],
    };
    this.hasBeenSet = false;
    this.startClickable = true;
    this.beginTimer = false;
    this.randomTasks = [];
    this.overlapped = false;
    this.joined = false;
  }

  init(data) {
    this.socket = data.socket;
  }

  preload() {
    //LOADING SCREEN
    var progressBar = this.add.graphics();
    var progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);
    var width = this.cameras.main.width;
    var height = this.cameras.main.height;
    var loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: "Loading...",
      style: {
        font: "20px monospace",
        fill: "#ffffff",
      },
    });
    loadingText.setOrigin(0.5, 0.5);
    var percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: "0%",
      style: {
        font: "18px monospace",
        fill: "#ffffff",
      },
    });
    percentText.setOrigin(0.5, 0.5);

    //TEXTURES
    this.load.spritesheet("astronaut", "assets/spritesheets/astronaut3.png", {
      frameWidth: 29,
      frameHeight: 37,
    });
    this.load.image("lavatory", "assets/sprites/lavatory.png");
    this.load.image("birthdayList", "assets/sprites/birthdayList.png");
    this.load.image("cockpit", "assets/sprites/console_w.png");
    this.load.image("cargoHold", "assets/sprites/cargoHold1.png");
    this.load.image("engineRoom", "assets/sprites/engineroom/engineroom2.png");
    this.load.image("vendingMachine", "assets/sprites/vendingMachine.png");
    this.load.image("medBay", "assets/sprites/medbay/desk.png");
    this.load.image("mainroom", "assets/backgrounds/mainroom.png");
    this.load.image("tiles", "assets/spritesheets/scifi_space_rpg_tiles.png");
    this.load.image("instructions", "assets/sprites/folder.png");
    this.load.tilemapTiledJSON("map", "../assets/map/spaceship.json");
    this.load.atlas(
      "atlas",
      "../assets/atlas/atlas.png",
      "../assets/atlas/atlas.json"
    );
    this.load.image("speakerOn", "assets/sprites/speaker_on.png");
    this.load.image("speakerOff", "assets/sprites/speaker_off.png");
    this.load.image("volumeUp", "assets/sprites/volume_up.png");
    this.load.image("volumeDown", "assets/sprites/volume_down.png");
    this.load.image("startButton", "assets/sprites/startButton.png");

    //LOADING SCREEN LISTENERS
    this.load.on("progress", function (value) {
      percentText.setText(parseInt(value * 100) + "%");
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(250, 280, 300 * value, 30);
    });
    this.load.on("fileprogress", function (file) {});
    this.load.on("complete", function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    //AUDIO
    this.load.audio("music", "audio/Waiting_Room.mp3");

    this.load.audio("click", "audio/Button_Click.wav");
    this.load.audio("timerAlert", "audio/Timer_Alert.mp3");
    this.load.audio("birthdaySFX", "audio/ControlPanel/Birthday.wav");
    this.load.audio("cargoSFX", "audio/ControlPanel/Cargo.wav");
    this.load.audio("cockpitSFX", "audio/ControlPanel/Cockpit.wav");
    this.load.audio("engineSFX", "audio/ControlPanel/Engine.wav");
    this.load.audio("lavatorySFX", "audio/ControlPanel/Lavatory.mp3");
    this.load.audio("medbaySFX", "audio/ControlPanel/Medbay.wav");
    this.load.audio("vendingSFX", "audio/ControlPanel/Vending.wav");
    this.load.audio("folderFlip", "audio/Folder_Flip.wav");
  }

  create() {
    const scene = this;

    scene.music = scene.sound.add("music", {
      volume: 0.5,
      loop: true,
    });
    scene.music.play();

    scene.click = scene.sound.add("click");
    scene.timerAlert = scene.sound.add("timerAlert", { volume: 0.75 });
    scene.folderFlip = scene.sound.add("folderFlip", { volume: 0.75 });

    scene.birthdaySFX = scene.sound.add("birthdaySFX");
    scene.cargoSFX = scene.sound.add("cargoSFX");
    scene.cockpitSFX = scene.sound.add("cockpitSFX", { volume: 1.25 });
    scene.engineSFX = scene.sound.add("engineSFX");
    scene.lavatorySFX = scene.sound.add("lavatorySFX");
    scene.medbaySFX = scene.sound.add("medbaySFX");
    scene.vendingSFX = scene.sound.add("vendingSFX", { volume: 1.75 });

    // initialize enter key
    const keyObj = scene.input.keyboard.addKey("enter");
    keyObj.enabled = false;

    // tilemap
    this.map = this.make.tilemap({ key: "map" });
    this.tileset = this.map.addTilesetImage("spaceship", "tiles");
    this.belowLayer = this.map.createStaticLayer(
      "Below Player",
      this.tileset,
      0,
      0
    );
    this.worldLayer = this.map.createStaticLayer("World", this.tileset, 0, 0);
    this.wallLayer = this.map.createStaticLayer(
      "Wall Stuff",
      this.tileset,
      0,
      0
    );
    this.waitingRoomWall = this.map.createDynamicLayer(
      "Waiting Room Wall",
      this.tileset,
      0,
      0
    );
    this.worldLayer.setCollisionByProperty({ collides: true });
    this.wallLayer.setCollisionByProperty({ collides: true });
    this.waitingRoomWall.setCollisionByProperty({ collides: true });
    this.SpawnPoint = this.map.getObjectLayer("Spawn Point")["objects"];

    // LAUNCH WAITING ROOM
    scene.scene.launch("WaitingRoom", { socket: scene.socket });
    scene.physics.pause();
    this.otherPlayers = this.physics.add.group();
    if (!this.hasBeenSet) {
      this.hasBeenSet = true;
      // JOINED ROOM - SET STATE
      this.socket.on("setState", function (state) {
        const {
          roomKey,
          users,
          randomTasks,
          scores,
          gameScore,
          allRandomTasks,
        } = state;
        scene.physics.resume();
        // STATE
        scene.state.allRandomTasks = allRandomTasks;
        scene.state.roomKey = roomKey;
        scene.state.users = users;
        scene.randomTasks = randomTasks;
        scene.state.scores = scores;
        scene.state.gameScore = gameScore;

        // ROOM KEY
        scene.roomkeyText = scene.add.text(
          30,
          78,
          `Room Key: ${scene.state.roomKey}`,
          {
            fontSize: "20px",
            fill: "#00ff00",
          }
        );
        scene.roomkeyText.setScrollFactor(0);

        // //NEED 3 PLAYERS poster
        // scene.needPlayersPoster = scene.add.graphics();
        // scene.needPlayersPoster.lineStyle(1, 0x000000);
        // scene.needPlayersPoster.fillStyle(0xd3d3d3, 0.8);
        // scene.needPlayersPoster.strokeRect(1064, 270, 120, 50);
        // scene.needPlayersPoster.fillRect(1064, 270, 120, 50);
        // scene.needPlayersText = scene.add.text(
        //   1070,
        //   273,
        //   "You can start when 3 players enter the game",
        //   {
        //     fill: "#ff0000",
        //     fontSize: "12px",
        //     fontStyle: "bold",
        //     align: "center",
        //     wordWrap: { width: 130, height: 50, useAdvancedWrap: true },
        //   }
        // );

        //INSTRUCTIONS BUTTON
        scene.instructionsButton = scene.add
          .image(734, 545, "instructions")
          .setScrollFactor(0)
          .setScale(0.15);
        scene.instructionsText = scene.add
          .text(700, 570, "Instructions", {
            fill: "#ffffff",
            fontSize: "10px",
            fontStyle: "bold",
          })
          .setScrollFactor(0);

        scene.instructionsButton.setInteractive();
        scene.instructionsAreOpen = false;

        scene.instructionsButton.on("pointerdown", () => {
          scene.folderFlip.play();
          scene.scene.launch("Instructions");
        });

        //MAP BUTTON
        scene.mapButton = scene.add
          .image(734, 485, "instructions")
          .setScrollFactor(0)
          .setScale(0.15);
        scene.mapText = scene.add
          .text(700, 510, "Map", {
            fill: "#ffffff",
            fontSize: "10px",
            fontStyle: "bold",
          })
          .setScrollFactor(0);

        scene.mapButton.setInteractive();
        scene.mapButton.on("pointerdown", () => {
          scene.folderFlip.play();
          scene.scene.launch("SmallMap");
        });

        // scene.mapButton = scene.add
        //   .dom(400, 300, "button", "width: 100px; height: 25px", "map")
        //   .setOrigin(0)
        //   .setScrollFactor(0);
        // scene.mapButton.setInteractive();
        // scene.mapButton.on("pointerdown", () => {
        //   scene.scene.launch("SmallMap");
        // });

        //VOLUME
        scene.volumeSpeaker = scene.add
          .image(727, 65, "speakerOn")
          .setScrollFactor(0)
          .setScale(0.3);
        scene.volumeUp = scene.add
          .image(757, 65, "volumeUp")
          .setScrollFactor(0)
          .setScale(0.3);
        scene.volumeDown = scene.add
          .image(697, 65, "volumeDown")
          .setScrollFactor(0)
          .setScale(0.3);

        scene.volumeUp.setInteractive();
        scene.volumeDown.setInteractive();
        scene.volumeSpeaker.setInteractive();

        scene.volumeUp.on("pointerdown", () => {
          scene.volumeUp.setTint(0xc2c2c2);
          let newVol = scene.music.volume + 0.1;
          scene.music.setVolume(newVol);
          if (scene.music.volume < 0.2) {
            scene.volumeSpeaker.setTexture("speakerOn");
          }
          if (scene.music.volume >= 0.9) {
            scene.volumeUp.setTint(0xff0000);
            scene.volumeUp.disableInteractive();
          } else {
            scene.volumeDown.clearTint();
            scene.volumeDown.setInteractive();
          }
        });

        scene.volumeDown.on("pointerdown", () => {
          scene.volumeDown.setTint(0xc2c2c2);
          let newVol = scene.music.volume - 0.1;
          scene.music.setVolume(newVol);
          if (scene.music.volume <= 0.2) {
            scene.volumeDown.setTint(0xff0000);
            scene.volumeDown.disableInteractive();
            scene.volumeSpeaker.setTexture("speakerOff");
          } else {
            scene.volumeUp.clearTint();
            scene.volumeUp.setInteractive();
          }
        });

        scene.volumeDown.on("pointerup", () => {
          scene.volumeDown.clearTint();
        });
        scene.volumeUp.on("pointerup", () => {
          scene.volumeUp.clearTint();
        });

        scene.volumeSpeaker.on("pointerdown", () => {
          if (scene.volumeSpeaker.texture.key === "speakerOn") {
            scene.volumeSpeaker.setTexture("speakerOff");
            scene.music.setMute(true);
          } else {
            scene.volumeSpeaker.setTexture("speakerOn");
            scene.music.setMute(false);
          }
        });

        //TIMER
        scene.initialTime = 600;
        scene.timerLabel = scene.add.text(
          680,
          16,
          scene.formatTime(scene.initialTime),
          {
            fontSize: "32px",
            fill: "#ffffff",
          }
        );
        scene.timerLabel.setScrollFactor(0);

        //PROGRESS BAR
        scene.progressText = scene.add.text(30, 16, "Progress Tracker", {
          fontSize: "20px",
          fill: "#ffffff",
        });
        scene.progressText.setScrollFactor(0);
        scene.progressBar = new ProgressBar(scene, 30, 50);

        //ASSIGNED TASK LIST GRAPHICS RECTANGLE
        scene.taskListSqr = scene.add.graphics();
        scene.taskListSqr.lineStyle(1, 0xffffff);
        scene.taskListSqr.fillStyle(0xffffff, 0.5);
        scene.taskListSqr.strokeRect(30, 500, 265, 80);
        scene.taskListSqr.fillRect(30, 500, 265, 80);
        scene.taskListSqr.setScrollFactor(0);

        //ASSIGNED TASK LIST TEXT
        scene.tasksText = [];
        for (let i = 0; i < scene.randomTasks.length; i++) {
          const y = 508;
          let taskPhrase;
          switch (scene.randomTasks[i].nickname) {
            case "Recount Inventory":
              taskPhrase = "Recount Inventory in the Cargo Hold";
              break;
            case "Sterilize Samples":
              taskPhrase = "Sterilize Samples in the Med Bay";
              break;
            case "Reorganize Snacks":
              taskPhrase = "Reorganize Snacks in the Break Room";
              break;
            case "Check Birthday List":
              taskPhrase = "Check Birthdays in the Break Room";
              break;
            case "Debug Engine":
              taskPhrase = "Debug Engine in the Engine Room";
              break;
            case "Plunge Toilets":
              taskPhrase = "Plunge Toilets List in the Lavatory";
              break;
            case "Unscramble Maps":
              taskPhrase = "Unscramble Maps List in the Cockpit";
              break;
          }
          scene.tasksText.push({
            text: scene.add
              .text(35, y + 25 * i, taskPhrase, {
                fontSize: "12px",
                fill: "#000000",
                fontStyle: "bold",
              })
              .setScrollFactor(0),
            location: scene.randomTasks[i].location,
          });
        }
      });
    }

    this.socket.on("updateState", function (serverState) {
      scene.state = serverState;
      scene.progressBar.changeTaskAmount(scene.state.allRandomTasks.length);
    });

    // PLAYERS
    this.socket.on("currentPlayers", function (arg) {
      const { players, numPlayers } = arg;
      scene.state.numPlayers = numPlayers;
      Object.keys(players).forEach(function (id) {
        if (players[id].playerId === scene.socket.id) {
          scene.addPlayer(scene, players[id]);
        } else {
          scene.addOtherPlayers(scene, players[id]);
        }
      });
    });

    this.socket.on("newPlayer", function (arg) {
      const { playerInfo, numPlayers } = arg;
      scene.addOtherPlayers(scene, playerInfo);
      scene.state.numPlayers = numPlayers;
    });

    this.socket.on("playerMoved", function (playerInfo) {
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          const oldX = otherPlayer.x;
          const oldY = otherPlayer.y;
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
          if (oldX < playerInfo.x) {
            otherPlayer.anims.play("misa-right-walk", true);
          } else if (oldX > playerInfo.x) {
            otherPlayer.anims.play("misa-left-walk", true);
          } else if (oldY < playerInfo.y) {
            otherPlayer.anims.play("misa-front-walk", true);
          } else if (oldY > playerInfo.y) {
            otherPlayer.anims.play("misa-back-walk", true);
          }
        }
      });
    });

    this.socket.on("otherPlayerStopped", function (playerInfo) {
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.anims.stop(null, true);
        }
      });
    });
    this.cursors = this.input.keyboard.createCursorKeys();

    // DISCONNECT
    this.socket.on("disconnected", function (arg) {
      const { playerId, numPlayers } = arg;
      scene.state.numPlayers = numPlayers;
      if (scene.state.gameStarted) {
        scene.progressBar.changeTaskAmount(scene.progressBar.taskAmount - 3);
      }
      // if (scene.otherPlayers && scene.otherPlayers.getChildren.length) {
      scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
      // }
    });

    // INITIALIZE PROGRESS BAR
    this.socket.on("updateTaskAmount", function () {
      scene.progressBar.changeTaskAmount(scene.state.numPlayers * 3);
    });

    // PROGRESS BAR UPDATE
    this.socket.on("progressUpdate", function (arg) {
      const { gameScore } = arg;
      scene.progressBar.increase(gameScore - scene.state.gameScore);
      scene.state.gameScore = gameScore;
      if (scene.state.gameScore >= scene.progressBar.taskAmount) {
        scene.instructionsButton.destroy();
        scene.scene.stop("RegexScene");
        scene.physics.pause();
        scene.scene.launch("EndScene", {
          ...scene.state,
          socket: scene.socket,
          didWin: true,
        });
        scene.finalTime = scene.initialTime;
        scene.beginTimer = false;
      }
    });

    //LEADERBOARD SCORES UPDATE
    this.socket.on("updateLeaderboard", function (serverScores) {
      scene.state.scores = serverScores;
    });

    // CONTROL PANELS
    this.controlPanelGroup = this.physics.add.staticGroup({
      classType: ControlPanel,
    });
    this.controlPanelLavatory = this.controlPanelGroup
      .create(2470, 2444, "lavatory")
      .setScale(0.3);
    this.controlPanelBirthdayList = this.controlPanelGroup
      .create(1486, 1350, "birthdayList")
      .setScale(0.2);
    this.controlPanelCockpit = this.controlPanelGroup.create(
      3614,
      1952,
      "cockpit"
    );
    this.controlPanelCargoHold = this.controlPanelGroup.create(
      2460,
      1462,
      "cargoHold"
    );
    this.controlPanelEngineRoom = this.controlPanelGroup
      .create(715, 1878, "engineRoom")
      .setScale(0.8);
    this.controlPanelVendingMachine = this.controlPanelGroup.create(
      1310,
      1300,
      "vendingMachine"
    );
    this.controlPanelMedbay = this.controlPanelGroup
      .create(1936, 2160, "medBay")
      .setScale(0.8);

    // CONTROL PANELS: INTERACTIVITY
    scene.controlPanelVendingMachine.on("pointerdown", () => {
      scene.vendingSFX.play();
      scene.scene.launch("RegexScene", {
        ...scene.state,
        controlPanel: "vendingMachine",
        randomTask: scene.randomTasks.find(
          (task) => task.location === "vendingMachine"
        ),
        socket: scene.socket,
      });
      scene.physics.pause();
    });
    scene.controlPanelBirthdayList.on("pointerdown", () => {
      scene.birthdaySFX.play();
      scene.scene.launch("RegexScene", {
        ...scene.state,
        controlPanel: "birthdayList",
        randomTask: scene.randomTasks.find(
          (task) => task.location === "birthdayList"
        ),
        socket: scene.socket,
      });
      scene.physics.pause();
    });

    scene.controlPanelEngineRoom.on("pointerdown", () => {
      scene.engineSFX.play();
      scene.scene.launch("RegexScene", {
        ...scene.state,
        controlPanel: "engineRoom",
        randomTask: scene.randomTasks.find(
          (task) => task.location === "engineRoom"
        ),
        socket: scene.socket,
      });
      scene.physics.pause();
    });

    scene.controlPanelCargoHold.on("pointerdown", () => {
      scene.cargoSFX.play();
      scene.scene.launch("RegexScene", {
        ...scene.state,
        controlPanel: "cargoHold",
        randomTask: scene.randomTasks.find(
          (task) => task.location === "cargoHold"
        ),
        socket: scene.socket,
      });
      scene.physics.pause();
    });
    scene.controlPanelCockpit.on("pointerdown", () => {
      scene.cockpitSFX.play();
      scene.scene.launch("RegexScene", {
        ...scene.state,
        controlPanel: "cockpit",
        randomTask: scene.randomTasks.find(
          (task) => task.location === "cockpit"
        ),
        socket: scene.socket,
      });
      scene.physics.pause();
    });
    scene.controlPanelLavatory.on("pointerdown", () => {
      scene.lavatorySFX.play();
      scene.scene.launch("RegexScene", {
        ...scene.state,
        controlPanel: "lavatory",
        randomTask: scene.randomTasks.find(
          (task) => task.location === "lavatory"
        ),
        socket: scene.socket,
      });
      scene.physics.pause();
    });
    scene.controlPanelMedbay.on("pointerdown", () => {
      scene.medbaySFX.play();
      scene.scene.launch("RegexScene", {
        ...scene.state,
        controlPanel: "medBay",
        randomTask: scene.randomTasks.find(
          (task) => task.location === "medBay"
        ),
        socket: scene.socket,
      });
      scene.physics.pause();
    });

    // TINT ASSIGNED PANELS
    scene.socket.on("activatePanels", function () {
      scene.randomTasks.forEach((task) => {
        switch (task.location) {
          case "vendingMachine":
            scene.controlPanelVendingMachine.setTint(0xff0000);
            break;
          case "birthdayList":
            scene.controlPanelBirthdayList.setTint(0xff0000);
            break;
          case "engineRoom":
            scene.controlPanelEngineRoom.setTint(0xff0000);
            break;
          case "cargoHold":
            scene.controlPanelCargoHold.setTint(0xff0000);
            break;
          case "cockpit":
            scene.controlPanelCockpit.setTint(0xff0000);
            break;
          case "lavatory":
            scene.controlPanelLavatory.setTint(0xff0000);
            break;
          case "medBay":
            scene.controlPanelMedbay.setTint(0xff0000);
            break;
          default:
            console.log("no control panel matches to set active");
        }
      });
    });

    // IF TASK COMPLETED
    this.socket.on("setInactive", function (controlPanel) {
      // MARK COMPLETE
      for (let i = 0; i < scene.tasksText.length; i++) {
        let currentTask = scene.tasksText[i];
        if (currentTask.location === controlPanel) {
          currentTask.text.setText("Completed");
        }
      }
      // CLEAR PANEL TINT
      switch (controlPanel) {
        case "vendingMachine":
          scene.controlPanelVendingMachine.disableInteractive();
          scene.controlPanelVendingMachine.clearTint();
          scene.vendingMachineStatus = true;
          break;
        case "birthdayList":
          scene.controlPanelBirthdayList.disableInteractive();
          scene.controlPanelBirthdayList.clearTint();
          scene.birthdayListStatus = true;
          break;
        case "engineRoom":
          scene.controlPanelEngineRoom.disableInteractive();
          scene.controlPanelEngineRoom.clearTint();
          scene.engineRoomStatus = true;
          break;
        case "cargoHold":
          scene.controlPanelCargoHold.disableInteractive();
          scene.controlPanelCargoHold.clearTint();
          scene.cargoHoldStatus = true;
          break;
        case "cockpit":
          scene.controlPanelCockpit.disableInteractive();
          scene.controlPanelCockpit.clearTint();
          scene.cockpitStatus = true;
          break;
        case "lavatory":
          scene.controlPanelLavatory.disableInteractive();
          scene.controlPanelLavatory.clearTint();
          scene.lavatoryStatus = true;
          break;
        case "medBay":
          scene.controlPanelMedbay.disableInteractive();
          scene.controlPanelMedbay.clearTint();
          scene.medbayStatus = true;
          break;
        default:
          console.log("no control panel matches to set inactive");
      }
    });

    // START GAME FUNCTIONALITY:

    // START BUTTON
    scene.startButton = scene.add
      .image(400, 350, "startButton")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setScale(0.2);

    scene.startButton.setVisible(false);
    this.socket.on("destroyButton", function () {
      scene.waitingRoomWall.removeTileAt(27, 15);
      scene.waitingRoomWall.removeTileAt(28, 15);
      scene.waitingRoomWall.removeTileAt(29, 15);
      scene.waitingRoomWall.removeTileAt(30, 15);
      scene.startButton.destroy();
    });

    // START TIMER
    this.socket.on("startTimer", function () {
      scene.beginTimer = Date.now();
    });

    // RESUME PHYSICS: CLOSED REGEXSCENE
    scene.socket.on("mainSceneResumePhysics", function () {
      scene.physics.resume();
    });

    // ASTRONAUT
    this.astronaut = this.physics.add.sprite(1, 1, "atlas", "misa-front");
    this.astronaut.setVisible(false);

    // ANIMATIONS
    this.anims.create({
      key: "misa-left-walk",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "misa-left-walk.",
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "misa-right-walk",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "misa-right-walk.",
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "misa-front-walk",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "misa-front-walk.",
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "misa-back-walk",
      frames: this.anims.generateFrameNames("atlas", {
        prefix: "misa-back-walk.",
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }

  //UPDATE
  update(time) {
    const scene = this;
    //MOVEMENT
    if (this.astronaut) {
      const speed = 225;
      const prevVelocity = this.astronaut.body.velocity.clone();
      // Stop any previous movement from the last frame
      this.astronaut.body.setVelocity(0);
      // Horizontal movement
      if (this.cursors.left.isDown) {
        this.astronaut.body.setVelocityX(-speed);
      } else if (this.cursors.right.isDown) {
        this.astronaut.body.setVelocityX(speed);
      }
      // Vertical movement
      if (this.cursors.up.isDown) {
        this.astronaut.body.setVelocityY(-speed);
      } else if (this.cursors.down.isDown) {
        this.astronaut.body.setVelocityY(speed);
      }
      // Normalize and scale the velocity so that astronaut can't move faster along a diagonal
      this.astronaut.body.velocity.normalize().scale(speed);
      // Update the animation last and give left/right animations precedence over up/down animations
      if (this.cursors.left.isDown) {
        this.astronaut.anims.play("misa-left-walk", true);
      } else if (this.cursors.right.isDown) {
        this.astronaut.anims.play("misa-right-walk", true);
      } else if (this.cursors.up.isDown) {
        this.astronaut.anims.play("misa-back-walk", true);
      } else if (this.cursors.down.isDown) {
        this.astronaut.anims.play("misa-front-walk", true);
      } else {
        this.astronaut.anims.stop(null, true);
        // If we were moving, pick and idle frame to use
        if (prevVelocity.x < 0) this.astronaut.setTexture("atlas", "misa-left");
        else if (prevVelocity.x > 0)
          this.astronaut.setTexture("atlas", "misa-right");
        else if (prevVelocity.y < 0)
          this.astronaut.setTexture("atlas", "misa-back");
        else if (prevVelocity.y > 0)
          this.astronaut.setTexture("atlas", "misa-front");
      }
      // emit player movement
      var x = this.astronaut.x;
      var y = this.astronaut.y;
      if (
        this.astronaut.oldPosition &&
        (x !== this.astronaut.oldPosition.x ||
          y !== this.astronaut.oldPosition.y)
      ) {
        this.moving = true;
        this.socket.emit("playerMovement", {
          x: this.astronaut.x,
          y: this.astronaut.y,
          roomKey: scene.state.roomKey,
        });
        // emit player stopped
      } else if (this.joined && this.moving) {
        this.moving = false;
        this.socket.emit("playerStopped", {
          x: this.astronaut.x,
          y: this.astronaut.y,
          roomKey: scene.state.roomKey,
        });
      }
      // save old position data
      this.astronaut.oldPosition = {
        x: this.astronaut.x,
        y: this.astronaut.y,
        rotation: this.astronaut.rotation,
      };
    }

    //CONTROL PANEL OVERLAPS
    this.physics.add.overlap(
      scene.astronaut,
      scene.controlPanelBirthdayList,
      scene.highlightControlPanel,
      null,
      scene
    );
    this.physics.add.overlap(
      scene.astronaut,
      scene.controlPanelCargoHold,
      scene.highlightControlPanel,
      null,
      this
    );
    this.physics.add.overlap(
      scene.astronaut,
      scene.controlPanelCockpit,
      scene.highlightControlPanel,
      null,
      this
    );
    this.physics.add.overlap(
      scene.astronaut,
      scene.controlPanelEngineRoom,
      scene.highlightControlPanel,
      null,
      this
    );
    this.physics.add.overlap(
      scene.astronaut,
      scene.controlPanelLavatory,
      scene.highlightControlPanel,
      null,
      this
    );
    this.physics.add.overlap(
      scene.astronaut,
      scene.controlPanelMedbay,
      scene.highlightControlPanel,
      null,
      this
    );
    this.physics.add.overlap(
      scene.astronaut,
      scene.controlPanelVendingMachine,
      scene.highlightControlPanel,
      null,
      this
    );

    //CONTROL PANEL: NOT OVERLAPPED
    scene.checkOverlap(scene, scene.astronaut, scene.controlPanelBirthdayList);
    scene.checkOverlap(scene, scene.astronaut, scene.controlPanelCargoHold);
    scene.checkOverlap(scene, scene.astronaut, scene.controlPanelCockpit);
    scene.checkOverlap(scene, scene.astronaut, scene.controlPanelEngineRoom);
    scene.checkOverlap(scene, scene.astronaut, scene.controlPanelLavatory);
    scene.checkOverlap(scene, scene.astronaut, scene.controlPanelMedbay);
    scene.checkOverlap(
      scene,
      scene.astronaut,
      scene.controlPanelVendingMachine
    );

    // START BUTTON VISIBLE
    if (this.joined && this.startClickable === true && this.startButton) {
      this.startButton.setVisible(true);
      this.startButton.setInteractive();
      this.startButton.on("pointerdown", () => {
        scene.click.play();
        scene.socket.emit("startGame", scene.state.roomKey);
      });
      this.startClickable = false;
    }
    if (this.beginTimer) {
      this.countdown();
    }
  }

  highlightControlPanel(astronaut, controlPanel) {
    if (
      this.state.gameStarted &&
      this.randomTasks.some(
        (task) => task.location === controlPanel.texture.key
      )
    ) {
      switch (controlPanel.texture.key) {
        case "vendingMachine":
          if (!this.vendingMachineStatus) {
            controlPanel.setTint(0xbdef83);
            controlPanel.setInteractive();
          }
          break;
        case "birthdayList":
          if (!this.birthdayListStatus) {
            controlPanel.setTint(0xbdef83);
            controlPanel.setInteractive();
          }
          break;
        case "engineRoom":
          if (!this.engineRoomStatus) {
            controlPanel.setTint(0xbdef83);
            controlPanel.setInteractive();
          }
          break;
        case "cargoHold":
          if (!this.cargoHoldStatus) {
            controlPanel.setTint(0xbdef83);
            controlPanel.setInteractive();
          }
          break;
        case "cockpit":
          if (!this.cockpitStatus) {
            controlPanel.setTint(0xbdef83);
            controlPanel.setInteractive();
          }
          break;
        case "lavatory":
          if (!this.lavatoryStatus) {
            controlPanel.setTint(0xbdef83);
            controlPanel.setInteractive();
          }
          break;
        case "medBay":
          if (!this.medbayStatus) {
            controlPanel.setTint(0xbdef83);
            controlPanel.setInteractive();
          }
          break;
        default:
          console.log("error activating panel");
      }
    }
  }

  deactivateControlPanel(controlPanel) {
    switch (controlPanel.texture.key) {
      case "vendingMachine":
        if (!this.vendingMachineStatus) {
          controlPanel.setTint(0xff0000);
          controlPanel.disableInteractive();
        }
        break;
      case "birthdayList":
        if (!this.birthdayListStatus) {
          controlPanel.setTint(0xff0000);
          controlPanel.disableInteractive();
        }
        break;
      case "engineRoom":
        if (!this.engineRoomStatus) {
          controlPanel.setTint(0xff0000);
          controlPanel.disableInteractive();
        }
        break;
      case "cargoHold":
        if (!this.cargoHoldStatus) {
          controlPanel.setTint(0xff0000);
          controlPanel.disableInteractive();
        }
        break;
      case "cockpit":
        if (!this.cockpitStatus) {
          controlPanel.setTint(0xff0000);
          controlPanel.disableInteractive();
        }
        break;
      case "lavatory":
        if (!this.lavatoryStatus) {
          controlPanel.setTint(0xff0000);
          controlPanel.disableInteractive();
        }
        break;
      case "medBay":
        if (!this.medbayStatus) {
          controlPanel.setTint(0xff0000);
          controlPanel.disableInteractive();
        }
        break;
      default:
    }
  }

  checkOverlap(scene, player, controlPanel) {
    if (
      this.state.gameStarted &&
      this.randomTasks.some(
        (task) => task.location === controlPanel.texture.key
      )
    ) {
      const boundsPlayer = player.getBounds();
      const boundsPanel = controlPanel.getBounds();
      if (
        !Phaser.Geom.Intersects.RectangleToRectangle(boundsPlayer, boundsPanel)
      ) {
        scene.deactivateControlPanel(controlPanel);
      }
    }
  }

  addPlayer(scene, playerInfo) {
    scene.joined = true;
    scene.astronaut = scene.physics.add
      .sprite(playerInfo.x, playerInfo.y, "atlas", "misa-front")
      .setOrigin(0.5, 0.5)
      .setSize(30, 40)
      .setOffset(0, 24);

    switch (playerInfo.team) {
      case "red":
        scene.astronaut.setTint(0xffb8ea);
        break;
      case "blue":
        scene.astronaut.setTint(0xca3dcff);
        break;
      case "green":
        scene.astronaut.setTint(0xbfaaff);
        break;
      default:
        console.log("there was an error assigning player colors");
    }
    scene.astronaut.setVisible(true);
    scene.physics.add.collider(scene.astronaut, this.worldLayer);
    scene.physics.add.collider(scene.astronaut, scene.waitingRoomWall);

    //CAMERA
    scene.camera = scene.cameras.main;
    scene.camera.startFollow(scene.astronaut);
    scene.camera.setBounds(
      0,
      0,
      scene.map.widthInPixels,
      scene.map.heightInPixels
    );
  }

  addOtherPlayers(scene, playerInfo) {
    const otherPlayer = scene.add.sprite(
      playerInfo.x,
      playerInfo.y,
      "atlas",
      "misa-front"
    );
    switch (playerInfo.team) {
      case "red":
        otherPlayer.setTint(0xffb8ea);
        break;
      case "blue":
        otherPlayer.setTint(0xca3dcff);
        break;
      case "green":
        otherPlayer.setTint(0xbfaaff);
        break;
      default:
        console.log("there was an error assigning player colors");
    }
    otherPlayer.playerId = playerInfo.playerId;
    scene.otherPlayers.add(otherPlayer);
  }

  formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var partInSeconds = seconds % 60;
    partInSeconds = partInSeconds.toString().padStart(2, "0");
    return `${minutes}:${partInSeconds}`;
  }

  countdown() {
    const scene = this;
    const currentTime = Date.now();
    const secondsPassed = currentTime - this.beginTimer;

    if (secondsPassed > 999) {
      this.initialTime -= 1;

      this.socket.emit("sendTime", this.initialTime);

      this.timerLabel.setText(this.formatTime(this.initialTime));
      if (this.initialTime === 10) {
        scene.timerAlert.play();
        this.timerLabel.setStyle({ fill: "#ff0000" });
      }
      this.beginTimer = currentTime;
      if (this.initialTime === 0) {
        scene.instructionsButton.destroy();
        this.beginTimer = false;
        scene.physics.pause();
        scene.scene.stop("RegexScene");
        scene.music.stop();
        this.scene.launch("EndScene", {
          ...scene.state,
          socket: scene.socket,
          didWin: false,
        });
      }
    }
  }
}
