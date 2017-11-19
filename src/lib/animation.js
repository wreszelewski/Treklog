
var animationInitialized = false;
let headings = [];
let lastHeading = 0;
let angle = 0;
let angleToApply = 0;
let angleApplied = 0;
let backward = 5000;
let eventListener = null;
let initialOrientation;
let initialDestination;
let timeout = 0;
let secondsDuration = 0;

function setInitialPosition(destination, orientation) {
    initialDestination = destination;
    initialOrientation = orientation;
    timeout = 0;
}

function clearInitialPosition() {
    initialDestination = null;
    initialOrientation = null;
}

function median(values){
    values.sort(function(a,b){
    return a-b;
  });

  if(values.length ===0) return 0

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

function headingRotation(track) {
    const heading = calculateMovementHeading(track);
    if(heading) {
        headings.push(heading);
    }    
        //viewer.camera.lookRight(lastHeading - headingToApply);
    if(Math.abs(angleApplied) < Math.abs(angleToApply)) {
        
        viewer.camera.rotateRight(angle);
        angleApplied += angle;
    } else {
        const headingToApply = median(headings);
        angleToApply = lastHeading - headingToApply;
        if(Math.abs(angleToApply) > (Cesium.Math.PI + Cesium.Math.PI_OVER_TWO)) {
            if(angleToApply < 0) {
                angleToApply = Cesium.Math.TWO_PI + angleToApply;
            } else {
                angleToApply = angleToApply - Cesium.Math.TWO_PI;
            }
        }
        angle = angleToApply / 60;
        headings = [];
        angleApplied = 0;
        lastHeading = headingToApply;

            
    }
}

function init() {
    return Promise.resolve().then(() => {
        if(!animationInitialized) {
            viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
            viewer.clock.currentTime = viewer.clock.startTime;
            secondsDuration = Cesium.JulianDate.secondsDifference(viewer.clock.stopTime, viewer.clock.startTime);
            viewer.dataSources.get(0).show = false;
            const track = viewer.dataSources.get(1)
            let lastPosition = track.entities.getById('path').position.getValue(viewer.clock.currentTime);
            viewer.dataSources.get(1).show = true;
            animationInitialized = true;
            lastHeading = calculateMovementHeading(track);
            eventListener = viewer.clock.onTick.addEventListener(() => {

               headingRotation(track);
               if(backward < 4000) {
                   viewer.camera.moveBackward(100);
                   backward += 100;
               }
               const seconds = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
               $('#animationProgress').progress({
                total: secondsDuration,
                value: seconds,
                showActivity: false,
                precision: 10,
                autoSuccess: false
              });
            });
            return viewer.flyTo(track.entities.getById('path')).then(() => {
                return new Promise(resolve => {

                    setTimeout(() => {
    
                        viewer.trackedEntity = track.entities.getById('path');
                        backward = 0;
                        resolve();
                    }, timeout);
                })
            });
        } else {
            return Promise.resolve();
        }
    })

}

function play() {
    return init().then(() => {
        if(Cesium.JulianDate.equals(viewer.clock.currentTime, viewer.clock.stopTime)) {
            viewer.clock.currentTime = viewer.clock.startTime;
        }
        setTimeout(() => {

            viewer.clock.shouldAnimate = true;        
        },2000);
    })
}

function pause() {
    viewer.clock.shouldAnimate = false;
}

function stop() {
    reset();
    timeout = 3200;
    viewer.dataSources.get(1).show = false;
    viewer.dataSources.get(0).show = true;
    viewer.trackedEntity = null;
    viewer.clock.currentTime = viewer.clock.startTime;
    if(initialDestination && initialOrientation) {
        return viewer.camera.flyTo({
            destination: initialDestination,
            orientation: initialOrientation,
            maximumHeight: 3000
        });
    } else {
        return viewer.flyTo(viewer.dataSources.get(0));
    }
}

function faster() {
    viewer.clock.multiplier *= 2;
}

function slower() {
    viewer.clock.multiplier /= 2;
}

function reset() {
    
    angleToApply = 0;
    angleApplied = 0;
    headings = [];
    viewer.clock.shouldAnimate = false;    
    animationInitialized = false;
    if(eventListener) {
        
               eventListener()
                eventListener = null;
            }
    $('#animationProgress').progress({
        total: secondsDuration,
        value: 0,
        showActivity: false,
        precision: 10,
        autoSuccess: false
        });
    
}

function setTimeFromTimeline(event) {
    const width = $('#animationProgress').width();
    const offset = $('#animationProgress').offset();
    const position = event.pageX - offset.left;
    console.log(position);
    const percent = position / width;
    console.log(percent);
    const secondsSinceStart = percent * secondsDuration;
    console.log(secondsSinceStart);
    viewer.clock.currentTime = Cesium.JulianDate.addSeconds(viewer.clock.startTime, secondsSinceStart, new Cesium.JulianDate());
}

function showBar() {
    $('#animationMenu').show();
}



module.exports = {
   play,
   pause,
   stop,
   faster,
   slower,
   reset,
   setInitialPosition,
   clearInitialPosition,
   setTimeFromTimeline,
   showBar
}