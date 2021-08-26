# react-spectrogram
React component that visualizes the spectrum of frequencies of a signal that varies with time - Spectrogram.

**This package is not ready to be used. Please, be patient.**

Component is based on &lt;canvas&gt; tag. The shift operation was carefully chosen to maximize performance. It is implemented by .drawImage() method, that means the canvas is drawn onto itself with an offset. This effectively deletes anything that is shifted beyond canvas in a single operation. Experimental evaluation revealed this method to be much faster than using putImageData method [\[1\]](https://cse512-19s.github.io/FP-Signal-Viz/whitmire_paper.pdf). After that the new data are drawn as a row.

Feel free to share love at github by giving this project a star or creating a new issue if you have any problem or suggestion. Any feedback is valued.

## Example
For now, none. Be patient.

## Props
[Spectrogram is written in Typescript](./src/Spectrogram.types.ts)

## Features
* It is fairly fast
* Can handle quite a lot of data points

## Limitations
* Properties *layout* and *options* must be constant. Otherwise it could lead to some unwanted results. The only property that should change is *data* property.
* Width property should be integer multiple of the length of the passed data, specifically the length of y.
* No interactions and animations

## License
This project is made available under the MIT License.