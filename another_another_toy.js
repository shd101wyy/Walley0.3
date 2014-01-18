/*

    Toy Language Interpreter

*/

/*
=========================================================
=========================================================
=========================================================
==== The following functions require nodejs support =====
=========================================================
=========================================================
=========================================================

*/
var readStringFromFile; // read string from file function, return string
var writeStringToFile; // write string to file
var getCurrentDirectory; // get current directory
// var systemCommand; // call system command
// check node
if(typeof(require) === 'function')
{
    var fs = require("fs");
    var path = require("path");
    var sys = require('sys')
    var exec = require('child_process').exec;
    var out_;

    readStringFromFile = function(file_name)
    {
        return fs.readFileSync(path.resolve(__dirname, file_name),"utf8");
    };
    writeStringToFile = function(file_name, data)
    {
        fs.writeFile(path.resolve(__dirname, file_name), data);
        return "undefined";
    };
    getCurrentDirectory = function()
    {
        return __dirname;
    };
    /*
    function puts(error, stdout, stderr) { if(error!=null){console.log("EXEC ERROR: \n" + error); return;}; console.log(stdout); console.log(stderr); out_= stdout;};
    systemCommand = function(cmd)
    {
        exec(cmd, puts);
        return out_;
    };
    */
}
/*
=========================================================
=========================================================
=========================================================
=========================================================
=========================================================
=========================================================
=========================================================
=========================================================
*/



var LIST = 2;
var MACRO = 4;
var PROCEDURE = 6;
var BUILTIN_PRIMITIVE_PROCEDURE = 8;
var RATIO = 10;
var FLOAT = 12;

// build List
var Cons = function(x, y)
{
    this.car = x;
    this.cdr = y;
    this.set_car = function(value)
    {
        this.car = value;
    }
    this.set_cdr = function(value)
    {
        this.cdr = value;
    }

    this.TYPE = LIST  // for virtual machien check
}
// build procedure
var Procedure = function(args, body, closure_env, docstring)
{
    this.args = args;
    this.body = body;
    this.closure_env = closure_env;
    this.TYPE = PROCEDURE;
    this.docstring = docstring;
}
// build macro
var Macro = function(args, body, closure_env)
{
    this.args = args;
    this.body = body;
    this.closure_env = closure_env;
    this.TYPE = MACRO;
}
// build primitive builtin procedure
var Builtin_Primitive_Procedure = function(func)
{
    this.func = func;
    this.TYPE = BUILTIN_PRIMITIVE_PROCEDURE;
}
var Toy_Number = function(numer, denom, type)
{
    this.TYPE = type;
    this.numer = numer;
    this.denom = denom;
}
var cons = function(x, y)
{
    return new Cons(x,y);
}
var build_nil = function()
{
   return null;
}
/*
    check whether string is number
*/
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
/*
    check whether string is integer
*/
var isInteger = function(n)
{ 
    if(n.length==0)return false; 
    if(n[0]=="-") n = n.slice(1);
    return n==="0" || /^[1-9][0-9]*$/.test(n) }
var isFloat = function(n){return isNumber(n) && !(isInteger(n))}
var isRatio = function(n) // can only check string
{
    if(typeof(n)!=="string") return false;
    var index_of_slash = n.indexOf("/");
    if(index_of_slash === -1) return false;
    var numer = n.slice(0, index_of_slash);
    var denom = n.slice(index_of_slash+1);
    // if(numer.length === 0 || denom.length == 0) return false;
    if(isInteger(numer) && isInteger(denom)) // didn't consider the case denominator is 0
    {
        if(parseInt(denom) === 0)
        {
            console.log("Invalid ratio --- " + n + " with denominator 0");
        }
        return true;
    }
    return false;
}
var number$ = function(v)
{
        return v instanceof Toy_Number;
}
// The Below 2 functions can be used
// when "n" has been proved to be ratio
var getNumerator = function(n)
{
    return n.slice(0, n.indexOf("/"));
}
var getDenominator = function(n)
{
    return n.slice(n.indexOf("/")+1);
}
var car = function(l){if(l===null){console.log("ERROR: Cannot get car of ()");return null;}return l.car};
var cdr = function(l){return l.cdr};
var caar = function(obj){return car(car(obj))}
var cadr = function(obj){return car(cdr(obj))}
var cddr = function(obj){return cdr(cdr(obj))}
var cdddr = function(obj){return cdr(cdr(cdr(obj)))}
var caddr = function(obj){return car(cdr(cdr(obj)))}
var cadddr = function(obj){return car(cdr(cdr(cdr(obj))))}
var cadar = function(obj){return car(cdr(car(obj)))}
/* ================================= */
/* tokenize string to list */
var lexer = function(input_str)
{   
    var find_final_comment_index = function(input_str, i) // find end index of comment ; comment
    {
        if(i == input_str.length) return i;
        if(input_str[i]=="\n") return i+1;
        else return find_final_comment_index(input_str, i + 1);
    }
    var find_final_long_annotation_index = function(input_str, i) // find end index of long comment ;;; comment ;;;
    {
        if(i == input_str.length) return i;
        if(i + 3 <= input_str.length && input_str.slice(i, i+3) === ";;;")
            return i+3;
        return find_final_long_annotation_index(input_str, i+1);
    }
    var find_final_string_index = function(input_str, i)  // find final index of string 
    {
        if(i == input_str.length)
        {
            console.log("ERROR: Incomplete String");
            return i;
        }
        else if(input_str[i]=="\\")
            return find_final_string_index(input_str, i+2);
        else if(input_str[i]==='"')
            return i+1;
        else 
            return find_final_string_index(input_str, i+1)
    }
    var find_final_number_of_atom_index = function(input_str, i)
    {
        if(i == input_str.length)
            return i;
        if(input_str[i]=="(" || input_str[i]==")"
            || input_str[i]=="[" || input_str[i]=="]"
            || input_str[i]=="{" || input_str[i]=="}"
            || input_str[i]==" " || input_str[i]=="\t"
            || input_str[i]=="\n" || input_str[i]==";"
            || input_str[i]==",")
            return i;
        else
            return find_final_number_of_atom_index(input_str, i+1);
    }
    var lexer_iter = function(input_str, i)
    {
        if(i>=input_str.length)
            return null; // finish
        else if(input_str[i]===" " || input_str[i]=="\n" || input_str[i]=="\t" || input_str[i]===",") // remove space tab newline ,
            return lexer_iter(input_str, i + 1);
        else if(input_str[i]==="(")
            return cons( "(", lexer_iter(input_str, i + 1));
        else if(input_str[i]==="[")
            return cons( "(", cons( "vector", lexer_iter(input_str, i + 1)));
        else if(input_str[i]==="{")
            return cons( "(", cons( "dictionary", lexer_iter(input_str, i + 1)));
        else if(input_str[i]===")" || input_str[i]=="]" || input_str[i]=="}")
            return cons( ")", lexer_iter(input_str, i + 1));
        else if(input_str[i]==="~" && input_str[i+1]==="@")
            return cons("~@", lexer_iter(input_str, i+2));
        else if(input_str[i]==="'" || input_str[i]=="`" || input_str[i]=="~")
            return cons( input_str[i], lexer_iter(input_str, i + 1));
        else if(input_str[i]==='"')
        {
            var end = find_final_string_index(input_str, i+1);
            return cons(input_str.slice(i, end), lexer_iter(input_str, end))
            // return cons("(", cons("quote", cons(input_str.slice(i, end), cons(")", lexer_iter(input_str, end)))))
        }
        // long annotation
        else if (i + 3 <= input_str.length && input_str.slice(i, i+3) === ";;;") // ;;; comment ;;;
            return lexer_iter(input_str, find_final_long_annotation_index(input_str, i+3));
        else if(input_str[i]===";") // comment
            return lexer_iter(input_str, find_final_comment_index(input_str, i+1));
        else
        {
            // atom or number
            var end = find_final_number_of_atom_index(input_str, i+1);
            var __obj = input_str.slice(i, end);
            if(isRatio(__obj)) // is ratio number
            {
                return cons("(", cons("/", cons(parseFloat(getNumerator(__obj)), cons(parseFloat(getDenominator(__obj)), cons(")", lexer_iter(input_str, end))))));
            }
            else
            {
                return cons(__obj, lexer_iter(input_str, end))
            }
            // return cons( input_str.slice(i, end) , lexer_iter(input_str, end));
        }
    }
    return lexer_iter(input_str, 0);
}

