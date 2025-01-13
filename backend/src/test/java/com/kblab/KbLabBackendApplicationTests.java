package com.kblab;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kblab.repository.CartRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class KbLabBackendApplicationTests {

	@LocalServerPort
	int port;

	@Autowired
	TestRestTemplate restTemplate;

	@Autowired
	CartRepository cartRepository;

	@Autowired
	ObjectMapper objectMapper;

	String baseUrl;

	// Lists to track and remove created data
	List<String> testUserEmails = new ArrayList<>();
	List<Long> createdCartIds = new ArrayList<>();
	List<Long> createdOrderIds = new ArrayList<>();

	@BeforeEach
	void setup() {
		baseUrl = "http://localhost:" + port;
	}

	@Test
	void basicTest() {
		String response = restTemplate.getForObject(baseUrl+"/api/test", String.class);
		assertEquals(response, "Hello World!");
	}

	// This test creates an actual email. Uncomment to test integration with Mailing Service.
	//@Test
	void testContactForm() {
		Map<String, String> requestBody = new HashMap<>();
		requestBody.put("userEmail", "test@test.com");
		requestBody.put("message", "This is a test message");
		requestBody.put("topic", "Test Message");
		ResponseEntity<String> response = restTemplate.postForEntity(baseUrl+"/api/sendMessage", new HttpEntity<>(requestBody), String.class);

		assertEquals(response.getStatusCode(), HttpStatus.OK);
		assertEquals(response.getBody(), "Message sent successfully!");
	}

	@Test
	void testSwitches() {
		ResponseEntity<String> response = restTemplate.getForEntity(baseUrl + "/api/switches", String.class);
		assertEquals(response.getStatusCode(), HttpStatus.OK);
	}

}

