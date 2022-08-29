"use strict";var _fs=require("fs"),_path=require("path"),_jsrsasign=require("jsrsasign"),_crypto=require("crypto"),printCertFp=function(r){if(_fs.existsSync(r)){var e=_fs.readFileSync(r).toString(),t=new _jsrsasign.X509;t.readCertPEM(e.toString());var s=t.getSignatureValueHex(),i=new Buffer.from(s,"hex").toString("base64"),a=_crypto.createHash("SHA256");a.update(i);var n=a.digest(),o=new Buffer.from(n).toString("hex");console.info(o)}else console.error("error : certificate.pem is not exist!")},certPath=process.argv[2];printCertFp(certPath);