#ifndef builtin_procedures_h
#define builtin_procedures_h
#include "to_string.h"


static int GEN_SYM_COUNT = 0;
/*
 builtin lambdas
 */
// 0 cons
Object *builtin_cons(Object ** params, int param_num, int start_index){
    Object * o = allocateObject();
    Object * car = params[start_index];
    Object * cdr = params[start_index+1];
    o->use_count = 0;
    o->type = PAIR;
    o->data.Pair.car = car;
    o->data.Pair.cdr = cdr;
    car->use_count++;
    cdr->use_count++;
    return o;
}
// 1 car
Object *builtin_car(Object ** params, int param_num, int start_index){
    return car(params[start_index]);
}
// 2 cdr
Object *builtin_cdr(Object ** params, int param_num, int start_index){
    return cdr(params[start_index]);
}
// 3 +
Object * add_2(Object * p1, Object * p2){
    switch (p1->type) {
        case INTEGER:
            switch (p2->type) {
                case INTEGER:
                    return Object_initInteger(p1->data.Integer.v + p2->data.Integer.v);
                case DOUBLE:
                    return Object_initDouble(p1->data.Integer.v + p2->data.Double.v);
                case RATIO:
                    return add_rat(p1->data.Integer.v, 1,
                                   p2->data.Ratio.numer, p2->data.Ratio.denom);
                default:
                    printf("ERROR: + invalid data type");
                    return GLOBAL_NULL;
            }
            break;
        case DOUBLE:
            switch (p2->type) {
                case INTEGER: case DOUBLE:
                    return Object_initDouble(p1->data.Double.v + p2->data.Integer.v);
                case RATIO:
                    return Object_initDouble(p1->data.Double.v + p2->data.Ratio.numer/p2->data.Ratio.denom);
                default:
                    printf("ERROR: + invalid data type");
                    return GLOBAL_NULL;;
            }
            break;
        case RATIO:
            switch (p2->type) {
                case INTEGER:
                    return add_rat(p1->data.Ratio.numer, p1->data.Ratio.denom, p2->data.Integer.v, 1);
                case DOUBLE:
                    return Object_initDouble(p1->data.Ratio.numer/p1->data.Ratio.denom + p2->data.Double.v);
                case RATIO:
                    return add_rat(p1->data.Ratio.numer, p1->data.Ratio.denom, p2->data.Ratio.numer, p2->data.Ratio.denom);
                default:
                    printf("ERROR: + invalid data type");
                    return GLOBAL_NULL;
            }
            break;
        default:
            printf("ERROR: + invalid data type");
            return GLOBAL_NULL;
    }
}
Object *builtin_add(Object ** params, int param_num, int start_index){
    Object * return_val = params[start_index];
    Object *p1, * p2;
    int i;
    for (i = 1; i < param_num; i++) {
        p2 = params[i + start_index];
        p1 = return_val;
        return_val = add_2(return_val, p2);
        Object_free(p1);
    }
    return return_val;
}
Object * sub_2(Object * p1, Object * p2){
    switch (p1->type) {
        case INTEGER:
            switch (p2->type) {
                case INTEGER:
                    return Object_initInteger(p1->data.Integer.v - p2->data.Integer.v);
                case DOUBLE:
                    return Object_initDouble(p1->data.Integer.v - p2->data.Double.v);
                case RATIO:
                    return sub_rat(p1->data.Integer.v, 1,
                                   p2->data.Ratio.numer, p2->data.Ratio.denom);
                default:
                    printf("ERROR: - invalid data type");
                    return GLOBAL_NULL;
            }
            break;
        case DOUBLE:
            switch (p2->type) {
                case INTEGER: case DOUBLE:
                    return Object_initDouble(p1->data.Double.v - p2->data.Integer.v);
                case RATIO:
                    return Object_initDouble(p1->data.Double.v - p2->data.Ratio.numer/p2->data.Ratio.denom);
                default:
                    printf("ERROR: - invalid data type");
                    return GLOBAL_NULL;;
            }
            break;
        case RATIO:
            switch (p2->type) {
                case INTEGER:
                    return sub_rat(p1->data.Ratio.numer, p1->data.Ratio.denom, p2->data.Integer.v, 1);
                case DOUBLE:
                    return Object_initDouble(p1->data.Ratio.numer/p1->data.Ratio.denom - p2->data.Double.v);
                case RATIO:
                    return sub_rat(p1->data.Ratio.numer, p1->data.Ratio.denom, p2->data.Ratio.numer, p2->data.Ratio.denom);
                default:
                    printf("ERROR: - invalid data type");
                    return GLOBAL_NULL;
            }
            break;
        default:
            printf("ERROR: - invalid data type");
            return GLOBAL_NULL;
    }
}
// 4 -
Object *builtin_sub(Object ** params, int param_num, int start_index){
    Object * return_val = params[start_index];
    Object *p1, * p2;
    int i;
    for (i = 1; i < param_num; i++) {
        p2 = params[i + start_index];
        p1 = return_val;
        return_val = sub_2(return_val, p2);
        Object_free(p1);
    }
    return return_val;
}
Object * mul_2(Object * p1, Object * p2){
    switch (p1->type) {
        case INTEGER:
            switch (p2->type) {
                case INTEGER:
                    return Object_initInteger(p1->data.Integer.v * p2->data.Integer.v);
                case DOUBLE:
                    return Object_initDouble(p1->data.Integer.v * p2->data.Double.v);
                case RATIO:
                    return mul_rat(p1->data.Integer.v, 1,
                                   p2->data.Ratio.numer, p2->data.Ratio.denom);
                default:
                    printf("ERROR: * invalid data type");
                    return GLOBAL_NULL;
            }
            break;
        case DOUBLE:
            switch (p2->type) {
                case INTEGER: case DOUBLE:
                    return Object_initDouble(p1->data.Double.v * p2->data.Integer.v);
                case RATIO:
                    return Object_initDouble(p1->data.Double.v * p2->data.Ratio.numer/p2->data.Ratio.denom);
                default:
                    printf("ERROR: * invalid data type");
                    return GLOBAL_NULL;;
            }
            break;
        case RATIO:
            switch (p2->type) {
                case INTEGER:
                    return mul_rat(p1->data.Ratio.numer, p1->data.Ratio.denom, p2->data.Integer.v, 1);
                case DOUBLE:
                    return Object_initDouble(p1->data.Ratio.numer/p1->data.Ratio.denom * p2->data.Double.v);
                case RATIO:
                    return mul_rat(p1->data.Ratio.numer, p1->data.Ratio.denom, p2->data.Ratio.numer, p2->data.Ratio.denom);
                default:
                    printf("ERROR: * invalid data type");
                    return GLOBAL_NULL;
            }
            break;
        default:
            printf("ERROR: * invalid data type");
            return GLOBAL_NULL;
    }
}
// 5 *
Object *builtin_mul(Object ** params, int param_num, int start_index){
    Object * return_val = params[start_index];
    Object *p1, * p2;
    int i;
    for (i = 1; i < param_num; i++) {
        p2 = params[i + start_index];
        p1 = return_val;
        return_val = mul_2(return_val, p2);
        Object_free(p1);
    }
    return return_val;

}
Object * div_2(Object * p1, Object * p2){
    switch (p1->type) {
        case INTEGER:
            switch (p2->type) {
                case INTEGER:
                    return div_rat(p1->data.Integer.v, 1, p2->data.Integer.v, 1); // only this one use div_rat
                case DOUBLE:
                    return Object_initDouble(p1->data.Integer.v / p2->data.Double.v);
                case RATIO:
                    return div_rat(p1->data.Integer.v, 1,
                                   p2->data.Ratio.numer, p2->data.Ratio.denom);
                default:
                    printf("ERROR: / invalid data type");
                    return GLOBAL_NULL;
            }
            break;
        case DOUBLE:
            switch (p2->type) {
                case INTEGER: case DOUBLE:
                    return Object_initDouble(p1->data.Double.v / p2->data.Integer.v);
                case RATIO:
                    return Object_initDouble(p1->data.Double.v / p2->data.Ratio.numer/p2->data.Ratio.denom);
                default:
                    printf("ERROR: / invalid data type");
                    return GLOBAL_NULL;;
            }
            break;
        case RATIO:
            switch (p2->type) {
                case INTEGER:
                    return div_rat(p1->data.Ratio.numer, p1->data.Ratio.denom, p2->data.Integer.v, 1);
                case DOUBLE:
                    return Object_initDouble(p1->data.Ratio.numer/p1->data.Ratio.denom / p2->data.Double.v);
                case RATIO:
                    return div_rat(p1->data.Ratio.numer, p1->data.Ratio.denom, p2->data.Ratio.numer, p2->data.Ratio.denom);
                default:
                    printf("ERROR: + invalid data type");
                    return GLOBAL_NULL;
            }
            break;
        default:
            printf("ERROR: + invalid data type");
            return GLOBAL_NULL;
    }
}
// 6 /
Object *builtin_div(Object ** params, int param_num, int start_index){
    Object * return_val = params[start_index];
    Object *p1, * p2;
    int i;
    for (i = 1; i < param_num; i++) {
        p2 = params[i + start_index];
        p1 = return_val;
        return_val = div_2(return_val, p2);
        Object_free(p1);
    }
    return return_val;


}
// 7 vector!
Object *builtin_vector(Object ** params, int param_num, int start_index){
    int size = (param_num / 16 + 1) * 16; // determine the size
    int i = 0;
    Object * v = Object_initVector(1, size);
    Object *temp;
    for(; i < param_num; i++){
        temp = params[start_index + i];
        vector_Get(v, i) = temp;
        // increase temp use_count
        temp->use_count++;
    }
    v->data.Vector.length = param_num;
    return v;
}
// 8 vector
Object *builtin_vector_with_unchangable_length(Object ** params, int param_num, int start_index){
    int i = 0;
    Object * v = Object_initVector(0, param_num);
    Object * temp;
    for(; i < param_num; i++){
        temp = params[start_index+i];
        vector_Get(v, i) = temp;
        temp->use_count++;
    }
    v->data.Vector.length = param_num;
    return v;
}
// 9 vector-length
Object *builtin_vector_length(Object ** params, int param_num, int start_index){
    return Object_initInteger(vector_Length(params[start_index]));
}
// 10 vector-push!
Object *builtin_vector_push(Object ** params, int param_num, int start_index){
    long i = 0;
    Object * vec = params[start_index];
    Object * temp;
    unsigned long length = vector_Length(vec);
    unsigned long size = vector_Size(vec);
    for(i = 1; i < param_num; i++){
        if(length == size){
            if(vec->data.Vector.resizable){
                vec->data.Vector.v = realloc(vec->data.Vector.v, sizeof(Object*) * (size * 2)); // increase size
                vec->data.Vector.size *= 2;
            }
            else{
                printf("ERROR: Cannot change size of vector\n");
                return GLOBAL_NULL;
            }
        }
        temp = params[start_index+i];
        vector_Set(vec, length, temp);
        temp->use_count++; // increase use count
        length++;
    }
    vec->data.Vector.length = length;
    return params[start_index];
}
// 11 vector-pop!
Object *builtin_vector_pop(Object ** params, int param_num, int start_index){
    Object * vec = params[start_index];
    unsigned long length = vector_Length(vec);
    
    Object *return_out = vector_Get(vec, length - 1); // get pop value
    return_out->use_count--;                          // decrement use count
    
    vector_Get(vec, length - 1) = GLOBAL_NULL; // clear that variable
    length = length - 1;
    vec->data.Vector.length = length; // reset length
    return return_out;
}
int num_equal_2(Object * p1, Object * p2){
    switch (p1->type) {
        case INTEGER:
            switch (p2->type) {
                case INTEGER:
                    return (p1->data.Integer.v == p2->data.Integer.v) ? 1 : 0;
                case DOUBLE:
                    return (p1->data.Integer.v == p2->data.Double.v) ? 1 : 0;
                case RATIO:
                    return (p1->data.Integer.v == p2->data.Ratio.numer/p2->data.Ratio.denom) ? 1 : 0;
                default:
                    printf("ERROR: = invalid data type\n");
                    printf("     :%s\n", to_string(p2));
                    return 0;
            }
            break;
        case DOUBLE:
            switch (p2->type) {
                case INTEGER:
                    return (p1->data.Double.v == p2->data.Integer.v) ?1 : 0;
                case DOUBLE:
                    return (p1->data.Double.v == p2->data.Double.v) ? 1 : 0;
                case RATIO:
                    return (p1->data.Double.v == p2->data.Ratio.numer/p2->data.Ratio.denom) ? 1 : 0;
                default:
                    printf("ERROR: = invalid data type\n");
                    printf("     :%s\n", to_string(p2));
                    return 0;;
            }
            break;
        case RATIO:
            switch (p2->type) {
                case INTEGER:
                    return (p1->data.Ratio.numer/p1->data.Ratio.denom == p2->data.Integer.v) ? 1 : 0;
                case DOUBLE:
                    return Object_initDouble(p1->data.Ratio.numer/p1->data.Ratio.denom == p2->data.Double.v)? 1 : 0;
                case RATIO:
                    return (p1->data.Ratio.numer/p1->data.Ratio.denom == p2->data.Ratio.numer/p2->data.Ratio.denom)? 1 : 0;
                default:
                    printf("ERROR: = invalid data type\n");
                    printf("     :%s\n", to_string(p2));
                    return 0;
            }
            break;
        default:
            printf("ERROR: = invalid data type\n");
            printf("     :%s\n", to_string(p1));
            return 0;
    }
}
// 12 =
Object *builtin_num_equal(Object ** params, int param_num, int start_index){
    int i;
    Object *p1, *p2;
    for (i = 0; i < param_num - 1; i++) {
        p1 = params[start_index + i];
        p2 = params[start_index + i + 1];
        if (!num_equal_2(p1, p2)) {
            return GLOBAL_NULL;
        }
    }
    return GLOBAL_TRUE;
}
// 13 <
int lt_2(Object * p1, Object * p2){
    switch (p1->type) {
        case INTEGER:
            switch (p2->type) {
                case INTEGER:
                    return (p1->data.Integer.v < p2->data.Integer.v) ? 1 : 0;
                case DOUBLE:
                    return (p1->data.Integer.v < p2->data.Double.v) ? 1 : 0;
                case RATIO:
                    return (p1->data.Integer.v < p2->data.Ratio.numer/p2->data.Ratio.denom) ? 1 : 0;
                default:
                    printf("ERROR: < invalid data type\n");
                    printf("     :%s\n", to_string(p2));
                    return 0;
            }
            break;
        case DOUBLE:
            switch (p2->type) {
                case INTEGER:
                    return (p1->data.Double.v < p2->data.Integer.v) ?1 : 0;
                case DOUBLE:
                    return (p1->data.Double.v < p2->data.Double.v) ? 1 : 0;
                case RATIO:
                    return (p1->data.Double.v < p2->data.Ratio.numer/p2->data.Ratio.denom) ? 1 : 0;
                    
                default:
                    printf("ERROR: < invalid data type\n");
                    printf("     :%s\n", to_string(p2));
                    return 0;;
            }
            break;
        case RATIO:
            switch (p2->type) {
                case INTEGER:
                    return (p1->data.Ratio.numer/p1->data.Ratio.denom < p2->data.Integer.v) ? 1 : 0;
                case DOUBLE:
                    return Object_initDouble(p1->data.Ratio.numer/p1->data.Ratio.denom < p2->data.Double.v)? 1 : 0;
                case RATIO:
                    return (p1->data.Ratio.numer/p1->data.Ratio.denom < p2->data.Ratio.numer/p2->data.Ratio.denom)? 1 : 0;
                default:
                    printf("ERROR: < invalid data type\n");
                    printf("     :%s\n", to_string(p2));
                    return 0;
            }
            break;
        default:
            printf("ERROR: < invalid data type\n");
            printf("     :%s\n", to_string(p1));
            return 0;
    }
}
Object *builtin_num_lt(Object ** params, int param_num, int start_index){
    int i;
    Object *p1, *p2;
    for (i = 0; i < param_num - 1; i++) {
        p1 = params[start_index + i];
        p2 = params[start_index + i + 1];
        if (!lt_2(p1, p2)) {
            return GLOBAL_NULL;
        }
    }
    return GLOBAL_TRUE;
}

