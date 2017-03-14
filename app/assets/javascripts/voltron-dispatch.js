//= require voltron-ext
//= require voltron-core

Voltron.addModule('Dispatch', function(){
  var _events = {};

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

    trigger: function(event){
      if($(this).data('dispatch')){
        if(!args) args = {};
        var args = Array.prototype.slice.call(arguments, 1);
        args = Voltron('Dispatch/getArgumentHash', event.type, args);
        var params = $.extend(args, { element: this, event: event, data: $(this).data() });

        var events = params.data.dispatch.split(/\s+/);
        var target = Voltron('Dispatch/getDispatchTarget', params, this);

        if(events.includes(event.type)){

          var moduleName = $(this).data('module') || Voltron.getConfig('controller');

          if(Voltron.hasModule(moduleName)){
            var module = Voltron.getModule($(this).data('module') || Voltron.getConfig('controller'));
            var method = Voltron('Dispatch/getDispatchMethod', event.type, target);

            if($.isFunction(module[method])){
              Voltron.debug('info', 'Dispatching callback function %o', module.name() + '/' + method);
              module[method](params);
              return; // Exit out, so we don't dispatch a separate event
            }else{
              Voltron.debug('warn', 'Module %o was defined but callback function %o does not exist. Continuing with standard dispatcher.', module.name(), method);
            }
          }

          Voltron.dispatch([event.type, target].join(':').toLowerCase(), params);
        }
      }
    },

    getDispatchTarget: function(params, element){
      if(params.data.event){
        return params.data.event.toLowerCase();
      }else if(element.id){
        return element.id.toLowerCase();
      }
      return element.tagName.toLowerCase();
    },

    getDispatchMethod: function(event, target){
      var method = ['on', event, target].join('_');
      return method.replace(/_([a-z0-9])|\-([a-z0-9])/ig, function(match){
        return match[1].toUpperCase();
      });
    },

    new: function(context){
      return new Dispatcher(context);
    }
  };
}, true);
