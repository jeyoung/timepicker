"use strict";

let ns;
(function (namespace) {

	/**
	 * Timepart namespace
	 */
	const Timepart = (function () {

		/**
		 * Represents a time part
		 * @constructor
		 * @param {number} value - the value of the part
		 * @param {number} min - the lower limit of allowed values
		 * @param {number} max - the upper limit of allowed values
		 */
		function Timepart(value, min, max) {
			this.value = value;
			this.min = min;
			this.max = max;
		}

		/**
		 * Sets the value for this time part
		 * @param {number} value - the value
		 */
		Timepart.prototype.set = function (value) {
			if (value < this.min || value > this.max)
				return;
			this.value = value;
		};

		/**
		 * Increments the value for this time part
		 */
		Timepart.prototype.increment = function () {
			if (++this.value > this.max)
				this.value = this.max;
		};

		/**
		 * Decrements the value for this time part
		 */
		Timepart.prototype.decrement = function () {
			if (--this.value < this.min)
				this.value = this.min;
		};

		/**
		 * Returns the formatted value for this time part
		 * @returns {string} the value in the format '0#'
		 */
		Timepart.prototype.formatted = function () {
			return this.value.toString().padStart(2, '0');
		};

		return Timepart;
	})();

	/**
	 * InputBuffer namespace
	 */
	const InputBuffer = (function () {

		/**
		 * Represents an input buffer.
		 * @constructor
		 * @param {number} size - the size of the buffer
		 */
		function InputBuffer(size) {
			this.inputs = new Array(size);
			this.index = 0;
			this.size = size;
		}

		/**
		 * Clears the buffer.
		 */
		InputBuffer.prototype.clear = function () {
			this.inputs.splice(0, this.size);
			this.index = 0;
		};

		/**
		 * Puts a value in the buffer.
		 * @param {string) str - the value
		 */
		InputBuffer.prototype.put = function (str) {
			this.inputs[this.index % this.size] = str;
			++this.index;
		};

		/**
		 * Returns the value of the buffer.
		 * @returns {string} the value of the buffer
		 */
		InputBuffer.prototype.value = function () {
			return this.inputs.join('');
		};

		return InputBuffer;
	})();

	/**
	 * TimepickerController namespace
	 */
	const TimepickerController = (function () {

		/**
		 * Represents the controller for the time picker element
		 * @constructor
		 * @param {HTMLInputElement} textbox - the textbox to be controlled
		 */
		function TimepickerController(textbox) {
			this.textbox = textbox;
			this.parts = [new Timepart(0, 0, 23), new Timepart(0, 0, 59), new Timepart(0, 0, 59)];
			this.partindex = 0;
			this.buffer = new InputBuffer(2);
		}

		/**
		 * Handles the 'keydown' event on the controlled textbox
		 * @param {KeyboardEvent} e - the event
		 */
		TimepickerController.prototype._onKeyDown = function (e) {
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

			switch (evt.keyCode) {
				case 37:
					this._previous();
					break;
				case 38:
					this._up();
					break;
				case 39:
					this._next();
					break;
				case 40:
					this._down();
					break;
				case 35:
					this._end();
					break;
				case 36:
					this._home();
					break;
				default:
					// Ignore Shift key presses, except if they are combine with Tab
					if (evt.shiftKey && evt.keyCode !== 9)
						break;

					// Ignore modified key presses
					if (evt.altKey || evt.ctrlKey)
						return;

					// Ignore Tab, Enter, and Escape key presses respectively
					if (evt.keyCode === 9 || evt.keyCode === 13 || evt.keyCode === 27)
						return;

					// Ignore F5 to F12 key presses
					if (evt.keyCode >= 112 && evt.keyCode <= 123)
						return;

					// Processes number row keys 1-0...
					if (evt.keyCode >= 48 && evt.keyCode <= 57)
						this._input(Math.abs(evt.keyCode - 48));
					// ... and numeric keypad keys 0-9
					else if (evt.keyCode >= 96 && evt.keyCode <= 105)
						this._input(Math.abs(evt.keyCode - 96));

					break;
			}

			ignoreDefaultEvent();

			this._update();
		};

		/**
		 * Initialises the controller
		 */
		TimepickerController.prototype.initialize = function () {
			this.textbox.addEventListener('keydown', function (e) {
				this._onKeyDown(e);
			}.bind(this));
			this.textbox.addEventListener('focus', function (e) {
				this._onFocus(e);
			}.bind(this));
			this._focus();
		};

		/**
		 * Handles the 'focus' event
		 * @param {FocusEvent} e - the event
		 */
		TimepickerController.prototype._onFocus = function (e) {
			this._focus();
		};

		/**
		 * Sets the focus on the controlled textbox
		 */
		TimepickerController.prototype._focus = function () {
			this.textbox.focus();
			this.partindex = 0;
			this.buffer.clear();
			setTimeout(function () {
				this._update();
			}.bind(this), 250);
		};

		/**
		 * Directly input the specified number into the current time part
		 * 
		 * @param {number} n - the input number
		 */
		TimepickerController.prototype._input = function (n) {
			this.buffer.put(n.toString());
			this.parts[this.partindex].set(Number.parseInt(this.buffer.value()));
		};

		/**
		 * Selects the next time part
		 */
		TimepickerController.prototype._next = function () {
			if (++this.partindex >= this.parts.length)
				this.partindex = 0;
			this.buffer.clear();
		};

		/**
		 * Selects the previous time part
		 */
		TimepickerController.prototype._previous = function () {
			if (--this.partindex < 0)
				this.partindex = 2;
			this.buffer.clear();
		};

		/**
		 * Selects the first time part
		 */
		TimepickerController.prototype._home = function () {
			this.partindex = 0;
			this.buffer.clear();
		};

		/**
		 * Selects the last time part
		 */
		TimepickerController.prototype._end = function () {
			this.partindex = this.parts.length-1;
			this.buffer.clear();
		};

		/**
		 * Increments the value of the selected time part
		 */
		TimepickerController.prototype._up = function () {
			this.parts[this.partindex].increment();
		};

		/**
		 * Decrements the value of the selected time part
		 */
		TimepickerController.prototype._down = function () {
			this.parts[this.partindex].decrement();
		};

		/**
		 * Updates the controlled textbox
		 */
		TimepickerController.prototype._update = function () {
			const previousValue = this.textbox.value;
			this.textbox.value = `${this.parts[0].formatted()}:${this.parts[1].formatted()}:${this.parts[2].formatted()}`;
			this.textbox.setSelectionRange(this.partindex * 3, this.partindex * 3 + 2);
			if (this.textbox.value !== previousValue) {
				this.textbox.dispatchEvent(new InputEvent('input', { data: this.textbox.value }));
				this.textbox.dispatchEvent(new InputEvent('change', { data: this.textbox.value }));
			}
		};

		return TimepickerController;
	})();

	namespace.TimepickerController = TimepickerController;

})(ns || (ns = {}));

window.addEventListener('load', function () {

	/*
	 * This shows how text INPUT elements can be made timepickers by
	 * wrapping them into controllers.
	 */

	// Using chained calls
	new ns.TimepickerController(document.querySelector('#text2')).initialize();

	// Using separate calls
	const textbox = document.querySelector('#text1');
	const controller = new ns.TimepickerController(textbox);
	controller.initialize();
});
