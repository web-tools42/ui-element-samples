/**
 *
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/* global customElements */
/* eslint-env es6 */

customElements.define('flip-switch', class extends HTMLElement {
  static get observedAttributes () {
    return ['color'];
  }

  constructor () {
    super();
    const doc = document.currentScript.ownerDocument;
    const tmpl = doc.querySelector('#fs-tmpl');
    this._root = this.attachShadow({mode: 'open'});
    this._root.appendChild(tmpl.content.cloneNode(true));
    this._elementProxy = document.createElement('div');
  }

  set color (_color) {
    if (!_color) {
      return;
    }

    // Reset the styles of the element proxy.
    this._elementProxy.style.color = '';

    // Now attempt to set it to the passed value.
    this._elementProxy.style.color = _color;

    // If it doesn't hold then the value passed is invalid.
    if (this._elementProxy.style.color === '') {
      console.warn(`${_color} is not a real color... WELL DONE.`);
      return;
    }

    this._color = _color;
    this.style.setProperty('--color', _color);
  }

  get color () {
    return this._color;
  }

  set value (_value) {
    this._value = _value;
    this._front.querySelector('button').textContent = _value;
  }

  get value () {
    return this._value;
  }

  connectedCallback () {
    this._container = this._root.querySelector('.container');
    this._front = this._root.querySelector('.front');
    this._back = this._root.querySelector('.back');
    this._ripple = this._root.querySelector('.ripple');
    this._shadow2px = this._root.querySelector('.shadow2px');
    this._shadow12px = this._root.querySelector('.shadow12px');

    this.flip = this.flip.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onBackButtonClick = this._onBackButtonClick.bind(this);
    this._onTransitionEnd = this._onTransitionEnd.bind(this);
    this._onKeyPress = this._onKeyPress.bind(this);

    if (!this.value) {
      this.value = 1;
    }
    this.color = this.getAttribute('color');

    this._addEventListeners();
    this._front.inert = false;
    this._back.inert = true;

    requestAnimationFrame(_ => {
      this._onResize();
    });
  }

  disconnectedCallback () {
    this._removeEventListeners();
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (name !== 'color') {
      return;
    }

    this.color = newValue;
  }

  flip () {
    this._container.classList.toggle('flipped');
    this._ripple.classList.toggle('expanded');
    this._shadow2px.classList.toggle('flipped');
    this._shadow12px.classList.toggle('flipped');
    this.classList.add('modal');
  }

  _addEventListeners () {
    this._ripple.addEventListener('click', this.flip);
    this._front.addEventListener('click', this.flip);
    this._back.addEventListener('click', this._onBackButtonClick);
    this._container.addEventListener('transitionend', this._onTransitionEnd);
    this.addEventListener('keydown', this._onKeyPress);
    window.addEventListener('resize', this._onResize);
  }

  _removeEventListeners () {
    this._ripple.removeEventListener('click', this.flip);
    this._front.removeEventListener('click', this.flip);
    this._back.removeEventListener('click', this._onBackButtonClick);
    this._container.removeEventListener('transitionend', this._onTransitionEnd);
    this.removeEventListener('keydown', this._onKeyPress);
    window.removeEventListener('resize', this._onResize);
  }

  _onTransitionEnd () {
    if (this._container.classList.contains('flipped')) {
      this._front.inert = true;
      this._back.inert = false;
      this._back.querySelector(`button:nth-of-type(${this.value})`).focus();
      return;
    }

    this._front.inert = false;
    this._back.inert = true;
    this._front.querySelector('button').focus();
    this.classList.remove('modal');
  }

  _onBackButtonClick (evt) {
    // if this is the back, BAIL.
    if (evt.target === evt.currentTarget) {
      return;
    }

    this.value = evt.target.textContent;
    this.flip();
  }

  _onResize () {
    const position = this.getBoundingClientRect();
    const midX = position.left + position.width * 0.5;
    const midY = position.top + position.height * 0.5;

    const rX = Math.max(midX, window.innerWidth - midX);
    const rY = Math.max(midY, window.innerHeight - midY);

    const radius = Math.sqrt(rX * rX + rY * rY);
    this._ripple.style.width = `${radius * 2}px`;
    this._ripple.style.height = `${radius * 2}px`;
  }

  _onKeyPress (evt) {
    if (this._back.hasAttribute('inert')) {
      return;
    }

    if (document.activeElement !== this) {
      return;
    }

    const firstTabStop = this._back.querySelector('button');
    const lastTabStop = this._back.querySelector('button:last-of-type');
    const deepActive = this._root.activeElement;

    // Check for TAB key press
    if (evt.keyCode === 9) {
      // SHIFT + TAB
      if (evt.shiftKey) {
        if (deepActive === firstTabStop) {
          evt.preventDefault();
          lastTabStop.focus();
        }
      // TAB
      } else if (deepActive === lastTabStop) {
        evt.preventDefault();
        firstTabStop.focus();
      }
    }

    // ESCAPE
    if (evt.keyCode === 27) {
      this.flip();
      firstTabStop.focus();
    }
  }
});
