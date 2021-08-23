import React from "react";
import { SpectrogramYAxis } from "./Spectrogram";

export interface YAxisProps extends SpectrogramYAxis {
    width: number;
    height: number;
}

const YAxis = React.memo<YAxisProps>(({
    width,
    height,
    values,
    displayAxis = true,
    displayGrid = true,
    color = "black"
}) => {
    if (!displayAxis && !displayGrid) return (<></>);

    const strokeWidth = 0.25;
    const w = 30;    // svg width
    const t = 5;     // tick width
    const m = values[values.length - 1];

    const pos: Array<number> = values.map((v) => {
        return Math.floor(height - v * height / m);
    });

    // create paths and texts
    let gridLines: Array<JSX.Element> = [];
    let axisLines: Array<JSX.Element> = [];
    let axisLabels: Array<JSX.Element> = [];
    pos.forEach((v, i) => {
        if (displayGrid) {
            gridLines.push(
                <path key={v} d={`M ${w},${v} L ${width + w},${v}`} stroke-width={strokeWidth} />
            );
        }
        if (displayAxis) {
            axisLabels.push(
                <text key={v} text-anchor="end" x={w - 2*t} y={v + 5}>{values[i]}</text>
            );
            axisLines.push(
                <path key={v} d={`M ${w - t},${v} L ${w},${v}`} stroke-width={4 * strokeWidth} />
            );
        }
    });

    // width and height of yAxis is irrelevant because it is positioned abolutely
    return (
        <svg id="yAxis" overflow="visible" style={{ position: "absolute", left: -w }}>
            <g fill={color} stroke={color}>{gridLines}</g>
            <g fill={color} stroke={color}>{axisLines}</g>
            <g fill={color} stroke={color}>{axisLabels}</g>
        </svg>
    );
});

export default YAxis;
