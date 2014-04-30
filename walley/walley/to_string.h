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

/*
    Object to string
 */

char * number_to_string(Object * x){
    char buffer[1024];
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
    char buffer[1024];
    strcpy(buffer, "");

    unsigned long i = 0;
    unsigned long length = s->data.String.length;
    int has_space = 0;
    for (i = 0; i < length; i++) {
        if (s->data.String.v[i] == ' ') {
            has_space = 1; break;
        }
    }
    if (has_space) {
        strcat(buffer, "#str{");
        strcat(buffer, s->data.String.v);
        strcat(buffer, "}");
    }
    else{
        strcat(buffer, s->data.String.v);
    }
    char * return_s = malloc(sizeof(char) * (strlen(buffer) + 1));
    strcpy(return_s, buffer);
    return return_s;
}
char * list_to_string(Object * l){
    char buffer[1024]; // maximum 1024
    strcpy(buffer, "(");

    Object * p = l;
    Object * v;
    /*
        这里可能得free .
     */
    while (p != GLOBAL_NULL) {
        v = car(p);
        switch (v->type) {
            case INTEGER: case DOUBLE: case RATIO:
                strcat(buffer, number_to_string(v));
                break;
            case NULL_:
                strcat(buffer, "()");
                break;
            case VECTOR:
                strcat(buffer, vector_to_string(v));
                break;
            case TABLE:
                strcat(buffer, table_to_string(v));
                break;
            case STRING:
                strcat(buffer, clean_string(v));
                break;
            case PAIR:
                strcat(buffer, list_to_string(v));
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
    char buffer[1024]; // maximum 1024
    strcpy(buffer, "");

    Object * v;
    /*
     这里可能得free .
     */
    unsigned long length = l->data.Vector.length;
    unsigned long i;
    if (l->data.Vector.resizable) {
        strcat(buffer, "#[");
    }
    else strcat(buffer, "#(");
    
    for (i = 0; i < length; i++) {
        v = l->data.Vector.v[i];
        switch (v->type) {
            case INTEGER: case DOUBLE: case RATIO:
                strcat(buffer, number_to_string(v));
                break;
            case NULL_:
                strcat(buffer, "()");
                break;
            case VECTOR:
                strcat(buffer, vector_to_string(v));
                break;
            case TABLE:
                strcat(buffer, table_to_string(v));
                break;
            case STRING:
                strcat(buffer, clean_string(v));
                break;
            case PAIR:
                strcat(buffer, list_to_string(v));
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
    char buffer[1024]; // maximum 1024
    strcpy(buffer, "");
    
    Object * v;
    
    Object * keys = table_getKeys(l); // it is pair
    strcat(buffer, "{");
    while (keys!=GLOBAL_NULL) {
        v = Table_getval(l, car(keys));
        strcat(buffer, ":");
        strcat(buffer, clean_string(car(keys)));
        strcat(buffer, " ");
        switch (v->type) {
            case INTEGER: case DOUBLE: case RATIO:
                strcat(buffer, number_to_string(v));
                break;
            case NULL_:
                strcat(buffer, "()");
                break;
            case VECTOR:
                strcat(buffer, vector_to_string(v));
                break;
            case TABLE:
                strcat(buffer, table_to_string(v));
                break;
            case STRING:
                strcat(buffer, clean_string(v));
                break;
            case PAIR:
                strcat(buffer, list_to_string(v));
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
    char buffer[1024];
    strcpy(buffer, "");
    switch (v->type) {
        case INTEGER: case DOUBLE: case RATIO:
            strcat(buffer, number_to_string(v));
            break;
        case NULL_:
            strcat(buffer, "()");
            break;
        case VECTOR:
            strcat(buffer, vector_to_string(v));
            break;
        case TABLE:
            strcat(buffer, table_to_string(v));
            break;
        case STRING:
            strcat(buffer, clean_string(v));
            break;
        case PAIR:
            strcat(buffer, list_to_string(v));
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
