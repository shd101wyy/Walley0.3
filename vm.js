/*

	virtual machine
	opcode

	first element is opcode
	(def x 12)
	(set 0 0 (const INTEGER 12))

	(set! x 15)
	(set 0 0 (const INTEGER 12))

	(add 3 4) ;; suppose add is in 0 1
	(call 0 1 (set 1 0 (const INTEGER 3)) (set 1 1(const INTEGER 4))) ;; push frame

	(def (add a) a)
	(set 0 1 (param-num 1) (get 1 0)) ;; param num, get 1 0 save to accumulator
*/
/*
	Contruct Toy Language Data Types
*/
var TYPE_INTEGER = 1;
var TYPE_FLOAT = 2;
var TYPE_PAIR = 3;
var TYPE_VECTOR = 4;
var TYPE_OBJECT = 5;
var TYPE_STRING = 6;
var TYPE_LAMBDA = 7;
var TYPE_BUILTIN_LAMBDA = 8;
var TYPE_NULL = 0;

var Value = function(){
    this.type = 0; // this can be changed using set-data-type
    this.num; 	   // int/float
    this.cons;	   // pair
    this.vector;   // vector
    this.object;   // object
    this.lambda;   // lambda
    this.string;   // string
    this.builtin_lambda; // builtin_lambda
    //this.user_defined_type = null; // user defined data type.
}

var make_null = function(){
    var v = new Value();
    v.type = TYPE_NULL;
    return v;
}
var make_string = function(s){
    var v = new Value();
    v.type = TYPE_STRING;
    v.string = s;
    return v;
}

var Cons = function(car_, cdr_)
{
    this.car = car_; this.cdr = cdr_;
}
/*
  create cons data type
*/
var cons = function(v0, v1)
{
    var v = new Value(); // create Value
    v.cons = new Cons(v0, v1); 
    v.type = TYPE_PAIR;
    return v;
    // return new Cons(v0, v1);
}

var Builtin_Primitive_Procedure = function(func)
{
    this.func = func;
}
var bpp = function(func){
    var v = new Value();
    v.type = TYPE_BUILTIN_LAMBDA;
    v.builtin_lambda = func;
    return v;
    // return new Builtin_Primitive_Procedure(func)
}; // create Builtin_Primitive_Procedure

var Lambda = function(param_num, variadic_place, start_pc, env)
{
    this.param_num = param_num;
    this.variadic_place = variadic_place;
    this.start_pc = start_pc;
    this.env = env;
}
/*
  create lambda data type
*/
var make_lambda = function(param_num, variadic_place, start_pc, env){
    var l = new Lambda(param_num, variadic_place, start_pc, env);
    var v = new Value();
    v.type = TYPE_LAMBDA;
    v.lambda = l;
    return v;
}
/*
  this saved lambda is for tail call optimization and compilation
*/
var Lambda_for_Compilation = function(param_num, variadic_place, start_pc, vt){
    this.param_num = param_num;
    this.variadic_place = variadic_place;
    this.start_pc = start_pc;
    this.vt = vt;
}

/*
  create integer data type
*/
var make_integer = function(num){
    var v = new Value();
    v.num = num;
    v.type = TYPE_INTEGER;
    return v;
}
/*
  create float data type
*/
var make_float = function(num){
    var v = new Value();
    v.num = num;
    v.type = TYPE_FLOAT;
    return v;
}
var Macro = function(macro_name, clauses, variable_table){
    this.macro_name = macro_name;
    this.clauses = clauses;
    this.vt = variable_table;
}

/*
  注意。这里的environmen以
  [[1], ["hello"]...] 的形式储存数据
  C语言可用dereference
*/
/*
  var Environment = function(env)
  {
  this.env = env;
  this.esp = env.length - 1; // point to toppest element
  this.push = function(v)
  {
  this.env[this.esp + 1] = [v];
  this.esp += 1;
  }
  this.pop = function()
  {
  var v = this.env[this.esp][0];
  this.esp -= 1;
  return v;
  }
  }*/
var car = function(o)
{	return o.cons.car;
	// return o.car;
}
var cdr = function(o)
{   return o.cons.cdr;
    //return o.cdr;
}

var cadr = function(o){return car(cdr(o))};
var caddr = function(o){return car(cdr(cdr(o)))};
var cadddr = function(o){return car(cdr(cdr(cdr(o))))};
var cdddr = function(o){return cdr(cdr(cdr(o)))};
var cddr = function(o){return cdr(cdr(o))};

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
    return (n==="0" || /^[1-9][0-9]*$/.test(n) || /^0x[0-9A-F]*$/.test(n) || /^0[1-9][0-9]*$/.test(n)) }
var isFloat = function(n){return isNumber(n) && !(isInteger(n))}
/*
  suppose list, number, symbol
*/
var lexer_iter = function(input_string, index)
{
    if (index >= input_string.length) return  make_null();
    else if (input_string[index] == "(" || input_string[index] == ")")
	return cons(input_string[index], lexer_iter(input_string, index + 1));
    else if (input_string[index] == " " || input_string[index] == "\n" || input_string[index] == "\t" || input_string[index] == ",")
	return lexer_iter(input_string, index + 1);
    else if (input_string[index] == "#" && (input_string[index + 1] == "[" || input_string[index + 1] == "(")) // vector
	return cons("(", cons("vector", lexer_iter(input_string, index + 2)));
    else if (input_string[index] == "{") // object
	return cons("(", cons("object", lexer_iter(input_string, index + 1)));
    else if (input_string[index] == "[" || input_string[index] == "{") return cons("(", lexer_iter(input_string, index + 1));
    else if (input_string[index] == "]" || input_string[index] == "}") return cons(")", lexer_iter(input_string, index + 1));
    else if (input_string[index] == "~" && input_string[index+1] == "@")
	return cons("~@", lexer_iter(input_string, index + 2));
    else if (input_string[index] == "'" || input_string[index] == "`" || input_string[index] == "~")
	return cons(input_string[index], lexer_iter(input_string, index+1));
    else if (input_string[index] == ";"){ // comment
	var i = index;
	while(i != input_string.length){
	    if(input_string[i] == "\n") break;
	    i++;
	}
	return lexer_iter(input_string, i);
    }
    else if(input_string[index] === '"'){
	var i = index + 1;
	while(i != input_string.length){
	    if(input_string[i] === "\\") {i = i + 2; continue;}
	    if(input_string[i] === "\"") break;
	    i++
	}
	return cons(input_string.slice(index, i + 1), 
		    lexer_iter(input_string, i + 1));
    }
    // get number symbol
    var end = index;
    while(true)
    {
	if (end === input_string.length
	    || input_string[end] === " " || input_string[end] === "\n" || input_string[end] === "\t" || input_string[end] === ","
	    || input_string[end] === ")" || input_string[end] === "("
	    || input_string[end] === "]" || input_string[end] === "[" || input_string[end] === "{" || input_string[end] === "}"
	    || input_string[end] === "'" || input_string[end] === "`" || input_string[end] === "~" || input_string[end] === ";")
	    break;
	end+=1;
    }
    return cons(input_string.slice(index, end), lexer_iter(input_string, end));
}
var lexer = function(input_string)
{
    return lexer_iter(input_string, 0);
}
/*
  simple parser
*/
var parser_rest =  make_null();
var formatQuickAccess = function(ns, keys)
{
    var formatQuickAccess_iter = function(keys, output, count)
    {
        if(count === keys.length)
            return output;
        return formatQuickAccess_iter(keys, cons(output, cons(cons("quote", cons(keys[count],  make_null())),  make_null())), count + 1);
    }
    return formatQuickAccess_iter(keys, cons(ns, cons(cons("quote", cons(keys[0],  make_null())),  make_null())), 1);
}
var parser_symbol_or_number = function(v){
    if(v[0] === '"') return v;
    var splitted_ = v.split(":");
    if(v === ":"  || splitted_.length == 1 || v[0] === ":" || v[v.length-1] === ":") //  : :abc abc: 
	return v
    var ns = splitted_[0]; // eg x:a => ns 'x'  keys ['a']
    var keys = splitted_.slice(1);
    var formatted_ = formatQuickAccess(ns, keys); // eg x:a => (x :a)
    return formatted_;
}
var parser_special = function(l)
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
        return cons(tag, cons(parser_list(cdr(l)),  make_null()));
    }
    else if (car(l) === "'" || car(l) === "~" || car(l) === "`")  // quote unquote quasiquote
    {   // here my be some errors
        return cons(tag, cons(parser_special(l),  make_null()));
    }
    else  // symbol or number
    {
        parser_rest = cdr(l);
        return cons(tag, cons(parser_symbol_or_number(car(l)),  make_null()));
    }
}
var parser_list = function(l)
{
    if(l.type === TYPE_NULL)
    {
	console.log("ERROR: invalid statement. Missing )");
	parser_rest =  make_null();
	return  make_null();
    }
    if(car(l) == ")") // find end
    {
	parser_rest = cdr(l);
	return  make_null();
    }
    else if (car(l) == "(") // another list
    {
	return cons(parser_list(cdr(l)),
		    parser_list(parser_rest));
    }
    else if (car(l) === "'" || car(l) === "~" || car(l) === "`" || car(l) === "~@")  // quote unquote quasiquote unquote-splice
    {
        return cons(parser_special(l), parser_list(parser_rest));
    }
    else // symbol number
    {
	return cons(parser_symbol_or_number(car(l)),
		    parser_list(cdr(l)));
    }
}
var parser = function(l)
{
    if(l.type === TYPE_NULL)
	return  make_null();
    else if (car(l) == "(")
	return cons(parser_list(cdr(l)), parser(parser_rest));
    // quote // unquote // quasiquote // unquote-splice
    else if (car(l) === "'" || car(l) === "~" || car(l) === "`" || car(l) === "~@")
        return cons(parser_special(l), parser(parser_rest));
    else // symbol number
	return cons(parser_symbol_or_number(car(l)), parser(cdr(l)));
}

