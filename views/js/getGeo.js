function locateMe(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) { // XMLHttpRequest.DONE == 4
            if (xmlhttp.status == 200) {
                // document.getElementById("myDiv").innerHTML = xmlhttp.responseText;
            } else if (xmlhttp.status == 400) {
                alert('Erro 400! A requisição foi mal construída...');
            } else if (xmlhttp.status == 401) {
                alert('Erro 401! A requisição não foi autorizada...');
            } else if (xmlhttp.status == 403) {
                alert('Erro 403! Acesso proibido...');
            } else if (xmlhttp.status == 404) {
                alert('Erro 404! Servidor não encontrado...');
            } else if (xmlhttp.status == 500) {
                alert('Erro 500! Erro interno do servidor...');
            } else if (xmlhttp.status == 502) {
                alert('Erro 502! Gateway mal-configurado...');
            } else if (xmlhttp.status == 404) {
                alert('Erro 504! Gateway demorou demais para responder...');
            } else {
                alert('Desculpa a bagunça, mas alguma coisa aconteceu...');
            }
        }
    };
    // console.log(vector);
    xmlhttp.open("GET", "/client/locate/" + latitude + "/" + longitude, true);
    xmlhttp.send();

}

function locationError(error) {
    var code = error.code;
    var message = error.message;
    return [code, message]; //Teste do caralho!   
}

navigator.geolocation.getCurrentPosition(locateMe, locationError);