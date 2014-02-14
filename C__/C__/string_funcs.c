//
//  string_funcs.c
//  C__
//
//  Created by WangYiyi on 2/13/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#include "to_string.c"

// Compare ObjectString to char *
// if equal, return 0
int ObjectString_CompareS(Object * o, char * compare_str)
{
    char * o_str = o->data.String.v;
    return strcmp(o_str, compare_str); // = 0: equal
}
// if equal return 0
int ObjectString_Compare(Object * o1, Object * o2)
{
    return ObjectString_CompareS(o1, o2->data.String.v);
}
// check equal
int ObjectString_EqualS(Object * o, char * compare_str)
{
    int r = ObjectString_CompareS(o, compare_str);
    if(r==0)return 1; // equal
    return 0;
}