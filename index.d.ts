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
    };
};

export type SpectrogramXAxis = {
    values: Array<number | string | Date>;
    displayAxis?: boolean;
    displayGrid?: boolean;
    color?: string;
};

export type SpectrogramYAxis = {
    values: Array<number>;
    displayAxis?: boolean;
    displayGrid?: boolean;
    color?: string;
};

export type SpectrogramZAxis = {
    max: number;
    displayAxis?: boolean;
    color?: string;
};

export type SpectrogramOptions = {
    xAxis: SpectrogramXAxis;
    yAxis: SpectrogramYAxis;
    zAxis: SpectrogramZAxis;
    line?: {
        lineWidth?: number;
        lineCap?: CanvasLineCap;
        lineJoin?: CanvasLineJoin;
    };
    theme?: SpectrogramTheme;
};

export type SpectrogramTheme = "white-red" | "white-green" | "white-blue" |
    "black-red" | "black-green" | "black-blue" | "black-white" | "white-black";

export interface ISpectrogramProps {
    data: SpectrogramData;
    options: SpectrogramOptions;
    layout: SpectrogramLayout;
}

/**
 * The only prop that should change is data prop.
 * Dynamically changing any other props could lead
 * to unwanted results.
 */
declare const Spectrogram: React.FC<ISpectrogramProps>;

export default Spectrogram;