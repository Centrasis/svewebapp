import React from 'react';
import { Page, Navbar, Block, BlockHeader, BlockTitle } from 'framework7-react';

export default () => (
  <Page>
    <Navbar title="Not found" backLink="Back" />
    <Block strong>
      <BlockTitle>Sorry</BlockTitle>
      <BlockHeader>Requested content not found.</BlockHeader>
    </Block>
  </Page>
);
