import React from 'react';
import { SVEDataType, SVEDataVersion, SVEData} from 'svebaselib';
import { Block, Row, Link, Icon, Col, Preloader } from 'framework7-react';
import Dom7 from 'dom7';

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
    displayCount?: number,
    displayCountIncrement?: number,
    onDeleteMedia?: (id: number) => void,
    /** Display or return media */
    shouldReturnSelectedMedia?: boolean,
    onSelectMedia?: (media?: SVEData) => void
};

export default class MediaGallery extends React.Component<MediaSettings & React.HTMLAttributes<HTMLCanvasElement>, {}> {
    protected data: SVEData[] = [];
    protected displayCount: number = 10;
    protected displayCountIncrement: number = 10;
    protected caption: string = "";
    protected enableDeletion: boolean = false;
    protected enableFavorization: boolean = false;
    protected enableDownload: boolean = true;
    protected sortBy: Sorting = Sorting.AgeASC;
    protected onDeleteMedia: (id: number) => void = (id: number) => {};
    protected favoriteImgs: Set<number> = new Set<number>();
    protected toastFavIcon = null;
    protected toastDeleteIcon = null;
    protected infiniteActive: boolean = false;
    protected shouldReturnSelectedMedia: boolean = false; //display media instead
    protected onSelectMedia: (media?: SVEData) => void = (media?: SVEData) => {};

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
            this.displayCount = this.props.displayCount;
        }

        if (this.props.displayCountIncrement)
        {
            this.displayCountIncrement = this.props.displayCountIncrement;
        }

        if (this.props.enableDeletion)
        {
            this.enableDeletion = this.props.enableDeletion;
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
    }

    componentDidUpdate() {
        Dom7('#'+this.props.id + "-Infinity-Loader").hide();
        this.updateProps();
    }

    UNSAFE_componentWillUpdate() { 
        this.updateProps();
        this.$f7ready((f7) => {});
    }

    componentDidMount() {
        this.toastFavIcon = this.$f7.toast.create({
            icon: '<i class="f7-icons">star</i>',
            text: 'Favorisiert',
            position: 'center',
            closeTimeout: 1000,
        });

        this.toastDeleteIcon = this.$f7.toast.create({
            icon: '<i class="f7-icons">trash</i>',
            text: 'Gelöscht',
            position: 'center',
            closeTimeout: 1000,
        });

        this.updateProps();

        this.registerScrollListeners();
    }

    render () {   
        return (<Block strong style={{overflow: "scroll", overflowX: "hidden", position: "absolute", top: "0", left: "0", right: "0", bottom: "0", display: "block"}} className={this.props.id + "-scrollBox"}>
                    {this.getPartialImagesList().map((image: SVEData) => (
                    <Block strong>
                        <Block style={{display: "flex", justifyContent: "center", alignContent: "center", paddingBottom: "1em", textAlign: "center"}}>
                            <Row style={{width: "100%", display: "block"}}>
                                <div className="imgHoverContainer">
                                    <img
                                        className="middle"
                                        src={image.getURI(SVEDataVersion.Preview)}
                                        onClick={this.onClickImage.bind(this, image, "")}
                                        style={{
                                            maxWidth: "400px",
                                            maxHeight: "400px",
                                            width: "100%",
                                            height: "auto",
                                            display: "block",
                                            backfaceVisibility: "hidden",
                                            opacity: (image.getType() == SVEDataType.Image) ? "1.0" : "0.5"
                                        }}
                                    />
                                    {(image.getType() === SVEDataType.Video) ?
                                        <div className="overlay">
                                            <Link href="#" onClick={this.onClickImage.bind(this, image, "")}>
                                                <Icon f7="play_circle_fill" tooltip="Abspielen"></Icon>
                                            </Link>
                                        </div>
                                    : ""}
                                </div>
                            </Row>
                        </Block>
                        <Block className="row text-align-center">
                            <Col>
                            {(this.enableFavorization) ? 
                                <Link href="#" onClick={(image.getID() in this.favoriteImgs) ? this.removeStar.bind(this, image) : this.markWithStar.bind(this, image)}>;
                                    <Icon f7={(image.getID() in this.favoriteImgs) ? "star_slash_fill" : "star_fill"} tooltip="Datei (ent-)favorisieren"></Icon>;
                                </Link>
                            : ""}
                            </Col>
                            <Col>
                            {(this.enableDownload) ? 
                                <Link href="#" onClick={this.saveImageToDevice.bind(this, image)}>
                                    <Icon f7="cloud_download" tooltip="Herunterladen"></Icon>
                                </Link>
                            : "" }
                            </Col>
                            <Col>
                            {(this.enableDeletion) ? 
                                <Link href="#" onClick={this.deleteFromServer.bind(this, image)}>
                                    <Icon f7="trash" tooltip="Datei entfernen"></Icon>
                                </Link>
                            : ""}
                            </Col>
                        </Block>
                    </Block>
                    ))}
                    <Preloader color="#11a802" className="preloader infinite-scroll-preloader" id={this.props.id + "-Infinity-Loader"}></Preloader>
                </Block>)
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

      getPartialImagesList() {
        let list: SVEData[] = [];
        if (this.sortBy == Sorting.AgeASC || this.sortBy == Sorting.AgeDESC)
        {
          list = this.data.sort((a: SVEData, b: SVEData) => {
              if (this.sortBy == Sorting.AgeASC) {
                   return a.getCreationDate().getTime() - b.getCreationDate().getTime();
               } else {
                   return b.getCreationDate().getTime() - a.getCreationDate().getTime();
               };
            });
        }
        if (this.sortBy == Sorting.UploadASC || this.sortBy == Sorting.UploadDESC)
        {
          list = this.data.sort((a: SVEData, b: SVEData) => {
            if (this.sortBy == Sorting.UploadASC) {
                 return a.getLastAccessDate().getTime() - b.getLastAccessDate().getTime();
             } else {
                 return b.getLastAccessDate().getTime() - a.getLastAccessDate().getTime();
             };
          });
        }

        return list.slice(0, (this.displayCount <= list.length) ? this.displayCount : list.length);
      }

      deleteFromServer(img: SVEData) {
        var self = this;
        this.$f7.dialog.confirm("Möchten Sie die Datei: wirklich löschen?", "Löschbestätigung", function () {
          img.remove().then((val) => {
            if(val) {
                self.toastDeleteIcon.open();
                self.data = self.data.filter(e => e.getID() != img.getID());
                self.forceUpdate();
                self.onDeleteMedia(img.getID());
            } else {
              self.$f7.dialog.alert("Datei konnte nicht gelöscht werden!");
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
                       </video>`,
                }
            ];
            this.setState({
                selectedImgUser: user, 
                selectedVid: img
            });
            }
        
            var photobrowser = this.$f7.photoBrowser.create({
            photos: displayed,
            theme: "dark",
            navbarShowCount: false,
            navbar: true,
            toolbar: false,
            popupCloseLinkText: "Schließen",
            renderNavbar: () => {
                return "<i class=\"f7-icons\">cloud_download</i>";
            }
            });
            photobrowser.open(0);
        });
      }
    }