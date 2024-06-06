(function () {
  const elements = document.getElementsByTagName("*");
  for (let el of elements) {
    el.style.outline =
      "1px solid #" + Math.floor(Math.random() * 16777215).toString(16);
  }
})();
