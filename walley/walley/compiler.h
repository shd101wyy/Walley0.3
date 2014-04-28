//
//  compiler.h
//  walley
//
//  Created by WangYiyi on 4/27/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#ifndef walley_compiler_h
#define walley_compiler_h
#include "compiler_data_type.h"

static Object* CONSTANT_TABLE_FOR_COMPILATION;
static unsigned long CONSTANT_TABLE_FOR_COMPILATION_LENGTH;
// static int CONSTANT_TABLE_LENGTH = 0;

Object * quote_list(Object * l){
    if(l->type == NULL_) return GLOBAL_NULL;
    Object * v = car(l);
    if(v->type == PAIR) return cons(CONS_STRING,
                                    cons(quote_list(v),
                                         cons(quote_list(cdr(l)),
                                              GLOBAL_NULL)));
    else if (v->type == STRING && str_eq(v->data.String.v, "."))
        return cons(QUASIQUOTE_STRING, cons(cadr(l), GLOBAL_NULL));
    return cons(CONS_STRING,
                cons(cons(QUOTE_STRING, cons(v, GLOBAL_NULL)),
                     cons(quote_list(cdr(l)), GLOBAL_NULL)));
}
void compiler(Instructions * insts,
             Object * l,
             Variable_Table * vt,
             int tail_call_flag,
             char * parent_func_name,
              Lambda_for_Compilation * function_for_compilation);
void compiler_begin(Instructions * insts,
                    Object * l,
                    Variable_Table * vt,
                    char * parent_func_name,
                    Lambda_for_Compilation * function_for_compilation);

Object * list_append(Object * a, Object * b){
    if(a == GLOBAL_NULL) return b;
    return cons(car(a), list_append(cdr(a), b));
}

/*
    Compiler 暂不支持 Macro
 */
