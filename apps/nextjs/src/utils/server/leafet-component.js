var LeafletFactory = require("./server-leaflet");
var components = require("server-components");
var MapElement = components.newElement();
MapElement.createdCallback = function (document) {
  var L = LeafletFactory(new components.dom.Window(), document);
  var map = L.map(this).setView([41.3851, 2.1734], 12);
  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);
};

components.registerElement("leaflet-map", { prototype: MapElement });
