(function() {
    const fonts = [];
    const allElements = document.getElementsByTagName('*');
  
    for (let i = 0; i < allElements.length; i++) {
      const style = window.getComputedStyle(allElements[i]);
      const fontFamily = style.fontFamily;
      if (fontFamily && fonts.indexOf(fontFamily) === -1) {
        fonts.push(fontFamily);
      }
    }
  
    alert('Fonts used on this page:\n' + fonts.join('\n'));
  })();
  