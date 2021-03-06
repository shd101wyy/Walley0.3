```
            ____     ______     _____     /-----------\             
             \\ \    ||    \    ||  |    /-------------\            
              \\ \   ||  |\ \   ||  |    |  --  |  --  | \\  //       
               \\ \  ||  |\\ \  ||  |    |   |_____|   |  \\//      
                \\ \ ||  | \\ \ ||  |  --\_____________/ ---==      
                 \\ \||  |  \\ \||  |  ///\  ||    ||      ||         
                  \\     |   \\     |  |  |  ||    ||      ||         
                   \\____|    \\____|  \__/\ ||___ ||__e   ||         
           __________________________________________________||         
           ---------------------------------------------------|     
```   	
=================================
```

							VERSION 0.3.29 ;)  

						(display "Hello World ;)")


(Toy Language  (Walley-Language 0.3) by (shd101wyy))
 ===============
Toy Language is a simple script language written in JavaScript.  
Influenced by Walley 0.1, Walley 0.2, Scheme, JavaScript, Clojure, Python...  
It is a lisp dialect with an extremely simple and easy interpreter.  
It is easy to use.  

It's a Language For FUN ;)
```
 ===============
<h2>Try Toy Language Online </h2>
```
	Toy Language is available online from 
	----
	[a link]http://planetwalley.com/walley/
	----
	I am a lazy guy so the code on this website may not be newest.
	I will try to make it up to date ;)
```
 ===============  
<h2>Commands: </h2>
```
		toy    								# Run toy repl      
		toy [file_name]						# Run file [file_name]   
		toy compress [file_name]			# Compress file [file_name] to make it smaller    
											# will remove \n and extra spaces.  
```
===============
<h2>html terminal emulator</h2>
```
		./toy_terminal_emulator/index.html  # try toy language easily
```
===============   
<h2>Primitive Data Types: </h2>  
	```
	Ratio:    1 2 3 4/5 5/6   ...      
	Float:    1.2,  3.4,  5.6 ...  
	List :    '(1 2)  '(hello World)  
	Vector:   #[1 2],   #[3 4 5]  (ps: #(...) is the same as #[...])
	Dictionary: {:a 12} {:hello "World"}  
	Symbol(String): "Hello World" 'Hello-world  
	Lambda:     (lambda [params] body)
	Macro:      (defmacro macro_name [params] body)
	-- Null(nil):   () 
	``` 
================   

<h2>Removed characters:</h2>  
```
	, \t \a \n space where be removed when parsing  
	line comment: 
		 ; use ;               | start with ; and span the rest of the line
	long comment : 
		 ;;; your comment ;;;  | start with ;;; end with ;;;
```
<h2>Abbreviation:</h2>
```
	' => quote          eg: 'Hello => (quote Hello)  
	"" => string        eg:  "Hello World"  
	: => keyword        eg:  :a => "a" or 'a . so :a === 'a    
	~ => unquote        eg:  ~x => (unquote x)  
	` => quasiquote     eg:  `(~x x) => (quasiquote ((unquote x) x))  
	~@ => unquote-splice eg: `(~@'(1 2 3) 4) => (1 2 3 4)
                             `(0 ~@'(1 2 3) 4) => (0 1 2 3 4)

   	[ <=> (  ;  ] <=> ) .
   		so [def x 12] is also valid
```
<h2> Builtin Procedures and Macros </h2>  
```
Define Number :  
	1/2       
	3   
	4.0   
	-12 5  
  
Define List :  
	'(1 2 3)  
	(list 1 2 3)  

Define Vector:  
	#[1 2 3]  
	(vector 1 2 3)  

Define Dictionary:  
	{:a 12 :b 13}  
	(dictionary :a 12 :b 13)  

Define Atom/String:  
	"Hi there"  
	'Hello-World  

Define NULL(NIL):  
	()  
	'()  
Define Lambda:  
	(lambda [params] body)  
	eg:  
		(lambda [a b] (+ a b))  
Define Macro:  
	(defmacro macro_name [params] body)  
	eg:  
		(defmacro square [x] `(* ~x ~x))   then (square 12) -> (* 12 12) => 144  
		(defmacro test [[a b] c] `(+ ~a ~b ~c)) theb (test [2 3] 4) -> (+ 2 3 4) => 9  
```
===================      
<h2>Basic Usage</h2>    
<strong> Define Variable </strong>  
```
(def var_name var_value)  
(def (function_name params) body)  
eg:  
	(def x 12)  
	(def x #[1 2 3])  
	(def add (lambda [a b] (+ a b)))  
	(def add2 (lambda "your docstring here" [a b] (+ a b)))  ;; you could use (get-function-doc add2) to get "your docstring here"
															 ;; (set-function-doc add2 "New docstring") to set docstring
  
	;; define lambda  
	(def (add a b) (+ a b))    
```
<strong> Change Variable Value </strong>  
```
(set! var_name var_value)   ;; destructive ;;  
eg:  
	(set! x 12)  
	(set! x {:a 12})  
```
<strong> If </strong>  
```
(if test consequent alternative)  
eg:
	(if true 1 2)  => 1  
	(if false 1 2) => 2  
Everything is TRUE except NULL()
```
<strong> Cond </strong>
```
(cond (predicate1 body1)  
	  (predicate2 body2)  
	  ...  
	  (else body_n)  
	)  
eg:  
	(cond (1 2) => 2  
		  (2 3))  
    (cond (false 2)  
    	  (else 3)) => 3  
```
<strong>
	Lambda  
</strong>
```
(lambda [params] body)  
eg:  
	(lambda [a b] (+ a b))  
```
<strong>
	about variadic parameters  
</strong>
```
	(lambda [param1, param2 . rest] body)  
	eg:  
		(def (test . b) b)  
		(test 1 2 3 4) => list (1 2 3 4)  
		(test)         => null ()  
		(test 2 3)     => list (2 3)  
 ==  
 ```
<strong>Macro</strong>  
```
(defmacro macro_name [params] body)
eg:
	(defmacro unless [test a0 a1] `(if ~test ~a1 ~a0))  
