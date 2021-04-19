import React from 'react';
import { Page, Navbar, List, ListItem, NavRight, Searchbar, Link, Block, BlockTitle, Popup, ListInput, ListButton, Col, Row, Input, BlockFooter } from 'framework7-react';

//import {Tesseract} from "tesseract.ts";
//import * as tf from '@tensorflow/tfjs';
//import { pdfjs } from 'react-pdf';

import CameraDropzone from './CameraDropzone';
import NewGroupPopup from './NewGroupPopup';
import { SVEProject, SVEGroup, SVEProjectType, SVEProjectState, SVESystemInfo, SVEClassificator } from 'svebaselib';
import QRCodeScanner from './QRCodeScanner';
//import { model } from '@tensorflow/tfjs';
import { f7, f7ready, theme } from 'framework7-react';
import store from '../components/store';
import {MultiMediaDeviceHandler as MMDH} from '../components/multimediadevicehandler';
import { LoginHook } from '../components/LoginHook';
import { SVEPageComponent } from '../components/SVEPageComponent';
import { PopupHandler } from '../components/PopupHandler';

interface DocumentClass {
  key: number;
  class: string;
}

export default class extends SVEPageComponent {
  protected documentGroups: SVEGroup[] = [];
  protected selectedGroupID: number = NaN;
  protected tesseractThreads: number = 2;
  protected scheduler: any = null;
  protected documentClasses: DocumentClass[] = [];
  protected recognizedClass: number = NaN;
  protected hasCameraPermission: boolean = false;
  protected selectedGroup: SVEGroup = undefined;
  protected selectedProject: SVEProject = undefined;
  protected classify: boolean = false;

  constructor(props) {
    super(props);
  }

  customRender() {
      return (
      <Page name="docs">
        <Navbar title="SVE Docs">
          <NavRight>
              <Link iconF7="camera_on_rectangle" tooltip="Kamera auswählen" onClick={() => { MMDH.resetCameraPermissions(true); MMDH.selectCamera(); }}></Link>
              <Link iconF7="folder_badge_plus" tooltip="Neue Dokumentengruppe erstellen" onClick={() => PopupHandler.getPopupComponent('NewGroupPopupDocs-New-Group').setComponentVisible(true)}></Link>
              <Link iconF7="qrcode_viewfinder" tooltip="Gruppe mit QR Code beitreten" onClick={() => PopupHandler.getPopupComponent('QRCodeScanner').setComponentVisible(true)}></Link>
              {(this.selectedGroup !== undefined) ? <Link style={{color: "red"}} iconF7="folder_badge_minus" tooltip="Gruppe löschen" onClick={this.removeCurrentGroup.bind(this)}></Link> : "" }
          </NavRight>
        </Navbar> 

        <Block style={{justifyContent: "center", alignContent: "center", width: "100vw"}} strong>
          <List>
            <ListInput
              label="Dokumentengruppe"
              type="select"
              value={this.selectedGroupID}
              onInput={(e) => {
                this.selectedGroupID = e.target.value; this.forceUpdate();
                if (isNaN(e.target.value)) {
                  this.selectedProject = undefined; this.forceUpdate();
                } else {
                  new SVEGroup({id: Number(e.target.value)}, store.state.user, (g) => {
                    this.selectedGroup = g ; this.forceUpdate();
                    g.getProjects().then(ps => {
                      if(ps.length > 0) {
                        this.selectedProject = ps[0]; this.forceUpdate();
                      } else {
                        this.selectedProject = undefined; this.forceUpdate();
                        this.selectedGroupID = NaN; this.forceUpdate();
                      }
                    });
                  });
                }
              }}
            >
              <option value={NaN}>Wähle</option>
              {this.documentGroups.map(doc => (
                <option value={doc.getID()}>{doc.getName()}</option>
              ))}
            </ListInput>
            <ListItem style={{justifyContent: "center", alignContent: "center", alignItems: "center", alignSelf: "center"}}>
              <Block>
                <BlockTitle>{this.getClassName()}</BlockTitle>
                <BlockFooter>
                {(this.selectedProject !== undefined) ? 
                  <CameraDropzone
                    id="CameraDropzone"
                    project={this.selectedProject}
                    maxParallelUploads={1}
                    onCameraLoaded={this.predictOnCamera.bind(this)}
                    onImageUploaded={this.classifyImage.bind(this)}
                    onCameraStop={(cam) => { this.classify = false; this.forceUpdate()}}                   
                  />
                :
                  <Block largeInset strong style={{height: "20vh"}}>
                    <BlockTitle>Wähle eine Gruppe</BlockTitle>
                  </Block>
                }
                </BlockFooter>
              </Block>
            </ListItem>
          </List>
        </Block>

        <NewGroupPopup
          id='Docs-New-Group'
          owningUser={store.state.user}
          onGroupCreated={(group) => {this.newGroupCreated(group)}}
        />
      </Page>
    );
}
  getClassName() {
    let l = this.documentClasses.filter(d => d.key === this.recognizedClass);
    if (isNaN(this.recognizedClass) || l.length == 0) {
      return "Suche...";
    } else {
      return l[0].class;
    }
  }

