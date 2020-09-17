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
    protected group: SVEGroup = undefined;
    protected project: SVEProject = null;
    protected token: string;
    protected link: string;
    protected toastCopyIcon = null;

    componentDidMount() {
        console.log("Init InviteField.." + JSON.stringify(this.props));

        this.group = this.props.group;

        if (this.props.project)
        {
            this.project = this.props.project;
        }

        this.toastCopyIcon = this.$f7.toast.create({
            icon: '<i class="f7-icons">square_on_square</i>',
            text: 'Einladung kopiert!',
            position: 'center',
            closeTimeout: 1000,
        });

        var self = this;
        self.registerToken();
        this.forceUpdate(() => {
            self.$f7ready((f7) => {
                Dom7("#" + self.group.getName() + "-QRCode").html(self.getQRCode()); 
            });
        })
    }

    render () {
        return (
            <Block strong>
                <Row 
                    style={{display: "flex", justifyContent: "center", alignContent: "center"}}
                >
                    <Col></Col>
                    <Col>
                        <Row>
                            <BlockHeader>Einladung zu {(this.group !== undefined) ? this.group.getName() : ""}</BlockHeader>
                        </Row>
                        <Row id={((this.group !== undefined) ? this.group.getName() : "") + "-QRCode"} style={{
                            maxWidth: "1000px",
                            width: "80vw"
                        }}/>
                        <Row>
                            <BlockFooter>
                                <p>Oder kopiere diesen Link:</p><br></br>
                                <Link tooltip="Kopiere diesen Link" onClick={this.onClickLink.bind(this)}>{this.link}</Link>
                            </BlockFooter>
                        </Row>
                    </Col>
                    <Col></Col>
                </Row>
            </Block>
        )
    }

    onClickLink() {
        let tempInput = document.createElement("input");
        tempInput.value = this.link;
        document.body.appendChild(tempInput);
        tempInput.select();
        tempInput.setSelectionRange(0, 99999); /*For mobile devices*/
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        this.toastCopyIcon.open();
    }

    registerToken() {
        this.token = [...Array(30)].map(i=>(~~(Math.random()*36)).toString(36)).join('');
        this.link = encodeURI("https://" + window.location.hostname + "/?page=register&token=" + this.token + "&context=" + this.group.getID() + ((this.project !== null) ? "&redirectProject=" + this.project.getID() : ""));
        console.log("Registered token!");
    }

    getQRCode() {
        let qr = qrcode.default(0, 'L');
        qr.addData(this.link);
        qr.make();
        return qr.createSvgTag(5);
    }
}