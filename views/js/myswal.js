function popup(car, brand, slug) {

    Swal.fire({
        title: 'Reserve o ' + car.charAt(0).toUpperCase() + car.slice(1),
        html: `<input type="text" id="sweetName" class="swal2-input" placeholder="Nome Completo">
        <input id="sweetDays" class="swal2-input" placeholder="Quantos dias de reserva?">
        <input id="sweetPhone" class="swal2-input" placeholder="Telefone para Contato">`,
        confirmButtonText: 'Começar a reserva',
        showCloseButton: true,
        focusConfirm: false,
        preConfirm: () => {
            const name = Swal.getPopup().querySelector('#sweetName').value
            const days = Swal.getPopup().querySelector('#sweetDays').value
            const phone = Swal.getPopup().querySelector('#sweetPhone').value
            var finalTitle = brand.concat(" ", car).toLowerCase();
            if (!name || !days || !phone) {
                Swal.showValidationMessage(`Por favor, insira todos os dados!`)
            }
            return { nome: name, dias: days, telefone: phone, carro: finalTitle, slug: slug }
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