;; The Macro is still under development...  
;; I am still studying macro now ;)  
```
<strong>While</strong>  ;; this function is removed
```
(while (test) body)  ;;return "undefined"  
eg:  
	(def x 0)  
	(while (< x 100) (display x) (set! x (+ x 1)) )  
	;; will print x from 0 to 99  
```
<strong>Begin</strong>  
```  
(begin stm0 stm1 stm2 ...)   eval series of statements   
```  
<strong>Let</strong>
```
(let [var0 val0 var1 val1 ...] body) : create local variables  
eg:  
	(let [a 0 b 1] (+ a b)) => 1  
	(let [a 2 b (+ a 1)] (+ a b)) => 5    in this case b will use the value of a to calculate (+ a 1), so it's (+ 2 3) => 5
```
<h2>Arithematics:  </h2>  
<storng>+ - * / </storng>  
```
:Parameters     arg0, arg1, ... 
:eg  (+ 3 4)      => 7  
	 (* 4 5 6 7)  => 840  
	 (/ 3 6 7)    => 1/14  
	 (/ 3.0 6 7)  => 0.07142857142857142  
	 (- 3)        => -3  
	 (+ "Hello " "World") => "Hello World"  
	 (+ "Hi " 3.1425926)  => "Hi 3.1415926"  
```
<h2>Comparison</h2>  
<strong>eq? < > <= >= and or not</strong>  
```
:Parameters     arg0, arg1, ...  
:eg  (< 3 4)     => true  
     (< 3 4 5)   => true  
     (and 3 4)   => true  
  	 (<= 3 4 5 6) => true  
  	 (>= 3 4 5 6) => false ()  
  	 (and 1 2 3 4 5 false) => false  
  	 (or false false false 1) => true  
