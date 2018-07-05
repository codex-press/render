import View from './view.js';

export default class Block extends View {

  defaultTagName() {
    switch(this.parent.tagName()) {
      case 'table' : return 'tr';
      case 'thead' : return 'tr';
      case 'tbody' : return 'tr';
      case 'tr'    : return 'td';
      case 'ul'    : return 'li';
      case 'ol'    : return 'li';
      default      : return 'div';
    }
  }

}

