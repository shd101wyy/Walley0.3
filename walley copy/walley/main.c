//
//  main.c
//  walley
//
//  Created by WangYiyi on 4/27/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#include <stdio.h>
#include "parser.h"
int main(){
    
    char s[1000] = "12.4";
    Lexer * p;
    p = lexer((char*)s);
    Lexer_Debug(p);
    
    Object * o;
    o = parser(p);
    parser_debug(o);
    return 0;
}