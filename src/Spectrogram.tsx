import React from "react";

import YAxis from "./YAxis";
//import ZAxis from "./ZAxis";

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



/**
 * The only prop that should change is data prop.
 * Dynamically changing any other props could lead
 * to unwanted results.
 */
const Spectrogram: React.FC<ISpectrogramProps> = ({
    data,
    layout,
    options
}) => {
    const lineCanvasRef = React.useRef<HTMLCanvasElement>(null);
    const heatmapCanvasRef = React.useRef<HTMLCanvasElement>(null);
    const scaleCanvasRef = React.useRef<HTMLCanvasElement>(null);

    const renderRef = React.useRef<number>(0);

    const minYScaleValue = options.yAxis.values[0];
    const maxYScaleValue = options.yAxis.values[options.yAxis.values.length - 1];

    const containerStyle: React.CSSProperties = {
        backgroundColor: "palegoldenrod",
        paddingTop: layout?.paddingTop,
        paddingRight: layout?.paddingRight,
        paddingBottom: layout?.paddingBottom,
        paddingLeft: layout?.paddingLeft
    };

    const lineContainerStyle: React.CSSProperties = {
        position: "relative"
        /*display: "flex",
        justifyContent: "flex-start",
        alignItems: "center"*/
    };

    const heatmapContainerStyle: React.CSSProperties = {
        position: "relative"
    };

    const scaleContainerStyle: React.CSSProperties = {
        width: layout.width,
        display: "flex",
        justifyContent: "center"
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

    // Draw scale
    React.useEffect(() => {
        const drawScale = (): boolean => {
            const canvas = scaleCanvasRef.current;
            if (canvas === null) return false;
            const ctx = canvas.getContext("2d");
            if (ctx === null) return false;

            const scaleMidd = Math.floor(canvas.width / 2);
            const scaleBase = baseStyle() + 1;
            const dx = 2;
            const dw = dx * scaleBase / 2;

            for (let i = 0; i < scaleBase; i++) {
                ctx.fillStyle = fillStyle(i);
                ctx.fillRect(scaleMidd - dw + i * dx, 0, dx, canvas.height);
            }

            return true;
        };

        drawScale();

    }, [fillStyle, baseStyle])

    React.useEffect(() => {
        renderRef.current++;
    });

    /*const heatmapAxis: JSX.Element = React.useMemo(() => {
        const w = leftAxisWidth;
        const h = heatmap.height;
        const t = 5;
        const dz = heatmap.height / zScale.max;

        let ticks: Array<JSX.Element> = [];
        for (let zz = dz / 2; zz < heatmap.height; zz += dz) {
            ticks.push(
                <path key={zz} d={`M ${w},${zz} L ${w - t},${zz}`} />
            );
        }

        return (
            <>
            <g fill="none" stroke="black">
                <path d={`M ${w},0 L ${w},${h}`} />
                {ticks}
            </g>
            <g fill="none" stroke="black"></g>
            </>
        );
    }, [heatmap.height, leftAxisWidth, zScale]);*/

    // on every change of data.z update zScale
    /*React.useEffect(() => {
        const updateZScale = () => {
            const svg = heatmapScaleRef.current;
            if (svg === null) return false;

            // move every text down
            const node = new SVGTextElement()
            svg.lastChild?.appendChild(node)

            const elements = svg.lastChild!.childNodes;
            
            console.log(elements.length);
        };

        updateZScale();
    }, [data.z]);*/

    let label: string = "";
    switch(typeof data.z) {
        case "number":
            label = data.z.toLocaleString();
            break;
        case "string":
            label = data.z;
            break;
        case "object":
            label = data.z ? `${data.z.getSeconds()}:${data.z.getMilliseconds()}` : "";
            break;
        default:
            label = "";
            break;
    }

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
            {/* <ZAxis {...options.zAxis} label={label} width={layout.width} height={layout.heatmap.height} /> */}
            {/* <svg
                id="heatmapScale"
                ref={heatmapScaleRef}
                width={leftAxisWidth}
                height={heatmap.height}
            >
                {heatmapAxis}
            </svg> */}
            <canvas
                id="heatmapChart"
                ref={heatmapCanvasRef}
                width={layout.width}
                height={layout.heatmap.height}
                style={{ ...canvasStyle, backgroundColor: "red", marginTop: 16 }}
            >Your browser does not support &lt;canvas&gt; tag element!</canvas>
        </div>
        <div style={scaleContainerStyle}>
            <span style={{ paddingRight: "0.5em" }}>{minYScaleValue}</span>
            <canvas
                id="scaleChart"
                ref={scaleCanvasRef}
                width={layout.scale.width}
                height={layout.scale.height}
                style={{ ...canvasStyle }}
            ></canvas>
            <span style={{ paddingLeft: "0.5em" }}>{maxYScaleValue}</span>
        </div>
        <p>{renderRef.current}</p>
        </div>
    );
};

export default Spectrogram;