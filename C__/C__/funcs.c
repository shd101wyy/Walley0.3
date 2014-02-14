//
//  funcs.c
//  C__
//
//  Created by WangYiyi on 2/13/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//


#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <ctype.h>


typedef struct Object Object;

int String_find(char *input_str, char find_char);
char * String_append(char * s1, char * s2);
char * String_slice(char * s, int start, int end);
char * String_charToString(char s);
char *String_formatString(Object * o);
char *String_formatInteger(Object * o);
char *String_formatDouble(Object * o);
char *String_formatPair(Object * o);
char *String_formatVector(Object * o);
char *String_formatObject(Object * o);

Object * Parser_List(Object * l);
Object * Parser_Special(Object * l);
Object * Parser_Symbol_or_Number(Object * l);