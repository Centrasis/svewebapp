import React from 'react';
import { Page, Navbar, Block, Row, List, ListInput, Button, BlockTitle } from 'framework7-react';
import Dom7 from 'dom7';
//import moment from "react-moment";
//import { now } from 'moment';
import {SVEGroup, SVEProject, SVEData} from 'svebaselib';

export default class extends React.Component {
  constructor(props) {
    super(props);

    var now = "";//moment().format("DD-MM-YYYY");
    this.state = {
      contextID: props.f7route.params.id,
      projectName: "",
      date: {
        begin: now,
        end: now
      }
    };
  }
  render() {
    return (
      <Page name="newproject">
        <Navbar title={`Neuen Urlaub anlegen`} backLink="Back">
        </Navbar>

        <Block string>
          <BlockTitle style={{display: "flex", justifyContent: "center", alignContent: "center"}} medium>
            Lege einen neuen Urlaub in der aktuellen Gruppe an.
          </BlockTitle>
          <List>
          <ListInput
              label="Urlaubsname"
              type="text"
              placeholder="Name des neuen Urlaubs"
              value={this.state.projectName}
              onInput={(e) => {
                  this.setState({ projectName: e.target.value});
                }}
              required
            ></ListInput>
            <ListInput
              label="Urlaubsbeginn"
              type="date"
              placeholder="Beginn wählen"
              value={this.state.date.begin}
              onInput={(e) => {
                  this.setState({ date: { begin: e.target.value, end: this.state.date.end }});
                }}
              required
            ></ListInput>
            <ListInput
              label="Urlaubsende"
              type="date"
              placeholder="Ende wählen"
              value={this.state.date.end}
              onInput={(e) => {
                this.setState({ date: { end: e.target.value, begin: this.state.date.begin }});
                }}
              required
            ></ListInput>
          </List>
        </Block>
        <Block strong mediumInset>
          <Row tag="p">
            <Button className="col" raised fill onClick={this.createProject.bind(this)}>Erstellen</Button>
          </Row>
        </Block>
      </Page>
    );
  }

  createProject() {
    var app = this.$f7;
    var self = this;
    var router = this.$f7router;
    var req = this.$f7.apiPath + "/AddNewProject.php?context=" + this.state.contextID + "&name=" + this.state.projectName;
    if (this.state.date.begin != "")
    {
      var begin = new Date(this.state.date.begin);
      var end = null;

      if (this.state.date.end != "")
      {
        end = new Date(this.state.date.end);
      }
      else
      {
        end = new Date(this.state.date.begin);
      }

      req += "&beginTime=" + Math.floor(begin.getTime() / 1000) + "&endTime=" + Math.floor(end.getTime() / 1000);
    }
    

    this.$f7.request.get(req,
    function(data, status) {
      try {
        if (JSON.parse(data).Succeeded)
        {
          router.back(router.history[router.history.length - 2], {ignoreCache: true});
        }
        else
        {
          app.dialog.alert("Fehler: " + JSON.parse(data).Message);
        }
      } catch (error) {
        app.dialog.alert("Fehler: Interner Serverfehler! Bitte Admin informieren.");
      }
    },
    function(xhr, status) {
      app.dialog.confirm("Der Server lehnte ab! Erneut versuchen?", function() { }, function() { router.back(); });
    });
  }

  componentDidMount() {
    var router = this.$f7router;
    var self = this;
    var $$ = Dom7;
    this.$f7ready((f7) => {
    });
  }
}