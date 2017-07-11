/**
 * what-input - A global utility for tracking the current input method (mouse, keyboard or touch).
 * @version v4.0.6
 * @link https://github.com/ten1seven/what-input
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("whatInput", [], factory);
	else if(typeof exports === 'object')
		exports["whatInput"] = factory();
	else
		root["whatInput"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	module.exports = (function() {

	  /*
	    ---------------
	    Variables
	    ---------------
	  */

	  // cache document.documentElement
	  var docElem = document.documentElement;

	  // last used input type
	  var currentInput = 'initial';

	  // last used input intent
	  var currentIntent = null;

	  // form input types
	  var formInputs = [
	    'input',
	    'select',
	    'textarea'
	  ];

	  // list of modifier keys commonly used with the mouse and
	  // can be safely ignored to prevent false keyboard detection
	  var ignoreMap = [
	    16, // shift
	    17, // control
	    18, // alt
	    91, // Windows key / left Apple cmd
	    93  // Windows menu / right Apple cmd
	  ];

	  // mapping of events to input types
	  var inputMap = {
	    'keyup': 'keyboard',
	    'mousedown': 'mouse',
	    'mousemove': 'mouse',
	    'MSPointerDown': 'pointer',
	    'MSPointerMove': 'pointer',
	    'pointerdown': 'pointer',
	    'pointermove': 'pointer',
	    'touchstart': 'touch'
	  };

	  // array of all used input types
	  var inputTypes = [];

	  // boolean: true if touch buffer timer is running
	  var isBuffering = false;

	  // map of IE 10 pointer events
	  var pointerMap = {
	    2: 'touch',
	    3: 'touch', // treat pen like touch
	    4: 'mouse'
	  };

	  // touch buffer timer
	  var touchTimer = null;


	  /*
	    ---------------
	    Set up
	    ---------------
	  */

	  var setUp = function() {

	    // add correct mouse wheel event mapping to `inputMap`
	    inputMap[detectWheel()] = 'mouse';

	    addListeners();
	    setInput();
	  };


	  /*
	    ---------------
	    Events
	    ---------------
	  */

	  var addListeners = function() {

	    // `pointermove`, `MSPointerMove`, `mousemove` and mouse wheel event binding
	    // can only demonstrate potential, but not actual, interaction
	    // and are treated separately

	    // pointer events (mouse, pen, touch)
	    if (window.PointerEvent) {
	      docElem.addEventListener('pointerdown', updateInput);
	      docElem.addEventListener('pointermove', setIntent);
	    } else if (window.MSPointerEvent) {
	      docElem.addEventListener('MSPointerDown', updateInput);
	      docElem.addEventListener('MSPointerMove', setIntent);
	    } else {

	      // mouse events
	      docElem.addEventListener('mousedown', updateInput);
	      docElem.addEventListener('mousemove', setIntent);

	      // touch events
	      if ('ontouchstart' in window) {
	        docElem.addEventListener('touchstart', touchBuffer);
	      }
	    }

	    // mouse wheel
	    docElem.addEventListener(detectWheel(), setIntent);

	    // keyboard events
	    docElem.addEventListener('keydown', updateInput);
	    docElem.addEventListener('keyup', updateInput);
	  };

	  // checks conditions before updating new input
	  var updateInput = function(event) {

	    // only execute if the touch buffer timer isn't running
	    if (!isBuffering) {
	      var eventKey = event.which;
	      var value = inputMap[event.type];
	      if (value === 'pointer') value = pointerType(event);

	      if (
	        currentInput !== value ||
	        currentIntent !== value
	      ) {

	        var activeElem = document.activeElement;
	        var activeInput = (
	          activeElem &&
	          activeElem.nodeName &&
	          formInputs.indexOf(activeElem.nodeName.toLowerCase()) === -1
	        ) ? true : false;

	        if (
	          value === 'touch' ||

	          // ignore mouse modifier keys
	          (value === 'mouse' && ignoreMap.indexOf(eventKey) === -1) ||

	          // don't switch if the current element is a form input
	          (value === 'keyboard' && activeInput)
	        ) {

	          // set the current and catch-all variable
	          currentInput = currentIntent = value;

	          setInput();
	        }
	      }
	    }
	  };

	  // updates the doc and `inputTypes` array with new input
	  var setInput = function() {
	    docElem.setAttribute('data-whatinput', currentInput);
	    docElem.setAttribute('data-whatintent', currentInput);

	    if (inputTypes.indexOf(currentInput) === -1) {
	      inputTypes.push(currentInput);
	      docElem.className += ' whatinput-types-' + currentInput;
	    }
	  };

	  // updates input intent for `mousemove` and `pointermove`
	  var setIntent = function(event) {

	    // only execute if the touch buffer timer isn't running
	    if (!isBuffering) {
	      var value = inputMap[event.type];
	      if (value === 'pointer') value = pointerType(event);

	      if (currentIntent !== value) {
	        currentIntent = value;

	        docElem.setAttribute('data-whatintent', currentIntent);
	      }
	    }
	  };

	  // buffers touch events because they frequently also fire mouse events
	  var touchBuffer = function(event) {

	    // clear the timer if it happens to be running
	    window.clearTimeout(touchTimer);

	    // set the current input
	    updateInput(event);

	    // set the isBuffering to `true`
	    isBuffering = true;

	    // run the timer
	    touchTimer = window.setTimeout(function() {

	      // if the timer runs out, set isBuffering back to `false`
	      isBuffering = false;
	    }, 200);
	  };


	  /*
	    ---------------
	    Utilities
	    ---------------
	  */

	  var pointerType = function(event) {
	   if (typeof event.pointerType === 'number') {
	      return pointerMap[event.pointerType];
	   } else {
	      return (event.pointerType === 'pen') ? 'touch' : event.pointerType; // treat pen like touch
	   }
	  };

	  // detect version of mouse wheel event to use
	  // via https://developer.mozilla.org/en-US/docs/Web/Events/wheel
	  var detectWheel = function() {
	    return 'onwheel' in document.createElement('div') ?
	      'wheel' : // Modern browsers support "wheel"

	      document.onmousewheel !== undefined ?
	        'mousewheel' : // Webkit and IE support at least "mousewheel"
	        'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox
	  };


	  /*
	    ---------------
	    Init

	    don't start script unless browser cuts the mustard
	    (also passes if polyfills are used)
	    ---------------
	  */

	  if (
	    'addEventListener' in window &&
	    Array.prototype.indexOf
	  ) {
	    setUp();
	  }


	  /*
	    ---------------
	    API
	    ---------------
	  */

	  return {

	    // returns string: the current input type
	    // opt: 'loose'|'strict'
	    // 'strict' (default): returns the same value as the `data-whatinput` attribute
	    // 'loose': includes `data-whatintent` value if it's more current than `data-whatinput`
	    ask: function(opt) { return (opt === 'loose') ? currentIntent : currentInput; },

	    // returns array: all the detected input types
	    types: function() { return inputTypes; }

	  };

	}());


/***/ }
/******/ ])
});
;
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  "use strict";

  var FOUNDATION_VERSION = '6.3.1';

  // Global Foundation object
  // This is attached to the window, or used as a module for AMD/Browserify
  var Foundation = {
    version: FOUNDATION_VERSION,

    /**
     * Stores initialized plugins.
     */
    _plugins: {},

    /**
     * Stores generated unique ids for plugin instances
     */
    _uuids: [],

    /**
     * Returns a boolean for RTL support
     */
    rtl: function rtl() {
      return $('html').attr('dir') === 'rtl';
    },
    /**
     * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
     * @param {Object} plugin - The constructor of the plugin.
     */
    plugin: function plugin(_plugin, name) {
      // Object key to use when adding to global Foundation object
      // Examples: Foundation.Reveal, Foundation.OffCanvas
      var className = name || functionName(_plugin);
      // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
      // Examples: data-reveal, data-off-canvas
      var attrName = hyphenate(className);

      // Add to the Foundation object and the plugins list (for reflowing)
      this._plugins[attrName] = this[className] = _plugin;
    },
    /**
     * @function
     * Populates the _uuids array with pointers to each individual plugin instance.
     * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
     * Also fires the initialization event for each plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @param {String} name - the name of the plugin, passed as a camelCased string.
     * @fires Plugin#init
     */
    registerPlugin: function registerPlugin(plugin, name) {
      var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
      plugin.uuid = this.GetYoDigits(6, pluginName);

      if (!plugin.$element.attr('data-' + pluginName)) {
        plugin.$element.attr('data-' + pluginName, plugin.uuid);
      }
      if (!plugin.$element.data('zfPlugin')) {
        plugin.$element.data('zfPlugin', plugin);
      }
      /**
       * Fires when the plugin has initialized.
       * @event Plugin#init
       */
      plugin.$element.trigger('init.zf.' + pluginName);

      this._uuids.push(plugin.uuid);

      return;
    },
    /**
     * @function
     * Removes the plugins uuid from the _uuids array.
     * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
     * Also fires the destroyed event for the plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @fires Plugin#destroyed
     */
    unregisterPlugin: function unregisterPlugin(plugin) {
      var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

      this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
      plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
       * Fires when the plugin has been destroyed.
       * @event Plugin#destroyed
       */
      .trigger('destroyed.zf.' + pluginName);
      for (var prop in plugin) {
        plugin[prop] = null; //clean up script to prep for garbage collection.
      }
      return;
    },

    /**
     * @function
     * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
     * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
     * @default If no argument is passed, reflow all currently active plugins.
     */
    reInit: function reInit(plugins) {
      var isJQ = plugins instanceof $;
      try {
        if (isJQ) {
          plugins.each(function () {
            $(this).data('zfPlugin')._init();
          });
        } else {
          var type = typeof plugins === 'undefined' ? 'undefined' : _typeof(plugins),
              _this = this,
              fns = {
            'object': function object(plgs) {
              plgs.forEach(function (p) {
                p = hyphenate(p);
                $('[data-' + p + ']').foundation('_init');
              });
            },
            'string': function string() {
              plugins = hyphenate(plugins);
              $('[data-' + plugins + ']').foundation('_init');
            },
            'undefined': function undefined() {
              this['object'](Object.keys(_this._plugins));
            }
          };
          fns[type](plugins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        return plugins;
      }
    },

    /**
     * returns a random base-36 uid with namespacing
     * @function
     * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
     * @param {String} namespace - name of plugin to be incorporated in uid, optional.
     * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
     * @returns {String} - unique id
     */
    GetYoDigits: function GetYoDigits(length, namespace) {
      length = length || 6;
      return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
    },
    /**
     * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
     * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
     * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
     */
    reflow: function reflow(elem, plugins) {

      // If plugins is undefined, just grab everything
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      }
      // If plugins is a string, convert it to an array with one item
      else if (typeof plugins === 'string') {
          plugins = [plugins];
        }

      var _this = this;

      // Iterate through each plugin
      $.each(plugins, function (i, name) {
        // Get the current plugin
        var plugin = _this._plugins[name];

        // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
        var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

        // For each plugin found, initialize it
        $elem.each(function () {
          var $el = $(this),
              opts = {};
          // Don't double-dip on plugins
          if ($el.data('zfPlugin')) {
            console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
            return;
          }

          if ($el.attr('data-options')) {
            var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
              var opt = e.split(':').map(function (el) {
                return el.trim();
              });
              if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
            });
          }
          try {
            $el.data('zfPlugin', new plugin($(this), opts));
          } catch (er) {
            console.error(er);
          } finally {
            return;
          }
        });
      });
    },
    getFnName: functionName,
    transitionend: function transitionend($elem) {
      var transitions = {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'otransitionend'
      };
      var elem = document.createElement('div'),
          end;

      for (var t in transitions) {
        if (typeof elem.style[t] !== 'undefined') {
          end = transitions[t];
        }
      }
      if (end) {
        return end;
      } else {
        end = setTimeout(function () {
          $elem.triggerHandler('transitionend', [$elem]);
        }, 1);
        return 'transitionend';
      }
    }
  };

  Foundation.util = {
    /**
     * Function for applying a debounce effect to a function call.
     * @function
     * @param {Function} func - Function to be called at end of timeout.
     * @param {Number} delay - Time in ms to delay the call of `func`.
     * @returns function
     */
    throttle: function throttle(func, delay) {
      var timer = null;

      return function () {
        var context = this,
            args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    }
  };

  // TODO: consider not making this a jQuery function
  // TODO: need way to reflow vs. re-initialize
  /**
   * The Foundation jQuery method.
   * @param {String|Array} method - An action to perform on the current jQuery object.
   */
  var foundation = function foundation(method) {
    var type = typeof method === 'undefined' ? 'undefined' : _typeof(method),
        $meta = $('meta.foundation-mq'),
        $noJS = $('.no-js');

    if (!$meta.length) {
      $('<meta class="foundation-mq">').appendTo(document.head);
    }
    if ($noJS.length) {
      $noJS.removeClass('no-js');
    }

    if (type === 'undefined') {
      //needs to initialize the Foundation object, or an individual plugin.
      Foundation.MediaQuery._init();
      Foundation.reflow(this);
    } else if (type === 'string') {
      //an individual method to invoke on a plugin or group of plugins
      var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
      var plugClass = this.data('zfPlugin'); //determine the class of plugin

      if (plugClass !== undefined && plugClass[method] !== undefined) {
        //make sure both the class and method exist
        if (this.length === 1) {
          //if there's only one, call it directly.
          plugClass[method].apply(plugClass, args);
        } else {
          this.each(function (i, el) {
            //otherwise loop through the jQuery collection and invoke the method on each
            plugClass[method].apply($(el).data('zfPlugin'), args);
          });
        }
      } else {
        //error for no class or no method
        throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
      }
    } else {
      //error for invalid argument type
      throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
    }
    return this;
  };

  window.Foundation = Foundation;
  $.fn.foundation = foundation;

  // Polyfill for requestAnimationFrame
  (function () {
    if (!Date.now || !window.Date.now) window.Date.now = Date.now = function () {
      return new Date().getTime();
    };

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {
          callback(lastTime = nextTime);
        }, nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
    /**
     * Polyfill for performance.now, required by rAF
     */
    if (!window.performance || !window.performance.now) {
      window.performance = {
        start: Date.now(),
        now: function now() {
          return Date.now() - this.start;
        }
      };
    }
  })();
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP = function fNOP() {},
          fBound = function fBound() {
        return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        // native functions don't have a prototype
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  // Polyfill to get the name of a function in IE9
  function functionName(fn) {
    if (Function.prototype.name === undefined) {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(fn.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    } else if (fn.prototype === undefined) {
      return fn.constructor.name;
    } else {
      return fn.prototype.constructor.name;
    }
  }
  function parseValue(str) {
    if ('true' === str) return true;else if ('false' === str) return false;else if (!isNaN(str * 1)) return parseFloat(str);
    return str;
  }
  // Convert PascalCase to kebab-case
  // Thank you: http://stackoverflow.com/a/8955580
  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}(jQuery);
'use strict';

!function ($) {

  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets

    /**
     * Compares the dimensions of an element to a container and determines collision events with container.
     * @function
     * @param {jQuery} element - jQuery object to test for collisions.
     * @param {jQuery} parent - jQuery object to use as bounding container.
     * @param {Boolean} lrOnly - set to true to check left and right values only.
     * @param {Boolean} tbOnly - set to true to check top and bottom values only.
     * @default if no parent object passed, detects collisions with `window`.
     * @returns {Boolean} - true if collision free, false if a collision in any direction.
     */
  };function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
    var eleDims = GetDimensions(element),
        top,
        bottom,
        left,
        right;

    if (parent) {
      var parDims = GetDimensions(parent);

      bottom = eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top;
      top = eleDims.offset.top >= parDims.offset.top;
      left = eleDims.offset.left >= parDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= parDims.width + parDims.offset.left;
    } else {
      bottom = eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top;
      top = eleDims.offset.top >= eleDims.windowDims.offset.top;
      left = eleDims.offset.left >= eleDims.windowDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= eleDims.windowDims.width;
    }

    var allDirs = [bottom, top, left, right];

    if (lrOnly) {
      return left === right === true;
    }

    if (tbOnly) {
      return top === bottom === true;
    }

    return allDirs.indexOf(false) === -1;
  };

  /**
   * Uses native methods to return an object of dimension values.
   * @function
   * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
   * @returns {Object} - nested object of integer pixel values
   * TODO - if element is window, return only those values.
   */
  function GetDimensions(elem, test) {
    elem = elem.length ? elem[0] : elem;

    if (elem === window || elem === document) {
      throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
    }

    var rect = elem.getBoundingClientRect(),
        parRect = elem.parentNode.getBoundingClientRect(),
        winRect = document.body.getBoundingClientRect(),
        winY = window.pageYOffset,
        winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX
      },
      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX
        }
      },
      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX
        }
      }
    };
  }

  /**
   * Returns an object of top and left integer pixel values for dynamically rendered elements,
   * such as: Tooltip, Reveal, and Dropdown
   * @function
   * @param {jQuery} element - jQuery object for the element being positioned.
   * @param {jQuery} anchor - jQuery object for the element's anchor point.
   * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
   * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
   * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
   * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
   * TODO alter/rewrite to work with `em` values as well/instead of pixels
   */
  function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
    var $eleDims = GetDimensions(element),
        $anchorDims = anchor ? GetDimensions(anchor) : null;

    switch (position) {
      case 'top':
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top
        };
        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top
        };
        break;
      case 'center top':
        return {
          left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center':
        return {
          left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
          top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset
        };
      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top
        };
        break;
      case 'left bottom':
        return {
          left: $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'right bottom':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset - $eleDims.width,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      default:
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left + hOffset,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
    }
  }
}(jQuery);
/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/

'use strict';

!function ($) {

  var keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN'
  };

  var commands = {};

  var Keyboard = {
    keys: getKeyCodes(keyCodes),

    /**
     * Parses the (keyboard) event and returns a String that represents its key
     * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
     * @param {Event} event - the event generated by the event handler
     * @return String key - String that represents the key pressed
     */
    parseKey: function parseKey(event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();

      // Remove un-printable characters, e.g. for `fromCharCode` calls for CTRL only events
      key = key.replace(/\W+/, '');

      if (event.shiftKey) key = 'SHIFT_' + key;
      if (event.ctrlKey) key = 'CTRL_' + key;
      if (event.altKey) key = 'ALT_' + key;

      // Remove trailing underscore, in case only modifiers were used (e.g. only `CTRL_ALT`)
      key = key.replace(/_$/, '');

      return key;
    },


    /**
     * Handles the given (keyboard) event
     * @param {Event} event - the event generated by the event handler
     * @param {String} component - Foundation component's name, e.g. Slider or Reveal
     * @param {Objects} functions - collection of functions that are to be executed
     */
    handleKey: function handleKey(event, component, functions) {
      var commandList = commands[component],
          keyCode = this.parseKey(event),
          cmds,
          command,
          fn;

      if (!commandList) return console.warn('Component not defined!');

      if (typeof commandList.ltr === 'undefined') {
        // this component does not differentiate between ltr and rtl
        cmds = commandList; // use plain list
      } else {
        // merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
        if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);else cmds = $.extend({}, commandList.rtl, commandList.ltr);
      }
      command = cmds[keyCode];

      fn = functions[command];
      if (fn && typeof fn === 'function') {
        // execute function  if exists
        var returnValue = fn.apply();
        if (functions.handled || typeof functions.handled === 'function') {
          // execute function when event was handled
          functions.handled(returnValue);
        }
      } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') {
          // execute function when event was not handled
          functions.unhandled();
        }
      }
    },


    /**
     * Finds all focusable elements within the given `$element`
     * @param {jQuery} $element - jQuery object to search within
     * @return {jQuery} $focusable - all focusable elements within `$element`
     */
    findFocusable: function findFocusable($element) {
      if (!$element) {
        return false;
      }
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) {
          return false;
        } //only have visible elements and those that have a tabindex greater or equal 0
        return true;
      });
    },


    /**
     * Returns the component name name
     * @param {Object} component - Foundation component, e.g. Slider or Reveal
     * @return String componentName
     */

    register: function register(componentName, cmds) {
      commands[componentName] = cmds;
    },


    /**
     * Traps the focus in the given element.
     * @param  {jQuery} $element  jQuery object to trap the foucs into.
     */
    trapFocus: function trapFocus($element) {
      var $focusable = Foundation.Keyboard.findFocusable($element),
          $firstFocusable = $focusable.eq(0),
          $lastFocusable = $focusable.eq(-1);

      $element.on('keydown.zf.trapfocus', function (event) {
        if (event.target === $lastFocusable[0] && Foundation.Keyboard.parseKey(event) === 'TAB') {
          event.preventDefault();
          $firstFocusable.focus();
        } else if (event.target === $firstFocusable[0] && Foundation.Keyboard.parseKey(event) === 'SHIFT_TAB') {
          event.preventDefault();
          $lastFocusable.focus();
        }
      });
    },

    /**
     * Releases the trapped focus from the given element.
     * @param  {jQuery} $element  jQuery object to release the focus for.
     */
    releaseFocus: function releaseFocus($element) {
      $element.off('keydown.zf.trapfocus');
    }
  };

  /*
   * Constants for easier comparing.
   * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
   */
  function getKeyCodes(kcs) {
    var k = {};
    for (var kc in kcs) {
      k[kcs[kc]] = kcs[kc];
    }return k;
  }

  Foundation.Keyboard = Keyboard;
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
  };

  var MediaQuery = {
    queries: [],

    current: '',

    /**
     * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
     * @function
     * @private
     */
    _init: function _init() {
      var self = this;
      var extractedStyles = $('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        if (namedQueries.hasOwnProperty(key)) {
          self.queries.push({
            name: key,
            value: 'only screen and (min-width: ' + namedQueries[key] + ')'
          });
        }
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },


    /**
     * Checks if the screen is at least as wide as a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
     */
    atLeast: function atLeast(size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },


    /**
     * Checks if the screen matches to a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check, either 'small only' or 'small'. Omitting 'only' falls back to using atLeast() method.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it does not.
     */
    is: function is(size) {
      size = size.trim().split(' ');
      if (size.length > 1 && size[1] === 'only') {
        if (size[0] === this._getCurrentSize()) return true;
      } else {
        return this.atLeast(size[0]);
      }
      return false;
    },


    /**
     * Gets the media query of a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to get.
     * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
     */
    get: function get(size) {
      for (var i in this.queries) {
        if (this.queries.hasOwnProperty(i)) {
          var query = this.queries[i];
          if (size === query.name) return query.value;
        }
      }

      return null;
    },


    /**
     * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
     * @function
     * @private
     * @returns {String} Name of the current breakpoint.
     */
    _getCurrentSize: function _getCurrentSize() {
      var matched;

      for (var i = 0; i < this.queries.length; i++) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if ((typeof matched === 'undefined' ? 'undefined' : _typeof(matched)) === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },


    /**
     * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
     * @function
     * @private
     */
    _watcher: function _watcher() {
      var _this = this;

      $(window).on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize(),
            currentSize = _this.current;

        if (newSize !== currentSize) {
          // Change the current media query
          _this.current = newSize;

          // Broadcast the media query change on the window
          $(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
        }
      });
    }
  };

  Foundation.MediaQuery = MediaQuery;

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit

    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script && script.parentNode && script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function matchMedium(media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        }
      };
    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all'
      };
    };
  }());

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  Foundation.MediaQuery = MediaQuery;
}(jQuery);
'use strict';

!function ($) {

  /**
   * Motion module.
   * @module foundation.motion
   */

  var initClasses = ['mui-enter', 'mui-leave'];
  var activeClasses = ['mui-enter-active', 'mui-leave-active'];

  var Motion = {
    animateIn: function animateIn(element, animation, cb) {
      animate(true, element, animation, cb);
    },

    animateOut: function animateOut(element, animation, cb) {
      animate(false, element, animation, cb);
    }
  };

  function Move(duration, elem, fn) {
    var anim,
        prog,
        start = null;
    // console.log('called');

    if (duration === 0) {
      fn.apply(elem);
      elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      return;
    }

    function move(ts) {
      if (!start) start = ts;
      // console.log(start, ts);
      prog = ts - start;
      fn.apply(elem);

      if (prog < duration) {
        anim = window.requestAnimationFrame(move, elem);
      } else {
        window.cancelAnimationFrame(anim);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      }
    }
    anim = window.requestAnimationFrame(move);
  }

  /**
   * Animates an element in or out using a CSS transition class.
   * @function
   * @private
   * @param {Boolean} isIn - Defines if the animation is in or out.
   * @param {Object} element - jQuery or HTML object to animate.
   * @param {String} animation - CSS class to use.
   * @param {Function} cb - Callback to run when animation is finished.
   */
  function animate(isIn, element, animation, cb) {
    element = $(element).eq(0);

    if (!element.length) return;

    var initClass = isIn ? initClasses[0] : initClasses[1];
    var activeClass = isIn ? activeClasses[0] : activeClasses[1];

    // Set up the animation
    reset();

    element.addClass(animation).css('transition', 'none');

    requestAnimationFrame(function () {
      element.addClass(initClass);
      if (isIn) element.show();
    });

    // Start the animation
    requestAnimationFrame(function () {
      element[0].offsetWidth;
      element.css('transition', '').addClass(activeClass);
    });

    // Clean up the animation when it finishes
    element.one(Foundation.transitionend(element), finish);

    // Hides the element (for out animations), resets the element, and runs a callback
    function finish() {
      if (!isIn) element.hide();
      reset();
      if (cb) cb.apply(element);
    }

    // Resets transitions and removes motion-specific classes
    function reset() {
      element[0].style.transitionDuration = 0;
      element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
    }
  }

  Foundation.Move = Move;
  Foundation.Motion = Motion;
}(jQuery);
'use strict';

!function ($) {

  var Nest = {
    Feather: function Feather(menu) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'zf';

      menu.attr('role', 'menubar');

      var items = menu.find('li').attr({ 'role': 'menuitem' }),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      items.each(function () {
        var $item = $(this),
            $sub = $item.children('ul');

        if ($sub.length) {
          $item.addClass(hasSubClass).attr({
            'aria-haspopup': true,
            'aria-label': $item.children('a:first').text()
          });
          // Note:  Drilldowns behave differently in how they hide, and so need
          // additional attributes.  We should look if this possibly over-generalized
          // utility (Nest) is appropriate when we rework menus in 6.4
          if (type === 'drilldown') {
            $item.attr({ 'aria-expanded': false });
          }

          $sub.addClass('submenu ' + subMenuClass).attr({
            'data-submenu': '',
            'role': 'menu'
          });
          if (type === 'drilldown') {
            $sub.attr({ 'aria-hidden': true });
          }
        }

        if ($item.parent('[data-submenu]').length) {
          $item.addClass('is-submenu-item ' + subItemClass);
        }
      });

      return;
    },
    Burn: function Burn(menu, type) {
      var //items = menu.find('li'),
      subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      menu.find('>li, .menu, .menu > li').removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').removeAttr('data-submenu').css('display', '');

      // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
      //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
      //           .removeAttr('data-submenu'));
      // items.each(function(){
      //   var $item = $(this),
      //       $sub = $item.children('ul');
      //   if($item.parent('[data-submenu]').length){
      //     $item.removeClass('is-submenu-item ' + subItemClass);
      //   }
      //   if($sub.length){
      //     $item.removeClass('has-submenu');
      //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
      //   }
      // });
    }
  };

  Foundation.Nest = Nest;
}(jQuery);
'use strict';

!function ($) {

  function Timer(elem, options, cb) {
    var _this = this,
        duration = options.duration,
        //options is an object for easily adding features later.
    nameSpace = Object.keys(elem.data())[0] || 'timer',
        remain = -1,
        start,
        timer;

    this.isPaused = false;

    this.restart = function () {
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function () {
      this.isPaused = false;
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function () {
        if (options.infinite) {
          _this.restart(); //rerun the timer.
        }
        if (cb && typeof cb === 'function') {
          cb();
        }
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function () {
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  }

  /**
   * Runs a callback function when images are fully loaded.
   * @param {Object} images - Image(s) to check if loaded.
   * @param {Func} callback - Function to execute when image is fully loaded.
   */
  function onImagesLoaded(images, callback) {
    var self = this,
        unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    images.each(function () {
      // Check if image is loaded
      if (this.complete || this.readyState === 4 || this.readyState === 'complete') {
        singleImageLoaded();
      }
      // Force load the image
      else {
          // fix for IE. See https://css-tricks.com/snippets/jquery/fixing-load-in-ie-for-cached-images/
          var src = $(this).attr('src');
          $(this).attr('src', src + (src.indexOf('?') >= 0 ? '&' : '?') + new Date().getTime());
          $(this).one('load', function () {
            singleImageLoaded();
          });
        }
    });

    function singleImageLoaded() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    }
  }

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;
}(jQuery);
'use strict';

//**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function ($) {

	$.spotSwipe = {
		version: '1.0.0',
		enabled: 'ontouchstart' in document.documentElement,
		preventDefault: false,
		moveThreshold: 75,
		timeThreshold: 200
	};

	var startPosX,
	    startPosY,
	    startTime,
	    elapsedTime,
	    isMoving = false;

	function onTouchEnd() {
		//  alert(this);
		this.removeEventListener('touchmove', onTouchMove);
		this.removeEventListener('touchend', onTouchEnd);
		isMoving = false;
	}

	function onTouchMove(e) {
		if ($.spotSwipe.preventDefault) {
			e.preventDefault();
		}
		if (isMoving) {
			var x = e.touches[0].pageX;
			var y = e.touches[0].pageY;
			var dx = startPosX - x;
			var dy = startPosY - y;
			var dir;
			elapsedTime = new Date().getTime() - startTime;
			if (Math.abs(dx) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
				dir = dx > 0 ? 'left' : 'right';
			}
			// else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
			//   dir = dy > 0 ? 'down' : 'up';
			// }
			if (dir) {
				e.preventDefault();
				onTouchEnd.call(this);
				$(this).trigger('swipe', dir).trigger('swipe' + dir);
			}
		}
	}

	function onTouchStart(e) {
		if (e.touches.length == 1) {
			startPosX = e.touches[0].pageX;
			startPosY = e.touches[0].pageY;
			isMoving = true;
			startTime = new Date().getTime();
			this.addEventListener('touchmove', onTouchMove, false);
			this.addEventListener('touchend', onTouchEnd, false);
		}
	}

	function init() {
		this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
	}

	function teardown() {
		this.removeEventListener('touchstart', onTouchStart);
	}

	$.event.special.swipe = { setup: init };

	$.each(['left', 'up', 'down', 'right'], function () {
		$.event.special['swipe' + this] = { setup: function setup() {
				$(this).on('swipe', $.noop);
			} };
	});
})(jQuery);
/****************************************************
 * Method for adding psuedo drag events to elements *
 ***************************************************/
!function ($) {
	$.fn.addTouch = function () {
		this.each(function (i, el) {
			$(el).bind('touchstart touchmove touchend touchcancel', function () {
				//we pass the original event object because the jQuery event
				//object is normalized to w3c specs and does not provide the TouchList
				handleTouch(event);
			});
		});

		var handleTouch = function handleTouch(event) {
			var touches = event.changedTouches,
			    first = touches[0],
			    eventTypes = {
				touchstart: 'mousedown',
				touchmove: 'mousemove',
				touchend: 'mouseup'
			},
			    type = eventTypes[event.type],
			    simulatedEvent;

			if ('MouseEvent' in window && typeof window.MouseEvent === 'function') {
				simulatedEvent = new window.MouseEvent(type, {
					'bubbles': true,
					'cancelable': true,
					'screenX': first.screenX,
					'screenY': first.screenY,
					'clientX': first.clientX,
					'clientY': first.clientY
				});
			} else {
				simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
			}
			first.target.dispatchEvent(simulatedEvent);
		};
	};
}(jQuery);

//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		}
	});

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		} else {
			$.event.dispatch.call( obj, event );
		}
		event.type = originalType;
	}

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			} else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			}

			return {
				x: x,
				y: y
			};
		},

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					};
		},

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					};
		},

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ), true );
				return true;
			}
			return false;

		},

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {};

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 };
				$.data( this, "mobile-events", events );
			}
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				}
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					}

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						}
					}
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				};

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				};

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			};
			$this.on( touchStartEvent, context.start );
		},

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				}
			}

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				}
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				}
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				}
			}
		}
	};
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			},
			teardown: function() {
				$( this ).unbind( sourceEvent );
			}
		};
	});
})( jQuery, this );
*/
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  var MutationObserver = function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'MutationObserver' in window) {
        return window[prefixes[i] + 'MutationObserver'];
      }
    }
    return false;
  }();

  var triggers = function triggers(el, type) {
    el.data(type).split(' ').forEach(function (id) {
      $('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
    });
  };
  // Elements with [data-open] will reveal a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-open]', function () {
    triggers($(this), 'open');
  });

  // Elements with [data-close] will close a plugin that supports it when clicked.
  // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
  $(document).on('click.zf.trigger', '[data-close]', function () {
    var id = $(this).data('close');
    if (id) {
      triggers($(this), 'close');
    } else {
      $(this).trigger('close.zf.trigger');
    }
  });

  // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-toggle]', function () {
    var id = $(this).data('toggle');
    if (id) {
      triggers($(this), 'toggle');
    } else {
      $(this).trigger('toggle.zf.trigger');
    }
  });

  // Elements with [data-closable] will respond to close.zf.trigger events.
  $(document).on('close.zf.trigger', '[data-closable]', function (e) {
    e.stopPropagation();
    var animation = $(this).data('closable');

    if (animation !== '') {
      Foundation.Motion.animateOut($(this), animation, function () {
        $(this).trigger('closed.zf');
      });
    } else {
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  $(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function () {
    var id = $(this).data('toggle-focus');
    $('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  /**
  * Fires once after all other scripts have loaded
  * @function
  * @private
  */
  $(window).on('load', function () {
    checkListeners();
  });

  function checkListeners() {
    eventsListener();
    resizeListener();
    scrollListener();
    closemeListener();
  }

  //******** only fires this function once on load, if there's something to watch ********
  function closemeListener(pluginName) {
    var yetiBoxes = $('[data-yeti-box]'),
        plugNames = ['dropdown', 'tooltip', 'reveal'];

    if (pluginName) {
      if (typeof pluginName === 'string') {
        plugNames.push(pluginName);
      } else if ((typeof pluginName === 'undefined' ? 'undefined' : _typeof(pluginName)) === 'object' && typeof pluginName[0] === 'string') {
        plugNames.concat(pluginName);
      } else {
        console.error('Plugin names must be strings');
      }
    }
    if (yetiBoxes.length) {
      var listeners = plugNames.map(function (name) {
        return 'closeme.zf.' + name;
      }).join(' ');

      $(window).off(listeners).on(listeners, function (e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = $('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  }

  function resizeListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-resize]');
    if ($nodes.length) {
      $(window).off('resize.zf.trigger').on('resize.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a resize event
          $nodes.attr('data-events', "resize");
        }, debounce || 10); //default time to emit resize event
      });
    }
  }

  function scrollListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-scroll]');
    if ($nodes.length) {
      $(window).off('scroll.zf.trigger').on('scroll.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a scroll event
          $nodes.attr('data-events', "scroll");
        }, debounce || 10); //default time to emit scroll event
      });
    }
  }

  function eventsListener() {
    if (!MutationObserver) {
      return false;
    }
    var nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    //element callback
    var listeningElementsMutation = function listeningElementsMutation(mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);

      //trigger the event handler for the element depending on type
      switch (mutationRecordsList[0].type) {

        case "attributes":
          if ($target.attr("data-events") === "scroll" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
          }
          if ($target.attr("data-events") === "resize" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('resizeme.zf.trigger', [$target]);
          }
          if (mutationRecordsList[0].attributeName === "style") {
            $target.closest("[data-mutate]").attr("data-events", "mutate");
            $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          }
          break;

        case "childList":
          $target.closest("[data-mutate]").attr("data-events", "mutate");
          $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          break;

        default:
          return false;
        //nothing
      }
    };

    if (nodes.length) {
      //for each element that needs to listen for resizing, scrolling, or mutation add a single observer
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] });
      }
    }
  }

  // ------------------------------------

  // [PH]
  // Foundation.CheckWatchers = checkWatchers;
  Foundation.IHearYou = checkListeners;
  // Foundation.ISeeYou = scrollListener;
  // Foundation.IFeelYou = closemeListener;
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Accordion module.
   * @module foundation.accordion
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   */

  var Accordion = function () {
    /**
     * Creates a new instance of an accordion.
     * @class
     * @fires Accordion#init
     * @param {jQuery} element - jQuery object to make into an accordion.
     * @param {Object} options - a plain object with settings to override the default options.
     */
    function Accordion(element, options) {
      _classCallCheck(this, Accordion);

      this.$element = element;
      this.options = $.extend({}, Accordion.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Accordion');
      Foundation.Keyboard.register('Accordion', {
        'ENTER': 'toggle',
        'SPACE': 'toggle',
        'ARROW_DOWN': 'next',
        'ARROW_UP': 'previous'
      });
    }

    /**
     * Initializes the accordion by animating the preset active pane(s).
     * @private
     */


    _createClass(Accordion, [{
      key: '_init',
      value: function _init() {
        var _this2 = this;

        this.$element.attr('role', 'tablist');
        this.$tabs = this.$element.children('[data-accordion-item]');

        this.$tabs.each(function (idx, el) {
          var $el = $(el),
              $content = $el.children('[data-tab-content]'),
              id = $content[0].id || Foundation.GetYoDigits(6, 'accordion'),
              linkId = el.id || id + '-label';

          $el.find('a:first').attr({
            'aria-controls': id,
            'role': 'tab',
            'id': linkId,
            'aria-expanded': false,
            'aria-selected': false
          });

          $content.attr({ 'role': 'tabpanel', 'aria-labelledby': linkId, 'aria-hidden': true, 'id': id });
        });
        var $initActive = this.$element.find('.is-active').children('[data-tab-content]');
        this.firstTimeInit = true;
        if ($initActive.length) {
          this.down($initActive, this.firstTimeInit);
          this.firstTimeInit = false;
        }

        this._checkDeepLink = function () {
          var anchor = window.location.hash;
          //need a hash and a relevant anchor in this tabset
          if (anchor.length) {
            var $link = _this2.$element.find('[href$="' + anchor + '"]'),
                $anchor = $(anchor);

            if ($link.length && $anchor) {
              if (!$link.parent('[data-accordion-item]').hasClass('is-active')) {
                _this2.down($anchor, _this2.firstTimeInit);
                _this2.firstTimeInit = false;
              };

              //roll up a little to show the titles
              if (_this2.options.deepLinkSmudge) {
                var _this = _this2;
                $(window).load(function () {
                  var offset = _this.$element.offset();
                  $('html, body').animate({ scrollTop: offset.top }, _this.options.deepLinkSmudgeDelay);
                });
              }

              /**
                * Fires when the zplugin has deeplinked at pageload
                * @event Accordion#deeplink
                */
              _this2.$element.trigger('deeplink.zf.accordion', [$link, $anchor]);
            }
          }
        };

        //use browser to open a tab, if it exists in this tabset
        if (this.options.deepLink) {
          this._checkDeepLink();
        }

        this._events();
      }

      /**
       * Adds event handlers for items within the accordion.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this.$tabs.each(function () {
          var $elem = $(this);
          var $tabContent = $elem.children('[data-tab-content]');
          if ($tabContent.length) {
            $elem.children('a').off('click.zf.accordion keydown.zf.accordion').on('click.zf.accordion', function (e) {
              e.preventDefault();
              _this.toggle($tabContent);
            }).on('keydown.zf.accordion', function (e) {
              Foundation.Keyboard.handleKey(e, 'Accordion', {
                toggle: function toggle() {
                  _this.toggle($tabContent);
                },
                next: function next() {
                  var $a = $elem.next().find('a').focus();
                  if (!_this.options.multiExpand) {
                    $a.trigger('click.zf.accordion');
                  }
                },
                previous: function previous() {
                  var $a = $elem.prev().find('a').focus();
                  if (!_this.options.multiExpand) {
                    $a.trigger('click.zf.accordion');
                  }
                },
                handled: function handled() {
                  e.preventDefault();
                  e.stopPropagation();
                }
              });
            });
          }
        });
        if (this.options.deepLink) {
          $(window).on('popstate', this._checkDeepLink);
        }
      }

      /**
       * Toggles the selected content pane's open/close state.
       * @param {jQuery} $target - jQuery object of the pane to toggle (`.accordion-content`).
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle($target) {
        if ($target.parent().hasClass('is-active')) {
          this.up($target);
        } else {
          this.down($target);
        }
        //either replace or update browser history
        if (this.options.deepLink) {
          var anchor = $target.prev('a').attr('href');

          if (this.options.updateHistory) {
            history.pushState({}, '', anchor);
          } else {
            history.replaceState({}, '', anchor);
          }
        }
      }

      /**
       * Opens the accordion tab defined by `$target`.
       * @param {jQuery} $target - Accordion pane to open (`.accordion-content`).
       * @param {Boolean} firstTime - flag to determine if reflow should happen.
       * @fires Accordion#down
       * @function
       */

    }, {
      key: 'down',
      value: function down($target, firstTime) {
        var _this3 = this;

        $target.attr('aria-hidden', false).parent('[data-tab-content]').addBack().parent().addClass('is-active');

        if (!this.options.multiExpand && !firstTime) {
          var $currentActive = this.$element.children('.is-active').children('[data-tab-content]');
          if ($currentActive.length) {
            this.up($currentActive.not($target));
          }
        }

        $target.slideDown(this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done opening.
           * @event Accordion#down
           */
          _this3.$element.trigger('down.zf.accordion', [$target]);
        });

        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': true,
          'aria-selected': true
        });
      }

      /**
       * Closes the tab defined by `$target`.
       * @param {jQuery} $target - Accordion tab to close (`.accordion-content`).
       * @fires Accordion#up
       * @function
       */

    }, {
      key: 'up',
      value: function up($target) {
        var $aunts = $target.parent().siblings(),
            _this = this;

        if (!this.options.allowAllClosed && !$aunts.hasClass('is-active') || !$target.parent().hasClass('is-active')) {
          return;
        }

        // Foundation.Move(this.options.slideSpeed, $target, function(){
        $target.slideUp(_this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done collapsing up.
           * @event Accordion#up
           */
          _this.$element.trigger('up.zf.accordion', [$target]);
        });
        // });

        $target.attr('aria-hidden', true).parent().removeClass('is-active');

        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': false,
          'aria-selected': false
        });
      }

      /**
       * Destroys an instance of an accordion.
       * @fires Accordion#destroyed
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('[data-tab-content]').stop(true).slideUp(0).css('display', '');
        this.$element.find('a').off('.zf.accordion');
        if (this.options.deepLink) {
          $(window).off('popstate', this._checkDeepLink);
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Accordion;
  }();

  Accordion.defaults = {
    /**
     * Amount of time to animate the opening of an accordion pane.
     * @option
     * @type {number}
     * @default 250
     */
    slideSpeed: 250,
    /**
     * Allow the accordion to have multiple open panes.
     * @option
     * @type {boolean}
     * @default false
     */
    multiExpand: false,
    /**
     * Allow the accordion to close all panes.
     * @option
     * @type {boolean}
     * @default false
     */
    allowAllClosed: false,
    /**
     * Allows the window to scroll to content of pane specified by hash anchor
     * @option
     * @type {boolean}
     * @default false
     */
    deepLink: false,

    /**
     * Adjust the deep link scroll to make sure the top of the accordion panel is visible
     * @option
     * @type {boolean}
     * @default false
     */
    deepLinkSmudge: false,

    /**
     * Animation time (ms) for the deep link adjustment
     * @option
     * @type {number}
     * @default 300
     */
    deepLinkSmudgeDelay: 300,

    /**
     * Update the browser history with the open accordion
     * @option
     * @type {boolean}
     * @default false
     */
    updateHistory: false
  };

  // Window exports
  Foundation.plugin(Accordion, 'Accordion');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Interchange module.
   * @module foundation.interchange
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.timerAndImageLoader
   */

  var Interchange = function () {
    /**
     * Creates a new instance of Interchange.
     * @class
     * @fires Interchange#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Interchange(element, options) {
      _classCallCheck(this, Interchange);

      this.$element = element;
      this.options = $.extend({}, Interchange.defaults, options);
      this.rules = [];
      this.currentPath = '';

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'Interchange');
    }

    /**
     * Initializes the Interchange plugin and calls functions to get interchange functioning on load.
     * @function
     * @private
     */


    _createClass(Interchange, [{
      key: '_init',
      value: function _init() {
        this._addBreakpoints();
        this._generateRules();
        this._reflow();
      }

      /**
       * Initializes events for Interchange.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this2 = this;

        $(window).on('resize.zf.interchange', Foundation.util.throttle(function () {
          _this2._reflow();
        }, 50));
      }

      /**
       * Calls necessary functions to update Interchange upon DOM change
       * @function
       * @private
       */

    }, {
      key: '_reflow',
      value: function _reflow() {
        var match;

        // Iterate through each rule, but only save the last match
        for (var i in this.rules) {
          if (this.rules.hasOwnProperty(i)) {
            var rule = this.rules[i];
            if (window.matchMedia(rule.query).matches) {
              match = rule;
            }
          }
        }

        if (match) {
          this.replace(match.path);
        }
      }

      /**
       * Gets the Foundation breakpoints and adds them to the Interchange.SPECIAL_QUERIES object.
       * @function
       * @private
       */

    }, {
      key: '_addBreakpoints',
      value: function _addBreakpoints() {
        for (var i in Foundation.MediaQuery.queries) {
          if (Foundation.MediaQuery.queries.hasOwnProperty(i)) {
            var query = Foundation.MediaQuery.queries[i];
            Interchange.SPECIAL_QUERIES[query.name] = query.value;
          }
        }
      }

      /**
       * Checks the Interchange element for the provided media query + content pairings
       * @function
       * @private
       * @param {Object} element - jQuery object that is an Interchange instance
       * @returns {Array} scenarios - Array of objects that have 'mq' and 'path' keys with corresponding keys
       */

    }, {
      key: '_generateRules',
      value: function _generateRules(element) {
        var rulesList = [];
        var rules;

        if (this.options.rules) {
          rules = this.options.rules;
        } else {
          rules = this.$element.data('interchange');
        }

        rules = typeof rules === 'string' ? rules.match(/\[.*?\]/g) : rules;

        for (var i in rules) {
          if (rules.hasOwnProperty(i)) {
            var rule = rules[i].slice(1, -1).split(', ');
            var path = rule.slice(0, -1).join('');
            var query = rule[rule.length - 1];

            if (Interchange.SPECIAL_QUERIES[query]) {
              query = Interchange.SPECIAL_QUERIES[query];
            }

            rulesList.push({
              path: path,
              query: query
            });
          }
        }

        this.rules = rulesList;
      }

      /**
       * Update the `src` property of an image, or change the HTML of a container, to the specified path.
       * @function
       * @param {String} path - Path to the image or HTML partial.
       * @fires Interchange#replaced
       */

    }, {
      key: 'replace',
      value: function replace(path) {
        if (this.currentPath === path) return;

        var _this = this,
            trigger = 'replaced.zf.interchange';

        // Replacing images
        if (this.$element[0].nodeName === 'IMG') {
          this.$element.attr('src', path).on('load', function () {
            _this.currentPath = path;
          }).trigger(trigger);
        }
        // Replacing background images
        else if (path.match(/\.(gif|jpg|jpeg|png|svg|tiff)([?#].*)?/i)) {
            this.$element.css({ 'background-image': 'url(' + path + ')' }).trigger(trigger);
          }
          // Replacing HTML
          else {
              $.get(path, function (response) {
                _this.$element.html(response).trigger(trigger);
                $(response).foundation();
                _this.currentPath = path;
              });
            }

        /**
         * Fires when content in an Interchange element is done being loaded.
         * @event Interchange#replaced
         */
        // this.$element.trigger('replaced.zf.interchange');
      }

      /**
       * Destroys an instance of interchange.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        //TODO this.
      }
    }]);

    return Interchange;
  }();

  /**
   * Default settings for plugin
   */


  Interchange.defaults = {
    /**
     * Rules to be applied to Interchange elements. Set with the `data-interchange` array notation.
     * @option
     * @type {?array}
     * @default null
     */
    rules: null
  };

  Interchange.SPECIAL_QUERIES = {
    'landscape': 'screen and (orientation: landscape)',
    'portrait': 'screen and (orientation: portrait)',
    'retina': 'only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx)'
  };

  // Window exports
  Foundation.plugin(Interchange, 'Interchange');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Magellan module.
   * @module foundation.magellan
   */

  var Magellan = function () {
    /**
     * Creates a new instance of Magellan.
     * @class
     * @fires Magellan#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Magellan(element, options) {
      _classCallCheck(this, Magellan);

      this.$element = element;
      this.options = $.extend({}, Magellan.defaults, this.$element.data(), options);

      this._init();
      this.calcPoints();

      Foundation.registerPlugin(this, 'Magellan');
    }

    /**
     * Initializes the Magellan plugin and calls functions to get equalizer functioning on load.
     * @private
     */


    _createClass(Magellan, [{
      key: '_init',
      value: function _init() {
        var id = this.$element[0].id || Foundation.GetYoDigits(6, 'magellan');
        var _this = this;
        this.$targets = $('[data-magellan-target]');
        this.$links = this.$element.find('a');
        this.$element.attr({
          'data-resize': id,
          'data-scroll': id,
          'id': id
        });
        this.$active = $();
        this.scrollPos = parseInt(window.pageYOffset, 10);

        this._events();
      }

      /**
       * Calculates an array of pixel values that are the demarcation lines between locations on the page.
       * Can be invoked if new elements are added or the size of a location changes.
       * @function
       */

    }, {
      key: 'calcPoints',
      value: function calcPoints() {
        var _this = this,
            body = document.body,
            html = document.documentElement;

        this.points = [];
        this.winHeight = Math.round(Math.max(window.innerHeight, html.clientHeight));
        this.docHeight = Math.round(Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight));

        this.$targets.each(function () {
          var $tar = $(this),
              pt = Math.round($tar.offset().top - _this.options.threshold);
          $tar.targetPoint = pt;
          _this.points.push(pt);
        });
      }

      /**
       * Initializes events for Magellan.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this,
            $body = $('html, body'),
            opts = {
          duration: _this.options.animationDuration,
          easing: _this.options.animationEasing
        };
        $(window).one('load', function () {
          if (_this.options.deepLinking) {
            if (location.hash) {
              _this.scrollToLoc(location.hash);
            }
          }
          _this.calcPoints();
          _this._updateActive();
        });

        this.$element.on({
          'resizeme.zf.trigger': this.reflow.bind(this),
          'scrollme.zf.trigger': this._updateActive.bind(this)
        }).on('click.zf.magellan', 'a[href^="#"]', function (e) {
          e.preventDefault();
          var arrival = this.getAttribute('href');
          _this.scrollToLoc(arrival);
        });
        $(window).on('popstate', function (e) {
          if (_this.options.deepLinking) {
            _this.scrollToLoc(window.location.hash);
          }
        });
      }

      /**
       * Function to scroll to a given location on the page.
       * @param {String} loc - a properly formatted jQuery id selector. Example: '#foo'
       * @function
       */

    }, {
      key: 'scrollToLoc',
      value: function scrollToLoc(loc) {
        // Do nothing if target does not exist to prevent errors
        if (!$(loc).length) {
          return false;
        }
        this._inTransition = true;
        var _this = this,
            scrollPos = Math.round($(loc).offset().top - this.options.threshold / 2 - this.options.barOffset);

        $('html, body').stop(true).animate({ scrollTop: scrollPos }, this.options.animationDuration, this.options.animationEasing, function () {
          _this._inTransition = false;_this._updateActive();
        });
      }

      /**
       * Calls necessary functions to update Magellan upon DOM change
       * @function
       */

    }, {
      key: 'reflow',
      value: function reflow() {
        this.calcPoints();
        this._updateActive();
      }

      /**
       * Updates the visibility of an active location link, and updates the url hash for the page, if deepLinking enabled.
       * @private
       * @function
       * @fires Magellan#update
       */

    }, {
      key: '_updateActive',
      value: function _updateActive() /*evt, elem, scrollPos*/{
        if (this._inTransition) {
          return;
        }
        var winPos = /*scrollPos ||*/parseInt(window.pageYOffset, 10),
            curIdx;

        if (winPos + this.winHeight === this.docHeight) {
          curIdx = this.points.length - 1;
        } else if (winPos < this.points[0]) {
          curIdx = undefined;
        } else {
          var isDown = this.scrollPos < winPos,
              _this = this,
              curVisible = this.points.filter(function (p, i) {
            return isDown ? p - _this.options.barOffset <= winPos : p - _this.options.barOffset - _this.options.threshold <= winPos;
          });
          curIdx = curVisible.length ? curVisible.length - 1 : 0;
        }

        this.$active.removeClass(this.options.activeClass);
        this.$active = this.$links.filter('[href="#' + this.$targets.eq(curIdx).data('magellan-target') + '"]').addClass(this.options.activeClass);

        if (this.options.deepLinking) {
          var hash = "";
          if (curIdx != undefined) {
            hash = this.$active[0].getAttribute('href');
          }
          if (hash !== window.location.hash) {
            if (window.history.pushState) {
              window.history.pushState(null, null, hash);
            } else {
              window.location.hash = hash;
            }
          }
        }

        this.scrollPos = winPos;
        /**
         * Fires when magellan is finished updating to the new active element.
         * @event Magellan#update
         */
        this.$element.trigger('update.zf.magellan', [this.$active]);
      }

      /**
       * Destroys an instance of Magellan and resets the url of the window.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.off('.zf.trigger .zf.magellan').find('.' + this.options.activeClass).removeClass(this.options.activeClass);

        if (this.options.deepLinking) {
          var hash = this.$active[0].getAttribute('href');
          window.location.hash.replace(hash, '');
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Magellan;
  }();

  /**
   * Default settings for plugin
   */


  Magellan.defaults = {
    /**
     * Amount of time, in ms, the animated scrolling should take between locations.
     * @option
     * @type {number}
     * @default 500
     */
    animationDuration: 500,
    /**
     * Animation style to use when scrolling between locations. Can be `'swing'` or `'linear'`.
     * @option
     * @type {string}
     * @default 'linear'
     * @see {@link https://api.jquery.com/animate|Jquery animate}
     */
    animationEasing: 'linear',
    /**
     * Number of pixels to use as a marker for location changes.
     * @option
     * @type {number}
     * @default 50
     */
    threshold: 50,
    /**
     * Class applied to the active locations link on the magellan container.
     * @option
     * @type {string}
     * @default 'active'
     */
    activeClass: 'active',
    /**
     * Allows the script to manipulate the url of the current page, and if supported, alter the history.
     * @option
     * @type {boolean}
     * @default false
     */
    deepLinking: false,
    /**
     * Number of pixels to offset the scroll of the page on item click if using a sticky nav bar.
     * @option
     * @type {number}
     * @default 0
     */
    barOffset: 0

    // Window exports
  };Foundation.plugin(Magellan, 'Magellan');
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Tabs module.
   * @module foundation.tabs
   * @requires foundation.util.keyboard
   * @requires foundation.util.timerAndImageLoader if tabs contain images
   */

  var Tabs = function () {
    /**
     * Creates a new instance of tabs.
     * @class
     * @fires Tabs#init
     * @param {jQuery} element - jQuery object to make into tabs.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Tabs(element, options) {
      _classCallCheck(this, Tabs);

      this.$element = element;
      this.options = $.extend({}, Tabs.defaults, this.$element.data(), options);

      this._init();
      Foundation.registerPlugin(this, 'Tabs');
      Foundation.Keyboard.register('Tabs', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'previous',
        'ARROW_DOWN': 'next',
        'ARROW_LEFT': 'previous'
        // 'TAB': 'next',
        // 'SHIFT_TAB': 'previous'
      });
    }

    /**
     * Initializes the tabs by showing and focusing (if autoFocus=true) the preset active tab.
     * @private
     */


    _createClass(Tabs, [{
      key: '_init',
      value: function _init() {
        var _this2 = this;

        var _this = this;

        this.$element.attr({ 'role': 'tablist' });
        this.$tabTitles = this.$element.find('.' + this.options.linkClass);
        this.$tabContent = $('[data-tabs-content="' + this.$element[0].id + '"]');

        this.$tabTitles.each(function () {
          var $elem = $(this),
              $link = $elem.find('a'),
              isActive = $elem.hasClass('' + _this.options.linkActiveClass),
              hash = $link[0].hash.slice(1),
              linkId = $link[0].id ? $link[0].id : hash + '-label',
              $tabContent = $('#' + hash);

          $elem.attr({ 'role': 'presentation' });

          $link.attr({
            'role': 'tab',
            'aria-controls': hash,
            'aria-selected': isActive,
            'id': linkId
          });

          $tabContent.attr({
            'role': 'tabpanel',
            'aria-hidden': !isActive,
            'aria-labelledby': linkId
          });

          if (isActive && _this.options.autoFocus) {
            $(window).load(function () {
              $('html, body').animate({ scrollTop: $elem.offset().top }, _this.options.deepLinkSmudgeDelay, function () {
                $link.focus();
              });
            });
          }
        });
        if (this.options.matchHeight) {
          var $images = this.$tabContent.find('img');

          if ($images.length) {
            Foundation.onImagesLoaded($images, this._setHeight.bind(this));
          } else {
            this._setHeight();
          }
        }

        //current context-bound function to open tabs on page load or history popstate
        this._checkDeepLink = function () {
          var anchor = window.location.hash;
          //need a hash and a relevant anchor in this tabset
          if (anchor.length) {
            var $link = _this2.$element.find('[href$="' + anchor + '"]');
            if ($link.length) {
              _this2.selectTab($(anchor), true);

              //roll up a little to show the titles
              if (_this2.options.deepLinkSmudge) {
                var offset = _this2.$element.offset();
                $('html, body').animate({ scrollTop: offset.top }, _this2.options.deepLinkSmudgeDelay);
              }

              /**
                * Fires when the zplugin has deeplinked at pageload
                * @event Tabs#deeplink
                */
              _this2.$element.trigger('deeplink.zf.tabs', [$link, $(anchor)]);
            }
          }
        };

        //use browser to open a tab, if it exists in this tabset
        if (this.options.deepLink) {
          this._checkDeepLink();
        }

        this._events();
      }

      /**
       * Adds event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this._addKeyHandler();
        this._addClickHandler();
        this._setHeightMqHandler = null;

        if (this.options.matchHeight) {
          this._setHeightMqHandler = this._setHeight.bind(this);

          $(window).on('changed.zf.mediaquery', this._setHeightMqHandler);
        }

        if (this.options.deepLink) {
          $(window).on('popstate', this._checkDeepLink);
        }
      }

      /**
       * Adds click handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addClickHandler',
      value: function _addClickHandler() {
        var _this = this;

        this.$element.off('click.zf.tabs').on('click.zf.tabs', '.' + this.options.linkClass, function (e) {
          e.preventDefault();
          e.stopPropagation();
          _this._handleTabChange($(this));
        });
      }

      /**
       * Adds keyboard event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addKeyHandler',
      value: function _addKeyHandler() {
        var _this = this;

        this.$tabTitles.off('keydown.zf.tabs').on('keydown.zf.tabs', function (e) {
          if (e.which === 9) return;

          var $element = $(this),
              $elements = $element.parent('ul').children('li'),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              if (_this.options.wrapOnKeys) {
                $prevElement = i === 0 ? $elements.last() : $elements.eq(i - 1);
                $nextElement = i === $elements.length - 1 ? $elements.first() : $elements.eq(i + 1);
              } else {
                $prevElement = $elements.eq(Math.max(0, i - 1));
                $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
              }
              return;
            }
          });

          // handle keyboard event with keyboard util
          Foundation.Keyboard.handleKey(e, 'Tabs', {
            open: function open() {
              $element.find('[role="tab"]').focus();
              _this._handleTabChange($element);
            },
            previous: function previous() {
              $prevElement.find('[role="tab"]').focus();
              _this._handleTabChange($prevElement);
            },
            next: function next() {
              $nextElement.find('[role="tab"]').focus();
              _this._handleTabChange($nextElement);
            },
            handled: function handled() {
              e.stopPropagation();
              e.preventDefault();
            }
          });
        });
      }

      /**
       * Opens the tab `$targetContent` defined by `$target`. Collapses active tab.
       * @param {jQuery} $target - Tab to open.
       * @param {boolean} historyHandled - browser has already handled a history update
       * @fires Tabs#change
       * @function
       */

    }, {
      key: '_handleTabChange',
      value: function _handleTabChange($target, historyHandled) {

        /**
         * Check for active class on target. Collapse if exists.
         */
        if ($target.hasClass('' + this.options.linkActiveClass)) {
          if (this.options.activeCollapse) {
            this._collapseTab($target);

            /**
             * Fires when the zplugin has successfully collapsed tabs.
             * @event Tabs#collapse
             */
            this.$element.trigger('collapse.zf.tabs', [$target]);
          }
          return;
        }

        var $oldTab = this.$element.find('.' + this.options.linkClass + '.' + this.options.linkActiveClass),
            $tabLink = $target.find('[role="tab"]'),
            hash = $tabLink[0].hash,
            $targetContent = this.$tabContent.find(hash);

        //close old tab
        this._collapseTab($oldTab);

        //open new tab
        this._openTab($target);

        //either replace or update browser history
        if (this.options.deepLink && !historyHandled) {
          var anchor = $target.find('a').attr('href');

          if (this.options.updateHistory) {
            history.pushState({}, '', anchor);
          } else {
            history.replaceState({}, '', anchor);
          }
        }

        /**
         * Fires when the plugin has successfully changed tabs.
         * @event Tabs#change
         */
        this.$element.trigger('change.zf.tabs', [$target, $targetContent]);

        //fire to children a mutation event
        $targetContent.find("[data-mutate]").trigger("mutateme.zf.trigger");
      }

      /**
       * Opens the tab `$targetContent` defined by `$target`.
       * @param {jQuery} $target - Tab to Open.
       * @function
       */

    }, {
      key: '_openTab',
      value: function _openTab($target) {
        var $tabLink = $target.find('[role="tab"]'),
            hash = $tabLink[0].hash,
            $targetContent = this.$tabContent.find(hash);

        $target.addClass('' + this.options.linkActiveClass);

        $tabLink.attr({ 'aria-selected': 'true' });

        $targetContent.addClass('' + this.options.panelActiveClass).attr({ 'aria-hidden': 'false' });
      }

      /**
       * Collapses `$targetContent` defined by `$target`.
       * @param {jQuery} $target - Tab to Open.
       * @function
       */

    }, {
      key: '_collapseTab',
      value: function _collapseTab($target) {
        var $target_anchor = $target.removeClass('' + this.options.linkActiveClass).find('[role="tab"]').attr({ 'aria-selected': 'false' });

        $('#' + $target_anchor.attr('aria-controls')).removeClass('' + this.options.panelActiveClass).attr({ 'aria-hidden': 'true' });
      }

      /**
       * Public method for selecting a content pane to display.
       * @param {jQuery | String} elem - jQuery object or string of the id of the pane to display.
       * @param {boolean} historyHandled - browser has already handled a history update
       * @function
       */

    }, {
      key: 'selectTab',
      value: function selectTab(elem, historyHandled) {
        var idStr;

        if ((typeof elem === 'undefined' ? 'undefined' : _typeof(elem)) === 'object') {
          idStr = elem[0].id;
        } else {
          idStr = elem;
        }

        if (idStr.indexOf('#') < 0) {
          idStr = '#' + idStr;
        }

        var $target = this.$tabTitles.find('[href$="' + idStr + '"]').parent('.' + this.options.linkClass);

        this._handleTabChange($target, historyHandled);
      }
    }, {
      key: '_setHeight',

      /**
       * Sets the height of each panel to the height of the tallest panel.
       * If enabled in options, gets called on media query change.
       * If loading content via external source, can be called directly or with _reflow.
       * If enabled with `data-match-height="true"`, tabs sets to equal height
       * @function
       * @private
       */
      value: function _setHeight() {
        var max = 0,
            _this = this; // Lock down the `this` value for the root tabs object

        this.$tabContent.find('.' + this.options.panelClass).css('height', '').each(function () {

          var panel = $(this),
              isActive = panel.hasClass('' + _this.options.panelActiveClass); // get the options from the parent instead of trying to get them from the child

          if (!isActive) {
            panel.css({ 'visibility': 'hidden', 'display': 'block' });
          }

          var temp = this.getBoundingClientRect().height;

          if (!isActive) {
            panel.css({
              'visibility': '',
              'display': ''
            });
          }

          max = temp > max ? temp : max;
        }).css('height', max + 'px');
      }

      /**
       * Destroys an instance of an tabs.
       * @fires Tabs#destroyed
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('.' + this.options.linkClass).off('.zf.tabs').hide().end().find('.' + this.options.panelClass).hide();

        if (this.options.matchHeight) {
          if (this._setHeightMqHandler != null) {
            $(window).off('changed.zf.mediaquery', this._setHeightMqHandler);
          }
        }

        if (this.options.deepLink) {
          $(window).off('popstate', this._checkDeepLink);
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Tabs;
  }();

  Tabs.defaults = {
    /**
     * Allows the window to scroll to content of pane specified by hash anchor
     * @option
     * @type {boolean}
     * @default false
     */
    deepLink: false,

    /**
     * Adjust the deep link scroll to make sure the top of the tab panel is visible
     * @option
     * @type {boolean}
     * @default false
     */
    deepLinkSmudge: false,

    /**
     * Animation time (ms) for the deep link adjustment
     * @option
     * @type {number}
     * @default 300
     */
    deepLinkSmudgeDelay: 300,

    /**
     * Update the browser history with the open tab
     * @option
     * @type {boolean}
     * @default false
     */
    updateHistory: false,

    /**
     * Allows the window to scroll to content of active pane on load if set to true.
     * Not recommended if more than one tab panel per page.
     * @option
     * @type {boolean}
     * @default false
     */
    autoFocus: false,

    /**
     * Allows keyboard input to 'wrap' around the tab links.
     * @option
     * @type {boolean}
     * @default true
     */
    wrapOnKeys: true,

    /**
     * Allows the tab content panes to match heights if set to true.
     * @option
     * @type {boolean}
     * @default false
     */
    matchHeight: false,

    /**
     * Allows active tabs to collapse when clicked.
     * @option
     * @type {boolean}
     * @default false
     */
    activeCollapse: false,

    /**
     * Class applied to `li`'s in tab link list.
     * @option
     * @type {string}
     * @default 'tabs-title'
     */
    linkClass: 'tabs-title',

    /**
     * Class applied to the active `li` in tab link list.
     * @option
     * @type {string}
     * @default 'is-active'
     */
    linkActiveClass: 'is-active',

    /**
     * Class applied to the content containers.
     * @option
     * @type {string}
     * @default 'tabs-panel'
     */
    panelClass: 'tabs-panel',

    /**
     * Class applied to the active content container.
     * @option
     * @type {string}
     * @default 'is-active'
     */
    panelActiveClass: 'is-active'
  };

  // Window exports
  Foundation.plugin(Tabs, 'Tabs');
}(jQuery);
"use strict";

var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }return target;
};

var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
    return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
} : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
};

(function (global, factory) {
    (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.LazyLoad = factory();
})(undefined, function () {
    'use strict';

    var defaultSettings = {
        elements_selector: "img",
        container: window,
        threshold: 300,
        throttle: 150,
        data_src: "original",
        data_srcset: "originalSet",
        class_loading: "loading",
        class_loaded: "loaded",
        class_error: "error",
        class_initial: "initial",
        skip_invisible: true,
        callback_load: null,
        callback_error: null,
        callback_set: null,
        callback_processed: null
    };

    var isBot = !("onscroll" in window) || /glebot/.test(navigator.userAgent);

    var callCallback = function callCallback(callback, argument) {
        if (callback) {
            callback(argument);
        }
    };

    var getTopOffset = function getTopOffset(element) {
        return element.getBoundingClientRect().top + window.pageYOffset - element.ownerDocument.documentElement.clientTop;
    };

    var isBelowViewport = function isBelowViewport(element, container, threshold) {
        var fold = container === window ? window.innerHeight + window.pageYOffset : getTopOffset(container) + container.offsetHeight;
        return fold <= getTopOffset(element) - threshold;
    };

    var getLeftOffset = function getLeftOffset(element) {
        return element.getBoundingClientRect().left + window.pageXOffset - element.ownerDocument.documentElement.clientLeft;
    };

    var isAtRightOfViewport = function isAtRightOfViewport(element, container, threshold) {
        var documentWidth = window.innerWidth;
        var fold = container === window ? documentWidth + window.pageXOffset : getLeftOffset(container) + documentWidth;
        return fold <= getLeftOffset(element) - threshold;
    };

    var isAboveViewport = function isAboveViewport(element, container, threshold) {
        var fold = container === window ? window.pageYOffset : getTopOffset(container);
        return fold >= getTopOffset(element) + threshold + element.offsetHeight;
    };

    var isAtLeftOfViewport = function isAtLeftOfViewport(element, container, threshold) {
        var fold = container === window ? window.pageXOffset : getLeftOffset(container);
        return fold >= getLeftOffset(element) + threshold + element.offsetWidth;
    };

    var isInsideViewport = function isInsideViewport(element, container, threshold) {
        return !isBelowViewport(element, container, threshold) && !isAboveViewport(element, container, threshold) && !isAtRightOfViewport(element, container, threshold) && !isAtLeftOfViewport(element, container, threshold);
    };

    /* Creates instance and notifies it through the window element */
    var createInstance = function createInstance(classObj, options) {
        var instance = new classObj(options);
        var event = new CustomEvent("LazyLoad::Initialized", { detail: { instance: instance } });
        window.dispatchEvent(event);
    };

    /* Auto initialization of one or more instances of lazyload, depending on the 
        options passed in (plain object or an array) */
    var autoInitialize = function autoInitialize(classObj, options) {
        var optsLength = options.length;
        if (!optsLength) {
            // Plain object
            createInstance(classObj, options);
        } else {
            // Array of objects
            for (var i = 0; i < optsLength; i++) {
                createInstance(classObj, options[i]);
            }
        }
    };

    var setSourcesForPicture = function setSourcesForPicture(element, srcsetDataAttribute) {
        var parent = element.parentElement;
        if (parent.tagName !== "PICTURE") {
            return;
        }
        for (var i = 0; i < parent.children.length; i++) {
            var pictureChild = parent.children[i];
            if (pictureChild.tagName === "SOURCE") {
                var sourceSrcset = pictureChild.dataset[srcsetDataAttribute];
                if (sourceSrcset) {
                    pictureChild.setAttribute("srcset", sourceSrcset);
                }
            }
        }
    };

    var setSources = function setSources(element, srcsetDataAttribute, srcDataAttribute) {
        var tagName = element.tagName;
        var elementSrc = element.dataset[srcDataAttribute];
        if (tagName === "IMG") {
            setSourcesForPicture(element, srcsetDataAttribute);
            var imgSrcset = element.dataset[srcsetDataAttribute];
            if (imgSrcset) {
                element.setAttribute("srcset", imgSrcset);
            }
            if (elementSrc) {
                element.setAttribute("src", elementSrc);
            }
            return;
        }
        if (tagName === "IFRAME") {
            if (elementSrc) {
                element.setAttribute("src", elementSrc);
            }
            return;
        }
        if (elementSrc) {
            element.style.backgroundImage = "url(" + elementSrc + ")";
        }
    };

    /*
     * Constructor
     */

    var LazyLoad = function LazyLoad(instanceSettings) {
        this._settings = _extends({}, defaultSettings, instanceSettings);
        this._queryOriginNode = this._settings.container === window ? document : this._settings.container;

        this._previousLoopTime = 0;
        this._loopTimeout = null;
        this._boundHandleScroll = this.handleScroll.bind(this);

        this._isFirstLoop = true;
        window.addEventListener("resize", this._boundHandleScroll);
        this.update();
    };

    LazyLoad.prototype = {

        /*
         * Private methods
         */

        _reveal: function _reveal(element) {
            var settings = this._settings;

            var errorCallback = function errorCallback() {
                /* As this method is asynchronous, it must be protected against external destroy() calls */
                if (!settings) {
                    return;
                }
                element.removeEventListener("load", loadCallback);
                element.removeEventListener("error", errorCallback);
                element.classList.remove(settings.class_loading);
                element.classList.add(settings.class_error);
                callCallback(settings.callback_error, element);
            };

            var loadCallback = function loadCallback() {
                /* As this method is asynchronous, it must be protected against external destroy() calls */
                if (!settings) {
                    return;
                }
                element.classList.remove(settings.class_loading);
                element.classList.add(settings.class_loaded);
                element.removeEventListener("load", loadCallback);
                element.removeEventListener("error", errorCallback);
                /* Calling LOAD callback */
                callCallback(settings.callback_load, element);
            };

            if (element.tagName === "IMG" || element.tagName === "IFRAME") {
                element.addEventListener("load", loadCallback);
                element.addEventListener("error", errorCallback);
                element.classList.add(settings.class_loading);
            }

            setSources(element, settings.data_srcset, settings.data_src);
            /* Calling SET callback */
            callCallback(settings.callback_set, element);
        },

        _loopThroughElements: function _loopThroughElements() {
            var settings = this._settings,
                elements = this._elements,
                elementsLength = !elements ? 0 : elements.length;
            var i = void 0,
                processedIndexes = [],
                firstLoop = this._isFirstLoop;

            for (i = 0; i < elementsLength; i++) {
                var element = elements[i];
                /* If must skip_invisible and element is invisible, skip it */
                if (settings.skip_invisible && element.offsetParent === null) {
                    continue;
                }

                if (isBot || isInsideViewport(element, settings.container, settings.threshold)) {
                    if (firstLoop) {
                        element.classList.add(settings.class_initial);
                    }
                    /* Start loading the image */
                    this._reveal(element);
                    /* Marking the element as processed. */
                    processedIndexes.push(i);
                    element.dataset.wasProcessed = true;
                }
            }
            /* Removing processed elements from this._elements. */
            while (processedIndexes.length > 0) {
                elements.splice(processedIndexes.pop(), 1);
                /* Calling the end loop callback */
                callCallback(settings.callback_processed, elements.length);
            }
            /* Stop listening to scroll event when 0 elements remains */
            if (elementsLength === 0) {
                this._stopScrollHandler();
            }
            /* Sets isFirstLoop to false */
            if (firstLoop) {
                this._isFirstLoop = false;
            }
        },

        _purgeElements: function _purgeElements() {
            var elements = this._elements,
                elementsLength = elements.length;
            var i = void 0,
                elementsToPurge = [];

            for (i = 0; i < elementsLength; i++) {
                var element = elements[i];
                /* If the element has already been processed, skip it */
                if (element.dataset.wasProcessed) {
                    elementsToPurge.push(i);
                }
            }
            /* Removing elements to purge from this._elements. */
            while (elementsToPurge.length > 0) {
                elements.splice(elementsToPurge.pop(), 1);
            }
        },

        _startScrollHandler: function _startScrollHandler() {
            if (!this._isHandlingScroll) {
                this._isHandlingScroll = true;
                this._settings.container.addEventListener("scroll", this._boundHandleScroll);
            }
        },

        _stopScrollHandler: function _stopScrollHandler() {
            if (this._isHandlingScroll) {
                this._isHandlingScroll = false;
                this._settings.container.removeEventListener("scroll", this._boundHandleScroll);
            }
        },

        /* 
         * Public methods
         */

        handleScroll: function handleScroll() {
            var _this = this;

            var throttle = this._settings.throttle;

            if (throttle !== 0) {
                (function () {
                    var getTime = function getTime() {
                        new Date().getTime();
                    };
                    var now = getTime();
                    var remainingTime = throttle - (now - _this._previousLoopTime);
                    if (remainingTime <= 0 || remainingTime > throttle) {
                        if (_this._loopTimeout) {
                            clearTimeout(_this._loopTimeout);
                            _this._loopTimeout = null;
                        }
                        _this._previousLoopTime = now;
                        _this._loopThroughElements();
                    } else if (!_this._loopTimeout) {
                        _this._loopTimeout = setTimeout(function () {
                            this._previousLoopTime = getTime();
                            this._loopTimeout = null;
                            this._loopThroughElements();
                        }.bind(_this), remainingTime);
                    }
                })();
            } else {
                this._loopThroughElements();
            }
        },

        update: function update() {
            // Converts to array the nodeset obtained querying the DOM from _queryOriginNode with elements_selector
            this._elements = Array.prototype.slice.call(this._queryOriginNode.querySelectorAll(this._settings.elements_selector));
            this._purgeElements();
            this._loopThroughElements();
            this._startScrollHandler();
        },

        destroy: function destroy() {
            window.removeEventListener("resize", this._boundHandleScroll);
            if (this._loopTimeout) {
                clearTimeout(this._loopTimeout);
                this._loopTimeout = null;
            }
            this._stopScrollHandler();
            this._elements = null;
            this._queryOriginNode = null;
            this._settings = null;
        }
    };

    /* Automatic instances creation if required (useful for async script loading!) */
    var autoInitOptions = window.lazyLoadOptions;
    if (autoInitOptions) {
        autoInitialize(LazyLoad, autoInitOptions);
    }

    return LazyLoad;
});
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * Flickity PACKAGED v2.0.5
 * Touch, responsive, flickable carousels
 *
 * Licensed GPLv3 for open source use
 * or Flickity Commercial License for commercial use
 *
 * http://flickity.metafizzy.co
 * Copyright 2016 Metafizzy
 */

!function (t, e) {
  "function" == typeof define && define.amd ? define("jquery-bridget/jquery-bridget", ["jquery"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("jquery")) : t.jQueryBridget = e(t, t.jQuery);
}(window, function (t, e) {
  "use strict";
  function i(i, o, a) {
    function l(t, e, n) {
      var s,
          o = "$()." + i + '("' + e + '")';return t.each(function (t, l) {
        var h = a.data(l, i);if (!h) return void r(i + " not initialized. Cannot call methods, i.e. " + o);var c = h[e];if (!c || "_" == e.charAt(0)) return void r(o + " is not a valid method");var d = c.apply(h, n);s = void 0 === s ? d : s;
      }), void 0 !== s ? s : t;
    }function h(t, e) {
      t.each(function (t, n) {
        var s = a.data(n, i);s ? (s.option(e), s._init()) : (s = new o(n, e), a.data(n, i, s));
      });
    }a = a || e || t.jQuery, a && (o.prototype.option || (o.prototype.option = function (t) {
      a.isPlainObject(t) && (this.options = a.extend(!0, this.options, t));
    }), a.fn[i] = function (t) {
      if ("string" == typeof t) {
        var e = s.call(arguments, 1);return l(this, t, e);
      }return h(this, t), this;
    }, n(a));
  }function n(t) {
    !t || t && t.bridget || (t.bridget = i);
  }var s = Array.prototype.slice,
      o = t.console,
      r = "undefined" == typeof o ? function () {} : function (t) {
    o.error(t);
  };return n(e || t.jQuery), i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("ev-emitter/ev-emitter", e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : t.EvEmitter = e();
}("undefined" != typeof window ? window : undefined, function () {
  function t() {}var e = t.prototype;return e.on = function (t, e) {
    if (t && e) {
      var i = this._events = this._events || {},
          n = i[t] = i[t] || [];return n.indexOf(e) == -1 && n.push(e), this;
    }
  }, e.once = function (t, e) {
    if (t && e) {
      this.on(t, e);var i = this._onceEvents = this._onceEvents || {},
          n = i[t] = i[t] || {};return n[e] = !0, this;
    }
  }, e.off = function (t, e) {
    var i = this._events && this._events[t];if (i && i.length) {
      var n = i.indexOf(e);return n != -1 && i.splice(n, 1), this;
    }
  }, e.emitEvent = function (t, e) {
    var i = this._events && this._events[t];if (i && i.length) {
      var n = 0,
          s = i[n];e = e || [];for (var o = this._onceEvents && this._onceEvents[t]; s;) {
        var r = o && o[s];r && (this.off(t, s), delete o[s]), s.apply(this, e), n += r ? 0 : 1, s = i[n];
      }return this;
    }
  }, t;
}), function (t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("get-size/get-size", [], function () {
    return e();
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : t.getSize = e();
}(window, function () {
  "use strict";
  function t(t) {
    var e = parseFloat(t),
        i = t.indexOf("%") == -1 && !isNaN(e);return i && e;
  }function e() {}function i() {
    for (var t = { width: 0, height: 0, innerWidth: 0, innerHeight: 0, outerWidth: 0, outerHeight: 0 }, e = 0; e < h; e++) {
      var i = l[e];t[i] = 0;
    }return t;
  }function n(t) {
    var e = getComputedStyle(t);return e || a("Style returned " + e + ". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"), e;
  }function s() {
    if (!c) {
      c = !0;var e = document.createElement("div");e.style.width = "200px", e.style.padding = "1px 2px 3px 4px", e.style.borderStyle = "solid", e.style.borderWidth = "1px 2px 3px 4px", e.style.boxSizing = "border-box";var i = document.body || document.documentElement;i.appendChild(e);var s = n(e);o.isBoxSizeOuter = r = 200 == t(s.width), i.removeChild(e);
    }
  }function o(e) {
    if (s(), "string" == typeof e && (e = document.querySelector(e)), e && "object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) && e.nodeType) {
      var o = n(e);if ("none" == o.display) return i();var a = {};a.width = e.offsetWidth, a.height = e.offsetHeight;for (var c = a.isBorderBox = "border-box" == o.boxSizing, d = 0; d < h; d++) {
        var u = l[d],
            f = o[u],
            p = parseFloat(f);a[u] = isNaN(p) ? 0 : p;
      }var v = a.paddingLeft + a.paddingRight,
          g = a.paddingTop + a.paddingBottom,
          m = a.marginLeft + a.marginRight,
          y = a.marginTop + a.marginBottom,
          S = a.borderLeftWidth + a.borderRightWidth,
          E = a.borderTopWidth + a.borderBottomWidth,
          b = c && r,
          x = t(o.width);x !== !1 && (a.width = x + (b ? 0 : v + S));var C = t(o.height);return C !== !1 && (a.height = C + (b ? 0 : g + E)), a.innerWidth = a.width - (v + S), a.innerHeight = a.height - (g + E), a.outerWidth = a.width + m, a.outerHeight = a.height + y, a;
    }
  }var r,
      a = "undefined" == typeof console ? e : function (t) {
    console.error(t);
  },
      l = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"],
      h = l.length,
      c = !1;return o;
}), function (t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("desandro-matches-selector/matches-selector", e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : t.matchesSelector = e();
}(window, function () {
  "use strict";
  var t = function () {
    var t = Element.prototype;if (t.matches) return "matches";if (t.matchesSelector) return "matchesSelector";for (var e = ["webkit", "moz", "ms", "o"], i = 0; i < e.length; i++) {
      var n = e[i],
          s = n + "MatchesSelector";if (t[s]) return s;
    }
  }();return function (e, i) {
    return e[t](i);
  };
}), function (t, e) {
  "function" == typeof define && define.amd ? define("fizzy-ui-utils/utils", ["desandro-matches-selector/matches-selector"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("desandro-matches-selector")) : t.fizzyUIUtils = e(t, t.matchesSelector);
}(window, function (t, e) {
  var i = {};i.extend = function (t, e) {
    for (var i in e) {
      t[i] = e[i];
    }return t;
  }, i.modulo = function (t, e) {
    return (t % e + e) % e;
  }, i.makeArray = function (t) {
    var e = [];if (Array.isArray(t)) e = t;else if (t && "number" == typeof t.length) for (var i = 0; i < t.length; i++) {
      e.push(t[i]);
    } else e.push(t);return e;
  }, i.removeFrom = function (t, e) {
    var i = t.indexOf(e);i != -1 && t.splice(i, 1);
  }, i.getParent = function (t, i) {
    for (; t != document.body;) {
      if (t = t.parentNode, e(t, i)) return t;
    }
  }, i.getQueryElement = function (t) {
    return "string" == typeof t ? document.querySelector(t) : t;
  }, i.handleEvent = function (t) {
    var e = "on" + t.type;this[e] && this[e](t);
  }, i.filterFindElements = function (t, n) {
    t = i.makeArray(t);var s = [];return t.forEach(function (t) {
      if (t instanceof HTMLElement) {
        if (!n) return void s.push(t);e(t, n) && s.push(t);for (var i = t.querySelectorAll(n), o = 0; o < i.length; o++) {
          s.push(i[o]);
        }
      }
    }), s;
  }, i.debounceMethod = function (t, e, i) {
    var n = t.prototype[e],
        s = e + "Timeout";t.prototype[e] = function () {
      var t = this[s];t && clearTimeout(t);var e = arguments,
          o = this;this[s] = setTimeout(function () {
        n.apply(o, e), delete o[s];
      }, i || 100);
    };
  }, i.docReady = function (t) {
    var e = document.readyState;"complete" == e || "interactive" == e ? setTimeout(t) : document.addEventListener("DOMContentLoaded", t);
  }, i.toDashed = function (t) {
    return t.replace(/(.)([A-Z])/g, function (t, e, i) {
      return e + "-" + i;
    }).toLowerCase();
  };var n = t.console;return i.htmlInit = function (e, s) {
    i.docReady(function () {
      var o = i.toDashed(s),
          r = "data-" + o,
          a = document.querySelectorAll("[" + r + "]"),
          l = document.querySelectorAll(".js-" + o),
          h = i.makeArray(a).concat(i.makeArray(l)),
          c = r + "-options",
          d = t.jQuery;h.forEach(function (t) {
        var i,
            o = t.getAttribute(r) || t.getAttribute(c);try {
          i = o && JSON.parse(o);
        } catch (a) {
          return void (n && n.error("Error parsing " + r + " on " + t.className + ": " + a));
        }var l = new e(t, i);d && d.data(t, s, l);
      });
    });
  }, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/cell", ["get-size/get-size"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("get-size")) : (t.Flickity = t.Flickity || {}, t.Flickity.Cell = e(t, t.getSize));
}(window, function (t, e) {
  function i(t, e) {
    this.element = t, this.parent = e, this.create();
  }var n = i.prototype;return n.create = function () {
    this.element.style.position = "absolute", this.x = 0, this.shift = 0;
  }, n.destroy = function () {
    this.element.style.position = "";var t = this.parent.originSide;this.element.style[t] = "";
  }, n.getSize = function () {
    this.size = e(this.element);
  }, n.setPosition = function (t) {
    this.x = t, this.updateTarget(), this.renderPosition(t);
  }, n.updateTarget = n.setDefaultTarget = function () {
    var t = "left" == this.parent.originSide ? "marginLeft" : "marginRight";this.target = this.x + this.size[t] + this.size.width * this.parent.cellAlign;
  }, n.renderPosition = function (t) {
    var e = this.parent.originSide;this.element.style[e] = this.parent.getPositionValue(t);
  }, n.wrapShift = function (t) {
    this.shift = t, this.renderPosition(this.x + this.parent.slideableWidth * t);
  }, n.remove = function () {
    this.element.parentNode.removeChild(this.element);
  }, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/slide", e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : (t.Flickity = t.Flickity || {}, t.Flickity.Slide = e());
}(window, function () {
  "use strict";
  function t(t) {
    this.parent = t, this.isOriginLeft = "left" == t.originSide, this.cells = [], this.outerWidth = 0, this.height = 0;
  }var e = t.prototype;return e.addCell = function (t) {
    if (this.cells.push(t), this.outerWidth += t.size.outerWidth, this.height = Math.max(t.size.outerHeight, this.height), 1 == this.cells.length) {
      this.x = t.x;var e = this.isOriginLeft ? "marginLeft" : "marginRight";this.firstMargin = t.size[e];
    }
  }, e.updateTarget = function () {
    var t = this.isOriginLeft ? "marginRight" : "marginLeft",
        e = this.getLastCell(),
        i = e ? e.size[t] : 0,
        n = this.outerWidth - (this.firstMargin + i);this.target = this.x + this.firstMargin + n * this.parent.cellAlign;
  }, e.getLastCell = function () {
    return this.cells[this.cells.length - 1];
  }, e.select = function () {
    this.changeSelectedClass("add");
  }, e.unselect = function () {
    this.changeSelectedClass("remove");
  }, e.changeSelectedClass = function (t) {
    this.cells.forEach(function (e) {
      e.element.classList[t]("is-selected");
    });
  }, e.getCellElements = function () {
    return this.cells.map(function (t) {
      return t.element;
    });
  }, t;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/animate", ["fizzy-ui-utils/utils"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("fizzy-ui-utils")) : (t.Flickity = t.Flickity || {}, t.Flickity.animatePrototype = e(t, t.fizzyUIUtils));
}(window, function (t, e) {
  var i = t.requestAnimationFrame || t.webkitRequestAnimationFrame,
      n = 0;i || (i = function i(t) {
    var e = new Date().getTime(),
        i = Math.max(0, 16 - (e - n)),
        s = setTimeout(t, i);return n = e + i, s;
  });var s = {};s.startAnimation = function () {
    this.isAnimating || (this.isAnimating = !0, this.restingFrames = 0, this.animate());
  }, s.animate = function () {
    this.applyDragForce(), this.applySelectedAttraction();var t = this.x;if (this.integratePhysics(), this.positionSlider(), this.settle(t), this.isAnimating) {
      var e = this;i(function () {
        e.animate();
      });
    }
  };var o = function () {
    var t = document.documentElement.style;return "string" == typeof t.transform ? "transform" : "WebkitTransform";
  }();return s.positionSlider = function () {
    var t = this.x;this.options.wrapAround && this.cells.length > 1 && (t = e.modulo(t, this.slideableWidth), t -= this.slideableWidth, this.shiftWrapCells(t)), t += this.cursorPosition, t = this.options.rightToLeft && o ? -t : t;var i = this.getPositionValue(t);this.slider.style[o] = this.isAnimating ? "translate3d(" + i + ",0,0)" : "translateX(" + i + ")";var n = this.slides[0];if (n) {
      var s = -this.x - n.target,
          r = s / this.slidesWidth;this.dispatchEvent("scroll", null, [r, s]);
    }
  }, s.positionSliderAtSelected = function () {
    this.cells.length && (this.x = -this.selectedSlide.target, this.positionSlider());
  }, s.getPositionValue = function (t) {
    return this.options.percentPosition ? .01 * Math.round(t / this.size.innerWidth * 1e4) + "%" : Math.round(t) + "px";
  }, s.settle = function (t) {
    this.isPointerDown || Math.round(100 * this.x) != Math.round(100 * t) || this.restingFrames++, this.restingFrames > 2 && (this.isAnimating = !1, delete this.isFreeScrolling, this.positionSlider(), this.dispatchEvent("settle"));
  }, s.shiftWrapCells = function (t) {
    var e = this.cursorPosition + t;this._shiftCells(this.beforeShiftCells, e, -1);var i = this.size.innerWidth - (t + this.slideableWidth + this.cursorPosition);this._shiftCells(this.afterShiftCells, i, 1);
  }, s._shiftCells = function (t, e, i) {
    for (var n = 0; n < t.length; n++) {
      var s = t[n],
          o = e > 0 ? i : 0;s.wrapShift(o), e -= s.size.outerWidth;
    }
  }, s._unshiftCells = function (t) {
    if (t && t.length) for (var e = 0; e < t.length; e++) {
      t[e].wrapShift(0);
    }
  }, s.integratePhysics = function () {
    this.x += this.velocity, this.velocity *= this.getFrictionFactor();
  }, s.applyForce = function (t) {
    this.velocity += t;
  }, s.getFrictionFactor = function () {
    return 1 - this.options[this.isFreeScrolling ? "freeScrollFriction" : "friction"];
  }, s.getRestingPosition = function () {
    return this.x + this.velocity / (1 - this.getFrictionFactor());
  }, s.applyDragForce = function () {
    if (this.isPointerDown) {
      var t = this.dragX - this.x,
          e = t - this.velocity;this.applyForce(e);
    }
  }, s.applySelectedAttraction = function () {
    if (!this.isPointerDown && !this.isFreeScrolling && this.cells.length) {
      var t = this.selectedSlide.target * -1 - this.x,
          e = t * this.options.selectedAttraction;this.applyForce(e);
    }
  }, s;
}), function (t, e) {
  if ("function" == typeof define && define.amd) define("flickity/js/flickity", ["ev-emitter/ev-emitter", "get-size/get-size", "fizzy-ui-utils/utils", "./cell", "./slide", "./animate"], function (i, n, s, o, r, a) {
    return e(t, i, n, s, o, r, a);
  });else if ("object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports) module.exports = e(t, require("ev-emitter"), require("get-size"), require("fizzy-ui-utils"), require("./cell"), require("./slide"), require("./animate"));else {
    var i = t.Flickity;t.Flickity = e(t, t.EvEmitter, t.getSize, t.fizzyUIUtils, i.Cell, i.Slide, i.animatePrototype);
  }
}(window, function (t, e, i, n, s, o, r) {
  function a(t, e) {
    for (t = n.makeArray(t); t.length;) {
      e.appendChild(t.shift());
    }
  }function l(t, e) {
    var i = n.getQueryElement(t);if (!i) return void (d && d.error("Bad element for Flickity: " + (i || t)));if (this.element = i, this.element.flickityGUID) {
      var s = f[this.element.flickityGUID];return s.option(e), s;
    }h && (this.$element = h(this.element)), this.options = n.extend({}, this.constructor.defaults), this.option(e), this._create();
  }var h = t.jQuery,
      c = t.getComputedStyle,
      d = t.console,
      u = 0,
      f = {};l.defaults = { accessibility: !0, cellAlign: "center", freeScrollFriction: .075, friction: .28, namespaceJQueryEvents: !0, percentPosition: !0, resize: !0, selectedAttraction: .025, setGallerySize: !0 }, l.createMethods = [];var p = l.prototype;n.extend(p, e.prototype), p._create = function () {
    var e = this.guid = ++u;this.element.flickityGUID = e, f[e] = this, this.selectedIndex = 0, this.restingFrames = 0, this.x = 0, this.velocity = 0, this.originSide = this.options.rightToLeft ? "right" : "left", this.viewport = document.createElement("div"), this.viewport.className = "flickity-viewport", this._createSlider(), (this.options.resize || this.options.watchCSS) && t.addEventListener("resize", this), l.createMethods.forEach(function (t) {
      this[t]();
    }, this), this.options.watchCSS ? this.watchCSS() : this.activate();
  }, p.option = function (t) {
    n.extend(this.options, t);
  }, p.activate = function () {
    if (!this.isActive) {
      this.isActive = !0, this.element.classList.add("flickity-enabled"), this.options.rightToLeft && this.element.classList.add("flickity-rtl"), this.getSize();var t = this._filterFindCellElements(this.element.children);a(t, this.slider), this.viewport.appendChild(this.slider), this.element.appendChild(this.viewport), this.reloadCells(), this.options.accessibility && (this.element.tabIndex = 0, this.element.addEventListener("keydown", this)), this.emitEvent("activate");var e,
          i = this.options.initialIndex;e = this.isInitActivated ? this.selectedIndex : void 0 !== i && this.cells[i] ? i : 0, this.select(e, !1, !0), this.isInitActivated = !0;
    }
  }, p._createSlider = function () {
    var t = document.createElement("div");t.className = "flickity-slider", t.style[this.originSide] = 0, this.slider = t;
  }, p._filterFindCellElements = function (t) {
    return n.filterFindElements(t, this.options.cellSelector);
  }, p.reloadCells = function () {
    this.cells = this._makeCells(this.slider.children), this.positionCells(), this._getWrapShiftCells(), this.setGallerySize();
  }, p._makeCells = function (t) {
    var e = this._filterFindCellElements(t),
        i = e.map(function (t) {
      return new s(t, this);
    }, this);return i;
  }, p.getLastCell = function () {
    return this.cells[this.cells.length - 1];
  }, p.getLastSlide = function () {
    return this.slides[this.slides.length - 1];
  }, p.positionCells = function () {
    this._sizeCells(this.cells), this._positionCells(0);
  }, p._positionCells = function (t) {
    t = t || 0, this.maxCellHeight = t ? this.maxCellHeight || 0 : 0;var e = 0;if (t > 0) {
      var i = this.cells[t - 1];e = i.x + i.size.outerWidth;
    }for (var n = this.cells.length, s = t; s < n; s++) {
      var o = this.cells[s];o.setPosition(e), e += o.size.outerWidth, this.maxCellHeight = Math.max(o.size.outerHeight, this.maxCellHeight);
    }this.slideableWidth = e, this.updateSlides(), this._containSlides(), this.slidesWidth = n ? this.getLastSlide().target - this.slides[0].target : 0;
  }, p._sizeCells = function (t) {
    t.forEach(function (t) {
      t.getSize();
    });
  }, p.updateSlides = function () {
    if (this.slides = [], this.cells.length) {
      var t = new o(this);this.slides.push(t);var e = "left" == this.originSide,
          i = e ? "marginRight" : "marginLeft",
          n = this._getCanCellFit();this.cells.forEach(function (e, s) {
        if (!t.cells.length) return void t.addCell(e);var r = t.outerWidth - t.firstMargin + (e.size.outerWidth - e.size[i]);n.call(this, s, r) ? t.addCell(e) : (t.updateTarget(), t = new o(this), this.slides.push(t), t.addCell(e));
      }, this), t.updateTarget(), this.updateSelectedSlide();
    }
  }, p._getCanCellFit = function () {
    var t = this.options.groupCells;if (!t) return function () {
      return !1;
    };if ("number" == typeof t) {
      var e = parseInt(t, 10);return function (t) {
        return t % e !== 0;
      };
    }var i = "string" == typeof t && t.match(/^(\d+)%$/),
        n = i ? parseInt(i[1], 10) / 100 : 1;return function (t, e) {
      return e <= (this.size.innerWidth + 1) * n;
    };
  }, p._init = p.reposition = function () {
    this.positionCells(), this.positionSliderAtSelected();
  }, p.getSize = function () {
    this.size = i(this.element), this.setCellAlign(), this.cursorPosition = this.size.innerWidth * this.cellAlign;
  };var v = { center: { left: .5, right: .5 }, left: { left: 0, right: 1 }, right: { right: 0, left: 1 } };return p.setCellAlign = function () {
    var t = v[this.options.cellAlign];this.cellAlign = t ? t[this.originSide] : this.options.cellAlign;
  }, p.setGallerySize = function () {
    if (this.options.setGallerySize) {
      var t = this.options.adaptiveHeight && this.selectedSlide ? this.selectedSlide.height : this.maxCellHeight;this.viewport.style.height = t + "px";
    }
  }, p._getWrapShiftCells = function () {
    if (this.options.wrapAround) {
      this._unshiftCells(this.beforeShiftCells), this._unshiftCells(this.afterShiftCells);var t = this.cursorPosition,
          e = this.cells.length - 1;this.beforeShiftCells = this._getGapCells(t, e, -1), t = this.size.innerWidth - this.cursorPosition, this.afterShiftCells = this._getGapCells(t, 0, 1);
    }
  }, p._getGapCells = function (t, e, i) {
    for (var n = []; t > 0;) {
      var s = this.cells[e];if (!s) break;n.push(s), e += i, t -= s.size.outerWidth;
    }return n;
  }, p._containSlides = function () {
    if (this.options.contain && !this.options.wrapAround && this.cells.length) {
      var t = this.options.rightToLeft,
          e = t ? "marginRight" : "marginLeft",
          i = t ? "marginLeft" : "marginRight",
          n = this.slideableWidth - this.getLastCell().size[i],
          s = n < this.size.innerWidth,
          o = this.cursorPosition + this.cells[0].size[e],
          r = n - this.size.innerWidth * (1 - this.cellAlign);this.slides.forEach(function (t) {
        s ? t.target = n * this.cellAlign : (t.target = Math.max(t.target, o), t.target = Math.min(t.target, r));
      }, this);
    }
  }, p.dispatchEvent = function (t, e, i) {
    var n = e ? [e].concat(i) : i;if (this.emitEvent(t, n), h && this.$element) {
      t += this.options.namespaceJQueryEvents ? ".flickity" : "";var s = t;if (e) {
        var o = h.Event(e);o.type = t, s = o;
      }this.$element.trigger(s, i);
    }
  }, p.select = function (t, e, i) {
    this.isActive && (t = parseInt(t, 10), this._wrapSelect(t), (this.options.wrapAround || e) && (t = n.modulo(t, this.slides.length)), this.slides[t] && (this.selectedIndex = t, this.updateSelectedSlide(), i ? this.positionSliderAtSelected() : this.startAnimation(), this.options.adaptiveHeight && this.setGallerySize(), this.dispatchEvent("select"), this.dispatchEvent("cellSelect")));
  }, p._wrapSelect = function (t) {
    var e = this.slides.length,
        i = this.options.wrapAround && e > 1;if (!i) return t;var s = n.modulo(t, e),
        o = Math.abs(s - this.selectedIndex),
        r = Math.abs(s + e - this.selectedIndex),
        a = Math.abs(s - e - this.selectedIndex);!this.isDragSelect && r < o ? t += e : !this.isDragSelect && a < o && (t -= e), t < 0 ? this.x -= this.slideableWidth : t >= e && (this.x += this.slideableWidth);
  }, p.previous = function (t, e) {
    this.select(this.selectedIndex - 1, t, e);
  }, p.next = function (t, e) {
    this.select(this.selectedIndex + 1, t, e);
  }, p.updateSelectedSlide = function () {
    var t = this.slides[this.selectedIndex];t && (this.unselectSelectedSlide(), this.selectedSlide = t, t.select(), this.selectedCells = t.cells, this.selectedElements = t.getCellElements(), this.selectedCell = t.cells[0], this.selectedElement = this.selectedElements[0]);
  }, p.unselectSelectedSlide = function () {
    this.selectedSlide && this.selectedSlide.unselect();
  }, p.selectCell = function (t, e, i) {
    var n;"number" == typeof t ? n = this.cells[t] : ("string" == typeof t && (t = this.element.querySelector(t)), n = this.getCell(t));for (var s = 0; n && s < this.slides.length; s++) {
      var o = this.slides[s],
          r = o.cells.indexOf(n);if (r != -1) return void this.select(s, e, i);
    }
  }, p.getCell = function (t) {
    for (var e = 0; e < this.cells.length; e++) {
      var i = this.cells[e];if (i.element == t) return i;
    }
  }, p.getCells = function (t) {
    t = n.makeArray(t);var e = [];return t.forEach(function (t) {
      var i = this.getCell(t);i && e.push(i);
    }, this), e;
  }, p.getCellElements = function () {
    return this.cells.map(function (t) {
      return t.element;
    });
  }, p.getParentCell = function (t) {
    var e = this.getCell(t);return e ? e : (t = n.getParent(t, ".flickity-slider > *"), this.getCell(t));
  }, p.getAdjacentCellElements = function (t, e) {
    if (!t) return this.selectedSlide.getCellElements();e = void 0 === e ? this.selectedIndex : e;var i = this.slides.length;if (1 + 2 * t >= i) return this.getCellElements();for (var s = [], o = e - t; o <= e + t; o++) {
      var r = this.options.wrapAround ? n.modulo(o, i) : o,
          a = this.slides[r];a && (s = s.concat(a.getCellElements()));
    }return s;
  }, p.uiChange = function () {
    this.emitEvent("uiChange");
  }, p.childUIPointerDown = function (t) {
    this.emitEvent("childUIPointerDown", [t]);
  }, p.onresize = function () {
    this.watchCSS(), this.resize();
  }, n.debounceMethod(l, "onresize", 150), p.resize = function () {
    if (this.isActive) {
      this.getSize(), this.options.wrapAround && (this.x = n.modulo(this.x, this.slideableWidth)), this.positionCells(), this._getWrapShiftCells(), this.setGallerySize(), this.emitEvent("resize");var t = this.selectedElements && this.selectedElements[0];this.selectCell(t, !1, !0);
    }
  }, p.watchCSS = function () {
    var t = this.options.watchCSS;if (t) {
      var e = c(this.element, ":after").content;e.indexOf("flickity") != -1 ? this.activate() : this.deactivate();
    }
  }, p.onkeydown = function (t) {
    if (this.options.accessibility && (!document.activeElement || document.activeElement == this.element)) if (37 == t.keyCode) {
      var e = this.options.rightToLeft ? "next" : "previous";this.uiChange(), this[e]();
    } else if (39 == t.keyCode) {
      var i = this.options.rightToLeft ? "previous" : "next";this.uiChange(), this[i]();
    }
  }, p.deactivate = function () {
    this.isActive && (this.element.classList.remove("flickity-enabled"), this.element.classList.remove("flickity-rtl"), this.cells.forEach(function (t) {
      t.destroy();
    }), this.unselectSelectedSlide(), this.element.removeChild(this.viewport), a(this.slider.children, this.element), this.options.accessibility && (this.element.removeAttribute("tabIndex"), this.element.removeEventListener("keydown", this)), this.isActive = !1, this.emitEvent("deactivate"));
  }, p.destroy = function () {
    this.deactivate(), t.removeEventListener("resize", this), this.emitEvent("destroy"), h && this.$element && h.removeData(this.element, "flickity"), delete this.element.flickityGUID, delete f[this.guid];
  }, n.extend(p, r), l.data = function (t) {
    t = n.getQueryElement(t);var e = t && t.flickityGUID;return e && f[e];
  }, n.htmlInit(l, "flickity"), h && h.bridget && h.bridget("flickity", l), l.Cell = s, l;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("unipointer/unipointer", ["ev-emitter/ev-emitter"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("ev-emitter")) : t.Unipointer = e(t, t.EvEmitter);
}(window, function (t, e) {
  function i() {}function n() {}var s = n.prototype = Object.create(e.prototype);s.bindStartEvent = function (t) {
    this._bindStartEvent(t, !0);
  }, s.unbindStartEvent = function (t) {
    this._bindStartEvent(t, !1);
  }, s._bindStartEvent = function (e, i) {
    i = void 0 === i || !!i;var n = i ? "addEventListener" : "removeEventListener";t.navigator.pointerEnabled ? e[n]("pointerdown", this) : t.navigator.msPointerEnabled ? e[n]("MSPointerDown", this) : (e[n]("mousedown", this), e[n]("touchstart", this));
  }, s.handleEvent = function (t) {
    var e = "on" + t.type;this[e] && this[e](t);
  }, s.getTouch = function (t) {
    for (var e = 0; e < t.length; e++) {
      var i = t[e];if (i.identifier == this.pointerIdentifier) return i;
    }
  }, s.onmousedown = function (t) {
    var e = t.button;e && 0 !== e && 1 !== e || this._pointerDown(t, t);
  }, s.ontouchstart = function (t) {
    this._pointerDown(t, t.changedTouches[0]);
  }, s.onMSPointerDown = s.onpointerdown = function (t) {
    this._pointerDown(t, t);
  }, s._pointerDown = function (t, e) {
    this.isPointerDown || (this.isPointerDown = !0, this.pointerIdentifier = void 0 !== e.pointerId ? e.pointerId : e.identifier, this.pointerDown(t, e));
  }, s.pointerDown = function (t, e) {
    this._bindPostStartEvents(t), this.emitEvent("pointerDown", [t, e]);
  };var o = { mousedown: ["mousemove", "mouseup"], touchstart: ["touchmove", "touchend", "touchcancel"], pointerdown: ["pointermove", "pointerup", "pointercancel"], MSPointerDown: ["MSPointerMove", "MSPointerUp", "MSPointerCancel"] };return s._bindPostStartEvents = function (e) {
    if (e) {
      var i = o[e.type];i.forEach(function (e) {
        t.addEventListener(e, this);
      }, this), this._boundPointerEvents = i;
    }
  }, s._unbindPostStartEvents = function () {
    this._boundPointerEvents && (this._boundPointerEvents.forEach(function (e) {
      t.removeEventListener(e, this);
    }, this), delete this._boundPointerEvents);
  }, s.onmousemove = function (t) {
    this._pointerMove(t, t);
  }, s.onMSPointerMove = s.onpointermove = function (t) {
    t.pointerId == this.pointerIdentifier && this._pointerMove(t, t);
  }, s.ontouchmove = function (t) {
    var e = this.getTouch(t.changedTouches);e && this._pointerMove(t, e);
  }, s._pointerMove = function (t, e) {
    this.pointerMove(t, e);
  }, s.pointerMove = function (t, e) {
    this.emitEvent("pointerMove", [t, e]);
  }, s.onmouseup = function (t) {
    this._pointerUp(t, t);
  }, s.onMSPointerUp = s.onpointerup = function (t) {
    t.pointerId == this.pointerIdentifier && this._pointerUp(t, t);
  }, s.ontouchend = function (t) {
    var e = this.getTouch(t.changedTouches);e && this._pointerUp(t, e);
  }, s._pointerUp = function (t, e) {
    this._pointerDone(), this.pointerUp(t, e);
  }, s.pointerUp = function (t, e) {
    this.emitEvent("pointerUp", [t, e]);
  }, s._pointerDone = function () {
    this.isPointerDown = !1, delete this.pointerIdentifier, this._unbindPostStartEvents(), this.pointerDone();
  }, s.pointerDone = i, s.onMSPointerCancel = s.onpointercancel = function (t) {
    t.pointerId == this.pointerIdentifier && this._pointerCancel(t, t);
  }, s.ontouchcancel = function (t) {
    var e = this.getTouch(t.changedTouches);e && this._pointerCancel(t, e);
  }, s._pointerCancel = function (t, e) {
    this._pointerDone(), this.pointerCancel(t, e);
  }, s.pointerCancel = function (t, e) {
    this.emitEvent("pointerCancel", [t, e]);
  }, n.getPointerPoint = function (t) {
    return { x: t.pageX, y: t.pageY };
  }, n;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("unidragger/unidragger", ["unipointer/unipointer"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("unipointer")) : t.Unidragger = e(t, t.Unipointer);
}(window, function (t, e) {
  function i() {}function n() {}var s = n.prototype = Object.create(e.prototype);s.bindHandles = function () {
    this._bindHandles(!0);
  }, s.unbindHandles = function () {
    this._bindHandles(!1);
  };var o = t.navigator;return s._bindHandles = function (t) {
    t = void 0 === t || !!t;var e;e = o.pointerEnabled ? function (e) {
      e.style.touchAction = t ? "none" : "";
    } : o.msPointerEnabled ? function (e) {
      e.style.msTouchAction = t ? "none" : "";
    } : i;for (var n = t ? "addEventListener" : "removeEventListener", s = 0; s < this.handles.length; s++) {
      var r = this.handles[s];this._bindStartEvent(r, t), e(r), r[n]("click", this);
    }
  }, s.pointerDown = function (t, e) {
    if ("INPUT" == t.target.nodeName && "range" == t.target.type) return this.isPointerDown = !1, void delete this.pointerIdentifier;this._dragPointerDown(t, e);var i = document.activeElement;i && i.blur && i.blur(), this._bindPostStartEvents(t), this.emitEvent("pointerDown", [t, e]);
  }, s._dragPointerDown = function (t, i) {
    this.pointerDownPoint = e.getPointerPoint(i);var n = this.canPreventDefaultOnPointerDown(t, i);n && t.preventDefault();
  }, s.canPreventDefaultOnPointerDown = function (t) {
    return "SELECT" != t.target.nodeName;
  }, s.pointerMove = function (t, e) {
    var i = this._dragPointerMove(t, e);this.emitEvent("pointerMove", [t, e, i]), this._dragMove(t, e, i);
  }, s._dragPointerMove = function (t, i) {
    var n = e.getPointerPoint(i),
        s = { x: n.x - this.pointerDownPoint.x, y: n.y - this.pointerDownPoint.y };return !this.isDragging && this.hasDragStarted(s) && this._dragStart(t, i), s;
  }, s.hasDragStarted = function (t) {
    return Math.abs(t.x) > 3 || Math.abs(t.y) > 3;
  }, s.pointerUp = function (t, e) {
    this.emitEvent("pointerUp", [t, e]), this._dragPointerUp(t, e);
  }, s._dragPointerUp = function (t, e) {
    this.isDragging ? this._dragEnd(t, e) : this._staticClick(t, e);
  }, s._dragStart = function (t, i) {
    this.isDragging = !0, this.dragStartPoint = e.getPointerPoint(i), this.isPreventingClicks = !0, this.dragStart(t, i);
  }, s.dragStart = function (t, e) {
    this.emitEvent("dragStart", [t, e]);
  }, s._dragMove = function (t, e, i) {
    this.isDragging && this.dragMove(t, e, i);
  }, s.dragMove = function (t, e, i) {
    t.preventDefault(), this.emitEvent("dragMove", [t, e, i]);
  }, s._dragEnd = function (t, e) {
    this.isDragging = !1, setTimeout(function () {
      delete this.isPreventingClicks;
    }.bind(this)), this.dragEnd(t, e);
  }, s.dragEnd = function (t, e) {
    this.emitEvent("dragEnd", [t, e]);
  }, s.onclick = function (t) {
    this.isPreventingClicks && t.preventDefault();
  }, s._staticClick = function (t, e) {
    if (!this.isIgnoringMouseUp || "mouseup" != t.type) {
      var i = t.target.nodeName;"INPUT" != i && "TEXTAREA" != i || t.target.focus(), this.staticClick(t, e), "mouseup" != t.type && (this.isIgnoringMouseUp = !0, setTimeout(function () {
        delete this.isIgnoringMouseUp;
      }.bind(this), 400));
    }
  }, s.staticClick = function (t, e) {
    this.emitEvent("staticClick", [t, e]);
  }, n.getPointerPoint = e.getPointerPoint, n;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/drag", ["./flickity", "unidragger/unidragger", "fizzy-ui-utils/utils"], function (i, n, s) {
    return e(t, i, n, s);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("unidragger"), require("fizzy-ui-utils")) : t.Flickity = e(t, t.Flickity, t.Unidragger, t.fizzyUIUtils);
}(window, function (t, e, i, n) {
  function s() {
    return { x: t.pageXOffset, y: t.pageYOffset };
  }n.extend(e.defaults, { draggable: !0, dragThreshold: 3 }), e.createMethods.push("_createDrag");var o = e.prototype;n.extend(o, i.prototype);var r = "createTouch" in document,
      a = !1;o._createDrag = function () {
    this.on("activate", this.bindDrag), this.on("uiChange", this._uiChangeDrag), this.on("childUIPointerDown", this._childUIPointerDownDrag), this.on("deactivate", this.unbindDrag), r && !a && (t.addEventListener("touchmove", function () {}), a = !0);
  }, o.bindDrag = function () {
    this.options.draggable && !this.isDragBound && (this.element.classList.add("is-draggable"), this.handles = [this.viewport], this.bindHandles(), this.isDragBound = !0);
  }, o.unbindDrag = function () {
    this.isDragBound && (this.element.classList.remove("is-draggable"), this.unbindHandles(), delete this.isDragBound);
  }, o._uiChangeDrag = function () {
    delete this.isFreeScrolling;
  }, o._childUIPointerDownDrag = function (t) {
    t.preventDefault(), this.pointerDownFocus(t);
  };var l = { TEXTAREA: !0, INPUT: !0, OPTION: !0 },
      h = { radio: !0, checkbox: !0, button: !0, submit: !0, image: !0, file: !0 };o.pointerDown = function (e, i) {
    var n = l[e.target.nodeName] && !h[e.target.type];if (n) return this.isPointerDown = !1, void delete this.pointerIdentifier;this._dragPointerDown(e, i);var o = document.activeElement;o && o.blur && o != this.element && o != document.body && o.blur(), this.pointerDownFocus(e), this.dragX = this.x, this.viewport.classList.add("is-pointer-down"), this._bindPostStartEvents(e), this.pointerDownScroll = s(), t.addEventListener("scroll", this), this.dispatchEvent("pointerDown", e, [i]);
  };var c = { touchstart: !0, MSPointerDown: !0 },
      d = { INPUT: !0, SELECT: !0 };return o.pointerDownFocus = function (e) {
    if (this.options.accessibility && !c[e.type] && !d[e.target.nodeName]) {
      var i = t.pageYOffset;this.element.focus(), t.pageYOffset != i && t.scrollTo(t.pageXOffset, i);
    }
  }, o.canPreventDefaultOnPointerDown = function (t) {
    var e = "touchstart" == t.type,
        i = t.target.nodeName;return !e && "SELECT" != i;
  }, o.hasDragStarted = function (t) {
    return Math.abs(t.x) > this.options.dragThreshold;
  }, o.pointerUp = function (t, e) {
    delete this.isTouchScrolling, this.viewport.classList.remove("is-pointer-down"), this.dispatchEvent("pointerUp", t, [e]), this._dragPointerUp(t, e);
  }, o.pointerDone = function () {
    t.removeEventListener("scroll", this), delete this.pointerDownScroll;
  }, o.dragStart = function (e, i) {
    this.dragStartPosition = this.x, this.startAnimation(), t.removeEventListener("scroll", this), this.dispatchEvent("dragStart", e, [i]);
  }, o.pointerMove = function (t, e) {
    var i = this._dragPointerMove(t, e);this.dispatchEvent("pointerMove", t, [e, i]), this._dragMove(t, e, i);
  }, o.dragMove = function (t, e, i) {
    t.preventDefault(), this.previousDragX = this.dragX;var n = this.options.rightToLeft ? -1 : 1,
        s = this.dragStartPosition + i.x * n;if (!this.options.wrapAround && this.slides.length) {
      var o = Math.max(-this.slides[0].target, this.dragStartPosition);s = s > o ? .5 * (s + o) : s;var r = Math.min(-this.getLastSlide().target, this.dragStartPosition);s = s < r ? .5 * (s + r) : s;
    }this.dragX = s, this.dragMoveTime = new Date(), this.dispatchEvent("dragMove", t, [e, i]);
  }, o.dragEnd = function (t, e) {
    this.options.freeScroll && (this.isFreeScrolling = !0);var i = this.dragEndRestingSelect();if (this.options.freeScroll && !this.options.wrapAround) {
      var n = this.getRestingPosition();this.isFreeScrolling = -n > this.slides[0].target && -n < this.getLastSlide().target;
    } else this.options.freeScroll || i != this.selectedIndex || (i += this.dragEndBoostSelect());delete this.previousDragX, this.isDragSelect = this.options.wrapAround, this.select(i), delete this.isDragSelect, this.dispatchEvent("dragEnd", t, [e]);
  }, o.dragEndRestingSelect = function () {
    var t = this.getRestingPosition(),
        e = Math.abs(this.getSlideDistance(-t, this.selectedIndex)),
        i = this._getClosestResting(t, e, 1),
        n = this._getClosestResting(t, e, -1),
        s = i.distance < n.distance ? i.index : n.index;return s;
  }, o._getClosestResting = function (t, e, i) {
    for (var n = this.selectedIndex, s = 1 / 0, o = this.options.contain && !this.options.wrapAround ? function (t, e) {
      return t <= e;
    } : function (t, e) {
      return t < e;
    }; o(e, s) && (n += i, s = e, e = this.getSlideDistance(-t, n), null !== e);) {
      e = Math.abs(e);
    }return { distance: s, index: n - i };
  }, o.getSlideDistance = function (t, e) {
    var i = this.slides.length,
        s = this.options.wrapAround && i > 1,
        o = s ? n.modulo(e, i) : e,
        r = this.slides[o];if (!r) return null;var a = s ? this.slideableWidth * Math.floor(e / i) : 0;return t - (r.target + a);
  }, o.dragEndBoostSelect = function () {
    if (void 0 === this.previousDragX || !this.dragMoveTime || new Date() - this.dragMoveTime > 100) return 0;var t = this.getSlideDistance(-this.dragX, this.selectedIndex),
        e = this.previousDragX - this.dragX;return t > 0 && e > 0 ? 1 : t < 0 && e < 0 ? -1 : 0;
  }, o.staticClick = function (t, e) {
    var i = this.getParentCell(t.target),
        n = i && i.element,
        s = i && this.cells.indexOf(i);this.dispatchEvent("staticClick", t, [e, n, s]);
  }, o.onscroll = function () {
    var t = s(),
        e = this.pointerDownScroll.x - t.x,
        i = this.pointerDownScroll.y - t.y;(Math.abs(e) > 3 || Math.abs(i) > 3) && this._pointerDone();
  }, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("tap-listener/tap-listener", ["unipointer/unipointer"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("unipointer")) : t.TapListener = e(t, t.Unipointer);
}(window, function (t, e) {
  function i(t) {
    this.bindTap(t);
  }var n = i.prototype = Object.create(e.prototype);return n.bindTap = function (t) {
    t && (this.unbindTap(), this.tapElement = t, this._bindStartEvent(t, !0));
  }, n.unbindTap = function () {
    this.tapElement && (this._bindStartEvent(this.tapElement, !0), delete this.tapElement);
  }, n.pointerUp = function (i, n) {
    if (!this.isIgnoringMouseUp || "mouseup" != i.type) {
      var s = e.getPointerPoint(n),
          o = this.tapElement.getBoundingClientRect(),
          r = t.pageXOffset,
          a = t.pageYOffset,
          l = s.x >= o.left + r && s.x <= o.right + r && s.y >= o.top + a && s.y <= o.bottom + a;if (l && this.emitEvent("tap", [i, n]), "mouseup" != i.type) {
        this.isIgnoringMouseUp = !0;var h = this;setTimeout(function () {
          delete h.isIgnoringMouseUp;
        }, 400);
      }
    }
  }, n.destroy = function () {
    this.pointerDone(), this.unbindTap();
  }, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/prev-next-button", ["./flickity", "tap-listener/tap-listener", "fizzy-ui-utils/utils"], function (i, n, s) {
    return e(t, i, n, s);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("tap-listener"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.TapListener, t.fizzyUIUtils);
}(window, function (t, e, i, n) {
  "use strict";
  function s(t, e) {
    this.direction = t, this.parent = e, this._create();
  }function o(t) {
    return "string" == typeof t ? t : "M " + t.x0 + ",50 L " + t.x1 + "," + (t.y1 + 50) + " L " + t.x2 + "," + (t.y2 + 50) + " L " + t.x3 + ",50  L " + t.x2 + "," + (50 - t.y2) + " L " + t.x1 + "," + (50 - t.y1) + " Z";
  }var r = "http://www.w3.org/2000/svg";s.prototype = new i(), s.prototype._create = function () {
    this.isEnabled = !0, this.isPrevious = this.direction == -1;var t = this.parent.options.rightToLeft ? 1 : -1;this.isLeft = this.direction == t;var e = this.element = document.createElement("button");e.className = "flickity-prev-next-button", e.className += this.isPrevious ? " previous" : " next", e.setAttribute("type", "button"), this.disable(), e.setAttribute("aria-label", this.isPrevious ? "previous" : "next");var i = this.createSVG();e.appendChild(i), this.on("tap", this.onTap), this.parent.on("select", this.update.bind(this)), this.on("pointerDown", this.parent.childUIPointerDown.bind(this.parent));
  }, s.prototype.activate = function () {
    this.bindTap(this.element), this.element.addEventListener("click", this), this.parent.element.appendChild(this.element);
  }, s.prototype.deactivate = function () {
    this.parent.element.removeChild(this.element), i.prototype.destroy.call(this), this.element.removeEventListener("click", this);
  }, s.prototype.createSVG = function () {
    var t = document.createElementNS(r, "svg");t.setAttribute("viewBox", "0 0 100 100");var e = document.createElementNS(r, "path"),
        i = o(this.parent.options.arrowShape);return e.setAttribute("d", i), e.setAttribute("class", "arrow"), this.isLeft || e.setAttribute("transform", "translate(100, 100) rotate(180) "), t.appendChild(e), t;
  }, s.prototype.onTap = function () {
    if (this.isEnabled) {
      this.parent.uiChange();var t = this.isPrevious ? "previous" : "next";this.parent[t]();
    }
  }, s.prototype.handleEvent = n.handleEvent, s.prototype.onclick = function () {
    var t = document.activeElement;t && t == this.element && this.onTap();
  }, s.prototype.enable = function () {
    this.isEnabled || (this.element.disabled = !1, this.isEnabled = !0);
  }, s.prototype.disable = function () {
    this.isEnabled && (this.element.disabled = !0, this.isEnabled = !1);
  }, s.prototype.update = function () {
    var t = this.parent.slides;if (this.parent.options.wrapAround && t.length > 1) return void this.enable();var e = t.length ? t.length - 1 : 0,
        i = this.isPrevious ? 0 : e,
        n = this.parent.selectedIndex == i ? "disable" : "enable";this[n]();
  }, s.prototype.destroy = function () {
    this.deactivate();
  }, n.extend(e.defaults, { prevNextButtons: !0, arrowShape: { x0: 10, x1: 60, y1: 50, x2: 70, y2: 40, x3: 30 } }), e.createMethods.push("_createPrevNextButtons");var a = e.prototype;return a._createPrevNextButtons = function () {
    this.options.prevNextButtons && (this.prevButton = new s(-1, this), this.nextButton = new s(1, this), this.on("activate", this.activatePrevNextButtons));
  }, a.activatePrevNextButtons = function () {
    this.prevButton.activate(), this.nextButton.activate(), this.on("deactivate", this.deactivatePrevNextButtons);
  }, a.deactivatePrevNextButtons = function () {
    this.prevButton.deactivate(), this.nextButton.deactivate(), this.off("deactivate", this.deactivatePrevNextButtons);
  }, e.PrevNextButton = s, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/page-dots", ["./flickity", "tap-listener/tap-listener", "fizzy-ui-utils/utils"], function (i, n, s) {
    return e(t, i, n, s);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("tap-listener"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.TapListener, t.fizzyUIUtils);
}(window, function (t, e, i, n) {
  function s(t) {
    this.parent = t, this._create();
  }s.prototype = new i(), s.prototype._create = function () {
    this.holder = document.createElement("ol"), this.holder.className = "flickity-page-dots", this.dots = [], this.on("tap", this.onTap), this.on("pointerDown", this.parent.childUIPointerDown.bind(this.parent));
  }, s.prototype.activate = function () {
    this.setDots(), this.bindTap(this.holder), this.parent.element.appendChild(this.holder);
  }, s.prototype.deactivate = function () {
    this.parent.element.removeChild(this.holder), i.prototype.destroy.call(this);
  }, s.prototype.setDots = function () {
    var t = this.parent.slides.length - this.dots.length;t > 0 ? this.addDots(t) : t < 0 && this.removeDots(-t);
  }, s.prototype.addDots = function (t) {
    for (var e = document.createDocumentFragment(), i = []; t;) {
      var n = document.createElement("li");n.className = "dot", e.appendChild(n), i.push(n), t--;
    }this.holder.appendChild(e), this.dots = this.dots.concat(i);
  }, s.prototype.removeDots = function (t) {
    var e = this.dots.splice(this.dots.length - t, t);e.forEach(function (t) {
      this.holder.removeChild(t);
    }, this);
  }, s.prototype.updateSelected = function () {
    this.selectedDot && (this.selectedDot.className = "dot"), this.dots.length && (this.selectedDot = this.dots[this.parent.selectedIndex], this.selectedDot.className = "dot is-selected");
  }, s.prototype.onTap = function (t) {
    var e = t.target;if ("LI" == e.nodeName) {
      this.parent.uiChange();var i = this.dots.indexOf(e);this.parent.select(i);
    }
  }, s.prototype.destroy = function () {
    this.deactivate();
  }, e.PageDots = s, n.extend(e.defaults, { pageDots: !0 }), e.createMethods.push("_createPageDots");var o = e.prototype;return o._createPageDots = function () {
    this.options.pageDots && (this.pageDots = new s(this), this.on("activate", this.activatePageDots), this.on("select", this.updateSelectedPageDots), this.on("cellChange", this.updatePageDots), this.on("resize", this.updatePageDots), this.on("deactivate", this.deactivatePageDots));
  }, o.activatePageDots = function () {
    this.pageDots.activate();
  }, o.updateSelectedPageDots = function () {
    this.pageDots.updateSelected();
  }, o.updatePageDots = function () {
    this.pageDots.setDots();
  }, o.deactivatePageDots = function () {
    this.pageDots.deactivate();
  }, e.PageDots = s, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/player", ["ev-emitter/ev-emitter", "fizzy-ui-utils/utils", "./flickity"], function (t, i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(require("ev-emitter"), require("fizzy-ui-utils"), require("./flickity")) : e(t.EvEmitter, t.fizzyUIUtils, t.Flickity);
}(window, function (t, e, i) {
  function n(t) {
    this.parent = t, this.state = "stopped", o && (this.onVisibilityChange = function () {
      this.visibilityChange();
    }.bind(this), this.onVisibilityPlay = function () {
      this.visibilityPlay();
    }.bind(this));
  }var s, o;"hidden" in document ? (s = "hidden", o = "visibilitychange") : "webkitHidden" in document && (s = "webkitHidden", o = "webkitvisibilitychange"), n.prototype = Object.create(t.prototype), n.prototype.play = function () {
    if ("playing" != this.state) {
      var t = document[s];if (o && t) return void document.addEventListener(o, this.onVisibilityPlay);this.state = "playing", o && document.addEventListener(o, this.onVisibilityChange), this.tick();
    }
  }, n.prototype.tick = function () {
    if ("playing" == this.state) {
      var t = this.parent.options.autoPlay;t = "number" == typeof t ? t : 3e3;var e = this;this.clear(), this.timeout = setTimeout(function () {
        e.parent.next(!0), e.tick();
      }, t);
    }
  }, n.prototype.stop = function () {
    this.state = "stopped", this.clear(), o && document.removeEventListener(o, this.onVisibilityChange);
  }, n.prototype.clear = function () {
    clearTimeout(this.timeout);
  }, n.prototype.pause = function () {
    "playing" == this.state && (this.state = "paused", this.clear());
  }, n.prototype.unpause = function () {
    "paused" == this.state && this.play();
  }, n.prototype.visibilityChange = function () {
    var t = document[s];this[t ? "pause" : "unpause"]();
  }, n.prototype.visibilityPlay = function () {
    this.play(), document.removeEventListener(o, this.onVisibilityPlay);
  }, e.extend(i.defaults, { pauseAutoPlayOnHover: !0 }), i.createMethods.push("_createPlayer");var r = i.prototype;return r._createPlayer = function () {
    this.player = new n(this), this.on("activate", this.activatePlayer), this.on("uiChange", this.stopPlayer), this.on("pointerDown", this.stopPlayer), this.on("deactivate", this.deactivatePlayer);
  }, r.activatePlayer = function () {
    this.options.autoPlay && (this.player.play(), this.element.addEventListener("mouseenter", this));
  }, r.playPlayer = function () {
    this.player.play();
  }, r.stopPlayer = function () {
    this.player.stop();
  }, r.pausePlayer = function () {
    this.player.pause();
  }, r.unpausePlayer = function () {
    this.player.unpause();
  }, r.deactivatePlayer = function () {
    this.player.stop(), this.element.removeEventListener("mouseenter", this);
  }, r.onmouseenter = function () {
    this.options.pauseAutoPlayOnHover && (this.player.pause(), this.element.addEventListener("mouseleave", this));
  }, r.onmouseleave = function () {
    this.player.unpause(), this.element.removeEventListener("mouseleave", this);
  }, i.Player = n, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/add-remove-cell", ["./flickity", "fizzy-ui-utils/utils"], function (i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.fizzyUIUtils);
}(window, function (t, e, i) {
  function n(t) {
    var e = document.createDocumentFragment();return t.forEach(function (t) {
      e.appendChild(t.element);
    }), e;
  }var s = e.prototype;return s.insert = function (t, e) {
    var i = this._makeCells(t);if (i && i.length) {
      var s = this.cells.length;e = void 0 === e ? s : e;var o = n(i),
          r = e == s;if (r) this.slider.appendChild(o);else {
        var a = this.cells[e].element;this.slider.insertBefore(o, a);
      }if (0 === e) this.cells = i.concat(this.cells);else if (r) this.cells = this.cells.concat(i);else {
        var l = this.cells.splice(e, s - e);this.cells = this.cells.concat(i).concat(l);
      }this._sizeCells(i);var h = e > this.selectedIndex ? 0 : i.length;this._cellAddedRemoved(e, h);
    }
  }, s.append = function (t) {
    this.insert(t, this.cells.length);
  }, s.prepend = function (t) {
    this.insert(t, 0);
  }, s.remove = function (t) {
    var e,
        n,
        s = this.getCells(t),
        o = 0,
        r = s.length;for (e = 0; e < r; e++) {
      n = s[e];var a = this.cells.indexOf(n) < this.selectedIndex;o -= a ? 1 : 0;
    }for (e = 0; e < r; e++) {
      n = s[e], n.remove(), i.removeFrom(this.cells, n);
    }s.length && this._cellAddedRemoved(0, o);
  }, s._cellAddedRemoved = function (t, e) {
    e = e || 0, this.selectedIndex += e, this.selectedIndex = Math.max(0, Math.min(this.slides.length - 1, this.selectedIndex)), this.cellChange(t, !0), this.emitEvent("cellAddedRemoved", [t, e]);
  }, s.cellSizeChange = function (t) {
    var e = this.getCell(t);if (e) {
      e.getSize();var i = this.cells.indexOf(e);this.cellChange(i);
    }
  }, s.cellChange = function (t, e) {
    var i = this.slideableWidth;if (this._positionCells(t), this._getWrapShiftCells(), this.setGallerySize(), this.emitEvent("cellChange", [t]), this.options.freeScroll) {
      var n = i - this.slideableWidth;this.x += n * this.cellAlign, this.positionSlider();
    } else e && this.positionSliderAtSelected(), this.select(this.selectedIndex);
  }, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/lazyload", ["./flickity", "fizzy-ui-utils/utils"], function (i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.fizzyUIUtils);
}(window, function (t, e, i) {
  "use strict";
  function n(t) {
    if ("IMG" == t.nodeName && t.getAttribute("data-flickity-lazyload")) return [t];var e = t.querySelectorAll("img[data-flickity-lazyload]");return i.makeArray(e);
  }function s(t, e) {
    this.img = t, this.flickity = e, this.load();
  }e.createMethods.push("_createLazyload");var o = e.prototype;return o._createLazyload = function () {
    this.on("select", this.lazyLoad);
  }, o.lazyLoad = function () {
    var t = this.options.lazyLoad;if (t) {
      var e = "number" == typeof t ? t : 0,
          i = this.getAdjacentCellElements(e),
          o = [];i.forEach(function (t) {
        var e = n(t);o = o.concat(e);
      }), o.forEach(function (t) {
        new s(t, this);
      }, this);
    }
  }, s.prototype.handleEvent = i.handleEvent, s.prototype.load = function () {
    this.img.addEventListener("load", this), this.img.addEventListener("error", this), this.img.src = this.img.getAttribute("data-flickity-lazyload"), this.img.removeAttribute("data-flickity-lazyload");
  }, s.prototype.onload = function (t) {
    this.complete(t, "flickity-lazyloaded");
  }, s.prototype.onerror = function (t) {
    this.complete(t, "flickity-lazyerror");
  }, s.prototype.complete = function (t, e) {
    this.img.removeEventListener("load", this), this.img.removeEventListener("error", this);var i = this.flickity.getParentCell(this.img),
        n = i && i.element;this.flickity.cellSizeChange(n), this.img.classList.add(e), this.flickity.dispatchEvent("lazyLoad", t, n);
  }, e.LazyLoader = s, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/index", ["./flickity", "./drag", "./prev-next-button", "./page-dots", "./player", "./add-remove-cell", "./lazyload"], e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports && (module.exports = e(require("./flickity"), require("./drag"), require("./prev-next-button"), require("./page-dots"), require("./player"), require("./add-remove-cell"), require("./lazyload")));
}(window, function (t) {
  return t;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity-as-nav-for/as-nav-for", ["flickity/js/index", "fizzy-ui-utils/utils"], e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(require("flickity"), require("fizzy-ui-utils")) : t.Flickity = e(t.Flickity, t.fizzyUIUtils);
}(window, function (t, e) {
  function i(t, e, i) {
    return (e - t) * i + t;
  }t.createMethods.push("_createAsNavFor");var n = t.prototype;return n._createAsNavFor = function () {
    this.on("activate", this.activateAsNavFor), this.on("deactivate", this.deactivateAsNavFor), this.on("destroy", this.destroyAsNavFor);var t = this.options.asNavFor;if (t) {
      var e = this;setTimeout(function () {
        e.setNavCompanion(t);
      });
    }
  }, n.setNavCompanion = function (i) {
    i = e.getQueryElement(i);var n = t.data(i);if (n && n != this) {
      this.navCompanion = n;var s = this;this.onNavCompanionSelect = function () {
        s.navCompanionSelect();
      }, n.on("select", this.onNavCompanionSelect), this.on("staticClick", this.onNavStaticClick), this.navCompanionSelect(!0);
    }
  }, n.navCompanionSelect = function (t) {
    if (this.navCompanion) {
      var e = this.navCompanion.selectedCells[0],
          n = this.navCompanion.cells.indexOf(e),
          s = n + this.navCompanion.selectedCells.length - 1,
          o = Math.floor(i(n, s, this.navCompanion.cellAlign));if (this.selectCell(o, !1, t), this.removeNavSelectedElements(), !(o >= this.cells.length)) {
        var r = this.cells.slice(n, s + 1);this.navSelectedElements = r.map(function (t) {
          return t.element;
        }), this.changeNavSelectedClass("add");
      }
    }
  }, n.changeNavSelectedClass = function (t) {
    this.navSelectedElements.forEach(function (e) {
      e.classList[t]("is-nav-selected");
    });
  }, n.activateAsNavFor = function () {
    this.navCompanionSelect(!0);
  }, n.removeNavSelectedElements = function () {
    this.navSelectedElements && (this.changeNavSelectedClass("remove"), delete this.navSelectedElements);
  }, n.onNavStaticClick = function (t, e, i, n) {
    "number" == typeof n && this.navCompanion.selectCell(n);
  }, n.deactivateAsNavFor = function () {
    this.removeNavSelectedElements();
  }, n.destroyAsNavFor = function () {
    this.navCompanion && (this.navCompanion.off("select", this.onNavCompanionSelect), this.off("staticClick", this.onNavStaticClick), delete this.navCompanion);
  }, t;
}), function (t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("imagesloaded/imagesloaded", ["ev-emitter/ev-emitter"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("ev-emitter")) : t.imagesLoaded = e(t, t.EvEmitter);
}(window, function (t, e) {
  function i(t, e) {
    for (var i in e) {
      t[i] = e[i];
    }return t;
  }function n(t) {
    var e = [];if (Array.isArray(t)) e = t;else if ("number" == typeof t.length) for (var i = 0; i < t.length; i++) {
      e.push(t[i]);
    } else e.push(t);return e;
  }function s(t, e, o) {
    return this instanceof s ? ("string" == typeof t && (t = document.querySelectorAll(t)), this.elements = n(t), this.options = i({}, this.options), "function" == typeof e ? o = e : i(this.options, e), o && this.on("always", o), this.getImages(), a && (this.jqDeferred = new a.Deferred()), void setTimeout(function () {
      this.check();
    }.bind(this))) : new s(t, e, o);
  }function o(t) {
    this.img = t;
  }function r(t, e) {
    this.url = t, this.element = e, this.img = new Image();
  }var a = t.jQuery,
      l = t.console;s.prototype = Object.create(e.prototype), s.prototype.options = {}, s.prototype.getImages = function () {
    this.images = [], this.elements.forEach(this.addElementImages, this);
  }, s.prototype.addElementImages = function (t) {
    "IMG" == t.nodeName && this.addImage(t), this.options.background === !0 && this.addElementBackgroundImages(t);var e = t.nodeType;if (e && h[e]) {
      for (var i = t.querySelectorAll("img"), n = 0; n < i.length; n++) {
        var s = i[n];this.addImage(s);
      }if ("string" == typeof this.options.background) {
        var o = t.querySelectorAll(this.options.background);for (n = 0; n < o.length; n++) {
          var r = o[n];this.addElementBackgroundImages(r);
        }
      }
    }
  };var h = { 1: !0, 9: !0, 11: !0 };return s.prototype.addElementBackgroundImages = function (t) {
    var e = getComputedStyle(t);if (e) for (var i = /url\((['"])?(.*?)\1\)/gi, n = i.exec(e.backgroundImage); null !== n;) {
      var s = n && n[2];s && this.addBackground(s, t), n = i.exec(e.backgroundImage);
    }
  }, s.prototype.addImage = function (t) {
    var e = new o(t);this.images.push(e);
  }, s.prototype.addBackground = function (t, e) {
    var i = new r(t, e);this.images.push(i);
  }, s.prototype.check = function () {
    function t(t, i, n) {
      setTimeout(function () {
        e.progress(t, i, n);
      });
    }var e = this;return this.progressedCount = 0, this.hasAnyBroken = !1, this.images.length ? void this.images.forEach(function (e) {
      e.once("progress", t), e.check();
    }) : void this.complete();
  }, s.prototype.progress = function (t, e, i) {
    this.progressedCount++, this.hasAnyBroken = this.hasAnyBroken || !t.isLoaded, this.emitEvent("progress", [this, t, e]), this.jqDeferred && this.jqDeferred.notify && this.jqDeferred.notify(this, t), this.progressedCount == this.images.length && this.complete(), this.options.debug && l && l.log("progress: " + i, t, e);
  }, s.prototype.complete = function () {
    var t = this.hasAnyBroken ? "fail" : "done";if (this.isComplete = !0, this.emitEvent(t, [this]), this.emitEvent("always", [this]), this.jqDeferred) {
      var e = this.hasAnyBroken ? "reject" : "resolve";this.jqDeferred[e](this);
    }
  }, o.prototype = Object.create(e.prototype), o.prototype.check = function () {
    var t = this.getIsImageComplete();return t ? void this.confirm(0 !== this.img.naturalWidth, "naturalWidth") : (this.proxyImage = new Image(), this.proxyImage.addEventListener("load", this), this.proxyImage.addEventListener("error", this), this.img.addEventListener("load", this), this.img.addEventListener("error", this), void (this.proxyImage.src = this.img.src));
  }, o.prototype.getIsImageComplete = function () {
    return this.img.complete && void 0 !== this.img.naturalWidth;
  }, o.prototype.confirm = function (t, e) {
    this.isLoaded = t, this.emitEvent("progress", [this, this.img, e]);
  }, o.prototype.handleEvent = function (t) {
    var e = "on" + t.type;this[e] && this[e](t);
  }, o.prototype.onload = function () {
    this.confirm(!0, "onload"), this.unbindEvents();
  }, o.prototype.onerror = function () {
    this.confirm(!1, "onerror"), this.unbindEvents();
  }, o.prototype.unbindEvents = function () {
    this.proxyImage.removeEventListener("load", this), this.proxyImage.removeEventListener("error", this), this.img.removeEventListener("load", this), this.img.removeEventListener("error", this);
  }, r.prototype = Object.create(o.prototype), r.prototype.check = function () {
    this.img.addEventListener("load", this), this.img.addEventListener("error", this), this.img.src = this.url;var t = this.getIsImageComplete();t && (this.confirm(0 !== this.img.naturalWidth, "naturalWidth"), this.unbindEvents());
  }, r.prototype.unbindEvents = function () {
    this.img.removeEventListener("load", this), this.img.removeEventListener("error", this);
  }, r.prototype.confirm = function (t, e) {
    this.isLoaded = t, this.emitEvent("progress", [this, this.element, e]);
  }, s.makeJQueryPlugin = function (e) {
    e = e || t.jQuery, e && (a = e, a.fn.imagesLoaded = function (t, e) {
      var i = new s(this, t, e);return i.jqDeferred.promise(a(this));
    });
  }, s.makeJQueryPlugin(), s;
}), function (t, e) {
  "function" == typeof define && define.amd ? define(["flickity/js/index", "imagesloaded/imagesloaded"], function (i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("flickity"), require("imagesloaded")) : t.Flickity = e(t, t.Flickity, t.imagesLoaded);
}(window, function (t, e, i) {
  "use strict";
  e.createMethods.push("_createImagesLoaded");var n = e.prototype;return n._createImagesLoaded = function () {
    this.on("activate", this.imagesLoaded);
  }, n.imagesLoaded = function () {
    function t(t, i) {
      var n = e.getParentCell(i.img);e.cellSizeChange(n && n.element), e.options.freeScroll || e.positionSliderAtSelected();
    }if (this.options.imagesLoaded) {
      var e = this;i(this.slider).on("progress", t);
    }
  }, e;
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Flickity background lazyload v1.0.0
 * lazyload background cell images
 */

/*jshint browser: true, unused: true, undef: true */

(function (window, factory) {
  // universal module definition
  /*globals define, module, require */
  if (typeof define == 'function' && define.amd) {
    // AMD
    define(['flickity/js/index', 'fizzy-ui-utils/utils'], factory);
  } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('flickity'), require('fizzy-ui-utils'));
  } else {
    // browser global
    factory(window.Flickity, window.fizzyUIUtils);
  }
})(window, function factory(Flickity, utils) {
  /*jshint strict: true */
  'use strict';

  Flickity.createMethods.push('_createBgLazyLoad');

  var proto = Flickity.prototype;

  proto._createBgLazyLoad = function () {
    this.on('select', this.bgLazyLoad);
  };

  proto.bgLazyLoad = function () {
    var lazyLoad = this.options.bgLazyLoad;
    if (!lazyLoad) {
      return;
    }

    // get adjacent cells, use lazyLoad option for adjacent count
    var adjCount = typeof lazyLoad == 'number' ? lazyLoad : 0;
    var cellElems = this.getAdjacentCellElements(adjCount);

    for (var i = 0; i < cellElems.length; i++) {
      var cellElem = cellElems[i];
      this.bgLazyLoadElem(cellElem);
      // select lazy elems in cell
      var children = cellElem.querySelectorAll('[data-flickity-bg-lazyload]');
      for (var j = 0; j < children.length; j++) {
        this.bgLazyLoadElem(children[j]);
      }
    }
  };

  proto.bgLazyLoadElem = function (elem) {
    var attr = elem.getAttribute('data-flickity-bg-lazyload');
    if (attr) {
      new BgLazyLoader(elem, attr, this);
    }
  };

  // -------------------------- LazyBGLoader -------------------------- //

  /**
   * class to handle loading images
   */
  function BgLazyLoader(elem, url, flickity) {
    this.element = elem;
    this.url = url;
    this.img = new Image();
    this.flickity = flickity;
    this.load();
  }

  BgLazyLoader.prototype.handleEvent = utils.handleEvent;

  BgLazyLoader.prototype.load = function () {
    this.img.addEventListener('load', this);
    this.img.addEventListener('error', this);
    // load image
    this.img.src = this.url;
    // remove attr
    this.element.removeAttribute('data-flickity-bg-lazyload');
  };

  BgLazyLoader.prototype.onload = function (event) {
    this.element.style.backgroundImage = 'url(' + this.url + ')';
    this.complete(event, 'flickity-bg-lazyloaded');
  };

  BgLazyLoader.prototype.onerror = function (event) {
    this.complete(event, 'flickity-bg-lazyerror');
  };

  BgLazyLoader.prototype.complete = function (event, className) {
    // unbind events
    this.img.removeEventListener('load', this);
    this.img.removeEventListener('error', this);

    this.element.classList.add(className);
    this.flickity.dispatchEvent('bgLazyLoad', event, this.element);
  };

  // -----  ----- //

  Flickity.BgLazyLoader = BgLazyLoader;

  return Flickity;
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
*  Ajax Autocomplete for jQuery, version 1.2.27
*  (c) 2015 Tomas Kirda
*
*  Ajax Autocomplete for jQuery is freely distributable under the terms of an MIT-style license.
*  For details, see the web site: https://github.com/devbridge/jQuery-Autocomplete
*/

/*jslint  browser: true, white: true, single: true, this: true, multivar: true */
/*global define, window, document, jQuery, exports, require */

// Expose plugin as an AMD module if AMD loader is present:
(function (factory) {
    "use strict";

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof require === 'function') {
        // Browserify
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
})(function ($) {
    'use strict';

    var utils = function () {
        return {
            escapeRegExChars: function escapeRegExChars(value) {
                return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
            },
            createNode: function createNode(containerClass) {
                var div = document.createElement('div');
                div.className = containerClass;
                div.style.position = 'absolute';
                div.style.display = 'none';
                return div;
            }
        };
    }(),
        keys = {
        ESC: 27,
        TAB: 9,
        RETURN: 13,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
    };

    function Autocomplete(el, options) {
        var noop = $.noop,
            that = this,
            defaults = {
            ajaxSettings: {},
            autoSelectFirst: false,
            appendTo: document.body,
            serviceUrl: null,
            lookup: null,
            onSelect: null,
            width: 'auto',
            minChars: 1,
            maxHeight: 300,
            deferRequestBy: 0,
            params: {},
            formatResult: Autocomplete.formatResult,
            delimiter: null,
            zIndex: 9999,
            type: 'GET',
            noCache: false,
            onSearchStart: noop,
            onSearchComplete: noop,
            onSearchError: noop,
            preserveInput: false,
            containerClass: 'autocomplete-suggestions',
            tabDisabled: false,
            dataType: 'text',
            currentRequest: null,
            triggerSelectOnValidInput: true,
            preventBadQueries: true,
            lookupFilter: function lookupFilter(suggestion, originalQuery, queryLowerCase) {
                return suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
            },
            paramName: 'query',
            transformResult: function transformResult(response) {
                return typeof response === 'string' ? $.parseJSON(response) : response;
            },
            showNoSuggestionNotice: false,
            noSuggestionNotice: 'No results',
            orientation: 'bottom',
            forceFixPosition: false
        };

        // Shared variables:
        that.element = el;
        that.el = $(el);
        that.suggestions = [];
        that.badQueries = [];
        that.selectedIndex = -1;
        that.currentValue = that.element.value;
        that.intervalId = 0;
        that.cachedResponse = {};
        that.onChangeInterval = null;
        that.onChange = null;
        that.isLocal = false;
        that.suggestionsContainer = null;
        that.noSuggestionsContainer = null;
        that.options = $.extend({}, defaults, options);
        that.classes = {
            selected: 'autocomplete-selected',
            suggestion: 'autocomplete-suggestion'
        };
        that.hint = null;
        that.hintValue = '';
        that.selection = null;

        // Initialize and set options:
        that.initialize();
        that.setOptions(options);
    }

    Autocomplete.utils = utils;

    $.Autocomplete = Autocomplete;

    Autocomplete.formatResult = function (suggestion, currentValue) {
        // Do not replace anything if there current value is empty
        if (!currentValue) {
            return suggestion.value;
        }

        var pattern = '(' + utils.escapeRegExChars(currentValue) + ')';

        return suggestion.value.replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/&lt;(\/?strong)&gt;/g, '<$1>');
    };

    Autocomplete.prototype = {

        killerFn: null,

        initialize: function initialize() {
            var that = this,
                suggestionSelector = '.' + that.classes.suggestion,
                selected = that.classes.selected,
                options = that.options,
                container;

            // Remove autocomplete attribute to prevent native suggestions:
            that.element.setAttribute('autocomplete', 'off');

            that.killerFn = function (e) {
                if (!$(e.target).closest('.' + that.options.containerClass).length) {
                    that.killSuggestions();
                    that.disableKillerFn();
                }
            };

            // html() deals with many types: htmlString or Element or Array or jQuery
            that.noSuggestionsContainer = $('<div class="autocomplete-no-suggestion"></div>').html(this.options.noSuggestionNotice).get(0);

            that.suggestionsContainer = Autocomplete.utils.createNode(options.containerClass);

            container = $(that.suggestionsContainer);

            container.appendTo(options.appendTo);

            // Only set width if it was provided:
            if (options.width !== 'auto') {
                container.css('width', options.width);
            }

            // Listen for mouse over event on suggestions list:
            container.on('mouseover.autocomplete', suggestionSelector, function () {
                that.activate($(this).data('index'));
            });

            // Deselect active element when mouse leaves suggestions container:
            container.on('mouseout.autocomplete', function () {
                that.selectedIndex = -1;
                container.children('.' + selected).removeClass(selected);
            });

            // Listen for click event on suggestions list:
            container.on('click.autocomplete', suggestionSelector, function () {
                that.select($(this).data('index'));
                return false;
            });

            that.fixPositionCapture = function () {
                if (that.visible) {
                    that.fixPosition();
                }
            };

            $(window).on('resize.autocomplete', that.fixPositionCapture);

            that.el.on('keydown.autocomplete', function (e) {
                that.onKeyPress(e);
            });
            that.el.on('keyup.autocomplete', function (e) {
                that.onKeyUp(e);
            });
            that.el.on('blur.autocomplete', function () {
                that.onBlur();
            });
            that.el.on('focus.autocomplete', function () {
                that.onFocus();
            });
            that.el.on('change.autocomplete', function (e) {
                that.onKeyUp(e);
            });
            that.el.on('input.autocomplete', function (e) {
                that.onKeyUp(e);
            });
        },

        onFocus: function onFocus() {
            var that = this;

            that.fixPosition();

            if (that.el.val().length >= that.options.minChars) {
                that.onValueChange();
            }
        },

        onBlur: function onBlur() {
            this.enableKillerFn();
        },

        abortAjax: function abortAjax() {
            var that = this;
            if (that.currentRequest) {
                that.currentRequest.abort();
                that.currentRequest = null;
            }
        },

        setOptions: function setOptions(suppliedOptions) {
            var that = this,
                options = that.options;

            $.extend(options, suppliedOptions);

            that.isLocal = $.isArray(options.lookup);

            if (that.isLocal) {
                options.lookup = that.verifySuggestionsFormat(options.lookup);
            }

            options.orientation = that.validateOrientation(options.orientation, 'bottom');

            // Adjust height, width and z-index:
            $(that.suggestionsContainer).css({
                'max-height': options.maxHeight + 'px',
                'width': options.width + 'px',
                'z-index': options.zIndex
            });
        },

        clearCache: function clearCache() {
            this.cachedResponse = {};
            this.badQueries = [];
        },

        clear: function clear() {
            this.clearCache();
            this.currentValue = '';
            this.suggestions = [];
        },

        disable: function disable() {
            var that = this;
            that.disabled = true;
            clearInterval(that.onChangeInterval);
            that.abortAjax();
        },

        enable: function enable() {
            this.disabled = false;
        },

        fixPosition: function fixPosition() {
            // Use only when container has already its content

            var that = this,
                $container = $(that.suggestionsContainer),
                containerParent = $container.parent().get(0);
            // Fix position automatically when appended to body.
            // In other cases force parameter must be given.
            if (containerParent !== document.body && !that.options.forceFixPosition) {
                return;
            }
            var siteSearchDiv = $('.site-search');
            // Choose orientation
            var orientation = that.options.orientation,
                containerHeight = $container.outerHeight(),
                height = siteSearchDiv.outerHeight(),
                offset = siteSearchDiv.offset(),
                styles = { 'top': offset.top, 'left': offset.left };

            if (orientation === 'auto') {
                var viewPortHeight = $(window).height(),
                    scrollTop = $(window).scrollTop(),
                    topOverflow = -scrollTop + offset.top - containerHeight,
                    bottomOverflow = scrollTop + viewPortHeight - (offset.top + height + containerHeight);

                orientation = Math.max(topOverflow, bottomOverflow) === topOverflow ? 'top' : 'bottom';
            }

            if (orientation === 'top') {
                styles.top += -containerHeight;
            } else {
                styles.top += height;
            }

            // If container is not positioned to body,
            // correct its position using offset parent offset
            if (containerParent !== document.body) {
                var opacity = $container.css('opacity'),
                    parentOffsetDiff;

                if (!that.visible) {
                    $container.css('opacity', 0).show();
                }

                parentOffsetDiff = $container.offsetParent().offset();
                styles.top -= parentOffsetDiff.top;
                styles.left -= parentOffsetDiff.left;

                if (!that.visible) {
                    $container.css('opacity', opacity).hide();
                }
            }

            if (that.options.width === 'auto') {
                styles.width = siteSearchDiv.outerWidth() + 'px';
            }

            $container.css(styles);
        },

        enableKillerFn: function enableKillerFn() {
            var that = this;
            $(document).on('click.autocomplete', that.killerFn);
        },

        disableKillerFn: function disableKillerFn() {
            var that = this;
            $(document).off('click.autocomplete', that.killerFn);
        },

        killSuggestions: function killSuggestions() {
            var that = this;
            that.stopKillSuggestions();
            that.intervalId = window.setInterval(function () {
                if (that.visible) {
                    // No need to restore value when 
                    // preserveInput === true, 
                    // because we did not change it
                    if (!that.options.preserveInput) {
                        that.el.val(that.currentValue);
                    }

                    that.hide();
                }

                that.stopKillSuggestions();
            }, 50);
        },

        stopKillSuggestions: function stopKillSuggestions() {
            window.clearInterval(this.intervalId);
        },

        isCursorAtEnd: function isCursorAtEnd() {
            var that = this,
                valLength = that.el.val().length,
                selectionStart = that.element.selectionStart,
                range;

            if (typeof selectionStart === 'number') {
                return selectionStart === valLength;
            }
            if (document.selection) {
                range = document.selection.createRange();
                range.moveStart('character', -valLength);
                return valLength === range.text.length;
            }
            return true;
        },

        onKeyPress: function onKeyPress(e) {
            var that = this;

            // If suggestions are hidden and user presses arrow down, display suggestions:
            if (!that.disabled && !that.visible && e.which === keys.DOWN && that.currentValue) {
                that.suggest();
                return;
            }

            if (that.disabled || !that.visible) {
                return;
            }

            switch (e.which) {
                case keys.ESC:
                    that.el.val(that.currentValue);
                    that.hide();
                    break;
                case keys.RIGHT:
                    if (that.hint && that.options.onHint && that.isCursorAtEnd()) {
                        that.selectHint();
                        break;
                    }
                    return;
                case keys.TAB:
                    if (that.hint && that.options.onHint) {
                        that.selectHint();
                        return;
                    }
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    if (that.options.tabDisabled === false) {
                        return;
                    }
                    break;
                case keys.RETURN:
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    break;
                case keys.UP:
                    that.moveUp();
                    break;
                case keys.DOWN:
                    that.moveDown();
                    break;
                default:
                    return;
            }

            // Cancel event if function did not return:
            e.stopImmediatePropagation();
            e.preventDefault();
        },

        onKeyUp: function onKeyUp(e) {
            var that = this;

            if (that.disabled) {
                return;
            }

            switch (e.which) {
                case keys.UP:
                case keys.DOWN:
                    return;
            }

            clearInterval(that.onChangeInterval);

            if (that.currentValue !== that.el.val()) {
                that.findBestHint();
                if (that.options.deferRequestBy > 0) {
                    // Defer lookup in case when value changes very quickly:
                    that.onChangeInterval = setInterval(function () {
                        that.onValueChange();
                    }, that.options.deferRequestBy);
                } else {
                    that.onValueChange();
                }
            }
        },

        onValueChange: function onValueChange() {
            var that = this,
                options = that.options,
                value = that.el.val(),
                query = that.getQuery(value);

            if (that.selection && that.currentValue !== query) {
                that.selection = null;
                (options.onInvalidateSelection || $.noop).call(that.element);
            }

            clearInterval(that.onChangeInterval);
            that.currentValue = value;
            that.selectedIndex = -1;

            // Check existing suggestion for the match before proceeding:
            if (options.triggerSelectOnValidInput && that.isExactMatch(query)) {
                that.select(0);
                return;
            }

            if (query.length < options.minChars) {
                that.hide();
            } else {
                that.getSuggestions(query);
            }
        },

        isExactMatch: function isExactMatch(query) {
            var suggestions = this.suggestions;

            return suggestions.length === 1 && suggestions[0].value.toLowerCase() === query.toLowerCase();
        },

        getQuery: function getQuery(value) {
            var delimiter = this.options.delimiter,
                parts;

            if (!delimiter) {
                return value;
            }
            parts = value.split(delimiter);
            return $.trim(parts[parts.length - 1]);
        },

        getSuggestionsLocal: function getSuggestionsLocal(query) {
            var that = this,
                options = that.options,
                queryLowerCase = query.toLowerCase(),
                filter = options.lookupFilter,
                limit = parseInt(options.lookupLimit, 10),
                data;

            data = {
                suggestions: $.grep(options.lookup, function (suggestion) {
                    return filter(suggestion, query, queryLowerCase);
                })
            };

            if (limit && data.suggestions.length > limit) {
                data.suggestions = data.suggestions.slice(0, limit);
            }

            return data;
        },

        getSuggestions: function getSuggestions(q) {
            var response,
                that = this,
                options = that.options,
                serviceUrl = options.serviceUrl,
                params,
                cacheKey,
                ajaxSettings;

            options.params[options.paramName] = q;
            params = options.ignoreParams ? null : options.params;

            if (options.onSearchStart.call(that.element, options.params) === false) {
                return;
            }

            if ($.isFunction(options.lookup)) {
                options.lookup(q, function (data) {
                    that.suggestions = data.suggestions;
                    that.suggest();
                    options.onSearchComplete.call(that.element, q, data.suggestions);
                });
                return;
            }

            if (that.isLocal) {
                response = that.getSuggestionsLocal(q);
            } else {
                if ($.isFunction(serviceUrl)) {
                    serviceUrl = serviceUrl.call(that.element, q);
                }
                cacheKey = serviceUrl + '?' + $.param(params || {});
                response = that.cachedResponse[cacheKey];
            }

            if (response && $.isArray(response.suggestions)) {
                that.suggestions = response.suggestions;
                that.suggest();
                options.onSearchComplete.call(that.element, q, response.suggestions);
            } else if (!that.isBadQuery(q)) {
                that.abortAjax();

                ajaxSettings = {
                    url: serviceUrl,
                    data: params,
                    type: options.type,
                    dataType: options.dataType
                };

                $.extend(ajaxSettings, options.ajaxSettings);

                that.currentRequest = $.ajax(ajaxSettings).done(function (data) {
                    var result;
                    that.currentRequest = null;
                    result = options.transformResult(data, q);
                    that.processResponse(result, q, cacheKey);
                    options.onSearchComplete.call(that.element, q, result.suggestions);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    options.onSearchError.call(that.element, q, jqXHR, textStatus, errorThrown);
                });
            } else {
                options.onSearchComplete.call(that.element, q, []);
            }
        },

        isBadQuery: function isBadQuery(q) {
            if (!this.options.preventBadQueries) {
                return false;
            }

            var badQueries = this.badQueries,
                i = badQueries.length;

            while (i--) {
                if (q.indexOf(badQueries[i]) === 0) {
                    return true;
                }
            }

            return false;
        },

        hide: function hide() {
            var that = this,
                container = $(that.suggestionsContainer);

            if ($.isFunction(that.options.onHide) && that.visible) {
                that.options.onHide.call(that.element, container);
            }

            that.visible = false;
            that.selectedIndex = -1;
            clearInterval(that.onChangeInterval);
            $(that.suggestionsContainer).hide();
            that.signalHint(null);
        },

        suggest: function suggest() {
            if (!this.suggestions.length) {
                if (this.options.showNoSuggestionNotice) {
                    this.noSuggestions();
                } else {
                    this.hide();
                }
                return;
            }

            var that = this,
                options = that.options,
                groupBy = options.groupBy,
                formatResult = options.formatResult,
                value = that.getQuery(that.currentValue),
                className = that.classes.suggestion,
                classSelected = that.classes.selected,
                container = $(that.suggestionsContainer),
                noSuggestionsContainer = $(that.noSuggestionsContainer),
                beforeRender = options.beforeRender,
                html = '',
                category,
                formatGroup = function formatGroup(suggestion, index) {
                var currentCategory = suggestion.data[groupBy];

                if (category === currentCategory) {
                    return '';
                }

                category = currentCategory;

                return '<div class="autocomplete-group"><strong>' + category + '</strong></div>';
            };

            if (options.triggerSelectOnValidInput && that.isExactMatch(value)) {
                that.select(0);
                return;
            }

            // Build suggestions inner HTML:
            $.each(that.suggestions, function (i, suggestion) {
                if (groupBy) {
                    html += formatGroup(suggestion, value, i);
                }

                html += '<div class="' + className + '" data-index="' + i + '">' + formatResult(suggestion, value, i) + '</div>';
            });

            this.adjustContainerWidth();

            noSuggestionsContainer.detach();
            container.html(html);

            if ($.isFunction(beforeRender)) {
                beforeRender.call(that.element, container, that.suggestions);
            }

            that.fixPosition();
            container.show();

            // Select first value by default:
            if (options.autoSelectFirst) {
                that.selectedIndex = 0;
                container.scrollTop(0);
                container.children('.' + className).first().addClass(classSelected);
            }

            that.visible = true;
            that.findBestHint();
        },

        noSuggestions: function noSuggestions() {
            var that = this,
                container = $(that.suggestionsContainer),
                noSuggestionsContainer = $(that.noSuggestionsContainer);

            this.adjustContainerWidth();

            // Some explicit steps. Be careful here as it easy to get
            // noSuggestionsContainer removed from DOM if not detached properly.
            noSuggestionsContainer.detach();
            container.empty(); // clean suggestions if any
            container.append(noSuggestionsContainer);

            that.fixPosition();

            container.show();
            that.visible = true;
        },

        adjustContainerWidth: function adjustContainerWidth() {
            var that = this,
                options = that.options,
                width,
                container = $(that.suggestionsContainer);

            // If width is auto, adjust width before displaying suggestions,
            // because if instance was created before input had width, it will be zero.
            // Also it adjusts if input width has changed.
            if (options.width === 'auto') {
                width = that.el.outerWidth();
                container.css('width', width > 0 ? width : 300);
            }
        },

        findBestHint: function findBestHint() {
            var that = this,
                value = that.el.val().toLowerCase(),
                bestMatch = null;

            if (!value) {
                return;
            }

            $.each(that.suggestions, function (i, suggestion) {
                var foundMatch = suggestion.value.toLowerCase().indexOf(value) === 0;
                if (foundMatch) {
                    bestMatch = suggestion;
                }
                return !foundMatch;
            });

            that.signalHint(bestMatch);
        },

        signalHint: function signalHint(suggestion) {
            var hintValue = '',
                that = this;
            if (suggestion) {
                hintValue = that.currentValue + suggestion.value.substr(that.currentValue.length);
            }
            if (that.hintValue !== hintValue) {
                that.hintValue = hintValue;
                that.hint = suggestion;
                (this.options.onHint || $.noop)(hintValue);
            }
        },

        verifySuggestionsFormat: function verifySuggestionsFormat(suggestions) {
            // If suggestions is string array, convert them to supported format:
            if (suggestions.length && typeof suggestions[0] === 'string') {
                return $.map(suggestions, function (value) {
                    return { value: value, data: null };
                });
            }

            return suggestions;
        },

        validateOrientation: function validateOrientation(orientation, fallback) {
            orientation = $.trim(orientation || '').toLowerCase();

            if ($.inArray(orientation, ['auto', 'bottom', 'top']) === -1) {
                orientation = fallback;
            }

            return orientation;
        },

        processResponse: function processResponse(result, originalQuery, cacheKey) {
            var that = this,
                options = that.options;

            result.suggestions = that.verifySuggestionsFormat(result.suggestions);

            // Cache results if cache is not disabled:
            if (!options.noCache) {
                that.cachedResponse[cacheKey] = result;
                if (options.preventBadQueries && !result.suggestions.length) {
                    that.badQueries.push(originalQuery);
                }
            }

            // Return if originalQuery is not matching current query:
            if (originalQuery !== that.getQuery(that.currentValue)) {
                return;
            }

            that.suggestions = result.suggestions;
            that.suggest();
        },

        activate: function activate(index) {
            var that = this,
                activeItem,
                selected = that.classes.selected,
                container = $(that.suggestionsContainer),
                children = container.find('.' + that.classes.suggestion);

            container.find('.' + selected).removeClass(selected);

            that.selectedIndex = index;

            if (that.selectedIndex !== -1 && children.length > that.selectedIndex) {
                activeItem = children.get(that.selectedIndex);
                $(activeItem).addClass(selected);
                return activeItem;
            }

            return null;
        },

        selectHint: function selectHint() {
            var that = this,
                i = $.inArray(that.hint, that.suggestions);

            that.select(i);
        },

        select: function select(i) {
            var that = this;
            that.hide();
            that.onSelect(i);
            that.disableKillerFn();
        },

        moveUp: function moveUp() {
            var that = this;

            if (that.selectedIndex === -1) {
                return;
            }

            if (that.selectedIndex === 0) {
                $(that.suggestionsContainer).children().first().removeClass(that.classes.selected);
                that.selectedIndex = -1;
                that.el.val(that.currentValue);
                that.findBestHint();
                return;
            }

            that.adjustScroll(that.selectedIndex - 1);
        },

        moveDown: function moveDown() {
            var that = this;

            if (that.selectedIndex === that.suggestions.length - 1) {
                return;
            }

            that.adjustScroll(that.selectedIndex + 1);
        },

        adjustScroll: function adjustScroll(index) {
            var that = this,
                activeItem = that.activate(index);

            if (!activeItem) {
                return;
            }

            var offsetTop,
                upperBound,
                lowerBound,
                heightDelta = $(activeItem).outerHeight();

            offsetTop = activeItem.offsetTop;
            upperBound = $(that.suggestionsContainer).scrollTop();
            lowerBound = upperBound + that.options.maxHeight - heightDelta;

            if (offsetTop < upperBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop);
            } else if (offsetTop > lowerBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop - that.options.maxHeight + heightDelta);
            }

            if (!that.options.preserveInput) {
                that.el.val(that.getValue(that.suggestions[index].value));
            }
            that.signalHint(null);
        },

        onSelect: function onSelect(index) {
            var that = this,
                onSelectCallback = that.options.onSelect,
                suggestion = that.suggestions[index];

            that.currentValue = that.getValue(suggestion.value);

            if (that.currentValue !== that.el.val() && !that.options.preserveInput) {
                that.el.val(that.currentValue);
            }

            that.signalHint(null);
            that.suggestions = [];
            that.selection = suggestion;

            if ($.isFunction(onSelectCallback)) {
                onSelectCallback.call(that.element, suggestion);
            }
        },

        getValue: function getValue(value) {
            var that = this,
                delimiter = that.options.delimiter,
                currentValue,
                parts;

            if (!delimiter) {
                return value;
            }

            currentValue = that.currentValue;
            parts = currentValue.split(delimiter);

            if (parts.length === 1) {
                return value;
            }

            return currentValue.substr(0, currentValue.length - parts[parts.length - 1].length) + value;
        },

        dispose: function dispose() {
            var that = this;
            that.el.off('.autocomplete').removeData('autocomplete');
            that.disableKillerFn();
            $(window).off('resize.autocomplete', that.fixPositionCapture);
            $(that.suggestionsContainer).remove();
        }
    };

    // Create chainable jQuery plugin:
    $.fn.autocomplete = $.fn.devbridgeAutocomplete = function (options, args) {
        var dataKey = 'autocomplete';
        // If function invoked without argument return
        // instance of the first matched element:
        if (!arguments.length) {
            return this.first().data(dataKey);
        }

        return this.each(function () {
            var inputElement = $(this),
                instance = inputElement.data(dataKey);

            if (typeof options === 'string') {
                if (instance && typeof instance[options] === 'function') {
                    instance[options](args);
                }
            } else {
                // If instance already exists, destroy it:
                if (instance && instance.dispose) {
                    instance.dispose();
                }
                instance = new Autocomplete(this, options);
                inputElement.data(dataKey, instance);
            }
        });
    };
});
'use strict';

var _$$flickity;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

$(document).foundation();

var bases = document.getElementsByTagName('base');
var baseHref = null;

if (bases.length > 0) {
	baseHref = bases[0].href;
}
/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Lazy Loading Images:
/*-------------------------------------------------*/
/*-------------------------------------------------*/
var myLazyLoad = new LazyLoad({
	// example of options object -> see options section
	elements_selector: ".dp-lazy"
	// throttle: 200,
	// data_src: "src",
	// data_srcset: "srcset",
	// callback_set: function() { /* ... */ }
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Big Carousel (Home Page):
/*-------------------------------------------------*/
/*-------------------------------------------------*/

var $carousel = $('.carousel').flickity((_$$flickity = {
	imagesLoaded: true,
	percentPosition: false,
	selectedAttraction: 0.015,
	friction: 0.3,
	prevNextButtons: false,
	draggable: true,
	autoPlay: true
}, _defineProperty(_$$flickity, 'autoPlay', 8000), _defineProperty(_$$flickity, 'pauseAutoPlayOnHover', false), _defineProperty(_$$flickity, 'bgLazyLoad', true), _defineProperty(_$$flickity, 'pageDots', true), _$$flickity));

var $imgs = $carousel.find('.carousel-cell .cell-bg');
// get transform property
var docStyle = document.documentElement.style;
var transformProp = typeof docStyle.transform == 'string' ? 'transform' : 'WebkitTransform';
// get Flickity instance
var flkty = $carousel.data('flickity');

$carousel.on('scroll.flickity', function () {
	flkty.slides.forEach(function (slide, i) {
		var img = $imgs[i];
		var x = (slide.target + flkty.x) * -1 / 3;
		img.style[transformProp] = 'translateX(' + x + 'px)';
	});
});

$('.carousel-nav-cell').click(function () {
	flkty.stopPlayer();
});

var $gallery = $('.carousel').flickity();

function onLoadeddata(event) {
	var cell = $gallery.flickity('getParentCell', event.target);
	$gallery.flickity('cellSizeChange', cell && cell.element);
}

$gallery.find('video').each(function (i, video) {
	video.play();
	$(video).on('loadeddata', onLoadeddata);
});
/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Slideshow block (in content):
/*-------------------------------------------------*/
/*-------------------------------------------------*/
var $slideshow = $('.slideshow').flickity({
	//adaptiveHeight: true,
	imagesLoaded: true,
	lazyLoad: true
});

var slideshowflk = $slideshow.data('flickity');

$slideshow.on('select.flickity', function () {
	//console.log( 'Flickity select ' + slideshowflk.selectedIndex );
	//slideshowflk.reloadCells();

});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Start Foundation Orbit Slider:
/*-------------------------------------------------*/
/*-------------------------------------------------*/
// var sliderOptions = {
// 	containerClass: 'slider__slides',
// 	slideClass: 'slider__slide',
// 	nextClass: 'slider__nav--next',
// 	prevClass: 'slider__nav--previous',

// };


// var slider = new Foundation.Orbit($('.slider'), sliderOptions);

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Wrap every iframe in a flex video class to prevent layout breakage
/*-------------------------------------------------*/
/*-------------------------------------------------*/
$('iframe').each(function () {
	$(this).wrap("<div class='flex-video widescreen'></div>");
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Distinguish dropdowns on mobile/desktop:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

$('.nav__item--parent').click(function (event) {
	if (whatInput.ask() === 'touch') {
		// do touch input things
		if (!$(this).hasClass('nav__item--is-hovered')) {
			event.preventDefault();
			$('.nav__item--parent').removeClass('nav__item--is-hovered');
			$(this).toggleClass('nav__item--is-hovered');
		}
	} else if (whatInput.ask() === 'mouse') {
		// do mouse things
	}
});

//If anything in the main content container is clicked, remove faux hover class.
$('#main-content__container').click(function () {
	$('.nav__item').removeClass('nav__item--is-hovered');
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Site Search:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

function toggleSearchClasses() {
	$("body").toggleClass("body--search-active");
	$('.nav-collapse').removeClass('open');
	$('.nav__menu-icon').removeClass('is-clicked');
	$("#nav__menu-icon").removeClass("nav__menu-icon--menu-is-active");
	$("#site-search__form").toggleClass("site-search__form--is-inactive site-search__form--is-active");
	$("#site-search").toggleClass("site-search--is-inactive site-search--is-active");
	$(".header__screen").toggleClass("header__screen--grayscale");
	$(".main-content__container").toggleClass("main-content__container--grayscale");
	$(".nav__wrapper").toggleClass("nav__wrapper--grayscale");
	$(".nav__link--search").toggleClass("nav__link--search-is-active");

	//HACK: wait for 5ms before changing focus. I don't think I need this anymore actually..
	setTimeout(function () {
		$(".nav__wrapper").toggleClass("nav__wrapper--search-is-active");
	}, 5);

	$(".nav").toggleClass("nav--search-is-active");
}

$(".nav__link--search").click(function () {
	toggleSearchClasses();
	if ($("#mobile-nav__wrapper").hasClass("mobile-nav__wrapper--mobile-menu-is-active")) {
		toggleMobileMenuClasses();
		$("#site-search").appendTo('#header').addClass('site-search--mobile');
	}
	document.getElementById("site-search__input").focus();
});

$(".nav__link--search-cancel").click(function () {
	toggleSearchClasses();
	document.getElementById("site-search__input").blur();
});

//When search form is out of focus, deactivate it.
$("#site-search__form").focusout(function () {
	if ($("#site-search__form").hasClass("site-search__form--is-active")) {
		//Comment out the following line if you need to use WebKit/Blink inspector tool on the search (so it doesn't lose focus):
		//toggleSearchClasses();
	}
});

$('input#site-search__input').autocomplete({
	serviceUrl: baseHref + '/home/autoComplete',
	deferRequestBy: 100,
	triggerSelectOnValidInput: false,
	minChars: 2,
	autoSelectFirst: true,
	type: 'post',
	onSelect: function onSelect(suggestion) {
		$('#site-search__form').submit();
	}
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Mobile Search:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

if (Foundation.MediaQuery.atLeast('medium')) {
	// True if medium or large
	// False if small
	$("#site-search").addClass("site-search--desktop");
} else {
	$("#site-search").addClass("site-search--mobile");
}

$(".nav__toggle--search").click(function () {
	toggleSearchClasses();

	//append our site search div to the header.
	$("#site-search").appendTo('#header').addClass('site-search--mobile');
	document.getElementById("site-search__input").focus();
});

//If we're resizing from mobile to anything else, toggle the mobile search if it's active.
$(window).on('changed.zf.mediaquery', function (event, newSize, oldSize) {

	if (newSize == "medium") {
		//alert('hey');
		$("#site-search").removeClass("site-search--mobile");
		$("#site-search").addClass("site-search--desktop");

		$("#site-search").appendTo("#nav");

		if ($("#site-search").hasClass("site-search--is-active")) {
			// toggleSearchClasses();
		}
	} else if (newSize == "mobile") {
		$("#site-search").appendTo('#header');
		$("#site-search").removeClass("site-search--desktop");
		$("#site-search").addClass("site-search--mobile");
		if ($("#site-search").hasClass("site-search--is-active")) {
			// toggleSearchClasses();
		}
	}
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Mobile Nav:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

/* new stuff added my Brandon - lazy coding */
$('.nav__toggle--menu').on('click', function () {
	$('.nav__menu-icon').toggleClass('is-clicked');
	$("#nav__menu-icon").toggleClass("nav__menu-icon--menu-is-active");
	$('.nav-collapse').toggleClass('open');
});

$('.second-level--open').click(function () {
	$(this).parent().toggleClass('nav__item--opened');
	if ($(this).next().attr('aria-hidden') == 'true') {
		$(this).next().attr('aria-hidden', 'false');
	} else {
		$(this).next().attr('aria-hidden', 'true');
	}

	if ($(this).attr('aria-expanded') == 'false') {
		$(this).attr('aria-expanded', 'true');
	} else {
		$(this).next().attr('aria-expanded', 'false');
	}
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Background Video
/*-------------------------------------------------*/
/*-------------------------------------------------*/
$('.backgroundvideo__link').click(function (e) {
	var that = $(this);
	var video = that.data('video');
	var width = $('img', that).width();
	var height = $('img', that).height();
	that.parent().addClass('on');
	that.parent().prepend('<div class="flex-video widescreen"><iframe src="https://www.youtube.com/embed/' + video + '?rel=0&autoplay=1" width="' + width + '" height="' + height + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe></div>');
	that.hide();
	e.preventDefault();
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Automatic full height silder, not working yet..
/*-------------------------------------------------*/
/*-------------------------------------------------*/

// function setDimensions(){
//    var windowsHeight = $(window).height();

//    $('.orbit-container').css('height', windowsHeight + 'px');
//   // $('.orbit-container').css('max-height', windowsHeight + 'px');

//    $('.orbit-slide').css('height', windowsHeight + 'px');
//    $('.orbit-slide').css('max-height', windowsHeight + 'px');
// }

// $(window).resize(function() {
//     setDimensions();
// });

// setDimensions();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm5lc3QuanMiLCJmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlci5qcyIsImZvdW5kYXRpb24udXRpbC50b3VjaC5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24uYWNjb3JkaW9uLmpzIiwiZm91bmRhdGlvbi5pbnRlcmNoYW5nZS5qcyIsImZvdW5kYXRpb24ubWFnZWxsYW4uanMiLCJmb3VuZGF0aW9uLnRhYnMuanMiLCJsYXp5bG9hZC5qcyIsImZsaWNraXR5LnBrZ2QubWluLmpzIiwiZmxpY2tpdHliZy1sYXp5bG9hZC5qcyIsImpxdWVyeS1hdXRvY29tcGxldGUuanMiLCJhcHAuanMiXSwibmFtZXMiOlsiJCIsIkZPVU5EQVRJT05fVkVSU0lPTiIsIkZvdW5kYXRpb24iLCJ2ZXJzaW9uIiwiX3BsdWdpbnMiLCJfdXVpZHMiLCJydGwiLCJhdHRyIiwicGx1Z2luIiwibmFtZSIsImNsYXNzTmFtZSIsImZ1bmN0aW9uTmFtZSIsImF0dHJOYW1lIiwiaHlwaGVuYXRlIiwicmVnaXN0ZXJQbHVnaW4iLCJwbHVnaW5OYW1lIiwiY29uc3RydWN0b3IiLCJ0b0xvd2VyQ2FzZSIsInV1aWQiLCJHZXRZb0RpZ2l0cyIsIiRlbGVtZW50IiwiZGF0YSIsInRyaWdnZXIiLCJwdXNoIiwidW5yZWdpc3RlclBsdWdpbiIsInNwbGljZSIsImluZGV4T2YiLCJyZW1vdmVBdHRyIiwicmVtb3ZlRGF0YSIsInByb3AiLCJyZUluaXQiLCJwbHVnaW5zIiwiaXNKUSIsImVhY2giLCJfaW5pdCIsInR5cGUiLCJfdGhpcyIsImZucyIsInBsZ3MiLCJmb3JFYWNoIiwicCIsImZvdW5kYXRpb24iLCJPYmplY3QiLCJrZXlzIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwibGVuZ3RoIiwibmFtZXNwYWNlIiwiTWF0aCIsInJvdW5kIiwicG93IiwicmFuZG9tIiwidG9TdHJpbmciLCJzbGljZSIsInJlZmxvdyIsImVsZW0iLCJpIiwiJGVsZW0iLCJmaW5kIiwiYWRkQmFjayIsIiRlbCIsIm9wdHMiLCJ3YXJuIiwidGhpbmciLCJzcGxpdCIsImUiLCJvcHQiLCJtYXAiLCJlbCIsInRyaW0iLCJwYXJzZVZhbHVlIiwiZXIiLCJnZXRGbk5hbWUiLCJ0cmFuc2l0aW9uZW5kIiwidHJhbnNpdGlvbnMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJlbmQiLCJ0Iiwic3R5bGUiLCJzZXRUaW1lb3V0IiwidHJpZ2dlckhhbmRsZXIiLCJ1dGlsIiwidGhyb3R0bGUiLCJmdW5jIiwiZGVsYXkiLCJ0aW1lciIsImNvbnRleHQiLCJhcmdzIiwiYXJndW1lbnRzIiwiYXBwbHkiLCJtZXRob2QiLCIkbWV0YSIsIiRub0pTIiwiYXBwZW5kVG8iLCJoZWFkIiwicmVtb3ZlQ2xhc3MiLCJNZWRpYVF1ZXJ5IiwiQXJyYXkiLCJwcm90b3R5cGUiLCJjYWxsIiwicGx1Z0NsYXNzIiwidW5kZWZpbmVkIiwiUmVmZXJlbmNlRXJyb3IiLCJUeXBlRXJyb3IiLCJ3aW5kb3ciLCJmbiIsIkRhdGUiLCJub3ciLCJnZXRUaW1lIiwidmVuZG9ycyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInZwIiwiY2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJ0ZXN0IiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwibGFzdFRpbWUiLCJjYWxsYmFjayIsIm5leHRUaW1lIiwibWF4IiwiY2xlYXJUaW1lb3V0IiwicGVyZm9ybWFuY2UiLCJzdGFydCIsIkZ1bmN0aW9uIiwiYmluZCIsIm9UaGlzIiwiYUFyZ3MiLCJmVG9CaW5kIiwiZk5PUCIsImZCb3VuZCIsImNvbmNhdCIsImZ1bmNOYW1lUmVnZXgiLCJyZXN1bHRzIiwiZXhlYyIsInN0ciIsImlzTmFOIiwicGFyc2VGbG9hdCIsInJlcGxhY2UiLCJqUXVlcnkiLCJCb3giLCJJbU5vdFRvdWNoaW5nWW91IiwiR2V0RGltZW5zaW9ucyIsIkdldE9mZnNldHMiLCJlbGVtZW50IiwicGFyZW50IiwibHJPbmx5IiwidGJPbmx5IiwiZWxlRGltcyIsInRvcCIsImJvdHRvbSIsImxlZnQiLCJyaWdodCIsInBhckRpbXMiLCJvZmZzZXQiLCJoZWlnaHQiLCJ3aWR0aCIsIndpbmRvd0RpbXMiLCJhbGxEaXJzIiwiRXJyb3IiLCJyZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwicGFyUmVjdCIsInBhcmVudE5vZGUiLCJ3aW5SZWN0IiwiYm9keSIsIndpblkiLCJwYWdlWU9mZnNldCIsIndpblgiLCJwYWdlWE9mZnNldCIsInBhcmVudERpbXMiLCJhbmNob3IiLCJwb3NpdGlvbiIsInZPZmZzZXQiLCJoT2Zmc2V0IiwiaXNPdmVyZmxvdyIsIiRlbGVEaW1zIiwiJGFuY2hvckRpbXMiLCJrZXlDb2RlcyIsImNvbW1hbmRzIiwiS2V5Ym9hcmQiLCJnZXRLZXlDb2RlcyIsInBhcnNlS2V5IiwiZXZlbnQiLCJrZXkiLCJ3aGljaCIsImtleUNvZGUiLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJ0b1VwcGVyQ2FzZSIsInNoaWZ0S2V5IiwiY3RybEtleSIsImFsdEtleSIsImhhbmRsZUtleSIsImNvbXBvbmVudCIsImZ1bmN0aW9ucyIsImNvbW1hbmRMaXN0IiwiY21kcyIsImNvbW1hbmQiLCJsdHIiLCJleHRlbmQiLCJyZXR1cm5WYWx1ZSIsImhhbmRsZWQiLCJ1bmhhbmRsZWQiLCJmaW5kRm9jdXNhYmxlIiwiZmlsdGVyIiwiaXMiLCJyZWdpc3RlciIsImNvbXBvbmVudE5hbWUiLCJ0cmFwRm9jdXMiLCIkZm9jdXNhYmxlIiwiJGZpcnN0Rm9jdXNhYmxlIiwiZXEiLCIkbGFzdEZvY3VzYWJsZSIsIm9uIiwidGFyZ2V0IiwicHJldmVudERlZmF1bHQiLCJmb2N1cyIsInJlbGVhc2VGb2N1cyIsIm9mZiIsImtjcyIsImsiLCJrYyIsImRlZmF1bHRRdWVyaWVzIiwibGFuZHNjYXBlIiwicG9ydHJhaXQiLCJyZXRpbmEiLCJxdWVyaWVzIiwiY3VycmVudCIsInNlbGYiLCJleHRyYWN0ZWRTdHlsZXMiLCJjc3MiLCJuYW1lZFF1ZXJpZXMiLCJwYXJzZVN0eWxlVG9PYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsInZhbHVlIiwiX2dldEN1cnJlbnRTaXplIiwiX3dhdGNoZXIiLCJhdExlYXN0Iiwic2l6ZSIsInF1ZXJ5IiwiZ2V0IiwibWF0Y2hNZWRpYSIsIm1hdGNoZXMiLCJtYXRjaGVkIiwibmV3U2l6ZSIsImN1cnJlbnRTaXplIiwic3R5bGVNZWRpYSIsIm1lZGlhIiwic2NyaXB0IiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJpbmZvIiwiaWQiLCJpbnNlcnRCZWZvcmUiLCJnZXRDb21wdXRlZFN0eWxlIiwiY3VycmVudFN0eWxlIiwibWF0Y2hNZWRpdW0iLCJ0ZXh0Iiwic3R5bGVTaGVldCIsImNzc1RleHQiLCJ0ZXh0Q29udGVudCIsInN0eWxlT2JqZWN0IiwicmVkdWNlIiwicmV0IiwicGFyYW0iLCJwYXJ0cyIsInZhbCIsImRlY29kZVVSSUNvbXBvbmVudCIsImlzQXJyYXkiLCJpbml0Q2xhc3NlcyIsImFjdGl2ZUNsYXNzZXMiLCJNb3Rpb24iLCJhbmltYXRlSW4iLCJhbmltYXRpb24iLCJjYiIsImFuaW1hdGUiLCJhbmltYXRlT3V0IiwiTW92ZSIsImR1cmF0aW9uIiwiYW5pbSIsInByb2ciLCJtb3ZlIiwidHMiLCJpc0luIiwiaW5pdENsYXNzIiwiYWN0aXZlQ2xhc3MiLCJyZXNldCIsImFkZENsYXNzIiwic2hvdyIsIm9mZnNldFdpZHRoIiwib25lIiwiZmluaXNoIiwiaGlkZSIsInRyYW5zaXRpb25EdXJhdGlvbiIsIk5lc3QiLCJGZWF0aGVyIiwibWVudSIsIml0ZW1zIiwic3ViTWVudUNsYXNzIiwic3ViSXRlbUNsYXNzIiwiaGFzU3ViQ2xhc3MiLCIkaXRlbSIsIiRzdWIiLCJjaGlsZHJlbiIsIkJ1cm4iLCJUaW1lciIsIm9wdGlvbnMiLCJuYW1lU3BhY2UiLCJyZW1haW4iLCJpc1BhdXNlZCIsInJlc3RhcnQiLCJpbmZpbml0ZSIsInBhdXNlIiwib25JbWFnZXNMb2FkZWQiLCJpbWFnZXMiLCJ1bmxvYWRlZCIsImNvbXBsZXRlIiwicmVhZHlTdGF0ZSIsInNpbmdsZUltYWdlTG9hZGVkIiwic3JjIiwic3BvdFN3aXBlIiwiZW5hYmxlZCIsImRvY3VtZW50RWxlbWVudCIsIm1vdmVUaHJlc2hvbGQiLCJ0aW1lVGhyZXNob2xkIiwic3RhcnRQb3NYIiwic3RhcnRQb3NZIiwic3RhcnRUaW1lIiwiZWxhcHNlZFRpbWUiLCJpc01vdmluZyIsIm9uVG91Y2hFbmQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwib25Ub3VjaE1vdmUiLCJ4IiwidG91Y2hlcyIsInBhZ2VYIiwieSIsInBhZ2VZIiwiZHgiLCJkeSIsImRpciIsImFicyIsIm9uVG91Y2hTdGFydCIsImFkZEV2ZW50TGlzdGVuZXIiLCJpbml0IiwidGVhcmRvd24iLCJzcGVjaWFsIiwic3dpcGUiLCJzZXR1cCIsIm5vb3AiLCJhZGRUb3VjaCIsImhhbmRsZVRvdWNoIiwiY2hhbmdlZFRvdWNoZXMiLCJmaXJzdCIsImV2ZW50VHlwZXMiLCJ0b3VjaHN0YXJ0IiwidG91Y2htb3ZlIiwidG91Y2hlbmQiLCJzaW11bGF0ZWRFdmVudCIsIk1vdXNlRXZlbnQiLCJzY3JlZW5YIiwic2NyZWVuWSIsImNsaWVudFgiLCJjbGllbnRZIiwiY3JlYXRlRXZlbnQiLCJpbml0TW91c2VFdmVudCIsImRpc3BhdGNoRXZlbnQiLCJNdXRhdGlvbk9ic2VydmVyIiwicHJlZml4ZXMiLCJ0cmlnZ2VycyIsInN0b3BQcm9wYWdhdGlvbiIsImZhZGVPdXQiLCJjaGVja0xpc3RlbmVycyIsImV2ZW50c0xpc3RlbmVyIiwicmVzaXplTGlzdGVuZXIiLCJzY3JvbGxMaXN0ZW5lciIsImNsb3NlbWVMaXN0ZW5lciIsInlldGlCb3hlcyIsInBsdWdOYW1lcyIsImxpc3RlbmVycyIsImpvaW4iLCJwbHVnaW5JZCIsIm5vdCIsImRlYm91bmNlIiwiJG5vZGVzIiwibm9kZXMiLCJxdWVyeVNlbGVjdG9yQWxsIiwibGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbiIsIm11dGF0aW9uUmVjb3Jkc0xpc3QiLCIkdGFyZ2V0IiwiYXR0cmlidXRlTmFtZSIsImNsb3Nlc3QiLCJlbGVtZW50T2JzZXJ2ZXIiLCJvYnNlcnZlIiwiYXR0cmlidXRlcyIsImNoaWxkTGlzdCIsImNoYXJhY3RlckRhdGEiLCJzdWJ0cmVlIiwiYXR0cmlidXRlRmlsdGVyIiwiSUhlYXJZb3UiLCJBY2NvcmRpb24iLCJkZWZhdWx0cyIsIiR0YWJzIiwiaWR4IiwiJGNvbnRlbnQiLCJsaW5rSWQiLCIkaW5pdEFjdGl2ZSIsImZpcnN0VGltZUluaXQiLCJkb3duIiwiX2NoZWNrRGVlcExpbmsiLCJsb2NhdGlvbiIsImhhc2giLCIkbGluayIsIiRhbmNob3IiLCJoYXNDbGFzcyIsImRlZXBMaW5rU211ZGdlIiwibG9hZCIsInNjcm9sbFRvcCIsImRlZXBMaW5rU211ZGdlRGVsYXkiLCJkZWVwTGluayIsIl9ldmVudHMiLCIkdGFiQ29udGVudCIsInRvZ2dsZSIsIm5leHQiLCIkYSIsIm11bHRpRXhwYW5kIiwicHJldmlvdXMiLCJwcmV2IiwidXAiLCJ1cGRhdGVIaXN0b3J5IiwiaGlzdG9yeSIsInB1c2hTdGF0ZSIsInJlcGxhY2VTdGF0ZSIsImZpcnN0VGltZSIsIiRjdXJyZW50QWN0aXZlIiwic2xpZGVEb3duIiwic2xpZGVTcGVlZCIsIiRhdW50cyIsInNpYmxpbmdzIiwiYWxsb3dBbGxDbG9zZWQiLCJzbGlkZVVwIiwic3RvcCIsIkludGVyY2hhbmdlIiwicnVsZXMiLCJjdXJyZW50UGF0aCIsIl9hZGRCcmVha3BvaW50cyIsIl9nZW5lcmF0ZVJ1bGVzIiwiX3JlZmxvdyIsIm1hdGNoIiwicnVsZSIsInBhdGgiLCJTUEVDSUFMX1FVRVJJRVMiLCJydWxlc0xpc3QiLCJub2RlTmFtZSIsInJlc3BvbnNlIiwiaHRtbCIsIk1hZ2VsbGFuIiwiY2FsY1BvaW50cyIsIiR0YXJnZXRzIiwiJGxpbmtzIiwiJGFjdGl2ZSIsInNjcm9sbFBvcyIsInBhcnNlSW50IiwicG9pbnRzIiwid2luSGVpZ2h0IiwiaW5uZXJIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJkb2NIZWlnaHQiLCJzY3JvbGxIZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCIkdGFyIiwicHQiLCJ0aHJlc2hvbGQiLCJ0YXJnZXRQb2ludCIsIiRib2R5IiwiYW5pbWF0aW9uRHVyYXRpb24iLCJlYXNpbmciLCJhbmltYXRpb25FYXNpbmciLCJkZWVwTGlua2luZyIsInNjcm9sbFRvTG9jIiwiX3VwZGF0ZUFjdGl2ZSIsImFycml2YWwiLCJnZXRBdHRyaWJ1dGUiLCJsb2MiLCJfaW5UcmFuc2l0aW9uIiwiYmFyT2Zmc2V0Iiwid2luUG9zIiwiY3VySWR4IiwiaXNEb3duIiwiY3VyVmlzaWJsZSIsIlRhYnMiLCIkdGFiVGl0bGVzIiwibGlua0NsYXNzIiwiaXNBY3RpdmUiLCJsaW5rQWN0aXZlQ2xhc3MiLCJhdXRvRm9jdXMiLCJtYXRjaEhlaWdodCIsIiRpbWFnZXMiLCJfc2V0SGVpZ2h0Iiwic2VsZWN0VGFiIiwiX2FkZEtleUhhbmRsZXIiLCJfYWRkQ2xpY2tIYW5kbGVyIiwiX3NldEhlaWdodE1xSGFuZGxlciIsIl9oYW5kbGVUYWJDaGFuZ2UiLCIkZWxlbWVudHMiLCIkcHJldkVsZW1lbnQiLCIkbmV4dEVsZW1lbnQiLCJ3cmFwT25LZXlzIiwibGFzdCIsIm1pbiIsIm9wZW4iLCJoaXN0b3J5SGFuZGxlZCIsImFjdGl2ZUNvbGxhcHNlIiwiX2NvbGxhcHNlVGFiIiwiJG9sZFRhYiIsIiR0YWJMaW5rIiwiJHRhcmdldENvbnRlbnQiLCJfb3BlblRhYiIsInBhbmVsQWN0aXZlQ2xhc3MiLCIkdGFyZ2V0X2FuY2hvciIsImlkU3RyIiwicGFuZWxDbGFzcyIsInBhbmVsIiwidGVtcCIsIl9leHRlbmRzIiwiYXNzaWduIiwic291cmNlIiwiX3R5cGVvZiIsIlN5bWJvbCIsIml0ZXJhdG9yIiwib2JqIiwiZ2xvYmFsIiwiZmFjdG9yeSIsImV4cG9ydHMiLCJtb2R1bGUiLCJkZWZpbmUiLCJhbWQiLCJMYXp5TG9hZCIsImRlZmF1bHRTZXR0aW5ncyIsImVsZW1lbnRzX3NlbGVjdG9yIiwiY29udGFpbmVyIiwiZGF0YV9zcmMiLCJkYXRhX3NyY3NldCIsImNsYXNzX2xvYWRpbmciLCJjbGFzc19sb2FkZWQiLCJjbGFzc19lcnJvciIsImNsYXNzX2luaXRpYWwiLCJza2lwX2ludmlzaWJsZSIsImNhbGxiYWNrX2xvYWQiLCJjYWxsYmFja19lcnJvciIsImNhbGxiYWNrX3NldCIsImNhbGxiYWNrX3Byb2Nlc3NlZCIsImlzQm90IiwiY2FsbENhbGxiYWNrIiwiYXJndW1lbnQiLCJnZXRUb3BPZmZzZXQiLCJvd25lckRvY3VtZW50IiwiY2xpZW50VG9wIiwiaXNCZWxvd1ZpZXdwb3J0IiwiZm9sZCIsImdldExlZnRPZmZzZXQiLCJjbGllbnRMZWZ0IiwiaXNBdFJpZ2h0T2ZWaWV3cG9ydCIsImRvY3VtZW50V2lkdGgiLCJpbm5lcldpZHRoIiwiaXNBYm92ZVZpZXdwb3J0IiwiaXNBdExlZnRPZlZpZXdwb3J0IiwiaXNJbnNpZGVWaWV3cG9ydCIsImNyZWF0ZUluc3RhbmNlIiwiY2xhc3NPYmoiLCJpbnN0YW5jZSIsIkN1c3RvbUV2ZW50IiwiZGV0YWlsIiwiYXV0b0luaXRpYWxpemUiLCJvcHRzTGVuZ3RoIiwic2V0U291cmNlc0ZvclBpY3R1cmUiLCJzcmNzZXREYXRhQXR0cmlidXRlIiwicGFyZW50RWxlbWVudCIsInRhZ05hbWUiLCJwaWN0dXJlQ2hpbGQiLCJzb3VyY2VTcmNzZXQiLCJkYXRhc2V0Iiwic2V0QXR0cmlidXRlIiwic2V0U291cmNlcyIsInNyY0RhdGFBdHRyaWJ1dGUiLCJlbGVtZW50U3JjIiwiaW1nU3Jjc2V0IiwiYmFja2dyb3VuZEltYWdlIiwiaW5zdGFuY2VTZXR0aW5ncyIsIl9zZXR0aW5ncyIsIl9xdWVyeU9yaWdpbk5vZGUiLCJfcHJldmlvdXNMb29wVGltZSIsIl9sb29wVGltZW91dCIsIl9ib3VuZEhhbmRsZVNjcm9sbCIsImhhbmRsZVNjcm9sbCIsIl9pc0ZpcnN0TG9vcCIsInVwZGF0ZSIsIl9yZXZlYWwiLCJzZXR0aW5ncyIsImVycm9yQ2FsbGJhY2siLCJsb2FkQ2FsbGJhY2siLCJjbGFzc0xpc3QiLCJyZW1vdmUiLCJhZGQiLCJfbG9vcFRocm91Z2hFbGVtZW50cyIsImVsZW1lbnRzIiwiX2VsZW1lbnRzIiwiZWxlbWVudHNMZW5ndGgiLCJwcm9jZXNzZWRJbmRleGVzIiwiZmlyc3RMb29wIiwib2Zmc2V0UGFyZW50Iiwid2FzUHJvY2Vzc2VkIiwicG9wIiwiX3N0b3BTY3JvbGxIYW5kbGVyIiwiX3B1cmdlRWxlbWVudHMiLCJlbGVtZW50c1RvUHVyZ2UiLCJfc3RhcnRTY3JvbGxIYW5kbGVyIiwiX2lzSGFuZGxpbmdTY3JvbGwiLCJyZW1haW5pbmdUaW1lIiwiZGVzdHJveSIsImF1dG9Jbml0T3B0aW9ucyIsImxhenlMb2FkT3B0aW9ucyIsInJlcXVpcmUiLCJqUXVlcnlCcmlkZ2V0IiwibyIsImEiLCJsIiwibiIsInMiLCJoIiwiciIsImMiLCJjaGFyQXQiLCJkIiwib3B0aW9uIiwiaXNQbGFpbk9iamVjdCIsImJyaWRnZXQiLCJFdkVtaXR0ZXIiLCJvbmNlIiwiX29uY2VFdmVudHMiLCJlbWl0RXZlbnQiLCJnZXRTaXplIiwib3V0ZXJXaWR0aCIsIm91dGVySGVpZ2h0IiwicGFkZGluZyIsImJvcmRlclN0eWxlIiwiYm9yZGVyV2lkdGgiLCJib3hTaXppbmciLCJhcHBlbmRDaGlsZCIsImlzQm94U2l6ZU91dGVyIiwicmVtb3ZlQ2hpbGQiLCJxdWVyeVNlbGVjdG9yIiwibm9kZVR5cGUiLCJkaXNwbGF5IiwiaXNCb3JkZXJCb3giLCJ1IiwiZiIsInYiLCJwYWRkaW5nTGVmdCIsInBhZGRpbmdSaWdodCIsImciLCJwYWRkaW5nVG9wIiwicGFkZGluZ0JvdHRvbSIsIm0iLCJtYXJnaW5MZWZ0IiwibWFyZ2luUmlnaHQiLCJtYXJnaW5Ub3AiLCJtYXJnaW5Cb3R0b20iLCJTIiwiYm9yZGVyTGVmdFdpZHRoIiwiYm9yZGVyUmlnaHRXaWR0aCIsIkUiLCJib3JkZXJUb3BXaWR0aCIsImJvcmRlckJvdHRvbVdpZHRoIiwiYiIsIkMiLCJtYXRjaGVzU2VsZWN0b3IiLCJFbGVtZW50IiwiZml6enlVSVV0aWxzIiwibW9kdWxvIiwibWFrZUFycmF5IiwicmVtb3ZlRnJvbSIsImdldFBhcmVudCIsImdldFF1ZXJ5RWxlbWVudCIsImhhbmRsZUV2ZW50IiwiZmlsdGVyRmluZEVsZW1lbnRzIiwiSFRNTEVsZW1lbnQiLCJkZWJvdW5jZU1ldGhvZCIsImRvY1JlYWR5IiwidG9EYXNoZWQiLCJodG1sSW5pdCIsIkpTT04iLCJwYXJzZSIsIkZsaWNraXR5IiwiQ2VsbCIsImNyZWF0ZSIsInNoaWZ0Iiwib3JpZ2luU2lkZSIsInNldFBvc2l0aW9uIiwidXBkYXRlVGFyZ2V0IiwicmVuZGVyUG9zaXRpb24iLCJzZXREZWZhdWx0VGFyZ2V0IiwiY2VsbEFsaWduIiwiZ2V0UG9zaXRpb25WYWx1ZSIsIndyYXBTaGlmdCIsInNsaWRlYWJsZVdpZHRoIiwiU2xpZGUiLCJpc09yaWdpbkxlZnQiLCJjZWxscyIsImFkZENlbGwiLCJmaXJzdE1hcmdpbiIsImdldExhc3RDZWxsIiwic2VsZWN0IiwiY2hhbmdlU2VsZWN0ZWRDbGFzcyIsInVuc2VsZWN0IiwiZ2V0Q2VsbEVsZW1lbnRzIiwiYW5pbWF0ZVByb3RvdHlwZSIsIndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSIsInN0YXJ0QW5pbWF0aW9uIiwiaXNBbmltYXRpbmciLCJyZXN0aW5nRnJhbWVzIiwiYXBwbHlEcmFnRm9yY2UiLCJhcHBseVNlbGVjdGVkQXR0cmFjdGlvbiIsImludGVncmF0ZVBoeXNpY3MiLCJwb3NpdGlvblNsaWRlciIsInNldHRsZSIsInRyYW5zZm9ybSIsIndyYXBBcm91bmQiLCJzaGlmdFdyYXBDZWxscyIsImN1cnNvclBvc2l0aW9uIiwicmlnaHRUb0xlZnQiLCJzbGlkZXIiLCJzbGlkZXMiLCJzbGlkZXNXaWR0aCIsInBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCIsInNlbGVjdGVkU2xpZGUiLCJwZXJjZW50UG9zaXRpb24iLCJpc1BvaW50ZXJEb3duIiwiaXNGcmVlU2Nyb2xsaW5nIiwiX3NoaWZ0Q2VsbHMiLCJiZWZvcmVTaGlmdENlbGxzIiwiYWZ0ZXJTaGlmdENlbGxzIiwiX3Vuc2hpZnRDZWxscyIsInZlbG9jaXR5IiwiZ2V0RnJpY3Rpb25GYWN0b3IiLCJhcHBseUZvcmNlIiwiZ2V0UmVzdGluZ1Bvc2l0aW9uIiwiZHJhZ1giLCJzZWxlY3RlZEF0dHJhY3Rpb24iLCJmbGlja2l0eUdVSUQiLCJfY3JlYXRlIiwiYWNjZXNzaWJpbGl0eSIsImZyZWVTY3JvbGxGcmljdGlvbiIsImZyaWN0aW9uIiwibmFtZXNwYWNlSlF1ZXJ5RXZlbnRzIiwicmVzaXplIiwic2V0R2FsbGVyeVNpemUiLCJjcmVhdGVNZXRob2RzIiwiZ3VpZCIsInNlbGVjdGVkSW5kZXgiLCJ2aWV3cG9ydCIsIl9jcmVhdGVTbGlkZXIiLCJ3YXRjaENTUyIsImFjdGl2YXRlIiwiX2ZpbHRlckZpbmRDZWxsRWxlbWVudHMiLCJyZWxvYWRDZWxscyIsInRhYkluZGV4IiwiaW5pdGlhbEluZGV4IiwiaXNJbml0QWN0aXZhdGVkIiwiY2VsbFNlbGVjdG9yIiwiX21ha2VDZWxscyIsInBvc2l0aW9uQ2VsbHMiLCJfZ2V0V3JhcFNoaWZ0Q2VsbHMiLCJnZXRMYXN0U2xpZGUiLCJfc2l6ZUNlbGxzIiwiX3Bvc2l0aW9uQ2VsbHMiLCJtYXhDZWxsSGVpZ2h0IiwidXBkYXRlU2xpZGVzIiwiX2NvbnRhaW5TbGlkZXMiLCJfZ2V0Q2FuQ2VsbEZpdCIsInVwZGF0ZVNlbGVjdGVkU2xpZGUiLCJncm91cENlbGxzIiwicmVwb3NpdGlvbiIsInNldENlbGxBbGlnbiIsImNlbnRlciIsImFkYXB0aXZlSGVpZ2h0IiwiX2dldEdhcENlbGxzIiwiY29udGFpbiIsIkV2ZW50IiwiX3dyYXBTZWxlY3QiLCJpc0RyYWdTZWxlY3QiLCJ1bnNlbGVjdFNlbGVjdGVkU2xpZGUiLCJzZWxlY3RlZENlbGxzIiwic2VsZWN0ZWRFbGVtZW50cyIsInNlbGVjdGVkQ2VsbCIsInNlbGVjdGVkRWxlbWVudCIsInNlbGVjdENlbGwiLCJnZXRDZWxsIiwiZ2V0Q2VsbHMiLCJnZXRQYXJlbnRDZWxsIiwiZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHMiLCJ1aUNoYW5nZSIsImNoaWxkVUlQb2ludGVyRG93biIsIm9ucmVzaXplIiwiY29udGVudCIsImRlYWN0aXZhdGUiLCJvbmtleWRvd24iLCJhY3RpdmVFbGVtZW50IiwicmVtb3ZlQXR0cmlidXRlIiwiVW5pcG9pbnRlciIsImJpbmRTdGFydEV2ZW50IiwiX2JpbmRTdGFydEV2ZW50IiwidW5iaW5kU3RhcnRFdmVudCIsInBvaW50ZXJFbmFibGVkIiwibXNQb2ludGVyRW5hYmxlZCIsImdldFRvdWNoIiwiaWRlbnRpZmllciIsInBvaW50ZXJJZGVudGlmaWVyIiwib25tb3VzZWRvd24iLCJidXR0b24iLCJfcG9pbnRlckRvd24iLCJvbnRvdWNoc3RhcnQiLCJvbk1TUG9pbnRlckRvd24iLCJvbnBvaW50ZXJkb3duIiwicG9pbnRlcklkIiwicG9pbnRlckRvd24iLCJfYmluZFBvc3RTdGFydEV2ZW50cyIsIm1vdXNlZG93biIsInBvaW50ZXJkb3duIiwiTVNQb2ludGVyRG93biIsIl9ib3VuZFBvaW50ZXJFdmVudHMiLCJfdW5iaW5kUG9zdFN0YXJ0RXZlbnRzIiwib25tb3VzZW1vdmUiLCJfcG9pbnRlck1vdmUiLCJvbk1TUG9pbnRlck1vdmUiLCJvbnBvaW50ZXJtb3ZlIiwib250b3VjaG1vdmUiLCJwb2ludGVyTW92ZSIsIm9ubW91c2V1cCIsIl9wb2ludGVyVXAiLCJvbk1TUG9pbnRlclVwIiwib25wb2ludGVydXAiLCJvbnRvdWNoZW5kIiwiX3BvaW50ZXJEb25lIiwicG9pbnRlclVwIiwicG9pbnRlckRvbmUiLCJvbk1TUG9pbnRlckNhbmNlbCIsIm9ucG9pbnRlcmNhbmNlbCIsIl9wb2ludGVyQ2FuY2VsIiwib250b3VjaGNhbmNlbCIsInBvaW50ZXJDYW5jZWwiLCJnZXRQb2ludGVyUG9pbnQiLCJVbmlkcmFnZ2VyIiwiYmluZEhhbmRsZXMiLCJfYmluZEhhbmRsZXMiLCJ1bmJpbmRIYW5kbGVzIiwidG91Y2hBY3Rpb24iLCJtc1RvdWNoQWN0aW9uIiwiaGFuZGxlcyIsIl9kcmFnUG9pbnRlckRvd24iLCJibHVyIiwicG9pbnRlckRvd25Qb2ludCIsImNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93biIsIl9kcmFnUG9pbnRlck1vdmUiLCJfZHJhZ01vdmUiLCJpc0RyYWdnaW5nIiwiaGFzRHJhZ1N0YXJ0ZWQiLCJfZHJhZ1N0YXJ0IiwiX2RyYWdQb2ludGVyVXAiLCJfZHJhZ0VuZCIsIl9zdGF0aWNDbGljayIsImRyYWdTdGFydFBvaW50IiwiaXNQcmV2ZW50aW5nQ2xpY2tzIiwiZHJhZ1N0YXJ0IiwiZHJhZ01vdmUiLCJkcmFnRW5kIiwib25jbGljayIsImlzSWdub3JpbmdNb3VzZVVwIiwic3RhdGljQ2xpY2siLCJkcmFnZ2FibGUiLCJkcmFnVGhyZXNob2xkIiwiX2NyZWF0ZURyYWciLCJiaW5kRHJhZyIsIl91aUNoYW5nZURyYWciLCJfY2hpbGRVSVBvaW50ZXJEb3duRHJhZyIsInVuYmluZERyYWciLCJpc0RyYWdCb3VuZCIsInBvaW50ZXJEb3duRm9jdXMiLCJURVhUQVJFQSIsIklOUFVUIiwiT1BUSU9OIiwicmFkaW8iLCJjaGVja2JveCIsInN1Ym1pdCIsImltYWdlIiwiZmlsZSIsInBvaW50ZXJEb3duU2Nyb2xsIiwiU0VMRUNUIiwic2Nyb2xsVG8iLCJpc1RvdWNoU2Nyb2xsaW5nIiwiZHJhZ1N0YXJ0UG9zaXRpb24iLCJwcmV2aW91c0RyYWdYIiwiZHJhZ01vdmVUaW1lIiwiZnJlZVNjcm9sbCIsImRyYWdFbmRSZXN0aW5nU2VsZWN0IiwiZHJhZ0VuZEJvb3N0U2VsZWN0IiwiZ2V0U2xpZGVEaXN0YW5jZSIsIl9nZXRDbG9zZXN0UmVzdGluZyIsImRpc3RhbmNlIiwiaW5kZXgiLCJmbG9vciIsIm9uc2Nyb2xsIiwiVGFwTGlzdGVuZXIiLCJiaW5kVGFwIiwidW5iaW5kVGFwIiwidGFwRWxlbWVudCIsImRpcmVjdGlvbiIsIngwIiwieDEiLCJ5MSIsIngyIiwieTIiLCJ4MyIsImlzRW5hYmxlZCIsImlzUHJldmlvdXMiLCJpc0xlZnQiLCJkaXNhYmxlIiwiY3JlYXRlU1ZHIiwib25UYXAiLCJjcmVhdGVFbGVtZW50TlMiLCJhcnJvd1NoYXBlIiwiZW5hYmxlIiwiZGlzYWJsZWQiLCJwcmV2TmV4dEJ1dHRvbnMiLCJfY3JlYXRlUHJldk5leHRCdXR0b25zIiwicHJldkJ1dHRvbiIsIm5leHRCdXR0b24iLCJhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyIsImRlYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMiLCJQcmV2TmV4dEJ1dHRvbiIsImhvbGRlciIsImRvdHMiLCJzZXREb3RzIiwiYWRkRG90cyIsInJlbW92ZURvdHMiLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwidXBkYXRlU2VsZWN0ZWQiLCJzZWxlY3RlZERvdCIsIlBhZ2VEb3RzIiwicGFnZURvdHMiLCJfY3JlYXRlUGFnZURvdHMiLCJhY3RpdmF0ZVBhZ2VEb3RzIiwidXBkYXRlU2VsZWN0ZWRQYWdlRG90cyIsInVwZGF0ZVBhZ2VEb3RzIiwiZGVhY3RpdmF0ZVBhZ2VEb3RzIiwic3RhdGUiLCJvblZpc2liaWxpdHlDaGFuZ2UiLCJ2aXNpYmlsaXR5Q2hhbmdlIiwib25WaXNpYmlsaXR5UGxheSIsInZpc2liaWxpdHlQbGF5IiwicGxheSIsInRpY2siLCJhdXRvUGxheSIsImNsZWFyIiwidGltZW91dCIsInVucGF1c2UiLCJwYXVzZUF1dG9QbGF5T25Ib3ZlciIsIl9jcmVhdGVQbGF5ZXIiLCJwbGF5ZXIiLCJhY3RpdmF0ZVBsYXllciIsInN0b3BQbGF5ZXIiLCJkZWFjdGl2YXRlUGxheWVyIiwicGxheVBsYXllciIsInBhdXNlUGxheWVyIiwidW5wYXVzZVBsYXllciIsIm9ubW91c2VlbnRlciIsIm9ubW91c2VsZWF2ZSIsIlBsYXllciIsImluc2VydCIsIl9jZWxsQWRkZWRSZW1vdmVkIiwiYXBwZW5kIiwicHJlcGVuZCIsImNlbGxDaGFuZ2UiLCJjZWxsU2l6ZUNoYW5nZSIsImltZyIsImZsaWNraXR5IiwiX2NyZWF0ZUxhenlsb2FkIiwibGF6eUxvYWQiLCJvbmxvYWQiLCJvbmVycm9yIiwiTGF6eUxvYWRlciIsIl9jcmVhdGVBc05hdkZvciIsImFjdGl2YXRlQXNOYXZGb3IiLCJkZWFjdGl2YXRlQXNOYXZGb3IiLCJkZXN0cm95QXNOYXZGb3IiLCJhc05hdkZvciIsInNldE5hdkNvbXBhbmlvbiIsIm5hdkNvbXBhbmlvbiIsIm9uTmF2Q29tcGFuaW9uU2VsZWN0IiwibmF2Q29tcGFuaW9uU2VsZWN0Iiwib25OYXZTdGF0aWNDbGljayIsInJlbW92ZU5hdlNlbGVjdGVkRWxlbWVudHMiLCJuYXZTZWxlY3RlZEVsZW1lbnRzIiwiY2hhbmdlTmF2U2VsZWN0ZWRDbGFzcyIsImltYWdlc0xvYWRlZCIsImdldEltYWdlcyIsImpxRGVmZXJyZWQiLCJEZWZlcnJlZCIsImNoZWNrIiwidXJsIiwiSW1hZ2UiLCJhZGRFbGVtZW50SW1hZ2VzIiwiYWRkSW1hZ2UiLCJiYWNrZ3JvdW5kIiwiYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMiLCJhZGRCYWNrZ3JvdW5kIiwicHJvZ3Jlc3MiLCJwcm9ncmVzc2VkQ291bnQiLCJoYXNBbnlCcm9rZW4iLCJpc0xvYWRlZCIsIm5vdGlmeSIsImRlYnVnIiwibG9nIiwiaXNDb21wbGV0ZSIsImdldElzSW1hZ2VDb21wbGV0ZSIsImNvbmZpcm0iLCJuYXR1cmFsV2lkdGgiLCJwcm94eUltYWdlIiwidW5iaW5kRXZlbnRzIiwibWFrZUpRdWVyeVBsdWdpbiIsInByb21pc2UiLCJfY3JlYXRlSW1hZ2VzTG9hZGVkIiwidXRpbHMiLCJwcm90byIsIl9jcmVhdGVCZ0xhenlMb2FkIiwiYmdMYXp5TG9hZCIsImFkakNvdW50IiwiY2VsbEVsZW1zIiwiY2VsbEVsZW0iLCJiZ0xhenlMb2FkRWxlbSIsImoiLCJCZ0xhenlMb2FkZXIiLCJlc2NhcGVSZWdFeENoYXJzIiwiY3JlYXRlTm9kZSIsImNvbnRhaW5lckNsYXNzIiwiZGl2IiwiRVNDIiwiVEFCIiwiUkVUVVJOIiwiTEVGVCIsIlVQIiwiUklHSFQiLCJET1dOIiwiQXV0b2NvbXBsZXRlIiwidGhhdCIsImFqYXhTZXR0aW5ncyIsImF1dG9TZWxlY3RGaXJzdCIsInNlcnZpY2VVcmwiLCJsb29rdXAiLCJvblNlbGVjdCIsIm1pbkNoYXJzIiwibWF4SGVpZ2h0IiwiZGVmZXJSZXF1ZXN0QnkiLCJwYXJhbXMiLCJmb3JtYXRSZXN1bHQiLCJkZWxpbWl0ZXIiLCJ6SW5kZXgiLCJub0NhY2hlIiwib25TZWFyY2hTdGFydCIsIm9uU2VhcmNoQ29tcGxldGUiLCJvblNlYXJjaEVycm9yIiwicHJlc2VydmVJbnB1dCIsInRhYkRpc2FibGVkIiwiZGF0YVR5cGUiLCJjdXJyZW50UmVxdWVzdCIsInRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQiLCJwcmV2ZW50QmFkUXVlcmllcyIsImxvb2t1cEZpbHRlciIsInN1Z2dlc3Rpb24iLCJvcmlnaW5hbFF1ZXJ5IiwicXVlcnlMb3dlckNhc2UiLCJwYXJhbU5hbWUiLCJ0cmFuc2Zvcm1SZXN1bHQiLCJwYXJzZUpTT04iLCJzaG93Tm9TdWdnZXN0aW9uTm90aWNlIiwibm9TdWdnZXN0aW9uTm90aWNlIiwib3JpZW50YXRpb24iLCJmb3JjZUZpeFBvc2l0aW9uIiwic3VnZ2VzdGlvbnMiLCJiYWRRdWVyaWVzIiwiY3VycmVudFZhbHVlIiwiaW50ZXJ2YWxJZCIsImNhY2hlZFJlc3BvbnNlIiwib25DaGFuZ2VJbnRlcnZhbCIsIm9uQ2hhbmdlIiwiaXNMb2NhbCIsInN1Z2dlc3Rpb25zQ29udGFpbmVyIiwibm9TdWdnZXN0aW9uc0NvbnRhaW5lciIsImNsYXNzZXMiLCJzZWxlY3RlZCIsImhpbnQiLCJoaW50VmFsdWUiLCJzZWxlY3Rpb24iLCJpbml0aWFsaXplIiwic2V0T3B0aW9ucyIsInBhdHRlcm4iLCJSZWdFeHAiLCJraWxsZXJGbiIsInN1Z2dlc3Rpb25TZWxlY3RvciIsImtpbGxTdWdnZXN0aW9ucyIsImRpc2FibGVLaWxsZXJGbiIsImZpeFBvc2l0aW9uQ2FwdHVyZSIsInZpc2libGUiLCJmaXhQb3NpdGlvbiIsIm9uS2V5UHJlc3MiLCJvbktleVVwIiwib25CbHVyIiwib25Gb2N1cyIsIm9uVmFsdWVDaGFuZ2UiLCJlbmFibGVLaWxsZXJGbiIsImFib3J0QWpheCIsImFib3J0Iiwic3VwcGxpZWRPcHRpb25zIiwidmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQiLCJ2YWxpZGF0ZU9yaWVudGF0aW9uIiwiY2xlYXJDYWNoZSIsImNsZWFySW50ZXJ2YWwiLCIkY29udGFpbmVyIiwiY29udGFpbmVyUGFyZW50Iiwic2l0ZVNlYXJjaERpdiIsImNvbnRhaW5lckhlaWdodCIsInN0eWxlcyIsInZpZXdQb3J0SGVpZ2h0IiwidG9wT3ZlcmZsb3ciLCJib3R0b21PdmVyZmxvdyIsIm9wYWNpdHkiLCJwYXJlbnRPZmZzZXREaWZmIiwic3RvcEtpbGxTdWdnZXN0aW9ucyIsInNldEludGVydmFsIiwiaXNDdXJzb3JBdEVuZCIsInZhbExlbmd0aCIsInNlbGVjdGlvblN0YXJ0IiwicmFuZ2UiLCJjcmVhdGVSYW5nZSIsIm1vdmVTdGFydCIsInN1Z2dlc3QiLCJvbkhpbnQiLCJzZWxlY3RIaW50IiwibW92ZVVwIiwibW92ZURvd24iLCJzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24iLCJmaW5kQmVzdEhpbnQiLCJnZXRRdWVyeSIsIm9uSW52YWxpZGF0ZVNlbGVjdGlvbiIsImlzRXhhY3RNYXRjaCIsImdldFN1Z2dlc3Rpb25zIiwiZ2V0U3VnZ2VzdGlvbnNMb2NhbCIsImxpbWl0IiwibG9va3VwTGltaXQiLCJncmVwIiwicSIsImNhY2hlS2V5IiwiaWdub3JlUGFyYW1zIiwiaXNGdW5jdGlvbiIsImlzQmFkUXVlcnkiLCJhamF4IiwiZG9uZSIsInJlc3VsdCIsInByb2Nlc3NSZXNwb25zZSIsImZhaWwiLCJqcVhIUiIsInRleHRTdGF0dXMiLCJlcnJvclRocm93biIsIm9uSGlkZSIsInNpZ25hbEhpbnQiLCJub1N1Z2dlc3Rpb25zIiwiZ3JvdXBCeSIsImNsYXNzU2VsZWN0ZWQiLCJiZWZvcmVSZW5kZXIiLCJjYXRlZ29yeSIsImZvcm1hdEdyb3VwIiwiY3VycmVudENhdGVnb3J5IiwiYWRqdXN0Q29udGFpbmVyV2lkdGgiLCJkZXRhY2giLCJlbXB0eSIsImJlc3RNYXRjaCIsImZvdW5kTWF0Y2giLCJzdWJzdHIiLCJmYWxsYmFjayIsImluQXJyYXkiLCJhY3RpdmVJdGVtIiwiYWRqdXN0U2Nyb2xsIiwib2Zmc2V0VG9wIiwidXBwZXJCb3VuZCIsImxvd2VyQm91bmQiLCJoZWlnaHREZWx0YSIsImdldFZhbHVlIiwib25TZWxlY3RDYWxsYmFjayIsImRpc3Bvc2UiLCJhdXRvY29tcGxldGUiLCJkZXZicmlkZ2VBdXRvY29tcGxldGUiLCJkYXRhS2V5IiwiaW5wdXRFbGVtZW50IiwiYmFzZXMiLCJiYXNlSHJlZiIsImhyZWYiLCJteUxhenlMb2FkIiwiJGNhcm91c2VsIiwiJGltZ3MiLCJkb2NTdHlsZSIsInRyYW5zZm9ybVByb3AiLCJmbGt0eSIsInNsaWRlIiwiY2xpY2siLCIkZ2FsbGVyeSIsIm9uTG9hZGVkZGF0YSIsImNlbGwiLCJ2aWRlbyIsIiRzbGlkZXNob3ciLCJzbGlkZXNob3dmbGsiLCJ3cmFwIiwid2hhdElucHV0IiwiYXNrIiwidG9nZ2xlQ2xhc3MiLCJ0b2dnbGVTZWFyY2hDbGFzc2VzIiwidG9nZ2xlTW9iaWxlTWVudUNsYXNzZXMiLCJnZXRFbGVtZW50QnlJZCIsImZvY3Vzb3V0Iiwib2xkU2l6ZSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDaFZBLENBQUMsVUFBU0EsQ0FBVCxFQUFZOztBQUViOztBQUVBLE1BQUlDLHFCQUFxQixPQUF6Qjs7QUFFQTtBQUNBO0FBQ0EsTUFBSUMsYUFBYTtBQUNmQyxhQUFTRixrQkFETTs7QUFHZjs7O0FBR0FHLGNBQVUsRUFOSzs7QUFRZjs7O0FBR0FDLFlBQVEsRUFYTzs7QUFhZjs7O0FBR0FDLFNBQUssZUFBVTtBQUNiLGFBQU9OLEVBQUUsTUFBRixFQUFVTyxJQUFWLENBQWUsS0FBZixNQUEwQixLQUFqQztBQUNELEtBbEJjO0FBbUJmOzs7O0FBSUFDLFlBQVEsZ0JBQVNBLE9BQVQsRUFBaUJDLElBQWpCLEVBQXVCO0FBQzdCO0FBQ0E7QUFDQSxVQUFJQyxZQUFhRCxRQUFRRSxhQUFhSCxPQUFiLENBQXpCO0FBQ0E7QUFDQTtBQUNBLFVBQUlJLFdBQVlDLFVBQVVILFNBQVYsQ0FBaEI7O0FBRUE7QUFDQSxXQUFLTixRQUFMLENBQWNRLFFBQWQsSUFBMEIsS0FBS0YsU0FBTCxJQUFrQkYsT0FBNUM7QUFDRCxLQWpDYztBQWtDZjs7Ozs7Ozs7O0FBU0FNLG9CQUFnQix3QkFBU04sTUFBVCxFQUFpQkMsSUFBakIsRUFBc0I7QUFDcEMsVUFBSU0sYUFBYU4sT0FBT0ksVUFBVUosSUFBVixDQUFQLEdBQXlCRSxhQUFhSCxPQUFPUSxXQUFwQixFQUFpQ0MsV0FBakMsRUFBMUM7QUFDQVQsYUFBT1UsSUFBUCxHQUFjLEtBQUtDLFdBQUwsQ0FBaUIsQ0FBakIsRUFBb0JKLFVBQXBCLENBQWQ7O0FBRUEsVUFBRyxDQUFDUCxPQUFPWSxRQUFQLENBQWdCYixJQUFoQixXQUE2QlEsVUFBN0IsQ0FBSixFQUErQztBQUFFUCxlQUFPWSxRQUFQLENBQWdCYixJQUFoQixXQUE2QlEsVUFBN0IsRUFBMkNQLE9BQU9VLElBQWxEO0FBQTBEO0FBQzNHLFVBQUcsQ0FBQ1YsT0FBT1ksUUFBUCxDQUFnQkMsSUFBaEIsQ0FBcUIsVUFBckIsQ0FBSixFQUFxQztBQUFFYixlQUFPWSxRQUFQLENBQWdCQyxJQUFoQixDQUFxQixVQUFyQixFQUFpQ2IsTUFBakM7QUFBMkM7QUFDNUU7Ozs7QUFJTkEsYUFBT1ksUUFBUCxDQUFnQkUsT0FBaEIsY0FBbUNQLFVBQW5DOztBQUVBLFdBQUtWLE1BQUwsQ0FBWWtCLElBQVosQ0FBaUJmLE9BQU9VLElBQXhCOztBQUVBO0FBQ0QsS0ExRGM7QUEyRGY7Ozs7Ozs7O0FBUUFNLHNCQUFrQiwwQkFBU2hCLE1BQVQsRUFBZ0I7QUFDaEMsVUFBSU8sYUFBYUYsVUFBVUYsYUFBYUgsT0FBT1ksUUFBUCxDQUFnQkMsSUFBaEIsQ0FBcUIsVUFBckIsRUFBaUNMLFdBQTlDLENBQVYsQ0FBakI7O0FBRUEsV0FBS1gsTUFBTCxDQUFZb0IsTUFBWixDQUFtQixLQUFLcEIsTUFBTCxDQUFZcUIsT0FBWixDQUFvQmxCLE9BQU9VLElBQTNCLENBQW5CLEVBQXFELENBQXJEO0FBQ0FWLGFBQU9ZLFFBQVAsQ0FBZ0JPLFVBQWhCLFdBQW1DWixVQUFuQyxFQUFpRGEsVUFBakQsQ0FBNEQsVUFBNUQ7QUFDTTs7OztBQUROLE9BS09OLE9BTFAsbUJBSytCUCxVQUwvQjtBQU1BLFdBQUksSUFBSWMsSUFBUixJQUFnQnJCLE1BQWhCLEVBQXVCO0FBQ3JCQSxlQUFPcUIsSUFBUCxJQUFlLElBQWYsQ0FEcUIsQ0FDRDtBQUNyQjtBQUNEO0FBQ0QsS0FqRmM7O0FBbUZmOzs7Ozs7QUFNQ0MsWUFBUSxnQkFBU0MsT0FBVCxFQUFpQjtBQUN2QixVQUFJQyxPQUFPRCxtQkFBbUIvQixDQUE5QjtBQUNBLFVBQUc7QUFDRCxZQUFHZ0MsSUFBSCxFQUFRO0FBQ05ELGtCQUFRRSxJQUFSLENBQWEsWUFBVTtBQUNyQmpDLGNBQUUsSUFBRixFQUFRcUIsSUFBUixDQUFhLFVBQWIsRUFBeUJhLEtBQXpCO0FBQ0QsV0FGRDtBQUdELFNBSkQsTUFJSztBQUNILGNBQUlDLGNBQWNKLE9BQWQseUNBQWNBLE9BQWQsQ0FBSjtBQUFBLGNBQ0FLLFFBQVEsSUFEUjtBQUFBLGNBRUFDLE1BQU07QUFDSixzQkFBVSxnQkFBU0MsSUFBVCxFQUFjO0FBQ3RCQSxtQkFBS0MsT0FBTCxDQUFhLFVBQVNDLENBQVQsRUFBVztBQUN0QkEsb0JBQUkzQixVQUFVMkIsQ0FBVixDQUFKO0FBQ0F4QyxrQkFBRSxXQUFVd0MsQ0FBVixHQUFhLEdBQWYsRUFBb0JDLFVBQXBCLENBQStCLE9BQS9CO0FBQ0QsZUFIRDtBQUlELGFBTkc7QUFPSixzQkFBVSxrQkFBVTtBQUNsQlYsd0JBQVVsQixVQUFVa0IsT0FBVixDQUFWO0FBQ0EvQixnQkFBRSxXQUFVK0IsT0FBVixHQUFtQixHQUFyQixFQUEwQlUsVUFBMUIsQ0FBcUMsT0FBckM7QUFDRCxhQVZHO0FBV0oseUJBQWEscUJBQVU7QUFDckIsbUJBQUssUUFBTCxFQUFlQyxPQUFPQyxJQUFQLENBQVlQLE1BQU1oQyxRQUFsQixDQUFmO0FBQ0Q7QUFiRyxXQUZOO0FBaUJBaUMsY0FBSUYsSUFBSixFQUFVSixPQUFWO0FBQ0Q7QUFDRixPQXpCRCxDQXlCQyxPQUFNYSxHQUFOLEVBQVU7QUFDVEMsZ0JBQVFDLEtBQVIsQ0FBY0YsR0FBZDtBQUNELE9BM0JELFNBMkJRO0FBQ04sZUFBT2IsT0FBUDtBQUNEO0FBQ0YsS0F6SGE7O0FBMkhmOzs7Ozs7OztBQVFBWixpQkFBYSxxQkFBUzRCLE1BQVQsRUFBaUJDLFNBQWpCLEVBQTJCO0FBQ3RDRCxlQUFTQSxVQUFVLENBQW5CO0FBQ0EsYUFBT0UsS0FBS0MsS0FBTCxDQUFZRCxLQUFLRSxHQUFMLENBQVMsRUFBVCxFQUFhSixTQUFTLENBQXRCLElBQTJCRSxLQUFLRyxNQUFMLEtBQWdCSCxLQUFLRSxHQUFMLENBQVMsRUFBVCxFQUFhSixNQUFiLENBQXZELEVBQThFTSxRQUE5RSxDQUF1RixFQUF2RixFQUEyRkMsS0FBM0YsQ0FBaUcsQ0FBakcsS0FBdUdOLGtCQUFnQkEsU0FBaEIsR0FBOEIsRUFBckksQ0FBUDtBQUNELEtBdEljO0FBdUlmOzs7OztBQUtBTyxZQUFRLGdCQUFTQyxJQUFULEVBQWV6QixPQUFmLEVBQXdCOztBQUU5QjtBQUNBLFVBQUksT0FBT0EsT0FBUCxLQUFtQixXQUF2QixFQUFvQztBQUNsQ0Esa0JBQVVXLE9BQU9DLElBQVAsQ0FBWSxLQUFLdkMsUUFBakIsQ0FBVjtBQUNEO0FBQ0Q7QUFIQSxXQUlLLElBQUksT0FBTzJCLE9BQVAsS0FBbUIsUUFBdkIsRUFBaUM7QUFDcENBLG9CQUFVLENBQUNBLE9BQUQsQ0FBVjtBQUNEOztBQUVELFVBQUlLLFFBQVEsSUFBWjs7QUFFQTtBQUNBcEMsUUFBRWlDLElBQUYsQ0FBT0YsT0FBUCxFQUFnQixVQUFTMEIsQ0FBVCxFQUFZaEQsSUFBWixFQUFrQjtBQUNoQztBQUNBLFlBQUlELFNBQVM0QixNQUFNaEMsUUFBTixDQUFlSyxJQUFmLENBQWI7O0FBRUE7QUFDQSxZQUFJaUQsUUFBUTFELEVBQUV3RCxJQUFGLEVBQVFHLElBQVIsQ0FBYSxXQUFTbEQsSUFBVCxHQUFjLEdBQTNCLEVBQWdDbUQsT0FBaEMsQ0FBd0MsV0FBU25ELElBQVQsR0FBYyxHQUF0RCxDQUFaOztBQUVBO0FBQ0FpRCxjQUFNekIsSUFBTixDQUFXLFlBQVc7QUFDcEIsY0FBSTRCLE1BQU03RCxFQUFFLElBQUYsQ0FBVjtBQUFBLGNBQ0k4RCxPQUFPLEVBRFg7QUFFQTtBQUNBLGNBQUlELElBQUl4QyxJQUFKLENBQVMsVUFBVCxDQUFKLEVBQTBCO0FBQ3hCd0Isb0JBQVFrQixJQUFSLENBQWEseUJBQXVCdEQsSUFBdkIsR0FBNEIsc0RBQXpDO0FBQ0E7QUFDRDs7QUFFRCxjQUFHb0QsSUFBSXRELElBQUosQ0FBUyxjQUFULENBQUgsRUFBNEI7QUFDMUIsZ0JBQUl5RCxRQUFRSCxJQUFJdEQsSUFBSixDQUFTLGNBQVQsRUFBeUIwRCxLQUF6QixDQUErQixHQUEvQixFQUFvQzFCLE9BQXBDLENBQTRDLFVBQVMyQixDQUFULEVBQVlULENBQVosRUFBYztBQUNwRSxrQkFBSVUsTUFBTUQsRUFBRUQsS0FBRixDQUFRLEdBQVIsRUFBYUcsR0FBYixDQUFpQixVQUFTQyxFQUFULEVBQVk7QUFBRSx1QkFBT0EsR0FBR0MsSUFBSCxFQUFQO0FBQW1CLGVBQWxELENBQVY7QUFDQSxrQkFBR0gsSUFBSSxDQUFKLENBQUgsRUFBV0wsS0FBS0ssSUFBSSxDQUFKLENBQUwsSUFBZUksV0FBV0osSUFBSSxDQUFKLENBQVgsQ0FBZjtBQUNaLGFBSFcsQ0FBWjtBQUlEO0FBQ0QsY0FBRztBQUNETixnQkFBSXhDLElBQUosQ0FBUyxVQUFULEVBQXFCLElBQUliLE1BQUosQ0FBV1IsRUFBRSxJQUFGLENBQVgsRUFBb0I4RCxJQUFwQixDQUFyQjtBQUNELFdBRkQsQ0FFQyxPQUFNVSxFQUFOLEVBQVM7QUFDUjNCLG9CQUFRQyxLQUFSLENBQWMwQixFQUFkO0FBQ0QsV0FKRCxTQUlRO0FBQ047QUFDRDtBQUNGLFNBdEJEO0FBdUJELE9BL0JEO0FBZ0NELEtBMUxjO0FBMkxmQyxlQUFXOUQsWUEzTEk7QUE0TGYrRCxtQkFBZSx1QkFBU2hCLEtBQVQsRUFBZTtBQUM1QixVQUFJaUIsY0FBYztBQUNoQixzQkFBYyxlQURFO0FBRWhCLDRCQUFvQixxQkFGSjtBQUdoQix5QkFBaUIsZUFIRDtBQUloQix1QkFBZTtBQUpDLE9BQWxCO0FBTUEsVUFBSW5CLE9BQU9vQixTQUFTQyxhQUFULENBQXVCLEtBQXZCLENBQVg7QUFBQSxVQUNJQyxHQURKOztBQUdBLFdBQUssSUFBSUMsQ0FBVCxJQUFjSixXQUFkLEVBQTBCO0FBQ3hCLFlBQUksT0FBT25CLEtBQUt3QixLQUFMLENBQVdELENBQVgsQ0FBUCxLQUF5QixXQUE3QixFQUF5QztBQUN2Q0QsZ0JBQU1ILFlBQVlJLENBQVosQ0FBTjtBQUNEO0FBQ0Y7QUFDRCxVQUFHRCxHQUFILEVBQU87QUFDTCxlQUFPQSxHQUFQO0FBQ0QsT0FGRCxNQUVLO0FBQ0hBLGNBQU1HLFdBQVcsWUFBVTtBQUN6QnZCLGdCQUFNd0IsY0FBTixDQUFxQixlQUFyQixFQUFzQyxDQUFDeEIsS0FBRCxDQUF0QztBQUNELFNBRkssRUFFSCxDQUZHLENBQU47QUFHQSxlQUFPLGVBQVA7QUFDRDtBQUNGO0FBbk5jLEdBQWpCOztBQXNOQXhELGFBQVdpRixJQUFYLEdBQWtCO0FBQ2hCOzs7Ozs7O0FBT0FDLGNBQVUsa0JBQVVDLElBQVYsRUFBZ0JDLEtBQWhCLEVBQXVCO0FBQy9CLFVBQUlDLFFBQVEsSUFBWjs7QUFFQSxhQUFPLFlBQVk7QUFDakIsWUFBSUMsVUFBVSxJQUFkO0FBQUEsWUFBb0JDLE9BQU9DLFNBQTNCOztBQUVBLFlBQUlILFVBQVUsSUFBZCxFQUFvQjtBQUNsQkEsa0JBQVFOLFdBQVcsWUFBWTtBQUM3QkksaUJBQUtNLEtBQUwsQ0FBV0gsT0FBWCxFQUFvQkMsSUFBcEI7QUFDQUYsb0JBQVEsSUFBUjtBQUNELFdBSE8sRUFHTEQsS0FISyxDQUFSO0FBSUQ7QUFDRixPQVREO0FBVUQ7QUFyQmUsR0FBbEI7O0FBd0JBO0FBQ0E7QUFDQTs7OztBQUlBLE1BQUk3QyxhQUFhLFNBQWJBLFVBQWEsQ0FBU21ELE1BQVQsRUFBaUI7QUFDaEMsUUFBSXpELGNBQWN5RCxNQUFkLHlDQUFjQSxNQUFkLENBQUo7QUFBQSxRQUNJQyxRQUFRN0YsRUFBRSxvQkFBRixDQURaO0FBQUEsUUFFSThGLFFBQVE5RixFQUFFLFFBQUYsQ0FGWjs7QUFJQSxRQUFHLENBQUM2RixNQUFNOUMsTUFBVixFQUFpQjtBQUNmL0MsUUFBRSw4QkFBRixFQUFrQytGLFFBQWxDLENBQTJDbkIsU0FBU29CLElBQXBEO0FBQ0Q7QUFDRCxRQUFHRixNQUFNL0MsTUFBVCxFQUFnQjtBQUNkK0MsWUFBTUcsV0FBTixDQUFrQixPQUFsQjtBQUNEOztBQUVELFFBQUc5RCxTQUFTLFdBQVosRUFBd0I7QUFBQztBQUN2QmpDLGlCQUFXZ0csVUFBWCxDQUFzQmhFLEtBQXRCO0FBQ0FoQyxpQkFBV3FELE1BQVgsQ0FBa0IsSUFBbEI7QUFDRCxLQUhELE1BR00sSUFBR3BCLFNBQVMsUUFBWixFQUFxQjtBQUFDO0FBQzFCLFVBQUlzRCxPQUFPVSxNQUFNQyxTQUFOLENBQWdCOUMsS0FBaEIsQ0FBc0IrQyxJQUF0QixDQUEyQlgsU0FBM0IsRUFBc0MsQ0FBdEMsQ0FBWCxDQUR5QixDQUMyQjtBQUNwRCxVQUFJWSxZQUFZLEtBQUtqRixJQUFMLENBQVUsVUFBVixDQUFoQixDQUZ5QixDQUVhOztBQUV0QyxVQUFHaUYsY0FBY0MsU0FBZCxJQUEyQkQsVUFBVVYsTUFBVixNQUFzQlcsU0FBcEQsRUFBOEQ7QUFBQztBQUM3RCxZQUFHLEtBQUt4RCxNQUFMLEtBQWdCLENBQW5CLEVBQXFCO0FBQUM7QUFDbEJ1RCxvQkFBVVYsTUFBVixFQUFrQkQsS0FBbEIsQ0FBd0JXLFNBQXhCLEVBQW1DYixJQUFuQztBQUNILFNBRkQsTUFFSztBQUNILGVBQUt4RCxJQUFMLENBQVUsVUFBU3dCLENBQVQsRUFBWVksRUFBWixFQUFlO0FBQUM7QUFDeEJpQyxzQkFBVVYsTUFBVixFQUFrQkQsS0FBbEIsQ0FBd0IzRixFQUFFcUUsRUFBRixFQUFNaEQsSUFBTixDQUFXLFVBQVgsQ0FBeEIsRUFBZ0RvRSxJQUFoRDtBQUNELFdBRkQ7QUFHRDtBQUNGLE9BUkQsTUFRSztBQUFDO0FBQ0osY0FBTSxJQUFJZSxjQUFKLENBQW1CLG1CQUFtQlosTUFBbkIsR0FBNEIsbUNBQTVCLElBQW1FVSxZQUFZM0YsYUFBYTJGLFNBQWIsQ0FBWixHQUFzQyxjQUF6RyxJQUEySCxHQUE5SSxDQUFOO0FBQ0Q7QUFDRixLQWZLLE1BZUQ7QUFBQztBQUNKLFlBQU0sSUFBSUcsU0FBSixvQkFBOEJ0RSxJQUE5QixrR0FBTjtBQUNEO0FBQ0QsV0FBTyxJQUFQO0FBQ0QsR0FsQ0Q7O0FBb0NBdUUsU0FBT3hHLFVBQVAsR0FBb0JBLFVBQXBCO0FBQ0FGLElBQUUyRyxFQUFGLENBQUtsRSxVQUFMLEdBQWtCQSxVQUFsQjs7QUFFQTtBQUNBLEdBQUMsWUFBVztBQUNWLFFBQUksQ0FBQ21FLEtBQUtDLEdBQU4sSUFBYSxDQUFDSCxPQUFPRSxJQUFQLENBQVlDLEdBQTlCLEVBQ0VILE9BQU9FLElBQVAsQ0FBWUMsR0FBWixHQUFrQkQsS0FBS0MsR0FBTCxHQUFXLFlBQVc7QUFBRSxhQUFPLElBQUlELElBQUosR0FBV0UsT0FBWCxFQUFQO0FBQThCLEtBQXhFOztBQUVGLFFBQUlDLFVBQVUsQ0FBQyxRQUFELEVBQVcsS0FBWCxDQUFkO0FBQ0EsU0FBSyxJQUFJdEQsSUFBSSxDQUFiLEVBQWdCQSxJQUFJc0QsUUFBUWhFLE1BQVosSUFBc0IsQ0FBQzJELE9BQU9NLHFCQUE5QyxFQUFxRSxFQUFFdkQsQ0FBdkUsRUFBMEU7QUFDdEUsVUFBSXdELEtBQUtGLFFBQVF0RCxDQUFSLENBQVQ7QUFDQWlELGFBQU9NLHFCQUFQLEdBQStCTixPQUFPTyxLQUFHLHVCQUFWLENBQS9CO0FBQ0FQLGFBQU9RLG9CQUFQLEdBQStCUixPQUFPTyxLQUFHLHNCQUFWLEtBQ0RQLE9BQU9PLEtBQUcsNkJBQVYsQ0FEOUI7QUFFSDtBQUNELFFBQUksdUJBQXVCRSxJQUF2QixDQUE0QlQsT0FBT1UsU0FBUCxDQUFpQkMsU0FBN0MsS0FDQyxDQUFDWCxPQUFPTSxxQkFEVCxJQUNrQyxDQUFDTixPQUFPUSxvQkFEOUMsRUFDb0U7QUFDbEUsVUFBSUksV0FBVyxDQUFmO0FBQ0FaLGFBQU9NLHFCQUFQLEdBQStCLFVBQVNPLFFBQVQsRUFBbUI7QUFDOUMsWUFBSVYsTUFBTUQsS0FBS0MsR0FBTCxFQUFWO0FBQ0EsWUFBSVcsV0FBV3ZFLEtBQUt3RSxHQUFMLENBQVNILFdBQVcsRUFBcEIsRUFBd0JULEdBQXhCLENBQWY7QUFDQSxlQUFPNUIsV0FBVyxZQUFXO0FBQUVzQyxtQkFBU0QsV0FBV0UsUUFBcEI7QUFBZ0MsU0FBeEQsRUFDV0EsV0FBV1gsR0FEdEIsQ0FBUDtBQUVILE9BTEQ7QUFNQUgsYUFBT1Esb0JBQVAsR0FBOEJRLFlBQTlCO0FBQ0Q7QUFDRDs7O0FBR0EsUUFBRyxDQUFDaEIsT0FBT2lCLFdBQVIsSUFBdUIsQ0FBQ2pCLE9BQU9pQixXQUFQLENBQW1CZCxHQUE5QyxFQUFrRDtBQUNoREgsYUFBT2lCLFdBQVAsR0FBcUI7QUFDbkJDLGVBQU9oQixLQUFLQyxHQUFMLEVBRFk7QUFFbkJBLGFBQUssZUFBVTtBQUFFLGlCQUFPRCxLQUFLQyxHQUFMLEtBQWEsS0FBS2UsS0FBekI7QUFBaUM7QUFGL0IsT0FBckI7QUFJRDtBQUNGLEdBL0JEO0FBZ0NBLE1BQUksQ0FBQ0MsU0FBU3pCLFNBQVQsQ0FBbUIwQixJQUF4QixFQUE4QjtBQUM1QkQsYUFBU3pCLFNBQVQsQ0FBbUIwQixJQUFuQixHQUEwQixVQUFTQyxLQUFULEVBQWdCO0FBQ3hDLFVBQUksT0FBTyxJQUFQLEtBQWdCLFVBQXBCLEVBQWdDO0FBQzlCO0FBQ0E7QUFDQSxjQUFNLElBQUl0QixTQUFKLENBQWMsc0VBQWQsQ0FBTjtBQUNEOztBQUVELFVBQUl1QixRQUFVN0IsTUFBTUMsU0FBTixDQUFnQjlDLEtBQWhCLENBQXNCK0MsSUFBdEIsQ0FBMkJYLFNBQTNCLEVBQXNDLENBQXRDLENBQWQ7QUFBQSxVQUNJdUMsVUFBVSxJQURkO0FBQUEsVUFFSUMsT0FBVSxTQUFWQSxJQUFVLEdBQVcsQ0FBRSxDQUYzQjtBQUFBLFVBR0lDLFNBQVUsU0FBVkEsTUFBVSxHQUFXO0FBQ25CLGVBQU9GLFFBQVF0QyxLQUFSLENBQWMsZ0JBQWdCdUMsSUFBaEIsR0FDWixJQURZLEdBRVpILEtBRkYsRUFHQUMsTUFBTUksTUFBTixDQUFhakMsTUFBTUMsU0FBTixDQUFnQjlDLEtBQWhCLENBQXNCK0MsSUFBdEIsQ0FBMkJYLFNBQTNCLENBQWIsQ0FIQSxDQUFQO0FBSUQsT0FSTDs7QUFVQSxVQUFJLEtBQUtVLFNBQVQsRUFBb0I7QUFDbEI7QUFDQThCLGFBQUs5QixTQUFMLEdBQWlCLEtBQUtBLFNBQXRCO0FBQ0Q7QUFDRCtCLGFBQU8vQixTQUFQLEdBQW1CLElBQUk4QixJQUFKLEVBQW5COztBQUVBLGFBQU9DLE1BQVA7QUFDRCxLQXhCRDtBQXlCRDtBQUNEO0FBQ0EsV0FBU3hILFlBQVQsQ0FBc0JnRyxFQUF0QixFQUEwQjtBQUN4QixRQUFJa0IsU0FBU3pCLFNBQVQsQ0FBbUIzRixJQUFuQixLQUE0QjhGLFNBQWhDLEVBQTJDO0FBQ3pDLFVBQUk4QixnQkFBZ0Isd0JBQXBCO0FBQ0EsVUFBSUMsVUFBV0QsYUFBRCxDQUFnQkUsSUFBaEIsQ0FBc0I1QixFQUFELENBQUt0RCxRQUFMLEVBQXJCLENBQWQ7QUFDQSxhQUFRaUYsV0FBV0EsUUFBUXZGLE1BQVIsR0FBaUIsQ0FBN0IsR0FBa0N1RixRQUFRLENBQVIsRUFBV2hFLElBQVgsRUFBbEMsR0FBc0QsRUFBN0Q7QUFDRCxLQUpELE1BS0ssSUFBSXFDLEdBQUdQLFNBQUgsS0FBaUJHLFNBQXJCLEVBQWdDO0FBQ25DLGFBQU9JLEdBQUczRixXQUFILENBQWVQLElBQXRCO0FBQ0QsS0FGSSxNQUdBO0FBQ0gsYUFBT2tHLEdBQUdQLFNBQUgsQ0FBYXBGLFdBQWIsQ0FBeUJQLElBQWhDO0FBQ0Q7QUFDRjtBQUNELFdBQVM4RCxVQUFULENBQW9CaUUsR0FBcEIsRUFBd0I7QUFDdEIsUUFBSSxXQUFXQSxHQUFmLEVBQW9CLE9BQU8sSUFBUCxDQUFwQixLQUNLLElBQUksWUFBWUEsR0FBaEIsRUFBcUIsT0FBTyxLQUFQLENBQXJCLEtBQ0EsSUFBSSxDQUFDQyxNQUFNRCxNQUFNLENBQVosQ0FBTCxFQUFxQixPQUFPRSxXQUFXRixHQUFYLENBQVA7QUFDMUIsV0FBT0EsR0FBUDtBQUNEO0FBQ0Q7QUFDQTtBQUNBLFdBQVMzSCxTQUFULENBQW1CMkgsR0FBbkIsRUFBd0I7QUFDdEIsV0FBT0EsSUFBSUcsT0FBSixDQUFZLGlCQUFaLEVBQStCLE9BQS9CLEVBQXdDMUgsV0FBeEMsRUFBUDtBQUNEO0FBRUEsQ0F6WEEsQ0F5WEMySCxNQXpYRCxDQUFEO0FDQUE7O0FBRUEsQ0FBQyxVQUFTNUksQ0FBVCxFQUFZOztBQUViRSxhQUFXMkksR0FBWCxHQUFpQjtBQUNmQyxzQkFBa0JBLGdCQURIO0FBRWZDLG1CQUFlQSxhQUZBO0FBR2ZDLGdCQUFZQTs7QUFHZDs7Ozs7Ozs7OztBQU5pQixHQUFqQixDQWdCQSxTQUFTRixnQkFBVCxDQUEwQkcsT0FBMUIsRUFBbUNDLE1BQW5DLEVBQTJDQyxNQUEzQyxFQUFtREMsTUFBbkQsRUFBMkQ7QUFDekQsUUFBSUMsVUFBVU4sY0FBY0UsT0FBZCxDQUFkO0FBQUEsUUFDSUssR0FESjtBQUFBLFFBQ1NDLE1BRFQ7QUFBQSxRQUNpQkMsSUFEakI7QUFBQSxRQUN1QkMsS0FEdkI7O0FBR0EsUUFBSVAsTUFBSixFQUFZO0FBQ1YsVUFBSVEsVUFBVVgsY0FBY0csTUFBZCxDQUFkOztBQUVBSyxlQUFVRixRQUFRTSxNQUFSLENBQWVMLEdBQWYsR0FBcUJELFFBQVFPLE1BQTdCLElBQXVDRixRQUFRRSxNQUFSLEdBQWlCRixRQUFRQyxNQUFSLENBQWVMLEdBQWpGO0FBQ0FBLFlBQVVELFFBQVFNLE1BQVIsQ0FBZUwsR0FBZixJQUFzQkksUUFBUUMsTUFBUixDQUFlTCxHQUEvQztBQUNBRSxhQUFVSCxRQUFRTSxNQUFSLENBQWVILElBQWYsSUFBdUJFLFFBQVFDLE1BQVIsQ0FBZUgsSUFBaEQ7QUFDQUMsY0FBVUosUUFBUU0sTUFBUixDQUFlSCxJQUFmLEdBQXNCSCxRQUFRUSxLQUE5QixJQUF1Q0gsUUFBUUcsS0FBUixHQUFnQkgsUUFBUUMsTUFBUixDQUFlSCxJQUFoRjtBQUNELEtBUEQsTUFRSztBQUNIRCxlQUFVRixRQUFRTSxNQUFSLENBQWVMLEdBQWYsR0FBcUJELFFBQVFPLE1BQTdCLElBQXVDUCxRQUFRUyxVQUFSLENBQW1CRixNQUFuQixHQUE0QlAsUUFBUVMsVUFBUixDQUFtQkgsTUFBbkIsQ0FBMEJMLEdBQXZHO0FBQ0FBLFlBQVVELFFBQVFNLE1BQVIsQ0FBZUwsR0FBZixJQUFzQkQsUUFBUVMsVUFBUixDQUFtQkgsTUFBbkIsQ0FBMEJMLEdBQTFEO0FBQ0FFLGFBQVVILFFBQVFNLE1BQVIsQ0FBZUgsSUFBZixJQUF1QkgsUUFBUVMsVUFBUixDQUFtQkgsTUFBbkIsQ0FBMEJILElBQTNEO0FBQ0FDLGNBQVVKLFFBQVFNLE1BQVIsQ0FBZUgsSUFBZixHQUFzQkgsUUFBUVEsS0FBOUIsSUFBdUNSLFFBQVFTLFVBQVIsQ0FBbUJELEtBQXBFO0FBQ0Q7O0FBRUQsUUFBSUUsVUFBVSxDQUFDUixNQUFELEVBQVNELEdBQVQsRUFBY0UsSUFBZCxFQUFvQkMsS0FBcEIsQ0FBZDs7QUFFQSxRQUFJTixNQUFKLEVBQVk7QUFDVixhQUFPSyxTQUFTQyxLQUFULEtBQW1CLElBQTFCO0FBQ0Q7O0FBRUQsUUFBSUwsTUFBSixFQUFZO0FBQ1YsYUFBT0UsUUFBUUMsTUFBUixLQUFtQixJQUExQjtBQUNEOztBQUVELFdBQU9RLFFBQVFySSxPQUFSLENBQWdCLEtBQWhCLE1BQTJCLENBQUMsQ0FBbkM7QUFDRDs7QUFFRDs7Ozs7OztBQU9BLFdBQVNxSCxhQUFULENBQXVCdkYsSUFBdkIsRUFBNkIyRCxJQUE3QixFQUFrQztBQUNoQzNELFdBQU9BLEtBQUtULE1BQUwsR0FBY1MsS0FBSyxDQUFMLENBQWQsR0FBd0JBLElBQS9COztBQUVBLFFBQUlBLFNBQVNrRCxNQUFULElBQW1CbEQsU0FBU29CLFFBQWhDLEVBQTBDO0FBQ3hDLFlBQU0sSUFBSW9GLEtBQUosQ0FBVSw4Q0FBVixDQUFOO0FBQ0Q7O0FBRUQsUUFBSUMsT0FBT3pHLEtBQUswRyxxQkFBTCxFQUFYO0FBQUEsUUFDSUMsVUFBVTNHLEtBQUs0RyxVQUFMLENBQWdCRixxQkFBaEIsRUFEZDtBQUFBLFFBRUlHLFVBQVV6RixTQUFTMEYsSUFBVCxDQUFjSixxQkFBZCxFQUZkO0FBQUEsUUFHSUssT0FBTzdELE9BQU84RCxXQUhsQjtBQUFBLFFBSUlDLE9BQU8vRCxPQUFPZ0UsV0FKbEI7O0FBTUEsV0FBTztBQUNMYixhQUFPSSxLQUFLSixLQURQO0FBRUxELGNBQVFLLEtBQUtMLE1BRlI7QUFHTEQsY0FBUTtBQUNOTCxhQUFLVyxLQUFLWCxHQUFMLEdBQVdpQixJQURWO0FBRU5mLGNBQU1TLEtBQUtULElBQUwsR0FBWWlCO0FBRlosT0FISDtBQU9MRSxrQkFBWTtBQUNWZCxlQUFPTSxRQUFRTixLQURMO0FBRVZELGdCQUFRTyxRQUFRUCxNQUZOO0FBR1ZELGdCQUFRO0FBQ05MLGVBQUthLFFBQVFiLEdBQVIsR0FBY2lCLElBRGI7QUFFTmYsZ0JBQU1XLFFBQVFYLElBQVIsR0FBZWlCO0FBRmY7QUFIRSxPQVBQO0FBZUxYLGtCQUFZO0FBQ1ZELGVBQU9RLFFBQVFSLEtBREw7QUFFVkQsZ0JBQVFTLFFBQVFULE1BRk47QUFHVkQsZ0JBQVE7QUFDTkwsZUFBS2lCLElBREM7QUFFTmYsZ0JBQU1pQjtBQUZBO0FBSEU7QUFmUCxLQUFQO0FBd0JEOztBQUVEOzs7Ozs7Ozs7Ozs7QUFZQSxXQUFTekIsVUFBVCxDQUFvQkMsT0FBcEIsRUFBNkIyQixNQUE3QixFQUFxQ0MsUUFBckMsRUFBK0NDLE9BQS9DLEVBQXdEQyxPQUF4RCxFQUFpRUMsVUFBakUsRUFBNkU7QUFDM0UsUUFBSUMsV0FBV2xDLGNBQWNFLE9BQWQsQ0FBZjtBQUFBLFFBQ0lpQyxjQUFjTixTQUFTN0IsY0FBYzZCLE1BQWQsQ0FBVCxHQUFpQyxJQURuRDs7QUFHQSxZQUFRQyxRQUFSO0FBQ0UsV0FBSyxLQUFMO0FBQ0UsZUFBTztBQUNMckIsZ0JBQU90SixXQUFXSSxHQUFYLEtBQW1CNEssWUFBWXZCLE1BQVosQ0FBbUJILElBQW5CLEdBQTBCeUIsU0FBU3BCLEtBQW5DLEdBQTJDcUIsWUFBWXJCLEtBQTFFLEdBQWtGcUIsWUFBWXZCLE1BQVosQ0FBbUJILElBRHZHO0FBRUxGLGVBQUs0QixZQUFZdkIsTUFBWixDQUFtQkwsR0FBbkIsSUFBMEIyQixTQUFTckIsTUFBVCxHQUFrQmtCLE9BQTVDO0FBRkEsU0FBUDtBQUlBO0FBQ0YsV0FBSyxNQUFMO0FBQ0UsZUFBTztBQUNMdEIsZ0JBQU0wQixZQUFZdkIsTUFBWixDQUFtQkgsSUFBbkIsSUFBMkJ5QixTQUFTcEIsS0FBVCxHQUFpQmtCLE9BQTVDLENBREQ7QUFFTHpCLGVBQUs0QixZQUFZdkIsTUFBWixDQUFtQkw7QUFGbkIsU0FBUDtBQUlBO0FBQ0YsV0FBSyxPQUFMO0FBQ0UsZUFBTztBQUNMRSxnQkFBTTBCLFlBQVl2QixNQUFaLENBQW1CSCxJQUFuQixHQUEwQjBCLFlBQVlyQixLQUF0QyxHQUE4Q2tCLE9BRC9DO0FBRUx6QixlQUFLNEIsWUFBWXZCLE1BQVosQ0FBbUJMO0FBRm5CLFNBQVA7QUFJQTtBQUNGLFdBQUssWUFBTDtBQUNFLGVBQU87QUFDTEUsZ0JBQU8wQixZQUFZdkIsTUFBWixDQUFtQkgsSUFBbkIsR0FBMkIwQixZQUFZckIsS0FBWixHQUFvQixDQUFoRCxHQUF1RG9CLFNBQVNwQixLQUFULEdBQWlCLENBRHpFO0FBRUxQLGVBQUs0QixZQUFZdkIsTUFBWixDQUFtQkwsR0FBbkIsSUFBMEIyQixTQUFTckIsTUFBVCxHQUFrQmtCLE9BQTVDO0FBRkEsU0FBUDtBQUlBO0FBQ0YsV0FBSyxlQUFMO0FBQ0UsZUFBTztBQUNMdEIsZ0JBQU13QixhQUFhRCxPQUFiLEdBQXlCRyxZQUFZdkIsTUFBWixDQUFtQkgsSUFBbkIsR0FBMkIwQixZQUFZckIsS0FBWixHQUFvQixDQUFoRCxHQUF1RG9CLFNBQVNwQixLQUFULEdBQWlCLENBRGpHO0FBRUxQLGVBQUs0QixZQUFZdkIsTUFBWixDQUFtQkwsR0FBbkIsR0FBeUI0QixZQUFZdEIsTUFBckMsR0FBOENrQjtBQUY5QyxTQUFQO0FBSUE7QUFDRixXQUFLLGFBQUw7QUFDRSxlQUFPO0FBQ0x0QixnQkFBTTBCLFlBQVl2QixNQUFaLENBQW1CSCxJQUFuQixJQUEyQnlCLFNBQVNwQixLQUFULEdBQWlCa0IsT0FBNUMsQ0FERDtBQUVMekIsZUFBTTRCLFlBQVl2QixNQUFaLENBQW1CTCxHQUFuQixHQUEwQjRCLFlBQVl0QixNQUFaLEdBQXFCLENBQWhELEdBQXVEcUIsU0FBU3JCLE1BQVQsR0FBa0I7QUFGekUsU0FBUDtBQUlBO0FBQ0YsV0FBSyxjQUFMO0FBQ0UsZUFBTztBQUNMSixnQkFBTTBCLFlBQVl2QixNQUFaLENBQW1CSCxJQUFuQixHQUEwQjBCLFlBQVlyQixLQUF0QyxHQUE4Q2tCLE9BQTlDLEdBQXdELENBRHpEO0FBRUx6QixlQUFNNEIsWUFBWXZCLE1BQVosQ0FBbUJMLEdBQW5CLEdBQTBCNEIsWUFBWXRCLE1BQVosR0FBcUIsQ0FBaEQsR0FBdURxQixTQUFTckIsTUFBVCxHQUFrQjtBQUZ6RSxTQUFQO0FBSUE7QUFDRixXQUFLLFFBQUw7QUFDRSxlQUFPO0FBQ0xKLGdCQUFPeUIsU0FBU25CLFVBQVQsQ0FBb0JILE1BQXBCLENBQTJCSCxJQUEzQixHQUFtQ3lCLFNBQVNuQixVQUFULENBQW9CRCxLQUFwQixHQUE0QixDQUFoRSxHQUF1RW9CLFNBQVNwQixLQUFULEdBQWlCLENBRHpGO0FBRUxQLGVBQU0yQixTQUFTbkIsVUFBVCxDQUFvQkgsTUFBcEIsQ0FBMkJMLEdBQTNCLEdBQWtDMkIsU0FBU25CLFVBQVQsQ0FBb0JGLE1BQXBCLEdBQTZCLENBQWhFLEdBQXVFcUIsU0FBU3JCLE1BQVQsR0FBa0I7QUFGekYsU0FBUDtBQUlBO0FBQ0YsV0FBSyxRQUFMO0FBQ0UsZUFBTztBQUNMSixnQkFBTSxDQUFDeUIsU0FBU25CLFVBQVQsQ0FBb0JELEtBQXBCLEdBQTRCb0IsU0FBU3BCLEtBQXRDLElBQStDLENBRGhEO0FBRUxQLGVBQUsyQixTQUFTbkIsVUFBVCxDQUFvQkgsTUFBcEIsQ0FBMkJMLEdBQTNCLEdBQWlDd0I7QUFGakMsU0FBUDtBQUlGLFdBQUssYUFBTDtBQUNFLGVBQU87QUFDTHRCLGdCQUFNeUIsU0FBU25CLFVBQVQsQ0FBb0JILE1BQXBCLENBQTJCSCxJQUQ1QjtBQUVMRixlQUFLMkIsU0FBU25CLFVBQVQsQ0FBb0JILE1BQXBCLENBQTJCTDtBQUYzQixTQUFQO0FBSUE7QUFDRixXQUFLLGFBQUw7QUFDRSxlQUFPO0FBQ0xFLGdCQUFNMEIsWUFBWXZCLE1BQVosQ0FBbUJILElBRHBCO0FBRUxGLGVBQUs0QixZQUFZdkIsTUFBWixDQUFtQkwsR0FBbkIsR0FBeUI0QixZQUFZdEIsTUFBckMsR0FBOENrQjtBQUY5QyxTQUFQO0FBSUE7QUFDRixXQUFLLGNBQUw7QUFDRSxlQUFPO0FBQ0x0QixnQkFBTTBCLFlBQVl2QixNQUFaLENBQW1CSCxJQUFuQixHQUEwQjBCLFlBQVlyQixLQUF0QyxHQUE4Q2tCLE9BQTlDLEdBQXdERSxTQUFTcEIsS0FEbEU7QUFFTFAsZUFBSzRCLFlBQVl2QixNQUFaLENBQW1CTCxHQUFuQixHQUF5QjRCLFlBQVl0QixNQUFyQyxHQUE4Q2tCO0FBRjlDLFNBQVA7QUFJQTtBQUNGO0FBQ0UsZUFBTztBQUNMdEIsZ0JBQU90SixXQUFXSSxHQUFYLEtBQW1CNEssWUFBWXZCLE1BQVosQ0FBbUJILElBQW5CLEdBQTBCeUIsU0FBU3BCLEtBQW5DLEdBQTJDcUIsWUFBWXJCLEtBQTFFLEdBQWtGcUIsWUFBWXZCLE1BQVosQ0FBbUJILElBQW5CLEdBQTBCdUIsT0FEOUc7QUFFTHpCLGVBQUs0QixZQUFZdkIsTUFBWixDQUFtQkwsR0FBbkIsR0FBeUI0QixZQUFZdEIsTUFBckMsR0FBOENrQjtBQUY5QyxTQUFQO0FBekVKO0FBOEVEO0FBRUEsQ0FoTUEsQ0FnTUNsQyxNQWhNRCxDQUFEO0FDRkE7Ozs7Ozs7O0FBUUE7O0FBRUEsQ0FBQyxVQUFTNUksQ0FBVCxFQUFZOztBQUViLE1BQU1tTCxXQUFXO0FBQ2YsT0FBRyxLQURZO0FBRWYsUUFBSSxPQUZXO0FBR2YsUUFBSSxRQUhXO0FBSWYsUUFBSSxPQUpXO0FBS2YsUUFBSSxZQUxXO0FBTWYsUUFBSSxVQU5XO0FBT2YsUUFBSSxhQVBXO0FBUWYsUUFBSTtBQVJXLEdBQWpCOztBQVdBLE1BQUlDLFdBQVcsRUFBZjs7QUFFQSxNQUFJQyxXQUFXO0FBQ2IxSSxVQUFNMkksWUFBWUgsUUFBWixDQURPOztBQUdiOzs7Ozs7QUFNQUksWUFUYSxvQkFTSkMsS0FUSSxFQVNHO0FBQ2QsVUFBSUMsTUFBTU4sU0FBU0ssTUFBTUUsS0FBTixJQUFlRixNQUFNRyxPQUE5QixLQUEwQ0MsT0FBT0MsWUFBUCxDQUFvQkwsTUFBTUUsS0FBMUIsRUFBaUNJLFdBQWpDLEVBQXBEOztBQUVBO0FBQ0FMLFlBQU1BLElBQUk5QyxPQUFKLENBQVksS0FBWixFQUFtQixFQUFuQixDQUFOOztBQUVBLFVBQUk2QyxNQUFNTyxRQUFWLEVBQW9CTixpQkFBZUEsR0FBZjtBQUNwQixVQUFJRCxNQUFNUSxPQUFWLEVBQW1CUCxnQkFBY0EsR0FBZDtBQUNuQixVQUFJRCxNQUFNUyxNQUFWLEVBQWtCUixlQUFhQSxHQUFiOztBQUVsQjtBQUNBQSxZQUFNQSxJQUFJOUMsT0FBSixDQUFZLElBQVosRUFBa0IsRUFBbEIsQ0FBTjs7QUFFQSxhQUFPOEMsR0FBUDtBQUNELEtBdkJZOzs7QUF5QmI7Ozs7OztBQU1BUyxhQS9CYSxxQkErQkhWLEtBL0JHLEVBK0JJVyxTQS9CSixFQStCZUMsU0EvQmYsRUErQjBCO0FBQ3JDLFVBQUlDLGNBQWNqQixTQUFTZSxTQUFULENBQWxCO0FBQUEsVUFDRVIsVUFBVSxLQUFLSixRQUFMLENBQWNDLEtBQWQsQ0FEWjtBQUFBLFVBRUVjLElBRkY7QUFBQSxVQUdFQyxPQUhGO0FBQUEsVUFJRTVGLEVBSkY7O0FBTUEsVUFBSSxDQUFDMEYsV0FBTCxFQUFrQixPQUFPeEosUUFBUWtCLElBQVIsQ0FBYSx3QkFBYixDQUFQOztBQUVsQixVQUFJLE9BQU9zSSxZQUFZRyxHQUFuQixLQUEyQixXQUEvQixFQUE0QztBQUFFO0FBQzFDRixlQUFPRCxXQUFQLENBRHdDLENBQ3BCO0FBQ3ZCLE9BRkQsTUFFTztBQUFFO0FBQ0wsWUFBSW5NLFdBQVdJLEdBQVgsRUFBSixFQUFzQmdNLE9BQU90TSxFQUFFeU0sTUFBRixDQUFTLEVBQVQsRUFBYUosWUFBWUcsR0FBekIsRUFBOEJILFlBQVkvTCxHQUExQyxDQUFQLENBQXRCLEtBRUtnTSxPQUFPdE0sRUFBRXlNLE1BQUYsQ0FBUyxFQUFULEVBQWFKLFlBQVkvTCxHQUF6QixFQUE4QitMLFlBQVlHLEdBQTFDLENBQVA7QUFDUjtBQUNERCxnQkFBVUQsS0FBS1gsT0FBTCxDQUFWOztBQUVBaEYsV0FBS3lGLFVBQVVHLE9BQVYsQ0FBTDtBQUNBLFVBQUk1RixNQUFNLE9BQU9BLEVBQVAsS0FBYyxVQUF4QixFQUFvQztBQUFFO0FBQ3BDLFlBQUkrRixjQUFjL0YsR0FBR2hCLEtBQUgsRUFBbEI7QUFDQSxZQUFJeUcsVUFBVU8sT0FBVixJQUFxQixPQUFPUCxVQUFVTyxPQUFqQixLQUE2QixVQUF0RCxFQUFrRTtBQUFFO0FBQ2hFUCxvQkFBVU8sT0FBVixDQUFrQkQsV0FBbEI7QUFDSDtBQUNGLE9BTEQsTUFLTztBQUNMLFlBQUlOLFVBQVVRLFNBQVYsSUFBdUIsT0FBT1IsVUFBVVEsU0FBakIsS0FBK0IsVUFBMUQsRUFBc0U7QUFBRTtBQUNwRVIsb0JBQVVRLFNBQVY7QUFDSDtBQUNGO0FBQ0YsS0E1RFk7OztBQThEYjs7Ozs7QUFLQUMsaUJBbkVhLHlCQW1FQ3pMLFFBbkVELEVBbUVXO0FBQ3RCLFVBQUcsQ0FBQ0EsUUFBSixFQUFjO0FBQUMsZUFBTyxLQUFQO0FBQWU7QUFDOUIsYUFBT0EsU0FBU3VDLElBQVQsQ0FBYyw4S0FBZCxFQUE4TG1KLE1BQTlMLENBQXFNLFlBQVc7QUFDck4sWUFBSSxDQUFDOU0sRUFBRSxJQUFGLEVBQVErTSxFQUFSLENBQVcsVUFBWCxDQUFELElBQTJCL00sRUFBRSxJQUFGLEVBQVFPLElBQVIsQ0FBYSxVQUFiLElBQTJCLENBQTFELEVBQTZEO0FBQUUsaUJBQU8sS0FBUDtBQUFlLFNBRHVJLENBQ3RJO0FBQy9FLGVBQU8sSUFBUDtBQUNELE9BSE0sQ0FBUDtBQUlELEtBekVZOzs7QUEyRWI7Ozs7OztBQU1BeU0sWUFqRmEsb0JBaUZKQyxhQWpGSSxFQWlGV1gsSUFqRlgsRUFpRmlCO0FBQzVCbEIsZUFBUzZCLGFBQVQsSUFBMEJYLElBQTFCO0FBQ0QsS0FuRlk7OztBQXFGYjs7OztBQUlBWSxhQXpGYSxxQkF5Rkg5TCxRQXpGRyxFQXlGTztBQUNsQixVQUFJK0wsYUFBYWpOLFdBQVdtTCxRQUFYLENBQW9Cd0IsYUFBcEIsQ0FBa0N6TCxRQUFsQyxDQUFqQjtBQUFBLFVBQ0lnTSxrQkFBa0JELFdBQVdFLEVBQVgsQ0FBYyxDQUFkLENBRHRCO0FBQUEsVUFFSUMsaUJBQWlCSCxXQUFXRSxFQUFYLENBQWMsQ0FBQyxDQUFmLENBRnJCOztBQUlBak0sZUFBU21NLEVBQVQsQ0FBWSxzQkFBWixFQUFvQyxVQUFTL0IsS0FBVCxFQUFnQjtBQUNsRCxZQUFJQSxNQUFNZ0MsTUFBTixLQUFpQkYsZUFBZSxDQUFmLENBQWpCLElBQXNDcE4sV0FBV21MLFFBQVgsQ0FBb0JFLFFBQXBCLENBQTZCQyxLQUE3QixNQUF3QyxLQUFsRixFQUF5RjtBQUN2RkEsZ0JBQU1pQyxjQUFOO0FBQ0FMLDBCQUFnQk0sS0FBaEI7QUFDRCxTQUhELE1BSUssSUFBSWxDLE1BQU1nQyxNQUFOLEtBQWlCSixnQkFBZ0IsQ0FBaEIsQ0FBakIsSUFBdUNsTixXQUFXbUwsUUFBWCxDQUFvQkUsUUFBcEIsQ0FBNkJDLEtBQTdCLE1BQXdDLFdBQW5GLEVBQWdHO0FBQ25HQSxnQkFBTWlDLGNBQU47QUFDQUgseUJBQWVJLEtBQWY7QUFDRDtBQUNGLE9BVEQ7QUFVRCxLQXhHWTs7QUF5R2I7Ozs7QUFJQUMsZ0JBN0dhLHdCQTZHQXZNLFFBN0dBLEVBNkdVO0FBQ3JCQSxlQUFTd00sR0FBVCxDQUFhLHNCQUFiO0FBQ0Q7QUEvR1ksR0FBZjs7QUFrSEE7Ozs7QUFJQSxXQUFTdEMsV0FBVCxDQUFxQnVDLEdBQXJCLEVBQTBCO0FBQ3hCLFFBQUlDLElBQUksRUFBUjtBQUNBLFNBQUssSUFBSUMsRUFBVCxJQUFlRixHQUFmO0FBQW9CQyxRQUFFRCxJQUFJRSxFQUFKLENBQUYsSUFBYUYsSUFBSUUsRUFBSixDQUFiO0FBQXBCLEtBQ0EsT0FBT0QsQ0FBUDtBQUNEOztBQUVENU4sYUFBV21MLFFBQVgsR0FBc0JBLFFBQXRCO0FBRUMsQ0E3SUEsQ0E2SUN6QyxNQTdJRCxDQUFEO0FDVkE7Ozs7QUFFQSxDQUFDLFVBQVM1SSxDQUFULEVBQVk7O0FBRWI7QUFDQSxNQUFNZ08saUJBQWlCO0FBQ3JCLGVBQVksYUFEUztBQUVyQkMsZUFBWSwwQ0FGUztBQUdyQkMsY0FBVyx5Q0FIVTtBQUlyQkMsWUFBUyx5REFDUCxtREFETyxHQUVQLG1EQUZPLEdBR1AsOENBSE8sR0FJUCwyQ0FKTyxHQUtQO0FBVG1CLEdBQXZCOztBQVlBLE1BQUlqSSxhQUFhO0FBQ2ZrSSxhQUFTLEVBRE07O0FBR2ZDLGFBQVMsRUFITTs7QUFLZjs7Ozs7QUFLQW5NLFNBVmUsbUJBVVA7QUFDTixVQUFJb00sT0FBTyxJQUFYO0FBQ0EsVUFBSUMsa0JBQWtCdk8sRUFBRSxnQkFBRixFQUFvQndPLEdBQXBCLENBQXdCLGFBQXhCLENBQXRCO0FBQ0EsVUFBSUMsWUFBSjs7QUFFQUEscUJBQWVDLG1CQUFtQkgsZUFBbkIsQ0FBZjs7QUFFQSxXQUFLLElBQUk5QyxHQUFULElBQWdCZ0QsWUFBaEIsRUFBOEI7QUFDNUIsWUFBR0EsYUFBYUUsY0FBYixDQUE0QmxELEdBQTVCLENBQUgsRUFBcUM7QUFDbkM2QyxlQUFLRixPQUFMLENBQWE3TSxJQUFiLENBQWtCO0FBQ2hCZCxrQkFBTWdMLEdBRFU7QUFFaEJtRCxvREFBc0NILGFBQWFoRCxHQUFiLENBQXRDO0FBRmdCLFdBQWxCO0FBSUQ7QUFDRjs7QUFFRCxXQUFLNEMsT0FBTCxHQUFlLEtBQUtRLGVBQUwsRUFBZjs7QUFFQSxXQUFLQyxRQUFMO0FBQ0QsS0E3QmM7OztBQStCZjs7Ozs7O0FBTUFDLFdBckNlLG1CQXFDUEMsSUFyQ08sRUFxQ0Q7QUFDWixVQUFJQyxRQUFRLEtBQUtDLEdBQUwsQ0FBU0YsSUFBVCxDQUFaOztBQUVBLFVBQUlDLEtBQUosRUFBVztBQUNULGVBQU92SSxPQUFPeUksVUFBUCxDQUFrQkYsS0FBbEIsRUFBeUJHLE9BQWhDO0FBQ0Q7O0FBRUQsYUFBTyxLQUFQO0FBQ0QsS0E3Q2M7OztBQStDZjs7Ozs7O0FBTUFyQyxNQXJEZSxjQXFEWmlDLElBckRZLEVBcUROO0FBQ1BBLGFBQU9BLEtBQUsxSyxJQUFMLEdBQVlMLEtBQVosQ0FBa0IsR0FBbEIsQ0FBUDtBQUNBLFVBQUcrSyxLQUFLak0sTUFBTCxHQUFjLENBQWQsSUFBbUJpTSxLQUFLLENBQUwsTUFBWSxNQUFsQyxFQUEwQztBQUN4QyxZQUFHQSxLQUFLLENBQUwsTUFBWSxLQUFLSCxlQUFMLEVBQWYsRUFBdUMsT0FBTyxJQUFQO0FBQ3hDLE9BRkQsTUFFTztBQUNMLGVBQU8sS0FBS0UsT0FBTCxDQUFhQyxLQUFLLENBQUwsQ0FBYixDQUFQO0FBQ0Q7QUFDRCxhQUFPLEtBQVA7QUFDRCxLQTdEYzs7O0FBK0RmOzs7Ozs7QUFNQUUsT0FyRWUsZUFxRVhGLElBckVXLEVBcUVMO0FBQ1IsV0FBSyxJQUFJdkwsQ0FBVCxJQUFjLEtBQUsySyxPQUFuQixFQUE0QjtBQUMxQixZQUFHLEtBQUtBLE9BQUwsQ0FBYU8sY0FBYixDQUE0QmxMLENBQTVCLENBQUgsRUFBbUM7QUFDakMsY0FBSXdMLFFBQVEsS0FBS2IsT0FBTCxDQUFhM0ssQ0FBYixDQUFaO0FBQ0EsY0FBSXVMLFNBQVNDLE1BQU14TyxJQUFuQixFQUF5QixPQUFPd08sTUFBTUwsS0FBYjtBQUMxQjtBQUNGOztBQUVELGFBQU8sSUFBUDtBQUNELEtBOUVjOzs7QUFnRmY7Ozs7OztBQU1BQyxtQkF0RmUsNkJBc0ZHO0FBQ2hCLFVBQUlRLE9BQUo7O0FBRUEsV0FBSyxJQUFJNUwsSUFBSSxDQUFiLEVBQWdCQSxJQUFJLEtBQUsySyxPQUFMLENBQWFyTCxNQUFqQyxFQUF5Q1UsR0FBekMsRUFBOEM7QUFDNUMsWUFBSXdMLFFBQVEsS0FBS2IsT0FBTCxDQUFhM0ssQ0FBYixDQUFaOztBQUVBLFlBQUlpRCxPQUFPeUksVUFBUCxDQUFrQkYsTUFBTUwsS0FBeEIsRUFBK0JRLE9BQW5DLEVBQTRDO0FBQzFDQyxvQkFBVUosS0FBVjtBQUNEO0FBQ0Y7O0FBRUQsVUFBSSxRQUFPSSxPQUFQLHlDQUFPQSxPQUFQLE9BQW1CLFFBQXZCLEVBQWlDO0FBQy9CLGVBQU9BLFFBQVE1TyxJQUFmO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsZUFBTzRPLE9BQVA7QUFDRDtBQUNGLEtBdEdjOzs7QUF3R2Y7Ozs7O0FBS0FQLFlBN0dlLHNCQTZHSjtBQUFBOztBQUNUOU8sUUFBRTBHLE1BQUYsRUFBVTZHLEVBQVYsQ0FBYSxzQkFBYixFQUFxQyxZQUFNO0FBQ3pDLFlBQUkrQixVQUFVLE1BQUtULGVBQUwsRUFBZDtBQUFBLFlBQXNDVSxjQUFjLE1BQUtsQixPQUF6RDs7QUFFQSxZQUFJaUIsWUFBWUMsV0FBaEIsRUFBNkI7QUFDM0I7QUFDQSxnQkFBS2xCLE9BQUwsR0FBZWlCLE9BQWY7O0FBRUE7QUFDQXRQLFlBQUUwRyxNQUFGLEVBQVVwRixPQUFWLENBQWtCLHVCQUFsQixFQUEyQyxDQUFDZ08sT0FBRCxFQUFVQyxXQUFWLENBQTNDO0FBQ0Q7QUFDRixPQVZEO0FBV0Q7QUF6SGMsR0FBakI7O0FBNEhBclAsYUFBV2dHLFVBQVgsR0FBd0JBLFVBQXhCOztBQUVBO0FBQ0E7QUFDQVEsU0FBT3lJLFVBQVAsS0FBc0J6SSxPQUFPeUksVUFBUCxHQUFvQixZQUFXO0FBQ25EOztBQUVBOztBQUNBLFFBQUlLLGFBQWM5SSxPQUFPOEksVUFBUCxJQUFxQjlJLE9BQU8rSSxLQUE5Qzs7QUFFQTtBQUNBLFFBQUksQ0FBQ0QsVUFBTCxFQUFpQjtBQUNmLFVBQUl4SyxRQUFVSixTQUFTQyxhQUFULENBQXVCLE9BQXZCLENBQWQ7QUFBQSxVQUNBNkssU0FBYzlLLFNBQVMrSyxvQkFBVCxDQUE4QixRQUE5QixFQUF3QyxDQUF4QyxDQURkO0FBQUEsVUFFQUMsT0FBYyxJQUZkOztBQUlBNUssWUFBTTdDLElBQU4sR0FBYyxVQUFkO0FBQ0E2QyxZQUFNNkssRUFBTixHQUFjLG1CQUFkOztBQUVBSCxnQkFBVUEsT0FBT3RGLFVBQWpCLElBQStCc0YsT0FBT3RGLFVBQVAsQ0FBa0IwRixZQUFsQixDQUErQjlLLEtBQS9CLEVBQXNDMEssTUFBdEMsQ0FBL0I7O0FBRUE7QUFDQUUsYUFBUSxzQkFBc0JsSixNQUF2QixJQUFrQ0EsT0FBT3FKLGdCQUFQLENBQXdCL0ssS0FBeEIsRUFBK0IsSUFBL0IsQ0FBbEMsSUFBMEVBLE1BQU1nTCxZQUF2Rjs7QUFFQVIsbUJBQWE7QUFDWFMsbUJBRFcsdUJBQ0NSLEtBREQsRUFDUTtBQUNqQixjQUFJUyxtQkFBaUJULEtBQWpCLDJDQUFKOztBQUVBO0FBQ0EsY0FBSXpLLE1BQU1tTCxVQUFWLEVBQXNCO0FBQ3BCbkwsa0JBQU1tTCxVQUFOLENBQWlCQyxPQUFqQixHQUEyQkYsSUFBM0I7QUFDRCxXQUZELE1BRU87QUFDTGxMLGtCQUFNcUwsV0FBTixHQUFvQkgsSUFBcEI7QUFDRDs7QUFFRDtBQUNBLGlCQUFPTixLQUFLL0YsS0FBTCxLQUFlLEtBQXRCO0FBQ0Q7QUFiVSxPQUFiO0FBZUQ7O0FBRUQsV0FBTyxVQUFTNEYsS0FBVCxFQUFnQjtBQUNyQixhQUFPO0FBQ0xMLGlCQUFTSSxXQUFXUyxXQUFYLENBQXVCUixTQUFTLEtBQWhDLENBREo7QUFFTEEsZUFBT0EsU0FBUztBQUZYLE9BQVA7QUFJRCxLQUxEO0FBTUQsR0EzQ3lDLEVBQTFDOztBQTZDQTtBQUNBLFdBQVNmLGtCQUFULENBQTRCbEcsR0FBNUIsRUFBaUM7QUFDL0IsUUFBSThILGNBQWMsRUFBbEI7O0FBRUEsUUFBSSxPQUFPOUgsR0FBUCxLQUFlLFFBQW5CLEVBQTZCO0FBQzNCLGFBQU84SCxXQUFQO0FBQ0Q7O0FBRUQ5SCxVQUFNQSxJQUFJbEUsSUFBSixHQUFXaEIsS0FBWCxDQUFpQixDQUFqQixFQUFvQixDQUFDLENBQXJCLENBQU4sQ0FQK0IsQ0FPQTs7QUFFL0IsUUFBSSxDQUFDa0YsR0FBTCxFQUFVO0FBQ1IsYUFBTzhILFdBQVA7QUFDRDs7QUFFREEsa0JBQWM5SCxJQUFJdkUsS0FBSixDQUFVLEdBQVYsRUFBZXNNLE1BQWYsQ0FBc0IsVUFBU0MsR0FBVCxFQUFjQyxLQUFkLEVBQXFCO0FBQ3ZELFVBQUlDLFFBQVFELE1BQU05SCxPQUFOLENBQWMsS0FBZCxFQUFxQixHQUFyQixFQUEwQjFFLEtBQTFCLENBQWdDLEdBQWhDLENBQVo7QUFDQSxVQUFJd0gsTUFBTWlGLE1BQU0sQ0FBTixDQUFWO0FBQ0EsVUFBSUMsTUFBTUQsTUFBTSxDQUFOLENBQVY7QUFDQWpGLFlBQU1tRixtQkFBbUJuRixHQUFuQixDQUFOOztBQUVBO0FBQ0E7QUFDQWtGLFlBQU1BLFFBQVFwSyxTQUFSLEdBQW9CLElBQXBCLEdBQTJCcUssbUJBQW1CRCxHQUFuQixDQUFqQzs7QUFFQSxVQUFJLENBQUNILElBQUk3QixjQUFKLENBQW1CbEQsR0FBbkIsQ0FBTCxFQUE4QjtBQUM1QitFLFlBQUkvRSxHQUFKLElBQVdrRixHQUFYO0FBQ0QsT0FGRCxNQUVPLElBQUl4SyxNQUFNMEssT0FBTixDQUFjTCxJQUFJL0UsR0FBSixDQUFkLENBQUosRUFBNkI7QUFDbEMrRSxZQUFJL0UsR0FBSixFQUFTbEssSUFBVCxDQUFjb1AsR0FBZDtBQUNELE9BRk0sTUFFQTtBQUNMSCxZQUFJL0UsR0FBSixJQUFXLENBQUMrRSxJQUFJL0UsR0FBSixDQUFELEVBQVdrRixHQUFYLENBQVg7QUFDRDtBQUNELGFBQU9ILEdBQVA7QUFDRCxLQWxCYSxFQWtCWCxFQWxCVyxDQUFkOztBQW9CQSxXQUFPRixXQUFQO0FBQ0Q7O0FBRURwUSxhQUFXZ0csVUFBWCxHQUF3QkEsVUFBeEI7QUFFQyxDQW5PQSxDQW1PQzBDLE1Bbk9ELENBQUQ7QUNGQTs7QUFFQSxDQUFDLFVBQVM1SSxDQUFULEVBQVk7O0FBRWI7Ozs7O0FBS0EsTUFBTThRLGNBQWdCLENBQUMsV0FBRCxFQUFjLFdBQWQsQ0FBdEI7QUFDQSxNQUFNQyxnQkFBZ0IsQ0FBQyxrQkFBRCxFQUFxQixrQkFBckIsQ0FBdEI7O0FBRUEsTUFBTUMsU0FBUztBQUNiQyxlQUFXLG1CQUFTaEksT0FBVCxFQUFrQmlJLFNBQWxCLEVBQTZCQyxFQUE3QixFQUFpQztBQUMxQ0MsY0FBUSxJQUFSLEVBQWNuSSxPQUFkLEVBQXVCaUksU0FBdkIsRUFBa0NDLEVBQWxDO0FBQ0QsS0FIWTs7QUFLYkUsZ0JBQVksb0JBQVNwSSxPQUFULEVBQWtCaUksU0FBbEIsRUFBNkJDLEVBQTdCLEVBQWlDO0FBQzNDQyxjQUFRLEtBQVIsRUFBZW5JLE9BQWYsRUFBd0JpSSxTQUF4QixFQUFtQ0MsRUFBbkM7QUFDRDtBQVBZLEdBQWY7O0FBVUEsV0FBU0csSUFBVCxDQUFjQyxRQUFkLEVBQXdCL04sSUFBeEIsRUFBOEJtRCxFQUE5QixFQUFpQztBQUMvQixRQUFJNkssSUFBSjtBQUFBLFFBQVVDLElBQVY7QUFBQSxRQUFnQjdKLFFBQVEsSUFBeEI7QUFDQTs7QUFFQSxRQUFJMkosYUFBYSxDQUFqQixFQUFvQjtBQUNsQjVLLFNBQUdoQixLQUFILENBQVNuQyxJQUFUO0FBQ0FBLFdBQUtsQyxPQUFMLENBQWEscUJBQWIsRUFBb0MsQ0FBQ2tDLElBQUQsQ0FBcEMsRUFBNEMwQixjQUE1QyxDQUEyRCxxQkFBM0QsRUFBa0YsQ0FBQzFCLElBQUQsQ0FBbEY7QUFDQTtBQUNEOztBQUVELGFBQVNrTyxJQUFULENBQWNDLEVBQWQsRUFBaUI7QUFDZixVQUFHLENBQUMvSixLQUFKLEVBQVdBLFFBQVErSixFQUFSO0FBQ1g7QUFDQUYsYUFBT0UsS0FBSy9KLEtBQVo7QUFDQWpCLFNBQUdoQixLQUFILENBQVNuQyxJQUFUOztBQUVBLFVBQUdpTyxPQUFPRixRQUFWLEVBQW1CO0FBQUVDLGVBQU85SyxPQUFPTSxxQkFBUCxDQUE2QjBLLElBQTdCLEVBQW1DbE8sSUFBbkMsQ0FBUDtBQUFrRCxPQUF2RSxNQUNJO0FBQ0ZrRCxlQUFPUSxvQkFBUCxDQUE0QnNLLElBQTVCO0FBQ0FoTyxhQUFLbEMsT0FBTCxDQUFhLHFCQUFiLEVBQW9DLENBQUNrQyxJQUFELENBQXBDLEVBQTRDMEIsY0FBNUMsQ0FBMkQscUJBQTNELEVBQWtGLENBQUMxQixJQUFELENBQWxGO0FBQ0Q7QUFDRjtBQUNEZ08sV0FBTzlLLE9BQU9NLHFCQUFQLENBQTZCMEssSUFBN0IsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7QUFTQSxXQUFTTixPQUFULENBQWlCUSxJQUFqQixFQUF1QjNJLE9BQXZCLEVBQWdDaUksU0FBaEMsRUFBMkNDLEVBQTNDLEVBQStDO0FBQzdDbEksY0FBVWpKLEVBQUVpSixPQUFGLEVBQVdvRSxFQUFYLENBQWMsQ0FBZCxDQUFWOztBQUVBLFFBQUksQ0FBQ3BFLFFBQVFsRyxNQUFiLEVBQXFCOztBQUVyQixRQUFJOE8sWUFBWUQsT0FBT2QsWUFBWSxDQUFaLENBQVAsR0FBd0JBLFlBQVksQ0FBWixDQUF4QztBQUNBLFFBQUlnQixjQUFjRixPQUFPYixjQUFjLENBQWQsQ0FBUCxHQUEwQkEsY0FBYyxDQUFkLENBQTVDOztBQUVBO0FBQ0FnQjs7QUFFQTlJLFlBQ0crSSxRQURILENBQ1lkLFNBRFosRUFFRzFDLEdBRkgsQ0FFTyxZQUZQLEVBRXFCLE1BRnJCOztBQUlBeEgsMEJBQXNCLFlBQU07QUFDMUJpQyxjQUFRK0ksUUFBUixDQUFpQkgsU0FBakI7QUFDQSxVQUFJRCxJQUFKLEVBQVUzSSxRQUFRZ0osSUFBUjtBQUNYLEtBSEQ7O0FBS0E7QUFDQWpMLDBCQUFzQixZQUFNO0FBQzFCaUMsY0FBUSxDQUFSLEVBQVdpSixXQUFYO0FBQ0FqSixjQUNHdUYsR0FESCxDQUNPLFlBRFAsRUFDcUIsRUFEckIsRUFFR3dELFFBRkgsQ0FFWUYsV0FGWjtBQUdELEtBTEQ7O0FBT0E7QUFDQTdJLFlBQVFrSixHQUFSLENBQVlqUyxXQUFXd0UsYUFBWCxDQUF5QnVFLE9BQXpCLENBQVosRUFBK0NtSixNQUEvQzs7QUFFQTtBQUNBLGFBQVNBLE1BQVQsR0FBa0I7QUFDaEIsVUFBSSxDQUFDUixJQUFMLEVBQVczSSxRQUFRb0osSUFBUjtBQUNYTjtBQUNBLFVBQUlaLEVBQUosRUFBUUEsR0FBR3hMLEtBQUgsQ0FBU3NELE9BQVQ7QUFDVDs7QUFFRDtBQUNBLGFBQVM4SSxLQUFULEdBQWlCO0FBQ2Y5SSxjQUFRLENBQVIsRUFBV2pFLEtBQVgsQ0FBaUJzTixrQkFBakIsR0FBc0MsQ0FBdEM7QUFDQXJKLGNBQVFoRCxXQUFSLENBQXVCNEwsU0FBdkIsU0FBb0NDLFdBQXBDLFNBQW1EWixTQUFuRDtBQUNEO0FBQ0Y7O0FBRURoUixhQUFXb1IsSUFBWCxHQUFrQkEsSUFBbEI7QUFDQXBSLGFBQVc4USxNQUFYLEdBQW9CQSxNQUFwQjtBQUVDLENBdEdBLENBc0dDcEksTUF0R0QsQ0FBRDtBQ0ZBOztBQUVBLENBQUMsVUFBUzVJLENBQVQsRUFBWTs7QUFFYixNQUFNdVMsT0FBTztBQUNYQyxXQURXLG1CQUNIQyxJQURHLEVBQ2dCO0FBQUEsVUFBYnRRLElBQWEsdUVBQU4sSUFBTTs7QUFDekJzUSxXQUFLbFMsSUFBTCxDQUFVLE1BQVYsRUFBa0IsU0FBbEI7O0FBRUEsVUFBSW1TLFFBQVFELEtBQUs5TyxJQUFMLENBQVUsSUFBVixFQUFnQnBELElBQWhCLENBQXFCLEVBQUMsUUFBUSxVQUFULEVBQXJCLENBQVo7QUFBQSxVQUNJb1MsdUJBQXFCeFEsSUFBckIsYUFESjtBQUFBLFVBRUl5USxlQUFrQkQsWUFBbEIsVUFGSjtBQUFBLFVBR0lFLHNCQUFvQjFRLElBQXBCLG9CQUhKOztBQUtBdVEsWUFBTXpRLElBQU4sQ0FBVyxZQUFXO0FBQ3BCLFlBQUk2USxRQUFROVMsRUFBRSxJQUFGLENBQVo7QUFBQSxZQUNJK1MsT0FBT0QsTUFBTUUsUUFBTixDQUFlLElBQWYsQ0FEWDs7QUFHQSxZQUFJRCxLQUFLaFEsTUFBVCxFQUFpQjtBQUNmK1AsZ0JBQ0dkLFFBREgsQ0FDWWEsV0FEWixFQUVHdFMsSUFGSCxDQUVRO0FBQ0osNkJBQWlCLElBRGI7QUFFSiwwQkFBY3VTLE1BQU1FLFFBQU4sQ0FBZSxTQUFmLEVBQTBCOUMsSUFBMUI7QUFGVixXQUZSO0FBTUU7QUFDQTtBQUNBO0FBQ0EsY0FBRy9OLFNBQVMsV0FBWixFQUF5QjtBQUN2QjJRLGtCQUFNdlMsSUFBTixDQUFXLEVBQUMsaUJBQWlCLEtBQWxCLEVBQVg7QUFDRDs7QUFFSHdTLGVBQ0dmLFFBREgsY0FDdUJXLFlBRHZCLEVBRUdwUyxJQUZILENBRVE7QUFDSiw0QkFBZ0IsRUFEWjtBQUVKLG9CQUFRO0FBRkosV0FGUjtBQU1BLGNBQUc0QixTQUFTLFdBQVosRUFBeUI7QUFDdkI0USxpQkFBS3hTLElBQUwsQ0FBVSxFQUFDLGVBQWUsSUFBaEIsRUFBVjtBQUNEO0FBQ0Y7O0FBRUQsWUFBSXVTLE1BQU01SixNQUFOLENBQWEsZ0JBQWIsRUFBK0JuRyxNQUFuQyxFQUEyQztBQUN6QytQLGdCQUFNZCxRQUFOLHNCQUFrQ1ksWUFBbEM7QUFDRDtBQUNGLE9BaENEOztBQWtDQTtBQUNELEtBNUNVO0FBOENYSyxRQTlDVyxnQkE4Q05SLElBOUNNLEVBOENBdFEsSUE5Q0EsRUE4Q007QUFDZixVQUFJO0FBQ0F3USw2QkFBcUJ4USxJQUFyQixhQURKO0FBQUEsVUFFSXlRLGVBQWtCRCxZQUFsQixVQUZKO0FBQUEsVUFHSUUsc0JBQW9CMVEsSUFBcEIsb0JBSEo7O0FBS0FzUSxXQUNHOU8sSUFESCxDQUNRLHdCQURSLEVBRUdzQyxXQUZILENBRWtCME0sWUFGbEIsU0FFa0NDLFlBRmxDLFNBRWtEQyxXQUZsRCx5Q0FHR2xSLFVBSEgsQ0FHYyxjQUhkLEVBRzhCNk0sR0FIOUIsQ0FHa0MsU0FIbEMsRUFHNkMsRUFIN0M7O0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNEO0FBdkVVLEdBQWI7O0FBMEVBdE8sYUFBV3FTLElBQVgsR0FBa0JBLElBQWxCO0FBRUMsQ0E5RUEsQ0E4RUMzSixNQTlFRCxDQUFEO0FDRkE7O0FBRUEsQ0FBQyxVQUFTNUksQ0FBVCxFQUFZOztBQUViLFdBQVNrVCxLQUFULENBQWUxUCxJQUFmLEVBQXFCMlAsT0FBckIsRUFBOEJoQyxFQUE5QixFQUFrQztBQUNoQyxRQUFJL08sUUFBUSxJQUFaO0FBQUEsUUFDSW1QLFdBQVc0QixRQUFRNUIsUUFEdkI7QUFBQSxRQUNnQztBQUM1QjZCLGdCQUFZMVEsT0FBT0MsSUFBUCxDQUFZYSxLQUFLbkMsSUFBTCxFQUFaLEVBQXlCLENBQXpCLEtBQStCLE9BRi9DO0FBQUEsUUFHSWdTLFNBQVMsQ0FBQyxDQUhkO0FBQUEsUUFJSXpMLEtBSko7QUFBQSxRQUtJckMsS0FMSjs7QUFPQSxTQUFLK04sUUFBTCxHQUFnQixLQUFoQjs7QUFFQSxTQUFLQyxPQUFMLEdBQWUsWUFBVztBQUN4QkYsZUFBUyxDQUFDLENBQVY7QUFDQTNMLG1CQUFhbkMsS0FBYjtBQUNBLFdBQUtxQyxLQUFMO0FBQ0QsS0FKRDs7QUFNQSxTQUFLQSxLQUFMLEdBQWEsWUFBVztBQUN0QixXQUFLMEwsUUFBTCxHQUFnQixLQUFoQjtBQUNBO0FBQ0E1TCxtQkFBYW5DLEtBQWI7QUFDQThOLGVBQVNBLFVBQVUsQ0FBVixHQUFjOUIsUUFBZCxHQUF5QjhCLE1BQWxDO0FBQ0E3UCxXQUFLbkMsSUFBTCxDQUFVLFFBQVYsRUFBb0IsS0FBcEI7QUFDQXVHLGNBQVFoQixLQUFLQyxHQUFMLEVBQVI7QUFDQXRCLGNBQVFOLFdBQVcsWUFBVTtBQUMzQixZQUFHa08sUUFBUUssUUFBWCxFQUFvQjtBQUNsQnBSLGdCQUFNbVIsT0FBTixHQURrQixDQUNGO0FBQ2pCO0FBQ0QsWUFBSXBDLE1BQU0sT0FBT0EsRUFBUCxLQUFjLFVBQXhCLEVBQW9DO0FBQUVBO0FBQU87QUFDOUMsT0FMTyxFQUtMa0MsTUFMSyxDQUFSO0FBTUE3UCxXQUFLbEMsT0FBTCxvQkFBOEI4UixTQUE5QjtBQUNELEtBZEQ7O0FBZ0JBLFNBQUtLLEtBQUwsR0FBYSxZQUFXO0FBQ3RCLFdBQUtILFFBQUwsR0FBZ0IsSUFBaEI7QUFDQTtBQUNBNUwsbUJBQWFuQyxLQUFiO0FBQ0EvQixXQUFLbkMsSUFBTCxDQUFVLFFBQVYsRUFBb0IsSUFBcEI7QUFDQSxVQUFJeUQsTUFBTThCLEtBQUtDLEdBQUwsRUFBVjtBQUNBd00sZUFBU0EsVUFBVXZPLE1BQU04QyxLQUFoQixDQUFUO0FBQ0FwRSxXQUFLbEMsT0FBTCxxQkFBK0I4UixTQUEvQjtBQUNELEtBUkQ7QUFTRDs7QUFFRDs7Ozs7QUFLQSxXQUFTTSxjQUFULENBQXdCQyxNQUF4QixFQUFnQ3BNLFFBQWhDLEVBQXlDO0FBQ3ZDLFFBQUkrRyxPQUFPLElBQVg7QUFBQSxRQUNJc0YsV0FBV0QsT0FBTzVRLE1BRHRCOztBQUdBLFFBQUk2USxhQUFhLENBQWpCLEVBQW9CO0FBQ2xCck07QUFDRDs7QUFFRG9NLFdBQU8xUixJQUFQLENBQVksWUFBVztBQUNyQjtBQUNBLFVBQUksS0FBSzRSLFFBQUwsSUFBa0IsS0FBS0MsVUFBTCxLQUFvQixDQUF0QyxJQUE2QyxLQUFLQSxVQUFMLEtBQW9CLFVBQXJFLEVBQWtGO0FBQ2hGQztBQUNEO0FBQ0Q7QUFIQSxXQUlLO0FBQ0g7QUFDQSxjQUFJQyxNQUFNaFUsRUFBRSxJQUFGLEVBQVFPLElBQVIsQ0FBYSxLQUFiLENBQVY7QUFDQVAsWUFBRSxJQUFGLEVBQVFPLElBQVIsQ0FBYSxLQUFiLEVBQW9CeVQsT0FBT0EsSUFBSXRTLE9BQUosQ0FBWSxHQUFaLEtBQW9CLENBQXBCLEdBQXdCLEdBQXhCLEdBQThCLEdBQXJDLElBQTZDLElBQUlrRixJQUFKLEdBQVdFLE9BQVgsRUFBakU7QUFDQTlHLFlBQUUsSUFBRixFQUFRbVMsR0FBUixDQUFZLE1BQVosRUFBb0IsWUFBVztBQUM3QjRCO0FBQ0QsV0FGRDtBQUdEO0FBQ0YsS0FkRDs7QUFnQkEsYUFBU0EsaUJBQVQsR0FBNkI7QUFDM0JIO0FBQ0EsVUFBSUEsYUFBYSxDQUFqQixFQUFvQjtBQUNsQnJNO0FBQ0Q7QUFDRjtBQUNGOztBQUVEckgsYUFBV2dULEtBQVgsR0FBbUJBLEtBQW5CO0FBQ0FoVCxhQUFXd1QsY0FBWCxHQUE0QkEsY0FBNUI7QUFFQyxDQXJGQSxDQXFGQzlLLE1BckZELENBQUQ7OztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxVQUFTNUksQ0FBVCxFQUFZOztBQUVYQSxHQUFFaVUsU0FBRixHQUFjO0FBQ1o5VCxXQUFTLE9BREc7QUFFWitULFdBQVMsa0JBQWtCdFAsU0FBU3VQLGVBRnhCO0FBR1oxRyxrQkFBZ0IsS0FISjtBQUlaMkcsaUJBQWUsRUFKSDtBQUtaQyxpQkFBZTtBQUxILEVBQWQ7O0FBUUEsS0FBTUMsU0FBTjtBQUFBLEtBQ01DLFNBRE47QUFBQSxLQUVNQyxTQUZOO0FBQUEsS0FHTUMsV0FITjtBQUFBLEtBSU1DLFdBQVcsS0FKakI7O0FBTUEsVUFBU0MsVUFBVCxHQUFzQjtBQUNwQjtBQUNBLE9BQUtDLG1CQUFMLENBQXlCLFdBQXpCLEVBQXNDQyxXQUF0QztBQUNBLE9BQUtELG1CQUFMLENBQXlCLFVBQXpCLEVBQXFDRCxVQUFyQztBQUNBRCxhQUFXLEtBQVg7QUFDRDs7QUFFRCxVQUFTRyxXQUFULENBQXFCM1EsQ0FBckIsRUFBd0I7QUFDdEIsTUFBSWxFLEVBQUVpVSxTQUFGLENBQVl4RyxjQUFoQixFQUFnQztBQUFFdkosS0FBRXVKLGNBQUY7QUFBcUI7QUFDdkQsTUFBR2lILFFBQUgsRUFBYTtBQUNYLE9BQUlJLElBQUk1USxFQUFFNlEsT0FBRixDQUFVLENBQVYsRUFBYUMsS0FBckI7QUFDQSxPQUFJQyxJQUFJL1EsRUFBRTZRLE9BQUYsQ0FBVSxDQUFWLEVBQWFHLEtBQXJCO0FBQ0EsT0FBSUMsS0FBS2IsWUFBWVEsQ0FBckI7QUFDQSxPQUFJTSxLQUFLYixZQUFZVSxDQUFyQjtBQUNBLE9BQUlJLEdBQUo7QUFDQVosaUJBQWMsSUFBSTdOLElBQUosR0FBV0UsT0FBWCxLQUF1QjBOLFNBQXJDO0FBQ0EsT0FBR3ZSLEtBQUtxUyxHQUFMLENBQVNILEVBQVQsS0FBZ0JuVixFQUFFaVUsU0FBRixDQUFZRyxhQUE1QixJQUE2Q0ssZUFBZXpVLEVBQUVpVSxTQUFGLENBQVlJLGFBQTNFLEVBQTBGO0FBQ3hGZ0IsVUFBTUYsS0FBSyxDQUFMLEdBQVMsTUFBVCxHQUFrQixPQUF4QjtBQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FBR0UsR0FBSCxFQUFRO0FBQ05uUixNQUFFdUosY0FBRjtBQUNBa0gsZUFBV3RPLElBQVgsQ0FBZ0IsSUFBaEI7QUFDQXJHLE1BQUUsSUFBRixFQUFRc0IsT0FBUixDQUFnQixPQUFoQixFQUF5QitULEdBQXpCLEVBQThCL1QsT0FBOUIsV0FBOEMrVCxHQUE5QztBQUNEO0FBQ0Y7QUFDRjs7QUFFRCxVQUFTRSxZQUFULENBQXNCclIsQ0FBdEIsRUFBeUI7QUFDdkIsTUFBSUEsRUFBRTZRLE9BQUYsQ0FBVWhTLE1BQVYsSUFBb0IsQ0FBeEIsRUFBMkI7QUFDekJ1UixlQUFZcFEsRUFBRTZRLE9BQUYsQ0FBVSxDQUFWLEVBQWFDLEtBQXpCO0FBQ0FULGVBQVlyUSxFQUFFNlEsT0FBRixDQUFVLENBQVYsRUFBYUcsS0FBekI7QUFDQVIsY0FBVyxJQUFYO0FBQ0FGLGVBQVksSUFBSTVOLElBQUosR0FBV0UsT0FBWCxFQUFaO0FBQ0EsUUFBSzBPLGdCQUFMLENBQXNCLFdBQXRCLEVBQW1DWCxXQUFuQyxFQUFnRCxLQUFoRDtBQUNBLFFBQUtXLGdCQUFMLENBQXNCLFVBQXRCLEVBQWtDYixVQUFsQyxFQUE4QyxLQUE5QztBQUNEO0FBQ0Y7O0FBRUQsVUFBU2MsSUFBVCxHQUFnQjtBQUNkLE9BQUtELGdCQUFMLElBQXlCLEtBQUtBLGdCQUFMLENBQXNCLFlBQXRCLEVBQW9DRCxZQUFwQyxFQUFrRCxLQUFsRCxDQUF6QjtBQUNEOztBQUVELFVBQVNHLFFBQVQsR0FBb0I7QUFDbEIsT0FBS2QsbUJBQUwsQ0FBeUIsWUFBekIsRUFBdUNXLFlBQXZDO0FBQ0Q7O0FBRUR2VixHQUFFd0wsS0FBRixDQUFRbUssT0FBUixDQUFnQkMsS0FBaEIsR0FBd0IsRUFBRUMsT0FBT0osSUFBVCxFQUF4Qjs7QUFFQXpWLEdBQUVpQyxJQUFGLENBQU8sQ0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLE1BQWYsRUFBdUIsT0FBdkIsQ0FBUCxFQUF3QyxZQUFZO0FBQ2xEakMsSUFBRXdMLEtBQUYsQ0FBUW1LLE9BQVIsV0FBd0IsSUFBeEIsSUFBa0MsRUFBRUUsT0FBTyxpQkFBVTtBQUNuRDdWLE1BQUUsSUFBRixFQUFRdU4sRUFBUixDQUFXLE9BQVgsRUFBb0J2TixFQUFFOFYsSUFBdEI7QUFDRCxJQUZpQyxFQUFsQztBQUdELEVBSkQ7QUFLRCxDQXhFRCxFQXdFR2xOLE1BeEVIO0FBeUVBOzs7QUFHQSxDQUFDLFVBQVM1SSxDQUFULEVBQVc7QUFDVkEsR0FBRTJHLEVBQUYsQ0FBS29QLFFBQUwsR0FBZ0IsWUFBVTtBQUN4QixPQUFLOVQsSUFBTCxDQUFVLFVBQVN3QixDQUFULEVBQVdZLEVBQVgsRUFBYztBQUN0QnJFLEtBQUVxRSxFQUFGLEVBQU15RCxJQUFOLENBQVcsMkNBQVgsRUFBdUQsWUFBVTtBQUMvRDtBQUNBO0FBQ0FrTyxnQkFBWXhLLEtBQVo7QUFDRCxJQUpEO0FBS0QsR0FORDs7QUFRQSxNQUFJd0ssY0FBYyxTQUFkQSxXQUFjLENBQVN4SyxLQUFULEVBQWU7QUFDL0IsT0FBSXVKLFVBQVV2SixNQUFNeUssY0FBcEI7QUFBQSxPQUNJQyxRQUFRbkIsUUFBUSxDQUFSLENBRFo7QUFBQSxPQUVJb0IsYUFBYTtBQUNYQyxnQkFBWSxXQUREO0FBRVhDLGVBQVcsV0FGQTtBQUdYQyxjQUFVO0FBSEMsSUFGakI7QUFBQSxPQU9JblUsT0FBT2dVLFdBQVczSyxNQUFNckosSUFBakIsQ0FQWDtBQUFBLE9BUUlvVSxjQVJKOztBQVdBLE9BQUcsZ0JBQWdCN1AsTUFBaEIsSUFBMEIsT0FBT0EsT0FBTzhQLFVBQWQsS0FBNkIsVUFBMUQsRUFBc0U7QUFDcEVELHFCQUFpQixJQUFJN1AsT0FBTzhQLFVBQVgsQ0FBc0JyVSxJQUF0QixFQUE0QjtBQUMzQyxnQkFBVyxJQURnQztBQUUzQyxtQkFBYyxJQUY2QjtBQUczQyxnQkFBVytULE1BQU1PLE9BSDBCO0FBSTNDLGdCQUFXUCxNQUFNUSxPQUowQjtBQUszQyxnQkFBV1IsTUFBTVMsT0FMMEI7QUFNM0MsZ0JBQVdULE1BQU1VO0FBTjBCLEtBQTVCLENBQWpCO0FBUUQsSUFURCxNQVNPO0FBQ0xMLHFCQUFpQjNSLFNBQVNpUyxXQUFULENBQXFCLFlBQXJCLENBQWpCO0FBQ0FOLG1CQUFlTyxjQUFmLENBQThCM1UsSUFBOUIsRUFBb0MsSUFBcEMsRUFBMEMsSUFBMUMsRUFBZ0R1RSxNQUFoRCxFQUF3RCxDQUF4RCxFQUEyRHdQLE1BQU1PLE9BQWpFLEVBQTBFUCxNQUFNUSxPQUFoRixFQUF5RlIsTUFBTVMsT0FBL0YsRUFBd0dULE1BQU1VLE9BQTlHLEVBQXVILEtBQXZILEVBQThILEtBQTlILEVBQXFJLEtBQXJJLEVBQTRJLEtBQTVJLEVBQW1KLENBQW5KLENBQW9KLFFBQXBKLEVBQThKLElBQTlKO0FBQ0Q7QUFDRFYsU0FBTTFJLE1BQU4sQ0FBYXVKLGFBQWIsQ0FBMkJSLGNBQTNCO0FBQ0QsR0ExQkQ7QUEyQkQsRUFwQ0Q7QUFxQ0QsQ0F0Q0EsQ0FzQ0MzTixNQXRDRCxDQUFEOztBQXlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMvSEE7Ozs7QUFFQSxDQUFDLFVBQVM1SSxDQUFULEVBQVk7O0FBRWIsTUFBTWdYLG1CQUFvQixZQUFZO0FBQ3BDLFFBQUlDLFdBQVcsQ0FBQyxRQUFELEVBQVcsS0FBWCxFQUFrQixHQUFsQixFQUF1QixJQUF2QixFQUE2QixFQUE3QixDQUFmO0FBQ0EsU0FBSyxJQUFJeFQsSUFBRSxDQUFYLEVBQWNBLElBQUl3VCxTQUFTbFUsTUFBM0IsRUFBbUNVLEdBQW5DLEVBQXdDO0FBQ3RDLFVBQU93VCxTQUFTeFQsQ0FBVCxDQUFILHlCQUFvQ2lELE1BQXhDLEVBQWdEO0FBQzlDLGVBQU9BLE9BQVV1USxTQUFTeFQsQ0FBVCxDQUFWLHNCQUFQO0FBQ0Q7QUFDRjtBQUNELFdBQU8sS0FBUDtBQUNELEdBUnlCLEVBQTFCOztBQVVBLE1BQU15VCxXQUFXLFNBQVhBLFFBQVcsQ0FBQzdTLEVBQUQsRUFBS2xDLElBQUwsRUFBYztBQUM3QmtDLE9BQUdoRCxJQUFILENBQVFjLElBQVIsRUFBYzhCLEtBQWQsQ0FBb0IsR0FBcEIsRUFBeUIxQixPQUF6QixDQUFpQyxjQUFNO0FBQ3JDdkMsY0FBTTZQLEVBQU4sRUFBYTFOLFNBQVMsT0FBVCxHQUFtQixTQUFuQixHQUErQixnQkFBNUMsRUFBaUVBLElBQWpFLGtCQUFvRixDQUFDa0MsRUFBRCxDQUFwRjtBQUNELEtBRkQ7QUFHRCxHQUpEO0FBS0E7QUFDQXJFLElBQUU0RSxRQUFGLEVBQVkySSxFQUFaLENBQWUsa0JBQWYsRUFBbUMsYUFBbkMsRUFBa0QsWUFBVztBQUMzRDJKLGFBQVNsWCxFQUFFLElBQUYsQ0FBVCxFQUFrQixNQUFsQjtBQUNELEdBRkQ7O0FBSUE7QUFDQTtBQUNBQSxJQUFFNEUsUUFBRixFQUFZMkksRUFBWixDQUFlLGtCQUFmLEVBQW1DLGNBQW5DLEVBQW1ELFlBQVc7QUFDNUQsUUFBSXNDLEtBQUs3UCxFQUFFLElBQUYsRUFBUXFCLElBQVIsQ0FBYSxPQUFiLENBQVQ7QUFDQSxRQUFJd08sRUFBSixFQUFRO0FBQ05xSCxlQUFTbFgsRUFBRSxJQUFGLENBQVQsRUFBa0IsT0FBbEI7QUFDRCxLQUZELE1BR0s7QUFDSEEsUUFBRSxJQUFGLEVBQVFzQixPQUFSLENBQWdCLGtCQUFoQjtBQUNEO0FBQ0YsR0FSRDs7QUFVQTtBQUNBdEIsSUFBRTRFLFFBQUYsRUFBWTJJLEVBQVosQ0FBZSxrQkFBZixFQUFtQyxlQUFuQyxFQUFvRCxZQUFXO0FBQzdELFFBQUlzQyxLQUFLN1AsRUFBRSxJQUFGLEVBQVFxQixJQUFSLENBQWEsUUFBYixDQUFUO0FBQ0EsUUFBSXdPLEVBQUosRUFBUTtBQUNOcUgsZUFBU2xYLEVBQUUsSUFBRixDQUFULEVBQWtCLFFBQWxCO0FBQ0QsS0FGRCxNQUVPO0FBQ0xBLFFBQUUsSUFBRixFQUFRc0IsT0FBUixDQUFnQixtQkFBaEI7QUFDRDtBQUNGLEdBUEQ7O0FBU0E7QUFDQXRCLElBQUU0RSxRQUFGLEVBQVkySSxFQUFaLENBQWUsa0JBQWYsRUFBbUMsaUJBQW5DLEVBQXNELFVBQVNySixDQUFULEVBQVc7QUFDL0RBLE1BQUVpVCxlQUFGO0FBQ0EsUUFBSWpHLFlBQVlsUixFQUFFLElBQUYsRUFBUXFCLElBQVIsQ0FBYSxVQUFiLENBQWhCOztBQUVBLFFBQUc2UCxjQUFjLEVBQWpCLEVBQW9CO0FBQ2xCaFIsaUJBQVc4USxNQUFYLENBQWtCSyxVQUFsQixDQUE2QnJSLEVBQUUsSUFBRixDQUE3QixFQUFzQ2tSLFNBQXRDLEVBQWlELFlBQVc7QUFDMURsUixVQUFFLElBQUYsRUFBUXNCLE9BQVIsQ0FBZ0IsV0FBaEI7QUFDRCxPQUZEO0FBR0QsS0FKRCxNQUlLO0FBQ0h0QixRQUFFLElBQUYsRUFBUW9YLE9BQVIsR0FBa0I5VixPQUFsQixDQUEwQixXQUExQjtBQUNEO0FBQ0YsR0FYRDs7QUFhQXRCLElBQUU0RSxRQUFGLEVBQVkySSxFQUFaLENBQWUsa0NBQWYsRUFBbUQscUJBQW5ELEVBQTBFLFlBQVc7QUFDbkYsUUFBSXNDLEtBQUs3UCxFQUFFLElBQUYsRUFBUXFCLElBQVIsQ0FBYSxjQUFiLENBQVQ7QUFDQXJCLFlBQU02UCxFQUFOLEVBQVkzSyxjQUFaLENBQTJCLG1CQUEzQixFQUFnRCxDQUFDbEYsRUFBRSxJQUFGLENBQUQsQ0FBaEQ7QUFDRCxHQUhEOztBQUtBOzs7OztBQUtBQSxJQUFFMEcsTUFBRixFQUFVNkcsRUFBVixDQUFhLE1BQWIsRUFBcUIsWUFBTTtBQUN6QjhKO0FBQ0QsR0FGRDs7QUFJQSxXQUFTQSxjQUFULEdBQTBCO0FBQ3hCQztBQUNBQztBQUNBQztBQUNBQztBQUNEOztBQUVEO0FBQ0EsV0FBU0EsZUFBVCxDQUF5QjFXLFVBQXpCLEVBQXFDO0FBQ25DLFFBQUkyVyxZQUFZMVgsRUFBRSxpQkFBRixDQUFoQjtBQUFBLFFBQ0kyWCxZQUFZLENBQUMsVUFBRCxFQUFhLFNBQWIsRUFBd0IsUUFBeEIsQ0FEaEI7O0FBR0EsUUFBRzVXLFVBQUgsRUFBYztBQUNaLFVBQUcsT0FBT0EsVUFBUCxLQUFzQixRQUF6QixFQUFrQztBQUNoQzRXLGtCQUFVcFcsSUFBVixDQUFlUixVQUFmO0FBQ0QsT0FGRCxNQUVNLElBQUcsUUFBT0EsVUFBUCx5Q0FBT0EsVUFBUCxPQUFzQixRQUF0QixJQUFrQyxPQUFPQSxXQUFXLENBQVgsQ0FBUCxLQUF5QixRQUE5RCxFQUF1RTtBQUMzRTRXLGtCQUFVdlAsTUFBVixDQUFpQnJILFVBQWpCO0FBQ0QsT0FGSyxNQUVEO0FBQ0g4QixnQkFBUUMsS0FBUixDQUFjLDhCQUFkO0FBQ0Q7QUFDRjtBQUNELFFBQUc0VSxVQUFVM1UsTUFBYixFQUFvQjtBQUNsQixVQUFJNlUsWUFBWUQsVUFBVXZULEdBQVYsQ0FBYyxVQUFDM0QsSUFBRCxFQUFVO0FBQ3RDLCtCQUFxQkEsSUFBckI7QUFDRCxPQUZlLEVBRWJvWCxJQUZhLENBRVIsR0FGUSxDQUFoQjs7QUFJQTdYLFFBQUUwRyxNQUFGLEVBQVVrSCxHQUFWLENBQWNnSyxTQUFkLEVBQXlCckssRUFBekIsQ0FBNEJxSyxTQUE1QixFQUF1QyxVQUFTMVQsQ0FBVCxFQUFZNFQsUUFBWixFQUFxQjtBQUMxRCxZQUFJdFgsU0FBUzBELEVBQUVsQixTQUFGLENBQVlpQixLQUFaLENBQWtCLEdBQWxCLEVBQXVCLENBQXZCLENBQWI7QUFDQSxZQUFJbEMsVUFBVS9CLGFBQVdRLE1BQVgsUUFBc0J1WCxHQUF0QixzQkFBNkNELFFBQTdDLFFBQWQ7O0FBRUEvVixnQkFBUUUsSUFBUixDQUFhLFlBQVU7QUFDckIsY0FBSUcsUUFBUXBDLEVBQUUsSUFBRixDQUFaOztBQUVBb0MsZ0JBQU04QyxjQUFOLENBQXFCLGtCQUFyQixFQUF5QyxDQUFDOUMsS0FBRCxDQUF6QztBQUNELFNBSkQ7QUFLRCxPQVREO0FBVUQ7QUFDRjs7QUFFRCxXQUFTbVYsY0FBVCxDQUF3QlMsUUFBeEIsRUFBaUM7QUFDL0IsUUFBSXpTLGNBQUo7QUFBQSxRQUNJMFMsU0FBU2pZLEVBQUUsZUFBRixDQURiO0FBRUEsUUFBR2lZLE9BQU9sVixNQUFWLEVBQWlCO0FBQ2YvQyxRQUFFMEcsTUFBRixFQUFVa0gsR0FBVixDQUFjLG1CQUFkLEVBQ0NMLEVBREQsQ0FDSSxtQkFESixFQUN5QixVQUFTckosQ0FBVCxFQUFZO0FBQ25DLFlBQUlxQixLQUFKLEVBQVc7QUFBRW1DLHVCQUFhbkMsS0FBYjtBQUFzQjs7QUFFbkNBLGdCQUFRTixXQUFXLFlBQVU7O0FBRTNCLGNBQUcsQ0FBQytSLGdCQUFKLEVBQXFCO0FBQUM7QUFDcEJpQixtQkFBT2hXLElBQVAsQ0FBWSxZQUFVO0FBQ3BCakMsZ0JBQUUsSUFBRixFQUFRa0YsY0FBUixDQUF1QixxQkFBdkI7QUFDRCxhQUZEO0FBR0Q7QUFDRDtBQUNBK1MsaUJBQU8xWCxJQUFQLENBQVksYUFBWixFQUEyQixRQUEzQjtBQUNELFNBVE8sRUFTTHlYLFlBQVksRUFUUCxDQUFSLENBSG1DLENBWWhCO0FBQ3BCLE9BZEQ7QUFlRDtBQUNGOztBQUVELFdBQVNSLGNBQVQsQ0FBd0JRLFFBQXhCLEVBQWlDO0FBQy9CLFFBQUl6UyxjQUFKO0FBQUEsUUFDSTBTLFNBQVNqWSxFQUFFLGVBQUYsQ0FEYjtBQUVBLFFBQUdpWSxPQUFPbFYsTUFBVixFQUFpQjtBQUNmL0MsUUFBRTBHLE1BQUYsRUFBVWtILEdBQVYsQ0FBYyxtQkFBZCxFQUNDTCxFQURELENBQ0ksbUJBREosRUFDeUIsVUFBU3JKLENBQVQsRUFBVztBQUNsQyxZQUFHcUIsS0FBSCxFQUFTO0FBQUVtQyx1QkFBYW5DLEtBQWI7QUFBc0I7O0FBRWpDQSxnQkFBUU4sV0FBVyxZQUFVOztBQUUzQixjQUFHLENBQUMrUixnQkFBSixFQUFxQjtBQUFDO0FBQ3BCaUIsbUJBQU9oVyxJQUFQLENBQVksWUFBVTtBQUNwQmpDLGdCQUFFLElBQUYsRUFBUWtGLGNBQVIsQ0FBdUIscUJBQXZCO0FBQ0QsYUFGRDtBQUdEO0FBQ0Q7QUFDQStTLGlCQUFPMVgsSUFBUCxDQUFZLGFBQVosRUFBMkIsUUFBM0I7QUFDRCxTQVRPLEVBU0x5WCxZQUFZLEVBVFAsQ0FBUixDQUhrQyxDQVlmO0FBQ3BCLE9BZEQ7QUFlRDtBQUNGOztBQUVELFdBQVNWLGNBQVQsR0FBMEI7QUFDeEIsUUFBRyxDQUFDTixnQkFBSixFQUFxQjtBQUFFLGFBQU8sS0FBUDtBQUFlO0FBQ3RDLFFBQUlrQixRQUFRdFQsU0FBU3VULGdCQUFULENBQTBCLDZDQUExQixDQUFaOztBQUVBO0FBQ0EsUUFBSUMsNEJBQTRCLFNBQTVCQSx5QkFBNEIsQ0FBVUMsbUJBQVYsRUFBK0I7QUFDM0QsVUFBSUMsVUFBVXRZLEVBQUVxWSxvQkFBb0IsQ0FBcEIsRUFBdUI3SyxNQUF6QixDQUFkOztBQUVIO0FBQ0csY0FBUTZLLG9CQUFvQixDQUFwQixFQUF1QmxXLElBQS9COztBQUVFLGFBQUssWUFBTDtBQUNFLGNBQUltVyxRQUFRL1gsSUFBUixDQUFhLGFBQWIsTUFBZ0MsUUFBaEMsSUFBNEM4WCxvQkFBb0IsQ0FBcEIsRUFBdUJFLGFBQXZCLEtBQXlDLGFBQXpGLEVBQXdHO0FBQzdHRCxvQkFBUXBULGNBQVIsQ0FBdUIscUJBQXZCLEVBQThDLENBQUNvVCxPQUFELEVBQVU1UixPQUFPOEQsV0FBakIsQ0FBOUM7QUFDQTtBQUNELGNBQUk4TixRQUFRL1gsSUFBUixDQUFhLGFBQWIsTUFBZ0MsUUFBaEMsSUFBNEM4WCxvQkFBb0IsQ0FBcEIsRUFBdUJFLGFBQXZCLEtBQXlDLGFBQXpGLEVBQXdHO0FBQ3ZHRCxvQkFBUXBULGNBQVIsQ0FBdUIscUJBQXZCLEVBQThDLENBQUNvVCxPQUFELENBQTlDO0FBQ0M7QUFDRixjQUFJRCxvQkFBb0IsQ0FBcEIsRUFBdUJFLGFBQXZCLEtBQXlDLE9BQTdDLEVBQXNEO0FBQ3JERCxvQkFBUUUsT0FBUixDQUFnQixlQUFoQixFQUFpQ2pZLElBQWpDLENBQXNDLGFBQXRDLEVBQW9ELFFBQXBEO0FBQ0ErWCxvQkFBUUUsT0FBUixDQUFnQixlQUFoQixFQUFpQ3RULGNBQWpDLENBQWdELHFCQUFoRCxFQUF1RSxDQUFDb1QsUUFBUUUsT0FBUixDQUFnQixlQUFoQixDQUFELENBQXZFO0FBQ0E7QUFDRDs7QUFFSSxhQUFLLFdBQUw7QUFDSkYsa0JBQVFFLE9BQVIsQ0FBZ0IsZUFBaEIsRUFBaUNqWSxJQUFqQyxDQUFzQyxhQUF0QyxFQUFvRCxRQUFwRDtBQUNBK1gsa0JBQVFFLE9BQVIsQ0FBZ0IsZUFBaEIsRUFBaUN0VCxjQUFqQyxDQUFnRCxxQkFBaEQsRUFBdUUsQ0FBQ29ULFFBQVFFLE9BQVIsQ0FBZ0IsZUFBaEIsQ0FBRCxDQUF2RTtBQUNNOztBQUVGO0FBQ0UsaUJBQU8sS0FBUDtBQUNGO0FBdEJGO0FBd0JELEtBNUJIOztBQThCRSxRQUFJTixNQUFNblYsTUFBVixFQUFrQjtBQUNoQjtBQUNBLFdBQUssSUFBSVUsSUFBSSxDQUFiLEVBQWdCQSxLQUFLeVUsTUFBTW5WLE1BQU4sR0FBZSxDQUFwQyxFQUF1Q1UsR0FBdkMsRUFBNEM7QUFDMUMsWUFBSWdWLGtCQUFrQixJQUFJekIsZ0JBQUosQ0FBcUJvQix5QkFBckIsQ0FBdEI7QUFDQUssd0JBQWdCQyxPQUFoQixDQUF3QlIsTUFBTXpVLENBQU4sQ0FBeEIsRUFBa0MsRUFBRWtWLFlBQVksSUFBZCxFQUFvQkMsV0FBVyxJQUEvQixFQUFxQ0MsZUFBZSxLQUFwRCxFQUEyREMsU0FBUyxJQUFwRSxFQUEwRUMsaUJBQWlCLENBQUMsYUFBRCxFQUFnQixPQUFoQixDQUEzRixFQUFsQztBQUNEO0FBQ0Y7QUFDRjs7QUFFSDs7QUFFQTtBQUNBO0FBQ0E3WSxhQUFXOFksUUFBWCxHQUFzQjNCLGNBQXRCO0FBQ0E7QUFDQTtBQUVDLENBL01BLENBK01Dek8sTUEvTUQsQ0FBRDtBQ0ZBOzs7Ozs7QUFFQSxDQUFDLFVBQVM1SSxDQUFULEVBQVk7O0FBRWI7Ozs7Ozs7QUFGYSxNQVNQaVosU0FUTztBQVVYOzs7Ozs7O0FBT0EsdUJBQVloUSxPQUFaLEVBQXFCa0ssT0FBckIsRUFBOEI7QUFBQTs7QUFDNUIsV0FBSy9SLFFBQUwsR0FBZ0I2SCxPQUFoQjtBQUNBLFdBQUtrSyxPQUFMLEdBQWVuVCxFQUFFeU0sTUFBRixDQUFTLEVBQVQsRUFBYXdNLFVBQVVDLFFBQXZCLEVBQWlDLEtBQUs5WCxRQUFMLENBQWNDLElBQWQsRUFBakMsRUFBdUQ4UixPQUF2RCxDQUFmOztBQUVBLFdBQUtqUixLQUFMOztBQUVBaEMsaUJBQVdZLGNBQVgsQ0FBMEIsSUFBMUIsRUFBZ0MsV0FBaEM7QUFDQVosaUJBQVdtTCxRQUFYLENBQW9CMkIsUUFBcEIsQ0FBNkIsV0FBN0IsRUFBMEM7QUFDeEMsaUJBQVMsUUFEK0I7QUFFeEMsaUJBQVMsUUFGK0I7QUFHeEMsc0JBQWMsTUFIMEI7QUFJeEMsb0JBQVk7QUFKNEIsT0FBMUM7QUFNRDs7QUFFRDs7Ozs7O0FBaENXO0FBQUE7QUFBQSw4QkFvQ0g7QUFBQTs7QUFDTixhQUFLNUwsUUFBTCxDQUFjYixJQUFkLENBQW1CLE1BQW5CLEVBQTJCLFNBQTNCO0FBQ0EsYUFBSzRZLEtBQUwsR0FBYSxLQUFLL1gsUUFBTCxDQUFjNFIsUUFBZCxDQUF1Qix1QkFBdkIsQ0FBYjs7QUFFQSxhQUFLbUcsS0FBTCxDQUFXbFgsSUFBWCxDQUFnQixVQUFTbVgsR0FBVCxFQUFjL1UsRUFBZCxFQUFrQjtBQUNoQyxjQUFJUixNQUFNN0QsRUFBRXFFLEVBQUYsQ0FBVjtBQUFBLGNBQ0lnVixXQUFXeFYsSUFBSW1QLFFBQUosQ0FBYSxvQkFBYixDQURmO0FBQUEsY0FFSW5ELEtBQUt3SixTQUFTLENBQVQsRUFBWXhKLEVBQVosSUFBa0IzUCxXQUFXaUIsV0FBWCxDQUF1QixDQUF2QixFQUEwQixXQUExQixDQUYzQjtBQUFBLGNBR0ltWSxTQUFTalYsR0FBR3dMLEVBQUgsSUFBWUEsRUFBWixXQUhiOztBQUtBaE0sY0FBSUYsSUFBSixDQUFTLFNBQVQsRUFBb0JwRCxJQUFwQixDQUF5QjtBQUN2Qiw2QkFBaUJzUCxFQURNO0FBRXZCLG9CQUFRLEtBRmU7QUFHdkIsa0JBQU15SixNQUhpQjtBQUl2Qiw2QkFBaUIsS0FKTTtBQUt2Qiw2QkFBaUI7QUFMTSxXQUF6Qjs7QUFRQUQsbUJBQVM5WSxJQUFULENBQWMsRUFBQyxRQUFRLFVBQVQsRUFBcUIsbUJBQW1CK1ksTUFBeEMsRUFBZ0QsZUFBZSxJQUEvRCxFQUFxRSxNQUFNekosRUFBM0UsRUFBZDtBQUNELFNBZkQ7QUFnQkEsWUFBSTBKLGNBQWMsS0FBS25ZLFFBQUwsQ0FBY3VDLElBQWQsQ0FBbUIsWUFBbkIsRUFBaUNxUCxRQUFqQyxDQUEwQyxvQkFBMUMsQ0FBbEI7QUFDQSxhQUFLd0csYUFBTCxHQUFxQixJQUFyQjtBQUNBLFlBQUdELFlBQVl4VyxNQUFmLEVBQXNCO0FBQ3BCLGVBQUswVyxJQUFMLENBQVVGLFdBQVYsRUFBdUIsS0FBS0MsYUFBNUI7QUFDQSxlQUFLQSxhQUFMLEdBQXFCLEtBQXJCO0FBQ0Q7O0FBRUQsYUFBS0UsY0FBTCxHQUFzQixZQUFNO0FBQzFCLGNBQUk5TyxTQUFTbEUsT0FBT2lULFFBQVAsQ0FBZ0JDLElBQTdCO0FBQ0E7QUFDQSxjQUFHaFAsT0FBTzdILE1BQVYsRUFBa0I7QUFDaEIsZ0JBQUk4VyxRQUFRLE9BQUt6WSxRQUFMLENBQWN1QyxJQUFkLENBQW1CLGFBQVdpSCxNQUFYLEdBQWtCLElBQXJDLENBQVo7QUFBQSxnQkFDQWtQLFVBQVU5WixFQUFFNEssTUFBRixDQURWOztBQUdBLGdCQUFJaVAsTUFBTTlXLE1BQU4sSUFBZ0IrVyxPQUFwQixFQUE2QjtBQUMzQixrQkFBSSxDQUFDRCxNQUFNM1EsTUFBTixDQUFhLHVCQUFiLEVBQXNDNlEsUUFBdEMsQ0FBK0MsV0FBL0MsQ0FBTCxFQUFrRTtBQUNoRSx1QkFBS04sSUFBTCxDQUFVSyxPQUFWLEVBQW1CLE9BQUtOLGFBQXhCO0FBQ0EsdUJBQUtBLGFBQUwsR0FBcUIsS0FBckI7QUFDRDs7QUFFRDtBQUNBLGtCQUFJLE9BQUtyRyxPQUFMLENBQWE2RyxjQUFqQixFQUFpQztBQUMvQixvQkFBSTVYLGNBQUo7QUFDQXBDLGtCQUFFMEcsTUFBRixFQUFVdVQsSUFBVixDQUFlLFlBQVc7QUFDeEIsc0JBQUl0USxTQUFTdkgsTUFBTWhCLFFBQU4sQ0FBZXVJLE1BQWYsRUFBYjtBQUNBM0osb0JBQUUsWUFBRixFQUFnQm9SLE9BQWhCLENBQXdCLEVBQUU4SSxXQUFXdlEsT0FBT0wsR0FBcEIsRUFBeEIsRUFBbURsSCxNQUFNK1EsT0FBTixDQUFjZ0gsbUJBQWpFO0FBQ0QsaUJBSEQ7QUFJRDs7QUFFRDs7OztBQUlBLHFCQUFLL1ksUUFBTCxDQUFjRSxPQUFkLENBQXNCLHVCQUF0QixFQUErQyxDQUFDdVksS0FBRCxFQUFRQyxPQUFSLENBQS9DO0FBQ0Q7QUFDRjtBQUNGLFNBN0JEOztBQStCQTtBQUNBLFlBQUksS0FBSzNHLE9BQUwsQ0FBYWlILFFBQWpCLEVBQTJCO0FBQ3pCLGVBQUtWLGNBQUw7QUFDRDs7QUFFRCxhQUFLVyxPQUFMO0FBQ0Q7O0FBRUQ7Ozs7O0FBdEdXO0FBQUE7QUFBQSxnQ0EwR0Q7QUFDUixZQUFJalksUUFBUSxJQUFaOztBQUVBLGFBQUsrVyxLQUFMLENBQVdsWCxJQUFYLENBQWdCLFlBQVc7QUFDekIsY0FBSXlCLFFBQVExRCxFQUFFLElBQUYsQ0FBWjtBQUNBLGNBQUlzYSxjQUFjNVcsTUFBTXNQLFFBQU4sQ0FBZSxvQkFBZixDQUFsQjtBQUNBLGNBQUlzSCxZQUFZdlgsTUFBaEIsRUFBd0I7QUFDdEJXLGtCQUFNc1AsUUFBTixDQUFlLEdBQWYsRUFBb0JwRixHQUFwQixDQUF3Qix5Q0FBeEIsRUFDUUwsRUFEUixDQUNXLG9CQURYLEVBQ2lDLFVBQVNySixDQUFULEVBQVk7QUFDM0NBLGdCQUFFdUosY0FBRjtBQUNBckwsb0JBQU1tWSxNQUFOLENBQWFELFdBQWI7QUFDRCxhQUpELEVBSUcvTSxFQUpILENBSU0sc0JBSk4sRUFJOEIsVUFBU3JKLENBQVQsRUFBVztBQUN2Q2hFLHlCQUFXbUwsUUFBWCxDQUFvQmEsU0FBcEIsQ0FBOEJoSSxDQUE5QixFQUFpQyxXQUFqQyxFQUE4QztBQUM1Q3FXLHdCQUFRLGtCQUFXO0FBQ2pCblksd0JBQU1tWSxNQUFOLENBQWFELFdBQWI7QUFDRCxpQkFIMkM7QUFJNUNFLHNCQUFNLGdCQUFXO0FBQ2Ysc0JBQUlDLEtBQUsvVyxNQUFNOFcsSUFBTixHQUFhN1csSUFBYixDQUFrQixHQUFsQixFQUF1QitKLEtBQXZCLEVBQVQ7QUFDQSxzQkFBSSxDQUFDdEwsTUFBTStRLE9BQU4sQ0FBY3VILFdBQW5CLEVBQWdDO0FBQzlCRCx1QkFBR25aLE9BQUgsQ0FBVyxvQkFBWDtBQUNEO0FBQ0YsaUJBVDJDO0FBVTVDcVosMEJBQVUsb0JBQVc7QUFDbkIsc0JBQUlGLEtBQUsvVyxNQUFNa1gsSUFBTixHQUFhalgsSUFBYixDQUFrQixHQUFsQixFQUF1QitKLEtBQXZCLEVBQVQ7QUFDQSxzQkFBSSxDQUFDdEwsTUFBTStRLE9BQU4sQ0FBY3VILFdBQW5CLEVBQWdDO0FBQzlCRCx1QkFBR25aLE9BQUgsQ0FBVyxvQkFBWDtBQUNEO0FBQ0YsaUJBZjJDO0FBZ0I1Q3FMLHlCQUFTLG1CQUFXO0FBQ2xCekksb0JBQUV1SixjQUFGO0FBQ0F2SixvQkFBRWlULGVBQUY7QUFDRDtBQW5CMkMsZUFBOUM7QUFxQkQsYUExQkQ7QUEyQkQ7QUFDRixTQWhDRDtBQWlDQSxZQUFHLEtBQUtoRSxPQUFMLENBQWFpSCxRQUFoQixFQUEwQjtBQUN4QnBhLFlBQUUwRyxNQUFGLEVBQVU2RyxFQUFWLENBQWEsVUFBYixFQUF5QixLQUFLbU0sY0FBOUI7QUFDRDtBQUNGOztBQUVEOzs7Ozs7QUFuSlc7QUFBQTtBQUFBLDZCQXdKSnBCLE9BeEpJLEVBd0pLO0FBQ2QsWUFBR0EsUUFBUXBQLE1BQVIsR0FBaUI2USxRQUFqQixDQUEwQixXQUExQixDQUFILEVBQTJDO0FBQ3pDLGVBQUtjLEVBQUwsQ0FBUXZDLE9BQVI7QUFDRCxTQUZELE1BRU87QUFDTCxlQUFLbUIsSUFBTCxDQUFVbkIsT0FBVjtBQUNEO0FBQ0Q7QUFDQSxZQUFJLEtBQUtuRixPQUFMLENBQWFpSCxRQUFqQixFQUEyQjtBQUN6QixjQUFJeFAsU0FBUzBOLFFBQVFzQyxJQUFSLENBQWEsR0FBYixFQUFrQnJhLElBQWxCLENBQXVCLE1BQXZCLENBQWI7O0FBRUEsY0FBSSxLQUFLNFMsT0FBTCxDQUFhMkgsYUFBakIsRUFBZ0M7QUFDOUJDLG9CQUFRQyxTQUFSLENBQWtCLEVBQWxCLEVBQXNCLEVBQXRCLEVBQTBCcFEsTUFBMUI7QUFDRCxXQUZELE1BRU87QUFDTG1RLG9CQUFRRSxZQUFSLENBQXFCLEVBQXJCLEVBQXlCLEVBQXpCLEVBQTZCclEsTUFBN0I7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7Ozs7Ozs7O0FBMUtXO0FBQUE7QUFBQSwyQkFpTE4wTixPQWpMTSxFQWlMRzRDLFNBakxILEVBaUxjO0FBQUE7O0FBQ3ZCNUMsZ0JBQ0cvWCxJQURILENBQ1EsYUFEUixFQUN1QixLQUR2QixFQUVHMkksTUFGSCxDQUVVLG9CQUZWLEVBR0d0RixPQUhILEdBSUdzRixNQUpILEdBSVk4SSxRQUpaLENBSXFCLFdBSnJCOztBQU1BLFlBQUksQ0FBQyxLQUFLbUIsT0FBTCxDQUFhdUgsV0FBZCxJQUE2QixDQUFDUSxTQUFsQyxFQUE2QztBQUMzQyxjQUFJQyxpQkFBaUIsS0FBSy9aLFFBQUwsQ0FBYzRSLFFBQWQsQ0FBdUIsWUFBdkIsRUFBcUNBLFFBQXJDLENBQThDLG9CQUE5QyxDQUFyQjtBQUNBLGNBQUltSSxlQUFlcFksTUFBbkIsRUFBMkI7QUFDekIsaUJBQUs4WCxFQUFMLENBQVFNLGVBQWVwRCxHQUFmLENBQW1CTyxPQUFuQixDQUFSO0FBQ0Q7QUFDRjs7QUFFREEsZ0JBQVE4QyxTQUFSLENBQWtCLEtBQUtqSSxPQUFMLENBQWFrSSxVQUEvQixFQUEyQyxZQUFNO0FBQy9DOzs7O0FBSUEsaUJBQUtqYSxRQUFMLENBQWNFLE9BQWQsQ0FBc0IsbUJBQXRCLEVBQTJDLENBQUNnWCxPQUFELENBQTNDO0FBQ0QsU0FORDs7QUFRQXRZLGdCQUFNc1ksUUFBUS9YLElBQVIsQ0FBYSxpQkFBYixDQUFOLEVBQXlDQSxJQUF6QyxDQUE4QztBQUM1QywyQkFBaUIsSUFEMkI7QUFFNUMsMkJBQWlCO0FBRjJCLFNBQTlDO0FBSUQ7O0FBRUQ7Ozs7Ozs7QUE3TVc7QUFBQTtBQUFBLHlCQW1OUitYLE9Bbk5RLEVBbU5DO0FBQ1YsWUFBSWdELFNBQVNoRCxRQUFRcFAsTUFBUixHQUFpQnFTLFFBQWpCLEVBQWI7QUFBQSxZQUNJblosUUFBUSxJQURaOztBQUdBLFlBQUksQ0FBQyxLQUFLK1EsT0FBTCxDQUFhcUksY0FBZCxJQUFnQyxDQUFDRixPQUFPdkIsUUFBUCxDQUFnQixXQUFoQixDQUFsQyxJQUFtRSxDQUFDekIsUUFBUXBQLE1BQVIsR0FBaUI2USxRQUFqQixDQUEwQixXQUExQixDQUF2RSxFQUErRztBQUM3RztBQUNEOztBQUVEO0FBQ0V6QixnQkFBUW1ELE9BQVIsQ0FBZ0JyWixNQUFNK1EsT0FBTixDQUFja0ksVUFBOUIsRUFBMEMsWUFBWTtBQUNwRDs7OztBQUlBalosZ0JBQU1oQixRQUFOLENBQWVFLE9BQWYsQ0FBdUIsaUJBQXZCLEVBQTBDLENBQUNnWCxPQUFELENBQTFDO0FBQ0QsU0FORDtBQU9GOztBQUVBQSxnQkFBUS9YLElBQVIsQ0FBYSxhQUFiLEVBQTRCLElBQTVCLEVBQ1EySSxNQURSLEdBQ2lCakQsV0FEakIsQ0FDNkIsV0FEN0I7O0FBR0FqRyxnQkFBTXNZLFFBQVEvWCxJQUFSLENBQWEsaUJBQWIsQ0FBTixFQUF5Q0EsSUFBekMsQ0FBOEM7QUFDN0MsMkJBQWlCLEtBRDRCO0FBRTdDLDJCQUFpQjtBQUY0QixTQUE5QztBQUlEOztBQUVEOzs7Ozs7QUE5T1c7QUFBQTtBQUFBLGdDQW1QRDtBQUNSLGFBQUthLFFBQUwsQ0FBY3VDLElBQWQsQ0FBbUIsb0JBQW5CLEVBQXlDK1gsSUFBekMsQ0FBOEMsSUFBOUMsRUFBb0RELE9BQXBELENBQTRELENBQTVELEVBQStEak4sR0FBL0QsQ0FBbUUsU0FBbkUsRUFBOEUsRUFBOUU7QUFDQSxhQUFLcE4sUUFBTCxDQUFjdUMsSUFBZCxDQUFtQixHQUFuQixFQUF3QmlLLEdBQXhCLENBQTRCLGVBQTVCO0FBQ0EsWUFBRyxLQUFLdUYsT0FBTCxDQUFhaUgsUUFBaEIsRUFBMEI7QUFDeEJwYSxZQUFFMEcsTUFBRixFQUFVa0gsR0FBVixDQUFjLFVBQWQsRUFBMEIsS0FBSzhMLGNBQS9CO0FBQ0Q7O0FBRUR4WixtQkFBV3NCLGdCQUFYLENBQTRCLElBQTVCO0FBQ0Q7QUEzUFU7O0FBQUE7QUFBQTs7QUE4UGJ5WCxZQUFVQyxRQUFWLEdBQXFCO0FBQ25COzs7Ozs7QUFNQW1DLGdCQUFZLEdBUE87QUFRbkI7Ozs7OztBQU1BWCxpQkFBYSxLQWRNO0FBZW5COzs7Ozs7QUFNQWMsb0JBQWdCLEtBckJHO0FBc0JuQjs7Ozs7O0FBTUFwQixjQUFVLEtBNUJTOztBQThCbkI7Ozs7OztBQU1BSixvQkFBZ0IsS0FwQ0c7O0FBc0NuQjs7Ozs7O0FBTUFHLHlCQUFxQixHQTVDRjs7QUE4Q25COzs7Ozs7QUFNQVcsbUJBQWU7QUFwREksR0FBckI7O0FBdURBO0FBQ0E1YSxhQUFXTSxNQUFYLENBQWtCeVksU0FBbEIsRUFBNkIsV0FBN0I7QUFFQyxDQXhUQSxDQXdUQ3JRLE1BeFRELENBQUQ7QUNGQTs7Ozs7O0FBRUEsQ0FBQyxVQUFTNUksQ0FBVCxFQUFZOztBQUViOzs7Ozs7O0FBRmEsTUFTUDJiLFdBVE87QUFVWDs7Ozs7OztBQU9BLHlCQUFZMVMsT0FBWixFQUFxQmtLLE9BQXJCLEVBQThCO0FBQUE7O0FBQzVCLFdBQUsvUixRQUFMLEdBQWdCNkgsT0FBaEI7QUFDQSxXQUFLa0ssT0FBTCxHQUFlblQsRUFBRXlNLE1BQUYsQ0FBUyxFQUFULEVBQWFrUCxZQUFZekMsUUFBekIsRUFBbUMvRixPQUFuQyxDQUFmO0FBQ0EsV0FBS3lJLEtBQUwsR0FBYSxFQUFiO0FBQ0EsV0FBS0MsV0FBTCxHQUFtQixFQUFuQjs7QUFFQSxXQUFLM1osS0FBTDtBQUNBLFdBQUttWSxPQUFMOztBQUVBbmEsaUJBQVdZLGNBQVgsQ0FBMEIsSUFBMUIsRUFBZ0MsYUFBaEM7QUFDRDs7QUFFRDs7Ozs7OztBQTdCVztBQUFBO0FBQUEsOEJBa0NIO0FBQ04sYUFBS2diLGVBQUw7QUFDQSxhQUFLQyxjQUFMO0FBQ0EsYUFBS0MsT0FBTDtBQUNEOztBQUVEOzs7Ozs7QUF4Q1c7QUFBQTtBQUFBLGdDQTZDRDtBQUFBOztBQUNSaGMsVUFBRTBHLE1BQUYsRUFBVTZHLEVBQVYsQ0FBYSx1QkFBYixFQUFzQ3JOLFdBQVdpRixJQUFYLENBQWdCQyxRQUFoQixDQUF5QixZQUFNO0FBQ25FLGlCQUFLNFcsT0FBTDtBQUNELFNBRnFDLEVBRW5DLEVBRm1DLENBQXRDO0FBR0Q7O0FBRUQ7Ozs7OztBQW5EVztBQUFBO0FBQUEsZ0NBd0REO0FBQ1IsWUFBSUMsS0FBSjs7QUFFQTtBQUNBLGFBQUssSUFBSXhZLENBQVQsSUFBYyxLQUFLbVksS0FBbkIsRUFBMEI7QUFDeEIsY0FBRyxLQUFLQSxLQUFMLENBQVdqTixjQUFYLENBQTBCbEwsQ0FBMUIsQ0FBSCxFQUFpQztBQUMvQixnQkFBSXlZLE9BQU8sS0FBS04sS0FBTCxDQUFXblksQ0FBWCxDQUFYO0FBQ0EsZ0JBQUlpRCxPQUFPeUksVUFBUCxDQUFrQitNLEtBQUtqTixLQUF2QixFQUE4QkcsT0FBbEMsRUFBMkM7QUFDekM2TSxzQkFBUUMsSUFBUjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRCxZQUFJRCxLQUFKLEVBQVc7QUFDVCxlQUFLdFQsT0FBTCxDQUFhc1QsTUFBTUUsSUFBbkI7QUFDRDtBQUNGOztBQUVEOzs7Ozs7QUExRVc7QUFBQTtBQUFBLHdDQStFTztBQUNoQixhQUFLLElBQUkxWSxDQUFULElBQWN2RCxXQUFXZ0csVUFBWCxDQUFzQmtJLE9BQXBDLEVBQTZDO0FBQzNDLGNBQUlsTyxXQUFXZ0csVUFBWCxDQUFzQmtJLE9BQXRCLENBQThCTyxjQUE5QixDQUE2Q2xMLENBQTdDLENBQUosRUFBcUQ7QUFDbkQsZ0JBQUl3TCxRQUFRL08sV0FBV2dHLFVBQVgsQ0FBc0JrSSxPQUF0QixDQUE4QjNLLENBQTlCLENBQVo7QUFDQWtZLHdCQUFZUyxlQUFaLENBQTRCbk4sTUFBTXhPLElBQWxDLElBQTBDd08sTUFBTUwsS0FBaEQ7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7Ozs7Ozs7O0FBeEZXO0FBQUE7QUFBQSxxQ0ErRkkzRixPQS9GSixFQStGYTtBQUN0QixZQUFJb1QsWUFBWSxFQUFoQjtBQUNBLFlBQUlULEtBQUo7O0FBRUEsWUFBSSxLQUFLekksT0FBTCxDQUFheUksS0FBakIsRUFBd0I7QUFDdEJBLGtCQUFRLEtBQUt6SSxPQUFMLENBQWF5SSxLQUFyQjtBQUNELFNBRkQsTUFHSztBQUNIQSxrQkFBUSxLQUFLeGEsUUFBTCxDQUFjQyxJQUFkLENBQW1CLGFBQW5CLENBQVI7QUFDRDs7QUFFRHVhLGdCQUFTLE9BQU9BLEtBQVAsS0FBaUIsUUFBakIsR0FBNEJBLE1BQU1LLEtBQU4sQ0FBWSxVQUFaLENBQTVCLEdBQXNETCxLQUEvRDs7QUFFQSxhQUFLLElBQUluWSxDQUFULElBQWNtWSxLQUFkLEVBQXFCO0FBQ25CLGNBQUdBLE1BQU1qTixjQUFOLENBQXFCbEwsQ0FBckIsQ0FBSCxFQUE0QjtBQUMxQixnQkFBSXlZLE9BQU9OLE1BQU1uWSxDQUFOLEVBQVNILEtBQVQsQ0FBZSxDQUFmLEVBQWtCLENBQUMsQ0FBbkIsRUFBc0JXLEtBQXRCLENBQTRCLElBQTVCLENBQVg7QUFDQSxnQkFBSWtZLE9BQU9ELEtBQUs1WSxLQUFMLENBQVcsQ0FBWCxFQUFjLENBQUMsQ0FBZixFQUFrQnVVLElBQWxCLENBQXVCLEVBQXZCLENBQVg7QUFDQSxnQkFBSTVJLFFBQVFpTixLQUFLQSxLQUFLblosTUFBTCxHQUFjLENBQW5CLENBQVo7O0FBRUEsZ0JBQUk0WSxZQUFZUyxlQUFaLENBQTRCbk4sS0FBNUIsQ0FBSixFQUF3QztBQUN0Q0Esc0JBQVEwTSxZQUFZUyxlQUFaLENBQTRCbk4sS0FBNUIsQ0FBUjtBQUNEOztBQUVEb04sc0JBQVU5YSxJQUFWLENBQWU7QUFDYjRhLG9CQUFNQSxJQURPO0FBRWJsTixxQkFBT0E7QUFGTSxhQUFmO0FBSUQ7QUFDRjs7QUFFRCxhQUFLMk0sS0FBTCxHQUFhUyxTQUFiO0FBQ0Q7O0FBRUQ7Ozs7Ozs7QUFoSVc7QUFBQTtBQUFBLDhCQXNJSEYsSUF0SUcsRUFzSUc7QUFDWixZQUFJLEtBQUtOLFdBQUwsS0FBcUJNLElBQXpCLEVBQStCOztBQUUvQixZQUFJL1osUUFBUSxJQUFaO0FBQUEsWUFDSWQsVUFBVSx5QkFEZDs7QUFHQTtBQUNBLFlBQUksS0FBS0YsUUFBTCxDQUFjLENBQWQsRUFBaUJrYixRQUFqQixLQUE4QixLQUFsQyxFQUF5QztBQUN2QyxlQUFLbGIsUUFBTCxDQUFjYixJQUFkLENBQW1CLEtBQW5CLEVBQTBCNGIsSUFBMUIsRUFBZ0M1TyxFQUFoQyxDQUFtQyxNQUFuQyxFQUEyQyxZQUFXO0FBQ3BEbkwsa0JBQU15WixXQUFOLEdBQW9CTSxJQUFwQjtBQUNELFdBRkQsRUFHQzdhLE9BSEQsQ0FHU0EsT0FIVDtBQUlEO0FBQ0Q7QUFOQSxhQU9LLElBQUk2YSxLQUFLRixLQUFMLENBQVcseUNBQVgsQ0FBSixFQUEyRDtBQUM5RCxpQkFBSzdhLFFBQUwsQ0FBY29OLEdBQWQsQ0FBa0IsRUFBRSxvQkFBb0IsU0FBTzJOLElBQVAsR0FBWSxHQUFsQyxFQUFsQixFQUNLN2EsT0FETCxDQUNhQSxPQURiO0FBRUQ7QUFDRDtBQUpLLGVBS0E7QUFDSHRCLGdCQUFFa1AsR0FBRixDQUFNaU4sSUFBTixFQUFZLFVBQVNJLFFBQVQsRUFBbUI7QUFDN0JuYSxzQkFBTWhCLFFBQU4sQ0FBZW9iLElBQWYsQ0FBb0JELFFBQXBCLEVBQ01qYixPQUROLENBQ2NBLE9BRGQ7QUFFQXRCLGtCQUFFdWMsUUFBRixFQUFZOVosVUFBWjtBQUNBTCxzQkFBTXlaLFdBQU4sR0FBb0JNLElBQXBCO0FBQ0QsZUFMRDtBQU1EOztBQUVEOzs7O0FBSUE7QUFDRDs7QUFFRDs7Ozs7QUF6S1c7QUFBQTtBQUFBLGdDQTZLRDtBQUNSO0FBQ0Q7QUEvS1U7O0FBQUE7QUFBQTs7QUFrTGI7Ozs7O0FBR0FSLGNBQVl6QyxRQUFaLEdBQXVCO0FBQ3JCOzs7Ozs7QUFNQTBDLFdBQU87QUFQYyxHQUF2Qjs7QUFVQUQsY0FBWVMsZUFBWixHQUE4QjtBQUM1QixpQkFBYSxxQ0FEZTtBQUU1QixnQkFBWSxvQ0FGZ0I7QUFHNUIsY0FBVTtBQUhrQixHQUE5Qjs7QUFNQTtBQUNBbGMsYUFBV00sTUFBWCxDQUFrQm1iLFdBQWxCLEVBQStCLGFBQS9CO0FBRUMsQ0F4TUEsQ0F3TUMvUyxNQXhNRCxDQUFEO0FDRkE7Ozs7OztBQUVBLENBQUMsVUFBUzVJLENBQVQsRUFBWTs7QUFFYjs7Ozs7QUFGYSxNQU9QeWMsUUFQTztBQVFYOzs7Ozs7O0FBT0Esc0JBQVl4VCxPQUFaLEVBQXFCa0ssT0FBckIsRUFBOEI7QUFBQTs7QUFDNUIsV0FBSy9SLFFBQUwsR0FBZ0I2SCxPQUFoQjtBQUNBLFdBQUtrSyxPQUFMLEdBQWdCblQsRUFBRXlNLE1BQUYsQ0FBUyxFQUFULEVBQWFnUSxTQUFTdkQsUUFBdEIsRUFBZ0MsS0FBSzlYLFFBQUwsQ0FBY0MsSUFBZCxFQUFoQyxFQUFzRDhSLE9BQXRELENBQWhCOztBQUVBLFdBQUtqUixLQUFMO0FBQ0EsV0FBS3dhLFVBQUw7O0FBRUF4YyxpQkFBV1ksY0FBWCxDQUEwQixJQUExQixFQUFnQyxVQUFoQztBQUNEOztBQUVEOzs7Ozs7QUF6Qlc7QUFBQTtBQUFBLDhCQTZCSDtBQUNOLFlBQUkrTyxLQUFLLEtBQUt6TyxRQUFMLENBQWMsQ0FBZCxFQUFpQnlPLEVBQWpCLElBQXVCM1AsV0FBV2lCLFdBQVgsQ0FBdUIsQ0FBdkIsRUFBMEIsVUFBMUIsQ0FBaEM7QUFDQSxZQUFJaUIsUUFBUSxJQUFaO0FBQ0EsYUFBS3VhLFFBQUwsR0FBZ0IzYyxFQUFFLHdCQUFGLENBQWhCO0FBQ0EsYUFBSzRjLE1BQUwsR0FBYyxLQUFLeGIsUUFBTCxDQUFjdUMsSUFBZCxDQUFtQixHQUFuQixDQUFkO0FBQ0EsYUFBS3ZDLFFBQUwsQ0FBY2IsSUFBZCxDQUFtQjtBQUNqQix5QkFBZXNQLEVBREU7QUFFakIseUJBQWVBLEVBRkU7QUFHakIsZ0JBQU1BO0FBSFcsU0FBbkI7QUFLQSxhQUFLZ04sT0FBTCxHQUFlN2MsR0FBZjtBQUNBLGFBQUs4YyxTQUFMLEdBQWlCQyxTQUFTclcsT0FBTzhELFdBQWhCLEVBQTZCLEVBQTdCLENBQWpCOztBQUVBLGFBQUs2UCxPQUFMO0FBQ0Q7O0FBRUQ7Ozs7OztBQTdDVztBQUFBO0FBQUEsbUNBa0RFO0FBQ1gsWUFBSWpZLFFBQVEsSUFBWjtBQUFBLFlBQ0lrSSxPQUFPMUYsU0FBUzBGLElBRHBCO0FBQUEsWUFFSWtTLE9BQU81WCxTQUFTdVAsZUFGcEI7O0FBSUEsYUFBSzZJLE1BQUwsR0FBYyxFQUFkO0FBQ0EsYUFBS0MsU0FBTCxHQUFpQmhhLEtBQUtDLEtBQUwsQ0FBV0QsS0FBS3dFLEdBQUwsQ0FBU2YsT0FBT3dXLFdBQWhCLEVBQTZCVixLQUFLVyxZQUFsQyxDQUFYLENBQWpCO0FBQ0EsYUFBS0MsU0FBTCxHQUFpQm5hLEtBQUtDLEtBQUwsQ0FBV0QsS0FBS3dFLEdBQUwsQ0FBUzZDLEtBQUsrUyxZQUFkLEVBQTRCL1MsS0FBS2dULFlBQWpDLEVBQStDZCxLQUFLVyxZQUFwRCxFQUFrRVgsS0FBS2EsWUFBdkUsRUFBcUZiLEtBQUtjLFlBQTFGLENBQVgsQ0FBakI7O0FBRUEsYUFBS1gsUUFBTCxDQUFjMWEsSUFBZCxDQUFtQixZQUFVO0FBQzNCLGNBQUlzYixPQUFPdmQsRUFBRSxJQUFGLENBQVg7QUFBQSxjQUNJd2QsS0FBS3ZhLEtBQUtDLEtBQUwsQ0FBV3FhLEtBQUs1VCxNQUFMLEdBQWNMLEdBQWQsR0FBb0JsSCxNQUFNK1EsT0FBTixDQUFjc0ssU0FBN0MsQ0FEVDtBQUVBRixlQUFLRyxXQUFMLEdBQW1CRixFQUFuQjtBQUNBcGIsZ0JBQU00YSxNQUFOLENBQWF6YixJQUFiLENBQWtCaWMsRUFBbEI7QUFDRCxTQUxEO0FBTUQ7O0FBRUQ7Ozs7O0FBbkVXO0FBQUE7QUFBQSxnQ0F1RUQ7QUFDUixZQUFJcGIsUUFBUSxJQUFaO0FBQUEsWUFDSXViLFFBQVEzZCxFQUFFLFlBQUYsQ0FEWjtBQUFBLFlBRUk4RCxPQUFPO0FBQ0x5TixvQkFBVW5QLE1BQU0rUSxPQUFOLENBQWN5SyxpQkFEbkI7QUFFTEMsa0JBQVV6YixNQUFNK1EsT0FBTixDQUFjMks7QUFGbkIsU0FGWDtBQU1BOWQsVUFBRTBHLE1BQUYsRUFBVXlMLEdBQVYsQ0FBYyxNQUFkLEVBQXNCLFlBQVU7QUFDOUIsY0FBRy9QLE1BQU0rUSxPQUFOLENBQWM0SyxXQUFqQixFQUE2QjtBQUMzQixnQkFBR3BFLFNBQVNDLElBQVosRUFBaUI7QUFDZnhYLG9CQUFNNGIsV0FBTixDQUFrQnJFLFNBQVNDLElBQTNCO0FBQ0Q7QUFDRjtBQUNEeFgsZ0JBQU1zYSxVQUFOO0FBQ0F0YSxnQkFBTTZiLGFBQU47QUFDRCxTQVJEOztBQVVBLGFBQUs3YyxRQUFMLENBQWNtTSxFQUFkLENBQWlCO0FBQ2YsaUNBQXVCLEtBQUtoSyxNQUFMLENBQVl1RSxJQUFaLENBQWlCLElBQWpCLENBRFI7QUFFZixpQ0FBdUIsS0FBS21XLGFBQUwsQ0FBbUJuVyxJQUFuQixDQUF3QixJQUF4QjtBQUZSLFNBQWpCLEVBR0d5RixFQUhILENBR00sbUJBSE4sRUFHMkIsY0FIM0IsRUFHMkMsVUFBU3JKLENBQVQsRUFBWTtBQUNuREEsWUFBRXVKLGNBQUY7QUFDQSxjQUFJeVEsVUFBWSxLQUFLQyxZQUFMLENBQWtCLE1BQWxCLENBQWhCO0FBQ0EvYixnQkFBTTRiLFdBQU4sQ0FBa0JFLE9BQWxCO0FBQ0QsU0FQSDtBQVFBbGUsVUFBRTBHLE1BQUYsRUFBVTZHLEVBQVYsQ0FBYSxVQUFiLEVBQXlCLFVBQVNySixDQUFULEVBQVk7QUFDbkMsY0FBRzlCLE1BQU0rUSxPQUFOLENBQWM0SyxXQUFqQixFQUE4QjtBQUM1QjNiLGtCQUFNNGIsV0FBTixDQUFrQnRYLE9BQU9pVCxRQUFQLENBQWdCQyxJQUFsQztBQUNEO0FBQ0YsU0FKRDtBQUtEOztBQUVEOzs7Ozs7QUF2R1c7QUFBQTtBQUFBLGtDQTRHQ3dFLEdBNUdELEVBNEdNO0FBQ2Y7QUFDQSxZQUFJLENBQUNwZSxFQUFFb2UsR0FBRixFQUFPcmIsTUFBWixFQUFvQjtBQUFDLGlCQUFPLEtBQVA7QUFBYztBQUNuQyxhQUFLc2IsYUFBTCxHQUFxQixJQUFyQjtBQUNBLFlBQUlqYyxRQUFRLElBQVo7QUFBQSxZQUNJMGEsWUFBWTdaLEtBQUtDLEtBQUwsQ0FBV2xELEVBQUVvZSxHQUFGLEVBQU96VSxNQUFQLEdBQWdCTCxHQUFoQixHQUFzQixLQUFLNkosT0FBTCxDQUFhc0ssU0FBYixHQUF5QixDQUEvQyxHQUFtRCxLQUFLdEssT0FBTCxDQUFhbUwsU0FBM0UsQ0FEaEI7O0FBR0F0ZSxVQUFFLFlBQUYsRUFBZ0IwYixJQUFoQixDQUFxQixJQUFyQixFQUEyQnRLLE9BQTNCLENBQ0UsRUFBRThJLFdBQVc0QyxTQUFiLEVBREYsRUFFRSxLQUFLM0osT0FBTCxDQUFheUssaUJBRmYsRUFHRSxLQUFLekssT0FBTCxDQUFhMkssZUFIZixFQUlFLFlBQVc7QUFBQzFiLGdCQUFNaWMsYUFBTixHQUFzQixLQUF0QixDQUE2QmpjLE1BQU02YixhQUFOO0FBQXNCLFNBSmpFO0FBTUQ7O0FBRUQ7Ozs7O0FBM0hXO0FBQUE7QUFBQSwrQkErSEY7QUFDUCxhQUFLdkIsVUFBTDtBQUNBLGFBQUt1QixhQUFMO0FBQ0Q7O0FBRUQ7Ozs7Ozs7QUFwSVc7QUFBQTtBQUFBLHNDQTBJRyx3QkFBMEI7QUFDdEMsWUFBRyxLQUFLSSxhQUFSLEVBQXVCO0FBQUM7QUFBUTtBQUNoQyxZQUFJRSxTQUFTLGdCQUFpQnhCLFNBQVNyVyxPQUFPOEQsV0FBaEIsRUFBNkIsRUFBN0IsQ0FBOUI7QUFBQSxZQUNJZ1UsTUFESjs7QUFHQSxZQUFHRCxTQUFTLEtBQUt0QixTQUFkLEtBQTRCLEtBQUtHLFNBQXBDLEVBQThDO0FBQUVvQixtQkFBUyxLQUFLeEIsTUFBTCxDQUFZamEsTUFBWixHQUFxQixDQUE5QjtBQUFrQyxTQUFsRixNQUNLLElBQUd3YixTQUFTLEtBQUt2QixNQUFMLENBQVksQ0FBWixDQUFaLEVBQTJCO0FBQUV3QixtQkFBU2pZLFNBQVQ7QUFBcUIsU0FBbEQsTUFDRDtBQUNGLGNBQUlrWSxTQUFTLEtBQUszQixTQUFMLEdBQWlCeUIsTUFBOUI7QUFBQSxjQUNJbmMsUUFBUSxJQURaO0FBQUEsY0FFSXNjLGFBQWEsS0FBSzFCLE1BQUwsQ0FBWWxRLE1BQVosQ0FBbUIsVUFBU3RLLENBQVQsRUFBWWlCLENBQVosRUFBYztBQUM1QyxtQkFBT2diLFNBQVNqYyxJQUFJSixNQUFNK1EsT0FBTixDQUFjbUwsU0FBbEIsSUFBK0JDLE1BQXhDLEdBQWlEL2IsSUFBSUosTUFBTStRLE9BQU4sQ0FBY21MLFNBQWxCLEdBQThCbGMsTUFBTStRLE9BQU4sQ0FBY3NLLFNBQTVDLElBQXlEYyxNQUFqSDtBQUNELFdBRlksQ0FGakI7QUFLQUMsbUJBQVNFLFdBQVczYixNQUFYLEdBQW9CMmIsV0FBVzNiLE1BQVgsR0FBb0IsQ0FBeEMsR0FBNEMsQ0FBckQ7QUFDRDs7QUFFRCxhQUFLOFosT0FBTCxDQUFhNVcsV0FBYixDQUF5QixLQUFLa04sT0FBTCxDQUFhckIsV0FBdEM7QUFDQSxhQUFLK0ssT0FBTCxHQUFlLEtBQUtELE1BQUwsQ0FBWTlQLE1BQVosQ0FBbUIsYUFBYSxLQUFLNlAsUUFBTCxDQUFjdFAsRUFBZCxDQUFpQm1SLE1BQWpCLEVBQXlCbmQsSUFBekIsQ0FBOEIsaUJBQTlCLENBQWIsR0FBZ0UsSUFBbkYsRUFBeUYyUSxRQUF6RixDQUFrRyxLQUFLbUIsT0FBTCxDQUFhckIsV0FBL0csQ0FBZjs7QUFFQSxZQUFHLEtBQUtxQixPQUFMLENBQWE0SyxXQUFoQixFQUE0QjtBQUMxQixjQUFJbkUsT0FBTyxFQUFYO0FBQ0EsY0FBRzRFLFVBQVVqWSxTQUFiLEVBQXVCO0FBQ3JCcVQsbUJBQU8sS0FBS2lELE9BQUwsQ0FBYSxDQUFiLEVBQWdCc0IsWUFBaEIsQ0FBNkIsTUFBN0IsQ0FBUDtBQUNEO0FBQ0QsY0FBR3ZFLFNBQVNsVCxPQUFPaVQsUUFBUCxDQUFnQkMsSUFBNUIsRUFBa0M7QUFDaEMsZ0JBQUdsVCxPQUFPcVUsT0FBUCxDQUFlQyxTQUFsQixFQUE0QjtBQUMxQnRVLHFCQUFPcVUsT0FBUCxDQUFlQyxTQUFmLENBQXlCLElBQXpCLEVBQStCLElBQS9CLEVBQXFDcEIsSUFBckM7QUFDRCxhQUZELE1BRUs7QUFDSGxULHFCQUFPaVQsUUFBUCxDQUFnQkMsSUFBaEIsR0FBdUJBLElBQXZCO0FBQ0Q7QUFDRjtBQUNGOztBQUVELGFBQUtrRCxTQUFMLEdBQWlCeUIsTUFBakI7QUFDQTs7OztBQUlBLGFBQUtuZCxRQUFMLENBQWNFLE9BQWQsQ0FBc0Isb0JBQXRCLEVBQTRDLENBQUMsS0FBS3ViLE9BQU4sQ0FBNUM7QUFDRDs7QUFFRDs7Ozs7QUFuTFc7QUFBQTtBQUFBLGdDQXVMRDtBQUNSLGFBQUt6YixRQUFMLENBQWN3TSxHQUFkLENBQWtCLDBCQUFsQixFQUNLakssSUFETCxPQUNjLEtBQUt3UCxPQUFMLENBQWFyQixXQUQzQixFQUMwQzdMLFdBRDFDLENBQ3NELEtBQUtrTixPQUFMLENBQWFyQixXQURuRTs7QUFHQSxZQUFHLEtBQUtxQixPQUFMLENBQWE0SyxXQUFoQixFQUE0QjtBQUMxQixjQUFJbkUsT0FBTyxLQUFLaUQsT0FBTCxDQUFhLENBQWIsRUFBZ0JzQixZQUFoQixDQUE2QixNQUE3QixDQUFYO0FBQ0F6WCxpQkFBT2lULFFBQVAsQ0FBZ0JDLElBQWhCLENBQXFCalIsT0FBckIsQ0FBNkJpUixJQUE3QixFQUFtQyxFQUFuQztBQUNEOztBQUVEMVosbUJBQVdzQixnQkFBWCxDQUE0QixJQUE1QjtBQUNEO0FBak1VOztBQUFBO0FBQUE7O0FBb01iOzs7OztBQUdBaWIsV0FBU3ZELFFBQVQsR0FBb0I7QUFDbEI7Ozs7OztBQU1BMEUsdUJBQW1CLEdBUEQ7QUFRbEI7Ozs7Ozs7QUFPQUUscUJBQWlCLFFBZkM7QUFnQmxCOzs7Ozs7QUFNQUwsZUFBVyxFQXRCTztBQXVCbEI7Ozs7OztBQU1BM0wsaUJBQWEsUUE3Qks7QUE4QmxCOzs7Ozs7QUFNQWlNLGlCQUFhLEtBcENLO0FBcUNsQjs7Ozs7O0FBTUFPLGVBQVc7O0FBR2I7QUE5Q29CLEdBQXBCLENBK0NBcGUsV0FBV00sTUFBWCxDQUFrQmljLFFBQWxCLEVBQTRCLFVBQTVCO0FBRUMsQ0F4UEEsQ0F3UEM3VCxNQXhQRCxDQUFEO0FDRkE7Ozs7Ozs7O0FBRUEsQ0FBQyxVQUFTNUksQ0FBVCxFQUFZOztBQUViOzs7Ozs7O0FBRmEsTUFTUDJlLElBVE87QUFVWDs7Ozs7OztBQU9BLGtCQUFZMVYsT0FBWixFQUFxQmtLLE9BQXJCLEVBQThCO0FBQUE7O0FBQzVCLFdBQUsvUixRQUFMLEdBQWdCNkgsT0FBaEI7QUFDQSxXQUFLa0ssT0FBTCxHQUFlblQsRUFBRXlNLE1BQUYsQ0FBUyxFQUFULEVBQWFrUyxLQUFLekYsUUFBbEIsRUFBNEIsS0FBSzlYLFFBQUwsQ0FBY0MsSUFBZCxFQUE1QixFQUFrRDhSLE9BQWxELENBQWY7O0FBRUEsV0FBS2pSLEtBQUw7QUFDQWhDLGlCQUFXWSxjQUFYLENBQTBCLElBQTFCLEVBQWdDLE1BQWhDO0FBQ0FaLGlCQUFXbUwsUUFBWCxDQUFvQjJCLFFBQXBCLENBQTZCLE1BQTdCLEVBQXFDO0FBQ25DLGlCQUFTLE1BRDBCO0FBRW5DLGlCQUFTLE1BRjBCO0FBR25DLHVCQUFlLE1BSG9CO0FBSW5DLG9CQUFZLFVBSnVCO0FBS25DLHNCQUFjLE1BTHFCO0FBTW5DLHNCQUFjO0FBQ2Q7QUFDQTtBQVJtQyxPQUFyQztBQVVEOztBQUVEOzs7Ozs7QUFuQ1c7QUFBQTtBQUFBLDhCQXVDSDtBQUFBOztBQUNOLFlBQUk1SyxRQUFRLElBQVo7O0FBRUEsYUFBS2hCLFFBQUwsQ0FBY2IsSUFBZCxDQUFtQixFQUFDLFFBQVEsU0FBVCxFQUFuQjtBQUNBLGFBQUtxZSxVQUFMLEdBQWtCLEtBQUt4ZCxRQUFMLENBQWN1QyxJQUFkLE9BQXVCLEtBQUt3UCxPQUFMLENBQWEwTCxTQUFwQyxDQUFsQjtBQUNBLGFBQUt2RSxXQUFMLEdBQW1CdGEsMkJBQXlCLEtBQUtvQixRQUFMLENBQWMsQ0FBZCxFQUFpQnlPLEVBQTFDLFFBQW5COztBQUVBLGFBQUsrTyxVQUFMLENBQWdCM2MsSUFBaEIsQ0FBcUIsWUFBVTtBQUM3QixjQUFJeUIsUUFBUTFELEVBQUUsSUFBRixDQUFaO0FBQUEsY0FDSTZaLFFBQVFuVyxNQUFNQyxJQUFOLENBQVcsR0FBWCxDQURaO0FBQUEsY0FFSW1iLFdBQVdwYixNQUFNcVcsUUFBTixNQUFrQjNYLE1BQU0rUSxPQUFOLENBQWM0TCxlQUFoQyxDQUZmO0FBQUEsY0FHSW5GLE9BQU9DLE1BQU0sQ0FBTixFQUFTRCxJQUFULENBQWN0VyxLQUFkLENBQW9CLENBQXBCLENBSFg7QUFBQSxjQUlJZ1csU0FBU08sTUFBTSxDQUFOLEVBQVNoSyxFQUFULEdBQWNnSyxNQUFNLENBQU4sRUFBU2hLLEVBQXZCLEdBQStCK0osSUFBL0IsV0FKYjtBQUFBLGNBS0lVLGNBQWN0YSxRQUFNNFosSUFBTixDQUxsQjs7QUFPQWxXLGdCQUFNbkQsSUFBTixDQUFXLEVBQUMsUUFBUSxjQUFULEVBQVg7O0FBRUFzWixnQkFBTXRaLElBQU4sQ0FBVztBQUNULG9CQUFRLEtBREM7QUFFVCw2QkFBaUJxWixJQUZSO0FBR1QsNkJBQWlCa0YsUUFIUjtBQUlULGtCQUFNeEY7QUFKRyxXQUFYOztBQU9BZ0Isc0JBQVkvWixJQUFaLENBQWlCO0FBQ2Ysb0JBQVEsVUFETztBQUVmLDJCQUFlLENBQUN1ZSxRQUZEO0FBR2YsK0JBQW1CeEY7QUFISixXQUFqQjs7QUFNQSxjQUFHd0YsWUFBWTFjLE1BQU0rUSxPQUFOLENBQWM2TCxTQUE3QixFQUF1QztBQUNyQ2hmLGNBQUUwRyxNQUFGLEVBQVV1VCxJQUFWLENBQWUsWUFBVztBQUN4QmphLGdCQUFFLFlBQUYsRUFBZ0JvUixPQUFoQixDQUF3QixFQUFFOEksV0FBV3hXLE1BQU1pRyxNQUFOLEdBQWVMLEdBQTVCLEVBQXhCLEVBQTJEbEgsTUFBTStRLE9BQU4sQ0FBY2dILG1CQUF6RSxFQUE4RixZQUFNO0FBQ2xHTixzQkFBTW5NLEtBQU47QUFDRCxlQUZEO0FBR0QsYUFKRDtBQUtEO0FBQ0YsU0E5QkQ7QUErQkEsWUFBRyxLQUFLeUYsT0FBTCxDQUFhOEwsV0FBaEIsRUFBNkI7QUFDM0IsY0FBSUMsVUFBVSxLQUFLNUUsV0FBTCxDQUFpQjNXLElBQWpCLENBQXNCLEtBQXRCLENBQWQ7O0FBRUEsY0FBSXViLFFBQVFuYyxNQUFaLEVBQW9CO0FBQ2xCN0MsdUJBQVd3VCxjQUFYLENBQTBCd0wsT0FBMUIsRUFBbUMsS0FBS0MsVUFBTCxDQUFnQnJYLElBQWhCLENBQXFCLElBQXJCLENBQW5DO0FBQ0QsV0FGRCxNQUVPO0FBQ0wsaUJBQUtxWCxVQUFMO0FBQ0Q7QUFDRjs7QUFFQTtBQUNELGFBQUt6RixjQUFMLEdBQXNCLFlBQU07QUFDMUIsY0FBSTlPLFNBQVNsRSxPQUFPaVQsUUFBUCxDQUFnQkMsSUFBN0I7QUFDQTtBQUNBLGNBQUdoUCxPQUFPN0gsTUFBVixFQUFrQjtBQUNoQixnQkFBSThXLFFBQVEsT0FBS3pZLFFBQUwsQ0FBY3VDLElBQWQsQ0FBbUIsYUFBV2lILE1BQVgsR0FBa0IsSUFBckMsQ0FBWjtBQUNBLGdCQUFJaVAsTUFBTTlXLE1BQVYsRUFBa0I7QUFDaEIscUJBQUtxYyxTQUFMLENBQWVwZixFQUFFNEssTUFBRixDQUFmLEVBQTBCLElBQTFCOztBQUVBO0FBQ0Esa0JBQUksT0FBS3VJLE9BQUwsQ0FBYTZHLGNBQWpCLEVBQWlDO0FBQy9CLG9CQUFJclEsU0FBUyxPQUFLdkksUUFBTCxDQUFjdUksTUFBZCxFQUFiO0FBQ0EzSixrQkFBRSxZQUFGLEVBQWdCb1IsT0FBaEIsQ0FBd0IsRUFBRThJLFdBQVd2USxPQUFPTCxHQUFwQixFQUF4QixFQUFtRCxPQUFLNkosT0FBTCxDQUFhZ0gsbUJBQWhFO0FBQ0Q7O0FBRUQ7Ozs7QUFJQyxxQkFBSy9ZLFFBQUwsQ0FBY0UsT0FBZCxDQUFzQixrQkFBdEIsRUFBMEMsQ0FBQ3VZLEtBQUQsRUFBUTdaLEVBQUU0SyxNQUFGLENBQVIsQ0FBMUM7QUFDRDtBQUNGO0FBQ0YsU0FyQkY7O0FBdUJBO0FBQ0EsWUFBSSxLQUFLdUksT0FBTCxDQUFhaUgsUUFBakIsRUFBMkI7QUFDekIsZUFBS1YsY0FBTDtBQUNEOztBQUVELGFBQUtXLE9BQUw7QUFDRDs7QUFFRDs7Ozs7QUF2SFc7QUFBQTtBQUFBLGdDQTJIRDtBQUNSLGFBQUtnRixjQUFMO0FBQ0EsYUFBS0MsZ0JBQUw7QUFDQSxhQUFLQyxtQkFBTCxHQUEyQixJQUEzQjs7QUFFQSxZQUFJLEtBQUtwTSxPQUFMLENBQWE4TCxXQUFqQixFQUE4QjtBQUM1QixlQUFLTSxtQkFBTCxHQUEyQixLQUFLSixVQUFMLENBQWdCclgsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBM0I7O0FBRUE5SCxZQUFFMEcsTUFBRixFQUFVNkcsRUFBVixDQUFhLHVCQUFiLEVBQXNDLEtBQUtnUyxtQkFBM0M7QUFDRDs7QUFFRCxZQUFHLEtBQUtwTSxPQUFMLENBQWFpSCxRQUFoQixFQUEwQjtBQUN4QnBhLFlBQUUwRyxNQUFGLEVBQVU2RyxFQUFWLENBQWEsVUFBYixFQUF5QixLQUFLbU0sY0FBOUI7QUFDRDtBQUNGOztBQUVEOzs7OztBQTNJVztBQUFBO0FBQUEseUNBK0lRO0FBQ2pCLFlBQUl0WCxRQUFRLElBQVo7O0FBRUEsYUFBS2hCLFFBQUwsQ0FDR3dNLEdBREgsQ0FDTyxlQURQLEVBRUdMLEVBRkgsQ0FFTSxlQUZOLFFBRTJCLEtBQUs0RixPQUFMLENBQWEwTCxTQUZ4QyxFQUVxRCxVQUFTM2EsQ0FBVCxFQUFXO0FBQzVEQSxZQUFFdUosY0FBRjtBQUNBdkosWUFBRWlULGVBQUY7QUFDQS9VLGdCQUFNb2QsZ0JBQU4sQ0FBdUJ4ZixFQUFFLElBQUYsQ0FBdkI7QUFDRCxTQU5IO0FBT0Q7O0FBRUQ7Ozs7O0FBM0pXO0FBQUE7QUFBQSx1Q0ErSk07QUFDZixZQUFJb0MsUUFBUSxJQUFaOztBQUVBLGFBQUt3YyxVQUFMLENBQWdCaFIsR0FBaEIsQ0FBb0IsaUJBQXBCLEVBQXVDTCxFQUF2QyxDQUEwQyxpQkFBMUMsRUFBNkQsVUFBU3JKLENBQVQsRUFBVztBQUN0RSxjQUFJQSxFQUFFd0gsS0FBRixLQUFZLENBQWhCLEVBQW1COztBQUduQixjQUFJdEssV0FBV3BCLEVBQUUsSUFBRixDQUFmO0FBQUEsY0FDRXlmLFlBQVlyZSxTQUFTOEgsTUFBVCxDQUFnQixJQUFoQixFQUFzQjhKLFFBQXRCLENBQStCLElBQS9CLENBRGQ7QUFBQSxjQUVFME0sWUFGRjtBQUFBLGNBR0VDLFlBSEY7O0FBS0FGLG9CQUFVeGQsSUFBVixDQUFlLFVBQVN3QixDQUFULEVBQVk7QUFDekIsZ0JBQUl6RCxFQUFFLElBQUYsRUFBUStNLEVBQVIsQ0FBVzNMLFFBQVgsQ0FBSixFQUEwQjtBQUN4QixrQkFBSWdCLE1BQU0rUSxPQUFOLENBQWN5TSxVQUFsQixFQUE4QjtBQUM1QkYsK0JBQWVqYyxNQUFNLENBQU4sR0FBVWdjLFVBQVVJLElBQVYsRUFBVixHQUE2QkosVUFBVXBTLEVBQVYsQ0FBYTVKLElBQUUsQ0FBZixDQUE1QztBQUNBa2MsK0JBQWVsYyxNQUFNZ2MsVUFBVTFjLE1BQVYsR0FBa0IsQ0FBeEIsR0FBNEIwYyxVQUFVdkosS0FBVixFQUE1QixHQUFnRHVKLFVBQVVwUyxFQUFWLENBQWE1SixJQUFFLENBQWYsQ0FBL0Q7QUFDRCxlQUhELE1BR087QUFDTGljLCtCQUFlRCxVQUFVcFMsRUFBVixDQUFhcEssS0FBS3dFLEdBQUwsQ0FBUyxDQUFULEVBQVloRSxJQUFFLENBQWQsQ0FBYixDQUFmO0FBQ0FrYywrQkFBZUYsVUFBVXBTLEVBQVYsQ0FBYXBLLEtBQUs2YyxHQUFMLENBQVNyYyxJQUFFLENBQVgsRUFBY2djLFVBQVUxYyxNQUFWLEdBQWlCLENBQS9CLENBQWIsQ0FBZjtBQUNEO0FBQ0Q7QUFDRDtBQUNGLFdBWEQ7O0FBYUE7QUFDQTdDLHFCQUFXbUwsUUFBWCxDQUFvQmEsU0FBcEIsQ0FBOEJoSSxDQUE5QixFQUFpQyxNQUFqQyxFQUF5QztBQUN2QzZiLGtCQUFNLGdCQUFXO0FBQ2YzZSx1QkFBU3VDLElBQVQsQ0FBYyxjQUFkLEVBQThCK0osS0FBOUI7QUFDQXRMLG9CQUFNb2QsZ0JBQU4sQ0FBdUJwZSxRQUF2QjtBQUNELGFBSnNDO0FBS3ZDdVosc0JBQVUsb0JBQVc7QUFDbkIrRSwyQkFBYS9iLElBQWIsQ0FBa0IsY0FBbEIsRUFBa0MrSixLQUFsQztBQUNBdEwsb0JBQU1vZCxnQkFBTixDQUF1QkUsWUFBdkI7QUFDRCxhQVJzQztBQVN2Q2xGLGtCQUFNLGdCQUFXO0FBQ2ZtRiwyQkFBYWhjLElBQWIsQ0FBa0IsY0FBbEIsRUFBa0MrSixLQUFsQztBQUNBdEwsb0JBQU1vZCxnQkFBTixDQUF1QkcsWUFBdkI7QUFDRCxhQVpzQztBQWF2Q2hULHFCQUFTLG1CQUFXO0FBQ2xCekksZ0JBQUVpVCxlQUFGO0FBQ0FqVCxnQkFBRXVKLGNBQUY7QUFDRDtBQWhCc0MsV0FBekM7QUFrQkQsU0F6Q0Q7QUEwQ0Q7O0FBRUQ7Ozs7Ozs7O0FBOU1XO0FBQUE7QUFBQSx1Q0FxTk02SyxPQXJOTixFQXFOZTBILGNBck5mLEVBcU4rQjs7QUFFeEM7OztBQUdBLFlBQUkxSCxRQUFReUIsUUFBUixNQUFvQixLQUFLNUcsT0FBTCxDQUFhNEwsZUFBakMsQ0FBSixFQUF5RDtBQUNyRCxjQUFHLEtBQUs1TCxPQUFMLENBQWE4TSxjQUFoQixFQUFnQztBQUM1QixpQkFBS0MsWUFBTCxDQUFrQjVILE9BQWxCOztBQUVEOzs7O0FBSUMsaUJBQUtsWCxRQUFMLENBQWNFLE9BQWQsQ0FBc0Isa0JBQXRCLEVBQTBDLENBQUNnWCxPQUFELENBQTFDO0FBQ0g7QUFDRDtBQUNIOztBQUVELFlBQUk2SCxVQUFVLEtBQUsvZSxRQUFMLENBQ1J1QyxJQURRLE9BQ0MsS0FBS3dQLE9BQUwsQ0FBYTBMLFNBRGQsU0FDMkIsS0FBSzFMLE9BQUwsQ0FBYTRMLGVBRHhDLENBQWQ7QUFBQSxZQUVNcUIsV0FBVzlILFFBQVEzVSxJQUFSLENBQWEsY0FBYixDQUZqQjtBQUFBLFlBR01pVyxPQUFPd0csU0FBUyxDQUFULEVBQVl4RyxJQUh6QjtBQUFBLFlBSU15RyxpQkFBaUIsS0FBSy9GLFdBQUwsQ0FBaUIzVyxJQUFqQixDQUFzQmlXLElBQXRCLENBSnZCOztBQU1BO0FBQ0EsYUFBS3NHLFlBQUwsQ0FBa0JDLE9BQWxCOztBQUVBO0FBQ0EsYUFBS0csUUFBTCxDQUFjaEksT0FBZDs7QUFFQTtBQUNBLFlBQUksS0FBS25GLE9BQUwsQ0FBYWlILFFBQWIsSUFBeUIsQ0FBQzRGLGNBQTlCLEVBQThDO0FBQzVDLGNBQUlwVixTQUFTME4sUUFBUTNVLElBQVIsQ0FBYSxHQUFiLEVBQWtCcEQsSUFBbEIsQ0FBdUIsTUFBdkIsQ0FBYjs7QUFFQSxjQUFJLEtBQUs0UyxPQUFMLENBQWEySCxhQUFqQixFQUFnQztBQUM5QkMsb0JBQVFDLFNBQVIsQ0FBa0IsRUFBbEIsRUFBc0IsRUFBdEIsRUFBMEJwUSxNQUExQjtBQUNELFdBRkQsTUFFTztBQUNMbVEsb0JBQVFFLFlBQVIsQ0FBcUIsRUFBckIsRUFBeUIsRUFBekIsRUFBNkJyUSxNQUE3QjtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7QUFJQSxhQUFLeEosUUFBTCxDQUFjRSxPQUFkLENBQXNCLGdCQUF0QixFQUF3QyxDQUFDZ1gsT0FBRCxFQUFVK0gsY0FBVixDQUF4Qzs7QUFFQTtBQUNBQSx1QkFBZTFjLElBQWYsQ0FBb0IsZUFBcEIsRUFBcUNyQyxPQUFyQyxDQUE2QyxxQkFBN0M7QUFDRDs7QUFFRDs7Ozs7O0FBeFFXO0FBQUE7QUFBQSwrQkE2UUZnWCxPQTdRRSxFQTZRTztBQUNkLFlBQUk4SCxXQUFXOUgsUUFBUTNVLElBQVIsQ0FBYSxjQUFiLENBQWY7QUFBQSxZQUNJaVcsT0FBT3dHLFNBQVMsQ0FBVCxFQUFZeEcsSUFEdkI7QUFBQSxZQUVJeUcsaUJBQWlCLEtBQUsvRixXQUFMLENBQWlCM1csSUFBakIsQ0FBc0JpVyxJQUF0QixDQUZyQjs7QUFJQXRCLGdCQUFRdEcsUUFBUixNQUFvQixLQUFLbUIsT0FBTCxDQUFhNEwsZUFBakM7O0FBRUFxQixpQkFBUzdmLElBQVQsQ0FBYyxFQUFDLGlCQUFpQixNQUFsQixFQUFkOztBQUVBOGYsdUJBQ0dyTyxRQURILE1BQ2UsS0FBS21CLE9BQUwsQ0FBYW9OLGdCQUQ1QixFQUVHaGdCLElBRkgsQ0FFUSxFQUFDLGVBQWUsT0FBaEIsRUFGUjtBQUdIOztBQUVEOzs7Ozs7QUEzUlc7QUFBQTtBQUFBLG1DQWdTRStYLE9BaFNGLEVBZ1NXO0FBQ3BCLFlBQUlrSSxpQkFBaUJsSSxRQUNsQnJTLFdBRGtCLE1BQ0gsS0FBS2tOLE9BQUwsQ0FBYTRMLGVBRFYsRUFFbEJwYixJQUZrQixDQUViLGNBRmEsRUFHbEJwRCxJQUhrQixDQUdiLEVBQUUsaUJBQWlCLE9BQW5CLEVBSGEsQ0FBckI7O0FBS0FQLGdCQUFNd2dCLGVBQWVqZ0IsSUFBZixDQUFvQixlQUFwQixDQUFOLEVBQ0cwRixXQURILE1BQ2tCLEtBQUtrTixPQUFMLENBQWFvTixnQkFEL0IsRUFFR2hnQixJQUZILENBRVEsRUFBRSxlQUFlLE1BQWpCLEVBRlI7QUFHRDs7QUFFRDs7Ozs7OztBQTNTVztBQUFBO0FBQUEsZ0NBaVREaUQsSUFqVEMsRUFpVEt3YyxjQWpUTCxFQWlUcUI7QUFDOUIsWUFBSVMsS0FBSjs7QUFFQSxZQUFJLFFBQU9qZCxJQUFQLHlDQUFPQSxJQUFQLE9BQWdCLFFBQXBCLEVBQThCO0FBQzVCaWQsa0JBQVFqZCxLQUFLLENBQUwsRUFBUXFNLEVBQWhCO0FBQ0QsU0FGRCxNQUVPO0FBQ0w0USxrQkFBUWpkLElBQVI7QUFDRDs7QUFFRCxZQUFJaWQsTUFBTS9lLE9BQU4sQ0FBYyxHQUFkLElBQXFCLENBQXpCLEVBQTRCO0FBQzFCK2Usd0JBQVlBLEtBQVo7QUFDRDs7QUFFRCxZQUFJbkksVUFBVSxLQUFLc0csVUFBTCxDQUFnQmpiLElBQWhCLGNBQWdDOGMsS0FBaEMsU0FBMkN2WCxNQUEzQyxPQUFzRCxLQUFLaUssT0FBTCxDQUFhMEwsU0FBbkUsQ0FBZDs7QUFFQSxhQUFLVyxnQkFBTCxDQUFzQmxILE9BQXRCLEVBQStCMEgsY0FBL0I7QUFDRDtBQWpVVTtBQUFBOztBQWtVWDs7Ozs7Ozs7QUFsVVcsbUNBMFVFO0FBQ1gsWUFBSXZZLE1BQU0sQ0FBVjtBQUFBLFlBQ0lyRixRQUFRLElBRFosQ0FEVyxDQUVPOztBQUVsQixhQUFLa1ksV0FBTCxDQUNHM1csSUFESCxPQUNZLEtBQUt3UCxPQUFMLENBQWF1TixVQUR6QixFQUVHbFMsR0FGSCxDQUVPLFFBRlAsRUFFaUIsRUFGakIsRUFHR3ZNLElBSEgsQ0FHUSxZQUFXOztBQUVmLGNBQUkwZSxRQUFRM2dCLEVBQUUsSUFBRixDQUFaO0FBQUEsY0FDSThlLFdBQVc2QixNQUFNNUcsUUFBTixNQUFrQjNYLE1BQU0rUSxPQUFOLENBQWNvTixnQkFBaEMsQ0FEZixDQUZlLENBR3FEOztBQUVwRSxjQUFJLENBQUN6QixRQUFMLEVBQWU7QUFDYjZCLGtCQUFNblMsR0FBTixDQUFVLEVBQUMsY0FBYyxRQUFmLEVBQXlCLFdBQVcsT0FBcEMsRUFBVjtBQUNEOztBQUVELGNBQUlvUyxPQUFPLEtBQUsxVyxxQkFBTCxHQUE2Qk4sTUFBeEM7O0FBRUEsY0FBSSxDQUFDa1YsUUFBTCxFQUFlO0FBQ2I2QixrQkFBTW5TLEdBQU4sQ0FBVTtBQUNSLDRCQUFjLEVBRE47QUFFUix5QkFBVztBQUZILGFBQVY7QUFJRDs7QUFFRC9HLGdCQUFNbVosT0FBT25aLEdBQVAsR0FBYW1aLElBQWIsR0FBb0JuWixHQUExQjtBQUNELFNBdEJILEVBdUJHK0csR0F2QkgsQ0F1Qk8sUUF2QlAsRUF1Qm9CL0csR0F2QnBCO0FBd0JEOztBQUVEOzs7OztBQXhXVztBQUFBO0FBQUEsZ0NBNFdEO0FBQ1IsYUFBS3JHLFFBQUwsQ0FDR3VDLElBREgsT0FDWSxLQUFLd1AsT0FBTCxDQUFhMEwsU0FEekIsRUFFR2pSLEdBRkgsQ0FFTyxVQUZQLEVBRW1CeUUsSUFGbkIsR0FFMEJ2TixHQUYxQixHQUdHbkIsSUFISCxPQUdZLEtBQUt3UCxPQUFMLENBQWF1TixVQUh6QixFQUlHck8sSUFKSDs7QUFNQSxZQUFJLEtBQUtjLE9BQUwsQ0FBYThMLFdBQWpCLEVBQThCO0FBQzVCLGNBQUksS0FBS00sbUJBQUwsSUFBNEIsSUFBaEMsRUFBc0M7QUFDbkN2ZixjQUFFMEcsTUFBRixFQUFVa0gsR0FBVixDQUFjLHVCQUFkLEVBQXVDLEtBQUsyUixtQkFBNUM7QUFDRjtBQUNGOztBQUVELFlBQUksS0FBS3BNLE9BQUwsQ0FBYWlILFFBQWpCLEVBQTJCO0FBQ3pCcGEsWUFBRTBHLE1BQUYsRUFBVWtILEdBQVYsQ0FBYyxVQUFkLEVBQTBCLEtBQUs4TCxjQUEvQjtBQUNEOztBQUVEeFosbUJBQVdzQixnQkFBWCxDQUE0QixJQUE1QjtBQUNEO0FBOVhVOztBQUFBO0FBQUE7O0FBaVlibWQsT0FBS3pGLFFBQUwsR0FBZ0I7QUFDZDs7Ozs7O0FBTUFrQixjQUFVLEtBUEk7O0FBU2Q7Ozs7OztBQU1BSixvQkFBZ0IsS0FmRjs7QUFpQmQ7Ozs7OztBQU1BRyx5QkFBcUIsR0F2QlA7O0FBeUJkOzs7Ozs7QUFNQVcsbUJBQWUsS0EvQkQ7O0FBaUNkOzs7Ozs7O0FBT0FrRSxlQUFXLEtBeENHOztBQTBDZDs7Ozs7O0FBTUFZLGdCQUFZLElBaERFOztBQWtEZDs7Ozs7O0FBTUFYLGlCQUFhLEtBeERDOztBQTBEZDs7Ozs7O0FBTUFnQixvQkFBZ0IsS0FoRUY7O0FBa0VkOzs7Ozs7QUFNQXBCLGVBQVcsWUF4RUc7O0FBMEVkOzs7Ozs7QUFNQUUscUJBQWlCLFdBaEZIOztBQWtGZDs7Ozs7O0FBTUEyQixnQkFBWSxZQXhGRTs7QUEwRmQ7Ozs7OztBQU1BSCxzQkFBa0I7QUFoR0osR0FBaEI7O0FBbUdBO0FBQ0FyZ0IsYUFBV00sTUFBWCxDQUFrQm1lLElBQWxCLEVBQXdCLE1BQXhCO0FBRUMsQ0F2ZUEsQ0F1ZUMvVixNQXZlRCxDQUFEOzs7OztBQ0ZBLElBQUlpWSxXQUFXbmUsT0FBT29lLE1BQVAsSUFBaUIsVUFBVXRULE1BQVYsRUFBa0I7QUFBRSxTQUFLLElBQUkvSixJQUFJLENBQWIsRUFBZ0JBLElBQUlpQyxVQUFVM0MsTUFBOUIsRUFBc0NVLEdBQXRDLEVBQTJDO0FBQUUsWUFBSXNkLFNBQVNyYixVQUFVakMsQ0FBVixDQUFiLENBQTJCLEtBQUssSUFBSWdJLEdBQVQsSUFBZ0JzVixNQUFoQixFQUF3QjtBQUFFLGdCQUFJcmUsT0FBTzBELFNBQVAsQ0FBaUJ1SSxjQUFqQixDQUFnQ3RJLElBQWhDLENBQXFDMGEsTUFBckMsRUFBNkN0VixHQUE3QyxDQUFKLEVBQXVEO0FBQUUrQix1QkFBTy9CLEdBQVAsSUFBY3NWLE9BQU90VixHQUFQLENBQWQ7QUFBNEI7QUFBRTtBQUFFLEtBQUMsT0FBTytCLE1BQVA7QUFBZ0IsQ0FBaFE7O0FBRUEsSUFBSXdULFVBQVUsT0FBT0MsTUFBUCxLQUFrQixVQUFsQixJQUFnQyxTQUFPQSxPQUFPQyxRQUFkLE1BQTJCLFFBQTNELEdBQXNFLFVBQVVDLEdBQVYsRUFBZTtBQUFFLGtCQUFjQSxHQUFkLDBDQUFjQSxHQUFkO0FBQW9CLENBQTNHLEdBQThHLFVBQVVBLEdBQVYsRUFBZTtBQUFFLFdBQU9BLE9BQU8sT0FBT0YsTUFBUCxLQUFrQixVQUF6QixJQUF1Q0UsSUFBSW5nQixXQUFKLEtBQW9CaWdCLE1BQTNELElBQXFFRSxRQUFRRixPQUFPN2EsU0FBcEYsR0FBZ0csUUFBaEcsVUFBa0grYSxHQUFsSCwwQ0FBa0hBLEdBQWxILENBQVA7QUFBK0gsQ0FBNVE7O0FBRUEsQ0FBQyxVQUFVQyxNQUFWLEVBQWtCQyxPQUFsQixFQUEyQjtBQUN4QixLQUFDLE9BQU9DLE9BQVAsS0FBbUIsV0FBbkIsR0FBaUMsV0FBakMsR0FBK0NOLFFBQVFNLE9BQVIsQ0FBaEQsTUFBc0UsUUFBdEUsSUFBa0YsT0FBT0MsTUFBUCxLQUFrQixXQUFwRyxHQUFrSEEsT0FBT0QsT0FBUCxHQUFpQkQsU0FBbkksR0FBK0ksT0FBT0csTUFBUCxLQUFrQixVQUFsQixJQUFnQ0EsT0FBT0MsR0FBdkMsR0FBNkNELE9BQU9ILE9BQVAsQ0FBN0MsR0FBK0RELE9BQU9NLFFBQVAsR0FBa0JMLFNBQWhPO0FBQ0gsQ0FGRCxhQUVTLFlBQVk7QUFDakI7O0FBRUEsUUFBSU0sa0JBQWtCO0FBQ2xCQywyQkFBbUIsS0FERDtBQUVsQkMsbUJBQVduYixNQUZPO0FBR2xCK1csbUJBQVcsR0FITztBQUlsQnJZLGtCQUFVLEdBSlE7QUFLbEIwYyxrQkFBVSxVQUxRO0FBTWxCQyxxQkFBYSxhQU5LO0FBT2xCQyx1QkFBZSxTQVBHO0FBUWxCQyxzQkFBYyxRQVJJO0FBU2xCQyxxQkFBYSxPQVRLO0FBVWxCQyx1QkFBZSxTQVZHO0FBV2xCQyx3QkFBZ0IsSUFYRTtBQVlsQkMsdUJBQWUsSUFaRztBQWFsQkMsd0JBQWdCLElBYkU7QUFjbEJDLHNCQUFjLElBZEk7QUFlbEJDLDRCQUFvQjtBQWZGLEtBQXRCOztBQWtCQSxRQUFJQyxRQUFRLEVBQUUsY0FBYy9iLE1BQWhCLEtBQTJCLFNBQVNTLElBQVQsQ0FBY0MsVUFBVUMsU0FBeEIsQ0FBdkM7O0FBRUEsUUFBSXFiLGVBQWUsU0FBU0EsWUFBVCxDQUFzQm5iLFFBQXRCLEVBQWdDb2IsUUFBaEMsRUFBMEM7QUFDekQsWUFBSXBiLFFBQUosRUFBYztBQUNWQSxxQkFBU29iLFFBQVQ7QUFDSDtBQUNKLEtBSkQ7O0FBTUEsUUFBSUMsZUFBZSxTQUFTQSxZQUFULENBQXNCM1osT0FBdEIsRUFBK0I7QUFDOUMsZUFBT0EsUUFBUWlCLHFCQUFSLEdBQWdDWixHQUFoQyxHQUFzQzVDLE9BQU84RCxXQUE3QyxHQUEyRHZCLFFBQVE0WixhQUFSLENBQXNCMU8sZUFBdEIsQ0FBc0MyTyxTQUF4RztBQUNILEtBRkQ7O0FBSUEsUUFBSUMsa0JBQWtCLFNBQVNBLGVBQVQsQ0FBeUI5WixPQUF6QixFQUFrQzRZLFNBQWxDLEVBQTZDcEUsU0FBN0MsRUFBd0Q7QUFDMUUsWUFBSXVGLE9BQU9uQixjQUFjbmIsTUFBZCxHQUF1QkEsT0FBT3dXLFdBQVAsR0FBcUJ4VyxPQUFPOEQsV0FBbkQsR0FBaUVvWSxhQUFhZixTQUFiLElBQTBCQSxVQUFVdkUsWUFBaEg7QUFDQSxlQUFPMEYsUUFBUUosYUFBYTNaLE9BQWIsSUFBd0J3VSxTQUF2QztBQUNILEtBSEQ7O0FBS0EsUUFBSXdGLGdCQUFnQixTQUFTQSxhQUFULENBQXVCaGEsT0FBdkIsRUFBZ0M7QUFDaEQsZUFBT0EsUUFBUWlCLHFCQUFSLEdBQWdDVixJQUFoQyxHQUF1QzlDLE9BQU9nRSxXQUE5QyxHQUE0RHpCLFFBQVE0WixhQUFSLENBQXNCMU8sZUFBdEIsQ0FBc0MrTyxVQUF6RztBQUNILEtBRkQ7O0FBSUEsUUFBSUMsc0JBQXNCLFNBQVNBLG1CQUFULENBQTZCbGEsT0FBN0IsRUFBc0M0WSxTQUF0QyxFQUFpRHBFLFNBQWpELEVBQTREO0FBQ2xGLFlBQUkyRixnQkFBZ0IxYyxPQUFPMmMsVUFBM0I7QUFDQSxZQUFJTCxPQUFPbkIsY0FBY25iLE1BQWQsR0FBdUIwYyxnQkFBZ0IxYyxPQUFPZ0UsV0FBOUMsR0FBNER1WSxjQUFjcEIsU0FBZCxJQUEyQnVCLGFBQWxHO0FBQ0EsZUFBT0osUUFBUUMsY0FBY2hhLE9BQWQsSUFBeUJ3VSxTQUF4QztBQUNILEtBSkQ7O0FBTUEsUUFBSTZGLGtCQUFrQixTQUFTQSxlQUFULENBQXlCcmEsT0FBekIsRUFBa0M0WSxTQUFsQyxFQUE2Q3BFLFNBQTdDLEVBQXdEO0FBQzFFLFlBQUl1RixPQUFPbkIsY0FBY25iLE1BQWQsR0FBdUJBLE9BQU84RCxXQUE5QixHQUE0Q29ZLGFBQWFmLFNBQWIsQ0FBdkQ7QUFDQSxlQUFPbUIsUUFBUUosYUFBYTNaLE9BQWIsSUFBd0J3VSxTQUF4QixHQUFvQ3hVLFFBQVFxVSxZQUEzRDtBQUNILEtBSEQ7O0FBS0EsUUFBSWlHLHFCQUFxQixTQUFTQSxrQkFBVCxDQUE0QnRhLE9BQTVCLEVBQXFDNFksU0FBckMsRUFBZ0RwRSxTQUFoRCxFQUEyRDtBQUNoRixZQUFJdUYsT0FBT25CLGNBQWNuYixNQUFkLEdBQXVCQSxPQUFPZ0UsV0FBOUIsR0FBNEN1WSxjQUFjcEIsU0FBZCxDQUF2RDtBQUNBLGVBQU9tQixRQUFRQyxjQUFjaGEsT0FBZCxJQUF5QndVLFNBQXpCLEdBQXFDeFUsUUFBUWlKLFdBQTVEO0FBQ0gsS0FIRDs7QUFLQSxRQUFJc1IsbUJBQW1CLFNBQVNBLGdCQUFULENBQTBCdmEsT0FBMUIsRUFBbUM0WSxTQUFuQyxFQUE4Q3BFLFNBQTlDLEVBQXlEO0FBQzVFLGVBQU8sQ0FBQ3NGLGdCQUFnQjlaLE9BQWhCLEVBQXlCNFksU0FBekIsRUFBb0NwRSxTQUFwQyxDQUFELElBQW1ELENBQUM2RixnQkFBZ0JyYSxPQUFoQixFQUF5QjRZLFNBQXpCLEVBQW9DcEUsU0FBcEMsQ0FBcEQsSUFBc0csQ0FBQzBGLG9CQUFvQmxhLE9BQXBCLEVBQTZCNFksU0FBN0IsRUFBd0NwRSxTQUF4QyxDQUF2RyxJQUE2SixDQUFDOEYsbUJBQW1CdGEsT0FBbkIsRUFBNEI0WSxTQUE1QixFQUF1Q3BFLFNBQXZDLENBQXJLO0FBQ0gsS0FGRDs7QUFJQTtBQUNBLFFBQUlnRyxpQkFBaUIsU0FBU0EsY0FBVCxDQUF3QkMsUUFBeEIsRUFBa0N2USxPQUFsQyxFQUEyQztBQUM1RCxZQUFJd1EsV0FBVyxJQUFJRCxRQUFKLENBQWF2USxPQUFiLENBQWY7QUFDQSxZQUFJM0gsUUFBUSxJQUFJb1ksV0FBSixDQUFnQix1QkFBaEIsRUFBeUMsRUFBRUMsUUFBUSxFQUFFRixVQUFVQSxRQUFaLEVBQVYsRUFBekMsQ0FBWjtBQUNBamQsZUFBT3FRLGFBQVAsQ0FBcUJ2TCxLQUFyQjtBQUNILEtBSkQ7O0FBTUE7O0FBRUEsUUFBSXNZLGlCQUFpQixTQUFTQSxjQUFULENBQXdCSixRQUF4QixFQUFrQ3ZRLE9BQWxDLEVBQTJDO0FBQzVELFlBQUk0USxhQUFhNVEsUUFBUXBRLE1BQXpCO0FBQ0EsWUFBSSxDQUFDZ2hCLFVBQUwsRUFBaUI7QUFDYjtBQUNBTiwyQkFBZUMsUUFBZixFQUF5QnZRLE9BQXpCO0FBQ0gsU0FIRCxNQUdPO0FBQ0g7QUFDQSxpQkFBSyxJQUFJMVAsSUFBSSxDQUFiLEVBQWdCQSxJQUFJc2dCLFVBQXBCLEVBQWdDdGdCLEdBQWhDLEVBQXFDO0FBQ2pDZ2dCLCtCQUFlQyxRQUFmLEVBQXlCdlEsUUFBUTFQLENBQVIsQ0FBekI7QUFDSDtBQUNKO0FBQ0osS0FYRDs7QUFhQSxRQUFJdWdCLHVCQUF1QixTQUFTQSxvQkFBVCxDQUE4Qi9hLE9BQTlCLEVBQXVDZ2IsbUJBQXZDLEVBQTREO0FBQ25GLFlBQUkvYSxTQUFTRCxRQUFRaWIsYUFBckI7QUFDQSxZQUFJaGIsT0FBT2liLE9BQVAsS0FBbUIsU0FBdkIsRUFBa0M7QUFDOUI7QUFDSDtBQUNELGFBQUssSUFBSTFnQixJQUFJLENBQWIsRUFBZ0JBLElBQUl5RixPQUFPOEosUUFBUCxDQUFnQmpRLE1BQXBDLEVBQTRDVSxHQUE1QyxFQUFpRDtBQUM3QyxnQkFBSTJnQixlQUFlbGIsT0FBTzhKLFFBQVAsQ0FBZ0J2UCxDQUFoQixDQUFuQjtBQUNBLGdCQUFJMmdCLGFBQWFELE9BQWIsS0FBeUIsUUFBN0IsRUFBdUM7QUFDbkMsb0JBQUlFLGVBQWVELGFBQWFFLE9BQWIsQ0FBcUJMLG1CQUFyQixDQUFuQjtBQUNBLG9CQUFJSSxZQUFKLEVBQWtCO0FBQ2RELGlDQUFhRyxZQUFiLENBQTBCLFFBQTFCLEVBQW9DRixZQUFwQztBQUNIO0FBQ0o7QUFDSjtBQUNKLEtBZEQ7O0FBZ0JBLFFBQUlHLGFBQWEsU0FBU0EsVUFBVCxDQUFvQnZiLE9BQXBCLEVBQTZCZ2IsbUJBQTdCLEVBQWtEUSxnQkFBbEQsRUFBb0U7QUFDakYsWUFBSU4sVUFBVWxiLFFBQVFrYixPQUF0QjtBQUNBLFlBQUlPLGFBQWF6YixRQUFRcWIsT0FBUixDQUFnQkcsZ0JBQWhCLENBQWpCO0FBQ0EsWUFBSU4sWUFBWSxLQUFoQixFQUF1QjtBQUNuQkgsaUNBQXFCL2EsT0FBckIsRUFBOEJnYixtQkFBOUI7QUFDQSxnQkFBSVUsWUFBWTFiLFFBQVFxYixPQUFSLENBQWdCTCxtQkFBaEIsQ0FBaEI7QUFDQSxnQkFBSVUsU0FBSixFQUFlO0FBQ1gxYix3QkFBUXNiLFlBQVIsQ0FBcUIsUUFBckIsRUFBK0JJLFNBQS9CO0FBQ0g7QUFDRCxnQkFBSUQsVUFBSixFQUFnQjtBQUNaemIsd0JBQVFzYixZQUFSLENBQXFCLEtBQXJCLEVBQTRCRyxVQUE1QjtBQUNIO0FBQ0Q7QUFDSDtBQUNELFlBQUlQLFlBQVksUUFBaEIsRUFBMEI7QUFDdEIsZ0JBQUlPLFVBQUosRUFBZ0I7QUFDWnpiLHdCQUFRc2IsWUFBUixDQUFxQixLQUFyQixFQUE0QkcsVUFBNUI7QUFDSDtBQUNEO0FBQ0g7QUFDRCxZQUFJQSxVQUFKLEVBQWdCO0FBQ1p6YixvQkFBUWpFLEtBQVIsQ0FBYzRmLGVBQWQsR0FBZ0MsU0FBU0YsVUFBVCxHQUFzQixHQUF0RDtBQUNIO0FBQ0osS0F2QkQ7O0FBeUJBOzs7O0FBSUEsUUFBSWhELFdBQVcsU0FBU0EsUUFBVCxDQUFrQm1ELGdCQUFsQixFQUFvQztBQUMvQyxhQUFLQyxTQUFMLEdBQWlCakUsU0FBUyxFQUFULEVBQWFjLGVBQWIsRUFBOEJrRCxnQkFBOUIsQ0FBakI7QUFDQSxhQUFLRSxnQkFBTCxHQUF3QixLQUFLRCxTQUFMLENBQWVqRCxTQUFmLEtBQTZCbmIsTUFBN0IsR0FBc0M5QixRQUF0QyxHQUFpRCxLQUFLa2dCLFNBQUwsQ0FBZWpELFNBQXhGOztBQUVBLGFBQUttRCxpQkFBTCxHQUF5QixDQUF6QjtBQUNBLGFBQUtDLFlBQUwsR0FBb0IsSUFBcEI7QUFDQSxhQUFLQyxrQkFBTCxHQUEwQixLQUFLQyxZQUFMLENBQWtCcmQsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FBMUI7O0FBRUEsYUFBS3NkLFlBQUwsR0FBb0IsSUFBcEI7QUFDQTFlLGVBQU84TyxnQkFBUCxDQUF3QixRQUF4QixFQUFrQyxLQUFLMFAsa0JBQXZDO0FBQ0EsYUFBS0csTUFBTDtBQUNILEtBWEQ7O0FBYUEzRCxhQUFTdGIsU0FBVCxHQUFxQjs7QUFFakI7Ozs7QUFJQWtmLGlCQUFTLFNBQVNBLE9BQVQsQ0FBaUJyYyxPQUFqQixFQUEwQjtBQUMvQixnQkFBSXNjLFdBQVcsS0FBS1QsU0FBcEI7O0FBRUEsZ0JBQUlVLGdCQUFnQixTQUFTQSxhQUFULEdBQXlCO0FBQ3pDO0FBQ0Esb0JBQUksQ0FBQ0QsUUFBTCxFQUFlO0FBQ1g7QUFDSDtBQUNEdGMsd0JBQVEyTCxtQkFBUixDQUE0QixNQUE1QixFQUFvQzZRLFlBQXBDO0FBQ0F4Yyx3QkFBUTJMLG1CQUFSLENBQTRCLE9BQTVCLEVBQXFDNFEsYUFBckM7QUFDQXZjLHdCQUFReWMsU0FBUixDQUFrQkMsTUFBbEIsQ0FBeUJKLFNBQVN2RCxhQUFsQztBQUNBL1ksd0JBQVF5YyxTQUFSLENBQWtCRSxHQUFsQixDQUFzQkwsU0FBU3JELFdBQS9CO0FBQ0FRLDZCQUFhNkMsU0FBU2pELGNBQXRCLEVBQXNDclosT0FBdEM7QUFDSCxhQVZEOztBQVlBLGdCQUFJd2MsZUFBZSxTQUFTQSxZQUFULEdBQXdCO0FBQ3ZDO0FBQ0Esb0JBQUksQ0FBQ0YsUUFBTCxFQUFlO0FBQ1g7QUFDSDtBQUNEdGMsd0JBQVF5YyxTQUFSLENBQWtCQyxNQUFsQixDQUF5QkosU0FBU3ZELGFBQWxDO0FBQ0EvWSx3QkFBUXljLFNBQVIsQ0FBa0JFLEdBQWxCLENBQXNCTCxTQUFTdEQsWUFBL0I7QUFDQWhaLHdCQUFRMkwsbUJBQVIsQ0FBNEIsTUFBNUIsRUFBb0M2USxZQUFwQztBQUNBeGMsd0JBQVEyTCxtQkFBUixDQUE0QixPQUE1QixFQUFxQzRRLGFBQXJDO0FBQ0E7QUFDQTlDLDZCQUFhNkMsU0FBU2xELGFBQXRCLEVBQXFDcFosT0FBckM7QUFDSCxhQVhEOztBQWFBLGdCQUFJQSxRQUFRa2IsT0FBUixLQUFvQixLQUFwQixJQUE2QmxiLFFBQVFrYixPQUFSLEtBQW9CLFFBQXJELEVBQStEO0FBQzNEbGIsd0JBQVF1TSxnQkFBUixDQUF5QixNQUF6QixFQUFpQ2lRLFlBQWpDO0FBQ0F4Yyx3QkFBUXVNLGdCQUFSLENBQXlCLE9BQXpCLEVBQWtDZ1EsYUFBbEM7QUFDQXZjLHdCQUFReWMsU0FBUixDQUFrQkUsR0FBbEIsQ0FBc0JMLFNBQVN2RCxhQUEvQjtBQUNIOztBQUVEd0MsdUJBQVd2YixPQUFYLEVBQW9Cc2MsU0FBU3hELFdBQTdCLEVBQTBDd0QsU0FBU3pELFFBQW5EO0FBQ0E7QUFDQVkseUJBQWE2QyxTQUFTaEQsWUFBdEIsRUFBb0N0WixPQUFwQztBQUNILFNBM0NnQjs7QUE2Q2pCNGMsOEJBQXNCLFNBQVNBLG9CQUFULEdBQWdDO0FBQ2xELGdCQUFJTixXQUFXLEtBQUtULFNBQXBCO0FBQUEsZ0JBQ0lnQixXQUFXLEtBQUtDLFNBRHBCO0FBQUEsZ0JBRUlDLGlCQUFpQixDQUFDRixRQUFELEdBQVksQ0FBWixHQUFnQkEsU0FBUy9pQixNQUY5QztBQUdBLGdCQUFJVSxJQUFJLEtBQUssQ0FBYjtBQUFBLGdCQUNJd2lCLG1CQUFtQixFQUR2QjtBQUFBLGdCQUVJQyxZQUFZLEtBQUtkLFlBRnJCOztBQUlBLGlCQUFLM2hCLElBQUksQ0FBVCxFQUFZQSxJQUFJdWlCLGNBQWhCLEVBQWdDdmlCLEdBQWhDLEVBQXFDO0FBQ2pDLG9CQUFJd0YsVUFBVTZjLFNBQVNyaUIsQ0FBVCxDQUFkO0FBQ0E7QUFDQSxvQkFBSThoQixTQUFTbkQsY0FBVCxJQUEyQm5aLFFBQVFrZCxZQUFSLEtBQXlCLElBQXhELEVBQThEO0FBQzFEO0FBQ0g7O0FBRUQsb0JBQUkxRCxTQUFTZSxpQkFBaUJ2YSxPQUFqQixFQUEwQnNjLFNBQVMxRCxTQUFuQyxFQUE4QzBELFNBQVM5SCxTQUF2RCxDQUFiLEVBQWdGO0FBQzVFLHdCQUFJeUksU0FBSixFQUFlO0FBQ1hqZCxnQ0FBUXljLFNBQVIsQ0FBa0JFLEdBQWxCLENBQXNCTCxTQUFTcEQsYUFBL0I7QUFDSDtBQUNEO0FBQ0EseUJBQUttRCxPQUFMLENBQWFyYyxPQUFiO0FBQ0E7QUFDQWdkLHFDQUFpQjFrQixJQUFqQixDQUFzQmtDLENBQXRCO0FBQ0F3Riw0QkFBUXFiLE9BQVIsQ0FBZ0I4QixZQUFoQixHQUErQixJQUEvQjtBQUNIO0FBQ0o7QUFDRDtBQUNBLG1CQUFPSCxpQkFBaUJsakIsTUFBakIsR0FBMEIsQ0FBakMsRUFBb0M7QUFDaEMraUIseUJBQVNya0IsTUFBVCxDQUFnQndrQixpQkFBaUJJLEdBQWpCLEVBQWhCLEVBQXdDLENBQXhDO0FBQ0E7QUFDQTNELDZCQUFhNkMsU0FBUy9DLGtCQUF0QixFQUEwQ3NELFNBQVMvaUIsTUFBbkQ7QUFDSDtBQUNEO0FBQ0EsZ0JBQUlpakIsbUJBQW1CLENBQXZCLEVBQTBCO0FBQ3RCLHFCQUFLTSxrQkFBTDtBQUNIO0FBQ0Q7QUFDQSxnQkFBSUosU0FBSixFQUFlO0FBQ1gscUJBQUtkLFlBQUwsR0FBb0IsS0FBcEI7QUFDSDtBQUNKLFNBckZnQjs7QUF1RmpCbUIsd0JBQWdCLFNBQVNBLGNBQVQsR0FBMEI7QUFDdEMsZ0JBQUlULFdBQVcsS0FBS0MsU0FBcEI7QUFBQSxnQkFDSUMsaUJBQWlCRixTQUFTL2lCLE1BRDlCO0FBRUEsZ0JBQUlVLElBQUksS0FBSyxDQUFiO0FBQUEsZ0JBQ0kraUIsa0JBQWtCLEVBRHRCOztBQUdBLGlCQUFLL2lCLElBQUksQ0FBVCxFQUFZQSxJQUFJdWlCLGNBQWhCLEVBQWdDdmlCLEdBQWhDLEVBQXFDO0FBQ2pDLG9CQUFJd0YsVUFBVTZjLFNBQVNyaUIsQ0FBVCxDQUFkO0FBQ0E7QUFDQSxvQkFBSXdGLFFBQVFxYixPQUFSLENBQWdCOEIsWUFBcEIsRUFBa0M7QUFDOUJJLG9DQUFnQmpsQixJQUFoQixDQUFxQmtDLENBQXJCO0FBQ0g7QUFDSjtBQUNEO0FBQ0EsbUJBQU8raUIsZ0JBQWdCempCLE1BQWhCLEdBQXlCLENBQWhDLEVBQW1DO0FBQy9CK2lCLHlCQUFTcmtCLE1BQVQsQ0FBZ0Ira0IsZ0JBQWdCSCxHQUFoQixFQUFoQixFQUF1QyxDQUF2QztBQUNIO0FBQ0osU0F4R2dCOztBQTBHakJJLDZCQUFxQixTQUFTQSxtQkFBVCxHQUErQjtBQUNoRCxnQkFBSSxDQUFDLEtBQUtDLGlCQUFWLEVBQTZCO0FBQ3pCLHFCQUFLQSxpQkFBTCxHQUF5QixJQUF6QjtBQUNBLHFCQUFLNUIsU0FBTCxDQUFlakQsU0FBZixDQUF5QnJNLGdCQUF6QixDQUEwQyxRQUExQyxFQUFvRCxLQUFLMFAsa0JBQXpEO0FBQ0g7QUFDSixTQS9HZ0I7O0FBaUhqQm9CLDRCQUFvQixTQUFTQSxrQkFBVCxHQUE4QjtBQUM5QyxnQkFBSSxLQUFLSSxpQkFBVCxFQUE0QjtBQUN4QixxQkFBS0EsaUJBQUwsR0FBeUIsS0FBekI7QUFDQSxxQkFBSzVCLFNBQUwsQ0FBZWpELFNBQWYsQ0FBeUJqTixtQkFBekIsQ0FBNkMsUUFBN0MsRUFBdUQsS0FBS3NRLGtCQUE1RDtBQUNIO0FBQ0osU0F0SGdCOztBQXdIakI7Ozs7QUFJQUMsc0JBQWMsU0FBU0EsWUFBVCxHQUF3QjtBQUNsQyxnQkFBSS9pQixRQUFRLElBQVo7O0FBRUEsZ0JBQUlnRCxXQUFXLEtBQUswZixTQUFMLENBQWUxZixRQUE5Qjs7QUFFQSxnQkFBSUEsYUFBYSxDQUFqQixFQUFvQjtBQUNoQixpQkFBQyxZQUFZO0FBQ1Qsd0JBQUkwQixVQUFVLFNBQVNBLE9BQVQsR0FBbUI7QUFDN0IsNEJBQUlGLElBQUosR0FBV0UsT0FBWDtBQUNILHFCQUZEO0FBR0Esd0JBQUlELE1BQU1DLFNBQVY7QUFDQSx3QkFBSTZmLGdCQUFnQnZoQixZQUFZeUIsTUFBTXpFLE1BQU00aUIsaUJBQXhCLENBQXBCO0FBQ0Esd0JBQUkyQixpQkFBaUIsQ0FBakIsSUFBc0JBLGdCQUFnQnZoQixRQUExQyxFQUFvRDtBQUNoRCw0QkFBSWhELE1BQU02aUIsWUFBVixFQUF3QjtBQUNwQnZkLHlDQUFhdEYsTUFBTTZpQixZQUFuQjtBQUNBN2lCLGtDQUFNNmlCLFlBQU4sR0FBcUIsSUFBckI7QUFDSDtBQUNEN2lCLDhCQUFNNGlCLGlCQUFOLEdBQTBCbmUsR0FBMUI7QUFDQXpFLDhCQUFNeWpCLG9CQUFOO0FBQ0gscUJBUEQsTUFPTyxJQUFJLENBQUN6akIsTUFBTTZpQixZQUFYLEVBQXlCO0FBQzVCN2lCLDhCQUFNNmlCLFlBQU4sR0FBcUJoZ0IsV0FBVyxZQUFZO0FBQ3hDLGlDQUFLK2YsaUJBQUwsR0FBeUJsZSxTQUF6QjtBQUNBLGlDQUFLbWUsWUFBTCxHQUFvQixJQUFwQjtBQUNBLGlDQUFLWSxvQkFBTDtBQUNILHlCQUorQixDQUk5Qi9kLElBSjhCLENBSXpCMUYsS0FKeUIsQ0FBWCxFQUlOdWtCLGFBSk0sQ0FBckI7QUFLSDtBQUNKLGlCQXBCRDtBQXFCSCxhQXRCRCxNQXNCTztBQUNILHFCQUFLZCxvQkFBTDtBQUNIO0FBQ0osU0ExSmdCOztBQTRKakJSLGdCQUFRLFNBQVNBLE1BQVQsR0FBa0I7QUFDdEI7QUFDQSxpQkFBS1UsU0FBTCxHQUFpQjVmLE1BQU1DLFNBQU4sQ0FBZ0I5QyxLQUFoQixDQUFzQitDLElBQXRCLENBQTJCLEtBQUswZSxnQkFBTCxDQUFzQjVNLGdCQUF0QixDQUF1QyxLQUFLMk0sU0FBTCxDQUFlbEQsaUJBQXRELENBQTNCLENBQWpCO0FBQ0EsaUJBQUsyRSxjQUFMO0FBQ0EsaUJBQUtWLG9CQUFMO0FBQ0EsaUJBQUtZLG1CQUFMO0FBQ0gsU0FsS2dCOztBQW9LakJHLGlCQUFTLFNBQVNBLE9BQVQsR0FBbUI7QUFDeEJsZ0IsbUJBQU9rTyxtQkFBUCxDQUEyQixRQUEzQixFQUFxQyxLQUFLc1Esa0JBQTFDO0FBQ0EsZ0JBQUksS0FBS0QsWUFBVCxFQUF1QjtBQUNuQnZkLDZCQUFhLEtBQUt1ZCxZQUFsQjtBQUNBLHFCQUFLQSxZQUFMLEdBQW9CLElBQXBCO0FBQ0g7QUFDRCxpQkFBS3FCLGtCQUFMO0FBQ0EsaUJBQUtQLFNBQUwsR0FBaUIsSUFBakI7QUFDQSxpQkFBS2hCLGdCQUFMLEdBQXdCLElBQXhCO0FBQ0EsaUJBQUtELFNBQUwsR0FBaUIsSUFBakI7QUFDSDtBQTlLZ0IsS0FBckI7O0FBaUxBO0FBQ0EsUUFBSStCLGtCQUFrQm5nQixPQUFPb2dCLGVBQTdCO0FBQ0EsUUFBSUQsZUFBSixFQUFxQjtBQUNqQi9DLHVCQUFlcEMsUUFBZixFQUF5Qm1GLGVBQXpCO0FBQ0g7O0FBRUQsV0FBT25GLFFBQVA7QUFDSCxDQXhVRDs7Ozs7QUNKQTs7Ozs7Ozs7Ozs7QUFXQSxDQUFDLFVBQVMzYyxDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLGdCQUFZLE9BQU9zZCxNQUFuQixJQUEyQkEsT0FBT0MsR0FBbEMsR0FBc0NELE9BQU8sK0JBQVAsRUFBdUMsQ0FBQyxRQUFELENBQXZDLEVBQWtELFVBQVMvZCxDQUFULEVBQVc7QUFBQyxXQUFPUyxFQUFFYSxDQUFGLEVBQUl0QixDQUFKLENBQVA7QUFBYyxHQUE1RSxDQUF0QyxHQUFvSCxvQkFBaUI4ZCxNQUFqQix5Q0FBaUJBLE1BQWpCLE1BQXlCQSxPQUFPRCxPQUFoQyxHQUF3Q0MsT0FBT0QsT0FBUCxHQUFlcGQsRUFBRWEsQ0FBRixFQUFJZ2lCLFFBQVEsUUFBUixDQUFKLENBQXZELEdBQThFaGlCLEVBQUVpaUIsYUFBRixHQUFnQjlpQixFQUFFYSxDQUFGLEVBQUlBLEVBQUU2RCxNQUFOLENBQWxOO0FBQWdPLENBQTlPLENBQStPbEMsTUFBL08sRUFBc1AsVUFBUzNCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUM7QUFBYSxXQUFTVCxDQUFULENBQVdBLENBQVgsRUFBYXdqQixDQUFiLEVBQWVDLENBQWYsRUFBaUI7QUFBQyxhQUFTQyxDQUFULENBQVdwaUIsQ0FBWCxFQUFhYixDQUFiLEVBQWVrakIsQ0FBZixFQUFpQjtBQUFDLFVBQUlDLENBQUo7QUFBQSxVQUFNSixJQUFFLFNBQU94akIsQ0FBUCxHQUFTLElBQVQsR0FBY1MsQ0FBZCxHQUFnQixJQUF4QixDQUE2QixPQUFPYSxFQUFFOUMsSUFBRixDQUFPLFVBQVM4QyxDQUFULEVBQVdvaUIsQ0FBWCxFQUFhO0FBQUMsWUFBSUcsSUFBRUosRUFBRTdsQixJQUFGLENBQU84bEIsQ0FBUCxFQUFTMWpCLENBQVQsQ0FBTixDQUFrQixJQUFHLENBQUM2akIsQ0FBSixFQUFNLE9BQU8sS0FBS0MsRUFBRTlqQixJQUFFLDhDQUFGLEdBQWlEd2pCLENBQW5ELENBQVosQ0FBa0UsSUFBSU8sSUFBRUYsRUFBRXBqQixDQUFGLENBQU4sQ0FBVyxJQUFHLENBQUNzakIsQ0FBRCxJQUFJLE9BQUt0akIsRUFBRXVqQixNQUFGLENBQVMsQ0FBVCxDQUFaLEVBQXdCLE9BQU8sS0FBS0YsRUFBRU4sSUFBRSx3QkFBSixDQUFaLENBQTBDLElBQUlTLElBQUVGLEVBQUU3aEIsS0FBRixDQUFRMmhCLENBQVIsRUFBVUYsQ0FBVixDQUFOLENBQW1CQyxJQUFFLEtBQUssQ0FBTCxLQUFTQSxDQUFULEdBQVdLLENBQVgsR0FBYUwsQ0FBZjtBQUFpQixPQUFoTyxHQUFrTyxLQUFLLENBQUwsS0FBU0EsQ0FBVCxHQUFXQSxDQUFYLEdBQWF0aUIsQ0FBdFA7QUFBd1AsY0FBU3VpQixDQUFULENBQVd2aUIsQ0FBWCxFQUFhYixDQUFiLEVBQWU7QUFBQ2EsUUFBRTlDLElBQUYsQ0FBTyxVQUFTOEMsQ0FBVCxFQUFXcWlCLENBQVgsRUFBYTtBQUFDLFlBQUlDLElBQUVILEVBQUU3bEIsSUFBRixDQUFPK2xCLENBQVAsRUFBUzNqQixDQUFULENBQU4sQ0FBa0I0akIsS0FBR0EsRUFBRU0sTUFBRixDQUFTempCLENBQVQsR0FBWW1qQixFQUFFbmxCLEtBQUYsRUFBZixLQUEyQm1sQixJQUFFLElBQUlKLENBQUosQ0FBTUcsQ0FBTixFQUFRbGpCLENBQVIsQ0FBRixFQUFhZ2pCLEVBQUU3bEIsSUFBRixDQUFPK2xCLENBQVAsRUFBUzNqQixDQUFULEVBQVc0akIsQ0FBWCxDQUF4QztBQUF1RCxPQUE5RjtBQUFnRyxTQUFFSCxLQUFHaGpCLENBQUgsSUFBTWEsRUFBRTZELE1BQVYsRUFBaUJzZSxNQUFJRCxFQUFFN2dCLFNBQUYsQ0FBWXVoQixNQUFaLEtBQXFCVixFQUFFN2dCLFNBQUYsQ0FBWXVoQixNQUFaLEdBQW1CLFVBQVM1aUIsQ0FBVCxFQUFXO0FBQUNtaUIsUUFBRVUsYUFBRixDQUFnQjdpQixDQUFoQixNQUFxQixLQUFLb08sT0FBTCxHQUFhK1QsRUFBRXphLE1BQUYsQ0FBUyxDQUFDLENBQVYsRUFBWSxLQUFLMEcsT0FBakIsRUFBeUJwTyxDQUF6QixDQUFsQztBQUErRCxLQUFuSCxHQUFxSG1pQixFQUFFdmdCLEVBQUYsQ0FBS2xELENBQUwsSUFBUSxVQUFTc0IsQ0FBVCxFQUFXO0FBQUMsVUFBRyxZQUFVLE9BQU9BLENBQXBCLEVBQXNCO0FBQUMsWUFBSWIsSUFBRW1qQixFQUFFaGhCLElBQUYsQ0FBT1gsU0FBUCxFQUFpQixDQUFqQixDQUFOLENBQTBCLE9BQU95aEIsRUFBRSxJQUFGLEVBQU9waUIsQ0FBUCxFQUFTYixDQUFULENBQVA7QUFBbUIsY0FBT29qQixFQUFFLElBQUYsRUFBT3ZpQixDQUFQLEdBQVUsSUFBakI7QUFBc0IsS0FBbk8sRUFBb09xaUIsRUFBRUYsQ0FBRixDQUF4TyxDQUFqQjtBQUErUCxZQUFTRSxDQUFULENBQVdyaUIsQ0FBWCxFQUFhO0FBQUMsS0FBQ0EsQ0FBRCxJQUFJQSxLQUFHQSxFQUFFOGlCLE9BQVQsS0FBbUI5aUIsRUFBRThpQixPQUFGLEdBQVVwa0IsQ0FBN0I7QUFBZ0MsT0FBSTRqQixJQUFFbGhCLE1BQU1DLFNBQU4sQ0FBZ0I5QyxLQUF0QjtBQUFBLE1BQTRCMmpCLElBQUVsaUIsRUFBRWxDLE9BQWhDO0FBQUEsTUFBd0Mwa0IsSUFBRSxlQUFhLE9BQU9OLENBQXBCLEdBQXNCLFlBQVUsQ0FBRSxDQUFsQyxHQUFtQyxVQUFTbGlCLENBQVQsRUFBVztBQUFDa2lCLE1BQUVua0IsS0FBRixDQUFRaUMsQ0FBUjtBQUFXLEdBQXBHLENBQXFHLE9BQU9xaUIsRUFBRWxqQixLQUFHYSxFQUFFNkQsTUFBUCxHQUFlbkYsQ0FBdEI7QUFBd0IsQ0FBcG1DLENBQUQsRUFBdW1DLFVBQVNzQixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLGdCQUFZLE9BQU9zZCxNQUFuQixJQUEyQkEsT0FBT0MsR0FBbEMsR0FBc0NELE9BQU8sdUJBQVAsRUFBK0J0ZCxDQUEvQixDQUF0QyxHQUF3RSxvQkFBaUJxZCxNQUFqQix5Q0FBaUJBLE1BQWpCLE1BQXlCQSxPQUFPRCxPQUFoQyxHQUF3Q0MsT0FBT0QsT0FBUCxHQUFlcGQsR0FBdkQsR0FBMkRhLEVBQUUraUIsU0FBRixHQUFZNWpCLEdBQS9JO0FBQW1KLENBQWpLLENBQWtLLGVBQWEsT0FBT3dDLE1BQXBCLEdBQTJCQSxNQUEzQixZQUFsSyxFQUF5TSxZQUFVO0FBQUMsV0FBUzNCLENBQVQsR0FBWSxDQUFFLEtBQUliLElBQUVhLEVBQUVxQixTQUFSLENBQWtCLE9BQU9sQyxFQUFFcUosRUFBRixHQUFLLFVBQVN4SSxDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFFBQUdhLEtBQUdiLENBQU4sRUFBUTtBQUFDLFVBQUlULElBQUUsS0FBSzRXLE9BQUwsR0FBYSxLQUFLQSxPQUFMLElBQWMsRUFBakM7QUFBQSxVQUFvQytNLElBQUUzakIsRUFBRXNCLENBQUYsSUFBS3RCLEVBQUVzQixDQUFGLEtBQU0sRUFBakQsQ0FBb0QsT0FBT3FpQixFQUFFMWxCLE9BQUYsQ0FBVXdDLENBQVYsS0FBYyxDQUFDLENBQWYsSUFBa0JrakIsRUFBRTdsQixJQUFGLENBQU8yQyxDQUFQLENBQWxCLEVBQTRCLElBQW5DO0FBQXdDO0FBQUMsR0FBekgsRUFBMEhBLEVBQUU2akIsSUFBRixHQUFPLFVBQVNoakIsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxRQUFHYSxLQUFHYixDQUFOLEVBQVE7QUFBQyxXQUFLcUosRUFBTCxDQUFReEksQ0FBUixFQUFVYixDQUFWLEVBQWEsSUFBSVQsSUFBRSxLQUFLdWtCLFdBQUwsR0FBaUIsS0FBS0EsV0FBTCxJQUFrQixFQUF6QztBQUFBLFVBQTRDWixJQUFFM2pCLEVBQUVzQixDQUFGLElBQUt0QixFQUFFc0IsQ0FBRixLQUFNLEVBQXpELENBQTRELE9BQU9xaUIsRUFBRWxqQixDQUFGLElBQUssQ0FBQyxDQUFOLEVBQVEsSUFBZjtBQUFvQjtBQUFDLEdBQXRQLEVBQXVQQSxFQUFFMEosR0FBRixHQUFNLFVBQVM3SSxDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFFBQUlULElBQUUsS0FBSzRXLE9BQUwsSUFBYyxLQUFLQSxPQUFMLENBQWF0VixDQUFiLENBQXBCLENBQW9DLElBQUd0QixLQUFHQSxFQUFFVixNQUFSLEVBQWU7QUFBQyxVQUFJcWtCLElBQUUzakIsRUFBRS9CLE9BQUYsQ0FBVXdDLENBQVYsQ0FBTixDQUFtQixPQUFPa2pCLEtBQUcsQ0FBQyxDQUFKLElBQU8zakIsRUFBRWhDLE1BQUYsQ0FBUzJsQixDQUFULEVBQVcsQ0FBWCxDQUFQLEVBQXFCLElBQTVCO0FBQWlDO0FBQUMsR0FBcFgsRUFBcVhsakIsRUFBRStqQixTQUFGLEdBQVksVUFBU2xqQixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFFBQUlULElBQUUsS0FBSzRXLE9BQUwsSUFBYyxLQUFLQSxPQUFMLENBQWF0VixDQUFiLENBQXBCLENBQW9DLElBQUd0QixLQUFHQSxFQUFFVixNQUFSLEVBQWU7QUFBQyxVQUFJcWtCLElBQUUsQ0FBTjtBQUFBLFVBQVFDLElBQUU1akIsRUFBRTJqQixDQUFGLENBQVYsQ0FBZWxqQixJQUFFQSxLQUFHLEVBQUwsQ0FBUSxLQUFJLElBQUkraUIsSUFBRSxLQUFLZSxXQUFMLElBQWtCLEtBQUtBLFdBQUwsQ0FBaUJqakIsQ0FBakIsQ0FBNUIsRUFBZ0RzaUIsQ0FBaEQsR0FBbUQ7QUFBQyxZQUFJRSxJQUFFTixLQUFHQSxFQUFFSSxDQUFGLENBQVQsQ0FBY0UsTUFBSSxLQUFLM1osR0FBTCxDQUFTN0ksQ0FBVCxFQUFXc2lCLENBQVgsR0FBYyxPQUFPSixFQUFFSSxDQUFGLENBQXpCLEdBQStCQSxFQUFFMWhCLEtBQUYsQ0FBUSxJQUFSLEVBQWF6QixDQUFiLENBQS9CLEVBQStDa2pCLEtBQUdHLElBQUUsQ0FBRixHQUFJLENBQXRELEVBQXdERixJQUFFNWpCLEVBQUUyakIsQ0FBRixDQUExRDtBQUErRCxjQUFPLElBQVA7QUFBWTtBQUFDLEdBQXhtQixFQUF5bUJyaUIsQ0FBaG5CO0FBQWtuQixDQUF0MkIsQ0FBdm1DLEVBQSs4RCxVQUFTQSxDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDO0FBQWEsZ0JBQVksT0FBT3NkLE1BQW5CLElBQTJCQSxPQUFPQyxHQUFsQyxHQUFzQ0QsT0FBTyxtQkFBUCxFQUEyQixFQUEzQixFQUE4QixZQUFVO0FBQUMsV0FBT3RkLEdBQVA7QUFBVyxHQUFwRCxDQUF0QyxHQUE0RixvQkFBaUJxZCxNQUFqQix5Q0FBaUJBLE1BQWpCLE1BQXlCQSxPQUFPRCxPQUFoQyxHQUF3Q0MsT0FBT0QsT0FBUCxHQUFlcGQsR0FBdkQsR0FBMkRhLEVBQUVtakIsT0FBRixHQUFVaGtCLEdBQWpLO0FBQXFLLENBQWhNLENBQWlNd0MsTUFBak0sRUFBd00sWUFBVTtBQUFDO0FBQWEsV0FBUzNCLENBQVQsQ0FBV0EsQ0FBWCxFQUFhO0FBQUMsUUFBSWIsSUFBRXdFLFdBQVczRCxDQUFYLENBQU47QUFBQSxRQUFvQnRCLElBQUVzQixFQUFFckQsT0FBRixDQUFVLEdBQVYsS0FBZ0IsQ0FBQyxDQUFqQixJQUFvQixDQUFDK0csTUFBTXZFLENBQU4sQ0FBM0MsQ0FBb0QsT0FBT1QsS0FBR1MsQ0FBVjtBQUFZLFlBQVNBLENBQVQsR0FBWSxDQUFFLFVBQVNULENBQVQsR0FBWTtBQUFDLFNBQUksSUFBSXNCLElBQUUsRUFBQzhFLE9BQU0sQ0FBUCxFQUFTRCxRQUFPLENBQWhCLEVBQWtCeVosWUFBVyxDQUE3QixFQUErQm5HLGFBQVksQ0FBM0MsRUFBNkNpTCxZQUFXLENBQXhELEVBQTBEQyxhQUFZLENBQXRFLEVBQU4sRUFBK0Vsa0IsSUFBRSxDQUFyRixFQUF1RkEsSUFBRW9qQixDQUF6RixFQUEyRnBqQixHQUEzRixFQUErRjtBQUFDLFVBQUlULElBQUUwakIsRUFBRWpqQixDQUFGLENBQU4sQ0FBV2EsRUFBRXRCLENBQUYsSUFBSyxDQUFMO0FBQU8sWUFBT3NCLENBQVA7QUFBUyxZQUFTcWlCLENBQVQsQ0FBV3JpQixDQUFYLEVBQWE7QUFBQyxRQUFJYixJQUFFNkwsaUJBQWlCaEwsQ0FBakIsQ0FBTixDQUEwQixPQUFPYixLQUFHZ2pCLEVBQUUsb0JBQWtCaGpCLENBQWxCLEdBQW9CLDBGQUF0QixDQUFILEVBQXFIQSxDQUE1SDtBQUE4SCxZQUFTbWpCLENBQVQsR0FBWTtBQUFDLFFBQUcsQ0FBQ0csQ0FBSixFQUFNO0FBQUNBLFVBQUUsQ0FBQyxDQUFILENBQUssSUFBSXRqQixJQUFFVSxTQUFTQyxhQUFULENBQXVCLEtBQXZCLENBQU4sQ0FBb0NYLEVBQUVjLEtBQUYsQ0FBUTZFLEtBQVIsR0FBYyxPQUFkLEVBQXNCM0YsRUFBRWMsS0FBRixDQUFRcWpCLE9BQVIsR0FBZ0IsaUJBQXRDLEVBQXdEbmtCLEVBQUVjLEtBQUYsQ0FBUXNqQixXQUFSLEdBQW9CLE9BQTVFLEVBQW9GcGtCLEVBQUVjLEtBQUYsQ0FBUXVqQixXQUFSLEdBQW9CLGlCQUF4RyxFQUEwSHJrQixFQUFFYyxLQUFGLENBQVF3akIsU0FBUixHQUFrQixZQUE1SSxDQUF5SixJQUFJL2tCLElBQUVtQixTQUFTMEYsSUFBVCxJQUFlMUYsU0FBU3VQLGVBQTlCLENBQThDMVEsRUFBRWdsQixXQUFGLENBQWN2a0IsQ0FBZCxFQUFpQixJQUFJbWpCLElBQUVELEVBQUVsakIsQ0FBRixDQUFOLENBQVcraUIsRUFBRXlCLGNBQUYsR0FBaUJuQixJQUFFLE9BQUt4aUIsRUFBRXNpQixFQUFFeGQsS0FBSixDQUF4QixFQUFtQ3BHLEVBQUVrbEIsV0FBRixDQUFjemtCLENBQWQsQ0FBbkM7QUFBb0Q7QUFBQyxZQUFTK2lCLENBQVQsQ0FBVy9pQixDQUFYLEVBQWE7QUFBQyxRQUFHbWpCLEtBQUksWUFBVSxPQUFPbmpCLENBQWpCLEtBQXFCQSxJQUFFVSxTQUFTZ2tCLGFBQVQsQ0FBdUIxa0IsQ0FBdkIsQ0FBdkIsQ0FBSixFQUFzREEsS0FBRyxvQkFBaUJBLENBQWpCLHlDQUFpQkEsQ0FBakIsRUFBSCxJQUF1QkEsRUFBRTJrQixRQUFsRixFQUEyRjtBQUFDLFVBQUk1QixJQUFFRyxFQUFFbGpCLENBQUYsQ0FBTixDQUFXLElBQUcsVUFBUStpQixFQUFFNkIsT0FBYixFQUFxQixPQUFPcmxCLEdBQVAsQ0FBVyxJQUFJeWpCLElBQUUsRUFBTixDQUFTQSxFQUFFcmQsS0FBRixHQUFRM0YsRUFBRWdPLFdBQVYsRUFBc0JnVixFQUFFdGQsTUFBRixHQUFTMUYsRUFBRW9aLFlBQWpDLENBQThDLEtBQUksSUFBSWtLLElBQUVOLEVBQUU2QixXQUFGLEdBQWMsZ0JBQWM5QixFQUFFdUIsU0FBcEMsRUFBOENkLElBQUUsQ0FBcEQsRUFBc0RBLElBQUVKLENBQXhELEVBQTBESSxHQUExRCxFQUE4RDtBQUFDLFlBQUlzQixJQUFFN0IsRUFBRU8sQ0FBRixDQUFOO0FBQUEsWUFBV3VCLElBQUVoQyxFQUFFK0IsQ0FBRixDQUFiO0FBQUEsWUFBa0J4bUIsSUFBRWtHLFdBQVd1Z0IsQ0FBWCxDQUFwQixDQUFrQy9CLEVBQUU4QixDQUFGLElBQUt2Z0IsTUFBTWpHLENBQU4sSUFBUyxDQUFULEdBQVdBLENBQWhCO0FBQWtCLFdBQUkwbUIsSUFBRWhDLEVBQUVpQyxXQUFGLEdBQWNqQyxFQUFFa0MsWUFBdEI7QUFBQSxVQUFtQ0MsSUFBRW5DLEVBQUVvQyxVQUFGLEdBQWFwQyxFQUFFcUMsYUFBcEQ7QUFBQSxVQUFrRUMsSUFBRXRDLEVBQUV1QyxVQUFGLEdBQWF2QyxFQUFFd0MsV0FBbkY7QUFBQSxVQUErRnpVLElBQUVpUyxFQUFFeUMsU0FBRixHQUFZekMsRUFBRTBDLFlBQS9HO0FBQUEsVUFBNEhDLElBQUUzQyxFQUFFNEMsZUFBRixHQUFrQjVDLEVBQUU2QyxnQkFBbEo7QUFBQSxVQUFtS0MsSUFBRTlDLEVBQUUrQyxjQUFGLEdBQWlCL0MsRUFBRWdELGlCQUF4TDtBQUFBLFVBQTBNQyxJQUFFM0MsS0FBR0QsQ0FBL007QUFBQSxVQUFpTnpTLElBQUUvUCxFQUFFa2lCLEVBQUVwZCxLQUFKLENBQW5OLENBQThOaUwsTUFBSSxDQUFDLENBQUwsS0FBU29TLEVBQUVyZCxLQUFGLEdBQVFpTCxLQUFHcVYsSUFBRSxDQUFGLEdBQUlqQixJQUFFVyxDQUFULENBQWpCLEVBQThCLElBQUlPLElBQUVybEIsRUFBRWtpQixFQUFFcmQsTUFBSixDQUFOLENBQWtCLE9BQU93Z0IsTUFBSSxDQUFDLENBQUwsS0FBU2xELEVBQUV0ZCxNQUFGLEdBQVN3Z0IsS0FBR0QsSUFBRSxDQUFGLEdBQUlkLElBQUVXLENBQVQsQ0FBbEIsR0FBK0I5QyxFQUFFN0QsVUFBRixHQUFhNkQsRUFBRXJkLEtBQUYsSUFBU3FmLElBQUVXLENBQVgsQ0FBNUMsRUFBMEQzQyxFQUFFaEssV0FBRixHQUFjZ0ssRUFBRXRkLE1BQUYsSUFBVXlmLElBQUVXLENBQVosQ0FBeEUsRUFBdUY5QyxFQUFFaUIsVUFBRixHQUFhakIsRUFBRXJkLEtBQUYsR0FBUTJmLENBQTVHLEVBQThHdEMsRUFBRWtCLFdBQUYsR0FBY2xCLEVBQUV0ZCxNQUFGLEdBQVNxTCxDQUFySSxFQUF1SWlTLENBQTlJO0FBQWdKO0FBQUMsT0FBSUssQ0FBSjtBQUFBLE1BQU1MLElBQUUsZUFBYSxPQUFPcmtCLE9BQXBCLEdBQTRCcUIsQ0FBNUIsR0FBOEIsVUFBU2EsQ0FBVCxFQUFXO0FBQUNsQyxZQUFRQyxLQUFSLENBQWNpQyxDQUFkO0FBQWlCLEdBQW5FO0FBQUEsTUFBb0VvaUIsSUFBRSxDQUFDLGFBQUQsRUFBZSxjQUFmLEVBQThCLFlBQTlCLEVBQTJDLGVBQTNDLEVBQTJELFlBQTNELEVBQXdFLGFBQXhFLEVBQXNGLFdBQXRGLEVBQWtHLGNBQWxHLEVBQWlILGlCQUFqSCxFQUFtSSxrQkFBbkksRUFBc0osZ0JBQXRKLEVBQXVLLG1CQUF2SyxDQUF0RTtBQUFBLE1BQWtRRyxJQUFFSCxFQUFFcGtCLE1BQXRRO0FBQUEsTUFBNlF5a0IsSUFBRSxDQUFDLENBQWhSLENBQWtSLE9BQU9QLENBQVA7QUFBUyxDQUF4N0QsQ0FBLzhELEVBQXk0SCxVQUFTbGlCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUM7QUFBYSxnQkFBWSxPQUFPc2QsTUFBbkIsSUFBMkJBLE9BQU9DLEdBQWxDLEdBQXNDRCxPQUFPLDRDQUFQLEVBQW9EdGQsQ0FBcEQsQ0FBdEMsR0FBNkYsb0JBQWlCcWQsTUFBakIseUNBQWlCQSxNQUFqQixNQUF5QkEsT0FBT0QsT0FBaEMsR0FBd0NDLE9BQU9ELE9BQVAsR0FBZXBkLEdBQXZELEdBQTJEYSxFQUFFc2xCLGVBQUYsR0FBa0JubUIsR0FBMUs7QUFBOEssQ0FBek0sQ0FBME13QyxNQUExTSxFQUFpTixZQUFVO0FBQUM7QUFBYSxNQUFJM0IsSUFBRSxZQUFVO0FBQUMsUUFBSUEsSUFBRXVsQixRQUFRbGtCLFNBQWQsQ0FBd0IsSUFBR3JCLEVBQUVxSyxPQUFMLEVBQWEsT0FBTSxTQUFOLENBQWdCLElBQUdySyxFQUFFc2xCLGVBQUwsRUFBcUIsT0FBTSxpQkFBTixDQUF3QixLQUFJLElBQUlubUIsSUFBRSxDQUFDLFFBQUQsRUFBVSxLQUFWLEVBQWdCLElBQWhCLEVBQXFCLEdBQXJCLENBQU4sRUFBZ0NULElBQUUsQ0FBdEMsRUFBd0NBLElBQUVTLEVBQUVuQixNQUE1QyxFQUFtRFUsR0FBbkQsRUFBdUQ7QUFBQyxVQUFJMmpCLElBQUVsakIsRUFBRVQsQ0FBRixDQUFOO0FBQUEsVUFBVzRqQixJQUFFRCxJQUFFLGlCQUFmLENBQWlDLElBQUdyaUIsRUFBRXNpQixDQUFGLENBQUgsRUFBUSxPQUFPQSxDQUFQO0FBQVM7QUFBQyxHQUF4TixFQUFOLENBQWlPLE9BQU8sVUFBU25qQixDQUFULEVBQVdULENBQVgsRUFBYTtBQUFDLFdBQU9TLEVBQUVhLENBQUYsRUFBS3RCLENBQUwsQ0FBUDtBQUFlLEdBQXBDO0FBQXFDLENBQS9lLENBQXo0SCxFQUEwM0ksVUFBU3NCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsZ0JBQVksT0FBT3NkLE1BQW5CLElBQTJCQSxPQUFPQyxHQUFsQyxHQUFzQ0QsT0FBTyxzQkFBUCxFQUE4QixDQUFDLDRDQUFELENBQTlCLEVBQTZFLFVBQVMvZCxDQUFULEVBQVc7QUFBQyxXQUFPUyxFQUFFYSxDQUFGLEVBQUl0QixDQUFKLENBQVA7QUFBYyxHQUF2RyxDQUF0QyxHQUErSSxvQkFBaUI4ZCxNQUFqQix5Q0FBaUJBLE1BQWpCLE1BQXlCQSxPQUFPRCxPQUFoQyxHQUF3Q0MsT0FBT0QsT0FBUCxHQUFlcGQsRUFBRWEsQ0FBRixFQUFJZ2lCLFFBQVEsMkJBQVIsQ0FBSixDQUF2RCxHQUFpR2hpQixFQUFFd2xCLFlBQUYsR0FBZXJtQixFQUFFYSxDQUFGLEVBQUlBLEVBQUVzbEIsZUFBTixDQUEvUDtBQUFzUixDQUFwUyxDQUFxUzNqQixNQUFyUyxFQUE0UyxVQUFTM0IsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxNQUFJVCxJQUFFLEVBQU4sQ0FBU0EsRUFBRWdKLE1BQUYsR0FBUyxVQUFTMUgsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxTQUFJLElBQUlULENBQVIsSUFBYVMsQ0FBYjtBQUFlYSxRQUFFdEIsQ0FBRixJQUFLUyxFQUFFVCxDQUFGLENBQUw7QUFBZixLQUF5QixPQUFPc0IsQ0FBUDtBQUFTLEdBQXpELEVBQTBEdEIsRUFBRSttQixNQUFGLEdBQVMsVUFBU3psQixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFdBQU0sQ0FBQ2EsSUFBRWIsQ0FBRixHQUFJQSxDQUFMLElBQVFBLENBQWQ7QUFBZ0IsR0FBakcsRUFBa0dULEVBQUVnbkIsU0FBRixHQUFZLFVBQVMxbEIsQ0FBVCxFQUFXO0FBQUMsUUFBSWIsSUFBRSxFQUFOLENBQVMsSUFBR2lDLE1BQU0wSyxPQUFOLENBQWM5TCxDQUFkLENBQUgsRUFBb0JiLElBQUVhLENBQUYsQ0FBcEIsS0FBNkIsSUFBR0EsS0FBRyxZQUFVLE9BQU9BLEVBQUVoQyxNQUF6QixFQUFnQyxLQUFJLElBQUlVLElBQUUsQ0FBVixFQUFZQSxJQUFFc0IsRUFBRWhDLE1BQWhCLEVBQXVCVSxHQUF2QjtBQUEyQlMsUUFBRTNDLElBQUYsQ0FBT3dELEVBQUV0QixDQUFGLENBQVA7QUFBM0IsS0FBaEMsTUFBNkVTLEVBQUUzQyxJQUFGLENBQU93RCxDQUFQLEVBQVUsT0FBT2IsQ0FBUDtBQUFTLEdBQWhRLEVBQWlRVCxFQUFFaW5CLFVBQUYsR0FBYSxVQUFTM2xCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsUUFBSVQsSUFBRXNCLEVBQUVyRCxPQUFGLENBQVV3QyxDQUFWLENBQU4sQ0FBbUJULEtBQUcsQ0FBQyxDQUFKLElBQU9zQixFQUFFdEQsTUFBRixDQUFTZ0MsQ0FBVCxFQUFXLENBQVgsQ0FBUDtBQUFxQixHQUFwVSxFQUFxVUEsRUFBRWtuQixTQUFGLEdBQVksVUFBUzVsQixDQUFULEVBQVd0QixDQUFYLEVBQWE7QUFBQyxXQUFLc0IsS0FBR0gsU0FBUzBGLElBQWpCO0FBQXVCLFVBQUd2RixJQUFFQSxFQUFFcUYsVUFBSixFQUFlbEcsRUFBRWEsQ0FBRixFQUFJdEIsQ0FBSixDQUFsQixFQUF5QixPQUFPc0IsQ0FBUDtBQUFoRDtBQUF5RCxHQUF4WixFQUF5WnRCLEVBQUVtbkIsZUFBRixHQUFrQixVQUFTN2xCLENBQVQsRUFBVztBQUFDLFdBQU0sWUFBVSxPQUFPQSxDQUFqQixHQUFtQkgsU0FBU2drQixhQUFULENBQXVCN2pCLENBQXZCLENBQW5CLEdBQTZDQSxDQUFuRDtBQUFxRCxHQUE1ZSxFQUE2ZXRCLEVBQUVvbkIsV0FBRixHQUFjLFVBQVM5bEIsQ0FBVCxFQUFXO0FBQUMsUUFBSWIsSUFBRSxPQUFLYSxFQUFFNUMsSUFBYixDQUFrQixLQUFLK0IsQ0FBTCxLQUFTLEtBQUtBLENBQUwsRUFBUWEsQ0FBUixDQUFUO0FBQW9CLEdBQTdpQixFQUE4aUJ0QixFQUFFcW5CLGtCQUFGLEdBQXFCLFVBQVMvbEIsQ0FBVCxFQUFXcWlCLENBQVgsRUFBYTtBQUFDcmlCLFFBQUV0QixFQUFFZ25CLFNBQUYsQ0FBWTFsQixDQUFaLENBQUYsQ0FBaUIsSUFBSXNpQixJQUFFLEVBQU4sQ0FBUyxPQUFPdGlCLEVBQUV4QyxPQUFGLENBQVUsVUFBU3dDLENBQVQsRUFBVztBQUFDLFVBQUdBLGFBQWFnbUIsV0FBaEIsRUFBNEI7QUFBQyxZQUFHLENBQUMzRCxDQUFKLEVBQU0sT0FBTyxLQUFLQyxFQUFFOWxCLElBQUYsQ0FBT3dELENBQVAsQ0FBWixDQUFzQmIsRUFBRWEsQ0FBRixFQUFJcWlCLENBQUosS0FBUUMsRUFBRTlsQixJQUFGLENBQU93RCxDQUFQLENBQVIsQ0FBa0IsS0FBSSxJQUFJdEIsSUFBRXNCLEVBQUVvVCxnQkFBRixDQUFtQmlQLENBQW5CLENBQU4sRUFBNEJILElBQUUsQ0FBbEMsRUFBb0NBLElBQUV4akIsRUFBRVYsTUFBeEMsRUFBK0Nra0IsR0FBL0M7QUFBbURJLFlBQUU5bEIsSUFBRixDQUFPa0MsRUFBRXdqQixDQUFGLENBQVA7QUFBbkQ7QUFBZ0U7QUFBQyxLQUFsSyxHQUFvS0ksQ0FBM0s7QUFBNkssR0FBeHhCLEVBQXl4QjVqQixFQUFFdW5CLGNBQUYsR0FBaUIsVUFBU2ptQixDQUFULEVBQVdiLENBQVgsRUFBYVQsQ0FBYixFQUFlO0FBQUMsUUFBSTJqQixJQUFFcmlCLEVBQUVxQixTQUFGLENBQVlsQyxDQUFaLENBQU47QUFBQSxRQUFxQm1qQixJQUFFbmpCLElBQUUsU0FBekIsQ0FBbUNhLEVBQUVxQixTQUFGLENBQVlsQyxDQUFaLElBQWUsWUFBVTtBQUFDLFVBQUlhLElBQUUsS0FBS3NpQixDQUFMLENBQU4sQ0FBY3RpQixLQUFHMkMsYUFBYTNDLENBQWIsQ0FBSCxDQUFtQixJQUFJYixJQUFFd0IsU0FBTjtBQUFBLFVBQWdCdWhCLElBQUUsSUFBbEIsQ0FBdUIsS0FBS0ksQ0FBTCxJQUFRcGlCLFdBQVcsWUFBVTtBQUFDbWlCLFVBQUV6aEIsS0FBRixDQUFRc2hCLENBQVIsRUFBVS9pQixDQUFWLEdBQWEsT0FBTytpQixFQUFFSSxDQUFGLENBQXBCO0FBQXlCLE9BQS9DLEVBQWdENWpCLEtBQUcsR0FBbkQsQ0FBUjtBQUFnRSxLQUFsSjtBQUFtSixHQUFoL0IsRUFBaS9CQSxFQUFFd25CLFFBQUYsR0FBVyxVQUFTbG1CLENBQVQsRUFBVztBQUFDLFFBQUliLElBQUVVLFNBQVNrUCxVQUFmLENBQTBCLGNBQVk1UCxDQUFaLElBQWUsaUJBQWVBLENBQTlCLEdBQWdDZSxXQUFXRixDQUFYLENBQWhDLEdBQThDSCxTQUFTNFEsZ0JBQVQsQ0FBMEIsa0JBQTFCLEVBQTZDelEsQ0FBN0MsQ0FBOUM7QUFBOEYsR0FBaG9DLEVBQWlvQ3RCLEVBQUV5bkIsUUFBRixHQUFXLFVBQVNubUIsQ0FBVCxFQUFXO0FBQUMsV0FBT0EsRUFBRTRELE9BQUYsQ0FBVSxhQUFWLEVBQXdCLFVBQVM1RCxDQUFULEVBQVdiLENBQVgsRUFBYVQsQ0FBYixFQUFlO0FBQUMsYUFBT1MsSUFBRSxHQUFGLEdBQU1ULENBQWI7QUFBZSxLQUF2RCxFQUF5RHhDLFdBQXpELEVBQVA7QUFBOEUsR0FBdHVDLENBQXV1QyxJQUFJbW1CLElBQUVyaUIsRUFBRWxDLE9BQVIsQ0FBZ0IsT0FBT1ksRUFBRTBuQixRQUFGLEdBQVcsVUFBU2puQixDQUFULEVBQVdtakIsQ0FBWCxFQUFhO0FBQUM1akIsTUFBRXduQixRQUFGLENBQVcsWUFBVTtBQUFDLFVBQUloRSxJQUFFeGpCLEVBQUV5bkIsUUFBRixDQUFXN0QsQ0FBWCxDQUFOO0FBQUEsVUFBb0JFLElBQUUsVUFBUU4sQ0FBOUI7QUFBQSxVQUFnQ0MsSUFBRXRpQixTQUFTdVQsZ0JBQVQsQ0FBMEIsTUFBSW9QLENBQUosR0FBTSxHQUFoQyxDQUFsQztBQUFBLFVBQXVFSixJQUFFdmlCLFNBQVN1VCxnQkFBVCxDQUEwQixTQUFPOE8sQ0FBakMsQ0FBekU7QUFBQSxVQUE2R0ssSUFBRTdqQixFQUFFZ25CLFNBQUYsQ0FBWXZELENBQVosRUFBZTllLE1BQWYsQ0FBc0IzRSxFQUFFZ25CLFNBQUYsQ0FBWXRELENBQVosQ0FBdEIsQ0FBL0c7QUFBQSxVQUFxSkssSUFBRUQsSUFBRSxVQUF6SjtBQUFBLFVBQW9LRyxJQUFFM2lCLEVBQUU2RCxNQUF4SyxDQUErSzBlLEVBQUUva0IsT0FBRixDQUFVLFVBQVN3QyxDQUFULEVBQVc7QUFBQyxZQUFJdEIsQ0FBSjtBQUFBLFlBQU13akIsSUFBRWxpQixFQUFFb1osWUFBRixDQUFlb0osQ0FBZixLQUFtQnhpQixFQUFFb1osWUFBRixDQUFlcUosQ0FBZixDQUEzQixDQUE2QyxJQUFHO0FBQUMvakIsY0FBRXdqQixLQUFHbUUsS0FBS0MsS0FBTCxDQUFXcEUsQ0FBWCxDQUFMO0FBQW1CLFNBQXZCLENBQXVCLE9BQU1DLENBQU4sRUFBUTtBQUFDLGlCQUFPLE1BQUtFLEtBQUdBLEVBQUV0a0IsS0FBRixDQUFRLG1CQUFpQnlrQixDQUFqQixHQUFtQixNQUFuQixHQUEwQnhpQixFQUFFckUsU0FBNUIsR0FBc0MsSUFBdEMsR0FBMkN3bUIsQ0FBbkQsQ0FBUixDQUFQO0FBQXNFLGFBQUlDLElBQUUsSUFBSWpqQixDQUFKLENBQU1hLENBQU4sRUFBUXRCLENBQVIsQ0FBTixDQUFpQmlrQixLQUFHQSxFQUFFcm1CLElBQUYsQ0FBTzBELENBQVAsRUFBU3NpQixDQUFULEVBQVdGLENBQVgsQ0FBSDtBQUFpQixPQUEzTTtBQUE2TSxLQUFsWjtBQUFvWixHQUE3YSxFQUE4YTFqQixDQUFyYjtBQUF1YixDQUFqL0QsQ0FBMTNJLEVBQTYyTSxVQUFTc0IsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxnQkFBWSxPQUFPc2QsTUFBbkIsSUFBMkJBLE9BQU9DLEdBQWxDLEdBQXNDRCxPQUFPLGtCQUFQLEVBQTBCLENBQUMsbUJBQUQsQ0FBMUIsRUFBZ0QsVUFBUy9kLENBQVQsRUFBVztBQUFDLFdBQU9TLEVBQUVhLENBQUYsRUFBSXRCLENBQUosQ0FBUDtBQUFjLEdBQTFFLENBQXRDLEdBQWtILG9CQUFpQjhkLE1BQWpCLHlDQUFpQkEsTUFBakIsTUFBeUJBLE9BQU9ELE9BQWhDLEdBQXdDQyxPQUFPRCxPQUFQLEdBQWVwZCxFQUFFYSxDQUFGLEVBQUlnaUIsUUFBUSxVQUFSLENBQUosQ0FBdkQsSUFBaUZoaUIsRUFBRXVtQixRQUFGLEdBQVd2bUIsRUFBRXVtQixRQUFGLElBQVksRUFBdkIsRUFBMEJ2bUIsRUFBRXVtQixRQUFGLENBQVdDLElBQVgsR0FBZ0JybkIsRUFBRWEsQ0FBRixFQUFJQSxFQUFFbWpCLE9BQU4sQ0FBM0gsQ0FBbEg7QUFBNlAsQ0FBM1EsQ0FBNFF4aEIsTUFBNVEsRUFBbVIsVUFBUzNCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsV0FBU1QsQ0FBVCxDQUFXc0IsQ0FBWCxFQUFhYixDQUFiLEVBQWU7QUFBQyxTQUFLK0UsT0FBTCxHQUFhbEUsQ0FBYixFQUFlLEtBQUttRSxNQUFMLEdBQVloRixDQUEzQixFQUE2QixLQUFLc25CLE1BQUwsRUFBN0I7QUFBMkMsT0FBSXBFLElBQUUzakIsRUFBRTJDLFNBQVIsQ0FBa0IsT0FBT2doQixFQUFFb0UsTUFBRixHQUFTLFlBQVU7QUFBQyxTQUFLdmlCLE9BQUwsQ0FBYWpFLEtBQWIsQ0FBbUI2RixRQUFuQixHQUE0QixVQUE1QixFQUF1QyxLQUFLaUssQ0FBTCxHQUFPLENBQTlDLEVBQWdELEtBQUsyVyxLQUFMLEdBQVcsQ0FBM0Q7QUFBNkQsR0FBakYsRUFBa0ZyRSxFQUFFUixPQUFGLEdBQVUsWUFBVTtBQUFDLFNBQUszZCxPQUFMLENBQWFqRSxLQUFiLENBQW1CNkYsUUFBbkIsR0FBNEIsRUFBNUIsQ0FBK0IsSUFBSTlGLElBQUUsS0FBS21FLE1BQUwsQ0FBWXdpQixVQUFsQixDQUE2QixLQUFLemlCLE9BQUwsQ0FBYWpFLEtBQWIsQ0FBbUJELENBQW5CLElBQXNCLEVBQXRCO0FBQXlCLEdBQTVMLEVBQTZMcWlCLEVBQUVjLE9BQUYsR0FBVSxZQUFVO0FBQUMsU0FBS2xaLElBQUwsR0FBVTlLLEVBQUUsS0FBSytFLE9BQVAsQ0FBVjtBQUEwQixHQUE1TyxFQUE2T21lLEVBQUV1RSxXQUFGLEdBQWMsVUFBUzVtQixDQUFULEVBQVc7QUFBQyxTQUFLK1AsQ0FBTCxHQUFPL1AsQ0FBUCxFQUFTLEtBQUs2bUIsWUFBTCxFQUFULEVBQTZCLEtBQUtDLGNBQUwsQ0FBb0I5bUIsQ0FBcEIsQ0FBN0I7QUFBb0QsR0FBM1QsRUFBNFRxaUIsRUFBRXdFLFlBQUYsR0FBZXhFLEVBQUUwRSxnQkFBRixHQUFtQixZQUFVO0FBQUMsUUFBSS9tQixJQUFFLFVBQVEsS0FBS21FLE1BQUwsQ0FBWXdpQixVQUFwQixHQUErQixZQUEvQixHQUE0QyxhQUFsRCxDQUFnRSxLQUFLbGUsTUFBTCxHQUFZLEtBQUtzSCxDQUFMLEdBQU8sS0FBSzlGLElBQUwsQ0FBVWpLLENBQVYsQ0FBUCxHQUFvQixLQUFLaUssSUFBTCxDQUFVbkYsS0FBVixHQUFnQixLQUFLWCxNQUFMLENBQVk2aUIsU0FBNUQ7QUFBc0UsR0FBL2UsRUFBZ2YzRSxFQUFFeUUsY0FBRixHQUFpQixVQUFTOW1CLENBQVQsRUFBVztBQUFDLFFBQUliLElBQUUsS0FBS2dGLE1BQUwsQ0FBWXdpQixVQUFsQixDQUE2QixLQUFLemlCLE9BQUwsQ0FBYWpFLEtBQWIsQ0FBbUJkLENBQW5CLElBQXNCLEtBQUtnRixNQUFMLENBQVk4aUIsZ0JBQVosQ0FBNkJqbkIsQ0FBN0IsQ0FBdEI7QUFBc0QsR0FBaG1CLEVBQWltQnFpQixFQUFFNkUsU0FBRixHQUFZLFVBQVNsbkIsQ0FBVCxFQUFXO0FBQUMsU0FBSzBtQixLQUFMLEdBQVcxbUIsQ0FBWCxFQUFhLEtBQUs4bUIsY0FBTCxDQUFvQixLQUFLL1csQ0FBTCxHQUFPLEtBQUs1TCxNQUFMLENBQVlnakIsY0FBWixHQUEyQm5uQixDQUF0RCxDQUFiO0FBQXNFLEdBQS9yQixFQUFnc0JxaUIsRUFBRXpCLE1BQUYsR0FBUyxZQUFVO0FBQUMsU0FBSzFjLE9BQUwsQ0FBYW1CLFVBQWIsQ0FBd0J1ZSxXQUF4QixDQUFvQyxLQUFLMWYsT0FBekM7QUFBa0QsR0FBdHdCLEVBQXV3QnhGLENBQTl3QjtBQUFneEIsQ0FBOW5DLENBQTcyTSxFQUE2K08sVUFBU3NCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsZ0JBQVksT0FBT3NkLE1BQW5CLElBQTJCQSxPQUFPQyxHQUFsQyxHQUFzQ0QsT0FBTyxtQkFBUCxFQUEyQnRkLENBQTNCLENBQXRDLEdBQW9FLG9CQUFpQnFkLE1BQWpCLHlDQUFpQkEsTUFBakIsTUFBeUJBLE9BQU9ELE9BQWhDLEdBQXdDQyxPQUFPRCxPQUFQLEdBQWVwZCxHQUF2RCxJQUE0RGEsRUFBRXVtQixRQUFGLEdBQVd2bUIsRUFBRXVtQixRQUFGLElBQVksRUFBdkIsRUFBMEJ2bUIsRUFBRXVtQixRQUFGLENBQVdhLEtBQVgsR0FBaUJqb0IsR0FBdkcsQ0FBcEU7QUFBZ0wsQ0FBOUwsQ0FBK0x3QyxNQUEvTCxFQUFzTSxZQUFVO0FBQUM7QUFBYSxXQUFTM0IsQ0FBVCxDQUFXQSxDQUFYLEVBQWE7QUFBQyxTQUFLbUUsTUFBTCxHQUFZbkUsQ0FBWixFQUFjLEtBQUtxbkIsWUFBTCxHQUFrQixVQUFRcm5CLEVBQUUybUIsVUFBMUMsRUFBcUQsS0FBS1csS0FBTCxHQUFXLEVBQWhFLEVBQW1FLEtBQUtsRSxVQUFMLEdBQWdCLENBQW5GLEVBQXFGLEtBQUt2ZSxNQUFMLEdBQVksQ0FBakc7QUFBbUcsT0FBSTFGLElBQUVhLEVBQUVxQixTQUFSLENBQWtCLE9BQU9sQyxFQUFFb29CLE9BQUYsR0FBVSxVQUFTdm5CLENBQVQsRUFBVztBQUFDLFFBQUcsS0FBS3NuQixLQUFMLENBQVc5cUIsSUFBWCxDQUFnQndELENBQWhCLEdBQW1CLEtBQUtvakIsVUFBTCxJQUFpQnBqQixFQUFFaUssSUFBRixDQUFPbVosVUFBM0MsRUFBc0QsS0FBS3ZlLE1BQUwsR0FBWTNHLEtBQUt3RSxHQUFMLENBQVMxQyxFQUFFaUssSUFBRixDQUFPb1osV0FBaEIsRUFBNEIsS0FBS3hlLE1BQWpDLENBQWxFLEVBQTJHLEtBQUcsS0FBS3lpQixLQUFMLENBQVd0cEIsTUFBNUgsRUFBbUk7QUFBQyxXQUFLK1IsQ0FBTCxHQUFPL1AsRUFBRStQLENBQVQsQ0FBVyxJQUFJNVEsSUFBRSxLQUFLa29CLFlBQUwsR0FBa0IsWUFBbEIsR0FBK0IsYUFBckMsQ0FBbUQsS0FBS0csV0FBTCxHQUFpQnhuQixFQUFFaUssSUFBRixDQUFPOUssQ0FBUCxDQUFqQjtBQUEyQjtBQUFDLEdBQXBQLEVBQXFQQSxFQUFFMG5CLFlBQUYsR0FBZSxZQUFVO0FBQUMsUUFBSTdtQixJQUFFLEtBQUtxbkIsWUFBTCxHQUFrQixhQUFsQixHQUFnQyxZQUF0QztBQUFBLFFBQW1EbG9CLElBQUUsS0FBS3NvQixXQUFMLEVBQXJEO0FBQUEsUUFBd0Uvb0IsSUFBRVMsSUFBRUEsRUFBRThLLElBQUYsQ0FBT2pLLENBQVAsQ0FBRixHQUFZLENBQXRGO0FBQUEsUUFBd0ZxaUIsSUFBRSxLQUFLZSxVQUFMLElBQWlCLEtBQUtvRSxXQUFMLEdBQWlCOW9CLENBQWxDLENBQTFGLENBQStILEtBQUsrSixNQUFMLEdBQVksS0FBS3NILENBQUwsR0FBTyxLQUFLeVgsV0FBWixHQUF3Qm5GLElBQUUsS0FBS2xlLE1BQUwsQ0FBWTZpQixTQUFsRDtBQUE0RCxHQUExYyxFQUEyYzduQixFQUFFc29CLFdBQUYsR0FBYyxZQUFVO0FBQUMsV0FBTyxLQUFLSCxLQUFMLENBQVcsS0FBS0EsS0FBTCxDQUFXdHBCLE1BQVgsR0FBa0IsQ0FBN0IsQ0FBUDtBQUF1QyxHQUEzZ0IsRUFBNGdCbUIsRUFBRXVvQixNQUFGLEdBQVMsWUFBVTtBQUFDLFNBQUtDLG1CQUFMLENBQXlCLEtBQXpCO0FBQWdDLEdBQWhrQixFQUFpa0J4b0IsRUFBRXlvQixRQUFGLEdBQVcsWUFBVTtBQUFDLFNBQUtELG1CQUFMLENBQXlCLFFBQXpCO0FBQW1DLEdBQTFuQixFQUEybkJ4b0IsRUFBRXdvQixtQkFBRixHQUFzQixVQUFTM25CLENBQVQsRUFBVztBQUFDLFNBQUtzbkIsS0FBTCxDQUFXOXBCLE9BQVgsQ0FBbUIsVUFBUzJCLENBQVQsRUFBVztBQUFDQSxRQUFFK0UsT0FBRixDQUFVeWMsU0FBVixDQUFvQjNnQixDQUFwQixFQUF1QixhQUF2QjtBQUFzQyxLQUFyRTtBQUF1RSxHQUFwdUIsRUFBcXVCYixFQUFFMG9CLGVBQUYsR0FBa0IsWUFBVTtBQUFDLFdBQU8sS0FBS1AsS0FBTCxDQUFXam9CLEdBQVgsQ0FBZSxVQUFTVyxDQUFULEVBQVc7QUFBQyxhQUFPQSxFQUFFa0UsT0FBVDtBQUFpQixLQUE1QyxDQUFQO0FBQXFELEdBQXZ6QixFQUF3ekJsRSxDQUEvekI7QUFBaTBCLENBQWxxQyxDQUE3K08sRUFBaXBSLFVBQVNBLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsZ0JBQVksT0FBT3NkLE1BQW5CLElBQTJCQSxPQUFPQyxHQUFsQyxHQUFzQ0QsT0FBTyxxQkFBUCxFQUE2QixDQUFDLHNCQUFELENBQTdCLEVBQXNELFVBQVMvZCxDQUFULEVBQVc7QUFBQyxXQUFPUyxFQUFFYSxDQUFGLEVBQUl0QixDQUFKLENBQVA7QUFBYyxHQUFoRixDQUF0QyxHQUF3SCxvQkFBaUI4ZCxNQUFqQix5Q0FBaUJBLE1BQWpCLE1BQXlCQSxPQUFPRCxPQUFoQyxHQUF3Q0MsT0FBT0QsT0FBUCxHQUFlcGQsRUFBRWEsQ0FBRixFQUFJZ2lCLFFBQVEsZ0JBQVIsQ0FBSixDQUF2RCxJQUF1RmhpQixFQUFFdW1CLFFBQUYsR0FBV3ZtQixFQUFFdW1CLFFBQUYsSUFBWSxFQUF2QixFQUEwQnZtQixFQUFFdW1CLFFBQUYsQ0FBV3VCLGdCQUFYLEdBQTRCM29CLEVBQUVhLENBQUYsRUFBSUEsRUFBRXdsQixZQUFOLENBQTdJLENBQXhIO0FBQTBSLENBQXhTLENBQXlTN2pCLE1BQXpTLEVBQWdULFVBQVMzQixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLE1BQUlULElBQUVzQixFQUFFaUMscUJBQUYsSUFBeUJqQyxFQUFFK25CLDJCQUFqQztBQUFBLE1BQTZEMUYsSUFBRSxDQUEvRCxDQUFpRTNqQixNQUFJQSxJQUFFLFdBQVNzQixDQUFULEVBQVc7QUFBQyxRQUFJYixJQUFHLElBQUkwQyxJQUFKLEVBQUQsQ0FBV0UsT0FBWCxFQUFOO0FBQUEsUUFBMkJyRCxJQUFFUixLQUFLd0UsR0FBTCxDQUFTLENBQVQsRUFBVyxNQUFJdkQsSUFBRWtqQixDQUFOLENBQVgsQ0FBN0I7QUFBQSxRQUFrREMsSUFBRXBpQixXQUFXRixDQUFYLEVBQWF0QixDQUFiLENBQXBELENBQW9FLE9BQU8yakIsSUFBRWxqQixJQUFFVCxDQUFKLEVBQU00akIsQ0FBYjtBQUFlLEdBQXJHLEVBQXVHLElBQUlBLElBQUUsRUFBTixDQUFTQSxFQUFFMEYsY0FBRixHQUFpQixZQUFVO0FBQUMsU0FBS0MsV0FBTCxLQUFtQixLQUFLQSxXQUFMLEdBQWlCLENBQUMsQ0FBbEIsRUFBb0IsS0FBS0MsYUFBTCxHQUFtQixDQUF2QyxFQUF5QyxLQUFLN2IsT0FBTCxFQUE1RDtBQUE0RSxHQUF4RyxFQUF5R2lXLEVBQUVqVyxPQUFGLEdBQVUsWUFBVTtBQUFDLFNBQUs4YixjQUFMLElBQXNCLEtBQUtDLHVCQUFMLEVBQXRCLENBQXFELElBQUlwb0IsSUFBRSxLQUFLK1AsQ0FBWCxDQUFhLElBQUcsS0FBS3NZLGdCQUFMLElBQXdCLEtBQUtDLGNBQUwsRUFBeEIsRUFBOEMsS0FBS0MsTUFBTCxDQUFZdm9CLENBQVosQ0FBOUMsRUFBNkQsS0FBS2lvQixXQUFyRSxFQUFpRjtBQUFDLFVBQUk5b0IsSUFBRSxJQUFOLENBQVdULEVBQUUsWUFBVTtBQUFDUyxVQUFFa04sT0FBRjtBQUFZLE9BQXpCO0FBQTJCO0FBQUMsR0FBelQsQ0FBMFQsSUFBSTZWLElBQUUsWUFBVTtBQUFDLFFBQUlsaUIsSUFBRUgsU0FBU3VQLGVBQVQsQ0FBeUJuUCxLQUEvQixDQUFxQyxPQUFNLFlBQVUsT0FBT0QsRUFBRXdvQixTQUFuQixHQUE2QixXQUE3QixHQUF5QyxpQkFBL0M7QUFBaUUsR0FBakgsRUFBTixDQUEwSCxPQUFPbEcsRUFBRWdHLGNBQUYsR0FBaUIsWUFBVTtBQUFDLFFBQUl0b0IsSUFBRSxLQUFLK1AsQ0FBWCxDQUFhLEtBQUszQixPQUFMLENBQWFxYSxVQUFiLElBQXlCLEtBQUtuQixLQUFMLENBQVd0cEIsTUFBWCxHQUFrQixDQUEzQyxLQUErQ2dDLElBQUViLEVBQUVzbUIsTUFBRixDQUFTemxCLENBQVQsRUFBVyxLQUFLbW5CLGNBQWhCLENBQUYsRUFBa0NubkIsS0FBRyxLQUFLbW5CLGNBQTFDLEVBQXlELEtBQUt1QixjQUFMLENBQW9CMW9CLENBQXBCLENBQXhHLEdBQWdJQSxLQUFHLEtBQUsyb0IsY0FBeEksRUFBdUozb0IsSUFBRSxLQUFLb08sT0FBTCxDQUFhd2EsV0FBYixJQUEwQjFHLENBQTFCLEdBQTRCLENBQUNsaUIsQ0FBN0IsR0FBK0JBLENBQXhMLENBQTBMLElBQUl0QixJQUFFLEtBQUt1b0IsZ0JBQUwsQ0FBc0JqbkIsQ0FBdEIsQ0FBTixDQUErQixLQUFLNm9CLE1BQUwsQ0FBWTVvQixLQUFaLENBQWtCaWlCLENBQWxCLElBQXFCLEtBQUsrRixXQUFMLEdBQWlCLGlCQUFldnBCLENBQWYsR0FBaUIsT0FBbEMsR0FBMEMsZ0JBQWNBLENBQWQsR0FBZ0IsR0FBL0UsQ0FBbUYsSUFBSTJqQixJQUFFLEtBQUt5RyxNQUFMLENBQVksQ0FBWixDQUFOLENBQXFCLElBQUd6RyxDQUFILEVBQUs7QUFBQyxVQUFJQyxJQUFFLENBQUMsS0FBS3ZTLENBQU4sR0FBUXNTLEVBQUU1WixNQUFoQjtBQUFBLFVBQXVCK1osSUFBRUYsSUFBRSxLQUFLeUcsV0FBaEMsQ0FBNEMsS0FBSy9XLGFBQUwsQ0FBbUIsUUFBbkIsRUFBNEIsSUFBNUIsRUFBaUMsQ0FBQ3dRLENBQUQsRUFBR0YsQ0FBSCxDQUFqQztBQUF3QztBQUFDLEdBQXJjLEVBQXNjQSxFQUFFMEcsd0JBQUYsR0FBMkIsWUFBVTtBQUFDLFNBQUsxQixLQUFMLENBQVd0cEIsTUFBWCxLQUFvQixLQUFLK1IsQ0FBTCxHQUFPLENBQUMsS0FBS2taLGFBQUwsQ0FBbUJ4Z0IsTUFBM0IsRUFBa0MsS0FBSzZmLGNBQUwsRUFBdEQ7QUFBNkUsR0FBempCLEVBQTBqQmhHLEVBQUUyRSxnQkFBRixHQUFtQixVQUFTam5CLENBQVQsRUFBVztBQUFDLFdBQU8sS0FBS29PLE9BQUwsQ0FBYThhLGVBQWIsR0FBNkIsTUFBSWhyQixLQUFLQyxLQUFMLENBQVc2QixJQUFFLEtBQUtpSyxJQUFMLENBQVVxVSxVQUFaLEdBQXVCLEdBQWxDLENBQUosR0FBMkMsR0FBeEUsR0FBNEVwZ0IsS0FBS0MsS0FBTCxDQUFXNkIsQ0FBWCxJQUFjLElBQWpHO0FBQXNHLEdBQS9yQixFQUFnc0JzaUIsRUFBRWlHLE1BQUYsR0FBUyxVQUFTdm9CLENBQVQsRUFBVztBQUFDLFNBQUttcEIsYUFBTCxJQUFvQmpyQixLQUFLQyxLQUFMLENBQVcsTUFBSSxLQUFLNFIsQ0FBcEIsS0FBd0I3UixLQUFLQyxLQUFMLENBQVcsTUFBSTZCLENBQWYsQ0FBNUMsSUFBK0QsS0FBS2tvQixhQUFMLEVBQS9ELEVBQW9GLEtBQUtBLGFBQUwsR0FBbUIsQ0FBbkIsS0FBdUIsS0FBS0QsV0FBTCxHQUFpQixDQUFDLENBQWxCLEVBQW9CLE9BQU8sS0FBS21CLGVBQWhDLEVBQWdELEtBQUtkLGNBQUwsRUFBaEQsRUFBc0UsS0FBS3RXLGFBQUwsQ0FBbUIsUUFBbkIsQ0FBN0YsQ0FBcEY7QUFBK00sR0FBcDZCLEVBQXE2QnNRLEVBQUVvRyxjQUFGLEdBQWlCLFVBQVMxb0IsQ0FBVCxFQUFXO0FBQUMsUUFBSWIsSUFBRSxLQUFLd3BCLGNBQUwsR0FBb0Izb0IsQ0FBMUIsQ0FBNEIsS0FBS3FwQixXQUFMLENBQWlCLEtBQUtDLGdCQUF0QixFQUF1Q25xQixDQUF2QyxFQUF5QyxDQUFDLENBQTFDLEVBQTZDLElBQUlULElBQUUsS0FBS3VMLElBQUwsQ0FBVXFVLFVBQVYsSUFBc0J0ZSxJQUFFLEtBQUttbkIsY0FBUCxHQUFzQixLQUFLd0IsY0FBakQsQ0FBTixDQUF1RSxLQUFLVSxXQUFMLENBQWlCLEtBQUtFLGVBQXRCLEVBQXNDN3FCLENBQXRDLEVBQXdDLENBQXhDO0FBQTJDLEdBQTduQyxFQUE4bkM0akIsRUFBRStHLFdBQUYsR0FBYyxVQUFTcnBCLENBQVQsRUFBV2IsQ0FBWCxFQUFhVCxDQUFiLEVBQWU7QUFBQyxTQUFJLElBQUkyakIsSUFBRSxDQUFWLEVBQVlBLElBQUVyaUIsRUFBRWhDLE1BQWhCLEVBQXVCcWtCLEdBQXZCLEVBQTJCO0FBQUMsVUFBSUMsSUFBRXRpQixFQUFFcWlCLENBQUYsQ0FBTjtBQUFBLFVBQVdILElBQUUvaUIsSUFBRSxDQUFGLEdBQUlULENBQUosR0FBTSxDQUFuQixDQUFxQjRqQixFQUFFNEUsU0FBRixDQUFZaEYsQ0FBWixHQUFlL2lCLEtBQUdtakIsRUFBRXJZLElBQUYsQ0FBT21aLFVBQXpCO0FBQW9DO0FBQUMsR0FBbHZDLEVBQW12Q2QsRUFBRWtILGFBQUYsR0FBZ0IsVUFBU3hwQixDQUFULEVBQVc7QUFBQyxRQUFHQSxLQUFHQSxFQUFFaEMsTUFBUixFQUFlLEtBQUksSUFBSW1CLElBQUUsQ0FBVixFQUFZQSxJQUFFYSxFQUFFaEMsTUFBaEIsRUFBdUJtQixHQUF2QjtBQUEyQmEsUUFBRWIsQ0FBRixFQUFLK25CLFNBQUwsQ0FBZSxDQUFmO0FBQTNCO0FBQTZDLEdBQTMwQyxFQUE0MEM1RSxFQUFFK0YsZ0JBQUYsR0FBbUIsWUFBVTtBQUFDLFNBQUt0WSxDQUFMLElBQVEsS0FBSzBaLFFBQWIsRUFBc0IsS0FBS0EsUUFBTCxJQUFlLEtBQUtDLGlCQUFMLEVBQXJDO0FBQThELEdBQXg2QyxFQUF5NkNwSCxFQUFFcUgsVUFBRixHQUFhLFVBQVMzcEIsQ0FBVCxFQUFXO0FBQUMsU0FBS3lwQixRQUFMLElBQWV6cEIsQ0FBZjtBQUFpQixHQUFuOUMsRUFBbzlDc2lCLEVBQUVvSCxpQkFBRixHQUFvQixZQUFVO0FBQUMsV0FBTyxJQUFFLEtBQUt0YixPQUFMLENBQWEsS0FBS2diLGVBQUwsR0FBcUIsb0JBQXJCLEdBQTBDLFVBQXZELENBQVQ7QUFBNEUsR0FBL2pELEVBQWdrRDlHLEVBQUVzSCxrQkFBRixHQUFxQixZQUFVO0FBQUMsV0FBTyxLQUFLN1osQ0FBTCxHQUFPLEtBQUswWixRQUFMLElBQWUsSUFBRSxLQUFLQyxpQkFBTCxFQUFqQixDQUFkO0FBQXlELEdBQXpwRCxFQUEwcERwSCxFQUFFNkYsY0FBRixHQUFpQixZQUFVO0FBQUMsUUFBRyxLQUFLZ0IsYUFBUixFQUFzQjtBQUFDLFVBQUlucEIsSUFBRSxLQUFLNnBCLEtBQUwsR0FBVyxLQUFLOVosQ0FBdEI7QUFBQSxVQUF3QjVRLElBQUVhLElBQUUsS0FBS3lwQixRQUFqQyxDQUEwQyxLQUFLRSxVQUFMLENBQWdCeHFCLENBQWhCO0FBQW1CO0FBQUMsR0FBM3dELEVBQTR3RG1qQixFQUFFOEYsdUJBQUYsR0FBMEIsWUFBVTtBQUFDLFFBQUcsQ0FBQyxLQUFLZSxhQUFOLElBQXFCLENBQUMsS0FBS0MsZUFBM0IsSUFBNEMsS0FBSzlCLEtBQUwsQ0FBV3RwQixNQUExRCxFQUFpRTtBQUFDLFVBQUlnQyxJQUFFLEtBQUtpcEIsYUFBTCxDQUFtQnhnQixNQUFuQixHQUEwQixDQUFDLENBQTNCLEdBQTZCLEtBQUtzSCxDQUF4QztBQUFBLFVBQTBDNVEsSUFBRWEsSUFBRSxLQUFLb08sT0FBTCxDQUFhMGIsa0JBQTNELENBQThFLEtBQUtILFVBQUwsQ0FBZ0J4cUIsQ0FBaEI7QUFBbUI7QUFBQyxHQUFyOUQsRUFBczlEbWpCLENBQTc5RDtBQUErOUQsQ0FBbDRGLENBQWpwUixFQUFxaFgsVUFBU3RpQixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLE1BQUcsY0FBWSxPQUFPc2QsTUFBbkIsSUFBMkJBLE9BQU9DLEdBQXJDLEVBQXlDRCxPQUFPLHNCQUFQLEVBQThCLENBQUMsdUJBQUQsRUFBeUIsbUJBQXpCLEVBQTZDLHNCQUE3QyxFQUFvRSxRQUFwRSxFQUE2RSxTQUE3RSxFQUF1RixXQUF2RixDQUE5QixFQUFrSSxVQUFTL2QsQ0FBVCxFQUFXMmpCLENBQVgsRUFBYUMsQ0FBYixFQUFlSixDQUFmLEVBQWlCTSxDQUFqQixFQUFtQkwsQ0FBbkIsRUFBcUI7QUFBQyxXQUFPaGpCLEVBQUVhLENBQUYsRUFBSXRCLENBQUosRUFBTTJqQixDQUFOLEVBQVFDLENBQVIsRUFBVUosQ0FBVixFQUFZTSxDQUFaLEVBQWNMLENBQWQsQ0FBUDtBQUF3QixHQUFoTCxFQUF6QyxLQUFnTyxJQUFHLG9CQUFpQjNGLE1BQWpCLHlDQUFpQkEsTUFBakIsTUFBeUJBLE9BQU9ELE9BQW5DLEVBQTJDQyxPQUFPRCxPQUFQLEdBQWVwZCxFQUFFYSxDQUFGLEVBQUlnaUIsUUFBUSxZQUFSLENBQUosRUFBMEJBLFFBQVEsVUFBUixDQUExQixFQUE4Q0EsUUFBUSxnQkFBUixDQUE5QyxFQUF3RUEsUUFBUSxRQUFSLENBQXhFLEVBQTBGQSxRQUFRLFNBQVIsQ0FBMUYsRUFBNkdBLFFBQVEsV0FBUixDQUE3RyxDQUFmLENBQTNDLEtBQWlNO0FBQUMsUUFBSXRqQixJQUFFc0IsRUFBRXVtQixRQUFSLENBQWlCdm1CLEVBQUV1bUIsUUFBRixHQUFXcG5CLEVBQUVhLENBQUYsRUFBSUEsRUFBRStpQixTQUFOLEVBQWdCL2lCLEVBQUVtakIsT0FBbEIsRUFBMEJuakIsRUFBRXdsQixZQUE1QixFQUF5QzltQixFQUFFOG5CLElBQTNDLEVBQWdEOW5CLEVBQUUwb0IsS0FBbEQsRUFBd0Qxb0IsRUFBRW9wQixnQkFBMUQsQ0FBWDtBQUF1RjtBQUFDLENBQXpoQixDQUEwaEJubUIsTUFBMWhCLEVBQWlpQixVQUFTM0IsQ0FBVCxFQUFXYixDQUFYLEVBQWFULENBQWIsRUFBZTJqQixDQUFmLEVBQWlCQyxDQUFqQixFQUFtQkosQ0FBbkIsRUFBcUJNLENBQXJCLEVBQXVCO0FBQUMsV0FBU0wsQ0FBVCxDQUFXbmlCLENBQVgsRUFBYWIsQ0FBYixFQUFlO0FBQUMsU0FBSWEsSUFBRXFpQixFQUFFcUQsU0FBRixDQUFZMWxCLENBQVosQ0FBTixFQUFxQkEsRUFBRWhDLE1BQXZCO0FBQStCbUIsUUFBRXVrQixXQUFGLENBQWMxakIsRUFBRTBtQixLQUFGLEVBQWQ7QUFBL0I7QUFBd0QsWUFBU3RFLENBQVQsQ0FBV3BpQixDQUFYLEVBQWFiLENBQWIsRUFBZTtBQUFDLFFBQUlULElBQUUyakIsRUFBRXdELGVBQUYsQ0FBa0I3bEIsQ0FBbEIsQ0FBTixDQUEyQixJQUFHLENBQUN0QixDQUFKLEVBQU0sT0FBTyxNQUFLaWtCLEtBQUdBLEVBQUU1a0IsS0FBRixDQUFRLGdDQUE4QlcsS0FBR3NCLENBQWpDLENBQVIsQ0FBUixDQUFQLENBQTZELElBQUcsS0FBS2tFLE9BQUwsR0FBYXhGLENBQWIsRUFBZSxLQUFLd0YsT0FBTCxDQUFhNmxCLFlBQS9CLEVBQTRDO0FBQUMsVUFBSXpILElBQUU0QixFQUFFLEtBQUtoZ0IsT0FBTCxDQUFhNmxCLFlBQWYsQ0FBTixDQUFtQyxPQUFPekgsRUFBRU0sTUFBRixDQUFTempCLENBQVQsR0FBWW1qQixDQUFuQjtBQUFxQixXQUFJLEtBQUtqbUIsUUFBTCxHQUFja21CLEVBQUUsS0FBS3JlLE9BQVAsQ0FBbEIsR0FBbUMsS0FBS2tLLE9BQUwsR0FBYWlVLEVBQUUzYSxNQUFGLENBQVMsRUFBVCxFQUFZLEtBQUt6TCxXQUFMLENBQWlCa1ksUUFBN0IsQ0FBaEQsRUFBdUYsS0FBS3lPLE1BQUwsQ0FBWXpqQixDQUFaLENBQXZGLEVBQXNHLEtBQUs2cUIsT0FBTCxFQUF0RztBQUFxSCxPQUFJekgsSUFBRXZpQixFQUFFNkQsTUFBUjtBQUFBLE1BQWU0ZSxJQUFFemlCLEVBQUVnTCxnQkFBbkI7QUFBQSxNQUFvQzJYLElBQUUzaUIsRUFBRWxDLE9BQXhDO0FBQUEsTUFBZ0RtbUIsSUFBRSxDQUFsRDtBQUFBLE1BQW9EQyxJQUFFLEVBQXRELENBQXlEOUIsRUFBRWpPLFFBQUYsR0FBVyxFQUFDOFYsZUFBYyxDQUFDLENBQWhCLEVBQWtCakQsV0FBVSxRQUE1QixFQUFxQ2tELG9CQUFtQixJQUF4RCxFQUE2REMsVUFBUyxHQUF0RSxFQUEwRUMsdUJBQXNCLENBQUMsQ0FBakcsRUFBbUdsQixpQkFBZ0IsQ0FBQyxDQUFwSCxFQUFzSG1CLFFBQU8sQ0FBQyxDQUE5SCxFQUFnSVAsb0JBQW1CLElBQW5KLEVBQXdKUSxnQkFBZSxDQUFDLENBQXhLLEVBQVgsRUFBc0xsSSxFQUFFbUksYUFBRixHQUFnQixFQUF0TSxDQUF5TSxJQUFJOXNCLElBQUUya0IsRUFBRS9nQixTQUFSLENBQWtCZ2hCLEVBQUUzYSxNQUFGLENBQVNqSyxDQUFULEVBQVcwQixFQUFFa0MsU0FBYixHQUF3QjVELEVBQUV1c0IsT0FBRixHQUFVLFlBQVU7QUFBQyxRQUFJN3FCLElBQUUsS0FBS3FyQixJQUFMLEdBQVUsRUFBRXZHLENBQWxCLENBQW9CLEtBQUsvZixPQUFMLENBQWE2bEIsWUFBYixHQUEwQjVxQixDQUExQixFQUE0QitrQixFQUFFL2tCLENBQUYsSUFBSyxJQUFqQyxFQUFzQyxLQUFLc3JCLGFBQUwsR0FBbUIsQ0FBekQsRUFBMkQsS0FBS3ZDLGFBQUwsR0FBbUIsQ0FBOUUsRUFBZ0YsS0FBS25ZLENBQUwsR0FBTyxDQUF2RixFQUF5RixLQUFLMFosUUFBTCxHQUFjLENBQXZHLEVBQXlHLEtBQUs5QyxVQUFMLEdBQWdCLEtBQUt2WSxPQUFMLENBQWF3YSxXQUFiLEdBQXlCLE9BQXpCLEdBQWlDLE1BQTFKLEVBQWlLLEtBQUs4QixRQUFMLEdBQWM3cUIsU0FBU0MsYUFBVCxDQUF1QixLQUF2QixDQUEvSyxFQUE2TSxLQUFLNHFCLFFBQUwsQ0FBYy91QixTQUFkLEdBQXdCLG1CQUFyTyxFQUF5UCxLQUFLZ3ZCLGFBQUwsRUFBelAsRUFBOFEsQ0FBQyxLQUFLdmMsT0FBTCxDQUFhaWMsTUFBYixJQUFxQixLQUFLamMsT0FBTCxDQUFhd2MsUUFBbkMsS0FBOEM1cUIsRUFBRXlRLGdCQUFGLENBQW1CLFFBQW5CLEVBQTRCLElBQTVCLENBQTVULEVBQThWMlIsRUFBRW1JLGFBQUYsQ0FBZ0Ivc0IsT0FBaEIsQ0FBd0IsVUFBU3dDLENBQVQsRUFBVztBQUFDLFdBQUtBLENBQUw7QUFBVSxLQUE5QyxFQUErQyxJQUEvQyxDQUE5VixFQUFtWixLQUFLb08sT0FBTCxDQUFhd2MsUUFBYixHQUFzQixLQUFLQSxRQUFMLEVBQXRCLEdBQXNDLEtBQUtDLFFBQUwsRUFBemI7QUFBeWMsR0FBMWdCLEVBQTJnQnB0QixFQUFFbWxCLE1BQUYsR0FBUyxVQUFTNWlCLENBQVQsRUFBVztBQUFDcWlCLE1BQUUzYSxNQUFGLENBQVMsS0FBSzBHLE9BQWQsRUFBc0JwTyxDQUF0QjtBQUF5QixHQUF6akIsRUFBMGpCdkMsRUFBRW90QixRQUFGLEdBQVcsWUFBVTtBQUFDLFFBQUcsQ0FBQyxLQUFLOVEsUUFBVCxFQUFrQjtBQUFDLFdBQUtBLFFBQUwsR0FBYyxDQUFDLENBQWYsRUFBaUIsS0FBSzdWLE9BQUwsQ0FBYXljLFNBQWIsQ0FBdUJFLEdBQXZCLENBQTJCLGtCQUEzQixDQUFqQixFQUFnRSxLQUFLelMsT0FBTCxDQUFhd2EsV0FBYixJQUEwQixLQUFLMWtCLE9BQUwsQ0FBYXljLFNBQWIsQ0FBdUJFLEdBQXZCLENBQTJCLGNBQTNCLENBQTFGLEVBQXFJLEtBQUtzQyxPQUFMLEVBQXJJLENBQW9KLElBQUluakIsSUFBRSxLQUFLOHFCLHVCQUFMLENBQTZCLEtBQUs1bUIsT0FBTCxDQUFhK0osUUFBMUMsQ0FBTixDQUEwRGtVLEVBQUVuaUIsQ0FBRixFQUFJLEtBQUs2b0IsTUFBVCxHQUFpQixLQUFLNkIsUUFBTCxDQUFjaEgsV0FBZCxDQUEwQixLQUFLbUYsTUFBL0IsQ0FBakIsRUFBd0QsS0FBSzNrQixPQUFMLENBQWF3ZixXQUFiLENBQXlCLEtBQUtnSCxRQUE5QixDQUF4RCxFQUFnRyxLQUFLSyxXQUFMLEVBQWhHLEVBQW1ILEtBQUszYyxPQUFMLENBQWE2YixhQUFiLEtBQTZCLEtBQUsvbEIsT0FBTCxDQUFhOG1CLFFBQWIsR0FBc0IsQ0FBdEIsRUFBd0IsS0FBSzltQixPQUFMLENBQWF1TSxnQkFBYixDQUE4QixTQUE5QixFQUF3QyxJQUF4QyxDQUFyRCxDQUFuSCxFQUF1TixLQUFLeVMsU0FBTCxDQUFlLFVBQWYsQ0FBdk4sQ0FBa1AsSUFBSS9qQixDQUFKO0FBQUEsVUFBTVQsSUFBRSxLQUFLMFAsT0FBTCxDQUFhNmMsWUFBckIsQ0FBa0M5ckIsSUFBRSxLQUFLK3JCLGVBQUwsR0FBcUIsS0FBS1QsYUFBMUIsR0FBd0MsS0FBSyxDQUFMLEtBQVMvckIsQ0FBVCxJQUFZLEtBQUs0b0IsS0FBTCxDQUFXNW9CLENBQVgsQ0FBWixHQUEwQkEsQ0FBMUIsR0FBNEIsQ0FBdEUsRUFBd0UsS0FBS2dwQixNQUFMLENBQVl2b0IsQ0FBWixFQUFjLENBQUMsQ0FBZixFQUFpQixDQUFDLENBQWxCLENBQXhFLEVBQTZGLEtBQUsrckIsZUFBTCxHQUFxQixDQUFDLENBQW5IO0FBQXFIO0FBQUMsR0FBM3JDLEVBQTRyQ3p0QixFQUFFa3RCLGFBQUYsR0FBZ0IsWUFBVTtBQUFDLFFBQUkzcUIsSUFBRUgsU0FBU0MsYUFBVCxDQUF1QixLQUF2QixDQUFOLENBQW9DRSxFQUFFckUsU0FBRixHQUFZLGlCQUFaLEVBQThCcUUsRUFBRUMsS0FBRixDQUFRLEtBQUswbUIsVUFBYixJQUF5QixDQUF2RCxFQUF5RCxLQUFLa0MsTUFBTCxHQUFZN29CLENBQXJFO0FBQXVFLEdBQWwwQyxFQUFtMEN2QyxFQUFFcXRCLHVCQUFGLEdBQTBCLFVBQVM5cUIsQ0FBVCxFQUFXO0FBQUMsV0FBT3FpQixFQUFFMEQsa0JBQUYsQ0FBcUIvbEIsQ0FBckIsRUFBdUIsS0FBS29PLE9BQUwsQ0FBYStjLFlBQXBDLENBQVA7QUFBeUQsR0FBbDZDLEVBQW02QzF0QixFQUFFc3RCLFdBQUYsR0FBYyxZQUFVO0FBQUMsU0FBS3pELEtBQUwsR0FBVyxLQUFLOEQsVUFBTCxDQUFnQixLQUFLdkMsTUFBTCxDQUFZNWEsUUFBNUIsQ0FBWCxFQUFpRCxLQUFLb2QsYUFBTCxFQUFqRCxFQUFzRSxLQUFLQyxrQkFBTCxFQUF0RSxFQUFnRyxLQUFLaEIsY0FBTCxFQUFoRztBQUFzSCxHQUFsakQsRUFBbWpEN3NCLEVBQUUydEIsVUFBRixHQUFhLFVBQVNwckIsQ0FBVCxFQUFXO0FBQUMsUUFBSWIsSUFBRSxLQUFLMnJCLHVCQUFMLENBQTZCOXFCLENBQTdCLENBQU47QUFBQSxRQUFzQ3RCLElBQUVTLEVBQUVFLEdBQUYsQ0FBTSxVQUFTVyxDQUFULEVBQVc7QUFBQyxhQUFPLElBQUlzaUIsQ0FBSixDQUFNdGlCLENBQU4sRUFBUSxJQUFSLENBQVA7QUFBcUIsS0FBdkMsRUFBd0MsSUFBeEMsQ0FBeEMsQ0FBc0YsT0FBT3RCLENBQVA7QUFBUyxHQUEzcUQsRUFBNHFEakIsRUFBRWdxQixXQUFGLEdBQWMsWUFBVTtBQUFDLFdBQU8sS0FBS0gsS0FBTCxDQUFXLEtBQUtBLEtBQUwsQ0FBV3RwQixNQUFYLEdBQWtCLENBQTdCLENBQVA7QUFBdUMsR0FBNXVELEVBQTZ1RFAsRUFBRTh0QixZQUFGLEdBQWUsWUFBVTtBQUFDLFdBQU8sS0FBS3pDLE1BQUwsQ0FBWSxLQUFLQSxNQUFMLENBQVk5cUIsTUFBWixHQUFtQixDQUEvQixDQUFQO0FBQXlDLEdBQWh6RCxFQUFpekRQLEVBQUU0dEIsYUFBRixHQUFnQixZQUFVO0FBQUMsU0FBS0csVUFBTCxDQUFnQixLQUFLbEUsS0FBckIsR0FBNEIsS0FBS21FLGNBQUwsQ0FBb0IsQ0FBcEIsQ0FBNUI7QUFBbUQsR0FBLzNELEVBQWc0RGh1QixFQUFFZ3VCLGNBQUYsR0FBaUIsVUFBU3pyQixDQUFULEVBQVc7QUFBQ0EsUUFBRUEsS0FBRyxDQUFMLEVBQU8sS0FBSzByQixhQUFMLEdBQW1CMXJCLElBQUUsS0FBSzByQixhQUFMLElBQW9CLENBQXRCLEdBQXdCLENBQWxELENBQW9ELElBQUl2c0IsSUFBRSxDQUFOLENBQVEsSUFBR2EsSUFBRSxDQUFMLEVBQU87QUFBQyxVQUFJdEIsSUFBRSxLQUFLNG9CLEtBQUwsQ0FBV3RuQixJQUFFLENBQWIsQ0FBTixDQUFzQmIsSUFBRVQsRUFBRXFSLENBQUYsR0FBSXJSLEVBQUV1TCxJQUFGLENBQU9tWixVQUFiO0FBQXdCLFVBQUksSUFBSWYsSUFBRSxLQUFLaUYsS0FBTCxDQUFXdHBCLE1BQWpCLEVBQXdCc2tCLElBQUV0aUIsQ0FBOUIsRUFBZ0NzaUIsSUFBRUQsQ0FBbEMsRUFBb0NDLEdBQXBDLEVBQXdDO0FBQUMsVUFBSUosSUFBRSxLQUFLb0YsS0FBTCxDQUFXaEYsQ0FBWCxDQUFOLENBQW9CSixFQUFFMEUsV0FBRixDQUFjem5CLENBQWQsR0FBaUJBLEtBQUcraUIsRUFBRWpZLElBQUYsQ0FBT21aLFVBQTNCLEVBQXNDLEtBQUtzSSxhQUFMLEdBQW1CeHRCLEtBQUt3RSxHQUFMLENBQVN3ZixFQUFFalksSUFBRixDQUFPb1osV0FBaEIsRUFBNEIsS0FBS3FJLGFBQWpDLENBQXpEO0FBQXlHLFVBQUt2RSxjQUFMLEdBQW9CaG9CLENBQXBCLEVBQXNCLEtBQUt3c0IsWUFBTCxFQUF0QixFQUEwQyxLQUFLQyxjQUFMLEVBQTFDLEVBQWdFLEtBQUs3QyxXQUFMLEdBQWlCMUcsSUFBRSxLQUFLa0osWUFBTCxHQUFvQjlpQixNQUFwQixHQUEyQixLQUFLcWdCLE1BQUwsQ0FBWSxDQUFaLEVBQWVyZ0IsTUFBNUMsR0FBbUQsQ0FBcEk7QUFBc0ksR0FBM3pFLEVBQTR6RWhMLEVBQUUrdEIsVUFBRixHQUFhLFVBQVN4ckIsQ0FBVCxFQUFXO0FBQUNBLE1BQUV4QyxPQUFGLENBQVUsVUFBU3dDLENBQVQsRUFBVztBQUFDQSxRQUFFbWpCLE9BQUY7QUFBWSxLQUFsQztBQUFvQyxHQUF6M0UsRUFBMDNFMWxCLEVBQUVrdUIsWUFBRixHQUFlLFlBQVU7QUFBQyxRQUFHLEtBQUs3QyxNQUFMLEdBQVksRUFBWixFQUFlLEtBQUt4QixLQUFMLENBQVd0cEIsTUFBN0IsRUFBb0M7QUFBQyxVQUFJZ0MsSUFBRSxJQUFJa2lCLENBQUosQ0FBTSxJQUFOLENBQU4sQ0FBa0IsS0FBSzRHLE1BQUwsQ0FBWXRzQixJQUFaLENBQWlCd0QsQ0FBakIsRUFBb0IsSUFBSWIsSUFBRSxVQUFRLEtBQUt3bkIsVUFBbkI7QUFBQSxVQUE4QmpvQixJQUFFUyxJQUFFLGFBQUYsR0FBZ0IsWUFBaEQ7QUFBQSxVQUE2RGtqQixJQUFFLEtBQUt3SixjQUFMLEVBQS9ELENBQXFGLEtBQUt2RSxLQUFMLENBQVc5cEIsT0FBWCxDQUFtQixVQUFTMkIsQ0FBVCxFQUFXbWpCLENBQVgsRUFBYTtBQUFDLFlBQUcsQ0FBQ3RpQixFQUFFc25CLEtBQUYsQ0FBUXRwQixNQUFaLEVBQW1CLE9BQU8sS0FBS2dDLEVBQUV1bkIsT0FBRixDQUFVcG9CLENBQVYsQ0FBWixDQUF5QixJQUFJcWpCLElBQUV4aUIsRUFBRW9qQixVQUFGLEdBQWFwakIsRUFBRXduQixXQUFmLElBQTRCcm9CLEVBQUU4SyxJQUFGLENBQU9tWixVQUFQLEdBQWtCamtCLEVBQUU4SyxJQUFGLENBQU92TCxDQUFQLENBQTlDLENBQU4sQ0FBK0QyakIsRUFBRS9nQixJQUFGLENBQU8sSUFBUCxFQUFZZ2hCLENBQVosRUFBY0UsQ0FBZCxJQUFpQnhpQixFQUFFdW5CLE9BQUYsQ0FBVXBvQixDQUFWLENBQWpCLElBQStCYSxFQUFFNm1CLFlBQUYsSUFBaUI3bUIsSUFBRSxJQUFJa2lCLENBQUosQ0FBTSxJQUFOLENBQW5CLEVBQStCLEtBQUs0RyxNQUFMLENBQVl0c0IsSUFBWixDQUFpQndELENBQWpCLENBQS9CLEVBQW1EQSxFQUFFdW5CLE9BQUYsQ0FBVXBvQixDQUFWLENBQWxGO0FBQWdHLE9BQTVPLEVBQTZPLElBQTdPLEdBQW1QYSxFQUFFNm1CLFlBQUYsRUFBblAsRUFBb1EsS0FBS2lGLG1CQUFMLEVBQXBRO0FBQStSO0FBQUMsR0FBcDFGLEVBQXExRnJ1QixFQUFFb3VCLGNBQUYsR0FBaUIsWUFBVTtBQUFDLFFBQUk3ckIsSUFBRSxLQUFLb08sT0FBTCxDQUFhMmQsVUFBbkIsQ0FBOEIsSUFBRyxDQUFDL3JCLENBQUosRUFBTSxPQUFPLFlBQVU7QUFBQyxhQUFNLENBQUMsQ0FBUDtBQUFTLEtBQTNCLENBQTRCLElBQUcsWUFBVSxPQUFPQSxDQUFwQixFQUFzQjtBQUFDLFVBQUliLElBQUU2WSxTQUFTaFksQ0FBVCxFQUFXLEVBQVgsQ0FBTixDQUFxQixPQUFPLFVBQVNBLENBQVQsRUFBVztBQUFDLGVBQU9BLElBQUViLENBQUYsS0FBTSxDQUFiO0FBQWUsT0FBbEM7QUFBbUMsU0FBSVQsSUFBRSxZQUFVLE9BQU9zQixDQUFqQixJQUFvQkEsRUFBRWtYLEtBQUYsQ0FBUSxVQUFSLENBQTFCO0FBQUEsUUFBOENtTCxJQUFFM2pCLElBQUVzWixTQUFTdFosRUFBRSxDQUFGLENBQVQsRUFBYyxFQUFkLElBQWtCLEdBQXBCLEdBQXdCLENBQXhFLENBQTBFLE9BQU8sVUFBU3NCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsYUFBT0EsS0FBRyxDQUFDLEtBQUs4SyxJQUFMLENBQVVxVSxVQUFWLEdBQXFCLENBQXRCLElBQXlCK0QsQ0FBbkM7QUFBcUMsS0FBMUQ7QUFBMkQsR0FBcm9HLEVBQXNvRzVrQixFQUFFTixLQUFGLEdBQVFNLEVBQUV1dUIsVUFBRixHQUFhLFlBQVU7QUFBQyxTQUFLWCxhQUFMLElBQXFCLEtBQUtyQyx3QkFBTCxFQUFyQjtBQUFxRCxHQUEzdEcsRUFBNHRHdnJCLEVBQUUwbEIsT0FBRixHQUFVLFlBQVU7QUFBQyxTQUFLbFosSUFBTCxHQUFVdkwsRUFBRSxLQUFLd0YsT0FBUCxDQUFWLEVBQTBCLEtBQUsrbkIsWUFBTCxFQUExQixFQUE4QyxLQUFLdEQsY0FBTCxHQUFvQixLQUFLMWUsSUFBTCxDQUFVcVUsVUFBVixHQUFxQixLQUFLMEksU0FBNUY7QUFBc0csR0FBdjFHLENBQXcxRyxJQUFJN0MsSUFBRSxFQUFDK0gsUUFBTyxFQUFDem5CLE1BQUssRUFBTixFQUFTQyxPQUFNLEVBQWYsRUFBUixFQUEyQkQsTUFBSyxFQUFDQSxNQUFLLENBQU4sRUFBUUMsT0FBTSxDQUFkLEVBQWhDLEVBQWlEQSxPQUFNLEVBQUNBLE9BQU0sQ0FBUCxFQUFTRCxNQUFLLENBQWQsRUFBdkQsRUFBTixDQUErRSxPQUFPaEgsRUFBRXd1QixZQUFGLEdBQWUsWUFBVTtBQUFDLFFBQUlqc0IsSUFBRW1rQixFQUFFLEtBQUsvVixPQUFMLENBQWE0WSxTQUFmLENBQU4sQ0FBZ0MsS0FBS0EsU0FBTCxHQUFlaG5CLElBQUVBLEVBQUUsS0FBSzJtQixVQUFQLENBQUYsR0FBcUIsS0FBS3ZZLE9BQUwsQ0FBYTRZLFNBQWpEO0FBQTJELEdBQXJILEVBQXNIdnBCLEVBQUU2c0IsY0FBRixHQUFpQixZQUFVO0FBQUMsUUFBRyxLQUFLbGMsT0FBTCxDQUFha2MsY0FBaEIsRUFBK0I7QUFBQyxVQUFJdHFCLElBQUUsS0FBS29PLE9BQUwsQ0FBYStkLGNBQWIsSUFBNkIsS0FBS2xELGFBQWxDLEdBQWdELEtBQUtBLGFBQUwsQ0FBbUJwa0IsTUFBbkUsR0FBMEUsS0FBSzZtQixhQUFyRixDQUFtRyxLQUFLaEIsUUFBTCxDQUFjenFCLEtBQWQsQ0FBb0I0RSxNQUFwQixHQUEyQjdFLElBQUUsSUFBN0I7QUFBa0M7QUFBQyxHQUF4VCxFQUF5VHZDLEVBQUU2dEIsa0JBQUYsR0FBcUIsWUFBVTtBQUFDLFFBQUcsS0FBS2xkLE9BQUwsQ0FBYXFhLFVBQWhCLEVBQTJCO0FBQUMsV0FBS2UsYUFBTCxDQUFtQixLQUFLRixnQkFBeEIsR0FBMEMsS0FBS0UsYUFBTCxDQUFtQixLQUFLRCxlQUF4QixDQUExQyxDQUFtRixJQUFJdnBCLElBQUUsS0FBSzJvQixjQUFYO0FBQUEsVUFBMEJ4cEIsSUFBRSxLQUFLbW9CLEtBQUwsQ0FBV3RwQixNQUFYLEdBQWtCLENBQTlDLENBQWdELEtBQUtzckIsZ0JBQUwsR0FBc0IsS0FBSzhDLFlBQUwsQ0FBa0Jwc0IsQ0FBbEIsRUFBb0JiLENBQXBCLEVBQXNCLENBQUMsQ0FBdkIsQ0FBdEIsRUFBZ0RhLElBQUUsS0FBS2lLLElBQUwsQ0FBVXFVLFVBQVYsR0FBcUIsS0FBS3FLLGNBQTVFLEVBQTJGLEtBQUtZLGVBQUwsR0FBcUIsS0FBSzZDLFlBQUwsQ0FBa0Jwc0IsQ0FBbEIsRUFBb0IsQ0FBcEIsRUFBc0IsQ0FBdEIsQ0FBaEg7QUFBeUk7QUFBQyxHQUFsb0IsRUFBbW9CdkMsRUFBRTJ1QixZQUFGLEdBQWUsVUFBU3BzQixDQUFULEVBQVdiLENBQVgsRUFBYVQsQ0FBYixFQUFlO0FBQUMsU0FBSSxJQUFJMmpCLElBQUUsRUFBVixFQUFhcmlCLElBQUUsQ0FBZixHQUFrQjtBQUFDLFVBQUlzaUIsSUFBRSxLQUFLZ0YsS0FBTCxDQUFXbm9CLENBQVgsQ0FBTixDQUFvQixJQUFHLENBQUNtakIsQ0FBSixFQUFNLE1BQU1ELEVBQUU3bEIsSUFBRixDQUFPOGxCLENBQVAsR0FBVW5qQixLQUFHVCxDQUFiLEVBQWVzQixLQUFHc2lCLEVBQUVyWSxJQUFGLENBQU9tWixVQUF6QjtBQUFvQyxZQUFPZixDQUFQO0FBQVMsR0FBbHdCLEVBQW13QjVrQixFQUFFbXVCLGNBQUYsR0FBaUIsWUFBVTtBQUFDLFFBQUcsS0FBS3hkLE9BQUwsQ0FBYWllLE9BQWIsSUFBc0IsQ0FBQyxLQUFLamUsT0FBTCxDQUFhcWEsVUFBcEMsSUFBZ0QsS0FBS25CLEtBQUwsQ0FBV3RwQixNQUE5RCxFQUFxRTtBQUFDLFVBQUlnQyxJQUFFLEtBQUtvTyxPQUFMLENBQWF3YSxXQUFuQjtBQUFBLFVBQStCenBCLElBQUVhLElBQUUsYUFBRixHQUFnQixZQUFqRDtBQUFBLFVBQThEdEIsSUFBRXNCLElBQUUsWUFBRixHQUFlLGFBQS9FO0FBQUEsVUFBNkZxaUIsSUFBRSxLQUFLOEUsY0FBTCxHQUFvQixLQUFLTSxXQUFMLEdBQW1CeGQsSUFBbkIsQ0FBd0J2TCxDQUF4QixDQUFuSDtBQUFBLFVBQThJNGpCLElBQUVELElBQUUsS0FBS3BZLElBQUwsQ0FBVXFVLFVBQTVKO0FBQUEsVUFBdUs0RCxJQUFFLEtBQUt5RyxjQUFMLEdBQW9CLEtBQUtyQixLQUFMLENBQVcsQ0FBWCxFQUFjcmQsSUFBZCxDQUFtQjlLLENBQW5CLENBQTdMO0FBQUEsVUFBbU5xakIsSUFBRUgsSUFBRSxLQUFLcFksSUFBTCxDQUFVcVUsVUFBVixJQUFzQixJQUFFLEtBQUswSSxTQUE3QixDQUF2TixDQUErUCxLQUFLOEIsTUFBTCxDQUFZdHJCLE9BQVosQ0FBb0IsVUFBU3dDLENBQVQsRUFBVztBQUFDc2lCLFlBQUV0aUIsRUFBRXlJLE1BQUYsR0FBUzRaLElBQUUsS0FBSzJFLFNBQWxCLElBQTZCaG5CLEVBQUV5SSxNQUFGLEdBQVN2SyxLQUFLd0UsR0FBTCxDQUFTMUMsRUFBRXlJLE1BQVgsRUFBa0J5WixDQUFsQixDQUFULEVBQThCbGlCLEVBQUV5SSxNQUFGLEdBQVN2SyxLQUFLNmMsR0FBTCxDQUFTL2EsRUFBRXlJLE1BQVgsRUFBa0IrWixDQUFsQixDQUFwRTtBQUEwRixPQUExSCxFQUEySCxJQUEzSDtBQUFpSTtBQUFDLEdBQXR1QyxFQUF1dUMva0IsRUFBRXVVLGFBQUYsR0FBZ0IsVUFBU2hTLENBQVQsRUFBV2IsQ0FBWCxFQUFhVCxDQUFiLEVBQWU7QUFBQyxRQUFJMmpCLElBQUVsakIsSUFBRSxDQUFDQSxDQUFELEVBQUlrRSxNQUFKLENBQVczRSxDQUFYLENBQUYsR0FBZ0JBLENBQXRCLENBQXdCLElBQUcsS0FBS3drQixTQUFMLENBQWVsakIsQ0FBZixFQUFpQnFpQixDQUFqQixHQUFvQkUsS0FBRyxLQUFLbG1CLFFBQS9CLEVBQXdDO0FBQUMyRCxXQUFHLEtBQUtvTyxPQUFMLENBQWFnYyxxQkFBYixHQUFtQyxXQUFuQyxHQUErQyxFQUFsRCxDQUFxRCxJQUFJOUgsSUFBRXRpQixDQUFOLENBQVEsSUFBR2IsQ0FBSCxFQUFLO0FBQUMsWUFBSStpQixJQUFFSyxFQUFFK0osS0FBRixDQUFRbnRCLENBQVIsQ0FBTixDQUFpQitpQixFQUFFOWtCLElBQUYsR0FBTzRDLENBQVAsRUFBU3NpQixJQUFFSixDQUFYO0FBQWEsWUFBSzdsQixRQUFMLENBQWNFLE9BQWQsQ0FBc0IrbEIsQ0FBdEIsRUFBd0I1akIsQ0FBeEI7QUFBMkI7QUFBQyxHQUFyOEMsRUFBczhDakIsRUFBRWlxQixNQUFGLEdBQVMsVUFBUzFuQixDQUFULEVBQVdiLENBQVgsRUFBYVQsQ0FBYixFQUFlO0FBQUMsU0FBS3FiLFFBQUwsS0FBZ0IvWixJQUFFZ1ksU0FBU2hZLENBQVQsRUFBVyxFQUFYLENBQUYsRUFBaUIsS0FBS3VzQixXQUFMLENBQWlCdnNCLENBQWpCLENBQWpCLEVBQXFDLENBQUMsS0FBS29PLE9BQUwsQ0FBYXFhLFVBQWIsSUFBeUJ0cEIsQ0FBMUIsTUFBK0JhLElBQUVxaUIsRUFBRW9ELE1BQUYsQ0FBU3psQixDQUFULEVBQVcsS0FBSzhvQixNQUFMLENBQVk5cUIsTUFBdkIsQ0FBakMsQ0FBckMsRUFBc0csS0FBSzhxQixNQUFMLENBQVk5b0IsQ0FBWixNQUFpQixLQUFLeXFCLGFBQUwsR0FBbUJ6cUIsQ0FBbkIsRUFBcUIsS0FBSzhyQixtQkFBTCxFQUFyQixFQUFnRHB0QixJQUFFLEtBQUtzcUIsd0JBQUwsRUFBRixHQUFrQyxLQUFLaEIsY0FBTCxFQUFsRixFQUF3RyxLQUFLNVosT0FBTCxDQUFhK2QsY0FBYixJQUE2QixLQUFLN0IsY0FBTCxFQUFySSxFQUEySixLQUFLdFksYUFBTCxDQUFtQixRQUFuQixDQUEzSixFQUF3TCxLQUFLQSxhQUFMLENBQW1CLFlBQW5CLENBQXpNLENBQXRIO0FBQWtXLEdBQWowRCxFQUFrMER2VSxFQUFFOHVCLFdBQUYsR0FBYyxVQUFTdnNCLENBQVQsRUFBVztBQUFDLFFBQUliLElBQUUsS0FBSzJwQixNQUFMLENBQVk5cUIsTUFBbEI7QUFBQSxRQUF5QlUsSUFBRSxLQUFLMFAsT0FBTCxDQUFhcWEsVUFBYixJQUF5QnRwQixJQUFFLENBQXRELENBQXdELElBQUcsQ0FBQ1QsQ0FBSixFQUFNLE9BQU9zQixDQUFQLENBQVMsSUFBSXNpQixJQUFFRCxFQUFFb0QsTUFBRixDQUFTemxCLENBQVQsRUFBV2IsQ0FBWCxDQUFOO0FBQUEsUUFBb0IraUIsSUFBRWhrQixLQUFLcVMsR0FBTCxDQUFTK1IsSUFBRSxLQUFLbUksYUFBaEIsQ0FBdEI7QUFBQSxRQUFxRGpJLElBQUV0a0IsS0FBS3FTLEdBQUwsQ0FBUytSLElBQUVuakIsQ0FBRixHQUFJLEtBQUtzckIsYUFBbEIsQ0FBdkQ7QUFBQSxRQUF3RnRJLElBQUVqa0IsS0FBS3FTLEdBQUwsQ0FBUytSLElBQUVuakIsQ0FBRixHQUFJLEtBQUtzckIsYUFBbEIsQ0FBMUYsQ0FBMkgsQ0FBQyxLQUFLK0IsWUFBTixJQUFvQmhLLElBQUVOLENBQXRCLEdBQXdCbGlCLEtBQUdiLENBQTNCLEdBQTZCLENBQUMsS0FBS3F0QixZQUFOLElBQW9CckssSUFBRUQsQ0FBdEIsS0FBMEJsaUIsS0FBR2IsQ0FBN0IsQ0FBN0IsRUFBNkRhLElBQUUsQ0FBRixHQUFJLEtBQUsrUCxDQUFMLElBQVEsS0FBS29YLGNBQWpCLEdBQWdDbm5CLEtBQUdiLENBQUgsS0FBTyxLQUFLNFEsQ0FBTCxJQUFRLEtBQUtvWCxjQUFwQixDQUE3RjtBQUFpSSxHQUEvcEUsRUFBZ3FFMXBCLEVBQUVtWSxRQUFGLEdBQVcsVUFBUzVWLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsU0FBS3VvQixNQUFMLENBQVksS0FBSytDLGFBQUwsR0FBbUIsQ0FBL0IsRUFBaUN6cUIsQ0FBakMsRUFBbUNiLENBQW5DO0FBQXNDLEdBQS90RSxFQUFndUUxQixFQUFFZ1ksSUFBRixHQUFPLFVBQVN6VixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFNBQUt1b0IsTUFBTCxDQUFZLEtBQUsrQyxhQUFMLEdBQW1CLENBQS9CLEVBQWlDenFCLENBQWpDLEVBQW1DYixDQUFuQztBQUFzQyxHQUEzeEUsRUFBNHhFMUIsRUFBRXF1QixtQkFBRixHQUFzQixZQUFVO0FBQUMsUUFBSTlyQixJQUFFLEtBQUs4b0IsTUFBTCxDQUFZLEtBQUsyQixhQUFqQixDQUFOLENBQXNDenFCLE1BQUksS0FBS3lzQixxQkFBTCxJQUE2QixLQUFLeEQsYUFBTCxHQUFtQmpwQixDQUFoRCxFQUFrREEsRUFBRTBuQixNQUFGLEVBQWxELEVBQTZELEtBQUtnRixhQUFMLEdBQW1CMXNCLEVBQUVzbkIsS0FBbEYsRUFBd0YsS0FBS3FGLGdCQUFMLEdBQXNCM3NCLEVBQUU2bkIsZUFBRixFQUE5RyxFQUFrSSxLQUFLK0UsWUFBTCxHQUFrQjVzQixFQUFFc25CLEtBQUYsQ0FBUSxDQUFSLENBQXBKLEVBQStKLEtBQUt1RixlQUFMLEdBQXFCLEtBQUtGLGdCQUFMLENBQXNCLENBQXRCLENBQXhMO0FBQWtOLEdBQXJqRixFQUFzakZsdkIsRUFBRWd2QixxQkFBRixHQUF3QixZQUFVO0FBQUMsU0FBS3hELGFBQUwsSUFBb0IsS0FBS0EsYUFBTCxDQUFtQnJCLFFBQW5CLEVBQXBCO0FBQWtELEdBQTNvRixFQUE0b0ZucUIsRUFBRXF2QixVQUFGLEdBQWEsVUFBUzlzQixDQUFULEVBQVdiLENBQVgsRUFBYVQsQ0FBYixFQUFlO0FBQUMsUUFBSTJqQixDQUFKLENBQU0sWUFBVSxPQUFPcmlCLENBQWpCLEdBQW1CcWlCLElBQUUsS0FBS2lGLEtBQUwsQ0FBV3RuQixDQUFYLENBQXJCLElBQW9DLFlBQVUsT0FBT0EsQ0FBakIsS0FBcUJBLElBQUUsS0FBS2tFLE9BQUwsQ0FBYTJmLGFBQWIsQ0FBMkI3akIsQ0FBM0IsQ0FBdkIsR0FBc0RxaUIsSUFBRSxLQUFLMEssT0FBTCxDQUFhL3NCLENBQWIsQ0FBNUYsRUFBNkcsS0FBSSxJQUFJc2lCLElBQUUsQ0FBVixFQUFZRCxLQUFHQyxJQUFFLEtBQUt3RyxNQUFMLENBQVk5cUIsTUFBN0IsRUFBb0Nza0IsR0FBcEMsRUFBd0M7QUFBQyxVQUFJSixJQUFFLEtBQUs0RyxNQUFMLENBQVl4RyxDQUFaLENBQU47QUFBQSxVQUFxQkUsSUFBRU4sRUFBRW9GLEtBQUYsQ0FBUTNxQixPQUFSLENBQWdCMGxCLENBQWhCLENBQXZCLENBQTBDLElBQUdHLEtBQUcsQ0FBQyxDQUFQLEVBQVMsT0FBTyxLQUFLLEtBQUtrRixNQUFMLENBQVlwRixDQUFaLEVBQWNuakIsQ0FBZCxFQUFnQlQsQ0FBaEIsQ0FBWjtBQUErQjtBQUFDLEdBQXg1RixFQUF5NUZqQixFQUFFc3ZCLE9BQUYsR0FBVSxVQUFTL3NCLENBQVQsRUFBVztBQUFDLFNBQUksSUFBSWIsSUFBRSxDQUFWLEVBQVlBLElBQUUsS0FBS21vQixLQUFMLENBQVd0cEIsTUFBekIsRUFBZ0NtQixHQUFoQyxFQUFvQztBQUFDLFVBQUlULElBQUUsS0FBSzRvQixLQUFMLENBQVdub0IsQ0FBWCxDQUFOLENBQW9CLElBQUdULEVBQUV3RixPQUFGLElBQVdsRSxDQUFkLEVBQWdCLE9BQU90QixDQUFQO0FBQVM7QUFBQyxHQUFsZ0csRUFBbWdHakIsRUFBRXV2QixRQUFGLEdBQVcsVUFBU2h0QixDQUFULEVBQVc7QUFBQ0EsUUFBRXFpQixFQUFFcUQsU0FBRixDQUFZMWxCLENBQVosQ0FBRixDQUFpQixJQUFJYixJQUFFLEVBQU4sQ0FBUyxPQUFPYSxFQUFFeEMsT0FBRixDQUFVLFVBQVN3QyxDQUFULEVBQVc7QUFBQyxVQUFJdEIsSUFBRSxLQUFLcXVCLE9BQUwsQ0FBYS9zQixDQUFiLENBQU4sQ0FBc0J0QixLQUFHUyxFQUFFM0MsSUFBRixDQUFPa0MsQ0FBUCxDQUFIO0FBQWEsS0FBekQsRUFBMEQsSUFBMUQsR0FBZ0VTLENBQXZFO0FBQXlFLEdBQTduRyxFQUE4bkcxQixFQUFFb3FCLGVBQUYsR0FBa0IsWUFBVTtBQUFDLFdBQU8sS0FBS1AsS0FBTCxDQUFXam9CLEdBQVgsQ0FBZSxVQUFTVyxDQUFULEVBQVc7QUFBQyxhQUFPQSxFQUFFa0UsT0FBVDtBQUFpQixLQUE1QyxDQUFQO0FBQXFELEdBQWh0RyxFQUFpdEd6RyxFQUFFd3ZCLGFBQUYsR0FBZ0IsVUFBU2p0QixDQUFULEVBQVc7QUFBQyxRQUFJYixJQUFFLEtBQUs0dEIsT0FBTCxDQUFhL3NCLENBQWIsQ0FBTixDQUFzQixPQUFPYixJQUFFQSxDQUFGLElBQUthLElBQUVxaUIsRUFBRXVELFNBQUYsQ0FBWTVsQixDQUFaLEVBQWMsc0JBQWQsQ0FBRixFQUF3QyxLQUFLK3NCLE9BQUwsQ0FBYS9zQixDQUFiLENBQTdDLENBQVA7QUFBcUUsR0FBeDBHLEVBQXkwR3ZDLEVBQUV5dkIsdUJBQUYsR0FBMEIsVUFBU2x0QixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFFBQUcsQ0FBQ2EsQ0FBSixFQUFNLE9BQU8sS0FBS2lwQixhQUFMLENBQW1CcEIsZUFBbkIsRUFBUCxDQUE0QzFvQixJQUFFLEtBQUssQ0FBTCxLQUFTQSxDQUFULEdBQVcsS0FBS3NyQixhQUFoQixHQUE4QnRyQixDQUFoQyxDQUFrQyxJQUFJVCxJQUFFLEtBQUtvcUIsTUFBTCxDQUFZOXFCLE1BQWxCLENBQXlCLElBQUcsSUFBRSxJQUFFZ0MsQ0FBSixJQUFPdEIsQ0FBVixFQUFZLE9BQU8sS0FBS21wQixlQUFMLEVBQVAsQ0FBOEIsS0FBSSxJQUFJdkYsSUFBRSxFQUFOLEVBQVNKLElBQUUvaUIsSUFBRWEsQ0FBakIsRUFBbUJraUIsS0FBRy9pQixJQUFFYSxDQUF4QixFQUEwQmtpQixHQUExQixFQUE4QjtBQUFDLFVBQUlNLElBQUUsS0FBS3BVLE9BQUwsQ0FBYXFhLFVBQWIsR0FBd0JwRyxFQUFFb0QsTUFBRixDQUFTdkQsQ0FBVCxFQUFXeGpCLENBQVgsQ0FBeEIsR0FBc0N3akIsQ0FBNUM7QUFBQSxVQUE4Q0MsSUFBRSxLQUFLMkcsTUFBTCxDQUFZdEcsQ0FBWixDQUFoRCxDQUErREwsTUFBSUcsSUFBRUEsRUFBRWpmLE1BQUYsQ0FBUzhlLEVBQUUwRixlQUFGLEVBQVQsQ0FBTjtBQUFxQyxZQUFPdkYsQ0FBUDtBQUFTLEdBQXBwSCxFQUFxcEg3a0IsRUFBRTB2QixRQUFGLEdBQVcsWUFBVTtBQUFDLFNBQUtqSyxTQUFMLENBQWUsVUFBZjtBQUEyQixHQUF0c0gsRUFBdXNIemxCLEVBQUUydkIsa0JBQUYsR0FBcUIsVUFBU3B0QixDQUFULEVBQVc7QUFBQyxTQUFLa2pCLFNBQUwsQ0FBZSxvQkFBZixFQUFvQyxDQUFDbGpCLENBQUQsQ0FBcEM7QUFBeUMsR0FBanhILEVBQWt4SHZDLEVBQUU0dkIsUUFBRixHQUFXLFlBQVU7QUFBQyxTQUFLekMsUUFBTCxJQUFnQixLQUFLUCxNQUFMLEVBQWhCO0FBQThCLEdBQXQwSCxFQUF1MEhoSSxFQUFFNEQsY0FBRixDQUFpQjdELENBQWpCLEVBQW1CLFVBQW5CLEVBQThCLEdBQTlCLENBQXYwSCxFQUEwMkgza0IsRUFBRTRzQixNQUFGLEdBQVMsWUFBVTtBQUFDLFFBQUcsS0FBS3RRLFFBQVIsRUFBaUI7QUFBQyxXQUFLb0osT0FBTCxJQUFlLEtBQUsvVSxPQUFMLENBQWFxYSxVQUFiLEtBQTBCLEtBQUsxWSxDQUFMLEdBQU9zUyxFQUFFb0QsTUFBRixDQUFTLEtBQUsxVixDQUFkLEVBQWdCLEtBQUtvWCxjQUFyQixDQUFqQyxDQUFmLEVBQXNGLEtBQUtrRSxhQUFMLEVBQXRGLEVBQTJHLEtBQUtDLGtCQUFMLEVBQTNHLEVBQXFJLEtBQUtoQixjQUFMLEVBQXJJLEVBQTJKLEtBQUtwSCxTQUFMLENBQWUsUUFBZixDQUEzSixDQUFvTCxJQUFJbGpCLElBQUUsS0FBSzJzQixnQkFBTCxJQUF1QixLQUFLQSxnQkFBTCxDQUFzQixDQUF0QixDQUE3QixDQUFzRCxLQUFLRyxVQUFMLENBQWdCOXNCLENBQWhCLEVBQWtCLENBQUMsQ0FBbkIsRUFBcUIsQ0FBQyxDQUF0QjtBQUF5QjtBQUFDLEdBQXBwSSxFQUFxcEl2QyxFQUFFbXRCLFFBQUYsR0FBVyxZQUFVO0FBQUMsUUFBSTVxQixJQUFFLEtBQUtvTyxPQUFMLENBQWF3YyxRQUFuQixDQUE0QixJQUFHNXFCLENBQUgsRUFBSztBQUFDLFVBQUliLElBQUVzakIsRUFBRSxLQUFLdmUsT0FBUCxFQUFlLFFBQWYsRUFBeUJvcEIsT0FBL0IsQ0FBdUNudUIsRUFBRXhDLE9BQUYsQ0FBVSxVQUFWLEtBQXVCLENBQUMsQ0FBeEIsR0FBMEIsS0FBS2t1QixRQUFMLEVBQTFCLEdBQTBDLEtBQUswQyxVQUFMLEVBQTFDO0FBQTREO0FBQUMsR0FBanpJLEVBQWt6STl2QixFQUFFK3ZCLFNBQUYsR0FBWSxVQUFTeHRCLENBQVQsRUFBVztBQUFDLFFBQUcsS0FBS29PLE9BQUwsQ0FBYTZiLGFBQWIsS0FBNkIsQ0FBQ3BxQixTQUFTNHRCLGFBQVYsSUFBeUI1dEIsU0FBUzR0QixhQUFULElBQXdCLEtBQUt2cEIsT0FBbkYsQ0FBSCxFQUErRixJQUFHLE1BQUlsRSxFQUFFNEcsT0FBVCxFQUFpQjtBQUFDLFVBQUl6SCxJQUFFLEtBQUtpUCxPQUFMLENBQWF3YSxXQUFiLEdBQXlCLE1BQXpCLEdBQWdDLFVBQXRDLENBQWlELEtBQUt1RSxRQUFMLElBQWdCLEtBQUtodUIsQ0FBTCxHQUFoQjtBQUEwQixLQUE3RixNQUFrRyxJQUFHLE1BQUlhLEVBQUU0RyxPQUFULEVBQWlCO0FBQUMsVUFBSWxJLElBQUUsS0FBSzBQLE9BQUwsQ0FBYXdhLFdBQWIsR0FBeUIsVUFBekIsR0FBb0MsTUFBMUMsQ0FBaUQsS0FBS3VFLFFBQUwsSUFBZ0IsS0FBS3p1QixDQUFMLEdBQWhCO0FBQTBCO0FBQUMsR0FBem1KLEVBQTBtSmpCLEVBQUU4dkIsVUFBRixHQUFhLFlBQVU7QUFBQyxTQUFLeFQsUUFBTCxLQUFnQixLQUFLN1YsT0FBTCxDQUFheWMsU0FBYixDQUF1QkMsTUFBdkIsQ0FBOEIsa0JBQTlCLEdBQWtELEtBQUsxYyxPQUFMLENBQWF5YyxTQUFiLENBQXVCQyxNQUF2QixDQUE4QixjQUE5QixDQUFsRCxFQUFnRyxLQUFLMEcsS0FBTCxDQUFXOXBCLE9BQVgsQ0FBbUIsVUFBU3dDLENBQVQsRUFBVztBQUFDQSxRQUFFNmhCLE9BQUY7QUFBWSxLQUEzQyxDQUFoRyxFQUE2SSxLQUFLNEsscUJBQUwsRUFBN0ksRUFBMEssS0FBS3ZvQixPQUFMLENBQWEwZixXQUFiLENBQXlCLEtBQUs4RyxRQUE5QixDQUExSyxFQUFrTnZJLEVBQUUsS0FBSzBHLE1BQUwsQ0FBWTVhLFFBQWQsRUFBdUIsS0FBSy9KLE9BQTVCLENBQWxOLEVBQXVQLEtBQUtrSyxPQUFMLENBQWE2YixhQUFiLEtBQTZCLEtBQUsvbEIsT0FBTCxDQUFhd3BCLGVBQWIsQ0FBNkIsVUFBN0IsR0FBeUMsS0FBS3hwQixPQUFMLENBQWEyTCxtQkFBYixDQUFpQyxTQUFqQyxFQUEyQyxJQUEzQyxDQUF0RSxDQUF2UCxFQUErVyxLQUFLa0ssUUFBTCxHQUFjLENBQUMsQ0FBOVgsRUFBZ1ksS0FBS21KLFNBQUwsQ0FBZSxZQUFmLENBQWhaO0FBQThhLEdBQWhqSyxFQUFpakt6bEIsRUFBRW9rQixPQUFGLEdBQVUsWUFBVTtBQUFDLFNBQUswTCxVQUFMLElBQWtCdnRCLEVBQUU2UCxtQkFBRixDQUFzQixRQUF0QixFQUErQixJQUEvQixDQUFsQixFQUF1RCxLQUFLcVQsU0FBTCxDQUFlLFNBQWYsQ0FBdkQsRUFBaUZYLEtBQUcsS0FBS2xtQixRQUFSLElBQWtCa21CLEVBQUUxbEIsVUFBRixDQUFhLEtBQUtxSCxPQUFsQixFQUEwQixVQUExQixDQUFuRyxFQUF5SSxPQUFPLEtBQUtBLE9BQUwsQ0FBYTZsQixZQUE3SixFQUEwSyxPQUFPN0YsRUFBRSxLQUFLc0csSUFBUCxDQUFqTDtBQUE4TCxHQUFwd0ssRUFBcXdLbkksRUFBRTNhLE1BQUYsQ0FBU2pLLENBQVQsRUFBVytrQixDQUFYLENBQXJ3SyxFQUFteEtKLEVBQUU5bEIsSUFBRixHQUFPLFVBQVMwRCxDQUFULEVBQVc7QUFBQ0EsUUFBRXFpQixFQUFFd0QsZUFBRixDQUFrQjdsQixDQUFsQixDQUFGLENBQXVCLElBQUliLElBQUVhLEtBQUdBLEVBQUUrcEIsWUFBWCxDQUF3QixPQUFPNXFCLEtBQUcra0IsRUFBRS9rQixDQUFGLENBQVY7QUFBZSxHQUFwMkssRUFBcTJLa2pCLEVBQUUrRCxRQUFGLENBQVdoRSxDQUFYLEVBQWEsVUFBYixDQUFyMkssRUFBODNLRyxLQUFHQSxFQUFFTyxPQUFMLElBQWNQLEVBQUVPLE9BQUYsQ0FBVSxVQUFWLEVBQXFCVixDQUFyQixDQUE1NEssRUFBbzZLQSxFQUFFb0UsSUFBRixHQUFPbEUsQ0FBMzZLLEVBQTY2S0YsQ0FBcDdLO0FBQXM3SyxDQUExalUsQ0FBcmhYLEVBQWlsckIsVUFBU3BpQixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLGdCQUFZLE9BQU9zZCxNQUFuQixJQUEyQkEsT0FBT0MsR0FBbEMsR0FBc0NELE9BQU8sdUJBQVAsRUFBK0IsQ0FBQyx1QkFBRCxDQUEvQixFQUF5RCxVQUFTL2QsQ0FBVCxFQUFXO0FBQUMsV0FBT1MsRUFBRWEsQ0FBRixFQUFJdEIsQ0FBSixDQUFQO0FBQWMsR0FBbkYsQ0FBdEMsR0FBMkgsb0JBQWlCOGQsTUFBakIseUNBQWlCQSxNQUFqQixNQUF5QkEsT0FBT0QsT0FBaEMsR0FBd0NDLE9BQU9ELE9BQVAsR0FBZXBkLEVBQUVhLENBQUYsRUFBSWdpQixRQUFRLFlBQVIsQ0FBSixDQUF2RCxHQUFrRmhpQixFQUFFMnRCLFVBQUYsR0FBYXh1QixFQUFFYSxDQUFGLEVBQUlBLEVBQUUraUIsU0FBTixDQUExTjtBQUEyTyxDQUF6UCxDQUEwUHBoQixNQUExUCxFQUFpUSxVQUFTM0IsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxXQUFTVCxDQUFULEdBQVksQ0FBRSxVQUFTMmpCLENBQVQsR0FBWSxDQUFFLEtBQUlDLElBQUVELEVBQUVoaEIsU0FBRixHQUFZMUQsT0FBTzhvQixNQUFQLENBQWN0bkIsRUFBRWtDLFNBQWhCLENBQWxCLENBQTZDaWhCLEVBQUVzTCxjQUFGLEdBQWlCLFVBQVM1dEIsQ0FBVCxFQUFXO0FBQUMsU0FBSzZ0QixlQUFMLENBQXFCN3RCLENBQXJCLEVBQXVCLENBQUMsQ0FBeEI7QUFBMkIsR0FBeEQsRUFBeURzaUIsRUFBRXdMLGdCQUFGLEdBQW1CLFVBQVM5dEIsQ0FBVCxFQUFXO0FBQUMsU0FBSzZ0QixlQUFMLENBQXFCN3RCLENBQXJCLEVBQXVCLENBQUMsQ0FBeEI7QUFBMkIsR0FBbkgsRUFBb0hzaUIsRUFBRXVMLGVBQUYsR0FBa0IsVUFBUzF1QixDQUFULEVBQVdULENBQVgsRUFBYTtBQUFDQSxRQUFFLEtBQUssQ0FBTCxLQUFTQSxDQUFULElBQVksQ0FBQyxDQUFDQSxDQUFoQixDQUFrQixJQUFJMmpCLElBQUUzakIsSUFBRSxrQkFBRixHQUFxQixxQkFBM0IsQ0FBaURzQixFQUFFcUMsU0FBRixDQUFZMHJCLGNBQVosR0FBMkI1dUIsRUFBRWtqQixDQUFGLEVBQUssYUFBTCxFQUFtQixJQUFuQixDQUEzQixHQUFvRHJpQixFQUFFcUMsU0FBRixDQUFZMnJCLGdCQUFaLEdBQTZCN3VCLEVBQUVrakIsQ0FBRixFQUFLLGVBQUwsRUFBcUIsSUFBckIsQ0FBN0IsSUFBeURsakIsRUFBRWtqQixDQUFGLEVBQUssV0FBTCxFQUFpQixJQUFqQixHQUF1QmxqQixFQUFFa2pCLENBQUYsRUFBSyxZQUFMLEVBQWtCLElBQWxCLENBQWhGLENBQXBEO0FBQTZKLEdBQXBYLEVBQXFYQyxFQUFFd0QsV0FBRixHQUFjLFVBQVM5bEIsQ0FBVCxFQUFXO0FBQUMsUUFBSWIsSUFBRSxPQUFLYSxFQUFFNUMsSUFBYixDQUFrQixLQUFLK0IsQ0FBTCxLQUFTLEtBQUtBLENBQUwsRUFBUWEsQ0FBUixDQUFUO0FBQW9CLEdBQXJiLEVBQXNic2lCLEVBQUUyTCxRQUFGLEdBQVcsVUFBU2p1QixDQUFULEVBQVc7QUFBQyxTQUFJLElBQUliLElBQUUsQ0FBVixFQUFZQSxJQUFFYSxFQUFFaEMsTUFBaEIsRUFBdUJtQixHQUF2QixFQUEyQjtBQUFDLFVBQUlULElBQUVzQixFQUFFYixDQUFGLENBQU4sQ0FBVyxJQUFHVCxFQUFFd3ZCLFVBQUYsSUFBYyxLQUFLQyxpQkFBdEIsRUFBd0MsT0FBT3p2QixDQUFQO0FBQVM7QUFBQyxHQUF0aUIsRUFBdWlCNGpCLEVBQUU4TCxXQUFGLEdBQWMsVUFBU3B1QixDQUFULEVBQVc7QUFBQyxRQUFJYixJQUFFYSxFQUFFcXVCLE1BQVIsQ0FBZWx2QixLQUFHLE1BQUlBLENBQVAsSUFBVSxNQUFJQSxDQUFkLElBQWlCLEtBQUttdkIsWUFBTCxDQUFrQnR1QixDQUFsQixFQUFvQkEsQ0FBcEIsQ0FBakI7QUFBd0MsR0FBeG5CLEVBQXluQnNpQixFQUFFaU0sWUFBRixHQUFlLFVBQVN2dUIsQ0FBVCxFQUFXO0FBQUMsU0FBS3N1QixZQUFMLENBQWtCdHVCLENBQWxCLEVBQW9CQSxFQUFFa1IsY0FBRixDQUFpQixDQUFqQixDQUFwQjtBQUF5QyxHQUE3ckIsRUFBOHJCb1IsRUFBRWtNLGVBQUYsR0FBa0JsTSxFQUFFbU0sYUFBRixHQUFnQixVQUFTenVCLENBQVQsRUFBVztBQUFDLFNBQUtzdUIsWUFBTCxDQUFrQnR1QixDQUFsQixFQUFvQkEsQ0FBcEI7QUFBdUIsR0FBbndCLEVBQW93QnNpQixFQUFFZ00sWUFBRixHQUFlLFVBQVN0dUIsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxTQUFLZ3FCLGFBQUwsS0FBcUIsS0FBS0EsYUFBTCxHQUFtQixDQUFDLENBQXBCLEVBQXNCLEtBQUtnRixpQkFBTCxHQUF1QixLQUFLLENBQUwsS0FBU2h2QixFQUFFdXZCLFNBQVgsR0FBcUJ2dkIsRUFBRXV2QixTQUF2QixHQUFpQ3Z2QixFQUFFK3VCLFVBQWhGLEVBQTJGLEtBQUtTLFdBQUwsQ0FBaUIzdUIsQ0FBakIsRUFBbUJiLENBQW5CLENBQWhIO0FBQXVJLEdBQXg2QixFQUF5NkJtakIsRUFBRXFNLFdBQUYsR0FBYyxVQUFTM3VCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsU0FBS3l2QixvQkFBTCxDQUEwQjV1QixDQUExQixHQUE2QixLQUFLa2pCLFNBQUwsQ0FBZSxhQUFmLEVBQTZCLENBQUNsakIsQ0FBRCxFQUFHYixDQUFILENBQTdCLENBQTdCO0FBQWlFLEdBQXRnQyxDQUF1Z0MsSUFBSStpQixJQUFFLEVBQUMyTSxXQUFVLENBQUMsV0FBRCxFQUFhLFNBQWIsQ0FBWCxFQUFtQ3hkLFlBQVcsQ0FBQyxXQUFELEVBQWEsVUFBYixFQUF3QixhQUF4QixDQUE5QyxFQUFxRnlkLGFBQVksQ0FBQyxhQUFELEVBQWUsV0FBZixFQUEyQixlQUEzQixDQUFqRyxFQUE2SUMsZUFBYyxDQUFDLGVBQUQsRUFBaUIsYUFBakIsRUFBK0IsaUJBQS9CLENBQTNKLEVBQU4sQ0FBb04sT0FBT3pNLEVBQUVzTSxvQkFBRixHQUF1QixVQUFTenZCLENBQVQsRUFBVztBQUFDLFFBQUdBLENBQUgsRUFBSztBQUFDLFVBQUlULElBQUV3akIsRUFBRS9pQixFQUFFL0IsSUFBSixDQUFOLENBQWdCc0IsRUFBRWxCLE9BQUYsQ0FBVSxVQUFTMkIsQ0FBVCxFQUFXO0FBQUNhLFVBQUV5USxnQkFBRixDQUFtQnRSLENBQW5CLEVBQXFCLElBQXJCO0FBQTJCLE9BQWpELEVBQWtELElBQWxELEdBQXdELEtBQUs2dkIsbUJBQUwsR0FBeUJ0d0IsQ0FBakY7QUFBbUY7QUFBQyxHQUE3SSxFQUE4STRqQixFQUFFMk0sc0JBQUYsR0FBeUIsWUFBVTtBQUFDLFNBQUtELG1CQUFMLEtBQTJCLEtBQUtBLG1CQUFMLENBQXlCeHhCLE9BQXpCLENBQWlDLFVBQVMyQixDQUFULEVBQVc7QUFBQ2EsUUFBRTZQLG1CQUFGLENBQXNCMVEsQ0FBdEIsRUFBd0IsSUFBeEI7QUFBOEIsS0FBM0UsRUFBNEUsSUFBNUUsR0FBa0YsT0FBTyxLQUFLNnZCLG1CQUF6SDtBQUE4SSxHQUFoVSxFQUFpVTFNLEVBQUU0TSxXQUFGLEdBQWMsVUFBU2x2QixDQUFULEVBQVc7QUFBQyxTQUFLbXZCLFlBQUwsQ0FBa0JudkIsQ0FBbEIsRUFBb0JBLENBQXBCO0FBQXVCLEdBQWxYLEVBQW1Yc2lCLEVBQUU4TSxlQUFGLEdBQWtCOU0sRUFBRStNLGFBQUYsR0FBZ0IsVUFBU3J2QixDQUFULEVBQVc7QUFBQ0EsTUFBRTB1QixTQUFGLElBQWEsS0FBS1AsaUJBQWxCLElBQXFDLEtBQUtnQixZQUFMLENBQWtCbnZCLENBQWxCLEVBQW9CQSxDQUFwQixDQUFyQztBQUE0RCxHQUE3ZCxFQUE4ZHNpQixFQUFFZ04sV0FBRixHQUFjLFVBQVN0dkIsQ0FBVCxFQUFXO0FBQUMsUUFBSWIsSUFBRSxLQUFLOHVCLFFBQUwsQ0FBY2p1QixFQUFFa1IsY0FBaEIsQ0FBTixDQUFzQy9SLEtBQUcsS0FBS2d3QixZQUFMLENBQWtCbnZCLENBQWxCLEVBQW9CYixDQUFwQixDQUFIO0FBQTBCLEdBQXhqQixFQUF5akJtakIsRUFBRTZNLFlBQUYsR0FBZSxVQUFTbnZCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsU0FBS293QixXQUFMLENBQWlCdnZCLENBQWpCLEVBQW1CYixDQUFuQjtBQUFzQixHQUE1bUIsRUFBNm1CbWpCLEVBQUVpTixXQUFGLEdBQWMsVUFBU3Z2QixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFNBQUsrakIsU0FBTCxDQUFlLGFBQWYsRUFBNkIsQ0FBQ2xqQixDQUFELEVBQUdiLENBQUgsQ0FBN0I7QUFBb0MsR0FBN3FCLEVBQThxQm1qQixFQUFFa04sU0FBRixHQUFZLFVBQVN4dkIsQ0FBVCxFQUFXO0FBQUMsU0FBS3l2QixVQUFMLENBQWdCenZCLENBQWhCLEVBQWtCQSxDQUFsQjtBQUFxQixHQUEzdEIsRUFBNHRCc2lCLEVBQUVvTixhQUFGLEdBQWdCcE4sRUFBRXFOLFdBQUYsR0FBYyxVQUFTM3ZCLENBQVQsRUFBVztBQUFDQSxNQUFFMHVCLFNBQUYsSUFBYSxLQUFLUCxpQkFBbEIsSUFBcUMsS0FBS3NCLFVBQUwsQ0FBZ0J6dkIsQ0FBaEIsRUFBa0JBLENBQWxCLENBQXJDO0FBQTBELEdBQWgwQixFQUFpMEJzaUIsRUFBRXNOLFVBQUYsR0FBYSxVQUFTNXZCLENBQVQsRUFBVztBQUFDLFFBQUliLElBQUUsS0FBSzh1QixRQUFMLENBQWNqdUIsRUFBRWtSLGNBQWhCLENBQU4sQ0FBc0MvUixLQUFHLEtBQUtzd0IsVUFBTCxDQUFnQnp2QixDQUFoQixFQUFrQmIsQ0FBbEIsQ0FBSDtBQUF3QixHQUF4NUIsRUFBeTVCbWpCLEVBQUVtTixVQUFGLEdBQWEsVUFBU3p2QixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFNBQUswd0IsWUFBTCxJQUFvQixLQUFLQyxTQUFMLENBQWU5dkIsQ0FBZixFQUFpQmIsQ0FBakIsQ0FBcEI7QUFBd0MsR0FBNTlCLEVBQTY5Qm1qQixFQUFFd04sU0FBRixHQUFZLFVBQVM5dkIsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxTQUFLK2pCLFNBQUwsQ0FBZSxXQUFmLEVBQTJCLENBQUNsakIsQ0FBRCxFQUFHYixDQUFILENBQTNCO0FBQWtDLEdBQXpoQyxFQUEwaENtakIsRUFBRXVOLFlBQUYsR0FBZSxZQUFVO0FBQUMsU0FBSzFHLGFBQUwsR0FBbUIsQ0FBQyxDQUFwQixFQUFzQixPQUFPLEtBQUtnRixpQkFBbEMsRUFBb0QsS0FBS2Msc0JBQUwsRUFBcEQsRUFBa0YsS0FBS2MsV0FBTCxFQUFsRjtBQUFxRyxHQUF6cEMsRUFBMHBDek4sRUFBRXlOLFdBQUYsR0FBY3J4QixDQUF4cUMsRUFBMHFDNGpCLEVBQUUwTixpQkFBRixHQUFvQjFOLEVBQUUyTixlQUFGLEdBQWtCLFVBQVNqd0IsQ0FBVCxFQUFXO0FBQUNBLE1BQUUwdUIsU0FBRixJQUFhLEtBQUtQLGlCQUFsQixJQUFxQyxLQUFLK0IsY0FBTCxDQUFvQmx3QixDQUFwQixFQUFzQkEsQ0FBdEIsQ0FBckM7QUFBOEQsR0FBMXhDLEVBQTJ4Q3NpQixFQUFFNk4sYUFBRixHQUFnQixVQUFTbndCLENBQVQsRUFBVztBQUFDLFFBQUliLElBQUUsS0FBSzh1QixRQUFMLENBQWNqdUIsRUFBRWtSLGNBQWhCLENBQU4sQ0FBc0MvUixLQUFHLEtBQUsrd0IsY0FBTCxDQUFvQmx3QixDQUFwQixFQUFzQmIsQ0FBdEIsQ0FBSDtBQUE0QixHQUF6M0MsRUFBMDNDbWpCLEVBQUU0TixjQUFGLEdBQWlCLFVBQVNsd0IsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxTQUFLMHdCLFlBQUwsSUFBb0IsS0FBS08sYUFBTCxDQUFtQnB3QixDQUFuQixFQUFxQmIsQ0FBckIsQ0FBcEI7QUFBNEMsR0FBcjhDLEVBQXM4Q21qQixFQUFFOE4sYUFBRixHQUFnQixVQUFTcHdCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsU0FBSytqQixTQUFMLENBQWUsZUFBZixFQUErQixDQUFDbGpCLENBQUQsRUFBR2IsQ0FBSCxDQUEvQjtBQUFzQyxHQUExZ0QsRUFBMmdEa2pCLEVBQUVnTyxlQUFGLEdBQWtCLFVBQVNyd0IsQ0FBVCxFQUFXO0FBQUMsV0FBTSxFQUFDK1AsR0FBRS9QLEVBQUVpUSxLQUFMLEVBQVdDLEdBQUVsUSxFQUFFbVEsS0FBZixFQUFOO0FBQTRCLEdBQXJrRCxFQUFza0RrUyxDQUE3a0Q7QUFBK2tELENBQWxvRyxDQUFqbHJCLEVBQXF0eEIsVUFBU3JpQixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLGdCQUFZLE9BQU9zZCxNQUFuQixJQUEyQkEsT0FBT0MsR0FBbEMsR0FBc0NELE9BQU8sdUJBQVAsRUFBK0IsQ0FBQyx1QkFBRCxDQUEvQixFQUF5RCxVQUFTL2QsQ0FBVCxFQUFXO0FBQUMsV0FBT1MsRUFBRWEsQ0FBRixFQUFJdEIsQ0FBSixDQUFQO0FBQWMsR0FBbkYsQ0FBdEMsR0FBMkgsb0JBQWlCOGQsTUFBakIseUNBQWlCQSxNQUFqQixNQUF5QkEsT0FBT0QsT0FBaEMsR0FBd0NDLE9BQU9ELE9BQVAsR0FBZXBkLEVBQUVhLENBQUYsRUFBSWdpQixRQUFRLFlBQVIsQ0FBSixDQUF2RCxHQUFrRmhpQixFQUFFc3dCLFVBQUYsR0FBYW54QixFQUFFYSxDQUFGLEVBQUlBLEVBQUUydEIsVUFBTixDQUExTjtBQUE0TyxDQUExUCxDQUEyUGhzQixNQUEzUCxFQUFrUSxVQUFTM0IsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxXQUFTVCxDQUFULEdBQVksQ0FBRSxVQUFTMmpCLENBQVQsR0FBWSxDQUFFLEtBQUlDLElBQUVELEVBQUVoaEIsU0FBRixHQUFZMUQsT0FBTzhvQixNQUFQLENBQWN0bkIsRUFBRWtDLFNBQWhCLENBQWxCLENBQTZDaWhCLEVBQUVpTyxXQUFGLEdBQWMsWUFBVTtBQUFDLFNBQUtDLFlBQUwsQ0FBa0IsQ0FBQyxDQUFuQjtBQUFzQixHQUEvQyxFQUFnRGxPLEVBQUVtTyxhQUFGLEdBQWdCLFlBQVU7QUFBQyxTQUFLRCxZQUFMLENBQWtCLENBQUMsQ0FBbkI7QUFBc0IsR0FBakcsQ0FBa0csSUFBSXRPLElBQUVsaUIsRUFBRXFDLFNBQVIsQ0FBa0IsT0FBT2lnQixFQUFFa08sWUFBRixHQUFlLFVBQVN4d0IsQ0FBVCxFQUFXO0FBQUNBLFFBQUUsS0FBSyxDQUFMLEtBQVNBLENBQVQsSUFBWSxDQUFDLENBQUNBLENBQWhCLENBQWtCLElBQUliLENBQUosQ0FBTUEsSUFBRStpQixFQUFFNkwsY0FBRixHQUFpQixVQUFTNXVCLENBQVQsRUFBVztBQUFDQSxRQUFFYyxLQUFGLENBQVF5d0IsV0FBUixHQUFvQjF3QixJQUFFLE1BQUYsR0FBUyxFQUE3QjtBQUFnQyxLQUE3RCxHQUE4RGtpQixFQUFFOEwsZ0JBQUYsR0FBbUIsVUFBUzd1QixDQUFULEVBQVc7QUFBQ0EsUUFBRWMsS0FBRixDQUFRMHdCLGFBQVIsR0FBc0Izd0IsSUFBRSxNQUFGLEdBQVMsRUFBL0I7QUFBa0MsS0FBakUsR0FBa0V0QixDQUFsSSxDQUFvSSxLQUFJLElBQUkyakIsSUFBRXJpQixJQUFFLGtCQUFGLEdBQXFCLHFCQUEzQixFQUFpRHNpQixJQUFFLENBQXZELEVBQXlEQSxJQUFFLEtBQUtzTyxPQUFMLENBQWE1eUIsTUFBeEUsRUFBK0Vza0IsR0FBL0UsRUFBbUY7QUFBQyxVQUFJRSxJQUFFLEtBQUtvTyxPQUFMLENBQWF0TyxDQUFiLENBQU4sQ0FBc0IsS0FBS3VMLGVBQUwsQ0FBcUJyTCxDQUFyQixFQUF1QnhpQixDQUF2QixHQUEwQmIsRUFBRXFqQixDQUFGLENBQTFCLEVBQStCQSxFQUFFSCxDQUFGLEVBQUssT0FBTCxFQUFhLElBQWIsQ0FBL0I7QUFBa0Q7QUFBQyxHQUFwVixFQUFxVkMsRUFBRXFNLFdBQUYsR0FBYyxVQUFTM3VCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsUUFBRyxXQUFTYSxFQUFFeUksTUFBRixDQUFTOE8sUUFBbEIsSUFBNEIsV0FBU3ZYLEVBQUV5SSxNQUFGLENBQVNyTCxJQUFqRCxFQUFzRCxPQUFPLEtBQUsrckIsYUFBTCxHQUFtQixDQUFDLENBQXBCLEVBQXNCLEtBQUssT0FBTyxLQUFLZ0YsaUJBQTlDLENBQWdFLEtBQUswQyxnQkFBTCxDQUFzQjd3QixDQUF0QixFQUF3QmIsQ0FBeEIsRUFBMkIsSUFBSVQsSUFBRW1CLFNBQVM0dEIsYUFBZixDQUE2Qi91QixLQUFHQSxFQUFFb3lCLElBQUwsSUFBV3B5QixFQUFFb3lCLElBQUYsRUFBWCxFQUFvQixLQUFLbEMsb0JBQUwsQ0FBMEI1dUIsQ0FBMUIsQ0FBcEIsRUFBaUQsS0FBS2tqQixTQUFMLENBQWUsYUFBZixFQUE2QixDQUFDbGpCLENBQUQsRUFBR2IsQ0FBSCxDQUE3QixDQUFqRDtBQUFxRixHQUFwbkIsRUFBcW5CbWpCLEVBQUV1TyxnQkFBRixHQUFtQixVQUFTN3dCLENBQVQsRUFBV3RCLENBQVgsRUFBYTtBQUFDLFNBQUtxeUIsZ0JBQUwsR0FBc0I1eEIsRUFBRWt4QixlQUFGLENBQWtCM3hCLENBQWxCLENBQXRCLENBQTJDLElBQUkyakIsSUFBRSxLQUFLMk8sOEJBQUwsQ0FBb0NoeEIsQ0FBcEMsRUFBc0N0QixDQUF0QyxDQUFOLENBQStDMmpCLEtBQUdyaUIsRUFBRTBJLGNBQUYsRUFBSDtBQUFzQixHQUF0d0IsRUFBdXdCNFosRUFBRTBPLDhCQUFGLEdBQWlDLFVBQVNoeEIsQ0FBVCxFQUFXO0FBQUMsV0FBTSxZQUFVQSxFQUFFeUksTUFBRixDQUFTOE8sUUFBekI7QUFBa0MsR0FBdDFCLEVBQXUxQitLLEVBQUVpTixXQUFGLEdBQWMsVUFBU3Z2QixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFFBQUlULElBQUUsS0FBS3V5QixnQkFBTCxDQUFzQmp4QixDQUF0QixFQUF3QmIsQ0FBeEIsQ0FBTixDQUFpQyxLQUFLK2pCLFNBQUwsQ0FBZSxhQUFmLEVBQTZCLENBQUNsakIsQ0FBRCxFQUFHYixDQUFILEVBQUtULENBQUwsQ0FBN0IsR0FBc0MsS0FBS3d5QixTQUFMLENBQWVseEIsQ0FBZixFQUFpQmIsQ0FBakIsRUFBbUJULENBQW5CLENBQXRDO0FBQTRELEdBQWg5QixFQUFpOUI0akIsRUFBRTJPLGdCQUFGLEdBQW1CLFVBQVNqeEIsQ0FBVCxFQUFXdEIsQ0FBWCxFQUFhO0FBQUMsUUFBSTJqQixJQUFFbGpCLEVBQUVreEIsZUFBRixDQUFrQjN4QixDQUFsQixDQUFOO0FBQUEsUUFBMkI0akIsSUFBRSxFQUFDdlMsR0FBRXNTLEVBQUV0UyxDQUFGLEdBQUksS0FBS2doQixnQkFBTCxDQUFzQmhoQixDQUE3QixFQUErQkcsR0FBRW1TLEVBQUVuUyxDQUFGLEdBQUksS0FBSzZnQixnQkFBTCxDQUFzQjdnQixDQUEzRCxFQUE3QixDQUEyRixPQUFNLENBQUMsS0FBS2loQixVQUFOLElBQWtCLEtBQUtDLGNBQUwsQ0FBb0I5TyxDQUFwQixDQUFsQixJQUEwQyxLQUFLK08sVUFBTCxDQUFnQnJ4QixDQUFoQixFQUFrQnRCLENBQWxCLENBQTFDLEVBQStENGpCLENBQXJFO0FBQXVFLEdBQXBwQyxFQUFxcENBLEVBQUU4TyxjQUFGLEdBQWlCLFVBQVNweEIsQ0FBVCxFQUFXO0FBQUMsV0FBTzlCLEtBQUtxUyxHQUFMLENBQVN2USxFQUFFK1AsQ0FBWCxJQUFjLENBQWQsSUFBaUI3UixLQUFLcVMsR0FBTCxDQUFTdlEsRUFBRWtRLENBQVgsSUFBYyxDQUF0QztBQUF3QyxHQUExdEMsRUFBMnRDb1MsRUFBRXdOLFNBQUYsR0FBWSxVQUFTOXZCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsU0FBSytqQixTQUFMLENBQWUsV0FBZixFQUEyQixDQUFDbGpCLENBQUQsRUFBR2IsQ0FBSCxDQUEzQixHQUFrQyxLQUFLbXlCLGNBQUwsQ0FBb0J0eEIsQ0FBcEIsRUFBc0JiLENBQXRCLENBQWxDO0FBQTJELEdBQWh6QyxFQUFpekNtakIsRUFBRWdQLGNBQUYsR0FBaUIsVUFBU3R4QixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFNBQUtneUIsVUFBTCxHQUFnQixLQUFLSSxRQUFMLENBQWN2eEIsQ0FBZCxFQUFnQmIsQ0FBaEIsQ0FBaEIsR0FBbUMsS0FBS3F5QixZQUFMLENBQWtCeHhCLENBQWxCLEVBQW9CYixDQUFwQixDQUFuQztBQUEwRCxHQUExNEMsRUFBMjRDbWpCLEVBQUUrTyxVQUFGLEdBQWEsVUFBU3J4QixDQUFULEVBQVd0QixDQUFYLEVBQWE7QUFBQyxTQUFLeXlCLFVBQUwsR0FBZ0IsQ0FBQyxDQUFqQixFQUFtQixLQUFLTSxjQUFMLEdBQW9CdHlCLEVBQUVreEIsZUFBRixDQUFrQjN4QixDQUFsQixDQUF2QyxFQUE0RCxLQUFLZ3pCLGtCQUFMLEdBQXdCLENBQUMsQ0FBckYsRUFBdUYsS0FBS0MsU0FBTCxDQUFlM3hCLENBQWYsRUFBaUJ0QixDQUFqQixDQUF2RjtBQUEyRyxHQUFqaEQsRUFBa2hENGpCLEVBQUVxUCxTQUFGLEdBQVksVUFBUzN4QixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFNBQUsrakIsU0FBTCxDQUFlLFdBQWYsRUFBMkIsQ0FBQ2xqQixDQUFELEVBQUdiLENBQUgsQ0FBM0I7QUFBa0MsR0FBOWtELEVBQStrRG1qQixFQUFFNE8sU0FBRixHQUFZLFVBQVNseEIsQ0FBVCxFQUFXYixDQUFYLEVBQWFULENBQWIsRUFBZTtBQUFDLFNBQUt5eUIsVUFBTCxJQUFpQixLQUFLUyxRQUFMLENBQWM1eEIsQ0FBZCxFQUFnQmIsQ0FBaEIsRUFBa0JULENBQWxCLENBQWpCO0FBQXNDLEdBQWpwRCxFQUFrcEQ0akIsRUFBRXNQLFFBQUYsR0FBVyxVQUFTNXhCLENBQVQsRUFBV2IsQ0FBWCxFQUFhVCxDQUFiLEVBQWU7QUFBQ3NCLE1BQUUwSSxjQUFGLElBQW1CLEtBQUt3YSxTQUFMLENBQWUsVUFBZixFQUEwQixDQUFDbGpCLENBQUQsRUFBR2IsQ0FBSCxFQUFLVCxDQUFMLENBQTFCLENBQW5CO0FBQXNELEdBQW51RCxFQUFvdUQ0akIsRUFBRWlQLFFBQUYsR0FBVyxVQUFTdnhCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsU0FBS2d5QixVQUFMLEdBQWdCLENBQUMsQ0FBakIsRUFBbUJqeEIsV0FBVyxZQUFVO0FBQUMsYUFBTyxLQUFLd3hCLGtCQUFaO0FBQStCLEtBQTFDLENBQTJDM3VCLElBQTNDLENBQWdELElBQWhELENBQVgsQ0FBbkIsRUFBcUYsS0FBSzh1QixPQUFMLENBQWE3eEIsQ0FBYixFQUFlYixDQUFmLENBQXJGO0FBQXVHLEdBQXAyRCxFQUFxMkRtakIsRUFBRXVQLE9BQUYsR0FBVSxVQUFTN3hCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsU0FBSytqQixTQUFMLENBQWUsU0FBZixFQUF5QixDQUFDbGpCLENBQUQsRUFBR2IsQ0FBSCxDQUF6QjtBQUFnQyxHQUE3NUQsRUFBODVEbWpCLEVBQUV3UCxPQUFGLEdBQVUsVUFBUzl4QixDQUFULEVBQVc7QUFBQyxTQUFLMHhCLGtCQUFMLElBQXlCMXhCLEVBQUUwSSxjQUFGLEVBQXpCO0FBQTRDLEdBQWgrRCxFQUFpK0Q0WixFQUFFa1AsWUFBRixHQUFlLFVBQVN4eEIsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxRQUFHLENBQUMsS0FBSzR5QixpQkFBTixJQUF5QixhQUFXL3hCLEVBQUU1QyxJQUF6QyxFQUE4QztBQUFDLFVBQUlzQixJQUFFc0IsRUFBRXlJLE1BQUYsQ0FBUzhPLFFBQWYsQ0FBd0IsV0FBUzdZLENBQVQsSUFBWSxjQUFZQSxDQUF4QixJQUEyQnNCLEVBQUV5SSxNQUFGLENBQVNFLEtBQVQsRUFBM0IsRUFBNEMsS0FBS3FwQixXQUFMLENBQWlCaHlCLENBQWpCLEVBQW1CYixDQUFuQixDQUE1QyxFQUFrRSxhQUFXYSxFQUFFNUMsSUFBYixLQUFvQixLQUFLMjBCLGlCQUFMLEdBQXVCLENBQUMsQ0FBeEIsRUFBMEI3eEIsV0FBVyxZQUFVO0FBQUMsZUFBTyxLQUFLNnhCLGlCQUFaO0FBQThCLE9BQXpDLENBQTBDaHZCLElBQTFDLENBQStDLElBQS9DLENBQVgsRUFBZ0UsR0FBaEUsQ0FBOUMsQ0FBbEU7QUFBc0w7QUFBQyxHQUE1dkUsRUFBNnZFdWYsRUFBRTBQLFdBQUYsR0FBYyxVQUFTaHlCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsU0FBSytqQixTQUFMLENBQWUsYUFBZixFQUE2QixDQUFDbGpCLENBQUQsRUFBR2IsQ0FBSCxDQUE3QjtBQUFvQyxHQUE3ekUsRUFBOHpFa2pCLEVBQUVnTyxlQUFGLEdBQWtCbHhCLEVBQUVreEIsZUFBbDFFLEVBQWsyRWhPLENBQXoyRTtBQUEyMkUsQ0FBeHpGLENBQXJ0eEIsRUFBK2czQixVQUFTcmlCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsZ0JBQVksT0FBT3NkLE1BQW5CLElBQTJCQSxPQUFPQyxHQUFsQyxHQUFzQ0QsT0FBTyxrQkFBUCxFQUEwQixDQUFDLFlBQUQsRUFBYyx1QkFBZCxFQUFzQyxzQkFBdEMsQ0FBMUIsRUFBd0YsVUFBUy9kLENBQVQsRUFBVzJqQixDQUFYLEVBQWFDLENBQWIsRUFBZTtBQUFDLFdBQU9uakIsRUFBRWEsQ0FBRixFQUFJdEIsQ0FBSixFQUFNMmpCLENBQU4sRUFBUUMsQ0FBUixDQUFQO0FBQWtCLEdBQTFILENBQXRDLEdBQWtLLG9CQUFpQjlGLE1BQWpCLHlDQUFpQkEsTUFBakIsTUFBeUJBLE9BQU9ELE9BQWhDLEdBQXdDQyxPQUFPRCxPQUFQLEdBQWVwZCxFQUFFYSxDQUFGLEVBQUlnaUIsUUFBUSxZQUFSLENBQUosRUFBMEJBLFFBQVEsWUFBUixDQUExQixFQUFnREEsUUFBUSxnQkFBUixDQUFoRCxDQUF2RCxHQUFrSWhpQixFQUFFdW1CLFFBQUYsR0FBV3BuQixFQUFFYSxDQUFGLEVBQUlBLEVBQUV1bUIsUUFBTixFQUFldm1CLEVBQUVzd0IsVUFBakIsRUFBNEJ0d0IsRUFBRXdsQixZQUE5QixDQUEvUztBQUEyVixDQUF6VyxDQUEwVzdqQixNQUExVyxFQUFpWCxVQUFTM0IsQ0FBVCxFQUFXYixDQUFYLEVBQWFULENBQWIsRUFBZTJqQixDQUFmLEVBQWlCO0FBQUMsV0FBU0MsQ0FBVCxHQUFZO0FBQUMsV0FBTSxFQUFDdlMsR0FBRS9QLEVBQUUyRixXQUFMLEVBQWlCdUssR0FBRWxRLEVBQUV5RixXQUFyQixFQUFOO0FBQXdDLEtBQUVpQyxNQUFGLENBQVN2SSxFQUFFZ1YsUUFBWCxFQUFvQixFQUFDOGQsV0FBVSxDQUFDLENBQVosRUFBY0MsZUFBYyxDQUE1QixFQUFwQixHQUFvRC95QixFQUFFb3JCLGFBQUYsQ0FBZ0IvdEIsSUFBaEIsQ0FBcUIsYUFBckIsQ0FBcEQsQ0FBd0YsSUFBSTBsQixJQUFFL2lCLEVBQUVrQyxTQUFSLENBQWtCZ2hCLEVBQUUzYSxNQUFGLENBQVN3YSxDQUFULEVBQVd4akIsRUFBRTJDLFNBQWIsRUFBd0IsSUFBSW1oQixJQUFFLGlCQUFnQjNpQixRQUF0QjtBQUFBLE1BQStCc2lCLElBQUUsQ0FBQyxDQUFsQyxDQUFvQ0QsRUFBRWlRLFdBQUYsR0FBYyxZQUFVO0FBQUMsU0FBSzNwQixFQUFMLENBQVEsVUFBUixFQUFtQixLQUFLNHBCLFFBQXhCLEdBQWtDLEtBQUs1cEIsRUFBTCxDQUFRLFVBQVIsRUFBbUIsS0FBSzZwQixhQUF4QixDQUFsQyxFQUF5RSxLQUFLN3BCLEVBQUwsQ0FBUSxvQkFBUixFQUE2QixLQUFLOHBCLHVCQUFsQyxDQUF6RSxFQUFvSSxLQUFLOXBCLEVBQUwsQ0FBUSxZQUFSLEVBQXFCLEtBQUsrcEIsVUFBMUIsQ0FBcEksRUFBMEsvUCxLQUFHLENBQUNMLENBQUosS0FBUW5pQixFQUFFeVEsZ0JBQUYsQ0FBbUIsV0FBbkIsRUFBK0IsWUFBVSxDQUFFLENBQTNDLEdBQTZDMFIsSUFBRSxDQUFDLENBQXhELENBQTFLO0FBQXFPLEdBQTlQLEVBQStQRCxFQUFFa1EsUUFBRixHQUFXLFlBQVU7QUFBQyxTQUFLaGtCLE9BQUwsQ0FBYTZqQixTQUFiLElBQXdCLENBQUMsS0FBS08sV0FBOUIsS0FBNEMsS0FBS3R1QixPQUFMLENBQWF5YyxTQUFiLENBQXVCRSxHQUF2QixDQUEyQixjQUEzQixHQUEyQyxLQUFLK1AsT0FBTCxHQUFhLENBQUMsS0FBS2xHLFFBQU4sQ0FBeEQsRUFBd0UsS0FBSzZGLFdBQUwsRUFBeEUsRUFBMkYsS0FBS2lDLFdBQUwsR0FBaUIsQ0FBQyxDQUF6SjtBQUE0SixHQUFqYixFQUFrYnRRLEVBQUVxUSxVQUFGLEdBQWEsWUFBVTtBQUFDLFNBQUtDLFdBQUwsS0FBbUIsS0FBS3R1QixPQUFMLENBQWF5YyxTQUFiLENBQXVCQyxNQUF2QixDQUE4QixjQUE5QixHQUE4QyxLQUFLNlAsYUFBTCxFQUE5QyxFQUFtRSxPQUFPLEtBQUsrQixXQUFsRztBQUErRyxHQUF6akIsRUFBMGpCdFEsRUFBRW1RLGFBQUYsR0FBZ0IsWUFBVTtBQUFDLFdBQU8sS0FBS2pKLGVBQVo7QUFBNEIsR0FBam5CLEVBQWtuQmxILEVBQUVvUSx1QkFBRixHQUEwQixVQUFTdHlCLENBQVQsRUFBVztBQUFDQSxNQUFFMEksY0FBRixJQUFtQixLQUFLK3BCLGdCQUFMLENBQXNCenlCLENBQXRCLENBQW5CO0FBQTRDLEdBQXBzQixDQUFxc0IsSUFBSW9pQixJQUFFLEVBQUNzUSxVQUFTLENBQUMsQ0FBWCxFQUFhQyxPQUFNLENBQUMsQ0FBcEIsRUFBc0JDLFFBQU8sQ0FBQyxDQUE5QixFQUFOO0FBQUEsTUFBdUNyUSxJQUFFLEVBQUNzUSxPQUFNLENBQUMsQ0FBUixFQUFVQyxVQUFTLENBQUMsQ0FBcEIsRUFBc0J6RSxRQUFPLENBQUMsQ0FBOUIsRUFBZ0MwRSxRQUFPLENBQUMsQ0FBeEMsRUFBMENDLE9BQU0sQ0FBQyxDQUFqRCxFQUFtREMsTUFBSyxDQUFDLENBQXpELEVBQXpDLENBQXFHL1EsRUFBRXlNLFdBQUYsR0FBYyxVQUFTeHZCLENBQVQsRUFBV1QsQ0FBWCxFQUFhO0FBQUMsUUFBSTJqQixJQUFFRCxFQUFFampCLEVBQUVzSixNQUFGLENBQVM4TyxRQUFYLEtBQXNCLENBQUNnTCxFQUFFcGpCLEVBQUVzSixNQUFGLENBQVNyTCxJQUFYLENBQTdCLENBQThDLElBQUdpbEIsQ0FBSCxFQUFLLE9BQU8sS0FBSzhHLGFBQUwsR0FBbUIsQ0FBQyxDQUFwQixFQUFzQixLQUFLLE9BQU8sS0FBS2dGLGlCQUE5QyxDQUFnRSxLQUFLMEMsZ0JBQUwsQ0FBc0IxeEIsQ0FBdEIsRUFBd0JULENBQXhCLEVBQTJCLElBQUl3akIsSUFBRXJpQixTQUFTNHRCLGFBQWYsQ0FBNkJ2TCxLQUFHQSxFQUFFNE8sSUFBTCxJQUFXNU8sS0FBRyxLQUFLaGUsT0FBbkIsSUFBNEJnZSxLQUFHcmlCLFNBQVMwRixJQUF4QyxJQUE4QzJjLEVBQUU0TyxJQUFGLEVBQTlDLEVBQXVELEtBQUsyQixnQkFBTCxDQUFzQnR6QixDQUF0QixDQUF2RCxFQUFnRixLQUFLMHFCLEtBQUwsR0FBVyxLQUFLOVosQ0FBaEcsRUFBa0csS0FBSzJhLFFBQUwsQ0FBYy9KLFNBQWQsQ0FBd0JFLEdBQXhCLENBQTRCLGlCQUE1QixDQUFsRyxFQUFpSixLQUFLK04sb0JBQUwsQ0FBMEJ6dkIsQ0FBMUIsQ0FBakosRUFBOEssS0FBSyt6QixpQkFBTCxHQUF1QjVRLEdBQXJNLEVBQXlNdGlCLEVBQUV5USxnQkFBRixDQUFtQixRQUFuQixFQUE0QixJQUE1QixDQUF6TSxFQUEyTyxLQUFLdUIsYUFBTCxDQUFtQixhQUFuQixFQUFpQzdTLENBQWpDLEVBQW1DLENBQUNULENBQUQsQ0FBbkMsQ0FBM087QUFBbVIsR0FBMWQsQ0FBMmQsSUFBSStqQixJQUFFLEVBQUNwUixZQUFXLENBQUMsQ0FBYixFQUFlMGQsZUFBYyxDQUFDLENBQTlCLEVBQU47QUFBQSxNQUF1Q3BNLElBQUUsRUFBQ2dRLE9BQU0sQ0FBQyxDQUFSLEVBQVVRLFFBQU8sQ0FBQyxDQUFsQixFQUF6QyxDQUE4RCxPQUFPalIsRUFBRXVRLGdCQUFGLEdBQW1CLFVBQVN0ekIsQ0FBVCxFQUFXO0FBQUMsUUFBRyxLQUFLaVAsT0FBTCxDQUFhNmIsYUFBYixJQUE0QixDQUFDeEgsRUFBRXRqQixFQUFFL0IsSUFBSixDQUE3QixJQUF3QyxDQUFDdWxCLEVBQUV4akIsRUFBRXNKLE1BQUYsQ0FBUzhPLFFBQVgsQ0FBNUMsRUFBaUU7QUFBQyxVQUFJN1ksSUFBRXNCLEVBQUV5RixXQUFSLENBQW9CLEtBQUt2QixPQUFMLENBQWF5RSxLQUFiLElBQXFCM0ksRUFBRXlGLFdBQUYsSUFBZS9HLENBQWYsSUFBa0JzQixFQUFFb3pCLFFBQUYsQ0FBV3B6QixFQUFFMkYsV0FBYixFQUF5QmpILENBQXpCLENBQXZDO0FBQW1FO0FBQUMsR0FBekwsRUFBMEx3akIsRUFBRThPLDhCQUFGLEdBQWlDLFVBQVNoeEIsQ0FBVCxFQUFXO0FBQUMsUUFBSWIsSUFBRSxnQkFBY2EsRUFBRTVDLElBQXRCO0FBQUEsUUFBMkJzQixJQUFFc0IsRUFBRXlJLE1BQUYsQ0FBUzhPLFFBQXRDLENBQStDLE9BQU0sQ0FBQ3BZLENBQUQsSUFBSSxZQUFVVCxDQUFwQjtBQUFzQixHQUE1UyxFQUE2U3dqQixFQUFFa1AsY0FBRixHQUFpQixVQUFTcHhCLENBQVQsRUFBVztBQUFDLFdBQU85QixLQUFLcVMsR0FBTCxDQUFTdlEsRUFBRStQLENBQVgsSUFBYyxLQUFLM0IsT0FBTCxDQUFhOGpCLGFBQWxDO0FBQWdELEdBQTFYLEVBQTJYaFEsRUFBRTROLFNBQUYsR0FBWSxVQUFTOXZCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsV0FBTyxLQUFLazBCLGdCQUFaLEVBQTZCLEtBQUszSSxRQUFMLENBQWMvSixTQUFkLENBQXdCQyxNQUF4QixDQUErQixpQkFBL0IsQ0FBN0IsRUFBK0UsS0FBSzVPLGFBQUwsQ0FBbUIsV0FBbkIsRUFBK0JoUyxDQUEvQixFQUFpQyxDQUFDYixDQUFELENBQWpDLENBQS9FLEVBQXFILEtBQUtteUIsY0FBTCxDQUFvQnR4QixDQUFwQixFQUFzQmIsQ0FBdEIsQ0FBckg7QUFBOEksR0FBbmlCLEVBQW9pQitpQixFQUFFNk4sV0FBRixHQUFjLFlBQVU7QUFBQy92QixNQUFFNlAsbUJBQUYsQ0FBc0IsUUFBdEIsRUFBK0IsSUFBL0IsR0FBcUMsT0FBTyxLQUFLcWpCLGlCQUFqRDtBQUFtRSxHQUFob0IsRUFBaW9CaFIsRUFBRXlQLFNBQUYsR0FBWSxVQUFTeHlCLENBQVQsRUFBV1QsQ0FBWCxFQUFhO0FBQUMsU0FBSzQwQixpQkFBTCxHQUF1QixLQUFLdmpCLENBQTVCLEVBQThCLEtBQUtpWSxjQUFMLEVBQTlCLEVBQW9EaG9CLEVBQUU2UCxtQkFBRixDQUFzQixRQUF0QixFQUErQixJQUEvQixDQUFwRCxFQUF5RixLQUFLbUMsYUFBTCxDQUFtQixXQUFuQixFQUErQjdTLENBQS9CLEVBQWlDLENBQUNULENBQUQsQ0FBakMsQ0FBekY7QUFBK0gsR0FBMXhCLEVBQTJ4QndqQixFQUFFcU4sV0FBRixHQUFjLFVBQVN2dkIsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxRQUFJVCxJQUFFLEtBQUt1eUIsZ0JBQUwsQ0FBc0JqeEIsQ0FBdEIsRUFBd0JiLENBQXhCLENBQU4sQ0FBaUMsS0FBSzZTLGFBQUwsQ0FBbUIsYUFBbkIsRUFBaUNoUyxDQUFqQyxFQUFtQyxDQUFDYixDQUFELEVBQUdULENBQUgsQ0FBbkMsR0FBMEMsS0FBS3d5QixTQUFMLENBQWVseEIsQ0FBZixFQUFpQmIsQ0FBakIsRUFBbUJULENBQW5CLENBQTFDO0FBQWdFLEdBQXg1QixFQUF5NUJ3akIsRUFBRTBQLFFBQUYsR0FBVyxVQUFTNXhCLENBQVQsRUFBV2IsQ0FBWCxFQUFhVCxDQUFiLEVBQWU7QUFBQ3NCLE1BQUUwSSxjQUFGLElBQW1CLEtBQUs2cUIsYUFBTCxHQUFtQixLQUFLMUosS0FBM0MsQ0FBaUQsSUFBSXhILElBQUUsS0FBS2pVLE9BQUwsQ0FBYXdhLFdBQWIsR0FBeUIsQ0FBQyxDQUExQixHQUE0QixDQUFsQztBQUFBLFFBQW9DdEcsSUFBRSxLQUFLZ1IsaUJBQUwsR0FBdUI1MEIsRUFBRXFSLENBQUYsR0FBSXNTLENBQWpFLENBQW1FLElBQUcsQ0FBQyxLQUFLalUsT0FBTCxDQUFhcWEsVUFBZCxJQUEwQixLQUFLSyxNQUFMLENBQVk5cUIsTUFBekMsRUFBZ0Q7QUFBQyxVQUFJa2tCLElBQUVoa0IsS0FBS3dFLEdBQUwsQ0FBUyxDQUFDLEtBQUtvbUIsTUFBTCxDQUFZLENBQVosRUFBZXJnQixNQUF6QixFQUFnQyxLQUFLNnFCLGlCQUFyQyxDQUFOLENBQThEaFIsSUFBRUEsSUFBRUosQ0FBRixHQUFJLE1BQUlJLElBQUVKLENBQU4sQ0FBSixHQUFhSSxDQUFmLENBQWlCLElBQUlFLElBQUV0a0IsS0FBSzZjLEdBQUwsQ0FBUyxDQUFDLEtBQUt3USxZQUFMLEdBQW9COWlCLE1BQTlCLEVBQXFDLEtBQUs2cUIsaUJBQTFDLENBQU4sQ0FBbUVoUixJQUFFQSxJQUFFRSxDQUFGLEdBQUksTUFBSUYsSUFBRUUsQ0FBTixDQUFKLEdBQWFGLENBQWY7QUFBaUIsVUFBS3VILEtBQUwsR0FBV3ZILENBQVgsRUFBYSxLQUFLa1IsWUFBTCxHQUFrQixJQUFJM3hCLElBQUosRUFBL0IsRUFBd0MsS0FBS21RLGFBQUwsQ0FBbUIsVUFBbkIsRUFBOEJoUyxDQUE5QixFQUFnQyxDQUFDYixDQUFELEVBQUdULENBQUgsQ0FBaEMsQ0FBeEM7QUFBK0UsR0FBMzBDLEVBQTQwQ3dqQixFQUFFMlAsT0FBRixHQUFVLFVBQVM3eEIsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxTQUFLaVAsT0FBTCxDQUFhcWxCLFVBQWIsS0FBMEIsS0FBS3JLLGVBQUwsR0FBcUIsQ0FBQyxDQUFoRCxFQUFtRCxJQUFJMXFCLElBQUUsS0FBS2cxQixvQkFBTCxFQUFOLENBQWtDLElBQUcsS0FBS3RsQixPQUFMLENBQWFxbEIsVUFBYixJQUF5QixDQUFDLEtBQUtybEIsT0FBTCxDQUFhcWEsVUFBMUMsRUFBcUQ7QUFBQyxVQUFJcEcsSUFBRSxLQUFLdUgsa0JBQUwsRUFBTixDQUFnQyxLQUFLUixlQUFMLEdBQXFCLENBQUMvRyxDQUFELEdBQUcsS0FBS3lHLE1BQUwsQ0FBWSxDQUFaLEVBQWVyZ0IsTUFBbEIsSUFBMEIsQ0FBQzRaLENBQUQsR0FBRyxLQUFLa0osWUFBTCxHQUFvQjlpQixNQUF0RTtBQUE2RSxLQUFuSyxNQUF3SyxLQUFLMkYsT0FBTCxDQUFhcWxCLFVBQWIsSUFBeUIvMEIsS0FBRyxLQUFLK3JCLGFBQWpDLEtBQWlEL3JCLEtBQUcsS0FBS2kxQixrQkFBTCxFQUFwRCxFQUErRSxPQUFPLEtBQUtKLGFBQVosRUFBMEIsS0FBSy9HLFlBQUwsR0FBa0IsS0FBS3BlLE9BQUwsQ0FBYXFhLFVBQXpELEVBQW9FLEtBQUtmLE1BQUwsQ0FBWWhwQixDQUFaLENBQXBFLEVBQW1GLE9BQU8sS0FBSzh0QixZQUEvRixFQUE0RyxLQUFLeGEsYUFBTCxDQUFtQixTQUFuQixFQUE2QmhTLENBQTdCLEVBQStCLENBQUNiLENBQUQsQ0FBL0IsQ0FBNUc7QUFBZ0osR0FBaDBELEVBQWkwRCtpQixFQUFFd1Isb0JBQUYsR0FBdUIsWUFBVTtBQUN6eCtCLFFBQUkxekIsSUFBRSxLQUFLNHBCLGtCQUFMLEVBQU47QUFBQSxRQUFnQ3pxQixJQUFFakIsS0FBS3FTLEdBQUwsQ0FBUyxLQUFLcWpCLGdCQUFMLENBQXNCLENBQUM1ekIsQ0FBdkIsRUFBeUIsS0FBS3lxQixhQUE5QixDQUFULENBQWxDO0FBQUEsUUFBeUYvckIsSUFBRSxLQUFLbTFCLGtCQUFMLENBQXdCN3pCLENBQXhCLEVBQTBCYixDQUExQixFQUE0QixDQUE1QixDQUEzRjtBQUFBLFFBQTBIa2pCLElBQUUsS0FBS3dSLGtCQUFMLENBQXdCN3pCLENBQXhCLEVBQTBCYixDQUExQixFQUE0QixDQUFDLENBQTdCLENBQTVIO0FBQUEsUUFBNEptakIsSUFBRTVqQixFQUFFbzFCLFFBQUYsR0FBV3pSLEVBQUV5UixRQUFiLEdBQXNCcDFCLEVBQUVxMUIsS0FBeEIsR0FBOEIxUixFQUFFMFIsS0FBOUwsQ0FBb00sT0FBT3pSLENBQVA7QUFBUyxHQUQwdTZCLEVBQ3p1NkJKLEVBQUUyUixrQkFBRixHQUFxQixVQUFTN3pCLENBQVQsRUFBV2IsQ0FBWCxFQUFhVCxDQUFiLEVBQWU7QUFBQyxTQUFJLElBQUkyakIsSUFBRSxLQUFLb0ksYUFBWCxFQUF5Qm5JLElBQUUsSUFBRSxDQUE3QixFQUErQkosSUFBRSxLQUFLOVQsT0FBTCxDQUFhaWUsT0FBYixJQUFzQixDQUFDLEtBQUtqZSxPQUFMLENBQWFxYSxVQUFwQyxHQUErQyxVQUFTem9CLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsYUFBT2EsS0FBR2IsQ0FBVjtBQUFZLEtBQXpFLEdBQTBFLFVBQVNhLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsYUFBT2EsSUFBRWIsQ0FBVDtBQUFXLEtBQXhJLEVBQXlJK2lCLEVBQUUvaUIsQ0FBRixFQUFJbWpCLENBQUosTUFBU0QsS0FBRzNqQixDQUFILEVBQUs0akIsSUFBRW5qQixDQUFQLEVBQVNBLElBQUUsS0FBS3kwQixnQkFBTCxDQUFzQixDQUFDNXpCLENBQXZCLEVBQXlCcWlCLENBQXpCLENBQVgsRUFBdUMsU0FBT2xqQixDQUF2RCxDQUF6STtBQUFvTUEsVUFBRWpCLEtBQUtxUyxHQUFMLENBQVNwUixDQUFULENBQUY7QUFBcE0sS0FBa04sT0FBTSxFQUFDMjBCLFVBQVN4UixDQUFWLEVBQVl5UixPQUFNMVIsSUFBRTNqQixDQUFwQixFQUFOO0FBQTZCLEdBRHE5NUIsRUFDcDk1QndqQixFQUFFMFIsZ0JBQUYsR0FBbUIsVUFBUzV6QixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFFBQUlULElBQUUsS0FBS29xQixNQUFMLENBQVk5cUIsTUFBbEI7QUFBQSxRQUF5QnNrQixJQUFFLEtBQUtsVSxPQUFMLENBQWFxYSxVQUFiLElBQXlCL3BCLElBQUUsQ0FBdEQ7QUFBQSxRQUF3RHdqQixJQUFFSSxJQUFFRCxFQUFFb0QsTUFBRixDQUFTdG1CLENBQVQsRUFBV1QsQ0FBWCxDQUFGLEdBQWdCUyxDQUExRTtBQUFBLFFBQTRFcWpCLElBQUUsS0FBS3NHLE1BQUwsQ0FBWTVHLENBQVosQ0FBOUUsQ0FBNkYsSUFBRyxDQUFDTSxDQUFKLEVBQU0sT0FBTyxJQUFQLENBQVksSUFBSUwsSUFBRUcsSUFBRSxLQUFLNkUsY0FBTCxHQUFvQmpwQixLQUFLODFCLEtBQUwsQ0FBVzcwQixJQUFFVCxDQUFiLENBQXRCLEdBQXNDLENBQTVDLENBQThDLE9BQU9zQixLQUFHd2lCLEVBQUUvWixNQUFGLEdBQVMwWixDQUFaLENBQVA7QUFBc0IsR0FEZ3c1QixFQUMvdjVCRCxFQUFFeVIsa0JBQUYsR0FBcUIsWUFBVTtBQUFDLFFBQUcsS0FBSyxDQUFMLEtBQVMsS0FBS0osYUFBZCxJQUE2QixDQUFDLEtBQUtDLFlBQW5DLElBQWlELElBQUkzeEIsSUFBSixLQUFTLEtBQUsyeEIsWUFBZCxHQUEyQixHQUEvRSxFQUFtRixPQUFPLENBQVAsQ0FBUyxJQUFJeHpCLElBQUUsS0FBSzR6QixnQkFBTCxDQUFzQixDQUFDLEtBQUsvSixLQUE1QixFQUFrQyxLQUFLWSxhQUF2QyxDQUFOO0FBQUEsUUFBNER0ckIsSUFBRSxLQUFLbzBCLGFBQUwsR0FBbUIsS0FBSzFKLEtBQXRGLENBQTRGLE9BQU83cEIsSUFBRSxDQUFGLElBQUtiLElBQUUsQ0FBUCxHQUFTLENBQVQsR0FBV2EsSUFBRSxDQUFGLElBQUtiLElBQUUsQ0FBUCxHQUFTLENBQUMsQ0FBVixHQUFZLENBQTlCO0FBQWdDLEdBRHVnNUIsRUFDdGc1QitpQixFQUFFOFAsV0FBRixHQUFjLFVBQVNoeUIsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxRQUFJVCxJQUFFLEtBQUt1dUIsYUFBTCxDQUFtQmp0QixFQUFFeUksTUFBckIsQ0FBTjtBQUFBLFFBQW1DNFosSUFBRTNqQixLQUFHQSxFQUFFd0YsT0FBMUM7QUFBQSxRQUFrRG9lLElBQUU1akIsS0FBRyxLQUFLNG9CLEtBQUwsQ0FBVzNxQixPQUFYLENBQW1CK0IsQ0FBbkIsQ0FBdkQsQ0FBNkUsS0FBS3NULGFBQUwsQ0FBbUIsYUFBbkIsRUFBaUNoUyxDQUFqQyxFQUFtQyxDQUFDYixDQUFELEVBQUdrakIsQ0FBSCxFQUFLQyxDQUFMLENBQW5DO0FBQTRDLEdBRGkzNEIsRUFDaDM0QkosRUFBRStSLFFBQUYsR0FBVyxZQUFVO0FBQUMsUUFBSWowQixJQUFFc2lCLEdBQU47QUFBQSxRQUFVbmpCLElBQUUsS0FBSyt6QixpQkFBTCxDQUF1Qm5qQixDQUF2QixHQUF5Qi9QLEVBQUUrUCxDQUF2QztBQUFBLFFBQXlDclIsSUFBRSxLQUFLdzBCLGlCQUFMLENBQXVCaGpCLENBQXZCLEdBQXlCbFEsRUFBRWtRLENBQXRFLENBQXdFLENBQUNoUyxLQUFLcVMsR0FBTCxDQUFTcFIsQ0FBVCxJQUFZLENBQVosSUFBZWpCLEtBQUtxUyxHQUFMLENBQVM3UixDQUFULElBQVksQ0FBNUIsS0FBZ0MsS0FBS214QixZQUFMLEVBQWhDO0FBQW9ELEdBRDh0NEIsRUFDN3Q0QjF3QixDQURzdDRCO0FBQ3B0NEIsQ0FEbXowQixDQUEvZzNCLEVBQzh0QyxVQUFTYSxDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLGdCQUFZLE9BQU9zZCxNQUFuQixJQUEyQkEsT0FBT0MsR0FBbEMsR0FBc0NELE9BQU8sMkJBQVAsRUFBbUMsQ0FBQyx1QkFBRCxDQUFuQyxFQUE2RCxVQUFTL2QsQ0FBVCxFQUFXO0FBQUMsV0FBT1MsRUFBRWEsQ0FBRixFQUFJdEIsQ0FBSixDQUFQO0FBQWMsR0FBdkYsQ0FBdEMsR0FBK0gsb0JBQWlCOGQsTUFBakIseUNBQWlCQSxNQUFqQixNQUF5QkEsT0FBT0QsT0FBaEMsR0FBd0NDLE9BQU9ELE9BQVAsR0FBZXBkLEVBQUVhLENBQUYsRUFBSWdpQixRQUFRLFlBQVIsQ0FBSixDQUF2RCxHQUFrRmhpQixFQUFFazBCLFdBQUYsR0FBYy8wQixFQUFFYSxDQUFGLEVBQUlBLEVBQUUydEIsVUFBTixDQUEvTjtBQUFpUCxDQUEvUCxDQUFnUWhzQixNQUFoUSxFQUF1USxVQUFTM0IsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxXQUFTVCxDQUFULENBQVdzQixDQUFYLEVBQWE7QUFBQyxTQUFLbTBCLE9BQUwsQ0FBYW4wQixDQUFiO0FBQWdCLE9BQUlxaUIsSUFBRTNqQixFQUFFMkMsU0FBRixHQUFZMUQsT0FBTzhvQixNQUFQLENBQWN0bkIsRUFBRWtDLFNBQWhCLENBQWxCLENBQTZDLE9BQU9naEIsRUFBRThSLE9BQUYsR0FBVSxVQUFTbjBCLENBQVQsRUFBVztBQUFDQSxVQUFJLEtBQUtvMEIsU0FBTCxJQUFpQixLQUFLQyxVQUFMLEdBQWdCcjBCLENBQWpDLEVBQW1DLEtBQUs2dEIsZUFBTCxDQUFxQjd0QixDQUFyQixFQUF1QixDQUFDLENBQXhCLENBQXZDO0FBQW1FLEdBQXpGLEVBQTBGcWlCLEVBQUUrUixTQUFGLEdBQVksWUFBVTtBQUFDLFNBQUtDLFVBQUwsS0FBa0IsS0FBS3hHLGVBQUwsQ0FBcUIsS0FBS3dHLFVBQTFCLEVBQXFDLENBQUMsQ0FBdEMsR0FBeUMsT0FBTyxLQUFLQSxVQUF2RTtBQUFtRixHQUFwTSxFQUFxTWhTLEVBQUV5TixTQUFGLEdBQVksVUFBU3B4QixDQUFULEVBQVcyakIsQ0FBWCxFQUFhO0FBQUMsUUFBRyxDQUFDLEtBQUswUCxpQkFBTixJQUF5QixhQUFXcnpCLEVBQUV0QixJQUF6QyxFQUE4QztBQUFDLFVBQUlrbEIsSUFBRW5qQixFQUFFa3hCLGVBQUYsQ0FBa0JoTyxDQUFsQixDQUFOO0FBQUEsVUFBMkJILElBQUUsS0FBS21TLFVBQUwsQ0FBZ0JsdkIscUJBQWhCLEVBQTdCO0FBQUEsVUFBcUVxZCxJQUFFeGlCLEVBQUUyRixXQUF6RTtBQUFBLFVBQXFGd2MsSUFBRW5pQixFQUFFeUYsV0FBekY7QUFBQSxVQUFxRzJjLElBQUVFLEVBQUV2UyxDQUFGLElBQUttUyxFQUFFemQsSUFBRixHQUFPK2QsQ0FBWixJQUFlRixFQUFFdlMsQ0FBRixJQUFLbVMsRUFBRXhkLEtBQUYsR0FBUThkLENBQTVCLElBQStCRixFQUFFcFMsQ0FBRixJQUFLZ1MsRUFBRTNkLEdBQUYsR0FBTTRkLENBQTFDLElBQTZDRyxFQUFFcFMsQ0FBRixJQUFLZ1MsRUFBRTFkLE1BQUYsR0FBUzJkLENBQWxLLENBQW9LLElBQUdDLEtBQUcsS0FBS2MsU0FBTCxDQUFlLEtBQWYsRUFBcUIsQ0FBQ3hrQixDQUFELEVBQUcyakIsQ0FBSCxDQUFyQixDQUFILEVBQStCLGFBQVczakIsRUFBRXRCLElBQS9DLEVBQW9EO0FBQUMsYUFBSzIwQixpQkFBTCxHQUF1QixDQUFDLENBQXhCLENBQTBCLElBQUl4UCxJQUFFLElBQU4sQ0FBV3JpQixXQUFXLFlBQVU7QUFBQyxpQkFBT3FpQixFQUFFd1AsaUJBQVQ7QUFBMkIsU0FBakQsRUFBa0QsR0FBbEQ7QUFBdUQ7QUFBQztBQUFDLEdBQXJrQixFQUFza0IxUCxFQUFFUixPQUFGLEdBQVUsWUFBVTtBQUFDLFNBQUtrTyxXQUFMLElBQW1CLEtBQUtxRSxTQUFMLEVBQW5CO0FBQW9DLEdBQS9uQixFQUFnb0IxMUIsQ0FBdm9CO0FBQXlvQixDQUF6K0IsQ0FEOXRDLEVBQ3lzRSxVQUFTc0IsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxnQkFBWSxPQUFPc2QsTUFBbkIsSUFBMkJBLE9BQU9DLEdBQWxDLEdBQXNDRCxPQUFPLDhCQUFQLEVBQXNDLENBQUMsWUFBRCxFQUFjLDJCQUFkLEVBQTBDLHNCQUExQyxDQUF0QyxFQUF3RyxVQUFTL2QsQ0FBVCxFQUFXMmpCLENBQVgsRUFBYUMsQ0FBYixFQUFlO0FBQUMsV0FBT25qQixFQUFFYSxDQUFGLEVBQUl0QixDQUFKLEVBQU0yakIsQ0FBTixFQUFRQyxDQUFSLENBQVA7QUFBa0IsR0FBMUksQ0FBdEMsR0FBa0wsb0JBQWlCOUYsTUFBakIseUNBQWlCQSxNQUFqQixNQUF5QkEsT0FBT0QsT0FBaEMsR0FBd0NDLE9BQU9ELE9BQVAsR0FBZXBkLEVBQUVhLENBQUYsRUFBSWdpQixRQUFRLFlBQVIsQ0FBSixFQUEwQkEsUUFBUSxjQUFSLENBQTFCLEVBQWtEQSxRQUFRLGdCQUFSLENBQWxELENBQXZELEdBQW9JN2lCLEVBQUVhLENBQUYsRUFBSUEsRUFBRXVtQixRQUFOLEVBQWV2bUIsRUFBRWswQixXQUFqQixFQUE2QmwwQixFQUFFd2xCLFlBQS9CLENBQXRUO0FBQW1XLENBQWpYLENBQWtYN2pCLE1BQWxYLEVBQXlYLFVBQVMzQixDQUFULEVBQVdiLENBQVgsRUFBYVQsQ0FBYixFQUFlMmpCLENBQWYsRUFBaUI7QUFBQztBQUFhLFdBQVNDLENBQVQsQ0FBV3RpQixDQUFYLEVBQWFiLENBQWIsRUFBZTtBQUFDLFNBQUttMUIsU0FBTCxHQUFldDBCLENBQWYsRUFBaUIsS0FBS21FLE1BQUwsR0FBWWhGLENBQTdCLEVBQStCLEtBQUs2cUIsT0FBTCxFQUEvQjtBQUE4QyxZQUFTOUgsQ0FBVCxDQUFXbGlCLENBQVgsRUFBYTtBQUFDLFdBQU0sWUFBVSxPQUFPQSxDQUFqQixHQUFtQkEsQ0FBbkIsR0FBcUIsT0FBS0EsRUFBRXUwQixFQUFQLEdBQVUsUUFBVixHQUFtQnYwQixFQUFFdzBCLEVBQXJCLEdBQXdCLEdBQXhCLElBQTZCeDBCLEVBQUV5MEIsRUFBRixHQUFLLEVBQWxDLElBQXNDLEtBQXRDLEdBQTRDejBCLEVBQUUwMEIsRUFBOUMsR0FBaUQsR0FBakQsSUFBc0QxMEIsRUFBRTIwQixFQUFGLEdBQUssRUFBM0QsSUFBK0QsS0FBL0QsR0FBcUUzMEIsRUFBRTQwQixFQUF2RSxHQUEwRSxTQUExRSxHQUFvRjUwQixFQUFFMDBCLEVBQXRGLEdBQXlGLEdBQXpGLElBQThGLEtBQUcxMEIsRUFBRTIwQixFQUFuRyxJQUF1RyxLQUF2RyxHQUE2RzMwQixFQUFFdzBCLEVBQS9HLEdBQWtILEdBQWxILElBQXVILEtBQUd4MEIsRUFBRXkwQixFQUE1SCxJQUFnSSxJQUEzSjtBQUFnSyxPQUFJalMsSUFBRSw0QkFBTixDQUFtQ0YsRUFBRWpoQixTQUFGLEdBQVksSUFBSTNDLENBQUosRUFBWixFQUFrQjRqQixFQUFFamhCLFNBQUYsQ0FBWTJvQixPQUFaLEdBQW9CLFlBQVU7QUFBQyxTQUFLNkssU0FBTCxHQUFlLENBQUMsQ0FBaEIsRUFBa0IsS0FBS0MsVUFBTCxHQUFnQixLQUFLUixTQUFMLElBQWdCLENBQUMsQ0FBbkQsQ0FBcUQsSUFBSXQwQixJQUFFLEtBQUttRSxNQUFMLENBQVlpSyxPQUFaLENBQW9Cd2EsV0FBcEIsR0FBZ0MsQ0FBaEMsR0FBa0MsQ0FBQyxDQUF6QyxDQUEyQyxLQUFLbU0sTUFBTCxHQUFZLEtBQUtULFNBQUwsSUFBZ0J0MEIsQ0FBNUIsQ0FBOEIsSUFBSWIsSUFBRSxLQUFLK0UsT0FBTCxHQUFhckUsU0FBU0MsYUFBVCxDQUF1QixRQUF2QixDQUFuQixDQUFvRFgsRUFBRXhELFNBQUYsR0FBWSwyQkFBWixFQUF3Q3dELEVBQUV4RCxTQUFGLElBQWEsS0FBS201QixVQUFMLEdBQWdCLFdBQWhCLEdBQTRCLE9BQWpGLEVBQXlGMzFCLEVBQUVxZ0IsWUFBRixDQUFlLE1BQWYsRUFBc0IsUUFBdEIsQ0FBekYsRUFBeUgsS0FBS3dWLE9BQUwsRUFBekgsRUFBd0k3MUIsRUFBRXFnQixZQUFGLENBQWUsWUFBZixFQUE0QixLQUFLc1YsVUFBTCxHQUFnQixVQUFoQixHQUEyQixNQUF2RCxDQUF4SSxDQUF1TSxJQUFJcDJCLElBQUUsS0FBS3UyQixTQUFMLEVBQU4sQ0FBdUI5MUIsRUFBRXVrQixXQUFGLENBQWNobEIsQ0FBZCxHQUFpQixLQUFLOEosRUFBTCxDQUFRLEtBQVIsRUFBYyxLQUFLMHNCLEtBQW5CLENBQWpCLEVBQTJDLEtBQUsvd0IsTUFBTCxDQUFZcUUsRUFBWixDQUFlLFFBQWYsRUFBd0IsS0FBSzhYLE1BQUwsQ0FBWXZkLElBQVosQ0FBaUIsSUFBakIsQ0FBeEIsQ0FBM0MsRUFBMkYsS0FBS3lGLEVBQUwsQ0FBUSxhQUFSLEVBQXNCLEtBQUtyRSxNQUFMLENBQVlpcEIsa0JBQVosQ0FBK0JycUIsSUFBL0IsQ0FBb0MsS0FBS29CLE1BQXpDLENBQXRCLENBQTNGO0FBQW1LLEdBQXBtQixFQUFxbUJtZSxFQUFFamhCLFNBQUYsQ0FBWXdwQixRQUFaLEdBQXFCLFlBQVU7QUFBQyxTQUFLc0osT0FBTCxDQUFhLEtBQUtqd0IsT0FBbEIsR0FBMkIsS0FBS0EsT0FBTCxDQUFhdU0sZ0JBQWIsQ0FBOEIsT0FBOUIsRUFBc0MsSUFBdEMsQ0FBM0IsRUFBdUUsS0FBS3RNLE1BQUwsQ0FBWUQsT0FBWixDQUFvQndmLFdBQXBCLENBQWdDLEtBQUt4ZixPQUFyQyxDQUF2RTtBQUFxSCxHQUExdkIsRUFBMnZCb2UsRUFBRWpoQixTQUFGLENBQVlrc0IsVUFBWixHQUF1QixZQUFVO0FBQUMsU0FBS3BwQixNQUFMLENBQVlELE9BQVosQ0FBb0IwZixXQUFwQixDQUFnQyxLQUFLMWYsT0FBckMsR0FBOEN4RixFQUFFMkMsU0FBRixDQUFZd2dCLE9BQVosQ0FBb0J2Z0IsSUFBcEIsQ0FBeUIsSUFBekIsQ0FBOUMsRUFBNkUsS0FBSzRDLE9BQUwsQ0FBYTJMLG1CQUFiLENBQWlDLE9BQWpDLEVBQXlDLElBQXpDLENBQTdFO0FBQTRILEdBQXo1QixFQUEwNUJ5UyxFQUFFamhCLFNBQUYsQ0FBWTR6QixTQUFaLEdBQXNCLFlBQVU7QUFBQyxRQUFJajFCLElBQUVILFNBQVNzMUIsZUFBVCxDQUF5QjNTLENBQXpCLEVBQTJCLEtBQTNCLENBQU4sQ0FBd0N4aUIsRUFBRXdmLFlBQUYsQ0FBZSxTQUFmLEVBQXlCLGFBQXpCLEVBQXdDLElBQUlyZ0IsSUFBRVUsU0FBU3MxQixlQUFULENBQXlCM1MsQ0FBekIsRUFBMkIsTUFBM0IsQ0FBTjtBQUFBLFFBQXlDOWpCLElBQUV3akIsRUFBRSxLQUFLL2QsTUFBTCxDQUFZaUssT0FBWixDQUFvQmduQixVQUF0QixDQUEzQyxDQUE2RSxPQUFPajJCLEVBQUVxZ0IsWUFBRixDQUFlLEdBQWYsRUFBbUI5Z0IsQ0FBbkIsR0FBc0JTLEVBQUVxZ0IsWUFBRixDQUFlLE9BQWYsRUFBdUIsT0FBdkIsQ0FBdEIsRUFBc0QsS0FBS3VWLE1BQUwsSUFBYTUxQixFQUFFcWdCLFlBQUYsQ0FBZSxXQUFmLEVBQTJCLGtDQUEzQixDQUFuRSxFQUFrSXhmLEVBQUUwakIsV0FBRixDQUFjdmtCLENBQWQsQ0FBbEksRUFBbUphLENBQTFKO0FBQTRKLEdBQXB2QyxFQUFxdkNzaUIsRUFBRWpoQixTQUFGLENBQVk2ekIsS0FBWixHQUFrQixZQUFVO0FBQUMsUUFBRyxLQUFLTCxTQUFSLEVBQWtCO0FBQUMsV0FBSzF3QixNQUFMLENBQVlncEIsUUFBWixHQUF1QixJQUFJbnRCLElBQUUsS0FBSzgwQixVQUFMLEdBQWdCLFVBQWhCLEdBQTJCLE1BQWpDLENBQXdDLEtBQUszd0IsTUFBTCxDQUFZbkUsQ0FBWjtBQUFpQjtBQUFDLEdBQXQzQyxFQUF1M0NzaUIsRUFBRWpoQixTQUFGLENBQVl5a0IsV0FBWixHQUF3QnpELEVBQUV5RCxXQUFqNUMsRUFBNjVDeEQsRUFBRWpoQixTQUFGLENBQVl5d0IsT0FBWixHQUFvQixZQUFVO0FBQUMsUUFBSTl4QixJQUFFSCxTQUFTNHRCLGFBQWYsQ0FBNkJ6dEIsS0FBR0EsS0FBRyxLQUFLa0UsT0FBWCxJQUFvQixLQUFLZ3hCLEtBQUwsRUFBcEI7QUFBaUMsR0FBMS9DLEVBQTIvQzVTLEVBQUVqaEIsU0FBRixDQUFZZzBCLE1BQVosR0FBbUIsWUFBVTtBQUFDLFNBQUtSLFNBQUwsS0FBaUIsS0FBSzN3QixPQUFMLENBQWFveEIsUUFBYixHQUFzQixDQUFDLENBQXZCLEVBQXlCLEtBQUtULFNBQUwsR0FBZSxDQUFDLENBQTFEO0FBQTZELEdBQXRsRCxFQUF1bER2UyxFQUFFamhCLFNBQUYsQ0FBWTJ6QixPQUFaLEdBQW9CLFlBQVU7QUFBQyxTQUFLSCxTQUFMLEtBQWlCLEtBQUszd0IsT0FBTCxDQUFhb3hCLFFBQWIsR0FBc0IsQ0FBQyxDQUF2QixFQUF5QixLQUFLVCxTQUFMLEdBQWUsQ0FBQyxDQUExRDtBQUE2RCxHQUFuckQsRUFBb3JEdlMsRUFBRWpoQixTQUFGLENBQVlpZixNQUFaLEdBQW1CLFlBQVU7QUFBQyxRQUFJdGdCLElBQUUsS0FBS21FLE1BQUwsQ0FBWTJrQixNQUFsQixDQUF5QixJQUFHLEtBQUsza0IsTUFBTCxDQUFZaUssT0FBWixDQUFvQnFhLFVBQXBCLElBQWdDem9CLEVBQUVoQyxNQUFGLEdBQVMsQ0FBNUMsRUFBOEMsT0FBTyxLQUFLLEtBQUtxM0IsTUFBTCxFQUFaLENBQTBCLElBQUlsMkIsSUFBRWEsRUFBRWhDLE1BQUYsR0FBU2dDLEVBQUVoQyxNQUFGLEdBQVMsQ0FBbEIsR0FBb0IsQ0FBMUI7QUFBQSxRQUE0QlUsSUFBRSxLQUFLbzJCLFVBQUwsR0FBZ0IsQ0FBaEIsR0FBa0IzMUIsQ0FBaEQ7QUFBQSxRQUFrRGtqQixJQUFFLEtBQUtsZSxNQUFMLENBQVlzbUIsYUFBWixJQUEyQi9yQixDQUEzQixHQUE2QixTQUE3QixHQUF1QyxRQUEzRixDQUFvRyxLQUFLMmpCLENBQUw7QUFBVSxHQUFqNkQsRUFBazZEQyxFQUFFamhCLFNBQUYsQ0FBWXdnQixPQUFaLEdBQW9CLFlBQVU7QUFBQyxTQUFLMEwsVUFBTDtBQUFrQixHQUFuOUQsRUFBbzlEbEwsRUFBRTNhLE1BQUYsQ0FBU3ZJLEVBQUVnVixRQUFYLEVBQW9CLEVBQUNvaEIsaUJBQWdCLENBQUMsQ0FBbEIsRUFBb0JILFlBQVcsRUFBQ2IsSUFBRyxFQUFKLEVBQU9DLElBQUcsRUFBVixFQUFhQyxJQUFHLEVBQWhCLEVBQW1CQyxJQUFHLEVBQXRCLEVBQXlCQyxJQUFHLEVBQTVCLEVBQStCQyxJQUFHLEVBQWxDLEVBQS9CLEVBQXBCLENBQXA5RCxFQUEraUV6MUIsRUFBRW9yQixhQUFGLENBQWdCL3RCLElBQWhCLENBQXFCLHdCQUFyQixDQUEvaUUsQ0FBOGxFLElBQUkybEIsSUFBRWhqQixFQUFFa0MsU0FBUixDQUFrQixPQUFPOGdCLEVBQUVxVCxzQkFBRixHQUF5QixZQUFVO0FBQUMsU0FBS3BuQixPQUFMLENBQWFtbkIsZUFBYixLQUErQixLQUFLRSxVQUFMLEdBQWdCLElBQUluVCxDQUFKLENBQU8sQ0FBQyxDQUFSLEVBQVcsSUFBWCxDQUFoQixFQUFpQyxLQUFLb1QsVUFBTCxHQUFnQixJQUFJcFQsQ0FBSixDQUFNLENBQU4sRUFBUSxJQUFSLENBQWpELEVBQStELEtBQUs5WixFQUFMLENBQVEsVUFBUixFQUFtQixLQUFLbXRCLHVCQUF4QixDQUE5RjtBQUFnSixHQUFwTCxFQUFxTHhULEVBQUV3VCx1QkFBRixHQUEwQixZQUFVO0FBQUMsU0FBS0YsVUFBTCxDQUFnQjVLLFFBQWhCLElBQTJCLEtBQUs2SyxVQUFMLENBQWdCN0ssUUFBaEIsRUFBM0IsRUFBc0QsS0FBS3JpQixFQUFMLENBQVEsWUFBUixFQUFxQixLQUFLb3RCLHlCQUExQixDQUF0RDtBQUEyRyxHQUFyVSxFQUFzVXpULEVBQUV5VCx5QkFBRixHQUE0QixZQUFVO0FBQUMsU0FBS0gsVUFBTCxDQUFnQmxJLFVBQWhCLElBQTZCLEtBQUttSSxVQUFMLENBQWdCbkksVUFBaEIsRUFBN0IsRUFBMEQsS0FBSzFrQixHQUFMLENBQVMsWUFBVCxFQUFzQixLQUFLK3NCLHlCQUEzQixDQUExRDtBQUFnSCxHQUE3ZCxFQUE4ZHoyQixFQUFFMDJCLGNBQUYsR0FBaUJ2VCxDQUEvZSxFQUFpZm5qQixDQUF4ZjtBQUEwZixDQUFqeEcsQ0FEenNFLEVBQzQ5SyxVQUFTYSxDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLGdCQUFZLE9BQU9zZCxNQUFuQixJQUEyQkEsT0FBT0MsR0FBbEMsR0FBc0NELE9BQU8sdUJBQVAsRUFBK0IsQ0FBQyxZQUFELEVBQWMsMkJBQWQsRUFBMEMsc0JBQTFDLENBQS9CLEVBQWlHLFVBQVMvZCxDQUFULEVBQVcyakIsQ0FBWCxFQUFhQyxDQUFiLEVBQWU7QUFBQyxXQUFPbmpCLEVBQUVhLENBQUYsRUFBSXRCLENBQUosRUFBTTJqQixDQUFOLEVBQVFDLENBQVIsQ0FBUDtBQUFrQixHQUFuSSxDQUF0QyxHQUEySyxvQkFBaUI5RixNQUFqQix5Q0FBaUJBLE1BQWpCLE1BQXlCQSxPQUFPRCxPQUFoQyxHQUF3Q0MsT0FBT0QsT0FBUCxHQUFlcGQsRUFBRWEsQ0FBRixFQUFJZ2lCLFFBQVEsWUFBUixDQUFKLEVBQTBCQSxRQUFRLGNBQVIsQ0FBMUIsRUFBa0RBLFFBQVEsZ0JBQVIsQ0FBbEQsQ0FBdkQsR0FBb0k3aUIsRUFBRWEsQ0FBRixFQUFJQSxFQUFFdW1CLFFBQU4sRUFBZXZtQixFQUFFazBCLFdBQWpCLEVBQTZCbDBCLEVBQUV3bEIsWUFBL0IsQ0FBL1M7QUFBNFYsQ0FBMVcsQ0FBMlc3akIsTUFBM1csRUFBa1gsVUFBUzNCLENBQVQsRUFBV2IsQ0FBWCxFQUFhVCxDQUFiLEVBQWUyakIsQ0FBZixFQUFpQjtBQUFDLFdBQVNDLENBQVQsQ0FBV3RpQixDQUFYLEVBQWE7QUFBQyxTQUFLbUUsTUFBTCxHQUFZbkUsQ0FBWixFQUFjLEtBQUtncUIsT0FBTCxFQUFkO0FBQTZCLEtBQUUzb0IsU0FBRixHQUFZLElBQUkzQyxDQUFKLEVBQVosRUFBa0I0akIsRUFBRWpoQixTQUFGLENBQVkyb0IsT0FBWixHQUFvQixZQUFVO0FBQUMsU0FBSzhMLE1BQUwsR0FBWWoyQixTQUFTQyxhQUFULENBQXVCLElBQXZCLENBQVosRUFBeUMsS0FBS2cyQixNQUFMLENBQVluNkIsU0FBWixHQUFzQixvQkFBL0QsRUFBb0YsS0FBS282QixJQUFMLEdBQVUsRUFBOUYsRUFBaUcsS0FBS3Z0QixFQUFMLENBQVEsS0FBUixFQUFjLEtBQUswc0IsS0FBbkIsQ0FBakcsRUFBMkgsS0FBSzFzQixFQUFMLENBQVEsYUFBUixFQUFzQixLQUFLckUsTUFBTCxDQUFZaXBCLGtCQUFaLENBQStCcnFCLElBQS9CLENBQW9DLEtBQUtvQixNQUF6QyxDQUF0QixDQUEzSDtBQUFtTSxHQUFwUCxFQUFxUG1lLEVBQUVqaEIsU0FBRixDQUFZd3BCLFFBQVosR0FBcUIsWUFBVTtBQUFDLFNBQUttTCxPQUFMLElBQWUsS0FBSzdCLE9BQUwsQ0FBYSxLQUFLMkIsTUFBbEIsQ0FBZixFQUF5QyxLQUFLM3hCLE1BQUwsQ0FBWUQsT0FBWixDQUFvQndmLFdBQXBCLENBQWdDLEtBQUtvUyxNQUFyQyxDQUF6QztBQUFzRixHQUEzVyxFQUE0V3hULEVBQUVqaEIsU0FBRixDQUFZa3NCLFVBQVosR0FBdUIsWUFBVTtBQUFDLFNBQUtwcEIsTUFBTCxDQUFZRCxPQUFaLENBQW9CMGYsV0FBcEIsQ0FBZ0MsS0FBS2tTLE1BQXJDLEdBQTZDcDNCLEVBQUUyQyxTQUFGLENBQVl3Z0IsT0FBWixDQUFvQnZnQixJQUFwQixDQUF5QixJQUF6QixDQUE3QztBQUE0RSxHQUExZCxFQUEyZGdoQixFQUFFamhCLFNBQUYsQ0FBWTIwQixPQUFaLEdBQW9CLFlBQVU7QUFBQyxRQUFJaDJCLElBQUUsS0FBS21FLE1BQUwsQ0FBWTJrQixNQUFaLENBQW1COXFCLE1BQW5CLEdBQTBCLEtBQUsrM0IsSUFBTCxDQUFVLzNCLE1BQTFDLENBQWlEZ0MsSUFBRSxDQUFGLEdBQUksS0FBS2kyQixPQUFMLENBQWFqMkIsQ0FBYixDQUFKLEdBQW9CQSxJQUFFLENBQUYsSUFBSyxLQUFLazJCLFVBQUwsQ0FBZ0IsQ0FBQ2wyQixDQUFqQixDQUF6QjtBQUE2QyxHQUF4bEIsRUFBeWxCc2lCLEVBQUVqaEIsU0FBRixDQUFZNDBCLE9BQVosR0FBb0IsVUFBU2oyQixDQUFULEVBQVc7QUFBQyxTQUFJLElBQUliLElBQUVVLFNBQVNzMkIsc0JBQVQsRUFBTixFQUF3Q3ozQixJQUFFLEVBQTlDLEVBQWlEc0IsQ0FBakQsR0FBb0Q7QUFBQyxVQUFJcWlCLElBQUV4aUIsU0FBU0MsYUFBVCxDQUF1QixJQUF2QixDQUFOLENBQW1DdWlCLEVBQUUxbUIsU0FBRixHQUFZLEtBQVosRUFBa0J3RCxFQUFFdWtCLFdBQUYsQ0FBY3JCLENBQWQsQ0FBbEIsRUFBbUMzakIsRUFBRWxDLElBQUYsQ0FBTzZsQixDQUFQLENBQW5DLEVBQTZDcmlCLEdBQTdDO0FBQWlELFVBQUs4MUIsTUFBTCxDQUFZcFMsV0FBWixDQUF3QnZrQixDQUF4QixHQUEyQixLQUFLNDJCLElBQUwsR0FBVSxLQUFLQSxJQUFMLENBQVUxeUIsTUFBVixDQUFpQjNFLENBQWpCLENBQXJDO0FBQXlELEdBQTN6QixFQUE0ekI0akIsRUFBRWpoQixTQUFGLENBQVk2MEIsVUFBWixHQUF1QixVQUFTbDJCLENBQVQsRUFBVztBQUFDLFFBQUliLElBQUUsS0FBSzQyQixJQUFMLENBQVVyNUIsTUFBVixDQUFpQixLQUFLcTVCLElBQUwsQ0FBVS8zQixNQUFWLEdBQWlCZ0MsQ0FBbEMsRUFBb0NBLENBQXBDLENBQU4sQ0FBNkNiLEVBQUUzQixPQUFGLENBQVUsVUFBU3dDLENBQVQsRUFBVztBQUFDLFdBQUs4MUIsTUFBTCxDQUFZbFMsV0FBWixDQUF3QjVqQixDQUF4QjtBQUEyQixLQUFqRCxFQUFrRCxJQUFsRDtBQUF3RCxHQUFwOEIsRUFBcThCc2lCLEVBQUVqaEIsU0FBRixDQUFZKzBCLGNBQVosR0FBMkIsWUFBVTtBQUFDLFNBQUtDLFdBQUwsS0FBbUIsS0FBS0EsV0FBTCxDQUFpQjE2QixTQUFqQixHQUEyQixLQUE5QyxHQUFxRCxLQUFLbzZCLElBQUwsQ0FBVS8zQixNQUFWLEtBQW1CLEtBQUtxNEIsV0FBTCxHQUFpQixLQUFLTixJQUFMLENBQVUsS0FBSzV4QixNQUFMLENBQVlzbUIsYUFBdEIsQ0FBakIsRUFBc0QsS0FBSzRMLFdBQUwsQ0FBaUIxNkIsU0FBakIsR0FBMkIsaUJBQXBHLENBQXJEO0FBQTRLLEdBQXZwQyxFQUF3cEMybUIsRUFBRWpoQixTQUFGLENBQVk2ekIsS0FBWixHQUFrQixVQUFTbDFCLENBQVQsRUFBVztBQUFDLFFBQUliLElBQUVhLEVBQUV5SSxNQUFSLENBQWUsSUFBRyxRQUFNdEosRUFBRW9ZLFFBQVgsRUFBb0I7QUFBQyxXQUFLcFQsTUFBTCxDQUFZZ3BCLFFBQVosR0FBdUIsSUFBSXp1QixJQUFFLEtBQUtxM0IsSUFBTCxDQUFVcDVCLE9BQVYsQ0FBa0J3QyxDQUFsQixDQUFOLENBQTJCLEtBQUtnRixNQUFMLENBQVl1akIsTUFBWixDQUFtQmhwQixDQUFuQjtBQUFzQjtBQUFDLEdBQW55QyxFQUFveUM0akIsRUFBRWpoQixTQUFGLENBQVl3Z0IsT0FBWixHQUFvQixZQUFVO0FBQUMsU0FBSzBMLFVBQUw7QUFBa0IsR0FBcjFDLEVBQXMxQ3B1QixFQUFFbTNCLFFBQUYsR0FBV2hVLENBQWoyQyxFQUFtMkNELEVBQUUzYSxNQUFGLENBQVN2SSxFQUFFZ1YsUUFBWCxFQUFvQixFQUFDb2lCLFVBQVMsQ0FBQyxDQUFYLEVBQXBCLENBQW4yQyxFQUFzNENwM0IsRUFBRW9yQixhQUFGLENBQWdCL3RCLElBQWhCLENBQXFCLGlCQUFyQixDQUF0NEMsQ0FBODZDLElBQUkwbEIsSUFBRS9pQixFQUFFa0MsU0FBUixDQUFrQixPQUFPNmdCLEVBQUVzVSxlQUFGLEdBQWtCLFlBQVU7QUFBQyxTQUFLcG9CLE9BQUwsQ0FBYW1vQixRQUFiLEtBQXdCLEtBQUtBLFFBQUwsR0FBYyxJQUFJalUsQ0FBSixDQUFNLElBQU4sQ0FBZCxFQUEwQixLQUFLOVosRUFBTCxDQUFRLFVBQVIsRUFBbUIsS0FBS2l1QixnQkFBeEIsQ0FBMUIsRUFBb0UsS0FBS2p1QixFQUFMLENBQVEsUUFBUixFQUFpQixLQUFLa3VCLHNCQUF0QixDQUFwRSxFQUFrSCxLQUFLbHVCLEVBQUwsQ0FBUSxZQUFSLEVBQXFCLEtBQUttdUIsY0FBMUIsQ0FBbEgsRUFBNEosS0FBS251QixFQUFMLENBQVEsUUFBUixFQUFpQixLQUFLbXVCLGNBQXRCLENBQTVKLEVBQWtNLEtBQUtudUIsRUFBTCxDQUFRLFlBQVIsRUFBcUIsS0FBS291QixrQkFBMUIsQ0FBMU47QUFBeVEsR0FBdFMsRUFBdVMxVSxFQUFFdVUsZ0JBQUYsR0FBbUIsWUFBVTtBQUFDLFNBQUtGLFFBQUwsQ0FBYzFMLFFBQWQ7QUFBeUIsR0FBOVYsRUFBK1YzSSxFQUFFd1Usc0JBQUYsR0FBeUIsWUFBVTtBQUFDLFNBQUtILFFBQUwsQ0FBY0gsY0FBZDtBQUErQixHQUFsYSxFQUFtYWxVLEVBQUV5VSxjQUFGLEdBQWlCLFlBQVU7QUFBQyxTQUFLSixRQUFMLENBQWNQLE9BQWQ7QUFBd0IsR0FBdmQsRUFBd2Q5VCxFQUFFMFUsa0JBQUYsR0FBcUIsWUFBVTtBQUFDLFNBQUtMLFFBQUwsQ0FBY2hKLFVBQWQ7QUFBMkIsR0FBbmhCLEVBQW9oQnB1QixFQUFFbTNCLFFBQUYsR0FBV2hVLENBQS9oQixFQUFpaUJuakIsQ0FBeGlCO0FBQTBpQixDQUF6NUUsQ0FENTlLLEVBQ3UzUCxVQUFTYSxDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLGdCQUFZLE9BQU9zZCxNQUFuQixJQUEyQkEsT0FBT0MsR0FBbEMsR0FBc0NELE9BQU8sb0JBQVAsRUFBNEIsQ0FBQyx1QkFBRCxFQUF5QixzQkFBekIsRUFBZ0QsWUFBaEQsQ0FBNUIsRUFBMEYsVUFBU3pjLENBQVQsRUFBV3RCLENBQVgsRUFBYTJqQixDQUFiLEVBQWU7QUFBQyxXQUFPbGpCLEVBQUVhLENBQUYsRUFBSXRCLENBQUosRUFBTTJqQixDQUFOLENBQVA7QUFBZ0IsR0FBMUgsQ0FBdEMsR0FBa0ssb0JBQWlCN0YsTUFBakIseUNBQWlCQSxNQUFqQixNQUF5QkEsT0FBT0QsT0FBaEMsR0FBd0NDLE9BQU9ELE9BQVAsR0FBZXBkLEVBQUU2aUIsUUFBUSxZQUFSLENBQUYsRUFBd0JBLFFBQVEsZ0JBQVIsQ0FBeEIsRUFBa0RBLFFBQVEsWUFBUixDQUFsRCxDQUF2RCxHQUFnSTdpQixFQUFFYSxFQUFFK2lCLFNBQUosRUFBYy9pQixFQUFFd2xCLFlBQWhCLEVBQTZCeGxCLEVBQUV1bUIsUUFBL0IsQ0FBbFM7QUFBMlUsQ0FBelYsQ0FBMFY1a0IsTUFBMVYsRUFBaVcsVUFBUzNCLENBQVQsRUFBV2IsQ0FBWCxFQUFhVCxDQUFiLEVBQWU7QUFBQyxXQUFTMmpCLENBQVQsQ0FBV3JpQixDQUFYLEVBQWE7QUFBQyxTQUFLbUUsTUFBTCxHQUFZbkUsQ0FBWixFQUFjLEtBQUs2MkIsS0FBTCxHQUFXLFNBQXpCLEVBQW1DM1UsTUFBSSxLQUFLNFUsa0JBQUwsR0FBd0IsWUFBVTtBQUFDLFdBQUtDLGdCQUFMO0FBQXdCLEtBQW5DLENBQW9DaDBCLElBQXBDLENBQXlDLElBQXpDLENBQXhCLEVBQXVFLEtBQUtpMEIsZ0JBQUwsR0FBc0IsWUFBVTtBQUFDLFdBQUtDLGNBQUw7QUFBc0IsS0FBakMsQ0FBa0NsMEIsSUFBbEMsQ0FBdUMsSUFBdkMsQ0FBakcsQ0FBbkM7QUFBa0wsT0FBSXVmLENBQUosRUFBTUosQ0FBTixDQUFRLFlBQVdyaUIsUUFBWCxJQUFxQnlpQixJQUFFLFFBQUYsRUFBV0osSUFBRSxrQkFBbEMsSUFBc0Qsa0JBQWlCcmlCLFFBQWpCLEtBQTRCeWlCLElBQUUsY0FBRixFQUFpQkosSUFBRSx3QkFBL0MsQ0FBdEQsRUFBK0hHLEVBQUVoaEIsU0FBRixHQUFZMUQsT0FBTzhvQixNQUFQLENBQWN6bUIsRUFBRXFCLFNBQWhCLENBQTNJLEVBQXNLZ2hCLEVBQUVoaEIsU0FBRixDQUFZNjFCLElBQVosR0FBaUIsWUFBVTtBQUFDLFFBQUcsYUFBVyxLQUFLTCxLQUFuQixFQUF5QjtBQUFDLFVBQUk3MkIsSUFBRUgsU0FBU3lpQixDQUFULENBQU4sQ0FBa0IsSUFBR0osS0FBR2xpQixDQUFOLEVBQVEsT0FBTyxLQUFLSCxTQUFTNFEsZ0JBQVQsQ0FBMEJ5UixDQUExQixFQUE0QixLQUFLOFUsZ0JBQWpDLENBQVosQ0FBK0QsS0FBS0gsS0FBTCxHQUFXLFNBQVgsRUFBcUIzVSxLQUFHcmlCLFNBQVM0USxnQkFBVCxDQUEwQnlSLENBQTFCLEVBQTRCLEtBQUs0VSxrQkFBakMsQ0FBeEIsRUFBNkUsS0FBS0ssSUFBTCxFQUE3RTtBQUF5RjtBQUFDLEdBQS9ZLEVBQWdaOVUsRUFBRWhoQixTQUFGLENBQVk4MUIsSUFBWixHQUFpQixZQUFVO0FBQUMsUUFBRyxhQUFXLEtBQUtOLEtBQW5CLEVBQXlCO0FBQUMsVUFBSTcyQixJQUFFLEtBQUttRSxNQUFMLENBQVlpSyxPQUFaLENBQW9CZ3BCLFFBQTFCLENBQW1DcDNCLElBQUUsWUFBVSxPQUFPQSxDQUFqQixHQUFtQkEsQ0FBbkIsR0FBcUIsR0FBdkIsQ0FBMkIsSUFBSWIsSUFBRSxJQUFOLENBQVcsS0FBS2s0QixLQUFMLElBQWEsS0FBS0MsT0FBTCxHQUFhcDNCLFdBQVcsWUFBVTtBQUFDZixVQUFFZ0YsTUFBRixDQUFTc1IsSUFBVCxDQUFjLENBQUMsQ0FBZixHQUFrQnRXLEVBQUVnNEIsSUFBRixFQUFsQjtBQUEyQixPQUFqRCxFQUFrRG4zQixDQUFsRCxDQUExQjtBQUErRTtBQUFDLEdBQS9sQixFQUFnbUJxaUIsRUFBRWhoQixTQUFGLENBQVlzVixJQUFaLEdBQWlCLFlBQVU7QUFBQyxTQUFLa2dCLEtBQUwsR0FBVyxTQUFYLEVBQXFCLEtBQUtRLEtBQUwsRUFBckIsRUFBa0NuVixLQUFHcmlCLFNBQVNnUSxtQkFBVCxDQUE2QnFTLENBQTdCLEVBQStCLEtBQUs0VSxrQkFBcEMsQ0FBckM7QUFBNkYsR0FBenRCLEVBQTB0QnpVLEVBQUVoaEIsU0FBRixDQUFZZzJCLEtBQVosR0FBa0IsWUFBVTtBQUFDMTBCLGlCQUFhLEtBQUsyMEIsT0FBbEI7QUFBMkIsR0FBbHhCLEVBQW14QmpWLEVBQUVoaEIsU0FBRixDQUFZcU4sS0FBWixHQUFrQixZQUFVO0FBQUMsaUJBQVcsS0FBS21vQixLQUFoQixLQUF3QixLQUFLQSxLQUFMLEdBQVcsUUFBWCxFQUFvQixLQUFLUSxLQUFMLEVBQTVDO0FBQTBELEdBQTEyQixFQUEyMkJoVixFQUFFaGhCLFNBQUYsQ0FBWWsyQixPQUFaLEdBQW9CLFlBQVU7QUFBQyxnQkFBVSxLQUFLVixLQUFmLElBQXNCLEtBQUtLLElBQUwsRUFBdEI7QUFBa0MsR0FBNTZCLEVBQTY2QjdVLEVBQUVoaEIsU0FBRixDQUFZMDFCLGdCQUFaLEdBQTZCLFlBQVU7QUFBQyxRQUFJLzJCLElBQUVILFNBQVN5aUIsQ0FBVCxDQUFOLENBQWtCLEtBQUt0aUIsSUFBRSxPQUFGLEdBQVUsU0FBZjtBQUE0QixHQUFuZ0MsRUFBb2dDcWlCLEVBQUVoaEIsU0FBRixDQUFZNDFCLGNBQVosR0FBMkIsWUFBVTtBQUFDLFNBQUtDLElBQUwsSUFBWXIzQixTQUFTZ1EsbUJBQVQsQ0FBNkJxUyxDQUE3QixFQUErQixLQUFLOFUsZ0JBQXBDLENBQVo7QUFBa0UsR0FBNW1DLEVBQTZtQzczQixFQUFFdUksTUFBRixDQUFTaEosRUFBRXlWLFFBQVgsRUFBb0IsRUFBQ3FqQixzQkFBcUIsQ0FBQyxDQUF2QixFQUFwQixDQUE3bUMsRUFBNHBDOTRCLEVBQUU2ckIsYUFBRixDQUFnQi90QixJQUFoQixDQUFxQixlQUFyQixDQUE1cEMsQ0FBa3NDLElBQUlnbUIsSUFBRTlqQixFQUFFMkMsU0FBUixDQUFrQixPQUFPbWhCLEVBQUVpVixhQUFGLEdBQWdCLFlBQVU7QUFBQyxTQUFLQyxNQUFMLEdBQVksSUFBSXJWLENBQUosQ0FBTSxJQUFOLENBQVosRUFBd0IsS0FBSzdaLEVBQUwsQ0FBUSxVQUFSLEVBQW1CLEtBQUttdkIsY0FBeEIsQ0FBeEIsRUFBZ0UsS0FBS252QixFQUFMLENBQVEsVUFBUixFQUFtQixLQUFLb3ZCLFVBQXhCLENBQWhFLEVBQW9HLEtBQUtwdkIsRUFBTCxDQUFRLGFBQVIsRUFBc0IsS0FBS292QixVQUEzQixDQUFwRyxFQUEySSxLQUFLcHZCLEVBQUwsQ0FBUSxZQUFSLEVBQXFCLEtBQUtxdkIsZ0JBQTFCLENBQTNJO0FBQXVMLEdBQWxOLEVBQW1OclYsRUFBRW1WLGNBQUYsR0FBaUIsWUFBVTtBQUFDLFNBQUt2cEIsT0FBTCxDQUFhZ3BCLFFBQWIsS0FBd0IsS0FBS00sTUFBTCxDQUFZUixJQUFaLElBQW1CLEtBQUtoekIsT0FBTCxDQUFhdU0sZ0JBQWIsQ0FBOEIsWUFBOUIsRUFBMkMsSUFBM0MsQ0FBM0M7QUFBNkYsR0FBNVUsRUFBNlUrUixFQUFFc1YsVUFBRixHQUFhLFlBQVU7QUFBQyxTQUFLSixNQUFMLENBQVlSLElBQVo7QUFBbUIsR0FBeFgsRUFBeVgxVSxFQUFFb1YsVUFBRixHQUFhLFlBQVU7QUFBQyxTQUFLRixNQUFMLENBQVkvZ0IsSUFBWjtBQUFtQixHQUFwYSxFQUFxYTZMLEVBQUV1VixXQUFGLEdBQWMsWUFBVTtBQUFDLFNBQUtMLE1BQUwsQ0FBWWhwQixLQUFaO0FBQW9CLEdBQWxkLEVBQW1kOFQsRUFBRXdWLGFBQUYsR0FBZ0IsWUFBVTtBQUFDLFNBQUtOLE1BQUwsQ0FBWUgsT0FBWjtBQUFzQixHQUFwZ0IsRUFBcWdCL1UsRUFBRXFWLGdCQUFGLEdBQW1CLFlBQVU7QUFBQyxTQUFLSCxNQUFMLENBQVkvZ0IsSUFBWixJQUFtQixLQUFLelMsT0FBTCxDQUFhMkwsbUJBQWIsQ0FBaUMsWUFBakMsRUFBOEMsSUFBOUMsQ0FBbkI7QUFBdUUsR0FBMW1CLEVBQTJtQjJTLEVBQUV5VixZQUFGLEdBQWUsWUFBVTtBQUFDLFNBQUs3cEIsT0FBTCxDQUFhb3BCLG9CQUFiLEtBQW9DLEtBQUtFLE1BQUwsQ0FBWWhwQixLQUFaLElBQW9CLEtBQUt4SyxPQUFMLENBQWF1TSxnQkFBYixDQUE4QixZQUE5QixFQUEyQyxJQUEzQyxDQUF4RDtBQUEwRyxHQUEvdUIsRUFBZ3ZCK1IsRUFBRTBWLFlBQUYsR0FBZSxZQUFVO0FBQUMsU0FBS1IsTUFBTCxDQUFZSCxPQUFaLElBQXNCLEtBQUtyekIsT0FBTCxDQUFhMkwsbUJBQWIsQ0FBaUMsWUFBakMsRUFBOEMsSUFBOUMsQ0FBdEI7QUFBMEUsR0FBcDFCLEVBQXExQm5SLEVBQUV5NUIsTUFBRixHQUFTOVYsQ0FBOTFCLEVBQWcyQjNqQixDQUF2MkI7QUFBeTJCLENBQXRuRixDQUR2M1AsRUFDKytVLFVBQVNzQixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLGdCQUFZLE9BQU9zZCxNQUFuQixJQUEyQkEsT0FBT0MsR0FBbEMsR0FBc0NELE9BQU8sNkJBQVAsRUFBcUMsQ0FBQyxZQUFELEVBQWMsc0JBQWQsQ0FBckMsRUFBMkUsVUFBUy9kLENBQVQsRUFBVzJqQixDQUFYLEVBQWE7QUFBQyxXQUFPbGpCLEVBQUVhLENBQUYsRUFBSXRCLENBQUosRUFBTTJqQixDQUFOLENBQVA7QUFBZ0IsR0FBekcsQ0FBdEMsR0FBaUosb0JBQWlCN0YsTUFBakIseUNBQWlCQSxNQUFqQixNQUF5QkEsT0FBT0QsT0FBaEMsR0FBd0NDLE9BQU9ELE9BQVAsR0FBZXBkLEVBQUVhLENBQUYsRUFBSWdpQixRQUFRLFlBQVIsQ0FBSixFQUEwQkEsUUFBUSxnQkFBUixDQUExQixDQUF2RCxHQUE0RzdpQixFQUFFYSxDQUFGLEVBQUlBLEVBQUV1bUIsUUFBTixFQUFldm1CLEVBQUV3bEIsWUFBakIsQ0FBN1A7QUFBNFIsQ0FBMVMsQ0FBMlM3akIsTUFBM1MsRUFBa1QsVUFBUzNCLENBQVQsRUFBV2IsQ0FBWCxFQUFhVCxDQUFiLEVBQWU7QUFBQyxXQUFTMmpCLENBQVQsQ0FBV3JpQixDQUFYLEVBQWE7QUFBQyxRQUFJYixJQUFFVSxTQUFTczJCLHNCQUFULEVBQU4sQ0FBd0MsT0FBT24yQixFQUFFeEMsT0FBRixDQUFVLFVBQVN3QyxDQUFULEVBQVc7QUFBQ2IsUUFBRXVrQixXQUFGLENBQWMxakIsRUFBRWtFLE9BQWhCO0FBQXlCLEtBQS9DLEdBQWlEL0UsQ0FBeEQ7QUFBMEQsT0FBSW1qQixJQUFFbmpCLEVBQUVrQyxTQUFSLENBQWtCLE9BQU9paEIsRUFBRThWLE1BQUYsR0FBUyxVQUFTcDRCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsUUFBSVQsSUFBRSxLQUFLMHNCLFVBQUwsQ0FBZ0JwckIsQ0FBaEIsQ0FBTixDQUF5QixJQUFHdEIsS0FBR0EsRUFBRVYsTUFBUixFQUFlO0FBQUMsVUFBSXNrQixJQUFFLEtBQUtnRixLQUFMLENBQVd0cEIsTUFBakIsQ0FBd0JtQixJQUFFLEtBQUssQ0FBTCxLQUFTQSxDQUFULEdBQVdtakIsQ0FBWCxHQUFhbmpCLENBQWYsQ0FBaUIsSUFBSStpQixJQUFFRyxFQUFFM2pCLENBQUYsQ0FBTjtBQUFBLFVBQVc4akIsSUFBRXJqQixLQUFHbWpCLENBQWhCLENBQWtCLElBQUdFLENBQUgsRUFBSyxLQUFLcUcsTUFBTCxDQUFZbkYsV0FBWixDQUF3QnhCLENBQXhCLEVBQUwsS0FBb0M7QUFBQyxZQUFJQyxJQUFFLEtBQUttRixLQUFMLENBQVdub0IsQ0FBWCxFQUFjK0UsT0FBcEIsQ0FBNEIsS0FBSzJrQixNQUFMLENBQVk5ZCxZQUFaLENBQXlCbVgsQ0FBekIsRUFBMkJDLENBQTNCO0FBQThCLFdBQUcsTUFBSWhqQixDQUFQLEVBQVMsS0FBS21vQixLQUFMLEdBQVc1b0IsRUFBRTJFLE1BQUYsQ0FBUyxLQUFLaWtCLEtBQWQsQ0FBWCxDQUFULEtBQThDLElBQUc5RSxDQUFILEVBQUssS0FBSzhFLEtBQUwsR0FBVyxLQUFLQSxLQUFMLENBQVdqa0IsTUFBWCxDQUFrQjNFLENBQWxCLENBQVgsQ0FBTCxLQUF5QztBQUFDLFlBQUkwakIsSUFBRSxLQUFLa0YsS0FBTCxDQUFXNXFCLE1BQVgsQ0FBa0J5QyxDQUFsQixFQUFvQm1qQixJQUFFbmpCLENBQXRCLENBQU4sQ0FBK0IsS0FBS21vQixLQUFMLEdBQVcsS0FBS0EsS0FBTCxDQUFXamtCLE1BQVgsQ0FBa0IzRSxDQUFsQixFQUFxQjJFLE1BQXJCLENBQTRCK2UsQ0FBNUIsQ0FBWDtBQUEwQyxZQUFLb0osVUFBTCxDQUFnQjlzQixDQUFoQixFQUFtQixJQUFJNmpCLElBQUVwakIsSUFBRSxLQUFLc3JCLGFBQVAsR0FBcUIsQ0FBckIsR0FBdUIvckIsRUFBRVYsTUFBL0IsQ0FBc0MsS0FBS3E2QixpQkFBTCxDQUF1Qmw1QixDQUF2QixFQUF5Qm9qQixDQUF6QjtBQUE0QjtBQUFDLEdBQWpkLEVBQWtkRCxFQUFFZ1csTUFBRixHQUFTLFVBQVN0NEIsQ0FBVCxFQUFXO0FBQUMsU0FBS280QixNQUFMLENBQVlwNEIsQ0FBWixFQUFjLEtBQUtzbkIsS0FBTCxDQUFXdHBCLE1BQXpCO0FBQWlDLEdBQXhnQixFQUF5Z0Jza0IsRUFBRWlXLE9BQUYsR0FBVSxVQUFTdjRCLENBQVQsRUFBVztBQUFDLFNBQUtvNEIsTUFBTCxDQUFZcDRCLENBQVosRUFBYyxDQUFkO0FBQWlCLEdBQWhqQixFQUFpakJzaUIsRUFBRTFCLE1BQUYsR0FBUyxVQUFTNWdCLENBQVQsRUFBVztBQUFDLFFBQUliLENBQUo7QUFBQSxRQUFNa2pCLENBQU47QUFBQSxRQUFRQyxJQUFFLEtBQUswSyxRQUFMLENBQWNodEIsQ0FBZCxDQUFWO0FBQUEsUUFBMkJraUIsSUFBRSxDQUE3QjtBQUFBLFFBQStCTSxJQUFFRixFQUFFdGtCLE1BQW5DLENBQTBDLEtBQUltQixJQUFFLENBQU4sRUFBUUEsSUFBRXFqQixDQUFWLEVBQVlyakIsR0FBWixFQUFnQjtBQUFDa2pCLFVBQUVDLEVBQUVuakIsQ0FBRixDQUFGLENBQU8sSUFBSWdqQixJQUFFLEtBQUttRixLQUFMLENBQVczcUIsT0FBWCxDQUFtQjBsQixDQUFuQixJQUFzQixLQUFLb0ksYUFBakMsQ0FBK0N2SSxLQUFHQyxJQUFFLENBQUYsR0FBSSxDQUFQO0FBQVMsVUFBSWhqQixJQUFFLENBQU4sRUFBUUEsSUFBRXFqQixDQUFWLEVBQVlyakIsR0FBWjtBQUFnQmtqQixVQUFFQyxFQUFFbmpCLENBQUYsQ0FBRixFQUFPa2pCLEVBQUV6QixNQUFGLEVBQVAsRUFBa0JsaUIsRUFBRWluQixVQUFGLENBQWEsS0FBSzJCLEtBQWxCLEVBQXdCakYsQ0FBeEIsQ0FBbEI7QUFBaEIsS0FBNkRDLEVBQUV0a0IsTUFBRixJQUFVLEtBQUtxNkIsaUJBQUwsQ0FBdUIsQ0FBdkIsRUFBeUJuVyxDQUF6QixDQUFWO0FBQXNDLEdBQW55QixFQUFveUJJLEVBQUUrVixpQkFBRixHQUFvQixVQUFTcjRCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUNBLFFBQUVBLEtBQUcsQ0FBTCxFQUFPLEtBQUtzckIsYUFBTCxJQUFvQnRyQixDQUEzQixFQUE2QixLQUFLc3JCLGFBQUwsR0FBbUJ2c0IsS0FBS3dFLEdBQUwsQ0FBUyxDQUFULEVBQVd4RSxLQUFLNmMsR0FBTCxDQUFTLEtBQUsrTixNQUFMLENBQVk5cUIsTUFBWixHQUFtQixDQUE1QixFQUE4QixLQUFLeXNCLGFBQW5DLENBQVgsQ0FBaEQsRUFBOEcsS0FBSytOLFVBQUwsQ0FBZ0J4NEIsQ0FBaEIsRUFBa0IsQ0FBQyxDQUFuQixDQUE5RyxFQUFvSSxLQUFLa2pCLFNBQUwsQ0FBZSxrQkFBZixFQUFrQyxDQUFDbGpCLENBQUQsRUFBR2IsQ0FBSCxDQUFsQyxDQUFwSTtBQUE2SyxHQUFuL0IsRUFBby9CbWpCLEVBQUVtVyxjQUFGLEdBQWlCLFVBQVN6NEIsQ0FBVCxFQUFXO0FBQUMsUUFBSWIsSUFBRSxLQUFLNHRCLE9BQUwsQ0FBYS9zQixDQUFiLENBQU4sQ0FBc0IsSUFBR2IsQ0FBSCxFQUFLO0FBQUNBLFFBQUVna0IsT0FBRixHQUFZLElBQUl6a0IsSUFBRSxLQUFLNG9CLEtBQUwsQ0FBVzNxQixPQUFYLENBQW1Cd0MsQ0FBbkIsQ0FBTixDQUE0QixLQUFLcTVCLFVBQUwsQ0FBZ0I5NUIsQ0FBaEI7QUFBbUI7QUFBQyxHQUF6bUMsRUFBMG1DNGpCLEVBQUVrVyxVQUFGLEdBQWEsVUFBU3g0QixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFFBQUlULElBQUUsS0FBS3lvQixjQUFYLENBQTBCLElBQUcsS0FBS3NFLGNBQUwsQ0FBb0J6ckIsQ0FBcEIsR0FBdUIsS0FBS3NyQixrQkFBTCxFQUF2QixFQUFpRCxLQUFLaEIsY0FBTCxFQUFqRCxFQUF1RSxLQUFLcEgsU0FBTCxDQUFlLFlBQWYsRUFBNEIsQ0FBQ2xqQixDQUFELENBQTVCLENBQXZFLEVBQXdHLEtBQUtvTyxPQUFMLENBQWFxbEIsVUFBeEgsRUFBbUk7QUFBQyxVQUFJcFIsSUFBRTNqQixJQUFFLEtBQUt5b0IsY0FBYixDQUE0QixLQUFLcFgsQ0FBTCxJQUFRc1MsSUFBRSxLQUFLMkUsU0FBZixFQUF5QixLQUFLc0IsY0FBTCxFQUF6QjtBQUErQyxLQUEvTSxNQUFvTm5wQixLQUFHLEtBQUs2cEIsd0JBQUwsRUFBSCxFQUFtQyxLQUFLdEIsTUFBTCxDQUFZLEtBQUsrQyxhQUFqQixDQUFuQztBQUFtRSxHQUF0N0MsRUFBdTdDdHJCLENBQTk3QztBQUFnOEMsQ0FBcDRELENBRC8rVSxFQUNxM1ksVUFBU2EsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxnQkFBWSxPQUFPc2QsTUFBbkIsSUFBMkJBLE9BQU9DLEdBQWxDLEdBQXNDRCxPQUFPLHNCQUFQLEVBQThCLENBQUMsWUFBRCxFQUFjLHNCQUFkLENBQTlCLEVBQW9FLFVBQVMvZCxDQUFULEVBQVcyakIsQ0FBWCxFQUFhO0FBQUMsV0FBT2xqQixFQUFFYSxDQUFGLEVBQUl0QixDQUFKLEVBQU0yakIsQ0FBTixDQUFQO0FBQWdCLEdBQWxHLENBQXRDLEdBQTBJLG9CQUFpQjdGLE1BQWpCLHlDQUFpQkEsTUFBakIsTUFBeUJBLE9BQU9ELE9BQWhDLEdBQXdDQyxPQUFPRCxPQUFQLEdBQWVwZCxFQUFFYSxDQUFGLEVBQUlnaUIsUUFBUSxZQUFSLENBQUosRUFBMEJBLFFBQVEsZ0JBQVIsQ0FBMUIsQ0FBdkQsR0FBNEc3aUIsRUFBRWEsQ0FBRixFQUFJQSxFQUFFdW1CLFFBQU4sRUFBZXZtQixFQUFFd2xCLFlBQWpCLENBQXRQO0FBQXFSLENBQW5TLENBQW9TN2pCLE1BQXBTLEVBQTJTLFVBQVMzQixDQUFULEVBQVdiLENBQVgsRUFBYVQsQ0FBYixFQUFlO0FBQUM7QUFBYSxXQUFTMmpCLENBQVQsQ0FBV3JpQixDQUFYLEVBQWE7QUFBQyxRQUFHLFNBQU9BLEVBQUV1WCxRQUFULElBQW1CdlgsRUFBRW9aLFlBQUYsQ0FBZSx3QkFBZixDQUF0QixFQUErRCxPQUFNLENBQUNwWixDQUFELENBQU4sQ0FBVSxJQUFJYixJQUFFYSxFQUFFb1QsZ0JBQUYsQ0FBbUIsNkJBQW5CLENBQU4sQ0FBd0QsT0FBTzFVLEVBQUVnbkIsU0FBRixDQUFZdm1CLENBQVosQ0FBUDtBQUFzQixZQUFTbWpCLENBQVQsQ0FBV3RpQixDQUFYLEVBQWFiLENBQWIsRUFBZTtBQUFDLFNBQUt1NUIsR0FBTCxHQUFTMTRCLENBQVQsRUFBVyxLQUFLMjRCLFFBQUwsR0FBY3g1QixDQUF6QixFQUEyQixLQUFLK1YsSUFBTCxFQUEzQjtBQUF1QyxLQUFFcVYsYUFBRixDQUFnQi90QixJQUFoQixDQUFxQixpQkFBckIsRUFBd0MsSUFBSTBsQixJQUFFL2lCLEVBQUVrQyxTQUFSLENBQWtCLE9BQU82Z0IsRUFBRTBXLGVBQUYsR0FBa0IsWUFBVTtBQUFDLFNBQUtwd0IsRUFBTCxDQUFRLFFBQVIsRUFBaUIsS0FBS3F3QixRQUF0QjtBQUFnQyxHQUE3RCxFQUE4RDNXLEVBQUUyVyxRQUFGLEdBQVcsWUFBVTtBQUFDLFFBQUk3NEIsSUFBRSxLQUFLb08sT0FBTCxDQUFheXFCLFFBQW5CLENBQTRCLElBQUc3NEIsQ0FBSCxFQUFLO0FBQUMsVUFBSWIsSUFBRSxZQUFVLE9BQU9hLENBQWpCLEdBQW1CQSxDQUFuQixHQUFxQixDQUEzQjtBQUFBLFVBQTZCdEIsSUFBRSxLQUFLd3VCLHVCQUFMLENBQTZCL3RCLENBQTdCLENBQS9CO0FBQUEsVUFBK0QraUIsSUFBRSxFQUFqRSxDQUFvRXhqQixFQUFFbEIsT0FBRixDQUFVLFVBQVN3QyxDQUFULEVBQVc7QUFBQyxZQUFJYixJQUFFa2pCLEVBQUVyaUIsQ0FBRixDQUFOLENBQVdraUIsSUFBRUEsRUFBRTdlLE1BQUYsQ0FBU2xFLENBQVQsQ0FBRjtBQUFjLE9BQS9DLEdBQWlEK2lCLEVBQUUxa0IsT0FBRixDQUFVLFVBQVN3QyxDQUFULEVBQVc7QUFBQyxZQUFJc2lCLENBQUosQ0FBTXRpQixDQUFOLEVBQVEsSUFBUjtBQUFjLE9BQXBDLEVBQXFDLElBQXJDLENBQWpEO0FBQTRGO0FBQUMsR0FBdlIsRUFBd1JzaUIsRUFBRWpoQixTQUFGLENBQVl5a0IsV0FBWixHQUF3QnBuQixFQUFFb25CLFdBQWxULEVBQThUeEQsRUFBRWpoQixTQUFGLENBQVk2VCxJQUFaLEdBQWlCLFlBQVU7QUFBQyxTQUFLd2pCLEdBQUwsQ0FBU2pvQixnQkFBVCxDQUEwQixNQUExQixFQUFpQyxJQUFqQyxHQUF1QyxLQUFLaW9CLEdBQUwsQ0FBU2pvQixnQkFBVCxDQUEwQixPQUExQixFQUFrQyxJQUFsQyxDQUF2QyxFQUErRSxLQUFLaW9CLEdBQUwsQ0FBU3pwQixHQUFULEdBQWEsS0FBS3lwQixHQUFMLENBQVN0ZixZQUFULENBQXNCLHdCQUF0QixDQUE1RixFQUE0SSxLQUFLc2YsR0FBTCxDQUFTaEwsZUFBVCxDQUF5Qix3QkFBekIsQ0FBNUk7QUFBK0wsR0FBemhCLEVBQTBoQnBMLEVBQUVqaEIsU0FBRixDQUFZeTNCLE1BQVosR0FBbUIsVUFBUzk0QixDQUFULEVBQVc7QUFBQyxTQUFLOE8sUUFBTCxDQUFjOU8sQ0FBZCxFQUFnQixxQkFBaEI7QUFBdUMsR0FBaG1CLEVBQWltQnNpQixFQUFFamhCLFNBQUYsQ0FBWTAzQixPQUFaLEdBQW9CLFVBQVMvNEIsQ0FBVCxFQUFXO0FBQUMsU0FBSzhPLFFBQUwsQ0FBYzlPLENBQWQsRUFBZ0Isb0JBQWhCO0FBQXNDLEdBQXZxQixFQUF3cUJzaUIsRUFBRWpoQixTQUFGLENBQVl5TixRQUFaLEdBQXFCLFVBQVM5TyxDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFNBQUt1NUIsR0FBTCxDQUFTN29CLG1CQUFULENBQTZCLE1BQTdCLEVBQW9DLElBQXBDLEdBQTBDLEtBQUs2b0IsR0FBTCxDQUFTN29CLG1CQUFULENBQTZCLE9BQTdCLEVBQXFDLElBQXJDLENBQTFDLENBQXFGLElBQUluUixJQUFFLEtBQUtpNkIsUUFBTCxDQUFjMUwsYUFBZCxDQUE0QixLQUFLeUwsR0FBakMsQ0FBTjtBQUFBLFFBQTRDclcsSUFBRTNqQixLQUFHQSxFQUFFd0YsT0FBbkQsQ0FBMkQsS0FBS3kwQixRQUFMLENBQWNGLGNBQWQsQ0FBNkJwVyxDQUE3QixHQUFnQyxLQUFLcVcsR0FBTCxDQUFTL1gsU0FBVCxDQUFtQkUsR0FBbkIsQ0FBdUIxaEIsQ0FBdkIsQ0FBaEMsRUFBMEQsS0FBS3c1QixRQUFMLENBQWMzbUIsYUFBZCxDQUE0QixVQUE1QixFQUF1Q2hTLENBQXZDLEVBQXlDcWlCLENBQXpDLENBQTFEO0FBQXNHLEdBQWo4QixFQUFrOEJsakIsRUFBRTY1QixVQUFGLEdBQWExVyxDQUEvOEIsRUFBaTlCbmpCLENBQXg5QjtBQUEwOUIsQ0FBeGpELENBRHIzWSxFQUMrNmIsVUFBU2EsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxnQkFBWSxPQUFPc2QsTUFBbkIsSUFBMkJBLE9BQU9DLEdBQWxDLEdBQXNDRCxPQUFPLG1CQUFQLEVBQTJCLENBQUMsWUFBRCxFQUFjLFFBQWQsRUFBdUIsb0JBQXZCLEVBQTRDLGFBQTVDLEVBQTBELFVBQTFELEVBQXFFLG1CQUFyRSxFQUF5RixZQUF6RixDQUEzQixFQUFrSXRkLENBQWxJLENBQXRDLEdBQTJLLG9CQUFpQnFkLE1BQWpCLHlDQUFpQkEsTUFBakIsTUFBeUJBLE9BQU9ELE9BQWhDLEtBQTBDQyxPQUFPRCxPQUFQLEdBQWVwZCxFQUFFNmlCLFFBQVEsWUFBUixDQUFGLEVBQXdCQSxRQUFRLFFBQVIsQ0FBeEIsRUFBMENBLFFBQVEsb0JBQVIsQ0FBMUMsRUFBd0VBLFFBQVEsYUFBUixDQUF4RSxFQUErRkEsUUFBUSxVQUFSLENBQS9GLEVBQW1IQSxRQUFRLG1CQUFSLENBQW5ILEVBQWdKQSxRQUFRLFlBQVIsQ0FBaEosQ0FBekQsQ0FBM0s7QUFBNFksQ0FBMVosQ0FBMlpyZ0IsTUFBM1osRUFBa2EsVUFBUzNCLENBQVQsRUFBVztBQUFDLFNBQU9BLENBQVA7QUFBUyxDQUF2YixDQUQvNmIsRUFDdzJjLFVBQVNBLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsZ0JBQVksT0FBT3NkLE1BQW5CLElBQTJCQSxPQUFPQyxHQUFsQyxHQUFzQ0QsT0FBTyxnQ0FBUCxFQUF3QyxDQUFDLG1CQUFELEVBQXFCLHNCQUFyQixDQUF4QyxFQUFxRnRkLENBQXJGLENBQXRDLEdBQThILG9CQUFpQnFkLE1BQWpCLHlDQUFpQkEsTUFBakIsTUFBeUJBLE9BQU9ELE9BQWhDLEdBQXdDQyxPQUFPRCxPQUFQLEdBQWVwZCxFQUFFNmlCLFFBQVEsVUFBUixDQUFGLEVBQXNCQSxRQUFRLGdCQUFSLENBQXRCLENBQXZELEdBQXdHaGlCLEVBQUV1bUIsUUFBRixHQUFXcG5CLEVBQUVhLEVBQUV1bUIsUUFBSixFQUFhdm1CLEVBQUV3bEIsWUFBZixDQUFqUDtBQUE4USxDQUE1UixDQUE2UjdqQixNQUE3UixFQUFvUyxVQUFTM0IsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxXQUFTVCxDQUFULENBQVdzQixDQUFYLEVBQWFiLENBQWIsRUFBZVQsQ0FBZixFQUFpQjtBQUFDLFdBQU0sQ0FBQ1MsSUFBRWEsQ0FBSCxJQUFNdEIsQ0FBTixHQUFRc0IsQ0FBZDtBQUFnQixLQUFFdXFCLGFBQUYsQ0FBZ0IvdEIsSUFBaEIsQ0FBcUIsaUJBQXJCLEVBQXdDLElBQUk2bEIsSUFBRXJpQixFQUFFcUIsU0FBUixDQUFrQixPQUFPZ2hCLEVBQUU0VyxlQUFGLEdBQWtCLFlBQVU7QUFBQyxTQUFLendCLEVBQUwsQ0FBUSxVQUFSLEVBQW1CLEtBQUswd0IsZ0JBQXhCLEdBQTBDLEtBQUsxd0IsRUFBTCxDQUFRLFlBQVIsRUFBcUIsS0FBSzJ3QixrQkFBMUIsQ0FBMUMsRUFBd0YsS0FBSzN3QixFQUFMLENBQVEsU0FBUixFQUFrQixLQUFLNHdCLGVBQXZCLENBQXhGLENBQWdJLElBQUlwNUIsSUFBRSxLQUFLb08sT0FBTCxDQUFhaXJCLFFBQW5CLENBQTRCLElBQUdyNUIsQ0FBSCxFQUFLO0FBQUMsVUFBSWIsSUFBRSxJQUFOLENBQVdlLFdBQVcsWUFBVTtBQUFDZixVQUFFbTZCLGVBQUYsQ0FBa0J0NUIsQ0FBbEI7QUFBcUIsT0FBM0M7QUFBNkM7QUFBQyxHQUF4UCxFQUF5UHFpQixFQUFFaVgsZUFBRixHQUFrQixVQUFTNTZCLENBQVQsRUFBVztBQUFDQSxRQUFFUyxFQUFFMG1CLGVBQUYsQ0FBa0JubkIsQ0FBbEIsQ0FBRixDQUF1QixJQUFJMmpCLElBQUVyaUIsRUFBRTFELElBQUYsQ0FBT29DLENBQVAsQ0FBTixDQUFnQixJQUFHMmpCLEtBQUdBLEtBQUcsSUFBVCxFQUFjO0FBQUMsV0FBS2tYLFlBQUwsR0FBa0JsWCxDQUFsQixDQUFvQixJQUFJQyxJQUFFLElBQU4sQ0FBVyxLQUFLa1gsb0JBQUwsR0FBMEIsWUFBVTtBQUFDbFgsVUFBRW1YLGtCQUFGO0FBQXVCLE9BQTVELEVBQTZEcFgsRUFBRTdaLEVBQUYsQ0FBSyxRQUFMLEVBQWMsS0FBS2d4QixvQkFBbkIsQ0FBN0QsRUFBc0csS0FBS2h4QixFQUFMLENBQVEsYUFBUixFQUFzQixLQUFLa3hCLGdCQUEzQixDQUF0RyxFQUFtSixLQUFLRCxrQkFBTCxDQUF3QixDQUFDLENBQXpCLENBQW5KO0FBQStLO0FBQUMsR0FBNWhCLEVBQTZoQnBYLEVBQUVvWCxrQkFBRixHQUFxQixVQUFTejVCLENBQVQsRUFBVztBQUFDLFFBQUcsS0FBS3U1QixZQUFSLEVBQXFCO0FBQUMsVUFBSXA2QixJQUFFLEtBQUtvNkIsWUFBTCxDQUFrQjdNLGFBQWxCLENBQWdDLENBQWhDLENBQU47QUFBQSxVQUF5Q3JLLElBQUUsS0FBS2tYLFlBQUwsQ0FBa0JqUyxLQUFsQixDQUF3QjNxQixPQUF4QixDQUFnQ3dDLENBQWhDLENBQTNDO0FBQUEsVUFBOEVtakIsSUFBRUQsSUFBRSxLQUFLa1gsWUFBTCxDQUFrQjdNLGFBQWxCLENBQWdDMXVCLE1BQWxDLEdBQXlDLENBQXpIO0FBQUEsVUFBMkhra0IsSUFBRWhrQixLQUFLODFCLEtBQUwsQ0FBV3QxQixFQUFFMmpCLENBQUYsRUFBSUMsQ0FBSixFQUFNLEtBQUtpWCxZQUFMLENBQWtCdlMsU0FBeEIsQ0FBWCxDQUE3SCxDQUE0SyxJQUFHLEtBQUs4RixVQUFMLENBQWdCNUssQ0FBaEIsRUFBa0IsQ0FBQyxDQUFuQixFQUFxQmxpQixDQUFyQixHQUF3QixLQUFLMjVCLHlCQUFMLEVBQXhCLEVBQXlELEVBQUV6WCxLQUFHLEtBQUtvRixLQUFMLENBQVd0cEIsTUFBaEIsQ0FBNUQsRUFBb0Y7QUFBQyxZQUFJd2tCLElBQUUsS0FBSzhFLEtBQUwsQ0FBVy9vQixLQUFYLENBQWlCOGpCLENBQWpCLEVBQW1CQyxJQUFFLENBQXJCLENBQU4sQ0FBOEIsS0FBS3NYLG1CQUFMLEdBQXlCcFgsRUFBRW5qQixHQUFGLENBQU0sVUFBU1csQ0FBVCxFQUFXO0FBQUMsaUJBQU9BLEVBQUVrRSxPQUFUO0FBQWlCLFNBQW5DLENBQXpCLEVBQThELEtBQUsyMUIsc0JBQUwsQ0FBNEIsS0FBNUIsQ0FBOUQ7QUFBaUc7QUFBQztBQUFDLEdBQXQ5QixFQUF1OUJ4WCxFQUFFd1gsc0JBQUYsR0FBeUIsVUFBUzc1QixDQUFULEVBQVc7QUFBQyxTQUFLNDVCLG1CQUFMLENBQXlCcDhCLE9BQXpCLENBQWlDLFVBQVMyQixDQUFULEVBQVc7QUFBQ0EsUUFBRXdoQixTQUFGLENBQVkzZ0IsQ0FBWixFQUFlLGlCQUFmO0FBQWtDLEtBQS9FO0FBQWlGLEdBQTdrQyxFQUE4a0NxaUIsRUFBRTZXLGdCQUFGLEdBQW1CLFlBQVU7QUFBQyxTQUFLTyxrQkFBTCxDQUF3QixDQUFDLENBQXpCO0FBQTRCLEdBQXhvQyxFQUF5b0NwWCxFQUFFc1gseUJBQUYsR0FBNEIsWUFBVTtBQUFDLFNBQUtDLG1CQUFMLEtBQTJCLEtBQUtDLHNCQUFMLENBQTRCLFFBQTVCLEdBQXNDLE9BQU8sS0FBS0QsbUJBQTdFO0FBQWtHLEdBQWx4QyxFQUFteEN2WCxFQUFFcVgsZ0JBQUYsR0FBbUIsVUFBUzE1QixDQUFULEVBQVdiLENBQVgsRUFBYVQsQ0FBYixFQUFlMmpCLENBQWYsRUFBaUI7QUFBQyxnQkFBVSxPQUFPQSxDQUFqQixJQUFvQixLQUFLa1gsWUFBTCxDQUFrQnpNLFVBQWxCLENBQTZCekssQ0FBN0IsQ0FBcEI7QUFBb0QsR0FBNTJDLEVBQTYyQ0EsRUFBRThXLGtCQUFGLEdBQXFCLFlBQVU7QUFBQyxTQUFLUSx5QkFBTDtBQUFpQyxHQUE5NkMsRUFBKzZDdFgsRUFBRStXLGVBQUYsR0FBa0IsWUFBVTtBQUFDLFNBQUtHLFlBQUwsS0FBb0IsS0FBS0EsWUFBTCxDQUFrQjF3QixHQUFsQixDQUFzQixRQUF0QixFQUErQixLQUFLMndCLG9CQUFwQyxHQUEwRCxLQUFLM3dCLEdBQUwsQ0FBUyxhQUFULEVBQXVCLEtBQUs2d0IsZ0JBQTVCLENBQTFELEVBQXdHLE9BQU8sS0FBS0gsWUFBeEk7QUFBc0osR0FBbG1ELEVBQW1tRHY1QixDQUExbUQ7QUFBNG1ELENBQTEvRCxDQUR4MmMsRUFDbzJnQixVQUFTQSxDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDO0FBQWEsZ0JBQVksT0FBT3NkLE1BQW5CLElBQTJCQSxPQUFPQyxHQUFsQyxHQUFzQ0QsT0FBTywyQkFBUCxFQUFtQyxDQUFDLHVCQUFELENBQW5DLEVBQTZELFVBQVMvZCxDQUFULEVBQVc7QUFBQyxXQUFPUyxFQUFFYSxDQUFGLEVBQUl0QixDQUFKLENBQVA7QUFBYyxHQUF2RixDQUF0QyxHQUErSCxvQkFBaUI4ZCxNQUFqQix5Q0FBaUJBLE1BQWpCLE1BQXlCQSxPQUFPRCxPQUFoQyxHQUF3Q0MsT0FBT0QsT0FBUCxHQUFlcGQsRUFBRWEsQ0FBRixFQUFJZ2lCLFFBQVEsWUFBUixDQUFKLENBQXZELEdBQWtGaGlCLEVBQUU4NUIsWUFBRixHQUFlMzZCLEVBQUVhLENBQUYsRUFBSUEsRUFBRStpQixTQUFOLENBQWhPO0FBQWlQLENBQTVRLENBQTZRcGhCLE1BQTdRLEVBQW9SLFVBQVMzQixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFdBQVNULENBQVQsQ0FBV3NCLENBQVgsRUFBYWIsQ0FBYixFQUFlO0FBQUMsU0FBSSxJQUFJVCxDQUFSLElBQWFTLENBQWI7QUFBZWEsUUFBRXRCLENBQUYsSUFBS1MsRUFBRVQsQ0FBRixDQUFMO0FBQWYsS0FBeUIsT0FBT3NCLENBQVA7QUFBUyxZQUFTcWlCLENBQVQsQ0FBV3JpQixDQUFYLEVBQWE7QUFBQyxRQUFJYixJQUFFLEVBQU4sQ0FBUyxJQUFHaUMsTUFBTTBLLE9BQU4sQ0FBYzlMLENBQWQsQ0FBSCxFQUFvQmIsSUFBRWEsQ0FBRixDQUFwQixLQUE2QixJQUFHLFlBQVUsT0FBT0EsRUFBRWhDLE1BQXRCLEVBQTZCLEtBQUksSUFBSVUsSUFBRSxDQUFWLEVBQVlBLElBQUVzQixFQUFFaEMsTUFBaEIsRUFBdUJVLEdBQXZCO0FBQTJCUyxRQUFFM0MsSUFBRixDQUFPd0QsRUFBRXRCLENBQUYsQ0FBUDtBQUEzQixLQUE3QixNQUEwRVMsRUFBRTNDLElBQUYsQ0FBT3dELENBQVAsRUFBVSxPQUFPYixDQUFQO0FBQVMsWUFBU21qQixDQUFULENBQVd0aUIsQ0FBWCxFQUFhYixDQUFiLEVBQWUraUIsQ0FBZixFQUFpQjtBQUFDLFdBQU8sZ0JBQWdCSSxDQUFoQixJQUFtQixZQUFVLE9BQU90aUIsQ0FBakIsS0FBcUJBLElBQUVILFNBQVN1VCxnQkFBVCxDQUEwQnBULENBQTFCLENBQXZCLEdBQXFELEtBQUsrZ0IsUUFBTCxHQUFjc0IsRUFBRXJpQixDQUFGLENBQW5FLEVBQXdFLEtBQUtvTyxPQUFMLEdBQWExUCxFQUFFLEVBQUYsRUFBSyxLQUFLMFAsT0FBVixDQUFyRixFQUF3RyxjQUFZLE9BQU9qUCxDQUFuQixHQUFxQitpQixJQUFFL2lCLENBQXZCLEdBQXlCVCxFQUFFLEtBQUswUCxPQUFQLEVBQWVqUCxDQUFmLENBQWpJLEVBQW1KK2lCLEtBQUcsS0FBSzFaLEVBQUwsQ0FBUSxRQUFSLEVBQWlCMFosQ0FBakIsQ0FBdEosRUFBMEssS0FBSzZYLFNBQUwsRUFBMUssRUFBMkw1WCxNQUFJLEtBQUs2WCxVQUFMLEdBQWdCLElBQUk3WCxFQUFFOFgsUUFBTixFQUFwQixDQUEzTCxFQUErTixLQUFLLzVCLFdBQVcsWUFBVTtBQUFDLFdBQUtnNkIsS0FBTDtBQUFhLEtBQXhCLENBQXlCbjNCLElBQXpCLENBQThCLElBQTlCLENBQVgsQ0FBdlAsSUFBd1MsSUFBSXVmLENBQUosQ0FBTXRpQixDQUFOLEVBQVFiLENBQVIsRUFBVStpQixDQUFWLENBQS9TO0FBQTRULFlBQVNBLENBQVQsQ0FBV2xpQixDQUFYLEVBQWE7QUFBQyxTQUFLMDRCLEdBQUwsR0FBUzE0QixDQUFUO0FBQVcsWUFBU3dpQixDQUFULENBQVd4aUIsQ0FBWCxFQUFhYixDQUFiLEVBQWU7QUFBQyxTQUFLZzdCLEdBQUwsR0FBU242QixDQUFULEVBQVcsS0FBS2tFLE9BQUwsR0FBYS9FLENBQXhCLEVBQTBCLEtBQUt1NUIsR0FBTCxHQUFTLElBQUkwQixLQUFKLEVBQW5DO0FBQTZDLE9BQUlqWSxJQUFFbmlCLEVBQUU2RCxNQUFSO0FBQUEsTUFBZXVlLElBQUVwaUIsRUFBRWxDLE9BQW5CLENBQTJCd2tCLEVBQUVqaEIsU0FBRixHQUFZMUQsT0FBTzhvQixNQUFQLENBQWN0bkIsRUFBRWtDLFNBQWhCLENBQVosRUFBdUNpaEIsRUFBRWpoQixTQUFGLENBQVkrTSxPQUFaLEdBQW9CLEVBQTNELEVBQThEa1UsRUFBRWpoQixTQUFGLENBQVkwNEIsU0FBWixHQUFzQixZQUFVO0FBQUMsU0FBS25yQixNQUFMLEdBQVksRUFBWixFQUFlLEtBQUttUyxRQUFMLENBQWN2akIsT0FBZCxDQUFzQixLQUFLNjhCLGdCQUEzQixFQUE0QyxJQUE1QyxDQUFmO0FBQWlFLEdBQWhLLEVBQWlLL1gsRUFBRWpoQixTQUFGLENBQVlnNUIsZ0JBQVosR0FBNkIsVUFBU3I2QixDQUFULEVBQVc7QUFBQyxhQUFPQSxFQUFFdVgsUUFBVCxJQUFtQixLQUFLK2lCLFFBQUwsQ0FBY3Q2QixDQUFkLENBQW5CLEVBQW9DLEtBQUtvTyxPQUFMLENBQWFtc0IsVUFBYixLQUEwQixDQUFDLENBQTNCLElBQThCLEtBQUtDLDBCQUFMLENBQWdDeDZCLENBQWhDLENBQWxFLENBQXFHLElBQUliLElBQUVhLEVBQUU4akIsUUFBUixDQUFpQixJQUFHM2tCLEtBQUdvakIsRUFBRXBqQixDQUFGLENBQU4sRUFBVztBQUFDLFdBQUksSUFBSVQsSUFBRXNCLEVBQUVvVCxnQkFBRixDQUFtQixLQUFuQixDQUFOLEVBQWdDaVAsSUFBRSxDQUF0QyxFQUF3Q0EsSUFBRTNqQixFQUFFVixNQUE1QyxFQUFtRHFrQixHQUFuRCxFQUF1RDtBQUFDLFlBQUlDLElBQUU1akIsRUFBRTJqQixDQUFGLENBQU4sQ0FBVyxLQUFLaVksUUFBTCxDQUFjaFksQ0FBZDtBQUFpQixXQUFHLFlBQVUsT0FBTyxLQUFLbFUsT0FBTCxDQUFhbXNCLFVBQWpDLEVBQTRDO0FBQUMsWUFBSXJZLElBQUVsaUIsRUFBRW9ULGdCQUFGLENBQW1CLEtBQUtoRixPQUFMLENBQWFtc0IsVUFBaEMsQ0FBTixDQUFrRCxLQUFJbFksSUFBRSxDQUFOLEVBQVFBLElBQUVILEVBQUVsa0IsTUFBWixFQUFtQnFrQixHQUFuQixFQUF1QjtBQUFDLGNBQUlHLElBQUVOLEVBQUVHLENBQUYsQ0FBTixDQUFXLEtBQUttWSwwQkFBTCxDQUFnQ2hZLENBQWhDO0FBQW1DO0FBQUM7QUFBQztBQUFDLEdBQXhrQixDQUF5a0IsSUFBSUQsSUFBRSxFQUFDLEdBQUUsQ0FBQyxDQUFKLEVBQU0sR0FBRSxDQUFDLENBQVQsRUFBVyxJQUFHLENBQUMsQ0FBZixFQUFOLENBQXdCLE9BQU9ELEVBQUVqaEIsU0FBRixDQUFZbTVCLDBCQUFaLEdBQXVDLFVBQVN4NkIsQ0FBVCxFQUFXO0FBQUMsUUFBSWIsSUFBRTZMLGlCQUFpQmhMLENBQWpCLENBQU4sQ0FBMEIsSUFBR2IsQ0FBSCxFQUFLLEtBQUksSUFBSVQsSUFBRSx5QkFBTixFQUFnQzJqQixJQUFFM2pCLEVBQUU4RSxJQUFGLENBQU9yRSxFQUFFMGdCLGVBQVQsQ0FBdEMsRUFBZ0UsU0FBT3dDLENBQXZFLEdBQTBFO0FBQUMsVUFBSUMsSUFBRUQsS0FBR0EsRUFBRSxDQUFGLENBQVQsQ0FBY0MsS0FBRyxLQUFLbVksYUFBTCxDQUFtQm5ZLENBQW5CLEVBQXFCdGlCLENBQXJCLENBQUgsRUFBMkJxaUIsSUFBRTNqQixFQUFFOEUsSUFBRixDQUFPckUsRUFBRTBnQixlQUFULENBQTdCO0FBQXVEO0FBQUMsR0FBbk8sRUFBb095QyxFQUFFamhCLFNBQUYsQ0FBWWk1QixRQUFaLEdBQXFCLFVBQVN0NkIsQ0FBVCxFQUFXO0FBQUMsUUFBSWIsSUFBRSxJQUFJK2lCLENBQUosQ0FBTWxpQixDQUFOLENBQU4sQ0FBZSxLQUFLNE8sTUFBTCxDQUFZcFMsSUFBWixDQUFpQjJDLENBQWpCO0FBQW9CLEdBQXhTLEVBQXlTbWpCLEVBQUVqaEIsU0FBRixDQUFZbzVCLGFBQVosR0FBMEIsVUFBU3o2QixDQUFULEVBQVdiLENBQVgsRUFBYTtBQUFDLFFBQUlULElBQUUsSUFBSThqQixDQUFKLENBQU14aUIsQ0FBTixFQUFRYixDQUFSLENBQU4sQ0FBaUIsS0FBS3lQLE1BQUwsQ0FBWXBTLElBQVosQ0FBaUJrQyxDQUFqQjtBQUFvQixHQUF0WCxFQUF1WDRqQixFQUFFamhCLFNBQUYsQ0FBWTY0QixLQUFaLEdBQWtCLFlBQVU7QUFBQyxhQUFTbDZCLENBQVQsQ0FBV0EsQ0FBWCxFQUFhdEIsQ0FBYixFQUFlMmpCLENBQWYsRUFBaUI7QUFBQ25pQixpQkFBVyxZQUFVO0FBQUNmLFVBQUV1N0IsUUFBRixDQUFXMTZCLENBQVgsRUFBYXRCLENBQWIsRUFBZTJqQixDQUFmO0FBQWtCLE9BQXhDO0FBQTBDLFNBQUlsakIsSUFBRSxJQUFOLENBQVcsT0FBTyxLQUFLdzdCLGVBQUwsR0FBcUIsQ0FBckIsRUFBdUIsS0FBS0MsWUFBTCxHQUFrQixDQUFDLENBQTFDLEVBQTRDLEtBQUtoc0IsTUFBTCxDQUFZNVEsTUFBWixHQUFtQixLQUFLLEtBQUs0USxNQUFMLENBQVlwUixPQUFaLENBQW9CLFVBQVMyQixDQUFULEVBQVc7QUFBQ0EsUUFBRTZqQixJQUFGLENBQU8sVUFBUCxFQUFrQmhqQixDQUFsQixHQUFxQmIsRUFBRSs2QixLQUFGLEVBQXJCO0FBQStCLEtBQS9ELENBQXhCLEdBQXlGLEtBQUssS0FBS3ByQixRQUFMLEVBQWpKO0FBQWlLLEdBQTVuQixFQUE2bkJ3VCxFQUFFamhCLFNBQUYsQ0FBWXE1QixRQUFaLEdBQXFCLFVBQVMxNkIsQ0FBVCxFQUFXYixDQUFYLEVBQWFULENBQWIsRUFBZTtBQUFDLFNBQUtpOEIsZUFBTCxJQUF1QixLQUFLQyxZQUFMLEdBQWtCLEtBQUtBLFlBQUwsSUFBbUIsQ0FBQzU2QixFQUFFNjZCLFFBQS9ELEVBQXdFLEtBQUszWCxTQUFMLENBQWUsVUFBZixFQUEwQixDQUFDLElBQUQsRUFBTWxqQixDQUFOLEVBQVFiLENBQVIsQ0FBMUIsQ0FBeEUsRUFBOEcsS0FBSzY2QixVQUFMLElBQWlCLEtBQUtBLFVBQUwsQ0FBZ0JjLE1BQWpDLElBQXlDLEtBQUtkLFVBQUwsQ0FBZ0JjLE1BQWhCLENBQXVCLElBQXZCLEVBQTRCOTZCLENBQTVCLENBQXZKLEVBQXNMLEtBQUsyNkIsZUFBTCxJQUFzQixLQUFLL3JCLE1BQUwsQ0FBWTVRLE1BQWxDLElBQTBDLEtBQUs4USxRQUFMLEVBQWhPLEVBQWdQLEtBQUtWLE9BQUwsQ0FBYTJzQixLQUFiLElBQW9CM1ksQ0FBcEIsSUFBdUJBLEVBQUU0WSxHQUFGLENBQU0sZUFBYXQ4QixDQUFuQixFQUFxQnNCLENBQXJCLEVBQXVCYixDQUF2QixDQUF2UTtBQUFpUyxHQUFuOEIsRUFBbzhCbWpCLEVBQUVqaEIsU0FBRixDQUFZeU4sUUFBWixHQUFxQixZQUFVO0FBQUMsUUFBSTlPLElBQUUsS0FBSzQ2QixZQUFMLEdBQWtCLE1BQWxCLEdBQXlCLE1BQS9CLENBQXNDLElBQUcsS0FBS0ssVUFBTCxHQUFnQixDQUFDLENBQWpCLEVBQW1CLEtBQUsvWCxTQUFMLENBQWVsakIsQ0FBZixFQUFpQixDQUFDLElBQUQsQ0FBakIsQ0FBbkIsRUFBNEMsS0FBS2tqQixTQUFMLENBQWUsUUFBZixFQUF3QixDQUFDLElBQUQsQ0FBeEIsQ0FBNUMsRUFBNEUsS0FBSzhXLFVBQXBGLEVBQStGO0FBQUMsVUFBSTc2QixJQUFFLEtBQUt5N0IsWUFBTCxHQUFrQixRQUFsQixHQUEyQixTQUFqQyxDQUEyQyxLQUFLWixVQUFMLENBQWdCNzZCLENBQWhCLEVBQW1CLElBQW5CO0FBQXlCO0FBQUMsR0FBL3FDLEVBQWdyQytpQixFQUFFN2dCLFNBQUYsR0FBWTFELE9BQU84b0IsTUFBUCxDQUFjdG5CLEVBQUVrQyxTQUFoQixDQUE1ckMsRUFBdXRDNmdCLEVBQUU3Z0IsU0FBRixDQUFZNjRCLEtBQVosR0FBa0IsWUFBVTtBQUFDLFFBQUlsNkIsSUFBRSxLQUFLazdCLGtCQUFMLEVBQU4sQ0FBZ0MsT0FBT2w3QixJQUFFLEtBQUssS0FBS203QixPQUFMLENBQWEsTUFBSSxLQUFLekMsR0FBTCxDQUFTMEMsWUFBMUIsRUFBdUMsY0FBdkMsQ0FBUCxJQUErRCxLQUFLQyxVQUFMLEdBQWdCLElBQUlqQixLQUFKLEVBQWhCLEVBQTBCLEtBQUtpQixVQUFMLENBQWdCNXFCLGdCQUFoQixDQUFpQyxNQUFqQyxFQUF3QyxJQUF4QyxDQUExQixFQUF3RSxLQUFLNHFCLFVBQUwsQ0FBZ0I1cUIsZ0JBQWhCLENBQWlDLE9BQWpDLEVBQXlDLElBQXpDLENBQXhFLEVBQXVILEtBQUtpb0IsR0FBTCxDQUFTam9CLGdCQUFULENBQTBCLE1BQTFCLEVBQWlDLElBQWpDLENBQXZILEVBQThKLEtBQUtpb0IsR0FBTCxDQUFTam9CLGdCQUFULENBQTBCLE9BQTFCLEVBQWtDLElBQWxDLENBQTlKLEVBQXNNLE1BQUssS0FBSzRxQixVQUFMLENBQWdCcHNCLEdBQWhCLEdBQW9CLEtBQUt5cEIsR0FBTCxDQUFTenBCLEdBQWxDLENBQXJRLENBQVA7QUFBb1QsR0FBeGtELEVBQXlrRGlULEVBQUU3Z0IsU0FBRixDQUFZNjVCLGtCQUFaLEdBQStCLFlBQVU7QUFBQyxXQUFPLEtBQUt4QyxHQUFMLENBQVM1cEIsUUFBVCxJQUFtQixLQUFLLENBQUwsS0FBUyxLQUFLNHBCLEdBQUwsQ0FBUzBDLFlBQTVDO0FBQXlELEdBQTVxRCxFQUE2cURsWixFQUFFN2dCLFNBQUYsQ0FBWTg1QixPQUFaLEdBQW9CLFVBQVNuN0IsQ0FBVCxFQUFXYixDQUFYLEVBQWE7QUFBQyxTQUFLMDdCLFFBQUwsR0FBYzc2QixDQUFkLEVBQWdCLEtBQUtrakIsU0FBTCxDQUFlLFVBQWYsRUFBMEIsQ0FBQyxJQUFELEVBQU0sS0FBS3dWLEdBQVgsRUFBZXY1QixDQUFmLENBQTFCLENBQWhCO0FBQTZELEdBQTV3RCxFQUE2d0QraUIsRUFBRTdnQixTQUFGLENBQVl5a0IsV0FBWixHQUF3QixVQUFTOWxCLENBQVQsRUFBVztBQUFDLFFBQUliLElBQUUsT0FBS2EsRUFBRTVDLElBQWIsQ0FBa0IsS0FBSytCLENBQUwsS0FBUyxLQUFLQSxDQUFMLEVBQVFhLENBQVIsQ0FBVDtBQUFvQixHQUF2MUQsRUFBdzFEa2lCLEVBQUU3Z0IsU0FBRixDQUFZeTNCLE1BQVosR0FBbUIsWUFBVTtBQUFDLFNBQUtxQyxPQUFMLENBQWEsQ0FBQyxDQUFkLEVBQWdCLFFBQWhCLEdBQTBCLEtBQUtHLFlBQUwsRUFBMUI7QUFBOEMsR0FBcDZELEVBQXE2RHBaLEVBQUU3Z0IsU0FBRixDQUFZMDNCLE9BQVosR0FBb0IsWUFBVTtBQUFDLFNBQUtvQyxPQUFMLENBQWEsQ0FBQyxDQUFkLEVBQWdCLFNBQWhCLEdBQTJCLEtBQUtHLFlBQUwsRUFBM0I7QUFBK0MsR0FBbi9ELEVBQW8vRHBaLEVBQUU3Z0IsU0FBRixDQUFZaTZCLFlBQVosR0FBeUIsWUFBVTtBQUFDLFNBQUtELFVBQUwsQ0FBZ0J4ckIsbUJBQWhCLENBQW9DLE1BQXBDLEVBQTJDLElBQTNDLEdBQWlELEtBQUt3ckIsVUFBTCxDQUFnQnhyQixtQkFBaEIsQ0FBb0MsT0FBcEMsRUFBNEMsSUFBNUMsQ0FBakQsRUFBbUcsS0FBSzZvQixHQUFMLENBQVM3b0IsbUJBQVQsQ0FBNkIsTUFBN0IsRUFBb0MsSUFBcEMsQ0FBbkcsRUFBNkksS0FBSzZvQixHQUFMLENBQVM3b0IsbUJBQVQsQ0FBNkIsT0FBN0IsRUFBcUMsSUFBckMsQ0FBN0k7QUFBd0wsR0FBaHRFLEVBQWl0RTJTLEVBQUVuaEIsU0FBRixHQUFZMUQsT0FBTzhvQixNQUFQLENBQWN2RSxFQUFFN2dCLFNBQWhCLENBQTd0RSxFQUF3dkVtaEIsRUFBRW5oQixTQUFGLENBQVk2NEIsS0FBWixHQUFrQixZQUFVO0FBQUMsU0FBS3hCLEdBQUwsQ0FBU2pvQixnQkFBVCxDQUEwQixNQUExQixFQUFpQyxJQUFqQyxHQUF1QyxLQUFLaW9CLEdBQUwsQ0FBU2pvQixnQkFBVCxDQUEwQixPQUExQixFQUFrQyxJQUFsQyxDQUF2QyxFQUErRSxLQUFLaW9CLEdBQUwsQ0FBU3pwQixHQUFULEdBQWEsS0FBS2tyQixHQUFqRyxDQUFxRyxJQUFJbjZCLElBQUUsS0FBS2s3QixrQkFBTCxFQUFOLENBQWdDbDdCLE1BQUksS0FBS203QixPQUFMLENBQWEsTUFBSSxLQUFLekMsR0FBTCxDQUFTMEMsWUFBMUIsRUFBdUMsY0FBdkMsR0FBdUQsS0FBS0UsWUFBTCxFQUEzRDtBQUFnRixHQUExK0UsRUFBMitFOVksRUFBRW5oQixTQUFGLENBQVlpNkIsWUFBWixHQUF5QixZQUFVO0FBQUMsU0FBSzVDLEdBQUwsQ0FBUzdvQixtQkFBVCxDQUE2QixNQUE3QixFQUFvQyxJQUFwQyxHQUEwQyxLQUFLNm9CLEdBQUwsQ0FBUzdvQixtQkFBVCxDQUE2QixPQUE3QixFQUFxQyxJQUFyQyxDQUExQztBQUFxRixHQUFwbUYsRUFBcW1GMlMsRUFBRW5oQixTQUFGLENBQVk4NUIsT0FBWixHQUFvQixVQUFTbjdCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsU0FBSzA3QixRQUFMLEdBQWM3NkIsQ0FBZCxFQUFnQixLQUFLa2pCLFNBQUwsQ0FBZSxVQUFmLEVBQTBCLENBQUMsSUFBRCxFQUFNLEtBQUtoZixPQUFYLEVBQW1CL0UsQ0FBbkIsQ0FBMUIsQ0FBaEI7QUFBaUUsR0FBeHNGLEVBQXlzRm1qQixFQUFFaVosZ0JBQUYsR0FBbUIsVUFBU3A4QixDQUFULEVBQVc7QUFBQ0EsUUFBRUEsS0FBR2EsRUFBRTZELE1BQVAsRUFBYzFFLE1BQUlnakIsSUFBRWhqQixDQUFGLEVBQUlnakIsRUFBRXZnQixFQUFGLENBQUtrNEIsWUFBTCxHQUFrQixVQUFTOTVCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsVUFBSVQsSUFBRSxJQUFJNGpCLENBQUosQ0FBTSxJQUFOLEVBQVd0aUIsQ0FBWCxFQUFhYixDQUFiLENBQU4sQ0FBc0IsT0FBT1QsRUFBRXM3QixVQUFGLENBQWF3QixPQUFiLENBQXFCclosRUFBRSxJQUFGLENBQXJCLENBQVA7QUFBcUMsS0FBbkcsQ0FBZDtBQUFtSCxHQUEzMUYsRUFBNDFGRyxFQUFFaVosZ0JBQUYsRUFBNTFGLEVBQWkzRmpaLENBQXgzRjtBQUEwM0YsQ0FBLzNJLENBRHAyZ0IsRUFDcXVwQixVQUFTdGlCLENBQVQsRUFBV2IsQ0FBWCxFQUFhO0FBQUMsZ0JBQVksT0FBT3NkLE1BQW5CLElBQTJCQSxPQUFPQyxHQUFsQyxHQUFzQ0QsT0FBTyxDQUFDLG1CQUFELEVBQXFCLDJCQUFyQixDQUFQLEVBQXlELFVBQVMvZCxDQUFULEVBQVcyakIsQ0FBWCxFQUFhO0FBQUMsV0FBT2xqQixFQUFFYSxDQUFGLEVBQUl0QixDQUFKLEVBQU0yakIsQ0FBTixDQUFQO0FBQWdCLEdBQXZGLENBQXRDLEdBQStILG9CQUFpQjdGLE1BQWpCLHlDQUFpQkEsTUFBakIsTUFBeUJBLE9BQU9ELE9BQWhDLEdBQXdDQyxPQUFPRCxPQUFQLEdBQWVwZCxFQUFFYSxDQUFGLEVBQUlnaUIsUUFBUSxVQUFSLENBQUosRUFBd0JBLFFBQVEsY0FBUixDQUF4QixDQUF2RCxHQUF3R2hpQixFQUFFdW1CLFFBQUYsR0FBV3BuQixFQUFFYSxDQUFGLEVBQUlBLEVBQUV1bUIsUUFBTixFQUFldm1CLEVBQUU4NUIsWUFBakIsQ0FBbFA7QUFBaVIsQ0FBL1IsQ0FBZ1NuNEIsTUFBaFMsRUFBdVMsVUFBUzNCLENBQVQsRUFBV2IsQ0FBWCxFQUFhVCxDQUFiLEVBQWU7QUFBQztBQUFhUyxJQUFFb3JCLGFBQUYsQ0FBZ0IvdEIsSUFBaEIsQ0FBcUIscUJBQXJCLEVBQTRDLElBQUk2bEIsSUFBRWxqQixFQUFFa0MsU0FBUixDQUFrQixPQUFPZ2hCLEVBQUVvWixtQkFBRixHQUFzQixZQUFVO0FBQUMsU0FBS2p6QixFQUFMLENBQVEsVUFBUixFQUFtQixLQUFLc3hCLFlBQXhCO0FBQXNDLEdBQXZFLEVBQXdFelgsRUFBRXlYLFlBQUYsR0FBZSxZQUFVO0FBQUMsYUFBUzk1QixDQUFULENBQVdBLENBQVgsRUFBYXRCLENBQWIsRUFBZTtBQUFDLFVBQUkyakIsSUFBRWxqQixFQUFFOHRCLGFBQUYsQ0FBZ0J2dUIsRUFBRWc2QixHQUFsQixDQUFOLENBQTZCdjVCLEVBQUVzNUIsY0FBRixDQUFpQnBXLEtBQUdBLEVBQUVuZSxPQUF0QixHQUErQi9FLEVBQUVpUCxPQUFGLENBQVVxbEIsVUFBVixJQUFzQnQwQixFQUFFNnBCLHdCQUFGLEVBQXJEO0FBQWtGLFNBQUcsS0FBSzVhLE9BQUwsQ0FBYTByQixZQUFoQixFQUE2QjtBQUFDLFVBQUkzNkIsSUFBRSxJQUFOLENBQVdULEVBQUUsS0FBS21xQixNQUFQLEVBQWVyZ0IsRUFBZixDQUFrQixVQUFsQixFQUE2QnhJLENBQTdCO0FBQWdDO0FBQUMsR0FBM1MsRUFBNFNiLENBQW5UO0FBQXFULENBQXZyQixDQURydXBCOzs7OztBQ1hBOzs7OztBQUtBOztBQUVFLFdBQVV3QyxNQUFWLEVBQWtCMmEsT0FBbEIsRUFBNEI7QUFDNUI7QUFDQTtBQUNBLE1BQUssT0FBT0csTUFBUCxJQUFpQixVQUFqQixJQUErQkEsT0FBT0MsR0FBM0MsRUFBaUQ7QUFDL0M7QUFDQUQsV0FBUSxDQUNOLG1CQURNLEVBRU4sc0JBRk0sQ0FBUixFQUdHSCxPQUhIO0FBSUQsR0FORCxNQU1PLElBQUssUUFBT0UsTUFBUCx5Q0FBT0EsTUFBUCxNQUFpQixRQUFqQixJQUE2QkEsT0FBT0QsT0FBekMsRUFBbUQ7QUFDeEQ7QUFDQUMsV0FBT0QsT0FBUCxHQUFpQkQsUUFDZjBGLFFBQVEsVUFBUixDQURlLEVBRWZBLFFBQVEsZ0JBQVIsQ0FGZSxDQUFqQjtBQUlELEdBTk0sTUFNQTtBQUNMO0FBQ0ExRixZQUNFM2EsT0FBTzRrQixRQURULEVBRUU1a0IsT0FBTzZqQixZQUZUO0FBSUQ7QUFFRixDQXZCQyxFQXVCQzdqQixNQXZCRCxFQXVCUyxTQUFTMmEsT0FBVCxDQUFrQmlLLFFBQWxCLEVBQTRCbVYsS0FBNUIsRUFBb0M7QUFDL0M7QUFDQTs7QUFFQW5WLFdBQVNnRSxhQUFULENBQXVCL3RCLElBQXZCLENBQTRCLG1CQUE1Qjs7QUFFQSxNQUFJbS9CLFFBQVFwVixTQUFTbGxCLFNBQXJCOztBQUVBczZCLFFBQU1DLGlCQUFOLEdBQTBCLFlBQVc7QUFDbkMsU0FBS3B6QixFQUFMLENBQVMsUUFBVCxFQUFtQixLQUFLcXpCLFVBQXhCO0FBQ0QsR0FGRDs7QUFJQUYsUUFBTUUsVUFBTixHQUFtQixZQUFXO0FBQzVCLFFBQUloRCxXQUFXLEtBQUt6cUIsT0FBTCxDQUFheXRCLFVBQTVCO0FBQ0EsUUFBSyxDQUFDaEQsUUFBTixFQUFpQjtBQUNmO0FBQ0Q7O0FBRUQ7QUFDQSxRQUFJaUQsV0FBVyxPQUFPakQsUUFBUCxJQUFtQixRQUFuQixHQUE4QkEsUUFBOUIsR0FBeUMsQ0FBeEQ7QUFDQSxRQUFJa0QsWUFBWSxLQUFLN08sdUJBQUwsQ0FBOEI0TyxRQUE5QixDQUFoQjs7QUFFQSxTQUFNLElBQUlwOUIsSUFBRSxDQUFaLEVBQWVBLElBQUlxOUIsVUFBVS85QixNQUE3QixFQUFxQ1UsR0FBckMsRUFBMkM7QUFDekMsVUFBSXM5QixXQUFXRCxVQUFVcjlCLENBQVYsQ0FBZjtBQUNBLFdBQUt1OUIsY0FBTCxDQUFxQkQsUUFBckI7QUFDQTtBQUNBLFVBQUkvdEIsV0FBVyt0QixTQUFTNW9CLGdCQUFULENBQTBCLDZCQUExQixDQUFmO0FBQ0EsV0FBTSxJQUFJOG9CLElBQUUsQ0FBWixFQUFlQSxJQUFJanVCLFNBQVNqUSxNQUE1QixFQUFvQ2srQixHQUFwQyxFQUEwQztBQUN4QyxhQUFLRCxjQUFMLENBQXFCaHVCLFNBQVNpdUIsQ0FBVCxDQUFyQjtBQUNEO0FBQ0Y7QUFDRixHQW5CRDs7QUFxQkFQLFFBQU1NLGNBQU4sR0FBdUIsVUFBVXg5QixJQUFWLEVBQWlCO0FBQ3RDLFFBQUlqRCxPQUFPaUQsS0FBSzJhLFlBQUwsQ0FBa0IsMkJBQWxCLENBQVg7QUFDQSxRQUFLNWQsSUFBTCxFQUFZO0FBQ1YsVUFBSTJnQyxZQUFKLENBQWtCMTlCLElBQWxCLEVBQXdCakQsSUFBeEIsRUFBOEIsSUFBOUI7QUFDRDtBQUNGLEdBTEQ7O0FBT0E7O0FBRUE7OztBQUdBLFdBQVMyZ0MsWUFBVCxDQUF1QjE5QixJQUF2QixFQUE2QjA3QixHQUE3QixFQUFrQ3hCLFFBQWxDLEVBQTZDO0FBQzNDLFNBQUt6MEIsT0FBTCxHQUFlekYsSUFBZjtBQUNBLFNBQUswN0IsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsU0FBS3pCLEdBQUwsR0FBVyxJQUFJMEIsS0FBSixFQUFYO0FBQ0EsU0FBS3pCLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0EsU0FBS3pqQixJQUFMO0FBQ0Q7O0FBRURpbkIsZUFBYTk2QixTQUFiLENBQXVCeWtCLFdBQXZCLEdBQXFDNFYsTUFBTTVWLFdBQTNDOztBQUVBcVcsZUFBYTk2QixTQUFiLENBQXVCNlQsSUFBdkIsR0FBOEIsWUFBVztBQUN2QyxTQUFLd2pCLEdBQUwsQ0FBU2pvQixnQkFBVCxDQUEyQixNQUEzQixFQUFtQyxJQUFuQztBQUNBLFNBQUtpb0IsR0FBTCxDQUFTam9CLGdCQUFULENBQTJCLE9BQTNCLEVBQW9DLElBQXBDO0FBQ0E7QUFDQSxTQUFLaW9CLEdBQUwsQ0FBU3pwQixHQUFULEdBQWUsS0FBS2tyQixHQUFwQjtBQUNBO0FBQ0EsU0FBS2oyQixPQUFMLENBQWF3cEIsZUFBYixDQUE2QiwyQkFBN0I7QUFDRCxHQVBEOztBQVNBeU8sZUFBYTk2QixTQUFiLENBQXVCeTNCLE1BQXZCLEdBQWdDLFVBQVVyeUIsS0FBVixFQUFrQjtBQUNoRCxTQUFLdkMsT0FBTCxDQUFhakUsS0FBYixDQUFtQjRmLGVBQW5CLEdBQXFDLFNBQVMsS0FBS3NhLEdBQWQsR0FBb0IsR0FBekQ7QUFDQSxTQUFLcnJCLFFBQUwsQ0FBZXJJLEtBQWYsRUFBc0Isd0JBQXRCO0FBQ0QsR0FIRDs7QUFLQTAxQixlQUFhOTZCLFNBQWIsQ0FBdUIwM0IsT0FBdkIsR0FBaUMsVUFBVXR5QixLQUFWLEVBQWtCO0FBQ2pELFNBQUtxSSxRQUFMLENBQWVySSxLQUFmLEVBQXNCLHVCQUF0QjtBQUNELEdBRkQ7O0FBSUEwMUIsZUFBYTk2QixTQUFiLENBQXVCeU4sUUFBdkIsR0FBa0MsVUFBVXJJLEtBQVYsRUFBaUI5SyxTQUFqQixFQUE2QjtBQUM3RDtBQUNBLFNBQUsrOEIsR0FBTCxDQUFTN29CLG1CQUFULENBQThCLE1BQTlCLEVBQXNDLElBQXRDO0FBQ0EsU0FBSzZvQixHQUFMLENBQVM3b0IsbUJBQVQsQ0FBOEIsT0FBOUIsRUFBdUMsSUFBdkM7O0FBRUEsU0FBSzNMLE9BQUwsQ0FBYXljLFNBQWIsQ0FBdUJFLEdBQXZCLENBQTRCbGxCLFNBQTVCO0FBQ0EsU0FBS2c5QixRQUFMLENBQWMzbUIsYUFBZCxDQUE2QixZQUE3QixFQUEyQ3ZMLEtBQTNDLEVBQWtELEtBQUt2QyxPQUF2RDtBQUNELEdBUEQ7O0FBU0E7O0FBRUFxaUIsV0FBUzRWLFlBQVQsR0FBd0JBLFlBQXhCOztBQUVBLFNBQU81VixRQUFQO0FBRUMsQ0EvR0MsQ0FBRjs7Ozs7QUNQQTs7Ozs7Ozs7QUFRQTtBQUNBOztBQUVBO0FBQ0MsV0FBVWpLLE9BQVYsRUFBbUI7QUFDaEI7O0FBQ0EsUUFBSSxPQUFPRyxNQUFQLEtBQWtCLFVBQWxCLElBQWdDQSxPQUFPQyxHQUEzQyxFQUFnRDtBQUM1QztBQUNBRCxlQUFPLENBQUMsUUFBRCxDQUFQLEVBQW1CSCxPQUFuQjtBQUNILEtBSEQsTUFHTyxJQUFJLFFBQU9DLE9BQVAseUNBQU9BLE9BQVAsT0FBbUIsUUFBbkIsSUFBK0IsT0FBT3lGLE9BQVAsS0FBbUIsVUFBdEQsRUFBa0U7QUFDckU7QUFDQTFGLGdCQUFRMEYsUUFBUSxRQUFSLENBQVI7QUFDSCxLQUhNLE1BR0E7QUFDSDtBQUNBMUYsZ0JBQVF6WSxNQUFSO0FBQ0g7QUFDSixDQVpBLEVBWUMsVUFBVTVJLENBQVYsRUFBYTtBQUNYOztBQUVBLFFBQ0l5Z0MsUUFBUyxZQUFZO0FBQ2pCLGVBQU87QUFDSFUsOEJBQWtCLDBCQUFVdnlCLEtBQVYsRUFBaUI7QUFDL0IsdUJBQU9BLE1BQU1qRyxPQUFOLENBQWMscUJBQWQsRUFBcUMsTUFBckMsQ0FBUDtBQUNILGFBSEU7QUFJSHk0Qix3QkFBWSxvQkFBVUMsY0FBVixFQUEwQjtBQUNsQyxvQkFBSUMsTUFBTTE4QixTQUFTQyxhQUFULENBQXVCLEtBQXZCLENBQVY7QUFDQXk4QixvQkFBSTVnQyxTQUFKLEdBQWdCMmdDLGNBQWhCO0FBQ0FDLG9CQUFJdDhCLEtBQUosQ0FBVTZGLFFBQVYsR0FBcUIsVUFBckI7QUFDQXkyQixvQkFBSXQ4QixLQUFKLENBQVU4akIsT0FBVixHQUFvQixNQUFwQjtBQUNBLHVCQUFPd1ksR0FBUDtBQUNIO0FBVkUsU0FBUDtBQVlILEtBYlEsRUFEYjtBQUFBLFFBZ0JJMytCLE9BQU87QUFDSDQrQixhQUFLLEVBREY7QUFFSEMsYUFBSyxDQUZGO0FBR0hDLGdCQUFRLEVBSEw7QUFJSEMsY0FBTSxFQUpIO0FBS0hDLFlBQUksRUFMRDtBQU1IQyxlQUFPLEVBTko7QUFPSEMsY0FBTTtBQVBILEtBaEJYOztBQTBCQSxhQUFTQyxZQUFULENBQXNCejlCLEVBQXRCLEVBQTBCOE8sT0FBMUIsRUFBbUM7QUFDL0IsWUFBSTJDLE9BQU85VixFQUFFOFYsSUFBYjtBQUFBLFlBQ0lpc0IsT0FBTyxJQURYO0FBQUEsWUFFSTdvQixXQUFXO0FBQ1A4b0IsMEJBQWMsRUFEUDtBQUVQQyw2QkFBaUIsS0FGVjtBQUdQbDhCLHNCQUFVbkIsU0FBUzBGLElBSFo7QUFJUDQzQix3QkFBWSxJQUpMO0FBS1BDLG9CQUFRLElBTEQ7QUFNUEMsc0JBQVUsSUFOSDtBQU9QdjRCLG1CQUFPLE1BUEE7QUFRUHc0QixzQkFBVSxDQVJIO0FBU1BDLHVCQUFXLEdBVEo7QUFVUEMsNEJBQWdCLENBVlQ7QUFXUEMsb0JBQVEsRUFYRDtBQVlQQywwQkFBY1gsYUFBYVcsWUFacEI7QUFhUEMsdUJBQVcsSUFiSjtBQWNQQyxvQkFBUSxJQWREO0FBZVB4Z0Msa0JBQU0sS0FmQztBQWdCUHlnQyxxQkFBUyxLQWhCRjtBQWlCUEMsMkJBQWUvc0IsSUFqQlI7QUFrQlBndEIsOEJBQWtCaHRCLElBbEJYO0FBbUJQaXRCLDJCQUFlanRCLElBbkJSO0FBb0JQa3RCLDJCQUFlLEtBcEJSO0FBcUJQM0IsNEJBQWdCLDBCQXJCVDtBQXNCUDRCLHlCQUFhLEtBdEJOO0FBdUJQQyxzQkFBVSxNQXZCSDtBQXdCUEMsNEJBQWdCLElBeEJUO0FBeUJQQyx1Q0FBMkIsSUF6QnBCO0FBMEJQQywrQkFBbUIsSUExQlo7QUEyQlBDLDBCQUFjLHNCQUFVQyxVQUFWLEVBQXNCQyxhQUF0QixFQUFxQ0MsY0FBckMsRUFBcUQ7QUFDL0QsdUJBQU9GLFdBQVczMEIsS0FBWCxDQUFpQjNOLFdBQWpCLEdBQStCUyxPQUEvQixDQUF1QytoQyxjQUF2QyxNQUEyRCxDQUFDLENBQW5FO0FBQ0gsYUE3Qk07QUE4QlBDLHVCQUFXLE9BOUJKO0FBK0JQQyw2QkFBaUIseUJBQVVwbkIsUUFBVixFQUFvQjtBQUNqQyx1QkFBTyxPQUFPQSxRQUFQLEtBQW9CLFFBQXBCLEdBQStCdmMsRUFBRTRqQyxTQUFGLENBQVlybkIsUUFBWixDQUEvQixHQUF1REEsUUFBOUQ7QUFDSCxhQWpDTTtBQWtDUHNuQixvQ0FBd0IsS0FsQ2pCO0FBbUNQQyxnQ0FBb0IsWUFuQ2I7QUFvQ1BDLHlCQUFhLFFBcENOO0FBcUNQQyw4QkFBa0I7QUFyQ1gsU0FGZjs7QUEwQ0E7QUFDQWpDLGFBQUs5NEIsT0FBTCxHQUFlNUUsRUFBZjtBQUNBMDlCLGFBQUsxOUIsRUFBTCxHQUFVckUsRUFBRXFFLEVBQUYsQ0FBVjtBQUNBMDlCLGFBQUtrQyxXQUFMLEdBQW1CLEVBQW5CO0FBQ0FsQyxhQUFLbUMsVUFBTCxHQUFrQixFQUFsQjtBQUNBbkMsYUFBS3ZTLGFBQUwsR0FBcUIsQ0FBQyxDQUF0QjtBQUNBdVMsYUFBS29DLFlBQUwsR0FBb0JwQyxLQUFLOTRCLE9BQUwsQ0FBYTJGLEtBQWpDO0FBQ0FtekIsYUFBS3FDLFVBQUwsR0FBa0IsQ0FBbEI7QUFDQXJDLGFBQUtzQyxjQUFMLEdBQXNCLEVBQXRCO0FBQ0F0QyxhQUFLdUMsZ0JBQUwsR0FBd0IsSUFBeEI7QUFDQXZDLGFBQUt3QyxRQUFMLEdBQWdCLElBQWhCO0FBQ0F4QyxhQUFLeUMsT0FBTCxHQUFlLEtBQWY7QUFDQXpDLGFBQUswQyxvQkFBTCxHQUE0QixJQUE1QjtBQUNBMUMsYUFBSzJDLHNCQUFMLEdBQThCLElBQTlCO0FBQ0EzQyxhQUFLNXVCLE9BQUwsR0FBZW5ULEVBQUV5TSxNQUFGLENBQVMsRUFBVCxFQUFheU0sUUFBYixFQUF1Qi9GLE9BQXZCLENBQWY7QUFDQTR1QixhQUFLNEMsT0FBTCxHQUFlO0FBQ1hDLHNCQUFVLHVCQURDO0FBRVhyQix3QkFBWTtBQUZELFNBQWY7QUFJQXhCLGFBQUs4QyxJQUFMLEdBQVksSUFBWjtBQUNBOUMsYUFBSytDLFNBQUwsR0FBaUIsRUFBakI7QUFDQS9DLGFBQUtnRCxTQUFMLEdBQWlCLElBQWpCOztBQUVBO0FBQ0FoRCxhQUFLaUQsVUFBTDtBQUNBakQsYUFBS2tELFVBQUwsQ0FBZ0I5eEIsT0FBaEI7QUFDSDs7QUFFRDJ1QixpQkFBYXJCLEtBQWIsR0FBcUJBLEtBQXJCOztBQUVBemdDLE1BQUU4aEMsWUFBRixHQUFpQkEsWUFBakI7O0FBRUFBLGlCQUFhVyxZQUFiLEdBQTRCLFVBQVVjLFVBQVYsRUFBc0JZLFlBQXRCLEVBQW9DO0FBQzVEO0FBQ0EsWUFBSSxDQUFDQSxZQUFMLEVBQW1CO0FBQ2YsbUJBQU9aLFdBQVczMEIsS0FBbEI7QUFDSDs7QUFFRCxZQUFJczJCLFVBQVUsTUFBTXpFLE1BQU1VLGdCQUFOLENBQXVCZ0QsWUFBdkIsQ0FBTixHQUE2QyxHQUEzRDs7QUFFQSxlQUFPWixXQUFXMzBCLEtBQVgsQ0FDRmpHLE9BREUsQ0FDTSxJQUFJdzhCLE1BQUosQ0FBV0QsT0FBWCxFQUFvQixJQUFwQixDQUROLEVBQ2lDLHNCQURqQyxFQUVGdjhCLE9BRkUsQ0FFTSxJQUZOLEVBRVksT0FGWixFQUdGQSxPQUhFLENBR00sSUFITixFQUdZLE1BSFosRUFJRkEsT0FKRSxDQUlNLElBSk4sRUFJWSxNQUpaLEVBS0ZBLE9BTEUsQ0FLTSxJQUxOLEVBS1ksUUFMWixFQU1GQSxPQU5FLENBTU0sc0JBTk4sRUFNOEIsTUFOOUIsQ0FBUDtBQU9ILEtBZkQ7O0FBaUJBbTVCLGlCQUFhMTdCLFNBQWIsR0FBeUI7O0FBRXJCZy9CLGtCQUFVLElBRlc7O0FBSXJCSixvQkFBWSxzQkFBWTtBQUNwQixnQkFBSWpELE9BQU8sSUFBWDtBQUFBLGdCQUNJc0QscUJBQXFCLE1BQU10RCxLQUFLNEMsT0FBTCxDQUFhcEIsVUFENUM7QUFBQSxnQkFFSXFCLFdBQVc3QyxLQUFLNEMsT0FBTCxDQUFhQyxRQUY1QjtBQUFBLGdCQUdJenhCLFVBQVU0dUIsS0FBSzV1QixPQUhuQjtBQUFBLGdCQUlJME8sU0FKSjs7QUFNQTtBQUNBa2dCLGlCQUFLOTRCLE9BQUwsQ0FBYXNiLFlBQWIsQ0FBMEIsY0FBMUIsRUFBMEMsS0FBMUM7O0FBRUF3ZCxpQkFBS3FELFFBQUwsR0FBZ0IsVUFBVWxoQyxDQUFWLEVBQWE7QUFDekIsb0JBQUksQ0FBQ2xFLEVBQUVrRSxFQUFFc0osTUFBSixFQUFZZ0wsT0FBWixDQUFvQixNQUFNdXBCLEtBQUs1dUIsT0FBTCxDQUFha3VCLGNBQXZDLEVBQXVEdCtCLE1BQTVELEVBQW9FO0FBQ2hFZy9CLHlCQUFLdUQsZUFBTDtBQUNBdkQseUJBQUt3RCxlQUFMO0FBQ0g7QUFDSixhQUxEOztBQU9BO0FBQ0F4RCxpQkFBSzJDLHNCQUFMLEdBQThCMWtDLEVBQUUsZ0RBQUYsRUFDQ3djLElBREQsQ0FDTSxLQUFLckosT0FBTCxDQUFhMndCLGtCQURuQixFQUN1QzUwQixHQUR2QyxDQUMyQyxDQUQzQyxDQUE5Qjs7QUFHQTZ5QixpQkFBSzBDLG9CQUFMLEdBQTRCM0MsYUFBYXJCLEtBQWIsQ0FBbUJXLFVBQW5CLENBQThCanVCLFFBQVFrdUIsY0FBdEMsQ0FBNUI7O0FBRUF4Zix3QkFBWTdoQixFQUFFK2hDLEtBQUswQyxvQkFBUCxDQUFaOztBQUVBNWlCLHNCQUFVOWIsUUFBVixDQUFtQm9OLFFBQVFwTixRQUEzQjs7QUFFQTtBQUNBLGdCQUFJb04sUUFBUXRKLEtBQVIsS0FBa0IsTUFBdEIsRUFBOEI7QUFDMUJnWSwwQkFBVXJULEdBQVYsQ0FBYyxPQUFkLEVBQXVCMkUsUUFBUXRKLEtBQS9CO0FBQ0g7O0FBRUQ7QUFDQWdZLHNCQUFVdFUsRUFBVixDQUFhLHdCQUFiLEVBQXVDODNCLGtCQUF2QyxFQUEyRCxZQUFZO0FBQ25FdEQscUJBQUtuUyxRQUFMLENBQWM1dkIsRUFBRSxJQUFGLEVBQVFxQixJQUFSLENBQWEsT0FBYixDQUFkO0FBQ0gsYUFGRDs7QUFJQTtBQUNBd2dCLHNCQUFVdFUsRUFBVixDQUFhLHVCQUFiLEVBQXNDLFlBQVk7QUFDOUN3MEIscUJBQUt2UyxhQUFMLEdBQXFCLENBQUMsQ0FBdEI7QUFDQTNOLDBCQUFVN08sUUFBVixDQUFtQixNQUFNNHhCLFFBQXpCLEVBQW1DMytCLFdBQW5DLENBQStDMitCLFFBQS9DO0FBQ0gsYUFIRDs7QUFLQTtBQUNBL2lCLHNCQUFVdFUsRUFBVixDQUFhLG9CQUFiLEVBQW1DODNCLGtCQUFuQyxFQUF1RCxZQUFZO0FBQy9EdEQscUJBQUt0VixNQUFMLENBQVl6c0IsRUFBRSxJQUFGLEVBQVFxQixJQUFSLENBQWEsT0FBYixDQUFaO0FBQ0EsdUJBQU8sS0FBUDtBQUNILGFBSEQ7O0FBS0EwZ0MsaUJBQUt5RCxrQkFBTCxHQUEwQixZQUFZO0FBQ2xDLG9CQUFJekQsS0FBSzBELE9BQVQsRUFBa0I7QUFDZDFELHlCQUFLMkQsV0FBTDtBQUNIO0FBQ0osYUFKRDs7QUFNQTFsQyxjQUFFMEcsTUFBRixFQUFVNkcsRUFBVixDQUFhLHFCQUFiLEVBQW9DdzBCLEtBQUt5RCxrQkFBekM7O0FBRUF6RCxpQkFBSzE5QixFQUFMLENBQVFrSixFQUFSLENBQVcsc0JBQVgsRUFBbUMsVUFBVXJKLENBQVYsRUFBYTtBQUFFNjlCLHFCQUFLNEQsVUFBTCxDQUFnQnpoQyxDQUFoQjtBQUFxQixhQUF2RTtBQUNBNjlCLGlCQUFLMTlCLEVBQUwsQ0FBUWtKLEVBQVIsQ0FBVyxvQkFBWCxFQUFpQyxVQUFVckosQ0FBVixFQUFhO0FBQUU2OUIscUJBQUs2RCxPQUFMLENBQWExaEMsQ0FBYjtBQUFrQixhQUFsRTtBQUNBNjlCLGlCQUFLMTlCLEVBQUwsQ0FBUWtKLEVBQVIsQ0FBVyxtQkFBWCxFQUFnQyxZQUFZO0FBQUV3MEIscUJBQUs4RCxNQUFMO0FBQWdCLGFBQTlEO0FBQ0E5RCxpQkFBSzE5QixFQUFMLENBQVFrSixFQUFSLENBQVcsb0JBQVgsRUFBaUMsWUFBWTtBQUFFdzBCLHFCQUFLK0QsT0FBTDtBQUFpQixhQUFoRTtBQUNBL0QsaUJBQUsxOUIsRUFBTCxDQUFRa0osRUFBUixDQUFXLHFCQUFYLEVBQWtDLFVBQVVySixDQUFWLEVBQWE7QUFBRTY5QixxQkFBSzZELE9BQUwsQ0FBYTFoQyxDQUFiO0FBQWtCLGFBQW5FO0FBQ0E2OUIsaUJBQUsxOUIsRUFBTCxDQUFRa0osRUFBUixDQUFXLG9CQUFYLEVBQWlDLFVBQVVySixDQUFWLEVBQWE7QUFBRTY5QixxQkFBSzZELE9BQUwsQ0FBYTFoQyxDQUFiO0FBQWtCLGFBQWxFO0FBQ0gsU0FuRW9COztBQXFFckI0aEMsaUJBQVMsbUJBQVk7QUFDakIsZ0JBQUkvRCxPQUFPLElBQVg7O0FBRUFBLGlCQUFLMkQsV0FBTDs7QUFFQSxnQkFBSTNELEtBQUsxOUIsRUFBTCxDQUFRc00sR0FBUixHQUFjNU4sTUFBZCxJQUF3QmcvQixLQUFLNXVCLE9BQUwsQ0FBYWt2QixRQUF6QyxFQUFtRDtBQUMvQ04scUJBQUtnRSxhQUFMO0FBQ0g7QUFDSixTQTdFb0I7O0FBK0VyQkYsZ0JBQVEsa0JBQVk7QUFDaEIsaUJBQUtHLGNBQUw7QUFDSCxTQWpGb0I7O0FBbUZyQkMsbUJBQVcscUJBQVk7QUFDbkIsZ0JBQUlsRSxPQUFPLElBQVg7QUFDQSxnQkFBSUEsS0FBS29CLGNBQVQsRUFBeUI7QUFDckJwQixxQkFBS29CLGNBQUwsQ0FBb0IrQyxLQUFwQjtBQUNBbkUscUJBQUtvQixjQUFMLEdBQXNCLElBQXRCO0FBQ0g7QUFDSixTQXpGb0I7O0FBMkZyQjhCLG9CQUFZLG9CQUFVa0IsZUFBVixFQUEyQjtBQUNuQyxnQkFBSXBFLE9BQU8sSUFBWDtBQUFBLGdCQUNJNXVCLFVBQVU0dUIsS0FBSzV1QixPQURuQjs7QUFHQW5ULGNBQUV5TSxNQUFGLENBQVMwRyxPQUFULEVBQWtCZ3pCLGVBQWxCOztBQUVBcEUsaUJBQUt5QyxPQUFMLEdBQWV4a0MsRUFBRTZRLE9BQUYsQ0FBVXNDLFFBQVFndkIsTUFBbEIsQ0FBZjs7QUFFQSxnQkFBSUosS0FBS3lDLE9BQVQsRUFBa0I7QUFDZHJ4Qix3QkFBUWd2QixNQUFSLEdBQWlCSixLQUFLcUUsdUJBQUwsQ0FBNkJqekIsUUFBUWd2QixNQUFyQyxDQUFqQjtBQUNIOztBQUVEaHZCLG9CQUFRNHdCLFdBQVIsR0FBc0JoQyxLQUFLc0UsbUJBQUwsQ0FBeUJsekIsUUFBUTR3QixXQUFqQyxFQUE4QyxRQUE5QyxDQUF0Qjs7QUFFQTtBQUNBL2pDLGNBQUUraEMsS0FBSzBDLG9CQUFQLEVBQTZCajJCLEdBQTdCLENBQWlDO0FBQzdCLDhCQUFjMkUsUUFBUW12QixTQUFSLEdBQW9CLElBREw7QUFFN0IseUJBQVNudkIsUUFBUXRKLEtBQVIsR0FBZ0IsSUFGSTtBQUc3QiwyQkFBV3NKLFFBQVF3dkI7QUFIVSxhQUFqQztBQUtILFNBL0dvQjs7QUFrSHJCMkQsb0JBQVksc0JBQVk7QUFDcEIsaUJBQUtqQyxjQUFMLEdBQXNCLEVBQXRCO0FBQ0EsaUJBQUtILFVBQUwsR0FBa0IsRUFBbEI7QUFDSCxTQXJIb0I7O0FBdUhyQjlILGVBQU8saUJBQVk7QUFDZixpQkFBS2tLLFVBQUw7QUFDQSxpQkFBS25DLFlBQUwsR0FBb0IsRUFBcEI7QUFDQSxpQkFBS0YsV0FBTCxHQUFtQixFQUFuQjtBQUNILFNBM0hvQjs7QUE2SHJCbEssaUJBQVMsbUJBQVk7QUFDakIsZ0JBQUlnSSxPQUFPLElBQVg7QUFDQUEsaUJBQUsxSCxRQUFMLEdBQWdCLElBQWhCO0FBQ0FrTSwwQkFBY3hFLEtBQUt1QyxnQkFBbkI7QUFDQXZDLGlCQUFLa0UsU0FBTDtBQUNILFNBbElvQjs7QUFvSXJCN0wsZ0JBQVEsa0JBQVk7QUFDaEIsaUJBQUtDLFFBQUwsR0FBZ0IsS0FBaEI7QUFDSCxTQXRJb0I7O0FBd0lyQnFMLHFCQUFhLHVCQUFZO0FBQ3JCOztBQUVBLGdCQUFJM0QsT0FBTyxJQUFYO0FBQUEsZ0JBQ0l5RSxhQUFheG1DLEVBQUUraEMsS0FBSzBDLG9CQUFQLENBRGpCO0FBQUEsZ0JBRUlnQyxrQkFBa0JELFdBQVd0OUIsTUFBWCxHQUFvQmdHLEdBQXBCLENBQXdCLENBQXhCLENBRnRCO0FBR0E7QUFDQTtBQUNBLGdCQUFJdTNCLG9CQUFvQjdoQyxTQUFTMEYsSUFBN0IsSUFBcUMsQ0FBQ3kzQixLQUFLNXVCLE9BQUwsQ0FBYTZ3QixnQkFBdkQsRUFBeUU7QUFDckU7QUFDSDtBQUNELGdCQUFJMEMsZ0JBQWdCMW1DLEVBQUUsY0FBRixDQUFwQjtBQUNBO0FBQ0EsZ0JBQUkrakMsY0FBY2hDLEtBQUs1dUIsT0FBTCxDQUFhNHdCLFdBQS9CO0FBQUEsZ0JBQ0k0QyxrQkFBa0JILFdBQVdwZSxXQUFYLEVBRHRCO0FBQUEsZ0JBRUl4ZSxTQUFTODhCLGNBQWN0ZSxXQUFkLEVBRmI7QUFBQSxnQkFHSXplLFNBQVMrOEIsY0FBYy84QixNQUFkLEVBSGI7QUFBQSxnQkFJSWk5QixTQUFTLEVBQUUsT0FBT2o5QixPQUFPTCxHQUFoQixFQUFxQixRQUFRSyxPQUFPSCxJQUFwQyxFQUpiOztBQU1BLGdCQUFJdTZCLGdCQUFnQixNQUFwQixFQUE0QjtBQUN4QixvQkFBSThDLGlCQUFpQjdtQyxFQUFFMEcsTUFBRixFQUFVa0QsTUFBVixFQUFyQjtBQUFBLG9CQUNJc1EsWUFBWWxhLEVBQUUwRyxNQUFGLEVBQVV3VCxTQUFWLEVBRGhCO0FBQUEsb0JBRUk0c0IsY0FBYyxDQUFDNXNCLFNBQUQsR0FBYXZRLE9BQU9MLEdBQXBCLEdBQTBCcTlCLGVBRjVDO0FBQUEsb0JBR0lJLGlCQUFpQjdzQixZQUFZMnNCLGNBQVosSUFBOEJsOUIsT0FBT0wsR0FBUCxHQUFhTSxNQUFiLEdBQXNCKzhCLGVBQXBELENBSHJCOztBQUtBNUMsOEJBQWU5Z0MsS0FBS3dFLEdBQUwsQ0FBU3EvQixXQUFULEVBQXNCQyxjQUF0QixNQUEwQ0QsV0FBM0MsR0FBMEQsS0FBMUQsR0FBa0UsUUFBaEY7QUFDSDs7QUFFRCxnQkFBSS9DLGdCQUFnQixLQUFwQixFQUEyQjtBQUN2QjZDLHVCQUFPdDlCLEdBQVAsSUFBYyxDQUFDcTlCLGVBQWY7QUFDSCxhQUZELE1BRU87QUFDSEMsdUJBQU90OUIsR0FBUCxJQUFjTSxNQUFkO0FBQ0g7O0FBRUQ7QUFDQTtBQUNBLGdCQUFHNjhCLG9CQUFvQjdoQyxTQUFTMEYsSUFBaEMsRUFBc0M7QUFDbEMsb0JBQUkwOEIsVUFBVVIsV0FBV2g0QixHQUFYLENBQWUsU0FBZixDQUFkO0FBQUEsb0JBQ0l5NEIsZ0JBREo7O0FBR0ksb0JBQUksQ0FBQ2xGLEtBQUswRCxPQUFWLEVBQWtCO0FBQ2RlLCtCQUFXaDRCLEdBQVgsQ0FBZSxTQUFmLEVBQTBCLENBQTFCLEVBQTZCeUQsSUFBN0I7QUFDSDs7QUFFTGcxQixtQ0FBbUJULFdBQVdyZ0IsWUFBWCxHQUEwQnhjLE1BQTFCLEVBQW5CO0FBQ0FpOUIsdUJBQU90OUIsR0FBUCxJQUFjMjlCLGlCQUFpQjM5QixHQUEvQjtBQUNBczlCLHVCQUFPcDlCLElBQVAsSUFBZXk5QixpQkFBaUJ6OUIsSUFBaEM7O0FBRUEsb0JBQUksQ0FBQ3U0QixLQUFLMEQsT0FBVixFQUFrQjtBQUNkZSwrQkFBV2g0QixHQUFYLENBQWUsU0FBZixFQUEwQnc0QixPQUExQixFQUFtQzMwQixJQUFuQztBQUNIO0FBQ0o7O0FBRUQsZ0JBQUkwdkIsS0FBSzV1QixPQUFMLENBQWF0SixLQUFiLEtBQXVCLE1BQTNCLEVBQW1DO0FBQy9CKzhCLHVCQUFPLzhCLEtBQVAsR0FBZTY4QixjQUFjdmUsVUFBZCxLQUE2QixJQUE1QztBQUNIOztBQUVEcWUsdUJBQVdoNEIsR0FBWCxDQUFlbzRCLE1BQWY7QUFDSCxTQWxNb0I7O0FBb01yQlosd0JBQWdCLDBCQUFZO0FBQ3hCLGdCQUFJakUsT0FBTyxJQUFYO0FBQ0EvaEMsY0FBRTRFLFFBQUYsRUFBWTJJLEVBQVosQ0FBZSxvQkFBZixFQUFxQ3cwQixLQUFLcUQsUUFBMUM7QUFDSCxTQXZNb0I7O0FBeU1yQkcseUJBQWlCLDJCQUFZO0FBQ3pCLGdCQUFJeEQsT0FBTyxJQUFYO0FBQ0EvaEMsY0FBRTRFLFFBQUYsRUFBWWdKLEdBQVosQ0FBZ0Isb0JBQWhCLEVBQXNDbTBCLEtBQUtxRCxRQUEzQztBQUNILFNBNU1vQjs7QUE4TXJCRSx5QkFBaUIsMkJBQVk7QUFDekIsZ0JBQUl2RCxPQUFPLElBQVg7QUFDQUEsaUJBQUttRixtQkFBTDtBQUNBbkYsaUJBQUtxQyxVQUFMLEdBQWtCMTlCLE9BQU95Z0MsV0FBUCxDQUFtQixZQUFZO0FBQzdDLG9CQUFJcEYsS0FBSzBELE9BQVQsRUFBa0I7QUFDZDtBQUNBO0FBQ0E7QUFDQSx3QkFBSSxDQUFDMUQsS0FBSzV1QixPQUFMLENBQWE2dkIsYUFBbEIsRUFBaUM7QUFDN0JqQiw2QkFBSzE5QixFQUFMLENBQVFzTSxHQUFSLENBQVlveEIsS0FBS29DLFlBQWpCO0FBQ0g7O0FBRURwQyx5QkFBSzF2QixJQUFMO0FBQ0g7O0FBRUQwdkIscUJBQUttRixtQkFBTDtBQUNILGFBYmlCLEVBYWYsRUFiZSxDQUFsQjtBQWNILFNBL05vQjs7QUFpT3JCQSw2QkFBcUIsK0JBQVk7QUFDN0J4Z0MsbUJBQU82L0IsYUFBUCxDQUFxQixLQUFLbkMsVUFBMUI7QUFDSCxTQW5Pb0I7O0FBcU9yQmdELHVCQUFlLHlCQUFZO0FBQ3ZCLGdCQUFJckYsT0FBTyxJQUFYO0FBQUEsZ0JBQ0lzRixZQUFZdEYsS0FBSzE5QixFQUFMLENBQVFzTSxHQUFSLEdBQWM1TixNQUQ5QjtBQUFBLGdCQUVJdWtDLGlCQUFpQnZGLEtBQUs5NEIsT0FBTCxDQUFhcStCLGNBRmxDO0FBQUEsZ0JBR0lDLEtBSEo7O0FBS0EsZ0JBQUksT0FBT0QsY0FBUCxLQUEwQixRQUE5QixFQUF3QztBQUNwQyx1QkFBT0EsbUJBQW1CRCxTQUExQjtBQUNIO0FBQ0QsZ0JBQUl6aUMsU0FBU21nQyxTQUFiLEVBQXdCO0FBQ3BCd0Msd0JBQVEzaUMsU0FBU21nQyxTQUFULENBQW1CeUMsV0FBbkIsRUFBUjtBQUNBRCxzQkFBTUUsU0FBTixDQUFnQixXQUFoQixFQUE2QixDQUFDSixTQUE5QjtBQUNBLHVCQUFPQSxjQUFjRSxNQUFNcjNCLElBQU4sQ0FBV25OLE1BQWhDO0FBQ0g7QUFDRCxtQkFBTyxJQUFQO0FBQ0gsU0FwUG9COztBQXNQckI0aUMsb0JBQVksb0JBQVV6aEMsQ0FBVixFQUFhO0FBQ3JCLGdCQUFJNjlCLE9BQU8sSUFBWDs7QUFFQTtBQUNBLGdCQUFJLENBQUNBLEtBQUsxSCxRQUFOLElBQWtCLENBQUMwSCxLQUFLMEQsT0FBeEIsSUFBbUN2aEMsRUFBRXdILEtBQUYsS0FBWS9JLEtBQUtrL0IsSUFBcEQsSUFBNERFLEtBQUtvQyxZQUFyRSxFQUFtRjtBQUMvRXBDLHFCQUFLMkYsT0FBTDtBQUNBO0FBQ0g7O0FBRUQsZ0JBQUkzRixLQUFLMUgsUUFBTCxJQUFpQixDQUFDMEgsS0FBSzBELE9BQTNCLEVBQW9DO0FBQ2hDO0FBQ0g7O0FBRUQsb0JBQVF2aEMsRUFBRXdILEtBQVY7QUFDSSxxQkFBSy9JLEtBQUs0K0IsR0FBVjtBQUNJUSx5QkFBSzE5QixFQUFMLENBQVFzTSxHQUFSLENBQVlveEIsS0FBS29DLFlBQWpCO0FBQ0FwQyx5QkFBSzF2QixJQUFMO0FBQ0E7QUFDSixxQkFBSzFQLEtBQUtpL0IsS0FBVjtBQUNJLHdCQUFJRyxLQUFLOEMsSUFBTCxJQUFhOUMsS0FBSzV1QixPQUFMLENBQWF3MEIsTUFBMUIsSUFBb0M1RixLQUFLcUYsYUFBTCxFQUF4QyxFQUE4RDtBQUMxRHJGLDZCQUFLNkYsVUFBTDtBQUNBO0FBQ0g7QUFDRDtBQUNKLHFCQUFLamxDLEtBQUs2K0IsR0FBVjtBQUNJLHdCQUFJTyxLQUFLOEMsSUFBTCxJQUFhOUMsS0FBSzV1QixPQUFMLENBQWF3MEIsTUFBOUIsRUFBc0M7QUFDbEM1Riw2QkFBSzZGLFVBQUw7QUFDQTtBQUNIO0FBQ0Qsd0JBQUk3RixLQUFLdlMsYUFBTCxLQUF1QixDQUFDLENBQTVCLEVBQStCO0FBQzNCdVMsNkJBQUsxdkIsSUFBTDtBQUNBO0FBQ0g7QUFDRDB2Qix5QkFBS3RWLE1BQUwsQ0FBWXNWLEtBQUt2UyxhQUFqQjtBQUNBLHdCQUFJdVMsS0FBSzV1QixPQUFMLENBQWE4dkIsV0FBYixLQUE2QixLQUFqQyxFQUF3QztBQUNwQztBQUNIO0FBQ0Q7QUFDSixxQkFBS3RnQyxLQUFLOCtCLE1BQVY7QUFDSSx3QkFBSU0sS0FBS3ZTLGFBQUwsS0FBdUIsQ0FBQyxDQUE1QixFQUErQjtBQUMzQnVTLDZCQUFLMXZCLElBQUw7QUFDQTtBQUNIO0FBQ0QwdkIseUJBQUt0VixNQUFMLENBQVlzVixLQUFLdlMsYUFBakI7QUFDQTtBQUNKLHFCQUFLN3NCLEtBQUtnL0IsRUFBVjtBQUNJSSx5QkFBSzhGLE1BQUw7QUFDQTtBQUNKLHFCQUFLbGxDLEtBQUtrL0IsSUFBVjtBQUNJRSx5QkFBSytGLFFBQUw7QUFDQTtBQUNKO0FBQ0k7QUF2Q1I7O0FBMENBO0FBQ0E1akMsY0FBRTZqQyx3QkFBRjtBQUNBN2pDLGNBQUV1SixjQUFGO0FBQ0gsU0FoVG9COztBQWtUckJtNEIsaUJBQVMsaUJBQVUxaEMsQ0FBVixFQUFhO0FBQ2xCLGdCQUFJNjlCLE9BQU8sSUFBWDs7QUFFQSxnQkFBSUEsS0FBSzFILFFBQVQsRUFBbUI7QUFDZjtBQUNIOztBQUVELG9CQUFRbjJCLEVBQUV3SCxLQUFWO0FBQ0kscUJBQUsvSSxLQUFLZy9CLEVBQVY7QUFDQSxxQkFBS2gvQixLQUFLay9CLElBQVY7QUFDSTtBQUhSOztBQU1BMEUsMEJBQWN4RSxLQUFLdUMsZ0JBQW5COztBQUVBLGdCQUFJdkMsS0FBS29DLFlBQUwsS0FBc0JwQyxLQUFLMTlCLEVBQUwsQ0FBUXNNLEdBQVIsRUFBMUIsRUFBeUM7QUFDckNveEIscUJBQUtpRyxZQUFMO0FBQ0Esb0JBQUlqRyxLQUFLNXVCLE9BQUwsQ0FBYW92QixjQUFiLEdBQThCLENBQWxDLEVBQXFDO0FBQ2pDO0FBQ0FSLHlCQUFLdUMsZ0JBQUwsR0FBd0I2QyxZQUFZLFlBQVk7QUFDNUNwRiw2QkFBS2dFLGFBQUw7QUFDSCxxQkFGdUIsRUFFckJoRSxLQUFLNXVCLE9BQUwsQ0FBYW92QixjQUZRLENBQXhCO0FBR0gsaUJBTEQsTUFLTztBQUNIUix5QkFBS2dFLGFBQUw7QUFDSDtBQUNKO0FBQ0osU0E1VW9COztBQThVckJBLHVCQUFlLHlCQUFZO0FBQ3ZCLGdCQUFJaEUsT0FBTyxJQUFYO0FBQUEsZ0JBQ0k1dUIsVUFBVTR1QixLQUFLNXVCLE9BRG5CO0FBQUEsZ0JBRUl2RSxRQUFRbXpCLEtBQUsxOUIsRUFBTCxDQUFRc00sR0FBUixFQUZaO0FBQUEsZ0JBR0kxQixRQUFROHlCLEtBQUtrRyxRQUFMLENBQWNyNUIsS0FBZCxDQUhaOztBQUtBLGdCQUFJbXpCLEtBQUtnRCxTQUFMLElBQWtCaEQsS0FBS29DLFlBQUwsS0FBc0JsMUIsS0FBNUMsRUFBbUQ7QUFDL0M4eUIscUJBQUtnRCxTQUFMLEdBQWlCLElBQWpCO0FBQ0EsaUJBQUM1eEIsUUFBUSswQixxQkFBUixJQUFpQ2xvQyxFQUFFOFYsSUFBcEMsRUFBMEN6UCxJQUExQyxDQUErQzA3QixLQUFLOTRCLE9BQXBEO0FBQ0g7O0FBRURzOUIsMEJBQWN4RSxLQUFLdUMsZ0JBQW5CO0FBQ0F2QyxpQkFBS29DLFlBQUwsR0FBb0J2MUIsS0FBcEI7QUFDQW16QixpQkFBS3ZTLGFBQUwsR0FBcUIsQ0FBQyxDQUF0Qjs7QUFFQTtBQUNBLGdCQUFJcmMsUUFBUWl3Qix5QkFBUixJQUFxQ3JCLEtBQUtvRyxZQUFMLENBQWtCbDVCLEtBQWxCLENBQXpDLEVBQW1FO0FBQy9EOHlCLHFCQUFLdFYsTUFBTCxDQUFZLENBQVo7QUFDQTtBQUNIOztBQUVELGdCQUFJeGQsTUFBTWxNLE1BQU4sR0FBZW9RLFFBQVFrdkIsUUFBM0IsRUFBcUM7QUFDakNOLHFCQUFLMXZCLElBQUw7QUFDSCxhQUZELE1BRU87QUFDSDB2QixxQkFBS3FHLGNBQUwsQ0FBb0JuNUIsS0FBcEI7QUFDSDtBQUNKLFNBeFdvQjs7QUEwV3JCazVCLHNCQUFjLHNCQUFVbDVCLEtBQVYsRUFBaUI7QUFDM0IsZ0JBQUlnMUIsY0FBYyxLQUFLQSxXQUF2Qjs7QUFFQSxtQkFBUUEsWUFBWWxoQyxNQUFaLEtBQXVCLENBQXZCLElBQTRCa2hDLFlBQVksQ0FBWixFQUFlcjFCLEtBQWYsQ0FBcUIzTixXQUFyQixPQUF1Q2dPLE1BQU1oTyxXQUFOLEVBQTNFO0FBQ0gsU0E5V29COztBQWdYckJnbkMsa0JBQVUsa0JBQVVyNUIsS0FBVixFQUFpQjtBQUN2QixnQkFBSTh6QixZQUFZLEtBQUt2dkIsT0FBTCxDQUFhdXZCLFNBQTdCO0FBQUEsZ0JBQ0loeUIsS0FESjs7QUFHQSxnQkFBSSxDQUFDZ3lCLFNBQUwsRUFBZ0I7QUFDWix1QkFBTzl6QixLQUFQO0FBQ0g7QUFDRDhCLG9CQUFROUIsTUFBTTNLLEtBQU4sQ0FBWXkrQixTQUFaLENBQVI7QUFDQSxtQkFBTzFpQyxFQUFFc0UsSUFBRixDQUFPb00sTUFBTUEsTUFBTTNOLE1BQU4sR0FBZSxDQUFyQixDQUFQLENBQVA7QUFDSCxTQXpYb0I7O0FBMlhyQnNsQyw2QkFBcUIsNkJBQVVwNUIsS0FBVixFQUFpQjtBQUNsQyxnQkFBSTh5QixPQUFPLElBQVg7QUFBQSxnQkFDSTV1QixVQUFVNHVCLEtBQUs1dUIsT0FEbkI7QUFBQSxnQkFFSXN3QixpQkFBaUJ4MEIsTUFBTWhPLFdBQU4sRUFGckI7QUFBQSxnQkFHSTZMLFNBQVNxRyxRQUFRbXdCLFlBSHJCO0FBQUEsZ0JBSUlnRixRQUFRdnJCLFNBQVM1SixRQUFRbzFCLFdBQWpCLEVBQThCLEVBQTlCLENBSlo7QUFBQSxnQkFLSWxuQyxJQUxKOztBQU9BQSxtQkFBTztBQUNINGlDLDZCQUFhamtDLEVBQUV3b0MsSUFBRixDQUFPcjFCLFFBQVFndkIsTUFBZixFQUF1QixVQUFVb0IsVUFBVixFQUFzQjtBQUN0RCwyQkFBT3oyQixPQUFPeTJCLFVBQVAsRUFBbUJ0MEIsS0FBbkIsRUFBMEJ3MEIsY0FBMUIsQ0FBUDtBQUNILGlCQUZZO0FBRFYsYUFBUDs7QUFNQSxnQkFBSTZFLFNBQVNqbkMsS0FBSzRpQyxXQUFMLENBQWlCbGhDLE1BQWpCLEdBQTBCdWxDLEtBQXZDLEVBQThDO0FBQzFDam5DLHFCQUFLNGlDLFdBQUwsR0FBbUI1aUMsS0FBSzRpQyxXQUFMLENBQWlCM2dDLEtBQWpCLENBQXVCLENBQXZCLEVBQTBCZ2xDLEtBQTFCLENBQW5CO0FBQ0g7O0FBRUQsbUJBQU9qbkMsSUFBUDtBQUNILFNBOVlvQjs7QUFnWnJCK21DLHdCQUFnQix3QkFBVUssQ0FBVixFQUFhO0FBQ3pCLGdCQUFJbHNCLFFBQUo7QUFBQSxnQkFDSXdsQixPQUFPLElBRFg7QUFBQSxnQkFFSTV1QixVQUFVNHVCLEtBQUs1dUIsT0FGbkI7QUFBQSxnQkFHSSt1QixhQUFhL3VCLFFBQVErdUIsVUFIekI7QUFBQSxnQkFJSU0sTUFKSjtBQUFBLGdCQUtJa0csUUFMSjtBQUFBLGdCQU1JMUcsWUFOSjs7QUFRQTd1QixvQkFBUXF2QixNQUFSLENBQWVydkIsUUFBUXV3QixTQUF2QixJQUFvQytFLENBQXBDO0FBQ0FqRyxxQkFBU3J2QixRQUFRdzFCLFlBQVIsR0FBdUIsSUFBdkIsR0FBOEJ4MUIsUUFBUXF2QixNQUEvQzs7QUFFQSxnQkFBSXJ2QixRQUFRMHZCLGFBQVIsQ0FBc0J4OEIsSUFBdEIsQ0FBMkIwN0IsS0FBSzk0QixPQUFoQyxFQUF5Q2tLLFFBQVFxdkIsTUFBakQsTUFBNkQsS0FBakUsRUFBd0U7QUFDcEU7QUFDSDs7QUFFRCxnQkFBSXhpQyxFQUFFNG9DLFVBQUYsQ0FBYXoxQixRQUFRZ3ZCLE1BQXJCLENBQUosRUFBaUM7QUFDN0JodkIsd0JBQVFndkIsTUFBUixDQUFlc0csQ0FBZixFQUFrQixVQUFVcG5DLElBQVYsRUFBZ0I7QUFDOUIwZ0MseUJBQUtrQyxXQUFMLEdBQW1CNWlDLEtBQUs0aUMsV0FBeEI7QUFDQWxDLHlCQUFLMkYsT0FBTDtBQUNBdjBCLDRCQUFRMnZCLGdCQUFSLENBQXlCejhCLElBQXpCLENBQThCMDdCLEtBQUs5NEIsT0FBbkMsRUFBNEN3L0IsQ0FBNUMsRUFBK0NwbkMsS0FBSzRpQyxXQUFwRDtBQUNILGlCQUpEO0FBS0E7QUFDSDs7QUFFRCxnQkFBSWxDLEtBQUt5QyxPQUFULEVBQWtCO0FBQ2Rqb0IsMkJBQVd3bEIsS0FBS3NHLG1CQUFMLENBQXlCSSxDQUF6QixDQUFYO0FBQ0gsYUFGRCxNQUVPO0FBQ0gsb0JBQUl6b0MsRUFBRTRvQyxVQUFGLENBQWExRyxVQUFiLENBQUosRUFBOEI7QUFDMUJBLGlDQUFhQSxXQUFXNzdCLElBQVgsQ0FBZ0IwN0IsS0FBSzk0QixPQUFyQixFQUE4QncvQixDQUE5QixDQUFiO0FBQ0g7QUFDREMsMkJBQVd4RyxhQUFhLEdBQWIsR0FBbUJsaUMsRUFBRXlRLEtBQUYsQ0FBUSt4QixVQUFVLEVBQWxCLENBQTlCO0FBQ0FqbUIsMkJBQVd3bEIsS0FBS3NDLGNBQUwsQ0FBb0JxRSxRQUFwQixDQUFYO0FBQ0g7O0FBRUQsZ0JBQUluc0IsWUFBWXZjLEVBQUU2USxPQUFGLENBQVUwTCxTQUFTMG5CLFdBQW5CLENBQWhCLEVBQWlEO0FBQzdDbEMscUJBQUtrQyxXQUFMLEdBQW1CMW5CLFNBQVMwbkIsV0FBNUI7QUFDQWxDLHFCQUFLMkYsT0FBTDtBQUNBdjBCLHdCQUFRMnZCLGdCQUFSLENBQXlCejhCLElBQXpCLENBQThCMDdCLEtBQUs5NEIsT0FBbkMsRUFBNEN3L0IsQ0FBNUMsRUFBK0Nsc0IsU0FBUzBuQixXQUF4RDtBQUNILGFBSkQsTUFJTyxJQUFJLENBQUNsQyxLQUFLOEcsVUFBTCxDQUFnQkosQ0FBaEIsQ0FBTCxFQUF5QjtBQUM1QjFHLHFCQUFLa0UsU0FBTDs7QUFFQWpFLCtCQUFlO0FBQ1g5Qyx5QkFBS2dELFVBRE07QUFFWDdnQywwQkFBTW1oQyxNQUZLO0FBR1hyZ0MsMEJBQU1nUixRQUFRaFIsSUFISDtBQUlYK2dDLDhCQUFVL3ZCLFFBQVErdkI7QUFKUCxpQkFBZjs7QUFPQWxqQyxrQkFBRXlNLE1BQUYsQ0FBU3UxQixZQUFULEVBQXVCN3VCLFFBQVE2dUIsWUFBL0I7O0FBRUFELHFCQUFLb0IsY0FBTCxHQUFzQm5qQyxFQUFFOG9DLElBQUYsQ0FBTzlHLFlBQVAsRUFBcUIrRyxJQUFyQixDQUEwQixVQUFVMW5DLElBQVYsRUFBZ0I7QUFDNUQsd0JBQUkybkMsTUFBSjtBQUNBakgseUJBQUtvQixjQUFMLEdBQXNCLElBQXRCO0FBQ0E2Riw2QkFBUzcxQixRQUFRd3dCLGVBQVIsQ0FBd0J0aUMsSUFBeEIsRUFBOEJvbkMsQ0FBOUIsQ0FBVDtBQUNBMUcseUJBQUtrSCxlQUFMLENBQXFCRCxNQUFyQixFQUE2QlAsQ0FBN0IsRUFBZ0NDLFFBQWhDO0FBQ0F2MUIsNEJBQVEydkIsZ0JBQVIsQ0FBeUJ6OEIsSUFBekIsQ0FBOEIwN0IsS0FBSzk0QixPQUFuQyxFQUE0Q3cvQixDQUE1QyxFQUErQ08sT0FBTy9FLFdBQXREO0FBQ0gsaUJBTnFCLEVBTW5CaUYsSUFObUIsQ0FNZCxVQUFVQyxLQUFWLEVBQWlCQyxVQUFqQixFQUE2QkMsV0FBN0IsRUFBMEM7QUFDOUNsMkIsNEJBQVE0dkIsYUFBUixDQUFzQjE4QixJQUF0QixDQUEyQjA3QixLQUFLOTRCLE9BQWhDLEVBQXlDdy9CLENBQXpDLEVBQTRDVSxLQUE1QyxFQUFtREMsVUFBbkQsRUFBK0RDLFdBQS9EO0FBQ0gsaUJBUnFCLENBQXRCO0FBU0gsYUFyQk0sTUFxQkE7QUFDSGwyQix3QkFBUTJ2QixnQkFBUixDQUF5Qno4QixJQUF6QixDQUE4QjA3QixLQUFLOTRCLE9BQW5DLEVBQTRDdy9CLENBQTVDLEVBQStDLEVBQS9DO0FBQ0g7QUFDSixTQS9jb0I7O0FBaWRyQkksb0JBQVksb0JBQVVKLENBQVYsRUFBYTtBQUNyQixnQkFBSSxDQUFDLEtBQUt0MUIsT0FBTCxDQUFha3dCLGlCQUFsQixFQUFvQztBQUNoQyx1QkFBTyxLQUFQO0FBQ0g7O0FBRUQsZ0JBQUlhLGFBQWEsS0FBS0EsVUFBdEI7QUFBQSxnQkFDSXpnQyxJQUFJeWdDLFdBQVduaEMsTUFEbkI7O0FBR0EsbUJBQU9VLEdBQVAsRUFBWTtBQUNSLG9CQUFJZ2xDLEVBQUUvbUMsT0FBRixDQUFVd2lDLFdBQVd6Z0MsQ0FBWCxDQUFWLE1BQTZCLENBQWpDLEVBQW9DO0FBQ2hDLDJCQUFPLElBQVA7QUFDSDtBQUNKOztBQUVELG1CQUFPLEtBQVA7QUFDSCxTQWhlb0I7O0FBa2VyQjRPLGNBQU0sZ0JBQVk7QUFDZCxnQkFBSTB2QixPQUFPLElBQVg7QUFBQSxnQkFDSWxnQixZQUFZN2hCLEVBQUUraEMsS0FBSzBDLG9CQUFQLENBRGhCOztBQUdBLGdCQUFJemtDLEVBQUU0b0MsVUFBRixDQUFhN0csS0FBSzV1QixPQUFMLENBQWFtMkIsTUFBMUIsS0FBcUN2SCxLQUFLMEQsT0FBOUMsRUFBdUQ7QUFDbkQxRCxxQkFBSzV1QixPQUFMLENBQWFtMkIsTUFBYixDQUFvQmpqQyxJQUFwQixDQUF5QjA3QixLQUFLOTRCLE9BQTlCLEVBQXVDNFksU0FBdkM7QUFDSDs7QUFFRGtnQixpQkFBSzBELE9BQUwsR0FBZSxLQUFmO0FBQ0ExRCxpQkFBS3ZTLGFBQUwsR0FBcUIsQ0FBQyxDQUF0QjtBQUNBK1csMEJBQWN4RSxLQUFLdUMsZ0JBQW5CO0FBQ0F0a0MsY0FBRStoQyxLQUFLMEMsb0JBQVAsRUFBNkJweUIsSUFBN0I7QUFDQTB2QixpQkFBS3dILFVBQUwsQ0FBZ0IsSUFBaEI7QUFDSCxTQS9lb0I7O0FBaWZyQjdCLGlCQUFTLG1CQUFZO0FBQ2pCLGdCQUFJLENBQUMsS0FBS3pELFdBQUwsQ0FBaUJsaEMsTUFBdEIsRUFBOEI7QUFDMUIsb0JBQUksS0FBS29RLE9BQUwsQ0FBYTB3QixzQkFBakIsRUFBeUM7QUFDckMseUJBQUsyRixhQUFMO0FBQ0gsaUJBRkQsTUFFTztBQUNILHlCQUFLbjNCLElBQUw7QUFDSDtBQUNEO0FBQ0g7O0FBRUQsZ0JBQUkwdkIsT0FBTyxJQUFYO0FBQUEsZ0JBQ0k1dUIsVUFBVTR1QixLQUFLNXVCLE9BRG5CO0FBQUEsZ0JBRUlzMkIsVUFBVXQyQixRQUFRczJCLE9BRnRCO0FBQUEsZ0JBR0loSCxlQUFldHZCLFFBQVFzdkIsWUFIM0I7QUFBQSxnQkFJSTd6QixRQUFRbXpCLEtBQUtrRyxRQUFMLENBQWNsRyxLQUFLb0MsWUFBbkIsQ0FKWjtBQUFBLGdCQUtJempDLFlBQVlxaEMsS0FBSzRDLE9BQUwsQ0FBYXBCLFVBTDdCO0FBQUEsZ0JBTUltRyxnQkFBZ0IzSCxLQUFLNEMsT0FBTCxDQUFhQyxRQU5qQztBQUFBLGdCQU9JL2lCLFlBQVk3aEIsRUFBRStoQyxLQUFLMEMsb0JBQVAsQ0FQaEI7QUFBQSxnQkFRSUMseUJBQXlCMWtDLEVBQUUraEMsS0FBSzJDLHNCQUFQLENBUjdCO0FBQUEsZ0JBU0lpRixlQUFleDJCLFFBQVF3MkIsWUFUM0I7QUFBQSxnQkFVSW50QixPQUFPLEVBVlg7QUFBQSxnQkFXSW90QixRQVhKO0FBQUEsZ0JBWUlDLGNBQWMsU0FBZEEsV0FBYyxDQUFVdEcsVUFBVixFQUFzQnpLLEtBQXRCLEVBQTZCO0FBQ25DLG9CQUFJZ1Isa0JBQWtCdkcsV0FBV2xpQyxJQUFYLENBQWdCb29DLE9BQWhCLENBQXRCOztBQUVBLG9CQUFJRyxhQUFhRSxlQUFqQixFQUFpQztBQUM3QiwyQkFBTyxFQUFQO0FBQ0g7O0FBRURGLDJCQUFXRSxlQUFYOztBQUVBLHVCQUFPLDZDQUE2Q0YsUUFBN0MsR0FBd0QsaUJBQS9EO0FBQ0gsYUF0QlQ7O0FBd0JBLGdCQUFJejJCLFFBQVFpd0IseUJBQVIsSUFBcUNyQixLQUFLb0csWUFBTCxDQUFrQnY1QixLQUFsQixDQUF6QyxFQUFtRTtBQUMvRG16QixxQkFBS3RWLE1BQUwsQ0FBWSxDQUFaO0FBQ0E7QUFDSDs7QUFFRDtBQUNBenNCLGNBQUVpQyxJQUFGLENBQU84L0IsS0FBS2tDLFdBQVosRUFBeUIsVUFBVXhnQyxDQUFWLEVBQWE4L0IsVUFBYixFQUF5QjtBQUM5QyxvQkFBSWtHLE9BQUosRUFBWTtBQUNSanRCLDRCQUFRcXRCLFlBQVl0RyxVQUFaLEVBQXdCMzBCLEtBQXhCLEVBQStCbkwsQ0FBL0IsQ0FBUjtBQUNIOztBQUVEK1ksd0JBQVEsaUJBQWlCOWIsU0FBakIsR0FBNkIsZ0JBQTdCLEdBQWdEK0MsQ0FBaEQsR0FBb0QsSUFBcEQsR0FBMkRnL0IsYUFBYWMsVUFBYixFQUF5QjMwQixLQUF6QixFQUFnQ25MLENBQWhDLENBQTNELEdBQWdHLFFBQXhHO0FBQ0gsYUFORDs7QUFRQSxpQkFBS3NtQyxvQkFBTDs7QUFFQXJGLG1DQUF1QnNGLE1BQXZCO0FBQ0Fub0Isc0JBQVVyRixJQUFWLENBQWVBLElBQWY7O0FBRUEsZ0JBQUl4YyxFQUFFNG9DLFVBQUYsQ0FBYWUsWUFBYixDQUFKLEVBQWdDO0FBQzVCQSw2QkFBYXRqQyxJQUFiLENBQWtCMDdCLEtBQUs5NEIsT0FBdkIsRUFBZ0M0WSxTQUFoQyxFQUEyQ2tnQixLQUFLa0MsV0FBaEQ7QUFDSDs7QUFFRGxDLGlCQUFLMkQsV0FBTDtBQUNBN2pCLHNCQUFVNVAsSUFBVjs7QUFFQTtBQUNBLGdCQUFJa0IsUUFBUTh1QixlQUFaLEVBQTZCO0FBQ3pCRixxQkFBS3ZTLGFBQUwsR0FBcUIsQ0FBckI7QUFDQTNOLDBCQUFVM0gsU0FBVixDQUFvQixDQUFwQjtBQUNBMkgsMEJBQVU3TyxRQUFWLENBQW1CLE1BQU10UyxTQUF6QixFQUFvQ3dWLEtBQXBDLEdBQTRDbEUsUUFBNUMsQ0FBcUQwM0IsYUFBckQ7QUFDSDs7QUFFRDNILGlCQUFLMEQsT0FBTCxHQUFlLElBQWY7QUFDQTFELGlCQUFLaUcsWUFBTDtBQUNILFNBdGpCb0I7O0FBd2pCckJ3Qix1QkFBZSx5QkFBVztBQUNyQixnQkFBSXpILE9BQU8sSUFBWDtBQUFBLGdCQUNJbGdCLFlBQVk3aEIsRUFBRStoQyxLQUFLMEMsb0JBQVAsQ0FEaEI7QUFBQSxnQkFFSUMseUJBQXlCMWtDLEVBQUUraEMsS0FBSzJDLHNCQUFQLENBRjdCOztBQUlELGlCQUFLcUYsb0JBQUw7O0FBRUE7QUFDQTtBQUNBckYsbUNBQXVCc0YsTUFBdkI7QUFDQW5vQixzQkFBVW9vQixLQUFWLEdBVnNCLENBVUg7QUFDbkJwb0Isc0JBQVV3YixNQUFWLENBQWlCcUgsc0JBQWpCOztBQUVBM0MsaUJBQUsyRCxXQUFMOztBQUVBN2pCLHNCQUFVNVAsSUFBVjtBQUNBOHZCLGlCQUFLMEQsT0FBTCxHQUFlLElBQWY7QUFDSCxTQXprQm9COztBQTJrQnJCc0UsOEJBQXNCLGdDQUFXO0FBQzdCLGdCQUFJaEksT0FBTyxJQUFYO0FBQUEsZ0JBQ0k1dUIsVUFBVTR1QixLQUFLNXVCLE9BRG5CO0FBQUEsZ0JBRUl0SixLQUZKO0FBQUEsZ0JBR0lnWSxZQUFZN2hCLEVBQUUraEMsS0FBSzBDLG9CQUFQLENBSGhCOztBQUtBO0FBQ0E7QUFDQTtBQUNBLGdCQUFJdHhCLFFBQVF0SixLQUFSLEtBQWtCLE1BQXRCLEVBQThCO0FBQzFCQSx3QkFBUWs0QixLQUFLMTlCLEVBQUwsQ0FBUThqQixVQUFSLEVBQVI7QUFDQXRHLDBCQUFVclQsR0FBVixDQUFjLE9BQWQsRUFBdUIzRSxRQUFRLENBQVIsR0FBWUEsS0FBWixHQUFvQixHQUEzQztBQUNIO0FBQ0osU0F4bEJvQjs7QUEwbEJyQm0rQixzQkFBYyx3QkFBWTtBQUN0QixnQkFBSWpHLE9BQU8sSUFBWDtBQUFBLGdCQUNJbnpCLFFBQVFtekIsS0FBSzE5QixFQUFMLENBQVFzTSxHQUFSLEdBQWMxUCxXQUFkLEVBRFo7QUFBQSxnQkFFSWlwQyxZQUFZLElBRmhCOztBQUlBLGdCQUFJLENBQUN0N0IsS0FBTCxFQUFZO0FBQ1I7QUFDSDs7QUFFRDVPLGNBQUVpQyxJQUFGLENBQU84L0IsS0FBS2tDLFdBQVosRUFBeUIsVUFBVXhnQyxDQUFWLEVBQWE4L0IsVUFBYixFQUF5QjtBQUM5QyxvQkFBSTRHLGFBQWE1RyxXQUFXMzBCLEtBQVgsQ0FBaUIzTixXQUFqQixHQUErQlMsT0FBL0IsQ0FBdUNrTixLQUF2QyxNQUFrRCxDQUFuRTtBQUNBLG9CQUFJdTdCLFVBQUosRUFBZ0I7QUFDWkQsZ0NBQVkzRyxVQUFaO0FBQ0g7QUFDRCx1QkFBTyxDQUFDNEcsVUFBUjtBQUNILGFBTkQ7O0FBUUFwSSxpQkFBS3dILFVBQUwsQ0FBZ0JXLFNBQWhCO0FBQ0gsU0E1bUJvQjs7QUE4bUJyQlgsb0JBQVksb0JBQVVoRyxVQUFWLEVBQXNCO0FBQzlCLGdCQUFJdUIsWUFBWSxFQUFoQjtBQUFBLGdCQUNJL0MsT0FBTyxJQURYO0FBRUEsZ0JBQUl3QixVQUFKLEVBQWdCO0FBQ1p1Qiw0QkFBWS9DLEtBQUtvQyxZQUFMLEdBQW9CWixXQUFXMzBCLEtBQVgsQ0FBaUJ3N0IsTUFBakIsQ0FBd0JySSxLQUFLb0MsWUFBTCxDQUFrQnBoQyxNQUExQyxDQUFoQztBQUNIO0FBQ0QsZ0JBQUlnL0IsS0FBSytDLFNBQUwsS0FBbUJBLFNBQXZCLEVBQWtDO0FBQzlCL0MscUJBQUsrQyxTQUFMLEdBQWlCQSxTQUFqQjtBQUNBL0MscUJBQUs4QyxJQUFMLEdBQVl0QixVQUFaO0FBQ0EsaUJBQUMsS0FBS3B3QixPQUFMLENBQWF3MEIsTUFBYixJQUF1QjNuQyxFQUFFOFYsSUFBMUIsRUFBZ0NndkIsU0FBaEM7QUFDSDtBQUNKLFNBem5Cb0I7O0FBMm5CckJzQixpQ0FBeUIsaUNBQVVuQyxXQUFWLEVBQXVCO0FBQzVDO0FBQ0EsZ0JBQUlBLFlBQVlsaEMsTUFBWixJQUFzQixPQUFPa2hDLFlBQVksQ0FBWixDQUFQLEtBQTBCLFFBQXBELEVBQThEO0FBQzFELHVCQUFPamtDLEVBQUVvRSxHQUFGLENBQU02L0IsV0FBTixFQUFtQixVQUFVcjFCLEtBQVYsRUFBaUI7QUFDdkMsMkJBQU8sRUFBRUEsT0FBT0EsS0FBVCxFQUFnQnZOLE1BQU0sSUFBdEIsRUFBUDtBQUNILGlCQUZNLENBQVA7QUFHSDs7QUFFRCxtQkFBTzRpQyxXQUFQO0FBQ0gsU0Fwb0JvQjs7QUFzb0JyQm9DLDZCQUFxQiw2QkFBU3RDLFdBQVQsRUFBc0JzRyxRQUF0QixFQUFnQztBQUNqRHRHLDBCQUFjL2pDLEVBQUVzRSxJQUFGLENBQU95L0IsZUFBZSxFQUF0QixFQUEwQjlpQyxXQUExQixFQUFkOztBQUVBLGdCQUFHakIsRUFBRXNxQyxPQUFGLENBQVV2RyxXQUFWLEVBQXVCLENBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsS0FBbkIsQ0FBdkIsTUFBc0QsQ0FBQyxDQUExRCxFQUE0RDtBQUN4REEsOEJBQWNzRyxRQUFkO0FBQ0g7O0FBRUQsbUJBQU90RyxXQUFQO0FBQ0gsU0E5b0JvQjs7QUFncEJyQmtGLHlCQUFpQix5QkFBVUQsTUFBVixFQUFrQnhGLGFBQWxCLEVBQWlDa0YsUUFBakMsRUFBMkM7QUFDeEQsZ0JBQUkzRyxPQUFPLElBQVg7QUFBQSxnQkFDSTV1QixVQUFVNHVCLEtBQUs1dUIsT0FEbkI7O0FBR0E2MUIsbUJBQU8vRSxXQUFQLEdBQXFCbEMsS0FBS3FFLHVCQUFMLENBQTZCNEMsT0FBTy9FLFdBQXBDLENBQXJCOztBQUVBO0FBQ0EsZ0JBQUksQ0FBQzl3QixRQUFReXZCLE9BQWIsRUFBc0I7QUFDbEJiLHFCQUFLc0MsY0FBTCxDQUFvQnFFLFFBQXBCLElBQWdDTSxNQUFoQztBQUNBLG9CQUFJNzFCLFFBQVFrd0IsaUJBQVIsSUFBNkIsQ0FBQzJGLE9BQU8vRSxXQUFQLENBQW1CbGhDLE1BQXJELEVBQTZEO0FBQ3pEZy9CLHlCQUFLbUMsVUFBTCxDQUFnQjNpQyxJQUFoQixDQUFxQmlpQyxhQUFyQjtBQUNIO0FBQ0o7O0FBRUQ7QUFDQSxnQkFBSUEsa0JBQWtCekIsS0FBS2tHLFFBQUwsQ0FBY2xHLEtBQUtvQyxZQUFuQixDQUF0QixFQUF3RDtBQUNwRDtBQUNIOztBQUVEcEMsaUJBQUtrQyxXQUFMLEdBQW1CK0UsT0FBTy9FLFdBQTFCO0FBQ0FsQyxpQkFBSzJGLE9BQUw7QUFDSCxTQXJxQm9COztBQXVxQnJCOVgsa0JBQVUsa0JBQVVrSixLQUFWLEVBQWlCO0FBQ3ZCLGdCQUFJaUosT0FBTyxJQUFYO0FBQUEsZ0JBQ0l3SSxVQURKO0FBQUEsZ0JBRUkzRixXQUFXN0MsS0FBSzRDLE9BQUwsQ0FBYUMsUUFGNUI7QUFBQSxnQkFHSS9pQixZQUFZN2hCLEVBQUUraEMsS0FBSzBDLG9CQUFQLENBSGhCO0FBQUEsZ0JBSUl6eEIsV0FBVzZPLFVBQVVsZSxJQUFWLENBQWUsTUFBTW8rQixLQUFLNEMsT0FBTCxDQUFhcEIsVUFBbEMsQ0FKZjs7QUFNQTFoQixzQkFBVWxlLElBQVYsQ0FBZSxNQUFNaWhDLFFBQXJCLEVBQStCMytCLFdBQS9CLENBQTJDMitCLFFBQTNDOztBQUVBN0MsaUJBQUt2UyxhQUFMLEdBQXFCc0osS0FBckI7O0FBRUEsZ0JBQUlpSixLQUFLdlMsYUFBTCxLQUF1QixDQUFDLENBQXhCLElBQTZCeGMsU0FBU2pRLE1BQVQsR0FBa0JnL0IsS0FBS3ZTLGFBQXhELEVBQXVFO0FBQ25FK2EsNkJBQWF2M0IsU0FBUzlELEdBQVQsQ0FBYTZ5QixLQUFLdlMsYUFBbEIsQ0FBYjtBQUNBeHZCLGtCQUFFdXFDLFVBQUYsRUFBY3Y0QixRQUFkLENBQXVCNHlCLFFBQXZCO0FBQ0EsdUJBQU8yRixVQUFQO0FBQ0g7O0FBRUQsbUJBQU8sSUFBUDtBQUNILFNBenJCb0I7O0FBMnJCckIzQyxvQkFBWSxzQkFBWTtBQUNwQixnQkFBSTdGLE9BQU8sSUFBWDtBQUFBLGdCQUNJdCtCLElBQUl6RCxFQUFFc3FDLE9BQUYsQ0FBVXZJLEtBQUs4QyxJQUFmLEVBQXFCOUMsS0FBS2tDLFdBQTFCLENBRFI7O0FBR0FsQyxpQkFBS3RWLE1BQUwsQ0FBWWhwQixDQUFaO0FBQ0gsU0Foc0JvQjs7QUFrc0JyQmdwQixnQkFBUSxnQkFBVWhwQixDQUFWLEVBQWE7QUFDakIsZ0JBQUlzK0IsT0FBTyxJQUFYO0FBQ0FBLGlCQUFLMXZCLElBQUw7QUFDQTB2QixpQkFBS0ssUUFBTCxDQUFjMytCLENBQWQ7QUFDQXMrQixpQkFBS3dELGVBQUw7QUFDSCxTQXZzQm9COztBQXlzQnJCc0MsZ0JBQVEsa0JBQVk7QUFDaEIsZ0JBQUk5RixPQUFPLElBQVg7O0FBRUEsZ0JBQUlBLEtBQUt2UyxhQUFMLEtBQXVCLENBQUMsQ0FBNUIsRUFBK0I7QUFDM0I7QUFDSDs7QUFFRCxnQkFBSXVTLEtBQUt2UyxhQUFMLEtBQXVCLENBQTNCLEVBQThCO0FBQzFCeHZCLGtCQUFFK2hDLEtBQUswQyxvQkFBUCxFQUE2Qnp4QixRQUE3QixHQUF3Q2tELEtBQXhDLEdBQWdEalEsV0FBaEQsQ0FBNEQ4N0IsS0FBSzRDLE9BQUwsQ0FBYUMsUUFBekU7QUFDQTdDLHFCQUFLdlMsYUFBTCxHQUFxQixDQUFDLENBQXRCO0FBQ0F1UyxxQkFBSzE5QixFQUFMLENBQVFzTSxHQUFSLENBQVlveEIsS0FBS29DLFlBQWpCO0FBQ0FwQyxxQkFBS2lHLFlBQUw7QUFDQTtBQUNIOztBQUVEakcsaUJBQUt5SSxZQUFMLENBQWtCekksS0FBS3ZTLGFBQUwsR0FBcUIsQ0FBdkM7QUFDSCxTQXp0Qm9COztBQTJ0QnJCc1ksa0JBQVUsb0JBQVk7QUFDbEIsZ0JBQUkvRixPQUFPLElBQVg7O0FBRUEsZ0JBQUlBLEtBQUt2UyxhQUFMLEtBQXdCdVMsS0FBS2tDLFdBQUwsQ0FBaUJsaEMsTUFBakIsR0FBMEIsQ0FBdEQsRUFBMEQ7QUFDdEQ7QUFDSDs7QUFFRGcvQixpQkFBS3lJLFlBQUwsQ0FBa0J6SSxLQUFLdlMsYUFBTCxHQUFxQixDQUF2QztBQUNILFNBbnVCb0I7O0FBcXVCckJnYixzQkFBYyxzQkFBVTFSLEtBQVYsRUFBaUI7QUFDM0IsZ0JBQUlpSixPQUFPLElBQVg7QUFBQSxnQkFDSXdJLGFBQWF4SSxLQUFLblMsUUFBTCxDQUFja0osS0FBZCxDQURqQjs7QUFHQSxnQkFBSSxDQUFDeVIsVUFBTCxFQUFpQjtBQUNiO0FBQ0g7O0FBRUQsZ0JBQUlFLFNBQUo7QUFBQSxnQkFDSUMsVUFESjtBQUFBLGdCQUVJQyxVQUZKO0FBQUEsZ0JBR0lDLGNBQWM1cUMsRUFBRXVxQyxVQUFGLEVBQWNuaUIsV0FBZCxFQUhsQjs7QUFLQXFpQix3QkFBWUYsV0FBV0UsU0FBdkI7QUFDQUMseUJBQWExcUMsRUFBRStoQyxLQUFLMEMsb0JBQVAsRUFBNkJ2cUIsU0FBN0IsRUFBYjtBQUNBeXdCLHlCQUFhRCxhQUFhM0ksS0FBSzV1QixPQUFMLENBQWFtdkIsU0FBMUIsR0FBc0NzSSxXQUFuRDs7QUFFQSxnQkFBSUgsWUFBWUMsVUFBaEIsRUFBNEI7QUFDeEIxcUMsa0JBQUUraEMsS0FBSzBDLG9CQUFQLEVBQTZCdnFCLFNBQTdCLENBQXVDdXdCLFNBQXZDO0FBQ0gsYUFGRCxNQUVPLElBQUlBLFlBQVlFLFVBQWhCLEVBQTRCO0FBQy9CM3FDLGtCQUFFK2hDLEtBQUswQyxvQkFBUCxFQUE2QnZxQixTQUE3QixDQUF1Q3V3QixZQUFZMUksS0FBSzV1QixPQUFMLENBQWFtdkIsU0FBekIsR0FBcUNzSSxXQUE1RTtBQUNIOztBQUVELGdCQUFJLENBQUM3SSxLQUFLNXVCLE9BQUwsQ0FBYTZ2QixhQUFsQixFQUFpQztBQUM3QmpCLHFCQUFLMTlCLEVBQUwsQ0FBUXNNLEdBQVIsQ0FBWW94QixLQUFLOEksUUFBTCxDQUFjOUksS0FBS2tDLFdBQUwsQ0FBaUJuTCxLQUFqQixFQUF3QmxxQixLQUF0QyxDQUFaO0FBQ0g7QUFDRG16QixpQkFBS3dILFVBQUwsQ0FBZ0IsSUFBaEI7QUFDSCxTQWh3Qm9COztBQWt3QnJCbkgsa0JBQVUsa0JBQVV0SixLQUFWLEVBQWlCO0FBQ3ZCLGdCQUFJaUosT0FBTyxJQUFYO0FBQUEsZ0JBQ0krSSxtQkFBbUIvSSxLQUFLNXVCLE9BQUwsQ0FBYWl2QixRQURwQztBQUFBLGdCQUVJbUIsYUFBYXhCLEtBQUtrQyxXQUFMLENBQWlCbkwsS0FBakIsQ0FGakI7O0FBSUFpSixpQkFBS29DLFlBQUwsR0FBb0JwQyxLQUFLOEksUUFBTCxDQUFjdEgsV0FBVzMwQixLQUF6QixDQUFwQjs7QUFFQSxnQkFBSW16QixLQUFLb0MsWUFBTCxLQUFzQnBDLEtBQUsxOUIsRUFBTCxDQUFRc00sR0FBUixFQUF0QixJQUF1QyxDQUFDb3hCLEtBQUs1dUIsT0FBTCxDQUFhNnZCLGFBQXpELEVBQXdFO0FBQ3BFakIscUJBQUsxOUIsRUFBTCxDQUFRc00sR0FBUixDQUFZb3hCLEtBQUtvQyxZQUFqQjtBQUNIOztBQUVEcEMsaUJBQUt3SCxVQUFMLENBQWdCLElBQWhCO0FBQ0F4SCxpQkFBS2tDLFdBQUwsR0FBbUIsRUFBbkI7QUFDQWxDLGlCQUFLZ0QsU0FBTCxHQUFpQnhCLFVBQWpCOztBQUVBLGdCQUFJdmpDLEVBQUU0b0MsVUFBRixDQUFha0MsZ0JBQWIsQ0FBSixFQUFvQztBQUNoQ0EsaUNBQWlCemtDLElBQWpCLENBQXNCMDdCLEtBQUs5NEIsT0FBM0IsRUFBb0NzNkIsVUFBcEM7QUFDSDtBQUNKLFNBcHhCb0I7O0FBc3hCckJzSCxrQkFBVSxrQkFBVWo4QixLQUFWLEVBQWlCO0FBQ3ZCLGdCQUFJbXpCLE9BQU8sSUFBWDtBQUFBLGdCQUNJVyxZQUFZWCxLQUFLNXVCLE9BQUwsQ0FBYXV2QixTQUQ3QjtBQUFBLGdCQUVJeUIsWUFGSjtBQUFBLGdCQUdJenpCLEtBSEo7O0FBS0EsZ0JBQUksQ0FBQ2d5QixTQUFMLEVBQWdCO0FBQ1osdUJBQU85ekIsS0FBUDtBQUNIOztBQUVEdTFCLDJCQUFlcEMsS0FBS29DLFlBQXBCO0FBQ0F6ekIsb0JBQVF5ekIsYUFBYWxnQyxLQUFiLENBQW1CeStCLFNBQW5CLENBQVI7O0FBRUEsZ0JBQUloeUIsTUFBTTNOLE1BQU4sS0FBaUIsQ0FBckIsRUFBd0I7QUFDcEIsdUJBQU82TCxLQUFQO0FBQ0g7O0FBRUQsbUJBQU91MUIsYUFBYWlHLE1BQWIsQ0FBb0IsQ0FBcEIsRUFBdUJqRyxhQUFhcGhDLE1BQWIsR0FBc0IyTixNQUFNQSxNQUFNM04sTUFBTixHQUFlLENBQXJCLEVBQXdCQSxNQUFyRSxJQUErRTZMLEtBQXRGO0FBQ0gsU0F4eUJvQjs7QUEweUJyQm04QixpQkFBUyxtQkFBWTtBQUNqQixnQkFBSWhKLE9BQU8sSUFBWDtBQUNBQSxpQkFBSzE5QixFQUFMLENBQVF1SixHQUFSLENBQVksZUFBWixFQUE2QmhNLFVBQTdCLENBQXdDLGNBQXhDO0FBQ0FtZ0MsaUJBQUt3RCxlQUFMO0FBQ0F2bEMsY0FBRTBHLE1BQUYsRUFBVWtILEdBQVYsQ0FBYyxxQkFBZCxFQUFxQ20wQixLQUFLeUQsa0JBQTFDO0FBQ0F4bEMsY0FBRStoQyxLQUFLMEMsb0JBQVAsRUFBNkI5ZSxNQUE3QjtBQUNIO0FBaHpCb0IsS0FBekI7O0FBbXpCQTtBQUNBM2xCLE1BQUUyRyxFQUFGLENBQUtxa0MsWUFBTCxHQUFvQmhyQyxFQUFFMkcsRUFBRixDQUFLc2tDLHFCQUFMLEdBQTZCLFVBQVU5M0IsT0FBVixFQUFtQjFOLElBQW5CLEVBQXlCO0FBQ3RFLFlBQUl5bEMsVUFBVSxjQUFkO0FBQ0E7QUFDQTtBQUNBLFlBQUksQ0FBQ3hsQyxVQUFVM0MsTUFBZixFQUF1QjtBQUNuQixtQkFBTyxLQUFLbVQsS0FBTCxHQUFhN1UsSUFBYixDQUFrQjZwQyxPQUFsQixDQUFQO0FBQ0g7O0FBRUQsZUFBTyxLQUFLanBDLElBQUwsQ0FBVSxZQUFZO0FBQ3pCLGdCQUFJa3BDLGVBQWVuckMsRUFBRSxJQUFGLENBQW5CO0FBQUEsZ0JBQ0kyakIsV0FBV3duQixhQUFhOXBDLElBQWIsQ0FBa0I2cEMsT0FBbEIsQ0FEZjs7QUFHQSxnQkFBSSxPQUFPLzNCLE9BQVAsS0FBbUIsUUFBdkIsRUFBaUM7QUFDN0Isb0JBQUl3USxZQUFZLE9BQU9BLFNBQVN4USxPQUFULENBQVAsS0FBNkIsVUFBN0MsRUFBeUQ7QUFDckR3USw2QkFBU3hRLE9BQVQsRUFBa0IxTixJQUFsQjtBQUNIO0FBQ0osYUFKRCxNQUlPO0FBQ0g7QUFDQSxvQkFBSWtlLFlBQVlBLFNBQVNvbkIsT0FBekIsRUFBa0M7QUFDOUJwbkIsNkJBQVNvbkIsT0FBVDtBQUNIO0FBQ0RwbkIsMkJBQVcsSUFBSW1lLFlBQUosQ0FBaUIsSUFBakIsRUFBdUIzdUIsT0FBdkIsQ0FBWDtBQUNBZzRCLDZCQUFhOXBDLElBQWIsQ0FBa0I2cEMsT0FBbEIsRUFBMkJ2bkIsUUFBM0I7QUFDSDtBQUNKLFNBaEJNLENBQVA7QUFpQkgsS0F6QkQ7QUEwQkgsQ0FuOUJBLENBQUQ7Ozs7Ozs7QUNYQTNqQixFQUFFNEUsUUFBRixFQUFZbkMsVUFBWjs7QUFFQSxJQUFJMm9DLFFBQVF4bUMsU0FBUytLLG9CQUFULENBQThCLE1BQTlCLENBQVo7QUFDQSxJQUFJMDdCLFdBQVcsSUFBZjs7QUFFQSxJQUFJRCxNQUFNcm9DLE1BQU4sR0FBZSxDQUFuQixFQUFzQjtBQUNsQnNvQyxZQUFXRCxNQUFNLENBQU4sRUFBU0UsSUFBcEI7QUFDSDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQyxhQUFhLElBQUk3cEIsUUFBSixDQUFhO0FBQzFCO0FBQ0FFLG9CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQU4wQixDQUFiLENBQWpCOztBQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBSTRwQixZQUFZeHJDLEVBQUUsV0FBRixFQUFlMDlCLFFBQWY7QUFDZm1CLGVBQWMsSUFEQztBQUVmNVEsa0JBQWlCLEtBRkY7QUFHZlkscUJBQW9CLEtBSEw7QUFJZkssV0FBVSxHQUpLO0FBS2ZvTCxrQkFBaUIsS0FMRjtBQU1mdEQsWUFBVyxJQU5JO0FBT2ZtRixXQUFVO0FBUEssNENBUUwsSUFSSyx3REFTTyxLQVRQLDhDQVVILElBVkcsNENBV0wsSUFYSyxnQkFBaEI7O0FBY0EsSUFBSXNQLFFBQVFELFVBQVU3bkMsSUFBVixDQUFlLHlCQUFmLENBQVo7QUFDQTtBQUNBLElBQUkrbkMsV0FBVzltQyxTQUFTdVAsZUFBVCxDQUF5Qm5QLEtBQXhDO0FBQ0EsSUFBSTJtQyxnQkFBZ0IsT0FBT0QsU0FBU25lLFNBQWhCLElBQTZCLFFBQTdCLEdBQ2xCLFdBRGtCLEdBQ0osaUJBRGhCO0FBRUE7QUFDQSxJQUFJcWUsUUFBUUosVUFBVW5xQyxJQUFWLENBQWUsVUFBZixDQUFaOztBQUVBbXFDLFVBQVVqK0IsRUFBVixDQUFjLGlCQUFkLEVBQWlDLFlBQVc7QUFDMUNxK0IsT0FBTS9kLE1BQU4sQ0FBYXRyQixPQUFiLENBQXNCLFVBQVVzcEMsS0FBVixFQUFpQnBvQyxDQUFqQixFQUFxQjtBQUN6QyxNQUFJZzZCLE1BQU1nTyxNQUFNaG9DLENBQU4sQ0FBVjtBQUNBLE1BQUlxUixJQUFJLENBQUUrMkIsTUFBTXIrQixNQUFOLEdBQWVvK0IsTUFBTTkyQixDQUF2QixJQUE2QixDQUFDLENBQTlCLEdBQWdDLENBQXhDO0FBQ0Eyb0IsTUFBSXo0QixLQUFKLENBQVcybUMsYUFBWCxJQUE2QixnQkFBZ0I3MkIsQ0FBaEIsR0FBcUIsS0FBbEQ7QUFDRCxFQUpEO0FBS0QsQ0FORDs7QUFRQTlVLEVBQUUsb0JBQUYsRUFBd0I4ckMsS0FBeEIsQ0FBOEIsWUFBVztBQUN4Q0YsT0FBTWpQLFVBQU47QUFDQSxDQUZEOztBQUlBLElBQUlvUCxXQUFXL3JDLEVBQUUsV0FBRixFQUFlMDlCLFFBQWYsRUFBZjs7QUFFQSxTQUFTc08sWUFBVCxDQUF1QnhnQyxLQUF2QixFQUErQjtBQUM5QixLQUFJeWdDLE9BQU9GLFNBQVNyTyxRQUFULENBQW1CLGVBQW5CLEVBQW9DbHlCLE1BQU1nQyxNQUExQyxDQUFYO0FBQ0F1K0IsVUFBU3JPLFFBQVQsQ0FBbUIsZ0JBQW5CLEVBQXFDdU8sUUFBUUEsS0FBS2hqQyxPQUFsRDtBQUNBOztBQUVEOGlDLFNBQVNwb0MsSUFBVCxDQUFjLE9BQWQsRUFBdUIxQixJQUF2QixDQUE2QixVQUFVd0IsQ0FBVixFQUFheW9DLEtBQWIsRUFBcUI7QUFDakRBLE9BQU1qUSxJQUFOO0FBQ0FqOEIsR0FBR2tzQyxLQUFILEVBQVczK0IsRUFBWCxDQUFlLFlBQWYsRUFBNkJ5K0IsWUFBN0I7QUFDQSxDQUhEO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUlHLGFBQWFuc0MsRUFBRSxZQUFGLEVBQWdCMDlCLFFBQWhCLENBQXlCO0FBQ3pDO0FBQ0FtQixlQUFjLElBRjJCO0FBR3pDakIsV0FBVTtBQUgrQixDQUF6QixDQUFqQjs7QUFNQSxJQUFJd08sZUFBZUQsV0FBVzlxQyxJQUFYLENBQWdCLFVBQWhCLENBQW5COztBQUVBOHFDLFdBQVc1K0IsRUFBWCxDQUFlLGlCQUFmLEVBQWtDLFlBQVc7QUFDNUM7QUFDQTs7QUFFQSxDQUpEOztBQU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0F2TixFQUFFLFFBQUYsRUFBWWlDLElBQVosQ0FBaUIsWUFBVTtBQUMxQmpDLEdBQUUsSUFBRixFQUFRcXNDLElBQVIsQ0FBYywyQ0FBZDtBQUVBLENBSEQ7O0FBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQXJzQyxFQUFFLG9CQUFGLEVBQXdCOHJDLEtBQXhCLENBQThCLFVBQVN0Z0MsS0FBVCxFQUFnQjtBQUM1QyxLQUFJOGdDLFVBQVVDLEdBQVYsT0FBb0IsT0FBeEIsRUFBaUM7QUFDL0I7QUFDQSxNQUFHLENBQUN2c0MsRUFBRSxJQUFGLEVBQVErWixRQUFSLENBQWlCLHVCQUFqQixDQUFKLEVBQThDO0FBQzdDdk8sU0FBTWlDLGNBQU47QUFDQXpOLEtBQUUsb0JBQUYsRUFBd0JpRyxXQUF4QixDQUFvQyx1QkFBcEM7QUFDQWpHLEtBQUUsSUFBRixFQUFRd3NDLFdBQVIsQ0FBb0IsdUJBQXBCO0FBQ0E7QUFDRixFQVBELE1BT08sSUFBSUYsVUFBVUMsR0FBVixPQUFvQixPQUF4QixFQUFpQztBQUN0QztBQUNEO0FBQ0YsQ0FYRDs7QUFhQTtBQUNBdnNDLEVBQUUsMEJBQUYsRUFBOEI4ckMsS0FBOUIsQ0FBb0MsWUFBVTtBQUM3QzlyQyxHQUFFLFlBQUYsRUFBZ0JpRyxXQUFoQixDQUE0Qix1QkFBNUI7QUFFQSxDQUhEOztBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU3dtQyxtQkFBVCxHQUE4QjtBQUM3QnpzQyxHQUFFLE1BQUYsRUFBVXdzQyxXQUFWLENBQXNCLHFCQUF0QjtBQUNBeHNDLEdBQUUsZUFBRixFQUFtQmlHLFdBQW5CLENBQStCLE1BQS9CO0FBQ0FqRyxHQUFFLGlCQUFGLEVBQXFCaUcsV0FBckIsQ0FBaUMsWUFBakM7QUFDQWpHLEdBQUUsaUJBQUYsRUFBcUJpRyxXQUFyQixDQUFpQyxnQ0FBakM7QUFDQWpHLEdBQUUsb0JBQUYsRUFBd0J3c0MsV0FBeEIsQ0FBb0MsNkRBQXBDO0FBQ0F4c0MsR0FBRSxjQUFGLEVBQWtCd3NDLFdBQWxCLENBQThCLGlEQUE5QjtBQUNBeHNDLEdBQUUsaUJBQUYsRUFBcUJ3c0MsV0FBckIsQ0FBaUMsMkJBQWpDO0FBQ0F4c0MsR0FBRSwwQkFBRixFQUE4QndzQyxXQUE5QixDQUEwQyxvQ0FBMUM7QUFDQXhzQyxHQUFFLGVBQUYsRUFBbUJ3c0MsV0FBbkIsQ0FBK0IseUJBQS9CO0FBQ0F4c0MsR0FBRSxvQkFBRixFQUF3QndzQyxXQUF4QixDQUFvQyw2QkFBcEM7O0FBRUE7QUFDQXZuQyxZQUFXLFlBQVU7QUFDbkJqRixJQUFFLGVBQUYsRUFBbUJ3c0MsV0FBbkIsQ0FBK0IsZ0NBQS9CO0FBQ0QsRUFGRCxFQUVHLENBRkg7O0FBSUF4c0MsR0FBRSxNQUFGLEVBQVV3c0MsV0FBVixDQUFzQix1QkFBdEI7QUFFQTs7QUFFRHhzQyxFQUFFLG9CQUFGLEVBQXdCOHJDLEtBQXhCLENBQThCLFlBQVU7QUFDckNXO0FBQ0EsS0FBR3pzQyxFQUFFLHNCQUFGLEVBQTBCK1osUUFBMUIsQ0FBbUMsNENBQW5DLENBQUgsRUFBb0Y7QUFDbkYyeUI7QUFDQTFzQyxJQUFFLGNBQUYsRUFBa0IrRixRQUFsQixDQUEyQixTQUEzQixFQUFzQ2lNLFFBQXRDLENBQStDLHFCQUEvQztBQUNBO0FBQ0RwTixVQUFTK25DLGNBQVQsQ0FBd0Isb0JBQXhCLEVBQThDai9CLEtBQTlDO0FBQ0YsQ0FQRDs7QUFTQTFOLEVBQUUsMkJBQUYsRUFBK0I4ckMsS0FBL0IsQ0FBcUMsWUFBVTtBQUM5Q1c7QUFDQTduQyxVQUFTK25DLGNBQVQsQ0FBd0Isb0JBQXhCLEVBQThDOVcsSUFBOUM7QUFDQSxDQUhEOztBQUtBO0FBQ0E3MUIsRUFBRSxvQkFBRixFQUF3QjRzQyxRQUF4QixDQUFpQyxZQUFVO0FBQ3hDLEtBQUc1c0MsRUFBRSxvQkFBRixFQUF3QitaLFFBQXhCLENBQWlDLDhCQUFqQyxDQUFILEVBQW9FO0FBQ25FO0FBQ0E7QUFDQTtBQUNILENBTEQ7O0FBT0EvWixFQUFFLDBCQUFGLEVBQThCZ3JDLFlBQTlCLENBQTJDO0FBQ3ZDOUksYUFBWW1KLFdBQVMsb0JBRGtCO0FBRXZDOUksaUJBQWdCLEdBRnVCO0FBR3ZDYSw0QkFBMkIsS0FIWTtBQUl2Q2YsV0FBVSxDQUo2QjtBQUt2Q0osa0JBQWlCLElBTHNCO0FBTXZDOS9CLE9BQU0sTUFOaUM7QUFPdkNpZ0MsV0FBVSxrQkFBVW1CLFVBQVYsRUFBc0I7QUFDNUJ2akMsSUFBRSxvQkFBRixFQUF3QjgzQixNQUF4QjtBQUNIO0FBVHNDLENBQTNDOztBQWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBSTUzQixXQUFXZ0csVUFBWCxDQUFzQjZJLE9BQXRCLENBQThCLFFBQTlCLENBQUosRUFBNkM7QUFDM0M7QUFDQTtBQUNBL08sR0FBRSxjQUFGLEVBQWtCZ1MsUUFBbEIsQ0FBMkIsc0JBQTNCO0FBQ0QsQ0FKRCxNQUlLO0FBQ0poUyxHQUFFLGNBQUYsRUFBa0JnUyxRQUFsQixDQUEyQixxQkFBM0I7QUFDQTs7QUFHRGhTLEVBQUUsc0JBQUYsRUFBMEI4ckMsS0FBMUIsQ0FBZ0MsWUFBVTtBQUN2Q1c7O0FBSUE7QUFDQXpzQyxHQUFFLGNBQUYsRUFBa0IrRixRQUFsQixDQUEyQixTQUEzQixFQUFzQ2lNLFFBQXRDLENBQStDLHFCQUEvQztBQUNBcE4sVUFBUytuQyxjQUFULENBQXdCLG9CQUF4QixFQUE4Q2ovQixLQUE5QztBQUNGLENBUkQ7O0FBVUE7QUFDQTFOLEVBQUUwRyxNQUFGLEVBQVU2RyxFQUFWLENBQWEsdUJBQWIsRUFBc0MsVUFBUy9CLEtBQVQsRUFBZ0I4RCxPQUFoQixFQUF5QnU5QixPQUF6QixFQUFrQzs7QUFFdEUsS0FBSXY5QixXQUFXLFFBQWYsRUFBeUI7QUFDeEI7QUFDQXRQLElBQUUsY0FBRixFQUFrQmlHLFdBQWxCLENBQThCLHFCQUE5QjtBQUNBakcsSUFBRSxjQUFGLEVBQWtCZ1MsUUFBbEIsQ0FBMkIsc0JBQTNCOztBQUVEaFMsSUFBRSxjQUFGLEVBQWtCK0YsUUFBbEIsQ0FBMkIsTUFBM0I7O0FBR0MsTUFBRy9GLEVBQUUsY0FBRixFQUFrQitaLFFBQWxCLENBQTJCLHdCQUEzQixDQUFILEVBQXdEO0FBQ3ZEO0FBQ0E7QUFDRCxFQVhELE1BV00sSUFBR3pLLFdBQVcsUUFBZCxFQUF1QjtBQUM1QnRQLElBQUUsY0FBRixFQUFrQitGLFFBQWxCLENBQTJCLFNBQTNCO0FBQ0EvRixJQUFFLGNBQUYsRUFBa0JpRyxXQUFsQixDQUE4QixzQkFBOUI7QUFDQWpHLElBQUUsY0FBRixFQUFrQmdTLFFBQWxCLENBQTJCLHFCQUEzQjtBQUNBLE1BQUdoUyxFQUFFLGNBQUYsRUFBa0IrWixRQUFsQixDQUEyQix3QkFBM0IsQ0FBSCxFQUF3RDtBQUN2RDtBQUNBO0FBQ0Q7QUFFRixDQXRCRDs7QUF3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBL1osRUFBRSxvQkFBRixFQUF3QnVOLEVBQXhCLENBQTJCLE9BQTNCLEVBQW9DLFlBQVU7QUFDN0N2TixHQUFFLGlCQUFGLEVBQXFCd3NDLFdBQXJCLENBQWlDLFlBQWpDO0FBQ0F4c0MsR0FBRSxpQkFBRixFQUFxQndzQyxXQUFyQixDQUFpQyxnQ0FBakM7QUFDQXhzQyxHQUFFLGVBQUYsRUFBbUJ3c0MsV0FBbkIsQ0FBK0IsTUFBL0I7QUFDQSxDQUpEOztBQU1BeHNDLEVBQUUscUJBQUYsRUFBeUI4ckMsS0FBekIsQ0FBK0IsWUFBVTtBQUN4QzlyQyxHQUFFLElBQUYsRUFBUWtKLE1BQVIsR0FBaUJzakMsV0FBakIsQ0FBNkIsbUJBQTdCO0FBQ0EsS0FBSXhzQyxFQUFFLElBQUYsRUFBUXdhLElBQVIsR0FBZWphLElBQWYsQ0FBb0IsYUFBcEIsS0FBc0MsTUFBMUMsRUFBa0Q7QUFDakRQLElBQUUsSUFBRixFQUFRd2EsSUFBUixHQUFlamEsSUFBZixDQUFvQixhQUFwQixFQUFtQyxPQUFuQztBQUNBLEVBRkQsTUFFTztBQUNOUCxJQUFFLElBQUYsRUFBUXdhLElBQVIsR0FBZWphLElBQWYsQ0FBb0IsYUFBcEIsRUFBbUMsTUFBbkM7QUFDQTs7QUFFRCxLQUFJUCxFQUFFLElBQUYsRUFBUU8sSUFBUixDQUFhLGVBQWIsS0FBaUMsT0FBckMsRUFBOEM7QUFDN0NQLElBQUUsSUFBRixFQUFRTyxJQUFSLENBQWEsZUFBYixFQUE4QixNQUE5QjtBQUNBLEVBRkQsTUFFTztBQUNOUCxJQUFFLElBQUYsRUFBUXdhLElBQVIsR0FBZWphLElBQWYsQ0FBb0IsZUFBcEIsRUFBcUMsT0FBckM7QUFDQTtBQUNELENBYkQ7O0FBZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQVAsRUFBRSx3QkFBRixFQUE0QjhyQyxLQUE1QixDQUFrQyxVQUFTNW5DLENBQVQsRUFBVztBQUM1QyxLQUFJNjlCLE9BQU8vaEMsRUFBRSxJQUFGLENBQVg7QUFDQSxLQUFJa3NDLFFBQVFuSyxLQUFLMWdDLElBQUwsQ0FBVSxPQUFWLENBQVo7QUFDQSxLQUFJd0ksUUFBUTdKLEVBQUUsS0FBRixFQUFTK2hDLElBQVQsRUFBZWw0QixLQUFmLEVBQVo7QUFDQSxLQUFJRCxTQUFTNUosRUFBRSxLQUFGLEVBQVMraEMsSUFBVCxFQUFlbjRCLE1BQWYsRUFBYjtBQUNBbTRCLE1BQUs3NEIsTUFBTCxHQUFjOEksUUFBZCxDQUF1QixJQUF2QjtBQUNBK3ZCLE1BQUs3NEIsTUFBTCxHQUFjbzBCLE9BQWQsQ0FBc0IsbUZBQW1GNE8sS0FBbkYsR0FBMkYsNEJBQTNGLEdBQTBIcmlDLEtBQTFILEdBQWtJLFlBQWxJLEdBQWlKRCxNQUFqSixHQUEwSiw0RkFBaEw7QUFDQW00QixNQUFLMXZCLElBQUw7QUFDQW5PLEdBQUV1SixjQUFGO0FBQ0EsQ0FURDs7QUFhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBblVBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogd2hhdC1pbnB1dCAtIEEgZ2xvYmFsIHV0aWxpdHkgZm9yIHRyYWNraW5nIHRoZSBjdXJyZW50IGlucHV0IG1ldGhvZCAobW91c2UsIGtleWJvYXJkIG9yIHRvdWNoKS5cbiAqIEB2ZXJzaW9uIHY0LjAuNlxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL3RlbjFzZXZlbi93aGF0LWlucHV0XG4gKiBAbGljZW5zZSBNSVRcbiAqL1xuKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoXCJ3aGF0SW5wdXRcIiwgW10sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wid2hhdElucHV0XCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIndoYXRJbnB1dFwiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIC8qKioqKiovIChmdW5jdGlvbihtb2R1bGVzKSB7IC8vIHdlYnBhY2tCb290c3RyYXBcbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4vKioqKioqLyBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4vKioqKioqLyBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuLyoqKioqKi8gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuLyoqKioqKi8gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuLyoqKioqKi8gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbi8qKioqKiovIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuLyoqKioqKi8gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbi8qKioqKiovIFx0XHRcdGV4cG9ydHM6IHt9LFxuLyoqKioqKi8gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuLyoqKioqKi8gXHRcdFx0bG9hZGVkOiBmYWxzZVxuLyoqKioqKi8gXHRcdH07XG5cbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuLyoqKioqKi8gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbi8qKioqKiovIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuLyoqKioqKi8gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4vKioqKioqLyBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuLyoqKioqKi8gXHR9XG5cblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbi8qKioqKiovIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG4vKioqKioqLyB9KVxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIChbXG4vKiAwICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHRtb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpIHtcblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIFZhcmlhYmxlc1xuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIC8vIGNhY2hlIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudFxuXHQgIHZhciBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG5cdCAgLy8gbGFzdCB1c2VkIGlucHV0IHR5cGVcblx0ICB2YXIgY3VycmVudElucHV0ID0gJ2luaXRpYWwnO1xuXG5cdCAgLy8gbGFzdCB1c2VkIGlucHV0IGludGVudFxuXHQgIHZhciBjdXJyZW50SW50ZW50ID0gbnVsbDtcblxuXHQgIC8vIGZvcm0gaW5wdXQgdHlwZXNcblx0ICB2YXIgZm9ybUlucHV0cyA9IFtcblx0ICAgICdpbnB1dCcsXG5cdCAgICAnc2VsZWN0Jyxcblx0ICAgICd0ZXh0YXJlYSdcblx0ICBdO1xuXG5cdCAgLy8gbGlzdCBvZiBtb2RpZmllciBrZXlzIGNvbW1vbmx5IHVzZWQgd2l0aCB0aGUgbW91c2UgYW5kXG5cdCAgLy8gY2FuIGJlIHNhZmVseSBpZ25vcmVkIHRvIHByZXZlbnQgZmFsc2Uga2V5Ym9hcmQgZGV0ZWN0aW9uXG5cdCAgdmFyIGlnbm9yZU1hcCA9IFtcblx0ICAgIDE2LCAvLyBzaGlmdFxuXHQgICAgMTcsIC8vIGNvbnRyb2xcblx0ICAgIDE4LCAvLyBhbHRcblx0ICAgIDkxLCAvLyBXaW5kb3dzIGtleSAvIGxlZnQgQXBwbGUgY21kXG5cdCAgICA5MyAgLy8gV2luZG93cyBtZW51IC8gcmlnaHQgQXBwbGUgY21kXG5cdCAgXTtcblxuXHQgIC8vIG1hcHBpbmcgb2YgZXZlbnRzIHRvIGlucHV0IHR5cGVzXG5cdCAgdmFyIGlucHV0TWFwID0ge1xuXHQgICAgJ2tleXVwJzogJ2tleWJvYXJkJyxcblx0ICAgICdtb3VzZWRvd24nOiAnbW91c2UnLFxuXHQgICAgJ21vdXNlbW92ZSc6ICdtb3VzZScsXG5cdCAgICAnTVNQb2ludGVyRG93bic6ICdwb2ludGVyJyxcblx0ICAgICdNU1BvaW50ZXJNb3ZlJzogJ3BvaW50ZXInLFxuXHQgICAgJ3BvaW50ZXJkb3duJzogJ3BvaW50ZXInLFxuXHQgICAgJ3BvaW50ZXJtb3ZlJzogJ3BvaW50ZXInLFxuXHQgICAgJ3RvdWNoc3RhcnQnOiAndG91Y2gnXG5cdCAgfTtcblxuXHQgIC8vIGFycmF5IG9mIGFsbCB1c2VkIGlucHV0IHR5cGVzXG5cdCAgdmFyIGlucHV0VHlwZXMgPSBbXTtcblxuXHQgIC8vIGJvb2xlYW46IHRydWUgaWYgdG91Y2ggYnVmZmVyIHRpbWVyIGlzIHJ1bm5pbmdcblx0ICB2YXIgaXNCdWZmZXJpbmcgPSBmYWxzZTtcblxuXHQgIC8vIG1hcCBvZiBJRSAxMCBwb2ludGVyIGV2ZW50c1xuXHQgIHZhciBwb2ludGVyTWFwID0ge1xuXHQgICAgMjogJ3RvdWNoJyxcblx0ICAgIDM6ICd0b3VjaCcsIC8vIHRyZWF0IHBlbiBsaWtlIHRvdWNoXG5cdCAgICA0OiAnbW91c2UnXG5cdCAgfTtcblxuXHQgIC8vIHRvdWNoIGJ1ZmZlciB0aW1lclxuXHQgIHZhciB0b3VjaFRpbWVyID0gbnVsbDtcblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgU2V0IHVwXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgdmFyIHNldFVwID0gZnVuY3Rpb24oKSB7XG5cblx0ICAgIC8vIGFkZCBjb3JyZWN0IG1vdXNlIHdoZWVsIGV2ZW50IG1hcHBpbmcgdG8gYGlucHV0TWFwYFxuXHQgICAgaW5wdXRNYXBbZGV0ZWN0V2hlZWwoKV0gPSAnbW91c2UnO1xuXG5cdCAgICBhZGRMaXN0ZW5lcnMoKTtcblx0ICAgIHNldElucHV0KCk7XG5cdCAgfTtcblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgRXZlbnRzXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgdmFyIGFkZExpc3RlbmVycyA9IGZ1bmN0aW9uKCkge1xuXG5cdCAgICAvLyBgcG9pbnRlcm1vdmVgLCBgTVNQb2ludGVyTW92ZWAsIGBtb3VzZW1vdmVgIGFuZCBtb3VzZSB3aGVlbCBldmVudCBiaW5kaW5nXG5cdCAgICAvLyBjYW4gb25seSBkZW1vbnN0cmF0ZSBwb3RlbnRpYWwsIGJ1dCBub3QgYWN0dWFsLCBpbnRlcmFjdGlvblxuXHQgICAgLy8gYW5kIGFyZSB0cmVhdGVkIHNlcGFyYXRlbHlcblxuXHQgICAgLy8gcG9pbnRlciBldmVudHMgKG1vdXNlLCBwZW4sIHRvdWNoKVxuXHQgICAgaWYgKHdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVyZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHNldEludGVudCk7XG5cdCAgICB9IGVsc2UgaWYgKHdpbmRvdy5NU1BvaW50ZXJFdmVudCkge1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlckRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyTW92ZScsIHNldEludGVudCk7XG5cdCAgICB9IGVsc2Uge1xuXG5cdCAgICAgIC8vIG1vdXNlIGV2ZW50c1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBzZXRJbnRlbnQpO1xuXG5cdCAgICAgIC8vIHRvdWNoIGV2ZW50c1xuXHQgICAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB7XG5cdCAgICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdG91Y2hCdWZmZXIpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cblx0ICAgIC8vIG1vdXNlIHdoZWVsXG5cdCAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoZGV0ZWN0V2hlZWwoKSwgc2V0SW50ZW50KTtcblxuXHQgICAgLy8ga2V5Ym9hcmQgZXZlbnRzXG5cdCAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdXBkYXRlSW5wdXQpO1xuXHQgIH07XG5cblx0ICAvLyBjaGVja3MgY29uZGl0aW9ucyBiZWZvcmUgdXBkYXRpbmcgbmV3IGlucHV0XG5cdCAgdmFyIHVwZGF0ZUlucHV0ID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuXHQgICAgLy8gb25seSBleGVjdXRlIGlmIHRoZSB0b3VjaCBidWZmZXIgdGltZXIgaXNuJ3QgcnVubmluZ1xuXHQgICAgaWYgKCFpc0J1ZmZlcmluZykge1xuXHQgICAgICB2YXIgZXZlbnRLZXkgPSBldmVudC53aGljaDtcblx0ICAgICAgdmFyIHZhbHVlID0gaW5wdXRNYXBbZXZlbnQudHlwZV07XG5cdCAgICAgIGlmICh2YWx1ZSA9PT0gJ3BvaW50ZXInKSB2YWx1ZSA9IHBvaW50ZXJUeXBlKGV2ZW50KTtcblxuXHQgICAgICBpZiAoXG5cdCAgICAgICAgY3VycmVudElucHV0ICE9PSB2YWx1ZSB8fFxuXHQgICAgICAgIGN1cnJlbnRJbnRlbnQgIT09IHZhbHVlXG5cdCAgICAgICkge1xuXG5cdCAgICAgICAgdmFyIGFjdGl2ZUVsZW0gPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXHQgICAgICAgIHZhciBhY3RpdmVJbnB1dCA9IChcblx0ICAgICAgICAgIGFjdGl2ZUVsZW0gJiZcblx0ICAgICAgICAgIGFjdGl2ZUVsZW0ubm9kZU5hbWUgJiZcblx0ICAgICAgICAgIGZvcm1JbnB1dHMuaW5kZXhPZihhY3RpdmVFbGVtLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpID09PSAtMVxuXHQgICAgICAgICkgPyB0cnVlIDogZmFsc2U7XG5cblx0ICAgICAgICBpZiAoXG5cdCAgICAgICAgICB2YWx1ZSA9PT0gJ3RvdWNoJyB8fFxuXG5cdCAgICAgICAgICAvLyBpZ25vcmUgbW91c2UgbW9kaWZpZXIga2V5c1xuXHQgICAgICAgICAgKHZhbHVlID09PSAnbW91c2UnICYmIGlnbm9yZU1hcC5pbmRleE9mKGV2ZW50S2V5KSA9PT0gLTEpIHx8XG5cblx0ICAgICAgICAgIC8vIGRvbid0IHN3aXRjaCBpZiB0aGUgY3VycmVudCBlbGVtZW50IGlzIGEgZm9ybSBpbnB1dFxuXHQgICAgICAgICAgKHZhbHVlID09PSAna2V5Ym9hcmQnICYmIGFjdGl2ZUlucHV0KVxuXHQgICAgICAgICkge1xuXG5cdCAgICAgICAgICAvLyBzZXQgdGhlIGN1cnJlbnQgYW5kIGNhdGNoLWFsbCB2YXJpYWJsZVxuXHQgICAgICAgICAgY3VycmVudElucHV0ID0gY3VycmVudEludGVudCA9IHZhbHVlO1xuXG5cdCAgICAgICAgICBzZXRJbnB1dCgpO1xuXHQgICAgICAgIH1cblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyB1cGRhdGVzIHRoZSBkb2MgYW5kIGBpbnB1dFR5cGVzYCBhcnJheSB3aXRoIG5ldyBpbnB1dFxuXHQgIHZhciBzZXRJbnB1dCA9IGZ1bmN0aW9uKCkge1xuXHQgICAgZG9jRWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGlucHV0JywgY3VycmVudElucHV0KTtcblx0ICAgIGRvY0VsZW0uc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnRlbnQnLCBjdXJyZW50SW5wdXQpO1xuXG5cdCAgICBpZiAoaW5wdXRUeXBlcy5pbmRleE9mKGN1cnJlbnRJbnB1dCkgPT09IC0xKSB7XG5cdCAgICAgIGlucHV0VHlwZXMucHVzaChjdXJyZW50SW5wdXQpO1xuXHQgICAgICBkb2NFbGVtLmNsYXNzTmFtZSArPSAnIHdoYXRpbnB1dC10eXBlcy0nICsgY3VycmVudElucHV0O1xuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyB1cGRhdGVzIGlucHV0IGludGVudCBmb3IgYG1vdXNlbW92ZWAgYW5kIGBwb2ludGVybW92ZWBcblx0ICB2YXIgc2V0SW50ZW50ID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuXHQgICAgLy8gb25seSBleGVjdXRlIGlmIHRoZSB0b3VjaCBidWZmZXIgdGltZXIgaXNuJ3QgcnVubmluZ1xuXHQgICAgaWYgKCFpc0J1ZmZlcmluZykge1xuXHQgICAgICB2YXIgdmFsdWUgPSBpbnB1dE1hcFtldmVudC50eXBlXTtcblx0ICAgICAgaWYgKHZhbHVlID09PSAncG9pbnRlcicpIHZhbHVlID0gcG9pbnRlclR5cGUoZXZlbnQpO1xuXG5cdCAgICAgIGlmIChjdXJyZW50SW50ZW50ICE9PSB2YWx1ZSkge1xuXHQgICAgICAgIGN1cnJlbnRJbnRlbnQgPSB2YWx1ZTtcblxuXHQgICAgICAgIGRvY0VsZW0uc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnRlbnQnLCBjdXJyZW50SW50ZW50KTtcblx0ICAgICAgfVxuXHQgICAgfVxuXHQgIH07XG5cblx0ICAvLyBidWZmZXJzIHRvdWNoIGV2ZW50cyBiZWNhdXNlIHRoZXkgZnJlcXVlbnRseSBhbHNvIGZpcmUgbW91c2UgZXZlbnRzXG5cdCAgdmFyIHRvdWNoQnVmZmVyID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuXHQgICAgLy8gY2xlYXIgdGhlIHRpbWVyIGlmIGl0IGhhcHBlbnMgdG8gYmUgcnVubmluZ1xuXHQgICAgd2luZG93LmNsZWFyVGltZW91dCh0b3VjaFRpbWVyKTtcblxuXHQgICAgLy8gc2V0IHRoZSBjdXJyZW50IGlucHV0XG5cdCAgICB1cGRhdGVJbnB1dChldmVudCk7XG5cblx0ICAgIC8vIHNldCB0aGUgaXNCdWZmZXJpbmcgdG8gYHRydWVgXG5cdCAgICBpc0J1ZmZlcmluZyA9IHRydWU7XG5cblx0ICAgIC8vIHJ1biB0aGUgdGltZXJcblx0ICAgIHRvdWNoVGltZXIgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcblxuXHQgICAgICAvLyBpZiB0aGUgdGltZXIgcnVucyBvdXQsIHNldCBpc0J1ZmZlcmluZyBiYWNrIHRvIGBmYWxzZWBcblx0ICAgICAgaXNCdWZmZXJpbmcgPSBmYWxzZTtcblx0ICAgIH0sIDIwMCk7XG5cdCAgfTtcblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgVXRpbGl0aWVzXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgdmFyIHBvaW50ZXJUeXBlID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0ICAgaWYgKHR5cGVvZiBldmVudC5wb2ludGVyVHlwZSA9PT0gJ251bWJlcicpIHtcblx0ICAgICAgcmV0dXJuIHBvaW50ZXJNYXBbZXZlbnQucG9pbnRlclR5cGVdO1xuXHQgICB9IGVsc2Uge1xuXHQgICAgICByZXR1cm4gKGV2ZW50LnBvaW50ZXJUeXBlID09PSAncGVuJykgPyAndG91Y2gnIDogZXZlbnQucG9pbnRlclR5cGU7IC8vIHRyZWF0IHBlbiBsaWtlIHRvdWNoXG5cdCAgIH1cblx0ICB9O1xuXG5cdCAgLy8gZGV0ZWN0IHZlcnNpb24gb2YgbW91c2Ugd2hlZWwgZXZlbnQgdG8gdXNlXG5cdCAgLy8gdmlhIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0V2ZW50cy93aGVlbFxuXHQgIHZhciBkZXRlY3RXaGVlbCA9IGZ1bmN0aW9uKCkge1xuXHQgICAgcmV0dXJuICdvbndoZWVsJyBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSA/XG5cdCAgICAgICd3aGVlbCcgOiAvLyBNb2Rlcm4gYnJvd3NlcnMgc3VwcG9ydCBcIndoZWVsXCJcblxuXHQgICAgICBkb2N1bWVudC5vbm1vdXNld2hlZWwgIT09IHVuZGVmaW5lZCA/XG5cdCAgICAgICAgJ21vdXNld2hlZWwnIDogLy8gV2Via2l0IGFuZCBJRSBzdXBwb3J0IGF0IGxlYXN0IFwibW91c2V3aGVlbFwiXG5cdCAgICAgICAgJ0RPTU1vdXNlU2Nyb2xsJzsgLy8gbGV0J3MgYXNzdW1lIHRoYXQgcmVtYWluaW5nIGJyb3dzZXJzIGFyZSBvbGRlciBGaXJlZm94XG5cdCAgfTtcblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgSW5pdFxuXG5cdCAgICBkb24ndCBzdGFydCBzY3JpcHQgdW5sZXNzIGJyb3dzZXIgY3V0cyB0aGUgbXVzdGFyZFxuXHQgICAgKGFsc28gcGFzc2VzIGlmIHBvbHlmaWxscyBhcmUgdXNlZClcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICBpZiAoXG5cdCAgICAnYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luZG93ICYmXG5cdCAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZlxuXHQgICkge1xuXHQgICAgc2V0VXAoKTtcblx0ICB9XG5cblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIEFQSVxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIHJldHVybiB7XG5cblx0ICAgIC8vIHJldHVybnMgc3RyaW5nOiB0aGUgY3VycmVudCBpbnB1dCB0eXBlXG5cdCAgICAvLyBvcHQ6ICdsb29zZSd8J3N0cmljdCdcblx0ICAgIC8vICdzdHJpY3QnIChkZWZhdWx0KTogcmV0dXJucyB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgYGRhdGEtd2hhdGlucHV0YCBhdHRyaWJ1dGVcblx0ICAgIC8vICdsb29zZSc6IGluY2x1ZGVzIGBkYXRhLXdoYXRpbnRlbnRgIHZhbHVlIGlmIGl0J3MgbW9yZSBjdXJyZW50IHRoYW4gYGRhdGEtd2hhdGlucHV0YFxuXHQgICAgYXNrOiBmdW5jdGlvbihvcHQpIHsgcmV0dXJuIChvcHQgPT09ICdsb29zZScpID8gY3VycmVudEludGVudCA6IGN1cnJlbnRJbnB1dDsgfSxcblxuXHQgICAgLy8gcmV0dXJucyBhcnJheTogYWxsIHRoZSBkZXRlY3RlZCBpbnB1dCB0eXBlc1xuXHQgICAgdHlwZXM6IGZ1bmN0aW9uKCkgeyByZXR1cm4gaW5wdXRUeXBlczsgfVxuXG5cdCAgfTtcblxuXHR9KCkpO1xuXG5cbi8qKiovIH1cbi8qKioqKiovIF0pXG59KTtcbjsiLCIhZnVuY3Rpb24oJCkge1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIEZPVU5EQVRJT05fVkVSU0lPTiA9ICc2LjMuMSc7XG5cbi8vIEdsb2JhbCBGb3VuZGF0aW9uIG9iamVjdFxuLy8gVGhpcyBpcyBhdHRhY2hlZCB0byB0aGUgd2luZG93LCBvciB1c2VkIGFzIGEgbW9kdWxlIGZvciBBTUQvQnJvd3NlcmlmeVxudmFyIEZvdW5kYXRpb24gPSB7XG4gIHZlcnNpb246IEZPVU5EQVRJT05fVkVSU0lPTixcblxuICAvKipcbiAgICogU3RvcmVzIGluaXRpYWxpemVkIHBsdWdpbnMuXG4gICAqL1xuICBfcGx1Z2luczoge30sXG5cbiAgLyoqXG4gICAqIFN0b3JlcyBnZW5lcmF0ZWQgdW5pcXVlIGlkcyBmb3IgcGx1Z2luIGluc3RhbmNlc1xuICAgKi9cbiAgX3V1aWRzOiBbXSxcblxuICAvKipcbiAgICogUmV0dXJucyBhIGJvb2xlYW4gZm9yIFJUTCBzdXBwb3J0XG4gICAqL1xuICBydGw6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuICQoJ2h0bWwnKS5hdHRyKCdkaXInKSA9PT0gJ3J0bCc7XG4gIH0sXG4gIC8qKlxuICAgKiBEZWZpbmVzIGEgRm91bmRhdGlvbiBwbHVnaW4sIGFkZGluZyBpdCB0byB0aGUgYEZvdW5kYXRpb25gIG5hbWVzcGFjZSBhbmQgdGhlIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplIHdoZW4gcmVmbG93aW5nLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gVGhlIGNvbnN0cnVjdG9yIG9mIHRoZSBwbHVnaW4uXG4gICAqL1xuICBwbHVnaW46IGZ1bmN0aW9uKHBsdWdpbiwgbmFtZSkge1xuICAgIC8vIE9iamVjdCBrZXkgdG8gdXNlIHdoZW4gYWRkaW5nIHRvIGdsb2JhbCBGb3VuZGF0aW9uIG9iamVjdFxuICAgIC8vIEV4YW1wbGVzOiBGb3VuZGF0aW9uLlJldmVhbCwgRm91bmRhdGlvbi5PZmZDYW52YXNcbiAgICB2YXIgY2xhc3NOYW1lID0gKG5hbWUgfHwgZnVuY3Rpb25OYW1lKHBsdWdpbikpO1xuICAgIC8vIE9iamVjdCBrZXkgdG8gdXNlIHdoZW4gc3RvcmluZyB0aGUgcGx1Z2luLCBhbHNvIHVzZWQgdG8gY3JlYXRlIHRoZSBpZGVudGlmeWluZyBkYXRhIGF0dHJpYnV0ZSBmb3IgdGhlIHBsdWdpblxuICAgIC8vIEV4YW1wbGVzOiBkYXRhLXJldmVhbCwgZGF0YS1vZmYtY2FudmFzXG4gICAgdmFyIGF0dHJOYW1lICA9IGh5cGhlbmF0ZShjbGFzc05hbWUpO1xuXG4gICAgLy8gQWRkIHRvIHRoZSBGb3VuZGF0aW9uIG9iamVjdCBhbmQgdGhlIHBsdWdpbnMgbGlzdCAoZm9yIHJlZmxvd2luZylcbiAgICB0aGlzLl9wbHVnaW5zW2F0dHJOYW1lXSA9IHRoaXNbY2xhc3NOYW1lXSA9IHBsdWdpbjtcbiAgfSxcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBQb3B1bGF0ZXMgdGhlIF91dWlkcyBhcnJheSB3aXRoIHBvaW50ZXJzIHRvIGVhY2ggaW5kaXZpZHVhbCBwbHVnaW4gaW5zdGFuY2UuXG4gICAqIEFkZHMgdGhlIGB6ZlBsdWdpbmAgZGF0YS1hdHRyaWJ1dGUgdG8gcHJvZ3JhbW1hdGljYWxseSBjcmVhdGVkIHBsdWdpbnMgdG8gYWxsb3cgdXNlIG9mICQoc2VsZWN0b3IpLmZvdW5kYXRpb24obWV0aG9kKSBjYWxscy5cbiAgICogQWxzbyBmaXJlcyB0aGUgaW5pdGlhbGl6YXRpb24gZXZlbnQgZm9yIGVhY2ggcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGV0aXRpdmUgY29kZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSAtIHRoZSBuYW1lIG9mIHRoZSBwbHVnaW4sIHBhc3NlZCBhcyBhIGNhbWVsQ2FzZWQgc3RyaW5nLlxuICAgKiBAZmlyZXMgUGx1Z2luI2luaXRcbiAgICovXG4gIHJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbihwbHVnaW4sIG5hbWUpe1xuICAgIHZhciBwbHVnaW5OYW1lID0gbmFtZSA/IGh5cGhlbmF0ZShuYW1lKSA6IGZ1bmN0aW9uTmFtZShwbHVnaW4uY29uc3RydWN0b3IpLnRvTG93ZXJDYXNlKCk7XG4gICAgcGx1Z2luLnV1aWQgPSB0aGlzLkdldFlvRGlnaXRzKDYsIHBsdWdpbk5hbWUpO1xuXG4gICAgaWYoIXBsdWdpbi4kZWxlbWVudC5hdHRyKGBkYXRhLSR7cGx1Z2luTmFtZX1gKSl7IHBsdWdpbi4kZWxlbWVudC5hdHRyKGBkYXRhLSR7cGx1Z2luTmFtZX1gLCBwbHVnaW4udXVpZCk7IH1cbiAgICBpZighcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykpeyBwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nLCBwbHVnaW4pOyB9XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBpbml0aWFsaXplZC5cbiAgICAgICAgICAgKiBAZXZlbnQgUGx1Z2luI2luaXRcbiAgICAgICAgICAgKi9cbiAgICBwbHVnaW4uJGVsZW1lbnQudHJpZ2dlcihgaW5pdC56Zi4ke3BsdWdpbk5hbWV9YCk7XG5cbiAgICB0aGlzLl91dWlkcy5wdXNoKHBsdWdpbi51dWlkKTtcblxuICAgIHJldHVybjtcbiAgfSxcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBSZW1vdmVzIHRoZSBwbHVnaW5zIHV1aWQgZnJvbSB0aGUgX3V1aWRzIGFycmF5LlxuICAgKiBSZW1vdmVzIHRoZSB6ZlBsdWdpbiBkYXRhIGF0dHJpYnV0ZSwgYXMgd2VsbCBhcyB0aGUgZGF0YS1wbHVnaW4tbmFtZSBhdHRyaWJ1dGUuXG4gICAqIEFsc28gZmlyZXMgdGhlIGRlc3Ryb3llZCBldmVudCBmb3IgdGhlIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBldGl0aXZlIGNvZGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICogQGZpcmVzIFBsdWdpbiNkZXN0cm95ZWRcbiAgICovXG4gIHVucmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbil7XG4gICAgdmFyIHBsdWdpbk5hbWUgPSBoeXBoZW5hdGUoZnVuY3Rpb25OYW1lKHBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpLmNvbnN0cnVjdG9yKSk7XG5cbiAgICB0aGlzLl91dWlkcy5zcGxpY2UodGhpcy5fdXVpZHMuaW5kZXhPZihwbHVnaW4udXVpZCksIDEpO1xuICAgIHBsdWdpbi4kZWxlbWVudC5yZW1vdmVBdHRyKGBkYXRhLSR7cGx1Z2luTmFtZX1gKS5yZW1vdmVEYXRhKCd6ZlBsdWdpbicpXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBiZWVuIGRlc3Ryb3llZC5cbiAgICAgICAgICAgKiBAZXZlbnQgUGx1Z2luI2Rlc3Ryb3llZFxuICAgICAgICAgICAqL1xuICAgICAgICAgIC50cmlnZ2VyKGBkZXN0cm95ZWQuemYuJHtwbHVnaW5OYW1lfWApO1xuICAgIGZvcih2YXIgcHJvcCBpbiBwbHVnaW4pe1xuICAgICAgcGx1Z2luW3Byb3BdID0gbnVsbDsvL2NsZWFuIHVwIHNjcmlwdCB0byBwcmVwIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXG4gICAgfVxuICAgIHJldHVybjtcbiAgfSxcblxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIENhdXNlcyBvbmUgb3IgbW9yZSBhY3RpdmUgcGx1Z2lucyB0byByZS1pbml0aWFsaXplLCByZXNldHRpbmcgZXZlbnQgbGlzdGVuZXJzLCByZWNhbGN1bGF0aW5nIHBvc2l0aW9ucywgZXRjLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGx1Z2lucyAtIG9wdGlvbmFsIHN0cmluZyBvZiBhbiBpbmRpdmlkdWFsIHBsdWdpbiBrZXksIGF0dGFpbmVkIGJ5IGNhbGxpbmcgYCQoZWxlbWVudCkuZGF0YSgncGx1Z2luTmFtZScpYCwgb3Igc3RyaW5nIG9mIGEgcGx1Z2luIGNsYXNzIGkuZS4gYCdkcm9wZG93bidgXG4gICAqIEBkZWZhdWx0IElmIG5vIGFyZ3VtZW50IGlzIHBhc3NlZCwgcmVmbG93IGFsbCBjdXJyZW50bHkgYWN0aXZlIHBsdWdpbnMuXG4gICAqL1xuICAgcmVJbml0OiBmdW5jdGlvbihwbHVnaW5zKXtcbiAgICAgdmFyIGlzSlEgPSBwbHVnaW5zIGluc3RhbmNlb2YgJDtcbiAgICAgdHJ5e1xuICAgICAgIGlmKGlzSlEpe1xuICAgICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICQodGhpcykuZGF0YSgnemZQbHVnaW4nKS5faW5pdCgpO1xuICAgICAgICAgfSk7XG4gICAgICAgfWVsc2V7XG4gICAgICAgICB2YXIgdHlwZSA9IHR5cGVvZiBwbHVnaW5zLFxuICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgZm5zID0ge1xuICAgICAgICAgICAnb2JqZWN0JzogZnVuY3Rpb24ocGxncyl7XG4gICAgICAgICAgICAgcGxncy5mb3JFYWNoKGZ1bmN0aW9uKHApe1xuICAgICAgICAgICAgICAgcCA9IGh5cGhlbmF0ZShwKTtcbiAgICAgICAgICAgICAgICQoJ1tkYXRhLScrIHAgKyddJykuZm91bmRhdGlvbignX2luaXQnKTtcbiAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgfSxcbiAgICAgICAgICAgJ3N0cmluZyc6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgcGx1Z2lucyA9IGh5cGhlbmF0ZShwbHVnaW5zKTtcbiAgICAgICAgICAgICAkKCdbZGF0YS0nKyBwbHVnaW5zICsnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgIH0sXG4gICAgICAgICAgICd1bmRlZmluZWQnOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgIHRoaXNbJ29iamVjdCddKE9iamVjdC5rZXlzKF90aGlzLl9wbHVnaW5zKSk7XG4gICAgICAgICAgIH1cbiAgICAgICAgIH07XG4gICAgICAgICBmbnNbdHlwZV0ocGx1Z2lucyk7XG4gICAgICAgfVxuICAgICB9Y2F0Y2goZXJyKXtcbiAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgIH1maW5hbGx5e1xuICAgICAgIHJldHVybiBwbHVnaW5zO1xuICAgICB9XG4gICB9LFxuXG4gIC8qKlxuICAgKiByZXR1cm5zIGEgcmFuZG9tIGJhc2UtMzYgdWlkIHdpdGggbmFtZXNwYWNpbmdcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggLSBudW1iZXIgb2YgcmFuZG9tIGJhc2UtMzYgZGlnaXRzIGRlc2lyZWQuIEluY3JlYXNlIGZvciBtb3JlIHJhbmRvbSBzdHJpbmdzLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlIC0gbmFtZSBvZiBwbHVnaW4gdG8gYmUgaW5jb3Jwb3JhdGVkIGluIHVpZCwgb3B0aW9uYWwuXG4gICAqIEBkZWZhdWx0IHtTdHJpbmd9ICcnIC0gaWYgbm8gcGx1Z2luIG5hbWUgaXMgcHJvdmlkZWQsIG5vdGhpbmcgaXMgYXBwZW5kZWQgdG8gdGhlIHVpZC5cbiAgICogQHJldHVybnMge1N0cmluZ30gLSB1bmlxdWUgaWRcbiAgICovXG4gIEdldFlvRGlnaXRzOiBmdW5jdGlvbihsZW5ndGgsIG5hbWVzcGFjZSl7XG4gICAgbGVuZ3RoID0gbGVuZ3RoIHx8IDY7XG4gICAgcmV0dXJuIE1hdGgucm91bmQoKE1hdGgucG93KDM2LCBsZW5ndGggKyAxKSAtIE1hdGgucmFuZG9tKCkgKiBNYXRoLnBvdygzNiwgbGVuZ3RoKSkpLnRvU3RyaW5nKDM2KS5zbGljZSgxKSArIChuYW1lc3BhY2UgPyBgLSR7bmFtZXNwYWNlfWAgOiAnJyk7XG4gIH0sXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHBsdWdpbnMgb24gYW55IGVsZW1lbnRzIHdpdGhpbiBgZWxlbWAgKGFuZCBgZWxlbWAgaXRzZWxmKSB0aGF0IGFyZW4ndCBhbHJlYWR5IGluaXRpYWxpemVkLlxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbSAtIGpRdWVyeSBvYmplY3QgY29udGFpbmluZyB0aGUgZWxlbWVudCB0byBjaGVjayBpbnNpZGUuIEFsc28gY2hlY2tzIHRoZSBlbGVtZW50IGl0c2VsZiwgdW5sZXNzIGl0J3MgdGhlIGBkb2N1bWVudGAgb2JqZWN0LlxuICAgKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gcGx1Z2lucyAtIEEgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUuIExlYXZlIHRoaXMgb3V0IHRvIGluaXRpYWxpemUgZXZlcnl0aGluZy5cbiAgICovXG4gIHJlZmxvdzogZnVuY3Rpb24oZWxlbSwgcGx1Z2lucykge1xuXG4gICAgLy8gSWYgcGx1Z2lucyBpcyB1bmRlZmluZWQsIGp1c3QgZ3JhYiBldmVyeXRoaW5nXG4gICAgaWYgKHR5cGVvZiBwbHVnaW5zID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcGx1Z2lucyA9IE9iamVjdC5rZXlzKHRoaXMuX3BsdWdpbnMpO1xuICAgIH1cbiAgICAvLyBJZiBwbHVnaW5zIGlzIGEgc3RyaW5nLCBjb252ZXJ0IGl0IHRvIGFuIGFycmF5IHdpdGggb25lIGl0ZW1cbiAgICBlbHNlIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHBsdWdpbnMgPSBbcGx1Z2luc107XG4gICAgfVxuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHBsdWdpblxuICAgICQuZWFjaChwbHVnaW5zLCBmdW5jdGlvbihpLCBuYW1lKSB7XG4gICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgcGx1Z2luXG4gICAgICB2YXIgcGx1Z2luID0gX3RoaXMuX3BsdWdpbnNbbmFtZV07XG5cbiAgICAgIC8vIExvY2FsaXplIHRoZSBzZWFyY2ggdG8gYWxsIGVsZW1lbnRzIGluc2lkZSBlbGVtLCBhcyB3ZWxsIGFzIGVsZW0gaXRzZWxmLCB1bmxlc3MgZWxlbSA9PT0gZG9jdW1lbnRcbiAgICAgIHZhciAkZWxlbSA9ICQoZWxlbSkuZmluZCgnW2RhdGEtJytuYW1lKyddJykuYWRkQmFjaygnW2RhdGEtJytuYW1lKyddJyk7XG5cbiAgICAgIC8vIEZvciBlYWNoIHBsdWdpbiBmb3VuZCwgaW5pdGlhbGl6ZSBpdFxuICAgICAgJGVsZW0uZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRlbCA9ICQodGhpcyksXG4gICAgICAgICAgICBvcHRzID0ge307XG4gICAgICAgIC8vIERvbid0IGRvdWJsZS1kaXAgb24gcGx1Z2luc1xuICAgICAgICBpZiAoJGVsLmRhdGEoJ3pmUGx1Z2luJykpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJUcmllZCB0byBpbml0aWFsaXplIFwiK25hbWUrXCIgb24gYW4gZWxlbWVudCB0aGF0IGFscmVhZHkgaGFzIGEgRm91bmRhdGlvbiBwbHVnaW4uXCIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKSl7XG4gICAgICAgICAgdmFyIHRoaW5nID0gJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpLnNwbGl0KCc7JykuZm9yRWFjaChmdW5jdGlvbihlLCBpKXtcbiAgICAgICAgICAgIHZhciBvcHQgPSBlLnNwbGl0KCc6JykubWFwKGZ1bmN0aW9uKGVsKXsgcmV0dXJuIGVsLnRyaW0oKTsgfSk7XG4gICAgICAgICAgICBpZihvcHRbMF0pIG9wdHNbb3B0WzBdXSA9IHBhcnNlVmFsdWUob3B0WzFdKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0cnl7XG4gICAgICAgICAgJGVsLmRhdGEoJ3pmUGx1Z2luJywgbmV3IHBsdWdpbigkKHRoaXMpLCBvcHRzKSk7XG4gICAgICAgIH1jYXRjaChlcil7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcik7XG4gICAgICAgIH1maW5hbGx5e1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0sXG4gIGdldEZuTmFtZTogZnVuY3Rpb25OYW1lLFxuICB0cmFuc2l0aW9uZW5kOiBmdW5jdGlvbigkZWxlbSl7XG4gICAgdmFyIHRyYW5zaXRpb25zID0ge1xuICAgICAgJ3RyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAnV2Via2l0VHJhbnNpdGlvbic6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgICdNb3pUcmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgJ09UcmFuc2l0aW9uJzogJ290cmFuc2l0aW9uZW5kJ1xuICAgIH07XG4gICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgICAgZW5kO1xuXG4gICAgZm9yICh2YXIgdCBpbiB0cmFuc2l0aW9ucyl7XG4gICAgICBpZiAodHlwZW9mIGVsZW0uc3R5bGVbdF0gIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgZW5kID0gdHJhbnNpdGlvbnNbdF07XG4gICAgICB9XG4gICAgfVxuICAgIGlmKGVuZCl7XG4gICAgICByZXR1cm4gZW5kO1xuICAgIH1lbHNle1xuICAgICAgZW5kID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAkZWxlbS50cmlnZ2VySGFuZGxlcigndHJhbnNpdGlvbmVuZCcsIFskZWxlbV0pO1xuICAgICAgfSwgMSk7XG4gICAgICByZXR1cm4gJ3RyYW5zaXRpb25lbmQnO1xuICAgIH1cbiAgfVxufTtcblxuRm91bmRhdGlvbi51dGlsID0ge1xuICAvKipcbiAgICogRnVuY3Rpb24gZm9yIGFwcGx5aW5nIGEgZGVib3VuY2UgZWZmZWN0IHRvIGEgZnVuY3Rpb24gY2FsbC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgLSBGdW5jdGlvbiB0byBiZSBjYWxsZWQgYXQgZW5kIG9mIHRpbWVvdXQuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBkZWxheSAtIFRpbWUgaW4gbXMgdG8gZGVsYXkgdGhlIGNhbGwgb2YgYGZ1bmNgLlxuICAgKiBAcmV0dXJucyBmdW5jdGlvblxuICAgKi9cbiAgdGhyb3R0bGU6IGZ1bmN0aW9uIChmdW5jLCBkZWxheSkge1xuICAgIHZhciB0aW1lciA9IG51bGw7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICBpZiAodGltZXIgPT09IG51bGwpIHtcbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIHRpbWVyID0gbnVsbDtcbiAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn07XG5cbi8vIFRPRE86IGNvbnNpZGVyIG5vdCBtYWtpbmcgdGhpcyBhIGpRdWVyeSBmdW5jdGlvblxuLy8gVE9ETzogbmVlZCB3YXkgdG8gcmVmbG93IHZzLiByZS1pbml0aWFsaXplXG4vKipcbiAqIFRoZSBGb3VuZGF0aW9uIGpRdWVyeSBtZXRob2QuXG4gKiBAcGFyYW0ge1N0cmluZ3xBcnJheX0gbWV0aG9kIC0gQW4gYWN0aW9uIHRvIHBlcmZvcm0gb24gdGhlIGN1cnJlbnQgalF1ZXJ5IG9iamVjdC5cbiAqL1xudmFyIGZvdW5kYXRpb24gPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgbWV0aG9kLFxuICAgICAgJG1ldGEgPSAkKCdtZXRhLmZvdW5kYXRpb24tbXEnKSxcbiAgICAgICRub0pTID0gJCgnLm5vLWpzJyk7XG5cbiAgaWYoISRtZXRhLmxlbmd0aCl7XG4gICAgJCgnPG1ldGEgY2xhc3M9XCJmb3VuZGF0aW9uLW1xXCI+JykuYXBwZW5kVG8oZG9jdW1lbnQuaGVhZCk7XG4gIH1cbiAgaWYoJG5vSlMubGVuZ3RoKXtcbiAgICAkbm9KUy5yZW1vdmVDbGFzcygnbm8tanMnKTtcbiAgfVxuXG4gIGlmKHR5cGUgPT09ICd1bmRlZmluZWQnKXsvL25lZWRzIHRvIGluaXRpYWxpemUgdGhlIEZvdW5kYXRpb24gb2JqZWN0LCBvciBhbiBpbmRpdmlkdWFsIHBsdWdpbi5cbiAgICBGb3VuZGF0aW9uLk1lZGlhUXVlcnkuX2luaXQoKTtcbiAgICBGb3VuZGF0aW9uLnJlZmxvdyh0aGlzKTtcbiAgfWVsc2UgaWYodHlwZSA9PT0gJ3N0cmluZycpey8vYW4gaW5kaXZpZHVhbCBtZXRob2QgdG8gaW52b2tlIG9uIGEgcGx1Z2luIG9yIGdyb3VwIG9mIHBsdWdpbnNcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7Ly9jb2xsZWN0IGFsbCB0aGUgYXJndW1lbnRzLCBpZiBuZWNlc3NhcnlcbiAgICB2YXIgcGx1Z0NsYXNzID0gdGhpcy5kYXRhKCd6ZlBsdWdpbicpOy8vZGV0ZXJtaW5lIHRoZSBjbGFzcyBvZiBwbHVnaW5cblxuICAgIGlmKHBsdWdDbGFzcyAhPT0gdW5kZWZpbmVkICYmIHBsdWdDbGFzc1ttZXRob2RdICE9PSB1bmRlZmluZWQpey8vbWFrZSBzdXJlIGJvdGggdGhlIGNsYXNzIGFuZCBtZXRob2QgZXhpc3RcbiAgICAgIGlmKHRoaXMubGVuZ3RoID09PSAxKXsvL2lmIHRoZXJlJ3Mgb25seSBvbmUsIGNhbGwgaXQgZGlyZWN0bHkuXG4gICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkocGx1Z0NsYXNzLCBhcmdzKTtcbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSwgZWwpey8vb3RoZXJ3aXNlIGxvb3AgdGhyb3VnaCB0aGUgalF1ZXJ5IGNvbGxlY3Rpb24gYW5kIGludm9rZSB0aGUgbWV0aG9kIG9uIGVhY2hcbiAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseSgkKGVsKS5kYXRhKCd6ZlBsdWdpbicpLCBhcmdzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfWVsc2V7Ly9lcnJvciBmb3Igbm8gY2xhc3Mgb3Igbm8gbWV0aG9kXG4gICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJXZSdyZSBzb3JyeSwgJ1wiICsgbWV0aG9kICsgXCInIGlzIG5vdCBhbiBhdmFpbGFibGUgbWV0aG9kIGZvciBcIiArIChwbHVnQ2xhc3MgPyBmdW5jdGlvbk5hbWUocGx1Z0NsYXNzKSA6ICd0aGlzIGVsZW1lbnQnKSArICcuJyk7XG4gICAgfVxuICB9ZWxzZXsvL2Vycm9yIGZvciBpbnZhbGlkIGFyZ3VtZW50IHR5cGVcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBXZSdyZSBzb3JyeSwgJHt0eXBlfSBpcyBub3QgYSB2YWxpZCBwYXJhbWV0ZXIuIFlvdSBtdXN0IHVzZSBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG1ldGhvZCB5b3Ugd2lzaCB0byBpbnZva2UuYCk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG53aW5kb3cuRm91bmRhdGlvbiA9IEZvdW5kYXRpb247XG4kLmZuLmZvdW5kYXRpb24gPSBmb3VuZGF0aW9uO1xuXG4vLyBQb2x5ZmlsbCBmb3IgcmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4oZnVuY3Rpb24oKSB7XG4gIGlmICghRGF0ZS5ub3cgfHwgIXdpbmRvdy5EYXRlLm5vdylcbiAgICB3aW5kb3cuRGF0ZS5ub3cgPSBEYXRlLm5vdyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG5cbiAgdmFyIHZlbmRvcnMgPSBbJ3dlYmtpdCcsICdtb3onXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2ZW5kb3JzLmxlbmd0aCAmJiAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTsgKytpKSB7XG4gICAgICB2YXIgdnAgPSB2ZW5kb3JzW2ldO1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2cCsnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ107XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSAod2luZG93W3ZwKydDYW5jZWxBbmltYXRpb25GcmFtZSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8fCB3aW5kb3dbdnArJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddKTtcbiAgfVxuICBpZiAoL2lQKGFkfGhvbmV8b2QpLipPUyA2Ly50ZXN0KHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50KVxuICAgIHx8ICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8ICF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgdmFyIG5leHRUaW1lID0gTWF0aC5tYXgobGFzdFRpbWUgKyAxNiwgbm93KTtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGNhbGxiYWNrKGxhc3RUaW1lID0gbmV4dFRpbWUpOyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0VGltZSAtIG5vdyk7XG4gICAgfTtcbiAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjbGVhclRpbWVvdXQ7XG4gIH1cbiAgLyoqXG4gICAqIFBvbHlmaWxsIGZvciBwZXJmb3JtYW5jZS5ub3csIHJlcXVpcmVkIGJ5IHJBRlxuICAgKi9cbiAgaWYoIXdpbmRvdy5wZXJmb3JtYW5jZSB8fCAhd2luZG93LnBlcmZvcm1hbmNlLm5vdyl7XG4gICAgd2luZG93LnBlcmZvcm1hbmNlID0ge1xuICAgICAgc3RhcnQ6IERhdGUubm93KCksXG4gICAgICBub3c6IGZ1bmN0aW9uKCl7IHJldHVybiBEYXRlLm5vdygpIC0gdGhpcy5zdGFydDsgfVxuICAgIH07XG4gIH1cbn0pKCk7XG5pZiAoIUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKSB7XG4gIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24ob1RoaXMpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIGNsb3Nlc3QgdGhpbmcgcG9zc2libGUgdG8gdGhlIEVDTUFTY3JpcHQgNVxuICAgICAgLy8gaW50ZXJuYWwgSXNDYWxsYWJsZSBmdW5jdGlvblxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgLSB3aGF0IGlzIHRyeWluZyB0byBiZSBib3VuZCBpcyBub3QgY2FsbGFibGUnKTtcbiAgICB9XG5cbiAgICB2YXIgYUFyZ3MgICA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgIGZUb0JpbmQgPSB0aGlzLFxuICAgICAgICBmTk9QICAgID0gZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgZkJvdW5kICA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBmVG9CaW5kLmFwcGx5KHRoaXMgaW5zdGFuY2VvZiBmTk9QXG4gICAgICAgICAgICAgICAgID8gdGhpc1xuICAgICAgICAgICAgICAgICA6IG9UaGlzLFxuICAgICAgICAgICAgICAgICBhQXJncy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgICB9O1xuXG4gICAgaWYgKHRoaXMucHJvdG90eXBlKSB7XG4gICAgICAvLyBuYXRpdmUgZnVuY3Rpb25zIGRvbid0IGhhdmUgYSBwcm90b3R5cGVcbiAgICAgIGZOT1AucHJvdG90eXBlID0gdGhpcy5wcm90b3R5cGU7XG4gICAgfVxuICAgIGZCb3VuZC5wcm90b3R5cGUgPSBuZXcgZk5PUCgpO1xuXG4gICAgcmV0dXJuIGZCb3VuZDtcbiAgfTtcbn1cbi8vIFBvbHlmaWxsIHRvIGdldCB0aGUgbmFtZSBvZiBhIGZ1bmN0aW9uIGluIElFOVxuZnVuY3Rpb24gZnVuY3Rpb25OYW1lKGZuKSB7XG4gIGlmIChGdW5jdGlvbi5wcm90b3R5cGUubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIGZ1bmNOYW1lUmVnZXggPSAvZnVuY3Rpb25cXHMoW14oXXsxLH0pXFwoLztcbiAgICB2YXIgcmVzdWx0cyA9IChmdW5jTmFtZVJlZ2V4KS5leGVjKChmbikudG9TdHJpbmcoKSk7XG4gICAgcmV0dXJuIChyZXN1bHRzICYmIHJlc3VsdHMubGVuZ3RoID4gMSkgPyByZXN1bHRzWzFdLnRyaW0oKSA6IFwiXCI7XG4gIH1cbiAgZWxzZSBpZiAoZm4ucHJvdG90eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gZm4uY29uc3RydWN0b3IubmFtZTtcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gZm4ucHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cbn1cbmZ1bmN0aW9uIHBhcnNlVmFsdWUoc3RyKXtcbiAgaWYgKCd0cnVlJyA9PT0gc3RyKSByZXR1cm4gdHJ1ZTtcbiAgZWxzZSBpZiAoJ2ZhbHNlJyA9PT0gc3RyKSByZXR1cm4gZmFsc2U7XG4gIGVsc2UgaWYgKCFpc05hTihzdHIgKiAxKSkgcmV0dXJuIHBhcnNlRmxvYXQoc3RyKTtcbiAgcmV0dXJuIHN0cjtcbn1cbi8vIENvbnZlcnQgUGFzY2FsQ2FzZSB0byBrZWJhYi1jYXNlXG4vLyBUaGFuayB5b3U6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzg5NTU1ODBcbmZ1bmN0aW9uIGh5cGhlbmF0ZShzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xufVxuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbkZvdW5kYXRpb24uQm94ID0ge1xuICBJbU5vdFRvdWNoaW5nWW91OiBJbU5vdFRvdWNoaW5nWW91LFxuICBHZXREaW1lbnNpb25zOiBHZXREaW1lbnNpb25zLFxuICBHZXRPZmZzZXRzOiBHZXRPZmZzZXRzXG59XG5cbi8qKlxuICogQ29tcGFyZXMgdGhlIGRpbWVuc2lvbnMgb2YgYW4gZWxlbWVudCB0byBhIGNvbnRhaW5lciBhbmQgZGV0ZXJtaW5lcyBjb2xsaXNpb24gZXZlbnRzIHdpdGggY29udGFpbmVyLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gdGVzdCBmb3IgY29sbGlzaW9ucy5cbiAqIEBwYXJhbSB7alF1ZXJ5fSBwYXJlbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHVzZSBhcyBib3VuZGluZyBjb250YWluZXIuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGxyT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIGxlZnQgYW5kIHJpZ2h0IHZhbHVlcyBvbmx5LlxuICogQHBhcmFtIHtCb29sZWFufSB0Yk9ubHkgLSBzZXQgdG8gdHJ1ZSB0byBjaGVjayB0b3AgYW5kIGJvdHRvbSB2YWx1ZXMgb25seS5cbiAqIEBkZWZhdWx0IGlmIG5vIHBhcmVudCBvYmplY3QgcGFzc2VkLCBkZXRlY3RzIGNvbGxpc2lvbnMgd2l0aCBgd2luZG93YC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSAtIHRydWUgaWYgY29sbGlzaW9uIGZyZWUsIGZhbHNlIGlmIGEgY29sbGlzaW9uIGluIGFueSBkaXJlY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIEltTm90VG91Y2hpbmdZb3UoZWxlbWVudCwgcGFyZW50LCBsck9ubHksIHRiT25seSkge1xuICB2YXIgZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICB0b3AsIGJvdHRvbSwgbGVmdCwgcmlnaHQ7XG5cbiAgaWYgKHBhcmVudCkge1xuICAgIHZhciBwYXJEaW1zID0gR2V0RGltZW5zaW9ucyhwYXJlbnQpO1xuXG4gICAgYm90dG9tID0gKGVsZURpbXMub2Zmc2V0LnRvcCArIGVsZURpbXMuaGVpZ2h0IDw9IHBhckRpbXMuaGVpZ2h0ICsgcGFyRGltcy5vZmZzZXQudG9wKTtcbiAgICB0b3AgICAgPSAoZWxlRGltcy5vZmZzZXQudG9wID49IHBhckRpbXMub2Zmc2V0LnRvcCk7XG4gICAgbGVmdCAgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgPj0gcGFyRGltcy5vZmZzZXQubGVmdCk7XG4gICAgcmlnaHQgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IHBhckRpbXMud2lkdGggKyBwYXJEaW1zLm9mZnNldC5sZWZ0KTtcbiAgfVxuICBlbHNlIHtcbiAgICBib3R0b20gPSAoZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gZWxlRGltcy53aW5kb3dEaW1zLmhlaWdodCArIGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wKTtcbiAgICB0b3AgICAgPSAoZWxlRGltcy5vZmZzZXQudG9wID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wKTtcbiAgICBsZWZ0ICAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCA+PSBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQpO1xuICAgIHJpZ2h0ICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ICsgZWxlRGltcy53aWR0aCA8PSBlbGVEaW1zLndpbmRvd0RpbXMud2lkdGgpO1xuICB9XG5cbiAgdmFyIGFsbERpcnMgPSBbYm90dG9tLCB0b3AsIGxlZnQsIHJpZ2h0XTtcblxuICBpZiAobHJPbmx5KSB7XG4gICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0ID09PSB0cnVlO1xuICB9XG5cbiAgaWYgKHRiT25seSkge1xuICAgIHJldHVybiB0b3AgPT09IGJvdHRvbSA9PT0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBhbGxEaXJzLmluZGV4T2YoZmFsc2UpID09PSAtMTtcbn07XG5cbi8qKlxuICogVXNlcyBuYXRpdmUgbWV0aG9kcyB0byByZXR1cm4gYW4gb2JqZWN0IG9mIGRpbWVuc2lvbiB2YWx1ZXMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5IHx8IEhUTUx9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IG9yIERPTSBlbGVtZW50IGZvciB3aGljaCB0byBnZXQgdGhlIGRpbWVuc2lvbnMuIENhbiBiZSBhbnkgZWxlbWVudCBvdGhlciB0aGF0IGRvY3VtZW50IG9yIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IC0gbmVzdGVkIG9iamVjdCBvZiBpbnRlZ2VyIHBpeGVsIHZhbHVlc1xuICogVE9ETyAtIGlmIGVsZW1lbnQgaXMgd2luZG93LCByZXR1cm4gb25seSB0aG9zZSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIEdldERpbWVuc2lvbnMoZWxlbSwgdGVzdCl7XG4gIGVsZW0gPSBlbGVtLmxlbmd0aCA/IGVsZW1bMF0gOiBlbGVtO1xuXG4gIGlmIChlbGVtID09PSB3aW5kb3cgfHwgZWxlbSA9PT0gZG9jdW1lbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJJ20gc29ycnksIERhdmUuIEknbSBhZnJhaWQgSSBjYW4ndCBkbyB0aGF0LlwiKTtcbiAgfVxuXG4gIHZhciByZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHBhclJlY3QgPSBlbGVtLnBhcmVudE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICB3aW5SZWN0ID0gZG9jdW1lbnQuYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHdpblkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG4gICAgICB3aW5YID0gd2luZG93LnBhZ2VYT2Zmc2V0O1xuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHJlY3Qud2lkdGgsXG4gICAgaGVpZ2h0OiByZWN0LmhlaWdodCxcbiAgICBvZmZzZXQ6IHtcbiAgICAgIHRvcDogcmVjdC50b3AgKyB3aW5ZLFxuICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgd2luWFxuICAgIH0sXG4gICAgcGFyZW50RGltczoge1xuICAgICAgd2lkdGg6IHBhclJlY3Qud2lkdGgsXG4gICAgICBoZWlnaHQ6IHBhclJlY3QuaGVpZ2h0LFxuICAgICAgb2Zmc2V0OiB7XG4gICAgICAgIHRvcDogcGFyUmVjdC50b3AgKyB3aW5ZLFxuICAgICAgICBsZWZ0OiBwYXJSZWN0LmxlZnQgKyB3aW5YXG4gICAgICB9XG4gICAgfSxcbiAgICB3aW5kb3dEaW1zOiB7XG4gICAgICB3aWR0aDogd2luUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogd2luUmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiB3aW5ZLFxuICAgICAgICBsZWZ0OiB3aW5YXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3Qgb2YgdG9wIGFuZCBsZWZ0IGludGVnZXIgcGl4ZWwgdmFsdWVzIGZvciBkeW5hbWljYWxseSByZW5kZXJlZCBlbGVtZW50cyxcbiAqIHN1Y2ggYXM6IFRvb2x0aXAsIFJldmVhbCwgYW5kIERyb3Bkb3duXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCBmb3IgdGhlIGVsZW1lbnQgYmVpbmcgcG9zaXRpb25lZC5cbiAqIEBwYXJhbSB7alF1ZXJ5fSBhbmNob3IgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCdzIGFuY2hvciBwb2ludC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBwb3NpdGlvbiAtIGEgc3RyaW5nIHJlbGF0aW5nIHRvIHRoZSBkZXNpcmVkIHBvc2l0aW9uIG9mIHRoZSBlbGVtZW50LCByZWxhdGl2ZSB0byBpdCdzIGFuY2hvclxuICogQHBhcmFtIHtOdW1iZXJ9IHZPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgdmVydGljYWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAqIEBwYXJhbSB7TnVtYmVyfSBoT2Zmc2V0IC0gaW50ZWdlciBwaXhlbCB2YWx1ZSBvZiBkZXNpcmVkIGhvcml6b250YWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNPdmVyZmxvdyAtIGlmIGEgY29sbGlzaW9uIGV2ZW50IGlzIGRldGVjdGVkLCBzZXRzIHRvIHRydWUgdG8gZGVmYXVsdCB0aGUgZWxlbWVudCB0byBmdWxsIHdpZHRoIC0gYW55IGRlc2lyZWQgb2Zmc2V0LlxuICogVE9ETyBhbHRlci9yZXdyaXRlIHRvIHdvcmsgd2l0aCBgZW1gIHZhbHVlcyBhcyB3ZWxsL2luc3RlYWQgb2YgcGl4ZWxzXG4gKi9cbmZ1bmN0aW9uIEdldE9mZnNldHMoZWxlbWVudCwgYW5jaG9yLCBwb3NpdGlvbiwgdk9mZnNldCwgaE9mZnNldCwgaXNPdmVyZmxvdykge1xuICB2YXIgJGVsZURpbXMgPSBHZXREaW1lbnNpb25zKGVsZW1lbnQpLFxuICAgICAgJGFuY2hvckRpbXMgPSBhbmNob3IgPyBHZXREaW1lbnNpb25zKGFuY2hvcikgOiBudWxsO1xuXG4gIHN3aXRjaCAocG9zaXRpb24pIHtcbiAgICBjYXNlICd0b3AnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKEZvdW5kYXRpb24ucnRsKCkgPyAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICgkZWxlRGltcy53aWR0aCArIGhPZmZzZXQpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0LFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciB0b3AnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgKCRhbmNob3JEaW1zLndpZHRoIC8gMikpIC0gKCRlbGVEaW1zLndpZHRoIC8gMiksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiBpc092ZXJmbG93ID8gaE9mZnNldCA6ICgoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciBsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogKCRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAoJGFuY2hvckRpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgcmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQgKyAxLFxuICAgICAgICB0b3A6ICgkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgKCRhbmNob3JEaW1zLmhlaWdodCAvIDIpKSAtICgkZWxlRGltcy5oZWlnaHQgLyAyKVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICgkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0ICsgKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcbiAgICAgICAgdG9wOiAoJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgKCRlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZXZlYWwnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLSAkZWxlRGltcy53aWR0aCkgLyAyLFxuICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCArIHZPZmZzZXRcbiAgICAgIH1cbiAgICBjYXNlICdyZXZlYWwgZnVsbCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0LFxuICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGVmdCBib3R0b20nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH07XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyaWdodCBib3R0b20nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQgLSAkZWxlRGltcy53aWR0aCxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH1cbiAgfVxufVxuXG59KGpRdWVyeSk7XG4iLCIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqIFRoaXMgdXRpbCB3YXMgY3JlYXRlZCBieSBNYXJpdXMgT2xiZXJ0eiAqXG4gKiBQbGVhc2UgdGhhbmsgTWFyaXVzIG9uIEdpdEh1YiAvb3dsYmVydHogKlxuICogb3IgdGhlIHdlYiBodHRwOi8vd3d3Lm1hcml1c29sYmVydHouZGUvICpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4ndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IGtleUNvZGVzID0ge1xuICA5OiAnVEFCJyxcbiAgMTM6ICdFTlRFUicsXG4gIDI3OiAnRVNDQVBFJyxcbiAgMzI6ICdTUEFDRScsXG4gIDM3OiAnQVJST1dfTEVGVCcsXG4gIDM4OiAnQVJST1dfVVAnLFxuICAzOTogJ0FSUk9XX1JJR0hUJyxcbiAgNDA6ICdBUlJPV19ET1dOJ1xufVxuXG52YXIgY29tbWFuZHMgPSB7fVxuXG52YXIgS2V5Ym9hcmQgPSB7XG4gIGtleXM6IGdldEtleUNvZGVzKGtleUNvZGVzKSxcblxuICAvKipcbiAgICogUGFyc2VzIHRoZSAoa2V5Ym9hcmQpIGV2ZW50IGFuZCByZXR1cm5zIGEgU3RyaW5nIHRoYXQgcmVwcmVzZW50cyBpdHMga2V5XG4gICAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICogQHJldHVybiBTdHJpbmcga2V5IC0gU3RyaW5nIHRoYXQgcmVwcmVzZW50cyB0aGUga2V5IHByZXNzZWRcbiAgICovXG4gIHBhcnNlS2V5KGV2ZW50KSB7XG4gICAgdmFyIGtleSA9IGtleUNvZGVzW2V2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGVdIHx8IFN0cmluZy5mcm9tQ2hhckNvZGUoZXZlbnQud2hpY2gpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAvLyBSZW1vdmUgdW4tcHJpbnRhYmxlIGNoYXJhY3RlcnMsIGUuZy4gZm9yIGBmcm9tQ2hhckNvZGVgIGNhbGxzIGZvciBDVFJMIG9ubHkgZXZlbnRzXG4gICAga2V5ID0ga2V5LnJlcGxhY2UoL1xcVysvLCAnJyk7XG5cbiAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIGtleSA9IGBTSElGVF8ke2tleX1gO1xuICAgIGlmIChldmVudC5jdHJsS2V5KSBrZXkgPSBgQ1RSTF8ke2tleX1gO1xuICAgIGlmIChldmVudC5hbHRLZXkpIGtleSA9IGBBTFRfJHtrZXl9YDtcblxuICAgIC8vIFJlbW92ZSB0cmFpbGluZyB1bmRlcnNjb3JlLCBpbiBjYXNlIG9ubHkgbW9kaWZpZXJzIHdlcmUgdXNlZCAoZS5nLiBvbmx5IGBDVFJMX0FMVGApXG4gICAga2V5ID0ga2V5LnJlcGxhY2UoL18kLywgJycpO1xuXG4gICAgcmV0dXJuIGtleTtcbiAgfSxcblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgZ2l2ZW4gKGtleWJvYXJkKSBldmVudFxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50J3MgbmFtZSwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAqIEBwYXJhbSB7T2JqZWN0c30gZnVuY3Rpb25zIC0gY29sbGVjdGlvbiBvZiBmdW5jdGlvbnMgdGhhdCBhcmUgdG8gYmUgZXhlY3V0ZWRcbiAgICovXG4gIGhhbmRsZUtleShldmVudCwgY29tcG9uZW50LCBmdW5jdGlvbnMpIHtcbiAgICB2YXIgY29tbWFuZExpc3QgPSBjb21tYW5kc1tjb21wb25lbnRdLFxuICAgICAga2V5Q29kZSA9IHRoaXMucGFyc2VLZXkoZXZlbnQpLFxuICAgICAgY21kcyxcbiAgICAgIGNvbW1hbmQsXG4gICAgICBmbjtcblxuICAgIGlmICghY29tbWFuZExpc3QpIHJldHVybiBjb25zb2xlLndhcm4oJ0NvbXBvbmVudCBub3QgZGVmaW5lZCEnKTtcblxuICAgIGlmICh0eXBlb2YgY29tbWFuZExpc3QubHRyID09PSAndW5kZWZpbmVkJykgeyAvLyB0aGlzIGNvbXBvbmVudCBkb2VzIG5vdCBkaWZmZXJlbnRpYXRlIGJldHdlZW4gbHRyIGFuZCBydGxcbiAgICAgICAgY21kcyA9IGNvbW1hbmRMaXN0OyAvLyB1c2UgcGxhaW4gbGlzdFxuICAgIH0gZWxzZSB7IC8vIG1lcmdlIGx0ciBhbmQgcnRsOiBpZiBkb2N1bWVudCBpcyBydGwsIHJ0bCBvdmVyd3JpdGVzIGx0ciBhbmQgdmljZSB2ZXJzYVxuICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5sdHIsIGNvbW1hbmRMaXN0LnJ0bCk7XG5cbiAgICAgICAgZWxzZSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0LnJ0bCwgY29tbWFuZExpc3QubHRyKTtcbiAgICB9XG4gICAgY29tbWFuZCA9IGNtZHNba2V5Q29kZV07XG5cbiAgICBmbiA9IGZ1bmN0aW9uc1tjb21tYW5kXTtcbiAgICBpZiAoZm4gJiYgdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gIGlmIGV4aXN0c1xuICAgICAgdmFyIHJldHVyblZhbHVlID0gZm4uYXBwbHkoKTtcbiAgICAgIGlmIChmdW5jdGlvbnMuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiB3aGVuIGV2ZW50IHdhcyBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLmhhbmRsZWQocmV0dXJuVmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZnVuY3Rpb25zLnVuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLnVuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIG5vdCBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLnVuaGFuZGxlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRmluZHMgYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gdGhlIGdpdmVuIGAkZWxlbWVudGBcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBzZWFyY2ggd2l0aGluXG4gICAqIEByZXR1cm4ge2pRdWVyeX0gJGZvY3VzYWJsZSAtIGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIGAkZWxlbWVudGBcbiAgICovXG4gIGZpbmRGb2N1c2FibGUoJGVsZW1lbnQpIHtcbiAgICBpZighJGVsZW1lbnQpIHtyZXR1cm4gZmFsc2U7IH1cbiAgICByZXR1cm4gJGVsZW1lbnQuZmluZCgnYVtocmVmXSwgYXJlYVtocmVmXSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzZWxlY3Q6bm90KFtkaXNhYmxlZF0pLCB0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSksIGJ1dHRvbjpub3QoW2Rpc2FibGVkXSksIGlmcmFtZSwgb2JqZWN0LCBlbWJlZCwgKlt0YWJpbmRleF0sICpbY29udGVudGVkaXRhYmxlXScpLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgIGlmICghJCh0aGlzKS5pcygnOnZpc2libGUnKSB8fCAkKHRoaXMpLmF0dHIoJ3RhYmluZGV4JykgPCAwKSB7IHJldHVybiBmYWxzZTsgfSAvL29ubHkgaGF2ZSB2aXNpYmxlIGVsZW1lbnRzIGFuZCB0aG9zZSB0aGF0IGhhdmUgYSB0YWJpbmRleCBncmVhdGVyIG9yIGVxdWFsIDBcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjb21wb25lbnQgbmFtZSBuYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAqIEByZXR1cm4gU3RyaW5nIGNvbXBvbmVudE5hbWVcbiAgICovXG5cbiAgcmVnaXN0ZXIoY29tcG9uZW50TmFtZSwgY21kcykge1xuICAgIGNvbW1hbmRzW2NvbXBvbmVudE5hbWVdID0gY21kcztcbiAgfSwgIFxuXG4gIC8qKlxuICAgKiBUcmFwcyB0aGUgZm9jdXMgaW4gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqIEBwYXJhbSAge2pRdWVyeX0gJGVsZW1lbnQgIGpRdWVyeSBvYmplY3QgdG8gdHJhcCB0aGUgZm91Y3MgaW50by5cbiAgICovXG4gIHRyYXBGb2N1cygkZWxlbWVudCkge1xuICAgIHZhciAkZm9jdXNhYmxlID0gRm91bmRhdGlvbi5LZXlib2FyZC5maW5kRm9jdXNhYmxlKCRlbGVtZW50KSxcbiAgICAgICAgJGZpcnN0Rm9jdXNhYmxlID0gJGZvY3VzYWJsZS5lcSgwKSxcbiAgICAgICAgJGxhc3RGb2N1c2FibGUgPSAkZm9jdXNhYmxlLmVxKC0xKTtcblxuICAgICRlbGVtZW50Lm9uKCdrZXlkb3duLnpmLnRyYXBmb2N1cycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSAkbGFzdEZvY3VzYWJsZVswXSAmJiBGb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGV2ZW50KSA9PT0gJ1RBQicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJGZpcnN0Rm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChldmVudC50YXJnZXQgPT09ICRmaXJzdEZvY3VzYWJsZVswXSAmJiBGb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGV2ZW50KSA9PT0gJ1NISUZUX1RBQicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJGxhc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgLyoqXG4gICAqIFJlbGVhc2VzIHRoZSB0cmFwcGVkIGZvY3VzIGZyb20gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqIEBwYXJhbSAge2pRdWVyeX0gJGVsZW1lbnQgIGpRdWVyeSBvYmplY3QgdG8gcmVsZWFzZSB0aGUgZm9jdXMgZm9yLlxuICAgKi9cbiAgcmVsZWFzZUZvY3VzKCRlbGVtZW50KSB7XG4gICAgJGVsZW1lbnQub2ZmKCdrZXlkb3duLnpmLnRyYXBmb2N1cycpO1xuICB9XG59XG5cbi8qXG4gKiBDb25zdGFudHMgZm9yIGVhc2llciBjb21wYXJpbmcuXG4gKiBDYW4gYmUgdXNlZCBsaWtlIEZvdW5kYXRpb24ucGFyc2VLZXkoZXZlbnQpID09PSBGb3VuZGF0aW9uLmtleXMuU1BBQ0VcbiAqL1xuZnVuY3Rpb24gZ2V0S2V5Q29kZXMoa2NzKSB7XG4gIHZhciBrID0ge307XG4gIGZvciAodmFyIGtjIGluIGtjcykga1trY3Nba2NdXSA9IGtjc1trY107XG4gIHJldHVybiBrO1xufVxuXG5Gb3VuZGF0aW9uLktleWJvYXJkID0gS2V5Ym9hcmQ7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLy8gRGVmYXVsdCBzZXQgb2YgbWVkaWEgcXVlcmllc1xuY29uc3QgZGVmYXVsdFF1ZXJpZXMgPSB7XG4gICdkZWZhdWx0JyA6ICdvbmx5IHNjcmVlbicsXG4gIGxhbmRzY2FwZSA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcbiAgcG9ydHJhaXQgOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcbiAgcmV0aW5hIDogJ29ubHkgc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKC1vLW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIvMSksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDJkcHB4KSdcbn07XG5cbnZhciBNZWRpYVF1ZXJ5ID0ge1xuICBxdWVyaWVzOiBbXSxcblxuICBjdXJyZW50OiAnJyxcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1lZGlhIHF1ZXJ5IGhlbHBlciwgYnkgZXh0cmFjdGluZyB0aGUgYnJlYWtwb2ludCBsaXN0IGZyb20gdGhlIENTUyBhbmQgYWN0aXZhdGluZyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZXh0cmFjdGVkU3R5bGVzID0gJCgnLmZvdW5kYXRpb24tbXEnKS5jc3MoJ2ZvbnQtZmFtaWx5Jyk7XG4gICAgdmFyIG5hbWVkUXVlcmllcztcblxuICAgIG5hbWVkUXVlcmllcyA9IHBhcnNlU3R5bGVUb09iamVjdChleHRyYWN0ZWRTdHlsZXMpO1xuXG4gICAgZm9yICh2YXIga2V5IGluIG5hbWVkUXVlcmllcykge1xuICAgICAgaWYobmFtZWRRdWVyaWVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgc2VsZi5xdWVyaWVzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgICB2YWx1ZTogYG9ubHkgc2NyZWVuIGFuZCAobWluLXdpZHRoOiAke25hbWVkUXVlcmllc1trZXldfSlgXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY3VycmVudCA9IHRoaXMuX2dldEN1cnJlbnRTaXplKCk7XG5cbiAgICB0aGlzLl93YXRjaGVyKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIGlzIGF0IGxlYXN0IGFzIHdpZGUgYXMgYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBicmVha3BvaW50IG1hdGNoZXMsIGBmYWxzZWAgaWYgaXQncyBzbWFsbGVyLlxuICAgKi9cbiAgYXRMZWFzdChzaXplKSB7XG4gICAgdmFyIHF1ZXJ5ID0gdGhpcy5nZXQoc2l6ZSk7XG5cbiAgICBpZiAocXVlcnkpIHtcbiAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYShxdWVyeSkubWF0Y2hlcztcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIG1hdGNoZXMgdG8gYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLCBlaXRoZXIgJ3NtYWxsIG9ubHknIG9yICdzbWFsbCcuIE9taXR0aW5nICdvbmx5JyBmYWxscyBiYWNrIHRvIHVzaW5nIGF0TGVhc3QoKSBtZXRob2QuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCBkb2VzIG5vdC5cbiAgICovXG4gIGlzKHNpemUpIHtcbiAgICBzaXplID0gc2l6ZS50cmltKCkuc3BsaXQoJyAnKTtcbiAgICBpZihzaXplLmxlbmd0aCA+IDEgJiYgc2l6ZVsxXSA9PT0gJ29ubHknKSB7XG4gICAgICBpZihzaXplWzBdID09PSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuYXRMZWFzdChzaXplWzBdKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtZWRpYSBxdWVyeSBvZiBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gZ2V0LlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfG51bGx9IC0gVGhlIG1lZGlhIHF1ZXJ5IG9mIHRoZSBicmVha3BvaW50LCBvciBgbnVsbGAgaWYgdGhlIGJyZWFrcG9pbnQgZG9lc24ndCBleGlzdC5cbiAgICovXG4gIGdldChzaXplKSB7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnF1ZXJpZXMpIHtcbiAgICAgIGlmKHRoaXMucXVlcmllcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICAgIGlmIChzaXplID09PSBxdWVyeS5uYW1lKSByZXR1cm4gcXVlcnkudmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGN1cnJlbnQgYnJlYWtwb2ludCBuYW1lIGJ5IHRlc3RpbmcgZXZlcnkgYnJlYWtwb2ludCBhbmQgcmV0dXJuaW5nIHRoZSBsYXN0IG9uZSB0byBtYXRjaCAodGhlIGJpZ2dlc3Qgb25lKS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IE5hbWUgb2YgdGhlIGN1cnJlbnQgYnJlYWtwb2ludC5cbiAgICovXG4gIF9nZXRDdXJyZW50U2l6ZSgpIHtcbiAgICB2YXIgbWF0Y2hlZDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG5cbiAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShxdWVyeS52YWx1ZSkubWF0Y2hlcykge1xuICAgICAgICBtYXRjaGVkID0gcXVlcnk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBtYXRjaGVkID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIG1hdGNoZWQubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1hdGNoZWQ7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBBY3RpdmF0ZXMgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlciwgd2hpY2ggZmlyZXMgYW4gZXZlbnQgb24gdGhlIHdpbmRvdyB3aGVuZXZlciB0aGUgYnJlYWtwb2ludCBjaGFuZ2VzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF93YXRjaGVyKCkge1xuICAgICQod2luZG93KS5vbigncmVzaXplLnpmLm1lZGlhcXVlcnknLCAoKSA9PiB7XG4gICAgICB2YXIgbmV3U2l6ZSA9IHRoaXMuX2dldEN1cnJlbnRTaXplKCksIGN1cnJlbnRTaXplID0gdGhpcy5jdXJyZW50O1xuXG4gICAgICBpZiAobmV3U2l6ZSAhPT0gY3VycmVudFNpemUpIHtcbiAgICAgICAgLy8gQ2hhbmdlIHRoZSBjdXJyZW50IG1lZGlhIHF1ZXJ5XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG5ld1NpemU7XG5cbiAgICAgICAgLy8gQnJvYWRjYXN0IHRoZSBtZWRpYSBxdWVyeSBjaGFuZ2Ugb24gdGhlIHdpbmRvd1xuICAgICAgICAkKHdpbmRvdykudHJpZ2dlcignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgW25ld1NpemUsIGN1cnJlbnRTaXplXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbkZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbi8vIG1hdGNoTWVkaWEoKSBwb2x5ZmlsbCAtIFRlc3QgYSBDU1MgbWVkaWEgdHlwZS9xdWVyeSBpbiBKUy5cbi8vIEF1dGhvcnMgJiBjb3B5cmlnaHQgKGMpIDIwMTI6IFNjb3R0IEplaGwsIFBhdWwgSXJpc2gsIE5pY2hvbGFzIFpha2FzLCBEYXZpZCBLbmlnaHQuIER1YWwgTUlUL0JTRCBsaWNlbnNlXG53aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgPSBmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIEZvciBicm93c2VycyB0aGF0IHN1cHBvcnQgbWF0Y2hNZWRpdW0gYXBpIHN1Y2ggYXMgSUUgOSBhbmQgd2Via2l0XG4gIHZhciBzdHlsZU1lZGlhID0gKHdpbmRvdy5zdHlsZU1lZGlhIHx8IHdpbmRvdy5tZWRpYSk7XG5cbiAgLy8gRm9yIHRob3NlIHRoYXQgZG9uJ3Qgc3VwcG9ydCBtYXRjaE1lZGl1bVxuICBpZiAoIXN0eWxlTWVkaWEpIHtcbiAgICB2YXIgc3R5bGUgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgc2NyaXB0ICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF0sXG4gICAgaW5mbyAgICAgICAgPSBudWxsO1xuXG4gICAgc3R5bGUudHlwZSAgPSAndGV4dC9jc3MnO1xuICAgIHN0eWxlLmlkICAgID0gJ21hdGNobWVkaWFqcy10ZXN0JztcblxuICAgIHNjcmlwdCAmJiBzY3JpcHQucGFyZW50Tm9kZSAmJiBzY3JpcHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc3R5bGUsIHNjcmlwdCk7XG5cbiAgICAvLyAnc3R5bGUuY3VycmVudFN0eWxlJyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICd3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZScgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgIGluZm8gPSAoJ2dldENvbXB1dGVkU3R5bGUnIGluIHdpbmRvdykgJiYgd2luZG93LmdldENvbXB1dGVkU3R5bGUoc3R5bGUsIG51bGwpIHx8IHN0eWxlLmN1cnJlbnRTdHlsZTtcblxuICAgIHN0eWxlTWVkaWEgPSB7XG4gICAgICBtYXRjaE1lZGl1bShtZWRpYSkge1xuICAgICAgICB2YXIgdGV4dCA9IGBAbWVkaWEgJHttZWRpYX17ICNtYXRjaG1lZGlhanMtdGVzdCB7IHdpZHRoOiAxcHg7IH0gfWA7XG5cbiAgICAgICAgLy8gJ3N0eWxlLnN0eWxlU2hlZXQnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3N0eWxlLnRleHRDb250ZW50JyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gdGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUZXN0IGlmIG1lZGlhIHF1ZXJ5IGlzIHRydWUgb3IgZmFsc2VcbiAgICAgICAgcmV0dXJuIGluZm8ud2lkdGggPT09ICcxcHgnO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihtZWRpYSkge1xuICAgIHJldHVybiB7XG4gICAgICBtYXRjaGVzOiBzdHlsZU1lZGlhLm1hdGNoTWVkaXVtKG1lZGlhIHx8ICdhbGwnKSxcbiAgICAgIG1lZGlhOiBtZWRpYSB8fCAnYWxsJ1xuICAgIH07XG4gIH1cbn0oKSk7XG5cbi8vIFRoYW5rIHlvdTogaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9xdWVyeS1zdHJpbmdcbmZ1bmN0aW9uIHBhcnNlU3R5bGVUb09iamVjdChzdHIpIHtcbiAgdmFyIHN0eWxlT2JqZWN0ID0ge307XG5cbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3RyID0gc3RyLnRyaW0oKS5zbGljZSgxLCAtMSk7IC8vIGJyb3dzZXJzIHJlLXF1b3RlIHN0cmluZyBzdHlsZSB2YWx1ZXNcblxuICBpZiAoIXN0cikge1xuICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgfVxuXG4gIHN0eWxlT2JqZWN0ID0gc3RyLnNwbGl0KCcmJykucmVkdWNlKGZ1bmN0aW9uKHJldCwgcGFyYW0pIHtcbiAgICB2YXIgcGFydHMgPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuICAgIHZhciBrZXkgPSBwYXJ0c1swXTtcbiAgICB2YXIgdmFsID0gcGFydHNbMV07XG4gICAga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cbiAgICAvLyBtaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuICAgIC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcbiAgICB2YWwgPSB2YWwgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGVVUklDb21wb25lbnQodmFsKTtcblxuICAgIGlmICghcmV0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldFtrZXldID0gdmFsO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHtcbiAgICAgIHJldFtrZXldLnB1c2godmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0W2tleV0gPSBbcmV0W2tleV0sIHZhbF07XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH0sIHt9KTtcblxuICByZXR1cm4gc3R5bGVPYmplY3Q7XG59XG5cbkZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBNb3Rpb24gbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLm1vdGlvblxuICovXG5cbmNvbnN0IGluaXRDbGFzc2VzICAgPSBbJ211aS1lbnRlcicsICdtdWktbGVhdmUnXTtcbmNvbnN0IGFjdGl2ZUNsYXNzZXMgPSBbJ211aS1lbnRlci1hY3RpdmUnLCAnbXVpLWxlYXZlLWFjdGl2ZSddO1xuXG5jb25zdCBNb3Rpb24gPSB7XG4gIGFuaW1hdGVJbjogZnVuY3Rpb24oZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgIGFuaW1hdGUodHJ1ZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gIH0sXG5cbiAgYW5pbWF0ZU91dDogZnVuY3Rpb24oZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgIGFuaW1hdGUoZmFsc2UsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIE1vdmUoZHVyYXRpb24sIGVsZW0sIGZuKXtcbiAgdmFyIGFuaW0sIHByb2csIHN0YXJ0ID0gbnVsbDtcbiAgLy8gY29uc29sZS5sb2coJ2NhbGxlZCcpO1xuXG4gIGlmIChkdXJhdGlvbiA9PT0gMCkge1xuICAgIGZuLmFwcGx5KGVsZW0pO1xuICAgIGVsZW0udHJpZ2dlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSkudHJpZ2dlckhhbmRsZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1vdmUodHMpe1xuICAgIGlmKCFzdGFydCkgc3RhcnQgPSB0cztcbiAgICAvLyBjb25zb2xlLmxvZyhzdGFydCwgdHMpO1xuICAgIHByb2cgPSB0cyAtIHN0YXJ0O1xuICAgIGZuLmFwcGx5KGVsZW0pO1xuXG4gICAgaWYocHJvZyA8IGR1cmF0aW9uKXsgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSwgZWxlbSk7IH1cbiAgICBlbHNle1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW0pO1xuICAgICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgfVxuICB9XG4gIGFuaW0gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmUpO1xufVxuXG4vKipcbiAqIEFuaW1hdGVzIGFuIGVsZW1lbnQgaW4gb3Igb3V0IHVzaW5nIGEgQ1NTIHRyYW5zaXRpb24gY2xhc3MuXG4gKiBAZnVuY3Rpb25cbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzSW4gLSBEZWZpbmVzIGlmIHRoZSBhbmltYXRpb24gaXMgaW4gb3Igb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb3IgSFRNTCBvYmplY3QgdG8gYW5pbWF0ZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBhbmltYXRpb24gLSBDU1MgY2xhc3MgdG8gdXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBDYWxsYmFjayB0byBydW4gd2hlbiBhbmltYXRpb24gaXMgZmluaXNoZWQuXG4gKi9cbmZ1bmN0aW9uIGFuaW1hdGUoaXNJbiwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICBlbGVtZW50ID0gJChlbGVtZW50KS5lcSgwKTtcblxuICBpZiAoIWVsZW1lbnQubGVuZ3RoKSByZXR1cm47XG5cbiAgdmFyIGluaXRDbGFzcyA9IGlzSW4gPyBpbml0Q2xhc3Nlc1swXSA6IGluaXRDbGFzc2VzWzFdO1xuICB2YXIgYWN0aXZlQ2xhc3MgPSBpc0luID8gYWN0aXZlQ2xhc3Nlc1swXSA6IGFjdGl2ZUNsYXNzZXNbMV07XG5cbiAgLy8gU2V0IHVwIHRoZSBhbmltYXRpb25cbiAgcmVzZXQoKTtcblxuICBlbGVtZW50XG4gICAgLmFkZENsYXNzKGFuaW1hdGlvbilcbiAgICAuY3NzKCd0cmFuc2l0aW9uJywgJ25vbmUnKTtcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGVsZW1lbnQuYWRkQ2xhc3MoaW5pdENsYXNzKTtcbiAgICBpZiAoaXNJbikgZWxlbWVudC5zaG93KCk7XG4gIH0pO1xuXG4gIC8vIFN0YXJ0IHRoZSBhbmltYXRpb25cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBlbGVtZW50WzBdLm9mZnNldFdpZHRoO1xuICAgIGVsZW1lbnRcbiAgICAgIC5jc3MoJ3RyYW5zaXRpb24nLCAnJylcbiAgICAgIC5hZGRDbGFzcyhhY3RpdmVDbGFzcyk7XG4gIH0pO1xuXG4gIC8vIENsZWFuIHVwIHRoZSBhbmltYXRpb24gd2hlbiBpdCBmaW5pc2hlc1xuICBlbGVtZW50Lm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoZWxlbWVudCksIGZpbmlzaCk7XG5cbiAgLy8gSGlkZXMgdGhlIGVsZW1lbnQgKGZvciBvdXQgYW5pbWF0aW9ucyksIHJlc2V0cyB0aGUgZWxlbWVudCwgYW5kIHJ1bnMgYSBjYWxsYmFja1xuICBmdW5jdGlvbiBmaW5pc2goKSB7XG4gICAgaWYgKCFpc0luKSBlbGVtZW50LmhpZGUoKTtcbiAgICByZXNldCgpO1xuICAgIGlmIChjYikgY2IuYXBwbHkoZWxlbWVudCk7XG4gIH1cblxuICAvLyBSZXNldHMgdHJhbnNpdGlvbnMgYW5kIHJlbW92ZXMgbW90aW9uLXNwZWNpZmljIGNsYXNzZXNcbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgZWxlbWVudFswXS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAwO1xuICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoYCR7aW5pdENsYXNzfSAke2FjdGl2ZUNsYXNzfSAke2FuaW1hdGlvbn1gKTtcbiAgfVxufVxuXG5Gb3VuZGF0aW9uLk1vdmUgPSBNb3ZlO1xuRm91bmRhdGlvbi5Nb3Rpb24gPSBNb3Rpb247XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3QgTmVzdCA9IHtcbiAgRmVhdGhlcihtZW51LCB0eXBlID0gJ3pmJykge1xuICAgIG1lbnUuYXR0cigncm9sZScsICdtZW51YmFyJyk7XG5cbiAgICB2YXIgaXRlbXMgPSBtZW51LmZpbmQoJ2xpJykuYXR0cih7J3JvbGUnOiAnbWVudWl0ZW0nfSksXG4gICAgICAgIHN1Yk1lbnVDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnVgLFxuICAgICAgICBzdWJJdGVtQ2xhc3MgPSBgJHtzdWJNZW51Q2xhc3N9LWl0ZW1gLFxuICAgICAgICBoYXNTdWJDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnUtcGFyZW50YDtcblxuICAgIGl0ZW1zLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcblxuICAgICAgaWYgKCRzdWIubGVuZ3RoKSB7XG4gICAgICAgICRpdGVtXG4gICAgICAgICAgLmFkZENsYXNzKGhhc1N1YkNsYXNzKVxuICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICdhcmlhLWhhc3BvcHVwJzogdHJ1ZSxcbiAgICAgICAgICAgICdhcmlhLWxhYmVsJzogJGl0ZW0uY2hpbGRyZW4oJ2E6Zmlyc3QnKS50ZXh0KClcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBOb3RlOiAgRHJpbGxkb3ducyBiZWhhdmUgZGlmZmVyZW50bHkgaW4gaG93IHRoZXkgaGlkZSwgYW5kIHNvIG5lZWRcbiAgICAgICAgICAvLyBhZGRpdGlvbmFsIGF0dHJpYnV0ZXMuICBXZSBzaG91bGQgbG9vayBpZiB0aGlzIHBvc3NpYmx5IG92ZXItZ2VuZXJhbGl6ZWRcbiAgICAgICAgICAvLyB1dGlsaXR5IChOZXN0KSBpcyBhcHByb3ByaWF0ZSB3aGVuIHdlIHJld29yayBtZW51cyBpbiA2LjRcbiAgICAgICAgICBpZih0eXBlID09PSAnZHJpbGxkb3duJykge1xuICAgICAgICAgICAgJGl0ZW0uYXR0cih7J2FyaWEtZXhwYW5kZWQnOiBmYWxzZX0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAkc3ViXG4gICAgICAgICAgLmFkZENsYXNzKGBzdWJtZW51ICR7c3ViTWVudUNsYXNzfWApXG4gICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgJ2RhdGEtc3VibWVudSc6ICcnLFxuICAgICAgICAgICAgJ3JvbGUnOiAnbWVudSdcbiAgICAgICAgICB9KTtcbiAgICAgICAgaWYodHlwZSA9PT0gJ2RyaWxsZG93bicpIHtcbiAgICAgICAgICAkc3ViLmF0dHIoeydhcmlhLWhpZGRlbic6IHRydWV9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCkge1xuICAgICAgICAkaXRlbS5hZGRDbGFzcyhgaXMtc3VibWVudS1pdGVtICR7c3ViSXRlbUNsYXNzfWApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIEJ1cm4obWVudSwgdHlwZSkge1xuICAgIHZhciAvL2l0ZW1zID0gbWVudS5maW5kKCdsaScpLFxuICAgICAgICBzdWJNZW51Q2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51YCxcbiAgICAgICAgc3ViSXRlbUNsYXNzID0gYCR7c3ViTWVudUNsYXNzfS1pdGVtYCxcbiAgICAgICAgaGFzU3ViQ2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51LXBhcmVudGA7XG5cbiAgICBtZW51XG4gICAgICAuZmluZCgnPmxpLCAubWVudSwgLm1lbnUgPiBsaScpXG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7c3ViTWVudUNsYXNzfSAke3N1Ykl0ZW1DbGFzc30gJHtoYXNTdWJDbGFzc30gaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUgaXMtYWN0aXZlYClcbiAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKS5jc3MoJ2Rpc3BsYXknLCAnJyk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyggICAgICBtZW51LmZpbmQoJy4nICsgc3ViTWVudUNsYXNzICsgJywgLicgKyBzdWJJdGVtQ2xhc3MgKyAnLCAuaGFzLXN1Ym1lbnUsIC5pcy1zdWJtZW51LWl0ZW0sIC5zdWJtZW51LCBbZGF0YS1zdWJtZW51XScpXG4gICAgLy8gICAgICAgICAgIC5yZW1vdmVDbGFzcyhzdWJNZW51Q2xhc3MgKyAnICcgKyBzdWJJdGVtQ2xhc3MgKyAnIGhhcy1zdWJtZW51IGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51JylcbiAgICAvLyAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpKTtcbiAgICAvLyBpdGVtcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgLy8gICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgIC8vICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcbiAgICAvLyAgIGlmKCRpdGVtLnBhcmVudCgnW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpe1xuICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaXMtc3VibWVudS1pdGVtICcgKyBzdWJJdGVtQ2xhc3MpO1xuICAgIC8vICAgfVxuICAgIC8vICAgaWYoJHN1Yi5sZW5ndGgpe1xuICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaGFzLXN1Ym1lbnUnKTtcbiAgICAvLyAgICAgJHN1Yi5yZW1vdmVDbGFzcygnc3VibWVudSAnICsgc3ViTWVudUNsYXNzKS5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9KTtcbiAgfVxufVxuXG5Gb3VuZGF0aW9uLk5lc3QgPSBOZXN0O1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmZ1bmN0aW9uIFRpbWVyKGVsZW0sIG9wdGlvbnMsIGNiKSB7XG4gIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICBkdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24sLy9vcHRpb25zIGlzIGFuIG9iamVjdCBmb3IgZWFzaWx5IGFkZGluZyBmZWF0dXJlcyBsYXRlci5cbiAgICAgIG5hbWVTcGFjZSA9IE9iamVjdC5rZXlzKGVsZW0uZGF0YSgpKVswXSB8fCAndGltZXInLFxuICAgICAgcmVtYWluID0gLTEsXG4gICAgICBzdGFydCxcbiAgICAgIHRpbWVyO1xuXG4gIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcblxuICB0aGlzLnJlc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICByZW1haW4gPSAtMTtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRoaXMuc3RhcnQoKTtcbiAgfVxuXG4gIHRoaXMuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XG4gICAgLy8gaWYoIWVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICByZW1haW4gPSByZW1haW4gPD0gMCA/IGR1cmF0aW9uIDogcmVtYWluO1xuICAgIGVsZW0uZGF0YSgncGF1c2VkJywgZmFsc2UpO1xuICAgIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIGlmKG9wdGlvbnMuaW5maW5pdGUpe1xuICAgICAgICBfdGhpcy5yZXN0YXJ0KCk7Ly9yZXJ1biB0aGUgdGltZXIuXG4gICAgICB9XG4gICAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7IGNiKCk7IH1cbiAgICB9LCByZW1haW4pO1xuICAgIGVsZW0udHJpZ2dlcihgdGltZXJzdGFydC56Zi4ke25hbWVTcGFjZX1gKTtcbiAgfVxuXG4gIHRoaXMucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzUGF1c2VkID0gdHJ1ZTtcbiAgICAvL2lmKGVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICBlbGVtLmRhdGEoJ3BhdXNlZCcsIHRydWUpO1xuICAgIHZhciBlbmQgPSBEYXRlLm5vdygpO1xuICAgIHJlbWFpbiA9IHJlbWFpbiAtIChlbmQgLSBzdGFydCk7XG4gICAgZWxlbS50cmlnZ2VyKGB0aW1lcnBhdXNlZC56Zi4ke25hbWVTcGFjZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJ1bnMgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIGltYWdlcyBhcmUgZnVsbHkgbG9hZGVkLlxuICogQHBhcmFtIHtPYmplY3R9IGltYWdlcyAtIEltYWdlKHMpIHRvIGNoZWNrIGlmIGxvYWRlZC5cbiAqIEBwYXJhbSB7RnVuY30gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gaW1hZ2UgaXMgZnVsbHkgbG9hZGVkLlxuICovXG5mdW5jdGlvbiBvbkltYWdlc0xvYWRlZChpbWFnZXMsIGNhbGxiYWNrKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgdW5sb2FkZWQgPSBpbWFnZXMubGVuZ3RoO1xuXG4gIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cblxuICBpbWFnZXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAvLyBDaGVjayBpZiBpbWFnZSBpcyBsb2FkZWRcbiAgICBpZiAodGhpcy5jb21wbGV0ZSB8fCAodGhpcy5yZWFkeVN0YXRlID09PSA0KSB8fCAodGhpcy5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSkge1xuICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICB9XG4gICAgLy8gRm9yY2UgbG9hZCB0aGUgaW1hZ2VcbiAgICBlbHNlIHtcbiAgICAgIC8vIGZpeCBmb3IgSUUuIFNlZSBodHRwczovL2Nzcy10cmlja3MuY29tL3NuaXBwZXRzL2pxdWVyeS9maXhpbmctbG9hZC1pbi1pZS1mb3ItY2FjaGVkLWltYWdlcy9cbiAgICAgIHZhciBzcmMgPSAkKHRoaXMpLmF0dHIoJ3NyYycpO1xuICAgICAgJCh0aGlzKS5hdHRyKCdzcmMnLCBzcmMgKyAoc3JjLmluZGV4T2YoJz8nKSA+PSAwID8gJyYnIDogJz8nKSArIChuZXcgRGF0ZSgpLmdldFRpbWUoKSkpO1xuICAgICAgJCh0aGlzKS5vbmUoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2luZ2xlSW1hZ2VMb2FkZWQoKSB7XG4gICAgdW5sb2FkZWQtLTtcbiAgICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG59XG5cbkZvdW5kYXRpb24uVGltZXIgPSBUaW1lcjtcbkZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQgPSBvbkltYWdlc0xvYWRlZDtcblxufShqUXVlcnkpO1xuIiwiLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKldvcmsgaW5zcGlyZWQgYnkgbXVsdGlwbGUganF1ZXJ5IHN3aXBlIHBsdWdpbnMqKlxuLy8qKkRvbmUgYnkgWW9oYWkgQXJhcmF0ICoqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKGZ1bmN0aW9uKCQpIHtcblxuICAkLnNwb3RTd2lwZSA9IHtcbiAgICB2ZXJzaW9uOiAnMS4wLjAnLFxuICAgIGVuYWJsZWQ6ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcbiAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2UsXG4gICAgbW92ZVRocmVzaG9sZDogNzUsXG4gICAgdGltZVRocmVzaG9sZDogMjAwXG4gIH07XG5cbiAgdmFyICAgc3RhcnRQb3NYLFxuICAgICAgICBzdGFydFBvc1ksXG4gICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgZWxhcHNlZFRpbWUsXG4gICAgICAgIGlzTW92aW5nID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gb25Ub3VjaEVuZCgpIHtcbiAgICAvLyAgYWxlcnQodGhpcyk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQpO1xuICAgIGlzTW92aW5nID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBvblRvdWNoTW92ZShlKSB7XG4gICAgaWYgKCQuc3BvdFN3aXBlLnByZXZlbnREZWZhdWx0KSB7IGUucHJldmVudERlZmF1bHQoKTsgfVxuICAgIGlmKGlzTW92aW5nKSB7XG4gICAgICB2YXIgeCA9IGUudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgIHZhciB5ID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuICAgICAgdmFyIGR4ID0gc3RhcnRQb3NYIC0geDtcbiAgICAgIHZhciBkeSA9IHN0YXJ0UG9zWSAtIHk7XG4gICAgICB2YXIgZGlyO1xuICAgICAgZWxhcHNlZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0VGltZTtcbiAgICAgIGlmKE1hdGguYWJzKGR4KSA+PSAkLnNwb3RTd2lwZS5tb3ZlVGhyZXNob2xkICYmIGVsYXBzZWRUaW1lIDw9ICQuc3BvdFN3aXBlLnRpbWVUaHJlc2hvbGQpIHtcbiAgICAgICAgZGlyID0gZHggPiAwID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgICAgIH1cbiAgICAgIC8vIGVsc2UgaWYoTWF0aC5hYnMoZHkpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuICAgICAgLy8gICBkaXIgPSBkeSA+IDAgPyAnZG93bicgOiAndXAnO1xuICAgICAgLy8gfVxuICAgICAgaWYoZGlyKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgb25Ub3VjaEVuZC5jYWxsKHRoaXMpO1xuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoJ3N3aXBlJywgZGlyKS50cmlnZ2VyKGBzd2lwZSR7ZGlyfWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hTdGFydChlKSB7XG4gICAgaWYgKGUudG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgICAgc3RhcnRQb3NYID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgc3RhcnRQb3NZID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuICAgICAgaXNNb3ZpbmcgPSB0cnVlO1xuICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCBmYWxzZSk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCwgZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyICYmIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCwgZmFsc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGVhcmRvd24oKSB7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0KTtcbiAgfVxuXG4gICQuZXZlbnQuc3BlY2lhbC5zd2lwZSA9IHsgc2V0dXA6IGluaXQgfTtcblxuICAkLmVhY2goWydsZWZ0JywgJ3VwJywgJ2Rvd24nLCAncmlnaHQnXSwgZnVuY3Rpb24gKCkge1xuICAgICQuZXZlbnQuc3BlY2lhbFtgc3dpcGUke3RoaXN9YF0gPSB7IHNldHVwOiBmdW5jdGlvbigpe1xuICAgICAgJCh0aGlzKS5vbignc3dpcGUnLCAkLm5vb3ApO1xuICAgIH0gfTtcbiAgfSk7XG59KShqUXVlcnkpO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1ldGhvZCBmb3IgYWRkaW5nIHBzdWVkbyBkcmFnIGV2ZW50cyB0byBlbGVtZW50cyAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuIWZ1bmN0aW9uKCQpe1xuICAkLmZuLmFkZFRvdWNoID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSxlbCl7XG4gICAgICAkKGVsKS5iaW5kKCd0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCB0b3VjaGNhbmNlbCcsZnVuY3Rpb24oKXtcbiAgICAgICAgLy93ZSBwYXNzIHRoZSBvcmlnaW5hbCBldmVudCBvYmplY3QgYmVjYXVzZSB0aGUgalF1ZXJ5IGV2ZW50XG4gICAgICAgIC8vb2JqZWN0IGlzIG5vcm1hbGl6ZWQgdG8gdzNjIHNwZWNzIGFuZCBkb2VzIG5vdCBwcm92aWRlIHRoZSBUb3VjaExpc3RcbiAgICAgICAgaGFuZGxlVG91Y2goZXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgaGFuZGxlVG91Y2ggPSBmdW5jdGlvbihldmVudCl7XG4gICAgICB2YXIgdG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLFxuICAgICAgICAgIGZpcnN0ID0gdG91Y2hlc1swXSxcbiAgICAgICAgICBldmVudFR5cGVzID0ge1xuICAgICAgICAgICAgdG91Y2hzdGFydDogJ21vdXNlZG93bicsXG4gICAgICAgICAgICB0b3VjaG1vdmU6ICdtb3VzZW1vdmUnLFxuICAgICAgICAgICAgdG91Y2hlbmQ6ICdtb3VzZXVwJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdHlwZSA9IGV2ZW50VHlwZXNbZXZlbnQudHlwZV0sXG4gICAgICAgICAgc2ltdWxhdGVkRXZlbnRcbiAgICAgICAgO1xuXG4gICAgICBpZignTW91c2VFdmVudCcgaW4gd2luZG93ICYmIHR5cGVvZiB3aW5kb3cuTW91c2VFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzaW11bGF0ZWRFdmVudCA9IG5ldyB3aW5kb3cuTW91c2VFdmVudCh0eXBlLCB7XG4gICAgICAgICAgJ2J1YmJsZXMnOiB0cnVlLFxuICAgICAgICAgICdjYW5jZWxhYmxlJzogdHJ1ZSxcbiAgICAgICAgICAnc2NyZWVuWCc6IGZpcnN0LnNjcmVlblgsXG4gICAgICAgICAgJ3NjcmVlblknOiBmaXJzdC5zY3JlZW5ZLFxuICAgICAgICAgICdjbGllbnRYJzogZmlyc3QuY2xpZW50WCxcbiAgICAgICAgICAnY2xpZW50WSc6IGZpcnN0LmNsaWVudFlcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaW11bGF0ZWRFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50Jyk7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50LmluaXRNb3VzZUV2ZW50KHR5cGUsIHRydWUsIHRydWUsIHdpbmRvdywgMSwgZmlyc3Quc2NyZWVuWCwgZmlyc3Quc2NyZWVuWSwgZmlyc3QuY2xpZW50WCwgZmlyc3QuY2xpZW50WSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIDAvKmxlZnQqLywgbnVsbCk7XG4gICAgICB9XG4gICAgICBmaXJzdC50YXJnZXQuZGlzcGF0Y2hFdmVudChzaW11bGF0ZWRFdmVudCk7XG4gICAgfTtcbiAgfTtcbn0oalF1ZXJ5KTtcblxuXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vKipGcm9tIHRoZSBqUXVlcnkgTW9iaWxlIExpYnJhcnkqKlxuLy8qKm5lZWQgdG8gcmVjcmVhdGUgZnVuY3Rpb25hbGl0eSoqXG4vLyoqYW5kIHRyeSB0byBpbXByb3ZlIGlmIHBvc3NpYmxlKipcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4vKiBSZW1vdmluZyB0aGUgalF1ZXJ5IGZ1bmN0aW9uICoqKipcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4oZnVuY3Rpb24oICQsIHdpbmRvdywgdW5kZWZpbmVkICkge1xuXG5cdHZhciAkZG9jdW1lbnQgPSAkKCBkb2N1bWVudCApLFxuXHRcdC8vIHN1cHBvcnRUb3VjaCA9ICQubW9iaWxlLnN1cHBvcnQudG91Y2gsXG5cdFx0dG91Y2hTdGFydEV2ZW50ID0gJ3RvdWNoc3RhcnQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoc3RhcnRcIiA6IFwibW91c2Vkb3duXCIsXG5cdFx0dG91Y2hTdG9wRXZlbnQgPSAndG91Y2hlbmQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoZW5kXCIgOiBcIm1vdXNldXBcIixcblx0XHR0b3VjaE1vdmVFdmVudCA9ICd0b3VjaG1vdmUnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNobW92ZVwiIDogXCJtb3VzZW1vdmVcIjtcblxuXHQvLyBzZXR1cCBuZXcgZXZlbnQgc2hvcnRjdXRzXG5cdCQuZWFjaCggKCBcInRvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIFwiICtcblx0XHRcInN3aXBlIHN3aXBlbGVmdCBzd2lwZXJpZ2h0XCIgKS5zcGxpdCggXCIgXCIgKSwgZnVuY3Rpb24oIGksIG5hbWUgKSB7XG5cblx0XHQkLmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggZm4gKSB7XG5cdFx0XHRyZXR1cm4gZm4gPyB0aGlzLmJpbmQoIG5hbWUsIGZuICkgOiB0aGlzLnRyaWdnZXIoIG5hbWUgKTtcblx0XHR9O1xuXG5cdFx0Ly8galF1ZXJ5IDwgMS44XG5cdFx0aWYgKCAkLmF0dHJGbiApIHtcblx0XHRcdCQuYXR0ckZuWyBuYW1lIF0gPSB0cnVlO1xuXHRcdH1cblx0fSk7XG5cblx0ZnVuY3Rpb24gdHJpZ2dlckN1c3RvbUV2ZW50KCBvYmosIGV2ZW50VHlwZSwgZXZlbnQsIGJ1YmJsZSApIHtcblx0XHR2YXIgb3JpZ2luYWxUeXBlID0gZXZlbnQudHlwZTtcblx0XHRldmVudC50eXBlID0gZXZlbnRUeXBlO1xuXHRcdGlmICggYnViYmxlICkge1xuXHRcdFx0JC5ldmVudC50cmlnZ2VyKCBldmVudCwgdW5kZWZpbmVkLCBvYmogKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JC5ldmVudC5kaXNwYXRjaC5jYWxsKCBvYmosIGV2ZW50ICk7XG5cdFx0fVxuXHRcdGV2ZW50LnR5cGUgPSBvcmlnaW5hbFR5cGU7XG5cdH1cblxuXHQvLyBhbHNvIGhhbmRsZXMgdGFwaG9sZFxuXG5cdC8vIEFsc28gaGFuZGxlcyBzd2lwZWxlZnQsIHN3aXBlcmlnaHRcblx0JC5ldmVudC5zcGVjaWFsLnN3aXBlID0ge1xuXG5cdFx0Ly8gTW9yZSB0aGFuIHRoaXMgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQsIGFuZCB3ZSB3aWxsIHN1cHByZXNzIHNjcm9sbGluZy5cblx0XHRzY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkOiAzMCxcblxuXHRcdC8vIE1vcmUgdGltZSB0aGFuIHRoaXMsIGFuZCBpdCBpc24ndCBhIHN3aXBlLlxuXHRcdGR1cmF0aW9uVGhyZXNob2xkOiAxMDAwLFxuXG5cdFx0Ly8gU3dpcGUgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBtb3JlIHRoYW4gdGhpcy5cblx0XHRob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQ6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID49IDIgPyAxNSA6IDMwLFxuXG5cdFx0Ly8gU3dpcGUgdmVydGljYWwgZGlzcGxhY2VtZW50IG11c3QgYmUgbGVzcyB0aGFuIHRoaXMuXG5cdFx0dmVydGljYWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHRnZXRMb2NhdGlvbjogZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRcdHZhciB3aW5QYWdlWCA9IHdpbmRvdy5wYWdlWE9mZnNldCxcblx0XHRcdFx0d2luUGFnZVkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG5cdFx0XHRcdHggPSBldmVudC5jbGllbnRYLFxuXHRcdFx0XHR5ID0gZXZlbnQuY2xpZW50WTtcblxuXHRcdFx0aWYgKCBldmVudC5wYWdlWSA9PT0gMCAmJiBNYXRoLmZsb29yKCB5ICkgPiBNYXRoLmZsb29yKCBldmVudC5wYWdlWSApIHx8XG5cdFx0XHRcdGV2ZW50LnBhZ2VYID09PSAwICYmIE1hdGguZmxvb3IoIHggKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gaU9TNCBjbGllbnRYL2NsaWVudFkgaGF2ZSB0aGUgdmFsdWUgdGhhdCBzaG91bGQgaGF2ZSBiZWVuXG5cdFx0XHRcdC8vIGluIHBhZ2VYL3BhZ2VZLiBXaGlsZSBwYWdlWC9wYWdlLyBoYXZlIHRoZSB2YWx1ZSAwXG5cdFx0XHRcdHggPSB4IC0gd2luUGFnZVg7XG5cdFx0XHRcdHkgPSB5IC0gd2luUGFnZVk7XG5cdFx0XHR9IGVsc2UgaWYgKCB5IDwgKCBldmVudC5wYWdlWSAtIHdpblBhZ2VZKSB8fCB4IDwgKCBldmVudC5wYWdlWCAtIHdpblBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gU29tZSBBbmRyb2lkIGJyb3dzZXJzIGhhdmUgdG90YWxseSBib2d1cyB2YWx1ZXMgZm9yIGNsaWVudFgvWVxuXHRcdFx0XHQvLyB3aGVuIHNjcm9sbGluZy96b29taW5nIGEgcGFnZS4gRGV0ZWN0YWJsZSBzaW5jZSBjbGllbnRYL2NsaWVudFlcblx0XHRcdFx0Ly8gc2hvdWxkIG5ldmVyIGJlIHNtYWxsZXIgdGhhbiBwYWdlWC9wYWdlWSBtaW51cyBwYWdlIHNjcm9sbFxuXHRcdFx0XHR4ID0gZXZlbnQucGFnZVggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IGV2ZW50LnBhZ2VZIC0gd2luUGFnZVk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHg6IHgsXG5cdFx0XHRcdHk6IHlcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHR2YXIgZGF0YSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyA/XG5cdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWyAwIF0gOiBldmVudCxcblx0XHRcdFx0bG9jYXRpb24gPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZ2V0TG9jYXRpb24oIGRhdGEgKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHR0aW1lOiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCksXG5cdFx0XHRcdFx0XHRjb29yZHM6IFsgbG9jYXRpb24ueCwgbG9jYXRpb24ueSBdLFxuXHRcdFx0XHRcdFx0b3JpZ2luOiAkKCBldmVudC50YXJnZXQgKVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0b3A6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF1cblx0XHRcdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRoYW5kbGVTd2lwZTogZnVuY3Rpb24oIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICkge1xuXHRcdFx0aWYgKCBzdG9wLnRpbWUgLSBzdGFydC50aW1lIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLmR1cmF0aW9uVGhyZXNob2xkICYmXG5cdFx0XHRcdE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMSBdIC0gc3RvcC5jb29yZHNbIDEgXSApIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLnZlcnRpY2FsRGlzdGFuY2VUaHJlc2hvbGQgKSB7XG5cdFx0XHRcdHZhciBkaXJlY3Rpb24gPSBzdGFydC5jb29yZHNbMF0gPiBzdG9wLmNvb3Jkc1sgMCBdID8gXCJzd2lwZWxlZnRcIiA6IFwic3dpcGVyaWdodFwiO1xuXG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgXCJzd2lwZVwiLCAkLkV2ZW50KCBcInN3aXBlXCIsIHsgdGFyZ2V0OiBvcmlnVGFyZ2V0LCBzd2lwZXN0YXJ0OiBzdGFydCwgc3dpcGVzdG9wOiBzdG9wIH0pLCB0cnVlICk7XG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgZGlyZWN0aW9uLCQuRXZlbnQoIGRpcmVjdGlvbiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSApLCB0cnVlICk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0fSxcblxuXHRcdC8vIFRoaXMgc2VydmVzIGFzIGEgZmxhZyB0byBlbnN1cmUgdGhhdCBhdCBtb3N0IG9uZSBzd2lwZSBldmVudCBldmVudCBpc1xuXHRcdC8vIGluIHdvcmsgYXQgYW55IGdpdmVuIHRpbWVcblx0XHRldmVudEluUHJvZ3Jlc3M6IGZhbHNlLFxuXG5cdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cyxcblx0XHRcdFx0dGhpc09iamVjdCA9IHRoaXMsXG5cdFx0XHRcdCR0aGlzID0gJCggdGhpc09iamVjdCApLFxuXHRcdFx0XHRjb250ZXh0ID0ge307XG5cblx0XHRcdC8vIFJldHJpZXZlIHRoZSBldmVudHMgZGF0YSBmb3IgdGhpcyBlbGVtZW50IGFuZCBhZGQgdGhlIHN3aXBlIGNvbnRleHRcblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggIWV2ZW50cyApIHtcblx0XHRcdFx0ZXZlbnRzID0geyBsZW5ndGg6IDAgfTtcblx0XHRcdFx0JC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiwgZXZlbnRzICk7XG5cdFx0XHR9XG5cdFx0XHRldmVudHMubGVuZ3RoKys7XG5cdFx0XHRldmVudHMuc3dpcGUgPSBjb250ZXh0O1xuXG5cdFx0XHRjb250ZXh0LnN0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0XHRcdC8vIEJhaWwgaWYgd2UncmUgYWxyZWFkeSB3b3JraW5nIG9uIGEgc3dpcGUgZXZlbnRcblx0XHRcdFx0aWYgKCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gdHJ1ZTtcblxuXHRcdFx0XHR2YXIgc3RvcCxcblx0XHRcdFx0XHRzdGFydCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdGFydCggZXZlbnQgKSxcblx0XHRcdFx0XHRvcmlnVGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuXHRcdFx0XHRcdGVtaXR0ZWQgPSBmYWxzZTtcblxuXHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdFx0aWYgKCAhc3RhcnQgfHwgZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0c3RvcCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdG9wKCBldmVudCApO1xuXHRcdFx0XHRcdGlmICggIWVtaXR0ZWQgKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhhbmRsZVN3aXBlKCBzdGFydCwgc3RvcCwgdGhpc09iamVjdCwgb3JpZ1RhcmdldCApO1xuXHRcdFx0XHRcdFx0aWYgKCBlbWl0dGVkICkge1xuXG5cdFx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIHByZXZlbnQgc2Nyb2xsaW5nXG5cdFx0XHRcdFx0aWYgKCBNYXRoLmFicyggc3RhcnQuY29vcmRzWyAwIF0gLSBzdG9wLmNvb3Jkc1sgMCBdICkgPiAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc2Nyb2xsU3VwcmVzc2lvblRocmVzaG9sZCApIHtcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGNvbnRleHQuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZW1pdHRlZCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHRcdFx0Y29udGV4dC5tb3ZlID0gbnVsbDtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQkZG9jdW1lbnQub24oIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKVxuXHRcdFx0XHRcdC5vbmUoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdH07XG5cdFx0XHQkdGhpcy5vbiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0fSxcblxuXHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBldmVudHMsIGNvbnRleHQ7XG5cblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggZXZlbnRzICkge1xuXHRcdFx0XHRjb250ZXh0ID0gZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRkZWxldGUgZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRldmVudHMubGVuZ3RoLS07XG5cdFx0XHRcdGlmICggZXZlbnRzLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdFx0XHQkLnJlbW92ZURhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBjb250ZXh0ICkge1xuXHRcdFx0XHRpZiAoIGNvbnRleHQuc3RhcnQgKSB7XG5cdFx0XHRcdFx0JCggdGhpcyApLm9mZiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0Lm1vdmUgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggY29udGV4dC5zdG9wICkge1xuXHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0JC5lYWNoKHtcblx0XHRzd2lwZWxlZnQ6IFwic3dpcGUubGVmdFwiLFxuXHRcdHN3aXBlcmlnaHQ6IFwic3dpcGUucmlnaHRcIlxuXHR9LCBmdW5jdGlvbiggZXZlbnQsIHNvdXJjZUV2ZW50ICkge1xuXG5cdFx0JC5ldmVudC5zcGVjaWFsWyBldmVudCBdID0ge1xuXHRcdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkuYmluZCggc291cmNlRXZlbnQsICQubm9vcCApO1xuXHRcdFx0fSxcblx0XHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0JCggdGhpcyApLnVuYmluZCggc291cmNlRXZlbnQgKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcbn0pKCBqUXVlcnksIHRoaXMgKTtcbiovXG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IE11dGF0aW9uT2JzZXJ2ZXIgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgcHJlZml4ZXMgPSBbJ1dlYktpdCcsICdNb3onLCAnTycsICdNcycsICcnXTtcbiAgZm9yICh2YXIgaT0wOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYCR7cHJlZml4ZXNbaV19TXV0YXRpb25PYnNlcnZlcmAgaW4gd2luZG93KSB7XG4gICAgICByZXR1cm4gd2luZG93W2Ake3ByZWZpeGVzW2ldfU11dGF0aW9uT2JzZXJ2ZXJgXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSgpKTtcblxuY29uc3QgdHJpZ2dlcnMgPSAoZWwsIHR5cGUpID0+IHtcbiAgZWwuZGF0YSh0eXBlKS5zcGxpdCgnICcpLmZvckVhY2goaWQgPT4ge1xuICAgICQoYCMke2lkfWApWyB0eXBlID09PSAnY2xvc2UnID8gJ3RyaWdnZXInIDogJ3RyaWdnZXJIYW5kbGVyJ10oYCR7dHlwZX0uemYudHJpZ2dlcmAsIFtlbF0pO1xuICB9KTtcbn07XG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLW9wZW5dIHdpbGwgcmV2ZWFsIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtb3Blbl0nLCBmdW5jdGlvbigpIHtcbiAgdHJpZ2dlcnMoJCh0aGlzKSwgJ29wZW4nKTtcbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NlXSB3aWxsIGNsb3NlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuLy8gSWYgdXNlZCB3aXRob3V0IGEgdmFsdWUgb24gW2RhdGEtY2xvc2VdLCB0aGUgZXZlbnQgd2lsbCBidWJibGUsIGFsbG93aW5nIGl0IHRvIGNsb3NlIGEgcGFyZW50IGNvbXBvbmVudC5cbiQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NlXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ2Nsb3NlJyk7XG4gIGlmIChpZCkge1xuICAgIHRyaWdnZXJzKCQodGhpcyksICdjbG9zZScpO1xuICB9XG4gIGVsc2Uge1xuICAgICQodGhpcykudHJpZ2dlcignY2xvc2UuemYudHJpZ2dlcicpO1xuICB9XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS10b2dnbGVdIHdpbGwgdG9nZ2xlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZScpO1xuICBpZiAoaWQpIHtcbiAgICB0cmlnZ2VycygkKHRoaXMpLCAndG9nZ2xlJyk7XG4gIH0gZWxzZSB7XG4gICAgJCh0aGlzKS50cmlnZ2VyKCd0b2dnbGUuemYudHJpZ2dlcicpO1xuICB9XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zYWJsZV0gd2lsbCByZXNwb25kIHRvIGNsb3NlLnpmLnRyaWdnZXIgZXZlbnRzLlxuJChkb2N1bWVudCkub24oJ2Nsb3NlLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2FibGVdJywgZnVuY3Rpb24oZSl7XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGxldCBhbmltYXRpb24gPSAkKHRoaXMpLmRhdGEoJ2Nsb3NhYmxlJyk7XG5cbiAgaWYoYW5pbWF0aW9uICE9PSAnJyl7XG4gICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZU91dCgkKHRoaXMpLCBhbmltYXRpb24sIGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgICB9KTtcbiAgfWVsc2V7XG4gICAgJCh0aGlzKS5mYWRlT3V0KCkudHJpZ2dlcignY2xvc2VkLnpmJyk7XG4gIH1cbn0pO1xuXG4kKGRvY3VtZW50KS5vbignZm9jdXMuemYudHJpZ2dlciBibHVyLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlLWZvY3VzXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZS1mb2N1cycpO1xuICAkKGAjJHtpZH1gKS50cmlnZ2VySGFuZGxlcigndG9nZ2xlLnpmLnRyaWdnZXInLCBbJCh0aGlzKV0pO1xufSk7XG5cbi8qKlxuKiBGaXJlcyBvbmNlIGFmdGVyIGFsbCBvdGhlciBzY3JpcHRzIGhhdmUgbG9hZGVkXG4qIEBmdW5jdGlvblxuKiBAcHJpdmF0ZVxuKi9cbiQod2luZG93KS5vbignbG9hZCcsICgpID0+IHtcbiAgY2hlY2tMaXN0ZW5lcnMoKTtcbn0pO1xuXG5mdW5jdGlvbiBjaGVja0xpc3RlbmVycygpIHtcbiAgZXZlbnRzTGlzdGVuZXIoKTtcbiAgcmVzaXplTGlzdGVuZXIoKTtcbiAgc2Nyb2xsTGlzdGVuZXIoKTtcbiAgY2xvc2VtZUxpc3RlbmVyKCk7XG59XG5cbi8vKioqKioqKiogb25seSBmaXJlcyB0aGlzIGZ1bmN0aW9uIG9uY2Ugb24gbG9hZCwgaWYgdGhlcmUncyBzb21ldGhpbmcgdG8gd2F0Y2ggKioqKioqKipcbmZ1bmN0aW9uIGNsb3NlbWVMaXN0ZW5lcihwbHVnaW5OYW1lKSB7XG4gIHZhciB5ZXRpQm94ZXMgPSAkKCdbZGF0YS15ZXRpLWJveF0nKSxcbiAgICAgIHBsdWdOYW1lcyA9IFsnZHJvcGRvd24nLCAndG9vbHRpcCcsICdyZXZlYWwnXTtcblxuICBpZihwbHVnaW5OYW1lKXtcbiAgICBpZih0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ3N0cmluZycpe1xuICAgICAgcGx1Z05hbWVzLnB1c2gocGx1Z2luTmFtZSk7XG4gICAgfWVsc2UgaWYodHlwZW9mIHBsdWdpbk5hbWUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwbHVnaW5OYW1lWzBdID09PSAnc3RyaW5nJyl7XG4gICAgICBwbHVnTmFtZXMuY29uY2F0KHBsdWdpbk5hbWUpO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5lcnJvcignUGx1Z2luIG5hbWVzIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH1cbiAgfVxuICBpZih5ZXRpQm94ZXMubGVuZ3RoKXtcbiAgICBsZXQgbGlzdGVuZXJzID0gcGx1Z05hbWVzLm1hcCgobmFtZSkgPT4ge1xuICAgICAgcmV0dXJuIGBjbG9zZW1lLnpmLiR7bmFtZX1gO1xuICAgIH0pLmpvaW4oJyAnKTtcblxuICAgICQod2luZG93KS5vZmYobGlzdGVuZXJzKS5vbihsaXN0ZW5lcnMsIGZ1bmN0aW9uKGUsIHBsdWdpbklkKXtcbiAgICAgIGxldCBwbHVnaW4gPSBlLm5hbWVzcGFjZS5zcGxpdCgnLicpWzBdO1xuICAgICAgbGV0IHBsdWdpbnMgPSAkKGBbZGF0YS0ke3BsdWdpbn1dYCkubm90KGBbZGF0YS15ZXRpLWJveD1cIiR7cGx1Z2luSWR9XCJdYCk7XG5cbiAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICBsZXQgX3RoaXMgPSAkKHRoaXMpO1xuXG4gICAgICAgIF90aGlzLnRyaWdnZXJIYW5kbGVyKCdjbG9zZS56Zi50cmlnZ2VyJywgW190aGlzXSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZXNpemVMaXN0ZW5lcihkZWJvdW5jZSl7XG4gIGxldCB0aW1lcixcbiAgICAgICRub2RlcyA9ICQoJ1tkYXRhLXJlc2l6ZV0nKTtcbiAgaWYoJG5vZGVzLmxlbmd0aCl7XG4gICAgJCh3aW5kb3cpLm9mZigncmVzaXplLnpmLnRyaWdnZXInKVxuICAgIC5vbigncmVzaXplLnpmLnRyaWdnZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAodGltZXIpIHsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuXG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICBpZighTXV0YXRpb25PYnNlcnZlcil7Ly9mYWxsYmFjayBmb3IgSUUgOVxuICAgICAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIHJlc2l6ZSBldmVudFxuICAgICAgICAkbm9kZXMuYXR0cignZGF0YS1ldmVudHMnLCBcInJlc2l6ZVwiKTtcbiAgICAgIH0sIGRlYm91bmNlIHx8IDEwKTsvL2RlZmF1bHQgdGltZSB0byBlbWl0IHJlc2l6ZSBldmVudFxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNjcm9sbExpc3RlbmVyKGRlYm91bmNlKXtcbiAgbGV0IHRpbWVyLFxuICAgICAgJG5vZGVzID0gJCgnW2RhdGEtc2Nyb2xsXScpO1xuICBpZigkbm9kZXMubGVuZ3RoKXtcbiAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwuemYudHJpZ2dlcicpXG4gICAgLm9uKCdzY3JvbGwuemYudHJpZ2dlcicsIGZ1bmN0aW9uKGUpe1xuICAgICAgaWYodGltZXIpeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG5cbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgc2Nyb2xsIGV2ZW50XG4gICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwic2Nyb2xsXCIpO1xuICAgICAgfSwgZGVib3VuY2UgfHwgMTApOy8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgc2Nyb2xsIGV2ZW50XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXZlbnRzTGlzdGVuZXIoKSB7XG4gIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsgcmV0dXJuIGZhbHNlOyB9XG4gIGxldCBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXJlc2l6ZV0sIFtkYXRhLXNjcm9sbF0sIFtkYXRhLW11dGF0ZV0nKTtcblxuICAvL2VsZW1lbnQgY2FsbGJhY2tcbiAgdmFyIGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24gPSBmdW5jdGlvbiAobXV0YXRpb25SZWNvcmRzTGlzdCkge1xuICAgICAgdmFyICR0YXJnZXQgPSAkKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0udGFyZ2V0KTtcblxuXHQgIC8vdHJpZ2dlciB0aGUgZXZlbnQgaGFuZGxlciBmb3IgdGhlIGVsZW1lbnQgZGVwZW5kaW5nIG9uIHR5cGVcbiAgICAgIHN3aXRjaCAobXV0YXRpb25SZWNvcmRzTGlzdFswXS50eXBlKSB7XG5cbiAgICAgICAgY2FzZSBcImF0dHJpYnV0ZXNcIjpcbiAgICAgICAgICBpZiAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikgPT09IFwic2Nyb2xsXCIgJiYgbXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcImRhdGEtZXZlbnRzXCIpIHtcblx0XHQgIFx0JHRhcmdldC50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LCB3aW5kb3cucGFnZVlPZmZzZXRdKTtcblx0XHQgIH1cblx0XHQgIGlmICgkdGFyZ2V0LmF0dHIoXCJkYXRhLWV2ZW50c1wiKSA9PT0gXCJyZXNpemVcIiAmJiBtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwiZGF0YS1ldmVudHNcIikge1xuXHRcdCAgXHQkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXRdKTtcblx0XHQgICB9XG5cdFx0ICBpZiAobXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcInN0eWxlXCIpIHtcblx0XHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIixcIm11dGF0ZVwiKTtcblx0XHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7XG5cdFx0ICB9XG5cdFx0ICBicmVhaztcblxuICAgICAgICBjYXNlIFwiY2hpbGRMaXN0XCI6XG5cdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwibXV0YXRlXCIpO1xuXHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS50cmlnZ2VySGFuZGxlcignbXV0YXRlbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpXSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vbm90aGluZ1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAobm9kZXMubGVuZ3RoKSB7XG4gICAgICAvL2ZvciBlYWNoIGVsZW1lbnQgdGhhdCBuZWVkcyB0byBsaXN0ZW4gZm9yIHJlc2l6aW5nLCBzY3JvbGxpbmcsIG9yIG11dGF0aW9uIGFkZCBhIHNpbmdsZSBvYnNlcnZlclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gbm9kZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIHZhciBlbGVtZW50T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uKTtcbiAgICAgICAgZWxlbWVudE9ic2VydmVyLm9ic2VydmUobm9kZXNbaV0sIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSwgc3VidHJlZTogdHJ1ZSwgYXR0cmlidXRlRmlsdGVyOiBbXCJkYXRhLWV2ZW50c1wiLCBcInN0eWxlXCJdIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gW1BIXVxuLy8gRm91bmRhdGlvbi5DaGVja1dhdGNoZXJzID0gY2hlY2tXYXRjaGVycztcbkZvdW5kYXRpb24uSUhlYXJZb3UgPSBjaGVja0xpc3RlbmVycztcbi8vIEZvdW5kYXRpb24uSVNlZVlvdSA9IHNjcm9sbExpc3RlbmVyO1xuLy8gRm91bmRhdGlvbi5JRmVlbFlvdSA9IGNsb3NlbWVMaXN0ZW5lcjtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIEFjY29yZGlvbiBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uYWNjb3JkaW9uXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICovXG5cbmNsYXNzIEFjY29yZGlvbiB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGFuIGFjY29yZGlvbi5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jaW5pdFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGFuIGFjY29yZGlvbi5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBhIHBsYWluIG9iamVjdCB3aXRoIHNldHRpbmdzIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9wdGlvbnMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIEFjY29yZGlvbi5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnQWNjb3JkaW9uJyk7XG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignQWNjb3JkaW9uJywge1xuICAgICAgJ0VOVEVSJzogJ3RvZ2dsZScsXG4gICAgICAnU1BBQ0UnOiAndG9nZ2xlJyxcbiAgICAgICdBUlJPV19ET1dOJzogJ25leHQnLFxuICAgICAgJ0FSUk9XX1VQJzogJ3ByZXZpb3VzJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBhY2NvcmRpb24gYnkgYW5pbWF0aW5nIHRoZSBwcmVzZXQgYWN0aXZlIHBhbmUocykuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ3JvbGUnLCAndGFibGlzdCcpO1xuICAgIHRoaXMuJHRhYnMgPSB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCdbZGF0YS1hY2NvcmRpb24taXRlbV0nKTtcblxuICAgIHRoaXMuJHRhYnMuZWFjaChmdW5jdGlvbihpZHgsIGVsKSB7XG4gICAgICB2YXIgJGVsID0gJChlbCksXG4gICAgICAgICAgJGNvbnRlbnQgPSAkZWwuY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpLFxuICAgICAgICAgIGlkID0gJGNvbnRlbnRbMF0uaWQgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAnYWNjb3JkaW9uJyksXG4gICAgICAgICAgbGlua0lkID0gZWwuaWQgfHwgYCR7aWR9LWxhYmVsYDtcblxuICAgICAgJGVsLmZpbmQoJ2E6Zmlyc3QnKS5hdHRyKHtcbiAgICAgICAgJ2FyaWEtY29udHJvbHMnOiBpZCxcbiAgICAgICAgJ3JvbGUnOiAndGFiJyxcbiAgICAgICAgJ2lkJzogbGlua0lkLFxuICAgICAgICAnYXJpYS1leHBhbmRlZCc6IGZhbHNlLFxuICAgICAgICAnYXJpYS1zZWxlY3RlZCc6IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgJGNvbnRlbnQuYXR0cih7J3JvbGUnOiAndGFicGFuZWwnLCAnYXJpYS1sYWJlbGxlZGJ5JzogbGlua0lkLCAnYXJpYS1oaWRkZW4nOiB0cnVlLCAnaWQnOiBpZH0pO1xuICAgIH0pO1xuICAgIHZhciAkaW5pdEFjdGl2ZSA9IHRoaXMuJGVsZW1lbnQuZmluZCgnLmlzLWFjdGl2ZScpLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKTtcbiAgICB0aGlzLmZpcnN0VGltZUluaXQgPSB0cnVlO1xuICAgIGlmKCRpbml0QWN0aXZlLmxlbmd0aCl7XG4gICAgICB0aGlzLmRvd24oJGluaXRBY3RpdmUsIHRoaXMuZmlyc3RUaW1lSW5pdCk7XG4gICAgICB0aGlzLmZpcnN0VGltZUluaXQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLl9jaGVja0RlZXBMaW5rID0gKCkgPT4ge1xuICAgICAgdmFyIGFuY2hvciA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgICAgLy9uZWVkIGEgaGFzaCBhbmQgYSByZWxldmFudCBhbmNob3IgaW4gdGhpcyB0YWJzZXRcbiAgICAgIGlmKGFuY2hvci5sZW5ndGgpIHtcbiAgICAgICAgdmFyICRsaW5rID0gdGhpcy4kZWxlbWVudC5maW5kKCdbaHJlZiQ9XCInK2FuY2hvcisnXCJdJyksXG4gICAgICAgICRhbmNob3IgPSAkKGFuY2hvcik7XG5cbiAgICAgICAgaWYgKCRsaW5rLmxlbmd0aCAmJiAkYW5jaG9yKSB7XG4gICAgICAgICAgaWYgKCEkbGluay5wYXJlbnQoJ1tkYXRhLWFjY29yZGlvbi1pdGVtXScpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgICAgICAgdGhpcy5kb3duKCRhbmNob3IsIHRoaXMuZmlyc3RUaW1lSW5pdCk7XG4gICAgICAgICAgICB0aGlzLmZpcnN0VGltZUluaXQgPSBmYWxzZTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy9yb2xsIHVwIGEgbGl0dGxlIHRvIHNob3cgdGhlIHRpdGxlc1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2UpIHtcbiAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAkKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IF90aGlzLiRlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogb2Zmc2V0LnRvcCB9LCBfdGhpcy5vcHRpb25zLmRlZXBMaW5rU211ZGdlRGVsYXkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHpwbHVnaW4gaGFzIGRlZXBsaW5rZWQgYXQgcGFnZWxvYWRcbiAgICAgICAgICAgICogQGV2ZW50IEFjY29yZGlvbiNkZWVwbGlua1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2RlZXBsaW5rLnpmLmFjY29yZGlvbicsIFskbGluaywgJGFuY2hvcl0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy91c2UgYnJvd3NlciB0byBvcGVuIGEgdGFiLCBpZiBpdCBleGlzdHMgaW4gdGhpcyB0YWJzZXRcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICB0aGlzLl9jaGVja0RlZXBMaW5rKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSBhY2NvcmRpb24uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiR0YWJzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpO1xuICAgICAgdmFyICR0YWJDb250ZW50ID0gJGVsZW0uY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpO1xuICAgICAgaWYgKCR0YWJDb250ZW50Lmxlbmd0aCkge1xuICAgICAgICAkZWxlbS5jaGlsZHJlbignYScpLm9mZignY2xpY2suemYuYWNjb3JkaW9uIGtleWRvd24uemYuYWNjb3JkaW9uJylcbiAgICAgICAgICAgICAgIC5vbignY2xpY2suemYuYWNjb3JkaW9uJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBfdGhpcy50b2dnbGUoJHRhYkNvbnRlbnQpO1xuICAgICAgICB9KS5vbigna2V5ZG93bi56Zi5hY2NvcmRpb24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnQWNjb3JkaW9uJywge1xuICAgICAgICAgICAgdG9nZ2xlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgX3RoaXMudG9nZ2xlKCR0YWJDb250ZW50KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyICRhID0gJGVsZW0ubmV4dCgpLmZpbmQoJ2EnKS5mb2N1cygpO1xuICAgICAgICAgICAgICBpZiAoIV90aGlzLm9wdGlvbnMubXVsdGlFeHBhbmQpIHtcbiAgICAgICAgICAgICAgICAkYS50cmlnZ2VyKCdjbGljay56Zi5hY2NvcmRpb24nKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgJGEgPSAkZWxlbS5wcmV2KCkuZmluZCgnYScpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIGlmICghX3RoaXMub3B0aW9ucy5tdWx0aUV4cGFuZCkge1xuICAgICAgICAgICAgICAgICRhLnRyaWdnZXIoJ2NsaWNrLnpmLmFjY29yZGlvbicpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZih0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgICQod2luZG93KS5vbigncG9wc3RhdGUnLCB0aGlzLl9jaGVja0RlZXBMaW5rKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgc2VsZWN0ZWQgY29udGVudCBwYW5lJ3Mgb3Blbi9jbG9zZSBzdGF0ZS5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBqUXVlcnkgb2JqZWN0IG9mIHRoZSBwYW5lIHRvIHRvZ2dsZSAoYC5hY2NvcmRpb24tY29udGVudGApLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHRvZ2dsZSgkdGFyZ2V0KSB7XG4gICAgaWYoJHRhcmdldC5wYXJlbnQoKS5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgIHRoaXMudXAoJHRhcmdldCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZG93bigkdGFyZ2V0KTtcbiAgICB9XG4gICAgLy9laXRoZXIgcmVwbGFjZSBvciB1cGRhdGUgYnJvd3NlciBoaXN0b3J5XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgdmFyIGFuY2hvciA9ICR0YXJnZXQucHJldignYScpLmF0dHIoJ2hyZWYnKTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy51cGRhdGVIaXN0b3J5KSB7XG4gICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHt9LCAnJywgYW5jaG9yKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKHt9LCAnJywgYW5jaG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIGFjY29yZGlvbiB0YWIgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gQWNjb3JkaW9uIHBhbmUgdG8gb3BlbiAoYC5hY2NvcmRpb24tY29udGVudGApLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGZpcnN0VGltZSAtIGZsYWcgdG8gZGV0ZXJtaW5lIGlmIHJlZmxvdyBzaG91bGQgaGFwcGVuLlxuICAgKiBAZmlyZXMgQWNjb3JkaW9uI2Rvd25cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkb3duKCR0YXJnZXQsIGZpcnN0VGltZSkge1xuICAgICR0YXJnZXRcbiAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicsIGZhbHNlKVxuICAgICAgLnBhcmVudCgnW2RhdGEtdGFiLWNvbnRlbnRdJylcbiAgICAgIC5hZGRCYWNrKClcbiAgICAgIC5wYXJlbnQoKS5hZGRDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5tdWx0aUV4cGFuZCAmJiAhZmlyc3RUaW1lKSB7XG4gICAgICB2YXIgJGN1cnJlbnRBY3RpdmUgPSB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCcuaXMtYWN0aXZlJykuY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpO1xuICAgICAgaWYgKCRjdXJyZW50QWN0aXZlLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnVwKCRjdXJyZW50QWN0aXZlLm5vdCgkdGFyZ2V0KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJHRhcmdldC5zbGlkZURvd24odGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsICgpID0+IHtcbiAgICAgIC8qKlxuICAgICAgICogRmlyZXMgd2hlbiB0aGUgdGFiIGlzIGRvbmUgb3BlbmluZy5cbiAgICAgICAqIEBldmVudCBBY2NvcmRpb24jZG93blxuICAgICAgICovXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Rvd24uemYuYWNjb3JkaW9uJywgWyR0YXJnZXRdKTtcbiAgICB9KTtcblxuICAgICQoYCMkeyR0YXJnZXQuYXR0cignYXJpYS1sYWJlbGxlZGJ5Jyl9YCkuYXR0cih7XG4gICAgICAnYXJpYS1leHBhbmRlZCc6IHRydWUsXG4gICAgICAnYXJpYS1zZWxlY3RlZCc6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIHRhYiBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBBY2NvcmRpb24gdGFiIHRvIGNsb3NlIChgLmFjY29yZGlvbi1jb250ZW50YCkuXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jdXBcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICB1cCgkdGFyZ2V0KSB7XG4gICAgdmFyICRhdW50cyA9ICR0YXJnZXQucGFyZW50KCkuc2libGluZ3MoKSxcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYoKCF0aGlzLm9wdGlvbnMuYWxsb3dBbGxDbG9zZWQgJiYgISRhdW50cy5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHx8ICEkdGFyZ2V0LnBhcmVudCgpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEZvdW5kYXRpb24uTW92ZSh0aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgJHRhcmdldCwgZnVuY3Rpb24oKXtcbiAgICAgICR0YXJnZXQuc2xpZGVVcChfdGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHRhYiBpcyBkb25lIGNvbGxhcHNpbmcgdXAuXG4gICAgICAgICAqIEBldmVudCBBY2NvcmRpb24jdXBcbiAgICAgICAgICovXG4gICAgICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3VwLnpmLmFjY29yZGlvbicsIFskdGFyZ2V0XSk7XG4gICAgICB9KTtcbiAgICAvLyB9KTtcblxuICAgICR0YXJnZXQuYXR0cignYXJpYS1oaWRkZW4nLCB0cnVlKVxuICAgICAgICAgICAucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgJChgIyR7JHRhcmdldC5hdHRyKCdhcmlhLWxhYmVsbGVkYnknKX1gKS5hdHRyKHtcbiAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcbiAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBmYWxzZVxuICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgYW4gYWNjb3JkaW9uLlxuICAgKiBAZmlyZXMgQWNjb3JkaW9uI2Rlc3Ryb3llZFxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS10YWItY29udGVudF0nKS5zdG9wKHRydWUpLnNsaWRlVXAoMCkuY3NzKCdkaXNwbGF5JywgJycpO1xuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnYScpLm9mZignLnpmLmFjY29yZGlvbicpO1xuICAgIGlmKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgJCh3aW5kb3cpLm9mZigncG9wc3RhdGUnLCB0aGlzLl9jaGVja0RlZXBMaW5rKTtcbiAgICB9XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuQWNjb3JkaW9uLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogQW1vdW50IG9mIHRpbWUgdG8gYW5pbWF0ZSB0aGUgb3BlbmluZyBvZiBhbiBhY2NvcmRpb24gcGFuZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCAyNTBcbiAgICovXG4gIHNsaWRlU3BlZWQ6IDI1MCxcbiAgLyoqXG4gICAqIEFsbG93IHRoZSBhY2NvcmRpb24gdG8gaGF2ZSBtdWx0aXBsZSBvcGVuIHBhbmVzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgbXVsdGlFeHBhbmQ6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3cgdGhlIGFjY29yZGlvbiB0byBjbG9zZSBhbGwgcGFuZXMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBhbGxvd0FsbENsb3NlZDogZmFsc2UsXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHdpbmRvdyB0byBzY3JvbGwgdG8gY29udGVudCBvZiBwYW5lIHNwZWNpZmllZCBieSBoYXNoIGFuY2hvclxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgZGVlcExpbms6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBZGp1c3QgdGhlIGRlZXAgbGluayBzY3JvbGwgdG8gbWFrZSBzdXJlIHRoZSB0b3Agb2YgdGhlIGFjY29yZGlvbiBwYW5lbCBpcyB2aXNpYmxlXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBkZWVwTGlua1NtdWRnZTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFuaW1hdGlvbiB0aW1lIChtcykgZm9yIHRoZSBkZWVwIGxpbmsgYWRqdXN0bWVudFxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDMwMFxuICAgKi9cbiAgZGVlcExpbmtTbXVkZ2VEZWxheTogMzAwLFxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGJyb3dzZXIgaGlzdG9yeSB3aXRoIHRoZSBvcGVuIGFjY29yZGlvblxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgdXBkYXRlSGlzdG9yeTogZmFsc2Vcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihBY2NvcmRpb24sICdBY2NvcmRpb24nKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIEludGVyY2hhbmdlIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5pbnRlcmNoYW5nZVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXJcbiAqL1xuXG5jbGFzcyBJbnRlcmNoYW5nZSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIEludGVyY2hhbmdlLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIEludGVyY2hhbmdlI2luaXRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGFkZCB0aGUgdHJpZ2dlciB0by5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBJbnRlcmNoYW5nZS5kZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgdGhpcy5ydWxlcyA9IFtdO1xuICAgIHRoaXMuY3VycmVudFBhdGggPSAnJztcblxuICAgIHRoaXMuX2luaXQoKTtcbiAgICB0aGlzLl9ldmVudHMoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0ludGVyY2hhbmdlJyk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIEludGVyY2hhbmdlIHBsdWdpbiBhbmQgY2FsbHMgZnVuY3Rpb25zIHRvIGdldCBpbnRlcmNoYW5nZSBmdW5jdGlvbmluZyBvbiBsb2FkLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuX2FkZEJyZWFrcG9pbnRzKCk7XG4gICAgdGhpcy5fZ2VuZXJhdGVSdWxlcygpO1xuICAgIHRoaXMuX3JlZmxvdygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGV2ZW50cyBmb3IgSW50ZXJjaGFuZ2UuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS56Zi5pbnRlcmNoYW5nZScsIEZvdW5kYXRpb24udXRpbC50aHJvdHRsZSgoKSA9PiB7XG4gICAgICB0aGlzLl9yZWZsb3coKTtcbiAgICB9LCA1MCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIG5lY2Vzc2FyeSBmdW5jdGlvbnMgdG8gdXBkYXRlIEludGVyY2hhbmdlIHVwb24gRE9NIGNoYW5nZVxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9yZWZsb3coKSB7XG4gICAgdmFyIG1hdGNoO1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcnVsZSwgYnV0IG9ubHkgc2F2ZSB0aGUgbGFzdCBtYXRjaFxuICAgIGZvciAodmFyIGkgaW4gdGhpcy5ydWxlcykge1xuICAgICAgaWYodGhpcy5ydWxlcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcnVsZSA9IHRoaXMucnVsZXNbaV07XG4gICAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShydWxlLnF1ZXJ5KS5tYXRjaGVzKSB7XG4gICAgICAgICAgbWF0Y2ggPSBydWxlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICB0aGlzLnJlcGxhY2UobWF0Y2gucGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIEZvdW5kYXRpb24gYnJlYWtwb2ludHMgYW5kIGFkZHMgdGhlbSB0byB0aGUgSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTIG9iamVjdC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYWRkQnJlYWtwb2ludHMoKSB7XG4gICAgZm9yICh2YXIgaSBpbiBGb3VuZGF0aW9uLk1lZGlhUXVlcnkucXVlcmllcykge1xuICAgICAgaWYgKEZvdW5kYXRpb24uTWVkaWFRdWVyeS5xdWVyaWVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBxdWVyeSA9IEZvdW5kYXRpb24uTWVkaWFRdWVyeS5xdWVyaWVzW2ldO1xuICAgICAgICBJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVNbcXVlcnkubmFtZV0gPSBxdWVyeS52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBJbnRlcmNoYW5nZSBlbGVtZW50IGZvciB0aGUgcHJvdmlkZWQgbWVkaWEgcXVlcnkgKyBjb250ZW50IHBhaXJpbmdzXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdGhhdCBpcyBhbiBJbnRlcmNoYW5nZSBpbnN0YW5jZVxuICAgKiBAcmV0dXJucyB7QXJyYXl9IHNjZW5hcmlvcyAtIEFycmF5IG9mIG9iamVjdHMgdGhhdCBoYXZlICdtcScgYW5kICdwYXRoJyBrZXlzIHdpdGggY29ycmVzcG9uZGluZyBrZXlzXG4gICAqL1xuICBfZ2VuZXJhdGVSdWxlcyhlbGVtZW50KSB7XG4gICAgdmFyIHJ1bGVzTGlzdCA9IFtdO1xuICAgIHZhciBydWxlcztcblxuICAgIGlmICh0aGlzLm9wdGlvbnMucnVsZXMpIHtcbiAgICAgIHJ1bGVzID0gdGhpcy5vcHRpb25zLnJ1bGVzO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJ1bGVzID0gdGhpcy4kZWxlbWVudC5kYXRhKCdpbnRlcmNoYW5nZScpO1xuICAgIH1cbiAgICBcbiAgICBydWxlcyA9ICB0eXBlb2YgcnVsZXMgPT09ICdzdHJpbmcnID8gcnVsZXMubWF0Y2goL1xcWy4qP1xcXS9nKSA6IHJ1bGVzO1xuXG4gICAgZm9yICh2YXIgaSBpbiBydWxlcykge1xuICAgICAgaWYocnVsZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgdmFyIHJ1bGUgPSBydWxlc1tpXS5zbGljZSgxLCAtMSkuc3BsaXQoJywgJyk7XG4gICAgICAgIHZhciBwYXRoID0gcnVsZS5zbGljZSgwLCAtMSkuam9pbignJyk7XG4gICAgICAgIHZhciBxdWVyeSA9IHJ1bGVbcnVsZS5sZW5ndGggLSAxXTtcblxuICAgICAgICBpZiAoSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTW3F1ZXJ5XSkge1xuICAgICAgICAgIHF1ZXJ5ID0gSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTW3F1ZXJ5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJ1bGVzTGlzdC5wdXNoKHtcbiAgICAgICAgICBwYXRoOiBwYXRoLFxuICAgICAgICAgIHF1ZXJ5OiBxdWVyeVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJ1bGVzID0gcnVsZXNMaXN0O1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgYHNyY2AgcHJvcGVydHkgb2YgYW4gaW1hZ2UsIG9yIGNoYW5nZSB0aGUgSFRNTCBvZiBhIGNvbnRhaW5lciwgdG8gdGhlIHNwZWNpZmllZCBwYXRoLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBhdGggLSBQYXRoIHRvIHRoZSBpbWFnZSBvciBIVE1MIHBhcnRpYWwuXG4gICAqIEBmaXJlcyBJbnRlcmNoYW5nZSNyZXBsYWNlZFxuICAgKi9cbiAgcmVwbGFjZShwYXRoKSB7XG4gICAgaWYgKHRoaXMuY3VycmVudFBhdGggPT09IHBhdGgpIHJldHVybjtcblxuICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgIHRyaWdnZXIgPSAncmVwbGFjZWQuemYuaW50ZXJjaGFuZ2UnO1xuXG4gICAgLy8gUmVwbGFjaW5nIGltYWdlc1xuICAgIGlmICh0aGlzLiRlbGVtZW50WzBdLm5vZGVOYW1lID09PSAnSU1HJykge1xuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdzcmMnLCBwYXRoKS5vbignbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5jdXJyZW50UGF0aCA9IHBhdGg7XG4gICAgICB9KVxuICAgICAgLnRyaWdnZXIodHJpZ2dlcik7XG4gICAgfVxuICAgIC8vIFJlcGxhY2luZyBiYWNrZ3JvdW5kIGltYWdlc1xuICAgIGVsc2UgaWYgKHBhdGgubWF0Y2goL1xcLihnaWZ8anBnfGpwZWd8cG5nfHN2Z3x0aWZmKShbPyNdLiopPy9pKSkge1xuICAgICAgdGhpcy4kZWxlbWVudC5jc3MoeyAnYmFja2dyb3VuZC1pbWFnZSc6ICd1cmwoJytwYXRoKycpJyB9KVxuICAgICAgICAgIC50cmlnZ2VyKHRyaWdnZXIpO1xuICAgIH1cbiAgICAvLyBSZXBsYWNpbmcgSFRNTFxuICAgIGVsc2Uge1xuICAgICAgJC5nZXQocGF0aCwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgX3RoaXMuJGVsZW1lbnQuaHRtbChyZXNwb25zZSlcbiAgICAgICAgICAgICAudHJpZ2dlcih0cmlnZ2VyKTtcbiAgICAgICAgJChyZXNwb25zZSkuZm91bmRhdGlvbigpO1xuICAgICAgICBfdGhpcy5jdXJyZW50UGF0aCA9IHBhdGg7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIGNvbnRlbnQgaW4gYW4gSW50ZXJjaGFuZ2UgZWxlbWVudCBpcyBkb25lIGJlaW5nIGxvYWRlZC5cbiAgICAgKiBAZXZlbnQgSW50ZXJjaGFuZ2UjcmVwbGFjZWRcbiAgICAgKi9cbiAgICAvLyB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3JlcGxhY2VkLnpmLmludGVyY2hhbmdlJyk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgaW50ZXJjaGFuZ2UuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICAvL1RPRE8gdGhpcy5cbiAgfVxufVxuXG4vKipcbiAqIERlZmF1bHQgc2V0dGluZ3MgZm9yIHBsdWdpblxuICovXG5JbnRlcmNoYW5nZS5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIFJ1bGVzIHRvIGJlIGFwcGxpZWQgdG8gSW50ZXJjaGFuZ2UgZWxlbWVudHMuIFNldCB3aXRoIHRoZSBgZGF0YS1pbnRlcmNoYW5nZWAgYXJyYXkgbm90YXRpb24uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUgez9hcnJheX1cbiAgICogQGRlZmF1bHQgbnVsbFxuICAgKi9cbiAgcnVsZXM6IG51bGxcbn07XG5cbkludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFUyA9IHtcbiAgJ2xhbmRzY2FwZSc6ICdzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXG4gICdwb3J0cmFpdCc6ICdzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcbiAgJ3JldGluYSc6ICdvbmx5IHNjcmVlbiBhbmQgKC13ZWJraXQtbWluLWRldmljZS1waXhlbC1yYXRpbzogMiksIG9ubHkgc2NyZWVuIGFuZCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwgb25seSBzY3JlZW4gYW5kICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyLzEpLCBvbmx5IHNjcmVlbiBhbmQgKG1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCBvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAxOTJkcGkpLCBvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAyZHBweCknXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oSW50ZXJjaGFuZ2UsICdJbnRlcmNoYW5nZScpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogTWFnZWxsYW4gbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLm1hZ2VsbGFuXG4gKi9cblxuY2xhc3MgTWFnZWxsYW4ge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBNYWdlbGxhbi5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBNYWdlbGxhbiNpbml0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBhZGQgdGhlIHRyaWdnZXIgdG8uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgID0gJC5leHRlbmQoe30sIE1hZ2VsbGFuLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgdGhpcy5jYWxjUG9pbnRzKCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdNYWdlbGxhbicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBNYWdlbGxhbiBwbHVnaW4gYW5kIGNhbGxzIGZ1bmN0aW9ucyB0byBnZXQgZXF1YWxpemVyIGZ1bmN0aW9uaW5nIG9uIGxvYWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgaWQgPSB0aGlzLiRlbGVtZW50WzBdLmlkIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ21hZ2VsbGFuJyk7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLiR0YXJnZXRzID0gJCgnW2RhdGEtbWFnZWxsYW4tdGFyZ2V0XScpO1xuICAgIHRoaXMuJGxpbmtzID0gdGhpcy4kZWxlbWVudC5maW5kKCdhJyk7XG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKHtcbiAgICAgICdkYXRhLXJlc2l6ZSc6IGlkLFxuICAgICAgJ2RhdGEtc2Nyb2xsJzogaWQsXG4gICAgICAnaWQnOiBpZFxuICAgIH0pO1xuICAgIHRoaXMuJGFjdGl2ZSA9ICQoKTtcbiAgICB0aGlzLnNjcm9sbFBvcyA9IHBhcnNlSW50KHdpbmRvdy5wYWdlWU9mZnNldCwgMTApO1xuXG4gICAgdGhpcy5fZXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsY3VsYXRlcyBhbiBhcnJheSBvZiBwaXhlbCB2YWx1ZXMgdGhhdCBhcmUgdGhlIGRlbWFyY2F0aW9uIGxpbmVzIGJldHdlZW4gbG9jYXRpb25zIG9uIHRoZSBwYWdlLlxuICAgKiBDYW4gYmUgaW52b2tlZCBpZiBuZXcgZWxlbWVudHMgYXJlIGFkZGVkIG9yIHRoZSBzaXplIG9mIGEgbG9jYXRpb24gY2hhbmdlcy5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBjYWxjUG9pbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgIGJvZHkgPSBkb2N1bWVudC5ib2R5LFxuICAgICAgICBodG1sID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG4gICAgdGhpcy5wb2ludHMgPSBbXTtcbiAgICB0aGlzLndpbkhlaWdodCA9IE1hdGgucm91bmQoTWF0aC5tYXgod2luZG93LmlubmVySGVpZ2h0LCBodG1sLmNsaWVudEhlaWdodCkpO1xuICAgIHRoaXMuZG9jSGVpZ2h0ID0gTWF0aC5yb3VuZChNYXRoLm1heChib2R5LnNjcm9sbEhlaWdodCwgYm9keS5vZmZzZXRIZWlnaHQsIGh0bWwuY2xpZW50SGVpZ2h0LCBodG1sLnNjcm9sbEhlaWdodCwgaHRtbC5vZmZzZXRIZWlnaHQpKTtcblxuICAgIHRoaXMuJHRhcmdldHMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyICR0YXIgPSAkKHRoaXMpLFxuICAgICAgICAgIHB0ID0gTWF0aC5yb3VuZCgkdGFyLm9mZnNldCgpLnRvcCAtIF90aGlzLm9wdGlvbnMudGhyZXNob2xkKTtcbiAgICAgICR0YXIudGFyZ2V0UG9pbnQgPSBwdDtcbiAgICAgIF90aGlzLnBvaW50cy5wdXNoKHB0KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBldmVudHMgZm9yIE1hZ2VsbGFuLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICAkYm9keSA9ICQoJ2h0bWwsIGJvZHknKSxcbiAgICAgICAgb3B0cyA9IHtcbiAgICAgICAgICBkdXJhdGlvbjogX3RoaXMub3B0aW9ucy5hbmltYXRpb25EdXJhdGlvbixcbiAgICAgICAgICBlYXNpbmc6ICAgX3RoaXMub3B0aW9ucy5hbmltYXRpb25FYXNpbmdcbiAgICAgICAgfTtcbiAgICAkKHdpbmRvdykub25lKCdsb2FkJywgZnVuY3Rpb24oKXtcbiAgICAgIGlmKF90aGlzLm9wdGlvbnMuZGVlcExpbmtpbmcpe1xuICAgICAgICBpZihsb2NhdGlvbi5oYXNoKXtcbiAgICAgICAgICBfdGhpcy5zY3JvbGxUb0xvYyhsb2NhdGlvbi5oYXNoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgX3RoaXMuY2FsY1BvaW50cygpO1xuICAgICAgX3RoaXMuX3VwZGF0ZUFjdGl2ZSgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kZWxlbWVudC5vbih7XG4gICAgICAncmVzaXplbWUuemYudHJpZ2dlcic6IHRoaXMucmVmbG93LmJpbmQodGhpcyksXG4gICAgICAnc2Nyb2xsbWUuemYudHJpZ2dlcic6IHRoaXMuX3VwZGF0ZUFjdGl2ZS5iaW5kKHRoaXMpXG4gICAgfSkub24oJ2NsaWNrLnpmLm1hZ2VsbGFuJywgJ2FbaHJlZl49XCIjXCJdJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHZhciBhcnJpdmFsICAgPSB0aGlzLmdldEF0dHJpYnV0ZSgnaHJlZicpO1xuICAgICAgICBfdGhpcy5zY3JvbGxUb0xvYyhhcnJpdmFsKTtcbiAgICAgIH0pO1xuICAgICQod2luZG93KS5vbigncG9wc3RhdGUnLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZihfdGhpcy5vcHRpb25zLmRlZXBMaW5raW5nKSB7XG4gICAgICAgIF90aGlzLnNjcm9sbFRvTG9jKHdpbmRvdy5sb2NhdGlvbi5oYXNoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0byBzY3JvbGwgdG8gYSBnaXZlbiBsb2NhdGlvbiBvbiB0aGUgcGFnZS5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGxvYyAtIGEgcHJvcGVybHkgZm9ybWF0dGVkIGpRdWVyeSBpZCBzZWxlY3Rvci4gRXhhbXBsZTogJyNmb28nXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgc2Nyb2xsVG9Mb2MobG9jKSB7XG4gICAgLy8gRG8gbm90aGluZyBpZiB0YXJnZXQgZG9lcyBub3QgZXhpc3QgdG8gcHJldmVudCBlcnJvcnNcbiAgICBpZiAoISQobG9jKS5sZW5ndGgpIHtyZXR1cm4gZmFsc2U7fVxuICAgIHRoaXMuX2luVHJhbnNpdGlvbiA9IHRydWU7XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgc2Nyb2xsUG9zID0gTWF0aC5yb3VuZCgkKGxvYykub2Zmc2V0KCkudG9wIC0gdGhpcy5vcHRpb25zLnRocmVzaG9sZCAvIDIgLSB0aGlzLm9wdGlvbnMuYmFyT2Zmc2V0KTtcblxuICAgICQoJ2h0bWwsIGJvZHknKS5zdG9wKHRydWUpLmFuaW1hdGUoXG4gICAgICB7IHNjcm9sbFRvcDogc2Nyb2xsUG9zIH0sXG4gICAgICB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgICB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uRWFzaW5nLFxuICAgICAgZnVuY3Rpb24oKSB7X3RoaXMuX2luVHJhbnNpdGlvbiA9IGZhbHNlOyBfdGhpcy5fdXBkYXRlQWN0aXZlKCl9XG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBuZWNlc3NhcnkgZnVuY3Rpb25zIHRvIHVwZGF0ZSBNYWdlbGxhbiB1cG9uIERPTSBjaGFuZ2VcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICByZWZsb3coKSB7XG4gICAgdGhpcy5jYWxjUG9pbnRzKCk7XG4gICAgdGhpcy5fdXBkYXRlQWN0aXZlKCk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgdmlzaWJpbGl0eSBvZiBhbiBhY3RpdmUgbG9jYXRpb24gbGluaywgYW5kIHVwZGF0ZXMgdGhlIHVybCBoYXNoIGZvciB0aGUgcGFnZSwgaWYgZGVlcExpbmtpbmcgZW5hYmxlZC5cbiAgICogQHByaXZhdGVcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBmaXJlcyBNYWdlbGxhbiN1cGRhdGVcbiAgICovXG4gIF91cGRhdGVBY3RpdmUoLypldnQsIGVsZW0sIHNjcm9sbFBvcyovKSB7XG4gICAgaWYodGhpcy5faW5UcmFuc2l0aW9uKSB7cmV0dXJuO31cbiAgICB2YXIgd2luUG9zID0gLypzY3JvbGxQb3MgfHwqLyBwYXJzZUludCh3aW5kb3cucGFnZVlPZmZzZXQsIDEwKSxcbiAgICAgICAgY3VySWR4O1xuXG4gICAgaWYod2luUG9zICsgdGhpcy53aW5IZWlnaHQgPT09IHRoaXMuZG9jSGVpZ2h0KXsgY3VySWR4ID0gdGhpcy5wb2ludHMubGVuZ3RoIC0gMTsgfVxuICAgIGVsc2UgaWYod2luUG9zIDwgdGhpcy5wb2ludHNbMF0peyBjdXJJZHggPSB1bmRlZmluZWQ7IH1cbiAgICBlbHNle1xuICAgICAgdmFyIGlzRG93biA9IHRoaXMuc2Nyb2xsUG9zIDwgd2luUG9zLFxuICAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgICBjdXJWaXNpYmxlID0gdGhpcy5wb2ludHMuZmlsdGVyKGZ1bmN0aW9uKHAsIGkpe1xuICAgICAgICAgICAgcmV0dXJuIGlzRG93biA/IHAgLSBfdGhpcy5vcHRpb25zLmJhck9mZnNldCA8PSB3aW5Qb3MgOiBwIC0gX3RoaXMub3B0aW9ucy5iYXJPZmZzZXQgLSBfdGhpcy5vcHRpb25zLnRocmVzaG9sZCA8PSB3aW5Qb3M7XG4gICAgICAgICAgfSk7XG4gICAgICBjdXJJZHggPSBjdXJWaXNpYmxlLmxlbmd0aCA/IGN1clZpc2libGUubGVuZ3RoIC0gMSA6IDA7XG4gICAgfVxuXG4gICAgdGhpcy4kYWN0aXZlLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgdGhpcy4kYWN0aXZlID0gdGhpcy4kbGlua3MuZmlsdGVyKCdbaHJlZj1cIiMnICsgdGhpcy4kdGFyZ2V0cy5lcShjdXJJZHgpLmRhdGEoJ21hZ2VsbGFuLXRhcmdldCcpICsgJ1wiXScpLmFkZENsYXNzKHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG5cbiAgICBpZih0aGlzLm9wdGlvbnMuZGVlcExpbmtpbmcpe1xuICAgICAgdmFyIGhhc2ggPSBcIlwiO1xuICAgICAgaWYoY3VySWR4ICE9IHVuZGVmaW5lZCl7XG4gICAgICAgIGhhc2ggPSB0aGlzLiRhY3RpdmVbMF0uZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gICAgICB9XG4gICAgICBpZihoYXNoICE9PSB3aW5kb3cubG9jYXRpb24uaGFzaCkge1xuICAgICAgICBpZih3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUpe1xuICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCBoYXNoKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zY3JvbGxQb3MgPSB3aW5Qb3M7XG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiBtYWdlbGxhbiBpcyBmaW5pc2hlZCB1cGRhdGluZyB0byB0aGUgbmV3IGFjdGl2ZSBlbGVtZW50LlxuICAgICAqIEBldmVudCBNYWdlbGxhbiN1cGRhdGVcbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3VwZGF0ZS56Zi5tYWdlbGxhbicsIFt0aGlzLiRhY3RpdmVdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBNYWdlbGxhbiBhbmQgcmVzZXRzIHRoZSB1cmwgb2YgdGhlIHdpbmRvdy5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYudHJpZ2dlciAuemYubWFnZWxsYW4nKVxuICAgICAgICAuZmluZChgLiR7dGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzfWApLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG5cbiAgICBpZih0aGlzLm9wdGlvbnMuZGVlcExpbmtpbmcpe1xuICAgICAgdmFyIGhhc2ggPSB0aGlzLiRhY3RpdmVbMF0uZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKGhhc2gsICcnKTtcbiAgICB9XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHNldHRpbmdzIGZvciBwbHVnaW5cbiAqL1xuTWFnZWxsYW4uZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbW91bnQgb2YgdGltZSwgaW4gbXMsIHRoZSBhbmltYXRlZCBzY3JvbGxpbmcgc2hvdWxkIHRha2UgYmV0d2VlbiBsb2NhdGlvbnMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgNTAwXG4gICAqL1xuICBhbmltYXRpb25EdXJhdGlvbjogNTAwLFxuICAvKipcbiAgICogQW5pbWF0aW9uIHN0eWxlIHRvIHVzZSB3aGVuIHNjcm9sbGluZyBiZXR3ZWVuIGxvY2F0aW9ucy4gQ2FuIGJlIGAnc3dpbmcnYCBvciBgJ2xpbmVhcidgLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICdsaW5lYXInXG4gICAqIEBzZWUge0BsaW5rIGh0dHBzOi8vYXBpLmpxdWVyeS5jb20vYW5pbWF0ZXxKcXVlcnkgYW5pbWF0ZX1cbiAgICovXG4gIGFuaW1hdGlvbkVhc2luZzogJ2xpbmVhcicsXG4gIC8qKlxuICAgKiBOdW1iZXIgb2YgcGl4ZWxzIHRvIHVzZSBhcyBhIG1hcmtlciBmb3IgbG9jYXRpb24gY2hhbmdlcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCA1MFxuICAgKi9cbiAgdGhyZXNob2xkOiA1MCxcbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGFjdGl2ZSBsb2NhdGlvbnMgbGluayBvbiB0aGUgbWFnZWxsYW4gY29udGFpbmVyLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICdhY3RpdmUnXG4gICAqL1xuICBhY3RpdmVDbGFzczogJ2FjdGl2ZScsXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHNjcmlwdCB0byBtYW5pcHVsYXRlIHRoZSB1cmwgb2YgdGhlIGN1cnJlbnQgcGFnZSwgYW5kIGlmIHN1cHBvcnRlZCwgYWx0ZXIgdGhlIGhpc3RvcnkuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBkZWVwTGlua2luZzogZmFsc2UsXG4gIC8qKlxuICAgKiBOdW1iZXIgb2YgcGl4ZWxzIHRvIG9mZnNldCB0aGUgc2Nyb2xsIG9mIHRoZSBwYWdlIG9uIGl0ZW0gY2xpY2sgaWYgdXNpbmcgYSBzdGlja3kgbmF2IGJhci5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCAwXG4gICAqL1xuICBiYXJPZmZzZXQ6IDBcbn1cblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKE1hZ2VsbGFuLCAnTWFnZWxsYW4nKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIFRhYnMgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLnRhYnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlciBpZiB0YWJzIGNvbnRhaW4gaW1hZ2VzXG4gKi9cblxuY2xhc3MgVGFicyB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRhYnMuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgVGFicyNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gdGFicy5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBUYWJzLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnVGFicycpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ1RhYnMnLCB7XG4gICAgICAnRU5URVInOiAnb3BlbicsXG4gICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAncHJldmlvdXMnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnbmV4dCcsXG4gICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cydcbiAgICAgIC8vICdUQUInOiAnbmV4dCcsXG4gICAgICAvLyAnU0hJRlRfVEFCJzogJ3ByZXZpb3VzJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSB0YWJzIGJ5IHNob3dpbmcgYW5kIGZvY3VzaW5nIChpZiBhdXRvRm9jdXM9dHJ1ZSkgdGhlIHByZXNldCBhY3RpdmUgdGFiLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cih7J3JvbGUnOiAndGFibGlzdCd9KTtcbiAgICB0aGlzLiR0YWJUaXRsZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YCk7XG4gICAgdGhpcy4kdGFiQ29udGVudCA9ICQoYFtkYXRhLXRhYnMtY29udGVudD1cIiR7dGhpcy4kZWxlbWVudFswXS5pZH1cIl1gKTtcblxuICAgIHRoaXMuJHRhYlRpdGxlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICRsaW5rID0gJGVsZW0uZmluZCgnYScpLFxuICAgICAgICAgIGlzQWN0aXZlID0gJGVsZW0uaGFzQ2xhc3MoYCR7X3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YCksXG4gICAgICAgICAgaGFzaCA9ICRsaW5rWzBdLmhhc2guc2xpY2UoMSksXG4gICAgICAgICAgbGlua0lkID0gJGxpbmtbMF0uaWQgPyAkbGlua1swXS5pZCA6IGAke2hhc2h9LWxhYmVsYCxcbiAgICAgICAgICAkdGFiQ29udGVudCA9ICQoYCMke2hhc2h9YCk7XG5cbiAgICAgICRlbGVtLmF0dHIoeydyb2xlJzogJ3ByZXNlbnRhdGlvbid9KTtcblxuICAgICAgJGxpbmsuYXR0cih7XG4gICAgICAgICdyb2xlJzogJ3RhYicsXG4gICAgICAgICdhcmlhLWNvbnRyb2xzJzogaGFzaCxcbiAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBpc0FjdGl2ZSxcbiAgICAgICAgJ2lkJzogbGlua0lkXG4gICAgICB9KTtcblxuICAgICAgJHRhYkNvbnRlbnQuYXR0cih7XG4gICAgICAgICdyb2xlJzogJ3RhYnBhbmVsJyxcbiAgICAgICAgJ2FyaWEtaGlkZGVuJzogIWlzQWN0aXZlLFxuICAgICAgICAnYXJpYS1sYWJlbGxlZGJ5JzogbGlua0lkXG4gICAgICB9KTtcblxuICAgICAgaWYoaXNBY3RpdmUgJiYgX3RoaXMub3B0aW9ucy5hdXRvRm9jdXMpe1xuICAgICAgICAkKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogJGVsZW0ub2Zmc2V0KCkudG9wIH0sIF90aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2VEZWxheSwgKCkgPT4ge1xuICAgICAgICAgICAgJGxpbmsuZm9jdXMoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYodGhpcy5vcHRpb25zLm1hdGNoSGVpZ2h0KSB7XG4gICAgICB2YXIgJGltYWdlcyA9IHRoaXMuJHRhYkNvbnRlbnQuZmluZCgnaW1nJyk7XG5cbiAgICAgIGlmICgkaW1hZ2VzLmxlbmd0aCkge1xuICAgICAgICBGb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkKCRpbWFnZXMsIHRoaXMuX3NldEhlaWdodC5iaW5kKHRoaXMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NldEhlaWdodCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgICAvL2N1cnJlbnQgY29udGV4dC1ib3VuZCBmdW5jdGlvbiB0byBvcGVuIHRhYnMgb24gcGFnZSBsb2FkIG9yIGhpc3RvcnkgcG9wc3RhdGVcbiAgICB0aGlzLl9jaGVja0RlZXBMaW5rID0gKCkgPT4ge1xuICAgICAgdmFyIGFuY2hvciA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgICAgLy9uZWVkIGEgaGFzaCBhbmQgYSByZWxldmFudCBhbmNob3IgaW4gdGhpcyB0YWJzZXRcbiAgICAgIGlmKGFuY2hvci5sZW5ndGgpIHtcbiAgICAgICAgdmFyICRsaW5rID0gdGhpcy4kZWxlbWVudC5maW5kKCdbaHJlZiQ9XCInK2FuY2hvcisnXCJdJyk7XG4gICAgICAgIGlmICgkbGluay5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLnNlbGVjdFRhYigkKGFuY2hvciksIHRydWUpO1xuXG4gICAgICAgICAgLy9yb2xsIHVwIGEgbGl0dGxlIHRvIHNob3cgdGhlIHRpdGxlc1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2UpIHtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLiRlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IG9mZnNldC50b3AgfSwgdGhpcy5vcHRpb25zLmRlZXBMaW5rU211ZGdlRGVsYXkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB6cGx1Z2luIGhhcyBkZWVwbGlua2VkIGF0IHBhZ2Vsb2FkXG4gICAgICAgICAgICAqIEBldmVudCBUYWJzI2RlZXBsaW5rXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2RlZXBsaW5rLnpmLnRhYnMnLCBbJGxpbmssICQoYW5jaG9yKV0pO1xuICAgICAgICAgfVxuICAgICAgIH1cbiAgICAgfVxuXG4gICAgLy91c2UgYnJvd3NlciB0byBvcGVuIGEgdGFiLCBpZiBpdCBleGlzdHMgaW4gdGhpcyB0YWJzZXRcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICB0aGlzLl9jaGVja0RlZXBMaW5rKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB0aGlzLl9hZGRLZXlIYW5kbGVyKCk7XG4gICAgdGhpcy5fYWRkQ2xpY2tIYW5kbGVyKCk7XG4gICAgdGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyID0gbnVsbDtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpIHtcbiAgICAgIHRoaXMuX3NldEhlaWdodE1xSGFuZGxlciA9IHRoaXMuX3NldEhlaWdodC5iaW5kKHRoaXMpO1xuXG4gICAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIHRoaXMuX3NldEhlaWdodE1xSGFuZGxlcik7XG4gICAgfVxuXG4gICAgaWYodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub24oJ3BvcHN0YXRlJywgdGhpcy5fY2hlY2tEZWVwTGluayk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgY2xpY2sgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRDbGlja0hhbmRsZXIoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5vZmYoJ2NsaWNrLnpmLnRhYnMnKVxuICAgICAgLm9uKCdjbGljay56Zi50YWJzJywgYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YCwgZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkKHRoaXMpKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMga2V5Ym9hcmQgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRLZXlIYW5kbGVyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiR0YWJUaXRsZXMub2ZmKCdrZXlkb3duLnpmLnRhYnMnKS5vbigna2V5ZG93bi56Zi50YWJzJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZiAoZS53aGljaCA9PT0gOSkgcmV0dXJuO1xuXG5cbiAgICAgIHZhciAkZWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICRlbGVtZW50cyA9ICRlbGVtZW50LnBhcmVudCgndWwnKS5jaGlsZHJlbignbGknKSxcbiAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAkbmV4dEVsZW1lbnQ7XG5cbiAgICAgICRlbGVtZW50cy5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgaWYgKCQodGhpcykuaXMoJGVsZW1lbnQpKSB7XG4gICAgICAgICAgaWYgKF90aGlzLm9wdGlvbnMud3JhcE9uS2V5cykge1xuICAgICAgICAgICAgJHByZXZFbGVtZW50ID0gaSA9PT0gMCA/ICRlbGVtZW50cy5sYXN0KCkgOiAkZWxlbWVudHMuZXEoaS0xKTtcbiAgICAgICAgICAgICRuZXh0RWxlbWVudCA9IGkgPT09ICRlbGVtZW50cy5sZW5ndGggLTEgPyAkZWxlbWVudHMuZmlyc3QoKSA6ICRlbGVtZW50cy5lcShpKzEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5tYXgoMCwgaS0xKSk7XG4gICAgICAgICAgICAkbmV4dEVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5taW4oaSsxLCAkZWxlbWVudHMubGVuZ3RoLTEpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gaGFuZGxlIGtleWJvYXJkIGV2ZW50IHdpdGgga2V5Ym9hcmQgdXRpbFxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ1RhYnMnLCB7XG4gICAgICAgIG9wZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRlbGVtZW50LmZpbmQoJ1tyb2xlPVwidGFiXCJdJykuZm9jdXMoKTtcbiAgICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCRlbGVtZW50KTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRwcmV2RWxlbWVudC5maW5kKCdbcm9sZT1cInRhYlwiXScpLmZvY3VzKCk7XG4gICAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkcHJldkVsZW1lbnQpO1xuICAgICAgICB9LFxuICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKS5mb2N1cygpO1xuICAgICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJG5leHRFbGVtZW50KTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSB0YWIgYCR0YXJnZXRDb250ZW50YCBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC4gQ29sbGFwc2VzIGFjdGl2ZSB0YWIuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gVGFiIHRvIG9wZW4uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaGlzdG9yeUhhbmRsZWQgLSBicm93c2VyIGhhcyBhbHJlYWR5IGhhbmRsZWQgYSBoaXN0b3J5IHVwZGF0ZVxuICAgKiBAZmlyZXMgVGFicyNjaGFuZ2VcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfaGFuZGxlVGFiQ2hhbmdlKCR0YXJnZXQsIGhpc3RvcnlIYW5kbGVkKSB7XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBmb3IgYWN0aXZlIGNsYXNzIG9uIHRhcmdldC4gQ29sbGFwc2UgaWYgZXhpc3RzLlxuICAgICAqL1xuICAgIGlmICgkdGFyZ2V0Lmhhc0NsYXNzKGAke3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YCkpIHtcbiAgICAgICAgaWYodGhpcy5vcHRpb25zLmFjdGl2ZUNvbGxhcHNlKSB7XG4gICAgICAgICAgICB0aGlzLl9jb2xsYXBzZVRhYigkdGFyZ2V0KTtcblxuICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgenBsdWdpbiBoYXMgc3VjY2Vzc2Z1bGx5IGNvbGxhcHNlZCB0YWJzLlxuICAgICAgICAgICAgKiBAZXZlbnQgVGFicyNjb2xsYXBzZVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY29sbGFwc2UuemYudGFicycsIFskdGFyZ2V0XSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciAkb2xkVGFiID0gdGhpcy4kZWxlbWVudC5cbiAgICAgICAgICBmaW5kKGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfS4ke3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YCksXG4gICAgICAgICAgJHRhYkxpbmsgPSAkdGFyZ2V0LmZpbmQoJ1tyb2xlPVwidGFiXCJdJyksXG4gICAgICAgICAgaGFzaCA9ICR0YWJMaW5rWzBdLmhhc2gsXG4gICAgICAgICAgJHRhcmdldENvbnRlbnQgPSB0aGlzLiR0YWJDb250ZW50LmZpbmQoaGFzaCk7XG5cbiAgICAvL2Nsb3NlIG9sZCB0YWJcbiAgICB0aGlzLl9jb2xsYXBzZVRhYigkb2xkVGFiKTtcblxuICAgIC8vb3BlbiBuZXcgdGFiXG4gICAgdGhpcy5fb3BlblRhYigkdGFyZ2V0KTtcblxuICAgIC8vZWl0aGVyIHJlcGxhY2Ugb3IgdXBkYXRlIGJyb3dzZXIgaGlzdG9yeVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmsgJiYgIWhpc3RvcnlIYW5kbGVkKSB7XG4gICAgICB2YXIgYW5jaG9yID0gJHRhcmdldC5maW5kKCdhJykuYXR0cignaHJlZicpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwZGF0ZUhpc3RvcnkpIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgc3VjY2Vzc2Z1bGx5IGNoYW5nZWQgdGFicy5cbiAgICAgKiBAZXZlbnQgVGFicyNjaGFuZ2VcbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2NoYW5nZS56Zi50YWJzJywgWyR0YXJnZXQsICR0YXJnZXRDb250ZW50XSk7XG5cbiAgICAvL2ZpcmUgdG8gY2hpbGRyZW4gYSBtdXRhdGlvbiBldmVudFxuICAgICR0YXJnZXRDb250ZW50LmZpbmQoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXIoXCJtdXRhdGVtZS56Zi50cmlnZ2VyXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSB0YWIgYCR0YXJnZXRDb250ZW50YCBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBUYWIgdG8gT3Blbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfb3BlblRhYigkdGFyZ2V0KSB7XG4gICAgICB2YXIgJHRhYkxpbmsgPSAkdGFyZ2V0LmZpbmQoJ1tyb2xlPVwidGFiXCJdJyksXG4gICAgICAgICAgaGFzaCA9ICR0YWJMaW5rWzBdLmhhc2gsXG4gICAgICAgICAgJHRhcmdldENvbnRlbnQgPSB0aGlzLiR0YWJDb250ZW50LmZpbmQoaGFzaCk7XG5cbiAgICAgICR0YXJnZXQuYWRkQ2xhc3MoYCR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKTtcblxuICAgICAgJHRhYkxpbmsuYXR0cih7J2FyaWEtc2VsZWN0ZWQnOiAndHJ1ZSd9KTtcblxuICAgICAgJHRhcmdldENvbnRlbnRcbiAgICAgICAgLmFkZENsYXNzKGAke3RoaXMub3B0aW9ucy5wYW5lbEFjdGl2ZUNsYXNzfWApXG4gICAgICAgIC5hdHRyKHsnYXJpYS1oaWRkZW4nOiAnZmFsc2UnfSk7XG4gIH1cblxuICAvKipcbiAgICogQ29sbGFwc2VzIGAkdGFyZ2V0Q29udGVudGAgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gVGFiIHRvIE9wZW4uXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgX2NvbGxhcHNlVGFiKCR0YXJnZXQpIHtcbiAgICB2YXIgJHRhcmdldF9hbmNob3IgPSAkdGFyZ2V0XG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKVxuICAgICAgLmZpbmQoJ1tyb2xlPVwidGFiXCJdJylcbiAgICAgIC5hdHRyKHsgJ2FyaWEtc2VsZWN0ZWQnOiAnZmFsc2UnIH0pO1xuXG4gICAgJChgIyR7JHRhcmdldF9hbmNob3IuYXR0cignYXJpYS1jb250cm9scycpfWApXG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7dGhpcy5vcHRpb25zLnBhbmVsQWN0aXZlQ2xhc3N9YClcbiAgICAgIC5hdHRyKHsgJ2FyaWEtaGlkZGVuJzogJ3RydWUnIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFB1YmxpYyBtZXRob2QgZm9yIHNlbGVjdGluZyBhIGNvbnRlbnQgcGFuZSB0byBkaXNwbGF5LlxuICAgKiBAcGFyYW0ge2pRdWVyeSB8IFN0cmluZ30gZWxlbSAtIGpRdWVyeSBvYmplY3Qgb3Igc3RyaW5nIG9mIHRoZSBpZCBvZiB0aGUgcGFuZSB0byBkaXNwbGF5LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGhpc3RvcnlIYW5kbGVkIC0gYnJvd3NlciBoYXMgYWxyZWFkeSBoYW5kbGVkIGEgaGlzdG9yeSB1cGRhdGVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBzZWxlY3RUYWIoZWxlbSwgaGlzdG9yeUhhbmRsZWQpIHtcbiAgICB2YXIgaWRTdHI7XG5cbiAgICBpZiAodHlwZW9mIGVsZW0gPT09ICdvYmplY3QnKSB7XG4gICAgICBpZFN0ciA9IGVsZW1bMF0uaWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlkU3RyID0gZWxlbTtcbiAgICB9XG5cbiAgICBpZiAoaWRTdHIuaW5kZXhPZignIycpIDwgMCkge1xuICAgICAgaWRTdHIgPSBgIyR7aWRTdHJ9YDtcbiAgICB9XG5cbiAgICB2YXIgJHRhcmdldCA9IHRoaXMuJHRhYlRpdGxlcy5maW5kKGBbaHJlZiQ9XCIke2lkU3RyfVwiXWApLnBhcmVudChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gKTtcblxuICAgIHRoaXMuX2hhbmRsZVRhYkNoYW5nZSgkdGFyZ2V0LCBoaXN0b3J5SGFuZGxlZCk7XG4gIH07XG4gIC8qKlxuICAgKiBTZXRzIHRoZSBoZWlnaHQgb2YgZWFjaCBwYW5lbCB0byB0aGUgaGVpZ2h0IG9mIHRoZSB0YWxsZXN0IHBhbmVsLlxuICAgKiBJZiBlbmFibGVkIGluIG9wdGlvbnMsIGdldHMgY2FsbGVkIG9uIG1lZGlhIHF1ZXJ5IGNoYW5nZS5cbiAgICogSWYgbG9hZGluZyBjb250ZW50IHZpYSBleHRlcm5hbCBzb3VyY2UsIGNhbiBiZSBjYWxsZWQgZGlyZWN0bHkgb3Igd2l0aCBfcmVmbG93LlxuICAgKiBJZiBlbmFibGVkIHdpdGggYGRhdGEtbWF0Y2gtaGVpZ2h0PVwidHJ1ZVwiYCwgdGFicyBzZXRzIHRvIGVxdWFsIGhlaWdodFxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zZXRIZWlnaHQoKSB7XG4gICAgdmFyIG1heCA9IDAsXG4gICAgICAgIF90aGlzID0gdGhpczsgLy8gTG9jayBkb3duIHRoZSBgdGhpc2AgdmFsdWUgZm9yIHRoZSByb290IHRhYnMgb2JqZWN0XG5cbiAgICB0aGlzLiR0YWJDb250ZW50XG4gICAgICAuZmluZChgLiR7dGhpcy5vcHRpb25zLnBhbmVsQ2xhc3N9YClcbiAgICAgIC5jc3MoJ2hlaWdodCcsICcnKVxuICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIHBhbmVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGlzQWN0aXZlID0gcGFuZWwuaGFzQ2xhc3MoYCR7X3RoaXMub3B0aW9ucy5wYW5lbEFjdGl2ZUNsYXNzfWApOyAvLyBnZXQgdGhlIG9wdGlvbnMgZnJvbSB0aGUgcGFyZW50IGluc3RlYWQgb2YgdHJ5aW5nIHRvIGdldCB0aGVtIGZyb20gdGhlIGNoaWxkXG5cbiAgICAgICAgaWYgKCFpc0FjdGl2ZSkge1xuICAgICAgICAgIHBhbmVsLmNzcyh7J3Zpc2liaWxpdHknOiAnaGlkZGVuJywgJ2Rpc3BsYXknOiAnYmxvY2snfSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGVtcCA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuXG4gICAgICAgIGlmICghaXNBY3RpdmUpIHtcbiAgICAgICAgICBwYW5lbC5jc3Moe1xuICAgICAgICAgICAgJ3Zpc2liaWxpdHknOiAnJyxcbiAgICAgICAgICAgICdkaXNwbGF5JzogJydcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1heCA9IHRlbXAgPiBtYXggPyB0ZW1wIDogbWF4O1xuICAgICAgfSlcbiAgICAgIC5jc3MoJ2hlaWdodCcsIGAke21heH1weGApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIGFuIHRhYnMuXG4gICAqIEBmaXJlcyBUYWJzI2Rlc3Ryb3llZFxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAuZmluZChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gKVxuICAgICAgLm9mZignLnpmLnRhYnMnKS5oaWRlKCkuZW5kKClcbiAgICAgIC5maW5kKGAuJHt0aGlzLm9wdGlvbnMucGFuZWxDbGFzc31gKVxuICAgICAgLmhpZGUoKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpIHtcbiAgICAgIGlmICh0aGlzLl9zZXRIZWlnaHRNcUhhbmRsZXIgIT0gbnVsbCkge1xuICAgICAgICAgJCh3aW5kb3cpLm9mZignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgdGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub2ZmKCdwb3BzdGF0ZScsIHRoaXMuX2NoZWNrRGVlcExpbmspO1xuICAgIH1cblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5UYWJzLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogQWxsb3dzIHRoZSB3aW5kb3cgdG8gc2Nyb2xsIHRvIGNvbnRlbnQgb2YgcGFuZSBzcGVjaWZpZWQgYnkgaGFzaCBhbmNob3JcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGRlZXBMaW5rOiBmYWxzZSxcblxuICAvKipcbiAgICogQWRqdXN0IHRoZSBkZWVwIGxpbmsgc2Nyb2xsIHRvIG1ha2Ugc3VyZSB0aGUgdG9wIG9mIHRoZSB0YWIgcGFuZWwgaXMgdmlzaWJsZVxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgZGVlcExpbmtTbXVkZ2U6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbmltYXRpb24gdGltZSAobXMpIGZvciB0aGUgZGVlcCBsaW5rIGFkanVzdG1lbnRcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCAzMDBcbiAgICovXG4gIGRlZXBMaW5rU211ZGdlRGVsYXk6IDMwMCxcblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBicm93c2VyIGhpc3Rvcnkgd2l0aCB0aGUgb3BlbiB0YWJcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHVwZGF0ZUhpc3Rvcnk6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHdpbmRvdyB0byBzY3JvbGwgdG8gY29udGVudCBvZiBhY3RpdmUgcGFuZSBvbiBsb2FkIGlmIHNldCB0byB0cnVlLlxuICAgKiBOb3QgcmVjb21tZW5kZWQgaWYgbW9yZSB0aGFuIG9uZSB0YWIgcGFuZWwgcGVyIHBhZ2UuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBhdXRvRm9jdXM6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3Mga2V5Ym9hcmQgaW5wdXQgdG8gJ3dyYXAnIGFyb3VuZCB0aGUgdGFiIGxpbmtzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICB3cmFwT25LZXlzOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHRhYiBjb250ZW50IHBhbmVzIHRvIG1hdGNoIGhlaWdodHMgaWYgc2V0IHRvIHRydWUuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBtYXRjaEhlaWdodDogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFsbG93cyBhY3RpdmUgdGFicyB0byBjb2xsYXBzZSB3aGVuIGNsaWNrZWQuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBhY3RpdmVDb2xsYXBzZTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gYGxpYCdzIGluIHRhYiBsaW5rIGxpc3QuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ3RhYnMtdGl0bGUnXG4gICAqL1xuICBsaW5rQ2xhc3M6ICd0YWJzLXRpdGxlJyxcblxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYWN0aXZlIGBsaWAgaW4gdGFiIGxpbmsgbGlzdC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAnaXMtYWN0aXZlJ1xuICAgKi9cbiAgbGlua0FjdGl2ZUNsYXNzOiAnaXMtYWN0aXZlJyxcblxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgY29udGVudCBjb250YWluZXJzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICd0YWJzLXBhbmVsJ1xuICAgKi9cbiAgcGFuZWxDbGFzczogJ3RhYnMtcGFuZWwnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBhY3RpdmUgY29udGVudCBjb250YWluZXIuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ2lzLWFjdGl2ZSdcbiAgICovXG4gIHBhbmVsQWN0aXZlQ2xhc3M6ICdpcy1hY3RpdmUnXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oVGFicywgJ1RhYnMnKTtcblxufShqUXVlcnkpO1xuIiwidmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICAgICh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoZXhwb3J0cykpID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDogdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDogZ2xvYmFsLkxhenlMb2FkID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBkZWZhdWx0U2V0dGluZ3MgPSB7XG4gICAgICAgIGVsZW1lbnRzX3NlbGVjdG9yOiBcImltZ1wiLFxuICAgICAgICBjb250YWluZXI6IHdpbmRvdyxcbiAgICAgICAgdGhyZXNob2xkOiAzMDAsXG4gICAgICAgIHRocm90dGxlOiAxNTAsXG4gICAgICAgIGRhdGFfc3JjOiBcIm9yaWdpbmFsXCIsXG4gICAgICAgIGRhdGFfc3Jjc2V0OiBcIm9yaWdpbmFsU2V0XCIsXG4gICAgICAgIGNsYXNzX2xvYWRpbmc6IFwibG9hZGluZ1wiLFxuICAgICAgICBjbGFzc19sb2FkZWQ6IFwibG9hZGVkXCIsXG4gICAgICAgIGNsYXNzX2Vycm9yOiBcImVycm9yXCIsXG4gICAgICAgIGNsYXNzX2luaXRpYWw6IFwiaW5pdGlhbFwiLFxuICAgICAgICBza2lwX2ludmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgY2FsbGJhY2tfbG9hZDogbnVsbCxcbiAgICAgICAgY2FsbGJhY2tfZXJyb3I6IG51bGwsXG4gICAgICAgIGNhbGxiYWNrX3NldDogbnVsbCxcbiAgICAgICAgY2FsbGJhY2tfcHJvY2Vzc2VkOiBudWxsXG4gICAgfTtcblxuICAgIHZhciBpc0JvdCA9ICEoXCJvbnNjcm9sbFwiIGluIHdpbmRvdykgfHwgL2dsZWJvdC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcblxuICAgIHZhciBjYWxsQ2FsbGJhY2sgPSBmdW5jdGlvbiBjYWxsQ2FsbGJhY2soY2FsbGJhY2ssIGFyZ3VtZW50KSB7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soYXJndW1lbnQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBnZXRUb3BPZmZzZXQgPSBmdW5jdGlvbiBnZXRUb3BPZmZzZXQoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgKyB3aW5kb3cucGFnZVlPZmZzZXQgLSBlbGVtZW50Lm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFRvcDtcbiAgICB9O1xuXG4gICAgdmFyIGlzQmVsb3dWaWV3cG9ydCA9IGZ1bmN0aW9uIGlzQmVsb3dWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkge1xuICAgICAgICB2YXIgZm9sZCA9IGNvbnRhaW5lciA9PT0gd2luZG93ID8gd2luZG93LmlubmVySGVpZ2h0ICsgd2luZG93LnBhZ2VZT2Zmc2V0IDogZ2V0VG9wT2Zmc2V0KGNvbnRhaW5lcikgKyBjb250YWluZXIub2Zmc2V0SGVpZ2h0O1xuICAgICAgICByZXR1cm4gZm9sZCA8PSBnZXRUb3BPZmZzZXQoZWxlbWVudCkgLSB0aHJlc2hvbGQ7XG4gICAgfTtcblxuICAgIHZhciBnZXRMZWZ0T2Zmc2V0ID0gZnVuY3Rpb24gZ2V0TGVmdE9mZnNldChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgKyB3aW5kb3cucGFnZVhPZmZzZXQgLSBlbGVtZW50Lm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudExlZnQ7XG4gICAgfTtcblxuICAgIHZhciBpc0F0UmlnaHRPZlZpZXdwb3J0ID0gZnVuY3Rpb24gaXNBdFJpZ2h0T2ZWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkge1xuICAgICAgICB2YXIgZG9jdW1lbnRXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICB2YXIgZm9sZCA9IGNvbnRhaW5lciA9PT0gd2luZG93ID8gZG9jdW1lbnRXaWR0aCArIHdpbmRvdy5wYWdlWE9mZnNldCA6IGdldExlZnRPZmZzZXQoY29udGFpbmVyKSArIGRvY3VtZW50V2lkdGg7XG4gICAgICAgIHJldHVybiBmb2xkIDw9IGdldExlZnRPZmZzZXQoZWxlbWVudCkgLSB0aHJlc2hvbGQ7XG4gICAgfTtcblxuICAgIHZhciBpc0Fib3ZlVmlld3BvcnQgPSBmdW5jdGlvbiBpc0Fib3ZlVmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpIHtcbiAgICAgICAgdmFyIGZvbGQgPSBjb250YWluZXIgPT09IHdpbmRvdyA/IHdpbmRvdy5wYWdlWU9mZnNldCA6IGdldFRvcE9mZnNldChjb250YWluZXIpO1xuICAgICAgICByZXR1cm4gZm9sZCA+PSBnZXRUb3BPZmZzZXQoZWxlbWVudCkgKyB0aHJlc2hvbGQgKyBlbGVtZW50Lm9mZnNldEhlaWdodDtcbiAgICB9O1xuXG4gICAgdmFyIGlzQXRMZWZ0T2ZWaWV3cG9ydCA9IGZ1bmN0aW9uIGlzQXRMZWZ0T2ZWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkge1xuICAgICAgICB2YXIgZm9sZCA9IGNvbnRhaW5lciA9PT0gd2luZG93ID8gd2luZG93LnBhZ2VYT2Zmc2V0IDogZ2V0TGVmdE9mZnNldChjb250YWluZXIpO1xuICAgICAgICByZXR1cm4gZm9sZCA+PSBnZXRMZWZ0T2Zmc2V0KGVsZW1lbnQpICsgdGhyZXNob2xkICsgZWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICB9O1xuXG4gICAgdmFyIGlzSW5zaWRlVmlld3BvcnQgPSBmdW5jdGlvbiBpc0luc2lkZVZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSB7XG4gICAgICAgIHJldHVybiAhaXNCZWxvd1ZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSAmJiAhaXNBYm92ZVZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSAmJiAhaXNBdFJpZ2h0T2ZWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkgJiYgIWlzQXRMZWZ0T2ZWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCk7XG4gICAgfTtcblxuICAgIC8qIENyZWF0ZXMgaW5zdGFuY2UgYW5kIG5vdGlmaWVzIGl0IHRocm91Z2ggdGhlIHdpbmRvdyBlbGVtZW50ICovXG4gICAgdmFyIGNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoY2xhc3NPYmosIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gbmV3IGNsYXNzT2JqKG9wdGlvbnMpO1xuICAgICAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoXCJMYXp5TG9hZDo6SW5pdGlhbGl6ZWRcIiwgeyBkZXRhaWw6IHsgaW5zdGFuY2U6IGluc3RhbmNlIH0gfSk7XG4gICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICB9O1xuXG4gICAgLyogQXV0byBpbml0aWFsaXphdGlvbiBvZiBvbmUgb3IgbW9yZSBpbnN0YW5jZXMgb2YgbGF6eWxvYWQsIGRlcGVuZGluZyBvbiB0aGUgXG4gICAgICAgIG9wdGlvbnMgcGFzc2VkIGluIChwbGFpbiBvYmplY3Qgb3IgYW4gYXJyYXkpICovXG4gICAgdmFyIGF1dG9Jbml0aWFsaXplID0gZnVuY3Rpb24gYXV0b0luaXRpYWxpemUoY2xhc3NPYmosIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG9wdHNMZW5ndGggPSBvcHRpb25zLmxlbmd0aDtcbiAgICAgICAgaWYgKCFvcHRzTGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBQbGFpbiBvYmplY3RcbiAgICAgICAgICAgIGNyZWF0ZUluc3RhbmNlKGNsYXNzT2JqLCBvcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEFycmF5IG9mIG9iamVjdHNcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3B0c0xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlSW5zdGFuY2UoY2xhc3NPYmosIG9wdGlvbnNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzZXRTb3VyY2VzRm9yUGljdHVyZSA9IGZ1bmN0aW9uIHNldFNvdXJjZXNGb3JQaWN0dXJlKGVsZW1lbnQsIHNyY3NldERhdGFBdHRyaWJ1dGUpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgaWYgKHBhcmVudC50YWdOYW1lICE9PSBcIlBJQ1RVUkVcIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyZW50LmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGljdHVyZUNoaWxkID0gcGFyZW50LmNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgaWYgKHBpY3R1cmVDaGlsZC50YWdOYW1lID09PSBcIlNPVVJDRVwiKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNvdXJjZVNyY3NldCA9IHBpY3R1cmVDaGlsZC5kYXRhc2V0W3NyY3NldERhdGFBdHRyaWJ1dGVdO1xuICAgICAgICAgICAgICAgIGlmIChzb3VyY2VTcmNzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZUNoaWxkLnNldEF0dHJpYnV0ZShcInNyY3NldFwiLCBzb3VyY2VTcmNzZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc2V0U291cmNlcyA9IGZ1bmN0aW9uIHNldFNvdXJjZXMoZWxlbWVudCwgc3Jjc2V0RGF0YUF0dHJpYnV0ZSwgc3JjRGF0YUF0dHJpYnV0ZSkge1xuICAgICAgICB2YXIgdGFnTmFtZSA9IGVsZW1lbnQudGFnTmFtZTtcbiAgICAgICAgdmFyIGVsZW1lbnRTcmMgPSBlbGVtZW50LmRhdGFzZXRbc3JjRGF0YUF0dHJpYnV0ZV07XG4gICAgICAgIGlmICh0YWdOYW1lID09PSBcIklNR1wiKSB7XG4gICAgICAgICAgICBzZXRTb3VyY2VzRm9yUGljdHVyZShlbGVtZW50LCBzcmNzZXREYXRhQXR0cmlidXRlKTtcbiAgICAgICAgICAgIHZhciBpbWdTcmNzZXQgPSBlbGVtZW50LmRhdGFzZXRbc3Jjc2V0RGF0YUF0dHJpYnV0ZV07XG4gICAgICAgICAgICBpZiAoaW1nU3Jjc2V0KSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJzcmNzZXRcIiwgaW1nU3Jjc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbGVtZW50U3JjKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgZWxlbWVudFNyYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZ05hbWUgPT09IFwiSUZSQU1FXCIpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50U3JjKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgZWxlbWVudFNyYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnRTcmMpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoXCIgKyBlbGVtZW50U3JjICsgXCIpXCI7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqL1xuXG4gICAgdmFyIExhenlMb2FkID0gZnVuY3Rpb24gTGF6eUxvYWQoaW5zdGFuY2VTZXR0aW5ncykge1xuICAgICAgICB0aGlzLl9zZXR0aW5ncyA9IF9leHRlbmRzKHt9LCBkZWZhdWx0U2V0dGluZ3MsIGluc3RhbmNlU2V0dGluZ3MpO1xuICAgICAgICB0aGlzLl9xdWVyeU9yaWdpbk5vZGUgPSB0aGlzLl9zZXR0aW5ncy5jb250YWluZXIgPT09IHdpbmRvdyA/IGRvY3VtZW50IDogdGhpcy5fc2V0dGluZ3MuY29udGFpbmVyO1xuXG4gICAgICAgIHRoaXMuX3ByZXZpb3VzTG9vcFRpbWUgPSAwO1xuICAgICAgICB0aGlzLl9sb29wVGltZW91dCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2JvdW5kSGFuZGxlU2Nyb2xsID0gdGhpcy5oYW5kbGVTY3JvbGwuYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLl9pc0ZpcnN0TG9vcCA9IHRydWU7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuX2JvdW5kSGFuZGxlU2Nyb2xsKTtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9O1xuXG4gICAgTGF6eUxvYWQucHJvdG90eXBlID0ge1xuXG4gICAgICAgIC8qXG4gICAgICAgICAqIFByaXZhdGUgbWV0aG9kc1xuICAgICAgICAgKi9cblxuICAgICAgICBfcmV2ZWFsOiBmdW5jdGlvbiBfcmV2ZWFsKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBzZXR0aW5ncyA9IHRoaXMuX3NldHRpbmdzO1xuXG4gICAgICAgICAgICB2YXIgZXJyb3JDYWxsYmFjayA9IGZ1bmN0aW9uIGVycm9yQ2FsbGJhY2soKSB7XG4gICAgICAgICAgICAgICAgLyogQXMgdGhpcyBtZXRob2QgaXMgYXN5bmNocm9ub3VzLCBpdCBtdXN0IGJlIHByb3RlY3RlZCBhZ2FpbnN0IGV4dGVybmFsIGRlc3Ryb3koKSBjYWxscyAqL1xuICAgICAgICAgICAgICAgIGlmICghc2V0dGluZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGxvYWRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZXJyb3JDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHNldHRpbmdzLmNsYXNzX2xvYWRpbmcpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChzZXR0aW5ncy5jbGFzc19lcnJvcik7XG4gICAgICAgICAgICAgICAgY2FsbENhbGxiYWNrKHNldHRpbmdzLmNhbGxiYWNrX2Vycm9yLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBsb2FkQ2FsbGJhY2sgPSBmdW5jdGlvbiBsb2FkQ2FsbGJhY2soKSB7XG4gICAgICAgICAgICAgICAgLyogQXMgdGhpcyBtZXRob2QgaXMgYXN5bmNocm9ub3VzLCBpdCBtdXN0IGJlIHByb3RlY3RlZCBhZ2FpbnN0IGV4dGVybmFsIGRlc3Ryb3koKSBjYWxscyAqL1xuICAgICAgICAgICAgICAgIGlmICghc2V0dGluZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoc2V0dGluZ3MuY2xhc3NfbG9hZGluZyk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKHNldHRpbmdzLmNsYXNzX2xvYWRlZCk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLCBsb2FkQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGVycm9yQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIC8qIENhbGxpbmcgTE9BRCBjYWxsYmFjayAqL1xuICAgICAgICAgICAgICAgIGNhbGxDYWxsYmFjayhzZXR0aW5ncy5jYWxsYmFja19sb2FkLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09IFwiSU1HXCIgfHwgZWxlbWVudC50YWdOYW1lID09PSBcIklGUkFNRVwiKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBsb2FkQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGVycm9yQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChzZXR0aW5ncy5jbGFzc19sb2FkaW5nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2V0U291cmNlcyhlbGVtZW50LCBzZXR0aW5ncy5kYXRhX3NyY3NldCwgc2V0dGluZ3MuZGF0YV9zcmMpO1xuICAgICAgICAgICAgLyogQ2FsbGluZyBTRVQgY2FsbGJhY2sgKi9cbiAgICAgICAgICAgIGNhbGxDYWxsYmFjayhzZXR0aW5ncy5jYWxsYmFja19zZXQsIGVsZW1lbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9sb29wVGhyb3VnaEVsZW1lbnRzOiBmdW5jdGlvbiBfbG9vcFRocm91Z2hFbGVtZW50cygpIHtcbiAgICAgICAgICAgIHZhciBzZXR0aW5ncyA9IHRoaXMuX3NldHRpbmdzLFxuICAgICAgICAgICAgICAgIGVsZW1lbnRzID0gdGhpcy5fZWxlbWVudHMsXG4gICAgICAgICAgICAgICAgZWxlbWVudHNMZW5ndGggPSAhZWxlbWVudHMgPyAwIDogZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGkgPSB2b2lkIDAsXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2VkSW5kZXhlcyA9IFtdLFxuICAgICAgICAgICAgICAgIGZpcnN0TG9vcCA9IHRoaXMuX2lzRmlyc3RMb29wO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZWxlbWVudHNMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZWxlbWVudHNbaV07XG4gICAgICAgICAgICAgICAgLyogSWYgbXVzdCBza2lwX2ludmlzaWJsZSBhbmQgZWxlbWVudCBpcyBpbnZpc2libGUsIHNraXAgaXQgKi9cbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3Muc2tpcF9pbnZpc2libGUgJiYgZWxlbWVudC5vZmZzZXRQYXJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGlzQm90IHx8IGlzSW5zaWRlVmlld3BvcnQoZWxlbWVudCwgc2V0dGluZ3MuY29udGFpbmVyLCBzZXR0aW5ncy50aHJlc2hvbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaXJzdExvb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChzZXR0aW5ncy5jbGFzc19pbml0aWFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvKiBTdGFydCBsb2FkaW5nIHRoZSBpbWFnZSAqL1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXZlYWwoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIC8qIE1hcmtpbmcgdGhlIGVsZW1lbnQgYXMgcHJvY2Vzc2VkLiAqL1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWRJbmRleGVzLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZGF0YXNldC53YXNQcm9jZXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIFJlbW92aW5nIHByb2Nlc3NlZCBlbGVtZW50cyBmcm9tIHRoaXMuX2VsZW1lbnRzLiAqL1xuICAgICAgICAgICAgd2hpbGUgKHByb2Nlc3NlZEluZGV4ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzLnNwbGljZShwcm9jZXNzZWRJbmRleGVzLnBvcCgpLCAxKTtcbiAgICAgICAgICAgICAgICAvKiBDYWxsaW5nIHRoZSBlbmQgbG9vcCBjYWxsYmFjayAqL1xuICAgICAgICAgICAgICAgIGNhbGxDYWxsYmFjayhzZXR0aW5ncy5jYWxsYmFja19wcm9jZXNzZWQsIGVsZW1lbnRzLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBTdG9wIGxpc3RlbmluZyB0byBzY3JvbGwgZXZlbnQgd2hlbiAwIGVsZW1lbnRzIHJlbWFpbnMgKi9cbiAgICAgICAgICAgIGlmIChlbGVtZW50c0xlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0b3BTY3JvbGxIYW5kbGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBTZXRzIGlzRmlyc3RMb29wIHRvIGZhbHNlICovXG4gICAgICAgICAgICBpZiAoZmlyc3RMb29wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNGaXJzdExvb3AgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfcHVyZ2VFbGVtZW50czogZnVuY3Rpb24gX3B1cmdlRWxlbWVudHMoKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSB0aGlzLl9lbGVtZW50cyxcbiAgICAgICAgICAgICAgICBlbGVtZW50c0xlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBpID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIGVsZW1lbnRzVG9QdXJnZSA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZWxlbWVudHNMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZWxlbWVudHNbaV07XG4gICAgICAgICAgICAgICAgLyogSWYgdGhlIGVsZW1lbnQgaGFzIGFscmVhZHkgYmVlbiBwcm9jZXNzZWQsIHNraXAgaXQgKi9cbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5kYXRhc2V0Lndhc1Byb2Nlc3NlZCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1RvUHVyZ2UucHVzaChpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBSZW1vdmluZyBlbGVtZW50cyB0byBwdXJnZSBmcm9tIHRoaXMuX2VsZW1lbnRzLiAqL1xuICAgICAgICAgICAgd2hpbGUgKGVsZW1lbnRzVG9QdXJnZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudHMuc3BsaWNlKGVsZW1lbnRzVG9QdXJnZS5wb3AoKSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3N0YXJ0U2Nyb2xsSGFuZGxlcjogZnVuY3Rpb24gX3N0YXJ0U2Nyb2xsSGFuZGxlcigpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNIYW5kbGluZ1Njcm9sbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzSGFuZGxpbmdTY3JvbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldHRpbmdzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHRoaXMuX2JvdW5kSGFuZGxlU2Nyb2xsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfc3RvcFNjcm9sbEhhbmRsZXI6IGZ1bmN0aW9uIF9zdG9wU2Nyb2xsSGFuZGxlcigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0hhbmRsaW5nU2Nyb2xsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNIYW5kbGluZ1Njcm9sbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldHRpbmdzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHRoaXMuX2JvdW5kSGFuZGxlU2Nyb2xsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKiBcbiAgICAgICAgICogUHVibGljIG1ldGhvZHNcbiAgICAgICAgICovXG5cbiAgICAgICAgaGFuZGxlU2Nyb2xsOiBmdW5jdGlvbiBoYW5kbGVTY3JvbGwoKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgdGhyb3R0bGUgPSB0aGlzLl9zZXR0aW5ncy50aHJvdHRsZTtcblxuICAgICAgICAgICAgaWYgKHRocm90dGxlICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdldFRpbWUgPSBmdW5jdGlvbiBnZXRUaW1lKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHZhciBub3cgPSBnZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZW1haW5pbmdUaW1lID0gdGhyb3R0bGUgLSAobm93IC0gX3RoaXMuX3ByZXZpb3VzTG9vcFRpbWUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVtYWluaW5nVGltZSA8PSAwIHx8IHJlbWFpbmluZ1RpbWUgPiB0aHJvdHRsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF90aGlzLl9sb29wVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChfdGhpcy5fbG9vcFRpbWVvdXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9sb29wVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5fcHJldmlvdXNMb29wVGltZSA9IG5vdztcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9sb29wVGhyb3VnaEVsZW1lbnRzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIV90aGlzLl9sb29wVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuX2xvb3BUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHJldmlvdXNMb29wVGltZSA9IGdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb29wVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9vcFRocm91Z2hFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKF90aGlzKSwgcmVtYWluaW5nVGltZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb29wVGhyb3VnaEVsZW1lbnRzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICAvLyBDb252ZXJ0cyB0byBhcnJheSB0aGUgbm9kZXNldCBvYnRhaW5lZCBxdWVyeWluZyB0aGUgRE9NIGZyb20gX3F1ZXJ5T3JpZ2luTm9kZSB3aXRoIGVsZW1lbnRzX3NlbGVjdG9yXG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50cyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX3F1ZXJ5T3JpZ2luTm9kZS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuX3NldHRpbmdzLmVsZW1lbnRzX3NlbGVjdG9yKSk7XG4gICAgICAgICAgICB0aGlzLl9wdXJnZUVsZW1lbnRzKCk7XG4gICAgICAgICAgICB0aGlzLl9sb29wVGhyb3VnaEVsZW1lbnRzKCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydFNjcm9sbEhhbmRsZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5fYm91bmRIYW5kbGVTY3JvbGwpO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2xvb3BUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2xvb3BUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb29wVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9zdG9wU2Nyb2xsSGFuZGxlcigpO1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudHMgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fcXVlcnlPcmlnaW5Ob2RlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3NldHRpbmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKiBBdXRvbWF0aWMgaW5zdGFuY2VzIGNyZWF0aW9uIGlmIHJlcXVpcmVkICh1c2VmdWwgZm9yIGFzeW5jIHNjcmlwdCBsb2FkaW5nISkgKi9cbiAgICB2YXIgYXV0b0luaXRPcHRpb25zID0gd2luZG93LmxhenlMb2FkT3B0aW9ucztcbiAgICBpZiAoYXV0b0luaXRPcHRpb25zKSB7XG4gICAgICAgIGF1dG9Jbml0aWFsaXplKExhenlMb2FkLCBhdXRvSW5pdE9wdGlvbnMpO1xuICAgIH1cblxuICAgIHJldHVybiBMYXp5TG9hZDtcbn0pO1xuIiwiLyohXG4gKiBGbGlja2l0eSBQQUNLQUdFRCB2Mi4wLjVcbiAqIFRvdWNoLCByZXNwb25zaXZlLCBmbGlja2FibGUgY2Fyb3VzZWxzXG4gKlxuICogTGljZW5zZWQgR1BMdjMgZm9yIG9wZW4gc291cmNlIHVzZVxuICogb3IgRmxpY2tpdHkgQ29tbWVyY2lhbCBMaWNlbnNlIGZvciBjb21tZXJjaWFsIHVzZVxuICpcbiAqIGh0dHA6Ly9mbGlja2l0eS5tZXRhZml6enkuY29cbiAqIENvcHlyaWdodCAyMDE2IE1ldGFmaXp6eVxuICovXG5cbiFmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJqcXVlcnktYnJpZGdldC9qcXVlcnktYnJpZGdldFwiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJqcXVlcnlcIikpOnQualF1ZXJ5QnJpZGdldD1lKHQsdC5qUXVlcnkpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBpKGksbyxhKXtmdW5jdGlvbiBsKHQsZSxuKXt2YXIgcyxvPVwiJCgpLlwiK2krJyhcIicrZSsnXCIpJztyZXR1cm4gdC5lYWNoKGZ1bmN0aW9uKHQsbCl7dmFyIGg9YS5kYXRhKGwsaSk7aWYoIWgpcmV0dXJuIHZvaWQgcihpK1wiIG5vdCBpbml0aWFsaXplZC4gQ2Fubm90IGNhbGwgbWV0aG9kcywgaS5lLiBcIitvKTt2YXIgYz1oW2VdO2lmKCFjfHxcIl9cIj09ZS5jaGFyQXQoMCkpcmV0dXJuIHZvaWQgcihvK1wiIGlzIG5vdCBhIHZhbGlkIG1ldGhvZFwiKTt2YXIgZD1jLmFwcGx5KGgsbik7cz12b2lkIDA9PT1zP2Q6c30pLHZvaWQgMCE9PXM/czp0fWZ1bmN0aW9uIGgodCxlKXt0LmVhY2goZnVuY3Rpb24odCxuKXt2YXIgcz1hLmRhdGEobixpKTtzPyhzLm9wdGlvbihlKSxzLl9pbml0KCkpOihzPW5ldyBvKG4sZSksYS5kYXRhKG4saSxzKSl9KX1hPWF8fGV8fHQualF1ZXJ5LGEmJihvLnByb3RvdHlwZS5vcHRpb258fChvLnByb3RvdHlwZS5vcHRpb249ZnVuY3Rpb24odCl7YS5pc1BsYWluT2JqZWN0KHQpJiYodGhpcy5vcHRpb25zPWEuZXh0ZW5kKCEwLHRoaXMub3B0aW9ucyx0KSl9KSxhLmZuW2ldPWZ1bmN0aW9uKHQpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXt2YXIgZT1zLmNhbGwoYXJndW1lbnRzLDEpO3JldHVybiBsKHRoaXMsdCxlKX1yZXR1cm4gaCh0aGlzLHQpLHRoaXN9LG4oYSkpfWZ1bmN0aW9uIG4odCl7IXR8fHQmJnQuYnJpZGdldHx8KHQuYnJpZGdldD1pKX12YXIgcz1BcnJheS5wcm90b3R5cGUuc2xpY2Usbz10LmNvbnNvbGUscj1cInVuZGVmaW5lZFwiPT10eXBlb2Ygbz9mdW5jdGlvbigpe306ZnVuY3Rpb24odCl7by5lcnJvcih0KX07cmV0dXJuIG4oZXx8dC5qUXVlcnkpLGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIixlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKCk6dC5FdkVtaXR0ZXI9ZSgpfShcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P3dpbmRvdzp0aGlzLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCgpe312YXIgZT10LnByb3RvdHlwZTtyZXR1cm4gZS5vbj1mdW5jdGlvbih0LGUpe2lmKHQmJmUpe3ZhciBpPXRoaXMuX2V2ZW50cz10aGlzLl9ldmVudHN8fHt9LG49aVt0XT1pW3RdfHxbXTtyZXR1cm4gbi5pbmRleE9mKGUpPT0tMSYmbi5wdXNoKGUpLHRoaXN9fSxlLm9uY2U9ZnVuY3Rpb24odCxlKXtpZih0JiZlKXt0aGlzLm9uKHQsZSk7dmFyIGk9dGhpcy5fb25jZUV2ZW50cz10aGlzLl9vbmNlRXZlbnRzfHx7fSxuPWlbdF09aVt0XXx8e307cmV0dXJuIG5bZV09ITAsdGhpc319LGUub2ZmPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZXZlbnRzJiZ0aGlzLl9ldmVudHNbdF07aWYoaSYmaS5sZW5ndGgpe3ZhciBuPWkuaW5kZXhPZihlKTtyZXR1cm4gbiE9LTEmJmkuc3BsaWNlKG4sMSksdGhpc319LGUuZW1pdEV2ZW50PWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZXZlbnRzJiZ0aGlzLl9ldmVudHNbdF07aWYoaSYmaS5sZW5ndGgpe3ZhciBuPTAscz1pW25dO2U9ZXx8W107Zm9yKHZhciBvPXRoaXMuX29uY2VFdmVudHMmJnRoaXMuX29uY2VFdmVudHNbdF07czspe3ZhciByPW8mJm9bc107ciYmKHRoaXMub2ZmKHQscyksZGVsZXRlIG9bc10pLHMuYXBwbHkodGhpcyxlKSxuKz1yPzA6MSxzPWlbbl19cmV0dXJuIHRoaXN9fSx0fSksZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZ2V0LXNpemUvZ2V0LXNpemVcIixbXSxmdW5jdGlvbigpe3JldHVybiBlKCl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKCk6dC5nZXRTaXplPWUoKX0od2luZG93LGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KXt2YXIgZT1wYXJzZUZsb2F0KHQpLGk9dC5pbmRleE9mKFwiJVwiKT09LTEmJiFpc05hTihlKTtyZXR1cm4gaSYmZX1mdW5jdGlvbiBlKCl7fWZ1bmN0aW9uIGkoKXtmb3IodmFyIHQ9e3dpZHRoOjAsaGVpZ2h0OjAsaW5uZXJXaWR0aDowLGlubmVySGVpZ2h0OjAsb3V0ZXJXaWR0aDowLG91dGVySGVpZ2h0OjB9LGU9MDtlPGg7ZSsrKXt2YXIgaT1sW2VdO3RbaV09MH1yZXR1cm4gdH1mdW5jdGlvbiBuKHQpe3ZhciBlPWdldENvbXB1dGVkU3R5bGUodCk7cmV0dXJuIGV8fGEoXCJTdHlsZSByZXR1cm5lZCBcIitlK1wiLiBBcmUgeW91IHJ1bm5pbmcgdGhpcyBjb2RlIGluIGEgaGlkZGVuIGlmcmFtZSBvbiBGaXJlZm94PyBTZWUgaHR0cDovL2JpdC5seS9nZXRzaXplYnVnMVwiKSxlfWZ1bmN0aW9uIHMoKXtpZighYyl7Yz0hMDt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2Uuc3R5bGUud2lkdGg9XCIyMDBweFwiLGUuc3R5bGUucGFkZGluZz1cIjFweCAycHggM3B4IDRweFwiLGUuc3R5bGUuYm9yZGVyU3R5bGU9XCJzb2xpZFwiLGUuc3R5bGUuYm9yZGVyV2lkdGg9XCIxcHggMnB4IDNweCA0cHhcIixlLnN0eWxlLmJveFNpemluZz1cImJvcmRlci1ib3hcIjt2YXIgaT1kb2N1bWVudC5ib2R5fHxkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7aS5hcHBlbmRDaGlsZChlKTt2YXIgcz1uKGUpO28uaXNCb3hTaXplT3V0ZXI9cj0yMDA9PXQocy53aWR0aCksaS5yZW1vdmVDaGlsZChlKX19ZnVuY3Rpb24gbyhlKXtpZihzKCksXCJzdHJpbmdcIj09dHlwZW9mIGUmJihlPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZSkpLGUmJlwib2JqZWN0XCI9PXR5cGVvZiBlJiZlLm5vZGVUeXBlKXt2YXIgbz1uKGUpO2lmKFwibm9uZVwiPT1vLmRpc3BsYXkpcmV0dXJuIGkoKTt2YXIgYT17fTthLndpZHRoPWUub2Zmc2V0V2lkdGgsYS5oZWlnaHQ9ZS5vZmZzZXRIZWlnaHQ7Zm9yKHZhciBjPWEuaXNCb3JkZXJCb3g9XCJib3JkZXItYm94XCI9PW8uYm94U2l6aW5nLGQ9MDtkPGg7ZCsrKXt2YXIgdT1sW2RdLGY9b1t1XSxwPXBhcnNlRmxvYXQoZik7YVt1XT1pc05hTihwKT8wOnB9dmFyIHY9YS5wYWRkaW5nTGVmdCthLnBhZGRpbmdSaWdodCxnPWEucGFkZGluZ1RvcCthLnBhZGRpbmdCb3R0b20sbT1hLm1hcmdpbkxlZnQrYS5tYXJnaW5SaWdodCx5PWEubWFyZ2luVG9wK2EubWFyZ2luQm90dG9tLFM9YS5ib3JkZXJMZWZ0V2lkdGgrYS5ib3JkZXJSaWdodFdpZHRoLEU9YS5ib3JkZXJUb3BXaWR0aCthLmJvcmRlckJvdHRvbVdpZHRoLGI9YyYmcix4PXQoby53aWR0aCk7eCE9PSExJiYoYS53aWR0aD14KyhiPzA6ditTKSk7dmFyIEM9dChvLmhlaWdodCk7cmV0dXJuIEMhPT0hMSYmKGEuaGVpZ2h0PUMrKGI/MDpnK0UpKSxhLmlubmVyV2lkdGg9YS53aWR0aC0oditTKSxhLmlubmVySGVpZ2h0PWEuaGVpZ2h0LShnK0UpLGEub3V0ZXJXaWR0aD1hLndpZHRoK20sYS5vdXRlckhlaWdodD1hLmhlaWdodCt5LGF9fXZhciByLGE9XCJ1bmRlZmluZWRcIj09dHlwZW9mIGNvbnNvbGU/ZTpmdW5jdGlvbih0KXtjb25zb2xlLmVycm9yKHQpfSxsPVtcInBhZGRpbmdMZWZ0XCIsXCJwYWRkaW5nUmlnaHRcIixcInBhZGRpbmdUb3BcIixcInBhZGRpbmdCb3R0b21cIixcIm1hcmdpbkxlZnRcIixcIm1hcmdpblJpZ2h0XCIsXCJtYXJnaW5Ub3BcIixcIm1hcmdpbkJvdHRvbVwiLFwiYm9yZGVyTGVmdFdpZHRoXCIsXCJib3JkZXJSaWdodFdpZHRoXCIsXCJib3JkZXJUb3BXaWR0aFwiLFwiYm9yZGVyQm90dG9tV2lkdGhcIl0saD1sLmxlbmd0aCxjPSExO3JldHVybiBvfSksZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZGVzYW5kcm8tbWF0Y2hlcy1zZWxlY3Rvci9tYXRjaGVzLXNlbGVjdG9yXCIsZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSgpOnQubWF0Y2hlc1NlbGVjdG9yPWUoKX0od2luZG93LGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24oKXt2YXIgdD1FbGVtZW50LnByb3RvdHlwZTtpZih0Lm1hdGNoZXMpcmV0dXJuXCJtYXRjaGVzXCI7aWYodC5tYXRjaGVzU2VsZWN0b3IpcmV0dXJuXCJtYXRjaGVzU2VsZWN0b3JcIjtmb3IodmFyIGU9W1wid2Via2l0XCIsXCJtb3pcIixcIm1zXCIsXCJvXCJdLGk9MDtpPGUubGVuZ3RoO2krKyl7dmFyIG49ZVtpXSxzPW4rXCJNYXRjaGVzU2VsZWN0b3JcIjtpZih0W3NdKXJldHVybiBzfX0oKTtyZXR1cm4gZnVuY3Rpb24oZSxpKXtyZXR1cm4gZVt0XShpKX19KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmaXp6eS11aS11dGlscy91dGlsc1wiLFtcImRlc2FuZHJvLW1hdGNoZXMtc2VsZWN0b3IvbWF0Y2hlcy1zZWxlY3RvclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJkZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yXCIpKTp0LmZpenp5VUlVdGlscz1lKHQsdC5tYXRjaGVzU2VsZWN0b3IpfSh3aW5kb3csZnVuY3Rpb24odCxlKXt2YXIgaT17fTtpLmV4dGVuZD1mdW5jdGlvbih0LGUpe2Zvcih2YXIgaSBpbiBlKXRbaV09ZVtpXTtyZXR1cm4gdH0saS5tb2R1bG89ZnVuY3Rpb24odCxlKXtyZXR1cm4odCVlK2UpJWV9LGkubWFrZUFycmF5PWZ1bmN0aW9uKHQpe3ZhciBlPVtdO2lmKEFycmF5LmlzQXJyYXkodCkpZT10O2Vsc2UgaWYodCYmXCJudW1iZXJcIj09dHlwZW9mIHQubGVuZ3RoKWZvcih2YXIgaT0wO2k8dC5sZW5ndGg7aSsrKWUucHVzaCh0W2ldKTtlbHNlIGUucHVzaCh0KTtyZXR1cm4gZX0saS5yZW1vdmVGcm9tPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dC5pbmRleE9mKGUpO2khPS0xJiZ0LnNwbGljZShpLDEpfSxpLmdldFBhcmVudD1mdW5jdGlvbih0LGkpe2Zvcig7dCE9ZG9jdW1lbnQuYm9keTspaWYodD10LnBhcmVudE5vZGUsZSh0LGkpKXJldHVybiB0fSxpLmdldFF1ZXJ5RWxlbWVudD1mdW5jdGlvbih0KXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdD9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHQpOnR9LGkuaGFuZGxlRXZlbnQ9ZnVuY3Rpb24odCl7dmFyIGU9XCJvblwiK3QudHlwZTt0aGlzW2VdJiZ0aGlzW2VdKHQpfSxpLmZpbHRlckZpbmRFbGVtZW50cz1mdW5jdGlvbih0LG4pe3Q9aS5tYWtlQXJyYXkodCk7dmFyIHM9W107cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0KXtpZih0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpe2lmKCFuKXJldHVybiB2b2lkIHMucHVzaCh0KTtlKHQsbikmJnMucHVzaCh0KTtmb3IodmFyIGk9dC5xdWVyeVNlbGVjdG9yQWxsKG4pLG89MDtvPGkubGVuZ3RoO28rKylzLnB1c2goaVtvXSl9fSksc30saS5kZWJvdW5jZU1ldGhvZD1mdW5jdGlvbih0LGUsaSl7dmFyIG49dC5wcm90b3R5cGVbZV0scz1lK1wiVGltZW91dFwiO3QucHJvdG90eXBlW2VdPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpc1tzXTt0JiZjbGVhclRpbWVvdXQodCk7dmFyIGU9YXJndW1lbnRzLG89dGhpczt0aGlzW3NdPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtuLmFwcGx5KG8sZSksZGVsZXRlIG9bc119LGl8fDEwMCl9fSxpLmRvY1JlYWR5PWZ1bmN0aW9uKHQpe3ZhciBlPWRvY3VtZW50LnJlYWR5U3RhdGU7XCJjb21wbGV0ZVwiPT1lfHxcImludGVyYWN0aXZlXCI9PWU/c2V0VGltZW91dCh0KTpkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLHQpfSxpLnRvRGFzaGVkPWZ1bmN0aW9uKHQpe3JldHVybiB0LnJlcGxhY2UoLyguKShbQS1aXSkvZyxmdW5jdGlvbih0LGUsaSl7cmV0dXJuIGUrXCItXCIraX0pLnRvTG93ZXJDYXNlKCl9O3ZhciBuPXQuY29uc29sZTtyZXR1cm4gaS5odG1sSW5pdD1mdW5jdGlvbihlLHMpe2kuZG9jUmVhZHkoZnVuY3Rpb24oKXt2YXIgbz1pLnRvRGFzaGVkKHMpLHI9XCJkYXRhLVwiK28sYT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW1wiK3IrXCJdXCIpLGw9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5qcy1cIitvKSxoPWkubWFrZUFycmF5KGEpLmNvbmNhdChpLm1ha2VBcnJheShsKSksYz1yK1wiLW9wdGlvbnNcIixkPXQualF1ZXJ5O2guZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgaSxvPXQuZ2V0QXR0cmlidXRlKHIpfHx0LmdldEF0dHJpYnV0ZShjKTt0cnl7aT1vJiZKU09OLnBhcnNlKG8pfWNhdGNoKGEpe3JldHVybiB2b2lkKG4mJm4uZXJyb3IoXCJFcnJvciBwYXJzaW5nIFwiK3IrXCIgb24gXCIrdC5jbGFzc05hbWUrXCI6IFwiK2EpKX12YXIgbD1uZXcgZSh0LGkpO2QmJmQuZGF0YSh0LHMsbCl9KX0pfSxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvY2VsbFwiLFtcImdldC1zaXplL2dldC1zaXplXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImdldC1zaXplXCIpKToodC5GbGlja2l0eT10LkZsaWNraXR5fHx7fSx0LkZsaWNraXR5LkNlbGw9ZSh0LHQuZ2V0U2l6ZSkpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKHQsZSl7dGhpcy5lbGVtZW50PXQsdGhpcy5wYXJlbnQ9ZSx0aGlzLmNyZWF0ZSgpfXZhciBuPWkucHJvdG90eXBlO3JldHVybiBuLmNyZWF0ZT1mdW5jdGlvbigpe3RoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbj1cImFic29sdXRlXCIsdGhpcy54PTAsdGhpcy5zaGlmdD0wfSxuLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmVsZW1lbnQuc3R5bGUucG9zaXRpb249XCJcIjt2YXIgdD10aGlzLnBhcmVudC5vcmlnaW5TaWRlO3RoaXMuZWxlbWVudC5zdHlsZVt0XT1cIlwifSxuLmdldFNpemU9ZnVuY3Rpb24oKXt0aGlzLnNpemU9ZSh0aGlzLmVsZW1lbnQpfSxuLnNldFBvc2l0aW9uPWZ1bmN0aW9uKHQpe3RoaXMueD10LHRoaXMudXBkYXRlVGFyZ2V0KCksdGhpcy5yZW5kZXJQb3NpdGlvbih0KX0sbi51cGRhdGVUYXJnZXQ9bi5zZXREZWZhdWx0VGFyZ2V0PWZ1bmN0aW9uKCl7dmFyIHQ9XCJsZWZ0XCI9PXRoaXMucGFyZW50Lm9yaWdpblNpZGU/XCJtYXJnaW5MZWZ0XCI6XCJtYXJnaW5SaWdodFwiO3RoaXMudGFyZ2V0PXRoaXMueCt0aGlzLnNpemVbdF0rdGhpcy5zaXplLndpZHRoKnRoaXMucGFyZW50LmNlbGxBbGlnbn0sbi5yZW5kZXJQb3NpdGlvbj1mdW5jdGlvbih0KXt2YXIgZT10aGlzLnBhcmVudC5vcmlnaW5TaWRlO3RoaXMuZWxlbWVudC5zdHlsZVtlXT10aGlzLnBhcmVudC5nZXRQb3NpdGlvblZhbHVlKHQpfSxuLndyYXBTaGlmdD1mdW5jdGlvbih0KXt0aGlzLnNoaWZ0PXQsdGhpcy5yZW5kZXJQb3NpdGlvbih0aGlzLngrdGhpcy5wYXJlbnQuc2xpZGVhYmxlV2lkdGgqdCl9LG4ucmVtb3ZlPWZ1bmN0aW9uKCl7dGhpcy5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KX0saX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL3NsaWRlXCIsZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSgpOih0LkZsaWNraXR5PXQuRmxpY2tpdHl8fHt9LHQuRmxpY2tpdHkuU2xpZGU9ZSgpKX0od2luZG93LGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KXt0aGlzLnBhcmVudD10LHRoaXMuaXNPcmlnaW5MZWZ0PVwibGVmdFwiPT10Lm9yaWdpblNpZGUsdGhpcy5jZWxscz1bXSx0aGlzLm91dGVyV2lkdGg9MCx0aGlzLmhlaWdodD0wfXZhciBlPXQucHJvdG90eXBlO3JldHVybiBlLmFkZENlbGw9ZnVuY3Rpb24odCl7aWYodGhpcy5jZWxscy5wdXNoKHQpLHRoaXMub3V0ZXJXaWR0aCs9dC5zaXplLm91dGVyV2lkdGgsdGhpcy5oZWlnaHQ9TWF0aC5tYXgodC5zaXplLm91dGVySGVpZ2h0LHRoaXMuaGVpZ2h0KSwxPT10aGlzLmNlbGxzLmxlbmd0aCl7dGhpcy54PXQueDt2YXIgZT10aGlzLmlzT3JpZ2luTGVmdD9cIm1hcmdpbkxlZnRcIjpcIm1hcmdpblJpZ2h0XCI7dGhpcy5maXJzdE1hcmdpbj10LnNpemVbZV19fSxlLnVwZGF0ZVRhcmdldD1mdW5jdGlvbigpe3ZhciB0PXRoaXMuaXNPcmlnaW5MZWZ0P1wibWFyZ2luUmlnaHRcIjpcIm1hcmdpbkxlZnRcIixlPXRoaXMuZ2V0TGFzdENlbGwoKSxpPWU/ZS5zaXplW3RdOjAsbj10aGlzLm91dGVyV2lkdGgtKHRoaXMuZmlyc3RNYXJnaW4raSk7dGhpcy50YXJnZXQ9dGhpcy54K3RoaXMuZmlyc3RNYXJnaW4rbip0aGlzLnBhcmVudC5jZWxsQWxpZ259LGUuZ2V0TGFzdENlbGw9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jZWxsc1t0aGlzLmNlbGxzLmxlbmd0aC0xXX0sZS5zZWxlY3Q9ZnVuY3Rpb24oKXt0aGlzLmNoYW5nZVNlbGVjdGVkQ2xhc3MoXCJhZGRcIil9LGUudW5zZWxlY3Q9ZnVuY3Rpb24oKXt0aGlzLmNoYW5nZVNlbGVjdGVkQ2xhc3MoXCJyZW1vdmVcIil9LGUuY2hhbmdlU2VsZWN0ZWRDbGFzcz1mdW5jdGlvbih0KXt0aGlzLmNlbGxzLmZvckVhY2goZnVuY3Rpb24oZSl7ZS5lbGVtZW50LmNsYXNzTGlzdFt0XShcImlzLXNlbGVjdGVkXCIpfSl9LGUuZ2V0Q2VsbEVsZW1lbnRzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2VsbHMubWFwKGZ1bmN0aW9uKHQpe3JldHVybiB0LmVsZW1lbnR9KX0sdH0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2FuaW1hdGVcIixbXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6KHQuRmxpY2tpdHk9dC5GbGlja2l0eXx8e30sdC5GbGlja2l0eS5hbmltYXRlUHJvdG90eXBlPWUodCx0LmZpenp5VUlVdGlscykpfSh3aW5kb3csZnVuY3Rpb24odCxlKXt2YXIgaT10LnJlcXVlc3RBbmltYXRpb25GcmFtZXx8dC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUsbj0wO2l8fChpPWZ1bmN0aW9uKHQpe3ZhciBlPShuZXcgRGF0ZSkuZ2V0VGltZSgpLGk9TWF0aC5tYXgoMCwxNi0oZS1uKSkscz1zZXRUaW1lb3V0KHQsaSk7cmV0dXJuIG49ZStpLHN9KTt2YXIgcz17fTtzLnN0YXJ0QW5pbWF0aW9uPWZ1bmN0aW9uKCl7dGhpcy5pc0FuaW1hdGluZ3x8KHRoaXMuaXNBbmltYXRpbmc9ITAsdGhpcy5yZXN0aW5nRnJhbWVzPTAsdGhpcy5hbmltYXRlKCkpfSxzLmFuaW1hdGU9ZnVuY3Rpb24oKXt0aGlzLmFwcGx5RHJhZ0ZvcmNlKCksdGhpcy5hcHBseVNlbGVjdGVkQXR0cmFjdGlvbigpO3ZhciB0PXRoaXMueDtpZih0aGlzLmludGVncmF0ZVBoeXNpY3MoKSx0aGlzLnBvc2l0aW9uU2xpZGVyKCksdGhpcy5zZXR0bGUodCksdGhpcy5pc0FuaW1hdGluZyl7dmFyIGU9dGhpcztpKGZ1bmN0aW9uKCl7ZS5hbmltYXRlKCl9KX19O3ZhciBvPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlO3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0LnRyYW5zZm9ybT9cInRyYW5zZm9ybVwiOlwiV2Via2l0VHJhbnNmb3JtXCJ9KCk7cmV0dXJuIHMucG9zaXRpb25TbGlkZXI9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLng7dGhpcy5vcHRpb25zLndyYXBBcm91bmQmJnRoaXMuY2VsbHMubGVuZ3RoPjEmJih0PWUubW9kdWxvKHQsdGhpcy5zbGlkZWFibGVXaWR0aCksdC09dGhpcy5zbGlkZWFibGVXaWR0aCx0aGlzLnNoaWZ0V3JhcENlbGxzKHQpKSx0Kz10aGlzLmN1cnNvclBvc2l0aW9uLHQ9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0JiZvPy10OnQ7dmFyIGk9dGhpcy5nZXRQb3NpdGlvblZhbHVlKHQpO3RoaXMuc2xpZGVyLnN0eWxlW29dPXRoaXMuaXNBbmltYXRpbmc/XCJ0cmFuc2xhdGUzZChcIitpK1wiLDAsMClcIjpcInRyYW5zbGF0ZVgoXCIraStcIilcIjt2YXIgbj10aGlzLnNsaWRlc1swXTtpZihuKXt2YXIgcz0tdGhpcy54LW4udGFyZ2V0LHI9cy90aGlzLnNsaWRlc1dpZHRoO3RoaXMuZGlzcGF0Y2hFdmVudChcInNjcm9sbFwiLG51bGwsW3Isc10pfX0scy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQ9ZnVuY3Rpb24oKXt0aGlzLmNlbGxzLmxlbmd0aCYmKHRoaXMueD0tdGhpcy5zZWxlY3RlZFNsaWRlLnRhcmdldCx0aGlzLnBvc2l0aW9uU2xpZGVyKCkpfSxzLmdldFBvc2l0aW9uVmFsdWU9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMub3B0aW9ucy5wZXJjZW50UG9zaXRpb24/LjAxKk1hdGgucm91bmQodC90aGlzLnNpemUuaW5uZXJXaWR0aCoxZTQpK1wiJVwiOk1hdGgucm91bmQodCkrXCJweFwifSxzLnNldHRsZT1mdW5jdGlvbih0KXt0aGlzLmlzUG9pbnRlckRvd258fE1hdGgucm91bmQoMTAwKnRoaXMueCkhPU1hdGgucm91bmQoMTAwKnQpfHx0aGlzLnJlc3RpbmdGcmFtZXMrKyx0aGlzLnJlc3RpbmdGcmFtZXM+MiYmKHRoaXMuaXNBbmltYXRpbmc9ITEsZGVsZXRlIHRoaXMuaXNGcmVlU2Nyb2xsaW5nLHRoaXMucG9zaXRpb25TbGlkZXIoKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJzZXR0bGVcIikpfSxzLnNoaWZ0V3JhcENlbGxzPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuY3Vyc29yUG9zaXRpb24rdDt0aGlzLl9zaGlmdENlbGxzKHRoaXMuYmVmb3JlU2hpZnRDZWxscyxlLC0xKTt2YXIgaT10aGlzLnNpemUuaW5uZXJXaWR0aC0odCt0aGlzLnNsaWRlYWJsZVdpZHRoK3RoaXMuY3Vyc29yUG9zaXRpb24pO3RoaXMuX3NoaWZ0Q2VsbHModGhpcy5hZnRlclNoaWZ0Q2VsbHMsaSwxKX0scy5fc2hpZnRDZWxscz1mdW5jdGlvbih0LGUsaSl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciBzPXRbbl0sbz1lPjA/aTowO3Mud3JhcFNoaWZ0KG8pLGUtPXMuc2l6ZS5vdXRlcldpZHRofX0scy5fdW5zaGlmdENlbGxzPWZ1bmN0aW9uKHQpe2lmKHQmJnQubGVuZ3RoKWZvcih2YXIgZT0wO2U8dC5sZW5ndGg7ZSsrKXRbZV0ud3JhcFNoaWZ0KDApfSxzLmludGVncmF0ZVBoeXNpY3M9ZnVuY3Rpb24oKXt0aGlzLngrPXRoaXMudmVsb2NpdHksdGhpcy52ZWxvY2l0eSo9dGhpcy5nZXRGcmljdGlvbkZhY3RvcigpfSxzLmFwcGx5Rm9yY2U9ZnVuY3Rpb24odCl7dGhpcy52ZWxvY2l0eSs9dH0scy5nZXRGcmljdGlvbkZhY3Rvcj1mdW5jdGlvbigpe3JldHVybiAxLXRoaXMub3B0aW9uc1t0aGlzLmlzRnJlZVNjcm9sbGluZz9cImZyZWVTY3JvbGxGcmljdGlvblwiOlwiZnJpY3Rpb25cIl19LHMuZ2V0UmVzdGluZ1Bvc2l0aW9uPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMueCt0aGlzLnZlbG9jaXR5LygxLXRoaXMuZ2V0RnJpY3Rpb25GYWN0b3IoKSl9LHMuYXBwbHlEcmFnRm9yY2U9ZnVuY3Rpb24oKXtpZih0aGlzLmlzUG9pbnRlckRvd24pe3ZhciB0PXRoaXMuZHJhZ1gtdGhpcy54LGU9dC10aGlzLnZlbG9jaXR5O3RoaXMuYXBwbHlGb3JjZShlKX19LHMuYXBwbHlTZWxlY3RlZEF0dHJhY3Rpb249ZnVuY3Rpb24oKXtpZighdGhpcy5pc1BvaW50ZXJEb3duJiYhdGhpcy5pc0ZyZWVTY3JvbGxpbmcmJnRoaXMuY2VsbHMubGVuZ3RoKXt2YXIgdD10aGlzLnNlbGVjdGVkU2xpZGUudGFyZ2V0Ki0xLXRoaXMueCxlPXQqdGhpcy5vcHRpb25zLnNlbGVjdGVkQXR0cmFjdGlvbjt0aGlzLmFwcGx5Rm9yY2UoZSl9fSxzfSksZnVuY3Rpb24odCxlKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQpZGVmaW5lKFwiZmxpY2tpdHkvanMvZmxpY2tpdHlcIixbXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIixcImdldC1zaXplL2dldC1zaXplXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiLFwiLi9jZWxsXCIsXCIuL3NsaWRlXCIsXCIuL2FuaW1hdGVcIl0sZnVuY3Rpb24oaSxuLHMsbyxyLGEpe3JldHVybiBlKHQsaSxuLHMsbyxyLGEpfSk7ZWxzZSBpZihcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cyltb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImV2LWVtaXR0ZXJcIikscmVxdWlyZShcImdldC1zaXplXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSxyZXF1aXJlKFwiLi9jZWxsXCIpLHJlcXVpcmUoXCIuL3NsaWRlXCIpLHJlcXVpcmUoXCIuL2FuaW1hdGVcIikpO2Vsc2V7dmFyIGk9dC5GbGlja2l0eTt0LkZsaWNraXR5PWUodCx0LkV2RW1pdHRlcix0LmdldFNpemUsdC5maXp6eVVJVXRpbHMsaS5DZWxsLGkuU2xpZGUsaS5hbmltYXRlUHJvdG90eXBlKX19KHdpbmRvdyxmdW5jdGlvbih0LGUsaSxuLHMsbyxyKXtmdW5jdGlvbiBhKHQsZSl7Zm9yKHQ9bi5tYWtlQXJyYXkodCk7dC5sZW5ndGg7KWUuYXBwZW5kQ2hpbGQodC5zaGlmdCgpKX1mdW5jdGlvbiBsKHQsZSl7dmFyIGk9bi5nZXRRdWVyeUVsZW1lbnQodCk7aWYoIWkpcmV0dXJuIHZvaWQoZCYmZC5lcnJvcihcIkJhZCBlbGVtZW50IGZvciBGbGlja2l0eTogXCIrKGl8fHQpKSk7aWYodGhpcy5lbGVtZW50PWksdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRCl7dmFyIHM9Zlt0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEXTtyZXR1cm4gcy5vcHRpb24oZSksc31oJiYodGhpcy4kZWxlbWVudD1oKHRoaXMuZWxlbWVudCkpLHRoaXMub3B0aW9ucz1uLmV4dGVuZCh7fSx0aGlzLmNvbnN0cnVjdG9yLmRlZmF1bHRzKSx0aGlzLm9wdGlvbihlKSx0aGlzLl9jcmVhdGUoKX12YXIgaD10LmpRdWVyeSxjPXQuZ2V0Q29tcHV0ZWRTdHlsZSxkPXQuY29uc29sZSx1PTAsZj17fTtsLmRlZmF1bHRzPXthY2Nlc3NpYmlsaXR5OiEwLGNlbGxBbGlnbjpcImNlbnRlclwiLGZyZWVTY3JvbGxGcmljdGlvbjouMDc1LGZyaWN0aW9uOi4yOCxuYW1lc3BhY2VKUXVlcnlFdmVudHM6ITAscGVyY2VudFBvc2l0aW9uOiEwLHJlc2l6ZTohMCxzZWxlY3RlZEF0dHJhY3Rpb246LjAyNSxzZXRHYWxsZXJ5U2l6ZTohMH0sbC5jcmVhdGVNZXRob2RzPVtdO3ZhciBwPWwucHJvdG90eXBlO24uZXh0ZW5kKHAsZS5wcm90b3R5cGUpLHAuX2NyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPXRoaXMuZ3VpZD0rK3U7dGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRD1lLGZbZV09dGhpcyx0aGlzLnNlbGVjdGVkSW5kZXg9MCx0aGlzLnJlc3RpbmdGcmFtZXM9MCx0aGlzLng9MCx0aGlzLnZlbG9jaXR5PTAsdGhpcy5vcmlnaW5TaWRlPXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdD9cInJpZ2h0XCI6XCJsZWZ0XCIsdGhpcy52aWV3cG9ydD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLHRoaXMudmlld3BvcnQuY2xhc3NOYW1lPVwiZmxpY2tpdHktdmlld3BvcnRcIix0aGlzLl9jcmVhdGVTbGlkZXIoKSwodGhpcy5vcHRpb25zLnJlc2l6ZXx8dGhpcy5vcHRpb25zLndhdGNoQ1NTKSYmdC5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsdGhpcyksbC5jcmVhdGVNZXRob2RzLmZvckVhY2goZnVuY3Rpb24odCl7dGhpc1t0XSgpfSx0aGlzKSx0aGlzLm9wdGlvbnMud2F0Y2hDU1M/dGhpcy53YXRjaENTUygpOnRoaXMuYWN0aXZhdGUoKX0scC5vcHRpb249ZnVuY3Rpb24odCl7bi5leHRlbmQodGhpcy5vcHRpb25zLHQpfSxwLmFjdGl2YXRlPWZ1bmN0aW9uKCl7aWYoIXRoaXMuaXNBY3RpdmUpe3RoaXMuaXNBY3RpdmU9ITAsdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJmbGlja2l0eS1lbmFibGVkXCIpLHRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCYmdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJmbGlja2l0eS1ydGxcIiksdGhpcy5nZXRTaXplKCk7dmFyIHQ9dGhpcy5fZmlsdGVyRmluZENlbGxFbGVtZW50cyh0aGlzLmVsZW1lbnQuY2hpbGRyZW4pO2EodCx0aGlzLnNsaWRlciksdGhpcy52aWV3cG9ydC5hcHBlbmRDaGlsZCh0aGlzLnNsaWRlciksdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMudmlld3BvcnQpLHRoaXMucmVsb2FkQ2VsbHMoKSx0aGlzLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSYmKHRoaXMuZWxlbWVudC50YWJJbmRleD0wLHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLHRoaXMpKSx0aGlzLmVtaXRFdmVudChcImFjdGl2YXRlXCIpO3ZhciBlLGk9dGhpcy5vcHRpb25zLmluaXRpYWxJbmRleDtlPXRoaXMuaXNJbml0QWN0aXZhdGVkP3RoaXMuc2VsZWN0ZWRJbmRleDp2b2lkIDAhPT1pJiZ0aGlzLmNlbGxzW2ldP2k6MCx0aGlzLnNlbGVjdChlLCExLCEwKSx0aGlzLmlzSW5pdEFjdGl2YXRlZD0hMH19LHAuX2NyZWF0ZVNsaWRlcj1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7dC5jbGFzc05hbWU9XCJmbGlja2l0eS1zbGlkZXJcIix0LnN0eWxlW3RoaXMub3JpZ2luU2lkZV09MCx0aGlzLnNsaWRlcj10fSxwLl9maWx0ZXJGaW5kQ2VsbEVsZW1lbnRzPWZ1bmN0aW9uKHQpe3JldHVybiBuLmZpbHRlckZpbmRFbGVtZW50cyh0LHRoaXMub3B0aW9ucy5jZWxsU2VsZWN0b3IpfSxwLnJlbG9hZENlbGxzPWZ1bmN0aW9uKCl7dGhpcy5jZWxscz10aGlzLl9tYWtlQ2VsbHModGhpcy5zbGlkZXIuY2hpbGRyZW4pLHRoaXMucG9zaXRpb25DZWxscygpLHRoaXMuX2dldFdyYXBTaGlmdENlbGxzKCksdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpfSxwLl9tYWtlQ2VsbHM9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5fZmlsdGVyRmluZENlbGxFbGVtZW50cyh0KSxpPWUubWFwKGZ1bmN0aW9uKHQpe3JldHVybiBuZXcgcyh0LHRoaXMpfSx0aGlzKTtyZXR1cm4gaX0scC5nZXRMYXN0Q2VsbD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNlbGxzW3RoaXMuY2VsbHMubGVuZ3RoLTFdfSxwLmdldExhc3RTbGlkZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnNsaWRlc1t0aGlzLnNsaWRlcy5sZW5ndGgtMV19LHAucG9zaXRpb25DZWxscz1mdW5jdGlvbigpe3RoaXMuX3NpemVDZWxscyh0aGlzLmNlbGxzKSx0aGlzLl9wb3NpdGlvbkNlbGxzKDApfSxwLl9wb3NpdGlvbkNlbGxzPWZ1bmN0aW9uKHQpe3Q9dHx8MCx0aGlzLm1heENlbGxIZWlnaHQ9dD90aGlzLm1heENlbGxIZWlnaHR8fDA6MDt2YXIgZT0wO2lmKHQ+MCl7dmFyIGk9dGhpcy5jZWxsc1t0LTFdO2U9aS54K2kuc2l6ZS5vdXRlcldpZHRofWZvcih2YXIgbj10aGlzLmNlbGxzLmxlbmd0aCxzPXQ7czxuO3MrKyl7dmFyIG89dGhpcy5jZWxsc1tzXTtvLnNldFBvc2l0aW9uKGUpLGUrPW8uc2l6ZS5vdXRlcldpZHRoLHRoaXMubWF4Q2VsbEhlaWdodD1NYXRoLm1heChvLnNpemUub3V0ZXJIZWlnaHQsdGhpcy5tYXhDZWxsSGVpZ2h0KX10aGlzLnNsaWRlYWJsZVdpZHRoPWUsdGhpcy51cGRhdGVTbGlkZXMoKSx0aGlzLl9jb250YWluU2xpZGVzKCksdGhpcy5zbGlkZXNXaWR0aD1uP3RoaXMuZ2V0TGFzdFNsaWRlKCkudGFyZ2V0LXRoaXMuc2xpZGVzWzBdLnRhcmdldDowfSxwLl9zaXplQ2VsbHM9ZnVuY3Rpb24odCl7dC5mb3JFYWNoKGZ1bmN0aW9uKHQpe3QuZ2V0U2l6ZSgpfSl9LHAudXBkYXRlU2xpZGVzPWZ1bmN0aW9uKCl7aWYodGhpcy5zbGlkZXM9W10sdGhpcy5jZWxscy5sZW5ndGgpe3ZhciB0PW5ldyBvKHRoaXMpO3RoaXMuc2xpZGVzLnB1c2godCk7dmFyIGU9XCJsZWZ0XCI9PXRoaXMub3JpZ2luU2lkZSxpPWU/XCJtYXJnaW5SaWdodFwiOlwibWFyZ2luTGVmdFwiLG49dGhpcy5fZ2V0Q2FuQ2VsbEZpdCgpO3RoaXMuY2VsbHMuZm9yRWFjaChmdW5jdGlvbihlLHMpe2lmKCF0LmNlbGxzLmxlbmd0aClyZXR1cm4gdm9pZCB0LmFkZENlbGwoZSk7dmFyIHI9dC5vdXRlcldpZHRoLXQuZmlyc3RNYXJnaW4rKGUuc2l6ZS5vdXRlcldpZHRoLWUuc2l6ZVtpXSk7bi5jYWxsKHRoaXMscyxyKT90LmFkZENlbGwoZSk6KHQudXBkYXRlVGFyZ2V0KCksdD1uZXcgbyh0aGlzKSx0aGlzLnNsaWRlcy5wdXNoKHQpLHQuYWRkQ2VsbChlKSl9LHRoaXMpLHQudXBkYXRlVGFyZ2V0KCksdGhpcy51cGRhdGVTZWxlY3RlZFNsaWRlKCl9fSxwLl9nZXRDYW5DZWxsRml0PWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLmdyb3VwQ2VsbHM7aWYoIXQpcmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuITF9O2lmKFwibnVtYmVyXCI9PXR5cGVvZiB0KXt2YXIgZT1wYXJzZUludCh0LDEwKTtyZXR1cm4gZnVuY3Rpb24odCl7cmV0dXJuIHQlZSE9PTB9fXZhciBpPVwic3RyaW5nXCI9PXR5cGVvZiB0JiZ0Lm1hdGNoKC9eKFxcZCspJSQvKSxuPWk/cGFyc2VJbnQoaVsxXSwxMCkvMTAwOjE7cmV0dXJuIGZ1bmN0aW9uKHQsZSl7cmV0dXJuIGU8PSh0aGlzLnNpemUuaW5uZXJXaWR0aCsxKSpufX0scC5faW5pdD1wLnJlcG9zaXRpb249ZnVuY3Rpb24oKXt0aGlzLnBvc2l0aW9uQ2VsbHMoKSx0aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpfSxwLmdldFNpemU9ZnVuY3Rpb24oKXt0aGlzLnNpemU9aSh0aGlzLmVsZW1lbnQpLHRoaXMuc2V0Q2VsbEFsaWduKCksdGhpcy5jdXJzb3JQb3NpdGlvbj10aGlzLnNpemUuaW5uZXJXaWR0aCp0aGlzLmNlbGxBbGlnbn07dmFyIHY9e2NlbnRlcjp7bGVmdDouNSxyaWdodDouNX0sbGVmdDp7bGVmdDowLHJpZ2h0OjF9LHJpZ2h0OntyaWdodDowLGxlZnQ6MX19O3JldHVybiBwLnNldENlbGxBbGlnbj1mdW5jdGlvbigpe3ZhciB0PXZbdGhpcy5vcHRpb25zLmNlbGxBbGlnbl07dGhpcy5jZWxsQWxpZ249dD90W3RoaXMub3JpZ2luU2lkZV06dGhpcy5vcHRpb25zLmNlbGxBbGlnbn0scC5zZXRHYWxsZXJ5U2l6ZT1mdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy5zZXRHYWxsZXJ5U2l6ZSl7dmFyIHQ9dGhpcy5vcHRpb25zLmFkYXB0aXZlSGVpZ2h0JiZ0aGlzLnNlbGVjdGVkU2xpZGU/dGhpcy5zZWxlY3RlZFNsaWRlLmhlaWdodDp0aGlzLm1heENlbGxIZWlnaHQ7dGhpcy52aWV3cG9ydC5zdHlsZS5oZWlnaHQ9dCtcInB4XCJ9fSxwLl9nZXRXcmFwU2hpZnRDZWxscz1mdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy53cmFwQXJvdW5kKXt0aGlzLl91bnNoaWZ0Q2VsbHModGhpcy5iZWZvcmVTaGlmdENlbGxzKSx0aGlzLl91bnNoaWZ0Q2VsbHModGhpcy5hZnRlclNoaWZ0Q2VsbHMpO3ZhciB0PXRoaXMuY3Vyc29yUG9zaXRpb24sZT10aGlzLmNlbGxzLmxlbmd0aC0xO3RoaXMuYmVmb3JlU2hpZnRDZWxscz10aGlzLl9nZXRHYXBDZWxscyh0LGUsLTEpLHQ9dGhpcy5zaXplLmlubmVyV2lkdGgtdGhpcy5jdXJzb3JQb3NpdGlvbix0aGlzLmFmdGVyU2hpZnRDZWxscz10aGlzLl9nZXRHYXBDZWxscyh0LDAsMSl9fSxwLl9nZXRHYXBDZWxscz1mdW5jdGlvbih0LGUsaSl7Zm9yKHZhciBuPVtdO3Q+MDspe3ZhciBzPXRoaXMuY2VsbHNbZV07aWYoIXMpYnJlYWs7bi5wdXNoKHMpLGUrPWksdC09cy5zaXplLm91dGVyV2lkdGh9cmV0dXJuIG59LHAuX2NvbnRhaW5TbGlkZXM9ZnVuY3Rpb24oKXtpZih0aGlzLm9wdGlvbnMuY29udGFpbiYmIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZ0aGlzLmNlbGxzLmxlbmd0aCl7dmFyIHQ9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0LGU9dD9cIm1hcmdpblJpZ2h0XCI6XCJtYXJnaW5MZWZ0XCIsaT10P1wibWFyZ2luTGVmdFwiOlwibWFyZ2luUmlnaHRcIixuPXRoaXMuc2xpZGVhYmxlV2lkdGgtdGhpcy5nZXRMYXN0Q2VsbCgpLnNpemVbaV0scz1uPHRoaXMuc2l6ZS5pbm5lcldpZHRoLG89dGhpcy5jdXJzb3JQb3NpdGlvbit0aGlzLmNlbGxzWzBdLnNpemVbZV0scj1uLXRoaXMuc2l6ZS5pbm5lcldpZHRoKigxLXRoaXMuY2VsbEFsaWduKTt0aGlzLnNsaWRlcy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3M/dC50YXJnZXQ9bip0aGlzLmNlbGxBbGlnbjoodC50YXJnZXQ9TWF0aC5tYXgodC50YXJnZXQsbyksdC50YXJnZXQ9TWF0aC5taW4odC50YXJnZXQscikpfSx0aGlzKX19LHAuZGlzcGF0Y2hFdmVudD1mdW5jdGlvbih0LGUsaSl7dmFyIG49ZT9bZV0uY29uY2F0KGkpOmk7aWYodGhpcy5lbWl0RXZlbnQodCxuKSxoJiZ0aGlzLiRlbGVtZW50KXt0Kz10aGlzLm9wdGlvbnMubmFtZXNwYWNlSlF1ZXJ5RXZlbnRzP1wiLmZsaWNraXR5XCI6XCJcIjt2YXIgcz10O2lmKGUpe3ZhciBvPWguRXZlbnQoZSk7by50eXBlPXQscz1vfXRoaXMuJGVsZW1lbnQudHJpZ2dlcihzLGkpfX0scC5zZWxlY3Q9ZnVuY3Rpb24odCxlLGkpe3RoaXMuaXNBY3RpdmUmJih0PXBhcnNlSW50KHQsMTApLHRoaXMuX3dyYXBTZWxlY3QodCksKHRoaXMub3B0aW9ucy53cmFwQXJvdW5kfHxlKSYmKHQ9bi5tb2R1bG8odCx0aGlzLnNsaWRlcy5sZW5ndGgpKSx0aGlzLnNsaWRlc1t0XSYmKHRoaXMuc2VsZWN0ZWRJbmRleD10LHRoaXMudXBkYXRlU2VsZWN0ZWRTbGlkZSgpLGk/dGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKTp0aGlzLnN0YXJ0QW5pbWF0aW9uKCksdGhpcy5vcHRpb25zLmFkYXB0aXZlSGVpZ2h0JiZ0aGlzLnNldEdhbGxlcnlTaXplKCksdGhpcy5kaXNwYXRjaEV2ZW50KFwic2VsZWN0XCIpLHRoaXMuZGlzcGF0Y2hFdmVudChcImNlbGxTZWxlY3RcIikpKX0scC5fd3JhcFNlbGVjdD1mdW5jdGlvbih0KXt2YXIgZT10aGlzLnNsaWRlcy5sZW5ndGgsaT10aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmZT4xO2lmKCFpKXJldHVybiB0O3ZhciBzPW4ubW9kdWxvKHQsZSksbz1NYXRoLmFicyhzLXRoaXMuc2VsZWN0ZWRJbmRleCkscj1NYXRoLmFicyhzK2UtdGhpcy5zZWxlY3RlZEluZGV4KSxhPU1hdGguYWJzKHMtZS10aGlzLnNlbGVjdGVkSW5kZXgpOyF0aGlzLmlzRHJhZ1NlbGVjdCYmcjxvP3QrPWU6IXRoaXMuaXNEcmFnU2VsZWN0JiZhPG8mJih0LT1lKSx0PDA/dGhpcy54LT10aGlzLnNsaWRlYWJsZVdpZHRoOnQ+PWUmJih0aGlzLngrPXRoaXMuc2xpZGVhYmxlV2lkdGgpfSxwLnByZXZpb3VzPWZ1bmN0aW9uKHQsZSl7dGhpcy5zZWxlY3QodGhpcy5zZWxlY3RlZEluZGV4LTEsdCxlKX0scC5uZXh0PWZ1bmN0aW9uKHQsZSl7dGhpcy5zZWxlY3QodGhpcy5zZWxlY3RlZEluZGV4KzEsdCxlKX0scC51cGRhdGVTZWxlY3RlZFNsaWRlPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5zbGlkZXNbdGhpcy5zZWxlY3RlZEluZGV4XTt0JiYodGhpcy51bnNlbGVjdFNlbGVjdGVkU2xpZGUoKSx0aGlzLnNlbGVjdGVkU2xpZGU9dCx0LnNlbGVjdCgpLHRoaXMuc2VsZWN0ZWRDZWxscz10LmNlbGxzLHRoaXMuc2VsZWN0ZWRFbGVtZW50cz10LmdldENlbGxFbGVtZW50cygpLHRoaXMuc2VsZWN0ZWRDZWxsPXQuY2VsbHNbMF0sdGhpcy5zZWxlY3RlZEVsZW1lbnQ9dGhpcy5zZWxlY3RlZEVsZW1lbnRzWzBdKX0scC51bnNlbGVjdFNlbGVjdGVkU2xpZGU9ZnVuY3Rpb24oKXt0aGlzLnNlbGVjdGVkU2xpZGUmJnRoaXMuc2VsZWN0ZWRTbGlkZS51bnNlbGVjdCgpfSxwLnNlbGVjdENlbGw9ZnVuY3Rpb24odCxlLGkpe3ZhciBuO1wibnVtYmVyXCI9PXR5cGVvZiB0P249dGhpcy5jZWxsc1t0XTooXCJzdHJpbmdcIj09dHlwZW9mIHQmJih0PXRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKHQpKSxuPXRoaXMuZ2V0Q2VsbCh0KSk7Zm9yKHZhciBzPTA7biYmczx0aGlzLnNsaWRlcy5sZW5ndGg7cysrKXt2YXIgbz10aGlzLnNsaWRlc1tzXSxyPW8uY2VsbHMuaW5kZXhPZihuKTtpZihyIT0tMSlyZXR1cm4gdm9pZCB0aGlzLnNlbGVjdChzLGUsaSl9fSxwLmdldENlbGw9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPTA7ZTx0aGlzLmNlbGxzLmxlbmd0aDtlKyspe3ZhciBpPXRoaXMuY2VsbHNbZV07aWYoaS5lbGVtZW50PT10KXJldHVybiBpfX0scC5nZXRDZWxscz1mdW5jdGlvbih0KXt0PW4ubWFrZUFycmF5KHQpO3ZhciBlPVtdO3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCl7dmFyIGk9dGhpcy5nZXRDZWxsKHQpO2kmJmUucHVzaChpKX0sdGhpcyksZX0scC5nZXRDZWxsRWxlbWVudHM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jZWxscy5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQuZWxlbWVudH0pfSxwLmdldFBhcmVudENlbGw9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRDZWxsKHQpO3JldHVybiBlP2U6KHQ9bi5nZXRQYXJlbnQodCxcIi5mbGlja2l0eS1zbGlkZXIgPiAqXCIpLHRoaXMuZ2V0Q2VsbCh0KSl9LHAuZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHM9ZnVuY3Rpb24odCxlKXtpZighdClyZXR1cm4gdGhpcy5zZWxlY3RlZFNsaWRlLmdldENlbGxFbGVtZW50cygpO2U9dm9pZCAwPT09ZT90aGlzLnNlbGVjdGVkSW5kZXg6ZTt2YXIgaT10aGlzLnNsaWRlcy5sZW5ndGg7aWYoMSsyKnQ+PWkpcmV0dXJuIHRoaXMuZ2V0Q2VsbEVsZW1lbnRzKCk7Zm9yKHZhciBzPVtdLG89ZS10O288PWUrdDtvKyspe3ZhciByPXRoaXMub3B0aW9ucy53cmFwQXJvdW5kP24ubW9kdWxvKG8saSk6byxhPXRoaXMuc2xpZGVzW3JdO2EmJihzPXMuY29uY2F0KGEuZ2V0Q2VsbEVsZW1lbnRzKCkpKX1yZXR1cm4gc30scC51aUNoYW5nZT1mdW5jdGlvbigpe3RoaXMuZW1pdEV2ZW50KFwidWlDaGFuZ2VcIil9LHAuY2hpbGRVSVBvaW50ZXJEb3duPWZ1bmN0aW9uKHQpe3RoaXMuZW1pdEV2ZW50KFwiY2hpbGRVSVBvaW50ZXJEb3duXCIsW3RdKX0scC5vbnJlc2l6ZT1mdW5jdGlvbigpe3RoaXMud2F0Y2hDU1MoKSx0aGlzLnJlc2l6ZSgpfSxuLmRlYm91bmNlTWV0aG9kKGwsXCJvbnJlc2l6ZVwiLDE1MCkscC5yZXNpemU9ZnVuY3Rpb24oKXtpZih0aGlzLmlzQWN0aXZlKXt0aGlzLmdldFNpemUoKSx0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmKHRoaXMueD1uLm1vZHVsbyh0aGlzLngsdGhpcy5zbGlkZWFibGVXaWR0aCkpLHRoaXMucG9zaXRpb25DZWxscygpLHRoaXMuX2dldFdyYXBTaGlmdENlbGxzKCksdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpLHRoaXMuZW1pdEV2ZW50KFwicmVzaXplXCIpO3ZhciB0PXRoaXMuc2VsZWN0ZWRFbGVtZW50cyYmdGhpcy5zZWxlY3RlZEVsZW1lbnRzWzBdO3RoaXMuc2VsZWN0Q2VsbCh0LCExLCEwKX19LHAud2F0Y2hDU1M9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm9wdGlvbnMud2F0Y2hDU1M7aWYodCl7dmFyIGU9Yyh0aGlzLmVsZW1lbnQsXCI6YWZ0ZXJcIikuY29udGVudDtlLmluZGV4T2YoXCJmbGlja2l0eVwiKSE9LTE/dGhpcy5hY3RpdmF0ZSgpOnRoaXMuZGVhY3RpdmF0ZSgpfX0scC5vbmtleWRvd249ZnVuY3Rpb24odCl7aWYodGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkmJighZG9jdW1lbnQuYWN0aXZlRWxlbWVudHx8ZG9jdW1lbnQuYWN0aXZlRWxlbWVudD09dGhpcy5lbGVtZW50KSlpZigzNz09dC5rZXlDb2RlKXt2YXIgZT10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQ/XCJuZXh0XCI6XCJwcmV2aW91c1wiO3RoaXMudWlDaGFuZ2UoKSx0aGlzW2VdKCl9ZWxzZSBpZigzOT09dC5rZXlDb2RlKXt2YXIgaT10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQ/XCJwcmV2aW91c1wiOlwibmV4dFwiO3RoaXMudWlDaGFuZ2UoKSx0aGlzW2ldKCl9fSxwLmRlYWN0aXZhdGU9ZnVuY3Rpb24oKXt0aGlzLmlzQWN0aXZlJiYodGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJmbGlja2l0eS1lbmFibGVkXCIpLHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZmxpY2tpdHktcnRsXCIpLHRoaXMuY2VsbHMuZm9yRWFjaChmdW5jdGlvbih0KXt0LmRlc3Ryb3koKX0pLHRoaXMudW5zZWxlY3RTZWxlY3RlZFNsaWRlKCksdGhpcy5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMudmlld3BvcnQpLGEodGhpcy5zbGlkZXIuY2hpbGRyZW4sdGhpcy5lbGVtZW50KSx0aGlzLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSYmKHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoXCJ0YWJJbmRleFwiKSx0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIix0aGlzKSksdGhpcy5pc0FjdGl2ZT0hMSx0aGlzLmVtaXRFdmVudChcImRlYWN0aXZhdGVcIikpfSxwLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmRlYWN0aXZhdGUoKSx0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIix0aGlzKSx0aGlzLmVtaXRFdmVudChcImRlc3Ryb3lcIiksaCYmdGhpcy4kZWxlbWVudCYmaC5yZW1vdmVEYXRhKHRoaXMuZWxlbWVudCxcImZsaWNraXR5XCIpLGRlbGV0ZSB0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlELGRlbGV0ZSBmW3RoaXMuZ3VpZF19LG4uZXh0ZW5kKHAsciksbC5kYXRhPWZ1bmN0aW9uKHQpe3Q9bi5nZXRRdWVyeUVsZW1lbnQodCk7dmFyIGU9dCYmdC5mbGlja2l0eUdVSUQ7cmV0dXJuIGUmJmZbZV19LG4uaHRtbEluaXQobCxcImZsaWNraXR5XCIpLGgmJmguYnJpZGdldCYmaC5icmlkZ2V0KFwiZmxpY2tpdHlcIixsKSxsLkNlbGw9cyxsfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwidW5pcG9pbnRlci91bmlwb2ludGVyXCIsW1wiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImV2LWVtaXR0ZXJcIikpOnQuVW5pcG9pbnRlcj1lKHQsdC5FdkVtaXR0ZXIpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKCl7fWZ1bmN0aW9uIG4oKXt9dmFyIHM9bi5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSk7cy5iaW5kU3RhcnRFdmVudD1mdW5jdGlvbih0KXt0aGlzLl9iaW5kU3RhcnRFdmVudCh0LCEwKX0scy51bmJpbmRTdGFydEV2ZW50PWZ1bmN0aW9uKHQpe3RoaXMuX2JpbmRTdGFydEV2ZW50KHQsITEpfSxzLl9iaW5kU3RhcnRFdmVudD1mdW5jdGlvbihlLGkpe2k9dm9pZCAwPT09aXx8ISFpO3ZhciBuPWk/XCJhZGRFdmVudExpc3RlbmVyXCI6XCJyZW1vdmVFdmVudExpc3RlbmVyXCI7dC5uYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQ/ZVtuXShcInBvaW50ZXJkb3duXCIsdGhpcyk6dC5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZD9lW25dKFwiTVNQb2ludGVyRG93blwiLHRoaXMpOihlW25dKFwibW91c2Vkb3duXCIsdGhpcyksZVtuXShcInRvdWNoc3RhcnRcIix0aGlzKSl9LHMuaGFuZGxlRXZlbnQ9ZnVuY3Rpb24odCl7dmFyIGU9XCJvblwiK3QudHlwZTt0aGlzW2VdJiZ0aGlzW2VdKHQpfSxzLmdldFRvdWNoPWZ1bmN0aW9uKHQpe2Zvcih2YXIgZT0wO2U8dC5sZW5ndGg7ZSsrKXt2YXIgaT10W2VdO2lmKGkuaWRlbnRpZmllcj09dGhpcy5wb2ludGVySWRlbnRpZmllcilyZXR1cm4gaX19LHMub25tb3VzZWRvd249ZnVuY3Rpb24odCl7dmFyIGU9dC5idXR0b247ZSYmMCE9PWUmJjEhPT1lfHx0aGlzLl9wb2ludGVyRG93bih0LHQpfSxzLm9udG91Y2hzdGFydD1mdW5jdGlvbih0KXt0aGlzLl9wb2ludGVyRG93bih0LHQuY2hhbmdlZFRvdWNoZXNbMF0pfSxzLm9uTVNQb2ludGVyRG93bj1zLm9ucG9pbnRlcmRvd249ZnVuY3Rpb24odCl7dGhpcy5fcG9pbnRlckRvd24odCx0KX0scy5fcG9pbnRlckRvd249ZnVuY3Rpb24odCxlKXt0aGlzLmlzUG9pbnRlckRvd258fCh0aGlzLmlzUG9pbnRlckRvd249ITAsdGhpcy5wb2ludGVySWRlbnRpZmllcj12b2lkIDAhPT1lLnBvaW50ZXJJZD9lLnBvaW50ZXJJZDplLmlkZW50aWZpZXIsdGhpcy5wb2ludGVyRG93bih0LGUpKX0scy5wb2ludGVyRG93bj1mdW5jdGlvbih0LGUpe3RoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHModCksdGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyRG93blwiLFt0LGVdKX07dmFyIG89e21vdXNlZG93bjpbXCJtb3VzZW1vdmVcIixcIm1vdXNldXBcIl0sdG91Y2hzdGFydDpbXCJ0b3VjaG1vdmVcIixcInRvdWNoZW5kXCIsXCJ0b3VjaGNhbmNlbFwiXSxwb2ludGVyZG93bjpbXCJwb2ludGVybW92ZVwiLFwicG9pbnRlcnVwXCIsXCJwb2ludGVyY2FuY2VsXCJdLE1TUG9pbnRlckRvd246W1wiTVNQb2ludGVyTW92ZVwiLFwiTVNQb2ludGVyVXBcIixcIk1TUG9pbnRlckNhbmNlbFwiXX07cmV0dXJuIHMuX2JpbmRQb3N0U3RhcnRFdmVudHM9ZnVuY3Rpb24oZSl7aWYoZSl7dmFyIGk9b1tlLnR5cGVdO2kuZm9yRWFjaChmdW5jdGlvbihlKXt0LmFkZEV2ZW50TGlzdGVuZXIoZSx0aGlzKX0sdGhpcyksdGhpcy5fYm91bmRQb2ludGVyRXZlbnRzPWl9fSxzLl91bmJpbmRQb3N0U3RhcnRFdmVudHM9ZnVuY3Rpb24oKXt0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHMmJih0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlKXt0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZSx0aGlzKX0sdGhpcyksZGVsZXRlIHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cyl9LHMub25tb3VzZW1vdmU9ZnVuY3Rpb24odCl7dGhpcy5fcG9pbnRlck1vdmUodCx0KX0scy5vbk1TUG9pbnRlck1vdmU9cy5vbnBvaW50ZXJtb3ZlPWZ1bmN0aW9uKHQpe3QucG9pbnRlcklkPT10aGlzLnBvaW50ZXJJZGVudGlmaWVyJiZ0aGlzLl9wb2ludGVyTW92ZSh0LHQpfSxzLm9udG91Y2htb3ZlPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0VG91Y2godC5jaGFuZ2VkVG91Y2hlcyk7ZSYmdGhpcy5fcG9pbnRlck1vdmUodCxlKX0scy5fcG9pbnRlck1vdmU9ZnVuY3Rpb24odCxlKXt0aGlzLnBvaW50ZXJNb3ZlKHQsZSl9LHMucG9pbnRlck1vdmU9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJNb3ZlXCIsW3QsZV0pfSxzLm9ubW91c2V1cD1mdW5jdGlvbih0KXt0aGlzLl9wb2ludGVyVXAodCx0KX0scy5vbk1TUG9pbnRlclVwPXMub25wb2ludGVydXA9ZnVuY3Rpb24odCl7dC5wb2ludGVySWQ9PXRoaXMucG9pbnRlcklkZW50aWZpZXImJnRoaXMuX3BvaW50ZXJVcCh0LHQpfSxzLm9udG91Y2hlbmQ9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRUb3VjaCh0LmNoYW5nZWRUb3VjaGVzKTtlJiZ0aGlzLl9wb2ludGVyVXAodCxlKX0scy5fcG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7dGhpcy5fcG9pbnRlckRvbmUoKSx0aGlzLnBvaW50ZXJVcCh0LGUpfSxzLnBvaW50ZXJVcD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlclVwXCIsW3QsZV0pfSxzLl9wb2ludGVyRG9uZT1mdW5jdGlvbigpe3RoaXMuaXNQb2ludGVyRG93bj0hMSxkZWxldGUgdGhpcy5wb2ludGVySWRlbnRpZmllcix0aGlzLl91bmJpbmRQb3N0U3RhcnRFdmVudHMoKSx0aGlzLnBvaW50ZXJEb25lKCl9LHMucG9pbnRlckRvbmU9aSxzLm9uTVNQb2ludGVyQ2FuY2VsPXMub25wb2ludGVyY2FuY2VsPWZ1bmN0aW9uKHQpe3QucG9pbnRlcklkPT10aGlzLnBvaW50ZXJJZGVudGlmaWVyJiZ0aGlzLl9wb2ludGVyQ2FuY2VsKHQsdCl9LHMub250b3VjaGNhbmNlbD1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldFRvdWNoKHQuY2hhbmdlZFRvdWNoZXMpO2UmJnRoaXMuX3BvaW50ZXJDYW5jZWwodCxlKX0scy5fcG9pbnRlckNhbmNlbD1mdW5jdGlvbih0LGUpe3RoaXMuX3BvaW50ZXJEb25lKCksdGhpcy5wb2ludGVyQ2FuY2VsKHQsZSl9LHMucG9pbnRlckNhbmNlbD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlckNhbmNlbFwiLFt0LGVdKX0sbi5nZXRQb2ludGVyUG9pbnQ9ZnVuY3Rpb24odCl7cmV0dXJue3g6dC5wYWdlWCx5OnQucGFnZVl9fSxufSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwidW5pZHJhZ2dlci91bmlkcmFnZ2VyXCIsW1widW5pcG9pbnRlci91bmlwb2ludGVyXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcInVuaXBvaW50ZXJcIikpOnQuVW5pZHJhZ2dlcj1lKHQsdC5Vbmlwb2ludGVyKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSgpe31mdW5jdGlvbiBuKCl7fXZhciBzPW4ucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpO3MuYmluZEhhbmRsZXM9ZnVuY3Rpb24oKXt0aGlzLl9iaW5kSGFuZGxlcyghMCl9LHMudW5iaW5kSGFuZGxlcz1mdW5jdGlvbigpe3RoaXMuX2JpbmRIYW5kbGVzKCExKX07dmFyIG89dC5uYXZpZ2F0b3I7cmV0dXJuIHMuX2JpbmRIYW5kbGVzPWZ1bmN0aW9uKHQpe3Q9dm9pZCAwPT09dHx8ISF0O3ZhciBlO2U9by5wb2ludGVyRW5hYmxlZD9mdW5jdGlvbihlKXtlLnN0eWxlLnRvdWNoQWN0aW9uPXQ/XCJub25lXCI6XCJcIn06by5tc1BvaW50ZXJFbmFibGVkP2Z1bmN0aW9uKGUpe2Uuc3R5bGUubXNUb3VjaEFjdGlvbj10P1wibm9uZVwiOlwiXCJ9Omk7Zm9yKHZhciBuPXQ/XCJhZGRFdmVudExpc3RlbmVyXCI6XCJyZW1vdmVFdmVudExpc3RlbmVyXCIscz0wO3M8dGhpcy5oYW5kbGVzLmxlbmd0aDtzKyspe3ZhciByPXRoaXMuaGFuZGxlc1tzXTt0aGlzLl9iaW5kU3RhcnRFdmVudChyLHQpLGUocikscltuXShcImNsaWNrXCIsdGhpcyl9fSxzLnBvaW50ZXJEb3duPWZ1bmN0aW9uKHQsZSl7aWYoXCJJTlBVVFwiPT10LnRhcmdldC5ub2RlTmFtZSYmXCJyYW5nZVwiPT10LnRhcmdldC50eXBlKXJldHVybiB0aGlzLmlzUG9pbnRlckRvd249ITEsdm9pZCBkZWxldGUgdGhpcy5wb2ludGVySWRlbnRpZmllcjt0aGlzLl9kcmFnUG9pbnRlckRvd24odCxlKTt2YXIgaT1kb2N1bWVudC5hY3RpdmVFbGVtZW50O2kmJmkuYmx1ciYmaS5ibHVyKCksdGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyh0KSx0aGlzLmVtaXRFdmVudChcInBvaW50ZXJEb3duXCIsW3QsZV0pfSxzLl9kcmFnUG9pbnRlckRvd249ZnVuY3Rpb24odCxpKXt0aGlzLnBvaW50ZXJEb3duUG9pbnQ9ZS5nZXRQb2ludGVyUG9pbnQoaSk7dmFyIG49dGhpcy5jYW5QcmV2ZW50RGVmYXVsdE9uUG9pbnRlckRvd24odCxpKTtuJiZ0LnByZXZlbnREZWZhdWx0KCl9LHMuY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duPWZ1bmN0aW9uKHQpe3JldHVyblwiU0VMRUNUXCIhPXQudGFyZ2V0Lm5vZGVOYW1lfSxzLnBvaW50ZXJNb3ZlPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZHJhZ1BvaW50ZXJNb3ZlKHQsZSk7dGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyTW92ZVwiLFt0LGUsaV0pLHRoaXMuX2RyYWdNb3ZlKHQsZSxpKX0scy5fZHJhZ1BvaW50ZXJNb3ZlPWZ1bmN0aW9uKHQsaSl7dmFyIG49ZS5nZXRQb2ludGVyUG9pbnQoaSkscz17eDpuLngtdGhpcy5wb2ludGVyRG93blBvaW50LngseTpuLnktdGhpcy5wb2ludGVyRG93blBvaW50Lnl9O3JldHVybiF0aGlzLmlzRHJhZ2dpbmcmJnRoaXMuaGFzRHJhZ1N0YXJ0ZWQocykmJnRoaXMuX2RyYWdTdGFydCh0LGkpLHN9LHMuaGFzRHJhZ1N0YXJ0ZWQ9ZnVuY3Rpb24odCl7cmV0dXJuIE1hdGguYWJzKHQueCk+M3x8TWF0aC5hYnModC55KT4zfSxzLnBvaW50ZXJVcD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlclVwXCIsW3QsZV0pLHRoaXMuX2RyYWdQb2ludGVyVXAodCxlKX0scy5fZHJhZ1BvaW50ZXJVcD1mdW5jdGlvbih0LGUpe3RoaXMuaXNEcmFnZ2luZz90aGlzLl9kcmFnRW5kKHQsZSk6dGhpcy5fc3RhdGljQ2xpY2sodCxlKX0scy5fZHJhZ1N0YXJ0PWZ1bmN0aW9uKHQsaSl7dGhpcy5pc0RyYWdnaW5nPSEwLHRoaXMuZHJhZ1N0YXJ0UG9pbnQ9ZS5nZXRQb2ludGVyUG9pbnQoaSksdGhpcy5pc1ByZXZlbnRpbmdDbGlja3M9ITAsdGhpcy5kcmFnU3RhcnQodCxpKX0scy5kcmFnU3RhcnQ9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcImRyYWdTdGFydFwiLFt0LGVdKX0scy5fZHJhZ01vdmU9ZnVuY3Rpb24odCxlLGkpe3RoaXMuaXNEcmFnZ2luZyYmdGhpcy5kcmFnTW92ZSh0LGUsaSl9LHMuZHJhZ01vdmU9ZnVuY3Rpb24odCxlLGkpe3QucHJldmVudERlZmF1bHQoKSx0aGlzLmVtaXRFdmVudChcImRyYWdNb3ZlXCIsW3QsZSxpXSl9LHMuX2RyYWdFbmQ9ZnVuY3Rpb24odCxlKXt0aGlzLmlzRHJhZ2dpbmc9ITEsc2V0VGltZW91dChmdW5jdGlvbigpe2RlbGV0ZSB0aGlzLmlzUHJldmVudGluZ0NsaWNrc30uYmluZCh0aGlzKSksdGhpcy5kcmFnRW5kKHQsZSl9LHMuZHJhZ0VuZD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwiZHJhZ0VuZFwiLFt0LGVdKX0scy5vbmNsaWNrPWZ1bmN0aW9uKHQpe3RoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzJiZ0LnByZXZlbnREZWZhdWx0KCl9LHMuX3N0YXRpY0NsaWNrPWZ1bmN0aW9uKHQsZSl7aWYoIXRoaXMuaXNJZ25vcmluZ01vdXNlVXB8fFwibW91c2V1cFwiIT10LnR5cGUpe3ZhciBpPXQudGFyZ2V0Lm5vZGVOYW1lO1wiSU5QVVRcIiE9aSYmXCJURVhUQVJFQVwiIT1pfHx0LnRhcmdldC5mb2N1cygpLHRoaXMuc3RhdGljQ2xpY2sodCxlKSxcIm1vdXNldXBcIiE9dC50eXBlJiYodGhpcy5pc0lnbm9yaW5nTW91c2VVcD0hMCxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZGVsZXRlIHRoaXMuaXNJZ25vcmluZ01vdXNlVXB9LmJpbmQodGhpcyksNDAwKSl9fSxzLnN0YXRpY0NsaWNrPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJzdGF0aWNDbGlja1wiLFt0LGVdKX0sbi5nZXRQb2ludGVyUG9pbnQ9ZS5nZXRQb2ludGVyUG9pbnQsbn0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2RyYWdcIixbXCIuL2ZsaWNraXR5XCIsXCJ1bmlkcmFnZ2VyL3VuaWRyYWdnZXJcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbixzKXtyZXR1cm4gZSh0LGksbixzKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwidW5pZHJhZ2dlclwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOnQuRmxpY2tpdHk9ZSh0LHQuRmxpY2tpdHksdC5VbmlkcmFnZ2VyLHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpLG4pe2Z1bmN0aW9uIHMoKXtyZXR1cm57eDp0LnBhZ2VYT2Zmc2V0LHk6dC5wYWdlWU9mZnNldH19bi5leHRlbmQoZS5kZWZhdWx0cyx7ZHJhZ2dhYmxlOiEwLGRyYWdUaHJlc2hvbGQ6M30pLGUuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZURyYWdcIik7dmFyIG89ZS5wcm90b3R5cGU7bi5leHRlbmQobyxpLnByb3RvdHlwZSk7dmFyIHI9XCJjcmVhdGVUb3VjaFwiaW4gZG9jdW1lbnQsYT0hMTtvLl9jcmVhdGVEcmFnPWZ1bmN0aW9uKCl7dGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5iaW5kRHJhZyksdGhpcy5vbihcInVpQ2hhbmdlXCIsdGhpcy5fdWlDaGFuZ2VEcmFnKSx0aGlzLm9uKFwiY2hpbGRVSVBvaW50ZXJEb3duXCIsdGhpcy5fY2hpbGRVSVBvaW50ZXJEb3duRHJhZyksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLnVuYmluZERyYWcpLHImJiFhJiYodC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsZnVuY3Rpb24oKXt9KSxhPSEwKX0sby5iaW5kRHJhZz1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5kcmFnZ2FibGUmJiF0aGlzLmlzRHJhZ0JvdW5kJiYodGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJpcy1kcmFnZ2FibGVcIiksdGhpcy5oYW5kbGVzPVt0aGlzLnZpZXdwb3J0XSx0aGlzLmJpbmRIYW5kbGVzKCksdGhpcy5pc0RyYWdCb3VuZD0hMCl9LG8udW5iaW5kRHJhZz1mdW5jdGlvbigpe3RoaXMuaXNEcmFnQm91bmQmJih0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImlzLWRyYWdnYWJsZVwiKSx0aGlzLnVuYmluZEhhbmRsZXMoKSxkZWxldGUgdGhpcy5pc0RyYWdCb3VuZCl9LG8uX3VpQ2hhbmdlRHJhZz1mdW5jdGlvbigpe2RlbGV0ZSB0aGlzLmlzRnJlZVNjcm9sbGluZ30sby5fY2hpbGRVSVBvaW50ZXJEb3duRHJhZz1mdW5jdGlvbih0KXt0LnByZXZlbnREZWZhdWx0KCksdGhpcy5wb2ludGVyRG93bkZvY3VzKHQpfTt2YXIgbD17VEVYVEFSRUE6ITAsSU5QVVQ6ITAsT1BUSU9OOiEwfSxoPXtyYWRpbzohMCxjaGVja2JveDohMCxidXR0b246ITAsc3VibWl0OiEwLGltYWdlOiEwLGZpbGU6ITB9O28ucG9pbnRlckRvd249ZnVuY3Rpb24oZSxpKXt2YXIgbj1sW2UudGFyZ2V0Lm5vZGVOYW1lXSYmIWhbZS50YXJnZXQudHlwZV07aWYobilyZXR1cm4gdGhpcy5pc1BvaW50ZXJEb3duPSExLHZvaWQgZGVsZXRlIHRoaXMucG9pbnRlcklkZW50aWZpZXI7dGhpcy5fZHJhZ1BvaW50ZXJEb3duKGUsaSk7dmFyIG89ZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtvJiZvLmJsdXImJm8hPXRoaXMuZWxlbWVudCYmbyE9ZG9jdW1lbnQuYm9keSYmby5ibHVyKCksdGhpcy5wb2ludGVyRG93bkZvY3VzKGUpLHRoaXMuZHJhZ1g9dGhpcy54LHRoaXMudmlld3BvcnQuY2xhc3NMaXN0LmFkZChcImlzLXBvaW50ZXItZG93blwiKSx0aGlzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzKGUpLHRoaXMucG9pbnRlckRvd25TY3JvbGw9cygpLHQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLHRoaXMpLHRoaXMuZGlzcGF0Y2hFdmVudChcInBvaW50ZXJEb3duXCIsZSxbaV0pfTt2YXIgYz17dG91Y2hzdGFydDohMCxNU1BvaW50ZXJEb3duOiEwfSxkPXtJTlBVVDohMCxTRUxFQ1Q6ITB9O3JldHVybiBvLnBvaW50ZXJEb3duRm9jdXM9ZnVuY3Rpb24oZSl7aWYodGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkmJiFjW2UudHlwZV0mJiFkW2UudGFyZ2V0Lm5vZGVOYW1lXSl7dmFyIGk9dC5wYWdlWU9mZnNldDt0aGlzLmVsZW1lbnQuZm9jdXMoKSx0LnBhZ2VZT2Zmc2V0IT1pJiZ0LnNjcm9sbFRvKHQucGFnZVhPZmZzZXQsaSl9fSxvLmNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93bj1mdW5jdGlvbih0KXt2YXIgZT1cInRvdWNoc3RhcnRcIj09dC50eXBlLGk9dC50YXJnZXQubm9kZU5hbWU7cmV0dXJuIWUmJlwiU0VMRUNUXCIhPWl9LG8uaGFzRHJhZ1N0YXJ0ZWQ9ZnVuY3Rpb24odCl7cmV0dXJuIE1hdGguYWJzKHQueCk+dGhpcy5vcHRpb25zLmRyYWdUaHJlc2hvbGR9LG8ucG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7ZGVsZXRlIHRoaXMuaXNUb3VjaFNjcm9sbGluZyx0aGlzLnZpZXdwb3J0LmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1wb2ludGVyLWRvd25cIiksdGhpcy5kaXNwYXRjaEV2ZW50KFwicG9pbnRlclVwXCIsdCxbZV0pLHRoaXMuX2RyYWdQb2ludGVyVXAodCxlKX0sby5wb2ludGVyRG9uZT1mdW5jdGlvbigpe3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLHRoaXMpLGRlbGV0ZSB0aGlzLnBvaW50ZXJEb3duU2Nyb2xsfSxvLmRyYWdTdGFydD1mdW5jdGlvbihlLGkpe3RoaXMuZHJhZ1N0YXJ0UG9zaXRpb249dGhpcy54LHRoaXMuc3RhcnRBbmltYXRpb24oKSx0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIix0aGlzKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJkcmFnU3RhcnRcIixlLFtpXSl9LG8ucG9pbnRlck1vdmU9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9kcmFnUG9pbnRlck1vdmUodCxlKTt0aGlzLmRpc3BhdGNoRXZlbnQoXCJwb2ludGVyTW92ZVwiLHQsW2UsaV0pLHRoaXMuX2RyYWdNb3ZlKHQsZSxpKX0sby5kcmFnTW92ZT1mdW5jdGlvbih0LGUsaSl7dC5wcmV2ZW50RGVmYXVsdCgpLHRoaXMucHJldmlvdXNEcmFnWD10aGlzLmRyYWdYO3ZhciBuPXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdD8tMToxLHM9dGhpcy5kcmFnU3RhcnRQb3NpdGlvbitpLngqbjtpZighdGhpcy5vcHRpb25zLndyYXBBcm91bmQmJnRoaXMuc2xpZGVzLmxlbmd0aCl7dmFyIG89TWF0aC5tYXgoLXRoaXMuc2xpZGVzWzBdLnRhcmdldCx0aGlzLmRyYWdTdGFydFBvc2l0aW9uKTtzPXM+bz8uNSoocytvKTpzO3ZhciByPU1hdGgubWluKC10aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldCx0aGlzLmRyYWdTdGFydFBvc2l0aW9uKTtzPXM8cj8uNSoocytyKTpzfXRoaXMuZHJhZ1g9cyx0aGlzLmRyYWdNb3ZlVGltZT1uZXcgRGF0ZSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJkcmFnTW92ZVwiLHQsW2UsaV0pfSxvLmRyYWdFbmQ9ZnVuY3Rpb24odCxlKXt0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCYmKHRoaXMuaXNGcmVlU2Nyb2xsaW5nPSEwKTt2YXIgaT10aGlzLmRyYWdFbmRSZXN0aW5nU2VsZWN0KCk7aWYodGhpcy5vcHRpb25zLmZyZWVTY3JvbGwmJiF0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCl7dmFyIG49dGhpcy5nZXRSZXN0aW5nUG9zaXRpb24oKTt0aGlzLmlzRnJlZVNjcm9sbGluZz0tbj50aGlzLnNsaWRlc1swXS50YXJnZXQmJi1uPHRoaXMuZ2V0TGFzdFNsaWRlKCkudGFyZ2V0fWVsc2UgdGhpcy5vcHRpb25zLmZyZWVTY3JvbGx8fGkhPXRoaXMuc2VsZWN0ZWRJbmRleHx8KGkrPXRoaXMuZHJhZ0VuZEJvb3N0U2VsZWN0KCkpO2RlbGV0ZSB0aGlzLnByZXZpb3VzRHJhZ1gsdGhpcy5pc0RyYWdTZWxlY3Q9dGhpcy5vcHRpb25zLndyYXBBcm91bmQsdGhpcy5zZWxlY3QoaSksZGVsZXRlIHRoaXMuaXNEcmFnU2VsZWN0LHRoaXMuZGlzcGF0Y2hFdmVudChcImRyYWdFbmRcIix0LFtlXSl9LG8uZHJhZ0VuZFJlc3RpbmdTZWxlY3Q9ZnVuY3Rpb24oKXtcbnZhciB0PXRoaXMuZ2V0UmVzdGluZ1Bvc2l0aW9uKCksZT1NYXRoLmFicyh0aGlzLmdldFNsaWRlRGlzdGFuY2UoLXQsdGhpcy5zZWxlY3RlZEluZGV4KSksaT10aGlzLl9nZXRDbG9zZXN0UmVzdGluZyh0LGUsMSksbj10aGlzLl9nZXRDbG9zZXN0UmVzdGluZyh0LGUsLTEpLHM9aS5kaXN0YW5jZTxuLmRpc3RhbmNlP2kuaW5kZXg6bi5pbmRleDtyZXR1cm4gc30sby5fZ2V0Q2xvc2VzdFJlc3Rpbmc9ZnVuY3Rpb24odCxlLGkpe2Zvcih2YXIgbj10aGlzLnNlbGVjdGVkSW5kZXgscz0xLzAsbz10aGlzLm9wdGlvbnMuY29udGFpbiYmIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kP2Z1bmN0aW9uKHQsZSl7cmV0dXJuIHQ8PWV9OmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQ8ZX07byhlLHMpJiYobis9aSxzPWUsZT10aGlzLmdldFNsaWRlRGlzdGFuY2UoLXQsbiksbnVsbCE9PWUpOyllPU1hdGguYWJzKGUpO3JldHVybntkaXN0YW5jZTpzLGluZGV4Om4taX19LG8uZ2V0U2xpZGVEaXN0YW5jZT1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuc2xpZGVzLmxlbmd0aCxzPXRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZpPjEsbz1zP24ubW9kdWxvKGUsaSk6ZSxyPXRoaXMuc2xpZGVzW29dO2lmKCFyKXJldHVybiBudWxsO3ZhciBhPXM/dGhpcy5zbGlkZWFibGVXaWR0aCpNYXRoLmZsb29yKGUvaSk6MDtyZXR1cm4gdC0oci50YXJnZXQrYSl9LG8uZHJhZ0VuZEJvb3N0U2VsZWN0PWZ1bmN0aW9uKCl7aWYodm9pZCAwPT09dGhpcy5wcmV2aW91c0RyYWdYfHwhdGhpcy5kcmFnTW92ZVRpbWV8fG5ldyBEYXRlLXRoaXMuZHJhZ01vdmVUaW1lPjEwMClyZXR1cm4gMDt2YXIgdD10aGlzLmdldFNsaWRlRGlzdGFuY2UoLXRoaXMuZHJhZ1gsdGhpcy5zZWxlY3RlZEluZGV4KSxlPXRoaXMucHJldmlvdXNEcmFnWC10aGlzLmRyYWdYO3JldHVybiB0PjAmJmU+MD8xOnQ8MCYmZTwwPy0xOjB9LG8uc3RhdGljQ2xpY2s9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLmdldFBhcmVudENlbGwodC50YXJnZXQpLG49aSYmaS5lbGVtZW50LHM9aSYmdGhpcy5jZWxscy5pbmRleE9mKGkpO3RoaXMuZGlzcGF0Y2hFdmVudChcInN0YXRpY0NsaWNrXCIsdCxbZSxuLHNdKX0sby5vbnNjcm9sbD1mdW5jdGlvbigpe3ZhciB0PXMoKSxlPXRoaXMucG9pbnRlckRvd25TY3JvbGwueC10LngsaT10aGlzLnBvaW50ZXJEb3duU2Nyb2xsLnktdC55OyhNYXRoLmFicyhlKT4zfHxNYXRoLmFicyhpKT4zKSYmdGhpcy5fcG9pbnRlckRvbmUoKX0sZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcInRhcC1saXN0ZW5lci90YXAtbGlzdGVuZXJcIixbXCJ1bmlwb2ludGVyL3VuaXBvaW50ZXJcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwidW5pcG9pbnRlclwiKSk6dC5UYXBMaXN0ZW5lcj1lKHQsdC5Vbmlwb2ludGVyKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSh0KXt0aGlzLmJpbmRUYXAodCl9dmFyIG49aS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSk7cmV0dXJuIG4uYmluZFRhcD1mdW5jdGlvbih0KXt0JiYodGhpcy51bmJpbmRUYXAoKSx0aGlzLnRhcEVsZW1lbnQ9dCx0aGlzLl9iaW5kU3RhcnRFdmVudCh0LCEwKSl9LG4udW5iaW5kVGFwPWZ1bmN0aW9uKCl7dGhpcy50YXBFbGVtZW50JiYodGhpcy5fYmluZFN0YXJ0RXZlbnQodGhpcy50YXBFbGVtZW50LCEwKSxkZWxldGUgdGhpcy50YXBFbGVtZW50KX0sbi5wb2ludGVyVXA9ZnVuY3Rpb24oaSxuKXtpZighdGhpcy5pc0lnbm9yaW5nTW91c2VVcHx8XCJtb3VzZXVwXCIhPWkudHlwZSl7dmFyIHM9ZS5nZXRQb2ludGVyUG9pbnQobiksbz10aGlzLnRhcEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkscj10LnBhZ2VYT2Zmc2V0LGE9dC5wYWdlWU9mZnNldCxsPXMueD49by5sZWZ0K3ImJnMueDw9by5yaWdodCtyJiZzLnk+PW8udG9wK2EmJnMueTw9by5ib3R0b20rYTtpZihsJiZ0aGlzLmVtaXRFdmVudChcInRhcFwiLFtpLG5dKSxcIm1vdXNldXBcIiE9aS50eXBlKXt0aGlzLmlzSWdub3JpbmdNb3VzZVVwPSEwO3ZhciBoPXRoaXM7c2V0VGltZW91dChmdW5jdGlvbigpe2RlbGV0ZSBoLmlzSWdub3JpbmdNb3VzZVVwfSw0MDApfX19LG4uZGVzdHJveT1mdW5jdGlvbigpe3RoaXMucG9pbnRlckRvbmUoKSx0aGlzLnVuYmluZFRhcCgpfSxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvcHJldi1uZXh0LWJ1dHRvblwiLFtcIi4vZmxpY2tpdHlcIixcInRhcC1saXN0ZW5lci90YXAtbGlzdGVuZXJcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbixzKXtyZXR1cm4gZSh0LGksbixzKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwidGFwLWxpc3RlbmVyXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6ZSh0LHQuRmxpY2tpdHksdC5UYXBMaXN0ZW5lcix0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBzKHQsZSl7dGhpcy5kaXJlY3Rpb249dCx0aGlzLnBhcmVudD1lLHRoaXMuX2NyZWF0ZSgpfWZ1bmN0aW9uIG8odCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHQ/dDpcIk0gXCIrdC54MCtcIiw1MCBMIFwiK3QueDErXCIsXCIrKHQueTErNTApK1wiIEwgXCIrdC54MitcIixcIisodC55Mis1MCkrXCIgTCBcIit0LngzK1wiLDUwICBMIFwiK3QueDIrXCIsXCIrKDUwLXQueTIpK1wiIEwgXCIrdC54MStcIixcIisoNTAtdC55MSkrXCIgWlwifXZhciByPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtzLnByb3RvdHlwZT1uZXcgaSxzLnByb3RvdHlwZS5fY3JlYXRlPWZ1bmN0aW9uKCl7dGhpcy5pc0VuYWJsZWQ9ITAsdGhpcy5pc1ByZXZpb3VzPXRoaXMuZGlyZWN0aW9uPT0tMTt2YXIgdD10aGlzLnBhcmVudC5vcHRpb25zLnJpZ2h0VG9MZWZ0PzE6LTE7dGhpcy5pc0xlZnQ9dGhpcy5kaXJlY3Rpb249PXQ7dmFyIGU9dGhpcy5lbGVtZW50PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7ZS5jbGFzc05hbWU9XCJmbGlja2l0eS1wcmV2LW5leHQtYnV0dG9uXCIsZS5jbGFzc05hbWUrPXRoaXMuaXNQcmV2aW91cz9cIiBwcmV2aW91c1wiOlwiIG5leHRcIixlLnNldEF0dHJpYnV0ZShcInR5cGVcIixcImJ1dHRvblwiKSx0aGlzLmRpc2FibGUoKSxlLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIix0aGlzLmlzUHJldmlvdXM/XCJwcmV2aW91c1wiOlwibmV4dFwiKTt2YXIgaT10aGlzLmNyZWF0ZVNWRygpO2UuYXBwZW5kQ2hpbGQoaSksdGhpcy5vbihcInRhcFwiLHRoaXMub25UYXApLHRoaXMucGFyZW50Lm9uKFwic2VsZWN0XCIsdGhpcy51cGRhdGUuYmluZCh0aGlzKSksdGhpcy5vbihcInBvaW50ZXJEb3duXCIsdGhpcy5wYXJlbnQuY2hpbGRVSVBvaW50ZXJEb3duLmJpbmQodGhpcy5wYXJlbnQpKX0scy5wcm90b3R5cGUuYWN0aXZhdGU9ZnVuY3Rpb24oKXt0aGlzLmJpbmRUYXAodGhpcy5lbGVtZW50KSx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsdGhpcyksdGhpcy5wYXJlbnQuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpfSxzLnByb3RvdHlwZS5kZWFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5wYXJlbnQuZWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpLGkucHJvdG90eXBlLmRlc3Ryb3kuY2FsbCh0aGlzKSx0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsdGhpcyl9LHMucHJvdG90eXBlLmNyZWF0ZVNWRz1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhyLFwic3ZnXCIpO3Quc2V0QXR0cmlidXRlKFwidmlld0JveFwiLFwiMCAwIDEwMCAxMDBcIik7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHIsXCJwYXRoXCIpLGk9byh0aGlzLnBhcmVudC5vcHRpb25zLmFycm93U2hhcGUpO3JldHVybiBlLnNldEF0dHJpYnV0ZShcImRcIixpKSxlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsXCJhcnJvd1wiKSx0aGlzLmlzTGVmdHx8ZS5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIixcInRyYW5zbGF0ZSgxMDAsIDEwMCkgcm90YXRlKDE4MCkgXCIpLHQuYXBwZW5kQ2hpbGQoZSksdH0scy5wcm90b3R5cGUub25UYXA9ZnVuY3Rpb24oKXtpZih0aGlzLmlzRW5hYmxlZCl7dGhpcy5wYXJlbnQudWlDaGFuZ2UoKTt2YXIgdD10aGlzLmlzUHJldmlvdXM/XCJwcmV2aW91c1wiOlwibmV4dFwiO3RoaXMucGFyZW50W3RdKCl9fSxzLnByb3RvdHlwZS5oYW5kbGVFdmVudD1uLmhhbmRsZUV2ZW50LHMucHJvdG90eXBlLm9uY2xpY2s9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5hY3RpdmVFbGVtZW50O3QmJnQ9PXRoaXMuZWxlbWVudCYmdGhpcy5vblRhcCgpfSxzLnByb3RvdHlwZS5lbmFibGU9ZnVuY3Rpb24oKXt0aGlzLmlzRW5hYmxlZHx8KHRoaXMuZWxlbWVudC5kaXNhYmxlZD0hMSx0aGlzLmlzRW5hYmxlZD0hMCl9LHMucHJvdG90eXBlLmRpc2FibGU9ZnVuY3Rpb24oKXt0aGlzLmlzRW5hYmxlZCYmKHRoaXMuZWxlbWVudC5kaXNhYmxlZD0hMCx0aGlzLmlzRW5hYmxlZD0hMSl9LHMucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbigpe3ZhciB0PXRoaXMucGFyZW50LnNsaWRlcztpZih0aGlzLnBhcmVudC5vcHRpb25zLndyYXBBcm91bmQmJnQubGVuZ3RoPjEpcmV0dXJuIHZvaWQgdGhpcy5lbmFibGUoKTt2YXIgZT10Lmxlbmd0aD90Lmxlbmd0aC0xOjAsaT10aGlzLmlzUHJldmlvdXM/MDplLG49dGhpcy5wYXJlbnQuc2VsZWN0ZWRJbmRleD09aT9cImRpc2FibGVcIjpcImVuYWJsZVwiO3RoaXNbbl0oKX0scy5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuZGVhY3RpdmF0ZSgpfSxuLmV4dGVuZChlLmRlZmF1bHRzLHtwcmV2TmV4dEJ1dHRvbnM6ITAsYXJyb3dTaGFwZTp7eDA6MTAseDE6NjAseTE6NTAseDI6NzAseTI6NDAseDM6MzB9fSksZS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlUHJldk5leHRCdXR0b25zXCIpO3ZhciBhPWUucHJvdG90eXBlO3JldHVybiBhLl9jcmVhdGVQcmV2TmV4dEJ1dHRvbnM9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMucHJldk5leHRCdXR0b25zJiYodGhpcy5wcmV2QnV0dG9uPW5ldyBzKCgtMSksdGhpcyksdGhpcy5uZXh0QnV0dG9uPW5ldyBzKDEsdGhpcyksdGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5hY3RpdmF0ZVByZXZOZXh0QnV0dG9ucykpfSxhLmFjdGl2YXRlUHJldk5leHRCdXR0b25zPWZ1bmN0aW9uKCl7dGhpcy5wcmV2QnV0dG9uLmFjdGl2YXRlKCksdGhpcy5uZXh0QnV0dG9uLmFjdGl2YXRlKCksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMpfSxhLmRlYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnM9ZnVuY3Rpb24oKXt0aGlzLnByZXZCdXR0b24uZGVhY3RpdmF0ZSgpLHRoaXMubmV4dEJ1dHRvbi5kZWFjdGl2YXRlKCksdGhpcy5vZmYoXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlUHJldk5leHRCdXR0b25zKX0sZS5QcmV2TmV4dEJ1dHRvbj1zLGV9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9wYWdlLWRvdHNcIixbXCIuL2ZsaWNraXR5XCIsXCJ0YXAtbGlzdGVuZXIvdGFwLWxpc3RlbmVyXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4scyl7cmV0dXJuIGUodCxpLG4scyl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcInRhcC1saXN0ZW5lclwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOmUodCx0LkZsaWNraXR5LHQuVGFwTGlzdGVuZXIsdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGksbil7ZnVuY3Rpb24gcyh0KXt0aGlzLnBhcmVudD10LHRoaXMuX2NyZWF0ZSgpfXMucHJvdG90eXBlPW5ldyBpLHMucHJvdG90eXBlLl9jcmVhdGU9ZnVuY3Rpb24oKXt0aGlzLmhvbGRlcj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib2xcIiksdGhpcy5ob2xkZXIuY2xhc3NOYW1lPVwiZmxpY2tpdHktcGFnZS1kb3RzXCIsdGhpcy5kb3RzPVtdLHRoaXMub24oXCJ0YXBcIix0aGlzLm9uVGFwKSx0aGlzLm9uKFwicG9pbnRlckRvd25cIix0aGlzLnBhcmVudC5jaGlsZFVJUG9pbnRlckRvd24uYmluZCh0aGlzLnBhcmVudCkpfSxzLnByb3RvdHlwZS5hY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMuc2V0RG90cygpLHRoaXMuYmluZFRhcCh0aGlzLmhvbGRlciksdGhpcy5wYXJlbnQuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmhvbGRlcil9LHMucHJvdG90eXBlLmRlYWN0aXZhdGU9ZnVuY3Rpb24oKXt0aGlzLnBhcmVudC5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuaG9sZGVyKSxpLnByb3RvdHlwZS5kZXN0cm95LmNhbGwodGhpcyl9LHMucHJvdG90eXBlLnNldERvdHM9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLnBhcmVudC5zbGlkZXMubGVuZ3RoLXRoaXMuZG90cy5sZW5ndGg7dD4wP3RoaXMuYWRkRG90cyh0KTp0PDAmJnRoaXMucmVtb3ZlRG90cygtdCl9LHMucHJvdG90eXBlLmFkZERvdHM9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPWRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSxpPVtdO3Q7KXt2YXIgbj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7bi5jbGFzc05hbWU9XCJkb3RcIixlLmFwcGVuZENoaWxkKG4pLGkucHVzaChuKSx0LS19dGhpcy5ob2xkZXIuYXBwZW5kQ2hpbGQoZSksdGhpcy5kb3RzPXRoaXMuZG90cy5jb25jYXQoaSl9LHMucHJvdG90eXBlLnJlbW92ZURvdHM9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5kb3RzLnNwbGljZSh0aGlzLmRvdHMubGVuZ3RoLXQsdCk7ZS5mb3JFYWNoKGZ1bmN0aW9uKHQpe3RoaXMuaG9sZGVyLnJlbW92ZUNoaWxkKHQpfSx0aGlzKX0scy5wcm90b3R5cGUudXBkYXRlU2VsZWN0ZWQ9ZnVuY3Rpb24oKXt0aGlzLnNlbGVjdGVkRG90JiYodGhpcy5zZWxlY3RlZERvdC5jbGFzc05hbWU9XCJkb3RcIiksdGhpcy5kb3RzLmxlbmd0aCYmKHRoaXMuc2VsZWN0ZWREb3Q9dGhpcy5kb3RzW3RoaXMucGFyZW50LnNlbGVjdGVkSW5kZXhdLHRoaXMuc2VsZWN0ZWREb3QuY2xhc3NOYW1lPVwiZG90IGlzLXNlbGVjdGVkXCIpfSxzLnByb3RvdHlwZS5vblRhcD1mdW5jdGlvbih0KXt2YXIgZT10LnRhcmdldDtpZihcIkxJXCI9PWUubm9kZU5hbWUpe3RoaXMucGFyZW50LnVpQ2hhbmdlKCk7dmFyIGk9dGhpcy5kb3RzLmluZGV4T2YoZSk7dGhpcy5wYXJlbnQuc2VsZWN0KGkpfX0scy5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuZGVhY3RpdmF0ZSgpfSxlLlBhZ2VEb3RzPXMsbi5leHRlbmQoZS5kZWZhdWx0cyx7cGFnZURvdHM6ITB9KSxlLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVQYWdlRG90c1wiKTt2YXIgbz1lLnByb3RvdHlwZTtyZXR1cm4gby5fY3JlYXRlUGFnZURvdHM9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMucGFnZURvdHMmJih0aGlzLnBhZ2VEb3RzPW5ldyBzKHRoaXMpLHRoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYWN0aXZhdGVQYWdlRG90cyksdGhpcy5vbihcInNlbGVjdFwiLHRoaXMudXBkYXRlU2VsZWN0ZWRQYWdlRG90cyksdGhpcy5vbihcImNlbGxDaGFuZ2VcIix0aGlzLnVwZGF0ZVBhZ2VEb3RzKSx0aGlzLm9uKFwicmVzaXplXCIsdGhpcy51cGRhdGVQYWdlRG90cyksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVQYWdlRG90cykpfSxvLmFjdGl2YXRlUGFnZURvdHM9ZnVuY3Rpb24oKXt0aGlzLnBhZ2VEb3RzLmFjdGl2YXRlKCl9LG8udXBkYXRlU2VsZWN0ZWRQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMucGFnZURvdHMudXBkYXRlU2VsZWN0ZWQoKX0sby51cGRhdGVQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMucGFnZURvdHMuc2V0RG90cygpfSxvLmRlYWN0aXZhdGVQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMucGFnZURvdHMuZGVhY3RpdmF0ZSgpfSxlLlBhZ2VEb3RzPXMsZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL3BsYXllclwiLFtcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIixcIi4vZmxpY2tpdHlcIl0sZnVuY3Rpb24odCxpLG4pe3JldHVybiBlKHQsaSxuKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUocmVxdWlyZShcImV2LWVtaXR0ZXJcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpLHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpKTplKHQuRXZFbWl0dGVyLHQuZml6enlVSVV0aWxzLHQuRmxpY2tpdHkpfSh3aW5kb3csZnVuY3Rpb24odCxlLGkpe2Z1bmN0aW9uIG4odCl7dGhpcy5wYXJlbnQ9dCx0aGlzLnN0YXRlPVwic3RvcHBlZFwiLG8mJih0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZT1mdW5jdGlvbigpe3RoaXMudmlzaWJpbGl0eUNoYW5nZSgpfS5iaW5kKHRoaXMpLHRoaXMub25WaXNpYmlsaXR5UGxheT1mdW5jdGlvbigpe3RoaXMudmlzaWJpbGl0eVBsYXkoKX0uYmluZCh0aGlzKSl9dmFyIHMsbztcImhpZGRlblwiaW4gZG9jdW1lbnQ/KHM9XCJoaWRkZW5cIixvPVwidmlzaWJpbGl0eWNoYW5nZVwiKTpcIndlYmtpdEhpZGRlblwiaW4gZG9jdW1lbnQmJihzPVwid2Via2l0SGlkZGVuXCIsbz1cIndlYmtpdHZpc2liaWxpdHljaGFuZ2VcIiksbi5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZSh0LnByb3RvdHlwZSksbi5wcm90b3R5cGUucGxheT1mdW5jdGlvbigpe2lmKFwicGxheWluZ1wiIT10aGlzLnN0YXRlKXt2YXIgdD1kb2N1bWVudFtzXTtpZihvJiZ0KXJldHVybiB2b2lkIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIobyx0aGlzLm9uVmlzaWJpbGl0eVBsYXkpO3RoaXMuc3RhdGU9XCJwbGF5aW5nXCIsbyYmZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihvLHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlKSx0aGlzLnRpY2soKX19LG4ucHJvdG90eXBlLnRpY2s9ZnVuY3Rpb24oKXtpZihcInBsYXlpbmdcIj09dGhpcy5zdGF0ZSl7dmFyIHQ9dGhpcy5wYXJlbnQub3B0aW9ucy5hdXRvUGxheTt0PVwibnVtYmVyXCI9PXR5cGVvZiB0P3Q6M2UzO3ZhciBlPXRoaXM7dGhpcy5jbGVhcigpLHRoaXMudGltZW91dD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS5wYXJlbnQubmV4dCghMCksZS50aWNrKCl9LHQpfX0sbi5wcm90b3R5cGUuc3RvcD1mdW5jdGlvbigpe3RoaXMuc3RhdGU9XCJzdG9wcGVkXCIsdGhpcy5jbGVhcigpLG8mJmRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobyx0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZSl9LG4ucHJvdG90eXBlLmNsZWFyPWZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCl9LG4ucHJvdG90eXBlLnBhdXNlPWZ1bmN0aW9uKCl7XCJwbGF5aW5nXCI9PXRoaXMuc3RhdGUmJih0aGlzLnN0YXRlPVwicGF1c2VkXCIsdGhpcy5jbGVhcigpKX0sbi5wcm90b3R5cGUudW5wYXVzZT1mdW5jdGlvbigpe1wicGF1c2VkXCI9PXRoaXMuc3RhdGUmJnRoaXMucGxheSgpfSxuLnByb3RvdHlwZS52aXNpYmlsaXR5Q2hhbmdlPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnRbc107dGhpc1t0P1wicGF1c2VcIjpcInVucGF1c2VcIl0oKX0sbi5wcm90b3R5cGUudmlzaWJpbGl0eVBsYXk9ZnVuY3Rpb24oKXt0aGlzLnBsYXkoKSxkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKG8sdGhpcy5vblZpc2liaWxpdHlQbGF5KX0sZS5leHRlbmQoaS5kZWZhdWx0cyx7cGF1c2VBdXRvUGxheU9uSG92ZXI6ITB9KSxpLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVQbGF5ZXJcIik7dmFyIHI9aS5wcm90b3R5cGU7cmV0dXJuIHIuX2NyZWF0ZVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyPW5ldyBuKHRoaXMpLHRoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYWN0aXZhdGVQbGF5ZXIpLHRoaXMub24oXCJ1aUNoYW5nZVwiLHRoaXMuc3RvcFBsYXllciksdGhpcy5vbihcInBvaW50ZXJEb3duXCIsdGhpcy5zdG9wUGxheWVyKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZVBsYXllcil9LHIuYWN0aXZhdGVQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMuYXV0b1BsYXkmJih0aGlzLnBsYXllci5wbGF5KCksdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsdGhpcykpfSxyLnBsYXlQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci5wbGF5KCl9LHIuc3RvcFBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnN0b3AoKX0sci5wYXVzZVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnBhdXNlKCl9LHIudW5wYXVzZVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnVucGF1c2UoKX0sci5kZWFjdGl2YXRlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIuc3RvcCgpLHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLHRoaXMpfSxyLm9ubW91c2VlbnRlcj1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5wYXVzZUF1dG9QbGF5T25Ib3ZlciYmKHRoaXMucGxheWVyLnBhdXNlKCksdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsdGhpcykpfSxyLm9ubW91c2VsZWF2ZT1mdW5jdGlvbigpe3RoaXMucGxheWVyLnVucGF1c2UoKSx0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIix0aGlzKX0saS5QbGF5ZXI9bixpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvYWRkLXJlbW92ZS1jZWxsXCIsW1wiLi9mbGlja2l0eVwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuKXtyZXR1cm4gZSh0LGksbil9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTplKHQsdC5GbGlja2l0eSx0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSl7ZnVuY3Rpb24gbih0KXt2YXIgZT1kb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0KXtlLmFwcGVuZENoaWxkKHQuZWxlbWVudCl9KSxlfXZhciBzPWUucHJvdG90eXBlO3JldHVybiBzLmluc2VydD1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX21ha2VDZWxscyh0KTtpZihpJiZpLmxlbmd0aCl7dmFyIHM9dGhpcy5jZWxscy5sZW5ndGg7ZT12b2lkIDA9PT1lP3M6ZTt2YXIgbz1uKGkpLHI9ZT09cztpZihyKXRoaXMuc2xpZGVyLmFwcGVuZENoaWxkKG8pO2Vsc2V7dmFyIGE9dGhpcy5jZWxsc1tlXS5lbGVtZW50O3RoaXMuc2xpZGVyLmluc2VydEJlZm9yZShvLGEpfWlmKDA9PT1lKXRoaXMuY2VsbHM9aS5jb25jYXQodGhpcy5jZWxscyk7ZWxzZSBpZihyKXRoaXMuY2VsbHM9dGhpcy5jZWxscy5jb25jYXQoaSk7ZWxzZXt2YXIgbD10aGlzLmNlbGxzLnNwbGljZShlLHMtZSk7dGhpcy5jZWxscz10aGlzLmNlbGxzLmNvbmNhdChpKS5jb25jYXQobCl9dGhpcy5fc2l6ZUNlbGxzKGkpO3ZhciBoPWU+dGhpcy5zZWxlY3RlZEluZGV4PzA6aS5sZW5ndGg7dGhpcy5fY2VsbEFkZGVkUmVtb3ZlZChlLGgpfX0scy5hcHBlbmQ9ZnVuY3Rpb24odCl7dGhpcy5pbnNlcnQodCx0aGlzLmNlbGxzLmxlbmd0aCl9LHMucHJlcGVuZD1mdW5jdGlvbih0KXt0aGlzLmluc2VydCh0LDApfSxzLnJlbW92ZT1mdW5jdGlvbih0KXt2YXIgZSxuLHM9dGhpcy5nZXRDZWxscyh0KSxvPTAscj1zLmxlbmd0aDtmb3IoZT0wO2U8cjtlKyspe249c1tlXTt2YXIgYT10aGlzLmNlbGxzLmluZGV4T2Yobik8dGhpcy5zZWxlY3RlZEluZGV4O28tPWE/MTowfWZvcihlPTA7ZTxyO2UrKyluPXNbZV0sbi5yZW1vdmUoKSxpLnJlbW92ZUZyb20odGhpcy5jZWxscyxuKTtzLmxlbmd0aCYmdGhpcy5fY2VsbEFkZGVkUmVtb3ZlZCgwLG8pfSxzLl9jZWxsQWRkZWRSZW1vdmVkPWZ1bmN0aW9uKHQsZSl7ZT1lfHwwLHRoaXMuc2VsZWN0ZWRJbmRleCs9ZSx0aGlzLnNlbGVjdGVkSW5kZXg9TWF0aC5tYXgoMCxNYXRoLm1pbih0aGlzLnNsaWRlcy5sZW5ndGgtMSx0aGlzLnNlbGVjdGVkSW5kZXgpKSx0aGlzLmNlbGxDaGFuZ2UodCwhMCksdGhpcy5lbWl0RXZlbnQoXCJjZWxsQWRkZWRSZW1vdmVkXCIsW3QsZV0pfSxzLmNlbGxTaXplQ2hhbmdlPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0Q2VsbCh0KTtpZihlKXtlLmdldFNpemUoKTt2YXIgaT10aGlzLmNlbGxzLmluZGV4T2YoZSk7dGhpcy5jZWxsQ2hhbmdlKGkpfX0scy5jZWxsQ2hhbmdlPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5zbGlkZWFibGVXaWR0aDtpZih0aGlzLl9wb3NpdGlvbkNlbGxzKHQpLHRoaXMuX2dldFdyYXBTaGlmdENlbGxzKCksdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpLHRoaXMuZW1pdEV2ZW50KFwiY2VsbENoYW5nZVwiLFt0XSksdGhpcy5vcHRpb25zLmZyZWVTY3JvbGwpe3ZhciBuPWktdGhpcy5zbGlkZWFibGVXaWR0aDt0aGlzLngrPW4qdGhpcy5jZWxsQWxpZ24sdGhpcy5wb3NpdGlvblNsaWRlcigpfWVsc2UgZSYmdGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKSx0aGlzLnNlbGVjdCh0aGlzLnNlbGVjdGVkSW5kZXgpfSxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvbGF6eWxvYWRcIixbXCIuL2ZsaWNraXR5XCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4pe3JldHVybiBlKHQsaSxuKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOmUodCx0LkZsaWNraXR5LHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe2lmKFwiSU1HXCI9PXQubm9kZU5hbWUmJnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1mbGlja2l0eS1sYXp5bG9hZFwiKSlyZXR1cm5bdF07dmFyIGU9dC5xdWVyeVNlbGVjdG9yQWxsKFwiaW1nW2RhdGEtZmxpY2tpdHktbGF6eWxvYWRdXCIpO3JldHVybiBpLm1ha2VBcnJheShlKX1mdW5jdGlvbiBzKHQsZSl7dGhpcy5pbWc9dCx0aGlzLmZsaWNraXR5PWUsdGhpcy5sb2FkKCl9ZS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlTGF6eWxvYWRcIik7dmFyIG89ZS5wcm90b3R5cGU7cmV0dXJuIG8uX2NyZWF0ZUxhenlsb2FkPWZ1bmN0aW9uKCl7dGhpcy5vbihcInNlbGVjdFwiLHRoaXMubGF6eUxvYWQpfSxvLmxhenlMb2FkPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLmxhenlMb2FkO2lmKHQpe3ZhciBlPVwibnVtYmVyXCI9PXR5cGVvZiB0P3Q6MCxpPXRoaXMuZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHMoZSksbz1bXTtpLmZvckVhY2goZnVuY3Rpb24odCl7dmFyIGU9bih0KTtvPW8uY29uY2F0KGUpfSksby5mb3JFYWNoKGZ1bmN0aW9uKHQpe25ldyBzKHQsdGhpcyl9LHRoaXMpfX0scy5wcm90b3R5cGUuaGFuZGxlRXZlbnQ9aS5oYW5kbGVFdmVudCxzLnByb3RvdHlwZS5sb2FkPWZ1bmN0aW9uKCl7dGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx0aGlzLmltZy5zcmM9dGhpcy5pbWcuZ2V0QXR0cmlidXRlKFwiZGF0YS1mbGlja2l0eS1sYXp5bG9hZFwiKSx0aGlzLmltZy5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLWZsaWNraXR5LWxhenlsb2FkXCIpfSxzLnByb3RvdHlwZS5vbmxvYWQ9ZnVuY3Rpb24odCl7dGhpcy5jb21wbGV0ZSh0LFwiZmxpY2tpdHktbGF6eWxvYWRlZFwiKX0scy5wcm90b3R5cGUub25lcnJvcj1mdW5jdGlvbih0KXt0aGlzLmNvbXBsZXRlKHQsXCJmbGlja2l0eS1sYXp5ZXJyb3JcIil9LHMucHJvdG90eXBlLmNvbXBsZXRlPWZ1bmN0aW9uKHQsZSl7dGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKTt2YXIgaT10aGlzLmZsaWNraXR5LmdldFBhcmVudENlbGwodGhpcy5pbWcpLG49aSYmaS5lbGVtZW50O3RoaXMuZmxpY2tpdHkuY2VsbFNpemVDaGFuZ2UobiksdGhpcy5pbWcuY2xhc3NMaXN0LmFkZChlKSx0aGlzLmZsaWNraXR5LmRpc3BhdGNoRXZlbnQoXCJsYXp5TG9hZFwiLHQsbil9LGUuTGF6eUxvYWRlcj1zLGV9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9pbmRleFwiLFtcIi4vZmxpY2tpdHlcIixcIi4vZHJhZ1wiLFwiLi9wcmV2LW5leHQtYnV0dG9uXCIsXCIuL3BhZ2UtZG90c1wiLFwiLi9wbGF5ZXJcIixcIi4vYWRkLXJlbW92ZS1jZWxsXCIsXCIuL2xhenlsb2FkXCJdLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzJiYobW9kdWxlLmV4cG9ydHM9ZShyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwiLi9kcmFnXCIpLHJlcXVpcmUoXCIuL3ByZXYtbmV4dC1idXR0b25cIikscmVxdWlyZShcIi4vcGFnZS1kb3RzXCIpLHJlcXVpcmUoXCIuL3BsYXllclwiKSxyZXF1aXJlKFwiLi9hZGQtcmVtb3ZlLWNlbGxcIikscmVxdWlyZShcIi4vbGF6eWxvYWRcIikpKX0od2luZG93LGZ1bmN0aW9uKHQpe3JldHVybiB0fSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHktYXMtbmF2LWZvci9hcy1uYXYtZm9yXCIsW1wiZmxpY2tpdHkvanMvaW5kZXhcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUocmVxdWlyZShcImZsaWNraXR5XCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6dC5GbGlja2l0eT1lKHQuRmxpY2tpdHksdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKHQsZSxpKXtyZXR1cm4oZS10KSppK3R9dC5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlQXNOYXZGb3JcIik7dmFyIG49dC5wcm90b3R5cGU7cmV0dXJuIG4uX2NyZWF0ZUFzTmF2Rm9yPWZ1bmN0aW9uKCl7dGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5hY3RpdmF0ZUFzTmF2Rm9yKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZUFzTmF2Rm9yKSx0aGlzLm9uKFwiZGVzdHJveVwiLHRoaXMuZGVzdHJveUFzTmF2Rm9yKTt2YXIgdD10aGlzLm9wdGlvbnMuYXNOYXZGb3I7aWYodCl7dmFyIGU9dGhpcztzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS5zZXROYXZDb21wYW5pb24odCl9KX19LG4uc2V0TmF2Q29tcGFuaW9uPWZ1bmN0aW9uKGkpe2k9ZS5nZXRRdWVyeUVsZW1lbnQoaSk7dmFyIG49dC5kYXRhKGkpO2lmKG4mJm4hPXRoaXMpe3RoaXMubmF2Q29tcGFuaW9uPW47dmFyIHM9dGhpczt0aGlzLm9uTmF2Q29tcGFuaW9uU2VsZWN0PWZ1bmN0aW9uKCl7cy5uYXZDb21wYW5pb25TZWxlY3QoKX0sbi5vbihcInNlbGVjdFwiLHRoaXMub25OYXZDb21wYW5pb25TZWxlY3QpLHRoaXMub24oXCJzdGF0aWNDbGlja1wiLHRoaXMub25OYXZTdGF0aWNDbGljayksdGhpcy5uYXZDb21wYW5pb25TZWxlY3QoITApfX0sbi5uYXZDb21wYW5pb25TZWxlY3Q9ZnVuY3Rpb24odCl7aWYodGhpcy5uYXZDb21wYW5pb24pe3ZhciBlPXRoaXMubmF2Q29tcGFuaW9uLnNlbGVjdGVkQ2VsbHNbMF0sbj10aGlzLm5hdkNvbXBhbmlvbi5jZWxscy5pbmRleE9mKGUpLHM9bit0aGlzLm5hdkNvbXBhbmlvbi5zZWxlY3RlZENlbGxzLmxlbmd0aC0xLG89TWF0aC5mbG9vcihpKG4scyx0aGlzLm5hdkNvbXBhbmlvbi5jZWxsQWxpZ24pKTtpZih0aGlzLnNlbGVjdENlbGwobywhMSx0KSx0aGlzLnJlbW92ZU5hdlNlbGVjdGVkRWxlbWVudHMoKSwhKG8+PXRoaXMuY2VsbHMubGVuZ3RoKSl7dmFyIHI9dGhpcy5jZWxscy5zbGljZShuLHMrMSk7dGhpcy5uYXZTZWxlY3RlZEVsZW1lbnRzPXIubWFwKGZ1bmN0aW9uKHQpe3JldHVybiB0LmVsZW1lbnR9KSx0aGlzLmNoYW5nZU5hdlNlbGVjdGVkQ2xhc3MoXCJhZGRcIil9fX0sbi5jaGFuZ2VOYXZTZWxlY3RlZENsYXNzPWZ1bmN0aW9uKHQpe3RoaXMubmF2U2VsZWN0ZWRFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2UuY2xhc3NMaXN0W3RdKFwiaXMtbmF2LXNlbGVjdGVkXCIpfSl9LG4uYWN0aXZhdGVBc05hdkZvcj1mdW5jdGlvbigpe3RoaXMubmF2Q29tcGFuaW9uU2VsZWN0KCEwKX0sbi5yZW1vdmVOYXZTZWxlY3RlZEVsZW1lbnRzPWZ1bmN0aW9uKCl7dGhpcy5uYXZTZWxlY3RlZEVsZW1lbnRzJiYodGhpcy5jaGFuZ2VOYXZTZWxlY3RlZENsYXNzKFwicmVtb3ZlXCIpLGRlbGV0ZSB0aGlzLm5hdlNlbGVjdGVkRWxlbWVudHMpfSxuLm9uTmF2U3RhdGljQ2xpY2s9ZnVuY3Rpb24odCxlLGksbil7XCJudW1iZXJcIj09dHlwZW9mIG4mJnRoaXMubmF2Q29tcGFuaW9uLnNlbGVjdENlbGwobil9LG4uZGVhY3RpdmF0ZUFzTmF2Rm9yPWZ1bmN0aW9uKCl7dGhpcy5yZW1vdmVOYXZTZWxlY3RlZEVsZW1lbnRzKCl9LG4uZGVzdHJveUFzTmF2Rm9yPWZ1bmN0aW9uKCl7dGhpcy5uYXZDb21wYW5pb24mJih0aGlzLm5hdkNvbXBhbmlvbi5vZmYoXCJzZWxlY3RcIix0aGlzLm9uTmF2Q29tcGFuaW9uU2VsZWN0KSx0aGlzLm9mZihcInN0YXRpY0NsaWNrXCIsdGhpcy5vbk5hdlN0YXRpY0NsaWNrKSxkZWxldGUgdGhpcy5uYXZDb21wYW5pb24pfSx0fSksZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiaW1hZ2VzbG9hZGVkL2ltYWdlc2xvYWRlZFwiLFtcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJldi1lbWl0dGVyXCIpKTp0LmltYWdlc0xvYWRlZD1lKHQsdC5FdkVtaXR0ZXIpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKHQsZSl7Zm9yKHZhciBpIGluIGUpdFtpXT1lW2ldO3JldHVybiB0fWZ1bmN0aW9uIG4odCl7dmFyIGU9W107aWYoQXJyYXkuaXNBcnJheSh0KSllPXQ7ZWxzZSBpZihcIm51bWJlclwiPT10eXBlb2YgdC5sZW5ndGgpZm9yKHZhciBpPTA7aTx0Lmxlbmd0aDtpKyspZS5wdXNoKHRbaV0pO2Vsc2UgZS5wdXNoKHQpO3JldHVybiBlfWZ1bmN0aW9uIHModCxlLG8pe3JldHVybiB0aGlzIGluc3RhbmNlb2Ygcz8oXCJzdHJpbmdcIj09dHlwZW9mIHQmJih0PWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodCkpLHRoaXMuZWxlbWVudHM9bih0KSx0aGlzLm9wdGlvbnM9aSh7fSx0aGlzLm9wdGlvbnMpLFwiZnVuY3Rpb25cIj09dHlwZW9mIGU/bz1lOmkodGhpcy5vcHRpb25zLGUpLG8mJnRoaXMub24oXCJhbHdheXNcIixvKSx0aGlzLmdldEltYWdlcygpLGEmJih0aGlzLmpxRGVmZXJyZWQ9bmV3IGEuRGVmZXJyZWQpLHZvaWQgc2V0VGltZW91dChmdW5jdGlvbigpe3RoaXMuY2hlY2soKX0uYmluZCh0aGlzKSkpOm5ldyBzKHQsZSxvKX1mdW5jdGlvbiBvKHQpe3RoaXMuaW1nPXR9ZnVuY3Rpb24gcih0LGUpe3RoaXMudXJsPXQsdGhpcy5lbGVtZW50PWUsdGhpcy5pbWc9bmV3IEltYWdlfXZhciBhPXQualF1ZXJ5LGw9dC5jb25zb2xlO3MucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpLHMucHJvdG90eXBlLm9wdGlvbnM9e30scy5wcm90b3R5cGUuZ2V0SW1hZ2VzPWZ1bmN0aW9uKCl7dGhpcy5pbWFnZXM9W10sdGhpcy5lbGVtZW50cy5mb3JFYWNoKHRoaXMuYWRkRWxlbWVudEltYWdlcyx0aGlzKX0scy5wcm90b3R5cGUuYWRkRWxlbWVudEltYWdlcz1mdW5jdGlvbih0KXtcIklNR1wiPT10Lm5vZGVOYW1lJiZ0aGlzLmFkZEltYWdlKHQpLHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kPT09ITAmJnRoaXMuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXModCk7dmFyIGU9dC5ub2RlVHlwZTtpZihlJiZoW2VdKXtmb3IodmFyIGk9dC5xdWVyeVNlbGVjdG9yQWxsKFwiaW1nXCIpLG49MDtuPGkubGVuZ3RoO24rKyl7dmFyIHM9aVtuXTt0aGlzLmFkZEltYWdlKHMpfWlmKFwic3RyaW5nXCI9PXR5cGVvZiB0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCl7dmFyIG89dC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kKTtmb3Iobj0wO248by5sZW5ndGg7bisrKXt2YXIgcj1vW25dO3RoaXMuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMocil9fX19O3ZhciBoPXsxOiEwLDk6ITAsMTE6ITB9O3JldHVybiBzLnByb3RvdHlwZS5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcz1mdW5jdGlvbih0KXt2YXIgZT1nZXRDb21wdXRlZFN0eWxlKHQpO2lmKGUpZm9yKHZhciBpPS91cmxcXCgoWydcIl0pPyguKj8pXFwxXFwpL2dpLG49aS5leGVjKGUuYmFja2dyb3VuZEltYWdlKTtudWxsIT09bjspe3ZhciBzPW4mJm5bMl07cyYmdGhpcy5hZGRCYWNrZ3JvdW5kKHMsdCksbj1pLmV4ZWMoZS5iYWNrZ3JvdW5kSW1hZ2UpfX0scy5wcm90b3R5cGUuYWRkSW1hZ2U9ZnVuY3Rpb24odCl7dmFyIGU9bmV3IG8odCk7dGhpcy5pbWFnZXMucHVzaChlKX0scy5wcm90b3R5cGUuYWRkQmFja2dyb3VuZD1mdW5jdGlvbih0LGUpe3ZhciBpPW5ldyByKHQsZSk7dGhpcy5pbWFnZXMucHVzaChpKX0scy5wcm90b3R5cGUuY2hlY2s9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQsaSxuKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS5wcm9ncmVzcyh0LGksbil9KX12YXIgZT10aGlzO3JldHVybiB0aGlzLnByb2dyZXNzZWRDb3VudD0wLHRoaXMuaGFzQW55QnJva2VuPSExLHRoaXMuaW1hZ2VzLmxlbmd0aD92b2lkIHRoaXMuaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oZSl7ZS5vbmNlKFwicHJvZ3Jlc3NcIix0KSxlLmNoZWNrKCl9KTp2b2lkIHRoaXMuY29tcGxldGUoKX0scy5wcm90b3R5cGUucHJvZ3Jlc3M9ZnVuY3Rpb24odCxlLGkpe3RoaXMucHJvZ3Jlc3NlZENvdW50KyssdGhpcy5oYXNBbnlCcm9rZW49dGhpcy5oYXNBbnlCcm9rZW58fCF0LmlzTG9hZGVkLHRoaXMuZW1pdEV2ZW50KFwicHJvZ3Jlc3NcIixbdGhpcyx0LGVdKSx0aGlzLmpxRGVmZXJyZWQmJnRoaXMuanFEZWZlcnJlZC5ub3RpZnkmJnRoaXMuanFEZWZlcnJlZC5ub3RpZnkodGhpcyx0KSx0aGlzLnByb2dyZXNzZWRDb3VudD09dGhpcy5pbWFnZXMubGVuZ3RoJiZ0aGlzLmNvbXBsZXRlKCksdGhpcy5vcHRpb25zLmRlYnVnJiZsJiZsLmxvZyhcInByb2dyZXNzOiBcIitpLHQsZSl9LHMucHJvdG90eXBlLmNvbXBsZXRlPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5oYXNBbnlCcm9rZW4/XCJmYWlsXCI6XCJkb25lXCI7aWYodGhpcy5pc0NvbXBsZXRlPSEwLHRoaXMuZW1pdEV2ZW50KHQsW3RoaXNdKSx0aGlzLmVtaXRFdmVudChcImFsd2F5c1wiLFt0aGlzXSksdGhpcy5qcURlZmVycmVkKXt2YXIgZT10aGlzLmhhc0FueUJyb2tlbj9cInJlamVjdFwiOlwicmVzb2x2ZVwiO3RoaXMuanFEZWZlcnJlZFtlXSh0aGlzKX19LG8ucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpLG8ucHJvdG90eXBlLmNoZWNrPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5nZXRJc0ltYWdlQ29tcGxldGUoKTtyZXR1cm4gdD92b2lkIHRoaXMuY29uZmlybSgwIT09dGhpcy5pbWcubmF0dXJhbFdpZHRoLFwibmF0dXJhbFdpZHRoXCIpOih0aGlzLnByb3h5SW1hZ2U9bmV3IEltYWdlLHRoaXMucHJveHlJbWFnZS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMucHJveHlJbWFnZS5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpLHZvaWQodGhpcy5wcm94eUltYWdlLnNyYz10aGlzLmltZy5zcmMpKX0sby5wcm90b3R5cGUuZ2V0SXNJbWFnZUNvbXBsZXRlPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuaW1nLmNvbXBsZXRlJiZ2b2lkIDAhPT10aGlzLmltZy5uYXR1cmFsV2lkdGh9LG8ucHJvdG90eXBlLmNvbmZpcm09ZnVuY3Rpb24odCxlKXt0aGlzLmlzTG9hZGVkPXQsdGhpcy5lbWl0RXZlbnQoXCJwcm9ncmVzc1wiLFt0aGlzLHRoaXMuaW1nLGVdKX0sby5wcm90b3R5cGUuaGFuZGxlRXZlbnQ9ZnVuY3Rpb24odCl7dmFyIGU9XCJvblwiK3QudHlwZTt0aGlzW2VdJiZ0aGlzW2VdKHQpfSxvLnByb3RvdHlwZS5vbmxvYWQ9ZnVuY3Rpb24oKXt0aGlzLmNvbmZpcm0oITAsXCJvbmxvYWRcIiksdGhpcy51bmJpbmRFdmVudHMoKX0sby5wcm90b3R5cGUub25lcnJvcj1mdW5jdGlvbigpe3RoaXMuY29uZmlybSghMSxcIm9uZXJyb3JcIiksdGhpcy51bmJpbmRFdmVudHMoKX0sby5wcm90b3R5cGUudW5iaW5kRXZlbnRzPWZ1bmN0aW9uKCl7dGhpcy5wcm94eUltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5wcm94eUltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpLHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyl9LHIucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoby5wcm90b3R5cGUpLHIucHJvdG90eXBlLmNoZWNrPWZ1bmN0aW9uKCl7dGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx0aGlzLmltZy5zcmM9dGhpcy51cmw7dmFyIHQ9dGhpcy5nZXRJc0ltYWdlQ29tcGxldGUoKTt0JiYodGhpcy5jb25maXJtKDAhPT10aGlzLmltZy5uYXR1cmFsV2lkdGgsXCJuYXR1cmFsV2lkdGhcIiksdGhpcy51bmJpbmRFdmVudHMoKSl9LHIucHJvdG90eXBlLnVuYmluZEV2ZW50cz1mdW5jdGlvbigpe3RoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyl9LHIucHJvdG90eXBlLmNvbmZpcm09ZnVuY3Rpb24odCxlKXt0aGlzLmlzTG9hZGVkPXQsdGhpcy5lbWl0RXZlbnQoXCJwcm9ncmVzc1wiLFt0aGlzLHRoaXMuZWxlbWVudCxlXSl9LHMubWFrZUpRdWVyeVBsdWdpbj1mdW5jdGlvbihlKXtlPWV8fHQualF1ZXJ5LGUmJihhPWUsYS5mbi5pbWFnZXNMb2FkZWQ9ZnVuY3Rpb24odCxlKXt2YXIgaT1uZXcgcyh0aGlzLHQsZSk7cmV0dXJuIGkuanFEZWZlcnJlZC5wcm9taXNlKGEodGhpcykpfSl9LHMubWFrZUpRdWVyeVBsdWdpbigpLHN9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wiZmxpY2tpdHkvanMvaW5kZXhcIixcImltYWdlc2xvYWRlZC9pbWFnZXNsb2FkZWRcIl0sZnVuY3Rpb24oaSxuKXtyZXR1cm4gZSh0LGksbil9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImZsaWNraXR5XCIpLHJlcXVpcmUoXCJpbWFnZXNsb2FkZWRcIikpOnQuRmxpY2tpdHk9ZSh0LHQuRmxpY2tpdHksdC5pbWFnZXNMb2FkZWQpfSh3aW5kb3csZnVuY3Rpb24odCxlLGkpe1widXNlIHN0cmljdFwiO2UuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZUltYWdlc0xvYWRlZFwiKTt2YXIgbj1lLnByb3RvdHlwZTtyZXR1cm4gbi5fY3JlYXRlSW1hZ2VzTG9hZGVkPWZ1bmN0aW9uKCl7dGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5pbWFnZXNMb2FkZWQpfSxuLmltYWdlc0xvYWRlZD1mdW5jdGlvbigpe2Z1bmN0aW9uIHQodCxpKXt2YXIgbj1lLmdldFBhcmVudENlbGwoaS5pbWcpO2UuY2VsbFNpemVDaGFuZ2UobiYmbi5lbGVtZW50KSxlLm9wdGlvbnMuZnJlZVNjcm9sbHx8ZS5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKX1pZih0aGlzLm9wdGlvbnMuaW1hZ2VzTG9hZGVkKXt2YXIgZT10aGlzO2kodGhpcy5zbGlkZXIpLm9uKFwicHJvZ3Jlc3NcIix0KX19LGV9KTsiLCIvKipcbiAqIEZsaWNraXR5IGJhY2tncm91bmQgbGF6eWxvYWQgdjEuMC4wXG4gKiBsYXp5bG9hZCBiYWNrZ3JvdW5kIGNlbGwgaW1hZ2VzXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgdW51c2VkOiB0cnVlLCB1bmRlZjogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKmdsb2JhbHMgZGVmaW5lLCBtb2R1bGUsIHJlcXVpcmUgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICdmbGlja2l0eS9qcy9pbmRleCcsXG4gICAgICAnZml6enktdWktdXRpbHMvdXRpbHMnXG4gICAgXSwgZmFjdG9yeSApO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgcmVxdWlyZSgnZmxpY2tpdHknKSxcbiAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgIHdpbmRvdy5GbGlja2l0eSxcbiAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHNcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggRmxpY2tpdHksIHV0aWxzICkge1xuLypqc2hpbnQgc3RyaWN0OiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbkZsaWNraXR5LmNyZWF0ZU1ldGhvZHMucHVzaCgnX2NyZWF0ZUJnTGF6eUxvYWQnKTtcblxudmFyIHByb3RvID0gRmxpY2tpdHkucHJvdG90eXBlO1xuXG5wcm90by5fY3JlYXRlQmdMYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9uKCAnc2VsZWN0JywgdGhpcy5iZ0xhenlMb2FkICk7XG59O1xuXG5wcm90by5iZ0xhenlMb2FkID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsYXp5TG9hZCA9IHRoaXMub3B0aW9ucy5iZ0xhenlMb2FkO1xuICBpZiAoICFsYXp5TG9hZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBnZXQgYWRqYWNlbnQgY2VsbHMsIHVzZSBsYXp5TG9hZCBvcHRpb24gZm9yIGFkamFjZW50IGNvdW50XG4gIHZhciBhZGpDb3VudCA9IHR5cGVvZiBsYXp5TG9hZCA9PSAnbnVtYmVyJyA/IGxhenlMb2FkIDogMDtcbiAgdmFyIGNlbGxFbGVtcyA9IHRoaXMuZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHMoIGFkakNvdW50ICk7XG5cbiAgZm9yICggdmFyIGk9MDsgaSA8IGNlbGxFbGVtcy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgY2VsbEVsZW0gPSBjZWxsRWxlbXNbaV07XG4gICAgdGhpcy5iZ0xhenlMb2FkRWxlbSggY2VsbEVsZW0gKTtcbiAgICAvLyBzZWxlY3QgbGF6eSBlbGVtcyBpbiBjZWxsXG4gICAgdmFyIGNoaWxkcmVuID0gY2VsbEVsZW0ucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZmxpY2tpdHktYmctbGF6eWxvYWRdJyk7XG4gICAgZm9yICggdmFyIGo9MDsgaiA8IGNoaWxkcmVuLmxlbmd0aDsgaisrICkge1xuICAgICAgdGhpcy5iZ0xhenlMb2FkRWxlbSggY2hpbGRyZW5bal0gKTtcbiAgICB9XG4gIH1cbn07XG5cbnByb3RvLmJnTGF6eUxvYWRFbGVtID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIHZhciBhdHRyID0gZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmxpY2tpdHktYmctbGF6eWxvYWQnKTtcbiAgaWYgKCBhdHRyICkge1xuICAgIG5ldyBCZ0xhenlMb2FkZXIoIGVsZW0sIGF0dHIsIHRoaXMgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gTGF6eUJHTG9hZGVyIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8qKlxuICogY2xhc3MgdG8gaGFuZGxlIGxvYWRpbmcgaW1hZ2VzXG4gKi9cbmZ1bmN0aW9uIEJnTGF6eUxvYWRlciggZWxlbSwgdXJsLCBmbGlja2l0eSApIHtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbTtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG4gIHRoaXMuZmxpY2tpdHkgPSBmbGlja2l0eTtcbiAgdGhpcy5sb2FkKCk7XG59XG5cbkJnTGF6eUxvYWRlci5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSB1dGlscy5oYW5kbGVFdmVudDtcblxuQmdMYXp5TG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIC8vIGxvYWQgaW1hZ2VcbiAgdGhpcy5pbWcuc3JjID0gdGhpcy51cmw7XG4gIC8vIHJlbW92ZSBhdHRyXG4gIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtZmxpY2tpdHktYmctbGF6eWxvYWQnKTtcbn07XG5cbkJnTGF6eUxvYWRlci5wcm90b3R5cGUub25sb2FkID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybCgnICsgdGhpcy51cmwgKyAnKSc7XG4gIHRoaXMuY29tcGxldGUoIGV2ZW50LCAnZmxpY2tpdHktYmctbGF6eWxvYWRlZCcgKTtcbn07XG5cbkJnTGF6eUxvYWRlci5wcm90b3R5cGUub25lcnJvciA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5jb21wbGV0ZSggZXZlbnQsICdmbGlja2l0eS1iZy1sYXp5ZXJyb3InICk7XG59O1xuXG5CZ0xhenlMb2FkZXIucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24oIGV2ZW50LCBjbGFzc05hbWUgKSB7XG4gIC8vIHVuYmluZCBldmVudHNcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcblxuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCggY2xhc3NOYW1lICk7XG4gIHRoaXMuZmxpY2tpdHkuZGlzcGF0Y2hFdmVudCggJ2JnTGF6eUxvYWQnLCBldmVudCwgdGhpcy5lbGVtZW50ICk7XG59O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxuRmxpY2tpdHkuQmdMYXp5TG9hZGVyID0gQmdMYXp5TG9hZGVyO1xuXG5yZXR1cm4gRmxpY2tpdHk7XG5cbn0pKTtcbiIsIi8qKlxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSwgdmVyc2lvbiAxLjIuMjdcbiogIChjKSAyMDE1IFRvbWFzIEtpcmRhXG4qXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5IGlzIGZyZWVseSBkaXN0cmlidXRhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiBhbiBNSVQtc3R5bGUgbGljZW5zZS5cbiogIEZvciBkZXRhaWxzLCBzZWUgdGhlIHdlYiBzaXRlOiBodHRwczovL2dpdGh1Yi5jb20vZGV2YnJpZGdlL2pRdWVyeS1BdXRvY29tcGxldGVcbiovXG5cbi8qanNsaW50ICBicm93c2VyOiB0cnVlLCB3aGl0ZTogdHJ1ZSwgc2luZ2xlOiB0cnVlLCB0aGlzOiB0cnVlLCBtdWx0aXZhcjogdHJ1ZSAqL1xuLypnbG9iYWwgZGVmaW5lLCB3aW5kb3csIGRvY3VtZW50LCBqUXVlcnksIGV4cG9ydHMsIHJlcXVpcmUgKi9cblxuLy8gRXhwb3NlIHBsdWdpbiBhcyBhbiBBTUQgbW9kdWxlIGlmIEFNRCBsb2FkZXIgaXMgcHJlc2VudDpcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHJlcXVpcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gQnJvd3NlcmlmeVxuICAgICAgICBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICAgICAgZmFjdG9yeShqUXVlcnkpO1xuICAgIH1cbn0oZnVuY3Rpb24gKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXJcbiAgICAgICAgdXRpbHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlc2NhcGVSZWdFeENoYXJzOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1t8XFxcXHt9KClbXFxdXiQrKj8uXS9nLCBcIlxcXFwkJlwiKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGU6IGZ1bmN0aW9uIChjb250YWluZXJDbGFzcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5jbGFzc05hbWUgPSBjb250YWluZXJDbGFzcztcbiAgICAgICAgICAgICAgICAgICAgZGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgICAgICAgICAgICAgZGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXY7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSgpKSxcblxuICAgICAgICBrZXlzID0ge1xuICAgICAgICAgICAgRVNDOiAyNyxcbiAgICAgICAgICAgIFRBQjogOSxcbiAgICAgICAgICAgIFJFVFVSTjogMTMsXG4gICAgICAgICAgICBMRUZUOiAzNyxcbiAgICAgICAgICAgIFVQOiAzOCxcbiAgICAgICAgICAgIFJJR0hUOiAzOSxcbiAgICAgICAgICAgIERPV046IDQwXG4gICAgICAgIH07XG5cbiAgICBmdW5jdGlvbiBBdXRvY29tcGxldGUoZWwsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG5vb3AgPSAkLm5vb3AsXG4gICAgICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5nczoge30sXG4gICAgICAgICAgICAgICAgYXV0b1NlbGVjdEZpcnN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhcHBlbmRUbzogZG9jdW1lbnQuYm9keSxcbiAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsOiBudWxsLFxuICAgICAgICAgICAgICAgIGxvb2t1cDogbnVsbCxcbiAgICAgICAgICAgICAgICBvblNlbGVjdDogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogJ2F1dG8nLFxuICAgICAgICAgICAgICAgIG1pbkNoYXJzOiAxLFxuICAgICAgICAgICAgICAgIG1heEhlaWdodDogMzAwLFxuICAgICAgICAgICAgICAgIGRlZmVyUmVxdWVzdEJ5OiAwLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge30sXG4gICAgICAgICAgICAgICAgZm9ybWF0UmVzdWx0OiBBdXRvY29tcGxldGUuZm9ybWF0UmVzdWx0LFxuICAgICAgICAgICAgICAgIGRlbGltaXRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IDk5OTksXG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgbm9DYWNoZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hTdGFydDogbm9vcCxcbiAgICAgICAgICAgICAgICBvblNlYXJjaENvbXBsZXRlOiBub29wLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoRXJyb3I6IG5vb3AsXG4gICAgICAgICAgICAgICAgcHJlc2VydmVJbnB1dDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyQ2xhc3M6ICdhdXRvY29tcGxldGUtc3VnZ2VzdGlvbnMnLFxuICAgICAgICAgICAgICAgIHRhYkRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRSZXF1ZXN0OiBudWxsLFxuICAgICAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgcHJldmVudEJhZFF1ZXJpZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgbG9va3VwRmlsdGVyOiBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgb3JpZ2luYWxRdWVyeSwgcXVlcnlMb3dlckNhc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5TG93ZXJDYXNlKSAhPT0gLTE7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwYXJhbU5hbWU6ICdxdWVyeScsXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiByZXNwb25zZSA9PT0gJ3N0cmluZycgPyAkLnBhcnNlSlNPTihyZXNwb25zZSkgOiByZXNwb25zZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNob3dOb1N1Z2dlc3Rpb25Ob3RpY2U6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbk5vdGljZTogJ05vIHJlc3VsdHMnLFxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uOiAnYm90dG9tJyxcbiAgICAgICAgICAgICAgICBmb3JjZUZpeFBvc2l0aW9uOiBmYWxzZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAvLyBTaGFyZWQgdmFyaWFibGVzOlxuICAgICAgICB0aGF0LmVsZW1lbnQgPSBlbDtcbiAgICAgICAgdGhhdC5lbCA9ICQoZWwpO1xuICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgIHRoYXQuYmFkUXVlcmllcyA9IFtdO1xuICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmVsZW1lbnQudmFsdWU7XG4gICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IDA7XG4gICAgICAgIHRoYXQuY2FjaGVkUmVzcG9uc2UgPSB7fTtcbiAgICAgICAgdGhhdC5vbkNoYW5nZUludGVydmFsID0gbnVsbDtcbiAgICAgICAgdGhhdC5vbkNoYW5nZSA9IG51bGw7XG4gICAgICAgIHRoYXQuaXNMb2NhbCA9IGZhbHNlO1xuICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgdGhhdC5vcHRpb25zID0gJC5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICAgICAgdGhhdC5jbGFzc2VzID0ge1xuICAgICAgICAgICAgc2VsZWN0ZWQ6ICdhdXRvY29tcGxldGUtc2VsZWN0ZWQnLFxuICAgICAgICAgICAgc3VnZ2VzdGlvbjogJ2F1dG9jb21wbGV0ZS1zdWdnZXN0aW9uJ1xuICAgICAgICB9O1xuICAgICAgICB0aGF0LmhpbnQgPSBudWxsO1xuICAgICAgICB0aGF0LmhpbnRWYWx1ZSA9ICcnO1xuICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IG51bGw7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBhbmQgc2V0IG9wdGlvbnM6XG4gICAgICAgIHRoYXQuaW5pdGlhbGl6ZSgpO1xuICAgICAgICB0aGF0LnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgQXV0b2NvbXBsZXRlLnV0aWxzID0gdXRpbHM7XG5cbiAgICAkLkF1dG9jb21wbGV0ZSA9IEF1dG9jb21wbGV0ZTtcblxuICAgIEF1dG9jb21wbGV0ZS5mb3JtYXRSZXN1bHQgPSBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgY3VycmVudFZhbHVlKSB7XG4gICAgICAgIC8vIERvIG5vdCByZXBsYWNlIGFueXRoaW5nIGlmIHRoZXJlIGN1cnJlbnQgdmFsdWUgaXMgZW1wdHlcbiAgICAgICAgaWYgKCFjdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgcGF0dGVybiA9ICcoJyArIHV0aWxzLmVzY2FwZVJlZ0V4Q2hhcnMoY3VycmVudFZhbHVlKSArICcpJztcblxuICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZVxuICAgICAgICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cChwYXR0ZXJuLCAnZ2knKSwgJzxzdHJvbmc+JDE8XFwvc3Ryb25nPicpXG4gICAgICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyZsdDsoXFwvP3N0cm9uZykmZ3Q7L2csICc8JDE+Jyk7XG4gICAgfTtcblxuICAgIEF1dG9jb21wbGV0ZS5wcm90b3R5cGUgPSB7XG5cbiAgICAgICAga2lsbGVyRm46IG51bGwsXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25TZWxlY3RvciA9ICcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgYXV0b2NvbXBsZXRlIGF0dHJpYnV0ZSB0byBwcmV2ZW50IG5hdGl2ZSBzdWdnZXN0aW9uczpcbiAgICAgICAgICAgIHRoYXQuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2F1dG9jb21wbGV0ZScsICdvZmYnKTtcblxuICAgICAgICAgICAgdGhhdC5raWxsZXJGbiA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkKGUudGFyZ2V0KS5jbG9zZXN0KCcuJyArIHRoYXQub3B0aW9ucy5jb250YWluZXJDbGFzcykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQua2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gaHRtbCgpIGRlYWxzIHdpdGggbWFueSB0eXBlczogaHRtbFN0cmluZyBvciBFbGVtZW50IG9yIEFycmF5IG9yIGpRdWVyeVxuICAgICAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCgnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1uby1zdWdnZXN0aW9uXCI+PC9kaXY+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKHRoaXMub3B0aW9ucy5ub1N1Z2dlc3Rpb25Ob3RpY2UpLmdldCgwKTtcblxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IEF1dG9jb21wbGV0ZS51dGlscy5jcmVhdGVOb2RlKG9wdGlvbnMuY29udGFpbmVyQ2xhc3MpO1xuXG4gICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kVG8ob3B0aW9ucy5hcHBlbmRUbyk7XG5cbiAgICAgICAgICAgIC8vIE9ubHkgc2V0IHdpZHRoIGlmIGl0IHdhcyBwcm92aWRlZDpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoICE9PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY3NzKCd3aWR0aCcsIG9wdGlvbnMud2lkdGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIG1vdXNlIG92ZXIgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdmVyLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuYWN0aXZhdGUoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBEZXNlbGVjdCBhY3RpdmUgZWxlbWVudCB3aGVuIG1vdXNlIGxlYXZlcyBzdWdnZXN0aW9ucyBjb250YWluZXI6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ21vdXNlb3V0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4oJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIGNsaWNrIGV2ZW50IG9uIHN1Z2dlc3Rpb25zIGxpc3Q6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplLmF1dG9jb21wbGV0ZScsIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlKTtcblxuICAgICAgICAgICAgdGhhdC5lbC5vbigna2V5ZG93bi5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5UHJlc3MoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbigna2V5dXAuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2JsdXIuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uQmx1cigpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2ZvY3VzLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkZvY3VzKCk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignY2hhbmdlLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdpbnB1dC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5lbC52YWwoKS5sZW5ndGggPj0gdGhhdC5vcHRpb25zLm1pbkNoYXJzKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25CbHVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmVuYWJsZUtpbGxlckZuKCk7XG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBhYm9ydEFqYXg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRSZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldE9wdGlvbnM6IGZ1bmN0aW9uIChzdXBwbGllZE9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xuXG4gICAgICAgICAgICAkLmV4dGVuZChvcHRpb25zLCBzdXBwbGllZE9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGF0LmlzTG9jYWwgPSAkLmlzQXJyYXkob3B0aW9ucy5sb29rdXApO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KG9wdGlvbnMubG9va3VwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3B0aW9ucy5vcmllbnRhdGlvbiA9IHRoYXQudmFsaWRhdGVPcmllbnRhdGlvbihvcHRpb25zLm9yaWVudGF0aW9uLCAnYm90dG9tJyk7XG5cbiAgICAgICAgICAgIC8vIEFkanVzdCBoZWlnaHQsIHdpZHRoIGFuZCB6LWluZGV4OlxuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jc3Moe1xuICAgICAgICAgICAgICAgICdtYXgtaGVpZ2h0Jzogb3B0aW9ucy5tYXhIZWlnaHQgKyAncHgnLFxuICAgICAgICAgICAgICAgICd3aWR0aCc6IG9wdGlvbnMud2lkdGggKyAncHgnLFxuICAgICAgICAgICAgICAgICd6LWluZGV4Jzogb3B0aW9ucy56SW5kZXhcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgY2xlYXJDYWNoZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5jYWNoZWRSZXNwb25zZSA9IHt9O1xuICAgICAgICAgICAgdGhpcy5iYWRRdWVyaWVzID0gW107XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJDYWNoZSgpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50VmFsdWUgPSAnJztcbiAgICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbnMgPSBbXTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgIHRoYXQuYWJvcnRBamF4KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZml4UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIFVzZSBvbmx5IHdoZW4gY29udGFpbmVyIGhhcyBhbHJlYWR5IGl0cyBjb250ZW50XG5cbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICAkY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBjb250YWluZXJQYXJlbnQgPSAkY29udGFpbmVyLnBhcmVudCgpLmdldCgwKTtcbiAgICAgICAgICAgIC8vIEZpeCBwb3NpdGlvbiBhdXRvbWF0aWNhbGx5IHdoZW4gYXBwZW5kZWQgdG8gYm9keS5cbiAgICAgICAgICAgIC8vIEluIG90aGVyIGNhc2VzIGZvcmNlIHBhcmFtZXRlciBtdXN0IGJlIGdpdmVuLlxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lclBhcmVudCAhPT0gZG9jdW1lbnQuYm9keSAmJiAhdGhhdC5vcHRpb25zLmZvcmNlRml4UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc2l0ZVNlYXJjaERpdiA9ICQoJy5zaXRlLXNlYXJjaCcpO1xuICAgICAgICAgICAgLy8gQ2hvb3NlIG9yaWVudGF0aW9uXG4gICAgICAgICAgICB2YXIgb3JpZW50YXRpb24gPSB0aGF0Lm9wdGlvbnMub3JpZW50YXRpb24sXG4gICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gJGNvbnRhaW5lci5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHNpdGVTZWFyY2hEaXYub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBzaXRlU2VhcmNoRGl2Lm9mZnNldCgpLFxuICAgICAgICAgICAgICAgIHN0eWxlcyA9IHsgJ3RvcCc6IG9mZnNldC50b3AsICdsZWZ0Jzogb2Zmc2V0LmxlZnQgfTtcblxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlld1BvcnRIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSxcbiAgICAgICAgICAgICAgICAgICAgdG9wT3ZlcmZsb3cgPSAtc2Nyb2xsVG9wICsgb2Zmc2V0LnRvcCAtIGNvbnRhaW5lckhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tT3ZlcmZsb3cgPSBzY3JvbGxUb3AgKyB2aWV3UG9ydEhlaWdodCAtIChvZmZzZXQudG9wICsgaGVpZ2h0ICsgY29udGFpbmVySGVpZ2h0KTtcblxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gKE1hdGgubWF4KHRvcE92ZXJmbG93LCBib3R0b21PdmVyZmxvdykgPT09IHRvcE92ZXJmbG93KSA/ICd0b3AnIDogJ2JvdHRvbSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wICs9IC1jb250YWluZXJIZWlnaHQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gaGVpZ2h0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBjb250YWluZXIgaXMgbm90IHBvc2l0aW9uZWQgdG8gYm9keSxcbiAgICAgICAgICAgIC8vIGNvcnJlY3QgaXRzIHBvc2l0aW9uIHVzaW5nIG9mZnNldCBwYXJlbnQgb2Zmc2V0XG4gICAgICAgICAgICBpZihjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgb3BhY2l0eSA9ICRjb250YWluZXIuY3NzKCdvcGFjaXR5JyksXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldERpZmY7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknLCAwKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldERpZmYgPSAkY29udGFpbmVyLm9mZnNldFBhcmVudCgpLm9mZnNldCgpO1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgLT0gcGFyZW50T2Zmc2V0RGlmZi50b3A7XG4gICAgICAgICAgICAgICAgc3R5bGVzLmxlZnQgLT0gcGFyZW50T2Zmc2V0RGlmZi5sZWZ0O1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIG9wYWNpdHkpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHN0eWxlcy53aWR0aCA9IHNpdGVTZWFyY2hEaXYub3V0ZXJXaWR0aCgpICsgJ3B4JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJGNvbnRhaW5lci5jc3Moc3R5bGVzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVLaWxsZXJGbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHRoYXQua2lsbGVyRm4pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVLaWxsZXJGbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5hdXRvY29tcGxldGUnLCB0aGF0LmtpbGxlckZuKTtcbiAgICAgICAgfSxcblxuICAgICAgICBraWxsU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuc3RvcEtpbGxTdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIG5lZWQgdG8gcmVzdG9yZSB2YWx1ZSB3aGVuIFxuICAgICAgICAgICAgICAgICAgICAvLyBwcmVzZXJ2ZUlucHV0ID09PSB0cnVlLCBcbiAgICAgICAgICAgICAgICAgICAgLy8gYmVjYXVzZSB3ZSBkaWQgbm90IGNoYW5nZSBpdFxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICB9LCA1MCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RvcEtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0N1cnNvckF0RW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdmFsTGVuZ3RoID0gdGhhdC5lbC52YWwoKS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uU3RhcnQgPSB0aGF0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQsXG4gICAgICAgICAgICAgICAgcmFuZ2U7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0aW9uU3RhcnQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvblN0YXJ0ID09PSB2YWxMZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmFuZ2UgPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICByYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC12YWxMZW5ndGgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWxMZW5ndGggPT09IHJhbmdlLnRleHQubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25LZXlQcmVzczogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgYXJlIGhpZGRlbiBhbmQgdXNlciBwcmVzc2VzIGFycm93IGRvd24sIGRpc3BsYXkgc3VnZ2VzdGlvbnM6XG4gICAgICAgICAgICBpZiAoIXRoYXQuZGlzYWJsZWQgJiYgIXRoYXQudmlzaWJsZSAmJiBlLndoaWNoID09PSBrZXlzLkRPV04gJiYgdGhhdC5jdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkIHx8ICF0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5FU0M6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SSUdIVDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaGludCAmJiB0aGF0Lm9wdGlvbnMub25IaW50ICYmIHRoYXQuaXNDdXJzb3JBdEVuZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdEhpbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVEFCOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLnRhYkRpc2FibGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SRVRVUk46XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZVVwKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm1vdmVEb3duKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2FuY2VsIGV2ZW50IGlmIGZ1bmN0aW9uIGRpZCBub3QgcmV0dXJuOlxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbktleVVwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlVQOlxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBEZWZlciBsb29rdXAgaW4gY2FzZSB3aGVuIHZhbHVlIGNoYW5nZXMgdmVyeSBxdWlja2x5OlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLFxuICAgICAgICAgICAgICAgIHF1ZXJ5ID0gdGhhdC5nZXRRdWVyeSh2YWx1ZSk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGlvbiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gcXVlcnkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgKG9wdGlvbnMub25JbnZhbGlkYXRlU2VsZWN0aW9uIHx8ICQubm9vcCkuY2FsbCh0aGF0LmVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGV4aXN0aW5nIHN1Z2dlc3Rpb24gZm9yIHRoZSBtYXRjaCBiZWZvcmUgcHJvY2VlZGluZzpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQgJiYgdGhhdC5pc0V4YWN0TWF0Y2gocXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocXVlcnkubGVuZ3RoIDwgb3B0aW9ucy5taW5DaGFycykge1xuICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGF0LmdldFN1Z2dlc3Rpb25zKHF1ZXJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc0V4YWN0TWF0Y2g6IGZ1bmN0aW9uIChxdWVyeSkge1xuICAgICAgICAgICAgdmFyIHN1Z2dlc3Rpb25zID0gdGhpcy5zdWdnZXN0aW9ucztcblxuICAgICAgICAgICAgcmV0dXJuIChzdWdnZXN0aW9ucy5sZW5ndGggPT09IDEgJiYgc3VnZ2VzdGlvbnNbMF0udmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gcXVlcnkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UXVlcnk6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGRlbGltaXRlciA9IHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIsXG4gICAgICAgICAgICAgICAgcGFydHM7XG5cbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuICAgICAgICAgICAgcmV0dXJuICQudHJpbShwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnNMb2NhbDogZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBxdWVyeUxvd2VyQ2FzZSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgZmlsdGVyID0gb3B0aW9ucy5sb29rdXBGaWx0ZXIsXG4gICAgICAgICAgICAgICAgbGltaXQgPSBwYXJzZUludChvcHRpb25zLmxvb2t1cExpbWl0LCAxMCksXG4gICAgICAgICAgICAgICAgZGF0YTtcblxuICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5ncmVwKG9wdGlvbnMubG9va3VwLCBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyKHN1Z2dlc3Rpb24sIHF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChsaW1pdCAmJiBkYXRhLnN1Z2dlc3Rpb25zLmxlbmd0aCA+IGxpbWl0KSB7XG4gICAgICAgICAgICAgICAgZGF0YS5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnMuc2xpY2UoMCwgbGltaXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdWdnZXN0aW9uczogZnVuY3Rpb24gKHEpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSxcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBvcHRpb25zLnNlcnZpY2VVcmwsXG4gICAgICAgICAgICAgICAgcGFyYW1zLFxuICAgICAgICAgICAgICAgIGNhY2hlS2V5LFxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncztcblxuICAgICAgICAgICAgb3B0aW9ucy5wYXJhbXNbb3B0aW9ucy5wYXJhbU5hbWVdID0gcTtcbiAgICAgICAgICAgIHBhcmFtcyA9IG9wdGlvbnMuaWdub3JlUGFyYW1zID8gbnVsbCA6IG9wdGlvbnMucGFyYW1zO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5vblNlYXJjaFN0YXJ0LmNhbGwodGhhdC5lbGVtZW50LCBvcHRpb25zLnBhcmFtcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9wdGlvbnMubG9va3VwKSl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAocSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGRhdGEuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5nZXRTdWdnZXN0aW9uc0xvY2FsKHEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKHNlcnZpY2VVcmwpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBzZXJ2aWNlVXJsLmNhbGwodGhhdC5lbGVtZW50LCBxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FjaGVLZXkgPSBzZXJ2aWNlVXJsICsgJz8nICsgJC5wYXJhbShwYXJhbXMgfHwge30pO1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiAkLmlzQXJyYXkocmVzcG9uc2Uuc3VnZ2VzdGlvbnMpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IHJlc3BvbnNlLnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzcG9uc2Uuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhhdC5pc0JhZFF1ZXJ5KHEpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hYm9ydEFqYXgoKTtcblxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBzZXJ2aWNlVXJsLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IG9wdGlvbnMudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IG9wdGlvbnMuZGF0YVR5cGVcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgJC5leHRlbmQoYWpheFNldHRpbmdzLCBvcHRpb25zLmFqYXhTZXR0aW5ncyk7XG5cbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gJC5hamF4KGFqYXhTZXR0aW5ncykuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm1SZXN1bHQoZGF0YSwgcSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQucHJvY2Vzc1Jlc3BvbnNlKHJlc3VsdCwgcSwgY2FjaGVLZXkpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3VsdC5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hFcnJvci5jYWxsKHRoYXQuZWxlbWVudCwgcSwganFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNCYWRRdWVyeTogZnVuY3Rpb24gKHEpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBiYWRRdWVyaWVzID0gdGhpcy5iYWRRdWVyaWVzLFxuICAgICAgICAgICAgICAgIGkgPSBiYWRRdWVyaWVzLmxlbmd0aDtcblxuICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgIGlmIChxLmluZGV4T2YoYmFkUXVlcmllc1tpXSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24odGhhdC5vcHRpb25zLm9uSGlkZSkgJiYgdGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLm9uSGlkZS5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuaGlkZSgpO1xuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN1Z2dlc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdWdnZXN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNob3dOb1N1Z2dlc3Rpb25Ob3RpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub1N1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgZ3JvdXBCeSA9IG9wdGlvbnMuZ3JvdXBCeSxcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQgPSBvcHRpb25zLmZvcm1hdFJlc3VsdCxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZ2V0UXVlcnkodGhhdC5jdXJyZW50VmFsdWUpLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uLFxuICAgICAgICAgICAgICAgIGNsYXNzU2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlciA9IG9wdGlvbnMuYmVmb3JlUmVuZGVyLFxuICAgICAgICAgICAgICAgIGh0bWwgPSAnJyxcbiAgICAgICAgICAgICAgICBjYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBmb3JtYXRHcm91cCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRDYXRlZ29yeSA9IHN1Z2dlc3Rpb24uZGF0YVtncm91cEJ5XTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhdGVnb3J5ID09PSBjdXJyZW50Q2F0ZWdvcnkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkgPSBjdXJyZW50Q2F0ZWdvcnk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1ncm91cFwiPjxzdHJvbmc+JyArIGNhdGVnb3J5ICsgJzwvc3Ryb25nPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQgJiYgdGhhdC5pc0V4YWN0TWF0Y2godmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBCdWlsZCBzdWdnZXN0aW9ucyBpbm5lciBIVE1MOlxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwQnkpe1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGZvcm1hdEdyb3VwKHN1Z2dlc3Rpb24sIHZhbHVlLCBpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiJyArIGNsYXNzTmFtZSArICdcIiBkYXRhLWluZGV4PVwiJyArIGkgKyAnXCI+JyArIGZvcm1hdFJlc3VsdChzdWdnZXN0aW9uLCB2YWx1ZSwgaSkgKyAnPC9kaXY+JztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lcldpZHRoKCk7XG5cbiAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIuZGV0YWNoKCk7XG4gICAgICAgICAgICBjb250YWluZXIuaHRtbChodG1sKTtcblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihiZWZvcmVSZW5kZXIpKSB7XG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIsIHRoYXQuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xuXG4gICAgICAgICAgICAvLyBTZWxlY3QgZmlyc3QgdmFsdWUgYnkgZGVmYXVsdDpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmF1dG9TZWxlY3RGaXJzdCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCgwKTtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4oJy4nICsgY2xhc3NOYW1lKS5maXJzdCgpLmFkZENsYXNzKGNsYXNzU2VsZWN0ZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBub1N1Z2dlc3Rpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyV2lkdGgoKTtcblxuICAgICAgICAgICAgLy8gU29tZSBleHBsaWNpdCBzdGVwcy4gQmUgY2FyZWZ1bCBoZXJlIGFzIGl0IGVhc3kgdG8gZ2V0XG4gICAgICAgICAgICAvLyBub1N1Z2dlc3Rpb25zQ29udGFpbmVyIHJlbW92ZWQgZnJvbSBET00gaWYgbm90IGRldGFjaGVkIHByb3Blcmx5LlxuICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lci5kZXRhY2goKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5lbXB0eSgpOyAvLyBjbGVhbiBzdWdnZXN0aW9ucyBpZiBhbnlcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQobm9TdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLnNob3coKTtcbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRqdXN0Q29udGFpbmVyV2lkdGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgLy8gSWYgd2lkdGggaXMgYXV0bywgYWRqdXN0IHdpZHRoIGJlZm9yZSBkaXNwbGF5aW5nIHN1Z2dlc3Rpb25zLFxuICAgICAgICAgICAgLy8gYmVjYXVzZSBpZiBpbnN0YW5jZSB3YXMgY3JlYXRlZCBiZWZvcmUgaW5wdXQgaGFkIHdpZHRoLCBpdCB3aWxsIGJlIHplcm8uXG4gICAgICAgICAgICAvLyBBbHNvIGl0IGFkanVzdHMgaWYgaW5wdXQgd2lkdGggaGFzIGNoYW5nZWQuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgd2lkdGggPSB0aGF0LmVsLm91dGVyV2lkdGgoKTtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY3NzKCd3aWR0aCcsIHdpZHRoID4gMCA/IHdpZHRoIDogMzAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kQmVzdEhpbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgZm91bmRNYXRjaCA9IHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHZhbHVlKSA9PT0gMDtcbiAgICAgICAgICAgICAgICBpZiAoZm91bmRNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBzdWdnZXN0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gIWZvdW5kTWF0Y2g7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KGJlc3RNYXRjaCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2lnbmFsSGludDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBoaW50VmFsdWUgPSAnJyxcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaGludFZhbHVlID0gdGhhdC5jdXJyZW50VmFsdWUgKyBzdWdnZXN0aW9uLnZhbHVlLnN1YnN0cih0aGF0LmN1cnJlbnRWYWx1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoYXQuaGludFZhbHVlICE9PSBoaW50VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnRWYWx1ZSA9IGhpbnRWYWx1ZTtcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnQgPSBzdWdnZXN0aW9uO1xuICAgICAgICAgICAgICAgICh0aGlzLm9wdGlvbnMub25IaW50IHx8ICQubm9vcCkoaGludFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB2ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb25zKSB7XG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBpcyBzdHJpbmcgYXJyYXksIGNvbnZlcnQgdGhlbSB0byBzdXBwb3J0ZWQgZm9ybWF0OlxuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb25zLmxlbmd0aCAmJiB0eXBlb2Ygc3VnZ2VzdGlvbnNbMF0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICQubWFwKHN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHZhbHVlLCBkYXRhOiBudWxsIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICB2YWxpZGF0ZU9yaWVudGF0aW9uOiBmdW5jdGlvbihvcmllbnRhdGlvbiwgZmFsbGJhY2spIHtcbiAgICAgICAgICAgIG9yaWVudGF0aW9uID0gJC50cmltKG9yaWVudGF0aW9uIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICBpZigkLmluQXJyYXkob3JpZW50YXRpb24sIFsnYXV0bycsICdib3R0b20nLCAndG9wJ10pID09PSAtMSl7XG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSBmYWxsYmFjaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG9yaWVudGF0aW9uO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByb2Nlc3NSZXNwb25zZTogZnVuY3Rpb24gKHJlc3VsdCwgb3JpZ2luYWxRdWVyeSwgY2FjaGVLZXkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xuXG4gICAgICAgICAgICByZXN1bHQuc3VnZ2VzdGlvbnMgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KHJlc3VsdC5zdWdnZXN0aW9ucyk7XG5cbiAgICAgICAgICAgIC8vIENhY2hlIHJlc3VsdHMgaWYgY2FjaGUgaXMgbm90IGRpc2FibGVkOlxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5vQ2FjaGUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5wcmV2ZW50QmFkUXVlcmllcyAmJiAhcmVzdWx0LnN1Z2dlc3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmJhZFF1ZXJpZXMucHVzaChvcmlnaW5hbFF1ZXJ5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJldHVybiBpZiBvcmlnaW5hbFF1ZXJ5IGlzIG5vdCBtYXRjaGluZyBjdXJyZW50IHF1ZXJ5OlxuICAgICAgICAgICAgaWYgKG9yaWdpbmFsUXVlcnkgIT09IHRoYXQuZ2V0UXVlcnkodGhhdC5jdXJyZW50VmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzdWx0LnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWN0aXZhdGU6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0sXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IGNvbnRhaW5lci5maW5kKCcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLmZpbmQoJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcblxuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggIT09IC0xICYmIGNoaWxkcmVuLmxlbmd0aCA+IHRoYXQuc2VsZWN0ZWRJbmRleCkge1xuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSBjaGlsZHJlbi5nZXQodGhhdC5zZWxlY3RlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAkKGFjdGl2ZUl0ZW0pLmFkZENsYXNzKHNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWN0aXZlSXRlbTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0SGludDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGkgPSAkLmluQXJyYXkodGhhdC5oaW50LCB0aGF0LnN1Z2dlc3Rpb25zKTtcblxuICAgICAgICAgICAgdGhhdC5zZWxlY3QoaSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0OiBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICB0aGF0Lm9uU2VsZWN0KGkpO1xuICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb3ZlVXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmNoaWxkcmVuKCkuZmlyc3QoKS5yZW1vdmVDbGFzcyh0aGF0LmNsYXNzZXMuc2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4IC0gMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW92ZURvd246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gKHRoYXQuc3VnZ2VzdGlvbnMubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCArIDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkanVzdFNjcm9sbDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IHRoYXQuYWN0aXZhdGUoaW5kZXgpO1xuXG4gICAgICAgICAgICBpZiAoIWFjdGl2ZUl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBvZmZzZXRUb3AsXG4gICAgICAgICAgICAgICAgdXBwZXJCb3VuZCxcbiAgICAgICAgICAgICAgICBsb3dlckJvdW5kLFxuICAgICAgICAgICAgICAgIGhlaWdodERlbHRhID0gJChhY3RpdmVJdGVtKS5vdXRlckhlaWdodCgpO1xuXG4gICAgICAgICAgICBvZmZzZXRUb3AgPSBhY3RpdmVJdGVtLm9mZnNldFRvcDtcbiAgICAgICAgICAgIHVwcGVyQm91bmQgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcCgpO1xuICAgICAgICAgICAgbG93ZXJCb3VuZCA9IHVwcGVyQm91bmQgKyB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0IC0gaGVpZ2h0RGVsdGE7XG5cbiAgICAgICAgICAgIGlmIChvZmZzZXRUb3AgPCB1cHBlckJvdW5kKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3Aob2Zmc2V0VG9wKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob2Zmc2V0VG9wID4gbG93ZXJCb3VuZCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKG9mZnNldFRvcCAtIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgKyBoZWlnaHREZWx0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmdldFZhbHVlKHRoYXQuc3VnZ2VzdGlvbnNbaW5kZXhdLnZhbHVlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9uU2VsZWN0Q2FsbGJhY2sgPSB0aGF0Lm9wdGlvbnMub25TZWxlY3QsXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvbiA9IHRoYXQuc3VnZ2VzdGlvbnNbaW5kZXhdO1xuXG4gICAgICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHRoYXQuZ2V0VmFsdWUoc3VnZ2VzdGlvbi52YWx1ZSk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gdGhhdC5lbC52YWwoKSAmJiAhdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gc3VnZ2VzdGlvbjtcblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihvblNlbGVjdENhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIG9uU2VsZWN0Q2FsbGJhY2suY2FsbCh0aGF0LmVsZW1lbnQsIHN1Z2dlc3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldFZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXIgPSB0aGF0Lm9wdGlvbnMuZGVsaW1pdGVyLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICBwYXJ0cztcblxuICAgICAgICAgICAgaWYgKCFkZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlO1xuICAgICAgICAgICAgcGFydHMgPSBjdXJyZW50VmFsdWUuc3BsaXQoZGVsaW1pdGVyKTtcblxuICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZS5zdWJzdHIoMCwgY3VycmVudFZhbHVlLmxlbmd0aCAtIHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLmxlbmd0aCkgKyB2YWx1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNwb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LmVsLm9mZignLmF1dG9jb21wbGV0ZScpLnJlbW92ZURhdGEoJ2F1dG9jb21wbGV0ZScpO1xuICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS5hdXRvY29tcGxldGUnLCB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSk7XG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIENyZWF0ZSBjaGFpbmFibGUgalF1ZXJ5IHBsdWdpbjpcbiAgICAkLmZuLmF1dG9jb21wbGV0ZSA9ICQuZm4uZGV2YnJpZGdlQXV0b2NvbXBsZXRlID0gZnVuY3Rpb24gKG9wdGlvbnMsIGFyZ3MpIHtcbiAgICAgICAgdmFyIGRhdGFLZXkgPSAnYXV0b2NvbXBsZXRlJztcbiAgICAgICAgLy8gSWYgZnVuY3Rpb24gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50IHJldHVyblxuICAgICAgICAvLyBpbnN0YW5jZSBvZiB0aGUgZmlyc3QgbWF0Y2hlZCBlbGVtZW50OlxuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpcnN0KCkuZGF0YShkYXRhS2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGlucHV0RWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSAmJiB0eXBlb2YgaW5zdGFuY2Vbb3B0aW9uc10gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Vbb3B0aW9uc10oYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBpbnN0YW5jZSBhbHJlYWR5IGV4aXN0cywgZGVzdHJveSBpdDpcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgaW5zdGFuY2UuZGlzcG9zZSkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IEF1dG9jb21wbGV0ZSh0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5LCBpbnN0YW5jZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59KSk7XG4iLG51bGxdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
