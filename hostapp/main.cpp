#include <iostream>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <sstream>

extern "C" {
  #include "tee_client_api.h"
}

static const TEEC_UUID uuid = {
  0x3E93632E, 0xA710, 0x469E, { 0xAC, 0xC8, 0x5E, 0xDF, 0x8C, 0x85, 0x90, 0xE1 }
};

#define DUMMY_DATA_SIZE 1024

//we cant use any stdout prints here...
TEEC_Result conn_test()
{
  TEEC_Context context;
  TEEC_Session session;
  TEEC_SharedMemory inout_mem;
  TEEC_Operation operation;
  TEEC_Result ret;
  uint32_t return_origin;
  uint32_t connection_method = TEEC_LOGIN_PUBLIC;
  uint8_t dummy_data_arr[DUMMY_DATA_SIZE];
  int32_t dummy_value = 55;

  memset((void *)&inout_mem, 0, sizeof(inout_mem));
  memset((void *)&operation, 0, sizeof(operation));
  memset(dummy_data_arr, 'x', sizeof(dummy_data_arr));

  /* Initialize context */
  ret = TEEC_InitializeContext(NULL, &context);
  if (ret != TEEC_SUCCESS) {
    goto end_1;
  }

  inout_mem.buffer = dummy_data_arr;
  inout_mem.size = DUMMY_DATA_SIZE;
  inout_mem.flags = TEEC_MEM_INPUT | TEEC_MEM_OUTPUT;

  ret = TEEC_RegisterSharedMemory(&context, &inout_mem);
  if (ret != TEE_SUCCESS) {
    goto end_1;
  }

  operation.paramTypes = TEEC_PARAM_TYPES(TEEC_VALUE_INOUT, TEEC_MEMREF_WHOLE,
            TEEC_NONE, TEEC_NONE);

  operation.params[0].value.a = dummy_value;
  operation.params[1].memref.parent = &inout_mem;

  /* Open session */
  ret = TEEC_OpenSession(&context, &session, &uuid, connection_method, NULL, &operation,
             &return_origin);
  if (ret != TEEC_SUCCESS) {
    goto end_2;
  }

  /* Invoke command */
  ret = TEEC_InvokeCommand(&session, 0, &operation, &return_origin);
  if (ret != TEEC_SUCCESS) {
    goto end_3;
  }

  /* Cleanup used connection/resources */

end_3:
  TEEC_CloseSession(&session);

end_2:
  TEEC_ReleaseSharedMemory(&inout_mem);
  TEEC_FinalizeContext(&context);

end_1:
  return ret;
}


int main()
{
  std::string message = "";
  TEEC_Result ret = TEEC_SUCCESS;

  //listener loop
  while (1) {
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

    if (ret == TEEC_SUCCESS) {
      message = "{\"text\":\"Connect to TEE success\"}";
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
