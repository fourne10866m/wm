/*
http://localhost/intra_wm/demos/Carte/Simple.php
http://vm-geoserver-d/intra_wm/demos/Carte/Simple.php
*/
$(document).ready(function() {
    // Nouvelle carte
    appli.carte = new VseCarte("map");
    
    // Centrage emprise maximale
    $("#centrer1").click(function(){
       appli.carte.Centrer(); 
      });
    
    // Centrage vse
    $("#centrer2").click(function(){
       appli.carte.Centrer("vse"); 
      });
    
    // Couche
    appli.carte.CoucheCharger({"id":"DPVUF", "nom":"DPVUF", visibility:true});    
    
           /*
    return;

    
    // Ajout des fond de plan
    appli.carte.FdpCharger({"id":"CAD", "nom":"Cadastre"}); 
    appli.carte.FdpCharger({"id":"PLV", "nom":"Plan de ville", visibility:true});

    // Centrer
    appli.carte.Centrer({zoom:8});
    
    appli.carte.Mesurer("surface");
    

    $("#btnMesureLongueur").click(function() {
       appli.carte.Mesurer("longueur");
      });
      
    $("#btnMesureSurface").click(function() { 
       appli.carte.Mesurer("surface");
      }); 
      
    $("#btnMesureTerminer").click(function() { 
       appli.carte.Mesurer();
      }); 
      
    return;
    // Sélection
    appli.carte.SelectionActiver({
       table : "DPVUF"
      });
     
    $("#btnSelectionFin").click(function() {
       click2.setActive(false)
      });
      
    $("#btnSelectionActiver").click(function() { 
       click2.setActive(true)
      }); 
      */
   });
 
