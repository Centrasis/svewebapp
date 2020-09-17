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
  Button
} from 'framework7-react';
import Dom7 from 'dom7';
import {SVEGroup, SVEProject, SVEProjectQuery} from 'svebaselib';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      groups: [],
      showProjects: false,
      home_display_list: []
    };
  }
  render() {
    return (
  <Page name="home">
    {/* Top Navbar */}
    <Navbar large sliding={false}>
      <NavTitle sliding>Willkommen {(this.$f7.data.getUser() !== undefined) ? this.$f7.data.getUser().getName() : ""}</NavTitle>
      <NavTitleLarge sliding>Willkommen {(this.$f7.data.getUser() !== undefined) ? this.$f7.data.getUser().getName() : ""}</NavTitleLarge>
      <NavRight>
        <Link searchbarEnable=".searchbar-demo" iconIos="f7:search" iconAurora="f7:search" iconMd="material:search"></Link>
      </NavRight>
      <Searchbar
        className="searchbar-demo"
        expandable
        searchContainer=".search-list"
        searchIn=".item-title"
        onSearchbarSearch={(sb, q, pq) => { this.onSearch(sb, q, pq) }}
        onClickClear={(sb, pq) => { this.onClearSearch(sb) }}
        onClickDisable={(sb) => { this.onDisableSearch(sb) }}
        onSearchbarEnable={(sb) => { this.onEnableSearch(sb) }}
        onSearchbarDisable={(sb) => { this.onDisableSearch(sb) }}
        disableButton={!this.$theme.aurora}
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
          {this.state.home_display_list.map((context) => (
            <ListItem
              id={context.group.getName()}
              key={context.group.getID()}
              title={context.group.getName()}
              link={`/context/${context.group.getID()}/`}
            >
              {(this.state.showProjects) ? (
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
                        <Img slot="media" src={project.getSplashImageURI()} width="60"/>
                      </ListItem>
                    ))}
                  </List>
                </Block>
              ) : ""}
            </ListItem>
          ))}
    </List>
    <Block strong>
      <Link href="/gamehub/">Zum Spiele-Hub</Link>
    </Block>
    {(!this.$f7.device.standalone && (this.$f7.device.android || this.$f7.device.ios)) ? 
      <Block strong>
        <Link href="/install/">App installieren</Link>
      </Block>
    : ""}
    <Block strong>
      <Link href="/about/">Über die SVE-API</Link>
    </Block>
    <Block strong>
      <Link href="#" color="red" textColor="red" onClick={this.logOut.bind(this)}>Logout</Link>
    </Block>
  </Page>
    );
  }

  logOut() {
    window.localStorage.removeItem("sve_token");
    window.localStorage.removeItem("sve_user");
    this.$f7.loginScreen.open("#login-screen");
  }

  onSearch(sb, query, prevQuery) {
    if (query === undefined || query.length == 0)
    {
      return;
    }
    SVEProjectQuery.query(query, this.$f7.data.getUser()).then(results => {
      let groups = results.filter(e => e.constructor.name === SVEGroup.name);
      let projects = results.filter(e => e.constructor.name === SVEProject.name);
      console.log("Query result: " + JSON.stringify(groups) + " prjs: -> " + JSON.stringify(projects));

      let list = [];
      groups.forEach(g => {
        let prjs = [];
        projects.filter(e => e.getGroup().getID() === g.getID()).forEach((e) => prjs.push(e));
        
        list.push({group: g, projects: prjs});
      });

      this.setState({home_display_list: list});
    });
  }

  onClearSearch(sb) {
    let list = [];
    this.state.groups.forEach(g => {
      list.push({
        group: g,
        projects: []
      });
    });
    self.setState({home_display_list: list});
  }

  onEnableSearch(sb) {
    Dom7("#intro").hide();
    this.onClearSearch(sb);
    this.setState({showProjects: true});
  }

  onDisableSearch(sb) {
    Dom7("#intro").show();
    this.onClearSearch(sb);
    this.setState({showProjects: false});
  }

  updateContent() {
    var self = this;;

    if(this.$f7.data.getUser() !== undefined) {
      SVEGroup.getGroupsOf(this.$f7.data.getUser()).then(gs => {
        self.setState({
          groups: gs
        });
        let list = [];
        gs.forEach(g => {
          list.push({
            group: g,
            projects: []
          });
        });
        self.setState({home_display_list: list});
      }, err => this.$f7.dialog.alert("Can't fetch groups from server!", "Server down!"));
    } else {
      this.$f7.loginScreen.open("#login-screen");
    }

    var self = this;
    let panelContent = {
        caption: "Allgemein",
        menueItems: [
          {
            caption: "Neue Gruppe",
            onClick: function() { self.$f7.dialog.alert("Neue Gruppe!"); }
          },
          {
            caption: "Zum SVE System einladen",
            onClick: function() { self.$f7.dialog.alert("Zum SVE System einladen!"); }
          }
        ]
    };
    console.log("Update context menue");
    self.$f7.data.updateLeftPanel(panelContent);
  }

  componentDidMount() {
    var self = this;
    this.$f7ready((f7) => {
      self.$f7.data.addLoginHook(() => {
        self.updateContent();
      });

      self.updateContent();

      Dom7(document).on('page:reinit', function (e) {
        self.updateContent();
      });
    });
  }
};