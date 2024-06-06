(function () {
  document.addEventListener("click", (e) => {
    e.target.style.display = "none";
    alert("Element deleted. Refresh the page to undo.");
  });
})();
