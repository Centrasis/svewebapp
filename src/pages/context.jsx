import React, { useState, useEffect } from 'react';
import { SwipeoutActions, SwipeoutButton, Page, Navbar, List, ListInput, ListItem, NavRight, Link, Popover, Button, Block, BlockHeader, Popup, Row, Icon } from 'framework7-react';
import NewGroupPopup from './NewGroupPopup';
import NewProjectPopup from './NewProjectPopup';
import Dom7 from 'dom7';

//import { Camera } from 'expo-camera';
import {SVEGroup} from 'svebaselib';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      group: Number(props.f7route.params.id),
      projects: [],
      hasCameraPermission: false,
      cameraType: '',
      projectToEdit: undefined,
      selectedProject: undefined, //desktop version only
      setCameraType: (t) => {},
      showCamera: false,
      showNewGroupPopup: false,
      showNewProjectPopup: false
    };
  }
  render() {
    {/*const [hasPermission, setHasPermission] = useState(undefined);
    const [type, setType] = useState(Camera.Constants.Type.back);

    useEffect(() => {
      (async () => {
        const { status } = await Camera.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }, []);
    
    this.setState({
      hasCameraPermission: hasPermission,
      cameraType: type,
      setCameraType: setType
    });
    */}
    return (
      <Page name="context" onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
        <Navbar title="Urlaube" backLink="Back">
          <NavRight>
            <Link iconIos="f7:menu" iconAurora="f7:menu" iconMd="material:menu" panelOpen="right" />
          </NavRight>
        </Navbar>
        <List noChevron={this.$f7.device.desktop}>
          {this.state.projects.map((project) => (
            <ListItem
              swipeout
              key={project.getID()}
              title={project.getName()}
              link={`/project/${project.getID()}/`}
              onSwipeoutDeleted={this.onRemoveProject.bind(this, project)}
            >
              <img slot="media" src={project.getSplashImageURI()} width="80"/>
              <SwipeoutActions right={!this.$f7.device.desktop} style={(!this.$f7.device.desktop) ? {} : {display: "none"}}>
                <SwipeoutButton onClick={this.onShowEdit.bind(this, project)}>Bearbeiten</SwipeoutButton>
                <SwipeoutButton delete confirmText={`Möchten Sie das Projekt ${project.getName()} wirklich löschen?`}>Löschen</SwipeoutButton>
              </SwipeoutActions>
              <Link slot="after" href="#" style={(this.$f7.device.desktop) ? {} : {display: "none"}} popoverOpen=".popover-more" onClick={this.desktopOpenDetails.bind(this, project)}>
                <Icon f7="arrowtriangle_down_square" tooltip="Bearbeiten"></Icon>
              </Link>
            </ListItem>
          ))}
        </List>

        <Popover className="popover-more">
          <List noChevron>
            <ListItem link="#" popoverClose={true} title="Bearbeiten" onClick={this.onShowEdit.bind(this, this.state.selectedProject)}/>
            <ListItem link="#" popoverClose={true} title="Löschen" style={{color: "#FF1111"}} onClick={this.onRemoveProject.bind(this, this.state.selectedProject, true)}/>
          </List>
        </Popover>
        
        <Popup className="project-edit" swipeToClose opened={(this.state.projectToEdit != undefined)} onPopupClosed={() => this.setState({projectToEdit: undefined})}>
          <Page style={{display: "flex", alignContent: "center", justifyContent: "center", WebkitAlignContent: "center", WebkitAlignSelf: "center"}}>
            <BlockHeader large>{(this.state.projectToEdit != undefined) ? this.state.projectToEdit.getName() : "Undefined"}&nbsp;bearbeiten</BlockHeader>
            <Block>
              <List>
                <ListInput
                  label="Name"
                  type="text"
                  placeholder={(this.state.projectToEdit != undefined) ? this.state.projectToEdit.getName() : ""}
                  value={(this.state.projectToEdit != undefined) ? this.state.projectToEdit.getName() : ""}
                  onInput={(e) => {
                    var old = this.state.projectToEdit;
                    old.name = e.target.value;
                    this.setState({ projectToEdit: old});
                  }}
                ></ListInput>
                {(this.state.projectToEdit != undefined && this.state.projectToEdit.getDateRange() !== undefined) ? (
                  <ListInput
                  label="Urlaubsbeginn"
                  type="date"
                  placeholder={this.state.projectToEdit.getDateRange().begin.toLocaleDateString()}
                  defaultValue={this.state.projectToEdit.getDateRange().begin.toLocaleDateString()}
                  onInput={(e) => {
                      var old = this.state.projectToEdit;
                      old.begin_point = e.target.value;
                      console.log("Set new begin date: " + JSON.stringify(old));
                      this.setState({ projectToEdit: old});
                    }}
                  ></ListInput>
                ) : (
                  <ListItem>---</ListItem>
                )}
                {(this.state.projectToEdit != undefined && this.state.projectToEdit.getDateRange() !== undefined) ? (
                  <ListInput
                  label="Urlaubsende"
                  type="date"
                  placeholder={this.state.projectToEdit.getDateRange().end.toLocaleDateString()}
                  defaultValue={this.state.projectToEdit.getDateRange().end.toLocaleDateString()}
                  onInput={(e) => {
                      var old = this.state.projectToEdit;
                      old.end_point = e.target.value;
                      this.setState({ projectToEdit: old});
                    }}
                ></ListInput>
                ) : ''}
              </List>
            </Block>
            <Block strong mediumInset>
              <Row tag="p">
                <Button className="col" raised fill onClick={this.applyProjectEdit.bind(this)}>Übernehmen</Button>
              </Row>
            </Block>
          </Page>
        </Popup>

        <NewGroupPopup
          owningUser={this.$f7.data.getUser()}
          visible={this.state.showNewGroupPopup}
          onGroupCreated={this.onGroupCreated.bind(this)}
        />

        {(typeof this.state.group !== "number") ? 
          <NewProjectPopup
            owningUser={this.$f7.data.getUser()}
            visible={this.state.showNewProjectPopup}
            onProjectCreated={(prj) => this.state.group.getProjects().then(prjs => { this.setState({showNewProjectPopup: false, projects: prjs}); })}
            parentGroup={this.state.group}
            caption="Neuer Urlaub"
          />
        : ""}
      </Page>
    );
  }

  applyProjectEdit() {
    var self = this;

    this.state.projectToEdit.store().then((success) => {
      if(success) {
        self.updateContent();
      } else {
        self.$f7.dialog.alert("Fehlende Berechtigung zum bearbeiten!", "Fehlende Berechtigung");
      }
    });
    
    this.setState({ projectToEdit: undefined});
  }

  onShowEdit(prj) {
    this.setState({ projectToEdit: prj});
  }

  desktopOpenDetails(prj) {
    this.setState({selectedProject: prj});
  }

  onRemoveProject(project, shouldPromt = false) {
    if (shouldPromt) {
      var self = this;
      this.$f7.dialog.confirm(`Möchten Sie das Projekt ${project.getName()} wirklich löschen?`, "Löschen?", () => { self.onRemoveProject(project); });
    }
    else {
      var dialog = this.$f7.dialog;
      project.remove().then((sucess) => {
        if(!sucess) {
          dialog.alert("Urlaub konnte nicht gelöscht werden!");
        }
      });
    }
  }

  onGroupCreated(group) {
    this.setState({showNewGroupPopup: false});
  }

  openCamera() {
    this.setState({showCamera: true});
  }

  onGroupReady(group) {
    if (isNaN(group.getID())) // safety first!
      return;

    var router = this.$f7router;
    var f7 = this.$f7;
    var self = this;
    if (typeof this.state.group !== "number") {
      this.state.group.getRightsForUser(this.$f7.data.getUser()).then(rights => {
        let panelContent = {
            caption: "Gruppenoptionen",
            menueItems: [
              {
                caption: "Neuer Urlaub",
                onClick: function() { self.setState({showNewProjectPopup: true}) }
              },
              {
                caption: "Einladen",
                onClick: function() { router.navigate("/contextdetails/" + group.getID() + "/") }
              },
              {
                caption: "Neue Gruppe",
                onClick: function() { self.setState({showNewGroupPopup: true}) }
              },
              {
                caption: "Mitglieder",
                onClick: function() { router.navigate("/users/" + group.getID() + "/") }
              }
            ]
        };
        if (rights.admin)
        {
          panelContent.menueItems.push({
            caption: "Gruppe löschen",
            onClick: function() { 
              self.$f7.dialog.confirm("Möchten Sie das Projekt wirklich löschen?", "Projekt löschen", () => {
                self.state.group.remove().then(v => {
                  if(v) {
                    router.back();
                  } else {
                    self.$f7.dialog.alert("Löschen war nicht möglich! Überprüfen Sie Ihre Rechte.");
                  }
                });
              }, () =>  {});
            }
          });
        }
        if (this.$f7.data.hasCameraPermission())
        {
          panelContent.menueItems.push({
            caption: "Beitreten",
            onClick: function() { self.openCamera() }
          });
        }
        self.$f7.data.pushRightPanel(panelContent);
      });
    }

    self.setState({projects: []});
    group.getProjects().then(prjs => {
      self.setState({projects: prjs});
    });
  }

  componentDidMount() {
    var self = this;
    this.$f7ready((f7) => {
      if (typeof self.state.group === "number") {
        self.setState({group: new SVEGroup({id: self.state.group}, this.$f7.data.getUser(), g => self.onGroupReady(g))});
      }
      Dom7(document).on('page:reinit', function (e) {
        if (typeof self.state.group !== "number")
          self.onGroupReady(self.state.group);
      });
    });
  }

  onPageBeforeRemove() {
    console.log("before page remove!");
    this.$f7.data.popRightPanel();
    // Destroy popup when page removed
    if (this.popup) this.popup.destroy();
  }
}