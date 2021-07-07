import React from 'react';
import { SwipeoutActions, SwipeoutButton, Page, Navbar, List, ListInput, ListItem, NavRight, Link, Popover, Button, Block, BlockHeader, Popup, Row, Icon, Preloader } from 'framework7-react';
import NewGroupPopup from './NewGroupPopup';
import NewProjectPopup from './NewProjectPopup';
import QRCodeScanner from './QRCodeScanner';
import Dom7 from 'dom7';
import { f7, f7ready } from 'framework7-react';
import store from '../components/store';

//import { Camera } from 'expo-camera';
import {SVEGroup, SVEProject} from 'svebaselib';
import { LinkProcessor } from '../components/LinkProcessor';
import { PopupHandler } from '../components/PopupHandler';
import { MultiMediaDeviceHandler } from '../components/multimediadevicehandler';
import { PanelMenuItem, SideMenue } from '../components/SideMenue';
import { getDevice } from 'framework7';
import { SVEPageComponent } from '../components/SVEPageComponent';

export default class extends SVEPageComponent {
  protected groupID: number;
  protected group: SVEGroup = undefined;
  protected projects: SVEProject[] = [];
  protected selectedGroup: SVEGroup = undefined;
  protected selectedProject: SVEProject = undefined;

  constructor(props) {
    super(props);

    this.groupID = Number(this.f7route.params.id);
  }

  joinGroup() {
    MultiMediaDeviceHandler.resetCameraPermissions(true);
    PopupHandler.getPopupComponent('QRCodeScanner').setComponentVisible(true);
  }

