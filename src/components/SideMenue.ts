import React from 'react';

export interface PanelSubMenuItem {
    caption: string,
    icon: string,
    onClick: () => void;
    color?: string;
}

export interface PanelMenuItem {
    caption: string;
    subMenuItems: (PanelSubMenuItem | undefined)[];
}

export class SideMenue {
    protected static app: React.Component;
    protected static rightMenueContent: PanelMenuItem = undefined;
    protected static leftMenueContent: PanelMenuItem;
    
    public static setRightPanel(content: PanelMenuItem) {
        if(content === undefined || content === null)
            return;
        content.subMenuItems = content.subMenuItems.filter(e => e !== undefined);
        SideMenue.rightMenueContent = content;
        SideMenue.app.forceUpdate();
    }

    public static setApp(app: React.Component) {
        SideMenue.app = app;
    }

    public static getCurrentRightMenu(): PanelMenuItem {
        return (this.rightMenueContent !== undefined) ? this.rightMenueContent : {
        subMenuItems: [],
        caption: ""
      };
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