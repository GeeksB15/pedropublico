Geeks.ERP.PromptDialog = function (sender, label) {
    return {
        Render: function (fieldValue) {
            with (Geeks.ERP.PromptTexto) {
                var defer = $.Deferred();
                var ulBotoes;

                var promptBody = $("#BodyText_" + label);

                if (promptBody.length <= 0) {
                    promptBody = $(Geeks.ERP.UI.Template.Get("ContentBodyTemplate").format(
                        {
                            Codigo: "#BodyText_" + label
                        }));

                    $(promptBody).appendTo($(sender).parents("[ref=contentBody]")[0]);
                    $('<div></div>').appendTo(promptBody);

                    promptBody.find(".contentTop").css("display", "none");

                    var diag = promptBody.dialog({
                        title: label,
                        width: "50%",
                        height: ($(window).height() * 60) / 100,
                        resizable: true,
                        modal: true,
                        close: function () {
                            promptBody.remove();
                        }
                    });

                    diag.dialog('open');

                    ulBotoes = $("<ul name='MenuBotoes'><ul>").prependTo(promptBody.find('.breadLine > .breadLinks'));

                    ulBotoes.append(
                        Geeks.ERP.UI.Tela.MontaBotoes([
                            {
                                Nome: "Selecionar",
                                Valor: "Selecionar",
                                CodigoBotao: "P1",
                                Icone: "icon-checkmark"
                            },
                            {
                                Nome: "Cancelar",
                                Valor: "Cancelar",
                                CodigoBotao: "P2",
                                Icone: "icon-minus"
                            }
                        ], null));

                    ulBotoes.find("a[name=btn_Selecionar]").click(function () {
                        defer.resolve(promptBody.find("textarea[name=promptText_" + label + "]").val());
                        diag.dialog("close");
                    });

                    ulBotoes.find("a[name=btn_Cancelar]").click(function () {
                        defer.resolve("");
                        diag.dialog("close");
                    });

                    $('<textarea name="promptText_' + label + '" id="promptText_' + label + '" rows="" style="width: 703px; height: 417px; resize: none;" ></textarea> ')
                        .appendTo(promptBody.find(".fluid"))
                        .val(fieldValue.replace(/\\n/g, "\n").replace(/\\r/g, "\r"));
                } else {
                    promptBody.dialog('open');
                }

                var resizeFunction = function () {
                    var componenteGridHeight = promptBody.outerHeight();

                    promptBody.find("textarea").parents(".wrapper").siblings(":visible").each(function (index, value) {
                        componenteGridHeight -= $(value).outerHeight();
                    });

                    componenteGridHeight -= 15;
                    promptBody.find("textarea").height(componenteGridHeight);
                };

                resizeFunction();
                promptBody.resize(resizeFunction);

                return defer.promise();
            }
        },
        Show: function (fieldValue, callbackFunction) {
            this.Render(fieldValue).then(function (value) {
                if (callbackFunction) callbackFunction(value);
                return $.Deferred().resolve();
            });
        }
    }
}

Geeks.ERP.PromptTexto = function (sender, campo) {
    return {
        Render: function (fieldValue) {
            with (Geeks.ERP.PromptTexto) {
                var defer = $.Deferred();
                var ulBotoes;

                var promptBody = $("#BodyText_" + campo.Id);

                if (promptBody.length <= 0) {
                    promptBody = $(Geeks.ERP.UI.Template.Get("ContentBodyTemplate").format(
                        {
                            Codigo: "#BodyText_" + campo.Id
                        }));

                    $(promptBody).appendTo($(sender).parents("[ref=contentBody]")[0]);
                    $('<div></div>').appendTo(promptBody);

                    promptBody.find(".contentTop").css("display", "none");

                    var diag = promptBody.dialog({
                        title: campo.Label,
                        width: "50%",
                        height: ($(window).height() * 60) / 100,
                        resizable: true,
                        modal: true,
                        close: function () {
                            promptBody.remove();
                        }
                    });

                    diag.dialog('open');

                    ulBotoes = $("<ul name='MenuBotoes'><ul>").prependTo(promptBody.find('.breadLine > .breadLinks'));

                    ulBotoes.append(
                        Geeks.ERP.UI.Tela.MontaBotoes([
                            {
                                Nome: "Selecionar",
                                Valor: "Selecionar",
                                CodigoBotao: "P1",
                                Icone: "icon-checkmark"
                            },
                            {
                                Nome: "Cancelar",
                                Valor: "Cancelar",
                                CodigoBotao: "P2",
                                Icone: "icon-minus"
                            }
                        ], null));

                    ulBotoes.find("a[name=btn_Selecionar]").click(function () {
                        defer.resolve(promptBody.find("textarea[name=promptText_" + campo.Id + "]").val());
                        diag.dialog("close");
                    });

                    ulBotoes.find("a[name=btn_Cancelar]").click(function () {
                        defer.resolve(null);
                        diag.dialog("close");
                    });

                    $('<textarea name="promptText_' + campo.Id + '" id="promptText_' + campo.Id + '" rows="" style="width: 703px; height: 417px; resize: none;" ></textarea> ')
                        .appendTo(promptBody.find(".fluid"))
                        .val(fieldValue.replace(/\\n/g, "\n").replace(/\\r/g, "\r"));
                } else {
                    promptBody.dialog('open');
                }

                var resizeFunction = function () {
                    var componenteGridHeight = promptBody.outerHeight();

                    promptBody.find("textarea").parents(".wrapper").siblings(":visible").each(function (index, value) {
                        componenteGridHeight -= $(value).outerHeight();
                    });

                    componenteGridHeight -= 15;
                    promptBody.find("textarea").height(componenteGridHeight);
                };

                resizeFunction();
                promptBody.resize(resizeFunction);

                return defer.promise();
            }
        },
        Show: function (fieldValue, callbackFunction) {
            this.Render(fieldValue).then(function (value) {
                var name = "";

                if ($(sender).siblings("textarea").length > 0) {
                    name = $(sender).siblings("textarea").attr("name");
                }

                if (value || value == "") {
                    if ($(sender).length > 0) {
                        $(sender).siblings("textarea[name=" + name + "]").val(value.replace(/\\n/g, "\n").replace(/\\r/g, "\r"));
                    }

                    if (callbackFunction)
                        callbackFunction(value);
                }

                return $.Deferred().resolve();
            });
        }
    }
}

