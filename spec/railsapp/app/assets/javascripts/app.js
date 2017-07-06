Voltron.addModule('App', function(){
  return {
    initialize: function(){
      Voltron('Dispatch/addEventWatcher', 'click');
      Voltron('Dispatch/addEventWatcher', 'mouseover');
      Voltron('Dispatch/addEventWatcher', 'conceal');
      Voltron('Dispatch/addEventWatcher', 'reveal');
      Voltron('Dispatch/addEventWatcher', 'append');
      Voltron('Dispatch/addEventWatcher', 'remove');

      Voltron('Dispatch/addGlobalEvent', 'app:click/the_document_body', 'body');

      var colors = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue', 'dimgray', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow'];

      //setInterval(function(){
      //  $('.section-0, .section-1').fadeToggle(500);
      //}, 10000);

      // Create 1400 divs to test performance of show/hide event
      /*
      for(var k=0; k<10; k++){
        for(var i=0; i<colors.length; i++){
          $('body').append($('<div />', { class: 'new-div', 'data-dispatch': 'append remove reveal conceal', 'data-module': 'app' }).css('background-color', colors[i]));
        }
      }

      setTimeout(function(){
        $('.new-div').slideUp(2000);
      }, 3000);
      */
    },

    onAppendDiv: function(o){
    },

    onConcealDiv: function(o){
    },

    onClickCustomButton: function(o){
    },

    onHideBox: function(o){
    },

    onRevealDiv: function(o){
    },

    onConcealDiv: function(o){
    },

    onClickBody: function(o){
    }
  };
}, true);
