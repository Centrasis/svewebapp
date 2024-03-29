import UploadDropzone from './UploadDropzone';
import React from 'react';
import { Block, Button } from 'framework7-react';
import { f7, f7ready, theme } from 'framework7-react';
import Dropzone from 'react-dropzone';
import { ImageCapture } from 'image-capture/src/imagecapture';
import store from '../components/store';
import {MultiMediaDeviceHandler as MMDH} from '../components/multimediadevicehandler';

export type CameraUploadDropzoneSettings = {
    onCameraLoaded?: (cam?: HTMLVideoElement) => void
    onCameraStop?: (cam?: HTMLVideoElement) => void
};

export default class CameraDropzone extends UploadDropzone<CameraUploadDropzoneSettings> {
    protected onCameraLoaded: (cam?: HTMLVideoElement) => void = (cam?: HTMLVideoElement) =>  {};
    protected onCameraStop: (cam?: HTMLVideoElement) => void = (cam?: HTMLVideoElement) =>  {};
    render () {   
        return (MMDH.hasCameraPermission()) ? (
                    <div style={{width: "100%", height: "100%"}}>
                        <video
                            style={{width: "100%", height: "100%"}}
                            playsInline
                            autoPlay
                            muted
                            id={this.props.id + "-camera-input"}
                        >
                        </video>
                        <div style={{position: "relative", width: "100%", display: "grid", alignContent: "end", textAlign: "center", justifyContent: "center", justifyItems: "center"}}>
                            <Button fill round style={{width: "25vw", minWidth: "300px"}} onClick={this.takePicture.bind(this)}>Scan</Button>
                        </div>
                    </div>
                )
                : (
                    <div style={{width: "100%", height: "100%"}}>
                        <Dropzone onDrop={acceptedFiles => { this.onAcceptMedia(acceptedFiles) }}>
                        {({getRootProps, getInputProps}) => (
                            <section style={{
                            backgroundImage: "url(\"images/DragNDropArea.png\")",
                            WebkitFilter: (this.hasError) ? "hue-rotate(240deg) saturate(3.3) grayscale(50%)" : "",
                            filter: (this.hasError) ? "hue-rotate(240deg) saturate(3.3) grayscale(50%)" : "",
                            backgroundRepeat: "no-repeat", 
                            backgroundSize: "100% 100%",
                            margin: "3em",
                            position: "relative",
                            padding: "3em"
                            }}>
                            <div {...getRootProps()}>
                                <input {...getInputProps()}/>
                                <Block style={{minHeight: "90%", minWidth: "100%", cursor: "copy"}}>{"Ziehe Dokumente zum Hochladen hier hin oder suche diese per Explorer."}</Block>
                            </div>
                            </section>
                        )}
                        </Dropzone>
                        <div style={{width: "100%", height: "100%", display: "grid", alignContent: "end"}}>
                            <Button fill round onClick={this.reactivateCamera.bind(this)}>Kamera aktivieren</Button>
                        </div>
                    </div>
                )
    }

    reactivateCamera() {
        MMDH.resetCameraPermissions(true);
        this.setupCamera();
    }

    takePicture() {
        let elem = document.getElementById(this.props.id + "-camera-input") as HTMLVideoElement;
        let track = (elem.srcObject as MediaStream).getVideoTracks()[0];
        let imageCapture = new ImageCapture(track);
        imageCapture.takePhoto().then((blob: Blob) => {
          let name = new Date().toISOString();
          const encoder = new TextEncoder();
          const data = encoder.encode(name + Math.random().toString());
          crypto.subtle.digest('SHA-256', data).then((v) => {
            this.onAcceptMedia([new File([blob], "ScanPhoto_" + v + ".png")]);
            setTimeout(() => {
              (elem.srcObject as MediaStream).getTracks().forEach(t => t.stop());
              this.setupCamera();
            }, 1000);
          });
          
        });
    }
    
    setupCamera() {
        let self = this;
        MMDH.getCameraStream().then((stream: MediaStream) => {
          let elem = document.getElementById(this.props.id + "-camera-input") as HTMLVideoElement;
          elem.srcObject = stream;
          elem.play();
          elem.onloadedmetadata = function(e) {
            self.onCameraLoaded(elem);
          };
        }, (err) => console.log("Document Camera error: " + JSON.stringify(err)));
    }

    stopCamera() {
        try {
            let self = this;
            let elem = document.getElementById(this.props.id + "-camera-input") as HTMLVideoElement;
            elem.pause();
            if (elem.srcObject !== undefined && elem.srcObject !== null) {
                (elem.srcObject as MediaStream).getTracks().forEach(t => t.stop());
                elem.srcObject = undefined;
                self.onCameraStop(elem);
            }
        } catch { 
            // NOP
        }
    }

    componentDidMount() {
        super.componentDidMount();
        if(this.props.onCameraLoaded) {
            this.onCameraLoaded = this.props.onCameraLoaded;
        }
        if(this.props.onCameraStop) {
            this.onCameraStop = this.props.onCameraStop;
        }
        f7ready((f7) => {
            this.setupCamera();
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.stopCamera();
    }
}