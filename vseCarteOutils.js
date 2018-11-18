/**
 * Class: VseCarte
 * Outils divers
 *
 * Héritage:
 *  - <VseCarte>
 */
function _DimStandard(lib) {
    switch (lib) {
       case "A4": return [0.210, 0.297];
       case "A3": return [0.297, 0.420];
       case "A2": return [0.420, 0.594];
       case "A1": return [0.594, 0.840];
       case "A0": return [0.840, 1.188];
      }
   }

function _segmentIntersects(segment,segments){
    //
    var i;
    for (i=0;i<segments.length;i++){
       if(!segments[i].equals(segment)){
          if(segments[i].intersects(segment) && !_startOrStopEquals(segments[i],segment)){
             return true;
            }            
         }    
      }
    return false;    
   }    

function _startOrStopEquals(segment1,segment2){
    //
    if(segment1.components[0].equals(segment2.components[0])) { return true; }
    if(segment1.components[0].equals(segment2.components[1])) { return true; }
    if(segment1.components[1].equals(segment2.components[0])) { return true; }
    if(segment1.components[1].equals(segment2.components[1])) { return true; }
    //
    return false;
   } 
   
/**
 * function: CarteWidgetCouchesInitialiser
 * Inique si une géométrie est saisie en huit
 */ 
VseCarte.prototype.GeometrieEnHuit= function(polygon) {
    //
    var i, j, outer, segment, segments;
    // On est bien sur un polygone
    if (polygon && (polygon.CLASS_NAME === "OpenLayers.Geometry.Polygon")) {
       //checking only outer ring
       outer = polygon.components[0].components;           
       segments = [];
       for (i=1;i<outer.length;i++){
          segment= new OpenLayers.Geometry.LineString([outer[i-1].clone(),outer  [i].clone()]);
          segments.push(segment);               
         }   
       for(j=0;j<segments.length;j++){    
          if(_segmentIntersects(segments[j],segments)){
             return true;
            }
         }                     
      }    
    return false;
   };

/**
 * function: CarteWidgetCouchesInitialiser
 */ 
