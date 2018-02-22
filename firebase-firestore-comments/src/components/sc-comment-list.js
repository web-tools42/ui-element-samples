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
import { Comment } from './sc-comment.js';

const html = String.raw;

export class CommentList extends SCElement {
  static component(state) {
    return html`
      <sc-comment-list>
        ${state}
      </sc-comment-list>
    `;
  }

  connectedCallback() {
    this.commentsRef = firebase.firestore().collection('comments');
    this.commentsRef.orderBy('timestamp').onSnapshot(snap => {
      snap.docChanges.forEach(change => {
        const elInDOM = this.querySelector(`#_${change.doc.id}`);
        switch(change.type) {
          case 'added':
            if(elInDOM) { return; }
            this.addComment(change.doc);
            break;
          case 'removed':
            elInDOM.remove();
            break;
        }
      });      
    });
  }

  addComment(doc) {
    const element = document.createElement('sc-comment');
    element.id = `_${doc.id}`;
    element.innerHTML = Comment.template(doc.data());
    this.appendChild(element);
  }
}