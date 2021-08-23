import * as React from "react";

export type SpectrogramDatum = {
    x: Array<number | string | Date>;
    y: Array<number>;
    z: number | string | Date | null;
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
    data: SpectrogramDatum;
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
    label: string;
    displayAxis: boolean;
    color?: string;
    max: number;
}

declare const Spectrogram: React.FC<ISpectrogramProps>;

declare const YAxis: React.NamedExoticComponent<YAxisProps>;

export default Spectrogram;