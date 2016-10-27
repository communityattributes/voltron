// Object
Object.prototype.blank = function(){
  if(this === null) return true;

  for(var prop in this){
    if(this.hasOwnProperty(prop)){
      return false;
    }
  }

  return true;
};

// String

String.prototype.trim = function(){
  return $.trim(this);
};

String.prototype.blank = function(){
  return this.trim() == '';
};

// Array

Array.prototype.compact = function(){
  // Because JS is often dumb, prepend an item that we'll remove later
  // http://stackoverflow.com/questions/33136894/array-splice-does-not-remove-element-at-zero-index-when-the-indexed-variable-i
  this.unshift(null);
  for(var i=1; i<this.length; i++){
    if(this[i] == undefined || this[i].blank()){
      this.splice(i, 1);
    }
  }
  // Ignore the item we prepended, return the rest of the array
  return this.slice(1);
};

Array.prototype.includes = function(what){
  if(typeof what == 'object'){
    var re = new RegExp(what);
    for(var i=0; i<this.length; i++){
      if(re.test(this[i].toString())){
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