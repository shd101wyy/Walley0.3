//
//  vm.h
//  walley
//
//  Created by WangYiyi on 4/28/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#ifndef walley_vm_h
#define walley_vm_h
#include "compiler.h"

/*
    Init Walley Languge
    Set necessary values
 */
void Walley_init(){
    // init several constants
    GLOBAL_NULL = Object_initNull(); // init GLOBAL_NULL
    QUOTE_STRING = Object_initString("quote", 5);
    UNQUOTE_STRING = Object_initString("unquote", 7);
    UNQUOTE_SPLICE_STRING = Object_initString("unquote_splice", 14);
    QUASIQUOTE_STRING = Object_initString("quasiquote", 10);
    CONS_STRING = Object_initString("cons", 4);
    DEF_STRING = Object_initString("def", 3);
    SET_STRING = Object_initString("set", 3);
    LAMBDA_STRING = Object_initString("lambda", 6);
    
    CONSTANT_TABLE_FOR_COMPILATION = Object_initTable(1024);
    CONSTANT_TABLE_FOR_COMPILATION_LENGTH = 0;
}

#endif
