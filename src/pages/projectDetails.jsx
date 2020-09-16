import React from 'react';
import { Page, Navbar, Block, Row, Link } from 'framework7-react';
import Dom7 from 'dom7';
//import { WhatsappShareButton, EmailShareButton } from "react-share";
import * as qrcode from 'qrcode-generator';
import { SVESystemInfo, SVEProject } from 'svebaselib';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      project: Number(props.f7route.params.id),
      ownerName: '',
      token: "",
      link: ""
    };
  }
  render() {
    return (
      <Page name="projectdetails">
        <Navbar title={(typeof this.state.project !== "number") ? `${this.state.project.getName()} details` : ""} backLink="Back">
        </Navbar>

        <Block strong>
          <Row 
            style={{display: "flex", justifyContent: "center", alignContent: "center"}}
            dangerouslySetInnerHTML={this.makeQRCode()}
          >
          </Row>
          <Row>
            Gegründet von {this.state.ownerName}
          </Row>
        </Block>
        <Block mediumInset>
          {/*<Row>
            <WhatsappShareButton url={this.state.link} title="Einladungs Link schicken"/>
          </Row>
          <Row>
            <EmailShareButton url={this.state.link} title="Einladungs Link schicken"/>
          </Row>*/}
          <Row>
            <p>Oder kopiere diesen Link:</p><br></br>
            <Link tooltip="Kopiere diesen Link">{this.state.link}</Link>
          </Row>
        </Block>
        <Block>&nbsp;</Block>
      </Page>
    );
  }

  registerToken() {
    var self = this;
    let newToken = [...Array(30)].map(i=>(~~(Math.random()*36)).toString(36)).join('');
    self.setState({
      token: newToken, 
      link: "https://" + window.location.hostname + "/" + SVESystemInfo.getAPIRoot() + "/?page=register&token="+self.state.token + "&context=" + self.state.project.getGroup().getID()
    });
  }

  makeQRCode() {
    let qr = qrcode.default(0, 'L');
    qr.addData(this.state.link);
    qr.make();
    return {__html: qr.createImgTag()};
  }

  componentDidMount() {
    var self = this;
    this.$f7ready((f7) => {
      if(!SVESystemInfo.getSystemStatus().tokenSystem) {
        f7.dialog.alert("Token-System ist offline! Aktuell können keine Einladungen registriert werden.");
      }

      if (typeof self.state.project === "number") {
        new SVEProject(self.state.project, p => {
          self.state.project = p;
          self.setState({project: p});
          self.registerToken();
          p.getOwner().then(usr => {
            self.setState({ownerName: usr.getName()});
          });
        });
      }
    });
  }
}