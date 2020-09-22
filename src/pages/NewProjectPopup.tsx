import React from 'react';
import { Page, List, Icon, BlockTitle, Popup, ListInput, ListButton, BlockHeader, ListItem } from 'framework7-react';
import { SVEGroup, SVEProject, SVEAccount, ProjectInitializer, SVEProjectState, SVEProjectType } from 'svebaselib';

export type NewProjectPopupSettings = {
    owningUser: SVEAccount,
    parentGroup: SVEGroup,
    onProjectCreated?: (prj?: SVEProject) => void,
    visible: boolean,
    caption?: string
};

export default class NewProjectPopup extends React.Component<NewProjectPopupSettings & React.HTMLAttributes<HTMLCanvasElement>, {}> {
    protected newProjectName: string = undefined;
    protected owningUser: SVEAccount = undefined;
    protected parentGroup: SVEGroup = undefined;
    protected errorMsg: string = undefined;
    protected caption: string = "Neues Projekt";
    protected projectType: SVEProjectType = SVEProjectType.Vacation;
    protected beginDate: Date = undefined;
    protected endDate: Date = undefined;
    protected onProjectCreated: (prj?: SVEProject) => void = (prj?: SVEProject) => {};

    render () {
        return (
            <Popup swipeToClose opened={this.newProjectName !== undefined} onPopupClosed={() => { this.newProjectName = undefined; this.onProjectCreated(undefined); }}>
                <Page>
                    <BlockTitle large style={{justifySelf: "center"}}>{this.caption}</BlockTitle>
                    {(this.errorMsg !== undefined) ? (
                        <BlockHeader color="red" style={{color: "red", justifySelf: "center", justifyItems: "center"}}>
                            <span color="red" style={{color: "red"}}>{this.errorMsg}</span>
                        </BlockHeader>
                    ) : ''}
                    <List>
                        <ListInput
                            label="Name"
                            type="text"
                            placeholder={"Name"}
                            value={this.newProjectName}
                            onInput={(e) => {
                                this.newProjectName = e.target.value;
                                this.forceUpdate();
                            }}
                        />
                        <ListInput
                            label="Projekttyp"
                            type="select"
                            value={this.projectType}
                            onInput={(e) => {
                                this.projectType = e.target.value as SVEProjectType;
                                this.forceUpdate();
                            }}
                        >
                            <option value={SVEProjectType.Vacation}>Urlaub</option>
                            <option value={SVEProjectType.Sales}>Dokumentensammlung</option>
                        </ListInput>
                        <ListInput
                            label="Beginn"
                            type="date"
                            placeholder="Beginn-Datum"
                            defaultValue={undefined}
                            value={this.beginDate}
                            onInput={(e) => {
                                this.beginDate = new Date(e.target.value);
                                this.forceUpdate();
                            }}
                        ></ListInput>
                        <ListInput
                            label="Ende"
                            type="date"
                            placeholder="End-Datum"
                            defaultValue={undefined}
                            value={this.endDate}
                            onInput={(e) => {
                                this.endDate = new Date(e.target.value);
                                this.forceUpdate();
                            }}
                        ></ListInput>
                        {(this.parentGroup !== undefined) ? 
                        <ListInput
                            label="Gruppe"
                            type="text"
                            disabled
                            placeholder={"Gruppe"}
                            value={this.parentGroup.getName()}
                        />
                        : ""}
                        <ListItem
                            title="Erstellen"
                            onClick={this.createNewProject.bind(this)}
                            style={{cursor: "pointer"}}
                        >
                            <Icon slot="media" f7="folder_badge_plus"></Icon>
                        </ListItem>
                    </List>
                </Page>
            </Popup>
        )
    }

    createNewProject() {
        new SVEProject({
            id: NaN,
            name: this.newProjectName,
            group: this.parentGroup,
            splashImg: 0,
            owner: this.owningUser,
            state: SVEProjectState.Open,
            resultsURI: "",
            type: this.projectType
          } as ProjectInitializer,
          this.owningUser,
          p => {
            p.store().then(val => {
              if(val) {
                this.onProjectCreated(p);
              } else {
                this.errorMsg = "Fehler beim Anlegen des Projektes!";
                this.forceUpdate();
              }
            });
        });
    }

    componentDidMount() { 
        this.errorMsg = undefined;
        this.updateProps();
        this.forceUpdate();
    }
    componentDidUpdate() { this.updateProps(); }

    updateProps() {
        this.newProjectName = (this.props.visible && this.newProjectName === undefined) ? "" : this.newProjectName;
        if(!this.props.visible) {
            this.newProjectName = undefined;
        }
        this.owningUser = this.props.owningUser;
        this.parentGroup = this.props.parentGroup;

        if (this.props.onProjectCreated)
        {
            this.onProjectCreated = this.props.onProjectCreated;
        }

        if (this.props.caption)
        {
            this.caption = this.props.caption;
        }
    }
}