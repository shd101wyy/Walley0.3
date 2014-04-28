//
//  main.c
//  walley
//
//  Created by WangYiyi on 4/27/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#include <stdio.h>
#include "vm.h"
int main(){
    
    Walley_init();
    char s[1000] = "(if 'a 'b 'c)";
    Lexer * p;
    p = lexer((char*)s);
    Lexer_Debug(p);
    
    Object * o;
    o = parser(p);
    parser_debug(o);
    
    Instructions * insts = Insts_init(); // init insts
    compiler_begin(insts,
                   o,
                   VT_init(),
                   NULL,
                   NULL);
    printInstructions(insts);
    /*
    long i = 0x4029000000000000;
    printf("\n%lf", *((double*)&(i)));
    */
    return 0;
}