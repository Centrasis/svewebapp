import React from 'react';
import { SVEDataType, SVEDataVersion, SVEData, SVEClassificator, AIClass } from 'svebaselib';
import { Block, Row, Link, Icon, Col, Preloader, Popup, Page, BlockTitle, List, ListInput, ListItem, Input, BlockHeader } from 'framework7-react';
import Dom7 from 'dom7';
import { f7, f7ready, theme } from 'framework7-react';
import { getDevice } from 'framework7';

export enum Sorting {
    AgeASC,
    AgeDESC,
    UploadASC,
    UploadDESC
}

export type MediaSettings = {
    data: SVEData[],
    caption?: string,
    sortBy?: Sorting,
    enableDeletion?: boolean,
    enableFavorization?: boolean,
    enableDownload?: boolean,
    enableClassification?: boolean,
    displayCount?: number,
    displayCountIncrement?: number,
    onDeleteMedia?: (id: number) => void,
    /** Display or return media */
    shouldReturnSelectedMedia?: boolean,
    onSelectMedia?: (media?: SVEData) => void
};

export type MediaTileSettings = {
    media: SVEData,
    enableDeletion?: boolean,
    enableFavorization?: boolean,
    enableDownload?: boolean,
    enableClassification?: boolean,
    onDeleteMedia?: (media: SVEData) => void,
    onSelectMedia?: (media?: SVEData) => void,
    onClassifyMedia?: (media: SVEData) => void,
    onFavoritizeMedia?: (media: SVEData) => void,
    onDownloadMedia?: (media: SVEData) => void,
};

class MediaTile extends React.Component<MediaTileSettings & React.HTMLAttributes<HTMLCanvasElement> ,{}> {
    render () {  
        return (
            <div className="imgHoverContainer middle" style={{
                width: "100%",
                height: "100%",
                maxWidth: "inherit",
                maxHeight: "inherit",
                padding: "1vw",
                backdropFilter: "drop-shadow(4px 4px 10px green)"
            }}>
                {(this.props.media.isClassfied()) ? <BlockHeader>Klasse: {this.props.media.getClassName()}</BlockHeader> : ""}
                    <Row className="row text-align-center" style={{width: "100%", height: "100%", maxWidth: "inherit", maxHeight: "inherit"}}>
                        <Col>
                            <img
                                className="middle"
                                src={this.props.media.getURI(SVEDataVersion.Preview)}
                                onClick={this.props.onSelectMedia.bind(this, this.props.media)}
                                style={{
                                    cursor: "pointer",
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    width: "100%",
                                    height: "auto",
                                    objectFit: "contain",
                                    backfaceVisibility: "hidden",
                                    opacity: (this.props.media.getType() == SVEDataType.Image) ? "1.0" : "0.5"
                                }}
                            />
                            {(this.props.media.getType() === SVEDataType.Video) ?
                                <div className="overlay" style={{cursor: "pointer"}}>
                                    <Link href="#" onClick={this.props.onSelectMedia.bind(this, this.props.media)}>
                                        <Icon f7="play_circle_fill" tooltip="Abspielen"></Icon>
                                    </Link>
                                </div>
                            : ""}
                        </Col>
                    </Row>
                    <Row className="row text-align-center">
                        <Col>
                        {(this.props.enableFavorization) ? 
                            <Link href="#" onClick={this.props.onFavoritizeMedia.bind(this, this.props.media)}>;
                                <Icon f7={(false) ? "star_slash_fill" : "star_fill"} tooltip="Datei (ent-)favorisieren"></Icon>;
                            </Link>
                        : ""}
                        </Col>
                        <Col>
                        {(this.props.enableDownload) ? 
                            <Link href="#" onClick={this.props.onDownloadMedia.bind(this, this.props.media)}>
                                <Icon f7="cloud_download" tooltip="Herunterladen"></Icon>
                            </Link>
                        : "" }
                        </Col>
                        {(this.props.enableClassification) ? 
                            <Col>
                                <Link href="#" onClick={() => { this.props.onClassifyMedia(this.props.media); this.forceUpdate(); }}>
                                    <Icon f7="cube" tooltip="Datei klassifizieren"></Icon>
                                </Link>
                            </Col>
                        : ""}
                        <Col>
                        {(this.props.enableDeletion) ? 
                            <Link href="#" onClick={this.props.onDeleteMedia.bind(this, this.props.media)}>
                                <Icon f7="trash" tooltip="Datei entfernen"></Icon>
                            </Link>
                        : ""}
                        </Col>
                    </Row>
            </div>
        );
    }
}

