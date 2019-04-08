function HashSet() {
  this.table = []; 

  function loseloseHashCode(key) {
    var hash = 0;
    for (var i = 0; i < key.length; i++) {
      hash += key.charCodeAt(i);
    }
    return hash % 37;
  }

/*
  function ValuePair(key, value) {
    this.key = key;
    this.value = value;
    this.toString = function() {
      return '[' + this.key + ' - ' + this.value + ']';
    }
  }
*/
 
  if ((typeof this.put !== 'function') && (typeof this.put !== 'string')) {
    HashSet.prototype.put = function(key) {
      var position = loseloseHashCode(key);
      if (this.table[position] === undefined) {
        this.table[position] = [];
      }
      var size = this.table[position].length;
      this.table[position][size + 1] = key;
    };
    HashSet.prototype.get = function(key) {
      var position = loseloseHashCode(key);
      if (this.table[position] !== undefined) {
        var index = this.table[position].indexOf(key);
        if (index !== -1) {
          return this.table[position][index];
        }
      }
      return undefined;
    };
    HashSet.prototype.contains = function(key) {
      return this.get(key) !== undefined;
    }
    HashSet.prototype.remove = function(key) {
      var position = loseloseHashCode(key);
      if (this.table[position] !== undefined) {
        var index = this.table[position].indexOf(key);
        if (index !== -1 && this.table[position][index] !== undefined) {
          this.table[position][index] = undefined;
          return true;
        }
      }
      return false;
    };
  }
}

export default HashSet;
