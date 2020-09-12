import React from 'react';
import { Page, Navbar, Block, Row, Link } from 'framework7-react';
import Dom7 from 'dom7';
//import { WhatsappShareButton, EmailShareButton } from "react-share";

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      projectId: props.f7route.params.id,
      project: {
        id: -1,
        name: '',
        owner: -1,
        context: -1
      },
      ownerName: '',
      token: "",
      link: ""
    };
  }
  render() {
    return (
      <Page name="projectdetails">
        <Navbar title={`${this.state.project.name} details`} backLink="Back">
        </Navbar>

        <Block strong>
          <Row style={{display: "flex", justifyContent: "center", alignContent: "center"}}>
            <img style={{width: "70%", maxHeight: "80vh", maxWidth: "80vh"}} src={this.$f7.apiPath + `/generators/QRGenerator.py?payload=` + ((this.state.token.length == 0) ? "" : encodeURI(this.state.link))}/>
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
    this.$f7.request.get(this.$f7.apiPath + "/registerToken.php?method=action&token=" + encodeURI(newToken),
      "text",
      function(data, status) {
        self.state.token = newToken;
        self.state.link = "https://" + location.hostname + "/?page=register&token="+self.state.token + "&context=" + self.state.project.context;
        self.setState({token: newToken, link: self.state.link});
      },
      function (xhr, status) {
        if (status == 409)
          self.registerToken();
      }
    );
  }

  componentDidMount() {
    var router = this.$f7router;
    var self = this;
    var $$ = Dom7;
    this.$f7ready((f7) => {
      self.registerToken();
      f7.request.get(f7.apiPath + "/getProject.php?id=" + self.state.projectId, function(data) {
        var Project = JSON.parse(data);
        if (Project.splash_img == null || Project.splash_img == "null" || Project.splash_img == "")
        {
          Project.splash_img = "InProgress.png";
        }

        self.setState({project: Project});

        f7.request.get(f7.apiPath + "/getUserInfo.php?id=" + self.state.project.owner, function(data) {
          self.state.ownerName = JSON.parse(data).name;
          self.setState({ownerName: JSON.parse(data).name});
        });
      },
      function(xhr, status) {
        self.$f7.dialog.confirm("Zugriff verweigert! Möchten Sie sich unter einem anderen Namen anmelden?", "Zugriff verweigert", 
        function() { router.navigate('/login/'); },
        function() { router.back(); });
      });
    });
  }
}