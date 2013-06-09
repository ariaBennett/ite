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
// Perhaps an equipment system where
// each item proves a skill for a specific
// button, ie:
// main hand = space
// offhand = shift
// asd = armor/gloves/helmet/etc
// perhaps each armor piece can level and
// skills can be extracted from pieces?
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
Queues = new Meteor.Collection("queues");

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
        //TODO Remove the user()._id from this call
        // Meteor Function Calls to get Data and Happiness
        Meteor.call("getPlayerCurrentId", 
          function (error, result) {
            Session.set("playerCurrentId", result);
        });
        // Subscribe to current player.
        Meteor.subscribe("player", Session.get("playerCurrentId"));
        Session.set("playerCurrent", Players.findOne(Session.get("playerCurrentId")));
        if (Session.get("playerCurrent")) {
          // Subscribe to current area.
          Meteor.subscribe("area", Session.get("playerCurrent").area_id);
          Session.set("areaCurrent", Areas.findOne(Session.get("playerCurrent").area_id));
          // Subscribe to online players in current area. 
          Meteor.subscribe("playersInArea", Session.get("playerCurrent").area_id);
          Session.set("playersInArea", Players.find({
            area_id: Session.get("playerCurrent").area_id
          }, {
          sort: {
            "hitbox.layering.pos.y": 1,
            "pos.z": 1
          }}).fetch());
        }
        /*
        Meteor.call("getPlayersInArea", Session.get("playerCurrent").area_id, 
          function (error, result) {
            Session.set("playersInArea", result);
        });
        Meteor.call("getArea", Session.get("playerCurrent").area_id, 
          function (error, result) {
            Session.set("areaCurrent", result);
        });
, {
    sort: {
      "hitbox.layering.pos.y": 1,
      "pos.z": 1
  }}
      */
      }
      if (!Meteor.user()) {
        Session.set("playerCurrent", "");
        Session.set("playerCurrentId", "");
        Session.set("playersInArea", "");
        Session.set("areaCurrent", "");
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
    if (canvasMain.getContext && Session.get("playerCurrent")._id) {

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
        else if (x < Session.get("areaCurrent").width - canvasMainWidth/2) {
          return canvasMainWidth/2;
        }
        else if (x <= Session.get("areaCurrent").width) {
          return canvasMainWidth - (Session.get("areaCurrent").width - x);
        }
      }
      function getFocusY (y) {
        if (y <= 0) {
          return y;
        }
        else if (y < canvasMainHeight/2) {
          return y;
        }
        else if (y < Session.get("areaCurrent").height - canvasMainHeight/2) {
          return canvasMainHeight/2;
        }
        else if (y <= Session.get("areaCurrent").height) {
          return canvasMainHeight - (Session.get("areaCurrent").height - y);
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
            if (Session.get("playerCurrent")._id !== player._id && 
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
            if (Session.get("playerCurrent")._id !== player._id && 
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
            if (Session.get("playerCurrent")._id !== player._id) {
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
        
        if (Session.get("playerCurrent")._id) {

          function getViewX (image) {
            if (x <= 0)
              return 0;
            else if (x < canvasMainWidth/2) {
                return 0;
            }
            else if (x < Session.get("areaCurrent").width - canvasMainWidth/2) {
              return x - canvasMainWidth/2;
            }
            else if (x >= Session.get("areaCurrent").width - canvasMainWidth/2) {
              return Session.get("areaCurrent").width - canvasMainWidth; 
            }
          }

          function getViewY (image) {
            if (y <= 0)
              return 0;
            else if (y < canvasMainHeight/2) {
                return 0;
            }
            else if (y < Session.get("areaCurrent").height - canvasMainHeight/2) {
              return y - canvasMainHeight/2;
            }
            else if (y >= Session.get("areaCurrent").height - canvasMainHeight/2) {
              return Session.get("areaCurrent").height - canvasMainHeight; 
            }
          }

          function drawImageAtRelationalPoint (image) {
            ctxMain.drawImage(image, 
              -getViewX(image),
              -getViewY(image),
              Session.get("areaCurrent").width,
              Session.get("areaCurrent").height);
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
      drawEnviroment(Session.get("playerCurrent").pos.x, Session.get("playerCurrent").pos.y, "below");
      //drawEnviroment(Session.get("playerCurrent").pos.x, Session.get("playerCurrent").pos.y, "collision");
      drawPlayersOther(Session.get("playersInArea"), Session.get("playerCurrent"), "below");
      drawFocus(Session.get("playerCurrent"));  // Draw the current player
      drawPlayersOther(Session.get("playersInArea"), Session.get("playerCurrent"), "above");
      drawEnviroment(Session.get("playerCurrent").pos.x, Session.get("playerCurrent").pos.y, "above");
      drawCanvasDisplay(displayScale);

      drawTestCanvas(displayScale);
      /* END DRAW CODE */ /* END DRAW CODE */ /* END DRAW CODE */
      /* END DRAW CODE */ /* END DRAW CODE */ /* END DRAW CODE */
      /* END DRAW CODE */ /* END DRAW CODE */ /* END DRAW CODE */
    }
  }
  
  function canvasMainDrawLoop () {
    (function animloop(){
      if (!canvasDataLoaded && canvasDataBelow.getContext && canvasDataAbove.getContext && Session.get("areaCurrent")) {
          canvasDataBelow.width = window[Session.get("areaCurrent").layers.below[0]].width;
          canvasDataBelow.height = window[Session.get("areaCurrent").layers.below[0]].height;
        _.each(Session.get("areaCurrent").layers.below, function (layer) {
            ctxDataBelow.drawImage(window[layer], 0, 0);
        });
          canvasDataAbove.width = window[Session.get("areaCurrent").layers.above[0]].width;
          canvasDataAbove.height = window[Session.get("areaCurrent").layers.above[0]].height;
        _.each(Session.get("areaCurrent").layers.above, function (layer) {
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
    // Left Arrow
    Session.set("controls.left", 37);
    // Up Arrow
    Session.set("controls.up", 38);
    // Right Arrow
    Session.set("controls.right", 39);
    // Down Arrow
    Session.set("controls.down", 40);
    // Space
    Session.set("controls.primary", 32);

    window.addEventListener("keydown", function (event) {
      // Movement
      if (event.keyCode === Session.get("controls.left")) {
          Meteor.call("setKeyPressed", "left");
      }
      if (event.keyCode === Session.get("controls.up")) {
          Meteor.call("setKeyPressed", "up");
      }
      if (event.keyCode === Session.get("controls.right")) {
          Meteor.call("setKeyPressed", "right");
      }
      if (event.keyCode === Session.get("controls.down")) {
          Meteor.call("setKeyPressed", "down");
      }
    
      // Actions
      if (event.keyCode === Session.get("controls.primary")) {
        Meteor.call("debugPrintPlayerDoc");
      }
    });

    window.addEventListener("keyup", function (event) {
      // Movement
      if (event.keyCode === Session.get("controls.left")) {
          Meteor.call("setKeyReleased", "left");
      }
      if (event.keyCode === Session.get("controls.up")) {
          Meteor.call("setKeyReleased", "up");
      }
      if (event.keyCode === Session.get("controls.right")) {
          Meteor.call("setKeyReleased", "right");
      }
      if (event.keyCode === Session.get("controls.down")) {
          Meteor.call("setKeyReleased", "down");
      }
    
      // Actions
      if (event.keyCode === Session.get("controls.primary")) {
      }
    });
  }

  // Startup Sequence
  Meteor.startup(prewarm);
  Meteor.startup(animationFrameSetup);
  Meteor.startup(canvasMainDrawLoop);
  Meteor.startup(attachControls);
}
