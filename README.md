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
			<h1>	VERSION 0.3.01  FOR FUTURE AR,VR,AI  </h1>
			(display "Hello World ;)")
```
Toy Language is a simple script language written in JavaScript.  
Influenced by Walley 0.1, Walley 0.2, Scheme, JavaScript, Clojure...
It is a lisp dialect with an extremely simple and not efficient interpreter.  
It is easy to use.  

A Language For FUN ;)
  
 ===============  
<h2>Commands: </h2>
		toy    								# Run toy repl      
		toy [file_name]						# Run file [file_name]   
		toy compress [file_name]			# Compress file [file_name] to make it smaller    
											# will remove \n and extra spaces.  
===============
<h2>html terminal emulator</h2>
		./toy_terminal_emulator/index.html  # try toy language easily
===============   
<h2>Primitive Data Types: </h2>  
	```
	Ratio:    1 2 3 4/5 5/6   ...      
	Float:    1.2,  3.4,  5.6 ...  
	List :    '(1 2)  '(hello World)  
	Vector:   [1 2],   [3 4 5]  
	Dictionary: {:a 12} {:hello "World"}  
	Atom(String): "Hello World" 'Hello-world  
	Lambda:     (lambda [params] body)
	Macro:      (defmacro macro_name [params] body)
	-- Null(nil):   () 
	``` 
================   

<h2>Removed characters:</h2>  
	, \t \a \n space where be removed when parsing  
	comment: ; use ;
<h2>Abbreviation:</h2>
	' => quote          eg: 'Hello => (quote Hello)  
	"" => string        eg:  "Hello World"  
	: => keyword        eg:  :a => (keyword a)  
	~ => unquote        eq:  ~x => (unquote x)  
	` => quasiquote     eq:  `(~x x) => (quasiquote ((unquote x) x))  

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
	[1 2 3]  
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
		(defmacro square [x] `(* ~x ~x))  
```
===================      
<h2>Basic Use</h2>    
<strong> Define Variable </strong>  
```
(def var_name var_value)  
(def (function_name params) body)  
eg:  
	(def x 12)  
	(def x [1 2 3])  
	(def add (lambda [a b] (+ a b)))  
  
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
<strong>While</strong>  
```
(while (test) body)  ;;return "undefined"  
eg:  
	(def x 0)  
	(while (< x 100) (display x) (set! x (+ x 1)) )  
	;; will print x from 0 to 99  
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
<strong>ratio? integer? float? vector? dictionary? pair?(list?) null? atom?</strong>  
```
eg:  
	(typeof 12)          => "number"     ;; typeof function will return string
	(typeof '(1 2 3))    => "list"
	(ratio? 3/4)         => true  
	(integer? 3)         => true  
	(float? 3.0)         => true  
	(integer? 3.0)       =>false  
	(vector? [1 2 3])    => true  
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
	eg (->ratio 1.5)     => 3/2 convert number to rational number  

```
<h2>List Operation</h2>
<strong>
	car, cdr, cons  set-car! set-cdr! conj ref len pop slice ->str
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
```
<h2> Vector </h2>         
<strong>  
	assoc, assoc!, conj, conj!, pop, pop!, ref, ->str, slice, len, [quick-access]  
</strong>  
```
assoc:           return a new array, but change index-value  
	(def x [1 2 3])  
	(assoc x 0 12)  => return [12 2 3], keep x unchanged  
assoc!:          destructive assoc  
	(def x [1 2 3])  
	(assoc! x 0 12)  => will change x to [12 2 3]  
conj:           append element, like push. nondestructive, this function will return new vector  
	(def x [1 2 3])  
	(conj x 4) => return new vector [1 2 3 4]  
conj!:           destructive conj  
	(def x [1 2 3])  
	(conj x 4) => x now is [1 2 3 4]  
pop:             remove last element, return a new vector  
	(def x [1 2 3])  
	(pop x)        => [1 2]  

pop!:            destructive pop  
	(def x [1 2 3])  
	(pop! x)       => change x to [1 2]  
ref:             access element according to index  
	(ref [1 2 3] 0)  => return value at index 0, which is 1  
->str:           convert vector to string  
slice:           slice vector  
	(slice [1 2 3 4] 2 3)  => [3]   slice from 2 to 3  
len:             return the length of vector  
	(len [1]) => 1  
[quick-access]:  
	([1,2,3] 0)   => return the element at index 0  
```
<h2>  
MISC  
</h2>  
<strong>  
	quote, quasiquote, list, random, keyword, display  
</strong>  
```
quote: return value without calculation  
	(quote (1 2 3 4)) => (1 2 3 4) without calculation  
	(quote (+ 3 4))   => (+ 3 4)   
	(quote [1 2 3])   => (vector 1 2 3)  
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

keyword: return itself  
	:a => (keyword a) => return string a  

display:   display data types  
	(display "Hello World")  
	(display (/ 3 4))  
 
```


Hope I could transfer to CS successfully ;)






