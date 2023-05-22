configure:
	@if ! [ -d "uWebSockets" ]; then\
		git clone https://github.com/uNetworking/uWebSockets.git;\
	fi;
	cd uWebSockets/ && git submodule update --init --recursive;


configure-clean:
	rm -rf uWebSockets;

CXX = g++
CXXFLAGS = -O3 -Wpedantic -Wall -Wextra -Wsign-conversion -Wconversion \
		   -flto -std=c++2a -IuWebSockets/src -IuWebSockets/uSockets/src \
		   -Iinclude
LDFLAGS = -lz uWebSockets/uSockets/*.o
SOURCES = src/main.cpp src/room.cpp src/room_manager.cpp src/command.cpp src/utils.cpp src/database.cpp

build:
	@if ! [ -f uWebSockets/uSockets/uSockets.a ]; then\
		cd uWebSockets/ && make;\
	fi;
	$(CXX) $(CXXFLAGS) $(SOURCES) $(LDFLAGS) -o server

clean:
	cd uWebSockets/uSockets/ && make clean;
	rm server
