import dom       from 'dom';
import BlockView from '../views/block';
import DomView   from './base';
import Overlay   from './overlay';

export default class Block extends Overlay(DomView(BlockView)) {

}

dom.mixin(Block.prototype);

