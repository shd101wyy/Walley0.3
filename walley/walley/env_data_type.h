//
//  env_data_type.h
//  walley
//
//  Created by WangYiyi on 4/29/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#ifndef walley_env_data_type_h
#define walley_env_data_type_h
#include "compiler_data_type.h"

#define MAX_STACK_SIZE 1024
#define GLOBAL_FRAME_SIZE 1024
static Object * GLOBAL_FRAME[GLOBAL_FRAME_SIZE];

static Object * Constant_Pool[1024]; // used to save symbols and strings
static unsigned int Constant_Pool_Length;

static Object* CONSTANT_TABLE_FOR_COMPILATION;
static unsigned long CONSTANT_TABLE_FOR_COMPILATION_LENGTH;

// instructions used to save contant...
static Instructions * CONSTANT_TABLE_INSTRUCTIONS;
static unsigned long CONSTANT_TABLE_INSTRUCTIONS_TRACK_INDEX; // 保存上次的运行PC


/*
 Init Walley Languge
 Set necessary values
 */
void Walley_init(){
    // init several constants
    GLOBAL_NULL = Object_initNull(); // init GLOBAL_NULL
    GLOBAL_NULL->use_count = 1;
    
    QUOTE_STRING = Object_initString("quote", 5); // 0
    QUOTE_STRING->use_count = 1;
    
    UNQUOTE_STRING = Object_initString("unquote", 7); // 1
    UNQUOTE_STRING->use_count = 1;
    
    UNQUOTE_SPLICE_STRING = Object_initString("unquote-splice", 14); // 2
    UNQUOTE_SPLICE_STRING->use_count = 1;
    
    QUASIQUOTE_STRING = Object_initString("quasiquote", 10); // 3
    QUASIQUOTE_STRING->use_count = 1;
    
    CONS_STRING = Object_initString("cons", 4); // 4
    CONS_STRING->use_count = 1;
    
    DEF_STRING = Object_initString("def", 3); // 5
    DEF_STRING->use_count = 1;
    
    SET_STRING = Object_initString("set!", 4); // 6
    SET_STRING->use_count = 1;
    
    LAMBDA_STRING = Object_initString("lambda", 6); // 7
    LAMBDA_STRING->use_count = 1;
    
    GLOBAL_TRUE = Object_initString("true", 4); // 8
    GLOBAL_TRUE->use_count = 1;
    
    
    CONSTANT_TABLE_FOR_COMPILATION = Object_initTable(1024); // init constant table
    // add those constants to table
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, QUOTE_STRING, Object_initInteger(0));         // 0
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, UNQUOTE_STRING, Object_initInteger(1));       // 1
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, UNQUOTE_SPLICE_STRING, Object_initInteger(2));// 2
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, QUASIQUOTE_STRING, Object_initInteger(3));    // 3
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, CONS_STRING, Object_initInteger(4));          // 4
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, DEF_STRING, Object_initInteger(5));           // 5
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, SET_STRING, Object_initInteger(6));        // 6
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, LAMBDA_STRING, Object_initInteger(7));          // 7
    Table_setval(CONSTANT_TABLE_FOR_COMPILATION, GLOBAL_TRUE, Object_initInteger(8));
    
    CONSTANT_TABLE_FOR_COMPILATION_LENGTH = 9; // set length
    
    // init Constant Pool according to CONSTANT_TABLE_FOR_COMPILATION
    Constant_Pool[0] = QUOTE_STRING;
    Constant_Pool[1] = UNQUOTE_STRING;
    Constant_Pool[2] = UNQUOTE_SPLICE_STRING;
    Constant_Pool[3] = QUASIQUOTE_STRING;
    Constant_Pool[4] = CONS_STRING;
    Constant_Pool[5] = DEF_STRING;
    Constant_Pool[6] = SET_STRING;
    Constant_Pool[7] = LAMBDA_STRING;
    Constant_Pool[8] = GLOBAL_TRUE;
    
    Constant_Pool_Length = 9; // set length
    
    // init CONSTANT_TABLE_INSTRUCTIONS for compiler
    CONSTANT_TABLE_INSTRUCTIONS = Insts_init();
    CONSTANT_TABLE_INSTRUCTIONS_TRACK_INDEX = 0;
}

/*
 construct frame for environment
 */
struct Environment_Frame {
    Object ** array;
    int length;
    int use_count;
};

/*
 free frame
 */
void EF_free(Environment_Frame * ef){
    if (ef->use_count == 0) {
        int i;
        for (i = 0; i < ef->length; i++) {
            ef->array[i]->use_count--;
            Object_free(ef->array[i]);
        }
        free(ef->array);
        free(ef);
    }
    return;
}
/*
 create frame with size
 */
Environment_Frame * EF_init_with_size(int size){
    Environment_Frame * frame = malloc(sizeof(Environment_Frame));
    frame->length = 0;
    frame->array = malloc(sizeof(Object*)*size);
    frame->use_count = 0;
    return frame;
}
#define EF_set_builtin_lambda(v_, index, o_) ((v_)->array[(index)] = Object_initBuiltinLambda(o_))
/*
 construct environment
 */
struct Environment{
    Environment_Frame ** frames;
    int length;  // max length MAX_STACK_SIZE
};

void Env_free(Environment * env){
    int i;
    for (i = 0; i < env->length; i++) {
        // env->frames[i]->use_count--;
        EF_free(env->frames[i]);
    }
    free(env->frames);
    free(env);
    return;
}
Environment * Env_init_with_size(int size){
    Environment * env = malloc(sizeof(Environment));
    env->frames = (Environment_Frame**)malloc(sizeof(Environment_Frame*) * size);
    env->length = 0;
    return env;
}

