import React, { Component } from 'react';
import PropTypes from 'prop-types';
import paper from 'paper';
import { prop } from 'ramda';
import download from 'downloadjs';
import * as record from 'utils/record';
import * as compare from '../compare';
import PixelSorter from '../PixelSorter';
import * as exchange from 'sort/exchange';
import ControlPanel from './ControlPanel';
import {
  BOGO,
  SELECTION,
  CYCLE,
  INSERTION,
  BUBBLE,
  COCKTAIL,
  COMB,
  SHELL,
  HEAP,
  MERGE,
  QUICK,
  RADIX,
  RUNNING,
  PAUSED,
  NOT_RUNNING,
  HORIZONTAL,
  VERTICAL,
  LEFT_TO_RIGHT,
  RIGHT_TO_LEFT,
  TOP_TO_BOTTOM,
  BOTTOM_TO_TOP,
  RED,
  GREEN,
  BLUE,
  GRAY,
  HUE,
  SATURATION,
  BRIGHTNESS
} from 'root/constants';

class Image extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortState: NOT_RUNNING,
      sortDirection: LEFT_TO_RIGHT,
      sortAlgorithm: SHELL,
      scale: 1,
      color: RED,
      recording: false
    };
    this.capturer = new CCapture({
      format: 'gif',
      workersPath: 'node_modules/ccapture.js/src/',
      framerate: 60
    });
  }

  pixel = null;
  capturer = null;
  raster = null;
  defaultImageSize = null;

  getSortButtonText() {
    if (
      this.state.sortState === PAUSED ||
      this.state.sortState === NOT_RUNNING
    ) {
      return 'Sort';
    } else {
      return 'Pause';
    }
  }

  onRunPauseButtonClick() {
    this.setState(({ sortState }) => {
      if (sortState === RUNNING) {
        paper.view.autoUpdate = false;
        this.pixel.pause();
        return { sortState: PAUSED };
      } else if (sortState === NOT_RUNNING) {
        paper.view.autoUpdate = true;
        this.pixel
          .run(
            createComparator(this.state.color, this.state.sortAlgorithm),
            this.raster,
            {
              algorithm: this.state.sortAlgorithm,
              direction: this.state.sortDirection
            }
          )
          .then(promises => {
            Promise.all(promises).then(() => {
              paper.view.autoUpdate = false;
              this.setState({ sortState: NOT_RUNNING });
            });
          });
        return { sortState: RUNNING };
      } else if (sortState === PAUSED) {
        paper.view.autoUpdate = true;
        this.pixel.continue().then(promises => {
          Promise.all(promises).then(() => {
            paper.view.autoUpdate = false;
            this.setState({ sortState: NOT_RUNNING });
          });
        });
        return { sortState: RUNNING };
      }
    });
  }

  onStopButtonClick() {
    this.pixel.stop();
    paper.view.autoUpdate = false;
    this.setState({ sortState: NOT_RUNNING });
  }

  onResetButtonClick() {
    this.setState({ sortState: NOT_RUNNING }, () => {
      this.pixel.stop();
      paper.view.autoUpdate = false;
      this.raster.remove();
      this.raster = new paper.Raster(this.props.image);
      this.raster.onLoad = () => {
        this.raster.size = this.raster.size.multiply(this.state.scale);
        this.raster.bounds.topLeft = [0, 0];
        paper.view.update();
      };
    });
  }

  onRecordClick() {
    if (!this.state.recording) {
      paper.view.onFrame = event => {
        this.capturer.capture(this.refs.canvas);
      };
      this.capturer.start();
    } else {
      paper.view.onFrame = null;
      this.capturer.stop();
      this.capturer.save();
    }
    this.setState(({ recording }) => {
      return { recording: !recording };
    });
  }

  render() {
    return (
      <div className="w-100 mt3 avenir dark-gray">
        <ControlPanel
          {...this.state}
          onPropChange={prop => {
            this.setState(prop);
          }}
          onRunPauseButtonClick={this.onRunPauseButtonClick.bind(this)}
          onResetButtonClick={this.onResetButtonClick.bind(this)}
          onStopButtonClick={this.onStopButtonClick.bind(this)}
        />
        <canvas ref="canvas" className="ma2 w-100 h-100"></canvas>
      </div>
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.image !== this.props.image) {
      this.raster.remove();
      this.displayImage();
    } else if (prevState.scale !== this.state.scale) {
      this.raster.remove();
      this.displayImage();
    }
  }

  componentDidMount() {
    paper.setup(this.refs.canvas);
    paper.view.autoUpdate = false;
    this.displayImage();
  }

  displayImage() {
    this.raster = new paper.Raster(this.props.image);
    window.raster = this.raster;
    this.raster.onLoad = () => {
      this.defaultImageSize = this.raster.size;
      this.pixel = new PixelSorter(this.raster);
      this.raster.size = this.defaultImageSize.multiply(this.state.scale);
      this.raster.bounds.topLeft = [0, 0];
      paper.view.update();
    };
  }
}

function createComparator(color, algorithm) {
  if (algorithm === RADIX) {
    return a => a[color];
  } else {
    return (a, b) => compare.number(a[color], b[color]);
  }
}

Image.propTypes = {
  src: PropTypes.string
};

export default Image;
