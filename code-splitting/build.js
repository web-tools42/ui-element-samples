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

const fs = require('fs');
const xml2js = require('xml2js');
const {promisify} = require('util'); // Versprechifizierung
const {URL} = require('url');
const path = require('path');
const babel = require('babel-core');

const parseXML = promisify(xml2js.parseString);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function build() {
  const entryPoints = await extractEntryPoints();
  const sections =
    entryPoints
      .map(entryPoint => path.basename(entryPoint, path.extname(entryPoint)))
      .map(entryPoint => entryPoint === '' ? 'index' : entryPoint);
  const depTrees = await Promise.all(sections.map(section => buildDependencyTree(`./app/static/${section}.js`)));
  const commonDependencies = findCommonDeps(depTrees);
  const sharedJs = await bundle(
    commonDependencies.map(dep => `import '${dep}';`).join('\n')
  );
  await writeFile('./app/static/_shared.js', sharedJs);
  await Promise.all(
    sections
      .map(section => rewrite(section, commonDependencies))
  );
}

async function rewrite(section, commonDependencies) {
  let oldCode = await readFile(`./app/static/${section}.js`);
  oldCode = oldCode.toString('utf-8');
  const plugin = {
    visitor: {
      ImportDeclaration(decl) {
        const importedFile = decl.node.source.value;
        if(commonDependencies.includes(importedFile))
          decl.remove();
      }
    }
  };
  let {code} = babel.transform(oldCode, {plugins: [plugin]});
  code = `import '/static/_shared.js';\n${code}`;
  await writeFile(`./app/static/_${section}.js`, code);
}

async function bundle(oldCode) {
  let newCode = [];
  const plugin = {
    visitor: {
      ImportDeclaration(decl) {
        const importedFile = decl.node.source.value;
        newCode.push((async function() {
          return await bundle(await readFile(`./app/${importedFile}`));
        })());
        decl.remove();
      }
    }
  };
  const {code} = babel.transform(oldCode, {plugins: [plugin]});
  newCode.push(code);
  return flatten(await Promise.all(newCode)).join('\n');
}

function findCommonDeps(depTrees) {
  const depSet = new Set();
  depTrees.forEach(depTree => {
    depTree.forEach(dep => depSet.add(dep));
  });
  return Array.from(depSet)
    .filter(dep => {
      return depTrees.every(depTree => depTree.includes(dep))
    });
}

async function buildDependencyTree(file) {
  let code = await readFile(file);
  code = code.toString('utf-8');

  let dep = [];
  const plugin = {
    visitor: {
      ImportDeclaration(decl) {
        const importedFile = decl.node.source.value;
        dep.push((async function() {
          return await buildDependencyTree(`./app/${importedFile}`);
        })());
        dep.push(importedFile);
      }
    }
  }
  babel.transform(code, {plugins: [plugin]});
  return flatten(await Promise.all(dep));
}

async function extractEntryPoints() {
  let sitemapString = await readFile('./app/sitemap.xml');
  sitemapString = sitemapString.toString('utf-8');
  const sitemap = await parseXML(sitemapString);
  return sitemap.urlset.url
    .map(url => url.loc[0])
    .map(url => new URL(url).pathname);
}

function flatten(arr) {
  return Array.prototype.concat.apply([], arr);
}

build()
  .catch(err => console.error(err.stack));