VseCarte.prototype.CarteWidgetCouchesInitialiser= function(id,options) {
    // Variables
    var carte = this, couche, html, iCouche, idOption, $liste, $widget;
    // identifiant du widget
    $widget = $("#" + id);
    // Pas de widget trouvé
    if ($widget.length === 0) { return; }
    // Ajout de la classe adéquate
    $widget.addClass("carte_couches");
    // Liste contenant
    $liste = $widget.find("div.carte_couches_liste");
    // La liste n'existe pas
    if ($liste.length === 0) {
       // liste associée au widget et masqué par défaut
       $liste = $('<div class="carte_couches_liste"></div>').hide();
       // Ajout de la liste
       $widget.append($liste);
      }

    // entte des fonds de plan
    html = "<div><b>Fond de plan</b></div>";

    // Paroucrs des fond de plan de la carte
    $(carte.fdp).each(function() {
       // Etat coché d'un fdp
       var etat = "";
       // Couche visible
       if (this.layer.visibility === true) { etat = 'checked="checked"'; }
       // Identifiant du champ
       idOption = id + "_" + this.id;
       // Code html
       html += '<div>';
       html += '  <input data-reset="non" type="radio" name="carte_fdp_widget" id="' + idOption + '" ' + etat + ' data-fdp="'+this.id+'"></input>';
       html += '  <label for="' + idOption + '">'+this.nom+'</label>';
       html += '</div>';
      });

    //
    if (options && options.couches) {
       //
       html += "<div><b>Couches</b></div>";
       // Paroucrs des fond de plan de la carte
       $(options.couches).each(function(i,item) {
          //
          couche = carte.CoucheParId(item);
          //
          if (couche) {
             // Etat coché d'un fdp
             var etat = "";
             // Couche visible
             if (couche.layer.visibility === true) { etat = 'checked="checked"'; }
             // Identifiant du champ
             idOption = id + "_" + couche.id;
             // Code html
             html += '<div>';
             html += '  <input id="' + idOption + '"data-reset="non" type="checkbox" ' + etat + ' data-couche="'+ couche.id +'"></input>';
             html += '  <label for="' + idOption + '">'+couche.nom+'</label>';
             html += '</div>';
            }
         });
      }
    else {
       // Compteur de couches
       iCouche = 0;
       // Parcours des couches
       $(carte.couches).each(function(i,couche) {
          //
          var etat, libelle;
          // On ne traite pas une couche relevant des fdp
          if (!couche.fdp) {
             // Couche visible
             etat = (couche.layer.visibility === true) ? 'checked="checked"' : '';
             // Ajout des
             if (iCouche === 0) { html += "<div><b>Couches</b></div>"; }
             // Identifiant du champ
             idOption = id + "_" + couche.id;
             // Libelle de la couche
             libelle = couche.nom;
             // Nom de couche présent (utile si representation mulitples)
             if (couche.nom_couche) {
                // On utilsie le nom principale 
                libelle = couche.nom_couche;
                // On ajoute le nom de la couche
                if (couche.nom_couche !== couche.nom) { libelle += " ("+ couche.nom+ ")"; }             
               }
             // Code html
             html += '<div>';
             html += '  <input id="' + idOption + '"data-reset="non" type="checkbox" ' + etat + ' data-couche="'+ couche.id +'"></input>';
             html += '  <label for="' + idOption + '">'+ libelle +'</label>';
             html += '</div>';
             // Compteur
             iCouche++;
            }
         });
      }

    //
    $liste.html(html).mouseleave(function() {
       $(this).hide();
    //   $("input.adresse").show();
      });

    $widget.mouseenter(function() {
    //   $("input.adresse").hide();
       $liste.show();
      });

     //
    $("input[name='carte_fdp_widget']").click(function() {
       carte.FdpActiver($(this).data("fdp"));
       return true;
      });

    //
    $("input[data-couche]").click(function() {
       carte.CoucheVisibiliteFixer($(this).data("couche"),$(this).prop("checked"));
       carte.LegendeActualiser();
       return true;
      });
   };

/**
 * function: WidgetCharger
 * Charge le widget d'édition d'un objet
 */
 VseCarte.prototype.WidgetCharger= function(param,options) {
    // Variables
    var url;
    // Adresse pour chargement des ressources
    url = config.src_outils + "WidEdition.php";
    // Options par défaut
    if (options === undefined) {options = {}; }
    // Le widget est déjà chargé
    if ( $("#"+param.table).length === 1) {
       //
       if ($.isFunction(options.fonctionFin)) {
          // Appel de la fonction de fin
          options.fonctionFin();
         }
       // On arrête là
       return;
      }
    // Chargement du widget
    $.post(url,param,function(data){
       // Ajout dans la page
       $("body").append(data);
       // Groupe de champs
       $("div.vse_groupe").setGroupeLayout();
       //
       if ($.isFunction(options.fonctionFin)) {
          // Appel de la fonction de fin
          options.fonctionFin();
         }
      },"text");
   };

