#include <iostream>
#include <ctime>

#include <App.h>
#include <HttpResponse.h>

#include "defs.h"
#include "room_manager.h"

int main() {
	RoomManager manager;
	uWS::SocketContextOptions options = {};

	uWS::App app = uWS::App(options).ws<PerSocketData>("/room/join", {
		.open = [](auto* ws) {
			std::cout << "Open" << std::endl;
		},
		.message = [&manager](auto* ws, std::string_view message, uWS::OpCode opCode) {
			manager.on_message(ws, message);
		},
		.close = [&manager](auto* ws, int code, std::string_view message) {
			manager.on_close(ws);
		}
	}).post("/room/create", [&manager](uWS::HttpResponse<false>* response, uWS::HttpRequest* request) {
		manager.create_room(0);
	}).listen(9001, [](auto* listen_socket) {
		if (listen_socket) {
            std::cout << "Listening on port 9001" << std::endl;
		}
	});

    struct us_loop_t *loop = (struct us_loop_t *) uWS::Loop::get();
    struct us_timer_t *delayTimer = us_create_timer(loop, 0, 0);

	us_timer_set(delayTimer, [](struct us_timer_t* t) {
		struct timespec ts;
		timespec_get(&ts, TIME_UTC);

		int64_t millis = ts.tv_sec * 1000 + ts.tv_nsec / 1000000;

		std::cout << "Event loop" << std::endl;
	}, 16, 16);

	app.run();

	return 0;
}
