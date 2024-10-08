from functools import wraps
import uuid
from flask import Flask, request, jsonify, Blueprint, current_app, make_response
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import JSON, func
from sqlalchemy.exc import IntegrityError
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import jwt
from datetime import datetime, timedelta, timezone
import os
import logging
from sqlalchemy.orm.attributes import flag_modified
import stripe
from werkzeug.exceptions import BadRequest
from dotenv import load_dotenv
from sqlalchemy.dialects.postgresql import UUID

load_dotenv()  # This loads the variables from .env file


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173", "supports_credentials": True}})  # Enable CORS for all routes

# Use environment variables for database configuration
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_port = os.getenv('DB_PORT')
db_name = os.getenv('DB_NAME')

# Construct the database URI using the environment variables
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5001", "http://10.0.0.216:5173", "http://10.0.0.216:5173", "http://localhost:5173"], "methods": ["GET", "POST", "DELETE", "OPTIONS"], "supports_credentials": True}})

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
# endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

class Switch(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    available = db.Column(db.Integer, nullable=False)
    force = db.Column(db.String(50), nullable=True)
    image = db.Column(db.String(255), nullable=True)

    def __repr__(self):
        return f'<Switch {self.brand} {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'type': self.type,
            'available': self.available,
            'force': self.force,
            'image': self.image
        }

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password = db.Column(db.String(60), nullable=True)
    is_guest = db.Column(db.Boolean, default=False)

class Session(db.Model):
    __tablename__ = 'session'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(500), nullable=False)
    expiry = db.Column(db.DateTime(timezone=True), nullable=False)

    def __init__(self, user_id, token, expiry):
        self.user_id = user_id
        self.token = token
        self.expiry = expiry.replace(tzinfo=timezone.utc) if expiry.tzinfo is None else expiry

