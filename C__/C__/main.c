//
//  main.c
//  C__
//
//  Created by WangYiyi on 2/13/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#include "lexer_parser.c"
int main()
{
	Object * a = Object_initInteger(12);
	String_debug(a);
	Object * b = Object_initDouble(12.35);
	String_debug(b);
	Object * c = Object_initString("Hello World");
	String_debug(c);
	Object * d = cons(a, b);
    Object * e = cons(d, NULL);
	String_debug(e);
    
    Object * x = Lexer("(define x {1 2 3}) (define x #[1,2,3]) (define x (lambda [a b] (+ a b))) (define x '(q e v 12 3))");
    String_debug(Parser(x));
	return 0;
}
