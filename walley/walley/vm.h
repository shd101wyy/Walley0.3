//
//  vm.h
//  walley
//
//  Created by WangYiyi on 4/28/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#ifndef walley_vm_h
#define walley_vm_h
#include "builtin_procedures.h"

static Object * Constant_Pool[1024]; // used to save symbols and strings
static unsigned int Constant_Pool_Length; 
/*
    Init Walley Languge
    Set necessary values
 */
void Walley_init(){
    // init several constants
    GLOBAL_NULL = Object_initNull(); // init GLOBAL_NULL
    GLOBAL_NULL->use_count = 1;
    
    QUOTE_STRING = Object_initString("quote", 5);
    QUOTE_STRING->use_count = 1;
    
    UNQUOTE_STRING = Object_initString("unquote", 7);
    UNQUOTE_STRING->use_count = 1;
    
    UNQUOTE_SPLICE_STRING = Object_initString("unquote_splice", 14);
    UNQUOTE_SPLICE_STRING->use_count = 1;

    QUASIQUOTE_STRING = Object_initString("quasiquote", 10);
    QUASIQUOTE_STRING->use_count = 1;

    CONS_STRING = Object_initString("cons", 4);
    CONS_STRING->use_count = 1;

    DEF_STRING = Object_initString("def", 3);
    DEF_STRING->use_count = 1;

    SET_STRING = Object_initString("set", 3);
    SET_STRING->use_count = 1;

    LAMBDA_STRING = Object_initString("lambda", 6);
    LAMBDA_STRING->use_count = 1;

    GLOBAL_TRUE = Object_initString("true", 4); 
    GLOBAL_TRUE->use_count = 1;
    
    
    CONSTANT_TABLE_FOR_COMPILATION = Object_initTable(1024); // init constant table
    // add those constants to table
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, QUOTE_STRING, Object_initInteger(0));         // 0
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, UNQUOTE_STRING, Object_initInteger(1));       // 1
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, UNQUOTE_SPLICE_STRING, Object_initInteger(2));// 2
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, QUASIQUOTE_STRING, Object_initInteger(3));    // 3
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, CONS_STRING, Object_initInteger(4));          // 4
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, DEF_STRING, Object_initInteger(5));           // 5
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, LAMBDA_STRING, Object_initInteger(6));        // 6
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, GLOBAL_TRUE, Object_initInteger(7));          // 7
    
    CONSTANT_TABLE_FOR_COMPILATION_LENGTH = 8; // set length
    
    // init Constant Pool according to CONSTANT_TABLE_FOR_COMPILATION
    Constant_Pool[0] = QUOTE_STRING;
    Constant_Pool[1] = UNQUOTE_STRING;
    Constant_Pool[2] = UNQUOTE_SPLICE_STRING;
    Constant_Pool[3] = QUASIQUOTE_STRING;
    Constant_Pool[4] = CONS_STRING;
    Constant_Pool[5] = DEF_STRING;
    Constant_Pool[6] = LAMBDA_STRING;
    Constant_Pool[7] = GLOBAL_TRUE;

    Constant_Pool_Length = 8; // set length
}



/*
 create frame0
 */
Object *createFrame0(){
    // Object * frame = Object_initVector(0, GLOBAL_FRAME_SIZE);
    Object * frame = allocateObject();
    frame->type = VECTOR;
    frame->data.Vector.size = GLOBAL_FRAME_SIZE;
    frame->data.Vector.length = 0;
    frame->data.Vector.resizable = 0;
    frame->data.Vector.v = GLOBAL_FRAME; //(Object**)malloc(sizeof(Object*) * (size)); // array of pointers
    frame->use_count = 1;
    // add builtin lambda
    vector_set_builtin_lambda(frame, 0, &builtin_cons);
    vector_set_builtin_lambda(frame, 1, &builtin_car);
    vector_set_builtin_lambda(frame, 2, &builtin_cdr);
    vector_set_builtin_lambda(frame, 3, &builtin_add);
    vector_set_builtin_lambda(frame, 4, &builtin_sub);
    vector_set_builtin_lambda(frame, 5, &builtin_mul);
    vector_set_builtin_lambda(frame, 6, &builtin_div);
    vector_set_builtin_lambda(frame, 7, &builtin_vector);
    vector_set_builtin_lambda(frame, 8, &builtin_vector_with_unchangable_length);
    vector_set_builtin_lambda(frame, 9, &builtin_vector_length);
    vector_set_builtin_lambda(frame, 10, &builtin_vector_push);
    vector_set_builtin_lambda(frame, 11, &builtin_vector_pop);
    vector_set_builtin_lambda(frame, 12, &builtin_num_equal);
    vector_set_builtin_lambda(frame, 13, &builtin_num_lt);
    vector_set_builtin_lambda(frame, 14, &builtin_num_le);
    vector_set_builtin_lambda(frame, 15, &builtin_eq);
    vector_set_builtin_lambda(frame, 16, &builtin_string_type);
    vector_set_builtin_lambda(frame, 17, &builtin_int_type);
    vector_set_builtin_lambda(frame, 18, &builtin_float_type);
    vector_set_builtin_lambda(frame, 19, &builtin_pair_type);
    vector_set_builtin_lambda(frame, 20, &builtin_null_type);
    vector_set_builtin_lambda(frame, 21, &builtin_lambda_type);
    vector_set_builtin_lambda(frame, 22, &builtin_strcmp);
    vector_set_builtin_lambda(frame, 23, &builtin_string_slice);
    vector_set_builtin_lambda(frame, 24, &builtin_string_length);
    vector_set_builtin_lambda(frame, 25, &builtin_string_append);
    vector_set_builtin_lambda(frame, 26, &builtin_make_table);
    vector_set_builtin_lambda(frame, 27, &builtin_table_keys);
    vector_set_builtin_lambda(frame, 28, &builtin_table_delete);
    vector_set_builtin_lambda(frame, 29, &builtin_file_read);
    vector_set_builtin_lambda(frame, 30, &builtin_file_write);
    // sys-argv
    vector_Set(frame, 31, SYS_ARGV);
    vector_set_builtin_lambda(frame, 32, &builtin_int_to_string);
    vector_set_builtin_lambda(frame, 33, &builtin_float_to_string);
    vector_set_builtin_lambda(frame, 34, &builtin_input);
    vector_set_builtin_lambda(frame, 35, &builtin_display_string);
    vector_set_builtin_lambda(frame, 36, &builtin_string_to_int);
    vector_set_builtin_lambda(frame, 37, &builtin_string_to_float);
    
    frame->data.Vector.length = 38; // set length
    return frame;
}
/*
 create environment
 */
Object *createEnvironment(){
    Object * env = Object_initVector(1, ENV_SIZE); // create env
    env->data.Vector.v[0] = createFrame0();  // add frame0
    env->data.Vector.length = 1;
    env->use_count = 1;
    
    return env;
}

/*
 copy environment
 */
Object *copyEnvironment(Object * env){
    int i = 0;
    int size = env->data.Vector.size;
    int length = env->data.Vector.length;
    Object * new_env = Object_initVector(1, size);
    for(i = 0; i < length; i++){
        new_env->data.Vector.v[i] = env->data.Vector.v[i];
    }
    new_env->data.Vector.length = length;
    new_env->use_count = 1;
    return new_env;
}




























#endif
