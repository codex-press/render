import dom      from 'dom';
import log      from 'log';
import * as u   from 'utility';

import app      from '../app';
import * as env from '../env';
import Figure   from './figure';

// can have any of the classes depending on its state:
//   playing
//   controls
//   buffering

let controlsHTML = `
  <div class=controls>
    <div class="audio-button"><span class=icon-audio></span></div>
    <div class="play-button icon-play"></div>
    <div class=toolbar>
      <div class=current-time>0:00</div>
      <div class=bar>
        <div class=time></div>
        <div class=loaded></div>
      </div>
      <div class=duration></div>
    </div>
  </div>
`;

var events = {
  scroll    : 'scroll',
  offscreen : 'pause',
};

var appEvents = {
  blur   : 'pause',
  mute   : 'mute',
  unmute : 'unmute',
};

// these used for debugging
var allVideoEvents = 'loadstart progress suspend abort error emptied stalled loadedmetadata loadeddata canplay canplaythrough playing waiting seeking seeked ended durationchange timeupdate play pause ratechange resize volumechange'.split(' ');
 
// <video> events don't bubble
var videoEvents =  {
  timeupdate   : 'timeUpdate',
  progress     : 'loadingProgress',
  ended        : 'ended',
  pause        : 'pause',
};

// mouseleave doesn't bubble
var frameEvents = {
  mousemove   : 'showControls',
  mouseleave  : 'hideControls',
};

var domEvents = {
  'click'                             : 'togglePlay',
  'click .audio-button'               : 'toggleMute',
  'mousedown .frame > .controls .bar' : 'barMouseDown',
};


let controlsTimeout;

export default class Video extends Figure {

  constructor(attrs) {
    super(attrs);
    this.barMove = this.barMove.bind(this);
    this.barUp = this.barUp.bind(this);
    this.bind(events);
    this.bind(appEvents, app);
  }


  attach() {

    super.attach();

    this.domPlayer = this.find('video');

    if (this.attrs.controls) {
      this.addClass('controls');
      this.select('.frame').append(controlsHTML);
      let duration = u.printTime(this.attrs.media.duration);
      this.find('.duration').textContent = duration;
    }

    this.bind(domEvents, this.el);
    this.bind(videoEvents, this.domPlayer);
    this.bind(frameEvents, this.find('.frame'));

    if (app.hasState('mute'))
      this.mute();

    var bar = this.find('.bar .time');
    this.setTimeBar = t => {
      dom.setCSS(bar, 'width', (t / this.attrs.media.duration * 100) + '%');
    };

    // allVideoEvents.map(n => 
    //   this.domPlayer.addEventListener(n, e => log(e))
    // );
  }


  muteChange(value) {
    console.log('muteChange', value);
    if (value)
      this.mute()
    else
      this.unmute();
  }


  mute() {
    this.domPlayer.volume = 0;
    // animate(0, 800);
  }


  unmute() {
    this.domPlayer.volume = 1;
    // animate(1, 800);
  }


  loadingProgress() {

    if (!this.attrs.controls)
      return;

    var ranges = this.domPlayer.buffered;

    if (!ranges.length)
      return;

    var left = ranges.start(0) / this.domPlayer.duration;
    var width = (
      (ranges.end(ranges.length - 1) / this.domPlayer.duration) - left
    );

    this.select('.bar .loaded').css({
      left: (left * 100) + '%',
      width: (width * 100) + '%'
    });

  }


  timeUpdate() {

    //log(this.domPlayer.currentTime); 
    this.hidePoster();

    if (!this.attrs.controls)
      return;

    // looks like: 1:04
    var pretty = u.printTime(this.domPlayer.currentTime);
    this.find('.current-time').textContent = pretty;

    this.setTimeBar(this.domPlayer.currentTime);
  }


  hidePoster() {

    if (this.domPlayer.currentTime < 0.016)
      return;

    if (this.posterHidden)
      return;

    // log('VIDEO -- hide poster -- ');
    this.posterHidden = true;
    this.select('img.poster').css({display: 'none'});
  }


