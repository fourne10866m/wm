/*
 * function: PanelInitialiser
 * initialisation des panels
 */
VseCarte.prototype.PanelInitialiser= function (param) {
    // Variables
    var carte, $widget;
    // Carte en cours
    carte = this;
    // Initialisation du panel droit
    carte.PanelCharger(param);
    // Widget de gestion des fonds de plan light
    carte.CarteWidgetCouchesInitialiser("map-affichage");
    // Widget conteneur
    $widget = $("#" + carte.idCarte).addClass("map-carte");

    // Info bulles
    $widget.find(".control-button").tooltip({
       tooltipClass : "map-tooltip",
       position     : {
          my: "right-5 center",
          at: "left center"
         },
       open : function (event, ui) {
          // Gestion du timeout
          if (appli.tooltip_timeout)  { window.clearTimeout(appli.tooltip_timeout); }
          // Durée de vie : 3 secondes
          appli.tooltip_timeout = window.setTimeout(function () { $(".control-button").tooltip('close'); },3000);
         }
      });

    // Survol des items qui masque le widget d'affichage
    $widget.find("div.panel-control.close-affichage").mouseenter(function() {
       // Reset des infos bulles
       $(".control-button").tooltip("close");
       // On masque le widget d'affichage
       $(".carte_couches_liste").hide();
      });

    // Zoom avant
    $widget.find("a.button-zoomin").click(function() {
       // Zoom
       carte.ZoomAvant();
       // Résultat
       return false;
      });

    // Zoom arrière
    $widget.find("a.button-zoomout").click(function() {
       // Zoom
       carte.ZoomArriere();
       // Résultat
       return false;
      });

    // Localisation par adresse
    $widget.find("a.button-adresse").click(function() {
       // Visibilité des outils de l'interface
       carte.OutilsVisibiliteFixer(false);
       // Appel de la fonction
       VseOutils.AdresseSelectionner({
          carte   : appli.carte,
          log     : true,
          fonctionFermerWidget : function() {
             // Visibilité des outils de l'interface
             carte.OutilsVisibiliteFixer(true);
            }
         });
       // Résultat
       return false;
      });

    // Légende
    $widget.find("a.button-legende").click(function() {
       // Variables
       var $this, $ui;
       // Controle le cours
       $this = $(this);
       //  Panel
       $ui = $("#map-ui");       
       // On test une fonction externe
       if ($.isFunction(param.fonctionPanelDeplier)) { param.fonctionPanelDeplier(); }
       // Légende active
       if ($this.hasClass("active") ) {
          // On ferme le panel
          $ui.toggle({duration:200});
          // On gére le style et l'infobulle
          $this.toggleClass("active",false).tooltip("option","content","Afficher la légende");
         }
       else {
          // Aucun autre control deja actif
          if ($(".button-panel.active").length === 0) { $ui.toggle({duration:200}); }
          // On masque la sélection
          $(".selection-ui").hide();
          // On affiche la légende
          $(".layers-ui").show();
          // Etat des autres boutons gérant l'affichage du panel
          $(".button-panel").toggleClass("active",false);
          // On gére le style et l'infobulle
          $this.toggleClass("active",true).tooltip("option","content","Masquer la légende");
          // Actualisation de la légende
          carte.LegendeAfficher();
         }
       // Résultat
       return false;
      });

    // Panel sur information de sélection
    $widget.find("a.button-selection").click(function() {
       // Variables
       var $this, $ui;
       // Controle le cours
       $this = $(this);
       //  Panel
       $ui = $("#map-ui");    
       // On test une fonction externe
       if ($.isFunction(param.fonctionPanelDeplier)) { param.fonctionPanelDeplier(); }       
       // Information active
       if ($this.hasClass("active")) {
          // On ferme le panel
          $ui.toggle({duration : 200 });
          // On gére le style et l'infobulle
          $this.toggleClass("active",false).tooltip("option","content","Afficher les informations de sélection");
         }
       else {
          // Aucun autre control deja actif
          if ( $(".button-panel.active").length === 0) { $ui.toggle({duration : 200 }); }
          // On masque la légende
          $(".layers-ui").hide();
          // On affiche la sélection
          $(".selection-ui").show();
          // Etat des autres boutons gérant l'affichage du panel
          $(".button-panel").toggleClass("active",false);
          // On gére le style et l'infobulle
          $this.toggleClass("active",false).tooltip("option","content","Masquer les informations de sélection");
         }
       // Résultat
       return false;
      });

    // Fermeture du volet droit
    $("#map-ui span.close").unbind().click(function() {
       var $ui;
       $ui = $("#map-ui");
       $ui.toggle({duration : 200 });
       $(".button-panel").toggleClass("active",false);
      });

    // Localisation rapide
    $widget.find('.map-localisation').localisation({
       // Log d'erreur
       log : true,
       // Sélection effective
       selection : function (res) {   
          // Type de données
          if (res.type === "Quartier") {
             // Ajout du quarteir à la carte
             carte.SelectionAjouterObjet({table:"GENSECT1", gid:res.gid , zoom:true});
             // On retire le quartier de la sélection
             window.setTimeout(function() {carte.SelectionRetirerObjet({table:"GENSECT1", gid:res.gid});},2500);
            }
          else{
             // Zoom sur un équipment
             if (res.type === "Equipement") { res.zoom = 8; }
             if (res.type===  "Adresse")    { res.zoom = 8; }
             // Centrage de la carte
             carte.Centrer(res);
            }
         }
      });
   };

