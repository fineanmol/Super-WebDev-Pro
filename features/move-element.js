(function() {
    let selectedElement = null;
  
    document.addEventListener('click', (e) => {
      if (selectedElement) {
        selectedElement.style.outline = '';
      }
      selectedElement = e.target;
      selectedElement.style.outline = '2px solid red';
  
      alert('Use arrow keys to move the selected element.');
    });
  
    document.addEventListener('keydown', (e) => {
      if (!selectedElement) return;
  
      const rect = selectedElement.getBoundingClientRect();
      switch (e.key) {
        case 'ArrowUp':
          selectedElement.style.top = `${rect.top - 10}px`;
          break;
        case 'ArrowDown':
          selectedElement.style.top = `${rect.top + 10}px`;
          break;
        case 'ArrowLeft':
          selectedElement.style.left = `${rect.left - 10}px`;
          break;
        case 'ArrowRight':
          selectedElement.style.left = `${rect.left + 10}px`;
          break;
      }
    });
  })();
  