/**
 * Class: VseCarte
 * Gestion des données vecteur externes
 */
/*
// Picto vse avec taille fixe
var vse_style_00 = new OpenLayers.Style({
    cursor:"pointer",
    externalGraphic: '../../images/style/spot.png',
    backgroundGraphic: null,
    pointRadius : 12,
    fillOpacity : 0.7
   });

// Picto vse avec taille variable pour cluster
var vse_style_01 = new OpenLayers.Style({
    cursor:"pointer",
    externalGraphic: '../../images/style/spot.png',
    backgroundGraphic: null,
    pointRadius: "${radius}",
    fillOpacity: 0.7
   }, {
    context: { radius:
       function(feature) {
          var radius = Math.min(feature.attributes.count,6) + 10;
          if (radius > 12) { radius = 14;          }
          return radius;
         }
      }
   });

// Style de la carte
var VseCarteStyle = {
    // Monogramme vse
    vse : new OpenLayers.StyleMap({
       // Style par défaut
       "default": vse_style_01,
       // Style survol
       "select": new OpenLayers.Style({
          fillOpacity: 1.0
         })
      }),
    vse_simple : new OpenLayers.StyleMap({
       // Style par défaut
       "default": vse_style_00,
       // Style survol
       "select": new OpenLayers.Style({
          fillOpacity: 1.0
         })
      }),
    // Icone fournki dans le kml
    icone : new OpenLayers.StyleMap({
       // Style par défaut
       "default": new OpenLayers.Style({
          cursor          : 'pointer',
          externalGraphic : config.src_images + 'icones/${icone}.png',
          fillOpacity     : 1.0,
          pointRadius     : 16
         }),
       // Style survol
       "select": new OpenLayers.Style({
          fillOpacity : 1.0,
          pointRadius : 18
         })
      }),
    // Station velivert
    velivert : new OpenLayers.StyleMap({
       // Style par défaut
       "default": new OpenLayers.Style({
          cursor          : 'pointer',
          externalGraphic : config.src_images + 'icones/velivert.png',
          fillOpacity     : 1.0,
          pointRadius     : 10
         }),
       // Style survol
       "select": new OpenLayers.Style({
          fillOpacity : 1.0,
          pointRadius : 12
         })
      })        
   };
*/
/**
 * function: removePopup
 * Supprime tous les popups de la carte
 */
VseCarte.prototype.removePopup= function () {
    // Variables
    var i, m, p, popup;
    // Liste des popup de la carte
    p = this.map.popups;
	 // Parcours des popups
	 for (i = 0, m = p.length ; i < m ; i++) {
       // Popup en cours
	    popup = p[i];
       // On efface les popup
       this.map.removePopup(popup);
       // On détruit le popup
		 popup.destroy();
		}
	};

/**
 * function: KmlCoucheAjouter
 *  Ajout d'une couche à la liste des couches.
 *
 * Argument:
 * {<VseCouche>} Couche à déclarer dans le liste des couches de la carte
 */
