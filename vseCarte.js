/**
 *
 * Title: VseCarte
 * 
 * Property: idCarte
 * Identifiant du widget qui contient la carte
 *
 * Property: couches
 * Tableau des couches de la carte
 *
 * Property: fdp
 * Tableau des fonds de plan de la carte
 *
 * Property: map
 * Carte Openlayers associée
 *
 * Property: options
 * {<Objet>} Ensemble des options spécifiques
 *
 * contrôles  - {<Logique>} Optionnel : *true* si les contrôles géographiques sont sur la carte, false sinon
 * debug  - {<Logique>} Optionnel : *true* si les contrôle pour debug sont sur la carte, false sinon
 * sphericalMercator - {<Logique>} Optionnel : true si utilisation de la projection google, *false* sinon
 * couches - {<Objet>} Optionnel : ensemble des couches à afficher par défaut (google , osm) et qui valent true ou false
 *
 * Property: config
 * {<VseConfig>} Configuration globale
 */

if (!window.appli) { window.appli ={}; } 
 
/*
 * Constructor: VseCarte
 * Initialise une carte
 *
 * Arguments:
 * id_carte - <Texte> Identifiant de la balise div qui contiendra la carte
 * options - <OptionCarte> Options de la carte
 */
function VseCarte(id_carte, options) {
    // Ajout de la classe pour intégration drupal
    $("#" + id_carte).addClass("widCarte");
    // Création de l'option au besoin
    if (!options) {options = {}; }
    // Liste des couches
    this.couches = [];
    // Contrôles
    this.control = {};
    // Layers de gestion internes
    this.layers = {};
    // Objet sélectionnés
    this.selection = [];
    // Liste des fonds de plan
    this.thematiques = [];
    // Formats géographiques
    this.formats = [];
    // Liste des fonds de plan
    this.fdp = [];
    // Carte Openlayers associée
    this.map = null;
    // Identifint du widget associé à la carte
    this.idCarte = id_carte;
    // Configuration globale
    this.config = new VseConfig(id_carte);

    // Options par défaut
    this.options = {
       ihm                    : "",
       debug                  : intra_wm.debug,
       sphericalMercator      : false,
       displayInLayerSwitcher : true,
       session                : false,
       edition                : false,
       interactionIhm         : false,
       positionMessage        : [50,50],
       control : {
          LayerSwitcher    : false,
          MousePosition    : false,
          Navigation       : true,
          KeyboardDefaults : true,
          PanZoom          : false,
          PanZoomBar       : true,
          Scale            : false,
          TouchNavigation  : false,
          Zoom             : false,
          ZoomBox          : true,
          ZoomPanel        : false,
          VseSelection     : true
         },
       widgets : {
          metiers           : 'menu_metier',
          listeFdp          : 'aff_fdp',
          listeThematique   : 'aff_thematique',
          listeFdpImage     : 'aff_raster',
          legende           : 'widLegende',
          selectionResultat : 'widSelectionResultat',
          selectionCouche   : 'widSelectionComposant',
          signets           : 'widSignet',
          sliderFdp         : 'slider_fdp',
          sliderThematique  : 'slider_thematique',
          infoBulle         : 'btnOptionInfoBulle',
          information       : 'btnOptionInformation',
          memoAffichage     : 'btnOptionMemoAffichage',
          memoEmprise       : 'btnOptionMemoEmprise'
         },
       couches : {
          google   : false,
          osm      : false
         }
      };

     // Prise en compte des options
    if (options) {
       // Surcharge de la configuration de la carte
       if (options.config !== undefined) { $.extend(this.config,options.config); }
       // Surcharge des options
       if (options.session         !== undefined) { this.options.session         = options.session; }
       if (options.edition         !== undefined) { this.options.edition         = options.edition; }
       if (options.interactionIhm  !== undefined) { this.options.interactionIhm  = options.debug; }
       if (options.debug           !== undefined) { this.options.debug           = options.debug; }
       if (options.positionMessage !== undefined) { this.options.positionMessage = options.positionMessage; }       
       // En contexte de production, on n'autorise pas le mode debug
       if (this.config.contexte === "prod") { this.options.debug = false; }
       // Projection google
       if (options.sphericalMercator !== undefined) { this.options.sphericalMercator = options.sphericalMercator; }
       // Paramétrage de l'affichage par Openlayers
       if (options.displayInLayerSwitcher !== undefined) { this.options.displayInLayerSwitcher = options.displayInLayerSwitcher; }
       // Controlées détaillées
       if (options.control !== undefined) { $.extend(this.options.control,options.control); }

       // Ihm mini : réglage des contrôles
       if (options.ihm === "aucune") {
          this.options.control.PanZoomBar   = false;
          this.options.control.Zoom         = false;
         }
       // Ihm mini : réglage des contrôles
       if (options.ihm === "mini") {
          this.options.control.PanZoomBar    = false;
          this.options.control.Zoom          = true;
         }

       // Ihm mini : réglage des contrôles
       if (options.ihm === "aucune") {
          this.options.control.PanZoomBar   = false;
         }

       // Mode debug : réglage des contrôles
       if (this.options.debug === true) {
          this.options.control.LayerSwitcher = true;
          this.options.control.MousePosition = true;
          this.options.control.Scale         = true;
         }

       // Controlées détaillées
       if (options.couches !== undefined) {
          // Affichage des couches
          if (options.couches.fdpImage !== undefined) { this.options.couches.fdpImage = options.couches.fdpImage; }
          // Couches de la vue
          if (this.options.sphericalMercator === true) {
             this.options.couches.google = (typeof options.couches.google === "boolean") ? options.couches.google : false;
             this.options.couches.osm    = (typeof options.couches.osm    === "boolean") ? options.couches.osm    : true;
            }
         }
      }

    // Couches de la vue
    if (this.options.sphericalMercator === true) {
        this.options.couches.osm    = true;
      }


      
    /*
    // En français
    OpenLayers.Lang.setCode("fr");
    // Tentatives de rechargement des tuiles
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
    // Spcéfication de la résoltioon
    OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;
    // Les tuiles roses sont masquées
    OpenLayers.Util.onImageLoadErrorColor = "transparent";
        */
    // Initialisation de la carte
    this._Initialiser();
    
    

    
     carte = this;
    if (!carte.geolocation) {
 
       view = carte.map.getView();

       //
       carte.geolocation = new ol.Geolocation({
          projection : view.getProjection(),
          tracking   : true
         });
      }
   }
   
/*
 * Geolocalisation
 */
VseCarte.prototype.Geolocaliser= function() {
    // Variables
    var arg, position;
    //
    position = this.geolocation.getPosition();
    //
    if (position) {
       arg = {
          x    : position[0],
          y    : position[1],
          zoom : 8
         }
       //
       this.Centrer(arg);
      }
    else {
        alert("position indisponible");
      }
   };

/*
 * Initialisation du clic dans la carte
 */
VseCarte.prototype._ClickInitialiser= function() {
    // Création du contrôle
    OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
       defaultHandlerOptions: {
          'single'        : true,
          'double'         : false,
          'pixelTolerance' : 0,
          'stopSingle'     : false,
          'stopDouble'     : false
         },
       initialize: function(options) {
          this.handlerOptions = OpenLayers.Util.extend(
               {}, this.defaultHandlerOptions
            );
          OpenLayers.Control.prototype.initialize.apply(
               this, arguments
            );
          this.handler = new OpenLayers.Handler.Click(
             this, {
                'click': this.trigger
               }, this.handlerOptions
            );
         }
      });
   };

/*
 * function: ClickActiver
 * Sélection de coordonnées par un clic gauche dans la carte
 *
 * Paramètres:
 * message - {<Logique>} Optionnel : *true* pour afficher un message d'aide
 * texte - {<Texte>} Optionnel : texte du message affiché
 * projection - {<Texte>} Optionnel : projection des coordonnées restituées
 * trigger - <Fonction> fonction de sortie
 */
