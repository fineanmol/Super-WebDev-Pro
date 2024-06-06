(function() {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css?family=Roboto';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  
    document.body.style.fontFamily = 'Roboto, sans-serif';
    alert('Font changed to Roboto.');
  })();
  