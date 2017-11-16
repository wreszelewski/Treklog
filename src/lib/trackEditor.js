const { setTrackInitialPosition, storeSocialImage } = require('./database');

function setInitialPosition() {
    const initialPosition = {
        position: {
            x: viewer.camera.position.x,
            y: viewer.camera.position.y,
            z: viewer.camera.position.z
        },
        heading: viewer.camera.heading,
        pitch: viewer.camera.pitch,
        roll: viewer.camera.roll
    }
    return setTrackInitialPosition(window.location.pathname, initialPosition);
}

function setSocialImage() {
    const socialFilePath = window.location.pathname
    viewer.render();
    const socialImageRaw = viewer.canvas.toDataURL();


    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 472;

    var ctx = canvas.getContext('2d');
    const credits = Array.from(document.getElementsByClassName('cesium-credit-textContainer')[0].children).reduce((acc, val) => {
        return acc + val.innerHTML;
    }, '');

    
    console.log(credits);
    var data = '<svg xmlns="http://www.w3.org/2000/svg" width="' + viewer.canvas.width + '" height="200">' +
               '<foreignObject width="100%" height="100%">' +
               '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:7px;color:white;font-family:sans-serif;">' +
                credits +
               '</div>' +
               '</foreignObject>' +
               '</svg>';
    
    var DOMURL = window.URL || window.webkitURL || window;
    
    var img = new Image();
    var img2 = new Image();
    var svg = "data:image/svg+xml," + data
    
    img.onload = function() {
      ctx.drawImage(img, 0, 0, 900, 472);
      img2.onload = function() {
          ctx.drawImage(img2, 0, canvas.height-10);  
          //DOMURL.revokeObjectURL(url);
          return storeSocialImage(socialFilePath, canvas.toDataURL());
      }
      img2.src = svg;
    }
    
    img.src = socialImageRaw;

    
}

module.exports = {
    setInitialPosition,
    setSocialImage
}