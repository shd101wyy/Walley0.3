Toy Language Virtual Machine Instructions

every instruction is 16 bits
0xFFFF
===============================================
INSTRUCTIONS:
SET        0x0
GET        0x1
CONST      0x2
MAKELAMBDA 0x3
RETURN 	   0x4
NEWFRAME   0x5
PUSH 	   0x6
CALL 	   0x7
JMP 	   0x8
TEST 	   0x9

Builtin Lambdas
SPECIAL INSTRUCTIONS:
SPECIAL    0xA XXX
	   CONS       0xA001
	   CAR        0xA002
	   CDR        0xA003
	   VECTORSET  0xA004
	   VECTORREF  0xA005


================================================
first 4 bits instructions

;; 3 basic insts
# SET 0000 000000000000 ;; can save 4096 variables
    	 	      ;; set value from accumulator to stack

# GET 0001 000000000000 ;; can get  4096 variables
    	 	      ;; get value from stack to accumulator

# CONST 0010 0001       ;; integer  64 bits
# CONST 0010 0010       ;; float    64 bits. 32 bits integer, 32 bits decimal(10 digits)
# CONST 0010 0011 	;; string   n bits
  	0xFFFF          ;; string length. Maximum 65536
# const 0010 0100	;; nullv
      0xffff 0xffff ;; end when see 0x00 which means end

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


# MAKELAMBDA 0011 000000    000000     ;; make lambda
  	     inst  variadic  param num
# RETURN 0100 000000000000 ;; return accumulator
  	      		   ;; get 1 => last-env 
			   ;; get 2 => last-inst
eg:	     
(def (test a) a)

0x3001 ;; make lambda with one parameter and no variadic value
0x1 postion of a  ;; save a to accumulator

# NEWFRAME 0101 000000000000    ;; create new frame to store arguments 
  	   inst  value-location ;; get parameters num
	   	 		;; push parameters to current-env
				;; when calling, pop those parameters and push them
				;; to new env
	   

# PUSH     0110 000000000000    ;; push accumulator to current-env
# CALL     0111 000000000000    ;; pop parameters from current-env
  	   inst	 value-location	;; and append to new-env, run insts in lambda
  	   			;; store 1=> push current-env to new-env
				;; store 2=> push next inst index to new-env

eg:
	(test a)
	0x50000 ;; make frame
	0x2---- ;; get a
	0x60000 ;; push to new frame
	0x7---- ;; call function at location



# JMP 1000 000000000000 ;; jmp forward or backwards
       inst  jmp-steps
# TEST 1001 000000000000 ;; test value in accumulator if pass run next, otherwise jmp
       	inst   jmp-steps

# CONS 1010 000000000000 ;; pop two value from stacks and cons them, return to accumulator




