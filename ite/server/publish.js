//TODO Publish specific characters instead of accounts as characters
Meteor.publish("getPlayerIdFromUserId", function(user_id) {
  return Players.find({"account._id": user_id}, {fields: {
    "account._id": 1,
    _id: 1 
  }});
});

Meteor.publish("getPlayerLocation", function(_id) {
  return Players.find(_id, {fields: {
    _id: 1,
    zone_id: 1,
    area_id: 1
  }});
});

Meteor.publish("getZone", function(_id) {
  return Zones.find(_id, {fields: {
    _id: 1, 
    name: 1
  }});
});

Meteor.publish("getArea", function(_id) {
  return Areas.find(_id, {fields: {
    _id: 1, 
    name: 1,
    size: 1
  }});
});

Meteor.publish("getPlayersInArea", function(areaId) {
  return Players.find({area_id: areaId, online: "true"}, {
    sort: {
      "hitbox.layering.pos.y": 1,
      "pos.z": 1
  }}, {
    fields: {
      _id: 1, 
      name: 1,
      pos: 1
  }});
});