int le_2(Object * p1, Object * p2){
    switch (p1->type) {
        case INTEGER:
            switch (p2->type) {
                case INTEGER:
                    return (p1->data.Integer.v <= p2->data.Integer.v) ? 1 : 0;
                case DOUBLE:
                    return (p1->data.Integer.v <= p2->data.Double.v) ? 1 : 0;
                case RATIO:
                    return (p1->data.Integer.v <= p2->data.Ratio.numer/p2->data.Ratio.denom) ? 1 : 0;
                default:
                    printf("ERROR: <= invalid data type\n");
                    printf("     :%s\n", to_string(p2));
                    return 0;
            }
            break;
        case DOUBLE:
            switch (p2->type) {
                case INTEGER:
                    return (p1->data.Double.v <= p2->data.Integer.v) ?1 : 0;
                case DOUBLE:
                    return (p1->data.Double.v <= p2->data.Double.v) ? 1 : 0;
                case RATIO:
                    return (p1->data.Double.v <= p2->data.Ratio.numer/p2->data.Ratio.denom) ? 1 : 0;
                    
                default:
                    printf("ERROR: <= invalid data type\n");
                    printf("     :%s\n", to_string(p2));
                    return 0;;
            }
            break;
        case RATIO:
            switch (p2->type) {
                case INTEGER:
                    return (p1->data.Ratio.numer/p1->data.Ratio.denom <= p2->data.Integer.v) ? 1 : 0;
                case DOUBLE:
                    return Object_initDouble(p1->data.Ratio.numer/p1->data.Ratio.denom <= p2->data.Double.v)? 1 : 0;
                case RATIO:
                    return (p1->data.Ratio.numer/p1->data.Ratio.denom <= p2->data.Ratio.numer/p2->data.Ratio.denom)? 1 : 0;
                default:
                    printf("ERROR: <= invalid data type\n");
                    printf("     :%s\n", to_string(p2));
                    return 0;
            }
            break;
        default:
            printf("ERROR: <= invalid data type\n");
            printf("     :%s\n", to_string(p1));
            return 0;
    }

}
// 14 <=
Object *builtin_num_le(Object ** params, int param_num, int start_index){
    int i;
    Object *p1, *p2;
    for (i = 0; i < param_num - 1; i++) {
        p1 = params[start_index + i];
        p2 = params[start_index + i + 1];
        if (!le_2(p1, p2)) {
            return GLOBAL_NULL;
        }
    }
    return GLOBAL_TRUE;
}
int eq_2(Object * p1, Object * p2){
    if(( p1->type == INTEGER || p1->type == DOUBLE || p1->type == RATIO) && (p2->type == INTEGER || p2->type == DOUBLE || p2->type == RATIO)){
        return num_equal_2(p1, p2);
    }
    return (p1 == p2) ? 1 : 0;
}
// 15 eq?
Object *builtin_eq(Object ** params, int param_num, int start_index){
    int i;
    for (i = 0; i < param_num - 1; i++) {
        Object * p1 = params[start_index + i];
        Object * p2 = params[start_index + i + 1];
        if (!eq_2(p1, p2)) {
            return GLOBAL_NULL;
        }
    }
    return GLOBAL_TRUE;
}
/*
    16 ~ 21 will be changed in the future.
    because I am now using "typeof" function to determine the data type
 */