/*
  Opcode
*/
var SET = 0x0;
var GET = 0x1;

var CONST = 0x2;
var CONST_INTEGER = 0x2100;
var CONST_FLOAT   = 0x2200;
var CONST_STRING  = 0x2300;
var CONST_NULL    = 0x2400;

var MAKELAMBDA = 0x3;
var RETURN = 0x4;
var NEWFRAME = 0x5;
var PUSH_ARG = 0x6;
var CALL = 0x7;
var JMP = 0x8;
var TEST = 0x9;


var INSTRUCTIONS = []; // global variables. used to save instructions


var _4_digits_hex = function(num)
{
    return ("0000" + num.toString(16)).substr(-4);
}
var printInstructions = function()
{
    var num = 1;
    var str = "";
    for(var i = 0; i < INSTRUCTIONS.length; i++)
    {
	str = str + _4_digits_hex(INSTRUCTIONS[i]) + " ";
	if(num % 4 == 0)
	{
	    console.log(str);
	    str = "";
	}
	num++;
    }
    console.log(str);
}

// GLOBAL VARIABLES
// used to save variable name
var VARIABLE_TABLE = [
    // frame 0
    ["cons", "car", "cdr", "vector", "vector-ref", "vector-set!",
     "vector-length", "vector?", "+", "-", "*", "/", "=",
     "<", ">", "<=", ">=", "eq?", "string?", "int?",
     "float?", "pair?", "null?", 
     "string<?", "string=?", "string-ref", "string-slice", "string-length",
     "vector-slice", "acos", "acosh", "asin", "asinh", "atan", "atanh",
     "ceil", "cos", "cosh", "exp", "floor", "loge", "pow", "sin", "sinh",
     "tan", "tanh", "display-string", "->int", "->float", "int->string", "float->string",
     "string-append", "lambda?", "vector-push!", "vector-pop!", "object", "object?", "object-keys",
     "bitwise-and", "bitwise-or", "bitwise-<<", "bitwise->>", "bitwise-not", "bitwise-xor", 
     "string->char-code", "char-code->string", "int->string-16", "string->int", "string->float"
    ]
];
var MACROS = [[]]; // used to save macros
var BUILTIN_PRIMITIVE_PROCEDURE_NUM = VARIABLE_TABLE[0].length;

