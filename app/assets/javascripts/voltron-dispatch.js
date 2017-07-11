//= require voltron-ext
//= require voltron-core

Voltron.addModule('Dispatch', function(){
  var _events = {}
      _globals = {};

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

    addGlobalEvent: function(event, selector){
      var options = this.getDispatchOptions(event, { data: {} }, {});
      event = Object.keys(options).first();
      var module = options[event].module;
      var alias = options[event].alias;
      if(!$.isArray(_globals[event])) _globals[event] = [];
      _globals[event].push({ selector: selector, alias: alias, module: module });
      return this.listen();
    },

    listen: function(){
      $(document).off(this.getEvents()).on(this.getEvents(), '[data-dispatch]', this.trigger);

      var globals = this.getGlobalEvents();
      for(var i=0; i<globals.length; i++){
        $(document).off(globals[i].event);
        for(var j=0; j<globals[i].data.length; j++){
          $(document).on(globals[i].event, [globals[i].data[j].selector].flatten().join(', '), this.getGlobalCallback(globals[i].data[j]))
        }
      }

      return this;
    },

    getEvents: function(){
      return $.map(_events, function(val,key){
        return key + '.voltron';
      }).join(' ');
    },

    getGlobalEvents: function(){
      return $.map(_globals, function(val,key){
        return { event: key + '.voltron.global', data: val };
      });
    },

    getGlobalCallback: function(data){
      return function(event){
        // In case the element in question has a data-dispatch attribute already, don't overwrite it
        // We'll restore the existing data after we trigger the event
        var oldDispatch = $(this).data('dispatch');
        $(this).data('dispatch', [[data.module, event.type].compact().join(':'), data.alias].compact().join('/') );
        Voltron.getModule('Dispatch').trigger.call(this, event);
        $(this).data('dispatch', oldDispatch);
      };
    },

    getSelectors: function(event){
      var pattern = new RegExp(event);
      return $.map(_globals, function(val,key){
        if(pattern.test(key)){
          var selectors = val.map(function(v){ return v.selector; });
          return selectors.flatten();
        }
      }).flatten().compact();
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
          }else{
            Voltron.debug('log', 'Tried to dispatch the %o event, but the module %o does not exist. Triggered on element: %o', event.type, moduleName, this);
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
        // Match format: "module:action", using default alias
        options[matches[2]] = { alias: defaultAlias, module: matches[1] };
      }else{
        // Match everthing else as if no alias or module was defined, use defaults for both
        options[dispatch.toLowerCase()] = { alias: defaultAlias, module: defaultModule };
      }
      return options;
    },

    getDispatchMethod: function(event, alias){
      return ['on', event, alias].compact().join('_')
        .replace(/[^a-z0-9\_\-:]+/ig, '')
        .replace(/([a-z0-9])([A-Z])/g, function(match){ return [match[0], match[1]].join('_') })
        .toLowerCase()
        .replace(/_([a-z0-9])|\-([a-z0-9])|:([a-z0-9])/ig, function(match){ return match[1].toUpperCase(); });
    }
  };
}, true);
