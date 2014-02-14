//
//  ratio.c
//  C__
//
//  Created by WangYiyi on 2/13/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#include "data.c"
/*
// calculate general common divisor
long gcd(long a, long b)
{
    while(b!=0)
    {
        long temp = a;
        a = b;
        b = temp%b;
    }
    return a;
}
long Ratio_getNumerator(Object * o)
{
    return o->data.Ratio.numer;
}
long Ratio_getDenominator(Object * o)
{
    return o->data.Ratio.denom;
}

Object * Object_initRatio(long numer, long denom)
{
    Object * o = allocateObject();
    o->type = RATIO;
    
    long g = gcd(numer, denom);
    long n = numer / g;
    long d = denom / g;
    
    o->data.Ratio.numer = n;
    o->data.Ratio.denom = d;
    return o;
}*/

// check string is integer
int isInteger(char *input_str)
{
    int length = (int)strlen(input_str);
    if(length == 0) return 0;
    if(input_str[0] == '-') input_str = String_slice(input_str, 1, length);
    if (length == 2 && input_str[0] == '0') return 1; // 0
    if (input_str[0] == '0') {
        input_str = String_slice(input_str, 1, (int)strlen(input_str));
    }
    else if ((int)strlen(input_str) >= 3 && input_str[0] == '0' && input_str[1] == 'x') {
        input_str = String_slice(input_str, 2, (int)strlen(input_str));
    }
    length = (int)strlen(input_str);
    int i = 0;
    for (; i < length; i++) {
        if(!isdigit(input_str[i]))
            return 0;
    }
    return 1;
}
int isFloat(char * input_str)
{
    int index_of_dot = String_find(input_str, '.');
    if(index_of_dot == -1) return 0;// not float
    return isInteger(String_slice(input_str, 0, index_of_dot)) && isInteger(String_slice(input_str, index_of_dot + 1, (int)strlen(input_str)));
}
// check string is ratio
int isRatio(char *input_str)
{
    int index_of_slash = String_find(input_str, '/');
    if (index_of_slash == -1) return 0;
    char * numer = String_slice(input_str, 0, index_of_slash);
    char * denom = String_slice(input_str, index_of_slash+1, (int)strlen(input_str));
    if(isInteger(numer) && isInteger(denom)) // didn't consider the case denominator is 0
    {
        if(atoi(denom) == 0)
        {
            printf("Invalid ratio --- %s with denominator 0", input_str);
            return 0;
        }
        return 1;
    }
    return 0;
}
char * getNumerator(char * input_str)
{
    int index_of_slash = String_find(input_str, '/');
    return String_slice(input_str, 0, index_of_slash);
}
char * getDenominator(char * input_str)
{
    int index_of_slash = String_find(input_str, '/');
    return String_slice(input_str, index_of_slash + 1, (int)strlen(input_str));
}



























