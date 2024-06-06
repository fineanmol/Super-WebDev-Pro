(function () {
  const ruler = document.createElement("div");
  ruler.style.position = "fixed";
  ruler.style.top = "0";
  ruler.style.left = "0";
  ruler.style.width = "100%";
  ruler.style.height = "100%";
  ruler.style.border = "1px solid red";
  ruler.style.pointerEvents = "none";
  ruler.style.zIndex = "9999";
  document.body.appendChild(ruler);

  document.addEventListener("mousemove", (e) => {
    ruler.style.width = `${e.clientX}px`;
    ruler.style.height = `${e.clientY}px`;
  });
})();
