/**
 * Class: VseConfig
 * Configuration générale d'une carte VSE
 */
function VseConfig (id_carte) {
    /**
     * Property: id_carte
     * {Texte} Identifiant du widget
     */
    this.id_carte = id_carte;

    /**
     * Property: espace
     * {Texte} Espace de nom geoserver
     */
    this.espace = "vse";

    /**
     * Property: id_carte
     * {Texte} Identifiant du widget
     */
    this.contexte = intra_wm.contexte;
    
    /**
     * Property: urlWebAppli
     * {Texte} Adresse du serveur géographique (Geoserver)
     */
    this.urlWebAppli = intra_wm.urlWebAppli;

    /**
     * Property: urlWebSig
     * {Texte} Adresse du serveur applicatif
     */
    this.urlWebSig = intra_wm.urlWebSig;

    /**
     * Property: wfs
     * {Texte} Adresse du serveur wfs
     */
    this.wfs = intra_wm.wfs;

    /**
     * Property: wfs
     * {Texte} Adresse du serveur wms
     */
    this.wms = intra_wm.wms;

    /**
     * Property: gwc
     * {Texte} Adresse du serveur geowebcache
     */
    this.gwc = intra_wm.gwc;
    
    /**
     * Property: projection
     * {Texte} Projection par défaut
     */
    this.projection = intra_wm.projection;
    
    /**
     * Property: displayProjection
     * {Texte} Projection des coordonnées affichées
     */
    this.displayProjection = intra_wm.projection;
    
    /**
     * Property: maxExtent
     * {OpenLayers.Bounds} Etendue géographique de base
     */
    this.maxExtent= intra_wm.bounds;

    /**
     * Property: maxResolution
     * {Reel} Résolution maximale
     */
    this.maxResolution = intra_wm.maxResolution;
    
    /**
     * Property: numZoomLevels
     * {Entier} Nombre de seuil zoom
     */
    this.numZoomLevels = 11;

    /**
     * Property: format
     * {Texte} Format des images renvoyées
     */
    this.format = "image/png8";
    
    /**
     * Property: geometryName
     * {Texte} Nom de la colonne gémétrique par défaut
     */
    this.geometryName = intra_wm.geometryName;
   }