VseCarte.prototype.ClickActiver= function (param) {
    // Variables
    var carte, $carte, click, pos;
    // Carte en cours
    carte = this;
    // Suppression du contrôle s'il existe déjà
    if (carte.control.click) {carte.control.click.destroy();}
    // Valeur par défaut : message d'information
    if (param.message === undefined) {param.message = true;}
    // Projection par défaut celle de la crte
    if (param.projection === undefined) {param.projection = carte.map.projection;}
    // Widget contenant la carte
    $carte = $("#" + carte.idCarte);

    // Affichage d'un message
    if (param.message) {
       // Texte par défaut
       if (param.texte === undefined) { param.texte = 'Effectuez un clic dans la carte'; }
       // Position de la carte dans la page
       pos = $carte.position();
       // Affichage du message
       MessageAnnuler({
          position    : [(50 + pos.left),(10 + pos.top)],
          texte       : param.texte,
          fonctionFin : function() {
             // Desactivation du contrôle
             if (carte.control.click) { carte.control.click.deactivate(); }
              // Appel fonction de sortie
             param.trigger(null);
            }
         });
      }

    // Création du contrôle
    click = new OpenLayers.Control.Click({
       trigger: function(e) {
          // Variables
          var lonlat, point, res;
          // Coordonnées du clic
          lonlat = carte.map.getLonLatFromViewPortPx(e.xy);
          //
          res = VseOutils.PointValide({x:lonlat.lon, y:lonlat.lat});
          // resultat ok
          if (res.resultat) {
             //
             point = res.point;
             // Ajout d'un marqueur
             if (param.icon !== undefined) {
                carte.MarqueurAjouter({
                   x     : point.x,
                   y     : point.y,
                   icon  : param.icon,
                   reset : true
                  });
               }

             // Gestion des messages
             if (param.message) {
                // Déactivation du contrôle
                this.deactivate();
                // On ferme les messages
                MessageAnnulerFermer();
               }
             // Fonction de sortie
             param.trigger(point);
            }
         }
      });

    // Mémo du contrôle
    carte.control.click = click;
    // Ajout à la carte
    carte.map.addControl(click);
    // Activation du contrôle
    carte.control.click.activate();
   };

/*
 * Initialisation de la carte
 */
VseCarte.prototype._Initialiser= function() {
    // Variables
    var carte = this, mapOptions, map, panel, style, stylePoint, styleMap, symbolizer, zd;

    
    console.log(intra_wm.projection)
    
    
    // Projection
    /*
    projection = ol.proj.get(intra_wm.projection);
    // Emprise maxi
    projection.setExtent(intra_wm.bounds);
    */
    
    projection = intra_wm.projection;
    projection = "EPSG:4326";
    carte.config.maxExtent = [4.22,45.38,4.55,45.50];
    carte.config.projection = "EPSG:4326";

    var mousePositionControl = new ol.control.MousePosition({
       coordinateFormat: ol.coordinate.createStringXY(2),
       // projection: projection,
       className: 'custom-mouse-position',
       target: document.getElementById('mouse-position'),
       undefinedHTML: '&nbsp;'
      });
      
      
      
      layer =  new ol.layer.Tile({
          extent: [-13884991, 2870341, -7455066, 6338219],
          source: new ol.source.TileWMS({
            url: 'https://ahocevar.com/geoserver/wms',
            params: {'LAYERS': 'topp:states', 'TILED': true},
            serverType: 'geoserver',
            // Countries have transparency, so do not fade tiles:
            transition: 0
          })
        })
        
      
    
    // Carte
    map = new ol.Map({
       
       layers: [
           new ol.layer.Tile({
            source: new ol.source.OSM()
          }),
          layer
        ],
       target: this.config.id_carte,
       
       controls: ol.control.defaults().extend([
          new ol.control.FullScreen(),
          mousePositionControl
         ]),
       interactions: ol.interaction.defaults().extend([
          new ol.interaction.DragRotateAndZoom()
         ]),
         
         /*
       renderer : ['canvas','dom'],
       logo     : false,
       controls : [],
       */
       view     : new ol.View({
          projection : projection,
          center : [4.3872,45.44],
         // center     : [489000,5690000], // [1808000,5138000],
          zoom       : 12
         })
      });

      
      
    // Affectatation de la carte
    carte.map = map;
    
    return;
    
    
    
    // Formats géographiques : geojson
    carte.formats.geojson = new ol.format.GeoJSON();
    
    // Interaction
    carte.interactions = {
       click : function(arg) {
          // Classe mère
          ol.interaction.Pointer.call(this, {
            // fonctionFin :  arg.fonctionFin,
             handleEvent : function(event) {
                // On traute uniquement le clic
                if (event.type === "singleclick") {
                   // Test de la fonction de fin
                   if (arg.fonctionFin) { 
                      // Appel de la fonction de fin
                      arg.fonctionFin({
                         x    : event.coordinate[0],
                         y    : event.coordinate[1],
                         type : "click"
                        });
                     }
                  }
                // Poursuite
                return true
               } 
            });
         },
       survol : function(arg) {
          // Classe mère
          ol.interaction.Pointer.call(this, {
            // fonctionFin :  arg.fonctionFin,
             handleEvent : function(event) {
                // Suppression du timer
                if (this.timer)  { window.clearTimeout(this.timer) }
                // Le clic n'est pas pris en compte
                if (event.type === "singleclick") { return true; }
                // Le pan n''est pas pris en compte
                if (event.type === "pointerup") { return true; }
                // Définition du timer
                this.timer = window.setTimeout(function() {
                   // Test de la fonction de fin
                   if (arg.fonctionFin) {
                      // Appel de la fonction de fin
                      arg.fonctionFin({
                         x    : event.coordinate[0],
                         y    : event.coordinate[1],
                         type : "survol"
                        });
                     }
                  }, 500);
                // Poursuite
                return true
               }
            });
         },
       cadre : function(arg) {
         
          // Classe mère
          ol.interaction.DragBox.call(this, {
             condition: ol.events.condition.platformModifierKeyOnly
            });
            
          //
          this.on('boxstart', function(event) {
             // Test de la fonction de fin
             if (arg.fonctionDebut) {
                // Appel de la fonction de fin
                arg.fonctionDebut();
               }
            });
            
          this.on('boxend', function(event) {
             //
             var extent = event.target.getGeometry().getExtent();
             // Test de la fonction de fin
             if (arg.fonctionFin) {
                // Appel de la fonction de fin
                arg.fonctionFin({
                   xmin : extent[0],
                   ymin : extent[1],
                   xmin : extent[2],
                   ymin : extent[3],
                   type : "cadre"
                  });
               }
            });
         }
      }
    
    //
    ol.inherits(carte.interactions.click,  ol.interaction.Pointer);
    ol.inherits(carte.interactions.survol, ol.interaction.Pointer);
    ol.inherits(carte.interactions.cadre,  ol.interaction.DragBox); 
   };

/*
 * function: CadreMaximum
 * Cadre maximum d'un tableau d'objets
 *
 * Argument:
 * features - <{Tableau}> table d'objets géographiques
 * options - <{Map}> options {marge:20}
 */
VseCarte.prototype.CadreMaximum= function(features,options) {
    // Variables
    var bounds, bounds2, bounds3, i, marge;
    // Marge à appliquer
    marge = (typeof options.marge === "number") ? options.marge : 0;
    // L'argument objet est placé dans un tabelau
    if (features.constructor !== Array) {features = [features];}
    // Cadre maximum
    for (i = 0 ; i < features.length ; ++i) {
       if (!bounds) {
          bounds = features[i].geometry.getBounds();
         }
       else {
           bounds.extend(features[i].geometry.getBounds());
         }
      }
    if (marge !== 0) {
       //
       bounds2 = bounds.add((marge * -1),(marge * -1));
       bounds3 = bounds.add((marge * +1),(marge * +1));
       //
       bounds.extend(bounds2);
       bounds.extend(bounds3);
      }
    return bounds;
   };

/*
 * function: Centre
 * Renvoie le centre de la carte
 *
 */
VseCarte.prototype.Centre= function () {
    // Variables
    var centre, options;
    // Centre de la carte
    centre = this.map.getCenter();
    //
    options = null;
    // Mémo du centre s'il est définit
    if (centre) {
       options = {
          x : parseInt(centre.lon,10),
          y : parseInt(centre.lat,10)
         };
      }
    return options;
   };

/**
 * function: Centrer
 * Centre la carte sur un point particulier ou sur son emprise maxi
 *
 * Paramètre null:
 * La carte est centrée sur le zone géographique maxi
 *
 * > // Centrage sur tout Saint-Etienne
 * > carte.Centrer();
 *
 * Propriétés du paramètre:
 * x - {<Réel>} Optionnel : coordonnées en x du point
 * y - {<Réel>} Optionnel : coordonnées en y du point
 * zoom - {<Entier>} Optionnel : Niveau de zoom (*6* par défaut)
 *
 * > // Centrage sur tout Saint-Etienne
 * > carte.Centrer({x:760460, y:50950, zoom:4});
 */
