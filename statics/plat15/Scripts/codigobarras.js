 // ===> INICIO DO CODIGO
var BARS = [ 212222, 222122, 222221, 121223, 121322, 131222, 122213,
   122312, 132212, 221213, 221312, 231212, 112232, 122132, 122231,
   113222, 123122, 123221, 223211, 221132, 221231, 213212, 223112,
   312131, 311222, 321122, 321221, 312212, 322112, 322211, 212123,
   212321, 232121, 111323, 131123, 131321, 112313, 132113, 132311,
   211313, 231113, 231311, 112133, 112331, 132131, 113123, 113321,
   133121, 313121, 211331, 231131, 213113, 213311, 213131, 311123,
   311321, 331121, 312113, 312311, 332111, 314111, 221411, 431111,
   111224, 111422, 121124, 121421, 141122, 141221, 112214, 112412,
   122114, 122411, 142112, 142211, 241211, 221114, 413111, 241112,
   134111, 111242, 121142, 121241, 114212, 124112, 124211, 411212,
   421112, 421211, 212141, 214121, 412121, 111143, 111341, 131141,
   114113, 114311, 411113, 411311, 113141, 114131, 311141, 411131,
   211412, 211214, 211232, 23311120 ], START_BASE = 38, STOP = 106;

var fromType = {
   A : function(charCode) {
      if (charCode >= 0 && charCode < 32)
         return charCode + 64;  
      if (charCode >= 32 && charCode < 96)
         return charCode - 32;
      return charCode;
   },
   B : function(charCode) {
      if (charCode >= 32 && charCode < 128)
         return charCode - 32;
      return charCode;
   },
   C : function(charCode) {
      return charCode;
   }
};

function code128(code, allSpace, barcodeType) {
   if (barcodeType == undefined)
      barcodeType = code128Detect(code);
   if (allSpace == undefined)
      allSpace = 180;  
   if (barcodeType == 'C' && code.length % 2 == 1)
      code = '0' + code;

   var a = parseBarcode(code, barcodeType);
   var b = a.join('');
   var sb = [];
   var codeBarSpace = 2;
    //alert(b + " - " + b.length);  

   for ( var pos = 0; pos < b.length; pos += 2) {
      sb.push(' <div class="divCode bar' + b.charAt(pos) + ' space' + b.charAt(pos + 1) + '"></div>');

      codeBarSpace = ( codeBarSpace + (parseInt(b.charAt(pos + 1)) + parseInt(b.charAt(pos))) );
   }

   var margin = (parseInt(allSpace)-codeBarSpace)/2;

   return '<div width="' + codeBarSpace + 'px" style="margin: 0 ' + margin + ';">' + sb.join('') + '<br/><br/><label class="labelCode">' + code + '</label></div>';
}

function code128Detect(code) {
   if (/^[0-9]+$/.test(code))
      return 'C';
   if (/[a-z]/.test(code))
      return 'B';
   return 'A';
}

function parseBarcode(barcode, barcodeType) {

   var bars = [];

   bars.add = function(nr) {

      var nrCode = BARS[nr];
      this.check = this.length == 0 ? nr : this.check + nr * this.length;
      this.push(nrCode || format("UNDEFINED: %1->%2", nr, nrCode));

   };

   bars.add(START_BASE + barcodeType.charCodeAt(0));

   for ( var i = 0; i < barcode.length; i++) {
      var code = barcodeType == 'C' ? +barcode.substr(i++, 2) : barcode .charCodeAt(i); converted = fromType[barcodeType](code);  

      if (isNaN(converted) || converted<0 || converted>106)
         throw new Error( format("Unrecognized character (%1) at position %2 in code '%3'.", code, i, barcode));

      bars.add(converted);
   }

   bars.push(BARS[bars.check % 103], BARS[STOP]);

   return bars;
}
// ===> FIM DO CODIGO

