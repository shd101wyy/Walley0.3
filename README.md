

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
			(display "Hello World")

Toy Language is a simple script language written in JavaScript.  
It is a lisp dialect with an extremely simple and not efficient interpreter.  
It is easy to use.  
  
 ===============  
<h2>commands: </h2>
		toy    								# Run toy repl      
		toy [file_name]						# Run file [file_name]   
		toy compress [file_name]			# Compress file [file_name] to make it smaller    
											# will remove \n and extra spaces.  
===============   
<h2>Primitive Data Types: </h2>  
  
	Ratio:    1 2 3 4/5 5/6   ...      
	Float:    1.2,  3.4,  5.6 ...  
	List :    '(1 2)  '(hello World)  
	Vector:   [1 2],   [3 4 5]  
	Dictionary: {:a 12} {:hello "World"}  
	Atom(String): "Hello World" 'Hello-world  
	Lambda:     (lambda [params] body)
	Macro:      (defmacro macro_name [params] body)
	-- Null(nil):   ()  
================   

<h2>Removed character:</h2>  
	, \t \a \n space where be removed when parsing  
<h2>Abbreviation:</h2>
	' => quote          eg: 'Hello => (quote Hello)  
	"" => string        eg:  "Hello World"  
	: => keyword        eg:  :a => (keyword a)  
	~ => unquote        eq:  ~x => (unquote x)  
	` => quasiquote     eq:  `(~x x) => (quasiquote ((unquote x) x))  

<h2> Builtin Procedures and Macros </h2>  

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
  
===================      
<h2>Basic Use</h2>    
<strong> Define Variable </strong>  
(def var_name var_value)  
(def (function_name params) body)  
eg:  
	(def x 12)  
	(def x [1 2 3])  
	(def add (lambda [a b] (+ a b)))  
  
	;; define lambda  
	(def (add a b) (+ a b))    

<strong> Change Variable Value </strong>  
(set! var_name var_value)   ;; destructive ;;  
eg:  
	(set! x 12)  
	(set! x {:a 12})  

<strong> If </strong>  
(if test consequent alternative)  
eg:
	(if true 1 2)  => 1  
	(if false 1 2) => 2  
<strong> Cond </strong>
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


Arithematics:  
<storng>+ - * / </storng>  
:Parameters     arg0, arg1, ... only support number type now  
:eg  (+ 3 4)      => 7  
	 (* 4 5 6 7)  => 840  
	 (/ 3 6 7)    => 1/14  
	 (/ 3.0 6 7)  => 0.07142857142857142  
	 (- 3)        => -3  





