  seek(time) {
    // log('VIDEO seeking ' + time);
    if (this.domPlayer && this.domPlayer.currentTime >= 0) {
      this.domPlayer.currentTime = time;
      this.setTimeBar(time);
    }
    return this;
  }


  seekPct(pct) {
    this.seek(this.domPlayer.duration * pct);
  }


  load() {
    if (this.loaded)
      return;

    super.load();

    this.domPlayer.load();
  }


  scroll() {

    var middle_onscreen = (
      this.rect().centerY > 0 && this.rect().centerY < window.innerHeight
    );

    var should_autoplay = (
      this.attrs.autoplay && !this.paused_with_button
    );

    if (middle_onscreen && should_autoplay)
      this.play();
    else if (!middle_onscreen) 
      this.pause();

  }


  showControls() {
    this.addClass('controls');
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => this.hideControls(), 2000);
  }


  hideControls() {
    // clearTimeout(controlsTimeout);
    // controlsTimeout = setTimeout(() => this.removeClass('controls'), 500);
    this.removeClass('controls');
  }


  toggleMute(e) {
    app.toggleState('mute');
  }


  togglePlay(e) {

    if (e.defaultPrevented)
      return;

    if (dom.closest(e.target, '.bar, .audio-button'))
      return;

    this.paused_with_button = this.is('.playing');
    if (this.is('.playing'))
      this.pause();
    else
      this.play();

    if (app.hasState('mute'))
      app.removeState('mute');
  }


  barMouseDown(e) {
    //log('barMouseDown');
    e.preventDefault();
    document.addEventListener('mousemove', this.barMove);
    document.addEventListener('mouseup', this.barUp);
    this.barMove(e);
  }


  barMove(e) {
    e.preventDefault();
    let rect = this.select('.bar').rect();
    this.seekPct(Math.min(1, (e.clientX - rect.left) / rect.width));
  }


  barUp(e) {
    this.play();
    e.preventDefault();
    document.removeEventListener('mousemove', this.barMove);
    document.removeEventListener('mouseup', this.barUp);
  }


  play() {

    // already playing
    if (this.is('.playing'))
      return this;

    if (!this.domPlayer)
      return this;

    // log('VIDEO -- video playing  -- ', this.attrs.media.name);
    // log('     -- ready state -- ',this.video_el.readyState);

    // 0 = HAVE_NOTHING      - no information whether or not the audio/video
    //                         is ready
    // 1 = HAVE_METADATA     - metadata for the audio/video is ready
    // 2 = HAVE_CURRENT_DATA - data for the current playback position is
    //                         available, but not enough data to play next
    //                         frame/millisecond
    // 3 = HAVE_FUTURE_DATA  - data for the current and at least the next
    //                         frame is available
    // 4 = HAVE_ENOUGH_DATA  - enough data available to start playing

    // HAVE_NOTHING or HAVE_METADATA, so a frame isn't visible yet presumably
    if (this.domPlayer.readyState < 2)
      this.addClass('buffering');
    else if (this.domPlayer.readyState >= 3)
      this.hidePoster();

    this.domPlayer.play();

    // make sure that acually worked
    if (!this.domPlayer.paused) {
      this.addClass('playing');
      app.trigger('video:play', this);
      this.removeClass('controls')
      //log('play worked');
    }
    else {
      // well that didn't work! it's probably because this is a phone
      //log('play didnt work');
    }

  }


  pause() {
    if (!this.domPlayer)
      return this;

    if (!this.is('.playing'))
      return this;

    //log('VIDEO -- video pausing  -- ', this.attrs.media.name);
    this.domPlayer.pause();

    app.trigger('video:pause', this);
    this.removeClass('playing');

    return this;
  }


  ended() {
    //log('video ended ' + this.attrs.media.name);
    this.removeClass('playing');

    // close iPhone player
    if (env.device.isIPhone)
      this.video_el.webkitExitFullScreen()

  }


  buffering() {
    log('VIDEO -- buffering --');
    this.addClass('buffering');
  }


  notBuffering() {
    log('VIDEO -- not buffering --');
    this.removeClass('buffering');
  }

}