VseCarte.prototype.KmlCoucheAjouter= function (couche) {
    // Variables
    var carte, layer, strategies;
	 // Carte en cours
	 carte = this;
    // On déclare la couche
    couche.kml = true;
    // Défaut :
    if (couche.format === undefined) { couche.format = "kml"; }
    // Défaut : la couche est sélectionnable
    if (couche.selection === undefined) { couche.selection = true; }
    // Défaut : la couche est visible
    if (couche.visibility === undefined) { couche.visibility = true; }
    // Défaut : utilisation des cluster
    if (couche.cluster === undefined) { couche.cluster = false; }
    // Défaut : utilisation des cluster
    if (couche.distance === undefined) { couche.distance = 25; }
    // Adresse du service carto 
    if (couche.url === undefined) { couche.url = config.src_referentiel + "ihm/WsCarto.php?table=" + couche.id; }
    
    // Style des pcitos par défaut
    if (couche.picto) {
       // Image des pictos
       if (couche.picto.icone) {
          VseCarteStyle.vse.styles["default"].defaultStyle.externalGraphic = config.src_images + "icones/" + couche.picto.icone;
          VseCarteStyle.vse_simple.styles["default"].defaultStyle.externalGraphic = config.src_images + "icones/" + couche.picto.icone;
         }
       // Taille des pictos
       if (couche.picto.taille) {
          VseCarteStyle.icone.styles["default"].defaultStyle.pointRadius = couche.picto.taille;
          VseCarteStyle.vse.styles["default"].defaultStyle.pointRadius = couche.picto.taille;
          VseCarteStyle.vse_simple.styles["default"].defaultStyle.pointRadius = couche.picto.taille;
         }
      }

    if (couche.styleMap === "icone") { couche.styleMap = VseCarteStyle.icone; }
    // Style par défaut
    if (!couche.styleMap) {
       // Style normal
       couche.styleMap = VseCarteStyle.vse_simple;
       // Clusterisation des données
       if (couche.cluster) { couche.styleMap = VseCarteStyle.vse; }
      }


     // Stratégie par défaut
    strategies = [ new OpenLayers.Strategy.Fixed() ];
    // Clusterisation des données
    if (couche.cluster) { strategies.push ( new OpenLayers.Strategy.Cluster({distance: couche.distance}) ); }
    
    // Chargement au format kml
    if (couche.format === "kml") {
       // Type de couche
       if (couche.featureType) {
          // Création de la couche format kml (objet linéaires ou surfaciques)
         layer = new OpenLayers.Layer.Vector(couche.nom, {
             strategies      : [new OpenLayers.Strategy.BBOX()],
             styleMap        : couche.styleMap,
             rendererOptions : {yOrdering: true},
             protocol        : new OpenLayers.Protocol.WFS({
                url          : this.config.wms,
                geometryName : this.config.geometryName,
                featureType  : couche.featureType
               })
            });
         }
       else {
          // Chargement de la couche depuis une url (ou un fichier)
          layer = new OpenLayers.Layer.Vector(couche.nom, {
             strategies      : strategies,
             styleMap        : couche.styleMap,
             rendererOptions : {yOrdering: true},
             projection      : new OpenLayers.Projection("EPSG:4326"),
             protocol        : new OpenLayers.Protocol.HTTP({
                url    : couche.url,
                format : new OpenLayers.Format.KML({
                    extractStyles     : true, 
                    extractAttributes : true,
                    maxDepth          : 0
                  })
               })
            });
         }
      }
      
    // Chargement au format geojson
    if (couche.format === "gml") {
       // Création du layer
       layer = new OpenLayers.Layer.Vector("GML", {
          strategies      : strategies,
          styleMap        : couche.styleMap,
          rendererOptions : {yOrdering: true},
          protocol        : new OpenLayers.Protocol.HTTP({
             url    : couche.url,
             format : new OpenLayers.Format.GML({
                extractAttributes : true
               })
            })
         });
      }
      
    // Chargement au format geojson
    if (couche.format === "geojson") {
       // Création du layer
       layer = new OpenLayers.Layer.Vector("Vectors", {
          strategies : strategies,
          styleMap   : couche.styleMap,
          projection : new OpenLayers.Projection(intra_wm.projection),
          protocol   : new OpenLayers.Protocol.Script({
             url: couche.url,
             params: {
                format: "geojson"
               },
             format: new OpenLayers.Format.GeoJSON({
                ignoreExtraDims: true
               }),

             callbackKey: "callback"
            })
         });
      }

    // Visibilité
    layer.setVisibility(couche.visibility);
    // Fonction du cluster associé à la couche ol
    layer.couche = couche;
    // Gestion de la sélection
    if (couche.selection) {
       // Événements sur la couche
       layer.events.on({
          "featureselected": function(ev) {
             //
             var select, point;
             // Controle de sélection
             select = carte.control.SelectFeatureSelect;
             // Le controle n'est pas actif (mise en surbrillance uniquement)
             if (select && (select.active === false)) { return; }
    
          
             // Point cliqué en pixel
             point = null;
             // Le controle de sélection a été utilisé (pas vrai si sélection par code)
             if (carte.control.SelectFeatureSelect.handlers.feature.evt) {
                // Point cliqué par l'utilisateur
                point = carte.control.SelectFeatureSelect.handlers.feature.evt.xy;
                // Point en coordonnées carte
                point = carte.map.getLonLatFromPixel(point);
               }
             // Test fonction dédiée
             if ($.isFunction(layer.couche.select)) {
                // Appel de la fonction
                layer.couche.select(ev.feature);
                // On arrête la
                return;
               }
             // Appel de la fonction standard
             carte.onFeatureSelect(ev,layer,point);
            },          
          "featureover": function(ev) {
             // Test fonction dédiée
             if ($.isFunction(layer.couche.hover)) {
                // Appel de la fonction
                layer.couche.hover(ev.feature);
                // On arrête la
                return;
               }
            },
          "featureunselected": function(ev) {
             // Appel de la fonction standard
             carte.onFeatureUnselect(ev);
            }
         });
      }

    // Résultat
	 return layer;
   };