/*
 * function: PanelFermer
 * Fermeture du volet droit
 */
VseCarte.prototype.PanelFermer= function () {
    // On ferme le volet droit
    $("#map-ui").hide();
    // Désactivation des icones actives     
    $("#" + this.idCarte).find(".control-button").toggleClass("active",false); 
  };
  
/*
 * function: PanelSelectionAfficher
 * Affichage du volet droit de sélection
 */
VseCarte.prototype.PanelSelectionAfficher= function (param) {
    // Variables
    var carte, $ui;
    //  Panel
    $ui = $("#map-ui");
    // Carte en cours
    carte = this;
    // Affichae
    $ui.show({
       duration : 200,
       complete : function() {
          carte.TailleActualiser();
          if (param && $.isFunction(param.fonctionFin)) {
              param.fonctionFin();
             }
         }
      });
    //
    $(".layers-ui").hide();
    //
    $(".selection-ui").show();
   };

/*
 * function: PanelCharger
 * Chargement du panel
 */
VseCarte.prototype.PanelCharger= function (options) {
    // Vafiables
    var param, html;
    // Les interfaces sont déja chargées
    if($("#"+this.idCarte).find("div.panel-control").length > 0) { return; }
    // Options par défaut
    param = {
       affichage    : false,
       zoom         : {
          cadre   : false,
          adresse : true
         },
       legende      : false,
       edition      : false,
       information  : false,
       localisation : true
      };

    // Options spécifiées
    param = $.extend(param,options);

    // Barre d'outil de boutons
    html  = '<div class="control-panel">';
    html += ' <div class="panel-top panel-left">';

    if (param.affichage) {
       html += '  <div class="panel-control">';
       html += '   <a class="control-button button-affichage" href="#" id="map-affichage"><span class="icon layers"></span></a>';
       html += '  </div>';
      }

    if (param.zoom) {
       html += '<div class="panel-control close-affichage">';
       html += ' <a class="control-button button-zoomin"  href="#" title="Zoom avant"><span class="icon zoomin"></span></a>';
       html += ' <a class="control-button button-zoomout" href="#" title="Zoom arrière"> <span class="icon zoomout"></span></a>';
       if (param.zoom.cadre)   { html += '<a class="control-button button-cadre"   href="#" title="Zoom par cadre" id="btnZoomParCadre"> <span class="icon cadre"></span></a>'; }
       if (param.zoom.adresse) { html += '<a class="control-button button-adresse" href="#" title="Localisation par adresse"> <span class="icon adresse"></span> </a>'; }
       html += '  </div>';
      }

    // Groupe légende / information
    if (param.legende || param.information) {
       html += '<div class="panel-control close-affichage">';
       if (param.legende)     { html += '<a class="control-button button-panel button-legende" href="#" title="Afficher la légende"><span class="icon legende"></span></a>'; }
       if (param.information) { html += '<a class="control-button button-panel button-selection" href="#" title="Afficher les informations de sélection"><span class="icon information"></span></a>'; }
       // Les boutons métiers seront groupés avec kles
       if (!param.ensemble) { html += '</div>'; }
       }
       
    if (param.metier) {
       if (!param.ensemble) { html += '  <div class="panel-control">'; }
       $(param.metier).each(function(i,metier) {
          html += '<a class="control-button button-metier" href="#" id="'+metier.id+'" title="'+metier.titre+'"><span class="icon ' + metier.icone + '"></span></a>';
         });
       html += '  </div>';
      }
      
    if (param.edition) {
       html += '  <div class="panel-control close-affichage">';
       html += '   <a class="control-button button-legende" href="#" title="Centrer"><span class="icon centrer"></span> </a>';
       html += '   <a class="control-button button-selection" href="#" title="Sélection"> <span class="icon deplacer"></span></a>';
       html += '   <a class="control-button button-geometrie"  href="#" title="Sélection"> <span class="icon geometrie"></span></a>';
       html += '  </div>';
       }


    html += ' </div>';
    html += '</div>';
    //
    $("#"+this.idCarte).prepend(html);

    // Les interfaces sont déja chargées
    if($("#map-ui").length === 0) {  
       // Panel droit
       html =  '<div id="map-ui" class="map-ui" style="display:none;">';
       html += '  <div class="layers-ui">';
       html += '    <div class="sidebar_heading">';
       html += '      <span class="icon close">Fermer</span>';
       html += '      <span><b>Légende</b></span>';
       html += '    </div>';
       html += '    <div class="base-layers" id="widLegende"></div>';
       html += '  </div>';
       html += '  <div class="selection-ui">';
       html += '    <div class="sidebar_heading">';
       html += '      <span class="icon close">Fermer</span>';
       html += '      <span class="ui-titre"><b>Sélection</b></span>';
       html += '    </div>';
       html += '   <div id="widSelectionResultat" class="panel-selection"></div>';
       html += '</div>';
       //
       $("#"+this.idCarte).parent().prepend(html);
       //
       if (param.largeur) { $("#map-ui").css("width",param.largeur);      }
       
      }   
 
    // Localisationrapide
    if (param.localisation) {
       // Localisation rapide
       html = '<input type="text" class="map-localisation adresse"/>';
       // Ajout à la carte
       $("#"+this.idCarte).prepend(html);
      }
   };

