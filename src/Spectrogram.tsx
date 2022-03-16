import React from "react";

import { ISpectrogramProps } from "./Spectrogram.types";
import { SpectrogramDatumX, SpectrogramDatumZ} from "./Spectrogram.types";
import { SpectrogramXAxis, SpectrogramYAxis, SpectrogramZAxis } from "./Spectrogram.types";


const Spectrogram: React.FC<ISpectrogramProps> = ({
    data,
    layout,
    options
}) => {
    const lineCanvasRef = React.useRef<HTMLCanvasElement>(null);
    const heatmapCanvasRef = React.useRef<HTMLCanvasElement>(null);

    // Sanitize options prop
    const opt = React.useMemo(() => {
        const sortedValues = options.yAxis.values.sort((a, b) => a - b);
        const minValue = sortedValues[0];
        const maxValue = sortedValues[sortedValues.length - 1];
        const range = maxValue - minValue;
        return {
            ...options,
            yAxis: {
                ...options.yAxis,
                values: sortedValues,
                maxValue: maxValue,
                minValue: minValue,
                range: range
            }
        };
    }, [options]);
    const optionsRef = React.useRef(opt);
    optionsRef.current = opt;

    // Nothing to sanitize
    const layoutRef = React.useRef(layout);
    layoutRef.current = layout;

    // util function
    // resolves the color according to theme
    const colorRef = React.useRef<(p: number) => string>(() => "");
    colorRef.current = React.useMemo(() => {
        switch(options?.theme) {
            case "blue-green-red":
                return (p: number) => {
                    const t = 240;
                    // blue:  hsl(240,100%,50%)
                    // green: hsl(120,100%,50%)
                    // red:   hsl(0,100%,50%)
                    const x = t - p * t;
                    return `hsl(${x},100%,50%)`;
                };
            case "black-white":
                return (p: number) => {
                    const t = 255;
                    const x = p * t;
                    return `rgb(${x},${x},${x})`;
                };
            case "white-black":
                return (p: number) => {
                    const t = 255;
                    const x = t - p * t;
                    return `rgb(${x},${x},${x})`;
                };
            case "black-red":
                return (p: number) => {
                    const t = 255;
                    const x = p * t;
                    return `rgb(${x},0,0)`;
                };
            case "black-green":
                return (p: number) => {
                    const t = 255;
                    const x = p * t;
                    return `rgb(0,${x},0)`;
                };
            case "black-blue":
                return (p: number) => {
                    const t = 255;
                    const x = p * t;
                    return `rgb(0,0,${x})`;
                };
            case "white-red":
                return (p: number) => {
                    const t = 255;
                    const x = t - p * t;
                    return `rgb(255,${x},${x})`;
                };
            case "white-green":
                return (p: number) => {
                    const t = 255;
                    const x = t - p * t;
                    return `rgb(${x},255,${x})`;
                };
            case "white-blue":
            default:
                return (p: number) => {
                    const t = 255;
                    const x = t - p * t;
                    return `rgb(${x},${x},255)`;
                };
        }
    }, [options?.theme]);

    const containerStyle: React.CSSProperties = {
        paddingTop: layoutRef.current.paddingTop,
        paddingRight: layoutRef.current.paddingRight,
        paddingBottom: layoutRef.current.paddingBottom,
        paddingLeft: layoutRef.current.paddingLeft
    };
    const lineContainerStyle: React.CSSProperties = {
        position: "relative"
    };
    const heatmapContainerStyle: React.CSSProperties = {
        position: "relative",
        marginTop: layoutRef.current.heatmap.marginTop
    };
    const heatmapCanvasStyle: React.CSSProperties = {};
    const canvasStyle: React.CSSProperties = {
        display: "block"
    };
    const scaleContainerStyle: React.CSSProperties = {};

    // When new data arrive update charts
    React.useEffect(() => {
        const drawLine = (data: Array<number>): boolean => {
            const canvas = lineCanvasRef.current;
            if (canvas === null) return false;
            const ctx = canvas.getContext("2d");
            if (ctx === null) return false;

            const dx = canvas.width / data.length;
            const dk = canvas.height / optionsRef.current.yAxis.range;
            let x = dx / 2;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = colorRef.current(1);
            ctx.lineWidth = 1;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            ctx.beginPath();
            ctx.moveTo(x, (optionsRef.current.yAxis.maxValue - data[0]) * dk);
            for (let value of data.slice(1)) {
                x += dx;
                ctx.lineTo(x, (optionsRef.current.yAxis.maxValue - value) * dk);
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
            const dy = layoutRef.current.heatmap.height / optionsRef.current.zAxis.displayBins;
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
                ctx.fillStyle = colorRef.current((value - optionsRef.current.yAxis.minValue) / optionsRef.current.yAxis.range);
                ctx.fillRect(x, 0, dx, dy);
                x += dx;
            }

            return true;
        };

        if (data.y.length !== 0) {
            drawLine(data.y);
            drawHeatmap(data.y);
        }
        // this can execute only when data changes!
    }, [data.x, data.y, data.z]);

    const yScale: JSX.Element = React.useMemo(() => {
        const Xoffset = 5;
        const Yoffset = 16;
        const scaleStyle: React.CSSProperties = {
            marginTop: layout.scale.marginTop,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: "black"
        };
        return (
            <svg width={layout.width} height={layout.scale.height} overflow="visible" style={scaleStyle}>
                <defs>
                    <linearGradient id="linearGradient">
                        <stop offset="0%" stopColor={colorRef.current(0)} stopOpacity={1} />
                        <stop offset="50%" stopColor={colorRef.current(0.5)} stopOpacity={1} />
                        <stop offset="100%" stopColor={colorRef.current(1)} stopOpacity={1} />
                    </linearGradient>
                </defs>
                <rect fill="url('#linearGradient')" width={layout.width} height={layout.scale.height} />
                <text
                    x={Xoffset}
                    y={layout.scale.height + Yoffset}
                    fill="black"
                    stroke="black"
                    textAnchor="start"
                >{optionsRef.current.yAxis.minValue}</text>
                <text
                    x={layout.width - Xoffset}
                    y={layout.scale.height + Yoffset}
                    fill="black"
                    stroke="black"
                    textAnchor="end"
                >{optionsRef.current.yAxis.maxValue}</text>
            </svg>
        );
    }, [layout]);

    return (
        <div style={containerStyle}>
        <div style={lineContainerStyle}>
            <YAxis
                width={layoutRef.current.width}
                height={layoutRef.current.line.height}
                min={optionsRef.current.yAxis.minValue}
                max={optionsRef.current.yAxis.maxValue}
                range={optionsRef.current.yAxis.range}
                values={optionsRef.current.yAxis.values}
                displayAxis={optionsRef.current.yAxis.displayAxis}
                displayGrid={optionsRef.current.yAxis.displayGrid}
                color={optionsRef.current.yAxis.color}
            />
            <canvas
                id="lineChart"
                ref={lineCanvasRef}
                width={layoutRef.current.width}
                height={layoutRef.current.line.height}
                style={{ ...canvasStyle }}
            ></canvas>
            <XAxis
                width={layoutRef.current.width}
                height={layoutRef.current.line.height}
                values={optionsRef.current.xAxis.values}
                x={data.x}
                displayAxis={optionsRef.current.xAxis.displayAxis}
                displayGrid={optionsRef.current.xAxis.displayGrid}
                color={optionsRef.current.xAxis.color}
            />
        </div>
        <div style={heatmapContainerStyle}>
            <ZAxis
                width={layoutRef.current.width}
                height={layoutRef.current.heatmap.height}
                z={data.z}
                displayBins={optionsRef.current.zAxis.displayBins}
                displayAxis={optionsRef.current.zAxis.displayAxis}
                color={optionsRef.current.zAxis.color}
            />
            <canvas
                id="heatmapChart"
                ref={heatmapCanvasRef}
                width={layoutRef.current.width}
                height={layoutRef.current.heatmap.height}
                style={{ ...canvasStyle, ...heatmapCanvasStyle }}
            >Your browser does not support &lt;canvas&gt; tag element!</canvas>
            <XAxis
                width={layoutRef.current.width}
                height={layoutRef.current.heatmap.height}
                values={optionsRef.current.xAxis.values}
                x={data.x}
                displayAxis={optionsRef.current.xAxis.displayAxis}
                displayGrid={false}
                color={optionsRef.current.xAxis.color}
            />
        </div>
        <div style={scaleContainerStyle}>
            {yScale}
        </div>
        </div>
    );
};

