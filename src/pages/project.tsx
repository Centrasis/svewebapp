import React from 'react';
import { PhotoBrowser, Toggle, Swiper, SwiperSlide, Page, Navbar, Popup, Block, Row, NavRight, Link, Panel, View, List, ListInput, BlockTitle, Icon, ListItem, Col, Preloader, ListButton, Button, f7, BlockFooter, AccordionContent, BlockHeader } from 'framework7-react';
import Dom7 from 'dom7';
//import KeepScreenOn from 'react-native-keep-screen-on'

//import MapView from 'react-native-maps';
import {SVEGroup, SVEProject, SVEProjectState, SVEDataType, SVEDataVersion, SVESystemInfo, SVEData, SVEProjectType, SVEAccount} from 'svebaselib';
import UploadDropzone from './UploadDropzone';
import MediaGallery, {Sorting} from './MediaGallery';
import NewProjectPopup from "./NewProjectPopup"
import { f7ready, theme } from 'framework7-react';
import store from '../components/store';
import { LoginHook } from '../components/LoginHook';
import { PanelMenuItem, SideMenue } from '../components/SideMenue';
import { getDevice } from 'framework7';
import { PopupHandler } from '../components/PopupHandler';
import { SVEPageComponent } from '../components/SVEPageComponent';

export default class extends SVEPageComponent {
  protected showUpload: boolean = false;
  protected sortBy: Sorting = Sorting.AgeASC;
  protected displayCount: number = 10;
  protected selectedGalleryImg: number = 0;
  protected project: SVEProject = undefined;
  protected selectedImg: number = 0;
  protected maxPreViewCount: number = 10;
  protected currentPreViewIdx: number = 0;
  protected selectedVid: number = 0;
  protected showMap: boolean = false;
  protected selectedImgUser: SVEAccount = undefined;
  protected closeProject: boolean = false;
  protected selectSplash: boolean = false;
  protected images_toPreSelect: SVEData[] = [];
  protected showPreSelect: boolean = false;
  protected ownerName: string = '';
  protected resultURI: string = undefined;
  protected resultType: string = "";
  protected resultPosterURI: string = "";
  protected lastLatestID: number = 0;
  protected isTakingPlaceNow: boolean = false;
  protected viewableUsers: Map<SVEAccount, SVEData[]> = new Map<SVEAccount, SVEData[]>();
  protected favoriteImgs: SVEData[] = [];

  constructor(props) {
    super(props);
    new SVEProject(Number(this.f7route.params.id), store.state.user, p => {
      this.project = p;
      p.getResult().then((data => {
        if (isNaN(data.getID())) {
          console.log("Got result error on Server!");
        } else {
          this.resultURI = data.getURI(SVEDataVersion.Full, false),
          this.resultPosterURI = data.getURI(SVEDataVersion.Preview, false),
          this.resultType = data.getContentType(SVEDataVersion.Full)
          this.updateContent();
        }
      }), err => {});
      this.updateContent();
    });
  }
  
  protected onPageBeforeRemove(page: any) {
    console.log("before page remove!");
    // Destroy popup when page removed
    if ((this as any).popup) (this as any).popup.destroy();
  }

