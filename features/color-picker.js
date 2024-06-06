(function() {
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.style.position = 'fixed';
    colorPicker.style.top = '10px';
    colorPicker.style.right = '10px';
    colorPicker.style.zIndex = '9999';
  
    colorPicker.oninput = (e) => {
      alert(`Selected color: ${e.target.value}`);
    };
  
    document.body.appendChild(colorPicker);
  })();
  