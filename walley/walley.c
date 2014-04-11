#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* opcodes */
#define SET 0x0
#define GET 0x1
#define CONST 0x2

#define CONST  0x2
#define CONST_INTEGER  0x2100
#define CONST_FLOAT 0x2200
#define CONST_STRING 0x2300
#define CONST_NULL 0x2400
#define CONST_LOAD 0x2500

#define MAKELAMBDA 0x3
#define RETURN 0x4
#define NEWFRAME 0x5
#define PUSH_ARG 0x6
#define CALL 0x7
#define JMP 0x8
#define TEST 0x9
#define PUSH 0xA


#define GLOBAL_FRAME_SIZE 1024
#define ENV_SIZE 32
#define MAX_STACK_SIZE 1024


typedef struct Object Object;
typedef struct Table_Pair Table_Pair;
static Object * GLOBAL_NULL;
static Object * GLOBAL_TRUE;
static Object * GLOBAL_FRAME[GLOBAL_FRAME_SIZE];
static Object* CONSTANT_TABLE[1024];    
static int CONSTANT_TABLE_LENGTH = 1;
/* data types */
typedef enum {
	INTEGER,
	DOUBLE,
	STRING,
	PAIR,
	// RATIO,
	USER_DEFINED_LAMBDA,
	BUILTIN_LAMBDA,
	VECTOR,
  NULL_,
	TABLE
} DataType;
struct  Table_Pair{ // used for table
  Object * key;          // key
  Object * value;        // value
  Table_Pair * next;     // next
};
/*
	several data types
*/
struct Object {
  DataType type;
  int use_count;
  union {
    struct {
      // long v;
      int v;
    } Integer;
    struct {
      double v;
    } Double;
    /*
      struct
      {
      long denom;
      long numer;
      } Ratio;
    */
    struct {
      unsigned int size;
      unsigned int length;
      Table_Pair **vec; // array to save Table_Pairs
    } Table;
    struct {
      char * v;
      int length;
      char in_table; // in contant table
    } String;
    struct {
      Object * car;
      Object * cdr;
    } Pair;
    struct {
      char param_num; 
      char variadic_place; 
      int start_pc;
      Object * env;
    } User_Defined_Lambda;
    struct {
      Object ** v;   // array of pointers
      int size;      // size of allocated vector
      int length;    // length
      char resizable;  // is this vector resizable
    } Vector;
    struct {          // builtin lambda
      Object* (*func_ptr)(Object*, int, int); // function pointer
    } Builtin_Lambda;
  } data;
};

#define OBJECT_SIZE sizeof(Object)

#define vector_Get(v_, index)  ((v_)->data.Vector.v[(index)])
#define vector_Length(v) ((v)->data.Vector.length)
#define vector_Size(v) ((v)->data.Vector.size)
#define vector_Set(v_, index, o_) ((v_)->data.Vector.v[(index)] = o_)
#define vector_set_builtin_lambda(v_, index, o_) ((v_)->data.Vector.v[(index)] = Object_initBuiltinLambda(o_))
#define string_Length(v_) ((v_)->data.String.length)
#define vector_Push(v_, val_)  \
  vector_Set((v_), vector_Length((v_)),  (val_)); \
  (v_)->data.Vector.length++ ; \

#define car(v) ((v)->data.Pair.car);
#define cdr(v) ((v)->data.Pair.cdr);

/*
  allocate object
*/
Object * allocateObject(){
  Object * o = (Object*)malloc(OBJECT_SIZE);
  if(o == NULL){
    printf("ERROR:Out of memory\n");
    exit(1);
  }
  o->use_count = 0;
  return o;
}
/*
  initialize integer
*/
Object * Object_initInteger(/*long v*/ int v){
  Object * o = allocateObject();
  o->type = INTEGER;
  o->data.Integer.v = v;
  return o;
}
/*
  initialize double
*/
Object * Object_initDouble(double v){
  Object * o = allocateObject();
  o->type = DOUBLE;
  o->data.Double.v = v;
  return o;
}
/*
  initialize string
*/
Object * Object_initString(char * v, int string_length){
  Object * o = allocateObject();
  o->type = STRING;
  /*o->data.String.v = malloc(sizeof(char)*(strlen(v) + 1));
  if(o->data.String.v == NULL)
    {
      printf("ERROR:Out of memory\n");
      exit(1);
    }
  strcpy(o->data.String.v, v);
  */
  o->data.String.v = v;
  o->data.String.length = string_length;
  return o;
}
/*
  initialize vector
  default size 32
*/

Object * Object_initVector(char resizable, int size){
  Object * o = allocateObject();
  o->type = VECTOR;
  o->data.Vector.size = size;
  o->data.Vector.length = 0;
  o->data.Vector.resizable = resizable;
  o->data.Vector.v = (Object**)malloc(sizeof(Object*) * (size)); // array of pointers

  if(o->data.Vector.v == NULL){
    printf("ERROR:Out of memory\n");
    exit(1);
  }
  return o;
}
/*
  initialize nil
*/
Object * Object_initNull(){
  Object * o = allocateObject();
  o->type = NULL_;
  return o;
}


