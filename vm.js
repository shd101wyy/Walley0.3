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

var Cons = function(car_, cdr_)
{
	this.car = car_; this.cdr = cdr_;
}
var cons = function(v0, v1)
{
	return new Cons(v0, v1);
}
var Builtin_Primitive_Procedure = function(func)
{
	this.func = func;
}
var bpp = function(func){return new Builtin_Primitive_Procedure(func)}; // create Builtin_Primitive_Procedure

var Lambda = function(param_num, variadic_place, start_pc, env)
{
	this.param_num = param_num;
	this.variadic_place = variadic_place;
	this.start_pc = start_pc;
	this.env = env;
}
var Integer = function(num)
{
	this.num = num | 0;
}
var Float = function(num)
{
	this.num = num;
}
var car = function(o)
{
	return o.car;
}
var cdr = function(o)
{
	return o.cdr;
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
    return (n==="0" || /^[1-9][0-9]*$/.test(n) || /^0x[0-9A-F]{1,4}$/i.test(n) || /^0[1-9][0-9]*$/.test(n)) }
var isFloat = function(n){return isNumber(n) && !(isInteger(n))}
/*
	suppose list, number, symbol
*/
var lexer_iter = function(input_string, index)
{
	if (index == input_string.length) return null;
	if (input_string[index] == "(" || input_string[index] == ")") 
		return cons(input_string[index], lexer_iter(input_string, index + 1));
	if (input_string[index] == " " || input_string[index] == "\n" || input_string[index] == "\t" || input_string[index] == ",")
		return lexer_iter(input_string, index + 1);
	if (input_string[index] == "#" && (input_string[index + 1] == "[" || input_string[index + 1] == "(")) // vector
		return cons("(", cons("vector", lexer_iter(input_string, index + 2)));
	if (input_string[index] == "{") // dictionary
		return cons("(", cons("dictionary", lexer_iter(input_string, index + 1)));
	if (input_string[index] == "[" || input_string[index] == "{") return cons("(", lexer_iter(input_string, index + 1));
	if (input_string[index] == "]" || input_string[index] == "}") return cons(")", lexer_iter(input_string, index + 1));
	if (input_string[index] == "~" && input_string[index+1] == "@")
		return cons("~@", lexer_iter(input_string, index + 2));
	if (input_string[index] == "'" || input_string[index] == "`" || input_string[index] == "~")
		return cons(input_string[index], lexer_iter(input_string, index+1));
	// get number symbol
	var end = index;
	while(true)
	{
		if (end == input_string.length 
			|| input_string[end] == " " || input_string[end] == "\n" || input_string[end] == "\t" || input_string[index] == ","
			|| input_string[end] == ")" || input_string[end] == "(" 
			|| input_string[end] == "]" || input_string[end] == "[" || input_string[end] == "{" || input_string[end] == "}"
			|| input_string[end] == "'" || input_string[end] == "`" || input_string[end] == "~")
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
var parser_rest = null;
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
        return cons(tag, cons(parser_list(cdr(l)), null));
    }
    else if (car(l) === "'" || car(l) === "~" || car(l) === "`")  // quote unquote quasiquote
    {   // here my be some errors
        return cons(tag, cons(parser_special(l), null));
    }
    else  // symbol or number
    {
        parser_rest = cdr(l);
        return cons(tag, cons(car(l), null));
    }
}
var parser_list = function(l)
{
	if(l == null) 
	{
		console.log("ERROR: invalid statement. Missing )");
		parser_rest = null;
		return null;
	}
	if(car(l) == ")") // find end
	{
		parser_rest = cdr(l);
		return null;
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
		return cons(car(l), 
					parser_list(cdr(l)));
	}
}
var parser = function(l)
{
	if(l == null)
		return null;
	else if (car(l) == "(")
		return cons(parser_list(cdr(l)), parser(parser_rest));
	// quote // unquote // quasiquote // unquote-splice
    else if (car(l) === "'" || car(l) === "~" || car(l) === "`" || car(l) === "~@")
        return cons(parser_special(l), parser(parser_rest));
	else // symbol number
		return cons(car(l), parser(cdr(l)));
}
/*
	use to save variable and their location
*/
var Variable_Table = [
// primitive variables
{
	"cons" : [0, 0],
	"car" : [0, 1],
	"cdr" : [0, 2],
	"vector" : [0, 3],
	"vector-ref" : [0, 4],
	"vector-set!" : [0, 5],
	"vector-length" : [0, 6],
	"vector?" : [0, 7],
	"+" : [0, 8],
	"-" : [0, 9],
	"*" : [0, 10],
	"/" : [0, 11],
	"=" : [0, 12], // only for number
	"<" : [0, 13], // only for number
	">" : [0, 14], // only for number
	"<=" : [0, 15], // only for number
	">=" : [0, 16], // only for number
	"eq?" : [0, 17],
	"string?" : [0, 18],
	"integer?" : [0, 19],
	"float?" : [0, 20],
	"pair?" : [0, 21]
}]; 

