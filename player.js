(function() {
  // Load the script
  var script = document.createElement("SCRIPT");
  script.src = "https://code.jquery.com/jquery-3.4.1.min.js";
  script.type = "text/javascript";
  script.onload = function() {
    var $ = window.jQuery;
    // Use $ here...
  };
  document.getElementsByTagName("head")[0].appendChild(script);
})();
