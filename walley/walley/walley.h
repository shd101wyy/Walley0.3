//
//  walley.h
//  walley
//
//  Created by WangYiyi on 4/28/14.
//  Copyright (c) 2014 WangYiyi. All rights reserved.
//

#ifndef walley_walley_h
#define walley_walley_h
#include "vm.h"

// debug
#if WALLEY_DEBUG
void Walley_Debug(/*Lexer * l, // lexer
                  Object * p, // parser
                  Instructions * insts, // instructions*/
Object * v // vm output
                  ){
                      /*
      printf("\n\n@@@ LEXER @@@\n");
      Lexer_Debug(l);
      printf("\n@@@ PARSER @@@\n");
      parser_debug(p);
                      
      printf("@@@@ CONSTANTS TABLE \n");
      printInstructions(CONSTANT_TABLE_INSTRUCTIONS);
      printf("\n@@@@ Proram \n");
      printInstructions(insts);
                      */
      printf("\n@@@@ Finish Running VM \n");
      if (v->type == USER_DEFINED_LAMBDA) {
          printf("\nUser Defined Lambda\n");
          printf("env length %d\n", v->data.User_Defined_Lambda.env->length);
          printf("%d\n", v->data.User_Defined_Lambda.env->frames[0]->length);
          if (v == v->data.User_Defined_Lambda.env->frames[0]->array[39]) {
              printf("Equal %d\n", v->use_count);
              printf("top frame length %d\n", v->data.User_Defined_Lambda.env->frames[1]->length);
              printf("fuck %ld\n", v->data.User_Defined_Lambda.env->frames[1]->array[0]->data.Integer.v);
          }
      }
      else if (v->type == INTEGER){
          printf("\nInteger\n");
          printf("use-count %d\n", v->use_count);
          number_debug(v);
      }
      else if (v->type == DOUBLE){
          printf("\nDouble\n");
          printf("use-count %d\n", v->use_count);
          number_debug(v);
      }
      else if (v->type == RATIO){
          printf("\nRatio\n");
          printf("use-count %d\n", v->use_count);
          number_debug(v);
      }
      else if (v->type == STRING){
          printf("\nString\n");
          printf("use-count %d\n", v->use_count);
          printf("%s\n", v->data.String.v);
      }
      else if (v == GLOBAL_NULL){
          printf("\n()\n");
      }
      else if (v->type == PAIR){
          printf("\nPair\n");
          printf("Attention: only print integer double string pair\n");
          parser_debug(v);
      }
}

#endif

/*
 read ints and return instructions
 0: fail
 1: success
 */
int read_ints (const char* file_name, unsigned short ** instructions, int * len){
    FILE* file = fopen (file_name, "r");
    if(!file){
        printf("Failed to read file\n");
        return 0;
    }
    int num = 0;
    unsigned int i = 0;
    unsigned int length = 0;
    while (fscanf(file, "%x ", &num) > 0)
    {
        switch (i){
            case 0:
                length = num << 16;
                break;
            case 1:
                length = length | num;
                *len = length; // get length
                (*instructions) = (unsigned short*)malloc(sizeof(unsigned short) * length); // init instructions
                break;
            default:
                (*instructions)[i - 2] = num;
                break;
        }
        i++;
    }
    fclose (file);
    return 1;
}

// repl
void Walley_Repl(){
    // init walley
    Walley_init();
    
    Lexer * p;
    Object * o;
    
    //Instructions * insts = Insts_init();
    //Variable_Table * vt = VT_init();
    //Environment * env = createEnvironment();
    //MacroTable * mt = MT_init();

    Instructions * insts = GLOBAL_INSTRUCTIONS;
    Variable_Table * vt = GLOBAL_VARIABLE_TABLE;
    Environment * env = GLOBAL_ENVIRONMENT;
    MacroTable * mt = GLOBAL_MACRO_TABLE;
    
    int run_eval = true;
    
    //Environment * env = NULL;
    //int run_eval = false;
    
    Object * v;
    

    char buffer[512];
    char * s;
    while (1) {
        fputs("walley> ", stdout);
        fgets(buffer, 512, stdin);
        p = lexer(buffer);
        o = parser(p);
        
        
        // compile
        v = compiler_begin(insts,
                       o,
                       vt,
                       NULL,
                       NULL,
                       run_eval,
                       env,
                       mt);
        
        /*
         // print parser
        s = to_string(o);
        printf("%s\n", s);
        free(s);
        */
        
        s = to_string(v);
        printf("\n        %s\n", (s));
        free(s); // need to free that value
        
        // printf("\nuse count %d\n", v->use_count);
        Object_free(v); // free accumulator
        

        // parser will be freed after compiler_begin finished
        //Object_free(o); // free parser
        
        
#if WALLEY_DEBUG
        Walley_Debug(v);
#endif
        
        
    }
}

/*
    suppose run .wa file
 */
void Walley_Run_File(char * file_name){
    // read content from file
    FILE* file = fopen(file_name,"r");
    if(file == NULL)
    {
        printf("Failed to read file %s\n", file_name);
        return; // fail to read
    }
    
    fseek(file, 0, SEEK_END);
    long int size = ftell(file);
    rewind(file);
    
    char* content = calloc(size + 1, 1);
    
    fread(content,1,size,file);
    
    fclose(file); // 不知道要不要加上这个
    
    // init walley
    Walley_init();
    
    Lexer * p;
    Object * o;
    
/*
    Instructions * insts = Insts_init();
    Variable_Table * vt = VT_init();
    Environment * env = createEnvironment();
    MacroTable * mt = MT_init();
*/
    
    Instructions * insts = GLOBAL_INSTRUCTIONS;
    Variable_Table * vt = GLOBAL_VARIABLE_TABLE;
    Environment * env = GLOBAL_ENVIRONMENT;
    MacroTable * mt = GLOBAL_MACRO_TABLE;

    int run_eval = true;
    
    //Environment * env = NULL;
    //int run_eval = false;
    
    //Object * v;
    
    p = lexer(content);
    o = parser(p);
    
    // compile
    /*v = */compiler_begin(insts,
                       o,
                       vt,
                       NULL,
                       NULL,
                       run_eval,
                       env,
                       mt);
    
    free(content);
    return;
}


/*
 suppose run .wa file
 */
/*
Object * Walley_Run_File_for_VM(char * file_name,
                                Instructions * insts,
                                Variable_Table * vt,
                                Environment * env,
                                MacroTable * mt){
    // read content from file
    FILE* file = fopen(file_name,"r");
    if(file == NULL)
    {
        printf("Failed to read file %s\n", file_name);
        return GLOBAL_NULL; // fail to read
    }
    
    fseek(file, 0, SEEK_END);
    long int size = ftell(file);
    rewind(file);
    
    char* content = calloc(size + 1, 1);
    
    fread(content,1,size,file);
    
    fclose(file); // 不知道要不要加上这个
    
    Lexer * p;
    Object * o;
    
    int run_eval = true;
    
    //Environment * env = NULL;
    //int run_eval = false;
    
    
    p = lexer(content);
    o = parser(p);
    
    // compile
    Object * return_value = compiler_begin(insts,
                           o,
                           vt,
                           NULL,
                           NULL,
                           run_eval,
                           env,
                           mt);
    
    free(content);
    return return_value;
}
*/
#endif



