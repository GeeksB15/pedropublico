String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

Geeks.ERP.Prompt = function (sender, promptName, sql, structural) {
    var _colunas = [];
    var name = "";
    return {
        Configuracao: function (ordem, nome, tamanho, invisivel, imagem) {
            _colunas.push({
                o: ordem,
                n: nome,
                t: tamanho,
                i: invisivel,
                im: imagem
            });
        },
        Render: function () {
            with (Geeks.ERP.Prompt) {
                var columns = new Array();
                var defer = $.Deferred();

                var promptBody = $("#promptDialog_" + sender.id);

                if (promptBody.length <= 0) {
                    promptBody = $(Geeks.ERP.UI.Template.Get("ContentBodyTemplate").format(
                        {
                            Codigo: "#promptDialog_" + sender.id ? sender.id : sender.name
                        }));

                    $(promptBody).appendTo($(sender).parents("[ref=contentBody]")[0]);
                    var promptGrid = $('<div></div>').appendTo(promptBody);

                    promptBody.find(".contentTop").css("display", "none");

                    var diag = promptBody.dialog({
                        title: promptName,
                        width: "70%",
                        height: ($(window).height() * 60) / 100,
                        resizable: true,
                        modal: true
                    });

                    diag.dialog('open');

                    var ulBotoes = $("<ul name='MenuBotoes'><ul>")
                        .prependTo(promptBody.find('.breadLine > .breadLinks'))
                        .append(Geeks.ERP.UI.Tela.MontaBotoes([
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
                            },
                            {
                                Nome: "Limpar",
                                Valor: "Limpar",
                                CodigoBotao: "P3",
                                Icone: "icon-x"
                            }
                        ], null));

                    function getType(campoType) {
                        switch (campoType) {
                            case "Int32":
                                return "number";
                            case "Int64":
                                return "number";
                            case "Decimal":
                                return "number";
                            case "DateTime":
                                return "date";
                            case "Bit":
                                return "boolean";
                            default:
                                return "string";
                        }
                    }

                    var data = Geeks.ERP.Core.Connection.ExecuteSQL(sql, structural);

                    if (data && !data.HasError) {
                        $.each(data.Columns, function (index, campo) {
                            var result = _colunas.length >= index ? _colunas[index] : {
                                o: index,
                                n: campo.ColumnName,
                                t: 100,
                                i: false,
                                im: false
                            };

                            columns.push({
                                field: campo.ColumnName,
                                type: getType(campo.ColumnType),
                                width: result.t + 'px',
                                title: result.n,
                                hidden: ((result.i) ? true : false),
                                filterable: {
                                    cell: {
                                        showOperators: true,
                                        suggestionOperator: "contains"
                                    },
                                }
                            });

                            if (getType(campo.ColumnType) == "number" && !result.im) {
                                columns[columns.length - 1].filterable.ui = function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n0",
                                        decimals: 0
                                    });
                                };

                                columns[columns.length - 1].filterable.cell.template = function (args) {
                                    args.element.kendoNumericTextBox({
                                        format: "n0",
                                        decimals: 0
                                    });
                                }
                            } else if (result.im) {
                                columns[columns.length - 1].template = "<div style='text-align: center;'><i class='#:data." + columns[columns.length - 1].field + "#'/></div>";
                                columns[columns.length - 1].filterable = false;
                            }
                        });

                        promptGrid.kendoGrid({
                            //autoBind: true,
                            filter: "contains",
                            columns: columns,
                            dataSource: {
                                type: "json",
                                data: data.Records,
                                pageSize: 40,
                                page: 1
                            },
                            filterable: {
                                mode: "menu, row",
                                operators: {
                                    string: {
                                        eq: "Igual",
                                        neq: "Diferente",
                                        startswith: "Começa com",
                                        endswith: "Termina com",
                                        contains: "Contenha",
                                        doesnotcontain: "Não Contenha"
                                    },
                                    number: {
                                        eq: "Igual",
                                        neq: "Diferente",
                                        gte: "Maior ou igual",
                                        gt: "Maior que",
                                        lte: "Menor ou igual",
                                        lt: "Menor que"
                                    },
                                    date: {
                                        eq: "Igual",
                                        neq: "Diferente",
                                        gte: "Posterior ou igual",
                                        gt: "Posterior a",
                                        lte: "Anterior ou igual",
                                        lt: "Anterior a"
                                    }
                                }
                            },
                            groupable: true,
                            selectable: "single",
                            sortable: true,
                            reorderable: true,
                            resizable: true,
                            height: "60%",
                            refresh: true,
                            pageable: {
                                previousNext: true,
                                numeric: true,
                                pageSize: 50,
                                pageSizes: false,
                                messages: {
                                    display: "mostrando {0} - {1} de {2} registros"
                                }
                            },
                            dataBound: function (e) {
                                promptGrid.find(".k-grid-content").find("tr").addClass("noselect");
                                promptGrid.find(".k-grid-content").find("tr").unbind("dblclick");
                                promptGrid.find(".k-grid-content").find("tr").dblclick(function () {
                                    ulBotoes.find("a[name=btn_Selecionar]").click();
                                });
                            }
                        });

                        ulBotoes.find("a[name=btn_Selecionar]").click(function () {
                            var grid = promptGrid.data('kendoGrid');
                            //var column = grid.columns[0].field;
                            var dataItem = grid.dataItem(grid.select());
                            if (dataItem) {
                                diag.dialog("close");
                                defer.resolve(dataItem);

                            } else {
                                jAlert('Você deve selecionar uma linha', "Atenção");
                            }
                        });

                        ulBotoes.find("a[name=btn_Limpar]").click(function () {
                            defer.resolve("");
                            diag.dialog("close");
                        });

                        var campoRetorno = "";
                        if ($(sender).siblings("input[name^=promptDisplay_]").length > 0) {
                            campoRetorno = $(sender).siblings("input[name^=promptDisplay_]").attr("name").replace("promptDisplay_", "");
                        }
                        if (campoRetorno == "") ulBotoes.find("a[name=btn_Limpar]").hide();

                        ulBotoes.find("a[name=btn_Cancelar]").click(function () {
                            defer.resolve(null);
                            diag.dialog("close");
                        });

                        var resizeFunction = function () {
                            var promptHeight = promptBody.outerHeight();

                            promptBody.find(".k-grid").siblings(":visible").each(function (index, value) {
                                promptHeight -= $(value).outerHeight();
                            });

                            promptHeight--;
                            promptHeight--;
                            promptBody.find(".k-grid").height(promptHeight);

                            promptBody.find(".k-grid").children(":visible").not(".k-grid-content").each(function (index, value) {
                                promptHeight -= $(value).outerHeight();
                            });

                            promptHeight--;
                            promptBody.find(".k-grid-content").height(promptHeight);
                        };

                        resizeFunction();
                        promptBody.resize(resizeFunction);

                    } else {
                        if (data) {
                            jAlert("Nenhum registro encontrado!", "Atenção");
                        } else {
                            diag.dialog("close");
                            jError("A rotina do prompt list retornou um dado inesperado. Verifique a sentença e as configurações do prompt list");
                        }
                    }
                } else {
                    promptBody.dialog('open');
                }

                return defer.promise();
            }
        },
        Show: function (callbackFunction) {

            if ($(sender).siblings("input[name^=promptDisplay_]").length > 0) {
                name = $(sender).siblings("input[name^=promptDisplay_]").attr("name").replace("promptDisplay_", "");
            }

            limpar = false;

            this.Render().then(function (value) {

                if (value && value != "") {
                    if ($(sender).siblings("input[name^=promptDisplay_]").length > 0) {

                        if (!value.hasOwnProperty("Descricao") || !value.hasOwnProperty("Codigo")) {
                            jError("Os campos padrões para este tipo de prompt estão ausentes na sentença SQL: Codigo e Descricao", "Erro de Configuração");

                            return $.Deferred().resolve();
                        }

                        if (name != "") {
                            $(sender).siblings("input[name=promptDisplay_" + name + "]").val(value.Descricao);
                            $(sender).siblings("input[name=" + name + "]").val(value.Codigo);
                        }
                    }

                    if (callbackFunction)
                        callbackFunction(value);
                }
                else if (value == "") {
                    if (name != "") {
                        $(sender).siblings("input[name=promptDisplay_" + name + "]").val("");
                        $(sender).siblings("input[name=" + name + "]").val("");
                    }
                }
                return $.Deferred().resolve();
            });
        }
    }
};

