import React from "react";

import YAxis from "./YAxis";
import ZAxis from "./ZAxis";

import { ISpectrogramProps } from "../index";

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

    // for debugging
    const spectrogramRef = React.useRef<number>(0);
    const zAxisRef = React.useRef<number>(0);

    React.useEffect(() => {
        spectrogramRef.current++;
    });

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
            <ZAxis zAxisRef={zAxisRef} {...options.zAxis} z={data.z} width={layout.width} height={layout.heatmap.height} />
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
        <p>{spectrogramRef.current} | {zAxisRef.current}</p>
        </div>
    );
};

export default Spectrogram;