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

// File: interface.js
// Description: The interface definition for the wsolver example. Built using PhotonUI by Wanadev.
// Author: Joshua Michael Bemenderfer (Tribex)
// Date Created: 3/9/2015

// NOTE: For your own health, just ignore most of this code,
// Its incredibly rushed and poorly written. :)

var interface = {};

interface.createInterface = function() {
  interface.matchWhitelist = {};
  interface.statusLabel = new photonui.Label({ text: "" });

  var mainGrid = new photonui.GridLayout();
  
  var viewCanvas = interface.createCanvas(function() {
    interface.createWordBox(interface.ws);
    interface.renderers.drawFunc();
  });
  
  var optionBox = interface.createOptionsPanel();
  interface.wordBox = new photonui.FluidLayout();
  
  var mainToolBar = interface.createToolBar();
  mainToolBar.addChild(interface.statusLabel);

  mainGrid.addClass("fill");

  mainToolBar.addClass("container frame");
  optionBox.addClass("container frame")
  viewCanvas.addClass("container frame");
  interface.wordBox.addClass("container frame");
  
  mainGrid.addChild(
    mainToolBar,
    {
      gridX: 0,
      gridY: 0,
      gridWidth: 3,
      height: 32,
      minHeight: 32,
      maxHeight: 32,
      verticalExpansion: false,
  });
  
  mainGrid.addChild(
    optionBox, {
      gridX: 0,
      gridY: 1,
      maxWidth: 180,
      minWidth: 180,
      horizontalAlign: 'center',
    }
  );
  
  mainGrid.addChild(
    viewCanvas,
    {
      gridX: 1,
      gridY: 1,
      horizontalAlign: 'center',
    }
  );
  
  mainGrid.addChild(
    interface.wordBox, {
      gridX: 2,
      gridY: 1,
      maxWidth: 120,
      minWidth: 120,
      horizontalAlign: 'left',
    }
  );
    
  photonui.domInsert(mainGrid, $("#interface")[0]);
}

//Sets up the canvas and WordSearch view.
interface.createCanvas = function(cb) {
  var canvas = new photonui.Canvas();
  interface.renderers = {};
  
  interface.renderers.availableMatchRenderers = [
    new wsrender.CapsuleMatchRenderer(),
    new wsrender.LineMatchRenderer(),
  ];
  
  interface.renderers.grid = new wsrender.SimpleGridRenderer();
  
  interface.renderers.match = interface.renderers.availableMatchRenderers[0];
  
  interface.renderers.main = new wsrender.CanvasRenderer(canvas, null, interface.renderers.grid, interface.renderers.match);
  
  interface.matches = [];
  
  interface.renderers.drawFunc = function() {
    interface.renderers.main.clear();
    interface.renderers.main.resize();
    interface.renderMatches(interface.matches);
    interface.renderers.main.drawGrid();
  };

  $(window).resize(interface.renderers.drawFunc);
  
  // Load the demo file.
  wsolver.loadFile("wordsearches/wordsearch01.txt", function(ws) {
    interface.ws = ws;
    interface.renderers.main.setWordsearch(interface.ws);
    interface.matches = wsolver.findMatches(interface.ws, {
      allowMultiple: interface.options.main.allowMultiple,
    });
    cb ? cb() : null;
  });

  return canvas;
}

//Builds the main toolbar widget collection and binds it's handlers.
interface.createToolBar = function() {
  var layout = new photonui.FluidLayout();
  
  interface.fileManager = new photonui.FileManager({
    acceptedMimes: ["text/plain"],
    acceptedExts: ["txt", "wsf"],
    dropZone: document,
    multiselect: false
  });
  
  interface.fileManager.registerCallback("open", "file-open", function(widget, file, x, y) {
    var reader = new FileReader();
    reader.onload = function(event) {
      interface.ws = wsolver.parseTextSearch(event.target.result);
      interface.renderers.main.setWordsearch(interface.ws);
      interface.matches = wsolver.findMatches(interface.ws, {
        allowMultiple: interface.options.main.allowMultiple,
      });
      interface.createWordBox(interface.ws);
      
      interface.renderers.drawFunc();
    }
    
    reader.readAsText(file);
  });

