import React from 'react';
import { SVEData } from 'svebaselib';
export declare enum Sorting {
    AgeASC = 0,
    AgeDESC = 1,
    UploadASC = 2,
    UploadDESC = 3
}
export declare type MediaSettings = {
    data: SVEData[];
    caption?: string;
    sortBy?: Sorting;
    enableDeletion?: boolean;
    enableFavorization?: boolean;
    displayCount?: number;
    onDeleteMedia?: (id: number) => void;
};
export default class MediaGallery extends React.Component<MediaSettings & React.HTMLAttributes<HTMLCanvasElement>, {}> {
    protected data: SVEData[];
    protected displayCount: number;
    protected caption: string;
    protected enableDeletion: boolean;
    protected enableFavorization: boolean;
    protected sortBy: Sorting;
    protected onDeleteMedia: (id: number) => void;
    protected favoriteImgs: Set<number>;
    componentDidMount(): void;
    render(): JSX.Element[];
    saveImageToDevice(img: SVEData): void;
    getPartialImagesList(): SVEData[];
    deleteFromServer(img: SVEData): void;
    markWithStar(img: SVEData): void;
    removeStar(img: SVEData): void;
    onClickImage(img: SVEData): void;
}
//# sourceMappingURL=MediaGallery.d.ts.map