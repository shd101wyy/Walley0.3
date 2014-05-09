;;; Walley Language 0.4 by Yiyi Wang
;;; a language that is actually lisp with beautiful syntax sugar

def x 12  ;; <=> (def x 12)
def y 16
def add lambda (a b)
    (+ a b)
end

def add lambda{[a b] (+ a b)};
let{[a b] (+ a b)}


def sub lambda (a b)
    -[a b]  ;; same as (- a b)
end

;; <=>
def sub lambda{[a b] (- a b)}
;; <=>
def sub (lambda [a b]
            -[a b])
;; 如果前面有 ( , 则判定为没有 end


defmacro defm 
    [(name args . body)
     defmacro ~name
        [~args ~@body]
     end]
end 


(add 4 5) ;; same as add[4 5]

def max lambda (a b)
    if (> a b)
        a
    else
        b
    end
end

def mac lambda{[a b]
    if{(> a b)
        a
        b
        }
    }

defm swap (a b)
    let temp ~a do
        set! ~a ~b
        set! ~b ~temp
    end
end


defm defn (name args . body)
    def ~name lambda ~args ~@body end
end

set! test lambda (fn a)
    (fn 12)
end

(test lambda (a) (display a) end
      "hi")
test[lambda (a) display[a] end
    "hi"]

def z #(1 2 3)
(z 0 12) ;; z => #(12 2 3)
;; or z[0 12]... probably
;; good idea func[arg0 arg1 arg2]. <=> (func arg0 arg1 arg2)
set! y z[12]
;; def class
def Person lambda ()
    def self {}
    self['age 12]
    self['showAge lambda () display[self:age] end]
    ;; or
    ;; (self :age 12)
    ;; (self :showAge lambda () display[self:age] end)
    self ;; return self
end

def yiyi Person[]
yiyi:age ;; =? 12
yiyi:showAge[] ;; => 12

;; iteration
for i 0 10 do
    . body
end

while (< i 0) do
    (display i)
    set! i (+ i 1)
end

defm infix [a opcode b]
    (~opcode ~a ~b)
end

infix a + b end

;; macro
defmacro square 
    [(a b) (* ~a ~b)]
    [(a) (* ~a ~a)]
end

def test lambda (a b c)
    if (> a b) 
        a 
    elif (> b c)
        b 
    else 
        c
    end
end 

set! add1
    lambda (a . b)
        (+ a b[0])
    end

def x 
    let a 12
        b 15 do 
      (+ a b) 
    end

def RatioNumber lambda [a b]
    {:numerator b
     :denominator a 
     :display lambda [a b] (string-append a b c) end} 
end  

def r RatioNumber[3,4]
display[ r[:numerator] ]

def list-ref lambda [l n]
    if (= n 0)
        car[l]
    else
        list-ref[cdr[l], n]
    end
end 

def list-ref lambda{[l n]
    if{(= n 0)
        car[l]
        list-ref[cdr[l], n]
        }
    }

def list-length lambda [l]
    if (null? l)
        0
    else 
        (+ 1 list-length[cdr[l]])
    end
end

;; <=>
def list-length (lambda [l]
    (if (null? l)
        0
    else
        (+ 1 list-length[cdr[l]])))

def list-append lambda [l, p]
    if (null? l)
        p 
    else
        cons[car[l], 
             list-append[cdr(l), p]]
    end
end

;; defs a 12 b 13 end => def a 12 def b 13 
defmacro defs
    [(~a ~b) def ~a ~b]
    [(~a ~b . args)
        begin def ~a ~b 
              defs ~@args
        end]
end  

def abs lambda (a)
    if (> a 0)
        a 
    elif (< a 0)
        (- a)
    else 
        0 
    end
end

;; two ways of defining factorial
def factorial lambda (n)
    if (= n 0)
        1 
    else
        (* n factorial[(- n 1)])
    end
end

def factorial lambda (n)
    def factorial-iter lambda (n result)
        if (= n 0)
            result 
        else 
            factorial-iter[(- n 1)
                           (* result n)]
        end
    end
end

def fib lambda [n]
    if (= n 0)
        0
    elif (= n 1)
        1
    else
        (+  fib[(- n 1)]
            fib[(- n 2)])
    end 
end 

defm defn [name args . body]
    def ~name lambda ~args 
        ~@body end
end 

defn expt (a b)
    if (= b 0)
        a 
    else 
        (* a expt[a (- b 1)])
    end
end


;; sicp 2.1
def x cons[12 14]
def n car[x]
def b cdr[x]
defn make-rat [a b]
    cons[a, b]
end

defn numer [n] car[n] end
defn denom [n] cdr[n] end
def one-half make-rat[1 2]
defn add-rat [a b] 
    make-rat[(+ (* numer[x] denom[y])
                (* numer[y] denom[x])), 
             (* denom[x] denom[y])]
end

;; 2.2
def x list[1, 2, 3, 4]
def y list[:a 12 :b 15]


def abs lambda [a]
    if (> a 0)
        a
        (- a)
    end
end

def max lambda [l]
    def max_ car[l]
    while not[null?[l]]
        if (> car[l] max_)
            max_ = car[l]
        end
    end
    max_
end

(defn abs [a]
    (if (> a 0)
        a
        (- a)))

defn abs [a]
    if (> a 0)
        a
        (- a)



def x 3 + 4

def add function (a b) a + b end

def swap function (a b)
    let temp a do
        set! a b
        set! b a
    end
end

def swap function(a b)
    let 


def a 12
def b 13
swap[a b]

def max function ( . l)
    def max-iter function (l m) 
        if null?[l]
            m
        elif car[l] > m
            max-iter[cdr[l],
                     car[l]]
        else
            max-iter[cdr[l]
                    m]
    max-iter[l car[l]]
    end

(定义 x 12)
(定义 y 20)
(+ x y)
(定义 add (函数 (a b) 
               (+ a b)))
(定义 z (add x y)) 
(定义 max (函数 (. l)
    (定义 max-iter (函数 (l m)
                    (如果 (null? l)
                        m
                    (如果 (> (car l) 
                             m)
                        (max-iter (cdr l)
                                  (car l))
                        (max-iter (cdr l)
                                  m)))))
    (max-iter l (car l)))












































































