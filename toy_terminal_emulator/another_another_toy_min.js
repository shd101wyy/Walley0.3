var LIST=2,MACRO=4,PROCEDURE=6,BUILTIN_PRIMITIVE_PROCEDURE=8,RATIO=10,FLOAT=12,Cons=function(a,b){this.car=a;this.cdr=b;this.set_car=function(a){this.car=a};this.set_cdr=function(a){this.cdr=a};this.TYPE=LIST},Procedure=function(a,b,c){this.args=a;this.body=b;this.closure_env=c;this.TYPE=PROCEDURE},Macro=function(a,b,c){this.args=a;this.body=b;this.closure_env=c;this.TYPE=MACRO},Builtin_Primitive_Procedure=function(a){this.func=a;this.TYPE=BUILTIN_PRIMITIVE_PROCEDURE},Toy_Number=function(a,b,c){this.TYPE=
c;this.numer=a;this.denom=b},cons=function(a,b){return new Cons(a,b)},build_nil=function(){return null};function isNumber(a){return!isNaN(parseFloat(a))&&isFinite(a)}
var isInteger=function(a){if(0==a.length)return!1;"-"==a[0]&&(a=a.slice(1));return"0"===a||/^[1-9][0-9]*$/.test(a)},isFloat=function(a){return isNumber(a)&&!isInteger(a)},isRatio=function(a){if("string"!==typeof a)return!1;var b=a.indexOf("/");if(-1===b)return!1;var c=a.slice(0,b),b=a.slice(b+1);return isInteger(c)&&isInteger(b)?(0===parseInt(b)&&console.log("Invalid ratio --- "+a+" with denominator 0"),!0):!1},number$=function(a){return a instanceof Toy_Number},getNumerator=function(a){return a.slice(0,
a.indexOf("/"))},getDenominator=function(a){return a.slice(a.indexOf("/")+1)},car=function(a){return a.car},cdr=function(a){return a.cdr},caar=function(a){return car(car(a))},cadr=function(a){return car(cdr(a))},cddr=function(a){return cdr(cdr(a))},cdddr=function(a){return cdr(cdr(cdr(a)))},caddr=function(a){return car(cdr(cdr(a)))},cadddr=function(a){return car(cdr(cdr(cdr(a))))},cadar=function(a){return car(cdr(car(a)))},lexer=function(a){var b=function(a,c){return c==a.length?c:"\n"==a[c]?c+1:
b(a,c+1)},c=function(a,b){if(b==a.length)console.log("ERROR: Incomplete String");else return"\\"==a[b]?c(a,b+2):'"'===a[b]?b+1:c(a,b+1)},d=function(a,b){return b==a.length?b:"("==a[b]||")"==a[b]||"["==a[b]||"]"==a[b]||"{"==a[b]||"}"==a[b]||" "==a[b]||"\t"==a[b]||"\n"==a[b]||";"==a[b]||","==a[b]?b:d(a,b+1)},e=function(a,f){if(f>=a.length)return null;if(" "===a[f]||"\n"==a[f]||"\t"==a[f]||","===a[f])return e(a,f+1);if("("===a[f])return cons("(",e(a,f+1));if("["===a[f])return cons("(",cons("vector",
e(a,f+1)));if("{"===a[f])return cons("(",cons("dictionary",e(a,f+1)));if(")"===a[f]||"]"==a[f]||"}"==a[f])return cons(")",e(a,f+1));if("'"===a[f]||"`"==a[f]||"~"==a[f])return cons(a[f],e(a,f+1));if('"'===a[f]){var h=c(a,f+1);return cons(a.slice(f,h),e(a,h))}if(";"===a[f])return e(a,b(a,f+1));h=d(a,f+1);return cons(a.slice(f,h),e(a,h))};return e(a,0)},parser=function(a){var b=a,c=function(a){return")"===car(a)?(b=cdr(a),build_nil()):"("===car(a)?cons(c(cdr(a)),c(b)):"'"===car(a)||"~"===car(a)||"`"===
car(a)?cons(d(a),c(b)):cons(e(car(a)),c(cdr(a)))},d=function(a){var f;f="'"===car(a)?"quote":"~"===car(a)?"unquote":"quasiquote";a=cdr(a);if("("===car(a))return cons(f,cons(c(cdr(a)),build_nil()));if("'"===car(a)||"~"===car(a)||"`"===car(a))return cons(f,cons(d(a),build_nil()));b=cdr(a);return cons(f,cons(e(car(a)),build_nil()))},e=function(a){return":"==a[0]?cons("keyword",cons('"'+a.slice(1)+'"',build_nil())):isNumber(a)?isInteger(a)?new Toy_Number(parseFloat(a),1,RATIO):new Toy_Number(parseFloat(a),
1,FLOAT):isRatio(a)?new Toy_Number(parseFloat(getNumerator(a)),parseFloat(getDenominator(a)),RATIO):a};return null==a?build_nil():"("===car(a)?cons(c(cdr(a)),parser(b)):"'"===car(a)||"~"===car(a)||"`"===car(a)?cons(d(a),b):cons(e(car(a)),parser(cdr(a)))},gcd=function(a,b){for(;0!=b;){var c=a;a=b;b=c%b}return a},numer=function(a){return a.numer},denom=function(a){return a.denom},make_rat=function(a,b){var c=gcd(a,b);return new Toy_Number(a/c,b/c,RATIO)},number_to_string=function(a){return a.TYPE===
FLOAT||1===a.denom?""+a.numer:a.numer+"/"+a.denom},add_rat=function(a,b){return make_rat(numer(a)*denom(b)+numer(b)*denom(a),denom(a)*denom(b))},sub_rat=function(a,b){return make_rat(numer(a)*denom(b)-numer(b)*denom(a),denom(a)*denom(b))},mul_rat=function(a,b){return make_rat(numer(a)*numer(b),denom(a)*denom(b))},div_rat=function(a,b){return make_rat(numer(a)*denom(b),denom(a)*numer(b))},formatNumber=function(a){return a.TYPE===FLOAT?""+a.numer.toFixed(5):1===a.denom?""+a.numer:a.numer+"/"+a.denom},
formatList=function(a){if(null===a)return"()";for(var b="(";;){if(null===a){b=b.slice(0,b.length-1)+")";break}if(!(a instanceof Cons)){var c=a,b=b+". ";null===c?b+="())":number$(c)?b=b+formatNumber(c)+")":"string"===typeof c?b=b+c+")":c instanceof Cons?b=b+formatList(c)+")":c instanceof Array?b=b+formatVector(c)+")":c.TYPE===PROCEDURE?b+="< user-defined-procedure >)":"function"===typeof c?b+="< builtin-primitive-procedure >)":c.TYPE===MACRO?b+="< macro >":c instanceof Object&&(b=b+formatDictionary(c)+
")");break}c=a.car;null===c?b+="() ":number$(c)?b=b+formatNumber(c)+" ":"string"===typeof c?b=b+c+" ":c instanceof Cons?b=b+formatList(c)+" ":c instanceof Array?b=b+formatVector(c)+" ":"function"===typeof c?b+="< builtin-procedure > ":c.TYPE===PROCEDURE?b+="< user-defined-procedure > ":c.TYPE===MACRO?b+="< macro > ":c instanceof Object&&(b=b+formatDictionary(c)+" ");a=a.cdr}return b},formatVector=function(a){for(var b="[",c=0;c<a.length;c++){var d=a[c];null===d?b+="() ":number$(d)?b=b+formatNumber(d)+
" ":"string"===typeof d?b=b+d+" ":d instanceof Cons?b=b+formatList(d)+" ":d instanceof Array?b=b+formatVector(d)+" ":d.TYPE===PROCEDURE?b+="< user-defined-procedure > ":"function"===typeof d?b+="< builtin-procedure > ":d.TYPE===MACRO?b+="< macro > ":d instanceof Object&&(b=b+formatDictionary(d)+" ")}return b=b.slice(0,b.length-1)+"]"},formatDictionary=function(a){var b="{",c;for(c in a){var b=b+c+" ",d=a[c];null===d?b+="(), ":number$(d)?b=b+formatNumber(d)+", ":"string"===typeof d?b=b+d+", ":d instanceof
Cons?b=b+formatList(d)+", ":d instanceof Array?b=b+formatVector(d)+",":d.TYPE===PROCEDURE?b+="< user-defined-procedure >, ":"function"===typeof d?b+="< builtin-procedure >, ":d.TYPE===MACRO?b+="< macro > ":d instanceof Object&&(b=b+formatDictionary(d)+", ")}return b=b.slice(0,b.length-1)+"}"},lookup_env=function(a,b){for(var c=b.length-1;0<=c;c--)if(a in b[c])return b[c][a];console.log("ERROR: unbound variable: "+a);return"undefined"},make_lambda=function(a,b){var c=car(a),d=cons("vector",cdr(a)),
d=cons("lambda",cons(d,b));return cons("def",cons(c,cons(d,build_nil())))},eval_set=function(a,b,c){for(var d=c.length-1;0<=d;d--)if(a in c[d])return c[d][a]=b;console.log("ERROR:Function set!, var name "+a+" does not exist");return"undefined"},eval_quasiquote=function(a,b){if(null===a)return null;var c=car(a);return"string"!==typeof c&&c.TYPE===LIST?"unquote"===car(c)?cons(toy_eval(cadr(c),b),eval_quasiquote(cdr(a),b)):cons(eval_quasiquote(c,b),eval_quasiquote(cdr(a),b)):cons(c,eval_quasiquote(cdr(a),
b))},eval_cond=function(a,b){for(;null!==a;){var c=car(a),d=car(c),c=cdr(c);if("else"==d||null!==toy_eval(d,b))return eval_begin(c,b);a=cdr(a)}return null},eval_lambda=function(a,b,c){if("vector"!==a.car)return console.log("ERROR: when defining lambda, please use (lambda [args] body) format"),"undefined";a=cdr(a);for(var d={arg_name_list:[],arg_val_list:[]};null!=a;){var e=car(a);if("string"===typeof e)d.arg_name_list.push(e),d.arg_val_list.push("undefined");else if("keyword"===car(e)){e=cadr(e);
e=e.slice(1,e.length-1);a=cdr(a);var g=toy_eval(car(a),c);d.arg_name_list.push(e);d.arg_val_list.push(g)}else return console.log("ERROR: Function definition error."),"undefined";a=cdr(a)}return new Procedure(d,b,c.slice(0))},eval_macro=function(a,b,c){if("vector"!==a.car)return console.log("ERROR: when defining macro_args, please use (defmacro macro_name [args] body) format"),"undefined";a=cdr(a);return new Macro(a,b,c.slice(0))},eval_list=function(a,b){return null===a?null:cons(toy_eval(car(a),b),
eval_list(cdr(a),b))},macro_expand=function(a,b,c){c=a.closure_env.slice(0);var d=a.args;a=a.body;for(var e={};null!==d;){var g=car(d);if("."===g){e[cadr(d)]=b;break}var f=car(b);e[g]=f;d=cdr(d);b=cdr(b)}c.push(e);return eval_begin(a,c)},eval_procedure=function(a,b,c){var d=a.closure_env.slice(0),e=a.args;a=a.body;for(var g={},f=e.arg_val_list,e=e.arg_name_list,h=0;h<e.length;h++){if("."===e[h]){if(null==b){var k=e[h+1];g[k]=f[h+1]}else{var k=e[h+1],l=eval_list(b,c);g[k]=l}break}null==b?g[e[h]]=f[h]:
(k=car(b),k instanceof Cons&&"keyword"===car(k)?(k=cadr(k),k=k.slice(1,k.length-1),b=cdr(b)):k=e[h],l=toy_eval(car(b),c),g[k]=l,b=cdr(b))}d.push(g);return eval_begin(a,d)},eval_begin=function(a,b){for(var c=null;null!==a;)c=toy_eval(car(a),b),a=cdr(a);return c},toy_eval=function(a,b){for(;;){if(null===a)return null;if("string"===typeof a)return'"'===a[0]?a.slice(1,a.length-1):lookup_env(a,b);if(a instanceof Toy_Number||a.TYPE!==LIST)return a;var c=car(a);if("quote"===c){var d=function(a){if(null==
a)return null;var b=car(a);return b instanceof Cons?cons(d(b),d(cdr(a))):"."===b?cadr(a):cons(b,d(cdr(a)))};return cadr(a)instanceof Cons?d(cadr(a)):cadr(a)}if("quasiquote"===c)return c=cadr(a),"string"!==typeof c&&c.TYPE===LIST?eval_quasiquote(c,b):c;if("def"===c){var c=cadr(a),e=caddr(a);if("string"!==typeof c&&c.TYPE===LIST)return toy_eval(make_lambda(c,cddr(a)),b);if("string"!==typeof c)return console.log("ERROR: Invalid variable name : "+primitive_builtin_functions["->str"]([c])),"undefined";
e=toy_eval(e,b);return b[b.length-1][c]=e}if("set!"===c)return c=cadr(a),e=toy_eval(caddr(a),b),eval_set(c,e,b);if("let"===c){var g=cadr(a);if("vector"!==g.car)return console.log("ERROR: please use [] in let when binding variables. Like (let [a 0 b 2] (+ a b))"),"undefined";g=cdr(g);e={};for(b.push(e);null!==g;){var c=car(g),f=toy_eval(car(cdr(g)),b);e[c]=f;g=cddr(g)}c=eval_begin(cddr(a),b);b.pop(e);return c}if("lambda"===c)return eval_lambda(cadr(a),cddr(a),b);if("if"===c)c=cadr(a),e=caddr(a),g=
cadddr(a),c=toy_eval(c,b),a=null==c?g:e;else{if("cond"===c)return eval_cond(cdr(a),b);if("begin"===c)return e=cdr(a),eval_begin(e,b);if("eval"===c)return toy_eval(toy_eval(cadr(a),b),b);if("apply"===c)return toy_eval(cons(toy_eval(cadr(a),b),toy_eval(caddr(a),b)),b);if("function"===typeof c)return c.call(null,function(a,b){for(var c=[];null!==a;)c.push(toy_eval(car(a),b)),a=cdr(a);return c}(cdr(a),b));if("macroexpand-1"===c)return c=toy_eval(cadr(a),b),macro_expand(toy_eval(car(c),b),cdr(c),b);if("defmacro"===
c)return c=eval_macro(caddr(a),cdddr(a),b),b[1][cadr(a)]=c;if("while"===c){c=cadr(a);for(e=cddr(a);toy_eval(c,b);)eval_begin(e,b);return"undefined"}if(c.TYPE===PROCEDURE)return eval_procedure(c,cdr(a),b);if(c.TYPE===MACRO)return toy_eval(macro_expand(c,cdr(a),b),b);if(c instanceof Array)return e=toy_eval(cadr(a),b),!e instanceof Toy_Number?(console.log("ERROR: invalid index"),"undefined"):e>=c.length||0>e?(console.log("ERROR: Index out of boundary"),"undefined"):c[e.numer];if(c instanceof Object)return e=
toy_eval(cadr(a),b),e in c?c[e]:"undefined";c=toy_eval(car(a),b);e=cons(c,cdr(a));return"undefined"===c?(console.log("ERROR:Invalid Function"),"undefined"):toy_eval(e,b)}}},primitive_builtin_functions={"+":function(a){var b=a[0];a=a[1];var c=b instanceof Toy_Number,d=a instanceof Toy_Number;if(c&&d)return b.TYPE===FLOAT||a.TYPE===FLOAT?new Toy_Number(b.numer/b.denom+a.numer/a.denom,1,FLOAT):add_rat(b,a);c&&(b=formatNumber(b));d&&(a=formatNumber(a));return b+a},"-":function(a){var b=a[0];a=a[1];var c=
b instanceof Toy_Number,d=a instanceof Toy_Number;if(c&&d)return b.TYPE===FLOAT||a.TYPE===FLOAT?new Toy_Number(b.numer/b.denom-a.numer/a.denom,1,FLOAT):sub_rat(b,a);c&&(b=formatNumber(b));d&&(a=formatNumber(a));return b-a},"*":function(a){var b=a[0];a=a[1];var c=b instanceof Toy_Number,d=a instanceof Toy_Number;if(c&&d)return b.TYPE===FLOAT||a.TYPE===FLOAT?new Toy_Number(b.numer/b.denom*(a.numer/a.denom),1,FLOAT):mul_rat(b,a);c&&(b=formatNumber(b));d&&(a=formatNumber(a));return b*a},"/":function(a){var b=
a[0];a=a[1];var c=b instanceof Toy_Number,d=a instanceof Toy_Number;if(c&&d)return b.TYPE===FLOAT||a.TYPE===FLOAT?new Toy_Number(b.numer/b.denom/(a.numer/a.denom),1,FLOAT):0===a.numer?(console.log("ERROR: Cannot divide by 0"),"false"):div_rat(b,a);c&&(b=formatNumber(b));d&&(a=formatNumber(a));return b/a},"<":function(a){var b=a[0];a=a[1];var c=a instanceof Toy_Number;b instanceof Toy_Number&&(b=b.numer/b.denom);c&&(a=a.numer/a.denom);return b<a?"true":null},"eq?":function(a){var b=a[0];a=a[1];var c=
a instanceof Toy_Number;b instanceof Toy_Number&&(b=b.numer/b.denom);c&&(a=a.numer/a.denom);return b===a?"true":null},"number?":function(a){return a[0]instanceof Toy_Number?"true":null},"ratio?":function(a){return a[0]instanceof Toy_Number&&a[0].TYPE===RATIO?"true":null},"float?":function(a){return a[0]instanceof Toy_Number&&a[0].TYPE===FLOAT?"true":null},numerator:function(a){if(a[0]instanceof Toy_Number)return new Toy_Number(a[0].numer,1,RATIO);console.log("ERROR:Function numerator wrong type parameters");
return"undefined"},denominator:function(a){if(a[0]instanceof Toy_Number)return new Toy_Number(a[0].denom,1,RATIO);console.log("ERROR:Function numerator wrong type parameters");return"undefined"},"null?":function(a){return null===a[0]?"true":null},cons:function(a){return cons(a[0],a[1])},car:function(a){return car(a[0])},cdr:function(a){return cdr(a[0])},"set-car!":function(a){var b=a[0];a=a[1];if("string"!==typeof b&&b.TYPE===LIST)return b.car=a,b;console.log("ERROR: Function set-car! wrong type parameters");
return"undefined"},"set-cdr!":function(a){var b=a[0];a=a[1];if("string"!==typeof b&&b.TYPE===LIST)return b.cdr=a,b;console.log("ERROR: Function set-car! wrong type parameters");return"undefined"},keyword:function(a){return a[0]},vector:function(a){return a},dictionary:function(a){for(var b={},c=0;c<a.length;c+=2)b[a[c]]=a[c+1];return b},conj:function(a){var b=a[0];a=a[1];if(b.TYPE===LIST)return cons(a,b);if(b instanceof Array)return b=b.slice(0),b.push(a),b;if(b instanceof Object){var b=Object.create(b),
c;for(c in a)b[c]=a[c];return b}},"conj!":function(a){var b=a[0];a=a[1];if(b.TYPE===LIST)return cons(a,b);if(b instanceof Array)return b.push(a),b;if(b instanceof Object){for(var c in a)b[c]=a[c];return b}},assoc:function(a){var b=a[0],c=a[1];a=a[2];if(b instanceof Array)return b=b.slice(0),b[c.numer]=a,b;if(b instanceof Object)return b=Object.create(b),b[c]=a,b;console.log("ERROR...Function assoc wrong type parameters")},"assoc!":function(a){var b=a[0],c=a[1];a=a[2];if(b instanceof Array)return b[c.numer]=
a,b;if(b instanceof Object)return b[c]=a,b;console.log("ERROR...Function assoc wrong type parameters")},pop:function(a){a=a[0];if(a instanceof Array)return a=a.slice(0),a.pop(),a;if(a.TYPE===LIST)return cdr(a);console.log("ERROR...Function pop wrong type parameters")},"pop!":function(a){a=a[0];if(a instanceof Array)return a.pop(),a;console.log("ERROR...Function pop wrong type parameters")},random:function(a){return new Toy_Number(Math.random(),1,FLOAT)},"->ratio":function(a){a=a[0];if(number$(a)){if(a.TYPE===
RATIO)return a;a=a.numer;var b=Math.pow(10,function(a){a=""+a;var b=a.indexOf(".")+1;return a.length-b}(a));return make_rat(a*b,b)}console.log("Function ->ratio --- only support number type data");return"undefined"},"dictionary-keys":function(a){return Object.keys(a[0])},ref:function(a){var b=a[0];a=a[1];if("string"===typeof b)return b[a.numer];if(b.TYPE===LIST){var c=function(a,b){return null===a?null:0===b?car(a):c(cdr(a),b-1)};return c(b,a.numer)}if(b instanceof Array){var d=a.numer;return 0>d||
d>=b.length?(console.log("ERROR: Index out of boundary"),"undefined"):b[a.numer]}if(b instanceof Object)return a in b?b[a]:"undefined";console.log("ERROR:Function ref wrong type parameters")},"->str":function(a){a=a[0];if(number$(a))return formatNumber(a);if("string"===typeof a)return a;if(a instanceof Cons)return formatList(a);if(a instanceof Array)return formatVector(a);if(a.TYPE===PROCEDURE)return"< user-defined-procedure >";if(a.TYPE===BUILTIN_PRIMITIVE_PROCEDURE)return"undefined";if(a instanceof
Object)return formatDictionary(a);console.log("Function display: Invalid Parameters Type");return new ATOM("undefined")},"typeof":function(a){a=a[0];if(null===a)return"null";if("string"===typeof a)return"atom";if(a instanceof Toy_Number)return"number";if(a instanceof Cons)return"list";if(a instanceof Array)return"vector";if(a.TYPE===PROCEDURE||a.TYPE===BUILTIN_PRIMITIVE_PROCEDURE)return"procedure";if(a.TYPE===MACRO)return"macro";if(a instanceof Object)return"dictionary";console.log("ERROR: Cannot judge type");
return"undefined"},len:function(a){a=a[0];if(null===a)return new Toy_Number(0,1,RATIO);if("string"===typeof a)return new Toy_Number(a.length,1,RATIO);if(a.TYPE===LIST){var b=function(a,d){return null===a?d:b(cdr(a),d+1)};return new Toy_Number(b(a,0),1,RATIO)}if(a instanceof Array)return new Toy_Number(a.length,1,RATIO);console.log("ERROR: Function len wrong type parameters");return"undefined"},slice:function(a){var b=a[0],c=a[1];a=a[2];if(!(c instanceof Toy_Number&&a instanceof Toy_Number))return console.log("ERROR: Function slice wrong type parameters"),
"undefined";if(b instanceof Array)return b.slice(c.numer,a.numer);if(b.TYPE===LIST){var d=function(a,b,c,h){return h>=b?h===c?null:cons(car(a),d(cdr(a),b,c,h+1)):d(cdr(a),b,c,h+1)};return d(b,c.numer,a.numer,0)}console.log("ERROR: Function slice wrong type parameters");return"undefined"},display:function(a){a=a[0];if(null===a)return console.log("()"),"undefined";number$(a)?console.log(formatNumber(a)):"string"===typeof a?console.log(a):a instanceof Cons?console.log(formatList(a)):a instanceof Array?
console.log(formatVector(a)):a.TYPE===PROCEDURE?console.log("< user-defined-procedure >"):"function"===typeof a?console.log("< builtin-procedure >"):a.TYPE===MACRO?console.log("< macro >"):a instanceof Object?console.log(formatDictionary(a)):console.log("Function display: Invalid Parameters Type");return"undefined"},acos:function(a){return new Toy_Number(Math.acos(a[0].numer/a[0].denom),1,FLOAT)},acosh:function(a){return new Toy_Number(Math.acosh(a[0].numer/a[0].denom),1,FLOAT)},asin:function(a){return new Toy_Number(Math.asin(a[0].numer/
a[0].denom),1,FLOAT)},asinh:function(a){return new Toy_Number(Math.asinh(a[0].numer/a[0].denom),1,FLOAT)},atan:function(a){return new Toy_Number(Math.atan(a[0].numer/a[0].denom),1,FLOAT)},atanh:function(a){return new Toy_Number(Math.atanh(a[0].numer/a[0].denom),1,FLOAT)},ceil:function(a){return new Toy_Number(Math.ceil(a[0].numer/a[0].denom),1,RATIO)},cos:function(a){return new Toy_Number(Math.cos(a[0].numer/a[0].denom),1,FLOAT)},cosh:function(a){return new Toy_Number(Math.cosh(a[0].numer/a[0].denom),
1,FLOAT)},exp:function(a){return new Toy_Number(Math.exp(a[0].numer/a[0].denom),1,FLOAT)},floor:function(a){return new Toy_Number(Math.floor(a[0].numer/a[0].denom),1,RATIO)},loge:function(a){return new Toy_Number(Math.log(a[0].numer/a[0].denom),1,FLOAT)},pow:function(a){return a[0].TYPE===RATIO&&a[1].TYPE===RATIO&&1===a[1].denom?new Toy_Number(Math.pow(a[0].numer,a[1].numer),Math.pow(a[0].denom,a[1].numer),RATIO):new Toy_Number(Math.pow(a[0].numer/a[0].denom,a[1].numer/a[1].denom),1,FLOAT)},sin:function(a){return new Toy_Number(Math.sin(a[0].numer/
a[0].denom),1,FLOAT)},sinh:function(a){return new Toy_Number(Math.sinh(a[0].numer/a[0].denom),1,FLOAT)},tan:function(a){return new Toy_Number(Math.tan(a[0].numer/a[0].denom),1,FLOAT)},tanh:function(a){return new Toy_Number(Math.tanh(a[0].numer/a[0].denom),1,FLOAT)},"true":"true","false":null,def:"def","set!":"set!",cond:"cond","if":"if",quote:"quote",quasiquote:"quasiquote",lambda:"lambda",defmacro:"defmacro","while":"while"},create_new_environment=function(){return[primitive_builtin_functions,{}]},
ENVIRONMENT=create_new_environment();"undefined"!=typeof module&&(module.exports.lexer=lexer,module.exports.parser=parser,module.exports.eval_begin=eval_begin,module.exports.display=function(a){primitive_builtin_functions.display([a])},module.exports.env=ENVIRONMENT);var RUN_FIRST='(def (list . args) args) (def o_+ +) (def (+ . args) (def (+_iter result args) (cond ((null? args) result) (else (+_iter (o_+ result (car args)) (cdr args))))) (cond ((null? args) (display "ERROR: Function + invalid parameters. Please provide parameters")) (else (+_iter (car args) (cdr args))))) (def o_- -) (def (- . args) (def (-_iter result args) (cond ((null? args) result) (else (-_iter (o_- result (car args)) (cdr args))))) (cond ((null? args) (display "ERROR: Function - invalid parameters. Please provide parameters")) ((null? (cdr args)) (o_- 0 (car args))) (else (-_iter (car args) (cdr args))))) (def o_* *) (def (* . args) (def (*_iter result args) (cond ((null? args) result) (else (*_iter (o_* (car args) result) (cdr args))))) (cond ((null? args) (display "ERROR: Function * invalid parameters. Please provide parameters")) (else (*_iter (car args) (cdr args))))) (def o_/ /) (def (/ . args) (def length (len args)) (def (/_iter result args) (cond ((null? args) result) (else (/_iter (o_/ result (car args)) (cdr args))))) (cond ((null? args) (display "ERROR: Function / invalid parameters. Please provide parameters")) ((null? (cdr args)) (o_/ 1 (car args))) (else (/_iter (car args) (cdr args))))) (def #t "true") (def #f ()) (def nil ()) (def (factorial n) (if (eq? n 0) 1 (* n (factorial (- n 1))))) (def (factorial n) (def (factorial-acc n acc) (if (eq? n 0) acc (factorial-acc (- n 1) (* acc n)))) (factorial-acc n 1)) (defmacro and (vector arg0 arg1) (quasiquote (if (unquote arg0) (if (unquote arg1) true false) false))) (defmacro or (vector arg0 arg1) (quasiquote (if (unquote arg0) true (if (unquote arg1) true false)))) (def (> arg0 arg1) (< arg1 arg0)) (def (<= arg0 arg1) (or (< arg0 arg1) (eq? arg0 arg1))) (def (>= arg0 arg1) (or (> arg0 arg1) (eq? arg0 arg1))) (def old-< <) (def (< . args) (let (vector <-iter (lambda (vector args cur) (if (null? args) true (if (old-< cur (car args)) (<-iter (cdr args) (car args)) false)))) (if (null? args) (display "Please provide arguments for <") (<-iter (cdr args) (car args))))) (def old-> >) (def (> . args) (let (vector >-iter (lambda (vector args cur) (if (null? args) true (if (old-> cur (car args)) (>-iter (cdr args) (car args)) false)))) (if (null? args) (display "Please provide arguments for >") (>-iter (cdr args) (car args))))) (def old-eq? eq?) (def (eq? . args) (let (vector eq?-iter (lambda (vector args cur) (if (null? args) true (if (old-eq? cur (car args)) (eq?-iter (cdr args) (car args)) false)))) (if (null? args) (display "Please provide arguments for eq?") (eq?-iter (cdr args) (car args))))) (def old-<= <=) (def (<= . args) (let (vector <=-iter (lambda (vector args cur) (if (null? args) true (if (old-<= cur (car args)) (<=-iter (cdr args) (car args)) false)))) (if (null? args) (display "Please provide arguments for <=") (<=-iter (cdr args) (car args))))) (def old->= >=) (def (>= . args) (let (vector >=-iter (lambda (vector args cur) (if (null? args) true (if (old->= cur (car args)) (>=-iter (cdr args) (car args)) false)))) (if (null? args) (display "Please provide arguments for >=") (>=-iter (cdr args) (car args))))) (def (and . args) (def (and-iter args) (if (null? args) true (if (car args) (and-iter (cdr args)) false))) (and-iter args)) (def (or . args) (def (or-iter args) (if (null? args) false (if (car args) true (or-iter (cdr args))))) (or-iter args)) (def (not arg0) (if arg0 false true)) (def (pair? arg) (eq? (typeof arg) (quote list))) (def (list? arg) pair?) (def (integer? arg) (and (ratio? arg) (eq? (denominator arg) 1))) (def (atom? arg) (eq? (typeof arg) (quote atom))) (def (string? arg) atom?) (def (vector? arg) (eq? (typeof arg) (quote vector))) (def (dictionary? arg) (eq? (typeof arg) (quote dictionary))) (def (undefined? arg) (eq? arg (quote undefined))) (def (procedure? arg) (eq? (typeof arg) (quote procedure))) (def (function? arg) procedure?) (def (macro? arg) (eq? (typeof arg) (quote macro))) (def ** pow) (def ^ pow) (def (log x y) (/ (loge y) (loge x))) (def (sec x) (/ 1 (cos x))) (def (csc x) (/ 1 (sin x))) (def (cot x) (/ 1 (tan x)))';
eval_begin(parser(lexer(RUN_FIRST)),ENVIRONMENT);