/*
// 16 string?
Object *builtin_string_type(Object ** params, int param_num, int start_index){
    if(params[start_index]->type == STRING)
        return GLOBAL_TRUE;
    return GLOBAL_NULL;
}
 
 16 ===> load int_index 1
 */
/*
 17 exit
 eg: (exit 0)  print 0 then exit the program
 */
Object * builtin_exit(Object ** params, int param_num, int start_index){
    if (param_num == 0) {
        printf("0\n");
        exit(0);
    }
    printf("%s\n", to_string(params[start_index]));
    exit((int)params[start_index]->data.Integer.v);
}
/*
   18 >
 */
Object *builtin_gt(Object ** params, int param_num, int start_index){
    int i;
    for (i = param_num - 2; i >= 0; i--) {
        if (le_2(params[start_index + i], params[start_index + i + 1])) {
            return GLOBAL_NULL;
        }
    }
    return GLOBAL_TRUE;
}
/*
   19 >=
 */
Object *builtin_ge(Object ** params, int param_num, int start_index){
    int i;
    for (i = param_num - 2; i >= 0; i--) {
        if (lt_2(params[start_index + i], params[start_index + i + 1])) {
            return GLOBAL_NULL;
        }
    }
    return GLOBAL_TRUE;
}
// 20 parse
// (parse "(def x 12)") => ((def x 12))
Object *builtin_parse(Object ** params, int param_num, int start_index){
    Lexer * l = lexer(params[start_index]->data.String.v);
    return parser(l);
}
// 21 lambda?
Object *builtin_lambda_type(Object ** params, int param_num, int start_index){
    if(params[start_index]->type == USER_DEFINED_LAMBDA || params[start_index]->type == BUILTIN_LAMBDA)
        return GLOBAL_TRUE;
    return GLOBAL_NULL;
}
// 22 strcmp  compare string
Object *builtin_strcmp(Object ** params, int param_num, int start_index){
    int i = strcmp(params[start_index]->data.String.v, params[start_index+1]->data.String.v);
    return Object_initInteger(i);
}
// 23 string-slice
Object *builtin_string_slice(Object ** params, int param_num, int start_index){
    char * s = params[start_index]->data.String.v;
    long start = params[start_index+1]->data.Integer.v;
    long end = params[start_index+2]->data.Integer.v;
    long length = end - start;
    char * out = (char*)malloc(sizeof(char) * (length + 1));
    int i = 0;
    for(; i < length; i++){
        out[i] = s[i + start];
    }
    out[i] = 0;
    return Object_initString(out, length);
}
// 24 string-length
Object *builtin_string_length(Object ** params, int param_num, int start_index){
    return Object_initInteger(string_Length(params[start_index]));
}
// 25 string-append
Object *builtin_string_append(Object ** params, int param_num, int start_index){
    Object * s1 = params[start_index];
    Object * s2 = params[start_index+1];
    unsigned long sum_length = string_Length(s1) + string_Length(s2) + 1;
    char *out_ = (char*)malloc(sizeof(char)*(sum_length));
    strcpy(out_, s1->data.String.v);
    strcat(out_, s2->data.String.v);
    //out[sum_length] = 0;
    s1 = Object_initString(out_, sum_length);
    free(out_);
    return s1;
}
// 26 table
// (table 'a 12 'b 16)
Object *builtin_make_table(Object ** params, int param_num, int start_index){
    Object * table = Object_initTable( param_num == 0? 16 : (int)param_num/0.6);
    unsigned int i = 0;
    for(; i < param_num; i = i + 2){
        Table_setval(table, params[i + start_index], params[i + start_index + 1]);
    }
    return table;
}
// 27 table-keys
Object *builtin_table_keys(Object ** params, int param_num, int start_index){
    Object * table = params[start_index];
    return table_getKeys(table);
}
// 28 table-delete
Object *builtin_table_delete(Object ** params, int param_num, int start_index){
    Object * table = params[start_index];
    Object * key = params[start_index+1];
    unsigned long hash_value = hash(key->data.String.v, table->data.Table.size);
    Table_Pair * table_pairs = table->data.Table.vec[hash_value]; // get pairs
    while(table_pairs!=NULL){
        if( table_pairs->key == key || strcmp(key->data.String.v, table_pairs->key->data.String.v) == 0){
            table_pairs->value->use_count--;
            Object_free(table_pairs->value);
            table_pairs->value = GLOBAL_NULL;
            return GLOBAL_TRUE;
        }
        table_pairs = table_pairs->next;
    }
    // didnt find
    return GLOBAL_NULL;
}
// 29 file-read
// (file-read "test.toy")
// return string
Object * builtin_file_read(Object ** params, int param_num, int start_index){
    char * file_name = params[start_index]->data.String.v;
    FILE* file = fopen(file_name,"r");
    if(file == NULL)
    {
        return GLOBAL_NULL; // fail to read
    }
    
    fseek(file, 0, SEEK_END);
    long int size = ftell(file);
    rewind(file);
    
    char* content = calloc(size + 1, 1);
    
    fread(content,1,size,file);
    
    fclose(file); // 不知道要不要加上这个
    return Object_initString(content, size);
}
// 30 file-write
// (file-write "test.toy", "Hello World")
// return null
Object * builtin_file_write(Object ** params, int param_num, int start_index){
    char * file_name = params[start_index]->data.String.v;
    FILE* file = fopen(file_name,"w");
    fputs(params[start_index+1]->data.String.v, file);
    fclose(file);
    return GLOBAL_NULL;
}
// 31 sys-argv
// 32 int->string
// (int->string 12) => "12"
// (int->string 12 "%x") => "0x3"
Object * builtin_int_to_string(Object ** params, int param_num, int start_index){
    char *d; // format
    char b[100];
    char * o;
    switch(param_num){
        case 1:
            sprintf(b, "%ld", (long)params[start_index]->data.Integer.v);
            o = malloc(sizeof(char) * (strlen(b) + 1));
            strcpy(o, b);
            return Object_initString(o, strlen(o));
        case 2:
            d = params[start_index+1]->data.String.v;
            sprintf(b, d, params[start_index]->data.Integer.v);
            o = malloc(sizeof(char) * (strlen(b) + 1));
            strcpy(o, b);
            return Object_initString(o, strlen(o));
        default:
            printf("ERROR: int->string invalid args\n");
            return GLOBAL_NULL;
    }
}

