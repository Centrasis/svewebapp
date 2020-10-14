import React from 'react';
import { Page, Navbar, List, ListItem, NavRight, Searchbar, Link, Block, BlockTitle, Popup, ListInput, ListButton, Col, Row, Input } from 'framework7-react';

//import {Tesseract} from "tesseract.ts";
import * as tf from '@tensorflow/tfjs';
//import { pdfjs } from 'react-pdf';

import Dom7 from 'dom7';
import CameraDropzone from './CameraDropzone';
import NewGroupPopup from './NewGroupPopup';
import { SVEProject, SVEGroup, SVEProjectType, SVEProjectState, SVESystemInfo, SVEClassificator } from 'svebaselib';
import QRCodeScanner from './QRCodeScanner';
import { model } from '@tensorflow/tfjs';

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      documentGroups: [],
      selectedGroupID: NaN,
      tesseractThreads: 2,
      scheduler: null,
      documentClasses: [],
      recognizedClass: NaN,
      hasCameraPermission: false,
      selectedGroup: undefined,
      selectedProject: undefined,
      classify: false
    };
  }
  render() {
      return (
      <Page name="docs">
        <Navbar title="SVE Docs">
          <NavRight>
              <Link iconF7="camera_on_rectangle" tooltip="Kamera auswählen" onClick={() => {this.$f7.data.selectCamera();}}></Link>
              <Link iconF7="folder_badge_plus" tooltip="Neue Dokumentengruppe erstellen" onClick={() => this.$f7.data.getPopupComponent('NewGroupPopupDocs-New-Group').setComponentVisible(true)}></Link>
              <Link iconF7="qrcode_viewfinder" tooltip="Gruppe mit QR Code beitreten" onClick={() => this.$f7.data.getPopupComponent('QRCodeScanner').setComponentVisible(true)}></Link>
              {(this.state.selectedGroup !== undefined) ? <Link style={{color: "red"}} iconF7="folder_badge_minus" tooltip="Gruppe löschen" onClick={this.removeCurrentGroup.bind(this)}></Link> : "" }
          </NavRight>
        </Navbar> 

        <Block style={{justifyContent: "center", alignContent: "center", width: "100vw"}} strong>
          <List>
            <ListInput
              label="Dokumentengruppe"
              type="select"
              smartSelect
              smartSelectParams={{openIn: 'sheet'}}
              value={this.state.selectedGroupID}
              onInput={(e) => {
                this.setState({selectedGroupID: e.target.value});
                if (isNaN(e.target.value)) {
                  this.setState({selectedProject: undefined});
                } else {
                  new SVEGroup({id: Number(e.target.value)}, this.$f7.data.getUser(), (g) => {
                    this.setState({ selectedGroup: g });
                    g.getProjects().then(ps => {
                      if(ps.length > 0) {
                        this.setState({selectedProject: ps[0]});
                      } else {
                        this.setState({selectedProject: undefined});
                        this.setState({selectedGroupID: NaN});
                      }
                    });
                  });
                }
              }}
            >
              <option value={NaN}>Wähle</option>
              {this.state.documentGroups.map(doc => (
                <option value={doc.getID()}>{doc.getName()}</option>
              ))}
            </ListInput>
            <ListItem style={{justifyContent: "center", alignContent: "center", alignItems: "center", alignSelf: "center"}}>
              <Row>
                <BlockTitle>{(isNaN(this.state.recognizedClass)) ? "Suche..." : this.state.documentClasses.filter(d => d.key === this.state.recognizedClass)[0].class}</BlockTitle>
              </Row>
              <Row>
                {(this.state.selectedProject !== undefined) ? 
                  <CameraDropzone
                    id="CameraDropzone"
                    project={this.state.selectedProject}
                    maxParallelUploads={1}
                    onCameraLoaded={this.predictOnCamera.bind(this)}
                    onImageUploaded={this.classifyImage.bind(this)}
                    onCameraStop={() => this.setState({classify: false})}
                  />
                :
                  <Block largeInset strong style={{height: "20vh"}}>
                    <BlockTitle>Wähle eine Gruppe</BlockTitle>
                  </Block>
                }
              </Row>
            </ListItem>
          </List>
        </Block>

        <NewGroupPopup
          id='Docs-New-Group'
          owningUser={this.$f7.data.getUser()}
          onGroupCreated={(group) => {this.newGroupCreated(group)}}
        />
      </Page>
    );
}
  predict(model, videoElem) {
    if (this.state.classify) {
      let tensor = tf.browser.fromPixels(videoElem);
      tensor = tf.image.resizeBilinear(tensor, [224, 224]);
      const eTensor = tensor.expandDims(0).asType('float32').div(256.0);
      const prediction = model.predict(eTensor);
      console.log("Prediction: " + JSON.stringify(prediction));
      const max = tf.argMax(prediction, 1).dataSync()[0];
      console.log("Choose: " + JSON.stringify(max));
      this.setState({recognizedClass: max});
      window.requestAnimationFrame(this.predict.bind(this, model, videoElem));
    }
  }

  predictOnCamera(videoElem) {
    if(videoElem != undefined) {
      this.setState({classify: true});
      tf.loadLayersModel(SVESystemInfo.getInstance().sources.aiService + '/models/documents.json').then(model => {
        console.log("Start recognition...");
        window.requestAnimationFrame(this.predict.bind(this, model, videoElem));
      }, err => console.log("Error on load model: " + JSON.stringify(err)));
    }
  }

  classifyImage(img) {
    this.$f7.toast.create({
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
    this.$f7.dialog.confirm("Dokumente alle löschen?", "Bestätigen", ()=> {
      self.state.selectedGroup.remove().then(val => {
        self.updateGroupsList();
        if (val) {
          self.setState({selectedGroup: undefined});
        }
      });
    }, () => {});
  }

  newGroupCreated(g) {
    this.$f7.data.getPopupComponent('NewGroupPopupDocs-New-Group').setComponentVisible(false);

    if (g === undefined)
      return;

    let gs = this.state.documentGroups;
    gs.push(g);
    this.setState({documentGroups: gs});
    new SVEProject({
      id: NaN,
      name: "Documents",
      group: g,
      splashImg: "",
      owner: this.$f7.data.getUser(),
      state: SVEProjectState.Open,
      resultsURI: "",
      type: SVEProjectType.Sales
    },
    this.$f7.data.getUser(),
    p => {
      p.store().then(val => {
        if(val) {
          this.setState({selectedProject: p});
        } else {
          this.setState({selectedProject: undefined});
          this.$f7.dialog.alert("Fehler beim Anlegen des initial Projektes!")
        }
      });
    });
  }

  updateGroupsList() {
    SVEGroup.getGroupsOf(this.$f7.data.getUser()).then(groups => {
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
            this.setState({documentGroups: groupsWithOnlyDocs});
          }
        });
      })
    });
  }

  componentDidMount() {
    var self = this;
    this.$f7ready((f7) => {
      self.$f7.data.addLoginHook(() => {
        self.updateGroupsList();
        SVEClassificator.getClasses("documents").then(ret => this.setState({documentClasses: ret}));
      });

      self.updateGroupsList();
    });
  }
  
  componentWillUnmount() {
    //this.postpareTesseract();
  }
}