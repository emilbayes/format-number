module.exports = formatter;

function formatter(options) {
  options = options || {};
  options.negative = options.negative === 'R' ? 'R' : 'L';
  options.negativeOut = options.negativeOut === false ? false : true;
  options.prefix = options.prefix || '';
  options.suffix = options.suffix || '';
  options.separator = typeof options.separator === 'string' ? options.separator : ',';
  options.decimal = options.decimal || '.';

  function format(number, includeUnits, separate) {
    includeUnits = includeUnits === false ? false : true;
    separate = separate === false ? false : true;
    if (number || number === 0) {
      number = '' + number;//convert number to string if it isn't already
    } else {
      return '';
    }
    var output = [];
    var negative = number.charAt(0) === '-';
    number = number.replace(/^\-/g, '');

    if (!options.negativeOut && includeUnits) {
      output.push(options.prefix);
    }
    if (negative && options.negative === 'L') {
      output.push('-');
    }
    if (options.negativeOut && includeUnits) {
      output.push(options.prefix);
    }

    number = number.split('.');
    if (options.round != null) round(number, options.round);
    if (options.truncate != null) number[1] = truncate(number[1], options.truncate);
    if (options.padLeft) number[0] = padLeft(number[0], options.padLeft);
    if (options.padRight) number[1] = padRight(number[1], options.padRight);
    if (separate) number[0] = addSeparators(number[0], options.separator);
    output.push(number[0]);
    if (number[1]) {
      output.push(options.decimal);
      output.push(number[1]);
    }


    if (options.negativeOut && includeUnits) {
      output.push(options.suffix);
    }
    if (negative && options.negative === 'R') {
      output.push('-');
    }
    if (!options.negativeOut && includeUnits) {
      output.push(options.suffix);
    }

    return output.join('');
  }

  format.negative = options.negative;
  format.negativeOut = options.negativeOut;
  format.prefix = options.prefix;
  format.suffix = options.suffix;
  format.separate = options.separate;
  format.separator = options.separator;
  format.decimal = options.decimal;
  format.padLeft = options.padLeft;
  format.padRight = options.padRight;
  format.truncate = options.truncate;
  format.round = options.round;

  function unformat(number, allowedSeparators) {
    allowedSeparators = allowedSeparators || [];
    if (options.allowedSeparators) {
      options.allowedSeparators.forEach(function (s) { allowedSeparators.push (s); });
    }
    allowedSeparators.push(options.separator);
    number = number.replace(options.prefix, '');
    number = number.replace(options.suffix, '');
    var newNumber = number;
    do {
      number = newNumber;
      for (var i = 0; i < allowedSeparators.length; i++) {
        newNumber = newNumber.replace(allowedSeparators[i], '');
      }
    } while (newNumber != number);
    return number;
  }
  format.unformat = unformat;

  function validate(number, allowedSeparators) {
    number = unformat(number, allowedSeparators);
    number = number.split(options.decimal);
    if (number.length > 2) {
      return false;
    } else if (options.truncate != null && number[1] && number[1].length > options.truncate) {
      return false;
    }  else if (options.round != null && number[1] && number[1].length > options.round) {
      return false;
    } else {
      return /^-?\d+\.?\d*$/.test(number);
    }
  }
  return format;
}

//where x is already the integer part of the number
function addSeparators(x, separator) {
  x += '';
  if (!separator) return x;
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x)) {
    x = x.replace(rgx, '$1' + separator + '$2');
  }
  return x;
}

function padLeft(x, padding) {
  x = x + '';
  var buf = [];
  while (buf.length + x.length < padding) {
    buf.push('0');
  }
  return buf.join('') + x;
}
function padRight(x, padding) {
  if (x) {
    x += '';
  } else {
    x = '';
  }
  var buf = [];
  while (buf.length + x.length < padding) {
    buf.push('0');
  }
  return x + buf.join('');
}
function truncate(x, length) {
  if (x) {
    x += '';
  }
  if (x && x.length > length) {
    return x.substr(0, length);
  } else {
    return x;
  }
}
function round(number, length) {
  if (!number[1]) return number
  var integ = number[0] + ''
  var decim = number[1] + ''
  if (decim.length > length) {
    var decider = +decim[length]
    if (decider >= 5) {
      decider = 10
      decim = decim.substring(0, length)
    } else if (length === 0) {
      number.pop()
      return number
    } else {
      number[1] = decim.substring(0, length)
      return number
    }
    while (decider === 10 && decim.length) {
      decider = (+decim[decim.length - 1]) + 1
      decim = decim.substring(0, decim.length - 1)
    }
    if (decider < 10) {
      number[1] = decim + decider
    } else {
      integ = (+integ) + 1
      number[0] = integ + ''
      number.pop()
    }
    return number
  } else {
    return number
  }
}
