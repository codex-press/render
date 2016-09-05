import dom           from 'dom';
import HTMLBlockView from '../views/html_block';
import DomView       from './base';
import Overlay       from './overlay';

export default class HTMLBlock extends Overlay(DomView(HTMLBlockView)) {

}

dom.mixin(HTMLBlock.prototype);

