// Timer management
const Timer = {
    interval: null,
    startTime: null,
    duration: 0,
    elapsed: 0,
    
    start(durationInSeconds, onTick, onComplete) {
        this.duration = durationInSeconds;
        this.startTime = Date.now();
        this.elapsed = 0;
        
        this.interval = setInterval(() => {
            this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const remaining = this.duration - this.elapsed;
            
            if (remaining <= 0) {
                this.stop();
                onComplete();
            } else {
                onTick(remaining, this.elapsed);
            }
        }, 100);
    },
    
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    },
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    getElapsedMinutes() {
        return this.elapsed / 60;
    }
};
