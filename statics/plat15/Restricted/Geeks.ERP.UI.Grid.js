String.prototype.replaceAll = String.prototype.replaceAll || function (needle, replacement) {
  return this.split(needle).join(replacement);
};

function ExcelExport (e) {
  var rows = e.workbook.sheets[0].rows;
  var newRows = []
  for (var ri = 0; ri < rows.length; ri++) {
    var row = rows[ri];

    if (row.type == "group-footer" || row.type == "footer") {
      for (var ci = 0; ci < row.cells.length; ci++) {
        const cell = row.cells[ci]
        const value = cell?.value ?? ''
        const newValue = value
          .replace(`<div style='text-align: right'>`, '')
          .replace(`</div>`, '')

        const numberValue = Number(newValue
          .replace('Qtde: ', '')
          .replace(/\./g, '')
          .replace(',', '.'))

        cell.hAlign = 'right'
        cell.value = numberValue || ''
      }
    }

    if (row.type == "data") {
      row.cells.forEach(el => {
        if (!/\/Date\((\d{1,})\)\/$/.test(el.value)) return
        el.value = new Date(Number(el.value.replace(/\/Date\((\d{1,})\)\/$/, "$1")))
      })
    }

    newRows.push(row)
  }
  e.workbook.sheets[0].rows = newRows
}

