# GLS for Google.com

## Introduction

This project is a minified guided learning solution for [Google](https://www.google.com/?hl=en). I implemented this guide using jQuery For DOM manipulation and Bootstrap 4 For Styling the Guide Popovers.

## Instructions

  * Browse to [Google](https://www.google.com/?hl=en)
  * Open Developer Tools (F12), go to console and execute:
    ```
    function loadJs(filename) {
      var tag=document.createElement('script');
      tag.setAttribute("type","text/javascript");
      tag.setAttribute("src", filename);
      document.getElementsByTagName("head")[0].appendChild(tag);
    }
    loadJs("https://raw.githack.com/amirf2/gls-for-google/master/player.js");
    ``` 
  * The first guide popover should appear now, in the top left corner. a black information button should appear there as well, in order to play the guide again if necessary.

## Testing
  * #### Check for content validation (content from JSON data should appear when we activating the popover that corresponding to the selector element) 
  * #### Check for button validation (popover should switch when we press prev/next buttons and popover should disappear when we press the 'X' Button ) 

 * To run the tests, execute in devtools console:
```
  runTests();
```
