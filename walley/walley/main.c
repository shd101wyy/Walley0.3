//
//  main.c
//  walley
//
//  Created by WangYiyi on 4/27/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#include <stdio.h>
#include "walley.h"
int main(int argc, char *argv[]){
    printf("Walley Language 0.3.827\n");
    
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
    
    Walley_Run_File("/Users/wangyiyi/百度云同步盘/Github/Walley0.3/walley/walley/test.wa");
    return 0;
    
    if (str_eq(argv[1], "test")) {
        Walley_init();
        char s[1000] = "(def x {'a 12}) (x 'b 15) (x 'b)";
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
        
        printf("\n\n @@@ RUN VM @@@\n");
        printf("Instruction Length %ld \n", insts->length);
        Environment * env = createEnvironment();
        Object * acc = VM(insts->array, 0, insts->length, env);
        
        printf("\n\n @@@ Finish @@@ \n\n");
        //printf("%ld", acc->data.Vector.v[1]->data.Integer.v);
        printf("%ld", acc->data.Integer.v);
        // printf("%s", acc->data.String.v);
        // printf("%ld\n", env->frames[0]->length);
        // printf("%ld\n", env->frames[0]->array[38]->data.Integer.v);
    }
    else{ // run file
        Walley_Run_File(argv[1]);
    }
    return 0;
}














