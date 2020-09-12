import React from 'react';
import { Page, Navbar, Block, Row } from 'framework7-react';

export default () => (
  <Page>
    <Navbar title="WebApp installieren" backLink="Back" />
    <Block strong>
      <Row>
        <p>Um eine WebApp unter iOS zu installieren müssen Sie die beiden folgenden einfachen Schritte durchführen.</p>
      </Row>
      <Row>
        <img src="static/imgs/AddPage1.png" style={{maxWidth: "100%", maxHeight: "90%"}} />
      </Row>
      <Row>
        <img src="static/imgs/AddPage2.png" style={{maxWidth: "100%", maxHeight: "90%"}} />
      </Row>
      <Row>
        <p>Die WebApp ist nun installiert und kann wie jede gewöhnliche App verwendet werden!</p>
      </Row>
    </Block>
  </Page>
);
