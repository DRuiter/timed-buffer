timed-buffer
============

A buffer for NodeJS that keeps anything you push into it for a set amount of time.

#Note

Currently not published on npm, I'll publish it after some further testing.

#Usage

##Instantiation
TimedBuffer takes 2 parameters, a time in miliseconds and an optional options object.

```javascript
var TimedBuffer = require('./timed-buffer'),
	buffer      = new TimedBuffer(1000, {
		timePadding: 0, //NUMBER Defaults to 0
		defaultLength: 5, //NUMBER Defaults to 2
		sampleRateRetention: 25 //NUMBER Defaults to 50
	});

setInterval(function (){
	buffer.push({foo: 'bar'})
}, 100);

setInterval(function (){
	var maxLength       = buffer.length, //Computed max-length based on sample rate
		actualLength    = buffer.buffer.length; //Actual Buffer Length
	
	console.log(maxLength, actualLength) 
}, 300);
```

###Optional parameters
- timePadding: Used to pad the timeMS can be used to insure the retrieval of a full-buffer when using getByTime with a value equal to the timeMS.
- defaultLength: Default value of the length property, used to insure we don't slice an empty array.

##Methods

###push
Accepts 1 paramater, namely the item that is to be pushed into the buffer.
####note:
Uses unshift internally.

This also triggers the sample-rate checks, a buffer that isn't pushed to for a long time won't empty out on it's own.  Timed-buffer was developed with a constant stream of data in mind.

```javascript
var TimedBuffer = require('./timed-buffer'),
	buffer      = new TimedBuffer(1000);

buffer.push({foo:'bar'});
```
###getLast
Returns the last item pushed into the buffer.

```javascript
var TimedBuffer = require('./timed-buffer'),
	buffer      = new TimedBuffer(1000);

buffer.push({foo:'bar'});
buffer.getLast(); //{foo:'bar'}
buffer.push({wat:'wut'})
buffer.getLast(); //{wat:'wut'}
```
###getByTime
Accepts 2 parameters: 
- timeMS required (amount of miliseconds to request from the buffer) 
- skipMS optional (amount of miliseconds to skip before requesting the timeMS block)

```javascript
var TimedBuffer = require('./timed-buffer'),
	buffer      = new TimedBuffer(1000);

buffer.getByTime(500); //Get the last 500ms of data
buffer.getByTime(500, 300); //Get 500ms worth of data that was commited 300ms ago
```

##Events

###add
Supplies the added item.

```javascript
var TimedBuffer = require('./timed-buffer'),
	buffer      = new TimedBuffer(1000);
	
buffer.on('add', function (addedItem){
    console.log(addedItem);
})
```

###change
Supplies the entire buffer when a change is made.

```javascript
var TimedBuffer = require('./timed-buffer'),
	buffer      = new TimedBuffer(1000);
	
buffer.on('change', function (buffer){
    console.log(buffer);
})
```
