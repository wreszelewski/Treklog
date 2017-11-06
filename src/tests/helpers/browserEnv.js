const jsdom = require("jsdom");

const dom =  new jsdom.JSDOM('<html><head></head><body><div id="rondavu_container"></div></body></html>');

let localstorage = {}

class DOMParser {
    parseFromString(xmlString) {
        const domDoc = new jsdom.JSDOM(xmlString);
        domDoc.getElementsByTagName = domDoc.window.document.getElementsByTagName.bind(domDoc.window.document);
        return domDoc;
    }
}


global.window = dom.window;
global.document = dom.window.document;
global.DOMParser = DOMParser;

global.localStorage = {}
global.localStorage.getItem = (name) => localstorage[name];
global.localStorage.setItem = (name, value) => localstorage[name] = value;
global.localStorage.clean = () => localstorage = {};