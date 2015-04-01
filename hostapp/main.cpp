#include <iostream>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <sstream>

//rapidjson
#include "rapidjson/document.h"
#include "rapidjson/writer.h"
#include "rapidjson/stringbuffer.h"

extern "C" {
#include "tee_client_api.h"
#include "cryptoki.h"
}

static const TEEC_UUID uuid = {
  0x3E93632E, 0xA710, 0x469E, { 0xAC, 0xC8, 0x5E, 0xDF, 0x8C, 0x85, 0x90, 0xE1 }
};

#define DUMMY_DATA_SIZE 1024
#define KEY_SIZE 2048/8

enum Command {
	CMD_HELLO,
	CMD_QUIT,
	CMD_ENCRYPT,
	CMD_DECRYPT,
	CMD_ADDKEY,
	CMD_REMKEY,
	CMD_INVALID
};

static CK_FUNCTION_LIST_PTR func_list;
static bool running;

using namespace rapidjson;

uint32_t init_session(CK_SESSION_HANDLE* session)
{
	CK_INFO info;
	CK_RV ret;
	CK_SLOT_ID available_slots[1];
	CK_ULONG num_slots = 1;
	std::string pin = "12345678";

	ret = C_GetFunctionList(&func_list);
	if (ret != CKR_OK || func_list == NULL) {
		fprintf(stderr,"Failed to get function list: %ld\n", ret);
		return 1;
	}

	ret = func_list->C_Initialize(NULL);
	if (ret != CKR_OK) {
		fprintf(stderr,"Failed to initialize the library: %ld\n", ret);
		return 1;
	}

	ret = C_GetInfo(&info);
	if (ret != CKR_OK) {
		fprintf(stderr,"Failed to get the library info: %ld\n", ret);
		return 1;
	}

	fprintf(stderr,"Version : Major %d: Minor %d\n",
	       info.cryptokiVersion.major, info.cryptokiVersion.minor);

	fprintf(stderr, "getting slots\n");
	ret = func_list->C_GetSlotList(1, available_slots, &num_slots);
	if (ret != CKR_OK) {
		printf("Failed to get the available slots: %ld\n", ret);
		return 0;
	}

	fprintf(stderr, "trying to open session %u\n", available_slots[0]);
	ret = func_list->C_OpenSession(available_slots[0], CKF_RW_SESSION | CKF_SERIAL_SESSION,
				       NULL, NULL, session);
	if (ret != CKR_OK) {
		fprintf(stderr,"Failed to Open session the library: 0x%x\n", (uint32_t)ret);
		return 1;
	}
	fprintf(stderr, "opened session\n");
	ret = func_list->C_Login(*session, CKU_USER, (CK_BYTE_PTR)pin.c_str(), pin.length());
	if (ret != CKR_OK) {
		fprintf(stderr, "Failed to login: 0x%x\n", (uint32_t)ret);
		return 1;
	}
	fprintf(stderr, "initialized\n");
	return 0;
}

uint32_t finalize_session(CK_SESSION_HANDLE* session)
{
	CK_RV ret;

	ret = func_list->C_Logout(*session);
	if (ret != CKR_OK) {
		fprintf(stderr,"Failed to logout: 0x%x\n", (uint32_t)ret);
		return 1;
	}

	func_list->C_CloseSession(*session);

	ret = func_list->C_Finalize(NULL);
	if (ret != CKR_OK) {
		fprintf(stderr,"Failed to Finalize the library: %ld\n", ret);
		return 1;
	}
	fprintf(stderr, "finalized\n");
	return 0;
}


/*
int main()
{
  std::string message = "";
  TEEC_Result ret = TEEC_SUCCESS;
  int looper = 0;
  //listener loop
  while (1) {
    looper++;
    unsigned int length = 0;

    for (int i = 0; i < 4; i++) {
        unsigned int read_char = getchar();
        length = length | (read_char << i*8);
    }

    //read the json
    std::string msg = "";
    for(int i = 0; i < length; i++) {
      msg += getchar();
    }
    ret = conn_test();

    std::stringstream ss;
    ss << ret;
    ss << " " << looper;

    if (ret == TEEC_SUCCESS) {
      message = "{\"text\":\"Connect to TEE success " + ss.str() + "\"}";
    } else {
      message = "{\"text\":\"Connect to TEE failure with error " + ss.str() + "\"}";
    }

    unsigned int len = message.length();

    if (msg == "{\"text\":\"#STOP#\"}"){
      message = "{\"text\":\"EXITING...\"}";
      len = message.length();

      std::cout   << char(len>>0)
                  << char(len>>8)
                  << char(len>>16)
                  << char(len>>24);

      std::cout << message;
      break;
    }

    len = message.length();
    std::cout << char(len>>0)
              << char(len>>8)
              << char(len>>16)
              << char(len>>24);
    std::cout << message << std::flush;
  }
  return 0;
}
*/

void send_msg_browser(std::string out_msg)
{
	uint32_t out_msg_len = out_msg.length();

	//prepend the length of the message in the first 4 bytes
	std::cout << char(out_msg_len>>0)
		  << char(out_msg_len>>8)
		  << char(out_msg_len>>16)
		  << char(out_msg_len>>24);
	std::cout << out_msg << std::flush;
	return;
}

