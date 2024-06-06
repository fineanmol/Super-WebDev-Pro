(function () {
  const colors = [];
  const allElements = document.getElementsByTagName("*");

  for (let i = 0; i < allElements.length; i++) {
    const style = window.getComputedStyle(allElements[i]);
    const color = style.color;
    if (color && colors.indexOf(color) === -1) {
      colors.push(color);
    }
  }

  alert("Colors used on this page:\n" + colors.join("\n"));
})();
