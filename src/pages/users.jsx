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
import {SVEGroup} from 'svebaselib';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      group: Number(props.f7route.params.id),
      userRights: new Map(),
      detailedUser: undefined,
      selfUser: undefined,
      selfRights: {
        read: false,
        admin: false,
        write: false
      }
    };
  }
  render() {
    return (
  <Page name="users">
    {/* Top Navbar */}
    <Navbar sliding={true} large backLink="Back" title={`Nutzer von ${(typeof this.state.group !== "number") ? this.state.group.getName() : ""}`}>
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
      <p>Nutzerübersicht und Administration für die Gruppe {(typeof this.state.group !== "number") ? this.state.group.getName() : ""}.</p>
    </Block>
    <List>
          {this.getListFromMap(this.state.userRights).map((user) => (
            <ListItem 
              link={this.state.selfUser.getID() != user.key.getID()}
              key={user.key.getID()}
              title={user.key.getName()}
              onClick={this.onDetailsUser.bind(this, user.key)}
              popoverOpen={(this.state.selfUser.getID() != user.key.getID()) ? ".popover-details" : ""}
              disabled={this.state.selfUser.getID() === user.key.getID()}
            />
          ))}
    </List>

    <Popover className="popover-details">
    {(this.state.detailedUser !== undefined && this.state.userRights !== undefined && this.state.userRights.has(this.state.detailedUser)) ? 
      <List>
        <ListItem disabled={true}>
          <p>Aktuelle Rechte</p>
          <List>
            <ListItem>
              <Col><p>Lesen:&nbsp;</p></Col><Col><p>{this.Bool2Str(this.state.userRights.get(this.state.detailedUser).read)}</p></Col>
            </ListItem>
            <ListItem>
              <Col><p>Schreiben:&nbsp;</p></Col><Col><p>{this.Bool2Str(this.state.userRights.get(this.state.detailedUser).write)}</p></Col>
            </ListItem>
            <ListItem>
              <Col><p>Admin:&nbsp;</p></Col><Col><p>{this.Bool2Str(this.state.userRights.get(this.state.detailedUser).admin)}</p></Col>
            </ListItem>
          </List>
        </ListItem>
        {(this.state.selfRights.admin) ? <ListItem link="#" popoverClose={true} title={(this.state.userRights.get(this.state.detailedUser).admin) ? "Adminrechte nehmen" : "Zum Admin machen"} onClick={this.setAdmin.bind(this, this.state.detailedUser, !this.state.userRights.get(this.state.detailedUser).admin)}/> : ""}
        {(this.state.selfRights.admin) ? <ListItem link="#" popoverClose={true} title={"Schreibberechtigungen " + ((this.state.userRights.get(this.state.detailedUser).write) ? "nehmen" : "geben")} onClick={this.setWrite.bind(this, this.state.detailedUser, !this.state.userRights.get(this.state.detailedUser).admin)}/> : ""}
        {(this.state.selfRights.admin) ? <ListItem link="#" popoverClose={true} title={"Leseberechtigungen "+ ((this.state.userRights.get(this.state.detailedUser).read) ? "nehmen" : "geben")} onClick={this.setRead.bind(this, this.state.detailedUser, !this.state.userRights.get(this.state.detailedUser).admin)}/> : ""}
        {(this.state.selfRights.admin) ? <ListItem link="#" popoverClose={true} title="Aus Gruppe entfernen" onClick={this.removeUser.bind(this, this.state.detailedUser)}/> : ""}
      </List>
    : ""}
    </Popover>
  </Page>
  )}

  getListFromMap(map) {
    let ret = [];
    for (let [k, v] of map) {
      ret.push({key: k, value: v});
    }
    return ret;
  }

  Bool2Str(b) {
    return (b) ? "Ja" : "Nein";
  }

  setAdmin(usr, val = true) {
    let r = this.state.userRights.get(usr);
    r.admin = val;
    this.state.group.setRightsForUser(usr, r).then((val) => {
      if(val) {
        this.state.userRights.set(usr, r);
        this.setState({userRights: this.state.userRights});
      }
    });
  }

  setWrite(usr, val = true) {
    let r = this.state.userRights.get(usr);
    r.write = val;
    this.state.group.setRightsForUser(usr, r).then((val) => {
      if(val) {
        this.state.userRights.set(usr, r);
        this.setState({userRights: this.state.userRights});
      }
    });
  }

  setRead(usr, val = true) {
    let r = this.state.userRights.get(usr);
    r.read = val;
    this.state.group.setRightsForUser(usr, r).then((val) => {
      if(val) {
        this.state.userRights.set(usr, r);
        this.setState({userRights: this.state.userRights});
      }
    });
  }

  removeUser(usr) {
    this.state.group.setRightsForUser(usr, {
      read: false,
      write: false,
      admin: false
    }).then((val) => {
      if (val) {
        this.state.userRights.delete(usr);
        this.setState({userRights: this.state.userRights});
      }
    });
  }

  onDetailsUser(usr) {
    this.setState({detailedUser: usr});
  }

  componentDidMount() {
    var self = this;
    this.$f7ready((f7) => {
      if (typeof self.state.group === "number") {
        new SVEGroup(self.state.group, self.$f7.data.getUser(), g => {
          self.setState({group: g});
          g.getUsers().then(usrs => {
            usrs.forEach(u => {
              g.getRightsForUser(u).then(r => {
                let rm = self.state.userRights;
                rm.set(u, r);
                self.setState({userRights: rm});
              });
            });
          });
          g.getRightsForUser(self.$f7.data.getUser()).then(r => {self.setState({selfRights: r})});
        });
        self.setState({selfUser: self.$f7.data.getUser()});
      }
    });
  }
};