/**
*
* Copyright 2017 Google Inc. All rights reserved.
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
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host{
      display: block;
      background-color: red;
      position: relative;
      background-size: 100% 100%;
      /* image-rendering: pixelated; */
    }
    img {
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      animation-name: fade-in;
      animation-duration: 5s;

    }
    @keyframes fade-in {
      from {opacity: 0}
    }
  </style>
`;

const io = new IntersectionObserver(entries => {
  for(const entry of entries) {
    if(entry.isIntersecting) {
      entry.target.setAttribute('full', '');
    }
  }
});

class SCImg extends HTMLElement {
  static get observedAttributes() {
    return ['full'];
  }

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    io.observe(this);
  }

  disconnectedCallback() {
    io.unobserve(this);
  }

  get full() {
    return this.hasAttribute('full');
  }

  get src() {
    return this.getAttribute('src');
  }

  attributeChangedCallback() {
    if(this.loaded)
      return;
    const img = document.createElement('img');
    img.src = this.src;
    img.onload = _ => {
      this.loaded = true;
      this.shadowRoot.appendChild(img);
    };
  }
}

customElements.define('sc-img', SCImg);
