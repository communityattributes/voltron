Voltron.addModule('Flash', function(){
  var defaults = {
    class: '',
    bind: 'body',
    containerClass: 'flashes',
    addMethod: 'prepend',
    revealMethod: 'slideDown',
    revealTime: 200,
    concealMethod: 'slideUp',
    concealTime: 200,
    closeHtml: 'X'
  };

  return {
    initialize: function(){
      this.on('click:close-alert', 'click:close-notice', 'click:close-warning', this.clear);
    },

    setDefaultOption: function(key, value){
      defaults[key] = value;
      return this;
    },

    new: function(flashes, options){
      options = $.extend(defaults, options);

      if(!$(options.bind).find('.' + options.containerClass).length){
        $(options.bind)[options.addMethod]($('<div />', { class: options.containerClass }).hide());
      }

      $('.' + options.containerClass).addClass(options.class);

      $.each(flashes, function(type, messages){
        var flash = $('<div />', { class: ['flash', type].join(' ') });
        flash.append('<p>' + $.makeArray(messages).join('</p><p>') + '</p>');

        var button = ($.isFunction(options.closeHtml) ? options.closeHtml(type) : options.closeHtml);

        flash.append($('<button />', { class: 'close', type: 'button', id: 'close-' + type, 'data-dispatch': 'click' })).html(button);

        $('.' + options.containerClass).append(flash);
      });

      $('.' + options.containerClass)[options.revealMethod](options.revealTime);
      return this;
    },

    clear: function(o, options){
      if(o && o.element){
        o.options = $.extend(defaults, options);
        $(o.element).closest('.flash')[o.options.concealMethod](o.options.concealTime, function(){
          $(this).remove();
        });
      }else{
        options = $.extend(defaults, options);
        $('.flashes')[options.concealMethod](options.concealTime, function(){
          $(this).remove();
        });
      }
    }
  };
}, true);
