import React from 'react';
import {
  Page,
  Navbar,
  NavRight,
  Link,
  Block,
  List,
  ListItem,
  Popover,
  f7,
  Searchbar,
  Row,
  Col
} from 'framework7-react';

import Dom7 from 'dom7';


export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contextID: props.f7route.params.id,
      contextName: "",
      users: [],
      detailedUser: {
        id: -1,
        canRead: false,
        canWrite: false,
        isAdmin: false
      },
      selfUser: {

      }
    };
  }
  render() {
    return (
  <Page name="users">
    {/* Top Navbar */}
    <Navbar sliding={true} large backLink="Back" title={`Nutzer von ${this.state.contextName}`}>
    <NavRight>
      <Link searchbarEnable=".searchbar-demo" iconIos="f7:search" iconAurora="f7:search" iconMd="material:search"></Link>
    </NavRight>
    <Searchbar
        className="searchbar-demo"
        expandable
        searchContainer=".search-list"
        searchIn=".item-title"
        disableButton={!this.$theme.aurora}
    ></Searchbar>
    </Navbar>

    {/* Page content */}
    <Block strong>
      <p>Nutzerübersicht und Administration für die Gruppe {this.state.contextName}.</p>
    </Block>
    <List>
          {this.state.users.map((user) => (
            <ListItem 
              link={this.state.selfUser.id != user.id}
              key={user.id}
              title={user.name}
              onClick={this.onDetailsUser.bind(this, user)}
              popoverOpen={(this.state.selfUser.id != user.id) ? ".popover-details" : ""}
              disabled={this.state.selfUser.id === user.id}
            />
          ))}
    </List>

    <Popover className="popover-details">
      <List>
        <ListItem disabled={true}>
          <p>Aktuelle Rechte</p>
          <List>
            <ListItem>
              <Col><p>Lesen:&nbsp;</p></Col><Col><p>{this.Bool2Str(this.state.detailedUser.canRead)}</p></Col>
            </ListItem>
            <ListItem>
              <Col><p>Schreiben:&nbsp;</p></Col><Col><p>{this.Bool2Str(this.state.detailedUser.canWrite)}</p></Col>
            </ListItem>
            <ListItem>
              <Col><p>Admin:&nbsp;</p></Col><Col><p>{this.Bool2Str(this.state.detailedUser.isAdmin)}</p></Col>
            </ListItem>
          </List>
        </ListItem>
        <ListItem link="#" popoverClose={true} title="Zum Admin machen" onClick={this.setAdmin.bind(this, this.state.detailedUser)}/>
        <ListItem link="#" popoverClose={true} title="Schreibberechtigungen geben" onClick={this.setWrite.bind(this, this.state.detailedUser)}/>
        <ListItem link="#" popoverClose={true} title="Leseberechtigungen geben" onClick={this.setRead.bind(this, this.state.detailedUser)}/>
        <ListItem link="#" popoverClose={true} title="Aus Gruppe entfernen" onClick={this.removeUser.bind(this, this.state.detailedUser)}/>
      </List>
    </Popover>
  </Page>
  )}

  Bool2Str(b) {
    if (b)
    {
      return "Ja";
    }
    return "Nein";
  }

  setAdmin(usr) {
    this.$f7.request.get(this.$f7.apiPath + "/editRights.php?context=" + this.state.contextID + "&user="+usr.id+"&r=true&w=true&a=true");
  }

  setWrite(usr) {
    this.$f7.request.get(this.$f7.apiPath + "/editRights.php?context=" + this.state.contextID + "&user="+usr.id+"&r=true&w=true&a=false");
  }

  setRead(usr) {
    this.$f7.request.get(this.$f7.apiPath + "/editRights.php?context=" + this.state.contextID + "&user="+usr.id+"&r=true&w=false&a=false");
  }

  removeUser(usr) {
    this.$f7.request.get(this.$f7.apiPath + "/editRights.php?context=" + this.state.contextID + "&user="+usr.id+"&r=false&w=false&a=false");
  }

  onDetailsUser(usr) {
    var self = this;
    var $$ = Dom7;

    self.$f7.request.get(self.$f7.apiPath + "/getUserInfo.php?context=" + self.state.contextID+"&id="+usr.id, function(data) {
      self.state.detailedUser = JSON.parse(data);
      self.setState({detailedUser: JSON.parse(data)});
    });
  }

  componentDidMount() {
    var router = this.$f7router;
    var self = this;
    this.$f7ready((f7) => {
      f7.request.get(f7.apiPath + "/getContextInfo.php?context=" + self.state.contextID, function(data) {
        self.state.contextName = JSON.parse(data).name;
        self.setState({contextName: JSON.parse(data).name});

        f7.request.get(f7.apiPath + "/getAccountInfo.php", function(data) {
          var user = JSON.parse(data);
          self.state.selfUser = user;
          self.setState({selfUser: user});

          f7.request.get(f7.apiPath + "/getUsersOfContext.php?context=" + self.state.contextID, function(data) {
            self.setState({users: JSON.parse(data)});
          });
        });
      },
      function(xhr, status) {
        router.navigate('/login/');
      });
    });
  }
};