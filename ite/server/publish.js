//TODO Publish specific characters instead of accounts as characters

Meteor.publish("zone", function(_id) {
  return Zones.find(_id, {fields: {
    _id: 1, 
    name: 1
  }});
});

Meteor.publish("area", function(areaId) {
  return Areas.find(areaId, {fields: {
    _id: 1, 
    name: 1,
    width: 1,
    height: 1,
    size: 1,
    layers: 1,
    timelineId: 1
  }});
});

Meteor.publish("timeline", function(timelineId) {
  return Timelines.find(timelineId, {fields: {
    _id: 1, 
    timeline: 1
  }});
});

Meteor.publish("player", function(playerId) {
  return Players.find(playerId, {fields: {
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
});

Meteor.publish("playersInArea", function(areaId) {
  return Players.find({area_id: areaId, online: "true"}, {
    fields: {
      _id: 1,
      name: 1,
      pos: 1,
      area_id: 1,
      sprite: 1,
      "hitbox.layering": 1,
      "hitbox.focus": 1,
      animation: 1
  }});
});
