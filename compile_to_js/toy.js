/*
	another another another that compiles to javascript
*/
var cons = function(x, y)
{
    return new Cons(x,y);
}
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
// toy number
var Toy_Number = function(numer, denom, type)
{
    this.TYPE = type;
    this.numer = numer;
    this.denom = denom;
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
    return (n==="0" || /^[1-9][0-9]*$/.test(n) || /^0x[0-9A-F]{1,4}$/i.test(n) || /^0[1-9][0-9]*$/.test(n)) }
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
/* tokenize string to list */
var lexer = function(input_str)
{   
    var find_final_comment_index = function(input_str, i) // find end index of comment ; comment
    {
        if(i == input_str.length) return i;
        if(input_str[i] === "\n") return i+1;
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
    var find_final_number_or_atom_index = function(input_str, i)
    {
        if(i == input_str.length)
            return i;
        if(input_str[i]==="(" || input_str[i]===")"
            || input_str[i]==="[" || input_str[i]==="]"
            || input_str[i]==="{" || input_str[i]==="}"
            || input_str[i]===" " || input_str[i]==="\t"
            || input_str[i]==="\n" || input_str[i]===";"
            || input_str[i]===",")
            return i;
        else
            return find_final_number_or_atom_index(input_str, i+1);
    }
    var lexer_iter = function(input_str, i)
    {
        if(i>=input_str.length)
            return null; // finish
        else if(input_str[i]===" " || input_str[i]=="\n" || input_str[i]=="\t" || input_str[i]===",") // remove space tab newline ,
            return lexer_iter(input_str, i + 1);
        else if(input_str[i] === "(" || input_str[i] === "[")
            return cons( "(", lexer_iter(input_str, i + 1));
        // vector
        else if (input_str[i] === "#" && (input_str[i+1]==="(" || input_str[i+1]==="["))
            return cons( "(", cons("vector", lexer_iter(input_str, i+2)));
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
            var end = find_final_number_or_atom_index(input_str, i+1);
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
            return null;
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
            return cons(tag, cons(parse_list(cdr(l)), null));
        }
        else if (car(l) === "'" || car(l) === "~" || car(l) === "`")  // quote unquote quasiquote
        {   // here my be some errors
            return cons(tag, cons(parse_special(l), null));
        }
        else  // symbol or number
        {
            rest = cdr(l);
            return cons(tag, cons(parse_symbol_or_number(car(l)), null));
        }
    }
    var formatQuickAccess = function(ns, keys)
    {
        var formatQuickAccess_iter = function(keys, output, count)
        {
            if(count === keys.length)
                return output;
            return formatQuickAccess_iter(keys, cons("ref", cons(output, cons(":"+keys[count], null))), count + 1);
        }
        return formatQuickAccess_iter(keys, cons(ns, cons(":"+keys[0], null)), 1);
    }
    var parse_symbol_or_number = function(l)
    {
        if(l[0]==="\"") return l; // string
        else if (isNumber(l))
        {
            if(isInteger(l))
            {
                // octal
                if((l.length>2 && l[0] === "-" && l[1]==="0") || (l.length>=2 && l[0]==="0" && l[1]!=="x"))
                    return new Toy_Number(parseInt(l, 8), 1, RATIO);
                // hex or decimal
                return new Toy_Number(parseInt(l), 1, RATIO);
            }
            else return new Toy_Number(parseFloat(l), 1 ,FLOAT);
        }

        var splitted_ = l.split(":");
        if(l === ":"  || splitted_.length == 1 || l[0] === ":" || l[l.length-1] === ":") //  : :abc abc: 
            return l;
        var ns = splitted_[0]; // eg x:a => ns 'x'  keys ['a']
        var keys = splitted_.slice(1);
        var formatted_ = formatQuickAccess(ns, keys); // eg x:a => (ref x :a) or (x :a)
        return formatted_;
    }
    // done
    if(l == null)
        return null;
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


var x = lexer("(define x 12)");
console.log(x);