  // SET UP FILE MENU //
  var buttonFile = new photonui.Button({
    text: "File",
    appearance: "flat",
    rightIcon: new photonui.FAIcon('fa-caret-down')
  })
  
  var menuFile = new photonui.PopupMenu();
  
  var menuItemNew = new photonui.MenuItem({
    "text": "New",
    icon: new photonui.FAIcon("fa-plus")
  });
  
  var menuItemLoad = new photonui.MenuItem({
    "text": "Load",
    icon: new photonui.FAIcon("fa-folder-open")
  });
  
  var menuItemImport = new photonui.MenuItem({
    "text": "Import",
    icon: new photonui.FAIcon("fa-arrow-down")
  });
  
  var menuItemExport = new photonui.MenuItem({
    "text": "Export",
    icon: new photonui.FAIcon("fa-arrow-up")
  });

  menuFile.children = [menuItemNew, menuItemLoad,
    new photonui.Separator(), menuItemImport, menuItemExport];
  
  buttonFile.registerCallback("click", "click", menuFile.popupWidget, menuFile);
  
  menuItemLoad.registerCallback("open", "click", interface.fileManager.open, interface.fileManager);
  
  var newWindow = new photonui.Window({
    title: "New WordSearch",
    x: ($(document).width()/2)-200, y: 100,
    width: 600, height: 400,
    visible: false
  });
  
  var newWindowGrid = new photonui.GridLayout();
  newWindow.child = newWindowGrid;
  
  newWindowGrid.addChild(new photonui.Label({ text: "Grid:" }), {
    gridX: 0, gridY: 0,
    height: 20,
  });
  
  newWindowGrid.addChild(new photonui.Label({ text: "Words: (one-per-line)" }), {
    gridX: 1, gridY: 0,
    height: 20,
    width: 60,
    minWidth: 60,
    maxWidth: 60,
  });
  
  var gridTextArea = new photonui.TextAreaField();
  gridTextArea.addClass("monospace");

  var wordTextArea = new photonui.TextAreaField();
  wordTextArea.addClass("monospace");

  var buttonLoad = new photonui.Button({ text: "Load WordSearch" });

  newWindowGrid.addChild(gridTextArea, {
    gridX: 0, gridY: 1,
  });
  
  newWindowGrid.addChild(wordTextArea, {
    gridX: 1, gridY: 1,
    width: 60,
    minWidth: 60,
    maxWidth: 60,
    height: 320,
  });
  
  newWindowGrid.addChild(buttonLoad, {
    gridX: 0, gridY: 2,
    height: 32,
    gridWidth: 2,
  });
  
  var newClose = function() {
    newWindow.visible = false;
  }
  
  buttonLoad.registerCallback("click", "click", function() {
    var rawWs = gridTextArea.value+"\n---\n"+wordTextArea.value;
    
    interface.ws = wsolver.parseTextSearch(rawWs);
    interface.renderers.main.setWordsearch(interface.ws);
    interface.matches = wsolver.findMatches(interface.ws, {
      allowMultiple: interface.options.main.allowMultiple,
    });
    
    interface.createWordBox(interface.ws);
    
    interface.renderers.drawFunc();
    
    newClose();
  });
  
  newWindow.registerCallback("close", "close-button-clicked", newClose);

  menuItemNew.registerCallback("click", "click", function() {
    newWindow.visible = true;
  });
  
  var importWindow = new photonui.Window({
    title: "Import WordSearch",
    x: ($(document).width()/2)-200, y: 100,
    width: 400, height: 400,
    visible: false
  });
  
  var importTextArea = new photonui.TextAreaField();
  importTextArea.addClass("monospace");
  
  var importButton = new photonui.Button({
    text: "Import WordSearch",
    layoutOptions: {
      height: 32,
    }
  });
  
  var importClose = function() {
    importWindow.visible = false;
  }
  
  importButton.registerCallback("click", "click", function() {
    interface.ws = wsolver.parseTextSearch(importTextArea.value);
    interface.renderers.main.setWordsearch(interface.ws);
    interface.matches = wsolver.findMatches(interface.ws, {
      allowMultiple: interface.options.main.allowMultiple,
    });
    
    interface.createWordBox(interface.ws);

    interface.renderers.drawFunc();
    
    importTextArea.value = "";
    importClose();
  });
  
