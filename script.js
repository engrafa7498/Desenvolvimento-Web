// =========================================
// CONFIGURAÇÃO DO WHATSAPP
// =========================================

const whatsappNumber = "5513974021504";


// =========================================
// MENSAGENS DO WHATSAPP
// =========================================

const whatsappMessages = {

    geral:
        "Olá! Vim pelo site da Disk Água Andrade e gostaria de fazer um pedido de água.",

    completo:
        "Olá! Vim pelo site da Disk Água Andrade e gostaria de pedir um galão completo de água Cristal por R$ 50,00.",

    agua:
        "Olá! Vim pelo site da Disk Água Andrade e gostaria de pedir água Cristal por R$ 16,00."

};


// =========================================
// BOTÕES DO WHATSAPP
// =========================================

const whatsappButtons = document.querySelectorAll(
    "[data-whatsapp]"
);


whatsappButtons.forEach((button) => {

    button.addEventListener("click", function (event) {

        event.preventDefault();


        const type = this.dataset.whatsapp;


        const message =
            whatsappMessages[type] ||
            whatsappMessages.geral;


        const url =
            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;


        window.open(url, "_blank");

    });

});


// =========================================
// MENU MOBILE
// =========================================

const menuButton =
    document.getElementById("menuButton");


const nav =
    document.querySelector(".nav");


menuButton.addEventListener("click", () => {

    nav.classList.toggle("active");

});


// =========================================
// FECHAR MENU AO CLICAR
// =========================================

document.querySelectorAll(".nav a").forEach((link) => {

    link.addEventListener("click", () => {

        nav.classList.remove("active");

    });

});