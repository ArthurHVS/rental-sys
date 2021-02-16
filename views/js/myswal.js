function popup(car, brand, slug) {

    Swal.fire({
        title: 'Reserve o ' + car.charAt(0).toUpperCase() + car.slice(1),
        html: `<input type="text" id="sweetName" class="swal2-input" placeholder="Nome Completo">
        <input id="sweetAdd" class="swal2-input" placeholder="Endereço Residencial">
        <input id="sweetMail" class="swal2-input" placeholder="Email">
        <input id="sweetPhone" class="swal2-input" placeholder="Telefone para Contato">`,
        confirmButtonText: 'Começar a reserva',
        showCloseButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const name = Swal.getPopup().querySelector('#sweetName').value
            const add = Swal.getPopup().querySelector('#sweetAdd').value
            const mail = Swal.getPopup().querySelector('#sweetMail').value
            const phone = Swal.getPopup().querySelector('#sweetPhone').value
            var finalTitle = brand.concat(" ", car).toLowerCase();
            if (!name || !add || !mail || !phone) {
                Swal.showValidationMessage(`Por favor, insira todos os dados!`)
            }
            return { nome: name, endereco: add, email: mail, telefone: phone, carro: finalTitle, slug: slug }
        }
    }).then((result) => {
        console.log(JSON.stringify(result))
        $.ajax({
            url: '/handshake',
            type: 'POST',
            data: result,
            cache: false,
        }).then((result)=>{location.href = "/car/"+slug});
    }) /*Contribuição de Gustavo Postali, o monstro.*/
}