Array.prototype.next = function() {
	if (!((this.index + 1) in this)) return false;
    return this[++this.index];
};
Array.prototype.prev = function() {
	if (!((this.index - 1) in this)) return false;
    return this[--this.index];
};
Array.prototype.current = function() {
	if (!((this.index) in this)) return false;
    return this[this.index];
};
Array.prototype.index = -1;