var Environment = [
	[

	bpp(function(stack_param)
		{ // 0 cons
			return new Cons(stack_param[0], stack_param[1]);
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
			return stack_param;
		}),
	bpp(function(stack_param)
		{ // 4 vector-ref
		return stack_param[0][stack_param[1].num];
		}),
	bpp(function(stack_param)
		{ // 5 vector-set!
		stack_param[0][stack_param[1].num] = stack_param[2];   return stack_param[2];  
		}),
	bpp(function(stack_param)
		{ // 6 vector-length
			return new Integer(stack_param[0].length)
		}),
	bpp(function(stack_param)
		{ // 7 vector?
			if(stack_param[0] instanceof Array) return "true";
			return null;
		}),
	bpp(function(stack_param)
		{ // 8 +
		if (stack_param[0] instanceof Float || stack_param[1] instanceof Float)
			return new Float(stack_param[0].num + stack_param[1].num);
		return new Integer(stack_param[0].num + stack_param[1].num);
		}),
	bpp(function(stack_param)
		{ // 9 -
		if (stack_param[0] instanceof Float || stack_param[1] instanceof Float)
			return new Float(stack_param[0].num - stack_param[1].num);
		return new Integer(stack_param[0].num - stack_param[1].num);
		}),
	bpp(function(stack_param)
		{ // 10 *
		if (stack_param[0] instanceof Float || stack_param[1] instanceof Float)
			return new Float(stack_param[0].num * stack_param[1].num);
		return new Integer(stack_param[0].num * stack_param[1].num);
		}),
	bpp(function(stack_param)
		{ // 11 /
		if (stack_param[0] instanceof Float || stack_param[1] instanceof Float)
			return new Float(stack_param[0].num / stack_param[1].num);
		return new Integer(stack_param[0].num / stack_param[1].num);
		}),
	bpp(function(stack_param)
	{ // 12 = only for number
		if (stack_param[0].num == stack_param[1].num)
			return "true"
		return null;
	}),
	bpp(function(stack_param)
	{ // 13 < only for number
		if (stack_param[0].num < stack_param[1].num)
			return "true"
		return null;
	}),
	bpp(function(stack_param)
	{ // 14 > only for number
		if (stack_param[0].num > stack_param[1].num)
			return "true"
		return null;
	}),
	bpp(function(stack_param)
	{ // 15 <= only for number
		if (stack_param[0].num <= stack_param[1].num)
			return "true"
		return null;
	}),
	bpp(function(stack_param)
	{ // 16 >= only for number
		if (stack_param[0].num >= stack_param[1].num)
			return "true"
		return null;
	}),
	bpp(function(stack_param)
	{ // 17 eq? 
		if ((stack_param[0] instanceof Integer || stack_param[0] instanceof Float) // check number
			&& (stack_param[1] instanceof Integer || stack_param[1] instanceof Float))
		{
			if(stack_param[0].num === stack_param[1].num) return "true"; 
			return false;
		}
		if (stack_param[0] === stack_param[1])
			return "true"
		return null;
	}),
	bpp(function(stack_param)
	{ // 18 string?
		if(typeof(stack_param[0]) === "string")
			return "true";
		return null;
	}),
	bpp(function(stack_param)
	{ // 19 integer?
		if(stack_param[0] instanceof Integer)
			return "true";
		return null;
	}),
	bpp(function(stack_param)
	{ // 20 float?
		if(stack_param[0] instanceof Float)
			return "true";
		return null;
	}),
	bpp(function(stack_param)
	{ // 21 pair?
		if(stack_param[0] instanceof Cons)
			return "true";
		return null;
	})
	]
];

