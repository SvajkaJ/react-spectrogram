import * as React from "react";

export type SpectrogramDatumX = Array<number | string | Date>;
export type SpectrogramDatumY = Array<number>;
export type SpectrogramDatumZ = number | string | Date;

export type SpectrogramData = {
    x: SpectrogramDatumX;
    y: SpectrogramDatumY;
    z: SpectrogramDatumZ;
};

export type SpectrogramLayout = {
    width: number;
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
    line: {
        height: number;
    };
    heatmap: {
        height: number;
    };
    scale: {
        height: number;
        width: number;
    };
};

export type SpectrogramYAxis = {
    values: Array<number>;
    displayAxis?: boolean;
    displayGrid?: boolean;
    color?: string;
};

export type SpectrogramOptions = {
    xAxis: {
        displayAxis: boolean;
        displayGrid: boolean;
        values: Array<number | string | Date>;
        color?: string;
    };
    yAxis: SpectrogramYAxis;
    zAxis: {
        displayAxis: boolean;
        max: number;
        color?: string;
    };
    line?: {
        lineWidth?: number;
        lineCap?: CanvasLineCap;
        lineJoin?: CanvasLineJoin;
    };
    theme?: SpectrogramTheme;
};

export type SpectrogramTheme = "white-red" | "white-green" | "white-blue" |
                           "black-red" | "black-green" | "black-blue" |
                           "black-white" | "white-black";

export interface ISpectrogramProps {
    data: SpectrogramData;
    options: SpectrogramOptions;
    layout: SpectrogramLayout;
}

export interface YAxisProps extends SpectrogramYAxis {
    width: number;
    height: number;
}

export interface ZAxisProps {
    width: number;
    height: number;
    z: SpectrogramDatumZ;
    displayAxis: boolean;
    color?: string;
    max: number;
    zAxisRef: React.MutableRefObject<number>;
}

declare const Spectrogram: React.FC<ISpectrogramProps>;

declare const YAxis: React.NamedExoticComponent<YAxisProps>;

export default Spectrogram;