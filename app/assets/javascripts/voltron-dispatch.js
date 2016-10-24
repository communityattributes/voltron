//= require voltron

Voltron.addModule('Dispatch', function(){
  var events = {};

  return {
    addEventWatcher: function(event, args){
      args = [args].compact().flatten();
      events[event] = args;
      $.each(args, function(index, evt){
        if(['element', 'event', 'data'].includes(evt.toLowerCase())){
          Voltron.debug('error', "Provided event watcher argument '" + evt + "' is a reserved observer param and will be overridden when the event is dispatched. Consider changing the name of the argument in your call to addEventWatcher.");
        }
      });
      Voltron.debug('info', 'Added event watcher for %o', event);
      return this;
    },

    listen: function(){
      if(!$('body').data('_dispatch')){
        $('body').data('_dispatch', true);
        $('body').on(this.getEvents(), '[data-dispatch]', Voltron.getModule('Dispatch').trigger);
        Voltron.debug('info', 'Voltron dispatcher listening.');
      }
      return this;
    },

    getEvents: function(){
      return $.map(events, function(val,key){
        return key;
      }).join(' ');
    },

    getHash: function(keys, vals){
      return keys.length === vals.length ? keys.reduce(function(obj, key, index){
        obj[key] = vals[index];
        return obj;
      }, {}) : {};
    },

    getArgumentHash: function(event, args){
      if(events[event]){
        return this.getHash(events[event], args);
      }
      return {};
    },

    trigger: function(){
      if(!args) args = {};
      var event = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      args = Voltron.getModule('Dispatch').getArgumentHash(event.type, args);
      var params = $.extend(args, { element: this, event: event, data: $(this).data() });

      var events = $(this).data('dispatch').toString().split(/\s+/);

      if(events.includes(event.type)){
        if($(this).data('event')){
          Voltron.dispatch([event.type, this.tagName, $(this).data('event')].compact().join(':').toLowerCase(), params);
        }else{
          Voltron.dispatch([event.type, this.tagName, this.id].compact().join(':').toLowerCase(), params);
        }
      }
    }
  };
}, true);
