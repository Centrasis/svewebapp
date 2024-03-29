import React from 'react';
import { Page, List, Icon, BlockTitle, Popup, ListInput, ListButton, BlockHeader, ListItem } from 'framework7-react';
import { SVEGroup, SVEProject, SVEAccount, ProjectInitializer, SVEProjectState, SVEProjectType } from 'svebaselib';
import { f7, f7ready, theme } from 'framework7-react';
import { PopupHandler } from '../components/PopupHandler';

export type NewProjectPopupSettings = {
    owningUser: SVEAccount,
    parentGroup: SVEGroup,
    onProjectCreated?: (prj?: SVEProject) => void,
    caption?: string,
    projectToEdit?: SVEProject
};

export default class NewProjectPopup extends React.Component<NewProjectPopupSettings & React.HTMLAttributes<HTMLCanvasElement>, {}> {
    protected oldProject?: SVEProject = undefined;
    protected newProjectName: string = undefined;
    protected owningUser: SVEAccount = undefined;
    protected parentGroup: SVEGroup = undefined;
    protected errorMsg: string = undefined;
    protected caption: string = "Neues Projekt";
    protected projectType: SVEProjectType = SVEProjectType.Vacation;
    protected beginDate: string = undefined;
    protected endDate: string = undefined;
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
                                this.beginDate = e.target.value;
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
                                this.endDate = e.target.value;
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
                            title={(this.oldProject !== undefined) ? "Übernehmen" : "Erstellen"}
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
        if(this.newProjectName === undefined || this.newProjectName.length < 3) {
            this.errorMsg = "Projektname ist zu kurz ('" + JSON.stringify(this.newProjectName) + "')!";
            this.forceUpdate();
        } else {
            let initializer: ProjectInitializer = (this.oldProject !== undefined) ? this.oldProject.getAsInitializer() 
                            : {
                                group: this.parentGroup,
                                id: NaN,
                                name: "",
                                owner: this.owningUser,
                                state: SVEProjectState.Open,
                                type: this.projectType
                            };

            if (this.beginDate !== undefined && this.endDate !== undefined) {
                initializer.dateRange = {begin: new Date(this.beginDate), end: new Date(this.endDate)};
            }

            initializer.type = this.projectType;
            initializer.name = this.newProjectName;

            new SVEProject(initializer, this.owningUser, p => {
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
    }

    componentDidMount() { 
        this.errorMsg = undefined;
        PopupHandler.setPopupComponent('NewProjectPopup' + ((this.props.id === undefined) ? "" : this.props.id), this);
        this.updateProps();
        this.forceUpdate();
    }
    componentDidUpdate() { 
        this.updateProps(); 
        f7ready((f7) => {});
    }
    UNSAFE_componentWillUpdate() { 
        this.updateProps();
        f7ready((f7) => {});
    }

    updateProps() {
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

        if (this.props.projectToEdit)
        {
            this.oldProject = this.props.projectToEdit;
            this.parentGroup = this.oldProject!.getGroup();
            if(this.oldProject.getDateRange() !== undefined && this.beginDate === undefined && this.endDate === undefined) {
                this.beginDate = this.oldProject.getDateRange().begin.toLocaleDateString();
                this.endDate = this.oldProject.getDateRange().end.toLocaleDateString();
                this.projectType = this.oldProject.getType();
                this.oldProject.getOwner().then(owner => this.owningUser = owner);
            }
        }
    }

    setComponentVisible(val: boolean) {
        this.newProjectName = (val && this.newProjectName === undefined) ? ((this.oldProject !== undefined) ? this.oldProject.getName() : "") : this.newProjectName;
        if(!val) {
            this.newProjectName = undefined;
        }
        this.forceUpdate();
    }

    componentWillUnmount() {
        PopupHandler.setPopupComponent('NewProjectPopup' + ((this.props.id === undefined) ? "" : this.props.id), undefined);
    }
}