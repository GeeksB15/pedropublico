(function ($) {
  var origValFn = $.fn.val
  var origPropFn = $.fn.prop

  $.fn.val = function () {
    var returnValue = origValFn.apply(this, arguments)

    if (arguments.length) {
      this.each(function () {
        if ($(this).change) {
          try {
            $(this).change()
          } catch (ex) {

          }
        }
      })
    }

    return returnValue
  }

  $.fn.prop = function () {
    var returnValue = origPropFn.apply(this, arguments)

    if (arguments.length && arguments[0] == 'checked' && arguments.length > 1) {
      this.each(function () {
        if ($(this).change) {
          $(this).change()
        }
      })
    }

    return returnValue
  }

  kendo.culture('pt-BR')
})(jQuery)

// $.valHooks.textarea = {
//    get: function (elem) {
//        return elem.value.replace(/\r/g, "\\r").replace(/\n/g, "\\n");
//    }
// };

// var codigoContato = getParameterByName("CodigoContato");
// var listaEmails = Geeks.ERP.Core.Connection.ExecuteSQL("select CodigoEmailUsuario, Conta from EmailUsuario where CodigoContato = " + codigoContato, true);

$(function () {
  var usuario = JSON.parse(localStorage.getItem('usuario'))
  var clienteSistema = JSON.parse(localStorage.getItem('clienteSistema'))
  if (!!usuario && usuario.cpf) {
    return ExecuteLogin({ cpf: usuario.cpf, codigoClienteSistema: clienteSistema.codigoClienteSistema })
  }
  // debugger
  // ExecuteLogin({ cpf: '213.974.988-03', codigoClienteSistema: 2148 })
})

function ExecuteLogin({ cpf, codigoClienteSistema }) {
  const cpflimpo = cpf.replaceAll('.', '').replaceAll('-', '')

  let usuario = Geeks.ERP.Core.Connection.ExecuteSQL(
    `select * from usuario where dbo.RemoveCaracteresNaoNumericos(NumeroDocumentoNacional) = dbo.RemoveCaracteresNaoNumericos('${cpf}')`,
    true
  ).Records[0]

  let sql = `
        Select top 1 
        ups.CodigoUsuario
        ,cs.CodigoSistema
        ,cs.CodigoClienteSistema
        ,s.Descricao as Sistema
        ,cs.URLServidor
        ,cs.BancoDeDados
        ,cs.CodigoCliente
        ,c.Razao as Cliente
        ,ups.AdministradorGeeks Administrador
        ,ups.GrupoInterno 
        from 
        UsuarioPermissaoSistema ups 
        inner join ClienteSistema cs On cs.CodigoClienteSistema = ups.CodigoClienteSistema 
        inner join Contato c On c.CodigoContato = cs.CodigoCliente 
        inner join Sistema s on s.CodigoSistema = cs.CodigoSistema 
        Where ups.CodigoUsuario = '${usuario.CodigoUsuario}' 
        and cs.CodigoClienteSistema=${codigoClienteSistema}
        
      union all
        
      select top 1
        u.CodigoUsuario
        ,cs.CodigoSistema
        ,cs.CodigoClienteSistema
        ,s.Descricao as Sistema
        ,cs.URLServidor
        ,cs.BancoDeDados
        ,cs.CodigoCliente as CodigoCliente
        ,c.Razao as Cliente
        ,u.Administrador
        ,u.GrupoInterno 
        from 
        Sistema s 
        inner join ClienteSistema cs on s.CodigoSistema = cs.CodigoSistema 
        inner join Contato c On c.CodigoContato = cs.CodigoCliente 
        left join Usuario u on u.CodigoUsuario = '${usuario.CodigoUsuario}'
        where cs.CodigoClienteSistema=${codigoClienteSistema}
        `
  const sistema = Geeks.ERP.Core.Connection.ExecuteSQL(sql, true).Records[0]

  localStorage.setItem('LembrarSenha', false)
  localStorage.setItem('cpfUsado', cpflimpo)
  localStorage.setItem('dadosUsuario', JSON.stringify(usuario))
  localStorage.setItem('jaLogado', 'true')


  $('#hfCodigoUsuario').val(usuario.CodigoUsuario)
  $('#hfUsuarioAdm').val(usuario.Administrador)
  $('#hfGrupoInterno').val(sistema.GrupoInterno)

  $('#hfCodigoSistema').val(sistema.CodigoSistema)

  // let urlRedirect = {
  //   // 'https://api.b15.com.br/sql/srv2': 'https://srv2.b15.com.br/15A/Core',
  //   'https://api.b15.com.br/sql/srv4': 'https://srv4.b15.com.br/15A/Core',
  //   'https://api.b15.com.br/sql/srv5': 'https://srv5.b15.com.br/15A/Core',
  //   'https://api.b15.com.br/sql/srv7': 'https://srv7.b15.com.br/15A/Core'
  // }

  // if (window.location.host.search('optisoul.b15.com.br|erp.b15.com.br') === 0) {
  //   urlRedirect = {
  //     // 'https://api.b15.com.br/sql/srv2': 'https://srv2.b15.com.br/15A',
  //     'https://api.b15.com.br/sql/srv4': 'https://srv4.b15.com.br/15A',
  //     'https://api.b15.com.br/sql/srv5': 'https://srv5.b15.com.br/15A',
  //     'https://api.b15.com.br/sql/srv7': 'https://srv7.b15.com.br/15A'
  //   }
  // }

  $('#hfCodigoSistema').data('GeeksData', {
    ...sistema,
    // URLServidor: urlRedirect[sistema.URLServidor] || sistema.URLServidor
    URLServidor: sistema.URLServidor
  })

  $('#hfCodigoUsuario').data('GeeksData', usuario)

  initLayout()
  localStorage.setItem('plat15message', 'start')

  // const objeto = Geeks.ERP.Core.Connection.ExecuteSQL(`Select * from objeto where codigoObjeto=11`,true).Records[0]
  // Geeks.ERP.UI.Tela.OpenWindow("content", $("#content"), objeto, null, true);
  // $('#content').css("padding-top", "0");
}
