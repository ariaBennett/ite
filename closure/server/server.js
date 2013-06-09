goog.provide('server.start');
goog.require('goog.structs.PriorityQueue');
goog.require('goog.structs.Heap');
server.start = function() {
// Closure uses the stuff above


// Server-only Meteor.methods
Meteor.methods({
  debugPrintPlayerDoc: function (accountId) {
    var playerId = Meteor.call("getPlayerCurrentId", this.userId);
    //Meteor.call("incrementPlayerPosition", playerId, 0, 1, "down");
    Players.update(playerId, {$inc: {"pos.y": 1}});
    console.log(Players.findOne(playerId));
    console.log(Queues.findOne());
  },
  getPlayerCurrentId: function(accountId) {
    return Players.findOne({"account._id": this.userId})._id;
  },
  getPlayerCurrentAreaId: function(accountId) {
    return Players.findOne({"account._id": this.userId}).area_id;
  },
  updateHitboxes: function(id, type) {
    if (type === "players") {
      //#subs
      //TODO Fix playerid dependency
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

  incrementPlayerPosition: function(id, incX, incY, facing) {
    //#TODO make these non-global
    ////#subs
    var player = Players.findOne({_id: id});
    //#subs
    var area = Areas.findOne({_id: player.area_id});
    var startX = player.hitbox.collision.pos.x;
    var endX = player.hitbox.collision.pos.x + player.hitbox.collision.size.x;
    var startY = player.hitbox.collision.pos.y;
    var endY = player.hitbox.collision.pos.y + player.hitbox.collision.size.y;

    // Exceptions first, else do increment.

    // Screen Edges

    //#TODO isCollision is empty
    if (startX + incX < 0 || endX + incX > area.width) {
      incX = 0;
    }
    else {
      Players.update(id, {$inc: {"pos.x": incX}});
    }
    if (startY + incY < 0 || endY + incY > area.height) {
      incY = 0;
    }
    else {
      Players.update(id, {$inc: {"pos.y": incY}});
    }

    Players.update(id, {$set: {"animation.facing": facing}});
    // Collision
    //#TTEST 1-60ms?
    Meteor.call("updateHitboxes", id, "players");
    //#TTEST 1-60ms?\\
    //#TTEST 50-100ms?
    ////#subs
    Meteor.call("updateSections", player, "players", area.sectionSize);
    //#TTEST 50-100ms?\\
  },
  // #Begin Meteor functions that handle section updates.
  updateSections: function(data, catagory, sectionSize) {
      
    if (catagory === "players") {
      // Remove the player's ids from old sections, then update the player's sections
      // to current, then add the players id to the new sections
      Meteor.call("removeDataSections", data.section_ids, catagory, data._id);
      var new_section_ids = Meteor.call("getSections", data.area_id, sectionSize,
                                                       data.hitbox.collision.pos.x, 
                                                       data.hitbox.collision.size.x, 
                                                       data.hitbox.collision.pos.y, 
                                                       data.hitbox.collision.size.y);
      Meteor.call("updatePlayerSections", data._id, new_section_ids);
      Meteor.call("addDataSections", new_section_ids, catagory, data._id);
    }

  },
  getSections: function(area_id, sectionSize, posX, sizeX, posY, sizeY) {
    var startRow = Math.floor((posY) / sectionSize);
    var endRow =   Math.ceil((posY + sizeY) / sectionSize) - 1;
    var startCol = Math.floor((posX) / sectionSize);
    var endCol =   Math.ceil((posX + sizeX) / sectionSize) - 1;
    
    var section_ids = [];
    for (var row = startRow; row <= endRow; row++) {
      for (var col = startCol; col <= endCol; col++) {
        //TODO Make player doc's section_id's more in 
        //line with the zone and area on the player doc.
        var section = Meteor.call("getSection", area_id, col, row);
        section_ids.push(section);
      }
    }
    return section_ids;
  },
  getSection: function(area_id, column, row) {
    //#subs
    var section = Sections.findOne({area_id: area_id, column: column, row: row});
    return section._id;
  },
  updatePlayerSections: function(player_id, section_ids) {
    Players.update(player_id, {$set: {section_ids: section_ids}});
  },
  addDataSections: function(section_ids, catagory, data_id) {
    if (catagory === "players") {
      _.each(section_ids, function(section_id) {
        //#subs
        Sections.update(section_id, {$push: {players: data_id}});
      });
    }
  },
  removeDataSections: function(section_ids, catagory, data_id) {
    if (catagory === "players") {
      _.each(section_ids, function(section_id) { 
        var updatedArray = [];
        //#subs
        var section = Sections.findOne(section_id);
        _.each(section.players, function (player_id) {
          if (player_id !== data_id) {
            updatedArray.push(player_id);
          }
        });
        //#subs
        Sections.update(section_id, {$set: {players: updatedArray}});
      });
    }
  },
  // #End Meteor functions that handle section updates.
 
  //on 
  isCollisionX: function(player) {
    return false;
    /*
    var playerSections = Sections.find({players: player._id}).fetch();
    
   _.each(playerSections, function(section) {
     for (var i = 0; i < (section.collision).length; i++) {
     }
   });
     */

  },
  isCollisionY: function() {
  },
  
  createPlayer: function (accountId, username, startingZoneId, startingAreaId, startingSectionId) {
    var startingX = 200;
    var startingY = 200;
    var p_id = Players.insert( {
      account: {
        _id: accountId,
        username: username,
        region: "North America"
      },
      server: "alpha",
      online: "true",
      name: {
        prefix: "",
        // TODO
        // use a seperate name for characters
        // other than the account's username
        first: username,
        last: "",
        suffix: ""
      },
      //TODO Pull other players from sections instead of
      //faking it with temporary zone stand in
      zone_id: startingZoneId,
      area_id: startingAreaId,
      section_ids: [startingSectionId],
      pos: {
        x: startingX,
        y: startingY,
        z: 0
      },
      keys: {
        left: {
          pressed: 0,
          released: 0
        },
        up: {
          pressed: 0,
          released: 0
        },
        right: {
          pressed: 0,
          released: 0
        },
        down: {
          pressed: 0,
          released: 0
        }
      },
      hitbox: {
        collision: {
          pos: {
            x: startingX,
            y: startingY
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
    Meteor.call("updateSections", Players.findOne(p_id), "players");
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
  addArea: function (zone_id, zone_name, name, width, height, layersBelow, layersAbove, sectionSize) {
    return Areas.insert({
      zone_id: zone_id,
      // #TODO: decide on a variable naming convention and
      // update accordingly
      zone_name: zone_name,
      name: name,
      width: width,
      height: height,
      sectionSize: sectionSize, 
      // TODO# handle layers as sections instead
      // of areas.
      layers: {
        below: layersBelow,
        above: layersAbove
      }
    });
  },
  addSection: function (area_id, areaName, column, row, startX, startY, sectionSize, sectionCollisionData) {
    Sections.insert({
      area_id: area_id,
      area_name: areaName,
      column: column,
      row: row,
      startX: startX,
      startY: startY,
      sectionSize: sectionSize,
      collision: sectionCollisionData,
      players: []
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
  generateQueue: function (area_id) {
      Queues.insert({
        area_id: area_id,
        queue: new goog.structs.PriorityQueue()
      });
  },
  initZone: function (zoneName, areaDocs) {
    var zone_id = Meteor.call("addZone", zoneName);
    _.each(areaDocs, function(area){
      var area_id = Meteor.call("addArea", zone_id, zoneName, area.name, area.width,
                                area.height, area.layersBelow, area.layersAbove, area.sectionSize);
      Meteor.call("generateQueue", area_id);
      // Insert a new queue for each area.
      Meteor.call("generateSections", area_id, area.name, area.width, area.height, area.sectionSize, 
                  area.collisionData);
    });
    return zone_id;
  }
});

Accounts.onCreateUser(function(options, user) {
  // Server Accounts Config
  if (options.profile)
    user.profile = options.profile;
  if (!Players.findOne({"account.username": user.username})) {
    startingZoneId = Zones.findOne({name: "ct_cathedral"})._id;
    startingAreaId = Areas.findOne({zone_id: startingZoneId})._id;
    startingSectionId = Sections.findOne({area_id: startingAreaId, column: 0, row: 0})._id;
    Meteor.call("createPlayer", user._id, user.username, startingZoneId, startingAreaId, startingSectionId);
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
        sectionSize: 32,
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
    Meteor.call("initZone", "ct_cathedral", areaDocs);
  }
});

//closing brace for closure
};
goog.exportSymbol('server.start', server.start);

