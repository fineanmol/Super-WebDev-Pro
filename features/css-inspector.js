(function () {
  if (document.getElementById("css-inspector")) return;

  const styleEditor = document.createElement("div");
  styleEditor.id = "css-inspector";
  styleEditor.style.position = "fixed";
  styleEditor.style.top = "10px";
  styleEditor.style.right = "10px";
  styleEditor.style.backgroundColor = "white";
  styleEditor.style.border = "1px solid black";
  styleEditor.style.padding = "10px";
  styleEditor.style.zIndex = "9999";

  const textarea = document.createElement("textarea");
  textarea.style.width = "300px";
  textarea.style.height = "200px";
  styleEditor.appendChild(textarea);

  const button = document.createElement("button");
  button.textContent = "Apply";
  button.onclick = () => {
    const styles = textarea.value;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  };
  styleEditor.appendChild(button);

  document.body.appendChild(styleEditor);

  document.addEventListener(
    "click",
    (e) => {
      if (e.target !== textarea && e.target !== button) {
        const styles = window.getComputedStyle(e.target);
        let cssText = "";
        for (let i = 0; i < styles.length; i++) {
          cssText += `${styles[i]}: ${styles.getPropertyValue(styles[i])};\n`;
        }
        textarea.value = cssText;
      }
    },
    true
  );
})();
