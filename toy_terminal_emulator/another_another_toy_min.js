var readStringFromFile,writeStringToFile,getCurrentDirectory,RunningFileDirectory="",resolveDirectory=function(a){for(var b=a.length-1;0<=b&&"/"!==a[b];b--);RunningFileDirectory="/"===a[0]?a.slice(0,b+1):process.cwd()+a.slice(1,b+1)};
if("function"===typeof require){var fs=require("fs"),path=require("path"),sys=require("sys"),exec=require("child_process").exec,out_;readStringFromFile=function(a){return fs.readFileSync(path.resolve(RunningFileDirectory,a),"utf8")};writeStringToFile=function(a,b){fs.writeFile(path.resolve(__dirname,a),b);return"undefined"};getCurrentDirectory=function(){return __dirname}}
var LIST=2,MACRO=4,PROCEDURE=6,BUILTIN_PRIMITIVE_PROCEDURE=8,RATIO=10,FLOAT=12,Cons=function(a,b){this.car=a;this.cdr=b;this.set_car=function(a){this.car=a};this.set_cdr=function(a){this.cdr=a};this.TYPE=LIST},Procedure=function(a,b,c,d){this.args=a;this.body=b;this.closure_env=c;this.TYPE=PROCEDURE;this.docstring=d},Macro=function(a,b,c){this.args=a;this.body=b;this.closure_env=c;this.TYPE=MACRO},Builtin_Primitive_Procedure=function(a){this.func=a;this.TYPE=BUILTIN_PRIMITIVE_PROCEDURE},Toy_Number=
function(a,b,c){this.TYPE=c;this.numer=a;this.denom=b},cons=function(a,b){return new Cons(a,b)},build_nil=function(){return null};function isNumber(a){return!isNaN(parseFloat(a))&&isFinite(a)}
var isInteger=function(a){if(0==a.length)return!1;"-"==a[0]&&(a=a.slice(1));return"0"===a||/^[1-9][0-9]*$/.test(a)},isFloat=function(a){return isNumber(a)&&!isInteger(a)},isRatio=function(a){if("string"!==typeof a)return!1;var b=a.indexOf("/");if(-1===b)return!1;var c=a.slice(0,b),b=a.slice(b+1);return isInteger(c)&&isInteger(b)?(0===parseInt(b)&&console.log("Invalid ratio --- "+a+" with denominator 0"),!0):!1},number$=function(a){return a instanceof Toy_Number},getNumerator=function(a){return a.slice(0,
a.indexOf("/"))},getDenominator=function(a){return a.slice(a.indexOf("/")+1)},car=function(a){return null===a?(console.log("ERROR: Cannot get car of ()"),null):a.car},cdr=function(a){return a.cdr},caar=function(a){return car(car(a))},cadr=function(a){return car(cdr(a))},cddr=function(a){return cdr(cdr(a))},cdddr=function(a){return cdr(cdr(cdr(a)))},caddr=function(a){return car(cdr(cdr(a)))},cadddr=function(a){return car(cdr(cdr(cdr(a))))},cadar=function(a){return car(cdr(car(a)))},lexer=function(a){var b=
function(a,c){return c==a.length?c:"\n"==a[c]?c+1:b(a,c+1)},c=function(a,b){return b==a.length?b:b+3<=a.length&&";;;"===a.slice(b,b+3)?b+3:c(a,b+1)},d=function(a,b){return b==a.length?(console.log("ERROR: Incomplete String"),b):"\\"==a[b]?d(a,b+2):'"'===a[b]?b+1:d(a,b+1)},f=function(a,b){return b==a.length?b:"("==a[b]||")"==a[b]||"["==a[b]||"]"==a[b]||"{"==a[b]||"}"==a[b]||" "==a[b]||"\t"==a[b]||"\n"==a[b]||";"==a[b]||","==a[b]?b:f(a,b+1)},g=function(a,e){if(e>=a.length)return null;if(" "===a[e]||
"\n"==a[e]||"\t"==a[e]||","===a[e])return g(a,e+1);if("("===a[e]||"["===a[e])return cons("(",g(a,e+1));if("#"!==a[e]||"("!==a[e+1]&&"["!==a[e+1]){if("{"===a[e])return cons("(",cons("dictionary",g(a,e+1)));if(")"===a[e]||"]"==a[e]||"}"==a[e])return cons(")",g(a,e+1));if("~"===a[e]&&"@"===a[e+1])return cons("~@",g(a,e+2));if("'"===a[e]||"`"==a[e]||"~"==a[e])return cons(a[e],g(a,e+1));if('"'===a[e]){var m=d(a,e+1);return cons(a.slice(e,m),g(a,m))}if(e+3<=a.length&&";;;"===a.slice(e,e+3))return g(a,c(a,
e+3));if(";"===a[e])return g(a,b(a,e+1));var m=f(a,e+1),k=a.slice(e,m);return isRatio(k)?cons("(",cons("/",cons(parseFloat(getNumerator(k)),cons(parseFloat(getDenominator(k)),cons(")",g(a,m)))))):cons(k,g(a,m))}return cons("(",cons("vector",g(a,e+2)))};return g(a,0)},parser=function(a){var b=a,c=function(a){return null===a?(console.log("ERROR: Incomplete Statement. Missing )"),b=null):")"===car(a)?(b=cdr(a),build_nil()):"("===car(a)?cons(c(cdr(a)),c(b)):"'"===car(a)||"~"===car(a)||"`"===car(a)||"~@"===
car(a)?cons(d(a),c(b)):cons(g(car(a)),c(cdr(a)))},d=function(a){var e;e="'"===car(a)?"quote":"~"===car(a)?"unquote":"~@"===car(a)?"unquote-splice":"quasiquote";a=cdr(a);if("("===car(a))return cons(e,cons(c(cdr(a)),build_nil()));if("'"===car(a)||"~"===car(a)||"`"===car(a))return cons(e,cons(d(a),build_nil()));b=cdr(a);return cons(e,cons(g(car(a)),build_nil()))},f=function(a,b){var c=function(a,b,d){return d===a.length?b:c(a,cons(b,cons(":"+a[d],null)),d+1)};return c(b,cons(a,cons(":"+b[0],null)),1)},
g=function(a){if(isNumber(a))return isInteger(a)?new Toy_Number(parseFloat(a),1,RATIO):new Toy_Number(parseFloat(a),1,FLOAT);if(isRatio(a))return new Toy_Number(parseFloat(getNumerator(a)),parseFloat(getDenominator(a)),RATIO);var b=a.split(":");if(":"===a||1==b.length||":"===a[0]||":"===a[a.length-1])return a;a=b[0];b=b.slice(1);return f(a,b)};return null==a?build_nil():"("===car(a)?cons(c(cdr(a)),parser(b)):"'"===car(a)||"~"===car(a)||"`"===car(a)||"~@"===car(a)?cons(d(a),b):cons(g(car(a)),parser(cdr(a)))},
gcd=function(a,b){for(;0!=b;){var c=a;a=b;b=c%b}return a},numer=function(a){return a.numer},denom=function(a){return a.denom},make_rat=function(a,b){var c=gcd(a,b);return new Toy_Number(a/c,b/c,RATIO)},number_to_string=function(a){return a.TYPE===FLOAT||1===a.denom?""+a.numer:a.numer+"/"+a.denom},add_rat=function(a,b){return make_rat(numer(a)*denom(b)+numer(b)*denom(a),denom(a)*denom(b))},sub_rat=function(a,b){return make_rat(numer(a)*denom(b)-numer(b)*denom(a),denom(a)*denom(b))},mul_rat=function(a,
b){return make_rat(numer(a)*numer(b),denom(a)*denom(b))},div_rat=function(a,b){return make_rat(numer(a)*denom(b),denom(a)*numer(b))},formatNumber=function(a){return a.TYPE===FLOAT?""+a.numer.toFixed(10):1===a.denom?""+a.numer:a.numer+"/"+a.denom},formatList=function(a){if(null===a)return"()";for(var b="(";;){if(null===a){b=b.slice(0,b.length-1)+")";break}if(!(a instanceof Cons)){var c=a,b=b+". ";null===c?b+="())":number$(c)?b=b+formatNumber(c)+")":"string"===typeof c?b=b+c+")":c instanceof Cons?b=
b+formatList(c)+")":c instanceof Array?b=b+formatVector(c)+")":c.TYPE===PROCEDURE?b+="< user-defined-procedure >)":"function"===typeof c?b+="< builtin-primitive-procedure >)":c.TYPE===MACRO?b+="< macro >":c instanceof Object&&(b=b+formatDictionary(c)+")");break}c=a.car;null===c?b+="() ":number$(c)?b=b+formatNumber(c)+" ":"string"===typeof c?b=b+c+" ":c instanceof Cons?b=b+formatList(c)+" ":c instanceof Array?b=b+formatVector(c)+" ":"function"===typeof c?b+="< builtin-procedure > ":c.TYPE===PROCEDURE?
b+="< user-defined-procedure > ":c.TYPE===MACRO?b+="< macro > ":c instanceof Object&&(b=b+formatDictionary(c)+" ");a=a.cdr}return b},formatVector=function(a){for(var b="#[",c=0;c<a.length;c++){var d=a[c];null===d?b+="() ":number$(d)?b=b+formatNumber(d)+" ":"string"===typeof d?b=b+d+" ":d instanceof Cons?b=b+formatList(d)+" ":d instanceof Array?b=b+formatVector(d)+" ":d.TYPE===PROCEDURE?b+="< user-defined-procedure > ":"function"===typeof d?b+="< builtin-procedure > ":d.TYPE===MACRO?b+="< macro > ":
d instanceof Object&&(b=b+formatDictionary(d)+" ")}return b=b.slice(0,b.length-1)+"]"},formatDictionary=function(a){var b="{",c;for(c in a){var b=b+":"+c+" ",d=a[c];null===d?b+="(), ":number$(d)?b=b+formatNumber(d)+", ":"string"===typeof d?b=b+d+", ":d instanceof Cons?b=b+formatList(d)+", ":d instanceof Array?b=b+formatVector(d)+",":d.TYPE===PROCEDURE?b+="< user-defined-procedure >, ":"function"===typeof d?b+="< builtin-procedure >, ":d.TYPE===MACRO?b+="< macro > ":d instanceof Object&&(b=b+formatDictionary(d)+
", ")}return b=b.slice(0,b.length-2)+"}"},to_string=function(a){if(number$(a))return formatNumber(a);if("string"===typeof a)return a;if(a instanceof Cons)return formatList(a);if(a instanceof Array)return formatVector(a);if(a.TYPE===PROCEDURE)return"< user-defined-procedure >";if(a.TYPE===BUILTIN_PRIMITIVE_PROCEDURE)return"undefined";if(a instanceof Object)return formatDictionary(a);console.log("Function display: Invalid Parameters Type");return"undefined"},lookup_env=function(a,b){for(var c=b.length-
1;0<=c;c--)if(a in b[c])return b[c][a];console.log("ERROR: unbound variable: "+a);return"undefined"},make_lambda=function(a,b){var c=car(a),d=cdr(a),d=cons("lambda",cons(d,b));return cons("def",cons(c,cons(d,build_nil())))},eval_set=function(a,b,c){for(var d=c.length-1;0<=d;d--)if(a in c[d])return c[d][a]=b;console.log("ERROR: Function set!, var name "+a+" does not exist");return"undefined"},eval_quasiquote=function(a,b){if(null===a)return null;var c=car(a);if("string"===typeof c){if("."===c)return c=
cadr(a),"string"===typeof c?c:"unquote"===car(c)?toy_eval(cadr(c),b):eval_quasiquote(c,b)}else if(null!==c&&c.TYPE===LIST){if("unquote"===car(c))return cons(toy_eval(cadr(c),b),eval_quasiquote(cdr(a),b));if("unquote-splice"===car(c)){var d=function(a,b){return null==a?b:cons(car(a),d(cdr(a),b))},c=toy_eval(cadr(c),b);return c instanceof Cons?d(c,eval_quasiquote(cdr(a),b)):(console.log("ERROR: ~@ only support list type value"),null)}return cons(eval_quasiquote(c,b),eval_quasiquote(cdr(a),b))}return cons(c,
eval_quasiquote(cdr(a),b))},eval_lambda=function(a,b){var c=car(a),d=cdr(a),f="This function has no information provided";"string"===typeof c&&'"'===c[0]&&(f=c.slice(1,c.length-1),c=car(d),d=cdr(d));for(var g={arg_name_list:[],arg_val_list:[]};null!=c;){var h=car(c);if("string"===typeof h)if(":"===h[0]){var h=h.slice(1),c=cdr(c),e=toy_eval(car(c),b);g.arg_name_list.push(h);g.arg_val_list.push(e)}else if("."===h){g.arg_name_list.push(".");g.arg_val_list.push("undefined");c=cdr(c);h=car(c);":"==h[0]?
(h=h.slice(1),c=cdr(c),e=toy_eval(car(c),b),g.arg_name_list.push(h),g.arg_val_list.push(e)):(g.arg_name_list.push(h),g.arg_val_list.push(null));break}else g.arg_name_list.push(h),g.arg_val_list.push("undefined");else return console.log("ERROR: Function definition error."),"undefined";c=cdr(c)}return new Procedure(g,d,b.slice(0),f)},eval_macro=function(a,b,c){return new Macro(a,b,c.slice(0))},eval_list=function(a,b){return null===a?null:cons(toy_eval(car(a),b),eval_list(cdr(a),b))},macro_expand=function(a,
b,c){var d=function(a,b,c){for(;null!==b;){var f=car(b);if(f instanceof Cons)d(a,b.car,c.car);else if("."===f){a[cadr(b)]=c;break}else{if(null===c){console.log("ERROR: Invalid macro. Pattern doesn't match");break}var g=car(c);a[f]=g}b=cdr(b);c=cdr(c)}};c=a.closure_env.slice(0);var f=a.body,g={};d(g,a.args,b);c.push(g);return[eval_begin(f,c),a.closure_env]},eval_begin=function(a,b){for(var c=null;null!==a;)c=toy_eval(car(a),b),a=cdr(a);return c},toy_eval=function(a,b){for(;;){if(null===a)return null;
if("string"===typeof a)return'"'===a[0]?a.slice(1,a.length-1):":"===a[0]?a.slice(1):lookup_env(a,b);if(a instanceof Toy_Number||a.TYPE!==LIST)return a;var c=car(a);if("quote"===c){var d=function(a){if(null==a)return null;var b=car(a);return b instanceof Cons?cons(d(b),d(cdr(a))):"."===b?cadr(a):cons(b,d(cdr(a)))};return cadr(a)instanceof Cons?d(cadr(a)):cadr(a)}if("quasiquote"===c)return c=cadr(a),"string"!==typeof c&&c.TYPE===LIST?eval_quasiquote(c,b):c;if("def"===c){var f=cadr(a),c=caddr(a);if("string"===
typeof f&&f in b[b.length-1])return console.log("\nERROR: It is not recommended or allowed to redefine an existed variable: "+f+"\nTo change the value of a variable. Use (set! var-name var-value)\nIn this case: (set! "+f+" "+to_string(c)+")"),"undefined";if("string"!==typeof f&&f.TYPE===LIST)return toy_eval(make_lambda(f,cddr(a)),b);if("string"!==typeof f)return console.log("ERROR: Invalid variable name : "+primitive_builtin_functions["->str"]([f])),"undefined";c=toy_eval(c,b);return b[b.length-1][f]=
c}if("set!"===c)return f=cadr(a),c=toy_eval(caddr(a),b),eval_set(f,c,b);if("let"===c){var g=cadr(a),c={};for(b.push(c);null!==g;){var f=car(g),h=toy_eval(car(cdr(g)),b);c[f]=h;g=cddr(g)}f=eval_begin(cddr(a),b);b.pop(c);return f}if("lambda"===c)return eval_lambda(cdr(a),b);if("if"===c)c=cadr(a),f=caddr(a),g=cadddr(a),c=toy_eval(c,b),a=null==c?g:f;else if("begin"===c){h=cdr(a);if(null==h)return"undefined";for(;null!==h.cdr;)toy_eval(car(h),b),h=h.cdr;a=h.car}else{if("eval"===c)return toy_eval(toy_eval(cadr(a),
b),b);if("apply"===c)return toy_eval(cons(toy_eval(cadr(a),b),toy_eval(caddr(a),b)),b);if("function"===typeof c)return c.call(null,function(a,b){for(var c=[];null!==a;)c.push(toy_eval(car(a),b)),a=cdr(a);return c}(cdr(a),b));if("macroexpand-1"===c)return c=toy_eval(cadr(a),b),macro_expand(toy_eval(car(c),b),cdr(c),b)[0];if("defmacro"===c)return c=eval_macro(caddr(a),cdddr(a),b),b[0][cadr(a)]=c;if("get-env"===c)return b.slice(0);if(c.TYPE===PROCEDURE){for(var f=cdr(a),g=c.closure_env.slice(0),e=c.args,
h=c.body,c={},m=e.arg_val_list,e=e.arg_name_list,k=0;k<e.length;k++){if("."===e[k]){if(null==f){var l=e[k+1];c[l]=m[k+1]}else{var l=e[k+1],p=eval_list(f,b);c[l]=p}break}null==f?e[k]in c||(c[e[k]]=m[k]):(l=car(f),"string"===typeof l&&":"===l[0]?(l=l.slice(1),f=cdr(f),p=toy_eval(car(f),b),c[l]=p,l===e[k]||e[k]in c||(c[e[k]]=m[k])):(l=e[k],p=toy_eval(car(f),b),c[l]=p),f=cdr(f))}g.push(c);a=cons("begin",h);b=g}else{if(c.TYPE===MACRO){var c=macro_expand(c,cdr(a),b),n=function(a,b,c){if(null===a)return null;
if(!(a instanceof Cons))return a;var d=car(a);if(d instanceof Cons)return cons(n(d,b,!0),n(cdr(a),b,!1));if(c){if("def"===d||"set!"===d||"lambda"===d||"let"===d)return cons(d,cons(cadr(a),n(cddr(a),b,!1)));if("quote"===d||"quasiquote"===d||"unquote"===d)return a;if("defmacro"===d)return cons(d,cons(cadr(a),cons(caddr(a),n(cdddr(a),b,!1))));for(c=b.length-1;0<=c;c--)if(d in b[c])return cons(b[c][d],n(cdr(a),b,!1));return cons(d,n(cdr(a),b,!1))}for(c=b.length-1;0<=c;c--)if(d in b[c])return cons(b[c][d],
n(cdr(a),b,!1));return cons(d,n(cdr(a),b,!1))},c=n(c[0],c[1],!0);return toy_eval(c,b)}if(c instanceof Array)return f=toy_eval(cadr(a),b),!f instanceof Toy_Number?(console.log("ERROR: invalid index"),"undefined"):f>=c.length||0>f?(console.log("ERROR: Index out of boundary"),"undefined"):c[f.numer];if(c instanceof Object&&!(c instanceof Toy_Number||c instanceof Cons))return f=toy_eval(cadr(a),b),f in c?c[f]:"undefined";c=toy_eval(car(a),b);f=cons(c,cdr(a));if("undefined"===c||c instanceof Toy_Number)return console.log("ERROR: Invalid Function "+
(c instanceof Toy_Number?formatNumber(c):c)),console.log("      WITH EXP: "+to_string(a)),"undefined";a=f}}}},primitive_builtin_functions={"+":function(a){var b=a[0];a=a[1];var c=b instanceof Toy_Number,d=a instanceof Toy_Number;if(c&&d)return b.TYPE===FLOAT||a.TYPE===FLOAT?new Toy_Number(b.numer/b.denom+a.numer/a.denom,1,FLOAT):add_rat(b,a);c&&(b=formatNumber(b));d&&(a=formatNumber(a));return b+a},"-":function(a){var b=a[0];a=a[1];var c=b instanceof Toy_Number,d=a instanceof Toy_Number;if(c&&d)return b.TYPE===
FLOAT||a.TYPE===FLOAT?new Toy_Number(b.numer/b.denom-a.numer/a.denom,1,FLOAT):sub_rat(b,a);c&&(b=formatNumber(b));d&&(a=formatNumber(a));return b-a},"*":function(a){var b=a[0];a=a[1];var c=b instanceof Toy_Number,d=a instanceof Toy_Number;if(c&&d)return b.TYPE===FLOAT||a.TYPE===FLOAT?new Toy_Number(b.numer/b.denom*(a.numer/a.denom),1,FLOAT):mul_rat(b,a);c&&(b=formatNumber(b));d&&(a=formatNumber(a));return b*a},"/":function(a){var b=a[0];a=a[1];var c=b instanceof Toy_Number,d=a instanceof Toy_Number;
if(c&&d)return b.TYPE===FLOAT||a.TYPE===FLOAT?new Toy_Number(b.numer/b.denom/(a.numer/a.denom),1,FLOAT):0===a.numer?(console.log("ERROR: Cannot divide by 0"),"false"):div_rat(b,a);c&&(b=formatNumber(b));d&&(a=formatNumber(a));return b/a},"<":function(a){var b=a[0];a=a[1];var c=a instanceof Toy_Number;b instanceof Toy_Number&&(b=b.numer/b.denom);c&&(a=a.numer/a.denom);return b<a?"true":null},"eq?":function(a){var b=a[0];a=a[1];var c=a instanceof Toy_Number;b instanceof Toy_Number&&(b=b.numer/b.denom);
c&&(a=a.numer/a.denom);return b===a?"true":null},"number?":function(a){return a[0]instanceof Toy_Number?"true":null},"ratio?":function(a){return a[0]instanceof Toy_Number&&a[0].TYPE===RATIO&&1!==a[0].denom?"true":null},"float?":function(a){return a[0]instanceof Toy_Number&&a[0].TYPE===FLOAT?"true":null},"integer?":function(a){return a[0]instanceof Toy_Number&&a[0].TYPE===RATIO&&1==a[0].denom?"true":null},numerator:function(a){if(a[0]instanceof Toy_Number)return new Toy_Number(a[0].numer,1,RATIO);
console.log("ERROR: Function numerator wrong type parameters");return"undefined"},denominator:function(a){if(a[0]instanceof Toy_Number)return new Toy_Number(a[0].denom,1,RATIO);console.log("ERROR: Function numerator wrong type parameters");return"undefined"},"null?":function(a){return null===a[0]?"true":null},cons:function(a){return cons(a[0],a[1])},car:function(a){return car(a[0])},cdr:function(a){return cdr(a[0])},"set-car!":function(a){var b=a[0];a=a[1];if("string"!==typeof b&&b.TYPE===LIST)return b.car=
a,b;console.log("ERROR: Function set-car! wrong type parameters");return"undefined"},"set-cdr!":function(a){var b=a[0];a=a[1];if("string"!==typeof b&&b.TYPE===LIST)return b.cdr=a,b;console.log("ERROR: Function set-car! wrong type parameters");return"undefined"},vector:function(a){return a},dictionary:function(a){for(var b={},c=0;c<a.length;c+=2)b[a[c]]=a[c+1];return b},conj:function(a){var b=a[0];a=a[1];if(b.TYPE===LIST)return cons(a,b);if(b instanceof Array)return b=b.slice(0),b.push(a),b;if(b instanceof
Object){var b=Object.create(b),c;for(c in a)b[c]=a[c];return b}},"conj!":function(a){var b=a[0];a=a[1];if(b.TYPE===LIST)return cons(a,b);if(b instanceof Array)return b.push(a),b;if(b instanceof Object){for(var c in a)b[c]=a[c];return b}},assoc:function(a){var b=a[0],c=a[1];a=a[2];if(b instanceof Array)return b=b.slice(0),b[c.numer]=a,b;if(b instanceof Object)return b=Object.create(b),b[c]=a,b;console.log("ERROR...Function assoc wrong type parameters")},"assoc!":function(a){var b=a[0],c=a[1];a=a[2];
if(b instanceof Array)return b[c.numer]=a,b;if(b instanceof Object)return b[c]=a,b;console.log("ERROR...Function assoc wrong type parameters")},pop:function(a){a=a[0];if(a instanceof Array)return a=a.slice(0),a.pop(),a;if(a.TYPE===LIST)return cdr(a);console.log("ERROR...Function pop wrong type parameters")},"pop!":function(a){a=a[0];if(a instanceof Array)return a.pop(),a;console.log("ERROR...Function pop wrong type parameters")},random:function(a){return new Toy_Number(Math.random(),1,FLOAT)},"->ratio":function(a){a=
a[0];if(number$(a)){if(a.TYPE===RATIO)return a;a=a.numer;var b=Math.pow(10,function(a){a=""+a;var b=a.indexOf(".")+1;return a.length-b}(a));return make_rat(a*b,b)}console.log("Function ->ratio --- only support number type data");return"undefined"},"dictionary-keys":function(a){return Object.keys(a[0])},ref:function(a){var b=a[0];a=a[1];if("string"===typeof b)return b[a.numer];if(b.TYPE===LIST){var c=function(a,b){return null===a?null:0===b?car(a):c(cdr(a),b-1)};return c(b,a.numer)}if(b instanceof
Array){var d=a.numer;return 0>d||d>=b.length?(console.log("ERROR: Index out of boundary"),"undefined"):b[a.numer]}if(b instanceof Object)return a in b?b[a]:"undefined";console.log("ERROR: Function ref wrong type parameters")},"->str":function(a){return to_string(a[0])},"typeof":function(a){a=a[0];if(null===a)return"null";if("string"===typeof a)return"atom";if(a instanceof Toy_Number)return"number";if(a instanceof Cons)return"list";if(a instanceof Array)return"vector";if(a.TYPE===PROCEDURE||a.TYPE===
BUILTIN_PRIMITIVE_PROCEDURE)return"procedure";if(a.TYPE===MACRO)return"macro";if(a instanceof Object)return"dictionary";console.log("ERROR: Cannot judge type");return"undefined"},len:function(a){a=a[0];if(null===a)return new Toy_Number(0,1,RATIO);if("string"===typeof a)return new Toy_Number(a.length,1,RATIO);if(a.TYPE===LIST){var b=function(a,d){return null===a?d:b(cdr(a),d+1)};return new Toy_Number(b(a,0),1,RATIO)}if(a instanceof Array)return new Toy_Number(a.length,1,RATIO);console.log("ERROR: Function len wrong type parameters");
return"undefined"},slice:function(a){var b=a[0],c=a[1];a=a[2];if(!(c instanceof Toy_Number&&a instanceof Toy_Number))return console.log("ERROR: Function slice wrong type parameters"),"undefined";if(b instanceof Array)return b.slice(c.numer,a.numer);if(b.TYPE===LIST){var d=function(a,b,c,e){return e>=b?e===c?null:cons(car(a),d(cdr(a),b,c,e+1)):d(cdr(a),b,c,e+1)};return d(b,c.numer,a.numer,0)}if("string"===typeof b)return b.slice(c.numer,a.numer);console.log("ERROR: Function slice wrong type parameters");
return"undefined"},display:function(a){try{var b=a[0];if(null===b)return console.log("()"),"undefined";number$(b)?console.log(formatNumber(b)):"string"===typeof b?console.log(b):b instanceof Cons?console.log(formatList(b)):b instanceof Array?console.log(formatVector(b)):b.TYPE===PROCEDURE?console.log("< user-defined-procedure >"):"function"===typeof b?console.log("< builtin-procedure >"):b.TYPE===MACRO?console.log("< macro >"):b instanceof Object?console.log(formatDictionary(b)):console.log("Function display: Invalid Parameters Type");
return"undefined"}catch(c){return console.log(c),"undefined"}},math:{acos:function(a){return new Toy_Number(Math.acos(a[0].numer/a[0].denom),1,FLOAT)},acosh:function(a){return new Toy_Number(Math.acosh(a[0].numer/a[0].denom),1,FLOAT)},asin:function(a){return new Toy_Number(Math.asin(a[0].numer/a[0].denom),1,FLOAT)},asinh:function(a){return new Toy_Number(Math.asinh(a[0].numer/a[0].denom),1,FLOAT)},atan:function(a){return new Toy_Number(Math.atan(a[0].numer/a[0].denom),1,FLOAT)},atanh:function(a){return new Toy_Number(Math.atanh(a[0].numer/
a[0].denom),1,FLOAT)},ceil:function(a){return new Toy_Number(Math.ceil(a[0].numer/a[0].denom),1,RATIO)},cos:function(a){return new Toy_Number(Math.cos(a[0].numer/a[0].denom),1,FLOAT)},cosh:function(a){return new Toy_Number(Math.cosh(a[0].numer/a[0].denom),1,FLOAT)},exp:function(a){return new Toy_Number(Math.exp(a[0].numer/a[0].denom),1,FLOAT)},floor:function(a){return new Toy_Number(Math.floor(a[0].numer/a[0].denom),1,RATIO)},loge:function(a){return new Toy_Number(Math.log(a[0].numer/a[0].denom),
1,FLOAT)},pow:function(a){return a[0].TYPE===RATIO&&a[1].TYPE===RATIO&&1===a[1].denom?new Toy_Number(Math.pow(a[0].numer,a[1].numer),Math.pow(a[0].denom,a[1].numer),RATIO):new Toy_Number(Math.pow(a[0].numer/a[0].denom,a[1].numer/a[1].denom),1,FLOAT)},sin:function(a){return new Toy_Number(Math.sin(a[0].numer/a[0].denom),1,FLOAT)},sinh:function(a){return new Toy_Number(Math.sinh(a[0].numer/a[0].denom),1,FLOAT)},tan:function(a){return new Toy_Number(Math.tan(a[0].numer/a[0].denom),1,FLOAT)},tanh:function(a){return new Toy_Number(Math.tanh(a[0].numer/
a[0].denom),1,FLOAT)}},js:function(a){var b=a[0];a=a.slice(1);for(var c=0;c<a.length;c++)a[c]instanceof Toy_Number&&(a[c]=a[c].numer/a[c].denom);b=eval(b).apply(null,a);return isNumber(b)?new Toy_Number(b,1,FLOAT):"boolean"===typeof b?!0===b?"true":null:"undefined"===typeof b?"undefined":b},read:function(a){return a[0]instanceof Cons?cons(a[0],null):parser(lexer(a[0]))},"read-file":function(a){return"undefined"===typeof readStringFromFile?(console.log("ERROR: Cannot read file. Require NodeJS Support"),
"undefined"):readStringFromFile(a[0])},"write-file":function(a){return"undefined"===typeof writeStringToFile?(console.log("ERROR: Cannot write file. Require NodeJS Support"),"undefined"):writeStringToFile(a[0],a[1])},"get-cwd":function(a){return"undefined"===typeof process?(console.log("ERROR: Cannot get current directory. Require NodeJS Support"),"undefined"):process.cwd()},require:function(a){if("undefined"===typeof readStringFromFile)return console.log("ERROR: Cannot require module. Require NodeJS Support"),
"undefined";var b=create_new_environment();a=readStringFromFile(a[0]);a=lexer(a);a=parser(a);eval_begin(a,b);return b[1]},"get-function-doc":function(a){return a[0].docstring},"set-function-doc":function(a){a[0].docstring=a[1];return"undefined"},input:function(a){return TOY_getINPUT(a)},"__undefined?__":function(a){var b=a[0];a=a[1];for(var c=0;c<a.length;c++)if(b in a[c])return null;return"true"},"true":"true","false":null,def:"def","set!":"set!",cond:"cond","if":"if",quote:"quote",quasiquote:"quasiquote",
lambda:"lambda",defmacro:"defmacro",virtual_file_system:{}};function TOY_getINPUT(a){return"undefined"===typeof prompt?(console.log("ERROR: prompt function is not defined in current javascript scope."),console.log("You need to rewrite 'function TOY_getINPUT(stack_param)' by yourself and return string format of output"),"undefined"):0==a.length?prompt(""):prompt(a[0])}var create_new_environment=function(){return[primitive_builtin_functions,{}]},ENVIRONMENT=create_new_environment();
"undefined"!=typeof module&&(module.exports.lexer=lexer,module.exports.parser=parser,module.exports.eval_begin=eval_begin,module.exports.display=function(a){primitive_builtin_functions.display([a])},module.exports.env=ENVIRONMENT,module.exports.resolveDirectory=resolveDirectory);var RUN_FIRST='(def (list . args) args) (defmacro cond (arg . args) (if (eq? (car arg) (quote else)) (cons (quote begin) (cdr arg)) (if (null? args) (let (judge (car arg) body (cons (quote begin) (cdr arg))) (quasiquote (if (unquote judge) (unquote body) ()))) (let (rest (cons (quote cond) args) judge (car arg) body (cons (quote begin) (cdr arg))) (quasiquote (if (unquote judge) (unquote body) (unquote rest))))))) (set! + (let (o_+ + +_iter (lambda (result args) (cond ((null? args) result) (else (+_iter (o_+ result (car args)) (cdr args)))))) (lambda (. args) (cond ((null? args) (display ("ERROR : Function + invalid parameters. Please provide parameters"))) (else (+_iter (car args) (cdr args))))))) (set! - (let (o_- - -_iter (lambda (result args) (cond ((null? args) result) (else (-_iter (o_- result (car args)) (cdr args)))))) (lambda (. args) (cond ((null? args) (display ("ERROR : Function - invalid parameters. Please provide parameters"))) ((null? (cdr args)) (o_- 0 (car args))) (else (-_iter (car args) (cdr args))))))) (set! * (let (o_* * *_iter (lambda (result args) (cond ((null? args) result) (else (*_iter (o_* (car args) result) (cdr args)))))) (lambda (. args) (cond ((null? args) (display ("ERROR : Function * invalid parameters. Please provide parameters"))) (else (*_iter (car args) (cdr args))))))) (set! / (let (o_div / div_iter (lambda (result args) (cond ((null? args) result) (else (div_iter (o_div result (car args)) (cdr args)))))) (lambda (. args) (cond ((null? args) (display ("ERROR : Function / invalid parameters. Please provide parameters"))) ((null? (cdr args)) (o_div 1 (car args))) (else (div_iter (car args) (cdr args))))))) (def #t "true") (def #f ()) (def nil ()) (def (factorial n) (if (eq? n 0) 1 (* n (factorial (- n 1))))) (set! factorial (lambda (n) (def (factorial-acc n acc) (if (eq? n 0) acc (factorial-acc (- n 1) (* acc n)))) (factorial-acc n 1))) (defmacro and (. args) (if (null? args) true (let (judge (car args)) (quasiquote (if (unquote judge) (apply and (cdr (quote (unquote args)))) false))))) (defmacro or (. args) (if (null? args) false (let (judge (car args)) (quasiquote (if (unquote judge) true (apply or (cdr (quote (unquote args))))))))) (def (> arg0 arg1) (< arg1 arg0)) (def (<= arg0 arg1) (or (< arg0 arg1) (eq? arg0 arg1))) (def (>= arg0 arg1) (or (> arg0 arg1) (eq? arg0 arg1))) (set! < (let (old-< < <-iter (lambda (args cur) (if (null? args) true (if (old-< cur (car args)) (<-iter (cdr args) (car args)) false)))) (lambda (. args) (if (null? args) (display "Please provide arguments for <") (<-iter (cdr args) (car args)))))) (set! > (let (old-> > >-iter (lambda (args cur) (if (null? args) true (if (old-> cur (car args)) (>-iter (cdr args) (car args)) false)))) (lambda (. args) (if (null? args) (display "Please provide arguments for >") (>-iter (cdr args) (car args)))))) (set! eq? (let (old-eq? eq? eq?-iter (lambda (args cur) (if (null? args) true (if (old-eq? cur (car args)) (eq?-iter (cdr args) (car args)) false)))) (lambda (. args) (if (null? args) (display "Please provide arguments for eq?") (eq?-iter (cdr args) (car args)))))) (set! <= (let (old-<= <= <=-iter (lambda (args cur) (if (null? args) true (if (old-<= cur (car args)) (<=-iter (cdr args) (car args)) false)))) (lambda (. args) (if (null? args) (display "Please provide arguments for <=") (<=-iter (cdr args) (car args)))))) (set! >= (let (old->= >= >=-iter (lambda (args cur) (if (null? args) true (if (old->= cur (car args)) (>=-iter (cdr args) (car args)) false)))) (lambda (. args) (if (null? args) (display "Please provide arguments for >=") (>=-iter (cdr args) (car args)))))) (def (not arg0) (if arg0 false true)) (def (pair? arg) (eq? (typeof arg) (quote list))) (def (list? arg) pair?) (def (atom? arg) (eq? (typeof arg) (quote atom))) (def string? atom?) (def (vector? arg) (eq? (typeof arg) (quote vector))) (def (dictionary? arg) (eq? (typeof arg) (quote dictionary))) (def (undefined? arg) (eq? arg (quote undefined))) (def (procedure? arg) (eq? (typeof arg) (quote procedure))) (def (function? arg) procedure?) (def (macro? arg) (eq? (typeof arg) (quote macro))) (def ** (math :pow)) (def ^ (math :pow)) (assoc! math :log (lambda (x y) (/ ((math :loge) y) ((math :loge) x)))) (assoc! math :sec (lambda (x) (/ 1 ((math :cos) x)))) (assoc! math :csc (lambda (x) (/ 1 ((math :sin) x)))) (assoc! math :cot (lambda (x) (/ 1 ((math :tan) x)))) (def (% n0 n1) (let (result (->int (/ n0 n1))) (- n0 (* result n1)))) (def (append a b) (if (null? a) b (cons (car a) (append (cdr a) b)))) (def (reverse l) (def (reverse-iter result l) (if (null? l) result (reverse-iter (cons (car l) result) (cdr l)))) (reverse-iter () l)) (defmacro defn (fn_name args . body) (list (quote def) fn_name (cons (quote lambda) (cons args body)))) (defmacro comment (. args) ()) (def (map func . args) (def length (len (car args))) (def (get-args-list args i) (if (null? args) () (cons (ref (car args) i) (get-args-list (cdr args) i)))) (def (map-iter func args i) (cond ((eq? i length) ()) (else (cons (apply func (get-args-list args i)) (map-iter func args (+ i 1)))))) (map-iter func args 0)) (def (str . args) (def (str-iter result args) (if (null? args) result (str-iter (+ result (->str (car args))) (cdr args)))) (str-iter "" args)) (def (->float num) (* num 1.0000000000)) (def (->int num) (cond ((eq? num 0) 0) ((> num 0) ((math :floor) num)) (else ((math :ceil) num)))) (def (diff func diff-at-point :error 0.0000010000) (def (diff_ error) (/ (- (func diff-at-point) (func (- diff-at-point error))) error)) (diff_ error)) (def (integral func a b :dx 0.0100000000) (def (sum term a next b) (if (> a b) 0 (+ (term a) (sum term (next a) next b)))) (def (add-dx x) (+ x dx)) (* (sum func (+ a (/ dx 2.0000000000)) add-dx b) dx)) (def (set-car x value) (cons value (cdr x))) (def (set-cdr x value) (cons (car x) value)) (set! undefined? (lambda (var-name) (__undefined?__ var-name (get-env)))) (def (make-gensym) (let (count 0 step 1 set-name (lambda () (set! count (+ count step)) (let (var-name (str "t_" count)) (if (undefined? var-name) var-name (set-name))))) set-name)) (def gensym (make-gensym)) (defmacro load (file-name) (quasiquote (eval (cons (quote begin) (read (read-file (unquote file-name)))))))';
eval_begin(parser(lexer(RUN_FIRST)),ENVIRONMENT);