/*
 * function: AffichageListerCoucheVisible
 * Liste les couches et thématiques visibles
 */
VseCarte.prototype.IhmMenuConstruire= function (options) {
    // Variables
    var carte = this, fdpImage = false, ico, $input, $option, widget, $widThematique;
    // Initialisation des options
    if (options === undefined) { options = {}; }
    // Option de tri par défaut
    if (options.tri === undefined) { options.tri = false; }

    // Slider pour opacité des fonds de plan
	 $("#" + carte.options.widgets.sliderFdp).slider({
       'range' : "min",
       'value' : 0,
       'min'   : 0.1,
       'max'   : 1,
       'step'  : 0.05,
       'slide' : function(event,ui) {
          // On applique la transparence
          carte.FdpTransparenceFixer(null,(1 - ui.value));
          // Sauvegarde de la session
          carte.SessionSauver();
         }
      });

    // Slider pour opacité des données thématiques
	 $("#" +  carte.options.widgets.sliderThematique).slider({
       'range' : "min",
       'value' : 0,
       'min'   : 0.1,
       'max'   : 1,
       'step'  : 0.05,
       'slide' : function(event,ui) {
          // On applique la transparence
          carte.CoucheTransparenceFixer(null,(1 - ui.value));
         }
      });

    // Parcours des fonds de plans
    $(carte.fdp).each(function (i,fdp) {
       // Bouton radio
       $input = $("<input name='fdp' type='radio' id='" + fdp.id + "'value='" + fdp.id +"'/>");
       // Le fond de plan est une image
       if (fdp.id.indexOf("IMG_") === 0) { fdpImage = true; }
       // Etat du bouton radio
       if (fdp.layer.visibility) { $input.prop("checked",true); }
       // Evenement sur clic
       $input.click(function () {
          // Couche de type image
          var image = (this.id.indexOf("IMG_") === 0);
          // Activation du fdp
          carte.FdpActiver(this.id);
          // Gestion des overlays images
          if (carte.options.couches.fdpImage && ($("#IMG_TEXTE").length > 0)) {
             // Etat des cases à cocher
             window.WidgetEtatFixer("IMG_TEXTE",image);
             window.WidgetEtatFixer("IMG_THEME_CAD",image);
             // Visibilité des couches
             carte.CoucheVisibiliteFixer("IMG_TEXTE",( $("#IMG_TEXTE").prop("checked")  && image));
             carte.CoucheVisibiliteFixer("CAD_CLAIR",( $("#IMG_THEME_CAD").prop("checked")  && image));
            }
          // Gestion des thématiques
          carte.IhmSelectionGerer();
          // Actualisation de la légende
          carte.LegendeActualiser();
         });
       // Ajout de la balise de liste et du label
       $option = $("<li/>").append($input).append("<label for='" + fdp.id + "'>" + fdp.nom + "</label>");
       // Widget dans lequel placer l'item
       widget = (fdp.widget !== undefined) ? fdp.widget : carte.options.widgets.listeFdp;
       // Ajout à la liste
       $("#" + widget).prepend($option);
      });

    // Pas d'image associées aux fdp
    if (carte.options.couches.fdpImage === false) { fdpImage = false; }

    // Ajout des overlays sur raster
    if (fdpImage) {
       // Item : textes de voie
       widget  = "<li>";
       widget += "<input type='checkbox' id='IMG_TEXTE'/>";
       widget += "<label for='IMG_TEXTE'>Textes de voie</label>";
       widget += "</li>";
       // Item : cadastre
       widget += "<li>";
       widget += "<input type='checkbox' id='IMG_THEME_CAD'/>";
       widget += "<label for='IMG_THEME_CAD'>Cadastre</label>";
       widget += "</li>";
       // Chargement du cadastre
       carte.CoucheCharger({id:"CAD_CLAIR", nom:"Cadastre" , fdp:true, cache:true, opacity:0.7, widget:"_"});
       // Chargement des textes
       carte.CoucheCharger({id:"IMG_TEXTE", nom:"Textes de voies" , fdp:true, cache:true, widget:"-"});
       // Ajout des widgets
       $("#"+ carte.options.widgets.listeFdpImage).append(widget);
       // Gestion des événements
       $("#IMG_TEXTE").click(function () {carte.CoucheVisibiliteFixer("IMG_TEXTE",this.checked);});
       $("#IMG_THEME_CAD").click(function () {carte.CoucheVisibiliteFixer("CAD_CLAIR",this.checked);});
       // Désactivation des widgets
       window.WidgetEtatFixer("IMG_TEXTE",false);
       window.WidgetEtatFixer("IMG_THEME_CAD",false);
      }

    //
    $widThematique = $("#" + carte.options.widgets.listeThematique);
    // Mémo des thélmatiques sur la carte
    carte.thematiques = options.thematiques;
    // Parcours des thématiques
    $(options.thematiques).each(function (i,thematique) {
       // Variables
       var html, nb_couches;
       // Code
       html = '<li>';
       html += '<input id="menu_' + thematique.id + '" data-type="thematique" data-id="' + thematique.id + '" type="checkbox"/>';
       html += '<label for="menu_' + thematique.id + '">' + thematique.libelle + '</label>';
       html += '<ol class="thematique" style="display:none;">';

       //
       nb_couches = thematique.couches.length;

       // Parcours des couches du thématique
       $(thematique.couches).each(function (i,couche) {
          // Variables
          var style, nb_sous_couche, nb_representations;
          // Style pour dernier item sans bordure
          style = (i === (nb_couches - 1)) ? 'style="border:0;"' : '';
          //  Création de l'item
          html += '<li class="couche" '+ style +' >';
          if (couche.ihm && couche.ihm.tableau) {
          
             html += '<a href="#" class="table_donnees" data-table="' + couche.ihm.tableau.table + '" style="float:right;" title="Table des données"></a>';
            }
            
         if (couche.ihm && couche.ihm.inventaire) {
          
             html += '<a href="#" class="metadonnees_donnees" data-gid="' + couche.ihm.inventaire.gid + '" style="float:right;" title="Description des données"></a>';
            }
            
            
          html += '<input id="menu_' + couche.id + '" data-type="couche" data-id="' + couche.id + '" data-thematique="' + thematique.id  +  '" type="checkbox"/>';
          html += '<label for="menu_' + couche.id + '">' + couche.nom + '</label>';

          // La couche possèdes des représentarions
          if (couche.representations) {
             // Nombre de repésentations
             nb_representations = couche.representations.length;
             // Initialition du groupe
             html += '<ol style="display:none;">';
             // Parcours des représentations
             $(couche.representations).each(function (i,representation) {
                // Style pour dernier item sans bordure
                var style = (i === (nb_representations - 1)) ? 'style="border:0;"' : '';
                // Mémo du composant sur la représentation
                representation.composant = couche.composant;
                representation.nom_couche = couche.nom;
                // Création de l'item
                html += '<li '+ style +' >';
                html += '  <input id="menu_'+representation.id+ '" data-id="'+ representation.id +'" type="radio" data-type="representation" name="'+ couche.id  +'" data-table="' + couche.id + '"/>';
                html += '  <label for="menu_' + representation.id + '">' + representation.nom + '</label>';
                html += '</li>';
               });
             // Fin du groupe
             html += '</ol>';
            }

          // La couche est un groupe de couche
          if (couche.couches) {
             // Nombre de couches
             nb_sous_couche = couche.couches.length;
             // Initialition du groupe
             html += '<ol style="display:none;">';
             // Paroucrs des couches
             $(couche.couches).each(function (i,sous_couche) {
                // Style pour dernier item sans bordure
                style = (i === (nb_sous_couche - 1)) ? 'style="border:0;"' : '';
                // Création de l'item
                html += '<li '+ style +' >';
                html += '  <input id="menu_' + sous_couche.id + '" data-type="couche" data-id="' + sous_couche.id + '" type="checkbox"/>';
                html +=   '<label for="menu_' + sous_couche.id + '">' + sous_couche.nom + '</label>';
                html += '</li>';
               });
             // Fin du groupe
             html += '</ol>';
            }

          html += '</li>';
         });

       html += '</ol>';
       html += '</li>';

       $widThematique.append(html);
      });

    // Tri des items de l'affichage thématique principal
    $widThematique.children('li').sortElements(function(a, b){
       // On explote le texte du label
       return $(a).find("label").text() > $(b).find("label").text() ? 1 : -1;
      });

    // Clic sur un thématique
    $('input[data-type="thematique"], input[data-type="couche"], input[data-type="representation"]').click(function() {
       // Données de l'item
       var data = $(this).data();
       // Gestion de l'affichage et de l'arbre
       carte.CoucheAfficher(data.id,this.checked);
       // Actualisation de la légende
       carte.LegendeActualiser();
      });

    // Gestion
    carte.IhmMetierGerer();
    // Compsoant sélectionnable
    carte.IhmSelectionGerer();

    // Compatibilité avec anceinne version
    if (!carte.thematiques) {
       // Parcours des couches
       $(carte.couches).each(function(i,couche) {
          // Variables
          var disabled, option, $texte;
          // Cas d'une couche toujours visible
          disabled = (couche.toujoursVisible === "oui")  ? " disabled='disabled' " : "";
          // Case à cocher
          $input = $("<input id='ihm_" + couche.id + "'" + disabled + " type='checkbox' couche_id='"+ couche.id +"'/>");
          // Visibilité de la couche
          if (couche.visibility) { $input.attr("checked","checked"); }
          // Evénement sur clic : affichage de la couche
          $input.click(function () {
             // Visibilité de la couche
             carte.CoucheVisibiliteFixer( $(this).attr("couche_id"),this.checked);
            });
          // Cas des groupements de couche
          if (couche.fdp === true) {
             // Événement sur clic : affichage de la couche
             $input.click(function () {
                // Gestion des sélections
                carte.IhmSelectionGerer();
               });
            }
          //
          $texte = $("<label for='ihm_" + couche.id + "'>" + couche.nom + "</label>");
          // Icone
          ico = "";
          // Utilisation d'une icone
          if (couche.ico) {
             ico = "<img src='" + couche.ico  + "' style='position:relative; top:2px; left:0px; margin-right:6px;' />";
             $input.css("top","-3px");
             $texte.css("top","-5px").css("position","relative");
            }
          // Ajout de la balise de liste et du label
          option = $("<li>").append(ico).append($input).append($texte);
          // Optimisation du padding si icone
          if (couche.ico) { option.css("padding","0 0 2px 0"); }
          // Widget dans lequel placer l'item
          widget = (couche.widget !== undefined) ? couche.widget : carte.options.widgets.listeThematique;
          // Ajout à la liste
          $("#" + widget).append(option);
         });
      }
      
    $("a.table_donnees").click(function() {
       // Variables
       var data, param;
       //
       data = $(this).data();
       //
       param = {
          table           : data.table,
          rechercheRapide : true,
          critere         : null,
          ficheDetaillee  : false,
          exporter        : false,
          modal           : false,
          fonctionSelection : function (arg) {
             // On affiche le contrôle
            // appli.carte.PanelSelectionAfficher();        
             // On ajoute l'objet au plan de sélection
             appli.carte.SelectionAjouterObjet({table:param.table, gid:arg.gid , champ:appli.geometry, ajouterListe:true });
             // On ne ferme pas la fenêtre
             return false;
            },
          dblclick : function (arg) {
             // COnsultation standard de l'objet
             VseGestion.ObjetConsulterParGid({table: data.table, gid:arg.gid});
            }
         };
       // Appel du widget de recherche
       VseOutils.ObjetRechercher(param);
      });
      
    $("a.metadonnees_donnees").click(function() {
       // Variables
       var data = $(this).data();
       // COnsultation standard de l'objet
       VseGestion.ObjetConsulterParGid({table:"GENINFO", gid:data.gid});
       return false;
      });
      
   };