  protected customRender() {
    return (
      <Page name="context" onPageBeforeRemove={this.onPageBeforeRemove.bind(this)}>
        <Navbar title="Urlaube" backLink="Back">
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
        {(this.projects.length > 0) ? 
        <div>
          <div className={"timeline " + ((getDevice().desktop) ? "timeline-sides" : "")}>
          {this.getProjectsWithDate().map((project) => (
            <div className="timeline-item">
              <div className="timeline-item-date">
                {project.getDateRange().begin.getDate()}
                <small>{this.getMonthOfDate(project.getDateRange().begin)}</small> <br />
                <p style={{fontFamily: 'Courier New', fontSize:"+1"}}>{project.getDateRange().begin.getFullYear()}</p>
              </div>
              <div className="timeline-item-divider"></div>
              <div className="timeline-item-content">
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
          <div style={{justifyContent: "center", justifyItems: "center", position: "fixed", zIndex: 9, left: "50%", top: "50%", transform: "translate(-50%, -50%)"}}>
            <span>Lade Gruppen...</span><br />
            <Preloader color="#11a802"></Preloader>
          </div>
        }

        <Popover className="popover-more">
          <List noChevron>
            <ListItem link="#" popoverClose={true} title="Bearbeiten" onClick={this.onShowEdit.bind(this, this.selectedProject)}/>
            <ListItem link="#" popoverClose={true} title="Löschen" style={{color: "#FF1111"}} onClick={this.onRemoveProject.bind(this, this.selectedProject, true)}/>
          </List>
        </Popover>

        <NewGroupPopup
          id="NG-Context"
          owningUser={store.state.user}
          onGroupCreated={this.onGroupCreated.bind(this)}
          groupToEdit={this.selectedGroup}
        />

        <QRCodeScanner
          id="QRScannerContext"
          onDecoded={(link) => {
            LinkProcessor.joinGroup(link);
            PopupHandler.getPopupComponent('QRCodeScannerQRScannerContext').setComponentVisible(false);
          }}
        />

        {(this.group !== undefined) ? 
          <NewProjectPopup
            owningUser={store.state.user}
            onProjectCreated={this.onNewProject.bind(this)}
            parentGroup={this.group}
            caption={(this.selectedProject === undefined) ? "Neuer Urlaub" : "Bearbeite Projekt: " + this.selectedProject.getName()}
            projectToEdit={this.selectedProject}        
          />
        : ""}
      </Page>
    );
  }

  protected onNewProject(prj: SVEProject) {
    this.group.getProjects().then(prjs => { 
      PopupHandler.getPopupComponent('NewProjectPopup').setComponentVisible(false); 
      this.selectedProject = undefined;
      this.projects = prjs; 
      this.forceUpdate(); 
    });
  }

  getMonthOfDate(date) {
    let months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    
    return months[date.getMonth()]
  }

  getProjectsWithDate() {
    return this.projects.filter(p => p.getDateRange() !== undefined).sort((a,b) => a.getDateRange().begin.getTime() - b.getDateRange().begin.getTime());
  }

  getProjectsWithoutDate() {
    return this.projects.filter(p => p.getDateRange() === undefined);
  }

  applyProjectEdit() {
    var self = this;

    this.selectedProject.store().then((success) => {
      if(success) {
        self.onGroupReady(this.group);
      } else {
        f7.dialog.alert("Fehlende Berechtigung zum bearbeiten!", "Fehlende Berechtigung");
      }
    });
    
    this.selectedProject = undefined; this.forceUpdate();
  }

  onShowEdit(prj) {
    this.selectedProject = prj;
    PopupHandler.getPopupComponent('NewProjectPopup').setComponentVisible(true);
  }

  desktopOpenDetails(prj: SVEProject) {
    this.selectedProject = prj;
    this.forceUpdate();
  }

  onRemoveProject(project: SVEProject, shouldPromt: boolean = false) {
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
    this.selectedGroup = undefined; this.forceUpdate();
    PopupHandler.getPopupComponent('NewGroupPopupNG-Context').setComponentVisible(false);
  }

  openCamera() {
    MultiMediaDeviceHandler.resetCameraPermissions(true);
    PopupHandler.getPopupComponent('QRCodeScannerQRScannerContext').setComponentVisible(true);
    console.log("Open Camera");
  }

  onGroupReady(group: SVEGroup) {
    this.group = group;
    this.groupID = group.getID();

    var router = this.f7router;
    var self = this;
    if (this.group !== undefined) {
      this.group.getRightsForUser(store.state.user).then(rights => {
        let panelContent: PanelMenuItem = {
            caption: "Gruppenoptionen",
            subMenuItems: [
              {
                caption: "Neuer Urlaub",
                icon: "f7:folder_badge_plus",
                color: undefined,
                onClick: function() { PopupHandler.getPopupComponent('NewProjectPopup').setComponentVisible(true); }
              },
              {
                caption: "Teilen",
                icon: "f7:arrowshape_turn_up_right",
                color: undefined,
                onClick: function() { router.navigate("/contextdetails/" + group.getID() + "/") }
              },
              {
                caption: "Neue Gruppe",
                icon: "f7:folder_badge_plus",
                color: undefined,
                onClick: function() { PopupHandler.getPopupComponent('NewGroupPopupNG-Context').setComponentVisible(true); }
              },
              {
                caption: "Gruppe bearbeiten",
                icon: "f7:square_pencil",
                color: undefined,
                onClick: function() { self.selectedGroup = self.group; self.forceUpdate(); PopupHandler.getPopupComponent('NewGroupPopupNG-Context').setComponentVisible(true); }
              },
              {
                caption: "Mitglieder",
                icon: "f7:person_3_fill",
                color: undefined,
                onClick: function() { router.navigate("/users/" + group.getID() + "/") }
              },
              {
                caption: "Beitreten",
                icon: "f7:qrcode_viewfinder",
                color: undefined,
                onClick: function() { self.openCamera() }
              }
            ]
        };
        if (rights.admin)
        {
          panelContent.subMenuItems.push({
            caption: "Gruppe löschen",
            color: "red",
            icon: "f7:trash",
            onClick: function() { 
              f7.dialog.confirm("Möchten Sie das Projekt wirklich löschen?", "Projekt löschen", () => {
                self.group.remove().then(v => {
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
        SideMenue.setRightPanel(panelContent);
      });
    }

    self.projects = []; self.forceUpdate();
    group.getProjects().then(prjs => {
      self.projects = prjs; self.forceUpdate();
    });
  }

  componentDidMount() {
    var self = this;
    f7ready((f7) => {
      if (self.group === undefined) {
        self.group = new SVEGroup({id: self.groupID}, store.state.user, g => self.onGroupReady(g));
      }
    });
  }

  protected pageAfterNavigate(isUserReady: boolean) {
    if (this.group !== undefined) {
      this.onGroupReady(this.group);
    } else {
      if (this.groupID >= 0) {
          this.group = new SVEGroup({id: this.groupID}, store.state.user, g => this.onGroupReady(g));
      }
    }
  }

  protected pageReinit(isUserReady: boolean) {
    if (this.group !== undefined) {
      this.onGroupReady(this.group);
    } else {
      if (this.groupID >= 0) {
          this.group = new SVEGroup({id: this.groupID}, store.state.user, g => this.onGroupReady(g));
      }
    }
  }

  onPageBeforeRemove() {
    console.log("before page remove!");
    // Destroy popup when page removed
    if ((this as any).popup) (this as any).popup.destroy();
  }
}