//
//  to_string.h
//  walley
//
//  Created by WangYiyi on 4/30/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#ifndef walley_to_string_h
#define walley_to_string_h
#include "ratio.h"

#define TO_STRING_BUFFER_SIZE 4098
/*
    Object to string
 */

char * number_to_string(Object * x){
    char buffer[TO_STRING_BUFFER_SIZE];
    strcpy(buffer, "");

    switch (x->type) {
        case INTEGER:
            sprintf(buffer, "%ld", x->data.Integer.v);
            break;
        case DOUBLE:
            sprintf(buffer, "%lf", x->data.Double.v);
            break;
        case RATIO:
            sprintf(buffer, "%ld/%ld", x->data.Ratio.numer, x->data.Ratio.denom);
            break;
        default:
            return "()";
    }
    char * output = malloc(sizeof(char) * (strlen(buffer) + 1));
    strcpy(output, buffer);
    return output;
}

char * list_to_string(Object * l);
char * vector_to_string(Object * l);
char * table_to_string(Object * t);
char * clean_string(Object * s);

char * clean_string(Object * s){
    char buffer[TO_STRING_BUFFER_SIZE];
    strcpy(buffer, "");

    unsigned long i = 0;
    unsigned long length = s->data.String.length;
    char c;
    int has_space = 0;
    char temp_buffer[1]; // single char buffer
    for (i = 0; i < length; i++) {
        c = s->data.String.v[i];
        if (c == ' ' || c == '\n' || c == '\t' || c == '\a') {
            has_space = 1; break;
        }
    }
    if (has_space) {
        strcat(buffer, "\"");
        for (i = 0; i < length; i++) {
            c = s->data.String.v[i];
            switch (c) {
                case '\n':
                    strcat(buffer, "\\n");
                    break;
                case '\t':
                    strcat(buffer, "\\t");
                    break;
                    //case '\\':
                case '\a':
                    strcat(buffer, "\\a");
                    break;
                default:
                    temp_buffer[0] = c;
                    strcat(buffer, temp_buffer);
                    break;
            }
        }
        //strcat(buffer, "#str{");
        //strcat(buffer, s->data.String.v);
        //strcat(buffer, "}");
        strcat(buffer, "\"");
    }
    else{
        strcat(buffer, s->data.String.v);
    }
    char * return_s = malloc(sizeof(char) * (strlen(buffer) + 1));
    strcpy(return_s, buffer);
    return return_s;
}
char * list_to_string(Object * l){
    char buffer[TO_STRING_BUFFER_SIZE]; // maximum 1024
    strcpy(buffer, "(");

    Object * p = l;
    Object * v;
    char * s;
    /*
        这里可能得free .
     */
    while (p != GLOBAL_NULL) {
        v = car(p);
        switch (v->type) {
            case INTEGER: case DOUBLE: case RATIO:
                s = number_to_string(v);
                strcat(buffer, s);
                free(s);
                break;
            case NULL_:
                strcat(buffer, "()");
                break;
            case VECTOR:
                s = vector_to_string(v);
                strcat(buffer, s);
                free(s);
                break;
            case TABLE:
                s = table_to_string(v);
                strcat(buffer, s);
                free(s);
                break;
            case STRING:
                s = clean_string(v);
                strcat(buffer, s);
                free(s);
                break;
            case PAIR:
                s = list_to_string(v);
                strcat(buffer, s);
                free(s);
                break;
            case BUILTIN_LAMBDA:
                strcat(buffer, "< builtin-lambda >");
                break;
            case USER_DEFINED_LAMBDA:
                strcat(buffer, "< user-defined-lambda >");
                break;
            default:
                printf("ERROR: stdout");
                break;
        }
        p = cdr(p);
        if (p!=GLOBAL_NULL) {
            strcat(buffer, " ");
        }
    }
    strcat(buffer, ")");
    char * return_s = malloc(sizeof(char) * (strlen(buffer) + 1));
    strcpy(return_s, buffer);
    return return_s;
}
char * vector_to_string(Object * l){
    char buffer[TO_STRING_BUFFER_SIZE]; // maximum 1024
    strcpy(buffer, "");

    Object * v;
    /*
     这里可能得free .
     */
    unsigned long length = l->data.Vector.length;
    unsigned long i;
    char * s;
    if (l->data.Vector.resizable) {
        strcat(buffer, "#[");
    }
    else strcat(buffer, "#(");
    
    for (i = 0; i < length; i++) {
        v = l->data.Vector.v[i];
        switch (v->type) {
            case INTEGER: case DOUBLE: case RATIO:
                s = number_to_string(v);
                strcat(buffer, s);
                free(s);
                break;
            case NULL_:
                strcat(buffer, "()");
                break;
            case VECTOR:
                s = vector_to_string(v);
                strcat(buffer, s);
                free(s);
                break;
            case TABLE:
                s = table_to_string(v);
                strcat(buffer, s);
                free(s);
                break;
            case STRING:
                s = clean_string(v);
                strcat(buffer, s);
                free(s);
                break;
            case PAIR:
                s = list_to_string(v);
                strcat(buffer, s);
                free(s);
                break;
            case BUILTIN_LAMBDA:
                strcat(buffer, "< builtin-lambda >");
                break;
            case USER_DEFINED_LAMBDA:
                strcat(buffer, "< user-defined-lambda >");
                break;
            default:
                printf("ERROR: stdout");
                break;
        }
        if (i!=length - 1) {
            strcat(buffer, " ");
        }

    }
    if (l->data.Vector.resizable) {
        strcat(buffer, "]");
    }
    else{
        strcat(buffer, ")");
    }
    char * return_s = malloc(sizeof(char) * (strlen(buffer) + 1));
    strcpy(return_s, buffer);
    return return_s;
}

