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
import {SVEGroup} from 'svebaselib';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      groups: [],
      groupProjects: new Map,
      showProjects: false
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
          {this.state.groups.map((context) => (
            <ListItem
              id={context.getName()}
              key={context.getID()}
              title={context.getName()}
              link={`/context/${context.getID()}/`}
            >
              {(this.state.showProjects) ? (
                <Block slot="content" mediumInset>
                  <BlockTitle>Projekte</BlockTitle>
                  <List>
                    {this.state.groupProjects.get(context.getID()).map((project) => (
                      <ListItem
                        id={project.name}
                        key={project.id}
                        title={project.name}
                        link={`/project/${project.id}/`}
                      >
                        <Img slot="media" src={this.$f7.apiPath + `/getMedia.php?minimal=1&id=${project.splash_img}&project=${project.id}`} width="60"/>
                      </ListItem>
                    ))}
                  </List>
                </Block>
              ) : ""}
            </ListItem>
          ))}
    </List>
    <Block strong style={(this.$f7.gameAPIPort != 0) ? {} : {display: "none"}}>
      <Link style={(this.$f7.gameAPIPort != 0) ? {} : {display: "none"}} href="/gamehub/">Zum Spiele-Hub</Link>
    </Block>
    <Block strong style={((!this.$f7.device.standalone && this.$f7.device.ios) ? {} : {display: "none"})}>
      <Link href="/install/">App installieren</Link>
    </Block>
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
    var nav = this.$f7router;
    this.$f7.request.get(this.$f7.apiPath + "/doLogout.php", function(data) { nav.refreshPage() });
  }

  onSearch(sb, query, prevQuery) {
    if (query === undefined || query.length == 0)
    {
      return;
    }
    var self = this;
    //this.setState({home_display_list: []});
    /*this.$f7.request.get(this.$f7.apiPath + "/queryProject.php?q="+encodeURI(query),
      function(data) { 
        var raw = JSON.parse(data);
        let contexts = Array.prototype.filter.call(raw, e => e.type == "context").sort((a, b) => a.distance > b.distance);
        let projects = Array.prototype.filter.call(raw, e => e.type == "project").sort((a, b) => a.distance > b.distance);

        let list = [];
        Array.prototype.forEach.call(contexts, (c) => {
          let prjs = [];
          Array.prototype.forEach.call(Array.prototype.filter.call(projects, e => e.parent == c.obj.id), (e) => { prjs.push(e.obj) });
          
          list.push({id: c.obj.id, name: c.obj.name, projects: prjs});
        });

        self.setState({home_display_list: list});
      });*/
  }

  onClearSearch(sb) {
    this.setState({home_display_list: this.state.contexts});
  }

  onEnableSearch(sb) {
    Dom7("#intro").hide();
    this.onClearSearch(sb);
  }

  onDisableSearch(sb) {
    Dom7("#intro").show();
    this.onClearSearch(sb);
  }

  componentDidUpdate() {
    var router = this.$f7router;
    this.$f7ready((f7) => {
      console.log("-> component update..");
    });
  }

  updateContent() {
    var self = this;

    console.log("Update content");

    self.setState({groupProjects: new Map()});

    if(this.$f7.data.getUser() !== undefined) {
      SVEGroup.getGroupsOf(this.$f7.data.getUser()).then(gs => {
        gs.forEach(g => {
          self.state.groupProjects.set(g, []);
        });

        self.setState({
          groups: gs
        });
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