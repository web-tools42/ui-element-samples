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
// are you node?
// yah
// umm... use this HTMLElement class I made
// okay... sure?

// are you browser?
// yah
// umm... use your HTMLElement class
// okay... I was gonna do that anyways? thx?

let _HTMLElement;
if(typeof process !== 'undefined') {
  _HTMLElement = class HTMLElement { }
} else {
  _HTMLElement = HTMLElement;
}

export class SCElement extends _HTMLElement { }