VseCarte.prototype.Centrer= function (arg) {
    // Variables
    var point, view;
    // Vue associé à la carte
    view = this.map.getView();
    
    console.log(this);
    // Ajout du plan ville si aucun fdp chargé
   // if (this.fdp.length === 0) { this.FdpCharger({"id":"PLV", "nom":"Plan de ville"}); }

    // Argument
    if (arg) {
        // L'argument est l'identifiant de la couche
       if (typeof arg === "string") {
          // Saint etienne
          if (arg === "vse") { return this.Centrer({lat:45.425, lon:4.3753, zoom:6}) ;}
         }
         
       // Pas de point : on centre sur le centre ville
       if (!(arg.x && arg.y) && !(arg.lon && arg.lat)) {
          arg.lat=45.425;
          arg.lon=4.3753; 
         }

       // Coordonées nulles : on zoom sur hdv
       if (arg.x === "0") { 
          delete(arg.x);
          delete(arg.y);
          arg.lat=45.4400;
          arg.lon=4.3872; 
         }

       // Zoom par défaut
       if (arg.zoom === undefined) { arg.zoom = 6; }
       
      //  console.log(arg);
       
       // Conversion du point
       point = this.PointConvertir(arg);
       
       if (this.config.projection === "EPSG:4326") { arg.zoom = 12; }
       
       // Pas de point valide
       if (!point) { return; }
       // Centrage 
       view.setCenter(point);
       // Zoom
       view.setZoom(arg.zoom);
      }         
    else {
       // Zoom sur emprise totale
       view.fit(this.config.maxExtent,this.map.getSize());
      }
   };

/*
 * function: CoucheActualiser
 * Actualise l'affichage d'une couche
 *
 * Argument:
 * {<VseCouche>} | {<Texte>} Couche à actualiser
 */
VseCarte.prototype.CoucheActualiser= function (arg,params) {
    // Variable
    var couche;
    // Pas d'argument
    if (arg === undefined) { return false; }
    // L'argument est l'identifiant de la couche
    if (typeof arg === "string") { couche = this.CoucheParId(arg); }
    // L'argument est une couche vse
    if (typeof arg === "object") { couche = arg; }
    // Traitement
    if (couche === null) { return false; }
    // Copuche au format wms
    if (couche.format === "wms") { couche.layer.redraw(true); }
    // Couche kml ou geojson
    if ((couche.format === "geojson") || (couche.format === "kml")  || (couche.format === "gml")) {
       // Dans le cas des clusters, on supprime leur cache
       if (couche.cluster) { couche.layer.strategies[1].clearCache(); }
       // Actualisation de la couche avec les paramètres fournis
       couche.layer.refresh({force: true, params:params});
      }
   };

/*
 * _function: _CoucheAjouter
 * Ajout d'une couche à la liste des couches
 *
 * Argument:
 * {<VseCouche>} Couche à déclarer dans le liste des couches de la carte
 */
VseCarte.prototype._CoucheAjouter= function (couche) {
    // La couche est déjà enregistrée
    if (this.CoucheParId(couche.id)) { return; }
    // Ajout la liste des couches
    this.couches.push(couche);
    // Ajout du layer à la carte
    if (couche.layer) {
       // utilisation d'un indice
       if (couche.layerIndex) {
          // Ajout à l'index spécifié
          this.map.getLayers().insertAt(couche.layerIndex,couche.layer); 
         }
       else {
          // Ajout de la couche sur la carte
          this.map.addLayer(couche.layer);
         }
      }
   };

/**
 * function: CoucheEvenementGerer
 * Evenement sur fin de chargement d'une couche
 *
 * Argument:
 * id - <Texte> identifiant de la couche
 * fonction - <Fonction> Fonction à évaluer
 */
 VseCarte.prototype.CoucheEvenementChargementFin = function (id,fonction) {
    // Récupération de la couche
    var couche = this.CoucheParId(id);
    // Pas de couche trouvée
    if (couche === null) { return; }
    // Gestionnaire d'evenement sur une couche
    couche.layer.events.register('loadend', this, fonction);
   };
   
/*
 * function: CoucheCharger
 * Ajout dune couche à la carte
 *
 * Argument:
 * couche - <VseCouche> Couche à ajouter
 *
 * Exemple:
 * > // Chargement des quartiers de proximité 
 * > carte.CoucheCharger({id:"GENSECT1", nom:"Quartiers de proximité"});
 */
VseCarte.prototype.CoucheCharger= function (couche) {
    // Variables
    var layer;
    // La couche à déjà été chargée
    if (this.CoucheParId(couche.id) !== null) { return; }
    // Défaut : utilisation du cache
    if (couche.cache === undefined) { couche.cache = false; }
    // Défaut : la couche n'est pas un fond de plan
    if (couche.fdp === undefined) { couche.fdp = false; }
    // Défaut : la couche est au format wms
    if (couche.format === undefined) { couche.format = "wms"; }
    // Défaut : le nom est l'identifiant de la couche
    if (couche.nom === undefined) { couche.nom = couche.id; }
    // Défaut : opacité
    if (couche.opacity === undefined) { couche.opacity = 1; }
    // Défaut : table des données
    if (couche.table === undefined) { couche.table = couche.id; }
    // Défaut : la couche n'est pas un thématique
    if (couche.thematique === undefined) { couche.thematique = false; }
    // Défaut : la couche n'est pas visible
    if (couche.visibility === undefined) { couche.visibility = false; }
    // Défaut : la couche n'est pas visible
    if (couche.singleTile === undefined) { couche.singleTile = false; }
    

    
              // Nom de la couche
          couche.layername = this.config.espace + ":" + couche.id; 
    
    // Défaut : style
    couche.style = (typeof couche.style === "string") ? couche.style : "";

    // Cas d'un groupe de couches ou d'un thématique
    if ((couche.t_thema !== undefined) || (couche.thematique === true)) {
       // Déclaration fdp pour gestion des thématiques
       couche.fdp = true;
       // Enregistrement de la couche
       this._CoucheAjouter(couche);
       // Fin
       return;
      }
      
    // Creation du layer : format geojson
    if (couche.format === "gml") { layer = this.KmlCoucheAjouter(couche); }
    // Creation du layer : format geojson
    if (couche.format === "geojson") { layer = this.KmlCoucheAjouter(couche); }
    // Creation du layer : format kml
    if (couche.format === "kml") { layer = this.KmlCoucheAjouter(couche); }
    // Creation du layer : format wms
    if (couche.format === "wms") { layer = this.WmsCoucheAjouter(couche); }
    // Creation du layer : format wms
    if (couche.format === "image") { layer = this.ImageCoucheAjouter(couche); }
    // Mémo layer sur la couche
    couche.layer = layer;
    // Enregistrement de la couche
    this._CoucheAjouter(couche);

    // Cas des sélection gml
    if (couche.format === "gml") { this.KmlSelectionActiver(); }
    // Cas des sélection kml
    if (couche.format === "kml") { this.KmlSelectionActiver(); }
    // Cas des sélection geojson
    if (couche.format === "geojson") { this.KmlSelectionActiver(); }
    // Résultat
    return layer;
   };


 /**
 * function: ImageCoucheAjouter
 * Création d'une couche au format image
 *
 * couche - <VseCouche> Couche à ajouter
 */
VseCarte.prototype.ImageCoucheAjouter= function (couche) {
    //
    return new OpenLayers.Layer.Image(
       couche.nom,
       couche.fichier,
       new OpenLayers.Bounds(couche.xmin, couche.ymin, couche.xmax,couche.ymax),
       new OpenLayers.Size(0,0),{
          numZoomLevels : 12,
          maxResolution : ((780000 - 740000) / 256 / 2),
          isBaseLayer   : false,
          opacity       : 1.0
         }
      );
   };

/*
 * function: CoucheComposant
 * Renvoie le composant associé à une couche
 *
 * Argument:
 * id - {Texte} identifiant de la couche
 *
 * Résultat:
 * {<VseCouche>} Couche correspondante ou null si elle n'existe pas.
 */
VseCarte.prototype.CoucheComposant= function (id) {
    // On récuoère la couche
    var couche = this.CoucheParId(id);
    // Couche non disponible
    if (couche === null) { return id; }
    //
    if (couche.composant) {return couche.composant;}
    //
    if (couche.table) {return couche.table;}
    // Resultat ok
    return couche.id;
   };

/*
 * function: CoucheParId
 * Renvoie une couche à partir de son identifiant
 *
 * Argument:
 * id - {Texte} identifiant de la couche
 *
 * Résultat:
 * {<VseCouche>} Couche correspondante ou null si elle n'existe pas.
 */
