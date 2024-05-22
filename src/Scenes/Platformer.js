class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 600;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 1.6;
        this.coinsCollected = 0;
        this.Level1Done = false;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);
        

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.hiddenLayer1 = this.map.createLayer("hiddenLayer1", this.tileset, 0, 0);
        this.hiddenLayer2 = this.map.createLayer("hiddenLayer2", this.tileset, 0, 0);
        this.hiddenLayer3 = this.map.createLayer("hiddenLayer3", this.tileset, 0, 0);
        this.winnerScreen = this.map.createLayer("winnerscreen", this.tileset, 0, 0);


        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        this.hiddenLayer1.setCollisionByProperty({
            collides: false
        });
        this.hiddenLayer2.setCollisionByProperty({
            collides: false
        });
        this.hiddenLayer3.setCollisionByProperty({
            collides: false
        });
        this.winnerScreen.setCollisionByProperty({
            collides: false
        });
        this.winnerScreen.setAlpha(0);
        this.hiddenLayer3.setAlpha(0);
        this.hiddenLayer2.setAlpha(0);
        this.hiddenLayer1.setAlpha(0); //make it invisible

        

        // TODO: Add createFromObjects here
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });
        this.flags = this.map.createFromObjects("Objects", {
            name: "flag",
            key: "tilemap_sheet",
            frame: 111
        });


        // TODO: Add turn into Arcade Physics here
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.flags, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        this.flagGroup = this.add.group(this.flags);

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.hiddenLayer1);
        this.physics.add.collider(my.sprite.player, this.hiddenLayer2);
        this.physics.add.collider(my.sprite.player, this.hiddenLayer3);
        this.physics.add.collider(my.sprite.player, this.winnerScreen);

        // TODO: Add coin collision handler
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
            this.coinsCollected = this.coinsCollected + 1;
            this.makeNewLayersVisible();
        });

        this.physics.add.overlap(my.sprite.player, this.flagGroup, (obj1, obj2) => {
            this.Level1Done = true;
            console.log(this.Level1Done);
            this.gameEnd();
        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        // this.input.keyboard.on('keydown-D', () => {
        //     this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
        //     this.physics.world.debugGraphic.clear()
        // }, this);

        // TODO: Add movement vfx here
        my.vfx.walking = this.add.particles(1, 5, "kenny-particles", {
            frame: ['circle_01.png', 'circle_01.png'],
            // TODO: Try: add random: true
            scale: {start: 0.03, end: 0.1},
            maxAliveParticles: 14,
            lifespan: 350,
            gravityY: 100,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();

        // TODO: add camera code here
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

    }
    gameEnd(){
        this.winnerScreen.setAlpha(100);
        this.winnerScreen.setCollisionByProperty({collides: true});
    }
    makeNewLayersVisible(){
        if(this.coinsCollected == 1){
            this.hiddenLayer1.setAlpha(100);
            this.hiddenLayer1.setCollisionByProperty({collides: true});
        }
        if(this.coinsCollected == 2){
            this.hiddenLayer2.setAlpha(100);
            this.hiddenLayer2.setCollisionByProperty({collides: true});
        }
        if(this.coinsCollected == 3){
            this.hiddenLayer3.setAlpha(100);
            this.hiddenLayer3.setCollisionByProperty({collides: true});
        }
    }
    update() {
        if(cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }
            

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }

        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
}