// variable environment
var ENVIRONMENT =
    [
	// frame 0
	[
	    bpp(function(stack_param)
		{ // 0 cons
	    	    return cons(stack_param[0], stack_param[1]);
		    //return new Cons(stack_param[0], stack_param[1]);
		}),
	    
	    bpp(function(stack_param)
		{ // 1 car
		    return car(stack_param[0]);
		}),
	    bpp(function(stack_param)
		{ // 2 cdr
		    return cdr(stack_param[0]);
		}),

	    bpp(function(stack_param)
		{ // 3 vector
	    	    var v = new Value();
	    	    v.type = TYPE_VECTOR;
	    	    v.vector = stack_param;
	    	    return v;
		}),
	    bpp(function(stack_param)
		{ // 4 vector-ref
		    return stack_param[0].vector[stack_param[1].num];
		}),
	    bpp(function(stack_param)
		{ // 5 vector-set!
		    stack_param[0].vector[stack_param[1].num] = stack_param[2];   return stack_param[2];
		}),
	    bpp(function(stack_param)
		{ // 6 vector-length
		    return make_integer(stack_param[0].vector.length)
		}),
	    bpp(function(stack_param)
		{ // 7 vector?
		    if(stack_param[0].type === TYPE_VECTOR) return make_string("true");
		    return make_null();
		}),
	    bpp(function(stack_param)
		{ // 8 +
		    if (stack_param[0].type === TYPE_FLOAT || stack_param[1].type === TYPE_FLOAT)
			return make_float(stack_param[0].num + stack_param[1].num);
		    return make_integer(stack_param[0].num + stack_param[1].num);
		}),
	    bpp(function(stack_param)
		{ // 9 -
		    if (stack_param[0].type === TYPE_FLOAT || stack_param[1].type === TYPE_FLOAT)
			return make_float(stack_param[0].num - stack_param[1].num);
		    return make_integer(stack_param[0].num - stack_param[1].num);
		}),
	    bpp(function(stack_param)
		{ // 10 *
		    if (stack_param[0].type === TYPE_FLOAT || stack_param[1].type === TYPE_FLOAT)
			return make_float(stack_param[0].num * stack_param[1].num);
		    return make_integer(stack_param[0].num * stack_param[1].num);
		}),
	    bpp(function(stack_param)
		{ // 11 /
		    if (stack_param[0].type === TYPE_FLOAT || stack_param[1].type === TYPE_FLOAT)
			return make_float(stack_param[0].num / stack_param[1].num);
		    return make_integer(stack_param[0].num / stack_param[1].num);
		}),
	    bpp(function(stack_param)
		{ // 12 = only for number
		    if (stack_param[0].num == stack_param[1].num)
			return make_string("true");
		    return make_null();
		}),
	    bpp(function(stack_param)
		{ // 13 < only for number
		    if (stack_param[0].num < stack_param[1].num)
			return make_string("true");
		    return make_null();
		}),
	    bpp(function(stack_param)
		{ // 14 > only for number
		    if (stack_param[0].num > stack_param[1].num)
			return make_string("true");
		    return make_null();
		}),
	    bpp(function(stack_param)
		{ // 15 <= only for number
		    if (stack_param[0].num <= stack_param[1].num)
			return make_string("true");
		    return make_null();
		}),
	    bpp(function(stack_param)
		{ // 16 >= only for number
		    if (stack_param[0].num >= stack_param[1].num)
			return make_string("true");
		    return make_null();
		}),
	    bpp(function(stack_param)
		{ // 17 eq?
		    if ((stack_param[0].type === TYPE_INTEGER || stack_param[0].type === TYPE_FLOAT) // check number
			&& (stack_param[1].type === TYPE_INTEGER || stack_param[1].type === TYPE_FLOAT))
		    {
			if(stack_param[0].num === stack_param[1].num) return make_string("true");
			return make_null();
		    }
		    else if (stack_param[0].type === TYPE_STRING && stack_param[1].type === TYPE_STRING)
			return stack_param[0].string === stack_param[1].string ? make_string("true"):make_null();
		    return stack_param[0] === stack_param[1] ? make_string("true"):make_null();
		}),
	    bpp(function(stack_param)
		{ // 18 string?
		    if(stack_param[0].type === TYPE_STRING)
			return make_string("true");
		    return make_null();
		}),
	    bpp(function(stack_param)
		{ // 19 int?
		    if(stack_param[0].type === TYPE_INTEGER)
			return make_string("true");
		    return make_null();
		}),
	    bpp(function(stack_param)
		{ // 20 float?
		    if(stack_param[0].type === TYPE_FLOAT)
			return make_string("true");
		    return make_null();
		}),
	    bpp(function(stack_param)
		{ // 21 pair?
		    if(stack_param[0].type === TYPE_PAIR)
			return make_string("true");
		    return make_null();
		}),
	    bpp(function(stack_param)
		{ // 22 null?
		    if(stack_param[0].type === TYPE_NULL)
			return make_string("true");
		    return make_null();
		}), 
	    bpp(function(stack_param){
		// 23 string<?
		if(stack_param[0].string < stack_param[1].string) return make_string("true");
		return make_null();
	    }),
	    bpp(function(stack_param){
		// 24 string=?
		if(stack_param[0].string === stack_param[1].string) return make_string("true"); return make_null();
	    }),
	    bpp(function(stack_param){
		// 25 string-ref
		var v = new Value();
		v.type = TYPE_STRING;
		v.string = stack_param[0].string[stack_param[1].num]; 
		return v;
	    }),
	    bpp(function(stack_param){
		// 26 string-slice
		var v = new Value();
		v.type = TYPE_STRING;
		v.string = stack_param[0].string.slice(stack_param[1].num, stack_param[2].num);
		return v;
	    }),
	    bpp(function(stack_param){
		// 27 string-length
		return make_integer(stack_param[0].string.length);
	    }),
	    bpp(function(stack_param){
		// 28 vector-slice
		return stack_param[0].vector.slice(stack_param[1].num, stack_param[2].num);
	    }),
	    bpp(function(stack_param){
		// 29 acos
		return make_float(Math.acos(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 30 acosh
		return make_float(Math.acosh(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 31 asin
		return make_float(Math.asin(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 32 asinh
		return make_float(Math.asinh(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 33 atan
		return make_float(Math.atan(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 34 atanh
		return make_float(Math.atanh(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 35 ceil
		return make_float(Math.ceil(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 36 cos
		return make_float(Math.cos(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 37 cosh
		return make_float(Math.cosh(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 38 exp
		return make_float(Math.exp(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 39 floor
		return make_float(Math.floor(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 40 loge
		return make_float(Math.log(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 41 pow
		return make_float(Math.pow(stack_param[0].num, stack_param[1].num));
	    }),
	    bpp(function(stack_param){
		// 42 sin
		return make_float(Math.sin(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 43 sinh
		return make_float(Math.sinh(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 44 tan
		return make_float(Math.tan(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 45 tanh
		return make_float(Math.tanh(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 46 display-string
		console.log(stack_param[0].string);
		return make_null();
	    }),
	    bpp(function(stack_param){
		// 47 ->int
		return make_integer(parseInt(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 48 ->float
		return make_float(parseFloat(stack_param[0].num));
	    }),
	    bpp(function(stack_param){
		// 49 int->string
		var v = new Value();
		v.type = TYPE_STRING;
		v.string = "" + stack_param[0].num;
	   	return v;
	    }),
	    bpp(function(stack_param){
		// 50 float->string
 		var v = new Value();
		v.type = TYPE_STRING;
		v.string = "" + stack_param[0].num;
	   	return v;	
	    }), 
	    bpp(function(stack_param){
		// 51 string-append
		var v = new Value();
		v.type = TYPE_STRING;
		v.string = stack_param[0].string + stack_param[1].string;
		return v;
	    }),
	    bpp(function(stack_param){
		// 52 lambda?
		if(stack_param[0].type === TYPE_LAMBDA || stack_param[0].type === TYPE_BUILTIN_LAMBDA)
	    	    return make_string("true");
		return make_null();
	    }),
	    bpp(function(stack_param){
		// 53 vector-push!
		stack_param[0].vector.push(stack_param[1]);
		return stack_param[0];
	    }),
	    bpp(function(stack_param){
		// 54 vector-pop!
		var c = stack_param[0].vector.pop();
		return c;
	    }),
	    bpp(function(stack_param){
		// 55 object
		var key;
		var value;
		//var output = {type: "object"}; // preserved
		var output = {};
		for(var i = 0; i < stack_param.length; i=i+2){
	    	    key = stack_param[i];
	    	    if(stack_param[i].type !== TYPE_STRING){
	    		console.log("ERROR: object invalid key");
	    		return make_null();
	    	    }
	    	    value = stack_param[i+1];
	    	    output[key.string] = value;
		}
		var v = new Value();
		v.type = TYPE_OBJECT;
		v.object = output;
		return v;;
	    }),
	    bpp(function(stack_param){
		// 56 object?
		return stack_param[0].type === TYPE_OBJECT ? make_string("true") : make_null();
	    }),
	    bpp(function(stack_param){
		// 57 object-keys
		// return cons
		var c = make_null();
		var keys =  Object.keys(stack_param[0].object);
		for(var i = keys.length - 1; i >= 0; i--){
	    	    var v_ = new Value();
	    	    v_.type = TYPE_STRING;
	    	    v_.string = keys[i];
	    	    c = cons(v_, c);
		}
		return c;
		//return Object.keys(stack_param[0].object)
	    }),
	    bpp(function(stack_param){
		// 58 bitwise-and 
		return make_integer(stack_param[0].num & stack_param[1].num);
	    }),
	    bpp(function(stack_param){
		// 59 bitwise-or 
		return make_integer(stack_param[0].num | stack_param[1].num);
	    }),
	    bpp(function(stack_param){
		// 60 bitwise-<< 
		return make_integer(stack_param[0].num << stack_param[1].num);
	    }),
	    bpp(function(stack_param){
		// 61 bitwise->> 
		return make_integer(stack_param[0].num >> stack_param[1].num);
	    }),
	    bpp(function(stack_param){
		// 62 bitwise-not 
		return make_integer(~stack_param[0].num);
	    }),
	    bpp(function(stack_param){
		// 63 bitwise-xor 
		return make_integer(stack_param[0].num ^ stack_param[1].num);
	    }),
	    bpp(function(stack_param){
		// 64 string->char-code 
		return make_integer(stack_param[0].string.charCodeAt(stack_param[1].num));
	    }),
	    bpp(function(stack_param){
		// 65 char-code->string
		var v = new Value();
		v.type = TYPE_STRING;
		v.string = String.fromCharCode( stack_param[0].num );
		return v;
	    }),
	    bpp(function(stack_param){
		// 66 	int->string-16
		return make_string(stack_param[0].num.toString(16));
	    }),
	    bpp(function(stack_param){
		// 67 string->int
		return make_integer(parseInt(stack_param[0].string));
	    }),
	    bpp(function(stack_param){
		// 68 string->float
		return make_integer(parseFloat(stack_param[0].string));
	    })
	]
    ];


var vt_find = function(vt, var_name) // find variable
{
    for(var i = vt.length - 1; i>=0; i--){
	var frame = vt[i];
	for(var j = frame.length - 1; j>=0; j--){
	    if(frame[j] === var_name){
		return [i, j];
	    }
	}
    }
    return [-1, -1];
}

var list_to_array = function(l) // convert list to array
{
    var return_array = [];
    while(l.type !== TYPE_NULL)
    {
	return_array.push(car(l));
	l = cdr(l);
    }
    return return_array;
}
/*
  list_append:
  '(3 4) '(5 6) => '(3 4 5 6)
*/
var list_append = function(a, b){
    if(a.type === TYPE_NULL) return b;
    return cons(car(a), list_append(cdr(a), b));
}
/*
  check whether macro_match
  eg:
  [a b] [3 4] matches
*/
var macro_match = function(a, b){
    var macro_match_iter = function(a, b, output){
	if(a.type === TYPE_NULL && b.type === TYPE_NULL) return output; // finish matching
	else if((a.type === TYPE_NULL  && b.type !== TYPE_NULL) || ( a.type !== TYPE_NULL && b.type === TYPE_NULL)) // doesnt match
	    return false;
	else if (car(a).type === TYPE_PAIR && car(b).type === TYPE_PAIR){
	    var m = macro_match_iter(car(a), car(b), output);
	    if(m === false) return false; // doesnt match
	    return macro_match_iter(cdr(a), cdr(b), output);
	}
	else if (car(a).type === TYPE_PAIR && !(car(b).type === TYPE_PAIR)) return false;
	else{
	    if (car(a)[0] === "#"){ // constant
		if(car(a).slice(1) === car(b)) return macro_match_iter(cdr(a), cdr(b), output);
		else return false;
	    }
	    if(car(a) === "."){
		output[cadr(a)] = b;
		return output;
	    }
	    output[car(a)] = car(b);
	    return macro_match_iter(cdr(a), cdr(b), output);
	}
    }
    var output = {};
    return macro_match_iter(a, b, output);
}
/*
  eg (* ~x ~x) {:x 12} => (* 12 12)
*/
var macro_expand_with_arg_value = function(body, t){
    if(body.type === TYPE_NULL) return make_null();
    else if(car(body) === "unquote"){
	if(cadr(body) in t){
	    return t[cadr(body)];
	}
	return body;
    }
    else if ((car(body).type === TYPE_PAIR) && (car(car(body)) === "unquote-splice")){
	var n = cadr( car(body) );
	if(n in t){
	    var v = t[n];
	    return list_append(v, 
			       macro_expand_with_arg_value(cdr(body), t));
	}
	return cons(body,
		    macro_expand_with_arg_value(cdr(body), t));
    }
    else if(car(body).type === TYPE_PAIR){ // cons
	return cons(macro_expand_with_arg_value(car(body), t), 
		    macro_expand_with_arg_value(cdr(body), t));
    }
    return cons(car(body), 
		macro_expand_with_arg_value(cdr(body), t))
}
var macro_expand = function(macro, exps){
    var clauses = macro.clauses;
    while(clauses.type !== TYPE_NULL){
	var match = macro_match(car(car(clauses)), exps);
	if(match === false) {
	    clauses = cdr(clauses); continue;
	}
	else{ // match
	    return macro_expand_with_arg_value(cadr(car(clauses)), match);
	}
    }
    console.log("ERROR: Macro: " + macro.macro_name + " expansion failed" );
    return make_null();
}
/* 
   macro_expand_for_compilation

   this function is different from the function above,
   it will replace also replace value which is not arg
   eg:
   (defm test [x] [list ~x]) will also replace "list" => (test 12) => ((0 frame_index value_index) 12) 
   here 0 is integer, different with string
*/
var macro_expand_with_arg_value_for_compilation = function(body, t, vt, macros, start_flag){
    if(body.type === TYPE_NULL) return make_null();
    else if(car(body) === "unquote"){ // this place might have problem
	if(cadr(body) in t){
	    return t[cadr(body)];
	}
	var i = vt_find(vt, cadr(body)); // search vt
	if(i[0] === -1)
	    return body;
	return cons(0, cons(i[0], cons(i[1], make_null()))); // get that variable

    }
    else if ((car(body).type === TYPE_PAIR) && (car(car(body)) === "unquote-splice")){
	var n = cadr( car(body) );
	if(n in t){
	    var v = t[n];
	    return list_append(v, 
			       macro_expand_with_arg_value_for_compilation(cdr(body), t, vt, macros, false));
	}
	return cons(body,
		    macro_expand_with_arg_value_for_compilation(cdr(body), t, vt, macros, false));
    }
    else if(car(body).type === TYPE_PAIR){ // cons
	return cons(macro_expand_with_arg_value_for_compilation(car(body), t, vt, macros, true), 
		    macro_expand_with_arg_value_for_compilation(cdr(body), t, vt, macros, false));
    }
    var v = car(body);
    // check v in macro, if v in macro, then
    if(/*&v[0] !== "#" &&*/ start_flag){
	for(var i = macros.length - 1; i >= 0; i--){
	    var frame = macros[i];
	    for(var j = frame.length - 1; j >= 0; j--){
		if(frame[j].macro_name === v){ // find macro
		    return cons(car(body),  // so dont replace
				macro_expand_with_arg_value_for_compilation(cdr(body), t, vt, macros, false));
		}
	    }
	}
    }
    //if(v[0] === "#" && start_flag){ // # means this is not macro.
    //	v = v.slice(1);
    //}

    var i = vt_find(vt, v);
    if(i[0] === -1) // didnt find
	return cons(car(body), 
		    macro_expand_with_arg_value_for_compilation(cdr(body), t, vt, macros, false));
    else{
	return cons(
	    cons(0, cons(i[0], cons(i[1], make_null()))), // get that variable
	    macro_expand_with_arg_value_for_compilation(cdr(body), t, vt, macros, false));
    }
}
var macro_expand_for_compilation = function(macro, exps, macros){
    var clauses = macro.clauses;
    while(clauses.type !== TYPE_NULL){
	var match = macro_match(car(car(clauses)), exps);
	if(match === false) {
	    clauses = cdr(clauses); continue;
	}
	else{ // match
	    return macro_expand_with_arg_value_for_compilation(cadr(car(clauses)), match, macro.vt, macros, true);
	}
    }
    console.log("ERROR: Macro: " + macro.macro_name + " expansion failed" );
    return make_null();
}
/*
  parent func name:
  eg (def (f n) (f 12)) when calling (f 12), its parent_func_name is "f"
  (def (f1 n) (f2 12)) when calling (f2 12), its parent_func_name is "f1"
*/	
var compiler = function(l, vt, macros, tail_call_flag, parent_func_name, functions_for_compilation){
    if(l.type === TYPE_NULL){
	INSTRUCTIONS.push(CONST_NULL); // push null
	return;
    }
    if(typeof(l) === "string"){
	if(l.type === TYPE_NULL){
	    INSTRUCTIONS.push( CONST_NULL);
	    return;
	}
	// check number
	else if(isInteger(l)) // 32 bit integer
	{
	    var i = parseInt(l);
	    //if(i > 0x7FFFFFFF){
	    //	console.log("ERROR: Integer too big");
	    // 	INSTRUCTIONS = [];
	    //	return;
	    //}
	    if(i < 0){
		return compiler(cons("-", cons("0", cons(l.slice(1), make_null()))), vt, macros, tail_call_flag, parent_func_name, functions_for_compilation)
	    }
	    
	    INSTRUCTIONS.push( CONST_INTEGER );
	    //INSTRUCTIONS.push( /*(0xFFFF000000000000 & i) >> 48*/ (i / Math.pow(2, 48) & 0xFFFF) );
	    //INSTRUCTIONS.push( /*(0x0000FFFF00000000 & i) >> 32*/ (i / Math.pow(2, 32) & 0xFFFF) );
	    INSTRUCTIONS.push( (0xFFFF0000 & i) >> 16 );
	    INSTRUCTIONS.push(  0xFFFF & i );
	    return;
	}
	/*
	  First 16 bits: integer
	  Second 16 bits: float
	*/
	else if(isFloat(l)){
	    var f = parseFloat(l);
	    if(f < 0){
		return compiler(cons("-", cons("0", cons(l.slice(1), make_null()))), vt, macros, tail_call_flag, parent_func_name, functions_for_compilation)
	    }
	    var i = parseInt(f);
	    INSTRUCTIONS.push(CONST_FLOAT);
	    //INSTRUCTIONS.push((i >> 16) & 0x0000FFFF);
	    INSTRUCTIONS.push(i & 0x0000FFFF);

	    // decimals 10 digits
	    // 10 ^ 10
	    var d = parseInt((f - i) * /*Math.pow(10, 9) 1000000000*/10000);
	    //INSTRUCTIONS.push((d >> 16) & 0x0000FFFF);
	    INSTRUCTIONS.push(d & 0x0000FFFF);
	    // if(i > 0xFFFF | d > 0xFFFF){
	    //	console.log("ERROR: Float so big");
	    //	INSTRUCTIONS = [];
	    //	return;
	    //}
	    return;
	}
	// string
	else if (l[0] === '"'){
	    var s = eval(l);
	    var length = s.length;
	    INSTRUCTIONS.push(CONST_STRING); // create string
	    INSTRUCTIONS.push(length + 1);       // push string length
	    var find_end = false;
	    for(var i = 0; i < length; i = i + 2){
		if( i + 1 === length){
		    INSTRUCTIONS.push(s.charCodeAt(i) << 8 & 0xFF00);
		    find_end = true;
		    break;
		}
		else{
		    INSTRUCTIONS.push(s.charCodeAt(i) << 8 | s.charCodeAt(i+1));
		}
	    }
	    if(find_end === false)
	    {
		INSTRUCTIONS.push(0x0000); // add end
	    }
	    return;
	}
	else{
	    // it is not number
	    // get variable index
	    var index = vt_find(vt, l);
	    if(index[0] == -1){
		INSTRUCTIONS = []; // clear instructions
		console.log("ERROR: undefined variable: " + l);
		return;
	    }

	    INSTRUCTIONS.push(GET << 12 | index[0]); // frame index
	    INSTRUCTIONS.push(index[1]);             // value index
	    return;
	}
    }
    else if (l.type === TYPE_PAIR){
	var tag = car(l);
	if(typeof(tag) === "number" && tag === 0){ // get for macro
	    INSTRUCTIONS.push(GET << 12 | cadr(l));
	    INSTRUCTIONS.push(caddr(l));
	    return;
	}
	// quote
	if (tag === "quote"){
	    var v = cadr(l);
	    // check integer float string null
	    if(v.type === TYPE_NULL || isInteger(v) || isFloat(v) || v[0] === '"')
		return compiler(v, vt, macros, tail_call_flag, parent_func_name, functions_for_compilation);
	    else if (v.type === TYPE_PAIR) // pair
	    {
		var quote_list = function(l)
	        {
	            if(l.type === TYPE_NULL) return make_null();
	            var v = car(l);
	            //if(typeof(v) === "string" && v[0] === '"') v = eval(v);
	            if(v.type === TYPE_PAIR) return cons("cons", cons(/*cons(*/quote_list(v)/*, null)*/, cons(quote_list(cdr(l)), make_null())));
	            else if (v === ".") return cons("quote", cons(cadr(l), make_null()));
	            return cons("cons", cons(cons("quote", cons(v, make_null())),  cons(quote_list(cdr(l)), make_null())));
	        }
	        return compiler(quote_list(v), vt, macros, tail_call_flag, parent_func_name, functions_for_compilation);
	    }
	    // symbol/string
	    else if(v[0]!='"')
	    {
		v = '"'+v+'"'
		return compiler(v, vt, macros, tail_call_flag, parent_func_name, functions_for_compilation);
	    }
	    return;
	}
	else if (tag == "quasiquote"){ // add quasiquote
	    var v = cadr(l);
	    // check integer
	    // check integer float string null
	    if(v.type === TYPE_NULL || isInteger(v) || isFloat(v) || v[0] === '"')
		return compiler(v, vt, macros, tail_call_flag, parent_func_name, functions_for_compilation);
	    else if (v.type === TYPE_PAIR) // pair
	    {
		var quasiquote = function(l)
	        {
	            if(l.type === TYPE_NULL) return make_null();
	            var v = car(l);
	            //if(typeof(v) === "string" && v[0] === '"') v = eval(v);
	            if(v.type === TYPE_PAIR)
	            {
	                if(car(v) === "unquote")
	                    return cons("cons", cons(cadr(v), cons(quasiquote(cdr(l)), make_null())));
	                else if (car(v) === "unquote-splice")
	                    return cons("append", cons(cadr(v), cons(quasiquote(cdr(l)), make_null())));
	                return cons("cons", cons(quasiquote(v), cons(quasiquote(cdr(l)), make_null())));
	            }
	            else if (v === ".") return cons("quote", cons(cadr(l), make_null()));
	            return cons("cons", cons( cons("quote", cons(v, make_null())), cons(quasiquote(cdr(l)), make_null())));
	        }
	        return compiler(quasiquote(v), vt, macros, tail_call_flag, parent_func_name, functions_for_compilation);
	    }
	    // symbol/string
	    else if(v[0]!='"')
	    {
		v = '"'+v+'"'
		return compiler(v, vt, macros, tail_call_flag, parent_func_name, functions_for_compilation);
	    }
	    return ;
	}

	// (def x 12) (def (add a b) (+ a b)) => (def add (lambda [a b] (+ a b)))
	else if(tag == "def"){
	    var variable_name = cadr(l);
	    if(variable_name.type === TYPE_PAIR) // it is lambda format like (def (add a b) (+ a b))
	    {
		var var_name = car(variable_name);
		var args = cdr(variable_name);
		var lambda = cons("lambda", cons(args, cddr(l)));
		return compiler(cons("def", cons(var_name, cons(lambda, make_null()))),
				vt,
				macros,
				tail_call_flag,
				parent_func_name,
				functions_for_compilation);
	    }

	    var variable_value;
	    if(cddr(l).type === TYPE_NULL)
		variable_value = make_null();
	    else
		variable_value = caddr(l);

 	    // check whether variable already defined
 	    var variable_existed = false;
 	    var variable_index = -1;
	    var frame = vt[vt.length - 1];
	    for(var j = frame.length - 1; j >= 0; j--){
		if(variable_name === frame[j]){
		    //INSTRUCTIONS = []; // clear instructions
		    //console.log("ERROR: variable: "+variable_name+" already defined");
		    //return;
		    variable_index = j 
		    variable_existed = true;
		    break;
		}

	    }
	    if(variable_existed === false)
		vt[vt.length - 1].push(variable_name); // add var name to variable table
	    if(variable_value.type === TYPE_PAIR && car(variable_value) === "lambda"){
		parent_func_name = variable_name;  // set parent_func_name
	    }
	    // compile value
	    compiler(variable_value, vt, macros, tail_call_flag, parent_func_name, functions_for_compilation);

	    // add instruction
	    INSTRUCTIONS.push( SET << 12  | vt.length - 1);   // frame index
	    INSTRUCTIONS.push( 0x0000FFFF & ( variable_existed ? variable_index : vt[vt.length - 1].length - 1)); // value index
	    return;
	}
	// set!
	else if(tag == "set!"){
	    var variable_name = cadr(l);
	    var variable_value = caddr(l);
	    var index = vt_find(vt, variable_name);
	    if(index[0] === -1)
	    {
		// set! error
		console.log("SET! ERROR");
		return;
	    }
	    else
	    {
		if(variable_value.type === TYPE_PAIR && car(variable_value) === "lambda"){
		    parent_func_name = variable_name;  // set parent_func_name
		}
		compiler(variable_value, vt, macros, tail_call_flag, parent_func_name, functions_for_compilation)// compile value
		INSTRUCTIONS.push( SET << 12 | (0x0FFF & index[0])); // frame index
		INSTRUCTIONS.push(0x0000FFFF & index[1]); // value index
		return;
	    }
	}
	// (if test conseq alter)
	else if (tag === "if"){
	    var test = cadr(l);
	    var conseq = caddr(l);
	    var alter;
	    if(cdddr(l).type === TYPE_NULL)
		alter = make_null();
	    else
		alter = cadddr(l);

	    compiler(test, vt, macros, false, parent_func_name, functions_for_compilation); // compile test, the test is not tail call
	    var index1 = INSTRUCTIONS.length;
	    // push test, but now we don't know jump steps
	    INSTRUCTIONS.push(0x0000); // jump over consequence

	    /*
	      I changed this to compiler_begin for tail_call optimization
	    */
	    //var vt_0 = vt.slice(0, vt.length-1);
	    //vt_0.push(vt[vt.length-1].slice(0));
	    compiler_begin(cons(conseq, make_null()), vt, macros, tail_call_flag, parent_func_name, functions_for_compilation);
	    // compiler(conseq, vt, macros, tail_call_flag, parent_func_name); // compiler consequence;
	    var index2 = INSTRUCTIONS.length;
	    INSTRUCTIONS.push(0x0000); // jump over alternative

	    var jump_steps = index2 - index1 + 1;
	    INSTRUCTIONS[index1] = (TEST << 12) | jump_steps;

	    //var vt_1 = vt.slice(0, vt.length - 1);
	    //vt_1.push(vt[vt.length-1].slice(0));
	    compiler_begin(cons(alter, make_null()), vt, macros, tail_call_flag, parent_func_name, functions_for_compilation);
	    // compiler(alter, vt, macros, tail_call_flag, parent_func_name); // compiler alternative;
	    var index3 = INSTRUCTIONS.length;
	    jump_steps = index3 - index2;
	    INSTRUCTIONS[index2] = (JMP << 12) | (jump_steps > 0 ? (0) : (1 << 11)) | jump_steps; // I think the jump_steps is always > 0
	    return;
	}
	else if (tag === "begin"){ // begin
	    compiler_begin(cdr(l), vt, macros, tail_call_flag, parent_func_name, functions_for_compilation);
	    return;
	}
	// (let [a 1 b 2] body)
	/*
	  else if (tag === "let")
	  {
	  var vt_ = vt.slice(0);
	  vt_[vt_.length - 1] = vt_[vt_.length - 1].slice(0);
	  var body = cddr(l);
	  var vs = cadr(l);
	  var start_index = vt_[vt_.length - 1].length;

	  // compile values
	  while(vs!==null)
	  {
	  var var_name = car(vs);
	  var var_val = cadr(vs);
	  var already_defined = false;
	  var var_index = -1;
	  for(var i = start_index; i < vt_[vt_.length - 1].length; i++){
	  if(vt_[vt_.length - 1][i] === var_name){ // already defined
	  already_defined = true;
	  var_index = i;
	  break;
	  }
	  }
	  if(!already_defined){
	  var_index = vt_[vt_.length - 1].length;
	  vt_[vt_.length - 1].push(var_name);
	  compiler(var_val, vt_, macros, tail_call_flag, parent_func_name);
	  INSTRUCTIONS.push( SET << 12 | (0x0FFF & vt_.length - 1)); // frame index
	  INSTRUCTIONS.push(0x0000FFFF & var_index); // value index
	  }
	  else{ // var already defined
	  compiler(var_val, vt_, macros, tail_call_flag, parent_func_name);
	  INSTRUCTIONS.push( SET << 12 | (0x0FFF & vt_.length - 1)); // frame index
	  INSTRUCTIONS.push(0x0000FFFF & var_index); // value index
	  }
	  vs = cdr(cdr(vs));
	  }

	  // compile body
	  compiler_begin(body, vt_, macros, parent_func_name);
	  }*/
	// cond
	// (cond (t0 body0) (t1 body1) ... (else ))
	/*else if (tag === "cond"){
	    var cond_clauses = cdr(l);
	    var expand_clauses = function(clauses){
		if(clauses.type === TYPE_NULL)
		    return make_null();
		var first = car(clauses);
		var rest = cdr(clauses);
		if(car(first) === "else"){
		    if(rest.type === TYPE_NULL){
			return cons("begin", cdr(first));
		    }
		    else{
			console.log("ERROR: else clause isn't the last\n");
			INSTRUCTIONS = [];
			return;
		    }
		}
		else{
		    var body = cons("begin", cdr(first));
		    return cons("if", cons(car(first), cons(body, cons(expand_clauses(rest), null))));
		}
	    }
	    return compiler(expand_clauses(cond_clauses), vt, macros, tail_call_flag, parent_func_name, functions_for_compilation);
	}*/
	// (lambda (a b) ...)
	// (lambda (a . b) ...)
	else if (tag === "lambda"){
	    var params = cadr(l); // get parameters
	    var variadic_place = -1; // variadic place
	    var counter = 0; // count of parameter num
	    var vt_ = vt.slice(0); // new variable table
	    var macros_ = macros.slice(0); // new macro table
	    vt_.push([])          // we add a new frame
	    macros_.push([]);     // add new frame

	    vt_[vt_.length - 1].push(make_null()); // save space for parent-env.
	    vt_[vt_.length - 1].push(make_null()); // save space for return address.

	    while(true){
		if(params.type === TYPE_NULL) break;
		if(car(params) === ".") // variadic
		{
		    variadic_place = counter;
		    vt_[vt_.length - 1].push(cadr(params));
		    counter += 1; // means no parameters requirement
		    break;
		}
		vt_[vt_.length - 1].push(car(params));
		counter+=1;
		params = cdr(params);
	    }


	    // make lambda
	    INSTRUCTIONS.push(MAKELAMBDA << 12 | (counter << 6) | (variadic_place === -1? 0x0000 : (variadic_place << 1)) | (variadic_place === -1? 0x0000 : 0x0001));
	    var index1 = INSTRUCTIONS.length;
	    INSTRUCTIONS.push(0x0000); // steps that needed to jump over lambda
	    
	    // for tail call optimization
	    var start_pc = INSTRUCTIONS.length; // get start_pc

	    // compile_body
	    var c_body = compiler_begin(cddr(l), vt_, macros_, parent_func_name, new Lambda_for_Compilation(counter, variadic_place, start_pc, vt_)); // set parent_func_name to null
	    // return
	    INSTRUCTIONS.push(RETURN << 12 | 0x0001); // return and flag(see documentation)

	    var index2 = INSTRUCTIONS.length;
	    INSTRUCTIONS[index1] = index2 - index1; // set jump steps
	    return;
	}
	// macro
	else if (tag === "defmacro"){
	    var var_name = cadr(l);
	    var clauses = cddr(l);
	    var already_defined = false;
	    for(var i = macros[macros.length - 1].length - 1; i>=0; i--){
		if(var_name === macros[macros.length - 1][i].macro_name){ // macro already exists
		    already_defined = true;
		    macros[macros.length - 1][i].clauses = clauses;
		}	
	    }
	    if(already_defined === false){ // not defined, save macro
		macros[macros.length - 1].push(new Macro(var_name, clauses, vt.slice(0)));
	    }
	    return;
	}
	// macroexpand-1
	else if (tag === "macroexpand-1"){
	    var expand = cadr(l);
	    var macro_name = car(expand);
	    for(var i = macros.length - 1; i >= 0; i--){
		var frame = macros[i];
		for(var j = frame.length - 1; j >= 0; j--){
		    if(frame[j].macro_name === macro_name){
			var e = cons("quote", cons(macro_expand(frame[j], cdr(expand)), make_null()));
			return compiler(e, 
					vt,
					macros,
					tail_call_flag,
					parent_func_name,
					functions_for_compilation);
		    }
		}
	    }
	    console.log("ERROR: macroexpand-1 invalid macro: " + macro_name);
	    INSTRUCTIONS = [];
	    return;
	}
	// return
	else if (tag === "return"){
	    compiler(cdr(l).type === TYPE_NULL? make_null() : cadr(l), vt, macros, tail_call_flag, parent_func_name, functions_for_compilation);
	    INSTRUCTIONS.push(RETURN << 12);
	    return;
	}
	// call function
	else{ 
	    // check whether macro
	    var func = car(l);
	    if(typeof(func) === "string"){
		for(var i = macros.length - 1; i >= 0; i--){
		    var frame = macros[i];
		    for(var j = frame.length - 1; j >= 0; j--){
			if(frame[j].macro_name === func){
			    return compiler(macro_expand_for_compilation(frame[j], cdr(l), macros),
					    /*frame[j].vt,*/ vt,
					    macros,
					    tail_call_flag,
					    parent_func_name,
					    functions_for_compilation)
			}
		    }
		}
	    }
	    // tail call
	    if(tail_call_flag){
		// so no new frame				
		var start_index = vt[vt.length - 1].length;
		var track_index = start_index;
		// compile parameters
		var param_num = 0;
		var params = cdr(l);
		// push parameter from right to left
		params = list_to_array(params); // convert list to array
		param_num = params.length;  // get param num
		var count_params = 0; // count param num
		/* compile parameters */
		for(var i = 0; i < param_num; i++){
		    if(i === functions_for_compilation.variadic_place){ // variadic param
			count_params++;
			var p = make_null();
			var j = param_num - 1;
			for(; j >= i; j--){
			    p = cons("cons", cons(params[j], cons(p, make_null())));
			}
			compiler(p, vt, macros, false, parent_func_name, functions_for_compilation); // each argument is not tail call
			// set to current frame
			INSTRUCTIONS.push( SET << 12  | vt.length - 1);   // frame index
			INSTRUCTIONS.push( 0x0000FFFF & track_index); // value index
		    }
		    else{
			count_params++;
			compiler(params[i], vt, macros, false, parent_func_name, functions_for_compilation); // each argument is not tail call
			// set to current frame
			INSTRUCTIONS.push( SET << 12  | vt.length - 1);   // frame index
			INSTRUCTIONS.push( 0x0000FFFF & track_index); // value index
		    }
		    track_index++;
		}
		// move parameters 
		for(var i = 0; i < count_params; i++){
		    // get value
		    INSTRUCTIONS.push(GET << 12 | vt.length - 1); // frame index
		    INSTRUCTIONS.push(start_index + i);           // value index
		    // move to target index
		    INSTRUCTIONS.push( SET << 12  | vt.length - 1);   // frame index
		    INSTRUCTIONS.push(i + 2) 						  // value index
		}
		if(functions_for_compilation.variadic_place === -1 && i < functions_for_compilation.param_num){
		    for(; i < functions_for_compilation.param_num; i++){
			INSTRUCTIONS.push(CONST_NULL << 12);
			// move to target index
			INSTRUCTIONS.push( SET << 12  | vt.length - 1);   // frame index
			INSTRUCTIONS.push(i + 2);         	
		    }
		}
		// jump back
		var start_pc = functions_for_compilation.start_pc; // start pc for that lambda
		var jump_steps = -(INSTRUCTIONS.length - start_pc); // jump steps
		INSTRUCTIONS.push((JMP << 12) | (jump_steps > 0 ? 0 : (1 << 11)) | (jump_steps > 0 ? jump_steps : -jump_steps ));
		return;
	    }
	    // not tail call
	    else{
		INSTRUCTIONS.push(NEWFRAME << 12); // create new frame and set flag
		// compile parameters
		var param_num = 0;
		var params = cdr(l);
		// push parameter from right to left
		params = list_to_array(params); // convert list to array
		param_num = params.length;  // get param num
		for( var i = 0; i < param_num; i++) // compile parameter from ---right to left---, now from left to right
		{
		    compiler(params[i], vt, macros, false, parent_func_name, functions_for_compilation); // each argument is not tail call
		    INSTRUCTIONS.push(PUSH_ARG << 12 | (i+2)); // push parameter to new frame
		}

		compiler(func, vt, macros, false, parent_func_name, functions_for_compilation); // compile lambda, save to accumulator

		INSTRUCTIONS.push(CALL << 12 | (0x0FFF & (param_num))); // call function.
		return;
	    }
	}
    }
}

var compiler_begin = function(l, vt, macros, parent_func_name, functions_for_compilation)
{
    if(typeof(parent_func_name) === "undefined") parent_func_name = make_null();
    if(typeof(functions_for_compilation) === "undefined") functions_for_compilation = make_null();
    // console.log("parent_func_name: " + parent_func_name);
    while(l.type !== TYPE_NULL)
    {
	if(cdr(l).type === TYPE_NULL && car(l).type === TYPE_PAIR && car(car(l)) === parent_func_name){
	    // console.log("Tail Call");
	    compiler(car(l), vt, macros, 1, make_null(), functions_for_compilation) // tail call
	}
	else 
	    compiler(car(l), vt, macros, 0, parent_func_name, functions_for_compilation) // not tail call;
	l = cdr(l);
    }
    /*
      var opcode = (INSTRUCTIONS[INSTRUCTIONS.length - 1] & 0xF000) >> 12;
      if(opcode === CALL)
      {
      console.log("TAIL CALL");
      INSTRUCTIONS[INSTRUCTIONS.length - 1] = INSTRUCTIONS[INSTRUCTIONS.length - 1] | 0x0001; // add tail call flag
      }*/
    return;
}


var VM = function(INSTRUCTIONS, env, pc)
{
    if(typeof(pc) === "undefined") pc = 0;
    var accumulator = make_null(); // accumulator
    var length_of_insts = INSTRUCTIONS.length;
    var current_frame_pointer = make_null(); // pointer that points to current new frame
    var frame_list = cons(make_null(), make_null()); // stack used to save frames    head frame1 frame0 tail, queue
    while(pc !== length_of_insts)
    {
	var inst = INSTRUCTIONS[pc];
	var opcode = (inst & 0xF000) >> 12;
	switch(opcode){
	case CONST:
	    {
		switch(inst){
		case CONST_INTEGER: // integer
		    {
			//accumulator = (INSTRUCTIONS[pc + 1] * /*Math.pow(2, 48)*/ 281474976710656)+  // couldn't shift left 48
			//		  (INSTRUCTIONS[pc + 2] * /*Math.pow(2, 32)*/ 4294967296)+
			//		  (INSTRUCTIONS[pc + 3] * /*Math.pow(2, 16)*/ 65536) +
			//		   INSTRUCTIONS[pc + 4] - (INSTRUCTIONS[pc + 1] & 0x8000) * Math.pow(2, 64);
			accumulator = (INSTRUCTIONS[pc+1] << 16) + INSTRUCTIONS[pc+2];
			accumulator = make_integer(accumulator);
			pc = pc + 3;//5;
			// console.log("INT accumulator=> " + accumulator.num);
			continue;
		    }
		case CONST_FLOAT:
		    {
			//accumulator = (INSTRUCTIONS[pc + 1] * /*Math.pow(2, 16)*/65536)+
			//		  (INSTRUCTIONS[pc + 2])
			//		  - (INSTRUCTIONS[pc + 1] & 0x8000) * Math.pow(2, 32);
			// console.log((INSTRUCTIONS[pc + 3] * Math.pow(2, 16)) + (INSTRUCTIONS[pc + 4]))
			//accumulator = accumulator + ((INSTRUCTIONS[pc + 3] * /*Math.pow(2, 16)*/65536) + (INSTRUCTIONS[pc + 4])) / /*Math.pow(10, 9)*/1000000000
			accumulator = INSTRUCTIONS[pc + 1] + INSTRUCTIONS[pc+2]/10000.0
			accumulator = make_float(accumulator);
			pc = pc + 3;//5;
			// console.log("FLOAT accumulator=> " + accumulator);
			continue;
		    }
		case CONST_STRING:
		    {
			var length = INSTRUCTIONS[pc + 1]; // length used to create string. for C language in the future
			var created_string = "";
			var s;
			pc = pc + 2;
			while(true)
			{
			    s = INSTRUCTIONS[pc];
			    var s1 = (0xFF00 & s) >> 8;
			    var s2 = (0x00FF & s);
			    if(s1 === 0x00) // reach end
				break;
			    else
				created_string += String.fromCharCode(s1);
			    if(s2 === 0x00) // reach end
				break;
			    else
				created_string += String.fromCharCode(s2);
			    pc = pc + 1;
			}
			// create string
			accumulator = make_string(created_string);
			//accumulator = created_string;
			// console.log("CREATED_STRING: |"+created_string+"|");
			pc = pc + 1;
			continue;
		    }
		default: // null
		    {	
			accumulator = make_null();
			pc = pc + 1;
			// console.log("NULL: ");
			continue;
		    }
		}
	    }
	case PUSH_ARG: // push to environment
	    {
		// console.log("PUSH_ARG");
		current_frame_pointer[0x0FFF & inst] = accumulator; // push to current frame
		pc = pc + 1;
		continue;
	    }
	case TEST: // test
	    {
		if(accumulator.type === TYPE_NULL) // false, jump
		{
		    pc = pc + (0x0FFF & inst);
		    continue;
		}
		// run next
		pc = pc + 1;
		continue;
	    }
	case JMP: // jump
	    {
		var jump_steps = 0x07FF & inst;
		var negative_flag = 0x0800 & inst;
		if(negative_flag) jump_steps = - jump_steps;
		if(jump_steps >> 11 === 1)
		    jump_steps -= Math.pow(2, 16);
		pc = pc + jump_steps;
		continue;
	    }
	case SET: // set
	    {
		// console.log("SET");
		var frame_index = 0x0FFF & inst;               // get frame index
		var value_index = INSTRUCTIONS[pc + 1];        // get value index
		env[frame_index][value_index] = accumulator;
		pc = pc + 2;
		continue;
	    }
	case GET: // get
	    {
		var frame_index = 0x0FFF & inst;
		var value_index = INSTRUCTIONS[pc + 1];
		accumulator = env[frame_index][value_index];
		pc = pc + 2;
		continue;
	    }
	case MAKELAMBDA: // make lambda
	    {
		// console.log("MAKELAMBDA");
		var param_num= (0x0FC0 & inst) >> 6;
		var variadic_place = (0x0001 & inst) ? ((0x003E & inst) >> 1) : -1;
		var start_pc = pc + 2;
		var jump_steps = INSTRUCTIONS[pc + 1];

		// accumulator = new Lambda(param_num, variadic_place, start_pc, env.slice(0)); // set lambda
		accumulator = make_lambda(param_num, variadic_place, start_pc, env.slice(0)); // set lambda
		pc = pc + jump_steps + 1;
		continue;
	    }
	case CALL: // call function
	    {
		// console.log("CALL FUNCTION");
		var param_num = (0x0FFF & inst); // get param num, including return_address.
		var lambda;

		// console.log("LAMBDA:");
		// console.log(vm_env)
		// console.log(lambda);
		// console.log("PARAM NUM: " + param_num);
		// a();

		if(accumulator.type === TYPE_BUILTIN_LAMBDA){ // builtin lambda
		    lambda = accumulator.builtin_lambda;
		    pc = pc + 1;
		    accumulator = lambda(current_frame_pointer.slice(2)); // remove saved env and pc
		    frame_list = cdr(frame_list); // pop top frame
		    current_frame_pointer = car(frame_list) // update frame_pointer
		    continue;
		}
		if(accumulator.type === TYPE_OBJECT){ // object
		    lambda = accumulator.object;
		    pc = pc + 1;
		    p0 = current_frame_pointer[2];
		    p1 = current_frame_pointer[3];
		    if(typeof(p1) === 'undefined'){
			accumulator = lambda[p0.string];
			if(typeof(accumulator) === "undefined")
			    accumulator = make_null();
		    }
		    else{
			lambda[p0.string] = p1;
			accumulator = lambda;
		    }
		    frame_list = cdr(frame_list); // pop top frame
		    current_frame_pointer = car(frame_list) // update frame_pointer
		    continue;
		}

		lambda = accumulator.lambda; // user defined lambda
		// user defined lambda
		var required_param_num = lambda.param_num;
		var required_variadic_place = lambda.variadic_place;
		var start_pc = lambda.start_pc;
		var new_env;
		

		new_env = lambda.env.slice(0);
		new_env.push(current_frame_pointer);
		current_frame_pointer[0] = env; // save current env to new-frame
		current_frame_pointer[1] = pc + 1; // save pc

		if(required_variadic_place === -1 && param_num - 1 > required_param_num){
		    console.log("ERROR: Too many parameters provided");
		    return;
		}
		if(required_variadic_place !== -1){ // variadic value
		    var v = make_null();
		    for(var i = current_frame_pointer.length - 1; i >= required_variadic_place + 2; i--){
			v = cons(current_frame_pointer[i], v);
		    }	
		    current_frame_pointer[required_variadic_place + 2] = v;
		}

		// console.log("REQUIRED_PARAM_NUM " + lambda.param_num);
		// console.log("REQUIRED_VARIADIC_NUM " + lambda.variadic_place);
		// console.log("START_PC " + lambda.start_pc);
		// console.log("OLD_PC   " + (pc + 1));

		if(current_frame_pointer.length - 2 < required_param_num) // not enough parameters
		{
		    for(var i = param_num; i < required_param_num; i++){
			current_frame_pointer[i + 2] = make_null(); // default value is null
		    }
		}
		
		env = new_env;         // change env pointer
		pc = start_pc;         // begin to call function
		frame_list = cdr(frame_list) // update frame list
		current_frame_pointer = car(frame_list);
		continue;
	    }
	case NEWFRAME: // create new frame
	    { // create new frame
		var new_frame = [];
		frame_list = cons(new_frame, frame_list);
		current_frame_pointer = new_frame;
		pc = pc + 1;
		continue;
	    }
	case RETURN: // return
	    { // return
		// restore pc and env
		pc = env[env.length - 1][1];
		env = env[env.length - 1][0];
		// update current_frame_pointer
		//current_frame_pointer = car(frame_list);
		continue;
	    }
	default:
	    console.log("ERROR: Invalid opcode");
	    return make_null();
	}
    }
    console.log("Finishing running VM");
    console.log(accumulator);
    return accumulator;
}

// var l = lexer("((lambda [x] (+ x 1)) 12)")
// var l = lexer("(def (test x) (def a 12) (+ x a)) (test 14)")
// var l = lexer("(def (x a b . c) (+ a (+ b (car (cdr c))))) (x 3 4 5 6)")
// var l = lexer("(def (test a) (cons 'b a)) (test 'c)")
// var l = lexer("(def (x) (def a 12) (lambda (msg) (if (eq? msg 'a) a (set! a 10) ))) (def b (x)) (b 'b) (b 'a)")
// var l = lexer(' (def (f n) (if (= n 0) 1 (* n (f (- n 1))))) (f 20)');
// var l = lexer(' (def (f a . b) (+ a (car b))) (f 30 25 40)');
// var l = lexer("(def (test a) a) (test 12)")
// var l = lexer("(begin (def x 12) (def y 15) x)") 
// var l = lexer("(def (test) (def a 12) (lambda [msg] (if (= msg 0) a (set! a 15)))) (def a (test)) (a 1)(a 0)")
// var l = lexer("(def (append x y) (if (null? x) y (cons (car x) (append (cdr x) y))))")
// var l = lexer("(def x #[1,2,3]) (vector-slice x 1 2)")
// var l = lexer("(let [x 0 y 2 x (+ y 1)] (+ x y)) ")
// var l = lexer("(cond (() 2) (() 4) (else 5) )")
// var l = lexer("(defmacro square ([x] [* ~x ~x])) (square 12) (macroexpand-1 (square 15))");
// var l = lexer("(if () 2 (if 3 4 5))")
// var l = lexer("(pow 2 3)");
// var l = lexer("(defmacro test ([a . b] [quote ~b])) (macroexpand-1 (test 3 4 5))")
// var l = lexer("(quote (a (b c) d))")
// var l = lexer("(def (f n result) (if (= n 0) result (f (- n 1) (* n result)))) (f 100 1)")
// var l = lexer("(if () 2 3)")
// var l = lexer("(defmacro defm ([macro_name p b] [defmacro ~macro_name (~p ~b)])) (defm square [x] [* ~x ~x]) (square 16)")
// var l = lexer("(defmacro square ([x] [* ~x ~x])) (square 12)")
//var l = lexer("(def (factorial n result) (if (= n 0) result (factorial (- n 1) (* n result)) )) (factorial 150 1)");
//var l = lexer("(def (test n) (test n)")
//var l = lexer("(cons 1 ())")
//var l = lexer("(def x 12)");
//console.log(l);
//var o = parser(l);
//console.log(o);
//console.log(car(cdr(cdr(car(o)))))
//var p = compiler_begin(o, VARIABLE_TABLE, MACROS, null, null);

//console.log(VARIABLE_TABLE);
//printInstructions(INSTRUCTIONS);
//console.log(VM(INSTRUCTIONS, ENVIRONMENT))
//console.log(ENVIRONMENT);

// var p = compiler_begin(o, Variable_Table);
// console.log(p);
//console.log(vm(p, Environment, null));

// exports to Nodejs 
if (typeof(module)!="undefined"){
    module.exports.vm_lexer = lexer;
    module.exports.vm_parser = parser ;
    module.exports.vm_compiler_begin = compiler_begin;
    module.exports.vm = VM;
    module.exports.vm_env = ENVIRONMENT;
    module.exports.vm_vt = VARIABLE_TABLE;
    module.exports.vm_insts = INSTRUCTIONS;
}















