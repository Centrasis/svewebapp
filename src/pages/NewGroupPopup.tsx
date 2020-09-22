import React from 'react';
import { Page, List, Icon, BlockTitle, Popup, ListInput, ListButton, BlockHeader, ListItem } from 'framework7-react';
import { SVEGroup, SVEAccount, GroupInitializer } from 'svebaselib';

export type NewGroupPopupSettings = {
    owningUser: SVEAccount,
    onGroupCreated?: (group?: SVEGroup) => void,
    visible: boolean
};

export default class NewGroupPopup extends React.Component<NewGroupPopupSettings & React.HTMLAttributes<HTMLCanvasElement>, {}> {
    protected newGroupName: string = undefined;
    protected owningUser: SVEAccount = undefined;
    protected errorMsg: string = undefined;
    protected beginDate: Date = undefined;
    protected endDate: Date = undefined;
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

    createNewGroup() {
        new SVEGroup({name: this.newGroupName, id: NaN} as GroupInitializer, this.owningUser, (g) => {
          g.store().then(val => {
            if(val) {
              this.newGroupName = undefined;
              this.errorMsg = undefined;
              this.forceUpdate();
              this.onGroupCreated(g);
            } else {
                this.errorMsg = "Gruppe konnte nicht erstellt werden!";
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
        this.newGroupName = (this.props.visible && this.newGroupName === undefined) ? "" : this.newGroupName;
        if(!this.props.visible) {
            this.newGroupName = undefined;
        }
        this.owningUser = this.props.owningUser;

        if (this.props.onGroupCreated)
        {
            this.onGroupCreated = this.props.onGroupCreated;
        }
    }
}