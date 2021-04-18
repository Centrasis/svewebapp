import React from 'react';
import {
  Page,
  Navbar,
  NavTitle,
  NavTitleLarge,
  NavRight,
  Link,
  Searchbar,
  Block,
  BlockTitle,
  List,
  ListItem,
  Row,
  Col,
  Button,
  SwipeoutActions,
  SwipeoutButton
} from 'framework7-react';
import Dom7 from 'dom7';
import {SVEAccount, SVEGroup, SVEProject, SVEProjectQuery} from 'svebaselib';
import QRCodeScanner from './QRCodeScanner';
import NewGroupPopup from './NewGroupPopup';
import { f7, f7ready, theme } from 'framework7-react';
import store from '../components/store';
import { MultiMediaDeviceHandler } from '../components/multimediadevicehandler';
import { LinkProcessor } from '../components/LinkProcessor';
import { PopupHandler } from '../components/PopupHandler';
import { getDevice } from 'framework7';
import { SVEPageComponent } from '../components/SVEPageComponent';
import { LoginHook } from '../components/LoginHook';

interface SVESearchResult {
  group: SVEGroup;
  projects: SVEProject[];
}

export default class extends SVEPageComponent<{}> {
  protected groups: SVEGroup[] = [];
  protected showProjects: boolean = false;
  protected home_display_list: SVESearchResult[] = [];

  constructor(props) {
    super(props);
  }

  customRender() {
    return (
  <Page name="home">
    {/* Top Navbar */}
    <Navbar large sliding={false}>
      <NavTitle sliding>Willkommen {(store.state.user !== undefined) ? store.state.user.getName() : ""}</NavTitle>
      <NavTitleLarge>Willkommen {(store.state.user !== undefined) ? store.state.user.getName() : ""}</NavTitleLarge>
      <NavRight>
        <Link iconF7="folder_badge_plus" tooltip="Neue Dokumentengruppe erstellen" onClick={() => PopupHandler.getPopupComponent('NewGroupPopup').setComponentVisible(true)}></Link>
        <Link iconF7="qrcode_viewfinder" tooltip="Gruppe mit QR Code beitreten" onClick={this.joinGroup.bind(this)}></Link>
        <Link searchbarEnable=".searchbar-demo" iconIos="f7:search" iconAurora="f7:search" iconMd="material:search"></Link>
      </NavRight>
      <Searchbar
        className="searchbar-demo"
        expandable
        searchContainer=".search-list"
        searchIn=".item-title"
        onSearchbarSearch={(sb, q, pq) => { this.onSearch(sb, q, pq) }}
        onClickClear={(sb) => { this.onClearSearch(sb) }}
        onClickDisable={(sb) => { this.onDisableSearch(sb) }}
        onSearchbarEnable={(sb) => { this.onEnableSearch(sb) }}
        onSearchbarDisable={(sb) => { this.onDisableSearch(sb) }}
        disableButton={!theme.aurora}
        customSearch={true}
    ></Searchbar>
    </Navbar>

    {/* Page content */}
    <Block strong id="intro">
      <p>Willkommen im neuen SnowVision-Entertainment online Portal!</p>

      <p>Falls du es noch nicht getan hast, installiere diese App auf deinem Handy. Unter Apples iOS geht dies über die "Teilen" Funktion in der Safari Werkzeugleiste unten am Bildschirm. Das installieren der Webapp erlaubt es, weitere Funktionen zu nutzen.</p>
    </Block>

    <BlockTitle large>Deine Urlaubsgruppen</BlockTitle>
    <List className="search-list searchbar-found">
          {this.home_display_list.map((context) => (
            <ListItem
              swipeout
              id={context.group.getName()}
              key={context.group.getID()}
              title={context.group.getName()}
              link={`/context/${context.group.getID()}/`}
              onSwipeoutDeleted={this.onRemoveGroup.bind(this, context.group)}
            >
              <SwipeoutActions right={!getDevice().desktop} style={(!getDevice().desktop) ? {} : {display: "none"}}>
                <SwipeoutButton delete confirmText={`Möchten Sie die Gruppe ${context.group.getName()} wirklich löschen?`}>Löschen</SwipeoutButton>
              </SwipeoutActions>
              {(this.showProjects && context.projects.length > 0) ? (
                <Block slot="content" mediumInset>
                  <BlockTitle>Projekte</BlockTitle>
                  <List>
                    {context.projects.map((project) => (
                      <ListItem
                        id={project.getName()}
                        key={project.getID()}
                        title={project.getName()}
                        link={`/project/${project.getID()}/`}
                      >
                        <img slot="media" src={project.getSplashImageURI()} width="60"/>
                      </ListItem>
                    ))}
                  </List>
                </Block>
              ) : ""}
            </ListItem>
          ))}
    </List>
    <Block strong>
      <Link href="/settings/" iconF7="gear" tooltip="Einstellungen">&nbsp;Einstellungen</Link>
    </Block>
    {(!getDevice().standalone && (getDevice().android || getDevice().ios)) ? 
      <Block strong>
        <Link href="/install/" iconF7="square_arrow_down">&nbsp;App installieren</Link>
      </Block>
    : ""}
    <Block strong>
      <Link href="/about/">Über die SVE-API</Link>
    </Block>
    <Block strong>
      <Link href="#" color="red" textColor="red" onClick={this.logOut.bind(this)}>Logout</Link>
    </Block>

    <QRCodeScanner
      onDecoded={(link) => {
        LinkProcessor.joinGroup(link);
        PopupHandler.getPopupComponent('QRCodeScanner').setComponentVisible(false);
      }}
    />

    {(store.state.user !== undefined) ?
      <NewGroupPopup
        owningUser={store.state.user}
        onGroupCreated={(group) => { PopupHandler.getPopupComponent('NewGroupPopup').setComponentVisible(false); this.updateContent(store.state.user); }}
      />
    : ""}
  </Page>
    );
  }

