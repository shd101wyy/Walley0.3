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
	if (input_string[index] == " " || input_string[index] == "\n" || input_string[index] == "\t")
		return lexer_iter(input_string, index + 1);
	// get number symbol
	var end = index;
	while(true)
	{
		if (end == input_string.length 
			|| input_string[end] == " " || input_string[end] == "\n" || input_string[end] == "\t" 
			|| input_string[end] == ")" || input_string[end] == "(")
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
	"cdr" : [0, 2]
}]; 
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
			// check integer
			if(isInteger(l))
				return [CONSTANT, INTEGER, l];
			else if (isFloat(l))
				return [CONSTANT, FLOAT, l];
			// check null
			if(l == null)
				return [CONSTANT, NULL, 0];
			// symbol/string
			var v = cadr(l);
			if(v[0]!='"') v = '"'+v+'"'
			return [CONSTANT, STRING, v];
		}
		// def
		else if(tag == "def")
		{
			var variable_name = cadr(l);
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
			var new_vt = vt.slice();
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
									env,  // new env
									param_num, // required param num, -1 means no requirement
									variadic_place // variadic place, -1 means no requirement
									)
{
	if(param_num != -1 && insts.length > param_num)
	{
		console.log("ERROR: Too many parameters");
		return env;
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
				var v = vm([inst], env, accumulator);
				variadic_l = cons(v, variadic_l);
			}
			frame.push(variadic_l);
			break;
		}
		var inst = insts[i];
		var v = vm([inst], env, accumulator);
		frame.push(v);
	}
	for(; i < param_num; i++) // add null if necessary
	{
		frame.push(null);
	}
	env.push(frame); // add new frame
	return env;
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
					var new_env = vm_push_parameters(inst[3].slice(1), env.slice(), -1, -1);
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
					new_env = vm_push_parameters(inst[3].slice(1), new_env.slice(), param_num, variadic_place);
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

			// [create_lambda param_num variadic_place body]
			case CREATE_LAMBDA:
				accumulator = new Lambda(inst[1], inst[2], inst[3], env.slice());
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


var Environment = [
	[

	bpp(function(stack_param)
		{ // cons
			return new Cons(stack_param[0], stack_param[1]);
		}),
	bpp(function(stack_param)
		{ // car
			return car(stack_param[0]);
		}),
	bpp(function(stack_param)
		{ // cdr
			return cdr(stack_param[0]);
		})
	]
];


var o = parser(lexer("(def x (cons 12 14)) (cdr x)"));
var p = compiler_begin(o, Variable_Table);
console.log(p);
console.log(vm(p, Environment, null));






















