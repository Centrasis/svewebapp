import React from 'react';
import { Page, Navbar, Block, BlockTitle, Row } from 'framework7-react';

export default () => (
  <Page>
    <Navbar title="About" backLink="Back" />
    <BlockTitle medium>Die SnowVision Entertainment API</BlockTitle>
    <Block strong tag="p">
      Die API enthält Methoden zur Verwaltung von Nutzern, Anmeldevorgängen sowie Medienmanagement.
    </Block>
    <Block strong tag="p">
      <Row>Um mit der SVE online App Medien zu verwalten, kann entweder dieser Server verwendet werden (Der Standard in der App), wobei jedoch ein Account auf diesem Server benötigt wird. Um den eigenen Datenschutz beim Austausch von Medien zu erhalten kann über git das API-Bundle bezogen werden. Dieses ist in php geschrieben und lässt sich somit bei den meisten gängigen Hostern oder Zuhause verwenden.</Row>
      <Row><a class="link external" href="https://www.felixlehner.de:3000/root/sve-api-1.0">Quellen API 1.0</a></Row>
      <Row><a class="link external" href="https://www.felixlehner.de:3000/root/sve-api-2.0">Quellen API 2.0</a></Row>
    </Block>
  </Page>
);