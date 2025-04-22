(function (factory) {
  typeof define === "function" && define.amd ? define(factory) : factory();
})(function () {
  "use strict";

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
  const zeroPad = (n) => (n < 10 ? "0" + n : n);

  const RFC = function (date) {
    const day = days[date.getDay()].substring(0, 3);
    const paddedDate = zeroPad(date.getDate());
    const month = months[date.getMonth()].substring(0, 3);
    const year = date.getFullYear().toString();
    const hours = date.getUTCHours().toString();
    const minutes = date.getUTCMinutes().toString();
    const seconds = date.getUTCSeconds().toString();
    return `${day}, ${paddedDate} ${month} ${year} ${hours}:${minutes}:${seconds} Z`;
  };

  const objectFromMap = function (map) {
    const object = Array.from(map).reduce(
      (object, [key, value]) => Object.assign(object, { [key]: value }), // Be careful! Maps can have non-String keys; object literals can't.
      {}
    );
    return object;
  };

  const mapFromObject = function (object) {
    const map = new Map();
    for (var property in object) {
      if (object.hasOwnProperty(property)) {
        map.set(property, object[property]);
      }
    }
    return map;
  };

  class Author {
    // constructor(name='', personalURL='', affiliation='', affiliationURL='') {
    //   this.name = name; // 'Chris Olah'
    //   this.personalURL = personalURL; // 'https://colah.github.io'
    //   this.affiliation = affiliation; // 'Google Brain'
    //   this.affiliationURL = affiliationURL; // 'https://g.co/brain'
    // }

    constructor(object) {
      this.name = object.author; // 'Chris Olah'
      this.personalURL = object.authorURL; // 'https://colah.github.io'
      this.affiliation = object.affiliation; // 'Google Brain'
      this.affiliationURL = object.affiliationURL; // 'https://g.co/brain'
      this.affiliations = object.affiliations || []; // new-style affiliations
    }

    // 'Chris'
    get firstName() {
      const names = this.name.split(" ");
      return names.slice(0, names.length - 1).join(" ");
    }

    // 'Olah'
    get lastName() {
      const names = this.name.split(" ");
      return names[names.length - 1];
    }
  }

  function mergeFromYMLFrontmatter(target, source) {
    target.title = source.title;
    if (source.published) {
      if (source.published instanceof Date) {
        target.publishedDate = source.published;
      } else if (source.published.constructor === String) {
        target.publishedDate = new Date(source.published);
      }
    }
    if (source.publishedDate) {
      if (source.publishedDate instanceof Date) {
        target.publishedDate = source.publishedDate;
      } else if (source.publishedDate.constructor === String) {
        target.publishedDate = new Date(source.publishedDate);
      } else {
        console.error("Don't know what to do with published date: " + source.publishedDate);
      }
    }
    target.description = source.description;
    target.authors = source.authors.map((authorObject) => new Author(authorObject));
    target.katex = source.katex;
    target.password = source.password;
    if (source.doi) {
      target.doi = source.doi;
    }
  }

  class FrontMatter {
    constructor() {
      this.title = "unnamed article"; // 'Attention and Augmented Recurrent Neural Networks'
      this.description = ""; // 'A visual overview of neural attention...'
      this.authors = []; // Array of Author(s)

      this.bibliography = new Map();
      this.bibliographyParsed = false;
      //  {
      //    'gregor2015draw': {
      //      'title': 'DRAW: A recurrent neural network for image generation',
      //      'author': 'Gregor, Karol and Danihelka, Ivo and Graves, Alex and Rezende, Danilo Jimenez and Wierstra, Daan',
      //      'journal': 'arXiv preprint arXiv:1502.04623',
      //      'year': '2015',
      //      'url': 'https://arxiv.org/pdf/1502.04623.pdf',
      //      'type': 'article'
      //    },
      //  }

      // Citation keys should be listed in the order that they are appear in the document.
      // Each key refers to a key in the bibliography dictionary.
      this.citations = []; // [ 'gregor2015draw', 'mercier2011humans' ]
      this.citationsCollected = false;

      //
      // Assigned from posts.csv
      //

      //  publishedDate: 2016-09-08T07:00:00.000Z,
      //  tags: [ 'rnn' ],
      //  distillPath: '2016/augmented-rnns',
      //  githubPath: 'distillpub/post--augmented-rnns',
      //  doiSuffix: 1,

      //
      // Assigned from journal
      //
      this.journal = {};
      //  journal: {
      //    'title': 'Distill',
      //    'full_title': 'Distill',
      //    'abbrev_title': 'Distill',
      //    'url': 'http://distill.pub',
      //    'doi': '10.23915/distill',
      //    'publisherName': 'Distill Working Group',
      //    'publisherEmail': 'admin@distill.pub',
      //    'issn': '2476-0757',
      //    'editors': [...],
      //    'committee': [...]
      //  }
      //  volume: 1,
      //  issue: 9,

      this.katex = {};

      //
      // Assigned from publishing process
      //

      //  githubCompareUpdatesUrl: 'https://github.com/distillpub/post--augmented-rnns/compare/1596e094d8943d2dc0ea445d92071129c6419c59...3bd9209e0c24d020f87cf6152dcecc6017cbc193',
      //  updatedDate: 2017-03-21T07:13:16.000Z,
      //  doi: '10.23915/distill.00001',
      this.doi = undefined;
      this.publishedDate = undefined;
    }

    // Example:
    // title: Demo Title Attention and Augmented Recurrent Neural Networks
    // published: Jan 10, 2017
    // authors:
    // - Chris Olah:
    // - Shan Carter: http://shancarter.com
    // affiliations:
    // - Google Brain:
    // - Google Brain: http://g.co/brain

    //
    // Computed Properties
    //

    // 'http://distill.pub/2016/augmented-rnns',
    set url(value) {
      this._url = value;
    }
    get url() {
      if (this._url) {
        return this._url;
      } else if (this.distillPath && this.journal.url) {
        return this.journal.url + "/" + this.distillPath;
      } else if (this.journal.url) {
        return this.journal.url;
      }
    }

    // 'https://github.com/distillpub/post--augmented-rnns',
    get githubUrl() {
      if (this.githubPath) {
        return "https://github.com/" + this.githubPath;
      } else {
        return undefined;
      }
    }

    // TODO resolve differences in naming of URL/Url/url.
    // 'http://distill.pub/2016/augmented-rnns/thumbnail.jpg',
    set previewURL(value) {
      this._previewURL = value;
    }
    get previewURL() {
      return this._previewURL ? this._previewURL : this.url + "/thumbnail.jpg";
    }

    // 'Thu, 08 Sep 2016 00:00:00 -0700',
    get publishedDateRFC() {
      return RFC(this.publishedDate);
    }

    // 'Thu, 08 Sep 2016 00:00:00 -0700',
    get updatedDateRFC() {
      return RFC(this.updatedDate);
    }

    // 2016,
    get publishedYear() {
      return this.publishedDate.getFullYear();
    }

    // 'Sept',
    get publishedMonth() {
      return months[this.publishedDate.getMonth()];
    }

    // 8,
    get publishedDay() {
      return this.publishedDate.getDate();
    }

    // '09',
    get publishedMonthPadded() {
      return zeroPad(this.publishedDate.getMonth() + 1);
    }

    // '08',
    get publishedDayPadded() {
      return zeroPad(this.publishedDate.getDate());
    }

    get publishedISODateOnly() {
      return this.publishedDate.toISOString().split("T")[0];
    }

    get volume() {
      const volume = this.publishedYear - 2015;
      if (volume < 1) {
        throw new Error("Invalid publish date detected during computing volume");
      }
      return volume;
    }

    get issue() {
      return this.publishedDate.getMonth() + 1;
    }

    // 'Olah & Carter',
    get concatenatedAuthors() {
      if (this.authors.length > 2) {
        return this.authors[0].lastName + ", et al.";
      } else if (this.authors.length === 2) {
        return this.authors[0].lastName + " & " + this.authors[1].lastName;
      } else if (this.authors.length === 1) {
        return this.authors[0].lastName;
      }
    }

    // 'Olah, Chris and Carter, Shan',
    get bibtexAuthors() {
      return this.authors
        .map((author) => {
          return author.lastName + ", " + author.firstName;
        })
        .join(" and ");
    }

    // 'olah2016attention'
    get slug() {
      let slug = "";
      if (this.authors.length) {
        slug += this.authors[0].lastName.toLowerCase();
        slug += this.publishedYear;
        slug += this.title.split(" ")[0].toLowerCase();
      }
      return slug || "Untitled";
    }

    get bibliographyEntries() {
      return new Map(
        this.citations.map((citationKey) => {
          const entry = this.bibliography.get(citationKey);
          return [citationKey, entry];
        })
      );
    }

    set bibliography(bibliography) {
      if (bibliography instanceof Map) {
        this._bibliography = bibliography;
      } else if (typeof bibliography === "object") {
        this._bibliography = mapFromObject(bibliography);
      }
    }

    get bibliography() {
      return this._bibliography;
    }

    static fromObject(source) {
      const frontMatter = new FrontMatter();
      Object.assign(frontMatter, source);
      return frontMatter;
    }

    assignToObject(target) {
      Object.assign(target, this);
      target.bibliography = objectFromMap(this.bibliographyEntries);
      target.url = this.url;
      target.doi = this.doi;
      target.githubUrl = this.githubUrl;
      target.previewURL = this.previewURL;
      if (this.publishedDate) {
        target.volume = this.volume;
        target.issue = this.issue;
        target.publishedDateRFC = this.publishedDateRFC;
        target.publishedYear = this.publishedYear;
        target.publishedMonth = this.publishedMonth;
        target.publishedDay = this.publishedDay;
        target.publishedMonthPadded = this.publishedMonthPadded;
        target.publishedDayPadded = this.publishedDayPadded;
      }
      if (this.updatedDate) {
        target.updatedDateRFC = this.updatedDateRFC;
      }
      target.concatenatedAuthors = this.concatenatedAuthors;
      target.bibtexAuthors = this.bibtexAuthors;
      target.slug = this.slug;
    }
  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  const Mutating = (superclass) => {
    return class extends superclass {
      constructor() {
        super();

        // set up mutation observer
        const options = {
          childList: true,
          characterData: true,
          subtree: true,
        };
        const observer = new MutationObserver(() => {
          observer.disconnect();
          this.renderIfPossible();
          observer.observe(this, options);
        });

        // ...and listen for changes
        observer.observe(this, options);
      }

      connectedCallback() {
        super.connectedCallback();

        this.renderIfPossible();
      }

      // potential TODO: check if this is enough for all our usecases
      // maybe provide a custom function to tell if we have enough information to render
      renderIfPossible() {
        if (this.textContent && this.root) {
          this.renderContent();
        }
      }

      renderContent() {
        console.error(`Your class ${this.constructor.name} must provide a custom renderContent() method!`);
      }
    }; // end class
  }; // end mixin function

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  /*global ShadyCSS*/

  const Template = (name, templateString, useShadow = true) => {
    return (superclass) => {
      const template = document.createElement("template");
      template.innerHTML = templateString;

      if (useShadow && "ShadyCSS" in window) {
        ShadyCSS.prepareTemplate(template, name);
      }

      return class extends superclass {
        static get is() {
          return name;
        }

        constructor() {
          super();

          this.clone = document.importNode(template.content, true);
          if (useShadow) {
            this.attachShadow({ mode: "open" });
            this.shadowRoot.appendChild(this.clone);
          }
        }

        connectedCallback() {
          if (this.hasAttribute("distill-prerendered")) {
            return;
          }
          if (useShadow) {
            if ("ShadyCSS" in window) {
              ShadyCSS.styleElement(this);
            }
          } else {
            this.insertBefore(this.clone, this.firstChild);
          }
        }

        get root() {
          if (useShadow) {
            return this.shadowRoot;
          } else {
            return this;
          }
        }

        /* TODO: Are we using these? Should we even? */
        $(query) {
          return this.root.querySelector(query);
        }

        $$(query) {
          return this.root.querySelectorAll(query);
        }
      };
    };
  };

  var math =
    '/*\n * Copyright 2018 The Distill Template Authors\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\nspan.katex-display {\n  text-align: left;\n  padding: 8px 0 8px 0;\n  margin: 0.5em 0 0.5em 1em;\n}\n\nspan.katex {\n  -webkit-font-smoothing: antialiased;\n;\n  font-size: 1.18em;\n}\n\n';

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  // This is a straight concatenation of code from KaTeX's contrib folder,
  // but we aren't using some of their helpers that don't work well outside a browser environment.

  /*global katex */

  const findEndOfMath = function (delimiter, text, startIndex) {
    // Adapted from
    // https://github.com/Khan/perseus/blob/master/src/perseus-markdown.jsx
    let index = startIndex;
    let braceLevel = 0;

    const delimLength = delimiter.length;

    while (index < text.length) {
      const character = text[index];

      if (braceLevel <= 0 && text.slice(index, index + delimLength) === delimiter) {
        return index;
      } else if (character === "\\") {
        // Skip next character (escaped character)
        index++;
      } else if (character === "{") {
        braceLevel++;
      } else if (character === "}") {
        braceLevel--;
      }

      index++;
    }

    return -1;
  };

  // NEW: Helper function from official auto-render
  const escapeRegex = function (string) {
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  };

  // NEW: Regex to check for AMS environments, used for specific handling
  const amsRegex = /^\\begin{/;

  // REPLACED: This function now mimics the official auto-render logic
  const splitAtDelimiters = function (text, delimiters) {
    let index;
    const data = [];
    // Create a regex to find any left delimiter
    const regexLeft = new RegExp("(" + delimiters.map(x => escapeRegex(x.left)).join("|") + ")");

    while (true) {
      // Find the *first* occurrence of any left delimiter
      index = text.search(regexLeft);

      // If no left delimiter found, add the rest of the text and break
      if (index === -1) {
        break;
      }

      // Add the text before the delimiter if it exists
      if (index > 0) {
        data.push({
          type: "text",
          data: text.slice(0, index)
        });
        text = text.slice(index); // Now text starts with the delimiter
      }

      // Find which delimiter was matched
      const i = delimiters.findIndex(delim => text.startsWith(delim.left));
      if (i === -1) break; // Should not happen based on regex search

      const matchedDelimiter = delimiters[i];

      // Find the end of the math expression using the corresponding right delimiter
      index = findEndOfMath(matchedDelimiter.right, text, matchedDelimiter.left.length);

      // If no right delimiter found, add the rest as text and break
      if (index === -1) {
        break;
      }

      // Extract the raw data and the math content
      const rawData = text.slice(0, index + matchedDelimiter.right.length);
      // For AMS environments, the math is the raw data; otherwise, strip delimiters
      const math = amsRegex.test(rawData) ? rawData : text.slice(matchedDelimiter.left.length, index);

      data.push({
        type: "math",
        data: math,
        rawData: rawData, // Keep raw data for error reporting
        display: matchedDelimiter.display
      });

      // Remove the processed math section from the text
      text = text.slice(index + matchedDelimiter.right.length);
    }

    // Add any remaining text
    if (text !== "") {
      data.push({
        type: "text",
        data: text
      });
    }

    return data;
  };

  // REMOVED: splitWithDelimiters is no longer needed, splitAtDelimiters handles it

  /* Note: optionsCopy is mutated by this method. If it is ever exposed in the
   * API, we should copy it before mutating.
   */
  // MODIFIED: To use the new splitAtDelimiters and create d-math tags
  const renderMathInText = function (text, optionsCopy) {
    // Use the new, more robust splitting function
    const data = splitAtDelimiters(text, optionsCopy.delimiters);

    // If the text contains no math, return null to signal no changes needed.
    if (data.length === 1 && data[0].type === 'text') {
      return null;
    }

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < data.length; i++) {
      if (data[i].type === "text") {
        fragment.appendChild(document.createTextNode(data[i].data));
      } else {
        const tag = document.createElement("d-math"); // Create d-math tag
        let math = data[i].data;

        // Apply preProcess hook if provided
        if (optionsCopy.preProcess) {
          try {
            math = optionsCopy.preProcess(math);
          } catch (e) {
            optionsCopy.errorCallback("KaTeX auto-render: preProcess failed for `" + data[i].data + "` with error: ", e);
            fragment.appendChild(document.createTextNode(data[i].rawData)); // Append raw data on error
            continue;
          }
        }

        // Set display mode based on delimiter
        optionsCopy.displayMode = data[i].display;

        // Prepare the d-math tag. The actual rendering happens *inside* the d-math component.
        // We just set the content and attributes here.
        try {
          tag.textContent = math;
          if (optionsCopy.displayMode) {
            tag.setAttribute("block", "");
          }
          // Add the d-math tag to the fragment
          fragment.appendChild(tag);

        } catch (e) {
          // This catch block might be less relevant now as katex.render isn't called here,
          // but we keep error reporting for completeness (e.g., if preProcess fails).
          // The d-math component itself should handle KaTeX ParseErrors during its render.
          // We still rely on the errorCallback for logging.
          optionsCopy.errorCallback("KaTeX auto-render: Failed to process `" + data[i].data + "` with error: ", e);
          fragment.appendChild(document.createTextNode(data[i].rawData)); // Append raw data on error
          continue;
        }
      }
    }

    return fragment;
  };

  // MODIFIED: To include adjacent text node concatenation and ignoredClasses check
  const renderElem = function (elem, optionsCopy) {
    for (let i = 0; i < elem.childNodes.length; i++) {
      const childNode = elem.childNodes[i];

      if (childNode.nodeType === 3) { // Node.TEXT_NODE
        // Concatenate adjacent text nodes. Needed for browsers like WebKit that
        // split very large text nodes into smaller ones.
        let textContentConcat = childNode.textContent;
        let sibling = childNode.nextSibling;
        let nSiblings = 0;
        while (sibling && sibling.nodeType === Node.TEXT_NODE) {
          textContentConcat += sibling.textContent;
          sibling = sibling.nextSibling;
          nSiblings++;
        }

        // Process the concatenated text content
        const frag = renderMathInText(textContentConcat, optionsCopy);

        if (frag) {
          // If math was found and processed, replace the original text node(s)
          // Remove the subsequent text nodes that were concatenated.
          for (let j = 0; j < nSiblings; j++) {
            childNode.nextSibling.remove(); // Use remove() for modern browsers
          }
          // Replace the original node and update the loop counter
          i += frag.childNodes.length - 1;
          elem.replaceChild(frag, childNode);
        } else {
          // If no math found in the concatenated text, skip the siblings
          i += nSiblings;
        }

      } else if (childNode.nodeType === 1) { // Node.ELEMENT_NODE
        // Check ignored tags and classes
        const className = ' ' + childNode.className + ' '; // Add spaces for accurate class matching
        const shouldRender =
          optionsCopy.ignoredTags.indexOf(childNode.nodeName.toLowerCase()) === -1 &&
          optionsCopy.ignoredClasses.every(cls => className.indexOf(' ' + cls + ' ') === -1);

        if (shouldRender) {
          renderElem(childNode, optionsCopy); // Recurse
        }
      }
      // Ignore other node types (comments, etc.)
    }
  };

  // MODIFIED: Updated default options to match official ones
  const defaultAutoRenderOptions = {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\(", right: "\\)", display: false },
      // LaTeX environments
      { left: "\\begin{equation}", right: "\\end{equation}", display: true },
      { left: "\\begin{align}", right: "\\end{align}", display: true },
      { left: "\\begin{alignat}", right: "\\end{alignat}", display: true },
      { left: "\\begin{gather}", right: "\\end{gather}", display: true },
      { left: "\\begin{CD}", right: "\\end{CD}", display: true },
      // Must come AFTER AMS environments
      { left: "\\[", right: "\\]", display: true },
      // LaTeX uses $...$, but it ruins the display of normal `$` in text:
      // {left: '$', right: '$', display: false},
    ],
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option", "svg", "d-code"], // Added svg, d-code
    ignoredClasses: [],
    errorCallback: function (msg, err) {
      console.error(msg, err);
    },
    macros: {}, // Add macros option
    preProcess: null, // Add preProcess option
  };

  // MODIFIED: Simplified and uses updated defaults
  const renderMathInElement = function (elem, options) {
    if (!elem) {
      throw new Error("No element provided to render");
    }

    // Create a shallow copy of the options object, merging with defaults
    const optionsCopy = Object.assign({}, defaultAutoRenderOptions, options);

    // Update delimiters if provided in options
    if (options && options.delimiters) {
      optionsCopy.delimiters = options.delimiters;
    }
    // Update ignoredTags if provided
    if (options && options.ignoredTags) {
      optionsCopy.ignoredTags = options.ignoredTags;
    }
    // Update ignoredClasses if provided
    if (options && options.ignoredClasses) {
      optionsCopy.ignoredClasses = options.ignoredClasses;
    }
    // Update errorCallback if provided
    if (options && options.errorCallback) {
      optionsCopy.errorCallback = options.errorCallback;
    }
    // Update macros if provided
    if (options && options.macros) {
      optionsCopy.macros = options.macros;
    }
    // Update preProcess if provided
    if (options && options.preProcess) {
      optionsCopy.preProcess = options.preProcess;
    }

    // Start the recursive rendering process
    renderElem(elem, optionsCopy);
  };

  // Copyright 2018 The Distill Template Authors

  const katexJSURL = "https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js";
  const katexCSSTag = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" integrity="sha384-5TcZemv2l/9On385z///+d7MSYlvIEw9FuZTIdZ14vJLqWphw7e7ZPuOiCHJcFCP" crossorigin="anonymous">';

  const T = Template(
    "d-math",
    `
${katexCSSTag}
<style>

:host {
  display: inline-block;
  contain: style;
}

:host([block]) {
  display: block;
}

${math}
</style>
<span id='katex-container'></span>
`,
  );

  // DMath, not Math, because that would conflict with the JS built-in
  class DMath extends Mutating(T(HTMLElement)) {
    static set katexOptions(options) {
      DMath._katexOptions = options;
      if (DMath.katexOptions.delimiters) {
        if (!DMath.katexAdded) {
          DMath.addKatex();
        } else {
          DMath.katexLoadedCallback();
        }
      }
    }

    static get katexOptions() {
      if (!DMath._katexOptions) {
        DMath._katexOptions = {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\(', right: '\)', display: false },
            { left: '\[', right: '\]', display: true },
            { left: "\begin{equation}", right: "\end{equation}", display: true },
            { left: "\begin{align}", right: "\end{align}", display: true },
          ],
          // • rendering keys, e.g.:
          throwOnError: false
        };
      }
      return DMath._katexOptions;
    }

    static katexLoadedCallback() {
      // render all d-math tags
      const mathTags = document.querySelectorAll("d-math");
      for (const mathTag of mathTags) {
        mathTag.renderContent();
      }
      // transform inline delimited math to d-math tags
      if (DMath.katexOptions.delimiters) {
        renderMathInElement(document.body, DMath.katexOptions);
      }
    }

    static addKatex() {
      // css tag can use this convenience function
      document.head.insertAdjacentHTML("beforeend", katexCSSTag);
      // script tag has to be created to work properly
      const scriptTag = document.createElement("script");
      scriptTag.src = katexJSURL;
      scriptTag.async = true;
      scriptTag.onload = DMath.katexLoadedCallback;
      scriptTag.crossorigin = "anonymous";
      document.head.appendChild(scriptTag);

      DMath.katexAdded = true;
    }

    get options() {
      const localOptions = { displayMode: this.hasAttribute("block") };
      return Object.assign(localOptions, DMath.katexOptions);
    }

    connectedCallback() {
      super.connectedCallback();
      if (!DMath.katexAdded) {
        DMath.addKatex();
      }
    }

    renderContent() {
      if (typeof katex !== "undefined") {
        const container = this.root.querySelector("#katex-container");
        katex.render(this.textContent, container, this.options);
      }
    }
  }

  DMath.katexAdded = false;
  DMath.inlineMathRendered = false;
  window.DMath = DMath; // TODO: check if this can be removed, or if we should expose a distill global

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  function collect_citations(dom = document) {
    const citations = new Set();
    const citeTags = dom.querySelectorAll("d-cite");
    for (const tag of citeTags) {
      const keyString = tag.getAttribute("key") || tag.getAttribute("bibtex-key");
      const keys = keyString.split(",").map((k) => k.trim());
      for (const key of keys) {
        citations.add(key);
      }
    }
    return [...citations];
  }

  function author_string(ent, template, sep, finalSep) {
    if (ent.author == null) {
      return "";
    }
    var names = ent.author.split(" and ");
    let name_strings = names.map((name) => {
      name = name.trim();
      if (name.indexOf(",") != -1) {
        var last = name.split(",")[0].trim();
        var firsts = name.split(",")[1];
      } else if (name.indexOf(" ") != -1) {
        var last = name.split(" ").slice(-1)[0].trim();
        var firsts = name.split(" ").slice(0, -1).join(" ");
      } else {
        var last = name.trim();
      }
      var initials = "";
      if (firsts != undefined) {
        initials = firsts
          .trim()
          .split(" ")
          .map((s) => s.trim()[0]);
        initials = initials.join(".") + ".";
      }
      return template.replace("${F}", firsts).replace("${L}", last).replace("${I}", initials).trim(); // in case one of first or last was empty
    });
    if (names.length > 1) {
      var str = name_strings.slice(0, names.length - 1).join(sep);
      str += (finalSep || sep) + name_strings[names.length - 1];
      return str;
    } else {
      return name_strings[0];
    }
  }

  function venue_string(ent) {
    var cite = ent.journal || ent.booktitle || "";
    if ("volume" in ent) {
      var issue = ent.issue || ent.number;
      issue = issue != undefined ? "(" + issue + ")" : "";
      cite += ", Vol " + ent.volume + issue;
    }
    if ("pages" in ent) {
      cite += ", pp. " + ent.pages;
    }
    if (cite != "") cite += ". ";
    if ("publisher" in ent) {
      cite += ent.publisher;
      if (cite[cite.length - 1] != ".") cite += ".";
    }
    return cite;
  }

  function link_string(ent) {
    if ("url" in ent) {
      var url = ent.url;
      var arxiv_match = /arxiv\.org\/abs\/([0-9\.]*)/.exec(url);
      if (arxiv_match != null) {
        url = `http://arxiv.org/pdf/${arxiv_match[1]}.pdf`;
      }

      if (url.slice(-4) == ".pdf") {
        var label = "PDF";
      } else if (url.slice(-5) == ".html") {
        var label = "HTML";
      }
      return ` &ensp;<a href="${url}">[${label || "link"}]</a>`;
    } /* else if ("doi" in ent){
      return ` &ensp;<a href="https://doi.org/${ent.doi}" >[DOI]</a>`;
    }*/ else {
      return "";
    }
  }
  function doi_string(ent, new_line) {
    if ("doi" in ent) {
      return `${new_line ? "<br>" : ""} <a href="https://doi.org/${ent.doi}" style="text-decoration:inherit;">DOI: ${ent.doi}</a>`;
    } else {
      return "";
    }
  }

  function title_string(ent) {
    return '<span class="title">' + ent.title + "</span> ";
  }

  function bibliography_cite(ent, fancy) {
    if (ent) {
      var cite = title_string(ent);
      cite += link_string(ent) + "<br>";
      if (ent.author) {
        cite += author_string(ent, "${L}, ${I}", ", ", " and ");
        if (ent.year || ent.date) {
          cite += ", ";
        }
      }
      if (ent.year || ent.date) {
        cite += (ent.year || ent.date) + ". ";
      } else {
        cite += ". ";
      }
      cite += venue_string(ent);
      cite += doi_string(ent);
      return cite;
      /*var cite =  author_string(ent, "${L}, ${I}", ", ", " and ");
      if (ent.year || ent.date){
        cite += ", " + (ent.year || ent.date) + ". "
      } else {
        cite += ". "
      }
      cite += "<b>" + ent.title + "</b>. ";
      cite += venue_string(ent);
      cite += doi_string(ent);
      cite += link_string(ent);
      return cite*/
    } else {
      return "?";
    }
  }

  function hover_cite(ent) {
    if (ent) {
      var cite = "";
      cite += "<strong>" + ent.title + "</strong>";
      cite += link_string(ent);
      cite += "<br>";

      var a_str = author_string(ent, "${I} ${L}", ", ") + ".";
      var v_str = venue_string(ent).trim() + " " + ent.year + ". " + doi_string(ent, true);

      if ((a_str + v_str).length < Math.min(40, ent.title.length)) {
        cite += a_str + " " + v_str;
      } else {
        cite += a_str + "<br>" + v_str;
      }
      return cite;
    } else {
      return "?";
    }
  }

  function domContentLoaded() {
    return ["interactive", "complete"].indexOf(document.readyState) !== -1;
  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  function _moveLegacyAffiliationFormatIntoArray(frontMatter) {
    // authors used to have propoerties "affiliation" and "affiliationURL".
    // We now encourage using an array for affiliations containing objects with
    // properties "name" and "url".
    for (let author of frontMatter.authors) {
      const hasOldStyle = Boolean(author.affiliation);
      const hasNewStyle = Boolean(author.affiliations);
      if (!hasOldStyle) continue;
      if (hasNewStyle) {
        console.warn(
          `Author ${author.author} has both old-style ("affiliation" & "affiliationURL") and new style ("affiliations") affiliation information!`
        );
      } else {
        let newAffiliation = {
          name: author.affiliation,
        };
        if (author.affiliationURL) newAffiliation.url = author.affiliationURL;
        author.affiliations = [newAffiliation];
      }
    }
    return frontMatter;
  }

  function parseFrontmatter(element) {
    const scriptTag = element.firstElementChild;
    if (scriptTag) {
      const type = scriptTag.getAttribute("type");
      if (type.split("/")[1] == "json") {
        const content = scriptTag.textContent;
        const parsed = JSON.parse(content);
        return _moveLegacyAffiliationFormatIntoArray(parsed);
      } else {
        console.error("Distill only supports JSON frontmatter tags anymore; no more YAML.");
      }
    } else {
      console.error(
        "You added a frontmatter tag but did not provide a script tag with front matter data in it. Please take a look at our templates."
      );
    }
    return {};
  }

  class FrontMatter$1 extends HTMLElement {
    static get is() {
      return "d-front-matter";
    }

    constructor() {
      super();

      const options = {
        childList: true,
        characterData: true,
        subtree: true,
      };
      const observer = new MutationObserver((entries) => {
        for (const entry of entries) {
          if (entry.target.nodeName === "SCRIPT" || entry.type === "characterData") {
            const data = parseFrontmatter(this);
            this.notify(data);
          }
        }
      });
      observer.observe(this, options);
    }

    notify(data) {
      const options = { detail: data, bubbles: true };
      const event = new CustomEvent("onFrontMatterChanged", options);
      document.dispatchEvent(event);
    }
  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  // no appendix -> add appendix
  // title in front, no h1 -> add it
  // no title in front, h1 -> read and put into frontMatter
  // footnote -> footnote list
  // break up bib
  // if citation, no bib-list -> add citation-list

  // if authors, no byline -> add byline

  function optionalComponents(dom, data) {
    const body = dom.body;
    const article = body.querySelector("d-article");

    // If we don't have an article tag, something weird is going on—giving up.
    if (!article) {
      console.warn("No d-article tag found; skipping adding optional components!");
      return;
    }

    let byline = dom.querySelector("d-byline");
    if (!byline) {
      if (data.authors) {
        byline = dom.createElement("d-byline");
        // body.insertBefore(byline, article);
      } else {
        console.warn("No authors found in front matter; please add them before submission!");
      }
    }

    let title = dom.querySelector("d-title");
    if (!title) {
      title = dom.createElement("d-title");
      body.insertBefore(title, byline);
    }

    let h1 = title.querySelector("h1");
    if (!h1) {
      h1 = dom.createElement("h1");
      h1.textContent = data.title;
      title.insertBefore(h1, title.firstChild);
    }

    const hasPassword = typeof data.password !== "undefined";
    let interstitial = body.querySelector("d-interstitial");
    if (hasPassword && !interstitial) {
      const inBrowser = typeof window !== "undefined";
      const onLocalhost = inBrowser && window.location.hostname.includes("localhost");
      if (!inBrowser || !onLocalhost) {
        interstitial = dom.createElement("d-interstitial");
        interstitial.password = data.password;
        body.insertBefore(interstitial, body.firstChild);
      }
    } else if (!hasPassword && interstitial) {
      interstitial.parentElement.removeChild(this);
    }

    let appendix = dom.querySelector("d-appendix");
    if (!appendix) {
      appendix = dom.createElement("d-appendix");
      dom.body.appendChild(appendix);
    }

    let footnoteList = dom.querySelector("d-footnote-list");
    if (!footnoteList) {
      footnoteList = dom.createElement("d-footnote-list");
      appendix.appendChild(footnoteList);
    }

    let citationList = dom.querySelector("d-citation-list");
    if (!citationList) {
      citationList = dom.createElement("d-citation-list");
      appendix.appendChild(citationList);
    }
  }

  // Copyright 2018 The Distill Template Authors

  const frontMatter = new FrontMatter();

  const Controller = {
    frontMatter: frontMatter,
    waitingOn: {
      bibliography: [],
      citations: [],
    },
    listeners: {
      onCiteKeyCreated(event) {
        const [citeTag, keys] = event.detail;

        // ensure we have citations
        if (!frontMatter.citationsCollected) {
          // console.debug('onCiteKeyCreated, but unresolved dependency ("citations"). Enqueing.');
          Controller.waitingOn.citations.push(() => Controller.listeners.onCiteKeyCreated(event));
          return;
        }

        // ensure we have a loaded bibliography
        if (!frontMatter.bibliographyParsed) {
          // console.debug('onCiteKeyCreated, but unresolved dependency ("bibliography"). Enqueing.');
          Controller.waitingOn.bibliography.push(() => Controller.listeners.onCiteKeyCreated(event));
          return;
        }

        const numbers = keys.map((key) => frontMatter.citations.indexOf(key));
        citeTag.numbers = numbers;
        const entries = keys.map((key) => frontMatter.bibliography.get(key));
        citeTag.entries = entries;
      },

      onCiteKeyChanged() {
        // const [citeTag, keys] = event.detail;

        // update citations
        frontMatter.citations = collect_citations();
        frontMatter.citationsCollected = true;
        for (const waitingCallback of Controller.waitingOn.citations.slice()) {
          waitingCallback();
        }

        // update bibliography
        const citationListTag = document.querySelector("d-citation-list");
        const bibliographyEntries = new Map(
          frontMatter.citations.map((citationKey) => {
            return [citationKey, frontMatter.bibliography.get(citationKey)];
          })
        );
        citationListTag.citations = bibliographyEntries;

        const citeTags = document.querySelectorAll("d-cite");
        for (const citeTag of citeTags) {
          console.log(citeTag);
          const keys = citeTag.keys;
          const numbers = keys.map((key) => frontMatter.citations.indexOf(key));
          citeTag.numbers = numbers;
          const entries = keys.map((key) => frontMatter.bibliography.get(key));
          citeTag.entries = entries;
        }
      },

      onCiteKeyRemoved(event) {
        Controller.listeners.onCiteKeyChanged(event);
      },

      onBibliographyChanged(event) {
        const citationListTag = document.querySelector("d-citation-list");

        const bibliography = event.detail;

        frontMatter.bibliography = bibliography;
        frontMatter.bibliographyParsed = true;
        for (const waitingCallback of Controller.waitingOn.bibliography.slice()) {
          waitingCallback();
        }

        // ensure we have citations
        if (!frontMatter.citationsCollected) {
          Controller.waitingOn.citations.push(function () {
            Controller.listeners.onBibliographyChanged({
              target: event.target,
              detail: event.detail,
            });
          });
          return;
        }

        if (citationListTag.hasAttribute("distill-prerendered")) {
          console.debug("Citation list was prerendered; not updating it.");
        } else {
          const entries = new Map(
            frontMatter.citations.map((citationKey) => {
              return [citationKey, frontMatter.bibliography.get(citationKey)];
            })
          );
          citationListTag.citations = entries;
        }
      },

      onFootnoteChanged() {
        // const footnote = event.detail;
        //TODO: optimize to only update current footnote
        const footnotesList = document.querySelector("d-footnote-list");
        if (footnotesList) {
          const footnotes = document.querySelectorAll("d-footnote");
          footnotesList.footnotes = footnotes;
        }
      },

      onFrontMatterChanged(event) {
        const data = event.detail;
        mergeFromYMLFrontmatter(frontMatter, data);

        const interstitial = document.querySelector("d-interstitial");
        if (interstitial) {
          if (typeof frontMatter.password !== "undefined") {
            interstitial.password = frontMatter.password;
          } else {
            interstitial.parentElement.removeChild(interstitial);
          }
        }

        const prerendered = document.body.hasAttribute("distill-prerendered");
        if (!prerendered && domContentLoaded()) {
          optionalComponents(document, frontMatter);

          const appendix = document.querySelector("distill-appendix");
          if (appendix) {
            appendix.frontMatter = frontMatter;
          }

          const byline = document.querySelector("d-byline");
          if (byline) {
            byline.frontMatter = frontMatter;
          }

          if (data.katex) {
            DMath.katexOptions = data.katex;
          }
        }
      },

      DOMContentLoaded() {
        if (Controller.loaded) {
          console.warn("Controller received DOMContentLoaded but was already loaded!");
          return;
        } else if (!domContentLoaded()) {
          console.warn("Controller received DOMContentLoaded at document.readyState: " + document.readyState + "!");
          return;
        } else {
          Controller.loaded = true;
          console.debug("Runlevel 4: Controller running DOMContentLoaded");
        }

        const frontMatterTag = document.querySelector("d-front-matter");
        if (frontMatterTag) {
          const data = parseFrontmatter(frontMatterTag);
          Controller.listeners.onFrontMatterChanged({ detail: data });
        }

        // Resolving "citations" dependency due to initial DOM load
        frontMatter.citations = collect_citations();
        frontMatter.citationsCollected = true;
        for (const waitingCallback of Controller.waitingOn.citations.slice()) {
          waitingCallback();
        }

        if (frontMatter.bibliographyParsed) {
          for (const waitingCallback of Controller.waitingOn.bibliography.slice()) {
            waitingCallback();
          }
        }

        const footnotesList = document.querySelector("d-footnote-list");
        if (footnotesList) {
          const footnotes = document.querySelectorAll("d-footnote");
          footnotesList.footnotes = footnotes;
        }
      },
    }, // listeners
  }; // Controller

  var base =
    '/*\n * Copyright 2018 The Distill Template Authors\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\nhtml {\n  font-size: 14px;\n\tline-height: 1.6em;\n  /* font-family: "Libre Franklin", "Helvetica Neue", sans-serif; */\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif;\n  /*, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";*/\n  text-size-adjust: 100%;\n  -ms-text-size-adjust: 100%;\n  -webkit-text-size-adjust: 100%;\n}\n\n@media(min-width: 768px) {\n  html {\n    font-size: 16px;\n  }\n}\n\nbody {\n  margin: 0;\n}\n\na {\n  color: #004276;\n}\n\nfigure {\n  margin: 0;\n}\n\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n\ntable th {\n\ttext-align: left;\n}\n\ntable thead {\n  border-bottom: 1px solid rgba(0, 0, 0, 0.05);\n}\n\ntable thead th {\n  padding-bottom: 0.5em;\n}\n\ntable tbody :first-child td {\n  padding-top: 0.5em;\n}\n\npre {\n  overflow: auto;\n  max-width: 100%;\n}\n\np {\n  margin-top: 0;\n  margin-bottom: 1em;\n}\n\nsup, sub {\n  vertical-align: baseline;\n  position: relative;\n  top: -0.4em;\n  line-height: 1em;\n}\n\nsub {\n  top: 0.4em;\n}\n\n.kicker,\n.marker {\n  font-size: 15px;\n  font-weight: 600;\n  color: rgba(0, 0, 0, 0.5);\n}\n\n\n/* Headline */\n\n@media(min-width: 1024px) {\n  d-title h1 span {\n    display: block;\n  }\n}\n\n/* Figure */\n\nfigure {\n  position: relative;\n  margin-bottom: 2.5em;\n  margin-top: 1.5em;\n}\n\nfigcaption+figure {\n\n}\n\nfigure img {\n  width: 100%;\n}\n\nfigure svg text,\nfigure svg tspan {\n}\n\nfigcaption,\n.figcaption {\n  color: rgba(0, 0, 0, 0.6);\n  font-size: 12px;\n  line-height: 1.5em;\n}\n\n@media(min-width: 1024px) {\nfigcaption,\n.figcaption {\n    font-size: 13px;\n  }\n}\n\nfigure.external img {\n  background: white;\n  border: 1px solid rgba(0, 0, 0, 0.1);\n  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.1);\n  padding: 18px;\n  box-sizing: border-box;\n}\n\nfigcaption a {\n  color: rgba(0, 0, 0, 0.6);\n}\n\nfigcaption b,\nfigcaption strong, {\n  font-weight: 600;\n  color: rgba(0, 0, 0, 1.0);\n}\n';

  var layout =
    '/*\n * Copyright 2018 The Distill Template Authors\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\n@supports not (display: grid) {\n  .base-grid,\n  distill-header,\n  d-title,\n  d-abstract,\n  d-article,\n  d-appendix,\n  distill-appendix,\n  d-byline,\n  d-footnote-list,\n  d-citation-list,\n  distill-footer {\n    display: block;\n    padding: 8px;\n  }\n}\n\n.base-grid,\ndistill-header,\nd-title,\nd-abstract,\nd-article,\nd-appendix,\ndistill-appendix,\nd-byline,\nd-footnote-list,\nd-citation-list,\ndistill-footer {\n  display: grid;\n  justify-items: stretch;\n  grid-template-columns: [screen-start] 8px [page-start kicker-start text-start gutter-start middle-start] 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr [text-end page-end gutter-end kicker-end middle-end] 8px [screen-end];\n  grid-column-gap: 8px;\n}\n\n.grid {\n  display: grid;\n  grid-column-gap: 8px;\n}\n\n@media(min-width: 768px) {\n  .base-grid,\n  distill-header,\n  d-title,\n  d-abstract,\n  d-article,\n  d-appendix,\n  distill-appendix,\n  d-byline,\n  d-footnote-list,\n  d-citation-list,\n  distill-footer {\n    grid-template-columns: [screen-start] 1fr [page-start kicker-start middle-start text-start] 45px 45px 45px 45px 45px 45px 45px 45px [ kicker-end text-end gutter-start] 45px [middle-end] 45px [page-end gutter-end] 1fr [screen-end];\n    grid-column-gap: 16px;\n  }\n\n  .grid {\n    grid-column-gap: 16px;\n  }\n}\n\n@media(min-width: 1000px) {\n  .base-grid,\n  distill-header,\n  d-title,\n  d-abstract,\n  d-article,\n  d-appendix,\n  distill-appendix,\n  d-byline,\n  d-footnote-list,\n  d-citation-list,\n  distill-footer {\n    grid-template-columns: [screen-start] 1fr [page-start kicker-start] 50px [middle-start] 50px [text-start kicker-end] 50px 50px 50px 50px 50px 50px 50px 50px [text-end gutter-start] 50px [middle-end] 50px [page-end gutter-end] 1fr [screen-end];\n    grid-column-gap: 16px;\n  }\n\n  .grid {\n    grid-column-gap: 16px;\n  }\n}\n\n@media(min-width: 1180px) {\n  .base-grid,\n  distill-header,\n  d-title,\n  d-abstract,\n  d-article,\n  d-appendix,\n  distill-appendix,\n  d-byline,\n  d-footnote-list,\n  d-citation-list,\n  distill-footer {\n    grid-template-columns: [screen-start] 1fr [page-start kicker-start] 60px [middle-start] 60px [text-start kicker-end] 60px 60px 60px 60px 60px 60px 60px 60px [text-end gutter-start] 60px [middle-end] 60px [page-end gutter-end] 1fr [screen-end];\n    grid-column-gap: 32px;\n  }\n\n  .grid {\n    grid-column-gap: 32px;\n  }\n}\n\n\n\n\n.base-grid {\n  grid-column: screen;\n}\n\n/* .l-body,\nd-article > *  {\n  grid-column: text;\n}\n\n.l-page,\nd-title > *,\nd-figure {\n  grid-column: page;\n} */\n\n.l-gutter {\n  grid-column: gutter;\n}\n\n.l-text,\n.l-body {\n  grid-column: text;\n}\n\n.l-page {\n  grid-column: page;\n}\n\n.l-body-outset {\n  grid-column: middle;\n}\n\n.l-page-outset {\n  grid-column: page;\n}\n\n.l-screen {\n  grid-column: screen;\n}\n\n.l-screen-inset {\n  grid-column: screen;\n  padding-left: 16px;\n  padding-left: 16px;\n}\n\n\n/* Aside */\n\nd-article aside {\n  grid-column: gutter;\n  font-size: 12px;\n  line-height: 1.6em;\n  color: rgba(0, 0, 0, 0.6)\n}\n\n@media(min-width: 768px) {\n  aside {\n    grid-column: gutter;\n  }\n\n  .side {\n    grid-column: gutter;\n  }\n}\n';

  var print =
    '/*\n * Copyright 2018 The Distill Template Authors\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\n@media print {\n\n  @page {\n    size: 8in 11in;\n    @bottom-right {\n      content: counter(page) " of " counter(pages);\n    }\n  }\n\n  html {\n    /* no general margins -- CSS Grid takes care of those */\n  }\n\n  p, code {\n    page-break-inside: avoid;\n  }\n\n  h2, h3 {\n    page-break-after: avoid;\n  }\n\n  d-header {\n    visibility: hidden;\n  }\n\n  d-footer {\n    display: none!important;\n  }\n\n}\n';

  var byline =
    '/*\n * Copyright 2018 The Distill Template Authors\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\nd-byline {\n  contain: style;\n  overflow: hidden;\n  border-top: 1px solid rgba(0, 0, 0, 0.1);\n  font-size: 0.8rem;\n  line-height: 1.8em;\n  padding: 1.5rem 0;\n  min-height: 1.8em;\n}\n\n\nd-byline .byline {\n  grid-template-columns: 1fr 1fr;\n  grid-column: text;\n}\n\n@media(min-width: 768px) {\n  d-byline .byline {\n    grid-template-columns: 1fr 1fr 1fr 1fr;\n  }\n}\n\nd-byline .authors-affiliations {\n  grid-column-end: span 3;\n  grid-template-columns: 1fr 1fr 1fr;\n  margin-bottom: 1em;\n}\n\n@media(min-width: 768px) {\n  d-byline .authors-affiliations {\n    margin-bottom: 0;\n  }\n}\n\nd-byline h3 {\n  font-size: 0.6rem;\n  font-weight: 400;\n  color: rgba(0, 0, 0, 0.5);\n  margin: 0;\n  text-transform: uppercase;\n}\n\nd-byline p {\n  margin: 0;\n}\n\nd-byline a,\nd-article d-byline a {\n  color: rgba(0, 0, 0, 0.8);\n  text-decoration: none;\n  border-bottom: none;\n}\n\nd-article d-byline a:hover {\n  text-decoration: underline;\n  border-bottom: none;\n}\n\nd-byline p.author {\n  font-weight: 500;\n}\n\nd-byline .affiliations {\n\n}\n';

  var article =
    '/*\n * Copyright 2018 The Distill Template Authors\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\nd-article {\n  contain: layout style;\n  overflow-x: hidden;\n  border-top: 1px solid rgba(0, 0, 0, 0.1);\n  padding-top: 2rem;\n  color: rgba(0, 0, 0, 0.8);\n}\n\nd-article > * {\n  grid-column: text;\n}\n\n@media(min-width: 768px) {\n  d-article {\n    font-size: 16px;\n  }\n}\n\n@media(min-width: 1024px) {\n  d-article {\n    font-size: 1.06rem;\n    line-height: 1.7em;\n  }\n}\n\n\n/* H2 */\n\n\nd-article .marker {\n  text-decoration: none;\n  border: none;\n  counter-reset: section;\n  grid-column: kicker;\n  line-height: 1.7em;\n}\n\nd-article .marker:hover {\n  border: none;\n}\n\nd-article .marker span {\n  padding: 0 3px 4px;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.2);\n  position: relative;\n  top: 4px;\n}\n\nd-article .marker:hover span {\n  color: rgba(0, 0, 0, 0.7);\n  border-bottom: 1px solid rgba(0, 0, 0, 0.7);\n}\n\nd-article h2 {\n  font-weight: 600;\n  font-size: 24px;\n  line-height: 1.25em;\n  margin: 2rem 0 1.5rem 0;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.1);\n  padding-bottom: 1rem;\n}\n\n@media(min-width: 1024px) {\n  d-article h2 {\n    font-size: 36px;\n  }\n}\n\n/* H3 */\n\nd-article h3 {\n  font-weight: 700;\n  font-size: 18px;\n  line-height: 1.4em;\n  margin-bottom: 1em;\n  margin-top: 2em;\n}\n\n@media(min-width: 1024px) {\n  d-article h3 {\n    font-size: 20px;\n  }\n}\n\n/* H4 */\n\nd-article h4 {\n  font-weight: 600;\n  text-transform: uppercase;\n  font-size: 14px;\n  line-height: 1.4em;\n}\n\nd-article a {\n  color: inherit;\n}\n\nd-article p,\nd-article ul,\nd-article ol,\nd-article blockquote {\n  margin-top: 0;\n  margin-bottom: 1em;\n  margin-left: 0;\n  margin-right: 0;\n}\n\nd-article blockquote {\n  border-left: 2px solid rgba(0, 0, 0, 0.2);\n  padding-left: 2em;\n  font-style: italic;\n  color: rgba(0, 0, 0, 0.6);\n}\n\nd-article a {\n  border-bottom: 1px solid var(--global-underline-color);\n  text-decoration: none;\n}\n\nd-article a:hover {\n  border-bottom: 1px solid rgba(0, 0, 0, 0.8);\n}\n\nd-article .link {\n  text-decoration: underline;\n  cursor: pointer;\n}\n\nd-article ul,\nd-article ol {\n  padding-left: 24px;\n}\n\nd-article li {\n  margin-bottom: 1em;\n  margin-left: 0;\n  padding-left: 0;\n}\n\nd-article li:last-child {\n  margin-bottom: 0;\n}\n\nd-article pre {\n  font-size: 14px;\n  margin-bottom: 20px;\n}\n\nd-article hr {\n  grid-column: screen;\n  width: 100%;\n  border: none;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.1);\n  margin-top: 60px;\n  margin-bottom: 60px;\n}\n\nd-article section {\n  margin-top: 60px;\n  margin-bottom: 60px;\n}\n\nd-article span.equation-mimic {\n  font-family: georgia;\n  font-size: 115%;\n  font-style: italic;\n}\n\nd-article > d-code,\nd-article section > d-code  {\n  display: block;\n}\n\nd-article > d-math[block],\nd-article section > d-math[block]  {\n  display: block;\n}\n\n@media (max-width: 768px) {\n  d-article > d-code,\n  d-article section > d-code,\n  d-article > d-math[block],\n  d-article section > d-math[block] {\n      overflow-x: scroll;\n      -ms-overflow-style: none;  // IE 10+\n      overflow: -moz-scrollbars-none;  // Firefox\n  }\n\n  d-article > d-code::-webkit-scrollbar,\n  d-article section > d-code::-webkit-scrollbar,\n  d-article > d-math[block]::-webkit-scrollbar,\n  d-article section > d-math[block]::-webkit-scrollbar {\n    display: none;  // Safari and Chrome\n  }\n}\n\nd-article .citation {\n  color: #668;\n  cursor: pointer;\n}\n\nd-include {\n  width: auto;\n  display: block;\n}\n\nd-figure {\n  contain: layout style;\n}\n\n/* KaTeX */\n\n.katex, .katex-prerendered {\n  contain: style;\n  display: inline-block;\n}\n\n/* Tables */\n\nd-article table {\n  border-collapse: collapse;\n  margin-bottom: 1.5rem;\n  border-bottom: 1px solid rgba(0, 0, 0, 0.2);\n}\n\nd-article table th {\n  border-bottom: 1px solid rgba(0, 0, 0, 0.2);\n}\n\nd-article table td {\n  border-bottom: 1px solid rgba(0, 0, 0, 0.05);\n}\n\nd-article table tr:last-of-type td {\n  border-bottom: none;\n}\n\nd-article table th,\nd-article table td {\n  font-size: 15px;\n  padding: 2px 8px;\n}\n\nd-article table tbody :first-child td {\n  padding-top: 2px;\n}\n';

  var title =
    '/*\n * Copyright 2018 The Distill Template Authors\n *\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      http://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n */\n\nd-title {\n  padding: 2rem 0 1.5rem;\n  contain: layout style;\n  overflow-x: hidden;\n}\n\n@media(min-width: 768px) {\n  d-title {\n    padding: 4rem 0 1.5rem;\n  }\n}\n\nd-title h1 {\n  grid-column: text;\n  font-size: 40px;\n  font-weight: 700;\n  line-height: 1.1em;\n  margin: 0 0 0.5rem;\n}\n\n@media(min-width: 768px) {\n  d-title h1 {\n    font-size: 50px;\n  }\n}\n\nd-title p {\n  font-weight: 300;\n  font-size: 1.2rem;\n  line-height: 1.55em;\n  grid-column: text;\n}\n\nd-title .status {\n  margin-top: 0px;\n  font-size: 12px;\n  color: #009688;\n  opacity: 0.8;\n  grid-column: kicker;\n}\n\nd-title .status span {\n  line-height: 1;\n  display: inline-block;\n  padding: 6px 0;\n  border-bottom: 1px solid #80cbc4;\n  font-size: 11px;\n  text-transform: uppercase;\n}\n';

  // Copyright 2018 The Distill Template Authors

  const styles = base + layout + title + byline + article + math + print;

  function makeStyleTag(dom) {
    const styleTagId = "distill-prerendered-styles";
    const prerenderedTag = dom.getElementById(styleTagId);
    if (!prerenderedTag) {
      const styleTag = dom.createElement("style");
      styleTag.id = styleTagId;
      styleTag.type = "text/css";
      const cssTextTag = dom.createTextNode(styles);
      styleTag.appendChild(cssTextTag);
      const firstScriptTag = dom.head.querySelector("script");
      dom.head.insertBefore(styleTag, firstScriptTag);
    }
  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  function addPolyfill(polyfill, polyfillLoadedCallback) {
    console.debug("Runlevel 0: Polyfill required: " + polyfill.name);
    const script = document.createElement("script");
    script.src = polyfill.url;
    script.async = false;
    if (polyfillLoadedCallback) {
      script.onload = function () {
        polyfillLoadedCallback(polyfill);
      };
    }
    script.onerror = function () {
      new Error("Runlevel 0: Polyfills failed to load script " + polyfill.name);
    };
    document.head.appendChild(script);
  }

  const polyfills = [
    {
      name: "WebComponents",
      support: function () {
        return (
          "customElements" in window &&
          "attachShadow" in Element.prototype &&
          "getRootNode" in Element.prototype &&
          "content" in document.createElement("template") &&
          "Promise" in window &&
          "from" in Array
        );
      },
      url: "https://distill.pub/third-party/polyfills/webcomponents-lite.js",
    },
    {
      name: "IntersectionObserver",
      support: function () {
        return "IntersectionObserver" in window && "IntersectionObserverEntry" in window;
      },
      url: "https://distill.pub/third-party/polyfills/intersection-observer.js",
    },
  ];

  class Polyfills {
    static browserSupportsAllFeatures() {
      return polyfills.every((poly) => poly.support());
    }

    static load(callback) {
      // Define an intermediate callback that checks if all is loaded.
      const polyfillLoaded = function (polyfill) {
        polyfill.loaded = true;
        console.debug("Runlevel 0: Polyfill has finished loading: " + polyfill.name);
        // console.debug(window[polyfill.name]);
        if (Polyfills.neededPolyfills.every((poly) => poly.loaded)) {
          console.debug("Runlevel 0: All required polyfills have finished loading.");
          console.debug("Runlevel 0->1.");
          window.distillRunlevel = 1;
          callback();
        }
      };
      // Add polyfill script tags
      for (const polyfill of Polyfills.neededPolyfills) {
        addPolyfill(polyfill, polyfillLoaded);
      }
    }

    static get neededPolyfills() {
      if (!Polyfills._neededPolyfills) {
        Polyfills._neededPolyfills = polyfills.filter((poly) => !poly.support());
      }
      return Polyfills._neededPolyfills;
    }
  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  // const marginSmall = 16;
  // const marginLarge = 3 * marginSmall;
  // const margin = marginSmall + marginLarge;
  // const gutter = marginSmall;
  // const outsetAmount = margin / 2;
  // const numCols = 4;
  // const numGutters = numCols - 1;
  // const columnWidth = (768 - 2 * marginLarge - numGutters * gutter) / numCols;
  //
  // const screenwidth = 768;
  // const pageWidth = screenwidth - 2 * marginLarge;
  // const bodyWidth = pageWidth - columnWidth - gutter;

  function body(selector) {
    return `${selector} {
      grid-column: left / text;
    }
  `;
  }

  // Copyright 2018 The Distill Template Authors

  const T$1 = Template(
    "d-abstract",
    `
<style>
  :host {
    font-size: 1.25rem;
    line-height: 1.6em;
    color: rgba(0, 0, 0, 0.7);
    -webkit-font-smoothing: antialiased;
  }

  ::slotted(p) {
    margin-top: 0;
    margin-bottom: 1em;
    grid-column: text-start / middle-end;
  }
  ${body("d-abstract")}
</style>

<slot></slot>
`
  );

  class Abstract extends T$1(HTMLElement) { }

  // Copyright 2018 The Distill Template Authors

  const T$2 = Template(
    "d-appendix",
    `
<style>

d-appendix {
  contain: layout style;
  font-size: 0.8em;
  line-height: 1.7em;
  margin-top: 60px;
  margin-bottom: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  color: rgba(0,0,0,0.5);
  padding-top: 60px;
  padding-bottom: 48px;
}

d-appendix h3 {
  grid-column: page-start / text-start;
  font-size: 15px;
  font-weight: 500;
  margin-top: 1em;
  margin-bottom: 0;
  color: rgba(0,0,0,0.65);
}

d-appendix h3 + * {
  margin-top: 1em;
}

d-appendix ol {
  padding: 0 0 0 15px;
}

@media (min-width: 768px) {
  d-appendix ol {
    padding: 0 0 0 30px;
    margin-left: -30px;
  }
}

d-appendix li {
  margin-bottom: 1em;
}

d-appendix a {
  color: rgba(0, 0, 0, 0.6);
}

d-appendix > * {
  grid-column: text;
}

d-appendix > d-footnote-list,
d-appendix > d-citation-list,
d-appendix > distill-appendix {
  grid-column: screen;
}

</style>

`,
    false
  );

  class Appendix extends T$2(HTMLElement) { }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  // import { Template } from '../mixins/template';
  // import { Controller } from '../controller';

  const isOnlyWhitespace = /^\s*$/;

  class Article extends HTMLElement {
    static get is() {
      return "d-article";
    }

    constructor() {
      super();

      new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const addedNode of mutation.addedNodes) {
            switch (addedNode.nodeName) {
              case "#text":
                {
                  // usually text nodes are only linebreaks.
                  const text = addedNode.nodeValue;
                  if (!isOnlyWhitespace.test(text)) {
                    console.warn(
                      "Use of unwrapped text in distill articles is discouraged as it breaks layout! Please wrap any text in a <span> or <p> tag. We found the following text: " +
                      text
                    );
                    const wrapper = document.createElement("span");
                    wrapper.innerHTML = addedNode.nodeValue;
                    addedNode.parentNode.insertBefore(wrapper, addedNode);
                    addedNode.parentNode.removeChild(addedNode);
                  }
                }
                break;
            }
          }
        }
      }).observe(this, { childList: true });
    }
  }

  var commonjsGlobal =
    typeof globalThis !== "undefined"
      ? globalThis
      : typeof window !== "undefined"
        ? window
        : typeof global !== "undefined"
          ? global
          : typeof self !== "undefined"
            ? self
            : {};

  function createCommonjsModule(fn, module) {
    return (module = { exports: {} }), fn(module, module.exports), module.exports;
  }

  // Copyright 2018 The Distill Template Authors

  function normalizeTag(string) {
    return string
      .replace(/[\t\n ]+/g, " ")
      .replace(/{\\["^`.'acu~Hvs]( )?([a-zA-Z])}/g, (full, x, char) => char)
      .replace(/{\\([a-zA-Z])}/g, (full, char) => char);
  }

  function parseBibtex(bibtex) {
    const bibliography = new Map();

    // Check if the library is loaded correctly on the window object
    // Use bracket notation because of the hyphen in 'bibtex-parse'
    if (typeof window['bibtex-parse'] === 'undefined' || typeof window['bibtex-parse'].entries !== 'function') {
      console.error("The bibtex-parse library (from the UMD script) was not found or is missing the 'entries' function. Ensure it's loaded *before* template.v2.js.");
      return bibliography; // Return empty map
    }

    if (!bibtex || typeof bibtex !== 'string' || bibtex.trim() === '') {
      // console.warn("parseBibtex received empty or invalid input:", bibtex);
      return bibliography; // Return empty map if input is bad or empty
    }

    try {
      // *** Use the global object with bracket notation and call its 'entries' method ***
      const parsedEntries = window['bibtex-parse'].entries(bibtex);

      // console.log("[parseBibtex] Raw parsed entries:", parsedEntries); // For debugging

      for (const entry of parsedEntries) {
        // The structure from *this specific parser version* looks like:
        // { key: 'citationKey', type: 'article', AUTHOR: '...', TITLE: '...', ... }
        // Note the uppercase field names directly on the entry object.

        const citationKey = entry.key;
        if (!citationKey) {
          console.warn("[parseBibtex] Parsed BibTeX entry missing citation key:", entry);
          continue; // Skip entries without a key
        }

        const entryData = {};

        // 1. Add the type (lowercase)
        entryData.type = entry.type ? entry.type.toLowerCase() : 'misc';

        // 2. Iterate over all properties of the parsed entry object
        for (const fieldKey in entry) {
          // Skip 'key' and 'type' as we handled them already, and internal properties
          if (entry.hasOwnProperty(fieldKey) && fieldKey !== 'key' && fieldKey !== 'type') {
            const fieldValue = entry[fieldKey];
            // Convert the original BibTeX field key (like AUTHOR) to lowercase (like author)
            const lowerCaseKey = fieldKey.toLowerCase();
            // Normalize the value if it's a string
            const normalizedValue = typeof fieldValue === 'string' ? normalizeTag(fieldValue) : fieldValue;
            entryData[lowerCaseKey] = normalizedValue;
          }
        }

        // Add the processed entry (with lowercase keys) to the bibliography Map
        bibliography.set(citationKey, entryData);
      }
    } catch (error) {
      // Catch parsing errors specifically
      if (error && error.name === 'SyntaxError' && typeof error.format === 'function') {
        // PEG.js SyntaxError provides detailed location info
        console.error(`[parseBibtex] BibTeX Syntax Error: ${error.message} at line ${error.location.start.line}, column ${error.location.start.column}`);
      } else {
        // Other potential errors
        console.error("[parseBibtex] Error processing BibTeX content:", error);
      }
      console.error("[parseBibtex] BibTeX content that failed parsing:\n---\n", bibtex, "\n---");
    }

    // console.log("[parseBibtex] Final bibliography Map:", bibliography); // For debugging
    return bibliography;
  }

  function serializeFrontmatterToBibtex(frontMatter) {
    return `@article{${frontMatter.slug},
  author = {${frontMatter.bibtexAuthors}},
  title = {${frontMatter.title}},
  journal = {${frontMatter.journal.title}},
  year = {${frontMatter.publishedYear}},
  note = {${frontMatter.url}},
  doi = {${frontMatter.doi}}
}`;
  }

  // Copyright 2018 The Distill Template Authors

  class Bibliography extends HTMLElement {
    static get is() {
      return "d-bibliography";
    }

    constructor() {
      super();
      this.bibtex = null; // Initialize bibtex state

      // set up mutation observer
      const options = {
        childList: true,
        characterData: true,
        subtree: true,
      };
      const observer = new MutationObserver((entries) => {
        for (const entry of entries) {
          // More robust check for script changes
          let target = entry.target;
          if (target.nodeType === Node.TEXT_NODE) {
            target = target.parentElement;
          }
          if (target && target.nodeName === "SCRIPT" && (target.type === "text/bibtex" || target.type === "text/json")) {
            this.parseIfPossible();
            break; // Only parse once
          } else if (entry.type === "characterData" && entry.target.parentElement && entry.target.parentElement.nodeName === 'SCRIPT') {
            // Handle direct text changes within the script tag
            this.parseIfPossible();
            break; // Only parse once
          }
        }
      });
      observer.observe(this, options);
    }

    connectedCallback() {
      // Use requestAnimationFrame to ensure the DOM is ready, especially if using 'src'
      requestAnimationFrame(() => {
        // If src attribute is present, attributeChangedCallback will handle it.
        // Otherwise, parse inline content.
        if (!this.hasAttribute('src')) {
          this.parseIfPossible();
        }
      });
    }


    parseIfPossible() {
      const scriptTag = this.querySelector("script");
      if (!scriptTag) {
        // console.log("d-bibliography: No script tag found to parse.");
        return;
      }

      if (scriptTag.type === "text/bibtex") {
        const newBibtex = scriptTag.textContent;
        // Only parse if the content has actually changed or hasn't been parsed yet
        if (this.bibtex !== newBibtex) {
          // console.log("d-bibliography: Parsing BibTeX content...");
          this.bibtex = newBibtex; // Store the parsed content
          const bibliography = parseBibtex(this.bibtex); // <<< USES CORRECTED FUNCTION
          // console.log("d-bibliography: Parsed BibTeX, got Map:", bibliography);
          if (bibliography instanceof Map) { // Ensure it's a Map before notifying
            this.notify(bibliography);
          } else {
            console.error("d-bibliography: parseBibtex did not return a Map.");
          }
        }
      } else if (scriptTag.type === "text/json") {
        // Similar check for JSON could be added if needed
        try {
          const newJson = scriptTag.textContent;
          // Basic check if JSON content changes (can be improved)
          if (this.jsonContent !== newJson) {
            this.jsonContent = newJson;
            // console.log("d-bibliography: Parsing JSON content...");
            const bibliography = new Map(JSON.parse(newJson));
            // console.log("d-bibliography: Parsed JSON, got Map:", bibliography);
            this.notify(bibliography);
          }
        } catch (e) {
          console.error("d-bibliography: Failed to parse JSON bibliography:", e);
        }
      } else {
        console.warn("d-bibliography: Unsupported script tag type: " + scriptTag.type);
      }
    }

    notify(bibliography) {
      if (!(bibliography instanceof Map)) {
        console.error("d-bibliography: Attempted to notify with non-Map data:", bibliography);
        return;
      }
      // console.log("d-bibliography: Notifying with bibliography Map:", bibliography);
      const options = { detail: bibliography, bubbles: true };
      const event = new CustomEvent("onBibliographyChanged", options);
      // Dispatch from the component itself, document listeners will catch it due to bubbles: true
      this.dispatchEvent(event);
    }


    /* observe 'src' attribute */
    static get observedAttributes() {
      return ["src"];
    }

    receivedBibtex(event) {
      if (event.target.status >= 200 && event.target.status < 300) {
        const bibtexContent = event.target.response;
        this.bibtex = bibtexContent; // Update stored bibtex
        // console.log("d-bibliography: Received BibTeX from src:", bibtexContent);
        const bibliography = parseBibtex(bibtexContent); // <<< USES CORRECTED FUNCTION
        // console.log("d-bibliography: Parsed BibTeX from src, got Map:", bibliography);
        if (bibliography instanceof Map) { // Ensure it's a Map before notifying
          this.notify(bibliography);
        } else {
          console.error("d-bibliography: parseBibtex from src did not return a Map.");
        }
      } else {
        console.warn(`d-bibliography: Failed to load Bibtex from ${event.target.responseURL}. Status: ${event.target.status}`);
        this.notify(new Map()); // Notify with empty map on failure
      }
    }


    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "src" && oldValue !== newValue && newValue) {
        // console.log(`d-bibliography: src attribute changed to ${newValue}. Fetching...`);
        var oReq = new XMLHttpRequest();
        oReq.onload = (e) => this.receivedBibtex(e);
        oReq.onerror = () => {
          console.warn(`d-bibliography: Could not load Bibtex! Network error when trying ${newValue}`);
          this.notify(new Map()); // Notify with empty map on failure
        };
        oReq.responseType = "text";
        oReq.open("GET", newValue, true);
        oReq.send();
      }
    }
  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  // import style from '../styles/d-byline.css';

  function bylineTemplate(frontMatter) {
    const half = Math.ceil(frontMatter.authors.length / 2);
    return `
    <div class="byline grid">
      <div class="authors-affiliations grid">
        <h3 style="grid-column: 1; grid-row: 1;">Authors</h3>
        <h3></h3>
        <h3>Affiliation</h3>
        ${frontMatter.authors.map((author, index) => `
          <p class="author" style="grid-column: ${Math.ceil((index + 1) / half)}; grid-row: ${index % half + 2};">
            ${author.personalURL ? `
              <a class="name" href="${author.personalURL}">${author.name}</a>` : `
              <span class="name">${author.name}</span>`}
          </p>
        <p class="affiliation" style="grid-column: 3; grid-row: ${index % half + 2};">
        ${author.affiliations.map(affiliation =>
      affiliation.url ? `<a class="affiliation" href="${affiliation.url}">${affiliation.name}</a>` : `<span class="affiliation">${affiliation.name}</span>`
    ).join(', ')}
        </p>
        `).join('')}
      </div>
      <div>
        <h3>Published</h3>
        ${frontMatter.publishedDate ? `
          <p>${frontMatter.publishedMonth} ${frontMatter.publishedDay}, ${frontMatter.publishedYear}</p> ` : `
          <p><em>Not published yet.</em></p>`}
      </div>
    </div>
  `;
  }

  class Byline extends HTMLElement {
    static get is() {
      return "d-byline";
    }

    set frontMatter(frontMatter) {
      this.innerHTML = bylineTemplate(frontMatter);
    }
  }

  // Copyright 2018 The Distill Template Authors

  const T$3 = Template(
    "d-cite",
    `
<style>

:host {
  display: inline-block;
}

.citation {
  color: #007bff;
}

.citation-number {
  cursor: default;
  white-space: nowrap;
  font-family: -apple-system, BlinkMacSystemFont, "Roboto", Helvetica, sans-serif;
  font-size: 75%;
  color: #007bff;
  display: inline-block;
  line-height: 1.1em;
  text-align: center;
  position: relative;
  top: -2px;
  margin: 0 2px;
}

d-hover-box ul {
  color: black;
}

figcaption .citation-number {
  font-size: 11px;
  font-weight: normal;
  top: -2px;
  line-height: 1em;
}

ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

ul li {
  padding: 15px 10px 15px 10px;
  border-bottom: 1px solid rgba(0,0,0,0.1)
}

ul li:last-of-type {
  border-bottom: none;
}

</style>

<d-hover-box id="hover-box"></d-hover-box>

<div id="citation-" class="citation">
  <span class="citation-number"></span>
</div>
`
  );

  class Cite extends T$3(HTMLElement) {
    /* Lifecycle */
    constructor() {
      super();
      this._numbers = [];
      this._entries = [];
    }

    connectedCallback() {
      this.outerSpan = this.root.querySelector("#citation-");
      this.innerSpan = this.root.querySelector(".citation-number");
      this.hoverBox = this.root.querySelector("d-hover-box");
      window.customElements.whenDefined("d-hover-box").then(() => {
        this.hoverBox.listen(this);
      });
      // in case this component got connected after values were set
      if (this.numbers) {
        this.displayNumbers(this.numbers);
      }
      if (this.entries) {
        this.displayEntries(this.entries);
      }
    }

    //TODO This causes an infinite loop on firefox with polyfills.
    // This is only needed for interactive editing so no priority.
    // disconnectedCallback() {
    // const options = { detail: [this, this.keys], bubbles: true };
    // const event = new CustomEvent('onCiteKeyRemoved', options);
    // document.dispatchEvent(event);
    // }

    /* observe 'key' attribute */

    static get observedAttributes() {
      return ["key", "bibtex-key"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      const eventName = oldValue ? "onCiteKeyChanged" : "onCiteKeyCreated";
      const keys = newValue.split(",").map((k) => k.trim());
      const options = { detail: [this, keys], bubbles: true };
      const event = new CustomEvent(eventName, options);
      document.dispatchEvent(event);
    }

    set key(value) {
      this.setAttribute("key", value);
    }

    get key() {
      return this.getAttribute("key") || this.getAttribute("bibtex-key");
    }

    get keys() {
      const result = this.key.split(",");
      console.log(result);
      return result;
    }

    /* Setters & Rendering */

    set numbers(numbers) {
      this._numbers = numbers;
      this.displayNumbers(numbers);
    }

    get numbers() {
      return this._numbers;
    }

    displayNumbers(numbers) {
      if (!this.innerSpan) return;
      const numberStrings = numbers.map((index) => {
        return index == -1 ? "?" : index + 1 + "";
      });
      const textContent = "[" + numberStrings.join(", ") + "]";
      this.innerSpan.textContent = textContent;
    }

    set entries(entries) {
      this._entries = entries;
      this.displayEntries(entries);
    }

    get entries() {
      return this._entries;
    }

    displayEntries(entries) {
      if (!this.hoverBox) return;
      this.hoverBox.innerHTML = `<ul>
      ${entries
          .map(hover_cite)
          .map((html) => `<li>${html}</li>`)
          .join("\n")}
    </ul>`;
    }
  }

  // Copyright 2018 The Distill Template Authors

  const styles$1 = `
d-citation-list {
  contain: style;
}

d-citation-list .references {
  grid-column: text;
}

d-citation-list .references .title {
  font-weight: 500;
}
`;

  function renderCitationList(element, entries, dom = document) {
    if (entries.size > 0) {
      element.style.display = "";
      let list = element.querySelector(".references");
      if (list) {
        list.innerHTML = "";
      } else {
        const stylesTag = dom.createElement("style");
        stylesTag.innerHTML = styles$1;
        element.appendChild(stylesTag);

        const heading = dom.createElement("h3");
        heading.id = "references";
        heading.textContent = "References";
        element.appendChild(heading);

        list = dom.createElement("ol");
        list.id = "references-list";
        list.className = "references";
        element.appendChild(list);
      }

      for (const [key, entry] of entries) {
        const listItem = dom.createElement("li");
        listItem.id = key;
        listItem.innerHTML = bibliography_cite(entry);
        list.appendChild(listItem);
      }
    } else {
      element.style.display = "none";
    }
  }

  class CitationList extends HTMLElement {
    static get is() {
      return "d-citation-list";
    }

    connectedCallback() {
      if (!this.hasAttribute("distill-prerendered")) {
        this.style.display = "none";
      }
    }

    set citations(citations) {
      renderCitationList(this, citations);
    }
  }

  // Copyright 2018 The Distill Template Authors

  const T$5 = Template(
    "d-footnote",
    `
<style>

d-math[block] {
  display: block;
}

:host {

}

sup {
  line-height: 1em;
  font-size: 0.75em;
  position: relative;
  top: -.5em;
  vertical-align: baseline;
}

span {
  color: #007bff;
  cursor: default;
}

.footnote-container {
  padding: 10px;
}

</style>

<d-hover-box>
  <div class="footnote-container">
    <slot id="slot"></slot>
  </div>
</d-hover-box>

<sup>
  <span id="fn-" data-hover-ref=""></span>
</sup>

`
  );

  class Footnote extends T$5(HTMLElement) {
    constructor() {
      super();

      const options = {
        childList: true,
        characterData: true,
        subtree: true,
      };
      const observer = new MutationObserver(this.notify);
      observer.observe(this, options);
    }

    notify() {
      const options = { detail: this, bubbles: true };
      const event = new CustomEvent("onFootnoteChanged", options);
      document.dispatchEvent(event);
    }

    connectedCallback() {
      // listen and notify about changes to slotted content
      // const slot = this.shadowRoot.querySelector('#slot');
      // console.warn(slot.textContent);
      // slot.addEventListener('slotchange', this.notify);
      this.hoverBox = this.root.querySelector("d-hover-box");
      window.customElements.whenDefined("d-hover-box").then(() => {
        this.hoverBox.listen(this);
      });
      // create numeric ID
      Footnote.currentFootnoteId += 1;
      const IdString = Footnote.currentFootnoteId.toString();
      this.root.host.id = "d-footnote-" + IdString;

      // set up hidden hover box
      const id = "dt-fn-hover-box-" + IdString;
      this.hoverBox.id = id;

      // set up visible footnote marker
      const span = this.root.querySelector("#fn-");
      span.setAttribute("id", "fn-" + IdString);
      span.setAttribute("data-hover-ref", id);
      span.textContent = IdString;
    }
  }

  Footnote.currentFootnoteId = 0;

  // Copyright 2018 The Distill Template Authors

  const T$6 = Template(
    "d-footnote-list",
    `
<style>

d-footnote-list {
  contain: layout style;
}

d-footnote-list > * {
  grid-column: text;
}

d-footnote-list a.footnote-backlink {
  color: rgba(0,0,0,0.3);
  padding-left: 0.5em;
}

</style>

<h3>Footnotes</h3>
<ol></ol>
`,
    false
  );

  class FootnoteList extends T$6(HTMLElement) {
    connectedCallback() {
      super.connectedCallback();

      this.list = this.root.querySelector("ol");
      // footnotes list is initially hidden
      this.root.style.display = "none";
      // look through document and register existing footnotes
      // Store.subscribeTo('footnotes', (footnote) => {
      //   this.renderFootnote(footnote);
      // });
    }

    // TODO: could optimize this to accept individual footnotes?
    set footnotes(footnotes) {
      this.list.innerHTML = "";
      if (footnotes.length) {
        // ensure footnote list is visible
        this.root.style.display = "";

        for (const footnote of footnotes) {
          // construct and append list item to show footnote
          const listItem = document.createElement("li");
          listItem.id = footnote.id + "-listing";
          listItem.innerHTML = footnote.innerHTML;

          const backlink = document.createElement("a");
          backlink.setAttribute("class", "footnote-backlink");
          backlink.textContent = "[↩]";
          backlink.href = "#" + footnote.id;

          listItem.appendChild(backlink);
          this.list.appendChild(listItem);
        }
      } else {
        // ensure footnote list is invisible
        this.root.style.display = "none";
      }
    }
  }

  // Copyright 2018 The Distill Template Authors

  const T$7 = Template(
    "d-hover-box",
    `
<style>

:host {
  position: absolute;
  width: 100%;
  left: 0px;
  z-index: 10000;
  display: none;
  white-space: normal
}

.container {
  position: relative;
  width: 704px;
  max-width: 100vw;
  margin: 0 auto;
}

.panel {
  position: absolute;
  font-size: 1rem;
  line-height: 1.5em;
  top: 0;
  left: 0;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: rgba(250, 250, 250, 0.95);
  box-shadow: 0 0 7px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  box-sizing: border-box;

  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

</style>

<div class="container">
  <div class="panel">
    <slot></slot>
  </div>
</div>
`
  );

  class HoverBox extends T$7(HTMLElement) {
    constructor() {
      super();
    }

    connectedCallback() { }

    listen(element) {
      // console.log(element)
      this.bindDivEvents(this);
      this.bindTriggerEvents(element);
      // this.style.display = "block";
    }

    bindDivEvents(element) {
      // For mice, same behavior as hovering on links
      element.addEventListener("mouseover", () => {
        if (!this.visible) this.showAtNode(element);
        this.stopTimeout();
      });
      element.addEventListener("mouseout", () => {
        this.extendTimeout(500);
      });
      // Don't trigger body touchstart event when touching within box
      element.addEventListener(
        "touchstart",
        (event) => {
          event.stopPropagation();
        },
        { passive: true }
      );
      // Close box when touching outside box
      document.body.addEventListener(
        "touchstart",
        () => {
          this.hide();
        },
        { passive: true }
      );
    }

    bindTriggerEvents(node) {
      node.addEventListener("mouseover", () => {
        if (!this.visible) {
          this.showAtNode(node);
        }
        this.stopTimeout();
      });

      node.addEventListener("mouseout", () => {
        this.extendTimeout(300);
      });

      node.addEventListener(
        "touchstart",
        (event) => {
          if (this.visible) {
            this.hide();
          } else {
            this.showAtNode(node);
          }
          // Don't trigger body touchstart event when touching link
          event.stopPropagation();
        },
        { passive: true }
      );
    }

    show(position) {
      this.visible = true;
      this.style.display = "block";
      // 10px extra offset from element
      this.style.top = Math.round(position[1] + 10) + "px";
    }

    showAtNode(node) {
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop
      const bbox = node.getBoundingClientRect();
      this.show([node.offsetLeft + bbox.width, node.offsetTop + bbox.height]);
    }

    hide() {
      this.visible = false;
      this.style.display = "none";
      this.stopTimeout();
    }

    stopTimeout() {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
    }

    extendTimeout(time) {
      this.stopTimeout();
      this.timeout = setTimeout(() => {
        this.hide();
      }, time);
    }
  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  class Title extends HTMLElement {
    static get is() {
      return "d-title";
    }
  }

  // Copyright 2018 The Distill Template Authors

  const T$8 = Template(
    "d-references",
    `
<style>
d-references {
  display: block;
}
</style>
`,
    false
  );

  class References extends T$8(HTMLElement) { }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  class TOC extends HTMLElement {
    static get is() {
      return "d-toc";
    }

    connectedCallback() {
      if (!this.getAttribute("prerendered")) {
        window.onload = () => {
          const article = document.querySelector("d-article");
          const headings = article.querySelectorAll("h2, h3");
          renderTOC(this, headings);
        };
      }
    }
  }

  function renderTOC(element, headings) {
    let ToC = `
  <style>

  d-toc {
    contain: layout style;
    display: block;
  }

  d-toc ul {
    padding-left: 0;
  }

  d-toc ul > ul {
    padding-left: 24px;
  }

  d-toc a {
    border-bottom: none;
    text-decoration: none;
  }

  </style>
  <nav role="navigation" class="table-of-contents"></nav>
  <h2>Table of contents</h2>
  <ul>`;

    for (const el of headings) {
      // should element be included in TOC?
      const isInTitle = el.parentElement.tagName == "D-TITLE";
      const isException = el.getAttribute("no-toc");
      if (isInTitle || isException) continue;
      // create TOC entry
      const title = el.textContent;
      const link = "#" + el.getAttribute("id");

      let newLine = "<li>" + '<a href="' + link + '">' + title + "</a>" + "</li>";
      if (el.tagName == "H3") {
        newLine = "<ul>" + newLine + "</ul>";
      } else {
        newLine += "<br>";
      }
      ToC += newLine;
    }

    ToC += "</ul></nav>";
    element.innerHTML = ToC;
  }

  // Copyright 2018 The Distill Template Authors
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  //      http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  // Figure
  //
  // d-figure provides a state-machine of visibility events:
  //
  //                         scroll out of view
  //                         +----------------+
  //   *do work here*        |                |
  // +----------------+    +-+---------+    +-v---------+
  // | ready          +----> onscreen  |    | offscreen |
  // +----------------+    +---------^-+    +---------+-+
  //                                 |                |
  //                                 +----------------+
  //                                  scroll into view
  //

  class Figure extends HTMLElement {
    static get is() {
      return "d-figure";
    }

    static get readyQueue() {
      if (!Figure._readyQueue) {
        Figure._readyQueue = [];
      }
      return Figure._readyQueue;
    }

    static addToReadyQueue(figure) {
      if (Figure.readyQueue.indexOf(figure) === -1) {
        Figure.readyQueue.push(figure);
        Figure.runReadyQueue();
      }
    }

    static runReadyQueue() {
      // console.log("Checking to run readyQueue, length: " + Figure.readyQueue.length + ", scrolling: " + Figure.isScrolling);
      // if (Figure.isScrolling) return;
      // console.log("Running ready Queue");
      const figure = Figure.readyQueue
        .sort((a, b) => a._seenOnScreen - b._seenOnScreen)
        .filter((figure) => !figure._ready)
        .pop();
      if (figure) {
        figure.ready();
        requestAnimationFrame(Figure.runReadyQueue);
      }
    }

    constructor() {
      super();
      // debugger
      this._ready = false;
      this._onscreen = false;
      this._offscreen = true;
    }

    connectedCallback() {
      this.loadsWhileScrolling = this.hasAttribute("loadsWhileScrolling");
      Figure.marginObserver.observe(this);
      Figure.directObserver.observe(this);
    }

    disconnectedCallback() {
      Figure.marginObserver.unobserve(this);
      Figure.directObserver.unobserve(this);
    }

    // We use two separate observers:
    // One with an extra 1000px margin to warn if the viewpoint gets close,
    // And one for the actual on/off screen events

    static get marginObserver() {
      if (!Figure._marginObserver) {
        // if (!('IntersectionObserver' in window)) {
        //   throw new Error('no interscetionobbserver!');
        // }
        const viewportHeight = window.innerHeight;
        const margin = Math.floor(2 * viewportHeight);
        const options = {
          rootMargin: margin + "px 0px " + margin + "px 0px",
          threshold: 0.01,
        };
        const callback = Figure.didObserveMarginIntersection;
        const observer = new IntersectionObserver(callback, options);
        Figure._marginObserver = observer;
      }
      return Figure._marginObserver;
    }

    static didObserveMarginIntersection(entries) {
      for (const entry of entries) {
        const figure = entry.target;
        if (entry.isIntersecting && !figure._ready) {
          Figure.addToReadyQueue(figure);
        }
      }
    }

    static get directObserver() {
      if (!Figure._directObserver) {
        Figure._directObserver = new IntersectionObserver(Figure.didObserveDirectIntersection, {
          rootMargin: "0px",
          threshold: [0, 1.0],
        });
      }
      return Figure._directObserver;
    }

    static didObserveDirectIntersection(entries) {
      for (const entry of entries) {
        const figure = entry.target;
        if (entry.isIntersecting) {
          figure._seenOnScreen = new Date();
          // if (!figure._ready) { figure.ready(); }
          if (figure._offscreen) {
            figure.onscreen();
          }
        } else {
          if (figure._onscreen) {
            figure.offscreen();
          }
        }
      }
    }

    // Notify listeners that registered late, too:

    addEventListener(eventName, callback) {
      super.addEventListener(eventName, callback);
      // if we had already dispatched something while presumingly no one was listening, we do so again
      // debugger
      if (eventName === "ready") {
        if (Figure.readyQueue.indexOf(this) !== -1) {
          this._ready = false;
          Figure.runReadyQueue();
        }
      }
      if (eventName === "onscreen") {
        this.onscreen();
      }
    }

    // Custom Events

    ready() {
      // debugger
      this._ready = true;
      Figure.marginObserver.unobserve(this);
      const event = new CustomEvent("ready");
      this.dispatchEvent(event);
    }

    onscreen() {
      this._onscreen = true;
      this._offscreen = false;
      const event = new CustomEvent("onscreen");
      this.dispatchEvent(event);
    }

    offscreen() {
      this._onscreen = false;
      this._offscreen = true;
      const event = new CustomEvent("offscreen");
      this.dispatchEvent(event);
    }
  }

  if (typeof window !== "undefined") {
    Figure.isScrolling = false;
    let timeout;
    const resetTimer = () => {
      Figure.isScrolling = true;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        Figure.isScrolling = false;
        Figure.runReadyQueue();
      }, 500);
    };
    window.addEventListener("scroll", resetTimer, true);
  }

  // Copyright 2018 The Distill Template Authors

  // This overlay is not secure.
  // It is only meant as a social deterrent.

  const productionHostname = "distill.pub";
  const T$9 = Template(
    "d-interstitial",
    `
<style>

.overlay {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: white;

  opacity: 1;
  visibility: visible;

  display: flex;
  flex-flow: column;
  justify-content: center;
  z-index: 2147483647 /* MaxInt32 */

}

.container {
  position: relative;
  margin-left: auto;
  margin-right: auto;
  max-width: 420px;
  padding: 2em;
}

h1 {
  text-decoration: underline;
  text-decoration-color: hsl(0,100%,40%);
  -webkit-text-decoration-color: hsl(0,100%,40%);
  margin-bottom: 1em;
  line-height: 1.5em;
}

input[type="password"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  -webkit-border-radius: none;
  -moz-border-radius: none;
  -ms-border-radius: none;
  -o-border-radius: none;
  border-radius: none;
  outline: none;

  font-size: 18px;
  background: none;
  width: 25%;
  padding: 10px;
  border: none;
  border-bottom: solid 2px #999;
  transition: border .3s;
}

input[type="password"]:focus {
  border-bottom: solid 2px #333;
}

input[type="password"].wrong {
  border-bottom: solid 2px hsl(0,100%,40%);
}

p small {
  color: #888;
}

.logo {
  position: relative;
  font-size: 1.5em;
  margin-bottom: 3em;
}

.logo svg {
  width: 36px;
  position: relative;
  top: 6px;
  margin-right: 2px;
}

.logo svg path {
  fill: none;
  stroke: black;
  stroke-width: 2px;
}

</style>

<div class="overlay">
  <div class="container">
    <h1>This article is in review.</h1>
    <p>Do not share this URL or the contents of this article. Thank you!</p>
    <input id="interstitial-password-input" type="password" name="password" autofocus/>
    <p><small>Enter the password we shared with you as part of the review process to view the article.</small></p>
  </div>
</div>
`
  );

  class Interstitial extends T$9(HTMLElement) {
    connectedCallback() {
      if (this.shouldRemoveSelf()) {
        this.parentElement.removeChild(this);
      } else {
        const passwordInput = this.root.querySelector("#interstitial-password-input");
        passwordInput.oninput = (event) => this.passwordChanged(event);
      }
    }

    passwordChanged(event) {
      const entered = event.target.value;
      if (entered === this.password) {
        console.log("Correct password entered.");
        this.parentElement.removeChild(this);
        if (typeof Storage !== "undefined") {
          console.log("Saved that correct password was entered.");
          localStorage.setItem(this.localStorageIdentifier(), "true");
        }
      }
    }

    shouldRemoveSelf() {
      // should never be visible in production
      if (window && window.location.hostname === productionHostname) {
        console.warn("Interstitial found on production, hiding it.");
        return true;
      }
      // should only have to enter password once
      if (typeof Storage !== "undefined") {
        if (localStorage.getItem(this.localStorageIdentifier()) === "true") {
          console.log("Loaded that correct password was entered before; skipping interstitial.");
          return true;
        }
      }
      // otherwise, leave visible
      return false;
    }

    localStorageIdentifier() {
      const prefix = "distill-drafts";
      const suffix = "interstitial-password-correct";
      return prefix + (window ? window.location.pathname : "-") + suffix;
    }
  }

  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function bisector(compare) {
    if (compare.length === 1) compare = ascendingComparator(compare);
    return {
      left: function (a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          var mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      },
      right: function (a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          var mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      },
    };
  }

  function ascendingComparator(f) {
    return function (d, x) {
      return ascending(f(d), x);
    };
  }

  var ascendingBisect = bisector(ascending);
  var bisectRight = ascendingBisect.right;

  function range(start, stop, step) {
    (start = +start), (stop = +stop), (step = (n = arguments.length) < 2 ? ((stop = start), (start = 0), 1) : n < 3 ? 1 : +step);

    var i = -1,
      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
      range = new Array(n);

    while (++i < n) {
      range[i] = start + i * step;
    }

    return range;
  }

  var e10 = Math.sqrt(50),
    e5 = Math.sqrt(10),
    e2 = Math.sqrt(2);

  function ticks(start, stop, count) {
    var reverse,
      i = -1,
      n,
      ticks,
      step;

    (stop = +stop), (start = +start), (count = +count);
    if (start === stop && count > 0) return [start];
    if ((reverse = stop < start)) (n = start), (start = stop), (stop = n);
    if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

    if (step > 0) {
      start = Math.ceil(start / step);
      stop = Math.floor(stop / step);
      ticks = new Array((n = Math.ceil(stop - start + 1)));
      while (++i < n) ticks[i] = (start + i) * step;
    } else {
      start = Math.floor(start * step);
      stop = Math.ceil(stop * step);
      ticks = new Array((n = Math.ceil(start - stop + 1)));
      while (++i < n) ticks[i] = (start - i) / step;
    }

    if (reverse) ticks.reverse();

    return ticks;
  }

  function tickIncrement(start, stop, count) {
    var step = (stop - start) / Math.max(0, count),
      power = Math.floor(Math.log(step) / Math.LN10),
      error = step / Math.pow(10, power);
    return power >= 0
      ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
      : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
  }

  function tickStep(start, stop, count) {
    var step0 = Math.abs(stop - start) / Math.max(0, count),
      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
      error = step0 / step1;
    if (error >= e10) step1 *= 10;
    else if (error >= e5) step1 *= 5;
    else if (error >= e2) step1 *= 2;
    return stop < start ? -step1 : step1;
  }

  function initRange(domain, range) {
    switch (arguments.length) {
      case 0:
        break;
      case 1:
        this.range(domain);
        break;
      default:
        this.range(range).domain(domain);
        break;
    }
    return this;
  }

  function define(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }

  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  function Color() { }

  var darker = 0.7;
  var brighter = 1 / darker;

  var reI = "\\s*([+-]?\\d+)\\s*",
    reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
    reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
    reHex = /^#([0-9a-f]{3,8})$/,
    reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
    reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
    reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
    reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
    reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
    reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

  var named = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32,
  };

  define(Color, color, {
    copy: function (channels) {
      return Object.assign(new this.constructor(), this, channels);
    },
    displayable: function () {
      return this.rgb().displayable();
    },
    hex: color_formatHex, // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb,
  });

  function color_formatHex() {
    return this.rgb().formatHex();
  }

  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }

  function color_formatRgb() {
    return this.rgb().formatRgb();
  }

  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format))
      ? ((l = m[1].length),
        (m = parseInt(m[1], 16)),
        l === 6
          ? rgbn(m) // #ff0000
          : l === 3
            ? new Rgb(((m >> 8) & 0xf) | ((m >> 4) & 0xf0), ((m >> 4) & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
            : l === 8
              ? rgba((m >> 24) & 0xff, (m >> 16) & 0xff, (m >> 8) & 0xff, (m & 0xff) / 0xff) // #ff000000
              : l === 4
                ? rgba(
                  ((m >> 12) & 0xf) | ((m >> 8) & 0xf0),
                  ((m >> 8) & 0xf) | ((m >> 4) & 0xf0),
                  ((m >> 4) & 0xf) | (m & 0xf0),
                  (((m & 0xf) << 4) | (m & 0xf)) / 0xff
                ) // #f000
                : null) // invalid hex
      : (m = reRgbInteger.exec(format))
        ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
        : (m = reRgbPercent.exec(format))
          ? new Rgb((m[1] * 255) / 100, (m[2] * 255) / 100, (m[3] * 255) / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format))
            ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
            : (m = reRgbaPercent.exec(format))
              ? rgba((m[1] * 255) / 100, (m[2] * 255) / 100, (m[3] * 255) / 100, m[4]) // rgb(100%, 0%, 0%, 1)
              : (m = reHslPercent.exec(format))
                ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
                : (m = reHslaPercent.exec(format))
                  ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
                  : named.hasOwnProperty(format)
                    ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
                    : format === "transparent"
                      ? new Rgb(NaN, NaN, NaN, 0)
                      : null;
  }

  function rgbn(n) {
    return new Rgb((n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff, 1);
  }

  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }

  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb();
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }

  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }

  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(
    Rgb,
    rgb,
    extend(Color, {
      brighter: function (k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function (k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function () {
        return this;
      },
      displayable: function () {
        return (
          -0.5 <= this.r &&
          this.r < 255.5 &&
          -0.5 <= this.g &&
          this.g < 255.5 &&
          -0.5 <= this.b &&
          this.b < 255.5 &&
          0 <= this.opacity &&
          this.opacity <= 1
        );
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb,
    })
  );

  function rgb_formatHex() {
    return "#" + hex(this.r) + hex(this.g) + hex(this.b);
  }

  function rgb_formatRgb() {
    var a = this.opacity;
    a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (
      (a === 1 ? "rgb(" : "rgba(") +
      Math.max(0, Math.min(255, Math.round(this.r) || 0)) +
      ", " +
      Math.max(0, Math.min(255, Math.round(this.g) || 0)) +
      ", " +
      Math.max(0, Math.min(255, Math.round(this.b) || 0)) +
      (a === 1 ? ")" : ", " + a + ")")
    );
  }

  function hex(value) {
    value = Math.max(0, Math.min(255, Math.round(value) || 0));
    return (value < 16 ? "0" : "") + value.toString(16);
  }

  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }

  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl();
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      h = NaN,
      s = max - min,
      l = (max + min) / 2;
    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;
      else if (g === max) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }

  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }

  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(
    Hsl,
    hsl,
    extend(Color, {
      brighter: function (k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function (k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function () {
        var h = (this.h % 360) + (this.h < 0) * 360,
          s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
          l = this.l,
          m2 = l + (l < 0.5 ? l : 1 - l) * s,
          m1 = 2 * l - m2;
        return new Rgb(hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2), hsl2rgb(h, m1, m2), hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2), this.opacity);
      },
      displayable: function () {
        return ((0 <= this.s && this.s <= 1) || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
      },
      formatHsl: function () {
        var a = this.opacity;
        a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (
          (a === 1 ? "hsl(" : "hsla(") +
          (this.h || 0) +
          ", " +
          (this.s || 0) * 100 +
          "%, " +
          (this.l || 0) * 100 +
          "%" +
          (a === 1 ? ")" : ", " + a + ")")
        );
      },
    })
  );

  /* From FvD 13.37, CSS Color Module Level 3 */
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + ((m2 - m1) * h) / 60 : h < 180 ? m2 : h < 240 ? m1 + ((m2 - m1) * (240 - h)) / 60 : m1) * 255;
  }

  var deg2rad = Math.PI / 180;
  var rad2deg = 180 / Math.PI;

  // https://observablehq.com/@mbostock/lab-and-rgb
  var K = 18,
    Xn = 0.96422,
    Yn = 1,
    Zn = 0.82521,
    t0 = 4 / 29,
    t1 = 6 / 29,
    t2 = 3 * t1 * t1,
    t3 = t1 * t1 * t1;

  function labConvert(o) {
    if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
    if (o instanceof Hcl) return hcl2lab(o);
    if (!(o instanceof Rgb)) o = rgbConvert(o);
    var r = rgb2lrgb(o.r),
      g = rgb2lrgb(o.g),
      b = rgb2lrgb(o.b),
      y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn),
      x,
      z;
    if (r === g && g === b) x = z = y;
    else {
      x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
      z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
    }
    return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
  }

  function lab(l, a, b, opacity) {
    return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
  }

  function Lab(l, a, b, opacity) {
    this.l = +l;
    this.a = +a;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(
    Lab,
    lab,
    extend(Color, {
      brighter: function (k) {
        return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity);
      },
      darker: function (k) {
        return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity);
      },
      rgb: function () {
        var y = (this.l + 16) / 116,
          x = isNaN(this.a) ? y : y + this.a / 500,
          z = isNaN(this.b) ? y : y - this.b / 200;
        x = Xn * lab2xyz(x);
        y = Yn * lab2xyz(y);
        z = Zn * lab2xyz(z);
        return new Rgb(
          lrgb2rgb(3.1338561 * x - 1.6168667 * y - 0.4906146 * z),
          lrgb2rgb(-0.9787684 * x + 1.9161415 * y + 0.033454 * z),
          lrgb2rgb(0.0719453 * x - 0.2289914 * y + 1.4052427 * z),
          this.opacity
        );
      },
    })
  );

  function xyz2lab(t) {
    return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
  }

  function lab2xyz(t) {
    return t > t1 ? t * t * t : t2 * (t - t0);
  }

  function lrgb2rgb(x) {
    return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
  }

  function rgb2lrgb(x) {
    return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }

  function hclConvert(o) {
    if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
    if (!(o instanceof Lab)) o = labConvert(o);
    if (o.a === 0 && o.b === 0) return new Hcl(NaN, 0 < o.l && o.l < 100 ? 0 : NaN, o.l, o.opacity);
    var h = Math.atan2(o.b, o.a) * rad2deg;
    return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
  }

  function hcl(h, c, l, opacity) {
    return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
  }

  function Hcl(h, c, l, opacity) {
    this.h = +h;
    this.c = +c;
    this.l = +l;
    this.opacity = +opacity;
  }

  function hcl2lab(o) {
    if (isNaN(o.h)) return new Lab(o.l, 0, 0, o.opacity);
    var h = o.h * deg2rad;
    return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
  }

  define(
    Hcl,
    hcl,
    extend(Color, {
      brighter: function (k) {
        return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity);
      },
      darker: function (k) {
        return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity);
      },
      rgb: function () {
        return hcl2lab(this).rgb();
      },
    })
  );

  var A = -0.14861,
    B = +1.78277,
    C = -0.29227,
    D = -0.90649,
    E = +1.97294,
    ED = E * D,
    EB = E * B,
    BC_DA = B * C - D * A;

  function cubehelixConvert(o) {
    if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Rgb)) o = rgbConvert(o);
    var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
      bl = b - l,
      k = (E * (g - l) - C * bl) / D,
      s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
      h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
    return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
  }

  function cubehelix(h, s, l, opacity) {
    return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
  }

  function Cubehelix(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(
    Cubehelix,
    cubehelix,
    extend(Color, {
      brighter: function (k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function (k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function () {
        var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
          l = +this.l,
          a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
          cosh = Math.cos(h),
          sinh = Math.sin(h);
        return new Rgb(255 * (l + a * (A * cosh + B * sinh)), 255 * (l + a * (C * cosh + D * sinh)), 255 * (l + a * (E * cosh)), this.opacity);
      },
    })
  );

  function constant(x) {
    return function () {
      return x;
    };
  }

  function linear(a, d) {
    return function (t) {
      return a + t * d;
    };
  }

  function exponential(a, b, y) {
    return (
      (a = Math.pow(a, y)),
      (b = Math.pow(b, y) - a),
      (y = 1 / y),
      function (t) {
        return Math.pow(a + t * b, y);
      }
    );
  }

  function gamma(y) {
    return (y = +y) === 1
      ? nogamma
      : function (a, b) {
        return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
      };
  }

  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant(isNaN(a) ? b : a);
  }

  var rgb$1 = (function rgbGamma(y) {
    var color = gamma(y);

    function rgb$1(start, end) {
      var r = color((start = rgb(start)).r, (end = rgb(end)).r),
        g = color(start.g, end.g),
        b = color(start.b, end.b),
        opacity = nogamma(start.opacity, end.opacity);
      return function (t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }

    rgb$1.gamma = rgbGamma;

    return rgb$1;
  })(1);

  function numberArray(a, b) {
    if (!b) b = [];
    var n = a ? Math.min(b.length, a.length) : 0,
      c = b.slice(),
      i;
    return function (t) {
      for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
      return c;
    };
  }

  function isNumberArray(x) {
    return ArrayBuffer.isView(x) && !(x instanceof DataView);
  }

  function genericArray(a, b) {
    var nb = b ? b.length : 0,
      na = a ? Math.min(nb, a.length) : 0,
      x = new Array(na),
      c = new Array(nb),
      i;

    for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
    for (; i < nb; ++i) c[i] = b[i];

    return function (t) {
      for (i = 0; i < na; ++i) c[i] = x[i](t);
      return c;
    };
  }

  function date(a, b) {
    var d = new Date();
    return (
      (a = +a),
      (b = +b),
      function (t) {
        return d.setTime(a * (1 - t) + b * t), d;
      }
    );
  }

  function interpolateNumber(a, b) {
    return (
      (a = +a),
      (b = +b),
      function (t) {
        return a * (1 - t) + b * t;
      }
    );
  }

  function object(a, b) {
    var i = {},
      c = {},
      k;

    if (a === null || typeof a !== "object") a = {};
    if (b === null || typeof b !== "object") b = {};

    for (k in b) {
      if (k in a) {
        i[k] = interpolate(a[k], b[k]);
      } else {
        c[k] = b[k];
      }
    }

    return function (t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }

  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
    reB = new RegExp(reA.source, "g");

  function zero(b) {
    return function () {
      return b;
    };
  }

  function one(b) {
    return function (t) {
      return b(t) + "";
    };
  }

  function string(a, b) {
    var bi = (reA.lastIndex = reB.lastIndex = 0), // scan index for next number in b
      am, // current match in a
      bm, // current match in b
      bs, // string preceding current number in b, if any
      i = -1, // index in s
      s = [], // string constants and placeholders
      q = []; // number interpolators

    // Coerce inputs to strings.
    (a = a + ""), (b = b + "");

    // Interpolate pairs of numbers in a & b.
    while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) {
        // a string precedes the next number in b
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) {
        // numbers in a & b match
        if (s[i]) s[i] += bm; // coalesce with previous string
        else s[++i] = bm;
      } else {
        // interpolate non-matching numbers
        s[++i] = null;
        q.push({ i: i, x: interpolateNumber(am, bm) });
      }
      bi = reB.lastIndex;
    }

    // Add remains of b.
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }

    // Special optimization for only a single match.
    // Otherwise, interpolate each of the numbers and rejoin the string.
    return s.length < 2
      ? q[0]
        ? one(q[0].x)
        : zero(b)
      : ((b = q.length),
        function (t) {
          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        });
  }

  function interpolate(a, b) {
    var t = typeof b,
      c;
    return b == null || t === "boolean"
      ? constant(b)
      : (t === "number"
        ? interpolateNumber
        : t === "string"
          ? (c = color(b))
            ? ((b = c), rgb$1)
            : string
          : b instanceof color
            ? rgb$1
            : b instanceof Date
              ? date
              : isNumberArray(b)
                ? numberArray
                : Array.isArray(b)
                  ? genericArray
                  : (typeof b.valueOf !== "function" && typeof b.toString !== "function") || isNaN(b)
                    ? object
                    : interpolateNumber)(a, b);
  }

  function interpolateRound(a, b) {
    return (
      (a = +a),
      (b = +b),
      function (t) {
        return Math.round(a * (1 - t) + b * t);
      }
    );
  }

  function constant$1(x) {
    return function () {
      return x;
    };
  }

  function number(x) {
    return +x;
  }

  var unit = [0, 1];

  function identity(x) {
    return x;
  }

  function normalize(a, b) {
    return (b -= a = +a)
      ? function (x) {
        return (x - a) / b;
      }
      : constant$1(isNaN(b) ? NaN : 0.5);
  }

  function clamper(a, b) {
    var t;
    if (a > b) (t = a), (a = b), (b = t);
    return function (x) {
      return Math.max(a, Math.min(b, x));
    };
  }

  // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
  // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
  function bimap(domain, range, interpolate) {
    var d0 = domain[0],
      d1 = domain[1],
      r0 = range[0],
      r1 = range[1];
    if (d1 < d0) (d0 = normalize(d1, d0)), (r0 = interpolate(r1, r0));
    else (d0 = normalize(d0, d1)), (r0 = interpolate(r0, r1));
    return function (x) {
      return r0(d0(x));
    };
  }

  function polymap(domain, range, interpolate) {
    var j = Math.min(domain.length, range.length) - 1,
      d = new Array(j),
      r = new Array(j),
      i = -1;

    // Reverse descending domains.
    if (domain[j] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }

    while (++i < j) {
      d[i] = normalize(domain[i], domain[i + 1]);
      r[i] = interpolate(range[i], range[i + 1]);
    }

    return function (x) {
      var i = bisectRight(domain, x, 1, j) - 1;
      return r[i](d[i](x));
    };
  }

  function copy(source, target) {
    return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
  }

  function transformer() {
    var domain = unit,
      range = unit,
      interpolate$1 = interpolate,
      transform,
      untransform,
      unknown,
      clamp = identity,
      piecewise,
      output,
      input;

    function rescale() {
      var n = Math.min(domain.length, range.length);
      if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
      piecewise = n > 2 ? polymap : bimap;
      output = input = null;
      return scale;
    }

    function scale(x) {
      return isNaN((x = +x)) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
    }

    scale.invert = function (y) {
      return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
    };

    scale.domain = function (_) {
      return arguments.length ? ((domain = Array.from(_, number)), rescale()) : domain.slice();
    };

    scale.range = function (_) {
      return arguments.length ? ((range = Array.from(_)), rescale()) : range.slice();
    };

    scale.rangeRound = function (_) {
      return (range = Array.from(_)), (interpolate$1 = interpolateRound), rescale();
    };

    scale.clamp = function (_) {
      return arguments.length ? ((clamp = _ ? true : identity), rescale()) : clamp !== identity;
    };

    scale.interpolate = function (_) {
      return arguments.length ? ((interpolate$1 = _), rescale()) : interpolate$1;
    };

    scale.unknown = function (_) {
      return arguments.length ? ((unknown = _), scale) : unknown;
    };

    return function (t, u) {
      (transform = t), (untransform = u);
      return rescale();
    };
  }

  function continuous() {
    return transformer()(identity, identity);
  }

  // Computes the decimal coefficient and exponent of the specified number x with
  // significant digits p, where x is positive and p is in [1, 21] or undefined.
  // For example, formatDecimal(1.23) returns ["123", 0].
  function formatDecimal(x, p) {
    if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
    var i,
      coefficient = x.slice(0, i);

    // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
    // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
    return [coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient, +x.slice(i + 1)];
  }

  function exponent(x) {
    return (x = formatDecimal(Math.abs(x))), x ? x[1] : NaN;
  }

  function formatGroup(grouping, thousands) {
    return function (value, width) {
      var i = value.length,
        t = [],
        j = 0,
        g = grouping[0],
        length = 0;

      while (i > 0 && g > 0) {
        if (length + g + 1 > width) g = Math.max(1, width - length);
        t.push(value.substring((i -= g), i + g));
        if ((length += g + 1) > width) break;
        g = grouping[(j = (j + 1) % grouping.length)];
      }

      return t.reverse().join(thousands);
    };
  }

  function formatNumerals(numerals) {
    return function (value) {
      return value.replace(/[0-9]/g, function (i) {
        return numerals[+i];
      });
    };
  }

  // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
  var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

  function formatSpecifier(specifier) {
    if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
    var match;
    return new FormatSpecifier({
      fill: match[1],
      align: match[2],
      sign: match[3],
      symbol: match[4],
      zero: match[5],
      width: match[6],
      comma: match[7],
      precision: match[8] && match[8].slice(1),
      trim: match[9],
      type: match[10],
    });
  }

  formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

  function FormatSpecifier(specifier) {
    this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
    this.align = specifier.align === undefined ? ">" : specifier.align + "";
    this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
    this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
    this.zero = !!specifier.zero;
    this.width = specifier.width === undefined ? undefined : +specifier.width;
    this.comma = !!specifier.comma;
    this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
    this.trim = !!specifier.trim;
    this.type = specifier.type === undefined ? "" : specifier.type + "";
  }

  FormatSpecifier.prototype.toString = function () {
    return (
      this.fill +
      this.align +
      this.sign +
      this.symbol +
      (this.zero ? "0" : "") +
      (this.width === undefined ? "" : Math.max(1, this.width | 0)) +
      (this.comma ? "," : "") +
      (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0)) +
      (this.trim ? "~" : "") +
      this.type
    );
  };

  // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
  function formatTrim(s) {
    out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (s[i]) {
        case ".":
          i0 = i1 = i;
          break;
        case "0":
          if (i0 === 0) i0 = i;
          i1 = i;
          break;
        default:
          if (!+s[i]) break out;
          if (i0 > 0) i0 = 0;
          break;
      }
    }
    return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
  }

  var prefixExponent;

  function formatPrefixAuto(x, p) {
    var d = formatDecimal(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
      exponent = d[1],
      i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
      n = coefficient.length;
    return i === n
      ? coefficient
      : i > n
        ? coefficient + new Array(i - n + 1).join("0")
        : i > 0
          ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
  }

  function formatRounded(x, p) {
    var d = formatDecimal(x, p);
    if (!d) return x + "";
    var coefficient = d[0],
      exponent = d[1];
    return exponent < 0
      ? "0." + new Array(-exponent).join("0") + coefficient
      : coefficient.length > exponent + 1
        ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
        : coefficient + new Array(exponent - coefficient.length + 2).join("0");
  }

  var formatTypes = {
    "%": function (x, p) {
      return (x * 100).toFixed(p);
    },
    b: function (x) {
      return Math.round(x).toString(2);
    },
    c: function (x) {
      return x + "";
    },
    d: function (x) {
      return Math.round(x).toString(10);
    },
    e: function (x, p) {
      return x.toExponential(p);
    },
    f: function (x, p) {
      return x.toFixed(p);
    },
    g: function (x, p) {
      return x.toPrecision(p);
    },
    o: function (x) {
      return Math.round(x).toString(8);
    },
    p: function (x, p) {
      return formatRounded(x * 100, p);
    },
    r: formatRounded,
    s: formatPrefixAuto,
    X: function (x) {
      return Math.round(x).toString(16).toUpperCase();
    },
    x: function (x) {
      return Math.round(x).toString(16);
    },
  };

  function identity$1(x) {
    return x;
  }

  var map = Array.prototype.map,
    prefixes = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];

  function formatLocale(locale) {
    var group =
      locale.grouping === undefined || locale.thousands === undefined
        ? identity$1
        : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
      currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
      currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
      decimal = locale.decimal === undefined ? "." : locale.decimal + "",
      numerals = locale.numerals === undefined ? identity$1 : formatNumerals(map.call(locale.numerals, String)),
      percent = locale.percent === undefined ? "%" : locale.percent + "",
      minus = locale.minus === undefined ? "-" : locale.minus + "",
      nan = locale.nan === undefined ? "NaN" : locale.nan + "";

    function newFormat(specifier) {
      specifier = formatSpecifier(specifier);

      var fill = specifier.fill,
        align = specifier.align,
        sign = specifier.sign,
        symbol = specifier.symbol,
        zero = specifier.zero,
        width = specifier.width,
        comma = specifier.comma,
        precision = specifier.precision,
        trim = specifier.trim,
        type = specifier.type;

      // The "n" type is an alias for ",g".
      if (type === "n") (comma = true), (type = "g");
      // The "" type, and any invalid type, is an alias for ".12~g".
      else if (!formatTypes[type]) precision === undefined && (precision = 12), (trim = true), (type = "g");

      // If zero fill is specified, padding goes after sign and before digits.
      if (zero || (fill === "0" && align === "=")) (zero = true), (fill = "0"), (align = "=");

      // Compute the prefix and suffix.
      // For SI-prefix, the suffix is lazily computed.
      var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
        suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

      // What format function should we use?
      // Is this an integer type?
      // Can this type generate exponential notation?
      var formatType = formatTypes[type],
        maybeSuffix = /[defgprs%]/.test(type);

      // Set the default precision if not specified,
      // or clamp the specified precision to the supported range.
      // For significant precision, it must be in [1, 21].
      // For fixed precision, it must be in [0, 20].
      precision = precision === undefined ? 6 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));

      function format(value) {
        var valuePrefix = prefix,
          valueSuffix = suffix,
          i,
          n,
          c;

        if (type === "c") {
          valueSuffix = formatType(value) + valueSuffix;
          value = "";
        } else {
          value = +value;

          // Determine the sign. -0 is not less than 0, but 1 / -0 is!
          var valueNegative = value < 0 || 1 / value < 0;

          // Perform the initial formatting.
          value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

          // Trim insignificant zeros.
          if (trim) value = formatTrim(value);

          // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
          if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

          // Compute the prefix and suffix.
          valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
          valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

          // Break the formatted value into the integer “value” part that can be
          // grouped, and fractional or exponential “suffix” part that is not.
          if (maybeSuffix) {
            (i = -1), (n = value.length);
            while (++i < n) {
              if (((c = value.charCodeAt(i)), 48 > c || c > 57)) {
                valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                value = value.slice(0, i);
                break;
              }
            }
          }
        }

        // If the fill character is not "0", grouping is applied before padding.
        if (comma && !zero) value = group(value, Infinity);

        // Compute the padding.
        var length = valuePrefix.length + value.length + valueSuffix.length,
          padding = length < width ? new Array(width - length + 1).join(fill) : "";

        // If the fill character is "0", grouping is applied after padding.
        if (comma && zero) (value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity)), (padding = "");

        // Reconstruct the final output based on the desired alignment.
        switch (align) {
          case "<":
            value = valuePrefix + value + valueSuffix + padding;
            break;
          case "=":
            value = valuePrefix + padding + value + valueSuffix;
            break;
          case "^":
            value = padding.slice(0, (length = padding.length >> 1)) + valuePrefix + value + valueSuffix + padding.slice(length);
            break;
          default:
            value = padding + valuePrefix + value + valueSuffix;
            break;
        }

        return numerals(value);
      }

      format.toString = function () {
        return specifier + "";
      };

      return format;
    }

    function formatPrefix(specifier, value) {
      var f = newFormat(((specifier = formatSpecifier(specifier)), (specifier.type = "f"), specifier)),
        e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
        k = Math.pow(10, -e),
        prefix = prefixes[8 + e / 3];
      return function (value) {
        return f(k * value) + prefix;
      };
    }

    return {
      format: newFormat,
      formatPrefix: formatPrefix,
    };
  }

  var locale;
  var format;
  var formatPrefix;

  defaultLocale({
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["$", ""],
    minus: "-",
  });

  function defaultLocale(definition) {
    locale = formatLocale(definition);
    format = locale.format;
    formatPrefix = locale.formatPrefix;
    return locale;
  }

  function precisionFixed(step) {
    return Math.max(0, -exponent(Math.abs(step)));
  }

  function precisionPrefix(step, value) {
    return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
  }

  function precisionRound(step, max) {
    (step = Math.abs(step)), (max = Math.abs(max) - step);
    return Math.max(0, exponent(max) - exponent(step)) + 1;
  }

  function tickFormat(start, stop, count, specifier) {
    var step = tickStep(start, stop, count),
      precision;
    specifier = formatSpecifier(specifier == null ? ",f" : specifier);
    switch (specifier.type) {
      case "s": {
        var value = Math.max(Math.abs(start), Math.abs(stop));
        if (specifier.precision == null && !isNaN((precision = precisionPrefix(step, value)))) specifier.precision = precision;
        return formatPrefix(specifier, value);
      }
      case "":
      case "e":
      case "g":
      case "p":
      case "r": {
        if (specifier.precision == null && !isNaN((precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))))
          specifier.precision = precision - (specifier.type === "e");
        break;
      }
      case "f":
      case "%": {
        if (specifier.precision == null && !isNaN((precision = precisionFixed(step)))) specifier.precision = precision - (specifier.type === "%") * 2;
        break;
      }
    }
    return format(specifier);
  }

  function linearish(scale) {
    var domain = scale.domain;

    scale.ticks = function (count) {
      var d = domain();
      return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };

    scale.tickFormat = function (count, specifier) {
      var d = domain();
      return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
    };

    scale.nice = function (count) {
      if (count == null) count = 10;

      var d = domain(),
        i0 = 0,
        i1 = d.length - 1,
        start = d[i0],
        stop = d[i1],
        step;

      if (stop < start) {
        (step = start), (start = stop), (stop = step);
        (step = i0), (i0 = i1), (i1 = step);
      }

      step = tickIncrement(start, stop, count);

      if (step > 0) {
        start = Math.floor(start / step) * step;
        stop = Math.ceil(stop / step) * step;
        step = tickIncrement(start, stop, count);
      } else if (step < 0) {
        start = Math.ceil(start * step) / step;
        stop = Math.floor(stop * step) / step;
        step = tickIncrement(start, stop, count);
      }

      if (step > 0) {
        d[i0] = Math.floor(start / step) * step;
        d[i1] = Math.ceil(stop / step) * step;
        domain(d);
      } else if (step < 0) {
        d[i0] = Math.ceil(start * step) / step;
        d[i1] = Math.floor(stop * step) / step;
        domain(d);
      }

      return scale;
    };

    return scale;
  }

  function linear$1() {
    var scale = continuous();

    scale.copy = function () {
      return copy(scale, linear$1());
    };

    initRange.apply(scale, arguments);

    return linearish(scale);
  }

  var t0$1 = new Date(),
    t1$1 = new Date();

  function newInterval(floori, offseti, count, field) {
    function interval(date) {
      return floori((date = arguments.length === 0 ? new Date() : new Date(+date))), date;
    }

    interval.floor = function (date) {
      return floori((date = new Date(+date))), date;
    };

    interval.ceil = function (date) {
      return floori((date = new Date(date - 1))), offseti(date, 1), floori(date), date;
    };

    interval.round = function (date) {
      var d0 = interval(date),
        d1 = interval.ceil(date);
      return date - d0 < d1 - date ? d0 : d1;
    };

    interval.offset = function (date, step) {
      return offseti((date = new Date(+date)), step == null ? 1 : Math.floor(step)), date;
    };

    interval.range = function (start, stop, step) {
      var range = [],
        previous;
      start = interval.ceil(start);
      step = step == null ? 1 : Math.floor(step);
      if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
      do range.push((previous = new Date(+start))), offseti(start, step), floori(start);
      while (previous < start && start < stop);
      return range;
    };

    interval.filter = function (test) {
      return newInterval(
        function (date) {
          if (date >= date) while ((floori(date), !test(date))) date.setTime(date - 1);
        },
        function (date, step) {
          if (date >= date) {
            if (step < 0)
              while (++step <= 0) {
                while ((offseti(date, -1), !test(date))) { } // eslint-disable-line no-empty
              }
            else
              while (--step >= 0) {
                while ((offseti(date, +1), !test(date))) { } // eslint-disable-line no-empty
              }
          }
        }
      );
    };

    if (count) {
      interval.count = function (start, end) {
        t0$1.setTime(+start), t1$1.setTime(+end);
        floori(t0$1), floori(t1$1);
        return Math.floor(count(t0$1, t1$1));
      };

      interval.every = function (step) {
        step = Math.floor(step);
        return !isFinite(step) || !(step > 0)
          ? null
          : !(step > 1)
            ? interval
            : interval.filter(
              field
                ? function (d) {
                  return field(d) % step === 0;
                }
                : function (d) {
                  return interval.count(0, d) % step === 0;
                }
            );
      };
    }

    return interval;
  }

  var millisecond = newInterval(
    function () {
      // noop
    },
    function (date, step) {
      date.setTime(+date + step);
    },
    function (start, end) {
      return end - start;
    }
  );

  // An optimized implementation for this simple case.
  millisecond.every = function (k) {
    k = Math.floor(k);
    if (!isFinite(k) || !(k > 0)) return null;
    if (!(k > 1)) return millisecond;
    return newInterval(
      function (date) {
        date.setTime(Math.floor(date / k) * k);
      },
      function (date, step) {
        date.setTime(+date + step * k);
      },
      function (start, end) {
        return (end - start) / k;
      }
    );
  };

  var durationSecond = 1e3;
  var durationMinute = 6e4;
  var durationHour = 36e5;
  var durationDay = 864e5;
  var durationWeek = 6048e5;

  var second = newInterval(
    function (date) {
      date.setTime(date - date.getMilliseconds());
    },
    function (date, step) {
      date.setTime(+date + step * durationSecond);
    },
    function (start, end) {
      return (end - start) / durationSecond;
    },
    function (date) {
      return date.getUTCSeconds();
    }
  );

  var minute = newInterval(
    function (date) {
      date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond);
    },
    function (date, step) {
      date.setTime(+date + step * durationMinute);
    },
    function (start, end) {
      return (end - start) / durationMinute;
    },
    function (date) {
      return date.getMinutes();
    }
  );

  var hour = newInterval(
    function (date) {
      date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
    },
    function (date, step) {
      date.setTime(+date + step * durationHour);
    },
    function (start, end) {
      return (end - start) / durationHour;
    },
    function (date) {
      return date.getHours();
    }
  );

  var day = newInterval(
    function (date) {
      date.setHours(0, 0, 0, 0);
    },
    function (date, step) {
      date.setDate(date.getDate() + step);
    },
    function (start, end) {
      return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay;
    },
    function (date) {
      return date.getDate() - 1;
    }
  );

  function weekday(i) {
    return newInterval(
      function (date) {
        date.setDate(date.getDate() - ((date.getDay() + 7 - i) % 7));
        date.setHours(0, 0, 0, 0);
      },
      function (date, step) {
        date.setDate(date.getDate() + step * 7);
      },
      function (start, end) {
        return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
      }
    );
  }

  var sunday = weekday(0);
  var monday = weekday(1);
  var tuesday = weekday(2);
  var wednesday = weekday(3);
  var thursday = weekday(4);
  var friday = weekday(5);
  var saturday = weekday(6);

  var month = newInterval(
    function (date) {
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
    },
    function (date, step) {
      date.setMonth(date.getMonth() + step);
    },
    function (start, end) {
      return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
    },
    function (date) {
      return date.getMonth();
    }
  );

  var year = newInterval(
    function (date) {
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
    },
    function (date, step) {
      date.setFullYear(date.getFullYear() + step);
    },
    function (start, end) {
      return end.getFullYear() - start.getFullYear();
    },
    function (date) {
      return date.getFullYear();
    }
  );

  // An optimized implementation for this simple case.
  year.every = function (k) {
    return !isFinite((k = Math.floor(k))) || !(k > 0)
      ? null
      : newInterval(
        function (date) {
          date.setFullYear(Math.floor(date.getFullYear() / k) * k);
          date.setMonth(0, 1);
          date.setHours(0, 0, 0, 0);
        },
        function (date, step) {
          date.setFullYear(date.getFullYear() + step * k);
        }
      );
  };

  var utcMinute = newInterval(
    function (date) {
      date.setUTCSeconds(0, 0);
    },
    function (date, step) {
      date.setTime(+date + step * durationMinute);
    },
    function (start, end) {
      return (end - start) / durationMinute;
    },
    function (date) {
      return date.getUTCMinutes();
    }
  );

  var utcHour = newInterval(
    function (date) {
      date.setUTCMinutes(0, 0, 0);
    },
    function (date, step) {
      date.setTime(+date + step * durationHour);
    },
    function (start, end) {
      return (end - start) / durationHour;
    },
    function (date) {
      return date.getUTCHours();
    }
  );

  var utcDay = newInterval(
    function (date) {
      date.setUTCHours(0, 0, 0, 0);
    },
    function (date, step) {
      date.setUTCDate(date.getUTCDate() + step);
    },
    function (start, end) {
      return (end - start) / durationDay;
    },
    function (date) {
      return date.getUTCDate() - 1;
    }
  );

  function utcWeekday(i) {
    return newInterval(
      function (date) {
        date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 7 - i) % 7));
        date.setUTCHours(0, 0, 0, 0);
      },
      function (date, step) {
        date.setUTCDate(date.getUTCDate() + step * 7);
      },
      function (start, end) {
        return (end - start) / durationWeek;
      }
    );
  }

  var utcSunday = utcWeekday(0);
  var utcMonday = utcWeekday(1);
  var utcTuesday = utcWeekday(2);
  var utcWednesday = utcWeekday(3);
  var utcThursday = utcWeekday(4);
  var utcFriday = utcWeekday(5);
  var utcSaturday = utcWeekday(6);

  var utcMonth = newInterval(
    function (date) {
      date.setUTCDate(1);
      date.setUTCHours(0, 0, 0, 0);
    },
    function (date, step) {
      date.setUTCMonth(date.getUTCMonth() + step);
    },
    function (start, end) {
      return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
    },
    function (date) {
      return date.getUTCMonth();
    }
  );

  var utcYear = newInterval(
    function (date) {
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
    },
    function (date, step) {
      date.setUTCFullYear(date.getUTCFullYear() + step);
    },
    function (start, end) {
      return end.getUTCFullYear() - start.getUTCFullYear();
    },
    function (date) {
      return date.getUTCFullYear();
    }
  );

  // An optimized implementation for this simple case.
  utcYear.every = function (k) {
    return !isFinite((k = Math.floor(k))) || !(k > 0)
      ? null
      : newInterval(
        function (date) {
          date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
          date.setUTCMonth(0, 1);
          date.setUTCHours(0, 0, 0, 0);
        },
        function (date, step) {
          date.setUTCFullYear(date.getUTCFullYear() + step * k);
        }
      );
  };

  function localDate(d) {
    if (0 <= d.y && d.y < 100) {
      var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
      date.setFullYear(d.y);
      return date;
    }
    return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
  }

  function utcDate(d) {
    if (0 <= d.y && d.y < 100) {
      var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
      date.setUTCFullYear(d.y);
      return date;
    }
    return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
  }

  function newDate(y, m, d) {
    return { y: y, m: m, d: d, H: 0, M: 0, S: 0, L: 0 };
  }

  function formatLocale$1(locale) {
    var locale_dateTime = locale.dateTime,
      locale_date = locale.date,
      locale_time = locale.time,
      locale_periods = locale.periods,
      locale_weekdays = locale.days,
      locale_shortWeekdays = locale.shortDays,
      locale_months = locale.months,
      locale_shortMonths = locale.shortMonths;

    var periodRe = formatRe(locale_periods),
      periodLookup = formatLookup(locale_periods),
      weekdayRe = formatRe(locale_weekdays),
      weekdayLookup = formatLookup(locale_weekdays),
      shortWeekdayRe = formatRe(locale_shortWeekdays),
      shortWeekdayLookup = formatLookup(locale_shortWeekdays),
      monthRe = formatRe(locale_months),
      monthLookup = formatLookup(locale_months),
      shortMonthRe = formatRe(locale_shortMonths),
      shortMonthLookup = formatLookup(locale_shortMonths);

    var formats = {
      a: formatShortWeekday,
      A: formatWeekday,
      b: formatShortMonth,
      B: formatMonth,
      c: null,
      d: formatDayOfMonth,
      e: formatDayOfMonth,
      f: formatMicroseconds,
      H: formatHour24,
      I: formatHour12,
      j: formatDayOfYear,
      L: formatMilliseconds,
      m: formatMonthNumber,
      M: formatMinutes,
      p: formatPeriod,
      q: formatQuarter,
      Q: formatUnixTimestamp,
      s: formatUnixTimestampSeconds,
      S: formatSeconds,
      u: formatWeekdayNumberMonday,
      U: formatWeekNumberSunday,
      V: formatWeekNumberISO,
      w: formatWeekdayNumberSunday,
      W: formatWeekNumberMonday,
      x: null,
      X: null,
      y: formatYear,
      Y: formatFullYear,
      Z: formatZone,
      "%": formatLiteralPercent,
    };

    var utcFormats = {
      a: formatUTCShortWeekday,
      A: formatUTCWeekday,
      b: formatUTCShortMonth,
      B: formatUTCMonth,
      c: null,
      d: formatUTCDayOfMonth,
      e: formatUTCDayOfMonth,
      f: formatUTCMicroseconds,
      H: formatUTCHour24,
      I: formatUTCHour12,
      j: formatUTCDayOfYear,
      L: formatUTCMilliseconds,
      m: formatUTCMonthNumber,
      M: formatUTCMinutes,
      p: formatUTCPeriod,
      q: formatUTCQuarter,
      Q: formatUnixTimestamp,
      s: formatUnixTimestampSeconds,
      S: formatUTCSeconds,
      u: formatUTCWeekdayNumberMonday,
      U: formatUTCWeekNumberSunday,
      V: formatUTCWeekNumberISO,
      w: formatUTCWeekdayNumberSunday,
      W: formatUTCWeekNumberMonday,
      x: null,
      X: null,
      y: formatUTCYear,
      Y: formatUTCFullYear,
      Z: formatUTCZone,
      "%": formatLiteralPercent,
    };

    var parses = {
      a: parseShortWeekday,
      A: parseWeekday,
      b: parseShortMonth,
      B: parseMonth,
      c: parseLocaleDateTime,
      d: parseDayOfMonth,
      e: parseDayOfMonth,
      f: parseMicroseconds,
      H: parseHour24,
      I: parseHour24,
      j: parseDayOfYear,
      L: parseMilliseconds,
      m: parseMonthNumber,
      M: parseMinutes,
      p: parsePeriod,
      q: parseQuarter,
      Q: parseUnixTimestamp,
      s: parseUnixTimestampSeconds,
      S: parseSeconds,
      u: parseWeekdayNumberMonday,
      U: parseWeekNumberSunday,
      V: parseWeekNumberISO,
      w: parseWeekdayNumberSunday,
      W: parseWeekNumberMonday,
      x: parseLocaleDate,
      X: parseLocaleTime,
      y: parseYear,
      Y: parseFullYear,
      Z: parseZone,
      "%": parseLiteralPercent,
    };

    // These recursive directive definitions must be deferred.
    formats.x = newFormat(locale_date, formats);
    formats.X = newFormat(locale_time, formats);
    formats.c = newFormat(locale_dateTime, formats);
    utcFormats.x = newFormat(locale_date, utcFormats);
    utcFormats.X = newFormat(locale_time, utcFormats);
    utcFormats.c = newFormat(locale_dateTime, utcFormats);

    function newFormat(specifier, formats) {
      return function (date) {
        var string = [],
          i = -1,
          j = 0,
          n = specifier.length,
          c,
          pad,
          format;

        if (!(date instanceof Date)) date = new Date(+date);

        while (++i < n) {
          if (specifier.charCodeAt(i) === 37) {
            string.push(specifier.slice(j, i));
            if ((pad = pads[(c = specifier.charAt(++i))]) != null) c = specifier.charAt(++i);
            else pad = c === "e" ? " " : "0";
            if ((format = formats[c])) c = format(date, pad);
            string.push(c);
            j = i + 1;
          }
        }

        string.push(specifier.slice(j, i));
        return string.join("");
      };
    }

    function newParse(specifier, Z) {
      return function (string) {
        var d = newDate(1900, undefined, 1),
          i = parseSpecifier(d, specifier, (string += ""), 0),
          week,
          day$1;
        if (i != string.length) return null;

        // If a UNIX timestamp is specified, return it.
        if ("Q" in d) return new Date(d.Q);
        if ("s" in d) return new Date(d.s * 1000 + ("L" in d ? d.L : 0));

        // If this is utcParse, never use the local timezone.
        if (Z && !("Z" in d)) d.Z = 0;

        // The am-pm flag is 0 for AM, and 1 for PM.
        if ("p" in d) d.H = (d.H % 12) + d.p * 12;

        // If the month was not specified, inherit from the quarter.
        if (d.m === undefined) d.m = "q" in d ? d.q : 0;

        // Convert day-of-week and week-of-year to day-of-year.
        if ("V" in d) {
          if (d.V < 1 || d.V > 53) return null;
          if (!("w" in d)) d.w = 1;
          if ("Z" in d) {
            (week = utcDate(newDate(d.y, 0, 1))), (day$1 = week.getUTCDay());
            week = day$1 > 4 || day$1 === 0 ? utcMonday.ceil(week) : utcMonday(week);
            week = utcDay.offset(week, (d.V - 1) * 7);
            d.y = week.getUTCFullYear();
            d.m = week.getUTCMonth();
            d.d = week.getUTCDate() + ((d.w + 6) % 7);
          } else {
            (week = localDate(newDate(d.y, 0, 1))), (day$1 = week.getDay());
            week = day$1 > 4 || day$1 === 0 ? monday.ceil(week) : monday(week);
            week = day.offset(week, (d.V - 1) * 7);
            d.y = week.getFullYear();
            d.m = week.getMonth();
            d.d = week.getDate() + ((d.w + 6) % 7);
          }
        } else if ("W" in d || "U" in d) {
          if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
          day$1 = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
          d.m = 0;
          d.d = "W" in d ? ((d.w + 6) % 7) + d.W * 7 - ((day$1 + 5) % 7) : d.w + d.U * 7 - ((day$1 + 6) % 7);
        }

        // If a time zone is specified, all fields are interpreted as UTC and then
        // offset according to the specified time zone.
        if ("Z" in d) {
          d.H += (d.Z / 100) | 0;
          d.M += d.Z % 100;
          return utcDate(d);
        }

        // Otherwise, all fields are in local time.
        return localDate(d);
      };
    }

    function parseSpecifier(d, specifier, string, j) {
      var i = 0,
        n = specifier.length,
        m = string.length,
        c,
        parse;

      while (i < n) {
        if (j >= m) return -1;
        c = specifier.charCodeAt(i++);
        if (c === 37) {
          c = specifier.charAt(i++);
          parse = parses[c in pads ? specifier.charAt(i++) : c];
          if (!parse || (j = parse(d, string, j)) < 0) return -1;
        } else if (c != string.charCodeAt(j++)) {
          return -1;
        }
      }

      return j;
    }

    function parsePeriod(d, string, i) {
      var n = periodRe.exec(string.slice(i));
      return n ? ((d.p = periodLookup[n[0].toLowerCase()]), i + n[0].length) : -1;
    }

    function parseShortWeekday(d, string, i) {
      var n = shortWeekdayRe.exec(string.slice(i));
      return n ? ((d.w = shortWeekdayLookup[n[0].toLowerCase()]), i + n[0].length) : -1;
    }

    function parseWeekday(d, string, i) {
      var n = weekdayRe.exec(string.slice(i));
      return n ? ((d.w = weekdayLookup[n[0].toLowerCase()]), i + n[0].length) : -1;
    }

    function parseShortMonth(d, string, i) {
      var n = shortMonthRe.exec(string.slice(i));
      return n ? ((d.m = shortMonthLookup[n[0].toLowerCase()]), i + n[0].length) : -1;
    }

    function parseMonth(d, string, i) {
      var n = monthRe.exec(string.slice(i));
      return n ? ((d.m = monthLookup[n[0].toLowerCase()]), i + n[0].length) : -1;
    }

    function parseLocaleDateTime(d, string, i) {
      return parseSpecifier(d, locale_dateTime, string, i);
    }

    function parseLocaleDate(d, string, i) {
      return parseSpecifier(d, locale_date, string, i);
    }

    function parseLocaleTime(d, string, i) {
      return parseSpecifier(d, locale_time, string, i);
    }

    function formatShortWeekday(d) {
      return locale_shortWeekdays[d.getDay()];
    }

    function formatWeekday(d) {
      return locale_weekdays[d.getDay()];
    }

    function formatShortMonth(d) {
      return locale_shortMonths[d.getMonth()];
    }

    function formatMonth(d) {
      return locale_months[d.getMonth()];
    }

    function formatPeriod(d) {
      return locale_periods[+(d.getHours() >= 12)];
    }

    function formatQuarter(d) {
      return 1 + ~~(d.getMonth() / 3);
    }

    function formatUTCShortWeekday(d) {
      return locale_shortWeekdays[d.getUTCDay()];
    }

    function formatUTCWeekday(d) {
      return locale_weekdays[d.getUTCDay()];
    }

    function formatUTCShortMonth(d) {
      return locale_shortMonths[d.getUTCMonth()];
    }

    function formatUTCMonth(d) {
      return locale_months[d.getUTCMonth()];
    }

    function formatUTCPeriod(d) {
      return locale_periods[+(d.getUTCHours() >= 12)];
    }

    function formatUTCQuarter(d) {
      return 1 + ~~(d.getUTCMonth() / 3);
    }

    return {
      format: function (specifier) {
        var f = newFormat((specifier += ""), formats);
        f.toString = function () {
          return specifier;
        };
        return f;
      },
      parse: function (specifier) {
        var p = newParse((specifier += ""), false);
        p.toString = function () {
          return specifier;
        };
        return p;
      },
      utcFormat: function (specifier) {
        var f = newFormat((specifier += ""), utcFormats);
        f.toString = function () {
          return specifier;
        };
        return f;
      },
      utcParse: function (specifier) {
        var p = newParse((specifier += ""), true);
        p.toString = function () {
          return specifier;
        };
        return p;
      },
    };
  }

  var pads = { "-": "", _: " ", 0: "0" },
    numberRe = /^\s*\d+/, // note: ignores next directive
    percentRe = /^%/,
    requoteRe = /[\\^$*+?|[\]().{}]/g;

  function pad(value, fill, width) {
    var sign = value < 0 ? "-" : "",
      string = (sign ? -value : value) + "",
      length = string.length;
    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
  }

  function requote(s) {
    return s.replace(requoteRe, "\\$&");
  }

  function formatRe(names) {
    return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
  }

  function formatLookup(names) {
    var map = {},
      i = -1,
      n = names.length;
    while (++i < n) map[names[i].toLowerCase()] = i;
    return map;
  }

  function parseWeekdayNumberSunday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? ((d.w = +n[0]), i + n[0].length) : -1;
  }

  function parseWeekdayNumberMonday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? ((d.u = +n[0]), i + n[0].length) : -1;
  }

  function parseWeekNumberSunday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? ((d.U = +n[0]), i + n[0].length) : -1;
  }

  function parseWeekNumberISO(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? ((d.V = +n[0]), i + n[0].length) : -1;
  }

  function parseWeekNumberMonday(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? ((d.W = +n[0]), i + n[0].length) : -1;
  }

  function parseFullYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 4));
    return n ? ((d.y = +n[0]), i + n[0].length) : -1;
  }

  function parseYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? ((d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000)), i + n[0].length) : -1;
  }

  function parseZone(d, string, i) {
    var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
    return n ? ((d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00"))), i + n[0].length) : -1;
  }

  function parseQuarter(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 1));
    return n ? ((d.q = n[0] * 3 - 3), i + n[0].length) : -1;
  }

  function parseMonthNumber(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? ((d.m = n[0] - 1), i + n[0].length) : -1;
  }

  function parseDayOfMonth(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? ((d.d = +n[0]), i + n[0].length) : -1;
  }

  function parseDayOfYear(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 3));
    return n ? ((d.m = 0), (d.d = +n[0]), i + n[0].length) : -1;
  }

  function parseHour24(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? ((d.H = +n[0]), i + n[0].length) : -1;
  }

  function parseMinutes(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? ((d.M = +n[0]), i + n[0].length) : -1;
  }

  function parseSeconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 2));
    return n ? ((d.S = +n[0]), i + n[0].length) : -1;
  }

  function parseMilliseconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 3));
    return n ? ((d.L = +n[0]), i + n[0].length) : -1;
  }

  function parseMicroseconds(d, string, i) {
    var n = numberRe.exec(string.slice(i, i + 6));
    return n ? ((d.L = Math.floor(n[0] / 1000)), i + n[0].length) : -1;
  }

  function parseLiteralPercent(d, string, i) {
    var n = percentRe.exec(string.slice(i, i + 1));
    return n ? i + n[0].length : -1;
  }

  function parseUnixTimestamp(d, string, i) {
    var n = numberRe.exec(string.slice(i));
    return n ? ((d.Q = +n[0]), i + n[0].length) : -1;
  }

  function parseUnixTimestampSeconds(d, string, i) {
    var n = numberRe.exec(string.slice(i));
    return n ? ((d.s = +n[0]), i + n[0].length) : -1;
  }

  function formatDayOfMonth(d, p) {
    return pad(d.getDate(), p, 2);
  }

  function formatHour24(d, p) {
    return pad(d.getHours(), p, 2);
  }

  function formatHour12(d, p) {
    return pad(d.getHours() % 12 || 12, p, 2);
  }

  function formatDayOfYear(d, p) {
    return pad(1 + day.count(year(d), d), p, 3);
  }

  function formatMilliseconds(d, p) {
    return pad(d.getMilliseconds(), p, 3);
  }

  function formatMicroseconds(d, p) {
    return formatMilliseconds(d, p) + "000";
  }

  function formatMonthNumber(d, p) {
    return pad(d.getMonth() + 1, p, 2);
  }

  function formatMinutes(d, p) {
    return pad(d.getMinutes(), p, 2);
  }

  function formatSeconds(d, p) {
    return pad(d.getSeconds(), p, 2);
  }

  function formatWeekdayNumberMonday(d) {
    var day = d.getDay();
    return day === 0 ? 7 : day;
  }

  function formatWeekNumberSunday(d, p) {
    return pad(sunday.count(year(d) - 1, d), p, 2);
  }

  function formatWeekNumberISO(d, p) {
    var day = d.getDay();
    d = day >= 4 || day === 0 ? thursday(d) : thursday.ceil(d);
    return pad(thursday.count(year(d), d) + (year(d).getDay() === 4), p, 2);
  }

  function formatWeekdayNumberSunday(d) {
    return d.getDay();
  }

  function formatWeekNumberMonday(d, p) {
    return pad(monday.count(year(d) - 1, d), p, 2);
  }

  function formatYear(d, p) {
    return pad(d.getFullYear() % 100, p, 2);
  }

  function formatFullYear(d, p) {
    return pad(d.getFullYear() % 10000, p, 4);
  }

  function formatZone(d) {
    var z = d.getTimezoneOffset();
    return (z > 0 ? "-" : ((z *= -1), "+")) + pad((z / 60) | 0, "0", 2) + pad(z % 60, "0", 2);
  }

  function formatUTCDayOfMonth(d, p) {
    return pad(d.getUTCDate(), p, 2);
  }

  function formatUTCHour24(d, p) {
    return pad(d.getUTCHours(), p, 2);
  }

  function formatUTCHour12(d, p) {
    return pad(d.getUTCHours() % 12 || 12, p, 2);
  }

  function formatUTCDayOfYear(d, p) {
    return pad(1 + utcDay.count(utcYear(d), d), p, 3);
  }

  function formatUTCMilliseconds(d, p) {
    return pad(d.getUTCMilliseconds(), p, 3);
  }

  function formatUTCMicroseconds(d, p) {
    return formatUTCMilliseconds(d, p) + "000";
  }

  function formatUTCMonthNumber(d, p) {
    return pad(d.getUTCMonth() + 1, p, 2);
  }

  function formatUTCMinutes(d, p) {
    return pad(d.getUTCMinutes(), p, 2);
  }

  function formatUTCSeconds(d, p) {
    return pad(d.getUTCSeconds(), p, 2);
  }

  function formatUTCWeekdayNumberMonday(d) {
    var dow = d.getUTCDay();
    return dow === 0 ? 7 : dow;
  }

  function formatUTCWeekNumberSunday(d, p) {
    return pad(utcSunday.count(utcYear(d) - 1, d), p, 2);
  }

  function formatUTCWeekNumberISO(d, p) {
    var day = d.getUTCDay();
    d = day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
    return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
  }

  function formatUTCWeekdayNumberSunday(d) {
    return d.getUTCDay();
  }

  function formatUTCWeekNumberMonday(d, p) {
    return pad(utcMonday.count(utcYear(d) - 1, d), p, 2);
  }

  function formatUTCYear(d, p) {
    return pad(d.getUTCFullYear() % 100, p, 2);
  }

  function formatUTCFullYear(d, p) {
    return pad(d.getUTCFullYear() % 10000, p, 4);
  }

  function formatUTCZone() {
    return "+0000";
  }

  function formatLiteralPercent() {
    return "%";
  }

  function formatUnixTimestamp(d) {
    return +d;
  }

  function formatUnixTimestampSeconds(d) {
    return Math.floor(+d / 1000);
  }

  var locale$1;
  var timeFormat;
  var timeParse;
  var utcFormat;
  var utcParse;

  defaultLocale$1({
    dateTime: "%x, %X",
    date: "%-m/%-d/%Y",
    time: "%-I:%M:%S %p",
    periods: ["AM", "PM"],
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  });

  function defaultLocale$1(definition) {
    locale$1 = formatLocale$1(definition);
    timeFormat = locale$1.format;
    timeParse = locale$1.parse;
    utcFormat = locale$1.utcFormat;
    utcParse = locale$1.utcParse;
    return locale$1;
  }

  var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";

  function formatIsoNative(date) {
    return date.toISOString();
  }

  var formatIso = Date.prototype.toISOString ? formatIsoNative : utcFormat(isoSpecifier);

  function parseIsoNative(string) {
    var date = new Date(string);
    return isNaN(date) ? null : date;
  }

  var parseIso = +new Date("2000-01-01T00:00:00.000Z") ? parseIsoNative : utcParse(isoSpecifier);

  var noop = { value: function () { } };

  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }

  function Dispatch(_) {
    this._ = _;
  }

  function parseTypenames(typenames, types) {
    return typenames
      .trim()
      .split(/^|\s+/)
      .map(function (t) {
        var name = "",
          i = t.indexOf(".");
        if (i >= 0) (name = t.slice(i + 1)), (t = t.slice(0, i));
        if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
        return { type: t, name: name };
      });
  }

  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function (typename, callback) {
      var _ = this._,
        T = parseTypenames(typename + "", _),
        t,
        i = -1,
        n = T.length;

      // If no callback was specified, return the callback of the given type and name.
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
        return;
      }

      // If a type was specified, set the callback for the given type and name.
      // Otherwise, if a null callback was specified, remove callbacks of the given name.
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if ((t = (typename = T[i]).type)) _[t] = set(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
      }

      return this;
    },
    copy: function () {
      var copy = {},
        _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function (type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function (type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
  };

  function get(type, name) {
    for (var i = 0, n = type.length, c; i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }

  function set(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        (type[i] = noop), (type = type.slice(0, i).concat(type.slice(i + 1)));
        break;
      }
    }
    if (callback != null) type.push({ name: name, value: callback });
    return type;
  }

  var xhtml = "http://www.w3.org/1999/xhtml";

  var namespaces = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/",
  };

  function namespace(name) {
    var prefix = (name += ""),
      i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces.hasOwnProperty(prefix) ? { space: namespaces[prefix], local: name } : name;
  }

  function creatorInherit(name) {
    return function () {
      var document = this.ownerDocument,
        uri = this.namespaceURI;
      return uri === xhtml && document.documentElement.namespaceURI === xhtml ? document.createElement(name) : document.createElementNS(uri, name);
    };
  }

  function creatorFixed(fullname) {
    return function () {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }

  function creator(name) {
    var fullname = namespace(name);
    return (fullname.local ? creatorFixed : creatorInherit)(fullname);
  }

  function none() { }

  function selector(selector) {
    return selector == null
      ? none
      : function () {
        return this.querySelector(selector);
      };
  }

  function selection_select(select) {
    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = (subgroups[j] = new Array(n)), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  function empty() {
    return [];
  }

  function selectorAll(selector) {
    return selector == null
      ? empty
      : function () {
        return this.querySelectorAll(selector);
      };
  }

  function selection_selectAll(select) {
    if (typeof select !== "function") select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if ((node = group[i])) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }

    return new Selection(subgroups, parents);
  }

  function matcher(selector) {
    return function () {
      return this.matches(selector);
    };
  }

  function selection_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = (subgroups[j] = []), node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  function sparse(update) {
    return new Array(update.length);
  }

  function selection_enter() {
    return new Selection(this._enter || this._groups.map(sparse), this._parents);
  }

  function EnterNode(parent, datum) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum;
  }

  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function (child) {
      return this._parent.insertBefore(child, this._next);
    },
    insertBefore: function (child, next) {
      return this._parent.insertBefore(child, next);
    },
    querySelector: function (selector) {
      return this._parent.querySelector(selector);
    },
    querySelectorAll: function (selector) {
      return this._parent.querySelectorAll(selector);
    },
  };

  function constant$2(x) {
    return function () {
      return x;
    };
  }

  var keyPrefix = "$"; // Protect against keys like “__proto__”.

  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0,
      node,
      groupLength = group.length,
      dataLength = data.length;

    // Put any non-null nodes that fit into update.
    // Put any null nodes into enter.
    // Put any remaining data into enter.
    for (; i < dataLength; ++i) {
      if ((node = group[i])) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Put any non-null nodes that don’t fit into exit.
    for (; i < groupLength; ++i) {
      if ((node = group[i])) {
        exit[i] = node;
      }
    }
  }

  function bindKey(parent, group, enter, update, exit, data, key) {
    var i,
      node,
      nodeByKeyValue = {},
      groupLength = group.length,
      dataLength = data.length,
      keyValues = new Array(groupLength),
      keyValue;

    // Compute the key for each node.
    // If multiple nodes have the same key, the duplicates are added to exit.
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i])) {
        keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
        if (keyValue in nodeByKeyValue) {
          exit[i] = node;
        } else {
          nodeByKeyValue[keyValue] = node;
        }
      }
    }

    // Compute the key for each datum.
    // If there a node associated with this key, join and add it to update.
    // If there is not (or the key is a duplicate), add it to enter.
    for (i = 0; i < dataLength; ++i) {
      keyValue = keyPrefix + key.call(parent, data[i], i, data);
      if ((node = nodeByKeyValue[keyValue])) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue[keyValue] = null;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Add any remaining nodes that were not bound to data to exit.
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && nodeByKeyValue[keyValues[i]] === node) {
        exit[i] = node;
      }
    }
  }

  function selection_data(value, key) {
    if (!value) {
      (data = new Array(this.size())), (j = -1);
      this.each(function (d) {
        data[++j] = d;
      });
      return data;
    }

    var bind = key ? bindKey : bindIndex,
      parents = this._parents,
      groups = this._groups;

    if (typeof value !== "function") value = constant$2(value);

    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j],
        group = groups[j],
        groupLength = group.length,
        data = value.call(parent, parent && parent.__data__, j, parents),
        dataLength = data.length,
        enterGroup = (enter[j] = new Array(dataLength)),
        updateGroup = (update[j] = new Array(dataLength)),
        exitGroup = (exit[j] = new Array(groupLength));

      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

      // Now connect the enter nodes to their following update node, such that
      // appendChild can insert the materialized enter node before this node,
      // rather than at the end of the parent node.
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if ((previous = enterGroup[i0])) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength);
          previous._next = next || null;
        }
      }
    }

    update = new Selection(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }

  function selection_exit() {
    return new Selection(this._exit || this._groups.map(sparse), this._parents);
  }

  function selection_join(onenter, onupdate, onexit) {
    var enter = this.enter(),
      update = this,
      exit = this.exit();
    enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
    if (onupdate != null) update = onupdate(update);
    if (onexit == null) exit.remove();
    else onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  function selection_merge(selection) {
    for (
      var groups0 = this._groups,
      groups1 = selection._groups,
      m0 = groups0.length,
      m1 = groups1.length,
      m = Math.min(m0, m1),
      merges = new Array(m0),
      j = 0;
      j < m;
      ++j
    ) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = (merges[j] = new Array(n)), node, i = 0; i < n; ++i) {
        if ((node = group0[i] || group1[i])) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Selection(merges, this._parents);
  }

  function selection_order() {
    for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
        if ((node = group[i])) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }

    return this;
  }

  function selection_sort(compare) {
    if (!compare) compare = ascending$1;

    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }

    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = (sortgroups[j] = new Array(n)), node, i = 0; i < n; ++i) {
        if ((node = group[i])) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }

    return new Selection(sortgroups, this._parents).order();
  }

  function ascending$1(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function selection_call() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  function selection_nodes() {
    var nodes = new Array(this.size()),
      i = -1;
    this.each(function () {
      nodes[++i] = this;
    });
    return nodes;
  }

  function selection_node() {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }

    return null;
  }

  function selection_size() {
    var size = 0;
    this.each(function () {
      ++size;
    });
    return size;
  }

  function selection_empty() {
    return !this.node();
  }

  function selection_each(callback) {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if ((node = group[i])) callback.call(node, node.__data__, i, group);
      }
    }

    return this;
  }

  function attrRemove(name) {
    return function () {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS(fullname) {
    return function () {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant(name, value) {
    return function () {
      this.setAttribute(name, value);
    };
  }

  function attrConstantNS(fullname, value) {
    return function () {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }

  function attrFunction(name, value) {
    return function () {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);
      else this.setAttribute(name, v);
    };
  }

  function attrFunctionNS(fullname, value) {
    return function () {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
      else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }

  function selection_attr(name, value) {
    var fullname = namespace(name);

    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
    }

    return this.each(
      (value == null
        ? fullname.local
          ? attrRemoveNS
          : attrRemove
        : typeof value === "function"
          ? fullname.local
            ? attrFunctionNS
            : attrFunction
          : fullname.local
            ? attrConstantNS
            : attrConstant)(fullname, value)
    );
  }

  function defaultView(node) {
    return (
      (node.ownerDocument && node.ownerDocument.defaultView) || // node is a Node
      (node.document && node) || // node is a Window
      node.defaultView
    ); // node is a Document
  }

  function styleRemove(name) {
    return function () {
      this.style.removeProperty(name);
    };
  }

  function styleConstant(name, value, priority) {
    return function () {
      this.style.setProperty(name, value, priority);
    };
  }

  function styleFunction(name, value, priority) {
    return function () {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);
      else this.style.setProperty(name, v, priority);
    };
  }

  function selection_style(name, value, priority) {
    return arguments.length > 1
      ? this.each(
        (value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)
      )
      : styleValue(this.node(), name);
  }

  function styleValue(node, name) {
    return node.style.getPropertyValue(name) || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  function propertyRemove(name) {
    return function () {
      delete this[name];
    };
  }

  function propertyConstant(name, value) {
    return function () {
      this[name] = value;
    };
  }

  function propertyFunction(name, value) {
    return function () {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];
      else this[name] = v;
    };
  }

  function selection_property(name, value) {
    return arguments.length > 1
      ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value))
      : this.node()[name];
  }

  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }

  function classList(node) {
    return node.classList || new ClassList(node);
  }

  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }

  ClassList.prototype = {
    add: function (name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function (name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function (name) {
      return this._names.indexOf(name) >= 0;
    },
  };

  function classedAdd(node, names) {
    var list = classList(node),
      i = -1,
      n = names.length;
    while (++i < n) list.add(names[i]);
  }

  function classedRemove(node, names) {
    var list = classList(node),
      i = -1,
      n = names.length;
    while (++i < n) list.remove(names[i]);
  }

  function classedTrue(names) {
    return function () {
      classedAdd(this, names);
    };
  }

  function classedFalse(names) {
    return function () {
      classedRemove(this, names);
    };
  }

  function classedFunction(names, value) {
    return function () {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }

  function selection_classed(name, value) {
    var names = classArray(name + "");

    if (arguments.length < 2) {
      var list = classList(this.node()),
        i = -1,
        n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }

    return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
  }

  function textRemove() {
    this.textContent = "";
  }

  function textConstant(value) {
    return function () {
      this.textContent = value;
    };
  }

  function textFunction(value) {
    return function () {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }

  function selection_text(value) {
    return arguments.length
      ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value))
      : this.node().textContent;
  }

  function htmlRemove() {
    this.innerHTML = "";
  }

  function htmlConstant(value) {
    return function () {
      this.innerHTML = value;
    };
  }

  function htmlFunction(value) {
    return function () {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }

  function selection_html(value) {
    return arguments.length
      ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value))
      : this.node().innerHTML;
  }

  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }

  function selection_raise() {
    return this.each(raise);
  }

  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }

  function selection_lower() {
    return this.each(lower);
  }

  function selection_append(name) {
    var create = typeof name === "function" ? name : creator(name);
    return this.select(function () {
      return this.appendChild(create.apply(this, arguments));
    });
  }

  function constantNull() {
    return null;
  }

  function selection_insert(name, before) {
    var create = typeof name === "function" ? name : creator(name),
      select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
    return this.select(function () {
      return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }

  function selection_remove() {
    return this.each(remove);
  }

  function selection_cloneShallow() {
    var clone = this.cloneNode(false),
      parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_cloneDeep() {
    var clone = this.cloneNode(true),
      parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }

  function selection_clone(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  function selection_datum(value) {
    return arguments.length ? this.property("__data__", value) : this.node().__data__;
  }

  var filterEvents = {};

  var event = null;

  if (typeof document !== "undefined") {
    var element = document.documentElement;
    if (!("onmouseenter" in element)) {
      filterEvents = { mouseenter: "mouseover", mouseleave: "mouseout" };
    }
  }

  function filterContextListener(listener, index, group) {
    listener = contextListener(listener, index, group);
    return function (event) {
      var related = event.relatedTarget;
      if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
        listener.call(this, event);
      }
    };
  }

  function contextListener(listener, index, group) {
    return function (event1) {
      var event0 = event; // Events can be reentrant (e.g., focus).
      event = event1;
      try {
        listener.call(this, this.__data__, index, group);
      } finally {
        event = event0;
      }
    };
  }

  function parseTypenames$1(typenames) {
    return typenames
      .trim()
      .split(/^|\s+/)
      .map(function (t) {
        var name = "",
          i = t.indexOf(".");
        if (i >= 0) (name = t.slice(i + 1)), (t = t.slice(0, i));
        return { type: t, name: name };
      });
  }

  function onRemove(typename) {
    return function () {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (((o = on[j]), (!typename.type || o.type === typename.type) && o.name === typename.name)) {
          this.removeEventListener(o.type, o.listener, o.capture);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;
      else delete this.__on;
    };
  }

  function onAdd(typename, value, capture) {
    var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
    return function (d, i, group) {
      var on = this.__on,
        o,
        listener = wrap(value, i, group);
      if (on)
        for (var j = 0, m = on.length; j < m; ++j) {
          if ((o = on[j]).type === typename.type && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.capture);
            this.addEventListener(o.type, (o.listener = listener), (o.capture = capture));
            o.value = value;
            return;
          }
        }
      this.addEventListener(typename.type, listener, capture);
      o = {
        type: typename.type,
        name: typename.name,
        value: value,
        listener: listener,
        capture: capture,
      };
      if (!on) this.__on = [o];
      else on.push(o);
    };
  }

  function selection_on(typename, value, capture) {
    var typenames = parseTypenames$1(typename + ""),
      i,
      n = typenames.length,
      t;

    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on)
        for (var j = 0, m = on.length, o; j < m; ++j) {
          for (i = 0, o = on[j]; i < n; ++i) {
            if ((t = typenames[i]).type === o.type && t.name === o.name) {
              return o.value;
            }
          }
        }
      return;
    }

    on = value ? onAdd : onRemove;
    if (capture == null) capture = false;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
    return this;
  }

  function customEvent(event1, listener, that, args) {
    var event0 = event;
    event1.sourceEvent = event;
    event = event1;
    try {
      return listener.apply(that, args);
    } finally {
      event = event0;
    }
  }

  function dispatchEvent(node, type, params) {
    var window = defaultView(node),
      event = window.CustomEvent;

    if (typeof event === "function") {
      event = new event(type, params);
    } else {
      event = window.document.createEvent("Event");
      if (params) event.initEvent(type, params.bubbles, params.cancelable), (event.detail = params.detail);
      else event.initEvent(type, false, false);
    }

    node.dispatchEvent(event);
  }

  function dispatchConstant(type, params) {
    return function () {
      return dispatchEvent(this, type, params);
    };
  }

  function dispatchFunction(type, params) {
    return function () {
      return dispatchEvent(this, type, params.apply(this, arguments));
    };
  }

  function selection_dispatch(type, params) {
    return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
  }

  var root = [null];

  function Selection(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }

  function selection() {
    return new Selection([[document.documentElement]], root);
  }

  Selection.prototype = selection.prototype = {
    constructor: Selection,
    select: selection_select,
    selectAll: selection_selectAll,
    filter: selection_filter,
    data: selection_data,
    enter: selection_enter,
    exit: selection_exit,
    join: selection_join,
    merge: selection_merge,
    order: selection_order,
    sort: selection_sort,
    call: selection_call,
    nodes: selection_nodes,
    node: selection_node,
    size: selection_size,
    empty: selection_empty,
    each: selection_each,
    attr: selection_attr,
    style: selection_style,
    property: selection_property,
    classed: selection_classed,
    text: selection_text,
    html: selection_html,
    raise: selection_raise,
    lower: selection_lower,
    append: selection_append,
    insert: selection_insert,
    remove: selection_remove,
    clone: selection_clone,
    datum: selection_datum,
    on: selection_on,
    dispatch: selection_dispatch,
  };

  function select(selector) {
    return typeof selector === "string"
      ? new Selection([[document.querySelector(selector)]], [document.documentElement])
      : new Selection([[selector]], root);
  }

  function sourceEvent() {
    var current = event,
      source;
    while ((source = current.sourceEvent)) current = source;
    return current;
  }

  function point(node, event) {
    var svg = node.ownerSVGElement || node;

    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      (point.x = event.clientX), (point.y = event.clientY);
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }

    var rect = node.getBoundingClientRect();
    return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
  }

  function mouse(node) {
    var event = sourceEvent();
    if (event.changedTouches) event = event.changedTouches[0];
    return point(node, event);
  }

  function touch(node, touches, identifier) {
    if (arguments.length < 3) (identifier = touches), (touches = sourceEvent().changedTouches);

    for (var i = 0, n = touches ? touches.length : 0, touch; i < n; ++i) {
      if ((touch = touches[i]).identifier === identifier) {
        return point(node, touch);
      }
    }

    return null;
  }

  function nopropagation() {
    event.stopImmediatePropagation();
  }

  function noevent() {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function nodrag(view) {
    var root = view.document.documentElement,
      selection = select(view).on("dragstart.drag", noevent, true);
    if ("onselectstart" in root) {
      selection.on("selectstart.drag", noevent, true);
    } else {
      root.__noselect = root.style.MozUserSelect;
      root.style.MozUserSelect = "none";
    }
  }

  function yesdrag(view, noclick) {
    var root = view.document.documentElement,
      selection = select(view).on("dragstart.drag", null);
    if (noclick) {
      selection.on("click.drag", noevent, true);
      setTimeout(function () {
        selection.on("click.drag", null);
      }, 0);
    }
    if ("onselectstart" in root) {
      selection.on("selectstart.drag", null);
    } else {
      root.style.MozUserSelect = root.__noselect;
      delete root.__noselect;
    }
  }

  function constant$3(x) {
    return function () {
      return x;
    };
  }

  function DragEvent(target, type, subject, id, active, x, y, dx, dy, dispatch) {
    this.target = target;
    this.type = type;
    this.subject = subject;
    this.identifier = id;
    this.active = active;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this._ = dispatch;
  }

  DragEvent.prototype.on = function () {
    var value = this._.on.apply(this._, arguments);
    return value === this._ ? this : value;
  };

  // Ignore right-click, since that should open the context menu.
  function defaultFilter() {
    return !event.ctrlKey && !event.button;
  }

  function defaultContainer() {
    return this.parentNode;
  }

  function defaultSubject(d) {
    return d == null ? { x: event.x, y: event.y } : d;
  }

  function defaultTouchable() {
    return navigator.maxTouchPoints || "ontouchstart" in this;
  }

  function drag() {
    var filter = defaultFilter,
      container = defaultContainer,
      subject = defaultSubject,
      touchable = defaultTouchable,
      gestures = {},
      listeners = dispatch("start", "drag", "end"),
      active = 0,
      mousedownx,
      mousedowny,
      mousemoving,
      touchending,
      clickDistance2 = 0;

    function drag(selection) {
      selection
        .on("mousedown.drag", mousedowned)
        .filter(touchable)
        .on("touchstart.drag", touchstarted)
        .on("touchmove.drag", touchmoved)
        .on("touchend.drag touchcancel.drag", touchended)
        .style("touch-action", "none")
        .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
    }

    function mousedowned() {
      if (touchending || !filter.apply(this, arguments)) return;
      var gesture = beforestart("mouse", container.apply(this, arguments), mouse, this, arguments);
      if (!gesture) return;
      select(event.view).on("mousemove.drag", mousemoved, true).on("mouseup.drag", mouseupped, true);
      nodrag(event.view);
      nopropagation();
      mousemoving = false;
      mousedownx = event.clientX;
      mousedowny = event.clientY;
      gesture("start");
    }

    function mousemoved() {
      noevent();
      if (!mousemoving) {
        var dx = event.clientX - mousedownx,
          dy = event.clientY - mousedowny;
        mousemoving = dx * dx + dy * dy > clickDistance2;
      }
      gestures.mouse("drag");
    }

    function mouseupped() {
      select(event.view).on("mousemove.drag mouseup.drag", null);
      yesdrag(event.view, mousemoving);
      noevent();
      gestures.mouse("end");
    }

    function touchstarted() {
      if (!filter.apply(this, arguments)) return;
      var touches = event.changedTouches,
        c = container.apply(this, arguments),
        n = touches.length,
        i,
        gesture;

      for (i = 0; i < n; ++i) {
        if ((gesture = beforestart(touches[i].identifier, c, touch, this, arguments))) {
          nopropagation();
          gesture("start");
        }
      }
    }

    function touchmoved() {
      var touches = event.changedTouches,
        n = touches.length,
        i,
        gesture;

      for (i = 0; i < n; ++i) {
        if ((gesture = gestures[touches[i].identifier])) {
          noevent();
          gesture("drag");
        }
      }
    }

    function touchended() {
      var touches = event.changedTouches,
        n = touches.length,
        i,
        gesture;

      if (touchending) clearTimeout(touchending);
      touchending = setTimeout(function () {
        touchending = null;
      }, 500); // Ghost clicks are delayed!
      for (i = 0; i < n; ++i) {
        if ((gesture = gestures[touches[i].identifier])) {
          nopropagation();
          gesture("end");
        }
      }
    }

    function beforestart(id, container, point, that, args) {
      var p = point(container, id),
        s,
        dx,
        dy,
        sublisteners = listeners.copy();

      if (
        !customEvent(new DragEvent(drag, "beforestart", s, id, active, p[0], p[1], 0, 0, sublisteners), function () {
          if ((event.subject = s = subject.apply(that, args)) == null) return false;
          dx = s.x - p[0] || 0;
          dy = s.y - p[1] || 0;
          return true;
        })
      )
        return;

      return function gesture(type) {
        var p0 = p,
          n;
        switch (type) {
          case "start":
            (gestures[id] = gesture), (n = active++);
            break;
          case "end":
            delete gestures[id], --active; // nobreak
          case "drag":
            (p = point(container, id)), (n = active);
            break;
        }
        customEvent(
          new DragEvent(drag, type, s, id, n, p[0] + dx, p[1] + dy, p[0] - p0[0], p[1] - p0[1], sublisteners),
          sublisteners.apply,
          sublisteners,
          [type, that, args]
        );
      };
    }

    drag.filter = function (_) {
      return arguments.length ? ((filter = typeof _ === "function" ? _ : constant$3(!!_)), drag) : filter;
    };

    drag.container = function (_) {
      return arguments.length ? ((container = typeof _ === "function" ? _ : constant$3(_)), drag) : container;
    };

    drag.subject = function (_) {
      return arguments.length ? ((subject = typeof _ === "function" ? _ : constant$3(_)), drag) : subject;
    };

    drag.touchable = function (_) {
      return arguments.length ? ((touchable = typeof _ === "function" ? _ : constant$3(!!_)), drag) : touchable;
    };

    drag.on = function () {
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? drag : value;
    };

    drag.clickDistance = function (_) {
      return arguments.length ? ((clickDistance2 = (_ = +_) * _), drag) : Math.sqrt(clickDistance2);
    };

    return drag;
  }

  // Copyright 2018 The Distill Template Authors

  const T$a = Template(
    "d-slider",
    `
<style>
  :host {
    position: relative;
    display: inline-block;
  }

  :host(:focus) {
    outline: none;
  }

  .background {
    padding: 9px 0;
    color: white;
    position: relative;
  }

  .track {
    height: 3px;
    width: 100%;
    border-radius: 2px;
    background-color: hsla(0, 0%, 0%, 0.2);
  }

  .track-fill {
    position: absolute;
    top: 9px;
    height: 3px;
    border-radius: 4px;
    background-color: hsl(24, 100%, 50%);
  }

  .knob-container {
    position: absolute;
    top: 10px;
  }

  .knob {
    position: absolute;
    top: -6px;
    left: -6px;
    width: 13px;
    height: 13px;
    background-color: hsl(24, 100%, 50%);
    border-radius: 50%;
    transition-property: transform;
    transition-duration: 0.18s;
    transition-timing-function: ease;
  }
  .mousedown .knob {
    transform: scale(1.5);
  }

  .knob-highlight {
    position: absolute;
    top: -6px;
    left: -6px;
    width: 13px;
    height: 13px;
    background-color: hsla(0, 0%, 0%, 0.1);
    border-radius: 50%;
    transition-property: transform;
    transition-duration: 0.18s;
    transition-timing-function: ease;
  }

  .focus .knob-highlight {
    transform: scale(2);
  }

  .ticks {
    position: absolute;
    top: 16px;
    height: 4px;
    width: 100%;
    z-index: -1;
  }

  .ticks .tick {
    position: absolute;
    height: 100%;
    border-left: 1px solid hsla(0, 0%, 0%, 0.2);
  }

</style>

  <div class='background'>
    <div class='track'></div>
    <div class='track-fill'></div>
    <div class='knob-container'>
      <div class='knob-highlight'></div>
      <div class='knob'></div>
    </div>
    <div class='ticks'></div>
  </div>
`
  );

  // ARIA
  // If the slider has a visible label, it is referenced by aria-labelledby on the slider element. Otherwise, the slider element has a label provided by aria-label.
  // If the slider is vertically oriented, it has aria-orientation set to vertical. The default value of aria-orientation for a slider is horizontal.

  const keyCodes = {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    pageUp: 33,
    pageDown: 34,
    end: 35,
    home: 36,
  };

  class Slider extends T$a(HTMLElement) {
    connectedCallback() {
      this.connected = true;
      this.setAttribute("role", "slider");
      // Makes the element tab-able.
      if (!this.hasAttribute("tabindex")) {
        this.setAttribute("tabindex", 0);
      }

      // Keeps track of keyboard vs. mouse interactions for focus rings
      this.mouseEvent = false;

      // Handles to shadow DOM elements
      this.knob = this.root.querySelector(".knob-container");
      this.background = this.root.querySelector(".background");
      this.trackFill = this.root.querySelector(".track-fill");
      this.track = this.root.querySelector(".track");

      // Default values for attributes
      this.min = this.min ? this.min : 0;
      this.max = this.max ? this.max : 100;
      this.scale = linear$1().domain([this.min, this.max]).range([0, 1]).clamp(true);

      this.origin = this.origin !== undefined ? this.origin : this.min;
      this.step = this.step ? this.step : 1;
      this.update(this.value ? this.value : 0);

      this.ticks = this.ticks ? this.ticks : false;
      this.renderTicks();

      this.drag = drag()
        .container(this.background)
        .on("start", () => {
          this.mouseEvent = true;
          this.background.classList.add("mousedown");
          this.changeValue = this.value;
          this.dragUpdate();
        })
        .on("drag", () => {
          this.dragUpdate();
        })
        .on("end", () => {
          this.mouseEvent = false;
          this.background.classList.remove("mousedown");
          this.dragUpdate();
          if (this.changeValue !== this.value) this.dispatchChange();
          this.changeValue = this.value;
        });
      this.drag(select(this.background));

      this.addEventListener("focusin", () => {
        if (!this.mouseEvent) {
          this.background.classList.add("focus");
        }
      });
      this.addEventListener("focusout", () => {
        this.background.classList.remove("focus");
      });
      this.addEventListener("keydown", this.onKeyDown);
    }

    static get observedAttributes() {
      return ["min", "max", "value", "step", "ticks", "origin", "tickValues", "tickLabels"];
    }

    attributeChangedCallback(attr, oldValue, newValue) {
      if (isNaN(newValue) || newValue === undefined || newValue === null) return;
      if (attr == "min") {
        this.min = +newValue;
        this.setAttribute("aria-valuemin", this.min);
      }
      if (attr == "max") {
        this.max = +newValue;
        this.setAttribute("aria-valuemax", this.max);
      }
      if (attr == "value") {
        this.update(+newValue);
      }
      if (attr == "origin") {
        this.origin = +newValue;
        // this.update(this.value);
      }
      if (attr == "step") {
        if (newValue > 0) {
          this.step = +newValue;
        }
      }
      if (attr == "ticks") {
        this.ticks = newValue === "" ? true : newValue;
      }
    }

    onKeyDown(event) {
      this.changeValue = this.value;
      let stopPropagation = false;
      switch (event.keyCode) {
        case keyCodes.left:
        case keyCodes.down:
          this.update(this.value - this.step);
          stopPropagation = true;
          break;
        case keyCodes.right:
        case keyCodes.up:
          this.update(this.value + this.step);
          stopPropagation = true;
          break;
        case keyCodes.pageUp:
          this.update(this.value + this.step * 10);
          stopPropagation = true;
          break;

        case keyCodes.pageDown:
          this.update(this.value + this.step * 10);
          stopPropagation = true;
          break;
        case keyCodes.home:
          this.update(this.min);
          stopPropagation = true;
          break;
        case keyCodes.end:
          this.update(this.max);
          stopPropagation = true;
          break;
      }
      if (stopPropagation) {
        this.background.classList.add("focus");
        event.preventDefault();
        event.stopPropagation();
        if (this.changeValue !== this.value) this.dispatchChange();
      }
    }

    validateValueRange(min, max, value) {
      return Math.max(Math.min(max, value), min);
    }

    quantizeValue(value, step) {
      return Math.round(value / step) * step;
    }

    dragUpdate() {
      const bbox = this.background.getBoundingClientRect();
      const x = event.x;
      const width = bbox.width;
      this.update(this.scale.invert(x / width));
    }

    update(value) {
      let v = value;
      if (this.step !== "any") {
        v = this.quantizeValue(value, this.step);
      }
      v = this.validateValueRange(this.min, this.max, v);
      if (this.connected) {
        this.knob.style.left = this.scale(v) * 100 + "%";
        this.trackFill.style.width = this.scale(this.min + Math.abs(v - this.origin)) * 100 + "%";
        this.trackFill.style.left = this.scale(Math.min(v, this.origin)) * 100 + "%";
      }
      if (this.value !== v) {
        this.value = v;
        this.setAttribute("aria-valuenow", this.value);
        this.dispatchInput();
      }
    }

    // Dispatches only on a committed change (basically only on mouseup).
    dispatchChange() {
      const e = new Event("change");
      this.dispatchEvent(e, {});
    }

    // Dispatches on each value change.
    dispatchInput() {
      const e = new Event("input");
      this.dispatchEvent(e, {});
    }

    renderTicks() {
      const ticksContainer = this.root.querySelector(".ticks");
      if (this.ticks !== false) {
        let tickData = [];
        if (this.ticks > 0) {
          tickData = this.scale.ticks(this.ticks);
        } else if (this.step === "any") {
          tickData = this.scale.ticks();
        } else {
          tickData = range(this.min, this.max + 1e-6, this.step);
        }
        tickData.forEach((d) => {
          const tick = document.createElement("div");
          tick.classList.add("tick");
          tick.style.left = this.scale(d) * 100 + "%";
          ticksContainer.appendChild(tick);
        });
      } else {
        ticksContainer.style.display = "none";
      }
    }
  }

  var logo =
    '<svg viewBox="-607 419 64 64">\n  <path d="M-573.4,478.9c-8,0-14.6-6.4-14.6-14.5s14.6-25.9,14.6-40.8c0,14.9,14.6,32.8,14.6,40.8S-565.4,478.9-573.4,478.9z"/>\n</svg>\n';

  const headerTemplate = `
<style>
distill-header {
  position: relative;
  height: 60px;
  background-color: hsl(200, 60%, 15%);
  width: 100%;
  box-sizing: border-box;
  z-index: 2;
  color: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}
distill-header .content {
  height: 70px;
  grid-column: page;
}
distill-header a {
  font-size: 16px;
  height: 60px;
  line-height: 60px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  padding: 22px 0;
}
distill-header a:hover {
  color: rgba(255, 255, 255, 1);
}
distill-header svg {
  width: 24px;
  position: relative;
  top: 4px;
  margin-right: 2px;
}
@media(min-width: 1080px) {
  distill-header {
    height: 70px;
  }
  distill-header a {
    height: 70px;
    line-height: 70px;
    padding: 28px 0;
  }
  distill-header .logo {
  }
}
distill-header svg path {
  fill: none;
  stroke: rgba(255, 255, 255, 0.8);
  stroke-width: 3px;
}
distill-header .logo {
  font-size: 17px;
  font-weight: 200;
}
distill-header .nav {
  float: right;
  font-weight: 300;
}
distill-header .nav a {
  font-size: 12px;
  margin-left: 24px;
  text-transform: uppercase;
}
</style>
<div class="content">
  <a href="/" class="logo">
    ${logo}
    Distill
  </a>
  <nav class="nav">
    <a href="/about/">About</a>
    <a href="/prize/">Prize</a>
    <a href="/journal/">Submit</a>
  </nav>
</div>
`;

  // Copyright 2018 The Distill Template Authors

  const T$b = Template("distill-header", headerTemplate, false);

  class DistillHeader extends T$b(HTMLElement) { }

  // Copyright 2018 The Distill Template Authors

  const styles$2 = `
<style>
  distill-appendix {
    contain: layout style;
  }

  distill-appendix .citation {
    font-size: 11px;
    line-height: 15px;
    border-left: 1px solid rgba(0, 0, 0, 0.1);
    padding-left: 18px;
    border: 1px solid rgba(0,0,0,0.1);
    background: rgba(0, 0, 0, 0.02);
    padding: 10px 18px;
    border-radius: 3px;
    color: rgba(150, 150, 150, 1);
    overflow: hidden;
    margin-top: -12px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  distill-appendix > * {
    grid-column: text;
  }
</style>
`;

  function appendixTemplate(frontMatter) {
    let html = styles$2;

    if (typeof frontMatter.githubUrl !== "undefined") {
      html += `
    <h3 id="updates-and-corrections">Updates and Corrections</h3>
    <p>`;
      if (frontMatter.githubCompareUpdatesUrl) {
        html += `<a href="${frontMatter.githubCompareUpdatesUrl}">View all changes</a> to this article since it was first published.`;
      }
      html += `
    If you see mistakes or want to suggest changes, please <a href="${frontMatter.githubUrl + "/issues/new"}">create an issue on GitHub</a>. </p>
    `;
    }

    const journal = frontMatter.journal;
    if (typeof journal !== "undefined" && journal.title === "Distill") {
      html += `
    <h3 id="reuse">Reuse</h3>
    <p>Diagrams and text are licensed under Creative Commons Attribution <a href="https://creativecommons.org/licenses/by/4.0/">CC-BY 4.0</a> with the <a class="github" href="${frontMatter.githubUrl}">source available on GitHub</a>, unless noted otherwise. The figures that have been reused from other sources don’t fall under this license and can be recognized by a note in their caption: “Figure from …”.</p>
    `;
    }

    if (typeof frontMatter.publishedDate !== "undefined") {
      html += `
    <h3 id="citation">Citation</h3>
    <p>For attribution in academic contexts, please cite this work as</p>
    <pre class="citation short">${frontMatter.concatenatedAuthors}, "${frontMatter.title}", Distill, ${frontMatter.publishedYear}.</pre>
    <p>BibTeX citation</p>
    <pre class="citation long">${serializeFrontmatterToBibtex(frontMatter)}</pre>
    `;
    }

    return html;
  }

  class DistillAppendix extends HTMLElement {
    static get is() {
      return "distill-appendix";
    }

    set frontMatter(frontMatter) {
      this.innerHTML = appendixTemplate(frontMatter);
    }
  }

  const footerTemplate = `
<style>

:host {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 300;
  padding: 2rem 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background-color: hsl(180, 5%, 15%); /*hsl(200, 60%, 15%);*/
  text-align: left;
  contain: content;
}

.footer-container .logo svg {
  width: 24px;
  position: relative;
  top: 4px;
  margin-right: 2px;
}

.footer-container .logo svg path {
  fill: none;
  stroke: rgba(255, 255, 255, 0.8);
  stroke-width: 3px;
}

.footer-container .logo {
  font-size: 17px;
  font-weight: 200;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  margin-right: 6px;
}

.footer-container {
  grid-column: text;
}

.footer-container .nav {
  font-size: 0.9em;
  margin-top: 1.5em;
}

.footer-container .nav a {
  color: rgba(255, 255, 255, 0.8);
  margin-right: 6px;
  text-decoration: none;
}

</style>

<div class='footer-container'>

  <a href="/" class="logo">
    ${logo}
    Distill
  </a> is dedicated to clear explanations of machine learning

  <div class="nav">
    <a href="https://distill.pub/about/">About</a>
    <a href="https://distill.pub/journal/">Submit</a>
    <a href="https://distill.pub/prize/">Prize</a>
    <a href="https://distill.pub/archive/">Archive</a>
    <a href="https://distill.pub/rss.xml">RSS</a>
    <a href="https://github.com/distillpub">GitHub</a>
    <a href="https://twitter.com/distillpub">Twitter</a>
    &nbsp;&nbsp;&nbsp;&nbsp; ISSN 2476-0757
  </div>

</div>

`;

  // Copyright 2018 The Distill Template Authors

  const T$c = Template("distill-footer", footerTemplate);

  class DistillFooter extends T$c(HTMLElement) { }

  // Copyright 2018 The Distill Template Authors

  let templateIsLoading = false;
  let runlevel = 0;
  const initialize = function () {
    if (window.distill.runlevel < 1) {
      throw new Error("Insufficient Runlevel for Distill Template!");
    }

    /* 1. Flag that we're being loaded */
    if ("distill" in window && window.distill.templateIsLoading) {
      throw new Error("Runlevel 1: Distill Template is getting loaded more than once, aborting!");
    } else {
      window.distill.templateIsLoading = true;
      console.debug("Runlevel 1: Distill Template has started loading.");
    }

    /* 2. Add styles if they weren't added during prerendering */
    makeStyleTag(document);
    console.debug("Runlevel 1: Static Distill styles have been added.");
    console.debug("Runlevel 1->2.");
    window.distill.runlevel += 1;

    /* 3. Register Controller listener functions */
    /* Needs to happen before components to their connected callbacks have a controller to talk to. */
    for (const [functionName, callback] of Object.entries(Controller.listeners)) {
      if (typeof callback === "function") {
        document.addEventListener(functionName, callback);
      } else {
        console.error("Runlevel 2: Controller listeners need to be functions!");
      }
    }
    console.debug("Runlevel 2: We can now listen to controller events.");
    console.debug("Runlevel 2->3.");
    window.distill.runlevel += 1;

    /* 4. Register components */
    const components = [
      Abstract,
      Appendix,
      Article,
      Bibliography,
      Byline,
      Cite,
      CitationList,
      Footnote,
      FootnoteList,
      FrontMatter$1,
      HoverBox,
      Title,
      DMath,
      References,
      TOC,
      Figure,
      Slider,
      Interstitial,
    ];

    const distillComponents = [DistillHeader, DistillAppendix, DistillFooter];

    if (window.distill.runlevel < 2) {
      throw new Error("Insufficient Runlevel for adding custom elements!");
    }
    const allComponents = components.concat(distillComponents);
    for (const component of allComponents) {
      console.debug("Runlevel 2: Registering custom element: " + component.is);
      customElements.define(component.is, component);
    }

    console.debug("Runlevel 3: Distill Template finished registering custom elements.");
    console.debug("Runlevel 3->4.");
    window.distill.runlevel += 1;

    // If template was added after DOMContentLoaded we may have missed that event.
    // Controller will check for that case, so trigger the event explicitly:
    if (domContentLoaded()) {
      Controller.listeners.DOMContentLoaded();
    }

    console.debug("Runlevel 4: Distill Template initialisation complete.");
    window.distill.templateIsLoading = false;
    window.distill.templateHasLoaded = true;
  };

  window.distill = { runlevel, initialize, templateIsLoading };

  /* 0. Check browser feature support; synchronously polyfill if needed */
  if (Polyfills.browserSupportsAllFeatures()) {
    console.debug("Runlevel 0: No need for polyfills.");
    console.debug("Runlevel 0->1.");
    window.distill.runlevel += 1;
    window.distill.initialize();
  } else {
    console.debug("Runlevel 0: Distill Template is loading polyfills.");
    Polyfills.load(window.distill.initialize);
  }
});
//# sourceMappingURL=template.v2.js.map