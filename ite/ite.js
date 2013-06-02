// Thoughts
// Secret of Mana combat, dark souls stamina bar,
// League of Legends QWER skills with aimed reticles,
// Chrono Trigger combo attack system by mixing QWER skills
// with allies' attacks.
//
// For controls, WER + Space + arrow keys feels pretty nice.
// Or maybe QWE + Space?
// Maybe numpad for movement.
//
// I like ASD + L-Shift + space key a lot.
// Shift is a good option for blocking, space
// is a good main attack button, ASD make decent
// skill buttons, num-pad has an easy access enter key...
//
// QWE/ASD Skill ideas: Some skills could force a player
// to be still, open vulnerability, etc.  Esp. mages channeling
// big spells.
//
// Stamina bar is shared between at least spacebar and l-shift,
// like dark souls.  This prevents spamming the attack button.
//
// For mages/whoever, perhaps space or shift could be part of a 
// skill charging system.
//
// QWE/ASD skills I'm not so sure on.
//
//
//
// No more thoughts after this point.
//
//
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
// Thank you,
//
// -Aria Bennett

// Shared Databases
Players = new Meteor.Collection("players");
Zones = new Meteor.Collection("zones");
Areas = new Meteor.Collection("areas");
Sections = new Meteor.Collection("sections");

// Shared Methods
Meteor.methods({
  updateHitboxes: function(id, type) {
    if (type === "player") {
      player = Players.findOne({_id: id});
      Players.update(id, {$set: {
        hitbox: {
          collision: {
            pos: {
              x: player.pos.x + player.sprite.size.display.x/2 - player.hitbox.collision.size.x/2,
              y: player.pos.y + player.sprite.size.display.y - player.hitbox.collision.size.y
            },
            size: {
              x: 16,
              y: 16
            }
          },
          layering: {
            pos: {
              x: player.pos.x,
              y: player.pos.y + player.sprite.size.display.y
            },
            size: {
              x: player.sprite.size.display.x,
              y: 1
            }
          },
          focus: {
            pos: {
              x: player.pos.x + player.sprite.size.display.x/2,
              y: player.pos.y + player.sprite.size.display.y - player.hitbox.collision.size.y/2
            },
            size: {
              x: 1,
              y: 1
            }
          }
        }
      }});
    }
  },

  incrementPlayerPosition: function(id, x, y, facing) {
    player = Players.findOne({_id: id});
    zone = Zones.findOne({name: player.zone.name});
    oldX1 = player.hitbox.collision.pos.x;
    oldX2 = player.hitbox.collision.pos.x + player.hitbox.collision.size.x;
    oldY1 = player.hitbox.collision.pos.y;
    oldY2 = player.hitbox.collision.pos.y + player.hitbox.collision.size.y;
    // Exceptions first, else do incriment.

    // Screen Edges

    if (oldX1 + x < 0 || oldX2 + x > zone.width) {
      x = 0;
    }
    else {
      Players.update(id, {$inc: {"pos.x": x}});
    }
    if (oldY1 + y < 0 || oldY2 + y > zone.height) {
      y = 0;
    }
    else {
      Players.update(id, {$inc: {"pos.y": y}});
    }

    // Collision
    Players.update(id, {$set: {"animation.facing": facing}});
    Meteor.call("updateHitboxes", id, "player");
    Meteor.call("updateSections", player, "player", zone);
  },

  updateSections: function(data, catagory, zone) {
    var startCol;
    var startRow;
    var endCol;
    var endRow;
    if (catagory === "player") {
      var size = 32;
      startCol = Math.floor((data.hitbox.collision.pos.x) / size);
      startRow = Math.floor((data.hitbox.collision.pos.y) / size);
      endCol =   Math.ceil((data.hitbox.collision.pos.x + data.hitbox.collision.size.x) / size) - 1;
      endRow =   Math.ceil((data.hitbox.collision.pos.y + data.hitbox.collision.size.y) / size) - 1;
    }

    //TODO# THIS ONE
    var sections = [];
    for (var row = startRow; row <= endRow; row++) {
      for (var col = startCol; col <= endCol; col++) {
        sections.push(Meteor.call("getSection", data.area_id, col, row));
      }
    }
    console.log(sections);
  },
  getSection: function(area_id, column, row) {
    return Sections.findOne({area_id: area_id, column: column, row: row});
  }

});