function fbarcode(valor,alt){
  
  var fino = 1 ;
  var largo = 3 ;
  var altura = 50 ;
  if (alt) altura = alt;

  var barcodes = [];
  barcodes.push("00110");
  barcodes.push("10001");
  barcodes.push("01001");
  barcodes.push("11000");
  barcodes.push("00101");
  barcodes.push("10100");
  barcodes.push("01100");
  barcodes.push("00011");
  barcodes.push("10010");
  barcodes.push("01010");
  for(var i=9;i>=0;i--){ 
    for(var j=9;j>=0;j--){  
      var f = (i * 10) + j ;
      var texto = "" ;
      for(var k=1;k<6;k++){ 
        texto +=  barcodes[i].substr((k-1),1) + barcodes[j].substr((k-1),1);
      }
      barcodes[f] = texto;
    }
  }


  //Desenho da barra


  //Guarda inicial
  var retorno = "<img src=imagens/p.png width="+fino+" height="+altura+" border=0><img " +
  	"src=imagens/b.png width="+fino+" height="+altura+" border=0><img " +
  	"src=imagens/p.png width="+fino+" height="+altura+" border=0><img " +
  	"src=imagens/b.png width="+fino+" height="+altura+" border=0><img "; 

  var texto = valor ;
  if((texto.length % 2) != 0){
  	texto = "0" + texto;
  }

  // Draw dos dados
  var i;
  var f;
  var f1;
  var f2;
  while (texto.length > 0) {
    i = parseInt((esquerda(texto,2)));
    texto = direita(texto,texto.length-2);
    f = barcodes[i];
    for(var k=1;k<11;k+=2){
      if (f.substr((k-1),1) == "0") {
        f1 = fino ;
      }else{
        f1 = largo ;
      }

      retorno += " src=imagens/p.png width="+f1+" height="+altura+" border=0><img ";

      if (f.substr(k,1) == "0") {
        f2 = fino ;
      }else{
        f2 = largo ;
      }

      retorno += " src=imagens/b.png width="+f2+" height="+altura+" border=0><img ";
    }
  }

  // Draw guarda final
  retorno += " src=imagens/p.png width="+largo+" height="+altura+" border=0><img " +
  	"src=imagens/b.png width="+fino+" height="+altura+" border=0><img " +
  	"src=imagens/p.png width="+fino+" height="+altura+" border=0> ";

	return retorno;
} //Fim da função

function fbarcodeetiqueta(valor){
  
  var fino = 1 ;
  var largo = 1.7 ;
  var altura = 20 ;

  var barcodes = [];
  barcodes.push("00110");
  barcodes.push("10001");
  barcodes.push("01001");
  barcodes.push("11000");
  barcodes.push("00101");
  barcodes.push("10100");
  barcodes.push("01100");
  barcodes.push("00011");
  barcodes.push("10010");
  barcodes.push("01010");
  for(var i=9;i>=0;i--){ 
    for(var j=9;j>=0;j--){  
      var f = (i * 10) + j ;
      var texto = "" ;
      for(var k=1;k<6;k++){ 
        texto +=  barcodes[i].substr((k-1),1) + barcodes[j].substr((k-1),1);
      }
      barcodes[f] = texto;
    }
  }


  //Desenho da barra


  //Guarda inicial
  var retorno = "<img src=imagens/p.png width="+fino+" height="+altura+" border=0><img " +
    "src=imagens/b.png width="+fino+" height="+altura+" border=0><img " +
    "src=imagens/p.png width="+fino+" height="+altura+" border=0><img " +
    "src=imagens/b.png width="+fino+" height="+altura+" border=0><img "; 

  var texto = valor ;
  if((texto.length % 2) != 0){
    texto = "0" + texto;
  }

  // Draw dos dados
  var i;
  var f;
  var f1;
  var f2;
  while (texto.length > 0) {
    i = parseInt((esquerda(texto,2)));
    texto = direita(texto,texto.length-2);
    f = barcodes[i];
    for(var k=1;k<11;k+=2){
      if (f.substr((k-1),1) == "0") {
        f1 = fino ;
      }else{
        f1 = largo ;
      }

      retorno += " src=imagens/p.png width="+f1+" height="+altura+" border=0><img ";

      if (f.substr(k,1) == "0") {
        f2 = fino ;
      }else{
        f2 = largo ;
      }

      retorno += " src=imagens/b.png width="+f2+" height="+altura+" border=0><img ";
    }
  }

  // Draw guarda final
  retorno += " src=imagens/p.png width="+largo+" height="+altura+" border=0><img " +
    "src=imagens/b.png width="+fino+" height="+altura+" border=0><img " +
    "src=imagens/p.png width="+fino+" height="+altura+" border=0> ";

  return retorno;
} //Fim da função

function esquerda(entra,comp){
	return entra.substr(0,comp);
}

function direita(entra,comp){
	return entra.substr(entra.length-comp,comp);
}

// private method for UTF-8 decoding
function utf8_decode(utftext) {
    var string = "";
    var i = 0;
    var c = 0,
        c1 = 0,
        c2 = 0;

    while (i < utftext.length) {
        c = utftext.charCodeAt(i);

        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        } else if ((c > 191) && (c < 224)) {
            c1 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
            i += 2;
        } else {
            c1 = utftext.charCodeAt(i + 1);
            c2 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
            i += 3;
        }
    }

    return string;
};