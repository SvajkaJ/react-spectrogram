import React from "react";

import { SpectrogramDatumZ, SpectrogramZAxis } from "./Spectrogram.types";

interface ZAxisProps extends SpectrogramZAxis {
    width: number;
    height: number;
    z: SpectrogramDatumZ;
    zAxisRef: React.MutableRefObject<number>;
}

const ZAxis: React.FC<ZAxisProps> = ({
    width,
    height,
    z,
    zAxisRef,
    max,
    displayAxis = true,
    color = "black",
}) => {
    const axisLabelsRef = React.useRef<Array<SpectrogramDatumZ>>([]);
    const [axisLabels, setAxisLabels] = React.useState<Array<JSX.Element>>([]);

    const strokeWidth = 0.25;
    const w = 30;    // svg width
    const t = 5;     // tick width

    const pos = React.useMemo(() => {
        const dz = height / max;
        return Array.from(Array(max), (v, i) => {
            return i * dz + dz / 2;
        });
    }, [height, max]);

    const axisLines = React.useMemo(() => {
        let axisLines: Array<JSX.Element> = [];
        pos.forEach((v, i) => {
            axisLines.push(
                <path key={v} d={`M ${w - t},${v} L ${w},${v}`} />
            );
        });
        return axisLines;
    }, [pos, strokeWidth, w, t]);

    // on new z value recreate all <text> labels
    React.useEffect(() => {
        zAxisRef.current++;

        if (axisLabelsRef.current.length < max) {
            axisLabelsRef.current.unshift(z);
        }
        else {
            axisLabelsRef.current.pop();
            axisLabelsRef.current.unshift(z);
        }

        let labels: Array<JSX.Element> = [];
        axisLabelsRef.current.forEach((l, i) => {
            switch(typeof l) {
                case "object":
                    labels.push(
                        <text key={`${i}-${l.toLocaleTimeString()}`} text-anchor="end" x={w - 2 * t} y={pos[i] + 5}>{l.toLocaleTimeString()}</text>
                    );
                    break;
                case "string":
                    labels.push(
                        <text key={`${i}-${l}`} text-anchor="end" x={w - 2 * t} y={pos[i] + 5}>{l}</text>
                    );
                    break;
                case "number":
                    labels.push(
                        <text key={`${i}-${l.toLocaleString()}`} text-anchor="end" x={w - 2 * t} y={pos[i] + 5}>{l.toLocaleString()}</text>
                    );
                    break;
                default:
                    break;
            }
        });
        setAxisLabels(labels);
    }, [z]);

    if (!displayAxis) return (<></>);
    // width and height of zAxis is irrelevant because it is positioned abolutely
    return (
        <svg id="zAxis" overflow="visible" style={{ position: "absolute", left: -w }}>
            <g fill={color} stroke={color} stroke-width={4 * strokeWidth}>{axisLines}</g>
            <g fill={color} stroke={color}>{axisLabels}</g>
        </svg>
    );
};

export default ZAxis;
