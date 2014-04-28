/*
 parser.c
 */
#include "lexer.h"
#define PARSER_DEBUG 1
#ifndef PARSER_C
#define PARSER_C

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
/*
    free parser
 */
void parser_free(Object * p){
    Object * v;
    Object * temp;
    while(p!=GLOBAL_NULL){
        v = car(p);
        switch (v->type) {
            case STRING:
                free(v->data.String.v);
                free(v);
                break;
            case INTEGER:case DOUBLE:
                free(v);
                break;
            default:
                break;
        }
        temp = p;
        p = cdr(p);
        free(temp);
        temp = NULL;
    }
}
Object * parser(Lexer * le){
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
        // printf("@ %s\n", l[i]);
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
                if(n == 1){ // 没有找到 :
                    if(isInteger(l[i]))
                        temp = Object_initInteger(strtol(l[i], &t, 10));
                    else if(isDouble(l[i]))
                        temp = Object_initDouble(strtod(l[i], &t));
                    else
                        temp = Object_initString(l[i], strlen(l[i]));
                }
                else{
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
    // after parsing, free lexer
    Lexer_free(le);
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
/*
int main(){
    char s[1000] = "a";
    Lexer * p;
    p = lexer((char*)s);
    Lexer_Debug(p);
    
    Object * o;
    o = parser(p);
    return 0;
}*/
#endif
#endif