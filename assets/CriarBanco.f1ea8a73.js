import{_ as y,r as g,o as E,n as j,f as i,w as t,E as M,d as U,h as x,j as _,i as T,k as B,e as V,H as I,I as k,B as G,J as z,aY as F,Q as L,D as Q}from"./index.f2a220da.js";import{S as R,a as J}from"./SeletorPais.407129f0.js";const H={components:{SeletorCidade:R,SeletorPais:J},data(){return{dados:{cnpj:"",fantasia:"",razaoSocial:"",baseDados:"",codigoSistema:"",segmento:"",codigo:"",cpfUsuario:"",nomeUsuario:""},cnpjErro:!1,logado:$db.usuario.logado,servidor:{},servidorOptisoul:{codigo:"srv7",ativoSincronismo:1,sysDatabases:"master.sys.databases",drive:"E:\\"},servidorB15:{codigo:"srv210",ativoSincronismo:1,sysDatabases:"master.sys.databases",drive:""},sistemas:[],sistemasOptisoul:[{valor:"52",rotulo:"Optisoul - Plano Controle"},{valor:"53",rotulo:"Optisoul - Plano Gest\xE3o"},{valor:"57",rotulo:"Optisoul - Plano Venda Melhor"},{valor:"68",rotulo:"Optisoul - Operacional"}],sistemasB15:[{valor:"60",rotulo:"B15 Free"},{valor:"61",rotulo:"B15 Business"},{valor:"62",rotulo:"B15 Enterprise"}]}},methods:{consultarCep(){const a=this.dados.cep.replace(/[^0-9]/g,"");a.length<8||$utils.buscarEndereco(a).then(async({data:o})=>{if(this.dados.bairro=o.bairro,this.dados.complemento=o.complemento,this.dados.ibgeCod=o.ibge,this.dados.logradouro=o.logradouro,this.dados.municipio=o.localidade,this.dados.pais="Brasil",this.dados.codigoPais=1058,this.dados.uf=o.uf,this.dados.ufCod=$utils.mapearEstadoCodigo[o.uf],o.ibge){const h=await $db.cidade.le({cidadeCodIbge:o.ibge.toString(),ativo:!0});this.dados.cidadeCodChave=(h.find($=>$.cod)||{}).cod,this.dados.idCidade=(h.find($=>$.cod)||{}).id}})},async selecionarCidade(a,o){this.dados.municipio=a.municipio||"",this.dados.ibgeCod=a.ibgeCod||"",this.dados.uf=a.uf||"",this.dados.ufCod=a.ufCod||"",this.dados.cidadeCodChave=a.cidadeCodChave||"",this.dados.idCidade=a.value||"",this.dados.codigoPais=1058,this.dados.pais="Brasil"},async selecionarPais(a,o){this.dados.pais=a.nome,this.dados.codigoPais=a.codigo},async atualiza(){this.sistemas=this.logado.grupoInterno===2?this.sistemasOptisoul:[...this.sistemasOptisoul,...this.sistemasB15],this.dados.segmento=this.logado.grupoInterno===2?"\xD3tica":"",this.servidor=this.logado.grupoInterno===2?this.servidorOptisoul:this.servidorB15},async criarBanco(){$utils.gconsole.log("CriarBanco","criarBanco()",this.dados);try{(!!this.dados.cnpj||!!this.dados.razaoSocial||!!this.dados.fantasia)&&($utils.verificarErro(!this.dados.cnpj,"CNPJ n\xE3o preenchido"),$utils.verificarErro(!$utils.validarDocumentoNacional(this.dados.cnpj),"CNPJ inv\xE1lido"),$utils.verificarErro(!this.dados.razaoSocial,"Raz\xE3o Social n\xE3o preenchido"),$utils.verificarErro(!this.dados.fantasia,"Fantasia n\xE3o preenchido")),$utils.verificarErro(!this.dados.codigoSistema,"Sistema n\xE3o selecionado"),(!!this.dados.cpfUsuario||!!this.dados.nomeUsuario)&&($utils.verificarErro(!this.dados.cpfUsuario,"CFP do usu\xE1rio n\xE3o preenchido"),$utils.verificarErro(!$utils.validarDocumentoNacional(this.dados.cpfUsuario),"CPF inv\xE1lido"),$utils.verificarErro(!this.dados.nomeUsuario,"Nome do usu\xE1rio n\xE3o preenchido"));const a=this.dados.cnpj||this.dados.cpfUsuario;$utils.verificarErro(!a,"CFP e CNPJ n\xE3o preenchidos"),this.dados.baseDados=this.$utils.removerCaracteresEspeciais(this.dados.baseDados).replace(/ /g,""),$utils.verificarErro(!this.dados.baseDados,"Base de Dados n\xE3o preenchido"),this.$q.loading.show({message:"Criando"});let o;o=`select * from clienteSistema where bancoDeDados = ${$utils.sqlStr(this.dados.baseDados)}`;const h=await $utils.executarSql(o,"GeeksPlat15A");$utils.gconsole.log("CriarBanco","retClienteSistemaCadastrada",h),$utils.verificarErro(!!h&&h.length>0,"Nome da Base de dados j\xE1 existente no sistema"),o=`select * from ${this.servidor.sysDatabases} where name = ${$utils.sqlStr(this.dados.baseDados)}`;const $=await $utils.executarSql(o,"GeeksPlat15A");$utils.gconsole.log("CriarBanco","retBancoCadastrado",$),$utils.verificarErro(!!$&&$.length>0,`Nome da Base de dados j\xE1 existente no servidor ${this.servidor.codigo}`);let e;this.servidor.codigo==="srv7"?(o="backup database BaseLimpaMobile to disk='/mnt/pve4hdg/baselimpamobile.bkpsql.bak' With INIT",e=await $utils.executarSql(o,"B15app"),o=`
            declare @baseDados varchar(250) = ${$utils.sqlStr(this.dados.baseDados)}
            if not exists(Select 1 from ${this.servidor.sysDatabases} where name=@baseDados)
            begin
              declare @sql varchar(max) = ''
              set @sql = 'restore database ' + QUOTENAME(@baseDados) + ' from disk=''\\\\10.2.2.40\\hdg\\baselimpamobile.bkpsql.bak'' WITH FILE = 1, NOUNLOAD, REPLACE, STATS = 5,'
              set @sql = @sql + ' move ''OptiSoul'' to ''${this.servidor.drive}\\SqlData\\'+@baseDados+'.mdf'','
              set @sql = @sql + ' move ''OptiSoul_Log'' to ''${this.servidor.drive}\\SqlData\\'+@baseDados+'_log.ldf'''
              exec (@sql)
            end
            select @baseDados baseDados`,e=await $utils.executarSql(o,"Demo_Optidados")):(o=`
            declare @baseDados varchar(250) = ${$utils.sqlStr(this.dados.baseDados)}
            if not exists(Select 1 from ${this.servidor.sysDatabases} where name=@baseDados)
            begin
              declare @sql varchar(max) = ''
              set @sql = 'backup database BaseLimpaMobile to disk=''/mnt/pve4hdg/baselimpamobile.bkpsql.bak'' With INIT';
              exec (@sql)
              set @sql = 'create database ' + QUOTENAME(@baseDados)
              exec (@sql)
              set @sql = 'restore database ' + QUOTENAME(@baseDados) + ' from disk=''/mnt/pve4hdg/baselimpamobile.bkpsql.bak'' WITH FILE = 1,  NOUNLOAD,  REPLACE,  STATS = 5,'
              set @sql = @sql + ' move ''OptiSoul'' to ''/var/opt/mssql/data/'+@baseDados+'.mdf'','
              set @sql = @sql + ' move ''OptiSoul_Log'' to ''/var/opt/mssql/data/'+@baseDados+'_log.ldf'''
              exec (@sql)
            end
            select @baseDados baseDados`,e=await $utils.executarSql(o,"B15app")),$utils.gconsole.log("CriarBanco","retBackupRestore",e),this.$q.notifyPositive(`Banco ${e[0].baseDados} criado com sucesso`);let c;o=`
            insert into Contato (Nome,Apelido,NumeroDocumentoNacional,TipoDocumentoNacional)
            Select ${$utils.sqlStr(this.dados.razaoSocial||this.dados.nomeUsuario)} Nome, ${$utils.sqlStr(this.dados.fantasia||this.dados.nomeUsuario)} Apelido, ${$utils.sqlStr(a)} NumeroDocumentoNacional, 'CNPJ'
            where not exists(select 1 from contato where NumeroDocumentoNacional = ${$utils.sqlStr(a)})
            select * from contato where NumeroDocumentoNacional = ${$utils.sqlStr(a)}`;const S=await $utils.executarSql(o,"GeeksPlat15A");$utils.gconsole.log("CriarBanco","retContatoPlat",S),$utils.verificarErro(!S||!S.length||!S[0].CodigoContato,"Erro na cria\xE7\xE3o do contato empresa na plataforma"),c=S[0].CodigoContato,o=`
            insert into ClienteSistema (CodigoSistema,CodigoCliente,URLservidor,BancoDeDados)
            Select
              ${$utils.sqlNum(this.dados.codigoSistema)} CodigoSistema,
              ${$utils.sqlNum(c)} CodigoCliente,
              'https://api.b15.com.br/sql/${this.servidor.codigo}' URLServidor,
              ${$utils.sqlStr(this.dados.baseDados)} BancoDeDados
            --where not exists(Select 1 from ClienteSistema where CodigoSistema=${$utils.sqlNum(this.dados.codigoSistema)} and CodigoCliente=${$utils.sqlNum(c)} and BancoDeDados=${$utils.sqlStr(this.dados.baseDados)})
            select * from ClienteSistema where CodigoSistema=${$utils.sqlNum(this.dados.codigoSistema)} and CodigoCliente=${$utils.sqlNum(c)} and BancoDeDados=${$utils.sqlStr(this.dados.baseDados)}`;const r=await $utils.executarSql(o,"GeeksPlat15A");$utils.gconsole.log("CriarBanco","retClienteSistema",r),$utils.verificarErro(!r||!r.length||!r[0].CodigoClienteSistema,"Erro na cria\xE7\xE3o do ClienteSistema");const l=r[0].CodigoClienteSistema;if(this.dados.cpfUsuario){o=`
            insert into Contato (Nome, Apelido, NumeroDocumentoNacional, TipoDocumentoNacional)
            Select ${$utils.sqlStr(this.dados.nomeUsuario)} Nome, ${$utils.sqlStr(this.dados.nomeUsuario)} Apelido, ${$utils.sqlStr(this.dados.cpfUsuario)} NumeroDocumentoNacional, 'CPF'
            --where not exists(select 1 from contato where NumeroDocumentoNacional = ${$utils.sqlStr(this.dados.cpfUsuario)})
            select * from contato where NumeroDocumentoNacional = ${$utils.sqlStr(this.dados.cpfUsuario)}`;const u=await $utils.executarSql(o,this.dados.baseDados);$utils.gconsole.log("CriarBanco","retContatoCpf",u),$utils.verificarErro(!u||!u.length||!u[0].CodigoContato,"Erro na cria\xE7\xE3o do contato");const D=u[0].CodigoContato;let N,m,p;if(this.dados.cnpj){o=`
              insert into Contato (Nome, Apelido, NumeroDocumentoNacional, TipoDocumentoNacional)
              Select ${$utils.sqlStr(this.dados.razaoSocial)} Nome, ${$utils.sqlStr(this.dados.fantasia)} Apelido, ${$utils.sqlStr(this.dados.cnpj)} NumeroDocumentoNacional, 'CNPJ'
              --where not exists(select 1 from contato where NumeroDocumentoNacional = ${$utils.sqlStr(this.dados.cnpj)})
              select * from contato where NumeroDocumentoNacional = ${$utils.sqlStr(this.dados.cnpj)}`;const d=await $utils.executarSql(o,this.dados.baseDados);$utils.gconsole.log("CriarBanco","retContatoCnpj",d),$utils.verificarErro(!d||!d.length||!d[0].CodigoContato,"Erro na cria\xE7\xE3o do contato"),p=d[0].CodigoContato,o=`insert into ContatoEndereco (
                id,
                codigoContato,
                idContato,
                Logradouro,
                Numero,
                Complemento,
                Bairro,
                Cep,
                IbgeCod,
                Municipio,
                cidadeCodChave,
                Uf,
                UFCod,
                Pais,
                codigoPais,
                Grupo
              )
              Select
                ${$utils.sqlStr($utils.uuid())} id,
                ${$utils.sqlStr(d[0].CodigoContato)} CodigoContato,
                ${$utils.sqlStr(d[0].id)} idContato,
                ${$utils.sqlStr(this.dados.logradouro)} Logradouro,
                ${$utils.sqlStr(this.dados.numero)} Numero,
                ${$utils.sqlStr(this.dados.complemento)} Condominio,
                ${$utils.sqlStr(this.dados.bairro)} Bairro,
                ${$utils.sqlStr(this.dados.cep)} Cep,
                ${$utils.sqlStr(this.dados.ibgeCod)} IbgeCod,
                ${$utils.sqlStr(this.dados.municipio)} Municipio,
                ${$utils.sqlStr(this.dados.cidadeCodChave)} CidadeCodChave,
                ${$utils.sqlStr(this.dados.uf)} Uf,
                ${$utils.sqlStr(this.dados.ufCod)} UFCod,
                ${$utils.sqlStr(this.dados.pais)} Pais,
                ${$utils.sqlStr(this.dados.codigoPais)} codigoPais,
                'Principal' Grupo
              where not exists(select 1 from ContatoEndereco where idContato = ${$utils.sqlStr(d[0].id)})
              select * from ContatoEndereco where idContato = ${$utils.sqlStr(d[0].id)}`;const C=await $utils.executarSql(o,this.dados.baseDados);$utils.gconsole.log("CriarBanco","retEnderecoContato",C),$utils.verificarErro(!C||!C.length||!C[0].CodigoContatoEndereco,"Erro na cria\xE7\xE3o do contato empresa na plataforma"),o=`
              insert into Empresa (Nome, Apelido, NumeroDocumentoNacional, codigoContato, codigoClienteSistema)
              Select
              ${$utils.sqlStr(this.dados.razaoSocial)} Nome,
              ${$utils.sqlStr(this.dados.fantasia)} Apelido,
              ${$utils.sqlStr(this.dados.cnpj)} NumeroDocumentoNacional,
              ${$utils.sqlNum(p)} codigoContato,
              ${$utils.sqlNum(l)} codigoClienteSistema
              --where not exists(select 1 from empresa where NumeroDocumentoNacional = ${$utils.sqlStr(this.dados.cnpj)} and codigoClienteSistema = ${$utils.sqlNum(l)} and codigoContato = ${$utils.sqlNum(p)})
              select * from empresa where NumeroDocumentoNacional = ${$utils.sqlStr(this.dados.cnpj)} and codigoClienteSistema = ${$utils.sqlNum(l)} and codigoContato = ${$utils.sqlNum(p)}`;const b=await $utils.executarSql(o,this.dados.baseDados);$utils.gconsole.log("CriarBanco","retEmpresaErp",b),$utils.verificarErro(!b||!b.length||!b[0].CodigoEmpresa,"Erro na cria\xE7\xE3o da empresa Erp"),N=b[0].CodigoEmpresa;const v=await $utils.executarSql(o,"GeeksPlat15A");$utils.gconsole.log("CriarBanco","retEmpresaPlat",v),$utils.verificarErro(!v||!v.length||!v[0].CodigoEmpresa,"Erro na cria\xE7\xE3o da empresa Plat"),m=v[0].CodigoEmpresa}o=`
            insert into grupo (codigoClienteSistema, Descricao)
            Select ${$utils.sqlNum(l)} codigoClienteSistema, 'Administrador' Descricao
            --where not exists(Select 1 from grupo where codigoClienteSistema= ${$utils.sqlNum(l)} and Descricao='Administrador')
            Select * from grupo where codigoClienteSistema= ${$utils.sqlNum(l)} and Descricao='Administrador'`;const f=await $utils.executarSql(o,"GeeksPlat15A");$utils.gconsole.log("CriarBanco","retGrupo",f),$utils.verificarErro(!f||!f.length||!f[0].CodigoGrupo,"Erro na cria\xE7\xE3o do grupo");const s=f[0].CodigoGrupo;o=`
            insert into usuario (Nome, NumeroDocumentoNacional, senha, codigoContato, codigoGrupo)
            Select
              ${$utils.sqlStr(this.dados.nomeUsuario)} Nome,
              ${$utils.sqlStr(this.dados.cpfUsuario)} NumeroDocumentoNacional,
              '16a492d0689ac993da82e6fc034c12c1' senha,
              ${$utils.sqlNum(D)} codigoContato,
              ${$utils.sqlNum(s)} codigoGrupo
            where not exists(select 1 from usuario where NumeroDocumentoNacional = ${$utils.sqlStr(this.dados.cpfUsuario)})
            select * from usuario where NumeroDocumentoNacional = ${$utils.sqlStr(this.dados.cpfUsuario)}-- and codigoGrupo = ${$utils.sqlNum(s)}`;const q=await $utils.executarSql(o,"GeeksPlat15A");$utils.gconsole.log("CriarBanco","retUsuario",q),$utils.verificarErro(!q||!q.length||!q[0].CodigoUsuario,"Erro na cria\xE7\xE3o do Usuario");const n=q[0].CodigoUsuario;o=`
            update Contato set codigoUsuario=${$utils.sqlNum(n)}, idUsuario=${$utils.sqlStr(q[0].id)}
            where codigoContato = ${$utils.sqlNum(D)}`;const A=await $utils.executarSql(o,this.dados.baseDados);$utils.gconsole.log("CriarBanco","retUpdateContatoCpf",A),o=`
            insert into usuarioPermissaoSistema (codigoClienteSistema, codigoGrupo, codigoUsuario)
            Select
              ${$utils.sqlNum(l)} codigoClienteSistema,
              ${$utils.sqlNum(s)} codigoGrupo,
              ${$utils.sqlNum(n)} codigoUsuario
            --where not exists(select 1 from usuarioPermissaoSistema where codigoClienteSistema = ${$utils.sqlNum(l)} and codigoGrupo = ${$utils.sqlNum(s)} and codigoUsuario = ${$utils.sqlNum(n)})
            select * from usuarioPermissaoSistema where codigoClienteSistema = ${$utils.sqlNum(l)} and codigoGrupo = ${$utils.sqlNum(s)} and codigoUsuario = ${$utils.sqlNum(n)}`;const P=await $utils.executarSql(o,"GeeksPlat15A");if($utils.gconsole.log("CriarBanco","retUsuarioPermissaoSistema",P),$utils.verificarErro(!P||!P.length,"Erro na cria\xE7\xE3o do UsuarioPermissaoSistema"),!!m&&!!N&&!!p){o=`
              insert into empresaUsuarioPermissao (codigoUsuario, codigoContato, codigoEmpresa)
              Select
              ${$utils.sqlNum(n)} codigoUsuario,
              ${$utils.sqlNum(p)} codigoContato,
              ${$utils.sqlNum(m)} codigoEmpresa
              --where not exists(select 1 from empresaUsuarioPermissao where codigoUsuario = ${$utils.sqlNum(n)} and codigoEmpresa = ${$utils.sqlNum(N)})
              select * from empresaUsuarioPermissao where codigoUsuario = ${$utils.sqlNum(n)} and codigoEmpresa = ${$utils.sqlNum(m)}`;const d=await $utils.executarSql(o,this.dados.baseDados);$utils.gconsole.log("CriarBanco","retEmpresaUsuarioPermissaoErp",d),$utils.verificarErro(!d||!d.length,"Erro na cria\xE7\xE3o da EmpresaUsuarioPermissao Erp"),o=`
              insert into empresaUsuarioPermissao (codigoUsuario, codigoContato, codigoEmpresa)
              Select
              ${$utils.sqlNum(n)} codigoUsuario,
              ${$utils.sqlNum(p)} codigoContato,
              ${$utils.sqlNum(m)} codigoEmpresa
              --where not exists(select 1 from empresaUsuarioPermissao where codigoUsuario = ${$utils.sqlNum(n)} and codigoEmpresa = ${$utils.sqlNum(m)})
              select * from empresaUsuarioPermissao where codigoUsuario = ${$utils.sqlNum(n)} and codigoEmpresa = ${$utils.sqlNum(m)}`;const C=await $utils.executarSql(o,"GeeksPlat15A");$utils.gconsole.log("CriarBanco","retEmpresaUsuarioPermissaoPlat",C),$utils.verificarErro(!C||!C.length,"Erro na cria\xE7\xE3o da EmpresaUsuarioPermissao Plat")}o=`
            insert into grupoPermissao (codigoGrupo, codigoObjeto, permitir)
            Select
              ${$utils.sqlNum(s)} codigoGrupo,
              so.codigoObjeto,
              1 permitir
            from sistemaObjeto so
            where codigoSistema = ${$utils.sqlNum(this.dados.codigoSistema)}
              --and not exists(select 1 from grupoPermissao gp where so.codigoObjeto = gp.codigoObjeto and codigoGrupo = ${$utils.sqlNum(s)})
            select * from grupoPermissao gp where codigoGrupo = ${$utils.sqlNum(s)}`;const w=await $utils.executarSql(o,"GeeksPlat15A");$utils.gconsole.log("CriarBanco","retGrupoPermissao",w),(!w||!w.length)&&this.$q.notifyError("Sistema n\xE3o possui objetos associados para liberar permiss\xF5es"),this.$q.notifyPositive("Usuario, Empresa, Grupo e Permiss\xF5es criados com sucesso"),o=`exec SP_CriarBase_ParametrizacaoInicial ${$utils.sqlNum(this.dados.codigoSistema)}, ${$utils.sqlStr(this.dados.segmento)}`;const O=await $utils.executarSql(o,this.dados.baseDados);$utils.gconsole.log("CriarBanco",o,O),this.$q.notifyPositive("Parametriza\xE7\xE3o inicial realizada com sucesso"),o=`
            declare @baseDados varchar(250) = ${$utils.sqlStr(this.dados.baseDados)}
            declare @ativo int = ${$utils.sqlNum(this.servidor.ativoSincronismo)}
            update sincronismoBanco set ativo=@ativo where bancoDeDados=@baseDados
            if @@Rowcount = 0
            begin
              insert into sincronismoBanco (bancoDeDados, ativo) values (@baseDados, @ativo)
            end`,await $utils.executarSql(o,"GeeksPlat15A"),this.$q.notifyPositive("Sincronismo ativado para o banco")}}catch(a){this.$q.notifyError("Erro na cria\xE7\xE3o do banco",a)}finally{this.$q.loading.hide()}}},watch:{"dados.codigoSistema"(a){this.servidor=this.sistemasOptisoul.find(o=>o.valor===a)?this.servidorOptisoul:this.servidorB15,this.dados.segmento=this.sistemasOptisoul.find(o=>o.valor===a)?"\xD3tica":this.dados.segmento}},async mounted(){this.logado=$db.usuario.logado,await this.atualiza()}},W={id:"CriarBanco"},Y={class:"col-4"},K={class:"col-2"};function X(a,o,h,$,e,c){const S=g("barraTopo"),r=g("campo"),l=g("row"),u=g("card"),D=g("SeletorCidade"),N=g("SeletorPais"),m=g("g-label"),p=g("g-col"),f=g("g-row");return E(),j("div",W,[i(Q,{onSubmit:c.criarBanco},{default:t(()=>[i(M,{elevated:"",class:"bg-gradiente text-white"},{default:t(()=>[i(S),e.logado.modoDesenvolvedor.status?(E(),U(x,{key:0,class:"q-px-sm"},{default:t(()=>[i(_,{name:"mdi-database-plus",size:"sm"}),i(T,null,{default:t(()=>o[18]||(o[18]=[B("Cria\xE7\xE3o de banco para novo cliente")])),_:1})]),_:1})):V("",!0)]),_:1}),i(I,null,{default:t(()=>[e.logado.modoDesenvolvedor.status?(E(),U(k,{key:0,class:"u-container"},{default:t(()=>[i(u,null,{default:t(()=>[i(l,null,{default:t(()=>[i(r,{col:"3",modelValue:e.dados.cnpj,"onUpdate:modelValue":o[0]||(o[0]=s=>e.dados.cnpj=s),modelModifiers:{trim:!0},rotulo:"CNPJ",mask:"##.###.###/####-##"},null,8,["modelValue"]),i(r,{col:"9",modelValue:e.dados.fantasia,"onUpdate:modelValue":o[1]||(o[1]=s=>e.dados.fantasia=s),modelModifiers:{trim:!0},rotulo:"Fantasia"},null,8,["modelValue"]),i(r,{col:"12",modelValue:e.dados.razaoSocial,"onUpdate:modelValue":o[2]||(o[2]=s=>e.dados.razaoSocial=s),modelModifiers:{trim:!0},rotulo:"Raz\xE3o Social"},null,8,["modelValue"])]),_:1})]),_:1}),i(u,null,{default:t(()=>[i(l,null,{default:t(()=>o[19]||(o[19]=[B(" Endere\xE7o ")])),_:1}),i(l,null,{default:t(()=>[i(r,{col:"2",modelValue:e.dados.cep,"onUpdate:modelValue":o[3]||(o[3]=s=>e.dados.cep=s),modelModifiers:{trim:!0},rotulo:"CEP",onChange:o[4]||(o[4]=s=>c.consultarCep()),mask:"#####-###",rules:[s=>s&&s.replace(/\D/g,"").length===8||"O CEP est\xE1 muito curto."]},null,8,["modelValue","rules"]),i(r,{col:"5",modelValue:e.dados.logradouro,"onUpdate:modelValue":o[5]||(o[5]=s=>e.dados.logradouro=s),modelModifiers:{trim:!0},rotulo:"Endere\xE7o"},null,8,["modelValue"]),i(r,{col:"2",modelValue:e.dados.numero,"onUpdate:modelValue":o[6]||(o[6]=s=>e.dados.numero=s),modelModifiers:{trim:!0},rotulo:"Numero"},null,8,["modelValue"]),i(r,{col:"3",modelValue:e.dados.complemento,"onUpdate:modelValue":o[7]||(o[7]=s=>e.dados.complemento=s),modelModifiers:{trim:!0},rotulo:"Complemento"},null,8,["modelValue"])]),_:1}),i(l,null,{default:t(()=>[i(r,{col:"5",modelValue:e.dados.bairro,"onUpdate:modelValue":o[8]||(o[8]=s=>e.dados.bairro=s),modelModifiers:{trim:!0},rotulo:"Bairro"},null,8,["modelValue"]),i(r,{col:"1",modelValue:e.dados.uf,"onUpdate:modelValue":o[9]||(o[9]=s=>e.dados.uf=s),modelModifiers:{trim:!0},rotulo:"UF"},null,8,["modelValue"]),G("div",Y,[i(D,{ibgeCod:e.dados.ibgeCod,onSelecionar:o[10]||(o[10]=s=>c.selecionarCidade(s,a.index)),required:"","somente-leitura":!1},null,8,["ibgeCod"])]),G("div",K,[i(N,{codigoPais:e.dados.codigoPais,onSelecionar:o[11]||(o[11]=s=>c.selecionarPais(s,a.index)),required:""},null,8,["codigoPais"])])]),_:1})]),_:1}),i(u,null,{default:t(()=>[i(l,null,{default:t(()=>[i(r,{col:"12",modelValue:e.dados.baseDados,"onUpdate:modelValue":o[12]||(o[12]=s=>e.dados.baseDados=s),modelModifiers:{trim:!0},rotulo:"Base de Dados"},null,8,["modelValue"]),i(r,{col:"6",modelValue:e.dados.codigoSistema,"onUpdate:modelValue":o[13]||(o[13]=s=>e.dados.codigoSistema=s),rotulo:"Sistema",tipo:"seletor",opcoes:e.sistemas},null,8,["modelValue","opcoes"]),i(r,{col:"3",modelValue:e.dados.segmento,"onUpdate:modelValue":o[14]||(o[14]=s=>e.dados.segmento=s),modelModifiers:{trim:!0},rotulo:"Segmento"},null,8,["modelValue"]),i(r,{col:"3",modelValue:e.servidor.codigo,"onUpdate:modelValue":o[15]||(o[15]=s=>e.servidor.codigo=s),rotulo:"Servidor","somente-leitura":""},null,8,["modelValue"])]),_:1})]),_:1}),i(u,null,{default:t(()=>[i(l,null,{default:t(()=>[i(r,{col:"3",modelValue:e.dados.cpfUsuario,"onUpdate:modelValue":o[16]||(o[16]=s=>e.dados.cpfUsuario=s),modelModifiers:{trim:!0},rotulo:"CPF usuario",mask:"###.###.###-##"},null,8,["modelValue"]),i(r,{col:"9",modelValue:e.dados.nomeUsuario,"onUpdate:modelValue":o[17]||(o[17]=s=>e.dados.nomeUsuario=s),modelModifiers:{trim:!0},rotulo:"Nome"},null,8,["modelValue"])]),_:1})]),_:1})]),_:1})):(E(),U(k,{key:1,class:"u-container"},{default:t(()=>[i(f,{items:"center",justify:"center",style:{position:"absolute",width:"100%",height:"100%"}},{default:t(()=>[i(p,{col:"12"},{default:t(()=>[i(m,{text:"h5 semi-bold center"},{default:t(()=>o[20]||(o[20]=[B("Usu\xE1rio sem permiss\xF5es!")])),_:1})]),_:1})]),_:1})]),_:1}))]),_:1}),e.logado.modoDesenvolvedor.status?(E(),U(z,{key:0,class:"bg-light border-top"},{default:t(()=>[i(x,{class:"u-container q-px-sm"},{default:t(()=>[i(F),i(L,{type:"submit",label:"Criar",unelevated:"",color:"primary"})]),_:1})]),_:1})):V("",!0)]),_:1},8,["onSubmit"])])}var so=y(H,[["render",X]]);export{so as default};