Geeks.ERP.PromptB = function (sender, promptName, sql, structural, filtroPermanente, filtroInicial) {
    var _colunas = [];
    var name = "";
    var ordenacao = " ORDER BY "
    var existeConfSelecionado = false;
    return {
        Configuracao: function (ordem, nome, tamanho, invisivel, coluna, tipo, tipoOrdenacao, selecionado, imagem) {
            _colunas.push({
                o: ordem,
                n: nome,
                t: tamanho,
                i: invisivel,
                col: coluna,
                tp: tipo,
                or: tipoOrdenacao,
                sel: selecionado,
                im: imagem
            });
            if (tipoOrdenacao && tipoOrdenacao != "") {
                if (ordenacao != " ORDER BY ") ordenacao += ",";
                ordenacao += _colunas.length + " " + tipoOrdenacao;
            }
            if (selecionado == 1) existeConfSelecionado = true;
        },
        Render: function () {
            with (Geeks.ERP.Prompt) {
                var columns = new Array();
                var defer = $.Deferred();

                var promptBody = $("#promptDialog_" + sender.id);

                if (promptBody.length <= 0) {
                    promptBody = $(Geeks.ERP.UI.Template.Get("ContentBodyTemplate").format(
                        {
                            Codigo: "#promptDialog_" + sender.id ? sender.id : sender.name
                        }));

                    var promptSearch = $(Geeks.ERP.UI.Template.Get("PromptSearchTemplate"));
                    for (var i = 0; i < _colunas.length; i++) {
                        if (!_colunas[i].i && _colunas[i].col.toLowerCase().indexOf("coluna") < 0) {
                            var item = "<li id=\"dropdownItem\">" +
                                "	<label aria-disabled=\"false\" class=\"dropdown-item\">" +
                                "		<input name=\"" + _colunas[i].col + "\" value=\"" + _colunas[i].col + "\" class=\"dropdown-item-checkbox\" " +
                                (((_colunas[i].sel == undefined && existeConfSelecionado == false) || _colunas[i].sel == true || _colunas[i].sel == 1) ? "checked=\"checked\"" : "") +
                                " type=\"checkbox\"> " + _colunas[i].n +
                                "	</label>" +
                                "</li>";
                            $(promptSearch).find("[id=promptColunas]").append(item);
                        }
                    }

                    $(promptBody).append(promptSearch);
                    $(promptBody).appendTo($(sender).parents("[ref=contentBody]")[0]);
                    var promptGrid = $('<div></div>').appendTo(promptBody);

                    promptBody.find(".contentTop").css("display", "none");

                    var diag = promptBody.dialog({
                        title: promptName,
                        width: "70%",
                        height: ($(window).height() * 65) / 100,
                        resizable: true,
                        modal: true
                    });

                    diag.dialog('open');
                    promptBody.css("overflow", "hidden");

                    procurar = function (obj) {
                        promptBody.find("#btnPromptProcurar").click();
                    };

                    promptBody.find("[id=promptInput]").tagsInput({
                        'height': '47px',
                        'width': 'auto',
                        'interactive': true,
                        'onChange': procurar,
                        'removeWithBackspace': true,
                        'defaultText': 'Procurar',
                        'placeholderColor': '#666666'
                    });
                    promptBody.find("[id=promptInput_tagsinput]").css("min-width", "400px");
                    promptBody.find("[id=promptInput_tag]").focus();

                    var ulBotoes = $("<ul name='MenuBotoes'><ul>")
                        .prependTo(promptBody.find('.breadLine > .breadLinks'))
                        .append(Geeks.ERP.UI.Tela.MontaBotoes([
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
                            },
                            {
                                Nome: "Limpar",
                                Valor: "Limpar",
                                CodigoBotao: "P3",
                                Icone: "icon-x"
                            }
                        ], null));

                    diag.on('dialogclose', function (event) {
                        diag.remove();
                    });

                    function getType(campoType) {
                        switch (campoType) {
                            case "Int32":
                                return "number";
                            case "Int64":
                                return "number";
                            case "Decimal":
                                return "number";
                            case "DateTime":
                                return "date";
                            case "Bit":
                                return "boolean";
                            case "numero":
                                return "number";
                            case "moeda":
                                return "number";
                            case "data":
                                return "date";
                            case "datahora":
                                return "date";
                            case "flag":
                                return "boolean";
                            default:
                                return "string";
                        }
                    }

                    //Traz apenas os 25 primeiros da sql inicial
                    var sentencaSql = "Select * from ( " + sql + ") ss ";
                    var where = "";
                    if (filtroPermanente && filtroPermanente != "") {
                        where += " WHERE " + filtroPermanente;
                    }
                    if (filtroInicial && filtroInicial != "") {
                        if (where.toLowerCase().indexOf("where") < 0)
                            where += "  WHERE " + filtroInicial;
                        else where += " AND " + filtroInicial;
                    }
                    sentencaSql += where;
                    if (ordenacao == " ORDER BY ") ordenacao += "1 ";
                    sentencaSql += ordenacao + " OFFSET 0 ROWS FETCH NEXT 25 ROWS ONLY";
                    var data;

                    if (sql.toLowerCase().indexOf("exec") < 0)
                        data = Geeks.ERP.Core.Connection.ExecuteSQL(sentencaSql, structural);
                    else {
                        where = "'" + where.replaceAll("'", "''") + "'";
                        data = Geeks.ERP.Core.Connection.ExecuteSQL(sql + "," + where + ",25", structural);
                    }

                    if (data && !data.HasError) {
                        $.each(data.Columns, function (index, campo) {
                            var result = _colunas.length > index ? _colunas[index] : {
                                o: index,
                                n: campo.ColumnName,
                                t: 100,
                                i: true,
                                im: false
                            };

                            columns.push({
                                field: campo.ColumnName,
                                type: getType(campo.ColumnType),
                                width: result.t + 'px',
                                title: result.n,
                                hidden: ((result.i) ? true : false),
                                filterable: {
                                    cell: {
                                        showOperators: true,
                                        suggestionOperator: "contains"
                                    },
                                }
                            });

                            if (getType(campo.ColumnType) == "number" && !result.im) {
                                columns[columns.length - 1].filterable.ui = function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n0",
                                        decimals: 0
                                    });
                                };

                                columns[columns.length - 1].filterable.cell.template = function (args) {
                                    args.element.kendoNumericTextBox({
                                        format: "n0",
                                        decimals: 0
                                    });
                                }
                            } else if (result.im) {
                                columns[columns.length - 1].template = "<div style='text-align: center;'><i class='#:data." + columns[columns.length - 1].field + "#'/></div>";
                                columns[columns.length - 1].filterable = false;
                            }
                        });

                        promptGrid.kendoGrid({
                            //autoBind: true,
                            columns: columns,
                            dataSource: {
                                type: "json",
                                data: data.Records,
                                pageSize: 25,
                                page: 1
                            },
                            groupable: false,
                            selectable: "single",
                            sortable: true,
                            reorderable: true,
                            resizable: true,
                            navigatable: true,
                            height: "50%",
                            refresh: true,
                            pageable: {
                                previousNext: true,
                                numeric: true,
                                pageSize: 25,
                                pageSizes: false,
                                messages: {
                                    display: "mostrando {0} - {1} de {2} registros"
                                }
                            },
                            dataBound: function (e) {
                                promptGrid.find(".k-grid-content").find("tr").addClass("noselect");
                                promptGrid.find(".k-grid-content").find("tr").unbind("dblclick");
                                promptGrid.find(".k-grid-content").find("tr").dblclick(function () {
                                    ulBotoes.find("a[name=btn_Selecionar]").click();
                                });
                            }
                        });

                        promptGrid.data("kendoGrid").table.on("keydown", function (e) {
                            var keycode = (e.keyCode ? e.keyCode : e.which);
                            if (keycode == '13') {
                                //Seleciona a linha
                                ulBotoes.find("a[name=btn_Selecionar]").click();
                            }
                            else if (keycode == '38' || keycode == '40') {
                                setTimeout(function () {
                                    promptGrid.data("kendoGrid").clearSelection();
                                    promptGrid.data("kendoGrid").select($(".k-state-focused").closest("tr"));
                                });
                            }
                        });

                        promptBody.find("[id=promptInput_tag]").on("keydown", function (e) {
                            var keycode = (e.keyCode ? e.keyCode : e.which);
                            if (keycode == '9') {
                                e.preventDefault();
                                var row = promptGrid.data("kendoGrid").tbody.find("tr:first");
                                promptGrid.data("kendoGrid").select(row);
                                promptGrid.data("kendoGrid").table.focus();
                            }
                        });

                        ulBotoes.find("a[name=btn_Selecionar]").click(function () {
                            var grid = promptGrid.data('kendoGrid');
                            //var column = grid.columns[0].field;
                            var dataItem = grid.dataItem(grid.select());
                            if (dataItem) {
                                diag.dialog("close");
                                defer.resolve(dataItem);

                            } else {
                                jAlert('Você deve selecionar uma linha', "Atenção");
                            }
                        });

                        ulBotoes.find("a[name=btn_Limpar]").click(function () {
                            defer.resolve("");
                            diag.dialog("close");
                        });

                        var campoRetorno = "";
                        if ($(sender).siblings("input[name^=promptDisplay_]").length > 0) {
                            campoRetorno = $(sender).siblings("input[name^=promptDisplay_]").attr("name").replace("promptDisplay_", "");
                        }
                        if (campoRetorno == "") ulBotoes.find("a[name=btn_Limpar]").hide();

                        ulBotoes.find("a[name=btn_Cancelar]").off();
                        ulBotoes.find("a[name=btn_Cancelar]").click(function () {
                            defer.resolve(null);
                            diag.dialog("close");
                            diag.remove();
                        });

                        var resizeFunction = function () {
                            var promptHeight = promptBody.outerHeight() - 30;

                            promptBody.find(".k-grid").siblings(":visible").each(function (index, value) {
                                promptHeight -= $(value).outerHeight();
                            });

                            promptHeight--;
                            promptHeight--;
                            promptBody.find(".k-grid").height(promptHeight);

                            promptBody.find(".k-grid").children(":visible").not(".k-grid-content").each(function (index, value) {
                                promptHeight -= $(value).outerHeight();
                            });

                            promptHeight--;
                            promptBody.find(".k-grid-content").height(promptHeight);
                        };

                        resizeFunction();
                        promptBody.resize(resizeFunction);

                        promptBody.find("a.dropdown-item-button").click(function (obj) {
                            promptBody.find("[id=promptDropdownText]")[0].innerHTML = obj.currentTarget.innerText;
                            promptBody.find("[id=promptItem]").removeClass("active");
                            obj.currentTarget.parentElement.classList.add("active");
                        });

                        promptBody.find("input.dropdown-item-checkbox").click(function () {
                            if (event.stopPropagation) {
                                event.stopPropagation();
                            }
                            event.cancelBubble = true;
                        });

                        promptBody.find("li[id=dropdownItem]").click(function () {
                            var obj = $(this);
                            if (obj[0].children[0].children[0].checked) obj[0].children[0].children[0].checked = false;
                            else obj[0].children[0].children[0].checked = true;
                        });

                        promptBody.find("#promptInput").keyup(function (e) {
                            if (e.which == 13) {
                                promptBody.find("#btnPromptProcurar").click();
                            }
                        });

                        promptBody.find("#btnPromptProcurar").click(function () {
                            //Monta query dinamica
                            promptBody.find("#btnPromptProcurar").focus();
                            var sentencaSql = "Select * from ( " + sql + ") ss ";
                            var filtroSql = "";
                            var textoPesquisa = promptBody.find("[id=promptInput]").val();
                            if (textoPesquisa.trim() != "") {
                                var arrayItens = [];
                                arrayItens = textoPesquisa.split(",");
                                if (arrayItens[arrayItens.length - 1] == "") {
                                    arrayItens = arrayItens.splice(arrayItens.length - 2, 1);
                                }
                                filtroSql += " WHERE 1=1 ";
                                var possuiItem = false;
                                for (var i = 0; i < arrayItens.length; i++) {
                                    var arrayPesquisa = [];
                                    if (arrayItens[i].indexOf("\"") == 0) arrayPesquisa.push(arrayItens[i].substr(1, (arrayItens[i].length - 2)));
                                    else if (arrayItens[i].indexOf("/") > -1) arrayPesquisa.push(arrayItens[i]);
                                    else arrayPesquisa = arrayItens[i].split(" ");

                                    filtroSql += "AND ( 1<>1 ";
                                    $.each(promptBody.find("input.dropdown-item-checkbox"), function (index, obj) {
                                        if ($(obj).attr('checked')) {
                                            possuiItem = true;
                                            var tipo = "";
                                            for (var i = 0; i < _colunas.length; i++) {
                                                if (_colunas[i].col == obj.value) {
                                                    tipo = _colunas[i].tp;
                                                    break;
                                                }
                                            }

                                            if (tipo == "numero") {
                                                for (var j = 0; j < arrayPesquisa.length; j++) {
                                                    if (!isNaN(arrayPesquisa[j].replace(",", "."))) filtroSql += " OR " + obj.value + " = '" + parseInt(arrayPesquisa[j].replace(",", ".")) + "' ";
                                                }
                                            }
                                            else if (tipo == "moeda") {
                                                for (var j = 0; j < arrayPesquisa.length; j++) {
                                                    if (!isNaN(arrayPesquisa[j].replace(",", "."))) filtroSql += " OR " + obj.value + " = '" + arrayPesquisa[j].replace(".", ",") + "' ";
                                                }
                                            }
                                            else if (tipo == "data") {
                                                for (var j = 0; j < arrayPesquisa.length; j++) {
                                                    var arrayData = arrayPesquisa[j].split("/");
                                                    if (arrayData.length == 3) {
                                                        var d = new Date(arrayData[2], parseInt(arrayData[1]) - 1, arrayData[0]);
                                                        if (d.toString() != "Invalid Date") {
                                                            filtroSql += " OR Convert(varchar," + obj.value + ",103) = '" + ((((d.getDate() + "").length == 1 ? "0" : "")) + d.getDate() + '/' + ((((d.getMonth() + 1) + "").length == 1 ? "0" : "")) + (d.getMonth() + 1) + '/' + d.getFullYear()) + "' ";
                                                        }
                                                    }
                                                }
                                            }
                                            else if (tipo == "datahora") {
                                                for (var j = 0; j < arrayPesquisa.length; j++) {
                                                    if (arrayPesquisa[j].trim().length == 10) {
                                                        var arrayData = arrayPesquisa[j].split("/");
                                                        if (arrayData.length == 3) {
                                                            var d = new Date(arrayData[2], parseInt(arrayData[1]) - 1, arrayData[0]);
                                                            if (d.toString() != "Invalid Date") {
                                                                filtroSql += " OR (" + obj.value + " >= '" + ((((d.getDate() + "").length == 1 ? "0" : "")) + d.getDate() + '/' + ((((d.getMonth() + 1) + "").length == 1 ? "0" : "")) + (d.getMonth() + 1) + '/' + d.getFullYear()) + " 00:00:00' ";
                                                                filtroSql += " AND " + obj.value + " <= '" + ((((d.getDate() + "").length == 1 ? "0" : "")) + d.getDate() + '/' + ((((d.getMonth() + 1) + "").length == 1 ? "0" : "")) + (d.getMonth() + 1) + '/' + d.getFullYear()) + " 23:59:59.999') ";
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        var arrayData = arrayPesquisa[j].split(" ")[0].split("/");
                                                        var arrayHora = null;
                                                        if (arrayPesquisa[j].split(" ")[1]) arrayHora = arrayPesquisa[j].split(" ")[1].split(":");
                                                        if (arrayData.length == 3 && (arrayHora.length == 3 || !arrayHora)) {
                                                            var d = new Date(arrayData[2], parseInt(arrayData[1]) - 1, arrayData[0], arrayHora[0], arrayHora[1], arrayHora[2]);
                                                            if (d.toString() != "Invalid Date") {
                                                                if (arrayHora) {
                                                                    filtroSql += " OR " + obj.value + " = '" + ((((d.getDate() + "").length == 1 ? "0" : "")) + d.getDate() + '/' + ((((d.getMonth() + 1) + "").length == 1 ? "0" : "")) + (d.getMonth() + 1) + '/' + d.getFullYear()) +
                                                                        " " + (((d.getHours() + "").length == 1 ? "0" : "")) + d.getHours() + ":" + (((d.getMinutes() + "").length == 1 ? "0" : "")) + d.getMinutes() + ":" + (((d.getSeconds() + "").length == 1 ? "0" : "")) + d.getSeconds() + "' ";
                                                                }
                                                                else {
                                                                    filtroSql += " OR (" + obj.value + " >= '" + ((((d.getDate() + "").length == 1 ? "0" : "")) + d.getDate() + '/' + ((((d.getMonth() + 1) + "").length == 1 ? "0" : "")) + (d.getMonth() + 1) + '/' + d.getFullYear()) + " 00:00:00' ";
                                                                    filtroSql += " AND " + obj.value + " <= '" + ((((d.getDate() + "").length == 1 ? "0" : "")) + d.getDate() + '/' + ((((d.getMonth() + 1) + "").length == 1 ? "0" : "")) + (d.getMonth() + 1) + '/' + d.getFullYear()) + " 23:59:59.999') ";
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            else if (tipo == "flag") {
                                                for (var j = 0; j < arrayPesquisa.length; j++) {
                                                    if (arrayPesquisa[j] == "Não") {
                                                        arrayPesquisa[j] = 0;
                                                        filtroSql += " OR " + obj.value + " = '" + arrayPesquisa[j] + "' ";
                                                    }
                                                    else if (arrayPesquisa[j] == "Sim") {
                                                        arrayPesquisa[j] = 1;
                                                        filtroSql += " OR " + obj.value + " = '" + arrayPesquisa[j] + "' ";
                                                    }
                                                }
                                            }
                                            else {
                                                if (arrayPesquisa.length > 0) filtroSql += " OR ( ";
                                                for (var j = 0; j < arrayPesquisa.length; j++) {
                                                    if (j > 0) filtroSql += " AND "
                                                    filtroSql += obj.value + " LIKE '%" + arrayPesquisa[j] + "%' ";
                                                }
                                                if (arrayPesquisa.length > 0) filtroSql += " ) ";
                                            }
                                        }
                                    });
                                    filtroSql += ") "
                                }

                                //Adiciona filtro permanente
                                if (filtroPermanente && filtroPermanente != "") {
                                    filtroSql += " AND " + filtroPermanente + " ";
                                }

                                if (possuiItem) {
                                    if (sentencaSql.toLowerCase().indexOf("exec") < 0) {
                                        if (promptBody.find("[id=promptDropdownText]")[0].innerHTML != "Todos")
                                            sentencaSql += filtroSql + ordenacao + " OFFSET 0 ROWS FETCH NEXT " + promptBody.find("[id=promptDropdownText]")[0].innerHTML + " ROWS ONLY";
                                        else
                                            sentencaSql += filtroSql + ordenacao;
                                    }
                                    else {
                                        filtroSql = "'" + filtroSql.replaceAll("'", "''") + "'";
                                        sentencaSql = sql + "," + filtroSql + "," +
                                            (promptBody.find("[id=promptDropdownText]")[0].innerHTML != "Todos" ? "'" + promptBody.find("[id=promptDropdownText]")[0].innerHTML + "'" : "NULL");
                                    }

                                    data = Geeks.ERP.Core.Connection.ExecuteSQL(sentencaSql, structural);

                                    var grid = promptGrid.data('kendoGrid');
                                    var dataTable = grid.dataSource.data(data.Records);
                                    grid.refresh();
                                }
                                else {
                                    jAlert("Nenhuma coluna selecionada para pesquisa!", "Atenção");
                                }
                            }
                            promptBody.find("[id=promptInput_tag]").focus();
                        });

                    } else {
                        if (data) {
                            jAlert("Nenhum registro encontrado!", "Atenção");
                        } else {
                            diag.dialog("close");
                            jError("A rotina do prompt list retornou um dado inesperado. Verifique a sentença e as configurações do prompt list");
                        }
                    }
                } else {
                    promptBody.dialog('open');
                }

                return defer.promise();
            }
        },
        Show: function (callbackFunction) {

            if ($(sender).siblings("input[name^=promptDisplay_]").length > 0) {
                name = $(sender).siblings("input[name^=promptDisplay_]").attr("name").replace("promptDisplay_", "");
            }

            limpar = false;

            this.Render().then(function (value) {

                if (value && value != "") {
                    if ($(sender).siblings("input[name^=promptDisplay_]").length > 0) {

                        if (!value.hasOwnProperty("Descricao") || !value.hasOwnProperty("Codigo")) {
                            jError("Os campos padrões para este tipo de prompt estão ausentes na sentença SQL: Codigo e Descricao", "Erro de Configuração");

                            return $.Deferred().resolve();
                        }
                        if (name != "") {
                            $(sender).siblings("input[name=promptDisplay_" + name + "]").val(value.Descricao);
                            $(sender).siblings("input[name=" + name + "]").val(value.Codigo);
                        }
                    }

                    if (callbackFunction)
                        callbackFunction(value);
                }
                else if (value == "") {
                    if (name != "") {
                        $(sender).siblings("input[name=promptDisplay_" + name + "]").val("");
                        $(sender).siblings("input[name=" + name + "]").val("");
                    }
                }

                return $.Deferred().resolve();
            });
        }
    }
};

Geeks.ERP.PromptM = function (sender, promptName, sql, structural, filtroPermanente, filtroInicial) {
    var _colunas = [];
    var name = "";
    var ordenacao = " ORDER BY "
    var existeConfSelecionado = false;
    return {
        Configuracao: function (ordem, nome, tamanho, invisivel, coluna, tipo, tipoOrdenacao, selecionado, imagem) {
            _colunas.push({
                o: ordem,
                n: nome,
                t: tamanho,
                i: invisivel,
                col: coluna,
                tp: tipo,
                or: tipoOrdenacao,
                sel: selecionado,
                im: imagem
            });
            if (tipoOrdenacao && tipoOrdenacao != "") {
                if (ordenacao != " ORDER BY ") ordenacao += ",";
                ordenacao += _colunas.length + " " + tipoOrdenacao;
            }
            if (selecionado == 1) existeConfSelecionado = true;
        },
        Render: function () {
            with (Geeks.ERP.Prompt) {
                var columns = new Array();
                var defer = $.Deferred();

                var promptBody = $("#promptDialog_" + sender.id);

                if (promptBody.length <= 0) {
                    promptBody = $(Geeks.ERP.UI.Template.Get("ContentBodyTemplate").format(
                        {
                            Codigo: "#promptDialog_" + sender.id ? sender.id : sender.name
                        }));

                    var promptSearch = $(Geeks.ERP.UI.Template.Get("PromptSearchTemplate"));
                    for (var i = 0; i < _colunas.length; i++) {
                        if (!_colunas[i].i && _colunas[i].col.toLowerCase().indexOf("coluna") < 0) {
                            var item = "<li id=\"dropdownItem\">" +
                                "	<label aria-disabled=\"false\" class=\"dropdown-item\">" +
                                "		<input name=\"" + _colunas[i].col + "\" value=\"" + _colunas[i].col + "\" class=\"dropdown-item-checkbox\" " +
                                (((_colunas[i].sel == undefined && existeConfSelecionado == false) || _colunas[i].sel == true || _colunas[i].sel == 1) ? "checked=\"checked\"" : "") +
                                " type=\"checkbox\"> " + _colunas[i].n +
                                "	</label>" +
                                "</li>";
                            $(promptSearch).find("[id=promptColunas]").append(item);
                        }
                    }

                    $(promptBody).append(promptSearch);
                    $(promptBody).appendTo($(sender).parents("[ref=contentBody]")[0]);
                    var promptGrid = $('<div></div>').appendTo(promptBody);

                    promptBody.find(".contentTop").css("display", "none");

                    var diag = promptBody.dialog({
                        title: promptName,
                        width: "70%",
                        height: ($(window).height() * 65) / 100,
                        resizable: true,
                        modal: true
                    });

                    diag.dialog('open');
                    promptBody.css("overflow", "hidden");

                    procurar = function (obj) {
                        promptBody.find("#btnPromptProcurar").click();
                    };

                    promptBody.find("[id=promptInput]").tagsInput({
                        'height': '47px',
                        'width': 'auto',
                        'interactive': true,
                        'onChange': procurar,
                        'removeWithBackspace': true,
                        'defaultText': 'Procurar',
                        'placeholderColor': '#666666'
                    });
                    promptBody.find("[id=promptInput_tagsinput]").css("min-width", "400px");
                    promptBody.find("[id=promptInput_tag]").focus();

                    var ulBotoes = $("<ul name='MenuBotoes'><ul>")
                        .prependTo(promptBody.find('.breadLine > .breadLinks'))
                        .append(Geeks.ERP.UI.Tela.MontaBotoes([
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
                            },
                            {
                                Nome: "Limpar",
                                Valor: "Limpar",
                                CodigoBotao: "P3",
                                Icone: "icon-x"
                            }
                        ], null));

                    diag.on('dialogclose', function (event) {
                        diag.remove();
                    });

                    function getType(campoType) {
                        switch (campoType) {
                            case "Int32":
                                return "number";
                            case "Int64":
                                return "number";
                            case "Decimal":
                                return "number";
                            case "DateTime":
                                return "date";
                            case "Bit":
                                return "boolean";
                            case "numero":
                                return "number";
                            case "moeda":
                                return "number";
                            case "data":
                                return "date";
                            case "datahora":
                                return "date";
                            case "flag":
                                return "boolean";
                            default:
                                return "string";
                        }
                    }

                    //Traz apenas os 25 primeiros da sql inicial
                    var sentencaSql = "Select * from ( " + sql + ") ss ";
                    var where = "";
                    if (filtroPermanente && filtroPermanente != "") {
                        where += " WHERE " + filtroPermanente;
                    }
                    if (filtroInicial && filtroInicial != "") {
                        if (where.toLowerCase().indexOf("where") < 0)
                            where += "  WHERE " + filtroInicial;
                        else where += " AND " + filtroInicial;
                    }
                    sentencaSql += where;
                    if (ordenacao == " ORDER BY ") ordenacao += "1 ";
                    sentencaSql += ordenacao + " OFFSET 0 ROWS FETCH NEXT 25 ROWS ONLY";
                    var data;

                    if (sql.toLowerCase().indexOf("exec") < 0)
                        data = Geeks.ERP.Core.Connection.ExecuteSQL(sentencaSql, structural);
                    else {
                        where = "'" + where.replaceAll("'", "''") + "'";
                        data = Geeks.ERP.Core.Connection.ExecuteSQL(sql + "," + where + ",25", structural);
                    }

                    if (data && !data.HasError) {
                        $.each(data.Columns, function (index, campo) {
                            var result = _colunas.length > index ? _colunas[index] : {
                                o: index,
                                n: campo.ColumnName,
                                t: 100,
                                i: true,
                                im: false
                            };

                            columns.push({
                                field: campo.ColumnName,
                                type: getType(campo.ColumnType),
                                width: result.t + 'px',
                                title: result.n,
                                hidden: ((result.i) ? true : false),
                                filterable: {
                                    cell: {
                                        showOperators: true,
                                        suggestionOperator: "contains"
                                    },
                                }
                            });

                            if (getType(campo.ColumnType) == "number" && !result.im) {
                                columns[columns.length - 1].filterable.ui = function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n0",
                                        decimals: 0
                                    });
                                };

                                columns[columns.length - 1].filterable.cell.template = function (args) {
                                    args.element.kendoNumericTextBox({
                                        format: "n0",
                                        decimals: 0
                                    });
                                }
                            } else if (result.im) {
                                columns[columns.length - 1].template = "<div style='text-align: center;'><i class='#:data." + columns[columns.length - 1].field + "#'/></div>";
                                columns[columns.length - 1].filterable = false;
                            }
                        });

                        promptGrid.kendoGrid({
                            //autoBind: true,
                            columns: columns,
                            dataSource: {
                                type: "json",
                                data: data.Records,
                                pageSize: 25,
                                page: 1
                            },
                            groupable: false,
                            selectable: "multiple",
                            sortable: true,
                            reorderable: true,
                            resizable: true,
                            navigatable: true,
                            height: "50%",
                            refresh: true,
                            pageable: {
                                previousNext: true,
                                numeric: true,
                                pageSize: 25,
                                pageSizes: false,
                                messages: {
                                    display: "mostrando {0} - {1} de {2} registros"
                                }
                            },
                            dataBound: function (e) {
                                promptGrid.find(".k-grid-content").find("tr").addClass("noselect");
                                promptGrid.find(".k-grid-content").find("tr").unbind("dblclick");
                                promptGrid.find(".k-grid-content").find("tr").dblclick(function () {
                                    ulBotoes.find("a[name=btn_Selecionar]").click();
                                });
                            }
                        });

                        promptGrid.data("kendoGrid").table.on("keydown", function (e) {
                            var keycode = (e.keyCode ? e.keyCode : e.which);
                            if (keycode == '13') {
                                //Seleciona a linha
                                ulBotoes.find("a[name=btn_Selecionar]").click();
                            }
                            else if (keycode == '38' || keycode == '40') {
                                setTimeout(function () {
                                    promptGrid.data("kendoGrid").clearSelection();
                                    promptGrid.data("kendoGrid").select($(".k-state-focused").closest("tr"));
                                });
                            }
                        });

                        promptBody.find("[id=promptInput_tag]").on("keydown", function (e) {
                            var keycode = (e.keyCode ? e.keyCode : e.which);
                            if (keycode == '9') {
                                e.preventDefault();
                                var row = promptGrid.data("kendoGrid").tbody.find("tr:first");
                                promptGrid.data("kendoGrid").select(row);
                                promptGrid.data("kendoGrid").table.focus();
                            }
                        });

                        ulBotoes.find("a[name=btn_Selecionar]").click(function () {
                            var grid = promptGrid.data('kendoGrid');
                            //var column = grid.columns[0].field;
                            var selectedRows = grid.select();
                            if (selectedRows) {
                                var retorno = [];
                                if (selectedRows.length > 0) {
                                    for (var i = 0; i < selectedRows.length; i++) {
                                        var selectedItem = grid.dataItem(selectedRows[i]);
                                        retorno.push(selectedItem.Codigo);
                                    }
                                }
                                diag.dialog("close");
                                defer.resolve(retorno);

                            } else {
                                jAlert('Você deve selecionar uma linha', "Atenção");
                            }
                        });

                        ulBotoes.find("a[name=btn_Limpar]").click(function () {
                            defer.resolve("");
                            diag.dialog("close");
                        });

                        var campoRetorno = "";
                        if ($(sender).siblings("input[name^=promptDisplay_]").length > 0) {
                            campoRetorno = $(sender).siblings("input[name^=promptDisplay_]").attr("name").replace("promptDisplay_", "");
                        }
                        if (campoRetorno == "") ulBotoes.find("a[name=btn_Limpar]").hide();

                        ulBotoes.find("a[name=btn_Cancelar]").off();
                        ulBotoes.find("a[name=btn_Cancelar]").click(function () {
                            defer.resolve(null);
                            diag.dialog("close");
                            diag.remove();
                        });

                        var resizeFunction = function () {
                            var promptHeight = promptBody.outerHeight() - 30;

                            promptBody.find(".k-grid").siblings(":visible").each(function (index, value) {
                                promptHeight -= $(value).outerHeight();
                            });

                            promptHeight--;
                            promptHeight--;
                            promptBody.find(".k-grid").height(promptHeight);

                            promptBody.find(".k-grid").children(":visible").not(".k-grid-content").each(function (index, value) {
                                promptHeight -= $(value).outerHeight();
                            });

                            promptHeight--;
                            promptBody.find(".k-grid-content").height(promptHeight);
                        };

                        resizeFunction();
                        promptBody.resize(resizeFunction);

                        promptBody.find("a.dropdown-item-button").click(function (obj) {
                            promptBody.find("[id=promptDropdownText]")[0].innerHTML = obj.currentTarget.innerText;
                            promptBody.find("[id=promptItem]").removeClass("active");
                            obj.currentTarget.parentElement.classList.add("active");
                        });

                        promptBody.find("input.dropdown-item-checkbox").click(function () {
                            if (event.stopPropagation) {
                                event.stopPropagation();
                            }
                            event.cancelBubble = true;
                        });

                        promptBody.find("li[id=dropdownItem]").click(function () {
                            var obj = $(this);
                            if (obj[0].children[0].children[0].checked) obj[0].children[0].children[0].checked = false;
                            else obj[0].children[0].children[0].checked = true;
                        });

                        promptBody.find("#promptInput").keyup(function (e) {
                            if (e.which == 13) {
                                promptBody.find("#btnPromptProcurar").click();
                            }
                        });

                        promptBody.find("#btnPromptProcurar").click(function () {
                            //Monta query dinamica
                            promptBody.find("#btnPromptProcurar").focus();
                            var sentencaSql = "Select * from ( " + sql + ") ss ";
                            var filtroSql = "";
                            var textoPesquisa = promptBody.find("[id=promptInput]").val();
                            if (textoPesquisa.trim() != "") {
                                var arrayItens = [];
                                arrayItens = textoPesquisa.split(",");
                                if (arrayItens[arrayItens.length - 1] == "") {
                                    arrayItens = arrayItens.splice(arrayItens.length - 2, 1);
                                }
                                filtroSql += " WHERE 1=1 ";
                                var possuiItem = false;
                                for (var i = 0; i < arrayItens.length; i++) {
                                    var arrayPesquisa = [];
                                    if (arrayItens[i].indexOf("\"") == 0) arrayPesquisa.push(arrayItens[i].substr(1, (arrayItens[i].length - 2)));
                                    else if (arrayItens[i].indexOf("/") > -1) arrayPesquisa.push(arrayItens[i]);
                                    else arrayPesquisa = arrayItens[i].split(" ");

                                    filtroSql += "AND ( 1<>1 ";
                                    $.each(promptBody.find("input.dropdown-item-checkbox"), function (index, obj) {
                                        if ($(obj).attr('checked')) {
                                            possuiItem = true;
                                            var tipo = "";
                                            for (var i = 0; i < _colunas.length; i++) {
                                                if (_colunas[i].col == obj.value) {
                                                    tipo = _colunas[i].tp;
                                                    break;
                                                }
                                            }

                                            if (tipo == "numero") {
                                                for (var j = 0; j < arrayPesquisa.length; j++) {
                                                    if (!isNaN(arrayPesquisa[j].replace(",", "."))) filtroSql += " OR " + obj.value + " = '" + parseInt(arrayPesquisa[j].replace(",", ".")) + "' ";
                                                }
                                            }
                                            else if (tipo == "moeda") {
                                                for (var j = 0; j < arrayPesquisa.length; j++) {
                                                    if (!isNaN(arrayPesquisa[j].replace(",", "."))) filtroSql += " OR " + obj.value + " = '" + arrayPesquisa[j].replace(".", ",") + "' ";
                                                }
                                            }
                                            else if (tipo == "data") {
                                                for (var j = 0; j < arrayPesquisa.length; j++) {
                                                    var arrayData = arrayPesquisa[j].split("/");
                                                    if (arrayData.length == 3) {
                                                        var d = new Date(arrayData[2], parseInt(arrayData[1]) - 1, arrayData[0]);
                                                        if (d.toString() != "Invalid Date") {
                                                            filtroSql += " OR Convert(varchar," + obj.value + ",103) = '" + ((((d.getDate() + "").length == 1 ? "0" : "")) + d.getDate() + '/' + ((((d.getMonth() + 1) + "").length == 1 ? "0" : "")) + (d.getMonth() + 1) + '/' + d.getFullYear()) + "' ";
                                                        }
                                                    }
                                                }
                                            }
                                            else if (tipo == "datahora") {
                                                for (var j = 0; j < arrayPesquisa.length; j++) {
                                                    if (arrayPesquisa[j].trim().length == 10) {
                                                        var arrayData = arrayPesquisa[j].split("/");
                                                        if (arrayData.length == 3) {
                                                            var d = new Date(arrayData[2], parseInt(arrayData[1]) - 1, arrayData[0]);
                                                            if (d.toString() != "Invalid Date") {
                                                                filtroSql += " OR (" + obj.value + " >= '" + ((((d.getDate() + "").length == 1 ? "0" : "")) + d.getDate() + '/' + ((((d.getMonth() + 1) + "").length == 1 ? "0" : "")) + (d.getMonth() + 1) + '/' + d.getFullYear()) + " 00:00:00' ";
                                                                filtroSql += " AND " + obj.value + " <= '" + ((((d.getDate() + "").length == 1 ? "0" : "")) + d.getDate() + '/' + ((((d.getMonth() + 1) + "").length == 1 ? "0" : "")) + (d.getMonth() + 1) + '/' + d.getFullYear()) + " 23:59:59.999') ";
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        var arrayData = arrayPesquisa[j].split(" ")[0].split("/");
                                                        var arrayHora = null;
                                                        if (arrayPesquisa[j].split(" ")[1]) arrayHora = arrayPesquisa[j].split(" ")[1].split(":");
                                                        if (arrayData.length == 3 && (arrayHora.length == 3 || !arrayHora)) {
                                                            var d = new Date(arrayData[2], parseInt(arrayData[1]) - 1, arrayData[0], arrayHora[0], arrayHora[1], arrayHora[2]);
                                                            if (d.toString() != "Invalid Date") {
                                                                if (arrayHora) {
                                                                    filtroSql += " OR " + obj.value + " = '" + ((((d.getDate() + "").length == 1 ? "0" : "")) + d.getDate() + '/' + ((((d.getMonth() + 1) + "").length == 1 ? "0" : "")) + (d.getMonth() + 1) + '/' + d.getFullYear()) +
                                                                        " " + (((d.getHours() + "").length == 1 ? "0" : "")) + d.getHours() + ":" + (((d.getMinutes() + "").length == 1 ? "0" : "")) + d.getMinutes() + ":" + (((d.getSeconds() + "").length == 1 ? "0" : "")) + d.getSeconds() + "' ";
                                                                }
                                                                else {
                                                                    filtroSql += " OR (" + obj.value + " >= '" + ((((d.getDate() + "").length == 1 ? "0" : "")) + d.getDate() + '/' + ((((d.getMonth() + 1) + "").length == 1 ? "0" : "")) + (d.getMonth() + 1) + '/' + d.getFullYear()) + " 00:00:00' ";
                                                                    filtroSql += " AND " + obj.value + " <= '" + ((((d.getDate() + "").length == 1 ? "0" : "")) + d.getDate() + '/' + ((((d.getMonth() + 1) + "").length == 1 ? "0" : "")) + (d.getMonth() + 1) + '/' + d.getFullYear()) + " 23:59:59.999') ";
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            else if (tipo == "flag") {
                                                for (var j = 0; j < arrayPesquisa.length; j++) {
                                                    if (arrayPesquisa[j] == "Não") {
                                                        arrayPesquisa[j] = 0;
                                                        filtroSql += " OR " + obj.value + " = '" + arrayPesquisa[j] + "' ";
                                                    }
                                                    else if (arrayPesquisa[j] == "Sim") {
                                                        arrayPesquisa[j] = 1;
                                                        filtroSql += " OR " + obj.value + " = '" + arrayPesquisa[j] + "' ";
                                                    }
                                                }
                                            }
                                            else {
                                                if (arrayPesquisa.length > 0) filtroSql += " OR ( ";
                                                for (var j = 0; j < arrayPesquisa.length; j++) {
                                                    if (j > 0) filtroSql += " AND "
                                                    filtroSql += obj.value + " LIKE '%" + arrayPesquisa[j] + "%' ";
                                                }
                                                if (arrayPesquisa.length > 0) filtroSql += " ) ";
                                            }
                                        }
                                    });
                                    filtroSql += ") "
                                }

                                //Adiciona filtro permanente
                                if (filtroPermanente && filtroPermanente != "") {
                                    filtroSql += " AND " + filtroPermanente + " ";
                                }

                                if (possuiItem) {
                                    if (sentencaSql.toLowerCase().indexOf("exec") < 0) {
                                        if (promptBody.find("[id=promptDropdownText]")[0].innerHTML != "Todos")
                                            sentencaSql += filtroSql + ordenacao + " OFFSET 0 ROWS FETCH NEXT " + promptBody.find("[id=promptDropdownText]")[0].innerHTML + " ROWS ONLY";
                                        else
                                            sentencaSql += filtroSql + ordenacao;
                                    }
                                    else {
                                        filtroSql = "'" + filtroSql.replaceAll("'", "''") + "'";
                                        sentencaSql = sql + "," + filtroSql + "," +
                                            (promptBody.find("[id=promptDropdownText]")[0].innerHTML != "Todos" ? "'" + promptBody.find("[id=promptDropdownText]")[0].innerHTML + "'" : "NULL");
                                    }

                                    data = Geeks.ERP.Core.Connection.ExecuteSQL(sentencaSql, structural);

                                    var grid = promptGrid.data('kendoGrid');
                                    var dataTable = grid.dataSource.data(data.Records);
                                    grid.refresh();
                                }
                                else {
                                    jAlert("Nenhuma coluna selecionada para pesquisa!", "Atenção");
                                }
                            }
                            promptBody.find("[id=promptInput_tag]").focus();
                        });

                    } else {
                        if (data) {
                            jAlert("Nenhum registro encontrado!", "Atenção");
                        } else {
                            diag.dialog("close");
                            jError("A rotina do prompt list retornou um dado inesperado. Verifique a sentença e as configurações do prompt list");
                        }
                    }
                } else {
                    promptBody.dialog('open');
                }

                return defer.promise();
            }
        },
        Show: function (callbackFunction) {

            this.Render().then(function (retorno) {

                if (callbackFunction) callbackFunction(retorno);

                return $.Deferred().resolve();
            });
        }
    }
};