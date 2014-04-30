#ifndef builtin_procedures_h
#define builtin_procedures_h
#include "ratio.h"


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
Object *builtin_add(Object ** params, int param_num, int start_index){
    Object * p1 = params[start_index];
    Object * p2 = params[start_index+1];
    switch (p1->type) {
        case INTEGER:
            switch (p2->type) {
                case INTEGER:
                    return Object_initInteger(p1->data.Integer.v + p2->data.Integer.v);
                case DOUBLE:
                    return Object_initDouble(p1->data.Integer.v + p2->data.Integer.v);
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
// 4 -
Object *builtin_sub(Object ** params, int param_num, int start_index){
    Object * p1 = params[start_index];
    Object * p2 = params[start_index+1];
    switch (p1->type) {
        case INTEGER:
            switch (p2->type) {
                case INTEGER:
                    return Object_initInteger(p1->data.Integer.v - p2->data.Integer.v);
                case DOUBLE:
                    return Object_initDouble(p1->data.Integer.v - p2->data.Integer.v);
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
// 5 *
Object *builtin_mul(Object ** params, int param_num, int start_index){
    Object * p1 = params[start_index];
    Object * p2 = params[start_index+1];
    switch (p1->type) {
        case INTEGER:
            switch (p2->type) {
                case INTEGER:
                    return Object_initInteger(p1->data.Integer.v * p2->data.Integer.v);
                case DOUBLE:
                    return Object_initDouble(p1->data.Integer.v * p2->data.Integer.v);
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
// 6 /
Object *builtin_div(Object ** params, int param_num, int start_index){
    Object * p1 = params[start_index];
    Object * p2 = params[start_index+1];
    switch (p1->type) {
        case INTEGER:
            switch (p2->type) {
                case INTEGER:
                    return div_rat(p1->data.Integer.v, 1, p2->data.Integer.v, 1); // only this one use div_rat
                case DOUBLE:
                    return Object_initDouble(p1->data.Integer.v / p2->data.Integer.v);
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
    unsigned long i = 0;
    Object * vec = params[start_index];
    Object * temp;
    unsigned long length = vector_Length(vec);
    unsigned long size = vector_Size(vec);
    for(i = 0; i < param_num; i++){
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
        temp = params[start_index+1+i];
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
// 12 =
Object *builtin_num_equal(Object ** params, int param_num, int start_index){
    Object * p1 = params[start_index];
    Object * p2 = params[start_index+1];
    switch (p1->type) {
        case INTEGER:
            switch (p2->type) {
                case INTEGER:
                    return (p1->data.Integer.v == p2->data.Integer.v) ? GLOBAL_TRUE : GLOBAL_NULL;
                case DOUBLE:
                    return (p1->data.Integer.v == p2->data.Integer.v) ? GLOBAL_TRUE : GLOBAL_NULL;
                case RATIO:
                    return (p1->data.Integer.v == p2->data.Ratio.numer/p2->data.Ratio.denom) ? GLOBAL_TRUE : GLOBAL_NULL;
                default:
                    printf("ERROR: = invalid data type1");
                    return GLOBAL_NULL;
            }
            break;
        case DOUBLE:
            switch (p2->type) {
                case INTEGER: case DOUBLE:
                    return (p1->data.Double.v == p2->data.Integer.v) ?GLOBAL_TRUE : GLOBAL_NULL;

                case RATIO:
                    return (p1->data.Double.v == p2->data.Ratio.numer/p2->data.Ratio.denom) ? GLOBAL_TRUE : GLOBAL_NULL;

                default:
                    printf("ERROR: = invalid data type2");
                    return GLOBAL_NULL;;
            }
            break;
        case RATIO:
            switch (p2->type) {
                case INTEGER:
                    return (p1->data.Ratio.numer/p1->data.Ratio.denom == p2->data.Integer.v) ? GLOBAL_TRUE : GLOBAL_NULL;
                case DOUBLE:
                    return Object_initDouble(p1->data.Ratio.numer/p1->data.Ratio.denom == p2->data.Double.v)? GLOBAL_TRUE : GLOBAL_NULL;
                case RATIO:
                    return (p1->data.Ratio.numer/p1->data.Ratio.denom == p2->data.Ratio.numer/p2->data.Ratio.denom)? GLOBAL_TRUE : GLOBAL_NULL;
                default:
                    printf("ERROR: = invalid data type3");
                    return GLOBAL_NULL;
            }
            break;
        default:
            printf("ERROR: = invalid data type4");
            return GLOBAL_NULL;
    }
}
// 13 <
Object *builtin_num_lt(Object ** params, int param_num, int start_index){
    Object * p1 = params[start_index];
    Object * p2 = params[start_index+1];
    switch (p1->type) {
        case INTEGER:
            switch (p2->type) {
                case INTEGER:
                    return (p1->data.Integer.v < p2->data.Integer.v) ? GLOBAL_TRUE : GLOBAL_NULL;
                case DOUBLE:
                    return (p1->data.Integer.v < p2->data.Integer.v) ? GLOBAL_TRUE : GLOBAL_NULL;
                case RATIO:
                    return (p1->data.Integer.v < p2->data.Ratio.numer/p2->data.Ratio.denom) ? GLOBAL_TRUE : GLOBAL_NULL;
                default:
                    printf("ERROR: = invalid data type");
                    return GLOBAL_NULL;
            }
            break;
        case DOUBLE:
            switch (p2->type) {
                case INTEGER: case DOUBLE:
                    return (p1->data.Double.v < p2->data.Integer.v) ?GLOBAL_TRUE : GLOBAL_NULL;
                    
                case RATIO:
                    return (p1->data.Double.v < p2->data.Ratio.numer/p2->data.Ratio.denom) ? GLOBAL_TRUE : GLOBAL_NULL;
                    
                default:
                    printf("ERROR: = invalid data type");
                    return GLOBAL_NULL;;
            }
            break;
        case RATIO:
            switch (p2->type) {
                case INTEGER:
                    return (p1->data.Ratio.numer/p1->data.Ratio.denom < p2->data.Integer.v) ? GLOBAL_TRUE : GLOBAL_NULL;
                case DOUBLE:
                    return Object_initDouble(p1->data.Ratio.numer/p1->data.Ratio.denom < p2->data.Double.v)? GLOBAL_TRUE : GLOBAL_NULL;
                case RATIO:
                    return (p1->data.Ratio.numer/p1->data.Ratio.denom < p2->data.Ratio.numer/p2->data.Ratio.denom)? GLOBAL_TRUE : GLOBAL_NULL;
                default:
                    printf("ERROR: = invalid data type");
                    return GLOBAL_NULL;
            }
            break;
        default:
            printf("ERROR: = invalid data type");
            return GLOBAL_NULL;
    }
}
// 14 <=
Object *builtin_num_le(Object ** params, int param_num, int start_index){
    Object * p1 = params[start_index];
    Object * p2 = params[start_index+1];
    switch (p1->type) {
        case INTEGER:
            switch (p2->type) {
                case INTEGER:
                    return (p1->data.Integer.v <= p2->data.Integer.v) ? GLOBAL_TRUE : GLOBAL_NULL;
                case DOUBLE:
                    return (p1->data.Integer.v <= p2->data.Integer.v) ? GLOBAL_TRUE : GLOBAL_NULL;
                case RATIO:
                    return (p1->data.Integer.v <= p2->data.Ratio.numer/p2->data.Ratio.denom) ? GLOBAL_TRUE : GLOBAL_NULL;
                default:
                    printf("ERROR: = invalid data type");
                    return GLOBAL_NULL;
            }
            break;
        case DOUBLE:
            switch (p2->type) {
                case INTEGER: case DOUBLE:
                    return (p1->data.Double.v <= p2->data.Integer.v) ?GLOBAL_TRUE : GLOBAL_NULL;
                    
                case RATIO:
                    return (p1->data.Double.v <= p2->data.Ratio.numer/p2->data.Ratio.denom) ? GLOBAL_TRUE : GLOBAL_NULL;
                    
                default:
                    printf("ERROR: = invalid data type");
                    return GLOBAL_NULL;;
            }
            break;
        case RATIO:
            switch (p2->type) {
                case INTEGER:
                    return (p1->data.Ratio.numer/p1->data.Ratio.denom <= p2->data.Integer.v) ? GLOBAL_TRUE : GLOBAL_NULL;
                case DOUBLE:
                    return Object_initDouble(p1->data.Ratio.numer/p1->data.Ratio.denom <= p2->data.Double.v)? GLOBAL_TRUE : GLOBAL_NULL;
                case RATIO:
                    return (p1->data.Ratio.numer/p1->data.Ratio.denom <= p2->data.Ratio.numer/p2->data.Ratio.denom)? GLOBAL_TRUE : GLOBAL_NULL;
                default:
                    printf("ERROR: = invalid data type");
                    return GLOBAL_NULL;
            }
            break;
        default:
            printf("ERROR: = invalid data type");
            return GLOBAL_NULL;
    }
}
// 15 eq?
Object *builtin_eq(Object ** params, int param_num, int start_index){
    Object * param0 = params[start_index];
    Object * param1 = params[start_index+1];    if(( param0->type == INTEGER || param0->type == DOUBLE) && (param1->type == INTEGER || param1->type == DOUBLE)){
        return builtin_num_equal(params, param_num, start_index);
    }
    return (param0 == param1) ? GLOBAL_TRUE : GLOBAL_NULL;
}
// 16 string?
Object *builtin_string_type(Object ** params, int param_num, int start_index){
    if(params[start_index]->type == STRING)
        return GLOBAL_TRUE;
    return GLOBAL_NULL;
}
// 17 int?
Object *builtin_int_type(Object ** params, int param_num, int start_index){
    if(params[start_index]->type == INTEGER)
        return GLOBAL_TRUE;
    return GLOBAL_NULL;
}
// 18 float?
Object *builtin_float_type(Object ** params, int param_num, int start_index){
    if(params[start_index]->type == DOUBLE)
        return GLOBAL_TRUE;
    return GLOBAL_NULL;
}
// 19 pair?
Object *builtin_pair_type(Object ** params, int param_num, int start_index){
    if(params[start_index]->type == PAIR)
        return GLOBAL_TRUE;
    return GLOBAL_NULL;
}
// 20 null?
Object *builtin_null_type(Object ** params, int param_num, int start_index){
    if(params[start_index]->type == NULL_)
        return GLOBAL_TRUE;
    return GLOBAL_NULL;
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
    unsigned long sum_length = string_Length(s1) + string_Length(s2);
    char *out = (char*)malloc(sizeof(char)*(sum_length));
    strcat(out, s1->data.String.v);
    strcat(out, s2->data.String.v);
    out[sum_length] = 0;
    return Object_initString(out, sum_length);
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
// 35 display-string
Object * builtin_display_string(Object ** params, int param_num, int start_index){
    printf("%s", params[start_index]->data.String.v);
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
    return Object_initInteger(params[start_index]->data.Ratio.numer);
}
// 40 denom
Object * builtin_denom(Object ** params, int param_num, int start_index){
    return Object_initInteger(params[start_index]->data.Ratio.denom);
}


#endif
