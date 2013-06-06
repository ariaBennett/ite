// Shared Methods
Meteor.methods({
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