VseCarte.prototype.CoucheParId= function (id) {
    // Variables
    var i, m = this.couches.length;
    // Parcours des parametres
    for (i = 0 ; i < m ;i++) {
       // Si l'attribut est le boin on renvoit le résultat
       if (this.couches[i].id === id) { return this.couches[i]; }
      }
    // Résultat null
    return null;
   };

/*
 * function: CoucheSupprimer
 * Supprime une couche à partir de son identifiant
 *
 * Argument:
 * id - {Texte} identifiant de la couche
 */
VseCarte.prototype.CoucheSupprimer= function (id) {
    // On récuoère la couche
    var couche = this.CoucheParId(id);
    // OCuche non disponible
    if (couche === null) { return false; }
    // Suppression de la couhe
    this.map.removeLayer(couche.layer);
    // Resultat ok
    return true;
   };

/*
 * function: CoucheTransparenceFixer
 * Fixe la transparence des couches de la carte
 *
 * Argument:
 * id - {<Texte>} Identifiant de la couche à traiter
 * valeur - {<Réel>} Transparence de 0 (complète) à 1 (pas de transparence)
 */
VseCarte.prototype.CoucheTransparenceFixer= function (id,valeur) {
    // Carte en cours
    var  carte = this, couche, i, layer, m;
    // Récupération de la couche
    couche = this.CoucheParId(id);
    // On traite une couche particulière
    if (couche)  {
       //
       if (couche.layer) {
          //
          couche.layer.setOpacity(valeur);
          //
          return;
         }
      }
    // On traite toutes les couches
    for (i = 0 , m = carte.couches.length ; i < m ; i++) {
       //
       layer = carte.couches[i].layer;

       if (layer) {
          //
          if (!layer.styleMap) {
             // Si l'attribut est le bon on renvoie le résultat
             layer.setOpacity(valeur);
            }
         }
      }
   };

/*
 * function: CoucheVisibiliteFixer
 * Fixe la visibilité d'une couche à partir de son identifiant
 *
 * Argument:
 * id - {<Texte>} Identifiant de la couche à traiter
 * valeur - {<Logique>} true pour afficher la couche, false pour la masquer
 */
VseCarte.prototype.CoucheVisibiliteFixer= function (id,etat) {
    if (id === null) {
       // 
       $(this.couches).each(function() {
          //
          this.layer.setVisible(etat);
         });
       return;
      }
    // Récupération de la couche
    var couche = this.CoucheParId(id);
    // Pas de couche trouvée
    if (couche === null) { return; }
    // Mémo visibilité sur couche vse
    couche.visibility = etat;
    // Sauvegarde de la session

    // Cas d'une couche définissant des thématiques
    if (couche.t_thema !== undefined) {return false; }
    // On fixe la visibilité de la couche Open Layer
    if (couche.layer) { couche.layer.setVisible(etat); }
   };

/**
 * function: DonneesLocaliser
 * Localisation sur une entité géographique de type point
 *
 * Propriété du paramètre:
 * x - {<Réel>} Coordonnée en x de l'objet
 * y - {<Réel>} Coordonnée en y de l'objet
 * zoom - {<Entier>} Niveau de zoom (*6* par défaut)
 * fid | gid - Référence de l'objet
 */
 VseCarte.prototype.DonneesLocaliser= function(data) {
    // Variables
    var carte, feature, fid, point;
    // Carte en cours
    carte = this;
    // Conversion du point
    point = this.PointConvertir(data);
    // Zoom par défaut
    if (!data.zoom) { data.zoom = 6; }
    // Centrage sur le point
    carte.map.setCenter(point ,data.zoom);
    // fid passé en argument
    if (data.fid) { fid = data.fid; }
    // Table et gid en argument
    if (data.gid) { fid = data.table + "." + data.gid; }
    // Exploitation du fid
    if (fid !== "undefined") {
       // Feature ol
       feature = carte.control.selection.getFeatureByFid(fid);
       // Pas de feature
       if (feature === null) { return; }
       // On redessine la couche
       carte.control.selection.redraw();
       // On efface l'objet
       carte.control.selection.eraseFeatures([feature]);
       // On l'affiche stylé
       carte.control.selection.drawFeature(feature,{
          strokeColor : "#5A5A5A",
          strokeWidth : 5,
          fillColor   : "#5A5A5A",
          fillOpacity : 0.2
         });
      }
   };
   
/**
 * function: FdpActiver
 * Active un fdp depuis son identifiant
 *
 * Argument:
 * id - {Texte} identifiant de la couche
 */
 VseCarte.prototype.FdpActif= function () {
    // Initilisation
    var res = null;
    // On traite toutes les couches
    $(this.fdp).each(function() {
       // Couche visible
       if (this.layer.visibility === true) { res = this.id; }
      });
    // Résultat
    return res;
   };

/**
 * function: FdpActiver
 * Active un fdp depuis son identifiant
 *
 * Argument:
 * id - {Texte} identifiant du fond de plan
 */
VseCarte.prototype.FdpActiver= function (id) {
   // Récupération de la couche
    var couche = this.FdpParId(id);
    // On traite une couche particulière
    if (!couche) { return; }
    // On masque tous les fdp
    $(this.fdp).each(function() {this.layer.setVisible(false); });
    // On affiche celui demand
    couche.layer.setVisible(true);
    // On coche l'item correspondant
    $("#" + id).prop("checked",true);

    // Gestion auto des fdp image et couches associés
    if ((this.options.couches.fdpImage === true) || couche.habillage) {
       // Chargement des textes
       this.CoucheCharger({id:"IMG_TEXTE", nom:"Textes de voies", fdp:true, cache:true, widget:"-"});
       // Visibilité de l'habillage des textes
       this.CoucheVisibiliteFixer("IMG_TEXTE",couche.habillage);
      }
   };

/**
 * Ajout d'un fdp à la liste des fdp de la carte
 *
 * Argument:
 * {<VseCouche>} Couche à déclarer dans le liste des couches de la carte
 */
 VseCarte.prototype.FdpAjouter= function (couche) {
    // On vérifie qu'elle n'est pas deja présente
    if (this.FdpParId(couche.id) === null) {
       // Déclaration de la couche dans la liste des fdp de la carte
       this.fdp.push(couche);
       // Ajout de la couche
       this.map.addLayer(couche.layer);
      }
   };

/**
 * function: FdpCharger
 *  Chargement d'un fond de plan
 *
 * Argument:
 * {<VseCouche>} Couche à charger à la carte
 */
 VseCarte.prototype.FdpCharger= function (couche) {
    // Variables
    var layer, layers, param, url;
    // La couche à déjà été chargée
    if (this.FdpParId(couche.id) !== null) { return; }
    //
    switch (couche.id) {
       // OpenStreetMap
       case "OSM":
          layer = new OpenLayers.Layer.OSM();
          // Affectation à l'api vse
          this.options.couches.osm = layer;
       break;
       // Autres cas
       default:
          // Options par défaut
          param = {
             attribution : "",
             buffer      : 1,
             cache       : true,
             habillage   : false,
             format      : this.config.format,
             visibility  : false,
             opacity     : 1.0
            };
          // Ajout des options par défaut si nécessaire
          couche = $.extend(param,couche);

          // Nom par défaut de la couche
          if (couche.image === undefined) { couche.image = false; }
          // Nom par défaut de la couche
          if (couche.nom === undefined) { couche.nom = couche.id; }
          // Pour les couches image on force le format en jpeg
          if (couche.id.indexOf("IMG_") === 0) { couche.format = "image/jpeg"; }
          // Paramétrage du widget si le fond de plan est dans la lsiste des fdp images
          if (couche.image === true) { couche.widget = this.options.widgets.listeFdpImage; }
          // Url du service en fonction du cache
          url = (couche.cache === true) ? this.config.gwc : this.config.wms;
          // Nom de la couche
          couche.layername = this.config.espace + ":" + couche.id; 
          //
          layer = new ol.layer.Tile({
             visible : false,
             preload : true,
             opacity : couche.opacity,
             extent  : intra_wm.bounds,
             source  : new ol.source.TileWMS({
                url    : url,
                params : {'LAYERS': couche.layername, 'SRS':intra_wm.projection}
               })
            })
           
       break;
      }
      
    // Layer Open Layer associé à la couche
    couche.layer = layer;
    // Ajout de la couche
    this.FdpAjouter(couche);
    // Activation du fond de plan ou s'il est tout seul
    if ((this.fdp.length === 1) || couche.visibility) { this.FdpActiver(couche.id); }
   };

