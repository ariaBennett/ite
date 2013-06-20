// Shared Methods
Meteor.methods({
  enqueueEvent: function(time, e) {
    var areaId = Players.findOne(Meteor.user().playerCurrentId).area_id;
    var timelineId = Areas.findOne(areaId).timelineId;
    var timeline = Timelines.findOne(timelineId);
    //TODO Have the server push with lag correction
    console.log();
   // timeline.timeline.push(e, time);
   // Timelines.update(timelineId, {$set: {timeline: timeline.timeline} });
   // console.log(Timelines.find().fetch());

  },

  setKeyPressed: function(key) {
    if (Meteor.isServer) {
      var playerId = Meteor.user().playerCurrentId;
      switch (key) {
        case "left":
          Meteor.call("enqueueEvent", new Date(), {move: "left"});
          break;
        case "up":
            Players.update(playerId, {$set: {
              "keys.up.pressed": new Date()
            }});
          break;
        case "right":
            Players.update(playerId, {$set: {
              "keys.right.pressed": new Date()
            }});
          break;
        case "down":
            Players.update(playerId, {$set: {
              "keys.down.pressed": new Date()
            }});
          break;
      }
    }
  },

  setKeyReleased: function(key) {
    if (Meteor.isServer) {
      var playerId = Meteor.user().playerCurrentId;
      switch (key) {
        case "left":
          Players.update(playerId, {$set: {
            "keys.left.released": new Date()
          }});
          break;
        case "up":
          Players.update(playerId, {$set: {
            "keys.up.released": new Date()
          }});
          break;
        case "right":
          Players.update(playerId, {$set: {
            "keys.right.released": new Date()
          }});
          break;
        case "down":
          Players.update(playerId, {$set: {
            "keys.down.released": new Date()
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