  protected customRender() {
      return (
      <Page name="project" onPageBeforeRemove={this.onPageBeforeRemove.bind(this)} id="page">
        <Navbar title={(this.project !== undefined) ? this.project.getName() : ""} backLink="Back">
          
            {(!getDevice().desktop) ? (
              <NavRight>
                <Link iconIos="f7:menu" iconAurora="f7:menu" iconMd="material:menu" panelOpen="right" />
              </NavRight>
            ) : (
              <NavRight>
                {SideMenue.getCurrentRightMenu().subMenuItems.map(item => (
                  <Link iconIos={item.icon} iconAurora={item.icon} iconMd={item.icon} tooltip={item.caption} textColor={(item.color !== undefined) ? item.color : ""} onClick={item.onClick.bind(this)}/>
                ))}
              </NavRight>
              )}
          
        </Navbar>
        {(!getDevice().desktop) ? (
          <Block strong>
            <Row id="indexImage" style={{display: "flex", justifyContent: "center", alignContent: "center"}}>
              <img src={(this.project !== undefined) ? this.project.getSplashImageURI() : ""} style={{maxHeight: "30vh", width: "auto", display: "inherit"}}/>
            </Row>        
            <Row>
              Gegründet von {this.ownerName}
            </Row>
            {(this.project !== undefined && this.project.getDateRange() !== undefined && this.project.getDateRange().begin !== undefined && this.project.getDateRange().end !== undefined) ? (
              <Row style={{display: "block"}}>
                <p style={{color: (this.isTakingPlaceNow) ? "#11a802" : "#FFFFFF"}}>Zeitraum: {this.project.getDateRange().begin.toLocaleDateString()} bis {this.project.getDateRange().end.toLocaleDateString()}</p>
              </Row>
            ) : ""}
            {(this.resultURI !== undefined) ? 
              <Row id="video-row" style={{display: "flex", justifyContent: "center", alignContent: "center"}}>
                <video 
                  playsInline
                  controls
                  preload={"auto"} 
                  style={{maxHeight: "30vh", width: "auto"}} 
                  poster={this.resultPosterURI}
                >
                  <source src={this.resultURI} type={this.resultType} />
                  <p>Dieser Browser unterstützt HTML5 Video nicht</p>
                </video>
              </Row>
            : ""}
          
            <Row style={{display: "flex", justifyContent: "center", alignContent: "center", width: "100%"}}>
              <List id="SortByList" accordionList largeInset style={{width: "90%"}}>
                <ListItem accordionItem title={"Sortierung: " + this.getReadableSortName(this.sortBy)}>
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
        ) : (
          <Row>
            <Col width="25">
              <List id="SortByList" accordionList>
                <ListItem accordionItem title={"Sortierung: " + this.getReadableSortName(this.sortBy)}>
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
            </Col>
            <Col width="75"></Col>
          </Row>
        )}

        <Block strong>
          {(this.viewableUsers.size === 0) ? (
            <Block strong style={{justifyContent: "center", justifyItems: "center", position: "fixed", zIndex: 9, left: "50%", top: "50%", transform: "translate(-50%, -50%)"}}>
              <Row><Col></Col><Col><span>Lade Medien...</span></Col><Col></Col></Row>
              <Row>
                <Col></Col><Col><Preloader></Preloader></Col><Col></Col>
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
            {(this.viewableUsers.has(store.state.user.getName())) ? (
              <SwiperSlide className="scrollBox" style={{height: this.getSwiperHeight() + "px"}}>
                <Row noGap>
                  <Col></Col>
                  <Col style={{justifyContent: "center", alignContent: "center"}}>
                    <h2>Meine Medien</h2>
                  </Col>
                  <Col></Col>
                </Row>
                <hr/>
                <MediaGallery 
                  id={`image-gallery-${store.state.user.getName()}`}
                  data={this.getImagesFor(store.state.user.getName())}
                  sortBy={this.sortBy}
                  enableDeletion={true}
                  enableFavorization={true}
                  style={{width: "100%", height: "100%"}}
                  displayCount={this.displayCount}
                  enableClassification={this.project.getType() !== SVEProjectType.Vacation}
                />
              </SwiperSlide>
            ) : ""}
            {this.getListFromMap(this.viewableUsers).map((v) => (v.key !== store.state.user.getName()) ? (
              <SwiperSlide 
                style={{height: this.getSwiperHeight() + "px"}}
                className="scrollBox"
                id={v.key}
              >
                <Row>
                  <BlockTitle medium>{v.key}</BlockTitle>
                </Row>
                <Row>
                  <MediaGallery
                    id={`image-gallery-${v.key}`}
                    data={this.getImagesFor(v.key)}
                    sortBy={this.sortBy}
                    enableDeletion={false}
                    enableFavorization={false}
                    style={{width: "100%", height: "100%"}}
                    displayCount={this.displayCount}
                  />
                </Row>
              </SwiperSlide>
            ) : "")}
          </Swiper>
          )}
        </Block>

        <Popup className="image-upload" swipeToClose opened={this.showUpload} onPopupClosed={() => this.showUploadPopup(false)}>
          <Page>
            <BlockTitle large style={{justifySelf: "center"}}>Medien auswählen</BlockTitle>
            {(this.project !== undefined) ? 
              <UploadDropzone
                project={this.project}
                user={this.user}
                onImageUploaded={(img) => this.OnImgUploaded(img)}
              />
            : ""}
          </Page>
        </Popup>

        <Popup className="splash-select" swipeToClose opened={this.selectSplash} onPopupClosed={() => {this.selectSplash = false; this.forceUpdate()}}>
          <Page>
            <BlockTitle large style={{justifySelf: "center"}}>Titelbild wählen</BlockTitle>
            {(this.project !== undefined) ? 
              <MediaGallery 
                id={`title-select-gallery`}
                data={this.getImagesFor(store.state.user.getName())}
                sortBy={this.sortBy}
                enableDeletion={false}
                enableFavorization={false}
                enableDownload={false}
                style={{width: "100%", height: "100%"}}
                displayCount={this.displayCount}
                shouldReturnSelectedMedia={true}
                onSelectMedia={this.onSelectSplash.bind(this)}
              />
            : ""}
          </Page>
        </Popup>
      
      {(this.project !== undefined) ? 
       	<NewProjectPopup
          id = "ProjectDisplay"
          owningUser={store.state.user}
          parentGroup={this.project.getGroup()}
          caption={"Bearbeite Projekt: " + this.project.getName()}
          projectToEdit={this.project}
        />
      : ""}

      <Popup swipeToClose opened={this.closeProject} onPopupClosed={() => {this.closeProject = false; this.forceUpdate()}}>
        <Page>
          <BlockTitle large style={{justifySelf: "center"}}>Urlaub mit Diashow abschließen?</BlockTitle>
          {(this.project !== undefined) ? 
            <UploadDropzone
              project={this.project}
              user={this.user}
              onImageUploaded={(img) => this.OnImgUploaded(img)}
            />
          : ""}
          <Button raised fillIos onClick={this.OnImgUploaded.bind(this, undefined)}>Überspringen</Button>
        </Page>
      </Popup>
    </Page>
  )
}

