var url = location.href;
console.log(url);
console.log(url.substring(5));
console.log(url.substring(url.lastIndexOf('/')));

$.post('/user/getModel', { id: "test" }).done(function(data){
    alert(data);
});