// get variable index
var vt_getVariableIndex = function(vt, variable_name)
{
	for(var i = vt.length - 1; i >= 0; i--)
	{
		if(variable_name in vt[i])
			return vt[i][variable_name];
	}
	return -1; // didn't find
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
var PUSH = 0x6;
var CALL = 0x7;
var JMP = 0x8;
var TEST = 0x9;
var CONS = 0xA001;
var CAR = 0xA002;
var CDR = 0xA003;
var VECTORSET = 0xA004;
var VECTORGET = 0xA005;

var INSTRUCTIONS = []; // global variables. used to save instructions
var Variable_Table = [{}];

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

var VARIABLE_TABLE = []; // used to save variable name
var vt_find = function(vt, var_name) // find variable
{
	for(var i = 0; i < vt.length; i++)
	{
		if(vt[i] === var_name)
			return i;
	}
	return -1;
}
var list_to_array = function(l) // convert list to array
{
	var return_array = [];
	while(l !== null)
	{
		return_array.push(car(l));
		l = cdr(l);
	}
	return return_array;
}

var compiler = function(l, vt)
{
	if(l === null)
	{
		INSTRUCTIONS.push(CONST_NULL); // push null
		return;
	}
	if(typeof(l) === "string")
	{
		if(l === null)
		{
			INSTRUCTIONS.push( CONST_NULL);
			return;
		}
		// check number
		else if(isInteger(l)) // 32 bit integer
		{
			var i = parseInt(l);
			INSTRUCTIONS.push( CONST_INTEGER );
			INSTRUCTIONS.push( /*(0xFFFF000000000000 & i) >> 48*/ (i / Math.pow(2, 48) & 0xFFFF) );
			INSTRUCTIONS.push( /*(0x0000FFFF00000000 & i) >> 32*/ (i / Math.pow(2, 32) & 0xFFFF) );
			INSTRUCTIONS.push( (0xFFFF0000 & i) >> 16 );
			INSTRUCTIONS.push(  0xFFFF & i );
			return;
		}
		/*
			First 32 bits: integer
			Second 32 bits: float
		*/
		else if(isFloat(l))
		{
			var f = parseFloat(l);
			var i = parseInt(f);
			INSTRUCTIONS.push(CONST_FLOAT);
			INSTRUCTIONS.push((i >> 16) & 0x0000FFFF);
			INSTRUCTIONS.push(i & 0x0000FFFF);

			// decimals 10 digits
			// 10 ^ 10
			var d = parseInt((f - i) * /*Math.pow(10, 9)*/1000000000);
			console.log(d)
			INSTRUCTIONS.push((d >> 16) & 0x0000FFFF);
			INSTRUCTIONS.push(d & 0x0000FFFF);
			return;
		}
		// string
		else if (l[0] === '"')
		{
			console.log("IT IS STRING");
			var s = eval(l);
			var length = s.length + 1;
			INSTRUCTIONS.push(CONST_STRING); // create string
			INSTRUCTIONS.push(length);       // push string length
			var find_end = false;
			for(var i = 0; i < length; i = i + 2)
			{
				if( i + 1 === length)
				{
					INSTRUCTIONS.push(s.charCodeAt(i) << 8 & 0xFF00);
					find_end = true;
					break;
				}
				else
				{
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
			if(index == -1)
			{
				console.log("ERROR: undefined variable: " + l);
				return;
			}
			if(index > 0xFFF)
			{
				console.log("ERROR 0: Stack Overflow...");
				return;
			}
			INSTRUCTIONS.push(GET << 12 | index);
			return;
		}
	}
	else if (l instanceof Cons)
	{
		var tag = car(l);
		// quote
		if (tag == "quote")
		{
			var v = cadr(l);
			// check integer float string null
			if(v === null || isInteger(v) || isFloat(v) || v[0] === '"')
				return compiler(v, vt);
			else if (v instanceof Cons) // pair
			{
				var quote_list = function(l)
	            {
	                if(l == null) return null;
	                var v = car(l);   
	                //if(typeof(v) === "string" && v[0] === '"') v = eval(v);
	                if(v instanceof Cons) return cons("cons", cons(cons(quote_list(v), null), cons(quote_list(cdr(l)), null)));
	                else if (v === ".") return cons("quote", cons(cadr(l), null));
	                return cons("cons", cons( cons("quote", cons(v, "null")), cons(quote_list(cdr(l), null))));
	            }	       
	            return compiler(quote_list(v), vt);
			}
			// symbol/string
			else if(v[0]!='"') 
			{
				v = '"'+v+'"'
				return compiler(v, vt);
			}
		}
		else if (tag == "quasiquote") // add quasiquote
		{
			var v = cadr(l);
			// check integer
			// check integer float string null
			if(v === null || isInteger(v) || isFloat(v) || v[0] === '"')
				return compiler(v, vt);
			else if (v instanceof Cons) // pair
			{
				var quasiquote = function(l)
	            {
	                if(l == null) return null;
	                var v = car(l);   
	                //if(typeof(v) === "string" && v[0] === '"') v = eval(v);
	                if(v instanceof Cons) 
	                {
	                	if(car(v) === "unquote")
	                		return cons("cons", cons(cadr(v), cons(quasiquote(cdr(l)), null)));
	                	else if (car(v) === "unquote-splice")
	                		return cons("append", cons(cadr(v), cons(quasiquote(cdr(l)), null)));
	                	return cons("cons", cons(cons(quasiquote(v), null), cons(quasiquote(cdr(l)), null)));
	                }
	                else if (v === ".") return cons("quote", cons(cadr(l), null));
	                return cons("cons", cons( cons("quote", cons(v, "null")), cons(quasiquote(cdr(l), null))));
	            }	       
	            return compiler(quasiquote(v), vt);
			}
			// symbol/string
			else if(v[0]!='"') 
			{
				v = '"'+v+'"'
				return compiler(v, vt);
			}
		} 

		// (def x 12) (def (add a b) (+ a b)) => (def add (lambda [a b] (+ a b)))
		else if(tag == "def")
		{
			var variable_name = cadr(l);
			if(variable_name instanceof Cons) // it is lambda format like (def (add a b) (+ a b))
			{
				var var_name = car(variable_name);
				var args = cdr(variable_name);
				var lambda = cons("lambda", cons(args, cddr(l)));
				return compiler(cons("def", cons(var_name, cons(lambda, null))), 
								vt);
			}

			for(var i = vt.length - 1; i >= 0; i--)
			{
				if (variable_name === vt[i])
				{
					console.log("ERROR: variable already defined");
					return;
				}
			}
			var variable_value = caddr(l);
			// compile value
			compiler(variable_value, vt);
			
			var v_index = vt.length;
			if(v_index >= Math.pow(2, 12))
			{
				console.log("ERROR 1: Stack Overflow");
				return;
			}
			// add instruction
			INSTRUCTIONS.push( PUSH << 12 );
			// add to variable table
			vt.push(variable_name);
			return;
		}
		// set!
		else if(tag == "set!")
		{
			var variable_name = cadr(l);
			var variable_value = caddr(l);
			for(var i = vt.length - 1; i >= 0; i--)
			{
				if (variable_name === vt[i]) // find variable
				{
				 	compiler(variable_value, vt)// compile value
				 	INSTRUCTIONS.push( SET << 12 | (0x0FFF & i));
				 	return;
				}
			}
			// set! error
			console.log("SET! ERROR");
			return;
		}
		// (if test conseq alter)
		else if (tag === "if")
		{
			var test = cadr(l);
			var conseq = caddr(l);
			var alter = cadddr(l);
			compiler(test, vt); // compile test
			var index1 = INSTRUCTIONS.length;
			// push test, but now we don't know jump steps
			INSTRUCTIONS.push(0x0000); // jump over consequence

			compiler(conseq, vt); // compiler consequence; 
			var index2 = INSTRUCTIONS.length;
			INSTRUCTIONS.push(0x0000); // jump over alternative

			var jump_steps = index2 - index1 + 1;
			INSTRUCTIONS[index1] = (TEST << 12) | jump_steps;

			compiler(alter, vt); // compiler alternative;
			var index3 = INSTRUCTIONS.length;
			jump_steps = index3 - index2;
			INSTRUCTIONS[index2] = (JMP << 12) | jump_steps;
			return;
		}
		// (lambda (a b) ...)
		// (lambda (a . b) ...)
		else if (tag === "lambda")
		{
			var params = cadr(l); // get parameters
			var variadic_place = -1; // variadic place
			var counter = 0; // count of parameter num
			var vt_ = vt.slice(0); // new variable table

			var index_of_return_address = vt_.length;
			vt_.push(null); // save space for parent-env
			vt_.push(null); // save space for return address

			while(true)
			{
				if(params == null) break;
				if(car(params) === ".") // variadic
				{
					variadic_place = counter;
					vt_.push(cadr(params));
					counter += 1; // means no parameters requirement
					break;
				}
				vt_.push(car(params));
				counter+=1;
				params = cdr(params);
			}
			// make lambda
			INSTRUCTIONS.push(MAKELAMBDA << 12 | (counter << 6) | (variadic_place === -1? 0x0000 : (variadic_place << 1)) | (variadic_place === -1? 0x0000 : 0x0001));
			var index1 = INSTRUCTIONS.length;
			INSTRUCTIONS.push(0x0000); // steps that needed to jump over lambda
			// compile_body
			var c_body = compiler_begin(cddr(l), vt_);
			// return 
			INSTRUCTIONS.push(RETURN << 12 & (0x0FFFF | index_of_return_address)); // return and set pc to return address

			var index2 = INSTRUCTIONS.length;
			INSTRUCTIONS[index1] = index2 - index1; // set jump steps
			return;
		}
		// call function
		else
		{
			INSTRUCTIONS.push(NEWFRAME << 12); // create new frame
			// compile parameters
			var param_num = 0;
			var func = car(l);
			var params = cdr(l);
			var return_address_ = INSTRUCTIONS.length; // save space for return_address
			INSTRUCTIONS.push(null);				   // return address is 32 bits
			INSTRUCTIONS.push(null); 

			// push parameter from right to left 
			params = list_to_array(params); // convert list to array
			param_num = params.length;  // get param num
			for(var i = param_num - 1; i >=0; i--) // compile parameter from right to left
			{
				compiler(params[i]);
			}

			compiler(func, vt); // compile function, save to accumulator
			INSTRUCTIONS.push(CALL << 12 & (0x0FFF & (param_num + 1))); // including return address
			var return_address = INSTRUCTIONS.length; // get return address

			if(return_address > 4294967296) // pc too big
			{ 
				console.log("ERROR 3: PC TOO BIG. This is a bug caused by author");
				return;
			}

			INSTRUCTIONS[return_address    ] = return_address >>> 16; // set return address
			INSTRUCTIONS[return_address + 1] = 0x0000FFFF & return_address;
			return;
		}
	}
}

var compiler_begin = function(l, vt)
{
	while(l !== null)
	{
		compiler(car(l), vt);
		l = cdr(l);
	}
	return;
}

// global variable environment
var ENVIRONMENT = [];
var VM = function()
{
	var pc = 0;
	var accumulator = null;
	var length_of_insts = INSTRUCTIONS.length;
	while(pc !== length_of_insts)
	{

		var inst = INSTRUCTIONS[pc];
		var opcode = (inst & 0xF000) >> 12;
		if(inst === CONST_INTEGER) // integer
		{
			accumulator = (INSTRUCTIONS[pc + 1] * /*Math.pow(2, 48)*/ 281474976710656)+  // couldn't shift left 48
						  (INSTRUCTIONS[pc + 2] * /*Math.pow(2, 32)*/ 4294967296)+
						  (INSTRUCTIONS[pc + 3] * /*Math.pow(2, 16)*/ 65536) +
						   INSTRUCTIONS[pc + 4] - (INSTRUCTIONS[pc + 1] >> 15) * Math.pow(2, 64);
			pc = pc + 5;
			console.log("INT accumulator=> " + accumulator);
			continue;
		} 
		else if (inst === CONST_FLOAT) // float
		{
			accumulator = (INSTRUCTIONS[pc + 1] * /*Math.pow(2, 16)*/65536)+ 
						  (INSTRUCTIONS[pc + 2])
						  - (INSTRUCTIONS[pc + 1] >> 15) * Math.pow(2, 32);
			console.log((INSTRUCTIONS[pc + 3] * Math.pow(2, 16)) + (INSTRUCTIONS[pc + 4]))
			accumulator = accumulator + ((INSTRUCTIONS[pc + 3] * /*Math.pow(2, 16)*/65536) + (INSTRUCTIONS[pc + 4])) / /*Math.pow(10, 9)*/1000000000
			pc = pc + 5;
			console.log("FLOAT accumulator=> " + accumulator);
			continue;		
		}
		else if (inst === CONST_STRING) // string
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
			accumulator = created_string;
			pc = pc + 1;
			console.log("STRING: " + accumulator);
			continue;
		}
		else if (inst === CONST_NULL) // null
		{
			accumulator = null;
			pc = pc + 1;
			console.log("NULL: ");
			continue;
		}
		else if ( opcode === PUSH) // push to environment
		{
			console.log("PUSH");
			ENVIRONMENT.push(accumulator);
			pc = pc + 1;
			continue;
		}
		else if ( opcode === TEST) // test
		{
			if(accumulator === null) // false, jump
			{
				pc = pc + (0x0FFF & inst);
				continue;
			}
			// run next
			pc = pc + 1;
			continue;
		}
		else if ( opcode === JMP) // jump
		{
			var jump_steps = 0x0FFF & inst;
			if(jump_steps >> 11 === 1)
				jump_steps -= Math.pow(2, 16);
			pc = pc + jump_steps;
			continue; 
		}
		else if ( opcode === SET) // set 
		{
			console.log("SET");
			var index = 0x0FFF & inst;
			ENVIRONMENT[index] = accumulator;
			pc = pc + 1;
			continue;
		}
		else if ( opcode === GET ) // get
		{
			console.log("GET");
			var index = 0x0FFF & inst;
			accumulator = ENVIRONMENT[index];
			pc = pc + 1;
			continue;
		}
		else if ( opcode === MAKELAMBDA) // make lambda
		{
			console.log("MAKELAMBDA");
			var param_num= (0x0FC0 & inst) >> 6;
			var variadic_place = (0x0001 & inst) ? ((0x003E & inst) >> 1) : -1;
			var start_pc = pc + 2;
			var jump_steps = INSTRUCTIONS[pc + 1];

			accumulator = new Lambda(param_num, variadic_place, start_pc, ENVIRONMENT.slice(0)); // set lambda
			
			pc = pc + jump_steps + 1;
			console.log(pc);
			continue;
		}
		else if ( opcode === CALL) // call function
		{
			var param_num = 0x0FFF & inst; // get param num, including return_address.

			var lambda = accumulator; // get lambda
			var required_param_num = func.param_num;
			var required_variadic_num = func.variadic_place;
			var start_pc = func.start_pc;
			var new_env = func.env.slice(0);

			// push current-env to new-env to save it
			new_env.push(ENVIRONMENT);
			// push return_address
			new_env.push(ENVIRONMENT[ENVIRONMENT.length - param_num]); // save space for return_address

			for(var i = 0; i < param_num - 1; i++)
			{
				var p = ENVIRONMENT.pop(); // pop parameters;
				if( i === required_variadic_num) // reach variadic param place.
				{
					var v = null;
					while(i < param_num - 1)
					{
						v = cons(ENVIRONMENT.pop(), v); // set variadic variable
						i++;
					}
					new_env.push(v); // push variadic variable
					break;
				}
				else // push parameter to new env
				{
					new_env.push(p); 
				}
			}
			// pop return_address;
			ENVIRONMENT.pop();

			ENVIRONMENT = new_env; // reset ENVIRONMENT pointer
			pc = start_pc;         // begin to call function
			continue;
		}
		else if ( opcode === NEWFRAME) // create new frame
		{
			// save return address to stack
			// return address is 32 bits
			var return_address = (INSTRUCTIONS[pc + 1] << 16) + INSTRUCTIONS[pc + 2]; // get return address
			ENVIRONMENT.push(return_address); // push to stack
			pc = pc + 3; // update pc
			continue;
		}
		else if ( opcode === RETURN ) // return
		{
			var index = 0x0FFF & inst; // get index for saved env and return_address(pc)
			var old_env = ENVIRONMENT[index];
			var old_pc = ENVIRONMENT[index + 1];
			// clear env if necessary for C language, not here for javascript

			ENVIRONMENT = old_env;
			pc = old_pc;
		}
	}
}


/*
var compiler = function(l,   // list
						vt  // variable table
						)    // output instructions
{
	if(l == null) return [CONSTANT, NULL, 0];
	if(typeof(l) === "string")
	{
		// check number
		if(isInteger(l))
			return [CONSTANT, INTEGER, l];
		if(isFloat(l))
			return [CONSTANT, FLOAT, l];

		// it is not number
		// get variable index
		var m_n = vt_getVariableIndex(vt, l);
		if(m_n == -1)
		{
			console.log("ERROR: undefined variable: " + l);
			return [];
		}
		return [GET, m_n[0], m_n[1]];
	}
	else if (l instanceof Cons)
	{
		var tag = car(l);
		// quote
		// only support symbol int float now
		if (tag == "quote")
		{
			var v = cadr(l);
			// check integer
			if(isInteger(v))
				return [CONSTANT, INTEGER, l];
			else if (isFloat(v))
				return [CONSTANT, FLOAT, l];
			// check null
			else if(v == null)
				return [CONSTANT, NULL, 0];
			else if (v instanceof Cons) // pair
			{
				var quote_list = function(l)
	            {
	                if(l == null) return null;
	                var v = car(l);   
	                //if(typeof(v) === "string" && v[0] === '"') v = eval(v);
	                if(v instanceof Cons) return cons("cons", cons(cons(quote_list(v), null), cons(quote_list(cdr(l)), null)));
	                else if (v === ".") return cons("quote", cons(cadr(l), null));
	                return cons("cons", cons( cons("quote", cons(v, "null")), cons(quote_list(cdr(l), null))));
	            }	       
	            return compiler(quote_list(v), vt);
			}
			// symbol/string
			else if(v[0]!='"') 
			{
				v = '"'+v+'"'
				return [CONSTANT, STRING, v];
			}
		}
		else if (tag == "quasiquote") // add quasiquote
		{
			var v = cadr(l);
			// check integer
			if(isInteger(v))
				return [CONSTANT, INTEGER, l];
			else if (isFloat(v))
				return [CONSTANT, FLOAT, l];
			// check null
			else if(v == null)
				return [CONSTANT, NULL, 0];
			else if (v instanceof Cons) // pair
			{
				var quasiquote = function(l)
	            {
	                if(l == null) return null;
	                var v = car(l);   
	                //if(typeof(v) === "string" && v[0] === '"') v = eval(v);
	                if(v instanceof Cons) 
	                {
	                	if(car(v) === "unquote")
	                		return cons("cons", cons(cadr(v), cons(quasiquote(cdr(l)), null)));
	                	else if (car(v) === "unquote-splice")
	                		return cons("append", cons(cadr(v), cons(quasiquote(cdr(l)), null)));
	                	return cons("cons", cons(cons(quasiquote(v), null), cons(quasiquote(cdr(l)), null)));
	                }
	                else if (v === ".") return cons("quote", cons(cadr(l), null));
	                return cons("cons", cons( cons("quote", cons(v, "null")), cons(quasiquote(cdr(l), null))));
	            }	       
	            return compiler(quasiquote(v), vt);
			}
			// symbol/string
			else if(v[0]!='"') 
			{
				v = '"'+v+'"'
				return [CONSTANT, STRING, v];
			}
		} 
		// def 
		// (def x 12) (def (add a b) (+ a b)) => (def add (lambda [a b] (+ a b)))
		else if(tag == "def")
		{
			var variable_name = cadr(l);
			if(variable_name instanceof Cons) // it is lambda format like (def (add a b) (+ a b))
			{
				var var_name = car(variable_name);
				var args = cdr(variable_name);
				var lambda = cons("lambda", cons(args, cddr(l)));
				return compiler(cons("def", cons(var_name, cons(lambda, null))), 
								vt)
			}

			var variable_value = caddr(l);
			for(var i = vt.length - 1; i >= 0; i--)
			{
				if (variable_name in vt[i])
				{
					console.log("ERROR: variable already defined");
					return [];
				}
			}
			// get index
			var m = vt.length - 1;
			var n = Object.keys(vt[vt.length - 1]).length;
			// add to variable table
			vt[vt.length - 1][variable_name] = [m, n];
			return [SET, m, n, compiler(variable_value, vt)];
		}
		// set!
		else if(tag == "set!")
		{
			var variable_name = cadr(l);
			var variable_value = caddr(l);
			for(var i = vt.length - 1; i >= 0; i--)
			{
				if (variable_name in vt[i])
				{
					var m_n = vt[i][variable_name];
					return [SET, m_n[0], m_n[1], compiler(variable_value, vt)];
				}
			}
			// set! error
			console.log("SET! ERROR");
			return []
		}
		// if 
		// [if test consequent alternative]
		else if (tag == "if")
		{
			var test = cadr(l);
			var conseq = caddr(l);
			var alter; 
			if(cdddr(l) == null) alter = null;
			else alter = cadddr(l);

			// compile
			var c_test = compiler(test, vt);
			var c_conseq = compiler(conseq, vt);
			var c_alter = compiler(alter, vt);

			return [IF, c_test, c_conseq, c_alter];
		}
		// create lambda
		// [CREATE_LAMBDA parameter_num variadic_place body]
		// for variadic_place -1 mean no variadic parameters
		else if (tag == "lambda")
		{
			var params = cadr(l); // get parameters
			var variadic_place = -1; // variadic place
			var param_num = 0; // parameters num
			var length_of_vt = vt.length; // length of vt
			var counter = 0; //
			var vt_ = {};
			while(true)
			{
				if(params == null) break;
				if(car(params) == ".") // variadic
				{
					variadic_place = counter;
					vt_[cadr(params)] = [length_of_vt, counter];
					counter = -1; // means no parameters requirement
					break;
				}
				vt_[car(params)] = [length_of_vt, counter]; // set parameters to variable table
				counter+=1;
				params = cdr(params);
			}
			// compile_body
			var new_vt = vt.slice(0);
			new_vt.push(vt_); // add parameters variable table
			var c_body = compiler_begin(cddr(l), new_vt);
			return [CREATE_LAMBDA, counter, variadic_place, c_body];

		}
		// call lambda
		else
		{
			var m_n = vt_getVariableIndex(vt, car(l));
			if(m_n == -1)
			{
				console.log("ERROR: invalid lambda: " + car(l));
				return [];
			}
			var compiled_parameters = compiler_begin(cdr(l), vt); // compile parameters
			var push_param = [PUSH_PARAM];
			for(var i = 0; i < compiled_parameters.length; i++)
			{
				push_param.push(compiled_parameters[i]);
			}
			// eg (add 3 4)
			// [call 0 2 [push_param [const integer 3] [const integer 4]]]
			return [CALL, m_n[0], m_n[1], push_param];
		}
	}
	else
	{
		console.log("COMPILER ERROR");
		return [];
	}
}
var compiler_begin_iter = function(o, vt, out)
{
	if(o == null) return out;
	var v = car(o);
	if (v instanceof Cons && car(v) === "begin")
	{
		v = compiler_begin_iter(cdr(v), vt, []);
		for(var i = 0; i < v.length; i++)
		{
			out.push(v[i]);
		} return compiler_begin_iter(cdr(o), vt, out);
	}
	var c = compiler(car(o), vt);
	out.push(c);
	return compiler_begin_iter(cdr(o), vt, out);
}
var compiler_begin = function(o, vt)
{
	return compiler_begin_iter(o, vt, []);
}*/
/*
	virtual machine
*/
// push new frame
// calculate parameters
// return new env
/*
var vm_push_parameters = function(insts,  // parameters calculation instructions
									new_env,  // new env
									param_num, // required param num, -1 means no requirement
									variadic_place, // variadic place, -1 means no requirement
									current_env // env used to calculate parameters
									)
{
	if(param_num != -1 && insts.length > param_num)
	{
		console.log("ERROR: Too many parameters");
		return new_env;
	}
	var frame = []
	var accumulator = null;
	var variadic_l = null;
	for(var i = 0; i < insts.length; i++)
	{
		if(variadic_place !=-1 && i == variadic_place) // variadic parameters
		{
			for(var j = insts.length - 1; j>=i; j--) // add variadic parameters
			{
				var inst = insts[j];
				var v = vm([inst], current_env, accumulator);
				variadic_l = cons(v, variadic_l);
			}
			frame.push(variadic_l);
			break;
		}
		var inst = insts[i];
		var v = vm([inst], current_env, accumulator);
		frame.push(v);
	}
	for(; i < param_num; i++) // add null if necessary
	{
		frame.push(null);
	}
	new_env.push(frame); // add new frame
	return new_env;
}
// virtual machine
var vm = function(insts, env, accumulator)
{
	for(var i = 0; i < insts.length; i++)
	{
		var inst = insts[i];
		var opcode = inst[0];
		switch(opcode)
		{
			// (SET m n value)
			case SET:
				// calculate value first
				var a = vm([inst[3]], env, accumulator);
				// set to environment
				env[inst[1]][inst[2]] = a;
				break;
			// GET save to accumulator
			// (GET m n)
			case GET:
				accumulator = env[inst[1]][inst[2]];
				break;
			// CONSTANT save to accumulator
			// (CONSTANT type value)
			case CONSTANT:
				var constant_type = inst[1];
				// only support string, int, float now
				if(constant_type == STRING)
					accumulator = inst[2];
				else if (constant_type == INTEGER)
					accumulator = new Integer(parseInt(inst[2]));
				else if (constant_type == FLOAT)
					accumulator = new Float(parseFloat(inst[2]));
				else // null
				{
					// console.log("ERROR: invalid constant type");
					return null;
				}
				break;
			// (call m n (param_push p0 p1 p2))
			case CALL:
				// only support builtin-primitive functions now
				// get value
				var v = env[inst[1]][inst[2]];

				if(v instanceof Builtin_Primitive_Procedure)
				{
					// primitive 
					// calculate param
					var new_env = vm_push_parameters(inst[3].slice(1), env.slice(0), -1, -1, env);
					// because it is only builtin primitive procedure
					// so only use the top level env
					accumulator = env[inst[1]][inst[2]].func(new_env[new_env.length - 1]);
				}
				// user defined lambda
				if(v instanceof Lambda)
				{
					// get necessary information from v
					var body = v.body;
					var param_num = v.param_num;
					var variadic_place = v.variadic_place;
					var new_env = v.env;

					// calculate parameters and get new env
					new_env = vm_push_parameters(inst[3].slice(1), new_env.slice(0), param_num, variadic_place, env);

					// call function
					accumulator = vm(body, new_env, null);
				}
				break;
			// [if test conseq alter]
			case IF:
				var t = vm([inst[1]], env, null);
				if(t == null) // run alter
					accumulator = vm([inst[3]], env, null);
				else
					accumulator = vm([inst[2]], env, null);
				break;
			// [create_lambda param_num variadic_place body]
			case CREATE_LAMBDA:
				accumulator = new Lambda(inst[1], inst[2], inst[3], env.slice(0));
				break;
			
			//	create new frame and push parameters
			
			//case PUSH_PARAM:
			//	break;
			default:
				console.log("VM ERROR: invalid parameters: " + opcode);
				return null;
		}
	}
	console.log("debug: accumulator==> ")
	console.log(accumulator)
	return accumulator;
}*/


var l = lexer('(def (test a b c d e f . t) 1)');
console.log(l);
var o = parser(l);
console.log(o)
var p = compiler_begin(o, VARIABLE_TABLE);

console.log(VARIABLE_TABLE);
printInstructions(INSTRUCTIONS);
VM()
console.log(ENVIRONMENT);

// var p = compiler_begin(o, Variable_Table);
// console.log(p);
// console.log(vm(p, Environment, null));






