export default class MediaGallery extends React.Component<MediaSettings & React.HTMLAttributes<HTMLCanvasElement>, {}> {
    protected data: SVEData[] = [];
    protected displayCount: number = NaN;
    protected displayCountIncrement: number = 10;
    protected caption: string = "";
    protected enableDeletion: boolean = false;
    protected enableFavorization: boolean = false;
    protected enableClassification: boolean = false;
    private classificationItem: SVEData = undefined;
    private classes: AIClass[] = [];
    private newClassName: string = "";
    private selectedClass: number = NaN;
    protected enableDownload: boolean = true;
    protected sortBy: Sorting = Sorting.AgeASC;
    protected onDeleteMedia: (id: number) => void = (id: number) => {};
    protected favoriteImgs: Set<number> = new Set<number>();
    protected toastFavIcon = null;
    protected toastDeleteIcon = null;
    protected infiniteActive: boolean = false;
    protected shouldReturnSelectedMedia: boolean = false; //display media instead
    protected onSelectMedia: (media?: SVEData) => void = (media?: SVEData) => {};
    protected sortedImages: SVEData[] = [];

    updateProps() {
        this.data = this.props.data;

        if (this.props.sortBy)
        {
            this.sortBy = this.props.sortBy;
        }

        if (this.props.shouldReturnSelectedMedia)
        {
            this.shouldReturnSelectedMedia = this.props.shouldReturnSelectedMedia;
        }

        if (this.props.onSelectMedia)
        {
            this.onSelectMedia = this.props.onSelectMedia;
        }

        if (this.props.onDeleteMedia)
        {
            this.onDeleteMedia = this.props.onDeleteMedia;
        }

        if (this.props.displayCount)
        {
            this.displayCount = (this.displayCount <= 0 || isNaN(this.displayCount)) ? this.props.displayCount : this.displayCount;
        } else {
            this.displayCount = (this.displayCount <= 0 || isNaN(this.displayCount)) ? 10 : this.displayCount;
        }

        if (this.props.displayCountIncrement)
        {
            this.displayCountIncrement = this.props.displayCountIncrement;
        }

        if (this.props.enableDeletion)
        {
            this.enableDeletion = this.props.enableDeletion;
        }

        if (this.props.enableClassification)
        {
            this.enableClassification = this.props.enableClassification;
        }

        if (this.props.enableDownload)
        {
            this.enableDownload = this.props.enableDownload;
        }

        if (this.props.caption)
        {
            this.caption = this.props.caption;
        }

        if (this.props.enableFavorization)
        {
            this.enableFavorization = this.props.enableFavorization;
        }

        this.sortedImages = [];
        if (this.sortBy == Sorting.AgeASC) {
            this.sortedImages = this.data.sort((a: SVEData, b: SVEData) => a.getCreationDate().getTime() - b.getCreationDate().getTime());
        }
        if (this.sortBy == Sorting.AgeDESC) {
            this.sortedImages = this.data.sort((a: SVEData, b: SVEData) => b.getCreationDate().getTime() - a.getCreationDate().getTime());
        }
        if (this.sortBy == Sorting.UploadASC) {
            this.sortedImages = this.data.sort((a: SVEData, b: SVEData) => a.getLastAccessDate().getTime() - b.getLastAccessDate().getTime());
        } 
        if (this.sortBy == Sorting.UploadDESC) {
            this.sortedImages = this.data.sort((a: SVEData, b: SVEData) => b.getLastAccessDate().getTime() - a.getLastAccessDate().getTime());
        }

        this.sortedImages = this.sortedImages.slice(0, (this.displayCount <= this.sortedImages.length) ? this.displayCount : this.sortedImages.length);
    }

    getTiledView(cols: number = 3): SVEData[][] {
        let ret: SVEData[][] = [];

        if (this.sortedImages.length > cols) {
            for(let i = 0; i < this.sortedImages.length - cols; i+=cols) {
                let col: SVEData[] = [];
                for(let j = i; j < i + cols; j++) {
                    col.push(this.sortedImages[j]);
                }

                ret.push(col);
            }

            if (this.sortedImages.length % cols !== 0) {
                let col: SVEData[] = [];
                for(let j = this.sortedImages.length - Math.floor(this.sortedImages.length / cols); j < this.sortedImages.length; j++) {
                    col.push(this.sortedImages[j]);
                }

                ret.push(col);
            }
        } else {
            ret.push(this.sortedImages);
        }

        return ret;
    }

