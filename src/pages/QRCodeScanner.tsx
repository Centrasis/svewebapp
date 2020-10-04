import QrcodeDecoder from 'qrcode-decoder';
import React from 'react';
import { Block, Page, List, Icon, BlockTitle, Popup, ListInput, Button, BlockHeader, ListItem } from 'framework7-react';

export type QRCodeScannerSettings = {
    onDecoded: (result: string) => void
};

export default class QRCodeScanner extends React.Component<QRCodeScannerSettings & React.HTMLAttributes<HTMLCanvasElement>, {}> {
    protected result: string = "";
    protected visible: boolean = false;
    protected cameraActive: boolean = false;
    protected onDecoded: (result: string) => void = (result: string) => {};

    render () {   
        return (
            <Popup swipeToClose opened={this.visible} onPopupClosed={() => { this.visible = false; this.stopCamera(); }}>
                <Page>
                    <BlockTitle large style={{justifySelf: "center"}}>Scanne QR Code..</BlockTitle>
                    <Block style={{justifyContent: "center", alignContent: "center"}}>
                    {(this.$f7.data.hasCameraPermission()) ? 
                        <video
                            style={{margin: "5%", width: "90%", height: "90%"}}
                            playsInline
                            autoPlay
                            muted
                            id={this.props.id + "-camera-input"}
                        />
                    : 
                        <div style={{position: "relative", width: "100%", height: "100%", top: "0", left: "0", display: "grid", alignContent: "end"}}>
                            <Button fill round onClick={this.reactivateCamera.bind(this)}>Kamera aktivieren</Button>
                        </div>
                    }
                    </Block>
                </Page>
            </Popup>
        )
    }

    reactivateCamera() {
        this.$f7.data.resetCameraPermissions();
        this.cameraActive = false;
        this.setupCamera();
    }

    stopCamera() {
        this.cameraActive = false;
        let elem = document.getElementById(this.props.id + "-camera-input") as HTMLVideoElement;
        if (elem === undefined || elem === null) {
            return;
        }
        elem.pause();
        if (elem.srcObject !== undefined) {
            (elem.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            elem.srcObject = undefined;
        }
    }

    setupCamera() {
        if (!this.cameraActive) {
            this.cameraActive = true;
            this.$f7.data.getCameraStream().then((stream: MediaStream) => {
                let elem = document.getElementById(this.props.id + "-camera-input") as HTMLVideoElement;
                elem.srcObject = stream;
                elem.play();
                var self = this;
                var qr = new QrcodeDecoder();
                (qr as any).decodeFromCamera(elem).then(res => {
                    self.result = res.data;
                    self.onDecoded(self.result);
                });
                elem.onloadedmetadata = function(e) {
                    // Ready to go. Do some stuff.
                  };
            }, (err) => {
                this.cameraActive = false;
                console.log("QR Camera error: " + JSON.stringify(err));
            });
        }
    }

    setComponentVisible(val: boolean) {
        this.visible = val;
        this.forceUpdate();
    }

    UNSAFE_componentWillUpdate() {
        var self = this;
        this.$f7ready((f7) => {
            self.setupCamera();
        });
    }
    componentDidUpdate() {
        var self = this;
        this.$f7ready((f7) => {
            self.setupCamera();
        });
    }

    componentDidMount() {
        this.$f7.data.setPopupComponent('QRCodeScanner' + ((this.props.id === undefined) ? "" : this.props.id), this);
        this.onDecoded = this.props.onDecoded;
        var self = this;
        this.$f7ready((f7) => {
            self.setupCamera();
            self.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.stopCamera();
        this.$f7.data.setPopupComponent('QRCodeScanner' + ((this.props.id === undefined) ? "" : this.props.id), undefined);
    }
}