(function () {
  Geeks.ERP.UI.Grid = new function () {
    var uiGrid = this;
    var uiTela = Geeks.ERP.UI.Tela;

    //#region ::. Adiciona os botões padrão da grade .::

    var adicionaBotoesToolbar = function (grid, options) {
      var toolbar = [];

      toolbar.push({
        name: "clean-filters",
        text: " ",
        width: '20px',
        iconClass: 'k-icon'
      });

      if (grid.Incluir)
        toolbar.push({
          name: "create",
          text: " ",
          width: '20px'
        });

      if (grid.Editar)
        toolbar.push({
          name: "edit",
          text: " ",
          width: '20px'
        });

      if (grid.Excluir)
        toolbar.push({
          name: "destroy",
          text: " ",
          width: '20px'
        });

      if (grid.Excel)
        toolbar.push({
          name: "excel",
          text: " ",
          width: '20px',
          iconClass: 'k-icon'
        });

      if (grid.MinimizarLinhas) {
        toolbar.push({
          name: "expand",
          text: " ",
          width: '20px',
          iconClass: 'k-icon'
        });

        toolbar.push({
          name: "collapse",
          text: " ",
          width: '20px',
          iconClass: 'k-icon'
        });
      }

      if ($("#hfUsuarioAdm").val() == "true" && $("#hfGrupoInterno").val() == "1") {
        toolbar.push({
          name: "layout",
          text: " ",
          width: '20px',
          iconClass: 'k-icon'
        });
      }

      var filteredToolbar = $.grep(options.toolbar, function (value) {
        return value.name.trim() == "";
      });

      $.each(filteredToolbar, function (index, value) {
        toolbar.push(value);
      });

      options.toolbar = toolbar;

      return options;
    };

    var adicionaEventosToolbar = function (gridMontar, grid, structural) {
      gridMontar.find(".k-button.k-button-icontext.k-grid-delete").off();
      gridMontar.find(".k-button.k-button-icontext.k-grid-edit").off();
      gridMontar.find(".k-button.k-button-icontext.k-grid-add").off();
      gridMontar.find(".k-button.k-button-icontext.k-grid-layout").off();
      gridMontar.find(".k-button.k-button-icontext.k-grid-expand").off();
      gridMontar.find(".k-button.k-button-icontext.k-grid-collapse").off();
      gridMontar.find(".k-button.k-button-icontext.k-grid-clean-filters").off();

      //Pop-Up do Botão Delete
      gridMontar.find(".k-button.k-button-icontext.k-grid-delete").click(function (e) {
        e.preventDefault();
        var gridB = gridMontar.data("kendoGrid");
        if (gridB.dataItem(gridB.select()))
          jConfirm("Deseja excluir este registro?", "Excluir?", function (anwser) {
            if (anwser)
              gridB.dataSource.transport.destroy(gridB.dataItem(gridB.select()));
          });
        else
          jError("Selecione uma linha para Excluí-la.", "Atenção");
      });

      //Pop-Up do Botão Editar
      gridMontar.find(".k-button.k-button-icontext.k-grid-edit").click(function (e) {
        e.preventDefault();
        var gridB = gridMontar.data("kendoGrid");
        if (gridB.dataItem(gridB.select()))
          uiGrid.EditaGrade(grid, gridMontar.parent(), gridB.dataItem(gridB.select()), "Editar", structural);
        else
          jError("Selecione uma linha para Editá-la.", "Atenção");

        return false;
      });

      //Pop-Up do Botão Novo
      gridMontar.find(".k-button.k-button-icontext.k-grid-add").click(function (e) {
        e.preventDefault();
        uiGrid.EditaGrade(grid, gridMontar.parent(), null, "Nova", structural);

        return false;
      });

      //Botão Excel
      gridMontar.find(".k-button.k-button-icontext.k-grid-excel").children().addClass('k-icon k-i-group');

      //Botão Expandir
      gridMontar.find(".k-button.k-button-icontext.k-grid-expand").children().addClass('k-icon icos-arrowdown');
      gridMontar.find(".k-button.k-button-icontext.k-grid-expand").click(function (e) {
        e.preventDefault();

        $.each(gridMontar.find(".k-grouping-row"), function () {
          gridMontar.data("kendoGrid").expandGroup(this);
        });

        return false;
      });

      //Botão Minimizar
      gridMontar.find(".k-button.k-button-icontext.k-grid-collapse").children().addClass('k-icon icos-arrowup');
      gridMontar.find(".k-button.k-button-icontext.k-grid-collapse").click(function (e) {
        e.preventDefault();

        $.each(gridMontar.find(".k-grouping-row"), function () {
          gridMontar.data("kendoGrid").collapseGroup(this);
        });

        return false;
      });

      // Botão Limpar filtro(s)
      gridMontar.find(".k-button.k-button-icontext.k-grid-clean-filters").children().addClass('k-icon k-i-filter');

      grid.Target.data('kendoGrid').dataSource.bind("change", () => {
        if (grid.Target.data('kendoGrid').dataSource.filter()) {
          grid.Target.find(".k-button.k-button-icontext.k-grid-clean-filters").css('display', 'block')
        } else {
          grid.Target.find(".k-button.k-button-icontext.k-grid-clean-filters").css('display', 'none')
        }
      })

      gridMontar.find(".k-button.k-button-icontext.k-grid-clean-filters").on('click', () => {
        jConfirm('Deseja limpar os filtro(s)?', '', answer => {
          if (answer) {
            grid.Target.data('kendoGrid').dataSource.filter({})
          }
        })
      })

      //Salvar Layout
      if ($("#hfUsuarioAdm").val() == "true" && $("#hfGrupoInterno").val() == "1") {
        gridMontar.find(".k-button.k-button-icontext.k-grid-layout").children().addClass('k-icon k-i-lock');
        gridMontar.find(".k-button.k-button-icontext.k-grid-layout").click(function () {
          var layoutGrade = grid.Target.data("kendoGrid").getOptions();
          var layoutGeeks = JSON.parse(grid.DtaLayout);

          if (!layoutGeeks)
            layoutGeeks = layoutGrade;

          var colunasGeeks = layoutGeeks.columns;

          $.each(layoutGrade.columns, function (index, value) {

            var colunaGeeks = $.grep(colunasGeeks, function (col) {
              return col.field == value.field;
            });

            if (colunaGeeks.length > 0) {
              $.each(colunaGeeks[0], function (fieldName, fieldValue) {
                if (fieldName != "width")
                  value[fieldName] = fieldValue;
              });
            }
          });

          layoutGeeks.columns = layoutGrade.columns;
          layoutGeeks.dataSource = layoutGrade.dataSource;
          layoutGeeks.filterable = layoutGrade.filterable;

          grid.DtaLayout = JSON.stringify(layoutGeeks);

          var currentLayout = grid.DtaLayout;

          var sql = "UPDATE GRID SET " +
            " Descricao = '" + grid.Descricao + "', " +
            " SentencaSQL = '" + grid.SentencaSQL.replace(/[']/g, "''") + "', " +
            " Editar = " + (grid.Editar ? 1 : 0) + ", " +
            " Excluir = " + (grid.Excluir ? 1 : 0) + ", " +
            " Incluir = " + (grid.Incluir ? 1 : 0) + ", " +
            " Excel = " + (grid.Excel ? 1 : 0) + ", " +
            " OrdenaGrade = " + (grid.OrdenaGrade ? 1 : 0) + ", " +
            " FiltraGrade = " + (grid.FiltraGrade ? 1 : 0) + ", " +
            " AgrupaGrade = " + (grid.AgrupaGrade ? 1 : 0) + ", " +
            " MinimizarLinhas = " + (grid.MinimizarLinhas ? 1 : 0) + ", " +
            " Paginacao = " + (grid.Paginacao ? 1 : 0) + ", " +
            " MultiRow = " + (grid.MultiRow ? 1 : 0) + ", " +
            " TabelaMaster = '" + grid.TabelaMaster + "', " +
            " ForeignKeyName = '" + grid.ForeignKeyName + "', " +
            " DtaLayout = '" + currentLayout.split("''").join("'").split("'").join("''") + "' " +
            " WHERE CodigoGrid = " + grid.CodigoGrid;

          Geeks.ERP.Core.Connection.ExecuteSQL(sql, true);

          //jAlert("Layout salvo com sucesso", "Atenção");
          $.jGrowl("Layout salvo com sucesso");
        });
      } else
        gridMontar.find(".k-button.k-button-icontext.k-grid-layout").remove();
    };

    //#endregion

    this.ExcelExport = ExcelExport

    this.Render = function (content, grid, popup, structural) {
      var layout = {};

      if (grid.DtaLayout)
        layout = JSON.parse(grid.DtaLayout);

      var tabela = grid.TabelaMaster;
      var arquivoTabelaMaster = "";
      var arquivoChaveMaster = grid.foreignKeyName;
      if (tabela.indexOf(",") > -1) {
        arquivoTabelaMaster = tabela.split(",")[1];
        tabela = tabela.split(",")[0];
      }

      var options = {
        columns: [],
        toolbar: []
      };

      if (!grid.Altura)
        grid.Altura = 200;

      if (grid.Admin)
        grid.Altura = 400;

      var paginacao = false;
      if (grid.Paginacao) {
        paginacao = {
          previousNext: true,
          numeric: true,
          pageSize: 50,
          pageSizes: false,
          messages: {
            display: "mostrando {0} - {1} de {2} registros"
          }
        }
      }

      var filtraGrade = false;
      if (grid.FiltraGrade) {
        filtraGrade = {
          mode: "menu",
          extra: true,
          operators: {
            string: {
              contains: "Contenha",
              doesnotcontain: "Não Contenha",
              eq: "Igual",
              neq: "Diferente",
              startswith: "Começa com",
              endswith: "Termina com"
            },
            number: {
              eq: "Igual",
              neq: "Diferente",
              gte: "Maior ou igual",
              gt: "Maior que",
              lte: "Menor ou igual",
              lt: "Menor que"
            },
            money: {
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
        }
      }

      adicionaBotoesToolbar(grid, options);

      //#region ::. Montando a Grade .::

      var gridMontar = $("<div name='kendogrid_" + grid.Descricao + "'/>");

      gridMontar.kendoGrid({
        autoBind: false,
        groupable: grid.AgrupaGrade,
        selectable: (grid.MultiRow == 1 ? "multiple" : "row"),//"multiple"
        reorderable: true,
        resizable: true,
        filterable: filtraGrade,
        sortable: grid.OrdenaGrade,
        refresh: true,
        pageable: paginacao,
        height: content.height(),
        editable: "popup",
        excel: {
          allPages: true
        },
        excelExport: ExcelExport
      })
        .appendTo(content);

      grid.Target = gridMontar;

      //#endregion

      //#region ::. Popula grade com todas as colunas .::

      var generateColumns = function (gridColumns) {
        var columns = [];

        if (!layout || !layout.columns) {
          for (var colIndex = 0; colIndex < gridColumns.length; colIndex++) {
            columns.push({
              field: gridColumns[colIndex].ColumnName,
              title: gridColumns[colIndex].ColumnName,
              hidden: false,
              condition: false,
              command: null
            });
          }
        } else {
          columns = $.grep(layout.columns, function (colunaLayout) {
            var col = $.grep(gridColumns, function (colunaGrade) {
              return colunaLayout.field == colunaGrade.ColumnName;
            });

            return col.length > 0;
          });

          for (var colIndex = 0; colIndex < gridColumns.length; colIndex++) {
            var col = $.grep(layout.columns, function (coluna) {
              return coluna.field == gridColumns[colIndex].ColumnName;
            });

            if (col.length <= 0) {
              var colunaAdicionada = {
                field: gridColumns[colIndex].ColumnName,
                title: gridColumns[colIndex].ColumnName,
                hidden: false,
                condition: false,
                command: null
              };

              columns.push(colunaAdicionada);
            }
          }
        }

        var aggregates = [];
        var groupAggregates = [];

        $.each(columns, function (index, col) {
          if (!col.width) {
            col.width = 100;
          }

          if (col.dropDownOptions) {
            col.template = function (dataItem) {
              var opcoes = col.dropDownOptions.split('\n');

              var optSelected = $.grep(opcoes, function (optValue) {
                return optValue.split('=')[0].trim() == dataItem[col.field];
              });

              if (optSelected.length > 0)
                return optSelected[0].split('=')[1].trim();

              return "DropDown Error";
            }
            col.filterable = [{ ui: "dropDownFilter" }];
            function dropDownFilter(element) {
              element.kendoDropDownList({
                dataSource: col.field,
                optionLabel: "--Selecione--"
              });
            }
          } else if (col.geeksType == "checagem") {
            col.template = function (dataItem) {
              if (dataItem[col.field] == 1 || dataItem[col.field] == "1" || dataItem[col.field] == true || dataItem[col.field] == "true")
                return "<div style=\"text-align: center\"><img src='./Content/Plugins/Aquincum/images/icons/usual/icon-check.png' alt='" + dataItem[col.field] + "'/></div>";
              else
                return " ";
            }
            col.groupHeaderTemplate = function (dataItem) {
              if (dataItem.value == "true") return col.title + ": Sim";
              else return col.title + ": Não";
            };
          } else if (col.geeksType == "data") {
            col.template = function (dataItem) {
              if (dataItem[col.field]) {
                dataItem[col.field] = new Date(kendo.parseDate(dataItem[col.field]).getTime());// - (new Date().getTimezoneOffset() * 60000) + (300 * 60000));
                return kendo.toString(dataItem[col.field], 'dd/MM/yyyy');
              }
              else
                return " ";
            }
            col.groupHeaderTemplate = "#= kendo.toString(kendo.parseDate(value), 'dd/MM/yyyy') #";
            col.format = "{0:dd/MM/yyyy}";
            col.filterable = [{ ui: "datepicker" }];

          } else if (col.geeksType == "datahora") {
            col.template = function (dataItem) {
              if (dataItem[col.field]) {
                dataItem[col.field] = new Date(kendo.parseDate(dataItem[col.field]).getTime());// - (new Date().getTimezoneOffset() * 60000) + (300 * 60000));
                return kendo.toString(dataItem[col.field], 'dd/MM/yyyy HH:mm:ss');
              }
              else
                return " ";
            }

            col.groupHeaderTemplate = "#= kendo.toString(kendo.parseDate(value), 'dd/MM/yyyy HH:mm:ss') #";
            col.format = "{0:dd/MM/yyyy HH:mm:ss}";
            col.filterable = [{ ui: "datetimepicker" }];

          } else if (col.geeksType == "valor") {
            col.template = function (dataItem) {
              if (dataItem[col.field])
                return kendo.toString(dataItem[col.field], 'n2');

              return "0,00";
            }
            col.groupHeaderTemplate = "#= kendo.toString(value, 'n2') #";
          }
          else if (col.geeksType == "valor4") {
            col.template = function (dataItem) {
              if (dataItem[col.field])
                return kendo.toString(dataItem[col.field], 'n4');

              return "0,0000";
            }
            col.groupHeaderTemplate = "#= kendo.toString(value, 'n4') #";
          }
          else if (col.geeksType == "numero") {
            col.template = function (dataItem) {
              if (dataItem[col.field])
                return (dataItem[col.field] + "").replace(".", ",");

              return "0";
            }
            //col.groupHeaderTemplate  = "#= kendo.toString(value, 'n3') #";
          } else if (col.geeksType == "data") {
            col.template = function (dataItem) {
              if (dataItem[col.field]) {
                dataItem[col.field] = new Date(kendo.parseDate(dataItem[col.field]).getTime());// - (new Date().getTimezoneOffset() * 60000) + (300 * 60000));
                return kendo.toString(dataItem[col.field], 'dd/MM/yyyy');
              }
              else
                return " ";
            }
            col.groupHeaderTemplate = "#= kendo.toString(kendo.parseDate(value), 'dd/MM/yyyy') #";
            col.format = "{0:dd/MM/yyyy}";
            col.filterable = [{ ui: "datepicker" }];

          } else if (col.geeksType == "datahora") {
            col.template = function (dataItem) {
              if (dataItem[col.field]) {
                dataItem[col.field] = new Date(kendo.parseDate(dataItem[col.field]).getTime());// - (new Date().getTimezoneOffset() * 60000) + (300 * 60000));
                return kendo.toString(dataItem[col.field], 'dd/MM/yyyy HH:mm:ss');
              }
              else
                return " ";
            }
            col.groupHeaderTemplate = "#= kendo.toString(kendo.parseDate(value), 'dd/MM/yyyy HH:mm:ss') #";
            col.format = "{0:dd/MM/yyyy HH:mm:ss}";
            col.filterable = [{ ui: "datetimepicker" }];
          } else if (col.geeksType == "arquivo") {
            col.template = function (dataItem) {
              if (dataItem[col.field]) {
                var arquivo = dataItem[col.field].split("#$#");
                return "<a href=\"" + arquivo[0] + "\" download=\"" + arquivo[1] + "\" title=\"Download do Arquivo\">" + arquivo[1] + "</a>";
              }

              return " ";
            }
          } else if (col.geeksType == "imagem") {
            col.template = function (dataItem) {
              if (dataItem[col.field]) {
                var arquivo = dataItem[col.field].split("#$#");
                if (arquivo[0].indexOf("image") > -1)
                  return "<img src=\"" + arquivo[0] + "\" style=\"max-height: 100px;\"></img>";
              }
              return " ";
            }
          } else {
            col.template = col.CustomTemplate ? col.CustomTemplate : null;
            //col.groupHeaderTemplate  = "#= kendo.toString(value, 'n0') #";
          }

          if (col.Alinhamento) {
            if (col.Alinhamento != "auto") {
              col.attributes = {
                style: "text-align: " + col.Alinhamento
              };
            } else {
              if (col.geeksType == "valor" || col.geeksType == "valor4" || col.geeksType == "numero") {
                col.attributes = {
                  style: "text-align: right"
                };
              } else {
                col.attributes = {
                  style: "text-align: left"
                };
              }
            }
          }
          else
            col.attributes = null;

          if (col.Sumarizacao) {
            if (col.SumarizaNoGrupo) {
              if (col.TemplateSumarizacao) {
                col.groupFooterTemplate = col.TemplateSumarizacao;
              } else {
                if (col.geeksType == "valor" && col.OperacaoSumarizacao != "count") {
                  col.groupFooterTemplate = "<div style='text-align: right'>#: kendo.toString(" + col.OperacaoSumarizacao + ", 'n2') #</div>";
                } else if (col.geeksType == "valor4" && col.OperacaoSumarizacao != "count") {
                  col.groupFooterTemplate = "<div style='text-align: right'>#: kendo.toString(" + col.OperacaoSumarizacao + ", 'n4') #</div>";
                } else if (col.geeksType == "numero" && col.OperacaoSumarizacao != "count") {
                  col.groupFooterTemplate = "<div style='text-align: right'>#: " + col.OperacaoSumarizacao + " #</div>";
                } else {
                  col.groupFooterTemplate = "#: " + col.OperacaoSumarizacao + " #";
                }
              }
            } else {
              col.groupFooterTemplate = null;
            }

            if (col.SumarizaNoRodape) {
              if (col.TemplateSumarizacao) {
                col.footerTemplate = col.TemplateSumarizacao;
              } else {
                if (col.geeksType == "valor" && col.OperacaoSumarizacao != "count") {
                  col.footerTemplate = "<div style='text-align: right'>#: kendo.toString(" + col.OperacaoSumarizacao + ", 'n2') #</div>";
                } else if (col.geeksType == "valor4" && col.OperacaoSumarizacao != "count") {
                  col.footerTemplate = "<div style='text-align: right'>#: kendo.toString(" + col.OperacaoSumarizacao + ", 'n4') #</div>";
                } else if (col.geeksType == "numero" && col.OperacaoSumarizacao != "count") {
                  col.footerTemplate = "<div style='text-align: right'>#: " + col.OperacaoSumarizacao + " #</div>";
                } else {
                  col.footerTemplate = "#: " + col.OperacaoSumarizacao + " #";
                }
              }
              groupAggregates.push({
                field: col.field,
                aggregate: col.OperacaoSumarizacao
              });
            } else {
              col.footerTemplate = null;
            }

            col.aggregates = [col.OperacaoSumarizacao]

            aggregates.push({
              field: col.field,
              aggregate: col.OperacaoSumarizacao
            });
          } else {
            col.groupFooterTemplate = null;
            col.footerTemplate = null;
            col.aggregates = null;
          }
        });

        return columns;
      }

      var geeksDataSource = new kendo.data.DataSource({
        transport: {
          read: function (readResponse) {

            if (!gridMontar.data("kendoGrid").Disconnected && gridMontar.data("kendoGrid").sentenceSql()) {
              var connection = Geeks.ERP.Core.Connection.ExecuteSQL(gridMontar.data("kendoGrid").sentenceSql(), structural);

              if (connection) {
                if (connection.Columns) {
                  gridMontar.data("kendoGrid").dataSource.options.schema.model = uiGrid.GenerateModel(layout, connection.Columns);

                  options.columns = generateColumns(connection.Columns);
                } else {
                  jError("Houve um problema na sentença, por favor, verifique!", "Erro na Sentença");
                }

                readResponse.success(connection.Records);
              } else {
                readResponse.success([]);
              }
            }
          },
          create: function (options) {
            if (!gridMontar.data("kendoGrid").Disconnected) {

              if (gridMontar.data("kendoGrid").BeforeCreate) {
                if (gridMontar.data("kendoGrid").BeforeCreate(gridMontar.data("kendoGrid"), options)) {
                  return false;
                }
              }

              if (gridMontar.data("kendoGrid").BeforeUpdate) {
                if (gridMontar.data("kendoGrid").BeforeUpdate(gridMontar.data("kendoGrid"), options)) {
                  return false;
                }
              }

              var campos = "";
              var valores = "";

              $.each(layout.columns, function (indice, gridCampo) {
                if (options.hasOwnProperty(gridCampo.field) || (gridCampo.geeksType == "selecao" && options.hasOwnProperty(gridCampo.field + "1"))) {
                  if (gridCampo.field && gridCampo.GravaCampoNoBanco && !gridCampo.Identificador) {
                    campos += ((campos == "") ? "" : ",") + gridCampo.field;

                    if (!options[gridCampo.field] && gridCampo.field == gridMontar.data("kendoGrid").foreignKeyName) {
                      if (gridCampo.geeksType == 'checagem')
                        valores += (valores == "" ? "" : ",") + ((options[gridCampo.field] == 0 || options[gridCampo.field] == null || options[gridCampo.field] == false || options[gridCampo.field] == "false") ? 0 : 1);
                      else if (gridCampo.geeksType == 'numero' || gridCampo.geeksType == 'valor' || gridCampo.geeksType == 'valor4')
                        valores += (valores == "" ? "" : ",") + ((gridMontar.data("kendoGrid").foreignKeyValue) ? "'" + gridMontar.data("kendoGrid").foreignKeyValue + "'" : "0");
                      else
                        valores += (valores == "" ? "" : ",") + ((gridMontar.data("kendoGrid").foreignKeyValue) ? "'" + gridMontar.data("kendoGrid").foreignKeyValue + "'" : "null");
                    } else if (!options[gridCampo.field] && gridCampo.field == 'CodigoGrid' && prompt == 'promptBotAdm') {
                      var codigoGrid = Geeks.ERP.Core.Connection.ExecuteSQL("Select CodigoGrid from Grid Where CodigoSessao = " + gridMontar.data("kendoGrid").foreignKeyValue, structural).Records[0].CodigoGrid;
                      valores += ((valores == "") ? "" : ",") + ((codigoGrid) ? codigoGrid : 0);
                    } else {
                      if (!gridCampo.Identificador) {
                        if (gridCampo.field == "TabelaMaster" && arquivoTabelaMaster != "") {
                          valores += ((valores == "") ? "" : ",") + "'" + arquivoTabelaMaster + "'";
                        } else if (gridCampo.geeksType == 'selecao' && !options[gridCampo.field + "1"] && !gridCampo.Obrigatorio && gridCampo.geeksType != "checagem") {
                          valores += ((valores == "") ? "" : ",") + "null";
                        } else if (gridCampo.geeksType != 'selecao' && !options[gridCampo.field] && !gridCampo.Obrigatorio && gridCampo.geeksType != "checagem") {
                          valores += ((valores == "") ? "" : ",") + "null";
                        } else {
                          if (gridCampo.geeksType == 'senha') {
                            valores += ((valores == "") ? "" : ",") + ((options[gridCampo.field] && options[gridCampo.field] != 'null') ? "'" + calcMD5(options[gridCampo.field]) + "'" : null);
                          }
                          else if (gridCampo.geeksType == 'checagem')
                            valores += ((valores == "") ? "" : ",") + ((options[gridCampo.field] == 0 || options[gridCampo.field] == null || options[gridCampo.field] == false || options[gridCampo.field] == "false") ? 0 : 1);
                          else if (gridCampo.geeksType == 'numero' || gridCampo.geeksType == 'valor' || gridCampo.geeksType == 'valor4')
                            valores += ((valores == "") ? "" : ",") + (options[gridCampo.field] ? "" + options[gridCampo.field].replaceAll(".", "").replace(",", ".") + "" : "0");
                          else if (gridCampo.geeksType == 'selecao')
                            valores += ((valores == "") ? "" : ",") + ((options[gridCampo.field + "1"] && options[gridCampo.field + "1"] != 'null') ? "'" + options[gridCampo.field + "1"] + "'" : null);
                          else if (gridCampo.geeksType == 'datahora' || gridCampo.geeksType == 'data')
                            valores += ((valores == "") ? "" : ",") + ((options[gridCampo.field] && options[gridCampo.field] != 'null' && options[gridCampo.field].trim() != '') ? "'" + options[gridCampo.field] + "'" : null);
                          else
                            valores += ((valores == "") ? "" : ",") + ((options[gridCampo.field] && options[gridCampo.field] != 'null') ? "'" + options[gridCampo.field] + "'" : null);
                        }
                      }
                    }
                  }
                }
              });

              if (campos != "") {
                var SQLINS = "INSERT INTO " + tabela + "(" + campos + ")VALUES(" + valores + ");";

                if (Geeks.ERP.Core.Connection.ExecuteSQL(SQLINS, structural).RecordsAffected > 0) {
                  gridMontar.data("kendoGrid").Fill();
                }
              }

              if (gridMontar.data("kendoGrid").AfterCreate)
                gridMontar.data("kendoGrid").AfterCreate(gridMontar.data("kendoGrid"), options);

              if (gridMontar.data("kendoGrid").AfterUpdate)
                gridMontar.data("kendoGrid").AfterUpdate(gridMontar.data("kendoGrid"), options);

              return true;
            }
          },
          update: function (options) {
            if (!gridMontar.data("kendoGrid").Disconnected) {
              if (gridMontar.data("kendoGrid").BeforeUpdate) {
                if (gridMontar.data("kendoGrid").BeforeUpdate(gridMontar.data("kendoGrid"), options)) {
                  return false;
                }
              }

              var campos = "";
              var where = "";

              $.each(layout.columns, function (keygrid, campoGrid) {
                if (options.hasOwnProperty(campoGrid.field) || (campoGrid.geeksType == "selecao" && options.hasOwnProperty(campoGrid.field + "1"))) {
                  if (campoGrid.field && (campoGrid.GravaCampoNoBanco || campoGrid.Identificador)) {
                    if (campoGrid.GravaCampoNoBanco && !campoGrid.Identificador) {
                      if (campoGrid.geeksType == 'selecao' && !options[campoGrid.field + "1"] && !campoGrid.Obrigatorio && campoGrid.geeksType != "checagem") {
                        campos += ((campos == "") ? "" : ",") + campoGrid.field + "= null";
                      }
                      else if (campoGrid.geeksType != 'selecao' && !options[campoGrid.field] && !campoGrid.Obrigatorio && campoGrid.geeksType != "checagem") {
                        campos += ((campos == "") ? "" : ",") + campoGrid.field + "= null";
                      }
                      else {
                        if (campoGrid.geeksType == 'senha') {
                          campos += ((campos == "") ? "" : ",") + campoGrid.field + "=" + ((options[campoGrid.field] && options[campoGrid.field] != 'null') ? "'" + calcMD5(options[campoGrid.field]) + "'" : null);
                        }
                        else if (campoGrid.geeksType == 'checagem')
                          campos += ((campos == "") ? "" : ",") + campoGrid.field + "=" + ((options[campoGrid.field] == 0 || options[campoGrid.field] == null || options[campoGrid.field] == false || options[campoGrid.field] == "false") ? 0 : 1);
                        else if (campoGrid.geeksType == 'numero' || campoGrid.geeksType == 'valor' || campoGrid.geeksType == 'valor4')
                          campos += ((campos == "") ? "" : ",") + campoGrid.field + "=" + ((options[campoGrid.field]) ? "" + options[campoGrid.field].replaceAll(".", "").replace(",", ".") + "" : "0");
                        else if (campoGrid.geeksType == 'selecao')
                          campos += ((campos == "") ? "" : ",") + campoGrid.field + "=" + ((options[campoGrid.field + "1"] && options[campoGrid.field + "1"] != 'null') ? "'" + options[campoGrid.field + "1"].replace(/'/g, "''") + "'" : "null");
                        else if (campoGrid.geeksType == 'datahora' || campoGrid.geeksType == 'data')
                          campos += ((campos == "") ? "" : ",") + campoGrid.field + "=" + ((options[campoGrid.field] && options[campoGrid.field] != 'null' && options[campoGrid.field].trim() != '') ? "'" + options[campoGrid.field].replace(/'/g, "''") + "'" : "null");
                        else
                          campos += ((campos == "") ? "" : ",") + campoGrid.field + "=" + ((options[campoGrid.field] && options[campoGrid.field] != 'null') ? "'" + options[campoGrid.field].replace(/'/g, "''") + "'" : "null");
                      }
                    } else if (campoGrid.Identificador) {
                      if (options[campoGrid.field] != "")
                        where += ((where == "") ? " WHERE " : " AND ") + campoGrid.field + "='" + options[campoGrid.field] + "'";
                    }
                  }
                }
              });

              if (where) {
                var whereArquivo = "";
                if (arquivoTabelaMaster != "") whereArquivo = " AND TabelaMaster = '" + arquivoTabelaMaster + "'";
                var SQLUP = "UPDATE " + tabela + " SET " + campos + where + whereArquivo;

                var resultUpdate = Geeks.ERP.Core.Connection.ExecuteSQL(SQLUP, structural);

                if (resultUpdate) {
                  if (resultUpdate.RecordsAffected > 0) {
                    gridMontar.data("kendoGrid").Fill();
                  }

                  if (gridMontar.data("kendoGrid").AfterUpdate)
                    gridMontar.data("kendoGrid").AfterUpdate(gridMontar.data("kendoGrid"), options);
                }
              } else {
                console.warn("Erro na sintaxe update. Fantando parâmetros where", "Atenção");
                if (gridMontar.data("kendoGrid").AfterUpdate)
                  gridMontar.data("kendoGrid").AfterUpdate(gridMontar.data("kendoGrid"), options);
              }
              return true;
            }
          },
          destroy: function (options) {
            if (!gridMontar.data("kendoGrid").Disconnected) {
              if (gridMontar.data("kendoGrid").BeforeDelete) {
                if (gridMontar.data("kendoGrid").BeforeDelete(gridMontar.data("kendoGrid"), options)) {
                  return;
                }
              }

              var where = "";

              $.each(layout.columns, function (keygrid, campogrid) {
                if (options.hasOwnProperty(campogrid.field)) {
                  if (campogrid.Identificador) {
                    if (options[campogrid.field] != null && options[campogrid.field] != '' && options[campogrid.field] != 'null')
                      where += ((where == "") ? " WHERE " : " AND ") + campogrid.field + "='" + options[campogrid.field] + "'";
                  }
                }
              });

              if (where == "") {
                jAlert('Coluna identificador ausente. Verifique as configurações da grade!', "Atenção");
                return;
              }

              try {
                var whereArquivo = "";
                if (arquivoTabelaMaster != "") whereArquivo = " AND TabelaMaster = '" + arquivoTabelaMaster + "'";

                if (Geeks.ERP.Core.Connection.ExecuteSQL("DELETE FROM " + tabela + " " + where + whereArquivo, structural).RecordsAffected > 0) {
                  gridMontar.data("kendoGrid").Fill();

                  if (gridMontar.data("kendoGrid").AfterDelete)
                    gridMontar.data("kendoGrid").AfterDelete(gridMontar.data("kendoGrid"), options);
                }
              } catch (ex) {
                jError(ex.message, "Atenção");
              }
            }
          }
        },
        schema: {
          model: {}
        },
        sort: layout.dataSource ? layout.dataSource.sort : [],
        group: function () {
          if (!layout.dataSource)
            return [];

          var grupos = layout.dataSource.group;

          if (layout.dataSource.aggregate)
            $.each(grupos, function (index, grupo) {
              grupo.aggregates = layout.dataSource.aggregate;
            });

          return grupos;
        }(),
        aggregate: layout.dataSource ? layout.dataSource.aggregate : [],
      });

      //#endregion

      //#region ::. Finaliza a Grade .::

      gridMontar.data("kendoGrid").filter = "1 = 0";
      gridMontar.data("kendoGrid").foreignKeyName = grid.ForeignKeyName;
      gridMontar.data("kendoGrid").foreignKeyValue = "";
      gridMontar.data("kendoGrid").sentenceSql = function () { return "SELECT * FROM (" + grid.SentencaSQL + ") ss " + (gridMontar.data("kendoGrid").filter ? " WHERE " + gridMontar.data("kendoGrid").filter : ""); };
      gridMontar.data("kendoGrid").BeforeDelete = null;
      gridMontar.data("kendoGrid").AfterDelete = null;
      gridMontar.data("kendoGrid").BeforeUpdate = null;
      gridMontar.data("kendoGrid").BeforeCreate = null;
      gridMontar.data("kendoGrid").AfterUpdate = null;
      gridMontar.data("kendoGrid").AfterCreate = null;
      gridMontar.data("kendoGrid").AfterFill = null;

      gridMontar.data("kendoGrid").Fill = function () {
        gridMontar.data("kendoGrid").dataSource.read();
        gridMontar.data("kendoGrid").refresh();

        if (gridMontar.data("kendoGrid").pager) {
          gridMontar.data("kendoGrid").dataSource.pageSize(50);
          gridMontar.data("kendoGrid").dataSource.page(1);
          gridMontar.data("kendoGrid").pager.refresh();
        }

        gridMontar.find(".k-grid-toolbar > a").not(".k-grid-layout").css("display", (gridMontar.data("kendoGrid").filter == "1 = 0" ? "none" : "block"));

        // Limpar filtro(s)
        gridMontar.find(".k-grid-toolbar > a.k-grid-clean-filters").css('display', 'none')
        if (grid.Target.data('kendoGrid').dataSource.filter()) {
          grid.Target.find(".k-button.k-button-icontext.k-grid-clean-filters").css('display', 'block')
        } else {
          grid.Target.find(".k-button.k-button-icontext.k-grid-clean-filters").css('display', 'none')
        }

        if (gridMontar.data("kendoGrid").AfterFill)
          gridMontar.data("kendoGrid").AfterFill(gridMontar.data("kendoGrid"), options);
      };

      //gridMontar.data("kendoGrid").FillByForeignKey = function (foreignKeyValue) {
      //    if (grid.ForeignKeyName) {
      //        gridMontar.data("kendoGrid").foreignKeyValue = foreignKeyValue;
      //        gridMontar.data("kendoGrid").filter = grid.ForeignKeyName + " = '" + foreignKeyValue + "'";

      //        gridMontar.data("kendoGrid").dataSource.read();
      //        gridMontar.data("kendoGrid").refresh();

      //        gridMontar.find(".k-grid-toolbar > a").not(".k-grid-layout").css("display", (gridMontar.data("kendoGrid").filter == "1 = 0" ? "none" : "block"));
      //    }
      //};

      gridMontar.data("kendoGrid").Disconnected = false;

      gridMontar.data("kendoGrid", gridMontar.data("kendoGrid"));

      var gridParent = gridMontar.parents(".widget");

      if (popup)
        gridParent = gridMontar.parents(".wrapper").parent();

      var resizeFunction = function () {
        var componenteGridHeight = gridParent.outerHeight();

        if (popup) {
          gridParent.find(".k-grid").parents(".wrapper").siblings(":visible").each(function (index, value) {
            componenteGridHeight -= $(value).outerHeight();
          });
        } else {
          gridParent.find(".body").siblings(":visible").each(function (index, value) {
            componenteGridHeight -= $(value).outerHeight();
          });
        }

        componenteGridHeight -= 2;

        componenteGridHeight -= 2;
        gridParent.find(".k-grid").height(componenteGridHeight);

        gridParent.find(".k-grid").children(":visible").not(".k-grid-content").each(function (index, value) {
          componenteGridHeight -= $(value).outerHeight();
        });

        componenteGridHeight--;
        gridParent.find(".k-grid-content").height(componenteGridHeight);
      };

      gridMontar.data("kendoGrid").setDataSource(geeksDataSource);
      gridMontar.data("kendoGrid").Fill();
      gridMontar.data("kendoGrid").setOptions(options);

      gridMontar.find(".k-grid-toolbar > a").not(".k-grid-layout").css("display", "none");

      //#endregion

      ////#region ::. Rotinas para os Toolbars

      ////Pop-Up do Botão Delete
      //gridMontar.find(".k-button.k-button-icontext.k-grid-delete").click(function () {
      //    var gridB = gridMontar.data("kendoGrid");
      //    if (gridB.dataItem(gridB.select()))
      //        gridB.dataSource.transport.destroy(gridB.dataItem(gridB.select()));
      //    else
      //        jError("Selecione uma linha para Excluí-la.", "Atenção");
      //});

      ////Pop-Up do Botão Editar
      //gridMontar.find(".k-button.k-button-icontext.k-grid-edit").click(function (e) {
      //    e.preventDefault();
      //    var gridB = gridMontar.data("kendoGrid");
      //    if (gridB.dataItem(gridB.select()))
      //        uiGrid.EditaGrade(grid, gridMontar.parent(), gridB.dataItem(gridB.select()), "Editar", structural);
      //    else
      //        jError("Selecione uma linha para Editá-la.", "Atenção");
      //    return false;
      //});

      ////Pop-Up do Botão Novo
      //gridMontar.find(".k-button.k-button-icontext.k-grid-add").click(function (e) {
      //    e.preventDefault();
      //    uiGrid.EditaGrade(grid, gridMontar.parent(), null, "Nova", structural);
      //    return false;
      //});

      //if (grid.Excel) {
      //    //Botão Excel
      //    $(".k-button.k-button-icontext.k-grid-excel").children().addClass('k-icon k-i-group');
      //}

      ////#endregion

      //#region ::. Resize Final .::

      resizeFunction();
      gridParent.resize(resizeFunction);

      //#endregion

      var remontaLayout = function () {

        var layoutRemontar = gridMontar.data("kendoGrid").getOptions();

        var filtraGrade = false;
        if (grid.FiltraGrade) {
          filtraGrade = {
            mode: "menu",
            extra: true,
            operators: {
              string: {
                contains: "Contenha",
                doesnotcontain: "Não Contenha",
                eq: "Igual",
                neq: "Diferente",
                startswith: "Começa com",
                endswith: "Termina com"
              },
              number: {
                eq: "Igual",
                neq: "Diferente",
                gte: "Maior ou igual",
                gt: "Maior que",
                lte: "Menor ou igual",
                lt: "Menor que"
              },
              money: {
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
          }
        }
        layoutRemontar.filterable = filtraGrade;

        var aggregates = [];
        var groupAggregates = [];

        $.each(layoutRemontar.columns, function (index, col) {
          if (col.geeksType == "prompt" && col.campoForeignKeyPrompt) {
            var colForeignKey = $.grep(layoutRemontar.columns, function (colforeignkey) {
              return colforeignkey.field == col.campoForeignKeyPrompt;
            });

            if (colForeignKey.length > 0) {
              colForeignKey[0].hidden = true;
            }
          } else if (col.geeksType == "selecao") {
            if (col.dropDownOptions) {
              col.dropDownOptions = col.dropDownOptions.replace(/\\[n]/g, '\n');
            }
          }

          if (col.dropDownOptions) {
            col.template = function (dataItem) {
              var opcoes = col.dropDownOptions.split('\n');

              var optSelected = $.grep(opcoes, function (optValue) {
                return optValue.split('=')[0].trim() == dataItem[col.field];
              });

              if (optSelected.length > 0)
                return optSelected[0].split('=')[1].trim();

              return "DropDown Error";
            }
            col.filterable = [{ ui: "dropDownFilter" }];
            function dropDownFilter(element) {
              element.kendoDropDownList({
                dataSource: col.field,
                optionLabel: "--Selecione--"
              });
            }
          } else if (col.geeksType == "checagem") {
            col.template = function (dataItem) {
              if (dataItem[col.field] == 1 || dataItem[col.field] == "1" || dataItem[col.field] == true || dataItem[col.field] == "true")
                return "<div style=\"text-align: center\"><img src='./Content/Plugins/Aquincum/images/icons/usual/icon-check.png' alt='" + dataItem[col.field] + "'/></div>";
              else
                return " ";
            }
            col.groupHeaderTemplate = function (dataItem) {
              if (dataItem.value == "true") return col.title + ": Sim";
              else return col.title + ": Não";
            };
          } else if (col.geeksType == "valor") {
            col.template = function (dataItem) {
              if (dataItem[col.field])
                return kendo.toString(dataItem[col.field], 'n2');

              return "0,00";
            }
            col.groupHeaderTemplate = "#= kendo.toString(value, 'n2') #";
          } else if (col.geeksType == "valor4") {
            col.template = function (dataItem) {
              if (dataItem[col.field])
                return kendo.toString(dataItem[col.field], 'n4');

              return "0,00";
            }
            col.groupHeaderTemplate = "#= kendo.toString(value, 'n4') #";
          } else if (col.geeksType == "numero") {
            col.template = function (dataItem) {
              if (dataItem[col.field])
                return (dataItem[col.field] + "").replace(".", ",");

              return "0";
            }
            //col.groupHeaderTemplate  = "#= kendo.toString(value, 'n3') #";
          } else if (col.geeksType == "data") {
            col.template = function (dataItem) {
              if (dataItem[col.field]) {
                dataItem[col.field] = new Date(kendo.parseDate(dataItem[col.field]).getTime());// - (new Date().getTimezoneOffset() * 60000) + (300 * 60000));
                return kendo.toString(dataItem[col.field], 'dd/MM/yyyy');
              }
              else
                return " ";
            }
            col.groupHeaderTemplate = "#= kendo.toString(kendo.parseDate(value), 'dd/MM/yyyy') #";
            col.format = "{0:dd/MM/yyyy}";
            col.filterable = [{ ui: "datepicker" }];

          } else if (col.geeksType == "datahora") {
            col.template = function (dataItem) {
              if (dataItem[col.field]) {
                dataItem[col.field] = new Date(kendo.parseDate(dataItem[col.field]).getTime());// - (new Date().getTimezoneOffset() * 60000) + (300 * 60000));
                return kendo.toString(dataItem[col.field], 'dd/MM/yyyy HH:mm:ss');
              }
              else
                return " ";
            }
            col.groupHeaderTemplate = "#= kendo.toString(kendo.parseDate(value), 'dd/MM/yyyy HH:mm:ss') #";
            col.format = "{0:dd/MM/yyyy HH:mm:ss}";
            col.filterable = [{ ui: "datetimepicker" }];
          } else if (col.geeksType == "arquivo") {
            col.template = function (dataItem) {
              if (dataItem[col.field]) {
                var arquivo = dataItem[col.field].split("#$#");
                return "<a href=\"" + arquivo[0] + "\" download=\"" + arquivo[1] + "\" title=\"Download do Arquivo\">" + arquivo[1] + "</a>";
              }

              return " ";
            }
          } else if (col.geeksType == "imagem") {
            col.template = function (dataItem) {
              if (dataItem[col.field]) {
                var arquivo = dataItem[col.field].split("#$#");
                if (arquivo[0].indexOf("image") > -1)
                  return "<img src=\"" + arquivo[0] + "\" style=\"max-height: 100px;\"></img>";
              }

              return " ";
            }
          } else {
            col.template = col.CustomTemplate ? col.CustomTemplate : false;
            //col.groupHeaderTemplate  = "#= kendo.toString(value, 'n0') #";
          }

          if (col.Alinhamento) {
            if (col.Alinhamento != "auto") {
              col.attributes = {
                style: "text-align: " + col.Alinhamento
              };
            } else {
              if (col.geeksType == "valor" || col.geeksType == "valor4" || col.geeksType == "numero") {
                col.attributes = {
                  style: "text-align: right"
                };
              } else {
                col.attributes = {
                  style: "text-align: left"
                };
              }
            }
          }
          else
            col.attributes = null;

          if (col.Sumarizacao) {
            if (col.SumarizaNoGrupo) {
              if (col.TemplateSumarizacao) {
                col.groupFooterTemplate = col.TemplateSumarizacao;
              } else {
                if (col.geeksType == "valor" && col.OperacaoSumarizacao != "count") {
                  col.groupFooterTemplate = "<div style='text-align: right'>#: kendo.toString(" + col.OperacaoSumarizacao + ", 'n2') #</div>";
                } else if (col.geeksType == "valor4" && col.OperacaoSumarizacao != "count") {
                  col.groupFooterTemplate = "<div style='text-align: right'>#: kendo.toString(" + col.OperacaoSumarizacao + ", 'n4') #</div>";
                } else if (col.geeksType == "numero" && col.OperacaoSumarizacao != "count") {
                  col.groupFooterTemplate = "<div style='text-align: right'>#: " + col.OperacaoSumarizacao + " #</div>";
                } else {
                  col.groupFooterTemplate = "#: " + col.OperacaoSumarizacao + " #";
                }
              }
            } else {
              col.groupFooterTemplate = null;
            }

            if (col.SumarizaNoRodape) {
              if (col.TemplateSumarizacao) {
                col.footerTemplate = col.TemplateSumarizacao;
              } else {
                if (col.geeksType == "valor" && col.OperacaoSumarizacao != "count") {
                  col.footerTemplate = "<div style='text-align: right'>#: kendo.toString(" + col.OperacaoSumarizacao + ", 'n2') #</div>";
                } else if (col.geeksType == "valor4" && col.OperacaoSumarizacao != "count") {
                  col.footerTemplate = "<div style='text-align: right'>#: kendo.toString(" + col.OperacaoSumarizacao + ", 'n4') #</div>";
                } else if (col.geeksType == "numero" && col.OperacaoSumarizacao != "count") {
                  col.footerTemplate = "<div style='text-align: right'>#: " + col.OperacaoSumarizacao + " #</div>";
                } else {
                  col.footerTemplate = "#: " + col.OperacaoSumarizacao + " #";
                }
              }
              groupAggregates.push({
                field: col.field,
                aggregate: col.OperacaoSumarizacao
              });
            } else {
              col.footerTemplate = null;
            }

            col.aggregates = [col.OperacaoSumarizacao]

            aggregates.push({
              field: col.field,
              aggregate: col.OperacaoSumarizacao
            });
          } else {
            col.groupFooterTemplate = null;
            col.footerTemplate = null;
            col.aggregates = null;
          }
        });

        if (aggregates.length > 0) layout.dataSource.aggregate = aggregates;
        if (groupAggregates.length > 0 && layout.dataSource.group[0]) layout.dataSource.group[0].aggregates = groupAggregates;

        gridMontar.data("kendoGrid").setOptions(layoutRemontar);
        grid.DtaLayout = JSON.stringify(layoutRemontar);
      };
      remontaLayout();
      adicionaEventosToolbar(gridMontar, grid, structural);
      gridMontar.data("kendoGrid").Fill();
    };

    this.EditaGrade = function (grid, sender, row, method, structural) {
      var campos = [];
      var layout = JSON.parse(grid.DtaLayout);

      if (!layout)
        layout = grid.Target.data("kendoGrid").getOptions();

      $.each(layout.columns, function (index, campo) {
        //if (layout.dataSource.schema.model.fields.hasOwnProperty(campo.field)) {
        //var field = layout.dataSource.schema.model.fields[campo.field];

        var campoAdicionado = {
          CodigoCampo: 1,
          CodigoSessao: 1,
          Label: campo.title,
          Id: campo.field,
          TipoCampo: campo.geeksType != null ? campo.geeksType : "texto",
          Obrigatorio: campo.Obrigatorio,
          Identificador: campo.Identificador,
          SentencaSQL: campo.dropDownOptions,
          Ordem: index,
          LabelLargura: 3,
          CampoLargura: 9,
          Leitura: campo.Leitura,
          CampoForeignKeyPrompt: campo.campoForeignKeyPrompt,
          Visivel: campo.Obrigatorio ? campo.Obrigatorio : !campo.hidden
        };

        campos.push(campoAdicionado);
        //}
      });

      var obj = {
        Descricao: "Editar Linha",
        CodigoObjeto: grid.CodigoGrid,
        NomeObjeto: grid.Descricao,
        CodigoPersonalizado: grid.CodigoPersonalizado,
        Estrutural: structural,
        Sessoes: [
          {
            CodigoSessao: 1,
            TipoSessao: "unica",
            Ordem: 1
          }],
        Campos: campos,
        Record: row,
        Botoes: [
          {
            Nome: "Salvar",
            Valor: "Salvar",
            CodigoBotao: "S1",
            Icone: "icon-checkmark"
          },
          {
            Nome: "Cancelar",
            Valor: "Cancelar",
            CodigoBotao: "S2",
            Icone: "icon-minus"
          }
        ]
      }

      var gradeBody = uiTela.OpenWindow("gridEdit", sender, obj, null, true);
      gradeBody.find(".fluid").css("padding-bottom", "20px");

      var diag = gradeBody.dialog({
        modal: true,
        width: 600,
        height: 600,
        resizable: true,
        closeOnEscape: false,
        close: function () {
          gradeBody.remove();
        }
      });

      diag.dialog('open');

      gradeBody.find("ul[name='MenuBotoes']").find("a[name=btn_Salvar]").click(function () {
        var r = gradeBody.find(':input[required]');
        var notError = true;
        $.each(r, function (k, campo) {
          if (!$(campo).attr("readonly") || campo.name.indexOf("promptDisplay") > -1) {
            if ($(this).val().trim() == '' && notError) {
              notError = false;
              var nome = campo.name;
              if (nome.indexOf("promptDisplay") > -1) nome = nome.substr(14, nome.length);
              jError('Preencher campo: ' + nome);
            }
          }
        });

        if (notError) {
          r = gradeBody.find('select');
          $.each(r, function (k, campo) {
            if ($(this).required && $(this).val().trim() == '' && notError) {
              notError = false;
              var nome = campo.name;
              jError('Preencher campo: ' + nome);
            }
          });
        }

        if (notError) {
          var string = '{';

          var options = gradeBody.find(".formRow").find("input, select, password, textarea");

          $.each(options, function (k, c) {
            if (c.name)
              string += '"' + c.name.replace("uniform-", "") + '": ' + (gradeBody.find('[name=' + c.name.replace("uniform-", "") + "]")[0].type != "checkbox" ? '"' + gradeBody.find('[name=' + c.name.replace("uniform-", "") + "]").val().replace(/\"/g, '\\"') + '"' : (gradeBody.find('[name=' + c.name.replace("uniform-", "") + "]").prop("checked") ? true : false)) + ',';
          });

          if (string != '{')
            string = string.substring(0, string.length - 1);

          string += '}';

          let o
          try {
            const _string = string.replaceAll("\\", "\\\\");
            o = JSON.parse(_string.replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t"));
          } catch (err) {
            o = JSON.parse(string.replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t"));
          }

          var gridData = sender.find("[name^=kendogrid_]").data("kendoGrid");
          var retorno = false;
          if (method.toLowerCase() == 'nova')
            retorno = gridData.dataSource.transport.create(o);
          else
            retorno = gridData.dataSource.transport.update(o);

          if (retorno) diag.dialog("close");
        }
      });

      gradeBody.find("ul[name='MenuBotoes']").find("a[name=btn_Cancelar]").click(function () {
        diag.dialog('close');
        gradeBody.remove();
      });
    };

    this.Propriedade = function (grid, sender, structural) {
      var propriedadeGrade = sender;
      var layout = JSON.parse(grid.DtaLayout);

      if (!layout)
        layout = grid.Target.data("kendoGrid").getOptions();

      if (!layout.dataSource.schema.model || (layout.dataSource.schema.model && !layout.dataSource.schema.model.fields) || (layout.dataSource.schema.model && layout.dataSource.schema.model.fields.length <= 0)) {
        var tColumns = [];

        $.each(layout.columns, function () {
          tColumns.push({ ColumnName: this.field });
        });

        layout.dataSource.schema.model = uiGrid.GenerateModel(layout, tColumns);
      }

      propriedadeGrade.find(".fluid").css("padding-bottom", "20px");

      var diag = propriedadeGrade.dialog({
        modal: true,
        width: 600,
        height: 600,
        resizable: true,
        closeOnEscape: false,
        close: function () {
          propriedadeGrade.remove();
        }
      });

      diag.dialog('open');

      var ulBotoes = propriedadeGrade.find("ul[name='MenuBotoes']")
        .prependTo(propriedadeGrade.find('.breadLine > .breadLinks'))
        .append(
          Geeks.ERP.UI.Tela.MontaBotoes([
            {
              Nome: "Salvar",
              Valor: "Salvar",
              CodigoBotao: "S1",
              Icone: "icon-checkmark"
            },
            {
              Nome: "Cancelar",
              Valor: "Cancelar",
              CodigoBotao: "S2",
              Icone: "icon-minus"
            }
          ], null));

      ulBotoes.find("a[name=btn_Cancelar]").click(function () {
        diag.dialog('close');
      });

      var contentBodyPropertiesTemplate = $(Geeks.ERP.UI.Template.Get("ContentBodyPropertiesTemplate").format(
        {
          Codigo: grid.Descricao
        }))
        .appendTo(propriedadeGrade.find(".fluid"));

      //#region Rotinas para popular as propriedades

      var popularComboColunas = function () {
        propriedadeGrade.find('select[name=ddlColunas]').empty();

        if (layout.columns.length > 0) {
          $.each(layout.columns, function (key, item) {
            if (!item.template || item.template.indexOf('<span>') < 0) {
              propriedadeGrade.find('select[name=ddlColunas]').append($('<option>', {
                value: key,
                text: !item.title ? item.field : item.title
              }));
            }

            if (!item.hasOwnProperty("CustomTemplate")) item.CustomTemplate = "";
            if (!item.hasOwnProperty("GravaCampoNoBanco")) item.GravaCampoNoBanco = true
            if (!item.hasOwnProperty("LeCampoDoBanco")) item.LeCampoDoBanco = true;
            if (!item.hasOwnProperty("Alinhamento")) item.Alinhamento = "auto";
            if (!item.hasOwnProperty("Obrigatorio")) item.Obrigatorio = false;
            if (!item.hasOwnProperty("Identificador")) item.Identificador = false;
            if (!item.hasOwnProperty("Leitura")) item.Leitura = false;
            if (!item.hasOwnProperty("condition")) item.condition = false;
            if (!item.hasOwnProperty("sortable")) item.sortable = true;
            if (!item.hasOwnProperty("filterable")) item.filterable = true;
            if (!item.hasOwnProperty("groupable")) item.groupable = true;
            if (!item.hasOwnProperty("TemBotao")) item.TemBotao = false;
            if (!item.hasOwnProperty("hidden")) item.hidden = false;
            if (!item.hasOwnProperty("Sumarizacao")) item.Sumarizacao = false;
            if (!item.hasOwnProperty("SumarizaNoGrupo")) item.SumarizaNoGrupo = false;
            if (!item.hasOwnProperty("SumarizaNoRodape")) item.SumarizaNoRodape = false;
            if (!item.hasOwnProperty("OperacaoSumarizacao")) item.OperacaoSumarizacao = "sum";
            if (!item.hasOwnProperty("TemplateSumarizacao")) item.TemplateSumarizacao = "";
          });

          propriedadeGrade.find('select[name=ddlColunas]').val(0);
          propriedadeGrade.find('select[name=ddlColunas]').change();
        }
      };

      var popularComboBotoes = function () {
        propriedadeGrade.find('select[name=ddlBotoes]').empty();

        if (layout.toolbar.length > 0) {
          $.each(layout.toolbar, function (key, item) {
            if (item.name.trim() == "") {
              propriedadeGrade.find('select[name=ddlBotoes]').append($('<option>', {
                value: key,
                text: ((item.id) ? item.id : key)
              }));
            }
          });
        }

        if (propriedadeGrade.find("select[name=ddlBotoes]").find('option').length > 0) {
          propriedadeGrade.find('div[name=toolbarSelecionado]').show();
          propriedadeGrade.find('select[name=ddlBotoes]').val(0);
        } else {
          propriedadeGrade.find('div[name=toolbarSelecionado]').hide();
        }
      }

      popularComboColunas();
      popularComboBotoes();

      //#endregion

      //#region ::. Rotinas para os botões do toolbar

      contentBodyPropertiesTemplate.find("a[name=btnNovoBotao]").click(function () {
        var promptPropriedadeGridAdd = $("#promptPropriedadeGridAdd_" + grid.Descricao);
        if (promptPropriedadeGridAdd.length > 0) {
          promptPropriedadeGridAdd.remove();
        }

        var promptPropriedadeButtonAdd = $(Geeks.ERP.UI.Template.Get("ContentBodyTemplate").format(
          {
            Codigo: "promptPropriedadeButtonAdd_" + grid.Descricao
          }));

        $(promptPropriedadeButtonAdd).appendTo(sender);

        promptPropriedadeButtonAdd.find("span[ref=bodyTitle]").html("Novo Botão");

        var diagButton = promptPropriedadeButtonAdd.dialog({
          modal: true,
          width: 300,
          height: 330,
          resizable: true,
          close: function () {
            promptPropriedadeButtonAdd.remove();
          }
        });

        diagButton.dialog('open');

        var ulBotoesButton = $("<ul name='MenuBotoes'><ul>").prependTo(promptPropriedadeButtonAdd.find('.breadLine > .breadLinks'));
        var contentBodyAddButton = $(Geeks.ERP.UI.Template.Get("ContentBodyAddButton"));
        contentBodyAddButton.appendTo(promptPropriedadeButtonAdd.find(".fluid"));

        ulBotoesButton.append(
          uiTela.MontaBotoes([
            {
              Nome: "Salvar",
              Valor: "Salvar",
              CodigoBotao: "S1",
              Icone: "icon-checkmark"
            },
            {
              Nome: "Cancelar",
              Valor: "Cancelar",
              CodigoBotao: "S2",
              Icone: "icon-minus"
            }
          ], null));

        ulBotoesButton.find("a[name=btn_Salvar]").click(function () {
          var i = contentBodyAddButton.find('input[name=txtIdAdd]').val().trim();
          var c = contentBodyAddButton.find('input[name=txtClasseAdd]').val().trim();

          if (i == '') {
            jError('Id Obrigatório!', "Atenção");
            return;
          } else if (c == '') {
            jError('Classe Obrigatório!', "Atenção");
            return;
          }

          layout.toolbar.push({
            name: ' ',
            id: i,
            classe: c,
            template: '<button style="width: 22px; height:20px; margin:0; padding:0; margin-left:2px;" class="buttonM bDefault"  name="' + i + '"; return false;"> <span class="' + c + '" style="margin-left:5px; font-size:10px" ></span> </button>'
          });

          popularComboBotoes();
          var key = layout.toolbar.length - 1;
          contentBodyPropertiesTemplate.find("select[name=ddlBotoes]").val(key);
          propriedadeGrade.find('div[name=toolbarSelecionado]').show();

          diagButton.dialog("close");
        });

        ulBotoesButton.find("a[name=btn_Cancelar]").click(function () {
          diagButton.dialog('close');
        });

        uiTela.FormataCampos(contentBodyAddButton);
      });

      contentBodyPropertiesTemplate.find("a[name=btnExcluirBotao]").click(function () {
        var idBotao = propriedadeGrade.find('select[name=ddlBotoes]').val();

        if (idBotao != '') {
          jConfirm('Deseja realmente excluir "' + ((layout.toolbar[idBotao].id) ? layout.toolbar[idBotao].id : ' ') + '"?', "Remover Botão?", function (answer) {
            if (answer) {
              layout.toolbar.splice(idBotao, 1);

              popularComboBotoes();

              if (propriedadeGrade.find("select[name=ddlBotoes]").find('option').length > 0) {
                var index = propriedadeGrade.find("select[name=ddlBotoes]").find('option:first-child').val();
                propriedadeGrade.find("select[name=ddlBotoes]").val(index);
              } else {
                propriedadeGrade.find('div[name=toolbarSelecionado]').hide();
              }
            }
          });
        }
      });

      //#endregion

      //#region ::. Rotina para atualizar a tela quando combo botão ou coluna é alterado .::

      propriedadeGrade.find("select[name=ddlColunas]").change(function () {
        if (!layout.dataSource.schema.model.fields[layout.columns[this.value].field]) {
          layout.dataSource.schema.model.fields[layout.columns[this.value].field] = {
            type: "string",
            nullable: true,
            identify: false,
            editable: true,
            hidden: false
          };
        }

        if (!layout.columns[this.value].hasOwnProperty("CustomTemplate")) layout.columns[this.value].CustomTemplate = "";
        if (!layout.columns[this.value].hasOwnProperty("GravaCampoNoBanco")) layout.columns[this.value].GravaCampoNoBanco = true
        if (!layout.columns[this.value].hasOwnProperty("LeCampoDoBanco")) layout.columns[this.value].LeCampoDoBanco = true;
        if (!layout.columns[this.value].hasOwnProperty("Alinhamento")) layout.columns[this.value].Alinhamento = "auto";
        if (!layout.columns[this.value].hasOwnProperty("Obrigatorio")) layout.columns[this.value].Obrigatorio = false;
        if (!layout.columns[this.value].hasOwnProperty("Identificador")) layout.columns[this.value].Identificador = false;
        if (!layout.columns[this.value].hasOwnProperty("Leitura")) layout.columns[this.value].Leitura = false;
        if (!layout.columns[this.value].hasOwnProperty("condition")) layout.columns[this.value].condition = false;
        if (!layout.columns[this.value].hasOwnProperty("sortable")) layout.columns[this.value].sortable = true;
        if (!layout.columns[this.value].hasOwnProperty("filterable")) layout.columns[this.value].filterable = true;
        if (!layout.columns[this.value].hasOwnProperty("groupable")) layout.columns[this.value].groupable = true;
        if (!layout.columns[this.value].hasOwnProperty("TemBotao")) layout.columns[this.value].TemBotao = false;
        if (!layout.columns[this.value].hasOwnProperty("hidden")) layout.columns[this.value].hidden = false;
        if (!layout.columns[this.value].hasOwnProperty("Sumarizacao")) layout.columns[this.value].Sumarizacao = false;
        if (!layout.columns[this.value].hasOwnProperty("SumarizaNoGrupo")) layout.columns[this.value].SumarizaNoGrupo = false;
        if (!layout.columns[this.value].hasOwnProperty("SumarizaNoRodape")) layout.columns[this.value].SumarizaNoRodape = false;
        if (!layout.columns[this.value].hasOwnProperty("OperacaoSumarizacao")) layout.columns[this.value].OperacaoSumarizacao = "sum";
        if (!layout.columns[this.value].hasOwnProperty("TemplateSumarizacao")) layout.columns[this.value].TemplateSumarizacao = "";

        propriedadeGrade.find('div[name=comBotao]').hide();

        propriedadeGrade.find('input[name=txtCampo]').val(layout.columns[this.value].field);
        propriedadeGrade.find('input[name=txtDescricao]').val(layout.columns[this.value].title);
        propriedadeGrade.find('input[name=txtTemplate]').val(layout.columns[this.value].CustomTemplate);

        if (!layout.columns[this.value].geeksType)
          layout.columns[this.value].geeksType = "texto";

        propriedadeGrade.find('select[name=ddlTipo]').val(layout.columns[this.value].geeksType).trigger("liszt:updated");
        propriedadeGrade.find('select[name=ddlAlinhamento]').val(layout.columns[this.value].Alinhamento);
        propriedadeGrade.find('input[name=ckObrigatorio]').prop("checked", layout.columns[this.value].Obrigatorio);
        propriedadeGrade.find('input[name=ckIdentificador]').prop("checked", layout.columns[this.value].Identificador);
        propriedadeGrade.find('input[name=ckEditavel]').prop("checked", !layout.columns[this.value].Leitura);
        propriedadeGrade.find('input[name=ckVisivel]').prop("checked", !layout.columns[this.value].hidden);
        propriedadeGrade.find('input[name=ckCondicao]').prop("checked", layout.columns[this.value].condition);
        propriedadeGrade.find('input[name=ckOrdenaColuna]').prop("checked", layout.columns[this.value].sortable);
        propriedadeGrade.find('input[name=ckFiltraColuna]').prop("checked", layout.columns[this.value].filterable);
        propriedadeGrade.find('input[name=ckGravaNoBanco]').prop("checked", layout.columns[this.value].GravaCampoNoBanco);
        propriedadeGrade.find('input[name=ckLeDoBanco]').prop("checked", layout.columns[this.value].LeCampoDoBanco);
        propriedadeGrade.find('input[name=ckAgrupaColuna]').prop("checked", layout.columns[this.value].groupable);
        propriedadeGrade.find('input[name=ckBotao]').prop("checked", layout.columns[this.value].TemBotao);
        propriedadeGrade.find('input[name=ckSumarizacao]').prop("checked", layout.columns[this.value].Sumarizacao);
        propriedadeGrade.find('input[name=ckSumarizaNoGrupo]').prop("checked", layout.columns[this.value].SumarizaNoGrupo);
        propriedadeGrade.find('input[name=ckSumarizaNoRodape]').prop("checked", layout.columns[this.value].SumarizaNoRodape);
        propriedadeGrade.find('select[name=ddlOperacaoSumarizacao]').val(layout.columns[this.value].OperacaoSumarizacao).trigger("liszt:updated");
        propriedadeGrade.find('input[name=txtTemplateSumarizacao]').val(layout.columns[this.value].TemplateSumarizacao);

        if (layout.columns[this.value].command)
          propriedadeGrade.find('input[name=txtTexto]').val(layout.columns[this.value].command.text);

        $.uniform.update();
      });

      propriedadeGrade.find("input[name=txtCampo]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].field = this.value;
      });

      propriedadeGrade.find("input[name=txtDescricao]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].title = this.value;
      });

      propriedadeGrade.find("select[name=ddlTipo]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();

        layout.dataSource.schema.model.fields[layout.columns[col].field].type =
          function (tipoCampoConverter) {
            switch (tipoCampoConverter) {
              case "numero":
                return "number";
              case "number":
                return "number";
              case "checagem":
                return "boolean";
              case "valor":
                return "money";
              case "valor4":
                return "money";
              case "money":
                return "money";
              case "data":
                return "date";
              case "datahora":
                return "date";
              case "date":
                return "date";
              default:
                return "string";
            }
          }(this.value);

        layout.columns[col].geeksType = this.value;

        propriedadeGrade.find('div[name=divDropDownOptions]').hide();
        propriedadeGrade.find('div[name=divPrompt]').hide();

        if (this.value.toLowerCase() == 'selecao') {
          propriedadeGrade.find('div[name=divDropDownOptions]').show();
          propriedadeGrade.find('textarea[name=txtDropDownOpcoes]').val(layout.columns[col].dropDownOptions ? layout.columns[col].dropDownOptions.replace(/\\[n]/g, '\n') : "");

          propriedadeGrade.find("input[name=ckBotao]").prop("checked", false);
          propriedadeGrade.find("input[name=ckBotao]").parents(".formRow").css("display", "none");
        }
        else if (this.value.toLowerCase() == 'prompt') {
          propriedadeGrade.find('div[name=divPrompt]').show();
          propriedadeGrade.find('input[name=txtCampoForeignKeyPrompt]').val(layout.columns[col].campoForeignKeyPrompt);

          propriedadeGrade.find("input[name=ckBotao]").prop("checked", false);
          propriedadeGrade.find("input[name=ckBotao]").parents(".formRow").css("display", "none");
        } else {
          propriedadeGrade.find("input[name=ckBotao]").parents(".formRow").css("display", "block");
        }

        $.uniform.update();
      });

      propriedadeGrade.find("select[name=ddlAlinhamento]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();

        layout.columns[col].Alinhamento = this.value;
      });

      propriedadeGrade.find("input[name=txtCampoForeignKeyPrompt]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].campoForeignKeyPrompt = this.value;
      });

      propriedadeGrade.find("textarea[name=txtDropDownOpcoes]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].dropDownOptions = this.value;
      });

      propriedadeGrade.find("input[name=ckObrigatorio]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.dataSource.schema.model.fields[layout.columns[col].field].nullable = !$(this).prop("checked");
        layout.columns[col].Obrigatorio = $(this).prop("checked");
      });

      propriedadeGrade.find("input[name=ckIdentificador]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.dataSource.schema.model.fields[layout.columns[col].field].identify = $(this).prop("checked");
        layout.columns[col].Identificador = $(this).prop("checked");
      });

      propriedadeGrade.find("input[name=ckOrdenaColuna]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].sortable = $(this).prop("checked");
      });

      propriedadeGrade.find("input[name=ckFiltraColuna]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].filterable = $(this).prop("checked");
      });

      propriedadeGrade.find("input[name=ckGravaNoBanco]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].GravaCampoNoBanco = $(this).prop("checked");
      });

      propriedadeGrade.find("input[name=ckLeDoBanco]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].LeCampoDoBanco = $(this).prop("checked");
      });

      propriedadeGrade.find("input[name=ckAgrupaColuna]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].groupable = $(this).prop("checked");
      });

      propriedadeGrade.find("input[name=ckEditavel]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.dataSource.schema.model.fields[layout.columns[col].field].editable = $(this).prop("checked");
        layout.columns[col].Leitura = !$(this).prop("checked");
      });

      propriedadeGrade.find("input[name=ckVisivel]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].hidden = !$(this).prop("checked");
      });

      propriedadeGrade.find("input[name=ckBotao]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();

        if ($(this).prop("checked")) {
          if (!layout.columns[col].command)
            layout.columns[col].command = { name: "gridBtn_" + $(this).prop("name") };

          propriedadeGrade.find('div[name=comBotao]').show();
        } else {
          propriedadeGrade.find('div[name=comBotao]').hide();
          layout.columns[col].command = null;
        }

        layout.columns[col].TemBotao = $(this).prop("checked");
      });

      propriedadeGrade.find("input[name=txtTexto]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();

        if (!layout.columns[col].command)
          layout.columns[col].command = {};

        layout.columns[col].command.text = this.value;
      });

      propriedadeGrade.find('input[name=ckCondicao]').change(function () {
        var col = layout.columns[propriedadeGrade.find("select[name=ddlColunas]").val()];

        if ($(this).prop("checked")) {
          propriedadeGrade.find('div[name=divCondicao]').show();
          propriedadeGrade.find('input[name=txtCondicao]').val(col.textCondition);
          propriedadeGrade.find('select[name=ddlCondicao]').val(col.compCondition).trigger("liszt:updated");
          propriedadeGrade.find('input[name=txtImagem]').val(col.bgImage);
          propriedadeGrade.find('input[name=txtCorBg]').val(col.color);
          propriedadeGrade.find('input[name=txtCorFonte]').val(col.fontColor);
        } else
          propriedadeGrade.find('div[name=divCondicao]').hide();

        col.condition = $(this).prop("checked");
      });

      propriedadeGrade.find("input[name=txtCondicao]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].textCondition = this.value;
      });

      propriedadeGrade.find("input[name=txtImagem]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].bgImage = this.value;
      });

      propriedadeGrade.find("input[name=txtCorBg]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].color = this.value;
      });

      propriedadeGrade.find("input[name=txtCorFonte]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].fontColor = this.value;
      });

      propriedadeGrade.find("select[name=ddlBotoes]").change(function () {
        propriedadeGrade.find('input[name=txtId]').val(layout.toolbar[this.value].id);
        propriedadeGrade.find('input[name=txtClasse]').val(layout.toolbar[this.value].classe);
      });

      propriedadeGrade.find("input[name=txtId]").change(function () {
        var toolbar = propriedadeGrade.find("select[name=ddlBotoes]").val();
        layout.toolbar[toolbar].id = this.value;
      });

      propriedadeGrade.find("input[name=txtClasse]").change(function () {
        var toolbar = propriedadeGrade.find("select[name=ddlBotoes]").val();
        layout.toolbar[toolbar].classe = this.value;
      });

      propriedadeGrade.find("input[name=txtTemplate]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].CustomTemplate = this.value;
      });

      propriedadeGrade.find("input[name=ckSumarizacao]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();

        if ($(this).prop("checked")) {
          propriedadeGrade.find('div[name=comSumarizacao]').show();
        } else {
          propriedadeGrade.find('div[name=comSumarizacao]').hide();
        }

        layout.columns[col].Sumarizacao = $(this).prop("checked");
      });

      propriedadeGrade.find("input[name=ckSumarizaNoGrupo]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].SumarizaNoGrupo = $(this).prop("checked");
      });

      propriedadeGrade.find("input[name=ckSumarizaNoRodape]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].SumarizaNoRodape = $(this).prop("checked");
      });

      propriedadeGrade.find("select[name=ddlOperacaoSumarizacao]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();

        layout.columns[col].OperacaoSumarizacao = this.value;
      });

      propriedadeGrade.find("input[name=txtTemplateSumarizacao]").change(function () {
        var col = propriedadeGrade.find("select[name=ddlColunas]").val();
        layout.columns[col].TemplateSumarizacao = this.value;
      });

      //#endregion

      //#region ::. Grava propriedades da grade .::

      var validaPropriedadesGrid = function () {
        var s = propriedadeGrade.find('textarea[name=txtSentencaSQL]').val().trim();

        if (s == '')
          return 'Por Favor preencher a Sentença SQL da Grid';

        return "OK";
      }

      var remontaLayout = function () {
        grid.Incluir = propriedadeGrade.find('input[name=ckIncluir]').prop("checked");
        grid.Editar = propriedadeGrade.find('input[name=ckEditar]').prop("checked");
        grid.Excluir = propriedadeGrade.find('input[name=ckExcluir]').prop("checked");
        grid.Excel = propriedadeGrade.find('input[name=ckExcel]').prop("checked");
        grid.OrdenaGrade = propriedadeGrade.find('input[name=ckOrdenaGrade]').prop("checked");
        grid.FiltraGrade = propriedadeGrade.find('input[name=ckFiltraGrade]').prop("checked");
        grid.AgrupaGrade = propriedadeGrade.find('input[name=ckAgrupaGrade]').prop("checked");
        grid.MinimizarLinhas = propriedadeGrade.find('input[name=ckMinimizarLinhas]').prop("checked");
        grid.Paginacao = propriedadeGrade.find('input[name=ckPaginacao]').prop("checked");
        grid.MultiRow = propriedadeGrade.find('input[name=ckMultiRow]').prop("checked");
        grid.SentencaSQL = propriedadeGrade.find('textarea[name=txtSentencaSQL]').val().replace(/\\n/g, "\n");
        grid.Descricao = propriedadeGrade.find('input[name=txtDescricaoGrade]').val();
        grid.ForeignKeyName = propriedadeGrade.find('input[name=ForeignKeyName]').val();

        var filtraGrade = false;
        if (grid.FiltraGrade) {
          filtraGrade = {
            mode: "menu",
            extra: true,
            operators: {
              string: {
                contains: "Contenha",
                doesnotcontain: "Não Contenha",
                eq: "Igual",
                neq: "Diferente",
                startswith: "Começa com",
                endswith: "Termina com"
              },
              number: {
                eq: "Igual",
                neq: "Diferente",
                gte: "Maior ou igual",
                gt: "Maior que",
                lte: "Menor ou igual",
                lt: "Menor que"
              },
              money: {
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
          }
        }
        layout.filterable = filtraGrade;

        layout.sortable = grid.OrdenaGrade;
        layout.groupable = grid.AgrupaGrade;

        adicionaBotoesToolbar(grid, layout);

        var aggregates = [];
        var groupAggregates = [];

        $.each(layout.columns, function (index, col) {

          if (col.hidden == false) {
            if (col.footerAttributes != undefined && col.footerAttributes.style != undefined) col.footerAttributes.style = "";
            if (col.headerAttributes != undefined && col.headerAttributes.style != undefined) col.headerAttributes.style = "";
          }

          if (col.geeksType == "prompt" && col.campoForeignKeyPrompt) {
            var colForeignKey = $.grep(layout.columns, function (colforeignkey) {
              return colforeignkey.field == col.campoForeignKeyPrompt;
            });

            if (colForeignKey.length > 0) {
              colForeignKey[0].hidden = true;
            }
          } else if (col.geeksType == "selecao") {
            if (col.dropDownOptions) {
              col.dropDownOptions = col.dropDownOptions.replace(/\\[n]/g, '\n');
            }
          }

          if (col.dropDownOptions) {
            col.template = function (dataItem) {
              var opcoes = col.dropDownOptions.split('\n');

              var optSelected = $.grep(opcoes, function (optValue) {
                return optValue.split('=')[0].trim() == dataItem[col.field];
              });

              if (optSelected.length > 0)
                return optSelected[0].split('=')[1].trim();

              return "DropDown Error";
            }
            col.filterable = [{ ui: "dropDownFilter" }];
            function dropDownFilter(element) {
              element.kendoDropDownList({
                dataSource: col.field,
                optionLabel: "--Selecione--"
              });
            }
          } else if (col.geeksType == "checagem") {
            col.template = function (dataItem) {
              if (dataItem[col.field] == 1 || dataItem[col.field] == "1" || dataItem[col.field] == true || dataItem[col.field] == "true")
                return "<div style=\"text-align: center\"><img src='./Content/Plugins/Aquincum/images/icons/usual/icon-check.png' alt='" + dataItem[col.field] + "'/></div>";
              else
                return " ";
            }
            col.groupHeaderTemplate = function (dataItem) {
              if (dataItem.value == "true") return col.title + ": Sim";
              else return col.title + ": Não";
            };
          } else if (col.geeksType == "valor") {
            col.template = function (dataItem) {
              if (dataItem[col.field])
                return kendo.toString(dataItem[col.field], 'n2');

              return "0,00";
            }
            col.groupHeaderTemplate = "#= kendo.toString(value, 'n2') #";
          } else if (col.geeksType == "valor4") {
            col.template = function (dataItem) {
              if (dataItem[col.field])
                return kendo.toString(dataItem[col.field], 'n4');

              return "0,00";
            }
            col.groupHeaderTemplate = "#= kendo.toString(value, 'n4') #";
          } else if (col.geeksType == "numero") {
            col.template = function (dataItem) {
              if (dataItem[col.field])
                return (dataItem[col.field] + "").replace(".", ",");

              return "0";
            }
            //col.groupHeaderTemplate  = "#= kendo.toString(value, 'n3') #";
          } else if (col.geeksType == "data") {
            col.template = function (dataItem) {
              if (dataItem[col.field]) {
                dataItem[col.field] = new Date(kendo.parseDate(dataItem[col.field]).getTime());// - (new Date().getTimezoneOffset() * 60000) + (300 * 60000));
                return kendo.toString(dataItem[col.field], 'dd/MM/yyyy');
              }
              else
                return " ";
            }
            col.groupHeaderTemplate = "#= kendo.toString(kendo.parseDate(value), 'dd/MM/yyyy') #";
            col.format = "{0:dd/MM/yyyy}";
            col.filterable = [{ ui: "datepicker" }];

          } else if (col.geeksType == "datahora") {
            col.template = function (dataItem) {
              if (dataItem[col.field]) {
                dataItem[col.field] = new Date(kendo.parseDate(dataItem[col.field]).getTime());// - (new Date().getTimezoneOffset() * 60000) + (300 * 60000));
                return kendo.toString(dataItem[col.field], 'dd/MM/yyyy HH:mm:ss');
              }
              else
                return " ";
            }
            col.groupHeaderTemplate = "#= kendo.toString(kendo.parseDate(value), 'dd/MM/yyyy HH:mm:ss') #";
            col.format = "{0:dd/MM/yyyy HH:mm:ss}";
            col.filterable = [{ ui: "datetimepicker" }];
          } else if (col.geeksType == "arquivo") {
            col.template = function (dataItem) {
              if (dataItem[col.field]) {
                var arquivo = dataItem[col.field].split("#$#");
                return "<a href=\"" + arquivo[0] + "\" download=\"" + arquivo[1] + "\" title=\"Download do Arquivo\">" + arquivo[1] + "</a>";
              }

              return " ";
            }
          } else if (col.geeksType == "imagem") {
            col.template = function (dataItem) {
              if (dataItem[col.field]) {
                var arquivo = dataItem[col.field].split("#$#");
                if (arquivo[0].indexOf("image") > -1)
                  return "<img src=\"" + arquivo[0] + "\" style=\"max-height: 100px;\"></img>";
              }

              return " ";
            }
          } else {
            col.template = col.CustomTemplate ? col.CustomTemplate : false;
            //col.groupHeaderTemplate  = "#= kendo.toString(value, 'n0') #";
          }

          if (col.Alinhamento) {
            if (col.Alinhamento != "auto") {
              col.attributes = {
                style: "text-align: " + col.Alinhamento
              };
            } else {
              if (col.geeksType == "valor" || col.geeksType == "valor4" || col.geeksType == "numero") {
                col.attributes = {
                  style: "text-align: right"
                };
              } else {
                col.attributes = {
                  style: "text-align: left"
                };
              }
            }
          }
          else
            col.attributes = null;

          if (col.Sumarizacao) {
            if (col.SumarizaNoGrupo) {
              if (col.TemplateSumarizacao) {
                col.groupFooterTemplate = col.TemplateSumarizacao;
              } else {
                if (col.geeksType == "valor" && col.OperacaoSumarizacao != "count") {
                  col.groupFooterTemplate = "<div style='text-align: right'>#: kendo.toString(" + col.OperacaoSumarizacao + ", 'n2') #</div>";
                } else if (col.geeksType == "valor4" && col.OperacaoSumarizacao != "count") {
                  col.groupFooterTemplate = "<div style='text-align: right'>#: kendo.toString(" + col.OperacaoSumarizacao + ", 'n4') #</div>";
                } else if (col.geeksType == "numero" && col.OperacaoSumarizacao != "count") {
                  col.groupFooterTemplate = "<div style='text-align: right'>#: " + col.OperacaoSumarizacao + " #</div>";
                } else {
                  col.groupFooterTemplate = "#: " + col.OperacaoSumarizacao + " #";
                }
              }
            } else {
              col.groupFooterTemplate = null;
            }

            if (col.SumarizaNoRodape) {
              if (col.TemplateSumarizacao) {
                col.footerTemplate = col.TemplateSumarizacao;
              } else {
                if (col.geeksType == "valor" && col.OperacaoSumarizacao != "count") {
                  col.footerTemplate = "<div style='text-align: right'>#: kendo.toString(" + col.OperacaoSumarizacao + ", 'n2') #</div>";
                } else if (col.geeksType == "valor4" && col.OperacaoSumarizacao != "count") {
                  col.footerTemplate = "<div style='text-align: right'>#: kendo.toString(" + col.OperacaoSumarizacao + ", 'n4') #</div>";
                } else if (col.geeksType == "numero" && col.OperacaoSumarizacao != "count") {
                  col.footerTemplate = "<div style='text-align: right'>#: " + col.OperacaoSumarizacao + " #</div>";
                } else {
                  col.footerTemplate = "#: " + col.OperacaoSumarizacao + " #";
                }
              }
              groupAggregates.push({
                field: col.field,
                aggregate: col.OperacaoSumarizacao
              });
            } else {
              col.footerTemplate = null;
            }

            col.aggregates = [col.OperacaoSumarizacao]

            aggregates.push({
              field: col.field,
              aggregate: col.OperacaoSumarizacao
            });
          } else {
            col.groupFooterTemplate = null;
            col.footerTemplate = null;
            col.aggregates = null;
          }
        });

        if (aggregates.length > 0) layout.dataSource.aggregate = aggregates;
        if (groupAggregates.length > 0 && layout.dataSource.group[0]) layout.dataSource.group[0].aggregates = groupAggregates;

        var tColumns = [];
        $.each(layout.columns, function () {
          tColumns.push({ ColumnName: this.field });
        });

        layout.dataSource.schema.model = uiGrid.GenerateModel(layout, tColumns);
        grid.Target.data("kendoGrid").setOptions(layout);

        adicionaEventosToolbar(grid.Target, grid, structural);

        grid.Target.data("kendoGrid").Fill();
        grid.DtaLayout = JSON.stringify(layout);
      };

      ulBotoes.find("a[name=btn_Salvar]").click(function () {
        //try {
        var error = validaPropriedadesGrid();

        if (error == 'OK') {
          remontaLayout();
        } else {
          throw error;
        }
        //} catch (ex) {
        //    jError(ex.message, "Atenção");
        //}
      });

      //#endregion

      propriedadeGrade.find('input[name=TabelaMaster]').val(grid.TabelaMaster);
      propriedadeGrade.find('input[name=ckIncluir]').prop("checked", grid.Incluir);
      propriedadeGrade.find('input[name=ckEditar]').prop("checked", grid.Editar);
      propriedadeGrade.find('input[name=ckExcluir]').prop("checked", grid.Excluir);
      propriedadeGrade.find('input[name=ckExcel]').prop("checked", grid.Excel);
      propriedadeGrade.find('input[name=ckOrdenaGrade]').prop("checked", grid.OrdenaGrade);
      propriedadeGrade.find('input[name=ckFiltraGrade]').prop("checked", grid.FiltraGrade);
      propriedadeGrade.find('input[name=ckAgrupaGrade]').prop("checked", grid.AgrupaGrade);
      propriedadeGrade.find('input[name=ckMinimizarLinhas]').prop("checked", grid.MinimizarLinhas);
      propriedadeGrade.find('input[name=ckPaginacao]').prop("checked", grid.Paginacao);
      propriedadeGrade.find('input[name=ckMultiRow]').prop("checked", grid.MultiRow);
      propriedadeGrade.find('textarea[name=txtSentencaSQL]').val(grid.SentencaSQL);
      propriedadeGrade.find('input[name=txtDescricaoGrade]').val(grid.Descricao);
      propriedadeGrade.find('input[name=ForeignKeyName]').val(grid.ForeignKeyName);

      propriedadeGrade.find(".wrapper").css("height", "465px");
      propriedadeGrade.find(".wrapper").css("margin", "0px");
      propriedadeGrade.find(".fluid").css("height", "465px");
      propriedadeGrade.find(".tab_container").css("height", "427px");
      uiTela.FormataCampos(propriedadeGrade);

      propriedadeGrade.find("select[name=ddlColunas]").val(0);
    };

    this.GenerateModel = function (layout, gridColumns) {
      var model = {};
      model.id = "ID";
      var fields = {};

      if (layout && layout.dataSource && layout.dataSource.schema && layout.dataSource.schema.model && layout.dataSource.schema.model.fields) {
        for (var colIndex = 0; colIndex < gridColumns.length; colIndex++) {
          var col = layout.dataSource.schema.model.fields.hasOwnProperty(gridColumns[colIndex].ColumnName);

          if (!col) {
            var colunaAdicionada = {
              type: "string",
              nullable: true,
              identify: false,
              editable: true
            };

            fields[gridColumns[colIndex].ColumnName] = colunaAdicionada;
          } else {

            for (var i = 0; i < layout.columns.length; i++) {
              if (layout.columns[i].field == gridColumns[colIndex].ColumnName) {
                if (layout.columns[i].geeksType == "data" || layout.columns[i].geeksType == "datahora")
                  layout.dataSource.schema.model.fields[gridColumns[colIndex].ColumnName].type = "date";
                else if (layout.columns[i].geeksType == "valor")
                  layout.dataSource.schema.model.fields[gridColumns[colIndex].ColumnName].type = "money";
                else if (layout.columns[i].geeksType == "valor4")
                  layout.dataSource.schema.model.fields[gridColumns[colIndex].ColumnName].type = "money";
                else if (layout.columns[i].geeksType == "numero")
                  layout.dataSource.schema.model.fields[gridColumns[colIndex].ColumnName].type = "number";
                else if (layout.columns[i].geeksType == "texto")
                  layout.dataSource.schema.model.fields[gridColumns[colIndex].ColumnName].type = "string";
              }
            }

            fields[gridColumns[colIndex].ColumnName] = layout.dataSource.schema.model.fields[gridColumns[colIndex].ColumnName];
          }
        }
      } else {
        for (var i = 0; i < gridColumns.length; i++) {
          fields[gridColumns[i].ColumnName] = {
            type: "string",
            nullable: true,
            identify: false,
            editable: true
          };
        }
      }

      model.fields = fields;

      return model;
    };
  }


})();

