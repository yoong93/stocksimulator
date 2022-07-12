#include <netinet/in.h>
#include <iostream>
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <cstring>
#include <sys/socket.h>
#include <unistd.h>
#include <nlohmann/json.hpp>
#include <sstream>
#include "db/database.h"
#include "alpha_vantage/datadownloader.h"
#include "msghandler.h"

#define PORT 8080

char buffer[1024] = { 0 };
char* pb = buffer;
std::string handler_res;
using json = nlohmann::json;

int createServer();

int createServer(){
	printf("creating server\n");
	int server_fd, new_socket, valread;
	struct sockaddr_in address;
	int opt = 1;
	int addrlen = sizeof(address);
	const char* hello = "Server Status check\n";

	// Create socket file descriptor
	if((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0){
		perror("socket failed");
		return -1;
	}

	// Set socketoptions and address fields
	if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR | SO_REUSEPORT, &opt, sizeof(opt))){
		perror("setsocketopt");
		return -1;
	}
	address.sin_family = AF_INET;
	address.sin_addr.s_addr = INADDR_ANY;
	address.sin_port = htons(PORT);

	// Bind socket to the port
	if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) < 0){
		perror("bind failed");
		return -1;
	}

	// TODO Keep server alive when multiple server/new socket
	if (listen(server_fd, 3) < 0){
		perror("listen");
		return -1;
	}
	
	std::unique_ptr<msghandler::MsgHandler> msghandler = std::make_unique<msghandler::MsgHandler>();
	int result;
	std::stringstream ss;
	std::string result_message;
	while(1){
		ss.str("");
		memset(buffer, 0, 1024);
		if((new_socket = accept(server_fd, (struct sockaddr*)&address, (socklen_t*)&addrlen)) < 0){
			perror("listen");
			continue;
		}

		valread = read(new_socket, buffer, 1024);
		result = msghandler->handleMessage(buffer);
		ss << "{\"result\" : \"" << result << "\"}";
		result_message = ss.str(); 
		//std::cout << result_message << ":" << result_message.length() << std::endl;
		send(new_socket, result_message.c_str(), result_message.length(), 0);
		close(new_socket);
		
		if(result < 0){
			return 0;
		}	
	}
	// Shutting server down
	shutdown(server_fd, SHUT_RDWR);
	return 0;
}



int main(){
	createServer();
	return 0;
}