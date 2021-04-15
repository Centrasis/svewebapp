import React from 'react';
import { SwipeoutActions, SwipeoutButton, Page, Navbar, List, ListInput, ListItem, NavRight, Link, Popover, Button, Block, BlockHeader, Popup, Row, Icon, Preloader } from 'framework7-react';
import NewGroupPopup from './NewGroupPopup';
import NewProjectPopup from './NewProjectPopup';
import QRCodeScanner from './QRCodeScanner';
import Dom7 from 'dom7';
import { f7, f7ready } from 'framework7-react';
import store from '../components/store';

//import { Camera } from 'expo-camera';
import {SVEGroup} from 'svebaselib';
import { LinkProcessor } from '../components/LinkProcessor';
import { PopupHandler } from '../components/PopupHandler';
import { MultiMediaDeviceHandler } from '../components/multimediadevicehandler';
import { SideMenue } from '../components/SideMenue';
import { getDevice } from 'framework7';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      group: Number(props.f7route.params.id),
      projects: [],
      selectedGroup: undefined,
      selectedProject: undefined
    };
  }
  render() {
    return (
      <Page name="context" onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
        <Navbar title="Urlaube" backLink="Back">
        {(!getDevice().desktop) ? (
          <NavRight>
            <Link iconIos="f7:menu" iconAurora="f7:menu" iconMd="material:menu" panelOpen="right" />
          </NavRight>
        ) : (
          <NavRight>
            <Link iconF7="folder_badge_plus" tooltip="Neues Projekt" onClick={() => PopupHandler.getPopupComponent('NewProjectPopup').setComponentVisible(true)}/>
            <Link iconF7="qrcode_viewfinder" tooltip="Beitreten" onClick={this.joinGroup.bind(this)} onClick={() => this.$f7router.navigate("/contextdetails/" + group.getID() + "/")} />
            <Link iconIos="f7:arrowshape_turn_up_right" iconAurora="f7:arrowshape_turn_up_right" iconMd="f7:arrowshape_turn_up_right" tooltip="Teilen und Einladen" onClick={() => this.$f7router.navigate("/contextdetails/" + group.getID() + "/")}/>
            <Link iconIos="f7:person_3_fill" iconAurora="f7:person_3_fill" iconMd="f7:person_3_fill" tooltip="Mitglieder" onClick={() =>  this.$f7router.navigate("/projectdetails/" + this.state.project.getID() + "/")}/>    
            <Link iconIos="f7:square_pencil" iconAurora="f7:square_pencil" iconMd="f7:square_pencil" tooltip="Bearbeiten" onClick={() => PopupHandler.getPopupComponent('NewProjectPopupProjectDisplay').setComponentVisible(true)}/>           
          </NavRight>
        )}
        </Navbar>
        {(this.state.projects.length > 0) ? 
        <div>
          <div class={"timeline " + ((getDevice().desktop) ? "timeline-sides" : "")}>
          {this.getProjectsWithDate().map((project) => (
            <div class="timeline-item">
              <div class="timeline-item-date">
                {project.getDateRange().begin.getDate()}
                <small>{this.getMonthOfDate(project.getDateRange().begin)}</small> <br />
                <p style={{fontFamily: 'Courier New', fontSize:"+1"}}>{project.getDateRange().begin.getFullYear()}</p>
              </div>
              <div class="timeline-item-divider"></div>
              <div class="timeline-item-content">
                <List noChevron={getDevice().desktop}>
                  <ListItem
                    swipeout
                    key={project.getID()}
                    title={project.getName()}
                    link={`/project/${project.getID()}/`}
                    onSwipeoutDeleted={this.onRemoveProject.bind(this, project)}
                  >
                    <img slot="media" src={project.getSplashImageURI()} width="80"/>
                    <SwipeoutActions right={!getDevice().desktop} style={(!getDevice().desktop) ? {} : {display: "none"}}>
                      <SwipeoutButton onClick={this.onShowEdit.bind(this, project)}>Bearbeiten</SwipeoutButton>
                      <SwipeoutButton delete confirmText={`Möchten Sie das Projekt ${project.getName()} wirklich löschen?`}>Löschen</SwipeoutButton>
                    </SwipeoutActions>
                    <Link slot="after" href="#" style={(getDevice().desktop) ? {} : {display: "none"}} popoverOpen=".popover-more" onClick={this.desktopOpenDetails.bind(this, project)}>
                      <Icon f7="arrowtriangle_down_square" tooltip="Bearbeiten"></Icon>
                    </Link>
                  </ListItem>
                </List>
              </div>
            </div>
          ))}
          </div>
          {(this.getProjectsWithoutDate().length > 0) ? 
            <List noChevron={getDevice().desktop}>
              {this.getProjectsWithoutDate().map((project) => (
                <ListItem
                  swipeout
                  key={project.getID()}
                  title={project.getName()}
                  link={`/project/${project.getID()}/`}
                  onSwipeoutDeleted={this.onRemoveProject.bind(this, project)}
                >
                  <img slot="media" src={project.getSplashImageURI()} width="80"/>
                  <SwipeoutActions right={!getDevice().desktop} style={(!getDevice().desktop) ? {} : {display: "none"}}>
                    <SwipeoutButton onClick={this.onShowEdit.bind(this, project)}>Bearbeiten</SwipeoutButton>
                    <SwipeoutButton delete confirmText={`Möchten Sie das Projekt ${project.getName()} wirklich löschen?`}>Löschen</SwipeoutButton>
                  </SwipeoutActions>
                  <Link slot="after" href="#" style={(getDevice().desktop) ? {} : {display: "none"}} popoverOpen=".popover-more" onClick={this.desktopOpenDetails.bind(this, project)}>
                    <Icon f7="arrowtriangle_down_square" tooltip="Bearbeiten"></Icon>
                  </Link>
                </ListItem>
              ))}
            </List>
          : ""}
        </div>
        : 
          <div style={{justifyContent: "center", justifyItems: "center", position: "fixed", zIndex: "9", left: "50%", top: "50%", transform: "translate(-50%, -50%)"}}>
            <span>Lade Gruppen...</span><br />
            <Preloader></Preloader>
          </div>
        }

        <Popover className="popover-more">
          <List noChevron>
            <ListItem link="#" popoverClose={true} title="Bearbeiten" onClick={this.onShowEdit.bind(this, this.state.selectedProject)}/>
            <ListItem link="#" popoverClose={true} title="Löschen" style={{color: "#FF1111"}} onClick={this.onRemoveProject.bind(this, this.state.selectedProject, true)}/>
          </List>
        </Popover>

        <NewGroupPopup
          id="NG-Context"
          owningUser={store.state.user}
          onGroupCreated={this.onGroupCreated.bind(this)}
          groupToEdit={this.state.selectedGroup}
        />

        <QRCodeScanner
          id="QRScannerContext"
          onDecoded={(link) => {
            LinkProcessor.joinGroup(link);
            PopupHandler.getPopupComponent('QRCodeScannerQRScannerContext').setComponentVisible(false);
          }}
        />

        {(typeof this.state.group !== "number") ? 
          <NewProjectPopup
            owningUser={store.state.user}
            onProjectCreated={(prj) => this.state.group.getProjects().then(prjs => { PopupHandler.getPopupComponent('NewProjectPopup').setComponentVisible(false); this.setState({ selectedProject: undefined, projects: prjs}); })}
            parentGroup={this.state.group}
            caption={(this.state.selectedProject === undefined) ? "Neuer Urlaub" : "Bearbeite Projekt: " + this.state.selectedProject.getName()}
            projectToEdit={this.state.selectedProject}
          />
        : ""}
      </Page>
    );
  }

  getMonthOfDate(date) {
    let months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    
    return months[date.getMonth()]
  }

  getProjectsWithDate() {
    return this.state.projects.filter(p => p.getDateRange() !== undefined).sort((a,b) => a.getDateRange().begin.getTime() - b.getDateRange().begin.getTime());
  }

  getProjectsWithoutDate() {
    return this.state.projects.filter(p => p.getDateRange() === undefined);
  }

  applyProjectEdit() {
    var self = this;

    this.state.selectedProject.store().then((success) => {
      if(success) {
        self.updateContent();
      } else {
        f7.dialog.alert("Fehlende Berechtigung zum bearbeiten!", "Fehlende Berechtigung");
      }
    });
    
    this.setState({ selectedProject: undefined});
  }

  onShowEdit(prj) {
    this.setState({ selectedProject: prj});
    PopupHandler.getPopupComponent('NewProjectPopup').setComponentVisible(true);
  }

  desktopOpenDetails(prj) {
    this.setState({selectedProject: prj});
  }

  onRemoveProject(project, shouldPromt = false) {
    if (shouldPromt) {
      var self = this;
      f7.dialog.confirm(`Möchten Sie das Projekt ${project.getName()} wirklich löschen?`, "Löschen?", () => { self.onRemoveProject(project); });
    }
    else {
      var dialog = f7.dialog;
      project.remove().then((sucess) => {
        if(!sucess) {
          dialog.alert("Urlaub konnte nicht gelöscht werden!");
        }
      });
    }
  }

  onGroupCreated(group) {
    this.setState({selectedGroup: undefined});
    PopupHandler.getPopupComponent('NewGroupPopupNG-Context').setComponentVisible(false);
  }

  openCamera() {
    MultiMediaDeviceHandler.resetCameraPermissions(true);
    PopupHandler.getPopupComponent('QRCodeScannerQRScannerContext').setComponentVisible(true);
    console.log("Open Camera");
  }

  onGroupReady(group) {
    if (isNaN(group.getID())) // safety first!
      return;

    var router = this.$f7router;
    var self = this;
    if (typeof this.state.group !== "number") {
      this.state.group.getRightsForUser(store.state.user).then(rights => {
        let panelContent = {
            caption: "Gruppenoptionen",
            subMenuItems: [
              {
                caption: "Neuer Urlaub",
                onClick: function() { PopupHandler.getPopupComponent('NewProjectPopup').setComponentVisible(true); }
              },
              {
                caption: "Teilen",
                onClick: function() { router.navigate("/contextdetails/" + group.getID() + "/") }
              },
              {
                caption: "Neue Gruppe",
                onClick: function() { PopupHandler.getPopupComponent('NewGroupPopupNG-Context').setComponentVisible(true); }
              },
              {
                caption: "Gruppe bearbeiten",
                onClick: function() { self.setState({selectedGroup: self.state.group}); PopupHandler.getPopupComponent('NewGroupPopupNG-Context').setComponentVisible(true); }
              },
              {
                caption: "Mitglieder",
                onClick: function() { router.navigate("/users/" + group.getID() + "/") }
              },
              {
                caption: "Beitreten",
                onClick: function() { self.openCamera() }
              }
            ]
        };
        if (rights.admin)
        {
          panelContent.subMenuItems.push({
            caption: "Gruppe löschen",
            color: "red",
            onClick: function() { 
              f7.dialog.confirm("Möchten Sie das Projekt wirklich löschen?", "Projekt löschen", () => {
                self.state.group.remove().then(v => {
                  if(v) {
                    router.back();
                  } else {
                    f7.dialog.alert("Löschen war nicht möglich! Überprüfen Sie Ihre Rechte.");
                  }
                });
              }, () =>  {});
            }
          });
        }
        SideMenue.pushRightPanel(panelContent);
      });
    }

    self.setState({projects: []});
    group.getProjects().then(prjs => {
      self.setState({projects: prjs});
    });
  }

  componentDidMount() {
    var self = this;
    f7ready((f7) => {
      if (typeof self.state.group === "number") {
        self.setState({group: new SVEGroup({id: self.state.group}, store.state.user, g => self.onGroupReady(g))});
      }
      Dom7(document).on('page:reinit', function (e) {
        if (typeof self.state.group !== "number")
          self.onGroupReady(self.state.group);
      });
    });
  }

  onPageBeforeRemove() {
    console.log("before page remove!");
    // Destroy popup when page removed
    if (this.popup) this.popup.destroy();
  }
}