const { formatSeconds } = require('./utils/time');

class AnimationProgress {
    construct() {
        this.duration = 0;
    }

    setDuration(duration) {
        this.duration = duration;
    }

    setHandlers() {
        $('#animationProgress').mousemove(this.animationProgressHover.bind(this));
        $('#animationProgress').mouseleave(() => {$('#mouseLabel').css({display: 'none'})});
    }

    initializeAnimationProgress() {
        $('#animationProgress').progress({
            total: this.duration,
            value: 0,
            showActivity: false,
            precision: 10,
            autoSuccess: false,
            label: 'ratio',
            text: {
                ratio: '0:00:00h'
            }
        });
        $('#animationMenu').show();
    }

    updateAnimationProgress() {
        const currentTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
        const currentTimeFormatted = formatSeconds(currentTime);
        $('#animationProgress').progress({
            total: this.duration,
            value: currentTime,
            showActivity: false,
            precision: 10,
            autoSuccess: false,
            label: 'ratio',
            text: {
                ratio: currentTimeFormatted
            }
        });
    }

    getTimeFromAnimationProgress(event) {
        const width = $('#animationProgress').width();
        const offset = $('#animationProgress').offset();
        const position = event.pageX - offset.left;
        const percent = position / width;
        const secondsSinceStart = percent * this.duration;
        return secondsSinceStart
    }

    animationProgressHover(event) {
        const secondsSinceStart = this.getTimeFromAnimationProgress(event);
        const newLabel = formatSeconds(secondsSinceStart);
        const newPosition = event.pageX - (newLabel.length * 4) - 154;
        $('#mouseLabel').html(newLabel);
        $('#mouseLabel').css({left: newPosition, display: 'block'});
    }
}

module.exports = AnimationProgress;