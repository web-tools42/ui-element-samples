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

class SCPane extends HTMLElement {

  get header () {
    if (!this._header) {
      this._header = this.querySelector('button[role="tab"]');
    }

    return this._header;
  }

  get content () {
    if (!this._content) {
      this._content = this.querySelector('.content');
    }

    return this._content;
  }

  attachedCallback () {
    this.header.addEventListener('click', _ => {
      const customEvent = new CustomEvent('panel-change', {
        bubbles: true
      });

      this.dispatchEvent(customEvent);
    });
  }
}

document.registerElement('sc-pane', SCPane);
