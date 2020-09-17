import React from 'react';
import { Page, Navbar, Block, Preloader, Col, Row } from 'framework7-react';
import { SVEProject, SVEProjectState } from 'svebaselib';
import InviteField from './InviteField';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      project: Number(props.f7route.params.id),
      group: undefined,
      prjState: "",
      mediaCount: 0,
      usersCount: 0
    };
  }
  render() {
    return (
      <Page name="projectdetails">
        <Navbar title={(typeof this.state.project !== "number") ? `${this.state.project.getName()} details` : ""} backLink="Back">
        </Navbar>

        {(this.state.group !== undefined) ? 
          <div>
            <InviteField 
              group = {this.state.group}
              project = {this.state.project}
            />
            <Block largeInset>
              <Row>
                <Col>Mitglieder</Col>
                <Col>{this.state.usersCount}</Col>
              </Row>
              <Row>
                <Col>Medien</Col>
                <Col>{this.state.mediaCount}</Col>
              </Row>
              <Row>
                <Col>Zustand</Col>
                <Col>{this.state.prjState}</Col>
              </Row>
            </Block>
          </div>
        : <Preloader></Preloader> }
      </Page>
    );
  }

  componentDidMount() {
    var self = this;
    this.$f7ready((f7) => {
      if(!SVESystemInfo.getSystemStatus().tokenSystem) {
        f7.dialog.alert("Token-System ist offline! Aktuell können keine Einladungen registriert werden.");
      }

      if (typeof self.state.project === "number") {
        new SVEProject(self.state.project, this.$f7.data.getUser(), p => {
          self.setState({
            project: p,
            group: p.getGroup()
          });
          p.getData().then(ds => {
            self.setState({mediaCount: ds.length});
          });
          p.getGroup().getUsers().then(us => {
            self.setState({usersCount: us.length});
          });
          let pstate = p.getState();
          self.setState({prjState: (pstate === SVEProjectState.Open) ? "Eröffnet" : "Eingefrohren"});
        });
      }
    });
  }
}