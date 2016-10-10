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
			var page = $('body').data('page');
			this.ready(Voltron.getModule, page);
		},

		// When ready, fire the callback function, passing in any additional args
		ready: function(callback, args){
			$(document).ready(function(){
				callback.apply(Voltron, [args].flatten());
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
			if(config[key] != undefined){
				return config[key];
			}
			return def;
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
			this.debug('info', 'Dispatching', name);
			$.each(observer[name], function(index, callback){
				callback.call(Voltron, params);
			});
			return this;
		},

		// Check if a module with the given name has been added
		hasModule: function(id){
			return modules[id.toLowerCase()] != undefined;
		},

		// Add a module, specifying the name (id), the module itself (should be an object or a function that returns such)
		// Optionally provide `true`, or an array of controller names as the last argument to auto instantiate when added either
		// all the time (if true), or on the specified controllers
		addModule: function(id, module, run){
			if(!this.hasModule(id)){
				modules[id.toLowerCase()] = module;
			}

			// Wait until DOM loaded, then create instances of any modules that should be created
			this.ready(function(id, run){
				if(run === true || this.isController(run)){
					this.getModule(id);
				}
			}, [id, run]);
			return this;
		},

		// Get a module with the given name from the list of modules
		getModule: function(id, args){
			console.error(id, args);
			id = id.toLowerCase();
			if(!args) args = [];
			if(this.hasModule(id)){
				if(!classes[id]){
					classes[id] = new modules[id]($);
					this.debug('warn', 'Instantiated module %o', id);
					if(classes[id].initialize){
						Voltron.dispatch('before:module:initialize:' + id, { module: classes[id] });
						classes[id].initialize.apply(classes[id], args);
						Voltron.dispatch('after:module:initialize:' + id, { module: classes[id] });
					}
				}
				return classes[id];
			}else{
				this.debug('warn', 'Module with name %o does not exist.', id);
			}
			return false;
		}
	};
})(jQuery);
