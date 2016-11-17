function onTitleSceneInit(){
    Crafty.background("url(assets/images/background.png)");

    Crafty.e("2D, DOM, Text, Keyboard")
        //size of words
        .attr({ w: 100, h: 20, x: game.getWindowWidth()/2 - 50, y: game.getWindowHeight()/2 - 10 })
        //text of words
        .text("Press Space")
        //text align of words
        .css({ "text-align": "center"})
        //text color
        .textColor("#FFFFFF")
        //key binds, on space press, should advance to name page
        .bind('KeyDown', function(e) {
            if(e.key == Crafty.keys.SPACE) {
                game.setCurrentScene("LoginScene");
            }
        })
    ;
}
function onTitleSceneExit(){}