  showUploadPopup(show = true) {
    this.showUpload = show;
    this.closeProject = false
    this.forceUpdate();
  }

  onSelectSplash(img) {
    if(img !== undefined) {
      this.project.setSplashImgID(img.getID());
      this.project.store().then(val => {
        if(!val) {
          f7.dialog.alert("Titelbild konnte nicht gesetzt werden!");
        }
      });
    }

    this.selectSplash = false; this.forceUpdate();
  }

  enqueueLatestDataCall(storeProject, count = 0) {
    if(count < 100) {
      setTimeout(() => {
        SVEData.getLatestUpload(store.state.user).then(latestData => {
          if(latestData.getID() !== this.lastLatestID) {
            this.lastLatestID = latestData.getID(); this.forceUpdate();
            this.project.setResult(latestData);
            storeProject();
          } else {
            this.enqueueLatestDataCall(storeProject, count + 1);
          }
        }, err => this.enqueueLatestDataCall(storeProject, count + 1));
      }, (count < 50) ? 1000 : 10000);
    } else {
      storeProject();
    }
  }

  OnImgUploaded(img) {
    console.log("Media uploaded!");
    if(this.closeProject) {
      console.log("Close project!");

      let storeProject = () => {
        this.project.setState(SVEProjectState.Closed);
        this.project.store().then(val => {
          f7.toast.create({
            text: val ? "Projekt erfolgreich abgeschlossen!" : "Projekt wurde nicht korrekt abgeschlossen!",
            closeButton: !val,
            closeButtonText: 'Ok',
            closeButtonColor: 'red',
            closeTimeout: val ? 2000 : undefined
          }).open();
        });
      };

      if (img !== undefined) {
        console.log(".. with result");
        this.enqueueLatestDataCall(storeProject);  
      } else {
        storeProject();
      }
      this.closeProject = false; this.forceUpdate();
    }

    this.updateUploadedImages();
  }

