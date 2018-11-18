/**
 * Class: VseConfig
 * Configuration g�n�rale d'une carte VSE
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
     * {Texte} Adresse du serveur g�ographique (Geoserver)
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
     * {Texte} Projection par d�faut
     */
    this.projection = intra_wm.projection;
    
    /**
     * Property: displayProjection
     * {Texte} Projection des coordonn�es affich�es
     */
    this.displayProjection = intra_wm.projection;
    
    /**
     * Property: maxExtent
     * {OpenLayers.Bounds} Etendue g�ographique de base
     */
    this.maxExtent= intra_wm.bounds;

    /**
     * Property: maxResolution
     * {Reel} R�solution maximale
     */
    this.maxResolution = intra_wm.maxResolution;
    
    /**
     * Property: numZoomLevels
     * {Entier} Nombre de seuil zoom
     */
    this.numZoomLevels = 11;

    /**
     * Property: format
     * {Texte} Format des images renvoy�es
     */
    this.format = "image/png8";
    
    /**
     * Property: geometryName
     * {Texte} Nom de la colonne g�m�trique par d�faut
     */
    this.geometryName = intra_wm.geometryName;
   }