interface XAxisProps extends SpectrogramXAxis {
    width: number;
    height: number;
    x: SpectrogramDatumX;
}

const XAxis: React.FC <XAxisProps> = ({
    width,
    height,
    values,
    x,
    displayAxis = true,
    displayGrid = true,
    color = "black"
}) => {
    const strokeWidth = 0.25;
    const t = 5;     // tick size

    const get_pos = (): Array<number> => {
        const dx = width / x.length;
        let pos: Array<number> = [];
        x.forEach((v, i) => {
            if (values.includes(v)) {
                pos.push(i * dx + dx / 2);
            }
        });
        return pos;
    };
    const pos = get_pos();

    const get_axisLines = (): Array<JSX.Element> => {
        let axisLines: Array<JSX.Element> = [];
        if (displayAxis) {
            pos.forEach((v, i) => {
                axisLines.push(
                    <path key={v} d={`M ${v},0 L ${v},${t}`} />
                );
            });
        }
        return axisLines;
    };
    const axisLines = get_axisLines();

    const get_axisLabels = (): Array<JSX.Element> => {
        let axisLabels: Array<JSX.Element> = [];
        if (displayAxis) {
            pos.forEach((v, i) => {
                axisLabels.push(
                    <text key={v} x={v} y={t + 15} textAnchor="middle">{values[i].toString()}</text>
                );
            });
        }
        return axisLabels;
    };
    const axisLabels = get_axisLabels();

    const get_gridLines = (): Array<JSX.Element> => {
        let gridLines: Array<JSX.Element> = [];
        if (displayGrid) {
            pos.forEach((v, i) => {
                gridLines.push(
                    <path key={v} d={`M ${v},${0} L ${v},${-height}`} />
                );
            });
        }
        return gridLines;
    };
    const gridLines = get_gridLines();

    if (!displayAxis && !displayGrid) return (<></>);

    return (
        <svg
            id="xAxis"
            width={width}
            height={10}
            style={{ position: "absolute", left: 0, top: height}}
            overflow="visible"
        >
            <g fill={color} stroke={color} strokeWidth={strokeWidth}>{gridLines}</g>
            <g fill={color} stroke={color} strokeWidth={4 * strokeWidth}>{axisLines}</g>
            <g fill={color} stroke={color}>{axisLabels}</g>
        </svg>
    );
/*}, (prevProps, nextProps) => (
       prevProps.color !== nextProps.color
    || prevProps.displayAxis !== nextProps.displayAxis
    || prevProps.displayGrid !== nextProps.displayGrid
    || prevProps.height !== nextProps.height
    || prevProps.width !== nextProps.width
    || prevProps.x !== nextProps.x
    || prevProps.values !== nextProps.values
));*/
// hopeless
};


