Meteor.methods({
  incrementPlayerPosition: function(id, incX, incY, facing) {
    Session.set("playerCurrent", Session.get("playerCurrent").pos.x + incX);
  }

});
