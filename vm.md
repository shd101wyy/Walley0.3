#Walley Language Virtual Machine Instructions

###every instruction is 16 bits 0xFFFF
```
===============================================  
Now I begin to write Walley Lanuage in C language
Its Virtual Machine is different from the JavaScript Version. 

Supported Data Type:
	integer                    64bit long
	Double                     64bit double
	Ratio                      2 64 bit long
	String
	Vector 
	Table
	User_Defined_Lambda
	NULL

Todo List:
	Support Macro
	Support Call-CC
	Compile to JavaScript
	Make Virtual Machine more efficient
	Improve Garbage Collection 
	Support UTF 8
	...

(~ *_*)~

===============================================
```

####INSTRUCTIONS:
1. SET        0x0  
2. GET        0x1  
3. CONST      0x2  
4. MAKELAMBDA 0x3  
5. RETURN 	   0x4  
6. NEWFRAME   0x5  
~~POP        0x5~~  
7. PUSH_ARG 	   0x6  
8. CALL 	   0x7  
9. JMP 	   0x8  
10. TEST 	   0x9  
11. SET_TOP  0xA  保存到最top的frame上
=================================================  
### first 4 bits instructions
```
;; 3 basic insts  
SET 0000 000000000000 ;; can save 2**12 = 4096 frames
											;; each frame has max 65536 values
                      ;; set value from accumulator to stack

    1- op frame-index : 4 + 12
    2- value-index    : 16
		eg: 0000 000000000000 ;; set to frame 0
		    0000000000000001  ;; index 1
----------------------------------------------------------------
GET 0001 000000000000 ;;  get
    	 	      			 ;; get value from stack to accumulator
		1- op frame-index : 4 + 12
		2- value-index    : 16
----------------------------------------------------------------
CONST 0010 0001       ;; integer  64 bits
		1- op type
		2- 48 ~ 64 bits
		3- 32 ~ 48 bits
		4- 16 ~ 32 bits
		5- 0 ~ 16 bits

CONST 0010 0010       ;; float    64 bits. 32 bits integer, 32 bits decimal(10 digits)
CONST 0010 0011 	;; string   n bits
    	0xFFFF          ;; string length. Maximum 65536
    1- op type
		2- length : 16
		3- ... until reach 0x00, each char take 8 bits

		after finish.
		push to CONSTANT_TABLE

CONST 0010 0100	;; nullv
CONST GET 0010 0101 ;; get constant from constant table
----------------------------------------------------------------

eg:
(def x 12)
0x2100 0x0000 0x0000 0x0000 0x000C ;; get constant 12
0x0position

(def x 12.4)
0x2200 0x0000 0x000C 0x4000 0x0000 ;; get constant 12 and 4/10
       	      	     	    	   ;; this part might be wrong
0x0position

(def x "Hello")
0x2300 4865 6c6c 6f00
       H e  l l  o end

----------------------------------------------------------------
MAKELAMBDA 0011 000000      00000            0     ;; make lambda
  	    1- op param-num variadic-place has-variadic : 4 6 5 1
				2- next-pc. jump over the lambda body 跳过内容
				3- frame-length.  the length of frame that need to be created...
----------------------------------------------------------------
RETURN 0100 000000000000				       ;; return accumulator
  	     op             		               ;; get 1 => last-env
			                        	        ;; get 2 => last-inst according to return-address-index => return-address
				1- op : 4
eg:
(def (test a) a)
----------------------------------------------------------------
0x3001 ;; make lambda with one parameter and no variadic value
0x0003 ;; jump 3 steps to finish lambda
0x1 postion of a  ;; save a to accumulator
0x100
----------------------------------------------------------------
NEWFRAME 0101 00000000000 0    ;; create new frame to store arguments
          op
				1- op : 4
----------------------------------------------------------------
PUSH_ARG 0110 000000000000  ;; push accumulator to current-frame
				1- op index
----------------------------------------------------------------
CALL     0111 000000000000
  	     1- op param-num
  	     ;; 在以后不需要再用到 param-num， 因为在compile的时候会做检查
  	     ;; store 1=> push current-env to new-frame index0
				 ;; store 2=> push next inst index to new-frame index1
	   before calling: save return_address to new frame. set that to pc after finish calling function
	   return_adress is 32 bits
----------------------------------------------------------------
eg:
	(test a)
	0x2--- ;; get test
	0x6000 ;; push to new frame
	0x2--- ;; get a
	0x6000 ;; push to new frame
	0x7--- ;; call function with param-num. get pushed lambda
		;; push current-env to new-env ; save env
		;; push return-address to new-env; save return-address
		;; push parameters


----------------------------------------------------------------

JMP 1000 000000000000 ;; jmp forward or backwards
    jmp require 3 pcs

		1000 000000000000 opcode
		00000000000000000 jmp steps, which is 32 bits
		00000000000000000

----------------------------------------------------------------
TEST 1001 000000000000 ;; test value in accumulator if pass run next, otherwise jmp
    test require 2 pcs
		1001 000000000000 opcode
		00000000000000000 jmp steps

----------------------------------------------------------------
SET_TOP 1010 0000000000000  1
		---- index -------  2

----------------------------------------------------------------


self in lambda

(lambda [n] (if (= n 0) 1 (* n (self (- n 1))))) ;; factorial

----------------------------------------------------------------
(def (a))                         (lambda)

return-address
-----------------            --------------------
save-env                       return-address
-----------------            --------------------
a                                   save-env
-----------------            --------------------
----------------------------------------------------------------
For (let [var0 val0 var1 val1] body)

NEWFRAME ;; create new frame
Calculate_val0
PUSH_ARG 0 ;; push to index0 at current frame
...
Body     ;; compile body
RETURN


```

