/* global Typekit, document */
/* jshint -W033,-W116 */
(function(window, undefined) {
  "use strict"

  var config = {
    /* REPEAT AFTER ME:
     I WILL NOT REUSE THE TYPEKIT ID FOR SPECTRUM-CSS DOCS IN MY PRODUCT
     I WILL NOT REUSE THE TYPEKIT ID FOR SPECTRUM-CSS DOCS IN MY PRODUCT
     I WILL NOT REUSE THE TYPEKIT ID FOR SPECTRUM-CSS DOCS IN MY PRODUCT
     See https://wiki.corp.adobe.com/display/devrel/Using+Typekit+at+Adobe to get set up right. */
    kitId: 'pbi5ojv',
    scriptTimeout: 3000
  };

  if (!window.Typekit) { // we load the typescript only once
    var h = document.getElementsByTagName("html")[0];
    h.className += " wf-loading";
    var t = setTimeout(function() {
      h.className = h.className.replace(/(\s|^)wf-loading(\s|$)/g, " ");
      h.className += " wf-inactive";
    }, config.scriptTimeout);
    var tk = document.createElement("script"),
      d = false;

    // Always load over https
    tk.src = 'https://use.typekit.net/' + config.kitId + '.js'
    tk.type = "text/javascript";
    tk.async = "true";
    tk.onload = tk.onreadystatechange = function() {
      var a = this.readyState;
      if (d || a && a !== "complete" && a !== "loaded") {
        return;
      }
      d = true;
      clearTimeout(t);
      try {
        Typekit.load(config);
      } catch (b) {}
    };
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(tk, s);
  }

}(this));
