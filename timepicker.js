let ns;
(function (namespace) {
	"use strict";
	const Timepart = (function () {

		function Timepart(value, min, max) {
			this.value = value;
			this.min = min;
			this.max = max;
		}

		Timepart.prototype.setValue = function (value) {
			if (value < this.min || value > this.max)
				return;
			this.value = value;
		};

		Timepart.prototype.increment = function () {
			if (++this.value > this.max)
				this.value = this.max;
		};

		Timepart.prototype.decrement = function () {
			if (--this.value < this.min)
				this.value = this.min;
		};

		Timepart.prototype.formatted = function () {
			const tmp = '00'+this.value.toString();
			return tmp.substring(tmp.length-2, tmp.length);
		};

		return Timepart;
	})();

	const TimepickerController = (function () {

		function TimepickerController(textbox) {
			this.textbox = textbox;
			this.partindex = 0;
			this.parts = [new Timepart(0, 0, 23), new Timepart(0, 0, 59), new Timepart(0, 0, 59)];
			this.buffer = "";
			this.buffertimeout = null;
			this.clearbuffer = function () {
				this.buffer = "";
			};
		}

		TimepickerController.prototype.onKeyDown = function (e) {
			const evt = e ? e : window.event;

			let ignoreDefaultEvent;
			if (typeof evt.preventDefault === 'function')
				ignoreDefaultEvent = function () {
					evt.preventDefault();
				};
			else
				ignoreDefaultEvent = function () {
					evt.returnValue = false;
				};

			let overrideEvent = true;
			switch (evt.keyCode) {
				case 13:
					alert(this.textbox.value);
					break;
				case 33:
				case 37:
					this.previous();
					break;
				case 38:
					this.up();
					break;
				case 34:
				case 39:
					this.next();
					break;
				case 40:
					this.down();
					break;
				case 35:
					this.end();
					break;
				case 36:
					this.home();
					break;
				default:
					if (evt.keyCode >= 48 && evt.keyCode <= 57)
						this.input(Math.abs(evt.keyCode-48));
					else if (evt.keyCode >= 96 && evt.keyCode <= 105)
						this.input(Math.abs(evt.keyCode-96));
					else
						overrideEvent = false;
					break;
			}

			if (overrideEvent)
				ignoreDefaultEvent();

			this.update();
		};

		TimepickerController.prototype.initialize = function () {
			this.textbox.addEventListener('keydown', function (e) {
				this.onKeyDown(e);
			}.bind(this));

			/* Perform an initial update */
			this.update();

			this.textbox.focus();
		};

		TimepickerController.prototype.input = function (n) {
			if (this.buffer.length == 2)
				this.clearbuffer();

			this.buffer = this.buffer+n.toString();
			this.parts[this.partindex].setValue(0+this.buffer);

			if (this.buffertimeout)
				clearTimeout(this.buffertimeout);
			this.buffertimeout = setTimeout(function () {
				this.clearbuffer();
			}.bind(this), 1000);
		};

		TimepickerController.prototype.next = function () {
			if (++this.partindex >= this.parts.length)
				this.partindex = 0;
			this.clearbuffer();
		};

		TimepickerController.prototype.previous = function () {
			if (--this.partindex < 0)
				this.partindex = 2;
			this.clearbuffer();
		};

		TimepickerController.prototype.home = function () {
			this.partIndex = 0;
			this.clearbuffer();
		};

		TimepickerController.prototype.end = function () {
			this.partIndex = this.parts.length-1;
			this.clearbuffer();
		};

		TimepickerController.prototype.up = function () {
			this.parts[this.partindex].increment();
		};

		TimepickerController.prototype.down = function () {
			this.parts[this.partindex].decrement();
		};

		TimepickerController.prototype.update = function () {
			this.textbox.value = this.parts[0].formatted() + ':' + this.parts[1].formatted() + ':' + this.parts[2].formatted();
			this.textbox.setSelectionRange(this.partindex*3, this.partindex*3+2);
		};

		return TimepickerController;
	})();

	namespace.TimepickerController = TimepickerController;

})(ns || (ns = {}));

window.addEventListener('load', function () {

	/* This shows how text INPUT elements can be made timepickers by
	 * wrapping them into controllers.
	 */

	const textbox = document.querySelector('#text1');
	const controller = new ns.TimepickerController(textbox);
	controller.initialize();

	new ns.TimepickerController(document.querySelector('#text2')).initialize();
});
