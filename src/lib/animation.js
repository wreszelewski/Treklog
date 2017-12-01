
const cameraPosition = require('./utils/cameraPosition');
const AnimationProgress = require('./AnimationProgress');

class Animation {
    constructor() {
        this.animationInitialized = false;
        this.headings = [];
        this.lastHeading = 0;
        this.angle = 0;
        this.angleToApply = 0;
        this.angleApplied = 0;
        this.backward = 5000;
        this.removeEventListener = null;
        this.initialOrientation;
        this.initialDestination;
        this.secondsDuration = 0;
        this.animationProgress = new AnimationProgress();
    }

    initialize(track) {
        viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
        viewer.clock.currentTime = viewer.clock.startTime;
        this.secondsDuration = Cesium.JulianDate.secondsDifference(viewer.clock.stopTime, viewer.clock.startTime);
        const dataSource = viewer.dataSources.get(1)
        this.lastPosition = dataSource.entities.getById('path').position.getValue(viewer.clock.currentTime);
        this.initialDestination = cameraPosition.getDestination(track);
        this.initialOrientation = cameraPosition.getOrientation(track);
        this.animationProgress.setDuration(this.secondsDuration);
        this.animationProgress.initializeAnimationProgress();
    }

    reset() {
        viewer.clock.shouldAnimate = false;
        if(this.removeEventListener) {
            this.removeEventListener();
            this.removeEventListener = null;
        }
        this.angleToApply = 0;
        this.angleApplied = 0;
        this.lastHeading = 0;
        this.headings = [];
        this.animationInitialized = false;
        this.animationProgress.initializeAnimationProgress();
    }

    start(fly = true) {
        return Promise.resolve().then(() => {
            if(!this.animationInitialized) {
                viewer.dataSources.get(0).show = false;
                viewer.dataSources.get(1).show = true;
                const track = viewer.dataSources.get(1);
                this.lastHeading = calculateMovementHeading(track);            
                this.removeEventListener = viewer.clock.onTick.addEventListener(this._tickListener.bind(this));
                if(fly) {
                    viewer.flyTo(track.entities.getById('path'));
                }
                this.animationInitialized = true;
                return new Promise(resolve => {
                    setTimeout(() => {
                        viewer.trackedEntity = track.entities.getById('path');
                        this.backward = 0;
                        setTimeout(() => {
                            resolve();
                        }, 2000);                                        
                    }, 3200);
                });
            } else {
                return Promise.resolve();
            }
        });
    }

    play() {
        return this.start().then(() => {
            if(Cesium.JulianDate.equals(viewer.clock.currentTime, viewer.clock.stopTime)) {
                viewer.clock.currentTime = viewer.clock.startTime;
            }
            viewer.clock.shouldAnimate = true;        
        });
    }

    pause() {
        viewer.clock.shouldAnimate = false;
    }

    stop() {
        this.reset();
        viewer.dataSources.get(1).show = false;
        viewer.dataSources.get(0).show = true;
        viewer.trackedEntity = null;
        viewer.clock.currentTime = viewer.clock.startTime;
        console.log(this.initialDestination);
        console.log(this.initialOrientation);
        if(this.initialDestination && this.initialOrientation) {
            return viewer.camera.flyTo({
                destination: this.initialDestination,
                orientation: this.initialOrientation,
                maximumHeight: 3000
            });
        } else {
            return viewer.flyTo(viewer.dataSources.get(0));
        }
    }

    faster() {
        viewer.clock.multiplier *= 2;
    }
    
    slower() {
        viewer.clock.multiplier /= 2;
    }

    setTimeFromTimeline(event) {
        const secondsSinceStart = this.animationProgress.getTimeFromAnimationProgress(event);
        viewer.clock.currentTime = Cesium.JulianDate.addSeconds(viewer.clock.startTime, secondsSinceStart, new Cesium.JulianDate());
        this.start();
    }

    _tickListener() {
        const track = viewer.dataSources.get(1);
        this._headingRotation(track);
        if(this.animationInitialized && this.backward < 4000) {
            viewer.camera.moveBackward(100);
            this.backward += 100;
        }
        this.animationProgress.updateAnimationProgress();        
    }

    _headingRotation(track) {
        const heading = calculateMovementHeading(track);
        if(heading) {
            this.headings.push(heading);
        }    

        if(Math.abs(this.angleApplied) < Math.abs(this.angleToApply)) { 
            viewer.camera.rotateRight(this.angle);
            this.angleApplied += this.angle;
        } else {
            const headingToApply = median(this.headings);
            this.angleToApply = this.lastHeading - headingToApply;
            if(Math.abs(this.angleToApply) > (Cesium.Math.PI + Cesium.Math.PI_OVER_TWO)) {
                if(this.angleToApply < 0) {
                    this.angleToApply = Cesium.Math.TWO_PI + this.angleToApply;
                } else {
                    this.angleToApply = this.angleToApply - Cesium.Math.TWO_PI;
                }
            }
            this.angle = this.angleToApply / 60;
            this.headings = [];
            this.angleApplied = 0;
            this.lastHeading = headingToApply;
        }
    }
}

function median(values){
    values.sort(function(a,b){
    return a-b;
  });

  if(values.length === 0) return 0

  var half = Math.floor(values.length / 2);

  if (values.length % 2)
    return values[half];
  else
    return (values[half - 1] + values[half]) / 2.0;
}

function calculateMovementHeading(track) {
    const currentPosition = track.entities.getById('path').position.getValue(viewer.clock.currentTime);
    const nextPosition = track.entities.getById('path').position.getValue(viewer.clock.currentTime + viewer.clock.clockStep*300);
    if(!Cesium.Cartesian3.equals(currentPosition, nextPosition)) {
        const vector = Cesium.Cartesian3.subtract(currentPosition, nextPosition, new Cesium.Cartesian3());
        const headingRaw = Math.atan2(vector.y, vector.x) - Cesium.Math.PI_OVER_TWO;
        return Cesium.Math.TWO_PI - Cesium.Math.zeroToTwoPi(headingRaw);
    }
    return null;
}

const animation = new Animation();

module.exports = animation;