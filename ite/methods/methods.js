// Shared Methods
Meteor.methods({
  setKeyPressed: function(key, accountId) {
    if (Meteor.isServer) {
      var playerId = Meteor.call("getPlayerCurrentId", accountId)
      switch (key) {
        case "left":
          if (!Players.findOne(playerId).keys.left.pressed) {
            Players.update(playerId, {$set: {
              "keys.left.pressed": new Date().getTime()
            }});
          }
          break;
        case "up":
          if (!Players.findOne(playerId).keys.up.pressed) {
            Players.update(playerId, {$set: {
              "keys.up.pressed": new Date().getTime()
            }});
          }
          break;
        case "right":
          if (!Players.findOne(playerId).keys.right.pressed) {
            Players.update(playerId, {$set: {
              "keys.right.pressed": new Date().getTime()
            }});
          }
          break;
        case "down":
          if (!Players.findOne(playerId).keys.down.pressed) {
            Players.update(playerId, {$set: {
              "keys.down.pressed": new Date().getTime()
            }});
          }
          break;
      }
    }
  },
  setKeyReleased: function(key, accountId) {
    if (Meteor.isServer) {
      var playerId = Meteor.call("getPlayerCurrentId", accountId)
      switch (key) {
        case "left":
          Players.update(playerId, {$set: {
            "keys.left.released": new Date().getTime()
          }});
          break;
        case "up":
          Players.update(playerId, {$set: {
            "keys.up.released": new Date().getTime()
          }});
          break;
        case "right":
          Players.update(playerId, {$set: {
            "keys.right.released": new Date().getTime()
          }});
          break;
        case "down":
          Players.update(playerId, {$set: {
            "keys.down.released": new Date().getTime()
          }});
          break;
      }
    }
  },
  getPlayerCurrent: function(accountId) {
    return Players.findOne({"account._id": accountId}, {fields: {
      _id: 1,
      name: 1,
      pos: 1,
      zone_id: 1,
      area_id: 1,
      sprite: 1,
      "hitbox.layering": 1,
      "hitbox.focus": 1,
      animation: 1
    }});
  },



  getPlayersInArea: function(areaId) {
    return Players.find({area_id: areaId}, {fields: {
      _id: 1,
      name: 1,
      pos: 1,
      zone_id: 1,
      area_id: 1,
      sprite: 1,
      "hitbox.layering": 1,
      "hitbox.focus": 1,
      animation: 1
    }}).fetch();
  },

  getArea: function(areaId) {
    return Areas.findOne(areaId, {fields: {
      _id: 1,
      width: 1,
      height: 1,
      layers: 1
    }});
  }

});

