(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var toDevanagari = require('eurodigit/src/to_non_euro').devanagari;
var MS_PER_DAY = 86400000;
var MONTH_NAMES = ['बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुन', 'चैत'];

// ------ TO UPDATE THESE HARDCODED VALUES USE /scripts/encode-days-in-month.js
// We have defined our own Epoch for Bikram Sambat: 1970-1-1 BS or 1913-4-13 AD
var BS_EPOCH_TS = -1789990200000; // = Date.parse('1913-4-13')
var BS_YEAR_ZERO = 1970;
var ENCODED_MONTH_LENGTHS = [
  5315258,5314490,9459438,8673005,5315258,5315066,9459438,8673005,5315258,5314298,9459438,5327594,5315258,5314298,9459438,5327594,5315258,5314286,9459438,5315306,5315258,5314286,8673006,5315306,5315258,5265134,8673006,5315258,5315258,9459438,8673005,5315258,5314298,9459438,8673005,5315258,5314298,9459438,8473322,5315258,5314298,9459438,5327594,5315258,5314298,9459438,5327594,5315258,5314286,8673006,5315306,5315258,5265134,8673006,5315306,5315258,9459438,8673005,5315258,5314490,9459438,8673005,5315258,5314298,9459438,8473325,5315258,5314298,9459438,5327594,5315258,5314298,9459438,5327594,5315258,5314286,9459438,5315306,5315258,5265134,8673006,5315306,5315258,5265134,8673006,5315258,5314490,9459438,8673005,5315258,5314298,9459438,8669933,5315258,5314298,9459438,8473322,5315258,5314298,9459438,5327594,5315258,5314286,9459438,5315306,5315258,5265134,8673006,5315306,5315258,5265134,5527290,5527277,5527226,5527226,5528046,5527277,5528250,5528057,5527277,5527277
];

// TODO ENCODED_MONTH_LENGTHS would be stored more efficiently converted to a string using
// String.fromCharCode.apply(String, ENCODED_MONTH_LENGTHS), and extracted using
// ENC_MTH.charCodeAt(...).  However, JS seems to do something weird with the
// top bits.

/**
 * Magic numbers:
 *   BS_YEAR_ZERO <- the first year (BS) encoded in ENCODED_MONTH_LENGTHS
 *   month #5 <- this is the only month which has a day variation of more than 1
 *   & 3 <- this is a 2 bit mask, i.e. 0...011
 */
function daysInMonth(year, month) {
  if(month < 1 || month > 12) throw new Error('Invalid month value ' + month);
  var delta = ENCODED_MONTH_LENGTHS[year - BS_YEAR_ZERO];
  if(typeof delta === 'undefined') throw new Error('No data for year: ' + year + ' BS');
  return 29 + ((delta >>>
      (((month-1) << 1))) & 3);
}

function zPad(x) { return x > 9 ? x : '0' + x; }

function toBik(greg) {
  // TODO do not use Date.parse(), as per https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
  var m, dM, year = BS_YEAR_ZERO,
      days = Math.floor((Date.parse(greg) - BS_EPOCH_TS) / MS_PER_DAY) + 1;

  while(days > 0) {
    for(m=1; m<=12; ++m) {
      dM = daysInMonth(year, m);
      if(days <= dM) return { year:year, month:m, day:days };
      days -= dM;
    }
    ++year;
  }

  throw new Error('Date outside supported range: ' + greg + ' AD');
}

function toBik_euro(greg) {
  var d = toBik(greg);
  return d.year + '-' + zPad(d.month) + '-' + zPad(d.day);
}

function toBik_dev(greg) {
  return toDevanagari(toBik_euro(greg));
}

function toBik_text(greg) {
  var d = toBik(greg);
  return toDevanagari(d.day) + ' ' + MONTH_NAMES[d.month-1] + ' ' + toDevanagari(d.year);
}

function toGreg(year, month, day) {
  // TODO month bounds-checking should be handled in daysInMonth()
  if(month < 1) throw new Error('Invalid month value ' + month);
  if(year < BS_YEAR_ZERO) throw new Error('Invalid year value ' + year);
  if(day < 1 || day > daysInMonth(year, month)) throw new Error('Invalid day value', day);

  var timestamp = BS_EPOCH_TS + (MS_PER_DAY * day);
  month--;

  while (year >= BS_YEAR_ZERO) {
    while (month > 0) {
      timestamp += (MS_PER_DAY * daysInMonth(year, month));
      month--;
    }
    month = 12;
    year--;
  }

  var d = new Date(timestamp);
  return {
    year: d.getUTCFullYear(),
    month: 1+d.getUTCMonth(),
    day: d.getUTCDate()
  };
}

function toGreg_text(year, month, day) {
  var d = toGreg(year, month, day);
  return d.year + '-' + zPad(d.month) + '-' + zPad(d.day);
}

module.exports = {
  daysInMonth: daysInMonth,
  toBik: toBik,
  toBik_dev: toBik_dev,
  toBik_euro: toBik_euro,
  toBik_text: toBik_text,
  toGreg: toGreg,
  toGreg_text: toGreg_text
};

},{"eurodigit/src/to_non_euro":5}],2:[function(require,module,exports){
"use strict";
module.exports = {
	to_euro: require('./to_euro'),
	to_int: require('./to_int'),
	to_non_euro: require('./to_non_euro')
};

},{"./to_euro":3,"./to_int":4,"./to_non_euro":5}],3:[function(require,module,exports){
'use strict';

function replacer(c) {
	c = c.charCodeAt(0);
	if(c < 1642) return c - 1632; // western arabic
	if(c < 1786) return c - 1776; // perso-arabic
	return c - 2406; // devanagari
}

module.exports = function(original) {
	return original && original.toString().replace(/[٠-٩۰-۹०-९]/g, replacer);
};

},{}],4:[function(require,module,exports){
var to_euro = require('./to_euro');

module.exports = function(s) {
	return parseInt(to_euro(s), 10);
};

},{"./to_euro":3}],5:[function(require,module,exports){
'use strict';

function from(base) {
	function replacer(c) { return String.fromCharCode(Number(c) + base); }
	return function(original) {
		return original && original.toString().replace(/[0-9]/g, replacer);
	};
}

module.exports = {
	devanagari: from(2406),
	eastern_arabic: from(1632),
	perso_arabic: from(1776)
};

},{}],6:[function(require,module,exports){
var bs = require('bikram-sambat');
var eurodig = require('eurodigit');
var from_dev = eurodig.to_int;
var to_dev = eurodig.to_non_euro.devanagari;


//> JQUERY SETUP

function initListeners($parent, dateInputSelecter) {
  if(arguments.length !== 2) throw new Error();

  $parent.find('.devanagari-number-input')
    // Because we change the content of the input field, we must be careful to
    // preserve the caret position from before the change.
    .on('input', function() {
      var $this = $(this);
      var selectionStart = this.selectionStart;
      $this.val(to_dev($this.val()));
      this.selectionStart = this.selectionEnd = selectionStart;
    })
    .on('change blur', function() {
      var $this = $(this);
      var $inputGroup = $this.parents('.bikram-sambat-input-group');
      updateConvertedDate($inputGroup, dateInputSelecter);
    })
    ;

  $parent.find('.bikram-sambat-input-group .dropdown-menu li a')
    .on('click', function() {
      var $this = $(this);
      var $inputGroup = $this.parents('.bikram-sambat-input-group');
      setVal($inputGroup, 'month', 1+$this.parent('li').index());
      $this.parents('.input-group-btn').find('.dropdown-toggle').html($this.text() + ' <span class="caret"></span>');

      updateConvertedDate($inputGroup, dateInputSelecter);
    });
}


//> HELPER FUNCTIONS

function fieldValue($parent, name) {
  return from_dev($parent.find('[name='+name+']').val());
}
function setVal($parent, name, val) {
  $parent.find('[name='+name+']').val(to_dev(val));
}
function setDropdown($parent, name, val) {
  var $input = $parent.find('[name='+name+']');
  $input.parents('.bikram-sambat-input-group')
    .find('.dropdown-menu li a')
    .eq(val - 1)
    .click();
}

function updateConvertedDate($inputGroup, dateInputSelecter) {
  var greg = getDate_greg_text($inputGroup);
  $(dateInputSelecter).val(greg).trigger('change');
}

//> EXPORTED FUNCTIONS

module.exports = window.bikram_sambat_bootstrap = {
  getDate_greg: function($inputGroup) {
    var year = fieldValue($inputGroup, 'year');
    var month = fieldValue($inputGroup, 'month');
    var day = fieldValue($inputGroup, 'day');
    try {
      return bs.toGreg(year, month, day);
    } catch(e) {
      return null;
    }
  },
  getDate_greg_text: getDate_greg_text,
  setDate_greg_text: function($inputGroup, dateInputSelecter, gregDateString) {
    var bik = bs.toBik(gregDateString);

    setVal($inputGroup, 'year', bik.year);
    setVal($inputGroup, 'day', bik.day);
    setDropdown($inputGroup, 'month', bik.month);
  },
  initListeners: initListeners,
};

function getDate_greg_text($inputGroup) {
  var year = fieldValue($inputGroup, 'year');
  var month = fieldValue($inputGroup, 'month');
  var day = fieldValue($inputGroup, 'day');
  try {
    return bs.toGreg_text(year, month, day);
  } catch(e) {
    return null;
  }
}

},{"bikram-sambat":1,"eurodigit":2}]},{},[6]);
