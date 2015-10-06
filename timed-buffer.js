var EventEmitter 	= require("events").EventEmitter;

function TimedBuffer ( timeMS, options ){
  if(!timeMS || typeof(timeMS) !== 'number')
    throw 'TimedBuffer > ERROR: TimedBuffer requires > (int) timeMS';

  EventEmitter.call(this);

  if(typeof(options) !== 'object') options = {};

  var self      = this;

  this.ms       = options.timePadding+timeMS || timeMS;

  this.buffer   = [];
  this.length   = options.defaultLength || 2;

  this.sampleRate               = 0;
  this._sampleRateBuffer        = [];
  this._sampleRateBufferLength  = options.sampleRateRetention || 50;
  this._lastTime                = new Date().getTime();

  return this;
}

TimedBuffer.prototype = Object.create(EventEmitter.prototype);

TimedBuffer.prototype._time = function () {
  var time = new Date().getTime();

  //Step Time
  this._addToTimeBuffer(time - this._lastTime);
  this._lastTime  = time;

  //Step Sample Rate
  var sampleRate  = this._calcSampleRate();
  this._setSampleRate(sampleRate);

  //Step Length
  var length      = this._calcLength();
  this._setLength(length);
};

TimedBuffer.prototype._addToTimeBuffer = function ( ms ) {
  if(this._sampleRateBuffer.length >= this._sampleRateBufferLength)
    this._sampleRateBuffer.pop();

  this._sampleRateBuffer.unshift(ms);
};

TimedBuffer.prototype._calcSampleRate = function () {
  return this._sampleRateBuffer
    .reduce(function ( prev, cur, index, array ){
      if(index === array.length-1)
        return (prev+cur)/array.length;
      else
        return (prev+cur);
    });
};

TimedBuffer.prototype._setSampleRate = function ( sampleRateMS ) {
  this.sampleRate = Math.floor(sampleRateMS)-1;
};

TimedBuffer.prototype._calcLength = function () {
  if (!this.sampleRate) return options.defaultLength || 2;

  return Math.ceil(this.ms/this.sampleRate);
};

TimedBuffer.prototype._setLength = function ( length ) {
  this.length = length;
};

TimedBuffer.prototype.getLast = function (){
  return this.buffer[0];
};

TimedBuffer.prototype.getByTime = function ( timeMS, skipMS ) {
  if(!timeMS || typeof(timeMS) !== 'number')
    throw 'TimedBuffer > ERROR: TimedBuffer.getSample requires > int (timeMS) || int (fromMS), int (toMS)';

  var requiredFromBuffer,
      skip;

  if(skipMS) {
    requiredFromBuffer  = Math.ceil(timeMS/this.sampleRate);
    skip                = Math.ceil(skipMS/this.sampleRate);

    return this.buffer.slice(skip, (skip+requiredFromBuffer));
  } else {
    requiredFromBuffer = Math.ceil(timeMS/this.sampleRate);
    return this.buffer.slice(0, requiredFromBuffer);
  }
};

TimedBuffer.prototype.push 	= function ( item ){
  //Step Time
  this._time();

  //Adjust array size to calculated length
  if(this.buffer.length >= this.length)
    this.buffer = this.buffer.slice(0, this.length-1);

  //Add item to beginning of array
  this.buffer.unshift(item);

  //Send Push Event
  this.emit('add', item);
  this.emit('change', this.buffer);
};

module.exports = TimedBuffer;
