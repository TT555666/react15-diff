 import $ from 'jquery'
import {createUnit} from './unit'
import {createElement} from './element'
import {Component} from './component';

let React = {
    render,
    createElement,
    Component

}

function render(element,container){
     let unit = createUnit(element)
     let markUp = unit.getMarkUp('0')
     console.log('mark',markUp)
     $(container).html(markUp)
     
}

export default React