Command cmd_to_enum(std::string cmd)
{
	if (cmd == "hello")
		return CMD_HELLO;
	if (cmd == "quit")
		return CMD_QUIT;
	if (cmd == "encrypt")
		return CMD_ENCRYPT;
	if (cmd == "decrypt")
		return CMD_DECRYPT;
	if (cmd == "addkey")
		return CMD_ADDKEY;
	if (cmd == "remkey")
		return CMD_REMKEY;
	return CMD_INVALID;
}

CK_RV add_key()
{
	return 0;
}

CK_OBJECT_HANDLE get_key_handle(std::string keyid, CK_KEY_TYPE keytype, CK_OBJECT_CLASS obj_class, CK_SESSION_HANDLE* session)
{
	CK_RV ret = CKR_OK;
	CK_ULONG count = 0;
	CK_OBJECT_HANDLE_PTR object_handle = 0;

	//create CK_ATTRIBUTE_PTR template to match the key
	CK_ATTRIBUTE key_object[3] = {
		{CKA_CLASS, &obj_class, sizeof(obj_class)},
		{CKA_KEY_TYPE, &keytype, sizeof(keytype)},
		{CKA_LABEL, (CK_BYTE_PTR)keyid.c_str(), sizeof(keyid.c_str())}
	};

	//search the key
	ret = func_list->C_FindObjectsInit(*session, key_object, 3);

	if (ret != CKR_OK)
	{
		ret = func_list->C_FindObjectsFinal(*session);
		return 0;
	}
	ret = func_list->C_FindObjects(*session, object_handle, 1, &count);

	if (ret != CKR_OK || count != 1 || !object_handle )
	{
		ret = func_list->C_FindObjectsFinal(*session);
		return 0;
	}

	ret = func_list->C_FindObjectsFinal(*session);

	//do we care if finalizing doesnt work but we still got the handle?
	if (ret != CKR_OK)
		return 0;

	return *object_handle;
}

uint32_t encrypt(Document* json)
{
	fprintf(stderr, "encrypt\n");

	//get key handle

	//perform sanity checks?

	//DEEBADAABADOOULIULI
	return 0;
}

uint32_t decrypt(Document* json)
{
	fprintf(stderr, "decrypt\n");
	return 0;
}

uint32_t addkey(Document* json)
{
	fprintf(stderr, "addkey\n");
	return 0;
}

uint32_t remkey(Document* json)
{
	fprintf(stderr, "remkey\n");
	return 0;
}

uint32_t cmd_handler(Document* json)
{
	fprintf(stderr, "cmd_handler\n");
	//the text field contains the command
	std::string tmp;
	std::string key;
	std::string msg;
	//create writer for the reply

	key = "text";
	StringBuffer json_out;
	Writer<StringBuffer> writer(json_out);


	//add checks if we cant find out the necessary fields
	tmp = (*json)["text"].GetString();
	fprintf(stderr, "getstring done\n");
	//in the handler for a certain command
	//- make the call to the TEE
	//- formulate reply to the extension
	//- in this early case the reply is just a simple text field accompanied with a msg

	//each command will be responsible of sending the response back
	//so TODO: remove the outgoing msg stuff from this function completely
	switch(cmd_to_enum(tmp)) {
		case CMD_HELLO:
			msg = "well hi";
			break;
		case CMD_QUIT:
			msg = "exiting";
			running = false;
			break;
		case CMD_ENCRYPT:
			msg = "execute encrypt";
			encrypt(json);
			break;
		case CMD_DECRYPT:
			msg = "execute decrypt";
			decrypt(json);
			break;
		case CMD_ADDKEY:
			msg = "execute addkey";
			addkey(json);
			break;
		case CMD_REMKEY:
			msg = "execute remkey";
			remkey(json);
			break;
		default:
			msg = "unknown command!";
			break;
	}

	//init object
	//functionize this in a fancy way
	writer.StartObject();
	writer.Key(key.c_str());
	writer.String(msg.c_str());
	writer.EndObject();

	send_msg_browser(json_out.GetString());

	return 0;
}

int main() {
	//init session
	std::string in_msg = "";
	unsigned int in_msg_len = 0;
	std::string out_msg = "";
	unsigned int out_msg_len = 0;
	Document json_in;
	unsigned int read_char = 0;
	uint32_t ret = 0;
	CK_SESSION_HANDLE session = 0;
	running = true;


	ret = init_session(&session);

	if(ret)
		return 1;

	//loop and listen and reply

	while(running)
	{
		//herpderp
		fprintf(stderr, "running loopz\n");
		//read the length from stdin
		//every msg from the messaging service comes prepended with
		//4 bytes resembling the length of the message
		for (unsigned int i = 0; i < 4; i++) {
		    read_char = getchar();
		    in_msg_len = in_msg_len | (read_char << i*8);
		}
		//read the json
		for(unsigned int i = 0; i < in_msg_len; i++) {
		  in_msg += getchar();
		}
		//parse the json
		json_in.Parse(in_msg.c_str());
		cmd_handler(&json_in);

		//handle cmd
		//find key / create key whatever

		//send cmd to TA


		//record reply

		//send reply to plugin

		//reset variables
		in_msg_len = 0;
		in_msg = "";
		out_msg_len = 0;
		out_msg = "";
	}

	//parse json
	//pass on msg to ta

	//finalize session
	ret = finalize_session(&session);

	if (ret)
		return 1;
	return 0;
}
