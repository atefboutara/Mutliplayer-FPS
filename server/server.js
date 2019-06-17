var port = process.env.PORT || 3000;
var io = require('socket.io')(port);
var shortId = require('shortid');

var players = [];

console.log("server started on port " + port);

io.on('connection', function (socket) {
	console.log("A client just connected!");
	var thisPlayerId = shortId.generate();
			var Player = {
			id:thisPlayerId,
			pos:{
				x:0,
				y:0,
				z:0
			},
			Rot:{
				x:0,
				y:0,
				z:0
			},
			score:0,
			avatar:0,
			nom:""
			//menu:""
		};
		players[thisPlayerId] = Player;
		socket.emit('Connected');
		console.log(players);
		
	
	socket.on('SendName', function(data) {
		data.id = thisPlayerId;
		console.log("Client name received : " + data.name + " ID : " + data.id);
		Player.nom = data.name;
		// Player.menu= data.menu;
		socket.emit('serverreceivedname', data);
	});
	
	socket.on('SendAvatar', function(data) {
		data.id = thisPlayerId;
		data.name = Player.nom;
		console.log("Avatar received - Name : " + data.name + " ID : " + data.id + " Avatar : " + data.avatar);
		Player.avatar = data.avatar;
		// Player.menu=data.menu;
		socket.emit('serverreceivedavatar',data);
	});
	
	socket.on('UpdatePosition', function(data) {
		// console.log("Position data update recieved",data);
		players[thisPlayerId].pos=(data["pos"]);
		players[thisPlayerId].Rot=(data["Rot"]);
		//console.log("POS:",thisPlayerId,"  ",players[thisPlayerId].pos);
		//console.log("ROT:",thisPlayerId," ",data.Rot);
		data.id=thisPlayerId;
		data.name=players[thisPlayerId].nom;
		// console.log(players);
		socket.broadcast.emit('moveForOthers',data);
	});

	
		socket.on('playerTransform', function (data) {
        console.log('Position recieved : ',data);
		players[data["id"]].pos=(data["Pos"]);
		players[data["id"]].Rot=(data["Rot"]);
        socket.broadcast.emit('SpawnForOthers',players[data["id"]]);
		console.log('Tableau du joueur',players[data["id"]]);
		for(var playerId in players){
			if(playerId == thisPlayerId)
            continue;
			socket.emit('SpawnForOthers',players[playerId]);
			console.log('Spawned players for him');
		};
    });
	
	socket.on('PlayerFired', function (data) {
		// console.log(data)
		socket.broadcast.emit('playerFireCast',data);
    });
	
	socket.on('somedead', function  (data) {
		// console.log('zaretna lbarka');
		console.log('dead player id:',data);
		 // console.log('Kill:',players[data.deadid]);
		 data.name=players[data.deadid].nom;
		 players[data.deadid].pos={x:-22,y:-22,z:-22};
		 socket.broadcast.emit('KillHimClient',data);
		 console.log('sent',data);
	});
	
		// socket.on('getCharachtersInCS', function(data) {
			// var playersInCS = {name:"",id:""};
			// var playersInCS2 = [];
			// for (var i=0,j=0;i<players.length;i++){
				// if (players[i].menu=="cs"){
					// playersInCS.id=players[i].id;
					// playersInCS.name=players[i].nom;
					// playersInCS2[j]=playersInCS;
					// j++;
				// }
			// }
			// console.log("Players in cs are" , playersInCS2,j,i);
	// });
	
	
     socket.on('disconnect', function () {
         socket.broadcast.emit('disconnected',{id:thisPlayerId,name:players[thisPlayerId].nom});
		 console.log('Disconnected:',players[thisPlayerId].nom);
		 delete players[thisPlayerId];

     });
	 
	
	

	
	
});