/**
 *

VseCarte.prototype.Mesurer= function (mesure) {
    // Variables
    var carte = this, helpTooltipElement, measureTooltipElement, measureTooltip, vector;

    // On supprime le controle s'il existe
    if (carte.control.mesure) {
       // On supprime l'interaction de dessin
       carte.map.removeInteraction(carte.control.mesure); 
       // On supprime l'interaction d'aide à la saisie
       carte.map.un('pointermove',carte.control.pointerMoveHandler);
       // On supprime les constructions
       carte.control.mesureSource.clear();
       // On supprime tous les overlays
       carte.map.getOverlays().clear();
      }
   
    // Pas de mesure spécifiée
    if (!mesure) { return false; }
    // Prise en compte de la mesure demandée
    type = (mesure === "surface") ? "Polygon" : "LineString";

    // Creates a new measure tooltip
    function createMeasureTooltip() {
       if (measureTooltipElement) { measureTooltipElement.parentNode.removeChild(measureTooltipElement); }
       measureTooltipElement = document.createElement('div');
       measureTooltipElement.className = 'tooltip tooltip-measure';
       measureTooltip = new ol.Overlay({
          element     : measureTooltipElement,
          offset      : [0, -15],
          positioning : 'bottom-center'
         });
       carte.map.addOverlay(measureTooltip);
      }
    
    // Aide à la saisie de la construction
    function createHelpTooltip () {
       if (helpTooltipElement) { helpTooltipElement.parentNode.removeChild(helpTooltipElement); }
       helpTooltipElement = document.createElement('div');
       helpTooltipElement.className = 'tooltip hidden';
       carte.control.helpTooltip = new ol.Overlay({
          element     : helpTooltipElement,
          offset      : [15, 0],
          positioning : 'center-left'
        });
       carte.map.addOverlay(carte.control.helpTooltip);
      };
      
    // 
    createMeasureTooltip();
    // 
    createHelpTooltip();

    // 
    if (!carte.control.mesureSource ) {
       // Source vecteur
       carte.control.mesureSource = new ol.source.Vector();
       // Style des constructions des mesures terminées
       vector = new ol.layer.Vector({
          source : carte.control.mesureSource,
          style  : new ol.style.Style({
             fill : new ol.style.Fill({
                color : 'rgba(255, 255, 255, 0.2)'
               }),
             stroke : new ol.style.Stroke({
                color : '#ffcc33',
                width : 5
               }),
             image : new ol.style.Circle({
                radius : 7,
                fill   : new ol.style.Fill({
                   color: '#ffcc33'
                  })
               })
            })
         });
       // Ajout de la couche sur la carte
       carte.map.addLayer(vector);
      }
    
    // Test du controle d'aide à la saisie
    if (!carte.control.pointerMoveHandler) {
       // Création de l'interaction
       carte.control.pointerMoveHandler = function(evt) {
          // On ne traite pas le deplacement de la carte
          if (evt.dragging) { return; }
          // Message par d"faut
          var geom, helpMsg = 'Clic gauche pour commencer';
          // Construction en cours
          if (carte.control.sketch) {
             // Géométrie de la construction
             geom = carte.control.sketch.getGeometry();
             // Saisie d'une ligne
             helpMsg =  'Clic gauche pour continuer la ligne<br/>Double clic pour terminer';
             // Saisie d'une surface
             if (geom instanceof ol.geom.Polygon) { helpMsg =  'Clic gauche pour continuer la ligne'; }
            }
          // Contenu du message
          helpTooltipElement.innerHTML = helpMsg;
          // Position du message
          carte.control.helpTooltip.setPosition(evt.coordinate);
          // Visibilité du message
          $(helpTooltipElement).removeClass('hidden');
         };
      }  
      
    // Assocition avec la carte
    carte.map.on('pointermove',carte.control.pointerMoveHandler);
    // Sortie de la vue 
    $(carte.map.getViewport()).on('mouseout', function() {
       // On masque l'aide à la saisie
       $(helpTooltipElement).addClass('hidden');
      });

    // Création du controle
    carte.control.mesure = new ol.interaction.Draw({
       source : carte.control.mesureSource,
       type   : type,
       style  : new ol.style.Style({
          fill : new ol.style.Fill({
             color : 'rgba(255, 255, 255, 0.2)'
            }),
          stroke: new ol.style.Stroke({
             color    : 'rgba(0, 0, 0, 0.5)',
             lineDash : [10, 10],
             width    : 2
            }),
          image : new ol.style.Circle({
             radius : 6,
             stroke : new ol.style.Stroke({
                width : 2,
                color : 'rgba(0, 0, 0, 0.7)'
               }),
             fill : new ol.style.Fill({
                color : 'rgba(255, 255, 255, 0.5)'
               })
            })
         })
      });
    //
    carte.map.addInteraction(carte.control.mesure);

    // Début de lesure
    carte.control.mesure.on('drawstart',
       function (evt) {
          // Méméo de la construction en cours 
          carte.control.sketch = evt.feature;
          //
          var tooltipCoord = evt.coordinate;
          // 
          listener = carte.control.sketch.getGeometry().on('change', function(evt) {
             //
             var surface, longueur, output, geom = evt.target;
             // Surface
             if (geom instanceof ol.geom.Polygon) {
                // 
                surface = geom.getArea();
                //
                if (surface > 10000) {
                   output = (Math.round(surface / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
                  }
                else {
                   output = (Math.round(surface * 100) / 100) + ' ' + 'm<sup>2</sup>';
                  }
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
               }
             else if (geom instanceof ol.geom.LineString) {
                //
                longueur = Math.round(geom.getLength() * 100) / 100;
                //
                if (longueur > 100) {
                   output = (Math.round(longueur / 1000 * 100) / 100) + ' ' + 'km';
                  } 
                else {
                   output = (Math.round(longueur * 100) / 100) + ' ' + 'm';
                  }
                tooltipCoord = geom.getLastCoordinate();
               }
             measureTooltipElement.innerHTML = output;
             measureTooltip.setPosition(tooltipCoord);
           });
         },
       this
      );

    // Fin de mesure
    carte.control.mesure.on('drawend',
       function() {
          measureTooltipElement.className = 'tooltip tooltip-static';
          measureTooltip.setOffset([0, -7]);
          // unset sketch
          carte.control.sketch = null;
          // unset tooltip so that a new one can be created
          measureTooltipElement = null;
          //
          createMeasureTooltip();
          ol.Observable.unByKey(listener);
         },
       this
      );
   };
    */