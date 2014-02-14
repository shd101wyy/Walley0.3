//
//  lexer_parser.c
//  C__
//
//  Created by WangYiyi on 2/13/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#include "pair_funcs.c"

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
        {
            return i + 1;
        }
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
        return cons( Object_initString(")"), Lexer_iter(input_str, i+1, length));
    else if(input_str[i] == '~' && input_str[i+1] == '@')
        return cons( Object_initString("~@"), Lexer_iter(input_str, i+2, length));
    else if(input_str[i] == '\'' || input_str[i] == '`' || input_str[i] == '~')
        return cons( Object_initString( String_charToString(input_str[i]) ), Lexer_iter(input_str, i + 1, length));
    else if(input_str[i] == '"')
    {
        int end = Lexer_find_final_string_index(input_str, length, i+1);
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
    }
}
// lexer
Object * Lexer(char * input_str)
{
    int length = (int)strlen(input_str);
    return Lexer_iter(input_str, 0, length);
}
static Object * Parser_Rest = NULL;
// parse List
Object * Parser_List(Object * l)
{
    if(l==NULL)
    {
        printf("ERROR: Incomplete Statement, missing )");
        Parser_Rest = NULL;
        return  NULL;
    }
    else if(0 == ObjectString_CompareS(car(l), ")")) // reach end
    {
        Parser_Rest = cdr(l);
        return NULL;
    }
    else if(0 == ObjectString_CompareS(car(l), "("))
    {
        return cons(Parser_List(cdr(l)), Parser_List(Parser_Rest));
    }
    else if (0 == ObjectString_CompareS(car(l), "'") || 0 == ObjectString_CompareS(car(l), "~") || 0 == ObjectString_CompareS(car(l), "`") || 0 == ObjectString_CompareS(car(l), "~@"))  // quote unquote quasiquote unquote-splice
    {
        return cons(Parser_Special(l), Parser_List(Parser_Rest));
    }
    else  // symbol or number
    {
        return cons(Parser_Symbol_or_Number(car(l)), Parser_List(cdr(l)));
    }
}
// parse special
Object * Parser_Special(Object * l)
{
    Object * tag ;
    if(ObjectString_EqualS(car(l), "'"))
        tag = Object_initString("quote");
    else if (ObjectString_EqualS(car(l), "~"))
        tag = Object_initString("unquote");
    else if (ObjectString_EqualS(car(l) ,"~@"))
        tag = Object_initString("unquote-splice");
    else
        tag = Object_initString("quasiquote");
    l = cdr(l);
    if (ObjectString_EqualS(car(l), "(")) // list
    {
        return cons(tag, cons(Parser_List(cdr(l)), NULL));
    }
    else if (ObjectString_EqualS(car(l) ,"'") || ObjectString_EqualS(car(l), "~") || ObjectString_EqualS(car(l), "`"))  // quote unquote quasiquote
    {   // here my be some errors
        return cons(tag, cons(Parser_Special(l), NULL));
    }
    else  // symbol or number
    {
        Parser_Rest = cdr(l);
        return cons(tag, cons(Parser_Symbol_or_Number(car(l)), NULL));
    }
}
// parse symbol or number
Object * Parser_Symbol_or_Number(Object * l)
{
    char * v = l->data.String.v;
    if(l->data.String.v[0] == '\"') return l; // string
    else if (isInteger(v))
    {
        return Object_initInteger(atol(v));
    }
    else if (isFloat(v))
    {
        return Object_initDouble(atof(v));
    }
    return l; // symbol
    /*
    var splitted_ = l.split(":");
    // console.log(l);
    // console.log(splitted_);
    if(l === ":"  || splitted_.length == 1 || l[0] === ":" || l[l.length-1] === ":") //  : :abc abc:
        return l;
    var ns = splitted_[0]; // eg x:a => ns 'x'  keys ['a']
    var keys = splitted_.slice(1);
    var formatted_ = formatQuickAccess(ns, keys); // eg x:a => (ref x :a) or (x :a)
    // console.log(formatted_);
    return formatted_;
    */
    printf("Parser Symbol or Number error");
    return NULL;
}


// parser
Object * Parser(Object * l)
{
    // done
    if(l == NULL)
        return NULL;
    // list
    else if (ObjectString_EqualS(car(l), "("))
    {
        return cons(Parser_List(cdr(l)), Parser(Parser_Rest));
    }
    // quote // unquote // quasiquote // unquote-splice
    else if (ObjectString_EqualS(car(l), "'") ||
             ObjectString_EqualS(car(l), "~") ||
             ObjectString_EqualS(car(l), "`") ||
             ObjectString_EqualS(car(l),"~@"))
    {
        return cons(Parser_Special(l), Parser_Rest);
    }
    // symbol or number
    else
    {
        return cons(Parser_Symbol_or_Number( car(l) ), Parser(cdr(l)));
    }
}






























