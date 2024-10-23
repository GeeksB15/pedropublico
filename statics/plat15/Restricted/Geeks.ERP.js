/*
    Todas funções globais do Sistema

*/

var admAtivado = false;

Number.prototype.getMoney = function (places, symbol, thousand, decimal) {
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbol = symbol !== undefined ? symbol : "$";
    thousand = thousand || ",";
    decimal = decimal || ".";
    var number = this,
        negative = number < 0 ? "-" : "",
        i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
}

String.prototype.replaceAll = String.prototype.replaceAll || function (needle, replacement) {
    return this.split(needle).join(replacement);
}

function initLayout() {
    if (window.self !== window.top) {
        $('#sidebar, #top').hide()
        $('#content').css("padding-top", "0");

        window.parent.postMessage({ status: 'carregado' }, '*')
    }

    $('.menuToggler').on('click', function () {
        $(document.body).toggleClass('is-menuOpened')
    })

    //#region ::. Funções para formatação dos componentes de tela .::

    //===== Usual validation engine=====//

    $("#usualValidate").validate({
        rules: {
            firstname: "required",
            minChars: {
                required: true,
                minlength: 3
            },
            maxChars: {
                required: true,
                maxlength: 6
            },
            mini: {
                required: true,
                min: 3
            },
            maxi: {
                required: true,
                max: 6
            },
            range: {
                required: true,
                range: [6, 16]
            },
            emailField: {
                required: true,
                email: true
            },
            urlField: {
                required: true,
                url: true
            },
            dateField: {
                required: true,
                date: true
            },
            digitsOnly: {
                required: true,
                digits: true
            },
            enterPass: {
                required: true,
                minlength: 5
            },
            repeatPass: {
                required: true,
                minlength: 5,
                equalTo: "#enterPass"
            },
            customMessage: "required",
            topic: {
                required: "#newsletter:checked",
                minlength: 2
            },
            agree: "required"
        },
        messages: {
            customMessage: {
                required: "Bazinga! This message is editable",
            },
            agree: "Please accept our policy"
        }
    });

    //===== Validation engine =====//

    $("#validate").validationEngine();

    //===== Full width sidebar dropdown =====//

    $('.fulldd li').click(function () {
        $(this).children("ul").slideToggle(150);
    });
    $(document).bind('click', function (e) {
        var $clicked = $(e.target);
        if (!$clicked.parents().hasClass("has"))
            $('.fulldd li').children("ul").slideUp(150);
    });

    //===== Top panel search field =====//

    $('.userNav a.search').click(function () {
        $('.topSearch').fadeToggle(150);
    });


    //===== 2 responsive buttons (320px - 480px) =====//

    $('.iTop').click(function () {
        $('#sidebar').slideToggle(100);
    });

    $('.iButton').click(function () {
        $('.altMenu').slideToggle(100);
    });

    //===== Add class on #content resize. Needed for responsive grid =====//

    $('#content').resize(function () {
        var width = $(this).width();
        if (width < 769) {
            $(this).addClass('under');
        }
        else { $(this).removeClass('under') }
    }).resize(); // Run resize on window load


    //===== Button for showing up sidebar on iPad portrait mode. Appears on right top =====//

    $("ul.userNav li a.sidebar").click(function () {
        $(".secNav").toggleClass('display');
    });

    // Carrega a tela de acordo com o parametro ?tela=id
    function abreTela(tela) {
        var objeto = Geeks.ERP.Core.Connection.ExecuteSQL(`Select * from objeto where codigoObjeto=${tela}`, true).Records[0]
        Geeks.ERP.UI.Tela.OpenWindow("content", $("#content"), objeto, null, true);
    }

    var params = (new URL(document.location)).searchParams;
    var tela = params.get('tela')

    if (tela > 0) {
        abreTela(tela)
    }

    window.addEventListener('message', function (event) {
        abreTela(event.data.objeto)
        localStorage.setItem('plat15message', 'tela aberta')
    })
}

function openReport(reportName, queryString) {
    var reportData = {
        data: $("#hfCodigoSistema").data("GeeksData")
    };

    var newId = uid();
    var href = 'https://rel.storage.b15.com.br/Relatorios/' + reportName + ".html";
    //var href = window.location.origin + "/Relatorios/" + reportName + ".html";

    localStorage.setItem(newId, JSON.stringify(reportData));
    window.open(href + "?rid=" + newId + "&" + (queryString || '').replace('15A/Core', '15A') + "&hfCodigoSistema=" + JSON.stringify(reportData), newId);
    return true;
}