/*
 * function: KmlSelectionActiver
 * Active les fonction de survol et de sélection des données kml
 */
VseCarte.prototype.KmlSelectionActiver= function () {
    // Variables
    var carte, couches, highlightOnly, hover, i, select;
	 // Carte en cours
	 carte = this;
    // contrôles existants
    hover  = carte.control.SelectFeatureHover;
    select = carte.control.SelectFeatureSelect;

    // Destruction des contrôle
    if (hover  !== undefined) { hover.destroy(); }
    if (select !== undefined) { select.destroy(); }

    // Liste des couches
    
    couches = [];
    // 
    highlightOnly = true; 
    
    // Parcours des couches de la carte
    $(carte.couches).each(function(i,couche) {
       // On moins une couche gère le survol dynamique
       if (couche.highlightOnly === false) {  highlightOnly = false; }

       if (couche.selection) {
     
       
       // Ajout de la couche à la liste
       if (couche.format === "kml")     { couches.push(couche.layer); }
       if (couche.format === "geojson") { couches.push(couche.layer); }
       if (couche.format === "gml")     { couches.push(couche.layer); }
         }
      });

    // Il y a des couches kml à sélectionner
    if (couches.length > 0) {    
       // Création du contrôle de survol
       hover = new OpenLayers.Control.SelectFeature(couches,{highlightOnly:highlightOnly, hover:true, clickout:false});
       // On autorise le déplacement de la carte
       hover.handlers.feature.stopDown = false;
       hover.handlers.feature.stopUp   = false;
       // Ajout sur la carte
       carte.map.addControl(hover);
       // Activation
       hover.activate();
       // Mémo du contrôle
       carte.control.SelectFeatureHover = hover;

       // Création du contrôle de sélection
		 select = new OpenLayers.Control.SelectFeature(couches,{clickout:true});
       // On autorise le déplacement de la carte
       select.handlers.feature.stopDown = false;
       select.handlers.feature.stopUp   = false;
       // Ajout sur la carte
		 carte.map.addControl(select);
       // Activation
		 select.activate();
       // Mémo du contrôle
		 carte.control.SelectFeatureSelect = select;
      }
   };

/*
 * function: KmlSelectionDesactiver
 * Désactive les fonction de sélection et de survol des données kml
 */
VseCarte.prototype.KmlSelectionDesactiver= function () {
    // Variables
    var carte, hover, select;
	 // Carte en cours
	 carte = this;
    // contrôles existants
    hover  = carte.control.SelectFeatureHover;
    select = carte.control.SelectFeatureSelect;
    // Destruction des contrôle
    if (hover  !== undefined) { hover.deactivate(); }
    if (select !== undefined) { select.deactivate(); }
   };   
   
/*
 * _function: onFeatureUnselect
 */
VseCarte.prototype.onFeatureUnselect= function() {
    // On supprime les popups
	 this.removePopup();
   };

/*
 * _function: onFeatureSelect
 */
VseCarte.prototype.onFeatureSelect= function (ev,layer,point) {
    // Utilisation des cluster
    if (ev.feature.cluster) {
       // Plusieurs objest sont présents dans le cluster
       if (ev.feature.cluster.length > 1) {
          // On ajoute la popup
          this.addPopupCluster(ev.feature.cluster,layer);
          // On arrête la
          return;
         }
      }
    // Objet en cours
	 var feature = (ev.feature.cluster) ? ev.feature.cluster[0] : ev.feature;
    
    if (point && (feature.geometry.CLASS_NAME !== "OpenLayers.Geometry.Point")) {
    
    feature.point = point;
    }
    
    
    // On ajoute la popup
	 this.addPopup(feature,layer);
   };

