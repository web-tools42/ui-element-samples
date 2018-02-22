/**
 *
 * Copyright 2018 Google Inc. All rights reserved.
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
import { SCElement } from './sc-element.js';

const html = String.raw;

export class CommentForm extends SCElement {
  static template() {
    return html`
      <textarea></textarea>
      <button id="btnSend" class="sc-btn">Send</button>
    `;
  }
  static component() {
    return html`
    <sc-comment-form>
      ${this.template()}
    </sc-comment-form>
    `;
  }
  connectedCallback() {
    this.btnSend = this.querySelector('#btnSend');
    this.textarea = this.querySelector('textarea');
    this.btnSend.addEventListener('click', e => {
      const text = this.textarea.value;
      const detail = { text };
      const event = new CustomEvent('comment-sent', { detail });
      this.dispatchEvent(event);
      this.textarea.value = '';
    });
  }
}