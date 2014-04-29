//
//  walley.h
//  walley
//
//  Created by WangYiyi on 4/28/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#ifndef walley_walley_h
#define walley_walley_h
#include "vm.h"

/*
 read ints and return instructions
 0: fail
 1: success
 */
int read_ints (const char* file_name, unsigned short ** instructions, int * len){
    FILE* file = fopen (file_name, "r");
    if(!file){
        printf("Failed to read file\n");
        return 0;
    }
    int num = 0;
    unsigned int i = 0;
    unsigned int length = 0;
    while (fscanf(file, "%x ", &num) > 0)
    {
        switch (i){
            case 0:
                length = num << 16;
                break;
            case 1:
                length = length | num;
                *len = length; // get length
                (*instructions) = malloc(sizeof(int) * length); // init instructions
                break;
            default:
                (*instructions)[i - 2] = num;
                break;
        }
        i++;
    }
    fclose (file);
    return 1;
}
/*
    suppose run .wa file
 */
void Walley_Run_File(char * file_name){
    // read content from file
    FILE* file = fopen(file_name,"r");
    if(file == NULL)
    {
        printf("Failed to read file %s\n", file_name);
        return; // fail to read
    }
    
    fseek(file, 0, SEEK_END);
    long int size = ftell(file);
    rewind(file);
    
    char* content = calloc(size + 1, 1);
    
    fread(content,1,size,file);
    
    fclose(file); // 不知道要不要加上这个
    
    // init walley
    Walley_init();
    
    Lexer * p = lexer(content);
    printf("\n\n@@@ LEXER @@@\n");
#if WALLEY_DEBUG
    Lexer_Debug(p);
#endif
    printf("\n@@@ PARSER @@@\n");
    Object * o;
    o = parser(p);
#if WALLEY_DEBUG
    parser_debug(o);
#endif
    
    Instructions * insts = Insts_init(); // init insts
    compiler_begin(insts,
                   o,
                   VT_init(),
                   NULL,
                   NULL);
    printf("\n\n@@@ INSTRUCTIONS with length %ld \n", insts->length);
#if WALLEY_DEBUG
    printf("@@@@ CONSTANTS TABLE \n");
    printInstructions(CONSTANT_TABLE_INSTRUCTIONS);
    printf("\n@@@@ Proram \n");
    printInstructions(insts);
#endif
    printf("\n\n");
    Environment * env = createEnvironment();

#if WALLEY_DEBUG
    Object * v = VM(insts->array, 0, insts->length, env);
    printf("\n@@@@ Finish Running VM \n");
    if (v->type == USER_DEFINED_LAMBDA) {
        printf("\nUser Defined Lambda\n");
        printf("env length %d\n", v->data.User_Defined_Lambda.env->length);
        printf("%d\n", v->data.User_Defined_Lambda.env->frames[0]->length);
        if (v == v->data.User_Defined_Lambda.env->frames[0]->array[39]) {
            printf("Equal %d\n", v->use_count);
            printf("top frame length %d\n", v->data.User_Defined_Lambda.env->frames[1]->length);
            printf("fuck %ld\n", v->data.User_Defined_Lambda.env->frames[1]->array[0]->data.Integer.v);
        }
    }
    else if (v->type == INTEGER){
        printf("\nInteger\n");
        printf("use-count %d\n", v->use_count);
        printf("%ld\n", v->data.Integer.v);
        
    }
    else if (v->type == STRING){
        printf("\nString\n");
        printf("use-count %d\n", v->use_count);
        printf("%s\n", v->data.String.v);
    }
#else
    VM(insts->array, 0, insts->length, env);
#endif
    return;
}

#endif



