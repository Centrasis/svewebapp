import React from 'react';
import { Page, Navbar, List, ListItem, NavRight, Searchbar, Link, Block, BlockTitle, Popup, ListInput, ListButton, Col, Row } from 'framework7-react';

//import Tesseract from 'tesseract.js'
//import { pdfjs } from 'react-pdf';

import Dom7 from 'dom7';
import CameraDropzone from './CameraDropzone';
import NewGroupPopup from './NewGroupPopup';
import { SVEProject, SVEGroup, SVEProjectType, SVEProjectState } from 'svebaselib';
import QRCodeScanner from './QRCodeScanner';

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      documentGroups: [],
      selectedGroupID: NaN,
      tesseractThreads: 2,
      scheduler: null,
      hasCameraPermission: false,
      selectedGroup: undefined,
      selectedProject: undefined
    };
  }
  render() {
      return (
      <Page name="docs">
        <Navbar title="SVE Docs">
          <NavRight>
              <Link iconF7="folder_badge_plus" tooltip="Neue Dokumentengruppe erstellen" onClick={() => this.$f7.data.getPopupComponent(NewGroupPopup).setComponentVisible(true)}></Link>
              <Link iconF7="qrcode_viewfinder" tooltip="Gruppe mit QR Code beitreten" onClick={() => this.$f7.data.getPopupComponent(QRCodeScanner).setComponentVisible(true)}></Link>
              {(this.state.selectedGroup !== undefined) ? <Link style={{color: "red"}} iconF7="folder_badge_minus" tooltip="Gruppe löschen" onClick={this.removeCurrentGroup.bind(this)}></Link> : "" }
          </NavRight>
        </Navbar> 

        <Block style={{display: "flex", justifyContent: "center", alignContent: "center", width: "100%"}}>
          <Block style={{justifyContent: "center", alignContent: "center"}} inset strong>
            <List style={{width: "50vw"}}>
              <ListInput
                label="Dokumentengruppe"
                type="select"
                smartSelect
                smartSelectParams={{openIn: 'sheet'}}
                value={this.state.selectedGroupID}
                onInput={(e) => {
                  console.log("Select: " + e.target.value);
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
              <ListItem>
                <Block style={{justifyContent: "center", alignContent: "center"}} inset strong>
                  {(this.state.selectedProject !== undefined) ? 
                    <CameraDropzone 
                      id="CameraDropzone"
                      project={this.state.selectedProject}
                      maxParallelUploads={1}
                      onImageUploaded={this.classifyImage.bind(this)}
                    />
                  :
                    <Block largeInset strong style={{height: "20vh"}}>
                      <BlockTitle>Wähle eine Gruppe</BlockTitle>
                    </Block>
                  }
                </Block>
              </ListItem>
            </List>
          </Block>
        </Block>

        <NewGroupPopup
          owningUser={this.$f7.data.getUser()}
          onGroupCreated={this.newGroupCreated.bind(this)}
        />
      </Page>
    );
}

  classifyImage(img) {
    this.$f7.toast.create({
      icon: '<i class="f7-icons">tray_arrow_up_fill</i>',
      text: 'Archiviert!',
      position: 'center',
      closeTimeout: 1000,
    }).open();
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
    this.$f7.data.getPopupComponent(NewGroupPopup).setComponentVisible(false);

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
            console.log("Project: " + ((p.getType() === SVEProjectType.Vacation) ? "Vacation" : "Sales"));
            if (p.getType() === SVEProjectType.Vacation) {
              vacType = true;
            }
          });

          if(!vacType && ps.length > 0) {
            console.log("Found docs group: " + g.getName());
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
      });

      self.updateGroupsList();
    });
  }
  
  componentWillUnmount() {
    //this.postpareTesseract();
  }
}