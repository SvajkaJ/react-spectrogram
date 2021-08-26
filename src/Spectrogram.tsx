import React from "react";

import { ISpectrogramProps } from "./Spectrogram.types";
import { SpectrogramXAxis } from "./Spectrogram.types";
import { SpectrogramYAxis } from "./Spectrogram.types";
import { SpectrogramDatumZ, SpectrogramZAxis } from "./Spectrogram.types";

const Spectrogram: React.FC<ISpectrogramProps> = ({
    data,
    layout,
    options
}) => {
    const lineCanvasRef = React.useRef<HTMLCanvasElement>(null);
    const heatmapCanvasRef = React.useRef<HTMLCanvasElement>(null);

    const minYScaleValue = options.yAxis.values[0];
    const maxYScaleValue = options.yAxis.values[options.yAxis.values.length - 1];

    const containerStyle: React.CSSProperties = {
        paddingTop: layout?.paddingTop,
        paddingRight: layout?.paddingRight,
        paddingBottom: layout?.paddingBottom,
        paddingLeft: layout?.paddingLeft
    };

    const lineContainerStyle: React.CSSProperties = {
        position: "relative"
    };

    const heatmapContainerStyle: React.CSSProperties = {
        position: "relative",
        marginTop: 16
    };

    const heatmapCanvasStyle: React.CSSProperties = {
        
    };

    const canvasStyle: React.CSSProperties = {
        display: "block"
    };

    // util function
    const fillStyle: (x: number) => string = React.useMemo(() => {
        switch(options?.theme) {
            case "black-white":
                return (x: number) => {
                    return `rgb(${x},${x},${x})`;
                };
            case "white-black":
                return (x: number) => {
                    x = 255 - x;
                    return `rgb(${x},${x},${x})`;
                };
            case "black-red":
                return (x: number) => {
                    return `rgb(${x},0,0)`;
                };
            case "black-green":
                return (x: number) => {
                    return `rgb(0,${x},0)`;
                };
            case "black-blue":
                return (x: number) => {
                    return `rgb(0,0,${x})`;
                };
            case "white-red":
                return (x: number) => {
                    x = 255 - x;
                    return `rgb(255,${x},${x})`;
                };
            case "white-green":
                return (x: number) => {
                    x = 255 - x;
                    return `rgb(${x},255,${x})`;
                };
            case "white-blue":
            default:
                return (x: number) => {
                    x = 255 - x;
                    return `rgb(${x},${x},255)`;
                };
        }
    }, [options?.theme]);

    // util function
    const baseStyle: () => number  = React.useMemo(() => {
        switch(options?.theme) {
            case "black-white":
                return () => 255;
            case "white-black":
                return () => 255;
            case "black-red":
                return () => 255;
            case "black-green":
                return () => 255;
            case "black-blue":
                return () => 255;
            case "white-red":
                return () => 255;
            case "white-green":
                return () => 255;
            case "white-blue":
            default:
                return () => 255;
        }
    }, [options?.theme]);

    // When new data arrive update charts
    React.useEffect(() => {
        const drawLine = (data: Array<number>): boolean => {
            const canvas = lineCanvasRef.current;
            if (canvas === null) return false;
            const ctx = canvas.getContext("2d");
            if (ctx === null) return false;

            const dx = canvas.width / data.length;
            const dk = canvas.height / maxYScaleValue;
            let x = dx / 2;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = fillStyle(baseStyle());
            ctx.lineWidth = options.line?.lineWidth || 1;
            ctx.lineCap = options.line?.lineCap || "round";
            ctx.lineJoin = options.line?.lineJoin || "round";

            ctx.beginPath();
            ctx.moveTo(x, (maxYScaleValue - data[0]) * dk);
            for (let value of data.slice(1)) {
                x += dx;
                ctx.lineTo(x, (maxYScaleValue - value) * dk);
            }
            ctx.stroke();

            return true;
        }

        const drawHeatmap = (data: Array<number>): boolean => {
            const canvas = heatmapCanvasRef.current;
            if (canvas === null) return false;
            const ctx = canvas.getContext("2d");
            if (ctx === null) return false;

            // dx can be floating point, then it glitches
            // https://stackoverflow.com/questions/58136632/fillrect-not-overlapping-exactly-when-float-numbers-are-used
            // https://html5rocks.com/en/tutorials/canvas/performance/#toc-avoid-float
            const dx = canvas.width / data.length;
            const dy = layout.heatmap.height / options.zAxis.max;
            let x = 0;

            /**
             * The shift operation was carefully chosen to maximize performance.
             * It is implemented by drawImage - canvas is drawn onto itself with
             * an offset.
             * This effectively deletes anything that is shifted beyond canvas
             * in a single operation. Experimental evaluation revealed this
             * method to be much faster than using putImageData method.
             */
            ctx.drawImage(canvas, 0, dy);

            for (let value of data) {
                ctx.fillStyle = fillStyle(value / maxYScaleValue * baseStyle());
                ctx.fillRect(x, 0, dx, dy);
                x += dx;
            }

            return true;
        };

        if (data.y.length !== 0) {
            drawLine(data.y);
            drawHeatmap(data.y);
        }
    }, [data, fillStyle, baseStyle]);

    const yScale: JSX.Element = (
        <svg width={layout.width} height={layout.scale.height} overflow="visible">
            <defs>
                <linearGradient id="linearGradient">
                    <stop offset="0%" stop-color={fillStyle(0)} />
                    <stop offset="100%" stop-color={fillStyle(baseStyle())} />
                </linearGradient>
            </defs>
            <rect fill="url('#linearGradient')" width={layout.width} height={layout.scale.height} />

            <text x={5} y={layout.scale.height - (layout.scale.height - 11) / 2} fill={fillStyle(baseStyle())} stroke={fillStyle(baseStyle())} textAnchor="start">{minYScaleValue}</text>
            <text x={layout.width - 5} y={layout.scale.height - (layout.scale.height - 11) / 2} fill={fillStyle(0)} stroke={fillStyle(0)} textAnchor="end">{maxYScaleValue}</text>
        </svg>
    );

    return (
        <div style={containerStyle}>
        <div style={lineContainerStyle}>
            <YAxis {...options.yAxis} width={layout.width} height={layout.line.height} />
            <canvas
                id="lineChart"
                ref={lineCanvasRef}
                width={layout.width}
                height={layout.line.height}
                style={{ ...canvasStyle }}
            ></canvas>
        </div>
        <div style={heatmapContainerStyle}>
            <ZAxis {...options.zAxis} z={data.z} width={layout.width} height={layout.heatmap.height} />
            <canvas
                id="heatmapChart"
                ref={heatmapCanvasRef}
                width={layout.width}
                height={layout.heatmap.height}
                style={{ ...canvasStyle, ...heatmapCanvasStyle }}
            >Your browser does not support &lt;canvas&gt; tag element!</canvas>
            <XAxis {...options.xAxis} width={layout.width} height={layout.heatmap.height} />
        </div>
        {yScale}
        </div>
    );
};

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

interface YAxisProps extends SpectrogramYAxis {
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
                <path key={v} d={`M ${w},${v} L ${width + w},${v}`} />
            );
        }
        if (displayAxis) {
            axisLabels.push(
                <text key={v} text-anchor="end" x={w - 2*t} y={v + 5}>{values[i]}</text>
            );
            axisLines.push(
                <path key={v} d={`M ${w - t},${v} L ${w},${v}`} />
            );
        }
    });

    // width and height of yAxis is irrelevant because it is positioned abolutely
    return (
        <svg id="yAxis" overflow="visible" style={{ position: "absolute", left: -w }}>
            <g fill={color} stroke={color} stroke-width={strokeWidth}>{gridLines}</g>
            <g fill={color} stroke={color} stroke-width={4 * strokeWidth}>{axisLines}</g>
            <g fill={color} stroke={color}>{axisLabels}</g>
        </svg>
    );
});

interface ZAxisProps extends SpectrogramZAxis {
    width: number;
    height: number;
    z: SpectrogramDatumZ;
}

const ZAxis: React.FC<ZAxisProps> = ({
    width,
    height,
    z,
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

export default Spectrogram;