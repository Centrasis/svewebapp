import React from 'react';
import { Page, Navbar, Block, Row, Preloader, Col } from 'framework7-react';
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
            <Block largeInset style={{display: "flex", justifyContent: "center", alignContent: "center"}}>
              <Col style={{width: "33%"}}></Col>
              <Col style={{width: "33%"}}>
                <Row>
                  <Col>Mitglieder</Col>
                  <Col>{this.state.usersCount}</Col>
                </Row>
                <Row>
                  <Col>Projekte</Col>
                  <Col>{this.state.projectsCount}</Col>
                </Row>
              </Col>
              <Col style={{width: "33%"}}></Col>
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
        new SVEGroup({id: self.state.group}, this.$f7.data.getUser(), g => {
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