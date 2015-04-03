/*
 * Copyright © 2012-2015, Intel Corporation. All rights reserved.
 * Please see the included README.md file for license terms and conditions.
 */


/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false app:false, dev:false, cordova:false */



// This file contains your event handlers, the center of your application.
// NOTE: see app.initEvents() in init-app.js for event handler initialization code.

// function myEventHandler() {
//     "use strict" ;
// // ...event handler code here...

(function()
{
 "use strict";
 /*
   hook up event handlers 
 */
 function register_event_handlers()
 {
    
    
     /* graphic button  #btn-ps */
    $(document).on("click", "#sair", function(evt)
    {                
        var sair = $('#sair');
        
        sair.tap(function(){
            navigator.app.exitApp();
        });
    });

    $(document).on("click", "#btn-busca-nome", function(evt)
    {
            var btnBuscaNome = $('#btn-busca-nome');
            
            $.ui.popup({
                title: "Busca por Nome",
                message: "<input style='color: black;' type='text' id=edtNome placeholder='Digite o nome do produto...' />",
                cancelText: "Cancelar",
                cancelCallback: null,
                doneText: "Pesquisar",
                doneCallback: function(){
                    var produto = $("#edtNome").val();
                    buscar("nome", produto);
                },
                cancelOnly: false
            });
    });
    

    $(document).on("click", "#btn-busca-nome", function(evt)
    {
        //Buscar por código
        var btnBuscaCodigo = $('#btn-busca-code');
        
        btnBuscaCodigo.tap(function() {
            intel.xdk.device.scanBarcode(); //Ativar o leitor de código de barra
        });

        // Depois que que captura o código de barras
        // É necessário criar um código de barras
        document.addEventListener("intel.xdk.device.barcode.scan", function(evt) {
            // Aciona um beep
            intel.xdk.notification.beep(1);

            //Se conseguir fazer a leitura do código de barras
            if(evt.success === true) {
                var produto = '';

                // codedata é o valor que foi lido
                if(evt.codedata == "http://www.wikipedia.org/wiki/Barcode") {
                    produto = "7892597336555";
                } else {
                    produto = evt.codedata;
                }

                buscar("codigo", produto);
            }

        }, false);
    });

    function buscar(type, produto){

        if(produto.length > 0){
            //Verificando o tipo de pesquisa para montar a URL da API
            var urlAPI = '';

            if(type == 'codigo'){
                urlAPI = "http://sandbox.buscape.com/service/findOfferList/3833624b483069786953453d/?barcode=";
            } else {
                urlAPI = "http://sandbox.buscape.com/service/findOfferList/3833624b483069786953453d/?keyword=";
            }

            urlAPI += encodeURI(produto);
            $.ui.showMask("Buscando preço,aguarde ..."); //Exibe enaqunto não recebe reposta
            $.ajax({
                url: urlAPI,
                success: function(resultado) {

                    var category = resultado.getElementsByTagName("category");

                    $.ui.hideMask();

                    //Cabeçalho dos resultados
                    var htmlResultado = '<h2 style="margin-top:10%">' + produto + '</h2>';
                    if(category.length) {
                        htmlResultado += '<p><em>' + category[0].childNodes[5].innerHTML + '</em><p>';
                    }

                    var offer = resultado.getElementsByTagName("offer");

                    //Lista de Resultados
                    var lista = '<ul class="list">';
                    for (var i = 0; i < offer.length; i++) {
                        var oferta = offer[i];
                        var rating = "Sem avaliação";

                        var eBitRating = oferta.getElementsByTagName("eBitRating");

                        if (eBitRating.length) {
                            rating = eBitRating[0].children[2].innerHTML;
                        }

                        var link = oferta.getElementsByTagName("links")[0].firstElementChild.getAttribute("url");
                        var price = oferta.getElementsByTagName("price")[0].children[1].innerHTML;
                        var sellerName = oferta.getElementsByTagName("seller")[0].children[0].innerHTML;
                        var offerName = oferta.getElementsByTagName("offerShortName")[0].innerHTML;

                        var li = '<li>' +
                            '<span class="af-badge">' + rating + '</span>' +
                            '<a class="verOferta" url="' + link + '">' +
                            '<h3>R$' + price + '</h3>' +
                            '<p><b>' + sellerName + '</b></p>' +
                            '<em>' + offerName + '</em>' +
                            '</a>' +
                            '</li>';

                        // Adicionar Oferta na lista
                        lista += li;
                    }

                    lista += '</ul>';

                    htmlResultado += lista;

                    // Retira a log e coloca o reultado
                    $('#pnresultado').html(htmlResultado);
                },
                // type: 'GET',
                dataType: 'xml',
                // failure: intel.xdk.notification.alert('Nenhum Resultado para este Produto')
                // data: {param1: 'value1'},
            });     
        } else {
            intel.xdk.notification.alert('Nome ou código Inválido para Pesquisa. <br/> Tente Novamente.');
        }

        // Quando o usuário clicar em ver Oferta
        $('body').on('click', '.verOferta', function(){

            //Quando lcicar no botão captura o atributo url
            var url = $(this).attr('url');
            intel.xdk.device.launchExternal("http://www.google.com"); //funcão nativa
        });
    }
    
    }
 document.addEventListener("app.Ready", register_event_handlers, false);
})();
