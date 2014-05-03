all:
	gcc main.c -o walley
install:
	cp walley /usr/local/bin
	rm -rf *.o walley a.out
fast:
	gcc main.c -O3 -o walley
test:
	gcc main.c -g -Wall -Werror -o walley
parser:
	gcc parser.h -g -Wall -Werror -o walley
lexer:
	gcc lexer.h -g -Wall -Werror -o walley
clean:
	rm -rf *.o walley a.out