/**
 * function: addPopupCluster
 * Ajoute une popup depuis un objet
 *
 * Argument:
 * cluster : cluster des données
 * layer : couche Openlayers des données
 */
VseCarte.prototype.addPopupCluster= function (cluster,layer) {
    // Variables
    var carte, couche, classNavPrev, classNavSuiv, clusterText, clusterTextPrecedent, clusterTextSuivant, content, feature, ident, i,  m_cluster, point, popup, res, style, styleNavPrev, styleNavSuiv;
    // Carte en cours
	 carte = this;
    // On supprime les popups
	 carte.removePopup();
    // Fonction dédiée sur la couche
    if (layer.couche.clusterCreer) {
       // Fonction spécifique à la couche
       res = layer.couche.clusterCreer({cluster: cluster});
       // Résultat html ajouté à la popup
       if (res.html !== undefined) { content = res.html; }
      }
    else {
       // Texte d'information sur nombre d'items
       clusterText =  (carte.clusterText !== undefined) ? carte.clusterText : "lieux sont localisés ici";

       // Textes de cluster par défaut
       clusterTextPrecedent = "&#171 Précédent";
       clusterTextSuivant    = "Suivant &#187";
       //
       couche = layer.couche;
       // Textes de cluster sur la carte
       if (carte.clusterTextPrecedent) { clusterTextPrecedent = carte.clusterTextPrecedent; }
       if (carte.clusterTextSuivant)   { clusterTextSuivant   = carte.clusterTextSuivant; }
       // Textes de cluster sur la couche
       if (couche.clusterTextPrecedent) { clusterTextPrecedent = couche.clusterTextPrecedent; }
       if (couche.clusterTextSuivant)   { clusterTextSuivant   = couche.clusterTextSuivant; }
       // Initialisation du contenu
       content = "";
       // Fonction metier de prise en charge des cluster définie
       if (carte.clusterEvent) {
          // Titre de l'info bulle : nombre d'objets
          content = "<h2>"+ cluster.length + " " + clusterText +  "</h2>" ;
          content += "Voir la liste des résultats<br/>pour accèder aux informations";
         }
       // Initialisation identifiant
       ident = "";
       // Nombre d'objet dans la cluster
       m_cluster = cluster.length;
       // Parcours des objets
       for (i = 0 ; i < m_cluster ; i++) {
          // lieu en cours
          feature = cluster[i];
          // Pas de fonction dédiée
          if (!carte.clusterEvent) {
             // Initilisation des styles
             style = "display:none;";
             styleNavPrev = "cursor:pointer; font-weight:bold; float:left;";
             classNavPrev = "popupPrec";
             styleNavSuiv = "cursor:pointer; font-weight:bold;";
             classNavSuiv = "popupSuiv";
             // Premier item
             if (i === 0) {
                style = "";
                classNavPrev  = "";
                styleNavPrev = "color:grey; float:left;";
               }
             // Dernier item
             if (i === (m_cluster - 1)) {
                classNavSuiv  = "";
                styleNavSuiv = "color:grey; ";
               }
             // Contenu
             content += '<div id="popupPage' + i + '" style="' + style + '">';
             content += '<h2>' + feature.attributes.name  + '</h2>';
             content +=  feature.attributes.description;
             content += '<div class="unselectable" style="border-top:1px solid #CCCCCC; margin-top:10px; padding-top:1px; text-align:right;">';
             content += '<table style="width:100%;"><tr>';
             content += '<td><span class="' + classNavPrev + '" data-indice=' + i +' style="' + styleNavPrev + '">' + clusterTextPrecedent + '</span></td>';
             content += '<td><span>' + (i + 1) + "/" +  m_cluster + '</span></td>';
             content += '<td><span class="' + classNavSuiv + '" data-indice=' + i +' style="' + styleNavSuiv + '">' + clusterTextSuivant + '</span></td>';
             content += '</tr></table>';
             content += '</div>';
             content += '</div>';
            }

          // Liste des identifiant avec séparateur
          ident += feature.attributes.ident + ";";
         }
       // Fonction de callback sur la carte
       if ($.isFunction(carte.clusterEvent)) { carte.clusterEvent({ident:ident , taille:m_cluster , cluster: cluster});}
       // Fonction de callback sur la couche
       if ($.isFunction(couche.clusterEvent)) { couche.clusterEvent({ident:ident , taille:m_cluster , cluster: cluster});}
      }

    // Premier lieux
    feature =  cluster[0];
	 // Point d'insertion de la popup
	 point = feature.geometry.getBounds().getCenterLonLat();

	 // Création de la popup
    popup = new OpenLayers.Popup.FramedCloud("chicken",point,null,content,null,true,function () {
		 // On annule la sélection active
       if (carte.control.SelectFeatureSelect !== undefined) { carte.control.SelectFeatureSelect.unselectAll(); }
       // On supprimes les popups existantes
	    carte.removePopup();
	   });

	 // Association à la feature
    feature.popup = popup;
	 // Ajout du popup à la carte
    carte.map.addPopup(popup);
    // Fonction de callback sur la couche à l'ouverture des popup
    if ($.isFunction(carte.clusterOpen)) { carte.clusterOpen();}
    

    // Ajot de la classe 
    $('#popupPage0').addClass('_current');

    // Gestion du déclenchement des infobulles au survol du contenu
    $("div.olFramedCloudPopupContent")
       .mouseover(function() { carte.SelectionDesactiver();})
       .mouseout(function()  { carte.SelectionReactiver(); })
       // Affichage de la lightbox
       .delegate("a.image", "click", function(event){
          event.preventDefault();
          window.lightboxAfficher($("div.olFramedCloudPopupContent").find("div._current").find("a.image"));
         });
    
    // Jalon précédant
    $("span.popupPrec").click(function() {
       // Item à afficher
       i = parseInt($(this).attr("data-indice"),10) - 1;
       // On masque l'item en cours
       $('div._current').removeClass('_current').hide();
		 // On affiche l'item cible
       $('#popupPage'+ i).addClass('_current').show();
       // Taille de la popup
       popup.updateSize();
      });

    // Jalon suivant
    $("span.popupSuiv").click(function() {
       // Item à afficher
       i = parseInt($(this).attr("data-indice"),10) + 1;
       // On masque l'item en cours
       $('div._current').removeClass('_current').hide();
		 // On affiche l'item cible
		 $('#popupPage'+ i).addClass('_current').show();
       // Taille de la popup
       popup.updateSize();
      });
	};

