function UIComponentInit(){

    //text input are
    Crafty.c('TextInput', {
        required: '2D, DOM, Mouse, Text, Keyboard',
        init: function(){
            this._displayText = "";
            this._max = 25;
            this._caps = false;

        },

        TextInput: function(x, y, w, h, max, protect, size, color){
            this
                .attr({
                    x: x,
                    y: y,
                    w: w,
                    h: h
                })
                .css({
                    'text-align' : 'center',
                    'vertical-align' : 'middle',
                    'padding-top' : '5px'
                })
                .textFont({
                    size: size
                })
                .textColor(color);


            if(typeof max == 'number'){
                this._max = max;
            }

            this._protected = protect;

            return this;
        },

        events: {
            'Click' : function(e){
                //if there are any other active text inputs, deactivate them
                console.log('click');
                Crafty('ActiveTextInput').each(function(){
                    this.deactivate();
                });

                this.activate();
            },

            'KeyDown': function(e){
                if(this.has('ActiveTextInput')){
                    //grabbed digit or alpha
                    if(e.key >= 58 && e.key <= 90) {
                        //check if name length is good
                        if(this._displayText.length < this._max){
                            if(this._caps){
                                this._displayText += String.fromCharCode(e.keyCode);
                            }
                            else{
                                this._displayText += String.fromCharCode(e.keyCode).toLowerCase();
                            }

                        }
                    }
                    else if(e.key >= 48  && e.key <= 57){
                        if(this._displayText.length < this._max){
                            this._displayText += String.fromCharCode(e.keyCode);
                        }
                    }
                    else if(e.key == Crafty.keys.BACKSPACE){
                        if(this._displayText.length > 0){
                            this._displayText = this._displayText.substring(0, this._displayText.length - 1);
                        }
                    }
                    else if(e.key == Crafty.keys.SHIFT){
                        this._caps = true;
                    }

                    if(this._protected){
                        this.text(new Array(this._displayText.length + 1).join( '*' ));
                    }
                    else{
                        this.text(this._displayText);
                    }
                }
            },

            'KeyUp': function(e){
                if(e.key == Crafty.keys.SHIFT){
                    this._caps = false;
                }
            }
        },

        activate: function(){
            this.addComponent('ActiveTextInput')
        },

        deactivate: function(){
            this.removeComponent('ActiveTextInput');
        },

        setTextColor: function(c){
            this.textColor(c);
            return this;
        },

        getText: function(){
            return this._displayText;
        }
    });

    Crafty.c("FadingText", {
        required: "2D, DOM, Text, Tween",

        init: function(){
            this.attr({
                w: game.getWindowWidth(),
                h: 50
            }).css({
                'text-align' : 'center',
                'vertical-align' : 'middle',
                'padding-top' : '5px'
            });
        },

        FadingText: function(phrase, duration){
            this.text(phrase);
            this.timeout(function(){
                this
                    .tween({
                        alpha: 0.0
                    }, 1000)

                    .bind('TweenEnd', function(){
                        this.destroy();
                    });
            }, duration);
            return this;
        },

        setPos: function(x, y){
            this.attr({
                x: x,
                y: y
            });
            return this;
        },

        setColor: function(c){
            this.textColor(c);
            return this;
        }
    });

    Crafty.c('TitlePanel', {
        required: '2D, DOM, spr_login_panel',

        init : function(){
            this.attr({
                x: 100,
                y: 100,
                alpha:.5
            });

            this.title_objs = [];
        },

        //removes all objects in this panel
        clearPanel: function(){
            //delete each object
            for(var i=0; i<this.title_objs.length; i++){
                var e = this.title_objs[i];
                //if the object has tween enabled, fade it out
                if(e.has('Tween')){
                    e
                        .tween({
                            alpha: 0.0
                        }, 1000)

                        .bind('TweenEnd', function(){
                            this.destroy();
                        });
                }
                else{
                    //otherwise destroy it
                    e.destroy();
                }
            }
            this.title_objs.length = 0;
        },

        //function to set up inital menu
        setUpTitleMenu:function(){

            var self = this;

            this.clearPanel();

            this.title_objs.push(
                Crafty.e('2D, DOM, Tween, spr_title_ui')
                    .attr({
                        x: 100,
                        y: 100,
                        alpha: 0
                    })
                    .tween({
                        alpha: 1.0
                    }, 1000),

                Crafty.e('2D, DOM, Mouse')
                    .attr({
                        w: 280,
                        h: 50,
                        x: this.x + 35,
                        y: this.y + 93
                    })
                    .bind('Click', function(){
                        self.setUpLoginMenu();
                    }),

                Crafty.e('2D, DOM, Mouse')
                    .attr({
                        w: 280,
                        h: 50,
                        x: this.x + 35,
                        y: this.y + 173
                    })
                    .bind('Click', function(){
                        self.setUpCreateMenu();
                    }),

                Crafty.e('2D, DOM, Mouse')
                    .attr({
                        w: 280,
                        h: 50,
                        x: this.x + 35,
                        y: this.y + 253
                    })
                    .bind('Click', function(){
                        console.log('quit');
                    })
            )

        },

        setUpLoginMenu: function(){
            var self = this,
                getLoginCredentials = function(){
                    return {
                        username: Crafty('Username').getText(),
                        password: Crafty("Password").getText()
                    }
                };
            this.clearPanel();

            this.title_objs.push(
                Crafty.e('2D, DOM, Tween, spr_login_ui')
                    .attr({
                        x: 100,
                        y: 100,
                        alpha: 0
                    })
                    .tween({
                        alpha: 1.0
                    }, 1000),

                Crafty.e('2D, DOM, Mouse')
                    .attr({
                        w: 100,
                        h: 40,
                        x: this.x + 31,
                        y: this.y + 270
                    })
                    .bind('Click', function(){
                        self.setUpTitleMenu();
                    }),

                Crafty.e('2D, DOM, Mouse')
                    .attr({
                        w: 100,
                        h: 40,
                        x: this.x + 212,
                        y: this.y + 270
                    })
                    .bind('Click', function(){
                        console.log(getLoginCredentials());
                    }),

                Crafty.e('TextInput, Username')
                    .TextInput(this.x + 30, this.y + 106, 280, 40, 24, false, '20px', 'white'),

                Crafty.e('TextInput, Password')
                    .TextInput(this.x + 30, this.y + 180, 280, 40, 24, true, '20px', 'white')
            )
        },

        setUpCreateMenu: function(){
            var self = this,
                getCreateCredentials = function(){
                    return {
                        username: Crafty('Username').getText(),
                        password: Crafty('Password').getText(),
                        confirm: Crafty('Confirm').getText(),
                        screenname: Crafty('ScreenName').getText()
                    }
                },
                confirmCredentials = function(c){
                    var valid = true,
                        err = null;
                    //validate username, should have at least 6 characters
                    if(c.username.length < 6){
                        valid = false;
                        err = "Username must be at least 6 characters long."
                    }

                    //validate the password, length > 6
                    else if(c.password.length < 6){
                        valid = false;
                        err = "Password must be at least 6 charcters long."
                    }

                    //password must contain alpha and numeric values
                    else if (! (/\d/.test(c.password) && /[a-zA-Z]/.test(c.password)) ){
                        valid = false;
                        err = "Password must contain at least 1 number and 1 letter."
                    }

                    //password and confirm must match
                    else if(c.password != c.confirm){
                        valid = false;
                        err = "Incorrect password in confirmation."
                    }

                    //validate screen name, make sure length is at least 4
                    else if(c.screenname.length < 4){
                        valid = false;
                        err = "Screen Name must be at least 4 characters long."
                    }

                    return {
                        valid: valid,
                        err: err
                    };
                };
            this.clearPanel();

            this.title_objs.push(
                Crafty.e('2D, DOM, Tween, spr_create_ui')
                    .attr({
                        x: 100,
                        y: 100,
                        alpha: 0
                    })
                    .tween({
                        alpha: 1.0
                    }, 1000),

                Crafty.e('2D, DOM, Mouse')
                    .attr({
                        w: 100,
                        h: 40,
                        x: this.x + 20,
                        y: this.y + 312
                    })
                    .bind('Click', function(){
                        self.setUpTitleMenu();
                    }),

                Crafty.e('2D, DOM, Mouse')
                    .attr({
                        w: 100,
                        h: 40,
                        x: this.x + 197,
                        y: this.y + 312
                    })
                    .bind('Click', function(){
                        var c = getCreateCredentials(),
                            res = confirmCredentials(c);

                        if(res.valid){
                            console.log('creating user');
                            //server request create user
                            game.createUser(c);
                        }
                        else{
                            //show user the error
                            console.log(res.err);
                        }
                    }),

                Crafty.e('TextInput, Username')
                    .TextInput(this.x + 19, this.y + 80, 280, 35, 24, false, '16px', 'white'),

                Crafty.e('TextInput, Password')
                    .TextInput(this.x + 19, this.y + 142, 280, 40, 24, true, '16px', 'white'),

                Crafty.e('TextInput, Confirm')
                    .TextInput(this.x + 20, this.y + 204, 280, 40, 24, true, '16px', 'white'),

                Crafty.e('TextInput, ScreenName')
                    .TextInput(this.x + 20, this.y + 268, 280, 40, 24, false, '16px', 'white')
            )
        },
    });
}
