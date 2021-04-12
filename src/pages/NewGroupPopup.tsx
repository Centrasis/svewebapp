import React from 'react';
import { Page, List, Icon, BlockTitle, Popup, ListInput, ListButton, BlockHeader, ListItem } from 'framework7-react';
import { SVEGroup, SVEAccount, GroupInitializer } from 'svebaselib';
import { f7, f7ready, theme } from 'framework7-react';
import { PopupHandler } from '../components/PopupHandler';

export type NewGroupPopupSettings = {
    owningUser: SVEAccount,
    onGroupCreated?: (group: SVEGroup) => void,
    groupToEdit?: SVEGroup
};

export default class NewGroupPopup extends React.Component<NewGroupPopupSettings & React.HTMLAttributes<HTMLCanvasElement>, {}> {
    protected oldGroup?: SVEGroup = undefined;
    protected newGroupName: string = undefined;
    protected owningUser: SVEAccount = undefined;
    protected errorMsg: string = undefined;
    protected onGroupCreated: (group: SVEGroup) => void = (group: SVEGroup) => { console.log("Uncaught group creation!") };

    render () {   
        return (
            <Popup swipeToClose opened={this.newGroupName !== undefined} onPopupClosed={() => { this.newGroupName = undefined; this.onGroupCreated(undefined); }}>
                <Page>
                    <BlockTitle large style={{justifySelf: "center"}}>Neue Gruppe</BlockTitle>
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
                            value={this.newGroupName}
                            onInput={(e) => {
                                this.newGroupName = e.target.value;
                                this.forceUpdate();
                            }}
                        />
                        <ListItem
                            title={(this.oldGroup !== undefined) ? "Übernehmen" : "Erstellen"}
                            onClick={this.createNewGroup.bind(this)}
                            style={{cursor: "pointer"}}
                        >
                            <Icon slot="media" f7="folder_badge_plus"></Icon>
                        </ListItem>
                    </List>
                </Page>
            </Popup>
        )
    }

    setComponentVisible(val: boolean) {
        this.newGroupName = (val && this.newGroupName === undefined) ? ((this.oldGroup !== undefined) ? this.oldGroup.getName() : "") : this.newGroupName;
        if(!val) {
            this.newGroupName = undefined;
        }
        this.forceUpdate();
    }

    createNewGroup() {
        let initializer: GroupInitializer = (this.oldGroup !== undefined) ? this.oldGroup.getAsInitializer() 
                    : {
                        id: NaN,
                        name: this.newGroupName
                    };

        initializer.name = this.newGroupName;
        new SVEGroup(initializer, this.owningUser, (g) => {
          g.store().then(val => {
                if(val) {
                    this.onGroupCreated(g);
                    this.newGroupName = undefined;
                    this.errorMsg = undefined;
                    this.forceUpdate();
                } else {
                    this.errorMsg = "Gruppe konnte nicht erstellt werden!";
                    this.forceUpdate();
                }
          });
        });
    }

    componentDidMount() { 
        this.errorMsg = undefined;
        PopupHandler.setPopupComponent('NewGroupPopup' + ((this.props.id === undefined) ? "" : this.props.id), this);
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

        if (this.props.onGroupCreated)
        {
            this.onGroupCreated = this.props.onGroupCreated;
        }

        if (this.props.groupToEdit)
        {
            this.oldGroup = this.props.groupToEdit;
        }
    }

    componentWillUnmount() {
        PopupHandler.setPopupComponent('NewGroupPopup' + ((this.props.id === undefined) ? "" : this.props.id), undefined);
    }
}