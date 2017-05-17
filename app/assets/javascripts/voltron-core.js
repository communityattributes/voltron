window.Voltron = (function(cmd){
  var command = cmd.split('/', 2);
  var module = command[0];
  var method = command[1] || 'initialize';

  if(Voltron.hasModule(module)){
    var mod = Voltron.getModule(module);
    if($.isFunction(mod[method])){
      return mod[method].apply(mod, Array.prototype.slice.call(arguments, 1));
    }else{
      Voltron.debug('error', 'Module %o does not define the method %o', module, method);
    }
  }else{
    Voltron.debug('error', 'Module with name %o does not exist.', module);
  }
  return false;
});

$.extend(Voltron, {
  _config: {},
  _observer: {},
  _modules: {},
  _classes: {},
  _logLevels: ['debug', 'info', 'warn', 'error', 'fatal', 'unknown'],
  _logMapping: {
    log: 0,
    info: 1,
    warn: 2,
    error: 3
  },

  _inherited: {
    _name: null,

    name: function(){
      return this._name;
    }
  },

  initialize: function(conf){
    if(!conf) conf = {};
    $.extend(this._config, conf);

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
    // IE/Edge only expose console when dev tools is open. Check for it's existence before attempting to call log/warn/error/info
    if(this.isDebugging() && console){
      var logLevelDefined = arguments.length > 2 && typeof arguments[1] == 'number';
      var method = arguments[0];
      var level = (logLevelDefined ? arguments[1] : this._logMapping[method]);
      var args = Array.prototype.slice.call(arguments, (logLevelDefined ? 2 : 1));
      if(level >= this.getLogLevel()){
        console[method].apply(console, args);
      }
    }
    return this;
  },

  getLogLevel: function(){
    var level = this.getConfig('log_level', 0);
    if(typeof level == 'number'){
      return (level >= 0 && level <= 5 ? level : 5); // If in range, return the number, otherwise: 'unknown'
    }
    var index = this._logLevels.indexOf(level);
    return (index >= 0 && index <= 5 ? index : 5); // Return the index of the defined level, otherwise: 'unknown'
  },

  getBaseUrl: function(){
    if(!location.origin) location.origin = location.protocol + '//' + location.host;
    return location.origin;
  },

  getPath: function(url){
    if(!url) url = window.location.href;
    return url.replace(this.getBaseUrl(), '');
  },

  // Get a config value, optionally define a default value in the event the config param is not defined
  getConfig: function(key, def){
    var out = this._config;
    if(!key) return out;
    var paths = key.replace(/(^\/+)|(\/+$)/g, '').split('/');

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

  // Set a config value. Supports xpath syntax to change nested key values
  // i.e. setConfig('a/b/c', true); will change the value of "c" to true
  setConfig: function(key, value){
    var out = this._config;
    var paths = key.replace(/(^\/+)|(\/+$)/g, '').split('/');
    var change = paths.pop();

    $.each(paths, function(index, path){
      if(out[path] != undefined){
        out = out[path];
      }else{
        out = out[path] = {};
      }
    });

    out[change] = value;
    return this;
  },

  // Similar to setConfig, except this will instead treat the config `key` value as an array, and add the value to it
  addConfig: function(key, value){
    if(!this._config[key]) this._config[key] = [];
    this._config[key].push(value);
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
    return $.map([controllers].flatten().compact(), function(c){ return c.toLowerCase(); }).includes(this.getConfig('controller'));
  },

  // Dispatch an event, optionally providing some additional params to pass to the event listener callback
  dispatch: function(event, params, modules){
    if(!$.isPlainObject(params)) params = {};
    if(!modules) modules = Object.keys(this._modules);
    var method = Voltron('Dispatch/getDispatchMethod', event, '');
    params = $.extend(true, { element: null, event: $.Event(event), data: {} }, params);

    $.each(modules.flatten(), $.proxy(function(index, module){
      var mod = this.getModule(module);
      if(mod){
        if($.isFunction(mod[method])){
          Voltron.debug('info', 'Dispatching %o to %o module with observer object: %o', method, mod.name(), params);
          mod[method].call(mod, params);
        }else{
          Voltron.debug('log', 'Attempted to dispatch %o in %o module with observer object: %o', method, mod.name(), params);
        }
      }
    }, this));
    return this;
  },

  // Check if a module with the given name has been added
  hasModule: function(id){
    return $.isFunction(this._modules[id.toLowerCase()]);
  },

  // Add a module, specifying the name (id), the module itself (should be an object or a function that returns such)
  // Optionally provide `true`, or an array of controller names as the last argument to auto instantiate when added either
  // all the time (if true), or on the specified controllers
  addModule: function(){
    var id = arguments[0];
    var depends = $.isFunction(arguments[1]) ? [] : arguments[1];
    var module = $.isFunction(arguments[1]) ? arguments[1] : arguments[2];
    var run = $.isFunction(arguments[1]) ? arguments[2] : arguments[3];

    if(!this.hasModule(id)){
      id = $.camelCase(id).replace(/\b[a-z]/g, function(letter){
        return letter.toUpperCase();
      });
      this[id] = module;
      this._modules[id.toLowerCase()] = module;
    }

    // Wait until DOM loaded, then create instances of any modules that should be created
    this.ready(function(id, depends, run){
      if(run === true || ((this.isController(run) || this.isController(id)) && run !== false)){
        if(depends == '*'){
          $.each(Voltron._modules, function(name, module){
            if(name.toLowerCase() != id.toLowerCase()){
              Voltron.getModule(name);
            }
          });
        }else{
          for(var i=0; i<depends.length; i++){
            this.getModule(depends[i]);
          }
        }
        this.getModule(id);
      }
    }, [id, depends, run]);
    return this;
  },

  // Get a module with the given name from the list of modules
  getModule: function(name, args){
    var id = name.toLowerCase();

    name = $.camelCase(name).replace(/\b[a-z]/g, function(letter){
      return letter.toUpperCase();
    });

    if(!args) args = [];
    if(this.hasModule(id)){
      if(!this._classes[id]){
        this._classes[id] = new this._modules[id]($);
        // Add some inherited methods... shortcuts, if you will
        this._classes[id] = $.extend(this._classes[id], this._inherited);
        // Add the name to the module
        this._classes[id]._name = name;
        // Tell the user we've created the module
        this.debug('info', 'Instantiated %o', name);
        // If there is an initialize function, call it, dispatching before/after events
        if($.isFunction(this._classes[id].initialize)){
          Voltron.dispatch('before:module:initialize:' + id, { module: this._classes[id] });
          this._classes[id].initialize.apply(this._classes[id], args);
          Voltron.dispatch('after:module:initialize:' + id, { module: this._classes[id] });
        }
      }
      return this._classes[id];
    }else{
      this.debug('warn', 'Module with name %o does not exist.', name);
    }
    return false;
  }
});

if(typeof V != 'undefined'){
  if(console) console.warn('The window variable %o is already defined, so shortcut to %o will not be defined.', 'V', 'Voltron');
}else{
  window.V = window.Voltron;
}