/**
 * function: addPopup
 * Ajoute une popup depuis un objet
 *
 * Argument:
 * feature : objet de type vecteur
  * layer : couche OpenLayers des données
 */
VseCarte.prototype.addPopup= function (feature,layer) {
    // Variables
    var attributes, carte = this, couche = null, content = "", point, popup, res, test = false, titre;
    // Butpn, de fermeture de la popup
    if (feature.closeBox === undefined)  {feature.closeBox = true;}
    // On supprime les popups
	 carte.removePopup();
    //
    if (layer !== undefined) {
       // Couche vse
       couche = layer.couche;
       // Appel de la fonction sur clusterisation
       if (couche.clusterCreer) {
          // Fonction spécifique à la couche
          res = couche.clusterCreer({cluster: [feature]});
          // Résultat html ajouté à la popup
          if (res.html !== undefined) { content += res.html; }
          // Pas de suite
          test = true;
         }
      }

    if (!test) {
       // Attributs
       attributes = feature.attributes;
       // Titre avec retour à la ligne tous les 30 caractères
       titre = attributes.name;
       // Contenu de l'infobulle
       content = '<h2>' + titre + '</h2>' + attributes.description;
      }

    // Le point d'implantation
    point = (feature.point !== undefined) ? feature.point : feature.geometry.getBounds().getCenterLonLat();
    
        //    argumnet après html à tester             {size: {w: 20, h: 20}, offset: {x: 10, y: 10}},
        
	 // Création de la popup
    popup = new OpenLayers.Popup.FramedCloud("vse_popup",point,null,content,null,feature.closeBox,function (evt) {
       // On stoppe la propagation de l'évènement
       OpenLayers.Event.stop(evt);
       // On supprimes les popups existantes
	    carte.removePopup();
       // On annule la sélection active
       if (carte.control.SelectFeatureSelect !== undefined) { carte.control.SelectFeatureSelect.unselectAll(); }
	   });
      
    // Taille automatique
    popup.autoSize = true;
    // Fermeture sur déplacement carte
    popup.closeOnMove = false;
    // Centrage sur la popup
    popup.panMapIfOutOfView = true;
	 // Association à la feature
    feature.popup = popup;
	 // Ajout du popup à la carte
    carte.map.addPopup(popup);
    
    // Gestion du déclenchement des infobulles au survol du contenu
    $("div.olFramedCloudPopupContent")
       .mouseover(function() { carte.SelectionDesactiver();})
       .mouseout(function()  { carte.SelectionReactiver(); })
       // Affichage de la lightbox
       .delegate("a.image", "click", function(event){
          event.preventDefault();
          window.lightboxAfficher($("div.olFramedCloudPopupContent").find("a.image"));
         });
    
    // Fonction de callback sur la carte
    if ($.isFunction(carte.clusterEvent)) { carte.clusterEvent({ident:feature.attributes.ident, taille:1 , cluster: null});}
    // Fonction de callback sur la couche à l'ouverture de la popup
    if ($.isFunction(carte.clusterOpen)) { carte.clusterOpen({ident:feature.attributes.ident, taille:1 , cluster: null});}
    // Fonction de callback sur la couche
    if (couche !== null) {
       if ($.isFunction(couche.clusterEvent)) { couche.clusterEvent({ident:feature.attributes.ident  , taille:1 , cluster: null});}
      }
	};