class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('user.id'), nullable=False)
    cart_data = db.Column(db.JSON, nullable=False, default=list)
    last_updated = db.Column(db.DateTime(timezone=True), nullable=False, default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'cart_data': self.cart_data,
            'last_updated': self.last_updated.isoformat()
        }

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    zipcode = db.Column(db.String(20), nullable=False)
    order_details = db.Column(JSON, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')
    total_amount = db.Column(db.Integer, nullable=False)  # in cents
    stripe_payment_intent_id = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'address': self.address,
            'city': self.city,
            'zipcode': self.zipcode,
            'order_details': self.order_details,
            'status': self.status,
            'total_amount': self.total_amount,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"message": "Email and password are required"}), 400
        
        user_id = data.get('user_id')
        user = User.query.get(user_id) if user_id else None

        if user and user.is_guest:
            user.email = data['email']
            user.password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
            user.is_guest = False
        elif User.query.filter_by(email=data['email']).first():
            return jsonify({"message": "Email already registered"}), 400
        else:
            hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
            user = User(email=data['email'], password=hashed_password)
            db.session.add(user)

        db.session.commit()
        token = generate_token(user.id)
        return jsonify({"message": "User registered successfully", "token": token}), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error during registration: {str(e)}")
        return jsonify({"message": "An error occurred during registration"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"message": "Email and password are required"}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            token = generate_token(user.id)
            expiry = datetime.now(timezone.utc) + timedelta(days=1)
            new_session = Session(user_id=user.id, token=token, expiry=expiry)
            db.session.add(new_session)
            db.session.commit()
            response = jsonify({"token": token, "user_id": user.id})
            return response, 200
        return jsonify({"message": "Invalid credentials"}), 401
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error during login: {str(e)}")
        return jsonify({"message": "An error occurred during login"}), 500

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"message": "Token is missing"}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({"message": "User not found"}), 401
            # For guest users, we don't need to check for a valid session
            if current_user.email:  # This is a registered user
                session = Session.query.filter_by(token=token, user_id=current_user.id).first()
                if not session:
                    return jsonify({"message": "No valid session found"}), 401
                if session.expiry < datetime.now(timezone.utc):
                    return jsonify({"message": "Token has expired"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def generate_token(user_id):
    payload = {
        'user_id': str(user_id),
        'exp': datetime.now(timezone.utc) + timedelta(days=1)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')


@app.route('/protected', methods=['GET'])
@token_required
def protected(current_user):
    return jsonify({"message": f"Hello, {current_user.email}!"}), 200


@app.route('/switches', methods=['GET'])
def get_switches():
    switches = Switch.query.all()
    return jsonify([switch.to_dict() for switch in switches])

@app.route('/purchase', methods=['POST'])
def purchase_switches():
    switches_to_purchase = request.json
    
    if not switches_to_purchase:
        return jsonify({"error": "No switches provided"}), 400

    try:
        for switch_name, quantity in switches_to_purchase.items():
            switch = Switch.query.filter_by(name=switch_name).first()
            
            if not switch:
                return jsonify({"error": f"Switch {switch_name} not found"}), 404
            
            if switch.available < quantity:
                return jsonify({"error": f"Not enough {switch_name} switches. Available: {switch.available}"}), 400
            
            switch.available -= quantity

        db.session.commit()
        return jsonify({"message": "Purchase successful"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/cart/add', methods=['POST'])
@token_required
def add_item_to_cart(current_user):
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required_fields = ['name', 'size', 'keycaps', 'switches']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

    if not isinstance(data['switches'], list):
        return jsonify({'error': 'Invalid switches data: must be a list'}), 400

    # Validate switches
    total_switch_quantity = sum(switch.get('quantity', 0) for switch in data['switches'])
    if total_switch_quantity != data['size']:
        return jsonify({'error': f'Total switch quantity ({total_switch_quantity}) does not match the specified size ({data["size"]})'}), 400

    # Verify that all switches exist in the database
    switch_ids = [switch['id'] for switch in data['switches']]
    existing_switches = Switch.query.filter(Switch.id.in_(switch_ids)).all()
    if len(existing_switches) != len(switch_ids):
        return jsonify({'error': 'One or more switches do not exist in the database'}), 400

    cart = Cart.query.filter_by(user_id=current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id, cart_data=[])
        db.session.add(cart)
    
    if cart.cart_data is None:
        cart.cart_data = []

    # Calculate price based on size and keycaps
    price = calculate_price(data['size'], data['keycaps'])

    # Check if the same item already exists in the cart
    existing_item = next((item for item in cart.cart_data if 
                          item['name'] == data['name'] and
                          item['size'] == data['size'] and
                          item['keycaps'] == data['keycaps'] and
                          item['switches'] == data['switches']), None)

    if existing_item:
        existing_item['quantity'] += 1
    else:
        new_item = {
            'id': str(uuid.uuid4()),
            'name': data['name'],
            'size': data['size'],
            'keycaps': data['keycaps'],
            'switches': data['switches'],
            'price': price,
            'quantity': 1
        }
        cart.cart_data.append(new_item)
    
    flag_modified(cart, "cart_data")
    
    try:
        db.session.commit()
        return jsonify({'message': 'Item added to cart', 'cart_count': len(cart.cart_data)}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to add item to cart: {str(e)}'}), 500

def calculate_price(size, keycaps):
    switch_prices = {
        10: 9.99,
        15: 13.99,
        20: 17.99,
    }
    keycap_prices = {
        'none': 0,
        'random': 0.1,
        'transparent': 0.2,
    }
    
    base_switch_price = switch_prices.get(size, 0)
    keycap_price = keycap_prices.get(keycaps, 0) * size
    total_price = base_switch_price + keycap_price
    
    return round(total_price, 2)

@app.route('/api/cart/remove/<string:item_id>', methods=['DELETE'])
@token_required
def remove_item_from_cart(current_user, item_id):
    try:
        cart = Cart.query.filter_by(user_id=current_user.id).first()
        if not cart or not cart.cart_data:
            return jsonify({'message': 'Cart is empty'}), 404

        # Find the item with the matching ID
        cart.cart_data = [item for item in cart.cart_data if item.get('id') != item_id]
        
        # Mark the cart_data as modified
        flag_modified(cart, "cart_data")
        
        db.session.commit()

        return jsonify({'message': 'Item removed from cart', 'cart_count': len(cart.cart_data)}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error removing item from cart: {str(e)}")
        return jsonify({'message': 'An error occurred while removing the item from the cart'}), 500

@app.route('/api/cart', methods=['GET'])
@token_required
def get_user_cart(current_user):
    cart = Cart.query.filter_by(user_id=current_user.id).first()
    if not cart or not cart.cart_data:
        return jsonify({'message': 'Cart is empty', 'cart_data': []}), 200
    
    # Fetch switch details for all switches in the cart
    switch_ids = set(item['id'] for tester in cart.cart_data for item in tester['switches'])
    switches = {switch.id: switch for switch in Switch.query.filter(Switch.id.in_(switch_ids))}
    
    # Update cart data with full switch names (brand + name)
    for tester in cart.cart_data:
        for item in tester['switches']:
            switch = switches.get(item['id'])
            if switch:
                item['name'] = f"{switch.brand} {switch.name}"
    
    return jsonify({'cart_data': cart.cart_data, 'cart_count': len(cart.cart_data)}), 200

@app.route('/api/cart/count', methods=['GET'])
@token_required
def get_user_cart_count(current_user):
    cart = Cart.query.filter_by(user_id=current_user.id).first()
    count = len(cart.cart_data) if cart and cart.cart_data else 0
    return jsonify({'cart_count': count}), 200

@app.route('/create-payment-intent', methods=['POST'])
@token_required
def create_payment_intent(current_user):
    try:
        data = request.json
        cart_data = data.get('cart_data')
        
        # Calculate the total amount
        total_amount = sum(item['price'] * item['quantity'] for item in cart_data)
        
        # Create a new order
        order = Order(
            user_id=current_user.id,
            email=data['email'],
            name=data['name'],
            address=data['address'],
            city=data['city'],
            zipcode=data['zipcode'],
            order_details=cart_data,
            total_amount=total_amount
        )
        db.session.add(order)
        db.session.commit()

        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            amount=total_amount,
            currency='usd',
            metadata={'order_id': order.id}
        )
        
        # Update the order with the PaymentIntent ID
        order.stripe_payment_intent_id = intent.id
        db.session.commit()

        return jsonify({
            'clientSecret': intent.client_secret,
            'publishableKey': os.getenv('STRIPE_PUBLISHABLE_KEY')
        })

    except Exception as e:
        return jsonify(error=str(e)), 400

@app.route('/webhook', methods=['POST'])
def webhook():
    event = None
    payload = request.data
    sig_header = request.headers['STRIPE_SIGNATURE']

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        raise BadRequest('Invalid payload')
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise BadRequest('Invalid signature')

    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        order_id = payment_intent['metadata']['order_id']
        
        # Update the order status
        order = Order.query.get(order_id)
        if order:
            order.status = 'paid'
            db.session.commit()
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        order_id = payment_intent['metadata']['order_id']
        
        # Update the order status
        order = Order.query.get(order_id)
        if order:
            order.status = 'failed'
            db.session.commit()

    # Add more event types as needed

    return jsonify(success=True)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello, World!'}), 200

@app.route('/create-guest-user', methods=['POST'])
def create_guest_user():
    new_user = User(is_guest=True)
    db.session.add(new_user)
    db.session.commit()
    token = generate_token(new_user.id)
    return jsonify({"user_id": new_user.id, "token": token}), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5001, debug=True)