/**
 * function: Exporter
 * Export image ou pdf de la carte
 *
 * Argument
 * param : paramétrage
 */
 VseCarte.prototype.Exporter= function(param) {
    // Variables
    var adresse, arg, argcmpl, cadre_trace, carte, centre, echelle, h_papier, h_terrain, l_papier, l_terrain, layers, legende, map, styles;
    // Centre de la vue
    centre = [];
    centre.lon = parseInt(param.x, 10);
    centre.lat = parseInt(param.y, 10);
    // Echelle
    echelle = parseInt(param.echelle, 10);
     // Carte en cours
    carte = this;
    // Carte
    map = carte.map;
    // Dimensions papier
    // Largeur / hauteur papier
    l_papier = param.largeur;
    h_papier = param.hauteur;
    // Largeur / hauteur terrain : résolution selon le mode de sortie
    if (param.format === "image") {
       l_terrain = (l_papier * param.resolution);
       h_terrain = (h_papier * param.resolution);
      } else {
       l_terrain = (echelle * l_papier / 7200);
       h_terrain = (echelle * h_papier / 7200);
      }
    l_terrain = parseInt(l_terrain, 10);
    h_terrain = parseInt(h_terrain, 10);
    // Emprise du tracé
    cadre_trace = new OpenLayers.Bounds((centre.lon - (l_terrain / 2)),(centre.lat - (h_terrain / 2)),(centre.lon + (l_terrain / 2)),(centre.lat + (h_terrain / 2)));
    // Initialisation
    layers = "";
    styles = "";

    // Parcours des fonds de plan
    $(carte.fdp).each(function(i,couche) {
       // La couche est visible
       if (couche.layer.visibility) {
          // Séparateur de couche
          if (layers !== "") { layers += ","; styles += ","; }
          // Ajout du fdp
          layers += couche.id;
         }
      });

    // Parcours des couches
    $(carte.couches).each(function(i,couche) {
       // Variables
       var style;
       // Un layer est associé et est visible
       if (couche.layer && couche.layer.visibility) {
          // Séparateur de couche et de style
          if (layers !== "") { layers += ","; styles += ","; }
          // Ajout de la couche (le nom du layer geiserver n'est pas forcement l'id)
          layers += couche.table || couche.id;
          // Style
          style = "";
          // Style par défaut
          if (couche.style !== undefined) { style = couche.style; }
          // Style spécifique au tracé
          if (couche.styleTrace !== undefined) { style = couche.styleTrace; }
          // Ajout du style
          styles += style;
         }
      });
      
    // Paramètres de l'image
    arg = "service=WMS&version=1.1.0&request=GetMap";
    arg += "&layers=" + layers;
    arg += "&styles=" + styles;
    arg += "&bbox="   + cadre_trace.toBBOX(1);
    arg += "&width="  + l_papier + "&height=" + h_papier;
    arg += "&srs=EPSG:27562";
    arg += "&format=image/png";

    // Légende
    legende = [];
    
    // Et si une légende est demandée
    if (param.legende === "Oui") {
       // Parcours des thématiques
       $(carte.thematiques).each(function (i,thematique) {
          // Parcours des couches du thématique
          $(thematique.couches).each(function (i,couche) {
             // La couche possède des représentations
             if (couche.representations) {
                // Parcours des représentations de la couche
                $(couche.representations).each(function (i,representation) {
                   // La représentation est géographique et visible
                   if (representation.layer && representation.visibility) {
                      // Nom a afficher
                      var nom = representation.nom_couche || representation.nom;
                      // Légende : ajout de l'item
                      legende.push({'nom_comp': representation.layername, 'nom':nom, 'style':representation.style});
                     }
                  });
               }

             // La couche possède des représentations
             if (couche.couches) {
                // Parcours des couches du thématique
                $(couche.couches).each(function (i,sous_couche) {
                   // La couche est géographique et visible
                   if (sous_couche.layer && sous_couche.visibility) {
                      // Nom a utiliser
                      var nom = couche.nom + " : " + sous_couche.nom;
                      // Couche : ajout de l'item
                      legende.push({'nom_comp': sous_couche.layername, 'nom':nom, 'style':sous_couche.style});
                     }
                  });
               }

            // La couche est géographique et visible
            if (couche.layer && couche.visibility) {
                // Compsoants de la couche
                if (couche.composants) {
                   //
                   $(couche.composants).each(function(i,composant) {
                      // Ajout de l'item
                      legende.push({'nom_comp': 'vse:'+composant.id, 'nom':couche.nom, 'style':composant.style});
                     });
                  }
                else {
                   // Couche : ajout de l'item
                   legende.push({'nom_comp': couche.layername, 'nom':couche.nom, 'style':couche.style});
                  }
               }
            });
         });


      }
    // Encodage des paramètres
    arg = urlencode(arg);
    // Encodage de la légende
    legende = json_encode(legende);
      
    // Message d'attente on
    MessageAttente(true,"Merci de patienter pendant la génération du tracé...");

    
    if (!appli.services.wsUrlVersFichierImage) {

        appli.services.wsUrlVersFichierImage  = config.src_referentiel + "fed/UrlVersFichierImage.php?"; 
    }
    
    // Appel à la génération des images
    $.post(appli.services.wsUrlVersFichierImage,{param:arg, legende:legende},function(data) {
       // Si l'image principale est correctement générée
       if (data.test === true) {
          // On initialise le parametre d'impression
          argcmpl = "format=" + param.format;
          // On continue le parametre d'impression
          argcmpl += "&titre="       + param.titre;
          argcmpl += "&orientation=" + param.orientation;
          argcmpl += "&echelle="     + echelle;
          argcmpl += "&dim="         + param.dim;
          argcmpl += "&param="       + json_encode(data);
          // Et on appelle la page PHP de sortie
          adresse = config.src_referentiel + "fed/Impression.php?" + argcmpl;
          // Log
          VseOutils.LogCreer({type:"Impression",param:param.dim});
          // Ouverture du document
          window.open(adresse,"_blank");
         }
       else {
          alert("Problème lors de la génération du tracé.\nL'image demandée excède sans doute les capacités du système.");
         }
       // Message d'attente off
       MessageAttente(false);
      },"json");
   };