interface YAxisProps extends SpectrogramYAxis {
    width: number;
    height: number;
    min: number;
    max: number;
    range: number;
}

const YAxis: React.FC<YAxisProps> = ({
    width,
    height,
    min,
    max,
    range,
    values,
    displayAxis = true,
    displayGrid = true,
    color = "black"
}) => {
    const strokeWidth = 0.25;
    const w = 30;    // svg width
    const t = 5;     // tick width
    const scale = height / range;

    const pos: Array<number> = values.map((v) => {
        return Math.floor(height - v * scale + min * scale);
    });

    const axisLines: Array<JSX.Element> = React.useMemo(() => {
        let axisLines: Array<JSX.Element> = [];
        if (displayAxis) {
            pos.forEach((v, i) => {
                axisLines.push(
                    <path key={v} d={`M ${w - t},${v} L ${w},${v}`} />
                );
            });
        }
        return axisLines;
    }, [pos, w, t, displayAxis]);

    const axisLabels: Array<JSX.Element> = React.useMemo(() => {
        let axisLabels: Array<JSX.Element> = [];
        if (displayAxis) {
            pos.forEach((v, i) => {
                axisLabels.push(
                    <text key={v} textAnchor="end" x={w - 2*t} y={v + 5}>{values[i]}</text>
                );
            });
        }
        return axisLabels;
    }, [pos, t, w, values, displayAxis]);

    const gridLines: Array<JSX.Element> = React.useMemo(() => {
        let gridLines: Array<JSX.Element> = [];
        if (displayGrid) {
            pos.forEach((v, i) => {
                gridLines.push(
                    <path key={v} d={`M ${w},${v} L ${width + w},${v}`} />
                );
            });
        }
        return gridLines;
    }, [pos, w, displayGrid, width]);

    if (!displayAxis && !displayGrid) return (<></>);
    // width and height of yAxis is irrelevant because it is positioned abolutely
    return (
        <svg id="yAxis" overflow="visible" style={{ position: "absolute", left: -w }}>
            <g fill={color} stroke={color} strokeWidth={strokeWidth}>{gridLines}</g>
            <g fill={color} stroke={color} strokeWidth={4 * strokeWidth}>{axisLines}</g>
            <g fill={color} stroke={color}>{axisLabels}</g>
        </svg>
    );
};