//Metodos para deixar a ordenação case insensitive
var CaseInsensitiveComparer = {

  getterCache: {},

  getter: function (expression) {
    return this.getterCache[expression] = this.getterCache[expression] || new Function("d", "return " + kendo.expr(expression));
  },

  selector: function (field) {
    return jQuery.isFunction(field) ? field : this.getter(field);
  },

  asc: function (field) {
    var selector = this.selector(field);
    return function (a, b) {

      a = selector(a);
      b = selector(b);

      if (typeof a == "string" && typeof b == "string") {
        a = a.toLowerCase();
        b = b.toLowerCase();
      }

      return a > b ? 1 : (a < b ? -1 : 0);
    };
  },

  desc: function (field) {
    var selector = this.selector(field);
    return function (a, b) {

      a = selector(a);
      b = selector(b);

      if (typeof a == "string" && typeof b == "string") {
        a = a.toLowerCase();
        b = b.toLowerCase();
      }

      return a < b ? 1 : (a > b ? -1 : 0);
    };
  },

  create: function (descriptor) {
    return this[descriptor.dir.toLowerCase()](descriptor.field);
  },

  combine: function (comparers) {
    return function (a, b) {
      var result = comparers[0](a, b),
        idx,
        length;

      for (idx = 1, length = comparers.length; idx < length; idx++) {
        result = result || comparers[idx](a, b);
      }

      return result;
    };
  }
};