/*
 * function: popupOuvrir
 * Ouvre la popup d'un objet d'une couche
 *
 * Arguments:
 * kmlCouche : couche kml à traiter
 * id : identifiant de l'objet
 * options : centrer (true ou false) pour centrage avant ouverture de la popup
 */
VseCarte.prototype.popupOuvrir= function (couche,id,options) {
    // Variables
	 var defaut, feature;
    // Le couche est passé en argument avec son identifiant
    if (typeof couche === "string") { couche = this.CoucheParId(couche).layer; }
    // Options par défaut
    defaut = {centrer:false, zoom:6};
    // prise en compte des valeurs par défaut
    options = $.extend({}, defaut, options);
    // Feature
    feature = this.FeatureParGid(couche,id);
    // Fetaure ok
    if (feature) {
       // Centrage sur l'objet
       if (options.centrer) { this.FeatureCentrer (feature,options); }
       // Ouverture de la popup
       this.addPopup(feature,couche);
      }
   };

/*
 * function: FeaturePointFixer
 * Prise en compte d'un point comme nouveu dessin sur la carte
 *
 * Paramètres:
 * x : coordonnée x du point à traiter
 * y : coordonnée y du point à traiter
 *
 * Résultat:
 * Les champs de coordonnées x et y sont renseigné
 */
VseCarte.prototype.FeaturePointFixer= function (parametres) {
    // Variable
    var carte = this;

    // Le contexte esitte
    if (carte.contexte) {
       // Actualisation du champ codant la coordonnée x
       carte.contexte.coord_x.val(parametres.x);
       // Actualisation du champ codant la coordonnée y
       carte.contexte.coord_y.val(parametres.y);

       // Featue en cours d'édition
       feature = carte.contexte.feature;
       
       // Création
       if (!feature) {
          // Point d'implantation
          point = new  OpenLayers.Geometry.Point(parametres.x, parametres.y);
          // Construction
          feature = new OpenLayers.Feature.Vector(point);
          // Ajout de la construction
          carte.layers.drawPoint.addFeatures(feature);
         }
         
       // Coordonnées sur la carte
       lonlat = new OpenLayers.LonLat(parametres.x,parametres.y);
       // On la deoplace
       feature.move(lonlat);
       // Centrage
       carte.FeatureCentrer(feature,{zoom:6});
      }
   }   
   
