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

var Lambda = function(param_num, variadic_place, body, env)
{
	this.param_num = param_num;
	this.variadic_place = variadic_place;
	this.body = body;
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
var SET = 1;
var GET = 2;
var CALL = 3;
var CREATE_LAMBDA = 4;
var CONSTANT = 5;
var PUSH_PARAM = 6;
var IF = 7;


var INTEGER = 1;
var FLOAT = 2;
var STRING = 3;
var NULL = 4;


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
}
/*
	virtual machine
*/
// push new frame
// calculate parameters
// return new env
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
			/*
				create new frame and push parameters
			*/
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
}


var l = lexer("(def x #[1 2 3]) (vector-length x)");
console.log(l);
var o = parser(l);
console.log(o)
var p = compiler_begin(o, Variable_Table);
console.log(p);
console.log(vm(p, Environment, null));






















