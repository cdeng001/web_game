function Game(){

    //screen dimensions
    this.screen_w = 960;
    this.screen_h = 640;

    //current screen, game always starts on title scene
    this.currentScene = "TitleScene";

    //getters for window dimensions
    this.getWindowWidth = function(){ return this.screen_w; };
    this.getWindowHeight = function(){ return this.screen_h; };

    //getter function for games current scene
    this.getCurrentScene = function(){ return this.currentScene; };

    //setter for changing scene
    this.setCurrentScene = function(sName, data){
        Crafty.enterScene(sName, data);
        this.currentScene = sName;
    };

    //init function
    this.init = function(){
        initCrafty(this.screen_w, this.screen_h);
        initSocket();
    };

    /*private function to load assets and set up game through Crafty engine.
     enable scenes for the game,
     set up custom components made from Crafty
     set up paths for audio/images
     load assets and start game
     */
    function initCrafty(w, h){
        Crafty.init(w, h, document.getElementById('game'));

        //initialize scenes - scene(sceneName, initFunction, endFunction)
        Crafty.defineScene("TitleScene", onTitleSceneInit, onTitleSceneExit);
        Crafty.defineScene("CreditsScene", onCreditsSceneInit, onCreditsSceneExit);
        Crafty.defineScene("LoginScene", onLoginSceneInit, onLoginSceneExit);
        Crafty.defineScene("MainMenuScene", onMainMenuSceneInit, onMainMenuSceneExit);
        Crafty.defineScene("GameScene", onGameSceneInit, onGameSceneExit);
        Crafty.defineScene("ScoreScene", onScoreSceneInit, onScoreSceneExit);

        Crafty.paths({
            audio: "assets/sound/",
            images: "assets/images/"
        });

        initCraftyComponents();

        Crafty.load(assetsObj, // preload assets
            function() { //when loaded
                //begin game
                Crafty.enterScene("TitleScene");
            },

            function(e) { //progress
                //console.log(e);
            },

            function(e) { //uh oh, error loading
                console.log(e);
            }
        );
    }

    //private function to initialize Crafty components
    function initCraftyComponents(){
        //UnitComponentInit();
        //EnemyComponentInit();
        UIComponentInit();
    }

    //private function to enable connection and define client actions when receiving a server response
    function initSocket(){
        socket = io.connect("http://localhost:3000");

        socket.on("createResult", handleCreateResult);
        socket.on('loginResult', handleLoginResult);
        socket.on('refreshChallenges', handleChallengeRefresh);
        socket.on('userFound', handleUserFound);
        socket.on('challengeSent', handleChallengeSent);
    }

    //client server initiations-------------------------------------------------------

    //send create user to the server
    this.createUser = function(i){
        socket.emit('createUser', i);
    };

    //log this user in
    this.loginUser = function(i){
        socket.emit('loginUser', i);
    };

    //resend the challenge list
    this.refreshChallenges = function(){
        socket.emit('refreshChallenges');
    };

    this.findUser = function(n){
        socket.emit('findUser', n);
    };

    this.sendChallenge = function(n){
        socket.emit('sendChallenge', n);
    };

    //client server response functions------------------------------------------------
    function handleCreateResult(r){
        console.log(r);
    }

    function handleLoginResult(r){

        if(r.ok){
            //store user object in local storage
            Crafty.storage('user', r.user);

            game.setCurrentScene('MainMenuScene');
        }
        else{
            console.log(r);
        }
    }

    function handleChallengeRefresh(r){
        if(r.ok){
            console.log(r.res);
            Crafty('MainMenuPanel').get(0).updateChallengeList(r.res);
        }
        else{
            console.log(r.err);
        }
    }

    function handleUserFound(r){
        if(r.ok){
            Crafty('MainMenuPanel').get(0).updateUserFind(r.res);
        }
        else{
            console.log(r.err);
        }
    };

    function handleChallengeSent(r){
        if(r.ok){
            console.log(r);
        }
        else{
            console.log(r.err);
        }
    }
}


