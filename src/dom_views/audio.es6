import dom       from 'dom';
import * as log  from 'log';

import app       from '../app';

import AudioView from '../views/audio';
import DomView   from './base';

var events = {
  scroll       : 'scroll',
  offscreen    : 'pause',
  close        : 'load',
};

var appEvents = {
  'state:mute' : 'mute',
  hidden       : 'pause',
};

var audioEvents =  {
  timeupdate   : 'timeUpdate',
  progress     : 'loadingProgress',
  ended        : 'ended',
};

var domEvents = {
  click        : 'toggleMute',
};


export default class Audio extends DomView(AudioView) {

  constructor(attrs) {
    super(attrs);
    // this.bind(events);
    // this.bind(appEvents, app);
  }

  // these called by Figure
  position() { }
  reset() { }

  attach() {
    super.attach();

    this.domPlayer = this.find('audio');

    // this.bind(domEvents, this.el);
    // this.bind(audioEvents, this.domPlayer);

    if (app.hasState('mute'))
      this.mute();

    // allAudioEvents.map(n => 
    //   this.domPlayer.addEventListener(n, e => log(e))
    // );
  }


  toggleMute() {
    log.info('toggleMute');
    app.toggleState('mute')
  }


  togglePlay(e) {
    this.paused_with_button = this.is('.playing');
    if (this.is('.playing'))
      this.pause();
    else
      this.play();
  }


  load() {
    if (this.loaded)
      return;

    this.loaded = true;

    this.domPlayer.load();
  }


  play() {
    console.trace('audio Play');

    // already playing
    if (this.is('.playing'))
      return this;

    if (!this.domPlayer)
      return this;

    this.domPlayer.play();

    // make sure that actually worked
    if (!this.domPlayer.paused) {
      this.addClass('playing');
      //topPlayer.trigger('audio:play', this);
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

    //topPlayer.trigger('video:pause', this);
    this.removeClass('playing');

    return this;
  }


  mute() {
    this.domPlayer.volume = 0;
    // animate(0, 800);
  }


  unmute() {
    this.domPlayer.volume = 1;
    // animate(1, 800);
  }


  timeUpdate() {

    if (!this.attrs.controls)
      return;

    // looks like: 1:04
    var pretty = u.printTime(this.domPlayer.currentTime);
    this.find('.current-time').textContent = pretty;

    //this.setTimeBar(this.domPlayer.currentTime);
  }

  loadingProgress() {

  }
  
  ended() {

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

}

dom.mixin(Audio.prototype);
