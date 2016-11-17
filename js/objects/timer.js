function Timer(entity, callback, delay, reps) {
    var id, started, remaining = delay, running

    this.start = function() {
        running = true;
        started = new Date();
        id = entity.delay(callback, remaining, reps)
    };

    this.pause = function() {
        running = false;
        entity.cancelDelay(callback);
        remaining -= new Date() - started
    };

    this.addTime = function(t){
        if(running) {
            this.pause();
            remaining += t;
            this.start();
        }
    };

    this.decreseTime = function(t){
        if(running){
            this.pause();
            remaining -= t;
            if(remaining < 1){
                remaining = 0;
            }
            this.start();
        }
    };

    this.getTimeLeft = function() {
        if (running) {
            this.pause();
            this.start();
        }

        return remaining
    };

    this.getStateRunning = function() {
        return running
    };

    this.start()
}
