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
const functions = require('firebase-functions');
const express = require('express');
const firebase = require('firebase/app');
const fs = require('fs');
require('firebase/firestore');

const router = express.Router();
const indexHtml = fs.readFileSync(`${__dirname}/index.html`, 'utf8');
const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyAs7CmNcvBSO-h14AgE8O_Ii9durQHvx0c",
  authDomain: "supercharged-comments.firebaseapp.com",
  databaseURL: "https://supercharged-comments.firebaseio.com",
  projectId: "supercharged-comments",
  storageBucket: "supercharged-comments.appspot.com",
  messagingSenderId: "116806762306"
});

const { CommentForm } = require('./components/sc-comment-form');
const { CommentList } = require('./components/sc-comment-list');
const { Comment } = require('./components/sc-comment');

function pageBuilder(page) {
  return {
    page,
    replace(holder, replacement) {
      this.page = this.page.replace(holder, replacement);
    },
    addCommentForm() {
      this.replace('<!-- ::COMMENT_FORM:: -->', CommentForm.component());
      return this;
    },
    addCommentList(state) {
      const comments = state.map(c => Comment.component(c, c.id)).join('');
      this.replace('<!-- ::COMMENT_LIST:: -->', CommentList.component(comments));
      return this;
    },
    build() {
      return this.page;
    }
  }
}

router.get('/', (req, res) => {
  const commentsRef = firebase.firestore().collection('comments');
  commentsRef.orderBy('timestamp').get().then(snap => {
    const state = snap.docs.map(d => Object.assign(d.data(), { id: d.id }));
    const page = pageBuilder(indexHtml)
      .addCommentForm()
      .addCommentList(state)
      .build();
    res.send(page);
  });
});

exports.supercharged = functions.https.onRequest(router);
