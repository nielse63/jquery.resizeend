### jQuery Resize End Plugin

A tiny plugin to handle events after a (window) resize has been completed.

## Demo

See the demo <a href="http://nielse63.github.io/jQuery-ResizeEnd/" target="_blank">here</a>.

## Usage

Include both the jQuery library and the resizeEnd plugin on your page:

```
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script src="js/jQuery.resizeEnd.js"></script>
```

Attach the resizeEnd method to an element, instatiate options (if so desired), and run a callback functions:

```
$(window).resizeEnd({
	delay : 250
}, function() {
	// Callback logic
});
```

If you want to use the default delay setting of 250ms, simply don't include the options object:

```
$(window).resizeEnd(function() {
	// Callback logic
});
```

## Defaults

Currently, the only default is the delay timeout before the callback is executed.  This is set as an integer in milliseconds.

```
{
	delay : 250
}
```

## Credits

Credit's due where credit's earned, and I took most of the main logic from <a href="http://stackoverflow.com/questions/5489946/jquery-how-to-wait-for-the-end-or-resize-event-and-only-then-perform-an-ac" target="_blank">this SO post</a>.