// Client
if (Meteor.isClient) {

  Accounts.ui.config({
    // Client UI Config
    passwordSignupFields: 'USERNAME_ONLY'
  });

  function prewarm () {
    // Setup defaults for certain Session Variables
    Session.set("playerNamesEnabled", "0");
    Session.set("hitboxDisplayEnabled", "0");
    Session.set("isDebug", "0");
    Deps.autorun ( function () {
      if (Meteor.user()) {
        if (getPlayer = Players.findOne({"name.first": Meteor.user().username})) {
          playerCurrent_id = getPlayer._id;
          playerCurrent = getPlayer;
          playerCurrentArea_id = (Sections.findOne({_id: playerCurrent.section_ids[0]})).area_id;
          playerCurrentArea = Areas.findOne({_id: playerCurrentArea_id});
          playerCurrentZone = Zones.findOne({_id: playerCurrentArea.zone_id});
          playersInArea = Players.find({"zone.name": getPlayer.zone.name, "online": "true"},
            {sort: {"hitbox.layering.pos.y": 1}}, {sort: {"pos.z": 1}}).fetch();
        }
      }
      if (!Meteor.user()) {
        playerCurrent_id = "";
        playersInArea = "";
      }
    });
  }

  function canvasMainResourcesDeclare () {
    imageMainPlayer = new Image();
    imageFaun = new Image();
    imageCrystalBeast = new Image();

    // CTCathedral Files
    ct_cathedral_3_1 = new Image();
    ct_cathedral_3_2 = new Image();
    ct_cathedral_3_3 = new Image();
    ct_cathedral_3_4 = new Image();
    ct_cathedral_3_collision = new Image();
  }

  function canvasMainResourcesPreload () {
    ct_cathedral_3_1.src = "assets/zones/ct_cathedral/16x16/rooms/3/1.png";
    ct_cathedral_3_2.src = "assets/zones/ct_cathedral/16x16/rooms/3/2.png";
    ct_cathedral_3_3.src = "assets/zones/ct_cathedral/16x16/rooms/3/3.png";
    ct_cathedral_3_4.src = "assets/zones/ct_cathedral/16x16/rooms/3/4.png";
    ct_cathedral_3_collision.src = "assets/zones/ct_cathedral/16x16/rooms/3/collision.png";

    
    imageMainPlayer.src = "assets/test/magus_sheet_movement_small.png";
    imageFaun.src = "assets/Michael/CharacterModel-Faun128x256.png";
    imageCrystalBeast.src = "assets/Michael/crystalbeastpixeld384x192.png";


  }
  
  function animationFrameSetup () {
    window.requestAnimFrame = (function () {
      return window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame  ||
        window.mozRequestAnimationFrame     ||
        function( callback ){
          window.setTimeout(callback, 1000 / 60);
      };
    })();
    canvasDisplay = document.getElementById("canvasDisplay");
    canvasMain = document.getElementById("canvasMain");
    canvasDataAbove = document.getElementById("canvasDataAbove");
    canvasDataBelow = document.getElementById("canvasDataBelow");
    ctxDisplay = canvasDisplay.getContext("2d");
    ctxMain = canvasMain.getContext("2d");
    ctxDataAbove = canvasDataAbove.getContext("2d");
    ctxDataBelow = canvasDataBelow.getContext("2d");
    canvasDataLoaded = 0;
    canvasMainResourcesDeclare();
    canvasMainResourcesPreload();
    sliceX = 0;
    sliceY = 0;
    canvasMainWidth = 480;
    canvasMainHeight = 270;
    offsetX = 0;
    offsetY = 0;

  }

  function disableSmoothing(ctx) {
    if (ctx.webkitImageSmoothingEnabled) {
      ctx.webkitImageSmoothingEnabled = false;
    }
    else if (ctx.mozImageSmoothingEnabled) {
      ctx.mozImageSmoothingEnabled = false;
    }
    else {
      ctx.imageSmoothingEnabled = false;
    }
  }

  function drawCanvasMain() {
    // Draw updates to the main game canvas
    if (canvasMain.getContext && playerCurrent_id) {

      function getDisplayScale() {
        var gameWidth =  window.innerWidth; 
        var gameHeight = window.innerHeight;
        var scaleToFitX  = gameWidth / canvasMainWidth;
        var scaleToFitY  = gameHeight / canvasMainHeight;


        return Math.max(1, Math.floor(Math.min(scaleToFitX, 
                                               scaleToFitY)));
      }

      function drawCanvasDisplay(scale) {
        canvasDisplay.width = canvasMainWidth * scale;
        canvasDisplay.height = canvasMainHeight * scale;
        disableSmoothing(ctxDisplay);

        ctxDisplay.drawImage(canvasMain, 0, 0, canvasMainWidth * scale , 
                                               canvasMainHeight * scale);
      }

      function convertToRelativePoint(point) {
        // Converts a point to a point relative to the getFocusX
        return [point[0] - getFocusX(point[0]), point[1] - getFocusY(point[1])];
      }
      function getPoint(target, point) {
        // Returns either: a single array
        // containing specified point; OR if "all" is passed in
        // point then an array of nine arrays. 
        // each array contains [x,y] coordinates
        // which represent various points of the object.
        //
        //                  format
        // [ 
        // [x,y] [x,y] [x,y]  |    top-left,    top-center,    top-right
        // [x,y] [x,y] [x,y]  | center-left, center-center, center-right
        // [x,y] [x,y] [x,y]  | bottom-left, bottom-center, bottom-right
        // ]                  | ________________________________________
        //                    |              [0], [1], [2],
        //                    |              [3], [4], [5],
        //                    |              [6], [7], [8]
        
        // Single pair requests
        if (point === "top-left") {
          return [target.pos.x, target.pos.y];
        }
        else if (point === "top-center") {
          return [(target.pos.x + target.sprite.size.display.x/2), target.pos.y];
        }
        else if (point === "top-right") {
          return [(target.pos.x + target.sprite.size.display.x), target.pos.y];
        }
        else if (point === "center-left") {
          return [target.pos.x, (target.pos.y + target.sprite.size.display.y/2)];
        }
        else if (point === "center-center") {
          return [(target.pos.x + target.sprite.size.display.x/2), (target.pos.y + target.sprite.size.display.y/2)];
        }
        else if (point === "center-right") {
          return [(target.pos.x + target.sprite.size.display.x), (target.pos.y + target.sprite.size.display.y/2)];
        }
        else if (point === "bottom-left") {
          return [target.pos.x, (target.pos.y + target.sprite.size.display.y)];
        }
        else if (point === "bottom-center") {
          return [(target.pos.x + target.sprite.size.display.x/2), (target.pos.y + target.sprite.size.display.y)];
        }
        else if (point === "bottom-right") {
          return [(target.pos.x + target.sprite.size.display.x), (target.pos.y + target.sprite.size.display.y)];
        }

        // Full set request
        else if (point === "all") {
          return [
            [target.pos.x, target.pos.y],
            [(target.pos.x + target.sprite.size.display.x/2), target.pos.y],
            [(target.pos.x + target.sprite.size.display.x), target.pos.y],
            [target.pos.x, (target.pos.y + target.sprite.size.display.y/2)],
            [(target.pos.x + target.sprite.size.display.x/2), (target.pos.y + target.sprite.size.display.y/2)],
            [(target.pos.x + target.sprite.size.display.x), (target.pos.y + target.sprite.size.display.y/2)],
            [target.pos.x, (target.pos.y + target.sprite.size.display.y)],
            [(target.pos.x + target.sprite.size.display.x/2), (target.pos.y + target.sprite.size.display.y)],
            [(target.pos.x + target.sprite.size.display.x), (target.pos.y + target.sprite.size.display.y)]
          ];
        }
        // Fallthrough error
        else {
          if (Session.equals("isDebug", "1")) {
            console.log("Error in fuction getPoint, invalid point specified");
          }
        }
      }
      function getPointDifference(target, point) {
        // Works the same as getPoint, except returns
        // the difference between the origin point and 
        // the desired point
        
        // Single pair requests
        if (point === "top-left") {
          return [0, 0];
        }
        else if (point === "top-center") {
          return [target.sprite.size.display.x/2, 0];
        }
        else if (point === "top-right") {
          return [target.sprite.size.display.x, 0];
        }
        else if (point === "center-left") {
          return [0, target.sprite.size.display.y/2];
        }
        else if (point === "center-center") {
          return [target.sprite.size.display.x/2, target.sprite.size.display.y/2];
        }
        else if (point === "center-right") {
          return [target.sprite.size.display.x, target.sprite.size.display.y/2];
        }
        else if (point === "bottom-left") {
          return [0, target.sprite.size.display.y];
        }
        else if (point === "bottom-center") {
          return [target.sprite.size.display.x/2, target.sprite.size.display.y];
        }
        else if (point === "bottom-right") {
          return [target.sprite.size.display.x, target.sprite.size.display.y];
        }

        // Full set request
        else if (point === "all") {
          return [
            [0, 0],
            [target.sprite.size.display.x/2, 0],
            [target.sprite.size.display.x, 0],
            [0, target.sprite.size.display.y/2],
            [target.sprite.size.display.x/2, target.sprite.size.display.y/2],
            [target.sprite.size.display.x, target.sprite.size.display.y/2],
            [0, target.sprite.size.display.y],
            [target.sprite.size.display.x/2, target.sprite.size.display.y],
            [target.sprite.size.display.x, target.sprite.size.display.y]
          ];
        }
        // Fallthrough error
        else {
          if (Session.equals("isDebug", "1")) {
            console.log("Error in function getPointDifference, invalid point specified");
          }
        }
      }
      function clearCanvas (posX, posY, sizeX, sizeY) {
        // Clear Canvas
        ctxMain.clearRect (posX, posY, sizeX, sizeY);
      }
      function clearCanvasEntire (ctx) {
        // Clear canvas via canvas size
        ctx.clearRect(0, 0, ctx.width, ctx.height);
      }
      function getFocusX (x) {
        if (x <= 0) {
          return x;
        }
        else if (x < canvasMainWidth/2) {
          return x;
        }
        else if (x < playerCurrentArea.width - canvasMainWidth/2) {
          return canvasMainWidth/2;
        }
        else if (x <= playerCurrentArea.width) {
          return canvasMainWidth - (playerCurrentArea.width - x);
        }
      }
      function getFocusY (y) {
        if (y <= 0) {
          return y;
        }
        else if (y < canvasMainHeight/2) {
          return y;
        }
        else if (y < playerCurrentArea.height - canvasMainHeight/2) {
          return canvasMainHeight/2;
        }
        else if (y <= playerCurrentArea.height) {
          return canvasMainHeight - (playerCurrentArea.height - y);
        }
      }
      function drawFocus(player) {
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
        // Draw current player, and center camera on them.
        ctxMain.drawImage(window[player.sprite.name], 
          sliceX, sliceY, 
          player.sprite.size.source.x, player.sprite.size.source.y,
          getFocusX(player.pos.x),
          getFocusY(player.pos.y),
          player.sprite.size.display.x, player.sprite.size.display.y);
        drawName(
          player,
          [
          getFocusX(player.pos.x) + player.sprite.size.display.x/2,
          getFocusY(player.pos.y) - 10
          ]
        );
        if (Session.equals("hitboxDisplayEnabled", "1")) {
          // Collision hitbox
          drawTestSquare(
            [255,0,0,1], 
            getFocusX(player.hitbox.collision.pos.x), 
            getFocusY(player.hitbox.collision.pos.y), 
            player.hitbox.collision.size.x,
            player.hitbox.collision.size.y
          );
          // Layering hitbox
          drawTestSquare(
            [0,255,0,1], 
            getFocusX(player.hitbox.layering.pos.x), 
            getFocusY(player.hitbox.layering.pos.y), 
            player.hitbox.layering.size.x,
            player.hitbox.layering.size.y
          );
          // Focus hitbox
          drawTestSquare(
            [0,0,255,1], 
            getFocusX(player.hitbox.focus.pos.x), 
            getFocusY(player.hitbox.focus.pos.y), 
            player.hitbox.focus.size.x,
            player.hitbox.focus.size.y
          );
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
        relationalPoint = convertToRelativePoint([relationalObject.pos.x, relationalObject.pos.y]); 
        layeringPointY = relationalObject.hitbox.layering.pos.y;

        if (relation === "below") {
          _.each(players, function (player) {
            if (playerCurrent_id !== player._id && 
                player.hitbox.layering.pos.y <= layeringPointY) {
              // Temporary player animation
              var playerSliceX = 0;
              var playerSliceY = 0;
              var relativeX = player.pos.x - relationalPoint[0];
              var relativeY = player.pos.y - relationalPoint[1];
              
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
                player.hitbox.layering.pos.y > relationalObject.hitbox.layering.pos.y) {
              // Temporary player animation
              var playerSliceX = 0;
              var playerSliceY = 0;
              var relativeX = player.pos.x - relationalPoint[0];
              var relativeY = player.pos.y - relationalPoint[1];

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
                player.pos.x - relationalPoint[0] + Math.min(canvasMainHeight/2, (canvasMainHeight/2 + x)), 
                // 128 x 192
                player.pos.y - relationalPoint[1] + Math.min(352, (352 + relationalPoint[1])),
                player.sprite.size.display.x, player.sprite.size.display.y);
            }
          });
        }
      }
      function drawEnviroment (posX, posY, relation) {
        // relationalPoint should be the player,
        // relation should be either above, below,
        // or both.
        x = posX;
        y = posY;
        
        if (playerCurrent_id) {

          function getViewX (image) {
            if (x <= 0)
              return 0;
            else if (x < canvasMainWidth/2) {
                return 0;
            }
            else if (x < playerCurrentArea.width - canvasMainWidth/2) {
              return x - canvasMainWidth/2;
            }
            else if (x >= playerCurrentArea.width - canvasMainWidth/2) {
              return playerCurrentArea.width - canvasMainWidth; 
            }
          }

          function getViewY (image) {
            if (y <= 0)
              return 0;
            else if (y < canvasMainHeight/2) {
                return 0;
            }
            else if (y < playerCurrentArea.height - canvasMainHeight/2) {
              return y - canvasMainHeight/2;
            }
            else if (y >= playerCurrentArea.height - canvasMainHeight/2) {
              return playerCurrentArea.height - canvasMainHeight; 
            }
          }

          function drawImageAtRelationalPoint (image) {
            ctxMain.drawImage(image, 
              -getViewX(image),
              -getViewY(image),
              playerCurrentArea.width,
              playerCurrentArea.height);
          }

          if (relation === "below") {
            drawImageAtRelationalPoint(canvasDataBelow);
          }
          else if (relation === "above") {
            drawImageAtRelationalPoint(canvasDataAbove);
          }
        }
      }
      function drawTestSquare(style, aX, aY, bX, bY) {
        ctxMain.fillStyle = "rgba(" + style[0] + "," + style[1] 
          + "," + style[2] + "," + style[3] + ")";
        ctxMain.fillRect(aX, aY, bX, bY);
      }
      function drawName(player, position, enabled) {
        //               Parameter Guide
        //     (Type) |      (Name)      | (Description)
        //
        //   Document |      player      | Single player document
        // [int, int] |     position     | [x,y] positioning
        //   [string] |     enabled      | "0" or "1", determines if names are shown
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
      function drawTestCanvas(scale) {
        /*
        // EaselJS test code below
        var stageTest = new createjs.Stage("canvasTest");
        var testBitmap = new createjs.Bitmap(canvasMain);

        testBitmap.scaleX = 4;
        testBitmap.scaleY = 4;
        stageTest.addChild(testBitmap);
        stageTest.update();
        */
      }

      /* BEGIN DRAW CODE */ /* BEGIN DRAW CODE */ /* BEGIN DRAW CODE */
      /* BEGIN DRAW CODE */ /* BEGIN DRAW CODE */ /* BEGIN DRAW CODE */
      /* BEGIN DRAW CODE */ /* BEGIN DRAW CODE */ /* BEGIN DRAW CODE */
      var displayScale = getDisplayScale();

      clearCanvas(0, 0, canvasMainWidth, canvasMainHeight);
      // clearCanvasData();
      drawEnviroment(playerCurrent.pos.x, playerCurrent.pos.y, "below");
      //drawEnviroment(playerCurrent.pos.x, playerCurrent.pos.y, "collision");
      drawPlayersOther(playersInArea, playerCurrent, "below");
      drawFocus(playerCurrent);  // Draw the current player
      drawPlayersOther(playersInArea, playerCurrent, "above");
      drawEnviroment(playerCurrent.pos.x, playerCurrent.pos.y, "above");
      drawCanvasDisplay(displayScale);

      drawTestCanvas(displayScale);
      /* END DRAW CODE */ /* END DRAW CODE */ /* END DRAW CODE */
      /* END DRAW CODE */ /* END DRAW CODE */ /* END DRAW CODE */
      /* END DRAW CODE */ /* END DRAW CODE */ /* END DRAW CODE */
    }
  }
  
  function canvasMainDrawLoop () {
    (function animloop(){
      if (!canvasDataLoaded && canvasDataBelow.getContext && canvasDataAbove.getContext && playerCurrent_id) {
          canvasDataBelow.width = window[playerCurrentArea.layers.below[0]].width;
          canvasDataBelow.height = window[playerCurrentArea.layers.below[0]].height;
        _.each(playerCurrentArea.layers.below, function (layer) {
          ctxDataBelow.drawImage(window[layer], 0, 0);
        });
          canvasDataAbove.width = window[playerCurrentArea.layers.above[0]].width;
          canvasDataAbove.height = window[playerCurrentArea.layers.above[0]].height;
        _.each(playerCurrentArea.layers.above, function (layer) {
          ctxDataAbove.drawImage(window[layer], 0, 0);
        });
        canvasDataLoaded = 1;
      }
      requestAnimFrame(animloop);
      if (canvasDataLoaded) {
        drawCanvasMain();
      }
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
        moveAmount = 1;
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
          // Convert current player to a different model

          //                               Parameter Explaination:
          //                           String | Name of Server Method
          //                           String | ID of player to alter
          //                           String | Name of source image object
          //                           [x, y] | Size of source image
          //                           [x, y] | Size to display image as
          // [ [x, y], [x, y],[x, y],[x, y] ] | Slices [ [left], [up], [right], [down] ]
          Meteor.call("changePlayerSprite", 
            playerCurrent_id, 
            "imageCrystalBeast", 
            [384, 192],
            [384, 192],
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
          "   x distance changed: " + (playerCurrent.pos.x - beforeX) +
          "   Average x speed: " + 
          ((Date.now() - beforeTime)/(playerCurrent.pos.x - beforeX)));
        beforeTime = Date.now();
        beforeX = playerCurrent.pos.x;
      }
    }, 1000);
  }

  // Startup Sequence
  Meteor.startup(prewarm);
  Meteor.startup(animationFrameSetup);
  Meteor.startup(canvasMainDrawLoop);
  Meteor.startup(attachControls);
  Meteor.startup(tryMovement);
  // Meteor.startup(debugReport);
}

