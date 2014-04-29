//
//  main.c
//  walley
//
//  Created by WangYiyi on 4/27/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#include <stdio.h>
#include "vm.h"
int main(int argc, char *argv[]){
    printf("Walley Language 0.3.745\n");
    
    // ######################################################
    // ######################################################
    // ######################################################
    // ######################################################
    // ######################################################
    int i;
    // init sys_argv
    SYS_ARGV = Object_initVector(0, argc);
    SYS_ARGV->data.Vector.length = argc;
    SYS_ARGV->use_count = 1; // in use
    for(i = 0; i < argc; i++){
        vector_Set(SYS_ARGV, i, Object_initString(argv[i], strlen(argv[i])));
    }
    // ######################################################
    // ######################################################
    // ######################################################
    // ######################################################
    
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