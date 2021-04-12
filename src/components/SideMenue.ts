import React from 'react';

export interface PanelMenuItem {
    caption: string;
    subMenuItems: {
        caption: string,
        onClick: () => void;
        color: string;
    }[];
}

export class SideMenue {
    protected static app: React.Component;
    protected static rightMenueContent: PanelMenuItem[] = [];
    protected static leftMenueContent: PanelMenuItem;
    
    public static pushRightPanel(content: PanelMenuItem) {
        if(content === undefined || content === null)
            return;
        content.subMenuItems = content.subMenuItems.filter(e => e !== undefined);
        SideMenue.rightMenueContent.push(content);
        SideMenue.app.forceUpdate();
    }

    public static setApp(app: React.Component) {
        SideMenue.app = app;
    }

    public static getCurrentRightMenu(): PanelMenuItem {
        return (this.rightMenueContent.length > 0) ? this.rightMenueContent[this.rightMenueContent.length - 1] : {
        subMenuItems: [],
        caption: ""
      };
    }

    public static popRightPanel(): PanelMenuItem {
        let r = this.rightMenueContent.pop();
        return r;
    }

    public static popLeftPanel(): PanelMenuItem {
        return this.leftMenueContent;
    }

    public static updateLeftPanel(content: PanelMenuItem) {
        if(content === undefined || content === null)
            return;
        content.subMenuItems = content.subMenuItems.filter(e => e !== undefined);
        SideMenue.leftMenueContent = content;
        SideMenue.app.forceUpdate();
    }
}