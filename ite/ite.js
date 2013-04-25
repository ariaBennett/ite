// Shared Databases
Players = new Meteor.Collection("Players");
Zones = new Meteor.Collection("Zones");

// Classes

// Shared Client & Server Meteor Methods

// "Globals", hopefully temporary ones

// Client
if (Meteor.isClient) {

  // Client UI Config
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_ONLY'
  });

  // Client Meteor.methods stubs
  Meteor.methods({
    incrementPlayerPosition: function (id, x, y) {
      Players.update(id, {$inc: {"pos.x": x}});
      Players.update(id, {$inc: {"pos.y": y}});
      },
  });

  /*Possibly unnecessary code.
  var playerCurrent = function () {
    return Players.findOne(playerCurrent_id);
  };
  */

  function prewarm () {
    Deps.autorun ( function () {
      if (Meteor.user()) {
        if (getPlayer = Players.findOne({"name.first": Meteor.user().username})) {
          playerCurrent_id = getPlayer._id;
          me = getPlayer;
          playersInZone = Players.find({"zone.name": getPlayer.zone.name, "online": "true"}, {sort: {"pos.y": 1}}, {sort: {"pos.z": 1}}).fetch();
          // Debug Code
          debugBeforeX = me.pos.x;

        }
      }
      if (!Meteor.user()) {
        playerCurrent_id = "";
        playersInZone = "";
      }
    });
  }

  function canvasMainImagesDeclare () {
    imageBackground = new Image();
    imageMainPlayer = new Image();
  }

  function canvasMainImagesPreload () {
    imageBackground.src = "assets/test/ChronoTrigger600CathedralBG_Big.png";
    imageMainPlayer.src = "assets/test/magus_sheet_movement_big.png";
  }
  
  function canvasMainSetup () {
    window.requestAnimFrame = (function(){
      return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
          window.setTimeout(callback, 1000 / 60);
        };
    })();
    canvasMain = document.getElementById("canvasMain");
    ctxMain = canvasMain.getContext("2d");
    canvasMainImagesDeclare();
    canvasMainImagesPreload();
    sliceX = 0;
    sliceY = 0;
  }

  // Draw updates to the main game canvas
  function drawCanvasMain () {
    if (canvasMain.getContext && playerCurrent_id) {

      function clearCanvas () {
        // Clear Canvas
        ctxMain.clearRect (0, 0, 1024, 896);
      }

      function drawEnviroment (relationalObject, relation) {
        // relationalObject should be the player,
        // relation should be either above, below,
        // or both.
        //
        // NOTE: relational aspects of this function
        // are not implemented at this time, waiting
        // until enviroment structure is more apparent.

        // Draw Floor of Player's Zone
        if (playerCurrent_id) {
          ctxMain.drawImage(imageBackground, 
            Math.min(-relationalObject.pos.x, 0), 
            Math.min(-relationalObject.pos.y, 0), 4480, 11840);
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
                player.pos.y <= relationalObject.pos.y) {
              // Temporary player animation
              var playerSliceX = 0;
              var playerSliceY = 0;
              if (player.animation.facing === "left") {
                playerSliceX = 0;
                playerSliceY = 0;
              }
              else if (player.animation.facing === "right") {
                playerSliceX = 256;
                playerSliceY = 0;
              }
              else if (player.animation.facing === "up") {
                playerSliceX = 128;
                playerSliceY = 0;
              }
              else if (player.animation.facing === "down") {
                playerSliceX = 384;
                playerSliceY = 0;
              }
              ctxMain.drawImage(imageMainPlayer, playerSliceX, playerSliceY, 128, 192,
                player.pos.x - relationalObject.pos.x + Math.min(448, (448 + relationalObject.pos.x)), 
                // 128 x 192
                player.pos.y - relationalObject.pos.y + Math.min(352, (352 + relationalObject.pos.y)),
                128, 192);
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
              if (player.animation.facing === "left") {
                playerSliceX = 0;
                playerSliceY = 0;
              }
              else if (player.animation.facing === "right") {
                playerSliceX = 256;
                playerSliceY = 0;
              }
              else if (player.animation.facing === "up") {
                playerSliceX = 128;
                playerSliceY = 0;
              }
              else if (player.animation.facing === "down") {
                playerSliceX = 384;
                playerSliceY = 0;
              }
              ctxMain.drawImage(imageMainPlayer, playerSliceX, playerSliceY, 128, 192,
                player.pos.x - relationalObject.pos.x + Math.min(448, (448 + relationalObject.pos.x)), 
                // 128 x 192
                player.pos.y - relationalObject.pos.y + Math.min(352, (352 + relationalObject.pos.y)),
                128, 192);
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
                playerSliceX = 0;
                playerSliceY = 0;
              }
              else if (player.animation.facing === "right") {
                playerSliceX = 256;
                playerSliceY = 0;
              }
              else if (player.animation.facing === "up") {
                playerSliceX = 128;
                playerSliceY = 0;
              }
              else if (player.animation.facing === "down") {
                playerSliceX = 384;
                playerSliceY = 0;
              }
              ctxMain.drawImage(imageMainPlayer, playerSliceX, playerSliceY, 128, 192,
                player.pos.x - relationalObject.pos.x + Math.min(448, (448 + relationalObject.pos.x)), 
                // 128 x 192
                player.pos.y - relationalObject.pos.y + Math.min(352, (352 + relationalObject.pos.y)),
                128, 192);
            }
          });
        }
      }

      function drawPlayer(player) {
        // Draws a single player, currently designed only
        // to be used on the current player.

        // Temporary player facing animation
        if (Session.equals("keyArrowLeft", "down")) {
          sliceX = 0;
          sliceY = 0;
        }
        else if (Session.equals("keyArrowRight", "down")) {
          sliceX = 256;
          sliceY = 0;
        }
        else if (Session.equals("keyArrowUp", "down")) {
          sliceX = 128;
          sliceY = 0;
        }
        else if (Session.equals("keyArrowDown", "down")) {
          sliceX = 384;
          sliceY = 0;
        }
        // Draw current player 448, 352
        ctxMain.drawImage(imageMainPlayer, sliceX, sliceY, 128, 192,
          Math.min(448, (448 + player.pos.x)), 
          // 128 x 192
          Math.min(352, (352 + player.pos.y)), 128, 192);
      }

      // All code that actually draws on the canvas should
      // go below here.
      clearCanvas();
      drawEnviroment(me, "below");
      drawPlayersOther(playersInZone, me, "below");
      drawPlayer(me);
      drawPlayersOther(playersInZone, me, "above");
    }
  }
  
  function canvasMainDrawLoop () {
    (function animloop(){
      requestAnimFrame(animloop);
      drawCanvasMain();
    })();
  }

  // keydown
  function attachControls () {
    window.addEventListener("keydown", function (event) {
      // Movement
      // Up Arrow
      if (event.keyCode === 38) {
        Session.set("keyArrowUp", "down");
      }
      // Left Arrow
      if (event.keyCode === 37) {
        Session.set("keyArrowLeft", "down");
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
      // Up Arrow
      if (event.keyCode === 38) {
        Session.set("keyArrowUp", "up");
      }
      // Left Arrow
      if (event.keyCode === 37) {
        Session.set("keyArrowLeft", "up");
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
          // Up Arrow, Negative Y
          if (Session.equals("keyArrowUp", "down")) {
              Meteor.call("incrementPlayerPosition", playerCurrent_id, 0, -moveAmount, "up");
          }
          // Left Arrow, Negative X
          if (Session.equals("keyArrowLeft", "down")) {
              Meteor.call("incrementPlayerPosition", playerCurrent_id, -moveAmount, 0, "left");
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
            console.log("Space Pressed");
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

  // Server Information Publishes
  /*
  Meteor.publish("playersInZone", function (zone) {
    return Players.find({"zone.name": zone, online: "true"});
  });
  */

  // Server Meteor.methods
  Meteor.methods({
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
          x: 1984,
          y: 352,
          z: 0
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




        // Statistics


        entryEnd: "entryEnd"
      });                              
    },

    incrementPlayerPosition: function (id, x, y, facing) {
      Players.update(id, {$inc: {"pos.x": x}});
      Players.update(id, {$inc: {"pos.y": y}});
      Players.update(id, {$set: {"animation.facing": facing}});
    }
  });

  // Server Accounts Config
  Accounts.onCreateUser(function(options, user) {
    // We still want the default hook's 'profile' behavior.
    if (options.profile)
      user.profile = options.profile;
    if (!Players.findOne({"name.first": user.username})) {
      Meteor.call("createPlayer", user.username);
    }
    return user;
  });


  Meteor.startup(function () {
    if (!Zones.findOne({"name": "ct_cathedral"})) {
      Zones.insert( {
        name: "ct_cathedral",
        players: {
          online: [],
          offline: []
        }
      });                              
    }
    /*
    var players = Players.find();
    var handle = players.observe({
      added: function (id) {

      }
    });
    */
  });
}