Geeks.ERP.PromptHtml = function (sender, campo) {
    return {
        Render: function (fieldValue) {
            with (Geeks.ERP.PromptTexto) {
                var defer = $.Deferred();
                var ulBotoes;

                var promptBody = $("#BodyText_" + campo.Id);

                if (promptBody.length <= 0) {
                    promptBody = $(Geeks.ERP.UI.Template.Get("ContentBodyTemplate").format(
                        {
                            Codigo: "#BodyText_" + campo.Id
                        }));

                    $(promptBody).appendTo($(sender).parents("[ref=contentBody]")[0]);
                    $('<div></div>').appendTo(promptBody);

                    promptBody.find(".contentTop").css("display", "none");

                    var diag = promptBody.dialog({
                        title: campo.Label,
                        width: "50%",
                        height: ($(window).height() * 60) / 100,
                        resizable: true,
                        modal: true,
                        close: function () {
                            promptBody.remove();
                        }
                    });

                    diag.dialog('open');

                    ulBotoes = $("<ul name='MenuBotoes'><ul>").prependTo(promptBody.find('.breadLine > .breadLinks'));

                    ulBotoes.append(
                        Geeks.ERP.UI.Tela.MontaBotoes([
                            {
                                Nome: "Selecionar",
                                Valor: "Selecionar",
                                CodigoBotao: "P1",
                                Icone: "icon-checkmark"
                            },
                            {
                                Nome: "Cancelar",
                                Valor: "Cancelar",
                                CodigoBotao: "P2",
                                Icone: "icon-minus"
                            }
                        ], null));

                    ulBotoes.find("a[name=btn_Selecionar]").click(function () {
                        defer.resolve(promptBody.find("textarea[name=promptText_" + campo.Id + "]").val());
                        diag.dialog("close");
                    });

                    ulBotoes.find("a[name=btn_Cancelar]").click(function () {
                        defer.resolve(null);
                        diag.dialog("close");
                    });

                    $('<textarea name="promptText_' + campo.Id + '" id="promptText_' + campo.Id + '" rows="" >' + fieldValue + '</textarea> ').appendTo(promptBody.find(".fluid"));
                    promptBody.find("textarea[name=promptText_" + campo.Id + "]").addClass("editor").cleditor();

                    var resizeFunction = function () {
                        var promptHeight = promptBody.outerHeight();

                        promptBody.find(".cleditorMain").parents(".wrapper").siblings(":visible").each(function (index, value) {
                            promptHeight -= $(value).outerHeight();
                        });

                        promptBody.find(".cleditorMain").height(promptHeight);

                        promptHeight -= promptBody.find(".cleditorToolbar").outerHeight();
                        promptBody.find("textarea").height(promptHeight - 20);
                        promptBody.find("iframe").height(promptHeight);
                    };

                    resizeFunction();
                    promptBody.resize(resizeFunction);
                } else {
                    promptBody.dialog('open');
                }

                promptBody.find('.cleditorMain').css("width", "");
                promptBody.find('.cleditorToolbar').css("width", "");
                promptBody.find('iframe').css("width", "100%");
                promptBody.find('iframe').css("background-color", "#ffffff");

                return defer.promise();
            }
        },
        Show: function (fieldValue, callbackFunction) {
            this.Render(fieldValue).then(function (value) {
                var name = "";

                if ($(sender).siblings("input").length > 0) {
                    name = $(sender).siblings("input").attr("name");
                }

                if (value) {
                    if ($(sender).length > 0) {
                        $(sender).siblings("input[name=" + name + "]").val(value);
                    }

                    if (callbackFunction)
                        callbackFunction(value);
                }

                return $.Deferred().resolve();
            });
        }
    }
}
