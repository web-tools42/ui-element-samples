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

class SCAccordion extends HTMLElement {
  static get KEY_UP () {
    return 38;
  }

  static get KEY_LEFT () {
    return 37;
  }

  static get KEY_RIGHT () {
    return 39;
  }

  static get KEY_DOWN () {
    return 40;
  }

  createdCallback () {
    this._panes = null;
  }

  attachedCallback () {
    this._panes = this.querySelectorAll('sc-pane');
    this._calculateGeometries();
    this._movePanels();
    this._addEventListeners();

    requestAnimationFrame(_ => this.setAttribute('active', ''));
  }

  detachedCallback () {
    this._panes = null;
  }

  _addEventListeners () {
    this.addEventListener('panel-change', this._onPanelChange);
    this.addEventListener('keydown', evt => {
      const panesArray = Array.from(this._panes);
      const selectedItem = this.querySelector('sc-pane [role="tab"]:focus');

      let index = panesArray.indexOf(selectedItem.parentNode);

      switch (evt.keyCode) {
        case SCAccordion.KEY_UP:
        case SCAccordion.KEY_LEFT:
          index--;
          break;

        case SCAccordion.KEY_RIGHT:
        case SCAccordion.KEY_DOWN:
          index++;
          break;

        default: break;
      }

      if (index < 0) {
        index = 0;
      } else if (index >= this._panes.length) {
        index = this._panes.length - 1;
      }

      panesArray[index].header.focus();
    });
  }

  _onPanelChange (evt) {
    const target = evt.target;

    this._panes.forEach(pane => {
      pane.removeAttribute('aria-expanded');
      pane.setAttribute('aria-hidden', 'true');
    });

    target.setAttribute('aria-expanded', 'true');
    target.removeAttribute('aria-hidden');

    requestAnimationFrame(_ => this._movePanels());
  }

  _calculateGeometries () {
    if (this._panes.length === 0) {
      return;
    }

    this._headerHeight = this._panes[0].header.offsetHeight;
    this._availableHeight = this.offsetHeight -
        (this._panes.length * this._headerHeight);
  }

  _movePanels () {
    let baseY = 0;
    this._panes.forEach((pane, index) => {
      pane.style.transform = `translateY(${baseY + (this._headerHeight * index)}px)`;
      pane.content.style.height = `${this._availableHeight}px`;

      if (pane.getAttribute('aria-expanded')) {
        baseY = this._availableHeight;
      }
    });
  }
}

document.registerElement('sc-accordion', SCAccordion);
