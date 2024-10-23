$(document).ready(function () {
    var dadosReport = JSON.parse(localStorage.getItem(getParameterByName("rid")));

    if (!(dadosReport || {}).data) {
        dadosReport = JSON.parse(getParameterByName("hfCodigoSistema"))
    }

    $("body").append("<input type=\"hidden\" name=\"hfCodigoSistema\" id=\"hfCodigoSistema\"/>");
    $("#hfCodigoSistema").data("GeeksData", dadosReport.data);
});

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