jQuery UI Touch 
================

About
-----

This is a modified version of the jQuery plugin that enables touch event for jQuery UI. Originally developed by Stephen von Takach. The original project can be found at <http://code.google.com/p/jquery-ui-for-ipad-and-iphone/>.

Adds support for:

* Clicking = tap
* Double Clicking = double tap
* Dragging = touch and move
* Right Click = touch and hold


I did some quick modifications incorporating some changes to the plugin.  This version should be more unobstrusive and I have tested and works in iOS and Android 2.2.

Usage
-----

The jQuery and jQuery UI libraries are required.

```html
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js"></script>
<script src="jquery.ui.touch.js"></script>
<script>
$('element').addTouch();
</script>
```