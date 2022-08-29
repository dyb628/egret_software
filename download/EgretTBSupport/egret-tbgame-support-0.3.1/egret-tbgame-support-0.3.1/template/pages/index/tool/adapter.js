"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/******/
(function (modules) {
  // webpackBootstrap

  /******/
  // The module cache

  /******/
  var installedModules = {};
  /******/

  /******/
  // The require function

  /******/

  function __webpack_require__(moduleId) {
    /******/

    /******/
    // Check if module is in cache

    /******/
    if (installedModules[moduleId]) {
      /******/
      return installedModules[moduleId].exports;
      /******/
    }
    /******/
    // Create a new module (and put it into the cache)

    /******/


    var module = installedModules[moduleId] = {
      /******/
      i: moduleId,

      /******/
      l: false,

      /******/
      exports: {}
      /******/

    };
    /******/

    /******/
    // Execute the module function

    /******/

    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/

    /******/
    // Flag the module as loaded

    /******/

    module.l = true;
    /******/

    /******/
    // Return the exports of the module

    /******/

    return module.exports;
    /******/
  }
  /******/

  /******/

  /******/
  // expose the modules object (__webpack_modules__)

  /******/


  __webpack_require__.m = modules;
  /******/

  /******/
  // expose the module cache

  /******/

  __webpack_require__.c = installedModules;
  /******/

  /******/
  // define getter function for harmony exports

  /******/

  __webpack_require__.d = function (exports, name, getter) {
    /******/
    if (!__webpack_require__.o(exports, name)) {
      /******/
      Object.defineProperty(exports, name, {
        enumerable: true,
        get: getter
      });
      /******/
    }
    /******/

  };
  /******/

  /******/
  // define __esModule on exports

  /******/


  __webpack_require__.r = function (exports) {
    /******/
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      /******/
      Object.defineProperty(exports, Symbol.toStringTag, {
        value: 'Module'
      });
      /******/
    }
    /******/


    Object.defineProperty(exports, '__esModule', {
      value: true
    });
    /******/
  };
  /******/

  /******/
  // create a fake namespace object

  /******/
  // mode & 1: value is a module id, require it

  /******/
  // mode & 2: merge all properties of value into the ns

  /******/
  // mode & 4: return value when already ns object

  /******/
  // mode & 8|1: behave like require

  /******/


  __webpack_require__.t = function (value, mode) {
    /******/
    if (mode & 1) value = __webpack_require__(value);
    /******/

    if (mode & 8) return value;
    /******/

    if (mode & 4 && _typeof(value) === 'object' && value && value.__esModule) return value;
    /******/

    var ns = Object.create(null);
    /******/

    __webpack_require__.r(ns);
    /******/


    Object.defineProperty(ns, 'default', {
      enumerable: true,
      value: value
    });
    /******/

    if (mode & 2 && typeof value != 'string') for (var key in value) {
      __webpack_require__.d(ns, key, function (key) {
        return value[key];
      }.bind(null, key));
    }
    /******/

    return ns;
    /******/
  };
  /******/

  /******/
  // getDefaultExport function for compatibility with non-harmony modules

  /******/


  __webpack_require__.n = function (module) {
    /******/
    var getter = module && module.__esModule ?
      /******/
      function getDefault() {
        return module['default'];
      } :
      /******/
      function getModuleExports() {
        return module;
      };
    /******/

    __webpack_require__.d(getter, 'a', getter);
    /******/


    return getter;
    /******/
  };
  /******/

  /******/
  // Object.prototype.hasOwnProperty.call

  /******/


  __webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };
  /******/

  /******/
  // __webpack_public_path__

  /******/


  __webpack_require__.p = "";
  /******/

  /******/

  /******/
  // Load entry module and return exports

  /******/

  return __webpack_require__(__webpack_require__.s = "./src/index.ts");
  /******/
})(
  /************************************************************************/

  /******/
  {
    /***/
    "./src/Audio.ts":
      /*!**********************!*\
        !*** ./src/Audio.ts ***!
        \**********************/

      /*! no static exports found */

      /***/
      function srcAudioTs(module, exports, __webpack_require__) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var _extendStatics = function extendStatics(d, b) {
            _extendStatics = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) {
                if (b.hasOwnProperty(p)) d[p] = b[p];
              }
            };

            return _extendStatics(d, b);
          };

          return function (d, b) {
            _extendStatics(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var HTMLAudioElement_1 = __webpack_require__(
          /*! ./HTMLAudioElement */
          "./src/HTMLAudioElement.ts");

        var $innerAudioContextMap = {};
        var SN_SEED = 1;

        var Audio =
          /** @class */
          function (_super) {
            __extends(Audio, _super);

            function Audio(url) {
              if (url === void 0) {
                url = '';
              }

              var _this = _super.call(this) || this;

              _this.readyState = 0
                /* HAVE_NOTHING */
                ;
              _this.$sn = SN_SEED++;
              _this.$currentTime = 0;
              _this.$canplayEvents = ['load', 'loadend', 'canplay', 'canplaythrough', 'loadedmetadata'];
              var innerAudioContext = my.createInnerAudioContext();
              $innerAudioContextMap[_this.$sn] = innerAudioContext;
              innerAudioContext.onCanplay(function () {
                _this.$loaded = true;
                _this.readyState = 2
                  /* HAVE_CURRENT_DATA */
                  ;

                _this.$canplayEvents.forEach(function (type) {
                  _this.dispatchEvent({
                    type: type
                  });
                });
              });
              innerAudioContext.onPlay(function () {
                _this.$paused = $innerAudioContextMap[_this.$sn].paused;

                _this.dispatchEvent({
                  type: 'play'
                });
              });
              innerAudioContext.onPause(function () {
                var ctx = $innerAudioContextMap[_this.$sn];
                _this.$paused = ctx.paused;
                _this.$currentTime = ctx.currentTime;

                _this.dispatchEvent({
                  type: 'pause'
                });
              });
              innerAudioContext.onTimeUpdate(function () {
                _this.dispatchEvent({
                  type: 'timeupdate'
                });
              });
              innerAudioContext.onEnded(function () {
                _this.$paused = $innerAudioContextMap[_this.$sn].paused;

                if ($innerAudioContextMap[_this.$sn].loop === false) {
                  _this.dispatchEvent({
                    type: 'ended'
                  });
                }

                _this.readyState = 4
                  /* HAVE_ENOUGH_DATA */
                  ;
              });
              innerAudioContext.onError(function () {
                _this.$paused = $innerAudioContextMap[_this.$sn].paused;

                _this.dispatchEvent({
                  type: 'error'
                });
              });

              if (url) {
                _this.src = url;
              } else {
                _this.$src = '';
              }

              _this.$loop = innerAudioContext.loop;
              _this.$autoplay = innerAudioContext.autoplay;
              _this.$paused = innerAudioContext.paused;
              _this.$volume = innerAudioContext.volume;
              _this.$muted = false;
              return _this;
            }

            Audio.prototype.addEventListener = function (type, listener, options) {
              if (options === void 0) {
                options = {};
              }

              type = String(type).toLowerCase();

              _super.prototype.addEventListener.call(this, type, listener, options);

              if (this.$loaded && this.$canplayEvents.indexOf(type) !== -1) {
                this.dispatchEvent({
                  type: type
                });
              }
            };

            Audio.prototype.load = function () {
              // doesn't need call load() manually
              console.warn('==>[miniapp-game-adapter]<== HTMLAudioElement.load() is not implemented.');
            };

            Audio.prototype.play = function () {
              $innerAudioContextMap[this.$sn].play();
            };

            Audio.prototype.resume = function () {
              var cxt = $innerAudioContextMap[this.$sn];
              cxt.startTime = this.$currentTime;
              cxt.play();
            };

            Audio.prototype.pause = function () {
              $innerAudioContextMap[this.$sn].pause();
            };

            Audio.prototype.stop = function () {
              $innerAudioContextMap[this.$sn].stop();
            };

            Audio.prototype.destroy = function () {
              $innerAudioContextMap[this.$sn].destroy();
            };

            Audio.prototype.canPlayType = function (mediaType) {
              if (mediaType === void 0) {
                mediaType = '';
              }

              if (typeof mediaType !== 'string') {
                return '';
              }

              if (mediaType.indexOf('audio/mpeg') > -1 || mediaType.indexOf('audio/mp4')) {
                return 'probably';
              }

              return '';
            };

            Object.defineProperty(Audio.prototype, "currentTime", {
              get: function get() {
                return $innerAudioContextMap[this.$sn].currentTime;
              },
              set: function set(value) {
                $innerAudioContextMap[this.$sn].seek(value);
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Audio.prototype, "duration", {
              get: function get() {
                return $innerAudioContextMap[this.$sn].duration;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Audio.prototype, "src", {
              get: function get() {
                return this.$src;
              },
              set: function set(value) {
                this.$src = value;
                this.$loaded = false;
                this.readyState = 0
                  /* HAVE_NOTHING */
                  ;
                var innerAudioContext = $innerAudioContextMap[this.$sn];
                innerAudioContext.src = value;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Audio.prototype, "loop", {
              get: function get() {
                return this.$loop;
              },
              set: function set(value) {
                this.$loop = value;
                $innerAudioContextMap[this.$sn].loop = value;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Audio.prototype, "autoplay", {
              get: function get() {
                return this.$autoplay;
              },
              set: function set(value) {
                this.$autoplay = value;
                $innerAudioContextMap[this.$sn].autoplay = value;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Audio.prototype, "paused", {
              get: function get() {
                return this.$paused;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Audio.prototype, "volume", {
              get: function get() {
                return this.$volume;
              },
              set: function set(value) {
                this.$volume = value;

                if (!this.$muted) {
                  $innerAudioContextMap[this.$sn].volume = value;
                }
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Audio.prototype, "muted", {
              get: function get() {
                return this.$muted;
              },
              set: function set(value) {
                this.$muted = value;

                if (value) {
                  $innerAudioContextMap[this.$sn].volume = 0;
                } else {
                  $innerAudioContextMap[this.$sn].volume = this.$volume;
                }
              },
              enumerable: false,
              configurable: true
            });

            Audio.prototype.cloneNode = function () {
              var newAudio = new Audio();
              newAudio.loop = this.loop;
              newAudio.autoplay = this.autoplay;
              newAudio.src = this.src;
              return newAudio;
            };

            return Audio;
          }(HTMLAudioElement_1["default"]);

        exports["default"] = Audio;
        /***/
      },

    /***/
    "./src/Body.ts":
      /*!*********************!*\
        !*** ./src/Body.ts ***!
        \*********************/

      /*! no static exports found */

      /***/
      function srcBodyTs(module, exports, __webpack_require__) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var _extendStatics2 = function extendStatics(d, b) {
            _extendStatics2 = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) {
                if (b.hasOwnProperty(p)) d[p] = b[p];
              }
            };

            return _extendStatics2(d, b);
          };

          return function (d, b) {
            _extendStatics2(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var HTMLElement_1 = __webpack_require__(
          /*! ./HTMLElement */
          "./src/HTMLElement.ts");

        var Body =
          /** @class */
          function (_super) {
            __extends(Body, _super);

            function Body() {
              return _super.call(this, "body"
                /* body */
                , 0) || this;
            }

            return Body;
          }(HTMLElement_1["default"]);

        exports["default"] = Body;
        /***/
      },

    /***/
    "./src/Canvas.ts":
      /*!***********************!*\
        !*** ./src/Canvas.ts ***!
        \***********************/

      /*! no static exports found */

      /***/
      function srcCanvasTs(module, exports, __webpack_require__) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var _extendStatics3 = function extendStatics(d, b) {
            _extendStatics3 = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) {
                if (b.hasOwnProperty(p)) d[p] = b[p];
              }
            };

            return _extendStatics3(d, b);
          };

          return function (d, b) {
            _extendStatics3(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P ? value : new P(function (resolve) {
              resolve(value);
            });
          }

          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }

            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }

            function step(result) {
              result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }

            step((generator = generator.apply(thisArg, _arguments || [])).next());
          });
        };

        var __generator = this && this.__generator || function (thisArg, body) {
          var _ = {
            label: 0,
            sent: function sent() {
              if (t[0] & 1) throw t[1];
              return t[1];
            },
            trys: [],
            ops: []
          },
            f,
            y,
            t,
            g;
          return g = {
            next: verb(0),
            "throw": verb(1),
            "return": verb(2)
          }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
            return this;
          }), g;

          function verb(n) {
            return function (v) {
              return step([n, v]);
            };
          }

          function step(op) {
            if (f) throw new TypeError("Generator is already executing.");

            while (_) {
              try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];

                switch (op[0]) {
                  case 0:
                  case 1:
                    t = op;
                    break;

                  case 4:
                    _.label++;
                    return {
                      value: op[1],
                      done: false
                    };

                  case 5:
                    _.label++;
                    y = op[1];
                    op = [0];
                    continue;

                  case 7:
                    op = _.ops.pop();

                    _.trys.pop();

                    continue;

                  default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                      _ = 0;
                      continue;
                    }

                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                      _.label = op[1];
                      break;
                    }

                    if (op[0] === 6 && _.label < t[1]) {
                      _.label = t[1];
                      t = op;
                      break;
                    }

                    if (t && _.label < t[2]) {
                      _.label = t[2];

                      _.ops.push(op);

                      break;
                    }

                    if (t[2]) _.ops.pop();

                    _.trys.pop();

                    continue;
                }

                op = body.call(thisArg, _);
              } catch (e) {
                op = [6, e];
                y = 0;
              } finally {
                f = t = 0;
              }
            }

            if (op[0] & 5) throw op[1];
            return {
              value: op[0] ? op[1] : void 0,
              done: true
            };
          }
        };

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.getRealCanvasByID = exports.getCanvasByID = void 0;

        var HTMLElement_1 = __webpack_require__(
          /*! ./HTMLElement */
          "./src/HTMLElement.ts");

        var defaultCanvasID = 'egret-canvas';
        var canvasPool = {};

        function getCanvasByID(id) {
          return canvasPool[id];
        }

        exports.getCanvasByID = getCanvasByID;

        function getRealCanvasByID(id) {
          return canvasPool[id].$realCanvas;
        }

        exports.getRealCanvasByID = getRealCanvasByID;

        function setCanvasByID(id, canvas) {
          if (canvasPool[id]) {
            canvasPool[id].$realCanvas.isDie = true;
          }
          canvasPool[id] = canvas;
        }

        var Canvas =
          /** @class */
          function (_super) {
            __extends(Canvas, _super);

            function Canvas() {
              var _this = _super.call(this, "canvas"
                /* canvas */
              ) || this;

              _this.id = defaultCanvasID;
              return _this; // console.log('[Canvas.ts] create canvas...');
            }

            Object.defineProperty(Canvas.prototype, "width", {
              get: function get() {
                return this.$realCanvas.width;
              },
              set: function set(width) {
                this.$realCanvas.width = width;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Canvas.prototype, "height", {
              get: function get() {
                return this.$realCanvas.height;
              },
              set: function set(height) {
                this.$realCanvas.height = height;
              },
              enumerable: false,
              configurable: true
            });

            Canvas.prototype.initAsync = function () {
              return __awaiter(this, void 0, void 0, function () {
                var id;

                var _this = this;

                return __generator(this, function (_a) {
                  switch (_a.label) {
                    case 0:
                      id = this.id;
                      return [4
                        /*yield*/
                        , new Promise(function (resolve, reject) {
                          if (!id) {
                            reject(new Error('Adapter: The Canvas id should be defined'));
                          } // 2020-02-21 20:34:21 只有 success
                          if (!my.createCanvas) {
                            my.createCanvas = my._createCanvas;
                          }

                          my.createCanvas({
                            id: id,
                            success: function success(canvas) {
                              console.log("initsuccess");
                              _this.$realCanvas = canvas;
                              setCanvasByID(id, _this);
                              $global.window["canvas"] = _this;
                              resolve(canvas);
                            }
                          });
                        })];

                    case 1:
                      // console.log('[Canvas.ts] initAsync with id: ', id);
                      return [2
                        /*return*/
                        , _a.sent()];
                  }
                });
              });
            };

            Canvas.prototype.getRealCanvas = function () {
              return this.$realCanvas;
            };

            Canvas.prototype.getContext = function (contextType) {
              var ctx = null;

              if (contextType === '2d') {
                if (this.$context) {
                  return this.$context;
                }

                ctx = this.$realCanvas.getContext('2d');
                this.$context = ctx;
              } else {
                if (this.$glContext) {
                  return this.$glContext;
                }

                ctx = this.$realCanvas.getContext(contextType);
                this.$glContext = ctx;
              }

              return ctx;
            };

            Canvas.prototype.toDataURL = function () {
              return this.$realCanvas.toDataURL();
            };

            Canvas.prototype.getBoundingClientRect = function () {
              var window = $global.window;
              var ret = {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight
              };
              return ret;
            };

            return Canvas;
          }(HTMLElement_1["default"]);

        exports["default"] = Canvas;
        /***/
      },

    /***/
    "./src/DocumentElement.ts":
      /*!********************************!*\
        !*** ./src/DocumentElement.ts ***!
        \********************************/

      /*! no static exports found */

      /***/
      function srcDocumentElementTs(module, exports, __webpack_require__) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var _extendStatics4 = function extendStatics(d, b) {
            _extendStatics4 = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) {
                if (b.hasOwnProperty(p)) d[p] = b[p];
              }
            };

            return _extendStatics4(d, b);
          };

          return function (d, b) {
            _extendStatics4(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var HTMLElement_1 = __webpack_require__(
          /*! ./HTMLElement */
          "./src/HTMLElement.ts");

        var DocumentElement =
          /** @class */
          function (_super) {
            __extends(DocumentElement, _super);

            function DocumentElement() {
              return _super.call(this, "html"
                /* html */
                , 0) || this;
            }

            return DocumentElement;
          }(HTMLElement_1["default"]);

        exports["default"] = DocumentElement;
        /***/
      },

    /***/
    "./src/ELement.ts":
      /*!************************!*\
        !*** ./src/ELement.ts ***!
        \************************/

      /*! no static exports found */

      /***/
      function srcELementTs(module, exports, __webpack_require__) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var _extendStatics5 = function extendStatics(d, b) {
            _extendStatics5 = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) {
                if (b.hasOwnProperty(p)) d[p] = b[p];
              }
            };

            return _extendStatics5(d, b);
          };

          return function (d, b) {
            _extendStatics5(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var Node_1 = __webpack_require__(
          /*! ./Node */
          "./src/Node.ts");

        var WindowProperties_1 = __webpack_require__(
          /*! ./WindowProperties */
          "./src/WindowProperties.ts");

        var ELement =
          /** @class */
          function (_super) {
            __extends(ELement, _super);

            function ELement() {
              var _this = _super.call(this) || this;

              _this.className = '';
              _this.children = [];
              _this.scrollLeft = 0;
              _this.scrollTop = 0;
              _this.clientLeft = 0;
              _this.clientTop = 0;
              return _this;
            }

            ELement.prototype.setAttribute = function (name, value) {
              this[name] = value;
            };

            ELement.prototype.getAttribute = function (name) {
              return this[name];
            };

            ELement.prototype.getBoundingClientRect = function () {
              var ret = {
                x: 0,
                y: 0,
                top: 0,
                left: 0,
                width: this.clientWidth,
                height: this.clientHeight
              };
              ret.right = ret.width;
              ret.bottom = ret.height;
              return ret;
            };

            Object.defineProperty(ELement.prototype, "scrollWidth", {
              get: function get() {
                var innerWidth = WindowProperties_1["default"].innerWidth;
                return innerWidth;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(ELement.prototype, "scrollHeight", {
              get: function get() {
                var innerHeight = WindowProperties_1["default"].innerHeight;
                return innerHeight;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(ELement.prototype, "clientWidth", {
              get: function get() {
                var innerWidth = WindowProperties_1["default"].innerWidth;
                return innerWidth;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(ELement.prototype, "clientHeight", {
              get: function get() {
                var innerHeight = WindowProperties_1["default"].innerHeight;
                return innerHeight;
              },
              enumerable: false,
              configurable: true
            });
            return ELement;
          }(Node_1["default"]);

        exports["default"] = ELement;
        /***/
      },

    /***/
    "./src/Event.ts":
      /*!**********************!*\
        !*** ./src/Event.ts ***!
        \**********************/

      /*! no static exports found */

      /***/
      function srcEventTs(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var util_1 = __webpack_require__(
          /*! ./util */
          "./src/util/index.ts");

        var Event =
          /** @class */
          function () {
            function Event(type) {
              this.cancelBubble = false;
              this.cancelable = false;
              this.target = null;
              this.currentTarget = null;
              this.preventDefault = util_1.noop;
              this.stopPropagation = util_1.noop;
              this.timeStamp = Date.now();
              this.type = type;
            }

            return Event;
          }();

        exports["default"] = Event;
        /***/
      },

    /***/
    "./src/EventIniter/TouchEvent.ts":
      /*!***************************************!*\
        !*** ./src/EventIniter/TouchEvent.ts ***!
        \***************************************/

      /*! no static exports found */

      /***/
      function srcEventIniterTouchEventTs(module, exports, __webpack_require__) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var _extendStatics6 = function extendStatics(d, b) {
            _extendStatics6 = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) {
                if (b.hasOwnProperty(p)) d[p] = b[p];
              }
            };

            return _extendStatics6(d, b);
          };

          return function (d, b) {
            _extendStatics6(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.onReceivedTouchEvent = exports.TouchEvent = void 0;

        var $window = __webpack_require__(
          /*! ../window */
          "./src/window.ts");

        var document_1 = __webpack_require__(
          /*! ../document */
          "./src/document.ts");

        var Event_1 = __webpack_require__(
          /*! ../Event */
          "./src/Event.ts");

        var TouchEvent =
          /** @class */
          function (_super) {
            __extends(TouchEvent, _super);

            function TouchEvent(type) {
              var _this = _super.call(this, type) || this;

              _this.touches = [];
              _this.targetTouches = [];
              _this.changedTouches = [];
              _this.target = $window.getMainCanvasFromCurrentPage();
              _this.currentTarget = $window.getMainCanvasFromCurrentPage();
              return _this;
            }

            return TouchEvent;
          }(Event_1["default"]);

        exports.TouchEvent = TouchEvent;

        function eventHandlerFactory(type) {
          return function (rawEvent) {
            var event = new TouchEvent(type);
            event.changedTouches = rawEvent.changedTouches;

            for (var index = 0; index < event.changedTouches.length; index++) {
              var element = event.changedTouches[index];
              element.pageX = element.x;
              element.pageY = element.y;
            }

            event.touches = rawEvent.touches;

            for (var _index = 0; _index < event.touches.length; _index++) {
              var element = event.touches[_index];
              element.pageX = element.x;
              element.pageY = element.y;
            }

            event.targetTouches = Array.prototype.slice.call(rawEvent.touches);
            event.timeStamp = rawEvent.timeStamp; // console.log(event)

            document_1["default"].dispatchEvent(event);
          };
        }

        function onReceivedTouchEvent(type, rawEvent) {
          var event = new TouchEvent(type);
          event.changedTouches = rawEvent.changedTouches;
          event.touches = rawEvent.touches;
          event.targetTouches = Array.prototype.slice.call(rawEvent.touches);
          event.timeStamp = rawEvent.timeStamp;
          $global.window.canvas.dispatchEvent(event);
        }

        exports.onReceivedTouchEvent = onReceivedTouchEvent;
        ;

        if (my.onTouchStart) {
          my.onTouchStart(eventHandlerFactory('touchstart'));
        }

        if (my.onTouchMove) {
          my.onTouchMove(eventHandlerFactory('touchmove'));
        }

        if (my.onTouchEnd) {
          my.onTouchEnd(eventHandlerFactory('touchend'));
        }

        if (my.onTouchCancel) {
          my.onTouchCancel(eventHandlerFactory('touchcancel'));
        }
        /***/

      },

    /***/
    "./src/EventIniter/index.ts":
      /*!**********************************!*\
        !*** ./src/EventIniter/index.ts ***!
        \**********************************/

      /*! no static exports found */

      /***/
      function srcEventIniterIndexTs(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var TouchEvent_1 = __webpack_require__(
          /*! ./TouchEvent */
          "./src/EventIniter/TouchEvent.ts");

        Object.defineProperty(exports, "TouchEvent", {
          enumerable: true,
          get: function get() {
            return TouchEvent_1.TouchEvent;
          }
        });
        Object.defineProperty(exports, "onReceivedTouchEvent", {
          enumerable: true,
          get: function get() {
            return TouchEvent_1.onReceivedTouchEvent;
          }
        });
        /***/
      },

    /***/
    "./src/EventTarget.ts":
      /*!****************************!*\
        !*** ./src/EventTarget.ts ***!
        \****************************/

      /*! no static exports found */

      /***/
      function srcEventTargetTs(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        var $events = new WeakMap();

        var EventTarget =
          /** @class */
          function () {
            function EventTarget() {
              $events.set(this, {});
            }

            EventTarget.prototype.addEventListener = function (type, listener, options) {
              if (options === void 0) {
                options = {};
              }

              var events = $events.get(this);

              if (!events) {
                events = {};
                $events.set(this, events);
              }

              if (!events[type]) {
                events[type] = [];
              }

              events[type].push(listener);

              if (options.capture) {
                console.warn('==>[miniapp-game-adapter]<== EventTarget.addEventListener: options.capture is not implemented.');
              }

              if (options.once) {
                console.warn('==>[miniapp-game-adapter]<== EventTarget.addEventListener: options.once is not implemented.');
              }

              if (options.passive) {
                console.warn('==>[miniapp-game-adapter]<== EventTarget.addEventListener: options.passive is not implemented.');
              }
            };

            EventTarget.prototype.removeEventListener = function (type, listener) {
              var listeners = $events.get(this)[type];

              if (listeners && listeners.length > 0) {
                for (var i = listeners.length; i--; i > 0) {
                  if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                    break;
                  }
                }
              }
            };

            EventTarget.prototype.dispatchEvent = function (event) {
              if (event === void 0) {
                event = {};
              }

              var listeners = $events.get(this)[event.type];

              if (listeners) {
                for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
                  var listener = listeners_1[_i];
                  listener(event);
                }
              }
            };

            return EventTarget;
          }();

        exports["default"] = EventTarget;
        /***/
      },

    /***/
    "./src/FileReader.ts":
      /*!***************************!*\
        !*** ./src/FileReader.ts ***!
        \***************************/

      /*! no static exports found */

      /***/
      function srcFileReaderTs(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var FileReader =
          /** @class */
          function () {
            function FileReader() { }

            return FileReader;
          }();

        exports["default"] = FileReader;
        /***/
      },

    /***/
    "./src/HTMLAudioElement.ts":
      /*!*********************************!*\
        !*** ./src/HTMLAudioElement.ts ***!
        \*********************************/

      /*! no static exports found */

      /***/
      function srcHTMLAudioElementTs(module, exports, __webpack_require__) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var _extendStatics7 = function extendStatics(d, b) {
            _extendStatics7 = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) {
                if (b.hasOwnProperty(p)) d[p] = b[p];
              }
            };

            return _extendStatics7(d, b);
          };

          return function (d, b) {
            _extendStatics7(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var HTMLMediaElement_1 = __webpack_require__(
          /*! ./HTMLMediaElement */
          "./src/HTMLMediaElement.ts");

        var HTMLAudioElement =
          /** @class */
          function (_super) {
            __extends(HTMLAudioElement, _super);

            function HTMLAudioElement() {
              return _super.call(this, "audio"
                /* audio */
              ) || this;
            }

            return HTMLAudioElement;
          }(HTMLMediaElement_1["default"]);

        exports["default"] = HTMLAudioElement;
        /***/
      },

    /***/
    "./src/HTMLElement.ts":
      /*!****************************!*\
        !*** ./src/HTMLElement.ts ***!
        \****************************/

      /*! no static exports found */

      /***/
      function srcHTMLElementTs(module, exports, __webpack_require__) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var _extendStatics8 = function extendStatics(d, b) {
            _extendStatics8 = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) {
                if (b.hasOwnProperty(p)) d[p] = b[p];
              }
            };

            return _extendStatics8(d, b);
          };

          return function (d, b) {
            _extendStatics8(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        var __assign = this && this.__assign || function () {
          __assign = Object.assign || function (t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];

              for (var p in s) {
                if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
              }
            }

            return t;
          };

          return __assign.apply(this, arguments);
        };

        var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
          var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
          if ((typeof Reflect === "undefined" ? "undefined" : _typeof(Reflect)) === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) {
            if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
          }
          return c > 3 && r && Object.defineProperty(target, key, r), r;
        };

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var window = __webpack_require__(
          /*! ./window */
          "./src/window.ts");

        var ELement_1 = __webpack_require__(
          /*! ./ELement */
          "./src/ELement.ts");

        var util_1 = __webpack_require__(
          /*! ./util */
          "./src/util/index.ts");

        var WindowProperties_1 = __webpack_require__(
          /*! ./WindowProperties */
          "./src/WindowProperties.ts");

        var decorators_1 = __webpack_require__(
          /*! ./decorators */
          "./src/decorators/index.ts");

        var HTMLElement =
          /** @class */
          function (_super) {
            __extends(HTMLElement, _super);

            function HTMLElement(tagName, level) {
              if (tagName === void 0) {
                tagName = '';
              }

              var _this = _super.call(this) || this;

              _this.className = '';
              _this.children = [];
              _this.focus = util_1.noop;
              _this.blur = util_1.noop;
              _this.remove = util_1.noop;
              _this.innerHTML = '';
              _this.tagName = '';
              _this.classList = [];
              _this.offsetLeft = 0;
              _this.offsetTop = 0;
              _this.$style = {};
              _this.tagName = tagName.toUpperCase();
              _this.level = level;
              _this.classList.add = util_1.noop;
              _this.classList.remove = util_1.noop;
              _this.classList.contains = util_1.noop;
              _this.classList.toggle = util_1.noop;
              return _this;
            }

            Object.defineProperty(HTMLElement.prototype, "parentNode", {
              get: function get() {
                if (this.level === 0) {
                  return null;
                } else if (this.level === 1) {
                  // @ts-ignore
                  return window.document.documentElement;
                } else {
                  // @ts-ignore
                  return window.document.body;
                }
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(HTMLElement.prototype, "parentElement", {
              get: function get() {
                if (this.level === 0) {
                  return null;
                } else if (this.level === 1) {
                  // @ts-ignore
                  return window.document.documentElement;
                } else {
                  // @ts-ignore
                  return window.document.body;
                }
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(HTMLElement.prototype, "style", {
              get: function get() {
                var innerWidth = WindowProperties_1["default"].innerWidth,
                  innerHeight = WindowProperties_1["default"].innerHeight;
                this.$style = __assign({
                  top: '0px',
                  left: '0px',
                  width: innerWidth + "px",
                  height: innerHeight + "px",
                  margin: '0px',
                  padding: '0px'
                }, this.$style);
                return this.$style;
              },
              set: function set(obj) {
                this.$style = obj;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
              get: function get() {
                var innerWidth = WindowProperties_1["default"].innerWidth;
                return innerWidth;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
              get: function get() {
                var innerHeight = WindowProperties_1["default"].innerHeight;
                return innerHeight;
              },
              enumerable: false,
              configurable: true
            });

            __decorate([decorators_1.enumerable(true)], HTMLElement.prototype, "parentNode", null);

            __decorate([decorators_1.enumerable(true)], HTMLElement.prototype, "parentElement", null);

            return HTMLElement;
          }(ELement_1["default"]);

        exports["default"] = HTMLElement;
        /***/
      },

    /***/
    "./src/HTMLMediaElement.ts":
      /*!*********************************!*\
        !*** ./src/HTMLMediaElement.ts ***!
        \*********************************/

      /*! no static exports found */

      /***/
      function srcHTMLMediaElementTs(module, exports, __webpack_require__) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var _extendStatics9 = function extendStatics(d, b) {
            _extendStatics9 = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) {
                if (b.hasOwnProperty(p)) d[p] = b[p];
              }
            };

            return _extendStatics9(d, b);
          };

          return function (d, b) {
            _extendStatics9(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var HTMLElement_1 = __webpack_require__(
          /*! ./HTMLElement */
          "./src/HTMLElement.ts");

        var HTMLMediaElement =
          /** @class */
          function (_super) {
            __extends(HTMLMediaElement, _super);

            function HTMLMediaElement(type, level) {
              var _this = _super.call(this, type, level) || this;

              _this.readyState = 0
                /* HAVE_NOTHING */
                ;
              return _this;
            }

            HTMLMediaElement.prototype.addTextTrack = function () { };

            HTMLMediaElement.prototype.captureStream = function () { };

            HTMLMediaElement.prototype.fastSeek = function () { };

            return HTMLMediaElement;
          }(HTMLElement_1["default"]);

        exports["default"] = HTMLMediaElement;
        /***/
      },

    /***/
    "./src/HTMLVideoElement.ts":
      /*!*********************************!*\
        !*** ./src/HTMLVideoElement.ts ***!
        \*********************************/

      /*! no static exports found */

      /***/
      function srcHTMLVideoElementTs(module, exports, __webpack_require__) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var _extendStatics10 = function extendStatics(d, b) {
            _extendStatics10 = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) {
                if (b.hasOwnProperty(p)) d[p] = b[p];
              }
            };

            return _extendStatics10(d, b);
          };

          return function (d, b) {
            _extendStatics10(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var HTMLMediaElement_1 = __webpack_require__(
          /*! ./HTMLMediaElement */
          "./src/HTMLMediaElement.ts");

        var HTMLVideoElement =
          /** @class */
          function (_super) {
            __extends(HTMLVideoElement, _super);

            function HTMLVideoElement() {
              return _super.call(this, "video"
                /* video */
              ) || this;
            }

            return HTMLVideoElement;
          }(HTMLMediaElement_1["default"]);

        exports["default"] = HTMLVideoElement;
        /***/
      },

    /***/
    "./src/Image.ts":
      /*!**********************!*\
        !*** ./src/Image.ts ***!
        \**********************/

      /*! no static exports found */

      /***/
      function srcImageTs(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var window_1 = __webpack_require__(
          /*! ./window */
          "./src/window.ts");

        function Image() {
          var canvas = window_1.getMainRealCanvasFromCurrentPage();
          var img = canvas.createImage();
          return img;
        }

        exports["default"] = Image;
        /***/
      },

    /***/
    "./src/Node.ts":
      /*!*********************!*\
        !*** ./src/Node.ts ***!
        \*********************/

      /*! no static exports found */

      /***/
      function srcNodeTs(module, exports, __webpack_require__) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var _extendStatics11 = function extendStatics(d, b) {
            _extendStatics11 = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) {
                if (b.hasOwnProperty(p)) d[p] = b[p];
              }
            };

            return _extendStatics11(d, b);
          };

          return function (d, b) {
            _extendStatics11(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var EventTarget_1 = __webpack_require__(
          /*! ./EventTarget */
          "./src/EventTarget.ts");

        var util_1 = __webpack_require__(
          /*! ./util */
          "./src/util/index.ts");

        var Node =
          /** @class */
          function (_super) {
            __extends(Node, _super);

            function Node() {
              var _this = _super.call(this) || this;

              _this.childNodes = [];
              _this.insertBefore = util_1.noop;
              return _this;
            }

            Node.prototype.appendChild = function (node) {
              this.childNodes.push(node);
            };

            Node.prototype.removeChild = function (node) {
              var index = this.childNodes.findIndex(function (child) {
                return child === node;
              });

              if (index > -1) {
                return this.childNodes.splice(index, 1);
              }

              return null;
            };

            Node.prototype.cloneNode = function () {
              var copyNode = Object.create(this);
              Object.assign(copyNode, this);
              return copyNode;
            };

            return Node;
          }(EventTarget_1["default"]);

        exports["default"] = Node;
        /***/
      },

    /***/
    "./src/Video.ts":
      /*!**********************!*\
        !*** ./src/Video.ts ***!
        \**********************/

      /*! no static exports found */

      /***/
      function srcVideoTs(module, exports, __webpack_require__) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var _extendStatics12 = function extendStatics(d, b) {
            _extendStatics12 = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) {
                if (b.hasOwnProperty(p)) d[p] = b[p];
              }
            };

            return _extendStatics12(d, b);
          };

          return function (d, b) {
            _extendStatics12(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var HTMLVideoElement_1 = __webpack_require__(
          /*! ./HTMLVideoElement */
          "./src/HTMLVideoElement.ts");

        var Video =
          /** @class */
          function (_super) {
            __extends(Video, _super);

            function Video() {
              var _this = _super.call(this) || this;

              console.error('==>[miniapp-game-adapter]<== HTMLVideoElement is not implemented.');
              return _this;
            }

            Video.prototype.load = function () {
              console.warn('==>[miniapp-game-adapter]<== Method not implemented.');
            };

            Video.prototype.play = function () {
              console.warn('==>[miniapp-game-adapter]<== Method not implemented.');
            };

            Video.prototype.resume = function () {
              console.warn('==>[miniapp-game-adapter]<== Method not implemented.');
            };

            Video.prototype.pause = function () {
              console.warn('==>[miniapp-game-adapter]<== Method not implemented.');
            };

            Video.prototype.destroy = function () {
              console.warn('==>[miniapp-game-adapter]<== Method not implemented.');
            };

            Video.prototype.canPlayType = function (mediaType) {
              return '';
            };

            return Video;
          }(HTMLVideoElement_1["default"]);

        exports["default"] = Video;
        /***/
      },

    /***/
    "./src/WindowProperties.ts":
      /*!*********************************!*\
        !*** ./src/WindowProperties.ts ***!
        \*********************************/

      /*! no static exports found */

      /***/
      function srcWindowPropertiesTs(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var performance_1 = __webpack_require__(
          /*! ./performance */
          "./src/performance.ts");

        var screenInfo = {};

        var WindowProperties =
          /** @class */
          function () {
            function WindowProperties() {
              this.performance = performance_1.performance;
              this.performanceAsync = performance_1.performanceAsync;
              this.ontouchstart = null;
              this.ontouchmove = null;
              this.ontouchend = null;
              this.ontouchcancel = null;
            }

            WindowProperties.prototype.screenInfoAsync = function () {
              return new Promise(function (resolve, reject) {
                if (!screenInfo.windowWidth || !screenInfo.windowHeight) {
                  my.getSystemInfo({
                    success: function success(_a) {
                      var pixelRatio = _a.pixelRatio,
                        screenHeight = _a.screenHeight,
                        screenWidth = _a.screenWidth,
                        windowHeight = _a.windowHeight,
                        windowWidth = _a.windowWidth;
                      screenInfo = {
                        pixelRatio: pixelRatio,
                        screenHeight: screenHeight,
                        screenWidth: screenWidth,
                        windowHeight: windowHeight,
                        windowWidth: windowWidth
                      };
                      resolve(screenInfo);
                    },
                    fail: function fail() {
                      screenInfo = {};
                      reject();
                    }
                  });
                } else {
                  resolve(screenInfo);
                }
              });
            };

            Object.defineProperty(WindowProperties.prototype, "screenInfo", {
              get: function get() {
                if (!screenInfo.windowWidth || !screenInfo.windowHeight) {
                  var _a = my.getSystemInfoSync(),
                    windowWidth = _a.windowWidth,
                    windowHeight = _a.windowHeight,
                    screenWidth = _a.screenWidth,
                    screenHeight = _a.screenHeight,
                    pixelRatio = _a.pixelRatio;

                  screenInfo = {
                    windowWidth: windowWidth,
                    windowHeight: windowHeight,
                    screenWidth: screenWidth,
                    screenHeight: screenHeight,
                    pixelRatio: pixelRatio
                  };
                }

                return screenInfo;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(WindowProperties.prototype, "pixelRatio", {
              get: function get() {
                var pixelRatio = this.screenInfo.pixelRatio;
                return pixelRatio;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(WindowProperties.prototype, "devicePixelRatio", {
              get: function get() {
                var pixelRatio = this.screenInfo.pixelRatio;
                return pixelRatio;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(WindowProperties.prototype, "innerWidth", {
              get: function get() {
                var windowWidth = this.screenInfo.windowWidth;
                return windowWidth;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(WindowProperties.prototype, "innerHeight", {
              get: function get() {
                var windowHeight = this.screenInfo.windowHeight;
                return windowHeight;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(WindowProperties.prototype, "screen", {
              get: function get() {
                var _a = this.screenInfo,
                  windowWidth = _a.windowWidth,
                  windowHeight = _a.windowHeight,
                  screenWidth = _a.screenWidth,
                  screenHeight = _a.screenHeight;
                return {
                  availWidth: windowWidth,
                  availHeight: windowHeight,
                  availLeft: 0,
                  availTop: 0,
                  width: screenWidth,
                  height: screenHeight
                };
              },
              enumerable: false,
              configurable: true
            });
            return WindowProperties;
          }();

        var windowProperties = new WindowProperties();
        exports["default"] = windowProperties;
        /***/
      },

    /***/
    "./src/Worker.ts":
      /*!***********************!*\
        !*** ./src/Worker.ts ***!
        \***********************/

      /*! no static exports found */

      /***/
      function srcWorkerTs(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        /**
         * @appx_version 1.11.0
         */

        var Worker =
          /** @class */
          function () {
            function Worker(file) {
              var _this = this;

              this.onmessage = null; // 创建新Worker前, 需要结束现有的 Worker.terminate

              if (Worker.previousWorker) {
                Worker.previousWorker.terminate();
              }

              Worker.previousWorker = this;
              this.$file = file;
              this.$worker = my.createWorker(file);
              this.$worker.onMessage(function (res) {
                if (_this.onmessage) {
                  _this.onmessage({
                    target: _this,
                    data: res
                  });
                }
              });
            }

            Worker.prototype.postMessage = function (message) {
              this.$worker.postMessage(message);
            };

            Worker.prototype.terminate = function () {
              this.$worker.terminate();
              Worker.previousWorker = null;
            };

            Worker.previousWorker = null;
            return Worker;
          }();

        exports["default"] = Worker;
        /***/
      },

    /***/
    "./src/XMLHttpRequest.ts":
      /*!*******************************!*\
        !*** ./src/XMLHttpRequest.ts ***!
        \*******************************/

      /*! no static exports found */

      /***/
      function srcXMLHttpRequestTs(module, exports, __webpack_require__) {
        "use strict";

        var __extends = this && this.__extends || function () {
          var _extendStatics13 = function extendStatics(d, b) {
            _extendStatics13 = Object.setPrototypeOf || {
              __proto__: []
            } instanceof Array && function (d, b) {
              d.__proto__ = b;
            } || function (d, b) {
              for (var p in b) {
                if (b.hasOwnProperty(p)) d[p] = b[p];
              }
            };

            return _extendStatics13(d, b);
          };

          return function (d, b) {
            _extendStatics13(d, b);

            function __() {
              this.constructor = d;
            }

            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          };
        }();

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var EventTarget_1 = __webpack_require__(
          /*! ./EventTarget */
          "./src/EventTarget.ts");

        var window_1 = __webpack_require__(
          /*! ./window */
          "./src/window.ts");

        var $requestHeader = new WeakMap();
        var $responseHeader = new WeakMap();
        var $requestTask = new WeakMap();

        function $triggerEvent(type, event) {
          if (event === void 0) {
            event = {};
          }

          event.target = event.target || this;

          if (typeof this["on" + type] === 'function') {
            this["on" + type].call(this, event);
          }
        }

        function $changeReadyState(readyState, event) {
          if (event === void 0) {
            event = {};
          }

          this.readyState = readyState;
          event.readyState = readyState;
          $triggerEvent.call(this, 'readystatechange', event);
        }

        function $isRelativePath(url) {
          return !/^(http|https|ftp|file):\/\/.*/i.test(url);
        }

        var XMLHttpRequest =
          /** @class */
          function (_super) {
            __extends(XMLHttpRequest, _super);

            function XMLHttpRequest() {
              var _this = _super.call(this) || this;

              _this.onreadystatechange = null;
              _this.readyState = 0;
              _this.response = null;
              _this.responseText = null;
              _this.responseType = 'text';
              _this.dataType = 'string';
              _this.responseXML = null;
              _this.status = 0;
              _this.statusText = '';
              _this.timeout = 30000;
              _this.upload = {};
              _this.withCredentials = false;
              $requestHeader.set(_this, {
                'content-type': 'application/x-www-form-urlencoded'
              });
              $responseHeader.set(_this, {});
              return _this;
            }

            XMLHttpRequest.prototype.abort = function () {
              var myRequestTask = $requestTask.get(this);

              if (myRequestTask) {
                myRequestTask.abort();
              }
            };

            XMLHttpRequest.prototype.getAllResponseHeaders = function () {
              var responseHeader = $responseHeader.get(this);
              return Object.keys(responseHeader).map(function (header) {
                return header + ": " + responseHeader[header];
              }).join('\n');
            };

            XMLHttpRequest.prototype.getResponseHeader = function (header) {
              return $responseHeader.get(this)[header];
            }; // async, user, password 这几个参数在小程序内不支持


            XMLHttpRequest.prototype.open = function (method, url) {
              this.$method = method;
              this.$url = url;
              $changeReadyState.call(this, XMLHttpRequest.OPENED);
            };

            XMLHttpRequest.prototype.overrideMimeType = function (mimeType) { };

            XMLHttpRequest.prototype.send = function (data) {
              var _this = this;

              if (data === void 0) {
                data = '';
              }

              if (this.readyState !== XMLHttpRequest.OPENED) {
                throw new Error("Failed to execute 'send' on 'XMLHttpRequest': The object's state must be OPENED.");
              } else {
                var url = this.$url;
                var relative_1 = $isRelativePath(url);
                var responseType = this.responseType;
                var encoding = void 0;

                if (responseType === 'arraybuffer') {// encoding = 'binary'
                } else {
                  encoding = 'utf8';
                }

                delete this.response;
                this.response = null;

                var success = function success(_a) {
                  var result = _a.data,
                    statusCode = _a.status,
                    headers = _a.headers;
                  statusCode = statusCode === undefined ? 200 : statusCode;

                  if (typeof result !== 'string' && !(result instanceof ArrayBuffer)) {
                    try {
                      result = JSON.stringify(result);
                    } catch (e) {
                      result = result;
                    }
                  }

                  _this.status = statusCode;

                  if (headers) {
                    $responseHeader.set(_this, headers);
                  }

                  $triggerEvent.call(_this, 'loadstart');
                  $changeReadyState.call(_this, XMLHttpRequest.HEADERS_RECEIVED);
                  $changeReadyState.call(_this, XMLHttpRequest.LOADING);
                  _this.response = result;

                  if (result instanceof ArrayBuffer) {
                    Object.defineProperty(_this, 'responseText', {
                      enumerable: true,
                      configurable: true,
                      get: function get() {
                        throw new Error("InvalidStateError : responseType is " + _this.responseType);
                      }
                    });
                  } else {
                    _this.responseText = result;
                  } // IDE 下比较特殊，timeout 作为成功返回


                  switch (statusCode) {
                    case 13:
                      $triggerEvent.call(_this, 'timeout');
                      break;

                    default:
                  }

                  $changeReadyState.call(_this, XMLHttpRequest.DONE);
                  $triggerEvent.call(_this, 'load');
                  $triggerEvent.call(_this, 'loadend');
                };

                var fail = function fail(_a) {
                  var error = _a.error,
                    errorMessage = _a.errorMessage;

                  switch (error) {
                    case 9:
                      $triggerEvent.call(_this, 'abort');
                      break;

                    default:
                      $triggerEvent.call(_this, 'error', {
                        message: errorMessage
                      });
                  }

                  $triggerEvent.call(_this, 'loadend');

                  if (relative_1) {
                    console.warn("==>[miniapp-game-adapter]<== " + errorMessage);
                  }
                };

                if (relative_1) {
                  var fs = my.getFileSystemManager();
                  var options = {
                    filePath: url,
                    success: success,
                    fail: fail
                  };

                  if (encoding) {
                    options.encoding = encoding;
                  }

                  fs.readFile(options);
                  return;
                }

                var headers = $requestHeader.get(this);

                if (window_1.navigator.brand != "iPhone" && !headers['x-miniapp-big-file']) {
                  headers['x-miniapp-big-file'] = true;
                }

                var task = my.request({
                  data: data,
                  url: url,
                  timeout: this.timeout,
                  method: this.$method,
                  headers: headers,
                  dataType: this.responseType,
                  responseType: this.responseType,
                  success: success,
                  fail: fail
                });
                $requestTask.set(this, task);
              }
            };

            XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
              var myHeader = $requestHeader.get(this);
              myHeader[header] = value;
              $requestHeader.set(this, myHeader);
            };

            XMLHttpRequest.prototype.addEventListener = function (type, listener) {
              var _this = this;

              var self = this;

              if (typeof listener !== 'function') {
                return;
              }

              self['on' + type] = function (event) {
                if (event === void 0) {
                  event = {};
                }

                event.target = event.target || _this;
                listener.call(_this, event);
              };
            };

            XMLHttpRequest.prototype.removeEventListener = function (type, listener) {
              var self = this;

              if (self['on' + type] === listener) {
                self['on' + type] = null;
              }
            };

            XMLHttpRequest.UNSEND = 0;
            XMLHttpRequest.OPENED = 1; // open() 方法已经被调用。

            XMLHttpRequest.HEADERS_RECEIVED = 2; // send() 方法已经被调用，并且头部和状态已经可获得。

            XMLHttpRequest.LOADING = 3; // 下载中； responseText 属性已经包含部分数据。

            XMLHttpRequest.DONE = 4; // 下载操作已完成。

            return XMLHttpRequest;
          }(EventTarget_1["default"]);

        exports["default"] = XMLHttpRequest;
        /***/
      },

    /***/
    "./src/decorators/index.ts":
      /*!*********************************!*\
        !*** ./src/decorators/index.ts ***!
        \*********************************/

      /*! no static exports found */

      /***/
      function srcDecoratorsIndexTs(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.enumerable = void 0;

        function enumerable(value) {
          return function (target, propertyKey, descriptor) {
            descriptor.enumerable = value;
          };
        }

        exports.enumerable = enumerable;
        /***/
      },

    /***/
    "./src/document.ts":
      /*!*************************!*\
        !*** ./src/document.ts ***!
        \*************************/

      /*! no static exports found */

      /***/
      function srcDocumentTs(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var window = __webpack_require__(
          /*! ./window */
          "./src/window.ts");

        var Event_1 = __webpack_require__(
          /*! ./Event */
          "./src/Event.ts");

        var HTMLElement_1 = __webpack_require__(
          /*! ./HTMLElement */
          "./src/HTMLElement.ts");

        var Video_1 = __webpack_require__(
          /*! ./Video */
          "./src/Video.ts");

        var Image_1 = __webpack_require__(
          /*! ./Image */
          "./src/Image.ts");

        var Audio_1 = __webpack_require__(
          /*! ./Audio */
          "./src/Audio.ts");

        var Canvas_1 = __webpack_require__(
          /*! ./Canvas */
          "./src/Canvas.ts");

        var DocumentElement_1 = __webpack_require__(
          /*! ./DocumentElement */
          "./src/DocumentElement.ts");

        var Body_1 = __webpack_require__(
          /*! ./Body */
          "./src/Body.ts");

        var events = {};
        var document = {
          readyState: 'complete',
          visibilityState: "visible"
          /* VISIBLE */
          ,
          hidden: false,
          fullscreen: true,
          location: window.location,
          scripts: [],
          style: {},
          ontouchstart: null,
          ontouchmove: null,
          ontouchend: null,
          onvisibilitychange: null,
          parentNode: null,
          parentElement: null,
          createElement: function createElement(tagName, opts) {
            tagName = tagName.toLowerCase();

            if (tagName === "canvas"
              /* canvas */
            ) {
              var _a = opts || {},
                id = _a.id,
                _b = _a.width,
                width = _b === void 0 ? 100 : _b,
                _c = _a.height,
                height = _c === void 0 ? 100 : _c;

              if (id) {
                var canvas = new Canvas_1["default"]();
                canvas.id = id;
                return canvas;
              } else {
                var canvas = my._createOffscreenCanvas();

                canvas.addEventListener = window.addEventListener;
                canvas.addEventListener = window.removeEventListener;
                canvas.width = width;
                canvas.height = height;
                return canvas;
              }
            } else if (tagName === "audio"
              /* audio */
            ) {
              return new Audio_1["default"]();
            } else if (tagName === "image"
              /* img */
            ) {
              return new Image_1["default"]();
            } else if (tagName === "video"
              /* video */
            ) {
              return new Video_1["default"]();
            }

            return new HTMLElement_1["default"](tagName);
          },
          createTextNode: function createTextNode(text) {
            return text;
          },
          getElementById: function getElementById(id) {
            if (id === window.getMainCanvasIDFromCurrentPage()) {
              return window.getCanvasByID(id);
            }

            return null;
          },
          getElementsByTagName: function getElementsByTagName(tagName) {
            tagName = tagName.toLowerCase();

            if (tagName === "head"
              /* head */
            ) {
              return [document.head];
            } else if (tagName === "body"
              /* body */
            ) {
              return [document.body];
            } else if (tagName === "canvas"
              /* canvas */
            ) {
              return [window.getMainCanvasFromCurrentPage()];
            }

            return [];
          },
          getElementsByName: function getElementsByName(tagName) {
            if (tagName === "head"
              /* head */
            ) {
              return [document.head];
            } else if (tagName === "body"
              /* body */
            ) {
              return [document.body];
            } else if (tagName === "canvas"
              /* canvas */
            ) {
              return [window.getMainCanvasFromCurrentPage()];
            }

            return [];
          },
          querySelector: function querySelector(query) {
            var canvas = window.getMainCanvasFromCurrentPage();

            if (query === "head"
              /* head */
            ) {
              return document.head;
            } else if (query === "body"
              /* body */
            ) {
              return document.body;
            } else if (query === "canvas"
              /* canvas */
            ) {
              return canvas;
            } else if (query === "#" + canvas.id) {
              return canvas;
            }

            return null;
          },
          querySelectorAll: function querySelectorAll(query) {
            if (query === "head"
              /* head */
            ) {
              return [document.head];
            } else if (query === "body"
              /* body */
            ) {
              return [document.body];
            } else if (query === "canvas"
              /* canvas */
            ) {
              return [window.getMainCanvasFromCurrentPage()];
            }

            return [];
          },
          addEventListener: function addEventListener(type, listener) {
            if (!events[type]) {
              events[type] = [];
            }

            events[type].push(listener);
          },
          removeEventListener: function removeEventListener(type, listener) {
            var listeners = events[type];

            if (listeners && listeners.length > 0) {
              for (var i = listeners.length; i--; i > 0) {
                if (listeners[i] === listener) {
                  listeners.splice(i, 1);
                  break;
                }
              }
            }
          },
          dispatchEvent: function dispatchEvent(event) {
            var type = event.type;
            var listeners = events[type];

            if (listeners) {
              for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
                var listener = listeners_1[_i];
                listener(event);
              }
            }

            if (event.target && typeof event.target["on" + type] === 'function') {
              event.target["on" + type](event);
            }
          },
          documentElement: new DocumentElement_1["default"](),
          head: new HTMLElement_1["default"]("head"
            /* head */
          ),
          body: new Body_1["default"]()
        };

        function onVisibilityChange(visible) {
          return function () {
            var hidden = !visible;
            var event = new Event_1["default"]('visibilitychange');
            document.visibilityState = visible ? "visible"
              /* VISIBLE */
              : "hidden"
              /* HIDDEN */
              ;

            if (document.hidden === hidden) {
              return;
            }

            document.hidden = hidden;
            event.target = document;
            event.timeStamp = Date.now();
            document.dispatchEvent(event);
          };
        }

        if (my.onAppHide) {
          my.onAppHide(onVisibilityChange(false));
        }

        if (my.onAppShow) {
          my.onAppShow(onVisibilityChange(true));
        }

        exports["default"] = document;
        /***/
      },

    /***/
    "./src/index.ts":
      /*!**********************!*\
        !*** ./src/index.ts ***!
        \**********************/

      /*! no static exports found */

      /***/
      function srcIndexTs(module, exports, __webpack_require__) {
        "use strict"; /// <reference path="../node_modules/@types/node/globals.d.ts"/>

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var $window = __webpack_require__(
          /*! ./window */
          "./src/window.ts");

        var WindowProperties_1 = __webpack_require__(
          /*! ./WindowProperties */
          "./src/WindowProperties.ts");

        var global = $global;
        var window = Object.assign(WindowProperties_1["default"], $window); // @ts-ignore

        window.__MINI_ADAPTER_VERSION__ = '__VERSION__';

        function inject() {
          global.window = window;

          window.addEventListener = function (type, listener) {
            window.document.addEventListener(type, listener);
          };

          window.removeEventListener = function (type, listener) {
            window.document.removeEventListener(type, listener);
          };

          window.dispatchEvent = function (event) {
            if (event === void 0) {
              event = {};
            } // tslint:disable-next-line: no-console


            console.log('==>[miniapp-game-adapter]<== window.dispatchEvent', event.type, event);
          };

          let init = () => {
            var canvas = window.document.createElement("canvas", {
              id: "canvas"
            });
            canvas.addEventListener = window.addEventListener;
            canvas.removeEventListener = window.removeEventListener;
            canvas.initAsync().then(() => {
              var realCanvas = canvas.getRealCanvas();
              realCanvas.addEventListener = window.addEventListener;
              realCanvas.removeEventListener = window.removeEventListener;
              window.my = my; // window.requestAnimationFrame = null;
              // window.cancelAnimationFrame = null;
              window.requestAnimationFrame.start(realCanvas);
              if (global.runEgretCallback) {
                global.runEgretCallback();
              }
            });
          }
          // init();
          window.egretInject = init;
        }

        if (!global.$isAdapterInjected) {
          global.$isAdapterInjected = true;
          inject();
        }
        /***/

      },

    /***/
    "./src/localStorage.ts":
      /*!*****************************!*\
        !*** ./src/localStorage.ts ***!
        \*****************************/

      /*! no static exports found */

      /***/
      function srcLocalStorageTs(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });

        var $window = __webpack_require__(
          /*! ./window */
          "./src/window.ts");

        var localStorage = {
          get length() {
            var keys = my.getStorageInfoSync().keys;
            return keys.length;
          },

          key: function key(n) {
            var keys = my.getStorageInfoSync().keys;
            return keys[n];
          },
          getItem: function getItem(key) {
            var value = my.getStorageSync({
              key: key
            });

            if (Object.prototype.toString.call(value) === '[object Object]') {
              return value.data === '' ? null : value.data;
            }

            return value === '' ? null : value;
          },
          setItem: function setItem(key, value) {
            var item = {
              key: key,
              data: value
            };

            if ($window.asyncStorage) {
              return my.setStorage(item);
            }

            return my.setStorageSync(item);
          },
          removeItem: function removeItem(key) {
            if ($window.asyncStorage) {
              return my.removeStorage({
                key: key
              });
            }

            return my.removeStorageSync({
              key: key
            });
          },
          clear: function clear() {
            if ($window.asyncStorage) {
              return my.clearStorage();
            }

            return my.clearStorageSync();
          }
        };
        exports["default"] = localStorage;
        /***/
      },

    /***/
    "./src/location.ts":
      /*!*************************!*\
        !*** ./src/location.ts ***!
        \*************************/

      /*! no static exports found */

      /***/
      function srcLocationTs(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        var location = {
          href: 'game.js',
          reload: function reload() { },
          replace: function replace(href) {
            this.href = href;
          }
        };
        exports["default"] = location;
        /***/
      },

    /***/
    "./src/navigator.ts":
      /*!**************************!*\
        !*** ./src/navigator.ts ***!
        \**************************/

      /*! no static exports found */

      /***/
      function srcNavigatorTs(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        var ua = (navigator || {}).userAgent || (navigator || {}).swuserAgent;
        var $systemInfo = null;
        var $onLine;

        var Navigator =
          /** @class */
          function () {
            function Navigator() {
              this.isCanvasPlus = true;
              this.isAppXCanvasPlus = true;
              /* tslint:disable:max-line-length */
              // 支付宝：Mozilla/6.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile/14E269 ChannelId(0) Nebula  AlipayDefined() AliApp(AP/10.1.55) AlipayClient/10.1.55 AlipayIDE/Worker/0.60.87
              // 手淘：Mozilla/6.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Mobile/14E269 ChannelId(0) Nebula  AlipayDefined() AliApp(AP/10.1.55) AlipayClient/10.1.55 AlipayIDE Taobao/11457110/Worker/0.60.87

              /* tslint:enable:max-line-length */

              this.userAgent = ua || '';
            } // app: "alipay"
            // brand: "iPhone"
            // currentBattery: "-100%"
            // fontSizeSetting: 16
            // language: "zh-Hans"
            // model: "x86_64"
            // pixelRatio: 2
            // platform: "iOS"
            // screenHeight: 667
            // screenWidth: 375
            // statusBarHeight: 20
            // storage: "233.57 GB"
            // system: "10.1"
            // titleBarHeight: 44
            // transparentTitle: false
            // version: "10.1.52.00004380"
            // windowHeight: 603
            // windowWidth: 375


            Navigator.prototype.systemInfoAsync = function () {
              return new Promise(function (resolve, reject) {
                if ($systemInfo) {
                  resolve($systemInfo);
                } else {
                  my.getSystemInfo({
                    success: function success(res) {
                      $systemInfo = res;
                      resolve(res);
                    },
                    fail: function fail() {
                      $systemInfo = null;
                      reject();
                    }
                  });
                }
              });
            };

            Object.defineProperty(Navigator.prototype, "systemInfo", {
              get: function get() {
                if (!$systemInfo) {
                  $systemInfo = my.getSystemInfoSync({
                    windowHeight: true,
                    windowWidth: true,
                    screenHeight: true,
                    screenWidth: true,
                    platform: true
                  });
                }

                return $systemInfo;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Navigator.prototype, "geolocation", {
              // TODO 用 my.getLocation 来封装 geolocation
              get: function get() {
                return null;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Navigator.prototype, "systemVersion", {
              // system: "10.1"
              get: function get() {
                var system = this.systemInfo.system;
                return system;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Navigator.prototype, "brand", {
              // brand: "iPhone"
              get: function get() {
                var brand = this.systemInfo.brand;
                return brand;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Navigator.prototype, "language", {
              // language: "zh-Hans"
              get: function get() {
                var language = this.systemInfo.language;
                return language;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Navigator.prototype, "platform", {
              // platform: "iOS"
              get: function get() {
                var platform = this.systemInfo.platform;

                if (/AlipayIDE/g.test(ua)) {
                  platform = 'devtools';
                }

                return platform;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Navigator.prototype, "appVersion", {
              // version: "10.1.52.00004380"
              get: function get() {
                var version = this.systemInfo.version;
                return version;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Navigator.prototype, "transparentTitle", {
              // transparentTitle: false
              get: function get() {
                var transparentTitle = this.systemInfo.transparentTitle;
                return transparentTitle;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Navigator.prototype, "titleBarHeight", {
              // titleBarHeight: 44
              get: function get() {
                var titleBarHeight = this.systemInfo.titleBarHeight;
                return titleBarHeight;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Navigator.prototype, "statusBarHeight", {
              // statusBarHeight: 20
              get: function get() {
                var statusBarHeight = this.systemInfo.statusBarHeight;
                return statusBarHeight;
              },
              enumerable: false,
              configurable: true
            });
            Object.defineProperty(Navigator.prototype, "onLine", {
              get: function get() {
                if ($onLine !== void 0) {
                  // eslint-disable-line
                  return $onLine;
                }

                return 'Unknown';
              },
              set: function set(status) {
                $onLine = status;
              },
              enumerable: false,
              configurable: true
            });
            return Navigator;
          }();

        var $navigator = new Navigator();

        if (my.onNetworkStatusChange) {
          my.onNetworkStatusChange(function (event) {
            $navigator.onLine = event.isConnected;
          });
        }

        if (my.getNetworkType) {
          my.getNetworkType({
            success: function success(res) {
              $navigator.onLine = res.networkAvailable;
            }
          });
        }

        exports["default"] = $navigator;
        /***/
      },

    /***/
    "./src/performance.ts":
      /*!****************************!*\
        !*** ./src/performance.ts ***!
        \****************************/

      /*! no static exports found */

      /***/
      function srcPerformanceTs(module, exports, __webpack_require__) {
        "use strict";

        var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
          function adopt(value) {
            return value instanceof P ? value : new P(function (resolve) {
              resolve(value);
            });
          }

          return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
              try {
                step(generator.next(value));
              } catch (e) {
                reject(e);
              }
            }

            function rejected(value) {
              try {
                step(generator["throw"](value));
              } catch (e) {
                reject(e);
              }
            }

            function step(result) {
              result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }

            step((generator = generator.apply(thisArg, _arguments || [])).next());
          });
        };

        var __generator = this && this.__generator || function (thisArg, body) {
          var _ = {
            label: 0,
            sent: function sent() {
              if (t[0] & 1) throw t[1];
              return t[1];
            },
            trys: [],
            ops: []
          },
            f,
            y,
            t,
            g;
          return g = {
            next: verb(0),
            "throw": verb(1),
            "return": verb(2)
          }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
            return this;
          }), g;

          function verb(n) {
            return function (v) {
              return step([n, v]);
            };
          }

          function step(op) {
            if (f) throw new TypeError("Generator is already executing.");

            while (_) {
              try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];

                switch (op[0]) {
                  case 0:
                  case 1:
                    t = op;
                    break;

                  case 4:
                    _.label++;
                    return {
                      value: op[1],
                      done: false
                    };

                  case 5:
                    _.label++;
                    y = op[1];
                    op = [0];
                    continue;

                  case 7:
                    op = _.ops.pop();

                    _.trys.pop();

                    continue;

                  default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                      _ = 0;
                      continue;
                    }

                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                      _.label = op[1];
                      break;
                    }

                    if (op[0] === 6 && _.label < t[1]) {
                      _.label = t[1];
                      t = op;
                      break;
                    }

                    if (t && _.label < t[2]) {
                      _.label = t[2];

                      _.ops.push(op);

                      break;
                    }

                    if (t[2]) _.ops.pop();

                    _.trys.pop();

                    continue;
                }

                op = body.call(thisArg, _);
              } catch (e) {
                op = [6, e];
                y = 0;
              } finally {
                f = t = 0;
              }
            }

            if (op[0] & 5) throw op[1];
            return {
              value: op[0] ? op[1] : void 0,
              done: true
            };
          }
        };

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.performanceAsync = exports.performance = void 0;
        var performance = {};
        exports.performance = performance; // Date.now

        if (!(Date.now && Date.prototype.getTime)) {
          Date.now = function now() {
            return new Date().getTime();
          };
        }

        function getServerTimeAsync() {
          return new Promise(function (resolve) {
            try {
              my.getServerTime({
                success: function success(res) {
                  var time = res.time;

                  if (!time) {
                    resolve(time);
                  } else {
                    resolve(Date.now());
                  }
                },
                fail: function fail() {
                  resolve(Date.now());
                }
              });
            } catch (e) {
              resolve(Date.now());
            }
          });
        }

        var startTime = Date.now();
        performance.timing = {
          navigationStart: startTime
        };

        performance.now = function () {
          return Date.now() - startTime;
        };

        function performanceAsync() {
          return __awaiter(this, void 0, void 0, function () {
            var navigationStart;

            var _this = this;

            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  return [4
                    /*yield*/
                    , getServerTimeAsync()];

                case 1:
                  navigationStart = _a.sent();
                  return [2
                    /*return*/
                    , {
                      timing: {
                        navigationStart: navigationStart
                      },
                      now: function now() {
                        return __awaiter(_this, void 0, void 0, function () {
                          var now;
                          return __generator(this, function (_a) {
                            switch (_a.label) {
                              case 0:
                                return [4
                                  /*yield*/
                                  , getServerTimeAsync()];

                              case 1:
                                now = _a.sent();
                                return [2
                                  /*return*/
                                  , now - startTime];
                            }
                          });
                        });
                      }
                    }];
              }
            });
          });
        }

        exports.performanceAsync = performanceAsync;
        /***/
      },

    /***/
    "./src/util/index.ts":
      /*!***************************!*\
        !*** ./src/util/index.ts ***!
        \***************************/

      /*! no static exports found */

      /***/
      function srcUtilIndexTs(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.DATA_URI = exports.noop = void 0;

        function noop() { }

        exports.noop = noop;
        exports.DATA_URI = /^\s*data:(?:([\w-]+)\/([\w+.-]+))?(?:;charset=([\w-]+))?(?:;(base64))?,(.*)/i;
        /***/
      },

    /***/
    "./src/window.ts":
      /*!***********************!*\
        !*** ./src/window.ts ***!
        \***********************/

      /*! no static exports found */

      /***/
      function srcWindowTs(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.clearInterval = exports.setInterval = exports.clearTimeout = exports.setTimeout = exports.blur = exports.focus = exports.alert = exports.getMainRealCanvasFromCurrentPage = exports.getMainCanvasFromCurrentPage = exports.getMainCanvasIDFromCurrentPage = exports.getRealCanvasByID = exports.getCanvasByID = exports.asyncStorage = void 0;

        var Canvas_1 = __webpack_require__(
          /*! ./Canvas */
          "./src/Canvas.ts");

        Object.defineProperty(exports, "getCanvasByID", {
          enumerable: true,
          get: function get() {
            return Canvas_1.getCanvasByID;
          }
        });
        Object.defineProperty(exports, "getRealCanvasByID", {
          enumerable: true,
          get: function get() {
            return Canvas_1.getRealCanvasByID;
          }
        });

        var document_1 = __webpack_require__(
          /*! ./document */
          "./src/document.ts");

        Object.defineProperty(exports, "document", {
          enumerable: true,
          get: function get() {
            return document_1["default"];
          }
        });

        var navigator_1 = __webpack_require__(
          /*! ./navigator */
          "./src/navigator.ts");

        Object.defineProperty(exports, "navigator", {
          enumerable: true,
          get: function get() {
            return navigator_1["default"];
          }
        });

        var XMLHttpRequest_1 = __webpack_require__(
          /*! ./XMLHttpRequest */
          "./src/XMLHttpRequest.ts");

        Object.defineProperty(exports, "XMLHttpRequest", {
          enumerable: true,
          get: function get() {
            return XMLHttpRequest_1["default"];
          }
        });

        var Worker_1 = __webpack_require__(
          /*! ./Worker */
          "./src/Worker.ts");

        Object.defineProperty(exports, "Worker", {
          enumerable: true,
          get: function get() {
            return Worker_1["default"];
          }
        });

        var Image_1 = __webpack_require__(
          /*! ./Image */
          "./src/Image.ts");

        Object.defineProperty(exports, "Image", {
          enumerable: true,
          get: function get() {
            return Image_1["default"];
          }
        });

        var Audio_1 = __webpack_require__(
          /*! ./Audio */
          "./src/Audio.ts");

        Object.defineProperty(exports, "Audio", {
          enumerable: true,
          get: function get() {
            return Audio_1["default"];
          }
        });

        var FileReader_1 = __webpack_require__(
          /*! ./FileReader */
          "./src/FileReader.ts");

        Object.defineProperty(exports, "FileReader", {
          enumerable: true,
          get: function get() {
            return FileReader_1["default"];
          }
        });

        var ELement_1 = __webpack_require__(
          /*! ./ELement */
          "./src/ELement.ts");

        Object.defineProperty(exports, "Element", {
          enumerable: true,
          get: function get() {
            return ELement_1["default"];
          }
        });

        var HTMLElement_1 = __webpack_require__(
          /*! ./HTMLElement */
          "./src/HTMLElement.ts");

        Object.defineProperty(exports, "HTMLElement", {
          enumerable: true,
          get: function get() {
            return HTMLElement_1["default"];
          }
        });

        var index_1 = __webpack_require__(
          /*! ./EventIniter/index */
          "./src/EventIniter/index.ts");

        Object.defineProperty(exports, "TouchEvent", {
          enumerable: true,
          get: function get() {
            return index_1.TouchEvent;
          }
        });
        Object.defineProperty(exports, "onReceivedTouchEvent", {
          enumerable: true,
          get: function get() {
            return index_1.onReceivedTouchEvent;
          }
        });

        var localStorage_1 = __webpack_require__(
          /*! ./localStorage */
          "./src/localStorage.ts");

        Object.defineProperty(exports, "localStorage", {
          enumerable: true,
          get: function get() {
            return localStorage_1["default"];
          }
        });

        var location_1 = __webpack_require__(
          /*! ./location */
          "./src/location.ts");

        Object.defineProperty(exports, "location", {
          enumerable: true,
          get: function get() {
            return location_1["default"];
          }
        });
        var asyncStorage = false;
        exports.asyncStorage = asyncStorage;
        var $setTimeout = setTimeout;
        exports.setTimeout = $setTimeout;
        var $clearTimeout = clearTimeout;
        exports.clearTimeout = $clearTimeout;
        var $setInterval = setInterval;
        exports.setInterval = $setInterval;
        var $clearInterval = clearInterval;
        exports.clearInterval = $clearInterval;

        function alert(msg) {
          // tslint:disable-next-line: no-console
          console.log(msg);
        }

        exports.alert = alert;

        function focus() { }

        exports.focus = focus;

        function blur() { }

        exports.blur = blur;

        function getMainCanvasIDFromCurrentPage() {
          // @ts-ignore
          var defaultId = 'canvas';
          return defaultId;
        }

        exports.getMainCanvasIDFromCurrentPage = getMainCanvasIDFromCurrentPage; // 此方法耗时：iOS 0.0*ms

        function getMainRealCanvasFromCurrentPage() {
          var id = getMainCanvasIDFromCurrentPage();

          if (!id) {
            return null;
          }

          return Canvas_1.getRealCanvasByID(id);
        }

        exports.getMainRealCanvasFromCurrentPage = getMainRealCanvasFromCurrentPage;

        function getMainCanvasFromCurrentPage() {
          var id = getMainCanvasIDFromCurrentPage();

          if (!id) {
            return null;
          }

          return Canvas_1.getCanvasByID(id);
        }

        exports.getMainCanvasFromCurrentPage = getMainCanvasFromCurrentPage;

        var xRequestAnimationFrame_1 = __webpack_require__(
          /*! ./xRequestAnimationFrame */
          "./src/xRequestAnimationFrame.ts");

        Object.defineProperty(exports, "requestAnimationFrame", {
          enumerable: true,
          get: function get() {
            return xRequestAnimationFrame_1.requestAnimationFrame;
          }
        });
        Object.defineProperty(exports, "cancelAnimationFrame", {
          enumerable: true,
          get: function get() {
            return xRequestAnimationFrame_1.cancelAnimationFrame;
          }
        });
        /***/
      },

    /***/
    "./src/xRequestAnimationFrame.ts":
      /*!***************************************!*\
        !*** ./src/xRequestAnimationFrame.ts ***!
        \***************************************/

      /*! no static exports found */

      /***/
      function srcXRequestAnimationFrameTs(module, exports, __webpack_require__) {
        "use strict";

        Object.defineProperty(exports, "__esModule", {
          value: true
        });
        exports.cancelAnimationFrame = exports.requestAnimationFrame = void 0;

        var window_1 = __webpack_require__(
          /*! ./window */
          "./src/window.ts");

        var performance_1 = __webpack_require__(
          /*! ./performance */
          "./src/performance.ts");

        var ONE_FRAME_TIME = 16.7;
        var steps = [];
        var timeoutTimer = null;
        var tempFlag = 0;

        function handler(canvas) {
          if (canvas.isDie) {
            return;
          }
          steps.forEach(function (item) {
            if (item) {
              item(performance_1.performance.now());
            }
          });
          // var canvas = window_1.getMainRealCanvasFromCurrentPage();

          if (canvas) {
            var startTime_1 = performance_1.performance.now();
            canvas.requestAnimationFrame(function () {
              // tempFlag++;
              // if (tempFlag % 60 === 0) {
              //   console.log(
              //     `==>[miniapp-game-adapter]<== <${window_1.getMainCanvasFromCurrentPage().id}>.requestAnimationFrame`,
              //     new Date().toLocaleTimeString()
              //   );
              // }
              requestAnimationFrame.run(canvas);
            });
          }
        }

        var requestAnimationFrame = function requestAnimationFrame(callback) {
          if (typeof callback !== 'function') {
            throw new TypeError(callback + "is not a function");
          }

          if (steps.indexOf(callback) === -1) {
            steps.length = 0;
            steps.push(callback);
          }

          return steps.indexOf(callback);
        };

        exports.requestAnimationFrame = requestAnimationFrame; // tslint:disable-next-line: only-arrow-functions

        requestAnimationFrame.run = function (canvas) {
          // const now = performance.now();
          // const delay = ONE_FRAME_TIME - (now - startTime);
          // console.log(delay, now - startTime);
          handler(canvas);
        };

        requestAnimationFrame.start = requestAnimationFrame.run;

        var cancelAnimationFrame = function cancelAnimationFrame(id) {
          steps[id] = null;
        };

        exports.cancelAnimationFrame = cancelAnimationFrame;
        /***/
      }
    /******/

  });