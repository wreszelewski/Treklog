const jsdom = require("jsdom");

const dom =  new jsdom.JSDOM('<html><head></head><body><div id="rondavu_container"></div></body></html>');

global.window = dom.window;
global.document = dom.window.document;