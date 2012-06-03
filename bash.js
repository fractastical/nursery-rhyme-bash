// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

Texts = new Meteor.Collection("texts");
Players = new Meteor.Collection("players");
Entries = new Meteor.Collection("entries");

var activeText;
var currIndex = 0;

if (Meteor.is_client) {

  Template.gameboard.texts = function () {
	  return textsAsArray;
  };

  Template.gameboard.active_text = function () {
    
    a_text = Texts.findOne(Session.get("active_text"));
    if(a_text)
		a_text = a_text.text;
    return a_text;
  };

  Template.gameboard.events = {

    'click input.thebutton': function () {

	     var textsAsArray = Texts.find({}, {sort: {text: 1}}).fetch();
         Session.set("active_text", textsAsArray[currIndex]);
		 if(currIndex < (textsAsArray.length - 1))
			currIndex++;

		 Session.set("startTime", new Date().getTime());

    },
	'keyup textarea': function () {
		
	    var typedInVal = $('textarea').val();
	    var neededVal = Session.get("active_text").text;
	    if(typedInVal === neededVal)
		{
		 	Session.set("itMatches", true);
		    alert("nice!");
		} 
			
		
	    
	    
	},
    'click input.donebutton': function () {

	     a_text = Texts.findOne(Session.get("active_text"));
	     
	
	     var textsAsArray = Texts.find({}, {sort: {text: 1}}).fetch();
         Session.set("active_text", textsAsArray[currIndex]);

         var startTime = Session.get("startTime") || new Date().getTime();
         var elapsed =   new Date().getTime() - startTime;
		 
		 Session.set("startTime", new Date().getTime());
		
		 var prevTime =  Session.get("totalChallengeTime") || 0;
		 Session.set("totalChallengeTime", prevTime + elapsed);
		
		 if(currIndex == (textsAsArray.length - 1))
			alert('Finished! Total time was: ' + (prevTime + elapsed));

		 if(currIndex < (textsAsArray.length - 1))
			currIndex++;


		 Session.set("itDoesntMatch", true);

			
		 //alert(elapsed);
		

    }


  };


  Template.leaderboard.players = function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events = {
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    }
  };

  Template.player.events = {
    'click': function () {
      Session.set("selected_player", this._id);
    }
  };
}

// On server startup, create some players if the database is empty.
if (Meteor.is_server) {
  Meteor.startup(function () {

    if(Players.find().count() > 0)
		Players.remove({});

	if(Texts.find().count() > 0)
		  Texts.remove({});


    if (Texts.find().count() === 0) {
	
      var texts =  [ "Trial to get warmed up.",
        "abc",
        "Mary had a little lamb,\
		whose fleece was white as snow.\
		And everywhere that Mary went,\
		the lamb was sure to go." ,
		
		"Little Miss Muffet\
				Sat on a tuffet,\
				Eating her curds and whey;\
				Along came a spider,\
				Who sat down beside her\
				And frightened Miss Muffet away."
		];

      for (var i = 0; i < texts.length; i++)
         	Texts.insert({text: texts[i]});

	}

    if (Players.find().count() === 0) {

      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];

      var speeds = [30,
                   40,
                   50,
                   60,
                   70,
                   85];

      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], speed: speeds[i], score: Math.floor(Math.random()*10)*5});

    }
  });
}
