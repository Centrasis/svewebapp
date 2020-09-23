import QrcodeDecoder from 'qrcode-decoder';
import React from 'react';
import { Block, Page, List, Icon, BlockTitle, Popup, ListInput, ListButton, BlockHeader, ListItem } from 'framework7-react';

export type QRCodeScannerSettings = {
    visible: boolean,
    onDecoded: (result: string) => void
};

export default class QRCodeScanner extends React.Component<QRCodeScannerSettings & React.HTMLAttributes<HTMLCanvasElement>, {}> {
    protected result: string = "";
    protected visible: boolean = false;
    protected onDecoded: (result: string) => void = (result: string) => {};

    render () {   
        return (
            <Popup swipeToClose opened={this.visible} onPopupClosed={() => { this.visible = false; }}>
                <Page>
                    <Block style={{display: "flex", justifyContent: "center", alignContent: "center"}}>
                        <BlockTitle large style={{justifySelf: "center"}}>Scanne QR Code..</BlockTitle>
                        <video
                            style={{margin: "20px", width: "100%", height: "100%"}}
                            playsInline
                            autoPlay
                            muted
                            id="camera-input"
                        />
                    </Block>
                </Page>
            </Popup>
        )
    }

    setupCamera() {
        this.$f7.data.getCameraStream().then((stream: MediaStream) => {
          let elem = document.getElementById("camera-input") as HTMLVideoElement;
          elem.srcObject = stream;
          elem.play();
          var self = this;
          var qr = new QrcodeDecoder();
          elem.onloadedmetadata = function(e) {
            qr.decodeFromCamera(elem).then(res => {
                self.result = res;
                self.onDecoded(self.result);
            });
          };
        }, (err) => console.log(JSON.stringify(err)));
    }

    componentWillUpdate() {
        this.visible = this.props.visible;
    }
    componentDidUpdate() {
        this.visible = this.props.visible;
    }

    componentDidMount() {
        this.visible = this.props.visible;
        this.onDecoded = this.props.onDecoded;

        this.setupCamera();
        this.forceUpdate();
    }
}