/*
 create frame0
 */
Environment_Frame *createFrame0(){
    // Object * frame = Object_initVector(0, GLOBAL_FRAME_SIZE);
    Environment_Frame * frame = malloc(sizeof(Environment_Frame));
    frame->length = 0;
    frame->array = GLOBAL_FRAME;
    frame->use_count = 0;
    
    // add builtin lambda
    EF_set_builtin_lambda(frame, 0, &builtin_cons);
    EF_set_builtin_lambda(frame, 1, &builtin_car);
    EF_set_builtin_lambda(frame, 2, &builtin_cdr);
    EF_set_builtin_lambda(frame, 3, &builtin_add);
    EF_set_builtin_lambda(frame, 4, &builtin_sub);
    EF_set_builtin_lambda(frame, 5, &builtin_mul);
    EF_set_builtin_lambda(frame, 6, &builtin_div);
    EF_set_builtin_lambda(frame, 7, &builtin_vector);
    EF_set_builtin_lambda(frame, 8, &builtin_vector_with_unchangable_length);
    EF_set_builtin_lambda(frame, 9, &builtin_vector_length);
    EF_set_builtin_lambda(frame, 10, &builtin_vector_push);
    EF_set_builtin_lambda(frame, 11, &builtin_vector_pop);
    EF_set_builtin_lambda(frame, 12, &builtin_num_equal);
    EF_set_builtin_lambda(frame, 13, &builtin_num_lt);
    EF_set_builtin_lambda(frame, 14, &builtin_num_le);
    EF_set_builtin_lambda(frame, 15, &builtin_eq);
    EF_set_builtin_lambda(frame, 16, &builtin_string_type);
    EF_set_builtin_lambda(frame, 17, &builtin_int_type);
    EF_set_builtin_lambda(frame, 18, &builtin_float_type);
    EF_set_builtin_lambda(frame, 19, &builtin_pair_type);
    EF_set_builtin_lambda(frame, 20, &builtin_null_type);
    EF_set_builtin_lambda(frame, 21, &builtin_lambda_type);
    EF_set_builtin_lambda(frame, 22, &builtin_strcmp);
    EF_set_builtin_lambda(frame, 23, &builtin_string_slice);
    EF_set_builtin_lambda(frame, 24, &builtin_string_length);
    EF_set_builtin_lambda(frame, 25, &builtin_string_append);
    EF_set_builtin_lambda(frame, 26, &builtin_make_table);
    EF_set_builtin_lambda(frame, 27, &builtin_table_keys);
    EF_set_builtin_lambda(frame, 28, &builtin_table_delete);
    EF_set_builtin_lambda(frame, 29, &builtin_file_read);
    EF_set_builtin_lambda(frame, 30, &builtin_file_write);
    // sys-argv
    frame->array[31] = SYS_ARGV;
    EF_set_builtin_lambda(frame, 32, &builtin_int_to_string);
    EF_set_builtin_lambda(frame, 33, &builtin_float_to_string);
    EF_set_builtin_lambda(frame, 34, &builtin_input);
    EF_set_builtin_lambda(frame, 35, &builtin_display_string);
    EF_set_builtin_lambda(frame, 36, &builtin_string_to_int);
    EF_set_builtin_lambda(frame, 37, &builtin_string_to_float);
    
    EF_set_builtin_lambda(frame, 38, &builtin_ratio_type);
    EF_set_builtin_lambda(frame, 39, &builtin_numer);
    EF_set_builtin_lambda(frame, 40, &builtin_denom);
    EF_set_builtin_lambda(frame, 41, &builtin_gensym);
    EF_set_builtin_lambda(frame, 42, &builtin_table_add_tag);
    EF_set_builtin_lambda(frame, 43, &builtin_table_tag);

    frame->length = 44; // set length
    return frame;
}
/*
 create environment
 */
Environment *createEnvironment(){
    Environment * env = malloc(sizeof(Environment));
    env->length = 1;
    env->frames = malloc(sizeof(Environment_Frame*) * MAX_STACK_SIZE);
    env->frames[0] = createFrame0();
    env->frames[0]->use_count = 1;
    return env;
}
/*
 copy environment
 */
Environment *copyEnvironment(Environment * old_env){
    Environment * new_env = malloc(sizeof(Environment));
    new_env->length = old_env->length;
    new_env->frames = malloc(sizeof(Environment_Frame*) * new_env->length);
    int i;
    for (i = 0; i < new_env->length; i++) {
        new_env->frames[i] = old_env->frames[i]; // copy frame pointer
        new_env->frames[i]->use_count++; // increase use count
    }
    return new_env;
}

/*
 copy environment and push frame
 */
Environment *copyEnvironmentAndPushFrame(Environment * old_env, Environment_Frame * frame){
    Environment * new_env = malloc(sizeof(Environment));
    new_env->length = old_env->length;
    new_env->frames = malloc(sizeof(Environment_Frame*) * (new_env->length + 1));
    int i;
    for (i = 0; i < old_env->length; i++) {
        new_env->frames[i] = old_env->frames[i]; // copy frame pointer
        new_env->frames[i]->use_count++; // increase use count
    }
    new_env->frames[i] = frame;
    frame->use_count++;
    new_env->length+=1;
    return new_env;
}
#endif
