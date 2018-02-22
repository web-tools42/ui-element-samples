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

export class Comment extends SCElement {
  static template(state) {
    return html`
    <div class="sc-author">
      <img class="sc-circle-avatar" src="${state.photoUrl}" alt="Profile Photo">
      <div class="sc-author-name">${state.authorName}</div>
    </div>
    <div class="sc-comment-text">${state.text}</div>
    `;
  }
  static component(state, id) {
    return html`
    <sc-comment id="_${id}">
      ${this.template(state)}
    </sc-comment>
    `;
  }
}
