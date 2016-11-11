var Voltron = (function($){
  var config = {};
  var observer = {};
  var modules = {};
  var classes = {};

  return {
    initialize: function(conf){
      if(!conf) conf = {};
      $.extend(config, conf);

      // Try and create a module with the name of the current controller
      if(this.hasModule(this.getConfig('controller'))){
        this.ready(Voltron.getModule, this.getConfig('controller'));
      }
    },

    // When ready, fire the callback function, passing in any additional args
    ready: function(callback, args){
      $(document).ready(function(){
        if(!$.isArray(args)) args = [args];
        callback.apply(Voltron, args);
      });
      return this;
    },

    debug: function(){
      if(this.isDebugging()){
        var method = arguments[0];
        var args = Array.prototype.slice.call(arguments, 1);
        console[method].apply(this, args);
      }
      return this;
    },

    // Get a config value, optionally define a default value in the event the config param is not defined
    getConfig: function(key, def){
      if(!key) return config;
      var paths = key.replace(/(^\/+)|(\/+$)/g, '').split('/');
      var out = config;

      $.each(paths, function(index, path){
        if(out[path] != undefined){
          out = out[path];
        }else{
          out = def;
          return false;
        }
      });

      return out;
    },

    // Set a config value
    setConfig: function(key, value){
      config[key] = value;
      return this;
    },

    // Similar to setConfig, except this will instead treat the config `key` value as an array, and add the value to it
    addConfig: function(key, value){
      if(!config[key]) config[key] = [];
      config[key].push(value);
      return this;
    },

    getAuthToken: function(){
      return this.getConfig('auth_token', '');
    },

    // Are we in debug mode?
    isDebugging: function(){
      return this.getConfig('debug', false);
    },

    isController: function(controllers){
      return [controllers].flatten().compact().includes(this.getConfig('controller'));
    },

    // Adds one or more event listener callbacks that will be dispatched when the event occurs
    // Example: Voltron.on('event1', 'event2', 'event3', function(observer){});
    on: function(){
      var events = Array.prototype.slice.call(arguments, 0, -1);
      var callback = Array.prototype.slice.call(arguments, -1).pop();
      $.each(events, function(index, event){
        if(!observer[event]) observer[event] = [];
        observer[event].push(callback);
      });
      return this;
    },

    // Dispatch an event, optionally providing some additional params to pass to the event listener callback
    dispatch: function(name, params){
      if(!params) params = {};
      this.debug('info', 'Dispatching %o', name);
      $.each(observer[name], function(index, callback){
        callback.call(Voltron, params);
      });
      return this;
    },

    new: function(id){
      if(this.hasModule(id)){
        if($.isFunction(this.getModule(id).new)){
          return this.getModule(id).new.apply(this.getModule(id), Array.prototype.slice.call(arguments, 1));
        }else{
          this.debug('warn', 'Module %o has not defined a %o method.', id, 'new');
        }
      }else{
        this.debug('warn', 'Module with name %o does not exist.', id);
      }
      return false;
    },

    // Check if a module with the given name has been added
    hasModule: function(id){
      return modules[id.toLowerCase()] != undefined;
    },

    // Add a module, specifying the name (id), the module itself (should be an object or a function that returns such)
    // Optionally provide `true`, or an array of controller names as the last argument to auto instantiate when added either
    // all the time (if true), or on the specified controllers
    addModule: function(){
      var id = arguments[0];
      var depends = typeof arguments[1] == 'function' ? [] : arguments[1];
      var module = typeof arguments[1] == 'function' ? arguments[1] : arguments[2];
      var run = typeof arguments[1] == 'function' ? arguments[2] : arguments[3];

      if(!this.hasModule(id)){
        modules[id.toLowerCase()] = module;
      }

      // Wait until DOM loaded, then create instances of any modules that should be created
      this.ready(function(id, depends, run){
        if(run === true || (this.isController(run) && run !== false)){
          for(var i=0; i<depends.length; i++){
            this.getModule(depends[i]);
          }
          this.getModule(id);
        }
      }, [id, depends, run]);
      return this;
    },

    // Get a module with the given name from the list of modules
    getModule: function(name, args){
      var id = name.toLowerCase();
      if(!args) args = [];
      if(this.hasModule(id)){
        if(!classes[id]){
          classes[id] = new modules[id]($);
          this.debug('info', 'Instantiated %o', name);
          if(classes[id].initialize){
            Voltron.dispatch('before:module:initialize:' + id, { module: classes[id] });
            classes[id].initialize.apply(classes[id], args);
            Voltron.dispatch('after:module:initialize:' + id, { module: classes[id] });
          }
        }
        return classes[id];
      }else{
        this.debug('warn', 'Module with name %o does not exist.', name);
      }
      return false;
    }
  };
})(jQuery);