VseCarte.prototype.FdpHistoriqueCharger= function (param) {
    //
    if (!param) { param = {}; }
    //
    var habillage = param.habillage || false;
    // Chargement des images
    this.FdpCharger({format:"image/jpeg", image:true, id:"IMG_1770", habillage:habillage, nom:"1770 - Plan"});
    this.FdpCharger({format:"image/jpeg", image:true, id:"IMG_1819", habillage:habillage, nom:"1819 - Plan général de la ville"});
    this.FdpCharger({format:"image/jpeg", image:true, id:"IMG_1847", habillage:habillage, nom:"1847 - Plan de la ville"});
    this.FdpCharger({format:"image/jpeg", image:true, id:"IMG_1864", habillage:habillage, nom:"1864 - Cadastre napoléonien"});
    this.FdpCharger({format:"image/jpeg", image:true, id:"IMG_1900", habillage:habillage, nom:"1900 - Plan"});
    this.FdpCharger({format:"image/jpeg", image:true, id:"IMG_1905", habillage:habillage, nom:"1905 - Plan"});
    this.FdpCharger({format:"image/jpeg", image:true, id:"IMG_1922", habillage:habillage, nom:"1922 - Plan"});
    this.FdpCharger({format:"image/jpeg", image:true, id:"IMG_1930", habillage:habillage, nom:"1930 - Photo"});
    this.FdpCharger({format:"image/jpeg", image:true, id:"IMG_1955", habillage:habillage, nom:"1955 - Plan"});
    this.FdpCharger({format:"image/jpeg", image:true, id:"IMG_1970", habillage:habillage, nom:"1970 - Plan"});
    this.FdpCharger({format:"image/jpeg", image:true, id:"IMG_1980", habillage:habillage, nom:"1980 - Plan"});
   };

/*
 * function: FdpParId
 * Renvoie un fond de plan à partir de son identifiant
 *
 * Argument:
 * id - {Texte} identifiant du fond de plan
 *
 * Résultat:
 * {<VseCouche>} Couche correspondante ou null si elle n'existe pas.
 */
VseCarte.prototype.FdpParId= function (id) {
    // Variables
    var i, m = this.fdp.length;
    // Parcours des fdsp
    for (i = 0 ; i < m ; i++) {
       // Test
       if (this.fdp[i].id === id) { return this.fdp[i]; }
      }
    // Resultat par défaut
    return null;
   };

/*
 * function: FdpTransparenceFixer
 * Fixe la transparence des fiond de plan de la certe
 *
 * Argument:
 * valeur - {<Reel>} Transparence de 0 (complète) à 1 (pas de transparence)
 */
VseCarte.prototype.FdpTransparenceFixer= function (id,valeur) {
    // Récupération de la couche
    var i, m, couche;
    // Slider pour opacité des fonds de plan
	 $("#" + this.options.widgets.sliderFdp).slider({value : (1 - valeur)});
    // Couche par son identifiant
    couche = this.FdpParId(id);
    // On traite un fdp particulier
    if (couche) {couche.layer.setOpacity(valeur); return;}
    // Parcours des fdp
    for (i=0, m=this.fdp.length; i < m; i++) { this.fdp[i].layer.setOpacity(valeur); }
   };

/*
 * function: OutilsDesactiver
 * Désactive tous les controles associé à la carte
 */ 
VseCarte.prototype.OutilsDesactiver= function () {
    // Variables
    var controle;
    // parcours des controles de la cart
    for (controle in this.control) {
       if (controle === "drawPoint")      { this.control[controle].deactivate(); }
       if (controle === "drawLine")       { this.control[controle].deactivate(); }
       if (controle === "drawPolygon")    { this.control[controle].deactivate(); }
       if (controle === "modifyPoint")    { this.control[controle].deactivate(); }    
       if (controle === "modifyFeature")  { this.control[controle].deactivate(); }       
       if (controle === "mesureLongueur") { this.control[controle].deactivate(); }
       if (controle === "mesureSurface")  { this.control[controle].deactivate(); }
       if (controle === "click")          { this.control[controle].deactivate(); }
       if (controle === "ZoomBox")        { this.control[controle].deactivate(); }
      }
   };   
   
/*
 * function: OutilsVisibiliteFixer
 * Fixe la visibilité des outils qui possède la class "outilCarte"
 *
 * Argument:
 * etat - <Logique> Visibilité des outils
 */ 
VseCarte.prototype.OutilsVisibiliteFixer= function (etat) {
    // Regalge de la visibilité
    $("input.outilCarte, a.outilCarte").setVisibility(etat);
   };
   
/**
 * function: InfobulleOuvrir
 * Ouvre une infobulle
 *
 * Propriétés du paramètre:
 * x - <Réel> Coordonnées en x
 * y - <Réel> Coordonnées en y
 * centrer - <Logique> Centrage sur l'objet (*true* par défaut)
 * closeBox - <Logique> Centrage sur l'objet (*true* par défaut)
 * name - <Texte> Titre de l'infobulle
 * description - <Texte> Contenu de l'infobulle
 */
VseCarte.prototype.InfobulleOuvrir= function (options) {
    //
    var infobulle, param;
    // Options par défaut
    param = {
       centrer    : true,
       closeBox : true
      };

    // Options spécifiées
    param = $.extend(param,options);

    // Infobulle
    infobulle = {
       point      : new OpenLayers.LonLat(param.x,param.y),
       closeBox   : param.closeBox,
       attributes : {
          name        : param.name,
          description : param.description
         }
      };
    // Zomm dans la carte
    if (param.centrer) { this.Centrer(param); }
    // Ouverture de la popup de l'objet avec centrage préalable
    this.addPopup(infobulle);
   };

/**
 * function: InfobulleFermer
 * Ferme toutes les infobulles
 */
VseCarte.prototype.InfobulleFermer= function () {   
    // Fermture des infobulles
    this.removePopup();
    //
    this.SelectionReactiver();
   };
  
/**
 * function: MarqueurAjouter
 * Ajoute un marqueur sur la carte
 *
 * x - {<Réel>} Coordonnées en x
 * y - {<Réel>} Coordonnées en y
 * icon - {<Texte>} Optionnel : image à utiliser
 * size - {<Entier>} Optionnel : taille de l'image
 * reset - {<Logique>} Optionnel : true pour supprimer les marqueurs existants
 */
VseCarte.prototype.MarqueurAjouter= function (param) {
    // Variables
    var carte, icon, lonLat, marker, offset, size;
    // Carte
    carte = this;
    // Icone vse
    if (param.icon === undefined) { param.icon = "../../images/style/vse.png"; }
    // Icone ici
    if (param.icon === "ici") { param.icon = "../../images/style/ici.png"; }
    // Taille par défaut
    if (param.size === undefined) { param.size = 24;}
    // Création de la couche au besoin
    if (carte.layerMarkers === undefined) {
       // Création de la couche
       carte.layerMarkers = new OpenLayers.Layer.Markers("Markers");
       // Ajout à la carte
       carte.map.addLayer(carte.layerMarkers);
      }
    // On supprime tous les marqueur
    if (param.reset) { carte.MarqueurRetirer(); }
    // Zoom sur le point
    if (param.zoom) { carte.Centrer(param); }
    // Retraitement des coordonnées
    lonLat = carte.PointConvertir(param);
    // Pas de point valide
    if (!lonLat) { return; }
    // Taille OpenLayers du marqueur
    size = new OpenLayers.Size(param.size,param.size);
    // Offset OpenLayers du marqueur
    offset = new OpenLayers.Pixel(-(size.w / 2), -(size.h / 2));
    // Icone OpenLayers
    icon = new OpenLayers.Icon(param.icon, size, offset);
    // Création du marqueur
    marker = new OpenLayers.Marker(lonLat,icon);
    // Ajout à la carte
    carte.layerMarkers.addMarker(marker);
    // En dessus de toutes les autres couches
    carte.map.setLayerIndex(carte.layerMarkers,1999);
   };

/**
 * function: MarqueurRetirer
 * Retire les marqueurs de la carte
 */
VseCarte.prototype.MarqueurRetirer= function () {
    // La couche dédiée n'existe pas
    if (this.layerMarkers === undefined) {return;}
    // On supprime tous les marqueuers
    this.layerMarkers.clearMarkers();
   };

