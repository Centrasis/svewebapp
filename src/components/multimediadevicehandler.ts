import { getDevice } from 'framework7';
import { f7, f7ready, theme } from 'framework7-react';
import store from './store';

export class MultiMediaDeviceHandler {
  public static selectCamera() {
    this.askForCameraAccess(() => {
      navigator.mediaDevices.getUserMedia({audio: false, video: true}).then(stream => {
        navigator.mediaDevices.enumerateDevices().then(devices => {
          devices = devices.filter(d => d.kind === "videoinput");
          let sel: string = window.localStorage.getItem("cameraDevice");
          if (sel !== undefined) {
            let selList = devices.filter(d => this.getDeviceCaption(d) == sel);
            if (selList.length > 0) {
              sel = selList[0].deviceId;
            } else {
              sel = undefined;
            }
          }
          store.state.selectDevicesInfo = {
              selections: devices,
              selected: sel,
            }
          });

          this.setupExampleStreams();
      }, (err) => console.log("select camerra error on access stream: " + JSON.stringify(err)));
    });
  }

  public static setupExampleStreams() {
    if (store.state.selectDevicesInfo !== undefined) {
        store.state.selectDevicesInfo.selections.forEach((dev: MediaDeviceInfo) => {
          this.getCameraStream(dev.deviceId).then((stream) => {
            let elem = document.getElementById("camExample-" + dev.deviceId);
            (elem as any).srcObject = stream;
            (elem as any).play();
            elem.onloadedmetadata = function(e) {
              // Ready to go. Do some stuff.
            };
          }, (err) => console.log("App Camera error: " + JSON.stringify(err)));
        });
    }
  }

  public static getDeviceCaption(dev) {
    let name = dev.label;
    if (name === undefined || name.length == 0)
      name = "id: " + dev.deviceId;

    return name;
  }

  public static askForCameraAccess(callback: () => void) {
    if(this.hasCameraPermission() === true) {
      callback();
    } else {
      if(this.hasCameraPermission() === undefined) {
        f7.dialog.confirm("Die App benötigt hier Zugriff auf Ihre Kamera.", "Kamerazugriff", () => {
          store.state.hasCameraPermission = true;
          callback();
        }, () => { 
          store.state.hasCameraPermission = false;
        });
      } else {
      }
    }
  }

  public static getCameraStream(id: string | undefined = undefined): Promise<MediaStream> {
    return new Promise<MediaStream>((resolve, reject) => {
      let createStream = () => {
        let devID = (id !== undefined) ? id : window.localStorage.getItem("cameraDevice");
        
        navigator.mediaDevices.getUserMedia({audio: false, video: true}).then(stream => {
          navigator.mediaDevices.enumerateDevices().then(devices => {
            if (!(devID === undefined || devID === null || devID === "undefined")) {
              if (devID.includes("id: ")) {
                devID = devID.replace("id: ", "");
              } else {
                let sel = devices.filter(d => d.label == devID);
                if (sel.length > 0) {
                  devID = sel[0].deviceId;
                } else {
                  devID = undefined;
                }
              }
            }   

            let constraints = (devID === undefined || devID === null || devID === "undefined") ? {
              audio: false,
              video: ((getDevice().android || getDevice().ios) ? {
                facingMode: "environment"
              } : true)
            } : { 
              audio: false,
              video: {
                deviceId: { exact: devID }
              }
            };

            //console.log("Request camera stream: " + JSON.stringify(constraints));
            navigator.mediaDevices.getUserMedia(constraints).then(stream => {
              resolve(stream);
            }, (err) => reject(err));
          }, err => reject(err));
        }, err => reject(err));
      };

      this.askForCameraAccess(createStream);
    });
  }

  public static hasCameraPermission(): boolean {
    return (store.state.hasCameraPermission === true);
  }

  public static resetCameraPermissions(keepAllowance: boolean = false) {
    if(!keepAllowance || store.state.hasCameraPermission === false) {
      store.state.hasCameraPermission = undefined;
    }
  }
}


  
  