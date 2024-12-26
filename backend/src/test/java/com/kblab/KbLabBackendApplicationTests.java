package com.kblab;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.kblab.model.Cart;
import com.kblab.repository.UserRepository;
import com.kblab.repository.CartRepository;
import com.kblab.repository.OrderRepository;
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
	OrderRepository orderRepository;

	@Autowired
	TestCleanupService cleanupService;

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

	@AfterEach
	@Transactional
	void cleanup() {
		for (String email : testUserEmails) {
			cleanupService.cleanupTestUserByEmail(email);
		}
		testUserEmails.clear();
		// Clean up created orders
		for (Long orderId : createdOrderIds) {
			orderRepository.deleteById(orderId);
		}
		createdOrderIds.clear();

		// Clean up created carts
		for (Long cartId : createdCartIds) {
			cartRepository.deleteById(cartId);
		}
		createdCartIds.clear();
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
        assertNotNull(cartId);
		// Perform GET on the cart
		ResponseEntity<String> getCartResponse = restTemplate.getForEntity(baseUrl + "/api/cart/" + cartId, String.class);
		assertEquals(HttpStatus.OK, getCartResponse.getStatusCode());
	}

	@Test
	void testCreateAndFetchCart() throws Exception {
		// Create test cart and obtain the id
		ResponseEntity<String> postResponse = restTemplate.postForEntity(baseUrl + "/api/cart" ,null, String.class);
		assertEquals(HttpStatus.CREATED, postResponse.getStatusCode(), "Expected HTTP status OK for cart retrieval");
		JsonNode createdCartJsonNode = objectMapper.readTree(postResponse.getBody());

		String cartId = createdCartJsonNode.get("cartId").asText();
		assertNotNull(cartId, "Created Cart Id = " + cartId);


		// Update cart
		String newCartJSON = """
            [
                {
                    "name": "SIMPLE_ITEM_1",
                    "quantity": 3,
                    "price": 0
                },
                {
                    "name": "CUSTOM_SWITCH_TESTER",
                    "size": 10,
                    "keycaps": "TRANSPARENT",
                    "quantity": 1,
                    "price": 0,
                    "switches": [
                        { "id": 1, "quantity": 5 },
                        { "id": 2, "quantity": 5 }
                    ]
                }
            ]
            """;
		HttpEntity<String> postRequest = new HttpEntity<>(newCartJSON);
		ResponseEntity<String> updatePostResponse = restTemplate.postForEntity(baseUrl + "/api/cart/"+ cartId ,postRequest, String.class);
		assertEquals(HttpStatus.OK, updatePostResponse.getStatusCode(), "Expected HTTP status OK for cart retrieval");
		assertEquals("Cart updated successfully.",  updatePostResponse.getBody());

		// Step 3: GET the updated cart and validate the returned JSON structure
		ResponseEntity<String> updatedGetResponse = restTemplate.getForEntity(baseUrl + "/api/cart/" + cartId, String.class);
		assertEquals(HttpStatus.OK, updatedGetResponse.getStatusCode(), "Expected HTTP status OK for updated cart retrieval");

		String updatedItemsJson = updatedGetResponse.getBody();
		JsonNode updatedCartJsonNode = objectMapper.readTree(updatedItemsJson);

		// Validate that the updated JSON contains fields like "price" for each item
		assertTrue(updatedCartJsonNode.isArray(), "Expected an array of items in updated cart JSON");
		for (JsonNode itemNode : updatedCartJsonNode) {
			assertNotNull(itemNode.get("name"), "Item should contain 'name' field");
			assertNotNull(itemNode.get("quantity"), "Item should contain 'quantity' field");
			assertTrue(itemNode.get("quantity").asInt() > 0, "Quantity should be a positive integer");
			assertNotNull(itemNode.get("price"), "Item should contain 'price' field calculated by PriceService");
			assertTrue(itemNode.get("price").asDouble() > 0, "Price should be a positive number");
		}
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

