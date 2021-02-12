function popup(car, brand) {

    Swal.fire({
        title: 'Reserve agora o ' + car,
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
            const mail = Swal.getPopup().querySelector('#sweetName').value
            const phone = Swal.getPopup().querySelector('#sweetAdd').value
            
            if (!name || !add || !mail || !phone) {
                Swal.showValidationMessage(`Por favor, insira todos os dados!`)
            }
            return { name: name, add: add, mail: mail, phone: phone, carro: car+" "+brand }
        }
    }).then((result)=>{console.log(result)}) /*Contribuição de Gustavo Postali, o monstro.*/
}