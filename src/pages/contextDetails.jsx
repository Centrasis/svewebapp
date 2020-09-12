import React from 'react';
import { Page, Navbar, Block, Row } from 'framework7-react';
import Dom7 from 'dom7';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contextID: props.f7route.params.id,
      token: ""
    };
  }
  render() {
    return (
      <Page name="contextdetails">
        <Navbar title={`Gruppen beitreten`} backLink="Back">
        </Navbar>

        <Block strong>
        <Row style={{display: "flex", justifyContent: "center", alignContent: "center"}}>
          <img style={{width: "70%", maxHeight: "80vh", maxWidth: "80vh"}} src={this.$f7.apiPath + `/generators/QRGenerator.py?payload=` + ((this.state.token.length == 0) ? "" : encodeURI("https://" + location.hostname + "/?page=register&token="+this.state.token + "&context=" + this.state.contextID))}/>
        </Row>
        </Block>
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
        self.setState({token: newToken});
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
    });
  }
}