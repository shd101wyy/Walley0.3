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
    
    String_debug(Lexer("(define x 12/4)"));
	return 0;
}
