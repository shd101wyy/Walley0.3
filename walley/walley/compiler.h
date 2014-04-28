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
    char * string;
    unsigned long length;
    int find_end;
    int vt_find[2];
    long int_;
    double double_;
    Object * tag;
    Object * v;
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
            tag = car(l);
            if(tag == QUOTE_STRING){
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
        default:
            break;
    }
}



#endif