/*
  initialize user defined lambda
*/ 
Object * Object_initUserDefinedLambda(char param_num, char variadic_place, int start_pc, Object * env){
  Object * o = allocateObject();
  o->type = USER_DEFINED_LAMBDA;
  o->data.User_Defined_Lambda.param_num = param_num;
  o->data.User_Defined_Lambda.variadic_place = variadic_place;
  o->data.User_Defined_Lambda.start_pc = start_pc;
  o->data.User_Defined_Lambda.env = env;
  return o;
}
Object * Object_initBuiltinLambda(Object* (*func_ptr)(Object *, int, int)){
  Object * o = allocateObject();
  o->type = BUILTIN_LAMBDA;
  o->data.Builtin_Lambda.func_ptr = func_ptr;
  return o;
}

/*
  cons
*/
Object * cons(Object * car, Object * cdr){
  Object * o = allocateObject();
  o->type = PAIR; 
  o->data.Pair.car = car;
  o->data.Pair.cdr = cdr;
  return o;
}
/*
 * HashTable functions
 * quick hash function 
 * djb2
 */
Object * Object_initTable(unsigned int size){
  Object * o = allocateObject();
  o->type = TABLE;
  o->data.Table.length = 0;
  o->data.Table.size = size;
  o->data.Table.vec = calloc(size, sizeof(Table_Pair*));
  return o;
}
unsigned int hash(char * str, unsigned int size){
    unsigned long hash = 0;
    while (*(str)){
        hash = ((hash << 5) + hash) + *(str); // hash * 33 + c 
      str++;
    }
    if(hash >= size)
      return hash % size;
    return hash;
} 

/*
  rehash function
*/
void rehash(Object * t){
  // make space to save keys
  unsigned long i = 0;
  unsigned long j = 0;
  unsigned int original_size = t->data.Table.size;
  Object * key;
  Object * value;
  unsigned long hash_value;
  Table_Pair * p;
  Table_Pair * temp;
  Object * keys[original_size];
  Object * values[original_size];
  Table_Pair * new_Table_Pair;

  for(i = 0; i < original_size; i++){
    p = t->data.Table.vec[i]; // get Table_Pair;
    if(p){
      while(p != NULL){
        keys[j] = p->key;     // save keys
        values[j] = p->value; // save values;
        temp = p;
        p = p->next;
        free(temp); // free that Table_Pair
        j++;
      }
    }
  }
  // free vec
  free(t->data.Table.vec);
  t->data.Table.size = t->data.Table.size * 2; // double size
  //t->vec = malloc(sizeof(Table_Pair*) * t->size); // realloc
  t->data.Table.vec = calloc(t->data.Table.size, sizeof(Table_Pair*)); // realloc

  // rehash
  for(i = 0; i < j; i++){
    key = keys[i];
    value = values[i];    
    // create new Table_Pair
    new_Table_Pair = malloc(sizeof(Table_Pair));
    new_Table_Pair->key = key;
    new_Table_Pair->value = value;

    hash_value = hash(key->data.String.v, t->data.Table.size); // rehash
    if(t->data.Table.vec[hash_value] != NULL){ // already exist
      new_Table_Pair->next = t->data.Table.vec[hash_value];
      t->data.Table.vec[hash_value] = new_Table_Pair;
    }
    else{ // doesn't exist
      new_Table_Pair->next = NULL;
      t->data.Table.vec[hash_value] = new_Table_Pair;
    }
  }
}

/*
  getval
*/
Object * getval(Object * t, Object * key){
  unsigned long hash_value = hash(key->data.String.v, t->data.Table.size); // get hash value
  Table_Pair * table_pairs = t->data.Table.vec[hash_value]; // get pairs
  while(table_pairs!=NULL){
    if( table_pairs->key == key || strcmp(key->data.String.v, table_pairs->key->data.String.v) == 0){
      return table_pairs->value;
    }
    table_pairs = table_pairs->next;
  }
  // didnt find
  return GLOBAL_NULL;
}
/*
  setval
*/
void setval(Object *t, Object * key, Object * value){
  if(t->data.Table.length / (double)t->data.Table.size >= 0.7) // rehash
    rehash(t);
  unsigned long hash_value = hash(key->data.String.v, t->data.Table.size);
  Table_Pair * table_pairs = t->data.Table.vec[hash_value];
  Table_Pair * new_Table_Pair;
  new_Table_Pair = malloc(sizeof(Table_Pair));
  new_Table_Pair->key = key;
  new_Table_Pair->value = value;

  // increase use count for value and key
  key->use_count++;
  value->use_count++;

  if(table_pairs){ // already existed
    new_Table_Pair->next = t->data.Table.vec[hash_value];
    t->data.Table.vec[hash_value] = new_Table_Pair;
  } 
  else{ // doesn't exist
    new_Table_Pair->next = NULL;
    t->data.Table.vec[hash_value] = new_Table_Pair;
  }
  t->data.Table.length++; // increase length
}
/*
  return keys as list
*/
Object * table_getKeys(Object * t){
  Object * keys = GLOBAL_NULL;
  unsigned int i = 0;
  Table_Pair * p;
  for(i = 0; i < t->data.Table.size; i++){
    p = t->data.Table.vec[i]; // get table pair
    if(p){
      while(p != NULL){
        keys = cons(p->key, keys);
        p->key->use_count++; // increase use count
        p=p->next;
      }
    }
  }
  return keys;
}

