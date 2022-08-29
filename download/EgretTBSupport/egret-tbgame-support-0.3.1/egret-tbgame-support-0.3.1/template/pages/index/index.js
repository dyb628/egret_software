
var touchstartCB;
var touchcancelCB;
var touchendCB;
var touchmoveCB;
Page({
	onReady() {
	},
	onTouchStart(e) {
		// console.log("touch start",e);
		touchstartCB && touchstartCB(e)
	},
	onTouchCancel(e) {
		// console.log("touch cancel",e)
		touchcancelCB && touchcancelCB(e)
	},
	onTouchEnd(e) {
		// console.log("touch end",e)
		touchendCB && touchendCB(e)
	},
	onTouchMove(e) {
		// console.log("touch move",e);
		touchmoveCB && touchmoveCB(e)
	},
	canvasOnReady() {
		my.onTouchStart = function (cb) {
			touchstartCB = cb;
		}
		my.onTouchCancel = function (cb) {
			touchcancelCB = cb;
		}
		my.onTouchEnd = function (cb) {
			touchendCB = cb;
		}
		my.onTouchMove = function (cb) {
			touchmoveCB = cb;
		}
		require('./tool/adapter.js');
		var window = $global.window

		if ($global.$isAdapterInjected && window.egretInject) {
			window.egretInject();
		}

		$global.runEgretCallback = () => {
			window.Parser = require("./tool/dom_parser.js");
			require('../../manifest.js');
			require('./egret.tbgame.js');

			if (window.egret.clearEgret) {
				window.egret.clearEgret();
			}

			if (window.RES && window.RES.config.config) {
				for (let key in window.RES.config.config.groups) {
					window.RES.destroyRes(key, true);
				}
			}

			if (window.egret.Tween) {
				window.egret.Tween._inited = false;
				window.egret.Tween.removeAllTweens();
			}

			window.egret.runEgret({
				//以下为自动修改，请勿修改
				//The following is automatically modified, please do not modify
				//----auto option start----
				entryClassName: "Main",
				orientation: "auto",
				frameRate: 60,
				scaleMode: "fixedWidth",
				contentWidth: 414,
				contentHeight: 736,
				showFPS: false,
				fpsStyles: "x:0,y:0,size:12,textColor:0xffffff,bgAlpha:0.9",
				showLog: false,
				maxTouches: 2,
				//----auto option end----
				renderMode: 'webgl',
				audioType: 0,
				calculateCanvasScaleFactor: function (context) {
					var backingStore = context.backingStorePixelRatio ||
						context.webkitBackingStorePixelRatio ||
						context.mozBackingStorePixelRatio ||
						context.msBackingStorePixelRatio ||
						context.oBackingStorePixelRatio ||
						context.backingStorePixelRatio || 1;
					// console.log('main.1', window.devicePixelRatio, backingStore)
					return (window.devicePixelRatio || 1) / backingStore;
				}
			});
		}
	}
});
