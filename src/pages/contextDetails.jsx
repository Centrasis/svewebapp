import React from 'react';
import { Page, Navbar, Block, Row, Preloader } from 'framework7-react';
import Dom7 from 'dom7';
import InviteField from './InviteField';
import { SVEGroup } from 'svebaselib';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      group: Number(props.f7route.params.id),
      usersCount: 0,
      projectsCount: 0
    };
  }
  render() {
    return (
      <Page name="contextdetails">
        <Navbar title={`Gruppen beitreten: ${(typeof this.state.group !== "number") ? this.state.group.getName() : ""}`} backLink="Back">
        </Navbar>

        {(typeof this.state.group !== "number") ? 
          <div>
            <InviteField 
              group = {this.state.group}
            />
            <Block>
              <Col>Mitglieder</Col>
              <Col>{this.state.usersCount}</Col>
            </Block>
            <Block>
              <Col>Projekte</Col>
              <Col>{this.state.projectsCount}</Col>
            </Block>
          </div>
        : <Preloader></Preloader> }
      </Page>
    );
  }

  componentDidMount() {
    var self = this;
    this.$f7ready((f7) => {
      if (typeof self.state.group === "number") {
        new SVEGroup(self.state.group, this.$f7.data.getUser(), g => {
          self.setState({group: g});
          g.getProjects().then(ps => {
            self.setState({projectsCount: ps.length});
          });
          g.getUsers().then(us => {
            self.setState({usersCount: us.length});
          });
        });
      }
    });
  }
}