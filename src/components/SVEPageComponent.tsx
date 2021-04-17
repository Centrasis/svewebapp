import React, { useState } from 'react';
import { Router as F7Router } from 'framework7/modules/router/router';
import { SVEAccount } from 'svebaselib';
import store from './store';
import {
    Page,
    List,
    ListItem,
    Link,
    Block,
    Navbar,
    NavTitle,
    NavTitleLarge,
    NavRight,
    AccordionContent
  } from 'framework7-react';
import { LoginHook } from './LoginHook';

interface ErrorState {
    has: boolean;
    msg: string;
}

export abstract class SVEPageComponent<P = {}> extends React.Component<P, {}> {
    protected f7router: F7Router.Router;
    protected f7route: F7Router.Route;
    protected user: SVEAccount | undefined;
    private error: ErrorState = {
        has: false,
        msg: ""
    };

    constructor(props) {
        super(props);
        const { f7route, f7router } = props;
        this.f7route = f7route;
        this.f7router = f7router;
        this.user = store.state.user;
        this.error = {
            has: false,
            msg: ""
        };
        LoginHook.add(this.onUserLoggedIn.bind(this));
    }

    public static getDerivedStateFromError(error) {
        console.log("STATIC: Catching error!", error);
        return {error: {
          has: true,
          msg: "Error" + JSON.stringify(error)
        }};
    }

    public componentDidCatch(error, errorInfo) {
        console.log("DYNAMIC: Catching error: ", error, errorInfo);
        this.error.has = true;
        this.error.msg = this.error.msg + "<br>\n Info: " + JSON.stringify(errorInfo) + "<br>\nError: " + JSON.stringify(error);
        this.forceUpdate();
    }

    private resolveError() {
        this.error.has = false;
        this.error.msg = "";
        window.location.reload();
    }

    protected onUserLoggedIn(user: SVEAccount) {

    }

    public render() {
        return (this.error.has) ? (
            <Page>
                <Navbar large sliding={false}>
              <NavTitle sliding>Ein kritischer Fehler trat auf!</NavTitle>
              <NavTitleLarge>Ein kritischer Fehler trat auf!</NavTitleLarge>
              <NavRight>
                <Link external iconF7="text_bubble" tooltip="Fehler melden" href={"mailto:info@felixlehner.de?subject=Webseitenfehler&body=Fehler%20trat%20auf%3A%0D%0A" + store.state.error.msg.replace("\\n", "\n")} />
                <Link style={{color: "green"}} iconF7="tornado" tooltip="Fehler auflösen" onClick={this.resolveError.bind(this)} />
              </NavRight>
            </Navbar>
            <Block>
              <p>
                Es ist ein kritischer Fehler in der Webapp aufgetreten! Dies bedeutet jedoch nicht, 
                dass die letzte Operation nicht gespeichert wurde. Auf dem Server kann alles in bester Ordnung sein.
                Dementsprechend wird niemand von diesem Fehler erfahren, wenn er nicht mit Hilfe des Sprechblasen-Icons per Mail gemeldet wird.
                Nach der Meldung kann über den Tornado hier wieder aufgeräumt werden, damit es weiter gehen kann!
                Vielen Dank für die Geduld - die App ist eben noch in der Entwicklung.
              </p>
              <List accordionList>
                <ListItem accordionItem title="Fehlermeldung">
                  <AccordionContent>
                    <Block strong inset>
                      <p>
                        {store.state.error.msg}
                      </p>
                    </Block>
                  </AccordionContent>
                </ListItem>
              </List>
            </Block>
            </Page>
        ) : this.customRender()
    }

    protected abstract customRender(): any;

    public componentDidMount() {
        this.user = store.state.user;
    }

    public componentDidUpdate() {
        this.user = store.state.user;
    }
}