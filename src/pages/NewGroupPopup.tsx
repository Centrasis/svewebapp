import React from 'react';
import { Page, List, Icon, BlockTitle, Popup, ListInput, ListButton, BlockHeader, ListItem } from 'framework7-react';
import { SVEGroup, SVEAccount, GroupInitializer } from 'svebaselib';

export type NewGroupPopupSettings = {
    owningUser: SVEAccount,
    onGroupCreated?: (group?: SVEGroup) => void,
    groupToEdit?: SVEGroup
};

export default class NewGroupPopup extends React.Component<NewGroupPopupSettings & React.HTMLAttributes<HTMLCanvasElement>, {}> {
    protected oldGroup?: SVEGroup = undefined;
    protected newGroupName: string = undefined;
    protected owningUser: SVEAccount = undefined;
    protected errorMsg: string = undefined;
    protected onGroupCreated: (group?: SVEGroup) => void = (group?: SVEGroup) => {};

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
                            title="Erstellen"
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
        new SVEGroup({name: this.newGroupName, id: (this.oldGroup !== undefined) ? this.oldGroup.getID() : NaN} as GroupInitializer, this.owningUser, (g) => {
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
        this.$f7.data.setPopupComponent(NewGroupPopup, this);
        this.updateProps();
        this.forceUpdate();
    }
    componentDidUpdate() { 
        this.updateProps(); 
        this.$f7ready((f7) => {});
    }
    componentWillUpdate() { 
        this.updateProps();
        this.$f7ready((f7) => {});
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
        this.$f7.data.setPopupComponent(NewGroupPopup, undefined);
    }
}