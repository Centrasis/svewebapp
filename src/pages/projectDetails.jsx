import React from 'react';
import { Page, Navbar, Block } from 'framework7-react';
import { SVEProject } from 'svebaselib';
import InviteField from './InviteField';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      project: Number(props.f7route.params.id),
      group: undefined
    };
  }
  render() {
    return (
      <Page name="projectdetails">
        <Navbar title={(typeof this.state.project !== "number") ? `${this.state.project.getName()} details` : ""} backLink="Back">
        </Navbar>

        {(this.state.group !== undefined) ? 
          <InviteField 
            group = {this.state.group}
            project = {this.state.project}
          />
        : <Preloader></Preloader> }
        <Block>&nbsp;</Block>
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
        });
      }
    });
  }
}