/*
 * function: PointConvertir 
 * Conversion d'un point A REPRENDRE CAR PAS CONFORME
 *
 * Argument
 * data : objet contenant des informations x/y ou lon/lat
 */
 VseCarte.prototype.PointConvertir= function(data) {
    // Variables
    var carte, lat, lon, lonlat, proj_cible, proj_source;
    // Carte en cours
    carte = this;
    // projection cible
    proj_cible = carte.config.projection;

    // Coordonnées Lambert
    if (data.x) {
       // Longitude
       lon = data.x;
       // Latitude
       lat = data.y;
       // Projection sources
       proj_source = intra_wm.projection;
      }

    // Coordonnées gps
    if (data.lon) {
       // Longitude
       lon = data.lon;
       // Latitude
       lat = data.lat;
       // Projection sources
       proj_source = "EPSG:4326";
       // Coorodonnées exprimées en sphércial mercator
       if (lon > 180) { proj_source = "EPSG:900913"; }
      }

    // On exploite le code espg fournit avev le pouint
    if (data.epsg) { "EPSG:" + data.epsg;}
    // Pas de coordonnées valides
    if (lon === undefined) {return null;}
    // Conversion en réel si nécessaire
    if (isNaN (lon)) { lon = parseFloat(lon.replace(",",".")); }
    // Conversion en réel si nécessaire
    if (isNaN (lat)) { lat = parseFloat(lat.replace(",",".")); }
    
    // console.log(lon +" "+ lat + " " + proj_source + " " + proj_cible)
    // return null;
    // Résultat
    return ol.proj.transform([lon,lat],proj_source,proj_cible);
   };
   
/*
 * function: SelectionActiver
 * Activation de l'outil de sélection sur une couche
 *
 * Propriétés du paramètre:
 * table - <{Texte}> Identifiant de la couche à traiter (nom de composant apic)
 * clickTolerance - {<Entier>} Tolérance en pixel pour clic à proximité d'un objet (*10*)
 * message - <{Logique}> Optionnel : *true* pour afficher un message d'information, false sinon
 * idWidget - <{Texte}> Optionnel : identifiant du widget à masquer à la sélection
 * geometryName - <{Texte}> Nom du champ géométrique (GEOMETRY par défaut)
 * fermetureAuto - <{Logique}> true pour désactiver l'outil de sélection après la première sélection, *false* sinon
 * selectionMultiple - <{Logique}> true si sélection multiple possible, false sinon
 * fonctionAjouterObjet - <{Fonction}> fonction associé à la sélection d'un objet
 * box - <{Logique}> *true* pour autoriser la sélection par cadre, *false* sinon
 */
VseCarte.prototype.SelectionActiver= function (options) {
    // Variables
    var carte = this, param, $widget;
    // Paramètres par défaut
    param = {
       message          : true,
       infobulle        : false,
       selectionCadre   : true,
       ajouterSelection : true,
       ajouterListe     : true,
       fermetureAuto    : false
      };
      
    // Mémo des paramètres de sélection surchargés
    carte.control.selectionParam = $.extend(param,options);

    // Test d'initialisation des contrôles
    if (!carte.control.selectionClick) {
       // Création du contrôle cadre
       carte.control.selectionCadre = new carte.interactions.cadre({
          fonctionDebut : function() {
             // On désactive le survol
             if (carte.control.selectionParam.selectionSurvol) { carte.control.selectionSurvol.setActive(false); }
            },
          fonctionFin : function(res) {
             // Message d'attente
             MessageAttente(true,"Recherche en cours");
             // On active le survol
             if (carte.control.selectionParam.selectionSurvol) { carte.control.selectionSurvol.setActive(true); }
             // Interaction serveur
             carte.SelectionInteraction(res);
            }
         });

       // Création du contrôle click
       carte.control.selectionClick = new carte.interactions.click({
          fonctionFin : function(res) {
             // On annule le survol
           //  carte.control.selectionSurvol.abort();
             // Interaction serveur
             carte.SelectionInteraction(res);
            }
         });

       // Création du contrôle survol
       carte.control.selectionSurvol = new carte.interactions.survol({
          fonctionFin : function(res) {
             // Variables
             carte.SelectionInteraction(res);
            },
          fonction__Annuler : function(){
             if (carte.control.selectionAjax) {
                carte.control.selectionAjax.abort();
                carte.control.selectionAjax = null;
               }
            }
         });
         
       // Ajout à la carte
       carte.map.addInteraction(carte.control.selectionClick);
       carte.map.addInteraction(carte.control.selectionSurvol);
       carte.map.addInteraction(carte.control.selectionCadre);
      }

    // Descativation des contrôles de sélection
    carte.SelectionDesactiver();
    // Réactivation des controles de sélection
    carte.SelectionReactiver();

    // Gestion d'un message utilisateur
    if (param.message) {
       // Widget de gestion à masquer
       $widget = $("#" + param.idWidget);
       // On ferme la boite de dialogue
       $widget.widgetFermer();
       // Visibilité des outils de l'interface
       carte.OutilsVisibiliteFixer(false);
       // Pas de texte d'information spécifié
       if (!param.texte) {
          // Test de l'infobulle
          if (param.infobulle) {
             // Texte si infobulle active
             param.texte = "Sélection de données dans la carte : ";
             param.texte += "<br/> - Survolez un objet sans clic pour voir son infobulle";
             param.texte += "<br/> - Effectuez un clic gauche pour le sélectionner";
            }
          else {
             // Texte standard
             param.texte = "Sélection de données dans la carte : ";
             param.texte +=  "<br/>Effectuez un clic gauche pour sélectionner un objet";
            }
         }
       // Message
       MessageAnnuler({
          idDialog      : "carteSelectionActiver",
          position      : carte.options.positionMessage,
          texte         : param.texte,
          txtBtnAnnuler : 'Terminer',
          fonctionFin   : function() {
             // On affiche la boite de dialogue
             $widget.dialog("open");
             // Appel de la fonction de fin
             if ($.isFunction(param.fonctionFin)) { param.fonctionFin(); }
             // Fin des outils de sélection
             carte.SelectionTerminer();
            }
         });
      }
   };
   
/**
 * function: SelectionInteractionFin
 */
VseCarte.prototype.SelectionInteraction= function (res) {
    // Variable
    var couche, carte = this, dataType, idCouche;
    // Table en cours
    res.table = carte.control.selectionParam.table;
    // Identifiant de la couche
    idCouche = carte.control.selectionParam.idCouche || res.table;
    // Couche
    couche = carte.CoucheParId(idCouche);
     // Paramètres de la vue
    res.viewparams = (couche && couche.viewparams) ? couche.viewparams : "";
    // Utilisation de jsonp ou pas
    dataType = (window.contexte && (window.contexte.jsonp_wms !== false)) ? "jsonp" : "json";
    // Requete wfs
    carte.control.selectionAjax = $.ajax({
       url      : appli.services.wfsRequete,
       jsonp    : "callback",
       dataType : dataType,
       data     : res,
       success: function(response) {
          // Fin des message
          if (res.type === "cadre") { MessageAttente(false); }
          // Prise en compte du résultat
          carte.SelectionInteractionFin(response,res);
         }
      });
    // Cas du survol
    if (res.type !== "survol") { carte.control.selectionAjax = null; }
   };

/**
 * function: SelectionInteractionFin
 */
