// String

String.prototype.trim = function(){
  return $.trim(this);
};

String.prototype.blank = function(){
  return this.trim() == '';
};

// Array

Array.prototype.compact = function(){
  for(var i=0; i<this.length; i++){
    if(this[i] == undefined || this[i].toString().blank()){
      this.splice(i, 1);
    }
  }
  return this;
};

Array.prototype.includes = function(what){
  if(typeof what == 'object'){
    var re = new RegExp(what);
    for(var i=0; i<this.length; i++){
      if(re.test(this[i])){
        return true;
      }
    }
  }else{
    for(var i=0; i<this.length; i++){
      if(this[i] == what){
        return true;
      }
    }
  }
  return false;
};

Array.prototype.flatten = function(){
  var b = Array.prototype.concat.apply([], this);
  if(b.length != this.length){
    b = b.flatten();
  };

  return b;
};

Array.prototype.blank = function(){
  return this.compact().length == 0;
};

// Boolean

Boolean.prototype.blank = function(){
  return this === false;
};

// Number

Number.prototype.blank = function(){
  return this <= 0;
};