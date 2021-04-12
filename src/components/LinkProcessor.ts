import { SVEToken, TokenType } from "svebaselib";
import { f7, f7ready, theme } from 'framework7-react';

export class LinkProcessor {
    public static joinGroup(link: string) {
        let params = new Map();
        let vars = link.substring(1).split('&');
        for (var i = 0; i < vars.length; i++) {
            let pair = vars[i].split('=');
            params.set(pair[0], decodeURI(pair[1]));
        }

        if (link.includes("token=") && link.includes("context=")) {
            new SVEToken(params.get("token"), TokenType.RessourceToken, Number(params.get("context")), (token => {
                f7.toast.create({
                text: (token.getIsValid()) ? "Beitrittslink gefunden" : "Abgelaufener Link!",
                closeButton: true,
                closeButtonText: (token.getIsValid()) ? 'Beitritt' : "OK",
                closeButtonColor: (token.getIsValid()) ? 'green' : "red",
                on: {
                    close: () => {
                    if(token.getIsValid())
                        token.use();                      
                    }
                }
                }).open();
            }));
        } else {
            let toast = f7.toast.create({
                text: "Found Link: " + link,
                closeButton: false,
                closeTimeout: 5000,
            });
            toast.open();

            if(params.has("redirectProject")) {
                let pid = Number(params.get("redirectProject"));
                f7.view.current.router.navigate("/project/" + pid + "/");
            }
        }
    }
}