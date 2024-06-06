(function () {
  document.addEventListener("click", (e) => {
    const elementHTML = e.target.outerHTML;
    const blob = new Blob([elementHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "element.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert("Element exported as HTML.");
  });
})();