/**
 * function: LegendeAfficher
 * Affiche un widget contenant la légende des couches affichées
 *
 * Propriétés du paramètre optionnel:
 * couches - tableau des couches à afficher dans la légende
 */
VseCarte.prototype.LegendeAfficher= function (options) {
    // Variables
    var carte, $widLegendeContenu;
    // Carte en cours
    carte = this;
    //
    $widLegendeContenu = $("#" + carte.options.widgets.legende).html("");

    // Exploitation des couches passés en options (utilisé si pas de thématique défini)
    if (options && options.couches) {
       // Parcours des fond de plan de la carte
       $(options.couches).each(function(i,item) {
          // Récupération de la couche
          var couche = carte.CoucheParId(item);
          // Ajout à la légende
          if (couche) { _VseCarteLegendeAjouterItem(carte,$widLegendeContenu,couche); }
         });
      }

   // Parcours des thématiques
   $(carte.thematiques).each(function (i,thematique) {
      // Parcours des couches du thématique
      $(thematique.couches).each(function (i,couche) {
         // variables
         var nb_visible;
         // La couche possède des représentations (sous-niveau avec boutons radio)
         if (couche.representations) {
            // Parcours des représentations de la couche
            $(couche.representations).each(function (i,representation) {
               // La représentation est géographique et visible
               if (representation.layer && representation.visibility) {
                  // Ajout de l'item
                  _VseCarteLegendeAjouterItem(carte,$widLegendeContenu,representation);
                 }
              });
           }
         // La couche possède des couches (sous-niveau avec cases à cocher)
         if (couche.couches) {
            // Compteur de couches
            nb_visible = 0;
            // Parcours des couches du thématique
            $(couche.couches).each(function (i,sous_couche) {
               // Variables
               var titre, sous_titre;
               // La couche est géographique et visible
               if (sous_couche.layer && sous_couche.visibility) {
                  // Titre
                  titre = couche.nom;
                  // Sous titre par défaut
                  sous_titre = sous_couche.nom_couche || sous_couche.nom;
                  // Composants de la couche
                  if (sous_couche.composants && (sous_couche.composants.length > 0)) {
                     // Parcours des composant
                     $(sous_couche.composants).each(function(i,composant) {
                        // Affichage des sous titre après l'insertion du premeier item
                        if ((i > 0) && (sous_couche.legende) && (sous_couche.legende.titre_composant === false)) { sous_titre = ""; }
                        // Table
                        composant.table = composant.id;
                        // Ajout de l'item
                        _VseCarteLegendeAjouterItem(carte,$widLegendeContenu,composant,titre,sous_titre,nb_visible);
                        // Compteur de sous couches visibles
                        nb_visible++;
                       });
                    } else {
                     // Ajout de l'item
                     _VseCarteLegendeAjouterItem(carte,$widLegendeContenu,sous_couche,titre,sous_titre,nb_visible);
                     // Compteur de sous couches visibles
                     nb_visible++;
                    }
                 }
              });
           }
         // La couche est géographique et visible (pas de sous-niveau)
         if (couche.layer && couche.visibility) {
            // Composants de la couche
            if (couche.composants && (couche.composants.length > 0)) {
               // Parcours des composants
               $(couche.composants).each(function(i,composant) {
                  // Variables
                  var titre, sous_titre;
                  // Titre
                  titre = couche.nom_couche || couche.nom;
                  // Sous titre
                  sous_titre = composant.nom;
                  // Table
                  composant.table = composant.id;
                  // Ajout de l'item
                  _VseCarteLegendeAjouterItem(carte,$widLegendeContenu,composant,titre,sous_titre,i);
                 });
              }
            else {
               // Ajout de l'item
               _VseCarteLegendeAjouterItem(carte,$widLegendeContenu,couche);
              }
           }
        });
     });

    // Aucun item dans la légende (pas de thématique peut être)
    if ($widLegendeContenu.find("div").length === 0) {
       // Parcours des couches pour les légendes métier
       $(carte.couches).each(function(i,couche) {
          // Le layer est visible
          if (couche.layer && couche.layer.visibility) {
             // Une fonction est associé au tracé de la légende
             _VseCarteLegendeAjouterItem(carte,$widLegendeContenu,couche);
            }
         });
      }

    if ($widLegendeContenu.find("div").length === 0) {
       // Et re-parcours des couches pour les légendes métier
       $(carte.fdp).each(function(i,fdp) {
          //
          if ((fdp.id === "PLV") && fdp.layer.visibility) {
             // Une fonction est associé au tracé de la légende
             _VseCarteLegendeAjouterItem(carte,$widLegendeContenu,{table:"GENBRBAT", nom:"Sites et équipements"});
            }
          //
          if ((fdp.id === "CAD") && fdp.layer.visibility) {
             // Une fonction est associé au tracé de la légende
             _VseCarteLegendeAjouterItem(carte,$widLegendeContenu,{table:"CADBATDU", nom:"Bâtiments"});
             _VseCarteLegendeAjouterItem(carte,$widLegendeContenu,{table:"CADCIMET", nom:"Cimetières"});
             _VseCarteLegendeAjouterItem(carte,$widLegendeContenu,{table:"CADDETLI", nom:"Détails linéaires"});
             _VseCarteLegendeAjouterItem(carte,$widLegendeContenu,{table:"CADPARCE", nom:"Parcelles"});
            }
         });
      }

    // Et re-parcours des couches pour les légendes métier
    $(carte.couches).each(function(i,couche) {
       // Le layer est visible
       if (couche.layer && couche.layer.visibility  && couche.legende && couche.legende.fonction_trace) {
          // Une fonction est associé au tracé de la légende
          if ($.isFunction(couche.legende.fonction_trace)) { couche.legende.fonction_trace(couche.id + "_legende"); }
         }
      });

    // Log
    VseOutils.LogCreer({type:"Legende"});
   };