/* parse list to list */
var parser = function(l)
{
    var rest = l; // keep track of rest
    var parse_list = function(l)
    {
        if(l === null)
        {
            console.log("ERROR: Incomplete Statement. Missing )");
            rest = null;
            return null;
        }
        if(car(l) === ")") // finish
        {
            rest = cdr(l);
            return build_nil();
        }
        else if (car(l) === "(") // list
        {
            return cons(parse_list(cdr(l)), parse_list(rest));
        }
        else if (car(l) === "'" || car(l) === "~" || car(l) === "`" || car(l) === "~@")  // quote unquote quasiquote unquote-splice
        {
            return cons(parse_special(l), parse_list(rest));
        }
        else  // symbol or number
        {
            return cons(parse_symbol_or_number( car(l) ), parse_list(cdr(l)));
        }
    }
    var parse_special = function(l)
    {
        var tag ;
        if(car(l) === "'")
            tag = "quote"
        else if (car(l) === "~")
            tag = "unquote"
        else if (car(l) === "~@")
            tag = "unquote-splice"
        else tag = 'quasiquote'
        l = cdr(l);
        if (car(l) === "(") // list
        {
            return cons(tag, cons(parse_list(cdr(l)), build_nil()));
        }
        else if (car(l) === "'" || car(l) === "~" || car(l) === "`")  // quote unquote quasiquote
        {   // here my be some errors
            return cons(tag, cons(parse_special(l), build_nil()));
        }
        else  // symbol or number
        {
            rest = cdr(l);
            return cons(tag, cons(parse_symbol_or_number(car(l)), build_nil()));
        }
    }
    var formatQuickAccess = function(ns, keys)
    {
        var formatQuickAccess_iter = function(keys, output, count)
        {
            if(count === keys.length)
                return output;
            return formatQuickAccess_iter(keys, cons(output, cons(":"+keys[count], null)), count + 1);
        }
        return formatQuickAccess_iter(keys, cons(ns, cons(":"+keys[0], null)), 1);
    }
    var parse_symbol_or_number = function(l)
    {
        /* keyword
        if(l[0]==":")
            return cons("keyword", cons('"'+l.slice(1)+'"', build_nil()))
        */
        if (isNumber(l))
        {
            if(isInteger(l))
                return new Toy_Number(parseFloat(l), 1, RATIO);
            else return new Toy_Number(parseFloat(l), 1 ,FLOAT);
        }
        else if (isRatio(l))
            return new Toy_Number(parseFloat(getNumerator(l)), parseFloat(getDenominator(l)), RATIO)

        var splitted_ = l.split(":");
        // console.log(l);
        // console.log(splitted_);
        if(l === ":"  || splitted_.length == 1 || l[0] === ":" || l[l.length-1] === ":") //  : :abc abc: 
            return l;
        var ns = splitted_[0]; // eg x:a => ns 'x'  keys ['a']
        var keys = splitted_.slice(1);
        var formatted_ = formatQuickAccess(ns, keys); // eg x:a => (ref x :a) or (x :a)
        // console.log(formatted_);
        return formatted_;
    }
    // done
    if(l == null)
        return build_nil();
    // list
    else if (car(l) === "(")
    {
        return cons(parse_list(cdr(l)), parser(rest));
    }
    // quote // unquote // quasiquote // unquote-splice
    else if (car(l) === "'" || car(l) === "~" || car(l) === "`" || car(l) === "~@")
    {
        return cons(parse_special(l), rest);
    }
    // symbol or number
    else
    {
        return cons(parse_symbol_or_number( car(l) ), parser(cdr(l)));
    }
}


/*
    Numeric Calculation
*/
// GCD
/* // use  resursion
var gcd = function(a,b)
{
    if (b==0)
        return a
    return gcd(b,a%b)
}
*/
var gcd = function(a,b)
{
    while(b!=0)
    {
        var temp = a;
        a = b;
        b = temp%b;
    }
    return a;
}
var numer = function(rat){return rat.numer}
var denom = function(rat){return rat.denom}
var make_rat = function(numer, denom)
{
    var g = gcd(numer, denom)
    var numer = numer/g;
    var denom = denom/g;
    return new Toy_Number(numer, denom, RATIO);
}
/* convert Toy_Number to string */
var number_to_string = function(num)
{
    if(num.TYPE === FLOAT) return ""+num.numer;
    else if (num.denom === 1) return "" + num.numer;
    return num.numer+"/"+num.denom;
}
// fraction arithematic
var add_rat = function(x,y){
   return make_rat( numer(x)*denom(y)+numer(y)*denom(x) , denom(x)*denom(y))
}
var sub_rat = function(x,y){
    return make_rat( numer(x)*denom(y)-numer(y)*denom(x) , denom(x)*denom(y))
}
var mul_rat = function(x,y){
    return make_rat(numer(x)*numer(y), denom(x)*denom(y))
}
var div_rat = function (x,y){
    return make_rat(numer(x)*denom(y),denom(x)*numer(y))
}


/*
    format values to string
*/
var formatNumber = function(num)
{
    if(num.TYPE === FLOAT) return ""+num.numer.toFixed(10);
    else if (num.denom === 1) return "" + num.numer;
    return num.numer+"/"+num.denom;
}
    ;
var formatList = function(l) // format list object to javascript string
{
    if(l === null) // it is null
    {
        return '()';
    }
    else
    {
        var output = "(";
        var p = l; // pointer
        while(1)
        {
            if(l === null) // finish
            {
                output = output.slice(0, output.length - 1) + ")";
                break;
            }
            if(!(l instanceof Cons)) // pair
            {
                var c = l;
                output = output + ". ";
                if (c === null) output = output + "())";
                else if(number$(c))
                    output = output + formatNumber(c) + ")";
                else if (typeof(c) === "string")
                    output = output + c + ")";
                else if (c  instanceof Cons)
                    output = output + formatList(c) + ")";
                else if (c instanceof Array)
                    output = output + formatVector(c) + ")";
                else if (c.TYPE === PROCEDURE)
                    output = output + "< user-defined-procedure >)" ;
                else if (typeof(c) === 'function')
                // else if (c.TYPE === BUILTIN_PRIMITIVE_PROCEDURE)
                    output = output + "< builtin-primitive-procedure >)"      ;
                else if (c.TYPE === MACRO)
                    output = output + "< macro >";
                else if (c instanceof Object)
                    output = output + formatDictionary(c) + ")";
                break;
            }
            var c = l.car;
            if (c === null) output = output + "() ";
            else if(number$(c))
                output = output + formatNumber(c) + " ";
            else if (typeof(c) === "string")
                output = output + c + " ";
            else if (c  instanceof Cons)
                output = output + formatList(c) + " ";
            else if (c instanceof Array)
                output = output + formatVector(c) + " ";
            else if (typeof(c) === 'function')
            // else if (c.TYPE === BUILTIN_PRIMITIVE_PROCEDURE)
                output = output + "< builtin-procedure > "      ;
            else if (c.TYPE === PROCEDURE)
                output = output + "< user-defined-procedure > " ;
            else if (c.TYPE === MACRO)
                output = output + "< macro > "
            else if (c instanceof Object)
                output = output + formatDictionary(c) + " ";
            l = l.cdr; 
        }
        return output;
    }
}
var formatVector = function(v)
{
    var output = "[";
    var p = v; // pointer
    for(var i = 0; i < p.length; i++)
    {
        var c = p[i];
        if(c === null)
            output = output + "() "
        else if(number$(c))
            output = output + formatNumber(c) + " ";
        else if (typeof(c) === "string")
            output = output + c + " ";
        else if (c instanceof Cons)
            output = output + formatList(c) + " ";
        else if (c instanceof Array)
            output = output + formatVector(c) + " ";
        else if (c.TYPE === PROCEDURE)
            output = output + "< user-defined-procedure > " ;
        else if (typeof(c) === 'function')
        // else if (c.TYPE === BUILTIN_PRIMITIVE_PROCEDURE)
            output = output + "< builtin-procedure > "      ;
        else if (c.TYPE === MACRO)
            output = output + "< macro > "
        else if (c instanceof Object)
            output = output + formatDictionary(c) + " ";
    }
    output = output.slice(0, output.length - 1) + "]"
    return output;
}
var formatDictionary = function(d)
{
    var output = "{";
    var p = d;  // pointer
    for(var key in p)
    {
        output = output + key + " "
        var c = p[key];
        if(c === null)
            output = output + "()" + ", ";
        else if(number$(c))
            output = output + formatNumber(c) + ", ";
        else if (typeof(c) === 'string')
            output = output + (c) + ", ";
        else if (c instanceof Cons)
            output = output + formatList(c) + ", ";
        else if (c instanceof Array)
            output = output + formatVector(c) + ",";
        else if (c.TYPE === PROCEDURE)
            output = output + "< user-defined-procedure >, " ;
        else if (typeof(c) === 'function')
        // else if (c.TYPE === BUILTIN_PRIMITIVE_PROCEDURE)
            output = output + "< builtin-procedure >, "      ;
        else if (c.TYPE === MACRO)
            output = output + "< macro > "
        else if (c instanceof Object)
            output = output + formatDictionary(c) + ", ";
    }
    output = output.slice(0, output.length - 1) + "}"
    return output;
}

