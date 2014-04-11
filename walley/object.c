#include <stdio.h>
#include <stdlib.h>
#include <string.h>
// using separate chaining
typedef struct Table Table;
typedef struct Pair Pair;
static int COLLISIONS_NUM = 0;
struct Pair
{	
	char * key; // key
	int value; // value
	Pair * next; // next
};
struct  Table
{
	unsigned int size;
	unsigned int length;
	Pair **vec; // array to save pairs
};

/* 
 * quick hash function 
 * djb2
 */
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
void rehash(Table * t){
	// make space to save keys
	unsigned long i = 0;
	unsigned long j = 0;
	unsigned int original_size = t->size;
	char * key;
	int value;
	unsigned long hash_value;
	Pair * p;
	Pair * temp;
	char * keys[original_size];
	int values[original_size];
	Pair * new_pair;
	for(i = 0; i < original_size; i++){
		if(t->vec[i]){
			p = t->vec[i]; // get pair;
			while(p != NULL){
				keys[j] = p->key;     // save keys
				values[j] = p->value; // save values;
				temp = p;
				p = p->next;
				free(temp); // free that pair
				j++;
			}
		}
	}
	// free vec
	free(t->vec);
	t->size = t->size * 2; // double size
	//t->vec = malloc(sizeof(Pair*) * t->size); // realloc
	t->vec = calloc(t->size, sizeof(Pair*)); // realloc

	// rehash
	for(i = 0; i < j; i++){
		key = keys[i];
		value = values[i];		
		// create new pair
		new_pair = malloc(sizeof(Pair));
		new_pair->key = key;
		new_pair->value = value;

		hash_value = hash(key, t->size); // rehash
		if(t->vec[hash_value] != NULL){ // already exist
			
			COLLISIONS_NUM++; //检查collision 数量

			new_pair->next = t->vec[hash_value];
			t->vec[hash_value] = new_pair;
		}
		else{ // doesn't exist
			new_pair->next = NULL;
			t->vec[hash_value] = new_pair;
		}
	}
}

/*
	getval
*/
int getval(Table * t, char * key){
	unsigned long hash_value = hash(key, t->size);
	Pair * pairs = t->vec[hash_value];
	while(pairs!=NULL){
		if(strcmp(key, pairs->key) == 0){
			return pairs->value;
		}
		pairs = pairs->next;
	}
	// didnt find
	return -1;
}
/*
	setval
*/
void setval(Table *t, char * key, int value){
	if(t->length / (double)t->size >= 0.7) // rehash
		rehash(t);
	unsigned long hash_value = hash(key, t->size);
 	Pair * pairs = t->vec[hash_value];
 	Pair * new_pair;
 	new_pair = malloc(sizeof(Pair));
 	new_pair->key = key;
 	new_pair->value = value;
 	if(pairs){ // already existed
 		
 		COLLISIONS_NUM++; //检查collision 数量

 		new_pair->next = t->vec[hash_value];
 		t->vec[hash_value] = new_pair;
 	} 
 	else{ // doesn't exist
 		new_pair->next = NULL;
 		t->vec[hash_value] = new_pair;
 	}
 	t->length++; // increase length
}

int check_Collision(Table * t){
	unsigned long i;
	Pair * p;
	int cols = 0;
	for(i = 0; i < t->size; i++){
		if(t->vec[i]){
			p = t->vec[i];
			while(p->next!=NULL){
				cols++;
				p=p->next;
			}
		}
	}
	return cols;
}
char* readFile(char* filename)
{
    FILE* file = fopen(filename,"r");
    if(file == NULL)
    {
        return NULL;
    }

    fseek(file, 0, SEEK_END);
    long int size = ftell(file);
    rewind(file);

    char* content = calloc(size + 1, 1);

    fread(content,1,size,file);

    return content;
}

int main(){
	/*
	Table * t = (Table*)malloc(sizeof(Table)); // create table
	t->size = 16;
	t->length = 0;
	t->vec = (Pair**)calloc(t->size, sizeof(Pair*));
	char *hi;
	int i = 0;
	int LEN = 102400;
	for(i = 0; i < LEN; i++){
		hi = malloc(sizeof(char)*100);
		sprintf(hi, "hi%d", i);
		//printf("%s\n", hi);
		setval(t, hi, i);
	}
	
	printf("COLLISION %d\n", COLLISIONS_NUM);
	printf("COLS %d\n",check_Collision(t));
	printf("SIZE %d\n", t->size );
	
	for(i = 0; i < LEN; i++){
		hi = malloc(sizeof(char)*100);
		sprintf(hi, "hi%d", i);
		printf("%d\n", getval(t, hi));
	}
	printf("%d\n", getval(t, "hi10"));
	
	printf("%d\n", getval(t, "hi10"));
	*/
	printf("%s\n", readFile("test.toy"));
	return 0;
}









