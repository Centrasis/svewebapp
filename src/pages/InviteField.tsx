import React from 'react';
import { Block, Row, Link, BlockHeader, BlockFooter, Col } from 'framework7-react';
//import { WhatsappShareButton, EmailShareButton } from "react-share";
import * as qrcode from 'qrcode-generator';
import { SVESystemInfo, SVEGroup, SVEProject } from 'svebaselib';
import Dom7 from 'dom7';

export type InviteFieldSettings = {
    group: SVEGroup,
    project?: SVEProject
};

export default class InviteField extends React.Component<InviteFieldSettings & React.HTMLAttributes<HTMLCanvasElement>, {}> {
    protected group: SVEGroup;
    protected project: SVEProject = null;
    protected token: string;
    protected link: string;

    componentDidMount() {
        console.log("Init InviteField.." + JSON.stringify(this.props));

        this.group = this.props.group;

        if (this.props.project)
        {
            this.project = this.props.project;
        }
        var self = this;
        this.$f7ready((f7) => {
            self.registerToken();
            Dom7("#" + self.group.getName() + "-QRCode").html(self.getQRCode()); 
        });
    }

    render () {
        return (
            <Block strong>
                <BlockHeader>Einladung zu {this.group.getName()}</BlockHeader>
                <Row 
                    style={{display: "flex", justifyContent: "center", alignContent: "center"}}
                >
                    <Col></Col>
                    <Col id={this.group.getName() + "-QRCode"}></Col>
                    <Col></Col>
                </Row>
                <BlockFooter>
                    <p>Oder kopiere diesen Link:</p><br></br>
                    <Link tooltip="Kopiere diesen Link">{this.link}</Link>
                </BlockFooter>
            </Block>
        )
    }

    registerToken() {
        this.token = [...Array(30)].map(i=>(~~(Math.random()*36)).toString(36)).join('');
        this.link = "https://" + window.location.hostname + "/" + SVESystemInfo.getAPIRoot() + "/?page=register&token=" + this.token + "&context=" + this.group.getID() + ((this.project !== null) ? "&redirectProject=" + this.project.getID() : "");
    }

    getQRCode() {
        let qr = qrcode.default(0, 'L');
        qr.addData(this.link);
        qr.make();
        return qr.createImgTag();
    }
}