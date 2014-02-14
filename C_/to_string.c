// string library
#include "data.c"

/*
	Object to string
*/
int String_find(char *input_str, char find_char)
{
	int length = (int)strlen(input_str);
	int i = 0;
	for(; i < length; i++)
	{
		if(input_str[i] == find_char)
			return i;
	}
	return -1;
}
// append 2 strings
char * String_append(char * s1, char * s2)
{
	int length1 = (int)strlen(s1);
	int length2 = (int)strlen(s2);
	char *o = (char*)malloc(sizeof(char) * (length1 + length2 + 1));
	int i = 0;
	for(; i < length1; i++)
	{
		o[i] = s1[i];
	}
	int a = 0;
	for(; a < length2; a++)
	{
		o[i] = s2[i]; i++;
	}
	o[i] = 0;
	return o;
}
// slice string
char * String_slice(char * s, int start, int end)
{
	char * out = (char*)malloc(sizeof(char) * (end - start + 1));
	int i = start;
	int a = 0;
	for(; i < end; i++)
	{
		out[a] = s[i];
		a++;
	}
	out[a] = 0;
	return out;
}

// format string
char *String_formatString(Object * o)
{
	char * s = o->data.String.v;
	int length = (int)strlen(s);
	if(length == 0) return "#str{}";
	if(String_find(s, ' ') == -1)
		return s
	return String_append("#str{", String_append(s, "}#"));
}
char *String_formatInteger(Object * o)
{
	long v = o->data.Integer.v;
	char * out = (char*)malloc(sizeof(100));
	sprintf(out, "%ld", v);
	return out;
}
char *String_formatDouble(Object * o)
{
	long v = o->data.Double.v;
	char * out = (char*)malloc(sizeof(100));
	sprintf(out, "%lf", v);
	return out;
}
char *String_formatRatio(Object * o)
{
	long denom = o->data.Ratio.denom;
	long numer = o->data.Ratio.numer;
	char * out = (char*)malloc(sizeof(100));
	sprintf(out, "%ld/%ld", numer, denom);
	return out;
}
char *String_formatList = function(Object * o)
{
	if(o == NULL) return "()";
	char * output = "(";
	Object * p = l;
	while(1)
	{
		if(l == NULL)
		{
			String_append(String_slice(output, 0, (int)strlen(output) - 1), ")");
			break;
		}
		if(l->type != Pair)
		{

		}
		else
		{

		}
	}
}

/*
	print for test
*/
void Object_printPair(Object * o)
{
	if(o == NULL)
	{
		printf("()");
		return;
	}
	Object * p;
	while(1)
	{
		if(p == NULL)
		{

		}
	}
}
void Object_print(Object * o)
{
	if(o == NULL)
	{
		printf("()\n");
		return;
	}
	switch(o->type)
	{
		case INTEGER:
			printf("%ld ", o->data.Integer.v);
			break;
		case DOUBLE:
			printf("%lf ", o->data.Double.v);
			break;
		case STRING:
			printf("%s ", o->data.String.v);
			break;
		case PAIR:
			return Object_printPair(o);
		default:
			printf("ERROR:Invalid data type to print");
			break;
	}
}


int main()
{
	Object * a = initInteger(12);
	Object_print(a);
	Object * b = initDouble(12.35);
	Object_print(b);
	Object * c = initString("Hello World");
	Object_print(c);
	Object * d = cons(a, b);
	Object_print(d);
	return 0;
}
