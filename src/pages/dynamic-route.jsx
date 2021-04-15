import React, { Component } from 'react';
import { Page, Navbar, Block, Link } from 'framework7-react';
import { f7, f7ready, theme } from 'framework7-react';

export default class DynamicRoutePage extends Component {
  render() {
    return (
      <Page>
        <Navbar title="Dynamic Route" backLink="Back" />
        <Block strong>
          <ul>
            <li><b>Url:</b> {f7.view.current.router.currentRoute.url}</li> 
            <li><b>Path:</b> {f7.view.current.router.currentRoute.path}</li>
            <li><b>Hash:</b> {f7.view.current.router.currentRoute.hash}</li>
            <li><b>Params:</b>
              <ul>
                {Object.keys(f7.view.current.router.currentRoute.params).map(key => (
                  <li key={key}><b>{key}:</b> {f7.view.current.router.currentRoute.params[key]}</li>
                ))}
              </ul>
            </li>
            <li><b>Query:</b>
              <ul>
                {Object.keys(f7.view.current.router.currentRoute.query).map(key => (
                  <li key={key}><b>{key}:</b> {f7.view.current.router.currentRoute.query[key]}</li>
                ))}
              </ul>
            </li>
            <li><b>Route:</b> {f7.view.current.router.currentRoute.route.path}</li>
          </ul>
        </Block>
        <Block strong>
          <Link onClick={() => f7.view.current.router.back()}>Go back via Router API</Link>
        </Block>
      </Page>
    );
  }
}