kendo.data.Query.prototype.normalizeSort = function (field, dir) {
  if (field) {
    var descriptor = typeof field === "string" ? { field: field, dir: dir } : field,
      descriptors = jQuery.isArray(descriptor) ? descriptor : (descriptor !== undefined ? [descriptor] : []);

    return jQuery.grep(descriptors, function (d) { return !!d.dir; });
  }
};

kendo.data.Query.prototype.sort = function (field, dir, comparer) {

  var idx,
    length,
    descriptors = this.normalizeSort(field, dir),
    comparers = [];

  comparer = comparer || CaseInsensitiveComparer;

  if (descriptors.length) {
    for (idx = 0, length = descriptors.length; idx < length; idx++) {
      comparers.push(comparer.create(descriptors[idx]));
    }

    return this.orderBy({ compare: comparer.combine(comparers) });
  }

  return this;
};

kendo.data.Query.prototype.orderBy = function (selector) {

  var result = this.data.slice(0),
    comparer = jQuery.isFunction(selector) || !selector ? CaseInsensitiveComparer.asc(selector) : selector.compare;

  return new kendo.data.Query(result.sort(comparer));
};

kendo.data.Query.prototype.orderByDescending = function (selector) {

  return new kendo.data.Query(this.data.slice(0).sort(CaseInsensitiveComparer.desc(selector)));
};