// Server
if (Meteor.isServer) {

  Meteor.methods({
    // Server Meteor.methods
    createPlayer: function (name, starting_section_id) {
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
        //TODO# Pull other players from sections instead of
        //faking it with temporary zone stand in
        zone: {
          name: "ct_cathedral"
        },
        area_id: starting_area_id,
        pos: {
          x: 200,
          y: 200,
          z: 0
        },
        hitbox: {
          collision: {
            pos: {
              x: 0,
              y: 0
            },
            size: {
              x: 16,
              y: 16
            }
          },
          layering: {
            pos: {
              x: 0,
              y: 0
            },
            size: {
              x: 1,
              y: 1
            }
          },
          focus: {
            pos: {
              x: 0,
              y: 0 
            },
            size: {
              x: 1,
              y: 1
            }
          }
        },
        sprite: {
          name: "imageMainPlayer",
          size: {
            source: {
              x: 32,
              y: 32
            },
            display: {
              x: 32,
              y: 32
            }
          },
          point: {
            bottom: {
              center: {
                x: 16,
                y: 32
              }
            }
          },
          slice: {
            left: {
              x: 0,
              y: 0
            },
            up: {
              x: 32,
              y: 0
            },
            right: {
              x: 64,
              y: 0
            },
            down: {
              x: 96,
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


    changePlayerSprite: function (id, name, sizeSource, sizeDisplay, slice) {
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
    },

    addZone: function (name) {
      return Zones.insert({name: name});
    },
    addArea: function (zone_id, zone_name, name, width, height, layersBelow, layersAbove) {
      return Areas.insert({
        zone_id: zone_id,
        zone_name: zone_name,
        name: name,
        width: width,
        height: height,
        // TODO# handle layers as sections instead
        // of areas.
        layers: {
          below: layersBelow,
          above: layersAbove
        }
      });
    },
    addSection: function (area_id, areaName, column, row, x, y, sectionSize, sectionCollisionData) {
      Sections.insert({
        area_id: area_id,
        area_name: areaName,
        column: column,
        row: row,
        x: x,
        y: y,
        sectionSize: sectionSize,
        collision: sectionCollisionData
      });
    },
    generateSections: function (area_id, areaName, areaWidth, areaHeight, sectionSize, areaCollisionData) {
      //var areaWidth = 640;
      //var areaHeight = 592;
      //var sectionSize = 32;
      for (var row = 0; row < Math.ceil((areaHeight/sectionSize)); row++) {
        for (var column = 0; column < Math.ceil((areaWidth/sectionSize)); column++) {
          Meteor.call("addSection", area_id, areaName, column, row,
                      (column * sectionSize), (row * sectionSize), sectionSize,
                      areaCollisionData[row][column]);
        }
      }
    },
    initZone: function (zoneName, areaDocArray, sectionSize) {
      var zone_id = Meteor.call("addZone", zoneName);
      _.each(areaDocArray, function(area){
        var area_id = Meteor.call("addArea", zone_id, zoneName, area.name, area.width,
                                  area.height, area.layersBelow, area.layersAbove);
        Meteor.call("generateSections", area_id, area.name, area.width, area.height, sectionSize, 
                    area.collisionData);
      });
      return zone_id;
    }
  });

  Accounts.onCreateUser(function(options, user) {
    // Server Accounts Config
    if (options.profile)
      user.profile = options.profile;
    if (!Players.findOne({"name.first": user.username})) {
      starting_section_id = Sections.findOne({area_name: "ct_cathedral_3", column: 0, row: 0})._id;
      starting_area_id = Sections.findOne({area_name: "ct_cathedral_3"})._id;
      Meteor.call("createPlayer", user.username, starting_section_id);
    }
    return user;
  });

  Meteor.startup(function () {
    // Init Zones
    if (!Zones.findOne({"name": "ct_cathedral"})) {
      var areaDocs = [
        {
          name: "ct_cathedral_3",
          width: 640,
          height: 592,
          layersBelow: [
            "ct_cathedral_3_3",
            "ct_cathedral_3_4"
          ],
          layersAbove: [
            "ct_cathedral_3_1",
            "ct_cathedral_3_2"
          ],
          collisionData: ct_cathedral_3_collision
        }
      ];
      //console.log(ct_cathedral_3_collision[18][19]);
      Meteor.call("initZone", "ct_cathedral", areaDocs, 32);
    }
  });
}
