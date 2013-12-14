var LIST=2,MACRO=4,PROCEDURE=6,BUILTIN_PRIMITIVE_PROCEDURE=8,RATIO=10,FLOAT=12,Cons=function(a,b){this.car=a;this.cdr=b;this.set_car=function(a){this.car=a};this.set_cdr=function(a){this.cdr=a};this.TYPE=LIST},Procedure=function(a,b,c){this.args=a;this.body=b;this.closure_env=c;this.TYPE=PROCEDURE},Macro=function(a,b,c){this.args=a;this.body=b;this.closure_env=c;this.TYPE=MACRO},Builtin_Primitive_Procedure=function(a){this.func=a;this.TYPE=BUILTIN_PRIMITIVE_PROCEDURE},Toy_Number=function(a,b,c){this.TYPE=
c;this.numer=a;this.denom=b},cons=function(a,b){return new Cons(a,b)},build_nil=function(){return null};function isNumber(a){return!isNaN(parseFloat(a))&&isFinite(a)}
var isInteger=function(a){if(0==a.length)return!1;"-"==a[0]&&(a=a.slice(1));return"0"===a||/^[1-9][0-9]*$/.test(a)},isFloat=function(a){return isNumber(a)&&!isInteger(a)},isRatio=function(a){if("string"!==typeof a)return!1;var b=a.indexOf("/");if(-1===b)return!1;var c=a.slice(0,b),b=a.slice(b+1);return isInteger(c)&&isInteger(b)?(0===parseInt(b)&&console.log("Invalid ratio --- "+a+" with denominator 0"),!0):!1},number$=function(a){return a instanceof Toy_Number},getNumerator=function(a){return a.slice(0,
a.indexOf("/"))},getDenominator=function(a){return a.slice(a.indexOf("/")+1)},car=function(a){return null===a?(console.log("ERROR: Cannot get car of ()"),null):a.car},cdr=function(a){return a.cdr},caar=function(a){return car(car(a))},cadr=function(a){return car(cdr(a))},cddr=function(a){return cdr(cdr(a))},cdddr=function(a){return cdr(cdr(cdr(a)))},caddr=function(a){return car(cdr(cdr(a)))},cadddr=function(a){return car(cdr(cdr(cdr(a))))},cadar=function(a){return car(cdr(car(a)))},lexer=function(a){var b=
function(a,c){return c==a.length?c:"\n"==a[c]?c+1:b(a,c+1)},c=function(a,b){return b==a.length?(console.log("ERROR: Incomplete String"),b):"\\"==a[b]?c(a,b+2):'"'===a[b]?b+1:c(a,b+1)},d=function(a,b){return b==a.length?b:"("==a[b]||")"==a[b]||"["==a[b]||"]"==a[b]||"{"==a[b]||"}"==a[b]||" "==a[b]||"\t"==a[b]||"\n"==a[b]||";"==a[b]||","==a[b]?b:d(a,b+1)},e=function(a,f){if(f>=a.length)return null;if(" "===a[f]||"\n"==a[f]||"\t"==a[f]||","===a[f])return e(a,f+1);if("("===a[f])return cons("(",e(a,f+1));
if("["===a[f])return cons("(",cons("vector",e(a,f+1)));if("{"===a[f])return cons("(",cons("dictionary",e(a,f+1)));if(")"===a[f]||"]"==a[f]||"}"==a[f])return cons(")",e(a,f+1));if("~"===a[f]&&"@"===a[f+1])return cons("~@",e(a,f+2));if("'"===a[f]||"`"==a[f]||"~"==a[f])return cons(a[f],e(a,f+1));if('"'===a[f]){var h=c(a,f+1);return cons(a.slice(f,h),e(a,h))}if(";"===a[f])return e(a,b(a,f+1));h=d(a,f+1);return cons(a.slice(f,h),e(a,h))};return e(a,0)},parser=function(a){var b=a,c=function(a){return null===
a?(console.log("ERROR: Incomplete Statement. Missing )"),b=null):")"===car(a)?(b=cdr(a),build_nil()):"("===car(a)?cons(c(cdr(a)),c(b)):"'"===car(a)||"~"===car(a)||"`"===car(a)||"~@"===car(a)?cons(d(a),c(b)):cons(e(car(a)),c(cdr(a)))},d=function(a){var f;f="'"===car(a)?"quote":"~"===car(a)?"unquote":"~@"===car(a)?"unquote-splice":"quasiquote";a=cdr(a);if("("===car(a))return cons(f,cons(c(cdr(a)),build_nil()));if("'"===car(a)||"~"===car(a)||"`"===car(a))return cons(f,cons(d(a),build_nil()));b=cdr(a);
return cons(f,cons(e(car(a)),build_nil()))},e=function(a){return isNumber(a)?isInteger(a)?new Toy_Number(parseFloat(a),1,RATIO):new Toy_Number(parseFloat(a),1,FLOAT):isRatio(a)?new Toy_Number(parseFloat(getNumerator(a)),parseFloat(getDenominator(a)),RATIO):a};return null==a?build_nil():"("===car(a)?cons(c(cdr(a)),parser(b)):"'"===car(a)||"~"===car(a)||"`"===car(a)||"~@"===car(a)?cons(d(a),b):cons(e(car(a)),parser(cdr(a)))},gcd=function(a,b){for(;0!=b;){var c=a;a=b;b=c%b}return a},numer=function(a){return a.numer},
denom=function(a){return a.denom},make_rat=function(a,b){var c=gcd(a,b);return new Toy_Number(a/c,b/c,RATIO)},number_to_string=function(a){return a.TYPE===FLOAT||1===a.denom?""+a.numer:a.numer+"/"+a.denom},add_rat=function(a,b){return make_rat(numer(a)*denom(b)+numer(b)*denom(a),denom(a)*denom(b))},sub_rat=function(a,b){return make_rat(numer(a)*denom(b)-numer(b)*denom(a),denom(a)*denom(b))},mul_rat=function(a,b){return make_rat(numer(a)*numer(b),denom(a)*denom(b))},div_rat=function(a,b){return make_rat(numer(a)*
denom(b),denom(a)*numer(b))},formatNumber=function(a){return a.TYPE===FLOAT?""+a.numer.toFixed(10):1===a.denom?""+a.numer:a.numer+"/"+a.denom},formatList=function(a){if(null===a)return"()";for(var b="(";;){if(null===a){b=b.slice(0,b.length-1)+")";break}if(!(a instanceof Cons)){var c=a,b=b+". ";null===c?b+="())":number$(c)?b=b+formatNumber(c)+")":"string"===typeof c?b=b+c+")":c instanceof Cons?b=b+formatList(c)+")":c instanceof Array?b=b+formatVector(c)+")":c.TYPE===PROCEDURE?b+="< user-defined-procedure >)":
"function"===typeof c?b+="< builtin-primitive-procedure >)":c.TYPE===MACRO?b+="< macro >":c instanceof Object&&(b=b+formatDictionary(c)+")");break}c=a.car;null===c?b+="() ":number$(c)?b=b+formatNumber(c)+" ":"string"===typeof c?b=b+c+" ":c instanceof Cons?b=b+formatList(c)+" ":c instanceof Array?b=b+formatVector(c)+" ":"function"===typeof c?b+="< builtin-procedure > ":c.TYPE===PROCEDURE?b+="< user-defined-procedure > ":c.TYPE===MACRO?b+="< macro > ":c instanceof Object&&(b=b+formatDictionary(c)+" ");
a=a.cdr}return b},formatVector=function(a){for(var b="[",c=0;c<a.length;c++){var d=a[c];null===d?b+="() ":number$(d)?b=b+formatNumber(d)+" ":"string"===typeof d?b=b+d+" ":d instanceof Cons?b=b+formatList(d)+" ":d instanceof Array?b=b+formatVector(d)+" ":d.TYPE===PROCEDURE?b+="< user-defined-procedure > ":"function"===typeof d?b+="< builtin-procedure > ":d.TYPE===MACRO?b+="< macro > ":d instanceof Object&&(b=b+formatDictionary(d)+" ")}return b=b.slice(0,b.length-1)+"]"},formatDictionary=function(a){var b=
"{",c;for(c in a){var b=b+c+" ",d=a[c];null===d?b+="(), ":number$(d)?b=b+formatNumber(d)+", ":"string"===typeof d?b=b+d+", ":d instanceof Cons?b=b+formatList(d)+", ":d instanceof Array?b=b+formatVector(d)+",":d.TYPE===PROCEDURE?b+="< user-defined-procedure >, ":"function"===typeof d?b+="< builtin-procedure >, ":d.TYPE===MACRO?b+="< macro > ":d instanceof Object&&(b=b+formatDictionary(d)+", ")}return b=b.slice(0,b.length-1)+"}"},to_string=function(a){if(number$(a))return formatNumber(a);if("string"===
typeof a)return a;if(a instanceof Cons)return formatList(a);if(a instanceof Array)return formatVector(a);if(a.TYPE===PROCEDURE)return"< user-defined-procedure >";if(a.TYPE===BUILTIN_PRIMITIVE_PROCEDURE)return"undefined";if(a instanceof Object)return formatDictionary(a);console.log("Function display: Invalid Parameters Type");return"undefined"},lookup_env=function(a,b){for(var c=b.length-1;0<=c;c--)if(a in b[c])return b[c][a];console.log("ERROR: unbound variable: "+a);return"undefined"},make_lambda=
function(a,b){var c=car(a),d=cons("vector",cdr(a)),d=cons("lambda",cons(d,b));return cons("def",cons(c,cons(d,build_nil())))},eval_set=function(a,b,c){for(var d=c.length-1;0<=d;d--)if(a in c[d])return c[d][a]=b;console.log("ERROR:Function set!, var name "+a+" does not exist");return"undefined"},eval_quasiquote=function(a,b){if(null===a)return null;var c=car(a);if("string"===typeof c){if("."===c)return c=cadr(a),"string"===typeof c?c:"unquote"===car(c)?toy_eval(cadr(c),b):eval_quasiquote(c,b)}else if(c.TYPE===
LIST){if("unquote"===car(c))return cons(toy_eval(cadr(c),b),eval_quasiquote(cdr(a),b));if("unquote-splice"===car(c)){var d=function(a,b){return null==a?b:cons(car(a),d(cdr(a),b))},c=toy_eval(cadr(c),b);return c instanceof Cons?d(c,eval_quasiquote(cdr(a),b)):(console.log("ERROR: ~@ only support list type value"),null)}return cons(eval_quasiquote(c,b),eval_quasiquote(cdr(a),b))}return cons(c,eval_quasiquote(cdr(a),b))},eval_lambda=function(a,b,c){if("vector"!==a.car)return console.log("ERROR: when defining lambda, please use (lambda [args] body) format"),
"undefined";a=cdr(a);for(var d={arg_name_list:[],arg_val_list:[],inside_lambdas:{}};null!=a;){var e=car(a);if("string"===typeof e)if(":"===e[0]){e=e.slice(1);a=cdr(a);var g=toy_eval(car(a),c);d.arg_name_list.push(e);d.arg_val_list.push(g)}else if("."===e){d.arg_name_list.push(".");d.arg_val_list.push("undefined");a=cdr(a);e=car(a);":"==e[0]?(e=e.slice(1),a=cdr(a),g=toy_eval(car(a),c),d.arg_name_list.push(e),d.arg_val_list.push(g)):(d.arg_name_list.push(e),d.arg_val_list.push(null));break}else d.arg_name_list.push(e),
d.arg_val_list.push("undefined");else return console.log("ERROR: Function definition error."),"undefined";a=cdr(a)}return new Procedure(d,b,c.slice(0))},eval_macro=function(a,b,c){if("vector"!==a.car)return console.log("ERROR: when defining macro_args, please use (defmacro macro_name [args] body) format"),"undefined";a=cdr(a);return new Macro(a,b,c.slice(0))},eval_list=function(a,b){return null===a?null:cons(toy_eval(car(a),b),eval_list(cdr(a),b))},macro_expand=function(a,b,c){var d=function(a,b,
c){for(;null!==b;){if(null===c){console.log("ERROR: Invalid macro. Pattern doesn't match");break}var e=car(b);if(e instanceof Cons)"vector"===b.car.car?d(a,b.car.cdr,c.car.cdr):d(a,b.car,c.car);else if("."===e){a[cadr(b)]=c;break}else{var g=car(c);a[e]=g}b=cdr(b);c=cdr(c)}};c=a.closure_env.slice(0);var e=a.body,g={};d(g,a.args,b);c.push(g);return eval_begin(e,c)},eval_begin=function(a,b){for(var c=null;null!==a;)c=toy_eval(car(a),b),a=cdr(a);return c},toy_eval=function(a,b){for(;;){if(null===a)return null;
if("string"===typeof a)return'"'===a[0]?a.slice(1,a.length-1):":"===a[0]?a.slice(1):lookup_env(a,b);if(a instanceof Toy_Number||a.TYPE!==LIST)return a;var c=car(a);if("quote"===c){var d=function(a){if(null==a)return null;var b=car(a);return b instanceof Cons?cons(d(b),d(cdr(a))):"."===b?cadr(a):cons(b,d(cdr(a)))};return cadr(a)instanceof Cons?d(cadr(a)):cadr(a)}if("quasiquote"===c)return c=cadr(a),"string"!==typeof c&&c.TYPE===LIST?eval_quasiquote(c,b):c;if("def"===c){var e=cadr(a),c=caddr(a);if("string"!==
typeof e&&e.TYPE===LIST)return toy_eval(make_lambda(e,cddr(a)),b);if("string"!==typeof e)return console.log("ERROR: Invalid variable name : "+primitive_builtin_functions["->str"]([e])),"undefined";c=toy_eval(c,b);return b[b.length-1][e]=c}if("set!"===c)return e=cadr(a),c=toy_eval(caddr(a),b),eval_set(e,c,b);if("let"===c){var g=cadr(a);if("vector"!==g.car)return console.log("ERROR: please use [] in let when binding variables. Like (let [a 0 b 2] (+ a b))"),"undefined";g=cdr(g);c={};for(b.push(c);null!==
g;){var e=car(g),f=toy_eval(car(cdr(g)),b);c[e]=f;g=cddr(g)}e=eval_begin(cddr(a),b);b.pop(c);return e}if("lambda"===c)return eval_lambda(cadr(a),cddr(a),b);if("if"===c)c=cadr(a),e=caddr(a),g=cadddr(a),c=toy_eval(c,b),a=null==c?g:e;else if("cond"===c){c=cdr(a);for(g=null;null!==c;){e=car(c);f=car(e);e=cdr(e);if("else"==f||null!==toy_eval(f,b)){g=e;break}c=cdr(c)}a=cons("begin",g)}else if("begin"===c){e=cdr(a);if(null==e)return"undefined";for(;null!==e.cdr;)toy_eval(car(e),b),e=e.cdr;a=e.car}else{if("eval"===
c)return toy_eval(toy_eval(cadr(a),b),b);if("apply"===c)return toy_eval(cons(toy_eval(cadr(a),b),toy_eval(caddr(a),b)),b);if("function"===typeof c)return c.call(null,function(a,b){for(var c=[];null!==a;)c.push(toy_eval(car(a),b)),a=cdr(a);return c}(cdr(a),b));if("macroexpand-1"===c)return c=toy_eval(cadr(a),b),macro_expand(toy_eval(car(c),b),cdr(c),b);if("defmacro"===c)return c=eval_macro(caddr(a),cdddr(a),b),b[1][cadr(a)]=c;if("while"===c){c=cadr(a);for(e=cddr(a);toy_eval(c,b);)eval_begin(e,b);return"undefined"}if(c.TYPE===
PROCEDURE){for(var g=cdr(a),f=c.closure_env.slice(0),h=c.args,e=c.body,c={},n=h.arg_val_list,h=h.arg_name_list,k=0;k<h.length;k++){if("."===h[k]){if(null==g){var l=h[k+1];c[l]=n[k+1]}else{var l=h[k+1],m=eval_list(g,b);c[l]=m}break}null==g?h[k]in c||(c[h[k]]=n[k]):(l=car(g),"string"===typeof l&&":"===l[0]?(l=l.slice(1),g=cdr(g),m=toy_eval(car(g),b),c[l]=m,l===h[k]||h[k]in c||(c[h[k]]=n[k])):(l=h[k],m=toy_eval(car(g),b),c[l]=m),g=cdr(g))}f.push(c);a=cons("begin",e);b=f}else{if(c.TYPE===MACRO)return toy_eval(macro_expand(c,
cdr(a),b),b);if(c instanceof Array)return e=toy_eval(cadr(a),b),!e instanceof Toy_Number?(console.log("ERROR: invalid index"),"undefined"):e>=c.length||0>e?(console.log("ERROR: Index out of boundary"),"undefined"):c[e.numer];if(c instanceof Object&&!(c instanceof Toy_Number||c instanceof Cons))return e=toy_eval(cadr(a),b),e in c?c[e]:"undefined";c=toy_eval(car(a),b);e=cons(c,cdr(a));if("undefined"===c||c instanceof Toy_Number)return console.log("ERROR:Invalid Function "+(c instanceof Toy_Number?formatNumber(c):
c)),console.log("      WITH EXP: "+to_string(a)),"undefined";a=e}}}},primitive_builtin_functions={"+":function(a){var b=a[0];a=a[1];var c=b instanceof Toy_Number,d=a instanceof Toy_Number;if(c&&d)return b.TYPE===FLOAT||a.TYPE===FLOAT?new Toy_Number(b.numer/b.denom+a.numer/a.denom,1,FLOAT):add_rat(b,a);c&&(b=formatNumber(b));d&&(a=formatNumber(a));return b+a},"-":function(a){var b=a[0];a=a[1];var c=b instanceof Toy_Number,d=a instanceof Toy_Number;if(c&&d)return b.TYPE===FLOAT||a.TYPE===FLOAT?new Toy_Number(b.numer/
b.denom-a.numer/a.denom,1,FLOAT):sub_rat(b,a);c&&(b=formatNumber(b));d&&(a=formatNumber(a));return b-a},"*":function(a){var b=a[0];a=a[1];var c=b instanceof Toy_Number,d=a instanceof Toy_Number;if(c&&d)return b.TYPE===FLOAT||a.TYPE===FLOAT?new Toy_Number(b.numer/b.denom*(a.numer/a.denom),1,FLOAT):mul_rat(b,a);c&&(b=formatNumber(b));d&&(a=formatNumber(a));return b*a},"/":function(a){var b=a[0];a=a[1];var c=b instanceof Toy_Number,d=a instanceof Toy_Number;if(c&&d)return b.TYPE===FLOAT||a.TYPE===FLOAT?
new Toy_Number(b.numer/b.denom/(a.numer/a.denom),1,FLOAT):0===a.numer?(console.log("ERROR: Cannot divide by 0"),"false"):div_rat(b,a);c&&(b=formatNumber(b));d&&(a=formatNumber(a));return b/a},"<":function(a){var b=a[0];a=a[1];var c=a instanceof Toy_Number;b instanceof Toy_Number&&(b=b.numer/b.denom);c&&(a=a.numer/a.denom);return b<a?"true":null},"eq?":function(a){var b=a[0];a=a[1];var c=a instanceof Toy_Number;b instanceof Toy_Number&&(b=b.numer/b.denom);c&&(a=a.numer/a.denom);return b===a?"true":
null},"number?":function(a){return a[0]instanceof Toy_Number?"true":null},"ratio?":function(a){return a[0]instanceof Toy_Number&&a[0].TYPE===RATIO&&1!==a[0].denom?"true":null},"float?":function(a){return a[0]instanceof Toy_Number&&a[0].TYPE===FLOAT?"true":null},"integer?":function(a){return a[0]instanceof Toy_Number&&a[0].TYPE===RATIO&&1==a[0].denom?"true":null},numerator:function(a){if(a[0]instanceof Toy_Number)return new Toy_Number(a[0].numer,1,RATIO);console.log("ERROR:Function numerator wrong type parameters");
return"undefined"},denominator:function(a){if(a[0]instanceof Toy_Number)return new Toy_Number(a[0].denom,1,RATIO);console.log("ERROR:Function numerator wrong type parameters");return"undefined"},"null?":function(a){return null===a[0]?"true":null},cons:function(a){return cons(a[0],a[1])},car:function(a){return car(a[0])},cdr:function(a){return cdr(a[0])},"set-car!":function(a){var b=a[0];a=a[1];if("string"!==typeof b&&b.TYPE===LIST)return b.car=a,b;console.log("ERROR: Function set-car! wrong type parameters");
return"undefined"},"set-cdr!":function(a){var b=a[0];a=a[1];if("string"!==typeof b&&b.TYPE===LIST)return b.cdr=a,b;console.log("ERROR: Function set-car! wrong type parameters");return"undefined"},vector:function(a){return a},dictionary:function(a){for(var b={},c=0;c<a.length;c+=2)b[a[c]]=a[c+1];return b},conj:function(a){var b=a[0];a=a[1];if(b.TYPE===LIST)return cons(a,b);if(b instanceof Array)return b=b.slice(0),b.push(a),b;if(b instanceof Object){var b=Object.create(b),c;for(c in a)b[c]=a[c];return b}},
"conj!":function(a){var b=a[0];a=a[1];if(b.TYPE===LIST)return cons(a,b);if(b instanceof Array)return b.push(a),b;if(b instanceof Object){for(var c in a)b[c]=a[c];return b}},assoc:function(a){var b=a[0],c=a[1];a=a[2];if(b instanceof Array)return b=b.slice(0),b[c.numer]=a,b;if(b instanceof Object)return b=Object.create(b),b[c]=a,b;console.log("ERROR...Function assoc wrong type parameters")},"assoc!":function(a){var b=a[0],c=a[1];a=a[2];if(b instanceof Array)return b[c.numer]=a,b;if(b instanceof Object)return b[c]=
a,b;console.log("ERROR...Function assoc wrong type parameters")},pop:function(a){a=a[0];if(a instanceof Array)return a=a.slice(0),a.pop(),a;if(a.TYPE===LIST)return cdr(a);console.log("ERROR...Function pop wrong type parameters")},"pop!":function(a){a=a[0];if(a instanceof Array)return a.pop(),a;console.log("ERROR...Function pop wrong type parameters")},random:function(a){return new Toy_Number(Math.random(),1,FLOAT)},"->ratio":function(a){a=a[0];if(number$(a)){if(a.TYPE===RATIO)return a;a=a.numer;var b=
Math.pow(10,function(a){a=""+a;var b=a.indexOf(".")+1;return a.length-b}(a));return make_rat(a*b,b)}console.log("Function ->ratio --- only support number type data");return"undefined"},"dictionary-keys":function(a){return Object.keys(a[0])},ref:function(a){var b=a[0];a=a[1];if("string"===typeof b)return b[a.numer];if(b.TYPE===LIST){var c=function(a,b){return null===a?null:0===b?car(a):c(cdr(a),b-1)};return c(b,a.numer)}if(b instanceof Array){var d=a.numer;return 0>d||d>=b.length?(console.log("ERROR: Index out of boundary"),
"undefined"):b[a.numer]}if(b instanceof Object)return a in b?b[a]:"undefined";console.log("ERROR:Function ref wrong type parameters")},"->str":function(a){return to_string(a[0])},"typeof":function(a){a=a[0];if(null===a)return"null";if("string"===typeof a)return"atom";if(a instanceof Toy_Number)return"number";if(a instanceof Cons)return"list";if(a instanceof Array)return"vector";if(a.TYPE===PROCEDURE||a.TYPE===BUILTIN_PRIMITIVE_PROCEDURE)return"procedure";if(a.TYPE===MACRO)return"macro";if(a instanceof
Object)return"dictionary";console.log("ERROR: Cannot judge type");return"undefined"},len:function(a){a=a[0];if(null===a)return new Toy_Number(0,1,RATIO);if("string"===typeof a)return new Toy_Number(a.length,1,RATIO);if(a.TYPE===LIST){var b=function(a,d){return null===a?d:b(cdr(a),d+1)};return new Toy_Number(b(a,0),1,RATIO)}if(a instanceof Array)return new Toy_Number(a.length,1,RATIO);console.log("ERROR: Function len wrong type parameters");return"undefined"},slice:function(a){var b=a[0],c=a[1];a=
a[2];if(!(c instanceof Toy_Number&&a instanceof Toy_Number))return console.log("ERROR: Function slice wrong type parameters"),"undefined";if(b instanceof Array)return b.slice(c.numer,a.numer);if(b.TYPE===LIST){var d=function(a,b,c,h){return h>=b?h===c?null:cons(car(a),d(cdr(a),b,c,h+1)):d(cdr(a),b,c,h+1)};return d(b,c.numer,a.numer,0)}if("string"===typeof b)return b.slice(c.numer,a.numer);console.log("ERROR: Function slice wrong type parameters");return"undefined"},display:function(a){try{var b=a[0];
if(null===b)return console.log("()"),"undefined";number$(b)?console.log(formatNumber(b)):"string"===typeof b?console.log(b):b instanceof Cons?console.log(formatList(b)):b instanceof Array?console.log(formatVector(b)):b.TYPE===PROCEDURE?console.log("< user-defined-procedure >"):"function"===typeof b?console.log("< builtin-procedure >"):b.TYPE===MACRO?console.log("< macro >"):b instanceof Object?console.log(formatDictionary(b)):console.log("Function display: Invalid Parameters Type");return"undefined"}catch(c){return console.log(c),
"undefined"}},acos:function(a){return new Toy_Number(Math.acos(a[0].numer/a[0].denom),1,FLOAT)},acosh:function(a){return new Toy_Number(Math.acosh(a[0].numer/a[0].denom),1,FLOAT)},asin:function(a){return new Toy_Number(Math.asin(a[0].numer/a[0].denom),1,FLOAT)},asinh:function(a){return new Toy_Number(Math.asinh(a[0].numer/a[0].denom),1,FLOAT)},atan:function(a){return new Toy_Number(Math.atan(a[0].numer/a[0].denom),1,FLOAT)},atanh:function(a){return new Toy_Number(Math.atanh(a[0].numer/a[0].denom),
1,FLOAT)},ceil:function(a){return new Toy_Number(Math.ceil(a[0].numer/a[0].denom),1,RATIO)},cos:function(a){return new Toy_Number(Math.cos(a[0].numer/a[0].denom),1,FLOAT)},cosh:function(a){return new Toy_Number(Math.cosh(a[0].numer/a[0].denom),1,FLOAT)},exp:function(a){return new Toy_Number(Math.exp(a[0].numer/a[0].denom),1,FLOAT)},floor:function(a){return new Toy_Number(Math.floor(a[0].numer/a[0].denom),1,RATIO)},loge:function(a){return new Toy_Number(Math.log(a[0].numer/a[0].denom),1,FLOAT)},pow:function(a){return a[0].TYPE===
RATIO&&a[1].TYPE===RATIO&&1===a[1].denom?new Toy_Number(Math.pow(a[0].numer,a[1].numer),Math.pow(a[0].denom,a[1].numer),RATIO):new Toy_Number(Math.pow(a[0].numer/a[0].denom,a[1].numer/a[1].denom),1,FLOAT)},sin:function(a){return new Toy_Number(Math.sin(a[0].numer/a[0].denom),1,FLOAT)},sinh:function(a){return new Toy_Number(Math.sinh(a[0].numer/a[0].denom),1,FLOAT)},tan:function(a){return new Toy_Number(Math.tan(a[0].numer/a[0].denom),1,FLOAT)},tanh:function(a){return new Toy_Number(Math.tanh(a[0].numer/
a[0].denom),1,FLOAT)},js:function(a){var b=a[0];a=a.slice(1);for(var c=0;c<a.length;c++)a[c]instanceof Toy_Number&&(a[c]=a[c].numer/a[c].denom);b=eval(b).apply(null,a);return isNumber(b)?new Toy_Number(b,1,FLOAT):"boolean"===typeof b?!0===b?"true":null:"undefined"===typeof b?"undefined":b},read:function(a){return a[0]instanceof Cons?cons(a[0],null):parser(lexer(a[0]))},"true":"true","false":null,def:"def","set!":"set!",cond:"cond","if":"if",quote:"quote",quasiquote:"quasiquote",lambda:"lambda",defmacro:"defmacro",
"while":"while",virtual_file_system:{}},create_new_environment=function(){return[primitive_builtin_functions,{}]},ENVIRONMENT=create_new_environment();"undefined"!=typeof module&&(module.exports.lexer=lexer,module.exports.parser=parser,module.exports.eval_begin=eval_begin,module.exports.display=function(a){primitive_builtin_functions.display([a])},module.exports.env=ENVIRONMENT);var RUN_FIRST='(def (list . args) args) (def o_+ +) (def (+ . args) (def (+_iter result args) (cond ((null? args) result) (else (+_iter (o_+ result (car args)) (cdr args))))) (cond ((null? args) (display "ERROR: Function + invalid parameters. Please provide parameters")) (else (+_iter (car args) (cdr args))))) (def o_- -) (def (- . args) (def (-_iter result args) (cond ((null? args) result) (else (-_iter (o_- result (car args)) (cdr args))))) (cond ((null? args) (display "ERROR: Function - invalid parameters. Please provide parameters")) ((null? (cdr args)) (o_- 0 (car args))) (else (-_iter (car args) (cdr args))))) (def o_* *) (def (* . args) (def (*_iter result args) (cond ((null? args) result) (else (*_iter (o_* (car args) result) (cdr args))))) (cond ((null? args) (display "ERROR: Function * invalid parameters. Please provide parameters")) (else (*_iter (car args) (cdr args))))) (def o_/ /) (def (/ . args) (def length (len args)) (def (/_iter result args) (cond ((null? args) result) (else (/_iter (o_/ result (car args)) (cdr args))))) (cond ((null? args) (display "ERROR: Function / invalid parameters. Please provide parameters")) ((null? (cdr args)) (o_/ 1 (car args))) (else (/_iter (car args) (cdr args))))) (def #t "true") (def #f ()) (def nil ()) (def (factorial n) (if (eq? n 0) 1 (* n (factorial (- n 1))))) (def (factorial n) (def (factorial-acc n acc) (if (eq? n 0) acc (factorial-acc (- n 1) (* acc n)))) (factorial-acc n 1)) (defmacro and (vector arg0 arg1) (quasiquote (if (unquote arg0) (if (unquote arg1) true false) false))) (defmacro or (vector arg0 arg1) (quasiquote (if (unquote arg0) true (if (unquote arg1) true false)))) (def (> arg0 arg1) (< arg1 arg0)) (def (<= arg0 arg1) (or (< arg0 arg1) (eq? arg0 arg1))) (def (>= arg0 arg1) (or (> arg0 arg1) (eq? arg0 arg1))) (def old-< <) (def (< . args) (let (vector <-iter (lambda (vector args cur) (if (null? args) true (if (old-< cur (car args)) (<-iter (cdr args) (car args)) false)))) (if (null? args) (display "Please provide arguments for <") (<-iter (cdr args) (car args))))) (def old-> >) (def (> . args) (let (vector >-iter (lambda (vector args cur) (if (null? args) true (if (old-> cur (car args)) (>-iter (cdr args) (car args)) false)))) (if (null? args) (display "Please provide arguments for >") (>-iter (cdr args) (car args))))) (def old-eq? eq?) (def (eq? . args) (let (vector eq?-iter (lambda (vector args cur) (if (null? args) true (if (old-eq? cur (car args)) (eq?-iter (cdr args) (car args)) false)))) (if (null? args) (display "Please provide arguments for eq?") (eq?-iter (cdr args) (car args))))) (def old-<= <=) (def (<= . args) (let (vector <=-iter (lambda (vector args cur) (if (null? args) true (if (old-<= cur (car args)) (<=-iter (cdr args) (car args)) false)))) (if (null? args) (display "Please provide arguments for <=") (<=-iter (cdr args) (car args))))) (def old->= >=) (def (>= . args) (let (vector >=-iter (lambda (vector args cur) (if (null? args) true (if (old->= cur (car args)) (>=-iter (cdr args) (car args)) false)))) (if (null? args) (display "Please provide arguments for >=") (>=-iter (cdr args) (car args))))) (def (and . args) (def (and-iter args) (if (null? args) true (if (car args) (and-iter (cdr args)) false))) (and-iter args)) (def (or . args) (def (or-iter args) (if (null? args) false (if (car args) true (or-iter (cdr args))))) (or-iter args)) (def (not arg0) (if arg0 false true)) (def (pair? arg) (eq? (typeof arg) (quote list))) (def (list? arg) pair?) (def (atom? arg) (eq? (typeof arg) (quote atom))) (def string? atom?) (def (vector? arg) (eq? (typeof arg) (quote vector))) (def (dictionary? arg) (eq? (typeof arg) (quote dictionary))) (def (undefined? arg) (eq? arg (quote undefined))) (def (procedure? arg) (eq? (typeof arg) (quote procedure))) (def (function? arg) procedure?) (def (macro? arg) (eq? (typeof arg) (quote macro))) (def ** pow) (def ^ pow) (def (log x y) (/ (loge y) (loge x))) (def (sec x) (/ 1 (cos x))) (def (csc x) (/ 1 (sin x))) (def (cot x) (/ 1 (tan x))) (def (append a b) (if (null? a) b (cons (car a) (append (cdr a) b)))) (def (reverse l) (def (reverse-iter result l) (if (null? l) result (reverse-iter (cons (car l) result) (cdr l)))) (reverse-iter () l)) (defmacro defn (vector fn_name args . body) (list (quote def) fn_name (cons (quote lambda) (cons args body)))) (defmacro comment (vector . args) ()) (def (map func . args) (def length (len (car args))) (def (get-args-list args i) (if (null? args) () (cons (ref (car args) i) (get-args-list (cdr args) i)))) (def (map-iter func args i) (cond ((eq? i length) ()) (else (cons (apply func (get-args-list args i)) (map-iter func args (+ i 1)))))) (map-iter func args 0)) (def (str . args) (def (str-iter result args) (if (null? args) result (str-iter (+ result (->str (car args))) (cdr args)))) (str-iter "" args)) (def (->float num) (* num 1.0000000000)) (def (diff func diff-at-point :error 0.0000010000) (def (diff_ error) (/ (- (func diff-at-point) (func (- diff-at-point error))) error)) (diff_ error)) (def (integral func a b :dx 0.0100000000) (def (sum term a next b) (if (> a b) 0 (+ (term a) (sum term (next a) next b)))) (def (add-dx x) (+ x dx)) (* (sum func (+ a (/ dx 2.0000000000)) add-dx b) dx)) (def (set-car x value) (cons value (cdr x))) (def (set-cdr x value) (cons (car x) value))';
eval_begin(parser(lexer(RUN_FIRST)),ENVIRONMENT);