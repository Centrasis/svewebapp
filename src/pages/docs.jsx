import React from 'react';
import { Page, Navbar, List, ListItem, NavRight, Searchbar, Link, Block, BlockTitle, Popup, ListInput, ListButton, Col, Row } from 'framework7-react';

//import Tesseract from 'tesseract.js'
//import { pdfjs } from 'react-pdf';

import Dom7 from 'dom7';
import CameraDropzone from './CameraDropzone';
import NewGroupPopup from './NewGroupPopup';
import { SVEProject, SVEGroup, SVEProjectType, SVEProjectState } from 'svebaselib';

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      documentGroups: [],
      tesseractThreads: 2,
      scheduler: null,
      hasCameraPermission: false,
      hasError: false,
      showNewGroupPopup: false,
      selectedGroup: undefined,
      selectedProject: undefined
    };
  }
  render() {
    if (this.state.hasError) {
      return (
        <Page name="docs">
          <Navbar title="SVE Docs">
          </Navbar> 
          <Block style={{display: "flex", justifyContent: "center", alignContent: "center", width: "100%"}}>
            <BlockTitle>Es ist ein Fehler aufgetreten!</BlockTitle>
            <Block>{this.state.errorMsg}</Block>
          </Block>
        </Page>
      );
    } else {
      return (
      <Page name="docs">
        <Navbar title="SVE Docs">
        <NavRight>
          <Link searchbarEnable=".searchbar-demo" iconIos="f7:search" iconAurora="f7:search" iconMd="material:search"></Link>
        </NavRight>
        <Searchbar
            className="searchbar-demo"
            expandable
            searchContainer=".search-list"
            searchIn=".item-title"
            disableButton={!this.$theme.aurora}
        ></Searchbar>
        </Navbar> 

        <Block style={{display: "flex", justifyContent: "center", alignContent: "center", width: "100%"}}>
          <Row>
            <Col>
              <List>
                <ListInput
                  label="Dokumentengruppe"
                  type="select"
                  smartSelect
                  smartSelectParams={{openIn: 'sheet'}}
                  value={"Wähle Gruppe"}
                  onInput={(e) => {
                      new SVEGroup({id: Number(e.target.value)}, this.$f7.data.getUser(), (g) => {
                        this.setState({ selectedGroup: g });
                        g.getProjects().then(ps => {
                          if(ps.length > 0) {
                            this.setState({selectedProject: ps[0]});
                          } else {
                            this.setState({selectedProject: undefined});
                          }
                        });
                      });
                  }}
                >
                  {this.state.documentGroups.map(doc => (
                    <option value={doc.getID()}>{doc.getName()}</option>
                  ))}
                </ListInput>
              </List>
            </Col>
            <Col>
              <Link iconF7="folder_badge_plus" tooltip="Neue Dokumentengruppe" onClick={() => this.setState({ showNewGroupPopup: true, selectedGroup: undefined })}></Link>
            </Col>
          </Row>

          {(this.state.selectedProject !== undefined) ? 
            <CameraDropzone 
              project={this.state.selectedProject}
            />
          : 
            <BlockTitle>Wähle eine Gruppe</BlockTitle>
          }
        </Block>

        <NewGroupPopup
          owningUser={this.$f7.data.getUser()}
          onGroupCreated={this.newGroupCreated.bind(this)}
          visible={this.state.showNewGroupPopup}
        />

        {/*<Popup className="docs-pre-view" swipeToClose opened={this.state.documents_toClassify.length > 0} onPopupClosed={() => this.setState({documents_toClassify : []})}>
          <Page style={{display: "flex", alignContent: "center", justifyContent: "center", WebkitAlignContent: "center", WebkitAlignSelf: "center"}}>
            <BlockTitle medium>Dokumente klassifizieren</BlockTitle>
            <Block strong>
              <List style={{width: "100%"}}>
                {this.state.documents_toClassify.map((doc) => (
                  <ListItem
                    title={doc.name}
                    onClick={this.onManualClassify.bind(this, doc)}
                  >
                    <p slot="after-title">{this.getDocType(doc)}</p>
                  </ListItem>
                ))}
              </List>
            </Block>
          </Page>
        </Popup>*/}
      </Page>
    );
    }
  }

  newGroupCreated(g) {
    this.setState({showNewGroupPopup: false});

    if (g === undefined)
      return;
      
    let gs = this.state.documentGroups;
    gs.push(g);
    this.setState({documentGroups: gs});
    new SVEProject({
      id: NaN,
      name: "Documents",
      group: g,
      splashImg: "",
      owner: this.$f7.data.getUser(),
      state: SVEProjectState.Open,
      resultsURI: "",
      type: SVEProjectType.Sales
    },
    this.$f7.data.getUser(),
    p => {
      p.store().then(val => {
        if(val) {
          this.setState({selectedProject: p});
        } else {
          this.setState({selectedProject: undefined});
          this.$f7.dialog.alert("Fehler beim Anlegen des initial Projektes!")
        }
      });
    });
  }

  /*onManualClassify(doc) {
    var self = this;
    var $$ = Dom7;
    let lbl = "";
    let wait = this.$f7.dialog.preloader("Warte auf Klassifikator..", "#11a802");
    self.$f7.request.get(self.$f7.learnersPath + "/textClassifier.py?get=label",
    (data, status) => {
      wait.close();
      if (JSON.parse(data).Succeeded === false)
      {
        return;
      }
      var lbls = JSON.parse(data).labels;
      console.log("Found labels: " + JSON.stringify(lbls));
      var lbl_options = "";
      Array.prototype.forEach.call(lbls, (l) => {
        lbl_options += "<option value=\"" + l + "\">" + l + "</option>";
      });
      var html = "<h1>Klassifizieren</h1><br><div class=\"item-input-wrap input-dropdown\" id=\"classify_content\"><select class=\"\" id=\"class_labels\">" + lbl_options + "</select></div>";
      html += "<button class=\"button button-fill button-raised\" id=\"newClassBtn\">Neue Klasse</button>";
      var classifyDlg = self.$f7.dialog.create({
        content: html,
        buttons: [
          {
            text: "Abbruch",
            close: true,
            color: "red"
          },
          {
            text: "Klassifizieren",
            close: true,
            onClick: (dialog, e) => {
              var e = document.getElementById("class_labels");
              lbl = e.options[e.selectedIndex].value;
  
              self.$f7.request.post(self.$f7.learnersPath + "/textClassifier.py?add=data&label=" + lbl, JSON.stringify(doc.bow),
              (data, status) => {
                if (!JSON.parse(data).Succeeded)
                {
                  self.$f7.dialog.alert("Klassifikation failed: " + JSON.parse(data).Message);
                }
              });
            }
          }
        ]
      });
      classifyDlg.open(true);
      $$("#newClassBtn").on("click", (evt) => {
        classifyDlg.close(true);

        var addDlg = self.$f7.dialog.create({
          content: "<div class=\"list\"><ul><li class=\"\"><div class=\"item-content item-input item-input-with-value\"><div class=\"item-inner\"><div class=\"item-title item-label\">Neuer Klassenname</div><div class=\"item-input-wrap\"><input class=\"input-with-value\" type=\"text\" placeholder=\"Neuer Name\" id=\"newClassName\" value=\"\" /></div></div></div></li></ul></div>",
          buttons: [
            {
              text: "Zurück",
              close: false,
              color: "white",
              onClick: (dialog, e) => {
                addDlg.close(true);
                classifyDlg.open(true);
              }
            },
            {
              text: "Hinzufügen",
              close: false,
              onClick: (dialog, e) => {
                var e = document.getElementById("newClassName");
                lbl = e.value;
    
                self.$f7.request.get(self.$f7.learnersPath + "/textClassifier.py?add=label&label=" + lbl,
                (data, status) => {
                  if (!JSON.parse(data).Succeeded)
                  {
                    addDlg.close(true);
                    self.$f7.dialog.alert("Klasse hinzufügen fehlgeschlagen: " + JSON.parse(data).Message, "Fehler", () => {
                      classifyDlg.open(true);
                    });
                  }
                  else
                  {
                    addDlg.close(true);
                    classifyDlg.open(true);

                    var e = document.getElementById("classify_content"); 
                    e.innerHTML = "<h3>" + lbl + "</h3>";
                  }
                },
                (data, status) => {
                  addDlg.close(true);
                  self.$f7.dialog.alert("Klasse konnte nicht hinzugefügt werden!", "Fehler", () => {
                    classifyDlg.open(true);
                  });
                });
              }
            }
          ]
        });
        addDlg.open(true);
      });
    },
    (xhr, status) => {
      wait.close();
      console.log("Error on fetching labels!");
    });
  }

  getDocType(doc) {
    if (doc.name.toLowerCase().endsWith(".png") || doc.name.toLowerCase().endsWith(".jpg") || doc.name.toLowerCase().endsWith(".jpeg") || doc.name.toLowerCase().endsWith(".gif") || doc.name.toLowerCase().endsWith(".mp4") || doc.name.toLowerCase().endsWith(".mov") || doc.name.toLowerCase().endsWith(".avi"))
    {
      return "Media";
    }

    if (doc.name.toLowerCase().endsWith(".xlsx") || doc.name.toLowerCase().endsWith(".xls") || doc.name.toLowerCase().endsWith(".csv"))
    {
      return "Excel";
    }

    if (doc.name.toLowerCase().endsWith(".pdf") || doc.name.toLowerCase().endsWith(".doc") || doc.name.toLowerCase().endsWith(".docx"))
    {
      return "Document";
    }

    return "Andere";
  }

  async prepareTesseract(lang = "deu") {
    await this.postpareTesseract();
    const { createWorker, createScheduler } = require('tesseract.js');
    console.log("Prepare Tesseract...");
    const lscheduler = createScheduler();
    for (var i = 0; i < this.state.tesseractThreads; i++)
    {
      const worker = createWorker();
      await worker.load();
      await worker.loadLanguage(lang);
      await worker.initialize(lang);
      lscheduler.addWorker(worker);
    }
    this.setState({scheduler: lscheduler});
    console.log("Tesseract ready! (with " + this.state.tesseractThreads + " threads)");
    var notification = this.$f7.notification.create({
      title: 'SVE Docs',
      text: 'Texterkennung bereit!',
      on: {
        opened: function () {
          console.log('Notification opened');
        }
      }
    });
    notification.open();
  }

  rejectFile(files) {
    var notification = this.$f7.notification.create({
      title: 'SVE Docs',
      text: 'Datei wurde nicht akzeptiert (' + files[0].name + ')!',
    });
    notification.open();
  }

  async postpareTesseract() {
    if (this.state.scheduler != null)
    {
      await this.state.scheduler.terminate();
      this.setState({scheduler: null});
    }
  }

  // doc_data: {id: , url: , text:, name: }
  async handleNewDocument(doc_data) {
    var mimir = require('mimir');
    var bow = mimir.dict(doc_data.text).dict;
    var app = this.$f7;
    var self = this;
    this.$f7.request.post(this.$f7.learnersPath + "/textClassifier.py?predict=1", JSON.stringify(bow),
    function (data, staus) {
      var ret = JSON.parse(data);
      if (ret.Succeeded)
      {
        console.log("Classified as: " + ret.Prediction);
      }
      else
      {
        doc_data.bow = bow;
        var c = self.state.documents_toClassify;
        if (self.state.documents_toClassify.length == 0)
        {
          app.dialog.confirm("Datei konnte nicht Klassifiziert werden! (" + ret.Message + ") Bitte manuell Klassifizieren.", "Nicht Klassifizierbar",
          () => {
            c.push(doc_data);
            self.setState({documents_toClassify: c});
          },
          () => {

          });
        }
        else
        {
          c.push(doc_data);
        }

        self.setState({documents_toClassify: c});
      }
    },
    function(status, xhr) {

    });
  }

  onAcceptDocuments(docs) {
    this.setState({documents_toUpload: docs});
    var self = this;

    let preload = this.$f7.dialog.preloader("Daten analysieren..", "#11a802");
    var keys_pdfs = [];
    var keys_imgs = [];
    for (var key in docs) {
      if (docs[key].name.toLowerCase().endsWith(".pdf"))
      {
        keys_pdfs.push(key);
      }

      if (docs[key].name.toLowerCase().endsWith(".png") || docs[key].name.toLowerCase().endsWith(".jpg") || docs[key].name.toLowerCase().endsWith(".jpeg") || docs[key].name.toLowerCase().endsWith(".gif"))
      {
        keys_imgs.push(key);
      }
    }
    
    (async () => {
      keys_pdfs.map(async (key) => {
        let doc = URL.createObjectURL(docs[key]);
        console.log("Start recognizing PDF: " + doc);
        var pdf_doc = await pdfjs.getDocument({ url: doc }).promise;
        console.log("Found pages: " + pdf_doc.numPages);
        var res = "";
        for (var i = 1; i <= pdf_doc.numPages; i++)
        {
          var page = await pdf_doc.getPage(i);
          var txt = await page.getTextContent();
          txt.items.map((t) => {
            res += t.str + "\n";
          });
        }

        self.handleNewDocument({
          id: key,
          url: doc,
          text: res,
          name: docs[key].name
        });

        /*var render_context = {
          canvasContext: document.querySelector('#pdf-canvas').getContext('2d'),
          viewport: vp
        };*/
        //await page.render(render_context);
      /*});

      let urls = [];
      let names = [];
      const results_img = await Promise.all(keys_imgs.map((key) => {
        let doc = URL.createObjectURL(docs[key]);
        urls.push(doc);
        names.push(docs[key].name);
        return self.state.scheduler.addJob('recognize', doc); //  rectangle where to search: { rectangle{left, top, width, height} }
      }));
      console.log("Tesseract complete!");

      for (var i = 0; i < keys_imgs.length; i++)
      {
          self.handleNewDocument({
            id: keys_imgs[i],
            url: urls[i],
            text: results_img[i].data.text,
            name: names[i]
          });
      }

      var notification = self.$f7.notification.create({
        title: 'SVE Docs',
        text: 'Text-Extraktion vollständig!',
      });
      notification.open();
      preload.close();
    })();
  }
*/
  componentDidMount() {
    var self = this;
    this.$f7ready((f7) => {
      SVEGroup.getGroupsOf(self.$f7.data.getUser()).then(groups => {
        let groupsWithOnlyDocs = [];
        let i = 0;
        groups.forEach(g => {
          g.getProjects().then(ps => {
            let vacType = false;
            ps.forEach(p => {
              if (p.getType() === SVEProjectType.Vacation) {
                vacType = true;
              }
            });

            if(!vacType) {
              groupsWithOnlyDocs.push(g.getID());
            }

            i++;
            if(i === groups.length) {
              self.setState({documentGroups: groups.filter(e => groupsWithOnlyDocs.includes(e.getID()))});
            }
          });
        })
      });
    });
  }

  getDerivedStateFromError(error) {
    console.log("Got error: " + JSON.stringify(error));
    return { hasError: true, errorMsg: JSON.stringify(error) };
  }

  
  componentWillUnmount() {
    //this.postpareTesseract();
  }
}