----------------------------------------------------------------  
```lisp
(def (math_library)
	(def self {}) ;; create dictionary
  (self 'sin math:sin)
  (self 'cos math:cos))

(def a (math_library)) => get all this: variables, remove this: qualifier
(a:sin 12)

(def (person)
	(def self {})
	(self 'age 12) ;;  age
	(self 'get-age (lambda [] self:age)) ;; get age
	(self 'set-age (lambda [new-age] (self 'age new-age))) ;; set age
	)
(def yiyi (person)) ;; create object yiyi
(yiyi:set-age 20)   ;; set age to 20
(display (yiyi:get-age)) ;; print 20

```
----------------------------------------------------------------
#### macro
```
;; define macro
(defmacro square
	[[x] [* ~x ~x]])
(square 12) => (* x x)

;; pattern match
(defmacro test
	[[#in x] [* ~x ~x]]  ;; # means match constant
	[[x] [* ~x ~x ~x]])
(test in 15) => (* 15 15)
(test 15)    => (* 15 15 15)

;; (defmacro begin2
      [[. args]  [begin ~@args]])

;; define one macro
(defm square [x] [* ~x ~x])
(square 15) => (* 15 15)

;; macroexpand-1
(macroexpand-1 (square 12)) => (quote (* 12 12))
 ```


------------------------------------------------------------------
#### object (originally dictionary)
```
Object in toy language is implemented using Hashtable( Originally AVL tree )
(def x {'a 12 'b 15 'add (lambda [a b] (+ a b))})  
x:a => 12
(x:add 3 4) => 7

~~~key : "remove", "builtin-properties" are reserved~~~

```

------------------------------------------------------------------

我的想法
设定一个 symbol table
例如
symbol id
a       0
b       1
c       2

(string->id "hello")
创建symbol hello with id 3

==============================
### 以下的放弃了

symbol table
定长array, like hashtable, but fixed length.
symbol 作为 key

例如
1 17 33 49

0  1  2  3

size 5: 1 2 3 4     1
size 6: 1 5 3 1     2
size 7: 1 3 5 0     3

1 15 16 29

0  1  2  3

size 5: 1 0 1 4
size 6: 1 3 1 6
size 7: 1 1 2 1
size 8: 1 7 0 5
===============================

(struct point [x y])
=>

(lambda [x y]
	(def _               ;; define out
		(vector
			(lambda [] x)             ;; get x
			(lambda [x_] (set! x x_)) ;; set x
			(lambda [] y)             ;; get y
			(lambda [y_] (set! y y_)) ;; set y
			(lambda [v] (eq? _ v))    ;; check eq?
		)))
(def (point-x v)
	((vector-ref v 0)))
(def (point-x-set! v v_)
	((vector-ref v 1) v_))
	...
(def (point? v v_)
	((vector-ref v #n) v_))


(def x (struct-point 3 4))



;; doesnt support parent yet
(def-object Point 
	;; methods
	[make (lambda [x_ y_]   ;; 第一个函数是 constructor
			(def x x_)
			(def y y_))            
	 x (lambda [] x)
	 y (lambda [] y)
	 x-set! (lambda [x_] (set! x x_))
	 y-set! (lambda [y_] (set! y y_))])

	  || 
	  \/

(def (Point-make x_ y_)
	(def x x_)
	(def y y_) 
	(def Point (vector (lambda [] x)                  ;; x
				   	   (lambda [] y)                  ;; y
				       (lambda [x_] (set! x x_))      ;; x_
				       (lambda [y_] (set! y y_))))    ;; y_
				       (lambda [v] (eq? Point v))     ;; ?
	Point)

(def (Point-x o)
	((vector-ref o 0)))

...
(def (Point? o v)
	((vector-ref o 4) v))

================================
(+ 3 4)
get + first,
if it is builtin in
set current-frame-pointer to top frame
set current-top-frame to top frame
save + to linked list pending_lambdas
when meet call, get that lambda from pending_lambdas



























