// 33 floag->string
Object * builtin_float_to_string(Object ** params, int param_num, int start_index){
    char *d; // format
    char b[100];
    char * o;
    switch(param_num){
        case 1:
            sprintf(b, "%.20f", params[start_index]->data.Double.v);
            o = malloc(sizeof(char) * (strlen(b) + 1));
            strcpy(o, b);
            return Object_initString(o, strlen(o));
        case 2:
            d = params[start_index+1]->data.String.v;
            sprintf(b, d, params[start_index]->data.Double.v);
            o = malloc(sizeof(char) * (strlen(b) + 1));
            strcpy(o, b);
            return Object_initString(o, strlen(o));
        default:
            printf("ERROR: float->string invalid args\n");
            return GLOBAL_NULL;
    }
}
// 34 input
// (def x (input)) return string
Object * builtin_input(Object ** params, int param_num, int start_index){
    if(param_num == 1){
        printf("%s", params[start_index]->data.String.v);
    }
    char * buffer = (char*)malloc(sizeof(char) * 512);
    fgets(buffer, 512, stdin);
    return Object_initString(buffer, strlen(buffer) - 1  // 我测试了下貌似得减1要不然length错了
                             );
}
// 35 display  原先是 display-string
Object * builtin_display_string(Object ** params, int param_num, int start_index){
    char * s = to_string(params[start_index]);
    printf("%s", s);
    free(s);
    return GLOBAL_NULL;
}
// 36 string->int
Object * builtin_string_to_int(Object ** params, int param_num, int start_index){
    // 以后用atol
    return Object_initInteger(atoi(params[start_index]->data.String.v));
}
// 37 string->float
Object * builtin_string_to_float(Object ** params, int param_num, int start_index){
    return Object_initInteger(atof(params[start_index]->data.String.v));
}
// 38 ratio?
Object * builtin_ratio_type(Object ** params, int param_num, int start_index){
    return params[start_index]->type == RATIO ? GLOBAL_TRUE : GLOBAL_NULL;
}
// 39 numer
Object * builtin_numer(Object ** params, int param_num, int start_index){
    Object * p = params[start_index];
    switch (p->type) {
        case INTEGER: case DOUBLE:
            return p;
        case RATIO:
            return Object_initInteger(p->data.Ratio.numer);
        default:
            printf("ERROR: Function numer invalid parameter");
            return GLOBAL_NULL;
    }
}
// 40 denom
Object * builtin_denom(Object ** params, int param_num, int start_index){
    Object * p = params[start_index];
    switch (p->type) {
        case INTEGER: case DOUBLE:
            return Object_initInteger(1);
        case RATIO:
            return Object_initInteger(p->data.Ratio.denom);
        default:
            printf("ERROR: Function denom invalid parameter");
            return GLOBAL_NULL;
    }
}

