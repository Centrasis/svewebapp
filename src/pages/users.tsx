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
  Col,
  BlockHeader
} from 'framework7-react';

import Dom7 from 'dom7';
import {BasicUserInitializer, SVEAccount, SVEGroup, UserRights} from 'svebaselib';
import { f7ready, theme } from 'framework7-react';
import store from '../components/store';
import { SVEPageComponent } from '../components/SVEPageComponent';
import { any } from 'prop-types';

export default class extends SVEPageComponent {
  protected group: SVEGroup = undefined; 
  protected userRights: Map<SVEAccount, UserRights> = new Map<SVEAccount, UserRights>();
  protected detailedUser: SVEAccount = undefined;
  protected selfRights: UserRights = undefined;

  constructor(props) {
    super(props);
    new SVEGroup({id: Number(this.f7route.params.id)}, this.user, (g) => {
      this.group = g;
      g.getRightsForUser(this.user).then(r => {
        this.selfRights = r;
        this.forceUpdate();
      });

      g.getUsers().then(usrs => {
        usrs.forEach(u => {
          g.getRightsForUser(u).then(r => {
            this.userRights.set(u, r);
            this.forceUpdate();
          });
        })
      });

      this.forceUpdate();
    });

    new SVEAccount({
      id: Number(this.f7route.params.id),
      requester: this.user
    } as BasicUserInitializer, (usr) => {

    });
  }

  protected customRender() {
    return (
  <Page name="users">
    {/* Top Navbar */}
    <Navbar sliding={true} large backLink="Back" title={`Nutzer von ${(typeof this.group !== "number") ? this.group.getName() : ""}`}>
    <NavRight>
      <Link searchbarEnable=".searchbar-demo" iconIos="f7:search" iconAurora="f7:search" iconMd="material:search"></Link>
    </NavRight>
    <Searchbar
        className="searchbar-demo"
        expandable
        searchContainer=".search-list"
        searchIn=".item-title"
        disableButton={!theme.aurora}
    ></Searchbar>
    </Navbar>

    {/* Page content */}
    <Block strong>
      <p>Nutzerübersicht und Administration für die Gruppe {(typeof this.group !== "number") ? this.group.getName() : ""}.</p>
    </Block>
    {(this.user !== undefined) ? (
    <List>
          {this.getListFromMap(this.userRights).map((user) => (
            <ListItem 
              link={this.user.getID() != user.key.getID()}
              key={user.key.getID()}
              title={user.key.getName()}
              onClick={this.onDetailsUser.bind(this, user.key)}
              popoverOpen={(this.user.getID() != user.key.getID()) ? ".popover-details" : ""}
              disabled={this.user.getID() === user.key.getID()}
            />
          ))}
    </List>) : ""}

    <Popover className="popover-details">
    {(this.detailedUser !== undefined && this.userRights !== undefined && this.userRights.has(this.detailedUser)) ? 
      <List>
        <ListItem disabled={true}>
          <p>Aktuelle Rechte</p>
          <List>
            <ListItem>
              <Col><p>Lesen:&nbsp;</p></Col><Col><p>{this.Bool2Str(this.userRights.get(this.detailedUser).read)}</p></Col>
            </ListItem>
            <ListItem>
              <Col><p>Schreiben:&nbsp;</p></Col><Col><p>{this.Bool2Str(this.userRights.get(this.detailedUser).write)}</p></Col>
            </ListItem>
            <ListItem>
              <Col><p>Admin:&nbsp;</p></Col><Col><p>{this.Bool2Str(this.userRights.get(this.detailedUser).admin)}</p></Col>
            </ListItem>
          </List>
        </ListItem>
        {(this.selfRights.admin) ? <ListItem link="#" popoverClose={true} title={(this.userRights.get(this.detailedUser).admin) ? "Adminrechte nehmen" : "Zum Admin machen"} onClick={this.setAdmin.bind(this, this.detailedUser, !this.userRights.get(this.detailedUser).admin)}/> : ""}
        {(this.selfRights.admin) ? <ListItem link="#" popoverClose={true} title={"Schreibberechtigungen " + ((this.userRights.get(this.detailedUser).write) ? "nehmen" : "geben")} onClick={this.setWrite.bind(this, this.detailedUser, !this.userRights.get(this.detailedUser).write)}/> : ""}
        {(this.selfRights.admin) ? <ListItem link="#" popoverClose={true} title={"Leseberechtigungen "+ ((this.userRights.get(this.detailedUser).read) ? "nehmen" : "geben")} onClick={this.setRead.bind(this, this.detailedUser, !this.userRights.get(this.detailedUser).read)}/> : ""}
        {(this.selfRights.admin) ? <ListItem link="#" popoverClose={true} title="Aus Gruppe entfernen" onClick={this.removeUser.bind(this, this.detailedUser)}/> : ""}
      </List>
    : <BlockHeader>Rechte unbekannt!</BlockHeader>}
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

  setAdmin(usr, val) {
    let r = this.userRights.get(usr);
    r.admin = val;
    this.group.setRightsForUser(usr, r).then((val) => {
      if(val) {
        this.userRights.set(usr, r);
        this.userRights = this.userRights; this.forceUpdate();
      }
    });
  }

  setWrite(usr, val) {
    let r = this.userRights.get(usr);
    r.write = val;
    this.group.setRightsForUser(usr, r).then((val) => {
      if(val) {
        this.userRights.set(usr, r);
        this.userRights = this.userRights; this.forceUpdate();
      }
    });
  }

  setRead(usr, val) {
    let r = this.userRights.get(usr);
    r.read = val;
    this.group.setRightsForUser(usr, r).then((val) => {
      if(val) {
        this.userRights.set(usr, r);
        this.userRights = this.userRights; this.forceUpdate();
      }
    });
  }

  removeUser(usr) {
    this.group.setRightsForUser(usr, {
      read: false,
      write: false,
      admin: false
    }).then((val) => {
      if (val) {
        this.userRights.delete(usr);
        this.userRights = this.userRights; this.forceUpdate();
      }
    });
  }

  onDetailsUser(usr) {
    this.detailedUser = usr; this.forceUpdate();
  }
};