/*
 * function: IhmSelectionGerer
 * gestion du widget de selection de la couche selectionnable
 */   
VseCarte.prototype.IhmSelectionGerer= function () {
    // Variables
    var carte, $widget;
    // Carte en cours
    carte = this;
    // Pas d'interaction ave l'ihm
    if (carte.options.interactionIhm === false) { return; }
    // Widget qui liste les composant sélectionnables
    $widget = $('#' + carte.options.widgets.selectionCouche);
    // Pas de gestion de sélection : on arrête la
    if ($widget.length === 0) { return; }
    // On vide la liste
    $widget.find('option').remove();
    // Ajout à la liste de l'option par défaut
    $widget.append( $("<option value='' selected='selected'>Sélectionner une couche</option>") );

    $widget.append( $("<option value='vider'>Vider la sélection</option>") );

    // Parcours des fonds de plan
    $(carte.fdp).each(function(i,fdp) {
       // Le thématique est visible
       if (fdp.layer.visibility) {
          //
          if (fdp.id === "PLV") {
             carte.IhmSelectionCouche({id:'GENBRBAT', 'nom' : 'Sites et équipements', table:"GENBRBAT"},$widget);
             carte.IhmSelectionCouche({id:'VOITRONC', 'nom' : 'Tronçons de voie', table:"VOITRONC"},$widget);
            }
          //
          if (fdp.id === "CAD") {
             carte.IhmSelectionCouche({id:'CADPARCE', 'nom' : 'Parcelle cadastrale', table:"CADPARCE"},$widget);
             carte.IhmSelectionCouche({id:'CADBATDU', 'nom' : 'Bâtiment cadastral' , table:"CADBATDU"},$widget);
            }
         }
      });

    // Parcours des couches
    $(carte.couches).each(function(i,couche) {
       // La couche est visible
       if (couche.visibility === true) {
          // On active le thématique
          carte.IhmSelectionCouche(couche,$widget);
         }
      });

    // Tri des items
    $widget.find("option[value!=][value!='vider']").sort(function(a,b){return (a.text) > (b.text) ? 1 : -1;}).remove().appendTo($widget);
   };

