import 'phaser';

export default class ProgressBar extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, spriteKey) {
    super(scene, x, y, spriteKey);

    // << INITIALIZE PLAYER ATTRIBUTES HERE >>
    this.scene = scene;
    this.scene.add.existing(this);
  }

  // Check which controller button is being pushed and execute movement & animation
  update() {}
}