/*
  add value to environment
 */
void addValueToEnvironment(Object * env, Object * value, int m, int n){
  Object * frame = env->data.Vector.v[m];
  frame->data.Vector.v[n] = value;
}

/*
  free
*/
void Object_free(Object * o){
  unsigned int i, length, size;
  Table_Pair * temp;
  Table_Pair * p;
  if(o->use_count == 0){
    // free
    switch (o->type){
      case INTEGER:
        free(o);
        return;
      case DOUBLE:
        free(o);
        return;
      case STRING:
        if(!o->data.String.in_table){ // can only free string that is not in table
          free(o->data.String.v);
          free(o);
        }
        return;
      case PAIR:
        Object_free(o->data.Pair.car);
        Object_free(o->data.Pair.cdr);
        free(o);
        return;
      case USER_DEFINED_LAMBDA:
        Object_free(o->data.User_Defined_Lambda.env);
        free(o);
      case BUILTIN_LAMBDA:
        return; // cannt free builtin lambda
      case VECTOR:
        length = o->data.Vector.length;
        Object ** v = o->data.Vector.v;
        for(i = 0; i < length; i++){
          v[i]->use_count--; // decrease use count
          Object_free(v[i]);
        }
        free(o);
      case TABLE:
        size = o->data.Table.size;
        length = o->data.Table.length;
        for(i = 0; i < size; i++){
          if(o->data.Table.vec[i]){ // exist
            p = o->data.Table.vec[i]; // get Table_Pair;
            while(p != NULL){
              p->key->use_count--;     // decrease use_count
              Object_free(p->key);     // free key
              p->value->use_count--;   // decrease use_count
              Object_free(p->value);   // free value
              temp = p;
              p = p->next;
              free(temp); // free that Table_Pair
            }
          }
        }
        free(o->data.Table.vec); // free table vector
        free(o);
        return;
      case NULL_:
        return; // cannot free null;
                // null will be stored in string_table(constant_table) index0;
      default:
        printf("ERROR: Object_free invalid data type\n");
        return;
    }
  }
  //else{
  //  o->use_count--; // decrease use_count
  //}
}