```
<h2>Type Check</h2>  
<strong>ratio? integer? float? vector? dictionary? pair?(list?) null? atom? procedure?(function?) macro?</strong>  
```
eg:  
	(typeof 12)          => "number"     ;; typeof function will return string  
	(typeof '(1 2 3))    => "list"  
	(ratio? 3/4)         => true  
	(integer? 3)         => true  
	(float? 3.0)         => true  
	(integer? 3.0)       =>false  
	(vector? #[1 2 3])    => true  
	(dictionary? {:a 12})=> true  
	(pair? '(1 2))       => true  
	(list? '(1 2))       => true  
	(pair? '(1 2))       => true  
	(pair? ())           => false  
	(null? ())           => true  
	(atom? "Hi")         => true  
	(string? "Hi")       => true  
```
<h2>Number Operation</h2>      
<strong>  
	numerator,  
	denominator,  
	->ratio  
	->float  
</strong>  
```
numerator:  
	eg (numerator 3/4) => 3; get numerator of number  
	   (numerator 5)   => 5;  
	   (numerator 6.0) => 6.0  
denominator:  
	eg (denominator 3/4) => 4; get denominator of number  
	   (denominator 5)   => 1  
	   (denominator 6.0) => 1  
->ratio:  
	eg (->ratio 1.5)     => 3/2 convert number to rational ratio number  
->float:
	eg (->float 3/4)     => 0.75

```
<h2>List Operation</h2>
<strong>
	car, cdr, cons  set-car! set-cdr! set-car set-cdr conj ref len pop slice ->str
</strong>
```
car:                             get first element  
	(car '(1 2 3))   => 1  
	(car '((2 3) 4)) => (2 3)  
cdr:                             get rest elements  
	(cdr '(1 2))     => (2)   
	(cdr '(a b c))   => (b c)  
cons:                            link two elements  
	(cons 3 4)       => (3 . 4)  
	(cons 3 '(3 4))  => (3 3 4)  
set-car!:         destructive  
	(def x '(1 2 3)) => x now is (1 2 3)  
	(set-car! x 12)  => x now is (12 2 3); set-car will replace the first element of list  
set-cdr!:         destructive  
	(def x '(1 2 3)) => x now is (1 2 3)  
	(set-cdr! x 12)  => x now is (1 . 12)  ; set-cdr will replace rest elements of list  
set-car:         non-destructive:  
    (def x '(1 2 3)) => x now is (1 2 3)  
    (set-car x 12) => return (12 2 3); but x is still (1 2 3)  
set-cdr:         non-destructive:
    (def x '(1 2 3)) => x now is (1 2 3)  
    (set-cdr x 12) => return (1 . 12); but x is still (1 2 3)  
ref:              ref element at specific index  
	(def x '(1 2 3)) => x now is (1 2 3)  
	(ref x 0)        => find the element at index 0, so will return 1  
len:              return the length of list  
	(def x '(1 2 3))  
	(len x)          => 3  
pop:              return cdr of element  
	(pop '(1 2 3))   => (2 3)  
slice:            slice the list  
	(def x '(1 2 3 4))  
	(slice x 2 4)  => list (3 4)  
->str:            convert list to string  
	(->str '(1 2 3))  => "(1 2 3)"  
```
<h2> Dictionary </h2>  
<strong>  
	dictionary-keys,  assoc, assoc!, conj, conj!, ref, ->str, [quick-access]  
</strong>  
```
dictionary-keys:           return keys as array   
	(dictionary-keys {:a 12 :b 14})            => ['a, 'b]  
assoc          :           return a new dictionary  but change key-value  
	(def x {:a 12 :b 14})  
	(assoc x :a 15)       => return {:a 15 :b 14}, but x will not change  
assoc!         :           destructive assoc  
	(def x {:a 12 :b 14})  
	(assoc! x :a 15)      => x will change to {:a 15 :b 14}  
conj           :            combine two dictionaries and return a new dictioanry  
	(conj {:a 12} {:b 15}) => {:a 12 :b 15}  
conj!          :            destructive conj  
	(def x {:a 12 :c 1})  
	(conj! x {:a 14 :b 15}) => {:a 14 :b 15 :c 1}  
ref            :            return value according to key  
	(def x {:a 12 :c 1})            
	(ref x :a)              => 12  
->str:        convert dictionary to string   
[quick-access]:  
	(dictionary :key)  
	eg: ({:a 12 :b 14} :a)  => will return 12 by key :a from that dictionary  
[quick-access2]:  
	eg:  
		(def math {:add (lambda [a b] (+ a b))}) => ;;; def namespace "math" with property "add" ;;;
		(math:add 3 4) => 7
```
<h2> Vector </h2>         
<strong>  
	assoc, assoc!, conj, conj!, pop, pop!, ref, ->str, slice, len, [quick-access]  
</strong>  
```
assoc:           return a new array, but change index-value  
	(def x #[1 2 3])  
	(assoc x 0 12)  => return #[12 2 3], keep x unchanged  
assoc!:          destructive assoc  
	(def x #[1 2 3])  
	(assoc! x 0 12)  => will change x to #[12 2 3]  
conj:           append element, like push. nondestructive, this function will return new vector  
	(def x #[1 2 3])  
	(conj x 4) => return new vector #[1 2 3 4]  
conj!:           destructive conj  
	(def x #[1 2 3])  
	(conj x 4) => x now is #[1 2 3 4]  
pop:             remove last element, return a new vector  
	(def x #[1 2 3])  
	(pop x)        => #[1 2]  

pop!:            destructive pop  
	(def x #[1 2 3])  
	(pop! x)       => change x to #[1 2]  
ref:             access element according to index  
	(ref #[1 2 3] 0)  => return value at index 0, which is 1  
->str:           convert vector to string  
slice:           slice vector  
	(slice #[1 2 3 4] 2 3)  => #[3]   slice from 2 to 3  
len:             return the length of vector  
	(len #[1]) => 1  
[quick-access]:  
	(#[1,2,3] 0)   => return the element at index 0  

```
<h2>  
MISC  
</h2>  
<strong>  
	quote, quasiquote, list, random, keyword, display, eval, apply  macroexpand-1, map, str,
	read, get-env, gensym, read-file, write-file, get-cwd, get-function-doc, set-function-doc
</strong>  
```
quote: return value without calculation  
	(quote (1 2 3 4)) => (1 2 3 4) without calculation  
	(quote (+ 3 4))   => (+ 3 4)   
	(quote #[1 2 3])   => (vector 1 2 3)  
	quote could be written as '  
	'(1 2 3 4)  <===> (quote (1 2 3 4))  
quasiquote: calculate list cell if it has unquote ahead   
	suppose now we defined:  
		(def x 12)  
		(quasiquote (x x))  => will return list (x x)  
		(quasiquote ((unquote x) x)) will return (12 x) because car has unquote ahead, which means it needs to be calculated  
	quasiquote could be written as `  
	unquote could be written as ~  
	`(* ~x ~x) <===> (quasiquote (* (unquote x) (unquote x)))  
  
list: return list  
	(def x 12)  
	(list x 'x 3 4) => list (12 x 3 4)  
	(list (list x 'x) x) => ((12 x) 12)  

random: return float number between 0 and 1  
	(random) => 0.5136234054807574  
	(random) => 0.19529289728961885  

keyword: return itself     // this function is now deprecated
	:a => (keyword a) => return string a  

display:   display data types  
	(display "Hello World")  
	(display (/ 3 4))  
eval:      eval expression.  
	(eval '(def x 12)) => will run (def x 12)  
apply:     apply procedure  
	(apply + '(1 2 3 4)) => (+ 1 2 3 4) => 10  
macroexpand-1:       expand macro:  
	(defmacro square [x] `(* ~x ~x))  
	(macroexpand-1 '(square 12)) => (* 12 12)  
map:   (map proc arg0 arg1 ...)  but this map function is not efficient... it is written in toy language and Idk good way of implement it  
	(map + '(2 3) '(5 6)) => (7 9)  
str: convert argument to string  
	(str 1 "hi" 5) => "1hi5"  
read: parse string and return list. Only support string(atom) and list type parameter  
	(read "(def x 12)") => '((def x 12))  
get-env: get the whole enviroment  
	(get-env)  
gensym: generate unique non-existent variable name.  
	(gensym) => t_1  
	(gensym) => t_2  
	(def t_3 12)  
	(gensym) =>  t_4  ;; because t_3 is already defined  
	...  
undefined?: check whether variable exists  
	(undefined? 'x) => true; means "x" is not defined  
	(def x 12)  
	(undefined? 'x) => (); means "x" is defined  
input: this function requires u to write a function in javascript called "TOY_getINPUT" with parameter "stack_param"  
	for example:  
		function TOY_getINPUT(stack_param) // stack param is parameter . (input "Hello") then stack_param is ["Hello"]; (input) then stack_param is []  
		{  
			if(stack_param.length == 0)  
			    return prompt("");  
			else  
			    return prompt(stack_param[0]);  
		}  
		so calling "(def x (input 'user-input))" will call TOY_getINPUT and return string output.  

read-file:  # need nodejs support
	(read-file file-name) return string
write-file: # need nodejs support
	(write-file file-name string-that-write-to-file) write string to file
get-cwd: # need nodejs support
	(get-cwd) return current working directory
get-function-doc: get function doc
	(get-function-doc your_function) => the docstring of that function
set-function-doc: set function doc
	(set-function-doc your_function your_doc) => set your_doc as docstring of your_function

```
<h2>Math Module</h2>
<strong>
	acos, acosh, asin, asinh, atan, atanh, ceil, cos, cosh, exp,
	floor, loge, pow (**, ^), log, sin, sinh, tan, tanh,
	~~~diff, integral~~~
</strong>
```
very simple math functions
(math:loge 12) => return value with e as base
(math:log 2 8) => 3
math:pow == ** == ^
(^ 3/4 2) => 9/16

experimental "diff" "integral" functions from sicp
diff: (diff lambda diff_point error) where error is 0.000001 by default
	eg:
		(diff (lambda [x] (* x x)) 12) => 23.9999989731
		(diff (lambda [x] (* x x x)) 2 0.0001) => 11.9994000100. which is near 3*x^2 when x = 2 => 12
		
integral: (integral lambda a b dx) integral lambda from a to b with dx. dx is 0.01 by default
	eg:
		(integral (lambda [x] x) 0 1) => 0.5000000000
```
<h2> Bitwise Module </h2>
```
(bitwise:and a b)  ;; &   and
	eg: (bitwise:and 0x2 0x1) => 0
(bitwise:or  a b)  ;; |   or 
	eg: (bitwise:or 0x2 0x1) => 3
(bitwise:not a)    ;; ~   not 
	eg: (bitwise:not 0x1) => -2 2'complement
(bitwise:xor a b)  ;; ^   xor
	eg: (bitwise:xor 0x5 10) => 15
(bitwise:<<  a b)  ;; <<  left shift
	eg: (bitwise:<< 3 2) => 12
(bitwise:>>  a b)  ;; >>  right shift
	eg:  (bitwise:>> 8 2) => 2
```
<h2> Require Module </h2>
<strong>(might be changed in the future) # require nodejs support </strong>
```
"require" function. ps: this function might be changed in the future. (this function require nodejs support)

	(def as-name (require "the-module-you-want-to-load.toy"))

	suppose inside "test.toy" here is :
	-------------------------------------------------------------------
		(def (test) (display "You successfully required this file"))
		(def a {:b 12})
	-------------------------------------------------------------------

		then
			(def x (require "test.toy"))
		will assign x the value => {test < user-defined-procedure >, a {b 12,},}
		so
			(x:test) => print "You successfully required this file"
			x:a:b    => 12
"load" function: the same as the load function of scheme
	eg:
			[this-is-a-dir] -  a.toy
						     b.toy
			a.toy:
			(define x 12)

			b.toy:
			(load "a.toy")
			(display x) => 12

			run "b.toy" will print 12
```
<h2> Call JavaScript Function </h2>
```
    (js js_function_name arg0 arg1 arg2 ...)
    eg:
		(js "Date") => current date as string
		(js "Math.sin" 12) => Math.sin(12)
		(js "Object.keys" {:a 12}) => ['a']

```
<h2> embed toy in your javascript program </h2>
```
	<script src="another_another_toy.js"></script>
	<script type="text/javascript">
		var the_string_u_want_to_run = "(def x 12)"
		var output_value = eval_begin(parser(lexer(the_string_u_want_to_run)), ENVIRONMENT); // parse and eval
	</script>
```
<strong>
	My Idea
	Function define, default argument value
</strong>
```
	the function now can be defined as:
		(def add (lambda (a b) (+ a b)))

	Learn from Python
	So if I want to add default value for a, b. then I could define the function like
		(def add (lambda [:a 12 :b 15] (+ a b))) or (def (add :a 12 :b 15) (+ a b))
		then (add) will return 12 + 15  => 27 
			 (add :a 20) return 20 + 15 => 35
			 (add 14 :a 13) return 13 + 15 => 28; a will be assigned as 14 first, then assigned as 13.
			 (add :b 1 :a 2) return 2 + 1  => 3
 
		(def add (lambda [:a 12 b] (+ a b))) or (def (add :a 12 b) (+ a b)) => {:a 12, :b "undefined"}
		then (add 3)  will cause error because of => 12 + "undefined" => "12undefined"
		then (add 13 14) => {:a 13, :b 14}  => 13 + 14 => 27
	Okay. I just finished implementing this
```

<strong>
	Change Log:  
</strong>
```	
					
		 2/6/2014    0.3.29 : 1) fix string bug "Hello\n" \+ will work now
		 					  2) improve support for string:
		 					  		in toy language, symbol and string are the same thing
		 					  	in the previous version, string could be shown incorrectly sometimes:
		 					  		eg: ==== previous ========
		 					  			(def x '("Hello abc" abc))
		 					  			(display x) => (Hello abc abc)
		 					  		the space in "Hello abc" caused confusion
		 					  		so now I changed it to:
		 					  			==== now =============
		 					  			(def x '("Hello abc" abc))
		 					  			(display x) => (#str{Hello abc} abc) ;; #str{} means string

		 2/3/2014 ~ 2/5/2014    
		 			 0.3.28 : 1) support hexadecimal octal numbers
		 						 eg: (def x 0x123) ;; hexadecimal
		 						 	 (def x 0321)  ;; octal 

		 					  2) add bitwise 
		 					  		(bitwise:and a b)  ;; &   and
		 					  		(bitwise:or  a b)  ;; |   or 
		 					  		(bitwise:not a)    ;; ~   not 
		 					  		(bitwise:xor a b)  ;; ^   xor
		 					  		(bitwise:<<  a b)  ;; <<  left shift
		 					  		(bitwise:>>  a b)  ;; >>  right shift

		 					  3) fix [], {} display bug
		 					  4) fix "Hello :" : in string bug

         1/28/2014   0.3.27 : 1) fix string as procedure bug
         						 eg: ((car '(+)) 3 4) will cause error now
         						 	use ((car `(~+)) 3 4)
         					  2) improve macro
         					     eg:
         					     (def x 0)
         					     (defmacro test [] (if (eq? x 0) 1 2)))
         					     ((lambda [] 
         					     	(set! x 1) ;; change x to 1
         					     	(test)     ;; will still return 1 not 2(in this case x = 0 , (set! x 1) hasn't been run) 
         					     			   ;; the (test) above will be expanded as 1 after defining lambda
         					     	))
         					  3) I am now thinking that should I make difference between "symbol" and "string" data types.
         					  	eg: 
         					  		'a        !=       "a"
         					  		[symbol]          [string]  

        						(´(エ)｀ ?) 


         1/25/2014   0.3.26 : 1) fix "quasiquote" bug
		 					  2) fix "undefined?" "factorial" bug
		 					  3) rewrite "cond" in macro
		 1/21/2014   0.3.25 : 1) add "load" function (the same as scheme)
		 						eg:
		 						[this-is-a-dir] -  a.toy
		 									     b.toy
		 						a.toy:
		 						(define x 12)

		 						b.toy:
		 						(load "a.toy")
		 						(display x) => 12

								run "b.toy" will print 12



		 1/19/2014   0.3.24 : now semester starts!
		 					  1) it is now <strong>not</strong> available to define a vector like [1,2,3]
		 					  	so (def x [1,2,3]) is wrong
		 					  	please use (def x #[1,2,3]) ;; ps: #[...] is the same as #(...) when defining vector, but recommended to use #[...]
		 					  2) "["<=>"("   
		 					  	 "]"<=>")"   
		 					  	 so [def x 12] <=> (def x 12) 
		 					  	 
		 1/18/2014   0.3.23 : 1) improve macro, fix some macro bugs.
		 					  2) fix "and" "or" functions bug.
		 1/15/2014   0.3.22 : 1) Support function docstring
		 							usage:
		 								(defn add "Your doc here" [a b] (+ a b))
		 							So now "Your doc here is binded to function add"
		 							and you can get docstring by calling function
		 								(get-function-doc add) => "Your doc here"
		 							and you can set docstring by calling function
		 								(set-function-doc add "Your new docstring here")

		 1/15/2014   0.3.21 : 1) add "read-file", "write-file", <del>"get-curr-dir"</del> functions (these 3 functions require nodejs support)
		 						 usage:
		 						 	(read-file file-name) return string
		 						 	(write-file file-name string-that-write-to-file) write string to file
		 						 	(get-curr-dir) return current dir

		 					  2) add "require" function. ps: this function might be changed in the future. (this function require nodejs support)
		 					  		(def as-name (require "the-module-you-want-to-load.toy"))

		 					  		suppose inside "test.toy" here is :
		 					  		-------------------------------------------------------------------
		 					  			(def (test) (display "You successfully required this file"))
										(def a {:b 12})
									-------------------------------------------------------------------

										then
											(def x (require "test.toy"))
											will assign x the value => {test < user-defined-procedure >, a {b 12,},}
										so
											(x:test) => print "You successfully required this file"
											x:a:b    => 12

		 12/30/2013  0.3.20 : 1) Change math functions. Now all math functions belongs to math namespace.
		 					 	 So when calling sin(12), now use (math:sin 12) instead of (sin 12).
		 					  2) add "->int" function, which convert number to integer.
		 					  3) add "%" remainder function.
		 					  4) remove "while" function
		 12/29/2013  0.3.19 : After thinking carefully, I decided to replace the quick access of the value of dictionary according to key by using : instead of /
		 						eg:
		 					  			(def math {:add (lambda [a b] (+ a b))}) => ;;; def namespace "math" with property "add" ;;;
		 					  			(math:add 3 4) => 7 
		 12/29/2013  0.3.18 : 1) Redefinition of an existed variable is now not allowed... eg (def x 12) (def x 15) will cause error. in this case use (set! x 15)
		 					  2) Add ;;; comment ;;; support.
		 					  ~~~
		 					  3) Add quick access functionality for dictionary(Learnt from Clojure) (Deprecated)
		 					  		eg:
		 					  			(def math {:add (lambda [a b] (+ a b))}) => ;;; def namespace "math" with property "add" ;;;
		 					  			(math/add 3 4) => 7
		 					  ~~~

		 12/17/2013  0.3.17 : Add "input" "get-env" "gensym" "undefined?" functions.
		 					  "input" function requires u to write a function in javascript called "TOY_getINPUT" with parameter "stack_param"
		 					  for example:
		 					  	function TOY_getINPUT(stack_param) // stack param is parameter . (input "Hello") then stack_param is ["Hello"]; (input) then stack_param is []  
								{
								    if(stack_param.length == 0)
								        return prompt("");
								    else
								        return prompt(stack_param[0]);
								}
							   so calling "(def x (input 'user-input))" will call TOY_getINPUT and return string output.

		 12/16/2013  0.3.16 : Sorry;;;;;; Fix 'let' function bug... improve + - * / > < eq? >= <= functions
		 12/16/2013  0.3.15 : Improve macro to avoid the accidental capture of identifiers. (by using closure)
		                      eg: (defmacro test [x] `(list ~x))
		                          (test 12) => (12)
		                          (let [list +] (test 12)) => (12) ... it would return 12 in previous, but now it will return (12). Improved macro
		                      eg: (defmacro sett [var val] `(def ~var ~val))
		                          (def x 12)
		                          in the past:
		                          	(let [x 15] (sett x 20) x) => 20.
		                          	and the x in global scope is still 12
		                          now:
		                          	(let [x 15] (sett x 20) x) => 15. The x in this scope will not change
		                          	but the x in global scopte will change to 20

		 12/14/2013  0.3.14 : add 'set-car set-cdr' two functions... so sad for my differential equation final and cs418 final... huhhh... need to work harder ;)
		 12/05/2013  0.3.13 : fix 'integer?' function bug. Fix lambda bug. improve index.html of the 
		 					  terminal emulator.
		 					  Final Fighting!!! ;)
		 12/05/2013  0.3.12 : Improve lambda. Add 'read' 'diff' 'integra' '->float' functions. Improve error detection.           Final Fighting!!! ;)
		 12/02/2013  0.3.11 : Add ~@ support
		 11/28/2013  0.3.10 : Now support calling JavaScript functions using (js js_func_name arg0 arg1 arg2 ...).  Happy Thanksgiving! ;)
		 11/28/2013  0.3.09 : Add 'str' and 'map' functions. Fix 'string?' function bug.  Happy Thanksgiving! ;)
```
Fightint!!!!!! ;)
Enjoy!





