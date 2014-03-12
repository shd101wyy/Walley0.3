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
	this.num = num /*| 0 别用这个，这个还想只是16bits整数*/;
}
var Float = function(num)
{
	this.num = num;
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
var formatQuickAccess = function(ns, keys)
{
    var formatQuickAccess_iter = function(keys, output, count)
    {
        if(count === keys.length)
            return output;
        return formatQuickAccess_iter(keys, cons(output, cons(cons("quote", cons(keys[count], null)), null)), count + 1);
    }
    return formatQuickAccess_iter(keys, cons(ns, cons(cons("quote", cons(keys[0], null)), null)), 1);
}
var parser_symbol_or_number = function(v){
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
        return cons(tag, cons(parser_list(cdr(l)), null));
    }
    else if (car(l) === "'" || car(l) === "~" || car(l) === "`")  // quote unquote quasiquote
    {   // here my be some errors
        return cons(tag, cons(parser_special(l), null));
    }
    else  // symbol or number
    {
        parser_rest = cdr(l);
        return cons(tag, cons(parser_symbol_or_number(car(l)), null));
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
		return cons(parser_symbol_or_number(car(l)),
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
     "<", ">", "<=", ">=", "eq?", "string?", "integer?",
     "float?", "pair?", "null?"]
					  ];
var BUILTIN_PRIMITIVE_PROCEDURE_NUM = VARIABLE_TABLE[0].length;

// variable environment
var ENVIRONMENT =
[
	// frame 0
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
	}),
	bpp(function(stack_param)
	{ // 22 null?
		if(stack_param[0] === null)
			return "true";
		return null;
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
			INSTRUCTIONS.push((d >> 16) & 0x0000FFFF);
			INSTRUCTIONS.push(d & 0x0000FFFF);
			return;
		}
		// string
		else if (l[0] === '"')
		{
			var s = eval(l);
			var length = s.length;
			INSTRUCTIONS.push(CONST_STRING); // create string
			INSTRUCTIONS.push(length + 1);       // push string length
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
	else if (l instanceof Cons)
	{
		var tag = car(l);
		// quote
		if (tag === "quote")
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
	                return cons("cons", cons(cons("quote", cons(v, null)),  cons(quote_list(cdr(l)), null)));
	            }
	            return compiler(quote_list(v), vt);
			}
			// symbol/string
			else if(v[0]!='"')
			{
				v = '"'+v+'"'
				return compiler(v, vt);
			}
			return;
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
	                return cons("cons", cons( cons("quote", cons(v, null)), cons(quasiquote(cdr(l)), null)));
	            }
	            return compiler(quasiquote(v), vt);
			}
			// symbol/string
			else if(v[0]!='"')
			{
				v = '"'+v+'"'
				return compiler(v, vt);
			}
			return ;
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
 			// check whether variable already defined
			for(var i = vt.length - 1; i >= 0; i--){
				var frame = vt[i];
				for(var j = frame.length - 1; j >= 0; j--){
					if(variable_name === frame[j]){
						INSTRUCTIONS = []; // clear instructions
						console.log("ERROR: variable already defined");
						return;
					}
				}
			}

			var variable_value;
			if(cddr(l) === null)
				variable_value = null;
			else
			 	variable_value = caddr(l);

			 // add var name to variable table
			vt[vt.length - 1].push(variable_name);

			/*
			// lambda
			if(variable_value instanceof Cons && variable_value !== null && car(variable_value) === "lambda") // lambda
			{
				// console.log("COMPILE LAMBDA VALUE");
				// save space for lambda
				var index = vt_length(vt);
				vt.push(variable_name);           // in variable table
				INSTRUCTIONS.push(CONST_NULL);
				INSTRUCTIONS.push( PUSH_ARG << 12 );  // in stack

				compiler(variable_value, vt); // compile lambda value

				INSTRUCTIONS.push( SET << 12 | (index)); // set to saved space
				return;
			}*/
			// compile value
			compiler(variable_value, vt);

			// add instruction
			INSTRUCTIONS.push( SET << 12  | vt.length - 1);   // frame index
			INSTRUCTIONS.push( 0x0000FFFF & vt[vt.length - 1].length - 1); // value index
			return;
		}
		// set!
		else if(tag == "set!")
		{
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
				compiler(variable_value, vt)// compile value
			 	INSTRUCTIONS.push( SET << 12 | (0x0FFF & index[0])); // frame index
			 	INSTRUCTIONS.push(0x0000FFFF & index[1]); // value index
			 	return;
			}
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
		else if (tag === "begin") // begin
		{
			compiler_begin(cdr(l), vt);
			return;
		}
		// (let [a 1 b 2] body)
		else if (tag === "let")
		{
			var vt_ = vt.length;
			var start_index = vt_.length;
			vt_.push(","); // create new frame
			var index_of_return_address = vt_length(vt_);
			var body = cddr(l);
			var vs = cadr(l);

			/*
			// compile values
			while(vs!==null)
			{
				var var_name = car(vs);
				var var_val = cadr(vs);
				var already_defined = false;
				for(var i = start_index; i < vt_.length; i++)
				{
					if(vt_[i] === var_name) // already defined
					{
						already_defined = true;
						break;
					}
				}
				if(!already_defined)
				{
					compiler(var_val, vt_);
					vt_.push(var_name);
				}
				else
				{
					compiler(var_val, vt_);
				}
				vs = cdr(cdr(vs));
			}

			// compile body
			compiler_begin(body, vt_);

			// restore stack
			*/

		}
		// (lambda (a b) ...)
		// (lambda (a . b) ...)
		else if (tag === "lambda")
		{
			var params = cadr(l); // get parameters
			var variadic_place = -1; // variadic place
			var counter = 0; // count of parameter num
			var vt_ = vt.slice(0); // new variable table
			vt_.push([])          // we add a new frame

			vt_[vt_.length - 1].push(null); // save space for parent-env.
			vt_[vt_.length - 1].push(null); // save space for return address.

			while(true)
			{
				if(params == null) break;
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
			// compile_body
			var c_body = compiler_begin(cddr(l), vt_);
			// return
			INSTRUCTIONS.push(RETURN << 12 | 0x0001); // return and flag(see documentation)

			var index2 = INSTRUCTIONS.length;
			INSTRUCTIONS[index1] = index2 - index1; // set jump steps
			return;
		}
		// call function
		else
		{
			INSTRUCTIONS.push(NEWFRAME << 12); // create new frame and set flag
			// compile parameters
			var param_num = 0;
			var func = car(l);
			var params = cdr(l);


			// INSTRUCTIONS.push(PUSH_ARG << 12); // push lambda to stack

			// push parameter from right to left
			params = list_to_array(params); // convert list to array
			param_num = params.length;  // get param num
			for( var i = 0; i < param_num; i++) // compile parameter from ---right to left---, now from left to right
			{
				compiler(params[i], vt);
				INSTRUCTIONS.push(PUSH_ARG << 12 | (i+2)); // push parameter to new frame
			}

			compiler(func, vt); // compile lambda, save to accumulator

			INSTRUCTIONS.push(CALL << 12 | ((0x0FFF & (param_num)) << 1)); // call function.
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

	var opcode = (INSTRUCTIONS[INSTRUCTIONS.length - 1] & 0xF000) >> 12;
	if(opcode === CALL)
	{
		console.log("TAIL CALL");
		INSTRUCTIONS[INSTRUCTIONS.length - 1] = INSTRUCTIONS[INSTRUCTIONS.length - 1] | 0x0001; // add tail call flag
	}
	return;
}


var VM = function(env)
{
	var pc = 0;   // pc 
	var accumulator = null; // accumulator
	var length_of_insts = INSTRUCTIONS.length;
	var current_frame_pointer = null; // pointer that points to current new frame
	var frame_list = cons(null, null); // stack used to save frames    head frame1 frame0 tail, queue
	while(pc !== length_of_insts)
	{
		// console.log(pc);
		var inst = INSTRUCTIONS[pc];
		var opcode = (inst & 0xF000) >> 12;
		if(opcode === CONST){
			if(inst === CONST_INTEGER){ // integer
				accumulator = (INSTRUCTIONS[pc + 1] * /*Math.pow(2, 48)*/ 281474976710656)+  // couldn't shift left 48
							  (INSTRUCTIONS[pc + 2] * /*Math.pow(2, 32)*/ 4294967296)+
							  (INSTRUCTIONS[pc + 3] * /*Math.pow(2, 16)*/ 65536) +
							   INSTRUCTIONS[pc + 4] - (INSTRUCTIONS[pc + 1] & 0x8000) * Math.pow(2, 64);
				accumulator = new Integer(accumulator);
				pc = pc + 5;
				// console.log("INT accumulator=> " + accumulator.num);
				continue;
			}
			else if (inst === CONST_FLOAT){ // float
				accumulator = (INSTRUCTIONS[pc + 1] * /*Math.pow(2, 16)*/65536)+
							  (INSTRUCTIONS[pc + 2])
							  - (INSTRUCTIONS[pc + 1] & 0x8000) * Math.pow(2, 32);
				// console.log((INSTRUCTIONS[pc + 3] * Math.pow(2, 16)) + (INSTRUCTIONS[pc + 4]))
				accumulator = accumulator + ((INSTRUCTIONS[pc + 3] * /*Math.pow(2, 16)*/65536) + (INSTRUCTIONS[pc + 4])) / /*Math.pow(10, 9)*/1000000000
				accumulator = new Float(accumulator);
				pc = pc + 5;
				// console.log("FLOAT accumulator=> " + accumulator);
				continue;
			}
			else if (inst === CONST_STRING){ // string
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
				// console.log("CREATED_STRING: |"+created_string+"|");
				pc = pc + 1;
				continue;
			}
			else if (inst === CONST_NULL){ // null
				accumulator = null;
				pc = pc + 1;
				// console.log("NULL: ");
				continue;
			}
		}
		else if ( opcode === PUSH_ARG) // push to environment
		{
			// console.log("PUSH_ARG");
			current_frame_pointer[0x0FFF & inst] = accumulator; // push to current frame
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
			// console.log("SET");
			var frame_index = 0x0FFF & inst;               // get frame index
			var value_index = INSTRUCTIONS[pc + 1];        // get value index
			env[frame_index][value_index] = accumulator;
			pc = pc + 2;
			continue;
		}
		else if ( opcode === GET ) // get
		{
			var frame_index = 0x0FFF & inst;
			var value_index = INSTRUCTIONS[pc + 1];
			accumulator = env[frame_index][value_index];
			pc = pc + 2;
			continue;
		}
		else if ( opcode === MAKELAMBDA) // make lambda
		{
			// console.log("MAKELAMBDA");
			var param_num= (0x0FC0 & inst) >> 6;
			var variadic_place = (0x0001 & inst) ? ((0x003E & inst) >> 1) : -1;
			var start_pc = pc + 2;
			var jump_steps = INSTRUCTIONS[pc + 1];

			accumulator = new Lambda(param_num, variadic_place, start_pc, env.slice(0)); // set lambda
			pc = pc + jump_steps + 1;
			continue;
		}
		else if ( opcode === CALL) // call function
		{
			// console.log("CALL FUNCTION");
			var param_num = (0x0FFE & inst) >> 1; // get param num, including return_address.
			var tail_call_flag = (0x0001 & inst); // get tail call flag

			if(tail_call_flag){
				console.log("TAIL CALL");
			}

			var lambda = accumulator;

			// console.log("LAMBDA:");
			// console.log(vm_env)
			// console.log(lambda);
			// console.log("PARAM NUM: " + param_num);
			// a();

			if(lambda instanceof Builtin_Primitive_Procedure){ // builtin lambda
				pc = pc + 1;
				accumulator = lambda.func(current_frame_pointer.slice(2)); // remove saved env and pc
				frame_list = cdr(frame_list); // pop top frame
				current_frame_pointer = car(frame_list) // update frame_pointer
				continue;
			}

			// user defined lambda
			var required_param_num = lambda.param_num;
			var required_variadic_place = lambda.variadic_place;
			var start_pc = lambda.start_pc;
			var new_env = lambda.env.slice(0);
			new_env.push(current_frame_pointer);

			if(required_variadic_place === -1 && param_num - 1 > required_param_num){
				console.log("ERROR: Too many parameters provided");
				return;
			}
			if(required_variadic_place !== -1){ // variadic value
				var v = null;
				for(var i = current_frame_pointer.length - 1; i >= required_variadic_place + 2; i--){
					v = cons(current_frame_pointer[i], v);
				}	
				current_frame_pointer[required_variadic_place + 2] = v;
			}

			// console.log("REQUIRED_PARAM_NUM " + lambda.param_num);
			// console.log("REQUIRED_VARIADIC_NUM " + lambda.variadic_place);
			// console.log("START_PC " + lambda.start_pc);
			// console.log("OLD_PC   " + (pc + 1));

			current_frame_pointer[0] = env; // save current env to new-frame
			// push return_address
			current_frame_pointer[1] = pc + 1; // save pc

			if(current_frame_pointer.length - 2 < required_param_num) // not enough parameters
			{
				for(var i = param_num; i < required_param_num; i++){
					current_frame_pointer.push(null); // default value is null
				}
			}
			env = new_env;         // change env pointer
			pc = start_pc;         // begin to call function
			frame_list = cdr(frame_list) // update frame list
			current_frame_pointer = car(frame_list);
			continue;
		}
		else if ( opcode === NEWFRAME){ // create new frame
			var new_frame = [];
			frame_list = cons(new_frame, frame_list);
			current_frame_pointer = new_frame;
			pc = pc + 1;
			continue;
		}
		else if ( opcode === RETURN ){ // return
			// restore pc and env
			pc = env[env.length - 1][1];
			env = env[env.length - 1][0];
			// update current_frame_pointer
			//current_frame_pointer = car(frame_list);
			continue;
		}
	}
	console.log("Finishing running VM");
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
var l = lexer("(def x 12) `(~x ~x x x)")
console.log(l);
var o = parser(l);
console.log(o)

console.log(cdr(car(car(cdr(o)))))
var p = compiler_begin(o, VARIABLE_TABLE);

console.log(VARIABLE_TABLE);
printInstructions(INSTRUCTIONS);
console.log(VM(ENVIRONMENT))
console.log(ENVIRONMENT);

// var p = compiler_begin(o, Variable_Table);
// console.log(p);
// console.log(vm(p, Environment, null));















