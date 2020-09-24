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
          <Row style={{justifyContent: "center", alignContent: "center"}}>
            <List style={{width: "50vw"}}>
              <ListInput
                label="Dokumentengruppe"
                type="select"
                smartSelect
                smartSelectParams={{openIn: 'sheet'}}
                value={this.state.selectedGroup}
                onInput={(e) => {
                    new SVEGroup({id: Number(e.target.value)}, this.$f7.data.getUser(), (g) => {
                      this.setState({ selectedGroup: g });
                      g.getProjects().then(ps => {
                        if(ps.length > 0) {
                          this.setState({selectedProject: ps[0]});
                        } else {
                          this.setState({selectedProject: undefined});
                        }
                      });
                    });
                }}
              >
                {this.state.documentGroups.map(doc => (
                  <option value={doc.getID()}>{doc.getName()}</option>
                ))}
              </ListInput>
            </List>
          </Row>
          <Row style={{justifyContent: "center", alignContent: "center"}}>
            {(this.state.selectedProject !== undefined) ? 
              <CameraDropzone 
                project={this.state.selectedProject}
              />
            :
              <Block largeInset strong>
                <BlockTitle>Wähle eine Gruppe</BlockTitle>
              </Block>
            }
          </Row>
        </Block>

        <NewGroupPopup
          owningUser={this.$f7.data.getUser()}
          onGroupCreated={this.newGroupCreated.bind(this)}
        />
      </Page>
    );
}

  removeCurrentGroup() {
    this.state.selectedGroup.remove().then(val => {
      this.updateGroupsList();
      if (val) {
        this.setState({selectedGroup: undefined});
      }
    });
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
      this.updateGroupsList();
    });
  }
  
  componentWillUnmount() {
    //this.postpareTesseract();
  }
}