/*
 * function: FeatureCentrer
 * Ouvre la popup d'un objet d'une couche
 *
 * Arguments:
 * kmlCouche : couche kml à traiter
 * id : identifiant de l'objet
 * options : centrer (true ou false) pour centrage avant ouverture de la popup
 */
VseCarte.prototype.FeatureCentrer= function (feature,options) {
    // Variables
    var bounds, defaut;
    // Options par défaut
    defaut = { zoom:6, marge:0};
    // prise en compte des valeurs par défaut
    options = $.extend({}, defaut, options);
    // Fetaure ok
    if (feature) {
       // Point
       if (feature.geometry.CLASS_NAME === "OpenLayers.Geometry.Point") {
          // Cenrage sur le centroide
          this.Centrer (feature.geometry.getCentroid(),options.zoom); 
         }
       else {
          // Cadre enveloppe
          bounds = feature.geometry.getBounds();
          // Prise en compte de la marge
          if (options.marge) {
             // 
             bounds = new OpenLayers.Bounds([
                parseInt(bounds.left   - options.marge,10),
                parseInt(bounds.bottom - options.marge,10),
                parseInt(bounds.right  + options.marge,10),
                parseInt(bounds.top    + options.marge,10)
               ]);
            }
          // Centrage sur la construction
          this.map.zoomToExtent(bounds);
         }
      }
   };
   
/*
 * function: FeatureParGid
 * Renvoie la feature d'une couche depuis son gid
 *
 * Arguments:
 * couche : couche kml à traiter
 * id     : identifiant de l'objet
 */
VseCarte.prototype.FeatureParGid= function (couche,id) {
    // Variables
	 var feature, i, i_objet, m, m_objet, objet, t_feature, t_objet;    
    // Le couche est passé en argument avec son identifiant
    if (typeof couche === "string") { couche = this.CoucheParId(couche).layer; }

    
    // Objets de la couche
    t_feature = couche.features;
    // Parcours des objets de la couche
    for (i = 0, m = t_feature.length ; i < m ; i++) {
       // Objet en cours
       objet = t_feature[i];
       // Table des objets à traiter si utilisation des cluster
       t_objet = (objet.cluster !== undefined) ? objet.cluster : [objet];
       // Parcours des objets de la table
       for (i_objet = 0, m_objet = t_objet.length ; i_objet < m_objet ; i_objet++) {
          // Feature en cours
          feature = t_objet[i_objet];
          // Test de l'identifiant sur la feature
          if (id === feature.fid) { return feature; }
          // Test de l'identifiant sur la feature
          if (feature.data && (feature.data.GID == id)) { return feature; }
         }
      }
    // Pas de feature trouvé
    return null;
   };

/*
 * function: FeatureSelectionner
 * Place une feature dans le plan de sélection
 *
 * Arguments:
 * feature - <feature> feature à sélectionner
 */
VseCarte.prototype.FeatureSelectionner= function (feature) {
    // Controle de sélection
    var controle = this.control.SelectFeatureSelect;
    // On vide la sélection
    controle.unselectAll();
    // Sélection de la feature
    controle.select(feature);
   };
   
/*
 * function: KmlCentrer
 * Centre la carte sur une couche vecteur
 *
 * Arguments:
 * kmlCouche : couche kml à traiter
 * marge : marge à appliquer
 */
VseCarte.prototype.KmlCentrer= function (couche,marge) {
    // Variables
    var extent, extent2;
    // Le couche est passé en argument avec son identifiant
    if (typeof couche === "string") { couche = this.CoucheParId(couche).layer; }
    // Cadre des données
    extent = couche.getDataExtent();
    // Marge par défaut
    if (marge === undefined) { marge = 250; }
    // Cadre très peu large
    if ((extent.getWidth() < 100) || (extent.getHeight() < 100)) {
       // Nouveau cadre
       extent2 = new OpenLayers.Bounds();
       // Définition du cadre
       extent2.left   = extent.left   - marge;
       extent2.top    = extent.top    + marge;
       extent2.bottom = extent.bottom - marge;
       extent2.right  = extent.right  + marge;
      }
    else {
       // On élargie le cadre
       extent2 = extent.scale(1.25);
      }
    // Actualisation de la carte
    this.map.zoomToExtent(extent2);
   };