var Geeks = {
    ERP: {
        UI: {
            Grid: {
                Render: function (content, grid, popup, structural) {},
                EditaGrade: function (grid, sender, row, method, structural) {},
                Propriedade: function (grid, sender, structural) {},
                GenerateModel: function (layout, gridColumns) {}
            },
            Menu: {
                Render: function (){}
            },
            Prompt: function (sender, promptName, sql, structural) {
                return {
                    Configuracao: function (ordem, nome, tamanho, invisivel, imagem) { },
                    Render: function () { },
                    Show: function (callbackFunction) { }
                }
            },
            PromptTexto: function (sender, campo) {
                return {
                    Render: function (fieldValue) { },
                    Show: function (fieldValue, callbackFunction) { }
                }
            },
            PromptHtml: function (sender, campo) {
                return {
                    Render: function (fieldValue) { },
                    Show: function (fieldValue, callbackFunction) { }
                }
            },
            Tela: {
                OpenWindow: function (windowType, container, objeto, callback, renderObjeto, codeNotEditable, reloadCodeOnLoad) { },
                RenderObjeto: function (contentBody, objeto, utilizaPropriedadesObjeto) { },
                MontaBotoes: function (botoes, codigoPai) { },
                MontaCampos: function (tabindex, campo, record, force100Percent, structural) { },
                FormataCampos: function (target) { }
            }
        },
        Core: {
            Connection: {
                ExecuteSQL: function (sqlSentence, structureCall, asyncronous, asyncronousContinueFunction) { }
            },
            Permission : {
                Check: function (codigoUsuario, codigoGrupo, permissao) {}
            }
        }
    },
    Async: {
        UI: {
            Grid: {
                Render: function (content, grid, popup, structural) {},
                EditaGrade: function (grid, sender, row, method, structural) {},
                Propriedade: function (grid, sender, structural) {},
                GenerateModel: function (layout, gridColumns) {}
            },
            Menu: {
                Render: function (){}
            },
            Prompt: function (sender, promptName, sql, structural) {
                return {
                    Configuracao: function (ordem, nome, tamanho, invisivel, imagem) { },
                    Render: function () { },
                    Show: function (callbackFunction) { }
                }
            },
            PromptTexto: function (sender, campo) {
                return {
                    Render: function (fieldValue) { },
                    Show: function (fieldValue, callbackFunction) { }
                }
            },
            PromptHtml: function (sender, campo) {
                return {
                    Render: function (fieldValue) { },
                    Show: function (fieldValue, callbackFunction) { }
                }
            },
            Tela: {
                OpenWindow: function (windowType, container, objeto, callback, renderObjeto, codeNotEditable, reloadCodeOnLoad) { },
                RenderObjeto: function (contentBody, objeto, utilizaPropriedadesObjeto) { },
                MontaBotoes: function (botoes, codigoPai) { },
                MontaCampos: function (tabindex, campo, record, force100Percent, structural) { },
                FormataCampos: function (target) { }
            }
        },
        Core: {
            Connection: {
                ExecuteSQL: function (sqlSentence, structureCall, asyncronous, asyncronousContinueFunction) { }
            },
            Permission : {
                Check: function (codigoUsuario, codigoGrupo, permissao) {}
            }
        }
    }
};