/*
 * function: IhmSelectionCouche
 * Liste des composants sélectionnables
 */
VseCarte.prototype.IhmSelectionCouche= function (couche,$widget) {
    // Variables
    var nom, $option;
    // Couche kml on ne fait rien
    if ((couche.kml === true) || (couche.selection === false)) { return; }
    // La couche ne possède pas de composants associés
    if (!couche.composants && (couche.fdp !== true)) {
       // Libelle de la couche
       nom = couche.nom_couche || couche.nom;
       // Item
       $option = $("<option>"+ nom +"</option>").attr("value",couche.table).attr("geometry",couche.geometry);
       // Ajout à la liste
       $widget.prepend($option);
      }
    else {
       // Parcours des composant de la couhe
       $(couche.composants).each(function(i,composant) {
          // Le composant est sélectionnable
          if (composant.selection !== false) {
             // Item
             $option = $("<option>"+ composant.nom +"</option>").attr("value",composant.id).attr("geometry",composant.geometry);
             // Ajout à la liste
             $widget.prepend($option);
            }
         });
      }
   };

/*
 * function: IhmMetierGerer
 * Gestion de l'affichage des metiers
 */
VseCarte.prototype.IhmMetierGerer= function () {
    // Variables
    var $metiers, $widMetier;
    // Pas d'interaction ave l'ihm
    if (this.options.interactionIhm === false) { return; }
    // Widget des metiers
    $metiers = $("#" + this.options.widgets.metiers);
    // On masque tous les traitements métiers
    $metiers.find("li.menu_metier").hide();
    // Menu cadastre spécifique
    $widMetier = $("#widMetierCAD");
    // On le masque
    $widMetier.attr("visible","non").hide();
    // On l'affiche si on est avec le fdp cadastre
    if (this.FdpActif() === "CAD") { $widMetier.attr("visible","oui").show(); }

    // Parcours des thématiques
    $(this.thematiques).each(function (i,thematique) {
       // Variables
       var $widgetThematique, $widMetier;
       // Widget correspondant au thématique
       $widgetThematique = $("#menu_" + thematique.id);
       // Widget corrrspondant au menu metier du thématique
       $widMetier = $("#widMetier" + thematique.id);
       // Elle est présente
       if ($widMetier.length > 0) {
          // Test du thématique
          if ($widgetThematique.prop("checked")) {
             // On affiche le metier et on renseigne l'attribut dédié
             $widMetier.attr("visible","oui").show();
            }
          else {
             // On masque le metier et on renseigne l'attribut dédié
             $widMetier.attr("visible","non").hide();
            }
         }
      });

    // On affiche les métiers sans thématique associé
    $metiers.find("li.sans_thematique").attr("visible","oui").show();
    // On affiche l'information sur aucune fonction disponible
    if ($metiers.find("li.menu_metier[visible='oui']").length === 0) {
       // On affiche le widget dédié
       $("#widMetierAucun").show();
      }
   };

