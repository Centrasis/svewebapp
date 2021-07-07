import React from 'react';
import { Page, Navbar, Block, Preloader, Col, Row } from 'framework7-react';
import { SVEGroup, SVEProject, SVEProjectState, SVESystemInfo } from 'svebaselib';
import InviteField from './InviteField';
import { f7, f7ready, theme } from 'framework7-react';
import store from '../components/store';
import { SVEPageComponent } from '../components/SVEPageComponent';

export default class extends SVEPageComponent {
  protected project: SVEProject = undefined;
  protected group: SVEGroup = undefined;
  protected ownerName: string = "";
  protected mediaCount: number = 0;
  protected usersCount: number = 0;

  constructor(props) {
    super(props);
    new SVEProject(Number(this.f7route.params.id), this.user, (prj) => {
      this.project = prj;
      this.group = prj.getGroup();
      prj.getOwner().then(o => {
        this.ownerName = o.getName();
        this.forceUpdate();
      });
      prj.getData().then(ds => {
        this.mediaCount = ds.length; this.forceUpdate();
      });
      prj.getGroup().getUsers().then(us => {
        this.usersCount = us.length; this.forceUpdate();
      });
    });
  }

  protected customRender() {
    return (
      <Page name="projectdetails">
        <Navbar title={(this.project !== undefined) ? `${this.project.getName()} details` : ""} backLink="Back">
        </Navbar>

        {(this.group !== undefined) ? 
          <div>
            <InviteField 
              group = {this.group}
              project = {this.project}
            />
            <Block largeInset>
              <Col style={{width: "33%"}}></Col>
              <Col style={{width: "33%"}}>
                <Row>
                  <Col>Mitglieder</Col>
                  <Col>{this.usersCount}</Col>
                </Row>
                <Row>
                  <Col>Medien</Col>
                  <Col>{this.mediaCount}</Col>
                </Row>
                <Row>
                  <Col>Zustand</Col>
                  <Col>{(this.project.getState() == SVEProjectState.Open) ? "Eröffnet" : "Eingefrohren"}</Col>
                </Row>
                <Row>
                  <Col>Gründer</Col>
                  <Col>{this.ownerName}</Col>
                </Row>
              </Col>
              <Col style={{width: "33%"}}></Col>
            </Block>
          </div>
        : <Preloader color="#11a802"></Preloader> }
      </Page>
    );
  }

  componentDidMount() {
    f7ready((f7) => {
      let status = SVESystemInfo.getSystemStatus();
      if(!status.tokenSystem) {
        f7.dialog.alert("Token-System ist offline! Aktuell können keine Einladungen registriert werden.");
      }
    });
  }
}