  importWindow.registerCallback("close", "close-button-clicked", importClose);

  importWindow.child = new photonui.BoxLayout({
    children: [
      importTextArea,
      importButton
    ]
  });

  menuItemImport.registerCallback("click", "click", function() {
    importWindow.visible = true;
  });
    
  var exportWindow = new photonui.Window({
    title: "Export WordSearch",
    x: ($(document).width()/2)-200, y: 100,
    width: 400, height: 400,
    visible: false
  });
  
  var exportTextArea = new photonui.TextAreaField();
  exportTextArea.addClass("monospace");
  
  var exportCloseButton = new photonui.Button({
    text: "Close",
    layoutOptions: {
      height: 32,
    }
  });
  
  var exportClose = function() {
    exportWindow.visible = false;
  }
  
  exportCloseButton.registerCallback("click", "click", exportClose);
  exportWindow.registerCallback("close", "close-button-clicked", exportClose);

  exportWindow.child = new photonui.BoxLayout({
    children: [
      exportTextArea,
      exportCloseButton
    ]
  });

  menuItemExport.registerCallback("click", "click", function() {
    exportWindow.visible = true;
    exportTextArea.value = wsolver.exportToText(interface.ws);
  });
  
  layout.addChild(buttonFile);
  
  return layout;
}

interface.createOptionsPanel = function() {
  var optionsLayout = new photonui.FluidLayout();
  
  if(!interface.options) {
    interface.options = {};
  }
  
  if(!interface.options.main) {
    interface.options.main = {
      allowMultiple: false,
      randomColors: false,
    };
  }
  
  var mainOptions = new photonui.GridLayout();
  {
    //Set up Main Options
    mainOptions.addChild(new photonui.Text({
      rawHtml: "<h4>Main Options:<h4>",
    }), {
      gridX: 0,
      gridY: 0,
      gridWidth: 4,
    });
    
    var optAllowMultipleMatches = new photonui.Switch();
    optAllowMultipleMatches.value = interface.options.main.allowMultiple;

    mainOptions.addChild(new photonui.Label({
      text: "Match Multiple:",
      forInput: optAllowMultipleMatches,
    }), {
      gridX: 0,
      gridY: 1,
    });
    
    mainOptions.addChild(optAllowMultipleMatches, {gridX: 1, gridY: 1});
    
    optAllowMultipleMatches.registerCallback('value-changed', 'value-changed', function() {
      interface.options.main.allowMultiple = optAllowMultipleMatches.value;
      
      interface.matches = wsolver.findMatches(interface.ws, {
        allowMultiple: interface.options.main.allowMultiple,
      });
      
      interface.renderers.drawFunc();
    });
    
    var optLetterSpacing = new photonui.NumericField({
      value: interface.renderers.main.options.letterSpacing,
      min: 10,
      max: 50,
    });

    mainOptions.addChild(new photonui.Label({
      text: "Letter Space:",
      forInput: optLetterSpacing,
    }), {
      gridX: 0,
      gridY: 2,
    });
    
    mainOptions.addChild(optLetterSpacing, {gridX: 1, gridY: 2});
    optLetterSpacing.registerCallback('value-changed', 'value-changed', function() {
      interface.renderers.main.options.letterSpacing = optLetterSpacing.value;
      interface.renderers.drawFunc();
    });
    
    var optFont = new photonui.TextField({
      value: interface.renderers.grid.options.font,
    });

    mainOptions.addChild(new photonui.Label({
      text: "Grid Font:",
      forInput: optFont,
    }), {
      gridX: 0,
      gridY: 3,
    });
    
    mainOptions.addChild(optFont, {gridX: 1, gridY: 3});
    optFont.registerCallback('value-changed', 'value-changed', function() {
      interface.renderers.grid.options.font = optFont.value;
      interface.renderers.drawFunc();
    });
    
    var optFontColor = new photonui.ColorButton({
      value: interface.renderers.grid.options.fontColor,
    });

    mainOptions.addChild(new photonui.Label({
      text: "Font Color:",
      forInput: optFontColor,
    }), {
      gridX: 0,
      gridY: 4,
    });
    
    mainOptions.addChild(optFontColor, {gridX: 1, gridY: 4});
    optFontColor.registerCallback('value-changed', 'value-changed', function() {
      interface.renderers.grid.options.fontColor = optFontColor.value;
      interface.renderers.drawFunc();
    });
    
    var optMatchRenderer = new photonui.Select({
      children: [
        new photonui.MenuItem({value: "capsule", text: "Capsule"}),
        new photonui.MenuItem({value: "line", text: "Line"}),
      ],
      value: "capsule",
    });

    mainOptions.addChild(new photonui.Label({
      text: "Match Renderer:",
      forInput: optMatchRenderer,
    }), {
      gridX: 0,
      gridY: 5,
    });
    
    mainOptions.addChild(optMatchRenderer, {gridX: 1, gridY: 5});
    optMatchRenderer.registerCallback('value-changed', 'value-changed', function() {
      if(optMatchRenderer.value == "capsule") {
        interface.renderers.match = interface.renderers.availableMatchRenderers[0];
        interface.renderers.main.setMatchRenderer(interface.renderers.match);
      } else if (optMatchRenderer.value == "line") {
        interface.renderers.match = interface.renderers.availableMatchRenderers[1];
        interface.renderers.main.setMatchRenderer(interface.renderers.match);
      }
      interface.matchRenderOptions = interface.buildMatchRenderOptions(optionsLayout, optMatchRenderer.value);
      interface.renderers.drawFunc();
    });

  }
  
