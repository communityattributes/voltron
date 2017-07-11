//= require voltron

/**
 * Voltron::Observer
 *
 * Adds ability to monitor DOM events that can be observed by means of the +Voltron.on()+ method
 *
 * List of events that can now be observed:
 *
 *   +append+ When an element is append to the DOM
 *   +remove+ When an element is removed from the DOM
 *   +conceal+ When an element on the DOM is hidden (defined as the result of jQuery's `:hidden` selector)
 *   +reveal+ When an element on the DOM is displayed (defined as the result of jQuery's `:visible` selector)
 *
 * Example usage, from within any method defined in a Voltron module:
 *
 *   Voltron.on('append:div', function(o){
 *     // Do things with the appended element, context is +Voltron+
 *   });
 *   
 *   OR
 *
 *   this.on('append:div', function(o){
 *     // Do things with the appended element, context is the module in which this observer was defined
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

      // Trigger append and reveal events on start up for appropriate elements
      $(this.getElements('append')).trigger('append');
      $(this.getElements('reveal')).filter(function(){
        return Voltron('Observer/isVisible', this);
      }).trigger('reveal');
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

        if(!mutation || !mutation.type) continue;

        if(mutation.type == 'childList'){
          // Flag nodes that have been added, and don't dispatch on any that have
          // This solves the issue of recursion if an element that dispatches `added` is moved in the DOM
          // Also dispatch only on elements that are configured to have `added` dispatched,
          // including the element itself if applicable
          $(mutation.addedNodes).filter(function(){
            return !$(this).data('_mutation_appended');
          }).data('_mutation_appended', true)
            .find(this.getElements('append', 'reveal'))
            .addBack(this.getElements('append', 'reveal'))
            .trigger('append').filter(function(){
              return Voltron('Observer/isVisible', this);
            }).trigger('reveal');

          // Flag nodes that have been removed to avoid unnecessary dispatching
          // Dispatch the removed event on any child elements configured to do so,
          // including the element itself if applicable
          // Event must be dispatched manually since at this point the element no
          // longer exists in the DOM, and can't be trigger()'ed
          $(mutation.removedNodes).filter(function(){
            return !$(this).data('_mutation_removed');
          }).data('_mutation_removed', true)
            .find(this.getElements('remove', 'conceal'))
            .addBack(this.getElements('remove', 'conceal'))
            .each(function(){
              Voltron.getModule('Dispatch').trigger.call(this, $.Event('remove', { target: this }));
              Voltron.getModule('Dispatch').trigger.call(this, $.Event('conceal', { target: this }));
            });
        }else if(mutation.type == 'attributes'){
          var target = $(mutation.target);
          // If currently animating, break out. We only want to dispatch when the state is truly reached
          if(target.is(':animated')) break;

          if(!this.isVisible(mutation.target)){
            target.find(this.getElements('conceal')).trigger('conceal');
          }else if(this.isVisible(mutation.target)){
            target.find(this.getElements('reveal')).filter(function(){
              return Voltron('Observer/isVisible', this);
            }).trigger('reveal');
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
      if($.isFunction($.uniqueSort)){
        // >= jQuery 3
        return $.uniqueSort($.map(mutations, function(mut){
          return $(mut.target).data('_mutation', mut).get(0);
        }));
      }else{
        // < jQuery 3
        return $.unique($.map(mutations, function(mut){
          return $(mut.target).data('_mutation', mut).get(0);
        }));
      }
    },

    getElements: function(){
      return $.map(Array.prototype.slice.call(arguments, 0), function(dispatch){
        return ['[data-dispatch*="' + dispatch + '"]', Voltron('Dispatch/getSelectors', dispatch)];
      }).flatten().join(', ');
    },

    isVisible: function(element){
      var i = 0,
          visible = $(element).is(':visible');

      while(element.tagName !== 'BODY'){
        if($(element).is(':hidden') || $(element).width() == 0 || $(element).height() == 0) return false;
        // Limit to only traversing up 200 DOM elements before we hit the body tag
        // If we go that far and still don't reach the body tag, something's up
        // or the html is beyond crappy.
        if(i++ >= 200) break;
        element = $(element).parent().get(0);
      }
      return true && visible;
    }
  };
}, true);