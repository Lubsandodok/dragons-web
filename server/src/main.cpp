#include <iostream>
#include <ctime>
#include <memory>

#include <App.h>
#include <HttpResponse.h>
#include "plog/Log.h"
#include "plog/Initializers/RollingFileInitializer.h"

#include "defs.h"
#include "room_manager.h"

// TODO: move to a better place
RoomManager& manager = RoomManager::get_instance();

int main() {
	plog::init(plog::info, "server.log");

	uWS::SocketContextOptions options = {};

	uWS::App app = uWS::App(options).ws<PerSocketData>("/room/join", {
//		.open = [](auto* ws) {
//			std::cout << "Open" << std::endl;
//		},
		.message = [](auto* ws, std::string_view message, uWS::OpCode) {
			manager.on_message(ws, message);
		},
		.close = [](auto* ws, int, std::string_view) {
			manager.on_close(ws);
		}
	}).post("/room/create", [](uWS::HttpResponse<false>* response, uWS::HttpRequest*) {
		// TODO rewrite in a better shape and track abortion
//		bool is_aborted = false;
		response->onData([response, body = (std::string *)nullptr](std::string_view chunk, bool is_last) mutable {
			// if (is_aborted) {
			// 	std::cout << "Request was aborted" << std::endl;
			// 	return;
			// }

			if (is_last) {
				if (body) {
					body->append(chunk);
					auto data = manager.create_room(*body);
					response->end(data);
					delete body;
				} else {
					auto data = manager.create_room(chunk);
					response->end(data);
				}
			} else {
				if (!body) {
					body = new std::string();
				}
				body->append(chunk);
			}
		});

		response->onAborted([]() {
			std::cout << "Aborted" << std::endl;
//			is_aborted = true;
		});
	}).listen(9001, [](auto* listen_socket) {
		if (listen_socket) {
            std::cout << "Listening on port 9001" << std::endl;
		}
	});

    struct us_loop_t *loop = (struct us_loop_t *) uWS::Loop::get();
    struct us_timer_t *delayTimer = us_create_timer(loop, 0, 0);

	us_timer_set(delayTimer, [](struct us_timer_t*) {
//		struct timespec ts;
//		timespec_get(&ts, TIME_UTC);

//		int64_t millis = ts.tv_sec * 1000 + ts.tv_nsec / 1000000;

		manager.on_event_loop();
	}, 100, 100);

	app.run();

	return 0;
}
