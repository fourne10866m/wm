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
          // Dur�e de vie : 3 secondes
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
       // R�sultat
       return false;
      });

    // Zoom arri�re
    $widget.find("a.button-zoomout").click(function() {
       // Zoom
       carte.ZoomArriere();
       // R�sultat
       return false;
      });

    // Localisation par adresse
    $widget.find("a.button-adresse").click(function() {
       // Visibilit� des outils de l'interface
       carte.OutilsVisibiliteFixer(false);
       // Appel de la fonction
       VseOutils.AdresseSelectionner({
          carte   : appli.carte,
          log     : true,
          fonctionFermerWidget : function() {
             // Visibilit� des outils de l'interface
             carte.OutilsVisibiliteFixer(true);
            }
         });
       // R�sultat
       return false;
      });

    // L�gende
    $widget.find("a.button-legende").click(function() {
       // Variables
       var $this, $ui;
       // Controle le cours
       $this = $(this);
       //  Panel
       $ui = $("#map-ui");       
       // On test une fonction externe
       if ($.isFunction(param.fonctionPanelDeplier)) { param.fonctionPanelDeplier(); }
       // L�gende active
       if ($this.hasClass("active") ) {
          // On ferme le panel
          $ui.toggle({duration:200});
          // On g�re le style et l'infobulle
          $this.toggleClass("active",false).tooltip("option","content","Afficher la l�gende");
         }
       else {
          // Aucun autre control deja actif
          if ($(".button-panel.active").length === 0) { $ui.toggle({duration:200}); }
          // On masque la s�lection
          $(".selection-ui").hide();
          // On affiche la l�gende
          $(".layers-ui").show();
          // Etat des autres boutons g�rant l'affichage du panel
          $(".button-panel").toggleClass("active",false);
          // On g�re le style et l'infobulle
          $this.toggleClass("active",true).tooltip("option","content","Masquer la l�gende");
          // Actualisation de la l�gende
          carte.LegendeAfficher();
         }
       // R�sultat
       return false;
      });

    // Panel sur information de s�lection
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
          // On g�re le style et l'infobulle
          $this.toggleClass("active",false).tooltip("option","content","Afficher les informations de s�lection");
         }
       else {
          // Aucun autre control deja actif
          if ( $(".button-panel.active").length === 0) { $ui.toggle({duration : 200 }); }
          // On masque la l�gende
          $(".layers-ui").hide();
          // On affiche la s�lection
          $(".selection-ui").show();
          // Etat des autres boutons g�rant l'affichage du panel
          $(".button-panel").toggleClass("active",false);
          // On g�re le style et l'infobulle
          $this.toggleClass("active",false).tooltip("option","content","Masquer les informations de s�lection");
         }
       // R�sultat
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
       // S�lection effective
       selection : function (res) {   
          // Type de donn�es
          if (res.type === "Quartier") {
             // Ajout du quarteir � la carte
             carte.SelectionAjouterObjet({table:"GENSECT1", gid:res.gid , zoom:true});
             // On retire le quartier de la s�lection
             window.setTimeout(function() {carte.SelectionRetirerObjet({table:"GENSECT1", gid:res.gid});},2500);
            }
          else{
             // Zoom sur un �quipment
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
    // D�sactivation des icones actives     
    $("#" + this.idCarte).find(".control-button").toggleClass("active",false); 
  };
  
/*
 * function: PanelSelectionAfficher
 * Affichage du volet droit de s�lection
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
    // Les interfaces sont d�ja charg�es
    if($("#"+this.idCarte).find("div.panel-control").length > 0) { return; }
    // Options par d�faut
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

    // Options sp�cifi�es
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
       html += ' <a class="control-button button-zoomout" href="#" title="Zoom arri�re"> <span class="icon zoomout"></span></a>';
       if (param.zoom.cadre)   { html += '<a class="control-button button-cadre"   href="#" title="Zoom par cadre" id="btnZoomParCadre"> <span class="icon cadre"></span></a>'; }
       if (param.zoom.adresse) { html += '<a class="control-button button-adresse" href="#" title="Localisation par adresse"> <span class="icon adresse"></span> </a>'; }
       html += '  </div>';
      }

    // Groupe l�gende / information
    if (param.legende || param.information) {
       html += '<div class="panel-control close-affichage">';
       if (param.legende)     { html += '<a class="control-button button-panel button-legende" href="#" title="Afficher la l�gende"><span class="icon legende"></span></a>'; }
       if (param.information) { html += '<a class="control-button button-panel button-selection" href="#" title="Afficher les informations de s�lection"><span class="icon information"></span></a>'; }
       // Les boutons m�tiers seront group�s avec kles
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
       html += '   <a class="control-button button-selection" href="#" title="S�lection"> <span class="icon deplacer"></span></a>';
       html += '   <a class="control-button button-geometrie"  href="#" title="S�lection"> <span class="icon geometrie"></span></a>';
       html += '  </div>';
       }


    html += ' </div>';
    html += '</div>';
    //
    $("#"+this.idCarte).prepend(html);

    // Les interfaces sont d�ja charg�es
    if($("#map-ui").length === 0) {  
       // Panel droit
       html =  '<div id="map-ui" class="map-ui" style="display:none;">';
       html += '  <div class="layers-ui">';
       html += '    <div class="sidebar_heading">';
       html += '      <span class="icon close">Fermer</span>';
       html += '      <span><b>L�gende</b></span>';
       html += '    </div>';
       html += '    <div class="base-layers" id="widLegende"></div>';
       html += '  </div>';
       html += '  <div class="selection-ui">';
       html += '    <div class="sidebar_heading">';
       html += '      <span class="icon close">Fermer</span>';
       html += '      <span class="ui-titre"><b>S�lection</b></span>';
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
       // Ajout � la carte
       $("#"+this.idCarte).prepend(html);
      }
   };

/*
 * function: AffichageListerCoucheVisible
 * Liste les couches et th�matiques visibles
 */
VseCarte.prototype.IhmMenuConstruire= function (options) {
    // Variables
    var carte = this, fdpImage = false, ico, $input, $option, widget, $widThematique;
    // Initialisation des options
    if (options === undefined) { options = {}; }
    // Option de tri par d�faut
    if (options.tri === undefined) { options.tri = false; }

    // Slider pour opacit� des fonds de plan
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

    // Slider pour opacit� des donn�es th�matiques
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
             // Etat des cases � cocher
             window.WidgetEtatFixer("IMG_TEXTE",image);
             window.WidgetEtatFixer("IMG_THEME_CAD",image);
             // Visibilit� des couches
             carte.CoucheVisibiliteFixer("IMG_TEXTE",( $("#IMG_TEXTE").prop("checked")  && image));
             carte.CoucheVisibiliteFixer("CAD_CLAIR",( $("#IMG_THEME_CAD").prop("checked")  && image));
            }
          // Gestion des th�matiques
          carte.IhmSelectionGerer();
          // Actualisation de la l�gende
          carte.LegendeActualiser();
         });
       // Ajout de la balise de liste et du label
       $option = $("<li/>").append($input).append("<label for='" + fdp.id + "'>" + fdp.nom + "</label>");
       // Widget dans lequel placer l'item
       widget = (fdp.widget !== undefined) ? fdp.widget : carte.options.widgets.listeFdp;
       // Ajout � la liste
       $("#" + widget).prepend($option);
      });

    // Pas d'image associ�es aux fdp
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
       // Gestion des �v�nements
       $("#IMG_TEXTE").click(function () {carte.CoucheVisibiliteFixer("IMG_TEXTE",this.checked);});
       $("#IMG_THEME_CAD").click(function () {carte.CoucheVisibiliteFixer("CAD_CLAIR",this.checked);});
       // D�sactivation des widgets
       window.WidgetEtatFixer("IMG_TEXTE",false);
       window.WidgetEtatFixer("IMG_THEME_CAD",false);
      }

    //
    $widThematique = $("#" + carte.options.widgets.listeThematique);
    // M�mo des th�lmatiques sur la carte
    carte.thematiques = options.thematiques;
    // Parcours des th�matiques
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

       // Parcours des couches du th�matique
       $(thematique.couches).each(function (i,couche) {
          // Variables
          var style, nb_sous_couche, nb_representations;
          // Style pour dernier item sans bordure
          style = (i === (nb_couches - 1)) ? 'style="border:0;"' : '';
          //  Cr�ation de l'item
          html += '<li class="couche" '+ style +' >';
          if (couche.ihm && couche.ihm.tableau) {
          
             html += '<a href="#" class="table_donnees" data-table="' + couche.ihm.tableau.table + '" style="float:right;" title="Table des donn�es"></a>';
            }
            
         if (couche.ihm && couche.ihm.inventaire) {
          
             html += '<a href="#" class="metadonnees_donnees" data-gid="' + couche.ihm.inventaire.gid + '" style="float:right;" title="Description des donn�es"></a>';
            }
            
            
          html += '<input id="menu_' + couche.id + '" data-type="couche" data-id="' + couche.id + '" data-thematique="' + thematique.id  +  '" type="checkbox"/>';
          html += '<label for="menu_' + couche.id + '">' + couche.nom + '</label>';

          // La couche poss�des des repr�sentarions
          if (couche.representations) {
             // Nombre de rep�sentations
             nb_representations = couche.representations.length;
             // Initialition du groupe
             html += '<ol style="display:none;">';
             // Parcours des repr�sentations
             $(couche.representations).each(function (i,representation) {
                // Style pour dernier item sans bordure
                var style = (i === (nb_representations - 1)) ? 'style="border:0;"' : '';
                // M�mo du composant sur la repr�sentation
                representation.composant = couche.composant;
                representation.nom_couche = couche.nom;
                // Cr�ation de l'item
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
                // Cr�ation de l'item
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

    // Tri des items de l'affichage th�matique principal
    $widThematique.children('li').sortElements(function(a, b){
       // On explote le texte du label
       return $(a).find("label").text() > $(b).find("label").text() ? 1 : -1;
      });

    // Clic sur un th�matique
    $('input[data-type="thematique"], input[data-type="couche"], input[data-type="representation"]').click(function() {
       // Donn�es de l'item
       var data = $(this).data();
       // Gestion de l'affichage et de l'arbre
       carte.CoucheAfficher(data.id,this.checked);
       // Actualisation de la l�gende
       carte.LegendeActualiser();
      });

    // Gestion
    carte.IhmMetierGerer();
    // Compsoant s�lectionnable
    carte.IhmSelectionGerer();

    // Compatibilit� avec anceinne version
    if (!carte.thematiques) {
       // Parcours des couches
       $(carte.couches).each(function(i,couche) {
          // Variables
          var disabled, option, $texte;
          // Cas d'une couche toujours visible
          disabled = (couche.toujoursVisible === "oui")  ? " disabled='disabled' " : "";
          // Case � cocher
          $input = $("<input id='ihm_" + couche.id + "'" + disabled + " type='checkbox' couche_id='"+ couche.id +"'/>");
          // Visibilit� de la couche
          if (couche.visibility) { $input.attr("checked","checked"); }
          // Ev�nement sur clic : affichage de la couche
          $input.click(function () {
             // Visibilit� de la couche
             carte.CoucheVisibiliteFixer( $(this).attr("couche_id"),this.checked);
            });
          // Cas des groupements de couche
          if (couche.fdp === true) {
             // �v�nement sur clic : affichage de la couche
             $input.click(function () {
                // Gestion des s�lections
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
          // Ajout � la liste
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
             // On affiche le contr�le
            // appli.carte.PanelSelectionAfficher();        
             // On ajoute l'objet au plan de s�lection
             appli.carte.SelectionAjouterObjet({table:param.table, gid:arg.gid , champ:appli.geometry, ajouterListe:true });
             // On ne ferme pas la fen�tre
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
    // Widget qui liste les composant s�lectionnables
    $widget = $('#' + carte.options.widgets.selectionCouche);
    // Pas de gestion de s�lection : on arr�te la
    if ($widget.length === 0) { return; }
    // On vide la liste
    $widget.find('option').remove();
    // Ajout � la liste de l'option par d�faut
    $widget.append( $("<option value='' selected='selected'>S�lectionner une couche</option>") );

    $widget.append( $("<option value='vider'>Vider la s�lection</option>") );

    // Parcours des fonds de plan
    $(carte.fdp).each(function(i,fdp) {
       // Le th�matique est visible
       if (fdp.layer.visibility) {
          //
          if (fdp.id === "PLV") {
             carte.IhmSelectionCouche({id:'GENBRBAT', 'nom' : 'Sites et �quipements', table:"GENBRBAT"},$widget);
             carte.IhmSelectionCouche({id:'VOITRONC', 'nom' : 'Tron�ons de voie', table:"VOITRONC"},$widget);
            }
          //
          if (fdp.id === "CAD") {
             carte.IhmSelectionCouche({id:'CADPARCE', 'nom' : 'Parcelle cadastrale', table:"CADPARCE"},$widget);
             carte.IhmSelectionCouche({id:'CADBATDU', 'nom' : 'B�timent cadastral' , table:"CADBATDU"},$widget);
            }
         }
      });

    // Parcours des couches
    $(carte.couches).each(function(i,couche) {
       // La couche est visible
       if (couche.visibility === true) {
          // On active le th�matique
          carte.IhmSelectionCouche(couche,$widget);
         }
      });

    // Tri des items
    $widget.find("option[value!=][value!='vider']").sort(function(a,b){return (a.text) > (b.text) ? 1 : -1;}).remove().appendTo($widget);
   };

/*
 * function: IhmSelectionCouche
 * Liste des composants s�lectionnables
 */
VseCarte.prototype.IhmSelectionCouche= function (couche,$widget) {
    // Variables
    var nom, $option;
    // Couche kml on ne fait rien
    if ((couche.kml === true) || (couche.selection === false)) { return; }
    // La couche ne poss�de pas de composants associ�s
    if (!couche.composants && (couche.fdp !== true)) {
       // Libelle de la couche
       nom = couche.nom_couche || couche.nom;
       // Item
       $option = $("<option>"+ nom +"</option>").attr("value",couche.table).attr("geometry",couche.geometry);
       // Ajout � la liste
       $widget.prepend($option);
      }
    else {
       // Parcours des composant de la couhe
       $(couche.composants).each(function(i,composant) {
          // Le composant est s�lectionnable
          if (composant.selection !== false) {
             // Item
             $option = $("<option>"+ composant.nom +"</option>").attr("value",composant.id).attr("geometry",composant.geometry);
             // Ajout � la liste
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
    // On masque tous les traitements m�tiers
    $metiers.find("li.menu_metier").hide();
    // Menu cadastre sp�cifique
    $widMetier = $("#widMetierCAD");
    // On le masque
    $widMetier.attr("visible","non").hide();
    // On l'affiche si on est avec le fdp cadastre
    if (this.FdpActif() === "CAD") { $widMetier.attr("visible","oui").show(); }

    // Parcours des th�matiques
    $(this.thematiques).each(function (i,thematique) {
       // Variables
       var $widgetThematique, $widMetier;
       // Widget correspondant au th�matique
       $widgetThematique = $("#menu_" + thematique.id);
       // Widget corrrspondant au menu metier du th�matique
       $widMetier = $("#widMetier" + thematique.id);
       // Elle est pr�sente
       if ($widMetier.length > 0) {
          // Test du th�matique
          if ($widgetThematique.prop("checked")) {
             // On affiche le metier et on renseigne l'attribut d�di�
             $widMetier.attr("visible","oui").show();
            }
          else {
             // On masque le metier et on renseigne l'attribut d�di�
             $widMetier.attr("visible","non").hide();
            }
         }
      });

    // On affiche les m�tiers sans th�matique associ�
    $metiers.find("li.sans_thematique").attr("visible","oui").show();
    // On affiche l'information sur aucune fonction disponible
    if ($metiers.find("li.menu_metier[visible='oui']").length === 0) {
       // On affiche le widget d�di�
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
    // Parcours des th�matiques
    $(carte.thematiques).each(function (i,thematique) {
       // Variables
       var $ol, $widget ;
       // On est sur le th�matique
       if (thematique.id === id) {
          // Case � cocher correspondant
          $widget = $("#menu_" + id);
          // Liste des couches du th�matique
          $ol = $widget.siblings('ol');
          //
          if (etat) {
             // On affiche le bloc fils
             $ol.show(200);
             // Parcours des couches du th�matique
             $(thematique.couches).each(function (i,couche) {
                // La couche poss�de des couches
                if (couche.couches) {
                    // Parcours des couches pour les masques
                   $(couche.couches).each(function (i,sous_couche) {
                      // Widget correspondant
                      $widget = $("#menu_" + sous_couche.id);
                      // Ajout des quartiers de proximit�
                      carte.CoucheVisibiliteFixer(sous_couche.id, $widget.prop("checked"));
                     });
                   //
                   return;
                  }

                // La couche poss�de des repr�sentations
                if (couche.representations) {
                   //
                   $widget = $("#menu_" + couche.id);
                   // Une des repr�sentations est active
                   if ($widget.prop("checked")) {
                      // Parcours des repr�sentations pour les masques
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
                // Couche g�ographique
                carte.CoucheVisibiliteFixer(couche.id,$widget.prop("checked"));
               });
            }
          else {
             // On masque le d�tail du th�matique
             $ol.hide(200);
             // Parcours des couches du th�matique
             $(thematique.couches).each(function (i,couche) {
                // La couche poss�de des repr�sentations
                if (couche.couches) {
                   // Parcours des repr�sentations pour les masques
                   $(couche.couches).each(function (i,sous_couche) {
                      // Ajout des quartiers de proximite
                      carte.CoucheVisibiliteFixer(sous_couche.id,false);
                     });
                   //
                   return;
                  }

                // La couche poss�de des repr�sentations
                if (couche.representations) {
                   // Parcours des repr�sentations pour les masques
                   $(couche.representations).each(function (i,representation) {
                      // Ajout des quartiers de proximite
                      carte.CoucheVisibiliteFixer(representation.id,false);
                     });
                   //
                   return;
                  }

                // Couche g�ographique
                carte.CoucheVisibiliteFixer(couche.id,false);
               });
            }
          // Menu metiers
          carte.IhmMetierGerer();
          // Composant s�lectionnables
          carte.IhmSelectionGerer();
          // Fin
          return;
         }

       // Parcours des couches du th�matique
       $(thematique.couches).each(function (i,couche) {
          // Variables
          var $input, $ol, $widget;
          // Couche ou groupe de couche
          if (couche.id === id) {
             // La couche poss�de des repr�sentations
             if (couche.representations) {
                // Case � cocher correspondant � la couche
                $widget = $("#menu_"+id);
                // liste des repr�sentations
                $ol = $widget.siblings('ol');
                // Etat � traiter
                if (etat === true) {
                   // On affiche les repr�sentations
                   $ol.show(500);
                   // Item d�j� s�lectionn�
                   $input = $ol.find("input:checked");
                   // On prend le premier item si aucun n'est s�lectionn�
                   if ($input.length === 0) { $input = $ol.find("input:first"); }
                   // Ajout des quartiers de proximite
                   carte.CoucheAfficher($input.attr("data-id"),true);
                  }
                else {
                   // On masque la les repr�sentations
                   $ol.hide(500);
                   // Parcours des repr�sentations pour les masques
                   $(couche.representations).each(function (i,representation) {
                      // Ajout des quartiers de proximite
                      carte.CoucheVisibiliteFixer(representation.id,false);
                     });
                  }
                return;
               }

             // La couche est un groupement de couches
             if (couche.couches) {
                // Case � cocher correspondant � la couche
                $widget = $("#menu_"+id);
                // On affiche les repr�sentations
                $ol = $widget.siblings('ol');
                // Etat � traiter
                if (etat === true) {
                   // On affiche le souc couches
                   $ol.show(500);
                   // Parcours des repr�sentations pour les masques
                   $(couche.couches).each(function (i,sous_couche) {
                      // Variables
                      var etat, $widget;
                      // Wideet correspondant
                      $widget = $("#menu_"+sous_couche.id);
                      // Etat coch�
                      etat = $widget.prop("checked");
                      // Ajout de la couche
                      if (etat === true) { carte.CoucheCharger(sous_couche); }
                      // Visivilit� de la couche fonction de l'�tat  du widget
                      carte.CoucheVisibiliteFixer(sous_couche.id,etat);
                     });
                  }
                else {
                   // On masque les sous couches
                   $ol.hide(500);
                   // Parcours des repr�sentations pour les masques
                   $(couche.couches).each(function (i,sous_couche) {
                      // On masque les couches
                      carte.CoucheVisibiliteFixer(sous_couche.id,false);
                     });
                  }
                return;
               }

             // On coche la case correspondante � la couche
             $("#menu_" + couche.id).prop("checked",etat);
             // On, coche le th�matique et on affiche ses fils
             $("#menu_" + thematique.id).prop("checked",true).siblings('ol').show();
             // Ajout de la couche
             carte.CoucheCharger(couche);
             // Affichage
             carte.CoucheVisibiliteFixer(couche.id,etat);
             // Gestion des metiers
             carte.IhmMetierGerer();
             // Compsoant s�lectionnables
             carte.IhmSelectionGerer();
             // On arr�te la
             return;
            }

          // Test des repr�sentations
          if (couche.representations) {
             // Parcours des repr�sentations
             $(couche.representations).each(function (i,representation) {
                // Variables
                var $couche, $radios, $widget;
                // On est sur la repr�sentation � traiter
                if (representation.id === id) {
                   // Parcours des couches pour effacer celle de la m�me table
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
                   // Nombre de cases � coches
                   $radios = $couche.parent().find("input:checked");
                   //
                   $couche.prop("checked", ($radios.length > 0) );
                   //
                   if (etat === true) {
                      //
                      $couche.siblings('ol').show();
                      // On coche le th�matique et on affiche ses fils
                      $("#menu_" + thematique.id).prop("checked",true).siblings('ol').show();
                     }
                   // Gestion des metiers
                   carte.IhmMetierGerer();
                   // Composant s�lectionnables
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
                   // On coche la case correspondante � la couche
                   $("#menu_" + sous_couche.id).prop("checked",etat);
                   // On, coche le th�matique et on affiche ses fils
                   $("#menu_" + couche.id).prop("checked",true).siblings('ol').show();
                    // On coche le th�matique et on affiche ses fils
                   $("#menu_" + thematique.id).prop("checked",true).siblings('ol').show();
                   // Ajout des quartiers de proximite
                   carte.CoucheCharger(sous_couche);
                   // Ajout des quartiers de proximite
                   carte.CoucheVisibiliteFixer(sous_couche.id,etat);
                   // Gestion des metiers
                   carte.IhmMetierGerer();
                   // Compsoant s�lectionnable
                   carte.IhmSelectionGerer();
                   // Fin
                   return;
                  }
               });
            }
         });
      });
   };