/*
Conexão e permissão
*/

(function () {
    Geeks.ERP.Core.Connection = new function () {
        this.ExecuteSQL = function(sqlSentence, structureCall, asyncronous, asyncronousContinueFunction) {
            var result = null;
            var data;
            var url = structureCall ? config.serverAddress : $("#hfCodigoSistema").data("GeeksData").URLServidor;
            var requestDatabase = structureCall ? config.structureDatabase : $("#hfCodigoSistema").data("GeeksData").BancoDeDados;

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
					user: ($("#hfCodigoUsuario").length > 0 ? $("#hfCodigoUsuario").val() : 17 ),
					caller: (this.ExecuteSQL.caller != undefined && this.ExecuteSQL.caller.name != undefined ? this.ExecuteSQL.caller.name : "Report")
                },
                dataType: "json",
                async: asyncronous ? true : false,
                success: function(response) {
                    if (!$.isArray(sqlSentence)) {
                        if (response.HasError) {
                            ShowError(response);
                            return;
                        }
                    } else {
                        var errors = $.grep(response, function(value) {
                            return value.HasError == true;
                        });

                        if (errors.length > 0) {
                            ShowError(errors[0]);
                            return;
                        }
                    }

                    result = response;
					
					if ($.isArray(result)) {
						for (var i=0; i < result.length; i++ )
						{
							for (c in result[i].Columns) {
								if (result[i].Columns[c].ColumnType=="DateTime") {
								
									for (l in result[i].Records) {
										if (result[i].Records[l] && result[i].Records[l]["__" + result[i].Columns[c].ColumnName])
										{
											var valor = result[i].Records[l]["__" + result[i].Columns[c].ColumnName].split('.')
											if (valor.length > 1)
											{
												result[i].Records[l][result[i].Columns[c].ColumnName] = "/Date(" + new Date(valor[2],valor[1]-1,valor[0],valor[3],valor[4],valor[5]).getTime()  + ")/"
											}
										}
										delete  result[i].Records[l]["__" + result[i].Columns[c].ColumnName]
									}
								}
							}
						}
					}
					else
					{
						for (c in result.Columns) {
								if (result.Columns[c].ColumnType=="DateTime") {
								
									for (l in result.Records) {

										if (result.Records[l] && result.Records[l]["__" + result.Columns[c].ColumnName])
										{
											var valor = result.Records[l]["__" + result.Columns[c].ColumnName].split('.')
											if (valor.length > 1)
											{
												result.Records[l][result.Columns[c].ColumnName] = "/Date(" + new Date(valor[2],valor[1]-1,valor[0],valor[3],valor[4],valor[5]).getTime()  + ")/"
											}
										}
										delete  result.Records[l]["__" + result.Columns[c].ColumnName]
									}
								}
							}
					}

                    if (asyncronousContinueFunction)
                        asyncronousContinueFunction(result);
                },
                error: function(e) {
                    ShowError(e.responseText);
                    return;
                }
            });

            return result;
        };
		
		this.ReportExecuteSQL = function(sqlSentence, structureCall, asyncronous, asyncronousContinueFunction) {
            var result = null;
            var data;
            var url = structureCall ? config.serverAddress : $("#hfCodigoSistema").data("GeeksData").URLServidor;
            var requestDatabase = structureCall ? config.structureDatabase : $("#hfCodigoSistema").data("GeeksData").BancoDeDados;

            if (!$.isArray(sqlSentence)) {
                //sqlSentence = sqlSentence.replace(/\\/g, "\\\\");
				console.log("Chamando Sentença: " + sqlSentence);
				if (sqlSentence.toLowerCase().indexOf("update") > -1 || sqlSentence.toLowerCase().indexOf("delete") > -1 || sqlSentence.toLowerCase().indexOf("alter") > -1 ||
					sqlSentence.toLowerCase().indexOf("create") > -1 || sqlSentence.toLowerCase().indexOf("drop") > -1 || sqlSentence.toLowerCase().indexOf("truncate") > -1 || 
					sqlSentence.toLowerCase().indexOf("insert") > -1 || sqlSentence.indexOf("exec") > -1 || sqlSentence.indexOf("grant") > -1)
				{
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
						sqlSentence[sql].toLowerCase().indexOf("insert") > -1 || sqlSentence[sql].indexOf("exec") > -1 || sqlSentence[sql].indexOf("grant") > -1)
					{
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
					user: ($("#hfCodigoUsuario").length > 0 ? $("#hfCodigoUsuario").val() : 17 ),
					caller: (this.ExecuteSQL.caller != undefined && this.ExecuteSQL.caller.name != undefined ? this.ExecuteSQL.caller.name : "Report")
                },
                dataType: "json",
                async: asyncronous ? true : false,
                success: function(response) {
                    if (!$.isArray(sqlSentence)) {
                        if (response.HasError) {
                            ShowError(response);
                            return;
                        }
                    } else {
                        var errors = $.grep(response, function(value) {
                            return value.HasError == true;
                        });

                        if (errors.length > 0) {
                            ShowError(errors[0]);
                            return;
                        }
                    }

                    result = response;
					
					if ($.isArray(result)) {
						for (var i=0; i < result.length; i++ )
						{
							for (c in result[i].Columns) {
								if (result[i].Columns[c].ColumnType=="DateTime") {
								
									for (l in result[i].Records) {
										if (result[i].Records[l] && result[i].Records[l]["__" + result[i].Columns[c].ColumnName])
										{
											var valor = result[i].Records[l]["__" + result[i].Columns[c].ColumnName].split('.')
											if (valor.length > 1)
											{
												result[i].Records[l][result[i].Columns[c].ColumnName] = "/Date(" + new Date(valor[2],valor[1]-1,valor[0],valor[3],valor[4],valor[5]).getTime()  + ")/"
											}
										}
										delete  result[i].Records[l]["__" + result[i].Columns[c].ColumnName]
									}
								}
							}
						}
					}
					else
					{
						for (c in result.Columns) {
								if (result.Columns[c].ColumnType=="DateTime") {
								
									for (l in result.Records) {

										if (result.Records[l] && result.Records[l]["__" + result.Columns[c].ColumnName])
										{
											var valor = result.Records[l]["__" + result.Columns[c].ColumnName].split('.')
											if (valor.length > 1)
											{
												result.Records[l][result.Columns[c].ColumnName] = "/Date(" + new Date(valor[2],valor[1]-1,valor[0],valor[3],valor[4],valor[5]).getTime()  + ")/"
											}
										}
										delete  result.Records[l]["__" + result.Columns[c].ColumnName]
									}
								}
							}
					}

                    if (asyncronousContinueFunction)
                        asyncronousContinueFunction(result);
                },
                error: function(e) {
                    ShowError(e.responseText);
                    return;
                }
            });

            return result;
        };
		
		this.ExecuteSQLAnotherDB = function(dataBase, sqlSentence, urlServidor) {
            var result = null;
            var data;
            var url = (urlServidor != undefined) ? urlServidor : $("#hfCodigoSistema").data("GeeksData").URLServidor;
            var requestDatabase = dataBase;

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
					user: ($("#hfCodigoUsuario").length > 0 ? $("#hfCodigoUsuario").val() : 17 ),
					caller: (this.ExecuteSQL.caller != undefined && this.ExecuteSQL.caller.name != undefined ? this.ExecuteSQL.caller.name : "Report")
                },
                dataType: "json",
                async: false,
                success: function(response) {
                    if (!$.isArray(sqlSentence)) {
                        if (response.HasError) {
                            ShowError(response);
                            return;
                        }
                    } else {
                        var errors = $.grep(response, function(value) {
                            return value.HasError == true;
                        });

                        if (errors.length > 0) {
                            ShowError(errors[0]);
                            return;
                        }
                    }

                    result = response;
					
					if ($.isArray(result)) {
						for (var i=0; i < result.length; i++ )
						{
							for (c in result[i].Columns) {
								if (result[i].Columns[c].ColumnType=="DateTime") {
								
									for (l in result[i].Records) {
										if (result[i].Records[l] && result[i].Records[l]["__" + result[i].Columns[c].ColumnName])
										{
											var valor = result[i].Records[l]["__" + result[i].Columns[c].ColumnName].split('.')
											if (valor.length > 1)
											{
												result[i].Records[l][result[i].Columns[c].ColumnName] = "/Date(" + new Date(valor[2],valor[1]-1,valor[0],valor[3],valor[4],valor[5]).getTime()  + ")/"
											}
										}
										delete  result[i].Records[l]["__" + result[i].Columns[c].ColumnName]
									}
								}
							}
						}
					}
					else
					{
						for (c in result.Columns) {
								if (result.Columns[c].ColumnType=="DateTime") {
								
									for (l in result.Records) {

										if (result.Records[l] && result.Records[l]["__" + result.Columns[c].ColumnName])
										{
											var valor = result.Records[l]["__" + result.Columns[c].ColumnName].split('.')
											if (valor.length > 1)
											{
												result.Records[l][result.Columns[c].ColumnName] = "/Date(" + new Date(valor[2],valor[1]-1,valor[0],valor[3],valor[4],valor[5]).getTime()  + ")/"
											}
										}
										delete  result.Records[l]["__" + result.Columns[c].ColumnName]
									}
								}
							}
					}
                },
                error: function(e) {
                    ShowError(e.responseText);
                    return;
                }
            });

            return result;
        };
    }

    Geeks.ERP.Core.Permission = new function () {
        this.Check = function (codigoUsuario, codigoGrupo, permissao) {
            String.prototype.stripHTML = function () {
                return this.replace(/<.*?>/g, '').replace(/\n/g, '').replace(/\r/g, '');
            }

            var permitir = true;
			if ($('#hfUsuarioAdm').val() == "true") permitir = true;
            //permissao = permissao.stripHTML();
            else if (permissao && permissao.stripHTML().trim().length > 0) {
                permissao = permissao.stripHTML().split(';');
                if (permissao.length % 4 == 0) {
                    var perm = new Array();
                    for (var j = 0; j < permissao.length; j = j + 4) {
                        perm.push(permissao[j].trim() + ';' + permissao[j + 1].trim() + ';' + permissao[j + 2].trim() + ';' + permissao[j + 3].trim());
                    }

                    permitir = false;
                    $.each(perm, function (key, linha) {
                        var coluna = linha.trim().split(";");
                        coluna[0] = coluna[0].toLowerCase().trim();
                        coluna[1] = coluna[1].toLowerCase().trim();
                        coluna[2] = coluna[2].toLowerCase().trim();

                        //Por individuo
                        if (coluna[0] == "permitir" && coluna[1] == "usuário" && (coluna[2] == codigoUsuario || coluna[2] == 0)) permitir = true;
                        if (coluna[0] == "bloquear" && coluna[1] == "usuário" && (coluna[2] == codigoUsuario || coluna[2] == 0)) permitir = false;
                        if (coluna[0] == "invisivel" && coluna[1] == "usuário" && (coluna[2] == codigoUsuario || coluna[2] == 0)) permitir = false;
                        //Por Grupo
                        if (coluna[0] == "permitir" && coluna[1] == "grupo" && (coluna[2] == codigoGrupo || coluna[2] == 0)) permitir = true;
                        if (coluna[0] == "bloquear" && coluna[1] == "grupo" && (coluna[2] == codigoGrupo || coluna[2] == 0)) permitir = false;
                        if (coluna[0] == "invisivel" && coluna[1] == "grupo" && (coluna[2] == codigoGrupo || coluna[2] == 0)) permitir = false;
                    });
                }
            }

            return permitir;
        }
    }

    Geeks.ERP.Core.Permissao = {
        Sistema: function(){
            
        }       
    }

})();