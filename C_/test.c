#include <stdio.h>
#include <stdlib.h>
typedef struct test
{
  int i;
}test ;
void test_fn(test * a)
{
  a->i = 12;
}
int main()
{
  test a;
  a.i = 0;
  test_fn(&a);
  printf("%i", a.i);
}
