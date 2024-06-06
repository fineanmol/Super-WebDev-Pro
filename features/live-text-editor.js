(function() {
    document.body.contentEditable = document.body.contentEditable !== "true" ? "true" : "false";
    alert('Live Text Editor ' + (document.body.contentEditable === "true" ? 'enabled' : 'disabled') + '.');
  })();
  