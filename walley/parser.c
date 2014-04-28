/*
  parser.c
 */
#include "lexer.c"
#include "ctype.h"
#define PARSER_DEBUG 1

#define str_eq(a, b) (strcmp((a), (b)) == 0)
// get tag for ' ~ ~@
Object * parser_get_tag(char * s){
  // char * tag;
  if(strcmp(s, "'") == 0) return QUOTE_STRING;
  else if (strcmp(s, "~") == 0) return UNQUOTE_STRING;
  else if (strcmp(s, "~@") == 0) return UNQUOTE_SPLICE_STRING;
  else return QUASIQUOTE_STRING;
}
Object * formatQuickAccess(char**keys, int n, int count, Object * output){
  if(count == n) return output;
  return formatQuickAccess(keys, 
			   n,
			   count+1,
			   cons(output, cons(cons(QUOTE_STRING, 
						  cons(Object_initString(keys[count], strlen(keys[count])),
						       GLOBAL_NULL)),
					     GLOBAL_NULL)));
 
}
int isDouble (char * s)
{
    if (s == NULL || *s == '\0' || isspace(*s))
      return 0;
    char * p;
    strtod (s, &p);
    return *p == '\0';
}
int isInteger(char * s){
  if (s == NULL || *s == '\0' || isspace(*s))
    return 0;
  char * p;
  strtol(s, &p, 10); // 只支持10进制
  return *p == '\0';
}

Object * parser(Lexer * le){

  // init several constants
  GLOBAL_NULL = Object_initNull(); // init GLOBAL_NULL
  QUOTE_STRING = Object_initString("quote", 5);
  UNQUOTE_STRING = Object_initString("unquote", 7);
  UNQUOTE_SPLICE_STRING = Object_initString("unquote_splice", 14);
  QUASIQUOTE_STRING = Object_initString("quasiquote", 10);
  
  char ** l = le->string_array;
  uint32_t length = le->array_length;
  Object * current_list_pointer = GLOBAL_NULL;
  int32_t i;
  uint32_t j, k, n, start, end;
  Object * lists = cons(GLOBAL_NULL, GLOBAL_NULL);
  Object * temp;
  char * splitted_[100]; // max 100 string
  char * t;
  char * ns;
  for(i = length - 1; i >= 0; i--){
    printf("@ %s\n", l[i]);
    if(str_eq(l[i], ")")){
      lists = cons(current_list_pointer, lists); // save current lists
      current_list_pointer = GLOBAL_NULL;        // reset current_list_pointer
    }
    else if (str_eq(l[i], "(")){
      if(i!=0 && 
	 (str_eq(l[i-1], "~@") || str_eq(l[i-1], "'") || str_eq(l[i-1], "~") || str_eq(l[i-1], "`"))){
	temp = cons(cons(parser_get_tag(l[i-1]),
			 cons(current_list_pointer, GLOBAL_NULL)), 
		    car(lists));
	current_list_pointer = temp;
	i--;
      }
      else{
	temp = cons(current_list_pointer, car(lists)); // append list
	current_list_pointer = temp;
      }
      lists = cdr(lists);
    }
    else{
      printf("ENTER HERE");
      // check Math:add like (Math 'add)
      if(l[i][0] == '"' || l[i][0] == ':' || l[i][(int)strlen(l[i])-1] == ':'){
	if(isInteger(l[i]))
	  temp = Object_initInteger(strtol(l[i], &t, 10));
	else if(isDouble(l[i]))
	  temp = Object_initDouble(strtod(l[i], &t));
	else
	  temp = Object_initString(l[i], strlen(l[i]));
      }
      else{
	// split string
	n = 0; // splitted_length
	start = 0;
	end = 0;
	printf("ENTER HERE");
	for(j = 0; j < (int)strlen(l[i]); j++){
	  if(l[i][j] == ':'){
	    /*char */ t = (char*)malloc(sizeof(char)*(j - start + 1));
	    for(k = start; k < j; k++){
	      t[k-start] = l[i][k];
	    }
	    t[k-start] = 0;
	    start = j+1;
	    splitted_[n] = t; 
	    n++; // increase size
	  }
	}
	printf("ENTER HERE");
	// append last
	/*char **/ t = (char*)malloc(sizeof(char)*(j - start + 1));
	for(k = start; k < j; k++){
	  t[k-start] = l[i][k];
	}
	t[k-start] = 0;
	start = j+1;
	splitted_[n] = t; 
	n++; // increase size
	
	ns = splitted_[0]; // get ns. eg x:a => ns 'x' keys ['a']
	temp = formatQuickAccess(
				 splitted_, 
				 n, 
				 2, 
				 cons(Object_initString(ns, strlen(ns)),
				      cons(cons(QUOTE_STRING,
						cons(Object_initString(splitted_[1], strlen(splitted_[1])), 
						     GLOBAL_NULL)),
					   GLOBAL_NULL)));
	
      }
      
      if(i!=0 &&
	 (str_eq(l[i-1], "~@") || str_eq(l[i-1], "'") || str_eq(l[i-1], "~") || str_eq(l[i-1], "`"))){
	current_list_pointer = cons(cons(parser_get_tag(l[i-1]),
					 cons(temp,
					      GLOBAL_NULL)),
				    current_list_pointer);
	i--;
      }
      else{
	current_list_pointer = cons(temp, current_list_pointer);
      }
    }
  }
  return current_list_pointer;
}

#if PARSER_DEBUG
  void parser_debug (Object * p){
    printf("(");
    Object * v;
    while(p!=GLOBAL_NULL){
      v = car(p);
      if(v->type == PAIR || v == GLOBAL_NULL){
	parser_debug(v);
      }
      else{
	switch(v->type){
	case STRING:
	  printf("%s", v->data.String.v);
	  break;
	case INTEGER: 
	  printf("%ld", v->data.Integer.v);
	  break;
	case DOUBLE:
	  printf("%lf", v->data.Double.v);
	  break;
	case NULL_:
	  printf("()");
	  break;
	default:
	  break;
	}
      }
      printf(" ");
      p = cdr(p);
    }
    printf(")");
  }
int main(){
  char s[1000] = "a";
  Lexer * p;
  p = lexer((char*)s);
  Lexer_Debug(p);
  
  Object * o;
  o = parser(p);
  return 0;
}

#endif