// 41 gensym
Object * builtin_gensym(Object ** params, int param_num, int start_index){
    char buffer[48];
    sprintf(buffer, "__toy__%d", GEN_SYM_COUNT);
    GEN_SYM_COUNT+=6; // I like 6
    return Object_initString(buffer, strlen(buffer));
}

// 42 table-add-tag
Object * builtin_table_add_tag(Object ** params, int param_num, int start_index){
    params[start_index]->data.Table.tag = params[start_index+1];
    params[start_index + 1]->use_count += 1;
    return GLOBAL_NULL;
}

// 43 table-tag
Object * builtin_table_tag(Object ** params, int param_num, int start_index){
    return params[start_index]->data.Table.tag;
}

// 44 typeof
Object * builtin_typeof(Object ** params, int param_num, int start_index){
    switch (params[start_index]->type) {
        case INTEGER:
            return INTEGER_STRING;
        case DOUBLE:
            return FLOAT_STRING;
        case RATIO:
            return RATIO_STRING;
        case STRING:
            return STRING_STRING;
        case PAIR:
            return PAIR_STRING;
        case USER_DEFINED_LAMBDA:case BUILTIN_LAMBDA:
            return LAMBDA_STRING;
        case VECTOR:
            return VECTOR_STRING;
        case TABLE:
            return TABLE_STRING;
        default:
            return GLOBAL_NULL;
    }
}

#endif
