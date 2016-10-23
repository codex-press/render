import View from './view';

export default class Block extends View {

  defaultTagName() {
    switch(this.parent.tagName()) {
      case 'table' : return 'tr';
      case 'tr'    : return 'td';
      case 'ul'    : return 'li';
      case 'ol'    : return 'li';
      default      : return 'div';
    }
  }

}

