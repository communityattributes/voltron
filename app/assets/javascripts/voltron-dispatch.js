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
        var args = Voltron('Dispatch/getArgumentHash', event.type, Array.prototype.slice.call(arguments, 1));
        var params = $.extend(args, { element: this, event: event, data: $(this).data() });

        var dispatches = params.data.dispatch.split(/\s+/);
        var events = {};

        for(var i=0; i<dispatches.length; i++){
          events = $.extend(events, Voltron('Dispatch/getDispatchOptions', dispatches[i], params, this));
        }

        if(events[event.type]){
          var alias = events[event.type]['alias'];
          var moduleName = events[event.type]['module'];

          if(Voltron.hasModule(moduleName)){
            var module = Voltron.getModule(moduleName);
            var aliasMethod = Voltron('Dispatch/getDispatchMethod', event.type, alias);
            var tagMethod = Voltron('Dispatch/getDispatchMethod', event.type, this.tagName);
            var methods = [aliasMethod, tagMethod].uniq();

            if(!methods.any(function(method){ return $.isFunction(module[method]); })){
              if(methods.length == 1){
                Voltron.debug('warn', 'Callback function %o was not found in the %o module. Try defining either/both, or remove %o from your element\'s data-dispatch attribute if the event does not need to be observed', methods[0], module.name(), event.type);
              }else if(methods.length == 2){
                Voltron.debug('warn', 'Callback functions %o and %o were not found in the %o module. Try defining either/both, or remove %o from your element\'s data-dispatch attribute if the event does not need to be observed', aliasMethod, tagMethod, module.name(), event.type);
              }
              return;
            }

            $.each(methods, function(index, method){
              if($.isFunction(module[method])){
                Voltron.debug('info', 'Dispatching callback function %o in the %o module with observer object: %o', method, module.name(), params);
                module[method](params);
              }else{
                Voltron.debug('log', 'Attempted to dispatch %o in %o module with observer object: %o', method, module.name(), params);
              }
            });
          }
        }
      }
    },

    getDispatchOptions: function(dispatch, params, element){
      var defaultModule = params.data.module || Voltron.getConfig('controller');
      var defaultAlias = element.id || element.tagName;
      var options = [];

      if((matches = dispatch.match(/^([a-z_\-]+):([a-z\_\-:]+)\/([a-z\_\-]+)/i)) !== null){
        // Match format: "module:action/alias"
        options[matches[2]] = { alias: matches[3], module: matches[1] };
      }else if((matches = dispatch.match(/^([a-z\_\-:]+)\/([a-z\_\-]+)/i)) !== null){
        // Match format: "action/alias", using default module
        options[matches[1]] = { alias: matches[2], module: defaultModule };
      }else if((matches = dispatch.match(/^([a-z_\-]+):([a-z\_\-:]+)/i)) !== null){
        // Math format: "module:action", using default alias
        options[matches[2]] = { alias: defaultAlias, module: matches[1] };
      }
      return options;
    },

    getDispatchMethod: function(event, alias){
      var method = ['on', event, alias].compact().join('_').replace(/[^a-z0-9\_\-:]+/ig, '').toLowerCase();
      return method.replace(/_([a-z0-9])|\-([a-z0-9])|:([a-z0-9])/ig, function(match){
        return match[1].toUpperCase();
      });
    },

    new: function(context){
      return new Dispatcher(context);
    }
  };
}, true);