/* to string*/
var to_string = function(v)
{
    if(number$(v))
            return (formatNumber(v));
    else if (typeof(v) === "string" )
        return v;
    else if (v instanceof Cons)
        return (formatList(v));
    else if (v instanceof Array)
        return (formatVector(v));
    else if (v.TYPE === PROCEDURE)
        return ("< user-defined-procedure >");
    else if (v.TYPE === BUILTIN_PRIMITIVE_PROCEDURE)
        return ('undefined');
    else if (v instanceof Object)
        return (formatDictionary(v));
    else
    {
        console.log("Function display: Invalid Parameters Type");
        return 'undefined';
    }
}



var lookup_env = function(var_name, env)
{
    for(var i = env.length-1; i>=0; i--)
    {
        if(var_name in env[i])
            return env[i][var_name]
    }
    console.log("ERROR: unbound variable: " + var_name);
    return "undefined"
}
/* arg0: (add a b)
   arg1: ((+ a b) ...) */
/*
    (define (add a b) (+ a b))
    =>
    (define add (lambda (a b) (+ a b)))
*/
var make_lambda = function(arg0, arg1)
{
    var var_name = car(arg0);  // add
    var args = cons("vector", cdr(arg0));      // (a b), [a b]
    var body = arg1           // ((+ a b))

    var lambda_body = cons('lambda', cons(args, body))
    return cons("def", cons(var_name, cons(lambda_body, build_nil())))
}
var eval_set = function(var_name, var_value, env)
{
    for(var i = env.length-1; i>=0; i--)
    {
        if(var_name in env[i])
        {
            env[i][var_name] = var_value;
            return var_value;
        }
    }
    console.log("ERROR: Function set!, var name "+var_name+" does not exist");
    return "undefined";
}
var eval_quasiquote = function(list, env)
{
    if(list === null) return null;
    var v = car(list);
    if(typeof(v)==="string") 
    {
        if(v === ".") // pair
        {
            v = cadr(list);
            if(typeof(v) === "string") return v;
            else
            {
                if(car(v) === "unquote") return toy_eval(cadr(v), env);
                return eval_quasiquote(v, env);
            }
        }
        return cons(v, eval_quasiquote(cdr(list), env))
    }
    else if (v.TYPE === LIST)
    {
        if(car(v) === "unquote")
            return cons(toy_eval(cadr(v), env),
                        eval_quasiquote(cdr(list), env));
        if(car(v) === "unquote-splice")
        {
            var append = function(a, b)
            {
                if(a == null) return b;
                return cons(car(a), append(cdr(a), b))
            }
            var value = toy_eval(cadr(v), env);
            if(!(value instanceof Cons))
            {
                console.log("ERROR: ~@ only support list type value")
                return null;
            }
            return append(value, eval_quasiquote(cdr(list), env));
        }
        return cons(eval_quasiquote(v, env),
                    eval_quasiquote(cdr(list), env))

    }
    return cons(v, eval_quasiquote(cdr(list), env)); 
}