VseCarte.prototype.SelectionInteractionFin= function (data,res) {
    // Variables
    var carte = this, couche_selection, couche_survol, feature, features, param, retour;
    // pas de feature à triater
    if (!data.totalFeatures) { return; }

    // Paramètres de seklction
    param = carte.control.selectionParam;
    // Couche de sélection
    couche_selection = carte.control.selection;
    // Couche de survol
    couche_survol = carte.control.survol;
    // Lecture des données au format geojson
    features = carte.formats.geojson.read(data);

    // Cas du survol
    if (res.type === "survol") {
       // On supprime les objets du plan de survol
       couche_survol.removeAllFeatures();
       // Ajout des traitements à la description
       $(features).each(function() {
          // Concaténation de la description et des trauitements
          if (this.attributes.traitement) { this.attributes.description += "<br/>" + this.attributes.traitement; }
          // Point d'implantation : celui déclenché par l'utilisateur 
          this.point = new OpenLayers.LonLat(res.x,res.y);          
          // Feature dans la couche de survol
          var feature_couche = couche_selection.getFeatureByFid(this.fid);
          // La feature n'y est pas
          if (!feature_couche) { couche_survol.addFeatures([this]); }
         });
         
       // Appel d'une focntion dédiée
       if ($.isFunction(param.fonctionInfoBulle)) {
          // Appel de la fonction
          retour = param.fonctionInfoBulle({x:res.x, y:res.y, data:features[0].data});
          // On ne poursuit pas l'exécution
          if (retour === false) { return; }
         }
         
       // Ajout de la popup  
       carte.addPopup(features);
      }
    else {
       // Activation du bouton pour vider la sélection
       $("#" + carte.options.widgets.selectionVider).addClass("actif");
       
       // Appel de la fonction associée
       if (param.fonctionAjouterObjet) {
          // Première feature
          feature = features[0];
          // Mémo du gid sur la feature
          feature.gid = feature.attributes.gid;
          // Appel de la fonction
          param.fonctionAjouterObjet(feature);
         }
         
       // Fermeture auromatique
       if (param.fermetureAuto) {
          // On affiche la boite de dialogue
          $("#" + param.idWidget).dialog("open");
          // Fin de la sélection
          carte.SelectionTerminer();
          //
          return false;
         }

       // Parcours des features
       $(features).each(function() {
          // Feature dans la couche de survol
          var feature_couche = couche_selection.getFeatureByFid(this.fid);
          // La feature n'y est pas
          if (!feature_couche) {
             // Ajout de l'objet au plan de sélection
             if (param.ajouterSelection) { carte.SelectionTraiterObjet(this); }
             // Ajout à la liste de sélection
             if (param.ajouterListe) { carte.SelectionListeAjouterObjet(this); }
            }
          else {
             // Cas du click
             if (res.type === "click") { couche_selection.removeFeatures([feature_couche]); }
            }
         });

      }
   };

/*
 * function: SelectionTerminer
 * Termine la sélection d'objet
 */
VseCarte.prototype.SelectionTerminer= function () {
    // On ferme les message
    MessageAnnulerFermer({idDialog:"carteSelectionActiver"});
    // Visibilité des outils de l'interface
    this.OutilsVisibiliteFixer(true);
    // On sélectionne l'option par défaut
    $("#"+ this.options.widgets.selectionCouche).find("option:first").prop("selected",true);
    // Désactivation de l'outil de sélection
    this.SelectionDesactiver();
    // On supprime les objets du plan de survol
    this.control.survol.removeAllFeatures();
    // On supprimes les popups existantes
    this.removePopup();
   };   

   
 /*
 * function: SelectionTraiterObjet
 */
VseCarte.prototype.SelectionTraiterObjet= function (feature) {
    // Variables
    var carte = this, objet = {}, propriete;
    // On supprimes les popups existantes
	 if (carte.removePopup) { carte.removePopup(); }
    // Mémo fid
    objet.fid = feature.fid;
    // Mémo du gid depuis le fid
    objet.gid = parseInt(feature.fid.split(".")[1],10);
    // Mémo de la table depuis le fid
    objet.table = feature.fid.split(".")[0];
    // Initialisation des attributs
    objet.attributs = [];
    // Le gid est repris comme attribut
    objet.attributs.gid = objet.gid;
    // Parcours des propriétés pour mémo propriété en minuscule
    for (propriete in feature.attributes) {
       // 
       if (feature.attributes.hasOwnProperty(propriete)) {
          //
          objet.attributs[propriete.toLowerCase()] = feature.attributes[propriete];
         }
      }
    // Ajoute l'objet dans la sélection active
    carte.selection.push(objet);
    // Ajout de l'objet au plan de sélection
    carte.control.selection.addFeatures([feature]);
   };

/*
 * function: SelectionAjouterObjet
 * Ajoute un objet au plan de sélection
 *
 * Propriétés du paramètres:
 * table - {<Texte>} Identifiant de la table géographique
 * fid - {<Texte>} fid de l'objet
 * gid - {<Texte>} gid de l'objet
 * filtre - {<Texte>} filtre de sélection sql
 * champ - {<Texte>} champ géométrique de la table (GEOMETRY pour base oracle the_geom pour shapefile)
 * zoom - {<Texte>} Optionnel *true* pour zoomer sur les objets sélectionnés, false sinon
 * fonctionFin - Fonction appelé avec les objets chargés
 */
VseCarte.prototype.SelectionAjouterObjet= function(arg) {
    // Variables
    var carte = this, champ, fid;
    // fid passé en argument
    if (arg.fid) { fid = arg.fid; }
    // Table et gid en argument
    if (arg.gid) { fid = arg.table + "." + arg.gid; }
    // Valeur par défaut
    if (arg.zoom === undefined) { arg.zoom = true; }
    // Valeur par défaut
    if (arg.selection === undefined) { arg.selection = true; }
    // Valeur par défaut
    if (arg.survol === undefined) { arg.survol = false; }
    // Valeur par défaut
    if (!arg.marge) { arg.marge = true; }
    // Champ géométrie par défaut
    champ = (typeof arg.champ === "string") ? arg.champ : "GEOMETRY";
    // Ajout au plan de sélection
    carte.ObjetCharger({table:arg.table, fid:fid, filtre:arg.filtre, champ:champ, fonctionFin:
       // Après chargement
       function (features) {
          // Variables
          var bounds, coord;
          // Objets à traiter
          if (features.length > 0) {
             // Zoom souhaité
             if (arg.zoom) {
                // Cadre élargi
                bounds = carte.CadreMaximum(features,{marge:arg.marge});
                // Zoom sur emprise totale
                carte.map.zoomToExtent(bounds);
               }
               
             // Ajout au plan de sélection
             if (arg.evidence) {
                // On supprime les autres objets
                carte.control.evidence.removeAllFeatures();
                // Ajout de l'objet au plan de sélection
                carte.control.evidence.addFeatures(features);
               }
               
             // Ajout au plan de sélection
             if (arg.selection) {
                // Parcours des résultats
                $.each(features, function() {
                   // Pour ajout au plan de sélection
                   carte.SelectionTraiterObjet(this);
                  });
               }

             // Gestion du survol
             if (arg.survol) {
                // Ajout de l'objet à la couche
                carte.control.survol.addFeatures(features);
                // Centroid
                coord = features[0].geometry.getCentroid();
                // Appel d'une focntion dédiée
                if ($.isFunction(arg.fonctionInfoBulle)) {
                   // Appel de la focntion (si elle retourne false => fin d'exécution (spécifique .net))
                   arg.fonctionInfoBulle({x:coord.x, y:coord.y, data:features[0].data});
                  }
               }

             // Ajout à la liste de droite
             if (arg.ajouterListe) {
                // Parcours des résultats
                $.each(features, function() {
                   // Pour ajout au plan de sélection
                   carte.SelectionListeAjouterObjet(this);
                  });
               }
            }
          // Appel de la fonction de fin
          if (arg.fonctionFin) {
             arg.fonctionFin(features);
            }
         }
      });
   };

/*
 * function: SelectionAjouterPoint
 * Ajoute un point au plan de sélection
 *
 * Propriétés du paramètres:
 * lon - {<Réel>} fid de l'objet
 * lat - {<Réel>} gid de l'objet
 */
VseCarte.prototype.SelectionAjouterPoint= function (arg) {
    // Point
    var newpoint, point = new OpenLayers.Geometry.Point(arg.lon,arg.lat);
    // Vector
    newpoint = new OpenLayers.Feature.Vector(point);
    // On ajoute le point cliqué
    this.control.selection.addFeatures(newpoint);
   };

/*
 * function: SelectionRetirerObjet
 * Retire un objet de la sélection
 */
VseCarte.prototype.SelectionRetirerObjet= function(objet) {
    // Variables
    var feature, indice, carte = this;
    // Table et gid en argument
    if (!objet.fid && objet.table) { objet.fid = objet.table + "." + objet.gid; }
    // Indice de la sélection
    indice = carte.SelectionTesterObjet(objet);
    // On enleve l'objet du tableau
    if (indice && carte.selection.length) { carte.selection.splice(indice,1); }
    // On retire l'objet de la sélection
    feature = carte.control.selection.getFeatureByFid(objet.fid);
    // On retire l'objet du plan de sélection
    carte.control.selection.removeFeatures([feature]);
    // On retire l'objet de la liste
    $("#" + carte.options.widgets.selectionResultat + ">div[fid='" + objet.fid + "']").remove();
    // Titre de la sélection
    carte.SelectionTitreFixer();
    // Résultat
    return false;
   };

/*
 * function: SelectionTesterObjet
 * Test si une feature est dans le plan de sélection
 */
