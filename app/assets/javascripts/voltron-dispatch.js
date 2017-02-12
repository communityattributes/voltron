//= require voltron-ext
//= require voltron-core

Voltron.addModule('Dispatch', function(){
  var _events = {};
  var _chains = {};
  var _callbacks = {};

  var Dispatcher = function(context){
    var callbacks = {};

    return {
      add: function(event, callback){
        if(!$.isArray(callbacks[event.toLowerCase()])){
          callbacks[event.toLowerCase()] = [];
        }
        callbacks[event.toLowerCase()].push(callback);
        return context || this;
      },

      dispatch: function(event){
        if($.isArray(callbacks[event.toLowerCase()])){
          for(var i=0; i<callbacks[event.toLowerCase()].length; i++){
            callbacks[event.toLowerCase()][i].apply(context || this, Array.prototype.slice.call(arguments, 1));
          }
        }
        return context || this;
      }
    };
  };

  return {
    addEventWatcher: function(event){
      var args = Array.prototype.slice.call(arguments, 1).flatten().compact();
      _events[event] = args;
      $.each(args, function(index, evt){
        if(['element', 'event', 'data'].includes(evt.toLowerCase())){
          Voltron.debug('error', 'Provided event watcher argument %o is a reserved observer param and will be overridden when the event is dispatched. Consider changing the name of the argument in your call to addEventWatcher for %o', evt, event);
        }
      });
      Voltron.debug('info', 'Added event watcher for %o', event);
      return this.listen();
    },

    addEventChain: function(when, then){
      when = when.toLowerCase();
      then = $.map([then].flatten(), function(item){
        return item.toLowerCase();
      });
      if(!_chains[when]) _chains[when] = [];
      $.each(then, function(index, t){
        if(!_chains[when].includes(t)){
          Voltron.debug('info', 'Added event chain. When an event name matching %o* is fired, %o will also be triggered.', when, t);
          _chains[when].push(t);
        }
      });
      return this;
    },

    addCallbackChain: function(when, callback){
      when = when.toLowerCase();
      if(!_callbacks[when]) _callbacks[when] = [];
      if(typeof callback == 'string' || typeof callback == 'function'){
        _callbacks[when].push([callback, Array.prototype.slice.call(arguments, 2)]);
        if(typeof callback == 'string'){
          Voltron.debug('info', 'Added callback chain. When an event name matching %o* is fired, %o will also be triggered.', when, callback);
        }else if(typeof callback == 'function'){
          Voltron.debug('info', 'Added callback chain. When an event name matching %o* is fired, the provided callback function will also be triggered.', when);
        }
      }else{
        Voltron.debug('warn', 'Callback chain for %o* will not be added, the defined callback argument is not a string referencing a module method nor function.', when);
      }
    },

    listen: function(){
      $('body').off(this.getEvents()).on(this.getEvents(), '[data-dispatch]', this.trigger);
      return this;
    },

    getEvents: function(){
      return $.map(_events, function(val,key){
        return key + '.voltron';
      }).join(' ');
    },

    getHash: function(keys, vals){
      return keys.length === vals.length ? keys.reduce(function(obj, key, index){
        obj[key] = vals[index];
        return obj;
      }, {}) : {};
    },

    getArgumentHash: function(event, args){
      if(_events[event]){
        return this.getHash(_events[event], args);
      }
      return {};
    },

    chain: function(event, params, chainable){
      // chainable helps prevent recursion, since the event 'click' could trigger something
      // beginning with the same word, i.e. - 'clickable', it would loop endlessly.
      if(chainable){
        $.each(_chains, function(chain, then){
          if(event.startsWith(chain)){
            $.each(then, function(index, t){
              Voltron.dispatch(t, params, false);
            });
          }
        });
      }

      $.each(_callbacks, function(callback, callbacks){
        if(event.startsWith(callback)){
          $.each(callbacks, function(index, cb){
            if(typeof cb[0] == 'string'){
              cb[1].unshift(cb[0]);
              Voltron.apply(Voltron, cb[1]);
            }else if(typeof cb[0] == 'function'){
              cb[0].apply(Voltron, cb[1]);
            }
          });
        }
      });
    },

    trigger: function(event){
      if($(this).data('dispatch')){
        if(!args) args = {};
        var args = Array.prototype.slice.call(arguments, 1);
        args = Voltron('Dispatch/getArgumentHash', event.type, args);
        var params = $.extend(args, { element: this, event: event, data: $(this).data() });

        var events = params.data.dispatch.split(/\s+/);

        if(events.includes(event.type)){
          if(params.data.event){
            Voltron.dispatch([event.type, params.data.event].join(':').toLowerCase(), params);
          }else if(this.id){
            Voltron.dispatch([event.type, this.id].join(':').toLowerCase(), params);
          }else{
            Voltron.dispatch([event.type, this.tagName].join(':').toLowerCase(), params);
          }
        }
      }
    },

    new: function(context){
      return new Dispatcher(context);
    }
  };
}, true);
