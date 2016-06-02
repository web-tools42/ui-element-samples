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

class SCRouter extends HTMLElement {

  _onChanged () {
    const path = window.location.pathname;
    const routes = Array.from(this._routes.keys());
    const route = routes.find(r => r.test(path));
    const data = route.exec(path);

    if (!route) {
      return;
    }

    // Figure out the new view.
    this._newView = this._routes.get(route);

    // We don't want to create more promises here.
    if (this._isTransitioningBetweenViews) {
      return Promise.resolve();
    }

    this._isTransitioningBetweenViews = true;

    let outViewPromise = Promise.resolve();

    // If there is a current view...
    if (this._currentView) {
      // If it's the one we already have, just update it.
      if (this._currentView === this._newView) {
        return this._currentView.update(data);
      }

      // Otherwise we animate it out.
      outViewPromise = this._currentView.out(data);
    }

    return outViewPromise
      .then(_ => {
        this._currentView = this._newView;
        this._isTransitioningBetweenViews = false;
        return this._newView.in(data)
      });
  }

  go (url) {
    window.history.pushState(null, null, url);
    return this._onChanged();
  }

  _clearRoutes () {
    this._routes.clear();
  }

  _createRoute (route, view) {
    if (this._routes.has(route))
      return console.warn(`Route already exists: ${route}`);

    this._routes.set(route, view);
  }

  _createRoutes () {
    for (let view of document.querySelectorAll('sc-view')) {
      if (!view.route)
        continue;

      this._createRoute(new RegExp(view.route, 'i'), view);
    }
  }

  createdCallback () {
    this._onChanged = this._onChanged.bind(this);
    this._routes = new Map();
  }

  attachedCallback () {
    window.addEventListener('popstate', this._onChanged);
    this._clearRoutes();
    this._createRoutes();
    this._onChanged();
  }

  detachedCallback () {
    window.removeEventListener('popstate', this._onChanged);
  }
}

document.registerElement('sc-router', SCRouter);