/*
 * function: CoucheAfficher
 * Gestion de l'affichage des metiers
 */
VseCarte.prototype.CoucheAfficher= function (id,etat) {
    // Variables
    var carte = this;
    // Parcours des thématiques
    $(carte.thematiques).each(function (i,thematique) {
       // Variables
       var $ol, $widget ;
       // On est sur le thématique
       if (thematique.id === id) {
          // Case à cocher correspondant
          $widget = $("#menu_" + id);
          // Liste des couches du thématique
          $ol = $widget.siblings('ol');
          //
          if (etat) {
             // On affiche le bloc fils
             $ol.show(200);
             // Parcours des couches du thématique
             $(thematique.couches).each(function (i,couche) {
                // La couche possède des couches
                if (couche.couches) {
                    // Parcours des couches pour les masques
                   $(couche.couches).each(function (i,sous_couche) {
                      // Widget correspondant
                      $widget = $("#menu_" + sous_couche.id);
                      // Ajout des quartiers de proximité
                      carte.CoucheVisibiliteFixer(sous_couche.id, $widget.prop("checked"));
                     });
                   //
                   return;
                  }

                // La couche possède des représentations
                if (couche.representations) {
                   //
                   $widget = $("#menu_" + couche.id);
                   // Une des représentations est active
                   if ($widget.prop("checked")) {
                      // Parcours des représentations pour les masques
                      $(couche.representations).each(function (i,representation) {
                         //
                         $widget = $("#menu_"+representation.id);
                         // Ajout des quartiers de proximite
                         carte.CoucheVisibiliteFixer(representation.id, $widget.prop("checked"));
                        });
                     }
                   //
                   return;
                  }

                //
                $widget = $("#menu_"+couche.id);
                // Couche géographique
                carte.CoucheVisibiliteFixer(couche.id,$widget.prop("checked"));
               });
            }
          else {
             // On masque le détail du thématique
             $ol.hide(200);
             // Parcours des couches du thématique
             $(thematique.couches).each(function (i,couche) {
                // La couche possède des représentations
                if (couche.couches) {
                   // Parcours des représentations pour les masques
                   $(couche.couches).each(function (i,sous_couche) {
                      // Ajout des quartiers de proximite
                      carte.CoucheVisibiliteFixer(sous_couche.id,false);
                     });
                   //
                   return;
                  }

                // La couche possède des représentations
                if (couche.representations) {
                   // Parcours des représentations pour les masques
                   $(couche.representations).each(function (i,representation) {
                      // Ajout des quartiers de proximite
                      carte.CoucheVisibiliteFixer(representation.id,false);
                     });
                   //
                   return;
                  }

                // Couche géographique
                carte.CoucheVisibiliteFixer(couche.id,false);
               });
            }
          // Menu metiers
          carte.IhmMetierGerer();
          // Composant sélectionnables
          carte.IhmSelectionGerer();
          // Fin
          return;
         }

       // Parcours des couches du thématique
       $(thematique.couches).each(function (i,couche) {
          // Variables
          var $input, $ol, $widget;
          // Couche ou groupe de couche
          if (couche.id === id) {
             // La couche possède des représentations
             if (couche.representations) {
                // Case à cocher correspondant à la couche
                $widget = $("#menu_"+id);
                // liste des représentations
                $ol = $widget.siblings('ol');
                // Etat à traiter
                if (etat === true) {
                   // On affiche les représentations
                   $ol.show(500);
                   // Item déjà sélectionné
                   $input = $ol.find("input:checked");
                   // On prend le premier item si aucun n'est sélectionné
                   if ($input.length === 0) { $input = $ol.find("input:first"); }
                   // Ajout des quartiers de proximite
                   carte.CoucheAfficher($input.attr("data-id"),true);
                  }
                else {
                   // On masque la les représentations
                   $ol.hide(500);
                   // Parcours des représentations pour les masques
                   $(couche.representations).each(function (i,representation) {
                      // Ajout des quartiers de proximite
                      carte.CoucheVisibiliteFixer(representation.id,false);
                     });
                  }
                return;
               }

             // La couche est un groupement de couches
             if (couche.couches) {
                // Case à cocher correspondant à la couche
                $widget = $("#menu_"+id);
                // On affiche les représentations
                $ol = $widget.siblings('ol');
                // Etat à traiter
                if (etat === true) {
                   // On affiche le souc couches
                   $ol.show(500);
                   // Parcours des représentations pour les masques
                   $(couche.couches).each(function (i,sous_couche) {
                      // Variables
                      var etat, $widget;
                      // Wideet correspondant
                      $widget = $("#menu_"+sous_couche.id);
                      // Etat coché
                      etat = $widget.prop("checked");
                      // Ajout de la couche
                      if (etat === true) { carte.CoucheCharger(sous_couche); }
                      // Visivilité de la couche fonction de l'état  du widget
                      carte.CoucheVisibiliteFixer(sous_couche.id,etat);
                     });
                  }
                else {
                   // On masque les sous couches
                   $ol.hide(500);
                   // Parcours des représentations pour les masques
                   $(couche.couches).each(function (i,sous_couche) {
                      // On masque les couches
                      carte.CoucheVisibiliteFixer(sous_couche.id,false);
                     });
                  }
                return;
               }

             // On coche la case correspondante à la couche
             $("#menu_" + couche.id).prop("checked",etat);
             // On, coche le thématique et on affiche ses fils
             $("#menu_" + thematique.id).prop("checked",true).siblings('ol').show();
             // Ajout de la couche
             carte.CoucheCharger(couche);
             // Affichage
             carte.CoucheVisibiliteFixer(couche.id,etat);
             // Gestion des metiers
             carte.IhmMetierGerer();
             // Compsoant sélectionnables
             carte.IhmSelectionGerer();
             // On arrête la
             return;
            }

          // Test des représentations
          if (couche.representations) {
             // Parcours des représentations
             $(couche.representations).each(function (i,representation) {
                // Variables
                var $couche, $radios, $widget;
                // On est sur la représentation à traiter
                if (representation.id === id) {
                   // Parcours des couches pour effacer celle de la même table
                   $(carte.couches).each(function() {
                      // On masque la couche
                      if (this.composant && (this.composant === representation.composant)) { carte.CoucheVisibiliteFixer(this.id,false);}
                     });
                   // Ajout des quartiers de proximite
                   carte.CoucheCharger(representation);
                   // Ajout des quartiers de proximite
                   carte.CoucheVisibiliteFixer(representation.id,etat);
                   //
                   $widget = $("#menu_" + representation.id);
                   // On coche la case correspondantes
                   $widget.prop("checked",etat);
                   //
                   $couche = $("#menu_" + couche.id);
                   // Nombre de cases à coches
                   $radios = $couche.parent().find("input:checked");
                   //
                   $couche.prop("checked", ($radios.length > 0) );
                   //
                   if (etat === true) {
                      //
                      $couche.siblings('ol').show();
                      // On coche le thématique et on affiche ses fils
                      $("#menu_" + thematique.id).prop("checked",true).siblings('ol').show();
                     }
                   // Gestion des metiers
                   carte.IhmMetierGerer();
                   // Composant sélectionnables
                   carte.IhmSelectionGerer();
                   // Fin
                   return;
                  }
               });
            }

          // Test des sous couches
          if (couche.couches) {
              // Parcours des sous couches
             $(couche.couches).each(function (i,sous_couche) {
                // On est sur une sous couche
                if (sous_couche.id === id) {
                   // On coche la case correspondante à la couche
                   $("#menu_" + sous_couche.id).prop("checked",etat);
                   // On, coche le thématique et on affiche ses fils
                   $("#menu_" + couche.id).prop("checked",true).siblings('ol').show();
                    // On coche le thématique et on affiche ses fils
                   $("#menu_" + thematique.id).prop("checked",true).siblings('ol').show();
                   // Ajout des quartiers de proximite
                   carte.CoucheCharger(sous_couche);
                   // Ajout des quartiers de proximite
                   carte.CoucheVisibiliteFixer(sous_couche.id,etat);
                   // Gestion des metiers
                   carte.IhmMetierGerer();
                   // Compsoant sélectionnable
                   carte.IhmSelectionGerer();
                   // Fin
                   return;
                  }
               });
            }
         });
      });
   };