void compiler(Instructions * insts,
              Object * l,
              Variable_Table * vt,
              int tail_call_flag,
              char * parent_func_name,
              Lambda_for_Compilation * function_for_compilation){
    int i, j;
    unsigned long index1, index2, index3, jump_steps, start_pc;
    char * string;
    unsigned long length;
    int find_end;
    int vt_find[2];
    long int_;
    double double_;
    char * tag;
    Object * v;
    Object * var_name, * var_value;
    Object * test, * conseq, * alter;
    int var_existed/*, var_index*/;
    Variable_Table_Frame * frame;
    switch (l->type) {
        case NULL_:
            Insts_push(insts, CONST_NULL); // push null;
            return;
            break;
        case STRING:
            if (l->data.String.v[0] == '"') { // string
                char * s = malloc(sizeof(char)*(strlen(l->data.String.v)+1));
                j = 0;
                // format string
                for (i = 1; i < l->data.String.length-1; i++) {
                    if(l->data.String.v[i] == '\\'){
                        switch (l->data.String.v[i+1]) {
                            case 'a':
                                s[j] = '\a';
                                break;
                            case 't':
                                s[j] = '\t';
                                break;
                            case 'n':
                                s[j] = '\n';
                                break;
                            case '\\':
                                s[j] = '\\';
                            default:
                                printf("ERROR: Invalid String Slash");
                                break;
                            i++;
                        }
                    }
                    else
                        s[j] = l->data.String.v[i];
                    j++;
                }
                // init key save to 'v'
                v = Object_initString(s, length);
                var_value = Table_getval(CONSTANT_TABLE_FOR_COMPILATION,
                                        v);
                // check s in CONSTANT_TABLE_FOR_COMPILATION
                if(var_value!= GLOBAL_NULL){ // already exist
                    Insts_push(insts, CONST_LOAD); // load from table
                    Insts_push(insts, var_value->data.Integer.v);
                    
                    // free 'v'
                    free(v->data.String.v);
                    free(v);
                    return;
                }
                else{ // doesn't exist, save to table
                    Table_setval(CONSTANT_TABLE_FOR_COMPILATION,
                                 v,
                                 Object_initInteger(CONSTANT_TABLE_FOR_COMPILATION_LENGTH));
                    CONSTANT_TABLE_FOR_COMPILATION_LENGTH++;
                }
                // free var_value
                free(var_value);
                
                // so length of string is j
                length = j;
                Insts_push(insts, CONST_STRING);
                Insts_push(insts, length);
                find_end = false;
                for (i = 0; i < length; i = i + 2) {
                    if(i + 1 == length){
                        Insts_push(insts, (s[i] << 8) & 0xFF00);
                        find_end = true;
                        break;
                    }
                    else {
                        Insts_push(insts, (s[i] << 8) | s[i+1]);
                    }
                }
                if(find_end == false){
                    Insts_push(insts, 0x0000); // add end
                }
                return;
            }
            else{
                VT_find(vt, l->data.String.v, vt_find);
                if(vt_find[0] == -1){
                    // variable doesn't exist
                    printf("ERROR: undefined variable %s", l->data.String.v);
                    return;
                }
                Insts_push(insts, GET<<12 | vt_find[0]); // frame index
                Insts_push(insts, vt_find[1]); // value index
                return;
            }
        case INTEGER: // integer
            int_ = l->data.Integer.v;
            Insts_push(insts, CONST_INTEGER);
            Insts_push(insts, (0xFFFF000000000000 & int_) >> 48);
            Insts_push(insts, (0x0000FFFF00000000 & int_) >> 32);
            Insts_push(insts, (0x00000000FFFF0000 & int_) >> 16);
            Insts_push(insts, 0xFFFF & int_);
            return;
        case DOUBLE:
            double_ = l->data.Double.v;
            int_ = *(long*)&double_; // get hex
            Insts_push(insts, CONST_INTEGER);
            Insts_push(insts, (0xFFFF000000000000 & int_) >> 48);
            Insts_push(insts, (0x0000FFFF00000000 & int_) >> 32);
            Insts_push(insts, (0x00000000FFFF0000 & int_) >> 16);
            Insts_push(insts, 0xFFFF & int_);
            return;
        case PAIR:
            if(car(l)->type == INTEGER && car(l)->data.Integer.v == 0){
                // set
                Insts_push(insts, (GET << 12) | (0x0FFF & cadr(l)->data.Integer.v));
                Insts_push(insts, cadddr(l)->data.Integer.v);
                return;
            }
            tag = car(l)->data.String.v;
            if(str_eq(tag, "quote")){
                v = cadr(l);
                // check integer float null
                if(v->type == NULL_ || v->type == INTEGER || v->type == DOUBLE){
                    return compiler(insts,
                                    v,
                                    vt,
                                    tail_call_flag,
                                    parent_func_name,
                                    function_for_compilation);
                }
                else if (v->type == PAIR){ // pair
                    return compiler(insts,
                                    quote_list(v),
                                    vt,
                                    tail_call_flag,
                                    parent_func_name,
                                    function_for_compilation);
                }
                else if(v->data.String.v[0] != '\''){
                    string = string_append("\"", string_append(v->data.String.v, "\""));
                    return compiler(insts,
                                    Object_initString(string,
                                                      strlen(string)),
                                    vt,
                                    tail_call_flag,
                                    parent_func_name,
                                    function_for_compilation);
                }
                return compiler(insts, v, vt, tail_call_flag, parent_func_name, function_for_compilation);
            }
            else if(str_eq(tag, "def")){
                var_name = cadr(l);
                // 暂不支持 (def (add a b) (+ a b))
                if (cddr(l)->type == NULL_)
                    var_value = GLOBAL_NULL;
                else
                    var_value = caddr(l);
                var_existed = false;
                // var_index = -1;
                frame = vt->frames[vt->length - 1];
                for (j = frame->length - 1; j >= 0; j--) {
                    if (str_eq(var_name->data.String.v,
                               frame->var_names[j])) {
                        printf("ERROR: variable: %s alreadt defined", var_name->data.String.v);
                        return;
                    }
                }
                if(var_existed == false)
                    VT_push(vt, vt->length-1, var_name->data.String.v);
                if (var_value->type == PAIR &&
                    str_eq(car(var_value)->data.String.v,
                           "lambda")) {
                        parent_func_name = var_name->data.String.v;
                }
                // compile value
                compiler(insts,
                         var_value,
                         vt,
                         tail_call_flag,
                         parent_func_name,
                         function_for_compilation);
                // add instruction
                Insts_push(insts, PUSH << 12);
                return;
            }
            else if(str_eq(tag, "set!")){
                var_name = cadr(l);
                var_value = caddr(l);
                VT_find(vt, var_name->data.String.v, vt_find);
                if (vt_find[0] == -1) {
                    printf("ERROR: undefined variable %s \n", var_name->data.String.v);
                    return;
                }
                else{
                    if(var_value->type == PAIR &&
                       str_eq(car(var_value)->data.String.v,
                              "lambda"))
                        parent_func_name = var_name->data.String.v;
                    // compile value
                    compiler(insts,
                             var_value,
                             vt,
                             tail_call_flag,
                             parent_func_name,
                             function_for_compilation);
                    Insts_push(insts, SET << 12 | (0x0FFF & vt_find[0])); // frame_index
                    
                    Insts_push(insts, vt_find[1]); // value index
                    return;
                }
            }
            // (if test conseq alter)
            else if (str_eq(tag, "if")){
                test = cadr(l);
                conseq = caddr(l);
                if(cdddr(l)->type == NULL_) alter = GLOBAL_NULL;
                else alter = cadddr(l);
                compiler(insts,
                         test,
                         vt,
                         false,
                         parent_func_name,
                         function_for_compilation);
                // push test, but now we don't know jump steps
                Insts_push(insts, TEST << 12); // jump over consequence
                index1 = insts->length;
                Insts_push(insts, 0x0000); // jump steps
                
                // compiler_begin ...
                compiler_begin(insts,
                               cons(conseq, GLOBAL_NULL),
                               vt,
                               parent_func_name,
                               function_for_compilation);
                
                index2 = insts->length;
                Insts_push(insts, JMP<<12); // jmp
                Insts_push(insts, 0x0000); // jump over alternative
                Insts_push(insts, 0x0000);
                jump_steps = index2 - index1 + 4;
                Insts_set(insts, index1, jump_steps);
                
                // compiler begin
                compiler_begin(insts,
                               cons(alter, GLOBAL_NULL),
                               vt,
                               parent_func_name,
                               function_for_compilation);
                
                index3 = insts->length;
                jump_steps = index3 - index2;
                Insts_set(insts, index2 + 1, (0xFFFF0000 & jump_steps) >> 16);
                Insts_set(insts, index2 + 2, (0x0000FFFF & jump_steps));
                return;
            }
            else if (str_eq(tag, "begin")){
                // compiler begin
                compiler_begin(insts,
                               cdr(l),
                               vt,
                               parent_func_name,
                               function_for_compilation);
                return;
            }
            else if (str_eq(tag, "let")){
                Object * chunk;
                Object * body;
                char * var_names[64];
                Object * def_array[64];
                int is_def;
                length = 0; // counter for var_names
                j = 0; // counter for def_array
                Object * assignments = GLOBAL_NULL;
                while (chunk != GLOBAL_NULL) {
                    is_def = true;
                    string = car(chunk)->data.String.v;
                    var_existed = false;
                    for (i = 0; i < length; i++) { // check in var_names
                        if (str_eq(var_names[i], string)) {
                            var_existed = true;
                            is_def = false;
                        }
                    }
                    if(!var_existed){ // 不存在 保存
                        var_names[length] = string;
                        length++;
                    }
                    def_array[j] = cons(is_def?DEF_STRING:SET_STRING,
                                        cons(car(chunk),
                                             cons(cadr(chunk), GLOBAL_NULL)));
                    chunk = cddr(chunk);
                    j++; //
                }
                // make assignments;
                for (i = j - 1; i >= 0; i--) {
                    assignments = cons(def_array[i],
                                       assignments);
                }
                compiler(insts,
                         cons(cons(LAMBDA_STRING,
                                   cons(GLOBAL_NULL,
                                        list_append(assignments,
                                                    body))),
                              GLOBAL_NULL),
                         vt,
                         tail_call_flag,
                         parent_func_name,
                         function_for_compilation);
                return;
            }
            else if (str_eq(tag, "lambda")){
                Object * params = cadr(l); // get parameters
                int variadic_place = -1; // variadic place
                int counter = 0; // count of parameter num
                Variable_Table * vt_ = VT_copy(vt); // new variable table
                //var macros_ = macros.slice(0); // new macro table
                //var env_ = env.slice(0);
                VT_add_new_empty_frame(vt); // we add a new frame
                //macros_.push([]); // add new frame
                //env_.push([]); // 必须加上这个， 要不然((lambda [] (defmacro square ([x] `[* ~x ~x])) (square 12))) macro 会有错
                while (true) {
                    if (params == GLOBAL_NULL) {
                        break;
                    }
                    if (car(params)->type != STRING) {
                        printf("ERROR: Invalid Function Parameter type");
                        return;
                    }
                    if (str_eq(car(params)->data.String.v,
                               ".")) { // variadic
                        variadic_place = counter;
                        VT_push(vt, vt->length - 1, cadr(params)->data.String.v);
                        counter += 1; // means no parameters requirement
                        break;
                    }
                    VT_push(vt,
                            vt->length - 1,
                            car(params)->data.String.v);
                    counter++;
                    params = cdr(params);
                }
                // make lambda
                Insts_push(insts,
                           (MAKELAMBDA << 12)
                           | (counter << 6)
                           | (variadic_place == -1? 0 : variadic_place << 1)
                           | (variadic_place == -1 ? 0 : 1));
                index1 = insts->length;
                Insts_push(insts, 0x0000); // steps that needed to jump over lambda
                start_pc = insts->length; // get start_pc
                
                // set function_for_compilation
                Lambda_for_Compilation * function_ = malloc(sizeof(Lambda_for_Compilation));
                function_->start_pc = start_pc;
                function_->param_num = counter;
                function_->variadic_place = variadic_place;
                function_->vt = vt_;
                
                // compile body
                // 关于这里 compiler_begin 不用 free function_里面的vt_
                // 因为 vt_ 已经被 free 掉
                compiler_begin(insts,
                               cddr(l),
                               vt_,
                               parent_func_name,
                               function_);
                
                VT_free(vt_); // free vt_;
                free(vt_);
                vt_ = NULL;
                free(function_); // free lambda for compilation
                function_ = NULL;
                
                return;
            }
            else if (str_eq(tag, "defmacro")){
                return;
            }
            // call function
            else{
                // 咱不支持 macro
                if(tail_call_flag){
                    // so no new frame
                    int start_index = vt->frames[vt->length - 1]->length;
                    int track_index = start_index;
                    // compile parameters
                    int param_num = 0; // param num
                    Object * p = cdr(l);
                    Object * params[64]; // 最多存 64 个 params
                    int count_params = 0; // count param num
                    while (p != GLOBAL_NULL) {
                        params[param_num] = car(p);
                        param_num++;
                        p = cdr(p);
                    }
                    /*compile parameters*/
                    for (i = 0; i < param_num; i++) {
                        if(i == function_for_compilation->variadic_place){ // variadic place
                            count_params++;
                            p = GLOBAL_NULL;
                            j = param_num - 1;
                            for (; j >= i; j--) {
                                p = cons(CONS_STRING,
                                         cons(params[j],
                                              cons(p, GLOBAL_NULL)));
                            }
                            compiler(insts,
                                     p,
                                     vt,
                                     false,
                                     parent_func_name,
                                     function_for_compilation); // each argument is not tail call
                            // set tp current frame
                            Insts_push(insts, (SET << 12) | vt->length - 1); // frame index
                            Insts_push(insts, 0x0000FFFF & track_index);
                            // value index
                        }
                        else{
                            count_params++;
                            compiler(insts,
                                     params[i],
                                     vt,
                                     false,
                                     parent_func_name,
                                     function_for_compilation); // this argument is not tail call
                            // set to current frame
                            Insts_push(insts, (SET << 12) | vt->length - 1); // frame index
                            Insts_push(insts, 0x0000FFFF & track_index);
                            // value index
                        }
                        track_index++;
                    }
                    // move parameters
                    for (i = 0; i < count_params; i++) {
                        // get value
                        Insts_push(insts, (GET << 12) | (vt->length - 1)); //frame index
                        Insts_push(insts, start_index + i); // value index
                        // move to target index
                        Insts_push(insts, (SET << 12) | (vt->length - 1)); // frame index
                        Insts_push(insts, i); // value index 不再加2是因为不再存env 和 pc
                    }
                    if (function_for_compilation->variadic_place == -1 && i < function_for_compilation->param_num) {
                        for (; i < function_for_compilation->param_num; i++) {
                            Insts_push(insts, CONST_NULL);
                            // move to target index
                            Insts_push(insts, (SET << 12) | (vt->length - 1)); // frame index
                            Insts_push(insts, i); // value index 不再加2是因为不再存env 和 pc
                        }
                    }
                    // jump back
                    start_pc = function_for_compilation->start_pc;
                    Insts_push(insts, JMP << 12);
                    jump_steps = -(insts->length - start_pc); // jump steps
                    Insts_push(insts, (0xFFFF0000 & jump_steps) >> 16);
                    Insts_push(insts, 0x0000FFFF & jump_steps);
                    return;
                }
                // not tail call
                else{
                    // compile function first
                    compiler(insts,
                             car(l),
                             vt,
                             false,
                             parent_func_name,
                             function_for_compilation); // compile lambda, save to accumulator
                    Insts_push(insts, NEWFRAME << 12); // create new frame
                    // compile paremeters
                    int param_num = 0;
                    Object * p = cdr(l);
                    Object * params[64]; // 最多存 64 个 params
                    while (p != GLOBAL_NULL) {
                        params[param_num] = car(p);
                        param_num++;
                        p = cdr(p);
                    }
                    // compile params from left to right
                    for (i = 0; i < param_num; i++) {
                        compiler(insts,
                                 params[i],
                                 vt,
                                 false,
                                 parent_func_name,
                                 function_for_compilation);// each argument is not tail call
                        Insts_push(insts, PUSH_ARG << 12);
                    }
                    Insts_push(insts, (CALL << 12) | (0x0FFF & param_num));
                    return;
                }
            }
        default:
            printf("ERROR: Invalid Data");
            return;
            break;
    }
}
/*
    compile a series of expression
 */
void compiler_begin(Instructions * insts,
                    Object * l,
                    Variable_Table * vt,
                    char * parent_func_name,
                    Lambda_for_Compilation * function_for_compilation){
    // Object * acc = GLOBAL_NULL;
    while (l != GLOBAL_NULL) {
        if (cdr(l) == GLOBAL_NULL
            && car(l)->type == PAIR
            && str_eq(car(car(l))->data.String.v, parent_func_name)) {
            // tail call
            compiler(insts,
                     car(l),
                     vt,
                     1,
                     "",
                     function_for_compilation);
        }
        else
            compiler(insts,
                     car(l),
                     vt,
                     0,
                     parent_func_name,
                     function_for_compilation);
        l = cdr(l);
    }
    parser_free(l); // free parser
    l = NULL;
    //VT_free(vt);    // free vt
    //vt = NULL;
    //LFC_free(function_for_compilation); // free function_for_compilation
    //free(function_for_compilation);
    //function_for_compilation = NULL;
    return;
}


#endif
