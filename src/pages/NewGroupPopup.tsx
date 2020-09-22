import React from 'react';
import { Page, List, Icon, BlockTitle, Popup, ListInput, ListButton, BlockHeader } from 'framework7-react';
import { SVEGroup, SVEAccount } from 'svebaselib';

export type NewGroupPopupSettings = {
    owningUser: SVEAccount,
    onGroupCreated?: (group: SVEGroup) => void,
    visible: boolean
};

export default class NewGroupPopup extends React.Component<NewGroupPopupSettings & React.HTMLAttributes<HTMLCanvasElement>, {}> {
    protected newGroupName: string = undefined;
    protected owningUser: SVEAccount = undefined;
    protected errorMsg: string = undefined;
    protected onGroupCreated: (group: SVEGroup) => void = (group: SVEGroup) => {};

    render () {   
        return (
            <Popup className="group-create" swipeToClose opened={this.newGroupName !== undefined} onPopupClosed={() => this.newGroupName = undefined}>
                <Page>
                    <BlockTitle large style={{justifySelf: "center"}}>Neue Gruppe</BlockTitle>
                    {(this.errorMsg !== undefined) ? (
                        <BlockHeader color="red" style={{color: "red"}}>
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
                        }}
                    />
                    <ListButton
                        onClick={this.createNewGroup.bind(this)}
                    >
                        <Icon slot="media" f7="folder_badge_plus"></Icon>
                        Erstellen
                    </ListButton>
                    </List>
                </Page>
            </Popup>
        )
    }

    createNewGroup() {
        new SVEGroup({name: this.newGroupName}, this.owningUser, (g) => {
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
    }
    componentDidUpdate() { this.updateProps(); }

    updateProps() {
        this.newGroupName = (this.props.visible) ? "" : undefined;
        this.owningUser = this.props.owningUser;

        if (this.props.onGroupCreated)
        {
            this.onGroupCreated = this.props.onGroupCreated;
        }
    }
}