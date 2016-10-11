//= require voltron

Voltron.addModule('Dispatch', function(){
	return {
		initialize: function(){
			this.addDispatchEvents();
			this.addFormEvents();
		},

		addDispatchEvents: function(){
			$('[data-dispatch]').each(function(){
				var element = $(this);
				if(element.data('dispatch') === true){
					element.on('click mouseenter mouseleave', Voltron.getModule('Dispatch').trigger);
				}else{
					var events = element.data('dispatch').split(/\s+/);
					var listeners = [];
					$.each(events, function(index, event){
						listeners.push(event.split(':', 2).shift());
					});
					element.on(listeners.join(' '), Voltron.getModule('Dispatch').trigger);
				}
			});
			$('input[data-dispatch], textarea[data-dispatch], select[data-dispatch]').on('change input', this.trigger);
			$('form[data-dispatch]').on('submit', this.trigger);
		},

		addFormEvents: function(){
			$('body')
				.on('ajax:success', function(event, data, status, xhr){
					Voltron.getModule('Dispatch').trigger.call(event.target, event, { data: data, status: status, xhr: xhr });
				})
				.on('ajax:error', function(event, xhr, status, error){
					Voltron.getModule('Dispatch').trigger.call(event.target, event, { xhr: xhr, status: status, error: error });
				});
		},

		trigger: function(event, args){
			if(!args) args = {}; 
			var params = $.extend(args, { element: this, event: event });

			if($(this).data('dispatch') === true){
				Voltron.dispatch([event.type, this.tagName, this.id].compact().join(':').toLowerCase(), params);
			}else if($(this).data('dispatch')){
				Voltron.dispatch($(this).data('dispatch'), params);
			}

			// Dispatch a general event without the id in the name, but only if an id was provided,
			// If an id was not provided then the above event will send the same thing
			if(this.id || $(this).data('dispatch') !== true) Voltron.dispatch([event.type, this.tagName].join(':').toLowerCase(), params);
		}
	};
}, true);
