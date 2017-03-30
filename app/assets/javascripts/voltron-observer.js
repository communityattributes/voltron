//= require voltron

/**
 * Voltron::Observer
 *
 * Adds ability to monitor DOM events that can be observed by means of the +Voltron.on()+ method
 *
 * List of events that can now be observed:
 *
 *   +added+ When an element is added to the DOM
 *   +removed+ When an element is removed from the DOM
 *   +hide+ When an element on the DOM is hidden (defined as the result of jQuery's `:hidden` selector)
 *   +show+ When an element on the DOM is displayed (defined as the result of jQuery's `:visible` selector)
 *
 * Example usage, from within any method defined in a Voltron module:
 *
 *   Voltron.on('added:div', function(o){
 *     // Do things with the added element, context is +Voltron+
 *   });
 *   
 *   OR
 *
 *   this.on('added:div', function(o){
 *     // Do things with the added element, context is the module in which this observer was defined
 *   });
 *
 */
Voltron.addModule('Observer', '*', function(){
  'use strict';

  var _observer = null;

  var _defaults = {
    subtree: true,
    childList: true,
    characterData: false,
    attributes: true,
    attributeFilter: ['style', 'class']
  };

  return {
    initialize: function(options){
      options = $.extend(_defaults, options);
      this.getObserver().observe(document.body, options);

      // Trigger add and show events on start up for appropriate elements
      $('[data-dispatch*="added"]').trigger('added');
      $('[data-dispatch*="show"]:visible').trigger('show');
    },

    stop: function(){
      this.getObserver().disconnect();
    },

    process: function(mutations){
      // Get a unique array of DOM elements that each has the associated mutation as a part of it's dataset
      var elements = this.getMutationElements(mutations);

      // Iterate through each element, dispatching the appropriate event for each elements mutation
      for(var i=0; i<elements.length; i++){
        var mutation = $(elements[i]).data('_mutation');

        if(mutation.type == 'childList'){
          $(mutation.addedNodes).trigger('added');

          // Need to iterate through removed nodes and manually dispatch
          // since at this point the element no longer exists in the DOM,
          // jQuery cannot observe any event that's `.trigger()`ed on it.
          for(var j=0; j<mutation.removedNodes.length; j++){
            Voltron.getModule('Dispatch').trigger.call(mutation.removedNodes[j], new $.Event(null, { type: 'removed', target: mutation.removedNodes[j] }));
          }
        }else if(mutation.type == 'attributes'){
          var target = $(mutation.target);
          // If currently animating, break out. We only want to dispatch when the state is truly reached
          if(target.is(':animated')) break;

          if(target.is(':hidden')){
            target.trigger('hide');
          }else if(target.is(':visible')){
            target.trigger('show');
          }
        }
      }
    },

    getObserver: function(){
      if(_observer === null){
        _observer = new MutationObserver($.proxy(function(mutations){
          // Process all of the elements with mutations
          this.process(mutations);
        }, this));
      }
      return _observer;
    },

    getMutationElements: function(mutations){
      return $.uniqueSort($.map(mutations, function(mut){
        return $(mut.target).data('_mutation', mut).get(0);
      }));
    }
  };
}, true);