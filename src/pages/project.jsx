import React from 'react';
import { PhotoBrowser, Toggle, Swiper, SwiperSlide, Page, Navbar, Popup, Block, Row, NavRight, Link, Panel, View, List, ListInput, BlockTitle, Icon, ListItem, Col, Preloader, ListButton, Button, Progressbar, f7, BlockFooter, AccordionContent, BlockHeader } from 'framework7-react';
import Dom7 from 'dom7';
//import KeepScreenOn from 'react-native-keep-screen-on'

//import MapView from 'react-native-maps';
import {SVEGroup, SVEProject, SVEProjectState, SVEDataType, SVEDataVersion, SVESystemInfo, SVEData} from 'svebaselib';
import Dropzone from 'react-dropzone';
import HugeUploader from 'huge-uploader';
import MediaGallery, {Media, Sorting} from './MediaGallery';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.uploadInfo = {
      imagesToUpload: [],
      pendingUploads: [],
      filesUploaded: 0,
      totalFilesToUpload: 0,
      maxParallelUploads: 2,
      progressbar: undefined
    };

    this.state = {
      displayCount: 10,
      selectedGalleryImg: 0,
      zlib: require('zlib'),
      project: Number(props.f7route.params.id),
      sortBy: Sorting.AgeASC,
      selectedImg: '',
      maxPreViewCount: 10,
      currentPreViewIdx: 0,
      selectedVid: '',
      showMap: false,
      selectedImgUser: "",
      showUpload: false,
      images_toPreSelect: [],
      showPreSelect: false,
      progress: 0.0,
      ownerName: '',
      hasError: false,
      isTakingPlaceNow: false,
      viewableUsers: new Map() //Map<User, Image[]>,
    };
  }
  render() {
    return (
      <Page name="project" onPageBeforeRemove={this.onPageBeforeRemove.bind(this)} id="page">
        <Navbar title={(typeof this.state.project !== "number") ? this.state.project.getName() : ""} backLink="Back">
          <NavRight>
            <Link iconIos="f7:menu" iconAurora="f7:menu" iconMd="material:menu" panelOpen="right" />
          </NavRight>
        </Navbar>

        <Block strong>
          {(!this.$f7.device.desktop) ? (
            <Row id="indexImage" style={{display: "flex", justifyContent: "center", alignContent: "center"}}>
              <img src={(typeof this.state.project !== "number") ? this.state.project.getSplashImageURI() : ""} style={{maxHeight: "30vh", width: "auto", display: "inherit"}}/>
            </Row>
          ) : ""}
          
          <Row>
            Gegründet von {this.state.ownerName}
          </Row>
          {(typeof this.state.project !== "number" && this.state.project.getDateRange() !== undefined && this.state.project.getDateRange().begin !== undefined && this.state.project.getDateRange().end !== undefined) ? (
            <Row style={{display: "block"}}>
              <p style={{color: (this.state.isTakingPlaceNow) ? "#11a802" : "#FFFFFF"}}>Zeitraum: {this.state.project.getDateRange().begin.toLocaleDateString()} bis {this.state.project.getDateRange().end.toLocaleDateString()}</p>
            </Row>
          ) : ""}
          {(typeof this.state.project !== "number" && this.state.project.getState() === SVEProjectState.Closed) ? (
            <Row id="video-row" style={{display: "flex", justifyContent: "center", alignContent: "center"}}>
              <video playsInline controls preload="none" style={{maxHeight: "30vh", width: "auto"}} src={""}></video>
            </Row>
          ): ""}
          
          <Row style={{display: "flex", justifyContent: "center", alignContent: "center", width: "100%"}}>
            <List id="SortByList" accordionList largeInset style={{width: "90%"}}>
              <ListItem accordionItem title={"Sortierung: " + this.getReadableSortName(this.state.sortBy)}>
                <AccordionContent id="SortByAccordion">
                  <List>
                    <ListItem name="sort-radio" radio title="Alter absteigend" onClick={this.setSortBy.bind(this, Sorting.AgeDESC)}></ListItem>
                    <ListItem name="sort-radio" radio title="Alter aufsteigend" defaultChecked onClick={this.setSortBy.bind(this, Sorting.AgeASC)}></ListItem>
                    <ListItem name="sort-radio" radio title="Upload absteigend" onClick={this.setSortBy.bind(this, Sorting.UploadDESC)}></ListItem>
                    <ListItem name="sort-radio" radio title="Upload aufsteigend" onClick={this.setSortBy.bind(this, Sorting.UploadASC)}></ListItem>
                  </List>
                </AccordionContent>
              </ListItem>
            </List>
          </Row>
        </Block>

        <Block strong>
          {(this.state.viewableUsers.size === 0) ? (
            <Block strong>
              <Row><span>Lade Medien...</span></Row>
              <Row>
                <Col><Preloader></Preloader></Col>
              </Row>
            </Block>
           ) : (
          <Swiper 
            id="ImgSwiper"
            navigation={true}
            pagination={true}
            init={true}
            style={{display: "flex", flexFlow: "column", height: "100%"}}
          >
            {(this.state.viewableUsers.has(this.$f7.data.getUser().getName())) ? (
              <SwiperSlide className="scrollBox" style={{height: "500px"}}>
                  <MediaGallery 
                    id={`image-gallery-${this.$f7.data.getUser().getName()}`}
                    data={this.getImagesFor(this.$f7.data.getUser().getName())}
                    sortBy={this.state.sortBy}
                    enableDeletion={true}
                    enableFavorization={true}
                    style={{width: "100%", height: "100%"}}
                    displayCount={this.state.displayCount}
                  />
              </SwiperSlide>
            ) : ""}
            {this.getListFromMap(this.state.viewableUsers).map((v) => (v.key !== this.$f7.data.getUser().getName()) ? (
              <SwiperSlide 
                style={{height: "500px"}}
                className="scrollBox"
                id={v.key}
              >
                <Row style={{display: "flex", justifyContent: "center", alignContent: "center", paddingBottom: "1em", textAlign: "center"}}>
                  <BlockTitle medium>{v.key}</BlockTitle>
                </Row>

                <MediaGallery
                  id={`image-gallery-${v.key}`}
                  data={this.getImagesFor(v.key)}
                  sortBy={this.state.sortBy}
                  enableDeletion={false}
                  enableFavorization={false}
                  style={{width: "100%", height: "100%"}}
                  displayCount={this.state.displayCount}
                />
              </SwiperSlide>
            ) : "")}
          </Swiper>
          )}
        </Block>

      <Popup className="image-upload" swipeToClose opened={this.state.showUpload} onPopupClosed={() => this.setState({showUpload : false})}>
        <Page>
          <BlockTitle large style={{justifySelf: "center"}}>Medien auswählen</BlockTitle>
          <Block style={{display: "flex", justifyContent: "center", alignContent: "center"}}>
            <Dropzone onDrop={acceptedFiles => { this.onAcceptMedia(acceptedFiles) }}>
            {({getRootProps, getInputProps}) => (
                <section style={{
                  backgroundImage: "url(\"images/DragNDropArea.png\")",
                  WebkitFilter: (this.state.hasError) ? "hue-rotate(240deg) saturate(3.3) grayscale(50%)" : "",
                  filter: (this.state.hasError) ? "hue-rotate(240deg) saturate(3.3) grayscale(50%)" : "",
                  backgroundRepeat: "no-repeat", 
                  backgroundSize: "100% 100%",
                  margin: "3em",
                  position: "relative",
                  padding: "3em"
                }}>
                  <div {...getRootProps()}>
                    <input {...getInputProps()}/>
                    <Block style={{minHeight: "90%", minWidth: "100%", cursor: "copy"}}>{"Ziehe Dokumente zum Hochladen hier hin oder suche diese per Explorer."}</Block>
                  </div>
                </section>
              )}
            </Dropzone>
          </Block>
        </Page>
      </Popup>
    </Page>
  );
}

  getImagesFor(user) {
    return (this.state.viewableUsers.has(user)) ? this.state.viewableUsers.get(user) : []
  }

  getListFromMap(map) {
    let ret = [];
    for (let [k, v] of map) {
      ret.push({key: k, value: v});
    }
    return ret;
  }

  getReadableSortName(sB) {
    if (sB == Sorting.AgeASC)
      return "Alter aufsteigend";
    if (sB == Sorting.AgeDESC)
      return "Alter absteigend";

    if (sB == Sorting.UploadASC)
      return "Upload aufsteigend";
    if (sB == Sorting.UploadDESC)
      return "Upload absteigend";
    
    return "Unbekannt";
  }

  onAcceptMedia(media) {
    this.$f7.progressbar.show(0, "#11a802");
    this.uploadInfo.progressbar = this.$f7.dialog.progress("Hochladen..", 0, "#11a802");
    this.setState({hasError: false});

    media.forEach(m => this.uploadInfo.imagesToUpload.push(m));
    this.uploadInfo.totalFilesToUpload += media.length;

    for (let i = 0; i < this.uploadInfo.maxParallelUploads; i++) {
      if(this.uploadInfo.pendingUploads.length < this.uploadInfo.maxParallelUploads)
        this.popNextUpload();
    }
  }

  popNextUpload() {
    if (this.uploadInfo.imagesToUpload.length === 0) {
      this.updateUploadedImages();
      this.uploadInfo.filesUploaded = 0;
      this.uploadInfo.totalFilesToUpload = 0;
      if(this.uploadInfo.progressbar !== undefined)
        this.uploadInfo.progressbar.close();
      this.$f7.progressbar.hide();
      return;
    }

    this.uploadInfo.progressbar.setText("Datei (" + this.uploadInfo.filesUploaded + " / " + this.uploadInfo.totalFilesToUpload + ")");

    var self = this;
    const media = this.uploadInfo.imagesToUpload.pop();
    console.log("Upload: " + JSON.stringify(media));
    const uploader = new HugeUploader({ 
      endpoint: SVESystemInfo.getAPIRoot() + "/project/" + ((typeof this.state.project !== "number") ? this.state.project.getID() : "") + "/data/upload", 
      file: media,
      postParams: {
        fileName: media.name,
        created: (media.lastModifiedDate !== undefined) ? media.lastModifiedDate : media.lastModified
      }
    });
    this.uploadInfo.pendingUploads.push(uploader);

    uploader.on('error', (err) => {
      console.error('Something bad happened', err.detail);
      self.uploadInfo.pendingUploads = self.uploadInfo.pendingUploads.filter(v => v != uploader);
      self.setState({hasError: true});
      self.popNextUpload();
    });

    uploader.on('progress', (progress) => {
        console.log(`The upload is at ${progress.detail}%`);
        let ratio = ((self.uploadInfo.filesUploaded + (progress.detail / 100.0)) / self.uploadInfo.totalFilesToUpload) * 100.0;
        self.$f7.progressbar.show(ratio, "#11a802");
        self.uploadInfo.progressbar.setProgress(ratio);
        self.uploadInfo.progressbar.setText("Datei (" + self.uploadInfo.filesUploaded + " / " + self.uploadInfo.totalFilesToUpload + ")");
    });

    uploader.on('finish', () => {
        console.log('complete');
        self.uploadInfo.filesUploaded++;
        self.uploadInfo.pendingUploads = self.uploadInfo.pendingUploads.filter(v => v != uploader);
        self.popNextUpload();
    });
  }

  setSortBy(SortBy) {
    this.setState({sortBy: SortBy});

    Dom7("#SortByList").click();
    //Dom7("SortByList").mousedown();
    Dom7("#SortByAccordion").trigger('accordion:closed');
    Dom7("#sort-radio").trigger('accordion:closed');
  }

  updateUploadedImages() {
    var self = this;
    var $$ = Dom7;

    self.state.viewableUsers = new Map();

    self.state.project.getData().then((imgs) => {
      imgs.forEach(i => {
        i.getOwner().then(usr => {
          if (usr.getName().length <= 1) {
            console.log("Invalid user: " + JSON.stringify(usr));
            return;
          }

          let vu = self.state.viewableUsers;
          let list = (vu.has(usr.getName())) ? vu.get(usr.getName()) : [];

          list.push(i);
          vu.set(usr.getName(), list);
          self.setState({viewableUsers: vu});
        });
      });
    }, 
    err => console.log("Fetching data error: " + JSON.stringify(err)));

    let favImgs = {};
    // Init
    self.setState({favoriteImgs: favImgs});

    var windowHeight = window.innerHeight;
    if (self.$device.ios || self.$device.android)
    {
      let lastScrollPos = 0.0;
      window.onscroll = (evt) => {
        if (document.body.scrollTop > lastScrollPos) {
          window.scrollTo(0,document.body.scrollHeight);
        }
        
        if (document.body.scrollTop < lastScrollPos) {
          window.scrollTo(0,0);
        }

        lastScrollPos = document.body.scrollTop;
      };
    }
    this.recalcHeight();
  }

  recalcHeight() {
    var $$ = Dom7;
    if($$("#ImgSwiper") !== null && $$("#ImgSwiper").offset() !== null) {
      console.log("Update height!");
      var h = ($$("#page").height() - $$("#ImgSwiper").offset().top - 2 * $$(".navbar").height());
      if (self.$device.ios || self.$device.android)
      {
        h = windowHeight * 0.9;
      }
      $$("#ImgSwiper").css("height", h + "px");
      document.querySelectorAll(".scrollBox").forEach((e, ke, p) => {
        e.style.height = h + "px";
      });
      $$(".scrollBox").each((i, e) => e.css("height", h + "px"));
    }
  }

  showOnMap() {
    this.setState({showMap: true});
  }

  updateContent() {
    var self = this;
    var router = this.$f7router;

    this.recalcHeight();

    let panelContent = {
      caption: "Urlaubsaktionen",
      menueItems: [
        {
          caption: "Medien hochladen",
          onClick: function() { self.setState({showUpload : true}) }
        },
        {
          caption: "Details",
          onClick: function() { router.navigate("/projectdetails/" + self.state.project.id + "/") }
        },
        {
          caption: "Mitglieder",
          onClick: function() { router.navigate("/users/" + self.state.project.context + "/") }
        }/*,
        {
          caption: "Karte",
          onClick: function() { self.showOnMap(); }
        }*/
      ]
    };

    self.$f7.data.updateRightPanel(panelContent);

    if (typeof this.state.project !== "number") {
      this.state.project.getOwner().then(user => {
        self.setState({ownerName: user.getName()});
        self.updateUploadedImages();
      });
    }
  }

  componentDidMount() {
    var router = this.$f7router;
    var self = this;
    var $$ = Dom7;
    this.$f7ready((f7) => {
      self.$f7.data.addLoginHook(() => {
        self.updateContent();
      });

      if (typeof self.state.project === "number") {
        self.setState({project: new SVEProject(self.state.project, this.$f7.data.getUser(), p => self.updateContent())});
      }

      $$(document).on('page:reinit', function (e) {
        self.updateContent();
      });

      //self.registerScrollListeners();
    });
  }

  onPageBeforeRemove() {
    const self = this;
    // Destroy popup when page removed
    if (self.popup) self.popup.destroy();
  }
}