package com.kblab;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class KbLabBackendApplicationTests {

	@LocalServerPort
	int port;

	@Autowired
	TestRestTemplate restTemplate;
	String baseUrl;

	@BeforeEach
	void setup(){
		baseUrl = "http://localhost:" + port;
	}

	@Test
	void basicTest() {
		String response = restTemplate.getForObject(baseUrl+"/test", String.class);
		assertEquals(response, "Hello World!");
	}

}