/*
  builtin lambdas
*/
// 0 cons
Object *builtin_cons(Object * params, int param_num, int start_index){
  Object * o = allocateObject();
  Object * car = vector_Get(params, start_index);
  Object * cdr = vector_Get(params, start_index+1);
  o->type = PAIR; 
  o->data.Pair.car = car;
  o->data.Pair.cdr = cdr;
  car->use_count++;
  cdr->use_count++;
  return o;
}
// 1 car
Object *builtin_car(Object * params, int param_num, int start_index){
  return car(vector_Get(params, start_index));
} 
// 2 cdr 
Object *builtin_cdr(Object * params, int param_num, int start_index){
  return cdr(vector_Get(params, start_index));
}
// 3 +
Object *builtin_add(Object * params, int param_num, int start_index){
  if(vector_Get(params, start_index)->type == INTEGER && vector_Get(params, start_index+1)->type == INTEGER)
    return Object_initInteger(vector_Get(params, start_index)->data.Integer.v + 
                              vector_Get(params, start_index+1)->data.Integer.v);
  else
    return Object_initDouble(vector_Get(params, start_index)->data.Double.v + 
                              vector_Get(params, start_index+1)->data.Double.v);
}
// 4 - 
Object *builtin_sub(Object * params, int param_num, int start_index){
  if(vector_Get(params, start_index)->type == INTEGER && vector_Get(params, start_index+1)->type == INTEGER)
    return Object_initInteger(vector_Get(params, start_index)->data.Integer.v - 
                              vector_Get(params, start_index+1)->data.Integer.v);
  else
    return Object_initDouble(vector_Get(params, start_index)->data.Double.v -
                              vector_Get(params, start_index+1)->data.Double.v);
}
// 5 *
Object *builtin_mul(Object * params, int param_num, int start_index){
  if(vector_Get(params, start_index)->type == INTEGER && vector_Get(params, start_index+1)->type == INTEGER)
    return Object_initInteger(vector_Get(params, start_index)->data.Integer.v * 
                              vector_Get(params, start_index+1)->data.Integer.v);
  else
    return Object_initDouble(vector_Get(params, start_index)->data.Double.v * 
                              vector_Get(params, start_index+1)->data.Double.v);
}
// 6 /
Object *builtin_div(Object * params, int param_num, int start_index){
  if(vector_Get(params, start_index)->type == INTEGER && vector_Get(params, start_index+1)->type == INTEGER)
    return Object_initInteger(vector_Get(params, start_index)->data.Integer.v / 
                              vector_Get(params, start_index+1)->data.Integer.v);
  else
    return Object_initDouble(vector_Get(params, start_index)->data.Double.v / 
                              vector_Get(params, start_index+1)->data.Double.v);
}
// 7 vector!
Object *builtin_vector(Object * params, int param_num, int start_index){
  int size = (param_num / 16 + 1) * 16; // determine the size
  int i = 0;
  Object * v = Object_initVector(1, size);
  Object *temp;
  for(; i < param_num; i++){
    temp = vector_Get(params, i + start_index);
    vector_Get(v, i) = temp;
    // increase temp use_count
    temp->use_count++;
  }
  v->data.Vector.length = param_num;
  return v;
}
// 8 vector
Object *builtin_vector_with_unchangable_length(Object * params, int param_num, int start_index){
  int i = 0;
  Object * v = Object_initVector(0, param_num);
  Object * temp;
  for(; i < param_num; i++){
    temp = vector_Get(params, i + start_index);
    vector_Get(v, i) = temp;
    temp->use_count++;  
  }
  v->data.Vector.length = param_num;
  return v;
}
// 9 vector-length
Object *builtin_vector_length(Object * params, int param_num, int start_index){
  return Object_initInteger(vector_Length(vector_Get(params, start_index)));
}
// 10 vector-push!
Object *builtin_vector_push(Object * params, int param_num, int start_index){
  int i = 0;
  Object * vec = vector_Get(params, start_index);
  Object * temp;
  int length = vector_Length(vec);
  int size = vector_Size(vec);
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
    temp = vector_Get(params, start_index + 1 + i);
    vector_Set(vec, length, temp);
    temp->use_count++; // increase use count
    length++;
  }
  vec->data.Vector.length = length;
  return vector_Get(params, start_index);
}
// 11 vector-pop!
Object *builtin_vector_pop(Object * params, int param_num, int start_index){
    Object * vec = vector_Get(params, start_index);
    int length = vector_Length(vec);
    Object *return_out = vector_Get(vec, length - 1); // get pop value
    vector_Get(vec, length - 1) = GLOBAL_NULL; // clear that variable
    length = length - 1;
    vec->data.Vector.length = length; // reset length
    return return_out;
}
// 12 =
Object *builtin_num_equal(Object * params, int param_num, int start_index){
  Object * param0 = vector_Get(params, start_index);
  Object * param1 = vector_Get(params, start_index+1);
  if((param0->type == INTEGER ? param0->data.Integer.v : param0->data.Double.v) 
     == 
     (param1->type == INTEGER ? param1->data.Integer.v : param1->data.Double.v)){
    return GLOBAL_TRUE;
  }
  return GLOBAL_NULL;
}
// 13 <
Object *builtin_num_lt(Object * params, int param_num, int start_index){
  Object * param0 = vector_Get(params, start_index);
  Object * param1 = vector_Get(params, start_index+1);
  if((param0->type == INTEGER ? param0->data.Integer.v : param0->data.Double.v)
     < 
     (param1->type == INTEGER ? param1->data.Integer.v : param1->data.Double.v)){
    return GLOBAL_TRUE;
  }
  return GLOBAL_NULL;
}
// 14 <=
Object *builtin_num_le(Object * params, int param_num, int start_index){
  Object * param0 = vector_Get(params, start_index);
  Object * param1 = vector_Get(params, start_index+1);
  if((param0->type == INTEGER ? param0->data.Integer.v : param0->data.Double.v) 
     <= 
     (param1->type == INTEGER ? param1->data.Integer.v : param1->data.Double.v)){
    return GLOBAL_TRUE;
  }
  return GLOBAL_NULL;
}
// 15 eq?
Object *builtin_eq(Object * params, int param_num, int start_index){
  Object * param0 = vector_Get(params, start_index);
  Object * param1 = vector_Get(params, start_index+1);
  if((param0->type == INTEGER | param0->type == DOUBLE) && (param1->type == INTEGER | param1->type == DOUBLE)){
    return builtin_num_equal(params, param_num, start_index);
  }
  return (param0 == param1) ? GLOBAL_TRUE : GLOBAL_NULL;
}
// 16 string?
Object *builtin_string_type(Object * params, int param_num, int start_index){
  if(vector_Get(params, start_index)->type == STRING)
    return GLOBAL_TRUE;
  return GLOBAL_NULL;
}
// 17 int?
Object *builtin_int_type(Object * params, int param_num, int start_index){
  if(vector_Get(params, start_index)->type == INTEGER)
    return GLOBAL_TRUE;
  return GLOBAL_NULL;
}
// 18 float?
Object *builtin_float_type(Object * params, int param_num, int start_index){
  if(vector_Get(params, start_index)->type == DOUBLE)
    return GLOBAL_TRUE;
  return GLOBAL_NULL;
}
// 19 pair?
Object *builtin_pair_type(Object * params, int param_num, int start_index){
  if(vector_Get(params, start_index)->type == PAIR)
    return GLOBAL_TRUE;
  return GLOBAL_NULL;
}
// 20 null?
Object *builtin_null_type(Object * params, int param_num, int start_index){
  if(vector_Get(params, start_index)->type == NULL_)
    return GLOBAL_TRUE;
  return GLOBAL_NULL;
}
// 21 lambda?
Object *builtin_lambda_type(Object * params, int param_num, int start_index){
  if(vector_Get(params, start_index)->type == USER_DEFINED_LAMBDA || vector_Get(params, start_index)->type == BUILTIN_LAMBDA)
    return GLOBAL_TRUE;
  return GLOBAL_NULL;
}
// 22 strcmp  compare string
Object *builtin_strcmp(Object * params, int param_num, int start_index){
  int i = strcmp(vector_Get(params, start_index)->data.String.v, vector_Get(params, start_index+1)->data.String.v);
  return Object_initInteger(i);
}
// 23 string-slice
Object *builtin_string_slice(Object * params, int param_num, int start_index){
  char * s = vector_Get(params, start_index)->data.String.v;
  int start = vector_Get(params, start_index+1)->data.Integer.v;
  int end = vector_Get(params, start_index+2)->data.Integer.v;
  int length = end - start;
  char * out = (char*)malloc(sizeof(char) * (length + 1));
  int i = 0;
  for(; i < length; i++){
    out[i] = s[i + start];
  }
  out[i] = 0;
  return Object_initString(out, length);
}
// 24 string-length
Object *builtin_string_length(Object * params, int param_num, int start_index){
  return Object_initInteger(string_Length(vector_Get(params, start_index)));
}
// 25 string-append
Object *builtin_string_append(Object * params, int param_num, int start_index){
  Object * s1 = vector_Get(params, start_index);
  Object * s2 = vector_Get(params, start_index+1);
  int sum_length = string_Length(s1) + string_Length(s2);
  char *out = (char*)malloc(sizeof(char)*(sum_length));
  strcat(out, s1->data.String.v);
  strcat(out, s2->data.String.v);
  out[sum_length] = 0;
  return Object_initString(out, sum_length);
}
// 26 table
// (table 'a 12 'b 16)
Object *builtin_make_table(Object * params, int param_num, int start_index){
  Object * table = Object_initTable((int)param_num/0.6);
  unsigned int i = 0;
  for(; i < param_num; i = i + 2){
    setval(table, params->data.Vector.v[i + start_index], params->data.Vector.v[i + start_index + 1]);
  }
  return table;
}
// 27 table-keys
Object *builtin_table_keys(Object * params, int param_num, int start_index){
  Object * table = vector_Get(params, start_index);
  return table_getKeys(table);
}
// 28 table-delete
Object *builtin_table_delete(Object * params, int param_num, int start_index){
  Object * table = vector_Get(params, start_index);
  Object * key = vector_Get(params, start_index + 1);
  unsigned int hash_value = hash(key->data.String.v, table->data.Table.size);
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
/*
  create frame0
*/
Object *createFrame0(){
  // Object * frame = Object_initVector(0, GLOBAL_FRAME_SIZE);
  Object * frame = allocateObject();
  frame->type = VECTOR;
  frame->data.Vector.size = GLOBAL_FRAME_SIZE;
  frame->data.Vector.length = 0;
  frame->data.Vector.resizable = 0;
  frame->data.Vector.v = GLOBAL_FRAME; //(Object**)malloc(sizeof(Object*) * (size)); // array of pointers

  // add builtin lambda
  vector_set_builtin_lambda(frame, 0, &builtin_cons);
  vector_set_builtin_lambda(frame, 1, &builtin_car);
  vector_set_builtin_lambda(frame, 2, &builtin_cdr);
  vector_set_builtin_lambda(frame, 3, &builtin_add);
  vector_set_builtin_lambda(frame, 4, &builtin_sub);
  vector_set_builtin_lambda(frame, 5, &builtin_mul);
  vector_set_builtin_lambda(frame, 6, &builtin_div);
  vector_set_builtin_lambda(frame, 7, &builtin_vector);
  vector_set_builtin_lambda(frame, 8, &builtin_vector_with_unchangable_length);
  vector_set_builtin_lambda(frame, 9, &builtin_vector_length);
  vector_set_builtin_lambda(frame, 10, &builtin_vector_push);
  vector_set_builtin_lambda(frame, 11, &builtin_vector_pop);
  vector_set_builtin_lambda(frame, 12, &builtin_num_equal);
  vector_set_builtin_lambda(frame, 13, &builtin_num_lt);
  vector_set_builtin_lambda(frame, 14, &builtin_num_le);
  vector_set_builtin_lambda(frame, 15, &builtin_eq);
  vector_set_builtin_lambda(frame, 16, &builtin_string_type);
  vector_set_builtin_lambda(frame, 17, &builtin_int_type);
  vector_set_builtin_lambda(frame, 18, &builtin_float_type);
  vector_set_builtin_lambda(frame, 19, &builtin_pair_type);
  vector_set_builtin_lambda(frame, 20, &builtin_null_type);
  vector_set_builtin_lambda(frame, 21, &builtin_lambda_type);
  vector_set_builtin_lambda(frame, 22, &builtin_strcmp);
  vector_set_builtin_lambda(frame, 23, &builtin_string_slice);
  vector_set_builtin_lambda(frame, 24, &builtin_string_length);
  vector_set_builtin_lambda(frame, 25, &builtin_string_append);

  frame->data.Vector.length = 26; // set length
  return frame;
}
/*
  create environment
*/
Object *createEnvironment(){
  Object * env = Object_initVector(1, ENV_SIZE); // create env
  env->data.Vector.v[0] = createFrame0();  // add frame0
  env->data.Vector.length = 1;
  // init NULL
  GLOBAL_NULL = Object_initNull();
  GLOBAL_TRUE = Object_initString("true", 4);
  GLOBAL_TRUE->data.String.in_table = 1;
  CONSTANT_TABLE[0] = GLOBAL_TRUE; // true is reserved
  return env;
}

/*
  copy environment
*/
Object *copyEnvironment(Object * env){
  int i = 0;
  int size = env->data.Vector.size;
  int length = env->data.Vector.length;
  Object * new_env = Object_initVector(1, size);
  for(i = 0; i < length; i++){
    new_env->data.Vector.v[i] = env->data.Vector.v[i];
  }
  new_env->data.Vector.length = length;
  return new_env;
}
/*
  Walley Language Virtual Machine
 */
Object *VM(int * instructions,
	   int instructions_num,
	   int pc,
	   Object * env){
  unsigned int i;
  int frame_index, value_index, inst, opcode;
  char param_num, variadic_place;
  int start_pc, jump_steps;
  int required_param_num, required_variadic_place;
  
  int string_length;
  char * created_string;
  int s;
  char s1, s2;

  Object * accumulator = GLOBAL_NULL;
  Object * current_frame_pointer = GLOBAL_NULL;
  Object * frames_list = GLOBAL_NULL; // save frames
  Object * functions_list = GLOBAL_NULL; // use to save lambdas
  Object * new_env;
  Object * (*func_ptr)(Object*, int, int); // function pointer
  Object * v;
  Object * temp; // temp use
  Object * top_frame_pointer = vector_Get(env, 0); // top frame
    
  while(pc != instructions_num){
    inst = instructions[pc];
    opcode = (inst & 0xF000) >> 12;
    //printf("%x\n", inst);
    switch(opcode){
      case SET:
        frame_index = 0x0FFF & inst;
        value_index = instructions[pc + 1];
        v = vector_Get(vector_Get(env, frame_index), value_index);
        //if(value_index < vector_Length(vector_Get(env, frame_index))){ // free variable
        v->use_count--; // decrease use_count
        Object_free(v);
        //}
        vector_Get(vector_Get(env, frame_index), value_index) = accumulator;
        // increase accumulator use_count
        accumulator->use_count++;
        pc = pc + 2;
        continue;
      case GET:
        frame_index = 0x0FFF & inst;
        value_index = instructions[pc + 1];
                //printf("GET %d %d\n", frame_index, value_index);
        // free accumulator is necessary
        Object_free(accumulator);

        // 这里应该检查 accumulator, 看看是否要free掉
        accumulator = env->data.Vector.v[frame_index]->data.Vector.v[value_index];
        pc = pc + 2;
        continue;
      case CONST:
        switch(inst){         
          case CONST_INTEGER:  // 32 bit num 
            // free accumulator is necessary
            //printf("CONST_INTEGER0\n");
            //printf("%d\n", accumulator->use_count);
            //if(accumulator->use_count == 0)
            //  printf("%s\n", accumulator->data.String.v);
            Object_free(accumulator);
            //printf("CONST_INTEGER1\n");
            accumulator = Object_initInteger((int)((instructions[pc + 1] << 16) | (instructions[pc + 2])));
            pc = pc + 3; 
            continue;
          case CONST_STRING:
            string_length = instructions[pc + 1];
            created_string = (char*)malloc(sizeof(char) * (string_length));
            pc = pc + 2;
            i = 0;
            while(1){
              s = instructions[pc];
              s1 = (char)((0xFF00 & s) >> 8);
              s2 = (char)(0x00FF & s);
              if(s1 == 0x00) // reach end
                break;
              else{ 
                created_string[i] = s1;
                i++;
              }
              if(s2 == 0x00) // reach end
                break;
              else{
                created_string[i] = s2;
                i++;
              }
              pc = pc + 1;
            }
            created_string[i] = 0;
            // free accumulator is necessary
            Object_free(accumulator);

            // create string
            accumulator = Object_initString(created_string, string_length - 1);
            accumulator->data.String.in_table = 1;
            // push to CONSTANT_TABLE
            CONSTANT_TABLE[CONSTANT_TABLE_LENGTH] = accumulator;
            CONSTANT_TABLE_LENGTH++;

            pc = pc + 1;
            continue;            
          default: // null
            // free accumulator is necessary
            Object_free(accumulator);
            // set null
            accumulator = GLOBAL_NULL;
            pc = pc + 1;
            continue;
        }
      case MAKELAMBDA: // make lambda
        param_num = (0x0FC0 & inst) >> 6;
        variadic_place = (0x0001 & inst) ? ((0x003E & inst) >> 1) : -1;
        start_pc = pc + 2;
        jump_steps = instructions[pc + 1];

        // free accumulator is necessary
        Object_free(accumulator);
        accumulator = Object_initUserDefinedLambda(param_num, variadic_place, start_pc, copyEnvironment(env));
        pc = pc + jump_steps + 1;
        continue;
      case RETURN:
        //printf("RETURN, ENTER HERE %d\n", accumulator->data.Integer.v);
        pc = vector_Get(top_frame_pointer, 1)->data.Integer.v;
        env = vector_Get(top_frame_pointer, 0);
        //printf("%d\n", vector_Length(vector_Get(env, 0)));
        for(i = 2; i < vector_Length(top_frame_pointer); i++){
          //printf("i: %d\n", i);
          // decrement use_count
          v = vector_Get(top_frame_pointer, i);
          //printf("value: %d, use_count: %d\n", v->data.Integer.v, v->use_count);
          v->use_count--;
          //if(v->use_count == 0){
          //  printf("FREEd\n");
          //}
          Object_free(v);
        }
        //Object_free(top_frame_pointer); // free top frame
        top_frame_pointer = vector_Get(env, vector_Length(env) - 1); // reset top_frame pointer
        //printf("PC %d\n", pc);
        continue;
      case NEWFRAME: // create new frame
        switch (accumulator->type){
            case USER_DEFINED_LAMBDA: // user defined function
              // create new frame with length 64
              current_frame_pointer = Object_initVector(0, 64);
              current_frame_pointer->data.Vector.length = 2; // set length to 2, save space for env and pc
              frames_list = cons(current_frame_pointer, frames_list);
              functions_list = cons(accumulator, functions_list);
              pc = pc + 1;
              continue;
            case BUILTIN_LAMBDA: case VECTOR: // builtin lambda or vector
              current_frame_pointer = top_frame_pointer; // get top frame
              frames_list = cons(current_frame_pointer, frames_list); // save to frame list
              functions_list = cons(accumulator, functions_list); // save function to function list
              pc = pc + 1;
              continue;
            default:
                printf("ERROR: NEWFRAME error");
                return GLOBAL_NULL;
        }
      case PUSH_ARG: // push arguments
        //current_frame_pointer->data.Vector.v[0x0FFF & inst] = accumulator;
        //printf("PUSHARG %d\n", accumulator->data.Integer.v);
        accumulator->use_count++; // increase use count
        current_frame_pointer->data.Vector.v[current_frame_pointer->data.Vector.length] = accumulator;
        current_frame_pointer->data.Vector.length++;
        pc = pc + 1;
        continue;

      case CALL:
        param_num = (0x0FFF & inst);
        v = car(functions_list); // get function
        functions_list = cdr(functions_list);  // pop that function from list
        switch (v->type){
          case BUILTIN_LAMBDA: // builtin lambda
            func_ptr = v->data.Builtin_Lambda.func_ptr;
            pc = pc + 1;
            accumulator = (*func_ptr)(current_frame_pointer, param_num, vector_Length(current_frame_pointer) - param_num); // call function
            //printf("@@ %d %d\n", vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 1)->data.Integer.v , 
            //     vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 1)->data.Integer.v);
            /*if(func_ptr == &builtin_num_equal){
              printf("CHECK EQUAL\n");
              printf("@@ %d %d\n", vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 1)->data.Integer.v , 
                   vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 2)->data.Integer.v);
            }
            if(func_ptr == &builtin_sub){
              printf("SUB\n");
              printf("@@ %d %d\n", vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 1)->data.Integer.v , 
                   vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 2)->data.Integer.v);
              printf("RESULT %d\n", accumulator->data.Integer.v);
            }
            if(func_ptr == &builtin_mul){
              printf("MUL\n");
              exit(0);
            }
            printf("%d\n", (int)func_ptr);*/
            //printf("GET accumulator %s\n", accumulator->data.String.v );
            // pop parameters
            for(i = 0; i < param_num; i++){
              temp = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 1 - i);
              temp->use_count--; // －1 因为在push的时候加1了
              Object_free(temp);
            }
            current_frame_pointer->data.Vector.length -= param_num; // decrement the length
            frames_list = cdr(frames_list);           // 
            current_frame_pointer = car(frames_list); // get new frame pointer
            // free lambda
            Object_free(v);
            continue;
          case VECTOR: // vector
            pc = pc + 1;
            switch(param_num){
              case 1: // vector get
                accumulator = vector_Get(v, vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-1)->data.Integer.v);
                // pop 1 param
                temp = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-1);
                temp->use_count--;
                Object_free(temp);
                current_frame_pointer->data.Vector.length--; // set length
                break;
              case 2: // vector set
                i = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-2)->data.Integer.v; // set index
                temp = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-1); // set value
                Object_free(vector_Get(v, i)); // free that original value
              
                vector_Get(v, i) = temp;
                //temp->use_count++; // increase use count 不用再＋＋ 因为再 PUSHARG的时候加过了
                // pop 2 params
                temp = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-1);
                temp->use_count--;
                Object_free(temp);
                //temp = vector_Get(current_frame_pointer, vector_Length(current_frame_pointer)-2);
                //Object_free(temp);
                current_frame_pointer->data.Vector.length-=2; // set length
                break;
              default: // wrong parameters
                printf("ERROR: Invalid vector operation\n");
                return NULL;

              frames_list = cdr(frames_list);           // 
              current_frame_pointer = car(frames_list); // get new frame pointer
              // free lambda
              Object_free(v);
              continue;
            }
          case USER_DEFINED_LAMBDA: // user defined function

            required_param_num = v->data.User_Defined_Lambda.param_num;
            required_variadic_place = v->data.User_Defined_Lambda.variadic_place;
            start_pc = v->data.User_Defined_Lambda.start_pc;
          
            new_env = copyEnvironment(v->data.User_Defined_Lambda.env);
            new_env->data.Vector.v[new_env->data.Vector.length] = current_frame_pointer; // add frame
            new_env->data.Vector.length++;

            top_frame_pointer = current_frame_pointer; // update top frame pointer

            vector_Get(current_frame_pointer, 0) = env; // save current env to new-frame
            vector_Get(current_frame_pointer, 1) = Object_initInteger(pc + 1); // save pc

            if(required_variadic_place == -1 && param_num - 1 > required_param_num){
              printf("ERROR: Too many parameters provided\n");
              return NULL;
            }
            if(required_variadic_place != -1){
              v = GLOBAL_NULL;
              for(i = vector_Length(current_frame_pointer) - 1; i >= required_variadic_place + 2; i--){
                v = cons(vector_Get(current_frame_pointer, i), v);
              }
              vector_Get(current_frame_pointer, required_variadic_place + 2) = v;
            }

            if(vector_Length(current_frame_pointer) - 2 < required_param_num){
              for(i = param_num; i < required_param_num; i++){
                vector_Get(current_frame_pointer, i+2) = GLOBAL_NULL;
              }
            }

            // resert pointers
            env = new_env;
            pc = start_pc;

            //printf("@@@@ User Defined Function %d\n", vector_Get(current_frame_pointer, vector_Length(current_frame_pointer) - 1)->data.Integer.v);
            //printf("@@@@ new env length: %d  value: %d\n", vector_Length(env),vector_Get(vector_Get(env, 1), 2)->data.Integer.v);
            // pop frame
            frames_list = cdr(frames_list);
            current_frame_pointer = car(frames_list);

            // free lambda
            Object_free(v);
            continue;
          default:
            printf("ERROR: Invalid Lambda\n");
            return GLOBAL_NULL;
      }
      case JMP:
        pc = pc + ((instructions[pc + 1] << 16) | instructions[pc + 2]);
        continue;

      case TEST:
        if (accumulator->type == NULL_){
          pc = pc + instructions[pc + 1];
          continue;
        }
        //printf("RUN NEXT\n");
        // run next
        pc = pc + 2;
        continue;
      case PUSH: // push to top frame
        //v = top_frame_pointer; // top frame
        top_frame_pointer->data.Vector.v[top_frame_pointer->data.Vector.length] = accumulator; // set value
        accumulator->use_count++; // increase use_count
        top_frame_pointer->data.Vector.length++; // increase length
        pc++;
        continue;
      default:
        printf("ERROR: Invalid opcode %d\n", opcode);
        return GLOBAL_NULL;
    }
  }
  return accumulator;
}