VseCarte.prototype.SelectionTesterObjet= function(objet) {
    // Variables
    var i, j = null, m, carte = this;
    // Table et gid en argument
    if (objet.fid === undefined) { objet.fid = objet.table + "." + objet.gid; }
    // Parcours des objest sélectionnée
    for (i = 0, m = carte.selection.length; i < m; i++) {
       // mémo de l'indice de l'objet à enlever
       if (carte.selection[i].fid === objet.fid) { j = i; }
      }
    // Résultat
    return j;
   };

/*
 * _function: SelectionListeAjouterObjet
 * Ajoute un objet dans la liste de sélection
 */
VseCarte.prototype.SelectionListeAjouterObjet = function(feature) {
    // Variables
    var carte = this, $entete, fid, html, $item, $widgetWidResultat;
    // Initialisation de id en cours
    carte.options.idTraitement = null;
    // Liste des résultats
    $widgetWidResultat = $("#" + carte.options.widgets.selectionResultat);
    // Test existence de la zone de résultat
    if ($widgetWidResultat.length === 0) { return false; }
    // Utilisation du fid
    fid = feature.fid;

    // Recherche item
    $item = $widgetWidResultat.find("div[fid='" + fid + "']");
    // L'objet est déja dans la liste des résultat : on scroll et on arrete
    if ($item.length > 0) {$widgetWidResultat.scrollTo($item); return;}


    // Item des données
    $item = $('<div class="information-item">').data(feature).attr({fid:fid});
    //
    html = '<div class="item-titre">'
    + '<span class="icon close" title="Retirer l\'objet de la sélection">Fermer</span><b>' + feature.attributes.name + '</b>'
    + '</div>'
    + '<div class="item-entete" title="Cliquez pour zoomer sur l\'objet">' + feature.attributes.description + '</div>';
    // Click sur l'entete
    $entete = $(html).click(function() { return carte.DonneesLocaliser(null,feature); });
    // Ajout de la description
    $item.append($entete);
        //
    if (feature.attributes.complement) { $item.append( $('<div class="item-complement">' + feature.attributes.complement + '</div>')); }
    // Ajout des traitement
    if (feature.attributes.traitement) { $item.append( $('<div class="item-traitement">' + feature.attributes.traitement + '</div>')); }


     // Titre et adresse avec interaction carto
    $item.find(".close").click(function() { return carte.SelectionRetirerObjet(feature);});

    // Evenement survol de souris
    $item.mouseenter(function() {
       // Variables
       var data, $itemSurvol;
       // Item en cours
       $itemSurvol = $(this);
       // Données
       data = $itemSurvol.data();
       // On annule le timer
       if (carte.options.timerTraitement) {  clearTimeout (carte.options.timerTraitement); }
       // On affiche les traitements
       carte.options.timerTraitement = setTimeout(function () {
          // Indice demandé
          var fid = $itemSurvol.data().fid;
          // Meme indice, on ne fait rien
          if (carte.options.idTraitement === fid) { return; }
          // Mémo de l'item en cours
          carte.options.idTraitement = fid;
          // on replie les traitement dépliés
          $itemSurvol.parent().find("div.item-traitement.deplie").removeClass("deplie").hide(350);
          // on replie les traitement dépliés
          $itemSurvol.parent().find("div.item-complement.deplie").removeClass("deplie").hide(350);
          // on déplie les traitement de l'items
          $itemSurvol.find("div.item-traitement").addClass("deplie").show(350);
          // 
          $itemSurvol.find("div.item-complement").addClass("deplie").show(350);
         },500);
       // On vide le plan de dernière sélection
       carte.SelectionDernierFixer(data);
      })
    .mouseleave(function() {
       // On annule le timer
       if (carte.options.timerTraitement) {  clearTimeout (carte.options.timerTraitement); }
       // On vide le plan de dernière sélection
       carte.SelectionDernierFixer(null);
      });

    // On ajoute l'item
    $widgetWidResultat.prepend($item);
    // Scroll sur l'item
    $widgetWidResultat.scrollTo($item);
    // Activation de la lightbox
    $widgetWidResultat.find("a.image").lightboxActiver();
    // Titre de la sélection
    carte.SelectionTitreFixer();
   };

/*
 * function: SelectionDesactiver
 * Désactivation du controle de sélection
 */
VseCarte.prototype.SelectionDesactiver= function() {
    // Test du controle
    if (this.control.selectionSurvol) { this.control.selectionSurvol.setActive(false); }
    if (this.control.selectionCadre)  { this.control.selectionCadre.setActive(false); }
    if (this.control.selectionClick)  { this.control.selectionClick.setActive(false); }
   };
   
/*
 * function: SelectionDernierFixer
 */
VseCarte.prototype.SelectionDernierFixer= function(feature) {
    // On vide le plan de dernière sélection
    this.control.selectionDernier.removeAllFeatures();
    // Feature à traiter
    if (!feature) {
       // On redessine le plan de sélection (bug affichage sinon)
       this.control.selection.redraw();
      }
    else {
       // On place la construction dans le plan de dernière sélection
       this.control.selectionDernier.addFeatures([feature]);
       // En dessus de toutes les autres couches
       this.map.setLayerIndex(this.control.selectionDernier,1000);
      }
   };

/*
 * function: SelectionReactiver
 * Réactivation  du controle de sélection
 */
VseCarte.prototype.SelectionReactiver= function() {
    // Paramètre de sélection
    var param = this.control.selectionParam;
    // Gestion des infobulles
    if (param && param.infobulle && this.control.selectionSurvol) { this.control.selectionSurvol.setActive(true); }
    // Sélection par cadre
    if (param && param.selectionCadre && this.control.selectionCadre) { this.control.selectionCadre.setActive(true); }
    // Sélection apr click
    if (this.control.selectionClick) { this.control.selectionClick.setActive(true); }
   };  
   
   
/**
 * function: TailleActualiser
 * Actualsie la taille de la carte à conteneur
 */
VseCarte.prototype.TailleActualiser= function () {
    // 
    this.map.updateSize();
   };

/**
 * function: Visible
 * Renvoie la visibilité de la carte
 */   
VseCarte.prototype.Visible = function () {
    return this.Widget().is(":visible");
   };     
   
/**
 * function: Widget
 * Controle jQuery contenant la carte
 */
VseCarte.prototype.Widget = function () {
    return $("#" + this.idCarte);
   };

/**
 * function: WmsCoucheAjouter
 * Création d'une couche au format wms
 *
 * couche - <VseCouche> Couche à ajouter
 */
VseCarte.prototype.WmsCoucheAjouter= function (couche) {
    // Variables
    var layers, url, wms;
    // Url du service en fonction du cache
    url = (couche.cache) ? this.config.gwc : this.config.wms;
    // Nom de la couche
    layers = couche.layername;
    //
    if (couche.singleTile) {
       //
       wms = new ol.layer.Image({
          source : new ol.source.ImageWMS({
             url        : intra_wm.wms,
             params     : {'LAYERS': layers}
            })
         });
      }
    else {
       
       //
       wms =  new ol.layer.Tile({
          source: new ol.source.TileWMS({
             url        : intra_wm.wms,
             params     : {'LAYERS': layers}
            })
         });
      }

    /*
    // Chargement de la couche Openlayers
    wms = new OpenLayers.Layer.WMS(couche.nom,url,{
       layers      : layers,
       styles      : couche.style,
       format      : this.config.format,
       transparent : true
      },{
       buffer                  : 0,
       transitionEffect        : null,
       visibility              : couche.visibility,
       isBaseLayer             : false,
       opacity                 : couche.opacity,
       singleTile              : couche.singleTile,
       displayOutsideMaxExtent : true,
       displayInLayerSwitcher  : this.options.displayInLayerSwitcher
      });
    //
    if (couche.filtre) { wms.params["FILTER"] = couche.filtre; }
    
    */
    //
    return wms;
   };

/**
 * function: ZoomArriere
 * Effectue un zoom arrière
 */
VseCarte.prototype.ZoomArriere= function () {
    // Variables
    var view, zoom;
    // Vue associée à la carte
    view = this.map.getView();
    // Niveau de zoom actuel
    zoom = view.getZoom();
    // Zoom arrière possible
    if (zoom) { view.setZoom(zoom - 1); }
   };
   
/**
 * function: ZoomAvant
 * Effectue un zoom avant
 */
VseCarte.prototype.ZoomAvant= function () {
    // Variables
    var view, zoom;
    // Vue associée à la carte
    view = this.map.getView();
    // Niveau de zoom actuel
    zoom = view.getZoom();
    // Zoom avant possible
    if (zoom < 15) { view.setZoom(zoom + 1); }
   };