  optionsLayout.addChild(mainOptions);
  interface.matchRenderOptions = interface.buildMatchRenderOptions(optionsLayout, 'capsule');

  return optionsLayout;
}

interface.buildMatchRenderOptions = function(optionsLayout, type) {
  if(interface.matchRenderOptions) {
    optionsLayout.removeChild(interface.matchRenderOptions);
    interface.matchRenderOptions.destroy();
  }
  
  interface.matchRenderOptions = new photonui.GridLayout();
  interface.matchRenderOptions.addChild(new photonui.Text({
    rawHtml: "<h4>Match Renderer Options:<h4>",
  }), {
    gridX: 0,
    gridY: 0,
    gridWidth: 2,
  });

  if(type == 'line') {
    var optStrokeWidth = new photonui.NumericField({
      value: interface.renderers.match.options.strokeWidth,
      min: 1,
      max: 20,
    });

    interface.matchRenderOptions.addChild(new photonui.Label({
      text: "Stroke Width:",
      forInput: optStrokeWidth,
    }), {
      gridX: 0,
      gridY: 1,
    });
    
    interface.matchRenderOptions.addChild(optStrokeWidth, {gridX: 1, gridY: 1});
    optStrokeWidth.registerCallback('value-changed', 'value-changed', function() {
      interface.renderers.match.options.strokeWidth = optStrokeWidth.value;
      interface.renderers.drawFunc();
    });
    
    var optCapType = new photonui.Select({
      children: [
        new photonui.MenuItem({value: "butt", text: "Cut"}),
        new photonui.MenuItem({value: "round", text: "Round"}),
        new photonui.MenuItem({value: "square", text: "Square"}),
      ],
      value: interface.renderers.match.options.strokeCap,
    });
    
    interface.matchRenderOptions.addChild(new photonui.Label({
      text: "Stroke Cap:",
      forInput: optCapType,
    }), {
      gridX: 0,
      gridY: 2,
    });
    
    interface.matchRenderOptions.addChild(optCapType, {gridX: 1, gridY: 2});
    optCapType.registerCallback('value-changed', 'value-changed', function() {
      interface.renderers.match.options.strokeCap = optCapType.value;
      interface.renderers.drawFunc();
    });
    
    var optRandomColors = new photonui.Switch();
    optRandomColors.value = interface.options.main.randomColors;

    interface.matchRenderOptions.addChild(new photonui.Label({
      text: "Random Colors:",
      forInput: optRandomColors,
    }), {
      gridX: 0,
      gridY: 3,
    });
    
    interface.matchRenderOptions.addChild(optRandomColors, {gridX: 1, gridY: 3});
    
    optRandomColors.registerCallback('value-changed', 'value-changed', function() {
      interface.options.main.randomColors = optRandomColors.value;
      
      if(optRandomColors.value) {
        interface.renderers.match.options.coloringFunction = function() {
          return "rgba("+_randomRange(0,255)+","+_randomRange(0,255)+","+_randomRange(0,255)+",1)";
        }
      } else {
        interface.renderers.match.options.coloringFunction = function() {
          return "rgba(200, 0, 0, 1)";
        }
      }
      
      interface.renderers.drawFunc();
    });

  } else if (type == 'capsule') {
    var optDrawStroke = new photonui.Switch();
    optDrawStroke.value = interface.renderers.match.options.drawStroke;
    interface.matchRenderOptions.addChild(new photonui.Label({
      text: "Draw Stroke:",
      forInput: optDrawStroke,
    }), {
      gridX: 0,
      gridY: 1,
    });
    
    interface.matchRenderOptions.addChild(optDrawStroke, {gridX: 1, gridY: 1});
    optDrawStroke.registerCallback('value-changed', 'value-changed', function() {
      interface.renderers.match.options.drawStroke = optDrawStroke.value;
      interface.renderers.drawFunc();
    });


    var optDrawFill = new photonui.Switch();
    optDrawFill.value = interface.renderers.match.options.drawFill;
    interface.matchRenderOptions.addChild(new photonui.Label({
      text: "Draw Fill:",
      forInput: optDrawFill,
    }), {
      gridX: 0,
      gridY: 2,
    });
    
    interface.matchRenderOptions.addChild(optDrawFill, {gridX: 1, gridY: 2});
    optDrawFill.registerCallback('value-changed', 'value-changed', function() {
      interface.renderers.match.options.drawFill = optDrawFill.value;
      interface.renderers.drawFunc();
    });


    var optHighlightStart = new photonui.Switch();
    optHighlightStart.value = interface.renderers.match.options.highlightStart;
    interface.matchRenderOptions.addChild(new photonui.Label({
      text: "Highlight Start:",
      forInput: optHighlightStart,
    }), {
      gridX: 0,
      gridY: 3,
    });
    
    interface.matchRenderOptions.addChild(optHighlightStart, {gridX: 1, gridY: 3});
    optHighlightStart.registerCallback('value-changed', 'value-changed', function() {
      interface.renderers.match.options.highlightStart = optHighlightStart.value;
      interface.renderers.drawFunc();
    });
    
    
    var optStrokeWidth = new photonui.NumericField({
      value: interface.renderers.match.options.strokeWidth,
      min: 1,
      max: 20,
    });

    interface.matchRenderOptions.addChild(new photonui.Label({
      text: "Stroke Width:",
      forInput: optStrokeWidth,
    }), {
      gridX: 0,
      gridY: 4,
    });
    
    interface.matchRenderOptions.addChild(optStrokeWidth, {gridX: 1, gridY: 4});
    optStrokeWidth.registerCallback('value-changed', 'value-changed', function() {
      interface.renderers.match.options.strokeWidth = optStrokeWidth.value;
      interface.renderers.drawFunc();
    });
    
    var optPadding = new photonui.NumericField({
      value: interface.renderers.match.options.padding,
      min: -15,
      max: 15,
    });

    interface.matchRenderOptions.addChild(new photonui.Label({
      text: "Padding:",
      forInput: optPadding,
    }), {
      gridX: 0,
      gridY: 5,
    });
    
    interface.matchRenderOptions.addChild(optPadding, {gridX: 1, gridY: 5});
    optPadding.registerCallback('value-changed', 'value-changed', function() {
      interface.renderers.match.options.padding = optPadding.value;
      interface.renderers.drawFunc();
    });

        
    var optRandomColors = new photonui.Switch();
    optRandomColors.value = interface.options.main.randomColors;

    interface.matchRenderOptions.addChild(new photonui.Label({
      text: "Random Colors:",
      forInput: optRandomColors,
    }), {
      gridX: 0,
      gridY: 6,
    });
    
    interface.matchRenderOptions.addChild(optRandomColors, {gridX: 1, gridY: 6});
    
    optRandomColors.registerCallback('value-changed', 'value-changed', function() {
      interface.options.main.randomColors = optRandomColors.value;
      
      if(optRandomColors.value) {
        interface.renderers.match.options.coloringFunction = function(match, stage) {
          var r = _randomRange(0, 255), g = _randomRange(0, 255), b = _randomRange(0, 255);
          if(stage == "stroke") {
            return "rgba("+r+","+g+","+b+", 1)";
          } else if (stage == "fill") {
            return "rgba("+r+","+g+","+b+", 0.2)";
          } else if (stage == "highlight") {
            return "rgba("+r+","+g+","+b+", 0.6)";
          }
        }
      } else {
        interface.renderers.match.options.coloringFunction = function(match, stage) {
          if(stage == "stroke") {
            return "rgba(200,0,0, 1)";
          } else if (stage == "fill") {
            return "rgba(0,0,0, 0.2)";
          } else if (stage == "highlight") {
            return "rgba(200,0,0, 0.6)";
          }
        }
      }
      
      interface.renderers.drawFunc();
    });
  }
  
