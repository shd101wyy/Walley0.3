// string library
#include "ratio.c"

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
		o[i] = s2[a]; i++;
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
// char to string
char * String_charToString(char s)
{
    char *out = (char*)malloc(sizeof(char) * 2);
    out[0] = s;
    out[1] = 0;
    return out;
}

// format string
char *String_formatString(Object * o)
{
	char * s = o->data.String.v;
	int length = (int)strlen(s);
	if(length == 0) return "#str{}";
	if(String_find(s, ' ') == -1)
		return s;
    printf("%s\n", String_append("#str{", String_append(s, "}#")));
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
	double v = o->data.Double.v;
	char * out = (char*)malloc(sizeof(100));
	sprintf(out, "%lf", v);
	return out;
}
char *String_formatPair(Object * o)
{
	if(o == NULL) return "()";
	char * output = "(";
	Object * p = o;
    
	while(1)
	{
		if(p == NULL)
		{
			output = String_append(String_slice(output, 0, (int)strlen(output) - 1), ")");
			break;
		}
		if(p->type != PAIR)
		{
            output = String_append(output, ". ");
            output = String_append(output, String_formatObject(p));
            output = String_append(output, ")");
            break;
		}
		else
		{
            Object * c = p->data.Pair.car;
            if (c == NULL) output = String_append(output, "()");
            else if (c->type == INTEGER) output = String_append(output, String_formatInteger(c));
            else if (c->type == DOUBLE) output = String_append(output, String_formatDouble(c));
            else if (c->type == STRING){
                output = String_append(output, String_formatString(c));}
            else if (c->type == PAIR) output = String_append(output, String_formatPair(c));
            else
            {
                printf("ERROR: formatPair invalid param");
                exit(0);
            }
            output = String_append(output, " ");
            p = p->data.Pair.cdr;
		}
	}
    return output;
}
char *String_formatObject(Object * o)
{
    switch (o->type) {
        case INTEGER:
            return String_formatInteger(o);
        case DOUBLE:
            return String_formatDouble(o);
        case PAIR:
            return String_formatPair(o);
        case STRING:
            return String_formatString(o);
        default:
            printf("ERROR:formatObject invalid parameter");
            break;
    };
    return "ERROR";
}
void String_debug(Object * o)
{
    printf("%s\n", String_formatObject(o));
}
/*
char *String_formatRatio(Object * o)
{
	long denom = o->data.Ratio.denom;
	long numer = o->data.Ratio.numer;
	char * out = (char*)malloc(sizeof(100));
	sprintf(out, "%ld/%ld", numer, denom);
	return out;
}*/