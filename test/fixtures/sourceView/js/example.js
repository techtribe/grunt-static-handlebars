window.onload = function() {
    var first = document.getElementsByTagName('p')[0];
    console.log('First paragraph', first);
    first.innerHTML = 'Hello, World!';
}
console.log('Window on-load:', window.onload);