function openMultipleReport(reportName, queryString) {
    var reportData = {
        data: $("#hfCodigoSistema").data("GeeksData")
    };
    reportData = JSON.stringify(reportData);
    var href = 'https://rel.storage.b15.com.br/Relatorios/' + reportName + ".html";
    // var href = window.location.origin + "/Relatorios/" + reportName + ".html";
    for (var i = 0; i < queryString.length; i++) {
        //var go = confirm("Deseja abrir o próximo ?");
        //if (go) {
        var newId = uid();
        localStorage.setItem(newId, reportData);
        window.open(href + "?rid=" + newId + "&" + (queryString[i] || '').replace('15A/Core', '15A') + "&hfCodigoSistema=" + JSON.stringify(reportData), newId);
        //}
    }
    return true;
}

function openReportEmail(reportName, queryString) {
    var reportData = {
        data: $("#hfCodigoSistema").data("GeeksData")
    };

    var newId = uid();
    queryString = queryString + "&NomeReport=" + reportName;
    var frame = 'https://rel.storage.b15.com.br/Relatorios/' + reportName + ".html?rid=" + newId + "&" + (queryString || '').replace('15A/Core', '15A') + "&hfCodigoSistema=" + JSON.stringify(reportData);

    localStorage.setItem(newId, JSON.stringify(reportData));
    window.open('https://rel.storage.b15.com.br/Relatorios/email.html?linkTo=' + frame);

    // var frame = window.location.origin + "/Reports/" + reportName + ".html?rid=" + newId + "&" + queryString;

    // localStorage.setItem(newId, JSON.stringify(reportData));
    // window.open(window.location.origin + "/Reports/email.html?linkTo=" + frame);
    return true;
}

function wordWrap(str, maxWidth) {
    var newLineStr = "\n"; done = false; res = '';
    do {
        found = false;
        // Inserts new line at first whitespace of the line
        for (i = maxWidth - 1; i >= 0; i--) {
            if (testWhite(str.charAt(i))) {
                res = res + [str.slice(0, i), newLineStr].join('');
                str = str.slice(i + 1);
                found = true;
                break;
            }
        }
        // Inserts new line at maxWidth position, the word is too long to wrap
        if (!found) {
            res += [str.slice(0, maxWidth), newLineStr].join('');
            str = str.slice(maxWidth);
        }

        if (str.length < maxWidth)
            done = true;
    } while (!done);

    return res + str;
}

function testWhite(x) {
    var white = new RegExp(/^\s$/);
    return white.test(x.charAt(0));
}

///Funcao Para emissao de Relatorios
function ObterValorConfiguracao(nomeConfiguracao, padrao) {

    var nomePagina;
    var configRelatorio = Geeks.ERP.Core.Connection.ExecuteSQL("select * from Configuracoes  where Nome = '" + nomeConfiguracao + "' ");
    if (configRelatorio.Records.length > 0) {
        nomePagina = configRelatorio.Records[0].Valor;
    }
    else {
        nomePagina = null;
    }

    if (nomePagina == null) {
        nomePagina = padrao
    }

    return nomePagina;
}

var waitForm = undefined;

function WaitForm(message) {
    if (!message)
        message = "Processando...";

    var left = ($(window).width() - 322) / 2;
    var top = ($(window).height() - 100) / 2;

    var html = '' +
        '<div id="popup_overlay" style="position: absolute; z-index: 99998; top: 0px; left: 0px; width: 100%; height: 100%; background: rgb(255, 255, 255); opacity: 0.01;"></div>' +
        '<div id="popup_backPanel" style="position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 20000; background-image: url(/Content/Plugins/jquery.alerts/Images/transparente.png);"></div>' +
        '<div id="popup_container" class="ui-draggable" style="position: fixed; z-index: 99999; padding: 0px; margin: 0px; min-width: 322px; max-width: 322px; top: ' + top + 'px; left: ' + left + 'px;">' +
        '	<h1 id="popup_title" style="cursor: move;">Aguarde...</h1>' +
        '	<div id="popup_content" class="wait">' +
        '		<div id="popup_message">' +
        message +
        '		</div>' +
        '		<div id="popup_panel"></div>' +
        '	</div>' +
        '</div>';

    var objWindow = $(html);
    $("body").append(objWindow);

    waitForm = {
        window: objWindow,
        close: function () {
            waitForm.window.remove();
        }
    };
}