  predict(model, videoElem) {
    if (this.classify) {
      /*tf.tidy(() => {
        let tensor = tf.browser.fromPixels(videoElem, 3);
        const dim: [number, number] = [model.input.shape[1] as number, model.input.shape[2] as number];
        tensor = tf.image.resizeBilinear(tensor, dim);
        const eTensor = tf.reshape(tensor, [1, dim[0], dim[1], 3]);
        const prediction = model.predict(eTensor);
        const maxIdx = prediction.as1D().argMax().dataSync()[0];
        const max = maxIdx + 1;
        if (this.recognizedClass !== max) {
          this.recognizedClass = max; this.forceUpdate();
        }
        window.requestAnimationFrame(this.predict.bind(this, model, videoElem));
      });*/
    }
  }

  predictOnCamera(videoElem) {
    if(videoElem != undefined) {
      this.classify = true; this.forceUpdate();
      /*tf.loadLayersModel(SVESystemInfo.getInstance().sources.aiService + '/models/documents/model.json').then(model => {
        console.log("Start recognition...");
        window.requestAnimationFrame(this.predict.bind(this, model, videoElem));
      }, err => console.log("Error on load model: " + JSON.stringify(err)));*/
    }
  }

  classifyImage(img) {
    f7.toast.create({
      icon: '<i class="f7-icons">tray_arrow_up_fill</i>',
      text: 'Archiviert!',
      position: 'center',
      closeTimeout: 1000,
    }).open();

    /*Tesseract.recognize(img).progress(console.log).then((res) => {
        console.log(res);
    }).catch(console.error);*/
  }

  removeCurrentGroup() {
    var self = this;
    f7.dialog.confirm("Dokumente alle löschen?", "Bestätigen", ()=> {
      self.selectedGroup.remove().then(val => {
        self.updateGroupsList();
        if (val) {
          self.selectedGroup = undefined; self.forceUpdate();
        }
      });
    }, () => {});
  }

  newGroupCreated(g) {
    PopupHandler.getPopupComponent('NewGroupPopupDocs-New-Group').setComponentVisible(false);

    if (g === undefined)
      return;

    let gs = this.documentGroups;
    gs.push(g);
    this.documentGroups = gs; this.forceUpdate();
    new SVEProject({
      id: NaN,
      name: "Documents",
      group: g,
      splashImg: -1,
      owner: store.state.user,
      state: SVEProjectState.Open,
      type: SVEProjectType.Sales
    },
    store.state.user,
    p => {
      p.store().then(val => {
        if(val) {
          this.selectedProject = p; this.forceUpdate();
        } else {
          this.selectedProject = undefined; this.forceUpdate();
          f7.dialog.alert("Fehler beim Anlegen des initial Projektes!")
        }
      });
    });
  }

  updateGroupsList() {
    if (store.state.user === undefined || store.state.user === null) {
      return;
    }

    SVEClassificator.getClasses("documents").then(ret => {
      console.log("Classes: " + JSON.stringify(ret));
      this.documentClasses = ret; this.forceUpdate()
    });  

    SVEGroup.getGroupsOf(store.state.user).then(groups => {
      let groupsWithOnlyDocs = [];
      let i = 0;
      groups.forEach(g => {
        g.getProjects().then(ps => {
          let vacType = false;
          ps.forEach(p => {
            if (p.getType() === SVEProjectType.Vacation) {
              vacType = true;
            }
          });

          if(!vacType && ps.length > 0) {
            groupsWithOnlyDocs.push(g);
          }

          i++;
          if(i === groups.length) {
            this.documentGroups = groupsWithOnlyDocs; this.forceUpdate();
          }
        });
      })
    });
  }

  componentDidMount() {
    var self = this;
    f7ready((f7) => {
      LoginHook.add(() => {
        self.updateGroupsList();
      });

      self.updateGroupsList();
    });
  }

  protected pageAfterNavigate(isUserReady: boolean) {
    if(!isUserReady)
      this.f7router.navigate("/login/");
  }

  protected pageReinit(isUserReady: boolean) {
    if(!isUserReady)
      this.f7router.navigate("/login/");
  }
  
  componentWillUnmount() {
    //this.postpareTesseract();
  }
}