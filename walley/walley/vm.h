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


/*
 Walley Language Virtual Machine
 */
Object *VM(unsigned short * instructions,
           unsigned long start_pc,
           unsigned long end_pc,
           Object * env){
    unsigned long pc = start_pc;
    unsigned int i;
    unsigned short frame_index, value_index;
    short inst;
    short opcode;
    char param_num, variadic_place;
    unsigned long start_pc, jump_steps;
    int required_param_num, required_variadic_place;
    
    unsigned long string_length;
    char * created_string;
    int s;
    char s1, s2;
    
    long integer_;
    double double_;
    
    Object * accumulator = GLOBAL_NULL;
    Object * current_frame_pointer = GLOBAL_NULL;
    Object * frames_list = GLOBAL_NULL; // save frames
    Object * functions_list = GLOBAL_NULL; // use to save lambdas
    Object * new_env;
    Object * (*func_ptr)(Object*, int, int); // function pointer
    Object * v;
    Object * temp; // temp use
    Object * temp2;
    Object * top_frame_pointer = vector_Get(env, 0); // top frame
    
    Object * BUILTIN_PRIMITIVE_PROCEDURE_STACK[1024]; // for builtin primitive procedure calculation
    
    Object * continuation_env = GLOBAL_NULL;             // used to save env
    Object * continuation_return_pc = GLOBAL_NULL;       // used to save return pc
    
    while(pc != end_pc){
        inst = instructions[pc];
        opcode = (inst & 0xF000) >> 12;
        //printf("%x\n", inst);
        switch(opcode){
            case SET:
                frame_index = 0x0FFF & inst;
                value_index = instructions[pc + 1];
                v = vector_Get(vector_Get(env, frame_index), value_index);

                v->use_count--; // decrement use_count
                Object_free(v);

                vector_Get(vector_Get(env, frame_index), value_index) = accumulator; // set value
                accumulator->use_count++;  // increase accumulator use_count
                pc = pc + 2;
                continue;
            case GET:
                frame_index = 0x0FFF & inst;
                value_index = instructions[pc + 1];
                
                Object_free(accumulator);
                
                // 这里应该检查 accumulator, 看看是否要free掉
                accumulator = env->data.Vector.v[frame_index]->data.Vector.v[value_index];
                pc = pc + 2;
                continue;
            case CONST:
                switch(inst){
                    case CONST_INTEGER:  // 64 bit num
                        // free accumulator is necessary
                        Object_free(accumulator);
                        
                        accumulator = Object_initInteger((long)((instructions[pc + 1] << 48) | 
                                                                (instructions[pc + 2] << 32) | 
                                                                (instructions[pc + 3] << 16) |
                                                                (instructions[pc + 4])));
                        pc = pc + 5;
                        continue;
                    case CONST_FLOAT: // 64 bit double
                        // free accumulator is necessary
                        Object_free(accumulator);
                    
                        integer_ = (long)((instructions[pc + 1] << 48) | 
                                                                (instructions[pc + 2] << 32) | 
                                                                (instructions[pc + 3] << 16) |
                                                                (instructions[pc + 4]));
                        accumulator = Object_initDouble((double)(*((double*)&(integer_))));
                        pc = pc + 5;
                        continue;
                    case CONST_STRING:
                        string_length = (long)instructions[pc + 1]; // string length maximum 2 bytes 
                        created_string = (char*)malloc(sizeof(char) * (string_length + 1));
                        pc = pc + 2;
                        i = 0;
                        while(1){
                            s = instructions[pc];
                            s1 = (char)((0xFF00 & s) >> 8);
                            s2 = (char)(0x00FF & s);
                            if(s1 == 0x00) // reach end
                                break;
                            else{
                                created_string[i] = s1;
                                i++;
                            }
                            if(s2 == 0x00) // reach end
                                break;
                            else{
                                created_string[i] = s2;
                                i++;
                            }
                            pc = pc + 1;
                        }
                        created_string[i] = 0;
                        
                        // free accumulator if necessary
                        Object_free(accumulator);
                        
                        // create string
                        accumulator = Object_initString(created_string, string_length - 1);
                        accumulator->data.String.in_table = 1;
                        // push to Constant_Pool
                        Constant_Pool[Constant_Pool_Length] = accumulator;
                        Constant_Pool_Length++;
                        
                        pc = pc + 1;
                        continue;
                    case CONST_LOAD:
                        // free accumulator if necessary
                        Object_free(accumulator);
                        
                        accumulator = Constant_Pool[instructions[pc + 1]]; // load constant
                        pc = pc + 2;
                        continue;
                    case CONST_NULL: // null
                        // free accumulator if necessary
                        Object_free(accumulator);
                        // set null
                        accumulator = GLOBAL_NULL;
                        pc = pc + 1;
                        continue;
                    default:
                        printf("ERROR: Invalid constant\n");
                        return GLOBAL_NULL;
                }
            case MAKELAMBDA: // make lambda
                param_num = (0x0FC0 & inst) >> 6;
                variadic_place = (0x0001 & inst) ? ((0x003E & inst) >> 1) : -1;
                start_pc = pc + 2;
                jump_steps = instructions[pc + 1];
                
                // free accumulator is necessary
                Object_free(accumulator);
                accumulator = Object_initUserDefinedLambda(param_num, variadic_place, start_pc, copyEnvironment(env));
                pc = pc + jump_steps + 1;
                continue;
            case RETURN:
                pc = car(continuation_pc);
                env = car(continuation_env);
                
                v = cdr(continuation_pc); // save rest
                continuation_pc->use_count--; // free current
                Object_free(continuation_pc); 
                continuation_pc = v;
                
                v = cdr(continuation_env); // save rest
                continuation_env->use_count--; // free current
                Object_free(continuation_env); 
                continuation_env = v;
                
                
                // free top_frame_pointer
                top_frame_pointer->use_count--;
                Object_free(top_frame_pointer);
                
                //Object_free(top_frame_pointer); // free top frame
                top_frame_pointer = vector_Get(env, vector_Length(env) - 1); // reset top_frame pointer
                //printf("PC %d\n", pc);
                continue;
            case NEWFRAME: // create new frame
                switch (accumulator->type){
                    case USER_DEFINED_LAMBDA: // user defined function
                        // create new frame with length 64
                        current_frame_pointer = Object_initVector(0, 64);
                        current_frame_pointer->data.Vector.length = 2; // set length to 2, save space for env and pc
                        frames_list = cons(current_frame_pointer, frames_list);
                        functions_list = cons(accumulator, functions_list);
                        pc = pc + 1;
                        continue;
                    case BUILTIN_LAMBDA: case VECTOR: case TABLE: // builtin lambda or vector or table
                        current_frame_pointer = top_frame_pointer; // get top frame
                        frames_list = cons(current_frame_pointer, frames_list); // save to frame list
                        functions_list = cons(accumulator, functions_list); // save function to function list
                        pc = pc + 1;
                        continue;
                    default:
                        printf("ERROR: NEWFRAME error");
                        return GLOBAL_NULL;
                }
            case PUSH_ARG: // push arguments
                //current_frame_pointer->data.Vector.v[0x0FFF & inst] = accumulator;
                //printf("PUSHARG %d\n", accumulator->data.Integer.v);
                accumulator->use_count++; // increase use count
                current_frame_pointer->data.Vector.v[current_frame_pointer->data.Vector.length] = accumulator;
                current_frame_pointer->data.Vector.length++;
                pc = pc + 1;
                continue;
                
            case CALL:
                param_num = (0x0FFF & inst);
                v = car(functions_list); // get function
                functions_list = cdr(functions_list);  // pop that function from list
                switch (v->type){
                    case BUILTIN_LAMBDA: // builtin lambda
                        func_ptr = v->data.Builtin_Lambda.func_ptr;
                        pc = pc + 1;
                        accumulator = (*func_ptr)(current_frame_pointer, param_num, vector_Length(current_frame_pointer) - param_num); // call function
                        //printf("@@ %d %d\n", vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 1)->data.Integer.v ,
                        //     vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 1)->data.Integer.v);
                        /*if(func_ptr == &builtin_num_equal){
                         printf("CHECK EQUAL\n");
                         printf("@@ %d %d\n", vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 1)->data.Integer.v ,
                         vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 2)->data.Integer.v);
                         }
                         if(func_ptr == &builtin_sub){
                         printf("SUB\n");
                         printf("@@ %d %d\n", vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 1)->data.Integer.v ,
                         vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 2)->data.Integer.v);
                         printf("RESULT %d\n", accumulator->data.Integer.v);
                         }
                         if(func_ptr == &builtin_mul){
                         printf("MUL\n");
                         exit(0);
                         }
                         printf("%d\n", (int)func_ptr);*/
                        //printf("GET accumulator %s\n", accumulator->data.String.v );
                        // pop parameters
                        for(i = 0; i < param_num; i++){
                            temp = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 1 - i);
                            temp->use_count--; // －1 因为在push的时候加1了
                            Object_free(temp);
                        }
                        current_frame_pointer->data.Vector.length -= param_num; // decrement the length
                        frames_list = cdr(frames_list);           //
                        current_frame_pointer = car(frames_list); // get new frame pointer
                        // free lambda
                        Object_free(v);
                        continue;
                    case VECTOR: // vector
                        pc = pc + 1;
                        switch(param_num){
                            case 1: // vector get
                                accumulator = vector_Get(v, vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-1)->data.Integer.v);
                                // pop 1 param
                                temp = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-1);
                                temp->use_count--;
                                Object_free(temp);
                                current_frame_pointer->data.Vector.length--; // set length
                                break;
                            case 2: // vector set
                                i = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-2)->data.Integer.v; // set index
                                temp = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-1); // set value
                                Object_free(vector_Get(v, i)); // free that original value
                                
                                vector_Get(v, i) = temp;
                                accumulator = v;
                                //temp->use_count++; // increase use count 不用再＋＋ 因为再 PUSHARG的时候加过了
                                // pop 2 params
                                temp = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-2);
                                temp->use_count--;
                                Object_free(temp);
                                //temp = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-2);
                                //Object_free(temp);
                                current_frame_pointer->data.Vector.length-=2; // set length
                                break;
                            default: // wrong parameters
                                printf("ERROR: Invalid vector operation\n");
                                return GLOBAL_NULL;
                        }
                        frames_list = cdr(frames_list);           //
                        current_frame_pointer = car(frames_list); // get new frame pointer
                        // free lambda
                        Object_free(v);
                        continue;
                    case TABLE: // table
                        pc = pc + 1;
                        switch(param_num){
                            case 1: // table get
                                // get key
                                temp = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-1);
                                accumulator = getval(v,
                                                     temp);
                                
                                printf("%d\n", accumulator->data.Integer.v);
                                
                                // pop 1 param
                                temp->use_count--;
                                Object_free(temp);
                                current_frame_pointer->data.Vector.length -= 1; // set length
                                break;
                            case 2: // object set
                                // get key
                                temp = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-2);
                                // get value
                                temp2 = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-1); // set value
                                temp2->use_count--; // 因为在setval的时候会++
                                // Object_free(getval(v, i)); // free that original value 不用运行这个, 在setval的时候会自动free
                                
                                setval(v, temp, temp2);
                                accumulator = v;
                                //temp->use_count++; // increase use count 不用再＋＋ 因为再 PUSHARG的时候加过了
                                // pop 2 params
                                temp = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-2);
                                temp->use_count--;
                                Object_free(temp);
                                //temp = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-2);
                                //Object_free(temp);
                                current_frame_pointer->data.Vector.length -= 2; // set length
                                break;
                            default: // wrong parameters
                                printf("ERROR: Invalid table operation\n");
                                return GLOBAL_NULL;
                        }
                        frames_list = cdr(frames_list);           //
                        current_frame_pointer = car(frames_list); // get new frame pointer
                        // free lambda
                        Object_free(v);
                        continue;
                    case USER_DEFINED_LAMBDA: // user defined function
                        
                        required_param_num = v->data.User_Defined_Lambda.param_num;
                        required_variadic_place = v->data.User_Defined_Lambda.variadic_place;
                        start_pc = v->data.User_Defined_Lambda.start_pc;
                        
                        new_env = copyEnvironment(v->data.User_Defined_Lambda.env);
                        new_env->data.Vector.v[new_env->data.Vector.length] = current_frame_pointer; // add frame
                        new_env->data.Vector.length++;
                        
                        top_frame_pointer = current_frame_pointer; // update top frame pointer
                        
                        vector_Get(current_frame_pointer, 0) = env; // save current env to new-frame
                        vector_Get(current_frame_pointer, 1) = Object_initInteger(pc + 1); // save pc
                        
                        if(required_variadic_place == -1 && param_num - 1 > required_param_num){
                            printf("ERROR: Too many parameters provided\n");
                            return NULL;
                        }
                        if(required_variadic_place != -1){
                            v = GLOBAL_NULL;
                            for(i = vector_Length(current_frame_pointer) - 1; i >= required_variadic_place + 2; i--){
                                v = cons(vector_Get(current_frame_pointer, i), v);
                            }
                            vector_Get(current_frame_pointer, required_variadic_place + 2) = v;
                        }
                        
                        if(vector_Length(current_frame_pointer) - 2 < required_param_num){
                            for(i = param_num; i < required_param_num; i++){
                                vector_Get(current_frame_pointer, i+2) = GLOBAL_NULL;
                            }
                        }
                        
                        // resert pointers
                        env = new_env;
                        pc = start_pc;
                        
                        //printf("@@@@ User Defined Function %d\n", vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 1)->data.Integer.v);
                        //printf("@@@@ new env length: %d  value: %d\n", vector_Length(env),vector_Get(vector_Get(env, 1), 2)->data.Integer.v);
                        // pop frame
                        frames_list = cdr(frames_list);
                        current_frame_pointer = car(frames_list);
                        
                        // free lambda
                        Object_free(v);
                        continue;
                    default:
                        printf("ERROR: Invalid Lambda\n");
                        return GLOBAL_NULL;
                }
            case JMP:
                pc = pc + ((instructions[pc + 1] << 16) | instructions[pc + 2]);
                continue;
                
            case TEST:
                if (accumulator->type == NULL_){
                    pc = pc + instructions[pc + 1];
                    continue;
                }
                //printf("RUN NEXT\n");
                // run next
                pc = pc + 2;
                continue;
            case PUSH: // push to top frame
                //v = top_frame_pointer; // top frame
                top_frame_pointer->data.Vector.v[top_frame_pointer->data.Vector.length] = accumulator; // set value
                accumulator->use_count++; // increase use_count
                top_frame_pointer->data.Vector.length++; // increase length
                pc++;
                continue;
            default:
                printf("ERROR: Invalid opcode %d\n", opcode);
                return GLOBAL_NULL;
        }
    }
    return accumulator;
}

























#endif