var eval_lambda = function(/*lambda_args, lambda_body */ lambda__ ,env)
{

    var lambda_args = car(lambda__);
    var lambda_body = cdr(lambda__);
    var docstring = "This function has no information provided";
    if(typeof(lambda_args) === "string" && lambda_args[0] === '"')
    {
        // docstring
        docstring = lambda_args.slice(1, lambda_args.length-1);
        lambda_args = car(lambda_body);
        lambda_body = cdr(lambda_body);
    }
    if(lambda_args.car!=="vector"){console.log("ERROR: when defining lambda, please use (lambda [args] body) format");return "undefined"}
    lambda_args = cdr(lambda_args);
    /* clean args */
    var arg = {}
    arg.arg_name_list = [];
    arg.arg_val_list  = [];
    while(lambda_args!=null)
    {
        var v = car(lambda_args);
        if(typeof(v) === 'string') /* (lambda (a) a) a is string */
        {
            if(v[0] === ":") /* (lambda (:a 12) a) */
            {
                var var_name = v.slice(1);          
                lambda_args = cdr(lambda_args);
                var var_val = toy_eval(car(lambda_args), env);
                arg.arg_name_list.push(var_name);  // add arg name
                arg.arg_val_list.push(var_val);   // add default arg value
            }
            else if (v === ".") // rest
            {
                arg.arg_name_list.push("."); arg.arg_val_list.push("undefined"); // save .
                lambda_args = cdr(lambda_args);
                v = car(lambda_args);
                if(v[0]==":")
                {
                    //
                    //    (def (add a . :b 123) b)  the default value of b is 123
                    //
                    var var_name = v.slice(1);
                    lambda_args = cdr(lambda_args);
                    var var_val = toy_eval(car(lambda_args), env);
                    arg.arg_name_list.push(var_name);  // add arg name
                    arg.arg_val_list.push(var_val);   // add default arg value
                    break;
                }
                else
                {
                    //
                    //    (def (add . a) a) => the default value of a is null
                    //
                    arg.arg_name_list.push(v); 
                    arg.arg_val_list.push(null);
                    break;
                }
            }
            else
            {
                arg.arg_name_list.push(v); // add arg name
                arg.arg_val_list.push("undefined"); // add default arg value
            }
        }
        else
        {
            console.log("ERROR: Function definition error.")
            return "undefined";
        }
        lambda_args = cdr(lambda_args);
    }
    return new Procedure(arg, lambda_body/*new_lambda_body*/, env.slice(0), docstring);   
}
var eval_macro = function(macro_args, macro_body, env)
{
    if(macro_args.car!=="vector"){console.log("ERROR: when defining macro_args, please use (defmacro macro_name [args] body) format");return "undefined"}
    macro_args = cdr(macro_args);
    return new Macro(macro_args, macro_body, env.slice(0));
}
var eval_list = function(list, env)
{
    if(list === null) return null;
    else return cons(toy_eval(car(list), env),
                     eval_list(cdr(list), env));
}
var macro_expand = function(macro, params, env)
{
    var add_parameter = function(new_frame, args, params)
    {
        while(args!==null)
        {   
            if(params === null) /* Error */
            {
                console.log("ERROR: Invalid macro. Pattern doesn't match");
                return;
            }
            var var_name = car(args); 
            if(var_name instanceof Cons)
            {
                if(args.car.car === "vector")
                    add_parameter(new_frame, args.car.cdr, params.car.cdr)
                else
                    add_parameter(new_frame, args.car, params.car);
            }
            else if(var_name === ".")
            {
                new_frame[cadr(args)] = params;
                break;
            }
            else
            {
                var var_value = car(params); // does not calculate
                new_frame[var_name] = var_value;
            }
            args = cdr(args); params = cdr(params);
        }
    }
    var closure_env = macro.closure_env.slice(0);
    var args = macro.args;
    var body = macro.body;
    var new_frame = {};

    add_parameter(new_frame, args, params); // add parameters
    closure_env.push(new_frame);
    return [eval_begin(body, closure_env), macro.closure_env];
}
var eval_begin = function(body, env)
{
    var return_v = null;
    while(body!==null)
    {
        return_v = toy_eval(car(body), env);
        body = cdr(body);
    }
    return return_v;
}
/*
    extremely simple interpreter
    ;(
*/
var toy_eval = function(exp, env)
{
    while (true)
    {
        if(exp === null) return null;
        else if(typeof(exp) === "string"){
            if(exp[0]==='"')return exp.slice(1, exp.length-1); // string
            if(exp[0]===":")return exp.slice(1);               // keyword
            return lookup_env(exp, env);
        }
        else if (exp instanceof Toy_Number)
            return exp;
        else if (exp.TYPE === LIST)
        {
            var tag = car(exp);
            if(tag === "quote")
            {
                var quote_list = function(l)
                {
                    if(l == null) return null;
                    var v = car(l);
                    if(v instanceof Cons) return cons(quote_list(v), quote_list(cdr(l)));
                    else if (v === ".") return cadr(l);
                    return cons(v, quote_list(cdr(l)));
                }
                if(cadr(exp) instanceof Cons)
                    return quote_list(cadr(exp));
                return cadr(exp);
            }
            else if (tag === "quasiquote")
            {
                var value = cadr(exp);
                if(typeof(value)!=="string" && value.TYPE === LIST)
                {
                    return eval_quasiquote(value, env);
                }
                return value
            }
            else if(tag === "def")
            {
                var var_name = cadr(exp);
                var var_value = caddr(exp);
                /* Redefinition Error */
                if(typeof(var_name) === "string" && var_name in env[env.length - 1])
                {
                	console.log("\nERROR: It is not recommended or allowed to redefine an existed variable: " + var_name
                                 + "\nTo change the value of a variable. Use (set! var-name var-value)"
                                 + "\nIn this case: (set! " + var_name + " " + to_string(var_value) + ")");
					return "undefined";
                }
                /* lambda */
                if(typeof(var_name)!=="string" && var_name.TYPE === LIST)
                {
                    return toy_eval(make_lambda(var_name, cddr(exp)), env)
                }
                else
                {
                    if(typeof(var_name)!=="string")
                    {
                        console.log("ERROR: Invalid variable name : " + primitive_builtin_functions["->str"]([var_name]))
                        return "undefined"
                    }
                    var_value = toy_eval(var_value, env);
                    env[env.length - 1][var_name] = var_value;
                    return var_value;
                }
            }
            else if (tag === "set!")
            {
                var var_name = cadr(exp);
                var var_value = toy_eval(caddr(exp), env);
                return eval_set(var_name, var_value, env);
            }
            /*
            else if (tag === "macro")
            {
                return eval_macro(cadr(exp), cddr(exp), env);
            }
            */
            /*
                (let [x 1 y 2] (+ x y))
            */
            else if (tag === "let")
            {
                var var_val_vector = cadr(exp);
                if(var_val_vector.car!=="vector"){console.log("ERROR: please use [] in let when binding variables. Like (let [a 0 b 2] (+ a b))"); return "undefined"}
                var_val_vector = cdr(var_val_vector);
                var new_frame = {};
                env.push(new_frame); // this env has to be here... don't change it
                while(var_val_vector!==null)
                {
                    var var_name = car(var_val_vector);
                    var var_val = toy_eval(car(cdr(var_val_vector)), env);
                    new_frame[var_name] = var_val;
                    var_val_vector = cddr(var_val_vector);
                }
                var return_val = eval_begin(cddr(exp), env);
                env.pop(new_frame);
                return return_val;
            }
            else if (tag === "lambda")
            {
                return eval_lambda(/*cadr(exp), cddr(exp)*/ cdr(exp), env);
            }
            else if (tag === "if")
            {
                var test = cadr(exp);
                var conseq = caddr(exp);
                var alter = cadddr(exp);

                test = toy_eval(test, env);
                if(test == null){
                    exp = alter; continue;
                }
                exp = conseq; continue;
            }
            else if (tag === "cond")
            {
                var clauses = cdr(exp);
                var run_body = null;
                while(clauses!==null)
                {
                    var clause = car(clauses)
                    var predicate = car(clause);
                    var body = cdr(clause);
                    if(predicate == "else" || toy_eval(predicate, env)!==null)
                    {
                        run_body = body;
                        env = env;
                        break;
                    }
                    clauses = cdr(clauses);
                }
                exp = cons("begin", run_body); // for tail call optimization
                continue;  
            }
            else if (tag === "begin")
            {
                var body = cdr(exp);
                if(body == null) return "undefined";
                while(body.cdr!==null)
                {
                    toy_eval(car(body), env);
                    body = body.cdr;
                }
                exp = body.car;
                continue;
            }
            else if (tag === "eval")
            {
                return toy_eval(toy_eval(cadr(exp), env), env)
            }
            else if (tag === "apply")
            {
                return toy_eval(cons(toy_eval(cadr(exp), env), toy_eval(caddr(exp), env) ) ,env)
            }
            else if (typeof(tag) === 'function') // javascript function
            {
                var eval_list_to_array = function(list, env)
                {
                    var output = []; while(list!==null)
                    {
                        output.push(toy_eval(car(list), env));
                        list = cdr(list)
                    }
                    return output;
                }
               return tag.call(null, eval_list_to_array(cdr(exp), env));
            }
            else if (tag === "macroexpand-1")
            {
                var v = toy_eval(cadr(exp), env);
                return macro_expand(toy_eval(car(v), env),
                                    cdr(v),
                                    env)[0];
            }
            else if (tag === "defmacro")
            {
                var macro = eval_macro(caddr(exp), cdddr(exp), env);
                // env[1][cadr(exp)] = macro;
                env[0][cadr(exp)] = macro;
                return macro
            }
            /*
            else if (tag === "while")
            {
                var test = cadr(exp);
                var body = cddr(exp);
                while(toy_eval(test, env))
                {
                    eval_begin(body, env);
                }
                return "undefined";
            }*/
            else if (tag === "get-env") // return current env
            {
                return env.slice(0);
            }
            else if (tag.TYPE === PROCEDURE)
            {  
                var proc = tag;var params = cdr(exp);
                var closure_env = proc.closure_env.slice(0);
                var args = proc.args;
                var body = proc.body;
                var new_frame = {}
                var args_val_list  = args.arg_val_list;  // arg default value list
                var args_name_list = args.arg_name_list; // arg name list
               
                for(var i = 0; i < args_name_list.length; i++) // add parameters
                {
                    if(args_name_list[i] === ".") // rest 
                    {
                        if(params == null)
                        {
                            var arg_name = args_name_list[i+1];
                            new_frame[arg_name] = args_val_list[i+1];
                        }
                        else
                        {
                            var arg_name = args_name_list[i+1];
                            var param_value = eval_list(params, env);
                            new_frame[arg_name] = param_value;
                        }
                        break;
                    }
                    if(params == null) 
                    {
                        if(args_name_list[i] in new_frame) continue;
                        new_frame[args_name_list[i]] = args_val_list[i];
                        continue;
                    }
                    var param = car(params);
                    if(typeof(param) === "string" && param[0] === ":") // :a => param name a 
                    {
                        var param_name = param.slice(1);
                        params = cdr(params);
                        var param_value = toy_eval(car(params), env);
                        new_frame[param_name] = param_value;

                        if(param_name!==args_name_list[i] && !(args_name_list[i] in new_frame))
                            new_frame[args_name_list[i]] = args_val_list[i];
                    }
                    else
                    {
                        var arg_name = args_name_list[i]; // default name
                        var param_val = toy_eval(car(params), env); // calculate given param
                        new_frame[arg_name] = param_val;
                    }
                    params = cdr(params);
                }
                closure_env.push(new_frame); // add new frame
                exp = cons("begin", body); env = closure_env; continue; // tail call optimization                 
            }
            else if (tag.TYPE === MACRO)
            {
            	var expanded_statement = macro_expand(tag, cdr(exp), env);

                var macro_stm = expanded_statement[0];
                var macro_env = expanded_statement[1];
                /*
                    2014 / 1 / 18
                    solve hygienic macro problem
                */
                var format_stm = function(macro_stm, macro_env)
                {
                    if(macro_stm === null)
                        return null;
                    else if (! (macro_stm instanceof Cons))
                        return macro_stm;
                    var o = car(macro_stm);
                    if(o instanceof Cons)
                    {
                        return cons(format_stm(o, macro_env), 
                                    format_stm(cdr(macro_stm), macro_env));
                    }
                    else
                    {
                        for(var i = macro_env.length-1; i>=0; i--)
                        {
                            if(o in macro_env[i])
                            {
                                return cons(macro_env[i][o], 
                                            format_stm(cdr(macro_stm), macro_env));
                            }
                        }
                        return cons(o, 
                                    format_stm(cdr(macro_stm), macro_env))
                    }
                }

                var formatted_stm = format_stm(macro_stm, macro_env);
                // primitive_builtin_functions["display"]([formatted_stm]);

                return toy_eval(formatted_stm, env);
                // return toy_eval(expanded_statement[0], expanded_statement[1]);
            }
            else if (tag instanceof Array)
            {
                var index = toy_eval(cadr(exp), env);
                if(!index instanceof Toy_Number){console.log("ERROR: invalid index");return "undefined"}
                if( index >= tag.length || index < 0)
                {
                    console.log("ERROR: Index out of boundary")
                    return "undefined"
                }
                return tag[index.numer];
            }
            else if (tag instanceof Object && !(tag instanceof Toy_Number)  && !(tag instanceof Cons))
            {
                var key = toy_eval(cadr(exp), env);
                if( key in tag)
                    return tag[key];
                else
                    return "undefined"
            }
            else
            {
                var proc = toy_eval(car(exp), env);
                var application =   cons(proc, cdr(exp));
                if(proc === "undefined" || proc instanceof Toy_Number)
                {
                    console.log("ERROR: Invalid Function " + (proc instanceof Toy_Number?formatNumber(proc):proc));
                    console.log("      WITH EXP: "+to_string(exp))
                    return "undefined"
                }
                /* continue */
                exp = application;
                env = env;
                continue;
                /* return toy_eval(
                                   application
                                    , env
                                    ) */
            }
        }
        else
            return exp;
    }
}

