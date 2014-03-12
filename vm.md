#Toy Language Virtual Machine Instructions

###every instruction is 16 bits 0xFFFF
===============================================  

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

CONST 0010 0100	;; nullv
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
CALL     0111 00000000000 0
  	     1- op param-num tail-call-flag  
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
       inst  jmp-steps
TEST 1001 000000000000 ;; test value in accumulator if pass run next, otherwise jmp
       inst   jmp-steps

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
