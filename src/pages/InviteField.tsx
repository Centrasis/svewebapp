import React from 'react';
import { Block, Row, Link, BlockHeader, BlockFooter, Col, Button } from 'framework7-react';
//import { WhatsappShareButton, EmailShareButton } from "react-share";
import * as qrcode from 'qrcode-generator';
import { SVEGroup, SVEProject } from 'svebaselib';
import Dom7 from 'dom7';

export type InviteFieldSettings = {
    group: SVEGroup,
    project?: SVEProject,
    allowShareOnly?: boolean
};

export default class InviteField extends React.Component<InviteFieldSettings & React.HTMLAttributes<HTMLCanvasElement>, {}> {
    protected group: SVEGroup = undefined;
    protected project: SVEProject = null;
    protected token: string;
    protected inviteLink: string = "";
    protected shareLink: string;
    protected allowShareOnly: boolean = false;
    protected toastCopyIcon = null;

    componentDidMount() {
        this.group = this.props.group;

        if (this.props.project)
        {
            this.project = this.props.project;
        }

        if (this.props.allowShareOnly)
        {
            this.allowShareOnly = this.props.allowShareOnly;
        }

        this.toastCopyIcon = this.$f7.toast.create({
            icon: '<i class="f7-icons">square_on_square</i>',
            text: 'Einladung kopiert!',
            position: 'center',
            closeTimeout: 1000,
        });

        this.shareLink = "https://" + window.location.hostname + "/?context=" + this.group.getID() + ((this.project !== null) ? "&redirectProject=" + this.project.getID() : "");
        this.inviteLink = "";

        var self = this;
        this.forceUpdate(() => {
            self.$f7ready((f7) => {
                Dom7("#" + self.group.getName() + "-QRCode").html(self.getQRCode()); 
            });
        });
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
                            <BlockHeader>{(this.inviteLink.length > 1) ? "Einladung zu" : "Teilen von "} {(this.group !== undefined) ? this.group.getName() : ""}</BlockHeader>
                        </Row>
                        <Row id={((this.group !== undefined) ? this.group.getName() : "") + "-QRCode"} style={{
                            maxWidth: "1000px",
                            width: "80vw"
                        }}/>
                        {(!this.allowShareOnly) ?
                            <Row>
                                <Button raisedIos onClick={this.onInviteClick.bind(this)}>Neue Einladung generieren</Button>
                            </Row>
                        : ""}
                        {(this.inviteLink.length > 1) ?
                            <Row>
                                <BlockFooter>
                                    <p>Zum Einladen:</p><br></br>
                                    <Link tooltip="Kopiere diesen Link" onClick={this.onClickLink.bind(this, this.inviteLink)}>{this.inviteLink}</Link>
                                </BlockFooter>
                            </Row>
                        : ""}
                        <Row>
                            <BlockFooter>
                                <p>Zum Teilen:</p><br></br>
                                <Link tooltip="Kopiere diesen Link" onClick={this.onClickLink.bind(this, this.shareLink)}>{this.shareLink}</Link>
                            </BlockFooter>
                        </Row>
                    </Col>
                    <Col></Col>
                </Row>
            </Block>
        )
    }

    onInviteClick() {
        if (this.allowShareOnly) {
            return;
        }

        var self = this;
        self.registerToken();
        this.forceUpdate(() => {
            self.$f7ready((f7) => {
                Dom7("#" + self.group.getName() + "-QRCode").html(self.getQRCode()); 
            });
        });
    }

    onClickLink(link: string) {
        let tempInput = document.createElement("input");
        tempInput.value = link;
        document.body.appendChild(tempInput);
        tempInput.select();
        tempInput.setSelectionRange(0, 99999); /*For mobile devices*/
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        this.toastCopyIcon.open();
    }

    registerToken() {
        this.group.createInviteToken().then(token => {
            this.token = token;
            this.inviteLink = this.shareLink + "&page=register&token=" + encodeURI(this.token);
            console.log("Registered token!");
            this.forceUpdate();
        });
    }

    getQRCode() {
        let qr = qrcode.default(0, 'L');
        qr.addData((this.inviteLink.length > 1) ? this.inviteLink : this.shareLink);
        qr.make();
        return qr.createSvgTag(5);
    }
}