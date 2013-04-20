function myTip(options) {
  if (!this.$myTip) {
    this.$myTip = new tooltip(options);
  } else {
    this.$myTip.updateOptions(options);
  }

  return this.$myTip;
}

function tooltip(options) {
  this.defaults = {
    x: 0,
    y: 0,
    title: '',
    html: false,
    gravity: 's',
    opacity: 0.3
  };

  if (typeof options == 'object') {
      this.options = $.extend(this.defaults, options);
  } else {
      this.options = this.defaults;
  }
}

tooltip.prototype = {
  show: function() {
    var title = this.options.title;
    var $tip = this.tip();

    $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
    $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
    $tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).prependTo(document.body);
    
    var actualWidth = $tip[0].offsetWidth,
        actualHeight = $tip[0].offsetHeight,
        gravity = this.options.gravity;

    var tp;
    switch (gravity.charAt(0)) {
        case 'n':
            tp = {top: this.options.y, left: this.options.x - actualWidth / 2};
            break;
        case 's':
            tp = {top: this.options.y - actualHeight, left: this.options.x - actualWidth / 2};
            break;
        case 'e':
            tp = {top: this.options.y - actualHeight / 2, left: this.options.x - actualWidth};
            break;
        case 'w':
            tp = {top: this.options.y - actualHeight / 2, left: this.options.x};
            break;
    }

    $tip.css(tp).addClass('tipsy-' + gravity);
    $tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);

    $tip.css({visibility: 'visible', opacity: this.options.opacity});
  },

  hide: function() {
    this.tip().remove();
  },

  tip: function() {
    if (!this.$tip) {
      this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
    }

    return this.$tip;
  },

  updateOptions: function(options) {
    if (typeof options == 'object') {
        this.options = $.extend(this.defaults, options);
    } else {
        this.options = this.defaults;
    }
  }
};