    componentDidUpdate() {
        Dom7('#'+this.props.id + "-Infinity-Loader").hide();
        this.updateProps();
    }

    UNSAFE_componentWillUpdate() { 
        this.updateProps();
        f7ready((f7) => {});
    }

    componentDidMount() {
        this.toastFavIcon = f7.toast.create({
            icon: '<i class="f7-icons">star</i>',
            text: 'Favorisiert',
            position: 'center',
            closeTimeout: 1000,
        });

        this.toastDeleteIcon = f7.toast.create({
            icon: '<i class="f7-icons">trash</i>',
            text: 'Gelöscht',
            position: 'center',
            closeTimeout: 1000,
        });

        this.updateProps();

        this.registerScrollListeners();

        if (this.enableClassification)
            this.getClasses();
    }

    render () {   
        return <Block strong style={{overflow: "scroll", overflowX: "hidden", position: "absolute", top: "5%", left: "0", right: "0", bottom: "0", display: "block"}} className={this.props.id + "-scrollBox"}>
            {(!getDevice().desktop) ? (
                <div>
                    {this.sortedImages.map((image: SVEData) => (
                        <Block style={{display: "flex", justifyContent: "center", alignContent: "center", paddingBottom: "1em", textAlign: "center"}}>
                            <MediaTile style={{maxWidth: "400px"}} media={image} onSelectMedia={this.onSelectMedia.bind(this)}/>
                        </Block>
                    ))}
                </div>
                ) : (
                    <div>
                    {this.getTiledView().map((row: SVEData[]) => (
                        <Row style={{maxHeight: "33vh", overflow: "hidden"}}>
                            {row.map((image: SVEData) => (
                                <Col style={{maxWidth: "33vw", overflow: "hidden"}} className="text-align-center">
                                    <MediaTile 
                                        media={image} 
                                        onSelectMedia={(m) => this.onClickImage(m)} 
                                        onDeleteMedia={(m) => this.deleteFromServer(m)}
                                        onFavoritizeMedia={(m) => {
                                            if(m.getID() in this.favoriteImgs) {
                                                this.removeStar(m);
                                            } else {
                                                this.markWithStar(m);
                                            }
                                        }}
                                        onDownloadMedia={(m) => this.saveImageToDevice(m)}
                                        onClassifyMedia={(m) => { this.classificationItem = m; this.forceUpdate(); }}
                                        enableDeletion={this.enableDeletion}
                                        enableClassification={this.enableClassification}
                                        enableFavorization={this.enableFavorization}
                                        enableDownload={this.enableDownload}
                                        style={{
                                            margin: "0 auto", 
                                            padding: "10px", 
                                            display: "block", 
                                            marginLeft: "auto", 
                                            marginRight: "auto",
                                            width: "400px"
                                            }} />
                                </Col>
                            ))}
                        </Row>
                    ))}
                    </div>
                )}
                    <Preloader color="#11a802" className="preloader infinite-scroll-preloader" id={this.props.id + "-Infinity-Loader"}></Preloader>

                    <Popup swipeToClose opened={this.classificationItem !== undefined} onPopupClosed={() => {this.newClassName = ""; this.classificationItem = undefined; this.forceUpdate();}}>
                        <Page>
                            <BlockTitle large style={{justifySelf: "center"}}>Klasse zuweisen</BlockTitle>
                            <List>
                            <ListInput
                                type="text"
                                placeholder={"Neue Klasse"}
                                value={this.newClassName}
                                validate
                                onValidate={() => {
                                    return this.classes.filter(e => e.class === this.newClassName).length === 0;
                                }}
                                errorMessage="Klasse ist bereits vorhanden!"
                                clearButton
                                onInput={(e) => {
                                    this.newClassName = e.target.value;
                                    this.forceUpdate();
                                }}
                            />
                            <ListInput
                                label="Klasse"
                                type="select"
                                value={this.selectedClass}
                                onInput={(e) => {
                                    this.selectedClass = Number(e.target.value);
                                    this.newClassName = "";
                                    this.forceUpdate();
                                }}
                            >
                                <option value={NaN}>
                                    Neue Klasse
                                </option>
                                {this.classes.map(doc => (
                                    <option value={doc.key}>{doc.class}</option>
                                ))}
                            </ListInput>
                                <ListItem
                                    title={"Zuweisen"}
                                    onClick={this.classify.bind(this)}
                                    style={{cursor: "pointer"}}
                                >
                                    <Icon slot="media" f7="folder_badge_plus"></Icon>
                                </ListItem>
                            </List>
                        </Page>
                    </Popup>
                </Block> 
      }

