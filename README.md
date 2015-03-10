#WSolver
*A simple JavaScript Word Search solving library and canvas renderer.*

**[Example: Solving, Loading, Creating, Import/Export, Word Toggling, and Rendering. Options.](http://tribex.github.io/wsolver/example/index.html)**

---
###About:
This was a quick-and-dirty project to help deal with a recent burnout, as well as begin learning a few new technologies which I have yet to get my hands on.

It is capable of solving Word Search (Word Grid) problems quickly and efficiently, and has several flexible HTML Canvas renderers.

I highly doubt that anyone will ever be in need of such a library, but I'll stick it up here on GitHub anyways.

#####Learned During this Project:
  * HTML5 Canvas drawing basics - [Excellent Resource](http://www.html5canvastutorials.com/)
  * In's-and-out's of the remarkable [PhotonUI](http://wanadev.github.io/PhotonUI/). I might fork this at a later date to fix a few issues.

####Dependencies:
  * Globally-accessable [jQuery](http://jquery.com).

I might change this eventually to support CommonJS modules properly.

---
###Solver Usage:
**Loading (Browser):**
```html
  <script src="path/to/wsolver.js"></script>
```

**Loading (CommonJS):**

*Note: The CommonJS version still requires a global jQuery `$` object.*
```javascript
  var wsolver = require('./path/to/wsolver.js');
```

**Parse WordSearch Text: (see File Format)**
```javascript
var wordSearchObject = wsolver.parseTextSearch(formattedWordSearchString);


// Word Search Object format:
var wordSearchObjectFmt = {
  // Array of grid lines.
  grid: [
    'ASWORD1RIWOLC',
    'KSMDFI2DROWKR',
    ...
  ],
  
  // Array of words to be matched.
  words: [
    'word1',
    'word2',
    ...
  ]
}

```

**Find Matches:**
```javascript
var finderOptions = {
  //Whether or not to locate additional matches after the word has been found once.
  allowMultiple: false
}
//Options may be omitted.
var matchObject = wsolver.findMatches(wordSearchObject, finderOptions);


//Match Object Format:
  var matchObjectFmt = {
    //An array is used since a word may be found multiple times.
    //If options.allowMultiple is false, the length will always be 1.
    'word1': [
      {
        word: 'word1', //For convenience.
        //Self explanatory.
        firstLetterPosition: {line: 0, index: 2},
        lastLetterPosition: {line: 0, index: 6},
        currentLetterIndex: 4, //Index of the last tested letter in the word. (Will always be word.length-1)
        searchDirection: 3, // Integer, indicates the direction searched when the word was found. 0-7, clockwise NORTH-WEST through WEST.
        success: true, // Whether or not the word was found. If false, most of the values above will be useless.
      },
      ...
    ],
    'word2': [
      {
        word: 'word2',
        firstLetterPosition: {line: 1, index: 10},
        lastLetterPosition: {line: 1, index: 6},
        currentLetterIndex: 4,
        searchDirection: 7,
        success: true,
      }
    ],
    ...
  ]
}

```

**File Format:**
The solver supports a simple file format for direct loading. An example file (say, `wordsearch.txt`) would look like this:
```
# Comments are supported with a # character, in-line comments are not supported.
# The search grid is rather straightforward.
WMKIMH
DAMKFO
LDFNUU
BMKFMS
TIWOLE
MKDASE
# The grid is separated from the word list by three dash characters.
---
# One word per-line. Words are case-insensitive and may contain whitespace.
waffle
house
```
It can then be loaded from the server using:
```javascript
wsolver.loadFile('wordsearch.txt', function(wordSearchObject) {
  // Do stuff with it here.
});
```
---
###Renderer Usage:
The renderer is entirely separate from the solver, and therefore does not need to be included. You can write your own renderer as well.

**Loading (Browser):**
```html
  <script src="path/to/wsrenderer.js"></script>
```

**Loading (CommonJS):**

*Note: The CommonJS version still requires a global jQuery `$` object.*
```javascript
  var wsrenderer = require('./path/to/wsrenderer.js');
```

**General Example:**
```javascript
var gridRenderer = new wsrenderer.SimpleGridRenderer();
// SimpleGridRenderer(options)
  
var matchRenderer = new wsrenderer.CapsuleMatchRenderer(); //new wsrenderer.LineMatchRenderer();
// CapsuleMatchRenderer(options) | LineMatchRenderer(options)
  
var renderer = new wsrenderer.CanvasRenderer(document.getElementById('wordsearch-canvas'), wordSearchObject, gridRenderer, matchRenderer, {})
// CanvasRenderer(canvasElement, wordSearchObject, gridRenderer, matchRenderer, options)
//Setter methods are provided for specifying the arguments above at a later date.

renderer.resize();
renderer.clear();
renderer.drawGrid();
renderer.drawMatches(wsolver.findMatches(wordSearchObject));
```

**CanvasRenderer Options:**
```javascript
{
  letterSpacing: 17, // Space (in pixels) between letters in the grid.
  extraPadding: 0.5, // Extra padding around the borders of the canvas. Needs adjusting for some fonts.
}
```

**SimpleGridRenderer Options:**
```javascript
{
  font: "15px sans-serif", // Canvas/CSS font property
  fontColor: "#000000", // Canvas/CSS color property.
}
```

**LineMatchRenderer Options:**
```javascript
{
  strokeWidth: 4,  // Width (in pixels) of the line.
  strokeCap: "round", // Canvas lineCap property. ("round" | "butt" | "square")
  coloringFunction: function(match, stage) { // Defines the color of the line. With some creativity this can be quite useful.
    return "rgba(200, 0, 0, 1)"; // Medium-red, fully opaque.
  }
}
```
**CapsuleMatchRenderer Options:**
The CapsuleMatchRenderer is the most complex, allowing for quite a few combinations of looks. See example.
```javascript
{
  padding: 0, // Padding (in pixels) between the letters and capsule border.
  strokeWidth: 2, // Width (in pixels) of the capsule border.
  drawStroke: true, // Whether or not to draw the capsule border.
  drawFill: false, // Whether or not to fill the space inside the capsule border.
  highlightStart: true, // Whether or not to draw a circle around the first letter of a match.
  coloringFunction: function(match, stage) { // Defines the color of the drawn match parts. Called for every draw stage.
    //All stages: "stroke", "fill", "highlight"
    if(stage == "stroke") { // Border stroke. Medium-red, fully opaque.
      return "rgba(200,0,0, 1)";
    } else if (stage == "fill") { // Fill color. Black, 0.2 opacity.
      return "rgba(0,0,0, 0.2)";
    } else if (stage == "highlight") { // Highlight color. Medium-red, 0.6 opacity.
      return "rgba(200,0,0, 0.6)";
    }
  }
}
```

###License:
```
The MIT License (MIT)

Copyright (c) 2015, Joshua Michael Bemenderfer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
