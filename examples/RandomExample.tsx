import React from "react";
import { Spectrogram } from "react-spectrogram";
import { SpectrogramData } from "react-spectrogram";

const N = 20;
const X = [
    "a", "b", "c", "d", "e",
    "f", "g", "h", "i", "j",
    "k", "l", "m", "n", "o",
    "p", "q", "r", "s", "t"
];

const RandomExample: React.FC = () => {
    const [data, setData] = React.useState<SpectrogramData>({
        x: [],
        y: [],
        z: ""
    });
    // In real application you would want to execute fetch request
    const updateData = () => {
        let D = Array<number>(N);
        for (let i = 0; i < N; i++) {
            D[i] = Math.floor(Math.random() * 100);
        }
        setData({
            x: X,
            y: D,
            z: new Date()
        });
    };

    // Uncomment useEffect to update data automatically
    /*
    React.useEffect(() => {
        const interval = setInterval(updateData, 1000);
        return () => clearInterval(interval);
    }, []);
    */

    return (
        <div className="App">
            <Spectrogram
                data={data}
                layout={{
                    width: 1000,
                    paddingTop: 40,
                    paddingRight: 80,
                    paddingBottom: 40,
                    paddingLeft: 80,
                    line: {
                        height: 150
                    },
                    heatmap: {
                        height: 300,
                        marginTop: 32
                    },
                    scale: {
                        height: 24,
                        marginTop: 32
                    }
                }}
                options={{
                    xAxis: {
                        displayAxis: true,
                        displayGrid: true,
                        values: ["a", "b", "e", "f", "j", "s", "t"],
                        color: "black"
                    },
                    yAxis: {
                        displayAxis: true,
                        displayGrid: true,
                        values: [0, 20, 40, 60, 80, 100],
                        color: "black"
                    },
                    zAxis: {
                        displayAxis: true,
                        displayBins: 10,
                        color: "black"
                    },
                    theme: "white-blue"
                }}
            />
            <button onClick={updateData}>Add Random Data</button>
        </div>
    );
};

export default RandomExample;
