all:
	gcc main.c -o walley -lm
install:
	cp walley /usr/local/bin
	cp walley_core.wa /usr/local/bin
	rm -rf *.o walley a.out
fast:
	gcc main.c -O3 -o walley -lm
test:
	gcc main.c -g -Wall -Werror -o walley -lm
clean:
	rm -rf *.o walley a.out