/**
 * function: LegendeAfficher
 * Affiche un widget contenant l légende
 */
VseCarte.prototype.LegendeActualiser= function () {
    //
    this.LegendeAfficher();
  };

///////////////////////////////////////////////////////////////////////
// Initialisation des boutons                                        //
///////////////////////////////////////////////////////////////////////
function _VseCarteLegendeAjouterItem(carte,$widLegendeContenu,couche,titre,sous_titre,indice) {
    // Variables
    var url, $widSpanItem;
    // Url du service qui renvoie l'image de la légende pour un composant
    url = config.src_outils+"Legende.php?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20";
    url += "&LAYER=vse:" + couche.table;
    url += "&LEGEND_OPTIONS=fontSize:11;";
    // Gestion des label en face des icônes
    if (couche.legende && (couche.legende.forcer_label === false)) {
      url += "forceLabels:off";
     }
   else {
      url += "forceLabels:on";
     }
    url +=  "&scale=5000";


   // Ajout du style
   if (couche.style !== undefined) { url += "&STYLE=" + couche.style; }
   //alert(url);
   // Gestion d'un titre
   if (titre) {
       // Premier item
       if (indice === 0) { $widLegendeContenu.append('<div style="margin:3px 0;"><b>'+titre+'</b></div>'); }
       // Conteneur par défaut
       $widSpanItem = $('<div style="margin-left:10px;"></div>');
       // On exploite le sous titre
       if (sous_titre) { $widSpanItem = $('<div style="margin-left:10px;">' + sous_titre  + '</div>');  }
      }
    else {
       // Si pas de titre en argument
       if (couche.legende !== undefined) {
          if (couche.legende.titre !== undefined) {
             titre = couche.legende.titre;
            }
          else {
             titre = couche.nom_couche || couche.nom;
            }
         }
       else {
          titre = couche.nom_couche || couche.nom;
         }
       //
       if (titre !== null) {
          $widSpanItem = $('<div><b>' + titre  + '</b></div>');
         }
       else {
          $widSpanItem = $('<div></div>');
         }
      }

    // Item : Légende
    if (couche.legende && couche.legende.fonction_trace) {
       // Si une fonction légende est définie, on lui prépare une div identifiée
       $widSpanItem.append("<div id='" + couche.id + "_legende'></div>");
     }
    else {
        // Sinon, on utilise la légende standard OpenLayers :
       if (couche.legende && couche.legende.fichier) {         // Si un fichier image est défini on le prend
          $widSpanItem.append("<div><img src='" + couche.legende.fichier + "'></div>");
         }
       else {                                              // Sinon on utilise l'url standard
          $widSpanItem.append("<div><img src='" + url + "'></div>");
         }
      }
   // Ajout au conteneur
   $widLegendeContenu.append($widSpanItem);
  }

