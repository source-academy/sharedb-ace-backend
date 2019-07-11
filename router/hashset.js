/**
 * Implements hashset functionality.
 */
function HashSet() {
  this.table = [];

  /**
   * Generates a hashcode.
   * @param {int} key the key to be hashed
   * @return {int} the hashcode
   */
  function loseloseHashCode(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
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
      const position = loseloseHashCode(key);
      if (this.table[position] === undefined) {
        this.table[position] = [];
      }
      const size = this.table[position].length;
      this.table[position][size + 1] = key;
    };
    HashSet.prototype.get = function(key) {
      const position = loseloseHashCode(key);
      if (this.table[position] !== undefined) {
        const index = this.table[position].indexOf(key);
        if (index !== -1) {
          return this.table[position][index];
        }
      }
      return undefined;
    };
    HashSet.prototype.contains = function(key) {
      return this.get(key) !== undefined;
    };
    HashSet.prototype.remove = function(key) {
      const position = loseloseHashCode(key);
      if (this.table[position] !== undefined) {
        const index = this.table[position].indexOf(key);
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
