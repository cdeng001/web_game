var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bcrypt = require('bcryptjs');

var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');
var dbUrl = 'mongodb://localhost:27017/game';
var appDb,
    onlineUsers = {};

MongoClient.connect(dbUrl, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    appDb = db;
});

//rarity percentages
var common = .60,
    rare = .90,
    secret = 1.0;

app.use('/lib', express.static(__dirname + '/lib'));
app.use('/object', express.static(__dirname + '/js/objects'));
app.use('/scene', express.static(__dirname + '/js/scenes'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function(req, res){
    res.sendfile('index.html');
});

io.on('connection', onSocketConnection);

http.listen(3000, function(){
    console.log('listening on *:3000');
});

function onSocketConnection(client) {

    client.on('createUser', createUserAttempt);
    client.on('loginUser', loginUserAttempt);
    client.on("disconnect", onClientDisconnect);
    client.on('refreshChallenges', resendChallenges);
    client.on('findUser', lookUpUser);
    client.on("sendChallenge", sendChallenge);
    client.on('acceptChallenge', acceptChallenge);
    console.log("New player has connected: "+client.id);

}

function createUserAttempt(c){

    var player = {
            username : c.username,
            password : bcrypt.hashSync(c.password, 12),
            name: c.screenname,
            wins: 0,
            losses: 0,
            challenges: []
        },
        id = this.id;

    appDb.collection('users').insertOne(player, function(err, r){
        if(err != null){
            console.log(err);
            console.log(r);

            io.to(id).emit('createResult', {ok: false, err: err, r: r});
        }
        else{
            io.to(id).emit('createResult', {ok: true});
        }
    });
}

function loginUserAttempt(c){
    var passwordAttempt = c.password,
        username = c.username,
        id = this.id;

    if(username == null){
        return;
    }

    appDb.collection('users').findOne({username: username}, function(err, doc){
        if(err != null){
            console.log(err);

            io.to(id).emit('loginResult', {ok: false, err: 'Couldn\'t find user.'});
        }
        else{
            if(doc != null){
                if(bcrypt.compareSync(passwordAttempt, doc.password)){
                    delete doc.password;
                    delete doc.username;

                    onlineUsers[id] = doc.name;

                    io.to(id).emit('loginResult', {ok:true, user:doc});
                }
                else{
                    io.to(id).emit('loginResult', {ok:false, err: 'Incorrect password.'})
                }
            }
            else{
                io.to(id).emit('loginResult', {ok: false, err: 'Couldn\'t find user.'});
            }

        }
    });
}

function resendChallenges(){
    var id = this.id,
        name = onlineUsers[id];

    appDb.collection('users').findOne({name: name}, function(err, doc){
        if(err != null){
            console.log(err);

            io.to(id).emit('refreshChallenges', {ok: false, err: err});
        }
        else{
            io.to(id).emit('refreshChallenges', {ok: true, res: doc.challenges});
        }
    });
}

function onClientDisconnect(){
    var id = this.id;

    delete onlineUsers[id];
}

function lookUpUser(n){
    var id = this.id;

    appDb.collection('users').findOne({name: n}, function(err, doc){
        if(err != null){
            console.log(err);

            io.to(id).emit('userFound', {ok: false, err: err});
        }
        else{
            delete doc.password;
            delete doc.username;
            delete doc._id;

            io.to(id).emit('userFound', {ok: true, res: doc});
        }
    });
}

function sendChallenge(n){
    var id = this.id,
        selfName = onlineUsers[id];

    if(selfName != undefined){

        appDb.collection('users').findOne({name: n}, {challenges: 1}, function(err, doc){

            if(err != null){
                //error
                console.log(err);
            }
            else{
                console.log(doc);
                //if the user is already added ignore
                if( !(doc.challenges.indexOf(selfName) > -1) ){
                    //the users name was not found on the list, we can add the player
                    appDb.collection('users').updateOne({name:n}, {$push:{ challenges:selfName }}, function(err, doc){
                        if(err != null){
                            io.to(id).emit('challengeSent', {ok:true})
                        }
                    });
                }
                else{
                    //the user was found, do not add and send error
                    io.to(id).emit('challengeSent', {ok:false, err:'Already sent request.'})
                }
            }

        });
    }
}

function acceptChallenge(){}



