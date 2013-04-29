// Shared Databases
Players = new Meteor.Collection("Players");
Zones = new Meteor.Collection("Zones");

// ITE Copyright 2013 by Aria Bennett
// All rights reserved.
//
// This is my main source file for this 
// project.  Currently you can find nearly
// all relevant code to the project in this
// single .js file.  This file was designed 
// to be viewed with a fold method based on 
// spacing.  
//
// This is a private project,
// unless you have recieved express consent
// from me personally you should not be 
// viewing anything in this project.
//
// Thank you
// Aria Bennett

// Client
if (Meteor.isClient) {

  Accounts.ui.config({
    // Client UI Config
    passwordSignupFields: 'USERNAME_ONLY'
  });

  Meteor.methods({
    // Client Meteor.methods stubs
    incrementPlayerPosition: function (id, x, y) {
      Players.update(id, {$inc: {"pos.x": x}});
      Players.update(id, {$inc: {"pos.y": y}});
    },
  });
  
  function prewarm () {
    // Setup defaults for certain Session Variables
    Session.set("playerNamesEnabled", "1");
    Deps.autorun ( function () {
      if (Meteor.user()) {
        if (getPlayer = Players.findOne({"name.first": Meteor.user().username})) {
          playerCurrent_id = getPlayer._id;
          me = getPlayer;
          zone = Zones.findOne({name: me.zone.name});
          playersInZone = Players.find({"zone.name": getPlayer.zone.name, "online": "true"},
            {sort: {"pos.y": 1}}, {sort: {"pos.z": 1}}).fetch();
        }
      }
      if (!Meteor.user()) {
        playerCurrent_id = "";
        playersInZone = "";
      }
    });
  }

  function canvasMainResourcesDeclare () {

    imageMainPlayer = new Image();
    imageFaun = new Image();

    // CTCathedral Files
    ct_cathedral_1_1 = new Image();
    ct_cathedral_1_2 = new Image();
    ct_cathedral_1_3 = new Image();
    ct_cathedral_1_4 = new Image();
    /*
    imageBackground = new Image();
    imageCTCathedralAboveNoPass = new Image();
    imageCTCathedralAbovePass = new Image();
    imageCTCathedralBelowNoPass = new Image();
    imageCTCathedralBelowPass = new Image();
    */
  }

  function canvasMainResourcesPreload () {
    ct_cathedral_1_1.src = "assets/zones/ct_cathedral/64x64/rooms/1/1.png";
    ct_cathedral_1_2.src = "assets/zones/ct_cathedral/64x64/rooms/1/2.png";
    ct_cathedral_1_3.src = "assets/zones/ct_cathedral/64x64/rooms/1/3.png";
    ct_cathedral_1_4.src = "assets/zones/ct_cathedral/64x64/rooms/1/4.png";

    
    imageMainPlayer.src = "assets/test/magus_sheet_movement_big.png";
    imageFaun.src = "assets/Michael/CharacterModel-Faun128x256.png";
    /*
    imageBackground.src = "assets/test/ChronoTrigger600CathedralBG_Big.png";
    imageCTCathedralAboveNoPass.src = "assets/zones/ct_cathedral/64x64/above_nopass/1.png"; 
    imageCTCathedralAbovePass.src = "assets/zones/ct_cathedral/64x64/above_pass/1.png";
    imageCTCathedralBelowNoPass.src = "assets/zones/ct_cathedral/64x64/below_nopass/1.png";
    imageCTCathedralBelowPass.src = "assets/zones/ct_cathedral/64x64/below_pass/1.png";
    */
  }
  
  function canvasMainSetup () {
    window.requestAnimFrame = (function () {
      return window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame  ||
        window.mozRequestAnimationFrame     ||
        function( callback ){
          window.setTimeout(callback, 1000 / 60);
      };
    })();
    canvasMain = document.getElementById("canvasMain");
    canvasData = document.getElementById("canvasData");
    ctxMain = canvasMain.getContext("2d");
    ctxData = canvasData.getContext("2d");
    canvasMainResourcesDeclare();
    canvasMainResourcesPreload();
    sliceX = 0;
    sliceY = 0;
  }

  function drawCanvasMain () {
    // Draw updates to the main game canvas
    if (canvasMain.getContext && playerCurrent_id) {

      function clearCanvas () {
        // Clear Canvas
        ctxMain.clearRect (0, 0, 1024, 896);
      }

      function clearCanvasData () {
        ctxData.clearRect(0, 0, canvasData.width, canvasData.height);
      }

      function drawEnviroment (relationalObject, relation) {
        // relationalObject should be the player,
        // relation should be either above, below,
        // or both.
        //
        // NOTE: relational aspects of this function
        // are not implemented at this time, waiting
        // until enviroment structure is more apparent.

        
        if (playerCurrent_id) {

          function drawImageAtRelationalObject (image) {
            ctxMain.drawImage(image, 
              Math.min(-relationalObject.pos.x, 0), 
              Math.min(-relationalObject.pos.y, 0), 
              image.width,
              image.height);
          }

          if (relation === "below") {
            _.each(zone.layers.below, function (layer) {
              drawImageAtRelationalObject(window[layer]);
            });
          }
          else if (relation === "above") {
            _.each(zone.layers.above, function (layer) {
              drawImageAtRelationalObject(window[layer]);
            });
          }
        }
      }

      function drawPlayersOther(players, relationalObject, relation) {
        // Draws player characters who are >not< the main
        // player.
        // 
        // players should be a list of documents sorted by
        // their Y and Z coordinates.
        // 
        // relationalObject is intended to be the main player,
        // relation should be either "below", "above", or "both",
        // and will determine which players are drawn.
        // 
        // NOTE: Do not use "both" unless the layered position of the
        // relationalObject is unimportant!  
        
        if (relation === "below") {
          _.each(players, function (player) {
            if (playerCurrent_id !== player._id && 
                player.pos.y + (relationalObject.pos.y - player.pos.y)
                <= relationalObject.pos.y) {
              // Temporary player animation
              var playerSliceX = 0;
              var playerSliceY = 0;
              var relativeX = player.pos.x - relationalObject.pos.x 
                + Math.min(512 - player.sprite.size.display.x/2, 
                (512 - player.sprite.size.display.x/2 + relationalObject.pos.x));
              var relativeY = player.pos.y - relationalObject.pos.y 
                + Math.min(448 - player.sprite.size.display.y/2, 
                (448 - player.sprite.size.display.y/2 + relationalObject.pos.y));

              if (player.animation.facing === "left") {
                playerSliceX = player.sprite.slice.left.x;
                playerSliceY = player.sprite.slice.left.y;
              }
              else if (player.animation.facing === "right") {
                playerSliceX = player.sprite.slice.right.x;
                playerSliceY = player.sprite.slice.right.y;
              }
              else if (player.animation.facing === "up") {
                playerSliceX = player.sprite.slice.up.x;
                playerSliceY = player.sprite.slice.up.y;
              }
              else if (player.animation.facing === "down") {
                playerSliceX = player.sprite.slice.down.x;
                playerSliceY = player.sprite.slice.down.y;
              }
              ctxMain.drawImage(window[player.sprite.name], 
                playerSliceX, playerSliceY, 
                player.sprite.size.source.x, player.sprite.size.source.y,
                relativeX,
                relativeY,
                player.sprite.size.display.x, player.sprite.size.display.y);
                // Draw Name
                drawName(
                  player,
                  [relativeX + player.sprite.size.display.x/2, relativeY - 10]
                )
            }
          });
        }
        else if (relation === "above") {
          _.each(players, function (player) {
            if (playerCurrent_id !== player._id && 
                player.pos.y > relationalObject.pos.y) {
              // Temporary player animation
              var playerSliceX = 0;
              var playerSliceY = 0;
              var relativeX = player.pos.x - relationalObject.pos.x 
                + Math.min(512 - player.sprite.size.display.x/2, 
                (512 - player.sprite.size.display.x/2 + relationalObject.pos.x));
              var relativeY = player.pos.y - relationalObject.pos.y 
                + Math.min(448 - player.sprite.size.display.y/2, 
                (448 - player.sprite.size.display.y/2 + relationalObject.pos.y));

              if (player.animation.facing === "left") {
                playerSliceX = player.sprite.slice.left.x;
                playerSliceY = player.sprite.slice.left.y;
              }
              else if (player.animation.facing === "right") {
                playerSliceX = player.sprite.slice.right.x;
                playerSliceY = player.sprite.slice.right.y;
              }
              else if (player.animation.facing === "up") {
                playerSliceX = player.sprite.slice.up.x;
                playerSliceY = player.sprite.slice.up.y;
              }
              else if (player.animation.facing === "down") {
                playerSliceX = player.sprite.slice.down.x;
                playerSliceY = player.sprite.slice.down.y;
              }

              ctxMain.drawImage(window[player.sprite.name], 
                playerSliceX, playerSliceY, 
                player.sprite.size.source.x, player.sprite.size.source.y,
                relativeX, 
                relativeY,
                player.sprite.size.display.x, player.sprite.size.display.y);
                // Draw Name
                drawName(
                  player,
                  [relativeX + player.sprite.size.display.x/2, relativeY - 10]
                )
            }
          });
        }
        else if (relation === "both") {
          _.each(players, function (player) {
            if (playerCurrent_id !== player._id) {
              // Temporary player animation
              var playerSliceX = 0;
              var playerSliceY = 0;
              if (player.animation.facing === "left") {
                playerSliceX = player.sprite.slice.left.x;
                playerSliceY = player.sprite.slice.left.y;
              }
              else if (player.animation.facing === "right") {
                playerSliceX = player.sprite.slice.right.x;
                playerSliceY = player.sprite.slice.right.y;
              }
              else if (player.animation.facing === "up") {
                playerSliceX = player.sprite.slice.up.x;
                playerSliceY = player.sprite.slice.up.y;
              }
              else if (player.animation.facing === "down") {
                playerSliceX = player.sprite.slice.down.x;
                playerSliceY = player.sprite.slice.down.y;
              }
              ctxMain.drawImage(window[player.sprite.name], 
                playerSliceX, playerSliceY, 
                player.sprite.size.source.x, player.sprite.size.source.y,
                player.pos.x - relationalObject.pos.x + Math.min(448, (448 + relationalObject.pos.x)), 
                // 128 x 192
                player.pos.y - relationalObject.pos.y + Math.min(352, (352 + relationalObject.pos.y)),
                player.sprite.size.display.x, player.sprite.size.display.y);
            }
          });
        }
      }

      function drawTestSquare(style, draw) {
        ctxMain.fillStyle = "rgba(" + style[0] + "," + style[1] 
          + "," + style[2] + "," + style[3] + ")";
        ctxMain.fillRect(draw[0], draw[1], draw[2], draw[3]);
      }

      function drawPlayer(player) {
        // Draws a single player, currently designed only
        // to be used on the current player.

        // Temporary player facing animation
        if (Session.equals("keyArrowLeft", "down")) {
          sliceX = player.sprite.slice.left.x;
          sliceY = player.sprite.slice.left.y;
        }
        else if (Session.equals("keyArrowUp", "down")) {
          sliceX = player.sprite.slice.up.x;
          sliceY = player.sprite.slice.up.y;
        }
        else if (Session.equals("keyArrowRight", "down")) {
          sliceX = player.sprite.slice.right.x;
          sliceY = player.sprite.slice.right.y;
        }
        else if (Session.equals("keyArrowDown", "down")) {
          sliceX = player.sprite.slice.down.x;
          sliceY = player.sprite.slice.down.y;
        }
        

        // Draw current player 448, 352
        // 128 x 192
        ctxMain.drawImage(window[player.sprite.name], 
          sliceX, sliceY, 
          player.sprite.size.source.x, player.sprite.size.source.y,
          Math.min(512 - (player.sprite.size.display.x/2), 
          (512 - (player.sprite.size.display.x/2) + player.pos.x)), 
          Math.min(448 - (player.sprite.size.display.y/2), 
          (448 - (player.sprite.size.display.y/2) + player.pos.y)), 
          player.sprite.size.display.x, player.sprite.size.display.y);
        drawName(
          player,
          [Math.min(512, 
            (512 + player.pos.x)), 
            Math.min(448 - 10 - (player.sprite.size.display.y/2), 
            (448 - (player.sprite.size.display.y/2) + player.pos.y))]
        )
      }

      function drawName(player, position, enabled) {
        //               Parameter Guide
        //     (Type) |      (Name)      | (Description)
        //
        //   Document |      player      | Single player document
        // [int, int] |     position     | [x,y] positioning
        // 
        if (Session.equals("playerNamesEnabled", "1")) {
          ctxMain.textAlign = "center";
          ctxMain.font = "normal 1em ct_prop";
          ctxMain.fillStyle = "white";
          ctxMain.fillText(player.name.first, position[0], position[1]);
          ctxMain.strokeStyle = "black";
          ctxMain.strokeText(player.name.first, position[0], position[1]);
        }
      }

      // All code that actually draws on the canvas should
      // go below here.
      clearCanvas();
      //clearCanvasData();
      drawEnviroment(me, "below");
      drawPlayersOther(playersInZone, me, "below");
      drawPlayer(me);
      drawPlayersOther(playersInZone, me, "above");
      drawEnviroment(me, "above");
    }
  }
  
  function canvasMainDrawLoop () {
    (function animloop(){
      requestAnimFrame(animloop);
      drawCanvasMain();
    })();
  }

  function attachControls () {
    // keydown
    window.addEventListener("keydown", function (event) {
      // Movement
      // Left Arrow
      if (event.keyCode === 37) {
        Session.set("keyArrowLeft", "down");
      }
      // Up Arrow
      if (event.keyCode === 38) {
        Session.set("keyArrowUp", "down");
      }
      // Right Arrow
      if (event.keyCode === 39) {
        Session.set("keyArrowRight", "down");
      }
      // Down Arrow
      if (event.keyCode === 40) {
        Session.set("keyArrowDown", "down");
      }
    
      // Actions
      // Space
      if (event.keyCode === 32) {
        Session.set("keySpace", "down");
      }

    });

    // keyup
    window.addEventListener("keyup", function (event) {
      // Movement
      // Left Arrow
      if (event.keyCode === 37) {
        Session.set("keyArrowLeft", "up");
      }
      // Up Arrow
      if (event.keyCode === 38) {
        Session.set("keyArrowUp", "up");
      }
      // Right Arrow
      if (event.keyCode === 39) {
        Session.set("keyArrowRight", "up");
      }
      // Down Arrow
      if (event.keyCode === 40) {
        Session.set("keyArrowDown", "up");
      }
    
      // Actions
      // Space
      if (event.keyCode === 32) {
        Session.set("keySpace", "up");
      }

    });
  }

  function tryMovement () { 
    window.setInterval(function () {
      if (playerCurrent_id) {
        moveAmount = 4;
        // Movement
        // Left Arrow, Negative X
        if (Session.equals("keyArrowLeft", "down")) {
            Meteor.call("incrementPlayerPosition", playerCurrent_id, -moveAmount, 0, "left");
        }
        // Up Arrow, Negative Y
        if (Session.equals("keyArrowUp", "down")) {
            Meteor.call("incrementPlayerPosition", playerCurrent_id, 0, -moveAmount, "up");
        }
        // Right Arrow, Positive X
        if (Session.equals("keyArrowRight", "down")) {
            Meteor.call("incrementPlayerPosition", playerCurrent_id, moveAmount, 0, "right");
        }
        // Down Arrow, Positive Y
        if (Session.equals("keyArrowDown", "down")) {
            Meteor.call("incrementPlayerPosition", playerCurrent_id, 0, moveAmount, "down");
        }
        // Actions
        // Space
        if (Session.get("keySpace") === "down") {
          // Convert current player to a faun model

          //                               Parameter Explaination:
          //                           String | Name of Server Method
          //                           String | ID of player to alter
          //                           [x, y] | Size of source image
          //                           [x, y] | Size to display image as
          // [ [x, y], [x, y],[x, y],[x, y] ] | Slices [ [left], [up], [right], [down] ]
          Meteor.call("changePlayerSprite", 
            playerCurrent_id, 
            "imageFaun", 
            [128, 256],
            [64, 128],
            [ [0,0],[0,0],[0,0],[0,0] ]);
        }
      }
    }, 12);
  }

  function debugReport() {
    beforeTime = 0;
    beforeX = 0;

    window.setInterval(function () {
      if (playerCurrent_id) {
        console.log("Time to complete: " + (Date.now() - beforeTime) + 
          "   x distance changed: " + (me.pos.x - beforeX) +
          "   Average x speed: " + 
          ((Date.now() - beforeTime)/(me.pos.x - beforeX)));
        beforeTime = Date.now();
        beforeX = me.pos.x;
      }
    }, 1000);
  }

  // Startup Sequence
  Meteor.startup(prewarm);
  Meteor.startup(canvasMainSetup);
  Meteor.startup(canvasMainDrawLoop);
  Meteor.startup(attachControls);
  Meteor.startup(tryMovement);
  // Meteor.startup(debugReport);
}

