// The MIT License (MIT)
//
// Copyright (c) 2015, Joshua Michael Bemenderfer (Tribex)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// File: wsolver.js
// Description: Provides the solving capabilites for wsolver.
// Author: Joshua Michael Bemenderfer (Tribex)
// Date Created: 3/7/2015

// Self-executing anonymous function to allow support for both CommonJS and Browser environments.
(function (root, factory) {
  // Assign to module.exports if the environment supports CommonJS.
  // If root.wsolver is already defined/truthy, use a Browser version nonetheless.
  // ^ Useful for nw.js or atom-shell where you might want to still use the global version.
  if(typeof module === "object" && module.exports && !root.wsolver) {
    module.exports = factory();
  
  // Otherwise use a global variable.
  } else {
    root.wsolver = factory();
  }

}(this, function() {
  var solver = {};

  solver.loadFile = function(file, cb) {
    $.ajax({
      url: file,
      cache: false,
      type: 'text',
      method: 'POST',
    }).done(function(data) {
      var ws = solver.parseTextSearch(data);
      cb ? cb(ws) : null;
    }).fail(function(xhr) {
      cb ? cb("ERROR: Unable to load file: "+file) : null;
    });
  };

  solver.parseTextSearch = function(text) {
    //Remove comments.
    text = text.replace(/\#.*(\r\n|\n|\r)/g, "");
    
    var splitText = text.split("\n---\n");
    if(splitText.length > 1) {
      var rawLines = splitText[0].split("\n");
      var rawWords = splitText[1].split("\n");
    
      rawWords = solver._sanitizeArr(rawWords);
  
      if(rawLines.length > 0 && rawWords.length > 0) {
        // ** Word search definition ** //
        var wsObject = {
          //Set these later, reqires extra parsing
          grid: rawLines,
          //Good to go
          words: rawWords,
        }
        return wsObject;
      }
    }
    return {grid: [], words: []};
  }
  
  solver.exportToText = function(ws) {
    var gridText = ws.grid.join("\n");
    var wordText = ws.words.join("\n");
    
    return gridText+"\n---\n"+wordText;
  }

  solver.findMatches = function(ws, options) {
    var allowMultiple = false;
    if(options && options.allowMultiple) allowMultiple = true;
    
    var matches = {};
    for(var i = 0; i < ws.words.length; i++) {
      var thisWord = ws.words[i];
      var wordMatches = solver.findWord(ws, thisWord, allowMultiple);
        matches[thisWord] = wordMatches;
    }
    return matches;
  }

  solver.findWord = function(ws, word, allowMultiple) {
    var firstLetterPositions = solver.getCharPositions(ws, word[0]);
    
    var matches = [];
    
    var matchTemplate = {
      word: word,
      firstLetterPosition: null,
      lastLetterPosition: null,
      currentLetterIndex: 0,
      searchDirection: null,
      success: false,
    }

    for(var i = 0; i < firstLetterPositions.length; i++) {
      var matchObject = $.extend(true, {}, matchTemplate);
      matchObject.firstLetterPosition = firstLetterPositions[i];
      matchObject.lastLetterPosition = firstLetterPositions[i];
      matchObject.currentLetterIndex = 1;
      
      for(var i2 = 0; i2 < 8; i2++) {
        matchObject.searchDirection = i2;
        if(solver.searchRecursive(ws, matchObject)) {
          matchObject.success = true;
          matches.push(matchObject);
          
          if(allowMultiple) {
            break;
          } else {
            return matches;
          }
        }
      }
    }
    
    if(matches.length == 0) {
      var matchObject = $.extend(true, {}, matchTemplate);
      matches.push(matchObject);
    }
    
    return matches;
  }

  solver.searchRecursive = function(ws, mo) {
    var grid = ws.grid;
    
    var testData = null;
    switch (mo.searchDirection) {
      case 0:
        var testData = solver.getSafeCharAt(ws, mo.lastLetterPosition.line-1, mo.lastLetterPosition.index-1);
        break;
      case 1:
        var testData = solver.getSafeCharAt(ws, mo.lastLetterPosition.line-1, mo.lastLetterPosition.index);
        break;
      case 2:
        var testData = solver.getSafeCharAt(ws, mo.lastLetterPosition.line-1, mo.lastLetterPosition.index+1);
        break;
      case 3:
        var testData = solver.getSafeCharAt(ws, mo.lastLetterPosition.line, mo.lastLetterPosition.index+1);
        break;
      case 4:
        var testData = solver.getSafeCharAt(ws, mo.lastLetterPosition.line+1, mo.lastLetterPosition.index+1);
        break;
      case 5:
        var testData = solver.getSafeCharAt(ws, mo.lastLetterPosition.line+1, mo.lastLetterPosition.index);
        break;
      case 6:
        var testData = solver.getSafeCharAt(ws, mo.lastLetterPosition.line+1, mo.lastLetterPosition.index-1);
        break;
      case 7:
        var testData = solver.getSafeCharAt(ws, mo.lastLetterPosition.line, mo.lastLetterPosition.index-1);
        break;
    }
    
    if((mo.word[mo.currentLetterIndex] && testData.char) &&
      (mo.word[mo.currentLetterIndex].toUpperCase() == testData.char.toUpperCase())) {

      mo.lastLetterPosition = testData;
      if(mo.word.length == mo.currentLetterIndex+1) {
        return true;
      } else {
        mo.currentLetterIndex += 1;
        return solver.searchRecursive(ws, mo);
      }
    } else {
      mo.lastLetterPosition = mo.firstLetterPosition;
      mo.currentLetterIndex = 1;
      return false;
    }
  }

  solver.getCharPositions = function(ws, char) {
    var positions = [];
    for(var i = 0; i < ws.grid.length; i++) {
      var line = ws.grid[i]
      for(var i2 = 0; i2 < line.length; i2++) {
        if((line[i2] && char) && (line[i2].toUpperCase() == char.toUpperCase()))
          positions.push({char: char, line: i, index: i2});
      }
    }
    
    return positions;
  }

  solver.getSafeCharAt = function(ws, lineIndex, index) {
    var line = ws.grid[lineIndex];
    if(line) {
      var char = line[index];
      if(char) {
        return {char: char, line: lineIndex, index: index};
      }
    }
    return false;
  }

  // ** UTILITY FUNCTIONS ** //
  solver._sanitizeArr = function(array) {
    return array.filter(function(n){return n != ""});
  }
  
  return solver;
}));