// int insts[12] = {0x2400, 0x9000, 0x0008, 0x2100, 0x0000, 0x0002, 0x8000, 0x0000, 0x0006, 0x2100, 0x0000, 0x0003};
//int insts[4] = {0x2100, 0x0000, 0x000c, (PUSH << 12)};
int insts[55] = {0x3040, 0x002d, 0x1000, 0x000c, 0x5000, 0x1001, 0x0002, 0x6002, 0x2100, 0x0000, 0x0000, 0x6003, 0x7002, 0x9000, 0x0008, 0x2100, 0x0000, 0x0001, 0x8000, 0x0000, 0x001b, 0x1000, 0x0005, 0x5000, 0x1001, 0x0002, 0x6002, 0x1000, 0x001a, 0x5000, 0x1000, 0x0004, 0x5000, 0x1001, 0x0002, 0x6002, 0x2100, 0x0000, 0x0001, 0x6003, 0x7002, 0x6002, 0x7001, 0x6003, 0x7002, 0x4001, 0xa000, 0x1000, 0x001a, 0x5000, 0x2100, 0x0000, 0x000C, 0x6002, 0x7001};
int main(){
  
  printf("Walley Language 0.3.673\n");
  Object * o = VM(insts, 55, 0, createEnvironment());

  printf("%d\n", o->data.Integer.v);
  printf("%D\n", GLOBAL_FRAME[26]->data.Integer.v);
  printf("%d\n", (int)sizeof(long));
  
  /*
  // check Table
  Object * t = Object_initTable(16);
  char * hi;
  int i = 0;
  int LEN = 1024;
  for(i = 0; i < LEN; i++){
    hi = malloc(sizeof(char)*100);
    sprintf(hi, "hi%d", i);
    //printf("%s\n", hi);
    setval(t, Object_initString(hi, 10), Object_initInteger(i));
  }

  printf("SIZE:   %d\n", t->data.Table.size );
  printf("LENGTH: %d\n", t->data.Table.length );
  printf("%d\n", getval(t, Object_initString("hi102", 4))->data.Integer.v);
  
  // test table_getKeys
  int c = 0;
  Object * p = table_getKeys(t);
  while(p != GLOBAL_NULL){
    printf("%s\n", p->data.Pair.car->data.String.v);
    p = cdr(p);
    c++;
  }
  printf("C %d\n", c);
  */
  return 0;
}








