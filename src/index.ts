import * as ol from "openlayers";
import "openlayers/dist/ol.css";

let map = new ol.Map({
    target: "everest-ui",
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([-85, 70]),
        zoom: 4
    })
});
