//
//  compiler_data_type.h
//  walley
//
//  Created by WangYiyi on 4/27/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//
#ifndef walley_compiler_data_type_h
#define walley_compiler_data_type_h
#include "parser.h"

/* opcodes */
#define SET 0x0
#define GET 0x1
#define CONST 0x2

#define CONST  0x2
#define CONST_INTEGER  0x2100
#define CONST_FLOAT 0x2200
#define CONST_STRING 0x2300
#define CONST_NULL 0x2400
#define CONST_LOAD 0x2500

#define MAKELAMBDA 0x3
#define RETURN 0x4
#define NEWFRAME 0x5
#define PUSH_ARG 0x6
#define CALL 0x7
#define JMP 0x8
#define TEST 0x9
#define PUSH 0xA

/*
    construct Instructions data type
 */
typedef struct Instructions{
    unsigned short * array;
    unsigned long length;
    unsigned long size;
}Instructions;
/*
    init insts
 */
Instructions * Insts_init(){
    Instructions * insts = malloc(sizeof(Instructions));
    insts->length = 0;
    insts->size = 1024;
    insts->array = malloc(sizeof(short)*insts->size);
    return insts;
}
/*
    Instructions push
 */
void Insts_push(Instructions * insts, short v){
    if(insts->length == insts->size){ // reach maximum
        insts->size*=2;
        insts = realloc(insts, sizeof(short)*insts->size);
    }
    insts->array[insts->length] = v;
    insts->length++;
}
/*
    print insts
 */
void printInstructions(Instructions * insts){
    unsigned long length = insts->length;
    unsigned long i;
    for (i = 0; i < length; i++) {
        printf("%04x ", insts->array[i]);
    }
    return;
}
#define Insts_length(l) ((l)->length)
#define Insts_get(l, index) ((l)->array[(index)])
#define Insts_set(l, index, v) ((l)->array[(index)] = (v))
/*
    define Variable Table Frame
*/
typedef struct Variable_Table_Frame{
    char ** var_names;
    unsigned int length;
    unsigned int use_count;
} Variable_Table_Frame;

/*
    init vtf
 */
Variable_Table_Frame * VTF_init(unsigned int size){
    Variable_Table_Frame * vtf = malloc(sizeof(Variable_Table_Frame));
    vtf->var_names = malloc(sizeof(char*)*size);
    vtf->length = 0;
    vtf->use_count = 0;
    return vtf;
}
/* 
    push var_name to vtf
 */
void VTF_push(Variable_Table_Frame * vtf, char * value){
    char * s = malloc(sizeof(char)* (strlen(value)+ 1));
    strcpy(s, value);
    vtf->var_names[vtf->length] = s;
    vtf->length++;
}

/*
    free variabel table frame
 */
void VTF_free(Variable_Table_Frame * vtf){
    unsigned int length = vtf->length;
    unsigned int i ;
    for (i = 0; i < length; i++) {
        free(vtf->var_names[i]);
    }
    free(vtf);
    vtf = NULL;
    return;
}


/*
    define Variable Table
 */
#define VARIABLE_TABLE_MAX_SIZE 64
#define FRAME0_SIZE 1024
#define MAX_VAR_NAME_LENGTH 32
/* Variable Table Data Structure */
typedef struct Variable_Table{
    Variable_Table_Frame * frames[VARIABLE_TABLE_MAX_SIZE];
    unsigned int length;
    // unsigned int use_count;
} Variable_Table;

// push value to VT's #frame_index frame
#define VT_push(vt, frame_index, value) VTF_push((vt)->frames[(frame_index)], (value))

/*
  init Variable Table
 */
