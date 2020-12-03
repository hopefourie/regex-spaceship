import Phaser from "phaser";

export default class RegexScene extends Phaser.Scene {
  constructor() {
    super("RegexScene");
    this.state = {};
    // this.randomTask = {
    //   problem:
    //     "Matching optional characters: Try writing a pattern that uses the optionality metacharacter to match only the lines where one or more files were found.",
    //   matchArray: ["1 file found?", "2 files found?", "24 files found?"],
    //   skipArray: ["No files found."],
    //   completed: false,
    //   category: "one",
    // };
  }

  init(data) {
    this.users = data.users;
    this.randomTasks = data.randomTasks;
    this.randomTask = data.randomTask;
    this.scores = data.scores;
    this.gameScore = data.gameScore;
    this.socket = data.socket;
  }

  preload() {
    this.load.html("taskform", "assets/text/taskform.html");
  }

  async create() {
    const scene = this;

    console.log("random tasks altogether in this scene", this.randomTasks);
    console.log("random task in this scene !!", this.randomTask);
    //get an emition of the persons random task from their socket
    //assign random task to this.randomTask

    try {
      //sockets

      scene.graphics = scene.add.graphics();
      scene.graphics2 = scene.add.graphics();

      // for popup window
      scene.graphics.lineStyle(1, 0xffffff);
      scene.graphics.fillStyle(0xffffff, 0.5);

      // for boxes
      scene.graphics2.lineStyle(1, 0xffffff);
      scene.graphics2.fillStyle(0xffffff, 1);

      // popup window
      scene.graphics.strokeRect(25, 25, 750, 550);
      scene.graphics.fillRect(25, 25, 750, 550);

      // regex problem prompt
      scene.graphics2.strokeRect(50, 50, 325, 450);
      scene.graphics2.fillRect(50, 50, 325, 450);
      scene.add.text(53, 35, "Task Prompt", {
        fill: "#000000",
        fontSize: "20px",
        fontStyle: "bold",
      });

      scene.add.text(
        55,
        55,
        `${scene.randomTask.problem}
        Matches: ${scene.randomTask.matchArray.map(
          (string) => `
        ${string}`
        )}
        Skips:${scene.randomTask.skipArray.map(
          (string) => `
        ${string}`
        )}`,
        {
          fill: "#000000",
          fontSize: "20px",
          fontStyle: "bold",
          align: "left",
          wordWrap: { width: 320, height: 445, useAdvancedWrap: true },
        }
      );

      // input area
      scene.graphics2.strokeRect(425, 50, 325, 225);
      scene.graphics2.fillRect(425, 50, 325, 225);
      scene.add.text(430, 35, "Input", {
        fill: "#000000",
        fontSize: "20px",
        fontStyle: "bold",
      });

      // output area
      scene.graphics2.strokeRect(425, 325, 325, 175);
      scene.graphics2.fillRect(425, 325, 325, 175);

      scene.add.text(430, 310, "Output", {
        fill: "#000000",
        fontSize: "20px",
        fontStyle: "bold",
      });

      scene.exit = scene.add.text(55, 525, "Return", {
        fill: "#000000",
        fontSize: "30px",
        fontStyle: "bold",
      });
      scene.exit.setInteractive();
      scene.exit.on("pointerdown", () => {
        scene.scene.stop("RegexScene");
      });

      scene.inputElement = scene.add.dom(587, 163).createFromCache("taskform");

      // this.add.dom().createElement('div', 'background-color: lime; width: 220px; height: 100px; font: 48px Arial', 'Phaser');

      // if (scene.inputElement) {
      //   scene.inputElement.setVisible(true);
      // } else {
      //   scene.inputElement = scene.add
      //     .dom(587, 163)
      //     .createFromCache("taskform");
      // }
      scene.outputText = scene.add.text(430, 330, "temp", {
        fill: "#000000",
        fontSize: "20px",
        fontStyle: "bold",
        align: "left",
        wordWrap: { width: 320, height: 445, useAdvancedWrap: true },
      });
      scene.outputText.setVisible(false);

      scene.submitButton = scene.add.text(642, 525, "Submit", {
        fill: "#000000",
        fontSize: "30px",
        fontStyle: "bold",
      });
      scene.submitButton.setInteractive();

      scene.submitButton.on("pointerdown", () => {
        const inputText = scene.inputElement.getChildByName("code");
        if (inputText.value !== "") {
          scene.output = scene.handleInput(
            scene,
            inputText.value,
            scene.randomTask
          );
          scene.outputText.setText(scene.output.text);
          scene.outputText.setVisible(true);

          scene.isCorrect = scene.add.text(320, 525, "temp", {
            fill: "#000000",
            fontSize: "30px",
            fontStyle: "bold",
            boundsAlignH: "center",
          });
          scene.isCorrect.setVisible(false);
          if (scene.output.win) {
            scene.isCorrect.setText("Correct");
            scene.isCorrect.setVisible(true);
            scene.socket.emit("completedTask");
          } else {
            scene.isCorrect.setText("Incorrect");
            scene.isCorrect.setVisible(true);
          }
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  handleInput(scene, input, randomTask) {
    const regex = new RegExp(input);
    let result = false;
    if (randomTask.category === "one") {
      result = scene.validatorOne(regex, randomTask);
    } else if (randomTask.category === "two") {
      result = scene.validatorTwo(regex, randomTask);
    }
    return { text: `expected: potato\nyours: ${input}`, win: result };
  }

  validatorOne(regex, randomTask) {
    const matchResult = randomTask.matchArray.every((string) => {
      if (string.match(regex) === null) {
        return false;
      } else {
        return string.match(regex)[0] === string;
      }
    });
    const skipResult = randomTask.skipArray.every((string) => {
      if (string.match(regex) === null) {
        return true;
      } else {
        return string.match(regex)[0] !== string;
      }
    });
    const result = matchResult === true && skipResult === true;

    return result;
  }
  validatorTwo(regex, randomTask) {
    //waiting for category two tasks and algorithm
    const result = false;
    return result;
  }
}