///////////////////////////////////////////////////////////////////////
// Trace dans la vue du cadre apercu de l'emprise du tracé           //
///////////////////////////////////////////////////////////////////////
function _TracerApercuCadre() {
    // Variables locales
    var carte, centre, dim, extent, h, l, l_h, ligne, orient, poly, ptbg, pthg, pthd, ptbd, r, resol, x, y;
    //
    //if (arg === undefined) { arg = {}; }
    //
  //  if (!arg.carte) { arg.carte = appli.carte; }
    
   //arg.carte = appli.carte || carte; 
   
    //
    carte  = $("#widImpression").data("carte");
    
    // Premiere Initilisation
    if (carte.vectorTrace === undefined) {
       // Evenement sur le formulaire
       $("#widImpressionL, #widImpressionH, #widImpressionX, #widImpressionY, #widImpressionR").keyup(function() {
          // Cadre de l'emprise
          extent = _TracerApercuCadre().geometry.getBounds();
         });
       // Par défaut on démarre sur le pdf
       $("#widImpressionImg").hide();
       // Changement de format
       $("#widImpressionFormat").change(function() {
          //
          if (this.value === "pdf") {
             $("#widImpressionPdf").show();
             $("#widImpressionImg").hide();
            }
          else {
             $("#widImpressionImg").show();
             $("#widImpressionPdf").hide();
            }
         });
       // Evenement sur le formulaire
       $("#widImpressionA").change(function() {
          if ( $(this).prop("checked") === true) {
             WidgetEtatFixer("widImpressionX",false);
             WidgetEtatFixer("widImpressionY",false);
            }
          else {
             WidgetEtatFixer("widImpressionX",true);
             WidgetEtatFixer("widImpressionY",true);
            }
         });
       // Evenement sur le formulaire
       $("#widImpressionFormat, #widImpressionEchelle, #widImpressionOrientation, #widImpressionDimensions").change(function() {
          // Cadre de l'emprise
          extent = _TracerApercuCadre().geometry.getBounds();
          // Actualisation de la carte
          carte.map.zoomToExtent(extent);
         });
       // Création d'une couche vecteur dédiée
       carte.vectorTrace = new OpenLayers.Layer.Vector("Tracé", {
          rendererOptions: { zIndexing: true },
          styleMap:  new OpenLayers.StyleMap({
             "default" : new OpenLayers.Style({
                label             : "Emprise",
                fontColor         : "white",
                fontSize          : "14px",
                fontFamily        : "Arial",
                fontWeight        : "bold",
                labelOutlineColor : "#5A5A5A",
                labelOutlineWidth : 3,
                strokeWidth       : 3,
                strokeColor       : "#5A5A5A",
                fillColor         : "#FFFFFF",
                fillOpacity       : 0.7
               })
            })
         });
       // Ajout sur la carte
       carte.map.addLayers([carte.vectorTrace]);
      }
    if ($("#widImpressionL").val() === "") { $("#widImpressionL").val(1000); }
    if ($("#widImpressionH").val() === "") { $("#widImpressionH").val(800); }
    if ($("#widImpressionX").val() === "") { $("#widImpressionX").val(760500); }
    if ($("#widImpressionY").val() === "") { $("#widImpressionY").val(50600); }
    if ($("#widImpressionR").val() === "") { $("#widImpressionR").val(2); }
    if ( $("#widImpressionFormat").val() === "image") {
       l = parseInt($("#widImpressionL").val(),10);
       h = parseInt($("#widImpressionH").val(),10);
       x = parseInt($("#widImpressionX").val(),10);
       y = parseInt($("#widImpressionY").val(),10);
       if ($("#widImpressionA").prop("checked") === true) {
          // Centre géographique de la vue
          centre = carte.map.getCenter();
          // Coordonnées du centre
          x = centre.lon;
          y = centre.lat;
          $("#widImpressionX").val( parseInt(x * 10,10) / 10);
          $("#widImpressionY").val( parseInt(y * 10,10) / 10);
          }
       r = $("#widImpressionR").val();
      } else {
       // Echelle
       r = $("#widImpressionEchelle").val();
       // Orientation
       orient = $("#widImpressionOrientation").val();
       // Dimensions papier
       dim = ($("#widImpressionDimensions").val() !== undefined) ? $("#widImpressionDimensions").val() : "A4";
       l_h = _DimStandard(dim);
       // Largeur papier
       l = (orient === "L") ? l_h[1] - 0.020 : l_h[0] - 0.020;
       // Hauteur papier
       h = (orient === "L") ? l_h[0] - 0.047 : l_h[1] - 0.047;
       // Centre géographique de la vue
       centre = carte.map.getCenter();
       // Coordonnées du centre
       x = centre.lon;
       y = centre.lat;
       $("#widImpressionL").val(parseInt(l * 7200,10));
       $("#widImpressionH").val(parseInt(h * 7200,10));
       $("#widImpressionX").val( parseInt(x * 100,10) / 100);
       $("#widImpressionY").val( parseInt(y * 100,10) / 100);
       resol = (r / 7200);
       $("#widImpressionR").val(  parseInt(resol * 1000,10) / 1000 );
      }
    // Point pour cadre d'emprise
    ptbg = new OpenLayers.Geometry.Point(x - (r * l / 2 ),y - (r * h / 2 ));
    pthg = new OpenLayers.Geometry.Point(x + (r * l / 2 ),y - (r * h / 2 ));
    pthd = new OpenLayers.Geometry.Point(x + (r * l / 2 ),y + (r * h / 2 ));
    ptbd = new OpenLayers.Geometry.Point(x - (r * l / 2 ),y + (r * h / 2 ));
    //
    ligne = new OpenLayers.Geometry.LinearRing([ptbg,pthg,pthd,ptbd]);
    //
    poly = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon([ligne]));
    //
    carte.vectorTrace.setZIndex(1000);
    carte.vectorTrace.removeAllFeatures();
    carte.vectorTrace.addFeatures([poly]);
    //
    return poly;
   }