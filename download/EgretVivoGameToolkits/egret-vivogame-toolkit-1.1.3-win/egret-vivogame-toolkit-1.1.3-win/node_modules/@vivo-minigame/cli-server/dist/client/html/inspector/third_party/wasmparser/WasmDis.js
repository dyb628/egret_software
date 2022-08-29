import{OperatorCodeNames,bytesToString,NULL_FUNCTION_INDEX}from'./WasmParser.js';function typeToString(type){switch(type){case-1:return'i32';case-2:return'i64';case-3:return'f32';case-4:return'f64';case-5:return'v128';case-16:return'anyfunc';case-17:return'anyref';default:throw new Error(`Unexpected type ${type}`);}}
function formatFloat32(n){if(n===0)
return(1/n)<0?'-0.0':'0.0';if(isFinite(n))
return n.toString();if(!isNaN(n))
return n<0?'-infinity':'infinity';var view=new DataView(new ArrayBuffer(8));view.setFloat32(0,n,true);var data=view.getInt32(0,true);var payload=data&0x7FFFFF;const canonicalBits=4194304;if(data>0&&payload===canonicalBits)
return'nan';else if(payload===canonicalBits)
return'-nan';return(data<0?'-':'+')+'nan:0x'+payload.toString(16);}
function formatFloat64(n){if(n===0)
return(1/n)<0?'-0.0':'0.0';if(isFinite(n))
return n.toString();if(!isNaN(n))
return n<0?'-infinity':'infinity';var view=new DataView(new ArrayBuffer(8));view.setFloat64(0,n,true);var data1=view.getUint32(0,true);var data2=view.getInt32(4,true);var payload=data1+(data2&0xFFFFF)*4294967296;const canonicalBits=524288*4294967296;if(data2>0&&payload===canonicalBits)
return'nan';else if(payload===canonicalBits)
return'-nan';return(data2<0?'-':'+')+'nan:0x'+payload.toString(16);}
function formatI32Array(bytes,count){var dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);var result=[];for(var i=0;i<count;i++)
result.push(`0x${formatHex(dv.getInt32(i << 2, true), 8)}`);return result.join(' ');}
function memoryAddressToString(address,code){var defaultAlignFlags;switch(code){case 64768:case 64769:defaultAlignFlags=4;break;case 41:case 55:case 43:case 57:case 65026:case 65041:case 65048:case 65055:case 65062:case 65069:case 65076:case 65083:case 65090:case 65097:defaultAlignFlags=3;break;case 40:case 52:case 53:case 54:case 62:case 42:case 56:case 65024:case 65025:case 65040:case 65046:case 65047:case 65053:case 65054:case 65060:case 65061:case 65067:case 65068:case 65074:case 65075:case 65081:case 65082:case 65088:case 65089:case 65095:case 65096:case 65102:defaultAlignFlags=2;break;case 46:case 47:case 50:case 51:case 59:case 61:case 65043:case 65045:case 65050:case 65052:case 65057:case 65059:case 65064:case 65066:case 65071:case 65073:case 65078:case 65080:case 65085:case 65087:case 65092:case 65094:case 65099:case 65101:defaultAlignFlags=1;break;case 44:case 45:case 48:case 49:case 58:case 60:case 65042:case 65044:case 65049:case 65051:case 65056:case 65058:case 65063:case 65065:case 65070:case 65072:case 65077:case 65079:case 65084:case 65086:case 65091:case 65093:case 65098:case 65100:defaultAlignFlags=0;break;}
if(address.flags==defaultAlignFlags)
return!address.offset?null:`offset=${address.offset}`;if(!address.offset)
return`align=${1 << address.flags}`;return`offset=${address.offset | 0} align=${1 << address.flags}`;}
function globalTypeToString(type){if(!type.mutability)
return typeToString(type.contentType);return`(mut ${typeToString(type.contentType)})`;}
function limitsToString(limits){return limits.initial+(limits.maximum!==undefined?' '+limits.maximum:'');}
var paddingCache=['0','00','000'];function formatHex(n,width){var s=(n>>>0).toString(16).toUpperCase();if(width===undefined||s.length>=width)
return s;var paddingIndex=width-s.length-1;while(paddingIndex>=paddingCache.length)
paddingCache.push(paddingCache[paddingCache.length-1]+'0');return paddingCache[paddingIndex]+s;}
const IndentIncrement='  ';var operatorCodeNamesCache=null;function getOperatorName(code){if(!operatorCodeNamesCache){operatorCodeNamesCache=Object.create(null);Object.keys(OperatorCodeNames).forEach((key)=>{let value=OperatorCodeNames[key];if(typeof value!=='string')
return;operatorCodeNamesCache[key]=value.replace(/^([if](32|64))_/,"$1.").replace(/_([if](32|64))$/,"\/$1");});}
return operatorCodeNamesCache[code];}
export class DefaultNameResolver{getTypeName(index,isRef){return'$type'+index;}
getTableName(index,isRef){return'$table'+index;}
getMemoryName(index,isRef){return'$memory'+index;}
getGlobalName(index,isRef){return'$global'+index;}
getFunctionName(index,isImport,isRef){return(isImport?'$import':'$func')+index;}
getVariableName(funcIndex,index,isRef){return'$var'+index;}
getLabel(index){return'$label'+index;}}
export class NumericNameResolver{getTypeName(index,isRef){return isRef?''+index:`(;${index};)`;}
getTableName(index,isRef){return isRef?''+index:`(;${index};)`;}
getMemoryName(index,isRef){return isRef?''+index:`(;${index};)`;}
getGlobalName(index,isRef){return isRef?''+index:`(;${index};)`;}
getFunctionName(index,isImport,isRef){return isRef?''+index:`(;${index};)`;}
getVariableName(funcIndex,index,isRef){return isRef?''+index:`(;${index};)`;}
getLabel(index){return null;}}
export var LabelMode;(function(LabelMode){LabelMode[LabelMode["Depth"]=0]="Depth";LabelMode[LabelMode["WhenUsed"]=1]="WhenUsed";LabelMode[LabelMode["Always"]=2]="Always";})(LabelMode||(LabelMode={}));export class WasmDisassembler{constructor(){this._lines=[];this._offsets=[];this._buffer='';this._indent=null;this._indentLevel=0;this._addOffsets=false;this._done=false;this._currentPosition=0;this._nameResolver=new DefaultNameResolver();this._labelMode=LabelMode.WhenUsed;this._reset();}
_reset(){this._types=[];this._funcIndex=0;this._funcTypes=[];this._importCount=0;this._globalCount=0;this._memoryCount=0;this._tableCount=0;this._initExpression=[];this._backrefLabels=null;this._labelIndex=0;this._maxLines=0;}
get addOffsets(){return this._addOffsets;}
set addOffsets(value){if(this._currentPosition)
throw new Error('Cannot switch addOffsets during processing.');this._addOffsets=value;}
get labelMode(){return this._labelMode;}
set labelMode(value){if(this._currentPosition)
throw new Error('Cannot switch labelMode during processing.');this._labelMode=value;}
get nameResolver(){return this._nameResolver;}
set nameResolver(resolver){if(this._currentPosition)
throw new Error('Cannot switch nameResolver during processing.');this._nameResolver=resolver;}
set maxLines(value){this._maxLines=value;}
appendBuffer(s){this._buffer+=s;}
newLine(){if(this.addOffsets)
this._offsets.push(this._currentPosition);this._lines.push(this._buffer);this._buffer='';}
printFuncType(typeIndex){var type=this._types[typeIndex];if(type.form!==-32)
throw new Error('NYI other function form');if(type.params.length>0){this.appendBuffer(' (param');for(var i=0;i<type.params.length;i++){this.appendBuffer(' ');this.appendBuffer(typeToString(type.params[i]));}
this.appendBuffer(')');}
if(type.returns.length>0){this.appendBuffer(' (result');for(var i=0;i<type.returns.length;i++){this.appendBuffer(' ');this.appendBuffer(typeToString(type.returns[i]));}
this.appendBuffer(')');}}
printString(b){this.appendBuffer('\"');for(var i=0;i<b.length;i++){var byte=b[i];if(byte<0x20||byte>=0x7F||byte==0x22||byte==0x5c){this.appendBuffer('\\'+(byte>>4).toString(16)+(byte&15).toString(16));}
else{this.appendBuffer(String.fromCharCode(byte));}}
this.appendBuffer('\"');}
useLabel(depth){if(!this._backrefLabels){return''+depth;}
var i=this._backrefLabels.length-depth-1;if(i<0){return''+depth;}
var backrefLabel=this._backrefLabels[i];if(!backrefLabel.useLabel){backrefLabel.useLabel=true;backrefLabel.label=this._nameResolver.getLabel(this._labelIndex);var line=this._lines[backrefLabel.line];this._lines[backrefLabel.line]=line.substring(0,backrefLabel.position)+' '+backrefLabel.label+line.substring(backrefLabel.position);this._labelIndex++;}
return backrefLabel.label||''+depth;}
printOperator(operator){var code=operator.code;this.appendBuffer(getOperatorName(code));switch(code){case 2:case 3:case 4:if(this._labelMode!==LabelMode.Depth){let backrefLabel={line:this._lines.length,position:this._buffer.length,useLabel:false,label:null,};if(this._labelMode===LabelMode.Always){backrefLabel.useLabel=true;backrefLabel.label=this._nameResolver.getLabel(this._labelIndex++);if(backrefLabel.label){this.appendBuffer(' ');this.appendBuffer(backrefLabel.label);}}
this._backrefLabels.push(backrefLabel);}
if(operator.blockType!==-64){this.appendBuffer(' (result ');this.appendBuffer(typeToString(operator.blockType));this.appendBuffer(')');}
break;case 11:if(this._labelMode===LabelMode.Depth){break;}
let backrefLabel=this._backrefLabels.pop();if(backrefLabel.label){this.appendBuffer(' ');this.appendBuffer(backrefLabel.label);}
break;case 12:case 13:this.appendBuffer(' ');this.appendBuffer(this.useLabel(operator.brDepth));break;case 14:for(var i=0;i<operator.brTable.length;i++){this.appendBuffer(' ');this.appendBuffer(this.useLabel(operator.brTable[i]));}
break;case 16:var funcName=this._nameResolver.getFunctionName(operator.funcIndex,operator.funcIndex<this._importCount,true);this.appendBuffer(` ${funcName}`);break;case 17:var typeName=this._nameResolver.getTypeName(operator.typeIndex,true);this.appendBuffer(` (type ${typeName})`);break;case 32:case 33:case 34:var paramName=this._nameResolver.getVariableName(this._funcIndex,operator.localIndex,true);this.appendBuffer(` ${paramName}`);break;case 35:case 36:var globalName=this._nameResolver.getGlobalName(operator.globalIndex,true);this.appendBuffer(` ${globalName}`);break;case 40:case 41:case 42:case 43:case 44:case 45:case 46:case 47:case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:case 58:case 59:case 60:case 61:case 62:case 65024:case 65025:case 65026:case 65040:case 65041:case 65042:case 65043:case 65044:case 65045:case 65046:case 65047:case 65048:case 65049:case 65050:case 65051:case 65052:case 65053:case 65054:case 65055:case 65056:case 65057:case 65058:case 65059:case 65060:case 65061:case 65062:case 65063:case 65064:case 65065:case 65066:case 65067:case 65068:case 65069:case 65070:case 65071:case 65072:case 65073:case 65074:case 65075:case 65076:case 65077:case 65078:case 65079:case 65080:case 65081:case 65082:case 65083:case 65084:case 65085:case 65086:case 65087:case 65088:case 65089:case 65090:case 65091:case 65092:case 65093:case 65094:case 65095:case 65096:case 65097:case 65098:case 65099:case 65100:case 65101:case 65102:case 64768:case 64769:var memoryAddress=memoryAddressToString(operator.memoryAddress,operator.code);if(memoryAddress!==null){this.appendBuffer(' ');this.appendBuffer(memoryAddress);}
break;case 63:case 64:break;case 65:this.appendBuffer(` ${operator.literal.toString()}`);break;case 66:this.appendBuffer(` ${operator.literal.toString()}`);break;case 67:this.appendBuffer(` ${formatFloat32(operator.literal)}`);break;case 68:this.appendBuffer(` ${formatFloat64(operator.literal)}`);break;case 64770:this.appendBuffer(` i32 ${formatI32Array(operator.literal, 4)}`);break;case 64771:this.appendBuffer(` ${formatI32Array(operator.lines, 4)}`);break;case 64773:case 64774:case 64775:case 64777:case 64778:case 64779:case 64781:case 64782:case 64787:case 64788:case 64784:case 64785:case 64790:case 64791:this.appendBuffer(` ${operator.lineIndex}`);break;case 64520:case 64521:case 64525:this.appendBuffer(` ${operator.segmentIndex}`);break;case 38:case 37:case 64529:{let tableName=this._nameResolver.getTableName(operator.tableIndex,true);this.appendBuffer(` ${tableName}`);break;}
case 64526:{let tableName=this._nameResolver.getTableName(operator.tableIndex,true);let destinationName=this._nameResolver.getTableName(operator.destinationIndex,true);this.appendBuffer(` ${tableName} ${destinationName}`);break;}
case 64524:{let tableName=this._nameResolver.getTableName(operator.tableIndex,true);this.appendBuffer(` ${operator.segmentIndex} ${tableName}`);break;}}}
printImportSource(info){this.printString(info.module);this.appendBuffer(' ');this.printString(info.field);}
increaseIndent(){this._indent+=IndentIncrement;this._indentLevel++;}
decreaseIndent(){this._indent=this._indent.slice(0,-IndentIncrement.length);this._indentLevel--;}
disassemble(reader){let done=this.disassembleChunk(reader);if(!done)
return null;let lines=this._lines;if(this._addOffsets){lines=lines.map((line,index)=>{var position=formatHex(this._offsets[index],4);return line+' ;; @'+position;});}
lines.push('');let result=lines.join('\n');this._lines.length=0;this._offsets.length=0;return result;}
getResult(){let linesReady=this._lines.length;if(this._backrefLabels&&this._labelMode===LabelMode.WhenUsed){this._backrefLabels.some((backrefLabel)=>{if(backrefLabel.useLabel)
return false;linesReady=backrefLabel.line;return true;});}
if(linesReady===0){return{lines:[],offsets:this._addOffsets?[]:undefined,done:this._done,};}
if(linesReady===this._lines.length){let result={lines:this._lines,offsets:this._addOffsets?this._offsets:undefined,done:this._done,};this._lines=[];if(this._addOffsets)
this._offsets=[];return result;}
let result={lines:this._lines.splice(0,linesReady),offsets:this._addOffsets?this._offsets.splice(0,linesReady):undefined,done:false,};if(this._backrefLabels){this._backrefLabels.forEach((backrefLabel)=>{backrefLabel.line-=linesReady;});}
return result;}
disassembleChunk(reader,offsetInModule=0){if(this._done)
throw new Error('Invalid state: disassembly process was already finished.');while(true){if(this._maxLines&&this._lines.length>=this._maxLines){this.appendBuffer(';; -- truncated --');this.newLine();return true;}
this._currentPosition=reader.position+offsetInModule;if(!reader.read())
return false;switch(reader.state){case 2:this.appendBuffer(')');this.newLine();this._reset();if(!reader.hasMoreBytes()){this._done=true;return true;}
break;case-1:throw reader.error;case 1:this.appendBuffer('(module');this.newLine();break;case 4:break;case 3:var sectionInfo=reader.result;switch(sectionInfo.id){case 1:case 2:case 7:case 6:case 3:case 8:case 10:case 5:case 11:case 4:case 9:break;default:reader.skipSection();break;}
break;case 15:var memoryInfo=reader.result;var memoryName=this._nameResolver.getMemoryName(this._memoryCount++,false);this.appendBuffer(`  (memory ${memoryName} `);if(memoryInfo.shared){this.appendBuffer(`(shared ${limitsToString(memoryInfo.limits)})`);}
else{this.appendBuffer(limitsToString(memoryInfo.limits));}
this.appendBuffer(')');this.newLine();break;case 14:var tableInfo=reader.result;var tableName=this._nameResolver.getTableName(this._tableCount++,false);this.appendBuffer(`  (table ${tableName} ${limitsToString(tableInfo.limits)} ${typeToString(tableInfo.elementType)})`);this.newLine();break;case 17:var exportInfo=reader.result;this.appendBuffer('  (export ');this.printString(exportInfo.field);this.appendBuffer(' ');switch(exportInfo.kind){case 0:var funcName=this._nameResolver.getFunctionName(exportInfo.index,exportInfo.index<this._importCount,true);this.appendBuffer(`(func ${funcName})`);break;case 1:var tableName=this._nameResolver.getTableName(exportInfo.index,true);this.appendBuffer(`(table ${tableName})`);break;case 2:var memoryName=this._nameResolver.getMemoryName(exportInfo.index,true);this.appendBuffer(`(memory ${memoryName})`);break;case 3:var globalName=this._nameResolver.getGlobalName(exportInfo.index,true);this.appendBuffer(`(global ${globalName})`);break;default:throw new Error(`Unsupported export ${exportInfo.kind}`);}
this.appendBuffer(')');this.newLine();break;case 12:var importInfo=reader.result;this.appendBuffer('  (import ');this.printImportSource(importInfo);switch(importInfo.kind){case 0:this._importCount++;var funcName=this._nameResolver.getFunctionName(this._funcIndex++,true,false);this.appendBuffer(` (func ${funcName}`);this.printFuncType(importInfo.funcTypeIndex);this.appendBuffer(')');break;case 1:var tableImportInfo=importInfo.type;var tableName=this._nameResolver.getTableName(this._tableCount++,false);this.appendBuffer(` (table ${tableName} ${limitsToString(tableImportInfo.limits)} ${typeToString(tableImportInfo.elementType)})`);break;case 2:var memoryImportInfo=importInfo.type;var memoryName=this._nameResolver.getMemoryName(this._memoryCount++,false);this.appendBuffer(` (memory ${memoryName} `);if(memoryImportInfo.shared){this.appendBuffer(`(shared ${limitsToString(memoryImportInfo.limits)})`);}
else{this.appendBuffer(limitsToString(memoryImportInfo.limits));}
this.appendBuffer(')');break;case 3:var globalImportInfo=importInfo.type;var globalName=this._nameResolver.getGlobalName(this._globalCount++,false);this.appendBuffer(` (global ${globalName} ${globalTypeToString(globalImportInfo)})`);break;default:throw new Error(`NYI other import types: ${importInfo.kind}`);}
this.appendBuffer(')');this.newLine();break;case 33:var elementSegmentInfo=reader.result;this.appendBuffer('  (elem ');break;case 35:this.appendBuffer(')');this.newLine();break;case 34:let elementSegmentBody=reader.result;if(elementSegmentBody.elementType!=0){let typeName=typeToString(elementSegmentBody.elementType);this.appendBuffer(` ${typeName}`);}
elementSegmentBody.elements.forEach(funcIndex=>{if(elementSegmentBody.asElements){if(funcIndex==NULL_FUNCTION_INDEX){this.appendBuffer(' (ref.null)');}
else{let funcName=this._nameResolver.getFunctionName(funcIndex,funcIndex<this._importCount,true);this.appendBuffer(` (ref.func ${funcName})`);}}
else{let funcName=this._nameResolver.getFunctionName(funcIndex,funcIndex<this._importCount,true);this.appendBuffer(` ${funcName}`);}});break;case 39:var globalInfo=reader.result;var globalName=this._nameResolver.getGlobalName(this._globalCount++,false);this.appendBuffer(`  (global ${globalName} ${globalTypeToString(globalInfo.type)} `);break;case 40:this.appendBuffer(')');this.newLine();break;case 11:var funcType=reader.result;var typeIndex=this._types.length;this._types.push(funcType);var typeName=this._nameResolver.getTypeName(typeIndex,false);this.appendBuffer(`  (type ${typeName} (func`);this.printFuncType(typeIndex);this.appendBuffer('))');this.newLine();break;case 22:var startEntry=reader.result;var funcName=this._nameResolver.getFunctionName(startEntry.index,startEntry.index<this._importCount,true);this.appendBuffer(`  (start ${funcName})`);this.newLine();break;case 36:this.appendBuffer('  (data ');break;case 37:var body=reader.result;this.newLine();this.appendBuffer('    ');this.printString(body.data);this.newLine();break;case 38:this.appendBuffer('  )');this.newLine();break;case 25:break;case 26:this._initExpression.push(reader.result);break;case 27:this.appendBuffer('(');this._initExpression.forEach((op,index)=>{if(op.code===11){return;}
if(index>0){this.appendBuffer(' ');}
this.printOperator(op);});this.appendBuffer(')');this._initExpression.length=0;break;case 13:this._funcTypes.push(reader.result.typeIndex);break;case 28:var func=reader.result;var type=this._types[this._funcTypes[this._funcIndex-this._importCount]];this.appendBuffer('  (func ');this.appendBuffer(this._nameResolver.getFunctionName(this._funcIndex,false,false));for(var i=0;i<type.params.length;i++){var paramName=this._nameResolver.getVariableName(this._funcIndex,i,false);this.appendBuffer(` (param ${paramName} ${typeToString(type.params[i])})`);}
for(var i=0;i<type.returns.length;i++){this.appendBuffer(` (result ${typeToString(type.returns[i])})`);}
this.newLine();var localIndex=type.params.length;if(func.locals.length>0){this.appendBuffer('   ');for(var l of func.locals){for(var i=0;i<l.count;i++){var paramName=this._nameResolver.getVariableName(this._funcIndex,localIndex++,false);this.appendBuffer(` (local ${paramName} ${typeToString(l.type)})`);}}
this.newLine();}
this._indent='    ';this._indentLevel=0;this._labelIndex=0;this._backrefLabels=this._labelMode===LabelMode.Depth?null:[];break;case 30:var operator=reader.result;if(operator.code==11&&this._indentLevel==0){this.appendBuffer(`  )`);this.newLine();break;}
switch(operator.code){case 11:case 5:this.decreaseIndent();break;}
this.appendBuffer(this._indent);this.printOperator(operator);this.newLine();switch(operator.code){case 4:case 2:case 3:case 5:this.increaseIndent();break;}
break;case 31:this._funcIndex++;this._backrefLabels=null;break;default:throw new Error(`Expectected state: ${reader.state}`);}}}}
const UNKNOWN_FUNCTION_PREFIX="unknown";class NameSectionNameResolver extends DefaultNameResolver{constructor(names,localNames){super();this._names=names;this._localNames=localNames;}
getFunctionName(index,isImport,isRef){const name=this._names[index];if(!name)
return`$${UNKNOWN_FUNCTION_PREFIX}${index}`;return isRef?`$${name}`:`$${name} (;${index};)`;}
getVariableName(funcIndex,index,isRef){const name=this._localNames[funcIndex]&&this._localNames[funcIndex][index];if(!name)
return super.getVariableName(funcIndex,index,isRef);return isRef?`$${name}`:`$${name} (;${index};)`;}}
export class NameSectionReader{constructor(){this._done=false;this._functionsCount=0;this._functionImportsCount=0;this._functionNames=null;this._functionLocalNames=null;this._hasNames=false;}
read(reader){if(this._done)
throw new Error('Invalid state: disassembly process was already finished.');while(true){if(!reader.read())
return false;switch(reader.state){case 2:if(!reader.hasMoreBytes()){this._done=true;return true;}
break;case-1:throw reader.error;case 1:this._functionsCount=0;this._functionImportsCount=0;this._functionNames=[];this._functionLocalNames=[];this._hasNames=false;break;case 4:break;case 3:var sectionInfo=reader.result;if(sectionInfo.id===0&&bytesToString(sectionInfo.name)==="name"){break;}
if(sectionInfo.id===3||sectionInfo.id===2){break;}
reader.skipSection();break;case 12:var importInfo=reader.result;if(importInfo.kind===0)
this._functionImportsCount++;break;case 13:this._functionsCount++;break;case 19:var nameInfo=reader.result;if(nameInfo.type===1){var functionNameInfo=nameInfo;functionNameInfo.names.forEach((naming)=>{this._functionNames[naming.index]=bytesToString(naming.name);});this._hasNames=true;}
else if(nameInfo.type===2){var localNameInfo=nameInfo;localNameInfo.funcs.forEach(localName=>{this._functionLocalNames[localName.index]=[];localName.locals.forEach((naming)=>{this._functionLocalNames[localName.index][naming.index]=bytesToString(naming.name);});});this._hasNames=true;}
break;default:throw new Error(`Expectected state: ${reader.state}`);}}}
hasValidNames(){return this._hasNames;}
getNameResolver(){if(!this.hasValidNames())
throw new Error("Has no valid name section");const functionNamesLength=this._functionImportsCount+this._functionsCount;const functionNames=this._functionNames.slice(0,functionNamesLength);const usedNameAt=Object.create(null);for(let i=0;i<functionNames.length;i++){const name=functionNames[i];if(!name)
continue;const goodName=!(name in usedNameAt)&&!/[^0-9A-Za-z!#$%&'*+.:<=>?@^_`|~\/\-]/.test(name)&&name.indexOf(UNKNOWN_FUNCTION_PREFIX)!==0;if(!goodName){if(usedNameAt[name]>=0){functionNames[usedNameAt[name]]=null;usedNameAt[name]=-1;}
functionNames[i]=null;continue;}
usedNameAt[name]=i;}
return new NameSectionNameResolver(functionNames,this._functionLocalNames);}}