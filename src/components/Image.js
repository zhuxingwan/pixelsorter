import React, {Component} from "react";
import PropTypes from "prop-types";
import paper from "paper";
import {prop} from "ramda";
import download from "downloadjs";
import * as record from "utils/record";
import * as compare from "../compare";
import PixelSorter from "../PixelSorter";
import * as exchange from "sort/exchange";
import {
    BOGO, SELECTION, INSERTION, BUBBLE, COCKTAIL, SHELL, HEAP, MERGE, QUICK,
    RUNNING, PAUSED, NOT_RUNNING,
    HORIZONTAL, VERTICAL, LEFT_TO_RIGHT, RIGHT_TO_LEFT, TOP_TO_BOTTOM, BOTTOM_TO_TOP
} from "root/constants";

window.download = download;
// Unfortunately symbols can't be passed as value to <select>.
const algorithms = {
    bogo: BOGO,
    selection: SELECTION,
    insertion: INSERTION,
    bubble: BUBBLE,
    cocktail: COCKTAIL,
    shell: SHELL,
    heap: HEAP,
    merge: MERGE,
    quick: QUICK
};

class Image extends Component {

    constructor (props) {
        super(props);
        this.state = {
            sortState: NOT_RUNNING,
            sortDirection: LEFT_TO_RIGHT,
            sortAlgorithm: "shell"
        };
    }

    pixel: null

    getSortButtonText () {
        if (this.state.sortState === PAUSED || this.state.sortState === NOT_RUNNING) {
            return 'Sort';
        } else {
            return 'Pause';
        }
    }

    render () {
        return (
            <div className="w-100 mt3 avenir dark-gray">
                <button
                    className="input-reset ba b--black-20 black-70 pa1 bg-transparent mh3 hover-bg-black hover--white hover f6"
                    onClick={() => {
                        this.setState(({sortState}) => {
                            if (sortState === RUNNING) {
                                this.pixel.pause();
                                return {sortState: PAUSED};
                            } else if (sortState === NOT_RUNNING) {
                                this.pixel.run(
                                    (a, b) => compare.number(a.red, b.red),
                                    this.raster,
                                    {
                                        algorithm: algorithms[this.state.sortAlgorithm],
                                        direction: this.state.sortDirection
                                    }
                                );
                                paper.view.update();
                                return {sortState: RUNNING};
                            } else if (sortState === PAUSED) {
                                this.pixel.continue();
                                return {sortState: RUNNING};
                            }
                        });
                    }}>{this.getSortButtonText()}</button>
                <button
                    className="input-reset ba b--black-20 black-70 pa1 bg-transparent mh3 hover-bg-black hover--white hover f6"
                    onClick={() => {
                        this.pixel.stop();
                        this.setState({sortState: NOT_RUNNING});
                    }}>Stop</button>
                <button
                    className="input-reset ba b--black-20 black-70 pa1 bg-transparent mh3 hover-bg-black hover--white hover f6"
                    onClick={() => {
                        this.setState({sortState: NOT_RUNNING}, () => {
                            this.pixel.stop();
                            this.raster.remove();
                            this.raster = new paper.Raster(this.props.image);
                            this.raster.onLoad = () => {
                                this.raster.size = this.raster.size.multiply(this.props.scale);
                                this.raster.translate((this.raster.width / 2) + 20, (this.raster.height / 2) + 20);
                                paper.view.update();
                            }
                        });
                    }}>Reset</button>
                <label>
                    Algorithm
                    <select
                        className="input-reset ba b--black-20 black-70 pa1 bg-transparent mh3 hover-bg-black hover--white hover f6"
                        value={this.state.sortAlgorithm}
                        onChange={(e) => {
                            this.setState({sortAlgorithm: e.target.value});
                        }}
                    >
                        <option value="bogo">Bogo Sort</option>
                        <option value="bubble">Bubble Sort</option>
                        <option value="cocktail">Cocktail Sort</option>
                        <option value="selection">Selection Sort</option>
                        <option value="insertion">Insertion Sort</option>
                        <option value="shell">Shell Sort</option>
                        <option value="heap">Heap Sort</option>
                        <option value="merge">Merge Sort</option>
                        <option value="quick">Quick Sort</option>
                    </select>
                </label>
                <label>
                    Direction
                    <select
                        className="input-reset ba b--black-20 black-70 pa1 bg-transparent mh3 hover-bg-black hover--white hover f6"
                        value={this.state.sortDirection}
                        onChange={(e) => {
                            this.setState({sortDirection: e.target.value});
                        }}
                    >
                        <option value={LEFT_TO_RIGHT}>Left to Right</option>
                        <option value={RIGHT_TO_LEFT}>Right to Left</option>
                        <option value={TOP_TO_BOTTOM}>Top to Bottom</option>
                        <option value={BOTTOM_TO_TOP}>Bottom to Top</option>
                    </select>
                </label>
                <button
                    className="input-reset ba b--black-20 black-70 pa1 bg-transparent mh3 hover-bg-black hover--white hover f6"
                    onClick={(e) => {
                        download(raster.toDataURL());
                    }}>
                    Download
                </button>
                <canvas ref="canvas" className="w-100"></canvas>
            </div>
        );
    }

    raster: null



    componentDidUpdate (prevProps) {
        if (prevProps.image !== this.props.image) {
            this.raster.remove();
            this.displayImage();
        }
    }

    componentDidMount () {
        paper.setup(this.refs.canvas);
        this.displayImage();
    }

    displayImage () {
        this.raster = new paper.Raster(this.props.image);
        window.raster = this.raster;
        this.raster.onLoad = () => {
            this.pixel = new PixelSorter(this.raster);
            this.raster.size = this.raster.size.multiply(this.props.scale);
            this.raster.translate((this.raster.width / 2) + 20, (this.raster.height / 2) + 20);
            paper.view.update();
        }
    }
}

Image.propTypes = {
    src: PropTypes.string,
    scale: PropTypes.number
};

Image.defaultProps = {
    scale: 1
};

export default Image;