var primitive_builtin_functions = 
{
    "+":function(stack_param)
        {
            var arg0 = stack_param[0]; var arg1 = stack_param[1];
            var arg0_number = arg0 instanceof Toy_Number;
            var arg1_number = arg1 instanceof Toy_Number;
            if(arg0_number && arg1_number)
            {
                if(arg0.TYPE === FLOAT || arg1.TYPE === FLOAT) return new Toy_Number(arg0.numer/arg0.denom + arg1.numer/arg1.denom, 1,  FLOAT);
                return add_rat(arg0, arg1);
            }
            if(arg0_number) arg0 = formatNumber(arg0);
            if(arg1_number) arg1 = formatNumber(arg1);
            return arg0 + arg1;
        }, 
    "-":function(stack_param)
        {
            var arg0 = stack_param[0]; var arg1 = stack_param[1];
            var arg0_number = arg0 instanceof Toy_Number;
            var arg1_number = arg1 instanceof Toy_Number;
            if(arg0_number && arg1_number)
            {
                if(arg0.TYPE === FLOAT || arg1.TYPE === FLOAT) return new Toy_Number(arg0.numer/arg0.denom - arg1.numer/arg1.denom, 1, FLOAT);
                return sub_rat(arg0, arg1);
            }
            if(arg0_number) arg0 = formatNumber(arg0);
            if(arg1_number) arg1 = formatNumber(arg1);
            return arg0 - arg1;
        }, 
    "*":function(stack_param)
        {
            var arg0 = stack_param[0]; var arg1 = stack_param[1];
            var arg0_number = arg0 instanceof Toy_Number;
            var arg1_number = arg1 instanceof Toy_Number;
            if(arg0_number && arg1_number)
            {
                if(arg0.TYPE === FLOAT || arg1.TYPE === FLOAT) return new Toy_Number((arg0.numer/arg0.denom) * (arg1.numer/arg1.denom), 1, FLOAT);
                return mul_rat(arg0, arg1);
            }
            if(arg0_number) arg0 = formatNumber(arg0);
            if(arg1_number) arg1 = formatNumber(arg1);
            return arg0 * arg1;
        }, 
    "/":function(stack_param)
        {
            var arg0 = stack_param[0]; var arg1 = stack_param[1];
            var arg0_number = arg0 instanceof Toy_Number;
            var arg1_number = arg1 instanceof Toy_Number;
            if(arg0_number && arg1_number)
            {
                if(arg0.TYPE === FLOAT || arg1.TYPE === FLOAT) return new Toy_Number((arg0.numer/arg0.denom) / (arg1.numer/arg1.denom), 1, FLOAT);
                if(arg1.numer === 0){
                    console.log("ERROR: Cannot divide by 0")
                    return "false"
                }
                return  div_rat(arg0, arg1);
            }
            if(arg0_number) arg0 = formatNumber(arg0);
            if(arg1_number) arg1 = formatNumber(arg1);
            return arg0 / arg1;
        }, 
    "<":function(stack_param)
    {
        var arg0 = stack_param[0]; var arg1 = stack_param[1];
        var arg0_number = arg0 instanceof Toy_Number;
        var arg1_number = arg1 instanceof Toy_Number;
        if (arg0_number) arg0 = arg0.numer/arg0.denom;
        if (arg1_number) arg1 = arg1.numer/arg1.denom;
        return arg0 < arg1  ? 'true':null;
    },
    "eq?":function(stack_param)
    {
        var arg0 = stack_param[0]; var arg1 = stack_param[1];
        var arg0_number = arg0 instanceof Toy_Number;
        var arg1_number = arg1 instanceof Toy_Number;
        if (arg0_number) arg0 = arg0.numer/arg0.denom;
        if (arg1_number) arg1 = arg1.numer/arg1.denom;
        return arg0 === arg1  ? 'true':null;
    },
    "number?":function(param_array){return param_array[0] instanceof Toy_Number ? 'true':null;},
    "ratio?":function(param_array){return param_array[0] instanceof Toy_Number && param_array[0].TYPE === RATIO && param_array[0].denom !== 1 ? 'true':null;},
    "float?":function(param_array){return param_array[0] instanceof Toy_Number && param_array[0].TYPE === FLOAT ? 'true':null;},
    "integer?":function(param_array){return param_array[0] instanceof Toy_Number && param_array[0].TYPE === RATIO && param_array[0].denom == 1 ? 'true':null;},
    /* get numerator of number */
    "numerator": function(stack_param){ 
        if(stack_param[0] instanceof Toy_Number)
            return new Toy_Number(stack_param[0].numer, 1, RATIO);
        else
            console.log("ERROR: Function numerator wrong type parameters")
        return "undefined"
        },
    "denominator": function(stack_param){ 
        if(stack_param[0] instanceof Toy_Number)
            return new Toy_Number(stack_param[0].denom, 1, RATIO);
        else
            console.log("ERROR: Function numerator wrong type parameters")
        return "undefined"
        },
    "null?":function(stack_param){return stack_param[0]===null?'true':null},
    "cons":function(stack_param){return cons(stack_param[0], stack_param[1])},
    "car":function(stack_param){return car(stack_param[0])},
    "cdr":function(stack_param){return cdr(stack_param[0])},
    "set-car!":function(stack_param)
    {
        var v = stack_param[0];
        var a = stack_param[1];
        if(typeof(v)!=="string" && v.TYPE === LIST)
        {
            v.car = a;
            return v;
        }
        else
        {
            console.log("ERROR: Function set-car! wrong type parameters");
            return "undefined"
        }
    },
    "set-cdr!":function(stack_param)
    {
        var v = stack_param[0];
        var a = stack_param[1];
        if(typeof(v)!=="string" && v.TYPE === LIST)
        {
            v.cdr = a;
            return v;
        }
        else
        {
            console.log("ERROR: Function set-car! wrong type parameters");
            return "undefined"
        }
    },
    /*"keyword":function(stack_param){return stack_param[0]},  // deprecated*/
    "vector":function(stack_param){return stack_param},
    "dictionary":function(stack_param){
        var output = {};
        for(var i = 0; i < stack_param.length; i = i + 2)
        {
            output[stack_param[i]] = stack_param[i+1];
        }
        return output
    },
    "conj":function(stack_param){
        var arg0  = stack_param[0];
        var arg1 = stack_param[1];
        if(arg0.TYPE === LIST)
        {
            return cons(arg1, arg0);
        }
        else if (arg0 instanceof Array)
        {
            var output = arg0.slice(0);
            output.push(arg1);
            return output;
        }
        else if (arg0 instanceof Object)
        {
            var output = Object.create(arg0);
            for(var i in arg1)
            {
                output[i] = arg1[i];
            }
            return output; // the print has error
        }
    },
    "conj!":function(stack_param)
    {
        var arg0  = stack_param[0];
        var arg1 = stack_param[1];
        if(arg0.TYPE === LIST)
        {
            return cons(arg1, arg0);
        }
        else if (arg0 instanceof Array)
        {
            arg0.push(arg1);
            return arg0;
        }
        else if (arg0 instanceof Object)
        {
            for(var i in arg1)
            {
                arg0[i] = arg1[i];
            }
            return arg0;
        }       
    },
    "assoc":function(stack_param)
    {
        var arg0 = stack_param[0];
        var arg1 = stack_param[1];
        var arg2 = stack_param[2];
        if(arg0 instanceof Array)
        {
            var output = arg0.slice(0);
            output[arg1.numer] = arg2;
            return output;
        }
        else if (arg0 instanceof Object)
        {
            var output = Object.create(arg0);
            output[arg1] = arg2;
            return output;
        }
        else
        {
            console.log("ERROR...Function assoc wrong type parameters");
        } 
    },
    "assoc!":function(stack_param)
    {
        var arg0 = stack_param[0];
        var arg1 = stack_param[1];
        var arg2 = stack_param[2];
        if(arg0 instanceof Array)
        {
            arg0[arg1.numer] = arg2;
            return arg0;
        }
        else if (arg0 instanceof Object)
        {
            arg0[arg1] = arg2;
            return arg0;
        }
        else
        {
            console.log("ERROR...Function assoc wrong type parameters");
        }        
    },
    "pop":function(stack_param)
    {
        var arg0 = stack_param[0];
        if(arg0 instanceof Array)
        {
            var output = arg0.slice(0);
            output.pop();
            return output;
        }
        else if (arg0.TYPE === LIST)
        {
            return cdr(arg0);
        }
        else
        {
                console.log("ERROR...Function pop wrong type parameters");  
        }        
    },
    "pop!":function(stack_param)
    {
        var arg0 = stack_param[0];
        if(arg0 instanceof Array)
        {
            arg0.pop();
            return arg0;
        }
        else
        {
                console.log("ERROR...Function pop wrong type parameters");  
        }       
    },
    "random":function(stack_param){    return new Toy_Number(Math.random(), 1, FLOAT);},
    "->ratio":function(stack_param)
    {
        var arg = stack_param[0];
        if(number$(arg))
        {
            if(arg.TYPE === RATIO)
            {
                return arg;
            }
            else
            {
                var num = arg.numer;
                var getNumOfNumberAfterDot = function(num){
                    num = "" + num
                    var i = num.indexOf('.')+1
                    return num.length - i;
                }
                var _n = Math.pow(10, getNumOfNumberAfterDot(num));
                return make_rat(num * _n, _n);
            }
        }
        else
        {
            console.log("Function ->ratio --- only support number type data");
            return ('undefined');
        }
    },
    "dictionary-keys":function(stack_param)
    {
        return Object.keys(stack_param[0]);
    },
    "ref":function(stack_param)
    {
        var arg0 = stack_param[0]; var arg1 = stack_param[1];
        if(typeof(arg0) === "string")
            return arg0[arg1.numer];
        if (arg0.TYPE === LIST)
        {
            var list_ref = function(list, count)
            {
                if(list===null) return null;
                if(count === 0) return car(list);
                return list_ref(cdr(list), count-1);
            }
            return list_ref(arg0, arg1.numer)
        }
        else if (arg0 instanceof Array)
        {
            var index = arg1.numer;
            if(index<0 || index>=arg0.length)
            {
                console.log("ERROR: Index out of boundary")
                return "undefined"
            }
            return arg0[arg1.numer]
        } 
        else if(arg0 instanceof Object){ 
            if(arg1 in arg0)
                return arg0[arg1];
            else
                return "undefined"
        }
        else
            console.log("ERROR: Function ref wrong type parameters")      
    },
    "->str":function(stack_param)
    {
        // change obj to atom
        var v = stack_param[0];
        return to_string(v);
    },
    "typeof":function(stack_param)
    {
        var v = stack_param[0]
        if (v === null) return "null"
        else if(typeof(v)==="string") return "atom"
        else if (v instanceof Toy_Number) return "number"
        else if (v instanceof Cons) return "list"
        else if (v instanceof Array) return "vector"
        else if (v.TYPE === PROCEDURE || v.TYPE === BUILTIN_PRIMITIVE_PROCEDURE) return "procedure"
        else if (v.TYPE === MACRO) return "macro"
        else if (v instanceof Object) return "dictionary"
        else{
            console.log("ERROR: Cannot judge type")
            return "undefined"
        }
    },
    "len":function(stack_param)
    {
        var v = stack_param[0]
        if(v===null) return new Toy_Number(0, 1, RATIO)
        else if (typeof(v)==="string") return  new Toy_Number(v.length, 1, RATIO);
        else if (v.TYPE === LIST)
        {
            var list_len = function(list, count)
            {
                if(list === null) return count
                return list_len(cdr(list), count+1)
            }
            return new Toy_Number(list_len(v, 0), 1 ,RATIO)
        }
        else if (v instanceof Array)
            return new Toy_Number(v.length, 1, RATIO)
        else{
            console.log("ERROR: Function len wrong type parameters")
            return "undefined"
        }
    },
    "slice":function(stack_param)
    {
        var v = stack_param[0];
        var arg0 = stack_param[1]; var arg1 = stack_param[2];
        if(!(arg0 instanceof Toy_Number) || !(arg1 instanceof Toy_Number))
        {
            console.log("ERROR: Function slice wrong type parameters");
            return "undefined"
        } 
        if(v instanceof Array)
            return v.slice(arg0.numer, arg1.numer)
        else if (v.TYPE === LIST)
        {
            var list_slice = function(list, start, end, count)
            {
                if(count>=start)
                {
                    if (count === end) return null;
                    return cons(car(list), list_slice(cdr(list), start, end, count+1))
                }
                return list_slice(cdr(list), start, end, count+1)
            }
            return list_slice(v, arg0.numer, arg1.numer, 0);
        }
        else if (typeof(v) === "string") return v.slice(arg0.numer, arg1.numer);
        else
        {
            console.log("ERROR: Function slice wrong type parameters")
            return "undefined"
        }
    },
    "display":function(stack_param)
    {
        try{
            var v = stack_param[0];
            if(v===null)
            {
                console.log("()")
                return "undefined"
            }
            if(number$(v))
            {
                console.log(formatNumber(v));
                return 'undefined'
            }
            else if (typeof(v) === "string")
            {
                console.log((v));
                return ('undefined')
            }
            else if (v instanceof Cons)
            {
                console.log(formatList(v));
                return ('undefined')
            }
            else if (v instanceof Array)
            {
                console.log(formatVector(v));
                return ('undefined')
            }
            else if (v.TYPE === PROCEDURE)
            {
                console.log("< user-defined-procedure >");
                return ('undefined')
            }
            else if (typeof(v) === 'function')
            // else if (v.TYPE === BUILTIN_PRIMITIVE_PROCEDURE)
            {
                console.log("< builtin-procedure >")
                return ('undefined')
            }
            else if (v.TYPE === MACRO)
            {
                console.log("< macro >")
                return "undefined"
            }
            else if (v instanceof Object)
            {
                console.log(formatDictionary(v));
                return ('undefined')
            }
            else
            {
                console.log("Function display: Invalid Parameters Type");
                return ('undefined')
            }
        }
        catch(e)
        {
            console.log(e);
            return 'undefined';
        }
    },
    /*
       ======= Math functions =======
    */
    "math":
    {
        "acos":function(stack_param){return new Toy_Number(Math.acos(stack_param[0].numer/stack_param[0].denom), 1, FLOAT)},
        "acosh":function(stack_param){return new Toy_Number(Math.acosh(stack_param[0].numer/stack_param[0].denom), 1, FLOAT)},
        "asin":function(stack_param){return new Toy_Number(Math.asin(stack_param[0].numer/stack_param[0].denom), 1, FLOAT)},
        "asinh":function(stack_param){return new Toy_Number(Math.asinh(stack_param[0].numer/stack_param[0].denom), 1, FLOAT)},
        "atan":function(stack_param){return new Toy_Number(Math.atan(stack_param[0].numer/stack_param[0].denom), 1, FLOAT)},
        "atanh":function(stack_param){return new Toy_Number(Math.atanh(stack_param[0].numer/stack_param[0].denom), 1, FLOAT)},
        "ceil":function(stack_param){return new Toy_Number(Math.ceil(stack_param[0].numer/stack_param[0].denom), 1, RATIO)},
        "cos":function(stack_param){return new Toy_Number(Math.cos(stack_param[0].numer/stack_param[0].denom), 1, FLOAT)},
        "cosh":function(stack_param){return new Toy_Number(Math.cosh(stack_param[0].numer/stack_param[0].denom), 1, FLOAT)},
        "exp":function(stack_param){return new Toy_Number(Math.exp(stack_param[0].numer/stack_param[0].denom), 1, FLOAT)},
        "floor":function(stack_param){return new Toy_Number(Math.floor(stack_param[0].numer/stack_param[0].denom), 1, RATIO)},
        "loge":function(stack_param){return new Toy_Number(Math.log(stack_param[0].numer/stack_param[0].denom), 1, FLOAT)},
        "pow":function(stack_param){
            if(stack_param[0].TYPE === RATIO && stack_param[1].TYPE === RATIO && stack_param[1].denom === 1)
            {
                return new Toy_Number( Math.pow(stack_param[0].numer, stack_param[1].numer), Math.pow(stack_param[0].denom, stack_param[1].numer), RATIO);
            }
            return new Toy_Number(Math.pow(stack_param[0].numer/stack_param[0].denom, stack_param[1].numer/stack_param[1].denom), 1, FLOAT)
        },
        "sin":function(stack_param){return new Toy_Number(Math.sin(stack_param[0].numer/stack_param[0].denom), 1, FLOAT)},
        "sinh":function(stack_param){return new Toy_Number(Math.sinh(stack_param[0].numer/stack_param[0].denom), 1, FLOAT)},
        "tan":function(stack_param){return new Toy_Number(Math.tan(stack_param[0].numer/stack_param[0].denom), 1, FLOAT)},
        "tanh":function(stack_param){return new Toy_Number(Math.tanh(stack_param[0].numer/stack_param[0].denom), 1, FLOAT)}
    },
    /* 
        call js function
        (js js_function_name arg0 arg1 arg2 ...)
        (js "Math.sin" 12) => Math.sin(12) => Math.sin.apply(null, [12])
    */
    "js":function(stack_param)
    {
        var js_func = stack_param[0]; var params_list = stack_param[1];
        var params_array = stack_param.slice(1);
        for(var i = 0; i < params_array.length; i++)
        {
            if(params_array[i] instanceof Toy_Number)
                params_array[i] = params_array[i].numer/params_array[i].denom;
        }
        var output = eval(js_func).apply(null, params_array)
        if(isNumber(output)) return new Toy_Number(output, 1, FLOAT);  // number
        if(typeof(output)==='boolean') return output===true?"true":null;      // boolean
        if(typeof(output)==='undefined') return 'undefined' // undefined
        return output
    },
    "read":function(stack_param)
    {
        if(stack_param[0] instanceof Cons) return cons(stack_param[0], null);
        return parser(lexer(stack_param[0]))
    },
    "read-file":function(stack_param) // read content from file and return all string
    {
        if(typeof(readStringFromFile) === 'undefined')
        {
            console.log("ERROR: Cannot read file. Require NodeJS Support");
            return "undefined";
        }
        var file_name = stack_param[0];
        return readStringFromFile(file_name);
    },
    "write-file":function(stack_param)
    {
        if(typeof(writeStringToFile) === 'undefined')
        {
            console.log("ERROR: Cannot write file. Require NodeJS Support");
            return "undefined";
        }
        var file_name = stack_param[0];
        var data = stack_param[1];
        return writeStringToFile(file_name, data);

    },
    "get-curr-dir":function(stack_param)
    {
        if(typeof(getCurrentDirectory) === 'undefined')
        {
            console.log("ERROR: Cannot get current directory. Require NodeJS Support");
            return "undefined";
        }
        return getCurrentDirectory();
    },
    "require":function(stack_param) 
    /*
        require module eg: (def x (require "./test/test.toy")), in test.toy here is "(def (test) (display "You successfully require this file"))"
        then calling (x:test) will print string "You successfully require this file"
    */
    {
        if(typeof(readStringFromFile) === 'undefined')
        {
            console.log("ERROR: Cannot require module. Require NodeJS Support");
            return "undefined";
        }
        var new_env = create_new_environment();
        var content = readStringFromFile(stack_param[0]);
        var l = lexer(content);
        var p = parser(l);
        eval_begin(p, new_env);
        return new_env[1];
    },
    // get function docstring
    "get-function-doc":function(stack_param)
    {
        return stack_param[0].docstring;
    },
    "set-function-doc":function(stack_param) /* set docstring to function */
    {
        stack_param[0].docstring = stack_param[1]; return "undefined";
    },
    /*
    "sys":function(stack_param)
    {
        if(typeof(systemCommand) === 'undefined')
        {
            console.log("ERROR: Cannot exec system command. Require NodeJs Support");
            return "undefined";
        }
        return systemCommand(stack_param[0]);
        // return "undefined";
    },*/
    "input":function(stack_param)
    {
        return TOY_getINPUT(stack_param); // this function should be written by u, which is supposed to return string
    },
    // check whether variable exists
    "__undefined?__":function(stack_param) // where stack_param[1] is env
    {
        var var_name = stack_param[0];
        var env = stack_param[1];
        for(var i = 0; i < env.length; i++)
        {
            if(var_name in env[i])
                return null;
        }
        return "true";
    },
    "true":"true", "false":null,
    "def":"def","set!":"set!","cond":"cond","if":"if","quote":"quote","quasiquote":"quasiquote","lambda":"lambda","defmacro":"defmacro", /*"while":"while",*/
    "virtual_file_system":{} /* this is virtual file system used to save code as virtual file */
}
/*
    For TOY_getINPUT function.
    I wrote this one for example
    suppose the platform is browser...
    return string
*/
function TOY_getINPUT(stack_param)
{
    if(typeof(prompt) === "undefined")
    {
        console.log("ERROR: prompt function is not defined in current javascript scope.")
        console.log("You need to rewrite 'function TOY_getINPUT(stack_param)' by yourself and return string format of output")
        return "undefined";
    }
    if(stack_param.length == 0)
        return prompt("");
    else
        return prompt(stack_param[0]);
}
/*
    create a new environment
*/  
var create_new_environment = function()
{
    // return [primitive_builtin_functions];
    return [primitive_builtin_functions, {}];
}
var ENVIRONMENT = create_new_environment();
/*
var x = "(def x 12) (def y `(~x x))";
var l = lexer(x);
var p = parser(l);
var o = eval_begin(p, ENVIRONMENT);*/
// console.log(o)
// console.log(ENVIRONMENT);