// Server
if (Meteor.isServer) {

  Meteor.methods({
    // Server Meteor.methods
    createPlayer: function (name) {
      Players.insert( {
        account: {
          region: "North America",
        },
        server: "alpha",
        online: "true",
        name: {
          prefix: "",
          first: name,
          last: "",
          suffix: ""
        },
        zone: {
          type: "static",
          name: "ct_cathedral"
        },
        pos: {
          x: 0,
          y: 0,
          z: 0
        },
        sprite: {
          name: "imageMainPlayer",
          size: {
            source: {
              x: 128,
              y: 128
            },
            display: {
              x: 128,
              y: 128
            }
          },
          slice: {
            left: {
              x: 0,
              y: 0
            },
            up: {
              x: 128,
              y: 0
            },
            right: {
              x: 256,
              y: 0
            },
            down: {
              x: 384,
              y: 0
            }
          }
        },
        animation: {
          name: "running",
          facing: "down"
        },        
        appearance: {
          hair: "",
          face: "",
          eyes: "",
          skin: "",
          body: ""
        },
        equipment: {
          // Weapons
          rhand: "",
          lhand: "",
          // Clothes
          head: "",
          chest: "",
          shoulders: "",
          arms: "",
          hands: "",
          legs: "",
          feet: "",
          // Jewelry
          necklace: "",
          rring: "",
          lring: ""
        },
        items: {
          inventory: {
            consumables: [""],
            equipment: [""],
            food: [""]
          },
          bank: {
            consumable: [""],
            equipable: [""],
            food: [""]
          },
          account: [""],
          story: [""]
        },
        entryEnd: "entryEnd"
      });                              
    },

    incrementPlayerPosition: function (id, x, y, facing) {
      Players.update(id, {$inc: {"pos.x": x}});
      Players.update(id, {$inc: {"pos.y": y}});
      Players.update(id, {$set: {"animation.facing": facing}});
    },

    changePlayerSprite: function (id, name, sizeSource, sizeDisplay, slice) {
      /*
      Players.update(id, {$set: {"sprite.name": name}}); 
      Players.update(id, {$set: {"sprite.size.x": size[x]}}); 
      Players.update(id, {$set: {"sprite.size.y": size[y]}}); 
      Players.update(id, {$set: {"sprite.slice.left.x": slice[0[0]]}}); 
      Players.update(id, {$set: {"sprite.slice.left.y": slice[0[1]]}}); 
      Players.update(id, {$set: {"sprite.slice.up.x": slice[1[0]]}}); 
      Players.update(id, {$set: {"sprite.slice.up.y": slice[1[1]]}}); 
      Players.update(id, {$set: {"sprite.slice.right.x": slice[2[0]]}}); 
      Players.update(id, {$set: {"sprite.slice.right.y": slice[2[1]]}}); 
      Players.update(id, {$set: {"sprite.slice.down.x": slice[3[0]]}}); 
      Players.update(id, {$set: {"sprite.slice.down.y": slice[3[1]]}});
     */
      Players.update(id, {$set: { 
        sprite: {
          name: name,
          size: {
            source: {
              x: sizeSource[0], 
              y: sizeSource[1]
            },
            display: {
              x: sizeDisplay[0], 
              y: sizeDisplay[1]
            }
          },
          slice: {
            left: {
              x: slice[0[0]],
              y: slice[0[1]]
            },
            up: {
              x: slice[1[0]],
              y: slice[1[1]]
            },
            right: {
              x: slice[2[0]],
              y: slice[2[1]]
            },
            down: {
              x: slice[3[0]],
              y: slice[3[1]]
            }
          }
        }
      }});
    }
  });

  Accounts.onCreateUser(function(options, user) {
    // Server Accounts Config
    if (options.profile)
      user.profile = options.profile;
    if (!Players.findOne({"name.first": user.username})) {
      Meteor.call("createPlayer", user.username);
    }
    return user;
  });

  Meteor.startup(function () {
    // Init Zones
    if (!Zones.findOne({"name": "ct_cathedral"})) {
      Zones.insert( {
        name: "ct_cathedral",
        layers: {
          below: [
            "ct_cathedral_1_3",
            "ct_cathedral_1_4"
          ],
          above: [
            "ct_cathedral_1_1",
            "ct_cathedral_1_2"
          ]
        },
        players: {
          online: [],
          offline: []
        }
      });                              
    }
  });
}
