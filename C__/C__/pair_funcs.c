//
//  pair_funcs.c
//  C__
//
//  Created by WangYiyi on 2/13/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#include "string_funcs.c"
// get car of pair
Object * car(Object * o)
{
    return o->data.Pair.car;
}
// get cdr of pair
Object * cdr(Object * o)
{
    return o->data.Pair.cdr;
}