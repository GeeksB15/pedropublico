Geeks.Async.Core.Connection = {

  ExecuteSQL: function (sqlSentence, structureCall) {
    // const component = this
    return new Promise((resolve, reject) => {
      const caller = '' //component.ExecuteSQL.caller != undefined && component.ExecuteSQL.caller.name != undefined ? component.ExecuteSQL.caller.name : "Report"
      var result = null
      var data
      var url = structureCall ? config.serverAddress : $("#hfCodigoSistema").data("GeeksData").URLServidor
      var requestDatabase = structureCall ? config.structureDatabase : $("#hfCodigoSistema").data("GeeksData").BancoDeDados

      if (!$.isArray(sqlSentence)) {
        //sqlSentence = sqlSentence.replace(/\\/g, "\\\\");
        console.log("Chamando Sentença: " + sqlSentence);
        sqlSentence = sqlSentence.replace(/'/g, "$--$").replace(/"/g, "-#-#-");

        url += "/ExecuteSQL";
        data = sqlSentence;
      } else {

        var sentence = [];

        for (var sql in sqlSentence) {
          //sqlSentence[sql] = sqlSentence[sql].replace(/\\/g, "\\");
          console.log("Chamando Sentença: " + sqlSentence[sql]);
          sqlSentence[sql] = sqlSentence[sql].replace(/'/g, "$--$").replace(/"/g, "-#-#-");

          sentence.push(sqlSentence[sql]);
        }

        url += "/ExecuteAllSQL";
        data = JSON.stringify(sentence);
      }

      $.ajax({
        type: "POST",
        url: url,
        data: {
          database: requestDatabase,
          sentence: data,
          user: ($("#hfCodigoUsuario").length > 0 ? $("#hfCodigoUsuario").val() : 17),
          caller
        },
        dataType: "json",
        async: true,
        success: function (response) {
          if (!$.isArray(sqlSentence)) {
            if (response.HasError) {
              ShowError(response)
              reject()
            }
          } else {
            var errors = $.grep(response, function (value) {
              return (value.HasError === true)
            })

            if (errors.length > 0) {
              ShowError(errors[0])
              reject()
            }
          }
          // resolve(response)
          result = response

          if ($.isArray(result)) {
            for (var i = 0; i < result.length; i++) {
              for (c in result[i].Columns) {
                if (result[i].Columns[c].ColumnType == "DateTime") {

                  for (l in result[i].Records) {
                    if (result[i].Records[l] && result[i].Records[l]["__" + result[i].Columns[c].ColumnName]) {
                      var valor = result[i].Records[l]["__" + result[i].Columns[c].ColumnName].split('.')
                      if (valor.length > 1) {
                        result[i].Records[l][result[i].Columns[c].ColumnName] = "/Date(" + new Date(valor[2], valor[1] - 1, valor[0], valor[3], valor[4], valor[5]).getTime() + ")/"
                      }
                    }
                    delete result[i].Records[l]["__" + result[i].Columns[c].ColumnName]
                  }
                }
              }
            }
          } else {
            for (c in result.Columns) {
              if (result.Columns[c].ColumnType == "DateTime") {

                for (l in result.Records) {

                  if (result.Records[l] && result.Records[l]["__" + result.Columns[c].ColumnName]) {
                    var valor = result.Records[l]["__" + result.Columns[c].ColumnName].split('.')
                    if (valor.length > 1) {
                      result.Records[l][result.Columns[c].ColumnName] = "/Date(" + new Date(valor[2], valor[1] - 1, valor[0], valor[3], valor[4], valor[5]).getTime() + ")/"
                    }
                  }
                  delete result.Records[l]["__" + result.Columns[c].ColumnName]
                }
              }
            }
          }
          resolve(result)
        },
        error: function (e) {
          ShowError(e.responseText)
          reject()
        }
      })

    })
  },

  ReportExecuteSQL: function (sqlSentence, structureCall) {
    var result = null;
    var data;
    var url = structureCall ? config.serverAddress : $("#hfCodigoSistema").data("GeeksData").URLServidor;
    var requestDatabase = structureCall ? config.structureDatabase : $("#hfCodigoSistema").data("GeeksData").BancoDeDados;

    if (!$.isArray(sqlSentence)) {
      //sqlSentence = sqlSentence.replace(/\\/g, "\\\\");
      console.log("Chamando Sentença: " + sqlSentence);
      if (sqlSentence.toLowerCase().indexOf("update") > -1 || sqlSentence.toLowerCase().indexOf("delete") > -1 || sqlSentence.toLowerCase().indexOf("alter") > -1 ||
        sqlSentence.toLowerCase().indexOf("create") > -1 || sqlSentence.toLowerCase().indexOf("drop") > -1 || sqlSentence.toLowerCase().indexOf("truncate") > -1 ||
        sqlSentence.toLowerCase().indexOf("insert") > -1 || sqlSentence.indexOf("exec") > -1 || sqlSentence.indexOf("grant") > -1) {
        ShowError("Query não permitida! " + sqlSentence);
        return;
      }

      sqlSentence = sqlSentence.replace(/'/g, "$--$").replace(/"/g, "-#-#-");
      url += "/ExecuteSQL";
      data = sqlSentence;
    } else {

      var sentence = [];
      for (var sql in sqlSentence) {
        //sqlSentence[sql] = sqlSentence[sql].replace(/\\/g, "\\");
        console.log("Chamando Sentença: " + sqlSentence[sql]);
        if (sqlSentence[sql].toLowerCase().indexOf("update") > -1 || sqlSentence[sql].toLowerCase().indexOf("delete") > -1 || sqlSentence[sql].toLowerCase().indexOf("alter") > -1 ||
          sqlSentence[sql].toLowerCase().indexOf("create") > -1 || sqlSentence[sql].toLowerCase().indexOf("drop") > -1 || sqlSentence[sql].toLowerCase().indexOf("truncate") > -1 ||
          sqlSentence[sql].toLowerCase().indexOf("insert") > -1 || sqlSentence[sql].indexOf("exec") > -1 || sqlSentence[sql].indexOf("grant") > -1) {
          ShowError("Query não permitida! " + sqlSentence[sql]);
          return;
        }

        sqlSentence[sql] = sqlSentence[sql].replace(/'/g, "$--$").replace(/"/g, "-#-#-");
        sentence.push(sqlSentence[sql]);
      }
      url += "/ExecuteAllSQL";
      data = JSON.stringify(sentence);
    }

    $.ajax({
      type: "POST",
      url: url,
      data: {
        database: requestDatabase,
        sentence: data,
        user: ($("#hfCodigoUsuario").length > 0 ? $("#hfCodigoUsuario").val() : 17),
        caller: (this.ExecuteSQL.caller != undefined && this.ExecuteSQL.caller.name != undefined ? this.ExecuteSQL.caller.name : "Report")
      },
      dataType: "json",
      async: asyncronous ? true : false,
      success: function (response) {
        if (!$.isArray(sqlSentence)) {
          if (response.HasError) {
            ShowError(response);
            return;
          }
        } else {
          var errors = $.grep(response, function (value) {
            return value.HasError == true;
          });

          if (errors.length > 0) {
            ShowError(errors[0]);
            return;
          }
        }

        result = response;

        if ($.isArray(result)) {
          for (var i = 0; i < result.length; i++) {
            for (c in result[i].Columns) {
              if (result[i].Columns[c].ColumnType == "DateTime") {

                for (l in result[i].Records) {
                  if (result[i].Records[l] && result[i].Records[l]["__" + result[i].Columns[c].ColumnName]) {
                    var valor = result[i].Records[l]["__" + result[i].Columns[c].ColumnName].split('.')
                    if (valor.length > 1) {
                      result[i].Records[l][result[i].Columns[c].ColumnName] = "/Date(" + new Date(valor[2], valor[1] - 1, valor[0], valor[3], valor[4], valor[5]).getTime() + ")/"
                    }
                  }
                  delete result[i].Records[l]["__" + result[i].Columns[c].ColumnName]
                }
              }
            }
          }
        }
        else {
          for (c in result.Columns) {
            if (result.Columns[c].ColumnType == "DateTime") {

              for (l in result.Records) {

                if (result.Records[l] && result.Records[l]["__" + result.Columns[c].ColumnName]) {
                  var valor = result.Records[l]["__" + result.Columns[c].ColumnName].split('.')
                  if (valor.length > 1) {
                    result.Records[l][result.Columns[c].ColumnName] = "/Date(" + new Date(valor[2], valor[1] - 1, valor[0], valor[3], valor[4], valor[5]).getTime() + ")/"
                  }
                }
                delete result.Records[l]["__" + result.Columns[c].ColumnName]
              }
            }
          }
        }

        if (asyncronousContinueFunction)
          asyncronousContinueFunction(result);
      },
      error: function (e) {
        ShowError(e.responseText);
        return;
      }
    });

    return result;
  }

}