      getClasses() {
          SVEClassificator.getClasses("documents").then(ret => {
            this.classes = ret;
            this.forceUpdate();
          });
      }

      classify() {
        let getClassName = () => {
            if (isNaN(this.selectedClass)) 
                return this.newClassName;

            console.log("Selected classnr: " + this.selectedClass);
            
            let classesSameName = this.classes.filter((v) => v.key === this.selectedClass);
            if (classesSameName.length > 0)
                return classesSameName[0].class;
            
            return "";
        }

        let className = getClassName();
        if(className.length > 0) {
            SVEClassificator.classify("documents", this.classificationItem, className).then(() => {
                if (isNaN(this.selectedClass)) {
                    this.getClasses();
                }
            });
        } else {
            f7.dialog.alert("Klassenname darf nicht leer sein!");
            return;
        }

        this.newClassName = "";
        this.classificationItem = undefined;
        this.forceUpdate();
    }

      saveImageToDevice(img: SVEData) {
        window.open(img.getURI(SVEDataVersion.Full, true), "_system");
      }

      scrollHandler(evt) {
        var element = evt.target;
        if(element.scrollHeight - element.scrollTop === element.clientHeight)
        {
          this.infinityScroll();
        }
      }

      registerScrollListeners() {
        var $$ = Dom7;
        $$('.' + this.props.id + "-scrollBox").off("scroll", this.scrollHandler.bind(this));
        $$('.' + this.props.id + "-scrollBox").on("scroll", this.scrollHandler.bind(this));
      }

      infinityScroll() {
        var self = this;
        var $$ = Dom7;
    
        // Exit, if loading in progress
        if (this.infiniteActive) return;
      
        // Set loading flag
        this.infiniteActive = true;
    
        $$('#'+this.props.id + "-Infinity-Loader").show();
    
        this.displayCount += this.displayCountIncrement;

        console.log("Update display count: " + this.displayCount);
      
        // Emulate 1s loading
        setTimeout(function () {
          // Reset loading flag
          self.infiniteActive = false;
          $$('#'+self.props.id + "-Infinity-Loader").hide();
        }, 1000);

        this.forceUpdate();
      }

      deleteFromServer(img: SVEData) {
        var self = this;
        f7.dialog.confirm("Möchten Sie die Datei: wirklich löschen?", "Löschbestätigung", function () {
          img.remove().then((val) => {
            if(val) {
                self.toastDeleteIcon.open();
                self.data = self.data.filter(e => e.getID() != img.getID());
                self.forceUpdate();
                self.onDeleteMedia(img.getID());
            } else {
              f7.dialog.alert("Datei konnte nicht gelöscht werden!");
            }
          });
        }, 
        function () {
    
        });
      }

      markWithStar(img: SVEData) {
        this.favoriteImgs.add(img.getID());
        this.toastFavIcon.open();
      }
    
      removeStar(img: SVEData) {
        this.favoriteImgs.delete(img.getID());
      }

      onClickImage(img: SVEData) {
          if(this.shouldReturnSelectedMedia) {
            this.onSelectMedia(img);
          } else {
            this.onDisplayMedia(img);
          }
      }

      onDisplayMedia(img: SVEData) {
        img.getOwner().then((user) => {
            let displayed = [];
            if (img.getType() === SVEDataType.Image)
            {
            displayed = [
                {
                caption: img.getName(),
                url: img.getURI(SVEDataVersion.Full)
                }
            ];
            this.setState({
                selectedImgUser: user, 
                selectedImg: img
            });
            }
            if (img.getType() === SVEDataType.Video)
            {
            displayed = [
                {
                caption: img.getName(),
                html: `<video 
                        controls autoplay preload="auto" poster="${img.getURI(SVEDataVersion.Preview)}">
                        <source src="${img.getURI(SVEDataVersion.Full)}" type="${img.getContentType(SVEDataVersion.Full)}" />
                        <p>Dieser Browser unterstützt HTML5 Video nicht</p>
                       </video>`,
                }
            ];
            this.setState({
                selectedImgUser: user, 
                selectedVid: img
            });
            }
        
            var photobrowser = f7.photoBrowser.create({
            photos: displayed,
            theme: "dark",
            navbarShowCount: false,
            navbar: true,
            toolbar: false,
            popupCloseLinkText: "Schließen",
            renderNavbar: () => {
                return "<Icon f7=\"cloud_download\" tooltip=\"Herunterladen\"></Icon>";
            }
            });
            photobrowser.open(0);
        });
      }
    }