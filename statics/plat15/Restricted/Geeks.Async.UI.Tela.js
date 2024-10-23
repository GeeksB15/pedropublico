Geeks.Async.UI.Tela = {

  editingSource: false,

  dataSource: function (objeto) {

    const _fillSessaoCampo = async function (sessao, result) {
      const camposTabelaMasterObjeto = $.grep(objeto.Campos, function (value) {
        return value.CodigoSessao == sessao.CodigoSessao;
      });

      $.each(camposTabelaMasterObjeto, function (index, campo) {
        let value = result && result.length > 0 ? result[0][campo.Id] : null;

        if (campo.TipoCampo == "data") {
          if (value != null) {
            const dateMillis = new Date(parseInt(value.substr(6))).getTime();// + (new Date().getTimezoneOffset() * 60000) - (300 * 60000);
            //value = $.format.date(new Date(dateMillis).toString(), "dd/MM/yyyy");
            value = kendo.toString(new Date(dateMillis), "dd/MM/yyyy");
          }

        }

        objeto.Target.find(
          "input[name=" + campo.Id + "]:not([type=file]), " +
          "select[name=" + campo.Id + campo.CodigoCampo + "], " +
          "checkbox[name=" + campo.Id + "], " +
          "textarea[name=" + campo.Id + "], " +
          "input[name=promptDisplay_" + campo.Id + "]")
          .val(value);

        //verifica se é prompt de outro campo
        const campoPrompt = $.grep(objeto.Campos, function (value) {
          return value.CampoForeignKeyPrompt == campo.Id;
        });

        if (campoPrompt.length > 0) {
          objeto.Target.find("input[name=promptDisplay_" + campo.Id + "]").val(result && result.length > 0 ? result[0][campoPrompt[0].Id] : null);
        }

        objeto.Target.find("input[type=checkbox][name=" + campo.Id + "], checkbox[name=" + campo.Id + "]")
          .prop("checked", value == "1" || value == "true" || value == true ? true : false);

        objeto.Target.find(
          "div[name=" + campo.Id + "], " +
          "span[name=" + campo.Id + "], " +
          "a[name=" + campo.Id + "]").html(value);

        objeto.Target.find(
          "input[name=" + campo.Id + "]:not([type=file]), " +
          "select[name=" + campo.Id + "], " +
          "checkbox[name=" + campo.Id + "], " +
          "textarea[name=" + campo.Id + "]").change();

        objeto.Target.find("input[type=checkbox][name=" + campo.Id + "], checkbox[name=" + campo.Id + "]").change();

        if (campo.TipoCampo == "selecao")
          objeto.Target.find("select[name=" + campo.Id + campo.CodigoCampo + "]").trigger("liszt:updated");

        if (campo.TipoCampo == "numero" || campo.TipoCampo == "valor" || campo.TipoCampo == "valor4" || campo.TipoCampo == "moeda") {
          const input = objeto.Target.find("[name=" + campo.Id + "]");
          let decimal = 0;
          if (campo.TipoCampo == "valor") decimal = 2;
          else if (campo.TipoCampo == "valor4") decimal = 4;
          if (decimal > 0) {
            $(input).val(number_format(($(input).val()), decimal));
          }
        }

        if (campo.TipoCampo == "datahora" && value) {
          objeto.Target.find("[name=d_" + campo.Id + "]").val(kendo.toString(new Date(value.match(/\d+/)[0] * 1), "dd/MM/yyyy"));
          objeto.Target.find("[name=t_" + campo.Id + "]").val(kendo.toString(new Date(value.match(/\d+/)[0] * 1), "HH:mm:ss"));
          objeto.Target.find("[name=" + campo.Id + "]").val(kendo.toString(new Date(value.match(/\d+/)[0] * 1), "dd/MM/yyyy HH:mm:ss"));
        }
        else if (campo.TipoCampo == "datahora") {
          objeto.Target.find("[name=d_" + campo.Id + "]").val("");
          objeto.Target.find("[name=t_" + campo.Id + "]").val("");
          objeto.Target.find("[name=" + campo.Id + "]").val("");
        }

        //Necessário para atualizar o checkbox
        $.uniform.update();
      });
    }

    const _update = function (sessoes) {
      let where = ""
      let erros = ""
      let achouIdentity = false

      let tabelaMaster = ""
      if (objeto.TabelaMaster.indexOf(",") > -1) tabelaMaster = objeto.TabelaMaster.split(",")[0];
      else tabelaMaster = objeto.TabelaMaster;

      let sentencaSQL = "UPDATE " + tabelaMaster + " SET ";

      $.each(sessoes, function (index, sessao) {
        var camposTabelaMasterObjeto = $.grep(objeto.Campos, function (value) {
          return value.CodigoSessao == sessao.CodigoSessao && (value.GravaCampoNoBanco || value.Identificador);
        });

        $.each(camposTabelaMasterObjeto, function (index, campo) {

          if (campo.TipoCampo.toLowerCase() == "selecao" && objeto.Target.find("[name=" + campo.Id + campo.CodigoCampo + "]").length <= 0)
            return;
          else if (campo.TipoCampo.toLowerCase() != "selecao" && objeto.Target.find("[name=" + campo.Id + "]").length <= 0)
            return;

          if (!campo.Identificador) {
            switch (campo.TipoCampo.toLowerCase()) {
              case "email":
              case "selecao":
                if (objeto.Target.find("[name=" + campo.Id + campo.CodigoCampo + "]").val() == "" || objeto.Target.find("[name=" + campo.Id + campo.CodigoCampo + "]").val() == "undefined" ||
                  objeto.Target.find("[name=" + campo.Id + campo.CodigoCampo + "]").val() == null || objeto.Target.find("[name=" + campo.Id + campo.CodigoCampo + "]").val() == undefined) {
                  sentencaSQL += campo.Id + "= NULL, ";
                }
                else {
                  sentencaSQL += campo.Id + "= '";
                  sentencaSQL += objeto.Target.find("[name=" + campo.Id + campo.CodigoCampo + "]").val() + "', ";
                }
                break;

              case "textolongo":
              case "editorhtml":
              case "texto":
              case "prompt":
              case "arquivo":
              case "data":
              case "datahora":
                sentencaSQL += campo.Id + "=";
                sentencaSQL += (objeto.Target.find("[name=" + campo.Id + "]").val() ? "'" + objeto.Target.find("[name=" + campo.Id + "]").val().replace(/'/g, "''") + "'" : "null") + ", ";
                break;
              case "numero":
                sentencaSQL += campo.Id + "=";
                sentencaSQL += (objeto.Target.find("[name=" + campo.Id + "]").val() ? "" + getDecimal(objeto.Target.find("[name=" + campo.Id + "]").val()) + "" : "0") + ", ";
                break;
              case "valor":
                sentencaSQL += campo.Id + "=";
                sentencaSQL += (objeto.Target.find("[name=" + campo.Id + "]").val() ? "" + getDecimal(objeto.Target.find("[name=" + campo.Id + "]").val()) + "" : "0") + ", ";
                break;
              case "valor4":
                sentencaSQL += campo.Id + "=";
                sentencaSQL += (objeto.Target.find("[name=" + campo.Id + "]").val() ? "" + getDecimal(objeto.Target.find("[name=" + campo.Id + "]").val()) + "" : "0") + ", ";
                break;
              case "senha":
                if (objeto.Target.find("[name=" + campo.Id + "]").val() != "") {
                  sentencaSQL += campo.Id + "=";
                  sentencaSQL += (objeto.Target.find("[name=" + campo.Id + "]").val() ? "'" + calcMD5(objeto.Target.find("[name=" + campo.Id + "]").val()) + "'" : "null") + ", ";
                }
                break;
              case "checagem":
                sentencaSQL += campo.Id + "=";
                sentencaSQL += (objeto.Target.find("[name=" + campo.Id + "]").attr('checked') ? "1" : "0") + ", ";
                break;
            }
          } else if (campo.TipoCampo.toLowerCase() == "prompt") {
            sentencaSQL += campo.Id + "=";
            sentencaSQL += (objeto.Target.find("[name=" + campo.Id + "]").val() ? "'" + objeto.Target.find("[name=" + campo.Id + "]").val().replace(/'/g, "''") + "'" : "null") + ", ";
          }

          if (campo.Identificador) {
            achouIdentity = true;
            where += (where == '' ? ' WHERE ' : ' AND ') + campo.Id + "='" + objeto.Target.find("[name=" + campo.Id + "]").val().replace(/'/g, "''") + "'";
          }

          if (campo.Obrigatorio || objeto.Target.find("[name=" + campo.Id + "]").val() != '') {
            switch (campo.TipoCampo) {
              case "Data":
                if (!validaData(objeto.Target.find("[name=" + campo.Id + "]").val())) {
                  erros += '<strong>' + campo.Label + '</strong> => data inválida.<br />';
                }
                break;
              case "Email":
                if (!validaMail(objeto.Target.find("[name=" + campo.Id + "]").val())) {
                  erros += '<strong>' + campo.Label + '</strong> => formato de E-mail inválido.<br />';
                }
              default:
                if (objeto.Target.find("[name=" + campo.Id + "]").val() == '') {
                  erros += '<strong>' + campo.Label + '</strong> => campo obrigatório.<br />';
                }
                break;
            }
          }
        });
      });

      if (!achouIdentity)
        erros += '<strong>O campo de identificação não foi localizado, por favor entre em contato com a Geeks!</strong><br />';

      if (erros != "") {
        jError(erros, "Atenção");
        return "";
      }

      //sentencaSQL += " DataAlteracao = GETDATE(), CodigoUsuario = " + $('#hfCodigoUsuario').val() + " " + where;
      sentencaSQL = sentencaSQL.substr(0, sentencaSQL.length - 2) + where;

      return sentencaSQL;
    };

    const _insert = function (sessoes, content) {
      var erros = "";

      var tabelaMaster = "";
      if (objeto.TabelaMaster.indexOf(",") > -1) tabelaMaster = objeto.TabelaMaster.split(",")[0];
      else tabelaMaster = objeto.TabelaMaster;

      var sentencaSQLCampos = "INSERT INTO " + tabelaMaster + " (";
      var sentencaSQLValues = " VALUES (";

      $.each(sessoes, function (index, sessao) {
        var camposTabelaMasterObjeto = $.grep(objeto.Campos, function (value) {
          return value.CodigoSessao == sessao.CodigoSessao && value.GravaCampoNoBanco;
        });

        $.each(camposTabelaMasterObjeto, function (index, campo) {

          if (campo.TipoCampo.toLowerCase() == "selecao" && content.find("[name^=" + campo.Id + "]").length <= 0)
            return;
          else
            if (campo.TipoCampo.toLowerCase() != "selecao" && content.find("[name=" + campo.Id + "]").length <= 0)
              return;

          if (campo.TipoCampo.toLowerCase() != "prompt") {
            sentencaSQLCampos += campo.Id + ",";

            switch (campo.TipoCampo.toLowerCase()) {
              case "email":
              case "selecao":
                if (content.find("[name^=" + campo.Id + "]").val() == "" || content.find("[name^=" + campo.Id + "]").val() == "undefined" ||
                  content.find("[name^=" + campo.Id + "]").val() == null || content.find("[name^=" + campo.Id + "]").val() == undefined) {
                  sentencaSQLValues += "NULL, ";
                }
                else {
                  sentencaSQLValues += "'" + content.find("[name^=" + campo.Id + "]").val() + "', ";
                }
                break;
              case "textolongo":
              case "editorhtml":
              case "texto":
              case "moeda":
              case "prompt":
              case "arquivo":
              case "data":
              case "datahora":
                sentencaSQLValues += (content.find("[name=" + campo.Id + "]").val() ? "'" + content.find("[name=" + campo.Id + "]").val().replace(/'/g, "''") + "'" : "null") + ", ";
                break;
              case "valor":
                sentencaSQLValues += (content.find("[name=" + campo.Id + "]").val() ? "" + getDecimal(content.find("[name=" + campo.Id + "]").val()) + "" : "0") + ", ";
                break;
              case "valor4":
                sentencaSQLValues += (content.find("[name=" + campo.Id + "]").val() ? "" + getDecimal(content.find("[name=" + campo.Id + "]").val()) + "" : "0") + ", ";
                break;
              case "numero":
                sentencaSQLValues += (content.find("[name=" + campo.Id + "]").val() ? "" + getDecimal(content.find("[name=" + campo.Id + "]").val()) + "" : "0") + ", ";
                break;
              case "senha":
                if (content.find("[name=" + campo.Id + "]").val() != "") {
                  sentencaSQLValues += (content.find("[name=" + campo.Id + "]").val() ? "'" + calcMD5(content.find("[name=" + campo.Id + "]").val()) + "'" : "null") + ", ";
                }
                break;
              case "checagem":
                sentencaSQLValues += (content.find("[name=" + campo.Id + "]").attr('checked') ? "1" : "0") + ", ";
                break;
            }
          } else if (campo.TipoCampo.toLowerCase() == "prompt") {
            sentencaSQLCampos += campo.Id + ",";
            sentencaSQLValues += (content.find("[name=" + campo.Id + "]").val() ? "'" + content.find("[name=" + campo.Id + "]").val().replace(/'/g, "''") + "'" : "null") + ", ";
          }

          if (campo.Obrigatorio || content.find("[name=" + campo.Id + "]").val() != '') {
            switch (campo.TipoCampo) {
              case "Data":
                if (!validaData(content.find("[name=" + campo.Id + "]").val())) {
                  erros += '<strong>' + campo.Label + '</strong> => data inválida.<br />';
                }
                break;
              case "Email":
                if (!validaMail(content.find("[name=" + campo.Id + "]").val())) {
                  erros += '<strong>' + campo.Label + '</strong> => formato de E-mail inválido.<br />';
                }
              default:
                if (content.find("[name=" + campo.Id + "]").val() == '') {
                  erros += '<strong>' + campo.Label + '</strong> => campo obrigatório.<br />';
                }
                break;
            }
          }
        });
      });

      if (erros != "") {
        jError(erros, "Atenção");
        return "";
      }

      sentencaSQLCampos = sentencaSQLCampos.substr(0, sentencaSQLCampos.length - 1) + ")";
      sentencaSQLValues = sentencaSQLValues.substr(0, sentencaSQLValues.length - 2) + "); SELECT SCOPE_IDENTITY() as Codigo";
      //sentencaSQLCampos += " DataAlteracao, CodigoUsuario)";
      //sentencaSQLValues += " GETDATE(), " + $('#hfCodigoUsuario').val() + "); SELECT SCOPE_IDENTITY() as Codigo";

      return sentencaSQLCampos + sentencaSQLValues;
    };

    const _validate = function (sender) {
      var camposValidar = $.grep(objeto.Campos, function (value) {
        return value.Obrigatorio == true;
      });

      var errorMsg = "";

      $.each(camposValidar, function (index, campo) {
        if (campo.TipoCampo.toLowerCase() == "selecao") {
          if (!sender.find("[name^=" + campo.Id + "]").val())
            errorMsg += "O campo \"" + campo.Label + "\" deve ser informado.<br/>";
        }
        else if (campo.TipoCampo.toLowerCase() != "prompt" || (campo.TipoCampo.toLowerCase() == "prompt" && !campo.CampoForeignKeyPrompt)) {
          if (!sender.find("[name=" + campo.Id + "]").val())
            errorMsg += "O campo \"" + campo.Label + "\" deve ser informado.<br/>";
        } else {
          if (!sender.find("[name=" + campo.CampoForeignKeyPrompt + "]").val())
            errorMsg += "O campo \"" + campo.Label + "\" deve ser informado.<br/>";
        }
      });

      $.each(objeto.Campos, function (index, campo) {
        if (campo.TipoCampo.toLowerCase() == "valor" || campo.TipoCampo.toLowerCase() == "valor4" || campo.TipoCampo.toLowerCase() == "numero") {
          if (sender.find("[name=" + campo.Id + "]").val() != undefined && isNaN(sender.find("[name=" + campo.Id + "]").val().replace(/\./g, "").replace(",", "."))) {
            errorMsg += "Valor do campo \"" + campo.Label + "\" inválido.<br/>";
          }
        }
      });

      if (errorMsg) {
        jError(errorMsg, "Atenção");
        return false;
      }

      return true;
    };

    return {

      //#region ::. Rotinas de Preenchimento .::

      Fill: async function (filter) {
        var sql = [];
        var ordemSessao = [];
        var sentencaDoObjeto = "(" + objeto.SentencaSQL + ") Tabela";

        var tabelaMaster = "";
        if (objeto.TabelaMaster.indexOf(",") > -1) tabelaMaster = objeto.TabelaMaster.split(",")[0];
        else tabelaMaster = objeto.TabelaMaster;

        if (!objeto.SentencaSQL || objeto.SentencaSQL.trim().length <= 0)
          sentencaDoObjeto = "(select * from " + tabelaMaster + ") tb";

        //#region ::. Pega campos da Sessão Principal .::

        var sessoesTabelaMasterObjeto = $.grep(objeto.Sessoes, function (value) {
          return value.SentencaSQL == sentencaDoObjeto || value.SentencaSQL == null || value.SentencaSQL.trim() == "";
        });

        var sentencaSQL = "SELECT ";

        $.each(sessoesTabelaMasterObjeto, function (index, sessao) {
          var camposTabelaMasterObjeto = $.grep(objeto.Campos, function (value) {
            return value.CodigoSessao == sessao.CodigoSessao && value.LeCampoDoBanco;
          });

          $.each(camposTabelaMasterObjeto, function (index, campo) {
            sentencaSQL += campo.Id + ", ";
          });
        });

        sentencaSQL = sentencaSQL.substr(0, sentencaSQL.length - 2);
        //sentencaSQL += " FROM " + objeto.SentencaSQL + " WHERE Ativo = 1 ";
        sentencaSQL += " FROM " + sentencaDoObjeto + " WHERE 1 = 1 ";

        if (filter != null || $(filter).trim() != "")
          sentencaSQL += " AND " + filter;

        sql.push(sentencaSQL);

        //#endregion

        //#region ::. Pega campos das outras sessões - Somente Campos .::

        var sessoesTabelaMasterOutros = $.grep(objeto.Sessoes, function (value) {
          return value.SentencaSQL != sentencaDoObjeto && value.SentencaSQL != null && value.SentencaSQL.trim() != "" && value.TipoSessao == "Campo";
        });

        $.each(sessoesTabelaMasterOutros, function (index, sessao) {
          var camposTabelaMasterOutros = $.grep(objeto.Campos, function (value) {
            return value.CodigoSessao == sessao.CodigoSessao && value.LeCampoDoBanco;
          });

          if (camposTabelaMasterOutros.length > 0) {
            var sentencaSQL = "SELECT ";

            $.each(camposTabelaMasterOutros, function (index, campo) {
              sentencaSQL += campo.Id + ", ";
            });

            sentencaSQL = sentencaSQL.substr(0, sentencaSQL.length - 2);
            //sentencaSQL += " FROM " + sessao.SentencaSQL + " WHERE Ativo = 1 ";
            sentencaSQL += " FROM " + sessao.SentencaSQL + " WHERE 1 = 1 ";

            if (filter != null || $(filter).trim() != "")
              sentencaSQL += " AND " + filter;

            sql.push(sentencaSQL);
            ordemSessao.push(sessao);
          }
        });

        //#endregion

        var result = await Geeks.Async.Core.Connection.ExecuteSQL(sql, objeto.Estrutural)

        if (result && result.RecordsAffected > 0) {
          $.jGrowl("Registro salvo com sucesso.")
        }

        //#region ::. Preenche a sessão principal .::

        $.each(sessoesTabelaMasterObjeto, function (index, sessao) {
          _fillSessaoCampo(sessao, result[0].Records);
        });

        //#endregion

        //#region ::. Preenche as outras sessões - Somente Campos .::

        $.each(ordemSessao, function (index, sessao) {
          if (sessao.TipoSessao == "Campo")
            _fillSessaoCampo(sessao, result[index + 1].Records);
        });

        //#endregion

        if (result[0].Records.length <= 0)
          $(objeto.Target).find(".k-grid-toolbar").css("display", "none");
        else
          $(objeto.Target).find(".k-grid-toolbar").css("display", "block");

        if (result)
          $(objeto.Target).find(".breadLine .breadLinks").find("ul[name=MenuBotoes]").find("a[VisivelComRegistro=true]").parent().css("display", "block");

        sql = [];
        ordemSessao = [];
        var campoIdentificador = $.grep(objeto.Campos, function (value) {
          return value.Identificador == true;
        });

        if (campoIdentificador.length > 0) {
          //#region ::. Pega dados das sessões Grid ..:

          var sessoesTabelaMasterGrid = $.grep(objeto.Sessoes, function (value) {
            return value.TipoSessao == "Grade";
          });

          $.each(sessoesTabelaMasterGrid, function (index, sessao) {
            var grid = $.grep(objeto.Grades, function (value) {
              return value.CodigoSessao == sessao.CodigoSessao;
            });

            if (grid.length > 0) {
              var gridData = $(objeto.Target).find("[name=kendogrid_" + grid[0].Descricao + "]").data("kendoGrid");

              if (grid[0].ForeignKeyName && result[0].Records[0]) {
                gridData.filter = grid[0].ForeignKeyName + " = '" + result[0].Records[0][campoIdentificador[0].Id] + "'";

                //Verifica parametro secundário de foreign key - Usado em Arquivo
                var tabelaMaster = "";
                if (grid[0].TabelaMaster.indexOf(",") > -1) tabelaMaster = grid[0].TabelaMaster.split(",")[1];
                if (tabelaMaster != "") {
                  gridData.filter = gridData.filter + " AND TabelaMaster = '" + tabelaMaster + "'";
                }

              } else {
                gridData.filter = "0 = 1";
                console.log("Grade sem Foreign Key: " + grid[0].CodigoGrid + " - " + grid[0].Descricao);
              }

              var sentencaSQL = gridData.sentenceSql();

              if (sentencaSQL) {
                sql.push(sentencaSQL);
                ordemSessao.push(sessao);
              }
            }
          });

          //#endregion

          result = await Geeks.Async.Core.Connection.ExecuteSQL(sql, objeto.Estrutural)

          //#region ::. Preenche as outras sessões - Somente Grid .::

          $.each(ordemSessao, function (index, sessao) {
            if (sessao.TipoSessao == "Grade") {
              var grid = $.grep(objeto.Grades, function (value) {
                return value.CodigoSessao == sessao.CodigoSessao;
              });

              if (grid.length > 0) {
                var gridData = $(objeto.Target).find("[name=kendogrid_" + grid[0].Descricao + "]").data("kendoGrid");

                var originalReadFunction = gridData.dataSource.transport.read;

                gridData.dataSource.transport.read = function (options) {
                  options.success(result[index].Records);
                };

                gridData.Fill();

                gridData.dataSource.transport.read = originalReadFunction;
              }
            }
          });
          //#endregion
        }
        if (this.AfterFill) this.AfterFill();
      },

      //#endregion

      //#region ::. Rotinas de Alteração .::

      Update: async function (filter) {
        if (!_validate(objeto.Target))
          return;

        if (objeto.TabelaMaster == undefined || objeto.TabelaMaster.indexOf(' ') >= 0) {
          jAlert("Esta interface não permite gravação automática. Verifique a sentença SQL!");
          return "";
        }

        var continua = true;
        if (this.BeforeUpdate) continua = this.BeforeUpdate();

        if (continua) {
          var sql = [];

          //#region ::. Pega campos da Sessão Principal .::

          var sessoesTabelaMasterObjeto = $.grep(objeto.Sessoes, function (value) {
            var tabelaMaster = "";
            if (objeto.TabelaMaster.indexOf(",") > -1) tabelaMaster = objeto.TabelaMaster.split(",")[0];
            else tabelaMaster = objeto.TabelaMaster;

            return value.SentencaSQL == tabelaMaster || value.SentencaSQL == null || value.SentencaSQL.trim() == "";
          });

          var sqlTabelaMaster;
          var valorIdentificador = 0;

          var achouIdentificador = $.grep(objeto.Campos, function (value) {
            if (value.Identificador) {
              if (objeto.Target.find("[name=" + value.Id + "]").length > 0) {
                valorIdentificador = objeto.Target.find("[name=" + value.Id + "]").val();

                return true;
              }
            }

            return false;
          });

          if (achouIdentificador.lengh <= 0 || !achouIdentificador[0]) {
            jError("<strong>O campo de identificação não foi localizado, por favor entre em contato com a Geeks!</strong><br />", "Atenção");
            return "";
          }

          if (parseInt(valorIdentificador) > 0) {
            //É update, o registro existe

            sqlTabelaMaster = _update(sessoesTabelaMasterObjeto);

            if (sqlTabelaMaster == "")
              return "";

            if (filter) {
              if (sqlTabelaMaster.toLowerCase().indexOf("where") > 0)
                sqlTabelaMaster += " AND " + filter;
              else
                sqlTabelaMaster += " WHERE " + filter;
            }

            sql.push(sqlTabelaMaster);
          } else {
            // É insert, o registro não existe

            sqlTabelaMaster = _insert(sessoesTabelaMasterObjeto, objeto.Target);

            if (sqlTabelaMaster == "")
              return "";

            sql.push(sqlTabelaMaster);
          }

          //#endregion

          // ************************************************************ //
          // Adriano - Fiz, mas a princípio não acho que será utilizidado
          // ************************************************************ //
          ////#region ::. Pega campos das Outras Sessoes .::

          //var sessoesTabelaMasterObjetoOutros = $.grep(objeto.Sessoes, function (value) {
          //    return value.SentencaSQL != objeto.SentencaSQL || value.SentencaSQL != null;
          //});

          //var sqlTabelaMasterOutros = "";

          //$(sessoesTabelaMasterObjetoOutros).each(function(index, sessao) {
          //    sqlTabelaMasterOutros = _update([sessao]);
          //});

          //if (sqlTabelaMasterOutros == "")
          //    return;

          //if (filter != "") {
          //    if (sqlTabelaMasterOutros.toLowerCase().indexOf("where") > 0)
          //        sqlTabelaMasterOutros += " AND " + filter;
          //    else
          //        sqlTabelaMasterOutros += " WHERE " + filter;
          //}

          //sql.push(sqlTabelaMasterOutros);

          ////#endregion

          var result = await Geeks.Async.Core.Connection.ExecuteSQL(sql, objeto.Estrutural)

          if (this.AfterUpdate)
            this.AfterUpdate(result);

          return result;
        }
      },
      AddNew: async function () {
        var uiDataSource = this;
        var objCampos = [];
        var heightIncluir = 200;
        var sessoes = [];
        var campoKey = null;

        var campos = $.grep(objeto.Campos, function (value) {
          return ((value.Obrigatorio && value.GravaCampoNoBanco) || value.Identificador);
        });

        $.each(campos, function (index, campo) {

          if (!campo.Identificador) {
            var sessao = $.grep(objeto.Sessoes, function (value) {
              return value.CodigoSessao == campo.CodigoSessao;
            });

            var existeSessao = $.grep(sessoes, function (value) {
              return value.CodigoSessao == campo.CodigoSessao;
            });

            if (existeSessao.length <= 0)
              sessoes.push(sessao[0]);

            var campoAdicionado = {
              CodigoSessao: 1,
              Label: campo.Label,
              Id: campo.Id,
              TipoCampo: campo.TipoCampo,
              Obrigatorio: true,
              Identificador: false,
              SentencaSQL: campo.SentencaSQL,
              Ordem: index,
              LabelLargura: 3,
              CampoLargura: 9,
              Leitura: campo.Leitura,
              CampoForeignKeyPrompt: campo.CampoForeignKeyPrompt,
              Visivel: campo.Visivel
            };

            objCampos.push(campoAdicionado);

            if (heightIncluir + 36 < 600)
              heightIncluir += 36;

          } else {
            campoKey = campo;
          }
        });

        if (!campoKey) {
          jError("Não foi encontrado o campo identificador, por favor, entre em contato com a Geeks!");
          return;
        }

        var obj = {
          Descricao: "Incluindo " + objeto.Descricao,
          CodigoObjeto: objeto.CodigoObjeto,
          NomeObjeto: objeto.NomeObjeto,
          CodigoPersonalizado: objeto.CodigoPersonalizado,
          Estrutural: objeto.Estrutural,
          Sessoes: [
            {
              CodigoSessao: 1,
              TipoSessao: "unica",
              Ordem: 1,
              Layout: "opened"
            }],
          Campos: objCampos,
          Botoes: [
            {
              Nome: "Salvar",
              Valor: "Salvar",
              CodigoBotao: "INC1",
              Icone: "icon-checkmark"
            },
            {
              Nome: "Cancelar",
              Valor: "Cancelar",
              CodigoBotao: "INC2",
              Icone: "icon-minus"
            }
          ]
        }

        var includeBody = await Geeks.Async.UI.Tela.OpenWindow("popupAdd", objeto.Target, obj, null, true, true, false);
        includeBody.find(".fluid").css("padding-bottom", "20px");

        var diag = includeBody.dialog({
          modal: true,
          width: 600,
          height: heightIncluir < 600 ? heightIncluir : 600,
          resizable: true,
          closeOnEscape: false,
          close: function () {
            includeBody.remove();
          }
        });

        diag.dialog('open');

        includeBody.find("a[name=btn_Salvar]").click(async function () {
          if (!_validate(includeBody))
            return;

          if (uiDataSource.BeforeAddNew) {
            var ret = uiDataSource.BeforeAddNew(includeBody);

            if (!ret)
              return;
          }

          var sql = _insert(sessoes, includeBody)

          var result = await Geeks.Async.Core.Connection.ExecuteSQL(sql, objeto.Estrutural)

          if (result) {
            uiDataSource.Fill(campoKey.Id + " = " + result.Records[0].Codigo);
            $(objeto.Target).find(".k-grid-toolbar").css("display", "block");

            $(objeto.Target).find(".breadLine .breadLinks").find("ul[name=MenuBotoes]").find("a[VisivelComRegistro=true]").parent().css("display", "block");

            diag.dialog('close');
          }

          if (uiDataSource.AfterAddNew)
            uiDataSource.AfterAddNew(includeBody);
        });

        includeBody.find("a[name=btn_Cancelar]").click(function () {
          diag.dialog('close');
          diag.remove();
        });

        return includeBody;
      },
      Delete: function () {
        if (this.BeforeDelete)
          this.BeforeDelete();


        if (this.AfterDelete)
          this.AfterDelete();
      },

      //#endregion

      //#region ::. Rotinas de Tratamento .::

      AfterAddNew: null,
      BeforeAddNew: null,
      AfterUpdate: null,
      BeforeUpdate: null,
      AfterDelete: null,
      BeforeDelete: null,
      AfterFill: null,

      //#endregion
    }
  },

  OpenWindow: async function (windowType, container, objeto, callback, renderObjeto, codeNotEditable, reloadCodeOnLoad) {
    return new Promise(async (resolve, reject) =>{
      //Verifica se o usuario tem permissão acesso a tela
      if (windowType != "gridEdit" && windowType != "popup" && windowType != "popupAdd" && windowType != "popupEdit" && objeto.CodigoObjeto != 0) {
        const usuarioLogado = JSON.parse(localStorage.getItem("dadosUsuario"));
        let sql =
          "if (Select count(*) from UsuarioPermissaoSistema ups inner join Usuario u on u.CodigoUsuario = ups.CodigoUsuario " +
          "	left join UsuarioPermissao up on up.CodigoUsuarioPermissaoSistema = ups.CodigoUsuarioPermissaoSistema " +
          "	where up.Permitir = 1 and ups.CodigoUsuario=0" + usuarioLogado.CodigoUsuario + " and up.CodigoObjeto = " + objeto.CodigoObjeto + " and ups.CodigoClienteSistema = " + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema + ") > 0 or " +
          "	(Select count(*) from UsuarioPermissaoSistema ups inner join Usuario u on u.CodigoUsuario = ups.CodigoUsuario " +
          "	left join GrupoPermissao gp on gp.CodigoGrupo = ups.CodigoGrupo " +
          "	where gp.Permitir = 1 and ups.CodigoUsuario=0" + usuarioLogado.CodigoUsuario + " and gp.CodigoObjeto = " + objeto.CodigoObjeto + " and ups.CodigoClienteSistema = " + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema + ") > 0 " +
          "	Select 1 Permitir " +
          "else " +
          "	Select 0 Permitir ";
        const retorno = (await Geeks.Async.Core.Connection.ExecuteSQL(sql, true)).Records
        var possuiPermissao = ($("#hfUsuarioAdm").val() == "true" ? true : false)
        if ($("#hfUsuarioAdm").val() != "true" && retorno && retorno.length > 0) possuiPermissao = retorno[0].Permitir;

        if (!possuiPermissao) {
          $.jGrowl("O usuário não possui permissão para a tela " + objeto.Descricao);
          return;
        }

        //Grava no LogMenu
        sql = "Insert into LogMenu (CodigoUsuario, CodigoContato, Nome, CodigoMenu, DescricaoMenu, DataHoraAcesso) " +
          "Select 0" + usuarioLogado.CodigoUsuario + ", CodigoContato, Nome, 0" + objeto.CodigoObjeto + ", '" + objeto.Descricao + "', getDate() " +
          "from Contato where CodigoUsuario = 0" + usuarioLogado.CodigoUsuario;
        await Geeks.Async.Core.Connection.ExecuteSQL(sql);
      }

      if (windowType != "popup") $(">div[ref=contentBody]", container).hide();

      if (reloadCodeOnLoad) {
        try {
          console.log(container)
          console.log('entrou 2')
          objeto.CodigoPersonalizado = (await Geeks.Async.Core.Connection.ExecuteSQL("select CodigoPersonalizado From Objeto Where CodigoObjeto = " + objeto.CodigoObjeto, true)).Records[0].CodigoPersonalizado
        } catch (ex) {
          //Nothing to do.
        }
      }

      if (!objeto.CodigoPersonalizado)
        objeto.CodigoPersonalizado = "";

      var contentBody = $(container).find("#" + windowType + "_" + objeto.NomeObjeto);
      if (contentBody.length <= 0) {
        contentBody = $(Geeks.ERP.UI.Template.Get("ContentBodyTemplate").format(
          {
            Codigo: windowType + "_" + objeto.NomeObjeto
          })).appendTo(container);

        //#region ::. Botão de personalizar o código - parte 1 .::
        var objDefaultHandles = [];

        //Adiciona os Botões do objeto e os botões padrão
        var ulbotoes = $("<ul name='MenuBotoes'></ul>")
          .appendTo(contentBody.find('.breadLine > .breadLinks'));

        var botoesFixos = [
          {
            Nome: "Fechar",
            Valor: "Fechar",
            CodigoBotao: 'D0',
            Icone: "icon-exit"
          }
        ];

        ulbotoes.
          append(Geeks.Async.UI.Tela.MontaBotoes(botoesFixos, null));

        //Botão Fechar
        contentBody.find("a[name=btn_Fechar]").click(function () {
          if (windowType == "content") {
            var openedWindows = container.data("OpenedWindows");

            if (openedWindows) {
              var previousWindow = null;

              for (var i = openedWindows.windows.length - 1; i >= 0; i--) {
                if (openedWindows.windows[i].attr("id") == contentBody.attr("id")) {
                  previousWindow = openedWindows.windows[i - 1];
                  break;
                }
              }

              if (previousWindow && $("#" + previousWindow.attr("id")).length > 0) {
                openedWindows.windows = $.grep(openedWindows.windows, function (value) {
                  return value.attr("id") != contentBody.attr("id");
                });
                previousWindow.show();
                Geeks.Async.UI.Tela.integracao(previousWindow.attr("id"), previousWindow);

                /*if (previousWindow.find("div[name=GeeksCodeMirror]").length == 0) editingSource = false;
                else editingSource = true;
                contentBody.find('.breadLine').css({
                  position: 'static'
                });
                isFixed = false; */
              } else {
                openedWindows.windows = $.grep(openedWindows.windows, function (value) {
                  return value.attr("id") != contentBody.attr("id");
                });
                $("#content_Menu").show();
                $(document).find("title").html("Geeks - B15 :: Menu");
              }
            }
          }
          $(this).parents("[ref=contentBody]").remove();
          //window.scrollTo(0,0);
        });


        //#endregion
        if (renderObjeto) {
          await Geeks.Async.UI.Tela.RenderObjeto(contentBody, objeto, windowType == "gridEdit" || windowType == "popupEdit" || windowType == "popupAdd")
        }

        Geeks.Async.UI.Tela.FormataCampos(contentBody);


        //#region ::. Botão para personalizar o código - parte 2  .::
        // if (!codeNotEditable) {
        //     //Função para guardar handles, antes de aplicar o código personalizado
        //     $.each(contentBody.find("*").not(".MenuBotoesCodeEdit"), function (index, obj) {
        //         if ($(obj).data("events")) {
        //             $.each($(obj).data('events'), function (index2, event) {
        //                 $.each(event, function (index3, handler) {
        //                     objDefaultHandles.push({
        //                         objeto: obj,
        //                         handlerType: handler.type,
        //                         handlerFunction: handler.handler
        //                     });
        //                 });
        //             });
        //         }
        //     });

        //     //Adiciona o script a ser executado - código padrão
        contentBody.find(".wrapper > .fluid").prepend("<script>$(function (){ var currentContainer = $('#" + windowType + "_" + objeto.NomeObjeto + "');  try { " + objeto.CodigoPersonalizado + " \r } catch(ex) { jError(ex.message, 'Erro no código personalizado'); } }); </script>");
        contentBody.find(".wrapper > .fluid").find("script").remove();
        // }

        //#endregion
        contentBody.append("<input name='CodigoObjeto' type='hidden' value='" + objeto.CodigoObjeto + "'/>");
        this.integracao(objeto.NomeObjeto, contentBody);


      } else {
        contentBody.css("display", "");
        this.integracao(objeto.NomeObjeto, contentBody);
      }

      contentBody.find("span[ref=bodyTitle]").html(objeto.CodigoObjeto + " - " + objeto.Descricao);
      contentBody.find("span[ref=imgIcon]").addClass(objeto.Icone);

      contentBody.close = function () {
        if (callback)
          callback();

        contentBody.remove();
      }

      contentBody.find(".k-grid-add").prop("title", "Adicionar Registro");
      contentBody.find(".k-grid-edit").prop("title", "Editar Registro");
      contentBody.find(".k-grid-delete").prop("title", "Excluir Registro");
      contentBody.find(".k-grid-excel").prop("title", "Exportar para Excel");
      contentBody.find(".k-grid-layout").prop("title", "Salvar Layout da Grade");
      contentBody.find(".k-grid-collapse").prop("title", "Minimizar Linhas");
      contentBody.find(".k-grid-expand").prop("title", "Expandir Linhas");

      if (windowType == "content" && contentBody.attr("id") != "content_Menu") {
        $(document).find("title").html(objeto.Descricao + " :: B15");

        var openedWindows = container.data("OpenedWindows");

        if (!openedWindows) {
          openedWindows = { windows: [] };
          container.data("OpenedWindows", openedWindows);
        }

        openedWindows.windows.push(contentBody);
      }

      if (windowType == "content") {
        $(window).scrollTop(0);
      }

      // Stick the #nav to the top of the window
      contentBody.find('.breadLine').sticky({ topSpacing: 0, zIndex: 999 });

      resolve(contentBody)
    })
  },

  RenderObjeto: async function (contentBody, objeto, utilizaPropriedadesObjeto) {
    return new Promise(async (resolve, reject) => {
      
      if (!utilizaPropriedadesObjeto) {
        const sqlReturn = await Geeks.Async.Core.Connection.ExecuteSQL([
          "select * from objeto where codigoObjeto = " + objeto.CodigoObjeto,
          "select o.Descricao as Objeto, s.* from SESSAO as s left join Objeto as o on s.CodigoObjeto = o.CodigoObjeto where s.codigoObjeto = " + objeto.CodigoObjeto + " and s.Ativo = 1order by Ordem",
          "select * from botao where codigoObjeto = " + objeto.CodigoObjeto + " order by ordem",
          "select Graficos.* from Graficos inner join Sessao on Sessao.CodigoSessao = Graficos.CodigoSessao Where Sessao.CodigoObjeto = " + objeto.CodigoObjeto,
          "select Campo.* from Campo inner join Sessao on Sessao.CodigoSessao = Campo.CodigoSessao Where Sessao.CodigoObjeto = " + objeto.CodigoObjeto + " and Campo.Ativo = 1 and Sessao.Ativo = 1 order by Ordem",
          "select Grid.* from Grid inner join Sessao on Sessao.CodigoSessao = Grid.CodigoSessao Where Sessao.CodigoObjeto = " + objeto.CodigoObjeto + " and Grid.Ativo = 1"
        ], true);

        objeto = sqlReturn[0].Records[0];
        objeto.Sessoes = sqlReturn[1].Records;
        objeto.Botoes = sqlReturn[2].Records;
        objeto.Graficos = sqlReturn[3].Records;
        objeto.Campos = sqlReturn[4].Records;
        objeto.Grades = sqlReturn[5].Records;
        objeto.Record = null;
      }

      const uiGrid = Geeks.ERP.UI.Grid

      contentBody.find("ul[name='MenuBotoes']")
        .prepend(Geeks.Async.UI.Tela.MontaBotoes(objeto.Botoes, null))

      let larguraSessao = 0

      $.each(objeto.Sessoes, function (key, sessao) {

        let sessaoBody = contentBody.find(".fluid")

        // Sessão única somente vem preenchido quando a tela form a edição de grade, neste caso, não usa o template de sessão
        if (sessao.TipoSessao != "unica") {

          larguraSessao += parseInt(sessao.Largura);

          sessaoBody = $(Geeks.ERP.UI.Template.Get("SessaoTemplate").format(
            {
              CodigoSessao: sessao.CodigoSessao,
              Tipo: sessao.TipoSessao.toLowerCase() == "grade" ? "Grade" : "",
              Largura: sessao.Largura,
              Alinhamento: sessao.Alinhamento,
              Layout: sessao.Layout.toLowerCase() == "opened" ? "opened inactive" : (sessao.Layout == "closed" ? "closed normal" : ""),
              Descricao: sessao.Descricao,
              Estilo: sessao.TipoSessao.toLowerCase() == "grade" ? "overflow-x: auto; " : ""
            })).appendTo(contentBody.find(".fluid"));

          if (larguraSessao > 12) {
            larguraSessao = sessao.Largura;
            //sessaoBody.css("clear", "both");
          }

          //Se nao for usuário Grupo Geeks, remove todos os objetos que não são para admin
          if (($("#hfUsuarioAdm").val() != "true") || ($("#hfUsuarioAdm").val() == "true" && $("#hfGrupoInterno").val() != "1"))
            sessaoBody.find("[just-adm=true]").remove();

          //Se não for sessão tipo grid, remove todos os objetos que são do tipo grade
          if (sessao.TipoSessao.toLowerCase() != "grade")
            sessaoBody.find("[just-grade=true]").remove();

          //Se não for sessão tipo campo, remove todos os objetos que são do tipo campo
          if (sessao.TipoSessao.toLowerCase() != "campo")
            sessaoBody.find("[just-campo=true]").remove();

          //Se não for sessão tipo grafico, remove todos os objetos que são do tipo grafico
          if (sessao.TipoSessao.toLowerCase() != "gráfico")
            sessaoBody.find("[just-grafico=true]").remove();

          //Acerta o tamanho da sessão
          if (sessao.TipoSessao != "Campo") {
            if (sessao.Tamanho == "" || sessao.Tamanho == null) {
              if (sessaoBody.parents(".wrapper").parent().attr("ref") == "contentBody" && $(window).height() > 300) {
                let height = $(window).height() - sessaoBody.parents(".wrapper").parent().position().top;

                $.each(sessaoBody.parents(".wrapper").siblings(), function () {
                  height -= $(this).outerHeight();
                });

                $.each(sessaoBody.find(".body").siblings(), function () {
                  height -= $(this).outerHeight();
                });

                sessao.Tamanho = (height - sessaoBody.outerHeight()) + 20;
              } else {
                sessao.Tamanho = 300;
              }
            }

            if (sessao.Tamanho)
              sessaoBody.find(".body").css("height", sessao.Tamanho);
          } else {
            if (sessao.Tamanho != "" && sessao.Tamanho != null) {
              sessaoBody.find(".body").css("height", sessao.Tamanho - 10);
            }
          }

          if (sessao.TipoSessao != "Campo") {
            sessaoBody.find(".body").css("padding-bottom", "0px");
            sessaoBody.find(".body").css("overflow", "hidden");
          }
        } else {
          contentBody.find(".fluid").append('<div class="body" name="sessao_' + sessao.CodigoSessao + '"></div>');
        }

        if (sessao.TipoSessao.toLowerCase() == "grade") {
          let grid = $.grep(objeto.Grades, function (value) {
            return value.CodigoSessao == sessao.CodigoSessao;
          });

          if (grid.length > 0) {
            uiGrid.Render(sessaoBody.find(".body"), grid[0], "", objeto.Estrutural);

            //Botão para editar as propriedades da grid
            sessaoBody.find("a[name=PropriedadeGrid]").click( async function () {
              const propriedadeGrid = await Geeks.Async.UI.Tela.OpenWindow("popup", contentBody, { CodigoObjeto: 0, NomeObjeto: "Propriedades", Descricao: "Propriedades da Grade \"" + sessao.Descricao + "\"", Estrutural: true }, null, false, true);

              uiGrid.Propriedade(grid[0], propriedadeGrid, objeto.Estrutural);

              if (event.stopPropagation) {
                event.stopPropagation();
              }

              event.cancelBubble = true;
            });
          }
        } else if (sessao.TipoSessao.toLowerCase() == "campo" || sessao.TipoSessao.toLowerCase() == "unica") {
          let larguraAtual = 0;
          let iniciaRow = true;
          let formRow = null;

          var campos = $.grep(objeto.Campos, function (value) {
            return value.CodigoSessao == sessao.CodigoSessao;
          });

          $.each(campos, function (index, campo) {

            var campoEForeignKey = $.grep(campos, function (campoForeign) {
              return campoForeign.CampoForeignKeyPrompt == campo.Id;
            });

            //Somente cria a linha, se o campo não for foreign key pra outro, no caso do prompt, pois neste caso, o campo prompt cria sozinho
            if (campoEForeignKey.length <= 0) {
              if (iniciaRow) {
                formRow = $("<div class=\"formRow\"></div>").appendTo(sessao.TipoSessao.toLowerCase() == "unica" ? sessaoBody : sessaoBody.find(".body"));
                iniciaRow = false;
              }

              formRow.append(Geeks.Async.UI.Tela.MontaCampos(sessao.Ordem, campo, objeto.Record, false, objeto.Estrutural));

              larguraAtual += parseInt(campo.LabelLargura) + parseInt(campo.CampoLargura);

              if (campos.length - 1 > index) {
                //Tem mais 1 campos
                var larguraTemp = campos[index + 1].LabelLargura + campos[index + 1].CampoLargura;

                if (larguraAtual + larguraTemp > 12)
                  larguraAtual = 12;
              }

              if (larguraAtual >= 12 || index == campos.length - 1) {
                larguraAtual = 0;
                formRow.append("<div class=\"clear\"></div>");
                iniciaRow = true;
              }
            }
          });
        } else if (sessao.TipoSessao.toLowerCase() == "grafico") {
          sessaoBody.find(".body").append("<div name=\"chart\" style=\"width: 100%; height: 100%\"/>");
        }

        //Botão para editar propriedades da sessão
        sessaoBody.find("a[name=BotaoSessao]").click(async function () {
          var campos = [];

          var opcoes = JSON.parse((await Geeks.Async.Core.Connection.ExecuteSQL("Select g.* from Sessao s left join Grid as g on g.CodigoSessao = s.CodigoSessao where s.CodigoSessao = 12 ", true)).Records[0].DtaLayout);

          $.each(opcoes.columns, function (index, campo) {
            if (opcoes.dataSource.schema.model.fields.hasOwnProperty(campo.field)) {
              var field = opcoes.dataSource.schema.model.fields[campo.field];

              campos.push(
                {
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
                  Visivel: !campo.hidden,
                  GravaCampoNoBanco: campo.GravaCampoNoBanco
                });
            }

          });

          var obj = {
            Descricao: "Propriedades da Sessão \"" + sessao.Descricao + "\"",
            CodigoObjeto: 12,
            NomeObjeto: "Propriedades",
            Estrutural: true,
            Sessoes: [
              {
                CodigoSessao: 1,
                TipoSessao: "unica",
                Ordem: 1
              }],
            Campos: campos,
            Record: sessao,
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

          var propriedadeSessao = await Geeks.Async.UI.Tela.OpenWindow("popupEdit", contentBody, obj, null, true, true);

          var diag = propriedadeSessao.dialog({
            modal: true,
            width: 600,
            height: 600,
            resizable: true,
            close: function () {
              propriedadeSessao.remove();
            }
          }).dialog("open");

          propriedadeSessao.find("a[name=btn_Salvar]").click(async function () {
            var campo = "";
            var where = "";

            $.each(propriedadeSessao.find("input, select, textarea"), function () {
              var fieldData = $(this).data("FieldData");

              if (fieldData)
                if (!fieldData.Leitura && !fieldData.Identificador && fieldData.GravaCampoNoBanco) {
                  campo += campo ? ',' : '';

                  if (fieldData.TipoCampo != "checagem") {
                    if (($(this).val() == 'null' || $(this).val() == '' || $(this).val() == null) && fieldData.TipoCampo != "numero")
                      campo += fieldData.Id + " = null";
                    else if (($(this).val() == 'null' || $(this).val() == '' || $(this).val() == null) && fieldData.TipoCampo == "numero")
                      campo += fieldData.Id + " = 0";
                    else
                      campo += fieldData.Id + " = '" + $(this).val() + "'";
                  } else {
                    campo += fieldData.Id + " = " + ($(this).prop("checked") ? "1" : "0") + "";
                  }
                } else {
                  where += where ? ' AND ' : ' WHERE ';
                  where += fieldData.Id + " = '" + $(this).val() + "'";
                }
            });

            await Geeks.Async.Core.Connection.ExecuteSQL('UPDATE Sessao SET ' + campo + where, true);

            diag.dialog('close');
          });

          propriedadeSessao.find("a[name=btn_Cancelar]").click(function () {
            diag.dialog('close');
          });

          if (event.stopPropagation) {
            event.stopPropagation();
          }

          event.cancelBubble = true;
        });

        //Botão para editar os campos da sessão
        sessaoBody.find("a[name=BotaoComponente]").click(async function () {
          var idCampos = "";
          var nomeSessao = "";

          if (sessao.TipoSessao.toLowerCase() == 'campo') {
            idCampos = "13";
            nomeSessao = "Campos";
          } else if (sessao.TipoSessao.toLowerCase() == 'gráfico') {
            idCampos = "23";
            nomeSessao = "Gráfico";
          }

          var camposSessao = await Geeks.Async.UI.Tela.OpenWindow("popup", contentBody, { CodigoObjeto: 0, NomeObjeto: "Sessao", Descricao: nomeSessao + " da Sessão \"" + sessao.Descricao + "\"", Estrutural: true }, null, false, true);

          var diag = camposSessao.dialog({
            modal: true,
            width: "80%",
            height: 600,
            resizable: true,
            close: function () {
              camposSessao.remove();
            }
          }).dialog("open");

          $("<ul name='MenuBotoes'><ul>")
            .prependTo(camposSessao.find('.breadLine > .breadLinks'))
            .append(Geeks.Async.UI.Tela.MontaBotoes([
              {
                Nome: "Cancelar",
                Valor: "Cancelar",
                CodigoBotao: "S2",
                Icone: "icon-minus"
              }
            ], null))
            .find("a[name=btn_Cancelar]").click(function () {
              diag.dialog('close');
            });

          var grid = (await Geeks.Async.Core.Connection.ExecuteSQL("select * from Grid Where CodigoGrid = " + idCampos, true)).Records[0];
          grid.sessao = sessao.CodigoSessao;

          var gridContent = $("<div name='promptBotAdm_" + sessao.CodigoSessao + "'></div>")
            .appendTo(camposSessao.find(".fluid"));

          uiGrid.Render(gridContent, grid, true, true);

          camposSessao.find("[name^=kendogrid_]").data("kendoGrid").filter = "CodigoSessao = " + sessao.CodigoSessao;
          camposSessao.find("[name^=kendogrid_]").data("kendoGrid").foreignKeyName = "CodigoSessao";
          camposSessao.find("[name^=kendogrid_]").data("kendoGrid").foreignKeyValue = sessao.CodigoSessao;
          camposSessao.find("[name^=kendogrid_]").data("kendoGrid").Fill();

          if (event.stopPropagation) {
            event.stopPropagation();
          }

          event.cancelBubble = true;
        });
      });

      objeto.Target = contentBody;
      objeto.TelaDesabilitada = false;

      objeto.DataSource = Geeks.Async.UI.Tela.dataSource(objeto);

      contentBody.data("GeeksForm", objeto);

      $(objeto.Target).find(".breadLine .breadLinks").find("ul[name=MenuBotoes]").find("a[VisivelComRegistro=true]").parent().css("display", "none")
    resolve()
    })
  },

  MontaBotoes: function (botoes, codigoPai) {
    var ret = $("<div>");

    var nivelBotao = $.grep(botoes, function (value) {
      return value.CodigoPai == codigoPai;
    });
    var total = nivelBotao.length;
    $.each(nivelBotao, function (key, botao) {
      var botoesFilhos = $.grep(botoes, function (value) {
        return value.CodigoPai == botao.CodigoBotao;
      });

      var li = $("<li></li>")
        .addClass(botoesFilhos.length > 0 ? "has" : "");

      var a = $("<a title='" + botao.Valor + "' name='btn_" + botao.Nome + "' VisivelComRegistro='" + botao.VisivelComRegistro + "'></a>");
      if (key === total - 1 && codigoPai != null) a.addClass("noBorderB");
      a.appendTo(li);

      $("<i class='" + botao.Icone + "'></i>").appendTo(a);
      $("<span>" + botao.Valor + "</span>").appendTo(a);

      if (botoesFilhos.length > 0) {
        var ul = $("<ul></ul>").css("display", "none")
          .appendTo(li);

        ul.append(Geeks.Async.UI.Tela.MontaBotoes(botoesFilhos, botao.CodigoBotao));
      }

      ret.append(li);
    });

    return $(ret.html());
  },

  MontaCampos: function (tabindex, campo, record, force100Percent, structural) {
    var retorno = "";
    tabindex = parseInt(tabindex) * 100;

    var getFieldValue = function () {
      if (record) {
        if (record.hasOwnProperty(campo.Id)) {
          return record[campo.Id] ? record[campo.Id] : ((campo.ValorPadrao) ? campo.ValorPadrao : "");
        }
      }

      return ((campo.ValorPadrao) ? campo.ValorPadrao : "");
    }

    var getFieldValuePrompt = function () {
      if (record) {
        if (record.hasOwnProperty(campo.CampoForeignKeyPrompt))
          return record[campo.CampoForeignKeyPrompt] ? record[campo.CampoForeignKeyPrompt] : ((campo.ValorPadrao) ? campo.ValorPadrao : "");
      }

      return ((campo.ValorPadrao) ? campo.ValorPadrao : "");
    }

    if (campo.Visivel) {
      switch (campo.TipoCampo.toLowerCase()) {
        case "texto":
          if (campo.LabelLargura != 0 && campo.LabelLargura != null)
            retorno = "<div class=\"grid" + (force100Percent ? 4 : campo.LabelLargura) + "\">" +
              "<label for=\"" + campo.Id + "\">" + campo.Label + "</label>" +
              "</div>";

          if (campo.CampoLargura != 0 && campo.LabelLargura != null) {
            retorno += "<div class=\"grid" + (force100Percent ? 8 : campo.CampoLargura) + "\">" +
              "<input class=\"align" + (campo.Alinhamento != "auto" ? campo.Alinhamento : "left") + "\" type=\"text\" name=\"" + campo.Id + "\" id=\"" + campo.Id + "\"  value=\"" + getFieldValue() + "\" tabindex=\"" + (tabindex + parseInt(campo.Ordem)) + "\" " + (campo.Obrigatorio ? "required" : "") + "  ";
            if (campo.Leitura)
              retorno += " readonly=\"readonly\" disabled=\"disabled\" style=\"background-color: var(--geeks-lightGray);\" ";
            retorno += "></div>";
          }
          break;
        case "email":
          if (campo.LabelLargura != 0 && campo.LabelLargura != null)
            retorno = "<div class=\"grid" + campo.LabelLargura + "\">" +
              "<label for=\"" + campo.Id + "\">" + campo.Label + "</label>" +
              "</div>";
          if (campo.CampoLargura != 0 && campo.LabelLargura != null) {
            retorno += "<div class=\"grid" + (force100Percent ? 8 : campo.CampoLargura) + "\">" +
              "<input class=\"align" + (campo.Alinhamento != "auto" ? campo.Alinhamento : "left") + " inputEmail\" type=\"text\" value=\"" + getFieldValue() + "\"  id=\"" + campo.Id + "\" " + (campo.Obrigatorio ? "required" : "") + " class=\"validate[required,custom[email]]\" name=\"" + campo.Id + "\" tabindex=\"" + (tabindex + parseInt(campo.Ordem)) + "\"  ";
            if (campo.Leitura)
              retorno += " readonly=\"readonly\" disabled=\"disabled\" style=\"background-color: var(--geeks-lightGray);\" ";
            retorno += "></div>";
          }
          break;
        case "valor":
          if (campo.LabelLargura != 0 && campo.LabelLargura != null)
            retorno = "<div class=\"grid" + (force100Percent ? 4 : campo.LabelLargura) + "\">" +
              "<label for=\"" + campo.Id + "\">" + campo.Label + "</label>" +
              "</div>";
          if (campo.CampoLargura != 0 && campo.LabelLargura != null) {
            retorno += "<div class=\"grid" + (force100Percent ? 8 : campo.CampoLargura) + "\">" +
              "<input class=\"align" + (campo.Alinhamento != "auto" ? campo.Alinhamento : "right") + " inputMoeda\" type=\"text\" value=\"" + getFieldValue() + "\" name=\"" + campo.Id + "\"  id=\"" + campo.Id + "\" " + (campo.Obrigatorio ? "required" : "") + " tabindex=\"" + (tabindex + parseInt(campo.Ordem)) + "\"  ";
            if (campo.Leitura)
              retorno += " readonly=\"readonly\" disabled=\"disabled\" style=\"background-color: var(--geeks-lightGray);\" ";
            retorno += "></div>";
          }
          break;
        case "valor4":
          if (campo.LabelLargura != 0 && campo.LabelLargura != null)
            retorno = "<div class=\"grid" + (force100Percent ? 4 : campo.LabelLargura) + "\">" +
              "<label for=\"" + campo.Id + "\">" + campo.Label + "</label>" +
              "</div>";
          if (campo.CampoLargura != 0 && campo.LabelLargura != null) {
            retorno += "<div class=\"grid" + (force100Percent ? 8 : campo.CampoLargura) + "\">" +
              "<input class=\"align" + (campo.Alinhamento != "auto" ? campo.Alinhamento : "right") + " inputValor4\" type=\"text\" value=\"" + getFieldValue() + "\" name=\"" + campo.Id + "\"  id=\"" + campo.Id + "\" " + (campo.Obrigatorio ? "required" : "") + " tabindex=\"" + (tabindex + parseInt(campo.Ordem)) + "\"  ";
            if (campo.Leitura)
              retorno += " readonly=\"readonly\" disabled=\"disabled\" style=\"background-color: var(--geeks-lightGray);\" ";
            retorno += "></div>";
          }
          break;
        case "numero":
          if (campo.LabelLargura != 0 && campo.LabelLargura != null)
            retorno = "<div class=\"grid" + (force100Percent ? 4 : campo.LabelLargura) + "\">" +
              "<label for=\"" + campo.Id + "\">" + campo.Label + "</label>" +
              "</div>";
          if (campo.CampoLargura != 0 && campo.LabelLargura != null) {
            retorno += "<div class=\"grid" + (force100Percent ? 8 : campo.CampoLargura) + "\">" +
              "<input class=\"align" + (campo.Alinhamento != "auto" ? campo.Alinhamento : "right") + " inputNumero\" type=\"text\" name=\"" + campo.Id + "\"  id=\"" + campo.Id + "\" value=\"" + getFieldValue() + "\" tabindex=\"" + (tabindex + parseInt(campo.Ordem)) + "\" " + (campo.Obrigatorio ? "required" : "");
            if (campo.Leitura)
              retorno += " readonly=\"readonly\" disabled=\"disabled\" style=\"background-color: var(--geeks-lightGray);\" ";
            retorno += "></div>";
          }
          break;
        case "data":
          if (campo.LabelLargura != 0 && campo.LabelLargura != null)
            retorno = "<div class=\"grid" + (force100Percent ? 4 : campo.LabelLargura) + "\">" +
              "<label for=\"" + campo.Id + "\">" + campo.Label + "</label>" +
              "</div>";
          if (campo.CampoLargura != 0 && campo.LabelLargura != null) {
            retorno += "<div class=\"grid" + (force100Percent ? 8 : campo.CampoLargura) + "\">" +
              "<input type=\"text\" name=\"" + campo.Id + "\" " + (campo.Obrigatorio ? "required" : "") + " maxlength=\"10\"  value=\"" + (getFieldValue() ? kendo.toString(getFieldValue(), "dd/MM/yyyy") : "") + "\" tabindex=\"" + (tabindex + parseInt(campo.Ordem)) + "\" ";
            if (campo.Leitura)
              retorno += " readonly=\"readonly\" disabled=\"disabled\" style=\"background-color: var(--geeks-lightGray);\" ";
            else
              retorno += " class=\"datepicker\"";
            retorno += "></div>";
          }
          break;
        case "datahora":
          if (campo.LabelLargura != 0 && campo.LabelLargura != null)
            retorno = "<div class=\"grid" + (force100Percent ? 4 : campo.LabelLargura) + "\">" +
              "<label for=\"d_" + campo.Id + "\">" + campo.Label + "</label>" +
              "</div>";
          if (campo.CampoLargura != 0 && campo.LabelLargura != null) {
            retorno += "<div class=\"grid" + (force100Percent ? 8 : campo.CampoLargura) + "\">" +
              "<div style=\"float:left; width: 48%\"><input type=\"text\"  name=\"d_" + campo.Id + "\" maxlength=\"10\"  value=\"" + (getFieldValue() ? kendo.toString(getFieldValue(), "dd/MM/yyyy") : "") + "\" tabindex=\"" + (tabindex + parseInt(campo.Ordem)) + "\" " + (campo.Obrigatorio ? "required" : "") + " onchange=\"SetaValorDataHora(this);\" ";

            if (campo.Leitura)
              retorno += " readonly=\"readonly\" disabled=\"disabled\" style=\"background-color: var(--geeks-lightGray); width: 100% !important;\"  ";
            else
              retorno += " class=\"datepicker\" style=\"width: 100% !important;\"";

            retorno += "></div>";
            retorno += "<div style=\"float:right;  width: 48%;\"><input type=\"text\" " + (campo.Obrigatorio ? "required" : "") + " name=\"t_" + campo.Id + "\" value=\"" + (getFieldValue() ? kendo.toString(getFieldValue(), "HH:mm:ss") : "") + "\" tabindex=\"" + (tabindex + parseInt(campo.Ordem)) + "\" onchange=\"SetaValorDataHora(this);\" ";

            if (campo.Leitura)
              retorno += " readonly=\"readonly\" disabled=\"disabled\" style=\"background-color: var(--geeks-lightGray); width: 100% !important;\"  ";
            else
              retorno += " class=\"timepicker\" style=\"width: 100% !important;\"";

            retorno += "></div><input type=\"hidden\" name=\"" + campo.Id + "\" value=\"" + (getFieldValue() ? kendo.toString(getFieldValue(), "dd/MM/yyyy HH:mm:ss") : "") + "\"/></div>";
          }

          break;
        case "selecao":
          if (campo.LabelLargura != 0 && campo.LabelLargura != null) {
            retorno = "<div class=\"grid" + (force100Percent ? 4 : campo.LabelLargura) + "\">";
            retorno += " <label for=\"" + campo.Id + campo.CodigoCampo + "\">" + campo.Label + "</label>";
            retorno += "</div>";
          }
          if (campo.CampoLargura != 0 && campo.LabelLargura != null) {
            retorno += "<div class=\"grid" + (force100Percent ? 8 : campo.CampoLargura) + "\">";
            retorno += "    <select data-placeholder=\"Selecione uma opção\" name=\"" + campo.Id + campo.CodigoCampo + "\" tabindex=\"" + (tabindex + parseInt(campo.Ordem)) + "\"  id=\"" + campo.Id + campo.CodigoCampo + "\" " + (campo.Obrigatorio ? "required=false" : "required=true");

            if (campo.Leitura) retorno += " disabled=\"disabled\" ";

            retorno += " class=\"select \">";

            if (campo.SentencaSQL != null || campo.SentencaSQL != "") {

              var opcoes = (campo.SentencaSQL ? campo.SentencaSQL : "").split('\n');

              $.each(opcoes, function (key, item) {
                retorno += "        <option value=\"" + item.split("=")[0] + "\" " + (getFieldValue() == item.split("=")[0] ? "selected" : "") + ">" + item.split("=")[1] + "</option>";
              });
            }

            retorno += "    </select>";
            retorno += "</div>";
          }
          break;
        case "prompt":
          if (campo.LabelLargura != 0 && campo.LabelLargura != null) {
            retorno = "<div class=\"grid" + (force100Percent ? 4 : campo.LabelLargura) + "\">";
            retorno += "    <label for=\"" + campo.CampoForeignKeyPrompt + "\">" + campo.Label + "</label>";
            retorno += "</div>";
          }
          if (campo.CampoLargura != 0 && campo.LabelLargura != null) {
            retorno += "<div class=\"grid" + (force100Percent ? 8 : campo.CampoLargura) + "\">";

            retorno += "   <input type=\"text\" data=\"prompt\" " + " tabindex=\"" + (tabindex + parseInt(campo.Ordem)) + "\" ";

            if (campo.Leitura)
              retorno += " readonly=\"readonly\" disabled=\"disabled\" style=\"background-color: var(--geeks-lightGray);\" ";

            retorno += " id=\"" + (campo.CampoForeignKeyPrompt ? campo.CampoForeignKeyPrompt : campo.Id) + "\"  name=\"promptDisplay_" + (campo.CampoForeignKeyPrompt ? campo.CampoForeignKeyPrompt : campo.Id) + "\"  " + (campo.Obrigatorio ? "required" : "") + " value=\"" + getFieldValue() + "\" " + (!campo.Leitura && !campo.CampoForeignKeyPrompt ? "onchange=\"SetaValorPrompt(this, '" + campo.Id + "');\"" : "") + "><input type=\"hidden\" name=\"" + (campo.CampoForeignKeyPrompt ? campo.CampoForeignKeyPrompt : campo.Id) + "\" value=\"" + (campo.CampoForeignKeyPrompt ? getFieldValuePrompt() : getFieldValue()) + "\"/>";
            retorno += "   <img src=\"Content/Plugins/Aquincum/images/icons/usual/icon-create2.png\" id=\"img_" + campo.CodigoCampo + "\" alt=\"Clicar\" class=\"fieldIcon\" style=\"cursor: pointer;\"  > ";

            retorno += "</div>";
          }
          break;
        case "checagem":
          if (campo.LabelLargura != 0 && campo.LabelLargura != null)
            retorno = "<div class=\"grid" + (force100Percent ? 4 : campo.LabelLargura) + "\"><label for=\"" + campo.Id + "\">" + campo.Label + "</label></div>";
          if (campo.CampoLargura != 0 && campo.LabelLargura != null) {
            retorno += "<div class=\"grid" + (force100Percent ? 8 : campo.CampoLargura) + "\"><input type=\"checkbox\" class=\"check\" name=\"" + campo.Id + "\"  id=\"" + campo.Id + "\" " + (getFieldValue() == "1" || getFieldValue() == true || getFieldValue() == "true" ? "checked" : "") + " tabindex=\"" + (tabindex + parseInt(campo.Ordem)) + "\" " + (campo.Obrigatorio ? "required" : "") + " ";
            if (campo.Leitura)
              retorno += " readonly=\"readonly\" disabled=\"disabled\" ";
            retorno += "></div>";
          }
          break;
        case "textolongo":
          if (campo.LabelLargura != 0 && campo.LabelLargura != null) {
            retorno = "<div class=\"grid" + (force100Percent ? 4 : campo.LabelLargura) + "\">";
            retorno += "    <label for=\"" + campo.Id + "\">" + campo.Label + "</label>";
            retorno += "</div>";
          }
          if (campo.CampoLargura != 0 && campo.LabelLargura != null) {
            retorno += "<div class=\"grid" + (force100Percent ? 8 : campo.CampoLargura) + "\">";

            //retorno += "   <input type=\"text\" name=\"" + campo.Id + "\" id=\"" + campo.Id + "\" " + (campo.Obrigatorio ? "required" : "") + " value = '" + getFieldValue().replace(/\r/g, "\\r").replace(/\n/g, "\\n") + "'";
            retorno += "   <textarea name=\"" + campo.Id + "\" id=\"" + campo.Id + "\" " + (campo.Obrigatorio ? "required" : "") + " rows='1' " + " tabindex=\"" + (tabindex + parseInt(campo.Ordem)) + "\" ";

            if (campo.Leitura)
              retorno += " readonly=\"readonly\" disabled=\"disabled\" style=\"padding-right: 20px; background-color: var(--geeks-lightGray); overflow-x: hidden;\"></textarea>";
            else
              retorno += "style='padding-right: 20px; overflow-x: hidden;'></textarea>";

            retorno += "   <img src=\"Content/Plugins/Aquincum/images/icons/usual/icon-books2.png\" alt=\"Clicar\" class=\"fieldIcon\" style=\"cursor: pointer; right: 15px;\"  > ";
            retorno += "</div>";
          }
          break;
        case "editorhtml":
          if (campo.LabelLargura != 0 && campo.LabelLargura != null) {
            retorno = "<div class=\"grid" + (force100Percent ? 4 : campo.LabelLargura) + "\">";
            retorno += "    <label for=\"" + campo.Id + "\">" + campo.Label + "</label>";
            retorno += "</div>";
          }
          if (campo.CampoLargura != 0 && campo.LabelLargura != null) {
            retorno += "<div class=\"grid" + (force100Percent ? 8 : campo.CampoLargura) + "\">";

            retorno += "   <input type=\"text\" name=\"" + campo.Id + "\" id=\"" + campo.Id + "\" " + (campo.Obrigatorio ? "required" : "") + " value='' " + " tabindex=\"" + (tabindex + parseInt(campo.Ordem)) + "\" ";

            if (campo.Leitura)
              retorno += " readonly=\"readonly\" disabled=\"disabled\" style=\"background-color: var(--geeks-lightGray);\" ";

            retorno += "> ";
            retorno += "   <img src=\"Content/Plugins/Aquincum/images/icons/usual/icon-books2.png\" alt=\"Clicar\" class=\"fieldIcon\" style=\"cursor: pointer;\"  > ";

            retorno += "</div>";
          }

          break;
        case "senha":
          if (campo.LabelLargura != 0 && campo.LabelLargura != null)
            retorno = "<div class=\"grid" + (force100Percent ? 4 : campo.LabelLargura) + "\"><label for=\"" + campo.Id + "\">" + campo.Label + "</label></div>";
          if (campo.CampoLargura != 0 && campo.LabelLargura != null) {
            retorno += "<div class=\"grid" + (force100Percent ? 8 : campo.CampoLargura) + "\"><input type=\"password\" name=\"" + campo.Id + "\"  id=\"" + campo.Id + "\" " + (campo.Obrigatorio ? "required" : "") + " value=\"" + getFieldValue() + "\" tabindex=\"" + (tabindex + parseInt(campo.Ordem)) + "\" ></div>";
          }
          break;
        case "arquivo":
          if (campo.LabelLargura != 0 && campo.LabelLargura != null)
            retorno = "<div class=\"grid" + (force100Percent ? 4 : campo.LabelLargura) + "\"><label for=\"name_" + campo.Id + "\">" + campo.Label + "</label></div>";
          if (campo.CampoLargura != 0 && campo.LabelLargura != null) {
            retorno += "<div class=\"grid" + (force100Percent ? 8 : campo.CampoLargura) + "\"><input type=\"file\" class=\"fileInput\" name=\"file_" + campo.Id + "\"  id=\"file_" + campo.Id + "\"  tabindex=\"" + (tabindex + parseInt(campo.Ordem)) + "\" style=\"opacity: 0;\" ";
            if (campo.Leitura)
              retorno += " readonly=\"readonly\" disabled=\"disabled\" style=\"background-color: var(--geeks-lightGray);\" ";

            retorno += ">";
            retorno += "<div style=\"display: " + (getFieldValue() == "" ? "none" : "table-cell") + ";\"><input type=\"hidden\" name=\"" + campo.Id + "\" value=\"" + getFieldValue() + "\"/><table style=\"margin-left: 10px\"><tr><td style=\"vertical-align: middle;\"><a name= \"view_" + campo.Id + "\" href=\"\" target=\"_blank\" title=\"Download\"><i class=\"icos-cloud-download\"></i></a></td><td style=\"vertical-align: middle;\"><a name= \"delete_" + campo.Id + "\" title=\"Remover\"><i class=\"k-icon k-delete\" style=\"width: 14px; height: 14px;\"></i></a></td></tr></table></div>";
            retorno += "</div>";
          }

          break;
        default:
          retorno = "";
          break;
      }
    } else {
      retorno = "<input type=\"hidden\" name=\"" + campo.Id + "\" value=\"" + getFieldValue() + "\"/>";
    }

    var campoAdicionado = $(retorno);

    //#region ::. Rotina para montar prompts .::

    if (campo.TipoCampo.toLowerCase() == "prompt") {
      campoAdicionado.find("input[type=hidden]").data("GeeksForm", { SentencaSQL: campo.SentencaSQL });

      campoAdicionado.find("img").click(function () {
        if (!$(this).parents('[ref=contentBody]').data('GeeksForm').TelaDesabilitada) {

          if (!$(this).siblings("input[type=hidden]").data("GeeksForm") || !$(this).siblings("input[type=hidden]").data("GeeksForm").SentencaSQL) {
            jError("Não existe uma sentença configurada para o prompt!", "Atenção");
            return;
          }

          var prompt = new Geeks.ERP.Prompt(this, "", $(this).siblings("input[type=hidden]").data("GeeksForm").SentencaSQL, structural);
          prompt.Configuracao(1, "Código", 50, 1);
          prompt.Configuracao(2, "Descrição", 250, 0);
          prompt.Show();

        }
      });
    }
    else if (campo.TipoCampo.toLowerCase() == "textolongo") {
      campoAdicionado.find("textarea").val(getFieldValue());

      campoAdicionado.find("img").click(function () {
        if (!$(this).parents('[ref=contentBody]').data('GeeksForm').TelaDesabilitada) {
          new Geeks.ERP.PromptTexto(this, campo).Show($(this).siblings("textarea").val());
        }
      });
    }
    else if (campo.TipoCampo.toLowerCase() == "editorhtml") {
      campoAdicionado.find("input").val(getFieldValue());

      campoAdicionado.find("img").click(function () {
        if (!$(this).parents('[ref=contentBody]').data('GeeksForm').TelaDesabilitada) {
          new Geeks.ERP.PromptHtml(this, campo).Show($(this).siblings("input").val());
        }
      });
    } else if (campo.TipoCampo.toLowerCase() == "arquivo") {
      campoAdicionado.find("input[name=file_" + campo.Id + "]").change(function () {
        var reader = new FileReader();

        reader.onload = (function (theFile) {
          var file = theFile;

          return function (e) {
            campoAdicionado.find("input[name=" + campo.Id + "]").val(e.target.result + "#$#" + file.name + "#$#" + file.type);
          };
        })(this.files[0]);

        reader.readAsDataURL(this.files[0]);
      });

      campoAdicionado.find("a[name=delete_" + campo.Id + "]").click(function () {
        campoAdicionado.find("input[name=" + campo.Id + "]").val("");
      });

      campoAdicionado.find("input[name=" + campo.Id + "]").change(function () {
        $(this).parent().siblings("div").find("span.filename").html("Selecione ou arraste um arquivo aqui");
        $(this).parent().siblings("div").find("span.action").html("Selecione um arquivo");
        $(this).siblings().find("a[name=view_" + campo.Id + "]").removeAttr("download");
        $(this).siblings().find("a[name=view_" + campo.Id + "]").removeAttr("href");
        $(this).parent().css("display", "none");

        if (this.value) {
          $(this).parent().css("display", "table-cell");

          var file = campoAdicionado.find("input[name=" + campo.Id + "]").val().split("#$#");

          $(this).parent().siblings("div").find("span.filename").html(file[1]);

          $(this).siblings().find("a[name=view_" + campo.Id + "]").attr("download", file[1]);
          $(this).siblings().find("a[name=view_" + campo.Id + "]").attr("href", file[0]);
        }
      });
    }

    //#endregion

    $(campoAdicionado).find("[name=" + campo.Id + "]").data("FieldData", campo);

    return campoAdicionado;
  },

  FormataCampos: function (target) {
    target.find(".opened").on("collapsiblecreate", function () {
      $(this).unbind();
    });

    target.find('.opened').collapsible({
      defaultOpen: 'opened',
      cssOpen: 'inactive',
      cssClose: 'normal',
      speed: 200
    });

    target.find(".closed").on("collapsiblecreate", function () {
      $(this).unbind();
    });

    target.find('.closed').collapsible({
      defaultOpen: '',
      cssOpen: 'inactive',
      cssClose: 'normal',
      speed: 200
    });

    $.each(target.find('.opened'), function (k, v) {
      target.find(v).next().show();
    });

    target.find(".datepicker").unbind().datepicker({
      showOtherMonths: true,
      changeMonth: true,
      changeYear: true,
      autoSize: true,
      //appendText: 'dd/mm/yy',
      dateFormat: 'dd/mm/yy',
      weekHeader: 'Semana',
      dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
      dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      nextText: 'Próximo',
      prevText: 'Anterior'
    });

    target.find(".check, .check :checkbox, input:radio, input:file").uniform();
    target.find(".check, .check :checkbox, input:radio, input:file").parent().siblings("div").find("input:hidden").change();

    target.find(".editor").cleditor({
      width: "100%",
      height: "250px",
      bodyStyle: "margin: 10px; font: 12px Arial,Verdana; cursor:text",
      useCSS: true
    });

    target.find("#resize, #resize2").colResizable({
      liveDrag: true,
      draggingClass: "dragging"
    });

    target.find(".select").chosen();
    target.find(".select").siblings().css("width", "100%");

    //===== Tabs =====//
    $.fn.contentTabs = function () {

      target.find(".tab_content").hide(); //Hide all content
      target.find("ul.tabs li:first").addClass("activeTab").show(); //Activate first tab
      target.find(".tab_content:first").show(); //Show first tab content

      target.find("ul.tabs li").click(function () {
        $(this).parent().parent().find("ul.tabs li").removeClass("activeTab"); //Remove any "active" class
        $(this).addClass("activeTab"); //Add "active" class to selected tab
        $(this).parent().parent().find(".tab_content").hide(); //Hide all tab content
        var activeTab = $(this).find("a").attr("href"); //Find the rel attribute value to identify the active tab + content
        $(activeTab).show(); //Fade in the active content
        return false;
      });

    };
    target.find("div[class^='widget']").contentTabs(); //Run function on any div with class name of "Content Tabs"

    target.find(".formRow").find("input[type=hidden]").each(function () {
      if ($(this).siblings().length <= 1) {
        $(this).parent().css("display", "none");
      }
    });

    var maxZ = Math.max.apply(null, $.map($('body > *'), function (e, n) {
      if ($(e).css('position') == 'absolute')
        return parseInt($(e).css('z-index')) || 1;
    })
    ) + 99999;

    target.find("[name][type!=checkbox]:tabbable:visible").each(function () {
      $(this).attr("tabindex", maxZ++);
    });

    target.find("[name][type!=checkbox]:tabbable:visible:last").keydown(function (e) {
      var code = e.keyCode || e.which;
      if (code == '9') {
        target.find("[name]:tabbable:visible:first").focus();
        event.preventDefault();
      }
    });

    target.find(".inputMoeda").autoNumeric('init', { aSep: '.', aDec: ',', wEmpty: 'zero', vMin: '-999999999.99' });
    target.find(".inputMoeda").focusin(function () {
      if ($(this).val() == "0,00") $(this).val("0");
    });
    target.find(".inputValor4").autoNumeric('init', { aSep: '.', aDec: ',', wEmpty: 'zero', vMin: '-999999999.99', mDec: '4' });
    target.find(".inputValor4").focusin(function () {
      if ($(this).val() == "0,0000") $(this).val("0");
    });
    target.find('.inputNumero').numeric(",");

    target.find(".datepicker").mask("99/99/9999");
    target.find(".timepicker").mask("99:99:99");

    $.uniform.update();
  },

  integracao: async function (tela, container) {
    if (container[0].id.indexOf("popup") < 0) {
      if (tela == "PadraoNovo_Contatos") {
        var codigoContato = localStorage.getItem("codigoContato" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema);
        var nomeContato = localStorage.getItem("nomeContato" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema);
        if (codigoContato != null && codigoContato != "null" && container.find("input[name=CodigoContato]") && container.find("input[name=CodigoContato]").val() == "") {
          $.jGrowl("Contato " + nomeContato + " selecionado.");
          $.AtualizaContato(codigoContato);
        }
        else if (codigoContato != null && codigoContato != "null" && container.find("input[name=CodigoContato]") && container.find("input[name=CodigoContato]").val() != codigoContato) {
          var nomeContato = localStorage.getItem("nomeContato" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema);
          jConfirm("Deseja trocar para o Contato " + nomeContato + "?", "Mudar?", function (resposta) {
            if (resposta) {
              $.jGrowl("Contato " + nomeContato + " selecionado.");
              $.AtualizaContato(codigoContato);
            }
          });
        }
        else if (container.find("input[name=CodigoContato]") && container.find("input[name=CodigoContato]").val() == "")
          container.find("a[name=btn_Pesquisar]").click();
      }
      else if (tela == "PadraoNovo_Item") {
        var codigoItem = localStorage.getItem("codigoItem" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema);
        var nomeItem = localStorage.getItem("nomeItem" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema);
        if (codigoItem != null && codigoItem != "null" && container.find("input[name=CodigoItem]") && container.find("input[name=CodigoItem]").val() == "") {
          if (container.find("input[name=CodigoItem]").val() != codigoItem) $.jGrowl("Item " + nomeItem + " selecionado.");
          $.AtualizaItem(codigoItem);
        }
        else if (codigoItem != null && codigoItem != "null" && container.find("input[name=CodigoItem]") && container.find("input[name=CodigoItem]").val() != codigoItem) {
          var nomeItem = localStorage.getItem("nomeItem" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema);
          jConfirm("Deseja trocar para o Item " + nomeItem + "?", "Mudar?", function (resposta) {
            if (resposta) {
              $.jGrowl("Item " + nomeItem + " selecionado.");
              $.AtualizaItem(codigoItem);
            }
          });
        }
        else if (container.find("input[name=CodigoItem]") && container.find("input[name=CodigoItem]").val() == "")
          container.find("a[name=btn_Pesquisar]").click();
      }
      else if (tela == "PadraoNovo_Vendas_Industria" || tela == "PadraoNovo_Vendas_Varejo" || tela == "PadraoNovo_Vendas_Distribuidor" ||
        tela == "PadraoNovo_Vendas_Revenda" || tela == "OptiSoul_Vendas") {
        var codigoContato = localStorage.getItem("codigoContato" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema);
        if (codigoContato != null && codigoContato != "null") {
          var nomeContato = localStorage.getItem("nomeContato" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema);
          var usuarioLogado = JSON.parse(localStorage.getItem("dadosUsuario"));
          var sql = "";
          if (tela == "PadraoNovo_Vendas_Varejo") sql = " Select top 1 CodigoDocumento from Documento where Tipo='Venda' and DataHoraEmissao < getDate() and CodigoContato = 0" + codigoContato + " and CodigoContatoDigitador = (select CodigoContato from Contato where CodigoUsuario = '" + usuarioLogado.CodigoUsuario + "') order by CodigoDocumento desc";
          else sql = " Select top 1 CodigoDocumento from Documento where Tipo='Venda' and DataHoraEmissao < getDate() and CodigoContato = 0" + codigoContato + " order by CodigoDocumento desc";
          var retorno = await Geeks.Async.Core.Connection.ExecuteSQL(sql);
          if (retorno != null && retorno.Records.length > 0) {
            if (container.find("[name=CodigoDocumento]") && container.find("[name=CodigoDocumento]").val() == "") {
              $.jGrowl("Pedido " + retorno.Records[0].CodigoDocumento + " selecionado.");
              $.AtualizaVenda(retorno.Records[0].CodigoDocumento);
            }
            else if (container.find("[name=CodigoContato]") && container.find("[name=CodigoContato]").val() != codigoContato) //Já está selecionado e é outro cliente. Pergunta se quer mudar!
            {
              jConfirm("Deseja abrir o último pedido do Contato " + nomeContato + "?", "Mudar?", function (resposta) {
                if (resposta) {
                  $.jGrowl("Pedido " + retorno.Records[0].CodigoDocumento + " selecionado.");
                  $.AtualizaVenda(retorno.Records[0].CodigoDocumento);
                }
              });
            }
          }
          else {
            sql = "Select CodigoContato from Contato where CodigoUsuario = 0" + usuarioLogado.CodigoUsuario;
            retorno = await Geeks.Async.Core.Connection.ExecuteSQL(sql);
            var codigoContato = null;
            if (retorno != null && retorno.Records != null && retorno.Records.length > 0) codigoContato = retorno.Records[0].CodigoContato;
            if (((container.find("[name=CodigoDocumento]") && container.find("[name=CodigoDocumento]").val() == "") || container.find("[name=CodigoDocumento]") == null) && codigoContato != null) {
              container.find("a[name=btn_Incluir]").click();
            }
          }
        }
        else if (tela != "PadraoNovo_Vendas_Varejo") container.find("a[name=btn_Incluir]").click();
      }
      else if (tela == "PadraoNovo_Compras_NFEntrada") {
        var origem = localStorage.getItem("origemHistoricoItem" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema);
        if (origem == "true")
          localStorage.setItem("origemHistoricoItem" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema, "false");
        else {
          var codigoContato = localStorage.getItem("codigoContato" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema)
          if (codigoContato != null && codigoContato != "null") {
            var nomeContato = localStorage.getItem("nomeContato" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema)
            var retorno = await Geeks.Async.Core.Connection.ExecuteSQL(" Select top 1 CodigoDocumento from Documento where Tipo='Compra' and DataHoraEmissao < getDate() and CodigoContato = 0" + codigoContato + "order by CodigoDocumento desc")
            if (retorno != null && retorno.Records.length > 0) {
              if (container.find("[name=CodigoDocumento]") && container.find("[name=CodigoDocumento]").val() == "") {
                $.jGrowl("Pedido " + retorno.Records[0].CodigoDocumento + " selecionado.");
                $.AtualizaCompra(retorno.Records[0].CodigoDocumento);
              }
              else if (container.find("[name=CodigoContato]") && container.find("[name=CodigoContato]").val() != codigoContato) //Já está selecionado e é outro cliente. Pergunta se quer mudar!
              {
                jConfirm("Deseja abrir o último pedido do Contato " + nomeContato + "?", "Mudar?", function (resposta) {
                  if (resposta) {
                    $.jGrowl("Pedido " + retorno.Records[0].CodigoDocumento + " selecionado.");
                    $.AtualizaCompra(retorno.Records[0].CodigoDocumento);
                  }
                });
              }
            }
            else {
              if ((container.find("[name=CodigoDocumento]") && container.find("[name=CodigoDocumento]").val() == "") || container.find("[name=CodigoDocumento]") == null) container.find("a[name=btn_Incluir]").click();
            }
          }
          else container.find("a[name=btn_Incluir]").click();
        }
      }
      else if (tela == "PadraoNovo_Estoque") {
        var codigoItem = localStorage.getItem("codigoItem" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema);
        var nomeItem = localStorage.getItem("nomeItem" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema);
        if (codigoItem != null && codigoItem != "null" && container.find("input[name=Item]") && container.find("input[name=Item]").val() == "") {
          container.find("input[name=Item]").val(codigoItem);
          container.find("input[name=promptDisplay_Item]").val(nomeItem);
          container.find("a[name=btn_Pesquisa]").click();
        }
        else if (codigoItem != null && codigoItem != "null" && container.find("input[name=Item]") && container.find("input[name=Item]").val() != codigoItem) {
          var nomeItem = localStorage.getItem("nomeItem" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema);
          jConfirm("Deseja trocar para o Item " + nomeItem + "?", "Mudar?", function (resposta) {
            if (resposta) {
              container.find("input[name=Item]").val(codigoItem);
              container.find("input[name=promptDisplay_Item]").val(nomeItem);
              container.find("a[name=btn_Pesquisa]").click();
            }
          });
        }
        else if (container.find("input[name=Item]") && container.find("input[name=Item]").val() != "")
          container.find("a[name=btn_Pesquisa]").click();
      }
      else if (tela == "PadraoNovo_Estoque_Kardex") {
        var codigoItem = localStorage.getItem("codigoItem" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema);
        var nomeItem = localStorage.getItem("nomeItem" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema);
        if (codigoItem != null && codigoItem != "null" && codigoItem != "undefined" && container.find("input[name=Produto]") && container.find("input[name=Produto]").val() == "") {
          container.find("[name=Produto]").val(codigoItem);
          container.find("[name=promptDisplay_Produto]").val(nomeItem);
          container.find("[name=CodigoItem]").val(codigoItem);
          container.find("a[name=btn_Pesquisa]").click();

          //Carregar os lotes			
          var sentencaSql = "select distinct Case When LoteEmpresa is Null Then 'Nenhum' else LoteEmpresa End as LoteEmpresa from Kardex where CodigoItem = 0" + retorno.Codigo + " order by LoteEmpresa";
          var dados = await Geeks.Async.Core.Connection.ExecuteSQL(sentencaSql);
          if (dados != null && dados.Records.length > 0) {
            container.find("[name=Lote]").empty();
            container.find("[name=Lote]").append($("<option value=''>-- Selecione --</option>"));
            for (var i = 0; i < dados.Records.length; i++) {
              container.find("[name=Lote]").append($("<option value='" + dados.Records[i].LoteEmpresa + "'>" + dados.Records[i].LoteEmpresa + "</option>"));
            }
            container.find("[name=Lote]").val("");
            container.find("[name=Lote]").trigger('liszt:updated');
          }
        }
        else if (codigoItem != null && codigoItem != "null" && codigoItem != "undefined" && container.find("input[name=Produto]") && container.find("input[name=Produto]").val() != codigoItem) {
          var nomeItem = localStorage.getItem("nomeItem" + $("#hfCodigoSistema").data("GeeksData").CodigoClienteSistema);
          jConfirm("Deseja trocar para o Item " + nomeItem + "?", "Mudar?", async function (resposta) {
            if (resposta) {
              container.find("[name=Produto]").val(codigoItem);
              container.find("[name=promptDisplay_Produto]").val(nomeItem);
              container.find("[name=CodigoItem]").val(codigoItem);
              container.find("a[name=btn_Pesquisa]").click();

              //Carregar os lotes			
              var sentencaSql = "select distinct Case When LoteEmpresa is Null Then 'Nenhum' else LoteEmpresa End as LoteEmpresa from Kardex where CodigoItem = 0" + retorno.Codigo + " order by LoteEmpresa";
              const dados = await Geeks.Async.Core.Connection.ExecuteSQL(sentencaSql);
              if (dados != null && dados.Records.length > 0) {
                container.find("[name=Lote]").empty();
                container.find("[name=Lote]").append($("<option value=''>-- Selecione --</option>"));
                for (var i = 0; i < dados.Records.length; i++) {
                  container.find("[name=Lote]").append($("<option value='" + dados.Records[i].LoteEmpresa + "'>" + dados.Records[i].LoteEmpresa + "</option>"));
                }
                container.find("[name=Lote]").val("");
                container.find("[name=Lote]").trigger('liszt:updated');
              }
            }
          });
        }
      }
    }
  }
}