  joinGroup() {
    MultiMediaDeviceHandler.resetCameraPermissions(true);
    PopupHandler.getPopupComponent('QRCodeScanner').setComponentVisible(true);
  }

  onRemoveGroup(group: SVEGroup) {
    group.remove().then(v => {
      this.updateContent(store.state.user);
    });
  }

  logOut() {
    store.dispatch("clearUser", {});
  }

  onSearch(sb, query, prevQuery) {
    if (query === undefined || query.length == 0) {
      return;
    }
    SVEProjectQuery.query(query, store.state.user).then(results => {
      let groups = results.filter(e => e.constructor.name === SVEGroup.name);
      let projects = results.filter(e => e.constructor.name === SVEProject.name);
      console.log("Query result: " + JSON.stringify(groups) + " prjs: -> " + JSON.stringify(projects));

      let list = [];
      groups.forEach(g => {
        let prjs = [];
        projects.filter(e => (e as SVEProject).getGroup().getID() === g.getID()).forEach((e) => prjs.push(e));
        
        list.push({group: g, projects: prjs});
      });

      this.home_display_list = list; this.forceUpdate();
    });
  }

  onClearSearch(sb) {
    let list = [];
    this.groups.forEach(g => {
      list.push({
        group: g,
        projects: []
      });
    });
    this.home_display_list = list; this.forceUpdate();
  }

  onEnableSearch(sb) {
    Dom7("#intro").hide();
    this.onClearSearch(sb);
    this.home_display_list = []; this.forceUpdate();
    this.showProjects = true; this.forceUpdate();
  }

  onDisableSearch(sb) {
    Dom7("#intro").show();
    this.onClearSearch(sb);
    this.showProjects = false; this.forceUpdate();
  }

  protected updateContent(user: SVEAccount) {
    SVEGroup.getGroupsOf(user).then(gs => {
      this.groups = gs;
      let list = [];
      gs.forEach(g => {
        list.push({
          group: g,
          projects: []
        });
      });
      this.home_display_list = list;
      this.forceUpdate();
    }, err => {
      f7.dialog.alert("Can't fetch groups from server!", "Server down!");
      store.dispatch("clearUser", {});
      this.forceUpdate();
    });
  }

  protected onUserLoggedIn(user: SVEAccount) {
    this.updateContent(user);
  }

  protected pageAfterNavigate(isUserReady: boolean) {
    if(!isUserReady) {
      this.f7router.navigate("/login/");
    } else {
      this.updateContent(this.user);
    }
  }

  protected pageReinit(isUserReady: boolean) {
    if(!isUserReady) {
      this.f7router.navigate("/login/");
    } else {
      this.updateContent(this.user);
    }
  }
};