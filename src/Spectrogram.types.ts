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
        marginTop: number;
    };
    scale: {
        height: number;
        marginTop: number;
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
    displayBins: number;
    displayAxis?: boolean;
    color?: string;
};
export type SpectrogramTheme = "white-red" | "white-green" | "white-blue" | "black-red" | "black-green" | "black-blue" | "black-white" | "white-black";
export type SpectrogramOptions = {
    xAxis: SpectrogramXAxis;
    yAxis: SpectrogramYAxis;
    zAxis: SpectrogramZAxis;
    theme?: SpectrogramTheme;
};
export interface ISpectrogramProps {
    data: SpectrogramData;
    options: SpectrogramOptions;
    layout: SpectrogramLayout;
}