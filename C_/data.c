/*

	several data types

*/
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Object Object;
void Object_print(Object * o);
typedef enum 
{
	INTEGER,
	DOUBLE,
	STRING,
	PAIR,
	RATIO,
	LAMBDA
} DataType;
/*
	several data types
*/
struct Object
{
	DataType type;
	union
	{
		struct 
		{
			long v;
		} Integer;
		struct 
		{
			double v;
		} Double;
		struct 
		{
			long denom;
			long numer;
		};
		struct 
		{
			char * v;
		} String;
		struct 
		{
			Object * car;
			Object * cdr;
		} Pair;
		struct
		{
			int start;
		} Lambda;
	} data;
};

Object * allocateObject()
{
	Object * o = (Object*)malloc(sizeof(Object));
	if(o == NULL)
	{
		printf("ERROR:Out of memory\n");
		exit(1);
	}
	return o;
}
/*
	initialize integer
*/
Object * initInteger(int v)
{
	Object * o = allocateObject();
	o->type = INTEGER;
	o->data.Integer.v = v;
	return o;
}
/*
	initialize double
*/
Object * initDouble(double v)
{
	Object * o = allocateObject();
	o->type = DOUBLE;
	o->data.Double.v = v;
	return o;
}
/*
	initialize string
*/
Object * initString(char * v)
{
	Object * o = allocateObject();
	o->type = STRING;
	o->data.String.v = malloc(sizeof(char)*(strlen(v) + 1));
	if(o->data.String.v == NULL)
	{
		printf("ERROR:Out of memory\n");
		exit(1);
	}
	strcpy(o->data.String.v, v);
	return o;
}
/*
	cons
*/
Object * cons(Object * car, Object * cdr)
{
	Object * o = allocateObject();
	o->type = PAIR;
	o->data.Pair.car = car;
	o->data.Pair.cdr = cdr;
	return o;
}












