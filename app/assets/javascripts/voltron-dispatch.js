//= require voltron

Voltron.addModule('Dispatch', function(){
	return {
		initialize: function(){
			this.addDispatchEvents();
			this.addFormEvents();
		},

		addDispatchEvents: function(){
			$('[data-dispatch]').on('click', this.trigger);
			$('input[data-dispatch], textarea[data-dispatch], select[data-dispatch]').on('change input', this.trigger);
			$('form[data-dispatch]').on('submit', this.trigger);
		},

		addFormEvents: function(){
			$('form').on('ajax:success', function(event, data, status, xhr){
				Voltron.getModule('Dispatch').trigger.call(this, event, { data: data, status: status, xhr: xhr });
			})
			.on('ajax:error', function(event, xhr, status, error){
				Voltron.getModule('Dispatch').trigger.call(this, event, { xhr: xhr, status: status, error: error });
			});
		},

		trigger: function(event, args){
			event.stopImmediatePropagation();

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
