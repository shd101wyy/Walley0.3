/*

    Toy Language to JavaScritp compiler

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
var Procedure = function(args, body, closure_env)
{
    this.args = args;
    this.body = body;
    this.closure_env = closure_env;
    this.TYPE = PROCEDURE;
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
var car = function(l){return l.car};
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
    var find_final_comment_index = function(input_str, i) // find end index of comment
    {
        if(i == input_str.length) return i;
        if(input_str[i]=="\n") return i+1;
        else return find_final_comment_index(input_str, i + 1);
    }
    var find_final_string_index = function(input_str, i)  // find final index of string 
    {
        if(i == input_str.length)
            console.log("ERROR: Incomplete String");
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
        else if(input_str[i]==="'" || input_str[i]=="`" || input_str[i]=="~")
            return cons( input_str[i], lexer_iter(input_str, i + 1));
        else if(input_str[i]==='"')
        {
            var end = find_final_string_index(input_str, i+1);
            return cons(input_str.slice(i, end), lexer_iter(input_str, end))
            // return cons("(", cons("quote", cons(input_str.slice(i, end), cons(")", lexer_iter(input_str, end)))))
        }
        else if(input_str[i]===";")
            return lexer_iter(input_str, find_final_comment_index(input_str, i+1));
        else
        {
            // atom or number
            var end = find_final_number_of_atom_index(input_str, i+1);
            return cons( input_str.slice(i, end) , lexer_iter(input_str, end));
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
        if(car(l) === ")") // finish
        {
            rest = cdr(l);
            return build_nil();
        }
        else if (car(l) === "(") // list
        {
            return cons(parse_list(cdr(l)), parse_list(rest));
        }
        else if (car(l) === "'" || car(l) === "~" || car(l) === "`")  // quote unquote quasiquote
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
    var parse_symbol_or_number = function(l)
    {
        if(l[0]==":")
            return cons("keyword", cons('"'+l.slice(1)+'"', build_nil()))
        else if (isNumber(l))
        {
            if(isInteger(l))
                return new Toy_Number(parseFloat(l), 1, RATIO);
            else return new Toy_Number(parseFloat(l), 1 ,FLOAT);
        }
        else if (isRatio(l))
            return new Toy_Number(parseFloat(getNumerator(l)), parseFloat(getDenominator(l)), RATIO)
        return l;
    }
    // done
    if(l == null)
        return build_nil();
    // list
    else if (car(l) === "(")
    {
        return cons(parse_list(cdr(l)), parser(rest));
    }
    // quote // unquote // quasiquote
    else if (car(l) === "'" || car(l) === "~" || car(l) === "`")
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
    if(num.TYPE === FLOAT) return ""+num.numer.toFixed(5);
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
    console.log("ERROR:Function set!, var name "+var_name+" does not exist");
    return "undefined";
}
var eval_quasiquote = function(list, env)
{
    if(list === null) return null;
    var v = car(list);
    if(typeof(v)==="string") return cons(v, eval_quasiquote(cdr(list), env));
    else if (v.TYPE === LIST)
    {
        if(car(v) === "unquote")
            return cons(toy_eval(cadr(v), env),
                        eval_quasiquote(cdr(list), env));
        return cons(eval_quasiquote(v, env),
                    eval_quasiquote(cdr(list), env))

    }
    return cons(v, eval_quasiquote(cdr(list), env)); 
}
var eval_cond = function(clauses, env)
{
    while(clauses!==null)
    {
        var clause = car(clauses)
        var predicate = car(clause);
        var body = cdr(clause);
        if(predicate == "else" || toy_eval(predicate, env)!==null)
            return eval_begin(body, env)
        clauses = cdr(clauses);
    }
    return null;
}
var eval_lambda = function(lambda_args, lambda_body, env)
{
    if(lambda_args.car!=="vector"){console.log("ERROR: when defining lambda, please use (lambda [args] body) format");return "undefined"}
    lambda_args = cdr(lambda_args);
    return new Procedure(lambda_args, lambda_body, env.slice(0));   
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
    var closure_env = macro.closure_env.slice(0);
    var args = macro.args;
    var body = macro.body;
    var new_frame = {};
    while(args!==null)
    {   var var_name = car(args); 
        if(var_name === ".")
        {
            new_frame[cadr(args)] = params;
            break;
        }
        var var_value = car(params); // does not calculate
        new_frame[var_name] = var_value;
        args = cdr(args); params = cdr(params);
    }
    closure_env.push(new_frame);
    return eval_begin(body, closure_env);
}
var eval_procedure = function(proc, params, env)
{ 
    var closure_env = proc.closure_env.slice(0);
    var args = proc.args;
    var body = proc.body;
    var new_frame = {};
    while(args!==null)
    {   var var_name = car(args);
        if(var_name === ".")
        {
            new_frame[cadr(args)] = eval_list(params, env);
            break;  
        }
        var var_value = toy_eval(car(params), env);
        new_frame[var_name] = var_value;
        args = cdr(args); params = cdr(params);
    }
    closure_env.push(new_frame);
    return eval_begin(body, closure_env);
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
            if(exp[0]==='"')return exp.slice(1, exp.length-1)
            return lookup_env(exp, env);
        }
        else if (exp instanceof Toy_Number)
            return exp;
        else if (exp.TYPE === LIST)
        {
            var tag = car(exp);
            if(tag === "quote")
            {
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
                env.push(new_frame);
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
                return eval_lambda(cadr(exp), cddr(exp), env);
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
                /*
                if(test!==null)
                    return toy_eval(conseq, env);
                return toy_eval(alter, env);
                */
            }
            else if (tag === "cond")
            {
                return eval_cond(cdr(exp), env);
            }
            else if (tag === "begin")
            {
                var body = cdr(exp);
                return eval_begin(body, env);
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
                    var output = []; while(list!==null){output.push(toy_eval(car(list), env)); list = cdr(list)}
                    return output;
                }
               return tag.call(null, eval_list_to_array(cdr(exp), env));
            }
            else if (tag === "macroexpand-1")
            {
                var v = toy_eval(cadr(exp), env);
                return macro_expand(toy_eval(car(v), env),
                                    cdr(v),
                                    env);
            }
            else if (tag === "defmacro")
            {
                var macro = eval_macro(caddr(exp), cdddr(exp), env);
                env[1][cadr(exp)] = macro;
                return macro
            }
            else if (tag === "while")
            {
                var test = cadr(exp);
                var body = cddr(exp);
                while(toy_eval(test, env))
                {
                    eval_begin(body, env);
                }
                return "undefined";
            }
            else if (tag.TYPE === PROCEDURE)
            {   /*
                var proc = tag;var params = cdr(exp);
                var closure_env = proc.closure_env.slice(0);
                var args = proc.args;
                var body = proc.body;
                var new_frame = {};
                while(args!==null)
                {   var var_name = car(args);
                    if(var_name === ".")
                    {
                        new_frame[cadr(args)] = eval_list(params, env);
                        break;  
                    }
                    var var_value = toy_eval(car(params), env);
                    new_frame[var_name] = var_value;
                    args = cdr(args); params = cdr(params);
                }
                closure_env.push(new_frame);

                exp = cons("begin", body);
                env = closure_env;
                continue; */
                return eval_procedure(tag, cdr(exp), env);
            }
            else if (tag.TYPE === MACRO)
            {
                return toy_eval(macro_expand(tag, cdr(exp), env), env);
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
            else if (tag instanceof Object)
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
                if(proc === "undefined")
                {
                    console.log("ERROR:Invalid Function");
                    return "undefined"
                }
                return toy_eval(
                                   application
                                    , env
                                    )
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
    "ratio?":function(param_array){return param_array[0] instanceof Toy_Number && param_array[0].TYPE === RATIO ? 'true':null;},
    "float?":function(param_array){return param_array[0] instanceof Toy_Number && param_array[0].TYPE === FLOAT ? 'true':null;},
    /* get numerator of number */
    "numerator": function(stack_param){ 
        if(stack_param[0] instanceof Toy_Number)
            return new Toy_Number(stack_param[0].numer, 1, RATIO);
        else
            console.log("ERROR:Function numerator wrong type parameters")
        return "undefined"
        },
    "denominator": function(stack_param){ 
        if(stack_param[0] instanceof Toy_Number)
            return new Toy_Number(stack_param[0].denom, 1, RATIO);
        else
            console.log("ERROR:Function numerator wrong type parameters")
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
    "keyword":function(stack_param){return stack_param[0]},
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
            console.log("ERROR:Function ref wrong type parameters")      
    },
    "->str":function(stack_param)
    {
        // change obj to atom
        var v = stack_param[0];
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
            return new ATOM('undefined');
        }
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
        else
        {
            console.log("ERROR: Function slice wrong type parameters")
            return "undefined"
        }
    },
    "display":function(stack_param)
    {
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
    },
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
    "tanh":function(stack_param){return new Toy_Number(Math.tanh(stack_param[0].numer/stack_param[0].denom), 1, FLOAT)},
    "true":"true", "false":null,
    "def":"def","set!":"set!","cond":"cond","if":"if","quote":"quote","quasiquote":"quasiquote","lambda":"lambda","defmacro":"defmacro", "while":"while"
}
/*
    create a new environment
*/  
var create_new_environment = function()
{
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
var RUN_FIRST = '(def (list . args) args) (def o_+ +) (def (+ . args) (def (+_iter result args) (cond ((null? args) result) (else (+_iter (o_+ result (car args)) (cdr args))))) (cond ((null? args) (display "ERROR: Function + invalid parameters. Please provide parameters")) (else (+_iter (car args) (cdr args))))) (def o_- -) (def (- . args) (def (-_iter result args) (cond ((null? args) result) (else (-_iter (o_- result (car args)) (cdr args))))) (cond ((null? args) (display "ERROR: Function - invalid parameters. Please provide parameters")) ((null? (cdr args)) (o_- 0 (car args))) (else (-_iter (car args) (cdr args))))) (def o_* *) (def (* . args) (def (*_iter result args) (cond ((null? args) result) (else (*_iter (o_* (car args) result) (cdr args))))) (cond ((null? args) (display "ERROR: Function * invalid parameters. Please provide parameters")) (else (*_iter (car args) (cdr args))))) (def o_/ /) (def (/ . args) (def length (len args)) (def (/_iter result args) (cond ((null? args) result) (else (/_iter (o_/ result (car args)) (cdr args))))) (cond ((null? args) (display "ERROR: Function / invalid parameters. Please provide parameters")) ((null? (cdr args)) (o_/ 1 (car args))) (else (/_iter (car args) (cdr args))))) (def #t "true") (def #f ()) (def nil ()) (def (factorial n) (if (eq? n 0) 1 (* n (factorial (- n 1))))) (def (factorial n) (def (factorial-acc n acc) (if (eq? n 0) acc (factorial-acc (- n 1) (* acc n)))) (factorial-acc n 1)) (defmacro and (vector arg0 arg1) (quasiquote (if (unquote arg0) (if (unquote arg1) true false) false))) (defmacro or (vector arg0 arg1) (quasiquote (if (unquote arg0) true (if (unquote arg1) true false)))) (def (> arg0 arg1) (< arg1 arg0)) (def (<= arg0 arg1) (or (< arg0 arg1) (eq? arg0 arg1))) (def (>= arg0 arg1) (or (> arg0 arg1) (eq? arg0 arg1))) (def old-< <) (def (< . args) (let (vector <-iter (lambda (vector args cur) (if (null? args) true (if (old-< cur (car args)) (<-iter (cdr args) (car args)) false)))) (if (null? args) (display "Please provide arguments for <") (<-iter (cdr args) (car args))))) (def old-> >) (def (> . args) (let (vector >-iter (lambda (vector args cur) (if (null? args) true (if (old-> cur (car args)) (>-iter (cdr args) (car args)) false)))) (if (null? args) (display "Please provide arguments for >") (>-iter (cdr args) (car args))))) (def old-eq? eq?) (def (eq? . args) (let (vector eq?-iter (lambda (vector args cur) (if (null? args) true (if (old-eq? cur (car args)) (eq?-iter (cdr args) (car args)) false)))) (if (null? args) (display "Please provide arguments for eq?") (eq?-iter (cdr args) (car args))))) (def old-<= <=) (def (<= . args) (let (vector <=-iter (lambda (vector args cur) (if (null? args) true (if (old-<= cur (car args)) (<=-iter (cdr args) (car args)) false)))) (if (null? args) (display "Please provide arguments for <=") (<=-iter (cdr args) (car args))))) (def old->= >=) (def (>= . args) (let (vector >=-iter (lambda (vector args cur) (if (null? args) true (if (old->= cur (car args)) (>=-iter (cdr args) (car args)) false)))) (if (null? args) (display "Please provide arguments for >=") (>=-iter (cdr args) (car args))))) (def (and . args) (def (and-iter args) (if (null? args) true (if (car args) (and-iter (cdr args)) false))) (and-iter args)) (def (or . args) (def (or-iter args) (if (null? args) false (if (car args) true (or-iter (cdr args))))) (or-iter args)) (def (not arg0) (if arg0 false true)) (def (pair? arg) (eq? (typeof arg) (quote list))) (def (list? arg) pair?) (def (integer? arg) (and (ratio? arg) (eq? (denominator arg) 1))) (def (atom? arg) (eq? (typeof arg) (quote atom))) (def (string? arg) atom?) (def (vector? arg) (eq? (typeof arg) (quote vector))) (def (dictionary? arg) (eq? (typeof arg) (quote dictionary))) (def (undefined? arg) (eq? arg (quote undefined))) (def (procedure? arg) (eq? (typeof arg) (quote procedure))) (def (function? arg) procedure?) (def (macro? arg) (eq? (typeof arg) (quote macro))) (def ** pow) (def ^ pow) (def (log x y) (/ (loge y) (loge x))) (def (sec x) (/ 1 (cos x))) (def (csc x) (/ 1 (sin x))) (def (cot x) (/ 1 (tan x)))'

eval_begin(parser(lexer(RUN_FIRST)), ENVIRONMENT);



