// exports to Nodejs 
if (typeof(module)!="undefined"){
    module.exports.lexer = lexer;
    module.exports.parser = parser ;
    module.exports.eval_begin = eval_begin;
    module.exports.display = function(x){primitive_builtin_functions["display"]([x])}
    module.exports.env = ENVIRONMENT;
}

/*
    content from toy.toy
*/
var RUN_FIRST = '(def (list . args) args) (set! + (let (vector o_+ + +_iter (lambda (vector result args) (cond ((null? args) result) (else (+_iter (o_+ result (car args)) (cdr args)))))) (lambda (vector . args) (cond ((null? args) (display ("ERROR : Function + invalid parameters. Please provide parameters"))) (else (+_iter (car args) (cdr args))))))) (set! - (let (vector o_- - -_iter (lambda (vector result args) (cond ((null? args) result) (else (-_iter (o_- result (car args)) (cdr args)))))) (lambda (vector . args) (cond ((null? args) (display ("ERROR : Function - invalid parameters. Please provide parameters"))) ((null? (cdr args)) (o_- 0 (car args))) (else (-_iter (car args) (cdr args))))))) (set! * (let (vector o_* * *_iter (lambda (vector result args) (cond ((null? args) result) (else (*_iter (o_* (car args) result) (cdr args)))))) (lambda (vector . args) (cond ((null? args) (display ("ERROR : Function * invalid parameters. Please provide parameters"))) (else (*_iter (car args) (cdr args))))))) (set! / (let (vector o_div / div_iter (lambda (vector result args) (cond ((null? args) result) (else (div_iter (o_div result (car args)) (cdr args)))))) (lambda (vector . args) (cond ((null? args) (display ("ERROR : Function / invalid parameters. Please provide parameters"))) ((null? (cdr args)) (o_div 1 (car args))) (else (div_iter (car args) (cdr args))))))) (def #t "true") (def #f ()) (def nil ()) (def (factorial n) (if (eq? n 0) 1 (* n (factorial (- n 1))))) (set! factorial (lambda (vector n) (def (factorial-acc n acc) (if (eq? n 0) acc (factorial-acc (- n 1) (* acc n)))) (factorial-acc n 1))) (def (or__ args) (cond ((null? args) false) ((eval (car args)) true) (else (or__ (cdr args))))) (defmacro or (vector . args) (quasiquote (or__ (quote (unquote args))))) (def (and__ args) (cond ((null? args) true) ((eval (car args)) (and__ (cdr args))) (else ()))) (defmacro and (vector . args) (quasiquote (and__ (quote (unquote args))))) (def (> arg0 arg1) (< arg1 arg0)) (def (<= arg0 arg1) (or (< arg0 arg1) (eq? arg0 arg1))) (def (>= arg0 arg1) (or (> arg0 arg1) (eq? arg0 arg1))) (set! < (let (vector old-< < <-iter (lambda (vector args cur) (if (null? args) true (if (old-< cur (car args)) (<-iter (cdr args) (car args)) false)))) (lambda (vector . args) (if (null? args) (display "Please provide arguments for <") (<-iter (cdr args) (car args)))))) (set! > (let (vector old-> > >-iter (lambda (vector args cur) (if (null? args) true (if (old-> cur (car args)) (>-iter (cdr args) (car args)) false)))) (lambda (vector . args) (if (null? args) (display "Please provide arguments for >") (>-iter (cdr args) (car args)))))) (set! eq? (let (vector old-eq? eq? eq?-iter (lambda (vector args cur) (if (null? args) true (if (old-eq? cur (car args)) (eq?-iter (cdr args) (car args)) false)))) (lambda (vector . args) (if (null? args) (display "Please provide arguments for eq?") (eq?-iter (cdr args) (car args)))))) (set! <= (let (vector old-<= <= <=-iter (lambda (vector args cur) (if (null? args) true (if (old-<= cur (car args)) (<=-iter (cdr args) (car args)) false)))) (lambda (vector . args) (if (null? args) (display "Please provide arguments for <=") (<=-iter (cdr args) (car args)))))) (set! >= (let (vector old->= >= >=-iter (lambda (vector args cur) (if (null? args) true (if (old->= cur (car args)) (>=-iter (cdr args) (car args)) false)))) (lambda (vector . args) (if (null? args) (display "Please provide arguments for >=") (>=-iter (cdr args) (car args)))))) (def (not arg0) (if arg0 false true)) (def (pair? arg) (eq? (typeof arg) (quote list))) (def (list? arg) pair?) (def (atom? arg) (eq? (typeof arg) (quote atom))) (def string? atom?) (def (vector? arg) (eq? (typeof arg) (quote vector))) (def (dictionary? arg) (eq? (typeof arg) (quote dictionary))) (def (undefined? arg) (eq? arg (quote undefined))) (def (procedure? arg) (eq? (typeof arg) (quote procedure))) (def (function? arg) procedure?) (def (macro? arg) (eq? (typeof arg) (quote macro))) (def ** (math :pow)) (def ^ (math :pow)) (assoc! math :log (lambda (vector x y) (/ ((math :loge) y) ((math :loge) x)))) (assoc! math :sec (lambda (vector x) (/ 1 ((math :cos) x)))) (assoc! math :csc (lambda (vector x) (/ 1 ((math :sin) x)))) (assoc! math :cot (lambda (vector x) (/ 1 ((math :tan) x)))) (def (% n0 n1) (let (vector result (->int (/ n0 n1))) (- n0 (* result n1)))) (def (append a b) (if (null? a) b (cons (car a) (append (cdr a) b)))) (def (reverse l) (def (reverse-iter result l) (if (null? l) result (reverse-iter (cons (car l) result) (cdr l)))) (reverse-iter () l)) (defmacro defn (vector fn_name args . body) (list (quote def) fn_name (cons (quote lambda) (cons args body)))) (defmacro comment (vector . args) ()) (def (map func . args) (def length (len (car args))) (def (get-args-list args i) (if (null? args) () (cons (ref (car args) i) (get-args-list (cdr args) i)))) (def (map-iter func args i) (cond ((eq? i length) ()) (else (cons (apply func (get-args-list args i)) (map-iter func args (+ i 1)))))) (map-iter func args 0)) (def (str . args) (def (str-iter result args) (if (null? args) result (str-iter (+ result (->str (car args))) (cdr args)))) (str-iter "" args)) (def (->float num) (* num 1.0000000000)) (def (->int num) (cond ((eq? num 0) 0) ((> num 0) ((math :floor) num)) (else ((math :ceil) num)))) (def (diff func diff-at-point :error 0.0000010000) (def (diff_ error) (/ (- (func diff-at-point) (func (- diff-at-point error))) error)) (diff_ error)) (def (integral func a b :dx 0.0100000000) (def (sum term a next b) (if (> a b) 0 (+ (term a) (sum term (next a) next b)))) (def (add-dx x) (+ x dx)) (* (sum func (+ a (/ dx 2.0000000000)) add-dx b) dx)) (def (set-car x value) (cons value (cdr x))) (def (set-cdr x value) (cons (car x) value)) (set! undefined? (lambda (vector var-name) (__undefined?__ var-name (get-env)))) (def (make-gensym) (let (vector count 0 step 1 set-name (lambda (vector) (set! count (+ count step)) (let (vector var-name (str "t_" count)) (if (undefined? var-name) var-name (set-name))))) set-name)) (def gensym (make-gensym))'
eval_begin(parser(lexer(RUN_FIRST)), ENVIRONMENT);





















