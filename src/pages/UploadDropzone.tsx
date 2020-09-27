import React from 'react';
import { SVEProject, SVESystemInfo, SVEData } from 'svebaselib';
import { Block } from 'framework7-react';
import Dropzone from 'react-dropzone';
import HugeUploader from 'huge-uploader';

export type UploadDropzoneSettings = {
    project: SVEProject,
    maxParallelUploads?: number,
    onImageUploaded?: (img: SVEData) =>void
};

export default class UploadDropzone extends React.Component<UploadDropzoneSettings & React.HTMLAttributes<HTMLCanvasElement>, {}> {
    protected project: SVEProject;
    protected hasError: boolean = false;
    protected onImageUploaded: (img: SVEData) =>void = (img: SVEData) => {}
    protected toastError = null;
    protected uploadInfo = {
        imagesToUpload: [],
        pendingUploads: [],
        filesUploaded: 0,
        totalFilesToUpload: 0,
        maxParallelUploads: 2,
        progressbar: undefined
    };
    protected lastRatio = 0.0;
    protected lastTime = performance.now();
    protected lastRemaining = 0.0;

    componentDidMount() {
        this.project = this.props.project;

        if (this.props.maxParallelUploads)
        {
            this.uploadInfo.maxParallelUploads = this.props.maxParallelUploads;
        }

        if (this.props.onImageUploaded)
        {
            this.onImageUploaded = this.props.onImageUploaded;
        }
    }

    render () {   
        return (
            <Block style={{display: "flex", justifyContent: "center", alignContent: "center"}}>
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
            </Block>
        )
    }

    onAcceptMedia(media: File[]) {
        this.$f7.progressbar.show(0, "#11a802");
        this.uploadInfo.progressbar = this.$f7.dialog.progress("Hochladen..", 0, "#11a802");
        this.hasError = false;
    
        media.forEach(m => this.uploadInfo.imagesToUpload.push(m));
        this.uploadInfo.totalFilesToUpload += media.length;

        this.lastRatio = 0.0;
        this.lastTime = performance.now();
        this.lastRemaining = 0.0;
    
        for (let i = 0; i < this.uploadInfo.maxParallelUploads; i++) {
          if(this.uploadInfo.pendingUploads.length < this.uploadInfo.maxParallelUploads && this.uploadInfo.imagesToUpload.length > 0) {
            this.popNextUpload(null);
          }
        }
      }

      calcRemainingTime(currentRatio: number): string {
        if (currentRatio > this.lastRatio) {
          let now = performance.now();
          let timeDiff = Math.abs(now - this.lastTime);
          let ratioDiff = Math.abs(currentRatio - this.lastRatio);
          if (ratioDiff > 0.0 && timeDiff > 0.0) {
            console.log("Time diff in s: " + (timeDiff / 1000) + " ; Ratio diff: " + ratioDiff + " -> Ratio: " + currentRatio);
            this.lastTime = now;
            this.lastRatio = currentRatio;
            this.lastRemaining = Math.ceil((((100.0 - currentRatio) / ratioDiff) * timeDiff) / 1000.0);
          }
        }

        let remainingTime = this.lastRemaining;
        let unit = "s";
        if (remainingTime > 90) {
          unit = "min";
          remainingTime = Math.ceil(remainingTime / 60.0);
        }

        return String(remainingTime) + "[" + unit + "]";
      }
    
      popNextUpload(lastItem: SVEData) {
        if (this.uploadInfo.imagesToUpload.length === 0) {
          if(lastItem !== null)
            this.onImageUploaded(lastItem);
          this.uploadInfo.filesUploaded = 0;
          this.uploadInfo.totalFilesToUpload = 0;
          this.$f7.progressbar.hide();
          if(this.uploadInfo.progressbar !== undefined) {
            this.uploadInfo.progressbar.close();
            this.uploadInfo.progressbar = undefined;
          }
          return;
        }
        let baseRatio = (this.uploadInfo.filesUploaded / this.uploadInfo.totalFilesToUpload) * 100.0;
        this.uploadInfo.progressbar.setText("Datei (" + this.uploadInfo.filesUploaded + " / " + this.uploadInfo.totalFilesToUpload + ") ~" + this.calcRemainingTime(baseRatio));
    
        var self = this;
        const media = this.uploadInfo.imagesToUpload.pop();
        const uploader = new HugeUploader({ 
          endpoint: SVESystemInfo.getAPIRoot() + "/project/" + this.project.getID() + "/data/upload", 
          file: media,
          chunkSize: 5,
          postParams: {
            fileName: media.name,
            created: (media.lastModifiedDate !== undefined) ? media.lastModifiedDate : media.lastModified
          }
        });
        this.uploadInfo.pendingUploads.push(uploader);
    
        uploader.on('error', (err) => {
          console.error('Something bad happened', err.detail);
          self.toastError = self.$f7.toast.create({
            text: JSON.stringify(err.detail),
            closeButton: true,
            closeButtonText: 'Ok',
            closeButtonColor: 'red',
          });
          self.toastError.open();

          self.uploadInfo.pendingUploads = self.uploadInfo.pendingUploads.filter(v => v != uploader);
          self.hasError = true;
          self.forceUpdate();
          self.popNextUpload(media);
        });
    
        uploader.on('progress', (progress) => {
            let ratio = ((self.uploadInfo.filesUploaded + (progress.detail / 100.0)) / self.uploadInfo.totalFilesToUpload) * 100.0;
            self.$f7.progressbar.show(ratio, "#11a802");
            self.uploadInfo.progressbar.setProgress(ratio);
            
            self.uploadInfo.progressbar.setText("Datei (" + self.uploadInfo.filesUploaded + " / " + self.uploadInfo.totalFilesToUpload + ") ~" + this.calcRemainingTime(ratio));
        });
    
        uploader.on('finish', () => {
            self.uploadInfo.filesUploaded++;
            self.uploadInfo.pendingUploads = self.uploadInfo.pendingUploads.filter(v => v != uploader);
            self.popNextUpload(media);
        });
      }
}