function ShowError(response) {
    if (response.message)
        jError(response.message, "Atenção");
    else if (response.ErrorMessage)
        jError(response.ErrorMessage, "Atenção");
    else
        jError("Ocorreu um erro desconhecido. Por favor, entre em contato com a Geeks.", "Atenção");

    $("body").remove("#DivError");

    if (response.ErrorStack != "")
        $("body").append('<div id="DivError" style="display: none">' + response.ErrorStack + '</div>');
}

function getDecimal(value) {
    if (!value)
        return 0;

    try {
        var number = value
            .replace(" ", "")
            .replace("R$", "")
            .replace("%", "")
            .replace(".", "")
            .replace(",", ".");

        return parseFloat(number);
    } catch (e) {
        return parseFloat(value);
    }
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function GetConfiguracao() {
    WaitForm("Buscando Configurações do Sistema...");

    $.ajax({
        type: "POST",
        url: "http://localhost:5555/Core/GetConfiguracaoPAF",
        data: null,
        dataType: "json",
        async: true,
        success: function (response) {
            if (waitForm) {
                waitForm.close();
            }

            configuracaoPAF = response.Records[0];

            if (!response.HasError) {
                if (response.Records[1] != null) {
                    if (response.Records[1].RetornoMetodo != "1") {
                        jError(response.Records[1].MsgRetorno || response.Records[1].MsgErro, "Atenção");
                    }
                    else if (response.Records[1].MsgErro != "") {
                        jError(response.Records[1].MsgErro, "Atenção");
                    }
                    else if (response.Records[1].MsgAviso != "") {
                        jAlert(response.Records[1].MsgAviso, "Atenção");
                    }
                }
            } else {
                ShowError(response);
            }
        },
        error: function (e) {
            if (waitForm) {
                waitForm.close();
            }

            if (e.status == "0") {
                //jError("Não foi possível a comunicação com o servidor. Verifique se o servidor está ativo!");
            } else {
                ShowError(e.responseText);
            }
        }
    });
}

function EnvioWS() {
    $.ajax({
        type: "POST",
        url: "http://localhost:5555/Core/EnvioWS",
        data: {
            DllPath: "",
            Type: "",
            Method: "",
            Parameters: JSON.stringify(["Ambos"])
        },
        dataType: "json",
        async: true,
        success: function (response) {
            if (waitForm) {
                waitForm.close();
            }

            if (response.HasError) {
                if (response.ErrorMessage.indexOf("PROGRAMA BLOQUEADO POR") >= 0) {
                    $("#content_Menu").empty();
                    $("#menu").find("a").not("#lateral244").not("#lateral251").parent().remove();
                    $("#content_Menu").data("SistemaBloqueado", true);
                }

                jError(response.ErrorMessage, "Atenção", function () {
                    GetConfiguracao();
                });
            }
            else {
                if (response.Records[0].Aviso != "") {
                    jAlert(response.Records[0].Aviso, "Sucesso", function () {
                        GetConfiguracao();
                    });
                } else {
                    GetConfiguracao();
                }
            }
        },
        error: function (e) {
            if (waitForm) {
                waitForm.close();
            }

            if (e.status == "0") {
                //jError("Não foi possível a comunicação com o servidor. Verifique se o servidor está ativo!");
            } else {
                ShowError(e.responseText);
            }
        }
    });
}

function GeeksSQL(sql, async, url, database, usrCod) {

    var result = null;
    var data;

    if (!$.isArray(sql)) {

        console.log("Chamando Sentença: " + sql);
        if (sql.toLowerCase().indexOf("update") > -1 || sql.toLowerCase().indexOf("delete") > -1 || sql.toLowerCase().indexOf("alter") > -1 ||
            sql.toLowerCase().indexOf("create") > -1 || sql.toLowerCase().indexOf("drop") > -1 || sql.toLowerCase().indexOf("truncate") > -1 ||
            sql.toLowerCase().indexOf("insert") > -1 || sql.indexOf("exec") > -1 || sql.indexOf("grant") > -1) {
            ShowError("Query não permitida! " + sql);
            return;
        }
        sql = sql.replace(/'/g, "$--$").replace(/"/g, "-#-#-");
        url += "/Core/ExecuteSQL";
        data = sql;
    } else {

        var sentence = [];

        for (var stmt in sql) {
            console.log("Chamando Sentença: " + sql[stmt]);
            if (sql[stmt].toLowerCase().indexOf("update") > -1 || sql[stmt].toLowerCase().indexOf("delete") > -1 || sql[stmt].toLowerCase().indexOf("alter") > -1 ||
                sql[stmt].toLowerCase().indexOf("create") > -1 || sql[stmt].toLowerCase().indexOf("drop") > -1 || sql[stmt].toLowerCase().indexOf("truncate") > -1 ||
                sql[stmt].toLowerCase().indexOf("insert") > -1 || sql[stmt].indexOf("exec") > -1 || sql[stmt].indexOf("grant") > -1) {
                ShowError("Query não permitida! " + sql[stmt]);
                return;
            }

            sql[stmt] = sql[stmt].replace(/'/g, "$--$").replace(/"/g, "-#-#-");
            sentence.push(sql[stmt]);
        }

        url += "/Core/ExecuteAllSQL";
        data = JSON.stringify(sentence);
    }

    $.ajax({
        type: "POST",
        url: url,
        data: {
            database: database,
            sentence: data,
            user: usrCod,
        },
        dataType: "json",
        async: async ? true : false,
        success: function (response) {
            result = response;
        },
        error: function (e) {
            //ShowError(e.responseText);
            return;
        }
    });

    return result;
}

function getMonth(month) {
    var ano = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    var mes = Number(month);
    return ano[mes - 1];
}

function getExtensive(value, money) {
    var ex = [
        ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"],
        ["dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"],
        ["cem", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"],
        ["mil", "milhão", "bilhão", "trilhão", "quadrilhão", "quintilhão", "sextilhão", "setilhão", "octilhão", "nonilhão", "decilhão", "undecilhão", "dodecilhão", "tredecilhão", "quatrodecilhão", "quindecilhão", "sedecilhão", "septendecilhão", "octencilhão", "nonencilhão"]
    ];

    var a, n, v, i, n = String(value).replace(value ? /[^,\d]/g : /\D/g, "").split(","), e = " e ", $ = money == true ? "real" : "", d = money == true ? "centavo" : "", sl;

    for (var f = n.length - 1, l, j = -1, r = [], s = [], t = ""; ++j <= f; s = []) {
        j && (n[j] = (("." + n[j]) * 1).toFixed(2).slice(2));
        if (!(a = (v = n[j]).slice((l = v.length) % 3).match(/\d{3}/g), v = l % 3 ? [v.slice(0, l % 3)] : [], v = a ? v.concat(a) : v).length) continue;
        for (a = -1, l = v.length; ++a < l; t = "") {
            if (!(i = v[a] * 1)) continue;
            i % 100 < 20 && (t += ex[0][i % 100]) ||
                i % 100 + 1 && (t += ex[1][(i % 100 / 10 >> 0) - 1] + (i % 10 ? e + ex[0][i % 10] : ""));
            s.push((i < 100 ? t : !(i % 100) ? ex[2][i == 100 ? 0 : i / 100 >> 0] : (ex[2][i / 100 >> 0] + e + t)) +
                ((t = l - a - 2) > -1 ? " " + (i > 1 && t > 0 ? ex[3][t].replace("ão", "ões") : ex[3][t]) : ""));
        }
        a = ((sl = s.length) > 1 ? (a = s.pop(), s.join(" ") + e + a) : s.join("") || ((!j && (n[j + 1] * 1 > 0) || r.length) ? "" : ex[0][0]));
        a && r.push(a + (value ? (" " + (v.join("") * 1 > 1 ? j ? d + "s" : (/0{6,}$/.test(n[0]) ? "de " : "") + $.replace("l", "is") : j ? d : $)) : ""));
    }
    if (money == true) return r.join(e);
    return r.join(e).trim();
}

function ShowError(response) {
    if (response && response.message)
        alert(response.message, "Atenção");
    else if (response && response.ErrorMessage)
        alert(response.ErrorMessage, "Atenção");
    else if (response)
        alert(response, "Atenção");
    else
        alert("Ocorreu um erro desconhecido. Por favor, entre em contato com a Geeks.", "Atenção");

    $("body").remove("#DivError");

    if (response && response.ErrorStack != "")
        $("body").append('<div id="DivError" style="display: none">' + response.ErrorStack + '</div>');
}

nl2br = function (texto) {
    return texto.replace(/\n/g, "<br />");
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function ShowError(response) {
    if (response && response.message)
        jError(response.message, "Atenção");
    else if (response && response.ErrorMessage)
        jError(response.ErrorMessage, "Atenção");
    else if (response && (response.indexOf("Erro no tempo de execução") > -1 || response.indexOf("Runtime Error")))
        jError("Ocorreu um erro em sua operação. Por favor, entre em contato com o suporte!", "Atenção");
    else if (response)
        jError(response, "Atenção");
    else
        jError("Ocorreu um erro desconhecido. Por favor, entre em contato com a Geeks.", "Atenção");

    $("body").remove("#DivError");

    if (response && response.ErrorStack != "")
        $("body").append('<div id="DivError" style="display: none">' + response.ErrorStack + '</div>');
}

String.prototype.format = function () {
    var s = this;
    var iArgument = arguments[0];

    for (var key in iArgument)
        if (iArgument.hasOwnProperty(key))
            s = s.replace(new RegExp('\\{' + key + '\\}', 'gm'), iArgument[key]);

    return s;
}

function validaData(str) {
    try {
        var parms = str.split(/[\.\-\/]/);
        var yyyy = parseInt(parms[2], 10);
        var mm = parseInt(parms[1], 10);
        var dd = parseInt(parms[0], 10);
        var date = new Date(yyyy, mm - 1, dd, 0, 0, 0, 0);
        return mm === (date.getMonth() + 1) && dd === date.getDate() && yyyy === date.getFullYear();
    } catch (ex) {
        return false;
    }
}

function validaMail(mail) {
    var padrao = new RegExp(/^[A-Za-z0-9_\-\.]+@[A-Za-z0-9_\-\.]{2,}\.[A-Za-z0-9]{2,}(\.[A-Za-z0-9])?/);
    return padrao.test(mail);
}

function uid() {
    var result = '';
    for (var i = 0; i < 32; i++)
        result += Math.floor(Math.random() * 16).toString(16).toUpperCase
            ();
    return result;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function SetaValorPrompt(sender, idName) {
    $(sender).siblings("[name=" + idName + "]").val(sender.value);
}

function getDecimal(value) {
    if (!value)
        return 0;

    try {
        var number = value
            .replace(" ", "")
            .replace("R$", "")
            .replace("%", "")
            .replace(".", "")
            .replace(",", ".");

        return parseFloat(number);
    } catch (e) {
        return parseFloat(value);
    }
}

function SetaValorDataHora(sender) {
    var idCampo = sender.name.replace("d_", "").replace("t_", "");
    var date = $(sender).parent().parent().find("[name=d_" + idCampo + "]").val();
    var time = $(sender).parent().parent().find("[name=t_" + idCampo + "]").val();

    $(sender).parent().parent().find("[name=" + idCampo + "]").val(date + " " + time);
}

$("#btnEnviarEmail").click(function () {
    if ($("#dadosEmail").css("display") == "none") {
        $("#dadosEmail").css("display", "block");
    } else {
        $("#dadosEmail").css("display", "none");
    }
});

$("#btnEnviar").click(function () {

    // Pegando os valores da tela
    var codigoEmailUsuario = $("#emailRemetente").val();
    var emailDestinatario = $("#emailDestinatario").val();
    var cc = $("#emailCc").val();
    var cco = $("#emailCco").val();
    var assunto = $("#emailAssunto").val();
    // Montando corpo do e-mail
    var corpoEmail = nl2br($("#emailCorpo").val());
    // Pegando a URL da página para passar para o phantomjs
    var anexo = window.location.href;

    if (codigoEmailUsuario && emailDestinatario && assunto) {
        // Usando a SP para enviar o e-mail pelo banco
        GeeksSQL("Exec Sp_Envia_Email " + codigoEmailUsuario + ", '" + emailDestinatario + "', '" + cc + "', '" + cco + "', '" + assunto + "', '" + corpoEmail + "', '" + anexo + "'", true);
        // Tirando o prompt do e-mail da tela
        $("#dadosEmail").css('display', 'none');
        // Avisando o usuário que deu certo
        var texto = "Fatura enviada para " + emailDestinatario + "\n";
        if (cc)
            texto += "E-mail(s) em cópia: " + cc + "\n";
        if (cco)
            texto += "E-mail(s) em cópia oculta: " + cco;
        alert(texto);

    } else
        alert("Faltam informações para o envio do e-mail!");

});

// $(listaEmails.Records).each(function(index,row){
//     $("#emailRemetente").append("<option value='" + row.CodigoEmailUsuario + "'>" + row.Conta + "</option>");
// });

// if (listaEmails.Records)
//     $("#emailRemetente").val(listaEmails.Records[0].CodigoEmailUsuario);
