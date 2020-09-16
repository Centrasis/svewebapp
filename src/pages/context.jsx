import React, { useState, useEffect } from 'react';
import { SwipeoutActions, SwipeoutButton, Page, Navbar, List, ListInput, ListItem, NavRight, Link, Popover, Button, Block, BlockHeader, Popup, Row, Icon } from 'framework7-react';
import Framework7 from 'framework7';
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
      showCamera: false
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

        {/* 
        <Popup className="camera-view" swipeToClose opened={this.state.showCamera} onPopupClosed={() => this.setState({showCamera: false})}>
          <Page style={{display: "flex", alignContent: "center", justifyContent: "center", WebkitAlignContent: "center", WebkitAlignSelf: "center"}}>
            <Camera style={{ flex: 1 }} type={this.state.cameraType}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                }}>
                <TouchableOpacity
                  style={{
                    flex: 0.1,
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    this.state.setCameraType(
                      this.state.cameraType === Camera.Constants.Type.back
                        ? Camera.Constants.Type.front
                        : Camera.Constants.Type.back
                    );
                  }}>
                  <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Flip </Text>
                </TouchableOpacity>
              </View>
            </Camera>
          </Page>
        </Popup>*/}
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

  openCamera() {
    this.setState({showCamera: true});
  }

  onGroupReady(group) {
    if (group.getID() == NaN) // safety first!
      return;

    var router = this.$f7router;
    var f7 = this.$f7;
    var self = this;
    let panelContent = {
        caption: "Gruppenoptionen",
        menueItems: [
          {
            caption: "Neuer Urlaub",
            onClick: function() { router.navigate("/newproject/" + group.getID() + "/") }
          },
          {
            caption: "Einladen",
            onClick: function() { router.navigate("/contextdetails/" + group.getID() + "/") }
          },
          {
            caption: "Neue Gruppe",
            onClick: function() { self.$f7.dialog.alert("Neue Gruppe!"); }
          },
          {
            caption: "Mitglieder",
            onClick: function() { router.navigate("/users/" + group.getID() + "/") }
          }
        ]
    };
    if (this.state.hasCameraPermission)
    {
      panelContent.menueItems.push({
        caption: "Beitreten",
        onClick: function() { self.openCamera() }
      });
    }
    self.$f7.data.pushRightPanel(panelContent);

    self.setState({projects: []});
    group.getProjects().then(prjs => {
      self.setState({projects: prjs});
    });
  }

  componentDidMount() {
    var self = this;
    this.$f7ready((f7) => {
      if (typeof self.state.group === "number") {
        self.setState({group: new SVEGroup(self.state.group, this.$f7.data.getUser(), g => self.onGroupReady(g))});
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