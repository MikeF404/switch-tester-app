package com.kblab;

import com.kblab.model.User;
import com.kblab.repository.UserRepository;
import com.kblab.repository.CartRepository;
import com.kblab.service.TestCleanupService;
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
	UserRepository userRepository;

	@Autowired
	CartRepository cartRepository;

	@Autowired
	TestCleanupService cleanupService;

	String baseUrl;

	// List to track test user emails
	List<String> testUserEmails = new ArrayList<>();

	@BeforeEach
	void setup() {
		baseUrl = "http://localhost:" + port;
	}

	@AfterEach
	@Transactional
	void cleanup() {
		// Remove test users based on their email
		for (String email : testUserEmails) {
			cleanupService.cleanupTestUserByEmail(email);
		}
		testUserEmails.clear();  // Clear the list after cleanup
	}

	@Test
	void basicTest() {
		String response = restTemplate.getForObject(baseUrl+"/api/test", String.class);
		assertEquals(response, "Hello World!");
	}

	@Test
	void testSwitches() {
		ResponseEntity<String> response = restTemplate.getForEntity(baseUrl + "/api/switches", String.class);
		assertEquals(response.getStatusCode(), HttpStatus.OK);
	}

	@Test
	void testRegisterAndLogin() {
		// Test user registration
		String testEmail = "testuser@example.com";
		testUserEmails.add(testEmail);  // Add the email to the list for cleanup later

		Map<String, String> registerBody = new HashMap<>();
		registerBody.put("email", testEmail);
		registerBody.put("password", "testpassword");

		ResponseEntity<String> registerResponse = restTemplate.postForEntity(baseUrl + "/api/register", new HttpEntity<>(registerBody), String.class);
		assertEquals(HttpStatus.OK, registerResponse.getStatusCode());
		assertEquals("User registered successfully!", registerResponse.getBody());

		// Test user login
		Map<String, String> loginBody = new HashMap<>();
		loginBody.put("email", testEmail);
		loginBody.put("password", "testpassword");

		ResponseEntity<String> loginResponse = restTemplate.postForEntity(baseUrl + "/api/login", new HttpEntity<>(loginBody), String.class);
		assertEquals(HttpStatus.OK, loginResponse.getStatusCode());
		assertNotNull(loginResponse.getBody());
		assertTrue(loginResponse.getBody().contains("Session ID:"));
		assertTrue(loginResponse.getBody().contains("Cart ID:"));
	}

	@Test
	void testCartOperations() {
		// Register a user
		String testEmail = "cartuser@example.com";
		testUserEmails.add(testEmail);  // Add the email to the list for cleanup later

		Map<String, String> registerBody = new HashMap<>();
		registerBody.put("email", testEmail);
		registerBody.put("password", "cartpassword");

		ResponseEntity<String> registerResponse = restTemplate.postForEntity(baseUrl + "/api/register", new HttpEntity<>(registerBody), String.class);
		assertEquals(HttpStatus.OK, registerResponse.getStatusCode());

		// Login the user
		Map<String, String> loginBody = new HashMap<>();
		loginBody.put("email", testEmail);
		loginBody.put("password", "cartpassword");

		ResponseEntity<String> loginResponse = restTemplate.postForEntity(baseUrl + "/api/login", new HttpEntity<>(loginBody), String.class);
		assertEquals(HttpStatus.OK, loginResponse.getStatusCode());

		String loginResponseBody = loginResponse.getBody();
		assertNotNull(loginResponseBody);
		String cartId = extractCartIdFromLoginResponse(loginResponseBody);  // Extract Cart ID

		// Perform GET on the cart
		ResponseEntity<String> getCartResponse = restTemplate.getForEntity(baseUrl + "/api/cart/" + cartId, String.class);
		assertEquals(HttpStatus.OK, getCartResponse.getStatusCode());
		assertNotNull(getCartResponse.getBody());
		assertTrue(getCartResponse.getBody().contains("\"id\":" + cartId));

		// Perform POST on the cart to update it
		ResponseEntity<String> updateCartResponse = restTemplate.postForEntity(baseUrl + "/api/cart/" + cartId, null, String.class);
		assertEquals(HttpStatus.OK, updateCartResponse.getStatusCode());
		assertEquals("Cart updated successfully!", updateCartResponse.getBody());
	}

	private String extractCartIdFromLoginResponse(String responseBody) {
		// Assumes response format is "Session ID: <session_id>, Cart ID: <cart_id>"
		String[] parts = responseBody.split(", ");
		for (String part : parts) {
			if (part.startsWith("Cart ID:")) {
				return part.split(": ")[1];
			}
		}
		throw new IllegalArgumentException("Cart ID not found in login response");
	}
}

