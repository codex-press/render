

const factory = (superClass = function() {}) => class EventEmitter extends superClass {

  constructor(...args) {
    super(...args);

    // list of events that this object is listening to.  it's a Map that has
    // the target as the key and a list of events as the value. That list of
    // events is itself a Map that has a key of the event name and a value
    // with an array of callbacks.
    this._events = new Map();

    // these are objects that are listening to events emitted from here. it's
    // a Map of event names with a second level of set
    this._listeners = new Map();
  }


  remove() {
    this._events.forEach((eventList, target) => {
      if (this !== target) {
        eventList.forEach(handler => target.off(handler));
      }
    });
  }


  // usage:
  //   this.bind({visible: 'autoPlay'});
  //   this.bind({'click .button': 'expand'}, this.el);
  // This is equivalent to Backbone listenTo, except works for DOM elements
  // as well. First example is for callbacks on self.
  //
  // Options is same as for DOM Element: useCapture and passive
  bind(eventList, target = this, options) {

    Object.keys(eventList).map(label => {

      var handler = eventList[label];

      var callback = typeof handler === 'function' ? handler : this[handler];

      if (!callback) {
        log.warn('Can\'t bind ' + handler + ' because it don\'t exist');
        return;
      }

      if (target)
        this.bindToObject(target, label, callback);

    });

    return this;
  }


  // arg is event name or function (tho function part not implemented)
  // XXX n.b. this currently doesn't work for delegated events and removes
  // all listeners for given event name
  unbind(arg, target = this) {

    if (arg instanceof Array)
      arg.forEach(n => this.unbind(n, target));

    else if (arg instanceof Function)
      throw 'ooops not implemented';

    // normal object (another EventEmitter)
    else {
      this._events(target).forEach((handler, label) => {
        target.off(label.toLowerCase(), handler)
      });
      this._events.delete(target)
    }

    return this;
  }



  bindToObject(obj, label, callback) {
    if (!this._events.has(obj))
      this._events.set(obj, []);
    this._events.get(obj).push(callback);
    obj.on(label.toLowerCase(), callback, this);
    return this;
  }


  on(label, callback, context) {
    label = label.toLowerCase();
    if (!this._listeners.has(label))
      this._listeners.set(label, []);
    this._listeners.get(label).push([callback, context]);
    return this;
  }


  // CONFUSING first arg optional
  off(label, callback) {
    label = label.toLowerCase();
    if (!callback) {
      callback = label;
      this._listeners.forEach((callbacks, label) => {
        callbacks = callbacks.filter(c => c != callback);
        if (callbacks.length)
          this._listeners.set(label, callbacks);
        else
          this._listeners.delete(label);
      });
    }
    else {
      let callbacks = this._listeners.get(label);

      if (callbacks && callbacks.length) {
        let new_list = callbacks.filter((c) => {
          return c[0] !== callback;
        });
        this._listeners.set(label, new_list);
      }
    }
    return this;
  }


  once(label, callback, context = this) {
    label = label.toLowerCase();
    let fire = (...args) => {
      this.off(label, fire);
      callback.apply(context, args);
    };
    this.on(label, fire);
  }


  trigger(label, ...args) {
    let callbacks = this._listeners.get(label.toLowerCase());
    if (callbacks) {
      callbacks.map(([fn, context]) => {
        try {
          fn.apply(context, args);
        }
        catch (e) {
          console.error(e);
        }
      });
    }
    return this;
  }

}

export {factory as default}


