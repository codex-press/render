import dom        from 'dom';
import * as log   from 'log';

import GrafView   from '../views/graf';
import DomView    from './base';
import Overlay    from './overlay';

export default class Graf extends Overlay(DomView(GrafView)) {

  constructor(attrs) {
    super(attrs);

    if (attrs.error)
      log.warn(attrs.error);

  }

}

dom.mixin(Graf.prototype);