  getImagesFor(user) {
    return (this.viewableUsers.has(user)) ? this.viewableUsers.get(user) : []
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

  setSortBy(SortBy) {
    this.sortBy = SortBy;

    Dom7("#SortByList").click();
    //Dom7("SortByList").mousedown();
    Dom7("#SortByAccordion").trigger('accordion:closed', {});
    Dom7("#sort-radio").trigger('accordion:closed', {});

    this.forceUpdate();
  }

  updateUploadedImages() {
    SVEData.getLatestUpload(store.state.user).then(latestData => {
        this.lastLatestID = latestData.getID(); this.forceUpdate();
    });

    var self = this;
    var $$ = Dom7;

    self.viewableUsers.clear();

    self.project.getData().then((unclassified_imgs) => {
      let imgs = [];

      let finalize = () => {
        if(imgs.length === unclassified_imgs.length) {
          imgs.forEach(i => {
            i.getOwner().then(usr => {
              if (usr.getName().length <= 1) {
                console.log("Invalid user: " + JSON.stringify(usr));
                return;
              }
    
              let vu = self.viewableUsers;
              let list = (vu.has(usr.getName())) ? vu.get(usr.getName()) : [];
    
              list.push(i);
              vu.set(usr.getName(), list);
              self.viewableUsers = vu; self.forceUpdate();
            });
          });
        }
      }

      if(self.project.getType() !== SVEProjectType.Vacation) {
        console.log("Pulling class names for documents..");
        unclassified_imgs.forEach(i => {
          i.pullClassification().then(() => {
            imgs.push(i);
            finalize();
          }, err => { imgs.push(i); console.error(err); finalize(); });
        });
      } else {
        console.log("Skip class names for vaction pictures!");
        imgs = unclassified_imgs;
      }
      // just in case it's empty or this is a vacations project
      finalize();
    }, 
    err => console.log("Fetching data error: " + JSON.stringify(err)));

    let favImgs = [];
    // Init
    self.favoriteImgs = favImgs; self.forceUpdate();

    if (getDevice().ios || getDevice().android)
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
    $$("#ImgSwiper").css("height", this.getSwiperHeight() + "px");
  }

  getSwiperHeight() {
    var $$ = Dom7;
    if($$("#ImgSwiper") !== null && $$("#ImgSwiper").offset() !== null) {
      let h = ($$("#page").height() - $$("#ImgSwiper").offset().top - 2 * $$(".navbar").height());
      if (getDevice().ios || getDevice().android)
      {
        h = window.innerHeight * 0.9;
      }
      return h;
      /*$$("#ImgSwiper").css("height", h + "px");
      document.querySelectorAll(".scrollBox").forEach((e, ke, p) => {
        e.style.height = h + "px";
      });
      $$(".scrollBox").each((e, i) => e.css("height", h + "px"));*/
    } else {
      return 500;
    }
  }

  showOnMap() {
    this.showMap = true; this.forceUpdate();
  }

  updateContent() {
    var self = this;
    var router = f7.view.current.router;

    Dom7("#ImgSwiper").css("height", this.getSwiperHeight() + "px");

    if (this.project !== undefined) {
      this.project.getGroup().getRightsForUser(store.state.user).then(rights => {
        let panelContent: PanelMenuItem = {
          caption: "Urlaubsaktionen",
          subMenuItems: [
            (rights.write && this.project.getState() === SVEProjectState.Open) ?
            {
              caption: "Medien hochladen",
              icon: "f7:cloud_upload",
              onClick: function() { self.showUploadPopup() }
            } : undefined, 
            (rights.write) ?
            {
              caption: "Bearbeiten",
              icon: "f7:square_pencil",
              onClick: function() { PopupHandler.getPopupComponent('NewProjectPopupProjectDisplay').setComponentVisible(true); }
            } : undefined,
            {
              caption: "Teilen",
              icon: "f7:arrowshape_turn_up_right",
              onClick: function() { router.navigate("/projectdetails/" + self.project.getID() + "/") }
            },
            {
              caption: "Mitglieder",
              icon: "f7:person_3_fill",
              onClick: function() { router.navigate("/users/" + self.project.getGroup().getID() + "/") }
            },
            {
              caption: "Herunterladen",
              icon: "f7:cloud_download",
              onClick: function() { 
                window.open(SVESystemInfo.getAPIRoot() + '/project/' + self.project.getID() + '/data/zip' + "?sessionID=" + encodeURI(self.user.getSessionID()), "_system");
              }
            },
            (rights.admin) ?
            {
              caption: "Projekt abschließen",
              color: "green",
              icon: "f7:checkmark_shield_fill",
              onClick: function() { 
                self.closeProject = true; self.forceUpdate();
              }
            } : undefined,
            (rights.admin) ?
            {
              caption: "Titelbild wählen",
              icon: "f7:rectangle_stack_person_crop_fill",
              onClick: function() { 
                self.selectSplash = true; self.forceUpdate();
              }
            } : undefined,
            (rights.admin) ?
            {
              caption: "Projekt löschen",
              color: "red",
              icon: "f7:trash",
              onClick: function() { 
                f7.dialog.confirm("Möchten Sie das Projekt wirklich löschen?", "Projekt löschen", () => {
                  self.project.remove().then(v => {
                    if(v) {
                      router.back();
                    } else {
                      f7.dialog.alert("Löschen war nicht möglich! Überprüfen Sie Ihre Rechte.");
                    }
                  });
                }, () =>  {});
              }
            } : undefined
            /*,
            {
              caption: "Karte",
              onClick: function() { self.showOnMap(); }
            }*/
          ]
        };

        SideMenue.setRightPanel(panelContent);
      });
    }

    if (this.project !== undefined) {
      this.project.getOwner().then(user => {
        self.ownerName = user.getName(); self.forceUpdate();
        self.updateUploadedImages();
      });
    }
  }

  componentDidMount() {
    var self = this;
    var $$ = Dom7;
    f7ready((f7) => {
      LoginHook.add(() => {
        self.updateContent();
      });

      //self.registerScrollListeners();
    });
  }

  protected pageReinit(isUserReady: boolean) {
    this.updateContent();
  }

  protected pageAfterNavigate(isUserReady: boolean) {
    this.updateContent();
  }
}