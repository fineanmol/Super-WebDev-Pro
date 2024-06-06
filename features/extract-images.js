(function() {
    const images = document.getElementsByTagName('img');
    for (let img of images) {
      const a = document.createElement('a');
      a.href = img.src;
      a.download = '';
      a.click();
    }
    alert('Images extracted and downloaded.');
  })();
  