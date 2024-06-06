(function () {
  const images = document.getElementsByTagName("img");
  for (let img of images) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.position = "absolute";
    input.style.top = img.offsetTop + "px";
    input.style.left = img.offsetLeft + "px";
    input.onchange = (e) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = event.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    };
    document.body.appendChild(input);
  }
})();
