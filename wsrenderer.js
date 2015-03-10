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

// File: wsrenderer.js
// Description: Provides the basic rendering capabilities for wsolver.
// Author: Joshua Michael Bemenderfer (Tribex)
// Date Created: 3/8/2015

// Self-executing anonymous function to allow support for both CommonJS and Browser environments.
(function (root, factory) {
  // Assign to module.exports if the environment supports CommonJS.
  // If root.wsrender is already defined/truthy, use a Browser version nonetheless.
  // ^ Useful for nw.js or atom-shell where you might want to still use the global version.
  if(typeof module === "object" && module.exports && !root.wsrender) {
    module.exports = factory();
  
  // Otherwise use a global variable.
  } else {
    root.wsrender = factory();
  }

}(this, function() {
  var render = {};

  render.CanvasRenderer = function(canvas, wordsearch, gridRenderer, matchRenderer, options) {
    this.canvas = canvas;
    this.gridRenderer = gridRenderer;
    this.matchRenderer = matchRenderer;
    this.ws = wordsearch;

    this.options = {
      letterSpacing: 17,
      extraPadding: 0.5,
    }
    
    options ? $.extend(true, this.options, options) : null;
    
    this.setCanvas = function(canvas) {
      this.canvas = canvas;
    }
    
    this.resize = function() {
      var cvs = this.canvas;
      if(cvs.canvas) cvs = cvs.canvas; // Hack to get PhotonUI canvases working
      
      if(this.ws && this.ws.grid.length > 0) {
        var width = (this.ws.grid[0].length+this.options.extraPadding)*this.options.letterSpacing;
        var height = (this.ws.grid.length+this.options.extraPadding)*this.options.letterSpacing;
        cvs.width  = width;
        cvs.height = height;
      }
    }
    
    this.setGridRenderer = function(func) {
      this.gridRenderer = func;
    }
    
    this.setMatchRenderer = function(func) {
      this.matchRenderer = func;
    }
    
    this.setWordsearch = function(wordsearch) {
      this.ws = wordsearch;
    }
    
    this.setOptions = function(options) {
      $.extend(true, this.options, options);
    }
    
    this.clear = function() {
      var context = this.canvas.getContext('2d');
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    this.drawGrid = function() {
      if(this.ws && this.ws.grid.length > 0) {
        this.gridRenderer ? this.gridRenderer.draw(this) : null;
      }
    }
    
    this.drawAllMatches = function(matches) {
      for(var i = 0; i < Object.keys(matches).length; i++) {
        var word = matches[Object.keys(matches)[i]];
        for(var i2 = 0; i2 < word.length; i2++) {
          var match = word[i2];
          if(match.success == true) {
            this.drawMatch(match);
          }
        }
      }
    }
      
    this.drawMatch = function(match) {
      this.matchRenderer ? this.matchRenderer.draw(this, match) : null;
    }
    
    this.positionToPixel = function(pos) {
      return {
        x: ((pos.index+this.options.extraPadding)*this.options.letterSpacing),
        y: ((pos.line+this.options.extraPadding)*this.options.letterSpacing),
      };
    }
  }

  render.SimpleGridRenderer = function(options) {
    this.options = {
      font: "15px sans-serif",
      fontColor: "#000000",
    }
    
    options ? $.extend(true, this.options, options) : null;
    
    this.draw = function(renderer) {
      var context = renderer.canvas.getContext("2d");
      context.font = this.options.font;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = this.options.fontColor;
      
      for(var y = 0; y < renderer.ws.grid.length; y++) {
        var line = renderer.ws.grid[y];
        for(var x = 0; x < line.length; x++) {
          context.fillText(line[x], (x+renderer.options.extraPadding)*renderer.options.letterSpacing, (y+renderer.options.extraPadding)*renderer.options.letterSpacing);
        }
      }
    }
  }

  render.LineMatchRenderer = function(options) {
    this.options = {
      strokeWidth: 4,
      strokeCap: "round",
      coloringFunction: function() {
        return "rgba(200, 0, 0, 1)";
      }
    }
    
    options ? $.extend(true, this.options, options) : null;

    this.draw = function(renderer, match) {
      var position1 = renderer.positionToPixel(match.firstLetterPosition);
      var position2 = renderer.positionToPixel(match.lastLetterPosition);

      var context = renderer.canvas.getContext('2d');
    
      context.beginPath();
      context.moveTo(position1.x, position1.y);
      context.lineTo(position2.x, position2.y);
    
      context.lineWidth = this.options.strokeWidth;
      context.lineCap = this.options.strokeCap;
      context.strokeStyle = this.options.coloringFunction(match, "stroke");
      context.stroke();
    }
  }

  render.CapsuleMatchRenderer = function(options) {
    this.options = {
      padding: 0,
      strokeWidth: 2,
      drawStroke: true,
      drawFill: false,
      highlightStart: true,
      coloringFunction: function(match, stage) {
        if(stage == "stroke") {
          return "rgba(200,0,0, 1)";
        } else if (stage == "fill") {
          return "rgba(0,0,0, 0.2)";
        } else if (stage == "highlight") {
          return "rgba(200,0,0, 0.6)";
        }
      },
    }
    
    options ? $.extend(true, this.options, options) : null;
    
    this.draw = function(renderer, match) {
      var position1 = renderer.positionToPixel(match.firstLetterPosition);
      var position2 = renderer.positionToPixel(match.lastLetterPosition);
      
      var getArcs = function(direction) {
        switch(direction) {
          case 0:
            return [Math.PI*1.75, Math.PI/1.25, false];
          case 1:
            return [Math.PI, 0, true];
          case 2:
            return [Math.PI*1.25, 0.75, true];
          case 3:
            return [Math.PI*1.5, Math.PI/2, true];
          case 4:
            return [Math.PI*1.75, Math.PI/1.25, true];
          case 5:
            return [Math.PI, 0, false];
          case 6:
            return [Math.PI*1.25, 0.75, false];
          case 7:
            return [Math.PI*1.5, Math.PI/2, false];
        }
      };
      
      var arcDef = getArcs(match.searchDirection);
        
      var context = renderer.canvas.getContext("2d");
      
      var padding = this.options.padding;
      
      if(this.options.drawStroke || this.options.drawFill) {
        context.beginPath();
        context.arc(position1.x, position1.y, (padding+renderer.options.letterSpacing)/2, arcDef[0], arcDef[1], arcDef[2]);
      
        context.arc(position2.x, position2.y, (padding+renderer.options.letterSpacing)/2, arcDef[1], arcDef[0], arcDef[2]);
      
        //Running the first one twice is a sneaky way to avoid extra calculations for lines. :)
        context.arc(position1.x, position1.y, (padding+renderer.options.letterSpacing)/2, arcDef[0], arcDef[1], arcDef[2]);

        if(this.options.drawStroke) {
          context.lineWidth = this.options.strokeWidth;
          context.strokeStyle = this.options.coloringFunction(match, "stroke");
          context.stroke();
        }
        
        if(this.options.drawFill) {
          context.fillStyle = this.options.coloringFunction(match, "fill");
          context.fill();
        }
      }
      
      if(this.options.highlightStart) {
        context.fillStyle = this.options.coloringFunction(match, "highlight");
        context.beginPath();
        context.arc(position1.x, position1.y, (padding+renderer.options.letterSpacing)/2, 0, Math.PI*2, true);
        context.fill();
        context.closePath();
      }
    }
  }
  
  return render;
}));