  optionsLayout.addChild(interface.matchRenderOptions);

  return interface.matchRenderOptions;
}

interface.createWordBox = function(ws) {
  if(interface.wordBox.children.length > 0) {
    var child = interface.wordBox.children[0]
    interface.wordBox.removeChild(child);
    child.destroy();
  }
  
  var layout = new photonui.GridLayout();
  
  var masterSwitch = new photonui.Switch({
    value: true,
    name: "switch-all",
  });
  
  layout.addChild(masterSwitch, {
    gridX: 0, gridY: 0,
  });
  
  layout.addChild(new photonui.Text({ rawHtml: "<strong>Word List</strong>" }), {
    gridX: 1, gridY: 0,
  });
  
  masterSwitch.registerCallback('value-changed', 'value-changed', function(widget) {
    var keys = Object.keys(interface.matchWhitelist);
    for(var i = 0; i < keys.length; i++) {
      interface.matchWhitelist[keys[i]].state = widget.value;
      interface.matchWhitelist[keys[i]].widget.value = widget.value;
    }
    interface.renderers.drawFunc();
  });
  
  for(var i = 0; i < ws.words.length; i++) {
        
    var wordSwitch = new photonui.Switch({
      value: true,
      name: "switch-"+ws.words[i],
    });
    var wordLabel = new photonui.Label({
      text: ws.words[i],
      forInput: wordSwitch,
    });
    
    layout.addChild(wordSwitch, {
      gridX: 0, gridY: i+1
    });
    layout.addChild(wordLabel, {
      gridX: 1, gridY: i+1
    });
    
    interface.matchWhitelist[ws.words[i]] = {widget: wordSwitch, state: true};

    wordSwitch.registerCallback('value-changed', 'value-changed', function(widget) {
      interface.matchWhitelist[widget.name.split("-")[1]].state = widget.value;
      interface.renderers.drawFunc();
    });
  }
  
  interface.wordBox.addChild(layout);
}

interface.setStatus = function(statusText) {
  if(statusText) {
    interface.statusLabel.text = "Status: "+statusText;
  } else {
    interface.statusLabel.text = "";
  }
}

interface.renderMatches = function(matches) {
  interface.setStatus();
  var filteredMatches = {};
  var missingWords = [];
  
  for(var i = 0; i < Object.keys(matches).length; i++) {
    var word = Object.keys(matches)[i];
    var value = matches[Object.keys(matches)[i]];

    if(value[0].success == false) {
      interface.matchWhitelist[word].state = false;
      interface.matchWhitelist[word].widget.value = false;
      interface.matchWhitelist[word].widget.visible = false;
      missingWords.push('"'+word+'"');
      continue;
    }
    if(interface.matchWhitelist[word] && interface.matchWhitelist[word].state) {
      filteredMatches[word] = value;
    }
  }
  
  if(missingWords.length > 1) {
    interface.setStatus('Unable to find words: '+missingWords.join(", ")+'.');
  } else if (missingWords.length == 1) {
    interface.setStatus('Unable to find word: '+missingWords[0]+'.');
  }
  
  interface.renderers.main.drawAllMatches(filteredMatches);
}
