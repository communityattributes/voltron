Voltron.addModule('Site', function(){
  return {
    initialize: function(){
      Voltron('Dispatch/addEventWatcher', 'click');
      Voltron('Dispatch/listen');
    }
  };
}, true);