Variable_Table * VT_init(){
    Variable_Table * vt = malloc(sizeof(Variable_Table));
    vt->frames[0] = VTF_init(FRAME0_SIZE);
    vt->frames[0]->use_count = 1; // in use
    
    vt->length = 1; // 有一个frame
    //vt->use_count = 1; // in use

    // set frame0
    VT_push(vt, 0, "cons");
    VT_push(vt, 0, "car");
    VT_push(vt, 0, "cdr");
    VT_push(vt, 0, "+");
    VT_push(vt, 0, "-");
    VT_push(vt, 0, "*");
    VT_push(vt, 0, "/");
    VT_push(vt, 0, "vector!");
    VT_push(vt, 0, "vector");
    VT_push(vt, 0, "vector-length");
    
    VT_push(vt, 0, "vector-push!");
    VT_push(vt, 0, "vector-pop!");
    VT_push(vt, 0, "=");
    VT_push(vt, 0, "<");
    VT_push(vt, 0, "<=");
    VT_push(vt, 0, "eq?");
    VT_push(vt, 0, "string?");
    VT_push(vt, 0, "int?");
    VT_push(vt, 0, "float?");
    VT_push(vt, 0, "pair?");
    
    VT_push(vt, 0, "null?");
    VT_push(vt, 0, "lambda?");
    VT_push(vt, 0, "strcmp");
    VT_push(vt, 0, "string-slice");
    VT_push(vt, 0, "string-length");
    VT_push(vt, 0, "string-append");
    VT_push(vt, 0, "table");
    VT_push(vt, 0, "table-keys");
    VT_push(vt, 0, "table-delete");
    VT_push(vt, 0, "file-read");
    
    VT_push(vt, 0, "file-write");
    VT_push(vt, 0, "sys-argv");
    VT_push(vt, 0, "int->string");
    VT_push(vt, 0, "float->string");
    VT_push(vt, 0, "input");
    VT_push(vt, 0, "display-string");
    VT_push(vt, 0, "string->int");
    VT_push(vt, 0, "string->float");
    
    return vt;
}

void Variable_Table_push_frame(Variable_Table * vt, Variable_Table_Frame * vtf){
    vtf->use_count++; // increase use_count of vtf
    
    vt->frames[vt->length] = vtf;
    vt->length++;
}

void VT_find(Variable_Table * vt, char * var_name, int output[2]){
    int i, j;
    Variable_Table_Frame * frame;
    for (i = vt->length - 1; i >= 0; i--) {
        frame = vt->frames[i];
        for (j = frame->length-1; j >= 0; j--) {
            if(str_eq(frame->var_names[j], var_name)){
                output[0] = i;
                output[1] = j;
                return;
            }
        }
    }
    output[0] = -1;
    output[1] = -1;
    return;
}
/* append empty frame */
void VT_add_new_empty_frame(Variable_Table * vt){
    Variable_Table_Frame * frame = VTF_init(64);
    frame->use_count = 1; // increase use_count of vtf
    vt->frames[vt->length] = frame;
    vt->length++ ;
}
/*
    克隆 Variable Table
 */
Variable_Table * VT_copy(Variable_Table * vt){
    Variable_Table * return_vt;
    unsigned int length = vt->length;
    unsigned int i;
    return_vt = malloc(sizeof(Variable_Table));
    return_vt->length = length;
    for (i = 0; i < length; i++) {
        return_vt->frames[i] = vt->frames[i]; // 没有copy frame deeply
        vt->frames[i]->use_count++; // in use ++
    }
    return return_vt;
}

/*
    free Variable Table
 */
void VT_free(Variable_Table * vt){
    unsigned int length = vt->length;
    unsigned i = 0;
    for (i = 0; i < length; i++) {
        vt->frames[i]->use_count--;
        if (vt->frames[i]->use_count == 0) { // 只有在没人使用的时候free
            VTF_free(vt->frames[i]);
            vt->frames[i] = NULL;
        }
    }
    free(vt->frames);
    //free(vt);
    return;
}


/*
 this saved lambda is for tail call optimization and compilation
 */
typedef struct Lambda_for_Compilation{
    unsigned int param_num;
    unsigned int variadic_place;
    unsigned long start_pc;
    Variable_Table * vt;
}Lambda_for_Compilation;

void LFC_free(Lambda_for_Compilation * func){
    if(func->vt != NULL)
        VT_free(func->vt);
}

#endif