char * table_to_string(Object * l){
    char buffer[TO_STRING_BUFFER_SIZE]; // maximum 1024
    strcpy(buffer, "");
    
    Object * v;
    char * s;
    Object * keys = table_getKeys(l); // it is pair
    strcat(buffer, "{");
    while (keys!=GLOBAL_NULL) {
        v = Table_getval(l, car(keys));
        strcat(buffer, ":");
        strcat(buffer, clean_string(car(keys)));
        strcat(buffer, " ");
        switch (v->type) {
            case INTEGER: case DOUBLE: case RATIO:
                s = number_to_string(v);
                strcat(buffer, s);
                free(s);
                break;
            case NULL_:
                strcat(buffer, "()");
                break;
            case VECTOR:
                s = vector_to_string(v);
                strcat(buffer, s);
                free(s);
                break;
            case TABLE:
                s = table_to_string(v);
                strcat(buffer, s);
                free(s);
                break;
            case STRING:
                s = clean_string(v);
                strcat(buffer, s);
                free(s);
                break;
            case PAIR:
                s = list_to_string(v);
                strcat(buffer, s);
                free(s);
                break;
            case BUILTIN_LAMBDA:
                strcat(buffer, "< builtin-lambda >");
                break;
            case USER_DEFINED_LAMBDA:
                strcat(buffer, "< user-defined-lambda >");
                break;
            default:
                printf("ERROR: stdout");
                break;
        }

        keys = cdr(keys);
        if (keys!=GLOBAL_NULL) {
            strcat(buffer, ", ");
        }
    }
    strcat(buffer, "}");
    char * return_s = malloc(sizeof(char) * (strlen(buffer) + 1));
    strcpy(return_s, buffer);
    return return_s;
}

char * to_string(Object * v){
    char buffer[TO_STRING_BUFFER_SIZE];
    strcpy(buffer, "");
    char * s;
    switch (v->type) {
        case INTEGER: case DOUBLE: case RATIO:
            s = number_to_string(v);
            strcat(buffer, s);
            free(s);
            break;
        case NULL_:
            strcat(buffer, "()");
            break;
        case VECTOR:
            s = vector_to_string(v);
            strcat(buffer, (s));
            free(s);
            break;
        case TABLE:
            s = table_to_string(v);
            strcat(buffer, s);
            free(s);
            break;
        case STRING:
            strcat(buffer, v->data.String.v);
            break;
        case PAIR:
            s = list_to_string(v);
            strcat(buffer, (s));
            free(s);
            break;
        case BUILTIN_LAMBDA:
            strcat(buffer, "< builtin-lambda >");
            break;
        case USER_DEFINED_LAMBDA:
            strcat(buffer, "< user-defined-lambda >");
            break;
        default:
            printf("ERROR: stdout");
            break;
    }
    char * return_s = malloc(sizeof(char) * (strlen(buffer) + 1));
    strcpy(return_s, buffer);
    return return_s;
}

#endif
