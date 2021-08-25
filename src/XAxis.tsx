import React from "react";

import { SpectrogramXAxis } from "../index";

interface XAxisProps extends SpectrogramXAxis {
    width: number;
    height: number;
}

const XAxis = React.memo<XAxisProps>(({
    width,
    height,
    values,
    displayAxis = true,
    displayGrid = true,
    color = "black"
}) => {
    if (!displayAxis && !displayGrid) return (<></>);

    const strokeWidth = 0.25;
    const h = 48;    // svg height
    const t = 5;     // tick size

    const dx = width / values.length;
    const pos = Array.from(Array(values.length), (v, i) => {
        return i * dx + width / 128;
    });

    let gridLines: Array<JSX.Element> = [];
    let axisLabels: JSX.Element[] = [];
    let axisLines: JSX.Element[] = [];
    pos.forEach((v, i) => {
        if (displayAxis) {
            axisLabels.push(
                <text key={v} x={v} y={t + 15} text-anchor="middle">{values[i].toString()}</text>
            );
            axisLines.push(
                <path key={v} d={`M ${v},0 L ${v},${t}`} />
            );
        }
    });

    return (
        <svg
            id="xAxis"
            width={width}
            height={h}
        >
            <g fill={color} stroke={color} stroke-width={4 * strokeWidth}>{axisLines}</g>
            <g fill={color} stroke={color}>{axisLabels}</g>
        </svg>
    );
});

export default XAxis;