interface ZAxisProps extends SpectrogramZAxis {
    width: number;
    height: number;
    z: SpectrogramDatumZ;
}

const ZAxis = React.memo<ZAxisProps>(({
    width,
    height,
    z,
    displayBins,
    displayAxis = true,
    color = "black",
}) => {
    const axisLabelsRef = React.useRef<Array<SpectrogramDatumZ>>([]);
    const [axisLabels, setAxisLabels] = React.useState<Array<JSX.Element>>([]);

    const strokeWidth = 0.25;
    const w = 30;    // svg width
    const t = 5;     // tick width

    const pos = React.useMemo(() => {
        const dz = height / displayBins;
        return Array.from(Array(displayBins), (v, i) => {
            return i * dz + dz / 2;
        });
    }, [height, displayBins]);

    const axisLines = React.useMemo(() => {
        let axisLines: Array<JSX.Element> = [];
        pos.forEach((v, i) => {
            axisLines.push(
                <path key={v} d={`M ${w - t},${v} L ${w},${v}`} />
            );
        });
        return axisLines;
    }, [pos, w, t]);

    // on new z value recreate all <text> labels
    React.useEffect(() => {
        if (axisLabelsRef.current.length < displayBins) {
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
                        <text key={`${i}-${l.toLocaleTimeString()}`} textAnchor="end" x={w - 2 * t} y={pos[i] + 5}>{l.toLocaleTimeString()}</text>
                    );
                    break;
                case "string":
                    labels.push(
                        <text key={`${i}-${l}`} textAnchor="end" x={w - 2 * t} y={pos[i] + 5}>{l}</text>
                    );
                    break;
                case "number":
                    labels.push(
                        <text key={`${i}-${l.toLocaleString()}`} textAnchor="end" x={w - 2 * t} y={pos[i] + 5}>{l.toLocaleString()}</text>
                    );
                    break;
                default:
                    break;
            }
        });
        setAxisLabels(labels);
    // Deliberatly missing dependencies: 'displayBins' and 'pos'.
    // eslint-disable-next-line
    }, [z]);

    if (!displayAxis) return (<></>);
    // width and height of zAxis is irrelevant because it is positioned abolutely
    return (
        <svg id="zAxis" overflow="visible" style={{ position: "absolute", left: -w }}>
            <g fill={color} stroke={color} strokeWidth={4 * strokeWidth}>{axisLines}</g>
            <g fill={color} stroke={color}>{axisLabels}</g>
        </svg>
    );
});

export default Spectrogram;