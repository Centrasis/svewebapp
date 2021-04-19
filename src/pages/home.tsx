import React from 'react';
import {
  Page,
  Navbar,
  NavTitle,
  NavTitleLarge,
  NavRight,
  Link,
  Searchbar,
  Block,
  BlockTitle,
  List,
  ListItem,
  Row,
  Col,
  Button,
  SwipeoutActions,
  BlockFooter,
  Swiper,
  SwiperSlide
} from 'framework7-react';
import Dom7 from 'dom7';
import {SVEAccount, SVEGroup, SVEProject, SVEProjectQuery} from 'svebaselib';
import QRCodeScanner from './QRCodeScanner';
import NewGroupPopup from './NewGroupPopup';
import { f7, f7ready, theme } from 'framework7-react';
import store from '../components/store';
import { LoginHook } from '../components/LoginHook';
import { MultiMediaDeviceHandler } from '../components/multimediadevicehandler';
import { LinkProcessor } from '../components/LinkProcessor';
import { PopupHandler } from '../components/PopupHandler';
import { getDevice } from 'framework7';
import { SVEPageComponent } from '../components/SVEPageComponent';

interface SVESearchResult {
  group: SVEGroup;
  projects: SVEProject[];
}

export default class extends SVEPageComponent<{}> {
  protected groups: SVEGroup[] = [];
  protected showProjects: boolean = false;
  protected home_display_list: SVESearchResult[] = [];

  constructor(props) {
    super(props);
  }

  customRender() {
    return (
  <Page name="home" noToolbar noNavbar noSwipeback>
    {/* Top Navbar */}
    <Block style={{
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      margin: "0 auto",
      width: "100vw",
      height: "100vh"
    }}>
      <div
          style={{
              backgroundImage: "url('images/SnowVision_Logo_Alpha.png')",
              backgroundRepeat: "no-repeat",
              backgroundAttachment: "fixed",
              backgroundPosition: "center",
              backgroundSize: "30%",
              filter: "blur(20px) brightness(30%)",
              WebkitFilter: "blur(20px) brightness(30%)",
              boxSizing: "border-box",
              height: "80vh",
              width: "80vw",
              zIndex: -100,
              position: "absolute",
              overflow: "visible"
          }}
      />
      <Row>
        <Block largeInset style={{
          display: "flex",
          width: "100%",
          justifySelf: "center",
          justifyContent: "center",
          justifyItems: "center",
          alignContent: "center",
          overflow: "visible"
        }}>
          <BlockTitle style={{fontSize: (getDevice().desktop) ? "5em" : "1em", height: "25vh", overflow: "visible"}}>Willkommen im SVE System</BlockTitle>
        </Block>
      </Row>
      <Row>
        {(getDevice().desktop) ? (<Col width="15"></Col>) : ""}
        <Col width="100">
          <Swiper 
            initialSlide={1} 
            navigation={!getDevice().desktop} 
            centeredSlides pagination={!getDevice().desktop} 
            speed={500} 
            slidesPerView={(getDevice().desktop) ? 3 : 1} 
            spaceBetween={20}
            style={{
              width: "100%"
            }}
          >
            <SwiperSlide>
              <Block>
                <Row>
                  <Col width="100" style={{
                    display: "flex",
                    width: "100%",
                    justifySelf: "center",
                    justifyContent: "center",
                    justifyItems: "center",
                    alignContent: "center",
                    overflow: "visible"
                  }}>
                    <Link href="/docs/">
                      <i className="f7-icons"
                        style={{
                          fontSize: "20vh",
                        }} 
                      >arrow_up_doc_fill</i>
                    </Link>
                  </Col>
                  <Col></Col>
                </Row>
                <Row>
                  <Col width="100" style={{
                    display: "flex",
                    width: "100%",
                    justifySelf: "center",
                    justifyContent: "center",
                    justifyItems: "center",
                    alignContent: "center",
                    overflow: "visible"
                  }}>
                    <BlockFooter>SVE Documents</BlockFooter>
                  </Col>
                </Row>
              </Block>
            </SwiperSlide>
            <SwiperSlide>
              <Block>
                <Row>
                  <Col width="100" style={{
                    display: "flex",
                    width: "100%",
                    justifySelf: "center",
                    justifyContent: "center",
                    justifyItems: "center",
                    alignContent: "center",
                    overflow: "visible"
                  }}>
                    <Link href="/mediahome/">
                      <i className="f7-icons"
                        style={{
                          fontSize: "20vh",
                        }} 
                      >photo_fill_on_rectangle_fill</i>
                    </Link>
                  </Col>
                  <Col></Col>
                </Row>
                <Row>
                  <Col width="100" style={{
                    display: "flex",
                    width: "100%",
                    justifySelf: "center",
                    justifyContent: "center",
                    justifyItems: "center",
                    alignContent: "center",
                    overflow: "visible"
                  }}>
                    <BlockFooter>SVE Media System</BlockFooter>
                  </Col>
                </Row>
              </Block>
            </SwiperSlide>
            <SwiperSlide>
              <Block>
                <Row>
                  <Col width="100" style={{
                    display: "flex",
                    width: "100%",
                    justifySelf: "center",
                    justifyContent: "center",
                    justifyItems: "center",
                    alignContent: "center",
                    overflow: "visible"
                  }}>
                    <Link href="/gamehub/">
                      <i className="f7-icons"
                        style={{
                          fontSize: "20vh",
                        }} 
                      >gamecontroller_alt_fill</i>
                    </Link>
                  </Col>
                </Row>
                <Row>
                  <Col width="100" style={{
                    display: "flex",
                    width: "100%",
                    justifySelf: "center",
                    justifyContent: "center",
                    justifyItems: "center",
                    alignContent: "center",
                    overflow: "visible"
                  }}>
                    <BlockFooter>SVE Games Hub</BlockFooter>
                  </Col>
                </Row>
              </Block>
            </SwiperSlide>
          </Swiper>
        </Col>
        {(getDevice().desktop) ? (<Col width="15"></Col>) : ""}
      </Row>
      <Row>
        <Block style={{
          width: "100vw",
          display: "flex",
          justifySelf: "center",
          justifyContent: "center",
          justifyItems: "center",
          alignContent: "center", 
          overflow: "visible"
        }}>
            <Link href="/settings/" tooltip="Einstellungen">
              <i className="f7-icons"
                style={{
                  fontSize: "20vh",
                }} 
              >gear</i>
            </Link>
        </Block>
      </Row>
    </Block>
  </Page>
    );
  }
};