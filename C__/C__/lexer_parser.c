//
//  lexer_parser.c
//  C__
//
//  Created by WangYiyi on 2/13/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#include "to_string.c"

int Lexer_find_final_comment_index(char *input_str, int length, int start) // find end index of comment ; comment
{
    int i = start;
    for(; i < length; i++)
    {
        if (input_str[i] == '\n') {
            return i;
        }
    }
    return i;
}
int Lexer_find_final_long_annotation_index(char *input_str, int length, int start) // find end index of long comment ;;; comment ;;;
{
    int i = start;
    for(; i + 3 < length; i++)
    {
        if(input_str[i] == ';' && input_str[i+1] == ';' && input_str[i+2] == ';')
            return i+3;
    }
    return i;
}
int Lexer_find_final_string_index(char * input_str, int length, int start) // find final index of string
{
    int i = start;
    for (; i < length; i++)
    {
        if (input_str[i] == '\\') {
            i += 1;
            continue;
        }
        if(input_str[i] == '"')
            return i + 1;
    }
    printf("ERROR: Incomplete String");
    return i;
}
int Lexer_find_final_number_or_atom_index(char * input_str, int length, int start)
{
    int i = start;
    for (; i < length; i++) {
        if(input_str[i]=='(' || input_str[i]==')'
           || input_str[i]=='[' || input_str[i]==']'
           || input_str[i]=='{' || input_str[i]=='}'
           || input_str[i]==' ' || input_str[i]=='\t'
           || input_str[i]=='\n' || input_str[i]==';'
           || input_str[i]==',')
            return i;
    }
    return i;
}
Object * Lexer_iter(char *input_str, int i, int length)
{
    if(i >= length) return NULL;
    else if(input_str[i]==' ' || input_str[i]=='\n' || input_str[i]=='\t' || input_str[i]==',') // remove space tab newline ,
        return Lexer_iter(input_str, i + 1, length);
    else if(input_str[i] == '(' || input_str[i] == '[')
        return cons( Object_initString("("), Lexer_iter(input_str, i + 1, length));
    // vector
    else if (input_str[i] == '#' && (input_str[i+1]=='(' || input_str[i+1]=='['))
        return cons( Object_initString("("), cons(Object_initString("vector"), Lexer_iter(input_str, i+2, length)));
    else if(input_str[i] == '{')
        return cons( Object_initString("("), cons(Object_initString("dictionary"), Lexer_iter(input_str, i + 1, length)));
    else if(input_str[i] == ')' || input_str[i] == ']' || input_str[i] == '}')
        return cons( Object_initString(")"), Lexer_iter(input_str, i + 1, length));
    else if(input_str[i] == '~' && input_str[i+1] == '@')
        return cons( Object_initString("~@"), Lexer_iter(input_str, i+2, length));
    else if(input_str[i] == '\'' || input_str[i] == '`' || input_str[i] == '~')
        return cons( Object_initString( String_charToString(input_str[i]) ), Lexer_iter(input_str, i + 1, length));
    else if(input_str[i] == '"')
    {
        int end = Lexer_find_final_comment_index(input_str, length, i+1);
        return cons( Object_initString(String_slice(input_str, i, end)), Lexer_iter(input_str, end, length));
    }
    // long annotation
    else if (i + 3 <= length && input_str[i] == ';' && input_str[i + 1] == ';' && input_str[i + 2] == ';') // ;;; comment ;;;
        return Lexer_iter(input_str, Lexer_find_final_long_annotation_index(input_str, length, i+3), length);
    else if(input_str[i] == ';') // comment
        return Lexer_iter(input_str, Lexer_find_final_comment_index(input_str, length, i+1), length);
    else
    {
        // atom or number
        int end = Lexer_find_final_number_or_atom_index(input_str, length, i+1);
        char* __obj = String_slice(input_str, i, end);
        if(isRatio(__obj)) // is ratio number
        {
            return cons(Object_initString("("), cons(Object_initString("/"), cons(Object_initInteger(atoi(getNumerator(__obj))), cons(Object_initInteger(atoi(getDenominator(__obj))), cons(Object_initString(")"), Lexer_iter(input_str, end, length))))));
        }
        else
        {
            return cons(Object_initString(__obj), Lexer_iter(input_str, end, length));
        }
        // return cons( input_str.slice(i, end) , lexer_iter(input_str, end));
    }
}
// lexer
Object * Lexer(char * input_str)
{
    int length = (int)strlen(input_str);
    return Lexer_iter(input_str, 0, length);
}
































